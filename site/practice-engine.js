/* LiveryLab practice evaluator. Deliberately does not execute arbitrary learner code. */
(function(root){
'use strict';
function clean(s){return String(s||'').replace(/\r/g,'').trim()}
function significant(s,lang){return clean(s).split('\n').map(x=>x.trim()).filter(x=>x&&!x.startsWith(lang==='lua'?'--':lang==='python'?'#':'//')).join('\n')}
function syntax(code,lang){
 const stack=[],pairs={')':'(',']':'[','}':'{'},open='([{',close=')]}';let quote='',escaped=false,line=1;
 for(let i=0;i<code.length;i++){const ch=code[i];if(ch==='\n')line++;
  if(quote){if(escaped){escaped=false;continue}if(ch==='\\'){escaped=true;continue}if(ch===quote)quote='';continue}
  if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue}
  if(open.includes(ch))stack.push({ch,line});else if(close.includes(ch)){const item=stack.pop();if(!item||item.ch!==pairs[ch])return 'Zeile '+line+': Klammer '+ch+' passt nicht.'}
 }
 if(quote)return 'Zeile '+line+': Zeichenkette ist nicht geschlossen.';
 if(stack.length)return 'Zeile '+stack.at(-1).line+': Klammer '+stack.at(-1).ch+' ist nicht geschlossen.';
 if(lang==='javascript'||lang==='typescript'||lang==='jsx'){try{if(lang==='javascript')new Function(code)}catch(e){return 'JavaScript-Syntax: '+e.message}}
 if(lang==='lua'){
  const starts=(code.match(/\b(function|if|for|while|do|repeat)\b/g)||[]).length;
  const ends=(code.match(/\bend\b/g)||[]).length;
  if(ends>starts)return 'Lua-Syntax: unerwartetes end.';
 }
 return '';
}
function displayValue(v){return String(v).replace(/^["']|["']$/g,'')}
function output(code,lang){
 const values={},lines=[];let supported=true;
 const pattern=lang==='lua'?/^print\s*\((.*)\)\s*;?$/:lang==='python'?/^print\s*\((.*)\)\s*$/:/^(?:console\.log|alert)\s*\((.*)\)\s*;?$/;
 for(const raw of code.split('\n')){const line=raw.trim();if(!line||/^(--|#|\/\/)/.test(line))continue;
  const assign=line.match(/^(?:local |let |const |var )?([a-zA-Z_$][\w$]*)\s*=\s*(.+?)\s*;?$/);
  if(assign){values[assign[1]]=assign[2].replace(/;$/,'');continue}
  const match=line.match(pattern);if(match){const arg=match[1].trim();if(/^["'][^"']*["']$/.test(arg))lines.push(displayValue(arg));else if(/^[\w$]+$/.test(arg)&&Object.hasOwn(values,arg))lines.push(displayValue(values[arg]));else if(/^-?\d+(?:\.\d+)?$/.test(arg))lines.push(arg);else supported=false;continue}
  supported=false;
 }
 return {lines,supported};
}
function tokens(s){return new Set(String(s||'').match(/[a-zA-Z_$][\w$]*|\d+|["'][^"']*["']/g)||[])}
function evaluate(source,payload){const code=clean(source),lang=String(payload.lang||'').toLowerCase(),solution=significant(payload.solution||payload.example||'',lang),candidate=significant(code,lang);
 if(!code)return {ok:false,diagnostic:'Schreibe zuerst deine Lösung.',output:[]};
 const error=syntax(code,lang);if(error)return {ok:false,diagnostic:error,output:[]};
 const required=(Array.isArray(payload.checks)?payload.checks:[]).filter(x=>typeof x==='string'&&x.trim());
 const missing=required.filter(x=>!code.toLowerCase().includes(x.toLowerCase()));
 if(missing.length)return {ok:false,diagnostic:'In deiner Lösung fehlt: '+missing.slice(0,3).join(', ')+'.',output:output(code,lang).lines};
 const out=output(code,lang),expected=output(solution,lang);
 if(['lua','javascript','python'].includes(lang)&&expected.supported&&expected.lines.length&&out.supported){
  if(JSON.stringify(out.lines)!==JSON.stringify(expected.lines))return {ok:false,diagnostic:'Die Ausgabe stimmt noch nicht mit dem Ziel überein. Prüfe Werte und Reihenfolge.',output:out.lines};
  return {ok:true,diagnostic:'Ausgabe und Aufgabenkriterien stimmen.',output:out.lines};
 }
 // For other constructs, require the complete reference semantics. This avoids
 // accepting arbitrary keyword-filled text as a solution.
 const expectedTokens=tokens(solution),actualTokens=tokens(candidate);
 const omitted=[...expectedTokens].filter(t=>!actualTokens.has(t));
 if(!solution||omitted.length)return {ok:false,diagnostic:solution?'Noch nicht vollständig. Prüfe besonders: '+omitted.slice(0,4).join(', ')+'.':'Für diese Aufgabe ist keine automatische Prüfung hinterlegt.',output:out.lines};
 if(candidate===solution)return {ok:true,diagnostic:'Dein Code entspricht der geprüften Musterlösung.',output:out.lines};
 return {ok:false,diagnostic:'Diese Variante kann der Browser nicht zuverlässig ausführen. Vergleiche sie mit der Musterlösung und melde sie bei Bedarf dem Team.',output:out.lines};
}
root.LLPractice={evaluate,syntax,output};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
