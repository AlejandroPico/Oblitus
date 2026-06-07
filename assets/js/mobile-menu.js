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
  const mobileQuery = window.matchMedia('(max-width: 760px)');

  if (!source || !title || !topbar) return;

  let docked = false;
  let ticking = false;
  let activeAnimation = null;

  setDocked(false, { instant: true });

  const evaluate = ({ instant = false } = {}) => {
    ticking = false;

    if (!mobileQuery.matches) {
      setDocked(false, { instant: true });
      return;
    }

    const sourceRect = source.getBoundingClientRect();
    const topbarRect = topbar.getBoundingClientRect();
    const shouldDock = window.scrollY > 8 && sourceRect.bottom <= topbarRect.bottom + 6;

    if (shouldDock === docked) return;
    setDocked(shouldDock, { instant });
  };

  const requestEvaluation = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => evaluate());
  };

  window.addEventListener('scroll', requestEvaluation, { passive: true });
  window.addEventListener('resize', () => evaluate({ instant: true }));
  mobileQuery.addEventListener?.('change', () => evaluate({ instant: true }));

  window.requestAnimationFrame(() => evaluate({ instant: true }));

  function setDocked(nextDocked, { instant = false } = {}) {
    if (activeAnimation) {
      activeAnimation.cancel();
      activeAnimation = null;
    }

    const previousDocked = docked;
    docked = nextDocked;
    topbar.classList.toggle('has-docked-title', docked);

    if (instant || previousDocked === docked) {
      title.classList.toggle('is-visible', docked);
      title.setAttribute('aria-hidden', String(!docked));
      return;
    }

    animateTitleTransfer({ toDock: docked });
  }

  function animateTitleTransfer({ toDock }) {
    const fromRect = toDock ? source.getBoundingClientRect() : title.getBoundingClientRect();
    const toRect = toDock ? title.getBoundingClientRect() : source.getBoundingClientRect();

    if (!isUsableRect(fromRect) || !isUsableRect(toRect)) {
      title.classList.toggle('is-visible', toDock);
      title.setAttribute('aria-hidden', String(!toDock));
      return;
    }

    const ghost = document.createElement('div');
    ghost.className = 'mobile-title-ghost';
    ghost.textContent = source.textContent.trim();
    document.body.append(ghost);

    const sourceStyle = window.getComputedStyle(source);
    ghost.style.fontFamily = sourceStyle.fontFamily;
    ghost.style.fontWeight = sourceStyle.fontWeight;
    ghost.style.letterSpacing = sourceStyle.letterSpacing;
    ghost.style.color = window.getComputedStyle(title).color;
    ghost.style.left = `${fromRect.left}px`;
    ghost.style.top = `${fromRect.top}px`;
    ghost.style.width = `${fromRect.width}px`;
    ghost.style.height = `${fromRect.height}px`;
    ghost.style.fontSize = `${Math.min(parseFloat(sourceStyle.fontSize), 42)}px`;
    ghost.style.lineHeight = sourceStyle.lineHeight;

    title.classList.remove('is-visible');
    title.setAttribute('aria-hidden', 'true');

    const scaleX = toRect.width / Math.max(1, fromRect.width);
    const scaleY = toRect.height / Math.max(1, fromRect.height);
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;

    activeAnimation = ghost.animate([
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        filter: 'blur(0px)'
      },
      {
        opacity: 0.88,
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
        filter: 'blur(0px)'
      }
    ], {
      duration: 420,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      fill: 'forwards'
    });

    activeAnimation.onfinish = () => {
      ghost.remove();
      activeAnimation = null;
      title.classList.toggle('is-visible', toDock);
      title.setAttribute('aria-hidden', String(!toDock));
    };

    activeAnimation.oncancel = () => ghost.remove();
  }
}

function setMobileMenuOpen(isOpen, topbar, menu, toggle) {
  topbar.dataset.mobileOpen = String(isOpen);
  menu.classList.toggle('is-mobile-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
}

function isUsableRect(rect) {
  return rect && rect.width > 1 && rect.height > 1;
}
