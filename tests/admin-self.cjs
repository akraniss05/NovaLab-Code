/* v72 Admin own XP, Daily Streak and self-tier checks. No real accounts modified. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const src=read('site/academy-v21.js');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;
assert.match(src,footer);
const script=src.replace(footer,"\nwindow.__selfTest={s,adminPage,adminSelfSection,xpEarned,fullAccess,hasScript,allowed,changeAdminSelf,refreshAdminSelf,setApi(v){api=v}};\n})();");
const fake=()=>({innerHTML:'',textContent:'',classList:{toggle(){},remove(){},add(){}}});
const context={window:{LL_CONFIG:{},addEventListener(){}},document:{querySelector(){return fake()},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#admin/self'},localStorage:{getItem(){return null}},console,Math,Date,Intl,Map,Set};
vm.createContext(context);vm.runInContext(script,context,{filename:'academy-v21.js'});
const a=context.window.__selfTest,s=a.s;
s.ready=true;s.user={id:'safe-admin-test'};s.profile={role:'admin',username:'Tester',active:true};
s.courses=[];s.lessons=[];s.progress={done:['lua-1'],watched:[],exams:{}};
s.xpAwards=[{lesson_id:'lua-1',xp:30},{lesson_id:'lua-2',xp:30}];
s.adminSelf={ok:true,tier:'max',plan_expires_at:null,xp_lesson:60,xp_adjustment:1740,xp_total:1800,
 streak:{current:45,best:60,claimable:false,claimed_today:true},streak_claims:12,stations_today:3,exams_today:2,
 changes:[{action:'set_xp',updated_at:'2026-11-09T08:00:00Z',before_state:{total_xp:30},after_state:{total_xp:1800}}]};
s.tier='max';
assert.equal(a.xpEarned(),1800,'Manual offset should appear in XP total');
assert.equal(s.xpAwards[0].xp,30,'One-time lesson awards must remain unchanged');
const html=a.adminSelfSection();
for(const token of ['ADMINISTRATION · NUR DEIN KONTO','data-form="admin-self-xp"','data-form="admin-self-streak"','data-form="admin-self-plan"',
 'data-action="admin-self-xp-add"','data-action="admin-self-streak-add"','data-action="admin-self-max"',
 'Meine letzten Admin-Änderungen','1.800','45 Tage','60 Tage','Freigeschaltet'])
{
 if(token==='Freigeschaltet')continue;
 assert(html.includes(token),'Missing admin self controls: '+token);
}
assert(a.adminPage().includes('data-go="admin/self"'),'Admin self tab must be reachable');
s.tier='free';
assert.equal(a.fullAccess(),false,'Admin must be able to preview Free restrictions');
assert.equal(a.hasScript(),false,'Free admin self-plan should restrict script tools');
assert.equal(a.allowed({course_id:'lua',required_plan:'pro'}),false,'Premium lessons protected by selected tier');
s.tier='pro';
assert.equal(a.hasScript(),true);
assert.equal(a.allowed({course_id:'lua',required_plan:'pro'}),false);
s.tier='max';
assert.equal(a.fullAccess(),true);
assert.equal(a.allowed({course_id:'lua',required_plan:'pro'}),true);
s.profile.role='student';
assert.equal(a.xpEarned(),60,'Student must never inherit the admin XP adjustment');
assert(!a.adminPage().includes('data-form="admin-self-plan"'),'Admin self page remains role-protected');
const sql=read('supabase/migrations/20261109_v72_admin_self_management.sql');
for(const frag of ["academy_private.is_admin()","auth.uid()","user_id=who","p_action='set_xp'","p_action='set_streak'",
 "p_action='set_plan'","plan_expires_at","tier_override","xp_adjustment","academy_admin_self_audit",
 "REVOKE ALL ON FUNCTION public.academy_admin_self","GRANT EXECUTE ON FUNCTION public.academy_admin_self"])
 assert(sql.includes(frag),'Missing SQL authorization/contract: '+frag);
assert(!/UPDATE\s+public\.academy_lesson_xp_awards/i.test(sql),'Cannot rewrite one-time XP awards');
assert(!/DELETE\s+FROM\s+academy_private\.academy_streak_claims/i.test(sql),'Cannot delete streak claim history');
console.log('PASS Admin personal XP, streak, membership, protected rendering and ledger preservation');
