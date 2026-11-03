"use client";

import React from "react";
import { CalendarCheck, ChevronDown } from "lucide-react";

export type ScheduleItem = {
  time: string;
  title: string;
  tag: string;
  color: string;
};

type ScheduleTimelineProps = {
  dateLabel: string;
  items: ScheduleItem[];
  onSelect: () => void;
};

export default function ScheduleTimeline({
  dateLabel,
  items,
  onSelect,
}: ScheduleTimelineProps) {
  return (
    <section className="df-card df-card-lift p-3.5 sm:p-4 rounded-[18px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[#2e7d32]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Today&apos;s Schedule
          </h3>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[var(--sidebar-end)] transition-colors cursor-pointer"
        >
          {dateLabel || "Tue, 03 Nov"}
          <ChevronDown className="w-3 h-3 text-[var(--foreground-subtle)]" aria-hidden />
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={onSelect}
            className="flex items-center gap-2.5 w-full text-left py-1 px-1 rounded-lg hover:bg-[var(--accent-mint)] transition-colors duration-150 cursor-pointer df-focus-ring group"
          >
            <span className="text-[11px] font-semibold text-[var(--foreground-muted)] w-14 shrink-0 tabular-nums">
              {item.time}
            </span>
            <span
              className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
              style={{ background: item.color }}
              aria-hidden
            />
            <span className="text-[12px] font-medium text-[var(--sidebar-end)] group-hover:text-[#2e7d32] transition-colors truncate flex-1">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
