(() => {
  let catalog=[];
  const app=()=>document.getElementById('app');
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const courses=()=>{try{return state?.data?.courses||[]}catch{return[]}};
  const courseById=id=>courses().find(course=>course.id===id);
  const entriesFor=id=>catalog.filter(entry=>(entry.courses||[]).includes(id));

  function injectNav(){const top=document.getElementById('topNav');if(top&&!top.querySelector('[data-biblio-nav]')){const method=[...top.children].find(el=>el.getAttribute?.('href')==='#/metodo');const a=document.createElement('a');a.href='#/bibliografia';a.textContent='Bibliografia';a.dataset.biblioNav='true';top.insertBefore(a,method||top.firstChild)}}

  function entryCard(entry){return `<article class="reading-guide-card structured-biblio"><div class="eyebrow">${safe(entry.type)}</div><h3>${safe(entry.author)} · ${safe(entry.title)}</h3><p><strong>Por que usar:</strong> ${safe(entry.why)}</p><p><strong>Edição/leitura:</strong> ${safe(entry.editionNote)}</p>${entry.isbn?`<p><strong>ISBN:</strong> ${safe(entry.isbn)}</p>`:''}${entry.url?`<a class="media-link" href="${safe(entry.url)}" target="_blank" rel="noopener noreferrer">Abrir referência ↗</a>`:''}</article>`}

  function page(filter=''){const q=filter.trim().toLocaleLowerCase('pt-BR');const entries=q?catalog.filter(entry=>`${entry.author} ${entry.title} ${entry.type} ${entry.why} ${(entry.courses||[]).map(id=>courseById(id)?.title||id).join(' ')}`.toLocaleLowerCase('pt-BR').includes(q)):catalog;return `<header class="page-header"><div class="eyebrow">Bibliografia estruturada</div><h1>Não apenas o que ler, mas para quê e em que condições.</h1><p class="lead">O catálogo registra a função da obra, orientação de edição/leitura e links quando a referência foi verificada. ISBN é opcional e só deve entrar quando conferido.</p></header><div class="searchbar"><input id="biblioSearch" type="search" placeholder="Buscar autor, obra, tipo ou disciplina…" value="${safe(filter)}"></div><p>${entries.length} referências estruturadas.</p><div class="reading-guide-grid">${entries.map(entryCard).join('')||'<div class="empty">Nada encontrado.</div>'}</div>`}

  function renderRoute(){const p=route();if(p[0]!=='bibliografia'||!app())return false;app().innerHTML=page();scrollTo(0,0);bind();return true}
  function bind(){const input=document.getElementById('biblioSearch');if(input)input.oninput=()=>{app().innerHTML=page(input.value);bind();const next=document.getElementById('biblioSearch');next.focus();next.setSelectionRange(next.value.length,next.value.length)}}

  function enhanceCourse(){const p=route();if(p[0]!=='course'||!p[1]||!catalog.length)return;const matches=entriesFor(p[1]);if(!matches.length||app()?.querySelector('[data-structured-biblio]'))return;const section=document.createElement('section');section.className='section';section.dataset.structuredBiblio='true';section.innerHTML=`<div class="rich-heading"><div><div class="eyebrow">Bibliografia estruturada</div><h2>Edições, função e orientação de leitura</h2></div><p>Metadados complementares para algumas obras centrais.</p></div><div class="reading-guide-grid">${matches.map(entryCard).join('')}</div>`;app().appendChild(section)}

  async function init(){try{const res=await fetch('./bibliography.json',{cache:'no-store'});if(res.ok)catalog=(await res.json()).entries||[]}catch{}injectNav();addEventListener('hashchange',()=>setTimeout(()=>{if(!renderRoute())enhanceCourse();injectNav()},90));const observer=new MutationObserver(()=>{injectNav();if(route()[0]!=='bibliografia')enhanceCourse()});if(app())observer.observe(app(),{childList:true,subtree:false});setTimeout(()=>{if(!renderRoute())enhanceCourse()},130)}
  init();
})();
