# NyxAtheris – Admin-Einrichtung

**Stand:** Die Website läuft auf GitHub Pages. Das Supabase-Backend ist als Code vorhanden, aber **noch nicht in der Supabase-Datenbank installiert**. Diese Anleitung ist ausdrücklich keine Bestätigung eines fertig angelegten Kontos.

## Vor dem ersten Login

1. In Supabase **Project Settings → API Keys** den öffentlichen Publishable Key ermitteln. Den **Secret / service_role** Key niemals in ChatGPT, `site/config.js` oder GitHub speichern.
2. `supabase/schema.sql` im **SQL Editor** des Projekts ausführen. Diese Tabellen schützen personenbezogene Daten mit RLS-Policies.
3. Unter **Authentication → URL Configuration** die Site-URL `https://akraniss05.github.io/liverylab-academy/` und genau diese Redirect-URL eintragen.
4. Unter **Authentication → Sign In / Providers** öffentliche Selbstregistrierung deaktiviert lassen.
5. Unter **Authentication → Users** den eigenen Benutzer mit der persönlichen E-Mail-Adresse einladen und den Bestätigungslink annehmen. **Ein neues, einzigartiges Passwort nur auf der sicheren Supabase-Anmeldeseite setzen**.
6. In `supabase/admin-bootstrap.sql` die Platzhalter-E-Mail durch die eigene bestätigte E-Mail ersetzen und nur lokal/im Supabase SQL Editor ausführen. `display_name` wird **NyxAtheris**, `role` wird **admin**. Das Skript legt **keinen Auth-Benutzer** an.
7. `site/config.js` auf die echte Supabase-Projekt-URL und den **öffentlichen Publishable Key** setzen, `requireLogin: true` aktivieren. Diese Änderung erst nach erfolgreichem Testlogin durchführen, damit sich niemand aussperrt.
8. Für Schüler-Einladungen `supabase/functions/admin-users/index.ts` als Edge Function `admin-users` im Supabase-Projekt bereitstellen, URL/Origin/Secrets korrekt konfigurieren, JWT-Verifikation eingeschaltet lassen.
9. Mit einem eigenen Admin-Test und einem separaten Schüler-Test die Einladung, Berechtigungen, Passwort-Zurücksetzung, Datenexport und RLS-Zugriffe prüfen.

## Sicherheit

- Ein **Anzeigename** ist keine Login-E-Mail. Die bisherige App verwendet E-Mail plus Passwort.
- Niemals Passwörter oder private API-Schlüssel committen.
- **GitHub Pages ist ein öffentliches statisches Hosting.** Auch eine vorgeschaltete Login-Seite macht den veröffentlichten Quellcode, die Kurse oder die Assets nicht privat. Für eine vollständig nur für Eingeladene zugängliche Academy müssen die Kursinhalte in einen authentifizierten Backend-Speicher und aus dem öffentlichen Repository verschoben werden.
- Vor dem Betrieb mit anderen Personen sind Impressum, vollständige Datenschutzerklärung und Auftragsverarbeitung zu klären.

Made with 💙 by NyxAtheris (LiveryLab)
