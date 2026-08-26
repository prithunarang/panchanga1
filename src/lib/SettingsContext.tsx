"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CalculationSettings, Location, Tradition } from "@/lib/panchanga/types";
import type { AyanamsaSystem } from "@/lib/astronomy";
import { DEFAULT_LOCATION } from "@/lib/locations";

interface SettingsState {
  location: Location;
  setLocation: (loc: Location) => void;
  recentLocations: Location[];
  settings: CalculationSettings;
  setAyanamsa: (a: AyanamsaSystem) => void;
  setCalendarSystem: (c: CalculationSettings["calendarSystem"]) => void;
  setTradition: (t: Tradition) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const STORAGE_KEY = "panchanga.settings.v1";

interface PersistedState {
  location: Location;
  recentLocations: Location[];
  settings: CalculationSettings;
  theme: "light" | "dark";
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Always start from the hardcoded defaults (matching the server-rendered
  // HTML) and only apply localStorage after mount. Reading localStorage
  // during the initial render would make the client's first render differ
  // from the server's, which React flags as a hydration mismatch.
  const [location, setLocationState] = useState<Location>(DEFAULT_LOCATION);
  const [recentLocations, setRecentLocations] = useState<Location[]>([DEFAULT_LOCATION]);
  const [settings, setSettings] = useState<CalculationSettings>({
    ayanamsa: "lahiri",
    calendarSystem: "amanta",
    tradition: "general",
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage after mount, by design: this is the
  // standard fix for SSR/localStorage hydration mismatches (the value
  // genuinely isn't knowable during server rendering), not a synchronize-
  // with-props pattern the lint rule is meant to catch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      setLocationState(persisted.location);
      setRecentLocations(persisted.recentLocations);
      setSettings(persisted.settings);
      setTheme(persisted.theme);
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedState = { location, recentLocations, settings, theme };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, location, recentLocations, settings, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setLocation = (loc: Location) => {
    setLocationState(loc);
    setRecentLocations((prev) => {
      const withoutDup = prev.filter((l) => l.id !== loc.id);
      return [loc, ...withoutDup].slice(0, 6);
    });
  };

  const value = useMemo<SettingsState>(
    () => ({
      location,
      setLocation,
      recentLocations,
      settings,
      setAyanamsa: (a) => setSettings((s) => ({ ...s, ayanamsa: a })),
      setCalendarSystem: (c) => setSettings((s) => ({ ...s, calendarSystem: c })),
      setTradition: (t) => setSettings((s) => ({ ...s, tradition: t })),
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [location, recentLocations, settings, theme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
