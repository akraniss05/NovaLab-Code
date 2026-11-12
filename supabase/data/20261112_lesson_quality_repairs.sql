-- Repair the exercises and video references confirmed by the November lesson audit.
-- A changed quiz receives a new version. Existing completed lessons retain their receipts.
BEGIN;

CREATE TEMP TABLE novalab_lesson_repairs ON COMMIT DROP AS
SELECT * FROM jsonb_to_recordset($repairs$
[
 {
  "id": "api-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Aufruf gegen eine eigene lokale API oder einen Mock-Endpunkt. Notiere die Methode, den Statuscode und die erwartete Antwort."
  }
 },
 {
  "id": "esx-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "esx-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "esx-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "esx-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "esx-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "fivem-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  },
  "questions": [
   {
    "question": "Welche Datei bestimmt, welche Skripte eine FiveM-Resource lädt?",
    "options": [
     "client.lua",
     "fxmanifest.lua",
     "server.cfg"
    ],
    "explanation": "Das Manifest gehört in den Hauptordner der Resource.",
    "correct": 1
   },
   {
    "question": "Welche Zeile lädt client.lua auf dem Spielclient?",
    "options": [
     "server_script 'client.lua'",
     "game 'client.lua'",
     "client_script 'client.lua'"
    ],
    "explanation": "client_script benennt eine Datei, die auf dem Client ausgeführt wird.",
    "correct": 2
   }
  ]
 },
 {
  "id": "esx-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf einem eigenen FXServer mit es_extended und den in der Aufgabe genannten Abhängigkeiten. Notiere den Testfall und die Konsolenausgabe."
  }
 },
 {
  "id": "fivem-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-12",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-11",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-13",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-14",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-15",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-workshop-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-workshop-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivem-workshop-v9-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste deine Resource auf einem eigenen FXServer. Notiere den Startbefehl oder die ausgelöste Aktion und die Ausgabe aus der Konsole."
  }
 },
 {
  "id": "fivemadmin-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "fxmanifest und Resource",
   "theory": "fxmanifest.lua beschreibt, welche Dateien FiveM lädt. ui_page zeigt auf die HTML-Startseite. Unter files werden die Dateien eingetragen, die der Client für die Oberfläche benötigt. client_script und server_script legen fest, wo Lua-Dateien laufen.",
   "example": "fx_version 'cerulean'\ngame 'gta5'\n\nui_page 'html/index.html'\nfiles { 'html/index.html', 'html/app.js' }\n\nclient_script 'client.lua'\nserver_script 'server.lua'",
   "solution": "fx_version 'cerulean'\ngame 'gta5'\n\nui_page 'html/index.html'\nfiles { 'html/index.html', 'html/app.js' }\n\nclient_script 'client.lua'\nserver_script 'server.lua'",
   "task": "Lege ein Manifest für html/index.html, html/app.js, client.lua und server.lua an. Starte die Resource auf deinem Testserver und öffne die NUI.",
   "hint": "Pfad und Großschreibung müssen exakt mit den echten Dateinamen übereinstimmen.",
   "checks": [],
   "keyPoints": [
    "Pfad und Großschreibung müssen exakt mit den echten Dateinamen übereinstimmen."
   ],
   "example_notes": [
    "Pfad und Großschreibung müssen exakt mit den echten Dateinamen übereinstimmen."
   ],
   "explanation_steps": [
    "Pfad und Großschreibung müssen exakt mit den echten Dateinamen übereinstimmen."
   ],
   "mistake": "Pfad und Großschreibung müssen exakt mit den echten Dateinamen übereinstimmen."
  },
  "questions": [
   {
    "question": "Welche Direktive bestimmt die HTML-Einstiegsseite der NUI?",
    "options": [
     "client_script",
     "game",
     "ui_page"
    ],
    "explanation": "ui_page verweist auf das HTML-Dokument, das FiveM für die NUI öffnet.",
    "correct": 2
   },
   {
    "question": "Wo führst du html/app.js auf, damit der NUI-Client die Datei laden kann?",
    "options": [
     "In files und als Skript im HTML-Dokument",
     "Nur unter server_script",
     "In game zusammen mit gta5"
    ],
    "explanation": "files stellt die Datei bereit. Die HTML-Seite muss sie über ein script-Element einbinden.",
    "correct": 0
   }
  ]
 },
 {
  "id": "fivemadmin-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Zeichne den Ablauf und überprüfe am Beispiel die Zuständigkeit jeder Schicht. Notiere, wie sich der Ablauf ohne Leserecht ändert.",
   "title": "Architektur: UI, Client, Server",
   "theory": "NUI zeigt Daten an. Der Client reicht die ausgewählte Aktion weiter. Erst der Server entscheidet, ob die Aktion zulässig ist.",
   "example": "NUI: Klick auf „Spielerliste“\nClient: Anfrage „players“ an den Server senden\nServer: Leserecht prüfen und erst danach eine Spielerliste zurückgeben",
   "solution": "NUI: Klick auf „Spielerliste“\nClient: Anfrage „players“ an den Server senden\nServer: Leserecht prüfen und erst danach eine Spielerliste zurückgeben",
   "task": "Zeichne diesen Ablauf für „Spielerliste öffnen“. Markiere, an welcher Stelle die Berechtigung geprüft wird.",
   "hint": "Prüfe, dass im Diagramm keine Daten vor der serverseitigen Rechteprüfung zurückgegeben werden.",
   "checks": [],
   "keyPoints": [
    "Prüfe, dass im Diagramm keine Daten vor der serverseitigen Rechteprüfung zurückgegeben werden."
   ],
   "example_notes": [
    "Prüfe, dass im Diagramm keine Daten vor der serverseitigen Rechteprüfung zurückgegeben werden."
   ],
   "explanation_steps": [
    "Prüfe, dass im Diagramm keine Daten vor der serverseitigen Rechteprüfung zurückgegeben werden."
   ],
   "mistake": "Prüfe, dass im Diagramm keine Daten vor der serverseitigen Rechteprüfung zurückgegeben werden."
  },
  "questions": [
   {
    "question": "Wo wird das Leserecht für die Spielerliste durchgesetzt?",
    "options": [
     "Im HTML, bevor die Tabelle sichtbar wird",
     "Im Server-Handler vor dem Erstellen der Antwort",
     "Im Browser beim Öffnen des Dialogs"
    ],
    "explanation": "NUI und Client können eine Anfrage auslösen. Der Server entscheidet über den Zugriff.",
    "correct": 1
   },
   {
    "question": "Welche Aufgabe übernimmt die Client-Brücke in diesem Ablauf?",
    "options": [
     "Sie ersetzt den Server als Quelle der Spielerliste.",
     "Sie entscheidet dauerhaft über die ACE-Rollen.",
     "Sie reicht die Anfrage von der NUI an den Server weiter."
    ],
    "explanation": "Die Brücke transportiert Daten und Anfragen zwischen NUI und FiveM.",
    "correct": 2
   }
  ]
 },
 {
  "id": "fivemadmin-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "ACE Berechtigungen",
   "example": "local canRead = IsPlayerAceAllowed(source, 'll.admin.read')\nlocal canKick = IsPlayerAceAllowed(source, 'll.admin.kick')\nprint(canRead, canKick)",
   "solution": "local canRead = IsPlayerAceAllowed(source, 'll.admin.read')\nlocal canKick = IsPlayerAceAllowed(source, 'll.admin.kick')\nprint(canRead, canKick)",
   "task": "Teste einen Account mit Leserecht und einen Account ohne Kick-Recht. Dokumentiere die beiden ACE-Ergebnisse.",
   "hint": "Erstelle getrennte Regeln für Lesen und Kick.",
   "checks": [],
   "keyPoints": [
    "Erstelle getrennte Regeln für Lesen und Kick."
   ],
   "example_notes": [
    "Erstelle getrennte Regeln für Lesen und Kick."
   ],
   "explanation_steps": [
    "Erstelle getrennte Regeln für Lesen und Kick."
   ],
   "mistake": "Erstelle getrennte Regeln für Lesen und Kick."
  },
  "questions": [
   {
    "question": "Ein Account darf lesen, hat aber kein Kick-Recht. Wie sollte die Prüfung ausfallen?",
    "options": [
     "Lesen erlaubt, Kick abgelehnt",
     "Beide Aktionen erlaubt",
     "Beide Aktionen abgelehnt"
    ],
    "explanation": "Jede Aktion hat eine eigene ACE-Berechtigung.",
    "correct": 0
   },
   {
    "question": "Welchen Wert prüft der Server als Akteur der Aktion?",
    "options": [
     "Den Namen aus einem Textfeld im NUI",
     "Die serverseitig ermittelte Spielerquelle der Anfrage",
     "Die zuletzt ausgewählte Spieler-ID in der Tabelle"
    ],
    "explanation": "Die Ziel-ID aus der Oberfläche ist nicht die Identität des Akteurs.",
    "correct": 1
   }
  ]
 },
 {
  "id": "fivemadmin-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Spielerliste aus Serversnapshot",
   "example": "Momentaufnahme: Spieler 17 und 23 sind online.\nSpieler 23 verlässt den Server.\nVor einer Aktion für 23: Server lädt den aktuellen Spielerstatus und verwirft die Aktion, falls das Ziel fehlt.",
   "solution": "Momentaufnahme: Spieler 17 und 23 sind online.\nSpieler 23 verlässt den Server.\nVor einer Aktion für 23: Server lädt den aktuellen Spielerstatus und verwirft die Aktion, falls das Ziel fehlt.",
   "task": "Teste eine Aktion mit einem anwesenden und mit einem inzwischen getrennten Spieler. Notiere die beiden Ergebnisse.",
   "hint": "Die angezeigte Liste ist nur eine Momentaufnahme.",
   "checks": [],
   "keyPoints": [
    "Die angezeigte Liste ist nur eine Momentaufnahme."
   ],
   "example_notes": [
    "Die angezeigte Liste ist nur eine Momentaufnahme."
   ],
   "explanation_steps": [
    "Die angezeigte Liste ist nur eine Momentaufnahme."
   ],
   "mistake": "Die angezeigte Liste ist nur eine Momentaufnahme."
  },
  "questions": [
   {
    "question": "Warum reicht die Spielerliste beim Klick auf eine Aktion nicht als Prüfung?",
    "options": [
     "Die Liste enthält immer alle früheren Spieler.",
     "Ein Spieler kann die Sitzung seit dem Laden der Liste verlassen haben.",
     "GetPlayers verändert automatisch die Rechte."
    ],
    "explanation": "Die Ziel-ID muss zum Ausführungszeitpunkt nochmals geprüft werden.",
    "correct": 1
   },
   {
    "question": "Was sollte die NUI bei einem inzwischen getrennten Ziel anzeigen?",
    "options": [
     "Den alten Eintrag als bestätigten Erfolg",
     "Die neue Source-ID eines zufälligen Spielers",
     "Eine verständliche Fehlermeldung und eine aktualisierbare Liste"
    ],
    "explanation": "Eine fehlgeschlagene Aktion muss für die Bedienperson eindeutig erkennbar sein.",
    "correct": 2
   }
  ]
 },
 {
  "id": "fivemadmin-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "NUI Messages und Callbacks",
   "example": "SendNUIMessage({ action = 'players', players = {} })\nRegisterNUICallback('close', function(_, cb)\n    SetNuiFocus(false, false)\n    cb({ ok = true })\nend)",
   "solution": "SendNUIMessage({ action = 'players', players = {} })\nRegisterNUICallback('close', function(_, cb)\n    SetNuiFocus(false, false)\n    cb({ ok = true })\nend)",
   "task": "Teste das Öffnen und Schließen sowie eine leere Spielerliste. Notiere für jeden Fall, welche Nachricht oder Antwort ankommt.",
   "hint": "Nutze eindeutige action-Werte für Nachrichten und beantworte den Callback mit cb.",
   "checks": [],
   "keyPoints": [
    "Nutze eindeutige action-Werte für Nachrichten und beantworte den Callback mit cb."
   ],
   "example_notes": [
    "Nutze eindeutige action-Werte für Nachrichten und beantworte den Callback mit cb."
   ],
   "explanation_steps": [
    "Nutze eindeutige action-Werte für Nachrichten und beantworte den Callback mit cb."
   ],
   "mistake": "Nutze eindeutige action-Werte für Nachrichten und beantworte den Callback mit cb."
  },
  "questions": [
   {
    "question": "Wie sendet Lua einen Spielerliste-Status an die NUI?",
    "options": [
     "Mit einer ACE-Regel in der HTML-Datei",
     "Mit RegisterNUICallback direkt an die Datenbank",
     "Mit SendNUIMessage und einem erkennbaren action-Wert"
    ],
    "explanation": "SendNUIMessage schickt Daten vom Client-Skript an die Weboberfläche.",
    "correct": 2
   },
   {
    "question": "Wozu dient cb({ ok = true }) im close-Callback?",
    "options": [
     "Es beantwortet die Anfrage der NUI.",
     "Es erteilt dem Spieler eine ACE-Rolle.",
     "Es ersetzt SetNuiFocus."
    ],
    "explanation": "Der Callback bestätigt die Anfrage. Die Fokusänderung passiert separat.",
    "correct": 0
   }
  ]
 },
 {
  "id": "fivemadmin-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Audit-Log",
   "example": "Zeit: 14:02 UTC | Akteur: Test-Admin | Ziel: Testspieler | Aktion: kick | Ergebnis: abgewiesen",
   "solution": "Zeit: 14:02 UTC | Akteur: Test-Admin | Ziel: Testspieler | Aktion: kick | Ergebnis: abgewiesen",
   "task": "Erzeuge je einen Testeintrag für eine erfolgreiche und eine abgewiesene Aktion. Prüfe, dass keine Tokens mitgeschrieben werden.",
   "hint": "Ein Audit-Eintrag braucht Aktion, Ergebnis und Kontext, aber keine Geheimnisse.",
   "checks": [],
   "keyPoints": [
    "Ein Audit-Eintrag braucht Aktion, Ergebnis und Kontext, aber keine Geheimnisse."
   ],
   "example_notes": [
    "Ein Audit-Eintrag braucht Aktion, Ergebnis und Kontext, aber keine Geheimnisse."
   ],
   "explanation_steps": [
    "Ein Audit-Eintrag braucht Aktion, Ergebnis und Kontext, aber keine Geheimnisse."
   ],
   "mistake": "Ein Audit-Eintrag braucht Aktion, Ergebnis und Kontext, aber keine Geheimnisse."
  },
  "questions": [
   {
    "question": "Welches Feld gehört in einen Audit-Eintrag?",
    "options": [
     "Das vollständige Sitzungs-Token",
     "Das Passwort des Akteurs",
     "Das Ergebnis der Aktion"
    ],
    "explanation": "Das Ergebnis hilft, den Verlauf einer Aktion nachzuvollziehen.",
    "correct": 2
   },
   {
    "question": "Warum protokollierst du auch abgewiesene Admin-Aktionen?",
    "options": [
     "Damit sich versuchte Aktionen nachvollziehen lassen.",
     "Damit das Spiel ihnen nachträglich zustimmt.",
     "Damit die Oberfläche weniger Anfragen sendet."
    ],
    "explanation": "Das Protokoll beschreibt tatsächliche Ereignisse, auch Ablehnungen.",
    "correct": 0
   }
  ]
 },
 {
  "id": "fivemadmin-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Kick sicher auslösen",
   "example": "Testmatrix: Leserecht ohne Kick-Recht → ablehnen.\nKick-Recht, Ziel offline → ablehnen.\nKick-Recht, Testziel online und Grund gültig → einmal ausführen und protokollieren.",
   "solution": "Testmatrix: Leserecht ohne Kick-Recht → ablehnen.\nKick-Recht, Ziel offline → ablehnen.\nKick-Recht, Testziel online und Grund gültig → einmal ausführen und protokollieren.",
   "task": "Prüfe im lokalen Testserver die drei Fälle der Testmatrix und notiere Ergebnis und Logeintrag.",
   "hint": "Prüfe Recht, Ziel und Grund serverseitig vor der eigentlichen Aktion.",
   "checks": [],
   "keyPoints": [
    "Prüfe Recht, Ziel und Grund serverseitig vor der eigentlichen Aktion."
   ],
   "example_notes": [
    "Prüfe Recht, Ziel und Grund serverseitig vor der eigentlichen Aktion."
   ],
   "explanation_steps": [
    "Prüfe Recht, Ziel und Grund serverseitig vor der eigentlichen Aktion."
   ],
   "mistake": "Prüfe Recht, Ziel und Grund serverseitig vor der eigentlichen Aktion."
  },
  "questions": [
   {
    "question": "Was muss vor einer Kick-Aktion frisch geprüft werden?",
    "options": [
     "Nur der in der Oberfläche angezeigte Name",
     "Berechtigung des Akteurs und Existenz des Ziels",
     "Nur die Länge der Spielerliste"
    ],
    "explanation": "Die Daten in der Oberfläche können veraltet sein.",
    "correct": 1
   },
   {
    "question": "Was sollte ein abgewiesener Klick auslösen?",
    "options": [
     "Einen Wiederholungsversuch mit einer anderen Ziel-ID",
     "Einen Erfolgseintrag ohne Prüfung",
     "Eine klare Ablehnung ohne Aktion am Ziel"
    ],
    "explanation": "Eine abgewiesene Anfrage darf keinen Seiteneffekt haben.",
    "correct": 2
   }
  ]
 },
 {
  "id": "fivemadmin-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Responsive UI und Accessibility",
   "example": "<label for=\"player-search\">Spieler suchen</label>\n<input id=\"player-search\" type=\"search\">\n<p role=\"status\" id=\"player-status\"></p>\n<button type=\"button\">Panel schließen</button>",
   "solution": "<label for=\"player-search\">Spieler suchen</label>\n<input id=\"player-search\" type=\"search\">\n<p role=\"status\" id=\"player-status\"></p>\n<button type=\"button\">Panel schließen</button>",
   "task": "Baue Suche, Status und Schließen-Schaltfläche. Teste die Oberfläche in einem schmalen Fenster mit Tab, Enter und Escape.",
   "hint": "Verwende native Buttons und beschriftete Eingaben.",
   "checks": [],
   "keyPoints": [
    "Verwende native Buttons und beschriftete Eingaben."
   ],
   "example_notes": [
    "Verwende native Buttons und beschriftete Eingaben."
   ],
   "explanation_steps": [
    "Verwende native Buttons und beschriftete Eingaben."
   ],
   "mistake": "Verwende native Buttons und beschriftete Eingaben."
  },
  "questions": [
   {
    "question": "Welches Element lässt sich standardmäßig mit der Tastatur aktivieren?",
    "options": [
     "Ein HTML-button",
     "Ein div mit Klick-Handler",
     "Ein span mit einer CSS-Klasse"
    ],
    "explanation": "Native Buttons sind fokussierbar und haben eingebautes Tastaturverhalten.",
    "correct": 0
   },
   {
    "question": "Wie sollte ein Spielername als reiner Text eingefügt werden?",
    "options": [
     "Mit innerHTML aus dem Namen",
     "Mit textContent",
     "Mit dem Namen als JavaScript-Code"
    ],
    "explanation": "textContent behandelt fremde Namen als Text.",
    "correct": 1
   }
  ]
 },
 {
  "id": "fivemadmin-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Suchfunktion und Pagination",
   "example": "const matching = players.filter(player =>\n  player.name.toLowerCase().includes(query.trim().toLowerCase())\n);\nconst offset = (page - 1) * pageSize;\nconst visible = matching.slice(offset, offset + pageSize);",
   "solution": "const matching = players.filter(player =>\n  player.name.toLowerCase().includes(query.trim().toLowerCase())\n);\nconst offset = (page - 1) * pageSize;\nconst visible = matching.slice(offset, offset + pageSize);",
   "task": "Teste eine Suche mit Treffern, ohne Treffer und auf Seite 2. Setze beim Ändern der Suche die Seite zurück.",
   "hint": "Filtere zuerst und teile die Trefferliste erst danach in Seiten.",
   "checks": [],
   "keyPoints": [
    "Filtere zuerst und teile die Trefferliste erst danach in Seiten."
   ],
   "example_notes": [
    "Filtere zuerst und teile die Trefferliste erst danach in Seiten."
   ],
   "explanation_steps": [
    "Filtere zuerst und teile die Trefferliste erst danach in Seiten."
   ],
   "mistake": "Filtere zuerst und teile die Trefferliste erst danach in Seiten."
  },
  "questions": [
   {
    "question": "Wann sollte die Trefferliste in Seiten geteilt werden?",
    "options": [
     "Nach dem Filtern",
     "Vor dem Filtern",
     "Nur während eines Ladefehlers"
    ],
    "explanation": "Sonst findet die Suche nur Treffer auf der bereits ausgewählten Seite.",
    "correct": 0
   },
   {
    "question": "Was sollte bei einem neuen Suchbegriff mit der Seitennummer passieren?",
    "options": [
     "Automatisch zur letzten alten Seite",
     "Zurück auf Seite 1",
     "Die Seitennummer verdoppeln"
    ],
    "explanation": "Die neu gefilterte Liste kann deutlich kürzer sein.",
    "correct": 1
   }
  ]
 },
 {
  "id": "fullstack-pro-lab-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Bearbeite und teste diesen Projektschritt in deiner lokalen Anwendung. Halte die geforderten Testfälle und Ergebnisse fest."
  }
 },
 {
  "id": "fivemadmin-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "QBCore Adapter",
   "example": "local function readPlayerSummary(playerId)\n    local player = QBCore.Functions.GetPlayer(playerId)\n    if not player then return nil end\n    return { id = playerId }\nend",
   "solution": "local function readPlayerSummary(playerId)\n    local player = QBCore.Functions.GetPlayer(playerId)\n    if not player then return nil end\n    return { id = playerId }\nend",
   "task": "Teste die read-only Funktion mit einer online und einer nicht mehr verbundenen Spieler-ID. Notiere die Rückgabewerte.",
   "hint": "Prüfe, ob GetPlayer überhaupt ein Objekt liefert, bevor du Felder ausliest.",
   "checks": [],
   "keyPoints": [
    "Prüfe, ob GetPlayer überhaupt ein Objekt liefert, bevor du Felder ausliest."
   ],
   "example_notes": [
    "Prüfe, ob GetPlayer überhaupt ein Objekt liefert, bevor du Felder ausliest."
   ],
   "explanation_steps": [
    "Prüfe, ob GetPlayer überhaupt ein Objekt liefert, bevor du Felder ausliest."
   ],
   "mistake": "Prüfe, ob GetPlayer überhaupt ein Objekt liefert, bevor du Felder ausliest."
  },
  "questions": [
   {
    "question": "Was muss der Adapter prüfen, bevor er Felder am Player-Objekt liest?",
    "options": [
     "Ob die NUI gerade geöffnet ist",
     "Ob GetPlayer ein Spielerobjekt zurückgegeben hat",
     "Ob der Anzeigename ein Leerzeichen enthält"
    ],
    "explanation": "Ein nicht verbundener Spieler kann kein Spielerobjekt liefern.",
    "correct": 1
   },
   {
    "question": "Warum gibt die Funktion nur eine Zusammenfassung zurück?",
    "options": [
     "Die Spielersitzung wird dadurch automatisch verlängert.",
     "Die ACE-Regeln werden durch den Rückgabewert ersetzt.",
     "Die Oberfläche erhält nur die Felder, die sie für diese Ansicht braucht."
    ],
    "explanation": "Der Adapter hält den Datenvertrag klein und stabil.",
    "correct": 2
   }
  ]
 },
 {
  "id": "fivemadmin-11",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "ESX und OX Adapter",
   "example": "Vertrag: getPlayerSummary(id) → { id, displayName } oder nil\nESX-Adapter: liest ESX-Daten.\nOX-Adapter: liest OX-Daten.\nDie Oberfläche verarbeitet in beiden Fällen denselben Vertrag.",
   "solution": "Vertrag: getPlayerSummary(id) → { id, displayName } oder nil\nESX-Adapter: liest ESX-Daten.\nOX-Adapter: liest OX-Daten.\nDie Oberfläche verarbeitet in beiden Fällen denselben Vertrag.",
   "task": "Beschreibe den Rückgabevertrag und teste ihn mit einem gefundenen und einem fehlenden Spieler für deine installierte Framework-Version.",
   "hint": "Die Oberfläche soll die konkrete Framework-API nicht kennen müssen.",
   "checks": [],
   "keyPoints": [
    "Die Oberfläche soll die konkrete Framework-API nicht kennen müssen."
   ],
   "example_notes": [
    "Die Oberfläche soll die konkrete Framework-API nicht kennen müssen."
   ],
   "explanation_steps": [
    "Die Oberfläche soll die konkrete Framework-API nicht kennen müssen."
   ],
   "mistake": "Die Oberfläche soll die konkrete Framework-API nicht kennen müssen."
  },
  "questions": [
   {
    "question": "Was sollte für ESX- und OX-Implementierungen gleich bleiben?",
    "options": [
     "Der interne Name jeder Framework-Funktion",
     "Die Versionsnummer der Frameworks",
     "Der Rückgabevertrag von getPlayerSummary"
    ],
    "explanation": "Die Adapter können intern unterschiedliche APIs verwenden.",
    "correct": 2
   },
   {
    "question": "Was sollte der Adapter für einen nicht gefundenen Spieler liefern?",
    "options": [
     "Den im Vertrag vorgesehenen fehlenden Wert, zum Beispiel nil",
     "Ein frei erfundenes Spielerobjekt",
     "Immer den vorherigen Spieler"
    ],
    "explanation": "Ein definierter Fehlerfall verhindert eine Aktion auf einem falschen Ziel.",
    "correct": 0
   }
  ]
 },
 {
  "id": "fivemadmin-13",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Release mit Rollback",
   "example": "Release v1.2: fxmanifest.lua, Client, Server, HTML und Changelog.\nVor Installation: v1.1 und passende Konfiguration sichern.\nBei Fehlstart: v1.1 wiederherstellen, Resource starten und Funktionen prüfen.",
   "solution": "Release v1.2: fxmanifest.lua, Client, Server, HTML und Changelog.\nVor Installation: v1.1 und passende Konfiguration sichern.\nBei Fehlstart: v1.1 wiederherstellen, Resource starten und Funktionen prüfen.",
   "task": "Erstelle ein versioniertes ZIP und simuliere die Wiederherstellung der vorherigen Version auf dem Testserver.",
   "hint": "Sichere die vorherige Version samt Konfiguration vor dem Update.",
   "checks": [],
   "keyPoints": [
    "Sichere die vorherige Version samt Konfiguration vor dem Update."
   ],
   "example_notes": [
    "Sichere die vorherige Version samt Konfiguration vor dem Update."
   ],
   "explanation_steps": [
    "Sichere die vorherige Version samt Konfiguration vor dem Update."
   ],
   "mistake": "Sichere die vorherige Version samt Konfiguration vor dem Update."
  },
  "questions": [
   {
    "question": "Was brauchst du für ein reproduzierbares Rollback?",
    "options": [
     "Nur die Versionsnummer im neuen Changelog",
     "Die vorige veröffentlichte Version samt passender Konfiguration",
     "Einen Screenshot der Oberfläche"
    ],
    "explanation": "Das alte Paket und seine Konfiguration machen die Wiederherstellung nachvollziehbar.",
    "correct": 1
   },
   {
    "question": "Was prüfst du nach dem Wiederherstellen der alten Version?",
    "options": [
     "Nur ob das neue ZIP weiterhin herunterladbar ist.",
     "Nur ob sich der Dateiname geändert hat.",
     "Ob die Resource startet und die wichtigsten Aktionen funktionieren."
    ],
    "explanation": "Ein Rollback ist erst nach einem Funktionstest bestätigt.",
    "correct": 2
   }
  ]
 },
 {
  "id": "fivemadmin-12",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Aufgabe an deiner Adminpanel-Resource auf einem eigenen FXServer. Notiere den Test und das erwartete sowie beobachtete Ergebnis.",
   "title": "Fehlerfälle und Tests",
   "example": "Fall: Spieler trennt sich zwischen Anzeige und Klick.\nAktion: Anfrage mit seiner bisherigen Source-ID senden.\nErwartet: Ziel fehlt, keine Änderung, verständliche Fehlermeldung.",
   "solution": "Fall: Spieler trennt sich zwischen Anzeige und Klick.\nAktion: Anfrage mit seiner bisherigen Source-ID senden.\nErwartet: Ziel fehlt, keine Änderung, verständliche Fehlermeldung.",
   "task": "Dokumentiere für die geforderten Integrationsfälle Ausgangslage, Aktion und erwartetes Ergebnis. Führe die Tests lokal aus.",
   "hint": "Beobachte auch Seiteneffekte. Eine Fehlermeldung allein reicht als Testbeweis nicht.",
   "checks": [],
   "keyPoints": [
    "Beobachte auch Seiteneffekte. Eine Fehlermeldung allein reicht als Testbeweis nicht."
   ],
   "example_notes": [
    "Beobachte auch Seiteneffekte. Eine Fehlermeldung allein reicht als Testbeweis nicht."
   ],
   "explanation_steps": [
    "Beobachte auch Seiteneffekte. Eine Fehlermeldung allein reicht als Testbeweis nicht."
   ],
   "mistake": "Beobachte auch Seiteneffekte. Eine Fehlermeldung allein reicht als Testbeweis nicht."
  },
  "questions": [
   {
    "question": "Was prüfst du zusätzlich zur Fehlermeldung eines abgewiesenen Aufrufs?",
    "options": [
     "Dass keine Änderung am Ziel stattgefunden hat.",
     "Dass der Browser automatisch neu geladen wurde.",
     "Dass die Ziel-ID zu einem anderen Spieler gewechselt hat."
    ],
    "explanation": "Ein Fehler ist nur dann korrekt behandelt, wenn die verbotene Aktion ausbleibt.",
    "correct": 0
   },
   {
    "question": "Warum gehört ein Doppelklick in die Testfälle?",
    "options": [
     "Ein Doppelklick vergibt automatisch ACE-Rechte.",
     "Eine Aktion kann sonst unbeabsichtigt zweimal ausgeführt werden.",
     "Ein Doppelklick löscht die Resource aus dem Server."
    ],
    "explanation": "Tests sollten wiederholte Eingaben und ihre Seiteneffekte abdecken.",
    "correct": 1
   }
  ]
 },
 {
  "id": "fullstack-pro-lab-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Bearbeite und teste diesen Projektschritt in deiner lokalen Anwendung. Halte die geforderten Testfälle und Ergebnisse fest."
  }
 },
 {
  "id": "fullstack-pro-lab-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Bearbeite und teste diesen Projektschritt in deiner lokalen Anwendung. Halte die geforderten Testfälle und Ergebnisse fest."
  }
 },
 {
  "id": "javascript-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Erstelle eine lokale HTML-Datei mit den benötigten Elementen und öffne sie im Browser. Führe die Aktion aus und notiere das sichtbare Ergebnis. Lege einen button an und prüfe, dass erst ein Klick die Ausgabe erzeugt."
  },
  "questions": [
   {
    "question": "Wann läuft die Funktion, die du mit addEventListener(\"click\", handler) registrierst?",
    "options": [
     "Sofort beim Registrieren",
     "Wenn das Element angeklickt wird",
     "Erst beim Schließen der Seite"
    ],
    "explanation": "addEventListener registriert den Handler für spätere Ereignisse.",
    "correct": 1
   },
   {
    "question": "Was gibt querySelector zurück, wenn kein Element passt?",
    "options": [
     "Eine leere Zeichenkette",
     "Eine leere Liste",
     "null"
    ],
    "explanation": "Prüfe den Rückgabewert, bevor du Methoden auf dem Element aufrufst.",
    "correct": 2
   }
  ]
 },
 {
  "id": "javascript-12",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Erstelle eine lokale HTML-Datei mit den benötigten Elementen und öffne sie im Browser. Führe die Aktion aus und notiere das sichtbare Ergebnis. Lege ein Element mit id=\"name\" an und prüfe, dass die Zeichenfolge sichtbar als Text erscheint."
  },
  "questions": [
   {
    "question": "Wie fügt textContent den Wert \"<strong>Hallo</strong>\" in ein Element ein?",
    "options": [
     "Als sichtbaren Text mit den spitzen Klammern",
     "Als fett formatierte HTML-Auszeichnung",
     "Als Fehler in der Konsole"
    ],
    "explanation": "textContent erzeugt Textinhalt. Der String wird dabei nicht als HTML geparst.",
    "correct": 0
   },
   {
    "question": "Welche Eigenschaft passt für einen fremden Anzeigenamen, der als Text erscheinen soll?",
    "options": [
     "innerHTML",
     "textContent",
     "outerHTML"
    ],
    "explanation": "Für reine Textwerte ist textContent die passende DOM-Schnittstelle.",
    "correct": 1
   }
  ]
 },
 {
  "id": "lua-masterlab-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Resource auf deinem eigenen FXServer. Notiere die in der Aufgabe geforderten Testfälle und ihre beobachteten Ergebnisse."
  }
 },
 {
  "id": "lua-masterlab-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Resource auf deinem eigenen FXServer. Notiere die in der Aufgabe geforderten Testfälle und ihre beobachteten Ergebnisse."
  }
 },
 {
  "id": "lua-masterlab-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Resource auf deinem eigenen FXServer. Notiere die in der Aufgabe geforderten Testfälle und ihre beobachteten Ergebnisse."
  }
 },
 {
  "id": "lua-masterlab-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Resource auf deinem eigenen FXServer. Notiere die in der Aufgabe geforderten Testfälle und ihre beobachteten Ergebnisse."
  }
 },
 {
  "id": "nodejs-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit Node.js und den benötigten Projektdateien aus. Notiere den Befehl und die beobachtete Ausgabe."
  }
 },
 {
  "id": "nodejs-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit Node.js und den benötigten Projektdateien aus. Notiere den Befehl und die beobachtete Ausgabe."
  }
 },
 {
  "id": "nodejs-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit Node.js und den benötigten Projektdateien aus. Notiere den Befehl und die beobachtete Ausgabe."
  }
 },
 {
  "id": "nodejs-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit Node.js und den benötigten Projektdateien aus. Notiere den Befehl und die beobachtete Ausgabe."
  }
 },
 {
  "id": "nui-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte. Lege einen Button mit id=\"start\" an und prüfe, dass zwei Klicks nacheinander 1 und 2 ausgeben."
  }
 },
 {
  "id": "nui-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte."
  }
 },
 {
  "id": "nui-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte."
  }
 },
 {
  "id": "nui-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte."
  }
 },
 {
  "id": "nui-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte."
  }
 },
 {
  "id": "nui-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste HTML und JavaScript in einer eigenen Webseite und den Austausch mit NUI in einer lokalen FiveM-Resource. Notiere, welche Aktion welches Ergebnis hatte."
  }
 },
 {
  "id": "ox-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit den genannten OX-Abhängigkeiten. Notiere Eingabe, Ergebnis und gegebenenfalls die Konsolenausgabe."
  }
 },
 {
  "id": "ox-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit den genannten OX-Abhängigkeiten. Notiere Eingabe, Ergebnis und gegebenenfalls die Konsolenausgabe."
  }
 },
 {
  "id": "ox-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit den genannten OX-Abhängigkeiten. Notiere Eingabe, Ergebnis und gegebenenfalls die Konsolenausgabe."
  }
 },
 {
  "id": "ox-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit den genannten OX-Abhängigkeiten. Notiere Eingabe, Ergebnis und gegebenenfalls die Konsolenausgabe."
  }
 },
 {
  "id": "ox-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit den genannten OX-Abhängigkeiten. Notiere Eingabe, Ergebnis und gegebenenfalls die Konsolenausgabe."
  }
 },
 {
  "id": "python-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Installiere requests lokal in einer virtuellen Python-Umgebung und teste die GET-Anfrage. Notiere den HTTP-Status und was bei einem Timeout passiert."
  },
  "questions": [
   {
    "question": "Welches Attribut von response enthält den HTTP-Statuscode?",
    "options": [
     "response.headers",
     "response.status_code",
     "response.text"
    ],
    "explanation": "status_code enthält beispielsweise 200 oder 404 als Zahl.",
    "correct": 1
   },
   {
    "question": "Wozu dient timeout=5 bei requests.get?",
    "options": [
     "Es wiederholt die Anfrage fünfmal.",
     "Es erwartet genau fünf Bytes als Antwort.",
     "Es begrenzt, wie lange auf eine Netzwerkantwort gewartet wird."
    ],
    "explanation": "Ein Timeout verhindert, dass der Abruf unbegrenzt auf Daten wartet.",
    "correct": 2
   }
  ]
 },
 {
  "id": "python-pro-lab-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Projektschritt lokal in Python mit den angegebenen Dateien und Abhängigkeiten aus. Notiere den Testbefehl und sein Ergebnis."
  }
 },
 {
  "id": "python-pro-lab-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Projektschritt lokal in Python mit den angegebenen Dateien und Abhängigkeiten aus. Notiere den Testbefehl und sein Ergebnis."
  }
 },
 {
  "id": "python-workshop-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Starte die Datei im lokalen Python-Terminal und gib nacheinander 17, -1 und abc ein. Notiere bei jeder Eingabe die Ausgabe."
  },
  "questions": [
   {
    "question": "Welcher Fehler entsteht bei int(\"abc\")?",
    "options": [
     "FileNotFoundError",
     "ValueError",
     "ZeroDivisionError"
    ],
    "explanation": "Der Wert ist Text, der sich nicht in eine ganze Zahl umwandeln lässt.",
    "correct": 1
   },
   {
    "question": "Wo prüfst du den Bereich 0 bis 120?",
    "options": [
     "Vor input(), noch ohne Eingabe",
     "Nur innerhalb des except-Zweigs",
     "Nach der erfolgreichen Umwandlung in eine Zahl"
    ],
    "explanation": "Erst nach der Umwandlung steht eine Zahl zur Verfügung, die du vergleichen kannst.",
    "correct": 2
   }
  ]
 },
 {
  "id": "python-pro-lab-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Projektschritt lokal in Python mit den angegebenen Dateien und Abhängigkeiten aus. Notiere den Testbefehl und sein Ergebnis."
  }
 },
 {
  "id": "python-pro-lab-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Projektschritt lokal in Python mit den angegebenen Dateien und Abhängigkeiten aus. Notiere den Testbefehl und sein Ergebnis."
  }
 },
 {
  "id": "python-pro-lab-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Projektschritt lokal in Python mit den angegebenen Dateien und Abhängigkeiten aus. Notiere den Testbefehl und sein Ergebnis."
  }
 },
 {
  "id": "qbcore-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-11",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-14",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-12",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-15",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-16",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-17",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-20",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "qbcore-advanced-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste in einer lokalen FiveM-Resource mit geladenem qb-core. Notiere den Normalfall und einen abgewiesenen oder ungültigen Fall."
  }
 },
 {
  "id": "security-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "security-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "security-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "security-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "security-advanced-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "security-advanced-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen FXServer oder einen lokalen Test mit Testdaten. Notiere einen erlaubten und einen abgewiesenen Fall und begründe beide Ergebnisse."
  }
 },
 {
  "id": "api-04",
  "patch": {
   "task": "Schreibe eine Funktion, die nur positive ganze Beträge akzeptiert. Gib die Ergebnisse für 3, 0 und „3“ aus.",
   "example": "function isValidAmount(amount) {\n  return Number.isInteger(amount) && amount > 0;\n}\nconsole.log(isValidAmount(3), isValidAmount(0), isValidAmount(\"3\"));",
   "solution": "function isValidAmount(amount) {\n  return Number.isInteger(amount) && amount > 0;\n}\nconsole.log(isValidAmount(3), isValidAmount(0), isValidAmount(\"3\"));",
   "checks": [
    "Number\\.isInteger",
    "console\\.log"
   ],
   "hint": "Number.isInteger wandelt Text vor der Prüfung nicht in eine Zahl um."
  },
  "questions": [
   {
    "question": "Was ergibt Number.isInteger(\"3\")?",
    "options": [
     "true",
     "false",
     "3"
    ],
    "explanation": "Ein String wird von Number.isInteger nicht umgewandelt.",
    "correct": 1
   },
   {
    "question": "Welche Zusatzbedingung schließt 0 und negative Ganzzahlen aus?",
    "options": [
     "amount !== undefined",
     "amount < 0",
     "amount > 0"
    ],
    "explanation": "Die Aufgabe akzeptiert nur positive Ganzzahlen.",
    "correct": 2
   }
  ]
 },
 {
  "id": "api-05",
  "patch": {
   "task": "Begrenze ein angefordertes positives Seitenlimit auf höchstens 100. Verwende 20, wenn kein Limit übergeben wird. Gib die Ergebnisse für 150 und für einen fehlenden Wert aus.",
   "example": "function pageLimit(requestedLimit = 20) {\n  return Math.min(100, requestedLimit);\n}\nconsole.log(pageLimit(150), pageLimit());",
   "solution": "function pageLimit(requestedLimit = 20) {\n  return Math.min(100, requestedLimit);\n}\nconsole.log(pageLimit(150), pageLimit());",
   "checks": [
    "Math\\.min",
    "console\\.log"
   ],
   "hint": "Prüfe den Grenzwert 100 und den Standardwert 20 getrennt."
  },
  "questions": [
   {
    "question": "Was ergibt Math.min(100, 150)?",
    "options": [
     "150",
     "250",
     "100"
    ],
    "explanation": "Math.min liefert den kleineren der beiden Werte.",
    "correct": 2
   },
   {
    "question": "Was liefert pageLimit() bei function pageLimit(limit = 20) { return Math.min(100, limit); }?",
    "options": [
     "20",
     "100",
     "undefined"
    ],
    "explanation": "Der Standardparameter übernimmt den Wert 20.",
    "correct": 0
   }
  ]
 },
 {
  "id": "testing-01",
  "patch": {
   "task": "Protokolliere für die Eingabe 4 den Sollwert 8 und das tatsächlich berechnete Doppelte. Gib die drei Werte in einer Zeile aus.",
   "example": "const input = 4;\nconst expected = 8;\nconst actual = input * 2;\nconsole.log(input, expected, actual);",
   "solution": "const input = 4;\nconst expected = 8;\nconst actual = input * 2;\nconsole.log(input, expected, actual);",
   "checks": [
    "console\\.log",
    "expected",
    "actual"
   ],
   "hint": "Berechne den Istwert aus der Eingabe. Vergleiche ihn anschließend mit dem Sollwert."
  },
  "questions": [
   {
    "question": "Was ist der Sollwert beim Test „verdopple 4“?",
    "options": [
     "4",
     "8",
     "Der aktuell ausgegebene Wert, egal wie er lautet"
    ],
    "explanation": "Den Sollwert legst du unabhängig von der getesteten Implementierung fest.",
    "correct": 1
   },
   {
    "question": "Warum protokollierst du bei einem Fehler Eingabe, Sollwert und Istwert?",
    "options": [
     "Damit der Logger den Code automatisch korrigiert.",
     "Damit derselbe Wert dreimal gespeichert wird.",
     "Damit der konkrete Fehlerfall reproduzierbar wird."
    ],
    "explanation": "Mit diesen drei Werten kannst du den fehlgeschlagenen Fall nachstellen und vergleichen.",
    "correct": 2
   }
  ]
 },
 {
  "id": "testing-02",
  "patch": {
   "task": "Schreibe sum(a,b) und prüfe zwei Fälle: 2 + 3 ergibt 5, und 0 + (-2) ergibt -2. Gib das Ergebnis beider Vergleiche aus.",
   "example": "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(2, 3) === 5, sum(0, -2) === -2);",
   "solution": "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(2, 3) === 5, sum(0, -2) === -2);",
   "checks": [
    "function\\s+sum\\s*\\(",
    "===",
    "console\\.log"
   ],
   "hint": "Ein Test vergleicht das Ergebnis der Funktion mit dem erwarteten Wert. Teste auch den Fall mit 0."
  },
  "questions": [
   {
    "question": "Welcher Ausdruck prüft, dass sum(2, 3) genau 5 liefert?",
    "options": [
     "sum(2, 3) = 5",
     "sum(2, 3) === \"5\"",
     "sum(2, 3) === 5"
    ],
    "explanation": "=== vergleicht in JavaScript Wert und Typ.",
    "correct": 2
   },
   {
    "question": "Welcher zweite Test deckt in dieser Übung Null und eine negative Zahl ab?",
    "options": [
     "sum(0, -2) === -2",
     "sum(1, 1) === 2",
     "sum(10, 5) === 15"
    ],
    "explanation": "Damit prüfst du eine andere Eingabeklasse als im ersten Test.",
    "correct": 0
   }
  ]
 },
 {
  "id": "python-pro-lab-02",
  "patch": {
   "task": "Definiere eine Dataclass Task mit einem Textfeld title. Erzeuge eine Aufgabe mit dem Titel Test und gib das Attribut aus.",
   "example": "from dataclasses import dataclass\n\n@dataclass\nclass Task:\n    title: str\n\ntask = Task(\"Test\")\nprint(task.title)",
   "solution": "from dataclasses import dataclass\n\n@dataclass\nclass Task:\n    title: str\n\ntask = Task(\"Test\")\nprint(task.title)",
   "checks": [
    "@dataclass",
    "class\\s+Task",
    "print\\s*\\("
   ],
   "hint": "Importiere dataclass aus der Standardbibliothek. Der Dekorator erstellt den Konstruktor."
  },
  "questions": [
   {
    "question": "Was übernimmt @dataclass im Beispiel für die Klasse Task?",
    "options": [
     "Es speichert jede Instanz in einer Datenbank.",
     "Es erzwingt den Typ str bei jedem Aufruf.",
     "Es erzeugt unter anderem einen Konstruktor für title."
    ],
    "explanation": "Der Dekorator erzeugt Standardmethoden anhand der definierten Felder.",
    "correct": 2
   },
   {
    "question": "Wie liest du bei task = Task(\"Test\") das Titelfeld?",
    "options": [
     "task.title",
     "Task.title()",
     "task[\"title\"]"
    ],
    "explanation": "title ist ein Attribut der Task-Instanz.",
    "correct": 0
   }
  ]
 },
 {
  "id": "security-02",
  "patch": {
   "task": "Prüfe einen Betrag lokal mit einer Lua-Funktion. Gib aus, ob 5, 0, 1001 und der Text „5“ zulässig sind. Gültig sind Zahlen größer 0 bis 1000.",
   "example": "local function validAmount(amount)\n    return type(amount) == \"number\" and amount > 0 and amount <= 1000\nend\nprint(validAmount(5), validAmount(0), validAmount(1001), validAmount(\"5\"))",
   "solution": "local function validAmount(amount)\n    return type(amount) == \"number\" and amount > 0 and amount <= 1000\nend\nprint(validAmount(5), validAmount(0), validAmount(1001), validAmount(\"5\"))",
   "checks": [
    "type\\s*\\(",
    "function",
    "print\\s*\\("
   ],
   "hint": "Prüfe erst den Typ, damit Lua einen Textwert nicht mit einer Zahl vergleichen muss."
  },
  "questions": [
   {
    "question": "Warum prüft validAmount zuerst type(amount)?",
    "options": [
     "Damit jede Eingabe automatisch zu Text wird.",
     "Damit die obere Grenze übersprungen werden kann.",
     "Damit nicht versehentlich ein Text mit einer Zahl verglichen wird."
    ],
    "explanation": "Lua wertet and von links nach rechts aus und bricht beim ersten falschen Teil ab.",
    "correct": 2
   },
   {
    "question": "Welche Eingabe akzeptiert die gezeigte Prüfung?",
    "options": [
     "Die Zahl 5",
     "Den Text \"5\"",
     "Die Zahl 1001"
    ],
    "explanation": "Gültig sind Zahlen größer 0 und höchstens 1000.",
    "correct": 0
   }
  ]
 },
 {
  "id": "security-04",
  "patch": {
   "task": "Lege den Preis der Reparatur serverseitig in einer Tabelle fest und gib ihn aus. Verwende den Preis 500.",
   "example": "local prices = { repair = 500 }\nprint(prices.repair)",
   "solution": "local prices = { repair = 500 }\nprint(prices.repair)",
   "checks": [
    "local",
    "print\\s*\\("
   ],
   "hint": "Der Server liest den Preis anhand der Aktion aus seiner eigenen Preisliste."
  },
  "questions": [
   {
    "question": "Woher kommt der gültige Reparaturpreis?",
    "options": [
     "Aus dem Preisfeld der Client-Anfrage",
     "Aus der eigenen Preistabelle des Servers",
     "Aus dem zuletzt angezeigten NUI-Text"
    ],
    "explanation": "Der Server bestimmt den verbindlichen Preis anhand der Aktion.",
    "correct": 1
   },
   {
    "question": "Was enthält prices.repair bei local prices = { repair = 500 }?",
    "options": [
     "Den Text \"repair\"",
     "nil",
     "500"
    ],
    "explanation": "repair ist ein Tabellenschlüssel mit dem Zahlenwert 500.",
    "correct": 2
   }
  ]
 },
 {
  "id": "lua-02",
  "questions": [
   {
    "question": "Welche Zeile wird von Lua als Kommentar ignoriert?",
    "options": [
     "print(\"-- Status anzeigen\")",
     "status = \"Status anzeigen\"",
     "-- Status anzeigen"
    ],
    "explanation": "-- eröffnet außerhalb einer Zeichenkette einen Zeilenkommentar.",
    "correct": 2
   },
   {
    "question": "Welche Ausgabe entsteht bei „-- print(1)“ und auf der nächsten Zeile „print(2)“?",
    "options": [
     "Nur 2",
     "1 und 2",
     "Keine Ausgabe"
    ],
    "explanation": "Ein Zeilenkommentar endet am Zeilenumbruch.",
    "correct": 0
   }
  ]
 },
 {
  "id": "lua-22",
  "patch": {
   "task": "Wandle einen selbst gewählten Namen mit string.lower in Kleinbuchstaben um und gib das Ergebnis aus."
  },
  "questions": [
   {
    "question": "Was gibt print(string.lower(\"ABC\")) aus?",
    "options": [
     "ABC",
     "abc",
     "123"
    ],
    "explanation": "string.lower wandelt die Buchstaben der Zeichenkette in Kleinbuchstaben um.",
    "correct": 1
   },
   {
    "question": "Wie kann ein in name gespeicherter Text in Kleinbuchstaben ausgegeben werden?",
    "options": [
     "print(\"string.lower(name)\")",
     "print(string.upper(name))",
     "print(string.lower(name))"
    ],
    "explanation": "string.lower verarbeitet den Wert der Variablen. print gibt den zurückgegebenen Text aus.",
    "correct": 2
   }
  ]
 },
 {
  "id": "html-01",
  "questions": [
   {
    "question": "Was signalisiert <!doctype html> am Anfang einer HTML-Datei?",
    "options": [
     "Der Inhalt soll als JavaScript ausgeführt werden.",
     "Der Browser soll das Dokument im Standards-Modus darstellen.",
     "Die Seite soll automatisch auf Deutsch übersetzt werden."
    ],
    "explanation": "Der moderne HTML-Doctype verhindert bei normalen Dokumenten den Quirks-Modus.",
    "correct": 1
   },
   {
    "question": "Welches Attribut kennzeichnet die Sprache der Seite für Browser und Hilfstechnologien?",
    "options": [
     "charset am body-Element",
     "title am h1-Element",
     "lang am html-Element"
    ],
    "explanation": "lang=\"de\" gibt Deutsch als Sprache des Dokuments an.",
    "correct": 2
   }
  ]
 },
 {
  "id": "coding-basics-path-009",
  "video_id": "LW7g1169v7w",
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": "LW7g1169v7w",
   "videoStart": 0,
   "video_guide": {
    "name": "CS50P · Exceptions",
    "author": "Harvard CS50",
    "language": "Englisch",
    "focus": "Achte darauf, wie try und except einen ValueError beim Einlesen abfangen."
   }
  }
 },
 {
  "id": "python-07",
  "video_id": "LW7g1169v7w",
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": "LW7g1169v7w",
   "videoStart": 0,
   "video_guide": {
    "name": "CS50P · Exceptions",
    "author": "Harvard CS50",
    "language": "Englisch",
    "focus": "Achte darauf, wie try und except einen ValueError beim Einlesen abfangen."
   }
  }
 },
 {
  "id": "blender-animation-01",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Keyframes und Interpolation",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Setze zwei Keyframes und vergleiche, wie sich ihre Interpolation auf die Bewegung auswirkt.",
    "url": "https://studio.blender.org/training/blender-fundamentals-45-lts/blender-5-2-keyframes/"
   }
  },
  "questions": [
   {
    "question": "Was speichert ein Location-Keyframe?",
    "options": [
     "Die Bildschirmgröße des Viewports",
     "Die Position an einem bestimmten Frame",
     "Alle Positionen des gesamten Clips"
    ],
    "explanation": "Der Keyframe hält einen Wert zu einer bestimmten Zeit fest.",
    "correct": 1
   },
   {
    "question": "Was passiert bei linearer Interpolation zwischen zwei Positions-Keyframes?",
    "options": [
     "Das Objekt bleibt bis zum letzten Frame stehen.",
     "Blender erzeugt automatisch eine Bezier-Beschleunigung.",
     "Der Wert ändert sich mit gleichmäßiger Rate."
    ],
    "explanation": "Lineare Interpolation verbindet die Werte gleichmäßig zwischen den Keyframes.",
    "correct": 2
   }
  ]
 },
 {
  "id": "blender-animation-path-001",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Keyframes und Interpolation",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Setze zwei Keyframes und vergleiche, wie sich ihre Interpolation auf die Bewegung auswirkt.",
    "url": "https://studio.blender.org/training/blender-fundamentals-45-lts/blender-5-2-keyframes/"
   }
  }
 },
 {
  "id": "blender-animation-path-002",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Keyframes und Interpolation",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Setze zwei Keyframes und vergleiche, wie sich ihre Interpolation auf die Bewegung auswirkt.",
    "url": "https://studio.blender.org/training/blender-fundamentals-45-lts/blender-5-2-keyframes/"
   }
  }
 },
 {
  "id": "blender-animation-path-003",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Keyframes und Interpolation",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Setze zwei Keyframes und vergleiche, wie sich ihre Interpolation auf die Bewegung auswirkt.",
    "url": "https://studio.blender.org/training/blender-fundamentals-45-lts/blender-5-2-keyframes/"
   }
  }
 },
 {
  "id": "blender-animation-02",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Graph Editor und F-Curves",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Öffne den Graph Editor und vergleiche Kurvenform und Bewegung in der Vorschau.",
    "url": "https://studio.blender.org/training/blender-fundamentals-45-lts/blender-5-2-graph-editor/"
   }
  },
  "questions": [
   {
    "question": "Was zeigen die beiden Achsen einer F-Curve?",
    "options": [
     "Die X- und Y-Koordinaten des Objekts im Raum",
     "Bildbreite und Bildhöhe",
     "Zeit und Eigenschaftswert"
    ],
    "explanation": "Im Graph Editor steht die horizontale Achse für Frames und die vertikale für den Wert.",
    "correct": 2
   },
   {
    "question": "Wie wirkt sich eine steilere Kurve auf die Eigenschaft aus?",
    "options": [
     "Der Wert ändert sich schneller.",
     "Der Wert bleibt konstant.",
     "Das Objekt wird automatisch ausgeblendet."
    ],
    "explanation": "Die Steigung beschreibt die Wertänderung pro Zeit.",
    "correct": 0
   }
  ]
 },
 {
  "id": "blender-animation-03",
  "video_id": null,
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": null,
   "videoStart": 0,
   "video_guide": {
    "name": "Parenting",
    "author": "Blender Studio",
    "language": "Englisch",
    "focus": "Beobachte, wie das Kindobjekt auf die Transformation des übergeordneten Objekts reagiert.",
    "url": "https://studio.blender.org/training/blender-2-8-fundamentals/parenting/"
   }
  },
  "questions": [
   {
    "question": "Was passiert mit einem Kindobjekt, wenn du sein Parent-Objekt bewegst?",
    "options": [
     "Es folgt der Transformation des Parents.",
     "Es wird automatisch gelöscht.",
     "Es bewegt das Parent-Objekt in die Gegenrichtung."
    ],
    "explanation": "Parenting koppelt die Transformation des Kindes an die Hierarchie.",
    "correct": 0
   },
   {
    "question": "Was kannst du mit einem Empty als Parent mehrerer Objekte steuern?",
    "options": [
     "Die Anzahl ihrer Mesh-Vertices",
     "Die gemeinsame Transformation der Gruppe",
     "Die Materialfarbe unabhängig vom Setup"
    ],
    "explanation": "Ein Empty kann die Gruppe bewegen, ohne selbst renderbare Geometrie zu haben.",
    "correct": 1
   }
  ]
 },
 {
  "id": "blender-animation-04",
  "video_id": "CBJp82tlR3M",
  "video_start": 1126,
  "has_video": true,
  "patch": {
   "videoId": "CBJp82tlR3M",
   "videoStart": 1126,
   "video_guide": {
    "name": "Animation for Beginners · Materialwerte animieren",
    "author": "Ryan King Art",
    "language": "Englisch",
    "focus": "Ab 18:46 werden Farbwerte über Keyframes animiert. Übertrage den Ablauf auf einen Lichtwert."
   }
  },
  "questions": [
   {
    "question": "Was speicherst du, um die Lichtstärke zu animieren?",
    "options": [
     "Keyframes nur auf der Kameraposition",
     "Keyframes auf der Lichtleistung",
     "Einen anderen Dateinamen pro Frame"
    ],
    "explanation": "Die Lichtleistung ist eine animierbare Eigenschaft.",
    "correct": 1
   },
   {
    "question": "Welche Eigenschaft animierst du, wenn ein Material seine Grundfarbe ändern soll?",
    "options": [
     "Object Location",
     "Frame Rate",
     "Base Color am Material"
    ],
    "explanation": "Die Materialfarbe liegt am Shader-Eingang Base Color.",
    "correct": 2
   }
  ]
 },
 {
  "id": "blender-animation-05",
  "video_id": "VNs7DyEV6fA",
  "video_start": 0,
  "has_video": true,
  "patch": {
   "videoId": "VNs7DyEV6fA",
   "videoStart": 0,
   "video_guide": {
    "name": "Bewegung entlang eines Pfads",
    "author": "Ryan King Art",
    "language": "Englisch",
    "focus": "Übertrage den gezeigten Follow-Path-Constraint vom Beispielobjekt auf die Kamera."
   }
  },
  "questions": [
   {
    "question": "Was gibt die Bahn einer Kamera mit Follow Path vor?",
    "options": [
     "Die Auflösung des Renderbildes",
     "Die Reihenfolge der Materialien",
     "Eine Kurve, die als Ziel eingetragen ist"
    ],
    "explanation": "Der Constraint verwendet eine Kurve als Bewegungspfad.",
    "correct": 2
   },
   {
    "question": "Was steuert die Blickrichtung einer Kamera auf ein festes Ziel?",
    "options": [
     "Ein zusätzlicher Track-To-Constraint",
     "Die Ausgabedatei der Animation",
     "Die Unterteilung der Kurve allein"
    ],
    "explanation": "Pfadbewegung und Ausrichtung auf ein Ziel sind getrennte Aufgaben.",
    "correct": 0
   }
  ]
 }
]
$repairs$::jsonb) AS patch(
 id text, patch jsonb, questions jsonb, has_video boolean, video_id text, video_start integer
);

