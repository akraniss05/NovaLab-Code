/* Academy v1.5 roadmap views: real course/progress-driven responsive markup. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const appSource=fs.readFileSync(path.join(root,'site/academy-v21.js'),'utf8');
assert.match(appSource,/\ninit\(\);\n\}\)\(\);\s*$/);
const rewritten=appSource.replace(/\ninit\(\);\n\}\)\(\);\s*$/,
 '\nwindow.__roadmap={s,courseCard,coursesPage,trackPage,lessonPage,roadmapCoursePreview,roadmapJourney};\n})();');
const fake=()=>({innerHTML:'',classList:{toggle(){},add(){},remove(){},contains(){return false}}});
const context={
 window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(){return fake()},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#courses'},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(){},clearTimeout(){},console
};
vm.createContext(context);
vm.runInContext(rewritten,context,{filename:'academy-v21.js'});
const {s,courseCard,coursesPage,trackPage,lessonPage}=context.window.__roadmap;
s.ready=true;s.user={id:'user-1'};s.profile={username:'Tester',role:'student',active:true};
s.courses=[
 {id:'lua',name:'Lua',category:'Sprachen',level:'beginner',difficulty:2},
 {id:'blender-fundamentals',name:'Blender Fundamentals',category:'3D & Blender',level:'beginner',difficulty:2}
];
s.tier='free';s.shopEnabled=true;s.entitledCourses=['lua','blender-fundamentals']; // Test tier restrictions with the shop explicitly enabled.
s.lessons=[
 ...Array.from({length:5},(_,i)=>({id:'lua-'+String(i+1).padStart(2,'0'),course_id:'lua',
 chapter:i<4?'01 · Einstieg & Verstehen':'02 · Lua-Projekte',position:i+1,
 title:['Dein erster Lua-Befehl','Kommentare','Lokale Variablen','Datentypen','Schleifen'][i],
 summary:'Ein Konzept verständlich erklärt.',minutes:25,required_plan:i===4?'pro':'free'})),
 {id:'blender-01',course_id:'blender-fundamentals',chapter:'Grundlagen',position:1,
 title:'Ein erster Würfel',summary:'Einfach modellieren.',minutes:15,required_plan:'free'}
];
s.progress={done:['lua-01','lua-02','lua-03'],watched:[],practiced:[],exams:{}};
s.lesson={payload:{theory:'Lua speichert Werte in Variablen.',
 example:'local x = 3',task:'Lege eine Variable an.',
 goal:'Ein Thema Schritt für Schritt verstehen',
 quiz:'Was macht local?',options:['Lokale Variable','Bild erzeugen'],correct:0},video_id:'xcmGSRdCXc4',video_start:0};
const catalog=coursesPage();
for(const token of ['ll-roadmap-catalog','ll-learning-hero','ll-journey','ll-journey-steps',
 'll-paths-title','ll-roadmap-search-panel','ll-difficulty-disclosure','ll-mini-road',
 'course-difficulty-select','course-search','catalog-container','data-filter'])
 assert(catalog.includes(token),'Missing catalog feature '+token);
assert(catalog.includes('KURSBIBLIOTHEK'));
assert(!catalog.includes('NaN'),'Course progress should remain a valid number');
const card=courseCard(s.courses[0]);
for(const token of ['ll-path-course','ll-mini-road','3 / 5','5 Lektionen','data-go="track/lua"','60%'])
 assert(card.includes(token),'Course preview needs '+token);
let track=trackPage('lua');
for(const token of ['ll-roadmap-course','ll-track-summary','ll-map-chapter-details',
 'll-roadmap-lesson-list','ll-map-entry','ll-map-timeline-node','lesson-card','status-ring'])
 assert(track.includes(token),'Track missing '+token);
assert.equal((track.match(/class="lesson-card/g)||[]).length,5,'All five Lua lessons must be accessible in markup');
assert.equal((track.match(/class="ll-map-entry is-complete"/g)||[]).length,3,'Three lessons are completed');
assert.match(track,/class="ll-map-entry is-current"[\s\S]*?Datentypen/,'Next lesson must glow violet');
assert.match(track,/class="ll-map-entry locked"[\s\S]*?Schleifen/,'Paid content remains locked by plan');
s.shopEnabled=false;
const openTrack=trackPage('lua');
assert(!openTrack.includes('class="ll-map-entry locked"'),'All lessons remain accessible when the shop is disabled');
s.shopEnabled=true;
assert(track.includes('3 / 5')&&track.includes('60%'),'Track progress must reflect real data');
assert(!track.includes('[ 01 ] 01 · Einstieg'),'Chapter labels must not duplicate numbering');
assert(track.includes('data-go="lesson/lua-04"'),'Next lesson must keep working navigation');
assert(track.includes('data-pin-course="lua"'),'Pin action stays available');
assert(track.includes('data-bookmark-course="lua"'),'Bookmark action stays available');
assert(track.includes('ll-track-continue'), 'Continue action is available without interrupting the roadmap');
assert(track.includes('ll-art-svg') && track.includes('ll-art-types') && track.includes('ll-art-comment'),
 'Each topic has its own glowing SVG illustration');
assert(!track.includes('ll-next-roadmap'),'Standalone CTA must not interrupt the lesson timeline');
const mini=context.window.__roadmap.roadmapCoursePreview(s.courses[0],2,50);
assert.equal((mini.match(/ll-mini-stop is-done/g)||[]).length,1,'Only first milestone is complete at 2/50');
assert.equal((mini.match(/ll-mini-stop is-active/g)||[]).length,1,'Second milestone is active at 2/50');
const previousLessons=s.lessons,previousDone=s.progress.done;
s.lessons=Array.from({length:100},(_,i)=>({id:'other-'+i,course_id:'other'}));
s.progress.done=s.lessons.slice(0,12).map(l=>l.id);
const journey=context.window.__roadmap.roadmapJourney();
assert.equal((journey.match(/ll-journey-step is-done/g)||[]).length,1,'12% should complete only stage one');
assert.equal((journey.match(/ll-journey-step is-active/g)||[]).length,1,'12% should activate stage two');
assert(journey.includes('ll-roadmap-lock-icon'), 'Future milestones have a lock illustration');
s.lessons=previousLessons;s.progress.done=previousDone;
const blender=trackPage('blender-fundamentals');
assert(blender.includes('ll-roadmap-lesson-list')&&blender.includes('Ein erster Würfel'),'Roadmap works for Blender');
const lesson=lessonPage('lua-04');
for(const token of ['ll-roadmap-lesson','ll-lesson-hero','ll-lesson-road-stages',
 'lesson-explanation','lesson-video','lesson-practice','quiz-area',
 'practice-input','video-check','finish-lesson','data-action="reset-lesson"'])
 assert(lesson.includes(token),'Lesson action missing '+token);
for(const htmlFile of ['index.html','v21.html','v31.html']){
 const html=fs.readFileSync(path.join(root,'site',htmlFile),'utf8');
 assert(html.includes('academy-roadmap.css?build=20261108v59'),htmlFile+' does not load new roadmap CSS');
}
const css=fs.readFileSync(path.join(root,'site/academy-roadmap.css'),'utf8');
for(const token of ['.ll-journey-steps','.ll-mini-stop','.ll-map-entry.is-current',
 '.ll-map-entry.is-complete','.ll-roadmap-lesson .step-box','@media(max-width:560px)',
 'prefers-reduced-motion'])
 assert(css.includes(token),'Missing roadmap styles '+token);
console.log('Roadmap: 52-course compatible views, completed/current/paid states and lesson controls verified.');
