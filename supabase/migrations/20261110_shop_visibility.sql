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
