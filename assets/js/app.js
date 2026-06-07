const state = {
  posts: [],
  activeTag: 'Todos',
  query: '',
  sort: 'newest'
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
  year: document.querySelector('#currentYear')
};

init();

async function init() {
  if (els.year) els.year.textContent = new Date().getFullYear();
  initTheme();
  bindEvents();

  try {
    const response = await fetch('assets/data/articles.generated.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se ha podido cargar articles.generated.json (${response.status})`);
    const data = await response.json();
    state.posts = normalisePosts(data.articles ?? []);
    renderTopics(data.topics ?? []);
    renderTags();
    renderPosts();
  } catch (error) {
    console.error(error);
    if (els.count) els.count.textContent = 'Error al cargar artículos';
    els.grid.innerHTML = `<article class="empty-state"><h3>No se pudo leer el índice de artículos</h3><p>Ejecuta <code>npm run build:content</code> o revisa <code>assets/data/articles.generated.json</code>.</p></article>`;
  }
}

function bindEvents() {
  els.search?.addEventListener('input', event => {
    state.query = event.target.value.trim().toLowerCase();
    renderPosts();
  });
  els.sort?.addEventListener('change', event => {
    state.sort = event.target.value;
    renderPosts();
  });
  els.themeToggle?.addEventListener('click', toggleTheme);
  els.searchToggle?.addEventListener('click', event => {
    event.stopPropagation();
    toggleSearchPanel();
  });
  els.searchPanel?.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => closeSearchPanel());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSearchPanel();
  });
}

function initTheme() {
  const saved = localStorage.getItem('oes-theme');
  if (saved) document.documentElement.dataset.theme = saved;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('oes-theme', next);
}

function toggleSearchPanel(forceOpen = null) {
  if (!els.searchPanel || !els.searchToggle) return;
  const shouldOpen = forceOpen ?? els.searchPanel.hidden;
  els.searchPanel.hidden = !shouldOpen;
  els.searchToggle.setAttribute('aria-expanded', String(shouldOpen));
  if (shouldOpen) requestAnimationFrame(() => els.search?.focus());
}

function closeSearchPanel() {
  if (!els.searchPanel || !els.searchToggle || els.searchPanel.hidden) return;
  els.searchPanel.hidden = true;
  els.searchToggle.setAttribute('aria-expanded', 'false');
}

function normalisePosts(posts) {
  return posts.map(post => ({
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
    cover: post.cover || 'assets/media/images/default-cover.svg',
    date: post.date || new Date().toISOString(),
    url: post.url || `articulo.html?id=${encodeURIComponent(post.id)}`,
    excerpt: post.excerpt || 'Artículo disponible en la biblioteca de Oblitus est scientia.'
  }));
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
    button.addEventListener('click', () => {
      state.activeTag = button.dataset.tag;
      renderTags();
      renderPosts();
    });
  });
}

function renderPosts() {
  const filtered = state.posts
    .filter(matchesTag)
    .filter(matchesQuery)
    .sort(sortPosts);

  if (els.count) els.count.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'}`;
  els.empty.hidden = filtered.length !== 0;

  els.grid.innerHTML = filtered.map(post => `
    <a class="post-card" href="${escapeAttr(post.url)}">
      <img src="${escapeAttr(post.cover)}" alt="" loading="lazy">
      <div class="post-meta">
        <span>${formatDate(post.date)}</span>
        <span>·</span>
        <span class="format-chip">${escapeHtml((post.format ?? 'html').toUpperCase())}</span>
        <span>·</span>
        <span>${escapeHtml(post.readingTime ?? 'Lectura variable')}</span>
        ${post.audio ? '<span>· Audio</span>' : ''}
        ${post.interactive ? '<span>· Interactivo</span>' : ''}
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="post-badges">
        ${(post.tags ?? []).slice(0, 6).map(tag => `<span class="badge">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

function matchesTag(post) {
  return state.activeTag === 'Todos' || (post.tags ?? []).includes(state.activeTag);
}

function matchesQuery(post) {
  if (!state.query) return true;
  const blob = [
    post.title,
    post.subtitle,
    post.excerpt,
    post.category,
    post.format,
    ...(post.tags ?? [])
  ].filter(Boolean).join(' ').toLowerCase();
  return blob.includes(state.query);
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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
