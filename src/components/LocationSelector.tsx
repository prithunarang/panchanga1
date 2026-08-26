"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Search } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { searchLocations, allTimezones } from "@/lib/locations";
import type { Location } from "@/lib/panchanga/types";

function tzOffsetLabel(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

export function LocationSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { location, setLocation, recentLocations } = useSettings();
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualLat, setManualLat] = useState(String(location.latitude));
  const [manualLon, setManualLon] = useState(String(location.longitude));
  const [manualTz, setManualTz] = useState(location.timezone);
  const [tzQuery, setTzQuery] = useState("");
  const [manualCity, setManualCity] = useState("");

  const results = searchLocations(query);
  const timezones = useMemo(() => allTimezones(), []);
  const tzResults = useMemo(() => {
    const q = tzQuery.trim().toLowerCase();
    const list = q ? timezones.filter((tz) => tz.toLowerCase().includes(q.replace(/\s+/g, "_"))) : timezones;
    return list.slice(0, 60);
  }, [timezones, tzQuery]);

  const choose = (loc: Location) => {
    setLocation(loc);
    onClose();
  };

  const applyManual = () => {
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon) || !manualTz) return;
    choose({
      id: `manual-${lat}-${lon}`,
      city: manualCity || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      country: "Custom location",
      latitude: lat,
      longitude: lon,
      timezone: manualTz,
    });
  };

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
            aria-label="Choose calendar location"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="glass-card-strong scrollbar-thin fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-semibold">Calendar Location</h2>
              <button onClick={onClose} aria-label="Close" className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="relative mt-4">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city..."
                className="focus-ring w-full rounded-full border border-[var(--glass-border)] bg-white/40 py-2 pl-9 pr-3 text-sm outline-none dark:bg-white/5"
              />
            </div>

            {!query && recentLocations.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Recent locations</div>
                <div className="flex flex-col gap-1">
                  {recentLocations.map((loc) => (
                    <LocationRow key={loc.id} loc={loc} active={loc.id === location.id} onClick={() => choose(loc)} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                {query ? "Results" : "All locations"}
              </div>
              <div className="flex flex-col gap-1">
                {results.map((loc) => (
                  <LocationRow key={loc.id} loc={loc} active={loc.id === location.id} onClick={() => choose(loc)} />
                ))}
                {results.length === 0 && <p className="py-3 text-center text-sm text-[var(--ink-soft)]">No matches.</p>}
              </div>
            </div>

            <div className="gold-divider my-4" />

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="focus-ring text-xs font-medium text-[var(--saffron)] underline-offset-2 hover:underline"
            >
              {showAdvanced ? "Hide" : "Show"} advanced (manual latitude/longitude)
            </button>

            {showAdvanced && (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Label (optional)"
                  className="focus-ring rounded-lg border border-[var(--glass-border)] bg-white/40 px-3 py-2 text-sm outline-none dark:bg-white/5"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="Latitude"
                    inputMode="decimal"
                    className="focus-ring rounded-lg border border-[var(--glass-border)] bg-white/40 px-3 py-2 text-sm outline-none dark:bg-white/5"
                  />
                  <input
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="Longitude"
                    inputMode="decimal"
                    className="focus-ring rounded-lg border border-[var(--glass-border)] bg-white/40 px-3 py-2 text-sm outline-none dark:bg-white/5"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-[var(--ink-soft)]">Timezone</label>
                    <span className="text-[11px] font-semibold text-[var(--saffron)]">
                      {manualTz} {tzOffsetLabel(manualTz)}
                    </span>
                  </div>
                  <input
                    value={tzQuery}
                    onChange={(e) => setTzQuery(e.target.value)}
                    placeholder="Search timezones (e.g. Kolkata, New York, UTC)..."
                    className="focus-ring w-full rounded-lg border border-[var(--glass-border)] bg-white/40 px-3 py-2 text-sm outline-none dark:bg-white/5"
                  />
                  <div className="scrollbar-thin mt-1.5 max-h-36 overflow-y-auto rounded-lg border border-[var(--glass-border)] bg-white/30 dark:bg-white/5">
                    {tzResults.map((tz) => (
                      <button
                        key={tz}
                        onClick={() => setManualTz(tz)}
                        className={`focus-ring flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition ${
                          tz === manualTz ? "bg-[var(--saffron)]/15 font-semibold text-[var(--saffron)]" : "hover:bg-white/40 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{tz.replace(/_/g, " ")}</span>
                        <span className="ml-2 shrink-0 text-[var(--ink-soft)]">{tzOffsetLabel(tz)}</span>
                      </button>
                    ))}
                    {tzResults.length === 0 && <p className="px-3 py-2 text-center text-xs text-[var(--ink-soft)]">No matching timezones.</p>}
                  </div>
                </div>
                <button
                  onClick={applyManual}
                  className="focus-ring mt-1 rounded-full bg-[var(--saffron)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Use this location
                </button>
              </div>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-[var(--ink-soft)]">
              Calculations are based on local sunrise, sunset and astronomical position for {location.city}, {location.country}.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LocationRow({ loc, active, onClick }: { loc: Location; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
        active ? "bg-[var(--saffron)]/15 text-[var(--saffron)]" : "hover:bg-white/40 dark:hover:bg-white/10"
      }`}
    >
      <MapPin size={14} className={active ? "text-[var(--saffron)]" : "text-[var(--ink-soft)]"} />
      <span className="flex-1">
        {loc.city}
        {loc.admin ? `, ${loc.admin}` : ""}, {loc.country}
      </span>
    </button>
  );
}
