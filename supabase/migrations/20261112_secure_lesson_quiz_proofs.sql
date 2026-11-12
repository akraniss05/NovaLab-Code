-- Store quiz proof outside user-editable academy_progress JSON.
-- Existing completions are grandfathered once, without changing any XP ledger rows.
CREATE TABLE IF NOT EXISTS academy_private.academy_lesson_quiz_receipts(
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 lesson_id text NOT NULL REFERENCES public.ll_lesson_index(id) ON DELETE CASCADE,
 quiz_version integer NOT NULL,
 verified_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,lesson_id)
);
ALTER TABLE academy_private.academy_lesson_quiz_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON academy_private.academy_lesson_quiz_receipts FROM anon,authenticated;
INSERT INTO academy_private.academy_lesson_quiz_receipts(user_id,lesson_id,quiz_version)
SELECT pr.user_id,lesson.lesson_id,coalesce((lesson.payload->>'quiz_version')::int,1)
FROM public.academy_progress pr
CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(pr.payload->'done')='array'
 THEN pr.payload->'done' ELSE '[]'::jsonb END) completed(lesson_id)
JOIN public.ll_lesson_content lesson ON lesson.lesson_id=completed.lesson_id
WHERE pr.key='liverylab-v10'
ON CONFLICT (user_id,lesson_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.academy_verify_lesson_quiz(p_lesson text,p_answers integer[])
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $quiz$
DECLARE
 who uuid:=auth.uid();
 body jsonb;
 bank jsonb;
 version integer;
 n integer;
 i integer;
 correct integer;
BEGIN
 IF who IS NULL OR NOT academy_private.is_active() THEN
  RAISE EXCEPTION 'Aktiver Login erforderlich';
 END IF;
 IF p_lesson IS NULL OR length(p_lesson) NOT BETWEEN 2 AND 120 OR
  p_lesson !~ '^[a-zA-Z0-9._:-]+$' OR NOT academy_private.lesson_entitled(p_lesson) THEN
  RAISE EXCEPTION 'Lektion nicht verfügbar';
 END IF;
 SELECT payload INTO body FROM public.ll_lesson_content WHERE lesson_id=p_lesson;
 IF body IS NULL THEN RAISE EXCEPTION 'Aufgaben nicht gefunden'; END IF;
 version:=coalesce((body->>'quiz_version')::integer,1);
 bank:=body->'quiz_items';
 IF version>=3 AND jsonb_typeof(bank)='array' AND jsonb_array_length(bank)>=2 THEN
  n:=least(3,jsonb_array_length(bank));
  IF p_answers IS NULL OR cardinality(p_answers)<>n THEN
   RETURN jsonb_build_object('ok',false,'error','Bitte alle Quizfragen erneut beantworten');
  END IF;
  FOR i IN 0..n-1 LOOP
   correct:=(bank->i->>'correct')::integer;
   IF correct IS NULL OR p_answers[i+1] IS DISTINCT FROM correct THEN
    RETURN jsonb_build_object('ok',false,'error','Nicht alle Quizfragen wurden korrekt beantwortet');
   END IF;
  END LOOP;
 ELSE
  IF p_answers IS NULL OR cardinality(p_answers)<>1 OR
    p_answers[1] IS DISTINCT FROM (body->>'correct')::integer THEN
    RETURN jsonb_build_object('ok',false,'error','Die Quizfrage ist noch nicht korrekt beantwortet');
  END IF;
 END IF;
 INSERT INTO academy_private.academy_lesson_quiz_receipts(user_id,lesson_id,quiz_version,verified_at)
 VALUES(who,p_lesson,version,now())
 ON CONFLICT (user_id,lesson_id) DO UPDATE
 SET quiz_version=excluded.quiz_version,verified_at=excluded.verified_at;
 RETURN jsonb_build_object('ok',true,'lesson_id',p_lesson,'quiz_version',version);
END
$quiz$;
REVOKE ALL ON FUNCTION public.academy_verify_lesson_quiz(text,integer[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.academy_verify_lesson_quiz(text,integer[]) TO authenticated;

CREATE OR REPLACE FUNCTION academy_private.claim_lesson_xp(p_lesson text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  -- Progress JSON is user-editable; independently verify a server-issued quiz receipt.
  IF NOT EXISTS(
    SELECT 1 FROM academy_private.academy_lesson_quiz_receipts receipt
    JOIN public.ll_lesson_content lesson ON lesson.lesson_id=receipt.lesson_id
    WHERE receipt.user_id=who AND receipt.lesson_id=p_lesson
      AND receipt.quiz_version=coalesce((lesson.payload->>'quiz_version')::integer,1)
  ) THEN
    RAISE EXCEPTION 'Quiz bitte vollständig und serverseitig bestätigen';
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
$function$
;
