"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Check,
  Trash2,
  X,
  CalendarRange,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import PyramidDateStrip from "./PyramidDateStrip";
import TaskStreak from "./dashboard/TaskStreak";

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

type ViewMode = "day" | "list" | "calendar";
type TabFilter = "TODAY" | "UPCOMING" | "OVERDUE";

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

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
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

function formatDueLabel(task: Task) {
  if (!task.dueDate) return "No date";
  const d = new Date(task.dueDate);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [tabFilter, setTabFilter] = useState<TabFilter>("TODAY");
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [monthCursor, setMonthCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
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
        setTasks(data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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

  const matchesSearch = (t: Task) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase());

  const toDateInputValue = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const openAddForm = () => {
    setNewDueDate(toDateInputValue(selectedDay));
    setIsAdding(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!matchesSearch(t)) return false;
      if (t.status === "DONE") return false;

      const due = t.dueDate ? new Date(t.dueDate) : null;

      if (viewMode === "day") {
        if (tabFilter === "UPCOMING") {
          return !!due && due > endToday;
        }
        if (tabFilter === "OVERDUE") {
          return !!due && due < startToday;
        }
        // Day strip: tasks for the selected day (undated count as today only)
        const dayStart = startOfDay(selectedDay);
        const dayEnd = endOfDay(selectedDay);
        if (!due) return sameDay(selectedDay, startToday);
        return due >= dayStart && due <= dayEnd;
      }

      if (viewMode === "list") {
        if (tabFilter === "TODAY") {
          return !due || (due >= startToday && due <= endToday);
        }
        if (tabFilter === "OVERDUE") {
          return !!due && due < startToday;
        }
        return !!due && due > endToday;
      }

      // Calendar: tasks on selected day
      if (!due) return sameDay(selectedDay, startToday);
      return sameDay(due, selectedDay);
    });
  }, [
    tasks,
    search,
    viewMode,
    tabFilter,
    selectedDay,
    startToday,
    endToday,
  ]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (!matchesSearch(t) || t.status !== "DONE") return false;
        const doneAt = t.completedAt
          ? new Date(t.completedAt)
          : t.dueDate
            ? new Date(t.dueDate)
            : null;
        if (viewMode === "day" || viewMode === "calendar") {
          if (!doneAt) return sameDay(selectedDay, startToday);
          return sameDay(doneAt, selectedDay);
        }
        return true;
      })
      .sort((a, b) => {
        const ad = a.completedAt
          ? new Date(a.completedAt).getTime()
          : 0;
        const bd = b.completedAt
          ? new Date(b.completedAt).getTime()
          : 0;
        return bd - ad;
      });
  }, [tasks, search, viewMode, selectedDay, startToday]);

  const markedDayKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const t of tasks) {
      if (t.status === "DONE" || !t.dueDate) continue;
      keys.add(startOfDay(new Date(t.dueDate)).toISOString());
    }
    return keys;
  }, [tasks]);

  const grouped = useMemo(() => {
    const order = ["WORK", "LEARNING", "PERSONAL", "FINANCE"] as const;
    return order
      .map((cat) => ({
        cat,
        items: filteredTasks.filter((t) => t.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredTasks]);

  const listSorted = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
  }, [filteredTasks]);

  const tasksByDayKey = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (t.status === "DONE" || !t.dueDate) continue;
      if (!matchesSearch(t)) continue;
      const key = startOfDay(new Date(t.dueDate)).toISOString();
      const list = map.get(key) || [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [tasks, search]);

  const monthCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({ date: null, key: `pad-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = startOfDay(new Date(year, month, d));
      cells.push({ date, key: date.toISOString() });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, key: `trail-${cells.length}` });
    }
    return cells;
  }, [monthCursor]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const due =
      newDueDate || toDateInputValue(selectedDay);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          priority: newPriority,
          dueDate: due,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
        setNewDueDate(toDateInputValue(selectedDay));
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
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task._id, status: newStatus }),
      });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const formatTime = (task: Task) => {
    if (!task.dueDate) return "Today";
    return new Date(task.dueDate).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const viewOptions: Array<{
    id: ViewMode;
    label: string;
    icon: typeof List;
  }> = [
    { id: "day", label: "Day", icon: CalendarRange },
    { id: "list", label: "List", icon: List },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  const renderTaskRow = (task: Task, opts?: { showDate?: boolean }) => {
    const done = task.status === "DONE";
    return (
      <li
        key={task._id}
        className="df-card df-card-lift rounded-[16px] p-3 flex items-center gap-3"
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
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            {opts?.showDate ? ` · ${formatDueLabel(task)}` : null}
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityClass(
            task.priority
          )}`}
        >
          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
        </span>
        <span className="text-[11px] text-[var(--foreground-subtle)] font-medium shrink-0 hidden sm:inline">
          {opts?.showDate ? formatDueLabel(task) : formatTime(task)}
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
  };

  const renderEmpty = () => (
    <div className="df-card p-8 rounded-[20px] text-center">
      <p className="text-sm font-semibold text-[var(--sidebar-end)]">
        No tasks here
      </p>
      <p className="text-xs text-[var(--foreground-muted)] mt-1">
        Add a task or switch filters.
      </p>
    </div>
  );

  const renderFilterChips = () => (
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
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <div
        role="tablist"
        aria-label="Task views"
        className="flex items-center p-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] shadow-sm"
      >
        {viewOptions.map((opt) => {
          const active = viewMode === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${opt.label} view`}
              title={opt.label}
              onClick={() => setViewMode(opt.id)}
              className={`h-8 w-8 sm:w-auto sm:px-2.5 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer df-focus-ring ${
                active
                  ? "bg-[var(--sidebar)] text-white shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--sidebar-end)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setSearchOpen((v) => !v)}
        aria-label="Search tasks"
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring shadow-sm"
      >
        {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>
      <button
        type="button"
        aria-label="Filter"
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-5xl mx-auto df-stagger">
      <MobileHeroBanner
        title="Tasks"
        subtitle="Plan your day and clear the backlog"
        actions={headerActions}
      />

      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight">
          Tasks
        </h1>
        {headerActions}
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

      {viewMode === "day" && (
        <>
          <PyramidDateStrip
            selectedDay={selectedDay}
            markedKeys={markedDayKeys}
            onSelect={(day) => {
              setSelectedDay(day);
              setMonthCursor(new Date(day.getFullYear(), day.getMonth(), 1));
              setTabFilter("TODAY");
            }}
          />
          <TaskStreak tasks={tasks} />
          {renderFilterChips()}
        </>
      )}

      {viewMode === "list" && renderFilterChips()}

      {viewMode === "calendar" && (
        <div className="df-card rounded-[20px] p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setMonthCursor(
                  (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
                )
              }
              className="w-8 h-8 rounded-full border border-[var(--card-border)] bg-white flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-[var(--sidebar-end)] tabular-nums">
              {monthCursor.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonthCursor(
                  (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
                )
              }
              className="w-8 h-8 rounded-full border border-[var(--card-border)] bg-white flex items-center justify-center text-[var(--sidebar-end)] df-focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-[10px] font-semibold uppercase text-[var(--foreground-muted)] py-1"
              >
                {d}
              </div>
            ))}
            {monthCells.map((cell) => {
              if (!cell.date) {
                return <div key={cell.key} className="min-h-[52px] sm:min-h-[64px]" />;
              }
              const active = sameDay(cell.date, selectedDay);
              const isToday = sameDay(cell.date, startToday);
              const dayTasks = tasksByDayKey.get(cell.date.toISOString()) || [];
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDay(cell.date!)}
                  className={`min-h-[52px] sm:min-h-[64px] rounded-xl p-1.5 flex flex-col items-start gap-1 transition-all cursor-pointer df-focus-ring text-left ${
                    active
                      ? "bg-[var(--sidebar)] text-white shadow-sm"
                      : isToday
                        ? "bg-[var(--accent-mint)] border border-[var(--accent-sage)] text-[var(--sidebar-end)]"
                        : "bg-[var(--background)] border border-transparent hover:border-[var(--card-border)] text-[var(--sidebar-end)]"
                  }`}
                >
                  <span
                    className={`text-[12px] font-bold tabular-nums leading-none ${
                      active ? "text-white" : ""
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-auto w-full">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t._id}
                          className={`h-1 w-1 rounded-full ${
                            active ? "bg-[#c5d9c5]" : "bg-[var(--sidebar)]"
                          }`}
                          title={t.title}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span
                          className={`text-[9px] font-semibold leading-none ${
                            active
                              ? "text-[#c5d9c5]"
                              : "text-[var(--foreground-muted)]"
                          }`}
                        >
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[var(--foreground-muted)] px-0.5">
            {selectedDay.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      )}

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
              onChange={(e) =>
                setNewCategory(e.target.value as Task["category"])
              }
              className="px-2.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-xs"
            >
              <option value="WORK">Work</option>
              <option value="LEARNING">Learning</option>
              <option value="PERSONAL">Personal</option>
              <option value="FINANCE">Finance</option>
            </select>
            <select
              value={newPriority}
              onChange={(e) =>
                setNewPriority(e.target.value as Task["priority"])
              }
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

      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--foreground-muted)]">
          Loading tasks...
        </div>
      ) : viewMode === "list" ? (
        listSorted.length === 0 ? (
          renderEmpty()
        ) : (
          <ul className="space-y-2 df-stagger-fast">
            {listSorted.map((t) => renderTaskRow(t, { showDate: true }))}
          </ul>
        )
      ) : grouped.length === 0 ? (
        renderEmpty()
      ) : (
        <div className="space-y-4 df-stagger-fast">
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
              <ul className="space-y-2 df-stagger-fast">
                {group.items.map((task) => renderTaskRow(task))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!loading && completedTasks.length > 0 && (
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[13px] font-bold text-[var(--sidebar-end)]">
              Completed{" "}
              <span className="text-[var(--foreground-muted)] font-semibold">
                ({completedTasks.length})
              </span>
            </h2>
          </div>
          <ul className="space-y-2 df-stagger-fast opacity-90">
            {completedTasks.map((task) =>
              renderTaskRow(task, { showDate: true })
            )}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={openAddForm}
        className="w-full h-12 rounded-2xl bg-[var(--sidebar)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(31,77,54,0.25)] hover:bg-[var(--sidebar-soft)] transition-colors cursor-pointer df-focus-ring"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        Add Task
      </button>
    </div>
  );
}
