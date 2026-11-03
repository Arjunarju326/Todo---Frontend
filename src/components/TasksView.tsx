"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Check,
  Trash2,
  X,
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: "WORK" | "PERSONAL" | "FINANCE" | "LEARNING";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  completedAt?: string;
  isImportant?: boolean;
  tags?: string[];
}

const FALLBACK_TASKS: Task[] = [
  {
    _id: "fb-1",
    title: "Complete e-commerce UI fixes",
    category: "WORK",
    priority: "HIGH",
    status: "TODO",
    dueDate: new Date().toISOString(),
  },
  {
    _id: "fb-2",
    title: "Push staging build & test",
    category: "WORK",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: new Date().toISOString(),
  },
  {
    _id: "fb-3",
    title: "AI course — Lesson 4",
    category: "LEARNING",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: new Date().toISOString(),
  },
  {
    _id: "fb-4",
    title: "Gym — Lower body workout",
    category: "PERSONAL",
    priority: "LOW",
    status: "DONE",
    dueDate: new Date().toISOString(),
  },
  {
    _id: "fb-5",
    title: "Review weekly budget",
    category: "PERSONAL",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: new Date().toISOString(),
  },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function priorityClass(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-[#fdeceb] text-[#d64545]";
    case "MEDIUM":
      return "bg-[#fff1e8] text-[#d9822b]";
    default:
      return "bg-[#e6f0e7] text-[#2e7d32]";
  }
}

function categoryLabel(cat: string) {
  return cat.charAt(0) + cat.slice(1).toLowerCase();
}

export default function TasksView({
  onRefreshDashboard,
}: {
  onRefreshDashboard?: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"TODAY" | "UPCOMING" | "OVERDUE">(
    "TODAY"
  );
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("WORK");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks?.length ? data.tasks : FALLBACK_TASKS);
      } else {
        setTasks(FALLBACK_TASKS);
      }
    } catch {
      setTasks(FALLBACK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const calendarDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - 3 + i);
      return startOfDay(d);
    });
  }, []);

  const { startToday, endToday } = useMemo(() => {
    const now = new Date();
    return { startToday: startOfDay(now), endToday: endOfDay(now) };
  }, []);

  const counts = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let overdue = 0;
    for (const t of tasks) {
      if (t.status === "DONE") continue;
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (!due) {
        today += 1;
        continue;
      }
      if (due >= startToday && due <= endToday) today += 1;
      else if (due > endToday) upcoming += 1;
      else overdue += 1;
    }
    return { today, upcoming, overdue };
  }, [tasks, startToday, endToday]);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    const due = t.dueDate ? new Date(t.dueDate) : null;
    if (tabFilter === "TODAY") {
      return (
        t.status !== "DONE" &&
        (!due || (due >= startToday && due <= endToday))
      );
    }
    if (tabFilter === "OVERDUE") {
      return t.status !== "DONE" && !!due && due < startToday;
    }
    return t.status !== "DONE" && !!due && due > endToday;
  });

  const grouped = useMemo(() => {
    const order = ["WORK", "LEARNING", "PERSONAL", "FINANCE"] as const;
    return order
      .map((cat) => ({
        cat,
        items: filteredTasks.filter((t) => t.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
        setNewDueDate("");
        setIsAdding(false);
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id
            ? {
                ...t,
                status: newStatus,
                completedAt:
                  newStatus === "DONE" ? new Date().toISOString() : undefined,
              }
            : t
        )
      );
      if (!task._id.startsWith("fb-")) {
        await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: task._id, status: newStatus }),
        });
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    if (!id.startsWith("fb-")) {
      try {
        await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
        onRefreshDashboard?.();
      } catch (err) {
        console.error(err);
        fetchTasks();
      }
    }
  };

  const formatTime = (task: Task) => {
    if (!task.dueDate) return "Today";
    return new Date(task.dueDate).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight">
          Tasks
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search tasks"
            className="w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring shadow-sm"
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label="Filter"
            className="w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          autoFocus
          className="w-full h-10 px-4 rounded-2xl bg-white border border-[var(--card-border)] text-sm outline-none focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
        />
      )}

      {/* Calendar strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {calendarDays.map((day) => {
          const active = day.getTime() === selectedDay.getTime();
          const isToday = day.getTime() === startToday.getTime();
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                setTabFilter("TODAY");
              }}
              className={`min-w-[52px] px-2.5 py-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer df-focus-ring ${
                active
                  ? "bg-[var(--sidebar)] text-white shadow-md"
                  : "bg-white border border-[var(--card-border)] text-[var(--sidebar-end)]"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase ${
                  active ? "text-[#c5d9c5]" : "text-[var(--foreground-muted)]"
                }`}
              >
                {day.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span className="text-[16px] font-bold leading-none tabular-nums">
                {day.getDate()}
              </span>
              {isToday && !active && (
                <span className="w-1 h-1 rounded-full bg-[var(--sidebar)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "TODAY" as const, label: "Today", count: counts.today },
            {
              id: "UPCOMING" as const,
              label: "Upcoming",
              count: counts.upcoming,
            },
            { id: "OVERDUE" as const, label: "Overdue", count: counts.overdue },
          ] as const
        ).map((chip) => {
          const active = tabFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setTabFilter(chip.id)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer df-focus-ring ${
                active
                  ? "bg-[var(--sidebar)] text-white shadow-sm"
                  : "bg-white border border-[var(--card-border)] text-[var(--foreground-muted)]"
              }`}
            >
              {chip.label} ({chip.count})
            </button>
          );
        })}
      </div>

      {/* Add form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="df-card p-4 rounded-[20px] space-y-3"
        >
          <input
            type="text"
            placeholder="What needs to get done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none focus:border-[var(--sidebar)]"
            autoFocus
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Task["category"])}
              className="px-2.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-xs"
            >
              <option value="WORK">Work</option>
              <option value="LEARNING">Learning</option>
              <option value="PERSONAL">Personal</option>
              <option value="FINANCE">Finance</option>
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
              className="px-2.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-xs"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="px-2 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-xs text-[var(--foreground-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--sidebar)] text-white text-xs font-semibold"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Grouped task lists */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--foreground-muted)]">
          Loading tasks...
        </div>
      ) : grouped.length === 0 ? (
        <div className="df-card p-8 rounded-[20px] text-center">
          <p className="text-sm font-semibold text-[var(--sidebar-end)]">
            No tasks here
          </p>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Add a task or switch filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <section key={group.cat} className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-[13px] font-bold text-[var(--sidebar-end)]">
                  {categoryLabel(group.cat)}{" "}
                  <span className="text-[var(--foreground-muted)] font-semibold">
                    ({group.items.length})
                  </span>
                </h2>
              </div>
              <ul className="space-y-2">
                {group.items.map((task) => {
                  const done = task.status === "DONE";
                  return (
                    <li
                      key={task._id}
                      className="df-card rounded-[16px] p-3 flex items-center gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(task)}
                        aria-label={done ? "Mark incomplete" : "Mark complete"}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all cursor-pointer df-focus-ring ${
                          done
                            ? "bg-[var(--sidebar)] text-white"
                            : "border border-[#b7c4b8] bg-white"
                        }`}
                      >
                        {done && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] font-semibold truncate ${
                            done
                              ? "text-[var(--foreground-subtle)] line-through"
                              : "text-[var(--sidebar-end)]"
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                          {categoryLabel(task.category)} ·{" "}
                          {task.priority.charAt(0) +
                            task.priority.slice(1).toLowerCase()}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority.charAt(0) +
                          task.priority.slice(1).toLowerCase()}
                      </span>
                      <span className="text-[11px] text-[var(--foreground-subtle)] font-medium shrink-0 hidden sm:inline">
                        {formatTime(task)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        aria-label="Delete"
                        className="p-1 text-[var(--foreground-subtle)] hover:text-[var(--alert)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="w-full h-12 rounded-2xl bg-[var(--sidebar)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(31,77,54,0.25)] hover:bg-[var(--sidebar-soft)] transition-colors cursor-pointer df-focus-ring"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        Add Task
      </button>
    </div>
  );
}
