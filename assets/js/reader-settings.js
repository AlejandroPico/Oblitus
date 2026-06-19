const STORAGE_KEY = 'oes-reader-settings';
const DEFAULT_SETTINGS = {
  fontFamily: 'oblitus',
  fontSize: 1.08,
  lineHeight: 1.74,
  paragraphGap: 1.1,
  shellWidth: 1080,
  textAlign: 'left'
};

const FONT_OPTIONS = {
  oblitus: "var(--font-serif)",
  palatino: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
  georgia: "Georgia, 'Times New Roman', serif",
  times: "'Times New Roman', Times, serif",
  arial: "Arial, Helvetica, sans-serif",
  helvetica: "Helvetica, Arial, sans-serif",
  verdana: "Verdana, Geneva, sans-serif",
  trebuchet: "'Trebuchet MS', Arial, sans-serif",
  system: "var(--font-sans)"
};

const PRESETS = {
  compact: { fontSize: 1, lineHeight: 1.56, paragraphGap: 0.85, shellWidth: 920 },
  normal: { ...DEFAULT_SETTINGS },
  relaxed: { fontSize: 1.14, lineHeight: 1.9, paragraphGap: 1.35, shellWidth: 980 }
};

initReaderSettings();
initThemeLabelCleaner();

function initReaderSettings() {
  applyReaderSettings(loadSettings());

  const themeToggle = document.querySelector('#themeToggle');
  if (!themeToggle || document.querySelector('#readerSettingsHost')) return;

  const host = document.createElement('div');
  host.id = 'readerSettingsHost';
  host.className = 'reader-settings-host';
  host.innerHTML = `
    <button id="readerSettingsToggle" class="reader-settings-toggle" type="button" aria-label="Abrir configuración de lectura" aria-expanded="false" aria-controls="readerSettingsPanel" title="Configuración de lectura">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"></path>
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2.05 2.05 0 0 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2.05 2.05 0 0 1-4.1 0v-.09A1.7 1.7 0 0 0 8.9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2.05 2.05 0 0 1-2.9-2.9l.06-.06A1.7 1.7 0 0 0 4.47 15a1.7 1.7 0 0 0-1.56-1.03H2.8a2.05 2.05 0 0 1 0-4.1h.09A1.7 1.7 0 0 0 4.45 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.05 2.05 0 0 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34h.02A1.7 1.7 0 0 0 9.93 2.9V2.8a2.05 2.05 0 0 1 4.1 0v.09A1.7 1.7 0 0 0 15.06 4.45a1.7 1.7 0 0 0 1.87-.34l.06-.06a2.05 2.05 0 0 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87v.02a1.7 1.7 0 0 0 1.56 1.03h.09a2.05 2.05 0 0 1 0 4.1h-.09A1.7 1.7 0 0 0 19.4 15Z"></path>
      </svg>
    </button>
    <section id="readerSettingsPanel" class="reader-settings-panel" aria-labelledby="readerSettingsTitle" hidden>
      <header>
        <h2 id="readerSettingsTitle">Lectura</h2>
        <p>Ajustes locales para artículos largos. Se guardan solo en este navegador.</p>
      </header>
      <div class="reader-settings-field">
        <label for="readerFontFamily">Tipo de letra</label>
        <select id="readerFontFamily" data-reader-setting="fontFamily">
          <option value="oblitus">Oblitus actual</option>
          <option value="palatino">Palatino</option>
          <option value="georgia">Georgia</option>
          <option value="times">Times New Roman</option>
          <option value="arial">Arial</option>
          <option value="helvetica">Helvetica</option>
          <option value="verdana">Verdana</option>
          <option value="trebuchet">Trebuchet MS</option>
          <option value="system">Sistema / Inter</option>
        </select>
      </div>
      <div class="reader-settings-field">
        <label for="readerFontSize">Tamaño</label>
        <div class="reader-settings-range-row">
          <input id="readerFontSize" type="range" min="0.92" max="1.28" step="0.02" data-reader-setting="fontSize">
          <span class="reader-settings-value" data-reader-value="fontSize"></span>
        </div>
      </div>
      <div class="reader-settings-field">
        <label for="readerLineHeight">Interlineado</label>
        <div class="reader-settings-range-row">
          <input id="readerLineHeight" type="range" min="1.42" max="2.08" step="0.02" data-reader-setting="lineHeight">
          <span class="reader-settings-value" data-reader-value="lineHeight"></span>
        </div>
      </div>
      <div class="reader-settings-field">
        <label for="readerParagraphGap">Separación entre párrafos</label>
        <div class="reader-settings-range-row">
          <input id="readerParagraphGap" type="range" min="0.7" max="1.65" step="0.05" data-reader-setting="paragraphGap">
          <span class="reader-settings-value" data-reader-value="paragraphGap"></span>
        </div>
      </div>
      <div class="reader-settings-field">
        <label for="readerShellWidth">Ancho de lectura</label>
        <div class="reader-settings-range-row">
          <input id="readerShellWidth" type="range" min="760" max="1280" step="20" data-reader-setting="shellWidth">
          <span class="reader-settings-value" data-reader-value="shellWidth"></span>
        </div>
      </div>
      <div class="reader-settings-field">
        <label for="readerTextAlign">Alineación</label>
        <select id="readerTextAlign" data-reader-setting="textAlign">
          <option value="left">Izquierda</option>
          <option value="justify">Justificada</option>
        </select>
      </div>
      <div class="reader-settings-field">
        <p class="reader-settings-group-title">Perfiles rápidos</p>
        <div class="reader-settings-presets">
          <button class="reader-settings-preset" type="button" data-reader-preset="compact">Compacto</button>
          <button class="reader-settings-preset" type="button" data-reader-preset="normal">Normal</button>
          <button class="reader-settings-preset" type="button" data-reader-preset="relaxed">Cómodo</button>
        </div>
      </div>
      <button class="reader-settings-reset" type="button" data-reader-reset>Restablecer</button>
    </section>
  `;

  themeToggle.before(host);
  bindReaderSettings(host);
  syncPanelControls(host, loadSettings());
}

