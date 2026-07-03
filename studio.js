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
      return `<div class="pp-field">
        <label>Escena de destí</label>
        <select id="hs-targetScene">${opts}</select>
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
    this.currentIdx = 0;
    this.selectedHsId = null;
    this.selectedDecalId = null;
    this.draggingCorner  = null; // 'tl'|'tr'|'br'|'bl' while dragging
    this.addMode = false;
    this._photoUrls  = {}; // sceneId → objectURL (preview)
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

    // Central move handle — arrossega tot el decal per la foto
    const move = document.createElement('div');
    move.className = 'dcl-move';
    move.title = 'Arrossega per moure';
    move.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
      <polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
    </svg>`;
    let startLL = null, startCorners = null;
    move.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      move.setPointerCapture(e.pointerId);
      this._movingDecal = true;
      startLL = this._screenToLonLat(e.clientX, e.clientY);
      const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      startCorners = d ? JSON.parse(JSON.stringify(d.corners)) : null;
    });
    move.addEventListener('pointermove', e => {
      if (!this._movingDecal || !startCorners) return;
      const cur = this._screenToLonLat(e.clientX, e.clientY);
      let dLon = cur.lon - startLL.lon;
      if (dLon > 180) dLon -= 360; else if (dLon < -180) dLon += 360;
      const dLat = cur.lat - startLL.lat;
      const d = (this.currentScene.decals || []).find(d => d.id === this.selectedDecalId);
      if (!d) return;
      ['tl','tr','br','bl'].forEach(k => {
        d.corners[k] = {
          lon: startCorners[k].lon + dLon,
          lat: Math.max(-85, Math.min(85, startCorners[k].lat + dLat))
        };
      });
      this.updateDecalMesh(d);
    });
    move.addEventListener('pointerup', () => {
      if (this._movingDecal) { this._movingDecal = false; this.saveData(true); }
    });
    overlay.appendChild(move);
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
    // Move handle at the decal centre
    const moveEl = overlay.querySelector('.dcl-move');
    if (moveEl) {
      const cc = decal.corners;
      const clon = (cc.tl.lon + cc.tr.lon + cc.br.lon + cc.bl.lon) / 4;
      const clat = (cc.tl.lat + cc.tr.lat + cc.br.lat + cc.bl.lat) / 4;
      const p = project(clon, clat);
      if (!p) { moveEl.style.display = 'none'; }
      else { moveEl.style.display = 'flex'; moveEl.style.left = `${p.x}px`; moveEl.style.top = `${p.y}px`; }
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

  async addDecal(file) {
    if (!file) return;
    // Place at current camera look direction
    const center = { lon: this.lon, lat: this.lat };
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

  /* Arrossega el botó "Text" i deixa'l anar sobre la foto per col·locar-lo.
     Un clic simple (sense arrossegar) el posa al centre de la vista. */
  _setupTextDragPlace() {
    const btn = document.getElementById('fab-add-text');
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
      if (moved && inside) {
        this.addTextDecal(this._screenToLonLat(e.clientX, e.clientY));
      } else if (!moved) {
        this.addTextDecal();               // clic simple → centre de la vista
      }
      // arrossegat però deixat fora del visor → cancel·lat
    };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true; moved = false;
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = 'Text';
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
    this.showToast('Text afegit — arrossega el cercle central per moure\'l o les cantonades per redimensionar');
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
    ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 10;
    ctx.fillText(decal.content || '', W/2, H/2);
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

  /* ── Render scene list (left sidebar) ── */
  renderSceneList() {
    const list = document.getElementById('scenes-list');
    list.innerHTML = '';
    this.scenes.forEach((s, i) => {
      const item = document.createElement('div');
      const isHidden = s.visible === false;
      item.className = 'scene-item' + (i === this.currentIdx ? ' active' : '') + (isHidden ? ' scene-hidden' : '');

      const eyeOpen = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      const eyeClosed = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

      item.innerHTML = `
        <div class="scene-thumb-row">
          <div class="scene-color-dot" style="background:${s.color}">
            ${s.image || this._photoUrls[s.id] ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' : ''}
          </div>
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
      item.addEventListener('click', () => this.switchScene(i));
      list.appendChild(item);
    });
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
        el.innerHTML = `
          <div class="sv-arrow-wrap">
            <div class="sv-chevron sv-c1">${chev}</div>
            <div class="sv-chevron sv-c2">${chev}</div>
            <div class="sv-chevron sv-c3">${chev}</div>
          </div>
          <div class="s-hotspot-lbl">${hs.title}</div>`;
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
        el.innerHTML = `
          <div class="s-hotspot-inner">${iconSvg}</div>
          <div class="s-hotspot-lbl">${hs.title}</div>
        `;
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

    // Title
    document.getElementById('hs-title').value = hs.title || '';

    // Dynamic fields
    document.getElementById('hs-dynamic-fields').innerHTML =
      dynamicFields(hs.type, hs, this.scenes, this.currentScene.id);

    // Nav: button to jump directly to the target scene for editing
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
    }

    // Position
    document.getElementById('hs-lon-val').textContent = hs.lon.toFixed(1);
    document.getElementById('hs-lat-val').textContent = hs.lat.toFixed(1);

    // Highlight in mini list
    this.renderHsMiniList();
  }

  getHsFormData(type) {
    const data = { type, title: readField('hs-title') };
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
    if (type === 'nav')   { data.targetScene = readField('hs-targetScene'); }
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

    const container = document.getElementById('studio-viewer');
    const rect = container.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Unproject to get direction
    const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();

    const lat = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, vec.y))));
    let lon = THREE.MathUtils.radToDeg(Math.atan2(vec.z, vec.x));
    lon = Math.round(lon * 10) / 10;
    const latR = Math.round(lat * 10) / 10;

    // Create new hotspot
    const newHs = {
      id: uid(),
      lon, lat: latR,
      type: 'info',
      title: 'Nou hotspot',
      content: ''
    };
    this.currentScene.hotspots.push(newHs);
    this.setAddMode(false);
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

    // Restaura URL guardada
    const urlInput = document.getElementById('em-public-url');
    const openBtn  = document.getElementById('em-open-url');
    const savedUrl = localStorage.getItem('vg-public-url') || '';
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
    }, { once: false });

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

      // 3) Publica les dades de les escenes
      await sbPublishScenes(this.scenes);
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
      this.pointerDown = true;
      this.startX = e.clientX; this.startY = e.clientY;
      this.startLon = this.lon; this.startLat = this.lat;
      this.velLon = 0; this.velLat = 0;
    });
    canvas.addEventListener('pointermove', e => {
      if (!this.pointerDown) return;
      const dx = e.clientX - this.startX, dy = e.clientY - this.startY;
      const nl = this.startLon - dx * .22, na = this.startLat + dy * .22;
      this.velLon = (nl - this.lon) * .4; this.velLat = (na - this.lat) * .4;
      this.lon = nl; this.lat = na;
    });
    canvas.addEventListener('pointerup',    () => { this.pointerDown = false; });
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

    // Toolbar
    document.getElementById('btn-add-hs').addEventListener('click', () => this.setAddMode(!this.addMode));
    document.getElementById('btn-cancel-add').addEventListener('click', () => this.setAddMode(false));

    // Floating overlay toolbar
    this._setupTextDragPlace();
    document.getElementById('fab-add-image').addEventListener('click', () => document.getElementById('decal-img-input').click());

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
      if (file) { this.addDecal(file); e.target.value = ''; }
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
    document.querySelector('.em-overlay').addEventListener('click', () =>
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
