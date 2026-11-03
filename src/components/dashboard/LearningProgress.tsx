"use client";

import React from "react";
import { GraduationCap, BookOpen, Play } from "lucide-react";

type LearningProgressProps = {
  title?: string;
  completed?: number;
  total?: number;
  onContinue: () => void;
};

export default function LearningProgress({
  title = "AI Engineering Course",
  completed = 4,
  total = 8,
  onContinue,
}: LearningProgressProps) {
  const pct = Math.round((completed / Math.max(total, 1)) * 100);

  return (
    <section
      className="df-card df-card-lift p-3.5 sm:p-4 rounded-[18px] animate-df-fade-up h-full flex flex-col justify-between"
      style={{ animationDelay: "220ms" }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <GraduationCap className="w-4 h-4 text-[#2e7d32]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Learning Progress
          </h3>
        </div>

        <div className="bg-[#f4f7f2] border border-[#e2ece0] rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e3eee1] text-[#1f4d36] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" aria-hidden />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-[var(--sidebar-end)] truncate">
              {title}
            </h4>
            <p className="text-[10px] text-[var(--foreground-muted)] font-medium mt-0.5">
              {completed} of {total} lessons completed
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div
                className="h-1.5 rounded-full bg-[#dbe5db] flex-1 overflow-hidden df-progress-bar"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${pct}% complete`}
              >
                <span
                  className="block h-full rounded-full bg-[#2e7d32]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#2e7d32] shrink-0">
                {pct}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            aria-label="Play course"
            className="w-7 h-7 rounded-full bg-white border border-[#c8d8c8] text-[#1f4d36] flex items-center justify-center hover:bg-[#eaf3ea] transition-all cursor-pointer shadow-xs df-focus-ring shrink-0"
          >
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-2 pt-1">
        <button
          type="button"
          onClick={onContinue}
          className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
        >
          Continue Learning →
        </button>
      </div>
    </section>
  );
}
