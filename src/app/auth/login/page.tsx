"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for a sign-in link.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-vara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 bg-gradient-to-b from-[#0F1923] to-[#0D1420] rounded-[19%] flex items-center justify-center border border-white/10">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M10 0L18 16H14L10 7L6 16H2L10 0Z" fill="white" />
              <rect x="7" y="14" width="6" height="2" rx="1" fill="#2D7FF9" />
            </svg>
          </div>
          <span className="font-display font-semibold text-xl tracking-[0.09em] text-white">
            VARA
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl text-white text-center mb-2">
          Sign in
        </h1>
        <p className="text-vara-slate text-sm text-center mb-8">
          Access your compliance dashboard
        </p>

        {/* Mode toggle */}
        <div className="flex bg-vara-navy rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode("password")}
            className={`flex-1 text-sm font-body font-medium py-2 rounded-md transition-colors ${
              mode === "password" ? "bg-vara-blue text-white" : "text-vara-slate hover:text-white"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode("magic")}
            className={`flex-1 text-sm font-body font-medium py-2 rounded-md transition-colors ${
              mode === "magic" ? "bg-vara-blue text-white" : "text-vara-slate hover:text-white"
            }`}
          >
            Magic link
          </button>
        </div>

        <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vara-input w-full"
                placeholder="you@firm.co.uk"
                required
              />
            </div>

            {mode === "password" && (
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vara-input w-full"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-vara-danger text-sm mt-4">{error}</p>
          )}
          {message && (
            <p className="text-vara-success text-sm mt-4">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="vara-btn-primary w-full mt-6 disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : mode === "password"
              ? "Sign in"
              : "Send magic link"}
          </button>
        </form>

        <p className="text-vara-slate text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-vara-blue hover:underline">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
