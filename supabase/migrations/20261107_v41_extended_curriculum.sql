-- LiveryLab Academy · v41 curriculum extension, 2026-11-07
-- Keep existing course IDs, progress, videos, plans, authoring fields and original quizzes.
-- Idempotent: add separate real-content-based chapters and questions only once per lesson.
DO $academy$
DECLARE
 r record; p jsonb; parts jsonb; quizzes jsonb;
 title text; goal text; theory text; example text; task text; hint text; mistake text;
 extra text; review text; next_title text; mode_text text; test_text text;
 points text[]; steps text[]; rubric text[];
 n integer; shift integer; truth text; wrong1 text; wrong2 text; qtext text; explain text; topic text;
 choices jsonb; processed integer:=0;
BEGIN
 FOR r IN
  SELECT c.lesson_id,c.payload,i.title,i.course_id,i.position,
  (SELECT title FROM public.ll_lesson_index nxt WHERE nxt.course_id=i.course_id AND nxt.position>i.position ORDER BY nxt.position LIMIT 1) following
  FROM public.ll_lesson_content c JOIN public.ll_lesson_index i ON i.id=c.lesson_id
  WHERE jsonb_typeof(c.payload)='object' AND (c.payload->>'quiz_version') IS DISTINCT FROM '2'
 LOOP
  p:=r.payload;
  title:=coalesce(nullif(btrim(p->>'title'),''),r.title);
  goal:=coalesce(nullif(btrim(p->>'goal'),''),'Du kannst das Thema selbst erklären und anwenden.');
  theory:=coalesce(nullif(btrim(p->>'theory'),''),'In diesem Lernteil übst du '||title||' Schritt für Schritt.');
  example:=coalesce(p->>'example','');
  task:=coalesce(nullif(btrim(p->>'task'),''),'Erstelle ein eigenes Beispiel zum Thema '||title||'.');
  hint:=coalesce(nullif(btrim(p->>'hint'),''),'Prüfe die Schritte nacheinander und vergleiche das Ergebnis mit der Erklärung.');
  mistake:=coalesce(nullif(btrim(p->>'mistake'),''),'Verändere nicht mehrere Dinge gleichzeitig, ohne zwischendurch zu testen.');
  extra:=coalesce(nullif(btrim(p->>'extra'),''),'Verändere mindestens eine Eingabe, Einstellung oder einen Schritt und beobachte die Wirkung.');
  review:=coalesce(nullif(btrim(p->>'reviewPrompt'),''),'Wie würdest du '||title||' ohne Vorlage erklären und in einem eigenen Projekt anwenden?');
  next_title:=coalesce(r.following,'dein nächstes eigenes Projekt');
  points:=ARRAY[
   coalesce(nullif(btrim(p->'keyPoints'->>0),''),split_part(theory,'.',1)),
   coalesce(nullif(btrim(p->'keyPoints'->>1),''),hint),
   coalesce(nullif(btrim(p->'keyPoints'->>2),''),task)
  ];
  steps:=ARRAY[
   coalesce(nullif(btrim(p->'steps'->>0),''),'Lies das Beispiel und kennzeichne die wichtigen Begriffe.'),
   coalesce(nullif(btrim(p->'steps'->>1),''),'Wiederhole den Ablauf eigenständig und prüfe den ersten Zwischenstand.'),
   coalesce(nullif(btrim(p->'steps'->>2),''),'Verändere eine Eingabe, Einstellung oder Zeile und beobachte das Ergebnis.'),
   coalesce(nullif(btrim(p->'steps'->>3),''),'Vergleiche das Endergebnis mit dem Ziel und notiere eine Verbesserung.')
  ];
  rubric:=ARRAY[
   coalesce(nullif(btrim(p->'rubric'->>0),''),'Der eigene Ablauf ist verständlich und nachvollziehbar dokumentiert.'),
   coalesce(nullif(btrim(p->'rubric'->>1),''),'Ein normaler und ein veränderter Fall wurden überprüft.'),
   coalesce(nullif(btrim(p->'rubric'->>2),''),'Ein Fehler wurde erkannt, erklärt und gezielt verbessert.'),
   coalesce(nullif(btrim(p->'rubric'->>3),''),'Das Ergebnis wurde gespeichert und eine nächste Verbesserung notiert.')
  ];
  IF lower(coalesce(p->>'lang',''))='blender' THEN
   mode_text:='Öffne deine gespeicherte .blend-Datei. Prüfe im Viewport, welches Objekt oder welche Fläche ausgewählt ist, dokumentiere den Ausgangszustand und verändere zunächst nur einen Arbeitsschritt. Vergleiche danach den neuen Zustand mit der vorherigen Szene.';
   test_text:='Prüfe nicht nur die sichtbare Form, sondern – soweit für diese Lektion relevant – auch Maßstab, Topologie, Material, Beleuchtung und Export. Bewahre einen bearbeitbaren Projektstand auf und erkläre, welche Einstellung das Ergebnis verändert hat.';
  ELSIF lower(coalesce(p->>'lang','')) IN ('lua','python','javascript','typescript','java','csharp','cpp','c','go','rust','php','bash','ruby','kotlin','swift','dart') THEN
   mode_text:='Lies den Code erst in Ruhe und finde heraus, welche Werte, Funktionen oder Bedingungen die Wirkung bestimmen. Schreibe die entscheidende Stelle eigenständig nach und vergleiche den erwarteten Ablauf mit der tatsächlichen Ausführung. Achte auf Datentypen, Reihenfolge und Fehlermeldungen.';
   test_text:='Überprüfe einen normalen Fall, einen Grenzwert und einen absichtlich fehlerhaften Fall. Notiere die erwartete Ausgabe oder Wirkung, führe den Versuch aus und ändere nur eine Stelle, wenn das Ergebnis abweicht. So lernst du die Ursache statt eine zufällige Lösung.';
  ELSE
   mode_text:='Gehe den Aufbau Stück für Stück durch: Welche Eingaben, Elemente oder Einstellungen sind vorhanden, und was soll die Änderung bewirken? Erstelle erst einen kleinen nachvollziehbaren Stand und erweitere ihn nur, wenn das Zwischenergebnis stimmt.';
   test_text:='Prüfe die Struktur, einen normalen Anwendungsfall und eine bewusst veränderte Variante. Halte fest, woran du ein korrektes Ergebnis erkennst, und beschreibe einen Fehlerfall, den du vermeiden oder beheben kannst.';
  END IF;
  parts:=jsonb_build_array(
   jsonb_build_object('title','Einstieg und Lernziel',
    'paragraphs',jsonb_build_array(
     'Du beginnst mit „'||title||'“. In diesem ersten Teil geht es darum, den Zweck zu verstehen. Bevor du Code schreibst oder eine Szene veränderst, solltest du sagen können, welches Problem du mit diesem Thema löst.',
     'Das konkrete Lernziel lautet: '||goal,
     theory,
     'Versuche, die Erklärung mit eigenen Worten wiederzugeben. Was kannst du schon aus der vorherigen Lektion? Welche neue Fähigkeit kommt jetzt dazu? Die nächsten Teile verbinden die Begriffe mit einem Beispiel und einer eigenen Umsetzung.',
     'Ein guter Lernfortschritt besteht nicht nur darin, eine Musterlösung zu sehen. Wichtig ist, dass du vorhersagen kannst, was passieren wird, und anschließend kontrollierst, ob deine Vorhersage richtig war.'),
    'bullets',to_jsonb(ARRAY[points[1],points[2]]),
    'exercise','Erkläre in zwei Sätzen, wofür du „'||title||'“ verwenden würdest.'),
   jsonb_build_object('title','Begriffe und Zusammenhänge',
    'paragraphs',jsonb_build_array(
     'Begriffe helfen dir, das Thema „'||title||'“ zu verstehen, ohne jeden einzelnen Schritt auswendig zu lernen. Trenne deshalb den Fachbegriff, seine Bedeutung und seine praktische Wirkung voneinander.',
     'Der erste wichtige Zusammenhang: '||points[1],
     'Darauf baut der zweite Zusammenhang auf: '||points[2],
     'Achte außerdem auf diesen dritten Aspekt: '||points[3],
     'Überlege bei jedem Merksatz, welche Eingabe, Einstellung oder Bedingung daran beteiligt ist. Frage dich danach, welches Ergebnis du erwarten würdest, wenn du nur diese eine Sache änderst.',
     'Beziehe diese Merksätze wieder auf die ursprüngliche Erklärung: '||theory),
    'bullets',to_jsonb(points),
    'exercise','Beschreibe den Unterschied zwischen dem Ausgangszustand und dem Ergebnis bei „'||title||'“.'),
   jsonb_build_object('title','Beispiel gemeinsam verstehen',
    'paragraphs',jsonb_build_array(
     'Betrachte nun das vorhandene Beispiel zu „'||title||'“. Suche zuerst die Eingabe oder den Anfangszustand. Finde dann heraus, welche Zeile, Anweisung oder Bedienung die eigentliche Änderung auslöst.',
     'Überlege, was passieren soll, bevor du das Beispiel ausführst. Erkläre anschließend, welche Teile für das Ergebnis unbedingt nötig sind und welche Teile du selbst verändern könntest.',
     'Der Hintergrund dazu: '||theory,
     mode_text,
     'Wenn du eine Anweisung noch nicht verstehst, gehe zum zweiten Lernteil zurück. Nutze das Beispiel als Orientierung, aber versuche, den zentralen Schritt ohne Kopieren wiederherzustellen.',
     'Teste anschließend genau eine kleine Veränderung. Vergleiche bewusst die ursprüngliche Wirkung und die Wirkung deiner eigenen Variante.'),
    'code',example,'bullets',to_jsonb(ARRAY[steps[1],steps[2]]),
    'exercise','Verändere einen Bestandteil des Beispiels und erkläre vorher, was du als Ergebnis erwartest.'),
   jsonb_build_object('title','Begleitete Praxis in kleinen Schritten',
    'paragraphs',jsonb_build_array(
     'Jetzt wird das Gelernte selbst umgesetzt. Die Aufgabe lautet: '||task,
     'Arbeite langsam und in der vorgesehenen Reihenfolge. Erledige zuerst nur den ersten Schritt und überprüfe den Zwischenstand. Erst wenn er funktioniert, gehe zum nächsten Schritt über.',
     'Versuche, die Aufgabe eigenständig zu lösen. Das Beispiel dient als Hilfe, aber deine eigene Umsetzung soll zeigen, dass du den Zusammenhang verstanden hast.',
     'Falls eine Änderung nicht funktioniert, kehre zum letzten funktionierenden Stand zurück. Vergleiche die Schritte, statt mehrere Stellen gleichzeitig zu verändern.',
     'Prüfe am Ende, ob dein Ergebnis zum Lernziel passt: '||goal,
     'Notiere kurz, welcher Schritt leicht war und bei welchem Schritt du nachdenken oder nachlesen musstest. Genau dort lohnt sich eine zusätzliche Wiederholung.'),
    'bullets',to_jsonb(steps),'exercise',task),
   jsonb_build_object('title','Eigene Variante und Vertiefung',
    'paragraphs',jsonb_build_array(
     'Eine Vorlage nachzubauen ist ein guter Anfang. Wirklich verstanden hast du „'||title||'“, wenn du einen wichtigen Bestandteil eigenständig verändern und die Konsequenz erklären kannst.',
     'Deine weiterführende Übung lautet: '||extra,
     'Überlege, welche Ausgangsbedingung du bewusst ändern möchtest. Halte die alte Version fest und führe die Veränderung gezielt durch. Überprüfe danach, welche Wirkung sichtbar oder messbar ist.',
     'Trenne dabei das, was du erwartet hast, von dem, was tatsächlich passiert ist. Wenn beides unterschiedlich ist, suche zuerst nach einem Missverständnis im Ablauf oder in den Eingaben.',
     mode_text,
     'Beschreibe zum Schluss, was sich zwischen erster und zweiter Variante verändert hat. Erkläre die Ursache und überlege, wo du diese neue Fähigkeit später noch einsetzen kannst.'),
    'bullets',to_jsonb(ARRAY[steps[3],points[2]]),
    'exercise','Erstelle eine zweite eigenständige Variante der Aufgabe „'||title||'“ und vergleiche beide Ergebnisse.'),
   jsonb_build_object('title','Typische Fehler finden und beheben',
    'paragraphs',jsonb_build_array(
     'Fehler sind nützliche Hinweise. Bei „'||title||'“ hilft es, den ersten abweichenden Schritt zu finden, statt die ganze Aufgabe neu zu beginnen.',
     'Ein typischer Fehler oder ein wichtiger Warnhinweis lautet: '||mistake,
     'Nutze dazu diesen konkreten Tipp: '||hint,
     'Stelle den fehlerhaften Fall möglichst klein nach. Kontrolliere zunächst die Eingaben und den Ausgangszustand. Teste danach nur eine Korrektur und prüfe, ob das ursprüngliche Problem tatsächlich verschwunden ist.',
     test_text,
     'Fasse die Fehlersuche in eigenen Worten zusammen: Was war die Ursache? Welche Änderung hat geholfen? Wie kannst du künftig vermeiden, dass derselbe Fehler erneut entsteht?'),
    'bullets',to_jsonb(ARRAY[rubric[2],rubric[3]]),
    'exercise','Denke dir einen sicheren Fehlerfall aus und beschreibe, wie du ihn in „'||title||'“ erkennen und beheben würdest.'),
   jsonb_build_object('title','Ergebnis gründlich überprüfen',
    'paragraphs',jsonb_build_array(
     'Du bist fast am Ziel. Kontrolliere nun nicht nur, ob etwas funktioniert, sondern ob dein Ergebnis tatsächlich die geforderte Aufgabe erfüllt: '||task,
     'Beginne mit einem normalen Testfall. Verwende anschließend eine veränderte Eingabe oder Einstellung und prüfe einen Randfall. Schreibe jeweils auf, was du erwartest.',
     'Für eine gute Abgabe zählen nachvollziehbare Schritte: '||rubric[1],
     'Ein weiterer wichtiger Qualitätsmaßstab lautet: '||rubric[2],
     'Wenn du eine Abweichung entdeckt hast, beachte diese Anforderung: '||rubric[3],
     test_text,
     'Schließe mit einem kurzen Ergebnisbericht ab: Was hast du selbst erstellt, welchen Test hast du gemacht und welche Verbesserung würdest du bei einem zweiten Versuch umsetzen?'),
    'bullets',to_jsonb(rubric),
    'exercise','Plane einen Normalfall, einen Randfall und einen Fehlerfall zu „'||title||'“.'),
   jsonb_build_object('title','Wissen verbinden und Quizvorbereitung',
    'paragraphs',jsonb_build_array(
     'Du hast „'||title||'“ in mehreren Teilen bearbeitet: Bedeutung, Begriffe, Beispiel, eigene Übung, Variante, Fehlersuche und Ergebnisprüfung. Nun verbindest du diese Bausteine miteinander.',
     'Eine Frage zur Selbstkontrolle lautet: '||review,
     'Versuche, das Thema jemandem zu erklären, der diese Lektion noch nicht kennt. Verwende dein eigenes Beispiel, beschreibe mindestens eine absichtliche Änderung und benenne den wichtigsten typischen Fehler.',
     'Die fertige Arbeit sollte diesen Anspruch erfüllen: '||rubric[4],
     'Der nächste passende Schritt in diesem Kurs ist „'||next_title||'“. Überlege, wie du das gerade Gelernte dort wieder einsetzen kannst, damit deine neuen Fähigkeiten aufeinander aufbauen.',
     'Anschließend beantwortest du mehrere Quizfragen. Sie prüfen getrennt das Fachwissen, die praktische Aufgabe, die Fehlervermeidung, das Testen und die Übertragung. Lies die Fragen genau, statt nur eine Antwort auswendig zu lernen.'),
    'bullets',to_jsonb(ARRAY[goal,points[1],rubric[4]]),
    'exercise','Erkläre, was du bei „'||title||'“ gelernt hast und wie du es im nächsten Projekt anwenden könntest.')
  );
  quizzes:=jsonb_build_array(
   jsonb_build_object('topic','Grundwissen','question',coalesce(nullif(p->>'quiz',''),'Welche Aussage ist richtig?'),
    'options',p->'options','correct',coalesce((p->>'correct')::int,0),'explanation',left(theory,260))
  );
  FOR n IN 2..6 LOOP
   CASE n
    WHEN 2 THEN topic:='Begriffe';qtext:='Welche Kernaussage gehört zum Thema „'||title||'“?';
      truth:=points[1];wrong1:='Jede beliebige Aussage passt unabhängig von Bedeutung oder Zusammenhang.';wrong2:='Die Begriffe zu verstehen ist für dieses Thema grundsätzlich unnötig.';explain:=theory;
    WHEN 3 THEN topic:='Praxis';qtext:='Welche Aufgabe setzt „'||title||'“ praktisch um?';
      truth:=task;wrong1:='Die Aufgabe überspringen und nur die Überschrift lesen.';wrong2:='Etwas Beliebiges ohne Bezug zur Aufgabenstellung verändern.';explain:=task;
    WHEN 4 THEN topic:='Fehler vermeiden';qtext:='Welchen Hinweis solltest du bei „'||title||'“ beachten?';
      truth:=hint;wrong1:='Fehlermeldungen ignorieren und ohne Kontrolle abgeben.';wrong2:='Viele Dinge gleichzeitig verändern und nie vergleichen.';explain:=mistake;
    WHEN 5 THEN topic:='Ergebnis prüfen';qtext:='Woran erkennst du eine überprüfte Lösung zu „'||title||'“?';
      truth:=rubric[2];wrong1:='Allein daran, dass die Lösung lang ist – ohne einen einzigen Test.';wrong2:='Daran, dass du die Musterlösung kopiert und nichts selbst ausprobiert hast.';explain:=test_text;
    WHEN 6 THEN topic:='Vertiefung';qtext:='Welche Zusatzübung vertieft „'||title||'“?';
      truth:=extra;wrong1:='Die Übung unverändert lassen und nie selbst testen.';wrong2:='Jeden Lernschritt überspringen und keine Ergebnisse vergleichen.';explain:=review;
   END CASE;
   shift:=mod(r.position+n,3);
   IF shift=0 THEN choices:=jsonb_build_array(truth,wrong1,wrong2);
   ELSIF shift=1 THEN choices:=jsonb_build_array(wrong2,truth,wrong1);
   ELSE choices:=jsonb_build_array(wrong1,wrong2,truth);
   END IF;
   quizzes:=quizzes||jsonb_build_array(
    jsonb_build_object('topic',topic,'question',qtext,'options',choices,'correct',shift,'explanation',left(explain,260))
   );
  END LOOP;
  UPDATE public.ll_lesson_content
  SET payload=p||jsonb_build_object('sections',parts,'quiz_items',quizzes,'quiz_version',2)
  WHERE lesson_id=r.lesson_id;
  processed:=processed+1;
 END LOOP;
 RAISE NOTICE 'Expanded lessons: %',processed;
END
$academy$;
