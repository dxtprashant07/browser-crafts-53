import { useEffect, useRef, useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, Segmented, ToolShell } from "@/components/ToolKit";
import { loadBitmap, isImageFile } from "@/lib/image";
import { baseName, downloadBlob } from "@/lib/format";
import { track } from "@/lib/analytics";

const DPI = 300;

const PRESETS = [
  { id: "us-india", label: "US / India / Generic — 2×2 in", wmm: 50.8, hmm: 50.8 },
  { id: "uk-eu", label: "UK / Ireland / Schengen / Australia — 35×45 mm", wmm: 35, hmm: 45 },
  { id: "canada", label: "Canada — 50×70 mm", wmm: 50, hmm: 70 },
  { id: "china", label: "China — 33×48 mm", wmm: 33, hmm: 48 },
  { id: "custom", label: "Custom size", wmm: 35, hmm: 45 },
] as const;

const FRAME_W = 280;
const KB_PRESETS = [10, 20, 50, 100, 200] as const;
const QUALITY_STEPS = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2];

function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * DPI);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), type, quality);
  });
}

// Steps JPEG quality down until the encoded size fits maxKB, or gives up at the
// lowest quality tried (a form's fixed pixel size can't be shrunk further, so a
// KB target that's just too tight for that resolution has no other lever left).
async function compressToTarget(
  canvas: HTMLCanvasElement,
  maxKB: number,
): Promise<{ blob: Blob; quality: number; hitTarget: boolean }> {
  const target = maxKB * 1024;
  let last: Blob = await canvasToBlob(canvas, "image/jpeg", QUALITY_STEPS[0]);
  let lastQ = QUALITY_STEPS[0];
  if (last.size <= target) return { blob: last, quality: lastQ, hitTarget: true };
  for (const q of QUALITY_STEPS.slice(1)) {
    const blob = await canvasToBlob(canvas, "image/jpeg", q);
    last = blob;
    lastQ = q;
    if (blob.size <= target) return { blob, quality: q, hitTarget: true };
  }
  return { blob: last, quality: lastQ, hitTarget: false };
}

