"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Check,
  Flame,
  BookOpen,
  Plus,
} from "lucide-react";

interface LearningGoal {
  _id: string;
  title: string;
  category: string;
  platformOrCourse: string;
  progressPercentage: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  weeklyTargetHours: number;
  loggedHours: number;
  notes: string;
}

interface Habit {
  _id: string;
  name: string;
  category: string;
  streak: number;
  completedDates: string[];
  targetDaysPerWeek: number;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
}

const FALLBACK_LEARNING = [
  {
    _id: "l1",
    title: "Python Fundamentals",
    progress: 65,
    lessons: "13 / 20 lessons",
  },
  {
    _id: "l2",
    title: "Django REST APIs",
    progress: 40,
    lessons: "8 / 20 lessons",
  },
  {
    _id: "l3",
    title: "Next.js App Router",
    progress: 25,
    lessons: "5 / 20 lessons",
  },
];

const FALLBACK_HABITS = [
  { _id: "h1", name: "Study 1 focused hour", streak: 5, done: true },
  { _id: "h2", name: "Move / Workout", streak: 3, done: false },
  { _id: "h3", name: "Read 20 pages", streak: 7, done: true },
  { _id: "h4", name: "No social before noon", streak: 2, done: false },
];

const FALLBACK_NOTES = [
  { _id: "n1", title: "Ship Dayflow mobile polish tonight", done: false },
  { _id: "n2", title: "Idea: weekly money review ritual", done: true },
  { _id: "n3", title: "Buy protein + oats", done: false },
];

