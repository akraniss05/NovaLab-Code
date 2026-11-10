import express from 'express';
import {Client,GatewayIntentBits,PermissionFlagsBits,ChannelType} from 'discord.js';

const env=process.env;
const required=['DISCORD_BOT_TOKEN','DISCORD_GUILD_ID','DASHBOARD_API_KEY'];
const missing=required.filter(k=>!env[k]);
if(missing.length)throw Error('Missing environment variables: '+missing.join(', '));
if(env.DASHBOARD_API_KEY.length<32)throw Error('DASHBOARD_API_KEY must have at least 32 characters.');
const client=new Client({intents:[GatewayIntentBits.Guilds]});
const app=express();
app.disable('x-powered-by');
app.use('/api',(req,res,next)=>{
 res.set('Cache-Control','no-store');
 if(req.path==='/health')return next();
 const auth=req.get('authorization');
 if(auth!==`Bearer ${env.DASHBOARD_API_KEY}`)return res.status(401).json({error:'Unauthorized'});
 next();
});
app.get('/api/health',(_req,res)=>res.status(client.isReady()?200:503).json({ready:client.isReady()}));
async function guild(){
 if(!client.isReady())throw Error('Discord gateway not ready');
 return client.guilds.fetch(env.DISCORD_GUILD_ID);
}
function route(fn){return async(req,res)=>{try{res.json(await fn());}catch(e){res.status(503).json({error:'Discord request failed',detail:e.message});}};}
app.get('/api/roles',route(async()=>{
 const g=await guild(),roles=await g.roles.fetch(),me=await g.members.fetchMe();
 return {roles:[...roles.values()].filter(r=>r.id!==g.id).sort((a,b)=>b.position-a.position).map(r=>({
 id:r.id,name:r.name,color:r.hexColor,position:r.position,managed:r.managed,
 manageable:!r.managed&&me.permissions.has(PermissionFlagsBits.ManageRoles)&&me.roles.highest.comparePositionTo(r)>0
 }))};
}));
app.get('/api/channels',route(async()=>{
 const g=await guild(),channels=await g.channels.fetch();
 return {channels:[...channels.values()].filter(Boolean).filter(c=>[
 ChannelType.GuildText,ChannelType.GuildAnnouncement,ChannelType.GuildForum,ChannelType.GuildVoice,ChannelType.GuildCategory
 ].includes(c.type)).map(c=>({id:c.id,name:c.name,type:c.type,parentId:c.parentId,
 canView:c.permissionsFor(g.members.me)?.has(PermissionFlagsBits.ViewChannel)??false,
 canSend:c.permissionsFor(g.members.me)?.has(PermissionFlagsBits.SendMessages)??false
 }))};
}));
const port=Number(env.PORT||3100);
await client.login(env.DISCORD_BOT_TOKEN);
const server=app.listen(port,env.HOST||'127.0.0.1',()=>console.log('NovaLab Control API listening'));
function stop(){server.close(()=>client.destroy());}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
