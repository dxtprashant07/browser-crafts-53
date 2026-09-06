// Self-check for src/lib/ai-metadata.ts — builds synthetic files carrying a
// generator signature, then asserts the model is detected and the metadata is
// gone while the image data survives untouched.
// Run: node scripts/check-ai-metadata.mjs
import assert from "node:assert/strict";
import { crc32 } from "node:zlib";

const { scanImage } = await import("../src/lib/ai-metadata.ts");

const enc = new TextEncoder();

function u32(n) {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

function concat(parts) {
  return Buffer.concat(parts.map((p) => Buffer.from(p)));
}

function pngChunk(type, data) {
  const body = concat([enc.encode(type), data]);
  return concat([u32(data.length), body, u32(crc32(body) >>> 0)]);
}

/* ---- PNG with an AUTOMATIC1111 "parameters" block ---- */
const PARAMS = "a cat, Steps: 30, Sampler: DPM++ 2M, Model: sd_xl_base_1.0";
const png = concat([
  new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  pngChunk("IHDR", new Uint8Array(13)),
  pngChunk("tEXt", concat([enc.encode("parameters"), new Uint8Array([0]), enc.encode(PARAMS)])),
  pngChunk("IDAT", enc.encode("PIXELDATA")),
  pngChunk("IEND", new Uint8Array(0)),
]);

const pngScan = await scanImage(new Blob([png]));
assert.equal(pngScan.format, "png");
assert.equal(pngScan.detection?.name, "Stable Diffusion (WebUI)");
assert.equal(pngScan.detection?.evidence, "Model: sd_xl_base_1.0");
assert.equal(pngScan.entries[0].value, PARAMS);

const cleanedPng = Buffer.from(await pngScan.cleaned.arrayBuffer());
assert.ok(!cleanedPng.includes("parameters"), "tEXt chunk must be gone");
assert.ok(cleanedPng.includes("PIXELDATA"), "IDAT must survive");
assert.ok(cleanedPng.includes("IEND"), "IEND must survive");
assert.ok(cleanedPng.length < png.length);

/* ---- an image with no metadata must not be accused of anything ---- */
const bare = concat([
  new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  pngChunk("IHDR", new Uint8Array(13)),
  pngChunk("IDAT", enc.encode("PIXELDATA")),
  pngChunk("IEND", new Uint8Array(0)),
]);
const bareScan = await scanImage(new Blob([bare]));
assert.equal(bareScan.detection, null);
assert.equal(bareScan.entries.length, 0);
assert.equal(bareScan.cleanedSize, bare.length, "a clean file must round-trip byte-identical");

/* ---- JPEG: strip XMP (APP1), keep the ICC profile (APP2) and scan data ---- */
function jpegSegment(marker, payload) {
  return concat([new Uint8Array([0xff, marker]), u32(payload.length + 2).slice(2), payload]);
}
const XMP = enc.encode(
  "http://ns.adobe.com/xap/1.0/\0<x:xmpmeta><dc:creator>Midjourney</dc:creator></x:xmpmeta>",
);
const jpeg = concat([
  new Uint8Array([0xff, 0xd8]),
  jpegSegment(0xe1, XMP),
  jpegSegment(0xe2, enc.encode("ICC_PROFILE\0keepme")),
  new Uint8Array([0xff, 0xda]),
  enc.encode("SCANDATA"),
  new Uint8Array([0xff, 0xd9]),
]);

const jpegScan = await scanImage(new Blob([jpeg]));
assert.equal(jpegScan.format, "jpeg");
assert.equal(jpegScan.detection?.name, "Midjourney");
assert.equal(jpegScan.entries[0].key, "XMP");

const cleanedJpeg = Buffer.from(await jpegScan.cleaned.arrayBuffer());
assert.ok(!cleanedJpeg.includes("Midjourney"), "XMP must be gone");
assert.ok(cleanedJpeg.includes("keepme"), "ICC profile must survive");
assert.ok(cleanedJpeg.includes("SCANDATA"), "entropy-coded data must survive");

/* ---- WebP: strip the XMP chunk and clear the VP8X flag advertising it ---- */
function webpChunk(fourcc, data) {
  const size = new Uint8Array(4);
  new DataView(size.buffer).setUint32(0, data.length, true);
  const pad = data.length % 2 ? [new Uint8Array(1)] : [];
  return concat([enc.encode(fourcc), size, data, ...pad]);
}
const vp8x = new Uint8Array(10);
vp8x[0] = 0x0c; // EXIF + XMP flags set
const body = concat([
  enc.encode("WEBP"),
  webpChunk("VP8X", vp8x),
  webpChunk("VP8 ", enc.encode("PIXELS")),
  webpChunk("XMP ", enc.encode("<x:xmpmeta>NovelAI</x:xmpmeta>")),
]);
const webp = concat([
  enc.encode("RIFF"),
  (() => {
    const s = new Uint8Array(4);
    new DataView(s.buffer).setUint32(0, body.length, true);
    return s;
  })(),
  body,
]);

const webpScan = await scanImage(new Blob([webp]));
assert.equal(webpScan.format, "webp");
assert.equal(webpScan.detection?.name, "NovelAI");

const cleanedWebp = Buffer.from(await webpScan.cleaned.arrayBuffer());
assert.ok(!cleanedWebp.includes("NovelAI"), "XMP chunk must be gone");
assert.ok(cleanedWebp.includes("PIXELS"), "image data must survive");
assert.equal(cleanedWebp.readUInt32LE(4), cleanedWebp.length - 8, "RIFF size must be rewritten");
assert.equal(cleanedWebp[20], 0x00, "VP8X EXIF/XMP flags must be cleared");

/* ---- unsupported format ---- */
await assert.rejects(() => scanImage(new Blob([enc.encode("GIF89a...")])), /PNG, JPG, and WebP/);

console.log("ai-metadata: all checks passed");
