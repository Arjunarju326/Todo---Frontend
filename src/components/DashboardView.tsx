"use client";

import React, { useState } from "react";
import {
  Bell,
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Compass,
  Layers,
  Calendar,
  Flame,
  TrendingUp,
} from "lucide-react";
import { NavTab } from "./Navbar";

interface DashboardProps {
  data: any;
  onNavigate: (tab: NavTab) => void;
  onTaskToggle: (taskId: string, currentStatus: string) => void;
  onRefresh: () => void;
  onOpenQuickAdd?: () => void;
}

interface ProjectCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  image: string;
  progress: number;
}

export default function DashboardView({
  data,
  onNavigate,
  onTaskToggle,
  onRefresh,
  onOpenQuickAdd,
}: DashboardProps) {
  const stats = data?.stats || {};
  const settings = data?.settings || { userName: "Shihab", currency: "₹" };
  const dailyQuestions = data?.dailyQuestions || {};

  // Greeting based on current time
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

  // Demo projects matching screenshot
  const projects: ProjectCard[] = [
    {
      id: "proj-1",
      title: "ScanSafe",
      subtitle: "QR Scanner App",
      badge: "In progress",
      image: "/images/scansafe.jpg",
      progress: 75,
    },
    {
      id: "proj-2",
      title: "Lumina",
      subtitle: "AI Chat App",
      badge: "In progress",
      badgeColor: "sage",
      image: "/images/lumina.jpg",
      progress: 45,
    },
    {
      id: "proj-3",
      title: "Book Wise",
      subtitle: "React Reader App",
      badge: "In progress",
      image: "/images/hero-mist.jpg",
      progress: 20,
    },
  ];

  // Dynamic or starter tasks for "Today's Tasks"
  const liveTodayTasks = dailyQuestions?.finishToday?.items || [];
  const defaultTodayTasks = [
    {
      id: "task-demo-1",
      title: "Finish A4 JS functions assignment",
      category: "Programming Hero",
      time: "10:00 AM",
      status: "DONE",
    },
    {
      id: "task-demo-2",
      title: "React Customer Support Zone",
      category: "Course",
      time: "2:00 PM",
      status: "TODO",
    },
    {
      id: "task-demo-3",
      title: "Design system planning",
      category: "Work",
      time: "5:30 PM",
      status: "TODO",
    },
  ];

  // Combine live tasks with sample tasks if live tasks are empty
  const [localTaskStates, setLocalTaskStates] = useState<Record<string, boolean>>({
    "task-demo-1": true,
    "task-demo-2": false,
    "task-demo-3": false,
  });

  const handleToggle = (task: any) => {
    if (task.id?.startsWith("task-demo-")) {
      setLocalTaskStates((prev) => ({
        ...prev,
        [task.id]: !prev[task.id],
      }));
    } else {
      onTaskToggle(task.id, task.status);
    }
  };

  const tasksToDisplay =
    liveTodayTasks.length > 0
      ? liveTodayTasks.map((t: any) => ({
          id: t.id || t._id,
          title: t.title,
          category: t.category || "General",
          time: "Today",
          status: t.status || "TODO",
        }))
      : defaultTodayTasks;

  return (
    <div className="relative max-w-4xl mx-auto pb-28 md:pb-16 px-1 md:px-4 space-y-6">
      {/* Top Header Row (Handwritten quote, greeting, avatar, bell) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          {/* Handwritten Quote from top left of Screenshot */}
          <div className="font-handwriting text-lg md:text-xl font-bold text-[#434A52] tracking-wide rotate-[-2deg] select-none">
            Small steps Big results ✈️
          </div>

          {/* Top Right Bell & Avatar (Visible on tablet/desktop, mobile has in header) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate("settings")}
              className="w-10 h-10 rounded-full bg-white border border-[#EAE5DC] flex items-center justify-center text-[#444B53] relative hover:bg-[#F5F2EB] transition-colors shadow-xs cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#D97706] absolute top-2 right-2 ring-2 ring-white" />
            </button>
            <div
              onClick={() => onNavigate("settings")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer bg-[#EAE5DC]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avatar.jpg"
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Greeting and Subtitle */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-1.5">
            {timeGreeting}, <span className="text-[#191D23]">{settings.userName || "Shihab"}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-[#787E86] mt-1 font-medium">
            Build what you love. One step at a time.
          </p>
        </div>
      </div>

      {/* Featured Card ("This week: 3 / 5 projects") with Misty Mountain Landscape */}
      <div className="relative rounded-3xl overflow-hidden shadow-md text-white min-h-[170px] md:min-h-[190px] flex flex-col justify-between p-5 md:p-6 group">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-mist.jpg"
          alt="Misty Pine Forest"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.7] contrast-[1.05]"
        />
        {/* Dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Top Content */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              This week
            </span>
            <div className="text-2xl md:text-3xl font-extrabold mt-0.5 tracking-tight flex items-baseline gap-1.5">
              <span>{stats.completedCount > 0 ? stats.completedCount : 3}</span>
              <span className="text-slate-400 font-light">/</span>
              <span>{stats.totalTasks > 0 ? stats.totalTasks : 5}</span>
              <span className="text-xs md:text-sm font-normal text-slate-300 ml-1">
                projects
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("tasks")}
            className="flex items-center gap-1 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <span>Keep going</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <div className="relative z-10 w-full pt-4">
          <div className="w-full bg-white/20 backdrop-blur-xs h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-2 rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${stats.taskCompletionRate ? stats.taskCompletionRate : 60}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Section: Current Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base md:text-lg font-bold text-[#1A1D20]">
            Current Projects
          </h2>
          <button
            onClick={() => onNavigate("tasks")}
            className="flex items-center gap-1 text-xs font-semibold text-[#6E737B] hover:text-[#1A1D20] cursor-pointer transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scroll / Responsive Grid for Projects */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1">
          {projects.map((proj) => {
            const isSageBadge = proj.badgeColor === "sage";
            return (
              <div
                key={proj.id}
                onClick={() => onNavigate("tasks")}
                className="flex-shrink-0 w-[170px] md:w-[210px] bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] rounded-3xl p-3.5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              >
                {/* Image Preview Container */}
                <div className="relative w-full h-24 md:h-28 rounded-2xl overflow-hidden bg-[#F2EFE8] mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {/* Status Pill Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md shadow-xs ${
                        isSageBadge
                          ? "bg-[#E6EDE3]/90 text-[#2B472A] border border-[#CCDBC9]"
                          : "bg-white/90 text-[#191D23] border border-white/50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSageBadge ? "bg-[#3D6938]" : "bg-[#2563EB]"
                        }`}
                      />
                      {proj.badge}
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D20] truncate">
                    {proj.title}
                  </h3>
                  <p className="text-[11px] text-[#787E86] truncate">
                    {proj.subtitle}
                  </p>

                  {/* Progress Bar & Percentage */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1D20] mb-1">
                      <span>{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-[#EFECE5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#191D23] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Today's Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base md:text-lg font-bold text-[#1A1D20]">
            Today&apos;s Tasks
          </h2>
          <span className="text-xs font-semibold text-[#7E848D]">
            {tasksToDisplay.length} tasks
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasksToDisplay.map((task: any) => {
            const isCompleted =
              task.id?.startsWith("task-demo-")
                ? localTaskStates[task.id]
                : task.status === "DONE";

            return (
              <div
                key={task.id}
                onClick={() => handleToggle(task)}
                className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Round Checkbox (Matching screenshot) */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isCompleted
                        ? "bg-[#191D23] text-white border border-[#191D23]"
                        : "border-2 border-[#CCD1D9] bg-transparent hover:border-[#191D23]"
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate transition-colors ${
                        isCompleted
                          ? "line-through text-[#8E949D]"
                          : "text-[#1A1D20] group-hover:text-black"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] text-[#787E86] mt-0.5">
                      {task.category} • {task.time}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#A0A6AF] group-hover:text-[#1A1D20] transition-colors shrink-0" />
              </div>
            );
          })}
        </div>

        {/* Handwritten "Better than yesterday" Note & Underlying Doodle */}
        <div className="pt-3 pb-2 flex items-center justify-between px-1">
          <div className="rotate-[-3deg] select-none">
            <span className="font-handwriting text-base md:text-lg font-bold text-[#444A52] leading-tight block">
              Better than yesterday
            </span>
            <div className="w-20 h-0.5 bg-[#444A52]/40 rounded-full mt-0.5" />
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#191D23] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Desktop / Tablet Expansion: Daily Focus & Financial Health Summary */}
      <div className="pt-4 border-t border-[#EAE5DC] grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Money to Pay */}
        <div
          onClick={() => onNavigate("finance")}
          className="bg-white border border-[#EAE5DC] p-4 rounded-2xl hover:border-[#D9D3C7] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-[#787E86] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Finances
            </span>
            <span className="text-xs font-bold text-[#1A1D20]">
              {settings.currency}
              {(stats.netBalance || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-[#525861] leading-relaxed">
            {dailyQuestions?.moneyToPay?.summary ||
              "All debts tracked and monthly commitments on schedule."}
          </p>
        </div>

        {/* Card 2: Schedule Overview */}
        <div
          onClick={() => onNavigate("schedule")}
          className="bg-[#E6EDE3] border border-[#CFDDCC] p-4 rounded-2xl hover:border-[#BACDB7] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-[#2D492C] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Today&apos;s Schedule
            </span>
            <Calendar className="w-4 h-4 text-[#2D492C]" />
          </div>
          <p className="text-xs text-[#354B34] leading-relaxed">
            Daily standup at 8:00 AM, Exploration phase at 2:00 PM. Tap to view timeline.
          </p>
        </div>

        {/* Card 3: Growth & Habit Focus */}
        <div
          onClick={() => onNavigate("habits")}
          className="bg-white border border-[#EAE5DC] p-4 rounded-2xl hover:border-[#D9D3C7] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-[#787E86] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Habits Streak
            </span>
            <span className="text-xs font-bold text-[#1A1D20]">
              {stats.habitsCompletedToday || 0}/{stats.habitsTotal || 3}
            </span>
          </div>
          <p className="text-xs text-[#525861] leading-relaxed">
            {dailyQuestions?.careerGrowth?.summary ||
              "Small consistent habits yield compound results over time."}
          </p>
        </div>
      </div>
    </div>
  );
}
