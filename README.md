# Vara

**Regulation, decoded.**

Regulatory change intelligence platform for SRA-regulated UK law firms.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Fill in your keys
npm run dev
```

## Setup Checklist

1. `npm install`
2. Copy `.env.example` → `.env.local` with your Supabase + Resend keys
3. Download Clash Display + General Sans from Fontshare (.woff2) → `public/fonts/`
4. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
5. Run `supabase/migrations/002_auth_trigger.sql` to enable automatic firm/user profile creation from `auth.users`
6. Run `supabase/migrations/003_waitlist_leads.sql` to persist landing-page early access emails
7. Run `supabase/migrations/004_stripe_billing_fields.sql` to enable custom billing sync fields
8. Run `supabase/migrations/005_prelaunch_waitlist_emails.sql` to persist coming-soon waitlist submissions
9. Enable Email + Magic Link in Supabase Auth settings
10. Set auth redirect URL: `http://localhost:3000/auth/callback`
11. Add Stripe env vars from `.env.example` (secret key, webhook secret, all price IDs)
12. Configure Stripe webhook endpoint: `/api/stripe/webhook`
13. Subscribe to Stripe events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Stack

Next.js 14 · Supabase · Vercel · Resend · Tailwind CSS

---

© LRARE Holdings Ltd
# comp
