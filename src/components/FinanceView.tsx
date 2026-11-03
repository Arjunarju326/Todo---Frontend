"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Wifi,
  Smartphone,
  Tv,
  Trash2,
  Users,
  ChevronDown,
} from "lucide-react";
import DonutChart from "./dashboard/DonutChart";

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

const SPENDING = [
  { value: 40, color: "#1f4d36", label: "Essentials", pct: "40%" },
  { value: 30, color: "#2e7d32", label: "Bills & EMI", pct: "30%" },
  { value: 17, color: "#7cb342", label: "Food", pct: "17%" },
  { value: 13, color: "#c5d9c5", label: "Others", pct: "13%" },
];

const BUDGETS = [
  { label: "Food & Dining", spent: 750, total: 2500, color: "#2e7d32" },
  { label: "Transport", spent: 420, total: 1500, color: "#1f4d36" },
];

const PAYMENTS = [
  {
    title: "Internet bill",
    amount: 899,
    status: "Due tomorrow",
    tone: "warning" as const,
    icon: Wifi,
  },
  {
    title: "Phone EMI",
    amount: 4500,
    status: "Upcoming",
    tone: "muted" as const,
    icon: Smartphone,
  },
  {
    title: "OTT Subscription",
    amount: 299,
    status: "Paid",
    tone: "success" as const,
    icon: Tv,
  },
];

export default function FinanceView({
  currency = "₹",
  onRefreshDashboard,
}: {
  currency?: string;
  onRefreshDashboard?: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [txTitle, setTxTitle] = useState("");
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("FOOD");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtType, setDebtType] = useState<"OWED_BY_ME" | "OWED_TO_ME">(
    "OWED_BY_ME"
  );
  const [debtAmount, setDebtAmount] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setDebts(data.debts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome =
    transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0) || 15000;
  const totalExpense =
    transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0) || 4500;
  const balance = totalIncome - totalExpense || 10500;

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
        setTransactions((prev) => [data.transaction, ...prev]);
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
        setDebts((prev) => [data.debt, ...prev]);
        setDebtPerson("");
        setDebtAmount("");
        setIsAddingDebt(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
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

  const monthLabel = new Date().toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  const toneClass = {
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    muted: "bg-[#eef0ee] text-[var(--foreground-muted)]",
    success: "bg-[var(--paid-soft)] text-[var(--paid)]",
  };

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight">
          My Money
        </h1>
        <button
          type="button"
          className="h-9 px-3 rounded-full bg-white border border-[var(--card-border)] flex items-center gap-1.5 text-[12px] font-semibold text-[var(--sidebar-end)] shadow-sm df-focus-ring"
        >
          <Calendar className="w-3.5 h-3.5" />
          {monthLabel}
          <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
        </button>
      </div>

      {/* Balance card */}
      <section className="rounded-[22px] bg-[var(--sidebar)] text-white p-5 shadow-[0_12px_28px_rgba(22,55,42,0.25)]">
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
      </section>

      {/* Spending breakdown */}
      <section className="df-card rounded-[20px] p-4">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] mb-3">
          Spending Breakdown
        </h2>
        <div className="flex items-center gap-4">
          <DonutChart
            segments={SPENDING}
            size={110}
            stroke={14}
            centerPrimary={`${currency}${totalExpense.toLocaleString("en-IN")}`}
            centerSecondary="Spent"
          />
          <ul className="flex-1 space-y-2 min-w-0">
            {SPENDING.map((s) => (
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
      </section>

      {/* Budgets */}
      <section className="df-card rounded-[20px] p-4 space-y-3.5">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">Budgets</h2>
        {BUDGETS.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.total) * 100));
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-[var(--sidebar-end)]">
                  {b.label}
                </span>
                <span className="text-[11px] font-medium text-[var(--foreground-muted)] tabular-nums">
                  {currency}
                  {b.spent.toLocaleString("en-IN")} /{" "}
                  {currency}
                  {b.total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#eef2ee] overflow-hidden df-progress-bar">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: b.color }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Upcoming payments */}
      <section className="df-card rounded-[20px] p-4 space-y-2.5">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] mb-1">
          Upcoming Payments &amp; EMIs
        </h2>
        {PAYMENTS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="flex items-center gap-3 py-1.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
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
          );
        })}
      </section>

      {/* Savings goal */}
      <section className="df-card rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Savings Goal
          </h2>
          <span className="text-[11px] font-bold text-[var(--sidebar)]">20%</span>
        </div>
        <p className="text-[12px] text-[var(--foreground-muted)] font-medium mb-2">
          Emergency Fund · {currency}10,000 / {currency}50,000
        </p>
        <div className="h-2.5 rounded-full bg-[#eef2ee] overflow-hidden df-progress-bar">
          <span
            className="block h-full rounded-full bg-[var(--sidebar)]"
            style={{ width: "20%" }}
          />
        </div>
      </section>

      {/* Quick actions + recent transactions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setIsAddingDebt(false);
            setIsAddingTransaction((v) => !v);
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

      {transactions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
            Recent Transactions
          </h2>
          {transactions.slice(0, 6).map((tx) => (
            <div
              key={tx._id}
              className="df-card rounded-[16px] p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                  {tx.title}
                </p>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {tx.category}
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
          ))}
        </section>
      )}

      {debts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
            Debts
          </h2>
          {debts.map((d) => (
            <div key={d._id} className="df-card rounded-[16px] p-3">
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
          ))}
        </section>
      )}
    </div>
  );
}
