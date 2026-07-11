import { useMemo, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const EXAMPLE_TEXT = "Hello, world 👋 — Base64 handles emoji & accents (café, naïve) safely.";

function encodeUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function decodeUtf8(b64: string): string {
  const bin = atob(b64.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function byteSize(text: string): string {
  return `${new TextEncoder().encode(text).length.toLocaleString()} bytes`;
}

export default function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const out = mode === "encode" ? encodeUtf8(input) : decodeUtf8(input);
      if (input.trim()) track("tool_used", { slug: "base64-encode-decode", mode });
      return { output: out, error: "" };
    } catch {
      return {
        output: "",
        error: "That doesn't look like valid Base64 — check for stray characters.",
      };
    }
  }, [input, mode]);

  const useOutputAsInput = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  const loadExample = () => {
    setInput(mode === "encode" ? EXAMPLE_TEXT : encodeUtf8(EXAMPLE_TEXT));
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
              <strong>{mode === "encode" ? "Base64 output" : "Decoded text"}</strong>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <span className="tc-count">
                  {output.length.toLocaleString()} chars · {byteSize(output)}
                </span>
                <CopyButton getText={() => output} />
              </span>
            </div>
            <textarea
              className="textarea mono-input"
              readOnly
              value={output}
              aria-label="Output"
              style={{ minHeight: 200 }}
            />
            <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={useOutputAsInput}>
              ⇄ Use output as input ({mode === "encode" ? "decode it back" : "encode it again"})
            </button>
          </div>
        ) : null
      }
    >
      <div style={{ marginBottom: 14 }}>
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
      </div>
      <div className="tc-editor-head">
        <label className="field" htmlFor="b64-input">
          {mode === "encode" ? "Text to encode" : "Base64 to decode"}
        </label>
        <span className="tc-count">
          {input ? `${input.length.toLocaleString()} chars · ${byteSize(input)}` : ""}
        </span>
      </div>
      <textarea
        id="b64-input"
        className="textarea mono-input"
        placeholder={mode === "encode" ? "Hello, world 👋" : "SGVsbG8sIHdvcmxkIPCfkYs="}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: 200 }}
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
