const ANCHOR_SELECTOR = '#tocList a[data-toc-link]';
const TARGET_SELECTOR = '#articleContent h2[id], #articleContent h3[id], #articleContent h4[id]';

window.addEventListener('click', event => {
  const link = event.target.closest?.(ANCHOR_SELECTOR);
  if (!link) return;

  const id = link.dataset.tocLink;
  const heading = id ? document.getElementById(id) : null;
  if (!heading) return;

  event.preventDefault();
  scrollToHeading(heading);
  setActiveLink(link);
  history.replaceState(null, '', `${location.pathname}${location.search}#${encodeURIComponent(id)}`);
}, true);

window.addEventListener('hashchange', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const heading = id ? document.getElementById(id) : null;
  if (heading) scrollToHeading(heading, { behavior: 'auto' });
});

function scrollToHeading(heading, options = {}) {
  const top = heading.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
  window.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior: options.behavior || 'smooth'
  });
}

function getAnchorOffset() {
  const topbar = document.querySelector('.reader-top');
  const topbarHeight = topbar?.getBoundingClientRect().height || 0;
  return Math.ceil(topbarHeight + 28);
}

function setActiveLink(link) {
  const list = link.closest('#tocList');
  list?.querySelectorAll('.is-active').forEach(item => item.classList.remove('is-active'));
  link.classList.add('is-active');
}

const observer = new MutationObserver(() => {
  document.querySelectorAll(TARGET_SELECTOR).forEach(heading => {
    heading.style.scrollMarginTop = `${getAnchorOffset()}px`;
  });
});

const content = document.querySelector('#articleContent');
if (content) observer.observe(content, { childList: true, subtree: true });
