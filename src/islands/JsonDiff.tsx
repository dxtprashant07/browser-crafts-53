import { Fragment, useRef, useState } from "react";
import { CopyButton, ErrorNotice, ToolShell } from "@/components/ToolKit";
import {
  buildLineRows,
  lineRowStats,
  unifiedTextFromRows,
  tokenizeLines,
  type LineRow,
} from "@/lib/diff";
import { track } from "@/lib/analytics";

const EXAMPLE_A = `{
  "name": "widget",
  "version": 1,
  "tags": ["a", "b"],
  "meta": { "active": true, "owner": "sam" }
}`;

const EXAMPLE_B = `{
  "version": 2,
  "name": "widget",
  "tags": ["a", "c"],
  "meta": { "owner": "sam", "active": false, "notes": "updated" }
}`;

// Recursively sort object keys so a pure key-reordering doesn't show as a diff —
// the comparison is structural, not textual.
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function normalize(text: string): string {
  return JSON.stringify(sortKeys(JSON.parse(text)), null, 2);
}

function counts(text: string): string {
  const lines = text ? text.split("\n").length : 0;
  return `${lines.toLocaleString()} lines · ${text.length.toLocaleString()} chars`;
}

function SplitDiff({ rows }: { rows: LineRow[] }) {
  return (
    <div className="diff-split-wrap">
      <div className="diff-split">
        {rows.map((row, i) => {
          if (row.kind === "equal") {
            return (
              <Fragment key={i}>
                <div className="cell lineno">{row.aLine}</div>
                <div className="cell">{row.text}</div>
                <div className="cell lineno">{row.bLine}</div>
                <div className="cell">{row.text}</div>
              </Fragment>
            );
          }
          if (row.kind === "remove") {
            return (
              <Fragment key={i}>
                <div className="cell lineno">{row.aLine}</div>
                <div className="cell diff-remove">{row.text}</div>
                <div className="cell lineno empty" />
                <div className="cell empty" />
              </Fragment>
            );
          }
          if (row.kind === "add") {
            return (
              <Fragment key={i}>
                <div className="cell lineno empty" />
                <div className="cell empty" />
                <div className="cell lineno">{row.bLine}</div>
                <div className="cell diff-add">{row.text}</div>
              </Fragment>
            );
          }
          return (
            <Fragment key={i}>
              <div className="cell lineno">{row.aLine}</div>
              <div className="cell diff-modify-remove">{row.aText}</div>
              <div className="cell lineno">{row.bLine}</div>
              <div className="cell diff-modify-add">{row.bText}</div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<LineRow[] | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const compare = () => {
    if (!left.trim() || !right.trim()) {
      setError("Paste JSON in both boxes — or load the example.");
      setRows(null);
      return;
    }
    let a: string, b: string;
    try {
      a = normalize(left);
    } catch {
      setError("Left side isn't valid JSON.");
      setRows(null);
      return;
    }
    try {
      b = normalize(right);
    } catch {
      setError("Right side isn't valid JSON.");
      setRows(null);
      return;
    }
    setError("");
    setRows(buildLineRows(tokenizeLines(a), tokenizeLines(b)));
    track("tool_used", { slug: "json-diff" });
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const swap = () => {
    setLeft(right);
    setRight(left);
    setRows(null);
  };

  const clear = () => {
    setLeft("");
    setRight("");
    setRows(null);
    setError("");
  };

  const stats = rows ? lineRowStats(rows) : null;
  const diffs = stats ? stats.additions + stats.removals : 0;

  return (
    <ToolShell
      result={
        rows ? (
          <div className="card" ref={resultRef}>
            <div className="tc-summary">
              <span className="tc-diff-count">
                {diffs === 0
                  ? "Identical — the two JSON documents match"
                  : `${diffs.toLocaleString()} line difference${diffs === 1 ? "" : "s"}`}
              </span>
              {diffs > 0 && (
                <>
                  <span className="tc-chip add">+{stats!.additions.toLocaleString()}</span>
                  <span className="tc-chip remove">−{stats!.removals.toLocaleString()}</span>
                </>
              )}
              <span style={{ marginLeft: "auto" }}>
                <CopyButton getText={() => unifiedTextFromRows(rows)} label="Copy diff" />
              </span>
            </div>
            <div className="tc-similarity">
              <div
                className="progress"
                role="meter"
                aria-valuenow={stats!.similarity}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Similarity"
              >
                <span style={{ width: `${stats!.similarity}%`, background: "var(--success)" }} />
              </div>
              <span className="pct">{stats!.similarity}% similar</span>
            </div>
            <div style={{ maxHeight: 560, overflow: "auto" }}>
              <SplitDiff rows={rows} />
            </div>
          </div>
        ) : null
      }
    >
      <div className="tc-editors">
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="jd-left">
              Original JSON
            </label>
            <span className="tc-count">{counts(left)}</span>
          </div>
          <textarea
            id="jd-left"
            className="textarea tc-textarea mono-input"
            placeholder="Paste the original JSON…"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="jd-right">
              Changed JSON
            </label>
            <span className="tc-count">{counts(right)}</span>
          </div>
          <textarea
            id="jd-right"
            className="textarea tc-textarea mono-input"
            placeholder="Paste the changed JSON…"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <div className="tc-actions">
        <button className="btn btn-primary tc-compare-btn" onClick={compare}>
          Compare
        </button>
        <button className="btn" onClick={swap} disabled={!left && !right}>
          ⇄ Swap
        </button>
        <button className="btn" onClick={clear} disabled={!left && !right}>
          Clear
        </button>
        {!left && !right && (
          <button
            className="btn"
            onClick={() => {
              setLeft(EXAMPLE_A);
              setRight(EXAMPLE_B);
              setError("");
            }}
          >
            Try an example
          </button>
        )}
        <span className="tc-count" style={{ marginLeft: "auto" }}>
          Keys are sorted, so reordering isn't flagged
        </span>
      </div>
    </ToolShell>
  );
}
