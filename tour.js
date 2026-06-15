'use strict';

/* ════════════════════════════════════════════════════════════
   CONFIGURACIÓ DE LES ESCENES
   ════════════════════════════════════════════════════════════
   Per afegir fotos reals:  descomenta  image: 'images/nom.jpg'
   Per canviar hotspots:    edita l'array hotspots de cada escena

   TIPUS DE HOTSPOT:
     type: 'info'   → panell de text (title + content)
     type: 'video'  → modal amb YouTube/Vimeo o vídeo local
                      videoUrl: 'https://www.youtube.com/embed/ID'
                      videoUrl: 'videos/local.mp4'
     type: 'image'  → lightbox amb foto gran
                      imageUrl: 'images/foto.jpg'
                      caption: 'text peu de foto' (opcional)
     type: 'link'   → obre URL en nova pestanya
                      linkUrl: 'https://...'
                      linkDesc: 'descripció curta' (opcional)
     type: 'nav'    → navega a una altra escena
                      targetScene: 'id-de-l-escena'

   POSICIONAMENT:
     lon: graus de longitud  (-180 a 180)  ← esquerra/dreta
     lat: graus de latitud   (-85 a 85)    ↑ amunt / ↓ avall
   ════════════════════════════════════════════════════════════ */

const SCENES = [
  /* ── 1. Feina i Ocupació ──────────────────────────────── */
  {
    id: 'feina-ocupacio',
    name: 'Feina i Ocupació',
    color: '#0F6E56', shade: '#0a5040',
    // image: 'images/feina-ocupacio.jpg',
    hotspots: [
      {
        id: 'fo-1', lon: 30, lat: 8, type: 'info',
        title: 'Borsa de Treball',
        content: 'Accedeix a les ofertes de feina actualitzades diàriament. Servei personalitzat d\'orientació laboral per a persones en recerca de feina a la comarca de l\'Alt Camp.'
      },
      {
        id: 'fo-2', lon: -55, lat: 10, type: 'video',
        title: 'Presentació del servei',
        // Substitueix per l'embed real de YouTube: https://www.youtube.com/embed/ID_DEL_VIDEO
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'Vídeo de presentació dels serveis de Feina i Ocupació de Vallsgenera'
      },
      {
        id: 'fo-3', lon: -130, lat: 2, type: 'image',
        title: 'L\'equip de Feina i Ocupació',
        // Substitueix per la foto real: images/equip-feina.jpg
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
        caption: 'L\'equip de professionals de Feina i Ocupació de Vallsgenera'
      },
      {
        id: 'fo-4', lon: 100, lat: 5, type: 'link',
        title: 'Web de Vallsgenera',
        linkUrl: 'https://www.vallsgenera.cat',
        linkDesc: 'Visita el web oficial de Vallsgenera per a més informació sobre tots els serveis disponibles.'
      },
      {
        id: 'fo-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Anar a Formació',
        targetScene: 'formacio'
      }
    ]
  },

  /* ── 2. Formació ──────────────────────────────────────── */
  {
    id: 'formacio',
    name: 'Formació',
    color: '#1a7d63', shade: '#145e4a',
    // image: 'images/formacio.jpg',
    hotspots: [
      {
        id: 'fm-1', lon: -30, lat: 8, type: 'info',
        title: 'Cursos i Tallers',
        content: 'Àmplia oferta formativa: idiomes, ofimàtica, habilitats professionals, competències digitals i molt més. Formació presencial, semipresencial i en línia adaptada a les teves necessitats.'
      },
      {
        id: 'fm-2', lon: 60, lat: 5, type: 'video',
        title: 'Catàleg de cursos',
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'Descobreix tots els cursos disponibles a Vallsgenera'
      },
      {
        id: 'fm-3', lon: -110, lat: 3, type: 'image',
        title: 'Aula de formació',
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
        caption: 'Les aules de formació de Vallsgenera estan equipades amb tecnologia d\'última generació'
      },
      {
        id: 'fm-4', lon: 110, lat: 4, type: 'link',
        title: 'Inscripció a cursos',
        linkUrl: 'https://www.vallsgenera.cat',
        linkDesc: 'Inscriu-te als cursos de formació directament des del web de Vallsgenera.'
      },
      {
        id: 'fm-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Anar a Empresa i Emprenedoria',
        targetScene: 'empresa-emprenedoria'
      }
    ]
  },

  /* ── 3. Empresa i Emprenedoria ────────────────────────── */
  {
    id: 'empresa-emprenedoria',
    name: 'Empresa i Emprenedoria',
    color: '#0d5e48', shade: '#083d30',
    // image: 'images/empresa-emprenedoria.jpg',
    hotspots: [
      {
        id: 'ee-1', lon: 40, lat: 10, type: 'info',
        title: 'Assessorament Empresarial',
        content: 'Suport expert a nous projectes: pla de negoci, fonts de finançament, tràmits de constitució i estratègia de creixement sostenible. Acompanyament personalitzat en cada fase.'
      },
      {
        id: 'ee-2', lon: -40, lat: 5, type: 'video',
        title: 'Casos d\'èxit d\'emprenedors',
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'Emprenedors que han comptat amb el suport de Vallsgenera'
      },
      {
        id: 'ee-3', lon: -115, lat: 3, type: 'image',
        title: 'Incubadora d\'empreses',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        caption: 'L\'espai d\'incubació de Vallsgenera: on neixen les empreses del futur'
      },
      {
        id: 'ee-4', lon: 115, lat: 4, type: 'link',
        title: 'Oficina d\'empreses',
        linkUrl: 'https://www.vallsgenera.cat',
        linkDesc: 'Accedeix als tràmits i serveis per a empreses i autònoms a través del web de Vallsgenera.'
      },
      {
        id: 'ee-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Anar al Col·laboratori',
        targetScene: 'col-laboratori'
      }
    ]
  },

  /* ── 4. Col·laboratori ───────────────────────────────── */
  {
    id: 'col-laboratori',
    name: 'Col·laboratori',
    color: '#127566', shade: '#0d5550',
    // image: 'images/col-laboratori.jpg',
    hotspots: [
      {
        id: 'cl-1', lon: -20, lat: 8, type: 'info',
        title: 'Espai de Coworking',
        content: 'Espai de treball compartit equipat amb fibra òptica, sales de reunions, cabines de trucades i zona de relax. Disponible per hores, diàriament o amb abonament mensual.'
      },
      {
        id: 'cl-2', lon: 75, lat: 5, type: 'video',
        title: 'Tour per l\'espai coworking',
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'Descobreix l\'espai de coworking del Col·laboratori de Vallsgenera'
      },
      {
        id: 'cl-3', lon: -110, lat: 3, type: 'image',
        title: 'Sala de reunions',
        imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80',
        caption: 'La sala de reunions equipada amb videoconferència i presentació'
      },
      {
        id: 'cl-4', lon: 120, lat: 4, type: 'link',
        title: 'Reserva un espai',
        linkUrl: 'https://www.vallsgenera.cat',
        linkDesc: 'Reserva una taula de coworking, una cabina o la sala de reunions en línia.'
      },
      {
        id: 'cl-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Anar a Campus URV i Pacte',
        targetScene: 'campus-urv-pacte'
      }
    ]
  },

  /* ── 5. Campus URV i Pacte ───────────────────────────── */
  {
    id: 'campus-urv-pacte',
    name: 'Campus URV i Pacte',
    color: '#0b4f3c', shade: '#073328',
    // image: 'images/campus-urv-pacte.jpg',
    hotspots: [
      {
        id: 'cu-1', lon: -35, lat: 8, type: 'info',
        title: 'Campus URV Valls',
        content: 'Col·laboració estratègica amb la Universitat Rovira i Virgili. Programes de formació superior, recerca aplicada i transferència de coneixement al territori de l\'Alt Camp.'
      },
      {
        id: 'cu-2', lon: 65, lat: 5, type: 'video',
        title: 'Pacte Local per l\'Ocupació',
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'El Pacte Local per l\'Ocupació de Valls: un acord per al futur'
      },
      {
        id: 'cu-3', lon: -115, lat: 3, type: 'image',
        title: 'Instal·lacions Campus URV',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
        caption: 'Les instal·lacions universitàries al Campus de Valls'
      },
      {
        id: 'cu-4', lon: 120, lat: 4, type: 'link',
        title: 'Web URV Valls',
        linkUrl: 'https://www.urv.cat',
        linkDesc: 'Accedeix al web de la Universitat Rovira i Virgili per a informació sobre programes i matrícules.'
      },
      {
        id: 'cu-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Anar a Atenció i Tràmits',
        targetScene: 'atencio-tramits'
      }
    ]
  },

  /* ── 6. Atenció i Tràmits ────────────────────────────── */
  {
    id: 'atencio-tramits',
    name: 'Atenció i Tràmits',
    color: '#1c9070', shade: '#156850',
    // image: 'images/atencio-tramits.jpg',
    hotspots: [
      {
        id: 'at-1', lon: 30, lat: 8, type: 'info',
        title: 'Punt d\'Atenció Presencial',
        content: 'Servei d\'atenció personalitzada en horari d\'oficina. El nostre equip t\'orienta i t\'acompanya en tots els tràmits administratius, inscripcions i sol·licitud de serveis.'
      },
      {
        id: 'at-2', lon: -50, lat: 5, type: 'video',
        title: 'Com arribar a Vallsgenera',
        videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        caption: 'Localització i horaris d\'atenció de Vallsgenera'
      },
      {
        id: 'at-3', lon: -120, lat: 3, type: 'image',
        title: 'Recepció i sala d\'espera',
        imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
        caption: 'L\'espai d\'atenció al ciutadà de Vallsgenera'
      },
      {
        id: 'at-4', lon: 110, lat: 4, type: 'link',
        title: 'Tràmits en línia',
        linkUrl: 'https://www.vallsgenera.cat',
        linkDesc: 'Gestiona els teus tràmits des de casa: sol·licituds, inscripcions i documentació disponibles en línia 24h.'
      },
      {
        id: 'at-nav', lon: 175, lat: -10, type: 'nav',
        title: 'Tornar a l\'inici',
        targetScene: 'feina-ocupacio'
      }
    ]
  }
];


