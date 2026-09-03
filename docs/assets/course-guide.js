(() => {
  let guides = {};
  let timeline = { events: [] };
  const app = document.getElementById('app');
  if (!app) return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const courses = () => { try { return state?.data?.courses || []; } catch { return []; } };
  const courseById = id => courses().find(course => course.id === id);

  function relatedEvents(courseId) {
    return (timeline.events || [])
      .filter(event => (event.courses || []).includes(courseId))
      .slice(0, 6);
  }

  function render() {
    const p = route();
    if (p[0] !== 'course' || !p[1]) return;
    const course = courseById(p[1]);
    const guide = guides[p[1]];
    if (!course || !guide) return;
    if (document.querySelector('[data-teaching-guide]')) return;

    const header = document.querySelector('.page-header');
    if (!header) return;

    const existingMap = document.querySelector('[data-course-map]');
    if (existingMap) existingMap.hidden = true;
    const events = relatedEvents(course.id);

    const section = document.createElement('section');
    section.className = 'teaching-guide';
    section.dataset.teachingGuide = 'true';
    section.innerHTML = `
      <div class="teaching-guide-head">
        <div>
          <div class="eyebrow">Antes de começar</div>
          <h2>O que esta disciplina tenta explicar?</h2>
        </div>
      </div>
      <p class="teaching-guide-lead">${esc(guide.plain)}</p>
      <div class="teaching-guide-grid">
        <section>
          <div class="eyebrow">Perguntas-guia</div>
          <ol>${(guide.questions || []).map(item => `<li>${esc(item)}</li>`).join('')}</ol>
        </section>
        <section>
          <div class="eyebrow">Não perca de vista</div>
          <ul>${(guide.watch || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </section>
      </div>
      <details class="teaching-guide-details">
        <summary>Como este tema se conecta ao restante do currículo?</summary>
        <p>${esc(guide.connection || '')}</p>
      </details>
      ${events.length ? `<details class="teaching-guide-details"><summary>Marcos para se localizar no tempo</summary><div class="teaching-guide-events">${events.map(event => `<article><b>${esc(event.date)}</b><div><strong>${esc(event.title)}</strong><p>${esc(event.summary)}</p></div></article>`).join('')}</div></details>` : ''}
    `;

    header.after(section);
  }

  async function init() {
    try {
      const [guideResponse, timelineResponse] = await Promise.all([
        fetch('./course-guides.json', { cache: 'no-store' }),
        fetch('./timeline.json', { cache: 'no-store' })
      ]);
      if (guideResponse.ok) guides = await guideResponse.json();
      if (timelineResponse.ok) timeline = await timelineResponse.json();
    } catch {}

    const observer = new MutationObserver(() => requestAnimationFrame(render));
    observer.observe(app, { childList: true, subtree: true });
    addEventListener('hashchange', () => setTimeout(render, 100));
    render();
  }

  init();
})();
