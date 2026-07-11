import { useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import { downloadBlob } from "@/lib/format";
import { track } from "@/lib/analytics";

const EXAMPLE = `{
  "product": "Tools Platform",
  "version": 2,
  "features": ["json", "diff", "images"],
  "pricing": { "plan": "free", "limits": null },
  "beta": true
}`;

function errorLocation(text: string, message: string): string {
  const m = /position (\d+)/.exec(message);
  if (!m) return message;
  const pos = parseInt(m[1], 10);
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  const col = pos - before.lastIndexOf("\n");
  return `${message} (line ${line}, column ${col})`;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((n: number, v) => n + countKeys(v), 0);
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.reduce((n, [, v]) => n + countKeys(v), entries.length);
  }
  return 0;
}

function maxDepth(value: unknown): number {
  if (Array.isArray(value)) return 1 + Math.max(0, ...value.map(maxDepth));
  if (value !== null && typeof value === "object")
    return 1 + Math.max(0, ...Object.values(value as Record<string, unknown>).map(maxDepth));
  return 0;
}

function counts(text: string): string {
  const lines = text ? text.split("\n").length : 0;
  return `${lines.toLocaleString()} lines · ${text.length.toLocaleString()} chars`;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ keys: number; depth: number } | null>(null);

  const run = (minify: boolean, text = input) => {
    if (!text.trim()) {
      setError("Paste some JSON first — or load the example.");
      setOutput("");
      setStats(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setStats({ keys: countKeys(parsed), depth: maxDepth(parsed) });
      setError("");
      track("tool_used", { slug: "json-formatter", action: minify ? "minify" : "format" });
    } catch (e) {
      setError(errorLocation(text, e instanceof Error ? e.message : "Invalid JSON"));
      setOutput("");
      setStats(null);
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setStats(null);
  };

  const loadExample = () => {
    setInput(EXAMPLE);
    setError("");
    run(false, EXAMPLE);
  };

  return (
    <ToolShell>
      <div className="tc-editors">
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="json-input">
              JSON input
            </label>
            <span className="tc-count">{counts(input)}</span>
          </div>
          <textarea
            id="json-input"
            className="textarea tc-textarea"
            placeholder='Paste JSON here… e.g. {"hello":"world","items":[1,2,3]}'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            spellCheck={false}
          />
        </div>
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="json-output">
              Output{" "}
              {output && (
                <span
                  className="tag"
                  style={{
                    background: "var(--success-bg)",
                    color: "var(--success)",
                    marginLeft: 6,
                  }}
                >
                  ✓ Valid JSON
                </span>
              )}
            </label>
            <span className="tc-count">
              {output && stats
                ? `${counts(output)} · ${stats.keys.toLocaleString()} keys · depth ${stats.depth}`
                : ""}
            </span>
          </div>
          <textarea
            id="json-output"
            className="textarea tc-textarea"
            readOnly
            placeholder="Formatted JSON appears here…"
            value={output}
            aria-label="Formatted JSON"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <div className="tc-actions">
        <button className="btn btn-primary tc-compare-btn" onClick={() => run(false)}>
          Format
        </button>
        <button className="btn" onClick={() => run(true)}>
          Minify
        </button>
        <button className="btn" onClick={clear} disabled={!input && !output}>
          Clear
        </button>
        {!input && (
          <button className="btn" onClick={loadExample}>
            Try an example
          </button>
        )}
        {output && (
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
            <CopyButton getText={() => output} label="Copy output" />
            <button
              className="btn btn-sm"
              onClick={() => {
                downloadBlob(new Blob([output], { type: "application/json" }), "formatted.json");
                track("result_downloaded", { slug: "json-formatter" });
              }}
            >
              Download .json
            </button>
          </span>
        )}
      </div>
    </ToolShell>
  );
}
