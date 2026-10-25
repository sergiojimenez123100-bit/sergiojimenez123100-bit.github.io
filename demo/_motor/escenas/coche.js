/* Taller · Coche real en un taller/concesionario fotografiado en 360°, personalización completa y diagnóstico por chat */
FXSTUDIO.scenes.coche = async ({ stage, ui, FX, studio }) => {
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ffd400';
  const W = await studio.world(stage, { cam: [5.6, 1.5, 6.4], target: [0, .6, 0], minD: 3.4, maxD: 10, exposure: .95, autoRotateSpeed: .5, maxPolar: Math.PI / 2.08 });
  const { THREE, scene, GLTFLoader, DRACOLoader, DRACO } = W;
  // Entornos reales (HDRI 360° de Poly Haven) con el suelo proyectado bajo el coche
  const ENV = { taller: ['autoshop_01', 7, 0], concesionario: ['studio_small_08', 3.2, 0], parking: ['parking_garage', 4, Math.PI], garaje: ['garage', 4, 0] };
  const setEnv = async k => { const [id, h, r] = ENV[k]; ui.hint('Cargando escenario…'); await studio.hdri(W, id, { res: '2k', ground: true, height: h, radius: 70, rotate: r }); ui.hint('Arrastra para girar alrededor del coche'); ui.set('Escenario', { taller: 'Taller', concesionario: 'Concesionario', parking: 'Parking', garaje: 'Garaje' }[k]); };
  await setEnv('taller');

  // --- Coche: modelo 3D real con carrocería, llantas y lunas separadas ---
  const loader = new GLTFLoader(), draco = new DRACOLoader(); draco.setDecoderPath(DRACO); loader.setDRACOLoader(draco);
  const gltf = await loader.loadAsync('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/ferrari.glb');
  const car = gltf.scene.children[0];
  const body = new THREE.MeshPhysicalMaterial({ color: '#c1121f', metalness: 1, roughness: .38, clearcoat: 1, clearcoatRoughness: .03 });
  const rims = new THREE.MeshStandardMaterial({ color: '#d9dde2', metalness: 1, roughness: .22 });
  const trim = new THREE.MeshStandardMaterial({ color: '#0d0d0d', metalness: .8, roughness: .35 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .25, roughness: 0, transmission: 1 });
  car.getObjectByName('body').material = body;
  ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl'].forEach(n => { const o = car.getObjectByName(n); if (o) o.material = rims; });
  const tr = car.getObjectByName('trim'); if (tr) tr.material = trim;
  car.getObjectByName('glass').material = glass;
  const wheels = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].map(n => car.getObjectByName(n)).filter(Boolean);
  wheels.forEach(w => w.userData.y0 = w.position.y);
  const ao = await new THREE.TextureLoader().loadAsync('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/ferrari_ao.png');
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.655 * 4, 1.3 * 4), new THREE.MeshBasicMaterial({ map: ao, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true }));
  shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 2; car.add(shadow);
  const rig = new THREE.Group(); rig.add(car); scene.add(rig);
  const box = new THREE.Box3().setFromObject(car), sz = box.getSize(new THREE.Vector3());
  const F = box.min.z, R = box.max.z, top = box.max.y;            // el morro de este modelo mira a -Z
  const acc3 = new THREE.Group(); rig.add(acc3);

  // Matrícula
  let plateTxt = String(FX.BIZ.nombre || 'TALLER').toUpperCase().replace(/[^A-ZÑ0-9 ]/g, '').slice(0, 9);
  const plateMat = new THREE.MeshStandardMaterial({ roughness: .4, metalness: .1 });
  const drawPlate = () => { plateMat.map = W.canvasTex(520, 112, (c, w, h) => { c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d3fbf'; c.fillRect(0, 0, 54, h); c.fillStyle = '#ffd400'; c.font = '700 22px system-ui'; c.textAlign = 'center'; c.fillText('★', 27, 34); c.fillStyle = '#fff'; c.fillText('E', 27, 92); c.fillStyle = '#111'; c.font = '800 64px system-ui'; c.fillText(plateTxt || ' ', 54 + (w - 54) / 2, 82); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); }); plateMat.needsUpdate = true; };
  drawPlate();
  [[F - .005, Math.PI], [R + .005, 0]].forEach(([z, ry]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.52, .112), plateMat); p.position.set(0, box.min.y + sz.y * .26, z); p.rotation.y = ry; acc3.add(p); });
  // Faros
  const lights = new THREE.Group(); lights.visible = false; acc3.add(lights);
  const flareTex = W.canvasTex(128, 128, c => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(200,225,255,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  [-1, 1].forEach(s => {
    const sp = new THREE.SpotLight('#eaf3ff', 40, 14, .45, .5, 1.2); sp.position.set(s * sz.x * .33, box.min.y + sz.y * .42, F + .2); sp.target.position.set(s * .6, 0, F - 6); lights.add(sp, sp.target);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); fl.scale.set(.42, .42, 1); fl.position.set(s * sz.x * .33, box.min.y + sz.y * .42, F + .12); lights.add(fl);
  });
  // Alerón
  const spoiler = new THREE.Group(); spoiler.visible = false;
  const deck = box.min.y + sz.y * .6;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(sz.x * .7, .03, .3), body); wing.position.set(0, deck + .2, R - .3); wing.rotation.x = .08; spoiler.add(wing);
  [-1, 1].forEach(s => { const st = new THREE.Mesh(new THREE.BoxGeometry(.035, .2, .1), trim); st.position.set(s * sz.x * .22, deck + .09, R - .32); spoiler.add(st); });
  acc3.add(spoiler);

  // Escenario (botones sobre la imagen)
  const envBar = document.createElement('div'); envBar.className = 'sd-env';
  envBar.innerHTML = [['taller', '🔧 Taller'], ['concesionario', '✨ Concesionario'], ['parking', '🅿️ Parking'], ['garaje', '🏠 Garaje']].map(([k, l], i) => '<button type="button" data-k="' + k + '" class="' + (i ? '' : 'on') + '">' + l + '</button>').join('');
  stage.appendChild(envBar);
  envBar.onclick = async e => { const b = e.target.closest('button'); if (!b) return; envBar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); await setEnv(b.dataset.k); };

  // --- Personalización ---
  const price = {}; const total = () => { const t = Object.values(price).reduce((a, b) => a + b, 0); ui.set('Presupuesto orientativo', t ? 'desde ' + t.toLocaleString('es-ES') + ' €' : '—'); };
  const PAINT = [{ v: '#c1121f', l: 'Rosso corsa' }, { v: '#0b0b0d', l: 'Negro' }, { v: '#f2f2ee', l: 'Blanco perla' }, { v: '#8a8f93', l: 'Gris Nardo' }, { v: '#1d4ed8', l: 'Azul eléctrico' }, { v: '#14532d', l: 'Verde británico' }, { v: '#f2c200', l: 'Amarillo' }, { v: '#ff6a1a', l: 'Naranja' }, { v: acc, l: 'Color de la marca' }];
  ui.swatches('Pintura', PAINT, '#c1121f', v => { const c = new THREE.Color(v); window.gsap ? gsap.to(body.color, { r: c.r, g: c.g, b: c.b, duration: .8 }) : body.color.copy(c); price.pintura = 1900; total(); });
  ui.chips('Acabado', [{ v: 'brillo', l: 'Brillo' }, { v: 'mate', l: 'Mate' }, { v: 'perla', l: 'Perlado' }, { v: 'cromo', l: 'Cromado' }], 'brillo', v => { const P = { brillo: [.38, 1, 1, 0], mate: [.8, .45, 0, 0], perla: [.28, .8, 1, 1], cromo: [.04, 1, 1, 0] }[v]; body.roughness = P[0]; body.metalness = P[1]; body.clearcoat = P[2]; body.iridescence = P[3]; body.needsUpdate = true; price.acabado = v === 'brillo' ? 0 : v === 'mate' ? 1200 : 1500; total(); });
  ui.chips('Llantas', [{ v: 'plata', l: 'Plata' }, { v: 'negro', l: 'Negro mate' }, { v: 'oro', l: 'Oro' }, { v: 'bronce', l: 'Bronce' }, { v: 'marca', l: 'Color marca' }], 'plata', v => { const C = { plata: ['#d9dde2', .22, 1], negro: ['#151515', .6, .6], oro: ['#d4a52c', .25, 1], bronce: ['#8c5a2b', .35, 1], marca: [acc, .35, .8] }[v]; rims.color.set(C[0]); rims.roughness = C[1]; rims.metalness = C[2]; price.llantas = v === 'plata' ? 0 : 320; total(); });
  ui.chips('Lunas', [{ v: 'clara', l: 'Sin tintar' }, { v: 'tinte', l: 'Tintadas 35%' }, { v: 'oscura', l: 'Oscuras 5%' }, { v: 'espejo', l: 'Espejo' }], 'clara', v => { const G = { clara: ['#ffffff', 1, .25], tinte: ['#556070', .55, .3], oscura: ['#111418', .12, .4], espejo: ['#9fb3c8', 0, 1] }[v]; glass.color.set(G[0]); glass.transmission = G[1]; glass.metalness = G[2]; price.lunas = v === 'clara' ? 0 : 180; total(); });
  ui.range('Suspensión', { min: 0, max: 6, value: 0, unit: ' cm', fmt: v => v ? 'Rebajada ' + v + ' cm' : 'De serie' }, v => { const d = v / 100; car.position.y = -d; acc3.position.y = -d; wheels.forEach(w => w.position.y = w.userData.y0 + d); shadow.position.y = d; price.susp = v ? 450 : 0; total(); });
  ui.chips('Extras', [{ v: 'aleron', l: 'Alerón', i: '🏁' }, { v: 'faros', l: 'Faros encendidos', i: '💡' }], [], v => { spoiler.visible = v.includes('aleron'); lights.visible = v.includes('faros'); price.aleron = v.includes('aleron') ? 690 : 0; total(); }, true);
  ui.text('Matrícula', plateTxt, v => { plateTxt = v.toUpperCase().slice(0, 9); drawPlate(); }, 'Tu texto');
  const VIEWS = { tres: [[5.6, 1.5, 6.4], [0, .6, 0]], lado: [[7, 1.1, 0], [0, .6, 0]], frente: [[1.6, 1.1, F - 4.6], [0, .6, 0]], tras: [[2.6, 1.6, 6.6], [0, .6, 0]], llanta: [[2.7, .65, F + .9], [sz.x / 2, .35, F + .9]], interior: [[.35, 1.05, .25], [0, .9, F + .2]] };
  ui.chips('Cámara', [{ v: 'tres', l: '3/4' }, { v: 'lado', l: 'Lateral' }, { v: 'frente', l: 'Frontal' }, { v: 'tras', l: 'Trasera' }, { v: 'llanta', l: 'Llanta' }, { v: 'interior', l: 'Interior' }], 'tres', v => { W.controls.minDistance = v === 'interior' ? .1 : 3.4; W.view(...VIEWS[v]); });

  // --- Motor con sonido ---
  let running = false, ac = null, osc, gain, spin = 0;
  const engine = on => {
    running = on;
    if (on) {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      osc = ac.createOscillator(); const o2 = ac.createOscillator(), lp = ac.createBiquadFilter(); gain = ac.createGain();
      osc.type = 'sawtooth'; o2.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 420;
      osc.frequency.setValueAtTime(38, ac.currentTime); osc.frequency.exponentialRampToValueAtTime(140, ac.currentTime + .7); osc.frequency.exponentialRampToValueAtTime(46, ac.currentTime + 1.8);
      o2.frequency.value = 23; gain.gain.setValueAtTime(0, ac.currentTime); gain.gain.linearRampToValueAtTime(.16, ac.currentTime + .3); gain.gain.linearRampToValueAtTime(.08, ac.currentTime + 2);
      osc.connect(lp); o2.connect(lp); lp.connect(gain); gain.connect(ac.destination); osc.start(); o2.start(); osc._o2 = o2; lights.visible = true;
    } else if (osc) { gain.gain.linearRampToValueAtTime(0, ac.currentTime + .4); const o = osc; setTimeout(() => { o.stop(); o._o2.stop(); }, 500); }
  };

  // --- Punto de la avería (se ilumina cuando el chat diagnostica) ---
  const PARTS = { motor: [0, top * .75, R - 1.2], frenos: [sz.x / 2, .35, F + .9], ruedas: [sz.x / 2, .35, R - .95], luces: [sz.x * .33, sz.y * .45, F + .15], cabina: [0, top * .9, .1], bajos: [0, .15, 0], escape: [sz.x * .25, .3, R + .05], bateria: [-sz.x * .25, sz.y * .5, F + 1.1], carroceria: [sz.x / 2, sz.y * .55, 0] };
  const hot = document.createElement('div'); hot.className = 'sd-dom cd-hot'; hot.hidden = true; stage.appendChild(hot);
  hot.innerHTML = '<button type="button" class="on"><i></i><span><b></b></span></button>';
  let focus = null;
  const show = (part, label) => { focus = PARTS[part]; hot.hidden = false; hot.querySelector('b').textContent = label; const p = new THREE.Vector3(...focus); W.view([p.x * 1.8 + (p.x >= 0 ? 2.6 : -2.6), 1.4, p.z * 1.4 + (p.z < 0 ? -2.4 : 2.4)], [p.x * .6, p.y, p.z]); };

  // --- Asistente: «¿Qué le pasa a tu coche?» ---
  const kb = [
    { k: ['motor roto', 'no arranca', 'no enciende', 'motor', 'gripado', 'se cala', 'tirones'], t: 'El motor no arranca o falla', u: 'alta', p: 'diagnosis 35 €', d: 'diagnosis en 30 min', a: 'Lo más habitual es la <b>batería</b> (6 de cada 10 casos), el <b>motor de arranque</b> o la <b>bomba de combustible</b>. Ahora: no lo intentes arrancar más de 3 veces seguidas y mira si se encienden las luces del cuadro. Si no se encienden, es casi seguro la batería. Si no puede moverse, lo recogemos con grúa.', on: () => show('motor', 'Motor · arranque y combustible') },
    { k: ['freno', 'frenos', 'chirria', 'pitan', 'ruido al frenar', 'pedal', 'frena mal'], t: 'Frenos desgastados', u: 'alta', p: '89 – 180 € por eje', d: '1 hora', a: 'El chirrido al frenar suele ser el <b>testigo de desgaste de las pastillas</b>. Si además notas vibración, los <b>discos</b> están deformados. No lo dejes: aumenta la distancia de frenado. Vienes por la mañana y te lo llevas a mediodía.', on: () => show('frenos', 'Frenos · pastillas y discos') },
    { k: ['humo', 'humo blanco', 'humo negro', 'humo azul', 'echa humo'], t: 'Sale humo del escape', u: 'alta', p: 'desde 35 € (diagnosis)', d: 'según la causa', a: '<b>Humo blanco</b> continuo: posible junta de culata (no circules). <b>Azul</b>: quema aceite (segmentos o turbo). <b>Negro</b>: mezcla rica (inyectores o filtro de aire). Hazle una foto al humo y mándanosla: así llegamos con la pieza.', on: () => show('escape', 'Escape · origen del humo') },
    { k: ['testigo', 'chivato', 'luz del motor', 'check engine', 'luz naranja', 'piloto', 'cuadro'], t: 'Se ha encendido un testigo', u: 'media', p: '35 €', d: '30 minutos', a: 'Conectamos el equipo de diagnosis y leemos el código de avería exacto. Si el testigo es <b>rojo</b> (aceite o temperatura), para el coche. Si es <b>naranja</b>, puedes venir circulando con calma.', on: () => show('bateria', 'Centralita · lectura de averías') },
    { k: ['aceite', 'mancha', 'pierde aceite', 'fuga', 'gotea'], t: 'Pierde aceite', u: 'media', p: 'desde 59 €', d: '1 – 3 horas', a: 'Una mancha bajo el coche suele ser un <b>retén</b>, la <b>junta del cárter</b> o el filtro mal apretado. Mira el nivel con la varilla: si está por debajo del mínimo, rellena antes de circular.', on: () => show('bajos', 'Bajos · cárter y retenes') },
    { k: ['embrague', 'patina', 'marchas', 'no entra la marcha', 'pedal duro'], t: 'Problema de embrague', u: 'media', p: '450 – 900 €', d: '1 día', a: 'Si el motor sube de vueltas pero el coche no acelera, el <b>embrague patina</b>. Te damos presupuesto cerrado del kit completo y coche de sustitución mientras tanto.', on: () => show('bajos', 'Transmisión · kit de embrague') },
    { k: ['bateria', 'no carga', 'se descarga', 'sin bateria'], t: 'Batería', u: 'media', p: '90 – 150 €', d: '20 minutos', a: 'Medimos la batería y el alternador gratis. Si la batería tiene más de 4 años es lo normal; te la cambiamos al momento y reciclamos la vieja.', on: () => show('bateria', 'Batería y alternador') },
    { k: ['aire acondicionado', 'no enfria', 'clima', 'climatizador'], t: 'El aire acondicionado no enfría', u: 'baja', p: '60 – 120 €', d: '1 hora', a: 'Casi siempre es <b>falta de gas</b>. Hacemos prueba de fugas y recarga. Si huele mal, cambiamos también el filtro de habitáculo.', on: () => show('cabina', 'Climatización · carga de gas') },
    { k: ['pinchazo', 'rueda', 'neumatico', 'vibra el volante', 'vibra', 'equilibrado', 'tira hacia'], t: 'Ruedas y vibraciones', u: 'media', p: 'desde 15 €', d: '30 minutos', a: 'Un pinchazo se repara en el momento. Si el volante <b>vibra</b> a cierta velocidad, hay que <b>equilibrar</b> las ruedas; si el coche <b>tira hacia un lado</b>, toca alinear.', on: () => show('ruedas', 'Neumáticos · reparación y equilibrado') },
    { k: ['temperatura', 'se calienta', 'refrigerante', 'ventilador', 'calienta'], t: 'El motor se calienta', u: 'alta', p: 'desde 80 €', d: 'según la causa', a: 'Para el coche y deja que se enfríe: <b>no abras el depósito en caliente</b>. Puede ser falta de refrigerante, el termostato, el ventilador o la bomba de agua.', on: () => show('motor', 'Refrigeración · termostato y bomba') },
    { k: ['luces', 'faro', 'bombilla', 'intermitente'], t: 'Luces', u: 'baja', p: '15 – 60 €', d: '15 minutos', a: 'Cambiamos la bombilla y regulamos los faros. Si es LED o xenón, te damos precio exacto por WhatsApp con el modelo.', on: () => show('luces', 'Iluminación') },
    { k: ['golpe', 'chapa', 'aranazo', 'rayon', 'abolladura', 'pintura'], t: 'Golpe o arañazo', u: 'baja', p: 'desde 150 €', d: '1 – 3 días', a: 'Mándanos dos fotos (una de cerca y otra de lejos) y te damos presupuesto de chapa y pintura sin que tengas que venir.', on: () => show('carroceria', 'Carrocería · chapa y pintura') },
    { k: ['itv', 'revision', 'mantenimiento', 'cambio de aceite'], t: 'Revisión o pre-ITV', u: 'baja', p: 'desde 39 €', d: 'en el día', a: 'Revisamos los puntos de la ITV, cambiamos lo justo y, si quieres, te la pasamos nosotros.', on: () => show('motor', 'Mantenimiento') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Diagnóstico ' + (FX.BIZ.nombre || ''), avatar: '🔧', fab: '¿Qué le pasa a tu coche?', placeholder: 'Ej.: tiene el motor roto, hace ruido al frenar…', quick: ['Tiene el motor roto', 'Ruido al frenar', 'Sale humo', 'Testigo encendido', 'No enfría el aire'], label: 'Avería', waIntro: 'Hola, a mi coche le pasa esto: ', cta: 'Pedir cita para esto' });

  ui.buttons([{ l: '🔑 Arrancar motor', main: true, fn: b => { engine(!running); b.textContent = running ? '⏹ Apagar motor' : '🔑 Arrancar motor'; if (running) ui.toast('Brrrrum 🏎️'); } }]);

  // --- Bucle ---
  const v = new THREE.Vector3(), hb = hot.querySelector('button');
  W.onFrame(() => {
    if (running) { spin += .3; car.position.x = (Math.random() - .5) * .006; } else spin *= .96;
    wheels.forEach(w => w.rotation.x = spin);
    if (focus) { const r = stage.getBoundingClientRect(); v.set(...focus); rig.localToWorld(v); v.project(W.camera); hb.style.transform = 'translate(' + ((v.x + 1) / 2 * r.width) + 'px,' + ((1 - v.y) / 2 * r.height) + 'px)'; }
  });
  total();
};
