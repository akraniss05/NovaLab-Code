/* LiveryLab Academy v10 smoke checks */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=(f)=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const html=read('site/index.html'),js=read('site/academy.js'),config=read('site/config.js'),mfa=read('site/auth-mfa-v5.js');
for(const f of ['site/styles.css','site/config.js','site/auth-mfa-v5.js','site/academy.js','site/privacy.html','site/manifest.webmanifest','site/icon.svg'])if(!fs.existsSync(path.join(__dirname,'..',f)))throw Error('Missing '+f);
for(const f of ['academy.js','auth-mfa-v5.js','config.js','styles.css'])if(!html.includes(f))throw Error('Unlinked asset '+f);
for(const x of ['createUsername','resetUsernamePassword','finishPasswordChange','discord.gg/livery-lab','nyxatheris','ll_lesson_content','ll_lesson_index','ll_courses','academy_plans','video-check','data-admin-tier','Free','Plus','Pro','LiveryLab Studios'])if(!js.includes(x))throw Error('Missing feature '+x);
for(const x of ['Music Lab','Video Lab','Code Lab','Designer Lab','video-lab-v5.js','music-studio.js','code-studio.js','studio3d-v5.js'])if(html.includes(x))throw Error('Removed studio is still linked: '+x);
if(!/sb_publishable_/.test(config))throw Error('Missing publishable key');
if(/sb_secret_|service_role\s*[:=]/.test(config))throw Error('Secret in client config');
if(!mfa.includes('mfa.challenge')||!mfa.includes('mfa.verify'))throw Error('TOTP missing');
console.log('Academy v10 smoke checks passed');
