import { EKADASHI_NAMES } from "@/lib/panchanga/constants";
import type { PanchangaDay, Festival, Tradition } from "@/lib/panchanga/types";

/**
 * EKADASHI SELECTION RULE — including the two classical exceptions
 *
 * Because a Tithi's duration (~19-26h) rarely lines up exactly with a 24h
 * civil day, an Ekadashi tithi doesn't always touch exactly one sunrise.
 * Two real, named exceptions follow from that:
 *
 * 1. KSHAYA (short Ekadashi): the Ekadashi tithi is short enough that it
 *    starts *and* ends between two sunrises, so no day's sunrise ever falls
 *    within it — the day after Dashami jumps straight to Dvadashi at
 *    sunrise. Skipping the fast is not acceptable, so both Smarta and
 *    Vaishnava tradition observe the fast on that Dvadashi-sunrise day
 *    instead (a day "suitable for fasting on Dvadashi rather than
 *    Ekadashi").
 *
 * 2. VRIDDHI (long Ekadashi, a.k.a. "Ekadashi viddha with two sunrises"):
 *    the Ekadashi tithi is long enough to span two consecutive sunrises, so
 *    two civil days both technically qualify. Smarta tradition observes the
 *    first day; Vaishnava/Gaudiya tradition observes the *second* day, to
 *    keep the fast entirely clear of any trace of the preceding Dashami
 *    tithi at sunrise.
 *
 * In the ordinary case (Ekadashi touches exactly one sunrise) both
 * traditions agree on the same date.
 *
 * This models the two most commonly cited exceptions in real Vaishnava
 * calendars. It does not attempt every further lineage-specific
 * Trisparsha/Dashami-viddha refinement scholars debate — those require
 * scriptural interpretation beyond what a general-purpose calculation
 * engine can assert as authoritative.
 */

export type EkadashiExceptionType = "none" | "kshaya" | "vriddhi";

export interface EkadashiEpisode {
  dashamiDay: PanchangaDay;
  ekadashiSunriseDay?: PanchangaDay;
  secondEkadashiSunriseDay?: PanchangaDay;
  dvadashiDay: PanchangaDay;
  paranaDay: PanchangaDay;
  smartaDate: string;
  vaishnavaDate: string;
  exceptionType: EkadashiExceptionType;
  tithiStart: string;
  tithiEnd: string;
}

const isEkadashiIndex = (idx: number) => idx === 10 || idx === 25;
const isDashamiIndex = (idx: number) => idx === 9 || idx === 24;
const isDvadashiIndex = (idx: number) => idx === 11 || idx === 26;

/**
 * Walks the computed day range looking for every Dashami->...->Dvadashi
 * transition and classifies each one as a normal, kshaya, or vriddhi
 * Ekadashi episode. Operates purely on the already-computed per-day Tithi
 * boundaries (no extra ephemeris calls needed), since consecutive days'
 * Tithi start/end fields are already contiguous with each other.
 */
export function findEkadashiEpisodes(days: PanchangaDay[]): EkadashiEpisode[] {
  const episodes: EkadashiEpisode[] = [];

  for (let i = 0; i < days.length; i++) {
    const dashamiDay = days[i];
    if (!isDashamiIndex(dashamiDay.tithi.index)) continue;

    const next = days[i + 1];
    if (!next) continue;

    if (isEkadashiIndex(next.tithi.index)) {
      const ekadashiSunriseDay = next;
      let secondEkadashiSunriseDay: PanchangaDay | undefined;
      let dvadashiIndex = i + 2;
      const maybeSecond = days[dvadashiIndex];

      if (maybeSecond && isEkadashiIndex(maybeSecond.tithi.index)) {
        secondEkadashiSunriseDay = maybeSecond;
        dvadashiIndex = i + 3;
      }

      const dvadashiDay = days[dvadashiIndex];
      const paranaDay = dvadashiDay; // Parana is always taken during the Dvadashi tithi in the normal/vriddhi case
      if (!dvadashiDay) continue; // ran off the end of the buffered range

      const smartaDate = ekadashiSunriseDay.date;
      const vaishnavaDate = secondEkadashiSunriseDay ? secondEkadashiSunriseDay.date : ekadashiSunriseDay.date;

      episodes.push({
        dashamiDay,
        ekadashiSunriseDay,
        secondEkadashiSunriseDay,
        dvadashiDay,
        paranaDay,
        smartaDate,
        vaishnavaDate,
        exceptionType: secondEkadashiSunriseDay ? "vriddhi" : "none",
        tithiStart: ekadashiSunriseDay.tithi.start ?? ekadashiSunriseDay.date,
        tithiEnd: ekadashiSunriseDay.tithi.end ?? ekadashiSunriseDay.date,
      });
    } else if (isDvadashiIndex(next.tithi.index)) {
      // Kshaya: Ekadashi tithi never touched a sunrise. Dashami's tithi.end
      // and Dvadashi's tithi.start are the same instant (the Ekadashi
      // tithi's boundaries), so we can reconstruct its interval without
      // it ever having been a day's "sunrise tithi".
      const dvadashiDay = next;
      const paranaDay = days[i + 2]; // the day after the Dvadashi/fasting day
      if (!paranaDay) continue;

      episodes.push({
        dashamiDay,
        ekadashiSunriseDay: undefined,
        secondEkadashiSunriseDay: undefined,
        dvadashiDay,
        paranaDay,
        smartaDate: dvadashiDay.date,
        vaishnavaDate: dvadashiDay.date,
        exceptionType: "kshaya",
        tithiStart: dashamiDay.tithi.end ?? dashamiDay.date,
        tithiEnd: dvadashiDay.tithi.start ?? dvadashiDay.date,
      });
    }
  }

  return episodes;
}

