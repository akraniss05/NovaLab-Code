# LiveryLab Academy v12

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


## v12 · Referenzgetreues mobiles App-Design

- Ein neues Stylesheet unter site/app-v12.css ersetzt die alte CSS-Kaskade. Versionierte URLs vermeiden veraltete Browser-Caches.
- Vier mobile Tabs: Lernen, Script, Prüfung, Referenz. Profil, Admin, Tarife und Einstellungen im seitlichen Menü.
- Lernpfade: Nummer links, Titel und Zusammenfassung mit eigener Typografie, Statusring rechts, ganze grüne Karte bei abgeschlossenen Lektionen.
- Script: schreibgeschütztes sh_shop-Lernprojekt mit Dateibaum, Tabs und serverseitig geladenen Ausschnitten bereits abgeschlossener, erlaubter FiveM-Lektionen. Kein direkt startbares Shop-System.
- Prüfung: bis zu 20 Fragen, Fortschrittspunkte, große Antworten, ab 80 % bestanden. Abschlussprüfung nach allen Lektionen.
- Referenz: FiveM-Natives und Lua-Spickzettel als mobil lesbare Funktionsliste.
- Lektionen: Theorie, Video, eigener Code-Entwurf, Wissenstest. Entwürfe lokal; Praxis- und Videostatus in Supabase.
- Login, Admin-Konten, Free / Plus / Pro und Authenticator-Zwei-Faktor-Anmeldung bleiben erhalten.


## v13 · Tarife, Tageslimits und Gutscheine

- Free: maximal 10 Grundlagenkurse und 3 neue Stationen pro Tag (0,00 €).
- Plus: maximal 25 Kurse und 6 neue Stationen pro Tag (1,99 €/Monat).
- Pro: alle Kurse, unbegrenzte Stationen (3,99 €/Monat).
- Tageslimits und Kurszugriff werden in Supabase per Rollenprüfung und serverseitigem RPC `academy_open_lesson` durchgesetzt. Direktes Lesen von `ll_lesson_content` ist gesperrt.
- Bereits vorher eröffnete Lektionen können wiederholt aufgerufen werden, ohne neue Tagesplätze zu beanspruchen.
- Gutschein-Erstellung nur mit Admin-Konto; Gutscheine werden in `academy_private.academy_vouchers` verwaltet, Einlösungen atomar gezählt.
- Gratis-Codes aktivieren zeitlich befristet Plus oder Pro; nach Ablauf fällt das Konto zurück. Rabatt-Codes reservieren nur ein Angebot, sie führen keine Zahlung aus.
- Derzeit KEIN automatischer Zahlungsanbieter, keine automatische Abo-Abrechnung. Preise werden angezeigt, Aktivierung kostenpflichtiger Mitgliedschaften erfolgt nach Bestätigung durch das Team.


## v14 · Registrierung, Adminfreigabe und Sprachreferenz

- Registrieren per E-Mail, Benutzername und Passwort (min. 14 Zeichen). Neue selbst registrierte Konten werden im Backend auf `pending` gesetzt, sie können keine Lerninhalte laden, bis das Adminteam freigibt.
- Im Adminbereich: offene Anfragen mit E-Mail-Bestätigungsstatus, Genehmigen/Ablehnen, Zugriffe sperren/reaktivieren und serverseitig geschützte Tarifwechsel über die `admin-users` Edge Function.
- User-eigene Metadata bestimmen niemals Rollen oder Aktivierung. Kein automatisches Hochstufen einer E-Mail-Adresse zum Admin.
- Free: drei neue Lektionen täglich, Plus (`pro`): sechs, Ultimate (`ultimate`): unbegrenzt. PostgreSQL RPC erzwingt Limits; bisher geöffnete Lektionen bleiben erneut abrufbar.
- 24 Programmiersprachen/Tools, 485 kompakte Referenzeinträge, offizielle Dokumentationslinks, filter- und suchbar.
- Abschlussprüfungen: bis zu 20 zufällig gewählte Fragen via geschützter `academy_exam_questions` RPC nach Kursabschluss, Bewertung und Auswertung. Die Prüfung ist ein Lern-Test, keine betrugssichere Zertifikatsprüfung.


## v15 · Authenticator-App / 2FA

