"use client";

import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { fmtDateShort } from "@/lib/format";

interface DashboardProps {
  today?: PanchangaDay;
  nextFast?: Festival;
  nextFestival?: Festival;
  onSelectDate: (dateStr: string) => void;
}

function SummaryCard({
  eyebrow,
  title,
  lines,
  accent,
  onClick,
}: {
  eyebrow: string;
  title: string;
  lines: { label: string; value: string }[];
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="glass-card focus-ring flex flex-col gap-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-default disabled:hover:translate-y-0 sm:p-5"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {eyebrow}
      </span>
      <span className="font-serif-display text-xl font-semibold leading-tight sm:text-2xl">{title}</span>
      <div className="mt-1 flex flex-col gap-0.5">
        {lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <span>{l.label}</span>
            <span className="font-medium text-[var(--ink)]">{l.value}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

export function Dashboard({ today, nextFast, nextFestival, onSelectDate }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <SummaryCard
        eyebrow="Today"
        title={today?.tithi.name ?? "—"}
        accent="#171A3A"
        lines={[
          { label: "Paksha", value: today?.paksha ?? "—" },
          { label: "Nakshatra", value: today?.nakshatra.name ?? "—" },
        ]}
      />
      <SummaryCard
        eyebrow="Next Fast"
        title={nextFast?.name ?? "None upcoming"}
        accent="#D97732"
        onClick={nextFast ? () => onSelectDate(nextFast.date) : undefined}
        lines={nextFast ? [{ label: "Date", value: fmtDateShort(nextFast.date) }] : []}
      />
      <SummaryCard
        eyebrow="Next Festival"
        title={nextFestival?.name ?? "None upcoming"}
        accent="#7A2946"
        onClick={nextFestival ? () => onSelectDate(nextFestival.date) : undefined}
        lines={nextFestival ? [{ label: "Date", value: fmtDateShort(nextFestival.date) }] : []}
      />
    </div>
  );
}
