/// <reference lib="webworker" />
// Image processing worker: compress, resize, and convert using OffscreenCanvas.

export interface ImageJob {
  id: number;
  op: "compress" | "resize" | "convert";
  bitmap: ImageBitmap;
  type: string; // output mime
  quality?: number; // 0..1
  width?: number;
  height?: number;
}

export interface ImageResult {
  id: number;
  ok: boolean;
  blob?: Blob;
  width?: number;
  height?: number;
  error?: string;
}

self.onmessage = async (e: MessageEvent<ImageJob>) => {
  const job = e.data;
  try {
    let w = job.bitmap.width;
    let h = job.bitmap.height;
    if (job.op === "resize" && job.width && job.height) {
      w = job.width;
      h = job.height;
    }
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(job.bitmap, 0, 0, w, h);
    const blob = await canvas.convertToBlob({
      type: job.type,
      quality: job.quality,
    });
    const res: ImageResult = { id: job.id, ok: true, blob, width: w, height: h };
    (self as unknown as Worker).postMessage(res);
  } catch (err) {
    const res: ImageResult = {
      id: job.id,
      ok: false,
      error: err instanceof Error ? err.message : "Processing failed",
    };
    (self as unknown as Worker).postMessage(res);
  }
};
