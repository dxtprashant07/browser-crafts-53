/// <reference lib="webworker" />
import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFDict,
  PDFNumber,
  PDFRawStream,
  PDFString,
  PDFHexString,
  PDFRef,
  PDFContext,
} from "pdf-lib";
import encodeJpeg from "@jsquash/jpeg/encode";
import resizeImageData from "@jsquash/resize";

export type CompressLevel = "light" | "balanced" | "strong";

export interface PdfJob {
  id: number;
  op: "merge" | "split" | "compress";
  files: ArrayBuffer[];
  // split
  mode?: "range" | "every" | "evenodd";
  range?: string;
  evenOdd?: "even" | "odd";
  // compress
  level?: CompressLevel;
}

export interface PdfPart {
  name: string;
  bytes: ArrayBuffer;
}

export interface PdfResult {
  id: number;
  ok: boolean;
  parts?: PdfPart[];
  error?: string;
  imagesRecompressed?: number;
}

function parseRange(range: string, max: number): number[] {
  const out = new Set<number>();
  for (const chunk of range.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((x) => parseInt(x.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) if (i >= 1 && i <= max) out.add(i - 1);
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= max) out.add(n - 1);
    }
  }
  return [...out].sort((a, b) => a - b);
}

async function toBytes(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: true });
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

const COMPRESS_SETTINGS: Record<CompressLevel, { quality: number; maxDim: number }> = {
  light: { quality: 85, maxDim: 2200 },
  balanced: { quality: 70, maxDim: 1800 },
  strong: { quality: 50, maxDim: 1200 },
};

// ---- lightweight stream-filter decoders (only what's needed to reach raw image bytes) ----

