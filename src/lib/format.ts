import { formatInTimeZone } from "date-fns-tz";

export function fmtTime(iso: string | null | undefined, timezone: string): string {
  if (!iso) return "--:--";
  return formatInTimeZone(new Date(iso), timezone, "h:mm a");
}

export function fmtTimeShort(iso: string | null | undefined, timezone: string): string {
  if (!iso) return "--:--";
  return formatInTimeZone(new Date(iso), timezone, "HH:mm");
}

/**
 * Formats a start→end range, appending a "(+Nd)" marker to the end time
 * whenever it falls on a later calendar day than the start (common for
 * Tithi/Nakshatra/Yoga spans, which often run ~20-26 hours). Without this,
 * a range like "2:01 AM → 4:19 AM" reads as ~2 hours when it actually spans
 * into the next day.
 */
export function fmtRange(startIso: string | null, endIso: string | null, timezone: string): string {
  const start = fmtTime(startIso, timezone);
  const end = fmtTime(endIso, timezone);
  if (!startIso || !endIso) return `${start} → ${end}`;

  const startDay = formatInTimeZone(new Date(startIso), timezone, "yyyy-MM-dd");
  const endDay = formatInTimeZone(new Date(endIso), timezone, "yyyy-MM-dd");
  if (startDay === endDay) return `${start} → ${end}`;

  const dayDiff = Math.round((new Date(endDay).getTime() - new Date(startDay).getTime()) / 86400000);
  return `${start} → ${end} (+${dayDiff}d)`;
}

export function fmtDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function fmtDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayInTimezone(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const FESTIVAL_TYPE_COLORS: Record<string, string> = {
  ekadashi: "#D97732",
  fasting: "#D97732",
  festival: "#7A2946",
  purnima: "#C9A227",
  amavasya: "#171A3A",
  sankranti: "#C9A227",
  vaishnava: "#171A3A",
  appearance: "#7A2946",
  disappearance: "#565070",
  chaturmasya: "#171A3A",
};
