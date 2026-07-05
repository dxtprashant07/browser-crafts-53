import { useMemo, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

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
      return { output: "", error: "That doesn't look like valid Base64 — check for stray characters." };
    }
  }, [input, mode]);

  return (
    <ToolShell
      result={
        output ? (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>{mode === "encode" ? "Base64 output" : "Decoded text"}</strong>
              <CopyButton getText={() => output} />
            </div>
            <textarea className="textarea mono-input" readOnly value={output} aria-label="Output" />
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
      <label className="field" htmlFor="b64-input">
        {mode === "encode" ? "Text to encode" : "Base64 to decode"}
      </label>
      <textarea
        id="b64-input"
        className="textarea mono-input"
        placeholder={mode === "encode" ? "Hello, world 👋" : "SGVsbG8sIHdvcmxkIPCfkYs="}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {error && <div style={{ marginTop: 12 }}><ErrorNotice>{error}</ErrorNotice></div>}
    </ToolShell>
  );
}
