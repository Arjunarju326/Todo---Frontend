"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Lightbulb,
  Compass,
  Layers,
  MessageSquare,
  FileText,
  Check,
  ChevronDown,
  List,
  CalendarDays,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: string;
  duration: string;
  icon:
    | "standup"
    | "wireframe"
    | "system"
    | "exploration"
    | "client"
    | "finalization"
    | "custom";
  description?: string;
  isExpanded?: boolean;
  isCompleted?: boolean;
  avatars?: string[];
  isHighlighted?: boolean;
  /** Day of month this block belongs to (within monthCursor) */
  dayOfMonth: number;
}

type ViewMode = "list" | "calendar";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export default function ScheduleView({
  onBack,
  onOpenQuickAdd,
}: {
  onBack?: () => void;
  onOpenQuickAdd?: () => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  const weekDays = useMemo(() => {
    const start = startOfDay(selectedDay);
    const mondayOffset = (start.getDay() + 6) % 7;
    const monday = new Date(start);
    monday.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return startOfDay(d);
    });
  }, [selectedDay]);

  const parseScheduleTime = (time: string) => {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const itemsForSelectedDay = useMemo(
    () =>
      scheduleItems
        .filter(
          (item) =>
            item.dayOfMonth === selectedDay.getDate() &&
            selectedDay.getMonth() === monthCursor.getMonth() &&
            selectedDay.getFullYear() === monthCursor.getFullYear()
        )
        .slice()
        .sort(
          (a, b) => parseScheduleTime(a.time) - parseScheduleTime(b.time)
        ),
    [scheduleItems, selectedDay, monthCursor]
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<number, ScheduleItem[]>();
    for (const item of scheduleItems) {
      const list = map.get(item.dayOfMonth) || [];
      list.push(item);
      map.set(item.dayOfMonth, list);
    }
    return map;
  }, [scheduleItems]);

  const monthCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startPad = (first.getDay() + 6) % 7; // Monday-first
    const cells: Array<{ key: string; date: Date | null }> = [];
    for (let i = 0; i < startPad; i++) {
      cells.push({ key: `pad-${i}`, date: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        key: `d-${day}`,
        date: startOfDay(new Date(year, month, day)),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ key: `trail-${cells.length}`, date: null });
    }
    return cells;
  }, [monthCursor]);

  const shiftMonth = (delta: number) => {
    setMonthCursor((m) => {
      const next = new Date(m.getFullYear(), m.getMonth() + delta, 1);
      const days = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0
      ).getDate();
      const day = Math.min(selectedDay.getDate(), days);
      setSelectedDay(
        startOfDay(new Date(next.getFullYear(), next.getMonth(), day))
      );
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScheduleItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const renderIcon = (type: ScheduleItem["icon"]) => {
    switch (type) {
      case "standup":
        return <span className="w-2.5 h-2.5 rounded-full bg-[#3D6938]" />;
      case "wireframe":
        return <Lightbulb className="w-4 h-4 text-[#8A7240]" />;
      case "system":
        return <Compass className="w-4 h-4 text-[#5A6372]" />;
      case "exploration":
        return <Layers className="w-4 h-4 text-[#2E482B]" />;
      case "client":
        return <MessageSquare className="w-4 h-4 text-[#606770]" />;
      case "finalization":
        return <FileText className="w-4 h-4 text-[#5A6372]" />;
      default:
        return <Clock className="w-4 h-4 text-[#7B818A]" />;
    }
  };

  const viewOptions: Array<{
    id: ViewMode;
    label: string;
    icon: typeof List;
  }> = [
    { id: "list", label: "List", icon: List },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  const renderScheduleFeed = (items: ScheduleItem[]) => {
    if (items.length === 0) {
      return (
        <div className="rounded-2xl border border-[#EAE5DC] bg-white px-4 py-8 text-center">
          <p className="text-sm font-semibold text-[#1A1D20]">
            No blocks this day
          </p>
          <p className="text-xs text-[#7B818A] mt-1">
            Add a schedule block or pick another day.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 df-stagger-fast">
        {items.map((item) => {
          const isExpanded = expandedItemId === item.id;
          const isSage = item.isHighlighted;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 md:gap-6 group"
            >
              <div className="w-16 md:w-20 pt-3 text-right">
                <span className="text-[11px] md:text-xs font-semibold text-[#7E848D]">
                  {item.time}
                </span>
              </div>

              <div
                onClick={() => toggleExpand(item.id)}
                className={`flex-1 p-3.5 md:p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isSage
                    ? "bg-[#E6EDE3] border border-[#D0DDCC] shadow-xs hover:-translate-y-0.5"
                    : "bg-white border border-[#EAE5DC] hover:border-[#DDD7CD] shadow-xs hover:shadow-sm hover:-translate-y-0.5"
                } ${item.isCompleted ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => toggleComplete(item.id, e)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        item.isCompleted
                          ? "bg-[#191D23] text-white"
                          : isSage
                            ? "bg-[#D8E4D4] text-[#2C4A2B]"
                            : "bg-[#F5F2EB] text-[#555C66]"
                      }`}
                    >
                      {item.isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        renderIcon(item.icon)
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          item.isCompleted
                            ? "line-through text-[#7A8088]"
                            : isSage
                              ? "text-[#1E331D]"
                              : "text-[#1A1D20]"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[#717780] mt-0.5">
                        {item.category} • {item.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.avatars && (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {item.avatars.map((av, avIdx) => (
                          <div
                            key={avIdx}
                            className="w-5 h-5 rounded-full overflow-hidden border border-white bg-slate-300"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={av}
                              alt="Collaborator"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 text-[#8C929B] transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && item.description && (
                  <div className="mt-3 pt-3 border-t border-[#D5E1D1] text-xs leading-relaxed text-[#354834]">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto pb-16 px-1 md:px-4">
      <div className="fixed bottom-0 left-0 md:left-64 w-32 md:w-44 h-32 md:h-44 pointer-events-none opacity-40 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/botanical-leaf.jpg"
          alt="Botanical Leaf Accent"
          className="w-full h-full object-contain -scale-x-100"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>

      <div className="relative z-10 space-y-5 df-stagger">
        {(() => {
          const scheduleActions = (
            <div className="flex items-center gap-2 shrink-0">
              <div
                role="tablist"
                aria-label="Schedule views"
                className="flex items-center p-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8E3DA] shadow-sm"
              >
                {viewOptions.map((opt) => {
                  const active = viewMode === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`${opt.label} view`}
                      title={opt.label}
                      onClick={() => setViewMode(opt.id)}
                      className={`h-8 w-8 sm:w-auto sm:px-2.5 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-[#1F4D36] text-white shadow-sm"
                          : "text-[#7B818A] hover:text-[#1A1D20]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-full bg-[#1F4D36] hover:bg-[#2A5F44] text-white text-xs font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Schedule Block</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          );

          return (
            <>
              <MobileHeroBanner
                title="Schedule"
                subtitle="Plan today. Build tomorrow."
                actions={
                  <div className="flex items-center gap-2">
                    {onBack && (
                      <button
                        onClick={onBack}
                        aria-label="Back to dashboard"
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8E3DA] flex items-center justify-center text-[#1A1D20] cursor-pointer shadow-xs"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {scheduleActions}
                  </div>
                }
              />

              {/* Desktop header */}
              <div className="hidden md:flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 min-w-0">
                  {onBack && (
                    <button
                      onClick={onBack}
                      aria-label="Back to dashboard"
                      className="w-9 h-9 rounded-full bg-white border border-[#E8E3DA] flex items-center justify-center text-[#1A1D20] hover:bg-[#F3EFE7] transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight">
                      Schedule
                    </h1>
                    <p className="text-xs text-[#7B818A]">Plan today. Build tomorrow.</p>
                  </div>
                </div>
                {scheduleActions}
              </div>
            </>
          );
        })()}

        {/* Month label */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm md:text-base font-bold text-[#1A1D20] hover:opacity-80"
          >
            <span>
              {monthCursor.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <ChevronDown className="w-4 h-4 text-[#666C74]" />
          </button>
          <div className="hidden sm:flex flex-col items-end rotate-[-4deg]">
            <span className="font-handwriting text-base font-semibold text-[#484E56] leading-none">
              Good day :)
            </span>
          </div>
          <div className="sm:hidden font-handwriting text-sm font-semibold text-[#484E56] rotate-[-3deg]">
            Good day :)
          </div>
        </div>

        {viewMode === "list" && (
          <>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="w-8 h-8 rounded-full border border-[#E8E3DA] bg-white flex items-center justify-center text-[#1A1D20]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-[#1A1D20] tabular-nums">
                Week of{" "}
                {weekDays[0].toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </h2>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="w-8 h-8 rounded-full border border-[#E8E3DA] bg-white flex items-center justify-center text-[#1A1D20]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-1.5 md:gap-3 overflow-x-auto no-scrollbar py-1">
              {weekDays.map((day) => {
                const isSelected = sameDay(day, selectedDay);
                const hasItems =
                  day.getMonth() === monthCursor.getMonth() &&
                  (itemsByDay.get(day.getDate())?.length || 0) > 0;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 min-w-[42px] max-w-[64px] py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#191D23] text-white shadow-md shadow-black/10 scale-105"
                        : "bg-white/60 hover:bg-white text-[#7B818A] border border-[#EAE5DC]"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? "text-slate-300" : "text-[#8E949D]"
                      }`}
                    >
                      {day.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span
                      className={`text-sm md:text-base font-bold mt-1 ${
                        isSelected ? "text-white" : "text-[#1A1D20]"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {hasItems && !isSelected && (
                      <span className="w-1 h-1 mt-1 rounded-full bg-[#1F4D36]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-1">{renderScheduleFeed(itemsForSelectedDay)}</div>
          </>
        )}

        {viewMode === "calendar" && (
          <>
            <div className="rounded-2xl border border-[#EAE5DC] bg-white p-3 sm:p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                  className="w-8 h-8 rounded-full border border-[#E8E3DA] bg-white flex items-center justify-center text-[#1A1D20]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-bold text-[#1A1D20] tabular-nums">
                  {monthCursor.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                  className="w-8 h-8 rounded-full border border-[#E8E3DA] bg-white flex items-center justify-center text-[#1A1D20]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] font-semibold uppercase text-[#7B818A] py-1"
                  >
                    {d}
                  </div>
                ))}
                {monthCells.map((cell) => {
                  if (!cell.date) {
                    return (
                      <div
                        key={cell.key}
                        className="min-h-[52px] sm:min-h-[64px]"
                      />
                    );
                  }
                  const active = sameDay(cell.date, selectedDay);
                  const dayItems = itemsByDay.get(cell.date.getDate()) || [];
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => setSelectedDay(cell.date!)}
                      className={`min-h-[52px] sm:min-h-[64px] rounded-xl p-1.5 flex flex-col items-start gap-1 transition-all cursor-pointer text-left ${
                        active
                          ? "bg-[#1F4D36] text-white shadow-sm"
                          : "bg-[#F7F4EE] border border-transparent hover:border-[#E8E3DA] text-[#1A1D20]"
                      }`}
                    >
                      <span className="text-[12px] font-bold tabular-nums leading-none">
                        {cell.date.getDate()}
                      </span>
                      {dayItems.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-auto w-full">
                          {dayItems.slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className={`h-1 w-1 rounded-full ${
                                active ? "bg-[#c5d9c5]" : "bg-[#1F4D36]"
                              }`}
                              title={t.title}
                            />
                          ))}
                          {dayItems.length > 3 && (
                            <span
                              className={`text-[9px] font-semibold leading-none ${
                                active ? "text-[#c5d9c5]" : "text-[#7B818A]"
                              }`}
                            >
                              +{dayItems.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#7B818A] px-0.5">
                {selectedDay.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            <div className="pt-1">{renderScheduleFeed(itemsForSelectedDay)}</div>
          </>
        )}
      </div>
    </div>
  );
}
