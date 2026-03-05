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
5. Enable Email + Magic Link in Supabase Auth settings
6. Set auth redirect URL: `http://localhost:3000/auth/callback`
7. Run `supabase/migrations/002_auth_trigger.sql` to enable automatic firm/user profile creation from `auth.users`

## Stack

Next.js 14 · Supabase · Vercel · Resend · Tailwind CSS

---

© LRARE Holdings Ltd
# comp
