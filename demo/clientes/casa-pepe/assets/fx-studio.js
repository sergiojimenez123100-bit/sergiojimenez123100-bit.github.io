/* =========================================================
   FX · Estudio configurador (común a todas las maquetas)
   <section class="fx-studio" data-scene="coche"><script type="application/json">{eyebrow,title,sub,cta}</script></section>
   Cada escena vive en _motor/escenas/<nombre>.js y se registra en FXSTUDIO.scenes.
   Recibe ctx = { stage, ui, FX, studio, data } y construye su mundo + sus opciones.
   ========================================================= */
(() => {
  if (window.FXSTUDIO) return;
  const T = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
  // Equipos modestos (móvil, pocos núcleos o poca memoria): menos resolución y sin sombras
  const LOW = matchMedia('(max-width:760px)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
  let threeP = null;
  const S = window.FXSTUDIO = {
    scenes: {},
    // Three.js y sus complementos (módulos ES desde jsDelivr, sin importmap)
    three() {
      return threeP || (threeP = Promise.all([
        import(T + '+esm'), import(T + 'examples/jsm/controls/OrbitControls.js/+esm'), import(T + 'examples/jsm/environments/RoomEnvironment.js/+esm'),
        import(T + 'examples/jsm/loaders/GLTFLoader.js/+esm'), import(T + 'examples/jsm/loaders/DRACOLoader.js/+esm')
      ]).then(([THREE, oc, re, gl, dr]) => ({ THREE, OrbitControls: oc.OrbitControls, RoomEnvironment: re.RoomEnvironment, GLTFLoader: gl.GLTFLoader, DRACOLoader: dr.DRACOLoader, DRACO: T + 'examples/jsm/libs/draco/gltf/' })));
    },
    // Escenario 3D listo: render, cámara, controles, entorno, bucle que se pausa fuera de pantalla
    async world(stage, o = {}) {
      const L = await S.three(), { THREE } = L;
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: !!o.alpha, preserveDrawingBuffer: true });
      r.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1.25 : 2)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = o.exposure || 1;
      r.shadowMap.enabled = !!o.shadows && !LOW; r.shadowMap.type = THREE.PCFSoftShadowMap;
      stage.appendChild(r.domElement);
      const scene = new THREE.Scene();
      if (o.bg) scene.background = new THREE.Color(o.bg);
      if (o.fog) scene.fog = new THREE.Fog(o.fog[0], o.fog[1], o.fog[2]);
      const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new L.RoomEnvironment(r), .04).texture;
      const cam = new THREE.PerspectiveCamera(o.fov || 40, 1, .1, 200); cam.position.set(...(o.cam || [4, 2, 6]));
      const ctl = new L.OrbitControls(cam, r.domElement);
      Object.assign(ctl, { enableDamping: true, dampingFactor: .06, enablePan: false, autoRotate: o.autoRotate !== false, autoRotateSpeed: o.autoRotateSpeed || .6, minDistance: o.minD || 2, maxDistance: o.maxD || 14, maxPolarAngle: o.maxPolar || Math.PI / 2.08 });
      ctl.target.set(...(o.target || [0, .5, 0])); ctl.update();
      ['pointerdown', 'wheel'].forEach(ev => r.domElement.addEventListener(ev, () => ctl.autoRotate = false, { passive: true }));
      ctl.enableZoom = false; // la rueda sigue moviendo la página; para acercar están las vistas de cámara
      const size = () => { const w = stage.clientWidth, h = stage.clientHeight || 1; r.setSize(w, h, false); r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; cam.aspect = w / h; cam.updateProjectionMatrix(); };
      new ResizeObserver(size).observe(stage); size();
      const fns = []; let vis = true, t0 = performance.now();
      new IntersectionObserver(es => vis = es[0].isIntersecting).observe(stage);
      const clock = new THREE.Clock();
      r.setAnimationLoop(() => { if (!vis || document.hidden) return; const dt = Math.min(.05, clock.getDelta()), t = (performance.now() - t0) / 1000; fns.forEach(f => f(dt, t)); ctl.update(); r.render(scene, cam); });
      const W = { ...L, LOW, renderer: r, scene, camera: cam, controls: ctl, onFrame: f => fns.push(f) };
      // Mover la cámara con suavidad a un punto de vista
      W.view = (pos, target, d = 1.4) => { ctl.autoRotate = false; const g = window.gsap; if (!g) { cam.position.set(...pos); ctl.target.set(...target); return; } g.to(cam.position, { x: pos[0], y: pos[1], z: pos[2], duration: d, ease: 'power3.inOut' }); g.to(ctl.target, { x: target[0], y: target[1], z: target[2], duration: d, ease: 'power3.inOut' }); };
      // Textura de lienzo (letreros, matrículas, suelos procedurales)
      W.canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
      W.snapshot = () => { r.render(scene, cam); return r.domElement.toDataURL('image/jpeg', .9); };
      return W;
    },
    // ---------- Realismo: entornos 360° reales, modelos y texturas fotográficas (Poly Haven, CC0) ----------
    PH: 'https://dl.polyhaven.org/file/ph-assets/',
    // Carga un HDRI: ilumina la escena y, con ground, lo proyecta como suelo/fondo real
    async hdri(W, id, o = {}) {
      const { THREE } = W, res = o.res || '1k';
      const { RGBELoader } = await import(T + 'examples/jsm/loaders/RGBELoader.js/+esm');
      W._hdr = W._hdr || {};
      const tex = W._hdr[id + res] || (W._hdr[id + res] = await new RGBELoader().loadAsync(S.PH + 'HDRIs/hdr/' + res + '/' + id + '_' + res + '.hdr'));
      tex.mapping = THREE.EquirectangularReflectionMapping;
      W.scene.environment = tex;
      if (W._sky) { W.scene.remove(W._sky); W._sky = null; }
      if (o.ground) {
        const { GroundProjectedSkybox } = await import(T + 'examples/jsm/objects/GroundProjectedSkybox.js/+esm');
        const sky = new GroundProjectedSkybox(tex, { height: o.height || 4, radius: o.radius || 60 });
        sky.scale.setScalar(o.radius || 60); if (o.rotate) sky.rotation.y = o.rotate; W.scene.add(sky); W._sky = sky; W.scene.background = null;
      } else if (o.background) { W.scene.background = tex; W.scene.backgroundBlurriness = o.blur || 0; }
      if (o.rotate) { W.scene.environmentRotation && W.scene.environmentRotation.set(0, o.rotate, 0); }
      if (o.intensity != null) W.scene.environmentIntensity = o.intensity;
      return tex;
    },
    // Modelo glTF de Poly Haven escalado a una medida (size = lado mayor en metros) y apoyado en el suelo
    async model(W, id, o = {}) {
      const L = await S.three(); if (!W._gl) { const M = new L.THREE.LoadingManager(); M.setURLModifier(u => u.replace(/Models\/gltf\/(\w+)\/([^/]+)\/textures\//, 'Models/jpg/$1/$2/')); W._gl = new L.GLTFLoader(M); }
      const g = await W._gl.loadAsync(S.PH + 'Models/gltf/1k/' + id + '/' + id + '_1k.gltf');
      const m = g.scene, box = new L.THREE.Box3().setFromObject(m), sz = box.getSize(new L.THREE.Vector3());
      if (o.size) m.scale.multiplyScalar(o.size / Math.max(sz.x, sz.y, sz.z));
      if (o.height) m.scale.multiplyScalar(o.height / sz.y);
      const b2 = new L.THREE.Box3().setFromObject(m), c = b2.getCenter(new L.THREE.Vector3());
      const wrap = new L.THREE.Group(); m.position.set(-c.x, -b2.min.y, -c.z); wrap.add(m);
      m.traverse(n => { if (n.isMesh) { n.castShadow = n.receiveShadow = true; } });
      wrap.userData.size = b2.getSize(new L.THREE.Vector3());
      return wrap;
    },
    // Material PBR con texturas fotográficas (diffuse + normal + rugosidad)
    pbr(W, id, rep = [2, 2], o = {}) {
      const { THREE } = W, tl = new THREE.TextureLoader(), base = S.PH + 'Textures/jpg/1k/' + id + '/' + id + '_';
      const ld = (s, srgb) => { const t = tl.load(base + s + '_1k.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
      return new THREE.MeshStandardMaterial(Object.assign({ map: ld('diff', true), normalMap: ld('nor_gl'), roughnessMap: ld('rough'), roughness: 1 }, o));
    },
    // ---------- Asistente de chat: entiende lo que escribe el cliente y responde con una solución clara ----------
    // kb: [{ k:[palabras], t:'Título', a:'respuesta', u:'alta|media|baja', p:'precio', d:'tiempo', on:fn }]
    chat(stage, ui, o) {
      const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const box = document.createElement('div'); box.className = 'sd-chat';
      box.innerHTML = '<button type="button" class="sc-fab"><i>💬</i><span>' + (o.fab || '¿Qué le pasa?') + '</span></button><div class="sc-win" hidden><header><i>' + (o.avatar || '🤖') + '</i><div><b>' + (o.name || 'Asistente') + '</b><small>responde al momento</small></div><button type="button" class="sc-x" aria-label="Cerrar">×</button></header><div class="sc-body"></div><div class="sc-quick"></div><form class="sc-in"><input placeholder="' + (o.placeholder || 'Escribe qué le pasa…') + '" aria-label="Mensaje"><button type="submit">➤</button></form></div>';
      stage.appendChild(box);
      const win = box.querySelector('.sc-win'), body = box.querySelector('.sc-body'), quick = box.querySelector('.sc-quick'), input = box.querySelector('input');
      const msg = (html, who) => { const m = document.createElement('div'); m.className = 'sc-m ' + who; m.innerHTML = html; body.appendChild(m); body.scrollTop = body.scrollHeight; if (window.gsap) gsap.from(m, { y: 14, opacity: 0, duration: .35 }); return m; };
      const wa = String(o.FX.BIZ.whatsapp || o.FX.BIZ.telefono || '').replace(/\D/g, ''), num = wa.length === 9 ? '34' + wa : wa;
      const URG = { alta: ['🔴', 'Urgente'], media: ['🟠', 'Pronto'], baja: ['🟢', 'Sin prisa'] };
      const reply = async text => {
        msg(o.FX.esc(text), 'me'); input.value = '';
        const typing = msg('<i class="sc-dots"><b></b><b></b><b></b></i>', 'bot'); await new Promise(r => setTimeout(r, 900));
        typing.remove();
        const t = norm(text); let best = null, sc = 0;
        o.kb.forEach(e => { const s = e.k.reduce((a, k) => a + (t.includes(norm(k)) ? k.length : 0), 0); if (s > sc) { sc = s; best = e; } });
        if (!best) { msg((o.unknown || 'No lo tengo claro con esa descripción. Cuéntanos un poco más o escríbenos y te lo miramos sin compromiso.') + '<a class="sc-wa" target="_blank" rel="noopener" href="https://wa.me/' + num + '?text=' + encodeURIComponent((o.waIntro || 'Hola, os escribo desde la web: ') + text) + '">Hablar con una persona</a>', 'bot'); return; }
        const u = URG[best.u] || URG.media;
        msg('<b class="sc-t">' + best.t + '</b><span class="sc-u u-' + (best.u || 'media') + '">' + u[0] + ' ' + u[1] + '</span><p>' + best.a + '</p>' + (best.p || best.d ? '<div class="sc-pd">' + (best.p ? '<span>💶 ' + best.p + '</span>' : '') + (best.d ? '<span>⏱️ ' + best.d + '</span>' : '') + '</div>' : '') + '<a class="sc-wa" target="_blank" rel="noopener" href="https://wa.me/' + num + '?text=' + encodeURIComponent((o.waIntro || 'Hola, os escribo desde la web: ') + text + ' (' + best.t + ')') + '">' + (o.cta || 'Pedir cita ahora') + '</a>', 'bot');
        ui.set(o.label || 'Problema', best.t); if (best.on) best.on();
      };
      box.querySelector('.sc-fab').onclick = () => { win.hidden = !win.hidden; box.classList.toggle('open', !win.hidden); if (!win.hidden && !body.children.length) msg(o.hello || 'Hola 👋 Cuéntame qué pasa y te digo qué puede ser, cuánto cuesta y qué hacer ahora.', 'bot'); if (!win.hidden) input.focus({ preventScroll: true }); };
      box.querySelector('.sc-x').onclick = () => { win.hidden = true; box.classList.remove('open'); };
      box.querySelector('form').onsubmit = e => { e.preventDefault(); const v = input.value.trim(); if (v) reply(v); };
      quick.innerHTML = (o.quick || []).map(q => '<button type="button">' + q + '</button>').join('');
      quick.onclick = e => { const b = e.target.closest('button'); if (b) { if (win.hidden) box.querySelector('.sc-fab').click(); reply(b.textContent); } };
      box.addEventListener('pointerdown', e => e.stopPropagation()); box.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
      return { open: () => { if (win.hidden) box.querySelector('.sc-fab').click(); }, ask: q => { if (win.hidden) box.querySelector('.sc-fab').click(); reply(q); } };
    },
    // Consulta con foto real (Unsplash): fondo difuminado, foto con escaneo, marcador de zona, pie, tarjeta y panel oscuro
    img: (id, w = 1400) => /^https?:/.test(id) ? id : 'https://images.unsplash.com/photo-' + id + '?w=' + w + '&q=80&auto=format&fit=crop',
    photo(stage, ui, o = {}) {
      stage.classList.add('light');
      stage.insertAdjacentHTML('beforeend', '<div class="sd-dom vt-room' + (o.full ? ' vt-full' : '') + '"><div class="vt-bg"></div><figure class="vt-photo"><img alt=""><div class="vt-scan"></div><span class="vt-zone" hidden><i></i><b></b></span><figcaption hidden><b></b><small></small></figcaption></figure></div>');
      const room = stage.lastElementChild, img = room.querySelector('.vt-photo img'), bg = room.querySelector('.vt-bg'), g = window.gsap, S = this;
      let cur = '';
      const api = {
        room, img,
        show(id, filter = '') {
          const url = S.img(id); img.style.filter = filter; if (url === cur) return Promise.resolve(); cur = url;
          ui.hint('Cargando foto…');
          return new Promise(res => { const pre = new Image(); pre.onload = pre.onerror = () => { if (url !== cur) return res(); img.src = url; bg.style.backgroundImage = 'url(' + url + ')'; ui.hint(''); if (g) { g.fromTo(img, { scale: 1.12, opacity: 0 }, { scale: 1.04, opacity: 1, duration: 1, ease: 'power2.out' }); g.fromTo(room.querySelector('.vt-scan'), { yPercent: -100, opacity: 1 }, { yPercent: 100, opacity: 0, duration: 1.6, ease: 'power1.inOut' }); } res(); }; pre.src = url; });
        },
        zone(label, x = 50, y = 45) { const z = room.querySelector('.vt-zone'); z.hidden = !label; if (!label) return; z.style.left = x + '%'; z.style.top = y + '%'; z.querySelector('b').textContent = label; if (g) g.fromTo(z, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' }); },
        caption(t, s) { const c = room.querySelector('figcaption'); c.hidden = !t; c.querySelector('b').textContent = t || ''; c.querySelector('small').textContent = s || ''; },
        card(html) { let c = room.querySelector('.vt-card'); if (!c) { c = document.createElement('div'); c.className = 'vt-card'; room.appendChild(c); } c.innerHTML = html; return c; },
        box(html) { let c = room.querySelector('.vt-mon'); if (!c) { c = document.createElement('div'); c.className = 'vt-mon'; room.appendChild(c); } if (html != null) c.innerHTML = html; return c; }
      };
      return api;
    },
    // Ayudas para escenas 2D: lienzo SVG que llena el escenario y creador de nodos
    svgStage(stage, vb = '0 0 800 500', bg) {
      if (bg) stage.style.background = bg;
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('preserveAspectRatio', 'xMidYMid meet'); stage.prepend(s); return s;
    },
    el(tag, attrs = {}, parent, html) {
      const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); if (html != null) n.innerHTML = html; if (parent) parent.appendChild(n); return n;
    },
    mount(sec, FX) {
      if (sec._mounted) return; sec._mounted = true;
      let D = {}; try { D = JSON.parse(sec.querySelector('script').textContent); } catch (e) {}
      const esc = FX.esc, name = sec.dataset.scene;
      sec.innerHTML = '<div class="sd-wrap"><header class="sd-head"><p class="st-eyebrow">' + (D.eyebrow || 'Pruébalo en directo') + '</p><h2 data-split>' + (D.title || 'Hazlo tuyo') + '</h2>' + (D.sub ? '<p class="sd-sub">' + D.sub + '</p>' : '') + '</header>' +
        '<div class="sd-main"><div class="sd-stage"><div class="sd-load"><i></i><span>Preparando el estudio…</span></div><div class="sd-hint"></div><div class="sd-tools"><button type="button" class="sd-shot" title="Guardar imagen">📸 Guardar foto</button><button type="button" class="sd-full" title="Pantalla completa">⤢</button></div></div>' +
        '<aside class="sd-panel" data-lenis-prevent><div class="sd-groups"></div><div class="sd-sum"><b>Tu elección</b><ul></ul><a class="btn magnetic sd-cta" href="#contacto" data-biz-link="wa" target="_blank" rel="noopener" data-cursor="Enviar">' + esc(D.cta || 'Pedir esto por WhatsApp') + '</a></div></aside></div></div>';
      const stage = sec.querySelector('.sd-stage'), groups = sec.querySelector('.sd-groups'), sumUl = sec.querySelector('.sd-sum ul'), cta = sec.querySelector('.sd-cta');
      // Vida alrededor del escenario: foco que sigue al ratón, onda al pulsar y animación suave de lo que cambia
      const panel = sec.querySelector('.sd-panel');
      sec.addEventListener('pointermove', e => {
        const r = sec.getBoundingClientRect(), p = panel.getBoundingClientRect();
        sec.style.setProperty('--sx', (e.clientX - r.left) / r.width * 100 + '%'); sec.style.setProperty('--sy', (e.clientY - r.top) / r.height * 100 + '%');
        panel.style.setProperty('--px', e.clientX - p.left + 'px'); panel.style.setProperty('--py', e.clientY - p.top + 'px');
      }, { passive: true });
      groups.addEventListener('pointerdown', e => {
        const b = e.target.closest('button'); if (!b || FX.RM) return;
        const r = b.getBoundingClientRect(), s = document.createElement('span'); s.className = 'sd-rip'; s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px';
        b.appendChild(s); setTimeout(() => s.remove(), 700);
      });
      const fitCard = () => { const c = stage.querySelector('.vt-card'), m = stage.querySelector('.vt-mon'); if (!c) return; if (m && getComputedStyle(m).display !== 'none' && m.offsetTop > c.offsetTop) c.style.maxHeight = Math.max(90, m.offsetTop - c.offsetTop - 12) + 'px'; else c.style.maxHeight = ''; };
      new MutationObserver(ms => {
        const seen = new Set();
        ms.forEach(m => { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement, box = t && t.closest && t.closest('.vt-card, .vt-mon'); if (box) seen.add(box); });
        seen.forEach(box => {
          const now = performance.now(); if (FX.RM || !window.gsap || now - (box._t || 0) < 1200) return; box._t = now;
          if (box.classList.contains('vt-card')) gsap.fromTo(box.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .04, ease: 'power2.out' });
          else { const big = box.querySelector('.vt-big'); if (big) gsap.fromTo(big, { scale: .9 }, { scale: 1, duration: .5, ease: 'back.out(3)', transformOrigin: '0 50%' }); }
        });
        fitCard();
      }).observe(stage, { childList: true, subtree: true, characterData: true });
      new ResizeObserver(fitCard).observe(stage);
      const state = {}, order = [], prev = {};
      const wa = String(FX.BIZ.whatsapp || FX.BIZ.telefono || '').replace(/\D/g, ''), num = wa.length === 9 ? '34' + wa : wa;
      const refresh = () => {
        // la fila que acaba de cambiar se ilumina un instante
        sumUl.innerHTML = order.filter(k => state[k] != null && state[k] !== '').map(k => '<li' + (k in prev && prev[k] !== state[k] ? ' class="chg"' : '') + '><span>' + esc(k) + '</span><b>' + esc(state[k]) + '</b></li>').join('');
        order.forEach(k => prev[k] = state[k]);
        const msg = (D.msg || 'Hola, he configurado esto en vuestra web:') + '\n' + order.filter(k => state[k]).map(k => '• ' + k + ': ' + state[k]).join('\n');
        cta.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
      };
      const ui = {
        set(k, v) { if (!order.includes(k)) order.push(k); state[k] = v; refresh(); },
        del(k) { delete state[k]; refresh(); },
        redo(k, build) { const old = [...groups.querySelectorAll('.sd-g')].find(n => n.dataset.l === k); const g = build(); if (old && g) old.replaceWith(g); return g; },
        // Marca en el panel el valor que ha cambiado otra parte (p. ej. el chat) sin volver a lanzar su acción
        pick(k, v) { const g = [...groups.querySelectorAll('.sd-g')].find(n => n.dataset.l === k); if (g && g._set) g._set(v); },
        drop(k) { groups.querySelectorAll('.sd-g').forEach(n => { if (n.dataset.l === k) n.remove(); }); ui.del(k); },
        hint(t) { const h = stage.querySelector('.sd-hint'); h.textContent = t; h.classList.toggle('on', !!t); },
        group(label, html, cls = '') { const g = document.createElement('div'); g.className = 'sd-g ' + cls; g.dataset.l = label; g.innerHTML = '<p class="sd-l">' + label + '</p>' + html; groups.appendChild(g); return g; },
        // Muestras de color: [{v:'#hex', l:'Nombre'}]
        swatches(label, list, cur, fn, custom = true) {
          const g = ui.group(label, '<div class="sd-sw">' + list.map(o => '<button type="button" style="--c:' + o.v + '" data-v="' + o.v + '" title="' + esc(o.l) + '" class="' + (o.v === cur ? 'on' : '') + '"></button>').join('') + (custom ? '<label class="sd-pick" title="Otro color"><input type="color" value="' + (/^#/.test(cur) ? cur : '#ff6a1a') + '"></label>' : '') + '</div>');
          const pick = (v, l) => { g.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); ui.set(label, l); fn(v); };
          g.addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(b.dataset.v, b.title); });
          const inp = g.querySelector('input'); if (inp) inp.addEventListener('input', () => pick(inp.value, 'Personalizado ' + inp.value));
          g._set = v => { const b = g.querySelector('button[data-v="' + v + '"]'); g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); if (b) ui.set(label, b.title); };
          const first = list.find(o => o.v === cur) || list[0]; ui.set(label, first.l); return g;
        },
        // Botones de opción: [{v, l, i?}]
        chips(label, list, cur, fn, multi = false) {
          const g = ui.group(label, '<div class="sd-ch">' + list.map(o => '<button type="button" data-v="' + o.v + '" class="' + ((multi ? (cur || []).includes(o.v) : o.v === cur) ? 'on' : '') + '">' + (o.i ? '<i>' + o.i + '</i>' : '') + esc(o.l) + '</button>').join('') + '</div>');
          const sync = () => { const on = [...g.querySelectorAll('button.on')]; ui.set(label, on.map(b => b.textContent.trim()).join(', ') || '—'); };
          g.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (multi) b.classList.toggle('on'); else g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
            sync(); fn(multi ? [...g.querySelectorAll('button.on')].map(x => x.dataset.v) : b.dataset.v, b);
          });
          g._set = v => { const want = [].concat(v).map(String); g.querySelectorAll('button').forEach(x => x.classList.toggle('on', want.includes(x.dataset.v))); sync(); };
          sync(); return g;
        },
        range(label, o, fn) {
          const g = ui.group(label, '<div class="sd-rg"><input type="range" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '"><output></output></div>');
          const i = g.querySelector('input'), out = g.querySelector('output');
          const go = () => { const v = +i.value, t = o.fmt ? o.fmt(v) : v + (o.unit || ''); out.textContent = t; ui.set(label, t); fn(v); };
          g._set = v => { i.value = v; const t = o.fmt ? o.fmt(+i.value) : i.value + (o.unit || ''); out.textContent = t; ui.set(label, t); };
          i.addEventListener('input', go); go(); return g;
        },
        text(label, value, fn, ph = '') {
          const g = ui.group(label, '<input class="sd-tx" maxlength="28" value="' + esc(value) + '" placeholder="' + esc(ph) + '">');
          const i = g.querySelector('input'); const go = () => { ui.set(label, i.value); fn(i.value); }; i.addEventListener('input', go); go(); return g;
        },
        buttons(list) { const g = ui.group('', '<div class="sd-act">' + list.map((o, k) => '<button type="button" data-k="' + k + '" class="' + (o.main ? 'main' : '') + '">' + o.l + '</button>').join('') + '</div>', 'sd-gact'); g.addEventListener('click', e => { const b = e.target.closest('button'); if (b) list[+b.dataset.k].fn(b); }); return g; },
        toast(t) { const d = document.createElement('div'); d.className = 'sd-toast'; d.textContent = t; stage.appendChild(d); setTimeout(() => d.classList.add('on'), 10); setTimeout(() => { d.classList.remove('on'); setTimeout(() => d.remove(), 400); }, 2200); },
        ready() { stage.querySelector('.sd-load').classList.add('off'); },
        fail(msg) { const l = stage.querySelector('.sd-load'); l.classList.add('err'); l.querySelector('span').textContent = msg || 'No se ha podido cargar el estudio. Revisa la conexión.'; }
      };
      // Foto de la configuración y pantalla completa
      sec.querySelector('.sd-shot').onclick = () => {
        const c = stage.querySelector('canvas'); let url = null;
        if (c) url = c.toDataURL('image/png');
        else if (stage.querySelector('svg')) { const s = new XMLSerializer().serializeToString(stage.querySelector('svg')); url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
        if (!url) return ui.toast('Esta escena no se puede guardar como foto');
        const a = document.createElement('a'); a.href = url; a.download = 'mi-configuracion.' + (c ? 'png' : 'svg'); a.click(); ui.toast('Foto guardada');
      };
      sec.querySelector('.sd-full').onclick = () => { const w = sec.querySelector('.sd-main'); if (document.fullscreenElement) document.exitFullscreen(); else if (w.requestFullscreen) w.requestFullscreen(); };
      // Carga perezosa de la escena cuando el estudio se acerca a la pantalla
      const io = new IntersectionObserver(es => {
        if (!es[0].isIntersecting) return; io.disconnect();
        const go = () => { return Promise.resolve(S.scenes[name]({ stage, ui, FX, studio: S, data: D, sec })).then(() => ui.ready()).catch(e => { console.error(e); ui.fail(); }); };
        if (S.scenes[name]) go();
        else { const s = document.createElement('script'); s.src = FX.BASE + 'escenas/' + name + '.js'; s.onload = go; s.onerror = () => ui.fail(); document.head.appendChild(s); }
      }, { rootMargin: '0px', threshold: LOW ? .15 : .05 });
      io.observe(sec);
    }
  };
})();
