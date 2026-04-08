const trackButtons = Array.from(document.querySelectorAll('.track'));
const frame = document.getElementById('preview-frame');
const playerHint = document.getElementById('player-hint');
const playerTitle = document.getElementById('player-title');
const openLink = document.getElementById('open-link');
const playerSection = document.querySelector('.player');

const inlinePlayerEl = (function () {
  const li = document.createElement('li');
  li.className = 'inline-player-item';
  li.innerHTML = `
    <div class="inline-player">
      <div class="player-header">
        <h2 class="inline-player-title"></h2>
        <a class="inline-open-link" href="#" target="_blank" rel="noopener noreferrer">Abrir original</a>
      </div>
      <div class="player-frame-wrap">
        <iframe
          class="inline-preview-frame"
          title="Preview de audio"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
        <div class="inline-player-hint player-hint">
          Toque em uma música para abrir o preview aqui na página.
        </div>
      </div>
    </div>`;
  return li;
}());

const inlineFrame = inlinePlayerEl.querySelector('.inline-preview-frame');
const inlineHint = inlinePlayerEl.querySelector('.inline-player-hint');
const inlineTitle = inlinePlayerEl.querySelector('.inline-player-title');
const inlineLink = inlinePlayerEl.querySelector('.inline-open-link');

function isMobileLayout() {
  return window.innerWidth < 1040;
}

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

function applyPlayerState(frameEl, hintEl, url, kind) {
  if (kind === 'youtube' && window.location.protocol === 'file:') {
    frameEl.removeAttribute('src');
    frameEl.style.display = 'none';
    hintEl.style.display = 'grid';
    hintEl.textContent = 'YouTube pode bloquear embed em arquivo local (erro 153). Abra via localhost para exibir o video na pagina.';
    return;
  }

  if (isDriveFolder(url)) {
    frameEl.removeAttribute('src');
    frameEl.style.display = 'none';
    hintEl.style.display = 'grid';
    hintEl.textContent = 'Este item e uma pasta do Google Drive e foi aberto em nova aba.';
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const embeddableUrl = getEmbeddableUrl(url);

  if (embeddableUrl) {
    frameEl.src = embeddableUrl;
    frameEl.style.display = 'block';
    hintEl.style.display = 'none';
    return;
  }

  frameEl.removeAttribute('src');
  frameEl.style.display = 'none';
  hintEl.style.display = 'grid';
  hintEl.textContent = 'Nao foi possivel gerar preview para este link. Use "Abrir original".';
}

function selectTrack(button) {
  const url = button.dataset.url || '';
  const title = button.dataset.title || 'Faixa';
  const kind = getLinkKind(url);

  clearActive();
  button.classList.add('active');

  if (isMobileLayout()) {
    const parentLi = button.closest('li');

    if (parentLi && parentLi.nextSibling !== inlinePlayerEl) {
      inlineFrame.removeAttribute('src');
      inlineFrame.style.display = 'none';
      inlineHint.style.display = 'grid';
      inlineHint.textContent = 'Toque em uma música para abrir o preview aqui na página.';
      parentLi.after(inlinePlayerEl);
    }

    inlineTitle.textContent = title;
    inlineLink.href = url;
    applyPlayerState(inlineFrame, inlineHint, url, kind);
  } else {
    playerTitle.textContent = title;
    openLink.href = url;
    applyPlayerState(frame, playerHint, url, kind);
  }
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

if (trackButtons.length > 0) {
  selectTrack(trackButtons[0]);
}
