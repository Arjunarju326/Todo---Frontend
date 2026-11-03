"use client";

import React, { useState } from "react";
import {
  X,
  CheckSquare,
  DollarSign,
  Users,
  StickyNote,
  Sparkles,
} from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency?: string;
}

type QuickType = "TASK" | "TRANSACTION" | "DEBT" | "NOTE";

export default function QuickAddModal({
  isOpen,
  onClose,
  onSuccess,
  currency = "₹",
}: QuickAddModalProps) {
  const [quickType, setQuickType] = useState<QuickType>("TASK");
  const [loading, setLoading] = useState(false);

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("WORK");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Transaction form
  const [txTitle, setTxTitle] = useState("");
  const [txType, setTxType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("FOOD");

  // Debt form
  const [debtPerson, setDebtPerson] = useState("");
  const [debtType, setDebtType] = useState<"OWED_BY_ME" | "OWED_TO_ME">("OWED_BY_ME");
  const [debtAmount, setDebtAmount] = useState("");

  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("IDEA");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (quickType === "TASK") {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitle,
            category: taskCategory,
            priority: taskPriority,
            dueDate: taskDueDate || undefined,
          }),
        });
        setTaskTitle("");
      } else if (quickType === "TRANSACTION") {
        await fetch("/api/finance", {
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
        setTxTitle("");
        setTxAmount("");
      } else if (quickType === "DEBT") {
        await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemType: "debt",
            personName: debtPerson,
            type: debtType,
            totalAmount: Number(debtAmount),
          }),
        });
        setDebtPerson("");
        setDebtAmount("");
      } else if (quickType === "NOTE") {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            category: noteCategory,
          }),
        });
        setNoteTitle("");
        setNoteContent("");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl max-w-lg w-full border border-[#EAE5DC] shadow-2xl relative text-[#1A1D20]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[#7B818A] hover:text-[#1A1D20] hover:bg-[#F3EFE7] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#191D23] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1D20]">Quick Capture</h2>
            <p className="text-xs text-[#787E86]">Add an item to your workspace in seconds</p>
          </div>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] mb-4">
          {[
            { id: "TASK", label: "Task", icon: CheckSquare },
            { id: "TRANSACTION", label: "Money", icon: DollarSign },
            { id: "DEBT", label: "Debt", icon: Users },
            { id: "NOTE", label: "Note", icon: StickyNote },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = quickType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQuickType(tab.id as QuickType)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#191D23] text-white shadow-xs"
                    : "text-[#656C75] hover:text-[#1A1D20]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {quickType === "TASK" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="What must be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
                autoFocus
                required
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#787E86] font-medium block mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                  >
                    <option value="WORK">Work</option>
                    <option value="FINANCE">Finance</option>
                    <option value="LEARNING">Learning</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#787E86] font-medium block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#787E86] font-medium block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {quickType === "TRANSACTION" && (
            <div className="space-y-3">
              <div className="flex rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] p-0.5">
                <button
                  type="button"
                  onClick={() => setTxType("EXPENSE")}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    txType === "EXPENSE" ? "bg-[#191D23] text-white shadow-xs" : "text-[#656C75]"
                  }`}
                >
                  Expense (Paid)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("INCOME")}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    txType === "INCOME" ? "bg-[#3D6938] text-white shadow-xs" : "text-[#656C75]"
                  }`}
                >
                  Income (Received)
                </button>
              </div>

              <input
                type="text"
                placeholder="Description (e.g. Coffee, Freelance milestone)"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
                autoFocus
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={`Amount in ${currency}`}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] font-mono focus:outline-none"
                  required
                />
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                >
                  <option value="FOOD">Food & Groceries</option>
                  <option value="EMI">EMI & Loans</option>
                  <option value="RENT">Rent</option>
                  <option value="BILLS">Bills & Utilities</option>
                  <option value="SALARY">Salary</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          )}

          {quickType === "DEBT" && (
            <div className="space-y-3">
              <select
                value={debtType}
                onChange={(e) => setDebtType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="OWED_BY_ME">I Borrowed Money (Payable to someone)</option>
                <option value="OWED_TO_ME">I Lent Money (Someone owes me)</option>
              </select>

              <input
                type="text"
                placeholder="Counterparty / Person name"
                value={debtPerson}
                onChange={(e) => setDebtPerson(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
                autoFocus
                required
              />

              <input
                type="number"
                placeholder={`Total amount (${currency})`}
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] font-mono focus:outline-none"
                required
              />
            </div>
          )}

          {quickType === "NOTE" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Note or idea title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
                autoFocus
                required
              />
              <textarea
                placeholder="What's on your mind?..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none resize-none"
              />
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="IDEA">Idea</option>
                <option value="PURCHASE_LIST">To Buy Later</option>
                <option value="TODO_LATER">Someday / Maybe</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE5DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#787E86] hover:text-[#1A1D20] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#191D23] hover:bg-[#2E3642] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