UPDATE public.ll_lesson_content AS lesson
SET payload = lesson.payload || coalesce(repair.patch, '{}'::jsonb),
    video_id = CASE WHEN repair.has_video THEN repair.video_id ELSE lesson.video_id END,
    video_start = CASE WHEN repair.has_video THEN repair.video_start ELSE lesson.video_start END
FROM novalab_lesson_repairs AS repair
WHERE lesson.lesson_id = repair.id
  AND (repair.patch IS NOT NULL OR repair.has_video);

CREATE TEMP TABLE novalab_quiz_repairs ON COMMIT DROP AS
WITH old_quizzes AS (
 SELECT lesson.lesson_id, lesson.payload, repair.questions,
        CASE WHEN jsonb_typeof(lesson.payload->'quiz_items') = 'array'
             THEN lesson.payload->'quiz_items' ELSE '[]'::jsonb END AS bank
 FROM public.ll_lesson_content AS lesson
 LEFT JOIN novalab_lesson_repairs AS repair ON repair.id = lesson.lesson_id
), kept AS (
 SELECT old_quizzes.*, filtered.items, filtered.had_placeholder
 FROM old_quizzes
 CROSS JOIN LATERAL (
  SELECT jsonb_agg(item ORDER BY position) FILTER (WHERE NOT placeholder) AS items,
         bool_or(placeholder) AS had_placeholder
  FROM jsonb_array_elements(bank) WITH ORDINALITY AS quiz(item, position)
  CROSS JOIN LATERAL (
   SELECT coalesce(item->>'question', '') LIKE 'Welche praktische Aufgabe gehört zu%'
       OR coalesce(item->>'question', '') LIKE 'Welcher Tipp hilft dir bei%' AS placeholder
  ) AS shape
 ) AS filtered
), rewritten AS (
 SELECT lesson_id, payload, coalesce(questions, items) AS next_bank
 FROM kept
 WHERE questions IS NOT NULL OR had_placeholder
), normalized AS (
 SELECT lesson_id, payload,
        CASE WHEN jsonb_array_length(next_bank) >= 2 THEN next_bank ELSE '[]'::jsonb END AS next_bank,
        next_bank->0 AS primary_question
 FROM rewritten
 WHERE jsonb_array_length(next_bank) >= 1
)
SELECT lesson_id, coalesce((payload->>'quiz_version')::integer, 1) AS old_version,
       next_bank, primary_question