- `site/auth-mfa-v15.js`: Supabase MFA-Verwaltung zum Verknüpfen einer TOTP-App, QR-Code, manuellem Sicherheitsschlüssel, Codebestätigung sowie Entfernen eines verbundenen Geräts (nur nach AAL2-Bestätigung).
- `site/academy.js`: `renderMFA()` verbindet die Authenticator-Einstellungen mit Profil und Einstellungen. Bei neuem Login folgt nach Passwort die sechsstellige Codeeingabe, sofern das Konto einen verifizierten Faktor besitzt.
- Supabase erzwingt in `academy_private.session_verified()` AAL2 für angemeldete Accounts mit bestätigtem MFA-Faktor und schützt Daten unabhängig vom Frontend.
- `tests/mfa-browser.cjs` testet Enrollment, QR, ungültigen/gültigen Code, die nächste Anmeldung und das Entfernen des Geräts mit mock-Supabase im echten Chromium. Ein Live-Enrollment eines echten Kontos wird dadurch nicht ersetzt.
- Wunschdomain `github.liverylabacademy.app`: siehe `CUSTOM_DOMAIN.md`. Domaininhaberschaft, DNS-Zugriff und GitHub Pages Custom Domain Settings sind vor dem Live-Switch erforderlich.



## v16 · Registrierung über alle Browser

- Bei Supabase `signup_disabled` versucht die Academy automatisch den neuen serverseitigen Endpoint `academy-register` statt den Registrierungsversuch abzubrechen.
- Die Edge Function verwendet nur auf dem Server eine Supabase Secret/Service-Role-Key. Sie legt **keine Administratoren** an, sondern Accounts mit dem Status `pending` und `active=false`.
- Die Anmeldung per E-Mail und Passwort ist möglich, aber geschützte Kursdaten werden erst nach expliziter Freigabe zugänglich. Die Mitgliedschaft wird ohne Adminfreigabe nicht aktiv.
- Da Supabase die normalen Registrierungen deaktiviert hat, ist eine E-Mail-Bestätigung über den Standard-Signup-Prozess derzeit nicht möglich. Der Fallback aktiviert die Passwort-Anmeldbarkeit serverseitig, **verifiziert jedoch nicht den Besitz der angegebenen E-Mail-Adresse**. Die Admin-Oberfläche kennzeichnet diesen Unterschied sichtbar und verlangt eine bewusste manuelle Prüfung, bevor sie das Konto freigeben darf.
- `academy_signup_rate_limit` begrenzt Registrierungsversuche anhand pseudonymisierter Kontakt-/IP-Fingerabdrücke und einer Tagesobergrenze. IP-basierte Limitation ist lediglich Best-Effort; weitere Schutzmechanismen wie CAPTCHA sind für höhere Nutzungszahlen ratsam.
- Mit aktivierten Public Signups bei Supabase arbeitet die Academy weiterhin mit dem regulären `auth.signUp()` inklusive Supabase-E-Mail-Bestätigung.
- Der `tests/registration.cjs` prüft die Umleitung im Browsercode, reguläre Signups und Fehlerbehandlung. Live-Tests mit Zustellung echter E-Mails wurden nicht durchgeführt.


## v17 · Lernrechte, kursspezifische Prüfungen, Developer-Profile & Freunde

- Free: 3 neue Lektionen pro Tag, **2 neue Prüfungsstarts pro Tag**, 10 Grundkurse, Script und Referenzen gesperrt.
- Plus (`academy_plans.tier='pro'`): 6 neue Lektionen, **4 Prüfungen pro Tag**, 25 Kurse und Script-Werkstatt; Referenzen gesperrt.
- Pro/Ultimate (`tier='ultimate'`): volle Kurs-/Prüfungsrechte, unbegrenzte tägliche Prüfungen sowie Script und Referenzen.
- Prüfungsfragen werden serverseitig pro Kurs nach Lernpfadabschluss ausgewählt. Die Lösungsschlüssel bleiben in `academy_private.academy_exam_attempts`, werden erst beim `academy_exam_finish` bewertet und können nicht beliebig an das Frontend übertragen werden.
- Die Referenzdaten wurden in `academy_private.academy_reference_library` übertragen. Nur Ultimate erhält sie über `academy_reference_get`. Das Pages-Build entfernt die statische Referenzdatei aus dem veröffentlichten Websiteverzeichnis. Die öffentliche GitHub-Historie bleibt unabhängig davon einsehbar.
- Discord-inspirierte Profilkarten mit Avatar, Banner, Namensstil, Bio, Titeln und freiwilliger Fortschrittsfreigabe; Uploads auf maximal 1 MiB WebP in einem auf eigene Dateipfade begrenzten Storage-Bucket.
- Freundesliste mit Anfragen, Annahme, Ablehnung und Entfernen. Fortschritt nur für bestätigte Freunde und optional abschaltbar. Kein Zugriff auf E-Mail-Adressen anderer Nutzer.
- Der ursprüngliche Eigentümer kann weitere Administratoren ernennen und entlassen. Delegierte Admins können Anfragen freigeben, Accounts sperren und Mitgliedschaften verwalten, aber **nicht** den Owner oder andere Adminrollen verändern.
- Alle kostenpflichtigen Testzugänge werden derzeit persönlich über NyxAtheris/Discord vergeben. Kein automatischer Zahlungsanbieter.


