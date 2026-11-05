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
  Check,
  CreditCard,
} from "lucide-react";
import { NavTab } from "./Navbar";
import StatCard from "./dashboard/StatCard";
import FocusList, { FocusTask } from "./dashboard/FocusList";
import DonutCard from "./dashboard/DonutCard";
import LearningProgress from "./dashboard/LearningProgress";
import PaymentCard, { PaymentItem } from "./dashboard/PaymentCard";
import ScheduleTimeline from "./dashboard/ScheduleTimeline";
import HabitStreak from "./dashboard/HabitStreak";
import QuickNotes from "./dashboard/QuickNotes";
import DayProgressRing from "./dashboard/DayProgressRing";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";

interface DashboardProps {
  data: any;
  onNavigate: (tab: NavTab) => void;
  onTaskToggle: (taskId: string, currentStatus: string) => void;
  onRefresh: () => void;
  onOpenQuickAdd?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  WORK: "#1f4d36",
  LEARNING: "#2e7d32",
  PERSONAL: "#66a06f",
  FINANCE: "#a3c4a8",
  FOOD: "#7cb342",
  EMI: "#2e7d32",
  BILLS: "#1f4d36",
  RENT: "#3d6b48",
  TRAVEL: "#66a06f",
  OTHER: "#c5d9c5",
};

function formatCategory(cat?: string) {
  if (!cat) return "Task";
  return cat.charAt(0) + cat.slice(1).toLowerCase();
}

function formatDueLabel(dueDate?: string | null) {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const label = due.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  if (dueDay.getTime() === today.getTime()) return `Due today, ${label}`;
  if (dueDay.getTime() === tomorrow.getTime()) return `Due tomorrow, ${label}`;
  if (dueDay < today) return `Overdue, ${label}`;
  return `Due ${label}`;
}

