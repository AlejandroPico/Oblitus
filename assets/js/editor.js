const form = document.querySelector('#articleForm');
const jsonOutput = document.querySelector('#jsonOutput');
const htmlOutput = document.querySelector('#htmlOutput');
const slugInput = document.querySelector('#slug');
const titleInput = document.querySelector('#title');

const slugify = value => value
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

titleInput?.addEventListener('input', () => {
  if (!slugInput.value.trim()) slugInput.value = slugify(titleInput.value);
});

form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  const slug = data.slug || slugify(data.title);
  const post = {
    id: slug,
    title: data.title,
    subtitle: data.subtitle,
    date: data.date,
    category: data.category,
    tags,
    excerpt: data.excerpt,
    cover: data.cover || 'assets/media/images/default-cover.svg',
    url: `articulos/${slug}/`,
    readingTime: data.readingTime || 'Pendiente',
    audio: data.audio === 'on',
    interactive: data.interactive === 'on',
    status: 'borrador'
  };

  jsonOutput.value = JSON.stringify(post, null, 2);
  htmlOutput.value = buildArticleHtml(post);
});

function buildArticleHtml(post) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} · Oblitus est scientia</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <link rel="icon" href="../../assets/media/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/css/styles.css">
</head>
<body>
  <header class="site-header">
    <nav class="topbar" aria-label="Navegación principal">
      <a class="brand" href="../../"><span class="brand-mark">OES</span><span class="brand-text">Oblitus est scientia</span></a>
      <div class="nav-actions"><a href="../../">Inicio</a><a href="../../editor.html">Editor</a></div>
    </nav>
  </header>
  <main class="article-shell">
    <article>
      <header class="article-header">
        <p class="eyebrow">${escapeHtml(post.category)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="subtitle">${escapeHtml(post.subtitle)}</p>
        <p class="post-meta">${escapeHtml(post.date)} · ${escapeHtml(post.readingTime)}</p>
      </header>
      <div class="article-body">
        <p>${escapeHtml(post.excerpt)}</p>
        <h2>Primer apartado</h2>
        <p>Escribe aquí el contenido principal del artículo.</p>
      </div>
    </article>
  </main>
</body>
</html>`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}
