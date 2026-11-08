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
const patterns=[
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