function bindReaderSettings(host) {
  const toggle = host.querySelector('#readerSettingsToggle');
  const panel = host.querySelector('#readerSettingsPanel');

  toggle?.addEventListener('click', event => {
    event.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  panel?.addEventListener('click', event => event.stopPropagation());

  panel?.querySelectorAll('[data-reader-setting]').forEach(control => {
    control.addEventListener('input', () => {
      const settings = readSettingsFromPanel(panel);
      saveSettings(settings);
      applyReaderSettings(settings);
      syncPanelControls(host, settings, { preserveValues: true });
    });
    control.addEventListener('change', () => {
      const settings = readSettingsFromPanel(panel);
      saveSettings(settings);
      applyReaderSettings(settings);
      syncPanelControls(host, settings, { preserveValues: true });
    });
  });

  panel?.querySelectorAll('[data-reader-preset]').forEach(button => {
    button.addEventListener('click', () => {
      const current = loadSettings();
      const preset = PRESETS[button.dataset.readerPreset] ?? PRESETS.normal;
      const next = { ...current, ...preset };
      saveSettings(next);
      applyReaderSettings(next);
      syncPanelControls(host, next);
    });
  });

  panel?.querySelector('[data-reader-reset]')?.addEventListener('click', () => {
    saveSettings(DEFAULT_SETTINGS);
    applyReaderSettings(DEFAULT_SETTINGS);
    syncPanelControls(host, DEFAULT_SETTINGS);
  });

  document.addEventListener('click', () => closeReaderSettings(host));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeReaderSettings(host);
  });
}

function closeReaderSettings(host) {
  const toggle = host.querySelector('#readerSettingsToggle');
  const panel = host.querySelector('#readerSettingsPanel');
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  toggle?.classList.remove('active');
  toggle?.setAttribute('aria-expanded', 'false');
}

function readSettingsFromPanel(panel) {
  return {
    fontFamily: panel.querySelector('[data-reader-setting="fontFamily"]')?.value || DEFAULT_SETTINGS.fontFamily,
    fontSize: readNumber(panel, 'fontSize', DEFAULT_SETTINGS.fontSize),
    lineHeight: readNumber(panel, 'lineHeight', DEFAULT_SETTINGS.lineHeight),
    paragraphGap: readNumber(panel, 'paragraphGap', DEFAULT_SETTINGS.paragraphGap),
    shellWidth: readNumber(panel, 'shellWidth', DEFAULT_SETTINGS.shellWidth),
    textAlign: panel.querySelector('[data-reader-setting="textAlign"]')?.value || DEFAULT_SETTINGS.textAlign
  };
}

