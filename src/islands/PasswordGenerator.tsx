import { useCallback, useEffect, useState } from "react";
import { CopyButton, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

type SetKey = keyof typeof SETS;

function generate(length: number, active: SetKey[]): string {
  const pool = active.map((k) => SETS[k]).join("");
  if (!pool) return "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[values[i] % pool.length];
  return out;
}

function strength(pw: string, active: number): { label: string; pct: number; color: string } {
  const bits = pw.length * Math.log2(active > 0 ? SETS.upper.length : 1) * 0.6;
  const score = Math.min(100, Math.round(pw.length * 4 + active * 8));
  if (score < 40) return { label: "Weak", pct: score, color: "var(--error)" };
  if (score < 70) return { label: "Fair", pct: score, color: "var(--accent)" };
  void bits;
  return { label: "Strong", pct: score, color: "var(--success)" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [sets, setSets] = useState<Record<SetKey, boolean>>({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  const active = (Object.keys(sets) as SetKey[]).filter((k) => sets[k]);

  const regen = useCallback(() => {
    const pw = generate(length, active.length ? active : ["lower"]);
    setPassword(pw);
    track("tool_used", { slug: "password-generator", length });
  }, [length, active]);

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, sets]);

  const s = strength(password, active.length);

  return (
    <ToolShell>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, padding: 16 }}>
        <code className="mono" style={{ fontSize: "1.15rem", wordBreak: "break-all", flex: 1 }} aria-live="polite">
          {password || "…"}
        </code>
        <CopyButton getText={() => password} />
        <button className="icon-btn" onClick={regen} aria-label="Regenerate password" title="Regenerate">
          ↻
        </button>
      </div>

      <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Strength</span>
        <span className="mono" style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
      </div>
      <div className="progress" role="meter" aria-valuenow={s.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
        <span style={{ width: `${s.pct}%`, background: s.color }} />
      </div>

      <div style={{ marginTop: 20 }}>
        <label className="field" htmlFor="pw-length">
          Length: <span className="mono">{length}</span>
        </label>
        <input
          id="pw-length"
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>

      <div className="wc-toolbar" style={{ marginTop: 12 }}>
        {(Object.keys(SETS) as SetKey[]).map((k) => (
          <label
            key={k}
            className="btn btn-sm"
            style={{ cursor: "pointer", background: sets[k] ? "var(--card)" : "var(--bg)" }}
          >
            <input
              type="checkbox"
              checked={sets[k]}
              onChange={(e) => setSets((s) => ({ ...s, [k]: e.target.checked }))}
              style={{ marginRight: 6 }}
            />
            {k === "upper" ? "A-Z" : k === "lower" ? "a-z" : k === "numbers" ? "0-9" : "!@#"}
          </label>
        ))}
      </div>
    </ToolShell>
  );
}
