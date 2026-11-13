-- Practice requirements for browser execution and guided project exercises.
UPDATE public.ll_lesson_content AS lesson
SET payload = lesson.payload || repair.patch
FROM jsonb_to_recordset($practice$
[
 {
  "id": "java-01",
  "patch": {
   "task": "Gib genau einen nicht leeren Begrüßungstext deiner Wahl auf einer Zeile aus. Schreibe den Code in die main-Methode.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hallo Welt\");\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hallo Welt\");\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-02",
  "patch": {
   "task": "Lege eine ganze Zahl, eine Dezimalzahl und einen Wahrheitswert an. Wähle alle Werte selbst. Gib die Variablen einzeln in dieser Reihenfolge aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        int level = 8;\n        double preis = 13.5;\n        boolean online = false;\n        System.out.println(level);\n        System.out.println(preis);\n        System.out.println(online);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        int level = 8;\n        double preis = 13.5;\n        boolean online = false;\n        System.out.println(level);\n        System.out.println(preis);\n        System.out.println(online);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+(?:[.,]\\d+)?$",
    "^(true|false)$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bint\\s+\\w+\\s*=",
    "\\b(?:double|float)\\s+\\w+\\s*=",
    "\\bboolean\\s+\\w+\\s*="
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-03",
  "patch": {
   "task": "Wähle drei aufeinanderfolgende ganze Zahlen und gib sie mit einer Schleife einzeln aus. Der Startwert ist frei.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        for (int n=4; n<=6; n++) System.out.println(n);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        for (int n=4; n<=6; n++) System.out.println(n);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\b(?:for|while)\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-04",
  "patch": {
   "task": "Schreibe eine Methode, die zwei ganze Zahlen addiert. Teste mit zwei eigenen Zahlen und gib den Rückgabewert aus.",
   "example": "public class Main {\n    static int addiere(int a, int b) { return a + b; }\n    public static void main(String[] args) { System.out.println(addiere(3, 9)); }\n}",
   "solution": "public class Main {\n    static int addiere(int a, int b) { return a + b; }\n    public static void main(String[] args) { System.out.println(addiere(3, 9)); }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bint\\s+\\w+\\s*\\(\\s*int\\b",
    "\\breturn\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-05",
  "patch": {
   "task": "Definiere eine Fahrzeugklasse mit Modellname, erzeuge in main eine Instanz und gib das Modell aus. Klasse, Variable und Modellname sind frei.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        class Fahrzeug { String modell; Fahrzeug(String name) { modell=name; } }\n        Fahrzeug auto=new Fahrzeug(\"Comet\");\n        System.out.println(auto.modell);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        class Fahrzeug { String modell; Fahrzeug(String name) { modell=name; } }\n        Fahrzeug auto=new Fahrzeug(\"Comet\");\n        System.out.println(auto.modell);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bnew\\s+\\w+\\s*\\(",
    "\\bString\\s+\\w+"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-06",
  "patch": {
   "task": "Lege eine ArrayList mit zwei selbst gewählten Namen an. Gib beide Namen einzeln in Listenreihenfolge aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        var namen=new java.util.ArrayList<String>();\n        namen.add(\"Lina\");\n        namen.add(\"Sam\");\n        for(String name:namen) System.out.println(name);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        var namen=new java.util.ArrayList<String>();\n        namen.add(\"Lina\");\n        namen.add(\"Sam\");\n        for(String name:namen) System.out.println(name);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bArrayList\\b",
    "\\.add\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-07",
  "patch": {
   "task": "Versuche, einen eigenen ungültigen Zahlentext umzuwandeln. Fange NumberFormatException ab und gib eine eigene Fehlermeldung aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        try { Integer.parseInt(\"Wort\"); } catch(NumberFormatException e) { System.out.println(\"Bitte eine ganze Zahl eingeben\"); }\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        try { Integer.parseInt(\"Wort\"); } catch(NumberFormatException e) { System.out.println(\"Bitte eine ganze Zahl eingeben\"); }\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "parseInt\\s*\\(",
    "catch\\s*\\(\\s*NumberFormatException"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-001",
  "patch": {
   "task": "Deklariere eine Ganzzahlvariable mit einem Wert deiner Wahl. Gib ihren Wert aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        int stufe=7;\n        System.out.println(stufe);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        int stufe=7;\n        System.out.println(stufe);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bint\\s+\\w+\\s*="
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-002",
  "patch": {
   "task": "Wähle zwei eigene Namen und vergleiche den Inhalt mit equals. Gib den Wahrheitswert aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        String links=\"Lina\";\n        String rechts=\"Sam\";\n        System.out.println(links.equals(rechts));\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        String links=\"Lina\";\n        String rechts=\"Sam\";\n        System.out.println(links.equals(rechts));\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^(true|false)$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\.equals\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-003",
  "patch": {
   "task": "Lege ein Array mit mindestens zwei eigenen Zahlen an. Verwende seine Länge, um den letzten Eintrag auszugeben.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        int[] zahlen={1,4,8};\n        System.out.println(zahlen[zahlen.length-1]);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        int[] zahlen={1,4,8};\n        System.out.println(zahlen[zahlen.length-1]);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\.length",
    "\\[\\s*\\w+\\.length"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-004",
  "patch": {
   "task": "Speichere drei frei gewählte Namen in einer ArrayList. Gib die Anzahl der Einträge aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        var namen=new java.util.ArrayList<String>();\n        namen.add(\"Mia\");\n        namen.add(\"Lina\");\n        namen.add(\"Sam\");\n        System.out.println(namen.size());\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        var namen=new java.util.ArrayList<String>();\n        namen.add(\"Mia\");\n        namen.add(\"Lina\");\n        namen.add(\"Sam\");\n        System.out.println(namen.size());\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^3$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "ArrayList",
    "\\.add\\s*\\(",
    "\\.size\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-005",
  "patch": {
   "task": "Lege eine Liste mit zwei frei gewählten Einträgen an und gib sie mit einer Schleife einzeln aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        var namen=java.util.List.of(\"Lina\",\"Sam\");\n        for(String name:namen) System.out.println(name);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        var namen=java.util.List.of(\"Lina\",\"Sam\");\n        for(String name:namen) System.out.println(name);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bfor\\s*\\(",
    "\\bList\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-007",
  "patch": {
   "task": "Lege eine Klasse mit einem Textfeld an. Erzeuge zwei Instanzen mit unterschiedlichen eigenen Werten und gib beide Werte aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        class Auto { String marke; Auto(String wert) { marke=wert; } }\n        Auto a=new Auto(\"Luna\");\n        Auto b=new Auto(\"Nova\");\n        System.out.println(a.marke);\n        System.out.println(b.marke);\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        class Auto { String marke; Auto(String wert) { marke=wert; } }\n        Auto a=new Auto(\"Luna\");\n        Auto b=new Auto(\"Nova\");\n        System.out.println(a.marke);\n        System.out.println(b.marke);\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "\\bnew\\s+\\w+\\s*\\([\\s\\S]*\\bnew\\s+\\w+\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-009",
  "patch": {
   "task": "Erzeuge ein leeres Optional und gib über orElse einen frei gewählten Ersatztext aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        var name=java.util.Optional.<String>empty();\n        System.out.println(name.orElse(\"Gast\"));\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        var name=java.util.Optional.<String>empty();\n        System.out.println(name.orElse(\"Gast\"));\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "Optional",
    "\\.orElse\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "java-path-011",
  "patch": {
   "task": "Fange NumberFormatException beim Umwandeln eines selbst gewählten ungültigen Texts ab. Gib eine eigene Meldung aus.",
   "example": "public class Main {\n    public static void main(String[] args) {\n        try { Integer.parseInt(\"kein Wert\"); } catch(NumberFormatException e) { System.out.println(\"Zahl ungültig\"); }\n    }\n}",
   "solution": "public class Main {\n    public static void main(String[] args) {\n        try { Integer.parseInt(\"kein Wert\"); } catch(NumberFormatException e) { System.out.println(\"Zahl ungültig\"); }\n    }\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "System\\s*\\.\\s*out\\s*\\.\\s*print(?:ln|f)?\\s*\\(",
    "parseInt\\s*\\(",
    "catch\\s*\\(\\s*NumberFormatException"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-01",
  "patch": {
   "task": "Gib in main einen eigenen, nicht leeren Begrüßungstext aus.",
   "example": "#include <iostream>\nint main(){\n    std::cout << \"Hallo NovaLab\";\n}",
   "solution": "#include <iostream>\nint main(){\n    std::cout << \"Hallo NovaLab\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-02",
  "patch": {
   "task": "Lege eine ganze Zahl und einen Text an. Wähle beide Werte selbst und gib zuerst die Zahl, dann den Text auf einer eigenen Zeile aus.",
   "example": "#include <iostream>\n#include <string>\nint main(){\n    int level=8;\n    std::string name=\"Luna\";\n    std::cout << level << \"\\n\" << name << \"\\n\";\n}",
   "solution": "#include <iostream>\n#include <string>\nint main(){\n    int level=8;\n    std::string name=\"Luna\";\n    std::cout << level << \"\\n\" << name << \"\\n\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bint\\s+\\w+\\s*=",
    "\\bstring\\s+\\w+"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-03",
  "patch": {
   "task": "Schreibe eine Funktion, die einen Text als const-Referenz entgegennimmt und ausgibt. Teste mit einem eigenen Text.",
   "example": "#include <iostream>\n#include <string>\nvoid anzeigen(const std::string& name) { std::cout << name; }\nint main(){ anzeigen(\"Luna\"); }",
   "solution": "#include <iostream>\n#include <string>\nvoid anzeigen(const std::string& name) { std::cout << name; }\nint main(){ anzeigen(\"Luna\"); }",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bconst\\s+(?:std::)?string\\s*&"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-04",
  "patch": {
   "task": "Lege einen vector mit drei eigenen ganzen Zahlen an. Gib alle drei Werte einzeln in der Reihenfolge des vectors aus.",
   "example": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> werte{2,5,9};\n    for(int wert:werte) std::cout << wert << \"\\n\";\n}",
   "solution": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> werte{2,5,9};\n    for(int wert:werte) std::cout << wert << \"\\n\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bvector\\s*<",
    "\\bfor\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-06",
  "patch": {
   "task": "Erzeuge einen unique_ptr für eine ganze Zahl deiner Wahl und gib den gespeicherten Wert aus.",
   "example": "#include <iostream>\n#include <memory>\nint main(){\n    auto zahl=std::make_unique<int>(42);\n    std::cout << *zahl;\n}",
   "solution": "#include <iostream>\n#include <memory>\nint main(){\n    auto zahl=std::make_unique<int>(42);\n    std::cout << *zahl;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "make_unique\\s*<"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-001",
  "patch": {
   "task": "Verwende std::cout, um einen eigenen Text auszugeben.",
   "example": "#include <iostream>\nint main(){\n    std::cout << \"Mein Text\";\n}",
   "solution": "#include <iostream>\nint main(){\n    std::cout << \"Mein Text\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "std\\s*::\\s*cout"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-002",
  "patch": {
   "task": "Lege zwei eigene Strings an, verkette sie und gib das Ergebnis in einer Zeile aus.",
   "example": "#include <iostream>\n#include <string>\nint main(){\n    std::string vorname=\"Mia\", nachname=\"Nova\";\n    std::cout << vorname + \" \" + nachname;\n}",
   "solution": "#include <iostream>\n#include <string>\nint main(){\n    std::string vorname=\"Mia\", nachname=\"Nova\";\n    std::cout << vorname + \" \" + nachname;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bstring\\b",
    "\\+"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-003",
  "patch": {
   "task": "Lege einen leeren vector an. Füge mit push_back zwei eigene Zahlen hinzu und gib beide einzeln aus.",
   "example": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> werte;\n    werte.push_back(2);\n    werte.push_back(9);\n    for(int n:werte) std::cout << n << \"\\n\";\n}",
   "solution": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> werte;\n    werte.push_back(2);\n    werte.push_back(9);\n    for(int n:werte) std::cout << n << \"\\n\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bvector\\s*<",
    "\\.push_back\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-004",
  "patch": {
   "task": "Speichere drei eigene Zahlen in einem vector. Durchlaufe ihn und gib jede Zahl auf einer eigenen Zeile aus.",
   "example": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> zahlen{2,4,8};\n    for(auto zahl:zahlen) std::cout << zahl << \"\\n\";\n}",
   "solution": "#include <iostream>\n#include <vector>\nint main(){\n    std::vector<int> zahlen{2,4,8};\n    for(auto zahl:zahlen) std::cout << zahl << \"\\n\";\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bvector\\s*<",
    "\\bfor\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-007",
  "patch": {
   "task": "Verwende make_unique für eine eigene Zahl. Gib den Wert aus, den der Zeiger verwaltet.",
   "example": "#include <iostream>\n#include <memory>\nint main(){\n    auto nummer=std::make_unique<int>(8);\n    std::cout << *nummer;\n}",
   "solution": "#include <iostream>\n#include <memory>\nint main(){\n    auto nummer=std::make_unique<int>(8);\n    std::cout << *nummer;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "make_unique\\s*<"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "cpp-path-009",
  "patch": {
   "task": "Schreibe eine Lambda, die eine Zahl mit einer eigenen Grenze vergleicht. Teste sie und gib 1 oder 0 aus.",
   "example": "#include <iostream>\nint main(){\n    auto reicht=[](int n){return n>=10;};\n    std::cout << reicht(12);\n}",
   "solution": "#include <iostream>\nint main(){\n    auto reicht=[](int n){return n>=10;};\n    std::cout << reicht(12);\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^[01]$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\[[^\\]]*\\]\\s*\\(",
    "\\breturn\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-academy-01",
  "patch": {
   "task": "Gib genau einen nicht leeren Begrüßungstext deiner Wahl aus.",
   "example": "#include <stdio.h>\nint main(void){\n    puts(\"Hallo NovaLab\");\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    puts(\"Hallo NovaLab\");\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-academy-02",
  "patch": {
   "task": "Lege einen Namen und einen ganzzahligen Punktestand an. Wähle beide Werte, ändere den Punktestand und gib zuerst den Namen, dann die neue Zahl aus.",
   "example": "#include <stdio.h>\nint main(void){\n    const char *name=\"Lina\";\n    int punkte=4;\n    punkte+=3;\n    printf(\"%s\\n%d\\n\",name,punkte);\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    const char *name=\"Lina\";\n    int punkte=4;\n    punkte+=3;\n    printf(\"%s\\n%d\\n\",name,punkte);\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bint\\s+\\w+\\s*=",
    "\\bchar\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-academy-03",
  "patch": {
   "task": "Lies eine ganze Zahl ein. Gib bei positivem Wert „positiv“ aus, sonst „nicht positiv“. Die Prüfung verwendet 0. Teste im Terminal auch einen positiven Wert.",
   "example": "#include <stdio.h>\nint main(void){\n    int punkte;\n    if(scanf(\"%d\",&punkte)==1 && punkte>0) puts(\"positiv\");\n    else puts(\"nicht positiv\");\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    int punkte;\n    if(scanf(\"%d\",&punkte)==1 && punkte>0) puts(\"positiv\");\n    else puts(\"nicht positiv\");\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^nicht positiv$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bscanf\\s*\\(",
    "\\bif\\s*\\("
   ],
   "practice_instruction": null,
   "practice_test_input": "0\n"
  }
 },
 {
  "id": "c-path-001",
  "patch": {
   "task": "Wähle eine ganze Zahl und einen Text. Gib beide mit passenden printf-Formaten auf getrennten Zeilen aus.",
   "example": "#include <stdio.h>\nint main(void){\n    printf(\"%d\\n%s\\n\",7,\"NovaLab\");\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    printf(\"%d\\n%s\\n\",7,\"NovaLab\");\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^\\S.*$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bprintf\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-path-002",
  "patch": {
   "task": "Versuche, eine ganze Zahl einzulesen. Gib bei Erfolg die Zahl aus und sonst „Ungültig“. Die Prüfung gibt Text statt einer Zahl ein.",
   "example": "#include <stdio.h>\nint main(void){\n    int zahl;\n    if(scanf(\"%d\",&zahl)==1) printf(\"%d\\n\",zahl);\n    else puts(\"Ungültig\");\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    int zahl;\n    if(scanf(\"%d\",&zahl)==1) printf(\"%d\\n\",zahl);\n    else puts(\"Ungültig\");\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^Ungültig$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bscanf\\s*\\(",
    "\\bif\\s*\\("
   ],
   "practice_instruction": null,
   "practice_test_input": "abc\n"
  }
 },
 {
  "id": "c-path-003",
  "patch": {
   "task": "Vergleiche die Größe von char und long. Gib zuerst sizeof(char), dann sizeof(long) auf je einer Zeile aus.",
   "example": "#include <stdio.h>\nint main(void){\n    printf(\"%zu\\n%zu\\n\",sizeof(char),sizeof(long));\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    printf(\"%zu\\n%zu\\n\",sizeof(char),sizeof(long));\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^1$",
    "^\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "sizeof\\s*\\(\\s*char\\s*\\)",
    "sizeof\\s*\\(\\s*long\\s*\\)"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-path-004",
  "patch": {
   "task": "Lege ein Array mit mindestens zwei eigenen ganzen Zahlen an. Gib sein letztes gültiges Element aus.",
   "example": "#include <stdio.h>\nint main(void){\n    int zahlen[]={2,4,6};\n    size_t laenge=sizeof(zahlen)/sizeof(zahlen[0]);\n    printf(\"%d\\n\",zahlen[laenge-1]);\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    int zahlen[]={2,4,6};\n    size_t laenge=sizeof(zahlen)/sizeof(zahlen[0]);\n    printf(\"%d\\n\",zahlen[laenge-1]);\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\bint\\s+\\w+\\s*\\[",
    "\\[[^\\]]*-\\s*1\\s*\\]"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-path-005",
  "patch": {
   "task": "Lege eine ganze Zahl und einen Zeiger darauf an. Ändere den Wert über den Zeiger und gib den veränderten Wert aus.",
   "example": "#include <stdio.h>\nint main(void){\n    int wert=3;\n    int *zeiger=&wert;\n    *zeiger=8;\n    printf(\"%d\\n\",wert);\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    int wert=3;\n    int *zeiger=&wert;\n    *zeiger=8;\n    printf(\"%d\\n\",wert);\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "(?:\\bcout\\s*<<|\\bprintf\\s*\\(|\\bputs\\s*\\()",
    "\\*\\s*\\w+\\s*=\\s*&",
    "\\*\\s*\\w+\\s*=\\s*-?\\d"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "c-path-011",
  "patch": {
   "task": "Lies mit fgets eine Zeile ein und prüfe den Rückgabewert. Gib die Zeile bei Erfolg wieder aus. Die Prüfung verwendet den Text „NovaLab“. Im Terminal kannst du andere Texte eingeben.",
   "example": "#include <stdio.h>\nint main(void){\n    char text[100];\n    if(fgets(text,sizeof text,stdin)) fputs(text,stdout);\n    return 0;\n}",
   "solution": "#include <stdio.h>\nint main(void){\n    char text[100];\n    if(fgets(text,sizeof text,stdin)) fputs(text,stdout);\n    return 0;\n}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^NovaLab$"
   ],
   "checks": [
    "\\b(?:fputs|puts|printf)\\s*\\(",
    "\\bfgets\\s*\\(",
    "\\bif\\s*\\("
   ],
   "practice_instruction": null,
   "practice_test_input": "NovaLab\n"
  }
 },
 {
  "id": "python-path-001",
  "patch": {
   "task": "Wähle vier ganze Zahlen. Gib die beiden mittleren Elemente mit einem Slice in einer Zeile aus.",
   "example": "werte=[2,8,11,20]\nprint(werte[1:3])",
   "solution": "werte=[2,8,11,20]\nprint(werte[1:3])",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\[-?\\d+,\\s*-?\\d+\\]$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\[[^\\]\\n]+:[^\\]\\n]+\\]"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-002",
  "patch": {
   "task": "Erzeuge mit einer List Comprehension alle geraden Zahlen von 2 bis 10. Gib die Liste aus. Der Variablenname ist frei.",
   "example": "gerade=[zahl for zahl in range(2,11,2)]\nprint(gerade)",
   "solution": "gerade=[zahl for zahl in range(2,11,2)]\nprint(gerade)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\[2,\\s*4,\\s*6,\\s*8,\\s*10\\]$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\[[^\\]\\n]*\\bfor\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-003",
  "patch": {
   "task": "Wähle zwei unterschiedliche Wörter und erstelle per Dictionary Comprehension eine Zuordnung von Wort zu Länge. Gib das Dictionary aus.",
   "example": "woerter=[\"Nova\",\"Lab\"]\nlaengen={wort:len(wort) for wort in woerter}\nprint(laengen)",
   "solution": "woerter=[\"Nova\",\"Lab\"]\nlaengen={wort:len(wort) for wort in woerter}\nprint(laengen)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\{.+:\\s*\\d+,.+:\\s*\\d+\\}$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\{[^}]*\\bfor\\b",
    "\\blen\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-004",
  "patch": {
   "task": "Wähle zwei unterschiedliche Wörter und wiederhole eines in einer Liste. Entferne Duplikate mit set und gib die Anzahl eindeutiger Wörter aus.",
   "example": "farben=[\"rot\",\"rot\",\"blau\"]\nprint(len(set(farben)))",
   "solution": "farben=[\"rot\",\"rot\",\"blau\"]\nprint(len(set(farben)))",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^2$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bset\\s*\\(",
    "\\blen\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-005",
  "patch": {
   "task": "Lege ein Tupel mit drei eigenen Zahlen an. Entpacke es in drei Variablen und gib die Werte einzeln aus.",
   "example": "punkt=(7,12,3)\nx,y,z=punkt\nprint(x)\nprint(y)\nprint(z)",
   "solution": "punkt=(7,12,3)\nx,y,z=punkt\nprint(x)\nprint(y)\nprint(z)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*="
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-006",
  "patch": {
   "task": "Wähle zwei Wörter unterschiedlicher Länge. Sortiere sie nach Länge und gib jedes Wort auf einer eigenen Zeile aus.",
   "example": "namen=[\"Alexander\",\"Mia\"]\nfor name in sorted(namen,key=len):\n    print(name)",
   "solution": "namen=[\"Alexander\",\"Mia\"]\nfor name in sorted(namen,key=len):\n    print(name)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "(?:\\bsorted\\s*\\(|\\.sort\\s*\\()",
    "\\bkey\\s*="
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-007",
  "patch": {
   "task": "Schreibe eine Funktion mit einem Standardnamen. Rufe sie einmal ohne Argument und einmal mit einem eigenen Namen auf. Gib beide Begrüßungen aus.",
   "example": "def gruessen(name=\"Gast\"):\n    return f\"Hallo {name}\"\nprint(gruessen())\nprint(gruessen(\"Lina\"))",
   "solution": "def gruessen(name=\"Gast\"):\n    return f\"Hallo {name}\"\nprint(gruessen())\nprint(gruessen(\"Lina\"))",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bdef\\s+\\w+\\([^)]*=",
    "\\breturn\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-008",
  "patch": {
   "task": "Definiere eine Klasse mit einem Markenattribut. Erzeuge zwei Objekte mit eigenen Marken und gib die Marken einzeln aus.",
   "example": "class Auto:\n    def __init__(self, marke):\n        self.marke=marke\na=Auto(\"Nova\")\nb=Auto(\"Luna\")\nprint(a.marke)\nprint(b.marke)",
   "solution": "class Auto:\n    def __init__(self, marke):\n        self.marke=marke\na=Auto(\"Nova\")\nb=Auto(\"Luna\")\nprint(a.marke)\nprint(b.marke)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bclass\\b",
    "\\bdef\\s+__init__"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-009",
  "patch": {
   "task": "Modelliere einen Artikel als Dataclass mit einem Namen und einem Preis. Wähle beide Werte selbst und gib sie einzeln aus.",
   "example": "from dataclasses import dataclass\n\n@dataclass\nclass Artikel:\n    name: str\n    preis: float\n\nartikel=Artikel(\"Tee\",4.5)\nprint(artikel.name)\nprint(artikel.preis)",
   "solution": "from dataclasses import dataclass\n\n@dataclass\nclass Artikel:\n    name: str\n    preis: float\n\nartikel=Artikel(\"Tee\",4.5)\nprint(artikel.name)\nprint(artikel.preis)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^-?\\d+(?:[.,]\\d+)?$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "@dataclass",
    "\\bclass\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-010",
  "patch": {
   "task": "Schreibe einen Generator, der drei selbst gewählte ganze IDs liefert. Gib die IDs einzeln aus.",
   "example": "def ids():\n    yield 12\n    yield 18\n    yield 22\n\nfor nummer in ids():\n    print(nummer)",
   "solution": "def ids():\n    yield 12\n    yield 18\n    yield 22\n\nfor nummer in ids():\n    print(nummer)",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$",
    "^-?\\d+$",
    "^-?\\d+$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\byield\\b",
    "\\bdef\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-011",
  "patch": {
   "task": "Schreibe in der Übungsumgebung einen frei gewählten Text in eine Datei. Öffne sie erneut mit with und gib den Inhalt aus.",
   "example": "with open(\"daten.txt\",\"w\",encoding=\"utf-8\") as datei:\n    datei.write(\"Meine Notiz\")\nwith open(\"daten.txt\",encoding=\"utf-8\") as datei:\n    print(datei.read())",
   "solution": "with open(\"daten.txt\",\"w\",encoding=\"utf-8\") as datei:\n    datei.write(\"Meine Notiz\")\nwith open(\"daten.txt\",encoding=\"utf-8\") as datei:\n    print(datei.read())",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bwith\\s+open\\s*\\(",
    "\\.read\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-012",
  "patch": {
   "task": "Erzeuge einen Pfad deiner Wahl mit Path. Gib mit exists aus, ob der Pfad vorhanden ist.",
   "example": "from pathlib import Path\npfad=Path(\"meine-datei.txt\")\nprint(pfad.exists())",
   "solution": "from pathlib import Path\npfad=Path(\"meine-datei.txt\")\nprint(pfad.exists())",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^(True|False)$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bPath\\s*\\(",
    "\\.exists\\s*\\("
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-013",
  "patch": {
   "task": "Schreibe eine Funktion mit Typangabe für einen ganzzahligen Parameter und Rückgabewert. Verdopple eine Zahl deiner Wahl und gib das Ergebnis aus.",
   "example": "def doppelt(zahl: int) -> int:\n    return zahl * 2\nprint(doppelt(9))",
   "solution": "def doppelt(zahl: int) -> int:\n    return zahl * 2\nprint(doppelt(9))",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^-?\\d+$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\bdef\\s+\\w+\\([^)]*:\\s*int",
    "->\\s*int",
    "\\breturn\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "python-path-016",
  "patch": {
   "task": "Definiere eine Coroutine, warte kurz mit asyncio.sleep und gib anschließend einen eigenen Text aus.",
   "example": "import asyncio\n\nasync def warten():\n    await asyncio.sleep(0.1)\n    print(\"Fertig\")\n\nawait warten()",
   "solution": "import asyncio\n\nasync def warten():\n    await asyncio.sleep(0.1)\n    print(\"Fertig\")\n\nawait warten()",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "\\bprint\\s*\\(",
    "\\basync\\s+def",
    "\\bawait\\s+asyncio\\.sleep"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "typescript-01",
  "patch": {
   "task": "Lege eine Variable mit explizitem TypeScript-Typ an. Gib ihren frei gewählten Wert aus.",
   "example": "const name: string = \"Mia\";\nconsole.log(name);",
   "solution": "const name: string = \"Mia\";\nconsole.log(name);",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "console\\.log",
    "\\b(?:const|let)\\s+\\w+\\s*:\\s*(?:string|number|boolean)"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "typescript-02",
  "patch": {
   "task": "Deklariere eine Variable mit dem Union-Typ string oder number. Wähle einen erlaubten Wert und gib ihn aus.",
   "example": "const eingabe: string | number = 7;\nconsole.log(eingabe);",
   "solution": "const eingabe: string | number = 7;\nconsole.log(eingabe);",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "console\\.log",
    "(?:string\\s*\\|\\s*number|number\\s*\\|\\s*string)"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "typescript-03",
  "patch": {
   "task": "Definiere ein Interface mit einem Textfeld. Erstelle ein passendes Objekt mit einem eigenen Text und gib das Feld aus.",
   "example": "interface Person { name: string }\nconst person: Person={name:\"Lina\"};\nconsole.log(person.name);",
   "solution": "interface Person { name: string }\nconst person: Person={name:\"Lina\"};\nconsole.log(person.name);",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "console\\.log",
    "\\binterface\\b",
    "\\w+\\s*:\\s*string"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "typescript-04",
  "patch": {
   "task": "Definiere ein Interface mit einem optionalen Textfeld. Gib den Wert oder einen selbst gewählten Ersatztext aus.",
   "example": "interface Profil { name?: string }\nconst profil: Profil={};\nconsole.log(profil.name ?? \"Gast\");",
   "solution": "interface Profil { name?: string }\nconst profil: Profil={};\nconsole.log(profil.name ?? \"Gast\");",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "console\\.log",
    "\\?\\s*:\\s*string",
    "\\?\\?"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "typescript-05",
  "patch": {
   "task": "Schreibe eine generische Funktion, die ihr Argument zurückgibt. Rufe sie mit einem eigenen Wert auf und gib ihn aus.",
   "example": "function identity<T>(wert:T):T { return wert; }\nconsole.log(identity(\"Nova\"));",
   "solution": "function identity<T>(wert:T):T { return wert; }\nconsole.log(identity(\"Nova\"));",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$"
   ],
   "checks": [
    "console\\.log",
    "\\bfunction\\s+\\w+\\s*<",
    "\\breturn\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "json-01",
  "patch": {
   "task": "Schreibe ein gültiges JSON-Objekt mit mindestens einem selbst gewählten Schlüssel und Wert. Verwende doppelte Anführungszeichen für Text und Schlüssel.",
   "example": "{\"name\":\"Mia\",\"level\":7}",
   "solution": "{\"name\":\"Mia\",\"level\":7}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^(?:\\{|\\[)[\\s\\S]*(?:\\}|\\])$"
   ],
   "checks": [
    "^\\s*\\{"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "json-02",
  "patch": {
   "task": "Schreibe ein gültiges JSON-Array mit zwei Objekten und verwende eigene Werte.",
   "example": "[{\"name\":\"Mia\"},{\"name\":\"Lina\"}]",
   "solution": "[{\"name\":\"Mia\"},{\"name\":\"Lina\"}]",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^(?:\\{|\\[)[\\s\\S]*(?:\\}|\\])$"
   ],
   "checks": [
    "^\\s*\\[\\s*\\{[\\s\\S]*\\}\\s*,\\s*\\{"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "json-03",
  "patch": {
   "task": "Schreibe gültiges JSON mit einer Zahl, einem Text und einem Wahrheitswert eigener Wahl.",
   "example": "{\"punkte\":7,\"name\":\"Mia\",\"online\":true}",
   "solution": "{\"punkte\":7,\"name\":\"Mia\",\"online\":true}",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^(?:\\{|\\[)[\\s\\S]*(?:\\}|\\])$"
   ],
   "checks": [
    ":\\s*-?\\d",
    "\\x22\\s*:\\s*\\x22",
    ":\\s*(?:true|false)"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "sql-01",
  "patch": {
   "task": "Lege eine Tabelle mit einem Textfeld an. Füge einen eigenen Text ein und zeige ihn mit SELECT an. Der Spaltenname in der Ausgabe ist frei.",
   "example": "CREATE TABLE kurse (name TEXT);\nINSERT INTO kurse VALUES ('Lua');\nSELECT name FROM kurse;",
   "solution": "CREATE TABLE kurse (name TEXT);\nINSERT INTO kurse VALUES ('Lua');\nSELECT name FROM kurse;",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "CREATE\\s+TABLE",
    "INSERT\\s+INTO",
    "SELECT"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "sql-02",
  "patch": {
   "task": "Lege Testdaten mit zwei eigenen Texten an. Verwende SELECT mit WHERE, sodass genau eine Zeile erscheint.",
   "example": "CREATE TABLE spieler(name TEXT);\nINSERT INTO spieler VALUES ('Mia'),('Lina');\nSELECT name FROM spieler WHERE name='Mia';",
   "solution": "CREATE TABLE spieler(name TEXT);\nINSERT INTO spieler VALUES ('Mia'),('Lina');\nSELECT name FROM spieler WHERE name='Mia';",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bWHERE\\b",
    "\\bSELECT\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "sql-03",
  "patch": {
   "task": "Lege eine Testtabelle an. Füge einen frei gewählten Eintrag hinzu, ändere ihn mit UPDATE und zeige den neuen Eintrag an.",
   "example": "CREATE TABLE kurse(name TEXT);\nINSERT INTO kurse VALUES ('Lua');\nUPDATE kurse SET name='Java';\nSELECT name FROM kurse;",
   "solution": "CREATE TABLE kurse(name TEXT);\nINSERT INTO kurse VALUES ('Lua');\nUPDATE kurse SET name='Java';\nSELECT name FROM kurse;",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bINSERT\\b",
    "\\bUPDATE\\b",
    "\\bSELECT\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "sql-04",
  "patch": {
   "task": "Füge drei eigene Zahlen ein. Sortiere sie mit ORDER BY und begrenze die Ausgabe mit LIMIT auf einen Datensatz.",
   "example": "CREATE TABLE punkte(wert INTEGER);\nINSERT INTO punkte VALUES (4),(9),(2);\nSELECT wert FROM punkte ORDER BY wert DESC LIMIT 1;",
   "solution": "CREATE TABLE punkte(wert INTEGER);\nINSERT INTO punkte VALUES (4),(9),(2);\nSELECT wert FROM punkte ORDER BY wert DESC LIMIT 1;",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^-?\\d+$"
   ],
   "checks": [
    "ORDER\\s+BY",
    "LIMIT\\s+1\\b"
   ],
   "practice_instruction": null
  }
 },
 {
  "id": "sql-05",
  "patch": {
   "task": "Lege zwei Testtabellen an. Verknüpfe sie über eine gemeinsame ID und gib einen passenden eigenen Wert aus.",
   "example": "CREATE TABLE teams(id INT, name TEXT);\nCREATE TABLE spieler(team INT);\nINSERT INTO teams VALUES (1,'Nova');\nINSERT INTO spieler VALUES (1);\nSELECT teams.name FROM teams JOIN spieler ON spieler.team=teams.id;",
   "solution": "CREATE TABLE teams(id INT, name TEXT);\nCREATE TABLE spieler(team INT);\nINSERT INTO teams VALUES (1,'Nova');\nINSERT INTO spieler VALUES (1);\nSELECT teams.name FROM teams JOIN spieler ON spieler.team=teams.id;",
   "practice_mode": "auto",
   "practice_output": "criteria",
   "practice_lines": [
    "^\\S.*$",
    "^\\S.*$"
   ],
   "checks": [
    "\\bJOIN\\b",
    "\\bON\\b"
   ],
   "practice_instruction": null
  }
 }
]
$practice$::jsonb) AS repair(id text,patch jsonb)
WHERE lesson.lesson_id=repair.id;

UPDATE public.ll_lesson_content
SET payload = payload || jsonb_build_object('practice_instruction',
  CASE WHEN payload->>'lang' = 'blender'
    THEN 'Arbeite mit deinem eigenen Objekt oder deiner eigenen Szene. Vergleiche das sichtbare Ergebnis mit der Aufgabe und halte die Schritte fest.'
    ELSE 'Teste eine eigene Variante, sofern die Aufgabe Werte offenlässt. Notiere Eingabe, beobachtetes Ergebnis und einen Randfall.'
  END)
WHERE payload->>'practice_mode' = 'guided'
  AND nullif(btrim(payload->>'practice_instruction'), '') IS NULL;
