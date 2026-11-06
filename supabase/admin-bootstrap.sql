-- LiveryLab Academy Admin Bootstrap (einmalig, nur Supabase SQL Editor)
-- Nur eine bereits bestätigte eigene Admin-E-Mail verwenden.
DO $$
DECLARE
  admin_email text := 'ADMIN_EMAIL_HIER_EINTRAGEN';
  admin_id uuid;
BEGIN
  IF admin_email = 'ADMIN_EMAIL_HIER_EINTRAGEN' THEN
    RAISE EXCEPTION 'Bitte die eigene bestätigte Admin-E-Mail eintragen';
  END IF;
  SELECT id INTO admin_id FROM auth.users
    WHERE lower(email) = lower(admin_email) AND email_confirmed_at IS NOT NULL
    LIMIT 1;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Bestätigtes Konto fehlt'; END IF;
  INSERT INTO public.academy_profiles(id,display_name,role,active)
    VALUES (admin_id,'NyxAtheris','admin',true)
    ON CONFLICT (id) DO UPDATE SET role='admin',active=true;
END $$;
