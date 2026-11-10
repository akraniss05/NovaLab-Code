# NovaLab Control V2

Neuer eigenständiger Discord-Bot im Repository **NovaLab-Code**. Es wurde nichts aus DiscordBot1 übernommen. Die Academy-Dateien bleiben unverändert.

## Implementiert (Code-Stand, nicht live getestet)
- Responsives Dark-Mode-Webdashboard mit Discord OAuth2, serverseitiger Guild-Admin-Prüfung, HttpOnly-Cookies und CSRF.
- Echte Rollen und Kanäle aus Discord inklusive Suche, Berechtigungen und Rollenfarben.
- Info-, Ticket-, Bewerbungs-, Verifizierungs- und Selfrole-Panels mit echten Discord-Buttons.
- Private Ticketkanäle, Übernehmen/Schließen durch Supportrolle oder Serververwaltung, Ticketzustand gespeichert.
- Bewerbung mit Discord-Modal (3 Fragen), Team-Review und optionaler Rolle bei Annahme.
- Verifizierung/Selfroles mit Hierarchieprüfung.
- Lokale persistente JSON-Daten für Panels, Tickets, Bewerbungen, Konfiguration und Audit-Ereignisse.
- Grundlegende Node-Tests für Sicherheitsfunktionen und Panel-Validierung.

## Noch nicht implementiert
Mehrere Bewerbungsformulare, individuelle Bewerbungsfragen, Ticketweitergabe, Transkripte, Honeypot, Automod, Anti-Raid, erweiterte Logs, Welcome/Leave-Event-Automation, Auto-Roles, Staff-Listen, News, Selfrole-Mehrfachmenüs, Multi-Guild und Abrechnung. Welcome/Leave-Einstellungen sind aktuell nur Entwürfe.

## Voraussetzungen
Node.js 22+, Discord-Bot mit Guilds-Intent und erforderlichen Berechtigungen. Ein Root-Server mit HTTPS-Reverse-Proxy ist erforderlich; GitHub Pages kann diesen Backend-Dienst nicht hosten.

1. Im Ordner `novalab-control`: `npm install`.
2. `.env.example` nach `.env` kopieren und Werte eintragen. Niemals Secrets committen.
3. Discord OAuth2 Redirect URI auf `PUBLIC_URL/auth/callback` setzen.
4. `npm run check`, anschließend `npm start`.
5. HTTP(S) Reverse-Proxy zur lokalen Adresse `127.0.0.1:3100` konfigurieren.
6. `data/control.json` regelmäßig sichern. Nicht in Git committen.

## Sicherheits-/Betriebsgrenzen
- Vorher offengelegte Discord-Client-Secrets rotieren.
- OAuth2-Sitzungen liegen im RAM; Neustart meldet alle Benutzer ab.
- Lokale JSON-Datei ist nur für **eine** Bot-Instanz geeignet.
- Der Reverse-Proxy muss HTTPS und Rate-Limiting erzwingen; direkte öffentliche Portfreigabe vermeiden.
- Aktuelle Ticketanlage hat noch keine verteilte Sperre für gleichzeitige Klicks und keine vollständige Recovery bei allen Discord-API-Fehlern.
- Rechte des Bots und Rollen-Hierarchie vor Livebetrieb prüfen.
- Code wurde über GitHub erstellt; **keine CI, keine Browser-E2E-Tests und keine Live-Discord-Tests durchgeführt**. Nicht als produktionsreif betrachten.

## Tests
`npm run check` führt Syntaxprüfung und Node-Testdateien aus. Zusätzliche Integrationstests mit einem privaten Test-Discord-Server sind vor dem Release erforderlich.
