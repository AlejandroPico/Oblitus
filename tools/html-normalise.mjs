export function normaliseGeneratedHtml(html = '') {
  return String(html)
    .replace(/<p>\s*(?:\d+\s*(?:<br\s*\/?\s*>|\s|&nbsp;)*){1,8}<\/p>/gi, '')
    .replace(/<p>([\s\S]*?)<\/p>/gi, (_match, content) => `<p>${cleanParagraph(content)}</p>`)
    .replace(/<p>\s*<\/p>/gi, '');
}

function cleanParagraph(content = '') {
  return String(content)
    .replace(/-\s*<br\s*\/?\s*>\s*/gi, '-')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}
