"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import DonutChart, { DonutSegment } from "./DonutChart";

type LegendItem = {
  label: string;
  color: string;
  pct: string;
  amount?: string;
  meta?: string;
};

type DonutCardProps = {
  title: string;
  periodLabel: string;
  segments: DonutSegment[];
  centerPrimary: string;
  centerSecondary: string;
  legend: LegendItem[];
  footerLabel?: string;
  onFooter?: () => void;
  onPeriodClick?: () => void;
  delay?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export default function DonutCard({
  title,
  periodLabel,
  segments,
  centerPrimary,
  centerSecondary,
  legend,
  footerLabel,
  onFooter,
  onPeriodClick,
  delay = "160ms",
  icon: Icon,
}: DonutCardProps) {
  return (
    <section
      className="df-card df-card-lift p-3.5 sm:p-4 rounded-[18px] animate-df-fade-up h-full flex flex-col justify-between"
      style={{ animationDelay: delay }}
    >
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#2e7d32]" aria-hidden />}
            <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onPeriodClick}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--foreground-muted)] hover:text-[var(--sidebar-end)] px-2 py-0.5 rounded-md border border-[var(--card-border)] bg-white transition-all duration-150 cursor-pointer df-focus-ring"
          >
            {periodLabel}
            <ChevronDown className="w-3 h-3 text-[var(--foreground-subtle)]" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <DonutChart
            size={120}
            stroke={14}
            segments={segments}
            centerPrimary={centerPrimary}
            centerSecondary={centerSecondary}
          />
          <ul className="flex-1 space-y-1 min-w-0">
            {legend.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-[11px] py-0.5 gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: item.color }}
                    aria-hidden
                  />
                  <span className="text-[var(--foreground-muted)] font-medium truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[var(--foreground-muted)] font-medium text-right">
                    {item.pct}
                  </span>
                  {item.amount && (
                    <span className="font-bold text-[var(--sidebar-end)] min-w-[42px] text-right tabular-nums">
                      {item.amount}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {footerLabel && onFooter && (
        <div className="flex justify-end mt-2 pt-1">
          <button
            type="button"
            onClick={onFooter}
            className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
          >
            {footerLabel}
          </button>
        </div>
      )}
    </section>
  );
}
