import { useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, Segmented, ToolShell } from "@/components/ToolKit";
import { runPdfJob } from "@/lib/workers";
import { baseName, downloadBlob, formatBytes, percentSaved } from "@/lib/format";
import { track } from "@/lib/analytics";

function isPdf(f: File) {
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
}
type Level = "light" | "balanced" | "strong";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("balanced");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    original: number;
    imagesRecompressed: number;
  } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!isPdf(f)) {
      setError("That's not a PDF — please choose a .pdf file.");
      return;
    }
    setError("");
    setFile(f);
    setResult(null);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const res = await runPdfJob({ op: "compress", files: [buf], level });
      setResult({
        blob: new Blob([res.parts![0].bytes], { type: "application/pdf" }),
        original: file.size,
        imagesRecompressed: res.imagesRecompressed ?? 0,
      });
      track("tool_used", { slug: "compress-pdf", level });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't compress that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      result={
        result ? (
          <div className="card">
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Original</span>
              <span className="val">{formatBytes(result.original)}</span>
            </div>
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Compressed</span>
              <span className="val">{formatBytes(result.blob.size)}</span>
            </div>
            <div className="stat-row">
              <span style={{ color: "var(--muted)" }}>Saved</span>
              <span className="val" style={{ color: "var(--success)" }}>
                {percentSaved(result.original, result.blob.size)}%
              </span>
            </div>
            {result.imagesRecompressed === 0 && (
              <p style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--muted)" }}>
                No compressible images found in this PDF — its size mostly comes from text, fonts,
                or vector content, which we don't touch to avoid altering how the document looks.
              </p>
            )}
            <button
              className="btn btn-primary"
              style={{ marginTop: 14, width: "100%" }}
              onClick={() => {
                downloadBlob(result.blob, `${baseName(file!.name)}-compressed.pdf`);
                track("result_downloaded", { slug: "compress-pdf" });
              }}
            >
              Download compressed PDF
            </button>
            <button className="btn btn-sm" style={{ marginTop: 8, width: "100%" }} onClick={reset}>
              Compress another PDF
            </button>
          </div>
        ) : null
      }
    >
      {!file && (
        <DropZone accept="application/pdf" onFiles={onFiles} hint="Drop a PDF to compress" />
      )}
      {file && (
        <>
          <p style={{ fontWeight: 600 }}>
            {file.name}{" "}
            <span className="mono" style={{ color: "var(--muted)", fontWeight: 400 }}>
              ({formatBytes(file.size)})
            </span>
          </p>
          <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={reset}>
            Choose another
          </button>
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <label className="field">Compression level</label>
        <Segmented
          ariaLabel="Compression level"
          value={level}
          onChange={setLevel}
          options={[
            { value: "light", label: "Light" },
            { value: "balanced", label: "Balanced" },
            { value: "strong", label: "Strong" },
          ]}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={compress} disabled={!file || busy}>
          {busy ? "Compressing…" : "Compress PDF"}
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
