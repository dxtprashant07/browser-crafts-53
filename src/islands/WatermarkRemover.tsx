import { useCallback, useEffect, useRef, useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, ToolShell } from "@/components/ToolKit";
import { loadBitmap, isImageFile } from "@/lib/image";
import { runImageJob } from "@/lib/workers";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { baseName, downloadBlob, formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";

const SLUG = "watermark-remover";
const OVERLAY = "rgba(239, 68, 68, 0.45)";

interface Stroke {
  points: [number, number][];
  size: number;
}

export default function WatermarkRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [brush, setBrush] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const resultUrl = useObjectUrl(result);

  // base = current pixels (swapped for the result after each pass)
  // mask = white where the user painted, read back as the inpaint mask
  // view = what's on screen: base plus the red overlay
  const base = useRef<HTMLCanvasElement | null>(null);
  const mask = useRef<HTMLCanvasElement | null>(null);
  const view = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const current = useRef<Stroke | null>(null);

  const paintSegment = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: Stroke, from: number, style: string) => {
      ctx.strokeStyle = style;
      ctx.fillStyle = style;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = stroke.points;
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0][0], pts[0][1], stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(pts[from][0], pts[from][1]);
      for (let i = from + 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    },
    [],
  );

  // Full repaint of the mask and the on-screen overlay from the stroke list.
  // Only needed after undo/clear — live drawing appends instead.
  const repaint = useCallback(
    (list: Stroke[]) => {
      const m = mask.current;
      const v = view.current;
      const b = base.current;
      if (!m || !v || !b) return;
      const mc = m.getContext("2d")!;
      const vc = v.getContext("2d")!;
      mc.clearRect(0, 0, m.width, m.height);
      vc.clearRect(0, 0, v.width, v.height);
      vc.drawImage(b, 0, 0);
      for (const stroke of list) {
        paintSegment(mc, stroke, 0, "#fff");
        paintSegment(vc, stroke, 0, OVERLAY);
      }
    },
    [paintSegment],
  );

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!isImageFile(f)) {
      setError("That's not an image — try JPG, PNG, or WEBP.");
      return;
    }
    setError("");
    setResult(null);
    setStrokes([]);
    setBusy(true);
    try {
      const bmp = await loadBitmap(f);
      for (const ref of [base, mask, view]) {
        const canvas = ref.current ?? document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        ref.current = canvas;
      }
      base.current!.getContext("2d")!.drawImage(bmp, 0, 0);
      bmp.close();
      setDims({ w: base.current!.width, h: base.current!.height });
      setFile(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open that image.");
    } finally {
      setBusy(false);
    }
  };

  // The visible canvas is created after `file` is set, so paint it once mounted.
  useEffect(() => {
    if (file) repaint(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, dims.w, dims.h]);

  const toImageCoords = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = e.currentTarget.width / rect.width;
    return [(e.clientX - rect.left) * scale, (e.clientY - rect.top) * scale];
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = { points: [toImageCoords(e)], size: brush };
    paintSegment(mask.current!.getContext("2d")!, current.current, 0, "#fff");
    paintSegment(view.current!.getContext("2d")!, current.current, 0, OVERLAY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !current.current) return;
    current.current.points.push(toImageCoords(e));
    const from = current.current.points.length - 2;
    paintSegment(mask.current!.getContext("2d")!, current.current, from, "#fff");
    paintSegment(view.current!.getContext("2d")!, current.current, from, OVERLAY);
  };

  const onPointerUp = () => {
    if (!drawing.current || !current.current) return;
    drawing.current = false;
    const stroke = current.current;
    current.current = null;
    setStrokes((prev) => [...prev, stroke]);
  };

  const undo = () => {
    const next = strokes.slice(0, -1);
    setStrokes(next);
    repaint(next);
  };

  const clear = () => {
    setStrokes([]);
    repaint([]);
  };

  const remove = async () => {
    if (!file || strokes.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const m = mask.current!;
      const painted = m.getContext("2d")!.getImageData(0, 0, m.width, m.height).data;
      const flat = new Uint8Array(m.width * m.height);
      for (let p = 0; p < flat.length; p++) flat[p] = painted[p * 4 + 3] > 32 ? 1 : 0;

      const bmp = await createImageBitmap(base.current!);
      const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
      const res = await runImageJob(
        { op: "inpaint", bitmap: bmp, type, quality: 95, mask: flat, radius: 5 },
        [bmp, flat.buffer],
      );

      // Feed the result back in as the new base so passes can be stacked.
      const cleaned = await createImageBitmap(res.blob!);
      base.current!.getContext("2d")!.drawImage(cleaned, 0, 0);
      cleaned.close();
      setResult(res.blob!);
      setStrokes([]);
      repaint([]);
      track("tool_used", { slug: SLUG, strokes: strokes.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't process that image.");
    } finally {
      setBusy(false);
    }
  };

  const ext = result?.type === "image/jpeg" ? "jpg" : "png";

  return (
    <ToolShell
      result={
        result ? (
          <div className="card">
            {resultUrl && <img src={resultUrl} alt="Cleaned result" className="result-preview" />}
            <p style={{ marginBottom: 12 }}>
              Watermark area repainted — <span className="mono">{formatBytes(result.size)}</span>.
              Not clean enough? Paint over what's left and run it again.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                downloadBlob(result, `${baseName(file!.name)}-clean.${ext}`);
                track("result_downloaded", { slug: SLUG });
              }}
            >
              Download {ext.toUpperCase()}
            </button>
          </div>
        ) : null
      }
    >
      {!file && <DropZone accept="image/*,.heic,.heif" onFiles={onFiles} hint="JPG, PNG or WEBP" />}

      {file && (
        <>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <span style={{ fontWeight: 600, wordBreak: "break-all" }}>{file.name}</span>
            <button
              className="btn btn-sm"
              onClick={() => {
                setFile(null);
                setResult(null);
                setStrokes([]);
              }}
            >
              Choose another
            </button>
          </div>

          <canvas
            ref={(el) => {
              if (!el || !base.current) return;
              // Adopt the pre-sized element React just mounted as the view layer.
              if (view.current !== el) {
                el.width = base.current.width;
                el.height = base.current.height;
                view.current = el;
                repaint(strokes);
              }
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border)",
              cursor: "crosshair",
              touchAction: "none",
            }}
          />

          <div style={{ marginTop: 16 }}>
            <label className="field" htmlFor="brush">
              Brush size — {brush}px of a {dims.w}×{dims.h} image
            </label>
            <input
              id="brush"
              type="range"
              min={4}
              max={200}
              value={brush}
              onChange={(e) => setBrush(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={remove} disabled={busy || !strokes.length}>
              {busy ? "Repainting…" : "Remove painted area"}
            </button>
            <button className="btn btn-sm" onClick={undo} disabled={busy || !strokes.length}>
              Undo stroke
            </button>
            <button className="btn btn-sm" onClick={clear} disabled={busy || !strokes.length}>
              Clear mask
            </button>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 12 }}>
            Paint over the watermark — cover it fully, plus a pixel or two of the edge. Smaller
            brushes give better results: the repaint borrows from what surrounds each stroke.
          </p>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <div className="notice" style={{ marginTop: 16 }}>
        <span aria-hidden>⚖️</span>
        <span>
          Use this on images you own or have the rights to edit. Removing someone else's watermark
          to reuse their work is copyright infringement in most countries.
        </span>
      </div>

      <PrivacyNote />
    </ToolShell>
  );
}
