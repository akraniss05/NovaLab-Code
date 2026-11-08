-- LiveryLab Academy v47: ensure every quiz question is about the content it asks.
-- Original fact question/options remain intact. Follow-up questions use the actual
-- exercise and specific hint from the same lesson; unrelated goal/mistake fields
-- can no longer be mixed into their answer options.
-- Non-destructive; retains lesson IDs, progress, lessons and original quiz.
WITH lesson AS (
 SELECT c.lesson_id,i.title,i.position,c.payload AS p,
  COALESCE(NULLIF(btrim(c.payload->>'quiz'),''),'Welche Aussage ist richtig?') AS q,
  NULLIF(btrim(c.payload->>'task'),'') AS task,
  NULLIF(btrim(c.payload->>'hint'),'') AS hint
 FROM public.ll_lesson_content c
 JOIN public.ll_lesson_index i ON i.id=c.lesson_id
 WHERE jsonb_typeof(c.payload->'options')='array'
   AND jsonb_array_length(c.payload->'options')>=2
),
prepared AS (
 SELECT lesson_id,p,
 jsonb_build_object('topic','Fachwissen','question',q,'options',p->'options',
  'correct',(p->>'correct')::integer,'explanation',coalesce(left(p->>'theory',280),'')) AS basics,
 jsonb_build_object('topic','Praxis','question','Welche praktische Aufgabe gehört zu „'||title||'“?',
  'options',CASE mod(position,3)
   WHEN 0 THEN jsonb_build_array(task,'Bei „'||title||'“ nur die Überschrift lesen und keine Aufgabe bearbeiten.','Bei „'||title||'“ die Übung überspringen und ohne eigenes Beispiel weitermachen.')
   WHEN 1 THEN jsonb_build_array('Bei „'||title||'“ nur die Überschrift lesen und keine Aufgabe bearbeiten.',task,'Bei „'||title||'“ die Übung überspringen und ohne eigenes Beispiel weitermachen.')
   ELSE jsonb_build_array('Bei „'||title||'“ die Übung überspringen und ohne eigenes Beispiel weitermachen.','Bei „'||title||'“ nur die Überschrift lesen und keine Aufgabe bearbeiten.',task) END,
  'correct',mod(position,3),'explanation','Deine Aufgabe lautet: '||task) AS practice,
 CASE WHEN hint IS NOT NULL AND length(hint)>=17 THEN
 jsonb_build_object('topic','Tipp und Fehlersuche','question','Welcher Tipp hilft dir bei „'||title||'“?',
  'options',CASE mod(position+1,3)
   WHEN 0 THEN jsonb_build_array(hint,'Bei „'||title||'“ Fehlermeldungen ignorieren und nichts kontrollieren.','Bei „'||title||'“ wahllos alles verändern, ohne das Ergebnis zu prüfen.')
   WHEN 1 THEN jsonb_build_array('Bei „'||title||'“ Fehlermeldungen ignorieren und nichts kontrollieren.',hint,'Bei „'||title||'“ wahllos alles verändern, ohne das Ergebnis zu prüfen.')
   ELSE jsonb_build_array('Bei „'||title||'“ wahllos alles verändern, ohne das Ergebnis zu prüfen.','Bei „'||title||'“ Fehlermeldungen ignorieren und nichts kontrollieren.',hint) END,
  'correct',mod(position+1,3),'explanation','Beachte: '||hint)
 ELSE NULL END AS tip
 FROM lesson
 WHERE task IS NOT NULL
),
bank AS (
 SELECT lesson_id,p,CASE WHEN tip IS NULL
  THEN jsonb_build_array(basics,practice)
  ELSE jsonb_build_array(basics,practice,tip) END AS questions
 FROM prepared
)
UPDATE public.ll_lesson_content AS content
SET payload=(content.payload-'quiz_items'-'quiz_version')
 ||jsonb_build_object('quiz_items',bank.questions,'quiz_version',3)
FROM bank
WHERE content.lesson_id=bank.lesson_id
  AND content.payload->>'quiz_version' IS DISTINCT FROM '3';
