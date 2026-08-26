"use client";

import { motion } from "framer-motion";
import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { CalendarDay } from "./CalendarDay";
import { addDaysToDateStr } from "@/lib/format";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  todayStr: string;
  selectedDate: string | null;
  daysByDate: Map<string, PanchangaDay>;
  festivalsByDate: Map<string, Festival[]>;
  onSelectDate: (dateStr: string) => void;
}

function toDateStr(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m, d));
  return dt.toISOString().slice(0, 10);
}

export function CalendarGrid({ year, month, todayStr, selectedDate, daysByDate, festivalsByDate, onSelectDate }: CalendarGridProps) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const jsWeekday = firstOfMonth.getUTCDay(); // 0=Sun
  const mondayIndexedOffset = (jsWeekday + 6) % 7; // days before first cell to reach Monday
  const gridStart = toDateStr(year, month, 1 - mondayIndexedOffset);

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const totalCellsNeeded = mondayIndexedOffset + daysInMonth;
  const totalCells = Math.ceil(totalCellsNeeded / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => addDaysToDateStr(gridStart, i));

  return (
    <motion.div
      key={`${year}-${month}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="glass-card p-2 sm:p-4"
    >
      <div className="grid grid-cols-7 gap-1 px-0.5 pb-2 sm:gap-2">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[10px] font-semibold tracking-[0.12em] text-[var(--ink-soft)] sm:text-xs">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((dateStr) => {
          const [, m, d] = dateStr.split("-").map(Number);
          const isCurrentMonth = m - 1 === month;
          return (
            <CalendarDay
              key={dateStr}
              dateStr={dateStr}
              dayNumber={d}
              panchanga={daysByDate.get(dateStr)}
              festivals={festivalsByDate.get(dateStr) ?? []}
              isCurrentMonth={isCurrentMonth}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              onClick={() => onSelectDate(dateStr)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
