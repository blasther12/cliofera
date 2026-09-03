(() => {
  const $=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  let timelineCache=null;

  const titleFromId=id=>String(id||'').split('-').map(part=>part?part[0].toUpperCase()+part.slice(1):part).join(' ');
  const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function addJourney(){
    if(route().length||$('#journeyPanel')||!$('.hero'))return;
    const overall=$('.big-progress')?.textContent?.trim()||'0%';
    const yearCards=all('.stat-card').slice(0,4).map(card=>({value:$('.stat-value',card)?.textContent?.trim()||'0%',label:$('.stat-label',card)?.textContent?.trim()||''}));
    const nextCard=$('.course-card');
    const nextTitle=nextCard?.querySelector('h3')?.textContent?.trim()||'Escolher próxima disciplina';
    const nextHref=nextCard?.getAttribute('href')||'#/curriculo';
    const panel=document.createElement('section');
    panel.id='journeyPanel';
    panel.className='journey-panel';
    panel.innerHTML=`<div class="eyebrow">Seu percurso</div><h2>Você está aqui.</h2><p>Um resumo compacto para retomar o estudo sem procurar onde parou.</p><div class="journey-grid"><div class="journey-item"><strong>${esc(overall)}</strong><span>Progresso geral</span></div>${yearCards.map(item=>`<div class="journey-item"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`).join('')}</div><div class="journey-next"><span>Agora</span><a href="${esc(nextHref)}">${esc(nextTitle)} →</a></div>`;
    $('.hero').insertAdjacentElement('afterend',panel);
  }

  async function loadTimeline(){
    if(timelineCache)return timelineCache;
    const response=await fetch('./timeline.json',{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    timelineCache=await response.json();
    return timelineCache;
  }

  function eventHtml(event){
    const courses=Array.isArray(event.courses)?event.courses:[];
    return `<article class="timeline-event" data-timeline-search="${esc(`${event.date||''} ${event.title||''} ${event.summary||''} ${courses.join(' ')}`.toLowerCase())}"><time>${esc(event.date||'')}</time><div><h3>${esc(event.title||'Marco histórico')}</h3><p>${esc(event.summary||'')}</p>${courses.length?`<div class="timeline-course-links">${courses.map(id=>`<a href="#/course/${esc(id)}">${esc(titleFromId(id))}</a>`).join('')}</div>`:''}</div></article>`;
  }

  function bindTimelineSearch(){
    const input=$('#timelineSearch');
    const counter=$('#timelineCount');
    if(!input)return;
    input.oninput=()=>{
      const needle=input.value.trim().toLocaleLowerCase('pt-BR');
      let visible=0;
      all('[data-timeline-search]').forEach(card=>{
        const show=!needle||card.dataset.timelineSearch.includes(needle);
        card.hidden=!show;
        if(show)visible+=1;
      });
      if(counter)counter.textContent=`${visible} ${visible===1?'marco':'marcos'}`;
    };
  }

  async function renderTimeline(){
    const app=$('#app');
    if(!app||route()[0]!=='timeline'||app.dataset.ecosystemTimeline==='true')return;
    app.dataset.ecosystemTimeline='true';
    app.innerHTML='<div class="empty">Carregando cronologia…</div>';
    try{
      const data=await loadTimeline();
      const axes=Array.isArray(data.axes)?data.axes:[];
      const events=Array.isArray(data.events)?data.events:[];
      app.innerHTML=`<div class="timeline-page"><header class="page-header"><div class="eyebrow">Cronologia Mestra</div><h1>Localize simultaneidades antes de explicar processos.</h1><p class="lead">${esc(data.intro||'Use a cronologia como orientação e volte às disciplinas para aprofundar causas, experiências e debates.')}</p></header>${axes.length?`<section><div class="section-head"><div><h2>Eixos transversais</h2><p>Perguntas que atravessam épocas e regiões.</p></div></div><div class="timeline-axes">${axes.map(axis=>`<article class="timeline-axis"><h3>${esc(axis.title)}</h3><p>${esc(axis.description)}</p></article>`).join('')}</div></section>`:''}<section><div class="timeline-tools"><div><div class="eyebrow">Linha do tempo</div><h2>Marcos de longa duração</h2></div><div><input id="timelineSearch" type="search" placeholder="Buscar evento, período ou disciplina…"><div id="timelineCount" style="margin-top:7px;color:var(--muted);font-size:12px">${events.length} marcos</div></div></div><div class="timeline-events">${events.map(eventHtml).join('')}</div></section></div>`;
      bindTimelineSearch();
      scrollTo(0,0);
    }catch(error){
      app.innerHTML=`<div class="empty"><h2>Não foi possível carregar a cronologia</h2><p>${esc(error.message)}</p><a href="#/curriculo">Voltar ao currículo</a></div>`;
    }
  }

  function markCurrentNav(){
    const parts=route();
    all('#topNav a').forEach(link=>link.removeAttribute('aria-current'));
    let selector='a[href="#/"]';
    if(parts[0]==='curriculo'||parts[0]==='course')selector='a[href="#/curriculo"]';
    else if(parts[0]==='timeline')selector='a[href="#/timeline"]';
    else if(parts[0]==='debates'||parts[0]==='debate')selector='a[href="#/debates"]';
    else if(parts[0]==='metodo')selector='a[href="#/metodo"]';
    const current=$(`#topNav ${selector}`);
    if(current)current.setAttribute('aria-current','page');
  }

  function enhance(){
    if(route()[0]==='timeline')renderTimeline();
    else{
      const app=$('#app');
      if(app)delete app.dataset.ecosystemTimeline;
      addJourney();
    }
    markCurrentNav();
  }

  const app=$('#app');
  if(app)new MutationObserver(()=>setTimeout(enhance,0)).observe(app,{childList:true,subtree:false});
  addEventListener('hashchange',()=>setTimeout(enhance,0));
  addEventListener('DOMContentLoaded',enhance);
  setTimeout(enhance,0);
})();
