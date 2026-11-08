/* v1.5 unified neon UI: no invented data, no lost forms or routes. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site/academy-v21.js'),'utf8');
assert.match(source,/\ninit\(\);\n\}\)\(\);\s*$/);
const mod=source.replace(/\ninit\(\);\n\}\)\(\);\s*$/,
 '\nwindow.__neon={s,neonMenuPage,neonHero,neonBanner,neonExamOverview,homePage,scriptPage,examsPage,referencePage,plansPage,profilePage,friendsPage,supportPage,settingsPage};\n})();');
const ctx={window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(){return {innerHTML:'',classList:{toggle(){},add(){},remove(){}}}},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#home'},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(){},clearTimeout(){},console};
vm.createContext(ctx);
vm.runInContext(mod,ctx,{filename:'academy-v21.js'});
const a=ctx.window.__neon,s=a.s;
s.ready=true;s.user={id:'abc',email:'student@example.com'};s.profile={username:'student',display_name:'Student',role:'student',active:true};
s.tier='ultimate';s.courses=[{id:'lua',name:'Lua',category:'Sprachen',level:'beginner'},
{id:'python',name:'Python',category:'Sprachen',level:'beginner'}];
s.lessons=[{id:'lua-01',course_id:'lua',chapter:'Grundlagen',position:1,title:'Lua-Befehl',summary:'Einstieg',required_plan:'free',minutes:10},
{id:'python-01',course_id:'python',chapter:'Grundlagen',position:1,title:'Python-Befehl',summary:'Einstieg',required_plan:'free',minutes:10}];
s.progress={done:['lua-01'],exams:{lua:{passed:true,score:10,total:10}},completedAt:{},lastLesson:{id:'lua-01'},verifiedPractice:[]};
s.loginStreak={current:3,best:4,claimable:false};
s.service={mine:[],admin:[],beta_open:true};
s.referenceData={lua:{name:'Lua',url:'https://www.lua.org/manual/5.4/',groups:{'Grundlagen':[['print(1)','Gibt eine Zahl aus']]} }};
s.refLang='lua';s.refGroup='Alle';s.refSearch='';
s.social={friends:[],requests:[],titles:['Developer'],profile:{username:'student'}};
s.socialMedia={};s.vouchers=[];s.members=[];s.memberPlans={};s.memberExpiry={};
function has(html,selectors,label){for(const fragment of selectors)assert(html.includes(fragment),label+' is missing '+fragment)}
const home=a.homePage();
has(home,['ll-neon-custom-hero','ll-home-brand-banner','ll-home-shortcuts','ll-home-continue','data-go="menu"','study-goal','weekly-goal'],'Home');
const menu=a.neonMenuPage();
for(const route of ['courses','script','exams','reference','plans','profile','friends','support','settings'])
 assert(menu.includes('data-go="'+route+'"'), 'Menu must preserve all current sections: '+route);
assert(!menu.includes('data-go="admin"'),'Admin must be hidden from normal accounts');
s.profile.role='admin';
assert(a.neonMenuPage().includes('data-go="admin"'),'Admin can open administration');
s.profile.role='student';
const script=a.scriptPage();
has(script,['ll-neon-custom-hero','sh_shop','file-tree','file-tabs','file-preview','data-project-tab','data-go="track/fivem"'],'Script studio');
assert(!script.includes('data-action="download-project"'),'Do not show downloads before project modules are unlocked');
const exams=a.examsPage();
has(exams,['ll-neon-exam-overview','ll-neon-stat-row','1</strong><small>Prüfungen bestanden','exam-quota','data-exam-filter'],'Exam dashboard');
assert(!exams.includes('Ø 87 %'),'Never invent past exam averages');
const refs=a.referencePage();
has(refs,['ll-neon-custom-hero','reference-picker','reference-language','reference-group','reference-search','reference-results','data-ref-copy'],'Reference documentation');
const shop=a.plansPage();
has(shop,['ll-neon-feature','membership-stack','1,99 €','5,99 €','data-form="redeem-voucher"'],'Shop');
assert(!shop.includes('19,99 €'),'Mockup-only prices must never replace the real prices');
const profile=a.profilePage();
has(profile,['ll-neon-page-heading','profile-overview-card','data-form="profile-title"','profile-friends-link'],'Profile');
const friends=a.friendsPage();
has(friends,['ll-neon-feature','friends-overview','friend-navigation','data-friend-tab="search"'],'Friends');
const support=a.supportPage();
has(support,['ll-neon-feature','support-compose','data-form="support-ticket"','support-history','support-category','support-message','support-faq'],'Support');
const settings=a.settingsPage();
has(settings,['ll-neon-page-heading','appearance-picker','data-theme-choice','data-accent-choice','data-pref','data-form="password"','mfa-settings','data-action="reset-progress"'],'Settings');
for(const p of ['home','menu','script','plans','exams','reference','profile','friends','support','settings','admin'])
 assert(source.includes("'"+p+"'")||p==='admin','Missing route '+p);
const css=fs.readFileSync(path.join(root,'site/academy-neon-ui.css'),'utf8');
for(const cls of ['.ll-neon-page-heading','.ll-neon-menu-tile','.ll-neon-exams','.ll-neon-admin',
 '.ll-neon-profile','.ll-neon-settings','.ll-neon-support','.ll-neon-reference','.ll-neon-plans',
 '.ll-neon-script','.ll-neon-friends','.ll-neon-home','prefers-reduced-motion'])
 assert(css.includes(cls),'Missing consistent neon page style '+cls);
for(const filename of ['index.html','v21.html','v31.html']){
 const html=fs.readFileSync(path.join(root,'site',filename),'utf8');
 assert(html.includes('academy-neon-ui.css?build=20261108v66'),filename+' must load new design');
}
console.log('Neon UI: all ten pages, main menu, real exam data, original forms, access and price invariants verified.');
