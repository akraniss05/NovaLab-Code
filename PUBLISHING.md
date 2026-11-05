# LiveryLab Developer Academy 3.0 – GitHub Pages

**Made with 💙 by NyxAtheris (LiveryLab)**

## Webseite

Die vollständige eigenständige Web-App ist in `index.html` enthalten. Sie kann ohne Build-Schritt ausgeführt werden. Der GitHub-Actions-Workflow veröffentlicht die Website bei jeder Änderung auf `main`.

Geplante URL: https://akraniss05.github.io/liverylab-academy/

## GitHub Pages einmalig einschalten

1. Repository **Settings → Pages** öffnen.
2. Bei **Build and deployment → Source** die Option **GitHub Actions** wählen.
3. Unter **Actions** prüfen, ob die Bereitstellung erfolgreich abgeschlossen wurde. Falls der erste Lauf fehlgeschlagen ist: Workflow erneut ausführen.

## Konten, Daten und Datenschutz

Die App wird derzeit im **Gastmodus** veröffentlicht. Das bewahrt Lernfortschritt lokal im Browser (wenn diese Option aktiviert ist). Gastdaten sind nicht geräteübergreifend synchronisiert.

Für echte Konten, Admin-Einladungen, Passwort-Zurücksetzung und Cloud-Speicherung wird ein separates Supabase-Projekt benötigt. Die notwendigen SQL- und Edge-Function-Vorlagen sind im separat bereitgestellten LiveryLab_Academy_3_GitHub_READY.zip enthalten. Sie sind **hier noch nicht aktiviert**. Niemals ein Supabase Service-Role-Secret, Passwort oder private Zugangsdaten in `index.html` veröffentlichen.

Die öffentliche Homepage ist keine Zugangsbeschränkung. GitHub Pages allein kann keine privaten Schülerkonten serverseitig absichern.

Vor dem öffentlichen Betrieb mit Benutzerregistrierung bitte rechtssicheres Impressum, Datenschutzerklärung, Auftragsverarbeitung und die zuständigen Kontaktdaten ergänzen.

## Code & Updates

- `index.html`: gesamter Browserclient, eingebettete Lerninhalte.
- `service-worker.js`: einfaches Offline-Fallback für die Hauptseite; kein API-Cache.
- `.github/workflows/deploy-pages.yml`: Deployment.
- `.nojekyll`: schaltet Jekyll-Umwandlung ab.
