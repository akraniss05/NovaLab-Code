/* LiveryLab Academy v11 – source and security smoke test */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const html=read('site/index.html'),js=read('site/academy.js'),css=read('site/refined.css');
for(const file of ['site/styles.css','site/refined.css','site/config.js','site/auth-mfa-v5.js','site/academy.js','site/privacy.html','site/manifest.webmanifest','site/icon.svg','supabase/functions/academy-signin/index.ts','supabase/functions/admin-users/index.ts'])
 assert(fs.existsSync(path.join(__dirname,'..',file)),file+' missing');
for(const tag of ['academy.js','auth-mfa-v5.js','config.js','styles.css','refined.css'])assert(html.includes(tag),tag+' not linked');
for(const token of ['academy-signin','academy_set_username','data-form="create-email"','data-action="complete-practice"','data-action="load-video"','data-action="reset-progress"','data-action="more-courses"','settings-toggle','practice-input','s.catalogLimit','saveDraft','practiced','is-complete','syncBackdrop','Free','Plus','Pro','LiveryLab Studios']){
 assert(js.includes(token),token+' missing');
}
for(const stale of ['Music Lab','Video Lab','Designer Lab','Studio-Editor','Videoeditor','Musikproduktion','Code Lab','music-studio.js','studio3d-v5.js'])
 assert(!js.toLowerCase().includes(stale.toLowerCase()),'Removed feature found: '+stale);
assert(!/sb_secret_|SUPABASE_SERVICE_ROLE_KEY\s*[:=]/.test(read('site/config.js')),'Secret in client configuration');
assert(/sb_publishable_/.test(read('site/config.js')),'Publishable key missing');
assert(read('site/auth-mfa-v5.js').includes('mfa.challenge')&&read('site/auth-mfa-v5.js').includes('mfa.verify'),'TOTP verification missing');
assert(css.includes('.lesson-card.is-complete')&&css.includes('background:linear-gradient(105deg,#13392e'),'Completion cards must use green background');
assert(css.includes('@media(max-width:570px)')&&css.includes('.topbar'),'Responsive mobile styling missing');
assert(!html.includes('music-studio'),'Legacy studio script still linked');
new Function(js);
console.log('Source, course flow, mobile styling and Supabase auth checks passed');
