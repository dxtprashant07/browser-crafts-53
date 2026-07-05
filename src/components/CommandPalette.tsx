import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { TOOLS, CATEGORIES } from "@/data/registry";
import { track } from "@/lib/analytics";

interface Props {
  open: boolean;
  onClose: () => void;
}

function score(query: string, tool: (typeof TOOLS)[number]): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const hay = `${tool.name} ${tool.shortDesc} ${tool.category}`.toLowerCase();
  if (tool.name.toLowerCase().startsWith(q)) return 100;
  if (tool.name.toLowerCase().includes(q)) return 60;
  // fuzzy: all chars in order
  let i = 0;
  for (const ch of hay) if (ch === q[i]) i++;
  if (i === q.length) return 20;
  return hay.includes(q) ? 10 : 0;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    return TOOLS.map((t) => ({ t, s: score(query, t) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.t);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const go = (slug: string, category: string) => {
    onClose();
    navigate({
      to: "/tools/$category/$slug",
      params: { category, slug },
    });
  };

  return (
    <div
      className="cmd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search tools"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cmd-panel">
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="Search tools…"
          aria-label="Search tools"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              go(results[active].slug, results[active].category);
            }
          }}
        />
        <div className="cmd-list" role="listbox">
          {results.length === 0 && <div className="cmd-empty">No tools found.</div>}
          {results.map((t, i) => {
            const cat = CATEGORIES.find((c) => c.id === t.category);
            return (
              <div
                key={t.slug}
                role="option"
                aria-selected={i === active}
                data-active={i === active}
                className="cmd-item"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(t.slug, t.category)}
              >
                <span aria-hidden>{cat?.icon}</span>
                <span>
                  <span className="name">{t.name}</span>
                  <br />
                  <span className="desc">{t.shortDesc}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        track("tool_viewed", { source: "command_palette_open" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
