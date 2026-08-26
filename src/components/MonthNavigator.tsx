"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES } from "@/lib/format";

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNavigator({ year, month, onPrev, onNext, onToday }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold sm:text-4xl">{MONTH_NAMES[month]} {year}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToday}
          className="focus-ring rounded-full border border-[var(--glass-border)] bg-white/30 px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
        >
          Today
        </button>
        <button
          onClick={onPrev}
          aria-label="Previous month"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 transition hover:scale-105 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          aria-label="Next month"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 transition hover:scale-105 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
