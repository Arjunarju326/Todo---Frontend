"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Brain, RefreshCw, Sparkles, ListTodo, Lightbulb, Newspaper } from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";

type Briefing = {
  greeting?: string;
  taskNudge?: string;
  methodTip?: string;
  newsBite?: string;
  responsibilityFocus?: string;
  profile?: { user_name?: string; role?: string; location?: string };
  stats?: { openCount?: number; overdueCount?: number; dueTodayCount?: number };
  generatedBy?: string;
};

export default function SmrtiView() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/assistant/briefing${refresh ? "?refresh=1" : ""}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) setBriefing(data.briefing);
      else setError(data.error || "Could not load Smrti");
    } catch {
      setError("Could not reach Smrti");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const reindex = async () => {
    setReindexing(true);
    try {
      await fetch("/api/assistant/reindex", {
        method: "POST",
        credentials: "include",
      });
      await load(true);
    } catch {
      setError("Reindex failed");
    } finally {
      setReindexing(false);
    }
  };

  const refreshBtn = (
    <button
      type="button"
      onClick={() => load(true)}
      className="h-9 px-3 rounded-full bg-white/90 border border-[var(--card-border)] text-[12px] font-semibold text-[var(--sidebar-end)] flex items-center gap-1.5 shadow-sm df-focus-ring cursor-pointer"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );

  return (
    <div className="space-y-4 pb-8 md:pb-16 max-w-3xl mx-auto df-stagger">
      <MobileHeroBanner
        title="Smrti"
        subtitle="Your memory guide for tasks & responsibilities"
        actions={refreshBtn}
      />

      <div className="hidden md:flex items-start justify-between gap-3 pt-1">
        <div>
          <h1 className="font-display text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-[var(--sidebar)]" />
            Smrti
          </h1>
          <p className="text-[13px] text-[var(--foreground-muted)] font-medium mt-1">
            Remembers what you forget — tasks, work, and responsibilities
          </p>
        </div>
        {refreshBtn}
      </div>

      <section className="df-card rounded-[20px] p-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/assistant/smrti.png"
          alt="Smrti"
          className="w-28 sm:w-36 h-auto drop-shadow-md"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--sidebar)] flex items-center justify-center sm:justify-start gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            About Smrti
          </p>
          <p className="text-[14px] text-[var(--sidebar-end)] font-medium mt-1 leading-relaxed">
            Named for <span className="font-bold">memory</span> — built for a Python
            developer learning AI/ML in Kannur who needs help holding onto daily
            responsibilities. Smrti uses your Dayflow tasks plus a knowledge base
            (RAG) to nudge what matters next.
          </p>
          {briefing?.profile ? (
            <p className="text-[11px] text-[var(--foreground-muted)] mt-2">
              Profile: {briefing.profile.role} · {briefing.profile.location}
            </p>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="df-card rounded-[16px] p-4 text-[12px] text-[var(--alert)] font-semibold">
          {error}
        </div>
      ) : null}

      {loading && !briefing ? (
        <div className="py-10 text-center text-xs text-[var(--foreground-muted)]">
          Smrti is preparing your briefing…
        </div>
      ) : briefing ? (
        <div className="grid grid-cols-1 gap-3 df-stagger-fast">
          <article className="df-card rounded-[18px] p-4">
            <p className="font-display text-[18px] font-bold text-[var(--sidebar-end)] leading-snug">
              {briefing.greeting}
            </p>
            {briefing.stats ? (
              <p className="text-[11px] text-[var(--foreground-muted)] mt-2 font-medium">
                Open {briefing.stats.openCount ?? 0} · Due today{" "}
                {briefing.stats.dueTodayCount ?? 0} · Overdue{" "}
                {briefing.stats.overdueCount ?? 0}
              </p>
            ) : null}
          </article>

          <article className="df-card rounded-[18px] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[var(--sidebar)]">
              <ListTodo className="w-4 h-4" />
              <h2 className="text-[13px] font-bold text-[var(--sidebar-end)]">
                Remember this next
              </h2>
            </div>
            <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
              {briefing.taskNudge}
            </p>
            {briefing.responsibilityFocus ? (
              <p className="text-[12px] text-[var(--foreground-muted)] leading-relaxed pt-1">
                {briefing.responsibilityFocus}
              </p>
            ) : null}
          </article>

          <article className="df-card rounded-[18px] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[var(--sidebar)]">
              <Lightbulb className="w-4 h-4" />
              <h2 className="text-[13px] font-bold text-[var(--sidebar-end)]">
                Method to forget less
              </h2>
            </div>
            <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
              {briefing.methodTip}
            </p>
          </article>

          <article className="df-card rounded-[18px] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[var(--sidebar)]">
              <Newspaper className="w-4 h-4" />
              <h2 className="text-[13px] font-bold text-[var(--sidebar-end)]">
                Tip for you
              </h2>
            </div>
            <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
              {briefing.newsBite}
            </p>
          </article>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={reindex}
          disabled={reindexing}
          className="h-11 px-4 rounded-2xl border border-[var(--card-border)] bg-white text-[12px] font-semibold text-[var(--sidebar-end)] df-focus-ring cursor-pointer disabled:opacity-60"
        >
          {reindexing ? "Updating memory…" : "Rebuild Smrti memory (RAG index)"}
        </button>
      </div>
    </div>
  );
}
