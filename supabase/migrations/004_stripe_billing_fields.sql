-- Vara Database Schema
-- Migration: 004_stripe_billing_fields

alter table public.firms
  add column if not exists billing_email text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_subscription_status text,
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;
