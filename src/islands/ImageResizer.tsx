import { useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, ToolShell } from "@/components/ToolKit";
import { loadBitmap, isImageFile } from "@/lib/image";
import { runImageJob } from "@/lib/workers";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { baseName, downloadBlob } from "@/lib/format";
import { track } from "@/lib/analytics";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const previewUrl = useObjectUrl(result);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!isImageFile(f)) {
      setError("That's not an image — try JPG, PNG, or WEBP.");
      return;
    }
    setError("");
    setResult(null);
    const bmp = await loadBitmap(f);
    setFile(f);
    setNatural({ w: bmp.width, h: bmp.height });
    setWidth(bmp.width);
    setHeight(bmp.height);
    bmp.close();
  };

  const setW = (w: number) => {
    setWidth(w);
    if (lock && natural.w) setHeight(Math.round((w / natural.w) * natural.h));
  };
  const setH = (h: number) => {
    setHeight(h);
    if (lock && natural.h) setWidth(Math.round((h / natural.h) * natural.w));
  };

  const resize = async () => {
    if (!file || width < 1 || height < 1) return;
    setBusy(true);
    try {
      const bmp = await loadBitmap(file);
      const type = file.type || "image/png";
      const res = await runImageJob(
        { op: "resize", bitmap: bmp, type, width, height, quality: 92 },
        [bmp],
      );
      setResult(res.blob!);
      track("tool_used", { slug: "resize-image", width, height });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't resize that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      result={
        result ? (
          <div className="card">
            {previewUrl && (
              <img src={previewUrl} alt="Resized result preview" className="result-preview" />
            )}
            <p style={{ marginBottom: 12 }}>
              Resized to{" "}
              <span className="mono">
                {width}×{height}
              </span>{" "}
              px.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                downloadBlob(result, `${baseName(file!.name)}-${width}x${height}.png`);
                track("result_downloaded", { slug: "resize-image" });
              }}
            >
              Download resized image
            </button>
          </div>
        ) : null
      }
    >
      {!file && <DropZone accept="image/*" onFiles={onFiles} hint="JPG, PNG or WEBP" />}
      {file && (
        <>
          <p style={{ fontWeight: 600 }}>
            {file.name}{" "}
            <span className="mono" style={{ color: "var(--muted)", fontWeight: 400 }}>
              ({natural.w}×{natural.h})
            </span>
          </p>
          <div className="grid grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field" htmlFor="rw">
                Width (px)
              </label>
              <input
                id="rw"
                className="input mono-input"
                type="number"
                min={1}
                value={width}
                onChange={(e) => setW(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="field" htmlFor="rh">
                Height (px)
              </label>
              <input
                id="rh"
                className="input mono-input"
                type="number"
                min={1}
                value={height}
                onChange={(e) => setH(Number(e.target.value))}
              />
            </div>
          </div>
          <label className="btn btn-sm" style={{ marginTop: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={lock}
              onChange={(e) => setLock(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Lock aspect ratio
          </label>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={resize} disabled={busy}>
              {busy ? "Resizing…" : "Resize image"}
            </button>
            <button
              className="btn"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Choose another
            </button>
          </div>
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
