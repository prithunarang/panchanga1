import type { Festival } from "@/lib/panchanga/types";

const TYPE_ICON: Record<string, string> = {
  ekadashi: "🌙",
  fasting: "🟠",
  festival: "🪔",
  purnima: "🌕",
  amavasya: "🌑",
  sankranti: "☀",
  vaishnava: "🕉",
  appearance: "✨",
  disappearance: "🪷",
  chaturmasya: "🛕",
};

export function FestivalBadge({ festival, compact = false }: { festival: Festival; compact?: boolean }) {
  const icon = TYPE_ICON[festival.type] ?? "•";
  return (
    <span
      className={`flex min-w-0 max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 font-medium leading-none ${
        compact ? "text-[9px]" : "text-[10px]"
      }`}
      style={{
        color: festival.color,
        borderColor: `${festival.color}55`,
        background: `${festival.color}14`,
      }}
      title={festival.name}
    >
      <span aria-hidden className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{festival.name}</span>
    </span>
  );
}
