const STORAGE_KEY = 'oes-theme-mode';
const MODES = ['auto', 'day', 'evening', 'night'];
const MODE_LABELS = {
  auto: '◐ Auto',
  day: '☀ Día',
  evening: '◒ Tarde',
  night: '☾ Noche'
};

const manualPalettes = {
  day: {
    colorScheme: 'light',
    bg: '#f3eee5',
    bgStrong: '#e6dac8',
    surface: '#fffaf1',
    surface2: '#f8f0e2',
    text: '#151412',
    muted: '#60594e',
    accent: '#7c2d12',
    accent2: '#1f4d4f',
    shadow: 'rgba(34, 25, 14, 0.12)',
    lineAlpha: 0.16,
    accentAlpha: 0.12
  },
  evening: {
    colorScheme: 'light',
    bg: '#d8c5aa',
    bgStrong: '#c2a67e',
    surface: '#f5e7d1',
    surface2: '#e8d4b7',
    text: '#1d1713',
    muted: '#6b5644',
    accent: '#8e3f16',
    accent2: '#26565a',
    shadow: 'rgba(45, 29, 16, 0.18)',
    lineAlpha: 0.2,
    accentAlpha: 0.16
  },
  night: {
    colorScheme: 'dark',
    bg: '#0f1115',
    bgStrong: '#171a21',
    surface: '#161a22',
    surface2: '#1d232c',
    text: '#f5efe6',
    muted: '#c6b9aa',
    accent: '#e0a46f',
    accent2: '#88d1d1',
    shadow: 'rgba(0, 0, 0, 0.34)',
    lineAlpha: 0.12,
    accentAlpha: 0.14
  }
};

const temporalAnchors = [
  { slot: 0, palette: manualPalettes.night },
  { slot: 10, palette: manualPalettes.night },
  { slot: 13, palette: {
    colorScheme: 'dark', bg: '#242026', bgStrong: '#3a2b2a', surface: '#2b2830', surface2: '#362f34', text: '#f4ebdf', muted: '#cfbba5', accent: '#d48755', accent2: '#77b8bb', shadow: 'rgba(0, 0, 0, 0.3)', lineAlpha: 0.14, accentAlpha: 0.16
  }},
  { slot: 16, palette: manualPalettes.day },
  { slot: 24, palette: manualPalettes.day },
  { slot: 32, palette: {
    colorScheme: 'light', bg: '#eadcc8', bgStrong: '#d7bd99', surface: '#fff1dd', surface2: '#f1dfc4', text: '#18130f', muted: '#655445', accent: '#884018', accent2: '#29565a', shadow: 'rgba(43, 27, 13, 0.15)', lineAlpha: 0.18, accentAlpha: 0.14
  }},
  { slot: 38, palette: manualPalettes.evening },
  { slot: 42, palette: {
    colorScheme: 'dark', bg: '#1b1a22', bgStrong: '#2a2430', surface: '#22212a', surface2: '#2c2933', text: '#f2eadf', muted: '#cbb9a8', accent: '#d78c5d', accent2: '#79bdc0', shadow: 'rgba(0, 0, 0, 0.32)', lineAlpha: 0.14, accentAlpha: 0.16
  }},
  { slot: 48, palette: manualPalettes.night }
];

let temporalTimer = null;

export function initTemporalTheme(toggleButton) {
  const safeMode = MODES.includes(localStorage.getItem(STORAGE_KEY))
    ? localStorage.getItem(STORAGE_KEY)
    : 'auto';

  document.documentElement.dataset.themeMode = safeMode;
  applyMode(safeMode);
  updateButton(toggleButton, safeMode);

  toggleButton?.addEventListener('click', () => {
    const current = document.documentElement.dataset.themeMode || 'auto';
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.themeMode = next;
    applyMode(next);
    updateButton(toggleButton, next);
  });
}

