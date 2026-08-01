import { useCallback, useEffect, useState } from "react";
import { CopyButton, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

function makeUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const format = useCallback(
    (u: string) => {
      let out = hyphens ? u : u.replace(/-/g, "");
      if (uppercase) out = out.toUpperCase();
      return out;
    },
    [hyphens, uppercase],
  );

  const regen = useCallback(() => {
    setUuids(Array.from({ length: count }, makeUuid));
    track("tool_used", { slug: "uuid-generator", count });
  }, [count]);

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const formatted = uuids.map(format);

  return (
    <ToolShell
      result={
        formatted.length ? (
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
              <strong>
                {formatted.length} UUID{formatted.length > 1 ? "s" : ""}
              </strong>
              <CopyButton getText={() => formatted.join("\n")} label="Copy all" />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {formatted.map((u, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                  className="mono"
                >
                  <code style={{ flex: 1, wordBreak: "break-all" }}>{u}</code>
                  <CopyButton getText={() => u} />
                </div>
              ))}
            </div>
          </div>
        ) : null
      }
    >
      <div style={{ marginBottom: 20 }}>
        <label className="field" htmlFor="uuid-count">
          Count: <span className="mono">{count}</span>
        </label>
        <input
          id="uuid-count"
          type="range"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>
      <div className="wc-toolbar">
        <label className="btn btn-sm" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Hyphens
        </label>
        <label className="btn btn-sm" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          UPPERCASE
        </label>
        <button className="btn btn-sm" onClick={regen} style={{ marginLeft: "auto" }}>
          ↻ Regenerate
        </button>
      </div>
      <p className="privacy-note" style={{ marginTop: 12 }}>
        <span aria-hidden>🔒</span> Generated with crypto.randomUUID — nothing leaves your device.
      </p>
    </ToolShell>
  );
}
