(() => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  const isChromeAndroid = isAndroid && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  const originalInstallUI = installUI;
  const originalInstall = install;

  const setInstallControls = ({ text, buttonText, ariaLabel }) => {
    const nav = $('#installApp');
    const section = $('#installSection');
    if (nav) {
      nav.hidden = false;
      nav.textContent = 'Instalar';
      nav.setAttribute('aria-label', ariaLabel || 'Instalar Cliofera');
    }
    if (section && innerWidth <= 760) {
      section.hidden = false;
      const button = $('#installDashboardButton');
      const copy = $('#installText');
      if (copy) copy.innerHTML = text;
      if (button) {
        button.hidden = false;
        button.textContent = buttonText;
      }
    }
  };

  function closeInstallGuide() {
    const guide = document.getElementById('installGuide');
    if (guide) guide.hidden = true;
  }

  function guideMarkup(platform) {
    if (platform === 'ios') {
      return `
        <section class="install-guide-card">
          <div class="install-guide-head">
            <div>
              <div class="eyebrow">Instalar no iPhone ou iPad</div>
              <h2 id="installGuideTitle">Adicionar Cliofera à Tela de Início</h2>
              <p>No iOS, a instalação é concluída pelo menu do Safari.</p>
            </div>
            <button class="install-guide-close" type="button" aria-label="Fechar">×</button>
          </div>
          ${!isSafari ? '<p class="install-guide-browser-warning"><strong>Abra esta página no Safari.</strong> O iPhone só oferece o fluxo de app web completo pelo menu do Safari.</p>' : ''}
          <ol class="install-steps">
            <li>No Safari, toque em <strong>Compartilhar</strong> <span class="install-share-symbol">↥</span>. Dependendo da versão do iOS, pode ser necessário tocar primeiro em <strong>Mais</strong>.</li>
            <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Mantenha <strong>Abrir como App da Web</strong> ativado.</li>
            <li>Toque em <strong>Adicionar</strong>. A Cliofera passará a abrir como aplicativo.</li>
          </ol>
          <p class="install-guide-note"><strong>Não encontrou a opção?</strong> No menu de compartilhamento, vá até <strong>Editar Ações</strong> e habilite “Adicionar à Tela de Início”.</p>
        </section>`;
    }

    return `
      <section class="install-guide-card">
        <div class="install-guide-head">
          <div>
            <div class="eyebrow">Instalar no Android</div>
            <h2 id="installGuideTitle">Adicionar Cliofera como aplicativo</h2>
            <p>Quando o navegador disponibiliza o prompt nativo, a Cliofera usa esse fluxo. Caso ele não apareça, você ainda pode instalar pelo menu.</p>
          </div>
          <button class="install-guide-close" type="button" aria-label="Fechar">×</button>
        </div>
        ${!isChromeAndroid ? '<p class="install-guide-browser-warning">Os nomes abaixo podem variar no seu navegador. No Chrome, o fluxo costuma aparecer diretamente como <strong>Instalar app</strong>.</p>' : ''}
        <ol class="install-steps">
          <li>Abra o menu do navegador <strong>⋮</strong>.</li>
          <li>Toque em <strong>Instalar app</strong> ou em <strong>Adicionar à tela inicial</strong>.</li>
          <li>Confirme em <strong>Instalar</strong>. O ícone da Cliofera será adicionado ao dispositivo.</li>
        </ol>
        <p class="install-guide-note"><strong>Dica:</strong> se “Instalar app” não estiver disponível, recarregue a página no Chrome e verifique se a Cliofera ainda não está instalada.</p>
      </section>`;
  }

  function showInstallGuide(platform) {
    if (standalone()) return;

    let guide = document.getElementById('installGuide');
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'installGuide';
      guide.className = 'install-guide';
      guide.hidden = true;
      guide.setAttribute('role', 'dialog');
      guide.setAttribute('aria-modal', 'true');
      guide.setAttribute('aria-labelledby', 'installGuideTitle');
      document.body.appendChild(guide);
      guide.addEventListener('click', event => {
        if (event.target === guide) closeInstallGuide();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeInstallGuide();
      });
    }

    guide.innerHTML = guideMarkup(platform);
    guide.querySelector('.install-guide-close').addEventListener('click', closeInstallGuide);
    guide.hidden = false;
  }

  installUI = function () {
    const section = $('#installSection');
    const nav = $('#installApp');

    if (standalone()) {
      if (section) section.hidden = true;
      if (nav) nav.hidden = true;
      return;
    }

    if (isIOS) {
      setInstallControls({
        text: 'No iPhone/iPad, use <strong>Safari → Compartilhar → Adicionar à Tela de Início</strong>.',
        buttonText: 'Como instalar no iPhone',
        ariaLabel: 'Como instalar a Cliofera no iPhone ou iPad'
      });
      return;
    }

    if (isAndroid) {
      setInstallControls({
        text: installPrompt
          ? 'A Cliofera pode ser instalada como aplicativo neste Android.'
          : 'No Android, use o menu do navegador e escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.',
        buttonText: installPrompt ? 'Instalar Cliofera' : 'Como instalar no Android',
        ariaLabel: 'Instalar a Cliofera no Android'
      });
      return;
    }

    originalInstallUI();
  };

  install = async function () {
    if (standalone()) return;
    if (isIOS) {
      showInstallGuide('ios');
      return;
    }
    if (isAndroid) {
      if (installPrompt) return originalInstall();
      showInstallGuide('android');
      return;
    }
    return originalInstall();
  };

  addEventListener('appinstalled', () => {
    installPrompt = null;
    installUI();
  });
})();
