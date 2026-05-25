/**
 * <image-slot> — emplacement photo interactif.
 *
 * Cliquer ou glisser-déposer une image pour la remplir.
 * Les images sont sauvegardées dans localStorage et persistent entre recharges.
 *
 * Attributs :
 *   id           Clé de persistence (obligatoire pour sauvegarder).
 *   placeholder  Texte affiché quand l'emplacement est vide.
 *
 * La taille vient du CSS parent (width / height sur l'élément ou son conteneur).
 */

(() => {
  const LS_KEY   = 'adp-image-slots';
  const MAX_DIM  = 1200;
  const ACCEPT   = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  /* ── Persistance localStorage ──────────────────────────────────────── */

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveAll(slots) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(slots)); }
    catch (e) { console.warn('image-slot: localStorage plein ou inaccessible.', e); }
  }

  function getSlotData(id) {
    return id ? (loadAll()[id] || null) : null;
  }

  function setSlotData(id, data) {
    if (!id) return;
    const all = loadAll();
    if (data) all[id] = data;
    else delete all[id];
    saveAll(all);
  }

  /* ── Redimensionnement de l'image ──────────────────────────────────── */

  async function fileToDataUrl(file, slotWidth) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap   = Math.min(MAX_DIM, Math.max(1, Math.round(slotWidth * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w     = Math.max(1, Math.round(bitmap.width  * scale));
      const h     = Math.max(1, Math.round(bitmap.height * scale));
      const cv    = Object.assign(document.createElement('canvas'), { width: w, height: h });
      cv.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return cv.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close?.();
    }
  }

  /* ── Styles du Shadow DOM ──────────────────────────────────────────── */

  const CSS = `
    :host {
      display: inline-block;
      position: relative;
      vertical-align: top;
      width: 240px;
      height: 160px;
      font: 13px/1.4 system-ui, -apple-system, sans-serif;
    }

    /* Cadre principal */
    .frame {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: rgba(0, 0, 0, .06);
      border-radius: inherit;
    }

    /* Image remplie */
    .frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* État vide — zone cliquable */
    .empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
      padding: 16px;
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;
      color: rgba(0, 0, 0, .4);
      transition: background .15s;
    }
    .empty:hover { background: rgba(0, 0, 0, .04); }
    .empty svg   { opacity: .5; flex-shrink: 0; }
    .empty .cap  { font-weight: 500; font-size: 13px; letter-spacing: .01em; }
    .empty .sub  { font-size: 11px; color: rgba(0,0,0,.3); }
    .empty .sub u { text-underline-offset: 2px; }

    /* Bordure pointillée */
    .ring {
      position: absolute;
      inset: 0;
      border: 1.5px dashed rgba(0, 0, 0, .2);
      pointer-events: none;
      border-radius: inherit;
      transition: border-color .12s;
    }
    :host([data-filled]) .ring  { display: none; }
    :host([data-over])   .ring  { border-color: #c96442; }
    :host([data-over])   .frame {
      outline: 2px solid #c96442;
      outline-offset: -2px;
      background: rgba(201, 100, 66, .08);
    }

    /* Boutons Replace / Supprimer (hover sur image remplie) */
    .controls {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .15s;
      white-space: nowrap;
      z-index: 3;
    }
    :host([data-filled]):hover .controls {
      opacity: 1;
      pointer-events: auto;
    }
    .controls button {
      appearance: none;
      border: 0;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      background: rgba(0, 0, 0, .65);
      backdrop-filter: blur(6px);
      color: #fff;
      font: 11px/1 system-ui, -apple-system, sans-serif;
    }
    .controls button:hover { background: rgba(0, 0, 0, .85); }
  `;

  const ICON = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="m21 15-5-5L5 21"/>
  </svg>`;

  /* ── Composant ─────────────────────────────────────────────────────── */

  class ImageSlot extends HTMLElement {
    static get observedAttributes() { return ['placeholder']; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>${CSS}</style>
        <div class="frame">
          <img alt="" style="display:none">
          <div class="empty">
            ${ICON}
            <span class="cap"></span>
            <span class="sub">ou <u>parcourir les fichiers</u></span>
          </div>
          <div class="ring"></div>
        </div>
        <div class="controls">
          <button data-act="replace">Remplacer</button>
          <button data-act="clear">Supprimer</button>
        </div>
        <input type="file" accept="${ACCEPT.join(',')}" hidden>
      `;

      this._img      = root.querySelector('img');
      this._empty    = root.querySelector('.empty');
      this._cap      = root.querySelector('.cap');
      this._controls = root.querySelector('.controls');
      this._input    = root.querySelector('input[type=file]');
      this._depth    = 0;   // compteur pour dragenter/dragleave imbriqués

      /* Clic sur la zone vide → ouvre le sélecteur de fichiers */
      this._empty.addEventListener('click', () => this._input.click());

      /* Fichier sélectionné via le sélecteur */
      this._input.addEventListener('change', () => {
        const f = this._input.files?.[0];
        if (f) this._ingest(f);
        this._input.value = '';           // reset pour permettre le même fichier 2×
      });

      /* Boutons Replace / Supprimer */
      this._controls.addEventListener('click', (e) => {
        if (e.target.dataset.act === 'replace') this._input.click();
        if (e.target.dataset.act === 'clear')   this._clear();
      });
    }

    connectedCallback() {
      /* Drag & Drop */
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover',  this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop',      this);

      this._refresh();
    }

    disconnectedCallback() {
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover',  this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop',      this);
    }

    attributeChangedCallback() {
      if (this._cap) this._cap.textContent = this.getAttribute('placeholder') || 'Déposer une image';
    }

    /* handleEvent — un seul objet listener pour les 4 événements drag */
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        if (--this._depth <= 0) { this._depth = 0; this.removeAttribute('data-over'); }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer?.files?.[0];
        if (f) this._ingest(f);
      }
    }

    /* Ingestion d'un fichier image */
    async _ingest(file) {
      if (!ACCEPT.includes(file.type)) {
        alert('Format non supporté.\nUtilisez PNG, JPEG, WebP ou AVIF.');
        return;
      }
      try {
        const w   = this.clientWidth || MAX_DIM;
        const url = await fileToDataUrl(file, w);
        setSlotData(this.id, { u: url });
        this._show(url);
      } catch (err) {
        console.warn('image-slot: impossible de lire l\'image.', err);
        alert('Impossible de lire l\'image. Réessayez avec un autre fichier.');
      }
    }

    /* Suppression */
    _clear() {
      setSlotData(this.id, null);
      this._hide();
    }

    /* Rafraîchissement depuis localStorage */
    _refresh() {
      this._cap.textContent = this.getAttribute('placeholder') || 'Déposer une image';
      const data = getSlotData(this.id);
      if (data?.u && /^data:image\//i.test(data.u)) {
        this._show(data.u);
      } else {
        this._hide();
      }
    }

    _show(url) {
      this._img.src          = url;
      this._img.style.display = 'block';
      this._empty.style.display = 'none';
      this.setAttribute('data-filled', '');
    }

    _hide() {
      this._img.style.display   = 'none';
      this._img.removeAttribute('src');
      this._empty.style.display = 'flex';
      this.removeAttribute('data-filled');
    }
  }

  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
