// Myers O(ND) shortest-edit-script diff — the same core algorithm used by
// git diff and jsdiff. Operates on arrays of tokens (chars, words, or
// lines) so the same implementation drives every granularity.

export type DiffType = "equal" | "add" | "remove";
export interface DiffOp {
  type: DiffType;
  value: string;
}

export interface Move {
  type: DiffType;
  aIdx?: number;
  bIdx?: number;
}

// Bounds worst-case work at roughly O((n+m) * MAX_D). Real-world comparisons
// (two drafts of the same document) have an edit distance far below this;
// only near-totally-unrelated inputs would hit the cap, in which case we
// fall back to a single remove-all/add-all pair instead of hanging the tab.
const MAX_D = 4000;

function shortestEdit(a: string[], b: string[]): { trace: Map<number, number>[]; found: boolean } {
  const n = a.length;
  const m = b.length;
  const max = Math.min(n + m, MAX_D);
  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];

  for (let d = 0; d <= max; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))) {
        x = v.get(k + 1) ?? 0;
      } else {
        x = (v.get(k - 1) ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) {
        return { trace, found: true };
      }
    }
  }
  return { trace, found: false };
}

function backtrack(a: string[], b: string[], trace: Map<number, number>[]): Move[] {
  const moves: Move[] = [];
  let x = a.length;
  let y = b.length;

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const prevK =
      k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0)) ? k + 1 : k - 1;
    const prevX = v.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      moves.push({ type: "equal", aIdx: x - 1, bIdx: y - 1 });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) moves.push({ type: "add", bIdx: y - 1 });
      else moves.push({ type: "remove", aIdx: x - 1 });
    }
    x = prevX;
    y = prevY;
  }
  return moves.reverse();
}

// `equalsKey` maps each token to the value actually compared for equality —
// e.g. lowercased or whitespace-collapsed — while moves still index into the
// original arrays, so callers can render the untouched source text even when
// matching ignored case or whitespace differences.
export function computeMoves(a: string[], b: string[], equalsKey?: (s: string) => string): Move[] {
  if (a.length === 0 && b.length === 0) return [];
  const key = equalsKey ?? ((s: string) => s);
  const ka = a.map(key);
  const kb = b.map(key);

  const { trace, found } = shortestEdit(ka, kb);
  return found
    ? backtrack(ka, kb, trace)
    : [
        ...a.map((_, i): Move => ({ type: "remove", aIdx: i })),
        ...b.map((_, i): Move => ({ type: "add", bIdx: i })),
      ];
}

// `joiner` is re-inserted between consecutive same-type tokens when merging
// them into one run — "" for chars/words (whitespace is already its own
// token), "\n" for lines (each line token holds no newline of its own).
export function diffTokens(
  a: string[],
  b: string[],
  joiner = "",
  equalsKey?: (s: string) => string,
): DiffOp[] {
  const moves = computeMoves(a, b, equalsKey);
  const merged: DiffOp[] = [];
  for (const mv of moves) {
    const value = mv.type === "add" ? b[mv.bIdx!] : a[mv.aIdx!];
    const last = merged[merged.length - 1];
    if (last && last.type === mv.type) last.value += joiner + value;
    else merged.push({ type: mv.type, value });
  }
  return merged;
}

export function tokenizeChars(text: string): string[] {
  return Array.from(text);
}

export function tokenizeWords(text: string): string[] {
  return text.match(/\s+|\S+/g) ?? [];
}

// Splits into logical lines with no newline attached to each token, so a
// line's identity doesn't depend on whether it happens to be the last line
// (which would otherwise never match an identical line elsewhere). A single
// trailing newline is treated as a file-ending convention, not content.
export function tokenizeLines(text: string): string[] {
  return text.replace(/\n$/, "").split("\n");
}

export interface DiffStats {
  additions: number;
  removals: number;
  similarity: number;
}

