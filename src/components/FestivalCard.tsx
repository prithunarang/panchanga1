"use client";

import type { Festival } from "@/lib/panchanga/types";

export function FestivalCard({ festival, onClick }: { festival: Festival; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring w-full rounded-xl border border-[var(--glass-border)] bg-white/30 p-3 text-left transition hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: festival.color }}>
          {festival.type}
        </span>
        {festival.fastingRequired && (
          <span className="rounded-full bg-[var(--saffron)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--saffron)]">FAST</span>
        )}
      </div>
      <div className="font-serif-display mt-1 text-base font-semibold">{festival.name}</div>
      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-soft)]">{festival.description}</p>
    </button>
  );
}
