(() => {
  const nav = document.getElementById('topNav');
  const menu = document.getElementById('menuButton');
  const switcher = document.querySelector('.space-switcher');
  if (!nav || !menu) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    if (switcher) switcher.open = false;
  };

  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => {
    requestAnimationFrame(() => {
      menu.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.topbar')) closeMenu();
  });

  addEventListener('resize', () => {
    if (innerWidth > 1180) closeMenu();
  });
})();
