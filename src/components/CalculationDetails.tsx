"use client";

import type { Location, CalculationSettings } from "@/lib/panchanga/types";

const AYANAMSA_LABELS: Record<string, string> = {
  lahiri: "Lahiri (Chitrapaksha)",
  raman: "Raman",
  krishnamurti: "Krishnamurti (KP)",
};

export function CalculationDetails({ location, settings, ayanamsaDegrees }: { location: Location; settings: CalculationSettings; ayanamsaDegrees?: number }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-serif-display mb-2 text-lg font-semibold">Calculation Details</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-[var(--ink-soft)]">Location</dt>
        <dd className="text-right font-medium">{location.city}, {location.country}</dd>
        <dt className="text-[var(--ink-soft)]">Latitude</dt>
        <dd className="text-right font-medium">{Math.abs(location.latitude).toFixed(4)}° {location.latitude >= 0 ? "N" : "S"}</dd>
        <dt className="text-[var(--ink-soft)]">Longitude</dt>
        <dd className="text-right font-medium">{Math.abs(location.longitude).toFixed(4)}° {location.longitude >= 0 ? "E" : "W"}</dd>
        <dt className="text-[var(--ink-soft)]">Timezone</dt>
        <dd className="text-right font-medium">{location.timezone}</dd>
        <dt className="text-[var(--ink-soft)]">Ayanamsa</dt>
        <dd className="text-right font-medium">{AYANAMSA_LABELS[settings.ayanamsa]}{ayanamsaDegrees ? ` (${ayanamsaDegrees.toFixed(4)}°)` : ""}</dd>
        <dt className="text-[var(--ink-soft)]">Calendar</dt>
        <dd className="text-right font-medium capitalize">{settings.calendarSystem}</dd>
        <dt className="text-[var(--ink-soft)]">Day calculation</dt>
        <dd className="text-right font-medium">Local sunrise</dd>
        <dt className="text-[var(--ink-soft)]">Tradition</dt>
        <dd className="text-right font-medium capitalize">{settings.tradition}</dd>
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--ink-soft)]">
        Sun and Moon positions are computed from a real ephemeris (astronomy-engine). The ayanamsa uses a linear
        precession-rate approximation referenced to J2000 — accurate to within roughly an arcminute for this date
        range. See the engine source for the exact upgrade path to Swiss Ephemeris for observatory-grade precision.
      </p>
    </div>
  );
}
