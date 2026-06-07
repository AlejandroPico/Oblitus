const themeToggle = document.querySelector('#themeToggle');
const currentYear = document.querySelector('#currentYear');

initTheme();
if (currentYear) currentYear.textContent = new Date().getFullYear();
themeToggle?.addEventListener('click', toggleTheme);

function initTheme() {
  const saved = localStorage.getItem('oes-theme');
  if (saved) document.documentElement.dataset.theme = saved;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('oes-theme', next);
}
