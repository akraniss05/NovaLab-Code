import express from 'express';
import {Client,GatewayIntentBits,PermissionFlagsBits,ChannelType} from 'discord.js';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {token,equal,validId,cleanText,parseCookies,cookie} from './security.mjs';
import {initStore,getStore,changeStore,logEvent} from './store.mjs';
import {publishPanel} from './panels.mjs';
import {registerInteractions} from './interactions.mjs';

const env=process.env;
const required=['DISCORD_BOT_TOKEN','DISCORD_GUILD_ID','DISCORD_CLIENT_ID','DISCORD_CLIENT_SECRET','PUBLIC_URL','SESSION_SECRET'];
const missing=required.filter(k=>!env[k]);
if(missing.length)throw Error('Missing environment variables: '+missing.join(', '));
if(env.SESSION_SECRET.length<32)throw Error('SESSION_SECRET must be at least 32 characters.');
const client=new Client({intents:[GatewayIntentBits.Guilds]});
const app=express();
const sessions=new Map();
const pending=new Map();
const base=env.PUBLIC_URL.replace(/\/$/,'');
const redirect=base+'/auth/callback';
app.disable('x-powered-by');
app.use((_req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' https://cdn.discordapp.com; base-uri 'none'; form-action 'self'"});next();});
app.use(express.json({limit:'32kb'}));
function failure(res,status,error){res.status(status).json({error});}
function requireAuth(req,res,next){
 const sid=parseCookies(req).novalab_session;
 const s=sessions.get(sid);
 if(!s||s.expires<Date.now()){if(sid)sessions.delete(sid);return failure(res,401,'Bitte mit Discord anmelden');}
 req.session=s;next();
}
function csrf(req,res,next){if(!equal(req.get('x-csrf-token'),req.session.csrf))return failure(res,403,'CSRF-Prüfung fehlgeschlagen');next();}
async function guild(){if(!client.isReady())throw Error('Discord Gateway ist nicht bereit');return client.guilds.fetch(env.DISCORD_GUILD_ID);}
function route(fn){return async(req,res)=>{try{res.json(await fn(req));}catch(e){console.error('API error:',e);failure(res,503,'Discord-Aktion fehlgeschlagen. Bitte Bot-Rechte und Server-Logs prüfen.');}};}
app.get('/api/health',(_req,res)=>res.status(client.isReady()?200:503).json({ready:client.isReady()}));
app.get('/auth/login',(req,res)=>{
 const state=token();pending.set(state,Date.now()+600000);res.set('Set-Cookie',cookie('novalab_oauth',state,600));
 const q=new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,redirect_uri:redirect,response_type:'code',scope:'identify guilds',state});
 res.redirect('https://discord.com/oauth2/authorize?'+q);
});
app.get('/auth/callback',async(req,res)=>{
 const state=String(req.query.state||'');
 const expiry=pending.get(state);pending.delete(state);const cookieState=parseCookies(req).novalab_oauth;res.set('Set-Cookie',cookie('novalab_oauth','',0));
 if(!expiry||expiry<Date.now()||!equal(cookieState,state)||typeof req.query.code!=='string')return res.status(400).send('Ungültige oder abgelaufene Anmeldung');
 try{
 const body=new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,client_secret:env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code:req.query.code,redirect_uri:redirect});
 const t=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
 if(!t.ok)throw Error('OAuth-Token konnte nicht ausgetauscht werden');
 const data=await t.json();
 const headers={Authorization:'Bearer '+data.access_token};
 const [userRes,guildRes]=await Promise.all([fetch('https://discord.com/api/v10/users/@me',{headers}),fetch('https://discord.com/api/v10/users/@me/guilds',{headers})]);
 if(!userRes.ok||!guildRes.ok)throw Error('Discord-Benutzerdaten konnten nicht geladen werden');
 const user=await userRes.json(),guilds=await guildRes.json();
 const target=guilds.find(g=>g.id===env.DISCORD_GUILD_ID);
 const perms=BigInt(target?.permissions||0);
 const admin=(perms&PermissionFlagsBits.Administrator)!==0n||(perms&PermissionFlagsBits.ManageGuild)!==0n;
 if(!target||!admin)return res.status(403).send('Keine Berechtigung für diesen Discord-Server');
 await guild();
 const sid=token(),csrfToken=token();
 sessions.set(sid,{user:{id:user.id,username:user.global_name||user.username,avatar:user.avatar},csrf:csrfToken,expires:Date.now()+8*3600000});
 res.set('Set-Cookie',cookie('novalab_session',sid,8*3600));res.redirect('/');
 }catch(e){console.error('OAuth error',e);res.status(502).send('Discord-Anmeldung fehlgeschlagen');}
});
app.post('/auth/logout',requireAuth,csrf,(req,res)=>{
 const sid=parseCookies(req).novalab_session;sessions.delete(sid);
 res.set('Set-Cookie',cookie('novalab_session','',0));res.json({ok:true});
});
app.get('/api/session',(req,res)=>{
 const sid=parseCookies(req).novalab_session,s=sessions.get(sid);
 if(!s||s.expires<Date.now())return res.json({authenticated:false});
 res.json({authenticated:true,user:s.user,csrf:s.csrf,guildId:env.DISCORD_GUILD_ID});
});
app.use('/api',requireAuth);
app.get('/api/overview',route(async()=>{const g=await guild(),s=getStore();return {guild:{id:g.id,name:g.name,memberCount:g.memberCount,icon:g.iconURL()},panels:s.panels,events:s.events.slice(0,25),settings:s.settings};}));
app.get('/api/roles',route(async()=>{
 const g=await guild(),roles=await g.roles.fetch(),me=await g.members.fetchMe();
 return {roles:[...roles.values()].filter(r=>r.id!==g.id).sort((a,b)=>b.position-a.position).map(r=>({
 id:r.id,name:r.name,color:r.hexColor,position:r.position,managed:r.managed,
 manageable:!r.managed&&me.permissions.has(PermissionFlagsBits.ManageRoles)&&me.roles.highest.comparePositionTo(r)>0
 }))};
}));
app.get('/api/channels',route(async()=>{
 const g=await guild(),channels=await g.channels.fetch(),me=await g.members.fetchMe();
 return {channels:[...channels.values()].filter(Boolean).filter(c=>[
 ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildForum,ChannelType.GuildVoice,ChannelType.GuildCategory
 ].includes(c.type)).map(c=>({id:c.id,name:c.name,type:c.type,parentId:c.parentId,parentName:c.parent?.name||'Ohne Kategorie',
 canView:c.permissionsFor(me)?.has(PermissionFlagsBits.ViewChannel)??false,
 canSend:typeof c.send==='function'&&Boolean(c.permissionsFor(me)?.has([PermissionFlagsBits.SendMessages,PermissionFlagsBits.EmbedLinks]))
 }))};
}));
app.post('/api/panels',csrf,route(async req=>{
 const g=await guild(),panel=await publishPanel(g,req.body);
 await changeStore(s=>{s.panels.unshift(panel);logEvent(s,'panel.publish',panel.title+' in '+panel.channelId+' von '+req.session.user.id);});
 return {panel};
}));
app.get('/api/settings',(_req,res)=>res.json({settings:getStore().settings}));
app.put('/api/settings',csrf,route(async req=>{
 const incoming=req.body;
 if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw Error('Ungültige Einstellungen');
 const allowed=['welcome','goodbye'];
 const settings=await changeStore(s=>{
 for(const k of allowed)if(incoming[k]!==undefined){
 const v=incoming[k];
 if(!v||typeof v!=='object')throw Error('Ungültige '+k+'-Einstellung');
 if(v.enabled&&!validId(v.channelId))throw Error('Bitte Kanal für '+k+' auswählen');
 s.settings[k]={enabled:Boolean(v.enabled),channelId:validId(v.channelId)?v.channelId:'',message:cleanText(v.message,500)||'Willkommen {user}!'};
 }
 logEvent(s,'settings.update','Aktualisiert von '+req.session.user.id);
 return s.settings;
 });
 return {settings};
}));
const staticDir=join(dirname(fileURLToPath(import.meta.url)),'../public');
app.use(express.static(staticDir,{index:'index.html',maxAge:0}));
app.use((err,_req,res,_next)=>{console.error(err);failure(res,400,'Ungültige Anfrage');});
await initStore();
registerInteractions(client);
await client.login(env.DISCORD_BOT_TOKEN);
const port=Number(env.PORT||3100);
const server=app.listen(port,env.HOST||'127.0.0.1',()=>console.log('NovaLab Control V2 ready on port '+port));
function stop(){server.close(()=>client.destroy());}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
