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

function setMobileMenuOpen(isOpen, topbar, menu, toggle) {
  topbar.dataset.mobileOpen = String(isOpen);
  menu.classList.toggle('is-mobile-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
}
