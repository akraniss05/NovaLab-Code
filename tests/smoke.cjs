/* LiveryLab Academy v13: source, styling and auth integration smoke checks */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const html=read('site/index.html'),js=read('site/academy-v21.js'),css=read('site/app-v21.css');
for(const file of ['site/reference-data.js','site/app-v21.css','site/app-v12.css','site/config.js','site/auth-mfa-v15.js','site/academy-v21.js','site/privacy.html','site/manifest.webmanifest','site/icon.svg','supabase/functions/academy-signin/index.ts','supabase/functions/admin-users/index.ts'])
 assert(fs.existsSync(path.join(__dirname,'..',file)),file+' missing');
for(const token of ['app-v21.css?build=20261107v31','academy-v21.js?build=20261108v47','auth-mfa-v15.js?build=20261107v31','config.js?build=20261107v31','LiveryLab Academy'])
 assert(html.includes(token),'Versioned asset missing: '+token);
for(const obsolete of ['styles.css','refined.css','music-studio.js','studio3d-v5.js'])
 assert(!html.includes(obsolete),'Old asset still linked: '+obsolete);
for(const token of ['function scriptPage','function referencePage','function examPage','function trackPage','PROJECT_FILES','data-project-tab','copy-project','data-action="complete-practice"','data-action="load-video"','data-action="reset-progress"','academy-signin','academy_set_username','data-form="create-email"','Free','Plus','Pro','LiveryLab Studios'])
 assert(js.includes(token),'Missing app feature: '+token);
for(const selector of ['.lesson-card','.lesson-card.is-complete','.status-ring','.lesson-steps','.lesson-step','.video-frame','.video-placeholder','.quiz-choice','.file-tree','.file-tab','.exam-question','.exam-option','.reference-row','.bottom-nav','.topbar','.auth-card'])
 assert(css.includes(selector),'Missing styling: '+selector);
