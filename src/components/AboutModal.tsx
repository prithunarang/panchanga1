"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            aria-label="About Panchanga"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="glass-card-strong scrollbar-thin fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-semibold">About Panchanga</h2>
              <button onClick={onClose} aria-label="Close" className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--ink-soft)]">
              <p>
                Panchanga (<span className="font-devanagari">पञ्चाङ्ग</span>) literally means &ldquo;five limbs&rdquo; —
                Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga and Karana. Together they form the
                traditional Hindu almanac used to determine auspicious timings, fasting days and festival dates.
              </p>
              <p>
                Every value in this app is derived from real geocentric Sun and Moon positions computed for your
                exact location, sunrise and timezone — not from a fixed list of dates. See{" "}
                <span className="font-medium text-[var(--ink)]">Calculation Details</span> on any day for the exact
                inputs used.
              </p>
              <p>
                Because Hindu months and tithis are astronomical, not civil, festival dates shift each year and can
                differ by a day depending on location, ayanamsa and whether your tradition uses the Amanta or
                Purnimanta month convention.
              </p>
              <p className="text-xs">
                This build uses a documented ayanamsa approximation and a simplified but transparent festival rule
                engine. Entries marked &ldquo;sample data&rdquo; require verification against a lineage-specific
                calendar before ritual use.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
