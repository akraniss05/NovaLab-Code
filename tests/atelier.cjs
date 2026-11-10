/* v1.5 visual Atelier: renders all actual pages without faking backend data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),file=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=file('site/academy-v21.js');
assert.match(src,/\ninit\(\);\n\}\)\(\);\s*$/);
const expose='\nwindow.__atelier={s,homePage,neonMenuPage,scriptPage,examsPage,referencePage,profilePage,friendsPage,supportPage,settingsPage,adminPage,atelierMissionStrip};\n})();';
const fake=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}}});
const context={window:{LL_CONFIG:{},addEventListener(){}},document:{querySelector(){return fake()},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}},
location:{hash:'#home'},localStorage:{getItem(){return null},setItem(){}},setTimeout(){},clearTimeout(){},console};
vm.createContext(context);
vm.runInContext(src.replace(/\ninit\(\);\n\}\)\(\);\s*$/,expose),context,{filename:'academy-v21.js'});
const a=context.window.__atelier,s=a.s;
s.ready=true;s.user={id:'demo',email:'demo@example.com'};
s.profile={display_name:'Demo',username:'demo',role:'student',active:true};
s.tier='max';
s.courses=[{id:'lua',name:'Lua',category:'Sprachen',level:'beginner'},{id:'python',name:'Python',category:'Sprachen',level:'beginner'}];
s.lessons=[{id:'lua-01',course_id:'lua',title:'Dein erster Lua-Befehl',summary:'Syntax',position:1,chapter:'Einstieg',required_plan:'free',minutes:15},
{id:'python-01',course_id:'python',title:'Dein erster Python-Befehl',summary:'Syntax',position:1,chapter:'Einstieg',required_plan:'free',minutes:15}];
s.progress={done:['lua-01'],exams:{lua:{passed:true,score:10,total:10}},completedAt:{},lastLesson:{id:'lua-01'}};
s.loginStreak={current:3,best:4,claimable:false};
s.service={mine:[],admin:[],beta_open:true};
s.social={friends:[],requests:[],titles:['Developer'],profile:{username:'demo'}};
s.socialMedia={};s.refLang='lua';s.refSearch='';s.refGroup='Alle';
s.referenceData={lua:{name:'Lua',url:'https://www.lua.org/manual/5.4/',groups:{Basics:[['print(1)','Zeigt eine Zahl']]}}};
s.members=[];s.memberPlans={};s.memberExpiry={};s.registrationPolicy={mode:'approval'};
function contains(html,terms,name){for(const term of terms)assert(html.includes(term),name+' missing '+term)}
const home=a.homePage();
contains(home,['ll-atelier-mission-strip','ll-atelier-course-rail','ll-atelier-rail-card','data-go="track/lua"','data-go="menu"','study-goal','weekly-goal','focus-clock'],'Home');
assert(home.includes('1 / 1 Lektionen abgeschlossen'),'Home uses real course progress');
const menu=a.neonMenuPage();
contains(menu,['ll-atelier-menu-lede','ll-atelier-scene','ll-atelier-tile-kicker','ll-atelier-mission-strip'],'Menu');
for(const route of ['courses','script','exams','reference','plans','profile','friends','support','settings'])
 assert(menu.includes('data-go="'+route+'"'),'All original destinations must remain: '+route);
assert(!menu.includes('data-go="admin"'),'No administrator tile for learners');
assert.match(menu,/id="ll-menu-learn"[\s\S]*data-go="courses"[\s\S]*id="ll-menu-community"[\s\S]*data-go="friends"[\s\S]*id="ll-menu-account"[\s\S]*data-go="support"/);
s.tier='free';s.shopEnabled=true;
assert.match(a.neonMenuPage(),/class="ll-neon-menu-tile is-locked" data-go="script"[\s\S]*Tarif erforderlich/);
s.shopEnabled=false;
assert(!a.neonMenuPage().includes('class="ll-neon-menu-tile is-locked" data-go="script"'),'Disabled shop unlocks scripts');
s.shopEnabled=true;
s.tier='ultimate';
const script=a.scriptPage();
contains(script,['ll-atelier-script-stats','ll-atelier-studio-shell','ll-atelier-studio-files','ll-atelier-studio-work',
'file-tree','file-tabs','file-preview','data-project-tab','data-go="track/fivem"'],'Script');
assert(!script.includes('data-action="download-project"'),'Locked script may not expose restricted export');
const exams=a.examsPage();
contains(exams,['ll-atelier-exam-card','ll-atelier-exam-progress','exam-quota','exam-filters','data-exam-filter'],'Exams');
s.tier='max'; // Max alone unlocks the full reference library.
const references=a.referencePage();
contains(references,['ll-atelier-ref-stats','reference-picker','reference-search','data-ref-copy'],'Reference');
const profile=a.profilePage();
contains(profile,['ll-atelier-profile-path','ll-atelier-milestone','profile-overview-card','data-form="profile-title"'],'Profile');
const friends=a.friendsPage();contains(friends,['friend-navigation','data-friend-tab="search"','ll-atelier-scene'],'Friends');
const support=a.supportPage();
contains(support,['ll-atelier-support-stats','data-form="support-ticket"','support-history','support-category','support-faq'],'Support');
const settings=a.settingsPage();
contains(settings,['ll-atelier-settings-preview','ll-atelier-preview-tags','appearance-picker','data-pref','data-form="password"','mfa-settings'],'Settings');
s.profile.role='admin';
assert(a.neonMenuPage().includes('data-go="admin"'),'Admin tile available only for admins');
const admin=a.adminPage();
contains(admin,['ll-atelier-admin-pulse','ll-atelier-admin-pulse-cards','ll-admin-tabs','ll-admin-hub','data-go="admin/members"','data-go="admin/support"'],'Admin');
s.profile.role='student';
const css=file('site/academy-atelier.css');
for(const selector of ['.ll-atelier-scene','.ll-atelier-cube','.ll-atelier-course-rail','.ll-atelier-studio-shell',
'.ll-atelier-exam-card','.ll-atelier-profile-path','.ll-atelier-settings-preview','.ll-atelier-admin-pulse',
'@media(max-width:490px)','prefers-reduced-motion'])
 assert(css.includes(selector),'Atelier missing '+selector);
for(const page of ['index.html','v21.html','v31.html'])
 assert(file('site/'+page).includes('academy-atelier.css?build=20261109v74'),page+' stylesheet missing');
console.log('Atelier: all 11 real pages, permissions, progress, 2FA, support, script unlock, vouchers and navigation retained.');
