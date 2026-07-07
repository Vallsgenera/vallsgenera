'use strict';
/* ════════════════════════════════════════════════════════════
   Vallsgenera Studio – Editor visual de tour
   ════════════════════════════════════════════════════════════ */

/* Converteix un data URI (base64) en Blob per desar-lo a IndexedDB */
function dataURItoBlob(dataURI) {
  const [head, b64] = dataURI.split(',');
  const mime = (head.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ── Icones SVG per hotspot (reutilitzades de tour.js) ── */
const STUDIO_HS_ICONS = {
  info:  `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.5" r=".8" fill="white" stroke="none"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="white" stroke="none"><path d="M8 5.14v14l11-7-11-7z"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  link:  `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  nav:   `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`,
  text:  `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`
};

/* ── Selector d'icona (tipus estàndard) ── */
function iconPickerHTML(selected = '') {
  const lib = (typeof HS_ICON_LIBRARY !== 'undefined') ? HS_ICON_LIBRARY : {};
  const buttons = Object.entries(lib).map(([key, svg]) =>
    `<button type="button" class="icon-pick ${selected === key ? 'active' : ''}" data-icon="${key}" title="${key}">${svg}</button>`
  ).join('');
  return `<div class="pp-field">
    <label>Icona <span class="label-hint">(opcional)</span></label>
    <div class="icon-grid">
      <button type="button" class="icon-pick def ${!selected ? 'active' : ''}" data-icon="" title="Per defecte segons el tipus">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>
      </button>
      ${buttons}
    </div>
  </div>`;
}

/* ── Camps dinàmics per cada tipus de hotspot ── */
function dynamicFields(type, hs = {}, scenes = [], currentId = '') {
  const s = hs.style || {};
  switch (type) {
    case 'info':
      return `<div class="pp-field">
        <label>Contingut</label>
        <textarea id="hs-content" rows="5" placeholder="Text informatiu que apareixerà al panell...">${hs.content || ''}</textarea>
      </div>` + iconPickerHTML(hs.icon);

    case 'video': {
      const isEmbed  = /youtube\.com|youtu\.be|vimeo\.com/.test(hs.videoUrl || '');
      const uploaded = !!hs._videoUploaded || (/^https?:\/\//.test(hs.videoUrl || '') && !isEmbed);
      const localMode = uploaded || !!hs.videoLocal;
      return `<div class="pp-field">
        <label>Font del vídeo</label>
        <div class="video-source-tabs">
          <button class="vsrc-tab ${!localMode ? 'active' : ''}" data-src="web">YouTube / Vimeo</button>
          <button class="vsrc-tab ${localMode ? 'active' : ''}" data-src="local">Puja vídeo</button>
        </div>
      </div>
      <div id="hs-video-web" class="pp-field" ${localMode ? 'style="display:none"' : ''}>
        <label>URL embed</label>
        <input type="text" id="hs-videoUrl" placeholder="https://www.youtube.com/embed/ID" value="${isEmbed ? (hs.videoUrl || '') : ''}">
        <p class="field-hint">youtube.com/embed/ID_VIDEO &nbsp;·&nbsp; player.vimeo.com/video/ID</p>
      </div>
      <div id="hs-video-local" class="pp-field" ${!localMode ? 'style="display:none"' : ''}>
        <label>Vídeo <span class="label-hint">(es puja al teu núvol)</span></label>
        <div class="photo-drop" id="hs-vid-drop">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <p id="hs-vid-name">${uploaded ? 'Vídeo pujat ✓' : 'Arrossega o clica per pujar'}</p>
          <input type="file" id="hs-vid-file" accept=".mp4,.webm,.mov,.m4v,video/*">
        </div>
        <p class="field-hint">O ruta manual al repositori: <code>videos/nom.mp4</code></p>
        <input type="text" id="hs-videoLocal" placeholder="videos/nom-video.mp4" value="${hs.videoLocal || ''}">
      </div>
      <div class="pp-field">
        <label>Peu de vídeo <span class="label-hint">(opcional)</span></label>
        <input type="text" id="hs-caption" placeholder="Descripció del vídeo" value="${hs.caption || ''}">
      </div>` + iconPickerHTML(hs.icon);
    }

    case 'image': {
      const hasBlob = hs._hasImgBlob;
      return `<div class="pp-field">
        <label>Imatge</label>
        <div class="photo-drop" id="hs-img-drop">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <p id="hs-img-name">${hasBlob ? 'Imatge pujada ✓' : 'Arrossega o clica per pujar'}</p>
          <input type="file" id="hs-img-file" accept=".jpg,.jpeg,.png,.webp,.gif">
        </div>
      </div>
      <div class="pp-field">
        <label>O URL externa <span class="label-hint">(opcional si has pujat)</span></label>
        <input type="text" id="hs-imageUrl" placeholder="https://... o images/foto.jpg" value="${hasBlob ? '' : (hs.imageUrl || '')}">
      </div>
      <div class="pp-field">
        <label>Peu de foto <span class="label-hint">(opcional)</span></label>
        <input type="text" id="hs-caption" placeholder="Descripció de la imatge" value="${hs.caption || ''}">
      </div>` + iconPickerHTML(hs.icon);
    }

    case 'link':
      return `<div class="pp-field">
        <label>URL de l'enllaç</label>
        <input type="text" id="hs-linkUrl" placeholder="https://..." value="${hs.linkUrl || ''}">
      </div>
      <div class="pp-field">
        <label>Descripció <span class="label-hint">(opcional)</span></label>
        <textarea id="hs-linkDesc" rows="2" placeholder="Breu descripció de l'enllaç...">${hs.linkDesc || ''}</textarea>
      </div>` + iconPickerHTML(hs.icon);

    case 'nav': {
      const opts = scenes
        .filter(sc => sc.id !== currentId)
        .map(sc => `<option value="${sc.id}" ${hs.targetScene === sc.id ? 'selected' : ''}>${sc.name}</option>`)
        .join('');
      const TRANS = [
        ['', 'Per defecte (global)'],
        ['3d', 'Transició 3D'],
        ['cross', 'Creuada simple'],
        ['zoom', 'Zoom blend'],
        ['black', 'Fosa a negre'],
        ['white', 'Flaix blanc'],
        ['wipe-left', 'Dreta → esquerra'],
        ['wipe-down', 'Dalt → baix'],
      ];
      const transOpts = TRANS.map(([v, l]) =>
        `<option value="${v}" ${(hs.transition || '') === v ? 'selected' : ''}>${l}</option>`).join('');
      const hasTV = hs.targetView && hs.targetView.lon != null;
      return `<div class="pp-field">
        <label>Escena de destí</label>
        <select id="hs-targetScene">${opts}</select>
      </div>
      <div class="pp-field">
        <label>Transició en navegar</label>
        <select id="hs-transition">${transOpts}</select>
      </div>
      <div class="pp-field">
        <label>Vista d'arribada <span class="label-hint">(arrossega la miniatura)</span></label>
        <div class="nav-target-preview" id="nav-target-preview">
          <canvas id="nav-target-canvas"></canvas>
          <div class="nav-target-badge" id="nav-target-badge" ${hasTV ? '' : 'style="display:none"'}>Vista personalitzada ✓</div>
        </div>
        <button type="button" id="btn-clear-target-view" class="te-btn-ghost" style="width:100%;margin-top:6px">Usar la vista per defecte de l'escena</button>
      </div>
      <div class="pp-field" style="border-bottom:none;padding-top:6px">
        <button type="button" id="btn-go-target-scene" class="go-target-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          Editar l'escena de destí
        </button>
      </div>`;
    }

    case 'text': {
      const sh = s.bgShape || 'card';
      return `<div class="pp-field">
        <label>Contingut del text</label>
        <input type="text" id="hs-content" placeholder="Text que apareixerà a la panoràmica" value="${hs.content || ''}">
      </div>
      <div class="pp-field">
        <label>Mida (px)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="range" id="hs-fontSize" min="12" max="80" value="${s.fontSize || 22}"
            oninput="document.getElementById('hs-fontSize-val').textContent=this.value+'px'" style="flex:1">
          <span id="hs-fontSize-val" style="min-width:34px;text-align:right;font-size:12px">${s.fontSize || 22}px</span>
        </div>
      </div>
      <div class="pp-field">
        <label>Color del text</label>
        <div class="color-row">
          <input type="color" id="hs-text-color" value="${s.color || '#ffffff'}"
            oninput="document.getElementById('hs-text-color-val').textContent=this.value">
          <span id="hs-text-color-val" style="font-size:11px;font-family:monospace">${s.color || '#ffffff'}</span>
        </div>
      </div>
      <div class="pp-field">
        <label>Fons (color + opacitat)</label>
        <div class="color-row">
          <input type="color" id="hs-bg-color" value="${s.bgColor || '#000000'}">
          <input type="range" id="hs-bg-opacity" min="0" max="100" value="${s.bgOpacity ?? 45}"
            oninput="document.getElementById('hs-bg-val').textContent=this.value+'%'" style="flex:1">
          <span id="hs-bg-val" style="min-width:30px;font-size:12px">${s.bgOpacity ?? 45}%</span>
        </div>
      </div>
      <div class="pp-field">
        <label>Forma del fons</label>
        <div class="shape-pills">
          <button class="shape-pill ${sh==='card'?'active':''}" data-shape="card">Arrodonit</button>
          <button class="shape-pill ${sh==='pill'?'active':''}" data-shape="pill">Píndola</button>
          <button class="shape-pill ${sh==='sharp'?'active':''}" data-shape="sharp">Recte</button>
          <button class="shape-pill ${sh==='none'?'active':''}" data-shape="none">Sense fons</button>
        </div>
      </div>
      <div class="pp-field">
        <label>Rotació</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="range" id="hs-rotation" min="-45" max="45" value="${s.rotation || 0}"
            oninput="document.getElementById('hs-rotation-val').textContent=this.value+'°'" style="flex:1">
          <span id="hs-rotation-val" style="min-width:30px;text-align:right;font-size:12px">${s.rotation || 0}°</span>
        </div>
      </div>
      <div class="pp-field">
        <label>Estil tipogràfic</label>
        <div style="display:flex;gap:14px">
          <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="hs-bold" ${s.bold ? 'checked' : ''}> <b>Negreta</b>
          </label>
          <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="hs-italic" ${s.italic ? 'checked' : ''}> <i>Cursiva</i>
          </label>
        </div>
      </div>`;
    }

    default: return '';
  }
}

function readField(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function uid() {
  return 'hs-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ════════════════════════════════════════════════════════════ */
class Studio {
/* ════════════════════════════════════════════════════════════ */

  constructor() {
    this.scenes = [];
    this.folders = []; // { id, name, collapsed }
    this.currentIdx = 0;
    this.selectedHsId = null;
    this.selectedDecalId = null;
    this.draggingCorner  = null; // 'tl'|'tr'|'br'|'bl' while dragging
    this.addMode = false;
    this._photoUrls  = {}; // sceneId → objectURL (preview)
    this._thumbChecked = new Set(); // sceneId ja consultat a IndexedDB
    this._decalMeshes = {}; // decalId → THREE.Mesh

    // Three.js
    this.threeScene = null;
    this.camera = null;
    this.renderer = null;
    this.sphere = null;

    // Camera control
    this.lon = 0; this.lat = 0; this.fov = 75;
    this.pointerDown = false;
    this.startX = 0; this.startY = 0;
    this.startLon = 0; this.startLat = 0;
    this.velLon = 0; this.velLat = 0;
    this.lastPinch = null;

    this.init();
  }

  /* ── Init ── */
  async init() {
    await this.loadData();
    await this.loadFolders();
    this.setupThree();
    this.renderSceneList();
    this.switchScene(0, false);
    this.setupEvents();
    this.animate();
  }

  /* ── Data ── */
  async loadData() {
    // 1) Treball en curs guardat localment (té prioritat)
    const saved = localStorage.getItem('vg-studio-scenes');
    if (saved) {
      try { this.scenes = JSON.parse(saved); await this.migrateEmbeddedPhotos(); return; } catch(e) {}
    }
    // 2) Núvol propi (Supabase): la versió publicada
    if (typeof sbLoadScenes === 'function') {
      try {
        const cloud = await sbLoadScenes();
        if (cloud && cloud.length) {
          this.scenes = cloud;
          await this.migrateEmbeddedPhotos();
          return;
        }
      } catch(e) {}
    }
    // 3) scenes.json publicat al repositori (si n'hi ha)
    try {
      const r = await fetch('scenes.json', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length) {
          this.scenes = data;
          await this.migrateEmbeddedPhotos();
          return;
        }
      }
    } catch(e) {}
    // 3) Si no, escenes per defecte de tour.js
    if (typeof SCENES !== 'undefined') {
      this.scenes = JSON.parse(JSON.stringify(SCENES));
    } else {
      this.scenes = [{ id: 'escena-1', name: 'Escena 1', color: '#0F6E56', shade: '#0a5040', hotspots: [] }];
    }
  }

  /* Mou les fotos incrustades (data URIs del scenes.json) cap a IndexedDB
     i les treu de memòria, perquè localStorage no es desbordi i el Tour
     les pugui llegir d'IndexedDB. */
  async migrateEmbeddedPhotos() {
    for (const s of this.scenes) {
      if (typeof s.image === 'string' && s.image.startsWith('data:')) {
        try {
          const existing = await PhotoStore.get(s.id);
          if (!existing) await PhotoStore.put(s.id, dataURItoBlob(s.image));
          s.image = undefined;
        } catch(e) {}
      }
      for (const hs of (s.hotspots || [])) {
        if (hs.type === 'image' && typeof hs.imageUrl === 'string' && hs.imageUrl.startsWith('data:')) {
          try {
            const existing = await PhotoStore.get('hs-img-' + hs.id);
            if (!existing) await PhotoStore.put('hs-img-' + hs.id, dataURItoBlob(hs.imageUrl));
            hs.imageUrl = '';
            hs._hasImgBlob = true;
          } catch(e) {}
        }
      }
      for (const d of (s.decals || [])) {
        if (typeof d.imageUrl === 'string' && d.imageUrl.startsWith('data:')) {
          try {
            const existing = await PhotoStore.get('dcl-' + d.id);
            if (!existing) await PhotoStore.put('dcl-' + d.id, dataURItoBlob(d.imageUrl));
            d.imageUrl = '';
          } catch(e) {}
        }
      }
    }
  }

  saveData(silent = false) {
    // Sense data URIs en memòria → localStorage no es desborda
    try {
      const json = JSON.stringify(this.scenes);
      localStorage.setItem('vg-studio-scenes', json);
      localStorage.setItem('vg-tour-scenes', json);
      if (!silent) this.showToast('Guardat correctament');
      return;
    } catch(e) {}
    // Per si de cas encara quedés alguna foto gran: versió sense imatges
    try {
      const stripped = JSON.stringify(this.scenes.map(s => {
        if (typeof s.image === 'string' && s.image.startsWith('data:')) {
          const { image, ...rest } = s; return rest;
        }
        return s;
      }));
      localStorage.setItem('vg-studio-scenes', stripped);
      localStorage.setItem('vg-tour-scenes', stripped);
    } catch(e) {}
    if (!silent) this.showToast('Guardat correctament');
  }

  /* ── Folders (agrupació d'escenes al panell) ── */
  async loadFolders() {
    const saved = localStorage.getItem('vg-studio-folders');
    if (saved) {
      try { this.folders = JSON.parse(saved); return; } catch(e) {}
    }
    if (typeof sbLoadConfig === 'function') {
      try {
        const cfg = await sbLoadConfig();
        if (cfg && Array.isArray(cfg.folders)) { this.folders = cfg.folders; return; }
      } catch(e) {}
    }
    this.folders = [];
  }

  saveFoldersLocal() {
    try { localStorage.setItem('vg-studio-folders', JSON.stringify(this.folders)); } catch(e) {}
  }

  addFolder() {
    const name = (prompt('Nom de la carpeta:') || '').trim();
    if (!name) return;
    this.folders.push({ id: 'folder-' + Date.now().toString(36), name, collapsed: false });
    this.saveFoldersLocal();
    this.renderSceneList();
  }

  renameFolder(folderId) {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return;
    const name = (prompt('Nou nom de la carpeta:', folder.name) || '').trim();
    if (!name) return;
    folder.name = name;
    this.saveFoldersLocal();
    this.renderSceneList();
  }

  deleteFolder(folderId) {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return;
    if (!confirm(`Eliminar la carpeta "${folder.name}"? Les escenes no s'esborraran.`)) return;
    this.scenes.forEach(s => { if (s.folder === folderId) delete s.folder; });
    this.folders = this.folders.filter(f => f.id !== folderId);
    this.saveFoldersLocal();
    this.saveData(true);
    this.renderSceneList();
  }

  toggleFolderCollapsed(folderId) {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return;
    folder.collapsed = !folder.collapsed;
    this.saveFoldersLocal();
    this.renderSceneList();
  }

  get currentScene() { return this.scenes[this.currentIdx]; }

  /* ── Three.js setup ── */
  setupThree() {
    const container = document.getElementById('studio-viewer');
    this.threeScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov, container.clientWidth / container.clientHeight, 0.1, 1000
    );
    this.camera.position.set(0, 0, 0.01);

    const canvas = document.getElementById('studio-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const geo = new THREE.SphereGeometry(500, 64, 48);
    geo.scale(-1, 1, 1);
    this.sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x111111 }));
    this.threeScene.add(this.sphere);
  }

  /* ── Placeholder texture (same logic as tour.js) ── */
  createPlaceholder(scene) {
    if (typeof createPlaceholder === 'function') return createPlaceholder(scene);
    // Minimal fallback
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 512;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = scene.color || '#0F6E56';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 48px system-ui,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(scene.name, 512, 256);
    return new THREE.CanvasTexture(cv);
  }

  loadTexture(scene) {
    const sceneId = scene.id;
    const load = (url, revoke) => {
      new THREE.TextureLoader().load(url,
        tex => { if (this.currentScene?.id === sceneId) this.applyTex(tex); if (revoke) URL.revokeObjectURL(url); },
        undefined,
        () => { if (this.currentScene?.id === sceneId) this.applyTex(this.createPlaceholder(scene)); if (revoke) URL.revokeObjectURL(url); }
      );
    };
    // 1r: preview en memòria d'aquesta sessió
    if (this._photoUrls[sceneId]) { load(this._photoUrls[sceneId], false); return; }
    // 2n: IndexedDB (foto pujada en una sessió anterior) → 3r ruta → 4t placeholder
    PhotoStore.get(sceneId).then(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        this._photoUrls[sceneId] = url; // cau preview
        load(url, false);
        this.renderSceneList();
      } else if (scene.image) {
        load(scene.image, false);
      } else {
        this.applyTex(this.createPlaceholder(scene));
      }
    }).catch(() => {
      if (scene.image) load(scene.image, false);
      else this.applyTex(this.createPlaceholder(scene));
    });
  }

  applyTex(tex) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.sphere.material = new THREE.MeshBasicMaterial({ map: tex });
    this.sphere.material.needsUpdate = true;
  }

  /* ── Decal helpers ── */
  _lonLatToArr(lon, lat, r = 490) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const th  = THREE.MathUtils.degToRad(lon);
    return [r*Math.sin(phi)*Math.cos(th), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(th)];
  }

  _buildDecalGeo(decal) {
    const c = decal.corners;
    const tl = this._lonLatToArr(c.tl.lon, c.tl.lat);
    const tr = this._lonLatToArr(c.tr.lon, c.tr.lat);
    const br = this._lonLatToArr(c.br.lon, c.br.lat);
    const bl = this._lonLatToArr(c.bl.lon, c.bl.lat);
    const pos = new Float32Array([...tl,...bl,...tr,...tr,...bl,...br]);
    const uvs = new Float32Array([0,1,0,0,1,1,1,1,0,0,1,0]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
    return geo;
  }

  renderDecals() {
    Object.values(this._decalMeshes).forEach(m => this.threeScene.remove(m));
    this._decalMeshes = {};
    (this.currentScene.decals || []).forEach(decal => {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true, opacity: decal.opacity ?? 1,
        side: THREE.DoubleSide, depthTest: false
      });
      const mesh = new THREE.Mesh(this._buildDecalGeo(decal), mat);
      this.threeScene.add(mesh);
      this._decalMeshes[decal.id] = mesh;
      if (decal.decalType === 'text') {
        mat.map = this._createTextDecalTex(decal);
        mat.needsUpdate = true;
      } else {
        const setTex = src => new THREE.TextureLoader().load(src, tex => {
          tex.minFilter = THREE.LinearFilter; mat.map = tex; mat.needsUpdate = true;
        });
        PhotoStore.get('dcl-' + decal.id).then(blob =>
          blob ? setTex(URL.createObjectURL(blob)) : (decal.imageUrl && setTex(decal.imageUrl))
        ).catch(() => decal.imageUrl && setTex(decal.imageUrl));
      }
    });
  }

  updateDecalMesh(decal, updateTex = false) {
    const mesh = this._decalMeshes[decal.id];
    if (!mesh) return;
    const c = decal.corners;
    const tl = this._lonLatToArr(c.tl.lon, c.tl.lat);
    const tr = this._lonLatToArr(c.tr.lon, c.tr.lat);
    const br = this._lonLatToArr(c.br.lon, c.br.lat);
    const bl = this._lonLatToArr(c.bl.lon, c.bl.lat);
    const attr = mesh.geometry.getAttribute('position');
    attr.array.set([...tl,...bl,...tr,...tr,...bl,...br]);
    attr.needsUpdate = true;
    if (updateTex && decal.decalType === 'text') {
      mesh.material.map = this._createTextDecalTex(decal);
      mesh.material.needsUpdate = true;
    }
  }

  renderDecalHandles() {
    const overlay = document.getElementById('studio-decal-handles');
    if (!overlay) return;
    overlay.innerHTML = '';
    if (!this.selectedDecalId) return;
    const decal = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
    if (!decal) return;
    ['tl','tr','br','bl'].forEach(corner => {
      const handle = document.createElement('div');
      handle.className = 'dcl-handle';
      handle.dataset.corner = corner;
      handle.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        this.draggingCorner = corner;
      });
      handle.addEventListener('pointermove', e => {
        if (this.draggingCorner !== corner) return;
        const ll = this._screenToLonLat(e.clientX, e.clientY);
        const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
        if (d) { d.corners[corner] = ll; this.updateDecalMesh(d); }
      });
      handle.addEventListener('pointerup', () => {
        if (this.draggingCorner === corner) { this.draggingCorner = null; this.saveData(true); }
      });
      overlay.appendChild(handle);
    });

    // Rotation handle (a sobre del text)
    const rot = document.createElement('div');
    rot.className = 'dcl-rotate';
    rot.title = 'Arrossega per girar';
    rot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`;
    let rot0 = null;
    rot.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      rot.setPointerCapture(e.pointerId);
      const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      if (!d) return;
      const c = d.corners;
      const clon = (c.tl.lon + c.tr.lon + c.br.lon + c.bl.lon) / 4;
      const clat = (c.tl.lat + c.tr.lat + c.br.lat + c.bl.lat) / 4;
      const cosc = Math.max(0.2, Math.cos(THREE.MathUtils.degToRad(clat)));
      const pl = this._screenToLonLat(e.clientX, e.clientY);
      const a0 = Math.atan2(pl.lat - clat, (pl.lon - clon) * cosc);
      rot0 = { clon, clat, cosc, a0, startCorners: JSON.parse(JSON.stringify(c)) };
      this._rotatingDecal = true;
    });
    rot.addEventListener('pointermove', e => {
      if (!this._rotatingDecal || !rot0) return;
      const pl = this._screenToLonLat(e.clientX, e.clientY);
      const a = Math.atan2(pl.lat - rot0.clat, (pl.lon - rot0.clon) * rot0.cosc);
      const delta = a - rot0.a0;
      const cos = Math.cos(delta), sin = Math.sin(delta);
      const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      if (!d) return;
      ['tl','tr','br','bl'].forEach(k => {
        const sx = (rot0.startCorners[k].lon - rot0.clon) * rot0.cosc;
        const sy = (rot0.startCorners[k].lat - rot0.clat);
        const xr = sx * cos - sy * sin;
        const yr = sx * sin + sy * cos;
        d.corners[k] = {
          lon: rot0.clon + xr / rot0.cosc,
          lat: Math.max(-85, Math.min(85, rot0.clat + yr))
        };
      });
      this.updateDecalMesh(d);
    });
    rot.addEventListener('pointerup', () => {
      if (this._rotatingDecal) { this._rotatingDecal = false; this.saveData(true); }
    });
    overlay.appendChild(rot);
  }

  /* Mou tot el decal traslladant les 4 cantonades segons el desplaçament del cursor */
  _moveDecalBy(startLL, curLL, startCorners) {
    let dLon = curLL.lon - startLL.lon;
    if (dLon > 180) dLon -= 360; else if (dLon < -180) dLon += 360;
    const dLat = curLL.lat - startLL.lat;
    const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
    if (!d) return;
    ['tl','tr','br','bl'].forEach(k => {
      d.corners[k] = {
        lon: startCorners[k].lon + dLon,
        lat: Math.max(-85, Math.min(85, startCorners[k].lat + dLat))
      };
    });
    this.updateDecalMesh(d);
  }

  /* Raycast del punt de pantalla contra els decals; retorna l'id del més proper o null */
  _decalAtScreen(clientX, clientY) {
    const meshes = Object.values(this._decalMeshes);
    if (!meshes.length) return null;
    const container = document.getElementById('studio-viewer');
    const rect = container.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    if (!this._raycaster) this._raycaster = new THREE.Raycaster();
    this._raycaster.setFromCamera(ndc, this.camera);
    const hits = this._raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    const hitMesh = hits[0].object;
    return Object.keys(this._decalMeshes).find(id => this._decalMeshes[id] === hitMesh) || null;
  }

  updateDecalHandlePositions() {
    const overlay = document.getElementById('studio-decal-handles');
    if (!overlay || !this.selectedDecalId) return;
    const decal = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
    if (!decal) return;
    const container = document.getElementById('studio-viewer');
    const W = container.clientWidth, H = container.clientHeight;
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    const project = (lon, lat) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const th  = THREE.MathUtils.degToRad(lon);
      const dir = new THREE.Vector3(Math.sin(phi)*Math.cos(th), Math.cos(phi), Math.sin(phi)*Math.sin(th));
      if (camDir.dot(dir) < 0.05) return null;
      const pos = dir.clone().multiplyScalar(490);
      pos.project(this.camera);
      return { x: (pos.x+1)/2*W, y: -(pos.y-1)/2*H };
    };
    overlay.querySelectorAll('.dcl-handle').forEach(handle => {
      const c = decal.corners[handle.dataset.corner];
      if (!c) return;
      const p = project(c.lon, c.lat);
      if (!p) { handle.style.display = 'none'; return; }
      handle.style.display = 'block';
      handle.style.left = `${p.x}px`;
      handle.style.top  = `${p.y}px`;
    });
    // Rotation handle above the decal's top edge
    const rotEl = overlay.querySelector('.dcl-rotate');
    if (rotEl) {
      const c = decal.corners;
      const clon = (c.tl.lon + c.tr.lon + c.br.lon + c.bl.lon) / 4;
      const clat = (c.tl.lat + c.tr.lat + c.br.lat + c.bl.lat) / 4;
      const tmLon = (c.tl.lon + c.tr.lon) / 2, tmLat = (c.tl.lat + c.tr.lat) / 2;
      const p = project(tmLon + (tmLon - clon) * 0.5, tmLat + (tmLat - clat) * 0.5);
      if (!p) { rotEl.style.display = 'none'; }
      else { rotEl.style.display = 'flex'; rotEl.style.left = `${p.x}px`; rotEl.style.top = `${p.y}px`; }
    }
  }

  _screenToLonLat(clientX, clientY) {
    const container = document.getElementById('studio-viewer');
    const rect = container.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width)  * 2 - 1;
    const ndcY = -((clientY - rect.top)  / rect.height) * 2 + 1;
    const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();
    const lat = Math.round(THREE.MathUtils.radToDeg(Math.asin(Math.max(-1,Math.min(1,vec.y)))) * 10) / 10;
    const lon = Math.round(THREE.MathUtils.radToDeg(Math.atan2(vec.z, vec.x)) * 10) / 10;
    return { lon, lat };
  }

  renderDecalMiniList() {
    const list = document.getElementById('decal-mini-list');
    if (!list) return;
    list.innerHTML = '';
    (this.currentScene.decals || []).forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'hs-mini-item' + (this.selectedDecalId === d.id ? ' selected' : '');
      const isText = d.decalType === 'text';
      item.innerHTML = `
        <span class="hs-mini-dot" style="background:#f59e0b;font-size:8px;font-weight:800;color:#000;display:flex;align-items:center;justify-content:center">${isText ? 'T' : ''}</span>
        <span class="hs-mini-name">${isText ? (d.content || 'Text') : `Imatge ${i+1}`}</span>
        <span class="hs-mini-type">${isText ? 'text' : 'imatge'}</span>`;
      item.addEventListener('click', () => this.selectDecal(d.id));
      list.appendChild(item);
    });
  }

  selectDecal(id) {
    this._destroyNavTargetViewer();
    this.selectedDecalId = id;
    this.selectedHsId = null;
    document.getElementById('scene-props-section').classList.add('hidden');
    document.getElementById('hs-props-section').classList.add('hidden');
    document.getElementById('decal-props-section').classList.remove('hidden');
    const decal = (this.currentScene.decals || []).find(d => d.id === id);
    if (!decal) return;

    // Show type-specific area
    const isText = decal.decalType === 'text';
    document.getElementById('decal-img-area').classList.toggle('hidden', isText);
    document.getElementById('decal-text-area').classList.toggle('hidden', !isText);

    // Populate text fields
    if (isText) {
      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? el.value; };
      const setBool = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
      setEl('decal-content', decal.content || '');
      setEl('decal-fontsize', decal.fontSize || 80);
      document.getElementById('dcl-fs-val').textContent = (decal.fontSize || 80) + 'px';
      setEl('decal-color', decal.color || '#ffffff');
      setEl('decal-bg-color', decal.bgColor || '#000000');
      setEl('decal-bg-opacity', decal.bgOpacity ?? 0);
      document.getElementById('dcl-bg-val').textContent = (decal.bgOpacity ?? 0) + '%';
      setBool('decal-bold', decal.bold);
      setBool('decal-italic', decal.italic);
    }

    const op = Math.round((decal.opacity ?? 1) * 100);
    const opEl = document.getElementById('decal-opacity');
    const opVEl = document.getElementById('decal-opacity-val');
    if (opEl) opEl.value = op;
    if (opVEl) opVEl.textContent = op + '%';
    this.renderDecalHandles();
    this.renderDecalMiniList();
  }

  async addDecal(file, center) {
    if (!file) return;
    // Place at the drop point (or current camera look direction)
    center = center || { lon: this.lon, lat: this.lat };
    const W = 10, H = 7;
    const id = 'dcl-' + Date.now().toString(36);
    const decal = {
      id,
      corners: {
        tl: { lon: center.lon - W, lat: center.lat + H },
        tr: { lon: center.lon + W, lat: center.lat + H },
        br: { lon: center.lon + W, lat: center.lat - H },
        bl: { lon: center.lon - W, lat: center.lat - H }
      },
      opacity: 1.0,
      imageUrl: ''
    };
    if (!this.currentScene.decals) this.currentScene.decals = [];
    this.currentScene.decals.push(decal);
    await PhotoStore.put('dcl-' + id, file).catch(() => {});
    this.renderDecals();
    this.renderDecalMiniList();
    this.selectDecal(id);
    this.saveData(true);
    this.showToast('Imatge afegida — arrossega les cantonades grogues per ajustar');
  }

  /* Arrossega un botó del panell flotant i deixa'l anar sobre la foto per
     col·locar-lo. Un clic simple (sense arrossegar) executa onClick.
       btnId  – id del botó
       label  – text del "ghost" que segueix el cursor
       onPlace(lonLat) – col·locació al punt on es deixa anar
       onClick()       – acció del clic simple */
  _setupDragPlace(btnId, label, onPlace, onClick) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const viewer = document.getElementById('studio-viewer');
    let dragging = false, moved = false, ghost = null;

    const onMove = (e) => {
      if (!dragging) return;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 0) moved = true;
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (ghost) { ghost.remove(); ghost = null; }
      const r = viewer.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (moved && inside) onPlace(this._screenToLonLat(e.clientX, e.clientY));
      else if (!moved) onClick();
      // arrossegat però deixat fora del visor → cancel·lat
    };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true; moved = false;
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = label;
      ghost.style.left = e.clientX + 'px';
      ghost.style.top  = e.clientY + 'px';
      document.body.appendChild(ghost);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }

  addTextDecal(center) {
    center = center || { lon: this.lon, lat: this.lat };
    const W = 20, H = 10;
    const id = 'dcl-' + Date.now().toString(36);
    const decal = {
      id,
      decalType: 'text',
      content: 'Text',
      fontSize: 80,
      color: '#ffffff',
      bgColor: '#000000',
      bgOpacity: 0,
      bold: false,
      italic: false,
      corners: {
        tl: { lon: center.lon - W, lat: center.lat + H },
        tr: { lon: center.lon + W, lat: center.lat + H },
        br: { lon: center.lon + W, lat: center.lat - H },
        bl: { lon: center.lon - W, lat: center.lat - H }
      },
      opacity: 1.0
    };
    if (!this.currentScene.decals) this.currentScene.decals = [];
    this.currentScene.decals.push(decal);
    this.renderDecals();
    this.renderDecalMiniList();
    this.selectDecal(id);
    this.saveData(true);
    this.showToast('Text afegit — arrossega el text per moure\'l o les cantonades per redimensionar');
  }

  _createTextDecalTex(decal) {
    const W = 1024, H = 512;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    if ((decal.bgOpacity || 0) > 0) {
      const hex = decal.bgColor || '#000000';
      const rr = parseInt(hex.slice(1,3),16), gg = parseInt(hex.slice(3,5),16), bb = parseInt(hex.slice(5,7),16);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${decal.bgOpacity/100})`;
      ctx.fillRect(0, 0, W, H);
    }
    const fs = Math.max(20, Math.min(400, decal.fontSize || 80));
    ctx.font = `${decal.italic?'italic ':''}${decal.bold?'bold ':''}${fs}px system-ui,sans-serif`;
    ctx.fillStyle = decal.color || '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (decal.shadow !== false) {
      ctx.shadowColor = 'rgba(0,0,0,.7)';
      ctx.shadowBlur = decal.shadowBlur != null ? decal.shadowBlur : 10;
      ctx.shadowOffsetY = 2;
    }
    // Suport multi-línia (respecta els salts de línia)
    const lines = String(decal.content || '').split('\n');
    const lineH = fs * 1.2;
    const startY = H/2 - (lines.length - 1) * lineH / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, W/2, startY + i * lineH));
    return new THREE.CanvasTexture(cv);
  }

  deleteSelectedDecal() {
    if (!this.selectedDecalId) return;
    const mesh = this._decalMeshes[this.selectedDecalId];
    if (mesh) { this.threeScene.remove(mesh); delete this._decalMeshes[this.selectedDecalId]; }
    PhotoStore.delete('dcl-' + this.selectedDecalId).catch(() => {});
    this.currentScene.decals = (this.currentScene.decals || []).filter(d => d.id !== this.selectedDecalId);
    this.selectedDecalId = null;
    const overlay = document.getElementById('studio-decal-handles');
    if (overlay) overlay.innerHTML = '';
    this.renderDecalMiniList();
    this.renderPropsPanel();
    this.saveData();
    this.showToast('Imatge eliminada');
  }

  /* ── Switch scene ── */
  switchScene(idx, animate = true) {
    this.currentIdx = idx;
    const s = this.currentScene;
    this.selectedHsId = null;
    this.selectedDecalId = null;

    // Reset camera
    this.lon = 0; this.lat = 0; this.velLon = 0; this.velLat = 0;

    this.loadTexture(s);
    this.renderHotspots();
    this.renderDecals();
    this.renderSceneList();
    this.renderPropsPanel();
    this.renderDecalMiniList();
    const dh = document.getElementById('studio-decal-handles');
    if (dh) dh.innerHTML = '';

    document.getElementById('status-scene').textContent = s.name;
    document.getElementById('status-hs-count').textContent =
      `${s.hotspots.length} hotspot${s.hotspots.length !== 1 ? 's' : ''}`;
  }

  /* ── Miniatures de les escenes (foto real, si n'hi ha) ── */
  _getThumbUrl(s) {
    if (this._photoUrls[s.id]) return this._photoUrls[s.id];
    if (typeof s.image === 'string' && /^https?:\/\//.test(s.image)) return s.image;
    return null;
  }

  _ensureThumb(s) {
    if (this._photoUrls[s.id] || this._thumbChecked.has(s.id)) return;
    this._thumbChecked.add(s.id);
    PhotoStore.get(s.id).then(blob => {
      if (blob) {
        this._photoUrls[s.id] = URL.createObjectURL(blob);
        this.renderSceneList();
      }
    }).catch(() => {});
  }

  /* Agrupa this.scenes (ordre pla) en blocs d'escena / carpeta per pintar el panell */
  _buildSceneBlocks() {
    const blocks = [];
    const folderBlocks = {};
    this.scenes.forEach(s => {
      const folder = s.folder && this.folders.find(f => f.id === s.folder);
      if (folder) {
        let blk = folderBlocks[folder.id];
        if (!blk) {
          blk = { type: 'folder', folder, scenes: [] };
          folderBlocks[folder.id] = blk;
          blocks.push(blk);
        }
        blk.scenes.push(s);
      } else {
        blocks.push({ type: 'scene', scene: s });
      }
    });
    // Carpetes buides (creades però sense escenes encara) es mostren al final
    this.folders.forEach(f => {
      if (!folderBlocks[f.id]) blocks.push({ type: 'folder', folder: f, scenes: [] });
    });
    return blocks;
  }

  /* Torna a l'ordre pla (this.scenes) a partir dels blocs, després de reordenar */
  _flattenBlocks(blocks) {
    const out = [];
    blocks.forEach(b => { if (b.type === 'scene') out.push(b.scene); else out.push(...b.scenes); });
    return out;
  }

  /* ── Render scene list (left sidebar) ── */
  renderSceneList() {
    const list = document.getElementById('scenes-list');
    list.innerHTML = '';
    const blocks = this._buildSceneBlocks();

    blocks.forEach(block => {
      if (block.type === 'folder') {
        list.appendChild(this._renderFolderHeader(block));
        if (!block.folder.collapsed) {
          block.scenes.forEach(s => list.appendChild(this._renderSceneItem(s, true)));
        }
      } else {
        list.appendChild(this._renderSceneItem(block.scene, false));
      }
    });

    this._wireSceneDnD(list);
  }

  _renderSceneItem(s, inFolder) {
    const i = this.scenes.indexOf(s);
    const item = document.createElement('div');
    const isHidden = s.visible === false;
    item.className = 'scene-item' + (i === this.currentIdx ? ' active' : '') + (isHidden ? ' scene-hidden' : '') + (inFolder ? ' in-folder' : '');
    item.draggable = true;
    item.dataset.sceneId = s.id;

    const eyeOpen = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeClosed = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    const thumbUrl = this._getThumbUrl(s);
    if (!thumbUrl) this._ensureThumb(s);
    const thumbStyle = thumbUrl
      ? `background-image:url('${thumbUrl.replace(/'/g, '%27')}');background-color:${s.color}`
      : `background:${s.color}`;

    item.innerHTML = `
      <div class="scene-thumb-row">
        <div class="scene-color-dot" style="${thumbStyle}"></div>
        <button class="scene-eye-btn" title="${isHidden ? 'Mostrar al tour' : 'Ocultar del tour'}">${isHidden ? eyeClosed : eyeOpen}</button>
      </div>
      <div class="scene-item-name">${s.name}</div>
      <div class="scene-item-count">${s.hotspots.length} hotspot${s.hotspots.length !== 1 ? 's' : ''}</div>
    `;

    const eyeBtn = item.querySelector('.scene-eye-btn');
    eyeBtn.addEventListener('click', e => {
      e.stopPropagation();
      s.visible = (s.visible !== false) ? false : true;
      this.renderSceneList();
      this.saveData(true);
    });
    item.addEventListener('click', () => this.switchScene(this.scenes.indexOf(s)));
    return item;
  }

  _renderFolderHeader(block) {
    const folder = block.folder;
    const header = document.createElement('div');
    header.className = 'scene-folder-header' + (folder.collapsed ? ' collapsed' : '');
    header.draggable = true;
    header.dataset.folderId = folder.id;

    const chevron = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 6 15 12 9 18"/></svg>`;
    const folderIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`;

    header.innerHTML = `
      <button class="folder-chevron-btn" title="Plegar/desplegar">${chevron}</button>
      <span class="folder-icon">${folderIcon}</span>
      <span class="folder-name" title="${folder.name}">${folder.name}</span>
      <span class="folder-count">${block.scenes.length}</span>
      <button class="folder-del-btn" title="Eliminar carpeta">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    header.addEventListener('click', () => this.toggleFolderCollapsed(folder.id));
    header.querySelector('.folder-name').addEventListener('dblclick', e => {
      e.stopPropagation();
      this.renameFolder(folder.id);
    });
    header.querySelector('.folder-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      this.deleteFolder(folder.id);
    });
    return header;
  }

  /* ── Reordenar/agrupar escenes arrossegant-les a la llista ── */
  _wireSceneDnD(list) {
    let dragType = null; // 'scene' | 'folder'
    let dragId = null;
    let overEl = null;
    let overMode = null; // 'before' | 'after' | 'inside'

    const clearIndicators = () => {
      list.querySelectorAll('.drop-before,.drop-after,.drop-inside').forEach(el =>
        el.classList.remove('drop-before', 'drop-after', 'drop-inside'));
    };

    list.querySelectorAll('.scene-item,.scene-folder-header').forEach(el => {
      el.addEventListener('dragstart', e => {
        dragType = el.classList.contains('scene-folder-header') ? 'folder' : 'scene';
        dragId = dragType === 'folder' ? el.dataset.folderId : el.dataset.sceneId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragId);
        requestAnimationFrame(() => el.classList.add('dragging'));
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        clearIndicators();
        dragType = null; dragId = null; overEl = null; overMode = null;
      });
      el.addEventListener('dragover', e => {
        if (!dragType) return;
        e.preventDefault();
        const isFolder = el.classList.contains('scene-folder-header');
        const rect = el.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        let mode;
        if (isFolder && dragType === 'scene' && offsetY > rect.height * 0.25 && offsetY < rect.height * 0.75) {
          mode = 'inside';
        } else {
          mode = offsetY < rect.height / 2 ? 'before' : 'after';
        }
        clearIndicators();
        overEl = el; overMode = mode;
        el.classList.add(mode === 'inside' ? 'drop-inside' : (mode === 'before' ? 'drop-before' : 'drop-after'));
      });
      el.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragType || !overEl) return;
        this._handleSceneDrop(dragType, dragId, overEl, overMode);
        clearIndicators();
      });
    });

    // Deixar anar en un espai buit de la llista → mou al final, arrel
    list.addEventListener('dragover', e => { if (dragType) e.preventDefault(); });
    list.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragType || overEl) return;
      this._handleSceneDrop(dragType, dragId, null, 'end');
      clearIndicators();
    });
  }

  _handleSceneDrop(dragType, dragId, targetEl, mode) {
    const blocks = this._buildSceneBlocks();
    let draggedScene = null, draggedFolderBlock = null;

    if (dragType === 'scene') {
      for (const b of blocks) {
        if (b.type === 'scene' && b.scene.id === dragId) { draggedScene = b.scene; blocks.splice(blocks.indexOf(b), 1); break; }
        if (b.type === 'folder') {
          const idx = b.scenes.findIndex(s => s.id === dragId);
          if (idx !== -1) { draggedScene = b.scenes[idx]; b.scenes.splice(idx, 1); break; }
        }
      }
      if (!draggedScene) return;
    } else {
      const idx = blocks.findIndex(b => b.type === 'folder' && b.folder.id === dragId);
      if (idx === -1) return;
      draggedFolderBlock = blocks.splice(idx, 1)[0];
    }

    if (dragType === 'scene') {
      if (targetEl && mode === 'inside') {
        const folderId = targetEl.dataset.folderId;
        const dest = blocks.find(b => b.type === 'folder' && b.folder.id === folderId);
        if (dest) { draggedScene.folder = folderId; dest.scenes.push(draggedScene); }
        else { delete draggedScene.folder; blocks.push({ type: 'scene', scene: draggedScene }); }
      } else if (targetEl && targetEl.classList.contains('in-folder')) {
        // Deixar anar abans/després d'una escena dins d'una carpeta → reordena dins la carpeta
        const targetId = targetEl.dataset.sceneId;
        const dest = blocks.find(b => b.type === 'folder' && b.scenes.some(s => s.id === targetId));
        if (dest) {
          const idx = dest.scenes.findIndex(s => s.id === targetId);
          draggedScene.folder = dest.folder.id;
          dest.scenes.splice(mode === 'before' ? idx : idx + 1, 0, draggedScene);
        } else {
          delete draggedScene.folder;
          blocks.push({ type: 'scene', scene: draggedScene });
        }
      } else {
        delete draggedScene.folder;
        let insertAt = blocks.length;
        if (targetEl) {
          const isFolder = targetEl.classList.contains('scene-folder-header');
          const key = isFolder ? targetEl.dataset.folderId : targetEl.dataset.sceneId;
          const idx = blocks.findIndex(b => isFolder
            ? (b.type === 'folder' && b.folder.id === key)
            : (b.type === 'scene' && b.scene.id === key));
          if (idx !== -1) insertAt = mode === 'before' ? idx : idx + 1;
        }
        blocks.splice(insertAt, 0, { type: 'scene', scene: draggedScene });
      }
    } else {
      let insertAt = blocks.length;
      if (targetEl) {
        const isFolder = targetEl.classList.contains('scene-folder-header');
        const key = isFolder ? targetEl.dataset.folderId : targetEl.dataset.sceneId;
        let idx;
        if (isFolder) idx = blocks.findIndex(b => b.type === 'folder' && b.folder.id === key);
        else idx = blocks.findIndex(b => (b.type === 'scene' && b.scene.id === key) || (b.type === 'folder' && b.scenes.some(s => s.id === key)));
        if (idx !== -1) insertAt = mode === 'after' ? idx + 1 : idx;
      }
      blocks.splice(insertAt, 0, draggedFolderBlock);
    }

    const activeScene = this.scenes[this.currentIdx];
    this.scenes = this._flattenBlocks(blocks);
    if (activeScene) {
      const newIdx = this.scenes.indexOf(activeScene);
      if (newIdx !== -1) this.currentIdx = newIdx;
    }
    this.saveData(true);
    this.renderSceneList();
  }

  /* ── Render hotspots on viewer ── */
  renderHotspots() {
    const overlay = document.getElementById('studio-hotspots');
    overlay.innerHTML = '';
    (this.currentScene.hotspots || []).forEach(hs => {
      const el = document.createElement('div');
      const selected = this.selectedHsId === hs.id;
      el.className = `s-hotspot s-hs-${hs.type}${selected ? ' selected' : ''}`;
      el.dataset.lon = hs.lon;
      el.dataset.lat = hs.lat;
      el.dataset.id  = hs.id;

      if (hs.type === 'nav') {
        const chev = `<svg viewBox="0 0 62 24" fill="none"><polyline points="3,20 31,4 59,20" stroke="white" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const lbl = hs.title ? `<div class="s-hotspot-lbl">${hs.title}</div>` : '';
        el.innerHTML = `
          <div class="sv-arrow-wrap">
            <div class="sv-chevron sv-c1">${chev}</div>
            <div class="sv-chevron sv-c2">${chev}</div>
            <div class="sv-chevron sv-c3">${chev}</div>
          </div>${lbl}`;
      } else if (hs.type === 'text') {
        const st = hs.style || {};
        const fs = Math.min(st.fontSize || 22, 18);
        const RADIUS = { pill:'999px', card:'6px', sharp:'0px', none:'0px' };
        const br = RADIUS[st.bgShape || 'card'] || '6px';
        const bg = st.bgShape === 'none' ? 'transparent' : (st.background || 'rgba(0,0,0,0.45)');
        const border = st.bgShape === 'none' ? 'border:none;' : '';
        const rot = st.rotation ? `transform:rotate(${st.rotation}deg);` : '';
        el.innerHTML = `<div class="s-text-preview"
          style="font-size:${fs}px;color:${st.color||'#fff'};background:${bg};font-weight:${st.bold?700:400};font-style:${st.italic?'italic':'normal'};border-radius:${br};${border}${rot}"
          >${hs.content || '(text)'}</div>`;
      } else {
        const iconSvg = (hs.icon && typeof HS_ICON_LIBRARY !== 'undefined' && HS_ICON_LIBRARY[hs.icon])
          || STUDIO_HS_ICONS[hs.type] || STUDIO_HS_ICONS.info;
        const lbl = hs.title ? `<div class="s-hotspot-lbl">${hs.title}</div>` : '';
        el.innerHTML = `<div class="s-hotspot-inner">${iconSvg}</div>${lbl}`;
      }

      // Drag-to-move + click-to-select
      let dragOrigin = null;
      let wasDragged = false;

      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);
        dragOrigin = { x: e.clientX, y: e.clientY };
        wasDragged = false;
        // Prevent canvas pan while dragging a hotspot
        this.pointerDown = false;
      });

      el.addEventListener('pointermove', e => {
        if (!dragOrigin) return;
        if (!wasDragged && Math.hypot(e.clientX - dragOrigin.x, e.clientY - dragOrigin.y) > 5) {
          wasDragged = true;
          el.classList.add('dragging');
        }
        if (!wasDragged) return;
        const ll = this._screenToLonLat(e.clientX, e.clientY);
        hs.lon = ll.lon;
        hs.lat = ll.lat;
        el.dataset.lon = hs.lon;
        el.dataset.lat = hs.lat;
        // Live-update coords in right panel if this hotspot is selected
        if (this.selectedHsId === hs.id) {
          const lonEl = document.getElementById('hs-lon-val');
          const latEl = document.getElementById('hs-lat-val');
          if (lonEl) lonEl.textContent = hs.lon.toFixed(1);
          if (latEl) latEl.textContent = hs.lat.toFixed(1);
        }
      });

      el.addEventListener('pointerup', e => {
        if (!dragOrigin) return;
        el.classList.remove('dragging');
        dragOrigin = null;
        if (wasDragged) {
          this.saveData(true);
        } else {
          this.selectHotspot(hs.id);
        }
        wasDragged = false;
      });

      el.addEventListener('pointercancel', () => {
        el.classList.remove('dragging');
        dragOrigin = null; wasDragged = false;
      });

      overlay.appendChild(el);
    });
  }

  updateHotspotPositions() {
    const container = document.getElementById('studio-viewer');
    const W = container.clientWidth, H = container.clientHeight;
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);

    document.querySelectorAll('.s-hotspot').forEach(el => {
      const lon = parseFloat(el.dataset.lon);
      const lat = parseFloat(el.dataset.lat);
      const phi   = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const dir = new THREE.Vector3(
        Math.sin(phi)*Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi)*Math.sin(theta)
      );
      const dot = camDir.dot(dir);
      if (dot < 0.1) { el.style.display = 'none'; return; }

      const pos = dir.clone().multiplyScalar(500);
      pos.project(this.camera);
      el.style.display  = 'block';
      el.style.left     = `${(pos.x+1)/2*W}px`;
      el.style.top      = `${-(pos.y-1)/2*H}px`;
      el.style.opacity  = Math.min(1, (dot-.1)/.2);
    });
  }

  /* ── Props panel ── */
  renderPropsPanel() {
    this._destroyNavTargetViewer();
    const s = this.currentScene;

    // Scene fields
    document.getElementById('prop-name').value = s.name || '';
    document.getElementById('prop-color').value = s.color || '#0F6E56';
    document.getElementById('prop-color-val').textContent = s.color || '#0F6E56';
    const imgIsEmbedded = typeof s.image === 'string' && s.image.startsWith('data:');
    // No aboquem el data URI (enorme) al camp de ruta
    document.getElementById('prop-image-path').value = imgIsEmbedded ? '' : (s.image || '');

    document.getElementById('photo-name').textContent =
      this._photoUrls[s.id]
        ? (s._photoFilename || 'Foto carregada')
        : imgIsEmbedded
          ? 'Foto incrustada ✓'
          : (s.image ? `Ruta: ${s.image}` : 'Arrossega o clica per seleccionar');

    document.getElementById('prop-default-lon').value = s.defaultLon != null ? s.defaultLon : '';
    document.getElementById('prop-default-lat').value = s.defaultLat != null ? s.defaultLat : '';
    document.getElementById('prop-min-fov').value = s.minFov != null ? s.minFov : 30;
    document.getElementById('prop-max-fov').value = s.maxFov != null ? s.maxFov : 100;

    // Transition picker
    const activeTrans = localStorage.getItem('vg-transition-style') || 'fade';
    document.querySelectorAll('#trans-picker .trans-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.trans === activeTrans);
    });

    // Hotspot mini list
    this.renderHsMiniList();
    this.renderDecalMiniList();

    document.getElementById('scene-props-section').classList.remove('hidden');
    document.getElementById('hs-props-section').classList.add('hidden');
    document.getElementById('decal-props-section').classList.add('hidden');
  }

  renderHsMiniList() {
    const s = this.currentScene;
    const list = document.getElementById('hs-mini-list');
    list.innerHTML = '';
    document.getElementById('hs-count-badge').textContent = s.hotspots.length;

    const DOT_COLORS = {
      info: '#0F6E56', video: '#1d4ed8', image: '#7c3aed', link: '#c2410c', nav: '#6b7280', text: '#d97706'
    };
    s.hotspots.forEach(hs => {
      const item = document.createElement('div');
      item.className = 'hs-mini-item' + (this.selectedHsId === hs.id ? ' selected' : '');
      item.innerHTML = `
        <span class="hs-mini-dot" style="background:${DOT_COLORS[hs.type] || '#666'}"></span>
        <span class="hs-mini-name">${hs.title || '(sense títol)'}</span>
        <span class="hs-mini-type">${hs.type}</span>
      `;
      item.addEventListener('click', () => this.selectHotspot(hs.id));
      list.appendChild(item);
    });
  }

  /* ── Select / edit hotspot ── */
  selectHotspot(id) {
    this.selectedHsId = id;
    const hs = this.currentScene.hotspots.find(h => h.id === id);
    if (!hs) return;

    this.renderHotspots(); // re-render to highlight selected

    // Show hotspot panel
    document.getElementById('scene-props-section').classList.add('hidden');
    document.getElementById('hs-props-section').classList.remove('hidden');
    document.getElementById('hs-props-title').textContent = hs.title || 'Hotspot';

    // Type pills
    document.querySelectorAll('.type-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.type === hs.type);
    });

    // Title + show-label toggle
    document.getElementById('hs-title').value = hs.title || '';
    const slField = document.getElementById('hs-showlabel-field');
    const slBox = document.getElementById('hs-showLabel');
    if (slBox) slBox.checked = !!hs.showLabel;
    // El "mostrar nom" no té sentit per a text (sempre visible)
    if (slField) slField.style.display = (hs.type === 'text') ? 'none' : '';

    // Atura qualsevol mini-visor previ
    this._destroyNavTargetViewer();

    // Dynamic fields
    document.getElementById('hs-dynamic-fields').innerHTML =
      dynamicFields(hs.type, hs, this.scenes, this.currentScene.id);

    // Nav: transició, vista d'arribada (mini-visor) i botó d'editar el destí
    if (hs.type === 'nav') {
      const goBtn = document.getElementById('btn-go-target-scene');
      if (goBtn) {
        goBtn.addEventListener('click', () => {
          const sel = document.getElementById('hs-targetScene');
          const targetId = sel ? sel.value : hs.targetScene;
          const idx = this.scenes.findIndex(s => s.id === targetId);
          if (idx >= 0) this.switchScene(idx);
        });
      }
      const transSel = document.getElementById('hs-transition');
      if (transSel) transSel.addEventListener('change', () => {
        const cur = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (cur) { cur.transition = transSel.value; this.saveData(true); }
      });
      const tgtSel = document.getElementById('hs-targetScene');
      if (tgtSel) tgtSel.addEventListener('change', () => {
        const cur = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (cur) {
          cur.targetScene = tgtSel.value;
          cur.targetView = null;   // en canviar de destí, es reinicia la vista d'arribada
          const badge = document.getElementById('nav-target-badge');
          if (badge) badge.style.display = 'none';
          this.saveData(true);
          this._initNavTargetViewer(cur);
        }
      });
      const clearBtn = document.getElementById('btn-clear-target-view');
      if (clearBtn) clearBtn.addEventListener('click', () => {
        const cur = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (cur) {
          cur.targetView = null;
          const badge = document.getElementById('nav-target-badge');
          if (badge) badge.style.display = 'none';
          this.saveData(true);
          this._initNavTargetViewer(cur);
        }
      });
      this._initNavTargetViewer(hs);
    }

    // Position
    document.getElementById('hs-lon-val').textContent = hs.lon.toFixed(1);
    document.getElementById('hs-lat-val').textContent = hs.lat.toFixed(1);

    // Highlight in mini list
    this.renderHsMiniList();
  }

  /* Mini-visor 360 de l'escena de destí per triar la vista d'arribada */
  _destroyNavTargetViewer() {
    if (this._navViewerRAF) { cancelAnimationFrame(this._navViewerRAF); this._navViewerRAF = null; }
    if (this._navViewer) {
      try {
        if (this._navViewer.mat.map) this._navViewer.mat.map.dispose();
        this._navViewer.geo.dispose();
        this._navViewer.mat.dispose();
        this._navViewer.renderer.dispose();
        this._navViewer.renderer.forceContextLoss();
      } catch (e) {}
      this._navViewer = null;
    }
  }

  _initNavTargetViewer(hs) {
    this._destroyNavTargetViewer();
    const canvas = document.getElementById('nav-target-canvas');
    if (!canvas) return;
    const targetId = document.getElementById('hs-targetScene')?.value || hs.targetScene;
    const scene = this.scenes.find(s => s.id === targetId);
    if (!scene) return;

    const w = canvas.clientWidth || 226, h = canvas.clientHeight || 130;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const cam = new THREE.PerspectiveCamera(72, w / h, 1, 1100);
    cam.position.set(0, 0, 0);
    const sc = new THREE.Scene();
    const geo = new THREE.SphereGeometry(500, 48, 32); geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x2a2a2e });
    sc.add(new THREE.Mesh(geo, mat));

    const tv = hs.targetView;
    let lon = (tv && tv.lon != null) ? tv.lon : (scene.defaultLon != null ? scene.defaultLon : 0);
    let lat = (tv && tv.lat != null) ? tv.lat : (scene.defaultLat != null ? scene.defaultLat : 0);

    // Textura de l'escena de destí (mateixa resolució que el tour)
    const applyTex = (tex) => {
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true;
    };
    const loadUrl = (url, revoke) => new THREE.TextureLoader().load(url,
      t => { applyTex(t); if (revoke) URL.revokeObjectURL(url); }, undefined, () => {});
    PhotoStore.get(scene.id).then(blob => {
      if (blob) loadUrl(URL.createObjectURL(blob), true);
      else if (scene.image) loadUrl(scene.image, false);
    }).catch(() => { if (scene.image) loadUrl(scene.image, false); });

    // Arrossegar per mirar al voltant → desa la vista al hotspot
    let down = false, sx = 0, sy = 0, slon = 0, slat = 0;
    canvas.addEventListener('pointerdown', e => {
      down = true; sx = e.clientX; sy = e.clientY; slon = lon; slat = lat;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
    });
    canvas.addEventListener('pointermove', e => {
      if (!down) return;
      lon = slon - (e.clientX - sx) * 0.25;
      lat = Math.max(-85, Math.min(85, slat + (e.clientY - sy) * 0.25));
      const cur = this.currentScene.hotspots.find(hh => hh.id === this.selectedHsId);
      if (cur) cur.targetView = { lon: Math.round(lon * 10) / 10, lat: Math.round(lat * 10) / 10 };
      const badge = document.getElementById('nav-target-badge');
      if (badge) badge.style.display = '';
    });
    const endDrag = () => { if (down) { down = false; this.saveData(true); } };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointerleave', endDrag);

    const render = () => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const th  = THREE.MathUtils.degToRad(lon);
      cam.lookAt(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
      renderer.render(sc, cam);
      this._navViewerRAF = requestAnimationFrame(render);
    };
    render();
    this._navViewer = { renderer, geo, mat };
  }

  getHsFormData(type) {
    const data = { type, title: readField('hs-title') };
    // Mostrar el nom sempre (no aplica al text, que ja és sempre visible)
    if (type !== 'text') data.showLabel = !!document.getElementById('hs-showLabel')?.checked;
    if (type === 'info') {
      data.content = readField('hs-content');
    }
    if (type === 'video') {
      const existing = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
      const localActive = document.querySelector('.vsrc-tab.active[data-src="local"]');
      if (localActive) {
        const manualPath = readField('hs-videoLocal').trim();
        // Prioritat: ruta manual escrita > vídeo pujat al núvol (guardat a l'objecte)
        data.videoUrl = manualPath || (existing?.videoUrl || '');
        data.videoLocal = '';
        data._videoUploaded = !manualPath && !!existing?._videoUploaded;
      } else {
        data.videoUrl = readField('hs-videoUrl').trim();
        data.videoLocal = '';
        data._videoUploaded = false;
      }
      data.caption = readField('hs-caption');
    }
    if (type === 'image') {
      const existing = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
      const urlVal = readField('hs-imageUrl');
      data.imageUrl = urlVal || (existing?._hasImgBlob ? '' : (existing?.imageUrl || ''));
      data._hasImgBlob = existing?._hasImgBlob || false;
      data.caption = readField('hs-caption');
    }
    if (type === 'link')  { data.linkUrl = readField('hs-linkUrl'); data.linkDesc = readField('hs-linkDesc'); }
    if (type === 'nav')   { data.targetScene = readField('hs-targetScene'); data.transition = readField('hs-transition'); }
    if (type === 'text') {
      const fontSize  = parseInt(document.getElementById('hs-fontSize')?.value) || 22;
      const color     = document.getElementById('hs-text-color')?.value || '#ffffff';
      const bgColor   = document.getElementById('hs-bg-color')?.value || '#000000';
      const bgOpacity = parseInt(document.getElementById('hs-bg-opacity')?.value) ?? 45;
      const bold      = document.getElementById('hs-bold')?.checked || false;
      const italic    = document.getElementById('hs-italic')?.checked || false;
      const bgShape   = document.querySelector('.shape-pill.active')?.dataset.shape || 'card';
      const rotation  = parseInt(document.getElementById('hs-rotation')?.value) || 0;
      const r = parseInt(bgColor.slice(1,3), 16);
      const g = parseInt(bgColor.slice(3,5), 16);
      const b = parseInt(bgColor.slice(5,7), 16);
      const background = `rgba(${r},${g},${b},${bgOpacity/100})`;
      data.content = readField('hs-content');
      data.style   = { fontSize, color, bold, italic, background, bgColor, bgOpacity, bgShape, rotation };
    }
    if (['info','video','image','link'].includes(type)) {
      data.icon = document.querySelector('.icon-pick.active')?.dataset.icon || '';
    }
    return data;
  }

  /* Desa els canvis del hotspot a mesura que s'editen, SENSE regenerar el
     formulari (per no perdre el focus). Així el tipus/destí no es perden mai. */
  persistHotspotEdits() {
    const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
    if (!hs) return;
    const activeType = document.querySelector('.type-pill.active')?.dataset.type || hs.type;
    Object.assign(hs, this.getHsFormData(activeType));
    this.renderHotspots();
    this.renderHsMiniList();
    this.saveData(true);
  }

  saveSelectedHotspot() {
    const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
    if (!hs) return;
    const activeType = document.querySelector('.type-pill.active')?.dataset.type || hs.type;
    const data = this.getHsFormData(activeType);
    Object.assign(hs, data);
    this.renderHotspots();
    this.renderPropsPanel();
    // Stay on hotspot panel
    this.selectHotspot(hs.id);
    this.showToast('Hotspot desat');
    this.saveData();
  }

  deleteSelectedHotspot() {
    if (!this.selectedHsId) return;
    const s = this.currentScene;
    s.hotspots = s.hotspots.filter(h => h.id !== this.selectedHsId);
    this.selectedHsId = null;
    this.renderHotspots();
    this.renderPropsPanel();
    this.saveData();
    this.showToast('Hotspot eliminat');
  }

  /* ── Add-mode: click on panorama ── */
  setAddMode(on) {
    this.addMode = on;
    const canvas = document.getElementById('studio-canvas');
    const hint = document.getElementById('add-mode-hint');
    const crosshair = document.getElementById('studio-crosshair');

    canvas.classList.toggle('add-cursor', on);
    hint.classList.toggle('hidden', !on);
    crosshair.classList.toggle('hidden', !on);
    document.getElementById('btn-add-hs').classList.toggle('active', on);
  }

  onCanvasClick(e) {
    if (!this.addMode) return;
    this.setAddMode(false);
    this.addHotspotAt(this._screenToLonLat(e.clientX, e.clientY));
  }

  /* Crea un hotspot al punt indicat (o al centre de la vista) i el selecciona */
  addHotspotAt(center) {
    center = center || { lon: this.lon, lat: this.lat };
    const newHs = {
      id: uid(),
      lon: Math.round(center.lon * 10) / 10,
      lat: Math.round(center.lat * 10) / 10,
      type: 'info',
      title: 'Nou hotspot',
      content: ''
    };
    this.currentScene.hotspots.push(newHs);
    this.renderHotspots();
    this.selectHotspot(newHs.id);
    this.saveData();
    this.showToast('Hotspot creat — configura\'l al panell dret');
  }

  /* ── Scene management ── */
  addScene() {
    const name = prompt('Nom de la nova escena:');
    if (!name) return;
    const id = 'escena-' + Date.now().toString(36);
    this.scenes.push({
      id, name, color: '#0F6E56', shade: '#0a5040', hotspots: []
    });
    this.saveData();
    this.renderSceneList();
    this.switchScene(this.scenes.length - 1);
  }

  deleteScene() {
    if (this.scenes.length <= 1) { this.showToast('Ha de quedar almenys una escena'); return; }
    if (!confirm(`Eliminar l'escena "${this.currentScene.name}"?`)) return;
    const removed = this.scenes[this.currentIdx];
    PhotoStore.delete(removed.id).catch(() => {});
    delete this._photoUrls[removed.id];
    this.scenes.splice(this.currentIdx, 1);
    const newIdx = Math.max(0, this.currentIdx - 1);
    this.saveData();
    this.switchScene(newIdx);
  }

  /* ── Photo upload ── */
  loadPhoto(file) {
    if (!file) return;
    const s = this.currentScene;
    const safeName = file.name.replace(/[^\w.\-]+/g, '-').toLowerCase();
    s._photoFilename = safeName;

    // Preview immediat en memòria
    const url = URL.createObjectURL(file);
    this._photoUrls[s.id] = url;

    // Ruta suggerida per al desplegament (carpeta images/ del repositori)
    s.image = `images/${safeName}`;
    document.getElementById('prop-image-path').value = s.image;
    document.getElementById('photo-name').textContent = safeName;

    new THREE.TextureLoader().load(url, tex => this.applyTex(tex));

    // Desat PERSISTENT a IndexedDB (preview local, sobreviu a recàrregues)
    PhotoStore.put(s.id, file).then(() => {
      this.saveData();          // sincronitza metadades amb el Tour
      this.renderSceneList();
    }).catch(() => {});

    // Pujada al NÚVOL propi (Supabase) → URL pública visible per a tothom
    const ext = (safeName.match(/\.(\w+)$/) || [,'jpg'])[1];
    if (typeof sbUpload === 'function' && sbIsConfigured()) {
      this.showToast('Pujant foto al núvol…');
      sbUpload(`photos/${s.id}.${ext}`, file).then(publicUrl => {
        s.image = publicUrl;
        document.getElementById('prop-image-path').value = publicUrl;
        this.saveData();
        this.renderSceneList();
        this.showToast('Foto al núvol ✓ Publica per fer-la visible a tothom');
      }).catch(err => {
        this.showToast('Foto en local. Error al núvol: ' + (err.message || err));
      });
    } else {
      this.showToast('Foto desada (local). Núvol no disponible.');
    }
  }

  /* ── Save scene props ── */
  saveSceneProps() {
    const s = this.currentScene;
    s.name  = document.getElementById('prop-name').value.trim() || s.name;
    s.color = document.getElementById('prop-color').value;
    s.shade = this.darkenHex(s.color, 20);
    // No esborris una foto incrustada (data URI) si el camp de ruta és buit
    const pathVal = document.getElementById('prop-image-path').value.trim();
    if (pathVal) s.image = pathVal;
    else if (!(typeof s.image === 'string' && s.image.startsWith('data:'))) s.image = undefined;
    const lon = parseFloat(document.getElementById('prop-default-lon').value);
    const lat = parseFloat(document.getElementById('prop-default-lat').value);
    if (!isNaN(lon)) s.defaultLon = lon; else delete s.defaultLon;
    if (!isNaN(lat)) s.defaultLat = lat; else delete s.defaultLat;
    const minFov = parseInt(document.getElementById('prop-min-fov').value);
    const maxFov = parseInt(document.getElementById('prop-max-fov').value);
    if (!isNaN(minFov)) s.minFov = minFov; else delete s.minFov;
    if (!isNaN(maxFov)) s.maxFov = maxFov; else delete s.maxFov;
    this.renderSceneList();
    document.getElementById('status-scene').textContent = s.name;
  }

  darkenHex(hex, amt) {
    let r = Math.max(0, parseInt(hex.slice(1,3),16) - amt);
    let g = Math.max(0, parseInt(hex.slice(3,5),16) - amt);
    let b = Math.max(0, parseInt(hex.slice(5,7),16) - amt);
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  }

  /* ── Export ── */
  showExportModal() {
    document.getElementById('export-modal').classList.remove('hidden');

    // URL pública: la desada o, per defecte, la pròpia del tour (sempre la mateixa)
    const urlInput = document.getElementById('em-public-url');
    const openBtn  = document.getElementById('em-open-url');
    const savedUrl = (localStorage.getItem('vg-public-url') || '').trim() || this._defaultPublicUrl();
    localStorage.setItem('vg-public-url', savedUrl);
    urlInput.value = savedUrl;
    openBtn.href = savedUrl || '#';
    openBtn.style.opacity = savedUrl ? '1' : '0.35';
    openBtn.style.pointerEvents = savedUrl ? '' : 'none';

    urlInput.addEventListener('input', () => {
      const v = urlInput.value.trim();
      localStorage.setItem('vg-public-url', v);
      openBtn.href = v || '#';
      openBtn.style.opacity = v ? '1' : '0.35';
      openBtn.style.pointerEvents = v ? '' : 'none';
      this._updateEmbedCode();
    }, { once: false });

    // Codi per incrustar (iframe)
    this._updateEmbedCode();
    if (!this._embedWired) {
      this._embedWired = true;
      document.getElementById('em-copy-embed').addEventListener('click', () => {
        const ta = document.getElementById('em-embed-code');
        const done = () => this.showToast('Codi copiat ✓ Enganxa\'l a la teva web');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ta.value).then(done).catch(() => { ta.select(); document.execCommand('copy'); done(); });
        } else { ta.select(); document.execCommand('copy'); done(); }
      });
    }

    // Estat de les fotos (s'incrustaran dins de scenes.json)
    const photoNote = document.getElementById('em-photo-note');
    PhotoStore.keys().then(keys => {
      const stored = new Set(keys);
      const withPhoto = this.scenes.filter(s => stored.has(s.id)).length;
      const missing   = this.scenes.filter(s => !stored.has(s.id)).map(s => s.name);
      let msg = '';
      if (withPhoto) msg += `✓ ${withPhoto} foto/es s'incrustaran dins de scenes.json. `;
      if (missing.length) msg += `Escenes sense foto: ${missing.join(', ')}.`;
      photoNote.textContent = msg;
    }).catch(() => { photoNote.textContent = ''; });
  }

  /* URL pública per defecte del tour.
     Si el Studio s'obre des del web (GitHub Pages) es dedueix de l'adreça;
     en local, es fa servir la URL publicada coneguda. */
  _defaultPublicUrl() {
    if (/^https?:\/\//.test(location.href)) {
      return location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
    }
    return 'https://francescferremagrinya-coder.github.io/vallsgenera_tour/';
  }

  /* URL base del tour: la pública desada, o la per defecte */
  _tourBaseUrl() {
    const saved = (localStorage.getItem('vg-public-url') || '').trim();
    if (/^https?:\/\//.test(saved)) return saved.replace(/[?#].*$/, '');
    return this._defaultPublicUrl();
  }

  /* Genera i mostra el codi iframe per incrustar el tour */
  _updateEmbedCode() {
    const ta = document.getElementById('em-embed-code');
    if (!ta) return;
    const url = this._tourBaseUrl();
    ta.value =
`<div style="position:relative;width:100%;padding-bottom:56.25%">
  <iframe src="${url}"
    style="position:absolute;inset:0;width:100%;height:100%;border:0"
    allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking; autoplay"
    allowfullscreen loading="lazy"></iframe>
</div>`;
  }

  /* Recomprimeix una foto 360° a una mida raonable i la torna com a data URI base64.
     Així pot viatjar dins de scenes.json sense necessitar la carpeta images/.   */
  async blobToEmbeddedDataURL(blob) {
    const MAX_W = 4096;            // amplada màxima (equirectangular 2:1)
    const QUALITY = 0.82;          // qualitat JPEG
    const bitmap = await createImageBitmap(blob).catch(() => null);
    if (!bitmap) {
      // Sense suport de createImageBitmap: incrusta el fitxer tal qual
      return await new Promise(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = () => res(null);
        fr.readAsDataURL(blob);
      });
    }
    let w = bitmap.width, h = bitmap.height;
    if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    bitmap.close && bitmap.close();
    return canvas.toDataURL('image/jpeg', QUALITY);
  }

  /* ── Publica al núvol propi (Supabase) ──
     1) Assegura que tot el mèdia (fotos incloses les antigues d'IndexedDB)
        estigui pujat al núvol amb URL pública.
     2) Desa l'array d'escenes a la taula tour_data → visible per a tothom. */
  async publishToCloud() {
    if (!(typeof sbIsConfigured === 'function' && sbIsConfigured())) {
      this.showToast('El núvol no està configurat o no respon');
      return;
    }
    this.saveSceneProps();
    const btn = document.getElementById('btn-publish');
    const orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Publicant…'; }

    try {
      // 1) Puja al núvol qualsevol foto d'escena que encara sigui local (IndexedDB)
      for (const s of this.scenes) {
        if (sbIsRemoteUrl(s.image)) continue;      // ja és una URL del núvol/externa
        let blob = null;
        try { blob = await PhotoStore.get(s.id); } catch(e) {}
        if (blob) {
          try {
            const url = await sbUpload(`photos/${s.id}.jpg`, blob);
            s.image = url;
          } catch(e) { console.warn('pujada foto', s.id, e); }
        }
        // 2) Fotos de hotspots encara locals
        for (const hs of (s.hotspots || [])) {
          if (hs.type === 'image' && !sbIsRemoteUrl(hs.imageUrl)) {
            let hb = null;
            try { hb = await PhotoStore.get('hs-img-' + hs.id); } catch(e) {}
            if (hb) {
              try { hs.imageUrl = await sbUpload(`hs-img/${hs.id}.jpg`, hb); hs._hasImgBlob = false; }
              catch(e) { console.warn('pujada hs-img', hs.id, e); }
            }
          }
        }
      }

      // 3) Publica les dades de les escenes (ordre inclòs)
      await sbPublishScenes(this.scenes);

      // 4) Publica l'estructura de carpetes (config compartida)
      if (typeof sbSaveConfig === 'function' && typeof sbLoadConfig === 'function') {
        try {
          const cfg = await sbLoadConfig();
          cfg.folders = this.folders;
          await sbSaveConfig(cfg);
        } catch (e) { console.warn('[publish] folders:', e); }
      }

      this.saveData(true);
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
      this.showToast('✓ Publicat al núvol — visible per a tothom');
    } catch (err) {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
      this.showToast('Error publicant: ' + (err.message || err));
    }
  }

  async exportJSON() {
    const btn = document.getElementById('em-download');
    const origHTML = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Preparant fotos…'; }

    let embedded = 0;
    // Còpia neta amb les fotos incrustades dins de cada escena
    const exportData = [];
    for (const s of this.scenes) {
      const copy = { ...s };
      delete copy._photoFilename;
      delete copy._photoUrl;
      let blob = null;
      try { blob = await PhotoStore.get(s.id); } catch(e) {}
      if (blob) {
        const dataUrl = await this.blobToEmbeddedDataURL(blob);
        if (dataUrl) { copy.image = dataUrl; embedded++; }
      }
      // Embed hotspot images
      if (copy.hotspots) {
        copy.hotspots = await Promise.all(copy.hotspots.map(async hs => {
          if (hs.type !== 'image' || !hs._hasImgBlob) return hs;
          let hsBlob = null;
          try { hsBlob = await PhotoStore.get('hs-img-' + hs.id); } catch(e) {}
          if (!hsBlob) return hs;
          const dataUrl = await new Promise(res => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.onerror = () => res(null);
            fr.readAsDataURL(hsBlob);
          });
          return dataUrl ? { ...hs, imageUrl: dataUrl, _hasImgBlob: undefined } : hs;
        }));
      }
      // Embed decal images
      if (copy.decals) {
        copy.decals = await Promise.all(copy.decals.map(async d => {
          let dBlob = null;
          try { dBlob = await PhotoStore.get('dcl-' + d.id); } catch(e) {}
          if (!dBlob) return d;
          const dataUrl = await new Promise(res => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.onerror = () => res(null);
            fr.readAsDataURL(dBlob);
          });
          return dataUrl ? { ...d, imageUrl: dataUrl } : d;
        }));
      }
      exportData.push(copy);
    }

    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'scenes.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);

    if (btn) { btn.disabled = false; btn.innerHTML = origHTML; }
    const mb = (blob.size / 1048576).toFixed(1);
    this.showToast(`scenes.json descarregat (${embedded} foto/es, ${mb} MB)`);
  }

  /* ── Toast ── */
  showToast(msg) {
    const t = document.getElementById('studio-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ── Preview en directe per al tipus text ── */
  livePreviewText() {
    const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
    if (!hs) return;
    const fontSize  = parseInt(document.getElementById('hs-fontSize')?.value) || 22;
    const color     = document.getElementById('hs-text-color')?.value || '#ffffff';
    const bgColor   = document.getElementById('hs-bg-color')?.value || '#000000';
    const bgOpacity = parseInt(document.getElementById('hs-bg-opacity')?.value) ?? 45;
    const bold      = document.getElementById('hs-bold')?.checked || false;
    const italic    = document.getElementById('hs-italic')?.checked || false;
    const bgShape   = document.querySelector('.shape-pill.active')?.dataset.shape || 'card';
    const rotation  = parseInt(document.getElementById('hs-rotation')?.value) || 0;
    const content   = document.getElementById('hs-content')?.value || '(text)';
    const r = parseInt(bgColor.slice(1,3), 16);
    const g = parseInt(bgColor.slice(3,5), 16);
    const b = parseInt(bgColor.slice(5,7), 16);
    const background = `rgba(${r},${g},${b},${bgOpacity/100})`;
    const RADIUS = { pill:'999px', card:'6px', sharp:'0px', none:'0px' };

    const el = document.querySelector(`.s-hotspot[data-id="${hs.id}"] .s-text-preview`);
    if (!el) return;
    el.style.fontSize    = `${Math.min(fontSize, 18)}px`;
    el.style.color       = color;
    el.style.background  = bgShape === 'none' ? 'transparent' : background;
    el.style.fontWeight  = bold ? '700' : '400';
    el.style.fontStyle   = italic ? 'italic' : 'normal';
    el.style.borderRadius = RADIUS[bgShape] || '6px';
    el.style.border      = bgShape === 'none' ? 'none' : '';
    el.style.transform   = rotation ? `rotate(${rotation}deg)` : '';
    el.textContent       = content;
  }

  /* ── Events ── */
  setupEvents() {
    const canvas = document.getElementById('studio-canvas');

    // Panorama navigation (pointer)
    canvas.addEventListener('pointerdown', e => {
      if (this.addMode) return;
      if (e.target !== canvas) return; // hotspot has captured pointer
      // Si el cursor és sobre un decal (text/imatge), l'arrosseguem per moure'l
      const hitId = this._decalAtScreen(e.clientX, e.clientY);
      if (hitId) {
        if (this.selectedDecalId !== hitId) this.selectDecal(hitId);
        const d = (this.currentScene.decals || []).find(d => d.id === hitId);
        this._decalDrag = {
          startLL: this._screenToLonLat(e.clientX, e.clientY),
          startCorners: d ? JSON.parse(JSON.stringify(d.corners)) : null,
          moved: false
        };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }
      this.pointerDown = true;
      this.startX = e.clientX; this.startY = e.clientY;
      this.startLon = this.lon; this.startLat = this.lat;
      this.velLon = 0; this.velLat = 0;
    });
    canvas.addEventListener('pointermove', e => {
      if (this._decalDrag) {
        this._decalDrag.moved = true;
        if (this._decalDrag.startCorners) {
          this._moveDecalBy(this._decalDrag.startLL, this._screenToLonLat(e.clientX, e.clientY), this._decalDrag.startCorners);
        }
        return;
      }
      if (!this.pointerDown) return;
      const dx = e.clientX - this.startX, dy = e.clientY - this.startY;
      const nl = this.startLon - dx * .22, na = this.startLat + dy * .22;
      this.velLon = (nl - this.lon) * .4; this.velLat = (na - this.lat) * .4;
      this.lon = nl; this.lat = na;
    });
    canvas.addEventListener('pointerup', () => {
      if (this._decalDrag) { if (this._decalDrag.moved) this.saveData(true); this._decalDrag = null; }
      this.pointerDown = false;
    });
    canvas.addEventListener('pointerleave', () => { this.pointerDown = false; });

    // Click to place hotspot
    canvas.addEventListener('click', e => this.onCanvasClick(e));

    // Wheel zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.fov = Math.max(30, Math.min(100, this.fov + e.deltaY * .05));
      this.camera.fov = this.fov; this.camera.updateProjectionMatrix();
    }, { passive: false });

    // Pinch zoom
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) { e.preventDefault(); this.lastPinch = this.pinchDist(e.touches); }
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && this.lastPinch) {
        e.preventDefault();
        const d = this.pinchDist(e.touches);
        this.fov = Math.max(30, Math.min(100, this.fov + (this.lastPinch - d) * .12));
        this.camera.fov = this.fov; this.camera.updateProjectionMatrix();
        this.lastPinch = d;
      }
    }, { passive: false });

    // Keyboard
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.setAddMode(false); }
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); this.saveData(); }
    });

    // Toolbar (btn-add-hs ara s'arrossega des de la barra flotant, més avall)
    document.getElementById('btn-cancel-add').addEventListener('click', () => this.setAddMode(false));

    // Floating overlay toolbar — arrossega per col·locar, o clic per posar al centre
    this._setupDragPlace('fab-add-text', 'Text',
      (ll) => this.addTextDecal(ll),
      () => this.addTextDecal());
    this._setupDragPlace('btn-add-hs', 'Hotspot',
      (ll) => this.addHotspotAt(ll),
      () => this.addHotspotAt());
    this._setupDragPlace('fab-add-image', 'Imatge',
      (ll) => { this._pendingDecalCenter = ll; document.getElementById('decal-img-input').click(); },
      () => { this._pendingDecalCenter = null; document.getElementById('decal-img-input').click(); });

    // Settings modal (portada / logo / nadir)
    const settingsModal = document.getElementById('settings-modal');
    document.getElementById('btn-settings').addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('settings-close').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('settings-overlay').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('btn-save').addEventListener('click', () => {
      this.saveSceneProps();
      this.saveData();
    });
    document.getElementById('btn-publish').addEventListener('click', () => this.publishToCloud());
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', async () => {
      if (typeof sbSignOut === 'function') await sbSignOut();
      location.reload();
    });
    document.getElementById('btn-export').addEventListener('click', () => this.showExportModal());
    document.getElementById('btn-new-scene').addEventListener('click', () => this.addScene());
    document.getElementById('btn-new-folder').addEventListener('click', () => this.addFolder());

    // Scene props live update
    document.getElementById('prop-name').addEventListener('input', e => {
      this.currentScene.name = e.target.value;
      this.renderSceneList();
      document.getElementById('status-scene').textContent = e.target.value;
    });
    document.getElementById('prop-color').addEventListener('input', e => {
      document.getElementById('prop-color-val').textContent = e.target.value;
    });
    document.getElementById('prop-image-path').addEventListener('change', e => {
      const v = e.target.value.trim();
      const s = this.currentScene;
      if (v) s.image = v;
      else if (!(typeof s.image === 'string' && s.image.startsWith('data:'))) s.image = undefined;
    });

    document.getElementById('prop-default-lon').addEventListener('change', () => { this.saveSceneProps(); this.saveData(); });
    document.getElementById('prop-default-lat').addEventListener('change', () => { this.saveSceneProps(); this.saveData(); });
    document.getElementById('prop-min-fov').addEventListener('change', () => { this.saveSceneProps(); this.saveData(); });
    document.getElementById('prop-max-fov').addEventListener('change', () => { this.saveSceneProps(); this.saveData(); });

    // Transition picker
    document.getElementById('trans-picker').addEventListener('click', e => {
      const btn = e.target.closest('.trans-pill');
      if (!btn) return;
      const val = btn.dataset.trans;
      localStorage.setItem('vg-transition-style', val);
      document.querySelectorAll('#trans-picker .trans-pill').forEach(b => b.classList.toggle('active', b === btn));
    });

    document.getElementById('btn-capture-view').addEventListener('click', () => {
      const s = this.currentScene;
      if (!s) return;
      // Read current camera lon/lat from the studio viewer
      s.defaultLon = Math.round(this.lon);
      s.defaultLat = Math.round(this.lat);
      document.getElementById('prop-default-lon').value = s.defaultLon;
      document.getElementById('prop-default-lat').value = s.defaultLat;
      this.saveData();
    });

    // Photo upload
    const photoInput = document.getElementById('prop-photo');
    photoInput.addEventListener('change', e => this.loadPhoto(e.target.files[0]));
    const photoDrop = document.getElementById('photo-drop');
    photoDrop.addEventListener('dragover', e => { e.preventDefault(); photoDrop.classList.add('drag-over'); });
    photoDrop.addEventListener('dragleave', () => photoDrop.classList.remove('drag-over'));
    photoDrop.addEventListener('drop', e => {
      e.preventDefault(); photoDrop.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) this.loadPhoto(file);
    });

    // Delete scene
    document.getElementById('btn-delete-scene').addEventListener('click', () => this.deleteScene());

    // Camps dinàmics: video tabs, shape pills, live preview de text
    const dynFields = document.getElementById('hs-dynamic-fields');
    dynFields.addEventListener('click', e => {
      const tab = e.target.closest('.vsrc-tab');
      if (tab) {
        const src = tab.dataset.src;
        document.querySelectorAll('.vsrc-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const webDiv   = document.getElementById('hs-video-web');
        const localDiv = document.getElementById('hs-video-local');
        if (webDiv)   webDiv.style.display   = src === 'web'   ? '' : 'none';
        if (localDiv) localDiv.style.display = src === 'local' ? '' : 'none';
        this.persistHotspotEdits();
        return;
      }
      const shapePill = e.target.closest('.shape-pill');
      if (shapePill) {
        document.querySelectorAll('.shape-pill').forEach(p => p.classList.remove('active'));
        shapePill.classList.add('active');
        this.livePreviewText();
        this.persistHotspotEdits();
        return;
      }
      const iconBtn = e.target.closest('.icon-pick');
      if (iconBtn) {
        document.querySelectorAll('.icon-pick').forEach(p => p.classList.remove('active'));
        iconBtn.classList.add('active');
        // Preview en directe de la icona al visor
        const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (hs) {
          const innerEl = document.querySelector(`.s-hotspot[data-id="${hs.id}"] .s-hotspot-inner`);
          const key = iconBtn.dataset.icon;
          if (innerEl) innerEl.innerHTML = (key && HS_ICON_LIBRARY[key]) || STUDIO_HS_ICONS[hs.type] || STUDIO_HS_ICONS.info;
        }
        this.persistHotspotEdits();
        return;
      }
    });
    // Preview en directe mentre es canvien sliders / colors / checkboxes
    dynFields.addEventListener('input', () => {
      const activeType = document.querySelector('.type-pill.active')?.dataset.type;
      if (activeType === 'text') this.livePreviewText();
    });
    // Desa automàticament qualsevol canvi dels camps (destí de navegació, etc.)
    dynFields.addEventListener('change', () => this.persistHotspotEdits());

    // Hotspot props: type pills
    document.getElementById('hs-type-pills').addEventListener('click', e => {
      const pill = e.target.closest('.type-pill');
      if (!pill) return;
      document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
      document.getElementById('hs-dynamic-fields').innerHTML =
        dynamicFields(pill.dataset.type, hs || {}, this.scenes, this.currentScene.id);
      // Desa el canvi de tipus (i el destí per defecte) immediatament
      this.persistHotspotEdits();
    });

    // Desa el títol del hotspot automàticament
    document.getElementById('hs-title').addEventListener('input', () => {
      if (this.selectedHsId) this.persistHotspotEdits();
    });
    // Desa "Mostrar el nom sempre"
    document.getElementById('hs-showLabel').addEventListener('change', () => {
      if (this.selectedHsId) this.persistHotspotEdits();
    });

    // Hotspot image + video upload (inside dynamic fields)
    dynFields.addEventListener('change', e => {
      // ── Imatge del hotspot ──
      const imgInput = e.target.closest('#hs-img-file');
      if (imgInput && imgInput.files[0]) {
        const file = imgInput.files[0];
        const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (!hs) return;
        PhotoStore.put('hs-img-' + hs.id, file).then(() => {
          hs._hasImgBlob = true;
          this.saveData(true);
        }).catch(() => {});
        // Núvol propi
        const ext = (file.name.match(/\.(\w+)$/) || [,'jpg'])[1];
        if (typeof sbUpload === 'function' && sbIsConfigured()) {
          document.getElementById('hs-img-name').textContent = 'Pujant…';
          sbUpload(`hs-img/${hs.id}.${ext}`, file).then(publicUrl => {
            hs.imageUrl = publicUrl;
            hs._hasImgBlob = false;
            document.getElementById('hs-img-name').textContent = 'Imatge al núvol ✓';
            this.saveData(true);
            this.showToast('Imatge al núvol ✓');
          }).catch(err => {
            document.getElementById('hs-img-name').textContent = 'Imatge pujada ✓ (local)';
            this.showToast('Imatge en local. Error al núvol: ' + (err.message || err));
          });
        } else {
          document.getElementById('hs-img-name').textContent = 'Imatge pujada ✓ (local)';
        }
        return;
      }

      // ── Vídeo del hotspot ──
      const vidInput = e.target.closest('#hs-vid-file');
      if (vidInput && vidInput.files[0]) {
        const file = vidInput.files[0];
        const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
        if (!hs) return;
        if (!(typeof sbUpload === 'function' && sbIsConfigured())) {
          this.showToast('El núvol no està disponible per pujar vídeos');
          return;
        }
        const nameEl = document.getElementById('hs-vid-name');
        // Límit del pla gratuït de Supabase: 50 MB per fitxer
        const MAX_MB = 50;
        const sizeMB = file.size / 1048576;
        if (sizeMB > MAX_MB) {
          if (nameEl) nameEl.textContent = 'Massa gran';
          vidInput.value = '';
          this.showToast(`El vídeo fa ${sizeMB.toFixed(0)} MB. Màxim ${MAX_MB} MB al pla gratuït — comprimeix-lo o fes servir la pestanya YouTube/Vimeo.`);
          return;
        }
        const ext = (file.name.match(/\.(\w+)$/) || [,'mp4'])[1];
        if (nameEl) nameEl.textContent = 'Pujant vídeo…';
        sbUpload(`videos/${hs.id}.${ext}`, file).then(publicUrl => {
          hs.videoUrl = publicUrl;
          hs.videoLocal = '';
          hs._videoUploaded = true;
          if (nameEl) nameEl.textContent = 'Vídeo pujat ✓';
          this.saveData(true);
          this.showToast('Vídeo al núvol ✓ Publica per fer-lo visible');
        }).catch(err => {
          if (nameEl) nameEl.textContent = 'Error al pujar';
          this.showToast('Error pujant vídeo: ' + (err.message || err));
        });
        return;
      }
    });

    // Decal: add new
    document.getElementById('decal-img-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) { this.addDecal(file, this._pendingDecalCenter); this._pendingDecalCenter = null; e.target.value = ''; }
    });

    // Decal: replace image
    document.getElementById('decal-replace-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !this.selectedDecalId) return;
      PhotoStore.put('dcl-' + this.selectedDecalId, file).then(() => {
        const mesh = this._decalMeshes[this.selectedDecalId];
        if (mesh) {
          const url = URL.createObjectURL(file);
          new THREE.TextureLoader().load(url, tex => {
            tex.minFilter = THREE.LinearFilter;
            mesh.material.map = tex; mesh.material.needsUpdate = true;
          });
        }
        document.getElementById('decal-img-name').textContent = 'Imatge actualitzada ✓';
        e.target.value = '';
        this.saveData(true);
        this.showToast('Imatge substituïda');
      }).catch(() => this.showToast('Error al substituir la imatge'));
    });

    // Decal: opacity slider
    document.getElementById('decal-opacity').addEventListener('input', e => {
      const val = parseInt(e.target.value) / 100;
      const decal = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      if (!decal) return;
      decal.opacity = val;
      const mesh = this._decalMeshes[this.selectedDecalId];
      if (mesh) { mesh.material.opacity = val; mesh.material.needsUpdate = true; }
      this.saveData(true);
    });

    // Decal: back button
    document.getElementById('btn-decal-back').addEventListener('click', () => {
      this.selectedDecalId = null;
      const dh = document.getElementById('studio-decal-handles');
      if (dh) dh.innerHTML = '';
      this.renderDecalMiniList();
      this.renderPropsPanel();
    });

    // Decal: delete button
    document.getElementById('btn-delete-decal').addEventListener('click', () => this.deleteSelectedDecal());

    // Decal: text button
    document.getElementById('decal-add-text-btn').addEventListener('click', () => this.addTextDecal());

    // Decal: text fields live update
    const updateTextDecal = () => {
      const decal = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      if (!decal || decal.decalType !== 'text') return;
      decal.content   = document.getElementById('decal-content')?.value || '';
      decal.fontSize  = parseInt(document.getElementById('decal-fontsize')?.value) || 80;
      decal.color     = document.getElementById('decal-color')?.value || '#ffffff';
      decal.bgColor   = document.getElementById('decal-bg-color')?.value || '#000000';
      decal.bgOpacity = parseInt(document.getElementById('decal-bg-opacity')?.value) || 0;
      decal.bold      = document.getElementById('decal-bold')?.checked || false;
      decal.italic    = document.getElementById('decal-italic')?.checked || false;
      this.updateDecalMesh(decal, true);
      this.renderDecalMiniList();
      this.saveData(true);
    };
    ['decal-content','decal-fontsize','decal-color','decal-bg-color','decal-bg-opacity'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateTextDecal);
    });
    ['decal-bold','decal-italic'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', updateTextDecal);
    });

    // Text editor modal (editor flotant còmode)
    const teModal = document.getElementById('text-editor-modal');
    const teLive = () => {
      const d = (this.currentScene.decals || []).find(dd => dd.id === this.selectedDecalId);
      if (!d || d.decalType !== 'text') return;
      d.content   = document.getElementById('te-text').value;
      d.fontSize  = parseInt(document.getElementById('te-fontsize').value) || 80;
      d.color     = document.getElementById('te-color').value;
      d.bgColor   = document.getElementById('te-bg-color').value;
      d.bgOpacity = parseInt(document.getElementById('te-bg-opacity').value) || 0;
      d.bold      = document.getElementById('te-bold').checked;
      d.italic    = document.getElementById('te-italic').checked;
      // Translúcid (opacitat de tot el text)
      d.opacity   = (parseInt(document.getElementById('te-opacity').value) || 100) / 100;
      const mesh = this._decalMeshes[d.id];
      if (mesh) { mesh.material.opacity = d.opacity; mesh.material.needsUpdate = true; }
      // Ombra
      const sh = parseInt(document.getElementById('te-shadow').value);
      d.shadow = sh > 0;
      d.shadowBlur = sh;
      this.updateDecalMesh(d, true);
    };
    const openTextEditor = () => {
      const d = (this.currentScene.decals || []).find(dd => dd.id === this.selectedDecalId);
      if (!d || d.decalType !== 'text') return;
      document.getElementById('te-text').value        = d.content || '';
      document.getElementById('te-fontsize').value    = d.fontSize || 80;
      document.getElementById('te-fs-val').textContent = (d.fontSize || 80) + 'px';
      document.getElementById('te-color').value       = d.color || '#ffffff';
      document.getElementById('te-bg-color').value    = d.bgColor || '#000000';
      document.getElementById('te-bg-opacity').value  = d.bgOpacity ?? 0;
      document.getElementById('te-bg-val').textContent = (d.bgOpacity ?? 0) + '%';
      document.getElementById('te-bold').checked      = !!d.bold;
      document.getElementById('te-italic').checked    = !!d.italic;
      const op = Math.round((d.opacity ?? 1) * 100);
      document.getElementById('te-opacity').value      = op;
      document.getElementById('te-op-val').textContent = op + '%';
      const sh = d.shadow === false ? 0 : (d.shadowBlur != null ? d.shadowBlur : 10);
      document.getElementById('te-shadow').value       = sh;
      document.getElementById('te-shadow-val').textContent = sh === 0 ? 'Cap' : (sh <= 15 ? 'Suau' : 'Forta');
      teModal.classList.remove('hidden');
      setTimeout(() => document.getElementById('te-text').focus(), 50);
    };
    const closeTextEditor = () => teModal.classList.add('hidden');
    document.getElementById('btn-edit-text')?.addEventListener('click', openTextEditor);
    document.getElementById('te-close').addEventListener('click', closeTextEditor);
    document.getElementById('te-cancel').addEventListener('click', closeTextEditor);
    document.getElementById('te-overlay').addEventListener('click', closeTextEditor);
    document.getElementById('te-fontsize').addEventListener('input', e =>
      document.getElementById('te-fs-val').textContent = e.target.value + 'px');
    document.getElementById('te-bg-opacity').addEventListener('input', e =>
      document.getElementById('te-bg-val').textContent = e.target.value + '%');
    document.getElementById('te-opacity').addEventListener('input', e =>
      document.getElementById('te-op-val').textContent = e.target.value + '%');
    document.getElementById('te-shadow').addEventListener('input', e => {
      const v = parseInt(e.target.value);
      document.getElementById('te-shadow-val').textContent = v === 0 ? 'Cap' : (v <= 15 ? 'Suau' : 'Forta');
    });
    ['te-text','te-fontsize','te-color','te-bg-color','te-bg-opacity','te-opacity','te-shadow'].forEach(id =>
      document.getElementById(id).addEventListener('input', teLive));
    ['te-bold','te-italic'].forEach(id =>
      document.getElementById(id).addEventListener('change', teLive));
    document.getElementById('te-apply').addEventListener('click', () => {
      teLive();
      this.renderDecalMiniList();
      this.saveData(true);
      if (this.selectedDecalId) this.selectDecal(this.selectedDecalId); // refresca el panell dret
      closeTextEditor();
      this.showToast('Text actualitzat');
    });

    // Hotspot props: save / delete / back
    document.getElementById('btn-save-hs').addEventListener('click', () => this.saveSelectedHotspot());
    document.getElementById('btn-delete-hs').addEventListener('click', () => this.deleteSelectedHotspot());
    document.getElementById('btn-hs-back').addEventListener('click', () => {
      this.selectedHsId = null;
      this.renderHotspots();
      this.renderPropsPanel();
    });

    // Export modal
    document.getElementById('em-close').addEventListener('click', () =>
      document.getElementById('export-modal').classList.add('hidden'));
    document.getElementById('em-close2').addEventListener('click', () =>
      document.getElementById('export-modal').classList.add('hidden'));
    document.getElementById('em-download').addEventListener('click', () => this.exportJSON());
    document.querySelector('#export-modal .em-overlay').addEventListener('click', () =>
      document.getElementById('export-modal').classList.add('hidden'));

    // Resize
    window.addEventListener('resize', () => {
      const c = document.getElementById('studio-viewer');
      this.camera.aspect = c.clientWidth / c.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(c.clientWidth, c.clientHeight);
    });

    // Logo (mosca)
    this._initLogo();
    document.getElementById('logo-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const src = ev.target.result;
        localStorage.setItem('vg-logo', src);
        this._applyLogoPreview(src);
        this.showToast('Logo desat — visible al Tour');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    document.getElementById('btn-remove-logo').addEventListener('click', () => {
      localStorage.removeItem('vg-logo');
      localStorage.removeItem('vg-logo-size');
      localStorage.removeItem('vg-logo-corner');
      this._applyLogoPreview(null);
      this.showToast('Logo eliminat');
    });

    // Portada (splash) → puja al núvol i publica
    this._initCover();
    document.getElementById('cover-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = '';
      if (!(typeof sbUpload === 'function' && sbIsConfigured())) {
        this.showToast('El núvol no està disponible per pujar la portada');
        return;
      }
      if (file.size / 1048576 > 50) { this.showToast('La imatge de portada supera els 50 MB'); return; }
      const ext = (file.name.match(/\.(\w+)$/) || [, 'jpg'])[1];
      const ph = document.getElementById('cover-placeholder');
      if (ph) { ph.style.display = ''; ph.textContent = 'Pujant…'; }
      sbUpload(`cover.${ext}`, file).then(async url => {
        this._applyCoverPreview(url);
        localStorage.setItem('vg-cover', url);
        try {
          const cfg = await sbLoadConfig();
          cfg.cover = url;
          await sbSaveConfig(cfg);
          this.showToast('Portada publicada ✓ Visible per a tothom');
        } catch (err) {
          this.showToast('Portada pujada, però error publicant: ' + (err.message || err));
        }
      }).catch(err => {
        if (ph) ph.textContent = 'Arrossega o clica per pujar';
        this.showToast('Error pujant portada: ' + (err.message || err));
      });
    });
    const coverDrop = document.getElementById('cover-drop');
    if (coverDrop) {
      coverDrop.addEventListener('dragover', ev => { ev.preventDefault(); coverDrop.classList.add('drag-over'); });
      coverDrop.addEventListener('dragleave', () => coverDrop.classList.remove('drag-over'));
      coverDrop.addEventListener('drop', ev => {
        ev.preventDefault(); coverDrop.classList.remove('drag-over');
        const file = ev.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          const input = document.getElementById('cover-input');
          const dt = new DataTransfer(); dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    // Nadir patch
    this._initNadir();
    document.getElementById('nadir-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const src = ev.target.result;
        localStorage.setItem('vg-nadir', src);
        this._applyNadirPreview(src);
        this.showToast('Nadir desat — visible al Tour');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    document.getElementById('nadir-size').addEventListener('input', e => {
      const v = e.target.value;
      document.getElementById('nadir-size-val').textContent = v + '%';
      localStorage.setItem('vg-nadir-size', v);
    });
    document.getElementById('btn-remove-nadir').addEventListener('click', () => {
      localStorage.removeItem('vg-nadir');
      localStorage.removeItem('vg-nadir-size');
      this._applyNadirPreview(null);
      this.showToast('Nadir eliminat');
    });
    document.getElementById('logo-size').addEventListener('input', e => {
      const v = e.target.value;
      document.getElementById('logo-size-val').textContent = v + 'px';
      localStorage.setItem('vg-logo-size', v);
    });
    document.querySelectorAll('.logo-corner-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.logo-corner-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('vg-logo-corner', btn.dataset.corner);
      });
    });
  }

  _applyCoverPreview(url) {
    const img = document.getElementById('cover-preview');
    const ph  = document.getElementById('cover-placeholder');
    if (!img) return;
    if (url) {
      img.src = url;
      img.style.display = 'block';
      if (ph) ph.style.display = 'none';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
      if (ph) { ph.style.display = ''; ph.textContent = 'Arrossega o clica per pujar'; }
    }
  }

  async _initCover() {
    const local = localStorage.getItem('vg-cover');
    if (local) { this._applyCoverPreview(local); return; }
    if (typeof sbLoadConfig === 'function') {
      try {
        const cfg = await sbLoadConfig();
        if (cfg && cfg.cover) {
          this._applyCoverPreview(cfg.cover);
          localStorage.setItem('vg-cover', cfg.cover);
        }
      } catch (e) {}
    }
  }

  _initLogo() {
    const src    = localStorage.getItem('vg-logo');
    const size   = localStorage.getItem('vg-logo-size')   || '112';
    const corner = localStorage.getItem('vg-logo-corner') || 'tr';

    // Restore slider + corner buttons
    const slider = document.getElementById('logo-size');
    if (slider) {
      slider.value = size;
      document.getElementById('logo-size-val').textContent = size + 'px';
    }
    document.querySelectorAll('.logo-corner-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.corner === corner);
    });

    this._applyLogoPreview(src);
  }

  _applyLogoPreview(src) {
    const preview     = document.getElementById('logo-preview');
    const placeholder = document.getElementById('logo-placeholder');
    const removeBtn   = document.getElementById('btn-remove-logo');
    const controls    = document.getElementById('logo-controls');
    if (src) {
      preview.src = src;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      removeBtn.style.display = 'block';
      if (controls) controls.style.display = 'block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
      placeholder.style.display = '';
      removeBtn.style.display = 'none';
      if (controls) controls.style.display = 'none';
    }
  }

  _initNadir() {
    const src  = localStorage.getItem('vg-nadir');
    const size = localStorage.getItem('vg-nadir-size') || '25';
    const slider = document.getElementById('nadir-size');
    if (slider) {
      slider.value = size;
      document.getElementById('nadir-size-val').textContent = size + '%';
    }
    this._applyNadirPreview(src);
  }

  _applyNadirPreview(src) {
    const preview     = document.getElementById('nadir-preview');
    const placeholder = document.getElementById('nadir-placeholder');
    const removeBtn   = document.getElementById('btn-remove-nadir');
    const controls    = document.getElementById('nadir-controls');
    if (src) {
      preview.src = src;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      removeBtn.style.display = 'block';
      if (controls) controls.style.display = 'block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
      placeholder.style.display = '';
      removeBtn.style.display = 'none';
      if (controls) controls.style.display = 'none';
    }
  }

  pinchDist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

  /* ── Animation loop ── */
  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.pointerDown) {
      this.lon += this.velLon; this.lat += this.velLat;
      this.velLon *= .92; this.velLat *= .92;
    }
    this.lat = Math.max(-85, Math.min(85, this.lat));

    const phi   = THREE.MathUtils.degToRad(90 - this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);
    this.camera.lookAt(
      Math.sin(phi)*Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi)*Math.sin(theta)
    );

    // Update status bar coords
    const lon = ((this.lon % 360) + 360) % 360;
    const displayLon = lon > 180 ? lon - 360 : lon;
    document.getElementById('status-coords').textContent =
      `lon: ${displayLon.toFixed(1)} · lat: ${this.lat.toFixed(1)}`;

    this.updateHotspotPositions();
    this.updateDecalHandlePositions();
    this.renderer.render(this.threeScene, this.camera);
  }
}

/* ── Boot ── */
window.addEventListener('DOMContentLoaded', async () => {
  if (typeof THREE === 'undefined') {
    alert('Error: no s\'ha pogut carregar Three.js. Comprova la connexió.');
    return;
  }

  const gate = document.getElementById('login-gate');
  const bootStudio = () => {
    if (gate) gate.classList.add('hidden');
    if (!window.studio) window.studio = new Studio();
  };

  // Sense núvol configurat → mode local (sense login)
  if (!(typeof sbIsConfigured === 'function' && sbIsConfigured())) {
    bootStudio();
    return;
  }

  // Amb núvol: cal iniciar sessió per editar/publicar
  const session = await sbGetSession();
  if (session) { bootStudio(); return; }

  // Mostra el formulari de login
  const form  = document.getElementById('login-card');
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    btn.disabled = true; btn.textContent = 'Entrant…';
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      await sbSignIn(email, password);
      bootStudio();
    } catch (err) {
      errEl.textContent = 'Correu o contrasenya incorrectes';
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });
});
