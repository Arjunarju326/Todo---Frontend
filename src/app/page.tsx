"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar, { NavTab, NavSection } from "@/components/Navbar";
import DashboardView from "@/components/DashboardView";
import ScheduleView from "@/components/ScheduleView";
import TasksView from "@/components/TasksView";
import FinanceView from "@/components/FinanceView";
import GrowthView from "@/components/GrowthView";
import HabitsView from "@/components/HabitsView";
import InboxView from "@/components/InboxView";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";
import QuickAddModal from "@/components/QuickAddModal";
import MobileAtmosphereBackground from "@/components/MobileAtmosphereBackground";
import { useAuth } from "@/lib/auth";
import { useMobileAtmosphere } from "@/lib/mobileAtmosphere";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { enabled: atmosphereOn } = useMobileAtmosphere();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [activeSection, setActiveSection] = useState<NavSection>(null);

  const navigate = (tab: NavTab, section: NavSection = null) => {
    setActiveTab(tab);
    setActiveSection(section ?? null);
  };
  const emptyDashboard = {
    success: true,
    stats: {},
    settings: { userName: "Arjun", currency: "₹" },
    dailyQuestions: {},
    habits: [],
    notes: [],
    learningGoals: [],
    dbStatus: { connected: false },
  };

  const [dashboardData, setDashboardData] = useState<any>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const fetchDashboardData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch("/api/dashboard", {
        signal: controller.signal,
        credentials: "include",
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const isDashboard = activeTab === "dashboard";
  const displayName =
    dashboardData?.settings?.userName || user?.displayName || user?.username || "Arjun";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 text-[var(--sidebar)] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row text-[var(--foreground)] selection:bg-[var(--sidebar)] selection:text-white font-sans antialiased relative ${
        atmosphereOn
          ? "bg-transparent md:bg-[var(--background)]"
          : "bg-[var(--background)]"
      }`}
    >
      <MobileAtmosphereBackground />
      <Navbar
        activeTab={activeTab}
        activeSection={activeSection}
        setActiveTab={navigate}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        onLogout={handleLogout}
        dbConnected={dashboardData?.dbStatus?.connected ?? true}
        overdueCount={dashboardData?.stats?.overdueCount || 0}
        userName={displayName}
      />

      <main
        className={`relative z-10 flex-1 md:ml-[var(--sidebar-width)] w-full min-h-screen overflow-y-auto transition-[margin,padding] duration-300 pb-28 md:pb-4 ${
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
                onNavigate={(tab) => navigate(tab)}
                onTaskToggle={handleTaskToggle}
                onRefresh={fetchDashboardData}
                onOpenQuickAdd={() => setQuickAddOpen(true)}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleView
                onBack={() => navigate("dashboard")}
                onOpenQuickAdd={() => setQuickAddOpen(true)}
              />
            )}

            {activeTab === "tasks" && (
              <TasksView onRefreshDashboard={fetchDashboardData} />
            )}

            {activeTab === "finance" && (
              <FinanceView
                currency={dashboardData?.settings?.currency || "₹"}
                section={activeSection}
                onRefreshDashboard={fetchDashboardData}
              />
            )}

            {activeTab === "growth" && (
              <GrowthView section={activeSection} />
            )}

            {activeTab === "habits" && (
              <HabitsView onRefreshDashboard={fetchDashboardData} />
            )}

            {activeTab === "inbox" && <InboxView />}

            {activeTab === "reports" && (
              <ReportsView
                data={dashboardData}
                currency={dashboardData?.settings?.currency || "₹"}
                onNavigate={(tab) => navigate(tab as NavTab)}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                onRefreshDashboard={fetchDashboardData}
                onLogout={handleLogout}
                onNavigate={(tab) => navigate(tab)}
              />
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