## v18 · Gutscheinmanager, Login-Streak und individuelle Entwicklerprofile

- Gesicherte Gutscheine können automatisch oder mit einem eigenen Code wie `NYX` oder `NYXATHERIS5` erstellt werden. Gültige Länge 3–64 Zeichen (A–Z, Zahlen, Bindestriche; nicht zwischen Groß-/Kleinschreibung unterscheidend).
- Administratoren können Gutscheine pausieren und löschen; abgelaufene Codes werden sofort beim Auflisten gefiltert. Ein Supabase-Cron-Job `liverylab-voucher-expiry-cleanup` läuft jede Minute, deaktiviert abgelaufene Codes und entfernt unbenutzte Codes physisch. Bereits eingelöste Codes werden unsichtbar archiviert, damit Einlösehistorie und bereits gewährte Vorteile nicht verloren gehen.
- `academy_login_streak` zählt einen Besuch je Kalendertag ab **00:00 Uhr Europe/Berlin** und speichert den persönlichen Rekord. Bei wiederholten Besuchen am selben Tag steigt die Streak nicht weiter.
- 23 freischaltbare Erfolgs-Titel (Lernlektionen, Prüfungen, Freundschaften, Streak sowie Lua/Python/JS/FiveM/HTML/Blender-Abschlüsse). Serverseitig geprüft.
- Erweiterte Profilgestaltung mit weiteren Banner-Farbwelten und automatischem Bildzuschnitt (bis 15 MB Eingabe; max. 1 MiB WebP-Ausgabe; browserabhängige Quellformate). SVG ist aus Sicherheitsgründen ausgeschlossen. GIFs werden als Standbild gespeichert.
- **Mein Profil** ist ausschließlich für Bio, sichtbaren Namen, Bild/Avatar, Banner, Stil, Freunde und Erfolge zuständig. E-Mail, Benutzername, Passwort und 2FA stehen in **Einstellungen**.
- Einstellungen: sechs Farbwelten für den Hintergrund, sechs Akzentfarben, große Schrift, Kontrast, kompakte Karten, weiche Ecken, dezente Effekte, weniger Animationen und sofortige Wiederherstellung des Standarddesigns. Browser-lokal gespeichert.
- Freundescenter mit getrennten Tabs **Freundesliste / Anfragen / Freund hinzufügen**, persönlichen Karten und optional sichtbaren Lernwerten.
- Veröffentlichte URL: https://akraniss05.github.io/liverylab-academy/
- `supabase` bleibt das Backend: GitHub Pages hostet ausschließlich HTML, CSS und JavaScript. Keine Supabase-Secrets im Browser veröffentlichen.


## v19 · Neues Dashboard mit Originalbanner und manuellen Daily Claims

- Startbildschirm im violetten Neon-Stil mit dem vom Studio gelieferten Livery-Lab-Banner (mobil optimiert als WebP), Level-/XP-Karte, „Weiterlernen“, 9+ Funktionsverknüpfungen und Bottom-Navigation mit Home, Lernen, Script, Prüfungen und Profil.
- Nach Anmeldung erscheint ein zugängliches „Daily Streak“-Popup, wenn ein Claim bereitsteht. Schließen lässt den Anspruch bestehen. Ein bewusster Klick auf **Claim** ruft die geschützte Datenbankfunktion `academy_streak_claim` auf.
- Der Claim wird **pro Konto serverseitig** gespeichert. Eine Sperrzeit von mindestens 24 Stunden gilt, zusätzlich maximal ein Claim je deutschem Kalendertag von 00:00 bis 00:00 Uhr, Europe/Berlin. Ein ganzer ausgelassener Kalendertag setzt die laufende Serie auf 1 zurück. Wiederholtes Klicken oder Reload bringen keine zusätzlichen Punkte.
- Nach dem Einlösen zeigt das Popup den persistenten Countdown, der mit der Supabase-Serveruhr synchronisiert ist. Der Streak ist jederzeit über das Startmenü und die Kopfzeile zugänglich.
- Zur Sicherheit verwendet `academy_streak_status` read-only Daten, während nur `academy_streak_claim` Ansprüche ändert. Die alte Routine `academy_login_streak` wurde kompatibel belassen, löst aber keinen Claim mehr automatisch aus.
- Im GitHub Pages-Workflow wird das Originalbanner aus versionierten Base64-Teilen rekonstruiert und gegen einen SHA-256-Prüfwert validiert; die Teile werden **vor Veröffentlichung aus dem Site-Ordner entfernt**.
- Das vorbereitete Banner wurde für die Website auf 600 × 338 Pixel komprimiert. Die volle Originaldatei bleibt in der Nutzerunterhaltung erhalten und ist nicht durch den Build überschrieben.
