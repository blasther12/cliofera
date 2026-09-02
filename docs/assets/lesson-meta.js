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
    const reading = route()[0] === 'course';
    document.body.classList.toggle('course-reading', reading);
    document.body.classList.toggle('lesson-reading-active', reading && !!document.querySelector('.lesson-card[open]'));
  }

  function makeOpening(body) {
    if (body.querySelector('.lesson-opening')) return body.querySelector('.lesson-opening');
    const firstParagraph = [...body.children].find(node => node.tagName === 'P');
    if (!firstParagraph) return null;

    const opening = document.createElement('section');
    opening.className = 'lesson-opening';
    opening.innerHTML = '<div class="eyebrow">Comece aqui</div>';
    body.insertBefore(opening, firstParagraph);
    opening.appendChild(firstParagraph);
    return opening;
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
      if (!body) return;

      const opening = makeOpening(body);
      let meta = body.querySelector('[data-lesson-meta]');
      if (!meta) {
        const previous = index > 0 ? (lessons[index - 1]?.title || course.modules?.[index - 1]) : null;
        const prior = previous
          ? `<span class="lesson-meta-prereq"><span>Antes</span><strong>${safe(previous)}</strong></span>`
          : prereqs.length
            ? `<span class="lesson-meta-prereq"><span>Antes</span>${prereqs.map(item => `<a href="#/course/${safe(item.id)}">${safe(item.title)}</a>`).join(' · ')}</span>`
            : '';

        meta = document.createElement('div');
        meta.className = 'lesson-meta';
        meta.dataset.lessonMeta = 'true';
        meta.setAttribute('aria-label', 'Informações da aula');
        meta.innerHTML = `
          <span class="lesson-meta-item"><span>Tempo</span><strong>${estimated(course, index)}</strong></span>
          <span class="lesson-meta-item"><span>Nível</span><strong>${difficulty(course)}</strong></span>
          ${prior}
        `;
      }

      if (opening && opening.nextElementSibling !== meta) opening.after(meta);
      else if (!opening && body.firstElementChild !== meta) body.prepend(meta);
    });

    updateReadingMode();
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
        document.addEventListener('toggle', event => {
          const card = event.target;
          if (!(card instanceof HTMLDetailsElement) || !card.classList.contains('lesson-card')) return;
          if (card.open && matchMedia('(max-width: 760px)').matches) {
            document.querySelectorAll('.lesson-card[open]').forEach(other => {
              if (other !== card) other.open = false;
            });
          }
          updateReadingMode();
        }, true);
        return;
      }
      setTimeout(wait, 100);
    };
    wait();
  }

  updateReadingMode();
  init();
})();
