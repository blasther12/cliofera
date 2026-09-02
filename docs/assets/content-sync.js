(() => {
  let attempts = 0;

  function syncDetailedModules() {
    attempts += 1;

    if (typeof state === 'undefined' || !state.data || !state.content || !state.data.courses) {
      if (attempts < 200) setTimeout(syncDetailedModules, 25);
      return;
    }

    let changed = false;

    for (const course of state.data.courses) {
      const lessons = state.content[course.id]?.modules;
      if (!Array.isArray(lessons) || !lessons.length) continue;

      const titles = lessons.map(lesson => lesson.title);
      if (course.modules.length !== titles.length || course.modules.some((title, index) => title !== titles[index])) {
        course.modules = titles;
        changed = true;
      }
    }

    if (changed && typeof page === 'function') page();
  }

  syncDetailedModules();
})();
