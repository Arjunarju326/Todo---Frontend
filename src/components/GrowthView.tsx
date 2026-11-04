"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Calendar,
  Check,
  Flame,
  BookOpen,
  Plus,
  Briefcase,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import type { NavSection } from "./Navbar";

interface LearningGoal {
  _id: string;
  title: string;
  category: string;
  platformOrCourse: string;
  progressPercentage: number;
  status: string;
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

interface JobApplication {
  _id: string;
  company: string;
  role: string;
  status: string;
  location: string;
  appliedDate?: string;
  salaryEstimate?: string;
  notes?: string;
}

const GROWTH_TABS: { id: NavSection; label: string }[] = [
  { id: "learning", label: "Learning" },
  { id: "career", label: "Career" },
];

export default function GrowthView({
  section = null,
}: {
  section?: NavSection;
}) {
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [capture, setCapture] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [focusSection, setFocusSection] = useState<NavSection>(
    section === "career" ? "career" : "learning"
  );
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [jobCompany, setJobCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobStatus, setJobStatus] = useState("APPLIED");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const todayIso = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const load = async () => {
    try {
      setLoading(true);
      const [growthRes, habitsRes, notesRes] = await Promise.all([
        fetch("/api/growth"),
        fetch("/api/habits"),
        fetch("/api/notes"),
      ]);
      const growth = await growthRes.json();
      const habitsData = await habitsRes.json();
      const notesData = await notesRes.json();
      if (growth.success) {
        setLearningGoals(growth.learningGoals || []);
        setJobs(growth.jobApplications || []);
      }
      if (habitsData.success) setHabits(habitsData.habits || []);
      if (notesData.success) setNotes(notesData.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (section === "career" || section === "learning") {
      setFocusSection(section);
      setIsAddingJob(section === "career");
    } else if (!section) {
      setFocusSection("learning");
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
  }, [focusSection, loading, learningGoals.length, jobs.length]);

  const weeklyHours = useMemo(() => {
    const done = learningGoals.reduce(
      (sum, g) => sum + Number(g.loggedHours || 0),
      0
    );
    const total = learningGoals.reduce(
      (sum, g) => sum + Number(g.weeklyTargetHours || 0),
      0
    );
    return { done, total };
  }, [learningGoals]);

  const weeklyPct =
    weeklyHours.total > 0
      ? Math.min(100, Math.round((weeklyHours.done / weeklyHours.total) * 100))
      : 0;

  const learningCards = learningGoals.slice(0, 6).map((g) => ({
    _id: g._id,
    title: g.title,
    progress: g.progressPercentage || 0,
    subtitle: g.platformOrCourse || g.category || "Learning",
    hours: `${Number(g.loggedHours || 0)} / ${Number(g.weeklyTargetHours || 0)} hrs`,
  }));

  const habitRows = habits.map((h) => ({
    _id: h._id,
    name: h.name,
    streak: h.streak || 0,
    done: (h.completedDates || []).includes(todayIso),
  }));

  const toggleHabit = async (id: string) => {
    try {
      setHabits((prev) =>
        prev.map((h) => {
          if (h._id !== id) return h;
          const has = (h.completedDates || []).includes(todayIso);
          return {
            ...h,
            completedDates: has
              ? (h.completedDates || []).filter((d) => d !== todayIso)
              : [...(h.completedDates || []), todayIso],
            streak: has ? Math.max(0, (h.streak || 0) - 1) : (h.streak || 0) + 1,
          };
        })
      );
      await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, date: todayIso }),
      });
    } catch (err) {
      console.error(err);
      load();
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capture.trim() || savingNote) return;
    try {
      setSavingNote(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: capture.trim(),
          content: "",
          category: "GENERAL",
        }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setCapture("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCompany.trim() || !jobRole.trim()) return;
    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "job",
          company: jobCompany.trim(),
          role: jobRole.trim(),
          status: jobStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setJobs((prev) => [data.item, ...prev]);
        setJobCompany("");
        setJobRole("");
        setIsAddingJob(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusLabel = (status: string) =>
    status
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const sectionClass = (id: string, opts?: { padded?: boolean }) =>
    `scroll-mt-6 transition-[box-shadow,padding] duration-500 ${
      focusSection === id
        ? `ring-2 ring-[var(--sidebar)]/30 rounded-[20px]${
            opts?.padded ? " p-3" : ""
          }`
        : ""
    }`;

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--foreground-muted)]">
        Loading growth data...
      </div>
    );
  }

  const growthActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Search"
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] shadow-sm df-focus-ring"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="Calendar"
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] shadow-sm df-focus-ring"
      >
        <Calendar className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto df-stagger">
      <MobileHeroBanner
        title="Growth & Habits"
        subtitle="Learning tracks, streaks, and inbox notes"
        actions={growthActions}
      />

      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[24px] font-bold text-[var(--sidebar-end)] tracking-tight leading-tight">
          Growth &amp; Habits
        </h1>
        {growthActions}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {GROWTH_TABS.map((tab) => {
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

      <section
        ref={(el) => {
          sectionRefs.current.learning = el;
        }}
        className={`df-card df-card-lift rounded-[20px] p-4 ${sectionClass("learning")}`}
      >
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
          {weeklyHours.total === 0
            ? "Add a learning track to set a weekly goal."
            : `${Math.max(0, weeklyHours.total - weeklyHours.done)} hrs left this week.`}
        </p>
      </section>

      <section
        className={`space-y-2.5 ${sectionClass("learning", { padded: true })}`}
      >
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)] px-0.5">
          My Learning &amp; Growth
        </h2>
        {learningCards.length === 0 ? (
          <div className="df-card rounded-[18px] p-4">
            <p className="text-[12px] text-[var(--foreground-muted)]">
              No learning goals yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 df-stagger-fast">
            {learningCards.map((card) => (
              <article
                key={card._id}
                className="df-card df-card-lift rounded-[18px] p-3.5 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
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
                    {card.subtitle} · {card.hours}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        ref={(el) => {
          sectionRefs.current.career = el;
        }}
        className={`df-card df-card-lift rounded-[20px] p-4 space-y-3 ${sectionClass("career")}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Career &amp; Applications
          </h2>
          <button
            type="button"
            onClick={() => {
              setFocusSection("career");
              setIsAddingJob((v) => !v);
            }}
            className="h-8 px-2.5 rounded-full bg-[var(--sidebar)] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer df-focus-ring"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {isAddingJob && (
          <form onSubmit={handleAddJob} className="space-y-2.5">
            <input
              value={jobCompany}
              onChange={(e) => setJobCompany(e.target.value)}
              placeholder="Company"
              className="w-full h-10 px-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[13px] outline-none"
              required
            />
            <input
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Role"
              className="w-full h-10 px-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[13px] outline-none"
              required
            />
            <select
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[13px]"
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[var(--sidebar)] text-white text-[12px] font-semibold"
            >
              Save application
            </button>
          </form>
        )}

        {jobs.length === 0 ? (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            No job applications yet. Track roles you apply for here.
          </p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li
                key={job._id}
                className="flex items-start gap-3 rounded-[14px] bg-[var(--background)] border border-[var(--card-border)] p-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--sidebar-end)] truncate">
                    {job.role}
                  </p>
                  <p className="text-[11px] text-[var(--foreground-muted)] font-medium truncate">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-mint)] text-[var(--sidebar)] shrink-0">
                  {statusLabel(job.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="df-card df-card-lift rounded-[20px] p-4 space-y-2.5">
        <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
          Daily Habits
        </h2>
        {habitRows.length === 0 ? (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            No habits yet.
          </p>
        ) : (
          habitRows.map((habit) => (
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
          ))
        )}
      </section>

      <section className="df-card df-card-lift rounded-[20px] p-4 space-y-3">
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
            disabled={savingNote}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[var(--sidebar)] text-white flex items-center justify-center df-focus-ring disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
        {notes.length === 0 ? (
          <p className="text-[12px] text-[var(--foreground-muted)]">
            No notes yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.slice(0, 6).map((note) => (
              <li
                key={note._id}
                className="flex items-start gap-3 text-[12px] font-medium text-[var(--sidebar-end)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--sidebar)] mt-1.5 shrink-0" />
                <span className="min-w-0">
                  {note.title || note.content || "Untitled note"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
