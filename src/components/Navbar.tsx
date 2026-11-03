"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  GraduationCap,
  Sparkles,
  StickyNote,
  Settings,
  Plus,
  Database,
  Bell,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "schedule"
  | "tasks"
  | "finance"
  | "growth"
  | "habits"
  | "inbox"
  | "settings";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  dbConnected: boolean;
  overdueCount: number;
  userName?: string;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  dbConnected,
  overdueCount,
  userName = "Shihab",
}: NavbarProps) {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Home", icon: LayoutDashboard },
    { id: "schedule" as NavTab, label: "Schedule", icon: CalendarDays },
    {
      id: "tasks" as NavTab,
      label: "Tasks & Projects",
      icon: CheckSquare,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { id: "finance" as NavTab, label: "Finances", icon: Wallet },
    { id: "habits" as NavTab, label: "Habits & Routine", icon: Sparkles },
    { id: "growth" as NavTab, label: "Growth", icon: GraduationCap },
    { id: "inbox" as NavTab, label: "Notes", icon: StickyNote },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left side on md+) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#EAE5DC] bg-[#FAF8F5]/90 backdrop-blur-xl p-5 justify-between h-screen fixed left-0 top-0 z-40">
        <div className="flex flex-col gap-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#191D23] text-white flex items-center justify-center shadow-md shadow-black/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#1A1D20] tracking-tight">
                  Daily Flow
                </h1>
                <p className="text-[11px] text-[#787E85]">Plan today. Build tomorrow.</p>
              </div>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#191D23] hover:bg-[#2E353F] text-white font-medium text-sm shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Action</span>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#191D23] text-white shadow-sm font-semibold"
                      : "text-[#626871] hover:text-[#1A1D20] hover:bg-[#ECE8DF]/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#7B818A]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#E6EDE3] text-[#2F4D2E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & MongoDB Status Card */}
        <div className="pt-4 border-t border-[#EAE5DC] flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected ? "bg-[#3D6938] animate-pulse" : "bg-[#C46849]"
                }`}
              />
              <span className="text-[11px] font-medium text-[#787E85]">
                {dbConnected ? "Atlas Synced" : "Connecting..."}
              </span>
            </div>
            <span className="text-[10px] text-[#A2A7AE] font-mono">v1.2</span>
          </div>

          <div
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#EFECE5] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE5DC] bg-[#E8EFE6] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avatar.jpg"
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-[#1A1D20] truncate">
                {userName}
              </p>
              <p className="text-[10px] text-[#787E85] truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DC] sticky top-0 z-30">
        <div>
          <span className="text-xs font-handwriting text-[#5A6068] text-base leading-none">
            Small steps Big results ✈️
          </span>
          <h2 className="text-sm font-bold text-[#1A1D20] leading-tight">Daily Flow</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("settings")}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#EAE5DC] flex items-center justify-center text-[#4B525B] relative shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#D97706] absolute top-1 right-1" />
          </button>
          <div
            onClick={() => setActiveTab("settings")}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE5DC] bg-[#E8EFE6] flex items-center justify-center cursor-pointer shadow-xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avatar.jpg"
              alt="User Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </header>

      {/* Floating Mobile Bottom Navigation Bar (Matching Screen 2 pill bar + FAB) */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-40 px-4 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Island Navigation Pill */}
          <nav className="nav-island rounded-full px-4 py-2 flex items-center gap-4 shadow-xl">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`p-2 rounded-full transition-all relative ${
                    isActive
                      ? "text-[#191D23] font-bold"
                      : "text-[#8E949D] hover:text-[#1A1D20]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#191D23] absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setActiveTab("settings")}
              aria-label="Settings"
              className={`p-2 rounded-full transition-all relative ${
                activeTab === "settings"
                  ? "text-[#191D23] font-bold"
                  : "text-[#8E949D] hover:text-[#1A1D20]"
              }`}
            >
              <Settings className="w-5 h-5" />
              {activeTab === "settings" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#191D23] absolute -bottom-1 left-1/2 -translate-x-1/2" />
              )}
            </button>
          </nav>

          {/* Floating Action Button (FAB) from the screenshot */}
          <button
            onClick={onOpenQuickAdd}
            aria-label="Add item"
            className="w-12 h-12 rounded-full bg-[#191D23] text-white flex items-center justify-center shadow-xl hover:bg-[#2C3440] transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </>
  );
}
