import { useState } from "react";
import JSZip from "jszip";
import { DropZone, ErrorNotice, PrivacyNote, Segmented, ToolShell } from "@/components/ToolKit";
import { runPdfJob } from "@/lib/workers";
import { baseName, downloadBlob, formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";

function isPdf(f: File) {
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
}
type Mode = "range" | "every" | "evenodd";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("range");
  const [range, setRange] = useState("");
  const [evenOdd, setEvenOdd] = useState<"even" | "odd">("odd");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<{ blob: Blob; name: string } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!isPdf(f)) {
      setError("That's not a PDF — please choose a .pdf file.");
      return;
    }
    setError("");
    setFile(f);
    setReady(null);
  };

  const split = async () => {
    if (!file) return;
    if (mode === "range" && !range.trim()) {
      setError('Enter a page range like "1-8, 14".');
      return;
    }
    setBusy(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const res = await runPdfJob({ op: "split", files: [buf], mode, range, evenOdd });
      const parts = res.parts!;
      if (mode === "every") {
        const zip = new JSZip();
        parts.forEach((p) => zip.file(p.name, p.bytes));
        const blob = await zip.generateAsync({ type: "blob" });
        setReady({ blob, name: `${baseName(file.name)}-pages.zip` });
      } else {
        setReady({
          blob: new Blob([parts[0].bytes], { type: "application/pdf" }),
          name: `${baseName(file.name)}-${parts[0].name}`,
        });
      }
      track("tool_used", { slug: "split-pdf", mode });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't split that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      result={
        ready ? (
          <div className="card">
            <p style={{ marginBottom: 12 }}>
              Your pages are ready — <span className="mono">{formatBytes(ready.blob.size)}</span>
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                downloadBlob(ready.blob, ready.name);
                track("result_downloaded", { slug: "split-pdf" });
              }}
            >
              Download {ready.name.endsWith(".zip") ? "ZIP" : "PDF"}
            </button>
            <button
              className="btn btn-sm"
              style={{ marginTop: 8, width: "100%" }}
              onClick={() => {
                setFile(null);
                setReady(null);
                setError("");
                setRange("");
              }}
            >
              Split another PDF
            </button>
          </div>
        ) : null
      }
    >
      {!file && <DropZone accept="application/pdf" onFiles={onFiles} hint="Drop a PDF to split" />}
      {file && (
        <p style={{ fontWeight: 600 }}>
          {file.name}{" "}
          <span className="mono" style={{ color: "var(--muted)", fontWeight: 400 }}>
            ({formatBytes(file.size)})
          </span>{" "}
          <button
            className="btn btn-sm"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setFile(null);
              setReady(null);
            }}
          >
            Change
          </button>
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <label className="field">Split mode</label>
        <Segmented
          ariaLabel="Split mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "range", label: "Page range" },
            { value: "every", label: "Every page" },
            { value: "evenodd", label: "Odd / even" },
          ]}
        />
      </div>

      {mode === "range" && (
        <div style={{ marginTop: 14 }}>
          <label className="field" htmlFor="sp-range">
            Pages
          </label>
          <input
            id="sp-range"
            className="input mono-input"
            placeholder="1-8, 14"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
        </div>
      )}
      {mode === "evenodd" && (
        <div style={{ marginTop: 14 }}>
          <Segmented
            ariaLabel="Odd or even"
            value={evenOdd}
            onChange={setEvenOdd}
            options={[
              { value: "odd", label: "Odd pages" },
              { value: "even", label: "Even pages" },
            ]}
          />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={split} disabled={!file || busy}>
          {busy ? "Splitting…" : "Split PDF"}
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
