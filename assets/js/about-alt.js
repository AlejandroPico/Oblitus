const ABOUT_EXTENDED_PARAM = 'vista';
const ABOUT_EXTENDED_VALUE = 'ampliada';

initAboutAltAccess();

function initAboutAltAccess() {
  applyAboutVisibility();
  document.addEventListener('click', handleAboutClick, true);
}

function handleAboutClick(event) {
  const link = event.target.closest?.('a[href]');
  if (!link || !isAboutLink(link)) return;

  const targetUrl = new URL(link.getAttribute('href'), window.location.href);

  if (event.altKey) {
    event.preventDefault();
    targetUrl.searchParams.set(ABOUT_EXTENDED_PARAM, ABOUT_EXTENDED_VALUE);
    window.location.href = targetUrl.toString();
    return;
  }

  if (isCurrentAboutPage() && targetUrl.searchParams.has(ABOUT_EXTENDED_PARAM)) {
    event.preventDefault();
    targetUrl.searchParams.delete(ABOUT_EXTENDED_PARAM);
    window.location.href = targetUrl.toString();
  }
}

function applyAboutVisibility() {
  if (!isCurrentAboutPage()) return;

  const params = new URLSearchParams(window.location.search);
  const extended = params.get(ABOUT_EXTENDED_PARAM) === ABOUT_EXTENDED_VALUE;
  document.documentElement.dataset.aboutExtended = String(extended);
}

function isCurrentAboutPage() {
  return normalisePath(window.location.pathname).endsWith('/sobre.html');
}

function isAboutLink(link) {
  const url = new URL(link.getAttribute('href'), window.location.href);
  const path = normalisePath(url.pathname);
  return path.endsWith('/sobre.html');
}

function normalisePath(pathname) {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}
