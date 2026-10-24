import { useEffect, useState } from "react";

const STORAGE_KEY = "devfolio-appearance";

export function ThemeControl({ compact = false }) {
  const [mode, setMode] = useState("dark");

  useEffect(() => {
    let preferred = "dark";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") preferred = saved;
      else preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      // Browsers with restricted storage still get a fully functional toggle.
    }
    document.documentElement.dataset.colorMode = preferred;
    setMode(preferred);
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.dataset.colorMode = next;
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* Storage is optional. */ }
  }

  return <button
    className={"theme-control" + (compact ? " theme-control-compact" : "")}
    type="button"
    onClick={toggle}
    aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    title={mode === "dark" ? "Light mode" : "Dark mode"}
  >
    <span aria-hidden="true" className="theme-control-symbol">{mode === "dark" ? "☀" : "☾"}</span>
    {!compact && <span className="theme-control-label">{mode === "dark" ? "Light" : "Dark"} mode</span>}
  </button>;
}
