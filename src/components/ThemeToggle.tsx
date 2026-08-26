"use client";

import { Sun, Moon } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 text-[var(--ink)] transition hover:scale-105 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
