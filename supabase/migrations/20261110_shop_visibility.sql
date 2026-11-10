-- NovaLab global shop switch. Default OFF.
create table if not exists public.novalab_platform_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.novalab_platform_flags(key,enabled)
values ('shop',false) on conflict (key) do nothing;
alter table public.novalab_platform_flags enable row level security;
revoke all on public.novalab_platform_flags from anon, authenticated;
create or replace function public.novalab_shop_enabled()
returns boolean language sql stable security definer
set search_path = public
as $$ select coalesce((select enabled from public.novalab_platform_flags where key='shop'),false) $$;
create or replace function public.novalab_set_shop_enabled(p_enabled boolean)
returns boolean language plpgsql security definer
set search_path = public
as $$
begin
 if auth.uid() is null or not exists (
  select 1 from public.academy_profiles
  where id=auth.uid() and role='admin' and active=true and access_status='approved'
 ) then
  raise exception 'Administrator access required';
 end if;
 insert into public.novalab_platform_flags(key,enabled,updated_at)
 values ('shop',p_enabled,now())
 on conflict(key) do update set enabled=excluded.enabled,updated_at=now();
 return p_enabled;
end $$;
revoke all on function public.novalab_set_shop_enabled(boolean) from public,anon;
grant execute on function public.novalab_set_shop_enabled(boolean) to authenticated;
grant execute on function public.novalab_shop_enabled() to anon,authenticated;

-- Free access whenever shop is hidden.
create or replace function academy_private.course_allowed(p_course text) returns boolean language sql stable security definer set search_path to '' as $$ select case when not public.novalab_shop_enabled() then exists(select 1 from public.ll_courses where id=p_course) when academy_private.current_tier()='max' then exists(select 1 from public.ll_courses where id=p_course) else exists(select 1 from academy_private.academy_course_catalog cc where cc.course_id=p_course and cc.course_rank<=academy_private.course_limit()) end $$;
create or replace function academy_private.lesson_entitled(p_lesson text) returns boolean language sql stable security definer set search_path to '' as $$ select exists(select 1 from public.ll_lesson_index li where li.id=p_lesson and (not public.novalab_shop_enabled() or (academy_private.course_allowed(li.course_id) and (li.required_plan='free' or (li.required_plan='plus' and academy_private.current_tier() in ('pro','ultimate','max')) or (li.required_plan='pro' and academy_private.current_tier() in ('ultimate','max')))))) $$;
create or replace function academy_private.daily_limit() returns integer language sql stable security definer set search_path to '' as $$ select case when not public.novalab_shop_enabled() then -1 else case academy_private.current_tier() when 'max' then -1 when 'ultimate' then 15 when 'pro' then 10 else 5 end end $$;
create or replace function academy_private.exam_limit() returns integer language sql stable security definer set search_path to '' as $$ select case when not public.novalab_shop_enabled() then -1 else case academy_private.current_tier() when 'free' then 2 when 'pro' then 4 when 'ultimate' then 8 else -1 end end $$;
create or replace function academy_private.course_limit() returns integer language sql stable security definer set search_path to '' as $$ select case when not public.novalab_shop_enabled() then 2147483647 else case academy_private.current_tier() when 'max' then 2147483647 when 'ultimate' then 30 when 'pro' then 20 else 10 end end $$;
