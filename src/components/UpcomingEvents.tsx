"use client";

import type { Festival } from "@/lib/panchanga/types";
import { fmtDateShort, fmtTime } from "@/lib/format";
import { useSettings } from "@/lib/SettingsContext";

const TYPE_ICON: Record<string, string> = {
  ekadashi: "🌙",
  fasting: "🟠",
  festival: "🪔",
  purnima: "🌕",
  amavasya: "🌑",
  sankranti: "☀",
  vaishnava: "🕉",
  appearance: "✨",
  disappearance: "🪷",
  chaturmasya: "🛕",
};

export function UpcomingEvents({ festivals, onSelect }: { festivals: Festival[]; onSelect: (f: Festival) => void }) {
  const { location } = useSettings();

  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-serif-display mb-3 text-lg font-semibold">Coming Up</h3>
      <div className="flex flex-col divide-y divide-[var(--glass-border)]">
        {festivals.length === 0 && <p className="py-4 text-center text-sm text-[var(--ink-soft)]">Nothing in the next window.</p>}
        {festivals.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className="focus-ring flex items-center gap-3 py-2.5 text-left transition hover:bg-white/30 dark:hover:bg-white/5"
          >
            <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-white/40 py-1.5 dark:bg-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">{fmtDateShort(f.date).split(" ")[1]}</span>
              <span className="font-serif-display text-lg font-semibold leading-none">{fmtDateShort(f.date).split(" ")[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <span aria-hidden>{TYPE_ICON[f.type] ?? "•"}</span>
                <span className="truncate">{f.name}</span>
              </div>
              <div className="truncate text-xs text-[var(--ink-soft)]">
                {f.fastingRequired && f.paranaStart && f.paranaDate
                  ? `Fast · Parana ${fmtDateShort(f.paranaDate)}, ${fmtTime(f.paranaStart, location.timezone)}–${fmtTime(f.paranaEnd, location.timezone)}`
                  : f.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
