import { useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

function errorLocation(text: string, message: string): string {
  const m = /position (\d+)/.exec(message);
  if (!m) return message;
  const pos = parseInt(m[1], 10);
  const before = text.slice(0, pos);
  const line = before.split("\n").length;
  const col = pos - before.lastIndexOf("\n");
  return `${message} (line ${line}, column ${col})`;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  const run = (minify: boolean) => {
    if (!input.trim()) {
      setError("");
      setOutput("");
      setValid(false);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError("");
      setValid(true);
      track("tool_used", { slug: "json-formatter", action: minify ? "minify" : "format" });
    } catch (e) {
      setError(errorLocation(input, e instanceof Error ? e.message : "Invalid JSON"));
      setOutput("");
      setValid(false);
    }
  };

  return (
    <ToolShell
      result={
        output ? (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="tag" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                ✓ Valid JSON
              </span>
              <CopyButton getText={() => output} />
            </div>
            <textarea className="textarea mono-input" readOnly value={output} aria-label="Formatted JSON" style={{ minHeight: 220 }} />
          </div>
        ) : null
      }
    >
      <label className="field" htmlFor="json-input">
        JSON input
      </label>
      <textarea
        id="json-input"
        className="textarea mono-input"
        placeholder='{"hello":"world","items":[1,2,3]}'
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError("");
        }}
        style={{ minHeight: 200 }}
      />
      {valid && !error && (
        <span className="tag" style={{ marginTop: 10, background: "var(--success-bg)", color: "var(--success)" }}>
          ✓ Valid JSON
        </span>
      )}
      {error && <div style={{ marginTop: 12 }}><ErrorNotice>{error}</ErrorNotice></div>}
      <div className="wc-toolbar" style={{ marginTop: 14 }}>
        <button className="btn btn-primary btn-sm" onClick={() => run(false)}>
          Format
        </button>
        <button className="btn btn-sm" onClick={() => run(true)}>
          Minify
        </button>
      </div>
    </ToolShell>
  );
}
