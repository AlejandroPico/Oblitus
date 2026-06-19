const SHARE_NETWORKS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    title: 'Compartir por WhatsApp',
    buildUrl: ({ url, text }) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    icon: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.224-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.67-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.052 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.82 9.82 0 0 1 6.993 2.9 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.882-9.891 9.882M20.472 3.49A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.946L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.471-8.411"/>'
  },
  {
    id: 'telegram',
    label: 'Telegram',
    title: 'Compartir por Telegram',
    buildUrl: ({ url, text }) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0m4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635"/>'
  },
  {
    id: 'x',
    label: 'X',
    title: 'Compartir por X',
    buildUrl: ({ url, text }) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    icon: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932Zm-1.292 19.49h2.039L6.486 3.24H4.298Z"/>'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    title: 'Compartir por Facebook',
    buildUrl: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: '<path d="M24 12.073C24 5.405 18.627.032 12 .032S0 5.405 0 12.073c0 6.02 4.388 11.012 10.125 11.919v-8.43H7.078v-3.489h3.047V9.415c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97H15.83c-1.491 0-1.956.93-1.956 1.884v2.265h3.328l-.532 3.489h-2.796v8.43C19.612 23.085 24 18.093 24 12.073"/>'
  }
];

initArticleShare();

function initArticleShare() {
  const meta = document.querySelector('#articleMeta');
  const badges = document.querySelector('#articleBadges');
  const title = document.querySelector('#articleTitle');
  if (!meta || !badges || !title) return;

  const row = document.createElement('div');
  row.className = 'article-meta-row';
  meta.before(row);
  row.append(meta);

  const share = document.createElement('nav');
  share.id = 'articleShare';
  share.className = 'article-share';
  share.setAttribute('aria-label', 'Compartir artículo');
  row.append(share);

  const render = () => renderShareLinks(share, title.textContent);
  render();

  const observer = new MutationObserver(render);
  observer.observe(title, { childList: true, characterData: true, subtree: true });
}

function renderShareLinks(container, title) {
  const url = getCanonicalArticleUrl();
  const cleanTitle = String(title || document.title || 'Oblitus est scientia').replace(/\s+/g, ' ').trim();
  const text = cleanTitle.includes('Oblitus est scientia') ? cleanTitle : `${cleanTitle} · Oblitus est scientia`;

  container.innerHTML = SHARE_NETWORKS.map(network => {
    const href = network.buildUrl({ url, text });
    return `
      <a class="share-button share-button-${network.id}" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(network.title)}" title="${escapeAttr(network.title)}">
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          ${network.icon}
        </svg>
      </a>
    `;
  }).join('');
}

function getCanonicalArticleUrl() {
  const url = new URL(window.location.href);
  url.hash = '';
  return url.toString();
}

function escapeAttr(value = '') {
  return String(value).replace(/[&<>'"`]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '`': '&#96;'
  }[char]));
}
