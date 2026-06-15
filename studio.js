'use strict';
/* ════════════════════════════════════════════════════════════
   Vallsgenera Studio – Editor visual de tour
   ════════════════════════════════════════════════════════════ */

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

    case 'video':
      return `<div class="pp-field">
        <label>Font del vídeo</label>
        <div class="video-source-tabs">
          <button class="vsrc-tab ${!hs.videoLocal ? 'active' : ''}" data-src="web">YouTube / Vimeo</button>
          <button class="vsrc-tab ${hs.videoLocal ? 'active' : ''}" data-src="local">Fitxer local</button>
        </div>
      </div>
      <div id="hs-video-web" class="pp-field" ${hs.videoLocal ? 'style="display:none"' : ''}>
        <label>URL embed</label>
        <input type="text" id="hs-videoUrl" placeholder="https://www.youtube.com/embed/ID" value="${hs.videoLocal ? '' : (hs.videoUrl || '')}">
        <p class="field-hint">youtube.com/embed/ID_VIDEO &nbsp;·&nbsp; player.vimeo.com/video/ID</p>
      </div>
      <div id="hs-video-local" class="pp-field" ${!hs.videoLocal ? 'style="display:none"' : ''}>
        <label>Ruta del vídeo</label>
        <input type="text" id="hs-videoLocal" placeholder="videos/nom-video.mp4" value="${hs.videoLocal || ''}">
        <p class="field-hint">Posa el fitxer a la carpeta <code>videos/</code> del repositori</p>
      </div>
      <div class="pp-field">
        <label>Peu de vídeo <span class="label-hint">(opcional)</span></label>
        <input type="text" id="hs-caption" placeholder="Descripció del vídeo" value="${hs.caption || ''}">
      </div>` + iconPickerHTML(hs.icon);

    case 'image':
      return `<div class="pp-field">
        <label>URL o ruta de la imatge</label>
        <input type="text" id="hs-imageUrl" placeholder="images/foto.jpg  o  https://..." value="${hs.imageUrl || ''}">
      </div>
      <div class="pp-field">
        <label>Peu de foto <span class="label-hint">(opcional)</span></label>
        <input type="text" id="hs-caption" placeholder="Descripció de la imatge" value="${hs.caption || ''}">
      </div>` + iconPickerHTML(hs.icon);

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
    this.addMode = false;
    this._photoUrls = {}; // sceneId → objectURL (preview)

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
  init() {
    this.loadData();
    this.setupThree();
    this.renderSceneList();
    this.switchScene(0, false);
    this.setupEvents();
    this.animate();
  }

  /* ── Data (localStorage) ── */
  loadData() {
    const saved = localStorage.getItem('vg-studio-scenes');
    if (saved) {
      try { this.scenes = JSON.parse(saved); return; } catch(e) {}
    }
    // First run: use tour.js DEFAULT SCENES
    if (typeof SCENES !== 'undefined') {
      this.scenes = JSON.parse(JSON.stringify(SCENES));
    } else {
      this.scenes = [{ id: 'escena-1', name: 'Escena 1', color: '#0F6E56', shade: '#0a5040', hotspots: [] }];
    }
  }

  saveData() {
    localStorage.setItem('vg-studio-scenes', JSON.stringify(this.scenes));
    // Also expose to tour (same origin)
    localStorage.setItem('vg-tour-scenes', JSON.stringify(this.scenes));
    this.showToast('Guardat correctament');
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

  /* ── Switch scene ── */
  switchScene(idx, animate = true) {
    this.currentIdx = idx;
    const s = this.currentScene;
    this.selectedHsId = null;

    // Reset camera
    this.lon = 0; this.lat = 0; this.velLon = 0; this.velLat = 0;

    this.loadTexture(s);
    this.renderHotspots();
    this.renderSceneList();
    this.renderPropsPanel();

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
      item.className = 'scene-item' + (i === this.currentIdx ? ' active' : '');
      item.innerHTML = `
        <div class="scene-color-dot" style="background:${s.color}">
          ${s.image || this._photoUrls[s.id] ? '📷' : ''}
        </div>
        <div class="scene-item-name">${s.name}</div>
        <div class="scene-item-count">${s.hotspots.length} hotspot${s.hotspots.length !== 1 ? 's' : ''}</div>
      `;
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
        const chev = `<svg class="s-nav-chevron" viewBox="0 0 24 10" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,9 12,1 23,9"/></svg>`;
        el.innerHTML = `<div class="s-nav-ring">${chev}${chev}${chev}</div>
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

      el.addEventListener('click', e => { e.stopPropagation(); this.selectHotspot(hs.id); });
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
    document.getElementById('prop-image-path').value = s.image || '';
    document.getElementById('photo-name').textContent =
      this._photoUrls[s.id]
        ? (s._photoFilename || 'Foto carregada')
        : (s.image ? `Ruta: ${s.image}` : 'Arrossega o clica per seleccionar');

    // Hotspot mini list
    this.renderHsMiniList();

    document.getElementById('scene-props-section').classList.remove('hidden');
    document.getElementById('hs-props-section').classList.add('hidden');
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
      const localActive = document.querySelector('.vsrc-tab.active[data-src="local"]');
      if (localActive) {
        data.videoLocal = readField('hs-videoLocal');
        data.videoUrl = '';
      } else {
        data.videoUrl = readField('hs-videoUrl');
        data.videoLocal = '';
      }
      data.caption = readField('hs-caption');
    }
    if (type === 'image') { data.imageUrl = readField('hs-imageUrl'); data.caption = readField('hs-caption'); }
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

    // Desat PERSISTENT a IndexedDB (sobreviu a recàrregues i el llegeix el Tour)
    PhotoStore.put(s.id, file).then(() => {
      this.saveData();          // sincronitza metadades amb el Tour
      this.renderSceneList();
      this.showToast('Foto desada — visible al Tour');
    }).catch(() => {
      this.showToast('Foto carregada (només preview, no s\'ha pogut desar)');
    });
  }

  /* ── Save scene props ── */
  saveSceneProps() {
    const s = this.currentScene;
    s.name  = document.getElementById('prop-name').value.trim() || s.name;
    s.color = document.getElementById('prop-color').value;
    s.shade = this.darkenHex(s.color, 20);
    s.image = document.getElementById('prop-image-path').value.trim() || undefined;
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
      // Si no hi ha foto a IndexedDB, es manté el que hi hagi a copy.image
      // (per exemple una ruta o un data URI ja existent).
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
    document.getElementById('btn-save').addEventListener('click', () => {
      this.saveSceneProps();
      this.saveData();
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
      this.currentScene.image = e.target.value.trim() || undefined;
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
        return;
      }
      const shapePill = e.target.closest('.shape-pill');
      if (shapePill) {
        document.querySelectorAll('.shape-pill').forEach(p => p.classList.remove('active'));
        shapePill.classList.add('active');
        this.livePreviewText();
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
        return;
      }
    });
    // Preview en directe mentre es canvien sliders / colors / checkboxes
    dynFields.addEventListener('input', () => {
      const activeType = document.querySelector('.type-pill.active')?.dataset.type;
      if (activeType === 'text') this.livePreviewText();
    });

    // Hotspot props: type pills
    document.getElementById('hs-type-pills').addEventListener('click', e => {
      const pill = e.target.closest('.type-pill');
      if (!pill) return;
      document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const hs = this.currentScene.hotspots.find(h => h.id === this.selectedHsId);
      document.getElementById('hs-dynamic-fields').innerHTML =
        dynamicFields(pill.dataset.type, hs || {}, this.scenes, this.currentScene.id);
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
    this.renderer.render(this.threeScene, this.camera);
  }
}

/* ── Boot ── */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE === 'undefined') {
    alert('Error: no s\'ha pogut carregar Three.js. Comprova la connexió.');
    return;
  }
  window.studio = new Studio();
});
