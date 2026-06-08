import { initTemporalTheme } from './theme.js';
import { initMobileMenu, initMobileTitleDocking } from './mobile-menu.js';

const state = {
  posts: [],
  activeTag: 'Todos',
  query: '',
  sort: 'newest',
  contentIndexReady: false
};

const els = {
  grid: document.querySelector('#postsGrid'),
  tags: document.querySelector('#tagFilters'),
  search: document.querySelector('#searchInput'),
  sort: document.querySelector('#sortSelect'),
  empty: document.querySelector('#emptyState'),
  count: document.querySelector('#resultCount'),
  topics: document.querySelector('#topicList'),
  themeToggle: document.querySelector('#themeToggle'),
  searchToggle: document.querySelector('#searchToggle'),
  searchPanel: document.querySelector('#topbarSearch'),
  searchShell: document.querySelector('.search-shell'),
  year: document.querySelector('#currentYear')
};

init();

async function init() {
  if (els.year) els.year.textContent = new Date().getFullYear();
  initTemporalTheme(els.themeToggle);
  initMobileMenu();
  initMobileTitleDocking({ sourceSelector: '#siteTitle' });
  bindEvents();

  try {
    const response = await fetch('assets/data/articles.generated.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se ha podido cargar articles.generated.json (${response.status})`);
    const data = await response.json();
    state.posts = normalisePosts(data.articles ?? []);
    renderTopics(data.topics ?? []);
    renderTags();
    renderPosts();
    hydrateContentSearchIndex();
  } catch (error) {
    console.error(error);
    if (els.count) els.count.textContent = 'Error al cargar artículos';
    els.grid.innerHTML = `<article class="empty-state"><h3>No se pudo leer el índice de artículos</h3><p>Ejecuta <code>npm run build:content</code> o revisa <code>assets/data/articles.generated.json</code>.</p></article>`;
  }
}

function bindEvents() {
  els.search?.addEventListener('input', event => {
    state.query = normaliseSearchText(event.target.value);
    renderPosts();
  });
  els.sort?.addEventListener('change', event => {
    state.sort = event.target.value;
    renderPosts();
  });
  els.searchToggle?.addEventListener('click', event => {
    event.stopPropagation();
    toggleSearchPanel();
  });
  els.searchPanel?.addEventListener('click', event => event.stopPropagation());
  els.grid?.addEventListener('click', handleGridClick);
  els.grid?.addEventListener('keydown', handleGridKeydown);
  document.addEventListener('click', () => closeSearchPanel());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSearchPanel();
  });
}

function handleGridClick(event) {
  const tag = event.target.closest('[data-card-tag]');
  if (!tag) return;
  event.preventDefault();
  event.stopPropagation();
  setActiveTag(tag.dataset.cardTag, { scrollToFilters: true });
}

function handleGridKeydown(event) {
  if (!['Enter', ' '].includes(event.key)) return;
  const tag = event.target.closest('[data-card-tag]');
  if (!tag) return;
  event.preventDefault();
  event.stopPropagation();
  setActiveTag(tag.dataset.cardTag, { scrollToFilters: true });
}

function setActiveTag(tag, options = {}) {
  state.activeTag = tag || 'Todos';
  renderTags();
  renderPosts();

  if (options.scrollToFilters && els.tags) {
    els.tags.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function toggleSearchPanel(forceOpen = null) {
  if (!els.searchPanel || !els.searchToggle || !els.searchShell) return;
  const isOpen = els.searchShell.dataset.open === 'true';
  const shouldOpen = forceOpen ?? !isOpen;
  els.searchShell.dataset.open = String(shouldOpen);
  els.searchPanel.setAttribute('aria-hidden', String(!shouldOpen));
  els.searchToggle.setAttribute('aria-expanded', String(shouldOpen));
  els.searchToggle.setAttribute('aria-label', shouldOpen ? 'Cerrar buscador' : 'Abrir buscador');
  if (shouldOpen) requestAnimationFrame(() => els.search?.focus());
}

function closeSearchPanel() {
  if (!els.searchShell || els.searchShell.dataset.open !== 'true') return;
  els.searchShell.dataset.open = 'false';
  els.searchPanel?.setAttribute('aria-hidden', 'true');
  els.searchToggle?.setAttribute('aria-expanded', 'false');
  els.searchToggle?.setAttribute('aria-label', 'Abrir buscador');
}

function normalisePosts(posts) {
  return posts.map(post => {
    const normalised = {
      ...post,
      tags: Array.isArray(post.tags) ? post.tags : [],
      cover: post.cover || 'assets/media/images/default-cover.svg',
      date: post.date || new Date().toISOString(),
      url: post.url || `articulo.html?id=${encodeURIComponent(post.id)}`,
      excerpt: post.excerpt || 'Artículo disponible en la biblioteca de Oblitus est scientia.'
    };

    normalised.searchText = buildMetadataSearchText(normalised);
    normalised.contentText = '';
    normalised.contentIndexed = false;
    return normalised;
  });
}

async function hydrateContentSearchIndex() {
  const jobs = state.posts.map(async post => {
    if (!post.contentUrl) return;
    try {
      const response = await fetch(post.contentUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`No se pudo indexar ${post.contentUrl}`);
      const html = await response.text();
      post.contentText = extractSearchTextFromHtml(html);
      post.contentIndexed = true;
    } catch (error) {
      console.warn(error);
    }
  });

  await Promise.allSettled(jobs);
  state.contentIndexReady = true;
  if (state.query) renderPosts();
}

function buildMetadataSearchText(post) {
  return normaliseSearchText([
    post.title,
    post.subtitle,
    post.excerpt,
    post.category,
    post.format,
    post.readingTime,
    post.sourceFile,
    ...(post.tags ?? [])
  ].filter(Boolean).join(' '));
}

function extractSearchTextFromHtml(html) {
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('script, style, noscript, svg').forEach(node => node.remove());
  return normaliseSearchText(documentFragment.body?.textContent || documentFragment.documentElement?.textContent || '');
}

function renderTopics(topics) {
  if (!els.topics) return;
  els.topics.innerHTML = topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('');
}

function renderTags() {
  const tags = ['Todos', ...new Set(state.posts.flatMap(post => post.tags ?? []))].sort((a, b) => {
    if (a === 'Todos') return -1;
    if (b === 'Todos') return 1;
    return a.localeCompare(b, 'es');
  });

  els.tags.innerHTML = tags.map(tag => `
    <button class="tag-button${tag === state.activeTag ? ' active' : ''}" type="button" data-tag="${escapeAttr(tag)}">
      ${escapeHtml(tag)}
    </button>
  `).join('');

  els.tags.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => setActiveTag(button.dataset.tag));
  });
}

