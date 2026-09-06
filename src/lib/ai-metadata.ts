// Reads the metadata blocks an AI image generator leaves behind (PNG text
// chunks, JPEG APP segments, WebP EXIF/XMP chunks), guesses which model wrote
// them, and rebuilds the file without those blocks. Pixels are copied byte for
// byte — nothing is re-encoded, so stripping is lossless.

export type ImageFormat = "png" | "jpeg" | "webp";
export type Confidence = "high" | "medium" | "low";

export interface MetaEntry {
  key: string;
  value: string;
}

export interface Detection {
  name: string;
  confidence: Confidence;
  evidence: string;
}

export interface Scan {
  format: ImageFormat;
  entries: MetaEntry[];
  cleaned: Blob;
  originalSize: number;
  cleanedSize: number;
  detection: Detection | null;
}

const utf8 = new TextDecoder("utf-8");

function latin1(b: Uint8Array, start: number, len: number): string {
  let s = "";
  for (let i = start; i < start + len; i++) s += String.fromCharCode(b[i]);
  return s;
}

// Pulls readable ASCII runs out of a binary block (EXIF, IPTC, C2PA/JUMBF).
// Good enough to match generator names without a full EXIF parser.
function asciiRuns(b: Uint8Array, min = 4): string {
  const out: string[] = [];
  let run = "";
  for (let i = 0; i < b.length; i++) {
    const c = b[i];
    if (c >= 0x20 && c <= 0x7e) run += String.fromCharCode(c);
    else {
      if (run.length >= min) out.push(run);
      run = "";
    }
  }
  if (run.length >= min) out.push(run);
  return out.join(" ");
}

async function inflate(b: Uint8Array): Promise<string> {
  try {
    const stream = new Blob([b as BlobPart])
      .stream()
      .pipeThrough(new DecompressionStream("deflate"));
    return utf8.decode(new Uint8Array(await new Response(stream).arrayBuffer()));
  } catch {
    return "";
  }
}

/* ------------------------------- detection ------------------------------- */

// Ordered: the first rule that matches wins, so specific tools sit above the
// generic "something declared itself AI" fallbacks.
const RULES: { name: string; re: RegExp; confidence: Confidence }[] = [
  { name: "ComfyUI (Stable Diffusion)", re: /"class_type"|comfyui/i, confidence: "high" },
  { name: "NovelAI", re: /novelai/i, confidence: "high" },
  { name: "InvokeAI", re: /invokeai/i, confidence: "high" },
  { name: "Midjourney", re: /midjourney/i, confidence: "high" },
  { name: "DALL·E / OpenAI", re: /dall[·.\-\s]?e|openai/i, confidence: "high" },
  { name: "Adobe Firefly", re: /firefly/i, confidence: "high" },
  {
    name: "Google (Gemini / Imagen)",
    re: /synthid|made with google|google deepmind|\bimagen\b|\bgemini\b/i,
    confidence: "high",
  },
  { name: "Grok / xAI", re: /\bxai\b|\bgrok\b/i, confidence: "high" },
  { name: "FLUX (Black Forest Labs)", re: /black.?forest|\bflux\.?[12]?\b/i, confidence: "high" },
  { name: "Leonardo.Ai", re: /leonardo\.?ai/i, confidence: "high" },
  {
    name: "Microsoft Designer / Bing Image Creator",
    re: /bing image creator|microsoft designer/i,
    confidence: "high",
  },
  {
    name: "Stable Diffusion (WebUI)",
    re: /stable.?diffusion|sdxl|stability\.ai|steps:\s*\d+/i,
    confidence: "high",
  },
  {
    name: "AI-generated (declared in Content Credentials)",
    re: /trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia/,
    confidence: "high",
  },
  {
    name: "Unknown — signed with C2PA Content Credentials",
    re: /c2pa|jumbf|contentauth/i,
    confidence: "medium",
  },
];

// "Model: <name>" inside an AUTOMATIC1111 parameters block, and similar.
const MODEL_NAME = /(?:^|,|\s)Model:\s*([^\n,]{2,60})/i;

function detect(entries: MetaEntry[]): Detection | null {
  const hay = entries.map((e) => `${e.key} ${e.value}`).join("\n");
  if (!hay.trim()) return null;
  for (const rule of RULES) {
    const m = rule.re.exec(hay);
    if (!m) continue;
    const model = MODEL_NAME.exec(hay);
    const evidence = model ? `Model: ${model[1].trim()}` : `Matched "${m[0].slice(0, 60)}"`;
    return { name: rule.name, confidence: rule.confidence, evidence };
  }
  return null;
}

/* ---------------------------------- PNG ---------------------------------- */

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
// Everything else (IHDR, IDAT, palette, colour, APNG frames) is copied through.
const PNG_STRIP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME", "caBX"]);

async function pngTextEntries(type: string, data: Uint8Array): Promise<MetaEntry[]> {
  if (type === "eXIf") return [{ key: "EXIF", value: asciiRuns(data) }];
  if (type === "caBX") return [{ key: "C2PA Content Credentials", value: asciiRuns(data) }];
  if (type === "tIME") return [{ key: "Timestamp", value: asciiRuns(data, 2) }];

  const nul = data.indexOf(0);
  if (nul < 0) return [];
  const key = latin1(data, 0, nul);

  if (type === "tEXt") return [{ key, value: latin1(data, nul + 1, data.length - nul - 1) }];
  if (type === "zTXt") return [{ key, value: await inflate(data.subarray(nul + 2)) }];

  // iTXt: key \0 compressed(1) method(1) lang \0 translatedKey \0 text
  const compressed = data[nul + 1] === 1;
  const langEnd = data.indexOf(0, nul + 3);
  const transEnd = data.indexOf(0, langEnd + 1);
  if (langEnd < 0 || transEnd < 0) return [];
  const body = data.subarray(transEnd + 1);
  return [{ key, value: compressed ? await inflate(body) : utf8.decode(body) }];
}

