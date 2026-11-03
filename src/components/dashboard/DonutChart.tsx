"use client";

import React from "react";

export type DonutSegment = {
  value: number;
  color: string;
  label?: string;
};

export default function DonutChart({
  segments,
  size = 120,
  stroke = 14,
  centerPrimary,
  centerSecondary,
}: {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  centerPrimary: string;
  centerSecondary: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumulative = 0;
  const segmentsWithOffset = segments.map((seg) => {
    const length = (seg.value / total) * circumference;
    const dashOffset = -cumulative;
    cumulative += length;
    return { ...seg, length, dashOffset };
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef2ee"
          strokeWidth={stroke}
        />
        {segmentsWithOffset.map((seg, i) => (
          <circle
            key={`${seg.color}-${i}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={seg.dashOffset}
            className="df-ring-animate"
            style={
              {
                "--ring-circumference": circumference,
                "--ring-offset": seg.dashOffset,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
        <span className="text-[15px] font-bold text-[var(--sidebar-end)] leading-tight">
          {centerPrimary}
        </span>
        <span className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">
          {centerSecondary}
        </span>
      </div>
    </div>
  );
}
