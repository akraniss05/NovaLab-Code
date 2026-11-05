# LiveryLab Developer Academy — private Mitglieder-App

**Made with 💙 by NyxAtheris (LiveryLab)**

Website: https://akraniss05.github.io/liverylab-academy/

Die Academy umfasst 33 Lernbereiche, 86 Kapitel und 304 Lektionen. Nur eingeladene und bestätigte Benutzer sollen über Supabase Auth Zugang zur Kursoberfläche und zu persönlichen Lernständen erhalten.

## Live-Architektur
- **GitHub Pages** veröffentlicht ausschließlich die Oberfläche aus `site/`. Der Login ist erforderlich.
- **Supabase Auth** verwaltet Einladungen, E-Mail-Anmeldungen, Passwortänderungen und Sitzungen.
- **PostgreSQL** speichert Profile (`academy_profiles`), Fortschritt (`academy_progress`) und die 304 Lektionen (`academy_curriculum`).
- **Row Level Security** erlaubt Kurszugriff nur für aktive Mitglieder und persönliche Fortschrittsdaten nur für deren Eigentümer.
- **Supabase Edge Function admin-users** stellt den Admin-Verwaltungsbereich bereit. Adminrechte werden serverseitig geprüft.
- `site/config.js` enthält ausschließlich die öffentliche Supabase-Projektadresse und einen Publishable Key.

## Offener Einrichtungsschritt
**Das erste Auth-Konto existiert noch nicht.** Im Supabase Dashboard → Authentication → Users den Besitzer unter `NyxAtheris@livery-lab.app` einladen. Die Adresse muss tatsächlich E-Mails empfangen können. Benutzer bestätigt den Link und setzt ein **neues, einzigartiges Passwort** auf einer sicheren Supabase-Seite. Ein Datenbank-Trigger erstellt das Profil und weist nach erfolgreicher E-Mail-Verifikation automatisch `NyxAtheris` als Anzeigename und `admin` als Rolle zu.

Unter **Authentication → URL Configuration** muss die Site-URL sowie Redirect-Allowlist auf `https://akraniss05.github.io/liverylab-academy/` gesetzt werden. Selbstregistrierung muss ausgeschaltet bleiben. Schüler werden danach vom Administrator per E-Mail eingeladen.

## Sicherheit und wichtige Einschränkung
Die aktuell ausgelieferten Kursdateien werden nur nach Anmeldung über die Datenbank geladen, **jedoch existieren ältere öffentliche GitHub-Commits mit Kopien der Kursinhalte**. Um auch den Quellcode und die Git-Historie zu verbergen, muss das Repository bei geeigneter GitHub-Pages-Berechtigung privat gemacht und die Website danach getestet werden. Ein reiner Frontend-Login kann öffentliche Repository-Historie nicht verstecken.

Die Anwendung ist keine verifizierte Hochsicherheitsplattform. Bitte vor dem Einladen echter Schüler Admin-Einladungen, RLS, Passwort-Reset, Kontosperre und E-Mail-Zustellung mit Testkonten testen. Für rechtlichen Betrieb eine vollständige Datenschutzerklärung und ein Impressum ergänzen.
