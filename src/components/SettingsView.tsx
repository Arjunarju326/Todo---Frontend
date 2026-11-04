"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  User,
  RefreshCw,
  LogOut,
  ImageIcon,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import { useMobileAtmosphere } from "@/lib/mobileAtmosphere";

export default function SettingsView({
  onRefreshDashboard,
  onLogout,
}: {
  onRefreshDashboard?: () => void;
  onLogout?: () => void;
}) {
  const [settings, setSettings] = useState({
    userName: "Arjun",
    monthlyIncome: 0,
    monthlyEmiCommitment: 0,
    savingsTarget: 0,
    currency: "₹",
    timezone: "Asia/Kolkata",
  });
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const {
    enabled: atmosphereOn,
    setEnabled: setAtmosphereOn,
    imageCount,
  } = useMobileAtmosphere();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setDbStatus(data.dbStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Settings updated successfully!");
        onRefreshDashboard?.();
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const logoutBtn = onLogout ? (
    <button
      type="button"
      onClick={onLogout}
      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-[#EAE5DC] text-[#C4382B] text-xs font-semibold hover:bg-[#FBEBE8] transition-colors cursor-pointer df-focus-ring"
    >
      <LogOut className="w-3.5 h-3.5" />
      Log out
    </button>
  ) : null;

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-4xl mx-auto px-1 md:px-4 df-stagger">
      <MobileHeroBanner
        title="Settings"
        subtitle="Profile, money baselines, and workspace"
        actions={logoutBtn}
      />

      {/* Desktop header */}
      <div className="hidden md:flex pt-2 items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#191D23]" />
            <span>Profile & Workspace Settings</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Manage your personal profile, baseline financial numbers, and database connection
          </p>
        </div>
        {logoutBtn}
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-[#E6EDE3] border border-[#CCDBC9] text-[#2F4D2E] text-xs font-semibold animate-in fade-in">
          {message}
        </div>
      )}

      {/* Mobile scenic atmosphere */}
      <div className="df-card df-card-lift p-5 rounded-3xl space-y-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-mint)] text-[var(--sidebar)] flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--sidebar-end)]">
                Scenic backgrounds
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
                Full-screen nature wallpapers with glass cards. Rotates every 2
                minutes across {imageCount} scenes.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={atmosphereOn}
            aria-label="Toggle scenic backgrounds"
            onClick={() => setAtmosphereOn(!atmosphereOn)}
            className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-200 df-focus-ring cursor-pointer ${
              atmosphereOn ? "bg-[var(--sidebar)]" : "bg-[#d5dbd5]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                atmosphereOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] font-semibold text-[var(--sidebar)]">
          {atmosphereOn ? "On — backgrounds & glass cards active" : "Off — solid cream UI"}
        </p>
      </div>

      {/* PostgreSQL Live Connection Card */}
      <div className="df-card df-card-lift p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6EDE3] text-[#2F4D2E] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
                <span>PostgreSQL Database</span>
                <span className="w-2 h-2 rounded-full bg-[#3D6938] animate-pulse" />
              </h3>
              <p className="text-xs text-[#787E86]">
                {dbStatus?.name ? `Database: ${dbStatus.name} (${dbStatus.host || "127.0.0.1"})` : "PostgreSQL (tododb)"}
              </p>
            </div>
          </div>

          <button
            onClick={fetchSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2EB] border border-[#EAE5DC] text-xs text-[#1A1D20] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Test Ping</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EAE5DC] text-xs">
          <div>
            <span className="text-[#8E949D] text-[10px] uppercase font-semibold">Status</span>
            <p className="text-[#2F4D2E] font-bold mt-0.5">Connected (Active)</p>
          </div>
          <div>
            <span className="text-[#8E949D] text-[10px] uppercase font-semibold">Database</span>
            <p className="text-[#1A1D20] font-mono mt-0.5">{dbStatus?.name || "task_finance_organizer"}</p>
          </div>
          <div>
            <span className="text-[#8E949D] text-[10px] uppercase font-semibold">Latency</span>
            <p className="text-[#1A1D20] font-mono mt-0.5">{dbStatus?.latencyMs ? `${dbStatus.latencyMs} ms` : "Fast"}</p>
          </div>
          <div>
            <span className="text-[#8E949D] text-[10px] uppercase font-semibold">Environment</span>
            <p className="text-[#1A1D20] font-mono mt-0.5">Atlas M0 Cloud</p>
          </div>
        </div>
      </div>

      {/* Financial & User Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="df-card df-card-lift p-6 rounded-3xl space-y-6"
      >
        <h3 className="text-base font-bold text-[#1A1D20] flex items-center gap-2">
          <User className="w-4 h-4 text-[#191D23]" />
          <span>Personal Preferences & Baseline Finance</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#787E86] block mb-1.5 font-medium">
              Your Name (Displayed on Dashboard greeting)
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] focus:outline-none focus:border-[#191D23]"
            />
          </div>

          <div>
            <label className="text-xs text-[#787E86] block mb-1.5 font-medium">
              Currency Symbol
            </label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] focus:outline-none focus:border-[#191D23] font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[#787E86] block mb-1.5 font-medium">
              Expected Monthly Income ({settings.currency})
            </label>
            <input
              type="number"
              value={settings.monthlyIncome}
              onChange={(e) =>
                setSettings({ ...settings, monthlyIncome: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] focus:outline-none focus:border-[#191D23] font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[#787E86] block mb-1.5 font-medium">
              Monthly Fixed EMI / Commitments ({settings.currency})
            </label>
            <input
              type="number"
              value={settings.monthlyEmiCommitment}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  monthlyEmiCommitment: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] focus:outline-none focus:border-[#191D23] font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[#EAE5DC]">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Preferences"}
          </button>
        </div>
      </form>

      {onLogout && (
        <div className="df-card rounded-[20px] p-4 flex items-center justify-between gap-3 md:hidden">
          <div>
            <p className="text-[13px] font-bold text-[var(--sidebar-end)]">
              Account
            </p>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              Sign out of Dayflow on this device
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--alert-soft)] text-[var(--alert)] text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
