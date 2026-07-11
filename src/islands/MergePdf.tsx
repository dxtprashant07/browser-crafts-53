import { useState } from "react";
import { DropZone, ErrorNotice, PrivacyNote, ToolShell } from "@/components/ToolKit";
import { runPdfJob } from "@/lib/workers";
import { downloadBlob, formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";

function isPdf(f: File) {
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
}

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const add = (incoming: File[]) => {
    const pdfs = incoming.filter(isPdf);
    if (pdfs.length !== incoming.length)
      setError("Some files were skipped — only PDF files can be merged.");
    else setError("");
    setFiles((f) => [...f, ...pdfs]);
    setResult(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    setFiles((f) => {
      const next = [...f];
      const j = i + dir;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    try {
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
      const res = await runPdfJob({ op: "merge", files: buffers });
      setResult(new Blob([res.parts![0].bytes], { type: "application/pdf" }));
      track("tool_used", { slug: "merge-pdf", count: files.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't merge those PDFs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      result={
        result ? (
          <div className="card">
            <p style={{ marginBottom: 12 }}>
              Merged {files.length} PDFs — <span className="mono">{formatBytes(result.size)}</span>
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                downloadBlob(result, "merged.pdf");
                track("result_downloaded", { slug: "merge-pdf" });
              }}
            >
              Download merged PDF
            </button>
            <button
              className="btn btn-sm"
              style={{ marginTop: 8, width: "100%" }}
              onClick={() => {
                setFiles([]);
                setResult(null);
                setError("");
              }}
            >
              Merge more PDFs
            </button>
          </div>
        ) : null
      }
    >
      <DropZone accept="application/pdf" multiple onFiles={add} hint="Add two or more PDF files" />
      {files.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
          {files.map((f, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                border: "1px solid var(--border)",
                borderRadius: 9,
                marginBottom: 8,
              }}
            >
              <span className="mono" style={{ color: "var(--muted)" }}>
                {i + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name}
              </span>
              <span
                className="mono"
                style={{ color: "var(--muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}
              >
                {formatBytes(f.size)}
              </span>
              <button
                className="icon-btn"
                style={{ width: 36, height: 36 }}
                aria-label={`Move ${f.name} up`}
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="icon-btn"
                style={{ width: 36, height: 36 }}
                aria-label={`Move ${f.name} down`}
                onClick={() => move(i, 1)}
                disabled={i === files.length - 1}
              >
                ↓
              </button>
              <button
                className="icon-btn"
                style={{ width: 36, height: 36 }}
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((x) => x.filter((_, k) => k !== i))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <p className="tc-count" style={{ marginTop: 4 }}>
          {files.length} file{files.length === 1 ? "" : "s"} ·{" "}
          {formatBytes(files.reduce((n, f) => n + f.size, 0))} total — drag order above is the merge
          order
        </p>
      )}
      <div style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={merge} disabled={busy || files.length < 2}>
          {busy ? "Merging…" : "Merge PDFs"}
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
