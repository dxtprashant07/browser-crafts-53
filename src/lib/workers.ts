import type { ImageJob, ImageResult } from "@/workers/image.worker";
import type { PdfJob, PdfResult } from "@/workers/pdf.worker";
import type { RegexJob, RegexResult } from "@/workers/regex.worker";

let imageWorker: Worker | null = null;
let pdfWorker: Worker | null = null;
let regexWorker: Worker | null = null;
let counter = 0;

function getImageWorker(): Worker {
  if (!imageWorker) {
    imageWorker = new Worker(new URL("../workers/image.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return imageWorker;
}

function getPdfWorker(): Worker {
  if (!pdfWorker) {
    pdfWorker = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return pdfWorker;
}

export function runImageJob(
  job: Omit<ImageJob, "id">,
  transfer: Transferable[],
): Promise<ImageResult> {
  const worker = getImageWorker();
  const id = ++counter;
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent<ImageResult>) => {
      if (e.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      if (e.data.ok) resolve(e.data);
      else reject(new Error(e.data.error ?? "Image processing failed"));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ ...job, id }, transfer);
  });
}

export function runPdfJob(job: Omit<PdfJob, "id">): Promise<PdfResult> {
  const worker = getPdfWorker();
  const id = ++counter;
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent<PdfResult>) => {
      if (e.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      if (e.data.ok) resolve(e.data);
      else reject(new Error(e.data.error ?? "PDF operation failed"));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ ...job, id }, job.files);
  });
}

function getRegexWorker(): Worker {
  if (!regexWorker) {
    regexWorker = new Worker(new URL("../workers/regex.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return regexWorker;
}

export class RegexTimeoutError extends Error {
  constructor() {
    super("Pattern took too long — likely catastrophic backtracking. Simplify it.");
    this.name = "RegexTimeoutError";
  }
}

// Runs a regex job in the worker. If it doesn't answer within timeoutMs the
// worker is terminated (killing the runaway pattern) and recreated for the next
// call, and the promise rejects with RegexTimeoutError. This is what keeps a
// catastrophic-backtracking pattern from freezing the tab.
export function runRegexJob(job: Omit<RegexJob, "id">, timeoutMs = 1500): Promise<RegexResult> {
  const worker = getRegexWorker();
  const id = ++counter;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.removeEventListener("message", onMessage);
      worker.terminate();
      regexWorker = null;
      reject(new RegexTimeoutError());
    }, timeoutMs);

    const onMessage = (e: MessageEvent<RegexResult>) => {
      if (e.data.id !== id) return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      if (e.data.ok) resolve(e.data);
      else reject(new Error(e.data.error ?? "Regex execution failed"));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ ...job, id });
  });
}
