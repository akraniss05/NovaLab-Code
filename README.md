# LiveryLab Developer Academy 3.2
Made with 💙 by NyxAtheris (LiveryLab)

Öffentliche Website: https://akraniss05.github.io/liverylab-academy/

Die Academy bietet 33 Lernbereiche, 86 Kapitel und 304 Lektionen, einen mobilen Editor, Übungen, Design-Lab und Lernfortschritt – ohne Tagesplan.

## Hosting
Die Website wird mit GitHub Actions aus `site/` veröffentlicht. Die Dateien sind öffentlich. Der Workflow kontrolliert JS-Syntax und Kursinhalte vor dem Deploy.

## Auth / Backend
Die App läuft **ohne Supabase** als Gastversion. Für sichere Online-Konten sind die folgenden Schritte erforderlich:
1. Supabase-Projekt erstellen und verbinden.
2. SQL aus `supabase/schema.sql` im SQL Editor ausführen.
3. Eigenen Auth-Benutzer erstellen und im SQL Editor serverseitig einmalig als Admin markieren.
4. Öffentliche Supabase-Projekt-URL und **Publishable** Key (nicht Secret) in `site/config.js` eintragen.
5. `supabase/functions/admin-users/` mit Supabase CLI deployen und die benötigten Server-Secrets / Site URL sicher setzen.
6. In Supabase: Public Signups deaktivieren, HTTPS-Redirect URL für `https://akraniss05.github.io/liverylab-academy/` setzen; E-Mail-Einladungen einrichten.
7. Login, RLS, Admin-Einladung, Kontosperre, Datenexport und -löschung mit Testkonten prüfen.

Nur das Verbinden eines Supabase-Projekts gibt uns keine Erlaubnis, Service-Role-Keys im öffentlichen Repository zu speichern. Passwörter und Secrets gehören nicht in Frontend-Code.

## Datenschutz
Die Academy verwendet für den Gastfortschritt lokalen Browserspeicher; keine eigenen Werbe-Cookies. Für echte Benutzerkonten ist ein datenschutzkonformer Betrieb mit vollständiger Datenschutzerklärung und Impressum erforderlich. `site/privacy.html` ist nur eine technische Beschreibung.

## Grenzen
Die 304 Lektionen sind ein Lerngerüst, keine vollständige Expertenausbildung für alle Sprachen. In-Browser-Code-Ausführung ist begrenzt; echte FiveM-Natives brauchen einen eigenen FXServer. Der Livery-Designer erstellt 2D-Mockups, keine GTA-Dateiformate.
