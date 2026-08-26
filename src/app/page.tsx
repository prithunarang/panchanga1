"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { usePanchangaData } from "@/lib/usePanchangaData";
import { groupFestivalsByDate } from "@/lib/festivals/engine";
import { todayInTimezone } from "@/lib/format";
import type { Festival, PanchangaDay } from "@/lib/panchanga/types";

import { Header } from "@/components/Header";
import { MonthNavigator } from "@/components/MonthNavigator";
import { CalendarGrid } from "@/components/CalendarGrid";
import { FilterChips, type FilterKey } from "@/components/FilterChips";
import { Dashboard } from "@/components/Dashboard";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { YearView } from "@/components/YearView";
import { DayDetailsPanel } from "@/components/DayDetailsPanel";
import { FestivalDetails } from "@/components/FestivalDetails";
import { LocationSelector } from "@/components/LocationSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SearchModal } from "@/components/SearchModal";
import { AboutModal } from "@/components/AboutModal";
import { CalculationDetails } from "@/components/CalculationDetails";
import { Footer } from "@/components/Footer";

function daysInYear(year: number): number {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
}

export default function HomePage() {
  const { location, settings } = useSettings();
  const now = new Date();

  const [view, setView] = useState<"month" | "year">("month");
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const rangeStart = `${displayYear}-01-01`;
  const rangeCount = daysInYear(displayYear) + 40;
  const { data, loading, error } = usePanchangaData(rangeStart, rangeCount, location, settings);

  const todayStr = todayInTimezone(location.timezone);

  const daysByDate = useMemo(() => {
    const map = new Map<string, PanchangaDay>();
    data?.days.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  const allFestivalsByDate = useMemo(() => groupFestivalsByDate(data?.festivals ?? []), [data]);

  const filteredFestivalsByDate = useMemo(() => {
    if (filter === "all") return allFestivalsByDate;
    const map = new Map<string, Festival[]>();
    for (const [date, list] of allFestivalsByDate) {
      const filtered = list.filter((f) => f.type === filter);
      if (filtered.length) map.set(date, filtered);
    }
    return map;
  }, [allFestivalsByDate, filter]);

  const upcomingFestivals = useMemo(() => {
    return (data?.festivals ?? [])
      .filter((f) => f.date >= todayStr && (filter === "all" || f.type === filter))
      .slice(0, 8);
  }, [data, todayStr, filter]);

  const nextFast = useMemo(
    () => (data?.festivals ?? []).find((f) => f.date >= todayStr && f.fastingRequired),
    [data, todayStr]
  );
  const nextFestival = useMemo(
    () => (data?.festivals ?? []).find((f) => f.date >= todayStr && !f.fastingRequired && f.type === "festival"),
    [data, todayStr]
  );

  const todayPanchanga = daysByDate.get(todayStr);
  const selectedDay = selectedDate ? daysByDate.get(selectedDate) : undefined;
  const selectedDayFestivals = selectedDate ? allFestivalsByDate.get(selectedDate) ?? [] : [];
  const selectedFestivalDay = selectedFestival ? daysByDate.get(selectedFestival.date) : undefined;

  const goToMonth = (year: number, month: number) => {
    if (month < 0) {
      setDisplayYear(year - 1);
      setDisplayMonth(11);
    } else if (month > 11) {
      setDisplayYear(year + 1);
      setDisplayMonth(0);
    } else {
      setDisplayYear(year);
      setDisplayMonth(month);
    }
  };

  const jumpToDate = (dateStr: string) => {
    const [y, m] = dateStr.split("-").map(Number);
    setDisplayYear(y);
    setDisplayMonth(m - 1);
    setView("month");
    setSelectedDate(dateStr);
  };

  return (
    <>
      <Header
        view={view}
        onChangeView={setView}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 pb-8 pt-5 sm:px-6">
        <div className="mb-5">
          <Dashboard today={todayPanchanga} nextFast={nextFast} nextFestival={nextFestival} onSelectDate={jumpToDate} />
        </div>

        <div className="mb-4">
          <FilterChips active={filter} onChange={setFilter} />
        </div>

        {error && (
          <div className="glass-card mb-4 border-l-4 border-l-red-400 p-4 text-sm text-red-500">
            Could not load Panchanga data: {error}
          </div>
        )}

        {view === "month" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-4">
              <MonthNavigator
                year={displayYear}
                month={displayMonth}
                onPrev={() => goToMonth(displayYear, displayMonth - 1)}
                onNext={() => goToMonth(displayYear, displayMonth + 1)}
                onToday={() => {
                  setDisplayYear(now.getFullYear());
                  setDisplayMonth(now.getMonth());
                  setView("month");
                }}
              />
              <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <CalendarGrid
                  year={displayYear}
                  month={displayMonth}
                  todayStr={todayStr}
                  selectedDate={selectedDate}
                  daysByDate={daysByDate}
                  festivalsByDate={filteredFestivalsByDate}
                  onSelectDate={setSelectedDate}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <UpcomingEvents festivals={upcomingFestivals} onSelect={setSelectedFestival} />
              <CalculationDetails location={location} settings={settings} ayanamsaDegrees={todayPanchanga?.ayanamsaDegrees} />
            </div>
          </div>
        ) : (
          <YearView
            year={displayYear}
            daysByDate={daysByDate}
            festivalsByDate={filteredFestivalsByDate}
            todayStr={todayStr}
            onSelectMonth={(m) => {
              setDisplayMonth(m);
              setView("month");
            }}
            onSelectDate={setSelectedDate}
          />
        )}
      </main>

      <Footer onOpenSettings={() => setSettingsOpen(true)} onOpenAbout={() => setAboutOpen(true)} />

      <DayDetailsPanel day={selectedDay ?? null} festivals={selectedDayFestivals} timezone={location.timezone} onClose={() => setSelectedDate(null)} />
      <FestivalDetails festival={selectedFestival} day={selectedFestivalDay} onClose={() => setSelectedFestival(null)} />
      <LocationSelector open={locationOpen} onClose={() => setLocationOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} festivals={data?.festivals ?? []} onSelectDate={jumpToDate} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
