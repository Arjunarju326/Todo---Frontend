"use client";

import React, { useState } from "react";
import { Check, Plus, StickyNote } from "lucide-react";

type QuickNotesProps = {
  notes?: string[];
  onAdd?: () => void;
  onViewAll: () => void;
};

const DEFAULT_NOTES = [
  "Buy gym conditioner & protein",
  "Follow up on job application – NexCrest",
  "Idea: Automate expense tags",
];

export default function QuickNotes({
  notes = DEFAULT_NOTES,
  onAdd,
  onViewAll,
}: QuickNotesProps) {
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <section className="df-card df-card-lift p-3.5 sm:p-4 rounded-[18px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-[#2e7d32]" aria-hidden />
          <h3 className="text-[14px] font-bold text-[var(--sidebar-end)]">
            Quick Notes
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add note"
          className="w-5 h-5 rounded-md text-[#2e7d32] hover:bg-[var(--accent-mint)] flex items-center justify-center transition-colors cursor-pointer df-focus-ring"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-1">
        {notes.map((note, i) => {
          const checked = !!done[i];
          return (
            <li key={note}>
              <button
                type="button"
                onClick={() => setDone((prev) => ({ ...prev, [i]: !prev[i] }))}
                aria-pressed={checked}
                className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-[var(--accent-mint)] transition-colors duration-150 cursor-pointer text-left df-focus-ring group"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                    checked
                      ? "bg-[#2e7d32] border-[#2e7d32] text-white df-check-pop"
                      : "border-[#b8c6b8] bg-white group-hover:border-[#2e7d32]"
                  }`}
                  aria-hidden
                >
                  {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <p
                  className={`text-[11px] font-medium leading-snug truncate ${
                    checked
                      ? "text-[var(--foreground-subtle)] df-strike"
                      : "text-[#374151]"
                  }`}
                >
                  {note}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end mt-1.5 pt-0.5">
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[var(--sidebar-end)] hover:text-[#2e7d32] transition-colors cursor-pointer df-focus-ring rounded-md flex items-center gap-1"
        >
          View All Notes →
        </button>
      </div>
    </section>
  );
}
