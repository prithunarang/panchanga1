"use client";

import { Flame, Clock, CheckCircle2, UtensilsCrossed } from "lucide-react";
import type { Festival } from "@/lib/panchanga/types";
import { fmtTime, fmtRange, fmtDateLong } from "@/lib/format";

const AUSPICIOUS_GREEN = "#4B7F52";

export function FastingCard({ festival, timezone }: { festival: Festival; timezone: string }) {
  return (
    <div className="glass-card border-l-4 p-4" style={{ borderLeftColor: festival.color }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: festival.color }}>
            <Flame size={12} /> Fasting Day
          </div>
          <h4 className="font-serif-display mt-0.5 text-lg font-semibold">{festival.name}</h4>
        </div>
      </div>

      {/* Clear, unambiguous "is this a fasting day" signal - the #1 thing users scan for. */}
      <div
        className="mt-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color: AUSPICIOUS_GREEN, background: `${AUSPICIOUS_GREEN}18` }}
      >
        <CheckCircle2 size={14} />
        Suitable for fasting
      </div>

      {festival.exceptionNote && (
        <p className="mt-1.5 inline-block rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--gold)]">
          ⚠ {festival.exceptionNote}
        </p>
      )}

      {festival.fastingType && <p className="mt-2 text-sm text-[var(--ink-soft)]">{festival.fastingType}</p>}

      {festival.significance && (
        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">{festival.significance}</p>
      )}

      {festival.specialTimings?.tithiStart && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
          <Clock size={12} />
          <span>Tithi: {fmtRange(festival.specialTimings.tithiStart ?? null, festival.specialTimings.tithiEnd ?? null, timezone)}</span>
        </div>
      )}

      {/* Fast-breaking (Parana) time - made the most visually prominent element on the
          card, since "when can I eat" is the single most-asked question about a fast. */}
      {festival.paranaDate && festival.paranaStart && festival.paranaEnd && (
        <div className="mt-3 rounded-xl border p-3.5" style={{ borderColor: "var(--saffron)", background: "color-mix(in srgb, var(--saffron) 12%, transparent)" }}>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--saffron)]">
            <UtensilsCrossed size={13} /> Fast-Breaking Time (Parana)
          </div>
          <div className="mt-1 text-sm font-medium text-[var(--ink)]">{fmtDateLong(festival.paranaDate)}</div>
          <div className="font-serif-display mt-0.5 text-2xl font-semibold tracking-tight text-[var(--saffron)]">
            {fmtTime(festival.paranaStart, timezone)} – {fmtTime(festival.paranaEnd, timezone)}
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink-soft)]">
            Break your fast any time within this window — after sunrise and Hari-vasara, within one-third of the day&apos;s length (or before the tithi ends, if sooner).
          </p>
        </div>
      )}

      {festival.explanation && <p className="mt-3 text-xs leading-relaxed text-[var(--ink-soft)]">{festival.explanation}</p>}
      {festival.isSampleData && (
        <p className="mt-2 rounded-lg bg-[var(--maroon)]/10 px-2 py-1 text-[11px] font-medium text-[var(--maroon)]">
          Sample data — verify against a lineage-specific calendar.
        </p>
      )}
    </div>
  );
}
