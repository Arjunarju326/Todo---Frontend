"use client";

import React, { useMemo } from "react";
import { Check, Flame } from "lucide-react";

type TaskLike = {
  status: string;
  completedAt?: string;
  dueDate?: string;
};

type TaskStreakProps = {
  tasks: TaskLike[];
  onViewAll?: () => void;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDay(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}

/** Consecutive days (ending today or yesterday) with ≥1 completed task. */
export function computeTaskStreak(tasks: TaskLike[]) {
  const doneDays = new Set<string>();
  for (const t of tasks) {
    if (t.status !== "DONE") continue;
    const raw = t.completedAt || t.dueDate;
    if (!raw) continue;
    doneDays.add(isoDay(new Date(raw)));
  }

  const today = startOfDay(new Date());
  let cursor = today;
  // Allow streak to start from yesterday if nothing done today yet
  if (!doneDays.has(isoDay(cursor))) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!doneDays.has(isoDay(yesterday))) return 0;
    cursor = yesterday;
  }

  let streak = 0;
  while (doneDays.has(isoDay(cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function TaskStreak({ tasks, onViewAll }: TaskStreakProps) {
  const streak = useMemo(() => computeTaskStreak(tasks), [tasks]);

  const weekDays = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = startOfDay(new Date());
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);

    const doneDays = new Set<string>();
    for (const t of tasks) {
      if (t.status !== "DONE") continue;
      const raw = t.completedAt || t.dueDate;
      if (!raw) continue;
      doneDays.add(isoDay(new Date(raw)));
    }

    return labels.map((day, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { day, done: doneDays.has(isoDay(d)), date: d };
    });
  }, [tasks]);

  return (
    <section className="df-card df-card-lift df-doodle-card p-3.5 sm:p-4 rounded-[18px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#d9822b]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Task Streak
          </h3>
        </div>
        <span className="text-[10px] font-bold text-[#d9822b] bg-[#fff1e8] px-2 py-0.5 rounded-full">
          {streak} day{streak === 1 ? "" : "s"}
        </span>
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="group"
        aria-label="Weekly task completion streak"
      >
        {weekDays.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-[var(--foreground-muted)]">
              {d.day}
            </span>
            <div
              aria-label={`${d.day} ${d.done ? "completed" : "missed"}`}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                d.done
                  ? "bg-[#1f4d36] text-white shadow-xs df-check-pop"
                  : "border border-[#cbd5cb] bg-white/80"
              }`}
            >
              {d.done && <Check className="w-3 h-3 stroke-[3]" aria-hidden />}
            </div>
          </div>
        ))}
      </div>

      {onViewAll ? (
        <div className="flex justify-end mt-2 pt-0.5">
          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md"
          >
            View tasks →
          </button>
        </div>
      ) : null}
    </section>
  );
}
