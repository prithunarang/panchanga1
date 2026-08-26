"use client";

import { motion } from "framer-motion";
import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { MONTH_NAMES } from "@/lib/format";

interface YearViewProps {
  year: number;
  daysByDate: Map<string, PanchangaDay>;
  festivalsByDate: Map<string, Festival[]>;
  todayStr: string;
  onSelectMonth: (monthIndex: number) => void;
  onSelectDate: (dateStr: string) => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function YearView({ year, daysByDate, festivalsByDate, todayStr, onSelectMonth, onSelectDate }: YearViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {MONTH_NAMES.map((name, monthIdx) => {
        const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
        const firstWeekday = (new Date(Date.UTC(year, monthIdx, 1)).getUTCDay() + 6) % 7;

        return (
          <button
            key={name}
            onClick={() => onSelectMonth(monthIdx)}
            className="focus-ring glass-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="font-serif-display mb-2 text-base font-semibold">{name}</div>
            <div className="grid grid-cols-7 gap-[3px]">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`sp-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dateStr = `${year}-${pad(monthIdx + 1)}-${pad(d)}`;
                const festivals = festivalsByDate.get(dateStr) ?? [];
                const hasFast = festivals.some((f) => f.fastingRequired);
                const top = festivals[0];
                return (
                  <div
                    key={dateStr}
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(dateStr);
                    }}
                    className={`relative flex h-5 w-5 items-center justify-center rounded-full text-[8px] sm:h-6 sm:w-6 sm:text-[9px] ${
                      dateStr === todayStr ? "bg-[var(--saffron)] font-semibold text-white" : "text-[var(--ink-soft)]"
                    }`}
                  >
                    {d}
                    {top && dateStr !== todayStr && (
                      <span
                        className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full"
                        style={{ background: hasFast ? "#D97732" : top.color }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-[var(--ink-soft)]">
              {Array.from(daysByDate.keys()).filter((d) => d.startsWith(`${year}-${pad(monthIdx + 1)}`)).length > 0
                ? `${[...festivalsByDate.entries()].filter(([d]) => d.startsWith(`${year}-${pad(monthIdx + 1)}`)).reduce((acc, [, f]) => acc + f.length, 0)} observances`
                : ""}
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
