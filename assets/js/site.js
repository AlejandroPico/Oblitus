import { initTemporalTheme } from './theme.js';
import { initMobileMenu } from './mobile-menu.js';

const themeToggle = document.querySelector('#themeToggle');
const currentYear = document.querySelector('#currentYear');

ensureStylesheet('assets/css/editorial.css');
initTemporalTheme(themeToggle);
initMobileMenu();
if (currentYear) currentYear.textContent = new Date().getFullYear();

function ensureStylesheet(href) {
  if ([...document.styleSheets].some(sheet => sheet.href?.endsWith(href))) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}
