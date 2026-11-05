-- LiveryLab Academy: One-time Admin Bootstrap
-- 1. Apply schema.sql first.
-- 2. Invite yourself through Supabase Dashboard > Authentication > Users.
-- 3. Confirm/activate that account using the invitation link.
-- 4. Replace ADMIN_EMAIL_HIER_EINTRAGEN below with your OWN verified email.
-- 5. Run this one-time script in the Supabase SQL Editor.
-- Never write a password or service role key into SQL or GitHub.
do $bootstrap$
declare
  desired_email text := 'ADMIN_EMAIL_HIER_EINTRAGEN';
  target_user uuid;
begin
  if desired_email = 'ADMIN_EMAIL_HIER_EINTRAGEN' then
    raise exception 'Ersetze ADMIN_EMAIL_HIER_EINTRAGEN durch deine eigene verifizierte E-Mail.';
  end if;
  select id into target_user from auth.users
    where lower(email) = lower(desired_email)
      and email_confirmed_at is not null
    limit 1;
  if target_user is null then
    raise exception 'Admin-Account fehlt oder E-Mail ist noch nicht bestätigt.';
  end if;
  insert into public.academy_profiles (id,display_name,role,active)
    values(target_user,'NyxAtheris','admin',true)
    on conflict(id) do update
      set display_name='NyxAtheris',role='admin',active=true;
end $bootstrap$;
