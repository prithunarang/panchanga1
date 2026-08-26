"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock3, ListTree } from "lucide-react";
import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { fmtDateLong } from "@/lib/format";
import { PanchangaCard } from "./PanchangaCard";
import { FastingCard } from "./FastingCard";
import { FestivalBadge } from "./FestivalBadge";
import { TimelineView } from "./TimelineView";

interface DayDetailsPanelProps {
  day: PanchangaDay | null;
  festivals: Festival[];
  timezone: string;
  onClose: () => void;
}

export function DayDetailsPanel({ day, festivals, timezone, onClose }: DayDetailsPanelProps) {
  const [tab, setTab] = useState<"panchanga" | "timeline">("panchanga");

  return (
    <AnimatePresence>
      {day && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${day.date}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="glass-card-strong scrollbar-thin fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto rounded-none p-5 sm:p-6 md:right-3 md:top-3 md:h-[calc(100%-1.5rem)] md:max-w-md md:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--saffron)]">{day.weekday}</div>
                <h2 className="font-serif-display text-2xl font-semibold">{fmtDateLong(day.date)}</h2>
                <div className="font-devanagari mt-0.5 text-sm text-[var(--ink-soft)]">{day.varaSanskrit}</div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close details"
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {festivals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {festivals.map((f) => (
                  <FestivalBadge key={f.id} festival={f} />
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-1 rounded-full border border-[var(--glass-border)] bg-white/20 p-1 dark:bg-white/5">
              <button
                onClick={() => setTab("panchanga")}
                className={`focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition ${
                  tab === "panchanga" ? "bg-[var(--saffron)] text-white" : "text-[var(--ink-soft)]"
                }`}
              >
                <ListTree size={13} /> Panchanga
              </button>
              <button
                onClick={() => setTab("timeline")}
                className={`focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition ${
                  tab === "timeline" ? "bg-[var(--saffron)] text-white" : "text-[var(--ink-soft)]"
                }`}
              >
                <Clock3 size={13} /> Timeline
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {tab === "panchanga" ? (
                <>
                  <PanchangaCard day={day} timezone={timezone} />
                  {festivals.length > 0 && (
                    <div>
                      <h3 className="font-serif-display mb-2 text-lg font-semibold">Observances</h3>
                      <div className="flex flex-col gap-2">
                        {festivals.map((f) =>
                          f.fastingRequired ? (
                            <FastingCard key={f.id} festival={f} timezone={timezone} />
                          ) : (
                            <div key={f.id} className="glass-card border-l-4 p-3" style={{ borderLeftColor: f.color }}>
                              <div className="font-serif-display text-base font-semibold">{f.name}</div>
                              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{f.description}</p>
                              {f.significance && (
                                <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-soft)]">{f.significance}</p>
                              )}
                              {f.isSampleData && (
                                <p className="mt-1.5 rounded-lg bg-[var(--maroon)]/10 px-2 py-1 text-[10px] font-medium text-[var(--maroon)]">
                                  Sample data — verify against a lineage-specific calendar.
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <TimelineView day={day} festivals={festivals} timezone={timezone} />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
