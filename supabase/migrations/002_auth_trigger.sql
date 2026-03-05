-- Vara Database Auth Trigger
-- Migration: 002_auth_trigger

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  new_firm_id uuid;
  raw_size_band text;
  safe_size_band text;
  mapped_tier text;
  safe_role text;
  safe_practice_areas text[];
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_size_band := coalesce(metadata->>'size_band', '1-5');

  safe_size_band := case
    when raw_size_band in ('1-5', '6-20', '21-50', '50+') then raw_size_band
    else '1-5'
  end;

  mapped_tier := case safe_size_band
    when '1-5' then 'solo'
    when '6-20' then 'small'
    when '21-50' then 'mid'
    else 'enterprise'
  end;

  safe_role := case
    when metadata->>'role' in ('colp', 'cofa', 'partner', 'associate', 'admin') then metadata->>'role'
    else 'colp'
  end;

  safe_practice_areas := case
    when jsonb_typeof(metadata->'practice_areas') = 'array' then
      coalesce(array(select jsonb_array_elements_text(metadata->'practice_areas')), '{}'::text[])
    else '{}'::text[]
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
  )
  values (
    coalesce(nullif(metadata->>'firm_name', ''), 'New Firm'),
    nullif(metadata->>'sra_number', ''),
    safe_size_band,
    safe_practice_areas,
    '{}'::text[],
    mapped_tier,
    'trial',
    now() + interval '14 days'
  )
  returning id into new_firm_id;

  insert into public.users (
    auth_id,
    firm_id,
    email,
    full_name,
    role,
    notification_preferences
  )
  values (
    new.id,
    new_firm_id,
    new.email,
    coalesce(nullif(metadata->>'full_name', ''), new.email),
    safe_role,
    '{"high_priority": true, "deadlines": true, "weekly_digest": true, "frequency": "immediate"}'::jsonb
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
