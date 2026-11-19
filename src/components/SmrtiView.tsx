"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Brain,
  RefreshCw,
  Sparkles,
  ListTodo,
  Lightbulb,
  Newspaper,
  Send,
  CheckCircle2,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";
import { SMRTI_AVATARS, SmrtiPose } from "@/lib/smrtiAvatars";

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
  const [tell, setTell] = useState("");
  const [telling, setTelling] = useState(false);
  const [tellReply, setTellReply] = useState("");
  const [createdTaskTitle, setCreatedTaskTitle] = useState("");
  const [pose, setPose] = useState<SmrtiPose>("default");

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

  const tellSmrti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tell.trim() || telling) return;
    setTelling(true);
    setPose("thinking");
    setTellReply("");
    setCreatedTaskTitle("");
    setError("");
    try {
      const res = await fetch("/api/assistant/capture", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: tell.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTellReply(data.reply || "Saved.");
        setCreatedTaskTitle(data.task?.title || "");
        setTell("");
        setPose("success");
        await load(true);
      } else {
        setError(data.error || "Smrti could not save that");
        setPose("explaining");
      }
    } catch {
      setError("Could not reach Smrti");
      setPose("explaining");
    } finally {
      setTelling(false);
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

      <section className="df-card overflow-hidden rounded-[24px] flex flex-col sm:flex-row">
        <div className="sm:w-[38%] relative min-h-[180px] bg-gradient-to-b from-[#e8f2e6] to-[#cfe3cb] flex items-end justify-center overflow-hidden">
          <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[72%] aspect-square rounded-full bg-[#c5dbc0]/75" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={pose}
            src={SMRTI_AVATARS[pose]}
            alt="Smrti"
            className="relative z-[1] w-[70%] max-w-[200px] h-auto drop-shadow-md"
          />
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-[var(--sidebar)]" />
            <p className="text-[14px] font-extrabold tracking-wide text-[var(--sidebar-end)]">
              SMRTI
            </p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e6f0e3] text-[var(--sidebar)]">
              AI Assistant
            </span>
          </div>
          <p className="text-[13px] text-[var(--sidebar-end)] font-medium mt-2 leading-relaxed">
            Named for <span className="font-bold">memory</span> — she turns “remind me”
            and meetings into Dayflow tasks, then nudges you so responsibilities
            don’t slip.
          </p>
          {briefing?.profile ? (
            <p className="text-[11px] text-[var(--foreground-muted)] mt-2">
              Profile: {briefing.profile.role} · {briefing.profile.location}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(
              [
                "default",
                "greeting",
                "thinking",
                "explaining",
                "success",
                "listening",
              ] as SmrtiPose[]
            ).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPose(p)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize df-focus-ring cursor-pointer ${
                  pose === p
                    ? "bg-[var(--sidebar)] text-white"
                    : "bg-[#f0f5ee] text-[var(--sidebar-end)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="df-card rounded-[20px] p-4 space-y-3">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Tell Smrti
          </h2>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
            Example: “I have a meeting tomorrow at 4:30 — remind me”
          </p>
        </div>
        <form onSubmit={tellSmrti} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={tell}
            onChange={(e) => setTell(e.target.value)}
            placeholder="Tell Smrti what to remember…"
            className="flex-1 min-w-0 h-11 px-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm outline-none focus:border-[var(--sidebar)] df-focus-ring"
          />
          <button
            type="submit"
            disabled={telling || !tell.trim()}
            className="h-11 px-4 rounded-xl bg-[var(--sidebar)] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 df-focus-ring cursor-pointer disabled:opacity-60 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {telling ? "Saving…" : "Remember"}
          </button>
        </form>
        {tellReply ? (
          <div className="rounded-xl bg-[var(--accent-mint)] px-3 py-2.5 text-[12px] text-[var(--sidebar-end)] font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <p>{tellReply}</p>
              {createdTaskTitle ? (
                <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                  Task created: {createdTaskTitle}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
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
