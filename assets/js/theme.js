const STORAGE_KEY = 'oes-theme-mode';
const MODES = ['auto', 'day', 'evening', 'night'];
const MODE_LABELS = {
  auto: '◐ Auto',
  day: '☀ Día',
  evening: '◒ Tarde',
  night: '☾ Noche'
};
const QUARTER_MINUTES = 15;
const AUTO_REFRESH_MS = 60_000;
const MANUAL_TRANSITION_MS = 1800;
const AUTO_TRANSITION_MS = 4200;

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
    bg: '#dac3a5',
    bgStrong: '#bd9a72',
    surface: '#f7e5ca',
    surface2: '#e7cfad',
    text: '#17110d',
    muted: '#4f3e31',
    accent: '#8e3f16',
    accent2: '#214d52',
    shadow: 'rgba(45, 29, 16, 0.2)',
    lineAlpha: 0.24,
    accentAlpha: 0.17
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
  { minute: 0, palette: manualPalettes.night },
  { minute: 300, palette: manualPalettes.night },
  { minute: 345, palette: {
    colorScheme: 'dark', bg: '#1b1920', bgStrong: '#2a2023', surface: '#211f27', surface2: '#2d2730', text: '#f4ecdf', muted: '#cebba6', accent: '#cd7d4b', accent2: '#77b4b8', shadow: 'rgba(0, 0, 0, 0.32)', lineAlpha: 0.13, accentAlpha: 0.15
  }},
  { minute: 420, palette: {
    colorScheme: 'light', bg: '#dfcbb0', bgStrong: '#c7a276', surface: '#f7e8d2', surface2: '#ebd7bb', text: '#1a140f', muted: '#675342', accent: '#8c4318', accent2: '#2a565a', shadow: 'rgba(42, 27, 14, 0.17)', lineAlpha: 0.18, accentAlpha: 0.15
  }},
  { minute: 510, palette: manualPalettes.day },
  { minute: 720, palette: manualPalettes.day },
  { minute: 885, palette: {
    colorScheme: 'light', bg: '#eadcc8', bgStrong: '#d7bd99', surface: '#fff1dd', surface2: '#f1dfc4', text: '#18130f', muted: '#5f4d3e', accent: '#884018', accent2: '#29565a', shadow: 'rgba(43, 27, 13, 0.15)', lineAlpha: 0.19, accentAlpha: 0.14
  }},
  { minute: 1020, palette: manualPalettes.evening },
  { minute: 1065, palette: {
    colorScheme: 'light', bg: '#c7aa86', bgStrong: '#a77f5b', surface: '#efd7b8', surface2: '#d8bb95', text: '#120d09', muted: '#49372a', accent: '#9b4c1c', accent2: '#1f4e54', shadow: 'rgba(38, 23, 13, 0.24)', lineAlpha: 0.28, accentAlpha: 0.18
  }},
  { minute: 1080, palette: {
    colorScheme: 'dark', bg: '#1d1a22', bgStrong: '#312332', surface: '#25212a', surface2: '#302832', text: '#fbf2e8', muted: '#e2d0bd', accent: '#e08c55', accent2: '#8bd3d2', shadow: 'rgba(0, 0, 0, 0.33)', lineAlpha: 0.18, accentAlpha: 0.18
  }},
  { minute: 1140, palette: {
    colorScheme: 'dark', bg: '#211d27', bgStrong: '#352633', surface: '#27232c', surface2: '#332b35', text: '#f8eee4', muted: '#ddcbb9', accent: '#d78957', accent2: '#8bd3d2', shadow: 'rgba(0, 0, 0, 0.32)', lineAlpha: 0.17, accentAlpha: 0.17
  }},
  { minute: 1260, palette: manualPalettes.night },
  { minute: 1440, palette: manualPalettes.night }
];

let temporalTimer = null;
let animationFrame = null;
let currentPalette = null;

