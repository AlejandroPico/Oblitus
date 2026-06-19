const MOBILE_ARTICLE_TOOLS_QUERY = '(max-width: 760px)';

initMobileArticleTools();

function initMobileArticleTools() {
  const tools = document.querySelector('.article-tools');
  const layout = document.querySelector('.article-layout');
  const menu = document.querySelector('#topbarMenu');
  const topbar = document.querySelector('.topbar');
  const toggle = document.querySelector('#mobileMenuToggle');

  if (!tools || !layout || !menu || !topbar || !toggle) return;

  const placeholder = document.createComment('article-tools-original-position');
  tools.before(placeholder);

  const mobileQuery = window.matchMedia(MOBILE_ARTICLE_TOOLS_QUERY);

  const sync = () => {
    if (mobileQuery.matches) {
      if (!tools.classList.contains('is-mobile-docked')) {
        tools.classList.add('is-mobile-docked');
        menu.append(tools);
      }
      return;
    }

    if (tools.classList.contains('is-mobile-docked')) {
      tools.classList.remove('is-mobile-docked');
      placeholder.after(tools);
      closeMobileMenu(topbar, menu, toggle);
    }
  };

  tools.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !tools.contains(link) || !mobileQuery.matches) return;
    window.requestAnimationFrame(() => closeMobileMenu(topbar, menu, toggle));
  });

  sync();
  mobileQuery.addEventListener?.('change', sync);
  window.addEventListener('resize', sync, { passive: true });
}

function closeMobileMenu(topbar, menu, toggle) {
  topbar.dataset.mobileOpen = 'false';
  menu.classList.remove('is-mobile-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
}
