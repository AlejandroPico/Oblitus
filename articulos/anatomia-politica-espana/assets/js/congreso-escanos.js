(() => {
  const widgetRoot = document.getElementById('oblitus-politica-escanos-widget');
  const appRoot = document.getElementById('oblitus-politica-escanos-app');
  const dataScript = document.getElementById('oblitus-politica-escanos-data');
  if (!widgetRoot || !appRoot || !dataScript) return;

  const namespace = 'http://www.w3.org/2000/svg';
  let data;
  try {
    data = JSON.parse(dataScript.textContent || '{}');
  } catch (error) {
    clearNode(appRoot);
    appRoot.appendChild(createElement('p', {}, 'No se han podido interpretar los datos electorales del widget.'));
    return;
  }

  const groups = Array.isArray(data.groups) ? data.groups : [];
  const elections = Array.isArray(data.elections) ? data.elections : [];
  const totalSeats = Number(data.meta && data.meta.totalSeats) || 350;
  let selectedIndex = elections.length ? elections.length - 1 : 0;

  const createElement = (tag, attributes = {}, text = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (text) element.textContent = text;
    return element;
  };

  const createSvgElement = (tag, attributes = {}) => {
    const element = document.createElementNS(namespace, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  const clearNode = (node) => {
    while (node.firstChild) node.removeChild(node.firstChild);
  };

  const groupById = new Map(groups.map((group) => [group.id, group]));

  const buildControls = () => {
    const controls = createElement('div', { class: 'oblitus-politica-escanos-controls' });
    const label = createElement('label', { for: 'oblitus-politica-escanos-select' }, 'Elección: ');
    const select = createElement('select', { id: 'oblitus-politica-escanos-select' });
    elections.forEach((election, index) => {
      const option = createElement('option', { value: index }, election.label);
      if (index === selectedIndex) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      selectedIndex = Number(select.value);
      render();
    });
    label.appendChild(select);

    const previous = createElement('button', { type: 'button', 'aria-label': 'Mostrar elección anterior' }, 'Anterior');
    previous.addEventListener('click', () => {
      selectedIndex = Math.max(0, selectedIndex - 1);
      render();
    });
    const next = createElement('button', { type: 'button', 'aria-label': 'Mostrar elección siguiente' }, 'Siguiente');
    next.addEventListener('click', () => {
      selectedIndex = Math.min(elections.length - 1, selectedIndex + 1);
      render();
    });

    controls.appendChild(label);
    controls.appendChild(previous);
    controls.appendChild(next);
    return controls;
  };

  const renderSelectedBar = (election) => {
    const width = 900;
    const height = 160;
    const barX = 42;
    const barY = 54;
    const barWidth = 810;
    const barHeight = 42;
    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': `Reparto agrupado de escaños en ${election.label}`
    });
    const title = createSvgElement('title');
    title.textContent = `Reparto agrupado de escaños en ${election.label}`;
    svg.appendChild(title);
    const label = createSvgElement('text', { x: 42, y: 30, 'font-size': 18, 'font-family': 'Arial, sans-serif', fill: '#222' });
    label.textContent = `${election.label} · fuerza más votada: ${election.winner}`;
    svg.appendChild(label);

    let x = barX;
    groups.forEach((group) => {
      const value = Number(election.seats[group.id]) || 0;
      if (value <= 0) return;
      const w = Math.max(1, (value / totalSeats) * barWidth);
      const rect = createSvgElement('rect', { x, y: barY, width: w, height: barHeight, fill: group.color });
      const segmentTitle = createSvgElement('title');
      segmentTitle.textContent = `${group.label}: ${value} escaños`;
      rect.appendChild(segmentTitle);
      svg.appendChild(rect);
      if (w > 42) {
        const text = createSvgElement('text', { x: x + (w / 2), y: barY + 27, 'text-anchor': 'middle', 'font-size': 13, 'font-family': 'Arial, sans-serif', fill: '#fff' });
        text.textContent = value;
        svg.appendChild(text);
      }
      x += w;
    });

    const majorityLineX = barX + (176 / totalSeats) * barWidth;
    svg.appendChild(createSvgElement('line', { x1: majorityLineX, y1: barY - 10, x2: majorityLineX, y2: barY + barHeight + 18, stroke: '#111', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
    const majorityLabel = createSvgElement('text', { x: majorityLineX + 8, y: barY + barHeight + 36, 'font-size': 13, 'font-family': 'Arial, sans-serif', fill: '#222' });
    majorityLabel.textContent = 'Mayoría absoluta: 176';
    svg.appendChild(majorityLabel);
    return svg;
  };

  const renderTimeline = () => {
    const width = 900;
    const rowHeight = 24;
    const left = 92;
    const top = 34;
    const barWidth = 730;
    const height = top + elections.length * rowHeight + 38;
    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': 'Serie temporal del reparto agrupado de escaños entre 1977 y 2023'
    });
    const title = createSvgElement('title');
    title.textContent = 'Serie temporal del reparto agrupado de escaños entre 1977 y 2023';
    svg.appendChild(title);

    elections.forEach((election, index) => {
      const y = top + index * rowHeight;
      const isSelected = index === selectedIndex;
      const yearText = createSvgElement('text', { x: 10, y: y + 15, 'font-size': 13, 'font-family': 'Arial, sans-serif', fill: isSelected ? '#111' : '#555' });
      yearText.textContent = election.label.replace(' de ', ' ');
      svg.appendChild(yearText);
      if (isSelected) {
        svg.appendChild(createSvgElement('rect', { x: left - 4, y: y - 2, width: barWidth + 8, height: rowHeight - 4, fill: 'none', stroke: '#111', 'stroke-width': 2 }));
      }
      let x = left;
      groups.forEach((group) => {
        const value = Number(election.seats[group.id]) || 0;
        if (value <= 0) return;
        const w = Math.max(1, (value / totalSeats) * barWidth);
        const rect = createSvgElement('rect', { x, y, width: w, height: rowHeight - 8, fill: group.color });
        const segmentTitle = createSvgElement('title');
        segmentTitle.textContent = `${election.label} · ${group.label}: ${value} escaños`;
        rect.appendChild(segmentTitle);
        svg.appendChild(rect);
        x += w;
      });
    });
    return svg;
  };

  const renderLegend = () => {
    const legend = createElement('ul', { class: 'oblitus-politica-escanos-legend' });
    groups.forEach((group) => {
      const li = createElement('li');
      const swatch = createSvgElement('svg', { class: 'oblitus-politica-escanos-swatch', width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' });
      swatch.appendChild(createSvgElement('rect', { x: 1, y: 1, width: 12, height: 12, fill: group.color }));
      li.appendChild(swatch);
      li.appendChild(document.createTextNode(` ${group.label}`));
      legend.appendChild(li);
    });
    return legend;
  };

  const renderTable = (election) => {
    const wrap = createElement('div', { class: 'table-wrap' });
    const table = createElement('table');
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    ['Familia política', 'Escaños', 'Porcentaje de la Cámara'].forEach((head) => headerRow.appendChild(createElement('th', {}, head)));
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = createElement('tbody');
    groups.forEach((group) => {
      const value = Number(election.seats[group.id]) || 0;
      if (value <= 0) return;
      const row = createElement('tr');
      row.appendChild(createElement('td', {}, group.label));
      row.appendChild(createElement('td', {}, String(value)));
      row.appendChild(createElement('td', {}, `${((value / totalSeats) * 100).toFixed(1)} %`));
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  };

  const render = () => {
    clearNode(appRoot);
    if (!elections.length || !groups.length) {
      appRoot.appendChild(createElement('p', {}, 'No hay datos electorales disponibles para mostrar.'));
      return;
    }
    const election = elections[selectedIndex];
    appRoot.appendChild(buildControls());
    appRoot.appendChild(renderSelectedBar(election));
    appRoot.appendChild(renderLegend());
    appRoot.appendChild(renderTimeline());
    appRoot.appendChild(renderTable(election));
    const note = createElement('p', { class: 'compact-line' }, data.meta && data.meta.note ? data.meta.note : 'Datos agrupados por familias políticas.');
    appRoot.appendChild(note);
  };

  render();
})();
