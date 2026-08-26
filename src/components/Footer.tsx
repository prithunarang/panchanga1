"use client";

export function Footer({ onOpenSettings, onOpenAbout }: { onOpenSettings: () => void; onOpenAbout: () => void }) {
  return (
    <footer className="mx-auto mt-10 mb-6 max-w-7xl px-4 text-center sm:px-6">
      <div className="gold-divider mb-4" />
      <p className="mx-auto max-w-2xl text-xs leading-relaxed text-[var(--ink-soft)]">
        Panchanga calculations are generated from real astronomical positions and location-specific sunrise/sunset
        data. Festival dates may vary according to geographical location and calendar tradition.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
        <button onClick={onOpenSettings} className="focus-ring rounded text-[var(--saffron)] underline-offset-2 hover:underline">
          Calculation Settings
        </button>
        <span className="text-[var(--ink-soft)]">·</span>
        <button onClick={onOpenAbout} className="focus-ring rounded text-[var(--saffron)] underline-offset-2 hover:underline">
          About Panchanga
        </button>
      </div>
    </footer>
  );
}
