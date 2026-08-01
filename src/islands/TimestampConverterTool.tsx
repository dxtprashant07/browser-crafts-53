import { useMemo, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { track } from "@/lib/analytics";

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function toLocalInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimestampConverterTool() {
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [timestamp, setTimestamp] = useState("");
  const [dateInput, setDateInput] = useState("");

  const fromTimestamp = useMemo(() => {
    if (!timestamp.trim()) return null;
    const n = Number(timestamp.trim());
    if (!Number.isFinite(n)) return { error: "Enter a numeric Unix timestamp." };
    const ms = unit === "seconds" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { error: "That timestamp is out of range." };
    track("tool_used", { slug: "timestamp-converter", direction: "to-date" });
    return {
      iso: d.toISOString(),
      local: d.toString(),
      utc: d.toUTCString(),
      relative: relativeTime(d),
    };
  }, [timestamp, unit]);

  const fromDate = useMemo(() => {
    if (!dateInput.trim()) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return { error: "Enter a valid date." };
    track("tool_used", { slug: "timestamp-converter", direction: "to-timestamp" });
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    };
  }, [dateInput]);

  function relativeTime(d: Date): string {
    const diffMs = d.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const units: [number, string][] = [
      [1000, "second"],
      [60000, "minute"],
      [3600000, "hour"],
      [86400000, "day"],
      [2592000000, "month"],
      [31536000000, "year"],
    ];
    let best: [number, string] = units[0];
    for (const u of units) if (abs >= u[0]) best = u;
    const value = Math.round(diffMs / best[0]);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    return rtf.format(value, best[1] as Intl.RelativeTimeFormatUnit);
  }

  const setNow = () => {
    const now = Date.now();
    setTimestamp(unit === "seconds" ? String(Math.floor(now / 1000)) : String(now));
  };

  const setDateNow = () => setDateInput(toLocalInputValue(new Date()));

  return (
    <ToolShell>
      <div style={{ marginBottom: 20 }}>
        <div className="tc-editor-head">
          <label className="field" htmlFor="ts-input">
            Unix timestamp → Date
          </label>
          <Segmented
            ariaLabel="Unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "seconds", label: "Seconds" },
              { value: "milliseconds", label: "Milliseconds" },
            ]}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="ts-input"
            className="input mono"
            placeholder={unit === "seconds" ? "1735000000" : "1735000000000"}
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sm" onClick={setNow}>
            Now
          </button>
        </div>
        {fromTimestamp && "error" in fromTimestamp && (
          <div style={{ marginTop: 10 }}>
            <ErrorNotice>{fromTimestamp.error}</ErrorNotice>
          </div>
        )}
        {fromTimestamp && !("error" in fromTimestamp) && (
          <div className="card" style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <Row label="Local" value={fromTimestamp.local} />
            <Row label="UTC" value={fromTimestamp.utc} />
            <Row label="ISO 8601" value={fromTimestamp.iso} />
            <Row label="Relative" value={fromTimestamp.relative} />
          </div>
        )}
      </div>

      <div>
        <div className="tc-editor-head">
          <label className="field" htmlFor="date-input">
            Date → Unix timestamp
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="date-input"
            type="datetime-local"
            className="input mono"
            step={1}
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-sm" onClick={setDateNow}>
            Now
          </button>
        </div>
        {fromDate && "error" in fromDate && (
          <div style={{ marginTop: 10 }}>
            <ErrorNotice>{fromDate.error}</ErrorNotice>
          </div>
        )}
        {fromDate && !("error" in fromDate) && (
          <div className="card" style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <Row label="Seconds" value={String(fromDate.seconds)} />
            <Row label="Milliseconds" value={String(fromDate.milliseconds)} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 90, color: "var(--muted)", fontSize: "0.85rem" }}>{label}</span>
      <code className="mono" style={{ flex: 1, wordBreak: "break-all" }}>
        {value}
      </code>
      <CopyButton getText={() => value} />
    </div>
  );
}
