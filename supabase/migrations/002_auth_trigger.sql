-- Migration: 002_auth_trigger
-- Replaces the HTTP webhook for user creation with a database trigger.
-- When a new user signs up via Supabase Auth, this trigger automatically
-- creates the firm and user profile records.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _firm_id uuid;
  _size_band text;
  _tier text;
  _meta jsonb;
begin
  _meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  -- Create firm if firm_name is provided in metadata
  if _meta->>'firm_name' is not null and _meta->>'firm_name' != '' then
    _size_band := coalesce(_meta->>'size_band', '1-5');

    _tier := case _size_band
      when '1-5'  then 'solo'
      when '6-20' then 'small'
      when '21-50' then 'mid'
      when '50+'  then 'enterprise'
      else 'solo'
    end;

    insert into public.firms (
      name,
      sra_number,
      size_band,
      practice_areas,
      role_types,
      subscription_tier,
      subscription_status,
      trial_ends_at
    ) values (
      _meta->>'firm_name',
      nullif(_meta->>'sra_number', ''),
      _size_band,
      coalesce(
        (select array_agg(e::text) from jsonb_array_elements_text(_meta->'practice_areas') as e),
        '{}'::text[]
      ),
      '{}'::text[],
      _tier,
      'trial',
      now() + interval '14 days'
    )
    returning id into _firm_id;
  end if;

  -- Create user profile
  insert into public.users (
    auth_id,
    firm_id,
    email,
    full_name,
    role,
    notification_preferences
  ) values (
    new.id,
    _firm_id,
    new.email,
    coalesce(nullif(_meta->>'full_name', ''), new.email),
    coalesce(nullif(_meta->>'role', ''), 'colp'),
    '{"high_priority": true, "deadlines": true, "weekly_digest": true, "frequency": "immediate"}'::jsonb
  );

  return new;
end;
$$;

-- Trigger fires after a new user is inserted in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
