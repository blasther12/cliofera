(() => {
  const NOTES_KEY='cliofera-study-notes-v2';
  const MASTERY_KEY='cliofera-mastery-v1';
  let studyMap=null;
  let assessments=null;
  const app=()=>document.getElementById('app');
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const read=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const courses=()=>{try{return state?.data?.courses||[]}catch{return[]}};
  const courseById=id=>courses().find(course=>course.id===id);
  const editorialFor=id=>({...studyMap?.defaultEditorial,...(studyMap?.editorial?.[id]||{})});
  const statusLabel=status=>({draft:'Rascunho',reviewed:'Revisado',verified:'Verificado'})[status]||status||'Sem status';
  const sourceByTitle=title=>(studyMap?.sourceCollections||[]).find(source=>source.title===title);

  function injectNav(){
    const top=document.getElementById('topNav');
    if(top&&!top.querySelector('[data-study-nav="paths"]')){
      const method=[...top.children].find(el=>el.getAttribute?.('href')==='#/metodo');
      for(const [label,href,id] of [['Caminhos','#/paths','paths'],['Mapa','#/mapa','map'],['Busca','#/busca','search'],['Avaliações','#/avaliacoes','assessments'],['Caderno','#/caderno','notebook']]){
        const a=document.createElement('a');a.href=href;a.textContent=label;a.dataset.studyNav=id;top.insertBefore(a,method||top.firstChild);
      }
    }
    const mobile=document.querySelector('.mobile-tabbar');
    if(mobile&&!mobile.querySelector('[data-study-mobile]')){
      const a=document.createElement('a');a.href='#/busca';a.dataset.studyMobile='true';a.setAttribute('aria-label','Busca');a.innerHTML='<span>⌕</span><small>Busca</small>';mobile.appendChild(a);mobile.style.gridTemplateColumns=`repeat(${mobile.children.length},1fr)`;
    }
  }

  function pathsPage(){
    const html=(studyMap?.paths||[]).map(path=>`<article class="path-card"><div class="eyebrow">Caminho opcional</div><h2>${safe(path.title)}</h2><p>${safe(path.description)}</p><div class="path-steps">${path.courses.map(courseById).filter(Boolean).map((course,index)=>`<a class="path-step" href="#/course/${safe(course.id)}"><span>${index+1}</span>${safe(course.title)}</a>`).join('')}</div></article>`).join('');
    return `<header class="page-header"><div class="eyebrow">Caminhos de estudo</div><h1>Use um caminho para ganhar direção, não para perder curiosidade.</h1><p class="lead">Os caminhos cruzam a grade por problema histórico. Eles são opcionais e podem ser abandonados quando uma fonte ou questão levar a outra direção.</p></header><div class="path-grid">${html}</div>`;
  }

  function mapPage(){
    const nodes=courses().map(course=>{const prereqs=(studyMap?.prerequisites?.[course.id]||[]).map(courseById).filter(Boolean);const related=(studyMap?.related?.[course.id]||[]).map(courseById).filter(Boolean);const links=list=>list.length?list.map(item=>`<a href="#/course/${safe(item.id)}">${safe(item.title)}</a>`).join(''):'<span class="study-chip">Nenhum explícito</span>';return `<article class="study-map-node"><div class="eyebrow">${safe(course.area)}</div><h3><a href="#/course/${safe(course.id)}" style="color:inherit;text-decoration:none">${safe(course.title)}</a></h3><div class="study-map-relations"><div><strong>Contexto recomendado</strong><div class="study-map-links">${links(prereqs)}</div></div><div><strong>Conexões</strong><div class="study-map-links">${links(related)}</div></div></div></article>`}).join('');
    return `<header class="page-header"><div class="eyebrow">Mapa de relações</div><h1>A História não respeita divisórias de disciplina.</h1><p class="lead">Use o mapa para perceber dependências, simultaneidades e temas que reaparecem em escalas diferentes.</p></header><div class="study-map-list">${nodes}</div>`;
  }

  function buildSearchIndex(){
    const items=[];
    for(const course of courses()){
      items.push({kind:'Disciplina',title:course.title,text:`${course.area} ${course.summary}`,href:`#/course/${course.id}`});
      const detail=state.content?.[course.id];
      const modules=detail?.modules?.length?detail.modules.map(m=>m.title):(course.modules||[]);
      modules.forEach(title=>items.push({kind:'Aula',title,text:course.title,href:`#/course/${course.id}`}));
      (course.readings||[]).forEach(title=>items.push({kind:'Bibliografia',title,text:course.title,href:`#/course/${course.id}`}));
      const literature=state.literature?.[course.id];
      [...(literature?.essential||[]),...(literature?.extended||[])].forEach(title=>items.push({kind:'Literatura',title,text:course.title,href:`#/course/${course.id}`}));
    }
    for(const debate of state.data?.debates||[])items.push({kind:'Debate',title:debate.title,text:debate.question,href:`#/debate/${debate.id}`});
    for(const event of state.timeline?.events||[])items.push({kind:'Cronologia',title:`${event.date} · ${event.title}`,text:event.summary,href:'#/timeline'});
    return items;
  }

  function searchPage(query=''){
    const q=query.trim().toLocaleLowerCase('pt-BR');const allItems=buildSearchIndex();const results=q?allItems.filter(item=>`${item.kind} ${item.title} ${item.text}`.toLocaleLowerCase('pt-BR').includes(q)).slice(0,120):allItems.slice(0,35);
    return `<header class="page-header"><div class="eyebrow">Busca transversal</div><h1>Procure pessoas, períodos, obras, conceitos, debates e eventos.</h1><p class="lead">A busca atravessa currículo, aulas, bibliografia, literatura, debates e cronologia.</p></header><div class="searchbar"><input id="clioGlobalSearch" type="search" placeholder="Ex.: escravidão, Homero, Gramsci, Bizâncio, gênero…" value="${safe(query)}"></div><p>${results.length} resultados exibidos.</p><div class="history-search-results">${results.map(item=>`<a class="history-search-result" href="${safe(item.href)}"><span class="result-kind">${safe(item.kind)}</span><h3>${safe(item.title)}</h3><p>${safe(item.text)}</p></a>`).join('')||'<div class="empty">Nada encontrado.</div>'}</div>`;
  }

  function assessmentsPage(){
    const rubric=(assessments?.rubric||[]).map(item=>`<article class="rubric-item"><div class="rubric-weight">${item.weight}%</div><strong>${safe(item.title)}</strong><p>${safe(item.description)}</p></article>`).join('');
    const cards=(assessments?.semesters||[]).map(item=>`<article class="assessment-card"><div class="eyebrow">Semestre ${item.semester}</div><h2>${safe(item.title)}</h2><p>${safe(item.prompt)}</p><h3>Entregáveis</h3><ul>${item.deliverables.map(d=>`<li>${safe(d)}</li>`).join('')}</ul></article>`).join('');
    return `<header class="page-header"><div class="eyebrow">Avaliações</div><h1>Produção histórica periódica, não prova de memorização.</h1><p class="lead">Cada semestre termina com uma entrega que exige problema, fontes, historiografia e argumento.</p></header><section><div class="rich-heading"><div><div class="eyebrow">Rubrica comum</div><h2>Como revisar seus ensaios</h2></div></div><div class="rubric-grid">${rubric}</div></section><section class="section"><div class="assessment-grid">${cards}</div></section>`;
  }

  function notebookPage(){
    const notes=read(NOTES_KEY);const entries=Object.entries(notes).filter(([,value])=>String(value).trim()).map(([key,value])=>{const [courseId,indexText]=key.split('::');const course=courseById(courseId);const index=Number(indexText);const detail=state.content?.[courseId];const title=detail?.modules?.[index]?.title||course?.modules?.[index]||`Aula ${index+1}`;return{course,index,title,value}});
    return `<header class="page-header"><div class="eyebrow">Caderno</div><h1>Fichamentos e notas de estudo.</h1><p class="lead">As notas ficam localmente neste navegador. Exporte para backup ou para continuar em outro dispositivo.</p></header><div class="historian-actions"><button id="exportClioNotes" class="button secondary">Exportar caderno</button><button id="importClioNotes" class="button secondary">Importar caderno</button><input id="importClioNotesFile" type="file" accept="application/json,.json" hidden></div><section class="section notebook-list">${entries.map(item=>`<article class="notebook-card"><div class="eyebrow">${safe(item.course?.title||'Disciplina')}</div><h3><a href="#/course/${safe(item.course?.id||'')}" style="color:inherit">${safe(item.title)}</a></h3><p>${safe(item.value)}</p></article>`).join('')||'<div class="empty">Nenhum fichamento salvo ainda.</div>'}</section>`;
  }

  function download(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
  function bindSpecial(){
    const input=document.getElementById('clioGlobalSearch');if(input)input.oninput=()=>{app().innerHTML=searchPage(input.value);bindSpecial();const next=document.getElementById('clioGlobalSearch');next.focus();next.setSelectionRange(next.value.length,next.value.length)};
    const exp=document.getElementById('exportClioNotes');if(exp)exp.onclick=()=>download('cliofera-caderno.json',{version:1,exportedAt:new Date().toISOString(),notes:read(NOTES_KEY),mastery:read(MASTERY_KEY)});
    const imp=document.getElementById('importClioNotes'),file=document.getElementById('importClioNotesFile');if(imp&&file){imp.onclick=()=>file.click();file.onchange=async()=>{try{const data=JSON.parse(await file.files[0].text());if(data.notes)write(NOTES_KEY,data.notes);if(data.mastery)write(MASTERY_KEY,data.mastery);location.hash='#/caderno';renderSpecial()}catch{alert('Arquivo de caderno inválido.')}}}
  }

  function renderSpecial(){if(!studyMap||!assessments||courses().length<30||!app())return false;const p=route();let html=null;if(p[0]==='paths')html=pathsPage();if(p[0]==='mapa')html=mapPage();if(p[0]==='busca')html=searchPage();if(p[0]==='avaliacoes')html=assessmentsPage();if(p[0]==='caderno')html=notebookPage();if(html!==null){app().innerHTML=html;scrollTo(0,0);bindSpecial();return true}return false}

  function enhanceCourse(){
    const p=route();if(p[0]!=='course'||!p[1]||!studyMap)return;const course=courseById(p[1]);const header=document.querySelector('.page-header');if(!course||!header||header.querySelector('.study-meta'))return;
    const meta=editorialFor(course.id);const prereqs=(studyMap.prerequisites?.[course.id]||[]).map(courseById).filter(Boolean);const related=(studyMap.related?.[course.id]||[]).map(courseById).filter(Boolean);const paths=(studyMap.paths||[]).filter(path=>path.courses.includes(course.id));
    const wrap=document.createElement('div');wrap.className='study-meta';wrap.innerHTML=`<span class="study-chip editorial-current"><strong>${safe(statusLabel(meta.status))}</strong> · revisão ${safe(meta.lastReviewed)}</span>${paths.map(path=>`<a class="study-chip" href="#/paths"><strong>Caminho</strong> ${safe(path.title)}</a>`).join('')}${prereqs.map(item=>`<a class="study-chip" href="#/course/${safe(item.id)}"><strong>Contexto</strong> ${safe(item.title)}</a>`).join('')}${related.slice(0,4).map(item=>`<a class="study-chip" href="#/course/${safe(item.id)}"><strong>Relacionado</strong> ${safe(item.title)}</a>`).join('')}`;header.appendChild(wrap);
    const sticky=document.querySelector('.sticky');const selected=(studyMap.courseSources?.[course.id]||[]).map(sourceByTitle).filter(Boolean);if(sticky&&selected.length&&!sticky.querySelector('[data-source-start]')){const block=document.createElement('div');block.className='source-start';block.dataset.sourceStart='true';block.innerHTML=`<hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><div class="eyebrow">Fontes para começar</div><ul class="reading-list">${selected.map(source=>`<li><a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.title)} ↗</a><small style="display:block;color:var(--muted)">${safe(source.scope)}</small></li>`).join('')}</ul>`;sticky.appendChild(block)}
  }

  const lessonKey=(courseId,index)=>`${courseId}::${index}`;
  function enhanceLessons(){
    const p=route();if(p[0]!=='course'||!p[1])return;const course=courseById(p[1]);if(!course)return;const notes=read(NOTES_KEY),mastery=read(MASTERY_KEY);document.querySelectorAll('.lesson-card').forEach((card,index)=>{const body=card.querySelector('.lesson-body');if(!body||body.querySelector('[data-historian-tools]'))return;const key=lessonKey(course.id,index),current=mastery[key]||{};const tools=document.createElement('details');tools.className='historian-tools';tools.dataset.historianTools='true';tools.innerHTML=`<summary>Caderno do historiador · domínio e fichamento</summary><div class="historian-tools-body"><div class="historian-mastery"><label><input type="checkbox" data-hmastery="context" ${current.context?'checked':''}><span><strong>Situo o contexto</strong><small>Consigo localizar tempo, espaço, agentes e processos sem anacronismo.</small></span></label><label><input type="checkbox" data-hmastery="sources" ${current.sources?'checked':''}><span><strong>Analiso fontes</strong><small>Consigo discutir autoria, finalidade, evidência, silêncio e limite documental.</small></span></label><label><input type="checkbox" data-hmastery="historiography" ${current.historiography?'checked':''}><span><strong>Comparo interpretações</strong><small>Consigo explicar divergências historiográficas e sustentar uma posição provisória.</small></span></label></div><textarea class="historian-note" data-hnote placeholder="Fichamento, dúvidas, fontes, argumentos, conexões…">${safe(notes[key]||'')}</textarea><div class="historian-actions"><button class="button secondary" data-save-hnote>Salvar fichamento</button><a class="button secondary" href="#/caderno">Abrir caderno</a></div></div>`;body.appendChild(tools);tools.querySelectorAll('[data-hmastery]').forEach(input=>input.onchange=()=>{const all=read(MASTERY_KEY);all[key]={...(all[key]||{}),[input.dataset.hmastery]:input.checked};write(MASTERY_KEY,all)});tools.querySelector('[data-save-hnote]').onclick=()=>{const all=read(NOTES_KEY);const value=tools.querySelector('[data-hnote]').value.trim();if(value)all[key]=value;else delete all[key];write(NOTES_KEY,all);const btn=tools.querySelector('[data-save-hnote]');btn.textContent='Salvo ✓';setTimeout(()=>btn.textContent='Salvar fichamento',1200)}})
  }

  function afterRender(){if(renderSpecial())return;setTimeout(()=>{enhanceCourse();enhanceLessons()},100)}

  async function init(){
    try{const [mapRes,assessmentRes]=await Promise.all([fetch('./study-map.json',{cache:'no-store'}),fetch('./assessments.json',{cache:'no-store'})]);if(mapRes.ok)studyMap=await mapRes.json();if(assessmentRes.ok)assessments=await assessmentRes.json()}catch{}
    const wait=()=>{if(courses().length>=30){injectNav();afterRender();const observer=new MutationObserver(()=>{injectNav();const p=route();if(['paths','mapa','busca','avaliacoes','caderno'].includes(p[0]))return;enhanceCourse();enhanceLessons()});observer.observe(app(),{childList:true,subtree:true});addEventListener('hashchange',()=>setTimeout(afterRender,80));return}setTimeout(wait,80)};wait();
  }
  init();
})();
