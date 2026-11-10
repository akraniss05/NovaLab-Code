import {writeFileSync} from 'node:fs';
const {CONTROL_URL,CONTROL_GUILD}=process.env;
if(!CONTROL_URL&&!CONTROL_GUILD)process.exit(0);
if(!CONTROL_URL||!/^\d{17,20}$/.test(CONTROL_GUILD??''))throw Error('Set both NovaLab Control Pages variables');
const url=new URL(CONTROL_URL);
if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('Control URL must be an HTTPS origin');
writeFileSync('site/novalab-control-config.js','window.NOVALAB_CONTROL = '+JSON.stringify({origin:url.origin,guildId:CONTROL_GUILD})+';\n');