assert(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'4-column steps or tabs missing');
assert(css.includes('@media(max-width:560px)'),'Mobile breakpoint missing');
assert(!/sb_secret_|SUPABASE_SERVICE_ROLE_KEY\s*[:=]/.test(read('site/config.js')),'Secret key detected in public config');
assert(/sb_publishable_/.test(read('site/config.js')),'Supabase publishable key missing');
for(const feature of ['academy_voucher_apply','academy_voucher_create','academy_voucher_list','academy_voucher_status','academy_voucher_set_active','academy_open_lesson','academy_project_examples','redeem-voucher','create-voucher','membership-card','daily-strip'])assert(js.includes(feature),'Missing membership feature: '+feature);
for(const token of ['app-v21.css?build=20261107v31','LiveryLab Academy'])assert(html.includes(token),'Missing v28 asset: '+token);
for(const token of ['registerAccount','waitingApproval','reference-language','reference-search','approval-card','academy_exam_start','setTier','access_status','5 pro Tag','10 pro Tag'])assert(js.includes(token),'Missing v15 capability: '+token);
const reference=read('site/reference-data.js');assert(reference.includes('window.LL_REFERENCE_DATA'),'Reference data source missing');
assert(!html.includes('reference-data.js?release='),'Reference dataset must not be loaded by all users');
for(const token of ['academy_exam_start','academy_exam_finish','academy_social_list','academy_friend_action','data-social-upload','data-admin-role','membershipHelp','friendsPage'])assert(js.includes(token),'Missing v17 feature: '+token);
for(const name of ['Lua','Python','JavaScript','TypeScript','FiveM','Blender','SQL','HTML','CSS','Rust','Java'])assert(reference.includes(name),'Reference language missing: '+name);
const signup=read('supabase/functions/academy-register/index.ts');
assert(signup.includes('academy_signup_rate_limit')&&signup.includes("email_confirm:true")&&signup.includes("access_status!=='pending'"),'Public signup fallback must remain pending and quota-limited');
assert(js.includes("api.functions.invoke('academy-register'"),'Signup-disabled recovery is not wired');
assert(read('supabase/config.toml').includes('[functions.academy-register]'),'Signup Edge Function configuration missing');
const mfa=read('site/auth-mfa-v15.js');
assert(mfa.includes('mfa.challenge')&&mfa.includes('mfa.verify')&&mfa.includes('mfa.enroll')&&mfa.includes('mfa.unenroll'),'Authenticator setup and verification missing');
assert(js.includes('function renderMFA(){'),'Authenticator rendering bridge missing');
assert(js.includes('id="mfa-settings"'),'Authenticator mount missing');
new Function(js);
for(const token of ['academy_streak_status','academy_streak_claim','streakModalHtml','data-streak-claim','ll-home-brand-banner','ll-home-shortcuts','academy_streak_status','academy_voucher_create_flexible','academy_voucher_delete','data-voucher-delete','getChoicePreference','achievementGallery','friend-navigation','reset-appearance','data-social-upload']) assert(js.includes(token),'Missing v18 feature: '+token);
for(const token of ['.appearance-picker','.achievement-grid','.friends-overview','.voucher-manage-card','.profile-quick-stats'])assert(css.includes(token),'Missing v18 style: '+token);
for(const asset of ['site/liverylab-banner.webp','site/liverylab-symbol.svg']) assert(fs.existsSync(path.join(__dirname,'..',asset)),'Missing new branding asset: '+asset);
const banner=fs.readFileSync(path.join(__dirname,'../site/liverylab-banner.webp'));
assert.equal(banner.subarray(0,4).toString(),'RIFF','LiveryLab banner is not an actual WebP');
assert.equal(banner.subarray(8,12).toString(),'WEBP','LiveryLab banner invalid');
for(const selector of ['.ll-home-shortcuts','.ll-home-brand-banner','.ll-streak-modal','.ll-streak-claim','.ll-streak-backdrop'])assert(css.includes(selector),'Missing v19 interface style: '+selector);
assert(fs.existsSync(path.join(__dirname,'../site/v21.html')),'Physical uncached v20 entry missing');
assert(read('site/v21.html').includes('academy-v21.js?build='),'Unique iOS entry must load new code');
assert(read('site/v31.html').includes('academy-v21.js?build=20261108v47'),'Fresh entry must load current code');
assert(read('site/manifest.webmanifest').includes('v31.html#home'),'Installed app must open fresh entry');
assert(js.includes("root=document.createElement('div')"),'Old HTML popup fallback missing');
assert(js.includes("s.streakModalOpen=true;"),'Daily popup must appear after every login');
assert(js.includes("data-streak-retry"),'Retry required if status fails');
assert(js.includes('width="24" height="24"'), 'SVG icons missing explicit dimensions');
assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), 'Bottom navigation must fit five icons');
assert(html.includes('id="streak-portal"')&&html.includes('data-streak-open'),'Streak mount and header button missing');
for(const token of ['data-form="profile-title"','profile-title-badge','auth-showcase','admin-overview','blender-video-step'])assert(js.includes(token),'Missing v23 feature: '+token);
for(const token of ['data-focus-course','ll-home-focus','data-pref="','data-admin-filter','admin-search-empty','Größere Schrift','Hoher Kontrast','Weniger Bewegung'])assert(js.includes(token),'Missing v24 function: '+token);
for(const token of ['.ll-home-focus','.ll-focus-result','.appearance-toggle:focus-within','.admin-search-empty[hidden]'])assert(css.includes(token),'Missing v24 styling: '+token);
for(const token of ['ll-home-metrics','ll-catalog-spotlight','NEUE ACADEMY · V28'])assert(js.includes(token),'Missing v25 interface: '+token);
for(const token of ['.ll-home-metrics','.ll-catalog-intro','.ll-auth-release'])assert(css.includes(token),'Missing v25 styling: '+token);
console.log('App v28 support, appearance, Blender, profile titles, admin and login tests passed');

