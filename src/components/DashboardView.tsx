"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Coins,
  BarChart3,
  Wifi,
  Smartphone,
  Tv,
  Check,
} from "lucide-react";
import { NavTab } from "./Navbar";
import StatCard from "./dashboard/StatCard";
import FocusList, { FocusTask } from "./dashboard/FocusList";
import DonutCard from "./dashboard/DonutCard";
import LearningProgress from "./dashboard/LearningProgress";
import PaymentCard from "./dashboard/PaymentCard";
import ScheduleTimeline from "./dashboard/ScheduleTimeline";
import HabitStreak from "./dashboard/HabitStreak";
import QuickNotes from "./dashboard/QuickNotes";
import DayProgressRing from "./dashboard/DayProgressRing";

interface DashboardProps {
  data: any;
  onNavigate: (tab: NavTab) => void;
  onTaskToggle: (taskId: string, currentStatus: string) => void;
  onRefresh: () => void;
  onOpenQuickAdd?: () => void;
}

export default function DashboardView({
  data,
  onNavigate,
  onTaskToggle,
  onOpenQuickAdd,
}: DashboardProps) {
  const stats = data?.stats || {};
  const settings = data?.settings || { userName: "Arjun", currency: "₹" };
  const userName = settings.userName || "Arjun";
  const currency = settings.currency || "₹";
  const dailyQuestions = data?.dailyQuestions || {};

  const [search, setSearch] = useState("");
  const [bellRing, setBellRing] = useState(false);
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({
    "focus-1": true,
    "focus-2": false,
    "focus-3": false,
    "focus-4": true,
    "focus-5": true,
  });
  const [greeting, setGreeting] = useState("Good morning");
  const [dateLabel, setDateLabel] = useState("Tue, 03 Nov 2026");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    );
    setDateLabel(
      now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );

    const t = setTimeout(() => setBellRing(true), 900);
    const clear = setTimeout(() => setBellRing(false), 1800);
    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, []);

  const liveTasks = dailyQuestions?.finishToday?.items || [];

  const focusTasks: FocusTask[] = useMemo(() => {
    if (liveTasks.length > 0) {
      return liveTasks.slice(0, 5).map((t: any, i: number) => ({
        id: t.id || t._id || `live-${i}`,
        title: t.title,
        category: t.category || "Work",
        priority: i === 0 ? ("High" as const) : undefined,
        time:
          t.time ||
          ["11:30 AM", "2:00 PM", "4:30 PM", "6:00 PM", "8:00 PM"][i] ||
          "Today",
        done: t.status === "DONE",
      }));
    }
    return [
      {
        id: "focus-1",
        title: "Complete e-commerce UI fixes",
        category: "Work",
        time: "11:30 AM",
        done: true,
      },
      {
        id: "focus-2",
        title: "Push staging build & test",
        category: "Work",
        priority: "High" as const,
        time: "2:00 PM",
        done: false,
      },
      {
        id: "focus-3",
        title: "AI course — Lesson 4 (Gradient Descent)",
        category: "Learning",
        time: "7:00 PM",
        done: false,
      },
      {
        id: "focus-4",
        title: "Gym — Workout (Lower body)",
        category: "Health",
        time: "6:00 PM",
        done: true,
      },
      {
        id: "focus-5",
        title: "Review weekly budget",
        category: "Finance",
        time: "8:30 PM",
        done: true,
      },
    ];
  }, [liveTasks]);

  const isDone = (task: FocusTask) =>
    task.id.startsWith("focus-") ? !!localDone[task.id] : task.done;

  const completedFocus = focusTasks.filter((t) => isDone(t)).length;
  const focusTotal = Math.max(focusTasks.length, 5);
  const visibleFocus = focusTasks.slice(0, 3);

  const dueToday = stats.dueTodayCount ?? stats.todayTasks ?? 5;
  const overdue = stats.overdueCount ?? 2;
  const upcoming = stats.upcomingCount ?? 8;
  const balance = stats.netBalance ?? 10500;
  const spent = stats.totalExpense ?? 4500;
  const taskPercent = stats.taskCompletionRate ?? 72;
  const tasksDone = stats.completedCount ?? 12;
  const tasksTotal = stats.totalTasks ?? 17;

  const moneySegments = [
    { value: 40, color: "#1f4d36", label: "Essentials", pct: "40%", amount: "₹1,800" },
    { value: 30, color: "#2e7d32", label: "Bills & EMI", pct: "30%", amount: "₹1,350" },
    { value: 17, color: "#7cb342", label: "Food", pct: "17%", amount: "₹750" },
    { value: 13, color: "#c5d9c5", label: "Others", pct: "13%", amount: "₹600" },
  ];

  const categoryProgress = [
    { label: "Work", done: 6, total: 8, color: "#1f4d36" },
    { label: "Learning", done: 3, total: 4, color: "#2e7d32" },
    { label: "Personal", done: 2, total: 3, color: "#66a06f" },
    { label: "Finance", done: 1, total: 2, color: "#a3c4a8" },
  ];

  const taskSegments = categoryProgress.map((c) => ({
    value: c.done,
    color: c.color,
    label: c.label,
  }));

  const schedule = [
    { time: "11:30 AM", title: "Complete e-commerce UI fixes", tag: "Work", color: "#2e7d32" },
    { time: "2:00 PM", title: "Push staging build & test", tag: "Work", color: "#d9822b" },
    { time: "6:00 PM", title: "Gym – Workout (Lower body)", tag: "Health", color: "#2e7d32" },
    { time: "7:00 PM", title: "AI course – Lesson 4", tag: "Learning", color: "#3b82c4" },
  ];

  const payments = [
    {
      title: "Internet bill",
      amount: 899,
      due: "Due Tomorrow, 04 Nov",
      status: "Due Soon",
      statusTone: "warning" as const,
      icon: Wifi,
    },
    {
      title: "Phone EMI",
      amount: 4500,
      due: "Due 07 Nov",
      status: "Upcoming",
      statusTone: "muted" as const,
      icon: Smartphone,
    },
    {
      title: "OTT Subscription",
      amount: 299,
      due: "Due 10 Nov",
      status: "Paid",
      statusTone: "success" as const,
      icon: Tv,
    },
  ];

  const handleFocusToggle = (task: FocusTask) => {
    if (task.id.startsWith("focus-")) {
      setLocalDone((prev) => ({ ...prev, [task.id]: !prev[task.id] }));
    } else {
      onTaskToggle(task.id, task.done ? "DONE" : "TODO");
    }
  };

  return (
    <div className="w-full pb-16 md:pb-4">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between gap-4 mb-3.5 animate-df-fade-up">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-bold text-[var(--sidebar-end)] tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-1 font-medium">
            Your life at a glance
          </p>
        </div>

        <div className="w-full max-w-[380px]">
          <label className="relative block group">
            <span className="sr-only">Search tasks, notes, bills</span>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-subtle)] transition-colors group-focus-within:text-[var(--sidebar)]"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, notes, bills..."
              className="w-full h-9 pl-10 pr-4 rounded-full bg-white border border-[var(--card-border)] text-[13px] text-[var(--sidebar-end)] placeholder:text-[var(--foreground-subtle)] outline-none shadow-xs transition-all duration-200 focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] hover:bg-[var(--accent-mint)] hover:border-[#c5d9c5] transition-all duration-150 cursor-pointer df-focus-ring"
          >
            <Bell className={`w-4 h-4 ${bellRing ? "df-bell-ring" : ""}`} />
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[var(--alert)] ring-2 ring-white" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white border border-[var(--card-border)] hover:border-[#c5d9c5] hover:bg-[var(--accent-mint)] transition-all duration-150 cursor-pointer df-focus-ring"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--accent-mint)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avatar.jpg"
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[12px] font-semibold text-[var(--sidebar-end)]">
                {userName}{" "}
                <span className="text-[var(--foreground-subtle)] font-medium">
                  / Personal Workspace
                </span>
              </p>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 text-[var(--foreground-subtle)]"
              aria-hidden
            />
          </button>
        </div>
      </header>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-1 min-[1140px]:grid-cols-[minmax(0,1fr)_290px] gap-3">
        <div className="space-y-3 min-w-0">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[18px] min-h-[96px] border border-[var(--card-border)] shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-sunrise.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f6f5ee]/92 via-[#f6f5ee]/70 to-transparent" />
            <div className="relative z-10 px-6 py-4 flex flex-col justify-center min-h-[96px]">
              <h2 className="font-display text-[22px] md:text-[24px] font-bold text-[var(--sidebar-end)] tracking-tight">
                {greeting}, {userName} 👋
              </h2>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5 max-w-lg font-medium">
                Stay focused, organized and make progress today.
              </p>
            </div>
          </section>

          {/* Stats: 4 side-by-side */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <StatCard label="Tasks Due Today" value={Number(dueToday)} icon={CheckSquare} />
            <StatCard
              label="Overdue"
              value={Number(overdue)}
              icon={AlertTriangle}
              tone="danger"
            />
            <StatCard label="Upcoming" value={Number(upcoming)} icon={Calendar} />
            <StatCard
              label="Available Balance"
              value={Number(balance)}
              icon={Coins}
              format={(n) => `${currency}${n.toLocaleString("en-IN")}`}
            />
          </section>

          {/* Row 3: Today's Focus & My Money Overview */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            <FocusList
              tasks={visibleFocus}
              completed={completedFocus}
              total={focusTotal}
              onToggle={handleFocusToggle}
              onViewAll={() => onNavigate("tasks")}
              isDone={isDone}
            />

            <DonutCard
              title="My Money Overview"
              icon={Coins}
              periodLabel="This Month"
              segments={moneySegments}
              centerPrimary={`${currency}${Number(spent).toLocaleString("en-IN")}`}
              centerSecondary="Total Spent"
              legend={moneySegments.map((s) => ({
                label: s.label,
                color: s.color,
                pct: s.pct,
                amount: s.amount,
              }))}
              footerLabel="View Details →"
              onFooter={() => onNavigate("finance")}
              onPeriodClick={() => onNavigate("finance")}
              delay="160ms"
            />
          </section>

          {/* Row 4: Task Progress & Learning Progress */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            <DonutCard
              title="Task Progress"
              icon={BarChart3}
              periodLabel="This Week"
              segments={taskSegments}
              centerPrimary={`${Math.round(taskPercent)}%`}
              centerSecondary={`${tasksDone} of ${tasksTotal} tasks`}
              legend={categoryProgress.map((c) => ({
                label: c.label,
                color: c.color,
                pct: `${c.done}/${c.total}`,
              }))}
              footerLabel="View All Tasks →"
              onFooter={() => onNavigate("tasks")}
              onPeriodClick={() => onNavigate("tasks")}
              delay="200ms"
            />

            <LearningProgress onContinue={() => onNavigate("growth")} />
          </section>

          {/* Row 5: Upcoming Payments & EMIs */}
          <PaymentCard
            payments={payments}
            currency={currency}
            onViewAll={() => onNavigate("finance")}
          />
        </div>

        <aside
          className="space-y-3 animate-df-fade-up min-[1140px]:sticky min-[1140px]:top-3 min-[1140px]:self-start"
          style={{ animationDelay: "140ms" }}
        >
          <ScheduleTimeline
            dateLabel={dateLabel}
            items={schedule}
            onSelect={() => onNavigate("schedule")}
          />
          <HabitStreak onViewAll={() => onNavigate("habits")} />
          <QuickNotes onAdd={onOpenQuickAdd} onViewAll={() => onNavigate("inbox")} />
        </aside>
      </div>

      {/* Mobile — My Day */}
      <div className="md:hidden space-y-4 animate-df-fade-up pb-6">
        <div>
          <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight leading-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1 font-medium">
            {dateLabel}
          </p>
        </div>

        <DayProgressRing percent={Number(taskPercent)} size={124} stroke={11} />

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card rounded-[16px] px-2.5 py-3 text-center bg-[#fff6f6] border-[#fcd5d5] cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--alert)] leading-none tabular-nums">
              {Number(overdue)}
            </p>
            <p className="text-[11px] font-semibold text-[var(--alert)] mt-1.5">
              Overdue
            </p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card rounded-[16px] px-2.5 py-3 text-center cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--sidebar-end)] leading-none tabular-nums">
              {Number(dueToday)}
            </p>
            <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mt-1.5">
              Due Today
            </p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card rounded-[16px] px-2.5 py-3 text-center cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--sidebar-end)] leading-none tabular-nums">
              {Number(upcoming)}
            </p>
            <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mt-1.5">
              Upcoming
            </p>
          </button>
        </div>

        <section className="rounded-[20px] bg-[var(--sidebar)] text-white p-4 shadow-[0_10px_28px_rgba(22,55,42,0.22)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold tracking-tight">Today&apos;s Focus</h3>
            <span className="text-[11px] font-medium text-[#c5d9c5]">
              {completedFocus}/{focusTotal}
            </span>
          </div>
          <ul className="space-y-2.5">
            {visibleFocus.map((task) => {
              const done = isDone(task);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => handleFocusToggle(task)}
                    aria-pressed={done}
                    className="w-full flex items-center gap-3 text-left cursor-pointer df-focus-ring rounded-xl"
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        done
                          ? "bg-[var(--sidebar-active)] border-[var(--sidebar-active)] text-[var(--sidebar-end)] df-check-pop"
                          : "border-[#8aa090] bg-transparent"
                      }`}
                      aria-hidden
                    >
                      {done && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span
                      className={`flex-1 min-w-0 text-[13px] font-medium truncate ${
                        done ? "text-[#8aa090] line-through" : "text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[11px] text-[#a8bbae] font-medium shrink-0">
                      {task.time}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => onNavigate("finance")}
          className="w-full df-card rounded-[18px] p-3.5 flex items-center gap-3 text-left cursor-pointer df-focus-ring"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[var(--sidebar-end)] truncate">
              Internet bill
            </p>
            <p className="text-[11px] text-[var(--foreground-muted)] font-medium mt-0.5">
              {currency}899 · Upcoming payment
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] shrink-0">
            Due soon
          </span>
        </button>

        <HabitStreak onViewAll={() => onNavigate("habits")} />
      </div>
    </div>
  );
}
