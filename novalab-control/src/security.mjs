import {randomBytes,timingSafeEqual,createHash} from 'node:crypto';
export const token=()=>randomBytes(32).toString('hex');
export function equal(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);}
export function validId(id){return typeof id==='string'&&/^\d{17,20}$/.test(id);}
export function cleanText(v,max=1000){return typeof v==='string'?v.trim().slice(0,max):'';}
export function hash(v){return createHash('sha256').update(v).digest('hex');}
export function parseCookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=').map(decodeURIComponent)).filter(p=>p.length===2));}
export function cookie(name,value,age){return name+'='+encodeURIComponent(value)+'; HttpOnly; SameSite=Lax; Path=/; Max-Age='+age+(process.env.NODE_ENV==='production'?'; Secure':'');}