for(const token of ['academy_service','supportPage','supportAdminSection','beta-enabled','support-ticket','support-reply','plan-expiry'])assert(js.includes(token),'Missing support feature: '+token);
assert(css.includes('.support-grid')&&css.includes('.beta-switch'),'Support styling missing');
for(const token of ['friend-list-search','data-exam-filter','download-project'])assert(js.includes(token),'Missing v28 feature: '+token);
assert(css.includes('.exam-filters')&&css.includes('.friend-toolbar'),'v28 layout missing');
for(const token of ['academy_shop_discount','salePrice','shop-sale-admin','sale-old','sale-new','sale-badge','data-bookmark-course','data-pin-course','study-goal','data-timer-toggle','support-search','support-filter','reply-templates','support-admin-stats'])assert(js.includes(token),'Missing v29 feature: '+token);
for(const token of ['.shop-sale-banner','.sale-old','.sale-new','.ll-home-tools','.support-faq','.support-controls','.support-admin-stats'])assert(css.includes(token),'Missing v29 styling: '+token);
assert(read('supabase/migrations/20261107_v29_shop_discount.sql').includes('academy_private.is_admin()'),'Shop discount must be admin-protected');

for(const token of ['practice-engine.js?build=20261107v37','timer-portal','focus-header'])assert(html.includes(token),'Missing v31 entry: '+token);
for(const token of ['LLPractice.evaluate','quizQuestions','practice-actions-simple','weekly-goal','timer-minutes'])assert(js.includes(token),'Missing v31 learning lab: '+token);

for(const entry of ['site/academy-learning-sync.js'])assert(fs.existsSync(path.join(__dirname,'..',entry)),entry+' missing');
assert(html.includes('academy-learning-sync.js?build=20261107v43'),'Local lesson draft manager is loaded');
assert(!html.includes('academy-studio.js')&&!html.includes('academy-studio.css')&&!html.includes('academy-learning-extras.css'),'Rejected Studio sections must not load');
for(const unwanted of ['Level & Belohnungen','Skilltree','Portfolio','Notizen','Challenges','Lernkalender'])assert(!js.includes("['"+unwanted.toLowerCase()+"'"),'Unwanted Studio menu label remains '+unwanted);
assert(!js.includes('practice-console'),'Simplified practice must not render terminal');
for(const token of ['data-action="complete-practice"','data-action="show-hint"','data-action="show-solution"','practice-actions-simple'])assert(js.includes(token),'Missing simple exercise action '+token);
assert(!js.includes('data-action="run-practice"'),'Run button must not render');
assert(html.includes('class="focus-center"')&&html.includes('data-timer-open'),'Center timer missing');
assert(js.includes('localStorage.setItem(timerStorageKey'),'Timer must persist beyond tab reload');
const layoutRestore=read('site/academy-v31-layout.css');
assert(html.includes('academy-v31-layout.css?build=20261108v45'),'v31 simplified CSS missing');
assert(read('site/v31.html').includes('academy-v31-layout.css?build=20261108v45'),'PWA simple CSS missing');
for(const selector of ['.ll-home-brand-banner','.topbar','.bottom-nav','.focus-center','.practice-actions-simple'])assert(layoutRestore.includes(selector),'Visual recovery missing '+selector);

const curriculum=read('site/academy-curriculum.js');
for(const file of ['site/index.html','site/v21.html','site/v31.html'])assert(read(file).includes('academy-curriculum.js?build=20261108v47'),file+' must include curriculum');
for(const token of ['sections','quiz_items','LLCurriculum','data-lesson-part','quizProgress','quiz-meter-fill'])assert(js.includes(token)||curriculum.includes(token),'Missing expanded curriculum '+token);
for(const token of ['data-plan-action="extend"','data-plan-action="reduce"','data-plan-action="end"','membershipRemainingText','memberExpiry'])assert(js.includes(token),'Missing subscription admin '+token);
const adminEdge=read('supabase/functions/admin-users/index.ts');
for(const token of ["body.action==='adjustPlan'","ownerIds.has(id)","expires_at:expiresAt","remaining_seconds","plan_expires_at"])assert(adminEdge.includes(token),'Missing authenticated plan duration handler '+token);
for(const token of ['ll-focus-modal','ll-focus-ring','data-timer-preset','focusTotalSeconds'])assert(js.includes(token),'Missing streak-inspired focus timer '+token);
assert(read('site/academy-v31-layout.css').includes('.ll-plan-manager'),'Missing responsive subscriptions');

