"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import type { AyanamsaSystem } from "@/lib/astronomy";
import type { CalculationSettings, Tradition } from "@/lib/panchanga/types";

const AYANAMSA_OPTIONS: { value: AyanamsaSystem; label: string }[] = [
  { value: "lahiri", label: "Lahiri (most common in India)" },
  { value: "raman", label: "Raman" },
  { value: "krishnamurti", label: "Krishnamurti (KP)" },
];

const CALENDAR_OPTIONS: { value: CalculationSettings["calendarSystem"]; label: string; desc: string }[] = [
  { value: "amanta", label: "Amanta", desc: "Month ends at New Moon — used across South & West India" },
  { value: "purnimanta", label: "Purnimanta", desc: "Month ends at Full Moon — used across North India" },
];

const TRADITION_OPTIONS: { value: Tradition; label: string }[] = [
  { value: "general", label: "General Hindu" },
  { value: "vaishnava", label: "Vaishnava" },
  { value: "gaudiya", label: "Gaudiya Vaishnava" },
  { value: "smarta", label: "Smarta" },
  { value: "custom", label: "Custom" },
];

function OptionGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`focus-ring rounded-xl border px-3 py-2 text-left text-sm transition ${
            value === opt.value
              ? "border-[var(--saffron)] bg-[var(--saffron)]/10"
              : "border-[var(--glass-border)] bg-white/25 hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10"
          }`}
        >
          <div className="font-medium">{opt.label}</div>
          {opt.desc && <div className="text-xs text-[var(--ink-soft)]">{opt.desc}</div>}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setAyanamsa, setCalendarSystem, setTradition } = useSettings();

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
            aria-label="Calculation settings"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="glass-card-strong scrollbar-thin fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-semibold">Calculation Settings</h2>
              <button onClick={onClose} aria-label="Close" className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              Festival dates can shift depending on these settings. Choose the convention your tradition follows.
            </p>

            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Ayanamsa</h3>
              <OptionGroup value={settings.ayanamsa} onChange={setAyanamsa} options={AYANAMSA_OPTIONS} />
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Calendar System</h3>
              <OptionGroup value={settings.calendarSystem} onChange={setCalendarSystem} options={CALENDAR_OPTIONS} />
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Tradition</h3>
              <OptionGroup value={settings.tradition} onChange={setTradition} options={TRADITION_OPTIONS} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
