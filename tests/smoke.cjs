/* LiveryLab Academy v13: source, styling and auth integration smoke checks */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const html=read('site/index.html'),js=read('site/academy-v21.js'),css=read('site/app-v21.css');
for(const file of ['site/reference-data.js','site/app-v21.css','site/app-v12.css','site/config.js','site/auth-mfa-v15.js','site/academy-v21.js','site/privacy.html','site/manifest.webmanifest','site/icon.svg','supabase/functions/academy-signin/index.ts','supabase/functions/admin-users/index.ts'])
 assert(fs.existsSync(path.join(__dirname,'..',file)),file+' missing');
for(const token of ['app-v21.css?build=20261106v23b','academy-v21.js?build=20261106v23b','auth-mfa-v15.js?build=20261106v23b','config.js?build=20261106v23b','LiveryLab v23'])
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
for(const token of ['app-v21.css?build=20261106v23b','LiveryLab v23'])assert(html.includes(token),'Missing v23 asset: '+token);
for(const token of ['registerAccount','waitingApproval','reference-language','reference-search','approval-card','academy_exam_start','setTier','access_status','3 pro Tag','6 pro Tag'])assert(js.includes(token),'Missing v15 capability: '+token);
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
for(const token of ['academy_streak_status','academy_streak_claim','streakModalHtml','data-streak-claim','ll-home-brand-banner','ll-home-shortcuts','academy_streak_status','academy_voucher_create_custom','academy_voucher_delete','data-voucher-delete','getChoicePreference','achievementGallery','friend-navigation','reset-appearance','data-social-upload']) assert(js.includes(token),'Missing v18 feature: '+token);
for(const token of ['.appearance-picker','.achievement-grid','.friends-overview','.voucher-manage-card','.profile-quick-stats'])assert(css.includes(token),'Missing v18 style: '+token);
for(const asset of ['site/liverylab-banner.webp','site/liverylab-symbol.svg']) assert(fs.existsSync(path.join(__dirname,'..',asset)),'Missing new branding asset: '+asset);
const banner=fs.readFileSync(path.join(__dirname,'../site/liverylab-banner.webp'));
assert.equal(banner.subarray(0,4).toString(),'RIFF','LiveryLab banner is not an actual WebP');
assert.equal(banner.subarray(8,12).toString(),'WEBP','LiveryLab banner invalid');
for(const selector of ['.ll-home-shortcuts','.ll-home-brand-banner','.ll-streak-modal','.ll-streak-claim','.ll-streak-backdrop'])assert(css.includes(selector),'Missing v19 interface style: '+selector);
assert(fs.existsSync(path.join(__dirname,'../site/v21.html')),'Physical uncached v20 entry missing');
assert(read('site/v21.html').includes('academy-v21.js?build='),'Unique iOS entry must load new code');
assert(js.includes("root=document.createElement('div')"),'Old HTML popup fallback missing');
assert(js.includes("s.streakModalOpen=true;"),'Daily popup must appear after every login');
assert(js.includes("data-streak-retry"),'Retry required if status fails');
assert(js.includes('width="24" height="24"'), 'SVG icons missing explicit dimensions');
assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), 'Bottom navigation must fit five icons');
assert(html.includes('id="streak-portal"')&&html.includes('data-streak-open'),'Streak mount and header button missing');
for(const token of ['data-form="profile-title"','profile-title-badge','auth-showcase','admin-overview','blender-video-step'])assert(js.includes(token),'Missing v23 feature: '+token);
console.log('App v23 Blender video learning, profile titles, admin and login tests passed');