async function scanPng(buf: Uint8Array): Promise<{ entries: MetaEntry[]; parts: Uint8Array[] }> {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const parts: Uint8Array[] = [buf.subarray(0, 8)];
  const entries: MetaEntry[] = [];
  let off = 8;
  while (off + 12 <= buf.length) {
    const len = view.getUint32(off);
    const type = latin1(buf, off + 4, 4);
    if (off + 12 + len > buf.length) break; // truncated file — stop, keep what we have
    if (PNG_STRIP.has(type))
      entries.push(...(await pngTextEntries(type, buf.subarray(off + 8, off + 8 + len))));
    else parts.push(buf.subarray(off, off + 12 + len));
    off += 12 + len;
    if (type === "IEND") break;
  }
  return { entries, parts };
}

/* ---------------------------------- JPEG --------------------------------- */

// APP0 (JFIF), APP2 (ICC colour profile) and APP14 (Adobe colour transform)
// are kept — dropping them changes how the image decodes.
const JPEG_STRIP: Record<number, string> = {
  0xe1: "EXIF / XMP",
  0xe3: "APP3",
  0xe4: "APP4",
  0xe5: "APP5",
  0xe6: "APP6",
  0xe7: "APP7",
  0xe8: "APP8",
  0xe9: "APP9",
  0xea: "APP10",
  0xeb: "C2PA Content Credentials",
  0xec: "APP12",
  0xed: "IPTC / Photoshop",
  0xef: "APP15",
  0xfe: "Comment",
};

const XMP_HEADER = "http://ns.adobe.com/xap/1.0/\0";

function jpegSegmentEntry(marker: number, data: Uint8Array): MetaEntry {
  const head = latin1(data, 0, Math.min(29, data.length));
  if (head.startsWith(XMP_HEADER)) {
    return { key: "XMP", value: utf8.decode(data.subarray(XMP_HEADER.length)) };
  }
  return { key: JPEG_STRIP[marker], value: asciiRuns(data) };
}

function scanJpeg(buf: Uint8Array): { entries: MetaEntry[]; parts: Uint8Array[] } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const parts: Uint8Array[] = [buf.subarray(0, 2)];
  const entries: MetaEntry[] = [];
  let off = 2;
  while (off + 4 <= buf.length) {
    if (buf[off] !== 0xff) break;
    const marker = buf[off + 1];
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      parts.push(buf.subarray(off, off + 2)); // standalone marker, no payload
      off += 2;
      continue;
    }
    if (marker === 0xda) {
      parts.push(buf.subarray(off)); // scan header + entropy-coded data to EOI
      break;
    }
    const end = off + 2 + view.getUint16(off + 2);
    if (end > buf.length) break;
    if (marker in JPEG_STRIP) entries.push(jpegSegmentEntry(marker, buf.subarray(off + 4, end)));
    else parts.push(buf.subarray(off, end));
    off = end;
  }
  return { entries, parts };
}

/* ---------------------------------- WebP --------------------------------- */

function scanWebp(buf: Uint8Array): { entries: MetaEntry[]; parts: Uint8Array[] } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const entries: MetaEntry[] = [];
  const chunks: Uint8Array[] = [];
  let off = 12;
  while (off + 8 <= buf.length) {
    const fourcc = latin1(buf, off, 4);
    const size = view.getUint32(off + 4, true);
    const padded = 8 + size + (size % 2);
    if (off + 8 + size > buf.length) break;
    const data = buf.subarray(off + 8, off + 8 + size);
    if (fourcc === "EXIF") entries.push({ key: "EXIF", value: asciiRuns(data) });
    else if (fourcc === "XMP ") entries.push({ key: "XMP", value: utf8.decode(data) });
    else {
      const chunk = buf.slice(off, off + padded);
      // VP8X advertises which optional chunks exist; clear the EXIF and XMP
      // flags or decoders go looking for chunks we just removed.
      if (fourcc === "VP8X") chunk[8] &= ~0x0c;
      chunks.push(chunk);
    }
    off += padded;
  }
  const body = chunks.reduce((n, c) => n + c.length, 0);
  const header = new Uint8Array(12);
  header.set(buf.subarray(0, 12));
  new DataView(header.buffer).setUint32(4, body + 4, true);
  return { entries, parts: [header, ...chunks] };
}

/* --------------------------------- public -------------------------------- */

function sniff(buf: Uint8Array): ImageFormat | null {
  if (PNG_SIG.every((b, i) => buf[i] === b)) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpeg";
  if (latin1(buf, 0, 4) === "RIFF" && latin1(buf, 8, 4) === "WEBP") return "webp";
  return null;
}

export async function scanImage(file: Blob): Promise<Scan> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const format = sniff(buf);
  if (!format) throw new Error("Only PNG, JPG, and WebP files can be cleaned losslessly.");

  const { entries, parts } =
    format === "png" ? await scanPng(buf) : format === "jpeg" ? scanJpeg(buf) : scanWebp(buf);

  const kept = entries.filter((e) => e.value.trim().length > 0);
  const cleaned = new Blob(parts as BlobPart[], { type: `image/${format}` });
  return {
    format,
    entries: kept,
    cleaned,
    originalSize: buf.length,
    cleanedSize: cleaned.size,
    detection: detect(kept),
  };
}