export default function DashboardView({
  data,
  onNavigate,
  onTaskToggle,
  onOpenQuickAdd,
}: DashboardProps) {
  const stats = data?.stats || {};
  const settings = data?.settings || {};
  const userName = settings.userName || settings.user_name || "there";
  const currency = settings.currency || "₹";
  const dailyQuestions = data?.dailyQuestions || {};
  const habits = data?.habits || [];
  const notes = data?.notes || [];
  const learningGoals = data?.learningGoals || [];

  const [search, setSearch] = useState("");
  const [bellRing, setBellRing] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [heroImage, setHeroImage] = useState("/images/hero-sunrise.jpg");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const syncTimeOfDay = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) {
        setGreeting("Good morning");
        setHeroImage("/images/hero-sunrise.jpg");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
        setHeroImage("/images/hero-afternoon.jpg");
      } else {
        setGreeting("Good evening");
        setHeroImage("/images/hero-evening.jpg");
      }
      setDateLabel(
        now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    };

    syncTimeOfDay();
    // Refresh near hour boundaries so greeting/image stay in sync
    const interval = window.setInterval(syncTimeOfDay, 60_000);

    const t = setTimeout(() => setBellRing(true), 900);
    const clear = setTimeout(() => setBellRing(false), 1800);
    return () => {
      window.clearInterval(interval);
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, []);

  const liveTasks = dailyQuestions?.finishToday?.items || [];

  const focusTasks: FocusTask[] = useMemo(
    () =>
      liveTasks.slice(0, 5).map((t: any, i: number) => ({
        id: String(t.id || t._id || `live-${i}`),
        title: t.title,
        category: formatCategory(t.category),
        priority:
          t.priority === "HIGH" || t.priority === "High"
            ? ("High" as const)
            : undefined,
        time: t.time || "Today",
        done: t.status === "DONE",
      })),
    [liveTasks]
  );

  const completedFocus = focusTasks.filter((t) => t.done).length;
  const focusTotal = focusTasks.length;
  const visibleFocus = focusTasks.slice(0, 3);

  const dueToday = Number(stats.dueTodayCount ?? stats.todayTasks ?? 0);
  const overdue = Number(stats.overdueCount ?? 0);
  const upcoming = Number(stats.upcomingCount ?? 0);
  const balance = Number(stats.netBalance ?? 0);
  const spent = Number(stats.totalExpense ?? 0);
  const taskPercent = Number(stats.taskCompletionRate ?? 0);
  const tasksDone = Number(stats.completedCount ?? 0);
  const tasksTotal = Number(stats.totalTasks ?? 0);

  const moneyItems = dailyQuestions?.moneyToPay?.items || [];
  const expenseByCategory = useMemo(() => {
    // Prefer category totals if API ever adds them; otherwise empty until finance page.
    return [] as { label: string; value: number; color: string; pct: string; amount: string }[];
  }, []);

  const moneySegments =
    expenseByCategory.length > 0
      ? expenseByCategory
      : spent > 0
        ? [
            {
              value: spent,
              color: "#1f4d36",
              label: "This month",
              pct: "100%",
              amount: `${currency}${spent.toLocaleString("en-IN")}`,
            },
          ]
        : [];

  const learningItems = dailyQuestions?.careerGrowth?.items || [];
  const primaryLearning =
    learningGoals.find((g: any) => g.status === "IN_PROGRESS") ||
    learningGoals[0] ||
    learningItems[0];

  const categoryProgress = useMemo(() => {
    const counts: Record<string, { done: number; total: number }> = {};
    for (const t of liveTasks) {
      const key = (t.category || "PERSONAL").toUpperCase();
      if (!counts[key]) counts[key] = { done: 0, total: 0 };
      counts[key].total += 1;
      if (t.status === "DONE") counts[key].done += 1;
    }
    return Object.entries(counts).map(([label, v]) => ({
      label: formatCategory(label),
      done: v.done,
      total: v.total,
      color: CATEGORY_COLORS[label] || "#66a06f",
    }));
  }, [liveTasks]);

  const taskSegments = categoryProgress.map((c) => ({
    value: Math.max(c.total, 1),
    color: c.color,
    label: c.label,
  }));

  const schedule = focusTasks.map((t) => ({
    time: t.time,
    title: t.title,
    tag: t.category,
    color: CATEGORY_COLORS[t.category.toUpperCase()] || "#2e7d32",
  }));

  const payments: PaymentItem[] = moneyItems.slice(0, 3).map((p: any) => {
    const due = p.dueDate || p.due_date;
    const dueDay = due ? new Date(due) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let status = "Upcoming";
    let statusTone: PaymentItem["statusTone"] = "muted";

    if (p.type === "BILL" || p.reminderStatus) {
      const daysLeft = Number(p.daysLeft);
      if (p.reminderStatus === "EXPIRED" || daysLeft < 0) {
        status = "Expired";
        statusTone = "warning";
      } else {
        status = "About to expire";
        statusTone = "warning";
      }
    } else if (dueDay) {
      const d = new Date(dueDay);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() <= tomorrow.getTime()) {
        status = d.getTime() <= today.getTime() ? "Due soon" : "Due tomorrow";
        statusTone = "warning";
      }
    }

    const dueLabel =
      p.type === "BILL" || p.reminderStatus
        ? p.reminderStatus === "EXPIRED" || Number(p.daysLeft) < 0
          ? `Plan expired · was ${formatDueLabel(due).replace(/^Due /, "")}`
          : `Expires in ${Math.max(0, Number(p.daysLeft))} day${Number(p.daysLeft) === 1 ? "" : "s"}`
        : formatDueLabel(due);

    return {
      title: p.title || `Payment to ${p.personName || "contact"}`,
      amount: Number(p.amount || 0),
      due: dueLabel,
      status,
      statusTone,
      icon: CreditCard,
    };
  });

  const nextPayment = payments[0];

  const habitDays = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const dayIdx = (today.getDay() + 6) % 7; // Mon=0
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayIdx);
    weekStart.setHours(0, 0, 0, 0);

    return labels.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const anyDone = habits.some((h: any) =>
        (h.completedDates || h.completed_dates || []).includes(iso)
      );
      return { day, done: anyDone };
    });
  }, [habits]);

  const habitStreak = habits.reduce(
    (max: number, h: any) => Math.max(max, Number(h.streak || 0)),
    0
  );

  const noteTitles = notes
    .map((n: any) => n.title || n.content)
    .filter(Boolean)
    .slice(0, 3);

  const handleFocusToggle = (task: FocusTask) => {
    onTaskToggle(task.id, task.done ? "DONE" : "TODO");
  };

  const learningTitle =
    primaryLearning?.title || "No active learning track";
  const learningProgress = Number(
    primaryLearning?.progressPercentage ??
      primaryLearning?.progress_percentage ??
      primaryLearning?.progress ??
      0
  );

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
            onClick={() => onNavigate("inbox")}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] hover:bg-[var(--accent-mint)] hover:border-[#c5d9c5] transition-all duration-150 cursor-pointer df-focus-ring"
          >
            <Bell className={`w-4 h-4 ${bellRing ? "df-bell-ring" : ""}`} />
            {overdue > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[var(--alert)] ring-2 ring-white" />
            )}
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
          <section className="relative overflow-hidden rounded-[18px] min-h-[96px] border border-[var(--card-border)] shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={heroImage}
              src={heroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f6f5ee]/92 via-[#f6f5ee]/70 to-transparent" />
            <div className="relative z-10 px-6 py-4 flex flex-col justify-center min-h-[96px]">
              <h2 className="font-display text-[22px] md:text-[24px] font-bold text-[var(--sidebar-end)] tracking-tight">
                {greeting}, {userName}
              </h2>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5 max-w-lg font-medium">
                Stay focused, organized and make progress today.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <StatCard label="Tasks Due Today" value={dueToday} icon={CheckSquare} />
            <StatCard
              label="Overdue"
              value={overdue}
              icon={AlertTriangle}
              tone="danger"
            />
            <StatCard label="Upcoming" value={upcoming} icon={Calendar} />
            <StatCard
              label="Available Balance"
              value={balance}
              icon={Coins}
              format={(n) => `${currency}${n.toLocaleString("en-IN")}`}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            {focusTasks.length > 0 ? (
              <FocusList
                tasks={visibleFocus}
                completed={completedFocus}
                total={Math.max(focusTotal, 1)}
                onToggle={handleFocusToggle}
                onViewAll={() => onNavigate("tasks")}
                isDone={(t) => t.done}
              />
            ) : (
              <section className="df-card p-4 rounded-[18px] flex flex-col justify-center">
                <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
                  Today&apos;s Focus
                </h3>
                <p className="text-[12px] text-[var(--foreground-muted)] mt-2">
                  No tasks due today.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("tasks")}
                  className="mt-3 text-[11px] font-semibold text-[var(--sidebar)] self-start"
                >
                  View All Tasks →
                </button>
              </section>
            )}

            <DonutCard
              title="My Money Overview"
              icon={Coins}
              periodLabel="This Month"
              segments={
                moneySegments.length
                  ? moneySegments
                  : [{ value: 1, color: "#eef2ee", label: "None" }]
              }
              centerPrimary={`${currency}${spent.toLocaleString("en-IN")}`}
              centerSecondary="Total Spent"
              legend={
                moneySegments.length
                  ? moneySegments.map((s) => ({
                      label: s.label,
                      color: s.color,
                      pct: s.pct,
                      amount: s.amount,
                    }))
                  : [{ label: "No expenses yet", color: "#c5d9c5", pct: "—" }]
              }
              footerLabel="View Details →"
              onFooter={() => onNavigate("finance")}
              onPeriodClick={() => onNavigate("finance")}
              delay="160ms"
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
            <DonutCard
              title="Task Progress"
              icon={BarChart3}
              periodLabel="This Week"
              segments={
                taskSegments.length
                  ? taskSegments
                  : [{ value: 1, color: "#eef2ee", label: "None" }]
              }
              centerPrimary={`${Math.round(taskPercent)}%`}
              centerSecondary={`${tasksDone} of ${tasksTotal} tasks`}
              legend={
                categoryProgress.length
                  ? categoryProgress.map((c) => ({
                      label: c.label,
                      color: c.color,
                      pct: `${c.done}/${c.total}`,
                    }))
                  : [{ label: "No tasks yet", color: "#c5d9c5", pct: "—" }]
              }
              footerLabel="View All Tasks →"
              onFooter={() => onNavigate("tasks")}
              onPeriodClick={() => onNavigate("tasks")}
              delay="200ms"
            />

            <LearningProgress
              title={learningTitle}
              progressPercent={learningProgress}
              onContinue={() => onNavigate("growth")}
            />
          </section>

          {payments.length > 0 && (
            <PaymentCard
              payments={payments}
              currency={currency}
              onViewAll={() => onNavigate("finance")}
            />
          )}
        </div>

        <aside
          className="space-y-3 animate-df-fade-up min-[1140px]:sticky min-[1140px]:top-3 min-[1140px]:self-start"
          style={{ animationDelay: "140ms" }}
        >
          {schedule.length > 0 && (
            <ScheduleTimeline
              dateLabel={dateLabel || "Today"}
              items={schedule}
              onSelect={() => onNavigate("schedule")}
            />
          )}
          <HabitStreak
            streak={habitStreak}
            initialDays={habitDays}
            onViewAll={() => onNavigate("habits")}
          />
          <QuickNotes
            notes={noteTitles}
            onAdd={onOpenQuickAdd}
            onViewAll={() => onNavigate("inbox")}
          />
        </aside>
      </div>

      {/* Mobile — My Day */}
      <div className="md:hidden space-y-4 animate-df-fade-up pb-6">
        <MobileHeroBanner
          tall
          title={
            <>
              {greeting}, {userName}
            </>
          }
          subtitle={
            dateLabel || "Stay focused, organized and make progress today."
          }
        />

        <DayProgressRing percent={taskPercent} size={124} stroke={11} />

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card df-mobile-glass rounded-[16px] px-2.5 py-3 text-center bg-[#fff6f6] border-[#fcd5d5] cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--alert)] leading-none tabular-nums">
              {overdue}
            </p>
            <p className="text-[11px] font-semibold text-[var(--alert)] mt-1.5">
              Overdue
            </p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card df-mobile-glass rounded-[16px] px-2.5 py-3 text-center cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--sidebar-end)] leading-none tabular-nums">
              {dueToday}
            </p>
            <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mt-1.5">
              Due Today
            </p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("tasks")}
            className="df-card df-mobile-glass rounded-[16px] px-2.5 py-3 text-center cursor-pointer df-focus-ring"
          >
            <p className="text-[22px] font-bold text-[var(--sidebar-end)] leading-none tabular-nums">
              {upcoming}
            </p>
            <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mt-1.5">
              Upcoming
            </p>
          </button>
        </div>

        <section className="rounded-[20px] bg-[var(--sidebar)] text-white p-4 shadow-[0_10px_28px_rgba(22,55,42,0.22)] df-mobile-glass-deep">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold tracking-tight">
              Today&apos;s Focus
            </h3>
            <span className="text-[11px] font-medium text-[#c5d9c5]">
              {completedFocus}/{focusTotal}
            </span>
          </div>
          {visibleFocus.length === 0 ? (
            <p className="text-[13px] text-[#a8bbae]">No tasks due today.</p>
          ) : (
            <ul className="space-y-2.5">
              {visibleFocus.map((task) => {
                const done = task.done;
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
          )}
        </section>

        {nextPayment && (
          <button
            type="button"
            onClick={() => onNavigate("finance")}
            className="w-full df-card rounded-[18px] p-3.5 flex items-center gap-3 text-left cursor-pointer df-focus-ring"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-[var(--sidebar-end)] truncate">
                {nextPayment.title}
              </p>
              <p className="text-[11px] text-[var(--foreground-muted)] font-medium mt-0.5">
                {currency}
                {nextPayment.amount.toLocaleString("en-IN")} · Upcoming payment
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] shrink-0">
              {nextPayment.status}
            </span>
          </button>
        )}

        <HabitStreak
          streak={habitStreak}
          initialDays={habitDays}
          onViewAll={() => onNavigate("habits")}
        />
      </div>
    </div>
  );
}
