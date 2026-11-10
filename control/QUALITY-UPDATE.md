# Qualitätsupdate: geprüfter Umfang

Dieses Update verbessert den bestehenden, neu entwickelten Control-Code in NovaLab-Code. Es übernimmt keinen Code aus DiscordBot1 und ändert weder Academy-Nutzerdaten noch bestehende Konfigurationswerte.

## Änderungen

- Einheitliche Dashboard-Karten, Sidebar, Formulare, Fokuszustände und größere Touch-Flächen; schließbarer Hintergrund beim mobilen Menü.
- Ungespeicherte Änderungen werden angezeigt. Serverwechsel und Verlassen der Seite warnen vor dem Verlust eines Entwurfs.
- Einstellungsentwürfe behalten ihre geladene Revision. Hintergrundabfragen können diese nicht mehr unbemerkt auf eine neuere Revision setzen und damit fremde Änderungen überschreiben. Bei Konflikten ist ein bewusstes Neuladen erforderlich.
- Während einer Aktion sind Einstellungsfelder gesperrt. Synchroner Aktionsschutz verhindert doppelte Ausführung vor dem nächsten React-Render.
- Tickets und Nachrichten behalten bei fehlgeschlagenen Sendeversuchen mit identischem Inhalt ihre Anfrage-ID. Ein neuer Inhalt erhält eine neue ID.
- Nachrichten-IDs mit verändertem Inhalt werden zurückgewiesen. Eine erfolgreich gespeicherte Nachricht kann auch nach dem Schließen des Tickets nochmals bestätigt werden, ohne einen zweiten Datensatz zu erzeugen.
- Ticketansichten zeigen die neuesten 2.000 Nachrichten in zeitlicher Reihenfolge. Öffentliche HTML-Transkripte enthalten den vollständigen gespeicherten Verlauf, weiterhin ohne interne Notizen.
- Nicht-JSON-Serverantworten erzeugen eine verständliche Fehlermeldung. Blockierter Browser-Speicher verhindert den Sprach- oder Themenwechsel nicht mehr.

## Prüfungen

- `npm run check`: TypeScript, API-/Domain-Tests und Produktionsbuild erfolgreich. Lokaler PostgreSQL-Test ohne Testdatenbank übersprungen; der GitHub-Workflow führt ihn mit PostgreSQL 17 aus.
- Chromium, 1440 × 1000 und 390 × 844: alle zehn Bereiche geöffnet; Revisionskonflikt, Erhaltung des Entwurfs und Speichern nach Neuladen überprüft. Mobiles Menü per Hintergrund geschlossen; kein horizontaler Überlauf. EN-Umschaltung und Light-Modus geprüft, keine JavaScript-Seitenfehler.
- Browserprüfung verwendet API-Fixtures, keine echten Discord-Konten. Reproduzierbarer Test: `tests/browser.mjs`. Er benötigt Playwright und eine laufende Control-API. `TEST_BASE_URL` setzt die URL (Standard `http://127.0.0.1:39173`), optional `PLAYWRIGHT_MODULE` und `CHROMIUM_EXECUTABLE` für externe Installationen.
- Datenbanktest erweitert: veränderte Nachricht unter gleicher ID muss scheitern; identische Wiederholung nach Ticketabschluss muss denselben Datensatz liefern.

## Verbleibende Grenzen

Live-OAuth, Rollenvergabe, Panel-Veröffentlichung und Gateway-Synchronisation benötigen weiterhin den Test auf einer echten Discord-Guild mit konfigurierten Zugangsdaten. Die offene Funktionsmatrix in README.md gilt weiterhin: Dieses Update ist keine Fertigstellung aller Module des ursprünglichen Master-Prompts. Das Kurskonto der Academy ist noch nicht mit dem Discord-Konto verknüpft. Sehr große Transkripte werden derzeit vollständig im API-Speicher aufgebaut; ein gestreamter Export bleibt offen. Build-Warnungen zu `use client` in Drittanbieterpaketen sind vorhanden; der Build ist erfolgreich.
