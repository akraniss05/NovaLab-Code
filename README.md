# LiveryLab Academy 5.0 — Coding, FiveM, Music, Video & 3D

**Made with 💙 by NyxAtheris (LiveryLab)**

Website: https://akraniss05.github.io/liverylab-academy/

## Features
- Freie Kurswahl ohne Zeitplan; Benutzerkonto erforderlich.
- 48 Bereiche mit 432 Lektionen (aktuell in Supabase), inklusive FiveM-Adminpanel und Musikproduktion.
- **Code Lab:** Mehrspaltige IDE-Oberfläche, optional CodeMirror-Syntaxfarben, JavaScript, HTML, CSS, Python, Lua und editierbare weitere Sprachvorlagen. Alle Dateiänderungen bleiben lokal.  Mehrdateiprojekte auf diesem Gerät, ZIP-Export, isolierte HTML-Vorschau, JavaScript Worker, begrenzter Lua-Runner, optionale Pyodide-Python-Laufzeit.
- **Music Lab:** original synthetisierte Beats, 16-Step-Sequencer, Hardtekk/Techno/House/Hip-Hop/DnB, lokaler Bass-EQ, WAV-Export.
- **Designer Lab:** Browser-3D-Szene mit Three.js, Objektformen, Transformationen, Materialeinstellungen, JSON-Szenenspeicher und GLB-Export. Für vollwertiges Blender-Modelling muss Blender Desktop verwendet werden.
- **Video Lab:** Lokaler Clipimport, In/Out-Schnitt, Texteinblendung, Formate und Browser-Videoexport (nur bei unterstütztem MediaRecorder und Canvas.captureStream; sonst kein Versprechen eines MP4-Exports).
- **Roadmaps:** Fünf frei wählbare Lernpfade für Coding, FiveM, Musik, Blender und Games.
- **Einstellungen:** Menü mit drei Punkten, gruppierte Einstellungen, vier Farbthemen, fünf Akzentfarben, Emoji-Avatar, Cover, Schriftgröße, Layoutdichte und Reset.
- **Konto-Sicherheit:** Optionales Supabase-TOTP mit Authenticator-QR, Verifizierung beim Login und Faktorverwaltung.
- **Lernen:** Theorie, Praxisaufgaben, Tipps, Quiz, Notizen, freiwillige YouTube-Videos, Projektübungen.
- **Motivation:** Lern-XP, optionale serverbestätigte tägliche Rewards, freiwillige Rangliste nach Check-ins.
- **Freischaltungen:** Admin vergibt Free oder Pro pro Konto über eine separate RLS-geschützte Tabelle; serverseitige Tageslimits für vorgesehene Export- und Run-Aktionen. Lokal ausgeführte Browserfeatures können durch technisch versierte Nutzer nicht vollständig vor Veränderung des Clientcodes geschützt werden.
- **Konten:** Supabase Login, Administrator-Einladungen per E-Mail oder selbst erstellte Benutzernamen mit Startpasswort, gesicherte Kontodaten und Sitzungen.

## Laufzeiten und wichtige Grenzen
Die Browser-Sandbox ersetzt **kein** echtes Visual Studio Code, keinen Python-Server, keine FiveM-FXServer-Laufzeit, Blender Desktop und keine vollwertige DAW. Programmcode für C#, Java, Rust und echte FiveM-Natives muss in der jeweiligen offiziellen Umgebung getestet werden. Die Codeprüfung kontrolliert Struktur, nicht garantiertes Expertenkönnen. Der Beat-Sequencer ist eine Lernumgebung und ersetzt nicht die professionelle Mehrspurproduktion.

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

## Testen auf dem iPhone
1. Website nach einem neuen Release vollständig neu laden. Der Service Worker erneuert den statischen Cache.
2. Im Drei-Punkte-Menü Studio oder Lernwelt wählen.
3. In **Einstellungen → Konto & Sicherheit** die Authenticator-App einrichten und den sechsstelligen Code prüfen.
4. In **Einstellungen → Personalisieren** ein Farbschema, einen Avatar oder ein Cover wählen; **Zurücksetzen** wirkt nur auf die Darstellung.
5. Im Video Lab nur eigene, rechtmäßig verwendbare Clips bearbeiten. Auf iOS können MP4/WebM-Export oder Audiospur browserabhängig eingeschränkt sein.

Weitere Informationen: https://supabase.com/docs/guides/auth/auth-mfa/totp