export default function PassportPhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>("us-india");
  const [customW, setCustomW] = useState(35);
  const [customH, setCustomH] = useState(45);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [copies, setCopies] = useState<"4x6" | "single">("single");
  const [maxKB, setMaxKB] = useState<number | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    sizeKB: number;
    quality: number;
    hitTarget: boolean;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const wmm = presetId === "custom" ? customW : preset.wmm;
  const hmm = presetId === "custom" ? customH : preset.hmm;
  const aspect = wmm / hmm;
  const frameH = Math.round(FRAME_W / aspect);
  const outW = mmToPx(wmm);
  const outH = mmToPx(hmm);

  const baseScale = img ? Math.max(FRAME_W / img.width, frameH / img.height) : 1;
  const scale = baseScale * zoom;
  const overflowX = img ? Math.max(0, (img.width * scale - FRAME_W) / 2) : 0;
  const overflowY = img ? Math.max(0, (img.height * scale - frameH) / 2) : 0;

  useEffect(() => {
    setPan((p) => ({
      x: Math.max(-overflowX, Math.min(overflowX, p.x)),
      y: Math.max(-overflowY, Math.min(overflowY, p.y)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflowX, overflowY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    canvas.width = FRAME_W;
    canvas.height = frameH;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, FRAME_W, frameH);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (FRAME_W - dw) / 2 + pan.x;
    const dy = (frameH - dh) / 2 + pan.y;
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [img, scale, pan, frameH]);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!isImageFile(f)) {
      setError("That's not an image — try JPG, PNG, or WEBP.");
      return;
    }
    setError("");
    const bmp = await loadBitmap(f);
    const bitmapCanvas = document.createElement("canvas");
    bitmapCanvas.width = bmp.width;
    bitmapCanvas.height = bmp.height;
    bitmapCanvas.getContext("2d")!.drawImage(bmp, 0, 0);
    bmp.close();
    const image = new Image();
    image.onload = () => {
      setFile(f);
      setImg(image);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    image.src = bitmapCanvas.toDataURL();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPan({
      x: Math.max(-overflowX, Math.min(overflowX, dragRef.current.panX + dx)),
      y: Math.max(-overflowY, Math.min(overflowY, dragRef.current.panY + dy)),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  function renderCrop(): HTMLCanvasElement {
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, outW, outH);
    const exportScale = scale * (outW / FRAME_W);
    const dw = img!.width * exportScale;
    const dh = img!.height * exportScale;
    const dx = (outW - dw) / 2 + pan.x * (outW / FRAME_W);
    const dy = (outH - dh) / 2 + pan.y * (outH / FRAME_W);
    ctx.drawImage(img!, dx, dy, dw, dh);
    return out;
  }

  const downloadSingle = async () => {
    const cropped = renderCrop();
    const { blob, quality, hitTarget } = maxKB
      ? await compressToTarget(cropped, maxKB)
      : { blob: await canvasToBlob(cropped, "image/jpeg", 0.95), quality: 0.95, hitTarget: true };
    downloadBlob(blob, `${baseName(file!.name)}-passport-${outW}x${outH}.jpg`);
    setDownloadInfo({ sizeKB: Math.round(blob.size / 1024), quality, hitTarget });
    track("result_downloaded", {
      slug: "passport-photo",
      preset: presetId,
      sheet: "single",
      maxKB: maxKB ?? undefined,
    });
  };

  const downloadSheet = () => {
    const cropped = renderCrop();
    const sheetW = mmToPx(101.6); // 4in
    const sheetH = mmToPx(152.4); // 6in
    const gap = mmToPx(2);
    const cols = Math.max(1, Math.floor((sheetW + gap) / (outW + gap)));
    const rows = Math.max(1, Math.floor((sheetH + gap) / (outH + gap)));
    const sheet = document.createElement("canvas");
    sheet.width = sheetW;
    sheet.height = sheetH;
    const ctx = sheet.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, sheetW, sheetH);
    const totalW = cols * outW + (cols - 1) * gap;
    const totalH = rows * outH + (rows - 1) * gap;
    const startX = (sheetW - totalW) / 2;
    const startY = (sheetH - totalH) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.drawImage(cropped, startX + c * (outW + gap), startY + r * (outH + gap), outW, outH);
      }
    }
    sheet.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, `${baseName(file!.name)}-passport-sheet-4x6.jpg`);
        track("result_downloaded", { slug: "passport-photo", preset: presetId, sheet: "4x6" });
      },
      "image/jpeg",
      0.95,
    );
  };

  return (
    <ToolShell>
      {!file && (
        <DropZone accept="image/*" onFiles={onFiles} hint="A clear, front-facing photo — JPG, PNG or WEBP" />
      )}
      {file && img && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label className="field" htmlFor="pp-preset">
              Country / size
            </label>
            <select
              id="pp-preset"
              className="input"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value as (typeof PRESETS)[number]["id"])}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {presetId === "custom" && (
            <div className="grid grid-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="field" htmlFor="pp-w">
                  Width (mm)
                </label>
                <input
                  id="pp-w"
                  type="number"
                  min={10}
                  className="input mono-input"
                  value={customW}
                  onChange={(e) => setCustomW(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="field" htmlFor="pp-h">
                  Height (mm)
                </label>
                <input
                  id="pp-h"
                  type="number"
                  min={10}
                  className="input mono-input"
                  value={customH}
                  onChange={(e) => setCustomH(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <p className="tc-count" style={{ marginBottom: 8 }}>
            Output: {wmm}×{hmm} mm · {outW}×{outH} px @ {DPI} DPI
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              background: "var(--bg)",
              borderRadius: "var(--radius-card)",
              padding: 16,
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: FRAME_W,
                height: frameH,
                touchAction: "none",
                cursor: "grab",
                borderRadius: 4,
                boxShadow: "0 0 0 2px var(--accent)",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="field" htmlFor="pp-zoom">
              Zoom
            </label>
            <input
              id="pp-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <p className="tc-count">Drag the photo to reposition your face inside the frame.</p>

          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <Segmented
              ariaLabel="Download as"
              value={copies}
              onChange={setCopies}
              options={[
                { value: "single", label: "Single photo" },
                { value: "4x6", label: "4×6 in print sheet" },
              ]}
            />
          </div>

          {copies === "single" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field" htmlFor="pp-kb">
                Max file size (many forms cap uploads — e.g. Passport Seva, SSC, UPSC)
              </label>
              <div className="wc-toolbar">
                <button
                  className="btn btn-sm"
                  style={{ background: maxKB === null ? "var(--card)" : "var(--bg)" }}
                  onClick={() => setMaxKB(null)}
                >
                  No limit
                </button>
                {KB_PRESETS.map((kb) => (
                  <button
                    key={kb}
                    className="btn btn-sm"
                    style={{ background: maxKB === kb ? "var(--card)" : "var(--bg)" }}
                    onClick={() => setMaxKB(kb)}
                  >
                    {kb} KB
                  </button>
                ))}
                <input
                  id="pp-kb"
                  type="number"
                  min={1}
                  className="input mono-input"
                  style={{ width: 100 }}
                  placeholder="Custom KB"
                  value={maxKB ?? ""}
                  onChange={(e) => setMaxKB(e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={copies === "single" ? downloadSingle : downloadSheet}
            >
              {copies === "single" ? "Download photo" : "Download print sheet"}
            </button>
            <button
              className="btn"
              onClick={() => {
                setFile(null);
                setImg(null);
                setDownloadInfo(null);
              }}
            >
              Choose another
            </button>
          </div>

          {downloadInfo && (
            <div style={{ marginTop: 12 }}>
              <div className={`notice ${downloadInfo.hitTarget ? "notice-success" : "notice-error"}`}>
                <span aria-hidden>{downloadInfo.hitTarget ? "✅" : "⚠️"}</span>
                <span>
                  {downloadInfo.hitTarget
                    ? `Downloaded — ${downloadInfo.sizeKB} KB at ${Math.round(downloadInfo.quality * 100)}% quality.`
                    : `Couldn't get under ${maxKB} KB at this pixel size — lowest quality still came out to ${downloadInfo.sizeKB} KB. Downloaded anyway; if your form needs smaller, it may require a smaller pixel size too.`}
                </span>
              </div>
            </div>
          )}
        </>
      )}
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <PrivacyNote />
    </ToolShell>
  );
}
