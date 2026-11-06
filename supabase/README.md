# LiveryLab v10 · Supabase

Die bestehende Supabase-Instanz **LiveryLab** bleibt erhalten. Neue Datenbanktabellen sind ll_courses, ll_lesson_index und ll_lesson_content. Außerdem werden die bestehenden academy_profiles, academy_plans und academy_progress weiterverwendet.

Die Migrationen liverylab_v10_secure_course_catalog und liverylab_v10_more_programming_languages wurden bereits im verbundenen Projekt angewendet. Die zweite Migration hat zwölf neue Programmiersprachen mit jeweils sechs Lektionen ergänzt.

Row Level Security gilt auf allen Kurs- und Mitglieder-Tabellen. Das Inhalts-SELECT verlangt einen gültigen, aktiven, bei eingerichtetem 2FA-System vollständig verifizierten Account und den richtigen Tarif. Die bisherige gemeinsame Kurs-JSON-Tabelle academy_curriculum enthält ungated Inhalte und wurde daher für Web-Clients gesperrt, bleibt intern aber als Backup bestehen.

Kontoerstellung, Kennwortzurücksetzung, Kontosperre und Löschung erfolgen über die Supabase Edge Function admin-users. Nur Mitglieder mit Admin-Rolle dürfen diese Aktionen ausführen; die Serverfunktion kontrolliert die Identität und — bei aktivierter 2FA — den Authenticator-Faktor.

Die Oberfläche zeigt Free / Plus / Pro, intern heißen die vorhandenen Datenbank-Tarife free / pro / ultimate.

**Sicherheit:** Der öffentliche Web-Code darf nur einen Publishable Key enthalten. Die Service Role bleibt ausschließlich im Supabase Edge Function Environment. Die Rechte auf academy_profiles erlauben normalen Nutzern nur ein Update der Spalte display_name.

Der Supabase Security Advisor meldete bislang „Leaked Password Protection Disabled“. Für produktiven Betrieb in den Supabase Auth-Einstellungen prüfen und aktivieren. Bei neuen Tabellen erneut den Security Advisor ausführen.


## E-Mail-Konten und Benutzername (v10.1)

Die zusätzliche Supabase Edge Function \`academy-signin\` erlaubt das Einloggen mit einem einmalig festgelegten Benutzernamen. Sie führt **niemals** einen öffentlichen Benutzername→E-Mail-Lookup aus. Sie prüft Kontoaktivität und das Passwort über Supabase Auth und gibt nur bei erfolgreicher Anmeldung Token an denselben Client zurück. Die eingehenden Benutzernamen müssen dem Profil in \`academy_profiles\` zugeordnet sein; das Hinterlegen funktioniert für eingeloggte Mitglieder über die bestehende \`academy_set_username\`-RPC.

E-Mail-Login verwendet direkt den normalen Supabase Auth Password Grant. Konten, die per E-Mail über das Supabase Dashboard erstellt wurden, bleiben gültig. Die Admin-Edge-Function wurde um \`createEmail\` erweitert; Passwortreset funktioniert nun auch für E-Mail-Konten ohne Benutzernamen. Keine Geheimnisse im Client.

Die öffentliche Login-Function benötigt \`verify_jwt = false\` (vor Login kein User-JWT). Die Admin-Function bleibt JWT-geschützt. Rate Limits und Passwortschutz liegen weiterhin bei Supabase Auth; ein produktiver Launch sollte bruteforce-spezifische Monitoring- und Schutzmaßnahmen ergänzen.
