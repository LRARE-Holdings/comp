"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const PRACTICE_AREAS = [
  "Conveyancing",
  "Criminal Law",
  "Employment Law",
  "Family Law",
  "Immigration",
  "Litigation",
  "Personal Injury",
  "Private Client / Wills & Probate",
  "Commercial / Corporate",
  "Real Estate",
];

const SIZE_BANDS = [
  { value: "1-5", label: "Solo / Micro (1–5 solicitors)" },
  { value: "6-20", label: "Small Firm (6–20 solicitors)" },
  { value: "21-50", label: "Mid-Size (21–50 solicitors)" },
  { value: "50+", label: "Enterprise (50+ solicitors)" },
];

const ROLES = [
  { value: "colp", label: "COLP" },
  { value: "cofa", label: "COFA" },
  { value: "partner", label: "Partner" },
  { value: "associate", label: "Associate" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2: Firm profile
  const [firmName, setFirmName] = useState("");
  const [sraNumber, setSraNumber] = useState("");
  const [sizeBand, setSizeBand] = useState("");
  const [role, setRole] = useState("");
  const [practiceAreas, setPracticeAreas] = useState<string[]>([]);

  const supabase = createClient();

  function togglePracticeArea(area: string) {
    setPracticeAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          firm_name: firmName,
          sra_number: sraNumber,
          size_band: sizeBand,
          role,
          practice_areas: practiceAreas,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to verify page
    window.location.href = "/auth/verify";
  }

  return (
    <div className="min-h-screen bg-vara-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
          Start your free trial
        </h1>
        <p className="text-vara-slate text-sm text-center mb-8">
          14 days, full access. No credit card required.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-vara-blue" : "bg-white/10"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-vara-blue" : "bg-white/10"}`} />
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSignup}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="vara-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Work email
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
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vara-input w-full"
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="vara-btn-primary w-full mt-2">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Firm name
                </label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="vara-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  SRA number <span className="text-vara-slate/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={sraNumber}
                  onChange={(e) => setSraNumber(e.target.value)}
                  className="vara-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Firm size
                </label>
                <div className="space-y-2">
                  {SIZE_BANDS.map((band) => (
                    <label
                      key={band.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        sizeBand === band.value
                          ? "border-vara-blue bg-vara-blue/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sizeBand"
                        value={band.value}
                        checked={sizeBand === band.value}
                        onChange={(e) => setSizeBand(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          sizeBand === band.value ? "border-vara-blue" : "border-white/30"
                        }`}
                      >
                        {sizeBand === band.value && (
                          <div className="w-2 h-2 rounded-full bg-vara-blue" />
                        )}
                      </div>
                      <span className="text-sm text-white font-body">{band.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Your role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                        role === r.value
                          ? "border-vara-blue bg-vara-blue/10 text-white"
                          : "border-white/10 text-vara-slate hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={(e) => setRole(e.target.value)}
                        className="sr-only"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-vara-slate mb-1.5">
                  Practice areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRACTICE_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => togglePracticeArea(area)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        practiceAreas.includes(area)
                          ? "border-vara-blue bg-vara-blue/10 text-white"
                          : "border-white/10 text-vara-slate hover:border-white/20"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-vara-danger text-sm">{error}</p>}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="vara-btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="vara-btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-vara-slate text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-vara-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
