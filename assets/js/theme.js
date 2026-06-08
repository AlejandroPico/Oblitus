const STORAGE_KEY = 'oes-theme-mode';
const MODES = ['auto', 'day', 'evening', 'night'];
const MODE_LABELS = {
  auto: '◐ Auto',
  day: '☀ Día',
  evening: '◒ Tarde',
  night: '☾ Noche'
};
const AUTO_REFRESH_MS = 60_000;
const MANUAL_TRANSITION_MS = 1800;
const AUTO_TRANSITION_MS = 4200;
const SOLAR_ZENITH = 90.833;
const DEFAULT_SOLAR_LOCATION = {
  latitude: 41.3874,
  longitude: 2.1686,
  label: 'Barcelona'
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

const solarPalettes = {
  deepNight: manualPalettes.night,
  preDawn: {
    colorScheme: 'dark', bg: '#141821', bgStrong: '#202431', surface: '#1a202a', surface2: '#232b36', text: '#f2ebdf', muted: '#cfc1b0', accent: '#d79563', accent2: '#85c8ce', shadow: 'rgba(0, 0, 0, 0.34)', lineAlpha: 0.13, accentAlpha: 0.14
  },
  dawn: {
    colorScheme: 'light', bg: '#d8bfa3', bgStrong: '#b98f68', surface: '#f3dfc2', surface2: '#dfc49f', text: '#18110d', muted: '#564233', accent: '#9b4718', accent2: '#24545a', shadow: 'rgba(43, 27, 13, 0.21)', lineAlpha: 0.23, accentAlpha: 0.18
  },
  day: manualPalettes.day,
  lateDay: {
    colorScheme: 'light', bg: '#eadcc8', bgStrong: '#d7bd99', surface: '#fff1dd', surface2: '#f1dfc4', text: '#18130f', muted: '#5f4d3e', accent: '#884018', accent2: '#29565a', shadow: 'rgba(43, 27, 13, 0.15)', lineAlpha: 0.19, accentAlpha: 0.14
  },
  golden: manualPalettes.evening,
  dusk: {
    colorScheme: 'light', bg: '#c7aa86', bgStrong: '#a77f5b', surface: '#efd7b8', surface2: '#d8bb95', text: '#120d09', muted: '#49372a', accent: '#9b4c1c', accent2: '#1f4e54', shadow: 'rgba(38, 23, 13, 0.24)', lineAlpha: 0.28, accentAlpha: 0.18
  },
  blueHour: {
    colorScheme: 'dark', bg: '#211d27', bgStrong: '#352633', surface: '#27232c', surface2: '#332b35', text: '#f8eee4', muted: '#ddcbb9', accent: '#d78957', accent2: '#8bd3d2', shadow: 'rgba(0, 0, 0, 0.32)', lineAlpha: 0.17, accentAlpha: 0.17
  }
};

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
  const solar = getSolarDay(date, DEFAULT_SOLAR_LOCATION);
  const anchors = getSolarAnchors(solar);
  const current = findAnchorBefore(minuteOfDay, anchors);
  const next = findAnchorAfter(minuteOfDay, anchors);
  const span = Math.max(1, next.minute - current.minute);
  const progress = clamp((minuteOfDay - current.minute) / span, 0, 1);
  return mixPalettes(current.palette, next.palette, smoothstep(progress));
}

function getSolarAnchors({ sunrise, sunset, solarNoon }) {
  return [
    { minute: 0, palette: solarPalettes.deepNight },
    { minute: clamp(sunrise - 120, 0, 1440), palette: solarPalettes.deepNight },
    { minute: clamp(sunrise - 60, 0, 1440), palette: solarPalettes.preDawn },
    { minute: clamp(sunrise + 35, 0, 1440), palette: solarPalettes.dawn },
    { minute: clamp(sunrise + 95, 0, 1440), palette: solarPalettes.day },
    { minute: clamp(solarNoon, 0, 1440), palette: solarPalettes.day },
    { minute: clamp(sunset - 180, 0, 1440), palette: solarPalettes.day },
    { minute: clamp(sunset - 90, 0, 1440), palette: solarPalettes.lateDay },
    { minute: clamp(sunset - 15, 0, 1440), palette: solarPalettes.golden },
    { minute: clamp(sunset + 45, 0, 1440), palette: solarPalettes.dusk },
    { minute: clamp(sunset + 105, 0, 1440), palette: solarPalettes.blueHour },
    { minute: clamp(sunset + 150, 0, 1440), palette: solarPalettes.deepNight },
    { minute: 1440, palette: solarPalettes.deepNight }
  ].sort((a, b) => a.minute - b.minute || 0.001);
}

function getSolarDay(date, location) {
  const day = dayOfYear(date);
  const gamma = (2 * Math.PI / 365) * (day - 1);
  const equationOfTime = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
  const declination = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma);

  const latitude = toRadians(location.latitude);
  const zenith = toRadians(SOLAR_ZENITH);
  const hourAngle = Math.acos(clamp(
    (Math.cos(zenith) / (Math.cos(latitude) * Math.cos(declination))) - Math.tan(latitude) * Math.tan(declination),
    -1,
    1
  ));
  const hourAngleDegrees = toDegrees(hourAngle);
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const solarNoon = 720 - (4 * location.longitude) - equationOfTime + (timezoneOffsetHours * 60);
  const sunrise = 720 - (4 * (location.longitude + hourAngleDegrees)) - equationOfTime + (timezoneOffsetHours * 60);
  const sunset = 720 - (4 * (location.longitude - hourAngleDegrees)) - equationOfTime + (timezoneOffsetHours * 60);

  return {
    sunrise: clamp(sunrise, 0, 1440),
    sunset: clamp(sunset, 0, 1440),
    solarNoon: clamp(solarNoon, 0, 1440)
  };
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / 86_400_000);
}

function findAnchorBefore(minute, anchors) {
  for (let index = anchors.length - 1; index >= 0; index -= 1) {
    if (anchors[index].minute <= minute) return anchors[index];
  }
  return anchors[0];
}

function findAnchorAfter(minute, anchors) {
  for (const anchor of anchors) {
    if (anchor.minute > minute) return anchor;
  }
  return anchors.at(-1);
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

function toRadians(value) {
  return value * Math.PI / 180;
}

function toDegrees(value) {
  return value * 180 / Math.PI;
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
