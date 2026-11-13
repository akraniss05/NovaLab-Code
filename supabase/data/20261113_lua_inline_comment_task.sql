-- Align the lesson wording with both valid Lua line comment positions.
UPDATE public.ll_lesson_content
SET payload = payload || jsonb_build_object(
  'task', 'Gib mit print genau eine nicht leere Startmeldung deiner Wahl aus. Ergänze einen Lua-Zeilenkommentar, der den Zweck der Meldung erklärt. Der Kommentar kann auf einer eigenen Zeile oder hinter dem Aufruf stehen.',
  'hint', 'Ein Lua-Zeilenkommentar beginnt mit zwei Bindestrichen außerhalb des Textes. Er reicht bis zum Zeilenende.'
)
WHERE lesson_id = 'lua-02';
