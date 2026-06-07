import { initTemporalTheme } from './theme.js';

const themeToggle = document.querySelector('#themeToggle');
const currentYear = document.querySelector('#currentYear');

initTemporalTheme(themeToggle);
if (currentYear) currentYear.textContent = new Date().getFullYear();
