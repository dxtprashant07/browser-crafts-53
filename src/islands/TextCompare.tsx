import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import {
  diffTokens,
  diffStats,
  lineRowStats,
  buildLineRows,
  unifiedTextFromRows,
  tokenizeChars,
  tokenizeWords,
  tokenizeLines,
  type DiffOp,
  type LineRow,
} from "@/lib/diff";
import { track } from "@/lib/analytics";

type ViewMode = "normal" | "developer";
type Mode = "words" | "lines" | "chars";

const EXAMPLE_ORIGINAL = `Our team will launch the new dashboard in March.
It includes reports, charts and CSV export.
Beta users get early access two weeks before release.
Pricing stays the same for existing customers.`;

const EXAMPLE_CHANGED = `Our team will launch the new dashboard in April.
It includes reports, charts, alerts and PDF export.
Beta users get early access two weeks before release.
Pricing increases 10% for new customers.
Legacy plans will be retired by the end of the year.`;

function tokenize(text: string, mode: Mode): string[] {
  if (mode === "chars") return tokenizeChars(text);
  if (mode === "lines") return tokenizeLines(text);
  return tokenizeWords(text);
}

function buildKey(
  ignoreCase: boolean,
  ignoreWhitespace: boolean,
): ((s: string) => string) | undefined {
  if (!ignoreCase && !ignoreWhitespace) return undefined;
  return (s: string) => {
    let v = s;
    if (ignoreWhitespace) v = v.trim().replace(/\s+/g, " ");
    if (ignoreCase) v = v.toLowerCase();
    return v;
  };
}

function asUnifiedText(ops: DiffOp[]): string {
  const lines: string[] = [];
  for (const op of ops) {
    const prefix = op.type === "add" ? "+ " : op.type === "remove" ? "- " : "  ";
    for (const line of op.value.split("\n")) lines.push(prefix + line);
  }
  return lines.join("\n");
}

function InlineDiff({ ops }: { ops: DiffOp[] }) {
  return (
    <div className="diff-view">
      {ops.map((op, i) =>
        op.type === "equal" ? (
          <span key={i}>{op.value}</span>
        ) : (
          <span key={i} className={op.type === "add" ? "diff-add" : "diff-remove"}>
            {op.value}
          </span>
        ),
      )}
    </div>
  );
}

function LineDiff({ ops }: { ops: DiffOp[] }) {
  const rows: { type: DiffOp["type"]; text: string }[] = [];
  for (const op of ops) {
    for (const text of op.value.split("\n")) rows.push({ type: op.type, text });
  }
  return (
    <div className="diff-lines">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`diff-line ${row.type === "add" ? "diff-add" : row.type === "remove" ? "diff-remove" : ""}`}
        >
          <span className="marker">
            {row.type === "add" ? "+" : row.type === "remove" ? "-" : " "}
          </span>
          <span>{row.text || " "}</span>
        </div>
      ))}
    </div>
  );
}

function InlineWords({ ops, side }: { ops: DiffOp[]; side: "a" | "b" }) {
  return (
    <>
      {ops.map((op, i) => {
        if (op.type === "equal") return <span key={i}>{op.value}</span>;
        if (side === "a" && op.type === "remove")
          return (
            <span key={i} className="diff-remove">
              {op.value}
            </span>
          );
        if (side === "b" && op.type === "add")
          return (
            <span key={i} className="diff-add">
              {op.value}
            </span>
          );
        return null;
      })}
    </>
  );
}

// Side-by-side (developer-mode) split view, in the style of GitHub's split
// diff and text-compare.com: line numbers on both sides, whole added/removed
// lines colored solid, and modified line pairs showing exactly which words
// changed within the line rather than just the whole line.
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
              <div className="cell diff-modify-remove">
                <InlineWords ops={row.wordDiff} side="a" />
              </div>
              <div className="cell lineno">{row.bLine}</div>
              <div className="cell diff-modify-add">
                <InlineWords ops={row.wordDiff} side="b" />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

type Result =
  { kind: "normal"; ops: DiffOp[]; mode: Mode } | { kind: "developer"; rows: LineRow[] };

function counts(text: string): string {
  const lines = text ? text.split("\n").length : 0;
  return `${lines.toLocaleString()} lines · ${text.length.toLocaleString()} chars`;
}

const CLEANUPS: { label: string; fn: (s: string) => string }[] = [
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "Sort lines", fn: (s) => s.split("\n").sort().join("\n") },
  {
    label: "Trim spaces",
    fn: (s) =>
      s
        .replace(/[ \t]+/g, " ")
        .replace(/ +$/gm, "")
        .trim(),
  },
  { label: "Join lines", fn: (s) => s.replace(/\n+/g, " ") },
];

