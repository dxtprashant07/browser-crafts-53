import { Fragment, useEffect, useRef, useState } from "react";
import { CopyButton, ErrorNotice, Segmented, ToolShell } from "@/components/ToolKit";
import { runRegexJob, RegexTimeoutError } from "@/lib/workers";
import type { RegexMatch } from "@/workers/regex.worker";
import { track } from "@/lib/analytics";

const FLAGS: { flag: string; label: string }[] = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
];

const EXAMPLE_PATTERN = "(?<user>\\w+)@(?<domain>\\w+\\.\\w+)";
const EXAMPLE_TEXT = "Contact sam@acme.com or support@acme.io — not admin@localhost.";
const EXAMPLE_REPLACE = "$<user> [at] $<domain>";

const CHEATS: { tok: string; desc: string }[] = [
  { tok: "\\d \\w \\s", desc: "digit / word char / whitespace" },
  { tok: "\\D \\W \\S", desc: "negated versions" },
  { tok: ". ^ $", desc: "any char / start / end" },
  { tok: "* + ?", desc: "0+ / 1+ / 0 or 1" },
  { tok: "{n} {n,} {n,m}", desc: "exact / at least / range" },
  { tok: "[abc] [^abc]", desc: "char set / negated set" },
  { tok: "(…) (?:…)", desc: "capture / non-capture group" },
  { tok: "(?<name>…)", desc: "named capture group" },
  { tok: "a|b", desc: "alternation (a or b)" },
  { tok: "\\b \\B", desc: "word / non-word boundary" },
  { tok: "(?=…) (?!…)", desc: "lookahead / negative lookahead" },
  { tok: "(?<=…) (?<!…)", desc: "lookbehind / negative lookbehind" },
];

type UIMode = "match" | "replace";

