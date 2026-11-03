"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  Plus,
  BookOpen,
  Clock,
  TrendingUp,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  Trash2,
  ExternalLink,
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

interface JobApplication {
  _id: string;
  company: string;
  role: string;
  status: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED";
  location: string;
  appliedDate: string;
  salaryEstimate?: string;
  notes?: string;
}

export default function GrowthView() {
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"LEARNING" | "JOBS">("LEARNING");

  // Forms
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingJob, setIsAddingJob] = useState(false);

  // New Goal Form
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("NEXTJS");
  const [goalPlatform, setGoalPlatform] = useState("");
  const [goalHours, setGoalHours] = useState("5");

  // New Job Form
  const [jobCompany, setJobCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobStatus, setJobStatus] = useState<JobApplication["status"]>("APPLIED");
  const [jobLocation, setJobLocation] = useState("Remote / Hybrid");
  const [jobSalary, setJobSalary] = useState("");
  const [jobNotes, setJobNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/growth");
      const data = await res.json();
      if (data.success) {
        setLearningGoals(data.learningGoals || []);
        setJobApplications(data.jobApplications || []);
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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "learning",
          title: goalTitle,
          category: goalCategory,
          platformOrCourse: goalPlatform,
          weeklyTargetHours: Number(goalHours),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLearningGoals((prev) => [...prev, data.goal]);
        setGoalTitle("");
        setGoalPlatform("");
        setIsAddingGoal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      setLearningGoals((prev) =>
        prev.map((g) =>
          g._id === goalId ? { ...g, progressPercentage: newProgress } : g
        )
      );

      await fetch("/api/growth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "learning",
          id: goalId,
          progressPercentage: newProgress,
          status: newProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
        }),
      });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteItem = async (id: string, itemType: "learning" | "job") => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (itemType === "learning") {
        setLearningGoals((prev) => prev.filter((g) => g._id !== id));
      } else {
        setJobApplications((prev) => prev.filter((j) => j._id !== id));
      }
      await fetch(`/api/growth?id=${id}&itemType=${itemType}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-1 md:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#191D23]" />
            <span>Learning & Career Growth</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Skill tracks, curriculum milestones, and job hunt progress
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "LEARNING") {
              setIsAddingGoal(!isAddingGoal);
            } else {
              setIsAddingJob(!isAddingJob);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#191D23] hover:bg-[#2C3440] text-white font-medium text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTab === "LEARNING" ? "Add Learning Track" : "Add Job Target"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#EAE5DC] w-fit">
        <button
          onClick={() => setActiveTab("LEARNING")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "LEARNING"
              ? "bg-[#191D23] text-white shadow-xs"
              : "text-[#787E86] hover:text-[#1A1D20]"
          }`}
        >
          Skill Goals ({learningGoals.length})
        </button>
        <button
          onClick={() => setActiveTab("JOBS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "JOBS"
              ? "bg-[#191D23] text-white shadow-xs"
              : "text-[#787E86] hover:text-[#1A1D20]"
          }`}
        >
          Career & Jobs ({jobApplications.length})
        </button>
      </div>

      {/* Add Learning Goal Form */}
      {isAddingGoal && activeTab === "LEARNING" && (
        <form
          onSubmit={handleCreateGoal}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-[#1A1D20]">Add New Learning Track</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="e.g. Next.js 16 Server Components & Turbopack"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none focus:border-[#191D23]"
              required
            />
            <input
              type="text"
              placeholder="Platform / Source (e.g. Documentation, Course)"
              value={goalPlatform}
              onChange={(e) => setGoalPlatform(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Target hours / week"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-[#787E86]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Track
            </button>
          </div>
        </form>
      )}

      {/* Learning Goals Grid */}
      {activeTab === "LEARNING" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {learningGoals.map((goal) => (
            <div
              key={goal._id}
              className="p-5 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#1A1D20]">
                    {goal.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6EDE3] text-[#2F4D2E] font-medium">
                    {goal.platformOrCourse || "Self-study"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1A1D20] mb-1.5">
                    <span>Mastery Progress</span>
                    <span>{goal.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#EFECE5] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#191D23] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC]">
                <div className="flex items-center gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleUpdateProgress(goal._id, pct)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        goal.progressPercentage >= pct
                          ? "bg-[#191D23] text-white border-[#191D23]"
                          : "border-[#EAE5DC] text-[#787E86] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleDeleteItem(goal._id, "learning")}
                  className="p-1 text-[#A0A6AF] hover:text-[#C4382B]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "JOBS" && (
        <div className="space-y-3">
          {jobApplications.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#EAE5DC] text-center text-xs text-[#787E86]">
              No job applications tracked yet.
            </div>
          ) : (
            jobApplications.map((job) => (
              <div
                key={job._id}
                className="p-4 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#D9D3C7] shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D20]">
                    {job.role} @ {job.company}
                  </h4>
                  <p className="text-[11px] text-[#787E86] mt-0.5">
                    {job.location} • Applied {new Date(job.appliedDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6EDE3] text-[#2F4D2E] font-semibold">
                    {job.status}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(job._id, "job")}
                    className="p-1 text-[#A0A6AF] hover:text-[#C4382B]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
