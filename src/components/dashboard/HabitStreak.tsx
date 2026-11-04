"use client";

import React, { useEffect, useState } from "react";
import { Check, Flame } from "lucide-react";

type HabitDay = { day: string; done: boolean };

type HabitStreakProps = {
  streak?: number;
  initialDays?: HabitDay[];
  onViewAll: () => void;
};

const EMPTY_DAYS: HabitDay[] = [
  { day: "Mon", done: false },
  { day: "Tue", done: false },
  { day: "Wed", done: false },
  { day: "Thu", done: false },
  { day: "Fri", done: false },
  { day: "Sat", done: false },
  { day: "Sun", done: false },
];

export default function HabitStreak({
  streak = 0,
  initialDays = EMPTY_DAYS,
  onViewAll,
}: HabitStreakProps) {
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    setDays(initialDays);
  }, [initialDays]);

  return (
    <section className="df-card df-card-lift p-3.5 sm:p-4 rounded-[18px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#d9822b]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Habit Streak
          </h3>
        </div>
        <span className="text-[10px] font-bold text-[#d9822b] bg-[#fff1e8] px-2 py-0.5 rounded-full">
          {streak} Days
        </span>
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="group"
        aria-label="Weekly habit streak"
      >
        {days.map((d, index) => (
          <div key={d.day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-[var(--foreground-muted)]">
              {d.day}
            </span>
            <button
              type="button"
              aria-label={`${d.day} ${d.done ? "completed" : "pending"}`}
              aria-pressed={d.done}
              onClick={() =>
                setDays((prev) =>
                  prev.map((day, i) =>
                    i === index ? { ...day, done: !day.done } : day
                  )
                )
              }
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer df-focus-ring ${
                d.done
                  ? "bg-[#1f4d36] text-white shadow-xs df-check-pop"
                  : "border border-[#cbd5cb] bg-white hover:border-[#2e7d32]"
              }`}
            >
              {d.done && <Check className="w-3 h-3 stroke-[3]" aria-hidden />}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-2 pt-0.5">
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
        >
          View Habits →
        </button>
      </div>
    </section>
  );
}
