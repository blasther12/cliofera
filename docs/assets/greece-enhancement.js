(() => {
  const loadJson = async path => {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : {};
    } catch {
      return {};
    }
  };

  Promise.all([
    loadJson('./content/greece-expansion.json'),
    loadJson('./literature-greece.json')
  ]).then(([greeceContent, greeceLiterature]) => {
    let attempts = 0;

    const apply = () => {
      attempts += 1;
      if (typeof state === 'undefined' || !state.data || !state.content || !state.literature) {
        if (attempts < 200) setTimeout(apply, 25);
        return;
      }

      Object.assign(state.content, greeceContent);
      Object.assign(state.literature, greeceLiterature);

      const course = state.data.courses?.find(c => c.id === 'antiguidade-ii');
      const detail = greeceContent['antiguidade-ii'];
      if (course && detail) {
        course.title = 'Grécia Antiga e Mundo Egeu';
        course.area = 'Grécia Antiga';
        course.summary = 'Minoicos, Micênicos, colapso da Idade do Bronze, Povos do Mar, Homero, pólis, Atenas, Esparta e mundo helenístico.';
        course.modules = detail.modules.map(module => module.title);
        course.readings = [
          'Homero — Ilíada',
          'Homero — Odisseia',
          'Hesíodo — Teogonia e Trabalhos e Dias',
          'Eric H. Cline — 1177 B.C.',
          'Oliver Dickinson — The Aegean from Bronze Age to Iron Age',
          'Heródoto — Histórias',
          'Tucídides — História da Guerra do Peloponeso'
        ];
      }

      if (typeof page === 'function') page();
    };

    apply();
  });
})();
