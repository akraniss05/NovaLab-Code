-- LiveryLab Academy v16: rate limiting for server-only public signup fallback.
-- This migration has also been applied to the live project.
begin;
create table if not exists academy_private.academy_signup_attempts (
 id bigint generated always as identity primary key,
 attempted_at timestamptz not null default now(),
 ip_hash text not null,
 email_hash text not null
);
create index if not exists academy_signup_attempts_time_idx
 on academy_private.academy_signup_attempts(attempted_at desc);
create index if not exists academy_signup_attempts_ip_idx
 on academy_private.academy_signup_attempts(ip_hash,attempted_at desc);
create index if not exists academy_signup_attempts_email_idx
 on academy_private.academy_signup_attempts(email_hash,attempted_at desc);
revoke all on academy_private.academy_signup_attempts from public,anon,authenticated;
create or replace function public.academy_signup_rate_limit(p_ip_hash text,p_email_hash text)
returns boolean
language plpgsql security definer set search_path to ''
as $fn$
declare ip_count int;email_count int;total_count int;
begin
 if p_ip_hash is null or p_email_hash is null
  or p_ip_hash !~ '^[a-f0-9]{64}$' or p_email_hash !~ '^[a-f0-9]{64}$'
 then return false;end if;
 perform pg_catalog.pg_advisory_xact_lock(556706141);
 select count(*) into ip_count from academy_private.academy_signup_attempts
 where ip_hash=p_ip_hash and attempted_at > now()-interval '1 hour';
 select count(*) into email_count from academy_private.academy_signup_attempts
 where email_hash=p_email_hash and attempted_at > now()-interval '24 hours';
 select count(*) into total_count from academy_private.academy_signup_attempts
 where attempted_at > now()-interval '24 hours';
 if ip_count>=8 or email_count>=3 or total_count>=100 then return false;end if;
 insert into academy_private.academy_signup_attempts(ip_hash,email_hash)
 values(p_ip_hash,p_email_hash);
 return true;
end $fn$;
revoke all on function public.academy_signup_rate_limit(text,text) from public,anon,authenticated;
grant execute on function public.academy_signup_rate_limit(text,text) to service_role;
notify pgrst,'reload schema';
commit;