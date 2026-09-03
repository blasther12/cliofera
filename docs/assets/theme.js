(() => {
  const KEY = 'cliofera-theme-v1';
  const root = document.documentElement;
  const system = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const current = () => localStorage.getItem(KEY) || system();

  function apply(theme, persist = false) {
    root.dataset.theme = theme;
    if (persist) localStorage.setItem(KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1216' : '#171611');
    const button = document.getElementById('themeToggle');
    if (button) {
      const label = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
      button.textContent = label;
      button.setAttribute('aria-label', label);
      button.title = label;
    }
  }

  apply(current());

  addEventListener('DOMContentLoaded', () => {
    apply(current());
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next, true);
    });
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (!localStorage.getItem(KEY)) apply(system());
  });
})();