/* ════════════════════════════════════════════════════════════
   MOTORS – no cal modificar res a partir d'aquí
   ════════════════════════════════════════════════════════════ */

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1,3), 16),
    g: parseInt(hex.slice(3,5), 16),
    b: parseInt(hex.slice(5,7), 16)
  };
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

/* ── Hotspot SVG icons ── */
const HS_ICONS = {
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="13"/>
    <circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none"/></svg>`,

  video: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M8 5.14v14l11-7-11-7z"/></svg>`,

  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/></svg>`,

  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,

  nav: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polyline points="9 18 15 12 9 6"/></svg>`
};

/* ── Type badge labels ── */
const HS_BADGES = {
  video: 'Vídeo',
  image: 'Imatge',
  link:  'Enllaç'
};


/* ══════════════════════════════════════════════════════════ */
class VirtualTour {
/* ══════════════════════════════════════════════════════════ */

  constructor() {
    this.scenes        = SCENES;
    this.currentIndex  = 0;
    this.isTransitioning = false;

    // Three.js
    this.threeScene = null;
    this.camera     = null;
    this.renderer   = null;
    this.sphere     = null;

    // Camera state
    this.lon = 0; this.lat = 0; this.fov = 75;

    // Interaction
    this.pointerDown = false;
    this.startX = 0; this.startY  = 0;
    this.startLon = 0; this.startLat = 0;
    this.velLon = 0; this.velLat  = 0;
    this.userInteractedAt = 0;
    this.lastPinchDist = null;

    this.init();
  }

