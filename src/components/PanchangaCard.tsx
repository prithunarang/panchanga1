"use client";

import { Sunrise, Sunset, Moon as MoonIcon, MoonStar } from "lucide-react";
import type { PanchangaDay } from "@/lib/panchanga/types";
import { fmtTime, fmtRange } from "@/lib/format";

interface PanchangaCardProps {
  day: PanchangaDay;
  timezone: string;
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--glass-border)] py-2 last:border-b-0">
      <span className="text-sm text-[var(--ink-soft)]">{label}</span>
      <div className="text-right">
        <div className="text-sm font-medium">{value}</div>
        {sub && <div className="text-[11px] text-[var(--ink-soft)]">{sub}</div>}
      </div>
    </div>
  );
}

export function PanchangaCard({ day, timezone }: PanchangaCardProps) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-serif-display mb-2 text-lg font-semibold">Panchanga</h3>
      <div>
        <Row label="Tithi" value={day.tithi.name} sub={fmtRange(day.tithi.start, day.tithi.end, timezone)} />
        <Row label="Paksha" value={`${day.paksha} Paksha`} />
        <Row label="Nakshatra" value={day.nakshatra.name} sub={fmtRange(day.nakshatra.start, day.nakshatra.end, timezone)} />
        <Row label="Yoga" value={day.yoga.name} sub={fmtRange(day.yoga.start, day.yoga.end, timezone)} />
        <Row label="Karana" value={day.karana.name} sub={fmtRange(day.karana.start, day.karana.end, timezone)} />
        <Row label="Vara" value={day.varaSanskrit} />
        <Row label="Masa (Amanta)" value={day.masaAmanta} />
        <Row label="Masa (Purnimanta)" value={day.masaPurnimanta} />
        <Row label="Sun's Rashi" value={day.rashiOfSun} />
      </div>

      <div className="gold-divider my-3" />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Sunrise size={16} className="text-[var(--saffron)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Sunrise</div>
            <div className="text-sm font-medium">{fmtTime(day.sunrise, timezone)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sunset size={16} className="text-[var(--maroon)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Sunset</div>
            <div className="text-sm font-medium">{fmtTime(day.sunset, timezone)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MoonIcon size={16} className="text-[var(--indigo)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Moonrise</div>
            <div className="text-sm font-medium">{fmtTime(day.moonrise, timezone)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MoonStar size={16} className="text-[var(--indigo-soft)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Moonset</div>
            <div className="text-sm font-medium">{fmtTime(day.moonset, timezone)}</div>
          </div>
        </div>
      </div>

      {(day.rahuKalam || day.yamaganda || day.gulikaKalam) && (
        <>
          <div className="gold-divider my-3" />
          <div className="grid grid-cols-3 gap-2 text-center">
            {day.rahuKalam && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Rahu Kalam</div>
                <div className="text-xs font-medium">{fmtTime(day.rahuKalam[0], timezone)}–{fmtTime(day.rahuKalam[1], timezone)}</div>
              </div>
            )}
            {day.yamaganda && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Yamaganda</div>
                <div className="text-xs font-medium">{fmtTime(day.yamaganda[0], timezone)}–{fmtTime(day.yamaganda[1], timezone)}</div>
              </div>
            )}
            {day.gulikaKalam && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Gulika Kalam</div>
                <div className="text-xs font-medium">{fmtTime(day.gulikaKalam[0], timezone)}–{fmtTime(day.gulikaKalam[1], timezone)}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
