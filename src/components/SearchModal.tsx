"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search as SearchIcon } from "lucide-react";
import type { Festival } from "@/lib/panchanga/types";
import { fmtDateLong, fmtTime, MONTH_NAMES } from "@/lib/format";
import { useSettings } from "@/lib/SettingsContext";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  festivals: Festival[];
  onSelectDate: (dateStr: string) => void;
}

export function SearchModal({ open, onClose, festivals, onSelectDate }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { location } = useSettings();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return festivals.slice(0, 12);

    const monthMatch = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(q.split(" ")[0] ?? ""));
    if (monthMatch >= 0 && /\d{4}/.test(q)) {
      const year = q.match(/\d{4}/)?.[0];
      return festivals.filter((f) => f.date.startsWith(`${year}-${String(monthMatch + 1).padStart(2, "0")}`));
    }

    return festivals.filter(
      (f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.date.includes(q)
    );
  }, [query, festivals]);

  return (
    <AnimatePresence>
      {open && (
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
            aria-label="Search festivals and dates"
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="glass-card-strong scrollbar-thin fixed left-1/2 top-[8vh] z-50 max-h-[78vh] w-[92vw] max-w-lg -translate-x-1/2 overflow-y-auto p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-semibold">Search</h2>
              <button onClick={onClose} aria-label="Close" className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="relative mt-3">
              <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try "Ekadashi", "Diwali", "September 2026"...'
                className="focus-ring w-full rounded-full border border-[var(--glass-border)] bg-white/40 py-2 pl-9 pr-3 text-sm outline-none dark:bg-white/5"
              />
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              {results.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectDate(f.date);
                    onClose();
                  }}
                  className="focus-ring flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/25 px-3 py-2.5 text-left transition hover:bg-white/45 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-[var(--ink-soft)]">
                      {fmtDateLong(f.date)} · {location.city}
                      {f.fastingRequired && f.paranaStart ? ` · Parana ${fmtTime(f.paranaStart, location.timezone)}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: f.color, background: `${f.color}18` }}>
                    {f.type}
                  </span>
                </button>
              ))}
              {results.length === 0 && <p className="py-6 text-center text-sm text-[var(--ink-soft)]">No matches found.</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
