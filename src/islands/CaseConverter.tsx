import { useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const EXAMPLE = "the quick brown fox jumps over the lazy dog — and the cat watches from the fence";

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
  "up",
  "via",
  "vs",
  "with",
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

function sentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

function camelCase(text: string): string {
  const words = text.toLowerCase().match(/[a-z0-9]+/gi) ?? [];
  return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join("");
}

function snakeCase(text: string): string {
  return (text.toLowerCase().match(/[a-z0-9]+/gi) ?? []).join("_");
}

function kebabCase(text: string): string {
  return (text.toLowerCase().match(/[a-z0-9]+/gi) ?? []).join("-");
}

const ACTIONS: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "Title Case", fn: titleCase },
  { label: "Sentence case", fn: sentenceCase },
  { label: "camelCase", fn: camelCase },
  { label: "snake_case", fn: snakeCase },
  { label: "kebab-case", fn: kebabCase },
];

function counts(text: string): string {
  if (!text) return "";
  const words = (text.match(/\S+/g) ?? []).length;
  return `${words.toLocaleString()} words · ${text.length.toLocaleString()} chars`;
}

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState("");
  const [error, setError] = useState("");

  const apply = (fn: (s: string) => string, label: string) => {
    if (!input.trim()) {
      setError("Type some text first, then pick a case.");
      setOutput("");
      return;
    }
    setError("");
    setOutput(fn(input));
    setActive(label);
    track("tool_used", { slug: "case-converter", action: label });
  };

  return (
    <ToolShell
      result={
        output ? (
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <strong>{active}</strong>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <span className="tc-count">{counts(output)}</span>
                <CopyButton getText={() => output} />
              </span>
            </div>
            <textarea
              className="textarea"
              readOnly
              value={output}
              aria-label="Converted text"
              style={{ minHeight: 180 }}
            />
          </div>
        ) : null
      }
    >
      <div className="tc-editor-head">
        <label className="field" htmlFor="cc-input">
          Your text
        </label>
        <span className="tc-count">{counts(input)}</span>
      </div>
      <textarea
        id="cc-input"
        className="textarea"
        placeholder="Paste or type text here…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          if (error) setError("");
        }}
        style={{ minHeight: 220 }}
      />
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <div className="wc-toolbar" style={{ marginTop: 14 }}>
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            className={active === a.label && output ? "btn btn-primary btn-sm" : "btn btn-sm"}
            onClick={() => apply(a.fn, a.label)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="wc-toolbar" style={{ marginTop: 10 }}>
        {!input && (
          <button className="btn btn-sm" onClick={() => setInput(EXAMPLE)}>
            Try an example
          </button>
        )}
        {input && (
          <button
            className="btn btn-sm"
            onClick={() => {
              setInput("");
              setOutput("");
              setActive("");
            }}
          >
            Clear
          </button>
        )}
      </div>
    </ToolShell>
  );
}
