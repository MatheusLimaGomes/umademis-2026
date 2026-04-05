const trackButtons = Array.from(document.querySelectorAll('.track'));
const frame = document.getElementById('preview-frame');
const playerHint = document.getElementById('player-hint');
const playerTitle = document.getElementById('player-title');
const openLink = document.getElementById('open-link');
const voiceCards = Array.from(document.querySelectorAll('.voice-card'));
const inlinePlayerMap = new Map();
const heroLogos = [
  {
    mark: document.querySelector('.hero-mark:not(.hero-mark-right)'),
    image: document.getElementById('hero-official-logo')
  },
  {
    mark: document.querySelector('.hero-mark-right'),
    image: document.getElementById('hero-umademis-logo')
  }
];

function getLinkKind(url) {
  if (isYouTube(url)) {
    return 'youtube';
  }

  if (isDriveFolder(url)) {
    return 'drive-folder';
  }

  if (/drive\.google\.com\/file\/d\//i.test(url)) {
    return 'drive-file';
  }

  return 'external';
}

function getKindLabel(kind) {
  if (kind === 'youtube') return 'YouTube';
  if (kind === 'drive-folder') return 'Pasta';
  if (kind === 'drive-file') return 'Drive';
  return 'Link';
}

function decorateTrackButtons() {
  trackButtons.forEach((button) => {
    const url = button.dataset.url || '';
    const kind = getLinkKind(url);
    const titleText = button.textContent ? button.textContent.trim() : 'Faixa';

    button.dataset.kind = kind;
    button.innerHTML = `<span class="track-name">${titleText}</span><span class="track-kind">${getKindLabel(kind)}</span>`;
  });
}

function isYouTube(url) {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function isDriveFolder(url) {
  return /drive\.google\.com\/drive\/folders\//i.test(url);
}

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || '';
    }
  } catch (error) {
    return '';
  }

  return '';
}

function extractDriveFileId(url) {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

function getOriginParam() {
  try {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return window.location.origin;
    }
  } catch (error) {
    return '';
  }

  return '';
}

function getEmbeddableUrl(url) {
  if (isYouTube(url)) {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      return '';
    }

    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1'
    });
    const origin = getOriginParam();

    if (origin) {
      params.set('origin', origin);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }

  if (!isDriveFolder(url)) {
    const driveFileId = extractDriveFileId(url);
    return driveFileId ? `https://drive.google.com/file/d/${driveFileId}/preview` : '';
  }

  return '';
}

function clearActive() {
  trackButtons.forEach((button) => button.classList.remove('active'));
}

function applyPreviewToElements(f, ph, pt, ol, url, title) {
  const kind = getLinkKind(url);

  pt.textContent = title;
  ol.href = url;

  if (kind === 'youtube' && window.location.protocol === 'file:') {
    f.removeAttribute('src');
    f.style.display = 'none';
    ph.style.display = 'grid';
    ph.textContent = 'YouTube pode bloquear embed em arquivo local (erro 153). Abra via localhost para exibir o video na pagina.';
    return;
  }

  if (isDriveFolder(url)) {
    f.removeAttribute('src');
    f.style.display = 'none';
    ph.style.display = 'grid';
    ph.textContent = 'Este item e uma pasta do Google Drive e foi aberto em nova aba.';
    return;
  }

  const embeddableUrl = getEmbeddableUrl(url);

  if (embeddableUrl) {
    f.src = embeddableUrl;
    f.style.display = 'block';
    ph.style.display = 'none';
    return;
  }

  f.removeAttribute('src');
  f.style.display = 'none';
  ph.style.display = 'grid';
  ph.textContent = 'Nao foi possivel gerar preview para este link. Use "Abrir original".';
}

function createInlinePlayer(voiceCard) {
  const inlinePlayer = document.createElement('div');
  inlinePlayer.className = 'inline-player glass';
  inlinePlayer.setAttribute('aria-label', 'Preview da midia');
  inlinePlayer.innerHTML =
    '<div class="player-header">' +
      '<h2 class="inline-player-title">Selecione uma faixa</h2>' +
      '<a class="inline-player-link" href="#" target="_blank" rel="noopener noreferrer">Abrir original</a>' +
    '</div>' +
    '<div class="player-frame-wrap">' +
      '<iframe' +
        ' class="inline-frame"' +
        ' title="Preview de audio"' +
        ' loading="lazy"' +
        ' allow="autoplay; encrypted-media; picture-in-picture"' +
        ' allowfullscreen' +
        ' referrerpolicy="strict-origin-when-cross-origin"' +
      '></iframe>' +
      '<div class="player-hint">' +
        'Toque em uma musica para abrir o preview aqui.' +
      '</div>' +
    '</div>';
  voiceCard.appendChild(inlinePlayer);
  return inlinePlayer;
}

function initInlinePlayers() {
  voiceCards.forEach((card) => {
    inlinePlayerMap.set(card, createInlinePlayer(card));
  });
}

function selectTrack(button, scrollIntoView) {
  const url = button.dataset.url || '';
  const title = button.dataset.title || 'Faixa';

  clearActive();
  button.classList.add('active');

  if (isDriveFolder(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  applyPreviewToElements(frame, playerHint, playerTitle, openLink, url, title);

  const parentCard = button.closest('.voice-card');

  inlinePlayerMap.forEach((inlinePlayer, card) => {
    if (card !== parentCard) {
      if (inlinePlayer.classList.contains('is-active')) {
        inlinePlayer.classList.remove('is-active');
        const inlineFrame = inlinePlayer.querySelector('.inline-frame');
        if (inlineFrame) {
          inlineFrame.removeAttribute('src');
          inlineFrame.style.display = 'none';
        }
      }
    }
  });

  if (parentCard) {
    const inlinePlayer = inlinePlayerMap.get(parentCard);
    if (inlinePlayer) {
      const inlineFrame = inlinePlayer.querySelector('.inline-frame');
      const inlineHint = inlinePlayer.querySelector('.player-hint');
      const inlineTitle = inlinePlayer.querySelector('.inline-player-title');
      const inlineLink = inlinePlayer.querySelector('.inline-player-link');

      applyPreviewToElements(inlineFrame, inlineHint, inlineTitle, inlineLink, url, title);
      inlinePlayer.classList.add('is-active');

      if (scrollIntoView) {
        inlinePlayer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}

trackButtons.forEach((button) => {
  button.addEventListener('click', () => selectTrack(button, true));
});

heroLogos.forEach(({ mark, image }) => {
  if (!mark || !image) {
    return;
  }

  if (image.complete && image.naturalWidth > 0) {
    mark.classList.add('has-image');
  }

  image.addEventListener('load', () => {
    mark.classList.add('has-image');
  });

  image.addEventListener('error', () => {
    mark.classList.remove('has-image');
  });
});

decorateTrackButtons();

initInlinePlayers();

if (trackButtons.length > 0) {
  selectTrack(trackButtons[0], false);
}
