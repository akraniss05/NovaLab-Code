/* LiveryLab Learning Academy v9 — course-only, mobile-first.
   Made with 💙 from NyxAtheris (LiveryLab Studios). */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(v,max=190)=>{const s=String(v||'').replace(/\s+/g,' ').trim();return s.length>max?s.slice(0,max-1).trimEnd()+'…':s;};
const url=v=>/^https:\/\/[a-z0-9.-]+\//i.test(v||'')?esc(v):'https://www.lua.org/manual/5.4/';
const tier=t=>t==='ultimate'?'PLUS':t==='pro'?'PRO':'FREE';
const count=(c,done)=>c.chapters.reduce((n,ch)=>n+ch.lessons.filter(l=>done[l.id]).length,0);
const total=c=>c.chapters.reduce((n,ch)=>n+ch.lessons.length,0);
const level=l=>({'beginner':'Anfänger','intermediate':'Aufbau','advanced':'Fortgeschritten','expert':'Profi','Anfänger':'Anfänger','Mittelstufe':'Aufbau','Fortgeschritten':'Fortgeschritten','Experte':'Profi','Grundlagen':'Grundlagen'})[l]||l||'Lernen';
const i=(name,size=22)=>{
 const paths={
 home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 21v-7h6v7"/>',
 book:'<path d="M3 4.7A2 2 0 0 1 5 3h16v17H5a2 2 0 0 0 0 4"/><path d="M3 5v15a2 2 0 0 1 2-2h16"/>',
 code:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-13-2 18"/>',
 cube:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5m-9 5v10"/>',
 play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 circle:'<circle cx="12" cy="12" r="9"/>',
 star:'<path d="m12 2 3 6.5 7 .8-5 4.8 1.5 7-6.5-3.5-6.5 3.5 1.5-7-5-4.8 7-.8z"/>',
 file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M13 2v7h7M8 13h8m-8 4h8"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
 back:'<path d="m14 5-7 7 7 7"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 docs:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8m-8 4h8"/>'
 };
 return '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.book)+'</svg>';
};
const marker=(n,label)=>'<span class="ll9-kicker">[ '+esc(n)+' ] '+esc(label)+'</span>';
function topPage(label,title,desc){return '<header class="ll9-page-top">'+marker('00',label)+'<h1>'+title+'</h1><p>'+esc(desc)+'</p></header>'}
function stat(v,label){return '<div><strong>'+esc(v)+'</strong><span>'+esc(label)+'</span></div>'}
function progress(done,all){return '<div class="ll9-progress-track" role="progressbar" aria-valuenow="'+done+'" aria-valuemax="'+all+'" aria-valuemin="0"><div style="width:'+(all?Math.round(done*100/all):0)+'%"></div></div>'}
function cicon(c){return c.category==='3D & Blender'?i('cube',24):c.category==='FiveM'||c.category==='Frameworks'?i('code',24):i('book',24)}
function courseTile(c,done){
 const n=count(c,done),all=total(c);
 return '<button class="ll9-course-tile" data-course="'+esc(c.id)+'"><span class="ll9-tile-icon">'+cicon(c)+'</span><div class="ll9-tile-copy"><small>'+esc(c.category)+' · '+esc(level(c.level))+'</small><strong>'+esc(c.name)+'</strong><span>'+text(esc(c.description),110)+'</span><div class="ll9-tile-progress">'+progress(n,all)+'<small>'+n+' / '+all+' Lektionen</small></div></div><span class="ll9-tile-arrow">'+i('arrow',18)+'</span></button>';
}
function dashboard({courses,done,stats,name,tier:plan,recent}){
 const picks=['lua','python','blender-fundamentals','javascript','fivem','git'].map(id=>courses.find(c=>c.id===id)).filter(Boolean);
 const last=recent?.find(l=>l&&l.courseId);const completed=Object.keys(done).length;
 return '<div class="ll9-page">'+
 topPage('DEINE AKADEMIE','Willkommen zurück'+(name?', '+esc(name):'')+'.','Lerne programmieren, entwickle eigene FiveM-Skripte und erstelle professionelle 3D-Assets – Schritt für Schritt.')+
 '<div class="ll9-hero"><div><span class="ll9-kicker">DEIN LERNPFAD</span><h2>Vom ersten Schritt zum <em>eigenen Projekt.</em></h2><p>Verständliche Lektionen, ein verpflichtendes Videotutorial pro Thema, Praxisaufgaben und ein Wissenscheck.</p><div class="ll9-hero-actions"><button class="btn primary" data-go="catalog">Kurse entdecken '+i('arrow',17)+'</button>'+(last?'<button class="btn" data-lesson="'+esc(last.id)+'">Weiterlernen</button>':'')+'</div></div><div class="ll9-hero-art" aria-hidden="true"><span>{ }</span><span>3D</span><span>Lua</span></div></div>'+
 '<section class="ll9-overview-stats">'+stat(String(courses.length).padStart(2,'0'),'KURSE')+stat(String(stats.total),'LEKTIONEN')+stat(String(completed),'GESCHAFFT')+stat(tier(plan),'DEIN TARIF')+'</section>'+
 '<section class="ll9-panel ll9-next"><div class="ll9-next-left">'+marker('01','DEIN FORTSCHRITT')+'<h2>'+ (last?'Weiterlernen, wo du aufgehört hast.':'Starte mit deiner ersten Lektion.')+'</h2><p>'+(last?esc(last.title)+' · '+esc(last.courseName):'Beginne mit Lua, Python oder Blender. Du kannst die Kurse jederzeit wiederholen.')+'</p></div>'+(last?'<button class="btn primary" data-lesson="'+esc(last.id)+'">Weiterlernen '+i('arrow',17)+'</button>':'<button class="btn primary" data-course="lua">Jetzt starten '+i('arrow',17)+'</button>')+'</section>'+
 '<div class="ll9-section-heading">'+marker('02','EMPFOHLEN')+'<h2>Deine Einstiegs-Kurse</h2><p>Du brauchst keine Vorkenntnisse. Wähle ein Thema und beginne mit den Grundlagen.</p></div>'+
 '<div class="ll9-course-grid">'+picks.map(c=>courseTile(c,done)).join('')+'</div>'+
 '<div class="ll9-watermark">Made with 💙 from NyxAtheris (LiveryLab Studios)</div></div>';
}
function catalog({courses,done,filter='all',search='',lfilter='all'}){
 const matched=courses.filter(c=>(filter==='all'||(filter==='blender'?c.category==='3D & Blender':filter==='fivem'?['FiveM','Frameworks'].includes(c.category):c.category!=='3D & Blender'&&!['FiveM','Frameworks'].includes(c.category)))&&(lfilter==='all'||level(c.level).toLowerCase()===lfilter)&&(c.name+' '+c.category+' '+c.description).toLowerCase().includes(search.toLowerCase()));
 const groups=[['all','Alle Kurse'],['coding','Coding'],['fivem','FiveM'],['blender','Blender & 3D']];
 return '<div class="ll9-page">'+topPage('DEINE LERNBIBLIOTHEK','Alle Kurse. <em>Ein Lernziel.</em>','Von den Grundlagen bis zur professionellen Anwendung. Alle Kurse sind für Free, Pro und Plus zugänglich; es gelten unterschiedliche Tageslimits.')+
 '<div class="ll9-catalog-tools"><div class="ll9-filters">'+groups.map(([id,label])=>'<button data-ll9-filter="'+id+'" class="'+(filter===id?'active':'')+'">'+label+'</button>').join('')+'</div><label class="ll9-search"><span>SUCHEN</span><input id="ll9-course-search" type="search" value="'+esc(search)+'" placeholder="Sprache, Kurs oder Thema …" autocomplete="off"></label></div>'+
 '<div class="ll9-catalog-meta">'+marker('01','KURSVERZEICHNIS')+'<span>'+matched.length+' Kurse</span></div>'+
 '<div class="ll9-course-grid">'+(matched.length?matched.map(c=>courseTile(c,done)).join(''):'<div class="ll9-panel ll9-empty">Keine passenden Kurse gefunden. Versuche einen anderen Suchbegriff.</div>')+'</div>'+
 '<div class="ll9-plan-note"><b>FREE</b> 3 Lektionen / Tag <b>PRO</b> 6 Lektionen / Tag <b>PLUS</b> unbegrenzt · Alle Lernbereiche freigeschaltet</div></div>';
}
function lessonCard(l,n,done){
 const time=Math.max(10,Math.min(65,Number(l.duration)||25)),task=Array.isArray(l.steps)?l.steps.length:4;
 return '<button class="ll9-lesson-card '+(done[l.id]?'is-done':'')+'" data-lesson="'+esc(l.id)+'"><span class="ll9-lesson-number">'+String(n).padStart(2,'0')+'</span><span class="ll9-lesson-info"><strong>'+esc(l.title)+'</strong><span class="ll9-lesson-excerpt">'+text(esc(l.theory),156)+'</span><span class="ll9-lesson-meta">'+i('clock',15)+' '+time+' MIN · VIDEO + '+task+' SCHRITTE · QUIZ</span></span><span class="ll9-lesson-status">'+i(done[l.id]?'check':'circle',24)+'</span></button>';
}
function course(c,{done,exams,last}){
 const n=count(c,done),all=total(c);
 const next=c.chapters.flatMap(ch=>ch.lessons).find(l=>!done[l.id])||c.chapters[0]?.lessons[0];
 const exam=exams?.[c.id];
 return '<div class="ll9-page ll9-course-page">'+
 '<div class="ll9-course-head"><button class="ll9-back" data-go="catalog">'+i('back',18)+' Alle Kurse</button><span class="ll9-course-subhead"><span class="ll9-category-icon">'+cicon(c)+'</span>'+esc(c.category)+'</span></div>'+
 '<div class="ll9-course-intro">'+marker('00','LERNPFAD · '+all+' LEKTIONEN')+'<h1>'+esc(c.name)+'</h1><p>'+esc(c.description)+'</p><div class="ll9-course-goal"><strong>Was du lernst</strong><span>'+esc(c.chapters.map(ch=>ch.name).join(' · '))+'</span></div></div>'+
 '<div class="ll9-course-stats">'+stat(n+'/'+all,'LEKTIONEN')+stat(String(Math.max(0,n*15)),'LERN-XP')+stat(c.chapters.length,'KAPITEL')+stat(exam?.passed?'✓':'–','PRÜFUNG')+'</div>'+
 '<section class="ll9-next-lesson ll9-panel">'+marker('01','NÄCHSTE LEKTION')+'<h2>'+esc(next?.title||'Alle Lektionen abgeschlossen')+'</h2><p>'+esc(next?.goal||'Du kannst die Themen jetzt wiederholen oder die Kursprüfung starten.')+'</p>'+(next?'<button data-lesson="'+esc(next.id)+'" class="btn primary">Jetzt starten '+i('arrow',17)+'</button>':'')+'</section>'+
 '<div class="ll9-syllabus" id="ll9-lessons">'+c.chapters.map((ch,j)=>'<section class="ll9-chapter">'+
 '<div class="ll9-chapter-header">'+marker(String(j+1).padStart(2,'0'),ch.name)+'<span>'+ch.lessons.filter(l=>done[l.id]).length+' / '+ch.lessons.length+' erledigt</span></div>'+
 '<div class="ll9-lesson-list">'+ch.lessons.map((l,k)=>lessonCard(l,c.chapters.slice(0,j).reduce((sum,x)=>sum+x.lessons.length,0)+k+1,done)).join('')+'</div></section>').join('')+'</div>'+
 '<div class="ll9-course-end"><div><h3>Bereit für den Wissenstest?</h3><p>Die Abschlussprüfung prüft Lerninhalte dieses Kurses. Du kannst sie wiederholen.</p></div><div class="ll9-inline-actions"><button class="btn" data-go="reference">Spickzettel '+i('docs',17)+'</button><button class="btn" data-go="exam">Zur Prüfung '+i('arrow',17)+'</button></div></div></div>';
}
function learning(l,c,{done,videoDone,taskPassed,quizzes,notes,taskNotes,index,total:all}){
 const complete=!!done[l.id];
 const steps=Array.isArray(l.steps)?l.steps:[];
 const points=Array.isArray(l.keyPoints)?l.keyPoints:[];
 return '<div class="ll9-page ll9-learning">'+
 '<div class="ll9-learning-bar"><button data-go="course" class="ll9-back">'+i('back',18)+' '+esc(c.name)+'</button><span class="ll9-learning-progress">'+(index+1)+' / '+all+' LEKTIONEN</span></div>'+
 '<header class="ll9-learning-head">'+marker(String(index+1).padStart(2,'0'),c.category.toUpperCase())+'<h1>'+esc(l.title)+'</h1><p>'+esc(l.goal||l.theory)+'</p><div class="ll9-learning-tags"><span>'+esc(level(l.level))+'</span><span>'+esc((l.lang||'3D').toUpperCase())+'</span><span>'+(complete?'✓ Abgeschlossen':'Noch offen')+'</span></div></header>'+
 '<div class="ll9-learning-grid"><div class="ll9-learning-main">'+
 '<section class="ll9-learn-panel">'+marker('01','GRUNDLAGEN')+'<h2>Verstehen, bevor du beginnst.</h2><p class="ll9-bodytext">'+esc(l.theory)+'</p><div class="ll9-objective"><strong>DEIN LERNZIEL</strong><p>'+esc(l.goal)+'</p></div><div class="ll9-points">'+points.map((p,i)=>'<div><span>'+String(i+1).padStart(2,'0')+'</span><p>'+esc(p)+'</p></div>').join('')+'</div></section>'+
 '<section class="ll9-learn-panel" id="ll9-video-panel">'+marker('02','PFLICHTVIDEO')+'<h2>Sieh dir das Tutorial an.</h2><p class="ll9-bodytext">Sieh dir die Erklärung an, stoppe bei schwierigen Stellen und vergleiche sie mit der schriftlichen Lektion. Danach bestätigst du selbst, dass du das Video angesehen hast.</p><div id="ll9-video-slot"></div><div class="ll9-confirm-state '+(videoDone[l.id]?'is-done':'')+'">'+i(videoDone[l.id]?'check':'play',18)+' '+(videoDone[l.id]?'Video bestätigt':'Video noch nicht bestätigt')+'</div></section>'+
 '<section class="ll9-learn-panel">'+marker('03','PRAXISBEISPIEL')+'<h2>So sieht es in der Praxis aus.</h2><p class="ll9-bodytext">Lies das Beispiel von oben nach unten. Überlege, warum jeder Schritt notwendig ist. Du kannst es kopieren und in einem eigenen Programm oder in Blender nachvollziehen.</p><div class="ll9-codeframe"><div class="ll9-codehead"><span>'+i('file',15)+' '+esc((l.lang||'BLENDER').toUpperCase())+' / BEISPIEL</span><button data-act="copy-example">Beispiel kopieren</button></div><pre><code>'+esc(l.example||l.goal)+'</code></pre></div><div class="ll9-mistake"><strong>HÄUFIGER FEHLER</strong><p>'+esc(l.mistake||'Prüfe Eingaben und Ergebnisse sorgfältig.')+'</p></div></section>'+
 '<section class="ll9-learn-panel">'+marker('04','PRAKTISCHE AUFGABE')+'<h2>Jetzt selbst ausprobieren.</h2><p class="ll9-bodytext">'+esc(l.task)+'</p><ol class="ll9-tasksteps">'+steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol><p class="ll9-bodytext">Schreibe kurz auf, was du umgesetzt und überprüft hast. Nutze dafür deine eigene Entwicklungsumgebung oder Blender – die Academy enthält bewusst keinen Editor mehr.</p><label class="ll9-field-label" for="ll9-task-notes">Dein Ergebnis &amp; deine Beobachtungen</label><textarea class="ll9-reflection" id="ll9-task-notes" rows="4" placeholder="Was habe ich erstellt? Welche Eingabe habe ich getestet? Was habe ich verbessert?">'+esc(taskNotes[l.id]||'')+'</textarea><div class="ll9-inline-actions"><button class="btn primary" data-act="task-confirm" '+(taskPassed[l.id]?'disabled':'')+'>'+i('check',16)+' '+(taskPassed[l.id]?'Praxis bestätigt':'Meine Praxisarbeit bestätigen')+'</button><button class="btn" data-act="hint">Tipp anzeigen</button><button class="btn" data-act="show-solution">Musterlösung</button></div><p id="lessonOutput" class="ll9-feedback" aria-live="polite">'+(taskPassed[l.id]?'Praxisarbeit selbst bestätigt.':'Beschreibe mindestens 25 Zeichen zu deiner Umsetzung. Das ist eine Selbstkontrolle, keine automatische Codeprüfung.')+'</p><pre id="lessonSolution" class="ll9-solution hidden">'+esc(l.solution||steps.join('\n'))+'</pre></section>'+
 '<section class="ll9-learn-panel">'+marker('05','WISSENSCHECK')+'<h2>Hast du es verstanden?</h2><p class="ll9-question">'+esc(l.quiz)+'</p><div class="ll9-answer-list">'+(l.options||[]).map((opt,j)=>'<button class="quiz-option" data-quiz-opt="'+j+'"><span>'+String.fromCharCode(65+j)+'</span>'+esc(opt)+'</button>').join('')+'</div><p id="quizFeedback" class="ll9-feedback" aria-live="polite">'+(quizzes[l.id]?'✓ Richtig beantwortet.':'Wähle die richtige Antwort. Du kannst es wiederholen.')+'</p></section>'+
 '<section class="ll9-learn-panel">'+marker('06','MERKEN & VERTIEFEN')+'<h2>Für deine nächsten Projekte.</h2><p class="ll9-bodytext">'+esc(l.extra||l.reviewPrompt||l.goal)+'</p><div class="ll9-objective"><strong>DENKFRAGE</strong><p>'+esc(l.reviewPrompt||l.goal)+'</p></div><label class="ll9-field-label" for="lessonNotes">Persönliche Notizen</label><textarea id="lessonNotes" class="ll9-reflection" rows="3" placeholder="Was möchte ich mir für später merken?">'+esc(notes[l.id]||'')+'</textarea></section>'+
 '<div class="ll9-learning-finish"><button class="btn" data-go="course">← Kursübersicht</button><button class="btn primary" data-act="complete-lesson">'+(complete?'✓ Lektion abgeschlossen':'Lektion abschließen')+' '+i('arrow',17)+'</button></div></div>'+
 '<aside class="ll9-learning-aside"><div class="ll9-aside-card">'+marker('LERNREISE','DEIN STATUS')+'<h3>Schritt für Schritt</h3><ul><li>'+i(videoDone[l.id]?'check':'circle',17)+' Pflichtvideo</li><li>'+i(taskPassed[l.id]?'check':'circle',17)+' Praxisaufgabe</li><li>'+i(quizzes[l.id]?'check':'circle',17)+' Wissenscheck</li></ul>'+progress(count(c,done),total(c))+'<p>'+count(c,done)+' von '+total(c)+' Lektionen gelernt</p></div><div class="ll9-aside-card">'+marker('QUELLEN','DOKUMENTATION')+'<a href="'+url(l.resource||c.source)+'" target="_blank" rel="noopener noreferrer">Offizielle Dokumentation öffnen '+i('arrow',15)+'</a><p>Benutze die aktuelle Dokumentation, wenn sich Softwareversionen unterscheiden.</p></div></aside></div>'+
 '<div class="ll9-watermark">Made with 💙 from NyxAtheris (LiveryLab Studios)</div></div>';
}
function exam(c,{questions,index,correct,selected,result,done}){
 const countQ=questions?.length||0,passed=result?.passed;
 const header='<div class="ll9-page ll9-exam">'+
 '<div class="ll9-learning-bar"><button class="ll9-back" data-go="course">'+i('back',18)+' Kursübersicht</button><span class="ll9-learning-progress">'+esc(c.name)+'</span></div>'+
 '<header class="ll9-learning-head">'+marker('★','ABSCHLUSS')+'<h1>Abschlussprüfung</h1><p>Fragen aus den Lektionen von '+esc(c.name)+'. Du bestehst ab 80 % richtig beantworteten Fragen. Du kannst den Test wiederholen.</p></header>';
 if(result){
 return header+'<section class="ll9-learn-panel ll9-exam-result"><span class="ll9-result-mark">'+i(passed?'check':'circle',38)+'</span><h2>'+(passed?'Prüfung bestanden.':'Fast geschafft.')+'</h2><strong>'+correct+' / '+countQ+' richtig · '+Math.round(correct*100/Math.max(countQ,1))+' %</strong><p>'+(passed?'Gut gemacht! Wiederhole die Lerninhalte regelmäßig, damit du sie sicher anwenden kannst.':'Schau dir die Fragen noch einmal an, lies die Lektionen nach und versuche es erneut.')+'</p><div class="ll9-inline-actions"><button class="btn primary" data-act="exam-start">Erneut versuchen</button><button class="btn" data-go="course">Zum Kurs</button></div></section></div>';
 }
 const l=questions[index];if(!l)return header+'<section class="ll9-learn-panel"><h2>Keine Prüfungsfragen vorhanden.</h2><button class="btn" data-go="course">Zurück</button></section></div>';
 return header+'<div class="ll9-exam-progress">'+marker(String(index+1).padStart(2,'0'), 'FRAGE / '+countQ)+progress(index,countQ)+'</div>'+
 '<section class="ll9-learn-panel"><p class="ll9-exam-subject">'+esc(l.title)+'</p><h2 class="ll9-exam-question">'+esc(l.quiz)+'</h2><div class="ll9-answer-list">'+(l.options||[]).map((opt,j)=>'<button class="ll9-exam-option" data-exam-option="'+j+'" '+(selected!==null?'disabled':'')+'><span>'+String.fromCharCode(65+j)+'</span>'+esc(opt)+'</button>').join('')+'</div><div class="ll9-exam-control">'+(selected===null?'<p class="ll9-feedback">Wähle eine Antwort, um fortzufahren.</p>':'<p class="ll9-feedback">Antwort gespeichert. Fahre mit der nächsten Frage fort.</p><button class="btn primary" data-act="exam-next">'+(index===countQ-1?'Prüfung auswerten':'Nächste Frage')+' '+i('arrow',16)+'</button>')+'</div></section></div>';
}
function reference(c,{query=''}) {
 const entries=c.chapters.flatMap(ch=>ch.lessons).filter(l=>(l.title+' '+l.example+' '+l.theory).toLowerCase().includes(query.toLowerCase()));
 return '<div class="ll9-page ll9-reference">'+
 '<div class="ll9-learning-bar"><button class="ll9-back" data-go="course">'+i('back',18)+' '+esc(c.name)+'</button></div>'+
 topPage('NACHSCHLAGEN','Spickzettel & Beispiele.','Kurzer Überblick über wichtige Befehle und Vorgehensweisen aus deinen Lektionen. Ohne zusätzlichen Code-Editor.')+
 '<label class="ll9-search ll9-reference-search"><span>BEGRIFF SUCHEN</span><input id="ll9-reference-search" type="search" value="'+esc(query)+'" placeholder="Begriff oder Funktion eingeben …"></label>'+
 '<div class="ll9-reference-list">'+(entries.length?entries.map((l,j)=>'<section class="ll9-reference-item"><span class="ll9-kicker">[ '+String(j+1).padStart(2,'0')+' ] '+esc(l.title)+'</span><p>'+text(esc(l.theory),360)+'</p><pre><code>'+esc(l.example||l.goal)+'</code></pre><button class="btn" data-lesson="'+esc(l.id)+'">Zur Lektion '+i('arrow',15)+'</button></section>').join(''):'<p class="ll9-panel">Keine Einträge gefunden.</p>')+'</div>'+
 '<div class="ll9-reference-foot"><a href="'+url(c.source||'https://www.lua.org/manual/5.4/')+'" target="_blank" rel="noopener noreferrer">Original-Dokumentation '+i('arrow',15)+'</a></div></div>';
}
function bottom(view,hasCourse){
 const el=document.querySelector('.mobile-nav');if(!el)return;
 const page=['course','lesson','exam','reference'].includes(view)&&hasCourse;
 document.body.classList.toggle('ll9-course-mode',page);
 const items=page?[['course','book','Lernen'],['syllabus','file','Lektionen'],['exam','star','Prüfung'],['reference','docs','Referenz']]:
 [['home','home','Start'],['catalog','book','Kurse'],['profile','user','Profil']];
 el.innerHTML=items.map(([id,ico,label])=>'<button data-go="'+id+'" class="'+((page?(view==='lesson'||view==='course'?view==='lesson'&&id==='syllabus'||view==='course'&&id==='course':view===id):view===id)?'active':'')+'" aria-label="'+label+'">'+i(ico,23)+'<span>'+label+'</span></button>').join('');
}
window.LL9={dashboard,catalog,course,learning,exam,reference,bottom,tier,level,count,total};
})();