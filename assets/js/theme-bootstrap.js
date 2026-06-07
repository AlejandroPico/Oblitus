(() => {
  const STORAGE_KEY = 'oes-theme-mode';
  const root = document.documentElement;

  const palettes = {
    day: {
      scheme: 'light', bg: '#f3eee5', bgStrong: '#e6dac8', surface: '#fffaf1', surface2: '#f8f0e2',
      text: '#151412', muted: '#60594e', accent: '#7c2d12', accent2: '#1f4d4f',
      line: 'rgba(21, 20, 18, 0.16)', accentSoft: 'rgba(124, 45, 18, 0.12)', shadow: '0 20px 50px rgba(34, 25, 14, 0.12)'
    },
    evening: {
      scheme: 'light', bg: '#c7aa86', bgStrong: '#a77f5b', surface: '#efd7b8', surface2: '#d8bb95',
      text: '#120d09', muted: '#49372a', accent: '#9b4c1c', accent2: '#1f4e54',
      line: 'rgba(18, 13, 9, 0.28)', accentSoft: 'rgba(155, 76, 28, 0.18)', shadow: '0 20px 50px rgba(38, 23, 13, 0.24)'
    },
    night: {
      scheme: 'dark', bg: '#0f1115', bgStrong: '#171a21', surface: '#161a22', surface2: '#1d232c',
      text: '#f5efe6', muted: '#c6b9aa', accent: '#e0a46f', accent2: '#88d1d1',
      line: 'rgba(245, 239, 230, 0.12)', accentSoft: 'rgba(224, 164, 111, 0.14)', shadow: '0 20px 50px rgba(0, 0, 0, 0.34)'
    }
  };

  const stored = localStorage.getItem(STORAGE_KEY);
  const mode = ['auto', 'day', 'evening', 'night'].includes(stored) ? stored : 'auto';
  const selected = mode === 'auto' ? getAutoPalette() : palettes[mode];

  root.dataset.themeMode = mode;
  root.dataset.theme = selected.scheme;
  root.style.colorScheme = selected.scheme;
  root.style.setProperty('--bg', selected.bg);
  root.style.setProperty('--bg-strong', selected.bgStrong);
  root.style.setProperty('--surface', selected.surface);
  root.style.setProperty('--surface-2', selected.surface2);
  root.style.setProperty('--text', selected.text);
  root.style.setProperty('--muted', selected.muted);
  root.style.setProperty('--accent', selected.accent);
  root.style.setProperty('--accent-2', selected.accent2);
  root.style.setProperty('--line', selected.line);
  root.style.setProperty('--accent-soft', selected.accentSoft);
  root.style.setProperty('--shadow', selected.shadow);

  function getAutoPalette() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour >= 18 || hour < 6) return palettes.night;
    if (hour >= 16.5) return palettes.evening;
    return palettes.day;
  }
})();
