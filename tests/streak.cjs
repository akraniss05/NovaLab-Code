/* LiveryLab Academy v19 — client-side claim UX, with mocked Supabase. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const re=/\ninit\(\);\n\}\)\(\);\s*$/;
assert(re.test(js),'Expected app init closure');
const body=js.replace(re,"\nwindow.__streakTest={s,streakModalHtml,claimDailyStreak,refreshStreakStatus,streakRemaining,durationDisplay,setApi(client){api=client}};\n})();");
const node=()=>({innerHTML:'',textContent:'',classList:{toggle(){},remove(){},add(){},contains(){return false}}});
const elements={};
const sandbox={
 window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(sel){return elements[sel]||(elements[sel]=node());},querySelectorAll(){return[]},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#home'},
 localStorage:{getItem(){return null},setItem(){}},
 setTimeout(){},clearTimeout(){},console
};
vm.createContext(sandbox);vm.runInContext(body,sandbox,{filename:'academy.js'});
const app=sandbox.window.__streakTest,s=app.s;
s.ready=true;s.profile={role:'student',display_name:'Test Developer',username:'dev'};
s.user={id:'demo',email:'test@example.com'};
s.lessons=[];s.courses=[];s.progress={done:[],watched:[],practiced:[],exams:{}};
s.loginStreak={current:0,best:0,claimable:true,server_now:new Date().toISOString()};
s.streakModalOpen=true;
assert(app.streakModalHtml().includes('data-streak-claim'),'Login modal offers Claim');
s.loginStreak=null;s.streakError='Network unavailable';
assert(app.streakModalHtml().includes('data-streak-retry'),'When backend is unavailable offer retry');
s.loginStreak={current:0,best:0,claimable:true,server_now:new Date().toISOString()};
assert(app.streakModalHtml().includes('Daily'),'Modal title visible');
assert.equal(app.durationDisplay(86400),'24:00:00','24 hour timer is formatted');
const next=new Date(Date.now()+86400*1000).toISOString();
let claims=0,reads=0;
app.setApi({rpc:async name=>{
 if(name==='academy_streak_claim'){claims++;return{data:{ok:true,status:{current:1,best:1,claimable:false,next_claim_at:next,server_now:new Date().toISOString()}}};}
 if(name==='academy_social_list')return {data:{profile:{},friends:[],requests:[],titles:['Developer']}};
 if(name==='academy_streak_status'){reads++;return {data:{current:1,best:1,claimable:false,next_claim_at:next,server_now:new Date().toISOString()}};}
 throw Error('Unexpected RPC '+name);
}});
(async()=>{
 await app.claimDailyStreak();
 assert.equal(claims,1,'Claim calls backend exactly once');
 assert.equal(s.loginStreak.current,1,'Claim updates persisted server streak');
 assert.equal(s.loginStreak.claimable,false,'Claim turns on cooldown');
 assert(app.streakModalHtml().includes('Für heute eingelöst'),'Claimed UI shown');
 assert(app.streakModalHtml().includes('data-streak-countdown'),'Timer shown');
 assert(app.streakRemaining()>86000,'Timer starts at roughly 24 hours');
 await app.claimDailyStreak();assert.equal(claims,1,'Cooldown blocks accidental double claim');
 await app.refreshStreakStatus();assert.equal(reads,1,'Read-only status refresh occurs');
 assert(!js.includes("api.rpc('academy_login_streak')"),'Implicit login claim must be removed');
 console.log('v19 claim modal, 24h countdown and one-click-only behavior passed');
})().catch(e=>{console.error(e);process.exitCode=1});
