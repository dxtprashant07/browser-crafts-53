import { useMemo, useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzUwMDAwMDB9.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";

function base64UrlDecode(seg: string): string {
  const b64 = seg.replace(/-/g, "+").replace(/_/g, "/").padEnd(seg.length + ((4 - (seg.length % 4)) % 4), "=");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function formatClaims(json: string): { pretty: string; exp?: number; iat?: number } {
  const obj = JSON.parse(json);
  return { pretty: JSON.stringify(obj, null, 2), exp: obj.exp, iat: obj.iat };
}

function fmtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toString();
}

export default function JwtDecoderTool() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    const token = input.trim();
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { error: "A JWT has three dot-separated parts: header.payload.signature." };
    }
    try {
      const header = formatClaims(base64UrlDecode(parts[0]));
      const payload = formatClaims(base64UrlDecode(parts[1]));
      track("tool_used", { slug: "jwt-decoder" });
      return { header: header.pretty, payload: payload.pretty, exp: payload.exp, iat: payload.iat };
    } catch {
      return { error: "Couldn't decode this token — check it was copied in full and is base64url encoded." };
    }
  }, [input]);

  const now = Date.now() / 1000;
  const expired = result && "exp" in result && result.exp ? result.exp < now : undefined;

  return (
    <ToolShell
      result={
        result && !("error" in result) ? (
          <div className="card" style={{ display: "grid", gap: 16 }}>
            {result.exp !== undefined && (
              <div className={`notice ${expired ? "notice-error" : "notice-success"}`}>
                <span aria-hidden>{expired ? "⚠️" : "✅"}</span>
                <span>
                  {expired ? "Expired" : "Valid until"} {fmtDate(result.exp)}
                </span>
              </div>
            )}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <strong>Header</strong>
                <CopyButton getText={() => result.header} />
              </div>
              <pre className="textarea mono-input" style={{ minHeight: 80, margin: 0 }}>
                {result.header}
              </pre>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <strong>Payload</strong>
                <CopyButton getText={() => result.payload} />
              </div>
              <pre className="textarea mono-input" style={{ minHeight: 160, margin: 0 }}>
                {result.payload}
              </pre>
            </div>
            <p className="privacy-note">
              <span aria-hidden>🔒</span> Decoded entirely in your browser — no signature
              verification is performed, and the token is never sent anywhere.
            </p>
          </div>
        ) : null
      }
    >
      <div className="tc-editor-head">
        <label className="field" htmlFor="jwt-input">
          JWT to decode
        </label>
        <span className="tc-count">{input ? `${input.trim().length.toLocaleString()} chars` : ""}</span>
      </div>
      <textarea
        id="jwt-input"
        className="textarea mono-input"
        placeholder="eyJhbGciOiJIUzI1NiIs...header.payload.signature"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: 140 }}
      />
      <div className="wc-toolbar" style={{ marginTop: 12 }}>
        {!input && (
          <button className="btn btn-sm" onClick={() => setInput(EXAMPLE)}>
            Try an example
          </button>
        )}
        {input && (
          <button className="btn btn-sm" onClick={() => setInput("")}>
            Clear
          </button>
        )}
        <span className="tc-count" style={{ marginLeft: "auto" }}>
          Decodes live as you type
        </span>
      </div>
      {result && "error" in result && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{result.error}</ErrorNotice>
        </div>
      )}
    </ToolShell>
  );
}
