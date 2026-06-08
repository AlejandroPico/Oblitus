export function initEditorialWidgets(article, container) {
  if (!article || !container) return;
  initOutlineStepper(article, container);
  insertEditorialVisual(article, container);
}

function initOutlineStepper(article, container) {
  const table = container.querySelector('.source-outline-table');
  if (!table || container.querySelector('.auto-outline-widget')) return;
  const rows = [...table.querySelectorAll('tbody tr')]
    .map((row) => [...row.children].map((cell) => cell.textContent.trim()))
    .filter((cells) => cells.length >= 2 && cells[0] && cells[1]);
  if (rows.length < 3) return;

  const section = document.createElement('section');
  section.className = 'interactive-block editorial-widget auto-outline-widget';
  section.innerHTML = '<h3>Recorrido interactivo del artículo</h3><p class="compact-line">Usa este módulo para consultar la estructura del documento sin volver a la tabla completa.</p><div class="widget-stage" data-widget-stage></div>';
  table.closest('.table-wrap')?.insertAdjacentElement('afterend', section);

  initStepper(section, rows.map(([title, text]) => ({
    title,
    year: title.split(' ')[0],
    count: 'sección',
    members: title,
    note: text
  })));
}

function insertEditorialVisual(article, container) {
  if (container.querySelector('.auto-editorial-visual')) return;
  const firstHeading = container.querySelector('h2:nth-of-type(2), h2');
  if (!firstHeading) return;
  const figure = document.createElement('figure');
  figure.className = 'article-visual strategic-map-card auto-editorial-visual';
  figure.innerHTML = '<svg viewBox="0 0 900 260" role="img" aria-label="Esquema editorial"><rect width="900" height="260" rx="18" fill="var(--surface-2)"></rect><rect x="70" y="70" width="220" height="110" rx="16" fill="none" stroke="var(--accent-2)" stroke-width="3"></rect><rect x="610" y="70" width="220" height="110" rx="16" fill="none" stroke="var(--accent)" stroke-width="3"></rect><circle cx="450" cy="125" r="70" fill="var(--accent-soft)"></circle><text x="450" y="122" text-anchor="middle" font-size="26" font-family="Inter, Arial, sans-serif" font-weight="900" fill="currentColor">Eje estratégico</text><text x="450" y="154" text-anchor="middle" font-size="15" font-family="Inter, Arial, sans-serif" fill="currentColor">actores · tensiones · decisiones</text><path d="M290 125 C350 110 380 112 402 125" stroke="var(--accent-2)" stroke-width="5" fill="none" stroke-linecap="round"></path><path d="M610 125 C550 110 520 112 498 125" stroke="var(--accent)" stroke-width="5" fill="none" stroke-linecap="round"></path></svg><figcaption>Esquema visual añadido automáticamente para abrir una pausa gráfica antes del desarrollo analítico.</figcaption>';
  firstHeading.insertAdjacentElement('afterend', figure);
}

function initStepper(root, items) {
  const stage = root.querySelector('[data-widget-stage]');
  if (!stage || !items.length) return;
  let index = 0;
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const render = () => {
    const item = items[index];
    stage.innerHTML = '<div class="widget-control-row"><button type="button" data-prev>Anterior</button><select aria-label="Seleccionar apartado">' + items.map((entry, i) => '<option value="' + i + '"' + (i === index ? ' selected' : '') + '>' + escape(entry.title) + '</option>').join('') + '</select><button type="button" data-next>Siguiente</button></div><div class="widget-card"><p class="widget-kicker">' + escape(item.year) + '</p><h4>' + escape(item.title) + '</h4><p class="widget-count">' + escape(item.count) + '</p><p><strong>Clave:</strong> ' + escape(item.members) + '</p><p>' + escape(item.note) + '</p></div>';
    stage.querySelector('[data-prev]').addEventListener('click', () => { index = Math.max(0, index - 1); render(); });
    stage.querySelector('[data-next]').addEventListener('click', () => { index = Math.min(items.length - 1, index + 1); render(); });
    stage.querySelector('select').addEventListener('change', (event) => { index = Number(event.target.value); render(); });
  };
  render();
}
