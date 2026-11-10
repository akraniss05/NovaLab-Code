'use strict';
const {app,BrowserWindow,protocol,session,shell}=require('electron');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createReadStream}=require('node:fs');
const {Readable}=require('node:stream');
const ROOT=()=>app.isPackaged?path.join(process.resourcesPath,'site'):path.join(__dirname,'..','site');
const SCHEME='novalab-code';
const HOST='app';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json',
 '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg',
 '.jpeg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff',
 '.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg',
 '.wav':'audio/wav','.wasm':'application/wasm'};
protocol.registerSchemesAsPrivileged([{
 scheme:SCHEME,privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}
}]);
app.setAppUserModelId('com.novalabstudios.code');
async function handleLocal(request){
 try{
  const u=new URL(request.url);
  if(u.protocol!==SCHEME+':'||u.hostname!==HOST)return new Response('Not found',{status:404});
  const raw=decodeURIComponent(u.pathname);
  if(raw.includes('\\')||raw.includes('\0'))return new Response('Forbidden',{status:403});
  const segments=raw.split('/').filter(Boolean);
  if(segments.some(x=>x==='.'||x==='..'))return new Response('Forbidden',{status:403});
  const root=await fs.realpath(ROOT()),requested=path.resolve(root,...segments);
  if(!requested.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
  const real=await fs.realpath(requested);
  if(!real.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
  const stat=await fs.stat(real);
  if(!stat.isFile()||stat.size>30*1024*1024)return new Response('Unsupported',{status:413});
  const ext=path.extname(real).toLowerCase();
  if(!MIME[ext])return new Response('Unsupported media',{status:415});
  if(ext==='.html' && path.basename(real)==='index.html') {
    const original=await fs.readFile(real,'utf8');
    const patched=original.replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js','./vendor/supabase.min.js');
    return new Response(patched,{status:200,headers:{'content-type':MIME[ext],'x-content-type-options':'nosniff','cache-control':'no-store'}});
  }
  const stream=Readable.toWeb(createReadStream(real));
  return new Response(stream,{status:200,headers:{'content-type':MIME[ext],'x-content-type-options':'nosniff','cache-control':'no-store'}});
 }catch{return new Response('Resource not found',{status:404});}
}
function allowedExternal(value){
 try{const u=new URL(value);return u.protocol==='https:'&& !u.username && !u.password &&
  ['liverylab-academy.dev','akraniss05.github.io','discord.gg','github.com','youtube.com','www.youtube.com','youtu.be','supabase.com','openai.com'].includes(u.hostname);
 }catch{return false;}
}
function createWindow(){
 const win=new BrowserWindow({title:'NovaLab Code',width:1360,height:900,minWidth:900,minHeight:640,
  backgroundColor:'#0c0a1c',autoHideMenuBar:true,show:false,
  webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,webSecurity:true,
    partition:'persist:novalab-code',devTools:!app.isPackaged}
 });
 win.webContents.setWindowOpenHandler(({url})=>{
  if(allowedExternal(url))shell.openExternal(url).catch(()=>{});
  return{action:'deny'};
 });
 win.webContents.on('will-navigate',(event,url)=>{
  if(!url.startsWith(SCHEME+'://'+HOST+'/')){event.preventDefault();if(allowedExternal(url))shell.openExternal(url).catch(()=>{});}
 });
 win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 win.webContents.on('did-fail-load',(_event,code,desc,url,isMain)=>{
   if(isMain)console.error('NovaLab Code window load failed',code,desc,url);
 });
 win.once('ready-to-show',()=>win.show());
 win.loadURL(SCHEME+'://'+HOST+'/index.html').catch(e=>{console.error('Load failed:',e.message);win.show();});
 return win;
}
app.whenReady().then(()=>{
 const s=session.fromPartition('persist:novalab-code');
 s.protocol.handle(SCHEME,handleLocal);
 createWindow();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
