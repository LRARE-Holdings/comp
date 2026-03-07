-- Vara Database Schema
-- Migration: 005_prelaunch_waitlist_emails

create table public.prelaunch_waitlist_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing_page',
  entry_point text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index idx_prelaunch_waitlist_emails_created_at
  on public.prelaunch_waitlist_emails(created_at desc);

alter table public.prelaunch_waitlist_emails enable row level security;

create policy "Public can insert prelaunch waitlist emails"
  on public.prelaunch_waitlist_emails
  for insert
  to anon, authenticated
  with check (true);
