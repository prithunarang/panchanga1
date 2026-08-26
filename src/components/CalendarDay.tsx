"use client";

import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { FestivalBadge } from "./FestivalBadge";

interface CalendarDayProps {
  dateStr: string;
  dayNumber: number;
  panchanga?: PanchangaDay;
  festivals: Festival[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function CalendarDay({
  dateStr,
  dayNumber,
  panchanga,
  festivals,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: CalendarDayProps) {
  const hasFast = festivals.some((f) => f.fastingRequired);
  const visibleFestivals = festivals.slice(0, 2);
  const extraCount = festivals.length - visibleFestivals.length;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${dateStr}${panchanga ? `, ${panchanga.tithi.name}, ${panchanga.paksha} Paksha` : ""}${hasFast ? ", fasting day" : ""}`}
      aria-pressed={isSelected}
      className={`focus-ring group relative flex min-h-[86px] w-full min-w-0 flex-col items-start gap-1 overflow-hidden rounded-xl border p-1.5 text-left transition-all sm:min-h-[112px] sm:p-2.5 ${
        isCurrentMonth ? "border-[var(--glass-border)] bg-white/25 dark:bg-white/[0.03]" : "border-transparent bg-transparent opacity-40"
      } ${isSelected ? "ring-2 ring-[var(--saffron)] ring-offset-1 ring-offset-transparent" : "hover:bg-white/40 dark:hover:bg-white/[0.06]"}`}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={`font-serif-display text-base font-semibold sm:text-xl ${
            isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-[var(--saffron)] text-xs text-white sm:h-7 sm:w-7 sm:text-sm" : ""
          }`}
        >
          {dayNumber}
        </span>
        {hasFast && (
          <span
            className="rounded-full bg-[var(--saffron)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white sm:text-[9px]"
            title="Suitable for fasting"
          >
            Fast
          </span>
        )}
      </div>

      {panchanga && isCurrentMonth && (
        <div className="hidden w-full flex-col gap-0 sm:flex">
          <span className="truncate text-[11px] font-medium text-[var(--ink)]">{panchanga.tithi.name}</span>
          <span className="truncate text-[10px] text-[var(--ink-soft)]">{panchanga.paksha} · {panchanga.nakshatra.name}</span>
        </div>
      )}

      {isCurrentMonth && festivals.length > 0 && (
        <div className="mt-auto flex w-full min-w-0 flex-col gap-1">
          {visibleFestivals.map((f) => (
            <FestivalBadge key={f.id} festival={f} compact />
          ))}
          {extraCount > 0 && (
            <span className="text-[9px] font-medium text-[var(--ink-soft)]">+{extraCount} more</span>
          )}
        </div>
      )}
    </button>
  );
}
