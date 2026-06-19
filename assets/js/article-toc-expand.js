initTocExpandOnNavigate();

function initTocExpandOnNavigate() {
  const toc = document.querySelector('#tocList');
  const content = document.querySelector('#articleContent');
  if (!toc || !content) return;

  toc.addEventListener('click', event => {
    const link = event.target.closest('a[data-toc-link]');
    if (!link) return;

    const headingId = link.dataset.tocLink;
    const heading = headingId ? content.querySelector(`#${cssEscape(headingId)}`) : null;
    if (!heading) return;

    expandChapterContaining(heading);
  }, true);
}

function expandChapterContaining(heading) {
  const chapterHeading = heading.matches('h2') ? heading : findPreviousChapterHeading(heading);
  if (!chapterHeading) return;

  const button = chapterHeading.querySelector('.chapter-toggle');
  const nodes = getChapterNodes(chapterHeading);
  const isCollapsed = nodes.some(node => node.classList?.contains('chapter-collapsed'));

  if (!button || !isCollapsed) return;

  nodes.forEach(node => node.classList.remove('chapter-collapsed'));
  button.textContent = 'Contraer';
}

function findPreviousChapterHeading(node) {
  let current = node;
  while (current) {
    if (current.matches?.('h2')) return current;
    let previous = current.previousElementSibling;
    while (previous) {
      if (previous.matches?.('h2')) return previous;
      const nestedHeadings = [...previous.querySelectorAll?.('h2') ?? []];
      if (nestedHeadings.length) return nestedHeadings.at(-1);
      previous = previous.previousElementSibling;
    }
    current = current.parentElement;
  }
  return null;
}

function getChapterNodes(heading) {
  const nodes = [];
  let node = heading.nextElementSibling;
  while (node && node.tagName !== 'H2') {
    nodes.push(node);
    node = node.nextElementSibling;
  }
  return nodes;
}

function cssEscape(value = '') {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/["\\]/g, '\\$&');
}
