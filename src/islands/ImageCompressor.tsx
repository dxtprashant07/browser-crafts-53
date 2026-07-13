import { useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, ToolShell } from "@/components/ToolKit";
import { loadBitmap, isImageFile } from "@/lib/image";
import { runImageJob } from "@/lib/workers";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { baseName, downloadBlob, formatBytes, percentSaved } from "@/lib/format";
import { track } from "@/lib/analytics";

interface Done {
  blob: Blob;
  originalSize: number;
  name: string;
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(72);
  const [enableSize, setEnableSize] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const previewUrl = useObjectUrl(done?.blob ?? null);

  const handle = async (files: File[], q = quality) => {
    const f = files[0];
    if (!isImageFile(f)) {
      setError("That's not an image — try JPG, PNG, or WEBP.");
      return;
    }
    setFile(f);
    setError("");
    setBusy(true);
    setDone(null);
    try {
      const bitmap = await loadBitmap(f);
      const type = f.type === "image/png" ? "image/webp" : f.type || "image/jpeg";
      const job: any = { op: "compress", bitmap, type, quality: q };
      if (enableSize) {
        job.width = width;
        job.height = height;
      }
      const res = await runImageJob(job, [bitmap]);
      setDone({ blob: res.blob!, originalSize: f.size, name: f.name });
      track("tool_used", { slug: "compress-image", quality: q, size_enabled: enableSize });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't compress that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      result={
        done ? (
          <div className="card">
            {previewUrl && (
              <img src={previewUrl} alt="Compressed result preview" className="result-preview" />
            )}
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Original</span>
              <span className="val">{formatBytes(done.originalSize)}</span>
            </div>
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Compressed</span>
              <span className="val">{formatBytes(done.blob.size)}</span>
            </div>
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Saved</span>
              <span className="val" style={{ color: "var(--success)" }}>
                {percentSaved(done.originalSize, done.blob.size)}%
              </span>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 14, width: "100%" }}
              onClick={() => {
                downloadBlob(done.blob, `${baseName(done.name)}-compressed.webp`);
                track("result_downloaded", { slug: "compress-image" });
              }}
            >
              Download compressed image
            </button>
          </div>
        ) : null
      }
    >
      {!file && <DropZone accept="image/*" onFiles={handle} hint="JPG, PNG or WEBP" />}
      {file && (
        <>
          <p style={{ marginBottom: 6, fontWeight: 600 }}>{file.name}</p>
          <button
            className="btn btn-sm"
            onClick={() => {
              setFile(null);
              setDone(null);
            }}
          >
            Choose another
          </button>
        </>
      )}
      <div style={{ marginTop: 18 }}>
        <label className="field" htmlFor="q">
          Quality: <span className="mono">{quality}%</span>
        </label>
        <input
          id="q"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          onMouseUp={() => file && handle([file])}
          onTouchEnd={() => file && handle([file])}
        />
      </div>
      <div style={{ marginTop: 18 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={enableSize}
            onChange={(e) => setEnableSize(e.target.checked)}
          />
          <span className="field" style={{ margin: 0 }}>Resize image</span>
        </label>
        {enableSize && (
          <div style={{ paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="w">Width: <span className="mono">{width}px</span></label>
              <input
                id="w"
                type="range"
                min={50}
                max={4000}
                step={10}
                value={width}
                onChange={(e) => {
                  const newWidth = Number(e.target.value);
                  setWidth(newWidth);
                  if (maintainAspect && file) {
                    const ratio = height / width;
                    setHeight(Math.round(newWidth * ratio));
                  }
                }}
                onMouseUp={() => file && handle([file])}
                onTouchEnd={() => file && handle([file])}
              />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="h">Height: <span className="mono">{height}px</span></label>
              <input
                id="h"
                type="range"
                min={50}
                max={4000}
                step={10}
                value={height}
                onChange={(e) => {
                  const newHeight = Number(e.target.value);
                  setHeight(newHeight);
                  if (maintainAspect && file) {
                    const ratio = width / height;
                    setWidth(Math.round(newHeight * ratio));
                  }
                }}
                onMouseUp={() => file && handle([file])}
                onTouchEnd={() => file && handle([file])}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
              />
              <span className="field" style={{ margin: 0, fontSize: "0.9em" }}>Maintain aspect ratio</span>
            </label>
          </div>
        )}
      </div>
      {busy && <p style={{ color: "var(--muted)", marginTop: 10 }}>Compressing…</p>}
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <PrivacyNote />
    </ToolShell>
  );
}
