-- Clarify exercise requirements and allow learner-selected values where appropriate.
-- Local practice is used for exercises whose environment is unavailable in the browser.
UPDATE public.ll_lesson_content AS lesson
SET payload = lesson.payload || repair.patch
FROM jsonb_to_recordset($practice$
[
 {
  "id": "lua-01",
  "patch": {
   "task": "Gib deinen Namen und danach einen Satz deiner Wahl mit zwei print-Aufrufen aus. Jeder Aufruf soll genau einen nicht leeren Text ausgeben.",
   "example": "print(\"Alex\")\nprint(\"Heute lerne ich Lua.\")",
   "solution": "print(\"Alex\")\nprint(\"Heute lerne ich Lua.\")",
   "practice_output": "text-lines",
   "practice_line_count": 2,
   "hint": "Jeder Aufruf bekommt einen eigenen Text. Lua erlaubt einfache und doppelte Anführungszeichen.",
   "practice_instruction": "Name und Satz sind frei wählbar."
  }
 },
 {
  "id": "lua-02",
  "patch": {
   "task": "Schreibe einen Zeilenkommentar, der den Zweck einer Startmeldung erklärt. Gib darunter mit print genau eine nicht leere Startmeldung deiner Wahl aus.",
   "practice_output": "text-lines",
   "practice_line_count": 1
  }
 },
 {
  "id": "lua-03",
  "patch": {
   "task": "Lege die lokalen Variablen spielerName (Text) und level (Zahl) an. Wähle beide Werte selbst. Gib beide Variablen in dieser Reihenfolge mit einem Aufruf aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-04",
  "patch": {
   "task": "Lege preis (Zahl), aktiv (Wahrheitswert) und titel (Text) als lokale Variablen an. Wähle die Werte selbst. Gib die drei Datentypen in dieser Reihenfolge mit type aus."
  }
 },
 {
  "id": "lua-05",
  "patch": {
   "task": "Wandle den Text „50“ mit tonumber in eine Zahl um. Speichere das Ergebnis lokal, prüfe, ob die Umwandlung erfolgreich war, und gib dann die Zahl plus 10 aus."
  }
 },
 {
  "id": "lua-06",
  "patch": {
   "task": "Speichere 300 in preis und 50 in rabatt. Berechne daraus den lokalen endpreis und gib ihn aus."
  }
 },
 {
  "id": "lua-07",
  "patch": {
   "task": "Speichere einen frei gewählten Namen in einer lokalen Variable. Verbinde „Willkommen “ und den Namen mit dem Lua-Verkettungsoperator und gib die Meldung aus.",
   "practice_output": "prefix",
   "practice_prefix": "Willkommen "
  }
 },
 {
  "id": "lua-08",
  "patch": {
   "task": "Lege eine lokale Zahl deiner Wahl an. Vergleiche sie mit der Grenze 5 und gib den Wahrheitswert für „größer oder gleich 5“ aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-09",
  "patch": {
   "task": "Schreibe eine if/else-Abfrage ab Level 10. Teste beide Zweige mit einem Level unter 10 und einem Level ab 10. Gib zuerst „Gesperrt“ und danach „Freigeschaltet“ aus. Die Levelwerte kannst du frei wählen.",
   "example": "local function pruefe(level)\n    if level >= 10 then\n        print(\"Freigeschaltet\")\n    else\n        print(\"Gesperrt\")\n    end\nend\npruefe(7)\npruefe(12)",
   "solution": "local function pruefe(level)\n    if level >= 10 then\n        print(\"Freigeschaltet\")\n    else\n        print(\"Gesperrt\")\n    end\nend\npruefe(7)\npruefe(12)"
  }
 },
 {
  "id": "lua-10",
  "patch": {
   "task": "Speichere police oder ambulance in der lokalen Variable job. Verwende if und or für beide erlaubten Jobs und gib bei erlaubtem Job „Zugang“ aus."
  }
 },
 {
  "id": "lua-11",
  "patch": {
   "task": "Zähle mit einer while-Schleife von 1 bis 5. Verwende i als Zähler, erhöhe ihn pro Durchlauf und gib jede Zahl einzeln aus."
  }
 },
 {
  "id": "lua-13",
  "patch": {
   "task": "Lege die Liste fahrzeuge mit drei frei gewählten Namen an. Gib für jeden Eintrag mit ipairs zuerst seine Position und dann den Namen in derselben Zeile aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-14",
  "patch": {
   "task": "Lege eine lokale Tabelle namens garage mit drei frei gewählten Fahrzeugnamen an. Gib zuerst den ersten Namen und danach die Anzahl der Fahrzeuge aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-15",
  "patch": {
   "task": "Lege eine lokale Tabelle player mit name, job und level an. Die Werte kannst du frei wählen. Lies job über den Punktoperator und gib ihn als Text aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-18",
  "patch": {
   "task": "Definiere die lokale Funktion preisMitSteuer(preis). Gib den Preis mit dem Faktor 1,19 zurück. Rufe die Funktion mit 100 auf und gib ihren Rückgabewert aus."
  }
 },
 {
  "id": "lua-19",
  "patch": {
   "task": "Definiere die lokale Funktion zeigePunkte mit einer lokalen Zahl namens punkte. Wähle die Zahl selbst, gib sie in der Funktion aus und rufe die Funktion auf.",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-20",
  "patch": {
   "task": "Schreibe eine lokale Funktion ausfuehren, die den Callback cb mit dem Text „OK“ aufruft. Übergib eine anonyme Funktion, die den empfangenen Text ausgibt."
  }
 },
 {
  "id": "lua-21",
  "patch": {
   "task": "Lege eine leere lokale Tabelle config an. Lies config.maxSlots, verwende als Ersatz 5 und gib das Ergebnis aus."
  }
 },
 {
  "id": "lua-23",
  "patch": {
   "task": "Lege eine lokale Liste namens fahrzeuge mit zwei eigenen Fahrzeugnamen an. Füge einen dritten Namen mit table.insert hinzu und gib die Anzahl aus."
  }
 },
 {
  "id": "lua-24",
  "patch": {
   "task": "Lege eine lokale Tabelle preise mit eigenen Artikeln und Zahlenpreisen an. Gib mit pairs mindestens zwei Paare aus, pro Zeile zuerst den Artikelnamen und dann den Preis.",
   "practice_output": "shape",
   "practice_min_lines": 2
  }
 },
 {
  "id": "lua-26",
  "patch": {
   "task": "Rufe mit pcall eine anonyme Funktion auf, die 42 zurückgibt. Gib in derselben Zeile zuerst den Erfolgswert und dann den Rückgabewert aus."
  }
 },
 {
  "id": "lua-28",
  "patch": {
   "task": "Lege eine lokale Liste namens fahrzeuge mit mindestens drei eigenen Fahrzeugnamen an. Schreibe eine lokale Funktion zeigeAlle, die mit ipairs jeden Namen in einer eigenen Zeile ausgibt, und rufe sie mit deiner Liste auf.",
   "practice_output": "shape",
   "practice_min_lines": 3
  }
 },
 {
  "id": "lua-29",
  "patch": {
   "task": "Wähle für die lokalen Variablen geld und preis eigene Zahlen. Der Preis soll positiv sein und in dein Budget passen. Prüfe beide Bedingungen vor dem Abzug und gib das verbleibende Geld aus.",
   "example": "local geld = 100\nlocal preis = 40\nif preis > 0 and geld >= preis then\n    geld = geld - preis\n    print(geld)\nend",
   "solution": "local geld = 100\nlocal preis = 40\nif preis > 0 and geld >= preis then\n    geld = geld - preis\n    print(geld)\nend",
   "practice_output": "shape"
  }
 },
 {
  "id": "lua-30",
  "patch": {
   "task": "Definiere die lokale Funktion summe(liste). Addiere die Zahlen mit ipairs und gib die Summe aus der Funktion zurück. Teste sie mit der Liste 10, 20, 30 und gib das Ergebnis aus."
  }
 },
 {
  "id": "lua-45",
  "patch": {
   "checks": [
    "local",
    "ipairs",
    "\\bfor\\b"
   ]
  }
 },
 {
  "id": "lua-46",
  "patch": {
   "checks": [
    "local",
    "\\bpairs\\s*\\(",
    "\\bfor\\b"
   ]
  }
 },
 {
  "id": "lua-50",
  "patch": {
   "checks": [
    "local",
    "string\\.find"
   ],
   "task": "Suche mit string.find nach „Lab“ in „NovaLab“. Speichere die Startposition in einer lokalen Variable und gib sie aus."
  }
 },
 {
  "id": "lua-52",
  "patch": {
   "checks": [
    "local",
    "string\\.format"
   ]
  }
 },
 {
  "id": "lua-64",
  "patch": {
   "checks": [
    "local",
    "\\.\\."
   ]
  }
 },
 {
  "id": "lua-69",
  "patch": {
   "checks": [
    "local",
    "\\bif\\b"
   ]
  }
 },
 {
  "id": "lua-51",
  "patch": {
   "task": "Verwende string.sub, um aus „NovaLab“ die Zeichen von Position 1 bis 6 herauszunehmen. Gib den Ausschnitt aus."
  }
 },
 {
  "id": "javascript-01",
  "patch": {
   "task": "Speichere deinen eigenen Namen als Text in einer mit let deklarierten Variable namens name. Gib die Variable einmal in der Konsole aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "javascript-02",
  "patch": {
   "task": "Lege mit const eine Zahl deiner Wahl an und gib mit typeof ihren Datentyp aus.",
   "practice_output": "exact"
  }
 },
 {
  "id": "javascript-03",
  "patch": {
   "task": "Wähle für geld einen eigenen Wert ab 100. Verwende const und eine if-Bedingung. Gib „Kauf möglich“ aus, wenn das Geld mindestens 100 beträgt.",
   "practice_output": "exact"
  }
 },
 {
  "id": "javascript-04",
  "patch": {
   "task": "Lege mit const eine Liste aus zwei eigenen Fahrzeugnamen an. Wandle die Namen mit map in Großbuchstaben um und gib die Ergebnisliste einmal aus.",
   "practice_output": "shape",
   "checks": [
    "\\bconst\\b",
    "\\.map\\s*\\(",
    "\\.toUpperCase\\s*\\(",
    "console\\.log"
   ]
  }
 },
 {
  "id": "javascript-05",
  "patch": {
   "task": "Lege mit const ein Spielerobjekt mit einem verschachtelten job-Objekt an. Wähle den Namen und die Berufsbezeichnung selbst und gib die Berufsbezeichnung aus.",
   "practice_output": "shape",
   "checks": [
    "\\bconst\\b",
    "\\bjob\\s*:",
    "\\.job\\??\\.label",
    "console\\.log"
   ]
  }
 },
 {
  "id": "javascript-06",
  "patch": {
   "task": "Speichere eine Pfeilfunktion in einer const-Variable. Berechne einen rabattierten Preis. Wähle Preis und Rabatt selbst und gib das Ergebnis eines Aufrufs aus.",
   "practice_output": "shape",
   "checks": [
    "\\bconst\\b",
    "=>",
    "console\\.log"
   ]
  }
 },
 {
  "id": "javascript-08",
  "patch": {
   "task": "Erzeuge ein Promise mit einem eigenen Wert und gib den aufgelösten Wert in einem then-Callback einmal aus.",
   "practice_output": "shape",
   "checks": [
    "\\.then\\s*\\(",
    "console\\.log"
   ]
  }
 },
 {
  "id": "javascript-09",
  "patch": {
   "task": "Definiere eine async-Funktion. Warte mit await auf ein Promise und gib seinen selbst gewählten Text aus. Fange Fehler mit try/catch ab und rufe die Funktion auf.",
   "practice_output": "shape",
   "checks": [
    "\\basync\\b",
    "\\bawait\\b",
    "\\btry\\b",
    "\\bcatch\\b",
    "console\\.log"
   ]
  }
 },
 {
  "id": "python-12",
  "patch": {
   "task": "Schreibe eine Funktion, die einen Namen und einen Wahrheitswert entgegennimmt. Gib mit einem f-String eine Statuszeile zurück und zeige sie für einen selbst gewählten Namen an.",
   "practice_output": "shape",
   "checks": [
    "def",
    "return",
    "f[\\x22\\x27]"
   ]
  }
 },
 {
  "id": "python-01",
  "patch": {
   "task": "Gib mit print einen nicht leeren Text deiner Wahl aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "python-02",
  "patch": {
   "task": "Speichere einen eigenen Namen in name und eine ganze Zahl in level. Gib beide Variablen in dieser Reihenfolge mit einem Aufruf aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "python-03",
  "patch": {
   "task": "Speichere ein Guthaben deiner Wahl. Verwende if und else für die Grenze 100. Gib bei ausreichendem Guthaben „Kauf möglich“ aus, sonst „Zu wenig Geld“.",
   "practice_output": "one-of",
   "practice_allowed_lines": [
    "Kauf möglich",
    "Zu wenig Geld"
   ]
  }
 },
 {
  "id": "python-04",
  "patch": {
   "task": "Erstelle eine Liste aus mindestens drei eigenen Fahrzeugnamen. Gib die Namen mit einer for-Schleife einzeln aus.",
   "practice_output": "shape",
   "practice_min_lines": 3
  }
 },
 {
  "id": "python-05",
  "patch": {
   "task": "Definiere eine Funktion mit Preis und Rabatt als Parameter. Gib den rabattierten Preis zurück und zeige das Ergebnis für selbst gewählte Werte an.",
   "practice_output": "shape"
  }
 },
 {
  "id": "python-06",
  "patch": {
   "task": "Erstelle ein Dictionary mit Name und Geldbetrag deiner Wahl. Lies den Geldbetrag über den Schlüssel geld und gib ihn aus.",
   "practice_output": "shape",
   "checks": [
    "print",
    "[\\x22\\x27]geld[\\x22\\x27]"
   ]
  }
 },
 {
  "id": "python-08",
  "patch": {
   "task": "Erstelle ein Dictionary mit zwei eigenen Werten. Wandle es mit dem Modul json in JSON um und gib den Text aus.",
   "practice_output": "shape",
   "checks": [
    "import\\s+json",
    "json\\.dumps",
    "print"
   ]
  }
 },
 {
  "id": "python-09",
  "patch": {
   "task": "Importiere math. Berechne mit math.sqrt die Quadratwurzel einer nicht negativen Zahl deiner Wahl und gib sie aus.",
   "practice_output": "shape",
   "checks": [
    "import\\s+math",
    "math\\.sqrt",
    "print"
   ]
  }
 },
 {
  "id": "python-pro-lab-02",
  "patch": {
   "task": "Definiere mit dataclass eine Klasse Task mit einem Textfeld title. Erzeuge eine Instanz mit einem eigenen Titel und gib das Attribut aus.",
   "practice_output": "shape"
  }
 },
 {
  "id": "testing-01",
  "patch": {
   "task": "Verwende für input die Zahl 4 und für expected den Sollwert 8. Berechne in actual das Doppelte der Eingabe und gib input, expected und actual in dieser Reihenfolge in einer Zeile aus."
  }
 },
 {
  "id": "nui-10",
  "patch": {
   "task": "Definiere die lokale Funktion validPrice. Akzeptiere nur Zahlen größer 0 und höchstens 100000. Teste mit dem Wert 50 und gib den Wahrheitswert aus."
  }
 },
 {
  "id": "nui-01",
  "patch": {
   "task": "Erstelle ein vollständiges HTML-Dokument mit Doctype, Sprachattribut, Zeichensatz und Seitentitel. Setze einen main-Bereich mit h1 und Button in den Body. Überschrift, Titel und Buttontext sind frei wählbar."
  }
 },
 {
  "id": "html-01",
  "patch": {
   "task": "Erstelle ein HTML-Dokument mit Doctype, html samt Sprachattribut, head samt Zeichensatz und body mit einer h1. Wähle Sprache und Überschrift passend zu deiner Seite."
  }
 },
 {
  "id": "html-02",
  "patch": {
   "task": "Erstelle einen main-Bereich mit einer h1 und einem Absatz. Schreibe deine eigenen Texte."
  }
 },
 {
  "id": "html-03",
  "patch": {
   "task": "Erstelle einen Link mit Zieladresse und einen Bildverweis mit Alternativtext. Wähle ein eigenes Linkziel, Bild und passende Texte."
  }
 },
 {
  "id": "html-04",
  "patch": {
   "task": "Erstelle eine ungeordnete Liste mit mindestens zwei eigenen Einträgen."
  }
 },
 {
  "id": "html-05",
  "patch": {
   "task": "Baue ein Formular mit einem beschrifteten Pflichtfeld und einer Schaltfläche zum Absenden. Wähle Feldnamen und Texte selbst. Verbinde label und input über passende for- und id-Werte."
  }
 },
 {
  "id": "html-06",
  "patch": {
   "task": "Baue eine Seite mit header, nav, main, article und footer. Verwende eigene Inhalte."
  }
 },
 {
  "id": "html-07",
  "patch": {
   "task": "Baue eine Schaltfläche mit einem verständlichen zugänglichen Namen für dein eigenes Symbol."
  }
 },
 {
  "id": "html-08",
  "patch": {
   "task": "Baue einen main-Bereich mit einer section, einer h2 und einem article. Verknüpfe die section über aria-labelledby mit ihrer Überschrift. Titel, Kennung und Inhalt kannst du frei wählen."
  }
 },
 {
  "id": "css-01",
  "patch": {
   "task": "Definiere in :root eine eigene Akzentfarbe und verwende sie beim button. Wähle auch die Textfarbe selbst."
  }
 },
 {
  "id": "css-02",
  "patch": {
   "task": "Verwende box-sizing für alle Elemente. Gestalte .card mit Innenabstand, Rand und Außenabstand. Größen und Farben kannst du frei wählen."
  }
 },
 {
  "id": "css-03",
  "patch": {
   "task": "Ordne .toolbar mit Flexbox an. Lege Ausrichtung und Abstände nach eigener Wahl fest."
  }
 },
 {
  "id": "css-04",
  "patch": {
   "task": "Verwende für .courses ein Grid mit flexibel umbrechenden Spalten. Wähle Mindestbreite und Abstand selbst."
  }
 },
 {
  "id": "css-05",
  "patch": {
   "task": "Zeige .layout bei schmalem Bildschirm als Block und ab einer selbst gewählten Breite als zweispaltiges Grid."
  }
 },
 {
  "id": "css-06",
  "patch": {
   "task": "Wähle für body eine Schriftfamilie und einen Zeilenabstand. Begrenze bei p die Zeilenbreite auf einen eigenen Wert."
  }
 },
 {
  "id": "css-07",
  "patch": {
   "task": "Gestalte .card mit einer Hover-Transition. Wähle Dauer und Bewegung selbst und berücksichtige reduzierte Bewegung."
  }
 },
 {
  "id": "css-08",
  "patch": {
   "task": "Lege in :root Werte für Oberfläche, Radius und Abstand fest. Wende sie auf .card an. Die konkreten Werte sind frei."
  }
 },
 {
  "id": "lua-22",
  "patch": {
   "task": "Wähle einen Namen, wandle ihn mit string.lower in Kleinbuchstaben um und gib einen nicht leeren Text aus.",
   "practice_output": "text-lines",
   "practice_line_count": 1
  }
 },
 {
  "id": "lua-27",
  "patch": {
   "task": "Speichere „geschlossen“ in der lokalen Variable status. Ändere sie mit einer if-Abfrage in „offen“ und gib den neuen Status aus."
  }
 },
 {
  "id": "python-07",
  "patch": {
   "task": "Wandle mit int einen selbst gewählten Text um, der keine ganze Zahl darstellt. Fange ValueError ab und gib im Fehlerfall eine eigene nicht leere Meldung aus.",
   "example": "try:\n    zahl = int(\"abc\")\nexcept ValueError:\n    print(\"Keine Zahl\")",
   "solution": "try:\n    zahl = int(\"abc\")\nexcept ValueError:\n    print(\"Keine Zahl\")",
   "practice_output": "shape",
   "checks": [
    "\\btry\\s*:",
    "\\bexcept\\s+ValueError",
    "\\bint\\s*\\(",
    "\\bprint\\s*\\("
   ]
  }
 },
 {
  "id": "python-11",
  "patch": {
   "task": "Definiere eine Funktion zum Addieren zweier Zahlen. Prüfe mit assert die Summe für zwei selbst gewählte Zahlen und gib nach erfolgreicher Prüfung die berechnete Summe aus.",
   "example": "def addiere(a, b):\n    return a + b\n\nassert addiere(2, 3) == 5\nprint(addiere(2, 3))",
   "solution": "def addiere(a, b):\n    return a + b\n\nassert addiere(2, 3) == 5\nprint(addiere(2, 3))",
   "practice_output": "shape",
   "checks": [
    "\\bdef\\b",
    "\\breturn\\b",
    "\\bassert\\b",
    "\\bprint\\b"
   ]
  }
 },
 {
  "id": "api-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lege in JavaScript ein Antwortobjekt mit numerischem HTTP-Status und einem verschachtelten body an. Wähle die ID selbst und prüfe beide Felder."
  }
 },
 {
  "id": "api-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Serialisiere ein Objekt mit eigenem Namen und einer Punktzahl. Prüfe in JavaScript, ob sich der JSON-Text wieder einlesen lässt."
  }
 },
 {
  "id": "api-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lege ein Fehlerobjekt mit code und message an. Wähle passende Werte und prüfe, welche Meldung du dem Benutzer zeigen würdest."
  }
 },
 {
  "id": "api-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Wähle einen eigenen Ressourcenpfad mit einer API-Versionsnummer. Prüfe in JavaScript, wie sich die Pfade zweier Versionen unterscheiden."
  }
 },
 {
  "id": "bash-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "bash-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "cpp-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen C++-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "csharp-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Code in einem lokalen .NET-Projekt. Nutze für FiveM-Aufgaben zusätzlich eine passende Testresource. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "docker-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Aufgabe mit Docker in einem lokalen Übungsprojekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "esx-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "git-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "git-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Befehle in Bash in einem eigenen Testordner aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "go-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Go-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "java-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Java-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "javascript-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste den Abruf in einer lokalen Webseite mit einem eigenen JSON-Endpunkt. Prüfe einen erfolgreichen Abruf und einen HTTP-Fehler. Halte Status und Ergebnis fest."
  }
 },
 {
  "id": "javascript-workshop-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Umwandlung der Texte „5“ und „abc“ in einer JavaScript-Konsole. Notiere beide Ergebnisse und wann NaN entsteht."
  }
 },
 {
  "id": "javascript-workshop-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende eigene Zahlen. Teste den Durchschnitt gültiger Werte und ein leeres Array in einer JavaScript-Konsole. Notiere beide Ergebnisse."
  }
 },
 {
  "id": "javascript-workshop-v9-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lege lokal eine JSON-Datei an und serviere sie über HTTP. Teste einen vorhandenen und einen fehlenden Pfad. Notiere die sichtbare Fehlermeldung."
  }
 },
 {
  "id": "json-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "json-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "json-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "json-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "json-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "json-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Datei mit einem JSON-Parser. Nutze eigene Werte und behalte die Datentypen bei. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "kotlin-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code in einem lokalen Kotlin-Projekt aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "lua-25",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lade das Modul in einem lokalen Lua-Skript und teste die Funktion mit zwei selbst gewählten Zahlen. Notiere Eingaben und Rückgabewerte."
  }
 },
 {
  "id": "lua-masterlab-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lege Config, Service und Events in einer eigenen Testresource an und prüfe die Exports auf deinem lokalen FXServer."
  }
 },
 {
  "id": "lua-workshop-v9-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste lokal in Lua einmal mit 100 und einmal mit 500. Notiere, wie sich Wahrheitswert und Datentyp unterscheiden."
  }
 },
 {
  "id": "lua-workshop-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Nutze eigene Testartikel. Führe in Lua beide Mengenfälle aus und notiere die Berechnung für den erfolgreichen Fall."
  }
 },
 {
  "id": "lua-workshop-v9-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Tests mit 3, 0 und -1 in Lua aus und ergänze einen Test mit einem Textwert für die Menge."
  }
 },
 {
  "id": "nui-11",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Lade das Modul in einer lokalen Resource. Prüfe die Funktion mit einem gültigen Zahlenwert und einer fehlenden oder ungültigen Eingabe."
  }
 },
 {
  "id": "ox-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "ox-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "php-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "php-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "php-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "php-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "php-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "php-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe den Code lokal mit PHP aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "python-workshop-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Wähle zwei eigene Produktnamen und Preise. Führe das Skript in Python aus und notiere Gesamtwert und gefilterte Produkte."
  }
 },
 {
  "id": "python-workshop-v9-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Verwende einen eigenen Testordner und eine JSON-Datei. Führe Schreiben, erneutes Lesen und Sichern der vorherigen Version in Python aus."
  }
 },
 {
  "id": "qbcore-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "qbcore-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "qbcore-13",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "qbcore-18",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "qbcore-19",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "qbcore-advanced-v9-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste auf deinem eigenen FXServer mit den in der Aufgabe genannten Frameworks. Halte Testeingabe und beobachtetes Ergebnis fest."
  }
 },
 {
  "id": "react-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "react-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste die Komponente in einer lokalen React-App und prüfe die Darstellung. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "rust-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Kompiliere und teste den Code in einem lokalen Cargo-Projekt. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-09",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "sql-10",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Führe die Abfrage in einer lokalen SQL-Datenbank mit Testdaten und passenden Tabellen aus. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "testing-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Teste eine verständlich benannte Funktion mit einer positiven Zahl, mit null und mit einem Textwert. Notiere, welche Eingaben sie akzeptiert."
  }
 },
 {
  "id": "testing-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Miss die Laufzeit einer selbst gewählten kleinen Berechnung in der JavaScript-Konsole. Notiere die Einheit und wiederhole die Messung."
  }
 },
 {
  "id": "typescript-01",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-02",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-03",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-04",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-05",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-06",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-07",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 },
 {
  "id": "typescript-08",
  "patch": {
   "practice_mode": "guided",
   "practice_instruction": "Prüfe die Typen mit TypeScript in einem lokalen Projekt und teste das kompilierte JavaScript. Halte fest, welche Eingabe du gewählt hast und welches Ergebnis du geprüft hast."
  }
 }
]
$practice$::jsonb) AS repair(id text,patch jsonb)
WHERE lesson.lesson_id = repair.id;
