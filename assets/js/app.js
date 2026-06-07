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
  year: document.querySelector('#currentYear')
};

init();

async function init() {
  els.year.textContent = new Date().getFullYear();
  initTheme();
  bindEvents();

  try {
    const response = await fetch('assets/data/posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se ha podido cargar posts.json (${response.status})`);
    const data = await response.json();
    state.posts = data.posts ?? [];
    renderTopics(data.topics ?? []);
    renderTags();
    renderPosts();
  } catch (error) {
    console.error(error);
    els.count.textContent = 'Error al cargar artículos';
    els.grid.innerHTML = `<article class="empty-state"><h3>No se pudo leer assets/data/posts.json</h3><p>Abre la web con un servidor local o revisa el fichero de datos.</p></article>`;
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
  els.themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = current;
    localStorage.setItem('oes-theme', current);
  });
}

function initTheme() {
  const saved = localStorage.getItem('oes-theme');
  if (saved) document.documentElement.dataset.theme = saved;
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

  els.count.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'}`;
  els.empty.hidden = filtered.length !== 0;

  els.grid.innerHTML = filtered.map(post => `
    <a class="post-card" href="${escapeAttr(post.url)}">
      <img src="${escapeAttr(post.cover)}" alt="" loading="lazy">
      <div class="post-meta">
        <span>${formatDate(post.date)}</span>
        <span>·</span>
        <span>${escapeHtml(post.readingTime ?? 'Lectura variable')}</span>
        ${post.audio ? '<span>· Audio</span>' : ''}
        ${post.interactive ? '<span>· Interactivo</span>' : ''}
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="post-badges">
        ${(post.tags ?? []).slice(0, 5).map(tag => `<span class="badge">${escapeHtml(tag)}</span>`).join('')}
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
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
