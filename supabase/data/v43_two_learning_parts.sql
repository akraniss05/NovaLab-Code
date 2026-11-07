-- Academy v43: two concise, sequential parts instead of eight.
-- Keeps all lesson IDs, original theory, examples, assignments and all six quiz questions.
-- Idempotent: only reduces records that still have more than two sections.
WITH source AS (
 SELECT lesson_id,payload AS p,
        COALESCE(NULLIF(btrim(payload->>'title'),''),i.title,'dieses Thema') AS title,
        COALESCE(NULLIF(btrim(payload->>'goal'),''),'Du kannst das Thema selbstständig erklären und anwenden.') AS goal,
        COALESCE(NULLIF(btrim(payload->>'theory'),''),'Lerne das Thema schrittweise kennen und überprüfe das Ergebnis.') AS theory,
        COALESCE(NULLIF(btrim(payload->>'task'),''),'Erstelle eine kleine eigene Übung zum Thema.') AS task,
        COALESCE(NULLIF(btrim(payload->>'hint'),''),'Gehe die Schritte einzeln durch und vergleiche die Ergebnisse.') AS hint,
        COALESCE(NULLIF(btrim(payload->>'mistake'),''),'Ändere nur einen Wert oder Arbeitsschritt nach dem anderen.') AS mistake,
        COALESCE(NULLIF(btrim(payload->>'extra'),''),'Verändere eine Eingabe oder einen Arbeitsschritt und prüfe das Ergebnis.') AS extra
 FROM public.ll_lesson_content c
 JOIN public.ll_lesson_index i ON i.id=c.lesson_id
 WHERE jsonb_typeof(c.payload->'sections')='array'
 AND jsonb_array_length(c.payload->'sections')>2
),
revision AS (
 SELECT lesson_id,p,
 jsonb_build_array(
  jsonb_build_object(
   'title','1 · Verstehen & Beispiel',
   'paragraphs',jsonb_build_array(
      'Du lernst jetzt „'||title||'“. Ziel: '||goal,
      theory,
      'Lies die Erklärung in Ruhe und überlege, wie das Beispiel funktioniert. Versuche zuerst zu verstehen, welche Eingabe, welcher Wert oder welcher Arbeitsschritt das Ergebnis bestimmt.',
      'Schau dir das Beispiel an und sage vorher, was du als Ergebnis erwartest. Danach kannst du einen einzelnen Wert oder Arbeitsschritt verändern und vergleichen.'
   ),
   'bullets',coalesce(nullif(p->'keyPoints','null'::jsonb),'[]'::jsonb),
   'code',coalesce(p->>'example',''),
   'exercise','Erkläre das Beispiel zu „'||title||'“ in eigenen Worten und nenne die wichtigste Aussage.'
  ),
  jsonb_build_object(
   'title','2 · Ausprobieren & festigen',
   'paragraphs',jsonb_build_array(
      'Jetzt wendest du das Gelernte an. Deine Aufgabe: '||task,
      'Arbeite in kleinen Schritten und kontrolliere nach jeder Änderung, ob das Zwischenergebnis zum Lernziel passt. Nutze den Code-Editor beziehungsweise deine Blender-Szene für die eigene Umsetzung.',
      'Falls du nicht weiterkommst: '||hint,
      'Typischer Fehler, auf den du achten solltest: '||mistake,
      'Wenn die Grundaufgabe klappt, probiere diese eigene Variante: '||extra,
      'Prüfe dein Ergebnis mit einem normalen und einem veränderten Fall. Danach kannst du die Quizfragen beantworten.'
   ),
   'bullets',coalesce(nullif(p->'steps','null'::jsonb),'[]'::jsonb),
   'exercise',task
  )
 ) AS parts
 FROM source
)
UPDATE public.ll_lesson_content lc
SET payload=(lc.payload-'sections')||jsonb_build_object('sections',revision.parts)
FROM revision WHERE lc.lesson_id=revision.lesson_id;
