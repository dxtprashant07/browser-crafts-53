import { useMemo, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const EXAMPLE = "https://example.com/search?q=hello world&tag=café#top";

export default function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [scope, setScope] = useState<"component" | "full">("component");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const fn =
        mode === "encode"
          ? scope === "component"
            ? encodeURIComponent
            : encodeURI
          : scope === "component"
            ? decodeURIComponent
            : decodeURI;
      const out = fn(input);
      track("tool_used", { slug: "url-encode-decode", mode, scope });
      return { output: out, error: "" };
    } catch {
      return {
        output: "",
        error: "That doesn't look like valid percent-encoded input — check for stray % signs.",
      };
    }
  }, [input, mode, scope]);

  const useOutputAsInput = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  const loadExample = () => {
    setInput(mode === "encode" ? EXAMPLE : encodeURIComponent(EXAMPLE));
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
              <strong>{mode === "encode" ? "Encoded output" : "Decoded output"}</strong>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <span className="tc-count">{output.length.toLocaleString()} chars</span>
                <CopyButton getText={() => output} />
              </span>
            </div>
            <textarea
              className="textarea mono-input"
              readOnly
              value={output}
              aria-label="Output"
              style={{ minHeight: 160 }}
            />
            <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={useOutputAsInput}>
              ⇄ Use output as input ({mode === "encode" ? "decode it back" : "encode it again"})
            </button>
          </div>
        ) : null
      }
    >
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        <Segmented
          ariaLabel="Scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: "component", label: "Component (query/path part)" },
            { value: "full", label: "Full URI" },
          ]}
        />
      </div>
      <div className="tc-editor-head">
        <label className="field" htmlFor="url-input">
          {mode === "encode" ? "Text or URL to encode" : "Percent-encoded text to decode"}
        </label>
        <span className="tc-count">{input ? `${input.length.toLocaleString()} chars` : ""}</span>
      </div>
      <textarea
        id="url-input"
        className="textarea mono-input"
        placeholder={mode === "encode" ? "https://example.com/search?q=hello world" : "hello%20world"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: 160 }}
      />
      <div className="wc-toolbar" style={{ marginTop: 12 }}>
        {!input && (
          <button className="btn btn-sm" onClick={loadExample}>
            Try an example
          </button>
        )}
        {input && (
          <button className="btn btn-sm" onClick={() => setInput("")}>
            Clear
          </button>
        )}
        <span className="tc-count" style={{ marginLeft: "auto" }}>
          Converts live as you type
        </span>
      </div>
      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
    </ToolShell>
  );
}
