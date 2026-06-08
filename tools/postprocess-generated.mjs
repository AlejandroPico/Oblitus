import fs from 'node:fs/promises';
import path from 'node:path';
import { normaliseGeneratedHtml } from './html-normalise.mjs';

const root = process.cwd();
const generatedDir = path.join(root, 'assets', 'generated');

let changed = 0;

try {
  const items = await fs.readdir(generatedDir, { withFileTypes: true });
  for (const item of items) {
    if (!item.isFile() || !item.name.endsWith('.html')) continue;
    const filePath = path.join(generatedDir, item.name);
    const original = await fs.readFile(filePath, 'utf8');
    const normalised = normaliseGeneratedHtml(original);
    if (normalised !== original) {
      await fs.writeFile(filePath, normalised, 'utf8');
      changed += 1;
    }
  }
  console.log(`Postprocesados ${changed} artículos generados.`);
} catch (error) {
  console.warn(`No se pudo postprocesar la carpeta generada: ${error.message}`);
}
