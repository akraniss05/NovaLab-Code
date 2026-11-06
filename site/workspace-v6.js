/* LiveryLab Studio Workspace 6 · UI only: never handles credentials or bypasses Pro gates. */
(function () {
  'use strict';
  var config = {
    code: {
      badge: 'DEVELOPER WORKSPACE', name: 'Code Lab', title: 'Ideen schreiben. Direkt ausprobieren.',
      intro: 'Projekte, Dateien, Editor und Konsole in einem übersichtlichen Arbeitsbereich.',
      hint: 'JavaScript läuft isoliert, HTML in einer Sandbox. Lua/Python sind Lernrunner; FiveM und kompilierte Sprachen benötigen ihre echte Laufzeit.',
      jump: [['Dateien','.llide-files'],['Editor','.llide-editwrap'],['Konsole','.llide-output']],
      tools: [['▶','Code starten','run'],['＋','Neue Datei','add-file'],['⌕','Im Code suchen','find'],['▤','Code kopieren','copy'],['✎','Projekt umbenennen','rename-project'],['↓','ZIP exportieren','download']]
    },
    design: {
      badge: '3D CREATOR WORKSPACE', name: 'Designer Lab', title: 'Von der Form zum 3D-Projekt.',
      intro: 'Szene, Objekte und Materialeigenschaften mit direkter Vorschau und Blender-kompatiblem Export.',
      hint: 'Szene lokal speichern, aus JSON wiederherstellen oder das Modell als GLB exportieren. Komplexe Animationen und Sculpting bleiben Blender-Aufgaben.',
      jump: [['Objekte','#ll3-tree'],['3D-Ansicht','.ll3-view'],['Eigenschaften','#ll3-inspector']],
      tools: [['＋','Objekt hinzufügen','add'],['◎','Auswahl fokussieren','camera'],['▦','Raster zeigen/verbergen','grid'],['⧉','Duplizieren · Pro','duplicate'],['▣','Screenshot PNG','snapshot'],['↓','GLB exportieren','export'],['▤','Szene als JSON','json']]
    },
    video: {
      badge: 'VIDEO EDITING WORKSPACE', name: 'Video Lab', title: 'Schneiden. Gestalten. Exportieren.',
      intro: 'Video importieren, Timeline bearbeiten, Text und Farben anpassen und einen Clip lokal ausgeben.',
      hint: 'Unterstützte Exportformate hängen von Safari, Chrome und dem Gerät ab. Der Browser muss während des Echtzeitexports geöffnet bleiben.',
      jump: [['Vorschau','.llv-canvas'],['Timeline','.llv-timeline'],['Effekte','.llv-inspector']],
      tools: [['＋','Clip importieren','import'],['▶','Vorschau','preview'],['◧','Anfang hier setzen','trim-start'],['◨','Ende hier setzen','trim-end'],['▣','Frame als PNG','snapshot'],['↶','Effekte zurücksetzen','reset'],['↓','Video exportieren','export']]
    }
  };
  function make(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function enhance(root, kind) {
    var c = config[kind];
    if (!root || !c || root.querySelector(':scope > .llws-top')) return;
    root.classList.add('llws-host', 'llws-' + kind);
    root.dataset.llws = kind;
    var hero = make('section', 'llws-top');
    var intro = make('div','llws-top-copy');
    intro.append(make('span','llws-eyebrow',c.badge),make('h1','llws-heading',c.title),make('p','llws-description',c.intro));
    var flag = make('div','llws-flag');
    flag.append(make('span','llws-flag-dot'),make('strong',null,c.name),make('small',null,'Lokal im Browser'));
    hero.append(intro,flag);
    var tools = make('section','llws-tools');
    var heading = make('div','llws-tools-head');
    heading.append(make('strong',null,'WERKZEUGE'),make('span',null,'Direktzugriff auf deine Arbeitsfläche'));
    tools.append(heading);
    var row = make('div','llws-actions');
    c.tools.forEach(function (entry) {
      var button = make('button','llws-action');
      button.type='button';
      button.append(make('span','llws-action-icon',entry[0]),make('span','llws-action-label',entry[1]));
      if (kind==='code') button.dataset.llwsCode=entry[2];
      else if(kind==='design') button.dataset.llwsDesign=entry[2];
      else button.dataset.llwsVideo=entry[2];
      row.append(button);
    });
    if(kind==='video'){
      var label=make('label','llws-speed');
      label.append(make('span',null,'Vorschau-Tempo'));
      var select=make('select');
      select.id='llws-speed';
      select.setAttribute('aria-label','Abspielgeschwindigkeit der Vorschau');
      [['0.5','0,5×'],['1','1×'],['1.5','1,5×'],['2','2×']].forEach(function(x){
        var opt=make('option',null,x[1]);opt.value=x[0];if(x[0]==='1')opt.selected=true;select.append(opt);
      });
      label.append(select);row.append(label);
    }
    tools.append(row);
    var nav=make('nav','llws-jump');
    nav.setAttribute('aria-label','Arbeitsbereich-Navigation');
    nav.append(make('span','llws-jump-caption','ARBEITSBEREICH'));
    c.jump.forEach(function(entry){
      var b=make('button',null,entry[0]);b.type='button';b.dataset.llwsScroll=entry[1];nav.append(b);
    });
    var details=make('details','llws-help');
    details.append(make('summary',null,'Hinweise & Grenzen'),make('p',null,c.hint));
    root.prepend(details);
    root.prepend(nav);
    root.prepend(tools);
    root.prepend(hero);
  }
  if(typeof document.addEventListener==='function'){
  document.addEventListener('click',function(event){
    var target=event.target.closest('[data-llws-scroll],[data-llws-code],[data-llws-design],[data-llws-video]');
    if(!target)return;
    var root=target.closest('.llws-host');
    if(!root)return;
    if(target.dataset.llwsScroll){
      var section=root.querySelector(target.dataset.llwsScroll);
      if(section)section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      return;
    }
    if(target.dataset.llwsCode||target.dataset.llwsDesign){
      var key=target.dataset.llwsCode||target.dataset.llwsDesign;
      var proxy=make('button');proxy.type='button';proxy.hidden=true;
      if(target.dataset.llwsCode)proxy.dataset.ide=key;else proxy.dataset.three=key;
      root.append(proxy);proxy.click();proxy.remove();return;
    }
    if(root.dataset.llws!=='video'||!window.LLVideoLab)return;
    var action=target.dataset.llwsVideo;
    var proxies={import:'#llv-import',preview:'#llv-preview',export:'#llv-export'};
    if(proxies[action]){root.querySelector(proxies[action])?.click();return;}
    if(action==='snapshot')window.LLVideoLab.snapshot();
    if(action==='reset')window.LLVideoLab.resetLook();
    if(action==='trim-start')window.LLVideoLab.trimTo('start');
    if(action==='trim-end')window.LLVideoLab.trimTo('end');
  });
  document.addEventListener('change',function(event){
    if(event.target.id==='llws-speed'&&event.target.closest('.llws-video'))window.LLVideoLab?.setSpeed(Number(event.target.value));
  });
  }
  window.LLWorkspace={enhance:enhance};
})();