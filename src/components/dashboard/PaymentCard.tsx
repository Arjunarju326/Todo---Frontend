"use client";

import React from "react";
import { CalendarCheck, Check } from "lucide-react";

export type PaymentItem = {
  title: string;
  amount: number;
  due: string;
  status: string;
  statusTone: "warning" | "muted" | "success";
  icon: React.ComponentType<{ className?: string }>;
};

const toneClass: Record<PaymentItem["statusTone"], string> = {
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  muted: "bg-[#eef0ee] text-[var(--foreground-muted)]",
  success: "bg-[var(--paid-soft)] text-[var(--paid)]",
};

type PaymentCardProps = {
  payments: PaymentItem[];
  currency: string;
  onViewAll: () => void;
  onSelect?: () => void;
};

export default function PaymentCard({
  payments,
  currency,
  onViewAll,
  onSelect,
}: PaymentCardProps) {
  return (
    <section
      className="df-card p-3.5 sm:p-4 rounded-[18px] animate-df-fade-up"
      style={{ animationDelay: "260ms" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[#2e7d32]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Upcoming Payments &amp; EMIs
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {payments.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              type="button"
              onClick={onSelect || onViewAll}
              className="df-card-lift text-left rounded-xl border border-[#e8eee8] bg-[#fbfcfb] p-2.5 hover:bg-[var(--accent-mint)] hover:border-[#c5d9c5] transition-all duration-150 cursor-pointer df-focus-ring flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[var(--sidebar-end)] truncate">
                    {p.title}{" "}
                    <span className="font-bold text-[var(--sidebar-end)] tabular-nums ml-1">
                      {currency}{p.amount.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">
                    {p.due}
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 ${toneClass[p.statusTone]}`}
              >
                {p.statusTone === "success" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                {p.status}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
