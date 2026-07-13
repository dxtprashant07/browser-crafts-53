/// <reference lib="webworker" />
// Image processing worker: compress, resize, and convert.
// Encoding goes through WASM codecs (mozjpeg / cwebp / oxipng) instead of the
// browser's built-in canvas encoder — those produce meaningfully smaller
// files at the same visual quality. Resizing uses jsquash's Lanczos3 filter
// instead of canvas drawImage scaling, which avoids the softness/aliasing
// canvas scaling introduces on large downscales.
import encodeJpeg from "@jsquash/jpeg/encode";
import encodeWebp from "@jsquash/webp/encode";
import optimisePng from "@jsquash/oxipng/optimise";
import resizeImageData from "@jsquash/resize";

export interface ImageJob {
  id: number;
  op: "compress" | "resize" | "convert";
  bitmap: ImageBitmap;
  type: string; // output mime
  quality?: number; // 0..100
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

function bitmapToImageData(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

// Oxipng's `level` trades compression effort for ratio (0 fastest .. 6 smallest).
// Map the same 0-100 "quality" slider users already know onto that scale.
function pngLevelFromQuality(quality: number): number {
  if (quality >= 90) return 2;
  if (quality >= 60) return 4;
  return 6;
}

async function encodeImage(data: ImageData, type: string, quality: number): Promise<ArrayBuffer> {
  switch (type) {
    case "image/jpeg":
    case "image/jpg":
      return encodeJpeg(data, { quality });
    case "image/webp":
      return encodeWebp(data, { quality });
    case "image/png":
      return optimisePng(data, { level: pngLevelFromQuality(quality) });
    default:
      throw new Error(`Unsupported output format: ${type}`);
  }
}

self.onmessage = async (e: MessageEvent<ImageJob>) => {
  const job = e.data;
  try {
    let imageData = bitmapToImageData(job.bitmap);
    job.bitmap.close();
    let w = imageData.width;
    let h = imageData.height;

    if (job.width && job.height) {
      imageData = await resizeImageData(imageData, {
        width: job.width,
        height: job.height,
        method: "lanczos3",
      });
      w = job.width;
      h = job.height;
    }

    const quality = job.quality ?? 92;
    const buffer = await encodeImage(imageData, job.type, quality);
    const blob = new Blob([buffer], { type: job.type });
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
