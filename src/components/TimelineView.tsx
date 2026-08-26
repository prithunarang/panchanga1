"use client";

import type { PanchangaDay, Festival } from "@/lib/panchanga/types";
import { fmtTime } from "@/lib/format";

interface TimelineEvent {
  time: string;
  label: string;
  color: string;
}

function buildTimeline(day: PanchangaDay, festivals: Festival[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const push = (iso: string | null | undefined, label: string, color: string) => {
    if (iso) events.push({ time: iso, label, color });
  };

  push(day.sunrise, "Sunrise", "#D97732");
  push(day.tithi.start, `${day.tithi.name} tithi begins`, "#7A2946");
  push(day.karana.start, `${day.karana.name} karana begins`, "#565070");
  push(day.nakshatra.start, `${day.nakshatra.name} Nakshatra begins`, "#171A3A");
  push(day.yoga.start, `${day.yoga.name} Yoga begins`, "#C9A227");
  push(day.moonrise, "Moonrise", "#171A3A");
  for (const f of festivals) {
    push(f.specialTimings?.tithiStart, `${f.name} — Tithi begins`, f.color);
    push(f.paranaStart ?? null, `${f.name} — Parana window opens`, f.color);
    push(f.paranaEnd ?? null, `${f.name} — Parana window closes`, f.color);
  }
  push(day.tithi.end, `${day.tithi.name} tithi ends`, "#7A2946");
  push(day.karana.end, `${day.karana.name} karana ends`, "#565070");
  push(day.nakshatra.end, `${day.nakshatra.name} Nakshatra ends`, "#171A3A");
  push(day.yoga.end, `${day.yoga.name} Yoga ends`, "#C9A227");
  push(day.moonset, "Moonset", "#171A3A");
  push(day.sunset, "Sunset", "#7A2946");

  return events
    .filter((e, i, arr) => arr.findIndex((x) => x.time === e.time && x.label === e.label) === i)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export function TimelineView({ day, festivals, timezone }: { day: PanchangaDay; festivals: Festival[]; timezone: string }) {
  const events = buildTimeline(day, festivals);

  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-serif-display mb-3 text-lg font-semibold">Daily Timeline</h3>
      <ol className="relative ml-2 border-l border-[var(--glass-border)] pl-5">
        {events.map((e, i) => (
          <li key={i} className="relative pb-4 last:pb-0">
            <span
              className="absolute -left-[1.65rem] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--ivory)]"
              style={{ background: e.color }}
              aria-hidden
            />
            <div className="text-xs font-semibold tabular-nums text-[var(--ink-soft)]">{fmtTime(e.time, timezone)}</div>
            <div className="text-sm">{e.label}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