function decodeAscii85(bytes: Uint8Array): Uint8Array {
  let str = new TextDecoder("latin1").decode(bytes).trim();
  if (str.startsWith("<~")) str = str.slice(2);
  if (str.endsWith("~>")) str = str.slice(0, -2);
  const out: number[] = [];
  let tuple: number[] = [];
  for (const ch of str) {
    if (/\s/.test(ch)) continue;
    if (ch === "z" && tuple.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    tuple.push(ch.charCodeAt(0) - 33);
    if (tuple.length === 5) {
      let n = 0;
      for (const t of tuple) n = n * 85 + t;
      out.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
      tuple = [];
    }
  }
  if (tuple.length > 0) {
    const count = tuple.length;
    while (tuple.length < 5) tuple.push(84);
    let n = 0;
    for (const t of tuple) n = n * 85 + t;
    const last = [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
    out.push(...last.slice(0, count - 1));
  }
  return new Uint8Array(out);
}

function decodeAsciiHex(bytes: Uint8Array): Uint8Array {
  let str = new TextDecoder("latin1").decode(bytes).replace(/\s/g, "");
  if (str.endsWith(">")) str = str.slice(0, -1);
  if (str.length % 2 === 1) str += "0";
  const out = new Uint8Array(str.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(str.substr(i * 2, 2), 16);
  return out;
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Reverses PNG-style row predictors (Predictor >= 10), the encoding Acrobat/most
// PDF writers apply to FlateDecode raster images.
function undoPngPredictor(data: Uint8Array, columns: number, components: number): Uint8Array {
  const bpp = Math.max(1, components);
  const rowBytes = columns * components;
  const rows = Math.floor(data.length / (rowBytes + 1));
  const out = new Uint8Array(rows * rowBytes);
  let prevRow = new Uint8Array(rowBytes);
  let pos = 0;
  for (let r = 0; r < rows; r++) {
    const filterType = data[pos++];
    const row = data.subarray(pos, pos + rowBytes);
    pos += rowBytes;
    const outRow = out.subarray(r * rowBytes, r * rowBytes + rowBytes);
    for (let i = 0; i < rowBytes; i++) {
      const a = i >= bpp ? outRow[i - bpp] : 0;
      const b = prevRow[i];
      const c = i >= bpp ? prevRow[i - bpp] : 0;
      const raw = row[i];
      let value: number;
      switch (filterType) {
        case 1:
          value = raw + a;
          break;
        case 2:
          value = raw + b;
          break;
        case 3:
          value = raw + ((a + b) >> 1);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          value = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          value = raw;
      }
      outRow[i] = value & 0xff;
    }
    prevRow = outRow;
  }
  return out;
}

type ColorSpaceInfo =
  | { kind: "rgb" }
  | { kind: "gray" }
  | { kind: "indexed"; base: "rgb" | "gray"; palette: Uint8Array };

function resolveColorSpace(context: PDFContext, csObj: unknown, depth = 0): ColorSpaceInfo | null {
  if (depth > 4) return null;
  const resolved = csObj instanceof PDFRef ? context.lookup(csObj) : csObj;
  if (resolved instanceof PDFName) {
    const name = resolved.asString();
    if (name === "/DeviceRGB" || name === "/CalRGB") return { kind: "rgb" };
    if (name === "/DeviceGray" || name === "/CalGray") return { kind: "gray" };
    return null;
  }
  if (resolved instanceof PDFArray) {
    const head = resolved.size() > 0 ? resolved.lookup(0, PDFName).asString() : "";
    if (head === "/CalRGB" || head === "/Lab") return { kind: "rgb" };
    if (head === "/CalGray") return { kind: "gray" };
    if (head === "/ICCBased") {
      const stream = resolved.lookup(1);
      const n = stream instanceof PDFRawStream
        ? stream.dict.lookupMaybe(PDFName.of("N"), PDFNumber)?.asNumber()
        : undefined;
      if (n === 3) return { kind: "rgb" };
      if (n === 1) return { kind: "gray" };
      return null; // N=4 (CMYK) unsupported — skip rather than mis-convert colors
    }
    if (head === "/Indexed" && resolved.size() >= 4) {
      const base = resolveColorSpace(context, resolved.get(1), depth + 1);
      if (!base || base.kind === "indexed") return null;
      const rawLookup = resolved.get(3);
      const lookupObj: unknown = rawLookup instanceof PDFRef ? context.lookup(rawLookup) : rawLookup;
      let palette: Uint8Array | null = null;
      if (lookupObj instanceof PDFString || lookupObj instanceof PDFHexString) {
        palette = lookupObj.asBytes();
      } else if (lookupObj instanceof PDFRawStream) {
        const filter = lookupObj.dict.lookupMaybe(PDFName.of("Filter"), PDFName)?.asString();
        palette = filter === "/FlateDecode" ? null : lookupObj.contents;
      }
      if (!palette) return null;
      return { kind: "indexed", base: base.kind, palette };
    }
    return null;
  }
  return null;
}

function buildImageData(raw: Uint8Array, width: number, height: number, cs: ColorSpaceInfo): ImageData | null {
  const out = new Uint8ClampedArray(width * height * 4);
  if (cs.kind === "rgb") {
    if (raw.length < width * height * 3) return null;
    for (let i = 0, j = 0; i < width * height; i++, j += 3) {
      out[i * 4] = raw[j];
      out[i * 4 + 1] = raw[j + 1];
      out[i * 4 + 2] = raw[j + 2];
      out[i * 4 + 3] = 255;
    }
  } else if (cs.kind === "gray") {
    if (raw.length < width * height) return null;
    for (let i = 0; i < width * height; i++) {
      const g = raw[i];
      out[i * 4] = g;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = g;
      out[i * 4 + 3] = 255;
    }
  } else {
    if (raw.length < width * height) return null;
    const stride = cs.base === "rgb" ? 3 : 1;
    for (let i = 0; i < width * height; i++) {
      const p = raw[i] * stride;
      if (cs.base === "rgb") {
        out[i * 4] = cs.palette[p] ?? 0;
        out[i * 4 + 1] = cs.palette[p + 1] ?? 0;
        out[i * 4 + 2] = cs.palette[p + 2] ?? 0;
      } else {
        const g = cs.palette[p] ?? 0;
        out[i * 4] = g;
        out[i * 4 + 1] = g;
        out[i * 4 + 2] = g;
      }
      out[i * 4 + 3] = 255;
    }
  }
  return new ImageData(out, width, height);
}

function filterNames(dict: PDFDict): string[] {
  const entry = dict.get(PDFName.of("Filter"));
  if (entry instanceof PDFArray) return entry.asArray().map((f) => f.toString());
  if (entry) return [entry.toString()];
  return [];
}

// Decodes a PDF image XObject to raw pixels. Only handles the cases we can
// reconstruct with confidence — a plain (optionally ASCII-wrapped) DCTDecode
// JPEG, or an uncompressed FlateDecode raster with a color space we
// recognize. Anything else (JPEG2000, CCITT fax, DeviceN/Separation,
// non-8-bit samples, TIFF predictor) returns null and is left untouched.
async function decodeImageXObject(
  context: PDFContext,
  dict: PDFDict,
  contents: Uint8Array,
): Promise<ImageData | null> {
  const filters = filterNames(dict);
  if (filters.length === 0) return null;
  const last = filters[filters.length - 1];

  if (last === "/DCTDecode") {
    let data = contents;
    for (let i = 0; i < filters.length - 1; i++) {
      if (filters[i] === "/ASCII85Decode") data = decodeAscii85(data);
      else if (filters[i] === "/ASCIIHexDecode") data = decodeAsciiHex(data);
      else return null;
    }
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(data)], { type: "image/jpeg" }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    bitmap.close();
    return imageData;
  }

  if (filters.length === 1 && last === "/FlateDecode") {
    const width = dict.lookupMaybe(PDFName.of("Width"), PDFNumber)?.asNumber();
    const height = dict.lookupMaybe(PDFName.of("Height"), PDFNumber)?.asNumber();
    const bpc = dict.lookupMaybe(PDFName.of("BitsPerComponent"), PDFNumber)?.asNumber() ?? 8;
    if (!width || !height || bpc !== 8) return null;

    const csObj = dict.get(PDFName.of("ColorSpace"));
    if (!csObj) return null;
    const cs = resolveColorSpace(context, csObj);
    if (!cs) return null;

    let raw = await inflate(contents);

    const decodeParms = dict.lookupMaybe(PDFName.of("DecodeParms"), PDFDict)
      ?? dict.lookupMaybe(PDFName.of("DP"), PDFDict);
    const predictor = decodeParms?.lookupMaybe(PDFName.of("Predictor"), PDFNumber)?.asNumber() ?? 1;
    if (predictor >= 10) {
      raw = undoPngPredictor(raw, width, cs.kind === "rgb" ? 3 : 1);
    } else if (predictor !== 1) {
      return null; // TIFF predictor — rare, not worth the risk
    }

    return buildImageData(raw, width, height, cs);
  }

  return null;
}

// Recompresses embedded raster images (the dominant source of PDF bloat) as
// JPEG in place. The base image's dict is cloned so extras like an /SMask
// (alpha) reference, which point at their own untouched objects, keep working.
async function recompressImages(doc: PDFDocument, level: CompressLevel): Promise<number> {
  const { quality, maxDim } = COMPRESS_SETTINGS[level];
  let changed = 0;

  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;

    const subtype = dict.lookupMaybe(PDFName.of("Subtype"), PDFName);
    if (!subtype || subtype.asString() !== "/Image") continue;

    try {
      let imageData = await decodeImageXObject(doc.context, dict, obj.contents);
      if (!imageData) continue;

      let w = imageData.width;
      let h = imageData.height;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      if (scale < 1) {
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        imageData = await resizeImageData(imageData, { width: w, height: h, method: "lanczos3" });
      }

      const encoded = await encodeJpeg(imageData, { quality });
      if (encoded.byteLength >= obj.contents.byteLength) continue; // never make it bigger

      const newDict = dict.clone(doc.context);
      newDict.set(PDFName.of("Width"), doc.context.obj(w));
      newDict.set(PDFName.of("Height"), doc.context.obj(h));
      newDict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      newDict.set(PDFName.of("BitsPerComponent"), doc.context.obj(8));
      newDict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      newDict.delete(PDFName.of("DecodeParms"));
      newDict.delete(PDFName.of("DP"));
      newDict.delete(PDFName.of("Decode"));

      doc.context.assign(ref, PDFRawStream.of(newDict, new Uint8Array(encoded)));
      changed++;
    } catch {
      // Skip images we can't safely decode/re-encode.
    }
  }

  return changed;
}

self.onmessage = async (e: MessageEvent<PdfJob>) => {
  const job = e.data;
  try {
    let parts: PdfPart[] = [];
    let imagesRecompressed: number | undefined;
    if (job.op === "merge") {
      const out = await PDFDocument.create();
      for (const buf of job.files) {
        const src = await PDFDocument.load(buf);
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      parts = [{ name: "merged.pdf", bytes: toArrayBuffer(await toBytes(out)) }];
    } else if (job.op === "compress") {
      const original = job.files[0];
      const src = await PDFDocument.load(original);
      imagesRecompressed = await recompressImages(src, job.level ?? "balanced");
      const bytes = await toBytes(src);
      // Guarantee we never hand back something larger than what came in.
      const out = bytes.byteLength < original.byteLength ? bytes : new Uint8Array(original);
      parts = [{ name: "compressed.pdf", bytes: toArrayBuffer(out) }];
    } else if (job.op === "split") {
      const src = await PDFDocument.load(job.files[0]);
      const total = src.getPageCount();
      if (job.mode === "every") {
        for (let i = 0; i < total; i++) {
          const doc = await PDFDocument.create();
          const [pg] = await doc.copyPages(src, [i]);
          doc.addPage(pg);
          parts.push({ name: `page-${i + 1}.pdf`, bytes: toArrayBuffer(await toBytes(doc)) });
        }
      } else if (job.mode === "evenodd") {
        const wantEven = job.evenOdd === "even";
        const idx: number[] = [];
        for (let i = 0; i < total; i++) {
          const humanEven = (i + 1) % 2 === 0;
          if (humanEven === wantEven) idx.push(i);
        }
        const doc = await PDFDocument.create();
        const pgs = await doc.copyPages(src, idx);
        pgs.forEach((p) => doc.addPage(p));
        parts.push({ name: `${job.evenOdd}-pages.pdf`, bytes: toArrayBuffer(await toBytes(doc)) });
      } else {
        const idx = parseRange(job.range ?? "", total);
        if (idx.length === 0) throw new Error("No valid pages in that range.");
        const doc = await PDFDocument.create();
        const pgs = await doc.copyPages(src, idx);
        pgs.forEach((p) => doc.addPage(p));
        parts.push({ name: "extracted.pdf", bytes: toArrayBuffer(await toBytes(doc)) });
      }
    }
    (self as unknown as Worker).postMessage({ id: job.id, ok: true, parts, imagesRecompressed } as PdfResult);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id: job.id,
      ok: false,
      error: err instanceof Error ? err.message : "PDF operation failed",
    } as PdfResult);
  }
};
