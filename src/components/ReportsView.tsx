"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  CheckSquare,
  Wallet,
  Flame,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";

type ReportsViewProps = {
  data?: any;
  currency?: string;
  onNavigate?: (tab: string) => void;
};

function StatPill({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "alert";
}) {
  const toneClass =
    tone === "good"
      ? "text-[var(--primary)]"
      : tone === "warn"
        ? "text-[var(--warning)]"
        : tone === "alert"
          ? "text-[var(--alert)]"
          : "text-[var(--sidebar-end)]";

  return (
    <div className="df-card df-card-lift rounded-[18px] p-4">
      <p className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-[22px] font-bold tabular-nums mt-1 ${toneClass}`}>
        {value}
      </p>
      {hint && (
        <p className="text-[11px] text-[var(--foreground-muted)] mt-1 font-medium">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ReportsView({
  data,
  currency = "₹",
  onNavigate,
}: ReportsViewProps) {
  const stats = data?.stats || {};
  const settings = data?.settings || {};

  const rows = useMemo(
    () => [
      {
        icon: CheckSquare,
        title: "Tasks",
        detail: `${stats.completedCount || 0} done · ${stats.dueTodayCount || 0} due today · ${stats.overdueCount || 0} overdue`,
        action: () => onNavigate?.("tasks"),
      },
      {
        icon: Wallet,
        title: "Money",
        detail: `Income ${currency}${Number(stats.totalIncome || 0).toLocaleString("en-IN")} · Spent ${currency}${Number(stats.totalExpense || 0).toLocaleString("en-IN")}`,
        action: () => onNavigate?.("finance"),
      },
      {
        icon: Flame,
        title: "Habits",
        detail: `${stats.habitsCompletedToday || 0} / ${stats.habitsTotal || 0} completed today`,
        action: () => onNavigate?.("habits"),
      },
      {
        icon: GraduationCap,
        title: "Growth",
        detail: `${stats.activeLearningCount || 0} active learning track${stats.activeLearningCount === 1 ? "" : "s"}`,
        action: () => onNavigate?.("growth"),
      },
    ],
    [stats, currency, onNavigate]
  );

  const completion = Number(stats.taskCompletionRate || 0);
  const net = Number(stats.netBalance || 0);
  const owe = Number(stats.moneyIOwe || 0);

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 df-stagger-fast">
        <StatPill
          label="Task completion"
          value={`${completion}%`}
          hint="This period"
          tone={completion >= 70 ? "good" : completion >= 40 ? "warn" : "alert"}
        />
        <StatPill
          label="Net balance"
          value={`${currency}${Math.abs(net).toLocaleString("en-IN")}`}
          hint={net >= 0 ? "Surplus this month" : "Deficit this month"}
          tone={net >= 0 ? "good" : "alert"}
        />
        <StatPill
          label="Outstanding dues"
          value={`${currency}${owe.toLocaleString("en-IN")}`}
          hint="Active debts you owe"
          tone={owe > 0 ? "warn" : "good"}
        />
        <StatPill
          label="Savings target"
          value={`${currency}${Number(settings.savingsTarget || settings.savings_target || 0).toLocaleString("en-IN")}`}
          hint="From settings"
        />
      </div>

      <section className="df-card df-card-lift rounded-[20px] p-4 space-y-1">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] mb-2">
          Area summaries
        </h2>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.title}
              type="button"
              onClick={row.action}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--background)] transition-colors text-left cursor-pointer df-focus-ring"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--sidebar-end)]">
                  {row.title}
                </p>
                <p className="text-[11px] text-[var(--foreground-muted)] font-medium truncate">
                  {row.detail}
                </p>
              </div>
              {row.title === "Money" ? (
                net >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[var(--primary)] shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[var(--alert)] shrink-0" />
                )
              ) : Number(stats.overdueCount || 0) > 0 && row.title === "Tasks" ? (
                <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0" />
              ) : null}
            </button>
          );
        })}
      </section>
    </div>
  );
}
