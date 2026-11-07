-- Publicly expose only the beta availability flag for the login page.
create or replace function public.academy_beta_status()
returns boolean language sql stable security definer set search_path = '' as $$
 select coalesce((select beta_open from academy_private.academy_settings where singleton=true),false)
$$;
revoke all on function public.academy_beta_status() from public;
grant execute on function public.academy_beta_status() to anon,authenticated;
