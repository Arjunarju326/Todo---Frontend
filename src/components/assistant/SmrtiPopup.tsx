"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, Send, CheckCircle2 } from "lucide-react";

type Briefing = {
  greeting?: string;
  taskNudge?: string;
  methodTip?: string;
  newsBite?: string;
  responsibilityFocus?: string;
  avatarMood?: string;
  assistantName?: string;
};

const STORAGE_KEY = "dayflow.smrti.popup.date";

export default function SmrtiPopup({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [tell, setTell] = useState("");
  const [telling, setTelling] = useState(false);
  const [reply, setReply] = useState("");

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
      setLoading(true);
      try {
        const res = await fetch("/api/assistant/briefing", {
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.briefing) {
          setBriefing(data.briefing);
          setOpen(true);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);

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

  const tellSmrti = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tell.trim() || telling) return;
    setTelling(true);
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
      } else {
        setReply(data.error || "Could not save that.");
      }
    } catch {
      setReply("Could not reach Smrti.");
    } finally {
      setTelling(false);
    }
  };

  if (!open || !briefing) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 pointer-events-auto"
      role="dialog"
      aria-label="Smrti assistant"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#16372a]/35 backdrop-blur-[2px]"
        aria-label="Dismiss Smrti"
        onClick={dismiss}
      />

      <div className="relative w-full max-w-lg flex items-end gap-0 sm:gap-1 animate-df-smrti-in pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="relative shrink-0 w-[118px] sm:w-[148px] -mb-1 sm:-mb-2 animate-df-smrti-bob">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/assistant/smrti.png"
            alt="Smrti"
            className="w-full h-auto drop-shadow-[0_12px_24px_rgba(22,55,42,0.35)] select-none pointer-events-none"
            draggable={false}
          />
        </div>

        <div className="relative flex-1 min-w-0 mb-10 sm:mb-16">
          <div className="absolute -left-2 top-10 w-3 h-3 rotate-45 bg-white border-l border-b border-[var(--card-border)] hidden sm:block" />
          <div className="df-card rounded-[22px] p-4 sm:p-5 shadow-[0_16px_40px_rgba(22,55,42,0.22)] border border-white/80 bg-white/95">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--sidebar)]" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--sidebar)]">
                  Smrti
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-[var(--background)] text-[var(--foreground-muted)] flex items-center justify-center df-focus-ring cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="font-display text-[17px] sm:text-[19px] font-bold text-[var(--sidebar-end)] leading-snug">
              {briefing.greeting}
            </p>
            {briefing.taskNudge ? (
              <p className="text-[13px] text-[var(--foreground)] mt-2.5 font-medium leading-relaxed">
                {briefing.taskNudge}
              </p>
            ) : null}
            {briefing.methodTip ? (
              <p className="text-[12px] text-[var(--foreground-muted)] mt-2 leading-relaxed">
                <span className="font-semibold text-[var(--sidebar-end)]">
                  Method:{" "}
                </span>
                {briefing.methodTip}
              </p>
            ) : null}

            <form onSubmit={tellSmrti} className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
              <p className="text-[11px] font-semibold text-[var(--sidebar-end)]">
                Tell me what to remember
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tell}
                  onChange={(e) => setTell(e.target.value)}
                  placeholder="Meeting tomorrow at 4:30…"
                  className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[12px] outline-none focus:border-[var(--sidebar)]"
                />
                <button
                  type="submit"
                  disabled={telling || !tell.trim()}
                  className="h-10 w-10 rounded-xl bg-[var(--sidebar)] text-white flex items-center justify-center df-focus-ring cursor-pointer disabled:opacity-60 shrink-0"
                  aria-label="Save reminder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {reply ? (
                <p className="text-[11px] text-[var(--sidebar-end)] font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                  {reply}
                </p>
              ) : null}
            </form>

            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full h-10 rounded-xl bg-[var(--sidebar)] text-white text-[12px] font-semibold df-focus-ring cursor-pointer"
            >
              {loading ? "Got it" : "Got it — thanks Smrti"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
