(() => {
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  const originalInstallUI = installUI;
  const originalInstall = install;

  function closeInstallGuide() {
    const guide = document.getElementById('iosInstallGuide');
    if (guide) guide.hidden = true;
  }

  function showInstallGuide() {
    if (standalone()) return;

    let guide = document.getElementById('iosInstallGuide');
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'iosInstallGuide';
      guide.className = 'install-guide';
      guide.hidden = true;
      guide.setAttribute('role', 'dialog');
      guide.setAttribute('aria-modal', 'true');
      guide.setAttribute('aria-labelledby', 'iosInstallTitle');
      guide.innerHTML = `
        <section class="install-guide-card">
          <div class="install-guide-head">
            <div>
              <div class="eyebrow">Instalar no iPhone</div>
              <h2 id="iosInstallTitle">Adicionar Cliofera à Tela de Início</h2>
              <p>O iPhone não permite que um site dispare a instalação sozinho. A instalação é concluída pelo menu do Safari.</p>
            </div>
            <button class="install-guide-close" type="button" aria-label="Fechar">×</button>
          </div>
          ${!isSafari ? '<p class="install-guide-browser-warning"><strong>Primeiro abra esta página no Safari.</strong> O fluxo abaixo usa as ações do Safari do iPhone.</p>' : ''}
          <ol class="install-steps">
            <li>No Safari, toque em <strong>Compartilhar</strong> <span class="install-share-symbol">↥</span>. Dependendo do layout, toque primeiro em <strong>Mais</strong> e depois em <strong>Compartilhar</strong>.</li>
            <li>Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Ative <strong>Abrir como App da Web</strong>.</li>
            <li>Toque em <strong>Adicionar</strong>. A Cliofera aparecerá na Tela de Início e abrirá sem a interface normal do Safari.</li>
          </ol>
          <p class="install-guide-note"><strong>Não encontrou “Adicionar à Tela de Início”?</strong> Role até o fim da lista de ações, toque em <strong>Editar Ações</strong> e adicione essa opção.</p>
        </section>`;
      document.body.appendChild(guide);
      guide.querySelector('.install-guide-close').addEventListener('click', closeInstallGuide);
      guide.addEventListener('click', event => {
        if (event.target === guide) closeInstallGuide();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeInstallGuide();
      });
    }

    guide.hidden = false;
  }

  installUI = function () {
    if (!isIOS) {
      originalInstallUI();
      return;
    }

    const section = $('#installSection');
    const nav = $('#installApp');

    if (standalone()) {
      if (section) section.hidden = true;
      if (nav) nav.hidden = true;
      return;
    }

    if (nav) {
      nav.hidden = false;
      nav.textContent = 'Instalar';
      nav.setAttribute('aria-label', 'Como instalar a Cliofera no iPhone');
    }

    if (section && innerWidth <= 760) {
      section.hidden = false;
      const button = $('#installDashboardButton');
      const text = $('#installText');
      if (text) text.innerHTML = 'No iPhone, a instalação é feita pelo Safari em <strong>Compartilhar → Adicionar à Tela de Início</strong>.';
      if (button) {
        button.hidden = false;
        button.textContent = 'Como instalar';
      }
    }
  };

  install = async function () {
    if (isIOS) {
      showInstallGuide();
      return;
    }
    return originalInstall();
  };
})();
