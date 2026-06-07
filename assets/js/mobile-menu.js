export function initMobileMenu() {
  const toggle = document.querySelector('#mobileMenuToggle');
  const topbar = document.querySelector('.topbar');
  const menu = document.querySelector('.nav-actions');

  if (!toggle || !topbar || !menu) return;

  toggle.addEventListener('click', event => {
    event.stopPropagation();
    const isOpen = topbar.dataset.mobileOpen === 'true';
    setMobileMenuOpen(!isOpen, topbar, menu, toggle);
  });

  menu.addEventListener('click', event => event.stopPropagation());

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMobileMenuOpen(false, topbar, menu, toggle));
  });

  document.addEventListener('click', () => setMobileMenuOpen(false, topbar, menu, toggle));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMobileMenuOpen(false, topbar, menu, toggle);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMobileMenuOpen(false, topbar, menu, toggle);
  });
}

export function initMobileTitleDocking({ sourceSelector, titleSelector = '#mobilePageTitle', topbarSelector = '.topbar' }) {
  const source = document.querySelector(sourceSelector);
  const title = document.querySelector(titleSelector);
  const topbar = document.querySelector(topbarSelector);

  if (!source || !title || !topbar || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    const shouldDock = !entry.isIntersecting;
    title.classList.toggle('is-visible', shouldDock);
    topbar.classList.toggle('has-docked-title', shouldDock);
    title.setAttribute('aria-hidden', String(!shouldDock));
  }, {
    root: null,
    threshold: 0,
    rootMargin: '-64px 0px 0px 0px'
  });

  observer.observe(source);
}

function setMobileMenuOpen(isOpen, topbar, menu, toggle) {
  topbar.dataset.mobileOpen = String(isOpen);
  menu.classList.toggle('is-mobile-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
}
