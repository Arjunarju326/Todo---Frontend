"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  CheckSquare,
  Wallet,
  Flame,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import DonutChart from "./dashboard/DonutChart";

type ReportsViewProps = {
  data?: any;
  currency?: string;
  onNavigate?: (tab: string) => void;
};

function formatMoney(currency: string, n: number) {
  return `${currency}${Math.abs(n).toLocaleString("en-IN")}`;
}

function MiniBarChart({
  bars,
  height = 88,
}: {
  bars: Array<{ label: string; value: number; color: string }>;
  height?: number;
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div
      className="flex items-end justify-between gap-2 w-full px-0.5"
      style={{ height }}
      role="img"
      aria-label="Bar chart"
    >
      {bars.map((bar) => {
        const pct = Math.max(6, Math.round((bar.value / max) * 100));
        return (
          <div
            key={bar.label}
            className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1.5 h-full"
          >
            <span className="text-[10px] font-bold tabular-nums text-[var(--sidebar-end)] leading-none">
              {bar.value}
            </span>
            <div className="w-full max-w-[36px] mx-auto flex-1 flex items-end rounded-t-lg bg-[#eef2ee] overflow-hidden">
              <div
                className="w-full rounded-t-lg transition-[height] duration-500 ease-out"
                style={{ height: `${pct}%`, background: bar.color }}
              />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)] truncate w-full text-center">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalMeter({
  items,
}: {
  items: Array<{ label: string; value: number; color: string; display: string }>;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5 w-full">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-[var(--foreground-muted)]">
              {item.label}
            </span>
            <span className="font-bold tabular-nums text-[var(--sidebar-end)]">
              {item.display}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#eef2ee] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.max(4, Math.round((item.value / max) * 100))}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportCard({
  title,
  icon: Icon,
  detail,
  onOpen,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="df-card df-card-lift rounded-[20px] p-3.5 sm:p-4 flex flex-col gap-3 min-h-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-[var(--sidebar-end)] leading-tight">
              {title}
            </h3>
            <p className="text-[11px] text-[var(--foreground-muted)] font-medium mt-0.5 leading-snug">
              {detail}
            </p>
          </div>
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${title}`}
            className="shrink-0 w-8 h-8 rounded-full border border-[var(--card-border)] bg-white text-[var(--sidebar-end)] flex items-center justify-center df-focus-ring cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

export default function ReportsView({
  data,
  currency = "₹",
  onNavigate,
}: ReportsViewProps) {
  const stats = data?.stats || {};
  const settings = data?.settings || {};
  const habits = Array.isArray(data?.habits) ? data.habits : [];
  const learningGoals = Array.isArray(data?.learningGoals)
    ? data.learningGoals
    : [];

  const completed = Number(stats.completedCount || 0);
  const dueToday = Number(stats.dueTodayCount || 0);
  const overdue = Number(stats.overdueCount || 0);
  const upcoming = Number(stats.upcomingCount || 0);
  const openTasks = Math.max(
    0,
    Number(stats.totalTasks || 0) - completed
  );
  const completion = Number(stats.taskCompletionRate || 0);
  const income = Number(stats.totalIncome || 0);
  const expense = Number(stats.totalExpense || 0);
  const net = Number(stats.netBalance || 0);
  const owe = Number(stats.moneyIOwe || 0);
  const owedToMe = Number(stats.moneyOwedToMe || 0);
  const habitsDone = Number(stats.habitsCompletedToday || 0);
  const habitsTotal = Number(stats.habitsTotal || 0);
  const habitPct =
    habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0;
  const savingsTarget = Number(
    settings.savingsTarget || settings.savings_target || 0
  );

  const taskSegments = useMemo(() => {
    const segs = [
      { value: completed || 0, color: "#1f4d36", label: "Done" },
      { value: dueToday || 0, color: "#7cb342", label: "Today" },
      { value: overdue || 0, color: "#d9822b", label: "Overdue" },
      {
        value: Math.max(0, upcoming || openTasks - dueToday - overdue),
        color: "#c5d9c5",
        label: "Upcoming",
      },
    ].filter((s) => s.value > 0);
    return segs.length
      ? segs
      : [{ value: 1, color: "#e4ebe4", label: "Empty" }];
  }, [completed, dueToday, overdue, upcoming, openTasks]);

  const moneySegments = useMemo(() => {
    if (income <= 0 && expense <= 0) {
      return [{ value: 1, color: "#e4ebe4", label: "Empty" }];
    }
    return [
      { value: Math.max(income, 0.01), color: "#1f4d36", label: "Income" },
      { value: Math.max(expense, 0.01), color: "#d9822b", label: "Spent" },
    ];
  }, [income, expense]);

  const habitBars = useMemo(() => {
    if (!habits.length) {
      return [
        { label: "Done", value: habitsDone, color: "#1f4d36" },
        {
          label: "Left",
          value: Math.max(0, habitsTotal - habitsDone),
          color: "#c5d9c5",
        },
      ];
    }
    return habits.slice(0, 5).map((h: any) => ({
      label: String(h.title || h.name || "Habit")
        .slice(0, 6)
        .trim(),
      value: Number(h.streak || 0),
      color: "#1f4d36",
    }));
  }, [habits, habitsDone, habitsTotal]);

  const growthItems = useMemo(() => {
    if (!learningGoals.length) {
      return [
        {
          label: "Active tracks",
          value: Number(stats.activeLearningCount || 0),
          color: "#1f4d36",
          display: String(stats.activeLearningCount || 0),
        },
      ];
    }
    return learningGoals.slice(0, 4).map((g: any) => {
      const pct = Number(
        g.progressPercentage ?? g.progress_percentage ?? g.progress ?? 0
      );
      return {
        label: String(g.title || "Track").slice(0, 22),
        value: Math.max(0, Math.min(100, pct)),
        color: "#2e7d32",
        display: `${Math.round(pct)}%`,
      };
    });
  }, [learningGoals, stats.activeLearningCount]);

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto df-stagger">
      <MobileHeroBanner
        title="Reports"
        subtitle="Snapshot of tasks, money, habits, and growth"
        actions={
          <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-[var(--card-border)] text-[var(--sidebar)] flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
        }
      />

      <div className="hidden md:flex items-start justify-between gap-3 pt-1">
        <div>
          <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight">
            Reports
          </h1>
          <p className="text-[13px] text-[var(--foreground-muted)] font-medium mt-1">
            Snapshot of tasks, money, habits, and growth
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Compact KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 df-stagger-fast">
        {[
          {
            label: "Completion",
            value: `${completion}%`,
            hint: "Tasks done",
            tone:
              completion >= 70
                ? "text-[var(--primary)]"
                : completion >= 40
                  ? "text-[var(--warning)]"
                  : "text-[var(--alert)]",
          },
          {
            label: "Net balance",
            value: formatMoney(currency, net),
            hint: net >= 0 ? "Surplus" : "Deficit",
            tone: net >= 0 ? "text-[var(--primary)]" : "text-[var(--alert)]",
          },
          {
            label: "Dues",
            value: formatMoney(currency, owe),
            hint: "You owe",
            tone: owe > 0 ? "text-[var(--warning)]" : "text-[var(--primary)]",
          },
          {
            label: "Savings",
            value: formatMoney(currency, savingsTarget),
            hint: "Target",
            tone: "text-[var(--sidebar-end)]",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="df-card rounded-[16px] px-3 py-3 sm:p-4"
          >
            <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
              {kpi.label}
            </p>
            <p
              className={`text-[18px] sm:text-[22px] font-bold tabular-nums mt-1 leading-none ${kpi.tone}`}
            >
              {kpi.value}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[var(--foreground-muted)] mt-1.5 font-medium">
              {kpi.hint}
            </p>
          </div>
        ))}
      </div>

      {/* Chart reports — 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 df-stagger-fast">
        <ReportCard
          title="Tasks"
          icon={CheckSquare}
          detail={`${completed} done · ${dueToday} today · ${overdue} overdue`}
          onOpen={() => onNavigate?.("tasks")}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DonutChart
              size={118}
              stroke={13}
              segments={taskSegments}
              centerPrimary={`${completion}%`}
              centerSecondary="done"
            />
            <ul className="flex-1 w-full space-y-1.5 min-w-0">
              {[
                { label: "Completed", value: completed, color: "#1f4d36" },
                { label: "Due today", value: dueToday, color: "#7cb342" },
                { label: "Overdue", value: overdue, color: "#d9822b" },
                { label: "Upcoming", value: upcoming, color: "#c5d9c5" },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: row.color }}
                    />
                    <span className="text-[var(--foreground-muted)] font-medium truncate">
                      {row.label}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums text-[var(--sidebar-end)]">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ReportCard>

        <ReportCard
          title="Money"
          icon={Wallet}
          detail={`Income ${formatMoney(currency, income)} · Spent ${formatMoney(currency, expense)}`}
          onOpen={() => onNavigate?.("finance")}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DonutChart
              size={118}
              stroke={13}
              segments={moneySegments}
              centerPrimary={formatMoney(currency, net)}
              centerSecondary={net >= 0 ? "surplus" : "deficit"}
            />
            <div className="flex-1 w-full min-w-0">
              <HorizontalMeter
                items={[
                  {
                    label: "Income",
                    value: income,
                    color: "#1f4d36",
                    display: formatMoney(currency, income),
                  },
                  {
                    label: "Spent",
                    value: expense,
                    color: "#d9822b",
                    display: formatMoney(currency, expense),
                  },
                  {
                    label: "You owe",
                    value: owe,
                    color: "#d64545",
                    display: formatMoney(currency, owe),
                  },
                  {
                    label: "Owed to you",
                    value: owedToMe,
                    color: "#7cb342",
                    display: formatMoney(currency, owedToMe),
                  },
                ]}
              />
            </div>
          </div>
        </ReportCard>

        <ReportCard
          title="Habits"
          icon={Flame}
          detail={
            habitsTotal > 0
              ? `${habitsDone} / ${habitsTotal} completed today · ${habitPct}%`
              : "No habits tracked yet"
          }
          onOpen={() => onNavigate?.("habits")}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DonutChart
              size={118}
              stroke={13}
              segments={
                habitsTotal > 0
                  ? [
                      {
                        value: Math.max(habitsDone, 0.01),
                        color: "#1f4d36",
                        label: "Done",
                      },
                      {
                        value: Math.max(habitsTotal - habitsDone, 0.01),
                        color: "#ddebc8",
                        label: "Left",
                      },
                    ]
                  : [{ value: 1, color: "#e4ebe4", label: "Empty" }]
              }
              centerPrimary={`${habitPct}%`}
              centerSecondary="today"
            />
            <div className="flex-1 w-full min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)] mb-2">
                {habits.length ? "Streak days" : "Today"}
              </p>
              <MiniBarChart bars={habitBars} height={96} />
            </div>
          </div>
        </ReportCard>

        <ReportCard
          title="Growth"
          icon={GraduationCap}
          detail={`${Number(stats.activeLearningCount || 0)} active learning track${Number(stats.activeLearningCount || 0) === 1 ? "" : "s"}`}
          onOpen={() => onNavigate?.("growth")}
        >
          <div className="space-y-3">
            <HorizontalMeter items={growthItems} />
            {!learningGoals.length && (
              <p className="text-[11px] text-[var(--foreground-muted)] font-medium">
                Add a learning track in Growth to see progress bars here.
              </p>
            )}
          </div>
        </ReportCard>
      </div>
    </div>
  );
}
