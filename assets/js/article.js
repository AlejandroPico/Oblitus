import { initTemporalTheme } from './theme.js';

const params = new URLSearchParams(location.search);
const articleId = params.get('id');

const els = {
  themeToggle: document.querySelector('#themeToggle'),
  topTitle: document.querySelector('#readerTopTitle'),
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

    const contentResponse = await fetch(article.contentUrl, { cache: 'no-store' });
    if (!contentResponse.ok) throw new Error(`No se ha podido cargar el contenido (${contentResponse.status})`);
    const html = await contentResponse.text();

    renderArticle(article, html);
  } catch (error) {
    console.error(error);
    renderError('No se pudo cargar el artículo.', 'Revisa que el índice generado y el archivo HTML convertido existan correctamente.');
  }
}

function renderArticle(article, html) {
  const title = article.title || 'Artículo sin título';
  document.title = `${title} · Oblitus est scientia`;
  els.category.textContent = article.category || 'Artículo';
  els.title.textContent = title;
  renderTopbarTitle(title);
  els.subtitle.textContent = article.subtitle || '';
  els.meta.innerHTML = [
    formatDate(article.date),
    article.format ? article.format.toUpperCase() : null,
    article.readingTime,
    article.sourceFile ? `Fuente: ${article.sourceFile}` : null
  ].filter(Boolean).map(item => `<span>${escapeHtml(item)}</span>`).join('<span>·</span>');
  els.badges.innerHTML = (article.tags ?? []).map(tag => `<span class="badge">${escapeHtml(tag)}</span>`).join('');
  els.content.innerHTML = html;

  executeEmbeddedScripts(els.content);
  enhanceHeadings(els.content);
  buildToc(els.content);
  bindChapterTools();
}

function renderTopbarTitle(title) {
  if (!els.topTitle) return;
  els.topTitle.textContent = title;
  els.topTitle.classList.toggle('is-long-title', title.length > 58);
  els.topTitle.classList.toggle('is-very-long-title', title.length > 92);
}

function enhanceHeadings(container) {
  container.querySelectorAll('h2').forEach((heading, index) => {
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
    els.content.querySelectorAll('h2').forEach(heading => toggleChapter(heading, heading.querySelector('.chapter-toggle'), false));
  });
  els.expandAll?.addEventListener('click', () => {
    els.content.querySelectorAll('h2').forEach(heading => toggleChapter(heading, heading.querySelector('.chapter-toggle'), true));
  });
}

function buildToc(container) {
  const headings = [...container.querySelectorAll('h2, h3')];
  els.toc.innerHTML = headings.map(heading => {
    if (!heading.id) heading.id = slugify(heading.textContent);
    const label = heading.textContent.replace(/Contraer|Expandir/g, '').trim();
    return `<li class="toc-${heading.tagName.toLowerCase()}"><a href="#${escapeAttr(heading.id)}">${escapeHtml(label)}</a></li>`;
  }).join('');
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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
