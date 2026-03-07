# Vara Project Memory

Last updated: March 5, 2026  
Primary source: `docs/context/vara-transition.docx`

## Project Identity
- Product: Vara
- Tagline: Regulation, decoded.
- Company: LRARE Holdings Ltd (Newcastle upon Tyne, UK)
- Founder: Alex (solo founder, law student)
- Stage: Pre-build planning complete; starting Phase 1

## Problem + Customer
- Vara is a regulatory change intelligence platform for SRA-regulated UK law firms.
- Primary buyer: COLPs/COFAs at firms with 1-50 solicitors.
- Core job: monitor SRA changes, explain impact in plain English, output structured actions.

## Locked Product Decisions
- V1 scope is SRA-only.
- Second regulator (FCA or ICAEW) planned for months 15-18.
- Ingestion: web scraping/RSS/email fallback from `sra.org.uk` (no paid API required).
- Editorial model: AI-assisted drafting + mandatory human review before publication.
- Policy compliance checker is V2 (months 7-9), but policy upload foundation should exist in V1.

## Locked Brand Decisions
- Name: Vara
- Preferred domain: `getvara.co.uk`
- Visual identity: "The Mark" logo + VARA wordmark.
- Fonts: Clash Display (display), General Sans (body), Arial fallback.
- Style direction: dark, minimal, professional; consistent with LRARE products.

## Locked Pricing
- Solo/Micro (1-5): £49/mo or £499/yr
- Small (6-20): £99/mo or £999/yr
- Mid-size (21-50): £179/mo or £1,799/yr
- Free trial: 14 days
- Enterprise (50+): on request

## Locked GTM
- Primary channel: direct outreach to COLPs (LinkedIn + email).
- Message angle: lead with a specific recent SRA change and concrete impact.
- Support channels: founder-led content, referrals, legal media/events.

## Build Stack (Current Plan)
- Frontend: React/Next.js
- Backend/API: Node.js
- Data: PostgreSQL (Supabase in current repo)
- Auth: email/password + magic link
- Payments: Stripe subscriptions
- Notifications: transactional email (Resend/Postmark)
- Scraping: Puppeteer/similar, scheduled at least twice daily

## V1 Dashboard Scope
- Action Centre
- Regulatory Feed
- Firm Profile onboarding wizard
- Deadline Tracker
- Compliance Score
- Email alerts
- Internal admin/editorial panel

## Immediate Priorities
1. Domain + infrastructure:
   - Confirm/register `getvara.co.uk` (+ optionally `getvara.com`)
   - Deploy branded placeholder landing page with email capture
2. Core platform:
   - Auth, onboarding, dashboard shell, Stripe integration
3. SRA pipeline:
   - Scraper + change detection + editorial processing admin
4. Alerts:
   - High-priority, deadlines, weekly digest

## Operating Values
- Clarity over cleverness
- Accuracy is non-negotiable
- Respect COLP time
- Earn trust through consistency
- Build in public and iterate from user feedback

## Session Rule
- Treat this file and the transition DOCX as canonical Vara context unless Alex explicitly overrides a decision.