function applyMode(mode) {
  clearTemporalTimer();

  if (mode === 'auto') {
    applyTemporalPalette();
    temporalTimer = window.setInterval(applyTemporalPalette, 60_000);
    return;
  }

  applyPalette(manualPalettes[mode] ?? manualPalettes.day, mode);
}

function applyTemporalPalette() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const minuteProgress = minute / 30;
  const slot = hour * 2 + Math.floor(minute / 30);
  const current = temporalAnchors.findLast(anchor => anchor.slot <= slot) ?? temporalAnchors[0];
  const next = temporalAnchors.find(anchor => anchor.slot > slot) ?? temporalAnchors.at(-1);
  const span = Math.max(1, next.slot - current.slot);
  const progress = ((slot - current.slot) + minuteProgress) / span;
  const palette = mixPalettes(current.palette, next.palette, clamp(progress, 0, 1));
  applyPalette(palette, palette.colorScheme === 'dark' ? 'dark' : 'light');
}

function applyPalette(palette, renderedMode) {
  const root = document.documentElement;
  const lineRgb = hexToRgb(palette.text);
  const accentRgb = hexToRgb(palette.accent);

  root.dataset.theme = renderedMode;
  root.style.colorScheme = palette.colorScheme;
  root.style.setProperty('--bg', palette.bg);
  root.style.setProperty('--bg-strong', palette.bgStrong);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--surface-2', palette.surface2);
  root.style.setProperty('--text', palette.text);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-2', palette.accent2);
  root.style.setProperty('--line', `rgba(${lineRgb.r}, ${lineRgb.g}, ${lineRgb.b}, ${palette.lineAlpha})`);
  root.style.setProperty('--accent-soft', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${palette.accentAlpha})`);
  root.style.setProperty('--shadow', `0 20px 50px ${palette.shadow}`);
}

function clearTemporalTimer() {
  if (!temporalTimer) return;
  window.clearInterval(temporalTimer);
  temporalTimer = null;
}

function updateButton(button, mode) {
  if (!button) return;
  button.textContent = MODE_LABELS[mode] ?? MODE_LABELS.auto;
  button.title = 'Cambiar modo: automático, día, tarde o noche';
  button.setAttribute('aria-label', `Modo visual actual: ${MODE_LABELS[mode] ?? MODE_LABELS.auto}. Pulsar para cambiar.`);
}

function mixPalettes(a, b, amount) {
  return {
    colorScheme: amount < 0.58 ? a.colorScheme : b.colorScheme,
    bg: mixHex(a.bg, b.bg, amount),
    bgStrong: mixHex(a.bgStrong, b.bgStrong, amount),
    surface: mixHex(a.surface, b.surface, amount),
    surface2: mixHex(a.surface2, b.surface2, amount),
    text: mixHex(a.text, b.text, amount),
    muted: mixHex(a.muted, b.muted, amount),
    accent: mixHex(a.accent, b.accent, amount),
    accent2: mixHex(a.accent2, b.accent2, amount),
    shadow: mixRgba(a.shadow, b.shadow, amount),
    lineAlpha: lerp(a.lineAlpha, b.lineAlpha, amount),
    accentAlpha: lerp(a.accentAlpha, b.accentAlpha, amount)
  };
}

function mixHex(a, b, amount) {
  const first = hexToRgb(a);
  const second = hexToRgb(b);
  return rgbToHex({
    r: Math.round(lerp(first.r, second.r, amount)),
    g: Math.round(lerp(first.g, second.g, amount)),
    b: Math.round(lerp(first.b, second.b, amount))
  });
}

function mixRgba(a, b, amount) {
  const first = parseRgba(a);
  const second = parseRgba(b);
  return `rgba(${Math.round(lerp(first.r, second.r, amount))}, ${Math.round(lerp(first.g, second.g, amount))}, ${Math.round(lerp(first.b, second.b, amount))}, ${lerp(first.a, second.a, amount).toFixed(3)})`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

function parseRgba(value) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!match) return { r: 0, g: 0, b: 0, a: 0.2 };
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: Number(match[4] ?? 1)
  };
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
