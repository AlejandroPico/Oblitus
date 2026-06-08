export function cleanupArticleHtml(html = '') {
  let output = String(html);
  output = output.replace(/<p>\s*(?:\d+\s*(?:<br\s*\/?\s*>|\s|&nbsp;)*){1,8}<\/p>/gi, '');
  output = output.replace(/<p>\s*•\s*<\/p>\s*<p>/gi, '<p>• ');
  output = output.replace(/<p>([\s\S]*?)<\/p>/gi, (_match, content) => {
    const cleaned = cleanParagraphContent(content);
    if (!cleaned || /^(?:\d+\s*){1,8}$/.test(cleaned)) return '';
    return `<p>${cleaned}</p>`;
  });
  for (let index = 0; index < 10; index += 1) {
    const previous = output;
    output = output.replace(/<p>([\s\S]*?[^.!?;:»)”])<\/p>\s*<p>([a-záéíóúñü])/giu, '<p>$1 $2');
    if (output === previous) break;
  }
  return output;
}

export function applyEditorialEnhancements(html = '', articleId = '') {
  if (articleId === 'otan-historia-estructura-capacidades-desafios') return enhanceNatoArticle(html);
  if (articleId === 'guerra-ucrania-analisis-historico-geopolitico') return enhanceUkraineArticle(html);
  return html;
}

function cleanParagraphContent(content = '') {
  return String(content)
    .replace(/-\s*<br\s*\/?\s*>\s*/gi, '-')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([¿¡(])\s+/g, '$1')
    .replace(/\s+([)])/g, '$1')
    .trim();
}

function enhanceNatoArticle(html) {
  let output = html;
  output = output.replace(/<h2>Tabla de contenidos y resumen de secciones<\/h2>\s*<pre class="source-outline">[\s\S]*?<\/pre>/i, natoOutlineTable());
  if (!output.includes('id="nato-expansion-widget"')) {
    output = output.replace(/<h2>1\. Introducción<\/h2>/i, `<h2>1. Introducción</h2>\n${natoStrategicVisual()}\n${natoExpansionWidget()}`);
  }
  if (!output.includes('id="nato-command-widget"')) {
    output = output.replace(/(<h2>8\. Estructura[\s\S]*?liderazgo de la OTAN<\/h2>)/i, `$1\n${natoCommandWidget()}`);
  }
  return output;
}

function enhanceUkraineArticle(html) {
  let output = html;
  output = output.replace(/<h2>Tabla de contenidos y resumen de apartados<\/h2>\s*<pre class="source-outline">[\s\S]*?<\/pre>/i, ukraineOutlineTable());
  if (!output.includes('id="ukraine-chronology-widget"')) {
    output = output.replace(/<h2>Contexto Histórico y Orígenes del Conflicto<\/h2>/i, `<h2>Contexto Histórico y Orígenes del Conflicto</h2>\n${ukraineStrategicVisual()}\n${ukraineChronologyWidget()}`);
  }
  if (!output.includes('id="ukraine-coalitions-widget"')) {
    output = output.replace(/(<h2>Aliados de Ucrania vs Aliados de Rusia<\/h2>)/i, `$1\n${ukraineCoalitionsWidget()}`);
  }
  return output;
}

function tableSection(title, headings, rows) {
  const body = rows.map(([first, second]) => `<tr><td>${first}</td><td>${second}</td></tr>`).join('\n');
  return `\n<h2>${title}</h2>\n<div class="table-wrap">\n<table class="source-outline-table"><thead><tr><th>${headings[0]}</th><th>${headings[1]}</th></tr></thead><tbody>\n${body}\n</tbody></table>\n</div>`;
}

function stepperSection(id, title, intro, items) {
  const encoded = encodeURIComponent(JSON.stringify(items));
  return `\n<section class="interactive-block editorial-widget editorial-stepper" id="${id}" aria-labelledby="${id}-title" data-stepper-items="${encoded}">\n<h3 id="${id}-title">${title}</h3>\n<p class="compact-line">${intro}</p>\n<div class="widget-stage" data-widget-stage></div>\n</section>`;
}
