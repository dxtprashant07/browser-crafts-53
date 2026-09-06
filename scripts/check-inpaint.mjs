// Self-check for src/lib/inpaint.ts — punches a hole in a known image and
// asserts the repaint reconstructs it and leaves everything else alone.
// Run: bun scripts/check-inpaint.mjs
import assert from "node:assert/strict";

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
}

const { inpaint } = await import("../src/lib/inpaint.ts");

const W = 64;
const H = 64;

// A horizontal ramp: every column has one value, so a correct repaint of a
// vertical stripe has an exact right answer to be measured against.
function ramp() {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4;
      data[p] = data[p + 1] = data[p + 2] = x * 4;
      data[p + 3] = 255;
    }
  }
  return new ImageData(data, W, H);
}

const original = ramp();

// Hole: a 6px vertical stripe, filled with magenta so any leftover shows up.
const damaged = ramp();
const mask = new Uint8Array(W * H);
for (let y = 8; y < H - 8; y++) {
  for (let x = 29; x < 35; x++) {
    const p = y * W + x;
    mask[p] = 1;
    damaged.data[p * 4] = 255;
    damaged.data[p * 4 + 1] = 0;
    damaged.data[p * 4 + 2] = 255;
  }
}

const fixed = inpaint(damaged, mask, 5);

// 1. The input is not mutated.
assert.equal(damaged.data[(20 * W + 31) * 4], 255, "input must be left alone");

// 2. Pixels outside the mask are byte-identical.
for (let p = 0; p < W * H; p++) {
  if (mask[p]) continue;
  for (let c = 0; c < 4; c++) {
    assert.equal(
      fixed.data[p * 4 + c],
      original.data[p * 4 + c],
      `pixel ${p} changed outside mask`,
    );
  }
}

// 3. The hole is reconstructed close to the ramp it was cut from.
let worst = 0;
let total = 0;
let count = 0;
for (let p = 0; p < W * H; p++) {
  if (!mask[p]) continue;
  const err = Math.abs(fixed.data[p * 4] - original.data[p * 4]);
  worst = Math.max(worst, err);
  total += err;
  count++;
}
const mean = total / count;
assert.ok(count > 0);
assert.ok(mean < 8, `mean error ${mean.toFixed(2)} too high — repaint is not reconstructing`);
assert.ok(worst < 32, `worst error ${worst} too high`);

// 4. No magenta survives anywhere.
for (let p = 0; p < W * H; p++) {
  const r = fixed.data[p * 4];
  const g = fixed.data[p * 4 + 1];
  const b = fixed.data[p * 4 + 2];
  assert.ok(!(r > 200 && g < 40 && b > 200), `unrepainted hole pixel at ${p}`);
}

// 5. An empty mask is a no-op, and a bad mask is rejected.
const untouched = inpaint(original, new Uint8Array(W * H), 5);
assert.deepEqual(untouched.data, original.data);
assert.throws(() => inpaint(original, new Uint8Array(10), 5), /Mask size/);

console.log(`inpaint: all checks passed (mean error ${mean.toFixed(2)}, worst ${worst})`);
