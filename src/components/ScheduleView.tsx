"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  Lightbulb,
  Compass,
  Layers,
  MessageSquare,
  FileText,
  CheckCircle2,
  Check,
  ChevronDown,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: string;
  duration: string;
  icon: "standup" | "wireframe" | "system" | "exploration" | "client" | "finalization" | "custom";
  description?: string;
  isExpanded?: boolean;
  isCompleted?: boolean;
  avatars?: string[];
  isHighlighted?: boolean;
}

export default function ScheduleView({
  onBack,
  onOpenQuickAdd,
}: {
  onBack?: () => void;
  onOpenQuickAdd?: () => void;
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Thu 20 selected by default as in screenshot
  const [expandedItemId, setExpandedItemId] = useState<string | null>("sched-4"); // Exploration phase expanded by default

  const days = [
    { day: "Mon", date: "17" },
    { day: "Tue", date: "18" },
    { day: "Wed", date: "19" },
    { day: "Thu", date: "20" },
    { day: "Fri", date: "21" },
    { day: "Sat", date: "22" },
    { day: "Sun", date: "23" },
  ];

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: "sched-1",
      time: "8:00 AM",
      title: "Daily standup & plan",
      category: "Team",
      duration: "15 min",
      icon: "standup",
      avatars: ["/images/avatar.jpg"],
    },
    {
      id: "sched-2",
      time: "9:00 AM",
      title: "Wireframing and brainstorming",
      category: "Project",
      duration: "1h 15m",
      icon: "wireframe",
    },
    {
      id: "sched-3",
      time: "11:00 AM",
      title: "Design system planning",
      category: "Work",
      duration: "1h",
      icon: "system",
    },
    {
      id: "sched-4",
      time: "2:00 PM",
      title: "Exploration phase",
      category: "Project",
      duration: "2h",
      icon: "exploration",
      isHighlighted: true,
      avatars: ["/images/avatar.jpg"],
      description:
        "Review updated high-fidelity mocks. Adjust sidebar navigation. Approval pending for final colors.",
    },
    {
      id: "sched-5",
      time: "5:00 PM",
      title: "Client feedback review",
      category: "Client",
      duration: "1h",
      icon: "client",
    },
    {
      id: "sched-6",
      time: "7:00 PM",
      title: "Design style finalization",
      category: "Project",
      duration: "1h 30m",
      icon: "finalization",
    },
  ]);

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

  return (
    <div className="relative max-w-3xl mx-auto pb-28 md:pb-16 px-1 md:px-4">
      {/* Botanical Eucalyptus Leaf Accent in Bottom Left (Matching Screenshot) */}
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

      <div className="relative z-10 space-y-6">
        {/* Top Header Row with Back Button, Title, Subtitle, and Calendar Icon */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back to dashboard"
                className="w-9 h-9 rounded-full bg-white border border-[#E8E3DA] flex items-center justify-center text-[#1A1D20] hover:bg-[#F3EFE7] transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight">
                Schedule
              </h1>
              <p className="text-xs text-[#7B818A]">Plan today. Build tomorrow.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Handwritten "Good day :)" note from screenshot */}
            <div className="hidden sm:flex flex-col items-end rotate-[-4deg] -mr-1">
              <span className="font-handwriting text-base font-semibold text-[#484E56] leading-none">
                Good day :)
              </span>
            </div>

            <button
              onClick={onOpenQuickAdd}
              aria-label="Open Calendar or Add"
              className="w-9 h-9 rounded-2xl bg-white border border-[#E8E3DA] flex items-center justify-center text-[#1A1D20] hover:bg-[#F3EFE7] transition-colors cursor-pointer shadow-xs"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Dropdown & Handwritten Note for Mobile */}
        <div className="flex items-center justify-between px-1">
          <button className="flex items-center gap-1.5 text-sm md:text-base font-bold text-[#1A1D20] hover:opacity-80">
            <span>November 2026</span>
            <ChevronDown className="w-4 h-4 text-[#666C74]" />
          </button>
          <div className="sm:hidden font-handwriting text-sm font-semibold text-[#484E56] rotate-[-3deg]">
            Good day :)
          </div>
        </div>

        {/* Horizontal Calendar Date Strip (Mon 17 - Sun 23) */}
        <div className="flex items-center justify-between gap-1.5 md:gap-3 overflow-x-auto no-scrollbar py-1">
          {days.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-1 min-w-[42px] max-w-[64px] py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#191D23] text-white shadow-md shadow-black/10 scale-105"
                    : "bg-white/60 hover:bg-white text-[#7B818A] border border-[#EAE5DC]"
                }`}
              >
                <span className={`text-[11px] font-medium ${isSelected ? "text-slate-300" : "text-[#8E949D]"}`}>
                  {item.day}
                </span>
                <span className={`text-sm md:text-base font-bold mt-1 ${isSelected ? "text-white" : "text-[#1A1D20]"}`}>
                  {item.date}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline Schedule Feed */}
        <div className="space-y-4 pt-2">
          {scheduleItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const isSage = item.isHighlighted;

            return (
              <div key={item.id} className="flex items-start gap-3 md:gap-6 group">
                {/* Time Label on Left */}
                <div className="w-16 md:w-20 pt-3 text-right">
                  <span className="text-[11px] md:text-xs font-semibold text-[#7E848D]">
                    {item.time}
                  </span>
                </div>

                {/* Timeline Card */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className={`flex-1 p-3.5 md:p-4 rounded-2xl transition-all cursor-pointer ${
                    isSage
                      ? "bg-[#E6EDE3] border border-[#D0DDCC] shadow-xs"
                      : "bg-white border border-[#EAE5DC] hover:border-[#DDD7CD] shadow-xs hover:shadow-sm"
                  } ${item.isCompleted ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox or Icon */}
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

                    {/* Right side: Team Avatars & Chevron */}
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

                  {/* Expanded Description Box (Signature feature of Exploration Phase in screenshot) */}
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

        {/* Add Event Button */}
        <div className="pt-2 text-center">
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F3EFE7] border border-[#E8E3DA] text-xs font-semibold text-[#1A1D20] shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Schedule Block</span>
          </button>
        </div>
      </div>
    </div>
  );
}
