import type { GeoLocation } from "@/lib/astronomy";
import type { PanchangaDay, Festival, Tradition } from "@/lib/panchanga/types";
import { allFestivalRules } from "./rules";
import { findEkadashiEpisodes, buildEkadashiEvent, ekadashiToFestival } from "./ekadashi";

export interface FestivalEngineOptions {
  tradition: Tradition;
  includeSampleData?: boolean;
}

/**
 * Whether a rule tagged `ruleTradition` should be shown to a user who has
 * selected `selected` as their calendar tradition. Traditions nest: every
 * Vaishnava calendar includes general Hindu observances, and every Gaudiya
 * Vaishnava calendar includes both general and (broader) Vaishnava ones, on
 * top of its own acharya-specific days. "Custom" shows everything so the
 * user can narrow with the UI filter chips instead.
 */
function ruleVisibleForTradition(ruleTradition: Tradition, selected: Tradition): boolean {
  switch (selected) {
    case "gaudiya":
      return ruleTradition === "general" || ruleTradition === "vaishnava" || ruleTradition === "gaudiya";
    case "vaishnava":
      return ruleTradition === "general" || ruleTradition === "vaishnava";
    case "smarta":
      return ruleTradition === "general" || ruleTradition === "smarta";
    case "general":
      return ruleTradition === "general";
    case "custom":
    default:
      return true;
  }
}

/**
 * Runs the full festival rule engine (Ekadashi + general rules) against a
 * computed range of Panchanga days and returns a flat, date-indexed list of
 * Festival records. This is the single seam a caller needs: give it real
 * computed Panchanga, get back real, location/tradition-aware observances.
 */
export function generateFestivals(
  days: PanchangaDay[],
  location: GeoLocation,
  options: FestivalEngineOptions
): Festival[] {
  const festivals: Festival[] = [];

  for (const episode of findEkadashiEpisodes(days)) {
    const event = buildEkadashiEvent(episode, options.tradition);
    festivals.push(ekadashiToFestival(event, options.tradition));
  }

  const rules = allFestivalRules(options.includeSampleData ?? false).filter((rule) =>
    ruleVisibleForTradition(rule.tradition, options.tradition)
  );

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const ctx = { prevDay: days[i - 1], nextDay: days[i + 1] };
    for (const rule of rules) {
      if (rule.match(day, ctx)) {
        const breaking = rule.breakingTime?.(day, ctx);
        festivals.push({
          id: `${rule.id}-${day.date}`,
          date: day.date,
          name: typeof rule.name === "function" ? rule.name(day) : rule.name,
          type: rule.type,
          tradition: rule.tradition,
          description: rule.describe(day),
          significance: rule.significance,
          fastingRequired: rule.fastingRequired,
          fastingType: rule.fastingType,
          paranaDate: breaking?.paranaDate,
          paranaStart: breaking?.paranaStart,
          paranaEnd: breaking?.paranaEnd,
          locationDependent: true,
          priority: rule.priority,
          color: rule.color,
          explanation: rule.explain(day),
          isSampleData: rule.isSampleData,
        });
      }
    }
  }

  return festivals.sort((a, b) => (a.date === b.date ? a.priority - b.priority : a.date.localeCompare(b.date)));
}

export function groupFestivalsByDate(festivals: Festival[]): Map<string, Festival[]> {
  const map = new Map<string, Festival[]>();
  for (const f of festivals) {
    const arr = map.get(f.date) ?? [];
    arr.push(f);
    map.set(f.date, arr);
  }
  return map;
}
