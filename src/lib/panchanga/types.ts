import type { AyanamsaSystem, GeoLocation } from "@/lib/astronomy";

export type Paksha = "Shukla" | "Krishna";
export type CalendarSystem = "amanta" | "purnimanta";
export type Tradition = "general" | "vaishnava" | "gaudiya" | "smarta" | "custom";

export interface Location extends GeoLocation {
  id: string;
  city: string;
  country: string;
  admin?: string; // state/province
}

export interface CalculationSettings {
  ayanamsa: AyanamsaSystem;
  calendarSystem: CalendarSystem;
  tradition: Tradition;
}

export interface TimedValue {
  name: string;
  index: number;
  start: string | null; // ISO datetime, null if already in effect before the search window
  end: string | null; // ISO datetime, null if it extends beyond the search window
}

export interface PanchangaDay {
  date: string; // yyyy-MM-dd, Gregorian, in the location's timezone
  weekday: string;
  varaSanskrit: string;

  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;

  tithi: TimedValue;
  paksha: Paksha;
  nakshatra: TimedValue;
  yoga: TimedValue;
  karana: TimedValue;
  secondKarana?: TimedValue;

  masaAmanta: string;
  masaPurnimanta: string;
  adhikaMasa: boolean;
  rashiOfSun: string;

  isSankranti: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;

  rahuKalam: [string, string] | null;
  yamaganda: [string, string] | null;
  gulikaKalam: [string, string] | null;

  ayanamsaDegrees: number;
}

export type FestivalType =
  | "ekadashi"
  | "fasting"
  | "festival"
  | "purnima"
  | "amavasya"
  | "sankranti"
  | "vaishnava"
  | "appearance"
  | "disappearance"
  | "chaturmasya";

export interface Festival {
  id: string;
  date: string; // yyyy-MM-dd
  name: string;
  type: FestivalType;
  tradition: Tradition;
  description: string;
  /** Longer background on the observance itself (history, deity, why it's kept) - shown in the detail view, separate from `description`'s one-line summary. */
  significance?: string;
  fastingRequired: boolean;
  fastingType?: string;
  /** Short label for a named calendrical exception (e.g. "Kshaya Ekadashi — observed on Dvadashi"). */
  exceptionNote?: string;
  paranaDate?: string;
  paranaStart?: string | null;
  paranaEnd?: string | null;
  specialTimings?: Record<string, string | null | undefined>;
  locationDependent: boolean;
  priority: number; // lower = more important, used for sort/prominence
  color: string;
  explanation?: string;
  isSampleData?: boolean; // true for regional/lineage-specific entries not yet backed by a verified rule
}

export interface FastingEvent {
  festivalId: string;
  name: string;
  fastingType: string;
  date: string;
  paranaDate?: string;
  paranaStart?: string | null;
  paranaEnd?: string | null;
}

export interface CalendarDayData {
  panchanga: PanchangaDay;
  festivals: Festival[];
  fastingEvents: FastingEvent[];
}
