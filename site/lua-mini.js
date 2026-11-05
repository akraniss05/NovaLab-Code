
/* LiveryLab Academy mini runner: a deliberately limited browser-side Lua subset.
   It is NOT the CfxLua runtime; FiveM functions require an actual test server.
   Each execution happens in a disposable Web Worker with a short timeout. */
(function(){
  'use strict';
  function decomment(s){
    let out='',q=null,escaped=false;
    for(let i=0;i<s.length;i++){
      let ch=s[i];
      if(q){out+=ch;if(ch===q&&!escaped)q=null;if(ch==='\\'&&!escaped)escaped=true;else escaped=false;continue;}
      if(ch==='"'||ch==="'"){q=ch;out+=ch;continue;}
      if(ch==='-'&&s[i+1]==='-')break;
      out+=ch;
    }
    return out.trim();
  }
  function expr(x){
    x=x.replace(/\bnot\b/g,'!').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||')
      .replace(/\bnil\b/g,'null').replace(/~=/g,'!==').replace(/\.\./g,' + ')
      .replace(/\bmath\.floor\b/g,'Math.floor').replace(/\bmath\.ceil\b/g,'Math.ceil')
      .replace(/\bmath\.abs\b/g,'Math.abs').replace(/\bmath\.max\b/g,'Math.max')
      .replace(/\bmath\.min\b/g,'Math.min').replace(/\bmath\.random\b/g,'Math.random')
      .replace(/\btable\.insert\b/g,'tableInsert').replace(/\bstring\.upper\b/g,'stringUpper')
      .replace(/\bstring\.lower\b/g,'stringLower').replace(/\btonumber\b/g,'Number');
    // Basic array / object literals; nested tables need full Lua outside this mini runner.
    x=x.replace(/\{([^{}]*)\}/g,(_m,c)=>{
      if(/\b[a-zA-Z_][\w]*\s*=/.test(c))return '({'+c.replace(/([,{]\s*|^\s*)([\w]+)\s*=/g,'$1$2:')+'})';
      return '['+c+']';
    });
    return x;
  }
  function preprocess(code){
    let source=code.replace(/\r\n?/g,'\n').replace(/\t/g,'  ');
    // Allow simple single-line if / function blocks in beginner examples.
    source=source.replace(/\bthen\s+([^\n]+?)\s+end\b/g,'then\n$1\nend');
    let lines=source.split('\n'), output=[], depth=0;
    for(let i=0;i<lines.length;i++){
      const raw=decomment(lines[i]);if(!raw)continue;
      let match;
      if((match=raw.match(/^if\s+(.+)\s+then$/))){output.push('if ('+expr(match[1])+') {');depth++;}
      else if((match=raw.match(/^elseif\s+(.+)\s+then$/))){if(!depth)throw Error('elseif ohne if in Zeile '+(i+1));output.push('} else if ('+expr(match[1])+') {');}
      else if(/^else$/.test(raw)){if(!depth)throw Error('else ohne if');output.push('} else {');}
      else if(raw==='end'){if(!depth)throw Error('end ohne zugehörigen Block');output.push('}');depth--;}
      else if((match=raw.match(/^(?:local\s+)?function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*$/))){output.push('function '+match[1]+'('+match[2]+'){');depth++;}
      else if((match=raw.match(/^for\s+(\w+)\s*=\s*([^,]+),\s*([^,]+)(?:,\s*(.+))?\s+do$/))){let v=match[1],step=match[4]||'1';output.push('for (let '+v+'=('+expr(match[2])+'), __e'+i+'=('+expr(match[3])+'), __s'+i+'=('+expr(step)+');(__s'+i+'>=0?'+v+'<=__e'+i+':'+v+'>=__e'+i+');'+v+'+=__s'+i+') { __guard();');depth++;}
      else if((match=raw.match(/^for\s+([\w_,\s]+)\s+in\s+(ipairs|pairs)\s*\((.+)\)\s+do$/))){output.push('for (let ['+match[1]+'] of '+match[2]+'('+expr(match[3])+')) { __guard();');depth++;}
      else if((match=raw.match(/^while\s+(.+)\s+do$/))){output.push('while ('+expr(match[1])+') { __guard();');depth++;}
      else if(raw==='break'){output.push('break;');}
      else if((match=raw.match(/^return(?:\s+(.+))?$/))){output.push('return '+(match[1]?expr(match[1]):'')+';');}
      else if((match=raw.match(/^local\s+([a-zA-Z_]\w*)(?:\s*=\s*(.+))?$/))){output.push('let '+match[1]+' = '+(match[2]?expr(match[2]):'null')+';');}
      else if((match=raw.match(/^([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*|\[[^\]]+\])*)\s*=\s*(.+)$/))){output.push(match[1]+' = '+expr(match[2])+';');}
      else if(/^[a-zA-Z_]\w*(?:\.\w*)?\s*\(.*\)\s*;?$/.test(raw)){output.push(expr(raw).replace(/;?$/,';'));}
      else throw Error('Mini-Runner kennt diese Lua-Syntax in Zeile '+(i+1)+' noch nicht: '+raw.slice(0,60));
    }
    if(depth!==0)throw Error('Ein Block ist offen. Fehlt ein end?');
    return output.join('\n');
  }
  function run(code,ms=1500){
    return new Promise(resolve=>{
      let compiled;
      try{compiled=preprocess(code);}catch(err){resolve({ok:false,output:'',error:String(err.message)});return;}
      const workerCode=`'use strict'; self.onmessage=function(ev){
        let logs=[], count=0;const __guard=()=>{if(++count>15000)throw Error('Zu viele Schleifendurchläufe');};
        const print=(...args)=>{if(logs.length<100)logs.push(args.map(a=>a==null?'nil':typeof a==='object'?JSON.stringify(a):String(a)).join('\\t'));};
        const ipairs=(x)=>Array.isArray(x)?x.map((v,i)=>[i+1,v]):[];
        const pairs=(x)=>Object.entries(x).map(([k,v])=>[k,v]);
        const tostring=(x)=>String(x), type=(x)=>x===null?'nil':Array.isArray(x)?'table':typeof x==='object'?'table':typeof x==='number'?'number':typeof x==='boolean'?'boolean':'string';
        const tableInsert=(a,v)=>a.push(v), stringUpper=(x)=>String(x).toUpperCase(), stringLower=(x)=>String(x).toLowerCase();
        try{const f=new Function('print','ipairs','pairs','tostring','type','tableInsert','stringUpper','stringLower','__guard', ev.data);f(print,ipairs,pairs,tostring,type,tableInsert,stringUpper,stringLower,__guard); self.postMessage({ok:true,output:logs.length?logs.join('\\n'):'(Keine print-Ausgabe)'});}catch(e){self.postMessage({ok:false,output:logs.join('\\n'),error:String(e.message||e)});}
      }`;
      let worker,url,finished=false;
      try{url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'}));worker=new Worker(url);}
      catch(_e){resolve({ok:false,error:'Browser blockiert den Mini-Runner. Nutze den Strukturcheck oder starte die App über localhost.',output:''});return;}
      const done=(v)=>{if(finished)return;finished=true;clearTimeout(t);worker.terminate();URL.revokeObjectURL(url);resolve(v);};
      const t=setTimeout(()=>done({ok:false,output:'',error:'Test gestoppt: Ausführungslimit erreicht.'}),ms);
      worker.onmessage=e=>done(e.data);worker.onerror=e=>done({ok:false,output:'',error:e.message||'JavaScript-Mini-Runnerfehler'});
      worker.postMessage(compiled);
    });
  }
  window.LLMini={run,preprocess};
})();

