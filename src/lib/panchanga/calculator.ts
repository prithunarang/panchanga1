import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  computeRiseSet,
  findMonotonicCrossing,
  makeTime,
  moonSunElongation,
  normalizeDeg,
  siderealMoonLongitude,
  siderealSunLongitude,
  yogaSum,
  getAyanamsaDegrees,
  type GeoLocation,
} from "@/lib/astronomy";
import {
  TITHI_NAMES,
  NAKSHATRA_NAMES,
  YOGA_NAMES,
  karanaNameForIndex,
  MASA_NAMES_AMANTA,
  RASHI_NAMES,
  WEEKDAY_NAMES,
  VARA_NAMES_SANSKRIT,
  RAHU_KALAM_OCTANT,
  YAMAGANDA_OCTANT,
  GULIKA_KALAM_OCTANT,
} from "./constants";
import type { CalculationSettings, PanchangaDay, TimedValue } from "./types";

const NAK_SPAN = 360 / 27;
const YOGA_SPAN = 360 / 27;

function isoOrNull(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

function daylightOctant(sunrise: Date, sunset: Date, octant: number): [string, string] {
  const spanMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const start = new Date(sunrise.getTime() + octant * spanMs);
  const end = new Date(sunrise.getTime() + (octant + 1) * spanMs);
  return [start.toISOString(), end.toISOString()];
}

/**
 * Computes a full Panchanga record for one Gregorian civil date at a given
 * location, using the sunrise-based Hindu-day convention: the Tithi,
 * Nakshatra, Yoga and Karana reported for a date are those prevailing at
 * that location's sunrise (the traditional rule used to name a Hindu day).
 * Start/end boundaries are still computed precisely so the UI can show
 * exact transition times even when they fall mid-day.
 */
export function computePanchangaDay(
  dateStr: string,
  location: GeoLocation,
  settings: CalculationSettings
): PanchangaDay {
  const localMidnightUtc = fromZonedTime(`${dateStr}T00:00:00`, location.timezone);
  const riseSet = computeRiseSet(localMidnightUtc, location);

  // Fallback anchor if rise/set search fails (e.g. polar location): local midday.
  const anchor = riseSet.sunrise ?? fromZonedTime(`${dateStr}T06:00:00`, location.timezone);
  const t = makeTime(anchor);

  const ayanamsaDeg = getAyanamsaDegrees(settings.ayanamsa, t);

  // --- Tithi ---
  const elong = moonSunElongation(t);
  const tithiIndex = Math.floor(elong / 12);
  const tithiStart = findMonotonicCrossing(moonSunElongation, tithiIndex * 12, t);
  const tithiEnd = findMonotonicCrossing(moonSunElongation, (tithiIndex + 1) * 12, t);
  const paksha = tithiIndex < 15 ? "Shukla" : "Krishna";

  // --- Karana (half-tithi) ---
  const halfTithiIndex = Math.floor(elong / 6);
  const karanaStart = findMonotonicCrossing(moonSunElongation, halfTithiIndex * 6, t);
  const karanaEnd = findMonotonicCrossing(moonSunElongation, (halfTithiIndex + 1) * 6, t);

  // --- Nakshatra (sidereal Moon longitude) ---
  const moonSid = siderealMoonLongitude(t, settings.ayanamsa);
  const nakIndex = Math.floor(moonSid / NAK_SPAN);
  const nakFn = (tt: Parameters<typeof siderealMoonLongitude>[0]) => siderealMoonLongitude(tt, settings.ayanamsa);
  const nakStart = findMonotonicCrossing(nakFn, nakIndex * NAK_SPAN, t);
  const nakEnd = findMonotonicCrossing(nakFn, (nakIndex + 1) * NAK_SPAN, t);

  // --- Yoga (sidereal Sun + Moon longitude sum) ---
  const yogaVal = yogaSum(t, settings.ayanamsa);
  const yogaIndex = Math.floor(yogaVal / YOGA_SPAN);
  const yogaFn = (tt: Parameters<typeof yogaSum>[0]) => yogaSum(tt, settings.ayanamsa);
  const yogaStart = findMonotonicCrossing(yogaFn, yogaIndex * YOGA_SPAN, t);
  const yogaEnd = findMonotonicCrossing(yogaFn, (yogaIndex + 1) * YOGA_SPAN, t);

  // --- Masa (lunar month), Amanta system: named after the sidereal solar
  // rashi occupied by the Sun at the Amavasya that begins this lunar month.
  // Purnimanta shifts the month boundary to Purnima instead of Amavasya.
  const sunSid = siderealSunLongitude(t, settings.ayanamsa);
  const rashiIndex = Math.floor(normalizeDeg(sunSid) / 30);
  const amantaMasaIndex = rashiIndex; // Amanta month name follows the solar sign at the New Moon that starts it
  const masaAmanta = MASA_NAMES_AMANTA[amantaMasaIndex % 12];
  // Purnimanta: if we are in Krishna Paksha, the Purnimanta month name is one ahead
  // of the Amanta name (the new Purnimanta month began at the preceding Purnima).
  const masaPurnimanta = paksha === "Krishna" ? MASA_NAMES_AMANTA[(amantaMasaIndex + 1) % 12] : masaAmanta;

  const dateObj = toZonedTime(anchor, location.timezone);
  const weekdayIdx = dateObj.getDay();

  const rahuKalam = riseSet.sunrise && riseSet.sunset
    ? daylightOctant(riseSet.sunrise, riseSet.sunset, RAHU_KALAM_OCTANT[weekdayIdx])
    : null;
  const yamaganda = riseSet.sunrise && riseSet.sunset
    ? daylightOctant(riseSet.sunrise, riseSet.sunset, YAMAGANDA_OCTANT[weekdayIdx])
    : null;
  const gulikaKalam = riseSet.sunrise && riseSet.sunset
    ? daylightOctant(riseSet.sunrise, riseSet.sunset, GULIKA_KALAM_OCTANT[weekdayIdx])
    : null;

  const tithi: TimedValue = {
    name: TITHI_NAMES[tithiIndex],
    index: tithiIndex,
    start: isoOrNull(tithiStart),
    end: isoOrNull(tithiEnd),
  };
  const nakshatra: TimedValue = {
    name: NAKSHATRA_NAMES[nakIndex % 27],
    index: nakIndex % 27,
    start: isoOrNull(nakStart),
    end: isoOrNull(nakEnd),
  };
  const yoga: TimedValue = {
    name: YOGA_NAMES[yogaIndex % 27],
    index: yogaIndex % 27,
    start: isoOrNull(yogaStart),
    end: isoOrNull(yogaEnd),
  };
  const karana: TimedValue = {
    name: karanaNameForIndex(halfTithiIndex % 60),
    index: halfTithiIndex % 60,
    start: isoOrNull(karanaStart),
    end: isoOrNull(karanaEnd),
  };

  return {
    date: dateStr,
    weekday: WEEKDAY_NAMES[weekdayIdx],
    varaSanskrit: VARA_NAMES_SANSKRIT[weekdayIdx],
    sunrise: isoOrNull(riseSet.sunrise),
    sunset: isoOrNull(riseSet.sunset),
    moonrise: isoOrNull(riseSet.moonrise),
    moonset: isoOrNull(riseSet.moonset),
    tithi,
    paksha,
    nakshatra,
    yoga,
    karana,
    masaAmanta,
    masaPurnimanta,
    adhikaMasa: false, // Adhika Masa detection requires cross-checking whether two New Moons fall within one sidereal solar month; see ADHIKA MASA note below.
    rashiOfSun: RASHI_NAMES[rashiIndex % 12],
    isSankranti: false, // set by caller when scanning a range (needs previous day's rashi for comparison)
    isPurnima: tithiIndex === 14,
    isAmavasya: tithiIndex === 29,
    rahuKalam,
    yamaganda,
    gulikaKalam,
    ayanamsaDegrees: ayanamsaDeg,
  };
}

/**
 * Computes Panchanga for a contiguous range of Gregorian dates and fills in
 * range-dependent flags (Sankranti = the Sun's sidereal Rashi changed since
 * the previous day).
 *
 * ADHIKA MASA NOTE: a rigorous Adhika Masa (leap lunar month) detector
 * requires checking whether a sidereal solar month (Sankranti-to-Sankranti)
 * contains zero Amavasyas spanning it vs. two - i.e. comparing consecutive
 * `rashiOfSun` transitions against consecutive Amavasya dates across a full
 * lunar month. This needs a >=60 day rolling window and is intentionally
 * left as `adhikaMasa: false` (a safe default for the vast majority of
 * months) with a clear seam here for a dedicated `detectAdhikaMasa(days)`
 * pass to be wired in once a longer rolling buffer is available upstream.
 */
export function computePanchangaRange(
  dates: string[],
  location: GeoLocation,
  settings: CalculationSettings
): PanchangaDay[] {
  const days = dates.map((d) => computePanchangaDay(d, location, settings));
  for (let i = 1; i < days.length; i++) {
    if (days[i].rashiOfSun !== days[i - 1].rashiOfSun) {
      days[i].isSankranti = true;
    }
  }
  return days;
}

export function formatInLocation(iso: string | null, timezone: string, fmt = "HH:mm"): string {
  if (!iso) return "--:--";
  return formatInTimeZone(new Date(iso), timezone, fmt);
}
