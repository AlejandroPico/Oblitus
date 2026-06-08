import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import mammoth from 'mammoth';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import pdfParse from 'pdf-parse';

const execFileAsync = promisify(execFile);

const root = process.cwd();
const articlesDir = path.join(root, 'articulos');
const generatedDir = path.join(root, 'assets', 'generated');
const dataFile = path.join(root, 'assets', 'data', 'articles.generated.json');

const siteTopics = [
  'Física y cosmología',
  'Inteligencia artificial',
  'Matemáticas',
  'Historia de la ciencia',
  'Tecnología y sociedad',
  'Geopolítica del conocimiento',
  'Cultura crítica'
];

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'img', 'audio', 'video', 'source', 'figure', 'figcaption', 'details', 'summary', 'iframe',
  'script', 'style', 'input', 'label', 'canvas', 'button', 'select', 'option', 'svg', 'path',
  'rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'g', 'defs', 'title'
]);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  '*': ['id', 'class', 'style', 'data-*', 'aria-*', 'role'],
  a: ['href', 'name', 'target', 'rel', 'class'],
  img: ['src', 'alt', 'title', 'loading', 'width', 'height', 'class', 'style'],
  audio: ['src', 'controls', 'preload', 'class', 'style'],
  video: ['src', 'controls', 'preload', 'poster', 'class', 'style'],
  source: ['src', 'type'],
  iframe: ['src', 'title', 'loading', 'allow', 'allowfullscreen', 'class', 'style'],
  script: ['src', 'type', 'defer', 'async'],
  input: ['id', 'class', 'type', 'min', 'max', 'value', 'step', 'name'],
  label: ['for', 'class'],
  button: ['id', 'class', 'type', 'data-*', 'aria-*'],
  select: ['id', 'class', 'name'],
  option: ['value', 'selected'],
  svg: ['viewBox', 'width', 'height', 'role', 'aria-label', 'class', 'style', 'xmlns'],
  path: ['d', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
  line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'stroke-dasharray', 'class', 'style'],
  polyline: ['points', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
  polygon: ['points', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
  text: ['x', 'y', 'dx', 'dy', 'text-anchor', 'font-size', 'font-family', 'fill', 'class', 'style'],
  g: ['fill', 'stroke', 'class', 'style'],
  title: []
};

await fs.mkdir(generatedDir, { recursive: true });
const entries = await discoverArticleSources(articlesDir);
const articles = [];

for (const entry of entries) {
  try {
    const article = await convertArticle(entry);
    if (article) articles.push(article);
  } catch (error) {
    console.error(`No se pudo convertir ${entry.relativePath}:`, error.message);
  }
}

articles.sort((a, b) => new Date(b.date) - new Date(a.date));

const manifest = {
  site: {
    title: 'Oblitus est scientia',
    subtitle: 'Redivulgación de temática científica',
    language: 'es-ES'
  },
  generatedAt: new Date().toISOString(),
  topics: siteTopics,
  articles
};

await fs.writeFile(dataFile, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generados ${articles.length} artículos en ${path.relative(root, dataFile)}`);

async function discoverArticleSources(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const item of items) {
    if (item.name.startsWith('.') || item.name.startsWith('_') || item.name.toLowerCase() === 'readme.md') continue;
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.html');
      try {
        await fs.access(indexPath);
        results.push({ fullPath: indexPath, relativePath: path.relative(root, indexPath).replaceAll(path.sep, '/'), type: 'html-folder' });
      } catch {
        const nested = await discoverArticleSources(fullPath);
        results.push(...nested);
      }
      continue;
    }

    const ext = path.extname(item.name).toLowerCase();
    if (['.docx', '.pdf', '.md', '.markdown', '.html', '.htm'].includes(ext)) {
      results.push({ fullPath, relativePath: path.relative(root, fullPath).replaceAll(path.sep, '/'), type: ext.slice(1) });
    }
  }

  return results;
}

async function convertArticle(entry) {
  const raw = await fs.readFile(entry.fullPath);
  const ext = path.extname(entry.fullPath).toLowerCase();
  const rawText = raw.toString('utf8');
  const { frontmatter, body } = parseFrontmatter(rawText);
  let html = '';
  let format = entry.type;
  let standalone = false;

  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: entry.fullPath }, {
      convertImage: mammoth.images.imgElement(image => image.read('base64').then(base64 => ({
        src: `data:${image.contentType};base64,${base64}`
      })))
    });
    html = result.value;
    format = 'docx';
  } else if (ext === '.pdf') {
    const result = await pdfParse(raw);
    html = pdfTextToHtml(result.text);
    format = 'pdf';
  } else if (ext === '.md' || ext === '.markdown') {
    html = marked.parse(body);
    format = 'md';
  } else if (ext === '.html' || ext === '.htm') {
    html = body;
    format = 'html';
    standalone = isFullHtmlDocument(html);
  }

  const parentName = path.basename(path.dirname(entry.fullPath));
  const baseId = frontmatter.id || (parentName === 'articulos'
    ? path.basename(entry.fullPath, ext)
    : parentName);
  const id = slugify(baseId);

  const copiedAssets = await copyArticleAssets(entry, id);
  if (copiedAssets) {
    const articleAssetBase = standalone ? id : `assets/generated/${id}`;
    html = rewriteLocalAssetUrls(html, articleAssetBase);
  }

  if (!standalone) {
    html = sanitizeHtml(html, {
      allowedTags,
      allowedAttributes,
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
      allowVulnerableTags: true
    });
  }

  const title = frontmatter.title || extractDocumentTitle(html) || extractFirstHeading(html) || titleFromFilename(id);
  const subtitle = frontmatter.subtitle || extractMetaContent(html, 'subtitle') || '';
  const category = frontmatter.category || inferCategory(frontmatter.tags);
  const tags = normaliseTags(frontmatter.tags);
  const excerpt = frontmatter.excerpt || extractMetaContent(html, 'description') || makeExcerpt(html);
  const date = frontmatter.date || await lastCommitDate(entry.relativePath) || (await fs.stat(entry.fullPath)).mtime.toISOString();
  const rawCover = frontmatter.cover || extractCover(html) || (frontmatter.interactive || standalone ? 'assets/media/images/interactive-cover.svg' : 'assets/media/images/default-cover.svg');
  const cover = copiedAssets ? rewriteLocalAssetUrl(rawCover, `assets/generated/${id}`) : rawCover;
  const generatedFile = path.join(generatedDir, `${id}.html`);

  await fs.writeFile(generatedFile, html, 'utf8');

  return {
    id,
    title,
    subtitle,
    date,
    category,
    tags,
    excerpt,
    cover,
    url: `articulo.html?id=${encodeURIComponent(id)}`,
    contentUrl: `assets/generated/${id}.html`,
    readingTime: readingTime(html),
    format,
    sourceFile: entry.relativePath,
    audio: toBoolean(frontmatter.audio),
    interactive: toBoolean(frontmatter.interactive) || standalone || html.includes('<script') || html.includes('demo-widget') || html.includes('interactive-block'),
    standalone,
    renderMode: standalone ? 'standalone' : 'article'
  };
}

async function copyArticleAssets(entry, id) {
  const sourceDir = path.dirname(entry.fullPath);
  const destDir = path.join(generatedDir, id);
  const items = await fs.readdir(sourceDir, { withFileTypes: true });
  const copyableItems = items.filter(item => {
    const name = item.name.toLowerCase();
    return item.name !== '.' &&
      item.name !== '..' &&
      name !== 'index.html' &&
      name !== 'readme.md' &&
      !name.startsWith('.');
  });

  if (!copyableItems.length) return false;

  await fs.rm(destDir, { recursive: true, force: true });
  await fs.mkdir(destDir, { recursive: true });

  for (const item of copyableItems) {
    const from = path.join(sourceDir, item.name);
    const to = path.join(destDir, item.name);
    await fs.cp(from, to, { recursive: true });
  }

  return true;
}

function rewriteLocalAssetUrls(html, assetBase) {
  return String(html)
    .replace(/\b(src|href|poster)=["']([^"']+)["']/gi, (match, attr, value) => {
      const rewritten = rewriteLocalAssetUrl(value, assetBase);
      return rewritten === value ? match : `${attr}="${escapeAttribute(rewritten)}"`;
    })
    .replace(/\bxlink:href=["']([^"']+)["']/gi, (match, value) => {
      const rewritten = rewriteLocalAssetUrl(value, assetBase);
      return rewritten === value ? match : match.replace(value, escapeAttribute(rewritten));
    })
    .replace(/url\((["']?)([^'")]+)\1\)/gi, (match, quote, value) => {
      const rewritten = rewriteLocalAssetUrl(value, assetBase);
      return rewritten === value ? match : `url(${quote}${rewritten}${quote})`;
    });
}

function rewriteLocalAssetUrl(value = '', assetBase = '') {
  const original = String(value).trim();
  if (!original || !assetBase || !isRewriteableLocalAsset(original)) return value;

  const [pathPart, suffix = ''] = splitUrlSuffix(original.replace(/^\.\//, ''));
  const normalisedPath = pathPart.replace(/^\/+/, '');
  return `${assetBase}/${normalisedPath}${suffix}`;
}

function splitUrlSuffix(value) {
  const index = value.search(/[?#]/);
  if (index === -1) return [value, ''];
  return [value.slice(0, index), value.slice(index)];
}

function isRewriteableLocalAsset(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.startsWith('#')) return false;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(trimmed)) return false;
  if (trimmed.startsWith('/')) return false;
  if (/^(?:data|mailto|tel|javascript):/i.test(trimmed)) return false;
  return true;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { frontmatter: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, body: text };
  const block = text.slice(3, end).trim();
  const body = text.slice(end + 4).trim();
  const frontmatter = {};

  for (const line of block.split('\n')) {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) continue;
    const value = rest.join(':').trim();
    frontmatter[key.trim()] = parseMetaValue(value);
  }

  return { frontmatter, body };
}

function parseMetaValue(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map(item => item.trim()).filter(Boolean);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value.replace(/^["']|["']$/g, '');
}

function normaliseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String).map(t => t.trim()).filter(Boolean);
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
}

function inferCategory(tags) {
  const list = normaliseTags(tags);
  return list[0] || 'Artículo';
}

function isFullHtmlDocument(html = '') {
  return /^\s*(<!doctype\s+html[^>]*>)?\s*<html[\s>]/i.test(html) || /<head[\s>][\s\S]*<body[\s>]/i.test(html);
}

function extractDocumentTitle(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? cleanTitle(stripHtml(title)) : '';
}

function cleanTitle(value = '') {
  return value.replace(/^Oblitus\s*[·|-]\s*/i, '').replace(/\s*[·|-]\s*Oblitus.*$/i, '').trim();
}

function extractMetaContent(html, name) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["'](?:${name}|og:${name})["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return stripHtml(pattern.exec(html)?.[1] || '').trim();
}

function extractCover(html) {
  return extractMetaContent(html, 'image');
}

function extractFirstHeading(html) {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>|<h2[^>]*>(.*?)<\/h2>/i);
  return match ? stripHtml(match[1] || match[2]).trim() : '';
}

function makeExcerpt(html) {
  return stripHtml(html).replace(/\s+/g, ' ').trim().slice(0, 220) || 'Artículo disponible en Oblitus est scientia.';
}

function readingTime(html) {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min`;
}

function pdfTextToHtml(text) {
  const chunks = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return chunks.map((chunk, index) => {
    if (index === 0 && chunk.length < 120) return `<h2>${escapeHtml(chunk)}</h2>`;
    return `<p>${escapeHtml(chunk).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

async function lastCommitDate(relativePath) {
  try {
    const { stdout } = await execFileAsync('git', ['log', '-1', '--format=%cI', '--', relativePath], { cwd: root });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function titleFromFilename(value) {
  return value.replace(/^\d{4}-\d{2}-\d{2}-/, '').split('-').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function slugify(value = '') {
  return value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'articulo';
}

function toBoolean(value) {
  return value === true || value === 'true';
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function escapeAttribute(value = '') {
  return String(value).replace(/[&"]/g, char => ({
    '&': '&amp;', '"': '&quot;'
  }[char]));
}
