/// <reference lib="webworker" />
// Regex evaluation runs here, off the main thread, so a catastrophic-
// backtracking pattern freezes only this worker — the UI stays alive and the
// caller terminates + recreates the worker after a timeout.

export interface RegexJob {
  id: number;
  pattern: string;
  flags: string;
  text: string;
  replacement?: string; // when set, also compute the substitution
}

export interface RegexMatch {
  match: string;
  index: number;
  groups: (string | null)[];
  named: Record<string, string>;
}

export interface RegexResult {
  id: number;
  ok: boolean;
  matches?: RegexMatch[];
  replaced?: string;
  error?: string;
}

self.onmessage = (e: MessageEvent<RegexJob>) => {
  const { id, pattern, flags, text, replacement } = e.data;

  if (!pattern) {
    (self as unknown as Worker).postMessage({ id, ok: true, matches: [] } as RegexResult);
    return;
  }

  let re: RegExp;
  try {
    // Force global so every match + index is found for highlighting; the user's
    // own flags still control case/multiline/dotall/unicode/sticky semantics.
    const g = flags.includes("g") ? flags : flags + "g";
    re = new RegExp(pattern, g);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Invalid regular expression",
    } as RegexResult);
    return;
  }

  try {
    const matches: RegexMatch[] = [];
    let guard = 0;
    for (const m of text.matchAll(re)) {
      matches.push({
        match: m[0],
        index: m.index ?? 0,
        groups: m.slice(1).map((g) => g ?? null),
        named: m.groups ? { ...m.groups } : {},
      });
      if (++guard > 50000) break;
    }

    let replaced: string | undefined;
    if (replacement !== undefined) {
      replaced = text.replace(re, replacement);
    }

    (self as unknown as Worker).postMessage({ id, ok: true, matches, replaced } as RegexResult);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Regex execution failed",
    } as RegexResult);
  }
};
