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
    [...body.children].forEach(node => {
      if (node.classList.contains('lesson-tabs')) {
        node.hidden = false;
        return;
      }
      if (node.classList.contains('lesson-questions-panel')) {
        node.hidden = mode !== 'questions';
        return;
      }
      if (node.classList.contains('lesson-answers-panel')) {
        node.hidden = mode !== 'answers';
        return;
      }
      node.hidden = mode !== 'content';
    });
    body.querySelectorAll(':scope > .lesson-tabs button').forEach(button => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function questionsPanel(courseId, lessonIndex, entry) {
    const saved = read();
    return `<section class="lesson-questions-panel" hidden>
      <div class="qa-intro"><div class="eyebrow">Perguntas</div><h3>Pense antes de conferir</h3><p>Responda com suas palavras. O objetivo é organizar o raciocínio, não escrever uma resposta de prova.</p></div>
      <div class="qa-list">${entry.answers.map((item, questionIndex) => {
        const id = answerId(courseId, lessonIndex, questionIndex);
        const own = saved[id] || '';
        return `<article class="qa-question"><div class="qa-number">${questionIndex + 1}</div><div class="qa-question-main"><h4>${esc(item.question)}</h4><textarea data-answer-id="${esc(id)}" placeholder="Sua resposta…">${esc(own)}</textarea><small class="qa-save-state">${own.trim() ? 'Resposta salva neste dispositivo' : ''}</small></div></article>`;
      }).join('')}</div>
      <div class="qa-panel-actions"><span>As respostas são salvas automaticamente neste dispositivo.</span><button type="button" class="qa-check-answers">Conferir respostas comentadas →</button></div>
    </section>`;
  }

  function answersPanel(courseId, lessonIndex, entry) {
    const saved = read();
    return `<section class="lesson-answers-panel" hidden>
      <div class="qa-intro"><div class="eyebrow">Respostas comentadas</div><h3>Compare raciocínios, não frases</h3><p>Estas são respostas possíveis construídas a partir da aula. Em História, outra resposta pode ser defensável quando usa contexto e evidências de forma consistente.</p></div>
      <div class="qa-list qa-answer-list">${entry.answers.map((item, questionIndex) => {
        const id = answerId(courseId, lessonIndex, questionIndex);
        const own = saved[id];
        return `<article class="qa-answer-card">
          <div class="qa-number">${questionIndex + 1}</div>
          <div class="qa-answer-main">
            <h4>${esc(item.question)}</h4>
            <div class="qa-own-answer"><strong>Sua resposta</strong><p>${own ? esc(own) : '<em>Você ainda não registrou uma resposta.</em>'}</p></div>
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
    const parts = route();
    const courseId = parts[0] === 'course' ? parts[1] : null;
    if (!courseId) return;
    const entries = answerKey.courses?.[courseId] || {};

    document.querySelectorAll('.lesson-card').forEach((card, lessonIndex) => {
      const body = card.querySelector('.lesson-body');
      const entry = entries[String(lessonIndex)];
      if (!body || !entry?.answers?.length) return;

      if (body.dataset.answersInstalled !== 'true') {
        body.dataset.answersInstalled = 'true';
        body.querySelectorAll(':scope > .lesson-section').forEach(section => {
          if (/perguntas|confira se/i.test(section.textContent || '')) section.remove();
        });

        const tabs = document.createElement('div');
        tabs.className = 'lesson-tabs';
        tabs.setAttribute('role', 'tablist');
        tabs.innerHTML = '<button type="button" class="active" data-mode="content" role="tab" aria-selected="true">Conteúdo</button><button type="button" data-mode="questions" role="tab" aria-selected="false">Perguntas</button><button type="button" data-mode="answers" role="tab" aria-selected="false">Respostas</button>';
        body.prepend(tabs);
        body.insertAdjacentHTML('beforeend', questionsPanel(courseId, lessonIndex, entry));
        body.insertAdjacentHTML('beforeend', answersPanel(courseId, lessonIndex, entry));

        tabs.addEventListener('click', event => {
          const button = event.target.closest('button[data-mode]');
          if (!button) return;
          setMode(body, button.dataset.mode);
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        body.querySelector('.qa-check-answers')?.addEventListener('click', () => {
          setMode(body, 'answers');
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        body.querySelectorAll('textarea[data-answer-id]').forEach(textarea => {
          textarea.addEventListener('input', () => {
            const data = read();
            const value = textarea.value;
            if (value.trim()) data[textarea.dataset.answerId] = value;
            else delete data[textarea.dataset.answerId];
            write(data);
            const status = textarea.parentElement.querySelector('.qa-save-state');
            if (status) status.textContent = value.trim() ? 'Resposta salva neste dispositivo' : '';
          });
        });
      }

      setMode(body, body.dataset.qaMode || 'content');
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
