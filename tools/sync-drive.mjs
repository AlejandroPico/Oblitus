import fs from 'node:fs/promises';
import path from 'node:path';
import { google } from 'googleapis';

const root = process.cwd();
const configPath = path.join(root, 'config', 'drive-sources.json');
const SUPPORTED_HTML_MIMES = new Set(['text/html', 'application/xhtml+xml']);
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';

const config = await readConfig();
const sources = (config.sources ?? []).filter(source => source.enabled !== false && source.provider === 'google-drive');

if (sources.length === 0) {
  console.log('No hay fuentes de Google Drive activas.');
  process.exit(0);
}

const drive = await createDriveClient();
if (!drive) {
  console.warn('No se han configurado credenciales de Google Drive. Se omite la sincronización.');
  console.warn('Configura GOOGLE_DRIVE_SERVICE_ACCOUNT o GOOGLE_DRIVE_API_KEY en los secretos de GitHub Actions.');
  process.exit(0);
}

let totalDownloaded = 0;

for (const source of sources) {
  const folderId = source.folderId || extractFolderId(source.folderUrl);
  if (!folderId) {
    console.warn(`Fuente sin folderId válido: ${source.name || source.id}`);
    continue;
  }

  const targetDir = path.join(root, source.targetDir || path.join('articulos', '_drive', safeName(source.id || folderId)));
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  console.log(`Sincronizando ${source.name || source.id || folderId} → ${path.relative(root, targetDir)}`);
  const files = await listFolderFiles(drive, folderId, { recursive: source.recursive === true });
  const articleFiles = files.filter(isSupportedArticleFile);

  for (const file of articleFiles) {
    const filename = normaliseArticleFilename(file.name, file.mimeType);
    const filepath = path.join(targetDir, filename);
    const content = await downloadFile(drive, file);
    await fs.writeFile(filepath, content);
    totalDownloaded += 1;
    console.log(`  ✓ ${filename}`);
  }

  await writeSourceReadme(targetDir, source, articleFiles.length);
}

console.log(`Sincronización de Google Drive completada: ${totalDownloaded} archivo(s) descargado(s).`);

async function readConfig() {
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`No se pudo leer ${path.relative(root, configPath)}: ${error.message}`);
    return { sources: [] };
  }
}

async function createDriveClient() {
  if (process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT) {
    const credentials = JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT);
    if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    return google.drive({ version: 'v3', auth });
  }

  if (process.env.GOOGLE_DRIVE_API_KEY) {
    return google.drive({ version: 'v3', auth: process.env.GOOGLE_DRIVE_API_KEY });
  }

  return null;
}

async function listFolderFiles(drive, folderId, options = {}, collected = []) {
  let pageToken;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink)',
      orderBy: 'modifiedTime desc, name',
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    const files = response.data.files ?? [];
    collected.push(...files);

    if (options.recursive) {
      const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
      for (const folder of folders) {
        await listFolderFiles(drive, folder.id, options, collected);
      }
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return collected;
}

function isSupportedArticleFile(file) {
  const ext = path.extname(file.name).toLowerCase();
  return ['.html', '.htm'].includes(ext) || SUPPORTED_HTML_MIMES.has(file.mimeType) || file.mimeType === GOOGLE_DOC_MIME;
}

async function downloadFile(drive, file) {
  if (file.mimeType === GOOGLE_DOC_MIME) {
    const response = await drive.files.export({
      fileId: file.id,
      mimeType: 'text/html'
    }, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  const response = await drive.files.get({
    fileId: file.id,
    alt: 'media',
    supportsAllDrives: true
  }, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

function normaliseArticleFilename(name, mimeType) {
  const ext = path.extname(name).toLowerCase();
  const base = safeName(path.basename(name, ext));
  if (mimeType === GOOGLE_DOC_MIME) return `${base}.html`;
  if (ext === '.htm') return `${base}.html`;
  if (ext === '.html') return `${base}.html`;
  return `${base}.html`;
}

async function writeSourceReadme(targetDir, source, count) {
  const content = `# Fuente sincronizada\n\nEsta carpeta se genera automáticamente desde Google Drive.\n\n- Fuente: ${source.name || source.id}\n- Archivos HTML detectados: ${count}\n- Generado: ${new Date().toISOString()}\n\nNo edites manualmente estos archivos dentro del flujo de publicación.\n`;
  await fs.writeFile(path.join(targetDir, 'README.md'), content, 'utf8');
}

function extractFolderId(url = '') {
  const match = String(url).match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || '';
}

function safeName(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'articulo';
}
