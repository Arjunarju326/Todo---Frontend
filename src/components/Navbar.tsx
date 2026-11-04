"use client";

import React, { useEffect, useId, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  GraduationCap,
  Leaf,
  StickyNote,
  Settings,
  Plus,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Flame,
  TrendingUp,
  LogOut,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "schedule"
  | "tasks"
  | "finance"
  | "growth"
  | "habits"
  | "inbox"
  | "reports"
  | "settings";

export type NavSection =
  | "transactions"
  | "budgets"
  | "bills"
  | "debts"
  | "savings"
  | "learning"
  | "career"
  | "projects"
  | null;

interface NavbarProps {
  activeTab: NavTab;
  activeSection?: NavSection;
  setActiveTab: (tab: NavTab, section?: NavSection) => void;
  onOpenQuickAdd: () => void;
  onLogout?: () => void;
  dbConnected: boolean;
  overdueCount: number;
  userName?: string;
}

type NavItem = {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  matchActive?: boolean;
};

function MountainSilhouette() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-mist.jpg"
        alt=""
        className="absolute inset-x-0 bottom-0 h-full w-full object-cover object-bottom opacity-40 mix-blend-luminosity filter contrast-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e241c]/90 via-[#16372a]/70 to-[#16372a]" />
    </div>
  );
}

