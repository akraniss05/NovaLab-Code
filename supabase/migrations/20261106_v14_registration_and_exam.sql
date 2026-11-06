-- LiveryLab Academy v14 – replayable registration approval and exam RPC migration.
-- Run as project owner, AFTER the baseline Academy schema and v13 membership setup.
-- No service-role credentials belong in public GitHub Pages files.
BEGIN;
ALTER TABLE public.academy_profiles ADD COLUMN IF NOT EXISTS access_status text;
UPDATE public.academy_profiles
 SET access_status=CASE WHEN active THEN 'approved' ELSE 'blocked' END
 WHERE access_status IS NULL;
ALTER TABLE public.academy_profiles ALTER COLUMN access_status SET DEFAULT 'approved';
ALTER TABLE public.academy_profiles ALTER COLUMN access_status SET NOT NULL;
ALTER TABLE public.academy_profiles DROP CONSTRAINT IF EXISTS academy_profile_access_status_valid;
ALTER TABLE public.academy_profiles ADD CONSTRAINT academy_profile_access_status_valid
 CHECK(access_status IN ('pending','approved','blocked'));
CREATE INDEX IF NOT EXISTS academy_profiles_pending_idx
 ON public.academy_profiles(created_at) WHERE access_status='pending';

-- Only trusted app_metadata (populated by server-side admin tooling) may bypass pending.
-- User-supplied user_metadata is allowed solely for display name and username, never admin role.
CREATE OR REPLACE FUNCTION academy_private.initialize_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE managed boolean; requested_username text; requested_name text;
BEGIN
 IF tg_op='INSERT' THEN
  managed:=COALESCE(new.raw_app_meta_data->>'academy_managed','')='true';
  requested_username:=lower(btrim(COALESCE(new.raw_user_meta_data->>'username',
                                             new.raw_app_meta_data->>'academy_username','')));
  IF requested_username !~ '^[a-z][a-z0-9_]{2,23}$' THEN requested_username:=NULL; END IF;
  requested_name:=btrim(COALESCE(NULLIF(new.raw_user_meta_data->>'name',''),
                               requested_username,'Developer'));
  IF char_length(requested_name)<2 THEN requested_name:='Developer'; END IF;
  INSERT INTO public.academy_profiles
   (id,display_name,username,role,active,access_status,needs_password_change)
  VALUES(new.id,left(requested_name,40),requested_username,'student',managed,
         CASE WHEN managed THEN 'approved' ELSE 'pending' END,false)
  ON CONFLICT(id) DO NOTHING;
 END IF;
 RETURN new;
END $fn$;
-- Removes prior automatic admin promotion during email confirmation.
CREATE OR REPLACE FUNCTION academy_private.is_active()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $fn$
 SELECT academy_private.session_verified() AND EXISTS(
 SELECT 1 FROM public.academy_profiles
 WHERE id=(SELECT auth.uid()) AND active AND access_status='approved'
 AND NOT needs_password_change
 ) $fn$;

CREATE OR REPLACE FUNCTION academy_private.exam_questions(p_course text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE result jsonb; total int; completed int;
BEGIN
 IF NOT academy_private.is_active() OR NOT academy_private.course_allowed(p_course) THEN
  RAISE EXCEPTION 'Account or course not authorized';
 END IF;
 SELECT count(*) INTO total FROM public.ll_lesson_index
 WHERE course_id=p_course AND academy_private.lesson_entitled(id);
 SELECT count(*) INTO completed FROM public.ll_lesson_index li
 WHERE li.course_id=p_course AND academy_private.lesson_entitled(li.id)
 AND EXISTS(
  SELECT 1 FROM public.academy_progress pr
  WHERE pr.user_id=auth.uid() AND pr.key='liverylab-v10'
  AND pr.payload->'done' ? li.id
 );
 IF total<1 OR total<>completed THEN
  RAISE EXCEPTION 'Kurs bitte vor der Abschlussprüfung beenden';
 END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object('lesson_id',lesson_id,
   'payload',jsonb_build_object('quiz',payload->'quiz',
     'options',payload->'options','correct',payload->'correct'))),'[]'::jsonb)
 INTO result FROM (
  SELECT c.lesson_id,c.payload
  FROM public.ll_lesson_content c JOIN public.ll_lesson_index li
    ON li.id=c.lesson_id
  WHERE li.course_id=p_course AND academy_private.lesson_entitled(li.id)
  AND jsonb_typeof(c.payload->'options')='array'
  AND jsonb_array_length(c.payload->'options')>=2
  ORDER BY random() LIMIT 20
 ) questions;
 RETURN result;
END $fn$;
CREATE OR REPLACE FUNCTION public.academy_exam_questions(p_course text)
RETURNS jsonb LANGUAGE sql SET search_path TO ''
AS $fn$ SELECT academy_private.exam_questions(p_course) $fn$;

REVOKE EXECUTE ON FUNCTION academy_private.exam_questions(text),
 public.academy_exam_questions(text) FROM public,anon;
GRANT EXECUTE ON FUNCTION academy_private.exam_questions(text),
 public.academy_exam_questions(text) TO authenticated;
GRANT UPDATE(display_name) ON public.academy_profiles TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
