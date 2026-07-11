import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { downloadBlob } from "@/lib/format";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "tp-word-counter-draft";

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return word ? 1 : 0;
  const m = word
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function readingLevel(words: number, sentences: number, syllables: number): string {
  if (words === 0 || sentences === 0) return "—";
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  if (score >= 90) return "Very easy";
  if (score >= 70) return "Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly hard";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [goal, setGoal] = useState(500);
  const [history, setHistory] = useState<string[]>([""]);
  const [hIndex, setHIndex] = useState(0);
  const [findVal, setFindVal] = useState("");
  const [replaceVal, setReplaceVal] = useState("");
  const [showFind, setShowFind] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // load draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setText(saved);
        setHistory([saved]);
      }
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, []);

  // autosave
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text]);

  const commit = useCallback(
    (next: string) => {
      setText(next);
      setHistory((h) => [...h.slice(0, hIndex + 1), next]);
      setHIndex((i) => i + 1);
    },
    [hIndex],
  );

  const undo = () => {
    if (hIndex > 0) {
      setHIndex(hIndex - 1);
      setText(history[hIndex - 1]);
    }
  };
  const redo = () => {
    if (hIndex < history.length - 1) {
      setHIndex(hIndex + 1);
      setText(history[hIndex + 1]);
    }
  };

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const wordsArr = trimmed ? trimmed.split(/\s+/) : [];
    const words = wordsArr.length;
    const unique = new Set(wordsArr.map((w) => w.toLowerCase().replace(/[^a-z0-9]/gi, ""))).size;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length || (trimmed ? 1 : 0);
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((p) => p.trim()).length : 0;
    const syllables = wordsArr.reduce((a, w) => a + countSyllables(w), 0);
    const pages = Math.max(trimmed ? 1 : 0, Math.ceil(words / 500));
    const avgSentence = sentences ? Math.round(words / sentences) : 0;
    return {
      words,
      unique,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      syllables,
      pages,
      avgSentence,
      level: readingLevel(words, sentences, syllables),
      readingTime: (words / 200) * 60,
      speakingTime: (words / 130) * 60,
      wordsArr,
    };
  }, [text]);

  const density = useMemo(() => {
    const stop = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "of",
      "to",
      "in",
      "on",
      "for",
      "is",
      "are",
      "it",
      "with",
      "as",
      "at",
      "by",
      "be",
      "this",
      "that",
    ]);
    const counts = new Map<string, number>();
    for (const w of stats.wordsArr) {
      const key = w.toLowerCase().replace(/[^a-z0-9]/gi, "");
      if (key.length < 3 || stop.has(key)) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, n]) => ({
        word,
        n,
        pct: stats.words ? Math.round((n / stats.words) * 1000) / 10 : 0,
      }));
  }, [stats.wordsArr, stats.words]);

  const goalPct = goal > 0 ? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;

  useEffect(() => {
    if (stats.words > 0) track("tool_used", { slug: "word-counter", words: stats.words });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.words > 0]);

  const cleanText = () =>
    commit(
      text
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/ +\n/g, "\n")
        .trim(),
    );
  const toggleCase = () =>
    commit(text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase());
  const doReplace = () => {
    if (!findVal) return;
    commit(text.split(findVal).join(replaceVal));
  };

  const rows: { label: string; value: string }[] = [
    { label: "Words", value: fmt(stats.words) },
    { label: "Unique words", value: fmt(stats.unique) },
    { label: "Characters", value: fmt(stats.chars) },
    { label: "Characters (no spaces)", value: fmt(stats.charsNoSpaces) },
    { label: "Sentences", value: fmt(stats.sentences) },
    { label: "Avg sentence (words)", value: fmt(stats.avgSentence) },
    { label: "Paragraphs", value: fmt(stats.paragraphs) },
    { label: "Pages", value: fmt(stats.pages) },
    { label: "Syllables", value: fmt(stats.syllables) },
    { label: "Reading level", value: stats.level },
    { label: "Reading time", value: fmtTime(stats.readingTime) },
    { label: "Speaking time", value: fmtTime(stats.speakingTime) },
  ];

  return (
    <div className="wc-grid">
      <aside className="wc-sidebar stack" aria-label="Text statistics" aria-live="polite">
        <div className="card">
          <h3>Details</h3>
          {rows.map((r) => (
            <div className="stat-row" key={r.label}>
              <span style={{ color: "var(--muted)" }}>{r.label}</span>
              <span className="val">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Keyword density</h3>
          {density.length === 0 && (
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>
              Start typing to see your top words.
            </p>
          )}
          {density.map((d) => (
            <div className="stat-row" key={d.word}>
              <span style={{ color: "var(--muted)" }}>{d.word}</span>
              <span className="val">
                {d.n} · {d.pct}%
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Goal</h3>
          <label className="field" htmlFor="wc-goal">
            Target words
          </label>
          <input
            id="wc-goal"
            className="input mono-input"
            type="number"
            min={0}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
          />
          <div
            style={{
              margin: "12px 0 6px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              {stats.words} / {goal}
            </span>
            <span className="mono">{goalPct}%</span>
          </div>
          <div
            className="progress"
            role="meter"
            aria-valuenow={goalPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Goal progress"
          >
            <span style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      </aside>

      <div>
        <div className="wc-toolbar">
          <button className="btn btn-sm" onClick={toggleCase}>
            Case
          </button>
          <button className="btn btn-sm" onClick={cleanText}>
            Clean text
          </button>
          <button className="btn btn-sm" onClick={() => setShowFind((s) => !s)}>
            Find &amp; replace
          </button>
          <button className="btn btn-sm" onClick={undo} disabled={hIndex === 0}>
            Undo
          </button>
          <button className="btn btn-sm" onClick={redo} disabled={hIndex >= history.length - 1}>
            Redo
          </button>
          <label className="btn btn-sm" style={{ cursor: "pointer" }}>
            Upload .txt
            <input
              type="file"
              accept=".txt,text/plain"
              className="visually-hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) commit(await f.text());
                e.target.value = "";
              }}
            />
          </label>
          <button
            className="btn btn-sm"
            onClick={() => {
              downloadBlob(new Blob([text], { type: "text/plain" }), "text.txt");
              track("result_downloaded", { slug: "word-counter" });
            }}
          >
            Download .txt
          </button>
          <button className="btn btn-sm" onClick={() => window.print()}>
            Print
          </button>
          <button className="btn btn-sm" onClick={() => commit("")}>
            Clear
          </button>
        </div>

        {showFind && (
          <div
            className="card"
            style={{
              padding: 14,
              marginBottom: 10,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="field" htmlFor="wc-find">
                Find
              </label>
              <input
                id="wc-find"
                className="input"
                value={findVal}
                onChange={(e) => setFindVal(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="field" htmlFor="wc-replace">
                Replace with
              </label>
              <input
                id="wc-replace"
                className="input"
                value={replaceVal}
                onChange={(e) => setReplaceVal(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={doReplace}>
              Replace all
            </button>
          </div>
        )}

        <label className="visually-hidden" htmlFor="wc-editor">
          Text editor
        </label>
        <textarea
          id="wc-editor"
          ref={taRef}
          className="textarea"
          style={{ minHeight: 460 }}
          placeholder="Start writing or paste your text…"
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setHistory((h) => [...h.slice(0, hIndex + 1), v]);
            setHIndex((i) => i + 1);
          }}
        />
      </div>
    </div>
  );
}
