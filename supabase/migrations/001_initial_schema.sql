-- Vara Database Schema
-- Migration: 001_initial_schema

create extension if not exists "uuid-ossp";

-- FIRMS
create table public.firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sra_number text unique,
  size_band text not null check (size_band in ('1-5', '6-20', '21-50', '50+')),
  practice_areas text[] not null default '{}',
  role_types text[] not null default '{}',
  subscription_tier text check (subscription_tier in ('solo', 'small', 'mid', 'enterprise')),
  subscription_status text not null default 'trial' check (subscription_status in ('trial', 'active', 'cancelled', 'expired')),
  trial_ends_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- USERS
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique not null,
  firm_id uuid references public.firms(id) on delete set null,
  email text unique not null,
  full_name text not null,
  role text not null default 'colp' check (role in ('colp', 'cofa', 'partner', 'associate', 'admin')),
  notification_preferences jsonb not null default '{"high_priority": true, "deadlines": true, "weekly_digest": true, "frequency": "immediate"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- REGULATORY UPDATES
create table public.regulatory_updates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  raw_content text not null,
  summary text,
  impact_level text not null default 'info' check (impact_level in ('high', 'medium', 'low', 'info')),
  practice_areas text[] not null default '{}',
  firm_size_relevance text[] not null default '{}',
  deadline timestamptz,
  source_url text not null,
  sra_reference text,
  publication_date timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ACTIONS
create table public.actions (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  regulatory_update_id uuid not null references public.regulatory_updates(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  deadline timestamptz,
  assigned_to uuid references public.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- POLICIES (V2 prep)
create table public.policies (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  title text not null,
  file_url text not null,
  parsed_text text,
  section_index jsonb,
  uploaded_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- INDEXES
create index idx_users_auth_id on public.users(auth_id);
create index idx_users_firm_id on public.users(firm_id);
create index idx_regulatory_updates_status on public.regulatory_updates(status);
create index idx_regulatory_updates_impact on public.regulatory_updates(impact_level);
create index idx_regulatory_updates_pub_date on public.regulatory_updates(publication_date desc);
create index idx_regulatory_updates_practice_areas on public.regulatory_updates using gin(practice_areas);
create index idx_actions_firm_id on public.actions(firm_id);
create index idx_actions_status on public.actions(status);
create index idx_actions_deadline on public.actions(deadline);
create index idx_policies_firm_id on public.policies(firm_id);

-- UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.firms for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.users for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.regulatory_updates for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.actions for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.policies for each row execute function public.handle_updated_at();

-- ROW LEVEL SECURITY
alter table public.firms enable row level security;
alter table public.users enable row level security;
alter table public.regulatory_updates enable row level security;
alter table public.actions enable row level security;
alter table public.policies enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = auth_id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = auth_id);
create policy "Users can read own firm" on public.firms for select using (id in (select firm_id from public.users where auth_id = auth.uid()));
create policy "Published updates readable" on public.regulatory_updates for select using (status = 'published');
create policy "Users can read firm actions" on public.actions for select using (firm_id in (select firm_id from public.users where auth_id = auth.uid()));
create policy "Users can update firm actions" on public.actions for update using (firm_id in (select firm_id from public.users where auth_id = auth.uid()));
create policy "Users can read firm policies" on public.policies for select using (firm_id in (select firm_id from public.users where auth_id = auth.uid()));
create policy "Users can upload firm policies" on public.policies for insert with check (firm_id in (select firm_id from public.users where auth_id = auth.uid()));