FROM normalized
WHERE payload->'quiz_items' IS DISTINCT FROM next_bank
   OR payload->'quiz' IS DISTINCT FROM primary_question->'question'
   OR payload->'options' IS DISTINCT FROM primary_question->'options'
   OR payload->'correct' IS DISTINCT FROM primary_question->'correct';

UPDATE public.ll_lesson_content AS lesson
SET payload = lesson.payload || jsonb_build_object(
 'quiz_version', repair.old_version + 1,
 'quiz_items', repair.next_bank,
 'quiz', repair.primary_question->'question',
 'quiz_explanation', repair.primary_question->'explanation',
 'options', repair.primary_question->'options',
 'correct', repair.primary_question->'correct'
)
FROM novalab_quiz_repairs AS repair
WHERE lesson.lesson_id = repair.lesson_id;

UPDATE academy_private.academy_lesson_quiz_receipts AS receipt
SET quiz_version = repair.old_version + 1
FROM novalab_quiz_repairs AS repair
WHERE receipt.lesson_id = repair.lesson_id
  AND receipt.quiz_version = repair.old_version
  AND EXISTS (
   SELECT 1 FROM public.academy_progress AS progress
   WHERE progress.user_id = receipt.user_id
     AND progress.key = 'liverylab-v10'
     AND progress.payload->'done' @> jsonb_build_array(receipt.lesson_id)
  );

COMMIT;
