/// <reference lib="webworker" />
import { PDFDocument } from "pdf-lib";

export interface PdfJob {
  id: number;
  op: "merge" | "split" | "compress";
  files: ArrayBuffer[];
  // split
  mode?: "range" | "every" | "evenodd";
  range?: string;
  evenOdd?: "even" | "odd";
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

async function toBytes(doc: PDFDocument): Promise<ArrayBuffer> {
  const u8 = await doc.save({ useObjectStreams: true });
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

self.onmessage = async (e: MessageEvent<PdfJob>) => {
  const job = e.data;
  try {
    let parts: PdfPart[] = [];
    if (job.op === "merge") {
      const out = await PDFDocument.create();
      for (const buf of job.files) {
        const src = await PDFDocument.load(buf);
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      parts = [{ name: "merged.pdf", bytes: await toBytes(out) }];
    } else if (job.op === "compress") {
      const src = await PDFDocument.load(job.files[0]);
      parts = [{ name: "compressed.pdf", bytes: await toBytes(src) }];
    } else if (job.op === "split") {
      const src = await PDFDocument.load(job.files[0]);
      const total = src.getPageCount();
      if (job.mode === "every") {
        for (let i = 0; i < total; i++) {
          const doc = await PDFDocument.create();
          const [pg] = await doc.copyPages(src, [i]);
          doc.addPage(pg);
          parts.push({ name: `page-${i + 1}.pdf`, bytes: await toBytes(doc) });
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
        parts.push({ name: `${job.evenOdd}-pages.pdf`, bytes: await toBytes(doc) });
      } else {
        const idx = parseRange(job.range ?? "", total);
        if (idx.length === 0) throw new Error("No valid pages in that range.");
        const doc = await PDFDocument.create();
        const pgs = await doc.copyPages(src, idx);
        pgs.forEach((p) => doc.addPage(p));
        parts.push({ name: "extracted.pdf", bytes: await toBytes(doc) });
      }
    }
    (self as unknown as Worker).postMessage({ id: job.id, ok: true, parts } as PdfResult);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id: job.id,
      ok: false,
      error: err instanceof Error ? err.message : "PDF operation failed",
    } as PdfResult);
  }
};