const localReader=read('site/academy-curriculum.js'),localSync=read('site/academy-learning-sync.js');
assert(localReader.includes('.slice(0,2)'),'No more than two learning parts may display');
assert(localReader.includes('ll-part-selector-two'),'Two-tab lesson selector is required');
assert(js.includes("saveQuizLocal(parseRoute().id"),'Quiz checkpoints must save in the browser');
assert(js.includes('lessonLocalKey'),'Local progress must be scoped to the logged-in user');
assert(!localSync.includes('.upsert('),'Draft changes must not be uploaded to Supabase');
assert(localSync.includes('localStorage.setItem(key,String(value))'),'Local draft saving must be available');
assert(js.includes('Nur auf diesem Gerät gespeichert'),'Tell the user drafts are device-local');

assert(js.includes('academy_claim_lesson_xp'),'Client must use the server-side one-time award');
assert(js.includes('academy_lesson_xp_awards'),'Client must load immutable XP history');
assert(js.includes('xpHistoryHtml'),'User profile must list which lessons gave XP');
assert(js.includes('xpEarned()'),'XP must be calculated from permanent reward ledger');
assert(js.includes('xpAwarded(id)'),'Repeated lessons must display an already-rewarded state');
assert(js.includes('Bereits verdiente XP bleiben'),'Reset must warn that XP persist');
const ledgerSql=read('supabase/migrations/20261107_v44_one_time_xp_ledger.sql');
for(const item of ['PRIMARY KEY (user_id, lesson_id)','ON CONFLICT (user_id,lesson_id) DO NOTHING','CREATE POLICY academy_lesson_xp_awards_own_select','GRANT SELECT ON TABLE public.academy_lesson_xp_awards TO authenticated','academy_private.claim_lesson_xp'])assert(ledgerSql.includes(item),'XP ledger lacks guard '+item);

const languageModule=read('site/academy-i18n.js');
for(const file of ['site/index.html','site/v21.html','site/v31.html']){
 const contents=read(file);
 assert(contents.includes('academy-i18n.js?build=20261108v47'),file+' must load i18n before the main app');
 assert(contents.includes('data-lang="de"')&&contents.includes('data-lang="en"'),file+' must display DE and EN in the topbar');
}
for(const token of ['liverylab-language','MutationObserver','setAccount','data-lang','data-no-translate','practice-input','document.documentElement.lang'])assert(languageModule.includes(token),'Language module missing '+token);
assert(js.includes('LLI18n?.setAccount'),'Logged-in user language must be restored');
assert(js.includes('LLI18n?.apply'),'Dynamic UI must get translated on rerenders');

const currentCurriculum=read('site/academy-curriculum.js');
assert(currentCurriculum.includes('Number(p?.quiz_version)>=3'),'Quiz must prefer context-specific v3 bank');
assert(!currentCurriculum.includes("result.push({question:'Welche konkrete Aufgabe"),'Old mismatched auto-generated quiz questions must be gone');
const currentI18n=read('site/academy-i18n.js');
assert(currentI18n.includes('Welche praktische Aufgabe gehört zu'),'New question must be translatable to EN');
assert(js.includes('lastSupportReceipt'),'Support must show persisted ticket reference');
assert(js.includes('r.data?.ok!==true'),'Never claim a support request was sent without server confirmation');
assert(js.includes('support-submit-status'),'Send errors must be shown inline');
for(const entry of ['site/index.html','site/v21.html','site/v31.html'])assert(read(entry).includes('academy-v31-layout.css?build=20261108v47'),'Current support CSS missing '+entry);
