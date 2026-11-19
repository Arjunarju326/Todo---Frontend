"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  Lightbulb,
  CalendarDays,
  Crosshair,
} from "lucide-react";
import {
  SMRTI_AVATARS,
  SmrtiPose,
  smrtiPoseFromMood,
} from "@/lib/smrtiAvatars";

type Briefing = {
  greeting?: string;
  taskNudge?: string;
  methodTip?: string;
  newsBite?: string;
  responsibilityFocus?: string;
  avatarMood?: string;
  assistantName?: string;
  profile?: { user_name?: string };
};

const STORAGE_KEY = "dayflow.smrti.popup.date";

type SmrtiPopupProps = {
  enabled?: boolean;
  userName?: string;
  onNavigate?: (tab: string) => void;
};

export default function SmrtiPopup({
  enabled = true,
  userName,
  onNavigate,
}: SmrtiPopupProps) {
  const [open, setOpen] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [tell, setTell] = useState("");
  const [telling, setTelling] = useState(false);
  const [reply, setReply] = useState("");
  const [pose, setPose] = useState<SmrtiPose>("greeting");
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(STORAGE_KEY) === today) return;
    } catch {
      /* ignore */
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPose("thinking");
      try {
        const res = await fetch("/api/assistant/briefing", {
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.briefing) {
          setBriefing(data.briefing);
          setPose(smrtiPoseFromMood(data.briefing.avatarMood) || "greeting");
          setOpen(true);
        }
      } catch {
        /* silent */
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);

  useEffect(() => {
    if (!open || telling || reply) return;
    if (inputFocused) {
      setPose("listening");
      return;
    }
    if (briefing?.taskNudge) setPose("explaining");
    else setPose(smrtiPoseFromMood(briefing?.avatarMood) || "greeting");
  }, [inputFocused, open, telling, reply, briefing]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        new Date().toISOString().slice(0, 10)
      );
    } catch {
      /* ignore */
    }
  };

  const displayName =
    briefing?.profile?.user_name || userName || "there";

  const headline = useMemo(() => {
    const g = briefing?.greeting || "";
    if (g.toLowerCase().includes("hey") || g.includes("!")) return g;
    return `Hey ${displayName}!`;
  }, [briefing?.greeting, displayName]);

  const subtitle =
    briefing?.methodTip ||
    "Smrti here, ready to help you flow through your day with clarity.";

  const tellSmrti = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tell.trim() || telling) return;
    setTelling(true);
    setPose("thinking");
    setReply("");
    try {
      const res = await fetch("/api/assistant/capture", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: tell.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setReply(data.reply || `Saved “${data.task?.title || "task"}”.`);
        setTell("");
        setPose("success");
      } else {
        setReply(data.error || "Could not save that.");
        setPose("explaining");
      }
    } catch {
      setReply("Could not reach Smrti.");
      setPose("explaining");
    } finally {
      setTelling(false);
    }
  };

  if (!open || !briefing) return null;

  const avatarSrc = SMRTI_AVATARS[pose] || SMRTI_AVATARS.default;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-5 pointer-events-auto"
      role="dialog"
      aria-label="Smrti assistant"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#16372a]/40 backdrop-blur-[3px]"
        aria-label="Dismiss Smrti"
        onClick={dismiss}
      />

      <div
        className="relative w-full max-w-[560px] animate-df-smrti-in pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(22,55,42,0.28)] border border-[#e6ebe4]">
          <div className="flex flex-col sm:flex-row min-h-[280px]">
            {/* Avatar panel */}
            <div className="relative sm:w-[42%] min-h-[200px] sm:min-h-full bg-gradient-to-b from-[#e8f2e6] via-[#dcead8] to-[#cfe3cb] flex items-end justify-center overflow-hidden">
              <div
                className="absolute inset-x-[-10%] bottom-[-18%] h-[70%] rounded-[50%] bg-[#b7d4b0]/55 blur-[2px]"
                aria-hidden
              />
              <div
                className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[78%] aspect-square rounded-full bg-[#c5dbc0]/70"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={pose}
                src={avatarSrc}
                alt={`Smrti ${pose}`}
                className="relative z-[1] w-[78%] max-w-[220px] h-auto object-contain drop-shadow-[0_12px_24px_rgba(22,55,42,0.22)] animate-df-smrti-bob select-none pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Content panel */}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <Sparkles className="w-4 h-4 text-[var(--sidebar)] shrink-0" />
                  <h2 className="text-[15px] font-extrabold tracking-wide text-[var(--sidebar-end)]">
                    SMRTI
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e6f0e3] text-[var(--sidebar)]">
                    AI Assistant
                  </span>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full hover:bg-[#f3f6f2] text-[var(--foreground-muted)] flex items-center justify-center df-focus-ring cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-3 text-[22px] sm:text-[24px] font-extrabold text-[var(--sidebar-end)] leading-tight tracking-tight">
                {headline.includes("👋") ? headline : `${headline.replace(/!$/, "")} 👋`}
              </p>
              <p className="mt-1.5 text-[12px] sm:text-[13px] text-[var(--foreground-muted)] font-medium leading-relaxed">
                {subtitle}
              </p>

              {briefing.taskNudge ? (
                <div className="mt-3 rounded-2xl bg-[#eef6eb] border border-[#d7e8d2] px-3 py-2.5 flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-white text-[var(--sidebar)] flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[12px] text-[var(--sidebar-end)] font-medium leading-relaxed">
                    {briefing.taskNudge}
                  </p>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.("tasks");
                    dismiss();
                  }}
                  className="h-9 px-3 rounded-full bg-[#f4f7f3] border border-[#e0e8dc] text-[11px] font-semibold text-[var(--sidebar-end)] flex items-center gap-1.5 hover:bg-[#eaf2e7] df-focus-ring cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sidebar)]" />
                  Review Tasks
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.("schedule");
                    dismiss();
                  }}
                  className="h-9 px-3 rounded-full bg-[#f4f7f3] border border-[#e0e8dc] text-[11px] font-semibold text-[var(--sidebar-end)] flex items-center gap-1.5 hover:bg-[#eaf2e7] df-focus-ring cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--sidebar)]" />
                  Plan My Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.("tasks");
                    dismiss();
                  }}
                  className="h-9 px-3 rounded-full bg-[#f4f7f3] border border-[#e0e8dc] text-[11px] font-semibold text-[var(--sidebar-end)] flex items-center gap-1.5 hover:bg-[#eaf2e7] df-focus-ring cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[var(--sidebar)]" />
                  Focus Mode
                </button>
              </div>

              <form onSubmit={tellSmrti} className="mt-auto pt-4">
                <div className="flex items-center gap-2 rounded-full border border-[#d9e4d6] bg-[#f7faf6] pl-3 pr-1.5 py-1.5 focus-within:border-[var(--sidebar)] focus-within:ring-2 focus-within:ring-[var(--accent-sage)]/40">
                  <Sparkles className="w-4 h-4 text-[var(--sidebar)] shrink-0" />
                  <input
                    type="text"
                    value={tell}
                    onChange={(e) => setTell(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Tell me what to remember..."
                    className="flex-1 min-w-0 bg-transparent text-[12px] sm:text-[13px] outline-none text-[var(--sidebar-end)] placeholder:text-[var(--foreground-subtle)]"
                  />
                  <button
                    type="submit"
                    disabled={telling || !tell.trim()}
                    aria-label="Send to Smrti"
                    className="w-9 h-9 rounded-full bg-[var(--sidebar)] text-white flex items-center justify-center shrink-0 df-focus-ring cursor-pointer disabled:opacity-50 hover:bg-[var(--sidebar-soft)]"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {reply ? (
                  <p className="mt-2 text-[11px] text-[var(--sidebar-end)] font-medium flex items-start gap-1.5 px-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                    {reply}
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
