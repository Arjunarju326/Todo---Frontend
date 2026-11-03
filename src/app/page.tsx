"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar, { NavTab } from "@/components/Navbar";
import DashboardView from "@/components/DashboardView";
import ScheduleView from "@/components/ScheduleView";
import TasksView from "@/components/TasksView";
import FinanceView from "@/components/FinanceView";
import GrowthView from "@/components/GrowthView";
import HabitsView from "@/components/HabitsView";
import InboxView from "@/components/InboxView";
import SettingsView from "@/components/SettingsView";
import QuickAddModal from "@/components/QuickAddModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const fallbackDashboard = {
    success: true,
    stats: {},
    settings: { userName: "Arjun", currency: "₹" },
    dailyQuestions: {},
    dbStatus: { connected: false },
  };

  const [dashboardData, setDashboardData] = useState<any>(fallbackDashboard);
  const [loading, setLoading] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch("/api/dashboard", { signal: controller.signal });
      const data = await res.json();
      if (data.success) {
        if (data.stats.totalTasks === 0 && data.stats.totalIncome === 0) {
          await fetch("/api/seed", { method: "POST" });
          const refreshedRes = await fetch("/api/dashboard");
          const refreshedData = await refreshedRes.json();
          if (refreshedData.success) {
            setDashboardData(refreshedData);
            return;
          }
        }
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const isDashboard = activeTab === "dashboard";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--sidebar)] selection:text-white font-sans antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        dbConnected={dashboardData?.dbStatus?.connected ?? true}
        overdueCount={dashboardData?.stats?.overdueCount || 0}
        userName={dashboardData?.settings?.userName || "Arjun"}
      />

      <main
        className={`flex-1 md:ml-[var(--sidebar-width)] w-full min-h-screen overflow-y-auto transition-[margin,padding] duration-300 pb-28 md:pb-4 ${
          isDashboard
            ? "px-4 pt-1 sm:p-4 lg:p-4 xl:p-5"
            : "px-4 pt-1 sm:p-5 md:p-8 lg:p-10 max-w-7xl mx-auto"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-df-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#e4ebe4] flex items-center justify-center shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[var(--sidebar)] animate-ping" />
            </div>
            <p className="text-xs text-[#6b756f] font-medium">
              Synchronizing Dayflow workspace...
            </p>
          </div>
        ) : (
          <div key={activeTab} className="animate-df-fade-up">
            {activeTab === "dashboard" && (
              <DashboardView
                data={dashboardData}
                onNavigate={(tab) => setActiveTab(tab)}
                onTaskToggle={handleTaskToggle}
                onRefresh={fetchDashboardData}
                onOpenQuickAdd={() => setQuickAddOpen(true)}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleView
                onBack={() => setActiveTab("dashboard")}
                onOpenQuickAdd={() => setQuickAddOpen(true)}
              />
            )}

            {activeTab === "tasks" && (
              <TasksView onRefreshDashboard={fetchDashboardData} />
            )}

            {activeTab === "finance" && (
              <FinanceView
                currency={dashboardData?.settings?.currency || "₹"}
                onRefreshDashboard={fetchDashboardData}
              />
            )}

            {activeTab === "growth" && <GrowthView />}

            {activeTab === "habits" && (
              <HabitsView onRefreshDashboard={fetchDashboardData} />
            )}

            {activeTab === "inbox" && <InboxView />}

            {activeTab === "settings" && (
              <SettingsView onRefreshDashboard={fetchDashboardData} />
            )}
          </div>
        )}
      </main>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={fetchDashboardData}
        currency={dashboardData?.settings?.currency || "₹"}
      />
    </div>
  );
}
