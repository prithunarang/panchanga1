"use client";

import { MapPin, Search, Settings as SettingsIcon, CalendarDays, LayoutGrid } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "@/lib/SettingsContext";

interface HeaderProps {
  view: "month" | "year";
  onChangeView: (v: "month" | "year") => void;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
}

export function Header({ view, onChangeView, onOpenLocation, onOpenSettings, onOpenSearch }: HeaderProps) {
  const { location } = useSettings();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass-nav mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2.5">
          <SunLotusMark />
          <div className="leading-tight">
            <div className="font-serif-display text-lg font-semibold tracking-wide sm:text-xl">Panchanga</div>
            <div className="hidden text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] sm:block">
              Vedic Calendar
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-[var(--glass-border)] bg-white/20 p-1 dark:bg-white/5 md:flex">
          <button
            onClick={() => onChangeView("month")}
            className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              view === "month" ? "bg-[var(--saffron)] text-white shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <CalendarDays size={14} /> Month
          </button>
          <button
            onClick={() => onChangeView("year")}
            className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              view === "year" ? "bg-[var(--saffron)] text-white shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <LayoutGrid size={14} /> Year
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenSearch}
            aria-label="Search festivals and dates"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 transition hover:scale-105 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Search size={16} />
          </button>
          <button
            onClick={onOpenLocation}
            className="focus-ring flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-white/30 px-2.5 py-1.5 text-sm font-medium transition hover:scale-[1.02] hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 sm:px-3"
          >
            <MapPin size={14} className="text-[var(--saffron)]" />
            <span className="max-w-[7rem] truncate sm:max-w-none">{location.city}, {location.country}</span>
          </button>
          <ThemeToggle />
          <button
            onClick={onOpenSettings}
            aria-label="Calculation settings"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 transition hover:scale-105 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      <nav className="mx-auto mt-2 flex max-w-7xl items-center gap-1 rounded-full border border-[var(--glass-border)] bg-white/20 p-1 dark:bg-white/5 md:hidden">
        <button
          onClick={() => onChangeView("month")}
          className={`focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            view === "month" ? "bg-[var(--saffron)] text-white shadow-sm" : "text-[var(--ink-soft)]"
          }`}
        >
          <CalendarDays size={14} /> Month
        </button>
        <button
          onClick={() => onChangeView("year")}
          className={`focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            view === "year" ? "bg-[var(--saffron)] text-white shadow-sm" : "text-[var(--ink-soft)]"
          }`}
        >
          <LayoutGrid size={14} /> Year
        </button>
      </nav>
    </header>
  );
}

function SunLotusMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="7.5" fill="var(--saffron)" opacity="0.9" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        // Rounded to 2dp so server/client renders serialize identically -
        // raw Math.cos/sin can differ in the last ULP between runtimes,
        // which otherwise triggers a hydration mismatch warning.
        const x1 = (20 + Math.cos(angle) * 11).toFixed(2);
        const y1 = (20 + Math.sin(angle) * 11).toFixed(2);
        const x2 = (20 + Math.cos(angle) * 17).toFixed(2);
        const y2 = (20 + Math.sin(angle) * 17).toFixed(2);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
        );
      })}
    </svg>
  );
}
