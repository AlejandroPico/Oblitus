import { initTemporalTheme } from './theme.js';
import { initMobileMenu } from './mobile-menu.js';

const params = new URLSearchParams(location.search);
const articleId = params.get('id');
let tocObserver = null;

const els = {
  themeToggle: document.querySelector('#themeToggle'),
  topTitle: document.querySelector('#readerTopTitle'),
  layout: document.querySelector('.article-layout'),
  tools: document.querySelector('.article-tools'),
  shell: document.querySelector('.article-shell'),
  category: document.querySelector('#articleCategory'),
  title: document.querySelector('#articleTitle'),
  subtitle: document.querySelector('#articleSubtitle'),
  meta: document.querySelector('#articleMeta'),
  badges: document.querySelector('#articleBadges'),
  content: document.querySelector('#articleContent'),
  toc: document.querySelector('#tocList'),
  collapseAll: document.querySelector('#collapseAll'),
  expandAll: document.querySelector('#expandAll')
};

init();

async function init() {
  initTemporalTheme(els.themeToggle);
  initMobileMenu();

  if (!articleId) {
    renderError('No se ha indicado ningún artículo.', 'Vuelve a la biblioteca y abre una publicación concreta.');
    return;
  }

  try {
    const manifestResponse = await fetch('assets/data/articles.generated.json', { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error(`No se ha podido cargar el índice (${manifestResponse.status})`);
    const manifest = await manifestResponse.json();
    const article = (manifest.articles ?? []).find(item => item.id === articleId);
    if (!article) throw new Error(`No existe el artículo ${articleId}`);

    if (article.standalone || article.renderMode === 'standalone') {
      renderArticle(article, '', { standalone: true });
      return;
    }

    const contentResponse = await fetch(article.contentUrl, { cache: 'no-store' });
    if (!contentResponse.ok) throw new Error(`No se ha podido cargar el contenido (${contentResponse.status})`);
    const html = await contentResponse.text();

    renderArticle(article, html);
  } catch (error) {
    console.error(error);
    renderError('No se pudo cargar el artículo.', 'Revisa que el índice generado y el archivo HTML convertido existan correctamente.');
  }
}

function renderArticle(article, html, options = {}) {
  const title = article.title || 'Artículo sin título';
  const isStandalone = options.standalone === true;

  document.title = `${title} · Oblitus est scientia`;
  els.category.textContent = article.category || (isStandalone ? 'Artículo interactivo' : 'Artículo');
  els.title.textContent = title;
  renderTopbarTitle(title);
  els.subtitle.textContent = article.subtitle || '';
  els.meta.innerHTML = [
    formatDate(article.date),
    article.readingTime,
    article.interactive ? 'Interactivo' : null
  ].filter(Boolean).map(item => `<span>${escapeHtml(item)}</span>`).join('<span>·</span>');
  els.badges.innerHTML = (article.tags ?? []).map(tag => `<span class="badge">${escapeHtml(tag)}</span>`).join('');

  if (isStandalone) {
    renderStandaloneArticle(article, title);
    return;
  }

  els.layout?.classList.remove('is-standalone');
  els.shell?.classList.remove('is-standalone');
  if (els.tools) els.tools.hidden = false;
  els.content.innerHTML = html;

  executeEmbeddedScripts(els.content);
  enhanceHeadings(els.content);
  buildToc(els.content);
  bindChapterTools();
}

function renderStandaloneArticle(article, title) {
  disconnectTocObserver();
  els.layout?.classList.add('is-standalone');
  els.shell?.classList.add('is-standalone');
  if (els.tools) els.tools.hidden = true;
  if (els.toc) els.toc.innerHTML = '';

  const url = article.contentUrl;
  els.content.innerHTML = `
    <iframe
      class="embedded-article-frame"
      src="${escapeAttr(url)}"
      title="${escapeAttr(title)}"
      loading="eager"
      referrerpolicy="no-referrer"
    ></iframe>
  `;

  const iframe = els.content.querySelector('iframe');
  iframe.addEventListener('load', () => fitEmbeddedArticle(iframe));
}

function fitEmbeddedArticle(iframe) {
  const resize = () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const height = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        window.innerHeight - 120
      );
      iframe.style.height = `${height + 24}px`;
    } catch {
      iframe.style.height = 'calc(100vh - 7rem)';
    }
  };

  resize();
  try {
    const observer = new ResizeObserver(resize);
    observer.observe(iframe.contentDocument.documentElement);
    observer.observe(iframe.contentDocument.body);
    window.addEventListener('resize', resize, { passive: true });
  } catch {
    window.addEventListener('resize', resize, { passive: true });
  }
}

function renderTopbarTitle(title) {
  if (!els.topTitle) return;
  els.topTitle.textContent = title;
  els.topTitle.classList.toggle('is-long-title', title.length > 58);
  els.topTitle.classList.toggle('is-very-long-title', title.length > 92);
}

function enhanceHeadings(container) {
  getContentHeadings(container, 'h2').forEach((heading, index) => {
    if (!heading.id) heading.id = `capitulo-${index + 1}`;
    heading.classList.add('chapter-heading');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-toggle';
    button.textContent = 'Contraer';
    button.addEventListener('click', () => toggleChapter(heading, button));
    heading.append(button);
  });
}