function readNumber(panel, setting, fallback) {
  const value = Number(panel.querySelector(`[data-reader-setting="${setting}"]`)?.value);
  return Number.isFinite(value) ? value : fallback;
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return sanitiseSettings({ ...DEFAULT_SETTINGS, ...parsed });
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitiseSettings(settings)));
}

function sanitiseSettings(settings) {
  return {
    fontFamily: FONT_OPTIONS[settings.fontFamily] ? settings.fontFamily : DEFAULT_SETTINGS.fontFamily,
    fontSize: clamp(Number(settings.fontSize), 0.92, 1.28, DEFAULT_SETTINGS.fontSize),
    lineHeight: clamp(Number(settings.lineHeight), 1.42, 2.08, DEFAULT_SETTINGS.lineHeight),
    paragraphGap: clamp(Number(settings.paragraphGap), 0.7, 1.65, DEFAULT_SETTINGS.paragraphGap),
    shellWidth: clamp(Number(settings.shellWidth), 760, 1280, DEFAULT_SETTINGS.shellWidth),
    textAlign: ['left', 'justify'].includes(settings.textAlign) ? settings.textAlign : DEFAULT_SETTINGS.textAlign
  };
}

function applyReaderSettings(rawSettings) {
  const settings = sanitiseSettings(rawSettings);
  const root = document.documentElement;
  root.style.setProperty('--reader-font-family', FONT_OPTIONS[settings.fontFamily]);
  root.style.setProperty('--reader-font-size', `${settings.fontSize}rem`);
  root.style.setProperty('--reader-line-height', String(settings.lineHeight));
  root.style.setProperty('--reader-paragraph-gap', `${settings.paragraphGap}em`);
  root.style.setProperty('--reader-shell-width', `${settings.shellWidth}px`);
  root.style.setProperty('--reader-text-align', settings.textAlign);
}

function syncPanelControls(host, rawSettings, options = {}) {
  const panel = host.querySelector('#readerSettingsPanel');
  if (!panel) return;
  const settings = sanitiseSettings(rawSettings);

  if (!options.preserveValues) {
    panel.querySelector('[data-reader-setting="fontFamily"]').value = settings.fontFamily;
    panel.querySelector('[data-reader-setting="fontSize"]').value = settings.fontSize;
    panel.querySelector('[data-reader-setting="lineHeight"]').value = settings.lineHeight;
    panel.querySelector('[data-reader-setting="paragraphGap"]').value = settings.paragraphGap;
    panel.querySelector('[data-reader-setting="shellWidth"]').value = settings.shellWidth;
    panel.querySelector('[data-reader-setting="textAlign"]').value = settings.textAlign;
  }

  panel.querySelector('[data-reader-value="fontSize"]').textContent = `${Math.round(settings.fontSize * 100)}%`;
  panel.querySelector('[data-reader-value="lineHeight"]').textContent = settings.lineHeight.toFixed(2);
  panel.querySelector('[data-reader-value="paragraphGap"]').textContent = `${settings.paragraphGap.toFixed(2)}em`;
  panel.querySelector('[data-reader-value="shellWidth"]').textContent = `${Math.round(settings.shellWidth)}px`;

  panel.querySelectorAll('[data-reader-preset]').forEach(button => {
    const preset = PRESETS[button.dataset.readerPreset];
    const active = preset
      && Math.abs(settings.fontSize - preset.fontSize) < 0.01
      && Math.abs(settings.lineHeight - preset.lineHeight) < 0.01
      && Math.abs(settings.paragraphGap - preset.paragraphGap) < 0.01
      && Math.abs(settings.shellWidth - preset.shellWidth) < 1;
    button.classList.toggle('active', active);
  });
}

function initThemeLabelCleaner() {
  const button = document.querySelector('#themeToggle');
  if (!button) return;

  const clean = () => {
    if (/^◐ Auto\s*·/.test(button.textContent || '')) {
      button.textContent = '◐ Auto';
    }
  };

  clean();
  new MutationObserver(clean).observe(button, { childList: true, characterData: true, subtree: true });
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
