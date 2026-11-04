"use client";

import React, { useState, useEffect } from "react";
import {
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Tag,
  Lightbulb,
  ShoppingCart,
  Clock,
  Sparkles,
} from "lucide-react";
import MobileHeroBanner from "./dashboard/MobileHeroBanner";

interface Note {
  _id: string;
  title: string;
  content: string;
  category: "IDEA" | "TODO_LATER" | "PURCHASE_LIST" | "GENERAL";
  isPinned: boolean;
  tags: string[];
  createdAt: string;
}

export default function InboxView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<Note["category"]>("IDEA");
  const [newPinned, setNewPinned] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          isPinned: newPinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [data.note, ...prev]);
        setNewTitle("");
        setNewContent("");
        setIsAdding(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? { ...n, isPinned: !n.isPinned } : n))
      );
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note._id, isPinned: !note.isPinned }),
      });
    } catch (err) {
      console.error(err);
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      setNotes((prev) => prev.filter((n) => n._id !== id));
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (categoryFilter === "ALL") return true;
    return n.category === categoryFilter;
  });

  const addNoteBtn = (
    <button
      onClick={() => setIsAdding(!isAdding)}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--sidebar)] hover:bg-[var(--sidebar-soft)] text-white font-medium text-xs shadow-xs transition-all cursor-pointer df-focus-ring"
    >
      <Plus className="w-4 h-4 stroke-[2.5]" />
      <span>New Note</span>
    </button>
  );

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-1 md:px-4 df-stagger">
      <MobileHeroBanner
        title="Notes & Inbox"
        subtitle="Capture thoughts, lists, and ideas"
        actions={addNoteBtn}
      />

      {/* Desktop header */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[#191D23]" />
            <span>Notes & Ideas Inbox</span>
          </h1>
          <p className="text-xs text-[#787E86] mt-0.5">
            Quick scratchpad for thoughts, brain dumps, and lists
          </p>
        </div>
        {addNoteBtn}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateNote}
          className="bg-white p-5 rounded-3xl border border-[#EAE5DC] space-y-4 shadow-sm animate-in fade-in"
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Note title or quick thought..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-sm text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23]"
              autoFocus
              required
            />
            <textarea
              placeholder="Details, URLs, or notes..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] placeholder-[#9EA3A9] focus:outline-none focus:border-[#191D23] resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#F9F7F3] border border-[#EAE5DC] text-xs text-[#1A1D20] focus:outline-none"
              >
                <option value="IDEA">Idea</option>
                <option value="PURCHASE_LIST">To Buy Later</option>
                <option value="TODO_LATER">Someday / Maybe</option>
                <option value="GENERAL">General</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#787E86]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#191D23] hover:bg-[#2C3440] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#EAE5DC] w-fit overflow-x-auto no-scrollbar">
        {[
          { id: "ALL", label: "All Notes" },
          { id: "IDEA", label: "Ideas" },
          { id: "PURCHASE_LIST", label: "To Buy" },
          { id: "TODO_LATER", label: "Someday" },
          { id: "GENERAL", label: "General" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === tab.id
                ? "bg-[#191D23] text-white shadow-xs"
                : "text-[#787E86] hover:text-[#1A1D20]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#787E86]">
          Loading notes...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-[#EAE5DC] text-center text-xs text-[#787E86]">
          No notes in this view. Use the &apos;New Note&apos; button to jot down your thoughts!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 df-stagger-fast">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className={`df-card df-card-lift p-4 rounded-3xl flex flex-col justify-between group ${
                note.isPinned ? "ring-2 ring-[#191D23]/20" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-[#1A1D20]">
                    {note.title}
                  </h4>
                  <button
                    onClick={() => handleTogglePin(note)}
                    className="p-1 text-[#8E949D] hover:text-[#1A1D20]"
                  >
                    {note.isPinned ? (
                      <Pin className="w-3.5 h-3.5 fill-[#191D23] text-[#191D23]" />
                    ) : (
                      <PinOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {note.content && (
                  <p className="text-xs text-[#6B727A] whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EAE5DC]">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#656C75] font-medium">
                  {note.category}
                </span>

                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="p-1 text-[#A0A6AF] hover:text-[#C4382B]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