  /* ── Init ── */
  init() {
    this.setupThree();
    this.buildDots();
    this.setupEvents();
    this.loadScene(0, false);
    this.animate();
    setTimeout(() => document.getElementById('controls-hint')?.classList.add('hidden'), 5000);
  }

  /* ── Three.js ── */
  setupThree() {
    const container = document.getElementById('viewer-container');
    this.threeScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov, container.clientWidth / container.clientHeight, 0.1, 1000
    );
    this.camera.position.set(0, 0, 0.01);

    const canvas = document.getElementById('panorama-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const geo = new THREE.SphereGeometry(500, 64, 48);
    geo.scale(-1, 1, 1);
    this.sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0a1a14 }));
    this.threeScene.add(this.sphere);
  }

  /* ── Placeholder texture (canvas) ── */
  createPlaceholder(scene) {
    const W = 2048, H = 1024;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const { r, g, b }       = hexToRgb(scene.color);
    const { r:sr, g:sg, b:sb } = hexToRgb(scene.shade);

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   `rgb(${Math.min(r+22,255)},${Math.min(g+22,255)},${Math.min(b+22,255)})`);
    bg.addColorStop(0.5, `rgb(${r},${g},${b})`);
    bg.addColorStop(1,   `rgb(${sr},${sg},${sb})`);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Vignette
    const vig = ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,H*.9);
    vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.38)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1;
    for(let y=0;y<=H;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    for(let x=0;x<=W;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}

    // Ceiling / floor bands
    const ceil=ctx.createLinearGradient(0,0,0,180);
    ceil.addColorStop(0,`rgba(${Math.min(r+35,255)},${Math.min(g+35,255)},${Math.min(b+35,255)},.22)`);
    ceil.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ceil; ctx.fillRect(0,0,W,180);

    const floor=ctx.createLinearGradient(0,H-200,0,H);
    floor.addColorStop(0,'rgba(0,0,0,0)');
    floor.addColorStop(1,`rgba(${sr},${sg},${sb},.55)`);
    ctx.fillStyle=floor; ctx.fillRect(0,H-200,W,200);

    // Horizon
    ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,620); ctx.lineTo(W,620); ctx.stroke();

    // Simulated windows
    const drawWin=(x,y,w,h)=>{
      ctx.fillStyle='rgba(255,255,255,.07)';
      drawRoundRect(ctx,x,y,w,h,5); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=2;
      drawRoundRect(ctx,x,y,w,h,5); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w/2,y+h);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y+h/2);ctx.lineTo(x+w,y+h/2);ctx.stroke();
    };
    drawWin(90,310,210,270);
    drawWin(W-300,310,210,270);

    // Centre panel
    ctx.fillStyle='rgba(255,255,255,.06)';
    drawRoundRect(ctx,W/2-190,360,380,230,8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=2;
    drawRoundRect(ctx,W/2-190,360,380,230,8); ctx.stroke();

    // Text
    ctx.shadowColor='rgba(0,0,0,.5)'; ctx.shadowBlur=18; ctx.shadowOffsetY=3;
    ctx.fillStyle='rgba(255,255,255,.95)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font='bold 64px system-ui,sans-serif';
    ctx.fillText(scene.name, W/2, H/2-18);
    ctx.shadowBlur=0; ctx.shadowOffsetY=0;

    ctx.font='24px system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.5)';
    ctx.fillText('Tour Virtual · Vallsgenera', W/2, H/2+52);

    // Badge
    ctx.fillStyle='rgba(0,0,0,.3)';
    drawRoundRect(ctx, W/2-140,H/2+85,280,36,18); ctx.fill();
    ctx.font='14.5px system-ui,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.65)';
    ctx.fillText('Imatge de mostra · Foto real pendent', W/2, H/2+103);

    return new THREE.CanvasTexture(cv);
  }

  /* ── Load scene ── */
  loadScene(index, animate = true) {
    if (this.isTransitioning) return;
    if (index === this.currentIndex && animate) return;
    this.isTransitioning = true;
    const overlay = document.getElementById('transition-overlay');

    const doLoad = () => {
      this.currentIndex = index;
      const s = this.scenes[index];

      document.querySelectorAll('.dept-btn').forEach((b,i)=>b.classList.toggle('active',i===index));
      document.getElementById('scene-title').textContent = s.name;
      document.querySelectorAll('.scene-dot').forEach((d,i)=>d.classList.toggle('active',i===index));

      if (s.image) {
        const loader = new THREE.TextureLoader();
        loader.load(s.image,
          tex => this.applyTexture(tex, s),
          undefined,
          ()  => this.applyTexture(this.createPlaceholder(s), s)
        );
      } else {
        this.applyTexture(this.createPlaceholder(s), s);
      }
    };

    if (animate) {
      overlay.classList.add('active');
      setTimeout(() => {
        doLoad();
        setTimeout(() => { overlay.classList.remove('active'); this.isTransitioning = false; }, 280);
      }, 250);
    } else {
      doLoad();
      this.isTransitioning = false;
    }
  }

  applyTexture(tex, sceneData) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.sphere.material = new THREE.MeshBasicMaterial({ map: tex });
    this.sphere.material.needsUpdate = true;
    this.lon = 0; this.lat = 0; this.velLon = 0; this.velLat = 0;
    this.buildHotspots(sceneData);
    this.hideInfoPanel();
    this.closeLightbox();
  }

  /* ── Hotspots DOM ── */
  buildHotspots(sceneData) {
    const overlay = document.getElementById('hotspots-overlay');
    overlay.innerHTML = '';
    sceneData.hotspots.forEach(hs => {
      const el = document.createElement('div');
      el.className = `hotspot hotspot-${hs.type}`;
      el.dataset.lon = hs.lon;
      el.dataset.lat = hs.lat;

      const inner = document.createElement('div');
      inner.className = 'hotspot-inner';
      inner.innerHTML = HS_ICONS[hs.type] || HS_ICONS.info;

      const label = document.createElement('div');
      label.className = 'hotspot-label';
      label.textContent = hs.title;

      el.appendChild(inner);
      el.appendChild(label);
      overlay.appendChild(el);

      el.addEventListener('click', e => {
        e.stopPropagation();
        this.handleHotspot(hs);
      });
    });
  }

  handleHotspot(hs) {
    switch (hs.type) {
      case 'info':
        this.showInfoPanel(hs);
        break;
      case 'video':
        this.openLightboxVideo(hs);
        break;
      case 'image':
        this.openLightboxImage(hs);
        break;
      case 'link':
        this.openLightboxLink(hs);
        break;
      case 'nav': {
        const idx = this.scenes.findIndex(s => s.id === hs.targetScene);
        if (idx >= 0) this.loadScene(idx);
        break;
      }
    }
  }

  updateHotspots() {
    const container = document.getElementById('viewer-container');
    const W = container.clientWidth, H = container.clientHeight;
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);

    document.querySelectorAll('.hotspot').forEach(el => {
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
      if (dot < 0.15) { el.style.display='none'; return; }

      const pos = dir.clone().multiplyScalar(500);
      pos.project(this.camera);
      el.style.display  = 'block';
      el.style.left     = `${(pos.x+1)/2*W}px`;
      el.style.top      = `${-(pos.y-1)/2*H}px`;
      el.style.opacity  = Math.min(1,(dot-.15)/.25);
    });
  }

  /* ── Info panel ── */
  showInfoPanel(hs) {
    document.getElementById('info-title').textContent   = hs.title;
    document.getElementById('info-content').textContent = hs.content;
    document.getElementById('info-panel').classList.add('visible');
  }
  hideInfoPanel() {
    document.getElementById('info-panel').classList.remove('visible');
  }

  /* ── Lightbox helpers ── */
  _lbOpen(title, type) {
    const badge = document.getElementById('lb-type-badge');
    badge.textContent  = HS_BADGES[type] || '';
    badge.className    = `lb-type-badge badge-${type}`;
    document.getElementById('lb-title').textContent = title;
    document.getElementById('lb-caption').textContent = '';
    document.getElementById('lightbox').classList.add('visible');
  }

  openLightboxVideo(hs) {
    this._lbOpen(hs.title, 'video');
    const body = document.getElementById('lb-body');
    body.className = 'lb-video';
    const isEmbed = /youtube\.com\/embed|player\.vimeo\.com/.test(hs.videoUrl);
    if (isEmbed) {
      const iframe = document.createElement('iframe');
      iframe.src = hs.videoUrl + (hs.videoUrl.includes('?') ? '&' : '?') + 'autoplay=1';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      body.appendChild(iframe);
    } else {
      const video = document.createElement('video');
      video.src = hs.videoUrl; video.controls = true; video.autoplay = true;
      body.appendChild(video);
    }
    if (hs.caption) document.getElementById('lb-caption').textContent = hs.caption;
  }

  openLightboxImage(hs) {
    this._lbOpen(hs.title, 'image');
    const body = document.getElementById('lb-body');
    body.className = 'lb-image';
    const img = document.createElement('img');
    img.src = hs.imageUrl; img.alt = hs.title;
    body.appendChild(img);
    if (hs.caption) document.getElementById('lb-caption').textContent = hs.caption;
  }

  openLightboxLink(hs) {
    this._lbOpen(hs.title, 'link');
    const body = document.getElementById('lb-body');
    body.className = 'lb-link';
    body.innerHTML = `
      <div class="lb-link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <p class="lb-link-desc">${hs.linkDesc || hs.title}</p>
      <a class="lb-link-btn" href="${hs.linkUrl}" target="_blank" rel="noopener noreferrer">
        Visitar l'enllaç
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>`;
  }

  closeLightbox() {
    document.getElementById('lightbox').classList.remove('visible');
    // Stop media
    const body = document.getElementById('lb-body');
    body.innerHTML = '';
    body.className = '';
  }

  /* ── Scene dots ── */
  buildDots() {
    const container = document.getElementById('scene-dots');
    this.scenes.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'scene-dot' + (i===0 ? ' active' : '');
      dot.setAttribute('aria-label', s.name);
      dot.addEventListener('click', () => this.loadScene(i));
      container.appendChild(dot);
    });
  }

  /* ── Events ── */
  setupEvents() {
    const canvas = document.getElementById('panorama-canvas');

    canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
    canvas.addEventListener('pointermove', e => this.onPointerMove(e));
    canvas.addEventListener('pointerup',   () => this.onPointerUp());
    canvas.addEventListener('pointerleave',() => this.onPointerUp());
    canvas.addEventListener('touchstart',  e => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove',   e => this.onTouchMove(e),  { passive: false });
    canvas.addEventListener('touchend',    () => { this.lastPinchDist = null; });
    canvas.addEventListener('wheel',       e => this.onWheel(e), { passive: false });

    window.addEventListener('keydown', e => this.onKeyDown(e));

    document.getElementById('info-close').addEventListener('click', () => this.hideInfoPanel());
    document.getElementById('prev-scene').addEventListener('click', () => this.prevScene());
    document.getElementById('next-scene').addEventListener('click', () => this.nextScene());
    document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
    document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

    document.querySelectorAll('.dept-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadScene(parseInt(btn.dataset.index, 10));
        this.closeSidebar();
      });
    });

    // Lightbox close
    document.getElementById('lb-close').addEventListener('click', () => this.closeLightbox());
    document.querySelector('.lb-overlay').addEventListener('click', () => this.closeLightbox());

    // Mode posicionament
    document.getElementById('pos-trigger').addEventListener('click', () => this.togglePosMode());
    document.getElementById('pos-copy-btn').addEventListener('click', () => this.copyPosition());
    document.getElementById('pos-close-btn').addEventListener('click', () => this.setPosMode(false));

    // Click outside panels
    document.getElementById('viewer-container').addEventListener('click', e => {
      if (!e.target.closest('#info-panel') && !e.target.closest('.hotspot')) this.hideInfoPanel();
    });

    window.addEventListener('resize', () => this.onResize());
  }

  onPointerDown(e) {
    this.pointerDown=true;
    this.startX=e.clientX; this.startY=e.clientY;
    this.startLon=this.lon; this.startLat=this.lat;
    this.velLon=0; this.velLat=0;
    this.userInteractedAt=performance.now();
  }
  onPointerMove(e) {
    if (!this.pointerDown) return;
    const dx=e.clientX-this.startX, dy=e.clientY-this.startY;
    const nl=this.startLon-dx*.22, na=this.startLat+dy*.22;
    this.velLon=(nl-this.lon)*.4; this.velLat=(na-this.lat)*.4;
    this.lon=nl; this.lat=na;
    this.userInteractedAt=performance.now();
  }
  onPointerUp() { this.pointerDown=false; }

  onTouchStart(e) {
    if (e.touches.length===2) { e.preventDefault(); this.lastPinchDist=this.pinchDist(e.touches); }
  }
  onTouchMove(e) {
    if (e.touches.length===2 && this.lastPinchDist!==null) {
      e.preventDefault();
      const d=this.pinchDist(e.touches);
      this.fov=Math.max(30,Math.min(100,this.fov+(this.lastPinchDist-d)*.12));
      this.camera.fov=this.fov; this.camera.updateProjectionMatrix();
      this.lastPinchDist=d; this.userInteractedAt=performance.now();
    }
  }
  pinchDist(t) { return Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY); }

  onWheel(e) {
    e.preventDefault();
    this.fov=Math.max(30,Math.min(100,this.fov+e.deltaY*.05));
    this.camera.fov=this.fov; this.camera.updateProjectionMatrix();
    this.userInteractedAt=performance.now();
  }

  onKeyDown(e) {
    const step=5;
    if(e.key==='ArrowLeft')  {this.lon-=step; this.userInteractedAt=performance.now()}
    if(e.key==='ArrowRight') {this.lon+=step; this.userInteractedAt=performance.now()}
    if(e.key==='ArrowUp')    {this.lat=Math.min(85,this.lat+step); this.userInteractedAt=performance.now()}
    if(e.key==='ArrowDown')  {this.lat=Math.max(-85,this.lat-step); this.userInteractedAt=performance.now()}
    if(e.key==='Escape')     {this.hideInfoPanel(); this.closeSidebar(); this.closeLightbox(); this.setPosMode(false)}
    if(e.key==='p'||e.key==='P') {this.togglePosMode()}
    if(e.key==='+'||e.key==='='){this.fov=Math.max(30,this.fov-5); this.camera.fov=this.fov; this.camera.updateProjectionMatrix()}
    if(e.key==='-')            {this.fov=Math.min(100,this.fov+5); this.camera.fov=this.fov; this.camera.updateProjectionMatrix()}
    const n=parseInt(e.key,10); if(n>=1&&n<=6) this.loadScene(n-1);
  }

  prevScene() { this.loadScene((this.currentIndex-1+this.scenes.length)%this.scenes.length); }
  nextScene() { this.loadScene((this.currentIndex+1)%this.scenes.length); }

  /* ── Mode posicionament ── */
  togglePosMode() { this.setPosMode(!this._posMode); }

  setPosMode(on) {
    this._posMode = on;
    document.getElementById('pos-mode').classList.toggle('hidden', !on);
    document.getElementById('pos-trigger').classList.toggle('active', on);
  }

  updatePosDisplay() {
    if (!this._posMode) return;
    const lon = ((this.lon % 360) + 360) % 360;
    const displayLon = lon > 180 ? lon - 360 : lon;
    document.getElementById('pos-lon').textContent = displayLon.toFixed(1);
    document.getElementById('pos-lat').textContent = this.lat.toFixed(1);
  }

  copyPosition() {
    const lon = ((this.lon % 360) + 360) % 360;
    const displayLon = lon > 180 ? lon - 360 : lon;
    const snippet =
`{ id: 'hs-nou', lon: ${displayLon.toFixed(1)}, lat: ${this.lat.toFixed(1)}, type: 'info',
  title: 'Títol del hotspot',
  content: 'Descripció del hotspot.' },`;
    navigator.clipboard.writeText(snippet).then(() => {
      const toast = document.getElementById('pos-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    });
  }

  toggleSidebar() {
    const sb=document.getElementById('sidebar');
    const ov=document.getElementById('sidebar-overlay');
    const open=sb.classList.toggle('open');
    ov.classList.toggle('visible',open);
  }
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('visible');
  }
  toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  }
  onResize() {
    const c=document.getElementById('viewer-container');
    this.camera.aspect=c.clientWidth/c.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(c.clientWidth,c.clientHeight);
  }

  /* ── Animation loop ── */
  animate() {
    requestAnimationFrame(()=>this.animate());
    this.update();
    this.renderer.render(this.threeScene, this.camera);
  }

  update() {
    if (!this.pointerDown) {
      this.lon+=this.velLon; this.lat+=this.velLat;
      this.velLon*=.93; this.velLat*=.93;
      if (performance.now()-this.userInteractedAt > 3000) this.lon+=.018;
    }
    this.lat=Math.max(-85,Math.min(85,this.lat));
    const phi   = THREE.MathUtils.degToRad(90-this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);
    this.camera.lookAt(
      Math.sin(phi)*Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi)*Math.sin(theta)
    );
    this.updateHotspots();
    this.updatePosDisplay();
  }
}

/* ── Boot ── */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE === 'undefined') {
    document.getElementById('loading').innerHTML =
      '<p style="color:white;padding:24px;text-align:center;line-height:1.7">' +
      'Error: no s\'ha pogut carregar Three.js.<br>' +
      'Comprova la connexió a internet i actualitza la pàgina.</p>';
    return;
  }

  // Si hi ha dades del Studio (localStorage), sobreescriu les escenes per defecte
  try {
    const saved = localStorage.getItem('vg-tour-scenes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        SCENES.length = 0;
        parsed.forEach(s => SCENES.push(s));
      }
    }
  } catch(e) {}

  // Intenta llegir scenes.json (funciona en servidor HTTP / GitHub Pages)
  fetch('scenes.json')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        SCENES.length = 0;
        data.forEach(s => SCENES.push(s));
      }
    })
    .catch(() => {}) // silencia l'error en file://
    .finally(() => {
      setTimeout(() => {
        window.tour = new VirtualTour();
        document.getElementById('loading').classList.add('hidden');
      }, 500);
    });
});
