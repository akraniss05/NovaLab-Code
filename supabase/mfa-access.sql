-- Run against the Academy v5 schema. Existing members without a factor can still sign in.
create or replace function academy_private.session_verified()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    (select auth.jwt()->>'aal') = 'aal2' or not exists (
      select 1 from auth.mfa_factors
      where user_id = (select auth.uid()) and status = 'verified'
    )
  )
$$;
revoke all on function academy_private.session_verified() from public, anon;
grant execute on function academy_private.session_verified() to authenticated;

create or replace function academy_private.is_active()
returns boolean language sql stable security definer set search_path = ''
as $$
  select academy_private.session_verified() and exists (
    select 1 from public.academy_profiles
    where id = (select auth.uid()) and active and not needs_password_change
  )
$$;
create or replace function academy_private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select academy_private.is_active() and exists (
    select 1 from public.academy_profiles where id = (select auth.uid()) and role = 'admin'
  )
$$;
-- The client reads its own minimal account profile before displaying the MFA challenge.
-- Private content, plans, quota and personal records require the completed challenge.
do $$
declare target text;
begin
  foreach target in array array['academy_curriculum','academy_progress','academy_rewards',
      'academy_leaderboard','academy_plans','academy_tool_usage','academy_daily_claims'] loop
    execute format('drop policy if exists academy_session_verified on public.%I',target);
    execute format('create policy academy_session_verified on public.%I as restrictive for all to authenticated using ((select academy_private.session_verified())) with check ((select academy_private.session_verified()))',target);
  end loop;
end $$;
