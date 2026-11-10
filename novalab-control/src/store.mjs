import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const path=process.env.DATA_FILE||'./data/control.json';
const empty=()=>({panels:[],tickets:[],applications:[],events:[],settings:{welcome:{enabled:false,channelId:'',message:'Willkommen {user}!'},goodbye:{enabled:false,channelId:'',message:'Auf Wiedersehen, {user}!'},autoroleIds:[]}});
let state=empty();let pending=Promise.resolve();
export async function initStore(){try{const data=JSON.parse(await readFile(path,'utf8'));state={...empty(),...data,settings:{...empty().settings,...data.settings}};}catch(e){if(e.code!=='ENOENT')throw e;}}
export function getStore(){return structuredClone(state);}
export function changeStore(fn){const work=pending.catch(()=>{}).then(async()=>{const next=structuredClone(state);const result=await fn(next);await mkdir(dirname(path),{recursive:true});const tmp=path+'.tmp';await writeFile(tmp,JSON.stringify(next,null,2),{mode:0o600});await rename(tmp,path);state=next;return result;});pending=work.catch(()=>{});return work;}
export function logEvent(s,type,detail){s.events.unshift({id:crypto.randomUUID(),type,detail,at:new Date().toISOString()});s.events=s.events.slice(0,300);}
