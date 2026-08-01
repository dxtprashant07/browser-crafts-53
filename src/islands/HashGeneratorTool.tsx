import { useEffect, useState } from "react";
import { CopyButton, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

async function digestHex(algo: Algo, text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Partial<Record<Algo, string>>>({});

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setHashes({});
      return;
    }
    Promise.all(ALGOS.map((a) => digestHex(a, input))).then((results) => {
      if (cancelled) return;
      const next: Partial<Record<Algo, string>> = {};
      ALGOS.forEach((a, i) => (next[a] = results[i]));
      setHashes(next);
      track("tool_used", { slug: "hash-generator" });
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const hasOutput = Object.keys(hashes).length > 0;

  return (
    <ToolShell
      result={
        hasOutput ? (
          <div className="card" style={{ display: "grid", gap: 14 }}>
            {ALGOS.map((a) => (
              <div key={a}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <strong>{a}</strong>
                  <CopyButton getText={() => hashes[a] ?? ""} />
                </div>
                <code
                  className="mono"
                  style={{
                    display: "block",
                    wordBreak: "break-all",
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                  }}
                >
                  {hashes[a]}
                </code>
              </div>
            ))}
          </div>
        ) : null
      }
    >
      <div className="tc-editor-head">
        <label className="field" htmlFor="hash-input">
          Text to hash
        </label>
        <span className="tc-count">{input ? `${input.length.toLocaleString()} chars` : ""}</span>
      </div>
      <textarea
        id="hash-input"
        className="textarea mono-input"
        placeholder="Type or paste text to hash…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: 140 }}
      />
      <div className="wc-toolbar" style={{ marginTop: 12 }}>
        {!input && (
          <button className="btn btn-sm" onClick={() => setInput("Hello, world!")}>
            Try an example
          </button>
        )}
        {input && (
          <button className="btn btn-sm" onClick={() => setInput("")}>
            Clear
          </button>
        )}
        <span className="tc-count" style={{ marginLeft: "auto" }}>
          Hashes live as you type
        </span>
      </div>
      <p className="privacy-note" style={{ marginTop: 12 }}>
        <span aria-hidden>🔒</span> Computed with SubtleCrypto in your browser — text is never sent
        anywhere.
      </p>
    </ToolShell>
  );
}
