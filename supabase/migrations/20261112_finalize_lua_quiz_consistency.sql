-- Repair five Lua quiz items whose function names contain dots (table.insert, string.format).
WITH fixes AS (
 SELECT i.id,i.title,
 'Welche Aussage trifft auf „'||i.title||'“ in Lua zu?' question,
 c.payload->>'theory' fact
 FROM public.ll_lesson_index i JOIN public.ll_lesson_content c ON c.lesson_id=i.id
 WHERE i.course_id='lua' AND c.payload->'quiz_items'->0->>'question'='Was ist in diesem Thema besonders wichtig?'
)
UPDATE public.ll_lesson_content c
SET payload=c.payload || jsonb_build_object(
 'quiz',f.question,
 'options',jsonb_build_array(f.fact,'Lua prüft alle Eingaben und Datentypen automatisch.','Das Ergebnis ist unabhängig von Funktionsaufrufen, Bedingungen und Indexwerten.'),
 'quiz_items',jsonb_set(jsonb_set(c.payload->'quiz_items','{0,question}',to_jsonb(f.question),true),'{0,options}',
 jsonb_build_array(f.fact,'Lua prüft alle Eingaben und Datentypen automatisch.','Das Ergebnis ist unabhängig von Funktionsaufrufen, Bedingungen und Indexwerten.'),true),
 'quiz_version',coalesce((c.payload->>'quiz_version')::int,3)+1)
FROM fixes f WHERE c.lesson_id=f.id AND length(f.fact)>15;

-- Keep checker regex in step with updated lesson solution and module name.
UPDATE public.ll_lesson_content
SET payload=jsonb_set(payload,'{checks}',
 regexp_replace((payload->'checks')::text,'LiveryLab','NovaLab','g')::jsonb,true)
WHERE lesson_id='nui-11' AND payload->'checks'::text IS NOT NULL
 AND payload->'checks'::text LIKE '%LiveryLab%';