export interface EkadashiEvent {
  name: string;
  ekadashiDate: string;
  paksha: "Shukla" | "Krishna";
  masa: string;
  tithiStart: string;
  tithiEnd: string;
  sunrise: string | null;
  paranaDate: string;
  paranaStart: string;
  paranaEnd: string;
  suitableForFasting: boolean;
  exceptionType: EkadashiExceptionType;
  explanation: string;
}

function traditionUsesVaishnavaDate(tradition: Tradition): boolean {
  return tradition === "vaishnava" || tradition === "gaudiya";
}

/**
 * Resolves one Ekadashi episode into the concrete fasting + Parana (fast-
 * breaking) record for the requested tradition. The fast-breaking window
 * always uses the *actual* Parana day's Tithi boundaries (Dvadashi in the
 * normal/vriddhi case, or the day after in the rare kshaya case), so the
 * exception itself flows correctly into the displayed breaking time.
 */
export function buildEkadashiEvent(episode: EkadashiEpisode, tradition: Tradition): EkadashiEvent {
  const paksha: "Shukla" | "Krishna" = episode.dashamiDay.tithi.index === 9 ? "Shukla" : "Krishna";
  // Ekadashi (like other Krishna-paksha festivals) is conventionally named after the
  // Purnimanta month, not the Amanta month - see the same convention documented in
  // rules.ts. For Shukla paksha the two systems agree, so this is a no-op there.
  const masa = (episode.ekadashiSunriseDay ?? episode.dvadashiDay).masaPurnimanta;
  const names = EKADASHI_NAMES[masa as keyof typeof EKADASHI_NAMES];
  const name = names ? (paksha === "Shukla" ? names.shukla : names.krishna) : `${masa} ${paksha} Ekadashi`;

  const useVaishnava = traditionUsesVaishnavaDate(tradition);
  const fastDate = useVaishnava ? episode.vaishnavaDate : episode.smartaDate;

  const { paranaDay } = episode;
  const paranaTithiStart = paranaDay.tithi.start ? new Date(paranaDay.tithi.start) : null;
  const paranaTithiEnd = paranaDay.tithi.end ? new Date(paranaDay.tithi.end) : null;
  const paranaSunrise = paranaDay.sunrise ? new Date(paranaDay.sunrise) : null;
  const paranaSunset = paranaDay.sunset ? new Date(paranaDay.sunset) : null;

  let paranaStart: Date;
  let paranaEnd: Date;

  if (paranaTithiStart && paranaTithiEnd && paranaSunrise) {
    // Classical rule (verified against a real Vaishnava almanac to the minute):
    // Parana opens after sunrise, once Hari-vasara (the first quarter of the
    // Parana tithi) has elapsed, and must be completed by the EARLIER of (a)
    // the end of that tithi, or (b) one-third of that day's daylight length
    // past sunrise - not simply "whenever the tithi ends", which can run
    // hours past the actual permitted window.
    const durationMs = paranaTithiEnd.getTime() - paranaTithiStart.getTime();
    const hariVasaraEnd = new Date(paranaTithiStart.getTime() + durationMs * 0.25);
    paranaStart = hariVasaraEnd > paranaSunrise ? hariVasaraEnd : paranaSunrise;

    const oneThirdDayEnd = paranaSunset
      ? new Date(paranaSunrise.getTime() + (paranaSunset.getTime() - paranaSunrise.getTime()) / 3)
      : paranaTithiEnd;
    paranaEnd = oneThirdDayEnd < paranaTithiEnd ? oneThirdDayEnd : paranaTithiEnd;

    if (paranaEnd <= paranaStart) {
      // Tithi is unusually short (khanda) - fall back to a conservative sunrise-anchored window
      paranaStart = paranaSunrise;
      paranaEnd = new Date(paranaSunrise.getTime() + 48 * 60 * 1000);
    }
  } else {
    const fallback = paranaSunrise ?? new Date(`${paranaDay.date}T06:00:00`);
    paranaStart = fallback;
    paranaEnd = new Date(fallback.getTime() + 3 * 60 * 60 * 1000);
  }

  let explanation: string;
  if (episode.exceptionType === "kshaya") {
    explanation =
      `${name} falls in a cycle where the Ekadashi tithi is short enough that it never spans a sunrise ` +
      `(a "kshaya" or short Ekadashi). Per traditional rule, the fast is observed on ${fastDate} instead — the ` +
      `day whose sunrise falls in Dvadashi — since skipping the fast entirely is not an option. Parana is taken ` +
      `the following morning during the Trayodashi tithi.`;
  } else if (episode.exceptionType === "vriddhi") {
    explanation = useVaishnava
      ? `The Ekadashi tithi this cycle spans two consecutive sunrises (a "vriddhi" or long Ekadashi). Smarta ` +
        `tradition would observe it on ${episode.smartaDate}, but Vaishnava/Gaudiya tradition observes the ` +
        `*second* day (${episode.vaishnavaDate}) to keep the fast entirely clear of any trace of the preceding ` +
        `Dashami tithi at sunrise.`
      : `The Ekadashi tithi this cycle spans two consecutive sunrises (a "vriddhi" or long Ekadashi). This ` +
        `tradition observes the first qualifying day, ${episode.smartaDate}.`;
  } else {
    explanation =
      `${name} falls when the Ekadashi tithi (${paksha} Paksha, ${masa} masa) is present at sunrise on ${fastDate}. ` +
      `Parana (breaking the fast) is prescribed after the following sunrise, once Hari-vasara (the first quarter ` +
      `of Dvadashi tithi) has elapsed, and must be completed within one-third of that day's length (or before ` +
      `Dvadashi tithi ends, if that comes sooner).`;
  }

  return {
    name,
    ekadashiDate: fastDate,
    paksha,
    masa,
    tithiStart: episode.tithiStart,
    tithiEnd: episode.tithiEnd,
    sunrise: (useVaishnava ? episode.secondEkadashiSunriseDay ?? episode.ekadashiSunriseDay : episode.ekadashiSunriseDay)?.sunrise ?? episode.dvadashiDay.sunrise,
    paranaDate: paranaDay.date,
    paranaStart: paranaStart.toISOString(),
    paranaEnd: paranaEnd.toISOString(),
    suitableForFasting: true,
    exceptionType: episode.exceptionType,
    explanation,
  };
}

