-- LiveryLab Developer Academy — Supabase schema
-- Run in your own Supabase SQL Editor after creating a project.
-- Never put passwords or secret keys into a public GitHub repository.
create table if not exists public.academy_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Developer',
  role text not null default 'student' check (role in ('student','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null default 'academy-v2',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint academy_progress_payload_limit check (pg_column_size(payload) <= 900000)
);
create or replace function public.academy_is_admin()
returns boolean language sql stable security definer set search_path=''
as $fn$
  select exists (select 1 from public.academy_profiles p
    where p.id=(select auth.uid()) and p.active=true and p.role='admin');
$fn$;
create or replace function public.academy_is_active()
returns boolean language sql stable security definer set search_path=''
as $fn$
  select exists (select 1 from public.academy_profiles p
    where p.id=(select auth.uid()) and p.active=true);
$fn$;
revoke all on function public.academy_is_admin() from public;
revoke all on function public.academy_is_active() from public;
grant execute on function public.academy_is_admin() to authenticated;
grant execute on function public.academy_is_active() to authenticated;
create or replace function public.academy_new_user()
returns trigger language plpgsql security definer set search_path='' as $fn$
begin
  insert into public.academy_profiles(id,display_name)
    values(new.id,coalesce(nullif(left(new.raw_user_meta_data->>'name',80),''),'Developer'))
    on conflict(id) do nothing;
  return new;
end
$fn$;
drop trigger if exists academy_auth_user_created on auth.users;
create trigger academy_auth_user_created
  after insert on auth.users for each row execute function public.academy_new_user();
alter table public.academy_profiles enable row level security;
alter table public.academy_progress enable row level security;
drop policy if exists academy_profiles_select on public.academy_profiles;
create policy academy_profiles_select on public.academy_profiles
 for select to authenticated using (id=(select auth.uid()) or (select public.academy_is_admin()));
drop policy if exists academy_progress_select on public.academy_progress;
create policy academy_progress_select on public.academy_progress
 for select to authenticated using (user_id=(select auth.uid()) and (select public.academy_is_active()));
drop policy if exists academy_progress_insert on public.academy_progress;
create policy academy_progress_insert on public.academy_progress
 for insert to authenticated with check (user_id=(select auth.uid()) and (select public.academy_is_active()));
drop policy if exists academy_progress_update on public.academy_progress;
create policy academy_progress_update on public.academy_progress
 for update to authenticated using (user_id=(select auth.uid()) and (select public.academy_is_active()))
 with check (user_id=(select auth.uid()) and (select public.academy_is_active()));
drop policy if exists academy_progress_delete on public.academy_progress;
create policy academy_progress_delete on public.academy_progress
 for delete to authenticated using (user_id=(select auth.uid()) and (select public.academy_is_active()));
create or replace function public.academy_set_display_name(new_name text)
returns void language plpgsql security definer set search_path='' as $fn$
declare clean_name text;
begin
  if auth.uid() is null or not public.academy_is_active() then
    raise exception 'Not authenticated or account disabled';
  end if;
  clean_name:=btrim(new_name);
  if char_length(clean_name)<2 or char_length(clean_name)>40 then
    raise exception 'Display name must be 2 to 40 characters';
  end if;
  update public.academy_profiles set display_name=clean_name where id=auth.uid();
end
$fn$;
revoke all on function public.academy_set_display_name(text) from public;
grant execute on function public.academy_set_display_name(text) to authenticated;
grant select on public.academy_profiles to authenticated;
grant select,insert,update,delete on public.academy_progress to authenticated;
-- IMPORTANT: create your own Auth user through Dashboard, then give ONLY that verified user admin:
-- update public.academy_profiles set role='admin'
-- where id=(select id from auth.users where email='YOUR_OWN_VERIFIED_EMAIL');
-- Disable public self-signup in Supabase Authentication settings for invite-only membership.
