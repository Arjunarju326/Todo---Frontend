"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await login(username.trim(), password)
          : await register(username.trim(), password, displayName.trim());
      if (!result.ok) {
        setError(result.error || "Something went wrong");
        return;
      }
      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 text-[var(--sidebar)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(221,235,200,0.7), transparent 50%), radial-gradient(ellipse at bottom right, rgba(31,77,54,0.12), transparent 45%)",
        }}
      />

      <div className="relative w-full max-w-[420px] animate-df-fade-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--sidebar)] text-[var(--sidebar-active)] flex items-center justify-center shadow-lg shadow-[rgba(31,77,54,0.25)] mb-4">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="font-display text-[32px] font-bold text-[var(--sidebar-end)] tracking-tight leading-none">
            Dayflow
          </h1>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-2 font-medium">
            {mode === "login"
              ? "Sign in to your life organizer"
              : "Create your Dayflow account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="df-card rounded-[24px] p-6 sm:p-7 space-y-4"
        >
          {mode === "register" && (
            <div>
              <label className="text-[12px] font-semibold text-[var(--foreground-muted)] block mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Arjun"
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--sidebar-end)] outline-none focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
              />
            </div>
          )}

          <div>
            <label className="text-[12px] font-semibold text-[var(--foreground-muted)] block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="arjun"
              autoComplete="username"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--sidebar-end)] outline-none focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[var(--foreground-muted)] block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "register" ? 6 : undefined}
                className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm text-[var(--sidebar-end)] outline-none focus:border-[#b7cbb7] focus:ring-2 focus:ring-[var(--accent-sage)]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--sidebar-end)] flex items-center justify-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-[var(--alert-soft)] border border-[#f4ccc6] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--alert)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-[var(--sidebar)] hover:bg-[var(--sidebar-soft)] text-white text-sm font-semibold shadow-[0_8px_20px_rgba(31,77,54,0.25)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>

        </form>

        <p className="text-center text-[13px] text-[var(--foreground-muted)] mt-5">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="font-semibold text-[var(--sidebar)] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-semibold text-[var(--sidebar)] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
