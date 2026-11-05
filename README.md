# LiveryLab Academy 4.1 — Developer & Music Producer

**Made with 💙 by NyxAtheris (LiveryLab)**

Website: https://akraniss05.github.io/liverylab-academy/

## Features
- Freie Kurswahl ohne Zeitplan; Benutzerkonto erforderlich.
- 44 Bereiche mit 384 Lektionen (aktuell in Supabase), inklusive FiveM-Adminpanel und Musikproduktion.
- **Code Studio:** Mehrdateiprojekte auf diesem Gerät, ZIP-Export, isolierte HTML-Vorschau, JavaScript Worker, begrenzter Lua-Runner, optionale Pyodide-Python-Laufzeit.
- **Music Studio:** original synthetisierte Beats, 16-Step-Sequencer, Hardtekk/Techno/House/Hip-Hop/DnB, lokaler Bass-EQ, WAV-Export.
- **Lernen:** Theorie, Praxisaufgaben, Tipps, Quiz, Notizen, freiwillige YouTube-Videos, Projektübungen.
- **Motivation:** Lern-XP, optionale serverbestätigte tägliche Rewards, freiwillige Rangliste nach Check-ins.
- **Konten:** Supabase Login, Administrator-Einladungen per E-Mail oder selbst erstellte Benutzernamen mit Startpasswort, gesicherte Kontodaten und Sitzungen.

## Laufzeiten und wichtige Grenzen
Die Browser-Sandbox ersetzt **kein** echtes Visual Studio Code, keinen Python-Server, keine FiveM-FXServer-Laufzeit und keine vollwertige DAW. Programmcode für C#, Java, Rust und echte FiveM-Natives muss in der jeweiligen offiziellen Umgebung getestet werden. Die Codeprüfung kontrolliert Struktur, nicht garantiertes Expertenkönnen. Der Beat-Sequencer ist eine Lernumgebung und ersetzt nicht die professionelle Mehrspurproduktion.

## Datenspeicherung
Persönliche Lernfortschritte und Notizen lassen sich mit Supabase synchronisieren. Die eigene IDE-Projektdateien sind bewusst **lokal** und werden nicht über `academy_progress` hochgeladen. Für Backups Projekt ZIP auf das eigene Gerät exportieren; Browserdaten können beim Löschen der Website-Daten verloren gehen.

Server-Check-ins werden höchstens einmal pro UTC-Tag vergeben. Die Rangliste ist freiwillig und wertet nur diese bestätigten Check-in-Punkte aus. Sie ist ausdrücklich kein professionelles Leistungs-Ranking.

## Nutzerverwaltung
Als Administrator im Profil → Administration ein neues **Benutzername/Passwort-Konto** mit einem einmaligen Passwort (mind. 14 Zeichen) anlegen. Der Benutzer muss beim ersten Login das Passwort ändern. Keine E-Mail-Zustellung erforderlich; ein Passwort-Reset ohne E-Mail muss über den Administrator erfolgen. Startpasswörter nicht in GitHub, Chat-Logs oder Screenshots hinterlegen.

## Sicherheit und Veröffentlichung
Die statische Oberfläche wird über GitHub Pages bereitgestellt; das Curriculum wird via RLS aus Supabase geladen. **Die öffentliche Git-Historie älterer Versionen kann weiterhin frühere Kurskopien enthalten.** Für vollständigen Schutz des Quellcodes ist ein privates Repository oder anderes Hosting erforderlich. Admin-Berechtigungen werden serverseitig geprüft. Secret/API-Service-Role-Schlüssel gehören niemals in GitHub Pages.

## Domain
Die aktuelle funktionierende Adresse ist die GitHub-Pages-URL. Eine eigene URL wie `dev.livery-lab.app` ist erst möglich, wenn du diese Domain kontrollierst und in DNS den passenden CNAME setzt. Fantasie-Domains sind nicht automatisch registriert.

## Rechtliches
Vor dem Einladen anderer Personen: Impressum, eine vollständige Datenschutzerklärung und die relevanten Datenschutzverträge ergänzen. Die vorhandene `site/privacy.html` ist ein technischer Entwurf.

## Lernqualität
Jede Lektion enthält nun zusätzlich vier Abnahmekriterien für ein eigenständiges Ergebnis. Bei FiveM sind negative Berechtigungstests auf einem FXServer Pflicht, bei Musik originale A/B-Mixes und WAV-Exporte. Die neuen Masterclasses schließen mit größeren Projekten ab.

## Lernziele
Der Kurs vermittelt Grundlagen und fortgeschrittene Konzepte; für echten Expertenstatus sind wiederholte realistische Projekte, reale Fehleranalysen, Feedback und Praxiserfahrung notwendig.