export default function TextCompare() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [mode, setMode] = useState<Mode>("words");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const runCompare = useCallback(
    (o: string, c: string) => {
      if (!o && !c) {
        setError("Paste some text in both boxes first — or load the example below.");
        setResult(null);
        return;
      }
      setError("");
      if (viewMode === "developer") {
        const lineKey = buildKey(ignoreCase, ignoreWhitespace);
        const wordKey = ignoreCase ? (s: string) => s.toLowerCase() : undefined;
        const rows = buildLineRows(tokenizeLines(o), tokenizeLines(c), lineKey, wordKey);
        setResult({ kind: "developer", rows });
      } else {
        const ops = diffTokens(tokenize(o, mode), tokenize(c, mode), mode === "lines" ? "\n" : "");
        setResult({ kind: "normal", ops, mode });
      }
      track("tool_used", {
        slug: "text-compare",
        view: viewMode,
        mode: viewMode === "normal" ? mode : undefined,
      });
    },
    [viewMode, mode, ignoreCase, ignoreWhitespace],
  );

  const compare = useCallback(() => runCompare(original, changed), [runCompare, original, changed]);

  const swap = useCallback(() => {
    setOriginal(changed);
    setChanged(original);
    if (result) runCompare(changed, original);
  }, [original, changed, result, runCompare]);

  const clear = useCallback(() => {
    setOriginal("");
    setChanged("");
    setResult(null);
    setError("");
  }, []);

  const applyCleanup = (fn: (s: string) => string) => {
    const o = fn(original);
    const c = fn(changed);
    setOriginal(o);
    setChanged(c);
    if (result) runCompare(o, c);
  };

  const loadExample = () => {
    setOriginal(EXAMPLE_ORIGINAL);
    setChanged(EXAMPLE_CHANGED);
    setError("");
    runCompare(EXAMPLE_ORIGINAL, EXAMPLE_CHANGED);
  };

  // Ctrl+Alt+C compare · Ctrl+Alt+S swap · Ctrl+Alt+R clear (same shortcuts
  // people know from text-compare.com)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "c") {
        e.preventDefault();
        compare();
      } else if (k === "s") {
        e.preventDefault();
        swap();
      } else if (k === "r") {
        e.preventDefault();
        clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compare, swap, clear]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  const stats =
    result?.kind === "normal"
      ? diffStats(
          result.ops,
          result.mode === "chars" ? "chars" : result.mode === "lines" ? "lines" : "words",
        )
      : result?.kind === "developer"
        ? lineRowStats(result.rows)
        : null;

  const unit =
    result?.kind === "developer"
      ? "line"
      : result?.kind === "normal"
        ? result.mode.replace(/s$/, "")
        : "";
  const differences = stats ? stats.additions + stats.removals : 0;

  const copyText = () =>
    result?.kind === "normal"
      ? asUnifiedText(result.ops)
      : result?.kind === "developer"
        ? unifiedTextFromRows(result.rows)
        : "";

  return (
    <ToolShell
      result={
        result ? (
          <div className="card" ref={resultRef}>
            <div className="tc-summary">
              <span className="tc-diff-count">
                {differences === 0
                  ? "No differences — the texts match!"
                  : `${differences.toLocaleString()} difference${differences === 1 ? "" : "s"}`}
              </span>
              {differences > 0 && (
                <>
                  <span className="tc-chip add">
                    +{stats!.additions.toLocaleString()} added {unit}
                    {stats!.additions === 1 ? "" : "s"}
                  </span>
                  <span className="tc-chip remove">
                    −{stats!.removals.toLocaleString()} removed {unit}
                    {stats!.removals === 1 ? "" : "s"}
                  </span>
                </>
              )}
              <span style={{ marginLeft: "auto" }}>
                <CopyButton getText={copyText} label="Copy diff" />
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
              {result.kind === "developer" ? (
                <SplitDiff rows={result.rows} />
              ) : result.mode === "lines" ? (
                <LineDiff ops={result.ops} />
              ) : (
                <InlineDiff ops={result.ops} />
              )}
            </div>
          </div>
        ) : null
      }
    >
      <div className="tc-editors">
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="tc-original">
              Original text
            </label>
            <span className="tc-count">{counts(original)}</span>
          </div>
          <textarea
            id="tc-original"
            className="textarea tc-textarea"
            placeholder="Paste the original version here…"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <div className="tc-editor-head">
            <label className="field" htmlFor="tc-changed">
              Changed text
            </label>
            <span className="tc-count">{counts(changed)}</span>
          </div>
          <textarea
            id="tc-changed"
            className="textarea tc-textarea"
            placeholder="Paste the changed version here…"
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="tc-toolrow">
        <span className="label">Quick clean-up (both sides):</span>
        {CLEANUPS.map((c) => (
          <button
            key={c.label}
            className="btn btn-sm"
            onClick={() => applyCleanup(c.fn)}
            disabled={!original && !changed}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="tc-toolrow" style={{ marginTop: 16 }}>
        <span className="label">View:</span>
        <Segmented
          ariaLabel="View mode"
          value={viewMode}
          onChange={(v) => {
            setViewMode(v);
            setResult(null);
          }}
          options={[
            { value: "normal", label: "Normal" },
            { value: "developer", label: "Developer" },
          ]}
        />
        {viewMode === "normal" ? (
          <>
            <span className="label" style={{ marginLeft: 10 }}>
              Compare by:
            </span>
            <Segmented
              ariaLabel="Diff granularity"
              value={mode}
              onChange={setMode}
              options={[
                { value: "words", label: "Words" },
                { value: "lines", label: "Lines" },
                { value: "chars", label: "Characters" },
              ]}
            />
          </>
        ) : (
          <>
            <label className="btn btn-sm" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Ignore case
            </label>
            <label className="btn btn-sm" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Ignore whitespace
            </label>
          </>
        )}
      </div>

      <div className="tc-actions">
        <button className="btn btn-primary tc-compare-btn" onClick={compare}>
          Compare
        </button>
        <button className="btn" onClick={swap} disabled={!original && !changed}>
          ⇄ Swap
        </button>
        <button className="btn" onClick={clear} disabled={!original && !changed}>
          Clear
        </button>
        {!original && !changed && (
          <button className="btn" onClick={loadExample}>
            Try an example
          </button>
        )}
        <span className="tc-kbd-hint">
          <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd> compare · <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+
          <kbd>S</kbd> swap · <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd> clear
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
