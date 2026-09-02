(() => {
  let catalog = null;
  const app = document.querySelector('#app');

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function currentCourseId() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    return parts[0] === 'course' ? parts[1] : null;
  }

  function lessonCard(lesson, index) {
    return `
      <details class="lesson-card" ${index === 0 ? 'open' : ''}>
        <summary>
          <span class="lesson-number">${String(index + 1).padStart(2, '0')}</span>
          <span>
            <small>Mini-aula</small>
            <strong>${escapeHtml(lesson.title)}</strong>
          </span>
        </summary>
        <div class="lesson-body">
          <div class="lesson-explanation">
            ${lesson.explanation.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>

          <div class="lesson-subsection">
            <h4>Conceitos-chave</h4>
            <div class="concept-list">
              ${lesson.concepts.map(c => `<span>${escapeHtml(c)}</span>`).join('')}
            </div>
          </div>

          <div class="lesson-reading">
            <div class="eyebrow">Leitura para este módulo</div>
            <h4>${escapeHtml(lesson.reading.work)}</h4>
            <p><strong>Onde focar:</strong> ${escapeHtml(lesson.reading.focus)}</p>
            <p><strong>Por que ler:</strong> ${escapeHtml(lesson.reading.why)}</p>
          </div>

          <div class="lesson-columns">
            <div class="lesson-subsection">
              <h4>Perguntas para pensar</h4>
              <ul>${lesson.questions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
            </div>
            <div class="exercise-box">
              <div class="eyebrow">Exercício</div>
              <p>${escapeHtml(lesson.exercise)}</p>
            </div>
          </div>
        </div>
      </details>`;
  }

  function readingCard(reading) {
    return `
      <article class="reading-guide-card">
        <div class="reading-priority">${escapeHtml(reading.priority)}</div>
        <h4>${escapeHtml(reading.work)}</h4>
        <p class="reading-role">${escapeHtml(reading.role)}</p>
        <div class="reading-instruction"><strong>Como ler</strong><p>${escapeHtml(reading.how)}</p></div>
        <div class="reading-instruction"><strong>Depois da leitura</strong><p>${escapeHtml(reading.after)}</p></div>
      </article>`;
  }

  function renderContent(courseId, content) {
    if (!app || app.querySelector('.course-study-content')) return;
    const layout = app.querySelector('.content-layout');
    if (!layout) return;

    const section = document.createElement('section');
    section.className = 'course-study-content';
    section.innerHTML = `
      <div class="course-content-intro panel">
        <div class="eyebrow">Conteúdo da disciplina</div>
        <h2>Antes do checklist, entenda o terreno.</h2>
        <p class="course-intro-text">${escapeHtml(content.intro)}</p>

        <div class="content-objectives">
          <h3>Ao terminar esta disciplina, você deverá conseguir</h3>
          <ul>${content.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
        </div>
      </div>

      <nav class="course-content-nav" aria-label="Seções do conteúdo">
        <a href="#course-lessons">Mini-aulas</a>
        <a href="#reading-guide">Guia de leitura</a>
        <a href="#course-project">Projeto final</a>
      </nav>

      <section id="course-lessons" class="course-content-section">
        <div class="section-head">
          <div>
            <div class="eyebrow">Entenda</div>
            <h2>Mini-aulas</h2>
            <p>Leia a explicação antes de marcar o módulo como concluído.</p>
          </div>
        </div>
        <div class="lesson-stack">
          ${content.modules.map(lessonCard).join('')}
        </div>
      </section>

      <section id="reading-guide" class="course-content-section">
        <div class="section-head">
          <div>
            <div class="eyebrow">Leia com intenção</div>
            <h2>Guia de leitura</h2>
            <p>Não é apenas uma bibliografia. Cada obra tem uma função no percurso.</p>
          </div>
        </div>
        <div class="reading-guide-grid">
          ${content.readingGuide.map(readingCard).join('')}
        </div>
      </section>

      <section id="course-project" class="course-content-section final-project-card">
        <div class="eyebrow">Produza</div>
        <h2>${escapeHtml(content.finalProject.title)}</h2>
        <p>${escapeHtml(content.finalProject.prompt)}</p>
        <h4>Critérios de revisão</h4>
        <ul>${content.finalProject.criteria.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      </section>`;

    layout.before(section);
  }

  async function enhance() {
    const courseId = currentCourseId();
    if (!courseId || !catalog) return;
    const content = catalog[courseId];
    if (content) renderContent(courseId, content);
  }

  async function init() {
    try {
      catalog = await fetch('./content.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
    } catch (error) {
      console.warn('Cliofera: conteúdo detalhado indisponível.', error);
      catalog = {};
    }

    const observer = new MutationObserver(() => enhance());
    if (app) observer.observe(app, { childList: true });
    addEventListener('hashchange', () => requestAnimationFrame(enhance));
    enhance();
  }

  init();
})();
