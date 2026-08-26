"use client";

import { useEffect, useState } from "react";
import type { PanchangaDay, Festival, Location, CalculationSettings } from "@/lib/panchanga/types";

export interface PanchangaResponse {
  location: Location;
  settings: CalculationSettings;
  days: PanchangaDay[];
  festivals: Festival[];
}

const cache = new Map<string, PanchangaResponse>();

function keyFor(start: string, count: number, location: Location, settings: CalculationSettings) {
  return [start, count, location.latitude, location.longitude, location.timezone, settings.ayanamsa, settings.calendarSystem, settings.tradition].join(
    "|"
  );
}

export function usePanchangaData(start: string, count: number, location: Location, settings: CalculationSettings) {
  const key = keyFor(start, count, location, settings);

  const [activeKey, setActiveKey] = useState(key);
  const [data, setData] = useState<PanchangaResponse | null>(() => cache.get(key) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(key));
  const [error, setError] = useState<string | null>(null);

  // Reset synchronously when the request key changes, following React's
  // documented "adjusting state when a prop changes during render" pattern -
  // this avoids a redundant render vs. resetting inside an effect.
  if (key !== activeKey) {
    setActiveKey(key);
    const cached = cache.get(key);
    setData(cached ?? null);
    setLoading(!cached);
    setError(null);
  }

  useEffect(() => {
    if (cache.has(key)) return;

    // `loading`/`error` are already primed by the synchronous render-phase
    // reset above whenever `key` changes, so the effect only needs to own
    // the async fetch and its terminal setState calls.
    let cancelled = false;

    const params = new URLSearchParams({
      start,
      count: String(count),
      lat: String(location.latitude),
      lon: String(location.longitude),
      timezone: location.timezone,
      ayanamsa: settings.ayanamsa,
      calendarSystem: settings.calendarSystem,
      tradition: settings.tradition,
      includeSampleData: "true",
    });

    fetch(`/api/panchanga?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json())?.error ?? "Failed to load Panchanga data");
        return res.json() as Promise<PanchangaResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        cache.set(key, json);
        setData(json);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error };
}
