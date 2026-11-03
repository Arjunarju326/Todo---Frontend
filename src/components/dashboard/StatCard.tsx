"use client";

import React from "react";
import { useCountUp } from "./useCountUp";

type StatCardProps = {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "danger";
  format?: (n: number) => string;
};

export default function StatCard({
  label,
  value,
  prefix = "",
  icon: Icon,
  tone = "default",
  format,
}: StatCardProps) {
  const counted = useCountUp(value);
  const display = format ? format(counted) : `${prefix}${counted.toLocaleString("en-IN")}`;
  const isDanger = tone === "danger";

  return (
    <div
      className={`df-card df-card-lift px-3.5 py-3 flex items-center gap-3 rounded-[16px] transition-all duration-200 ${
        isDanger
          ? "bg-[#fff6f6] border-[#fcd5d5] hover:border-[#f9b8b8]"
          : "bg-white hover:border-[#cbdccb]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isDanger
            ? "bg-[#fdeceb] text-[#d64545]"
            : "bg-[var(--accent-mint)] text-[var(--sidebar)]"
        }`}
      >
        <Icon className="w-[18px] h-[18px]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[20px] font-bold tracking-tight leading-none tabular-nums ${
            isDanger ? "text-[#d64545]" : "text-[var(--sidebar-end)]"
          }`}
        >
          {display}
        </p>
        <p
          className={`text-[11px] font-medium mt-1 truncate ${
            isDanger ? "text-[#d64545]" : "text-[var(--foreground-muted)]"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
