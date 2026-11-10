/* Four membership tiers, annual discount, promo matrix and Max-only limits. No live user writes. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../site/academy-v21.js'),'utf8');
const footer=/\ninit\(\);\n\}\)\(\);\s*$/;assert.match(src,footer);
const context={window:{LL_CONFIG:{},addEventListener(){}},
 document:{querySelector(){return {innerHTML:'',classList:{toggle(){},add(){},remove(){}}}},querySelectorAll(){return []},addEventListener(){},body:{classList:{toggle(){}}}},
 location:{hash:'#plans'},localStorage:{getItem(){return null},setItem(){}},Date,Math,Number,String,console,Intl,Set,Map};
vm.createContext(context);
vm.runInContext(src.replace(footer,"\nwindow.__shop={s,offerFor,plansPage,shopDiscountAdminSection,examCap,fullAccess,allowed};\n})();"),context);
const a=context.window.__shop,s=a.s;
s.ready=true;s.profile={role:'student',username:'test'};s.user={id:'test'};s.courses=[];s.lessons=[];s.service={mine:[],admin:[],beta_open:true};
s.tier='free';s.shopEnabled=true;s.daily={daily_limit:5,used_today:0};s.shopMonths=1;
assert.equal(a.offerFor('pro',1).total_cents,199);
assert.equal(a.offerFor('ultimate',3).total_cents,1797);
assert.equal(a.offerFor('max',12).total_cents,13669,'12 month 5% discount, rounded to cents');
s.shopMonths=12;let html=a.plansPage();
for(const phrase of ['data-plan-months="1"','data-plan-months="3"','data-plan-months="12"','Max','Ultimate','−5 % Jahresrabatt','136,69 €','data-plan-request="max"'])assert(html.includes(phrase),phrase);
s.shopOffers=[{tier:'max',months:12,monthly_cents:1199,base_cents:14388,annual_cents:13669,year_discount_percent:5,promo_percent:10,total_cents:12302}];
assert.equal(a.offerFor('max',12).total_cents,12302);
assert(a.plansPage().includes('123,02 €'),'Promo price shown');
let admin=a.shopDiscountAdminSection();
assert.equal((admin.match(/data-form="shop-offer"/g)||[]).length,9,'All 9 tier/duration combinations can be discounted');
assert.match(admin,/name="percent"/);
assert.equal(a.examCap(),2);assert.equal(a.fullAccess(),false);
s.tier='pro';assert.equal(a.examCap(),4);
s.tier='ultimate';assert.equal(a.examCap(),8);assert.equal(a.fullAccess(),false);
s.tier='max';assert.equal(a.examCap(),-1);assert.equal(a.fullAccess(),true);
s.shopEnabled=false;s.tier='free';assert.equal(a.examCap(),-1);assert.equal(a.fullAccess(),true,'Shop disabled: all learning limits lifted');s.shopEnabled=true;
const sql=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261109_v71_max_tier_shop_offers.sql'),'utf8');
for(const rule of ["when 'max' then 2147483647","when 'ultimate' then 30 when 'pro' then 20","when 'ultimate' then 15","when 'ultimate' then 8 else -1","academy_private.is_admin()","REVOKE ALL ON FUNCTION public.academy_shop_offers","term_months","quoted_cents"])
 assert(sql.includes(rule),'Missing required server quota/security: '+rule);
console.log('PASS: tier quotas, Max full access, 9 offers and 5% annual+promo calculation.');