function segments(text: string, matches: RegexMatch[]) {
  const out: { text: string; hit: boolean }[] = [];
  let pos = 0;
  for (const m of matches) {
    if (m.match.length === 0) continue;
    if (m.index > pos) out.push({ text: text.slice(pos, m.index), hit: false });
    out.push({ text: text.slice(m.index, m.index + m.match.length), hit: true });
    pos = m.index + m.match.length;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), hit: false });
  return out;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<UIMode>("match");
  const [replacement, setReplacement] = useState("");

  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [replaced, setReplaced] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const trackedRef = useRef(false);

  // Debounced, off-thread evaluation with a catastrophic-backtracking guard.
  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setReplaced(undefined);
      setError("");
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await runRegexJob({
          pattern,
          flags,
          text,
          replacement: mode === "replace" ? replacement : undefined,
        });
        if (cancelled) return;
        setMatches(res.matches ?? []);
        setReplaced(res.replaced);
        setError("");
        if (!trackedRef.current) {
          track("tool_used", { slug: "regex-tester" });
          trackedRef.current = true;
        }
      } catch (e) {
        if (cancelled) return;
        setMatches([]);
        setReplaced(undefined);
        setError(
          e instanceof RegexTimeoutError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Invalid regular expression",
        );
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pattern, flags, text, mode, replacement]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, "") : prev + flag));
  };

  const loadExample = () => {
    setPattern(EXAMPLE_PATTERN);
    setText(EXAMPLE_TEXT);
    setReplacement(EXAMPLE_REPLACE);
    setFlags("g");
  };

  const hasGroups = matches.some((m) => m.groups.length > 0);
  const valid = !error;

  return (
    <ToolShell
      result={
        pattern && valid ? (
          <div className="card">
            <div className="tc-summary">
              <span className="tc-diff-count">
                {matches.length === 0
                  ? "No matches"
                  : `${matches.length.toLocaleString()} match${matches.length === 1 ? "" : "es"}`}
              </span>
              {matches.length > 0 && (
                <span className="tc-chip add">
                  {new Set(matches.flatMap((m) => Object.keys(m.named))).size} named group
                  {new Set(matches.flatMap((m) => Object.keys(m.named))).size === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {mode === "replace" ? (
              <>
                <div className="tc-editor-head">
                  <label className="field">Result</label>
                  {replaced !== undefined && (
                    <CopyButton getText={() => replaced} label="Copy result" />
                  )}
                </div>
                <textarea
                  className="textarea"
                  readOnly
                  value={replaced ?? ""}
                  aria-label="Replacement result"
                  style={{ minHeight: 140 }}
                />
                <p className="tc-count" style={{ marginTop: 8 }}>
                  Use <span className="mono">$1</span>, <span className="mono">$&lt;name&gt;</span>,{" "}
                  <span className="mono">$&amp;</span> (whole match) in the replacement.
                </p>
              </>
            ) : (
              text && (
                <div className="regex-preview" aria-label="Match preview">
                  {segments(text, matches).map((s, i) =>
                    s.hit ? (
                      <mark key={i} className="regex-match">
                        {s.text}
                      </mark>
                    ) : (
                      <span key={i}>{s.text}</span>
                    ),
                  )}
                </div>
              )
            )}

            {matches.length > 0 && (
              <div style={{ marginTop: 14, overflowX: "auto" }}>
                <table className="regex-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Match</th>
                      <th>Index</th>
                      {hasGroups && <th>Groups</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {matches.slice(0, 200).map((m, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="mono">{m.match || "∅"}</td>
                        <td className="mono">{m.index}</td>
                        {hasGroups && (
                          <td className="mono">
                            {m.groups.length === 0 && Object.keys(m.named).length === 0 && "—"}
                            {m.groups.map((g, gi) => (
                              <Fragment key={`p${gi}`}>
                                <span className="regex-group">
                                  ${gi + 1}: {g ?? "∅"}
                                </span>{" "}
                              </Fragment>
                            ))}
                            {Object.entries(m.named).map(([name, val]) => (
                              <Fragment key={`n${name}`}>
                                <span className="regex-group named">
                                  {name}: {val || "∅"}
                                </span>{" "}
                              </Fragment>
                            ))}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {matches.length > 200 && (
                  <p className="tc-count" style={{ marginTop: 8 }}>
                    Showing first 200 of {matches.length.toLocaleString()} matches.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="tc-editor-head">
        <label className="field" htmlFor="re-pattern">
          Regular expression
        </label>
        {pattern && valid && (
          <CopyButton getText={() => `/${pattern}/${flags}`} label="Copy /regex/" />
        )}
      </div>
      <div className="regex-input-row">
        <span className="regex-slash">/</span>
        <input
          id="re-pattern"
          className="input mono-input"
          placeholder="(?<year>\d{4})-(\d{2})"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
        />
        <span className="regex-slash">/{flags}</span>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      <div className="wc-toolbar" style={{ marginTop: 12 }}>
        {FLAGS.map((f) => (
          <label
            key={f.flag}
            className="btn btn-sm"
            style={{
              cursor: "pointer",
              background: flags.includes(f.flag) ? "var(--card)" : "var(--bg)",
            }}
            title={f.label}
          >
            <input
              type="checkbox"
              checked={flags.includes(f.flag)}
              onChange={() => toggleFlag(f.flag)}
              style={{ marginRight: 6 }}
            />
            {f.flag} <span className="tc-count">· {f.label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "match", label: "Match" },
            { value: "replace", label: "Replace" },
          ]}
        />
      </div>

      {mode === "replace" && (
        <div style={{ marginTop: 12 }}>
          <label className="field" htmlFor="re-replace">
            Replacement
          </label>
          <input
            id="re-replace"
            className="input mono-input"
            placeholder="$<year> / $1"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      <div className="tc-editor-head" style={{ marginTop: 16 }}>
        <label className="field" htmlFor="re-text">
          Test string
        </label>
        {!pattern && !text && (
          <button className="btn btn-sm" onClick={loadExample}>
            Try an example
          </button>
        )}
      </div>
      <textarea
        id="re-text"
        className="textarea"
        style={{ minHeight: 180 }}
        placeholder="Paste text to test against the pattern…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />

      <details className="regex-cheat">
        <summary>Cheat sheet</summary>
        <div className="regex-cheat-grid">
          {CHEATS.map((c) => (
            <div key={c.tok} className="regex-cheat-item">
              <code>{c.tok}</code>
              <span>{c.desc}</span>
            </div>
          ))}
        </div>
      </details>
    </ToolShell>
  );
}
