"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Flame,
  Plus,
  Check,
  Calendar,
  Trash2,
  Trophy,
} from "lucide-react";

interface Habit {
  _id: string;
  name: string;
  category: "HEALTH" | "STUDY" | "WORK" | "MIND" | "ROUTINE";
  streak: number;
  completedDates: string[];
  targetDaysPerWeek: number;
}

export default function HabitsView({
  onRefreshDashboard,
}: {
  onRefreshDashboard?: () => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState<Habit["category"]>("HEALTH");
  const [targetDays, setTargetDays] = useState("6");

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-IN", { weekday: "narrow" });
    const isToday = i === 6;
    return { dateStr: isoDate, dayLabel, isToday, dayNum: d.getDate() };
  });

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (data.success) {
        setHabits(data.habits || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHabitName,
          category: newHabitCategory,
          targetDaysPerWeek: Number(targetDays),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => [...prev, data.habit]);
        setNewHabitName("");
        setIsAdding(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHabitDate = async (habitId: string, dateStr: string) => {
    try {
      setHabits((prev) =>
        prev.map((h) => {
          if (h._id !== habitId) return h;
          const isDone = h.completedDates?.includes(dateStr);
          const newDates = isDone
            ? h.completedDates.filter((d) => d !== dateStr)
            : [...(h.completedDates || []), dateStr];
          return {
            ...h,
            completedDates: newDates,
            streak: isDone ? Math.max(0, h.streak - 1) : h.streak + 1,
          };
        })
      );

      await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, dateStr }),
      });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm("Delete this habit?")) return;
    try {
      setHabits((prev) => prev.filter((h) => h._id !== id));
      await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-1 md:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#191D23]" />
            <span>Habits & Routine</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Consistent daily progress, deep focus routines, and self-discipline
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#191D23] hover:bg-[#2C3440] text-white font-medium text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Daily Habit</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#D97706]" />
            <span>Build a New Routine</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Habit Name</label>
              <input
                type="text"
                placeholder="e.g. 30m Workout, Read 10 pages"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none focus:border-[#191D23]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Category</label>
              <select
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="HEALTH">Health & Fitness</option>
                <option value="STUDY">Study & Code</option>
                <option value="ROUTINE">Daily Routine</option>
                <option value="MIND">Mindfulness</option>
                <option value="WORK">Work Discipline</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#787E86] block mb-1">Target Days / Week</label>
              <select
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="7">Every day (7 days)</option>
                <option value="6">6 days / week</option>
                <option value="5">5 days / week (Weekdays)</option>
                <option value="4">4 days / week</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE5DC]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[#787E86]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Start Tracking
            </button>
          </div>
        </form>
      )}

      {/* Habit Cards List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#787E86]">
          Loading habits...
        </div>
      ) : habits.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-[#EAE5DC] text-center text-xs text-[#787E86]">
          No habits tracked yet. Start building your consistency today!
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="p-4 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6EDE3] text-[#2F4D2E] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D20]">{habit.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#656C75] font-medium">
                      {habit.category}
                    </span>
                    <span className="text-[11px] text-[#787E86]">
                      {habit.streak} day streak
                    </span>
                  </div>
                </div>
              </div>

              {/* 7-Day Completion Tracker Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {last7Days.map((d) => {
                  const isDone = habit.completedDates?.includes(d.dateStr);
                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => handleToggleHabitDate(habit._id, d.dateStr)}
                      className={`w-8 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] transition-all cursor-pointer ${
                        isDone
                          ? "bg-[#191D23] text-white shadow-xs"
                          : d.isToday
                          ? "bg-white border-2 border-[#191D23] text-[#1A1D20]"
                          : "bg-[#F5F2EB] text-[#787E86] hover:bg-[#EAE5DC]"
                      }`}
                    >
                      <span className="text-[9px] font-medium opacity-80">{d.dayLabel}</span>
                      <span className="font-bold">{d.dayNum}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleDeleteHabit(habit._id)}
                  aria-label="Delete habit"
                  className="p-2 ml-1 text-[#A0A6AF] hover:text-[#C4382B] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