export function initTemporalTheme(toggleButton) {
  const safeMode = MODES.includes(localStorage.getItem(STORAGE_KEY))
    ? localStorage.getItem(STORAGE_KEY)
    : 'auto';

  document.documentElement.dataset.themeMode = safeMode;
  applyMode(safeMode, { animate: false });
  updateButton(toggleButton, safeMode);

  toggleButton?.addEventListener('click', () => {
    const current = document.documentElement.dataset.themeMode || 'auto';
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.themeMode = next;
    applyMode(next, { animate: true });
    updateButton(toggleButton, next);
  });
}

function applyMode(mode, options = {}) {
  clearTemporalTimer();
  cancelPaletteAnimation();

  if (mode === 'auto') {
    applyTemporalPalette(options.animate ? MANUAL_TRANSITION_MS : 0);
    temporalTimer = window.setInterval(() => applyTemporalPalette(AUTO_TRANSITION_MS), AUTO_REFRESH_MS);
    return;
  }

  const target = manualPalettes[mode] ?? manualPalettes.day;
  applyOrAnimatePalette(target, mode, options.animate ? MANUAL_TRANSITION_MS : 0);
}

function applyTemporalPalette(duration = AUTO_TRANSITION_MS) {
  const target = getTemporalPalette(new Date());
  applyOrAnimatePalette(target, target.colorScheme === 'dark' ? 'dark' : 'light', duration);
}

function getTemporalPalette(date) {
  const minuteOfDay = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const snappedMinute = Math.floor(minuteOfDay / QUARTER_MINUTES) * QUARTER_MINUTES;
  const offsetInsideQuarter = minuteOfDay - snappedMinute;
  const quantisedMinute = snappedMinute + offsetInsideQuarter;
  const current = findAnchorBefore(quantisedMinute);
  const next = findAnchorAfter(quantisedMinute);
  const span = Math.max(1, next.minute - current.minute);
  const progress = clamp((quantisedMinute - current.minute) / span, 0, 1);
  return mixPalettes(current.palette, next.palette, smoothstep(progress));
}

function findAnchorBefore(minute) {
  for (let index = temporalAnchors.length - 1; index >= 0; index -= 1) {
    if (temporalAnchors[index].minute <= minute) return temporalAnchors[index];
  }
  return temporalAnchors[0];
}

function findAnchorAfter(minute) {
  for (const anchor of temporalAnchors) {
    if (anchor.minute > minute) return anchor;
  }
  return temporalAnchors.at(-1);
}

function applyOrAnimatePalette(target, renderedMode, duration) {
  if (!currentPalette || duration <= 0) {
    applyPalette(target, renderedMode);
    currentPalette = clonePalette(target);
    return;
  }

  animatePalette(currentPalette, target, renderedMode, duration);
}

function animatePalette(from, to, renderedMode, duration) {
  cancelPaletteAnimation();
  const startedAt = performance.now();
  const start = clonePalette(from);
  const end = clonePalette(to);

  const tick = now => {
    const progress = clamp((now - startedAt) / duration, 0, 1);
    const eased = smoothstep(progress);
    const frame = mixPalettes(start, end, eased);
    applyPalette(frame, progress < 1 ? frame.colorScheme : renderedMode);
    currentPalette = clonePalette(frame);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
      return;
    }

    applyPalette(end, renderedMode);
    currentPalette = clonePalette(end);
    animationFrame = null;
  };

  animationFrame = requestAnimationFrame(tick);
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

function cancelPaletteAnimation() {
  if (!animationFrame) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

function updateButton(button, mode) {
  if (!button) return;
  button.textContent = MODE_LABELS[mode] ?? MODE_LABELS.auto;
  button.title = 'Cambiar modo: automático, día, tarde o noche';
  button.setAttribute('aria-label', `Modo visual actual: ${MODE_LABELS[mode] ?? MODE_LABELS.auto}. Pulsar para cambiar.`);
}

function mixPalettes(a, b, amount) {
  return {
    colorScheme: amount < 0.5 ? a.colorScheme : b.colorScheme,
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

function clonePalette(palette) {
  return { ...palette };
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

function smoothstep(value) {
  const amount = clamp(value, 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
