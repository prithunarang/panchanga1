"use client";

import type { FestivalType } from "@/lib/panchanga/types";

export type FilterKey = "all" | FestivalType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ekadashi", label: "Ekadashi" },
  { key: "festival", label: "Festivals" },
  { key: "purnima", label: "Purnima" },
  { key: "amavasya", label: "Amavasya" },
  { key: "sankranti", label: "Sankranti" },
  { key: "vaishnava", label: "Vaishnava" },
  { key: "appearance", label: "Appearance Days" },
  { key: "disappearance", label: "Disappearance Days" },
  { key: "chaturmasya", label: "Chaturmasya" },
];

interface FilterChipsProps {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter observances">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          role="tab"
          aria-selected={active === f.key}
          onClick={() => onChange(f.key)}
          className={`focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
            active === f.key
              ? "border-[var(--saffron)] bg-[var(--saffron)] text-white shadow-sm"
              : "border-[var(--glass-border)] bg-white/25 text-[var(--ink-soft)] hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
