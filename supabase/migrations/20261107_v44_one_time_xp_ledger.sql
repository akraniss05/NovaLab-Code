-- LiveryLab Academy v44: permanent, auditable one-time XP per lesson.
-- Lesson practice can be reset independently; reward grants cannot be reset by clients.
CREATE TABLE IF NOT EXISTS public.academy_lesson_xp_awards (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.ll_lesson_index(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 30 CHECK (xp = 30),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
ALTER TABLE public.academy_lesson_xp_awards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.academy_lesson_xp_awards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.academy_lesson_xp_awards TO authenticated;
DROP POLICY IF EXISTS academy_lesson_xp_awards_own_select ON public.academy_lesson_xp_awards;
CREATE POLICY academy_lesson_xp_awards_own_select ON public.academy_lesson_xp_awards
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) AND (SELECT academy_private.is_active()));

-- Preserve every previously completed lesson. Existing rewards remain valid after resets.
INSERT INTO public.academy_lesson_xp_awards (user_id, lesson_id, xp, awarded_at)
SELECT DISTINCT p.user_id, idx.id, 30,
  CASE
    WHEN (p.payload->'completedAt'->>idx.id) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'
    THEN COALESCE((p.payload->'completedAt'->>idx.id)::timestamptz,p.updated_at)
    ELSE p.updated_at
  END
FROM public.academy_progress p
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE WHEN jsonb_typeof(p.payload->'done')='array'
    THEN p.payload->'done' ELSE '[]'::jsonb END
) done(lesson_id)
JOIN public.ll_lesson_index idx ON idx.id=done.lesson_id
WHERE p.key='liverylab-v10'
ON CONFLICT (user_id,lesson_id) DO NOTHING;

-- Privileged operation: authenticated user can claim only their own, actually
-- completed and checked lesson. Primary key prevents duplicates under races.
CREATE OR REPLACE FUNCTION academy_private.claim_lesson_xp(p_lesson text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  who uuid := auth.uid();
  inserted_at timestamptz;
  existing_at timestamptz;
  total integer;
BEGIN
  IF who IS NULL OR NOT academy_private.is_active() THEN
    RAISE EXCEPTION 'Aktives Konto erforderlich';
  END IF;
  IF p_lesson IS NULL OR length(p_lesson) NOT BETWEEN 2 AND 120
     OR p_lesson !~ '^[a-zA-Z0-9._:-]+$' THEN
    RAISE EXCEPTION 'Ungültige Lektion';
  END IF;
  IF NOT academy_private.lesson_entitled(p_lesson) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Lektion';
  END IF;

  -- A repeated lesson can never award again, even when progress is reset.
  SELECT awarded_at INTO existing_at
  FROM public.academy_lesson_xp_awards
  WHERE user_id=who AND lesson_id=p_lesson;
  IF existing_at IS NOT NULL THEN
    SELECT coalesce(sum(xp),0)::int INTO total
    FROM public.academy_lesson_xp_awards WHERE user_id=who;
    RETURN jsonb_build_object(
      'awarded',false,'lesson_id',p_lesson,'xp',0,
      'total_xp',total,'awarded_at',existing_at);
  END IF;

  -- This endpoint is not a general-purpose XP grant. The lesson must already
  -- be saved as completed with video and verified practice in own progress.
  IF NOT EXISTS (
    SELECT 1 FROM public.academy_progress p
    WHERE p.user_id=who AND p.key='liverylab-v10'
      AND p.payload->'done' @> jsonb_build_array(p_lesson)
      AND p.payload->'watched' @> jsonb_build_array(p_lesson)
      AND p.payload->'verifiedPractice' @> jsonb_build_array(p_lesson)
  ) THEN
    RAISE EXCEPTION 'Lektion, Video und Praxis zuerst abschließen';
  END IF;

  INSERT INTO public.academy_lesson_xp_awards (user_id,lesson_id,xp)
  VALUES (who,p_lesson,30)
  ON CONFLICT (user_id,lesson_id) DO NOTHING
  RETURNING awarded_at INTO inserted_at;

  SELECT awarded_at INTO existing_at
  FROM public.academy_lesson_xp_awards WHERE user_id=who AND lesson_id=p_lesson;
  SELECT coalesce(sum(xp),0)::int INTO total
  FROM public.academy_lesson_xp_awards WHERE user_id=who;
  RETURN jsonb_build_object(
    'awarded',inserted_at IS NOT NULL,
    'lesson_id',p_lesson,
    'xp',CASE WHEN inserted_at IS NOT NULL THEN 30 ELSE 0 END,
    'total_xp',total,'awarded_at',existing_at);
END;
$fn$;

REVOKE ALL ON FUNCTION academy_private.claim_lesson_xp(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION academy_private.claim_lesson_xp(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.academy_claim_lesson_xp(p_lesson text)
RETURNS jsonb LANGUAGE sql SET search_path = ''
AS $fn$
  SELECT academy_private.claim_lesson_xp(p_lesson)
$fn$;
REVOKE ALL ON FUNCTION public.academy_claim_lesson_xp(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.academy_claim_lesson_xp(text) TO authenticated;
