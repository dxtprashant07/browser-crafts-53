import type { ImageJob, ImageResult } from "@/workers/image.worker";
import type { PdfJob, PdfResult } from "@/workers/pdf.worker";

let imageWorker: Worker | null = null;
let pdfWorker: Worker | null = null;
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
