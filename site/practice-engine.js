/* Static lesson checker. Learner code is parsed, never executed. */
(function(root){
'use strict';
const INVALID=Symbol('unknown');
function clean(s){return String(s||'').replace(/\r/g,'').trim()}
function significant(s,lang){return clean(s).split('\n').map(x=>x.trim()).filter(x=>x&&!x.startsWith(lang==='lua'?'--':lang==='python'?'#':'//')).join('\n')}
function syntax(code,lang){
 const stack=[],pairs={')':'(',']':'[','}':'{'},open='([{',close=')]}';let quote='',escaped=false,line=1;
 for(let i=0;i<code.length;i++){const ch=code[i];if(ch==='\n')line++;
  if(quote){if(escaped){escaped=false;continue}if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if((lang==='lua'&&code.slice(i,i+2)==='--')||(lang==='python'&&ch==='#')||(lang!=='lua'&&lang!=='python'&&code.slice(i,i+2)==='//')){i=code.indexOf('\n',i);if(i<0)break;i--;continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(open.includes(ch))stack.push({ch,line});else if(close.includes(ch)){const item=stack.pop();if(!item||item.ch!==pairs[ch])return 'Zeile '+line+': Klammer '+ch+' passt nicht.'}
 }
 if(quote)return 'Zeile '+line+': Zeichenkette ist nicht geschlossen.';
 if(stack.length)return 'Zeile '+stack.at(-1).line+': Klammer '+stack.at(-1).ch+' ist nicht geschlossen.';
 if(lang==='javascript'){try{new Function(code)}catch(e){return 'JavaScript-Syntax: '+e.message}}
 if(lang==='lua'){const starts=(code.match(/\b(function|if|for|while|repeat)\b/g)||[]).length,ends=(code.match(/\bend\b/g)||[]).length;if(ends>starts)return 'Lua-Syntax: unerwartetes end.'}
 return '';
}
function splitArgs(source){const pieces=[];let start=0,depth=0,quote='',escaped=false;
 for(let i=0;i<source.length;i++){const c=source[i];if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue}
  if(c==='"'||c==="'"){quote=c;continue}if(c==='(')depth++;else if(c===')')depth--;else if(c===','&&depth===0){pieces.push(source.slice(start,i).trim());start=i+1}}
 pieces.push(source.slice(start).trim());return pieces}
function valueType(value){return value===null?'nil':typeof value==='number'?'number':typeof value==='boolean'?'boolean':'string'}
function expression(raw,vars){const text=raw.trim();if(!text)return INVALID;
 if((text[0]==='"'||text[0]==="'")&&text.at(-1)===text[0])return text.slice(1,-1).replace(/\\n/g,'\n').replace(/\\(["'\\])/g,'$1');
 if(/^-?\d+(?:\.\d+)?$/.test(text))return Number(text);
 if(text==='true')return true;if(text==='false')return false;if(['nil','None','null'].includes(text))return null;
 if(Object.prototype.hasOwnProperty.call(vars,text))return vars[text];
 const fn=text.match(/^(type|tonumber|tostring)\s*\((.*)\)$/);
 if(fn){const val=expression(fn[2],vars);if(val===INVALID)return INVALID;
  if(fn[1]==='type')return valueType(val);if(fn[1]==='tostring')return val===null?'nil':String(val);
  const n=Number(val);return val===null||val===''||!Number.isFinite(n)?null:n}
 const op=text.match(/^(.+?)\s*([+\-*\/])\s*(.+)$/);
 if(op){const a=expression(op[1],vars),b=expression(op[3],vars);if(typeof a!=='number'||typeof b!=='number')return INVALID;
  return op[2]==='+'?a+b:op[2]==='-'?a-b:op[2]==='*'?a*b:b===0?INVALID:a/b}
 return INVALID}
function output(code,lang){const vars=Object.create(null),lines=[];let supported=true,error='';
 const print=lang==='lua'||lang==='python'?/^print\s*\((.*)\)\s*;?$/:/^(?:console\.log|alert)\s*\((.*)\)\s*;?$/;
 for(const raw of String(code||'').split('\n')){let line=raw.trim();if(!line||/^(--|#|\/\/)/.test(line))continue;
  const inline=lang==='lua'&&line.match(/^if\s+([\w$]+)\s+then\s+(.+?)\s+end\s*$/);
  if(inline){if(!Object.prototype.hasOwnProperty.call(vars,inline[1])){supported=false;error='Die Variable „'+inline[1]+'“ ist nicht definiert.';break}if(vars[inline[1]]===false||vars[inline[1]]===null)continue;line=inline[2]}
  const assign=line.match(/^(?:(?:local|let|const|var)\s+)?([a-zA-Z_$][\w$]*)\s*=\s*(.+?)\s*;?$/);
  if(assign){const val=expression(assign[2].replace(/;$/,''),vars);if(val===INVALID){supported=false;error='Der Wert für „'+assign[1]+'“ kann hier nicht berechnet werden.';break}vars[assign[1]]=val;continue}
  const match=line.match(print);if(match){const vals=splitArgs(match[1]).map(x=>expression(x,vars));if(vals.includes(INVALID)){supported=false;error='Ein Ausdruck ist unbekannt oder eine Variable wurde nicht definiert.';break}lines.push(vals.map(x=>x===null?'nil':String(x)).join('\t'));continue}
  supported=false;error='Diese Anweisung kann die Browser-Konsole noch nicht ausführen.';break}
 return {lines,supported,error}}
function matches(code,rule){try{return new RegExp(rule,'im').test(code)}catch(_){return code.includes(rule)}}
function describe(rule){let m=rule.match(/local\\s\+([a-zA-Z_]\w*)/);if(m)return 'lokale Variable „'+m[1]+'“';
 if(/tonumber/.test(rule))return 'tonumber(…)';if(/tostring/.test(rule))return 'tostring(…)';if(/type/.test(rule))return 'type(…)';if(/print/.test(rule))return 'print(…) wie in der Aufgabe';if(/\\\+/.test(rule))return 'Addition wie in der Aufgabe';return 'ein geforderter Schritt'}
function tokens(s){return new Set(String(s||'').match(/[a-zA-Z_$][\w$]*|\d+|["'][^"']*["']/g)||[])}
function evaluate(source,payload){const code=clean(source),lang=String(payload.lang||'').toLowerCase(),solution=significant(payload.solution||payload.example||'',lang),candidate=significant(code,lang);
 if(!code)return {ok:false,diagnostic:'Schreibe zuerst deine Lösung.',output:[]};
 const error=syntax(code,lang);if(error)return {ok:false,diagnostic:error,output:[]};
 const required=(Array.isArray(payload.checks)?payload.checks:[]).filter(x=>typeof x==='string'&&x.trim());
 const missing=required.filter(x=>!matches(x.startsWith('--')?code:candidate,x)),out=output(code,lang),expected=output(solution,lang);
 if(missing.length)return {ok:false,diagnostic:'Prüfe diese Schritte: '+missing.slice(0,3).map(describe).join(', ')+'.',output:out.lines};
 if(['lua','javascript','python'].includes(lang)&&expected.supported&&expected.lines.length&&out.supported){
  const personal=/eigenen Namen/i.test(payload.task||''),variable=/Ändere anschließend mindestens einen Wert/i.test(payload.task||'');
  const matched=personal?out.lines.length===expected.lines.length&&out.lines[0].trim()!==''&&out.lines.slice(1).every((v,i)=>v===expected.lines[i+1]):
   variable?out.lines.length===expected.lines.length&&out.lines.every(Boolean):JSON.stringify(out.lines)===JSON.stringify(expected.lines);
  return {ok:matched,diagnostic:matched?'Die geforderten Schritte und die Ausgabe stimmen.':'Die Ausgabe passt noch nicht zur Aufgabe. Erwartet: '+expected.lines.join(' · ')+'.',output:out.lines}}
 if(!out.supported&&out.error&&candidate!==solution)return {ok:false,diagnostic:out.error,output:out.lines};
 if(candidate===solution&&solution)return {ok:true,diagnostic:'Dein Code entspricht der Musterlösung.',output:out.lines};
 const expectedTokens=tokens(solution),actualTokens=tokens(candidate),omitted=[...expectedTokens].filter(t=>!actualTokens.has(t));
 return {ok:false,diagnostic:!solution?'Für diese Aufgabe ist noch keine automatische Prüfung hinterlegt.':omitted.length?'Prüfe deinen Lösungsweg und vergleiche ihn mit dem Tipp.':'Diese Variante kann der Browser noch nicht sicher prüfen. Vergleiche sie mit der Lösung oder melde sie dem Support.',output:out.lines}}
root.LLPractice={evaluate,syntax,output};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