export default function GrowthView() {
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [localHabits, setLocalHabits] = useState(FALLBACK_HABITS);
  const [localNotes, setLocalNotes] = useState(FALLBACK_NOTES);
  const [capture, setCapture] = useState("");
  const [weeklyHours] = useState({ done: 4, total: 6 });

  useEffect(() => {
    const load = async () => {
      try {
        const [growthRes, habitsRes, notesRes] = await Promise.all([
          fetch("/api/growth"),
          fetch("/api/habits"),
          fetch("/api/notes"),
        ]);
        const growth = await growthRes.json();
        const habitsData = await habitsRes.json();
        const notesData = await notesRes.json();
        if (growth.success) setLearningGoals(growth.learningGoals || []);
        if (habitsData.success) setHabits(habitsData.habits || []);
        if (notesData.success) setNotes(notesData.notes || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const learningCards =
    learningGoals.length > 0
      ? learningGoals.slice(0, 3).map((g) => ({
          _id: g._id,
          title: g.title,
          progress: g.progressPercentage || 0,
          lessons: `${Math.round(((g.progressPercentage || 0) / 100) * 20)} / 20 lessons`,
        }))
      : FALLBACK_LEARNING;

  const todayIso = new Date().toISOString().split("T")[0];

  const habitRows =
    habits.length > 0
      ? habits.slice(0, 4).map((h) => ({
          _id: h._id,
          name: h.name,
          streak: h.streak || 0,
          done: h.completedDates?.includes(todayIso) || false,
        }))
      : localHabits;

  const noteRows =
    notes.length > 0
      ? notes.slice(0, 4).map((n) => ({
          _id: n._id,
          title: n.title || n.content,
          done: false,
        }))
      : localNotes;

  const weeklyPct = Math.round((weeklyHours.done / weeklyHours.total) * 100);

  const toggleHabit = async (id: string) => {
    if (habits.length === 0) {
      setLocalHabits((prev) =>
        prev.map((h) => (h._id === id ? { ...h, done: !h.done } : h))
      );
      return;
    }
    try {
      await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, date: todayIso }),
      });
      setHabits((prev) =>
        prev.map((h) => {
          if (h._id !== id) return h;
          const has = h.completedDates?.includes(todayIso);
          return {
            ...h,
            completedDates: has
              ? h.completedDates.filter((d) => d !== todayIso)
              : [...(h.completedDates || []), todayIso],
          };
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNote = (id: string) => {
    setLocalNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, done: !n.done } : n))
    );
  };

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capture.trim()) return;
    setLocalNotes((prev) => [
      { _id: `n-${Date.now()}`, title: capture.trim(), done: false },
      ...prev,
    ]);
    setCapture("");
  };

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[24px] font-bold text-[var(--sidebar-end)] tracking-tight leading-tight">
          Growth &amp; Habits
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] shadow-sm df-focus-ring"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Calendar"
            className="w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] shadow-sm df-focus-ring"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekly learning goal */}
      <section className="df-card rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Weekly Learning Goal
          </h2>
          <span className="text-[12px] font-bold text-[var(--sidebar)] tabular-nums">
            {weeklyHours.done} / {weeklyHours.total} hrs
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#eef2ee] overflow-hidden mb-2 df-progress-bar">
          <span
            className="block h-full rounded-full bg-[var(--sidebar)]"
            style={{ width: `${weeklyPct}%` }}
          />
        </div>
        <p className="text-[12px] text-[var(--foreground-muted)] font-medium">
          {weeklyHours.total - weeklyHours.done} hrs left this week — keep the streak.
        </p>
      </section>

      {/* Learning cards */}
      <section className="space-y-2.5">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
          My Learning &amp; Growth
        </h2>
        <div className="space-y-2.5">
          {learningCards.map((card) => (
            <article
              key={card._id}
              className="df-card rounded-[18px] p-3.5 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-[13px] font-bold text-[var(--sidebar-end)] truncate">
                    {card.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[var(--sidebar)] tabular-nums shrink-0">
                    {card.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#eef2ee] overflow-hidden mb-1.5 df-progress-bar">
                  <span
                    className="block h-full rounded-full bg-[var(--sidebar)]"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--foreground-muted)] font-medium">
                  {card.lessons}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Daily habits */}
      <section className="df-card rounded-[20px] p-4 space-y-2.5">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
          Daily Habits
        </h2>
        {habitRows.map((habit) => (
          <button
            key={habit._id}
            type="button"
            onClick={() => toggleHabit(habit._id)}
            className="w-full flex items-center gap-3 py-1.5 text-left cursor-pointer df-focus-ring rounded-xl"
          >
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                habit.done
                  ? "bg-[var(--sidebar)] text-white df-check-pop"
                  : "border border-[#b7c4b8] bg-white"
              }`}
            >
              {habit.done && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span
              className={`flex-1 min-w-0 text-[13px] font-semibold truncate ${
                habit.done
                  ? "text-[var(--foreground-subtle)] line-through"
                  : "text-[var(--sidebar-end)]"
              }`}
            >
              {habit.name}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#d9822b] shrink-0">
              <Flame className="w-3.5 h-3.5" />
              {habit.streak}d
            </span>
          </button>
        ))}
      </section>

      {/* Inbox & notes */}
      <section className="df-card rounded-[20px] p-4 space-y-3">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
          My Inbox &amp; Notes
        </h2>
        <form onSubmit={handleCapture} className="relative">
          <input
            value={capture}
            onChange={(e) => setCapture(e.target.value)}
            placeholder="Quick capture..."
            className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[13px] outline-none focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
          />
          <button
            type="submit"
            aria-label="Add note"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[var(--sidebar)] text-white flex items-center justify-center df-focus-ring"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
        <ul className="space-y-2">
          {noteRows.map((note) => (
            <li key={note._id}>
              <button
                type="button"
                onClick={() => toggleNote(note._id)}
                className="w-full flex items-center gap-3 text-left cursor-pointer df-focus-ring rounded-lg"
              >
                <span
                  className={`w-4.5 h-4.5 rounded-[5px] flex items-center justify-center shrink-0 ${
                    note.done
                      ? "bg-[var(--sidebar)] text-white"
                      : "border border-[#b7c4b8]"
                  }`}
                >
                  {note.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span
                  className={`text-[12px] font-medium ${
                    note.done
                      ? "text-[var(--foreground-subtle)] line-through"
                      : "text-[var(--sidebar-end)]"
                  }`}
                >
                  {note.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
