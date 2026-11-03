"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  CreditCard,
  Users,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
} from "lucide-react";

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
  repayments?: { amount: number; date: string; notes?: string }[];
}

export default function FinanceView({
  currency = "₹",
  onRefreshDashboard,
}: {
  currency?: string;
  onRefreshDashboard?: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "DEBTS" | "EMI">("TRANSACTIONS");

  // Form states
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [repaymentModalDebt, setRepaymentModalDebt] = useState<Debt | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState("");

  // New Transaction Form State
  const [txTitle, setTxTitle] = useState("");
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("FOOD");
  const [txRecurring, setTxRecurring] = useState(false);

  // New Debt Form State
  const [debtPerson, setDebtPerson] = useState("");
  const [debtType, setDebtType] = useState<"OWED_BY_ME" | "OWED_TO_ME">("OWED_BY_ME");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setDebts(data.debts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          isRecurring: txRecurring,
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
          dueDate: debtDueDate || undefined,
          notes: debtNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDebts((prev) => [data.debt, ...prev]);
        setDebtPerson("");
        setDebtAmount("");
        setDebtDueDate("");
        setDebtNotes("");
        setIsAddingDebt(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentModalDebt || !repaymentAmount) return;

    try {
      const res = await fetch("/api/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtId: repaymentModalDebt._id,
          repaymentAmount: Number(repaymentAmount),
          recordTransaction: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDebts((prev) =>
          prev.map((d) => (d._id === data.debt._id ? data.debt : d))
        );
        setRepaymentModalDebt(null);
        setRepaymentAmount("");
        fetchData();
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string, itemType: "transaction" | "debt") => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      if (itemType === "transaction") {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
      } else {
        setDebts((prev) => prev.filter((d) => d._id !== id));
      }
      await fetch(`/api/finance?id=${id}&itemType=${itemType}`, { method: "DELETE" });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalMoneyIOwe = debts
    .filter((d) => d.type === "OWED_BY_ME" && d.status !== "SETTLED")
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const totalOwedToMe = debts
    .filter((d) => d.type === "OWED_TO_ME" && d.status !== "SETTLED")
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-1 md:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#191D23]" />
            <span>Money & Dues Manager</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Strict cashflow tracking, EMIs, debts, and savings targets
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAddingDebt(false);
              setIsAddingTransaction(!isAddingTransaction);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#191D23] hover:bg-[#2C3440] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
          <button
            onClick={() => {
              setIsAddingTransaction(false);
              setIsAddingDebt(!isAddingDebt);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#F3EFE7] border border-[#EAE5DC] text-[#1A1D20] font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Track Debt</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-[#EAE5DC] p-4 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787E86]">Total Income</span>
            <div className="w-7 h-7 rounded-xl bg-[#E6EDE3] text-[#2F4D2E] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg md:text-xl font-bold text-[#2D5A2C] font-mono">
            {currency}
            {totalIncome.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#787E86] mt-1">Recorded inflows</p>
        </div>

        <div className="bg-white border border-[#EAE5DC] p-4 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787E86]">Total Expenses</span>
            <div className="w-7 h-7 rounded-xl bg-[#FBEBE8] text-[#C4382B] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg md:text-xl font-bold text-[#C4382B] font-mono">
            {currency}
            {totalExpense.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#787E86] mt-1">Outflows & commitments</p>
        </div>

        <div className="bg-white border border-[#EAE5DC] p-4 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787E86]">Net Cashflow</span>
            <div className="w-7 h-7 rounded-xl bg-[#F5F2EB] text-[#191D23] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-lg md:text-xl font-bold font-mono ${
              netBalance >= 0 ? "text-[#1A1D20]" : "text-[#C4382B]"
            }`}
          >
            {currency}
            {netBalance.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#787E86] mt-1">Monthly balance</p>
        </div>

        <div className="bg-white border border-[#EAE5DC] p-4 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787E86]">Pending Debts</span>
            <div className="w-7 h-7 rounded-xl bg-[#FDF3E7] text-[#B4671F] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg md:text-xl font-bold text-[#B4671F] font-mono">
            {currency}
            {totalMoneyIOwe.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#787E86] mt-1">
            Receivable: {currency}{totalOwedToMe.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Add Transaction Form Modal / Box */}
      {isAddingTransaction && (
        <form
          onSubmit={handleCreateTransaction}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Record New Transaction</span>
            </h3>
            <span className="text-xs text-[#787E86]">Income or Expense</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Type</label>
              <div className="flex rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] p-0.5">
                <button
                  type="button"
                  onClick={() => setTxType("EXPENSE")}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    txType === "EXPENSE"
                      ? "bg-[#191D23] text-white shadow-xs"
                      : "text-[#656C75]"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("INCOME")}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    txType === "INCOME"
                      ? "bg-[#3D6938] text-white shadow-xs"
                      : "text-[#656C75]"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Swiggy Lunch, Cloud Hosting"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none focus:border-[#191D23]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] font-mono focus:outline-none focus:border-[#191D23]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Category</label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="FOOD">Food & Groceries</option>
                <option value="EMI">EMI & Loans</option>
                <option value="RENT">Rent & Housing</option>
                <option value="BILLS">Bills & WiFi</option>
                <option value="TRAVEL">Travel & Transport</option>
                <option value="SALARY">Salary</option>
                <option value="FREELANCE">Freelance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE5DC]">
            <button
              type="button"
              onClick={() => setIsAddingTransaction(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[#787E86] hover:text-[#1A1D20]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Add Debt Form */}
      {isAddingDebt && (
        <form
          onSubmit={handleCreateDebt}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Track New Debt or Loan</span>
            </h3>
            <span className="text-xs text-[#787E86]">Debts & Receivables</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Direction</label>
              <select
                value={debtType}
                onChange={(e) => setDebtType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="OWED_BY_ME">I Borrowed Money (I must pay)</option>
                <option value="OWED_TO_ME">I Lent Money (They must pay me)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Person Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul, Bank, Landlord"
                value={debtPerson}
                onChange={(e) => setDebtPerson(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none focus:border-[#191D23]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] font-mono focus:outline-none focus:border-[#191D23]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Due Date</label>
              <input
                type="date"
                value={debtDueDate}
                onChange={(e) => setDebtDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE5DC]">
            <button
              type="button"
              onClick={() => setIsAddingDebt(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[#787E86] hover:text-[#1A1D20]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Debt
            </button>
          </div>
        </form>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#EAE5DC] w-fit">
        <button
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "TRANSACTIONS"
              ? "bg-[#191D23] text-white shadow-xs"
              : "text-[#787E86] hover:text-[#1A1D20]"
          }`}
        >
          Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("DEBTS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "DEBTS"
              ? "bg-[#191D23] text-white shadow-xs"
              : "text-[#787E86] hover:text-[#1A1D20]"
          }`}
        >
          Debts & Dues ({debts.length})
        </button>
      </div>

      {/* Tab 1: Transactions List */}
      {activeTab === "TRANSACTIONS" && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#EAE5DC] text-center text-xs text-[#787E86]">
              No transactions recorded yet. Tap &apos;Add Transaction&apos; above!
            </div>
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <div
                  key={tx._id}
                  className="p-3.5 md:p-4 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] flex items-center justify-between gap-3 shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-[#E6EDE3] text-[#2F4D2E]"
                          : "bg-[#FBEBE8] text-[#C4382B]"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1D20]">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-[#787E86]">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm md:text-base font-bold font-mono ${
                        isIncome ? "text-[#2D5A2C]" : "text-[#1A1D20]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {currency}
                      {tx.amount.toLocaleString("en-IN")}
                    </span>

                    <button
                      onClick={() => handleDeleteItem(tx._id, "transaction")}
                      className="p-1 rounded text-[#A0A6AF] hover:text-[#C4382B] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Debts List */}
      {activeTab === "DEBTS" && (
        <div className="space-y-3">
          {debts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#EAE5DC] text-center text-xs text-[#787E86]">
              No debts or pending loans tracked. Tap &apos;Track Debt&apos; above!
            </div>
          ) : (
            debts.map((debt) => {
              const isOwedByMe = debt.type === "OWED_BY_ME";
              const remaining = debt.totalAmount - debt.paidAmount;
              const isSettled = debt.status === "SETTLED" || remaining <= 0;

              return (
                <div
                  key={debt._id}
                  className={`p-4 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] shadow-xs transition-all space-y-3 ${
                    isSettled ? "opacity-60 bg-[#FAF8F5]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1A1D20]">
                          {debt.personName}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isOwedByMe
                              ? "bg-[#FDF3E7] text-[#B4671F]"
                              : "bg-[#E6EDE3] text-[#2F4D2E]"
                          }`}
                        >
                          {isOwedByMe ? "Payable by me" : "Receivable by me"}
                        </span>
                        {isSettled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6EDE3] text-[#2F4D2E] font-bold">
                            Settled
                          </span>
                        )}
                      </div>
                      {debt.dueDate && (
                        <p className="text-[11px] text-[#787E86] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(debt.dueDate).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm md:text-base font-bold font-mono text-[#1A1D20]">
                        {currency}
                        {remaining.toLocaleString("en-IN")}{" "}
                        <span className="text-xs text-[#787E86] font-normal">
                          / {currency}{debt.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DC]">
                    <span className="text-[11px] text-[#787E86]">
                      Paid so far: {currency}{debt.paidAmount.toLocaleString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isSettled && (
                        <button
                          onClick={() => setRepaymentModalDebt(debt)}
                          className="px-3 py-1 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(debt._id, "debt")}
                        className="p-1.5 rounded text-[#A0A6AF] hover:text-[#C4382B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Repayment Modal */}
      {repaymentModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRecordRepayment}
            className="bg-white p-5 rounded-3xl max-w-sm w-full border border-[#EAE5DC] shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-[#1A1D20]">
              Record Payment for {repaymentModalDebt.personName}
            </h3>
            <input
              type="number"
              placeholder={`Amount in ${currency}`}
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] font-mono focus:outline-none focus:border-[#191D23]"
              autoFocus
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRepaymentModalDebt(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#787E86]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
