# NovaLab Control V2

Neuer, isolierter Discord-Bot im Repository NovaLab-Code. **Kein Code aus DiscordBot1 übernommen.**

## Stand
Dies ist ausschließlich das neue technische Grundgerüst. Es enthält einen Discord-Gateway-Client und geschützte Live-Endpunkte für Rollen, Kanäle und Health-Checks. Noch kein fertiges Web-Dashboard, kein OAuth2, keine Tickets, keine Panels und keine Persistenz. Nicht produktionsbereit.

## Entwicklung
Node.js 22+; im Ordner `novalab-control` `npm install`, dann `npm run check` und `npm start`. Kopiere `.env.example` nach `.env`, trage echte Werte ein und veröffentliche niemals die Datei.

Die API bindet standardmäßig nur an 127.0.0.1. Der Bearer-Key ist eine **temporäre interne Schnittstelle**, kein Browser-Login. Niemals den API-Key im Frontend verwenden. Für das Dashboard muss erst Discord OAuth2 mit serverseitigen Sessions und Berechtigungsprüfung implementiert werden.

Die bestehenden Dateien der Academy werden nicht verändert.

## Nicht getestet
Live-Discord, Root-Server und GitHub CI wurden nicht ausgeführt. Die Rolle des Bots muss passende Berechtigungen besitzen. Sicherheitsreview, Tests und Deployment fehlen.
