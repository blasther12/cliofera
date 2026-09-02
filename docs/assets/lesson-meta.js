(() => {
  const app=()=>document.getElementById('app');
  const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const courses=()=>{try{return state?.data?.courses||[]}catch{return[]}};
  const courseById=id=>courses().find(course=>course.id===id);
  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  const difficulty=course=>course.year<=1?'Fundamental':course.year===2?'Intermediário':course.year===3?'Avançado':'Síntese e pesquisa';
  const estimated=(course,index)=>{
    const base=course.year<=1?75:90;
    const extra=index>=5?15:0;
    return `${base+extra}–${base+extra+30} min`;
  };

  function decorate(){
    const p=route();if(p[0]!=='course'||!p[1])return;const course=courseById(p[1]);if(!course)return;
    const detail=state.content?.[course.id];const lessons=detail?.modules||[];const prereqIds=window.clioferaStudyMap?.prerequisites?.[course.id]||[];const prereqs=prereqIds.map(courseById).filter(Boolean);
    document.querySelectorAll('.lesson-card').forEach((card,index)=>{
      const body=card.querySelector('.lesson-body');if(!body||body.querySelector('[data-lesson-meta]'))return;
      const previous=index>0?(lessons[index-1]?.title||course.modules?.[index-1]):null;
      const meta=document.createElement('div');meta.className='lesson-meta';meta.dataset.lessonMeta='true';
      meta.innerHTML=`<div><span class="eyebrow">Tempo estimado</span><strong>${estimated(course,index)}</strong></div><div><span class="eyebrow">Nível</span><strong>${difficulty(course)}</strong></div><div class="lesson-before"><span class="eyebrow">Antes desta aula</span>${previous?`<strong>${safe(previous)}</strong>`:prereqs.length?prereqs.map(item=>`<a href="#/course/${safe(item.id)}">${safe(item.title)}</a>`).join(''):'<strong>Sem pré-requisito obrigatório</strong>'}</div>`;
      body.insertBefore(meta,body.firstChild);
    });
  }

  const wait=()=>{if(courses().length>=30){window.clioferaStudyMap=window.clioferaStudyMap||null;decorate();const observer=new MutationObserver(()=>decorate());if(app())observer.observe(app(),{childList:true,subtree:true});addEventListener('hashchange',()=>setTimeout(decorate,120));return}setTimeout(wait,100)};wait();
})();
