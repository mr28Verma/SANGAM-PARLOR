"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("sangam-theme-change", onChange);
      return () => window.removeEventListener("sangam-theme-change", onChange);
    },
    () => document.documentElement.dataset.theme === "light" ? "light" : "dark",
    () => "dark",
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event("sangam-theme-change"));
    try {
      localStorage.setItem("sangam-theme", nextTheme);
    } catch {
      // Keep the theme usable for this visit if browser storage is unavailable.
    }
  };

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  return (
    <button className={compact ? "mobile-theme-toggle" : "theme-toggle"} type="button" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === "dark" ? <Sun size={17} strokeWidth={1.6}/> : <Moon size={17} strokeWidth={1.6}/>}
      <span>{compact ? label : theme === "dark" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
