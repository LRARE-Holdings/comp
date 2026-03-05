import Link from "next/link";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-vara-dark flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-vara-slate hover:text-white transition-colors font-body text-sm">
            Sign in
          </Link>
          <Link href="/auth/signup" className="vara-btn-primary text-sm">
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-4xl mx-auto">
        <div className="vara-badge-info mb-6 inline-block">
          For SRA-regulated law firms
        </div>
        <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
          Regulation,
          <br />
          <span className="text-vara-blue">decoded.</span>
        </h1>
        <p className="font-body text-lg md:text-xl text-vara-slate max-w-2xl mb-10 leading-relaxed">
          Stop drowning in SRA updates. Vara monitors regulatory changes,
          translates them into plain English, and delivers structured action
          items filtered to your firm.
        </p>

        {/* Email capture */}
        <WaitlistForm />

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-3xl">
          {[
            {
              title: "Monitor",
              description: "Automated SRA tracking. Every update captured, nothing missed.",
            },
            {
              title: "Interpret",
              description: "Plain-English summaries with impact ratings filtered to your firm.",
            },
            {
              title: "Act",
              description: "Structured action items with deadlines. Track completion in one place.",
            },
          ].map((item) => (
            <div key={item.title} className="vara-card text-left">
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm text-vara-slate leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-8 text-center">
        <p className="text-vara-slate text-sm font-body">
          &copy; {new Date().getFullYear()} LRARE Holdings Ltd. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
