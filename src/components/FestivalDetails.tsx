"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, UtensilsCrossed } from "lucide-react";
import type { Festival, PanchangaDay } from "@/lib/panchanga/types";
import { fmtDateLong, fmtTime } from "@/lib/format";
import { useSettings } from "@/lib/SettingsContext";

const AUSPICIOUS_GREEN = "#4B7F52";

interface FestivalDetailsProps {
  festival: Festival | null;
  day?: PanchangaDay;
  onClose: () => void;
}

export function FestivalDetails({ festival, day, onClose }: FestivalDetailsProps) {
  const { location } = useSettings();

  return (
    <AnimatePresence>
      {festival && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={festival.name}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="glass-card-strong scrollbar-thin fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: festival.color }}>
                  {festival.type} · {festival.tradition}
                </span>
                <h2 className="font-serif-display mt-0.5 text-2xl font-semibold">{festival.name}</h2>
                <p className="text-sm text-[var(--ink-soft)]">{fmtDateLong(festival.date)}</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="gold-divider my-4" />

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Overview</h3>
              {festival.exceptionNote && (
                <p className="mb-2 inline-block rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--gold)]">
                  ⚠ {festival.exceptionNote}
                </p>
              )}
              <p className="text-sm leading-relaxed">{festival.description}</p>
            </section>

            {festival.significance && (
              <section className="mt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Significance</h3>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{festival.significance}</p>
              </section>
            )}

            {day && (
              <section className="mt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Panchanga</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-[var(--ink-soft)]">Tithi</dt>
                  <dd className="text-right font-medium">{day.tithi.name}</dd>
                  <dt className="text-[var(--ink-soft)]">Paksha</dt>
                  <dd className="text-right font-medium">{day.paksha}</dd>
                  <dt className="text-[var(--ink-soft)]">Nakshatra</dt>
                  <dd className="text-right font-medium">{day.nakshatra.name}</dd>
                  <dt className="text-[var(--ink-soft)]">Sunrise</dt>
                  <dd className="text-right font-medium">{fmtTime(day.sunrise, location.timezone)}</dd>
                </dl>
              </section>
            )}

            {festival.fastingRequired && (
              <section className="mt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--saffron)]">Fasting</h3>
                <div
                  className="mb-2 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ color: AUSPICIOUS_GREEN, background: `${AUSPICIOUS_GREEN}18` }}
                >
                  <CheckCircle2 size={14} />
                  Suitable for fasting
                </div>
                <p className="text-sm">{festival.fastingType ?? "Fast day"}</p>

                {festival.paranaDate && festival.paranaStart && festival.paranaEnd && (
                  <div className="mt-2 rounded-xl border p-3.5" style={{ borderColor: "var(--saffron)", background: "color-mix(in srgb, var(--saffron) 12%, transparent)" }}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--saffron)]">
                      <UtensilsCrossed size={13} /> Fast-Breaking Time (Parana)
                    </div>
                    <div className="mt-1 text-sm font-medium">{fmtDateLong(festival.paranaDate)}</div>
                    <div className="font-serif-display mt-0.5 text-2xl font-semibold tracking-tight text-[var(--saffron)]">
                      {fmtTime(festival.paranaStart, location.timezone)} – {fmtTime(festival.paranaEnd, location.timezone)}
                    </div>
                  </div>
                )}
              </section>
            )}

            {festival.explanation && (
              <section className="mt-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Calculation</h3>
                <p className="text-xs leading-relaxed text-[var(--ink-soft)]">{festival.explanation}</p>
              </section>
            )}

            {festival.isSampleData && (
              <p className="mt-4 rounded-lg bg-[var(--maroon)]/10 px-3 py-2 text-xs font-medium text-[var(--maroon)]">
                This entry is sample data illustrating the rule-engine architecture. Verify the exact tithi against a
                lineage-specific (e.g. ISKCON/Gaudiya Math) calendar before relying on it.
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