export default function Navbar({
  activeTab,
  activeSection = null,
  setActiveTab,
  onOpenQuickAdd,
  onLogout,
  overdueCount,
  userName = "Arjun",
}: NavbarProps) {
  const [moneyOpen, setMoneyOpen] = useState(true);
  const [growthOpen, setGrowthOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const moneyId = useId();
  const growthId = useId();

  useEffect(() => {
    if (activeTab === "finance") setMoneyOpen(true);
    if (activeTab === "growth" || activeSection === "projects") setGrowthOpen(true);
  }, [activeTab, activeSection]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "84px" : "260px"
    );
  }, [collapsed]);

  useEffect(() => {
    const nav = document.querySelector(
      'aside[aria-label="Primary"] nav'
    ) as HTMLElement | null;
    const active = nav?.querySelector(
      '[aria-current="page"]'
    ) as HTMLElement | null;
    if (!nav || !active) return;

    active.scrollIntoView({ block: "nearest", inline: "nearest" });

    // Avoid a half-clipped neighbor under the footer looking like a second active item
    const next = active.nextElementSibling as HTMLElement | null;
    if (!next) {
      nav.scrollTop = nav.scrollHeight;
      return;
    }
    const navBottom = nav.getBoundingClientRect().bottom;
    const nextBottom = next.getBoundingClientRect().bottom;
    if (next.getBoundingClientRect().top < navBottom && nextBottom > navBottom) {
      nav.scrollTop += nextBottom - navBottom + 6;
    }
  }, [activeTab, activeSection]);

  const moneyItems: { label: string; tab: NavTab; section: NavSection }[] = [
    { label: "Transactions", tab: "finance", section: "transactions" },
    { label: "Budgets", tab: "finance", section: "budgets" },
    { label: "Bills & EMIs", tab: "finance", section: "bills" },
    { label: "Debts", tab: "finance", section: "debts" },
    { label: "Savings Goals", tab: "finance", section: "savings" },
  ];

  const growthItems: { label: string; tab: NavTab; section: NavSection }[] = [
    { label: "Learning", tab: "growth", section: "learning" },
    { label: "Career", tab: "growth", section: "career" },
    { label: "Projects", tab: "tasks", section: "projects" },
  ];

  const topItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { id: "schedule", label: "Calendar", icon: CalendarDays },
  ];

  const bottomItems: NavItem[] = [
    { id: "habits", label: "Habits", icon: Flame },
    { id: "inbox", label: "Notes & Inbox", icon: StickyNote },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const go = (tab: NavTab, section: NavSection = null) => {
    setActiveTab(tab, section);
  };

  const mobileItems: NavItem[] = [
    { id: "dashboard", label: "My Day", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "finance", label: "Money", icon: Wallet },
    { id: "growth", label: "Growth", icon: GraduationCap },
  ];

  const linkClass = (selected: boolean) =>
    `relative w-full flex items-center scroll-my-1 ${
      collapsed ? "justify-center px-2" : "gap-3 px-3"
    } py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer df-focus-ring ${
      selected
        ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] shadow-sm font-semibold"
        : "text-[#b7c6ba] hover:text-white hover:bg-white/[0.08]"
    }`;

  return (
    <>
      <aside
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 text-white overflow-hidden animate-df-slide-right transition-[width] duration-300 ease-out ${
          collapsed ? "w-[84px]" : "w-[260px]"
        }`}
        style={{
          background: "linear-gradient(180deg, #1F4D36 0%, #16372A 100%)",
        }}
        aria-label="Primary"
      >
        <div className="relative flex flex-col h-full min-h-0 px-3.5 pt-4 pb-3">
          <div
            className={`relative z-10 shrink-0 flex items-center mb-5 ${
              collapsed ? "justify-center" : "justify-between gap-2 px-1"
            }`}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "" : "min-w-0"}`}>
              <div className="w-10 h-10 rounded-2xl bg-[var(--sidebar-active)] text-[var(--sidebar-end)] flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                <Leaf className="w-5 h-5" aria-hidden />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h1 className="text-[15px] font-bold tracking-tight leading-tight">
                    Dayflow
                  </h1>
                  <p className="text-[11px] text-[#8aa090] font-medium truncate">
                    Personal Organizer
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/15 text-[#cfe0d4] flex items-center justify-center transition-colors cursor-pointer df-focus-ring shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="relative mb-3 mx-auto w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-[#cfe0d4] flex items-center justify-center transition-colors cursor-pointer df-focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <nav className="relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 pb-3 scroll-pb-3 scroll-pt-2">
            {topItems.map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => go(item.id)}
                  aria-current={selected ? "page" : undefined}
                  className={linkClass(selected)}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors duration-200 ${
                      selected
                        ? "text-[var(--sidebar-active-text)]"
                        : "text-[#8aa090]"
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center font-bold ${
                            selected
                              ? "bg-[var(--sidebar-end)] text-[var(--sidebar-active)]"
                              : "bg-white/10 text-[#d9e8d8]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}

            {/* Money */}
            <div className="pt-1">
              <button
                type="button"
                title={collapsed ? "Money" : undefined}
                aria-expanded={moneyOpen}
                aria-controls={moneyId}
                onClick={() => {
                  go("finance");
                  if (!collapsed) setMoneyOpen(true);
                }}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer df-focus-ring ${
                  activeTab === "finance"
                    ? "bg-white/10 text-white"
                    : "text-[#b7c6ba] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Wallet
                  className={`w-[18px] h-[18px] ${
                    activeTab === "finance"
                      ? "text-[var(--sidebar-active)]"
                      : "text-[#8aa090]"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">Money</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={moneyOpen ? "Collapse Money" : "Expand Money"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoneyOpen((v) => !v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setMoneyOpen((v) => !v);
                        }
                      }}
                      className="p-0.5 rounded-md hover:bg-white/10"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-[#8aa090] transition-transform duration-300 ${
                          moneyOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </>
                )}
              </button>
              {!collapsed && (
                <div
                  id={moneyId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    moneyOpen
                      ? "grid-rows-[1fr] opacity-100 mt-0.5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden space-y-0.5 pl-4">
                    {moneyItems.map((item) => {
                      const selected =
                        activeTab === item.tab && activeSection === item.section;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => go(item.tab, item.section)}
                          aria-current={selected ? "page" : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-all duration-200 cursor-pointer df-focus-ring ${
                            selected
                              ? "bg-[var(--sidebar-active)]/25 text-white font-semibold"
                              : "text-[#9db0a2] hover:text-white hover:bg-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              selected
                                ? "bg-[var(--sidebar-active)]"
                                : "bg-[#8aa090]"
                            }`}
                            aria-hidden
                          />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Growth */}
            <div>
              <button
                type="button"
                title={collapsed ? "Growth" : undefined}
                aria-expanded={growthOpen}
                aria-controls={growthId}
                onClick={() => {
                  go("growth");
                  if (!collapsed) setGrowthOpen(true);
                }}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer df-focus-ring ${
                  activeTab === "growth" || activeSection === "projects"
                    ? "bg-white/10 text-white"
                    : "text-[#b7c6ba] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <TrendingUp
                  className={`w-[18px] h-[18px] ${
                    activeTab === "growth" || activeSection === "projects"
                      ? "text-[var(--sidebar-active)]"
                      : "text-[#8aa090]"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">Growth</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={
                        growthOpen ? "Collapse Growth" : "Expand Growth"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setGrowthOpen((v) => !v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setGrowthOpen((v) => !v);
                        }
                      }}
                      className="p-0.5 rounded-md hover:bg-white/10"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-[#8aa090] transition-transform duration-300 ${
                          growthOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </>
                )}
              </button>
              {!collapsed && (
                <div
                  id={growthId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    growthOpen
                      ? "grid-rows-[1fr] opacity-100 mt-0.5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden space-y-0.5 pl-4">
                    {growthItems.map((item) => {
                      const selected =
                        (item.section === "projects"
                          ? activeTab === "tasks" && activeSection === "projects"
                          : activeTab === item.tab &&
                            activeSection === item.section);
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => go(item.tab, item.section)}
                          aria-current={selected ? "page" : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-all duration-200 cursor-pointer df-focus-ring ${
                            selected
                              ? "bg-[var(--sidebar-active)]/25 text-white font-semibold"
                              : "text-[#9db0a2] hover:text-white hover:bg-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              selected
                                ? "bg-[var(--sidebar-active)]"
                                : "bg-[#8aa090]"
                            }`}
                            aria-hidden
                          />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {bottomItems.map((item) => {
              const Icon = item.icon;
              const selected =
                item.matchActive === false ? false : activeTab === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => go(item.id)}
                  aria-current={selected ? "page" : undefined}
                  className={linkClass(selected)}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors duration-200 ${
                      selected
                        ? "text-[var(--sidebar-active-text)]"
                        : "text-[#8aa090]"
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="relative z-20 shrink-0 mt-auto -mx-3.5 px-3.5 pt-2 pb-0 border-t border-white/10 space-y-1 overflow-hidden bg-[#16372a]">
            <MountainSilhouette />
            {!collapsed && (
              <div className="relative z-10 px-3 py-2">
                <p className="text-[12px] font-semibold text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-[#8aa090]">Signed in</p>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title={collapsed ? "Log out" : undefined}
                className={`relative z-10 w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-xl text-[13px] font-medium text-[#b7c6ba] hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer df-focus-ring`}
              >
                <LogOut className="w-[18px] h-[18px] text-[#8aa090]" />
                {!collapsed && <span className="flex-1 text-left">Log out</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {activeTab === "dashboard" && (
        <header className="md:hidden flex items-center justify-between px-5 pt-3 pb-2 bg-[var(--background)] sticky top-0 z-30 df-mobile-topbar">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--sidebar)] text-[var(--sidebar-active)] flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <h2 className="font-display text-[20px] font-bold text-[var(--sidebar-end)] leading-none tracking-tight">
              Dayflow
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => go("settings")}
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-white border border-[var(--card-border)] flex items-center justify-center text-[var(--sidebar-end)] relative df-focus-ring shadow-sm df-mobile-glass"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="w-2 h-2 rounded-full bg-[var(--alert)] absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>
            <button
              type="button"
              onClick={() => go("settings")}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[var(--accent-mint)] cursor-pointer df-focus-ring"
              aria-label={`${userName} profile`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avatar.jpg"
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </button>
          </div>
        </header>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="px-3 pb-3 pt-8">
          <div className="relative flex items-end gap-2">
            <nav
              className="nav-island flex-1 rounded-[28px] px-1.5 py-2 flex items-end justify-between pointer-events-auto shadow-xl"
              aria-label="Mobile"
            >
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-2xl transition-all duration-200 df-focus-ring ${
                      isActive
                        ? "text-[var(--sidebar)]"
                        : "text-[var(--foreground-subtle)]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "stroke-[2.25]" : "stroke-[1.75]"}`}
                    />
                    <span
                      className={`text-[10px] leading-none truncate ${
                        isActive ? "font-bold" : "font-medium"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => go("settings")}
                aria-label="More"
                aria-current={
                  activeTab === "settings" ||
                  activeTab === "habits" ||
                  activeTab === "inbox" ||
                  activeTab === "reports"
                    ? "page"
                    : undefined
                }
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-2xl transition-all duration-200 df-focus-ring ${
                  activeTab === "settings" ||
                  activeTab === "habits" ||
                  activeTab === "inbox" ||
                  activeTab === "reports"
                    ? "text-[var(--sidebar)]"
                    : "text-[var(--foreground-subtle)]"
                }`}
              >
                <Settings
                  className={`w-5 h-5 ${
                    activeTab === "settings" ||
                    activeTab === "habits" ||
                    activeTab === "inbox" ||
                    activeTab === "reports"
                      ? "stroke-[2.25]"
                      : "stroke-[1.75]"
                  }`}
                />
                <span
                  className={`text-[10px] leading-none ${
                    activeTab === "settings" ||
                    activeTab === "habits" ||
                    activeTab === "inbox" ||
                    activeTab === "reports"
                      ? "font-bold"
                      : "font-medium"
                  }`}
                >
                  More
                </span>
              </button>
            </nav>

            <button
              type="button"
              onClick={onOpenQuickAdd}
              aria-label="Add item"
              className="pointer-events-auto mb-1 w-12 h-12 shrink-0 rounded-full bg-[var(--sidebar)] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(31,77,54,0.35)] hover:bg-[var(--sidebar-soft)] transition-all duration-200 active:scale-95 cursor-pointer df-focus-ring"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
