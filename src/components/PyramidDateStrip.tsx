"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { hapticSelect } from "@/lib/haptics";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function dayKey(d: Date) {
  return startOfDay(d).toISOString();
}

type PyramidDateStripProps = {
  selectedDay: Date;
  onSelect: (day: Date) => void;
  radius?: number;
  markedKeys?: Set<string>;
  className?: string;
};

function pyramidScale(distance: number) {
  if (distance <= 0) return 1;
  if (distance === 1) return 0.88;
  if (distance === 2) return 0.76;
  if (distance === 3) return 0.66;
  return 0.58;
}

export default function PyramidDateStrip({
  selectedDay,
  onSelect,
  radius = 12,
  markedKeys,
  className = "",
}: PyramidDateStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollingRef = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const lastHaptic = useRef(0);
  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    const center = startOfDay(selectedDay);
    return Array.from({ length: radius * 2 + 1 }, (_, i) =>
      addDays(center, i - radius)
    );
  }, [selectedDay, radius]);

  const selectedIndex = radius;

  const centerOnSelected = (behavior: ScrollBehavior = "smooth") => {
    const el = itemRefs.current.get(dayKey(selectedDay));
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const target =
      el.offsetLeft - scroller.clientWidth / 2 + el.offsetWidth / 2;
    scrollingRef.current = true;
    scroller.scrollTo({ left: Math.max(0, target), behavior });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, behavior === "smooth" ? 380 : 40);
  };

  useEffect(() => {
    centerOnSelected("smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  useEffect(() => {
    // Initial align without animation
    const id = window.setTimeout(() => centerOnSelected("auto"), 30);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickNearest = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let best: { day: Date; dist: number } | null = null;
    for (const day of days) {
      const btn = itemRefs.current.get(dayKey(day));
      if (!btn) continue;
      const mid = btn.offsetLeft + btn.offsetWidth / 2;
      const dist = Math.abs(mid - centerX);
      if (!best || dist < best.dist) best = { day, dist };
    }
    if (!best) return;
    if (!sameDay(best.day, selectedDay)) {
      const now = Date.now();
      if (now - lastHaptic.current > 80) {
        hapticSelect();
        lastHaptic.current = now;
      }
      onSelect(startOfDay(best.day));
    } else {
      centerOnSelected("smooth");
    }
  };

  const selectDay = (day: Date) => {
    if (sameDay(day, selectedDay)) return;
    hapticSelect();
    onSelect(startOfDay(day));
  };

  return (
    <div className={`w-full min-w-0 overflow-hidden ${className}`}>
      <p className="text-sm font-bold text-[var(--sidebar-end)] tabular-nums text-center mb-2">
        {selectedDay.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })}
      </p>
      <div
        ref={scrollerRef}
        className="df-date-strip flex items-end gap-1.5 overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x py-1 scroll-smooth"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: "calc(50% - 26px)",
          paddingRight: "calc(50% - 26px)",
        }}
        role="listbox"
        aria-label="Select date"
        onScroll={() => {
          if (scrollingRef.current) return;
          if (settleTimer.current) window.clearTimeout(settleTimer.current);
          settleTimer.current = window.setTimeout(pickNearest, 90);
        }}
      >
        {days.map((day, i) => {
          const distance = Math.abs(i - selectedIndex);
          const active = distance === 0;
          const isToday = sameDay(day, today);
          const scale = pyramidScale(distance);
          const key = dayKey(day);
          const marked = markedKeys?.has(key);

          return (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={active}
              ref={(node) => {
                if (node) itemRefs.current.set(key, node);
                else itemRefs.current.delete(key);
              }}
              onClick={() => selectDay(day)}
              className={`df-date-chip shrink-0 rounded-[18px] flex flex-col items-center justify-center gap-0.5 transition-[transform,background-color,box-shadow,opacity,width,height,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer df-focus-ring origin-bottom ${
                active
                  ? "bg-[var(--sidebar)] text-white shadow-[0_8px_18px_rgba(31,77,54,0.28)] z-[1]"
                  : "bg-white border border-[var(--card-border)] text-[var(--sidebar-end)]"
              }`}
              style={{
                width: active ? 52 : Math.max(34, 44 - distance * 2),
                height: active ? 70 : Math.max(46, 58 - distance * 3),
                transform: `scale(${scale})`,
                opacity: active ? 1 : Math.max(0.55, 1 - distance * 0.08),
              }}
            >
              <span
                className={`text-[9px] font-semibold uppercase tracking-wide ${
                  active ? "text-[#c5d9c5]" : "text-[var(--foreground-muted)]"
                }`}
              >
                {day.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span
                className={`font-bold leading-none tabular-nums ${
                  active ? "text-[20px]" : "text-[13px]"
                }`}
              >
                {day.getDate()}
              </span>
              {(isToday || marked) && !active ? (
                <span className="w-1 h-1 rounded-full bg-[var(--sidebar)] mt-0.5" />
              ) : (
                <span className="h-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
