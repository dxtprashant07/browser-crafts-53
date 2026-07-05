import { useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on",
  "or", "the", "to", "up", "via", "vs", "with",
]);

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w, i, arr) => {
      if (i !== 0 && i !== arr.length - 1 && SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function camelCase(text: string): string {
  const words = text.toLowerCase().match(/[a-z0-9]+/gi) ?? [];
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

function snakeCase(text: string): string {
  return (text.toLowerCase().match(/[a-z0-9]+/gi) ?? []).join("_");
}

const ACTIONS: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "Title Case", fn: titleCase },
  { label: "camelCase", fn: camelCase },
  { label: "snake_case", fn: snakeCase },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const apply = (fn: (s: string) => string, label: string) => {
    if (!input.trim()) {
      setError("Type some text first, then pick a case.");
      setOutput("");
      return;
    }
    setError("");
    setOutput(fn(input));
    track("tool_used", { slug: "case-converter", action: label });
  };

  return (
    <ToolShell
      result={
        output ? (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>Result</strong>
              <CopyButton getText={() => output} />
            </div>
            <textarea className="textarea" readOnly value={output} aria-label="Converted text" />
          </div>
        ) : null
      }
    >
      <label className="field" htmlFor="cc-input">
        Your text
      </label>
      <textarea
        id="cc-input"
        className="textarea"
        placeholder="Paste or type text here…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {error && <div style={{ marginTop: 12 }}><ErrorNotice>{error}</ErrorNotice></div>}
      <div className="wc-toolbar" style={{ marginTop: 14 }}>
        {ACTIONS.map((a, i) => (
          <button
            key={a.label}
            className={i === 0 ? "btn btn-primary btn-sm" : "btn btn-sm"}
            onClick={() => apply(a.fn, a.label)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </ToolShell>
  );
}