export function ekadashiToFestival(ev: EkadashiEvent, tradition: Tradition): Festival {
  return {
    id: `ekadashi-${ev.ekadashiDate}`,
    date: ev.ekadashiDate,
    name: ev.name,
    type: "ekadashi",
    tradition,
    description:
      ev.exceptionType === "kshaya"
        ? `${ev.paksha} Paksha Ekadashi of ${ev.masa} masa — a short (kshaya) Ekadashi, so fasting is observed on this Dvadashi day.`
        : ev.exceptionType === "vriddhi"
          ? `${ev.paksha} Paksha Ekadashi of ${ev.masa} masa — a long (vriddhi) Ekadashi spanning two sunrises.`
          : `${ev.paksha} Paksha Ekadashi of ${ev.masa} masa. A day of fasting (upavasa) and increased remembrance, followed by Parana the next morning.`,
    significance:
      `${ev.name} is one of the 24-26 Ekadashis observed each year, each carrying its own name and Puranic story. ` +
      "Ekadashi fasting is described in the Padma Purana and other texts as one of the most purifying Vaishnava " +
      "observances, traditionally kept by abstaining from grains and beans (said to harbor subtle sinful reactions) " +
      "and dedicating the day to remembrance of Vishnu/Krishna.",
    fastingRequired: true,
    fastingType:
      ev.exceptionType === "kshaya"
        ? "Ekadashi upavasa observed on Dvadashi tithi (kshaya exception)"
        : "Ekadashi upavasa (full or partial fast, grain and beans avoided)",
    exceptionNote:
      ev.exceptionType === "kshaya"
        ? "Kshaya Ekadashi — fasting observed on Dvadashi, not Ekadashi"
        : ev.exceptionType === "vriddhi"
          ? `Vriddhi Ekadashi — ${tradition === "vaishnava" || tradition === "gaudiya" ? "second" : "first"} day observed`
          : undefined,
    paranaDate: ev.paranaDate,
    paranaStart: ev.paranaStart,
    paranaEnd: ev.paranaEnd,
    specialTimings: {
      tithiStart: ev.tithiStart,
      tithiEnd: ev.tithiEnd,
      sunrise: ev.sunrise,
    },
    locationDependent: true,
    priority: 1,
    color: "#D97732",
    explanation: ev.explanation,
  };
}
