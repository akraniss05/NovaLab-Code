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
function output(code,lang){const vars=Object.create(null),lines=[],lineTypes=[];let supported=true,error='';
 const print=lang==='lua'||lang==='python'?/^print\s*\((.*)\)\s*;?$/:/^(?:console\.log|alert)\s*\((.*)\)\s*;?$/;
 for(const raw of String(code||'').split('\n')){let line=raw.trim();if(lang==='lua'){const comment=luaLineComment(line);if(comment)line=line.slice(0,-comment.length).trim();}if(!line||/^(--|#|\/\/)/.test(line))continue;
  const inline=lang==='lua'&&line.match(/^if\s+([\w$]+)\s+then\s+(.+?)\s+end\s*$/);
  if(inline){if(!Object.prototype.hasOwnProperty.call(vars,inline[1])){supported=false;error='Die Variable „'+inline[1]+'“ ist nicht definiert.';break}if(vars[inline[1]]===false||vars[inline[1]]===null)continue;line=inline[2]}
  const assign=line.match(/^(?:(?:local|let|const|var)\s+)?([a-zA-Z_$][\w$]*)\s*=\s*(.+?)\s*;?$/);
  if(assign){const val=expression(assign[2].replace(/;$/,''),vars);if(val===INVALID){supported=false;error='Der Wert für „'+assign[1]+'“ kann hier nicht berechnet werden.';break}vars[assign[1]]=val;continue}
  const match=line.match(print);if(match){const vals=splitArgs(match[1]).map(x=>expression(x,vars));if(vals.includes(INVALID)){supported=false;error='Ein Ausdruck ist unbekannt oder eine Variable wurde nicht definiert.';break}lines.push(vals.map(x=>x===null?'nil':String(x)).join('\t'));lineTypes.push(vals.map(valueType).join(' '));continue}
  supported=false;error='Diese Anweisung kann die Browser-Konsole noch nicht ausführen.';break}
 return {lines,lineTypes,supported,error,vars}}
function matches(code,rule){try{return new RegExp(rule,'im').test(code)}catch(_){return code.includes(rule)}}
function luaLineComment(line){
 let quote='';
 for(let i=0;i<line.length;i++){
  const ch=line[i];
  if(quote){
   if(ch==='\\')i++;
   else if(ch===quote)quote='';
  }else if(ch==='"'||ch==="'")quote=ch;
  else if(ch==='['){
   const opening=line.slice(i).match(/^\[(=*)\[/);
   if(opening){
    const close=']'+opening[1]+']',end=line.indexOf(close,i+opening[0].length);
    if(end<0)return '';
    i=end+close.length-1;
   }
  }else if(line.startsWith('--',i))return line.slice(i);
 }
 return '';
}
function checkRule(rule,code,source,lang){
 if(lang==='lua'&&rule.startsWith('--')){
  return clean(code).split('\n').some(line=>{
   const comment=luaLineComment(line);
   return comment&&!/^--\[=*\[/.test(comment)&&comment.slice(2).trim()&&matches(comment,rule);
  });
 }
 return matches(source,rule);
}
function describe(rule){if(rule.startsWith('--'))return 'ein Lua-Zeilenkommentar mit einer kurzen Erklärung';let m=rule.match(/local\\s\+([a-zA-Z_]\w*)/);if(m)return 'lokale Variable „'+m[1]+'“';
 if(/tonumber/.test(rule))return 'tonumber(…)';if(/tostring/.test(rule))return 'tostring(…)';if(/type/.test(rule))return 'type(…)';if(/print/.test(rule))return 'print(…) wie in der Aufgabe';if(/\\\+/.test(rule))return 'Addition wie in der Aufgabe';return 'ein geforderter Schritt'}
function tokens(s){return new Set(String(s||'').match(/[a-zA-Z_$][\w$]*|\d+|["'][^"']*["']/g)||[])}
function allowsOwnValues(payload){
 if(payload.practice_output)return payload.practice_output!=='exact';
 const task=String(payload.task||'');
 if(/(?:eigenen Namen|eigene[nrs]? (?:Namen|Zahlen?|Werte?|Texte?)|deinen Namen|selbst gewählte[nrs]? (?:Namen|Zahlen?|Werte?|Texte?)|beliebige[nrs]? (?:Namen|Zahlen?|Werte?|Texte?)|Ändere anschließend mindestens einen Wert)/i.test(task))return true;
 // Tasks asking for variables without a prescribed number deliberately allow original values.
 return /^\s*(?:Lege|Erstelle|Definiere|Schreibe)\b.{0,110}\b(?:Variablen?|Kommentar)\b/i.test(task)&&!/\b\d+(?:[.,]\d+)?\b/.test(task);
}
function checkFlexibleOutput(payload,actual,expected){
 const rule=payload.practice_output;
 const lines=actual.lines||[];
 if(rule==='criteria'){
  const criteria=payload.practice_lines||[];
  const ok=lines.length===criteria.length&&criteria.every((pattern,index)=>matches(lines[index],pattern));
  return {ok,diagnostic:ok?'Deine Ausgabe erfüllt die Vorgaben.':'Prüfe Anzahl, Reihenfolge und Art der Ausgaben in der Aufgabenbeschreibung.',output:lines};
 }
 if(rule==='text-lines'){
  const count=payload.practice_line_count;
  const types=actual.lineTypes;
  const ok=lines.length===count&&lines.every(line=>String(line).trim())&&
   Array.isArray(types)&&types.length===count&&types.every(type=>type==='string');
  return {ok,diagnostic:ok?'Deine eigenen Texte wurden korrekt ausgegeben.':'Gib '+count+' nicht leere Texte aus, jeweils einen pro Aufruf.',output:lines};
 }
 if(rule==='shape'){
  const reference=expected.lines||[];
  const minimum=payload.practice_min_lines??reference.length;
  const ok=lines.length>=minimum&&(payload.practice_min_lines!==undefined||lines.length===reference.length)&&
   lines.every(line=>String(line).trim())&&
   (!Array.isArray(actual.lineTypes)||!Array.isArray(expected.lineTypes)||
    (payload.practice_min_lines!==undefined
     ?actual.lineTypes.every(type=>type===expected.lineTypes[0])
     :actual.lineTypes.every((type,i)=>type===expected.lineTypes[i])));
  return {ok,diagnostic:ok?'Die Ausgabe erfüllt die Vorgaben. Eigene Werte sind erlaubt.':'Prüfe Anzahl und Datentypen deiner Ausgaben anhand der Aufgabe.',output:lines};
 }
 if(rule==='one-of'){
  const ok=lines.length===1&&payload.practice_allowed_lines?.includes(lines[0]);
  return {ok,diagnostic:ok?'Die Ausgabe entspricht einem der geforderten Fälle.':'Prüfe die Ausgabe für den gewählten Fall.',output:lines};
 }
 if(rule==='prefix'){
  const prefix=payload.practice_prefix;
  const ok=lines.length===1&&typeof prefix==='string'&&(!actual.lineTypes||actual.lineTypes[0]==='string')&&lines[0].startsWith(prefix)&&lines[0].slice(prefix.length).trim().length>0;
  return {ok,diagnostic:ok?'Die Ausgabe enthält den geforderten Anfang und deinen eigenen Text.':'Prüfe den vorgegebenen Anfang und ergänze danach deinen eigenen Text.',output:lines};
 }
 return null;
}
function sameVariableTypes(actual,expected){
 return Object.keys(expected.vars||{}).every(key=>!Object.prototype.hasOwnProperty.call(actual.vars||{},key)||
  valueType(actual.vars[key])===valueType(expected.vars[key]));
}
function requiredPrintedVariables(source,solution,expected){
 const printed=s=>(s.match(/(?:print|console\.log)\s*\([^\n]*/g)||[]).join(' ');
 const expectedPrint=printed(solution),actualPrint=printed(source);
 const identifiers=text=>new Set((text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'').match(/[a-zA-Z_$][\w$]*/g)||[]));
 const reference=identifiers(expectedPrint),actual=identifiers(actualPrint);
 return Object.keys(expected.vars||{}).filter(key=>reference.has(key)).every(key=>actual.has(key));
}
function customizedOutput(source,payload,out,expected,solution){
 if(out.lines.length!==expected.lines.length||out.lines.some(x=>!String(x).trim()))return false;
 if(!sameVariableTypes(out,expected)||!requiredPrintedVariables(source,solution,expected))return false;
 // A lesson about types must still produce the correct types, irrespective of variable values.
 if(/\btype\s*\(/.test(solution)&&JSON.stringify(out.lines)!==JSON.stringify(expected.lines))return false;
 return true;
}
function evaluateMarkup(candidate,solution,lang){
 const verdict=(ok,diagnostic)=>({ok,diagnostic,output:[]});
 if(lang==='html'){
  const inspect=text=>{
   // Markup inside HTML comments or JavaScript strings is not an HTML element.
   const stripped=String(text||'').replace(/<!--[\s\S]*?-->/g,'')
    .replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?(<\/(?:script|style)\s*>)/gi,'$1$2');
   const tokens=stripped.match(/<![^>]*>|<\/?[a-z][^>]*>/gi)||[];
   const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
   const stack=[],counts=new Map();
   for(const token of tokens){
    if(/^<!/.test(token))continue;
    const closing=/^<\//.test(token),name=token.match(/^<\/?\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
    if(!name)continue;
    if(closing){
     if(stack.pop()!==name)return {counts,valid:false};
    }else{
     counts.set(name,(counts.get(name)||0)+1);
     if(!voidTags.has(name)&&!token.endsWith('/>'))stack.push(name);
    }
   }
   return {counts,valid:stack.length===0&&counts.size>0};
  };
  const user=inspect(candidate),reference=inspect(solution);
  const withoutComments=text=>text.replace(/<!--[\s\S]*?-->/g,'');
  const doctype=/^\s*<!doctype\s+html\s*>/i;
  const rootLang=/<html\b[^>]*\s+lang\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i;
  if(doctype.test(withoutComments(solution))&&!doctype.test(withoutComments(candidate)))return verdict(false,'Beginne das Dokument mit <!doctype html>.');
  if(rootLang.test(withoutComments(solution))&&!rootLang.test(withoutComments(candidate)))return verdict(false,'Gib am html-Element die Sprache an, zum Beispiel lang="de".');
  if(!user.valid)return verdict(false,'HTML-Struktur ist unvollständig: prüfe öffnende und schließende Tags. Kommentare zählen nicht als HTML.');
  const missing=[...reference.counts].filter(([tag,count])=>(user.counts.get(tag)||0)<count).map(([tag])=>tag);
  if(missing.length)return verdict(false,'Diese HTML-Elemente fehlen oder kommen zu selten vor: '+missing.join(', ')+'.');
  return verdict(true,'✓ Gültige Grundstruktur und die erforderlichen HTML-Elemente sind vorhanden.');
 }
 if(lang==='css'){
  const clean=String(candidate).replace(/\/\*[\s\S]*?\*\//g,'');
  const reference=String(solution).replace(/\/\*[\s\S]*?\*\//g,'');
  const balance=text=>{
   let depth=0,quote='',escaped=false;
   for(const ch of text){
    if(quote){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch===quote)quote='';continue;}
    if(ch==='"'||ch==="'"){quote=ch;continue;}
    if(ch==='{')depth++;
    if(ch==='}'&&--depth<0)return false;
   }
   return depth===0&&!quote;
  };
  if(!balance(clean))return verdict(false,'CSS-Klammern oder Zeichenketten sind nicht korrekt geschlossen.');
  const rules=text=>[...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
   .filter(m=>!m[1].trim().startsWith('@')).map(m=>({selector:m[1].trim(),body:m[2].trim()}));
  const actual=rules(clean),expected=rules(reference);
  if(!actual.length)return verdict(false,'Es fehlen gültige CSS-Regelblöcke.');
  for(const rule of actual){
   if(!rule.selector||!rule.body)return verdict(false,'Ein CSS-Regelblock benötigt einen Selektor und Eigenschaften.');
   const declarations=rule.body.split(';').map(x=>x.trim()).filter(Boolean);
   if(!declarations.length||declarations.some(x=>!/^[-\w]+\s*:\s*\S[\s\S]*$/.test(x)))
    return verdict(false,'Ungültige CSS-Eigenschaft: verwende z. B. color: blue;');
  }
  const normalizeSelector=value=>value.replace(/\s+/g,' ').replace(/\s*([>+~,])\s*/g,'$1');
  const missing=expected.map(x=>x.selector).filter(sel=>!actual.some(x=>normalizeSelector(x.selector)===normalizeSelector(sel)));
  if(missing.length)return verdict(false,'Diese CSS-Selektoren werden benötigt: '+missing.join(', ')+'.');
  if(actual.length<expected.length)return verdict(false,'Noch nicht alle geforderten CSS-Regelblöcke vorhanden.');
  return verdict(true,'✓ CSS-Selektoren und Eigenschaftsdeklarationen sind vorhanden. Prüfe die Darstellung zusätzlich in der Vorschau.');
 }
 return null;
}
function evaluate(source,payload){const code=clean(source),lang=String(payload.lang||'').toLowerCase(),solution=significant(payload.solution||payload.example||'',lang),candidate=significant(code,lang);
 if(!code)return {ok:false,diagnostic:'Schreibe zuerst deine Lösung.',output:[]};
 const error=syntax(code,lang);if(error)return {ok:false,diagnostic:error,output:[]};
 const required=(Array.isArray(payload.checks)?payload.checks:[]).filter(x=>typeof x==='string'&&x.trim());
 const missing=required.filter(x=>!checkRule(x,code,candidate,lang)),out=output(code,lang),expected=output(solution,lang);
 if(missing.length)return {ok:false,diagnostic:'Prüfe diese Schritte: '+missing.slice(0,3).map(describe).join(', ')+'.',output:out.lines};
 if(lang==='html'||lang==='css')return evaluateMarkup(candidate,solution,lang);
 if(payload.practice_output&&out.supported){
  const verdict=checkFlexibleOutput(payload,out,expected);if(verdict)return verdict;
 }
 if(['lua','javascript','python'].includes(lang)&&expected.supported&&expected.lines.length&&out.supported){
  const personal=!payload.practice_output&&/(?:eigenen|deinen) Namen/i.test(payload.task||'');
  const flexible=allowsOwnValues(payload);
  const matched=personal?out.lines.length===expected.lines.length&&out.lines[0].trim()!==''&&out.lines.slice(1).every((v,i)=>v===expected.lines[i+1]):
   flexible?customizedOutput(candidate,payload,out,expected,solution):JSON.stringify(out.lines)===JSON.stringify(expected.lines);
  return {ok:matched,diagnostic:matched?'Die geforderten Schritte und die Ausgabe stimmen.':'Die Ausgabe passt noch nicht zu den Vorgaben in der Aufgabe.',output:out.lines}}
 if(!out.supported&&out.error&&candidate!==solution)return {ok:false,diagnostic:out.error,output:out.lines};
 if(candidate===solution&&solution)return {ok:true,diagnostic:'Dein Code entspricht der Musterlösung.',output:out.lines};
 const expectedTokens=tokens(solution),actualTokens=tokens(candidate),omitted=[...expectedTokens].filter(t=>!actualTokens.has(t));
 return {ok:false,diagnostic:!solution?'Für diese Aufgabe ist noch keine automatische Prüfung hinterlegt.':omitted.length?'Prüfe deinen Lösungsweg und vergleiche ihn mit dem Tipp.':'Diese Variante kann der Browser noch nicht sicher prüfen. Vergleiche sie mit der Lösung oder melde sie dem Support.',output:out.lines}}
/**
 * Check a real runtime result against a real solution run.
 * Runtime execution is performed by LLRuntime's disposable worker.
 * This checks task structure and output without claiming a full automated semantic proof.
 */
function evaluateRuntime(code,payload,actual,expected){
 const lang=String(payload.lang||'').toLowerCase(),source=significant(code,lang),solution=significant(payload.solution||'',lang);
 if(!actual?.available||!actual.ok)return {ok:false,diagnostic:'Der Code konnte nicht erfolgreich ausgeführt werden.',output:actual?.lines||[]};
 if(!source)return {ok:false,diagnostic:'Schreibe zuerst deinen eigenen Code.',output:actual.lines||[]};
 if(payload.practice_output!=='criteria'&&!expected?.ok)return {ok:false,diagnostic:'Die Musterlösung konnte nicht zuverlässig geprüft werden. Bitte melde die Aufgabe.',output:actual.lines||[]};
 const required=(Array.isArray(payload.checks)?payload.checks:[]).filter(x=>typeof x==='string'&&x.trim());
 const missing=required.filter(rule=>!checkRule(rule,code,source,lang));
 if(missing.length)return {ok:false,diagnostic:payload.practice_instruction||'Es fehlt noch: '+missing.slice(0,3).map(describe).join(', ')+'.',output:actual.lines||[]};
 if(payload.practice_output==='criteria')return checkFlexibleOutput(payload,actual);
 // Requiring the learning concept prevents passing advanced tasks with a bare print.
 const concepts=[];
 const structure={
  lua:[[/\blocal\b/,'local'],[/\bif\b/,'if'],[/\bfor\b/,'for'],[/\bwhile\b/,'while'],[/\bfunction\b/,'function'],[/\btonumber\s*\(/,'tonumber'],[/\btype\s*\(/,'type']],
  python:[[/^\s*if\b/m,'if'],[/^\s*else\s*:/m,'else'],[/^\s*for\b/m,'for'],[/^\s*while\b/m,'while'],[/^\s*def\b/m,'def'],[/^\s*class\b/m,'class']],
  javascript:[[/\blet\b/,'let'],[/\bconst\b/,'const'],[/\bif\s*\(/,'if'],[/\bfor\s*\(/,'for'],[/\.map\s*\(/,'.map'],[/\bfunction\b/,'function']]
 };
 for(const [pattern,name] of structure[lang]||[])if(pattern.test(solution)&&!pattern.test(source))concepts.push(name);
 if(concepts.length&&payload.practice_output!=='text-lines')return {ok:false,diagnostic:'In dieser Aufgabe musst du noch '+concepts.join(', ')+' verwenden.',output:actual.lines||[]};
 if(lang==='python'){
  const expectedAssignments=(solution.match(/^\s*[a-zA-Z_]\w*\s*=(?!=)/gm)||[]).length;
  const actualAssignments=(source.match(/^\s*[a-zA-Z_]\w*\s*=(?!=)/gm)||[]).length;
  if(expectedAssignments&&actualAssignments<expectedAssignments)return {ok:false,diagnostic:'Nutze die geforderten Variablen und Zuweisungen aus der Übung.',output:actual.lines||[]};
 }
 const lines=actual.lines||[],expectedLines=expected.lines||[];
 const explicit=checkFlexibleOutput(payload,actual,expected);
 if(explicit){
  if(explicit.ok&&payload.practice_output==='shape'&&payload.practice_min_lines===undefined){
   const simulated=output(code,lang),reference=output(payload.solution,lang);
   if(simulated.supported&&reference.supported&&
    !customizedOutput(source,payload,simulated,reference,solution)){
    return {ok:false,diagnostic:'Verwende die geforderten Variablen und Datentypen in deiner Ausgabe.',output:lines};
   }
  }
  return explicit;
 }
 if(!lines.length&&!expectedLines.length&&source!==solution)return {ok:false,diagnostic:'Ohne Ausgabe oder messbare Tests lässt sich diese geänderte Lösung nicht zuverlässig prüfen. Ergänze einen sichtbaren Test oder vergleiche den Code mit der Erklärung.',output:lines};
 const personal=!payload.practice_output&&/(?:eigenen|deinen) Namen/i.test(payload.task||''),customize=allowsOwnValues(payload);
 let accepted;
 if(personal){
  accepted=lines.length===expectedLines.length&&String(lines[0]||'').trim()!==''&&lines.slice(1).every((line,i)=>line===expectedLines[i+1]);
 }else if(customize){
  const simulated=output(code,lang),reference=output(payload.solution||'',lang);
  // When the light parser understands the lesson, compare variable types and ensure
  // that the output really depends on the required variables, not hard-coded text.
  const meaningful=!simulated.supported||!reference.supported||
   customizedOutput(source,payload,simulated,reference,solution);
  accepted=meaningful&&lines.length===expectedLines.length&&lines.every(x=>String(x).trim().length>0);
  if(/\btype\s*\(/.test(solution))accepted=accepted&&JSON.stringify(lines)===JSON.stringify(expectedLines);
 }else accepted=JSON.stringify(lines)===JSON.stringify(expectedLines);
 if(!accepted)return {ok:false,diagnostic:'Die echte Ausgabe passt noch nicht zur Aufgabe.'+(customize?' Prüfe, ob alle erwarteten Ergebnisse ausgegeben werden.':' Vergleiche Werte, Reihenfolge und Datentypen mit der Erklärung.'),output:lines};
 return {ok:true,diagnostic:'✓ Der echte Programmlauf stimmt mit den Anforderungen überein. Alle geforderten Konzepte sind vorhanden.',output:lines};
}
root.LLPractice={evaluate,syntax,output,evaluateRuntime};
})(typeof module!=='undefined'&&module.exports?module.exports:window);
