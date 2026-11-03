"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
  Check,
  RotateCcw,
  Star,
  Clock,
  Filter,
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

export default function TasksView({
  onRefreshDashboard,
}: {
  onRefreshDashboard?: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"ALL" | "TODAY" | "OVERDUE" | "UPCOMING" | "DONE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Inline add state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("WORK");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImportant, setNewImportant] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate || undefined,
          isImportant: newImportant,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
        setNewDescription("");
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
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id
            ? { ...t, status: newStatus, completedAt: newStatus === "DONE" ? new Date().toISOString() : undefined }
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
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      onRefreshDashboard?.();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  // Filter tasks
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;

    const due = t.dueDate ? new Date(t.dueDate) : null;

    if (tabFilter === "TODAY") {
      return t.status !== "DONE" && due && due >= startOfToday && due <= endOfToday;
    }
    if (tabFilter === "OVERDUE") {
      return t.status !== "DONE" && due && due < startOfToday;
    }
    if (tabFilter === "UPCOMING") {
      return t.status !== "DONE" && due && due > endOfToday;
    }
    if (tabFilter === "DONE") {
      return t.status === "DONE";
    }

    return true;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "WORK":
        return "bg-[#E6EDE3] text-[#2F4D2E] border border-[#CCDBC9]";
      case "FINANCE":
        return "bg-[#E8F1EA] text-[#1E4D2B] border border-[#C5DDC9]";
      case "LEARNING":
        return "bg-[#F3ECE2] text-[#6E4E2C] border border-[#E5DACD]";
      default:
        return "bg-[#ECE9F2] text-[#4F3C6D] border border-[#DACFEE]";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-[#C4382B] bg-[#FBEBE8] border border-[#F4CCC6]";
      case "MEDIUM":
        return "text-[#B4671F] bg-[#FDF3E7] border border-[#F5DCBC]";
      default:
        return "text-[#666C74] bg-[#F0EDE6] border border-[#E2DDD3]";
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-1 md:px-4">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#191D23]" />
            <span>Tasks & Projects</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Organize daily work, project milestones, and commitments
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#191D23] hover:bg-[#2C3440] text-white font-medium text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isAdding ? "Close Form" : "Create New Task"}</span>
        </button>
      </div>

      {/* Inline Create Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1D20]">Add New Priority</h3>
            <span className="text-[11px] text-[#787E86]">Press enter or save</span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="What needs to get done? (e.g. Design system planning, Review mocks)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
              autoFocus
              required
            />

            <textarea
              placeholder="Optional notes or instructions..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23] resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-[#787E86] font-medium block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                >
                  <option value="WORK">Work</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="FINANCE">Finance</option>
                  <option value="LEARNING">Learning</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#787E86] font-medium block mb-1">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#787E86] font-medium block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tabs Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Horizontal Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#EAE5DC] overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Tasks" },
            { id: "TODAY", label: "Today" },
            { id: "OVERDUE", label: "Overdue" },
            { id: "UPCOMING", label: "Upcoming" },
            { id: "DONE", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                tabFilter === tab.id
                  ? "bg-[#191D23] text-white shadow-xs"
                  : "text-[#787E86] hover:text-[#1A1D20]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8E949D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
          />
        </div>
      </div>

      {/* Category & Priority Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#787E86] text-[11px] font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>
        {["ALL", "WORK", "FINANCE", "LEARNING", "PERSONAL"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              categoryFilter === cat
                ? "bg-[#191D23] text-white shadow-xs"
                : "bg-white text-[#787E86] hover:text-[#1A1D20] border border-[#EAE5DC]"
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="h-3 w-px bg-[#EAE5DC] mx-1 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-[#787E86] text-[11px] font-semibold">
          <span>Priority:</span>
        </div>
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((pri) => (
          <button
            key={pri}
            onClick={() => setPriorityFilter(pri)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              priorityFilter === pri
                ? "bg-[#191D23] text-white shadow-xs"
                : "bg-white text-[#787E86] hover:text-[#1A1D20] border border-[#EAE5DC]"
            }`}
          >
            {pri}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#8E949D]">
          Synchronizing tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-[#EAE5DC] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2EB] border border-[#EAE5DC] mx-auto flex items-center justify-center text-[#787E86]">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#1A1D20]">No tasks found</h3>
          <p className="text-xs text-[#787E86] max-w-sm mx-auto">
            {search
              ? "No tasks matched your search query."
              : "You have no tasks in this view. Enjoy the moment or add a new priority!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isDone = task.status === "DONE";
            const isOverdue =
              !isDone && task.dueDate && new Date(task.dueDate) < startOfToday;
            const isToday =
              !isDone &&
              task.dueDate &&
              new Date(task.dueDate) >= startOfToday &&
              new Date(task.dueDate) <= endOfToday;

            return (
              <div
                key={task._id}
                className={`p-3.5 md:p-4 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] flex items-start justify-between gap-3 shadow-xs transition-all ${
                  isDone ? "opacity-60 bg-[#FAF8F5]" : ""
                } ${isOverdue ? "border-[#EAA89F]" : ""}`}
              >
                {/* Left: Round Checkbox + details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isDone
                        ? "bg-[#191D23] text-white border border-[#191D23]"
                        : "border-2 border-[#CCD1D9] bg-transparent hover:border-[#191D23]"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isDone
                            ? "line-through text-[#8E949D]"
                            : "text-[#1A1D20]"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryBadgeClass(
                          task.category
                        )}`}
                      >
                        {task.category}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#787E86] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#787E86] flex-wrap">
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? "text-[#C4382B] font-semibold"
                              : isToday
                              ? "text-[#191D23] font-semibold"
                              : "text-[#787E86]"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>
                            {isOverdue ? "Overdue: " : isToday ? "Due Today: " : "Due: "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </span>
                      )}

                      {isDone && task.completedAt && (
                        <span className="text-[#3D6938] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>
                            Completed {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  aria-label="Delete task"
                  className="p-1.5 rounded-lg text-[#9EA3A9] hover:text-[#C4382B] hover:bg-[#FBEBE8] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
