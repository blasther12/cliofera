(() => {
  const loadJson = async (path, fallback = {}) => {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const safe = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
  const resolveCourseId = id => id === 'segunda-guerra' ? 'fascismo-segunda-guerra' : id;

  Promise.all([
    loadJson('./extra-courses-review.json', { courses: [] }),
    loadJson('./content/extension-c1.json'),
    loadJson('./content/extension-c2.json'),
    loadJson('./literature-review.json'),
    loadJson('./media.json'),
    loadJson('./timeline.json', { axes: [], events: [] })
  ]).then(([reviewCourses, contentC1, contentC2, literatureReview, media, timeline]) => {
    let attempts = 0;

    const apply = () => {
      attempts += 1;
      if (typeof state === 'undefined' || !state.data || !state.content || !state.literature || typeof richCourseContent !== 'function') {
        if (attempts < 240) setTimeout(apply, 25);
        return;
      }

      state.media = media;
      state.timeline = timeline;
      Object.assign(state.content, contentC1, contentC2);
      Object.assign(state.literature, literatureReview);

      for (const course of reviewCourses.courses || []) {
        if (!state.data.courses.some(existing => existing.id === course.id)) state.data.courses.push(course);
      }

      const asiaSurvey = state.data.courses.find(course => course.id === 'historia-asia');
      if (asiaSurvey) {
        asiaSurvey.title = 'Panorama da História da Ásia';
        asiaSurvey.summary = 'Curso panorâmico para conectar China, Índia, Japão, Sudeste Asiático e redes eurasiáticas antes dos aprofundamentos regionais.';
      }

      for (const course of state.data.courses) {
        const lessons = state.content[course.id]?.modules;
        if (Array.isArray(lessons) && lessons.length) course.modules = lessons.map(lesson => lesson.title);
      }
      state.data.courses.sort((a, b) => a.year - b.year || a.semester - b.semester || a.title.localeCompare(b.title, 'pt-BR'));

      if (!window.__clioferaMediaWrapped) {
        window.__clioferaMediaWrapped = true;
        const baseRichCourseContent = richCourseContent;

        function mediaSection(course) {
          const entry = state.media?.[course.id] || {};
          const images = entry.images || [];
          const videos = entry.videos || [];
          const query = encodeURIComponent(`${course.title} história`);
          const commons = `https://commons.wikimedia.org/w/index.php?search=${query}&title=Special:MediaSearch&type=image`;
          const youtube = `https://www.youtube.com/results?search_query=${encodeURIComponent(course.title + ' história aula universidade')}`;

          const imageCards = images.map(image => `<article class="media-card"><a href="${safe(image.sourceUrl)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${safe(image.src)}" alt="${safe(image.title)}"></a><div class="media-card-body"><div class="eyebrow">Referência visual</div><h3>${safe(image.title)}</h3><p>${safe(image.caption)}</p><div class="media-meta">${safe(image.credit || '')}${image.license ? ` · ${safe(image.license)}` : ''}</div><div class="media-actions"><a class="media-link" href="${safe(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fonte e licença ↗</a></div></div></article>`).join('');
          const videoItems = videos.map(video => `<div class="video-item"><div><strong>${safe(video.title)}</strong><small>${safe(video.creator || 'YouTube')}</small>${video.note ? `<p>${safe(video.note)}</p>` : ''}</div><a class="media-link" href="${safe(video.url)}" target="_blank" rel="noopener noreferrer">Assistir / localizar ↗</a></div>`).join('');

          return `<section class="media-section"><div class="rich-heading"><div><div class="eyebrow">Aprofundamento audiovisual</div><h2>Imagens, mapas e vídeos</h2></div><p>Use mídia como fonte ou apoio de orientação e verifique autoria, contexto e edição.</p></div>${images.length ? `<div class="media-grid">${imageCards}</div>` : ''}<div class="panel" style="margin-top:${images.length ? '16px' : '0'}"><div class="video-list">${videoItems || '<p>Nenhum vídeo específico foi curado ainda para esta disciplina.</p>'}</div><div class="media-actions"><a class="media-link" href="${commons}" target="_blank" rel="noopener noreferrer">Pesquisar imagens no Wikimedia Commons ↗</a><a class="media-link" href="${youtube}" target="_blank" rel="noopener noreferrer">Pesquisar aulas no YouTube ↗</a></div></div></section>`;
        }

        richCourseContent = function(course, detail) {
          return baseRichCourseContent(course, detail) + mediaSection(course);
        };
      }

      function timelineHtml(filter = '') {
        const needle = filter.trim().toLowerCase();
        const events = (state.timeline?.events || []).filter(event => {
          if (!needle) return true;
          return `${event.date} ${event.title} ${event.summary}`.toLowerCase().includes(needle);
        });
        const axes = (state.timeline?.axes || []).map(axis => `<article class="timeline-axis"><h3>${safe(axis.title)}</h3><p>${safe(axis.description)}</p></article>`).join('');
        const eventHtml = events.map(event => {
          const related = (event.courses || []).map(resolveCourseId).map(id => state.data.courses.find(course => course.id === id)).filter(Boolean).map(course => `<a href="#/course/${safe(course.id)}">${safe(course.title)}</a>`).join('');
          return `<article class="timeline-event"><div class="timeline-date">${safe(event.date)}</div><div class="timeline-event-body"><h3>${safe(event.title)}</h3><p>${safe(event.summary)}</p>${related ? `<div class="timeline-courses">${related}</div>` : ''}</div></article>`;
        }).join('');
        return `<header class="page-header"><div class="eyebrow">Cronologia Mestra</div><h1>O mundo não acontece em capítulos separados.</h1><p class="lead">${safe(state.timeline?.intro || '')}</p><div class="timeline-header-actions"><a class="button secondary" href="#/curriculo">Voltar ao currículo</a></div></header><section><div class="rich-heading"><div><div class="eyebrow">Eixos transversais</div><h2>O que acompanhar em todos os períodos</h2></div></div><div class="timeline-axes">${axes}</div></section><section><div class="rich-heading"><div><div class="eyebrow">Longa duração</div><h2>Da Pré-História ao século XXI</h2></div><p>${events.length} marcos exibidos.</p></div><div class="timeline-filter"><input id="timelineSearch" type="search" placeholder="Filtrar por evento, período ou tema…" value="${safe(filter)}"></div><div class="timeline">${eventHtml || '<div class="empty">Nenhum marco encontrado.</div>'}</div></section>`;
      }

      function renderTimeline(filter = '') {
        const app = document.getElementById('app');
        if (!app) return;
        app.innerHTML = timelineHtml(filter);
        if (!filter) scrollTo(0, 0);
        const input = document.getElementById('timelineSearch');
        if (input) {
          input.focus();
          if (filter) input.setSelectionRange(filter.length, filter.length);
          input.addEventListener('input', event => renderTimeline(event.target.value));
        }
        if (typeof installUI === 'function') installUI();
      }

      const handleTimelineRoute = () => {
        const route = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)[0];
        if (route === 'timeline') setTimeout(() => renderTimeline(), 0);
      };
      addEventListener('hashchange', handleTimelineRoute);

      if (location.hash.replace(/^#\/?/, '').startsWith('timeline')) renderTimeline();
      else if (typeof page === 'function') page();
    };

    apply();
  });
})();
