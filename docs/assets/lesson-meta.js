(() => {
  let studyMap = null;
  const app = () => document.getElementById('app');
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const courses = () => { try { return state?.data?.courses || []; } catch { return []; } };
  const courseById = id => courses().find(course => course.id === id);
  const safe = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const difficulty = course => course.year <= 1 ? 'Fundamental' : course.year === 2 ? 'Intermediário' : course.year === 3 ? 'Avançado' : 'Síntese e pesquisa';
  const estimated = (course, index) => {
    const base = course.year <= 1 ? 75 : 90;
    const extra = index >= 5 ? 15 : 0;
    return `${base + extra}–${base + extra + 30} min`;
  };

  function updateReadingMode() {
    document.body.classList.toggle('course-reading', route()[0] === 'course');
  }

  function decorate() {
    const p = route();
    updateReadingMode();
    if (p[0] !== 'course' || !p[1]) return;

    const course = courseById(p[1]);
    if (!course) return;

    const detail = state.content?.[course.id];
    const lessons = detail?.modules || [];
    const prereqIds = studyMap?.prerequisites?.[course.id] || [];
    const prereqs = prereqIds.map(courseById).filter(Boolean);

    document.querySelectorAll('.lesson-card').forEach((card, index) => {
      const body = card.querySelector('.lesson-body');
      if (!body || body.querySelector('[data-lesson-meta]')) return;

      const previous = index > 0 ? (lessons[index - 1]?.title || course.modules?.[index - 1]) : null;
      const prior = previous
        ? `<span class="lesson-meta-prereq"><span>Antes:</span> <strong>${safe(previous)}</strong></span>`
        : prereqs.length
          ? `<span class="lesson-meta-prereq"><span>Antes:</span> ${prereqs.map(item => `<a href="#/course/${safe(item.id)}">${safe(item.title)}</a>`).join(' · ')}</span>`
          : '';

      const meta = document.createElement('div');
      meta.className = 'lesson-meta';
      meta.dataset.lessonMeta = 'true';
      meta.setAttribute('aria-label', 'Informações da aula');
      meta.innerHTML = `
        <span class="lesson-meta-item"><span>Tempo</span><strong>${estimated(course, index)}</strong></span>
        <span class="lesson-meta-item"><span>Nível</span><strong>${difficulty(course)}</strong></span>
        ${prior}
      `;

      const explanation = body.querySelector('.lesson-explanation');
      if (explanation) explanation.after(meta);
      else body.insertBefore(meta, body.firstChild);
    });
  }

  async function init() {
    try {
      const res = await fetch('./study-map.json', { cache: 'no-store' });
      if (res.ok) studyMap = await res.json();
    } catch {}

    const wait = () => {
      if (courses().length >= 30) {
        decorate();
        const observer = new MutationObserver(() => decorate());
        if (app()) observer.observe(app(), { childList: true, subtree: true });
        addEventListener('hashchange', () => setTimeout(decorate, 120));
        return;
      }
      setTimeout(wait, 100);
    };
    wait();
  }

  updateReadingMode();
  init();
})();
