/* LiveryLab Academy · DE / EN locale switch
 * The locale is a presentation preference. No editor source, passwords,
 * user content, account names or Supabase records are translated/mutated.
 * Made with 💙 by NyxAtheris (LiveryLab Studios)
 */
(function(root){
'use strict';
const storageKey='liverylab-language',accountKey=id=>storageKey+'-'+id;
let current='de',accountId='',observer=null,scheduled=false,processing=false;
try{current=localStorage.getItem(storageKey)==='en'?'en':'de';}catch(_){}
const translations={
'Navigation':'Navigation','DEIN PROFIL':'YOUR PROFILE','Startseite':'Home','Lernen':'Learn','Prüfung':'Exam','Prüfungen':'Exams','Referenz':'Reference','Referenz 🔒':'Reference 🔒','Mein Profil':'My Profile','Profil':'Profile','Freunde':'Friends','Support':'Support','Einstellungen':'Settings','Administration':'Administration','Menü öffnen':'Open menu','Menü schließen':'Close menu','Home':'Home',
'Anmelden':'Sign in','Abmelden':'Sign out','Anmelden →':'Sign in →','Registrieren':'Register','Registrierung':'Registration','E-Mail-Adresse':'Email address','Benutzername':'Username','Passwort':'Password','Passwort wiederholen':'Repeat password','Neues Passwort':'New password','Passwort speichern':'Save password','Passwort aktualisieren':'Update password','Passwort ändern':'Change password','Konto erstellen':'Create account','Konto':'Account','Konto erstellen →':'Create account →','Zurück zur Anmeldung':'Back to sign in','Anmelden statt registrieren':'Sign in instead','Noch keinen Account?':'No account yet?','Bereits registriert?':'Already registered?','Angemeldet bleiben':'Stay signed in','Passwort vergessen?':'Forgot password?','Jetzt registrieren':'Register now',
'Deine Academy.':'Your Academy.','Dein Design.':'Your design.','DEINE ACADEMY':'YOUR ACADEMY','WILLKOMMEN ZURÜCK':'WELCOME BACK','Willkommen zurück':'Welcome back','Willkommen zurück!':'Welcome back!','Weiterlernen':'Continue learning','Jetzt fortsetzen':'Continue now','Jetzt fortsetzen →':'Continue now →','Weiterlernen →':'Continue learning →','Alle Kurse':'All courses','Kurse entdecken':'Explore courses','Alle Kurse ansehen':'View all courses','Kursübersicht':'Course overview','Kursbibliothek':'Course library','Zur Kursbibliothek':'Back to course library','Lernpfad':'Learning path','Lernpfade':'Learning paths','Dein Lernpfad':'Your learning path','Mein Fortschritt':'My progress','Dein Fortschritt':'Your progress','Fortschritt':'Progress','Abgeschlossen':'Completed','Offen':'Not started','Fortsetzen':'Continue','Starten':'Start','Zurück':'Back','Weiter':'Next','Nächste Lektion':'Next lesson','Vorherige Lektion':'Previous lesson','Lektionen':'Lessons','Lektion':'Lesson','Erledigt':'Done','Gesperrt':'Locked','✓ Abgeschlossen':'✓ Completed','Erneut versuchen':'Try again','Alle anzeigen':'Show all','Mehr anzeigen':'Show more','Weniger anzeigen':'Show less','Laden …':'Loading…','Academy startet …':'Starting Academy…','Geschützte Lektion wird geladen …':'Loading protected lesson…',
'Anfänger':'Beginner','Aufbau':'Intermediate','Fortgeschritten':'Advanced','Grundlagen':'Fundamentals','Sprachen':'Languages','Tools':'Tools','Backend':'Backend','Frameworks':'Frameworks','Profi-Wissen':'Advanced topics','3D & Blender':'3D & Blender','Alle':'All','Suchen':'Search','Kurs suchen':'Search courses','Kurse durchsuchen':'Search courses','Nach Kursen suchen':'Search courses','Suchen …':'Searching…','Keine Ergebnisse':'No results','Inhalt nicht gefunden':'Content not found','Dieser Lernpfad ist nicht verfügbar.':'This learning path is not available.',
'Video':'Video','Video ansehen':'Watch video','Video-Lektion':'Video lesson','Video-Lektionen':'Video lessons','Tutorial ansehen':'Watch tutorial','Video angesehen':'Video watched','Video bestätigt':'Video confirmed','Praxis':'Practice','Praxisaufgaben':'Practice exercises','Aufgabe':'Exercise','Deine Aufgabe':'Your exercise','Deine Aufgabe:':'Your task:','Meine Lösung':'My solution','Lösung anzeigen':'Show solution','Lösung zeigen':'Show solution','Tipp':'Hint','Hinweis':'Hint','Hinweise':'Hints','Prüfen':'Check','✓ Prüfen':'✓ Check','Prüft …':'Checking…','Üben':'Practice','Verstehen':'Understand','Zum Übungsteil →':'Go to practice →','← Zur Erklärung':'← Back to explanation','LERNTEIL':'LESSON PART','LERNTEIL 1 VON 2':'PART 1 OF 2','LERNTEIL 2 VON 2':'PART 2 OF 2','1 · Verstehen & Beispiel':'1 · Understand & example','2 · Ausprobieren & festigen':'2 · Practice & reinforce','1 · Verstehen & Beispiel':'1 · Understand & example','2 · Ausprobieren & festigen':'2 · Practice & reinforce','DEIN LERNZIEL':'YOUR LEARNING GOAL','DEINE KONKRETE AUFGABE':'YOUR PRACTICAL TASK',
'Wissen prüfen':'Check your knowledge','Quiz':'Quiz','Quizfragen':'Quiz questions','Richtige Antwort':'Correct answer','Falsche Antwort':'Incorrect answer','Richtig!':'Correct!','Falsch':'Incorrect','Frage':'Question','Fragen':'Questions','Nächste Frage':'Next question','Quiz bestanden!':'Quiz passed!','Quiz nicht bestanden':'Quiz not passed','Alle Fragen richtig beantwortet!':'All questions answered correctly!','✓ Alle Fragen richtig beantwortet!':'✓ All questions answered correctly!','Wähle eine Antwort. Bei richtiger Lösung folgt sofort die nächste Frage.':'Choose an answer. A correct answer takes you to the next question.','Lies den passenden Lernteil noch einmal.':'Read the relevant lesson part again.','Lektion abschließen':'Complete lesson','Lektion erneut bearbeiten':'Repeat lesson','30 XP möglich':'Earn 30 XP','✓ 30 XP bereits erhalten':'✓ 30 XP already earned','Deine Lösung wurde gespeichert.':'Your solution has been saved.',
'Kursprüfung':'Course exam','Abschlussprüfung':'Final exam','Prüfung starten':'Start exam','Prüfung ansehen':'View exam','Prüfung ansehen →':'View exam →','Prüfung bestanden':'Exam passed','Bereit für die Prüfung?':'Ready for the exam?','Trainiere dein Wissen mit Fragen aus diesem Kurs.':'Test your knowledge with questions from this course.',
'DEIN LERNFORTSCHRITT':'YOUR LEARNING PROGRESS','DEINE BELOHNUNGEN':'YOUR REWARDS','Wofür du XP bekommen hast':'Where your XP came from','Erlernte XP':'XP earned','30 XP':'30 XP','Level':'Level','Streak':'Streak','Login-Streak in Tagen':'Login streak (days)','Bisheriger Rekord':'Personal best','freigeschaltet':'unlocked','Freigeschaltet':'Unlocked','Gesperrt':'Locked','Erfolge & Titel':'Achievements & titles','AUSZEICHNUNGEN':'ACHIEVEMENTS','DEIN PROFILTITEL':'YOUR PROFILE TITLE','Titel verwenden':'Use title','Freigeschalteten Titel auswählen':'Choose an unlocked title','Freundesliste öffnen →':'Open friends list →','Freundesliste':'Friends list','Freund hinzufügen':'Add friend','Anfrage senden →':'Send request →','Anfrage senden':'Send request','Anfrage annehmen':'Accept request','Anfrage ablehnen':'Decline request',
'EINSTELLUNGEN':'SETTINGS','PERSÖNLICHES DESIGN':'PERSONAL DESIGN','01 · PERSÖNLICHES DESIGN':'01 · PERSONAL DESIGN','Farben & Hintergrund':'Colors & background','Hintergrund & Oberflächen':'Background & surfaces','Akzentfarbe':'Accent color','App-Hintergrund':'App background','Hintergrund-Effekte':'Background effects','Kompakte Kurskarten':'Compact course cards','Größere Schrift':'Larger text','Hoher Kontrast':'High contrast','Konto & Sicherheit':'Account & security','Sicherheit':'Security','SICHERHEIT':'SECURITY','Authenticator':'Authenticator','Zwei-Faktor-Authentifizierung':'Two-factor authentication','Zurücksetzen':'Reset','Auf Standard zurücksetzen':'Reset to default','Speichern':'Save','Änderungen speichern':'Save changes','Gespeichert':'Saved','Sprache':'Language','Sprache auswählen':'Choose language','Deutsch':'German','Englisch':'English','Automatisch':'Automatic','Datenschutz':'Privacy','Datenschutzerklärung':'Privacy policy',
'Free':'Free','Plus':'Plus','Ultimate':'Ultimate','Mitgliedschaft':'Membership','Mitgliedschaften':'Memberships','Tarif':'Plan','Tarife':'Plans','Abo':'Subscription','Abo beenden':'End subscription','Laufzeit in Tagen':'Duration in days','Laufzeit festlegen':'Set duration','Kein aktives Abo':'No active subscription','Unbefristet':'Unlimited','Abgelaufen':'Expired','Dauerhaft freigeschaltet':'Permanently unlocked','Tage hinzufügen':'Add days','Tage abziehen':'Remove days','+ Tage':'+ Days','− Tage':'− Days','Tage':'Days','Tag':'Day','Stunden':'Hours','Minuten':'Minutes','Kostenlos':'Free','Jetzt freischalten':'Unlock now','Tarif ansehen →':'View plan →','Mitgliedschaften vergleichen →':'Compare plans →','Mitgliedschaften vergleichen':'Compare plans','Gutschein':'Voucher','Gutscheine':'Vouchers','Gutschein einlösen':'Redeem voucher','Rabatt':'Discount','Gutscheincode':'Voucher code',
'DEINE FOKUSZEIT':'YOUR FOCUS TIME','LIVERYLAB · DEIN LERNMODUS':'LIVERYLAB · YOUR STUDY MODE','Deine Fokuszeit.':'Your focus time.','Fokuszeit':'Focus time','VERBLEIBENDE ZEIT':'TIME REMAINING','Eigene Dauer':'Custom duration','Minuten':'Minutes','Starten':'Start','▶ Starten':'▶ Start','⏸ Pausieren':'⏸ Pause','Pausieren':'Pause','Zeit einstellen':'Set duration','↻ Zurücksetzen auf 25 Minuten':'↻ Reset to 25 minutes','Timer':'Timer','Timer bereit oder pausiert.':'Timer ready or paused.','Fokus-Timer öffnen':'Open focus timer','Fokus-Timer schließen':'Close focus timer','Schließen':'Close',
'DAILY STREAK':'DAILY STREAK','TÄGLICHE BELOHNUNG':'DAILY REWARD','Tägliche Belohnung':'Daily reward','Belohnung abholen':'Claim reward','Jetzt abholen':'Claim now','Abholen':'Claim','Bereits abgeholt':'Already claimed','Noch nicht verfügbar':'Not available yet','Wieder verfügbar in':'Available again in','Täglicher Login':'Daily login','🔥 0 Tage':'🔥 0 days',
'ADMINISTRATION':'ADMINISTRATION','Administratoren':'Administrators','Mitglieder':'Members','Mitglied':'Member','Nutzer':'Users','Nutzer suchen':'Search users','Bestätigen':'Confirm','Ablehnen':'Reject','Freischalten':'Approve','Sperren':'Block','Entsperren':'Unblock','Löschen':'Delete','Konto löschen':'Delete account','Erstellen':'Create','Aktionen':'Actions','Abo-Verwaltung':'Subscription management','Abo-Laufzeit':'Subscription duration','Endet am':'Expires on','Aktiv':'Active','Inaktiv':'Inactive','Keine Einträge':'No entries',
'Fehler':'Error','Unbekannter Fehler':'Unknown error','Etwas ist schiefgelaufen.':'Something went wrong.','Bitte erneut versuchen.':'Please try again.','Zurück zum Start':'Back to home','Neu laden':'Reload','Wird geladen …':'Loading…','Überprüfen':'Verify','Kopieren':'Copy','Kopiert':'Copied','Hilfe':'Help','Support-Ticket':'Support ticket','Discord-Support':'Discord support','Jetzt beitreten':'Join now','Meine Notizen':'My notes',
'2 · Ausprobieren & festigen':'2 · Practice & reinforce','1 · Verstehen & Beispiel':'1 · Understand & example',
'Jetzt selbst ausprobieren:':'Try it yourself:','Typischer Fehler:':'Common mistake:','Die Idee dahinter.':'The idea behind it.','Offizielle Dokumentation ↗':'Official documentation ↗'
};
// Additional exact translations for longer reusable sentences.
Object.assign(translations,{
'Die Änderungen werden sofort auf diesem Gerät gespeichert.':'Changes are saved immediately on this device.',
'Deine Academy. Dein Design.':'Your Academy. Your design.',
'Passe den Hintergrund und die Farben deiner App an. Darunter verwaltest du Anmeldung, Passwort und Sicherheit.':'Customize your app background and colors. Below you can manage your sign-in, password, and security.',
'Jede Lektion gibt genau einmal 30 XP. Wiederholungen bringen keine neuen XP.':'Each lesson awards 30 XP only once. Repeating it does not grant more XP.',
'Du hast noch keine XP gesammelt. Schließe deine erste Lektion ab.':'You have not earned any XP yet. Complete your first lesson.',
'Hier siehst du deine wichtigsten Werte und freigeschalteten Erfolge. Persönliche App-Farben und Hintergründe findest du in den Einstellungen.':'See your key stats and unlocked achievements here. Change your app colors and backgrounds in Settings.',
'Deine Streak zählt nur, wenn du täglich den Claim bestätigst. Nach dem Einlösen wartest du mindestens 24 Stunden. Der Kalendertag richtet sich nach Europe/Berlin.':'Your streak counts only if you claim it each day. After claiming, you must wait at least 24 hours. Calendar days follow the Europe/Berlin time zone.',
'Du kannst nur Titel auswählen, die du durch Lektionen, Prüfungen, Freunde oder Streaks freigeschaltet hast.':'You can only choose titles unlocked through lessons, exams, friends, or login streaks.',
'Sieh den freiwillig freigegebenen Lernfortschritt deiner bestätigten Freunde.':'See the learning progress your confirmed friends choose to share.',
'Konzentriert lernen, Schritt für Schritt. Deine Zeit bleibt auch beim Seitenwechsel erhalten.':'Study with focus, one step at a time. Your timer continues when you change pages.',
'Timer bereit. Wähle eine Zeit und starte deine Lernsession.':'Timer ready. Choose a duration and start your study session.',
'Deine Lernzeit läuft. Der Countdown bleibt beim Seitenwechsel aktiv.':'Your study session is running. The countdown continues when you change pages.',
'Du hast diese Lektion bereits abgeschlossen.':'You have already completed this lesson.',
'Deine Lektion ist abgeschlossen. Bitte bestätige die XP-Gutschrift.':'Lesson completed. Please confirm the XP reward.',
'Die 30 XP für diese Lektion hast du bereits erhalten.':'You have already received the 30 XP for this lesson.',
'Lektion abgeschlossen! 30 XP wurden bereits früher vergeben.':'Lesson completed! You already earned these 30 XP.',
'Bitte Video, praktische Übung und Quiz abschließen.':'Please complete the video, practice task, and quiz.',
'Prüfe deine Lösung mit dem Button „Prüfen“. Richtig wird grün angezeigt, falsch wird rot.':'Use the Check button to verify your solution. Correct answers appear green; incorrect answers appear red.',
'Keine Lerninhalte vorhanden.':'No learning content available.',
'Ein neues Konto kann erst nach Freigabe durch das Team verwendet werden.':'New accounts can only be used after team approval.',
'Programmierung, FiveM und Blender in klaren Lernpfaden – mit Videos, Praxis, Quizzen und Abschlussprüfungen.':'Programming, FiveM, and Blender in structured learning paths with videos, practice, quizzes, and final exams.',
'Schritt für Schritt.':'Step by step.',
'Baue echte Skills.':'Build real skills.',
'Wähle die richtige Antwort, um zur nächsten Frage zu gelangen.':'Choose the correct answer to move to the next question.',
'Wähle eine Antwort. Bei richtiger Lösung folgt sofort die nächste Frage.':'Choose an answer. A correct answer immediately moves to the next question.',
'Noch nicht richtig. Lies den passenden Lernteil noch einmal.':'Not quite right. Read the relevant lesson part again.',
'Video, Übung und Quiz':'Video, exercise, and quiz',
'Diese Lektion ist bereits abgeschlossen.':'This lesson is already complete.',
'Nur auf diesem Gerät gespeichert':'Saved only on this device',
'✓ Nur auf diesem Gerät gespeichert':'✓ Saved only on this device',
'Du kannst deinen Code später auf diesem Gerät weiterbearbeiten.':'You can continue editing your code on this device later.',
'Abgeschlossene Lektionen und XP werden in deinem Konto gespeichert.':'Completed lessons and XP are stored in your account.',
'In der Academy werden deine Fortschritte in klaren Schritten gezeigt.':'The Academy shows your progress in clear steps.'
});

Object.assign(translations,{
'← Prüfungen':'← Exams','← Übersicht':'← Overview','← Kursübersicht':'← Course overview','Nächste Lektion →':'Next lesson →','Abschlussprüfung →':'Final exam →','Jetzt starten →':'Start now →',
'★ Kursprüfungen':'★ Course exams','NEUE ACADEMY · V28':'NEW ACADEMY · V28','Dein Weg in die':'Your path to the','ANFRAGE VERSENDET':'REQUEST SENT','Melde dich mit deinem Benutzernamen oder deiner E-Mail-Adresse an.':'Sign in using your username or email address.',
'← Bereits registriert? Anmelden':'← Already registered? Sign in','Noch kein Konto?':'No account yet?','Jetzt registrieren →':'Register now →',
'Dein Konto muss vom Team freigegeben werden. Nach der Anmeldung kannst du Supportanfragen direkt in der Academy stellen.':'Your account must be approved by the team. After signing in, you can send support requests directly in the Academy.',
'Sicherer Zugang über LiveryLab Academy':'Secure access through LiveryLab Academy','Freigabe erneut prüfen →':'Check approval again →','Support auf Discord':'Support on Discord',
'Vorläufiges Passwort':'Temporary password','Dein vorläufiges Passwort muss bei der ersten Anmeldung ersetzt werden. Wähle mindestens 14 Zeichen.':'Your temporary password must be changed the first time you sign in. Choose at least 14 characters.',
'Authenticator konnte nicht geladen werden.':'Could not load the authenticator.','Lade die Website neu, um 2FA zu öffnen.':'Reload the site to open two-factor authentication.','2FA konnte nicht geladen werden.':'Could not load two-factor authentication.',
'DEINE TÄGLICHE BELOHNUNG':'YOUR DAILY REWARD','Drücke auf':'Tap','Komm morgen wieder und sichere deine Serie. Das nächste Zeitfenster öffnet nach 24 Stunden.':'Come back tomorrow to keep your streak. The next claim window opens after 24 hours.',
'Nächster Claim in':'Next claim in','Nächster Claim nach dem Einlösen:':'Next claim after collecting:',
'Ein Claim pro Kalendertag (00:00–00:00 Uhr, Deutschland). Wird ein ganzer Tag übersprungen, startet die Serie wieder bei 1.':'One claim per calendar day (midnight to midnight, Germany). If you miss an entire day, your streak restarts at 1.',
'Lerne programmieren, entwickle Projekte und erreiche deine nächsten Ziele.':'Learn to code, build projects, and reach your next goals.','Deine Streak':'Your streak','DEIN TAGESZIEL':'YOUR DAILY GOAL','DEIN WOCHENZIEL':'YOUR WEEKLY GOAL',
'Abgeschlossene Lektionen seit Mitternacht auf diesem Konto.':'Lessons completed since midnight on this account.','Stelle deine eigene Lernzeit ein.':'Choose your own study time.',
'[ ✦ ] DEINE ACADEMY':'[ ✦ ] YOUR ACADEMY','Was möchtest du heute machen?':'What would you like to do today?','[ ◎ ] DEIN FOKUS':'[ ◎ ] YOUR FOCUS','Was willst du als Nächstes lernen?':'What would you like to learn next?',
'Wähle einen Bereich für eine direkte Empfehlung. Die Auswahl bleibt auf diesem Gerät.':'Choose a topic for a recommendation. Your selection stays on this device.',
'Blender lernen mit':'Learn Blender with','Schau dir die Grundlagen direkt in den Lektionen an, prüfe dein Wissen und baue deine Fähigkeiten Schritt für Schritt auf.':'Explore the fundamentals in each lesson, test your knowledge, and grow your skills step by step.',
'Blender-Lernpfad öffnen →':'Open Blender learning path →','Jede Lektion erklärt ein Konzept. Danach schaust du ein passendes Tutorial an, löst eine Praxisaufgabe und überprüfst dein Wissen.':'Each lesson explains a concept. Then you watch a related tutorial, complete an exercise, and check your understanding.',
'PRÜFUNG':'EXAM','NÄCHSTE LEKTION':'NEXT LESSON','KURSINHALT GESCHÜTZT':'PROTECTED COURSE CONTENT','Diese Lektion ist mit':'This lesson unlocks with',
'XP-Gutschrift überprüfen':'Check XP reward','Der externe Player wird erst auf deinen Klick geladen.':'The external video player loads only after you tap it.',
'Auf YouTube öffnen ↗':'Open on YouTube ↗','Ein Tutorial zum Thema finden':'Find a tutorial on this topic',
'Deine eigene Bestätigung – die Videowiedergabe lässt sich nicht verlässlich messen.':'Confirm that you watched the video; playback cannot be measured reliably.',
'[ + ] NEUE ANFRAGE':'[ + ] NEW REQUEST','Gewünschter Tarif':'Requested plan','Freigabe erfolgt manuell durch das Team. Keine automatische Zahlung.':'The team approves access manually. There is no automatic payment.',
'Deine Nachricht':'Your message','Bis zu fünf Anfragen innerhalb von 24 Stunden. Bitte sende keine Passwörter.':'Up to five requests in 24 hours. Never send passwords.',
'Eröffne während der Beta eine Tarif-Anfrage. Das Team gibt sie manuell frei.':'Request a plan during beta testing. The team will approve it manually.',
'Wo sehe ich die Antwort?':'Where can I see the reply?','Hier in deinem Posteingang. Lade die App bei Bedarf neu.':'In your inbox here. Reload the app if necessary.',
'Wähle Fehler melden und beschreibe Gerät und Schritte.':'Choose Report a bug and describe your device and the steps to reproduce it.',
'[ ◷ ] DEIN POSTEINGANG':'[ ◷ ] YOUR INBOX','Deine Anfragen':'Your requests','Noch keine Anfragen. Deine Antwort erscheint später hier.':'No requests yet. Your replies will appear here.',
'eine Discord-DM oder eröffne ein':'a Discord DM or open a','auf dem LiveryLab-Server. Erwähne dort':'on the LiveryLab server. Mention',
'und teile mit, warum du Zugang möchtest. Wir schalten Testmitglieder manuell frei.':'and tell us why you want access. We approve test members manually.',
'In der App anfragen →':'Request in app →','BETA · nur auf Anfrage':'BETA · by request only','✓ Dein aktueller Tarif':'✓ Your current plan',
'[ % ] GUTSCHEIN':'[ % ] VOUCHER','Code einlösen':'Redeem code','Rabatt erhalten oder eine kostenlose Plus-/Pro-Mitgliedschaft freischalten.':'Get a discount or unlock a free Plus/Pro membership.',
'Dein Gutscheincode':'Your voucher code','Einlösen →':'Redeem →','✓ Dein reservierter Rabatt:':'✓ Your reserved discount:',
'Für Zahlung und Aktivierung den LiveryLab-Support kontaktieren.':'Contact LiveryLab support for payment and activation.',
'Kursprüfungen.':'Course exams.','DEINE KURSE':'YOUR COURSES','Hier sind gerade keine passenden Prüfungen.':'There are no matching exams right now.',
'Dein Lernpfad ist noch nicht vollständig.':'You have not completed this learning path yet.','Keine Prüfungsfragen hinterlegt.':'No exam questions have been added.',
'Deine Auswertung':'Your results','[ ++ ] DEIN PROJEKT':'[ ++ ] YOUR PROJECT',
'Ein FiveM-Lernprojekt, das mit deinen Lektionen wächst. Abgeschlossene Abschnitte schalten passende Codebeispiele frei.':'A FiveM learning project that grows with your lessons. Completing sections unlocks matching code examples.',
'ERKLÄRUNG':'EXPLANATION','Versuche einen anderen Suchbegriff oder eine andere Kategorie.':'Try another search term or category.',
'Programmiersprache auswählen':'Choose programming language',
'[ ✦ ] DEIN ÖFFENTLICHES AKADEMIE-PROFIL':'[ ✦ ] YOUR PUBLIC ACADEMY PROFILE',
'Wähle dein Banner, dein Avatar-Design, deinen Namen-Stil und deine freigeschalteten Titel.':'Choose your banner, avatar design, name style, and unlocked titles.',
'Über mich · Bio (max. 260 Zeichen)':'About me · Bio (max. 260 characters)',
'Profilbild hochladen oder Avatar-Farbe wählen':'Upload profile picture or choose avatar color',
'Banner-Bild und Hintergrund':'Banner image and background',
'Erfolgstitel auswählen':'Choose achievement title','Fortschritt für Freunde sichtbar':'Show progress to friends',
'Bestätigte Freunde sehen nur Lektionen und bestandene Prüfungen, niemals E-Mail oder Passwort.':'Confirmed friends see only lessons and passed exams, never your email or password.',
'Änderungen speichern ✓':'Save changes ✓','Bestandene Prüfungen':'Exams passed',
'[ ♡ ] BESTÄTIGTE FREUNDE':'[ ♡ ] CONFIRMED FRIENDS',
'Nur bestätigte Freunde erscheinen hier. Sie bestimmen selbst, ob du ihren Fortschritt sehen darfst.':'Only confirmed friends appear here. They decide whether to share their progress with you.',
'Freund entfernen':'Remove friend',
'Du kannst Freunde per Benutzername suchen und ihnen eine Anfrage senden.':'Search for friends by username and send them a request.',
'Freund hinzufügen →':'Add friend →','[ ! ] DEINE ANFRAGEN':'[ ! ] YOUR REQUESTS',
'Hier kannst du Anfragen annehmen, ablehnen oder zurückziehen.':'Accept, decline, or withdraw requests here.','Anfrage zurückziehen':'Withdraw request',
'Suche nach dem exakten Benutzernamen. Private Angaben wie die E-Mail-Adresse werden nicht gezeigt.':'Search for the exact username. Private details like email addresses are not displayed.',
'Neue Anfragen':'New requests',
'Jeder Titel wird durch echte Lektionen, Kursprüfungen, Freunde oder Login-Streaks freigeschaltet.':'Each title is unlocked through lessons, course exams, friends, or login streaks.',
'App-Design ändern →':'Change app appearance →','[ ✦ ] DEIN PROFILTITEL':'[ ✦ ] YOUR PROFILE TITLE',
'Dein Lernfortschritt':'Your learning progress','Farben & Hintergrund':'Colors & background',
'02 · DEIN ACCOUNT':'02 · YOUR ACCOUNT','Anmeldung mit deiner E-Mail-Adresse oder deinem Benutzernamen möglich.':'Sign in with either your email address or username.',
'Öffentlicher Anzeigename':'Public display name','Verwende mindestens 14 Zeichen und ein einzigartiges Passwort.':'Use at least 14 characters and a unique password.',
'Verbinde eine Authenticator-App. Bei der nächsten Anmeldung musst du dann einen sechsstelligen Code eingeben.':'Connect an authenticator app. On your next sign-in, you must enter a six-digit code.',
'Fortschritt zurücksetzen':'Reset progress','Setzt Lektionen und lokale Prüfungsanzeigen zurück. Auf dem Server vergebene Erfolge bleiben bestehen.':'Resets lessons and local exam status. Server-side achievements stay unlocked.',
'Support und Abmeldung':'Support and sign out','Beendet die aktuelle Sitzung auf diesem Gerät.':'Ends your current session on this device.',
'Schreibe NyxAtheris eine DM oder öffne ein Ticket und erwähne @nyxatheris.':'DM NyxAtheris or open a ticket and mention @nyxatheris.',
'Über die Academy':'About the Academy','Developer-Lernplattform mit Kursen, sicheren Accounts, Profilen, Freunden und Erfolgen. Version 28.':'Developer learning platform with courses, secure accounts, profiles, friends, and achievements.',
'Erstelle eigene oder automatisch generierte Codes. Löschen und Ablaufen werden serverseitig durchgesetzt.':'Create custom or automatically generated codes. Deletion and expiration are enforced server-side.',
'[ + ] NEU ERSTELLEN':'[ + ] CREATE NEW','Neuer Gutschein':'New voucher','Code erstellen':'Create code','Dein Wunschcode':'Your custom code',
'3–64 Zeichen, Buchstaben, Zahlen und Bindestriche. Groß-/Kleinschreibung ist egal.':'3–64 characters: letters, numbers, and hyphens. Case does not matter.',
'Mitgliedschaft für':'Membership for','Maximale Einlösungen':'Maximum redemptions','Code gültig für':'Code valid for','Gutschein sicher erstellen →':'Create voucher securely →',
'Deine Gutscheine':'Your vouchers','Erstelle oben einen neuen Code. Abgelaufene und gelöschte Gutscheine verschwinden automatisch aus der Liste.':'Create a new code above. Expired and deleted vouchers disappear from the list automatically.',
'ADMIN · SUPPORT & BETA':'ADMIN · SUPPORT & BETA','Support-Posteingang':'Support inbox','Beantworte Meldungen und genehmige angefragte Testzugänge.':'Reply to reports and approve requests for beta access.',
'Für alle Besucher auf Plus und Ultimate sichtbar. 0 % beendet die Aktion.':'Visible to all visitors on Plus and Ultimate. Setting 0% ends the promotion.',
'Wenn ausgeschaltet, verschwinden Beta- und Tarif-Anfragen aus der App. Bestehende Anfragen bleiben im Posteingang.':'When switched off, beta and plan requests disappear from the app. Existing requests remain in the inbox.',
'Eingang bestätigen':'Confirm receipt','Nur für Administratoren.':'Administrators only.',
'[ ! ] ANTRÄGE':'[ ! ] REQUESTS','Nur du kannst neue Konten genehmigen. Ohne deine Bestätigung bleiben die Kurse gesperrt.':'Only you can approve new accounts. Courses remain locked until your approval.',
'Neue Registrierungen werden hier angezeigt.':'New registrations are shown here.',
'Wähle Plus oder Ultimate, um eine 30-tägige Mitgliedschaft zu vergeben.':'Choose Plus or Ultimate to grant a 30-day membership.',
'Passwort zurücksetzen':'Reset password','Deine Teamkonten':'Your team accounts',
'Tarifänderungen werden über den geschützten Administrationsserver gespeichert. Administratoren haben immer Vollzugriff.':'Plan changes are saved through the protected admin server. Administrators always have full access.',
'Nächste →':'Next →','+ Manuell ein Teamkonto erstellen':'+ Create a team account manually',
'Optional: Erstelle selbst ein Konto. Teamkonten werden direkt freigegeben und müssen ihr vorläufiges Passwort ändern.':'Optionally create an account yourself. Team accounts are approved immediately and must change their temporary password.',
'Mit E-Mail-Adresse':'Using email','Teamkonto mit E-Mail erstellen →':'Create team account with email →',
'Mit Benutzername':'Using username','Benutzerkonto erstellen →':'Create username account →',
'Kein freigegebenes Profil mit diesem Namen gefunden.':'No approved profile found with this name.',
'Gutschein erstellt:':'Voucher created:',
'Verbindung nicht verfügbar':'Connection unavailable',
'Supabase konnte nicht geladen werden. Bitte lade die Seite erneut oder überprüfe deine Verbindung.':'Supabase could not load. Reload the page or check your internet connection.'
});

Object.assign(translations,{
'Erstelle dein Konto. Nach der Freigabe durch NyxAtheris erhältst du Zugang. Mitgliedschaften kannst du nach der Anmeldung direkt in der App anfragen.':'Create your account. After approval by NyxAtheris, you will gain access. You can request memberships in the app after signing in.',
'Dein Passwort wird sicher über Supabase Auth verarbeitet. Deine Anmeldung wird vom Team geprüft; ohne Genehmigung erhältst du keinen Zugriff.':'Your password is processed securely through Supabase Auth. The team reviews your registration; without approval you cannot access the Academy.',
'Deine':'Your',
'Für dieses Spezialthema gibt es noch keinen einzeln geprüften Videoguide. Öffne eine gezielte Suche, wähle ein Tutorial und arbeite das passende Thema durch.':'There is no individually reviewed video guide for this advanced topic yet. Open a targeted search, choose a tutorial, and work through the relevant material.',
'Rabattcodes sind Angebote, kein automatischer Kauf. Kostenpflichtige Mitgliedschaften werden derzeit vom Team nach Bestätigung aktiviert.':'Discount codes are offers, not automatic purchases. Paid memberships are currently activated manually by the team after confirmation.',
'Dein':'Your',
'Deine Developer':'Your developers',
'[ ✦ ] DEINE BELOHNUNGEN':'[ ✦ ] YOUR REWARDS',
'Academy nicht erreichbar':'Academy unavailable'
});

Object.assign(translations,{
'Schreibe die erste Zeile selbst ab, überlege wofür jeder Ausdruck steht und erweitere den Code um eine eigene Variante.':'Type the first line yourself, think about what each expression means, and extend the code with your own variation.',
'Sieh dir im Beispiel die API und deren Parameter an. Schreibe sie in eigener Form nach.':'Look at the API and its parameters in the example. Recreate it in your own way.',
'Starte mit wenigen Objekten und orientiere dich am Schwerpunkt des Kapitels.':'Start with a few objects and focus on the main idea of this chapter.',
'Beginne mit dem ersten Wert und verfolge ihn bis zur Ausgabe. Vergleiche die Schreibweise mit dem Beispiel.':'Start with the first value and trace it all the way to the output. Compare the syntax with the example.',
'Bearbeite nur einen Parameter auf einmal und teste, welche Änderung das Ergebnis tatsächlich verbessert.':'Change one parameter at a time and test which change actually improves the result.',
'Beginne mit der kleinsten funktionierenden Version und ergänze Tests.':'Start with the smallest working version and add tests.',
'Arbeite zuerst das Beispiel durch. Ändere danach immer nur einen Wert und beobachte, was passiert.':'Work through the example first. Then change only one value at a time and observe what happens.',
'Skizziere zunächst Datenfluss, Eingaben, Ergebnis und einen Fehlerfall.':'First sketch the data flow, inputs, result, and an error case.',
'Event registrieren, source sichern und auf ungültigen src prüfen.':'Register the event, save the source value, and check for an invalid src.',
'In Python ist kein local/let nötig: name = "Alex" legt bereits eine Variable an.':'Python does not require local or let: name = "Alex" already creates a variable.',
'Orbit dreht die Ansicht, Pan verschiebt sie, Zoom ändert den Abstand. Die Objekte selbst bleiben dabei unverändert.':'Orbit rotates the view, pan moves it, and zoom changes the viewing distance. The objects themselves remain unchanged.',
'Erzeuge zuerst den Blip und übergib den Rückgabewert an SetBlipSprite.':'Create the blip first and pass its return value to SetBlipSprite.',
'Starte mit if level >= 10 then. Das letzte Wort lautet end.':'Start with if level >= 10 then. Close the block with end.',
'Setze DoesEntityExist(ped) in eine if-Bedingung.':'Place DoesEntityExist(ped) inside an if condition.',
'Eine Liste nutzt [ ... ]; mit for element in liste: bearbeitest du jedes Element. Achte auf die Einrückung.':'A list uses [ ... ]; for element in liste: processes each element. Pay attention to indentation.',
'Funktion mit Parameter liste, darin eine for-Schleife mit ipairs(liste).':'Create a function with a liste parameter and a for loop using ipairs(liste).',
'Nutze je eine Zeile: shared_script, client_script und server_script.':'Use one line each for shared_script, client_script, and server_script.',
'Suche die Objektliste rechts oben: Das ist der Outliner. Im großen mittleren Bereich, dem 3D Viewport, bearbeitest du deine Szene.':'Find the object list at the upper right: that is the Outliner. Edit your scene in the large central 3D Viewport.',
'JavaScript schreibt mit console.log(wert) ins Terminal. Für veränderbare Werte verwendest du let.':'JavaScript prints to the terminal with console.log(wert). Use let for values that need to change.',
'Eine Python-Bedingung endet mit einem Doppelpunkt. Die Anweisung darunter muss eingerückt sein.':'A Python condition ends with a colon. The statement below must be indented.',
'Ein anonymer Callback beginnt mit function(parameter) und endet mit end.':'An anonymous callback starts with function(parameter) and ends with end.',
'const kann nach der Deklaration nicht neu zugewiesen werden. typeof variable zeigt den Datentyp.':'A const cannot be reassigned after declaration. typeof variable shows the data type.',
'Ein Kommentar in Lua beginnt mit -- und wird beim Ausführen ignoriert. Der print-Befehl muss darunter separat stehen.':'A Lua comment starts with -- and is ignored during execution. The print command must be on a separate line below.',
'== prüft Gleichheit, ~= Ungleichheit; ein einzelnes = weist einen Wert zu, vergleicht aber nicht.':'== checks equality, ~= checks inequality; a single = assigns a value rather than comparing.',
'Dein erster Schritt: print("Dein Name") zeigt Text an. Für die Aufgabe brauchst du zwei einzelne print-Aufrufe.':'Your first step: print("Your name") displays text. This exercise requires two separate print calls.',
'Beginne mit local spielerName = "Alex". Beachte: Namen mit Anführungszeichen sind Text, Zahlen ohne Anführungszeichen sind number.':'Start with local spielerName = "Alex". Remember: quoted values are strings, while unquoted numbers are numbers.',
'Zuerst AddEventHandler, dann TriggerEvent mit demselben Namen.':'First use AddEventHandler, then TriggerEvent with the same name.',
'Schreibe jeweils -- davor, denn das sind Shell-/FXServer-Kommandos, kein normaler Lua-Code.':'Prefix each one with -- because these are shell/FXServer commands, not ordinary Lua code.',
'Lua verbindet Strings mit zwei Punkten: "Hallo " .. name. Ein einzelner Punkt reicht nicht aus.':'Lua concatenates strings using two dots: "Hello " .. name. A single dot is not enough.',
'Speichere zunächst die .blend-Datei. Export ist eine zusätzliche Datei, die die bearbeitbare Blender-Originaldatei nicht ersetzen sollte.':'Save the .blend file first. An export is an additional file and should not replace the editable Blender source.',
'source am Anfang der Event-Funktion kopieren.':'Copy source at the beginning of the event function.',
'tonumber("50") liefert die Zahl 50. Erst danach kannst du zuverlässig 10 addieren.':'tonumber("50") produces the number 50. Only then can you safely add 10.',
'Vergiss nicht, i innerhalb der while-Schleife zu erhöhen.':'Do not forget to increment i inside the while loop.',
'Die Tasten G, R und S stehen für Grab (verschieben), Rotate (drehen) und Scale (skalieren).':'G, R, and S mean Grab (move), Rotate, and Scale.',
'Funktionsdefinition: local function sagHallo() ... end. Danach: sagHallo().':'Function definition: local function sagHallo() ... end. Then call sagHallo().',
'Ein Modul kann eine Tabelle mit Funktionen zurückgeben: return Utils.':'A module can return a table of functions: return Utils.',
'array.map(x => ...) erstellt ein neues Array aus den umgewandelten Elementen des ursprünglichen Arrays.':'array.map(x => ...) creates a new array by transforming elements of the original array.',
'Die Variablenwerte bestimmen den Datentyp: 500 → number, true → boolean, "LiveryLab" → string. type(variable) verrät ihn.':'Variable values determine their types: 500 → number, true → boolean, "LiveryLab" → string. type(variable) reveals the type.',
'Eine JavaScript-Bedingung steht in runden Klammern: if (preis > 100) { ... }.':'A JavaScript condition uses parentheses: if (preis > 100) { ... }.',
'Python gibt mit print("Text") eine Textzeile aus. Denk an beide Anführungszeichen und die schließende Klammer.':'Python prints a line of text with print("Text"). Remember both quotation marks and the closing parenthesis.',
'Jede innere Tabelle benötigt wieder ein eigenes { ... }.':'Every nested table requires its own pair of { ... } braces.',
'Die Syntax lautet for i = 2, 10, 2 do.':'The syntax is for i = 2, 10, 2 do.',
'Die Variable muss innerhalb der Funktion mit local angelegt werden.':'Declare the variable with local inside the function.',
'Die drei Schlüssel sind fx_version, game und client_script.':'The three keys are fx_version, game, and client_script.',
'Im Funktionskörper: return preis * 1.19.':'Inside the function: return preis * 1.19.',
'Zwei Vergleiche und dazwischen or verwenden.':'Use two comparisons connected with or.',
'Starte mit zwei Zahlenvariablen und prüfe die Reihenfolge deiner Operatoren (+, -, *, /).':'Start with two numeric variables and check the order of operators (+, -, *, /).',
'Initialisiere result mit 0, durchlaufe liste und addiere jeden Wert.':'Initialize result to 0, iterate over liste, and add each value.',
'Das erste Element heißt garage[1], die Listenlänge #garage.':'The first element is garage[1]; the list length is #garage.',
'Mit Tab wechselst du zwischen Object Mode und Edit Mode. Nur im Edit Mode bearbeitest du einzelne Vertices, Kanten oder Flächen.':'Press Tab to switch between Object Mode and Edit Mode. Only Edit Mode allows editing individual vertices, edges, and faces.',
'Prüfe preis > 0 and geld >= preis, danach Subtraktion.':'Check preis > 0 and geld >= preis, then perform the subtraction.',
'Im Outliner verwaltest du Namen und Collections. Eine Collection fasst zusammengehörige Objekte zusammen.':'Use the Outliner to manage names and collections. A collection groups related objects.'
});

Object.assign(translations,{
'Der Client kann alle geheimen Serverwerte sicher speichern.':'The client can safely store every secret server value.',
'Code muss grundsätzlich ohne Tests und Prüfung übernommen werden.':'Code should always be copied without any tests or verification.',
'Für diesen Arbeitsschritt müssen Topologie, Maßstab und Export grundsätzlich nicht geprüft werden.':'There is no need to check topology, scale, or export for this step.',
'Das Ergebnis ist automatisch korrekt, sobald es im Viewport gut aussieht.':'The result must be correct as soon as it looks good in the viewport.',
'Code braucht nie Tests.':'Code never needs tests.',
'Ich kann es implementieren und korrekte sowie ungültige Eingaben testen.':'I can implement it and test both valid and invalid inputs.',
'Client-Daten sind automatisch sicher.':'Client data is automatically secure.',
'Eingaben und Fehlerfälle prüfen, bevor Daten verarbeitet werden.':'Validate inputs and error cases before processing data.',
'Ich vertraue allein der Anzeige im Browser.':'I trust only what the browser displays.',
'Der Code sieht lang genug aus.':'The code looks long enough.',
'Möglichst viel Code oder maximal lauten Sound.':'As much code or as loud a sound as possible.',
'Eigenes funktionierendes Ergebnis mit Tests und begründeten Verbesserungen.':'A working solution of my own, with tests and justified improvements.',
'Ein kopiertes Tutorial ohne Anpassung.':'A copied tutorial with no modifications.',
'Immer nur ein Bild':'Always just one image',
'Tests und nachvollziehbare Anleitung':'Tests and clear documentation',
'Um ein Passwort zu erraten':'To guess a password',
'Sie machen wiederholbare Logik übersichtlich':'They make repeated logic easier to understand',
'Sie verhindern jegliche Fehler automatisch':'They automatically prevent every error',
'Nur zum Zeichnen':'Only for drawing',
'Um mehrere zusammengehörige Werte zu halten':'To hold several related values',
'Zum Installieren des Betriebssystems':'To install the operating system',
'Einen Wert für spätere Verwendung':'Store a value for later use',
'Keine Fehlerbehandlung':'No error handling',
'Sie speichert alle Dateien':'It stores all files',
'Zum Verschlüsseln aller Daten':'To encrypt all data',
'Eine Internetverbindung':'An internet connection',
'Zum Prüfen von Ausführung und Werten':'To check execution and values',
'Sie startet automatisch eine Datenbank':'It automatically starts a database',
'Geheime Schlüssel im öffentlichen Code':'Secret keys in public code',
'Sie wählt anhand eines Ausdrucks einen Codepfad':'It selects a code path based on an expression',
'Sie ersetzen alle Datentypen':'They replace all data types',
'Nur der Client':'Only the client',
'Nein':'No','Ja':'Yes',
'In der Konsole':'In the console',
'In einer SQL-Tabelle':'In an SQL table',
'Automatisch im Spielchat':'Automatically in the game chat',
'Ein UI laden':'Load a UI',
'Einen Wert speichern':'Store a value',
'Alle Variablen global machen':'Make all variables global',
'Vorgang sicher abbrechen':'Abort the operation safely',
'100-mal pro Sekunde':'100 times per second',
'Weil Variablen nicht überall veränderbar sind':'Because variables cannot be modified everywhere',
'Eine neue Datei':'A new file','Nur eine SQL-Tabelle':'Only an SQL table',
'Vergleicht zwei Werte':'Compares two values',
'Kanten abrunden':'Round corners',
'Nur bessere Fonts':'Just better fonts',
'Browser öffnen':'Open the browser',
'JSON ist ein Textformat für Daten.':'JSON is a text format for data.',
'Migrationen dokumentieren Schemaänderungen reproduzierbar.':'Migrations document schema changes reproducibly.',
'const schützt eine Variablenbindung vor Neuzuweisung.':'const prevents reassigning a variable binding.',
'Dictionaries speichern benannte Eigenschaften, etwa ID, Name und Kontostand.':'Dictionaries store named properties such as ID, name, and account balance.',
'display:flex legt Elemente entlang einer Achse an.':'display:flex arranges elements along one axis.',
'Grid eignet sich für zweidimensionale Kartenraster.':'Grid works well for two-dimensional card layouts.',
'Es erscheint in der Konsole':'It appears in the console'
});

Object.assign(translations,{
 'HILFE & FEEDBACK':'HELP & FEEDBACK',
 'NEUE ANFRAGE':'NEW REQUEST',
 'Schreib dem Team':'Contact the team',
 'Worum geht es?':'What do you need help with?',
 'Allgemeine Hilfe':'General support',
 'Allgemeine Frage':'General question',
 'Fehler melden':'Report a bug',
 'Fehlerbericht':'Bug report',
 'Beta-Feedback':'Beta feedback',
 'Plus / Ultimate anfragen':'Request Plus / Ultimate',
 'Gewünschter Tarif':'Requested plan',
 'Deine Nachricht':'Your message',
 'Anfrage senden →':'Send request →',
 'Wird gesendet …':'Sending…',
 'Deine Nachricht wird gespeichert …':'Saving your message…',
 'Deine Nachricht wird im Support-Posteingang gespeichert.':'Your request is saved in the Academy support inbox.',
 'Support-Posteingang konnte nicht geladen werden.':'Could not load the support inbox.',
 'Schnelle Hilfe':'Quick help',
 'DEIN POSTEINGANG':'YOUR INBOX',
 'Deine Anfragen':'Your requests',
 'Anfragen suchen …':'Search requests…',
 'Alle Status':'All statuses',
 'Offen':'Open',
 'Beantwortet':'Answered',
 'Genehmigt':'Approved',
 'Geschlossen':'Closed',
 'Noch keine Anfragen. Deine Antwort erscheint später hier.':'No requests yet. Your reply will appear here.',
 'Bis zu fünf Anfragen innerhalb von 24 Stunden. Bitte sende keine Passwörter.':'Up to five requests in 24 hours. Never send passwords.',
 'Freigabe erfolgt manuell durch das Team. Keine automatische Zahlung.':'Access is approved manually by the team. No automatic payment.',
 'Anfrage erfolgreich gespeichert':'Request saved successfully',
 'Versand nicht bestätigt':'Send not confirmed',
 'Anfrage nicht bestätigt':'Request not confirmed',
 'Welche praktische Aufgabe gehört zu dieser Lektion?':'Which practical task belongs to this lesson?',
 'Welche Aussage ist richtig?':'Which statement is correct?',
 'Fachwissen':'Core knowledge',
 'Praxis':'Practice',
 'Tipp und Fehlersuche':'Hints and debugging',
 'DE':'DE',
 'EN':'EN'
});
Object.assign(translations,{
 'Interaktionen & Atmosphäre':'Interactions & ambience',
 'Animierter Hintergrund':'Animated background',
 'Sanfte, langsam bewegte Lichtakzente im Hintergrund.':'Subtle, slowly moving light accents in the background.',
 'Klickeffekte':'Click effects',
 'Kleine Lichtkreise beim Drücken von Buttons anzeigen.':'Show small light ripples when you tap buttons.',
 'Klicksounds':'Click sounds',
 'Leise Rückmeldung bei Button-Klicks. Standardmäßig ausgeschaltet.':'Quiet feedback when tapping buttons. Disabled by default.',
 'Lautstärke der Klicksounds':'Click sound volume',
 'Sounds spielen erst nach dem Aktivieren und deiner nächsten Berührung. Die Auswahl wird auf diesem Gerät gespeichert.':'Sounds play after you enable them and tap again. Your choice is saved on this device.'
});
Object.assign(translations,{
 'Support & Chat':'Support & chat',
 'Mitglieder':'Members',
 'Gutscheine':'Coupons',
 'Übersicht':'Overview',
 'Support & Nachrichten':'Support & messages',
 'Mitgliederverwaltung':'Member management',
 'Gutscheine & Shop':'Coupons & shop',
 'Alle Anfragen und Gespräche mit Mitgliedern':'All requests and conversations with members',
 'Nutzer, Tarife, Rollen und Anträge':'Accounts, plans, roles and requests',
 'Gutscheincodes und Shopaktionen':'Coupon codes and shop promotions',
 'Alle wichtigen Verwaltungsbereiche übersichtlich getrennt.':'All important administration sections in one organized place.',
 'Support, Mitglieder und Gutscheine übersichtlich getrennt verwalten.':'Manage support, members and coupons in separate sections.',
 'Registrierungen':'Registrations',
 'Offene Tickets':'Open tickets',
 'Aktive Konten':'Active accounts',
 'Administratoren':'Administrators',
 'Details ansehen ⌄':'View details ⌄',
 'Gespräch öffnen →':'Open conversation →',
 'Gespräch aktualisieren':'Refresh conversation',
 'Chat öffnen →':'Open chat →',
 'ADMIN · SUPPORT':'ADMIN · SUPPORT',
 'SUPPORT · GESPRÄCH':'SUPPORT · CONVERSATION',
 'Support-Posteingang':'Support inbox',
 'Alle Anfragen an einem Ort. Wähle ein Ticket aus und schreibe mit dem Mitglied.':'All requests in one place. Select a ticket to message the member.',
 'Neue Tickets erscheinen hier automatisch.':'New tickets appear here automatically.',
 'Noch keine Supportanfragen. Neue Tickets erscheinen hier automatisch.':'No support requests yet. New tickets will appear here automatically.',
 'Nachrichten werden geladen …':'Loading messages…',
 'Noch keine Nachrichten.':'No messages yet.',
 'Deine Unterhaltung':'Your conversation',
 'Mitglied':'Member',
 'LiveryLab Team':'LiveryLab Team',
 'Schließen ×':'Close ×',
 'Nachricht an das Mitglied':'Message to member',
 'Nachricht an das Team':'Message the team',
 'Nachricht senden →':'Send message →',
 'Nachricht schreiben':'Write a message',
 'Deine Nachricht …':'Your message…',
 'Im Supportticket gespeichert.':'Saved in your support ticket.',
 'Nachricht gesendet und im Ticket gespeichert.':'Message sent and saved to the ticket.',
 'Wird gesendet …':'Sending…',
 'Status speichern':'Save status',
 'Laufzeit (Tage)':'Duration (days)',
 'Status':'Status',
 'Beantwortet':'Answered',
 'Ablehnen':'Reject',
 'Mitgliedschaft freigeben':'Approve membership',
 'Allgemeiner Shoprabatt':'General shop discount',
 'Für Plus und Ultimate. 0 % beendet die Aktion.':'For Plus and Ultimate. 0% ends the promotion.',
 'Deine Teamkonten':'Your member accounts',
 'Die Nachricht konnte nicht geladen werden.':'Unable to load the message.',
 'Der Nachrichtenverlauf konnte nicht geladen werden.':'The message history could not be loaded.',
 'Nachrichtenverlauf konnte nicht geladen werden.':'Could not load the conversation.',
 'Chat konnte nicht geöffnet werden':'Could not open the chat'
});
const patterns=[
 [/^Welche praktische Aufgabe gehört zu „(.+)“\?$/i,(_,topic)=>'Which practical task is part of “'+translate(topic)+'”?'],
 [/^Welcher Tipp hilft dir bei „(.+)“\?$/i,(_,topic)=>'Which hint helps you with “'+translate(topic)+'”?'],
 [/^Bei „(.+)“ nur die Überschrift lesen und keine Aufgabe bearbeiten\.$/i,(_,topic)=>'Only read the heading for “'+translate(topic)+'” without doing the exercise.'],
 [/^Bei „(.+)“ die Übung überspringen und ohne eigenes Beispiel weitermachen\.$/i,(_,topic)=>'Skip the “'+translate(topic)+'” exercise and continue without your own example.'],
 [/^Bei „(.+)“ Fehlermeldungen ignorieren und nichts kontrollieren\.$/i,(_,topic)=>'Ignore error messages during “'+translate(topic)+'” and do not check your result.'],
 [/^Bei „(.+)“ wahllos alles verändern, ohne das Ergebnis zu prüfen\.$/i,(_,topic)=>'Change everything randomly during “'+translate(topic)+'” without checking the outcome.'],
 [/^Deine Aufgabe lautet: (.+)$/i,(_,task)=>'Your task is: '+translate(task)],
 [/^Beachte: (.+)$/i,(_,hint)=>'Remember: '+translate(hint)],
 [/^✓ Anfrage gespeichert · Ticket ([a-f0-9-]+)$/i,(_,id)=>'✓ Request saved · Ticket '+id],
 [/^Anfrage erfolgreich gespeichert · Ticket ([a-f0-9-]+)$/i,(_,id)=>'Request saved successfully · Ticket '+id],
 [/^Anfrage nicht bestätigt: (.+)$/i,(_,message)=>'Request not confirmed: '+translate(message)],

 [/^Du kannst (.+) praktisch vorführen und fachlich erklären\.$/i,(_,topic)=>'You can demonstrate “'+translate(topic)+'” in practice and explain it clearly.'],
 [/^Welche Aussage zu „(.+)“ ist fachlich richtig\?$/i,(_,topic)=>'Which statement about “'+translate(topic)+'” is technically correct?'],
 [/^Baue das Beispiel „(.+)“ ohne Kopieren nach\. Ändere anschließend mindestens einen Wert oder Parameter und erkläre den Unterschied\.$/i,(_,topic)=>'Recreate the “'+translate(topic)+'” example without copying it. Then change at least one value or parameter and explain the difference.'],
 [/^Passe den Beispielcode an\. Lies die Dokumentation unter (https:\/\/\S+)$/i,(_,url)=>'Adapt the example code. Read the documentation at '+url],
 [/^Schreibe einen Kommentar, der erklärt, warum du (.+)$/i,(_,tail)=>'Write a comment that explains why you '+translate(tail)],
 [/^Wähle (.+) und (.+)$/i,(_,a,b)=>'Choose '+translate(a)+' and '+translate(b)],

 [/^Frage (\d+) von (\d+)$/i,(_,a,b)=>'Question '+a+' of '+b],
 [/^LERNTEIL (\d+) VON (\d+)$/i,(_,a,b)=>'PART '+a+' OF '+b],
 [/^(\d+) von (\d+) freigeschaltet$/i,(_,a,b)=>a+' of '+b+' unlocked'],
 [/^(\d+) Tage$/i,(_,n)=>n+' days'],
 [/^(\d+) Tag$/i,(_,n)=>n+' day'],
 [/^(\d+) Minuten$/i,(_,n)=>n+' minutes'],
 [/^(\d+) Min$/i,(_,n)=>n+' min'],
 [/^(\d+) Stunden$/i,(_,n)=>n+' hours'],
 [/^(\d+) Std\.?$/i,(_,n)=>n+' hr'],
 [/^🔥 (\d+) Tage$/i,(_,n)=>'🔥 '+n+' days'],
 [/^(\d+) Lektionen$/i,(_,n)=>n+' lessons'],
 [/^(\d+) Fragen$/i,(_,n)=>n+' questions'],
 [/^Alle (\d+) XP-Gutschriften anzeigen$/i,(_,n)=>'Show all '+n+' XP rewards'],
 [/^Freigeschaltet bis (.+)$/i,(_,date)=>'Unlocked until '+date],
 [/^Endet am (.+)$/i,(_,date)=>'Expires on '+date],
 [/^Frage (\d+)(?: \/| von )(\d+)$/i,(_,a,b)=>'Question '+a+' of '+b],
 [/^Du lernst jetzt „(.+)“. Ziel: (.+)$/i,(_,topic,goal)=>'You are learning “'+translate(topic)+'”. Goal: '+translate(goal)],
 [/^Lies die Erklärung in Ruhe und überlege, wie das Beispiel funktioniert\..*$/i,()=> 'Read the explanation carefully and consider how the example works. First identify the input, value, or operation that determines the result.'],
 [/^Schau dir das Beispiel an und sage vorher, was du als Ergebnis erwartest\..*$/i,()=> 'Study the example and predict its result. Then change one value or action and compare what happens.'],
 [/^Jetzt wendest du das Gelernte an\. Deine Aufgabe: (.+)$/i,(_,task)=>'Now apply what you have learned. Your task: '+translate(task)],
 [/^Arbeite in kleinen Schritten und kontrolliere nach jeder Änderung.*$/i,()=> 'Work in small steps. After each change, check whether the intermediate result matches your learning goal.'],
 [/^Falls du nicht weiterkommst: (.+)$/i,(_,hint)=>'If you get stuck: '+translate(hint)],
 [/^Typischer Fehler, auf den du achten solltest: (.+)$/i,(_,mistake)=>'Common mistake to watch out for: '+translate(mistake)],
 [/^Wenn die Grundaufgabe klappt, probiere diese eigene Variante: (.+)$/i,(_,extra)=>'Once the basic task works, try this variation: '+translate(extra)],
 [/^Prüfe dein Ergebnis mit einem normalen und einem veränderten Fall.*$/i,()=> 'Test your result with a normal case and a modified case. Then answer the quiz questions.'],
 [/^Du verstehst das Thema „(.+)“ und kannst das Gelernte in einem kleinen, überprüfbaren Beispiel anwenden\.$/i,(_,topic)=>'You understand “'+translate(topic)+'” and can apply it in a small, testable example.'],
 [/^Du kannst (.+) erklären, anwenden und einen typischen Fehler dazu erkennen\.$/i,(_,topic)=>'You can explain and apply '+translate(topic)+' and recognize a common mistake.'],
 [/^Welche Aussage zu „(.+)“ ist richtig\?$/i,(_,topic)=>'Which statement about “'+translate(topic)+'” is correct?'],
 [/^Welche konkrete Aufgabe bearbeitest du in dieser Lektion\?$/i,()=> 'Which practical task are you working on in this lesson?'],
 [/^Welchen typischen Fehler solltest du bei „(.+)“ vermeiden\?$/i,(_,topic)=>'Which common mistake should you avoid when working on “'+translate(topic)+'”?'],
 [/^Welcher Hinweis hilft dir bei dieser Praxisaufgabe\?$/i,()=> 'Which hint helps with this practice task?']
];
const terms=[

['Erste Schritte und Ausgabe','First steps and output'],
['Fehler finden und Abschlussprojekt','Find errors and final project'],
['Funktionen und Parameter','Functions and parameters'],
['Listen und Sammlungen','Lists and collections'],
['Variablen und Datentypen','Variables and data types'],
['Bedingungen und Logik','Conditions and logic'],
['Variablen und Typen','Variables and types'],
['HTTP Methoden','HTTP methods'],
['JSON Strukturen','JSON structures'],
['API-Versionierung','API versioning'],
['Fehler und Rate Limits','Errors and rate limits'],
['Request-Validierung','Request validation'],
['Statuscodes','Status codes'],
['Dateien bearbeiten','Editing files'],
['Dateirechte','File permissions'],
['Deployment prüfen','Check deployment'],
['Skripte und Exit-Codes','Scripts and exit codes'],
['Suchen mit grep','Searching with grep'],
['Variablen und Quoting','Variables and quoting'],
['Animationsabschluss','Animation final project'],
['Kamera-Fahrten','Camera movements'],
['Keyframes und Timeline','Keyframes and timeline'],
['Material- und Lichtanimation','Material and lighting animation'],
['Objekthierarchien und Parenting','Object hierarchies and parenting'],
['Render als Bildsequenz','Render as an image sequence'],
['Asset-Dokumentation und Versionierung','Asset documentation and versioning'],
['Auto-Blockout und Fahrzeugproportionen','Vehicle blockout and proportions'],
['Exportformate und FiveM-Toolchain','Export formats and the FiveM toolchain'],
['Fahrzeugteile und Hierarchie','Vehicle parts and hierarchy'],
['Kollision und Boundaries','Collisions and boundaries'],
['LOD und Asset-Optimierung','LOD and asset optimization'],
['Modulare Straßen-Props','Modular street props'],
['Normals, Smoothing und harte Kanten','Normals, smoothing, and hard edges'],
['PBR-Karten verstehen','Understanding PBR maps'],
['Performance-Messung im Spiel','Measuring in-game performance'],
['Polygonbudget und Silhouette','Polygon budget and silhouette'],
['UV-Unwrapping und Seams','UV unwrapping and seams'],
['Blender installieren und Oberfläche verstehen','Install Blender and explore its interface'],
['Erstes 3D-Projekt und Export','First 3D project and export'],
['Kamera und Bildkomposition','Camera and image composition'],
['Licht, Kamera und eigener Render','Lighting, camera, and first render'],
['Low-Poly-Modelling und Modifier','Low-poly modeling and modifiers'],
['Materialfarben und Roughness','Material colors and roughness'],
['Objekte bewegen, rotieren, skalieren','Move, rotate, and scale objects'],
['Objektmodus und Edit Mode','Object mode and edit mode'],
['Orbit, Pan, Zoom und Perspektive','Orbit, pan, zoom, and perspective'],
['Outliner und Sammlungen','Outliner and collections'],
['Portfolio-Aufgabe: erstes Render','Portfolio exercise: first render'],
['Snapping und präzise Maße','Snapping and precise measurements'],
['Viewport, Objektmodus und Navigation','Viewport, object mode, and navigation'],
['Automatisierung mit Blender Python','Automating Blender with Python'],
['Geometry Nodes verstehen','Understanding geometry nodes'],
['Geometry Nodes: wiederverwendbare Instanzen','Geometry nodes: reusable instances'],
['Prozedurale Materialien','Procedural materials'],
['Rigging und Skinning','Rigging and skinning'],
['UV-Map und Export: typische Fehler finden','UV maps and export: identifying common mistakes'],
['Canvas und Koordinaten','Canvas and coordinates'],
['Game Loop und Zeit','Game loop and time'],
['Kollisionen prüfen','Checking collisions'],
['Pong programmieren','Programming Pong'],
['Snake programmieren','Programming Snake'],
['Touch-Steuerung','Touch controls'],
['Dein erstes eigenes Mini-Projekt','Your first mini project'],
['Deine Arbeitsumgebung','Your development environment'],
['Eigene Funktionen schreiben','Writing your own functions'],
['Entscheidungen mit if und else','Decisions with if and else'],
['Fehler suchen statt raten','Debugging instead of guessing'],
['Git und Versionen','Git and versions'],
['Listen und strukturierte Daten','Lists and structured data'],
['Sicherheit für Anfänger','Security for beginners'],
['Text, Zahlen und Wahrheitswerte','Text, numbers, and boolean values'],
['Variablen verstehen','Understanding variables'],
['Was ist Programmieren?','What is programming?'],
['Wiederholungen durch Schleifen','Repetition using loops'],
['Klassen und Methoden','Classes and methods'],
['Klassen und Objekte','Classes and objects'],
['Methoden','Methods'],
['Referenzen und const','References and const'],
['Asynchron mit Task','Asynchronous programming with Task'],
['Events und Delegates','Events and delegates'],
['Listen und LINQ','Lists and LINQ'],
['Serverseitige Events absichern','Securing server-side events'],
['Animationen','Animations'],
['Box-Modell','Box model'],
['Designsystem-Projekt','Design system project'],
['Selektoren und Farben','Selectors and colors'],
['Typografie und Lesbarkeit','Typography and readability'],
['Warum Container?','Why containers?'],
['Dateien und JSON','Files and JSON'],
['Umgebungen und Pakete','Environments and packages'],
['Datenklassen','Data classes'],
['Datenbanken und Tabellen','Databases and tables'],
['Datenbank','Database'],
['API und Datenmodell','API and data model'],
['Authentifizierung und Rollen','Authentication and roles'],
['Automatisierte Tests','Automated tests'],
['Datei-Upload absichern','Securing file uploads'],
['Performance und Offline','Performance and offline support'],
['Produktive Web-App liefern','Shipping a production web app'],
['Resource starten, stoppen, neu laden','Start, stop, and reload a resource'],
['Client-Server-Events','Client-server events'],
['Dein erster RegisterCommand','Your first RegisterCommand'],
['Entities und deren Lebenszyklus','Entities and their lifecycle'],
['Exports: APIs zwischen Resources','Exports: APIs between resources'],
['FiveM-Architektur & fxmanifest.lua','FiveM architecture & fxmanifest.lua'],
['FiveM-Mini-Projekt: sichere Aktion','FiveM mini project: secure action'],
['fxmanifest und Resource-Struktur','fxmanifest and resource structure'],
['Lokale Events nutzen','Using local events'],
['Nähe, Taste und Interaktion','Proximity, key press, and interaction'],
['Natives und Dokumentation lesen','Reading natives and documentation'],
['Performance und Wait-Zeiten','Performance and wait times'],
['Server-Events sicher prüfen','Validating server events safely'],
['vector3 und Reichweiten','vector3 and ranges'],
['ACE Berechtigungen','ACE permissions'],
['Architektur: UI, Client, Server','Architecture: UI, client, server'],
['Fehlerfälle und Tests','Failure cases and tests'],
['Kick sicher auslösen','Triggering kicks safely'],
['Spielerliste aus Serversnapshot','Player list from server snapshots'],
['Suchfunktion und Pagination','Search and pagination'],
['Umgebungsvariablen','Environment variables'],
['Ratenbegrenzung','Rate limiting'],
['Fehlerfälle','Failure cases'],
['Prüfungen','Exams'],
['Ein Adapter für QBCore & ESX','An adapter for QBCore & ESX'],
['Jobs und Rechte','Jobs and permissions'],
['Konten und serverseitiges Geld','Accounts and server-side money'],
['Server-Callbacks','Server callbacks'],
['Daten sicher prüfen','Validating data safely'],
['Fehler abfangen mit pcall','Catching errors with pcall'],
['Fehler kontrolliert behandeln','Handling errors safely'],
['Fehlerfälle testen','Testing error cases'],
['Frühzeitiger Rücksprung','Early return'],
['Eingaben begrenzen','Limiting inputs'],
['Einträge entfernen','Removing entries'],
['Einträge hinzufügen','Adding entries'],
['Event-Namen strukturieren','Structuring event names'],
['Grenzwerte prüfen','Checking boundary values'],
['Konfiguration auslagern','Extracting configuration'],
['Lokale Variablen','Local variables'],
['Lokaler Gültigkeitsbereich','Local scope'],
['Mehrere Bedingungen','Multiple conditions'],
['Migrationen planen','Planning migrations'],
['Module sinnvoll aufteilen','Organizing modules'],
['nil und sichere Defaultwerte','nil and safe defaults'],
['nil und Standardwerte','nil and default values'],
['Schlüssel mit pairs','Keys with pairs'],
['Scope: lokale und globale Werte','Scope: local and global values'],
['Serverseitige Transaktionen','Server-side transactions'],
['Sicherheitsreview','Security review'],
['String-Muster finden','Finding string patterns'],
['String-Teile lesen','Reading string segments'],
['Strings durchsuchen und verändern','Searching and modifying strings'],
['Strings sicher umwandeln','Converting strings safely'],
['Strings verbinden und formatieren','Joining and formatting strings'],
['Tabellen als Inventar','Using tables as inventory'],
['Tabellen verändern: insert und remove','Editing tables: insert and remove'],
['Tabellen: Das wichtigste Lua-Werkzeug','Tables: the essential Lua tool'],
['Tests automatisieren','Automating tests'],
['Text formatieren','Formatting text'],
['Variablen und Debugging','Variables and debugging'],
['Verschachtelte Daten','Nested data'],
['Zahlen sicher umwandeln','Converting numbers safely'],
['Listen mit ipairs durchlaufen','Iterating lists with ipairs'],
['Konvertieren mit tonumber und tostring','Converting with tonumber and tostring'],
['Länge einer Liste','List length'],
['Wait in Schleifen','Wait in loops'],
['Werte und Typen prüfen','Checking values and types'],
['while-Schleifen ohne Endlosschleife','While loops without infinite loops'],
['Rechnen und Operatoren','Arithmetic and operators'],
['Rückgabewerte nutzen','Using return values'],
['Kollisionen','Collisions'],
['Netzwerke','Networks'],
['Komponenten','Components'],
['Formularzustand','Form state'],
['Projektstruktur','Project structure'],
['Ereignisse','Events'],
['Überschriften und Absätze','Headings and paragraphs'],
['Links und Bilder','Links and images'],
['Semantische Bereiche','Semantic sections'],
['Listen und Tabellen','Lists and tables'],
['HTML-Grundgerüst','HTML document structure'],
['Barrierefreiheit','Accessibility'],
['Formulare','Forms'],
['Variablen und primitive Typen','Variables and primitive types'],
['Projektstruktur und Tests','Project structure and tests'],
['Funktionen und Rückgabewerte','Functions and return values'],
['Listen und Dictionaries','Lists and dictionaries'],
['Listen und Schleifen','Lists and loops'],
['Module und Pakete','Modules and packages'],
['Erster Python-Code','Your first Python program'],
['Fehler behandeln','Handling errors'],
['JSON-Dateien automatisiert sichern','Automating JSON file backups'],
['Eingaben zuverlässig umwandeln','Converting input reliably'],
['Python-Abschlussprojekt','Python final project'],
['Python Profi-Abschlussprojekt','Python advanced final project'],
['Umgebungen und Pakete','Environments and packages'],
['Asynchrone Netzwerkaufrufe','Asynchronous network calls'],
['Rust Einstieg','Getting started with Rust'],
['Ownership','Ownership'],
['Borrowing','Borrowing'],
['let und Mutabilität','let and mutability'],
['Warum TypeScript?','Why TypeScript?'],
['Konfigurations- und Buildfehler','Configuration and build errors'],
['Optionale Eigenschaften','Optional properties'],
['Typen und Union Types','Types and union types'],
['Fehler bei API-Aufrufen','API request errors'],
['Arrays filtern','Filtering arrays'],
['Module exportieren','Exporting modules'],
['Funktionen und Arrow Syntax','Functions and arrow syntax'],
['Variablen und Typumwandlung','Variables and type conversion'],
['Browser-Sicherheit','Browser security'],
['Konsole und let','Console and let'],
['Node.js Grundlagen','Node.js fundamentals'],
['Module importieren','Importing modules'],
['Eingaben prüfen','Validating input'],
['Bedingungen und Schleifen','Conditions and loops'],
['Bedingungen','Conditions'],
['Fehler und Abschlussprojekt','Errors and final project'],
['Abschlussprojekt','Final project'],
['Abschlussprüfung','Final exam'],
['Abschluss','Final project'],
['Funktionen','Functions'],
['Datentypen','Data types'],
['Schleifen','Loops'],
['Strings','Strings'],
['Werte','Values'],
['Daten','Data'],
['Text','Text'],
['Fehler','Errors'],
['Rechte','Permissions'],
['Berechtigungen','Permissions'],
['Tests','Tests'],
['Sicherheit','Security'],
['Projekte','Projects'],
['Prüfung','Exam'],
['Regeln','Rules'],
['Rollen','Roles'],
['Benutzer','Users'],
['Spieler','Players'],
['Fahrzeuge','Vehicles'],
['Spiel','Game'],
['Kurs','Course'],
['Lektion','Lesson'],
['Dateien','Files'],
['Eingaben','Input'],
['Ausgabe','Output'],
['Ausgaben','Outputs'],
['Umwandlung','Conversion'],
['Übungen','Exercises'],
['Erste','First'],
['Erster','First'],
['sicher','secure'],
['verwenden','using'],
[' verstehen',' explained'],

 ['Dein erster Lua-Befehl','Your first Lua command'],['Erster Python-Code','Your first Python program'],
 ['Variablen und Datentypen','Variables and data types'],['Variablen und Typen','Variables and types'],
 ['Lokale Variablen','Local variables'],['Kommentare und saubere Notizen','Comments and clear notes'],
 ['Einstieg und Lernziel','Introduction and learning goal'],['Verstehen & Beispiel','Understanding and example'],['Ausprobieren & festigen','Practice and reinforce'],
 ['Programmiersprachen','Programming languages'],['Datenbanken','Databases'],['Objekte','Objects'],['Bedingungen','Conditions'],
 ['Funktionen','Functions'],['Schleifen','Loops'],['Fehlerbehandlung','Error handling'],
 ['Datentypen','Data types'],['Variablen','Variables'],['Einrückung','Indentation'],
 ['Grundlagen','Fundamentals'],['Dein erster','Your first'],['Deine erste','Your first'],
 ['Einführung','Introduction'],['Einstieg','Getting started'],['für Anfänger','for beginners'],
 [' verstehen',' explained'],[' und ',' and '],[' oder ',' or '],
 [' auswählen',' select'],[' erstellen',' create'],[' bearbeiten',' edit'],[' speichern',' save'],
 [' prüfen',' check'],[' starten',' start'],[' anzeigen',' display'],[' verwenden',' use'],
 [' anwenden',' apply'],[' erklären',' explain'],[' vermeiden',' avoid'],
 [' im ',' in '],[' mit ',' with '],[' von ',' of '],[' zum ',' to the '],
 [' der ',' the '],[' die ',' the '],[' das ',' the ']
];
function translate(source){
 const value=String(source??'');
 if(!value||current!=='en')return value;
 const trimmed=value.trim();
 if(!trimmed)return value;
 if(Object.prototype.hasOwnProperty.call(translations,trimmed)){
  return value.slice(0,value.indexOf(trimmed))+translations[trimmed]+value.slice(value.indexOf(trimmed)+trimmed.length);
 }
 for(const [pattern,handler] of patterns){
  const m=trimmed.match(pattern);
  if(m)return value.replace(trimmed,handler(...m));
 }
 // Translate short topic labels only; do not reinterpret long free-form paragraphs.
 if(trimmed.length<=110&&!/[\n{};=]/.test(trimmed)){
  let out=trimmed;
  for(const [de,en] of terms){
   if(out===de){out=en;continue;}
   if(out.includes(de))out=out.replaceAll(de,en);
  }
  return value.replace(trimmed,out);
 }
 return value;
}
const originals=new WeakMap();
const translated=new WeakMap();
function eligible(node){
 if(!node||!node.parentElement)return false;
 return !node.parentElement.closest(
  'script,style,noscript,textarea,pre,code,kbd,samp,svg,[contenteditable],'+
  '#practice-input,#code-lines,.codebox,.practice-editor,.user-message,.message-content,[data-no-translate]'
 );
}
function translateNode(node){
 if(node.nodeType!==3||!eligible(node))return;
 const now=node.nodeValue;
 if(!now||!now.trim())return;
 let baseline=originals.get(node);
 if(baseline===undefined||now!==translated.get(node)&&now!==baseline){
  baseline=now;originals.set(node,baseline);
 }
 const desired=current==='en'?translate(baseline):baseline;
 if(now!==desired){translated.set(node,desired);node.nodeValue=desired;}
 else translated.set(node,now);
}
const attributes=['placeholder','title','aria-label','alt'];
const attributeBaseline=new WeakMap(),attributeTranslated=new WeakMap();
function translateAttributes(element){
 if(!element||!element.getAttribute||!eligible(element.firstChild||{parentElement:element}))return;
 let base=attributeBaseline.get(element),last=attributeTranslated.get(element);
 if(!base){base={};last={};attributeBaseline.set(element,base);attributeTranslated.set(element,last);}
 for(const key of attributes){
  if(!element.hasAttribute(key))continue;
  const now=element.getAttribute(key);
  if(!Object.prototype.hasOwnProperty.call(base,key)||now!==last[key]&&now!==base[key])base[key]=now;
  const desired=current==='en'?translate(base[key]):base[key];
  if(now!==desired)element.setAttribute(key,desired);
  last[key]=desired;
 }
}
function apply(rootNode){
 if(typeof document==='undefined')return;
 const base=rootNode||document.body;
 if(!base)return;
 if(base.nodeType===3){translateNode(base);return;}
 const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT);
 let child;while((child=walker.nextNode()))translateNode(child);
 if(base.nodeType===1)translateAttributes(base);
 if(base.querySelectorAll)base.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(translateAttributes);
}
function flush(){
 scheduled=false;
 if(processing)return;
 processing=true;
 try{apply(document.body);updateControls();}finally{processing=false;}
}
function queue(){
 if(scheduled)return;
 scheduled=true;
 Promise.resolve().then(flush);
}
function updateControls(){
 if(typeof document==='undefined')return;
 document.documentElement.lang=current;
 document.querySelectorAll('a[href="./privacy.html"],a[href="./privacy.en.html"]').forEach(link=>{
  const wanted=current==='en'?'./privacy.en.html':'./privacy.html';
  if(link.getAttribute('href')!==wanted)link.setAttribute('href',wanted);
 });
 document.querySelectorAll('[data-lang]').forEach(button=>{
  const selected=button.dataset.lang===current;
  button.classList.toggle('active',selected);
  button.setAttribute('aria-pressed',String(selected));
  const name=button.dataset.lang.toUpperCase()+(selected?' selected':'');
  if(button.getAttribute('aria-label')!==name)button.setAttribute('aria-label',name);
 });
}
function setLanguage(lang){
 if(!['de','en'].includes(lang))return;
 current=lang;
 try{localStorage.setItem(storageKey,lang);if(accountId)localStorage.setItem(accountKey(accountId),lang);}catch(_){}
 queue();
}
function setAccount(id){
 accountId=typeof id==='string'&&/^[0-9a-f-]{32,40}$/i.test(id)?id:'';
 if(accountId)try{const remembered=localStorage.getItem(accountKey(accountId));if(remembered==='en'||remembered==='de')current=remembered;}catch(_){}
 queue();
}
function start(){
 updateControls();
 queue();
 if(typeof MutationObserver!=='undefined'&&document.body&&!observer){
  observer=new MutationObserver(queue);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
 }
 document.addEventListener('click',event=>{
  const button=event.target?.closest?.('[data-lang]');
  if(button){event.preventDefault();setLanguage(button.dataset.lang);}
 },true);
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
root.LLI18n={language:()=>current,setLanguage,setAccount,apply,translate,translations};
})(typeof window==='undefined'?globalThis:window);
