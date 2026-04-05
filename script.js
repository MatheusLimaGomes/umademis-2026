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

    const nameSpan = document.createElement('span');
    nameSpan.className = 'track-name';
    nameSpan.textContent = titleText;

    const kindSpan = document.createElement('span');
    kindSpan.className = 'track-kind';
    kindSpan.textContent = getKindLabel(kind);

    button.replaceChildren(nameSpan, kindSpan);
  });
}

function isYouTube(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'youtu.be' ||
      parsed.hostname === 'www.youtu.be' ||
      parsed.hostname === 'music.youtube.com';
  } catch (error) {
    return false;
  }
}

function isDriveFolder(url) {
  return /drive\.google\.com\/drive\/folders\//i.test(url);
}

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com' || parsed.hostname === 'music.youtube.com') {
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
    ph.textContent = 'YouTube pode bloquear embed em arquivo local (erro 153). Abra via localhost para exibir o vídeo na página.';
    return;
  }

  if (isDriveFolder(url)) {
    f.removeAttribute('src');
    f.style.display = 'none';
    ph.style.display = 'grid';
    ph.textContent = 'Este item é uma pasta do Google Drive e foi aberto em nova aba.';
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
  ph.textContent = 'Não foi possível gerar preview para este link. Use "Abrir original".';
}

function createInlinePlayer(voiceCard) {
  const inlinePlayer = document.createElement('div');
  inlinePlayer.className = 'inline-player glass';
  inlinePlayer.setAttribute('aria-label', 'Preview da mídia');

  const header = document.createElement('div');
  header.className = 'player-header';

  const title = document.createElement('h2');
  title.className = 'inline-player-title';
  title.textContent = 'Selecione uma faixa';

  const link = document.createElement('a');
  link.className = 'inline-player-link';
  link.href = '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Abrir original';

  header.appendChild(title);
  header.appendChild(link);

  const frameWrap = document.createElement('div');
  frameWrap.className = 'player-frame-wrap';

  const iframe = document.createElement('iframe');
  iframe.className = 'inline-frame';
  iframe.title = 'Preview de áudio';
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  const hint = document.createElement('div');
  hint.className = 'player-hint';
  hint.textContent = 'Toque em uma música para abrir o preview aqui.';

  frameWrap.appendChild(iframe);
  frameWrap.appendChild(hint);

  inlinePlayer.appendChild(header);
  inlinePlayer.appendChild(frameWrap);

  voiceCard.appendChild(inlinePlayer);
  return inlinePlayer;
}

function initInlinePlayers() {
  voiceCards.forEach((card) => {
    inlinePlayerMap.set(card, createInlinePlayer(card));
  });
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 1039px)').matches;
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

      if (scrollIntoView && isMobileLayout()) {
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
