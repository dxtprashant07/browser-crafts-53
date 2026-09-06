import { useState } from "react";
import { Link } from "@tanstack/react-router";
import JSZip from "jszip";
import { DropZone, ErrorNotice, PrivacyNote, ToolShell } from "@/components/ToolKit";
import { scanImage, type Scan } from "@/lib/ai-metadata";
import { baseName, downloadBlob, formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";

const SLUG = "ai-image-metadata";

const CONFIDENCE_LABEL = {
  high: "Strong match",
  medium: "Partial match",
  low: "Weak match",
} as const;

// What the common generators actually leave in the file — the reference people
// come looking for once they see a block name they don't recognise.
const FOOTPRINTS: [string, string][] = [
  ["Stable Diffusion (A1111, Forge)", "PNG “parameters” chunk — full prompt, seed, sampler, model"],
  ["ComfyUI", "PNG “prompt” and “workflow” chunks — the entire node graph as JSON"],
  ["NovelAI", "PNG “Software”, “Source” and “Comment” chunks — prompt and settings"],
  ["InvokeAI", "PNG “invokeai_metadata” chunk — prompt, model, generation settings"],
  ["Midjourney", "XMP description and, on newer exports, C2PA Content Credentials"],
  ["DALL·E / ChatGPT", "C2PA Content Credentials naming OpenAI as the generator"],
  ["Adobe Firefly", "C2PA Content Credentials plus XMP — flagged as trained-algorithm media"],
  ["Google Gemini / Imagen", "C2PA Content Credentials, and an invisible SynthID pixel watermark"],
];

interface Item {
  id: number;
  file: File;
  scan: Scan | null;
  error: string;
}

function cleanName(item: Item): string {
  const ext = item.scan?.format === "jpeg" ? "jpg" : (item.scan?.format ?? "img");
  return `${baseName(item.file.name)}-clean.${ext}`;
}

function truncate(value: string, max = 600): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default function AiImageMetadataTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      const scanned = await Promise.all(
        files.map(async (file, i) => {
          try {
            return { id: Date.now() + i, file, scan: await scanImage(file), error: "" };
          } catch (e) {
            const message = e instanceof Error ? e.message : "Couldn't read that image.";
            return { id: Date.now() + i, file, scan: null, error: message };
          }
        }),
      );
      setItems((prev) => [...prev, ...scanned]);
      const flagged = scanned.filter((s) => s.scan?.detection).length;
      track("tool_used", { slug: SLUG, files: scanned.length, flagged });
      if (scanned.every((s) => s.error)) setError(scanned[0].error);
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const item of items) {
      if (item.scan) zip.file(cleanName(item), item.scan.cleaned);
    }
    downloadBlob(await zip.generateAsync({ type: "blob" }), "clean-images.zip");
    track("result_downloaded", { slug: SLUG, files: items.length, zip: true });
  };

  const ok = items.filter((i) => i.scan);
  const flagged = ok.filter((i) => i.scan!.detection);
  const carrying = ok.filter((i) => i.scan!.entries.length > 0);
  const removed = ok.reduce((n, i) => n + i.scan!.originalSize - i.scan!.cleanedSize, 0);

  return (
    <ToolShell
      result={
        items.length > 0 ? (
          <div className="card">
            <div className="notice" role="status" style={{ marginBottom: 16 }}>
              <span aria-hidden>{flagged.length ? "🤖" : "🔍"}</span>
              <span>
                {flagged.length > 0 ? (
                  <>
                    <strong>
                      {flagged.length} of {ok.length} image{ok.length === 1 ? "" : "s"} carry an AI
                      generator signature.
                    </strong>{" "}
                    {carrying.length} carr{carrying.length === 1 ? "ies" : "y"} metadata worth{" "}
                    {formatBytes(removed)} in total — all of it is removed below.
                  </>
                ) : (
                  <>
                    <strong>No AI generator signature found.</strong> That does not prove these
                    images are not AI-generated — most tools and social platforms strip metadata on
                    save, and pixel watermarks like SynthID can't be read here.
                  </>
                )}
              </span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                style={{ borderTop: "1px solid var(--border)", padding: "14px 0" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ wordBreak: "break-all" }}>{item.file.name}</strong>
                  {item.scan && (
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        downloadBlob(item.scan!.cleaned, cleanName(item));
                        track("result_downloaded", { slug: SLUG });
                      }}
                    >
                      Download clean{" "}
                      {item.scan.format === "jpeg" ? "JPG" : item.scan.format.toUpperCase()}
                    </button>
                  )}
                </div>

                {item.error ? (
                  <p style={{ color: "var(--muted)", marginTop: 6 }}>{item.error}</p>
                ) : (
                  <>
                    <p style={{ color: "var(--muted)", marginTop: 6 }}>
                      {item.scan!.detection ? (
                        <>
                          Likely <strong>{item.scan!.detection.name}</strong> —{" "}
                          {CONFIDENCE_LABEL[item.scan!.detection.confidence]}.{" "}
                          <span className="mono">{item.scan!.detection.evidence}</span>
                        </>
                      ) : (
                        <>No generator signature in this file.</>
                      )}
                      {" · "}
                      {item.scan!.entries.length === 0
                        ? "no metadata blocks"
                        : `${item.scan!.entries.length} block${item.scan!.entries.length === 1 ? "" : "s"}, ${formatBytes(item.scan!.originalSize - item.scan!.cleanedSize)} removed`}
                    </p>

                    {item.scan!.entries.map((entry, i) => (
                      <details key={i} style={{ marginTop: 6 }}>
                        <summary>
                          <strong>{entry.key}</strong>{" "}
                          <span style={{ color: "var(--muted)" }}>
                            ({entry.value.length.toLocaleString()} characters)
                          </span>
                        </summary>
                        <pre
                          className="mono"
                          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                          {truncate(entry.value)}
                        </pre>
                      </details>
                    ))}
                  </>
                )}
              </div>
            ))}

            {ok.length > 1 && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 14 }}
                onClick={downloadAll}
              >
                Download all {ok.length} clean images (ZIP)
              </button>
            )}
            <p className="privacy-note" style={{ marginTop: 10 }}>
              Pixels are copied byte for byte. Nothing is re-encoded, so quality is identical.
            </p>
          </div>
        ) : null
      }
    >
      <DropZone
        accept="image/png,image/jpeg,image/webp"
        multiple
        onFiles={onFiles}
        hint="PNG, JPG or WebP — as many as you like, no size cap"
      />
      {busy && <p style={{ marginTop: 12, color: "var(--muted)" }}>Reading files…</p>}
      {items.length > 0 && (
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setItems([])}>
          Clear {items.length} file{items.length === 1 ? "" : "s"}
        </button>
      )}
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <div className="notice" style={{ marginTop: 16 }}>
        <span aria-hidden>🧽</span>
        <span>
          Metadata is only half a footprint. A <strong>visible</strong> watermark or logo lives in
          the pixels themselves and survives this clean — paint it out with the{" "}
          <Link
            to="/tools/$category/$slug"
            params={{ category: "image", slug: "watermark-remover" }}
          >
            Watermark Remover
          </Link>
          . Invisible pixel watermarks such as SynthID survive both.
        </span>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary>What each AI tool leaves behind</summary>
        <table className="regex-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Generator</th>
              <th>Footprint it writes</th>
            </tr>
          </thead>
          <tbody>
            {FOOTPRINTS.map(([tool, note]) => (
              <tr key={tool}>
                <td>{tool}</td>
                <td>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <PrivacyNote />
    </ToolShell>
  );
}
