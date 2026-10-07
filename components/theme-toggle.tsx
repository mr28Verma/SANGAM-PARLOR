"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  return (
    <button className={compact ? "mobile-theme-toggle" : "theme-toggle"} type="button" data-theme-toggle aria-label="Switch theme" title="Switch theme">
      <Sun className="theme-dark-state" size={17} strokeWidth={1.6} aria-hidden="true"/>
      <Moon className="theme-light-state" size={17} strokeWidth={1.6} aria-hidden="true"/>
      <span className="theme-dark-state">{compact ? "Switch to light theme" : "LIGHT"}</span>
      <span className="theme-light-state">{compact ? "Switch to dark theme" : "DARK"}</span>
    </button>
  );
}
