"use client";

import React from "react";
import { Check, Target } from "lucide-react";

export type FocusTask = {
  id: string;
  title: string;
  category: string;
  priority?: "High" | "Medium" | "Low";
  time: string;
  done: boolean;
};

type FocusListProps = {
  tasks: FocusTask[];
  completed: number;
  total: number;
  onToggle: (task: FocusTask) => void;
  onViewAll: () => void;
  isDone: (task: FocusTask) => boolean;
};

export default function FocusList({
  tasks,
  completed,
  total,
  onToggle,
  onViewAll,
  isDone,
}: FocusListProps) {
  const pct = Math.round((completed / Math.max(total, 1)) * 100);

  return (
    <section className="df-card p-3.5 sm:p-4 rounded-[18px] animate-df-fade-up h-full flex flex-col justify-between" style={{ animationDelay: "120ms" }}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2e7d32]" aria-hidden />
            <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
              Today&apos;s Focus
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[var(--foreground-muted)]">
            {completed} of {total} completed
          </span>
        </div>

        <div
          className="h-1.5 rounded-full bg-[#eef2ee] overflow-hidden mb-3 df-progress-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${completed} of ${total} tasks completed`}
        >
          <span
            className="block h-full rounded-full bg-[#2e7d32]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="space-y-1.5">
          {tasks.map((task) => {
            const done = isDone(task);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onToggle(task)}
                  aria-pressed={done}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#edf1ed] bg-white hover:bg-[var(--accent-mint)] hover:border-[#c5d9c5] transition-all duration-150 text-left cursor-pointer group df-focus-ring"
                >
                  <span
                    className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all duration-150 ${
                      done
                        ? "bg-[#2e7d32] border border-[#2e7d32] text-white df-check-pop"
                        : "border border-[#b7c4b8] bg-white group-hover:border-[#2e7d32]"
                    }`}
                    aria-hidden
                  >
                    {done && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <p
                    className={`text-[12px] font-semibold transition-colors truncate min-w-0 max-w-[200px] xl:max-w-[260px] ${
                      done
                        ? "text-[var(--foreground-subtle)] df-strike"
                        : "text-[var(--sidebar-end)]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#e8f0e8] text-[#2e5938] font-semibold">
                      {task.category}
                    </span>
                    {task.priority === "High" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#fdeceb] text-[#d64545] font-semibold">
                        High
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--foreground-subtle)] font-medium ml-1">
                      {task.time}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end mt-2 pt-1">
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
        >
          View All Tasks →
        </button>
      </div>
    </section>
  );
}
