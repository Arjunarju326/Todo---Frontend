"use client";

import React from "react";

export default function DayProgressRing({
  percent,
  size = 112,
  stroke = 10,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% day progress`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e4ebe4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f4d36"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="df-ring-animate"
          style={
            {
              "--ring-circumference": circumference,
              "--ring-offset": offset,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[26px] font-bold text-[var(--sidebar-end)] leading-none tabular-nums tracking-tight">
          {clamped}%
        </span>
        <span className="text-[11px] font-medium text-[var(--foreground-muted)] mt-1">
          Day Progress
        </span>
      </div>
    </div>
  );
}
