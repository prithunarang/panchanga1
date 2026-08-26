import { NextRequest, NextResponse } from "next/server";
import { computePanchangaRange } from "@/lib/panchanga/calculator";
import { generateFestivals } from "@/lib/festivals/engine";
import type { AyanamsaSystem, GeoLocation } from "@/lib/astronomy";
import type { CalculationSettings, Tradition } from "@/lib/panchanga/types";

export const runtime = "nodejs";

/**
 * Server-side calculation endpoint. All Panchanga math happens here (not in
 * client bundles) so the astronomy engine can later be swapped for a
 * heavier/more precise backend (Swiss Ephemeris, a dedicated microservice,
 * etc.) without touching the UI. Clients ask for a date range + location +
 * settings and get back real computed Panchanga days and festivals.
 */

function daysInRange(startDate: string, count: number): string[] {
  const out: string[] = [];
  const [y, m, d] = startDate.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d));
  for (let i = 0; i < count; i++) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const count = Number(searchParams.get("count") ?? "35");
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const timezone = searchParams.get("timezone") ?? "Asia/Kolkata";
  const ayanamsa = (searchParams.get("ayanamsa") ?? "lahiri") as AyanamsaSystem;
  const calendarSystem = (searchParams.get("calendarSystem") ?? "amanta") as CalculationSettings["calendarSystem"];
  const tradition = (searchParams.get("tradition") ?? "general") as Tradition;
  const includeSampleData = searchParams.get("includeSampleData") === "true";

  if (!start || Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "start, lat, lon are required" }, { status: 400 });
  }
  if (count < 1 || count > 420) {
    return NextResponse.json({ error: "count must be between 1 and 420" }, { status: 400 });
  }

  const location: GeoLocation = { latitude: lat, longitude: lon, timezone };
  const settings: CalculationSettings = { ayanamsa, calendarSystem, tradition };

  // Buffer a few days on each side so festival rules that peek at prevDay/nextDay
  // near range boundaries still have context.
  const bufferedStart = daysInRange(start, 1)[0];
  const startCursor = new Date(`${bufferedStart}T00:00:00Z`);
  startCursor.setUTCDate(startCursor.getUTCDate() - 2);
  const bufferedStartStr = startCursor.toISOString().slice(0, 10);
  const dates = daysInRange(bufferedStartStr, count + 4);

  try {
    const days = computePanchangaRange(dates, location, settings);
    const festivals = generateFestivals(days, location, { tradition, includeSampleData });

    const requestedDates = new Set(daysInRange(start, count));
    const filteredDays = days.filter((d) => requestedDates.has(d.date));
    const filteredFestivals = festivals.filter((f) => requestedDates.has(f.date));

    return NextResponse.json({
      location,
      settings,
      days: filteredDays,
      festivals: filteredFestivals,
    });
  } catch (err) {
    console.error("Panchanga calculation failed", err);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
