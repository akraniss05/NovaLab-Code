-- Final curriculum consistency corrections found by post-migration verification.
UPDATE public.ll_lesson_content
SET payload=jsonb_set(payload,'{starter}',
 to_jsonb(regexp_replace(payload->>'starter','Livery[- ]?Lab','NovaLab','gi')),true)
WHERE coalesce(payload->>'starter','') ~* 'Livery[- ]?Lab';

WITH fixed AS(
 SELECT c.lesson_id,i.title,
  'Welche Aussage trifft auf „'||i.title||'“ in Lua zu?' question,
  trim(split_part(c.payload->>'theory','.',1))||'.' fact
 FROM public.ll_lesson_content c JOIN public.ll_lesson_index i ON i.id=c.lesson_id
 WHERE c.payload->'quiz_items'->0->>'question'='Was ist in diesem Thema besonders wichtig?'
 AND i.course_id='lua'
)
UPDATE public.ll_lesson_content c
SET payload=c.payload || jsonb_build_object(
 'quiz',f.question,
 'options',jsonb_build_array(f.fact,'Lua wandelt jede Eingabe ohne Fehlerprüfung in den richtigen Datentyp um.','Alle Programme funktionieren unabhängig vom verwendeten Code und seinen Bedingungen.'),
 'quiz_items',jsonb_set(jsonb_set(c.payload->'quiz_items','{0,question}',to_jsonb(f.question),true),'{0,options}',
 jsonb_build_array(f.fact,'Lua wandelt jede Eingabe ohne Fehlerprüfung in den richtigen Datentyp um.','Alle Programme funktionieren unabhängig vom verwendeten Code und seinen Bedingungen.'),true),
 'quiz_version',coalesce((c.payload->>'quiz_version')::int,3)+1)
FROM fixed f WHERE c.lesson_id=f.lesson_id AND length(f.fact)>15;
