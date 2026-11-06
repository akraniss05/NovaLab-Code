# LiveryLab Academy v11

**Made with 💙 from NyxAtheris (LiveryLab Studios)**

Neue responsive Lernplattform für Programmiersprachen, FiveM und Blender. Dunkles Violett, mobile Bottom-Navigation, Kurskarten und XP wie in den Designreferenzen.

Live: https://akraniss05.github.io/liverylab-academy/  
Discord: https://discord.gg/livery-lab  
Kontakt: nyxatheris

## Funktionen

- Kurse für Lua, Python, JavaScript, HTML, CSS, Java, TypeScript, C#, C++, SQL, Go, Rust, PHP, FiveM, QBCore, ESX, Blender und viele weitere. Neu ergänzt: C, Swift, Ruby, Dart, PowerShell, R, Zig, Scala, Elixir, Haskell, Perl und Julia.
- Verständliche Lektionen: Erklärung, Codebeispiel, externe Videos, Praxisaufgabe und Quiz.
- **Neu:** vollständig kostenloser 12-teiliger Einstiegskurs „Programmieren von Null – Dein erster Code“ mit Erklärungen vom ersten Befehl über Variablen und Funktionen bis zum eigenen Projekt.
- Abschlussprüfung mit maximal zehn Fragen (bestehen ab 80 %), XP und Supabase-synchronisierter Lernfortschritt.
- Login mit Benutzername + Passwort, optionale TOTP-Authenticator-2FA und obligatorischer Passwortwechsel beim ersten Login.
- Admin-Bereich: Benutzer erstellen, Passwort zurücksetzen, sperren, löschen sowie Free / Plus / Pro vergeben.
- Konzentrierte Lernplattform mit eingebauten Schreibübungen statt umfangreicher Studio-Werkzeuge.

## Zugangsstufen

Aus Kompatibilitätsgründen werden in der bestehenden Supabase-Datenbank die alten Stufenbezeichner weiterverwendet.

| Anzeige | Datenbankwert | Zugriff |
| --- | --- | --- |
| Free | free | Allgemeine Grundlagen |
| Plus | pro | Grundlagen + Aufbaulektionen |
| Pro | ultimate | Alle Lektionen |

Die Kurszugriffe werden in Supabase per **Row Level Security** auf der Tabelle ll_lesson_content geprüft. Ein versteckter Button allein kann keine Pro-Inhalte freigeben.

## Login

Der serverseitige Admin-Endpunkt legt ein verwaltetes Konto mit internem E-Mail-Alias an. Der Nutzer braucht nur **Benutzernamen und Passwort**. Bestehende Admin-Accounts können nötigenfalls die zuvor hinterlegte E-Mail-Adresse ins selbe Benutzername-Feld eintragen.

Keine öffentlichen Registrierungen. Schreib nyxatheris auf Discord oder besuche https://discord.gg/livery-lab.

## Projektstruktur

- site: kompletter statischer Frontend-Code; GitHub Pages stellt diesen Ordner bereit.
- site/academy.js: Lernplattform, Kursansicht, Quiz, Fortschritt, Profile, Admin-UI.
- site/auth-mfa-v5.js: TOTP-Einrichtung und zweiter Anmeldeschritt.
- site/config.js: nur öffentlicher Supabase Publishable Key.
- supabase/functions/admin-users/index.ts: Serverfunktion für Benutzeradministration.
- tests/smoke.cjs: technische Mindestprüfungen.
- .github/workflows/deploy-pages.yml: automatisches Deployment.

Das bereits verbundene Supabase-Projekt LiveryLab wurde weiterverwendet. Bestehende Accounts sind erhalten; alte, ungated Kursdaten im Backend wurden für Browser gesperrt.

## Grenzen

- Für viele Kurse sind ausgewählte, eingebettete Videos hinterlegt. Für andere zeigt die App eine spezifische externe YouTube-Suche. Bevor ein einzelnes Tutorial als geprüft markiert wird, muss die Redaktion es zuordnen.
- Der Video-Haken ist eine Selbstbestätigung, **kein technischer Wiedergabenachweis**.
- Das Wasserzeichen ist in UI und Quellcode enthalten, aber öffentlich abrufbarer Code ist grundsätzlich veränderbar.
- Für den öffentlichen produktiven Betrieb sind ein korrektes Impressum und rechtlich geprüfte Datenschutzhinweise zu ergänzen.

## Deployment

Unter Repository Settings > Pages muss „GitHub Actions“ aktiviert sein. Push auf main triggert Prüfungen und Deployment. Alte Codeversionen bleiben über Git-Historie abrufbar; der aktive Datei-Baum wird komplett ersetzt.


## Anmeldung mit E-Mail ODER Benutzername

- Bestehende Supabase-E-Mail-Konten: E-Mail-Adresse und Passwort direkt auf der Website eingeben.
- Bereits vergebene Benutzernamen: denselben Account mit Benutzername + Passwort öffnen.
- Für E-Mail-Konten ohne Benutzernamen: nach dem Login unter **Profil → Zusätzlichen Benutzernamen festlegen** ein Login-Kürzel wählen (einmalig). Das Konto bleibt dasselbe.
- Das Anmeldefeld erkennt selbst, ob du eine E-Mail-Adresse oder einen Benutzernamen eingegeben hast. Keine öffentliche Selbstregistrierung.
- Administratoren können unter **Admin** wahlweise Konten per **Benutzername** (verwalteter Alias) oder per **echter E-Mail-Adresse** erstellen.
- Username-Anmeldung löst die private E-Mail-Adresse nur serverseitig über die Supabase Edge Function \`academy-signin\` auf. Danach prüft Supabase Auth das Passwort. Die Function gibt E-Mail-Adressen nicht an nicht angemeldete Nutzer preis.
- Die Supabase Function \`academy-signin\` nutzt \`verify_jwt = false\`, da noch keine Sitzung besteht; sie prüft die eingesendeten Zugangsdaten selbst. Die separate Admin-Funktion bleibt \`verify_jwt = true\`.

## UX-Überarbeitung v11

- Neue responsive Designschicht in `site/refined.css` (mobiler Header, Drawer-Menü, Navigationsleiste, Kurskarten, Profil und Einstellungen).
- Erledigte Lektionen und gesamte Kurse sind vollständig grün hinterlegt.
- Reduzierter Katalog: 9 Lernpfade pro Ansicht, mit Filter, Suche und „Weitere anzeigen“; Kapitel sind einklappbar.
- Kurzer Ablauf jeder Lektion: Theorie, Video-Tutorial (falls redaktionell zugeordnet), eigene Code-/Praxisaufgabe in einem Textfeld, Wissenstest und Abschließen. Eigener Code wird **nicht ausgeführt**, sondern lokal als Entwurf gespeichert. Das Ergebnis des Praxisschritts wird mit Supabase synchronisiert.
- Echte Einstellungen für kompakte Kurskarten, reduzierte Animationen, Fortschrittsreset und Konto-/Authenticator-Verwaltung.
- Free: 58 Lektionen. Plus: insgesamt 116 Lektionen (2 × Free). Pro: voller Zugriff auf 471 Lektionen. Die Freigabe wird auch in Supabase-RLS geprüft.
- Nur für die ersten geprüften Lernmodule sind bestimmte Videos mit Kapitelstart hinterlegt; sonst wird eine präzise YouTube-Suche angeboten. Externe Videos werden erst nach Klick geladen.
- `node tests/render.cjs` prüft die wesentlichen Screens anhand der echten Rendering-Funktionen.
