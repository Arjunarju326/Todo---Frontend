"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Calendar,
  Trash2,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import DonutChart from "./dashboard/DonutChart";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import type { NavSection } from "./Navbar";

interface Transaction {
  _id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
  notes?: string;
}

interface Debt {
  _id: string;
  personName: string;
  type: "OWED_BY_ME" | "OWED_TO_ME";
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  status: "PENDING" | "PARTIALLY_PAID" | "SETTLED";
  notes?: string;
}

interface Bill {
  _id: string;
  title: string;
  amount: number;
  category: string;
  rechargeDate: string;
  planDays: number;
  remindDaysBefore: number;
  expiresOn: string;
  daysLeft: number;
  reminderStatus: "ACTIVE" | "ABOUT_TO_EXPIRE" | "EXPIRED";
  notes?: string;
  isActive: boolean;
}

const CATEGORY_COLORS = [
  "#1f4d36",
  "#2e7d32",
  "#7cb342",
  "#c5d9c5",
  "#3d6b48",
  "#66a06f",
];

function formatCategory(cat: string) {
  return cat
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const SECTION_TABS: { id: NavSection; label: string }[] = [
  { id: "transactions", label: "Transactions" },
  { id: "budgets", label: "Budgets" },
  { id: "bills", label: "Bills & EMIs" },
  { id: "debts", label: "Debts" },
  { id: "savings", label: "Savings" },
];

export default function FinanceView({
  currency = "₹",
  section = null,
  onRefreshDashboard,
}: {
  currency?: string;
  section?: NavSection;
  onRefreshDashboard?: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [focusSection, setFocusSection] = useState<NavSection>(section);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [txTitle, setTxTitle] = useState("");
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("FOOD");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtType, setDebtType] = useState<"OWED_BY_ME" | "OWED_TO_ME">(
    "OWED_BY_ME"
  );
  const [debtAmount, setDebtAmount] = useState("");
  const [billTitle, setBillTitle] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billRechargeDate, setBillRechargeDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [billPlanDays, setBillPlanDays] = useState("28");
  const [monthCursor, setMonthCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [monthOpen, setMonthOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [financeRes, dashRes] = await Promise.all([
        fetch("/api/finance"),
        fetch("/api/dashboard"),
      ]);
      const finance = await financeRes.json();
      const dash = await dashRes.json();
      if (finance.success) {
        setTransactions(finance.transactions || []);
        setDebts(finance.debts || []);
        setBills(finance.bills || []);
      }
      if (dash.success) setSettings(dash.settings || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFocusSection(section);
    if (section === "transactions") {
      setIsAddingTransaction(true);
      setIsAddingDebt(false);
      setIsAddingBill(false);
    } else if (section === "debts") {
      setIsAddingDebt(true);
      setIsAddingTransaction(false);
      setIsAddingBill(false);
    } else if (section === "bills") {
      setIsAddingBill(true);
      setIsAddingTransaction(false);
      setIsAddingDebt(false);
    } else {
      setIsAddingTransaction(false);
      setIsAddingDebt(false);
      setIsAddingBill(false);
    }
  }, [section]);

  useEffect(() => {
    if (!focusSection || loading) return;
    const el = sectionRefs.current[focusSection];
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusSection, loading, transactions.length, debts.length, bills.length]);

  const sectionClass = (id: string, opts?: { padded?: boolean }) =>
    `scroll-mt-6 transition-[box-shadow,padding] duration-500 ${
      focusSection === id
        ? `ring-2 ring-[var(--sidebar)]/30 rounded-[20px]${
            opts?.padded ? " p-3" : ""
          }`
        : ""
    }`;

  const monthTransactions = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [transactions, monthCursor]);

  const totalIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const spending = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === "EXPENSE");
    const byCat: Record<string, number> = {};
    for (const t of expenses) {
      const key = t.category || "OTHER";
      byCat[key] = (byCat[key] || 0) + t.amount;
    }
    const total = Object.values(byCat).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label: formatCategory(label),
        value,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        pct: `${Math.round((value / total) * 100)}%`,
      }));
  }, [monthTransactions]);

  const shiftMonth = (delta: number) => {
    setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return debts
      .filter((d) => d.type === "OWED_BY_ME" && d.status !== "SETTLED")
      .map((d) => {
        const remaining = d.totalAmount - d.paidAmount;
        let status = "Upcoming";
        let tone: "warning" | "muted" | "success" = "muted";
        if (d.dueDate) {
          const due = new Date(d.dueDate);
          due.setHours(0, 0, 0, 0);
          if (due.getTime() <= today.getTime()) {
            status = "Due soon";
            tone = "warning";
          } else if (due.getTime() === tomorrow.getTime()) {
            status = "Due tomorrow";
            tone = "warning";
          }
        }
        return {
          id: d._id,
          title: d.personName,
          amount: remaining,
          status,
          tone,
        };
      });
  }, [debts]);

  const savingsTarget = Number(
    settings?.savingsTarget ?? settings?.savings_target ?? 0
  );
  const monthlyIncome = Number(
    settings?.monthlyIncome ?? settings?.monthly_income ?? 0
  );
  const savingsProgress =
    monthlyIncome > 0 && savingsTarget > 0
      ? Math.min(100, Math.round((savingsTarget / monthlyIncome) * 100))
      : 0;

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "transaction",
          title: txTitle,
          type: txType,
          amount: Number(txAmount),
          category: txCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const item = data.transaction || data.item;
        if (item) setTransactions((prev) => [item, ...prev]);
        setTxTitle("");
        setTxAmount("");
        setIsAddingTransaction(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson.trim() || !debtAmount) return;
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "debt",
          personName: debtPerson,
          type: debtType,
          totalAmount: Number(debtAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const item = data.debt || data.item;
        if (item) setDebts((prev) => [item, ...prev]);
        setDebtPerson("");
        setDebtAmount("");
        setIsAddingDebt(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle.trim() || !billRechargeDate) return;
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "bill",
          title: billTitle.trim(),
          amount: Number(billAmount) || 0,
          category: "MOBILE",
          rechargeDate: billRechargeDate,
          planDays: Number(billPlanDays) || 28,
          remindDaysBefore: 3,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const item = data.bill || data.item;
        if (item) setBills((prev) => [item, ...prev]);
        setBillTitle("");
        setBillAmount("");
        setBillPlanDays("28");
        setBillRechargeDate(new Date().toISOString().slice(0, 10));
        setIsAddingBill(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRecharged = async (billId: string) => {
    try {
      const res = await fetch("/api/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "bill",
          id: billId,
          markRecharged: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.bill) {
        setBills((prev) =>
          prev.map((b) => (b._id === billId || String(b._id) === String(data.bill._id) ? data.bill : b))
        );
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm("Delete this plan reminder?")) return;
    setBills((prev) => prev.filter((b) => b._id !== id));
    try {
      await fetch(`/api/finance?id=${id}&itemType=bill`, { method: "DELETE" });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const billStatusLabel = (bill: Bill) => {
    if (bill.reminderStatus === "EXPIRED") return "Expired";
    if (bill.reminderStatus === "ABOUT_TO_EXPIRE") return "About to expire";
    if (bill.daysLeft === 1) return "1 day left";
    return `${bill.daysLeft} days left`;
  };

  const billStatusTone = (bill: Bill): "warning" | "muted" | "success" => {
    if (bill.reminderStatus === "EXPIRED" || bill.reminderStatus === "ABOUT_TO_EXPIRE") {
      return "warning";
    }
    return "muted";
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    try {
      await fetch(`/api/finance?id=${id}&itemType=transaction`, {
        method: "DELETE",
      });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const monthLabel = monthCursor.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  const toneClass = {
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    muted: "bg-[#eef0ee] text-[var(--foreground-muted)]",
    success: "bg-[var(--paid-soft)] text-[var(--paid)]",
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--foreground-muted)]">
        Loading money data...
      </div>
    );
  }

  const emiCommitment = Number(
    settings?.monthlyEmiCommitment ?? settings?.monthly_emi_commitment ?? 0
  );

  const monthPicker = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMonthOpen((v) => !v)}
        aria-expanded={monthOpen}
        aria-haspopup="dialog"
        className="h-9 px-3 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center gap-1.5 text-[12px] font-semibold text-[var(--sidebar-end)] shadow-sm df-focus-ring cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5" />
        {monthLabel}
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--foreground-subtle)] transition-transform ${
            monthOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {monthOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[220px] rounded-2xl bg-white border border-[var(--card-border)] shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-[12px] font-bold text-[var(--sidebar-end)] tabular-nums">
              {monthCursor.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const n = new Date();
              setMonthCursor(new Date(n.getFullYear(), n.getMonth(), 1));
              setMonthOpen(false);
            }}
            className="w-full h-8 rounded-xl bg-[var(--sidebar)] text-white text-[11px] font-semibold df-focus-ring cursor-pointer"
          >
            This month
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto df-stagger">
      <MobileHeroBanner
        title="My Money"
        subtitle="Balance, budgets, and upcoming bills"
        actions={monthPicker}
      />

      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight">
          My Money
        </h1>
        {monthPicker}
      </div>

      <div className="md:hidden flex items-center justify-between gap-2 df-card rounded-[16px] px-2 py-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-white flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setMonthOpen((v) => !v)}
          className="min-w-0 flex-1 h-9 rounded-full bg-[var(--sidebar)] text-white text-[12px] font-semibold tabular-nums df-focus-ring cursor-pointer"
        >
          {monthCursor.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-white flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-0.5 px-0.5">
        {SECTION_TABS.map((tab) => {
          const selected = focusSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFocusSection(tab.id)}
              className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors df-focus-ring ${
                selected
                  ? "bg-[var(--sidebar)] text-white"
                  : "bg-white border border-[var(--card-border)] text-[var(--sidebar-end)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className="relative overflow-hidden rounded-[22px] bg-[var(--sidebar)] text-white p-5 shadow-[0_12px_28px_rgba(22,55,42,0.25)] animate-df-scale-in df-mobile-glass-deep">
        {/* Mobile scenic wash — desktop stays solid green */}
        <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-mist.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--sidebar)]/70 via-[var(--sidebar)]/85 to-[var(--sidebar-end)]" />
        </div>
        <div className="relative z-10">
          <p className="text-[12px] font-medium text-[#c5d9c5]">Available Balance</p>
          <p className="text-[32px] font-bold tracking-tight leading-none mt-1.5 tabular-nums">
            {currency}
            {balance.toLocaleString("en-IN")}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/15">
            <div>
              <p className="text-[11px] text-[#a8bbae] font-medium">Income</p>
              <p className="text-[16px] font-bold mt-0.5 tabular-nums">
                {currency}
                {totalIncome.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#a8bbae] font-medium">Expenses</p>
              <p className="text-[16px] font-bold mt-0.5 tabular-nums">
                {currency}
                {totalExpense.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          sectionRefs.current.budgets = el;
        }}
        className={`df-card df-card-lift rounded-[20px] p-4 ${sectionClass("budgets")}`}
      >
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] mb-3">
          Spending Breakdown
        </h2>
        {spending.length === 0 ? (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            No expenses recorded this period.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <DonutChart
              segments={spending}
              size={110}
              stroke={14}
              centerPrimary={`${currency}${totalExpense.toLocaleString("en-IN")}`}
              centerSecondary="Spent"
            />
            <ul className="flex-1 space-y-2 min-w-0">
              {spending.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-[12px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="flex-1 text-[var(--foreground-muted)] font-medium truncate">
                    {s.label}
                  </span>
                  <span className="font-bold text-[var(--sidebar-end)] tabular-nums">
                    {s.pct}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section
        ref={(el) => {
          sectionRefs.current.bills = el;
        }}
        className={`df-card df-card-lift rounded-[20px] p-4 space-y-2.5 ${sectionClass("bills")}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Upcoming Payments &amp; EMIs
          </h2>
          <button
            type="button"
            onClick={() => {
              setIsAddingBill((v) => !v);
              setIsAddingTransaction(false);
              setIsAddingDebt(false);
              setFocusSection("bills");
            }}
            className="text-[11px] font-semibold text-[var(--sidebar)] hover:underline df-focus-ring rounded-md"
          >
            {isAddingBill ? "Cancel" : "+ Add plan"}
          </button>
        </div>

        {isAddingBill && (
          <form
            onSubmit={handleCreateBill}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-3 space-y-2.5 mb-1"
          >
            <p className="text-[11px] text-[var(--foreground-muted)] font-medium">
              Track a recharge (e.g. 28-day mobile plan). You&apos;ll get reminded before it expires.
            </p>
            <input
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              placeholder="Plan name (e.g. Mobile Recharge)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--card-border)] text-sm outline-none"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
                  Recharge date
                </span>
                <input
                  type="date"
                  value={billRechargeDate}
                  onChange={(e) => setBillRechargeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--card-border)] text-sm outline-none"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
                  Plan days
                </span>
                <input
                  type="number"
                  min={1}
                  value={billPlanDays}
                  onChange={(e) => setBillPlanDays(e.target.value)}
                  placeholder="28"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--card-border)] text-sm outline-none"
                  required
                />
              </label>
            </div>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="Amount (optional)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--card-border)] text-sm outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[var(--sidebar)] text-white text-xs font-semibold"
            >
              Save plan reminder
            </button>
          </form>
        )}

        {bills.length > 0 && (
          <div className="space-y-2.5 pb-2 border-b border-[var(--card-border)] mb-1">
            {bills.map((bill) => (
              <div key={bill._id} className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                    {bill.title}
                  </p>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    {bill.planDays}-day plan · recharged{" "}
                    {new Date(bill.rechargeDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                    {bill.amount > 0
                      ? ` · ${currency}${bill.amount.toLocaleString("en-IN")}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneClass[billStatusTone(bill)]}`}
                  >
                    {billStatusLabel(bill)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkRecharged(bill._id)}
                      className="text-[10px] font-semibold text-[var(--sidebar)] hover:underline"
                    >
                      Recharged
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBill(bill._id)}
                      className="text-[var(--foreground-subtle)] hover:text-[var(--alert)]"
                      aria-label="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {emiCommitment > 0 && (
          <div className="flex items-center gap-3 py-1.5 border-b border-[var(--card-border)] pb-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                Monthly EMI / Commitments
              </p>
              <p className="text-[11px] text-[var(--foreground-muted)] tabular-nums">
                {currency}
                {emiCommitment.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-[#eef0ee] text-[var(--foreground-muted)]">
              Planned
            </span>
          </div>
        )}
        {upcomingPayments.length === 0 && bills.length === 0 && emiCommitment <= 0 ? (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            No upcoming bills or EMIs. Add a mobile plan to get expiry reminders.
          </p>
        ) : (
          upcomingPayments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-1.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                  {p.title}
                </p>
                <p className="text-[11px] text-[var(--foreground-muted)] tabular-nums">
                  {currency}
                  {p.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${toneClass[p.tone]}`}
              >
                {p.status}
              </span>
            </div>
          ))
        )}
      </section>

      <section
        ref={(el) => {
          sectionRefs.current.savings = el;
        }}
        className={`df-card df-card-lift rounded-[20px] p-4 ${sectionClass("savings")}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Savings Target
          </h2>
          <span className="text-[11px] font-bold text-[var(--sidebar)]">
            {savingsProgress}%
          </span>
        </div>
        {savingsTarget > 0 ? (
          <>
            <p className="text-[12px] text-[var(--foreground-muted)] font-medium mb-2">
              Monthly target · {currency}
              {savingsTarget.toLocaleString("en-IN")}
              {monthlyIncome > 0
                ? ` of ${currency}${monthlyIncome.toLocaleString("en-IN")} income`
                : ""}
            </p>
            <div className="h-2.5 rounded-full bg-[#eef2ee] overflow-hidden df-progress-bar">
              <span
                className="block h-full rounded-full bg-[var(--sidebar)]"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            Set a savings target in Settings to track progress here.
          </p>
        )}
      </section>

      <div
        ref={(el) => {
          sectionRefs.current.transactions = el;
        }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={() => {
            setIsAddingDebt(false);
            setIsAddingTransaction((v) => !v);
            setFocusSection("transactions");
          }}
          className="flex-1 h-11 rounded-2xl bg-[var(--sidebar)] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer df-focus-ring"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Transaction
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAddingTransaction(false);
            setIsAddingDebt((v) => !v);
            setFocusSection("debts");
          }}
          className="h-11 px-4 rounded-2xl bg-white border border-[var(--card-border)] text-[var(--sidebar-end)] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer df-focus-ring"
        >
          <Users className="w-4 h-4" />
          Debt
        </button>
      </div>

      {isAddingTransaction && (
        <form
          onSubmit={handleCreateTransaction}
          className="df-card p-4 rounded-[20px] space-y-3"
        >
          <div className="flex rounded-xl bg-[var(--background)] border border-[var(--card-border)] p-0.5">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTxType(t)}
                className={`flex-1 py-1.5 text-xs rounded-lg font-semibold ${
                  txType === t
                    ? "bg-[var(--sidebar)] text-white"
                    : "text-[var(--foreground-muted)]"
                }`}
              >
                {t === "EXPENSE" ? "Expense" : "Income"}
              </button>
            ))}
          </div>
          <input
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="Amount"
              className="px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none"
              required
            />
            <select
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm"
            >
              <option value="FOOD">Food</option>
              <option value="BILLS">Bills</option>
              <option value="EMI">EMI</option>
              <option value="TRAVEL">Travel</option>
              <option value="SALARY">Salary</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--sidebar)] text-white text-xs font-semibold"
          >
            Save
          </button>
        </form>
      )}

      {isAddingDebt && (
        <form
          onSubmit={handleCreateDebt}
          className="df-card p-4 rounded-[20px] space-y-3"
        >
          <select
            value={debtType}
            onChange={(e) =>
              setDebtType(e.target.value as "OWED_BY_ME" | "OWED_TO_ME")
            }
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm"
          >
            <option value="OWED_BY_ME">I owe</option>
            <option value="OWED_TO_ME">Owed to me</option>
          </select>
          <input
            value={debtPerson}
            onChange={(e) => setDebtPerson(e.target.value)}
            placeholder="Person name"
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none"
            required
          />
          <input
            type="number"
            value={debtAmount}
            onChange={(e) => setDebtAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none"
            required
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--sidebar)] text-white text-xs font-semibold"
          >
            Save Debt
          </button>
        </form>
      )}

      <section
        className={`space-y-2 df-stagger-fast ${sectionClass("transactions", { padded: true })}`}
      >
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
          Recent Transactions
        </h2>
        {monthTransactions.length === 0 ? (
          <div className="df-card rounded-[16px] p-4">
            <p className="text-[12px] text-[var(--foreground-muted)]">
              No transactions for this month. Add one to start tracking.
            </p>
          </div>
        ) : (
          monthTransactions.slice(0, 8).map((tx) => (
            <div
              key={tx._id}
              className="df-card df-card-lift rounded-[16px] p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                  {tx.title}
                </p>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {formatCategory(tx.category)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[13px] font-bold tabular-nums ${
                    tx.type === "INCOME"
                      ? "text-[var(--primary)]"
                      : "text-[var(--sidebar-end)]"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {currency}
                  {tx.amount.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteTransaction(tx._id)}
                  className="p-1 text-[var(--foreground-subtle)] hover:text-[var(--alert)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section
        ref={(el) => {
          sectionRefs.current.debts = el;
        }}
        className={`space-y-2 df-stagger-fast ${sectionClass("debts", { padded: true })}`}
      >
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
          Debts
        </h2>
        {debts.length === 0 ? (
          <div className="df-card rounded-[16px] p-4">
            <p className="text-[12px] text-[var(--foreground-muted)]">
              No debts recorded. Use the Debt button to add one.
            </p>
          </div>
        ) : (
          debts.map((d) => (
            <div key={d._id} className="df-card df-card-lift rounded-[16px] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-[var(--sidebar-end)]">
                  {d.personName}
                </p>
                <span className="text-[13px] font-bold tabular-nums">
                  {currency}
                  {(d.totalAmount - d.paidAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                {d.type === "OWED_BY_ME" ? "Payable" : "Receivable"}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
