-- Vara Database Schema
-- Migration: 003_waitlist_leads

create table public.waitlist_leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  source text not null default 'landing_page',
  created_at timestamptz not null default now()
);

create index idx_waitlist_leads_created_at on public.waitlist_leads(created_at desc);

alter table public.waitlist_leads enable row level security;

create policy "Public can submit waitlist leads"
  on public.waitlist_leads
  for insert
  to anon, authenticated
  with check (true);
