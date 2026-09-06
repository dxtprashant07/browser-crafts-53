// Telea inpainting (A. Telea, 2004 — "An Image Inpainting Technique Based on
// the Fast Marching Method"), the same algorithm OpenCV ships as INPAINT_TELEA.
//
// Pixels under the mask are erased and refilled by marching inward from the
// hole boundary: each unknown pixel is estimated from its already-known
// neighbours, weighted by distance, by how close they sit to the boundary, and
// by how well they line up with the direction the front is travelling. That
// last term is what carries edges into the hole instead of smearing them.
//
// Strongest option that fits in a browser with no model download. Its ceiling:
// it propagates structure, not texture, so a large patch over busy detail comes
// back smooth. Thin marks — logo text, date stamps, captions — it does well.

const KNOWN = 0;
const BAND = 1;
const INSIDE = 2;
const INF = 1e6;

// Min-heap over pixel indices keyed by arrival time T.
class Heap {
  private idx: number[] = [];
  private key: number[] = [];

  get size(): number {
    return this.idx.length;
  }

  push(t: number, i: number): void {
    this.idx.push(i);
    this.key.push(t);
    let c = this.idx.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (this.key[p] <= this.key[c]) break;
      this.swap(p, c);
      c = p;
    }
  }

  pop(): number {
    const top = this.idx[0];
    const i = this.idx.pop()!;
    const k = this.key.pop()!;
    if (this.idx.length) {
      this.idx[0] = i;
      this.key[0] = k;
      let p = 0;
      for (;;) {
        const l = 2 * p + 1;
        const r = l + 1;
        let m = p;
        if (l < this.idx.length && this.key[l] < this.key[m]) m = l;
        if (r < this.idx.length && this.key[r] < this.key[m]) m = r;
        if (m === p) break;
        this.swap(p, m);
        p = m;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    const i = this.idx[a];
    this.idx[a] = this.idx[b];
    this.idx[b] = i;
    const k = this.key[a];
    this.key[a] = this.key[b];
    this.key[b] = k;
  }
}

// Eikonal solver: arrival time at a pixel given two orthogonal neighbours.
function solve(
  i1: number,
  j1: number,
  i2: number,
  j2: number,
  w: number,
  h: number,
  flags: Uint8Array,
  T: Float32Array,
): number {
  if (i1 < 0 || i1 >= h || j1 < 0 || j1 >= w || i2 < 0 || i2 >= h || j2 < 0 || j2 >= w) return INF;
  const p1 = i1 * w + j1;
  const p2 = i2 * w + j2;
  const t1 = T[p1];
  const t2 = T[p2];
  const known1 = flags[p1] !== INSIDE;
  const known2 = flags[p2] !== INSIDE;

  if (known1 && known2) {
    const diff = t1 - t2;
    if (Math.abs(diff) >= 1) return 1 + Math.min(t1, t2);
    return (t1 + t2 + Math.sqrt(2 - diff * diff)) * 0.5;
  }
  if (known1) return 1 + t1;
  if (known2) return 1 + t2;
  return INF;
}

/**
 * Fills every pixel where `mask` is non-zero using the surrounding image.
 * `mask` is one byte per pixel, row-major, matching the image dimensions.
 * `radius` is how far (in pixels) each estimate looks for known colour.
 * Returns new ImageData; the input is left alone.
 */
export function inpaint(img: ImageData, mask: Uint8Array, radius = 5): ImageData {
  const w = img.width;
  const h = img.height;
  const n = w * h;
  if (mask.length !== n) throw new Error("Mask size does not match the image.");

  const out = new ImageData(new Uint8ClampedArray(img.data), w, h);
  const px = out.data;
  const flags = new Uint8Array(n);
  const T = new Float32Array(n);

  for (let p = 0; p < n; p++) {
    if (mask[p]) {
      flags[p] = INSIDE;
      T[p] = INF;
    }
  }

  // The starting band is the ring of known pixels touching the hole: the front
  // marches inward from there, so those are the pixels with arrival time zero.
  const heap = new Heap();
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      const p = i * w + j;
      if (flags[p] !== KNOWN) continue;
      const touchesHole =
        (i > 0 && flags[p - w] === INSIDE) ||
        (i < h - 1 && flags[p + w] === INSIDE) ||
        (j > 0 && flags[p - 1] === INSIDE) ||
        (j < w - 1 && flags[p + 1] === INSIDE);
      if (touchesHole) {
        flags[p] = BAND;
        heap.push(0, p);
      }
    }
  }
  if (heap.size === 0) return out; // nothing masked, or the mask covers everything

  // Directional derivative of T at (i,j), using only known neighbours.
  const gradT = (i: number, j: number, axis: 0 | 1): number => {
    const p = i * w + j;
    const step = axis === 0 ? 1 : w; // 0 = x (columns), 1 = y (rows)
    const lo = axis === 0 ? j - 1 : i - 1;
    const hi = axis === 0 ? j + 1 : i + 1;
    const limit = axis === 0 ? w : h;
    const hasLo = lo >= 0 && flags[p - step] !== INSIDE;
    const hasHi = hi < limit && flags[p + step] !== INSIDE;
    if (hasLo && hasHi) return (T[p + step] - T[p - step]) * 0.5;
    if (hasHi) return T[p + step] - T[p];
    if (hasLo) return T[p] - T[p - step];
    return 0;
  };

  const estimate = (i: number, j: number): void => {
    const p = i * w + j;
    const gx = gradT(i, j, 0);
    const gy = gradT(i, j, 1);
    const tp = T[p];

    const iLo = Math.max(i - radius, 1);
    const iHi = Math.min(i + radius, h - 2);
    const jLo = Math.max(j - radius, 1);
    const jHi = Math.min(j + radius, w - 2);

    for (let c = 0; c < 3; c++) {
      let acc = 0;
      let jx = 0;
      let jy = 0;
      let weight = 1e-20;

      for (let k = iLo; k <= iHi; k++) {
        for (let l = jLo; l <= jHi; l++) {
          const q = k * w + l;
          if (flags[q] === INSIDE) continue;
          const ry = i - k;
          const rx = j - l;
          const len = rx * rx + ry * ry;
          if (len === 0 || len > radius * radius) continue;

          // distance, level-set and direction weights (Telea eq. 1-4)
          const dst = 1 / (len * Math.sqrt(len));
          const lev = 1 / (1 + Math.abs(T[q] - tp));
          let dir = rx * gx + ry * gy;
          if (Math.abs(dir) <= 0.01) dir = 1e-6;
          const wgt = Math.abs(dst * lev * dir);

          // Image gradient at the known neighbour, central where possible.
          const here = px[q * 4 + c];
          const left = flags[q - 1] !== INSIDE ? px[(q - 1) * 4 + c] : here;
          const right = flags[q + 1] !== INSIDE ? px[(q + 1) * 4 + c] : here;
          const up = flags[q - w] !== INSIDE ? px[(q - w) * 4 + c] : here;
          const down = flags[q + w] !== INSIDE ? px[(q + w) * 4 + c] : here;

          acc += wgt * here;
          jx -= wgt * ((right - left) * 0.5) * rx;
          jy -= wgt * ((down - up) * 0.5) * ry;
          weight += wgt;
        }
      }

      const value = acc / weight + (jx + jy) / (Math.sqrt(jx * jx + jy * jy) + 1e-20) + 0.5;
      px[p * 4 + c] = value; // Uint8ClampedArray clamps to 0..255 for us
    }
    px[p * 4 + 3] = 255;
  };

  while (heap.size > 0) {
    const p = heap.pop();
    const i = (p / w) | 0;
    const j = p - i * w;
    flags[p] = KNOWN;

    const neighbours: [number, number][] = [
      [i - 1, j],
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
    ];
    for (const [k, l] of neighbours) {
      if (k < 0 || k >= h || l < 0 || l >= w) continue;
      const q = k * w + l;
      if (flags[q] === KNOWN) continue;

      T[q] = Math.min(
        solve(k - 1, l, k, l - 1, w, h, flags, T),
        solve(k + 1, l, k, l - 1, w, h, flags, T),
        solve(k - 1, l, k, l + 1, w, h, flags, T),
        solve(k + 1, l, k, l + 1, w, h, flags, T),
      );

      if (flags[q] === INSIDE) {
        flags[q] = BAND;
        estimate(k, l);
        heap.push(T[q], q);
      }
    }
  }

  return out;
}
