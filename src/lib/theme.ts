import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "tp-theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const mounted = useRef(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
    mounted.current = true;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return { theme, toggle };
}

// Runs before paint to prevent a flash of the wrong theme.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('tp-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
