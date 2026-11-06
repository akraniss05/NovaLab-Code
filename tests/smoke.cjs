/* LiveryLab Academy v10 – learning and login smoke tests */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=(f)=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const html=read('site/index.html'),js=read('site/academy.js'),config=read('site/config.js'),mfa=read('site/auth-mfa-v5.js');
for(const file of ['site/styles.css','site/config.js','site/auth-mfa-v5.js','site/academy.js','site/privacy.html','site/manifest.webmanifest','site/icon.svg','supabase/functions/academy-signin/index.ts','supabase/functions/admin-users/index.ts']){
 if(!fs.existsSync(path.join(__dirname,'..',file)))throw Error('Missing '+file);
}
for(const name of ['academy.js','auth-mfa-v5.js','config.js','styles.css'])if(!html.includes(name))throw Error('Unlinked asset '+name);
for(const term of ['createUsername','createEmail','resetUsernamePassword','finishPasswordChange','discord.gg/livery-lab','nyxatheris','ll_lesson_content','ll_lesson_index','ll_courses','academy_plans','video-check','data-admin-tier','Free','Plus','Pro','LiveryLab Studios','set-username','academy_set_username','academy-signin','api.auth.setSession','api.auth.signInWithPassword','data-form="create-email"']){
 if(!js.includes(term))throw Error('Missing feature '+term);
}
for(const term of ['Music Lab','Video Lab','Code Lab','Designer Lab','video-lab-v5.js','music-studio.js','code-studio.js','studio3d-v5.js'])if(html.includes(term))throw Error('Removed studio is still linked: '+term);
if(!/sb_publishable_/.test(config)||/sb_secret_|service_role\s*[:=]/.test(config))throw Error('Invalid public Supabase config');
if(!mfa.includes('mfa.challenge')||!mfa.includes('mfa.verify'))throw Error('TOTP missing');
const signin=read('supabase/functions/academy-signin/index.ts');
if(!signin.includes("verify_jwt=false")||!signin.includes('auth.signInWithPassword')||!signin.includes('getUserById'))throw Error('Server-side username login missing');
const admin=read('supabase/functions/admin-users/index.ts');
if(!admin.includes("body.action==='createEmail'")||!admin.includes("body.action==='createUsername'"))throw Error('Admin account modes missing');
console.log('LiveryLab Academy login and course smoke checks passed');
