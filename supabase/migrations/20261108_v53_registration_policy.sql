-- LiveryLab Academy: registration is manual by default and only changed server-side by the original project owner.
-- No public/authenticated grants. Existing users, profiles, lessons and progress stay untouched.
CREATE TABLE IF NOT EXISTS public.academy_registration_policy (
 id boolean PRIMARY KEY DEFAULT true CHECK (id),
 mode text NOT NULL DEFAULT 'approval' CHECK (mode IN ('approval','open')),
 updated_at timestamptz NOT NULL DEFAULT now(),
 updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.academy_registration_policy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.academy_registration_policy FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.academy_registration_policy TO service_role;
INSERT INTO public.academy_registration_policy(id,mode)
 VALUES(true,'approval') ON CONFLICT(id) DO NOTHING;
COMMENT ON TABLE public.academy_registration_policy IS 'Server-only registration gate. approval = owner accepts applicants, open = automatic student access; owner toggle via admin-users Edge Function.';
