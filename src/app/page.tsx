import Link from "next/link";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { VaraBrand } from "@/components/layout/vara-brand";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-vara-dark">
      <div
        aria-hidden
        className="ambient-orb ambient-orb-slow pointer-events-none absolute left-1/2 top-[-240px] h-[520px] w-[840px] -translate-x-1/2 rounded-full bg-gradient-to-r from-vara-blue/20 via-white/5 to-vara-blue/15 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-orb ambient-orb-fast pointer-events-none absolute right-[-140px] top-[380px] h-[360px] w-[360px] rounded-full bg-vara-blue/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-orb pointer-events-none absolute left-[-140px] top-[760px] h-[300px] w-[300px] rounded-full bg-vara-light/10 blur-3xl"
      />

      <header className="relative z-10">
        <nav className="reveal-up mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/" aria-label="Vara home">
            <VaraBrand priority logoClassName="h-9" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-vara-slate transition-colors hover:text-white">
              How it works
            </a>
            <a href="#for-teams" className="text-sm text-vara-slate transition-colors hover:text-white">
              Who it helps
            </a>
            <a href="#faq" className="text-sm text-vara-slate transition-colors hover:text-white">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/coming-soon?from=signin" className="text-sm text-vara-slate transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/coming-soon?from=get-started" className="vara-btn-primary px-4 py-2.5 text-sm">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-start gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-14">
          <div className="max-w-2xl">
            <p className="vara-badge-info reveal-up reveal-delay-1 mb-7 inline-block">
              Built for SRA-regulated law firms in the UK
            </p>
            <h1 className="reveal-up reveal-delay-2 font-display text-5xl font-bold leading-[1.05] text-white md:text-6xl lg:text-7xl">
              The SRA keeps moving.
              <br />
              <span className="text-vara-blue">Your team still has client work.</span>
            </h1>
            <p className="reveal-up reveal-delay-3 mt-7 max-w-xl text-lg leading-relaxed text-vara-light/85 md:text-xl">
              Vara reads the updates, explains what changed in plain English, and
              gives your team a clean list of next actions. Less chasing PDFs.
              More clarity.
            </p>

            <div className="reveal-up reveal-delay-4 mt-8 flex flex-wrap gap-3">
              <Link href="/coming-soon?from=get-started" className="vara-btn-primary">
                Get started
              </Link>
              <a href="#how-it-works" className="vara-btn-secondary">
                See how it works
              </a>
            </div>

            <div className="reveal-up reveal-delay-5 mt-8 max-w-lg">
              <WaitlistForm />
            </div>
          </div>

          <div className="reveal-up reveal-delay-3 rounded-2xl border border-white/10 bg-vara-navy/65 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-vara-slate">
              This week in Vara
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">
              A single view of what actually needs attention
            </h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Client Money Guidance refresh",
                  impact: "High impact",
                  note: "New wording affects reconciliations and exception reporting.",
                  due: "Action due in 6 days",
                },
                {
                  title: "AML thematic review update",
                  impact: "Medium impact",
                  note: "Risk-assessment templates need minor wording changes.",
                  due: "Action due in 12 days",
                },
                {
                  title: "Transparency Rules reminder",
                  impact: "Low impact",
                  note: "No policy rewrite needed, but website copy should be checked.",
                  due: "Action due in 18 days",
                },
              ].map((item, index) => (
                <article
                  key={item.title}
                  className="reveal-up interactive-card rounded-xl border border-white/10 bg-vara-dark/70 p-4"
                  style={{ animationDelay: `${280 + index * 110}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    <span className="vara-badge-info shrink-0">{item.impact}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-vara-light/80">
                    {item.note}
                  </p>
                  <p className="mt-3 text-xs font-medium text-vara-blue">{item.due}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8">
          <div className="reveal-up grid gap-6 rounded-2xl border border-white/10 bg-vara-navy/45 p-6 md:grid-cols-3 md:p-8">
            {[
              {
                label: "Coverage",
                value: "SRA updates monitored continuously",
              },
              {
                label: "Summaries",
                value: "Plain-English context for your firm profile",
              },
              {
                label: "Output",
                value: "Action lists with owners, due dates, and status",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className="reveal-up interactive-card rounded-xl border border-white/10 bg-vara-dark/50 p-5"
                style={{ animationDelay: `${180 + index * 90}ms` }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.11em] text-vara-slate">
                  {item.label}
                </p>
                <p className="mt-2 text-base text-vara-light/90">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <p className="reveal-up text-sm font-medium uppercase tracking-[0.12em] text-vara-blue">
              How it works
            </p>
            <h2 className="reveal-up reveal-delay-1 mt-3 font-display text-4xl font-semibold text-white md:text-5xl">
              Built for the reality of small compliance teams
            </h2>
            <p className="reveal-up reveal-delay-2 mt-5 text-lg leading-relaxed text-vara-light/80">
              You should not need an internal project manager just to keep up with
              regulatory change. Vara keeps the workflow tight and practical.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Monitor",
                body: "We watch SRA publications and guidance updates so your team does not have to refresh six different pages all week.",
              },
              {
                step: "02",
                title: "Interpret",
                body: "Each change is translated into plain language with likely impact based on your firm size, role mix, and practice areas.",
              },
              {
                step: "03",
                title: "Act",
                body: "Action items are created with suggested owners and deadlines, so progress lives in one place instead of inbox threads.",
              },
            ].map((item, index) => (
              <article
                key={item.step}
                className="reveal-up interactive-card rounded-2xl border border-white/10 bg-vara-navy/50 p-6"
                style={{ animationDelay: `${140 + index * 120}ms` }}
              >
                <p className="text-sm font-medium text-vara-blue">{item.step}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-vara-light/80">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="for-teams" className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="reveal-up rounded-2xl border border-white/10 bg-gradient-to-br from-vara-navy/55 to-vara-dark p-7 md:p-10">
            <h2 className="reveal-up reveal-delay-1 font-display text-3xl font-semibold text-white md:text-4xl">
              Useful for every role involved in compliance
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                {
                  role: "COLP",
                  copy: "Get a clear list of policy and procedure changes, with evidence trails ready for internal review.",
                },
                {
                  role: "COFA",
                  copy: "Spot updates that touch client money controls early, before they become quarter-end surprises.",
                },
                {
                  role: "Practice Leads",
                  copy: "See only what affects your team, with simple summaries you can share in five minutes.",
                },
              ].map((item, index) => (
                <article
                  key={item.role}
                  className="reveal-up interactive-card rounded-xl border border-white/10 bg-vara-dark/65 p-5"
                  style={{ animationDelay: `${120 + index * 120}ms` }}
                >
                  <h3 className="font-display text-xl font-semibold text-white">{item.role}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-vara-light/80">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-8 lg:pb-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="reveal-up">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-vara-blue">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-white md:text-5xl">
                Questions we usually hear first
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "Is this only for large firms?",
                  answer:
                    "No. Vara was designed for teams where compliance is one of many hats. Most value shows up when time is tight.",
                },
                {
                  question: "Do we still need to read the source material?",
                  answer:
                    "Yes, and Vara links you back to the original source. The difference is your first pass is faster and clearer.",
                },
                {
                  question: "How quickly do updates show up?",
                  answer:
                    "New items are monitored continuously, then surfaced in your feed with summaries and suggested actions.",
                },
                {
                  question: "Can I invite colleagues?",
                  answer:
                    "Yes. You can add team members and assign actions by role so ownership is clear from day one.",
                },
              ].map((item, index) => (
                <details
                  key={item.question}
                  className="reveal-up interactive-card rounded-xl border border-white/10 bg-vara-navy/40 p-5"
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <summary className="cursor-pointer list-none pr-6 font-body text-base font-medium text-white">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-vara-light/80">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8">
          <div className="reveal-up rounded-2xl border border-vara-blue/40 bg-gradient-to-r from-vara-blue/20 via-vara-navy/70 to-vara-blue/10 p-8 md:p-10">
            <p className="reveal-up text-sm font-medium uppercase tracking-[0.12em] text-vara-light/90">
              Ready when you are
            </p>
            <h2 className="reveal-up reveal-delay-1 mt-3 max-w-3xl font-display text-3xl font-semibold text-white md:text-4xl">
              Start with your next compliance week, not next quarter.
            </h2>
            <p className="reveal-up reveal-delay-2 mt-4 max-w-2xl text-vara-light/85">
              Set up takes minutes. You can start with one practice area and expand
              as your team gets comfortable.
            </p>
            <div className="reveal-up reveal-delay-3 mt-7 max-w-lg">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-sm text-vara-slate md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} LRARE Holdings Ltd. All rights reserved.</p>
          <p>Vara helps legal teams stay on top of regulatory change.</p>
        </div>
      </footer>
    </div>
  );
}