export function diffStats(ops: DiffOp[], mode: "chars" | "words" | "lines"): DiffStats {
  const count = (s: string) => {
    if (mode === "chars") return s.length;
    if (mode === "lines") return s.split("\n").length;
    return (s.match(/\S+/g) ?? []).length;
  };
  let additions = 0;
  let removals = 0;
  let equal = 0;
  for (const op of ops) {
    const n = count(op.value);
    if (op.type === "add") additions += n;
    else if (op.type === "remove") removals += n;
    else equal += n;
  }
  const total = equal + additions + removals;
  const similarity = total === 0 ? 100 : Math.round((equal / total) * 1000) / 10;
  return { additions, removals, similarity };
}

// One row of a side-by-side (developer-mode) diff. Adjacent remove/add runs
// are paired up line-by-line into "modify" rows so the UI can show intra-line
// word highlights (the standard GitHub/text-compare.com split-view look)
// instead of just stacking a deleted line above an unrelated added one.
export type LineRow =
  | { kind: "equal"; aLine: number; bLine: number; text: string }
  | { kind: "remove"; aLine: number; text: string }
  | { kind: "add"; bLine: number; text: string }
  | {
      kind: "modify";
      aLine: number;
      bLine: number;
      aText: string;
      bText: string;
      wordDiff: DiffOp[];
    };

export function buildLineRows(
  aLines: string[],
  bLines: string[],
  lineKey?: (s: string) => string,
  wordKey?: (s: string) => string,
): LineRow[] {
  const moves = computeMoves(aLines, bLines, lineKey);
  const rows: LineRow[] = [];
  let aLineNo = 0;
  let bLineNo = 0;
  let i = 0;

  while (i < moves.length) {
    const mv = moves[i];
    if (mv.type === "equal") {
      aLineNo++;
      bLineNo++;
      rows.push({ kind: "equal", aLine: aLineNo, bLine: bLineNo, text: aLines[mv.aIdx!] });
      i++;
      continue;
    }

    const removes: number[] = [];
    const adds: number[] = [];
    while (i < moves.length && moves[i].type !== "equal") {
      if (moves[i].type === "remove") removes.push(moves[i].aIdx!);
      else adds.push(moves[i].bIdx!);
      i++;
    }

    const pairCount = Math.min(removes.length, adds.length);
    for (let p = 0; p < pairCount; p++) {
      aLineNo++;
      bLineNo++;
      const aText = aLines[removes[p]];
      const bText = bLines[adds[p]];
      const wordDiff = diffTokens(tokenizeWords(aText), tokenizeWords(bText), "", wordKey);
      rows.push({ kind: "modify", aLine: aLineNo, bLine: bLineNo, aText, bText, wordDiff });
    }
    for (let p = pairCount; p < removes.length; p++) {
      aLineNo++;
      rows.push({ kind: "remove", aLine: aLineNo, text: aLines[removes[p]] });
    }
    for (let p = pairCount; p < adds.length; p++) {
      bLineNo++;
      rows.push({ kind: "add", bLine: bLineNo, text: bLines[adds[p]] });
    }
  }

  return rows;
}

export function lineRowStats(rows: LineRow[]): DiffStats {
  let additions = 0;
  let removals = 0;
  let equal = 0;
  for (const row of rows) {
    if (row.kind === "equal") equal++;
    else if (row.kind === "add") additions++;
    else if (row.kind === "remove") removals++;
    else {
      additions++;
      removals++;
    }
  }
  const total = equal + additions + removals;
  const similarity = total === 0 ? 100 : Math.round((equal / total) * 1000) / 10;
  return { additions, removals, similarity };
}

export function unifiedTextFromRows(rows: LineRow[]): string {
  const lines: string[] = [];
  for (const row of rows) {
    if (row.kind === "equal") lines.push("  " + row.text);
    else if (row.kind === "remove") lines.push("- " + row.text);
    else if (row.kind === "add") lines.push("+ " + row.text);
    else {
      lines.push("- " + row.aText);
      lines.push("+ " + row.bText);
    }
  }
  return lines.join("\n");
}
