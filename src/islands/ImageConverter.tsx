import { useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, Segmented, ToolShell } from "@/components/ToolKit";
import { loadBitmap, isImageFile } from "@/lib/image";
import { runImageJob } from "@/lib/workers";
import { useObjectUrl } from "@/lib/useObjectUrl";
import { baseName, downloadBlob, formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";

type Fmt = "image/jpeg" | "image/png" | "image/webp";
const EXT: Record<Fmt, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fmt, setFmt] = useState<Fmt>("image/webp");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const previewUrl = useObjectUrl(result);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!isImageFile(f)) {
      setError("That's not an image — try JPG, PNG, WEBP, or HEIC.");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const bmp = await loadBitmap(file);
      const res = await runImageJob({ op: "convert", bitmap: bmp, type: fmt, quality: 92 }, [bmp]);
      setResult(res.blob!);
      track("tool_used", { slug: "convert-image-format", to: fmt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't convert that image.");
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
              <img src={previewUrl} alt="Converted result preview" className="result-preview" />
            )}
            <p style={{ marginBottom: 12 }}>
              Converted to <strong>{EXT[fmt].toUpperCase()}</strong> —{" "}
              <span className="mono">{formatBytes(result.size)}</span>
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                downloadBlob(result, `${baseName(file!.name)}.${EXT[fmt]}`);
                track("result_downloaded", { slug: "convert-image-format" });
              }}
            >
              Download {EXT[fmt].toUpperCase()}
            </button>
          </div>
        ) : null
      }
    >
      {!file && (
        <DropZone accept="image/*,.heic,.heif" onFiles={onFiles} hint="JPG, PNG, WEBP or HEIC" />
      )}
      {file && (
        <>
          <p style={{ fontWeight: 600 }}>{file.name}</p>
          <button
            className="btn btn-sm"
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
          >
            Choose another
          </button>
        </>
      )}
      <div style={{ marginTop: 16 }}>
        <label className="field">Convert to</label>
        <Segmented
          ariaLabel="Output format"
          value={fmt}
          onChange={setFmt}
          options={[
            { value: "image/jpeg", label: "JPG" },
            { value: "image/png", label: "PNG" },
            { value: "image/webp", label: "WEBP" },
          ]}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={convert} disabled={!file || busy}>
          {busy ? "Converting…" : "Convert image"}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <PrivacyNote />
    </ToolShell>
  );
}