function renderPosts() {
  const filtered = state.posts
    .filter(matchesTag)
    .filter(matchesQuery)
    .sort(sortPosts);

  if (els.count) {
    const suffix = state.contentIndexReady ? '' : ' · indexando contenido interno';
    els.count.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'}${suffix}`;
  }
  els.empty.hidden = filtered.length !== 0;

  els.grid.innerHTML = filtered.map(post => `
    <a class="post-card" href="${escapeAttr(post.url)}">
      <div class="post-cover">
        <img src="${escapeAttr(post.cover)}" alt="" loading="lazy">
        <h3 class="post-cover-title">${escapeHtml(post.title)}</h3>
      </div>
      <div class="post-meta post-meta-centered">
        <span>${formatDate(post.date)}</span>
        <span>·</span>
        <span>${escapeHtml(post.readingTime ?? 'Lectura variable')}</span>
        ${post.audio ? '<span>· Audio</span>' : ''}
        ${post.interactive ? '<span>· Interactivo</span>' : ''}
      </div>
      <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
      <div class="post-badges post-badges-scroll" aria-label="Etiquetas del artículo" data-drag-scroll="true">
        ${(post.tags ?? []).map(tag => `<span class="badge tag-inline-filter" role="button" tabindex="0" data-card-tag="${escapeAttr(tag)}" title="Filtrar por ${escapeAttr(tag)}">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </a>
  `).join('');

  initDragScrollRails();
}

function initDragScrollRails() {
  els.grid.querySelectorAll('[data-drag-scroll="true"]').forEach(rail => {
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    rail.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      dragged = false;
      rail.classList.add('is-dragging');
      rail.setPointerCapture?.(pointerId);
    });

    rail.addEventListener('pointermove', event => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) dragged = true;
      if (!dragged) return;
      rail.scrollLeft = startScroll - delta;
      event.preventDefault();
    });

    const finish = event => {
      if (pointerId !== event.pointerId) return;
      rail.releasePointerCapture?.(pointerId);
      rail.classList.remove('is-dragging');
      pointerId = null;
      if (dragged) {
        rail.dataset.suppressClick = 'true';
        window.setTimeout(() => delete rail.dataset.suppressClick, 80);
      }
    };

    rail.addEventListener('pointerup', finish);
    rail.addEventListener('pointercancel', finish);
    rail.addEventListener('click', event => {
      if (rail.dataset.suppressClick !== 'true') return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  });
}

function matchesTag(post) {
  return state.activeTag === 'Todos' || (post.tags ?? []).includes(state.activeTag);
}

function matchesQuery(post) {
  if (!state.query) return true;
  const haystack = `${post.searchText} ${post.contentText}`;
  if (haystack.includes(state.query)) return true;

  const terms = state.query.split(' ').filter(term => term.length > 1);
  return terms.length > 0 && terms.every(term => haystack.includes(term));
}

function sortPosts(a, b) {
  if (state.sort === 'oldest') return new Date(a.date) - new Date(b.date);
  if (state.sort === 'title') return a.title.localeCompare(b.title, 'es');
  return new Date(b.date) - new Date(a.date);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(date);
}

function normaliseSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñçü\s.-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
