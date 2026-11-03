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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F5F0] text-[#1A1D20] selection:bg-[#191D23] selection:text-white font-sans antialiased">
      {/* Navigation (Sidebar on Desktop, Header & Floating Island on Mobile) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        dbConnected={dashboardData?.dbStatus?.connected ?? true}
        overdueCount={dashboardData?.stats?.overdueCount || 0}
        userName={dashboardData?.settings?.userName || "Shihab"}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-3 sm:p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto min-h-screen">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center shadow-xs">
              <span className="w-4 h-4 rounded-full bg-[#191D23] animate-ping" />
            </div>
            <p className="text-xs text-[#787E86] font-medium">
              Synchronizing Daily Flow workspace...
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={fetchDashboardData}
        currency={dashboardData?.settings?.currency || "₹"}
      />
    </div>
  );
}
