(() => {
  const STORAGE_KEY = 'cliofera-question-answers-v1';
  let answerKey = { courses: {} };

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const read = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
  const write = value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  const answerId = (courseId, lessonIndex, questionIndex) => `${courseId}::${lessonIndex}::${questionIndex}`;

  function setMode(body, mode) {
    body.dataset.qaMode = mode;
    body.querySelectorAll(':scope > .lesson-tab-content').forEach(node => { node.hidden = mode !== 'content'; });
    body.querySelector(':scope > .lesson-questions-panel')?.toggleAttribute('hidden', mode !== 'questions');
    body.querySelector(':scope > .lesson-answers-panel')?.toggleAttribute('hidden', mode !== 'answers');
    body.querySelectorAll(':scope > .lesson-tabs button').forEach(button => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function questionsPanel(courseId, lessonIndex, entry) {
    const saved = read();
    return `<section class="lesson-questions-panel" hidden>
      <div class="qa-intro"><div class="eyebrow">Antes de conferir</div><h3>Escreva com suas palavras</h3><p>Não precisa parecer resposta de prova. Tente formular a ideia central e explicar por quê.</p></div>
      <div class="qa-list">${entry.answers.map((item, questionIndex) => {
        const id = answerId(courseId, lessonIndex, questionIndex);
        return `<article class="qa-question"><div class="qa-number">${questionIndex + 1}</div><div><h4>${esc(item.question)}</h4><textarea data-answer-id="${esc(id)}" placeholder="Escreva sua resposta antes de conferir a resposta comentada…">${esc(saved[id] || '')}</textarea><small class="qa-save-state">Salvo neste dispositivo</small></div></article>`;
      }).join('')}</div>
    </section>`;
  }

  function answersPanel(courseId, lessonIndex, entry) {
    const saved = read();
    return `<section class="lesson-answers-panel" hidden>
      <div class="qa-intro"><div class="eyebrow">Respostas comentadas</div><h3>Compare raciocínios, não frases</h3><p>Estas são respostas-modelo construídas a partir do conteúdo da aula. Em questões interpretativas, outras respostas podem ser defensáveis se forem bem argumentadas e sustentadas por evidências.</p></div>
      <div class="qa-list">${entry.answers.map((item, questionIndex) => {
        const id = answerId(courseId, lessonIndex, questionIndex);
        const own = saved[id];
        return `<article class="qa-answer-card">
          <div class="qa-number">${questionIndex + 1}</div>
          <div class="qa-answer-main">
            <h4>${esc(item.question)}</h4>
            <div class="qa-own-answer"><strong>Sua resposta</strong><p>${own ? esc(own) : '<em>Você ainda não registrou uma resposta para comparar.</em>'}</p></div>
            <details open><summary>Resposta possível</summary><p>${esc(item.shortAnswer)}</p></details>
            ${item.commentary && item.commentary !== item.shortAnswer ? `<details><summary>Entenda o raciocínio</summary><p>${esc(item.commentary)}</p></details>` : ''}
            ${item.keyPoints?.length ? `<div class="qa-keypoints"><strong>Pontos importantes</strong><div>${item.keyPoints.map(point => `<span>${esc(point)}</span>`).join('')}</div></div>` : ''}
            <div class="qa-caution"><strong>Cuidado metodológico</strong><p>${esc(item.caution)}</p></div>
            <div class="qa-selfcheck"><strong>Compare sua resposta</strong><label><input type="checkbox"> Identifiquei a ideia principal</label><label><input type="checkbox"> Expliquei usando o contexto da aula</label><label><input type="checkbox"> Considerei limites ou exceções</label></div>
          </div>
        </article>`;
      }).join('')}</div>
    </section>`;
  }

  function installLessonTabs() {
    const [, courseId] = route();
    if (!courseId || route()[0] !== 'course') return;
    const entries = answerKey.courses?.[courseId] || {};
    document.querySelectorAll('.lesson-card').forEach((card, lessonIndex) => {
      const body = card.querySelector('.lesson-body');
      const entry = entries[String(lessonIndex)];
      if (!body || !entry?.answers?.length || body.dataset.answersInstalled === 'true') return;
      body.dataset.answersInstalled = 'true';

      [...body.children].forEach(child => {
        if (child.matches('.lesson-section') && /perguntas|confira se/i.test(child.textContent || '')) child.hidden = true;
        else child.classList.add('lesson-tab-content');
      });

      const tabs = document.createElement('div');
      tabs.className = 'lesson-tabs';
      tabs.setAttribute('role', 'tablist');
      tabs.innerHTML = '<button type="button" class="active" data-mode="content" role="tab" aria-selected="true">Conteúdo</button><button type="button" data-mode="questions" role="tab" aria-selected="false">Perguntas</button><button type="button" data-mode="answers" role="tab" aria-selected="false">Respostas comentadas</button>';
      body.prepend(tabs);
      body.insertAdjacentHTML('beforeend', questionsPanel(courseId, lessonIndex, entry));
      body.insertAdjacentHTML('beforeend', answersPanel(courseId, lessonIndex, entry));

      tabs.addEventListener('click', event => {
        const button = event.target.closest('button[data-mode]');
        if (!button) return;
        setMode(body, button.dataset.mode);
        body.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      body.querySelectorAll('textarea[data-answer-id]').forEach(textarea => {
        textarea.addEventListener('input', () => {
          const data = read();
          data[textarea.dataset.answerId] = textarea.value;
          write(data);
          const status = textarea.parentElement.querySelector('.qa-save-state');
          if (status) status.textContent = textarea.value.trim() ? 'Resposta salva neste dispositivo' : 'Resposta vazia';
        });
      });
    });
  }

  fetch('./answers.json').then(response => response.ok ? response.json() : { courses: {} }).then(data => {
    answerKey = data;
    installLessonTabs();
    const observer = new MutationObserver(() => installLessonTabs());
    const app = document.getElementById('app');
    if (app) observer.observe(app, { childList: true, subtree: true });
    addEventListener('hashchange', () => setTimeout(installLessonTabs, 80));
  }).catch(() => {});
})();
