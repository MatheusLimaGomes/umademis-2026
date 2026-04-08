const trackButtons = Array.from(document.querySelectorAll('.track'));
const frame = document.getElementById('preview-frame');
const playerHint = document.getElementById('player-hint');
const playerTitle = document.getElementById('player-title');
const openLink = document.getElementById('open-link');
const layout = document.querySelector('.layout');
const playlist = document.querySelector('.playlist');
const player = document.querySelector('.player');
const desktopBreakpoint = window.matchMedia('(min-width: 1040px)');
const playerOriginalAnchor = document.createComment('player-original-anchor');
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

if (layout && player) {
  layout.insertBefore(playerOriginalAnchor, player);
}

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

function restorePlayerToLayout() {
  if (!layout || !player || !playerOriginalAnchor.parentNode) {
    return;
  }

  playerOriginalAnchor.parentNode.insertBefore(player, playerOriginalAnchor.nextSibling);
}

function placePlayerAfterVoiceCard(button) {
  if (!playlist || !player || !button) {
    return;
  }

  const voiceCard = button.closest('.voice-card');

  if (!voiceCard || voiceCard.parentNode !== playlist) {
    return;
  }

  voiceCard.insertAdjacentElement('afterend', player);
}

function syncPlayerPlacement(button) {
  if (desktopBreakpoint.matches) {
    restorePlayerToLayout();
    return;
  }

  placePlayerAfterVoiceCard(button);
}

function selectTrack(button) {
  const url = button.dataset.url || '';
  const title = button.dataset.title || 'Faixa';
  const kind = getLinkKind(url);

  clearActive();
  button.classList.add('active');
  syncPlayerPlacement(button);
  playerTitle.textContent = title;
  openLink.href = url;

  if (kind === 'youtube' && window.location.protocol === 'file:') {
    frame.removeAttribute('src');
    frame.style.display = 'none';
    playerHint.style.display = 'grid';
    playerHint.textContent = 'YouTube pode bloquear embed em arquivo local (erro 153). Abra via localhost para exibir o video na pagina.';
    return;
  }

  if (isDriveFolder(url)) {
    frame.removeAttribute('src');
    frame.style.display = 'none';
    playerHint.style.display = 'grid';
    playerHint.textContent = 'Este item e uma pasta do Google Drive e foi aberto em nova aba.';
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const embeddableUrl = getEmbeddableUrl(url);

  if (embeddableUrl) {
    frame.src = embeddableUrl;
    frame.style.display = 'block';
    playerHint.style.display = 'none';
    return;
  }

  frame.removeAttribute('src');
  frame.style.display = 'none';
  playerHint.style.display = 'grid';
  playerHint.textContent = 'Nao foi possivel gerar preview para este link. Use "Abrir original".';
}

trackButtons.forEach((button) => {
  button.addEventListener('click', () => selectTrack(button));
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

window.addEventListener('resize', () => {
  const activeButton = document.querySelector('.track.active');

  if (activeButton) {
    syncPlayerPlacement(activeButton);
  }
});

if (trackButtons.length > 0) {
  selectTrack(trackButtons[0]);
}
