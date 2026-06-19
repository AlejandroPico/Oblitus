(() => {
  const STORAGE_KEY = 'oes-theme-mode';
  const root = document.documentElement;
  const SOLAR_ZENITH = 90.833;
  const LOCATION = { latitude: 41.3874, longitude: 2.1686 };

  installAnchorOffsetStyles();

  const palettes = {
    day: {
      scheme: 'light', bg: '#f3eee5', bgStrong: '#e6dac8', surface: '#fffaf1', surface2: '#f8f0e2',
      text: '#151412', muted: '#60594e', accent: '#7c2d12', accent2: '#1f4d4f',
      line: 'rgba(21, 20, 18, 0.16)', accentSoft: 'rgba(124, 45, 18, 0.12)', shadow: '0 20px 50px rgba(34, 25, 14, 0.12)'
    },
    lateDay: {
      scheme: 'light', bg: '#eadcc8', bgStrong: '#d7bd99', surface: '#fff1dd', surface2: '#f1dfc4',
      text: '#18130f', muted: '#5f4d3e', accent: '#884018', accent2: '#29565a',
      line: 'rgba(24, 19, 15, 0.19)', accentSoft: 'rgba(136, 64, 24, 0.14)', shadow: '0 20px 50px rgba(43, 27, 13, 0.15)'
    },
    evening: {
      scheme: 'light', bg: '#dac3a5', bgStrong: '#bd9a72', surface: '#f7e5ca', surface2: '#e7cfad',
      text: '#17110d', muted: '#4f3e31', accent: '#8e3f16', accent2: '#214d52',
      line: 'rgba(23, 17, 13, 0.24)', accentSoft: 'rgba(142, 63, 22, 0.17)', shadow: '0 20px 50px rgba(45, 29, 16, 0.2)'
    },
    blueHour: {
      scheme: 'dark', bg: '#211d27', bgStrong: '#352633', surface: '#27232c', surface2: '#332b35',
      text: '#f8eee4', muted: '#ddcbb9', accent: '#d78957', accent2: '#8bd3d2',
      line: 'rgba(248, 238, 228, 0.17)', accentSoft: 'rgba(215, 137, 87, 0.17)', shadow: '0 20px 50px rgba(0, 0, 0, 0.32)'
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

  function installAnchorOffsetStyles() {
    if (document.getElementById('oes-anchor-offset-style')) return;

    const style = document.createElement('style');
    style.id = 'oes-anchor-offset-style';
    style.textContent = `
      :root { --oes-anchor-offset: 6.7rem; }
      html { scroll-padding-top: var(--oes-anchor-offset); }
      #articulos,
      #contenido,
      .article-body :is(h2, h3, h4)[id],
      .static-page :is(h2, h3, h4)[id],
      .article-body [id] {
        scroll-margin-top: var(--oes-anchor-offset);
      }
      @media (max-width: 760px) {
        :root { --oes-anchor-offset: 5.85rem; }
      }
    `;
    document.head.append(style);
  }

  function getAutoPalette() {
    const now = new Date();
    const minute = now.getHours() * 60 + now.getMinutes();
    const solar = getSolarDay(now);

    if (minute < solar.sunrise - 60 || minute >= solar.sunset + 150) return palettes.night;
    if (minute < solar.sunrise + 60) return palettes.lateDay;
    if (minute < solar.sunset - 135) return palettes.day;
    if (minute < solar.sunset - 45) return palettes.lateDay;
    if (minute < solar.sunset + 75) return palettes.evening;
    return palettes.blueHour;
  }

  function getSolarDay(date) {
    const day = dayOfYear(date);
    const gamma = (2 * Math.PI / 365) * (day - 1);
    const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    const lat = LOCATION.latitude * Math.PI / 180;
    const zenith = SOLAR_ZENITH * Math.PI / 180;
    const hourAngle = Math.acos(clamp((Math.cos(zenith) / (Math.cos(lat) * Math.cos(decl))) - Math.tan(lat) * Math.tan(decl), -1, 1)) * 180 / Math.PI;
    const offset = -date.getTimezoneOffset() / 60;
    return {
      sunrise: clamp(720 - (4 * (LOCATION.longitude + hourAngle)) - eqTime + (offset * 60), 0, 1440),
      sunset: clamp(720 - (4 * (LOCATION.longitude - hourAngle)) - eqTime + (offset * 60), 0, 1440)
    };
  }

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / 86400000);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
})();