function toggleChapter(heading, button, forceExpanded = null) {
  if (!heading || !button) return;
  const nodes = getChapterNodes(heading);
  const shouldCollapse = forceExpanded === null
    ? !nodes.every(node => node.classList?.contains('chapter-collapsed'))
    : !forceExpanded;

  nodes.forEach(node => node.classList.toggle('chapter-collapsed', shouldCollapse));
  button.textContent = shouldCollapse ? 'Expandir' : 'Contraer';
}

function getChapterNodes(heading) {
  const nodes = [];
  let node = heading.nextElementSibling;
  while (node && node.tagName !== 'H2') {
    nodes.push(node);
    node = node.nextElementSibling;
  }
  return nodes;
}

function bindChapterTools() {
  els.collapseAll?.addEventListener('click', () => {
    getContentHeadings(els.content, 'h2').forEach(heading => toggleChapter(heading, heading.querySelector('.chapter-toggle'), false));
  });
  els.expandAll?.addEventListener('click', () => {
    getContentHeadings(els.content, 'h2').forEach(heading => toggleChapter(heading, heading.querySelector('.chapter-toggle'), true));
  });
}

function buildToc(container) {
  disconnectTocObserver();
  const headings = getContentHeadings(container, 'h2, h3, h4');
  const entries = buildTocEntries(headings);

  els.toc.innerHTML = entries.map(entry => {
    if (!entry.heading.id) entry.heading.id = slugify(entry.heading.textContent);
    return `<li class="toc-${entry.tagName}" data-toc-level="${entry.level}" data-toc-number="${escapeAttr(entry.number)}"><a href="#${escapeAttr(entry.heading.id)}" data-toc-link="${escapeAttr(entry.heading.id)}">${escapeHtml(entry.label)}</a></li>`;
  }).join('');
  bindTocScrollSync(headings);
}

function buildTocEntries(headings) {
  const counters = [0, 0, 0];
  let lastLevel = 1;

  return headings.map(heading => {
    const level = headingLevel(heading.tagName);

    if (level === 1) {
      counters[0] += 1;
      counters[1] = 0;
      counters[2] = 0;
    } else if (level === 2) {
      if (counters[0] === 0) counters[0] = 1;
      counters[1] += 1;
      counters[2] = 0;
    } else {
      if (counters[0] === 0) counters[0] = 1;
      if (counters[1] === 0) counters[1] = 1;
      counters[2] += 1;
    }

    lastLevel = level;
    const number = counters.slice(0, level).map(value => String(value).padStart(2, '0')).join('.');
    const rawLabel = cleanTocLabel(heading.textContent);

    return {
      heading,
      tagName: heading.tagName.toLowerCase(),
      level,
      number,
      label: rawLabel
    };
  });
}

function headingLevel(tagName = '') {
  const tag = tagName.toUpperCase();
  if (tag === 'H2') return 1;
  if (tag === 'H3') return 2;
  return 3;
}

function bindTocScrollSync(headings) {
  if (!headings.length || !('IntersectionObserver' in window)) return;

  tocObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    setActiveTocLink(visible.target.id);
  }, {
    root: null,
    rootMargin: '-18% 0px -66% 0px',
    threshold: [0, 0.2, 0.5, 1]
  });

  headings.forEach(heading => tocObserver.observe(heading));
  if (headings[0]) setActiveTocLink(headings[0].id, { instant: true });
}

function setActiveTocLink(id, options = {}) {
  const link = els.toc?.querySelector(`[data-toc-link="${cssEscape(id)}"]`);
  if (!link || link.classList.contains('is-active')) return;
  els.toc.querySelectorAll('.is-active').forEach(item => item.classList.remove('is-active'));
  link.classList.add('is-active');

  if (!options.instant) {
    const item = link.closest('li') || link;
    scrollTocItemIntoView(item);
  }
}

function scrollTocItemIntoView(item) {
  const scroller = els.toc;
  if (!scroller || !item) return;

  const scrollerRect = scroller.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const topOverflow = itemRect.top - scrollerRect.top;
  const bottomOverflow = itemRect.bottom - scrollerRect.bottom;

  if (topOverflow < 0) {
    scroller.scrollBy({ top: topOverflow - 8, behavior: 'smooth' });
  } else if (bottomOverflow > 0) {
    scroller.scrollBy({ top: bottomOverflow + 8, behavior: 'smooth' });
  }
}

function disconnectTocObserver() {
  tocObserver?.disconnect();
  tocObserver = null;
}

function cleanTocLabel(value = '') {
  return String(value)
    .replace(/Contraer|Expandir/g, '')
    .replace(/^\s*\d+(?:[.)]|\.\d+)*\s*/g, '')
    .trim();
}

function getContentHeadings(container, selector) {
  return [...container.querySelectorAll(selector)]
    .filter(heading => !heading.closest('nav, aside, .toc, .toolbar, .article-tools'));
}

function executeEmbeddedScripts(container) {
  container.querySelectorAll('script').forEach(oldScript => {
    const script = document.createElement('script');
    [...oldScript.attributes].forEach(attr => script.setAttribute(attr.name, attr.value));
    script.textContent = oldScript.textContent;
    oldScript.replaceWith(script);
  });
}

function renderError(title, message) {
  els.title.textContent = title;
  renderTopbarTitle(title);
  els.subtitle.textContent = message;
  els.content.innerHTML = `<div class="article-note"><p>${escapeHtml(message)}</p></div>`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date);
}

function slugify(value = '') {
  return value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'seccion';
}

function cssEscape(value = '') {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/["\\]/g, '\\$&');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
