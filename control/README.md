# NovaLab Control

Eigenständiger Discord-Bot mit TypeScript, discord.js, Fastify, React/Vite und PostgreSQL/Prisma. Die Academy wird über einen konfigurierbaren Support-Link mit dem separat gehosteten Control-Portal verbunden.

## Auf einem Linux-VPS starten

1. Erstelle im Discord Developer Portal eine neue Application mit Bot. Aktiviere **Server Members Intent**. Für Ticketnachrichten aus Discord und Inhaltsfilter aktiviere auch **Message Content Intent** und setze `MESSAGE_CONTENT=true`. Installiere die App mit den Scopes `bot` und `applications.commands`.
2. Gib dem Bot die für die aktivierten Module benötigten Rechte. Für Panels und Ticketkanäle braucht er Zugriff auf die Zielkanäle sowie View Channels, Send Messages, Embed Links, Read Message History, Manage Channels und Manage Roles. Ergänze für Moderation bei Bedarf Manage Messages, Moderate Members, Kick Members oder Ban Members. Die Botrolle muss über den verwalteten Rollen liegen.
3. Richte einen DNS-Eintrag für die Control-Subdomain auf dem VPS ein. Die Compose-Konfiguration verwendet Caddy auf 80 und 443. Auf einem VPS mit bestehendem Reverse Proxy verwende den bestehenden Proxy und passe die Portbindung an.
4. Öffne `control/`, kopiere `.env.example` nach `.env` und trage Domain, Client-ID, Client-Secret und Bot-Token ein. Verwende für PostgreSQL ein zufälliges Hex-Passwort, zum Beispiel aus `openssl rand -hex 24`. Setze denselben Wert in `POSTGRES_PASSWORD` und in der `DATABASE_URL`.
5. Trage exakt `https://DEINE-CONTROL-DOMAIN/auth/callback` als Redirect unter **OAuth2** der Discord-App ein.
6. Starte die Dienste mit `docker compose up -d --build`. Prüfe `docker compose ps`, `docker compose logs --tail=100 api bot migrate` und `https://DEINE-CONTROL-DOMAIN/health`.
7. Öffne `/dashboard`, melde dich an und gib die Discord-Server-ID ein. Wähle in **Tickets** eine Kategorie und deren Supportrollen. Wähle in **Website-Integration** die Zugangsrolle. Speichere und veröffentliche gewünschte Panels bewusst über den Panel-Designer.

Die täglichen PostgreSQL-Dumps liegen in `control/backups/`, mit 14 Tagen Aufbewahrung. Die Dateien enthalten private Daten. Eine Wiederherstellung zuerst in eine separate Datenbank testen. Der Bot sollte pro Installation als einzelner Gateway-Worker laufen.

## Academy verbinden

Setze unter **Settings → Secrets and variables → Actions → Variables** im Repository die öffentlichen Variablen `NOVALAB_CONTROL_URL` (HTTPS-Origin ohne Pfad) und `NOVALAB_CONTROL_GUILD_ID` (Discord-Server-ID). Starte danach den bestehenden GitHub-Pages-Workflow. Die Karte **Support mit Discord** erscheint im Academy-Support und führt zu `/support?guild=…`.

Der Discord-Login und die Discord-Zugangsrolle schützen dieses Supportportal. Die bestehende Anmeldung, die Supabase-Lernberechtigungen und die Academy-Tarifanfragen laufen über ihre vorhandenen Abläufe. Eine gemeinsame Anmeldung für Kurskonten und Discord erfordert noch eine separate Kontoverknüpfung mit eigenen Freigaberegeln.

## Stand und Prüfpfade

| Bereich | Vorhanden | Offen |
| --- | --- | --- |
| Basis | PostgreSQL-Migration, OAuth-Codefluss mit PKCE und Cookies, serverseitige Guild-Prüfungen, Dashboard, Backup-Job | Live-OAuth und Betrieb auf dem Ziel-VPS prüfen |
| Discord | Willkommen/Abschied, Autoroles, Verifizierung, Regelbestätigung, Selfroles, Staff-Panel, News-Panel mit Zeitplanung, Panel-Aktualisierung | CAPTCHA, visueller Banner-Editor, vollständige Sprachabdeckung und Panel-Verwaltung |
| Support | Gemeinsame ID und Inbox, private Discord-Kanäle, Claim, Übergabe, Close/Reopen, interne Notiz, HTML-Download, DB-Outbox mit Wiederholungen | Uploads vom Web, Supportbewertungen, Inaktivitätsregeln, Teilnehmerverwaltung, vollständige Analysen |
| Bewerbungen | Mehrstufige Formulare mit sieben Antworttypen, Status, Cooldown, Admin-Entscheidung und mehrere Annahmerollen | Reviewer-Posteingang für Nicht-Admins, Bewertungsrubrik, Interviewkalender, Exporte und Aufbewahrung |
| Sicherheit und Team | Rollenwechsel mit Hierarchieprüfung, Team-Audit, Moderations-Slash-Command, AutoMod für ausgewählte Muster, Beitrittsgrenze für Verifizierung, Honeypot | Vollständiges Rollen-/Rechtemapping, Lockdown, Einsprüche, erweiterte Regeln und Benachrichtigungsoptionen |
| Weitere Module | Konfigurierbare Log-Kanäle und Übersicht | Umfragen, Events, Giveaways, Feedback, Vorschläge, temporäre Rollen und Erinnerungen |

Im Discord-Ticket werden Nachrichten des Ticketinhabers importiert. Supporter verwenden für eine sichtbare Antwort den Button **Öffentlich antworten**. Gewöhnliche Discord-Teamnachrichten werden nicht importiert. Interne Dashboard-Notizen werden weder ins öffentliche Transkript noch in den Discord-Kanal übernommen. Bei synchronisierten Discord-Anhängen wird der CDN-Link als Text gespeichert. Die Verfügbarkeit des Links hängt von Discord ab.

```bash
npm ci
npm run check
# Nur gegen eine separate Testdatenbank
DATABASE_URL=postgresql://... npm run migrate
DATABASE_URL=postgresql://... TEST_DATABASE=1 npm test
```

Für den Live-Test eine separate Discord-Test-Guild mit Admin, Supporter und normalem Mitglied nutzen. OAuth anmelden, Website-Rolle vergeben und entziehen, ein Ticket von beiden Oberflächen anlegen, übernehmen, weitergeben, öffentlich antworten, intern notieren und schließen. Danach eine Bewerbung annehmen und mehrere Rollen prüfen. Verifizierung, Selfroles, Moderationsausnahmen und Panel-Wiederherstellung separat mit einem Testkonto prüfen.
