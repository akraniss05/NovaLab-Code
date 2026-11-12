-- Curriculum integrity and honest grading metadata. Existing lesson IDs, user progress and XP remain unchanged.
-- Missing language metadata in the original 84 introductory lessons.
UPDATE public.ll_lesson_content c
SET payload = jsonb_set(c.payload,'{lang}',to_jsonb(CASE WHEN i.course_id='coding-basics' THEN 'python' ELSE i.course_id END),true)
FROM public.ll_lesson_index i
WHERE i.id=c.lesson_id AND nullif(c.payload->>'lang','') IS NULL
 AND i.course_id IN ('coding-basics','c','dart','elixir','haskell','julia','perl','powershell','r','ruby','scala','swift','zig');

-- Without a verified reference answer or runtime, call these tasks documented guided practice,
-- not an automatically checked exact-solution exercise.
UPDATE public.ll_lesson_content
SET payload=jsonb_set(payload,'{practice_mode}',to_jsonb('guided'::text),true)
WHERE coalesce(payload->>'solution','')='' AND coalesce(payload->>'lang','') <> 'blender';

-- Update user-visible wording without changing stable IDs, URLs or compatibility keys.
UPDATE public.ll_lesson_index
SET title=regexp_replace(title,'Livery[- ]?Lab','NovaLab','gi'),
 summary=regexp_replace(summary,'Livery[- ]?Lab','NovaLab','gi'),
 chapter=regexp_replace(chapter,'Livery[- ]?Lab','NovaLab','gi')
WHERE concat_ws(' ',title,summary,chapter) ~* 'Livery[- ]?Lab';

UPDATE public.ll_lesson_content c
SET payload=(SELECT jsonb_object_agg(key,
 CASE WHEN key=ANY(ARRAY['title','theory','goal','task','solution','example','hint','quiz','options','quiz_items','example_notes','explanation_steps','keyPoints','mistake','steps','rubric','reviewPrompt','extra','sections','video_guide'])
 THEN regexp_replace(value::text,'Livery[- ]?Lab','NovaLab','gi')::jsonb
 ELSE value END)
 FROM jsonb_each(c.payload))
WHERE c.payload::text ~* 'Livery[- ]?Lab';

-- The older Lua expansion included 37 identical, non-topic-specific questions.
-- Use the first accurate explanation sentence for a lesson-specific answer; preserve the remaining questions.
WITH revised AS (
 SELECT i.id,i.title,c.payload,
   'Welche Aussage trifft auf „'||i.title||'“ in Lua zu?' AS question,
   trim(split_part(c.payload->'quiz_items'->0->>'explanation','.',1))||'.' AS fact
 FROM public.ll_lesson_index i JOIN public.ll_lesson_content c ON c.lesson_id=i.id
 WHERE i.course_id='lua' AND c.payload->'quiz_items'->0->>'question'='Was ist in diesem Thema besonders wichtig?'
)
UPDATE public.ll_lesson_content c
SET payload=c.payload || jsonb_build_object(
  'quiz',revised.question,
  'options',jsonb_build_array(revised.fact,'Lua überprüft alle Eingaben automatisch, daher sind keine Validierungen nötig.','Die Auswirkungen des Codes lassen sich unabhängig von Typen und Gültigkeitsbereich vorhersagen.'),
  'quiz_items',jsonb_set(jsonb_set(c.payload->'quiz_items','{0,question}',to_jsonb(revised.question),true),'{0,options}',jsonb_build_array(revised.fact,'Lua überprüft alle Eingaben automatisch, daher sind keine Validierungen nötig.','Die Auswirkungen des Codes lassen sich unabhängig von Typen und Gültigkeitsbereich vorhersagen.'),true),
  'quiz_version',GREATEST(coalesce((c.payload->>'quiz_version')::int,3),3)+1
 )
FROM revised WHERE c.lesson_id=revised.id AND length(revised.fact)>15;

-- Review repetitions explicitly as advanced practice; preserve IDs and chronological order.
WITH renames(id,title) AS (VALUES
 ('api-path-011','Pagination: Cursor und Seitenwechsel'),
 ('docker-path-009','Volumes: Datenpersistenz in der Praxis'),
 ('go-path-010','Goroutines: Synchronisation und Lebenszyklus'),
 ('react-path-002','Props: Datenfluss und unveränderliche Eingaben'),
 ('react-path-009','useEffect: Seiteneffekte gezielt einsetzen'),
 ('testing-path-005','Integrationstests: echte Komponenten kombinieren'),
 ('typescript-path-004','Generics: Typbeziehungen sicher gestalten')
)
UPDATE public.ll_lesson_index i SET title=r.title FROM renames r WHERE i.id=r.id;
WITH renames(id,title) AS (VALUES
 ('api-path-011','Pagination: Cursor und Seitenwechsel'),
 ('docker-path-009','Volumes: Datenpersistenz in der Praxis'),
 ('go-path-010','Goroutines: Synchronisation und Lebenszyklus'),
 ('react-path-002','Props: Datenfluss und unveränderliche Eingaben'),
 ('react-path-009','useEffect: Seiteneffekte gezielt einsetzen'),
 ('testing-path-005','Integrationstests: echte Komponenten kombinieren'),
 ('typescript-path-004','Generics: Typbeziehungen sicher gestalten')
)
UPDATE public.ll_lesson_content c SET payload=jsonb_set(c.payload,'{title}',to_jsonb(r.title),true)
FROM renames r WHERE c.lesson_id=r.id;
