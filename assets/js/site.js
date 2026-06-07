import { initTemporalTheme } from './theme.js';
import { initMobileMenu } from './mobile-menu.js';

const themeToggle = document.querySelector('#themeToggle');
const currentYear = document.querySelector('#currentYear');

initTemporalTheme(themeToggle);
initMobileMenu();
if (currentYear) currentYear.textContent = new Date().getFullYear();
