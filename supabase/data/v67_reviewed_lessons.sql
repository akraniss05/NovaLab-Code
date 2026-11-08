-- LiveryLab Academy · review selected Lua, Python, JavaScript, SQL and Git topics.
-- Preserve course membership, lesson IDs, progress and all unrelated payload fields.
WITH reviewed AS (
 SELECT * FROM jsonb_to_recordset($curriculum$
[
  {
    "id": "lua-01",
    "patch": {
      "quiz_items": [
        {
          "question": "Was erscheint bei print(2 + 3) in der Konsole?",
          "options": [
            "5",
            "2 + 3",
            "23"
          ],
          "correct": 0,
          "explanation": "Lua berechnet zuerst die Summe und übergibt 5 an print."
        },
        {
          "question": "Welche Zeile gibt den Text Lua aus?",
          "options": [
            "print(Lua)",
            "print(\"Lua\")",
            "print = \"Lua\""
          ],
          "correct": 1,
          "explanation": "Anführungszeichen erzeugen einen String. Ohne sie sucht Lua eine Variable."
        }
      ],
      "quiz_version": 4,
      "theory": "print schreibt einen oder mehrere Werte in die Konsole. Lua wertet seine Argumente zuerst aus. Anführungszeichen erzeugen Text, während ein Name ohne Anführungszeichen auf eine Variable verweist.",
      "video_guide": {
        "name": "Lua · Zahlen, Texte und Bezeichner",
        "author": "Pit Noack",
        "language": "Deutsch",
        "focus": "print und der Unterschied zwischen Konsole und Skript"
      }
    },
    "video_id": "td12mCl00UU",
    "video_start": 0
  },
  {
    "id": "lua-02",
    "patch": {
      "quiz_items": [
        {
          "question": "Welche Zeile wird als Kommentar ignoriert?",
          "options": [
            "print(\"-- Status anzeigen\")",
            "-- Status anzeigen",
            "status = \"Status anzeigen\""
          ],
          "correct": 1,
          "explanation": "Zwei Bindestriche außerhalb eines Strings beginnen einen Zeilenkommentar."
        },
        {
          "question": "Was gibt -- print(1) gefolgt von print(2) aus?",
          "options": [
            "1 und 2",
            "Gar nichts",
            "Nur 2"
          ],
          "correct": 2,
          "explanation": "Der Kommentar endet mit dem Zeilenumbruch. Die zweite Zeile wird ausgeführt."
        }
      ],
      "quiz_version": 4,
      "theory": "Zwei Bindestriche außerhalb eines Strings beginnen einen Kommentar bis zum Zeilenende. Ein Kommentar wird beim Ausführen übersprungen. Bindestriche innerhalb eines Strings bleiben normaler Text."
    }
  },
  {
    "id": "lua-03",
    "patch": {
      "quiz_items": [
        {
          "question": "Eine Variable wird mit local in einem do … end-Block deklariert. Wo ist sie sichtbar?",
          "options": [
            "Auch außerhalb des Blocks",
            "Nur in der nächsten Zeile",
            "Im Block ab der Deklaration"
          ],
          "correct": 2,
          "explanation": "Der Block begrenzt den Gültigkeitsbereich der lokalen Variable."
        },
        {
          "question": "Außen steht local x = 1, innen steht local x = 2. Was zeigt print(x) nach dem Block?",
          "options": [
            "1",
            "2",
            "nil"
          ],
          "correct": 0,
          "explanation": "Die innere Deklaration verdeckt die äußere Variable nur innerhalb des Blocks."
        }
      ],
      "quiz_version": 4,
      "theory": "Eine mit local deklarierte Variable ist ab ihrer Deklaration bis zum Ende des umgebenden Blocks sichtbar. Eine gleichnamige lokale Variable in einem inneren Block verdeckt die äußere dort vorübergehend."
    }
  },
  {
    "id": "lua-04",
    "patch": {
      "quiz_items": [
        {
          "question": "Was liefert type(\"12\")?",
          "options": [
            "string",
            "number",
            "boolean"
          ],
          "correct": 0,
          "explanation": "Anführungszeichen machen 12 zu Text."
        },
        {
          "question": "Wie prüfst du, ob ein Tabellenfeld fehlt?",
          "options": [
            "wert == \"nil\"",
            "wert == nil",
            "wert == 0"
          ],
          "correct": 1,
          "explanation": "Ein fehlendes Feld ergibt nil. Der String \"nil\" und die Zahl 0 sind andere Werte."
        }
      ],
      "quiz_version": 4
    }
  },
  {
    "id": "lua-05",
    "patch": {
      "quiz_items": [
        {
          "question": "Was liefert tonumber(\"abc\")?",
          "options": [
            "0",
            "nil",
            "false"
          ],
          "correct": 1,
          "explanation": "Bei einer ungültigen Zahl liefert tonumber nil."
        },
        {
          "question": "Welche Prüfung vermeidet eine Addition mit einem fehlenden Umwandlungsergebnis?",
          "options": [
            "zahl == \"nil\" vor der Addition",
            "tostring(zahl) vor der Addition",
            "zahl ~= nil vor der Addition"
          ],
          "correct": 2,
          "explanation": "Prüfe auf den echten Wert nil, bevor du mit dem Ergebnis rechnest."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "Lua · Eingaben und Bedingungen",
        "author": "Pit Noack",
        "language": "Deutsch",
        "focus": "Eingaben mit tonumber umwandeln"
      }
    },
    "video_id": "IIVCCqYMgwI",
    "video_start": 0
  },
  {
    "id": "lua-06",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ist 10 % 3?",
          "options": [
            "3",
            "0",
            "1"
          ],
          "correct": 2,
          "explanation": "3 passt dreimal in 10. Der Rest ist 1."
        },
        {
          "question": "Was ergibt 10 // 3 in Lua 5.4?",
          "options": [
            "3",
            "1",
            "3,333…"
          ],
          "correct": 0,
          "explanation": "Der Operator // rundet den Quotienten nach unten."
        }
      ],
      "quiz_version": 4,
      "theory": "Mit % erhältst du den Rest zur abgerundeten Division. In Lua 5.4 rundet // den Quotienten nach unten, auch bei negativen Ergebnissen. / ist die gewöhnliche Division. Beispiel: 10 // 3 ergibt 3 und 10 % 3 ergibt 1."
    }
  },
  {
    "id": "lua-07",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ergibt \"Hallo \" .. \"Mia\"?",
          "options": [
            "Hallo Mia",
            "HalloMia",
            "Hallo .. Mia"
          ],
          "correct": 0,
          "explanation": "Der erste String enthält das Leerzeichen bereits."
        },
        {
          "question": "Wie setzt du den ganzzahligen Punktestand 7 in einen Text ein?",
          "options": [
            "string.format(\"Punkte: %d\")",
            "string.format(\"Punkte: %d\", 7)",
            "\"Punkte: %d\" .. 7"
          ],
          "correct": 1,
          "explanation": "%d ist ein Platzhalter für eine Ganzzahl. format ersetzt ihn durch 7."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "Lua · Eingaben und Bedingungen",
        "author": "Pit Noack",
        "language": "Deutsch",
        "focus": "Text mit zwei Punkten verketten"
      }
    },
    "video_id": "IIVCCqYMgwI",
    "video_start": 0
  },
  {
    "id": "lua-08",
    "patch": {
      "quiz_items": [
        {
          "question": "Welcher Ausdruck ist wahr?",
          "options": [
            "4 == 5",
            "4 ~= 5",
            "4 > 5"
          ],
          "correct": 1,
          "explanation": "~= prüft auf Ungleichheit."
        },
        {
          "question": "Welche Bedingung lässt Level 5 und jedes höhere Level zu?",
          "options": [
            "level > 5",
            "level <= 5",
            "level >= 5"
          ],
          "correct": 2,
          "explanation": ">= schließt den Grenzwert 5 ein."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "Lua · Eingaben und Bedingungen",
        "author": "Pit Noack",
        "language": "Deutsch",
        "focus": "Werte vergleichen und Bedingungen auswerten"
      }
    },
    "video_id": "IIVCCqYMgwI",
    "video_start": 0
  },
  {
    "id": "python-01",
    "patch": {
      "quiz_items": [
        {
          "question": "Was zeigt print(3 + 4)?",
          "options": [
            "34",
            "3 + 4",
            "7"
          ],
          "correct": 2,
          "explanation": "Python berechnet die Summe vor dem Funktionsaufruf."
        },
        {
          "question": "Was passiert bei print(\"3 + 4\")?",
          "options": [
            "Der Text 3 + 4 erscheint",
            "Die Zahl 7 erscheint",
            "Ein Syntaxfehler erscheint"
          ],
          "correct": 0,
          "explanation": "Der Ausdruck in Anführungszeichen wird als Text behandelt."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "print und das erste Python-Programm"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 24
  },
  {
    "id": "python-02",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ist der Typ von \"42\"?",
          "options": [
            "str",
            "int",
            "float"
          ],
          "correct": 0,
          "explanation": "Anführungszeichen kennzeichnen einen String."
        },
        {
          "question": "Was ergibt int(\"42\") + 1?",
          "options": [
            "421",
            "43",
            "42"
          ],
          "correct": 1,
          "explanation": "int wandelt den Text in eine Ganzzahl um. Danach wird addiert."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Zahlen, Operatoren und Typumwandlung"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 3575
  },
  {
    "id": "python-03",
    "patch": {
      "quiz_items": [
        {
          "question": "Bei if alter >= 18 und alter = 18: Welcher Zweig läuft?",
          "options": [
            "Der else-Zweig",
            "Der if-Zweig",
            "Beide Zweige"
          ],
          "correct": 1,
          "explanation": ">= enthält den Grenzwert 18."
        },
        {
          "question": "Was passiert bei einer if/else-Verzweigung mit falscher Bedingung?",
          "options": [
            "Nur der if-Block läuft",
            "Beide Blöcke laufen",
            "Nur der else-Block läuft"
          ],
          "correct": 2,
          "explanation": "Python wählt genau den zur Bedingung passenden Block."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50P · Conditionals",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Vergleiche, Boolesche Ausdrücke und if/else"
      }
    },
    "video_id": "_b6NgY_pMdw",
    "video_start": 0
  },
  {
    "id": "python-04",
    "patch": {
      "quiz_items": [
        {
          "question": "Welche Werte erzeugt range(3) beim Durchlaufen?",
          "options": [
            "1, 2, 3",
            "0, 1, 2, 3",
            "0, 1, 2"
          ],
          "correct": 2,
          "explanation": "Die Obergrenze 3 ist ausgeschlossen."
        },
        {
          "question": "Was liefert ['a', 'b', 'c'][1]?",
          "options": [
            "b",
            "a",
            "c"
          ],
          "correct": 0,
          "explanation": "Python zählt Listenpositionen ab 0."
        }
      ],
      "quiz_version": 4,
      "theory": "Eine Liste speichert mehrere Werte in Reihenfolge. Der erste Index ist 0. Eine for-Schleife kann die Werte direkt durchlaufen. Mit range(3) iterierst du über 0, 1 und 2. Die Obergrenze gehört nicht mehr dazu.",
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Über Listen iterieren und Elemente per Index lesen"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 2099
  },
  {
    "id": "python-05",
    "patch": {
      "quiz_items": [
        {
          "question": "Was liefert def doppelt(n): return n * 2 beim Aufruf doppelt(4)?",
          "options": [
            "8",
            "4",
            "None"
          ],
          "correct": 0,
          "explanation": "return gibt den berechneten Wert an die Aufrufstelle zurück."
        },
        {
          "question": "Eine Funktion ruft nur print(5) auf und hat kein return. Was liefert ihr Aufruf?",
          "options": [
            "5",
            "None",
            "\"5\""
          ],
          "correct": 1,
          "explanation": "print schreibt in die Konsole. Ohne explizites return liefert die Funktion None."
        }
      ],
      "quiz_version": 4,
      "theory": "def definiert eine Funktion. Parameter nehmen beim Aufruf Werte entgegen. return liefert ein Ergebnis an den Aufrufer und beendet die Funktion. print zeigt einen Wert an. Wenn eine Funktion ohne explizites return endet, liefert sie None.",
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Rückgabewerte mit return"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 6077
  },
  {
    "id": "python-06",
    "patch": {
      "quiz_items": [
        {
          "question": "Was liefert {'xp': 12}.get('level', 1)?",
          "options": [
            "12",
            "1",
            "KeyError"
          ],
          "correct": 1,
          "explanation": "Bei fehlendem Schlüssel gibt get den angegebenen Standardwert zurück."
        },
        {
          "question": "Wie aktualisierst du xp im Dictionary profil?",
          "options": [
            "profil = ['xp', 20]",
            "profil.get('xp', 20)",
            "profil['xp'] = 20"
          ],
          "correct": 2,
          "explanation": "Eine Zuweisung an den Schlüssel ändert den gespeicherten Wert."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Dictionaries und Schlüssel"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 2747
  },
  {
    "id": "python-07",
    "patch": {
      "quiz_items": [
        {
          "question": "Welchen Fehler löst int('abc') aus?",
          "options": [
            "TypeError",
            "KeyError",
            "ValueError"
          ],
          "correct": 2,
          "explanation": "Der Typ String ist erlaubt, aber der Inhalt ist keine Ganzzahl."
        },
        {
          "question": "Welcher except-Zweig fängt genau diesen Fehler ab?",
          "options": [
            "except ValueError:",
            "except KeyError:",
            "except ZeroDivisionError:"
          ],
          "correct": 0,
          "explanation": "Die Fehlerklasse muss zum ausgelösten Fehler passen."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50P · Exceptions",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Fehlerklassen und try/except"
      }
    },
    "video_id": "QjEfLbcMHJk",
    "video_start": 0
  },
  {
    "id": "javascript-01",
    "patch": {
      "quiz_items": [
        {
          "question": "Was protokolliert let xp = 2; xp += 3; console.log(xp);?",
          "options": [
            "5",
            "2",
            "23"
          ],
          "correct": 0,
          "explanation": "+= liest den alten Zahlenwert und weist die Summe zu."
        },
        {
          "question": "Welche Zeile deklariert einen veränderbaren Wert?",
          "options": [
            "const score = 0;",
            "let score = 0;",
            "console.log(score);"
          ],
          "correct": 1,
          "explanation": "let erlaubt eine spätere Neuzuweisung."
        }
      ],
      "quiz_version": 4
    }
  },
  {
    "id": "javascript-02",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ergibt typeof 3?",
          "options": [
            "\"int\"",
            "\"number\"",
            "\"string\""
          ],
          "correct": 1,
          "explanation": "JavaScript verwendet für gewöhnliche Zahlen den Typ number."
        },
        {
          "question": "Was ist bei const items = [] erlaubt?",
          "options": [
            "items = ['Lua']",
            "items = null",
            "items.push('Lua')"
          ],
          "correct": 2,
          "explanation": "const schützt die Bindung, das Array selbst bleibt veränderbar."
        }
      ],
      "quiz_version": 4,
      "theory": "const verhindert eine spätere Neuzuweisung der Variablenbindung. Der Inhalt eines gebundenen Arrays oder Objekts kann trotzdem verändert werden. Mit typeof erkennst du etwa number bei 3, string bei Text und boolean bei true."
    }
  },
  {
    "id": "javascript-03",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ergibt 2 === '2'?",
          "options": [
            "true",
            "undefined",
            "false"
          ],
          "correct": 2,
          "explanation": "=== vergleicht ohne Typumwandlung."
        },
        {
          "question": "Welcher Zweig läuft bei if (false) { … } else { … }?",
          "options": [
            "Nur else",
            "Nur if",
            "Beide"
          ],
          "correct": 0,
          "explanation": "Der else-Zweig wird bei falscher Bedingung gewählt."
        }
      ],
      "quiz_version": 4
    }
  },
  {
    "id": "javascript-04",
    "patch": {
      "quiz_items": [
        {
          "question": "Was ergibt [1, 2, 3].map(n => n * 2)?",
          "options": [
            "[2, 4, 6]",
            "[1, 2, 3, 2]",
            "12"
          ],
          "correct": 0,
          "explanation": "map ruft die Funktion für jeden Eintrag auf und sammelt die Rückgabewerte."
        },
        {
          "question": "Welche Methode wählt Einträge anhand einer Bedingung aus?",
          "options": [
            "map",
            "filter",
            "join"
          ],
          "correct": 1,
          "explanation": "filter behält die Einträge, für die die Bedingung wahr ist."
        }
      ],
      "quiz_version": 4,
      "theory": "map ruft eine Funktion für jeden Eintrag auf und sammelt ihre Rückgabewerte in einem neuen Array gleicher Länge. filter wählt hingegen nur die Einträge aus, die eine Bedingung erfüllen. Ein rein berechnender map-Callback verändert das ursprüngliche Array nicht."
    }
  },
  {
    "id": "javascript-10",
    "patch": {
      "quiz_items": [
        {
          "question": "Ein Fetch-Aufruf erhält HTTP 404. Was solltest du vor response.json() prüfen?",
          "options": [
            "response.bodyUsed",
            "response.ok",
            "response.redirected"
          ],
          "correct": 1,
          "explanation": "Fetch verwirft das Promise bei 404 nicht automatisch. response.ok ist nur bei 2xx wahr."
        },
        {
          "question": "Was liefert response.json()?",
          "options": [
            "Sofort einen String",
            "Den HTTP-Status",
            "Ein Promise für den geparsten JSON-Wert"
          ],
          "correct": 2,
          "explanation": "await wartet auf das Lesen und Parsen des Response-Bodys."
        }
      ],
      "quiz_version": 4,
      "theory": "fetch liefert ein Promise für eine Response. HTTP-Fehler wie 404 lösen nicht automatisch einen Promise-Fehler aus. Prüfe deshalb response.ok, bevor du den Body verarbeitest. response.json() liefert ein weiteres Promise für den geparsten Wert.",
      "video_guide": {
        "name": "Fetch API",
        "author": "Web Dev Simplified",
        "language": "Englisch",
        "focus": "JSON-Antwort lesen und mit HTTP-Fehlern umgehen"
      }
    },
    "video_id": "cuEtnrL9-H0",
    "video_start": 0
  },
  {
    "id": "sql-02",
    "patch": {
      "quiz_items": [
        {
          "question": "Welche Abfrage liefert Namen aktiver Nutzer?",
          "options": [
            "SELECT active FROM users WHERE name = TRUE;",
            "SELECT name FROM users ORDER BY active;",
            "SELECT name FROM users WHERE active = TRUE;"
          ],
          "correct": 2,
          "explanation": "SELECT wählt die Spalte. WHERE schränkt die Zeilen ein."
        },
        {
          "question": "Warum funktioniert WHERE email = NULL nicht zum Finden fehlender E-Mails?",
          "options": [
            "NULL wird mit IS NULL geprüft",
            "NULL ist ein reservierter Spaltenname",
            "WHERE erlaubt keine Textspalten"
          ],
          "correct": 0,
          "explanation": "Ein Vergleich mit NULL ergibt unbekannt. IS NULL prüft gezielt auf fehlende Werte."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50 SQL · Querying",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Spalten mit SELECT wählen und Zeilen mit WHERE filtern"
      }
    },
    "video_id": "vHYeChEf2lA",
    "video_start": 836
  },
  {
    "id": "sql-05",
    "patch": {
      "quiz_items": [
        {
          "question": "Welcher JOIN behält alle Kunden, auch ohne Bestellung?",
          "options": [
            "LEFT JOIN mit Kunden links",
            "INNER JOIN mit Kunden links",
            "CROSS JOIN mit Bestellungen"
          ],
          "correct": 0,
          "explanation": "LEFT JOIN behält linke Zeilen ohne Treffer. Die rechten Spalten sind dann NULL."
        },
        {
          "question": "Worauf sollte eine Bestelltabelle mit customer_id beim Verknüpfen zeigen?",
          "options": [
            "Auf orders.id",
            "Auf customers.id",
            "Auf customers.name"
          ],
          "correct": 1,
          "explanation": "Der Fremdschlüssel verweist auf die ID des zugehörigen Kunden."
        }
      ],
      "quiz_version": 4,
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Tabellen mit JOIN verknüpfen und fehlende Treffer behandeln"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 3347
  },
  {
    "id": "coding-basics-02",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Entwicklungsumgebung und VS Code"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 589
  },
  {
    "id": "coding-basics-04",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Variablen und Funktionsrückgaben"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 736
  },
  {
    "id": "coding-basics-path-001",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Variablen und Funktionsrückgaben"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 736
  },
  {
    "id": "coding-basics-path-002",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Werte mit f-Strings in Text einsetzen"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 2590
  },
  {
    "id": "coding-basics-03",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Zahlen, Operatoren und Typumwandlung"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 3575
  },
  {
    "id": "coding-basics-path-003",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Umwandlung einer Texteingabe in eine Zahl"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 3945
  },
  {
    "id": "python-workshop-v9-01",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Umwandlung einer Texteingabe in eine Zahl"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 3945
  },
  {
    "id": "coding-basics-07",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Eigene Funktionen definieren"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 5174
  },
  {
    "id": "coding-basics-path-008",
    "patch": {
      "video_guide": {
        "name": "CS50P · Functions, Variables",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Rückgabewerte mit return"
      }
    },
    "video_id": "JP7ITIXGpHk",
    "video_start": 6077
  },
  {
    "id": "coding-basics-05",
    "patch": {
      "video_guide": {
        "name": "CS50P · Conditionals",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Vergleiche, Boolesche Ausdrücke und if/else"
      }
    },
    "video_id": "_b6NgY_pMdw",
    "video_start": 0
  },
  {
    "id": "coding-basics-path-004",
    "patch": {
      "video_guide": {
        "name": "CS50P · Conditionals",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Vergleiche, Boolesche Ausdrücke und if/else"
      }
    },
    "video_id": "_b6NgY_pMdw",
    "video_start": 0
  },
  {
    "id": "coding-basics-path-005",
    "patch": {
      "video_guide": {
        "name": "CS50P · Conditionals",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Vergleiche, Boolesche Ausdrücke und if/else"
      }
    },
    "video_id": "_b6NgY_pMdw",
    "video_start": 0
  },
  {
    "id": "coding-basics-06",
    "patch": {
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "for-Schleifen und range"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 981
  },
  {
    "id": "coding-basics-path-006",
    "patch": {
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "for-Schleifen und range"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 981
  },
  {
    "id": "coding-basics-path-007",
    "patch": {
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Über Listen iterieren und Elemente per Index lesen"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 2099
  },
  {
    "id": "coding-basics-08",
    "patch": {
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Listen von Dictionaries"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 3422
  },
  {
    "id": "python-workshop-v9-02",
    "patch": {
      "video_guide": {
        "name": "CS50P · Loops",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Listen von Dictionaries"
      }
    },
    "video_id": "-7xg8pGcP6w",
    "video_start": 3422
  },
  {
    "id": "coding-basics-path-009",
    "patch": {
      "video_guide": {
        "name": "CS50P · Exceptions",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Fehlerklassen und try/except"
      }
    },
    "video_id": "QjEfLbcMHJk",
    "video_start": 0
  },
  {
    "id": "python-09",
    "patch": {
      "video_guide": {
        "name": "CS50P · Libraries",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Module und Imports"
      }
    },
    "video_id": "MztLZWibctI",
    "video_start": 54
  },
  {
    "id": "coding-basics-path-010",
    "patch": {
      "video_guide": {
        "name": "CS50P · Libraries",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Module und Imports"
      }
    },
    "video_id": "MztLZWibctI",
    "video_start": 54
  },
  {
    "id": "python-path-001",
    "patch": {
      "video_guide": {
        "name": "CS50P · Libraries",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Slicing"
      }
    },
    "video_id": "MztLZWibctI",
    "video_start": 2455
  },
  {
    "id": "python-10",
    "patch": {
      "video_guide": {
        "name": "CS50P · Libraries",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "HTTP-Anfragen mit requests und JSON-Antworten"
      }
    },
    "video_id": "MztLZWibctI",
    "video_start": 3206
  },
  {
    "id": "python-11",
    "patch": {
      "video_guide": {
        "name": "CS50P · Unit Tests",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Funktionen mit konkreten Eingaben und erwarteten Ergebnissen testen"
      }
    },
    "video_id": "tIrcxwLqzjQ",
    "video_start": 24
  },
  {
    "id": "coding-basics-path-011",
    "patch": {
      "video_guide": {
        "name": "CS50P · Unit Tests",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Funktionen mit konkreten Eingaben und erwarteten Ergebnissen testen"
      }
    },
    "video_id": "tIrcxwLqzjQ",
    "video_start": 24
  },
  {
    "id": "python-path-011",
    "patch": {
      "video_guide": {
        "name": "CS50P · File I/O",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Dateien mit with öffnen und automatisch schließen"
      }
    },
    "video_id": "KD-Yoel6EVQ",
    "video_start": 835
  },
  {
    "id": "python-path-006",
    "patch": {
      "video_guide": {
        "name": "CS50P · File I/O",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Kurze Funktionen mit lambda"
      }
    },
    "video_id": "KD-Yoel6EVQ",
    "video_start": 3181
  },
  {
    "id": "python-path-005",
    "patch": {
      "video_guide": {
        "name": "CS50P · Object-Oriented Programming",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Tupel als zusammengehörige Werte"
      }
    },
    "video_id": "e4fwY9ZsxPw",
    "video_start": 60
  },
  {
    "id": "python-path-008",
    "patch": {
      "video_guide": {
        "name": "CS50P · Object-Oriented Programming",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Klassen und Objekte"
      }
    },
    "video_id": "e4fwY9ZsxPw",
    "video_start": 1605
  },
  {
    "id": "sql-01",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Querying",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Tabellen, Zeilen und Spalten"
      }
    },
    "video_id": "vHYeChEf2lA",
    "video_start": 17
  },
  {
    "id": "sql-04",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Querying",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Sortierreihenfolge mit ORDER BY festlegen"
      }
    },
    "video_id": "vHYeChEf2lA",
    "video_start": 3190
  },
  {
    "id": "sql-path-001",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Querying",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Zeilen mit COUNT zählen und Duplikate mit DISTINCT auswerten"
      }
    },
    "video_id": "vHYeChEf2lA",
    "video_start": 3720
  },
  {
    "id": "sql-path-002",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Querying",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Zeilen mit COUNT zählen und Duplikate mit DISTINCT auswerten"
      }
    },
    "video_id": "vHYeChEf2lA",
    "video_start": 3720
  },
  {
    "id": "sql-path-012",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Tabellen mit JOIN verknüpfen und fehlende Treffer behandeln"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 3347
  },
  {
    "id": "sql-path-008",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Primär- und Fremdschlüssel"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 815
  },
  {
    "id": "sql-path-009",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Unterabfragen"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 1595
  },
  {
    "id": "sql-path-003",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Gruppen und Aggregation"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 5429
  },
  {
    "id": "sql-path-004",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Relating",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Gruppen und Aggregation"
      }
    },
    "video_id": "_2t18Hy9Z0Y",
    "video_start": 5429
  },
  {
    "id": "sql-03",
    "patch": {
      "video_guide": {
        "name": "CS50 SQL · Writing",
        "author": "Harvard CS50",
        "language": "Englisch",
        "focus": "Zeilen einfügen und später mit UPDATE verändern"
      }
    },
    "video_id": "BD08USRd2M8",
    "video_start": 373
  },
  {
    "id": "coding-basics-10",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Git und Versionsverwaltung"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 64
  },
  {
    "id": "git-01",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Ein lokales Repository mit git init anlegen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 881
  },
  {
    "id": "git-02",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Änderungen stagen und anschließend committen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 1303
  },
  {
    "id": "git-path-003",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Änderungen stagen und anschließend committen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 1303
  },
  {
    "id": "git-03",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Branches verstehen und zwischen ihnen wechseln"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 2458
  },
  {
    "id": "git-04",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Änderungen mit git diff vergleichen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 3266
  },
  {
    "id": "git-path-002",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Änderungen mit git diff vergleichen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 3266
  },
  {
    "id": "git-05",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Branches mergen und Konflikte lösen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 2750
  },
  {
    "id": "git-06",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Einen Pull Request erstellen und Änderungen abstimmen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 4608
  },
  {
    "id": "git-path-010",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Einen Pull Request erstellen und Änderungen abstimmen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 4608
  },
  {
    "id": "git-path-001",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Arbeitsbaum und Staging mit git status prüfen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 1220
  },
  {
    "id": "git-path-004",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Commit-Verlauf mit git log ansehen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 2390
  },
  {
    "id": "git-path-005",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Lokale Änderungen mit git restore verwerfen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 3624
  },
  {
    "id": "git-path-007",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Konfliktmarker lesen und Mergekonflikte auflösen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 2863
  },
  {
    "id": "git-path-009",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Unterschied zwischen git fetch und git pull"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 3523
  },
  {
    "id": "git-path-012",
    "patch": {
      "video_guide": {
        "name": "Git & GitHub Crash Course",
        "author": "freeCodeCamp.org",
        "language": "Englisch",
        "focus": "Commits mit einem neuen Revert-Commit rückgängig machen"
      }
    },
    "video_id": "mAFoROnOfHs",
    "video_start": 4187
  },
  {
    "id": "javascript-path-011",
    "patch": {
      "video_guide": {
        "name": "JavaScript Array Reduce",
        "author": "Web Dev Simplified",
        "language": "Englisch",
        "focus": "Ein Array mit einem Akkumulator auf einen Wert reduzieren"
      }
    },
    "video_id": "s1XVfm5mIuU",
    "video_start": 0
  }
]
$curriculum$::jsonb) AS r(id text,patch jsonb,video_id text,video_start integer)
), applied AS (
 UPDATE public.ll_lesson_content AS lesson
 SET payload=lesson.payload || reviewed.patch,
     video_id=coalesce(reviewed.video_id,lesson.video_id),
     video_start=coalesce(reviewed.video_start,lesson.video_start)
 FROM reviewed WHERE lesson.lesson_id=reviewed.id
   AND (SELECT count(*) FROM reviewed JOIN public.ll_lesson_content ON lesson_id=id)
       = (SELECT count(*) FROM reviewed)
 RETURNING reviewed.video_id IS NOT NULL AS has_guide, reviewed.patch ? 'quiz_items' AS has_quiz
)
SELECT count(*) AS lessons, count(*) FILTER (WHERE has_guide) AS guides,
       count(*) FILTER (WHERE has_quiz) AS quizzes FROM applied;
