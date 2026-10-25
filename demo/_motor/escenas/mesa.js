/* Restaurante · Mesa real (modelos 3D Poly Haven) dentro de un restaurante fotografiado en 360°, con los platos de la carta */
FXSTUDIO.scenes.mesa = async ({ stage, ui, FX, studio }) => {
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff6a1a';
  const W = await studio.world(stage, { cam: [0, 1.75, 2.35], target: [0, .7, 0], minD: 1.4, maxD: 4.5, exposure: 1, autoRotateSpeed: .3, shadows: true, maxPolar: Math.PI / 2.15, fov: 42 });
  const { THREE, scene, renderer } = W;
  ui.hint('Pulsa platos de la carta para servirlos · clic en un plato para retirarlo');
  const ENV = { noche: ['warm_restaurant_night', 2.2, 0, 1], dia: ['warm_restaurant', 2.2, 0, 1.05], barra: ['warm_bar', 2.2, 0, 1] };
  const setEnv = async k => { const [id, h, r, ex] = ENV[k]; ui.hint('Cargando el salón…'); await studio.hdri(W, id, { res: '2k', ground: true, height: h, radius: 40, rotate: r }); renderer.toneMappingExposure = ex; ui.hint('Pulsa platos de la carta para servirlos'); };
  await setEnv('noche');

  // Mesa y sillas reales
  const table = await studio.model(W, 'round_wooden_table_01', { height: .76 });
  scene.add(table);
  const TS = table.userData.size, TOP = TS.y, TR = Math.min(TS.x, TS.z) / 2;
  const chairProto = await studio.model(W, 'dining_chair_02', { height: .92 });
  const chairs = new THREE.Group(); scene.add(chairs);
  // Sombra suave en el suelo
  const shMat = new THREE.ShadowMaterial({ opacity: .45 }); const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 48), shMat); ground.rotation.x = -Math.PI / 2; ground.position.y = .002; ground.receiveShadow = true; scene.add(ground);
  const key = new THREE.DirectionalLight('#ffe2c0', 1.6); key.position.set(1.2, 3.4, 1.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2 }); key.shadow.bias = -.0004; key.shadow.radius = 6; scene.add(key);

  // Mantel
  const clothMat = new THREE.MeshStandardMaterial({ color: '#e6ddcc', roughness: .95, side: THREE.DoubleSide });
  const cloth = new THREE.Group();
  const ctop = new THREE.Mesh(new THREE.CylinderGeometry(TR + .04, TR + .04, .008, 64), clothMat); ctop.position.y = TOP + .004; ctop.receiveShadow = true;
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(TR + .04, TR + .14, .3, 64, 1, true), clothMat); skirt.position.y = TOP - .15; skirt.castShadow = true;
  cloth.add(ctop, skirt); scene.add(cloth);
  const Y = () => TOP + (cloth.visible ? .01 : .002);

  // Velas con llama
  const flame = W.canvasTex(64, 128, c => { const g = c.createRadialGradient(32, 80, 2, 32, 70, 40); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.4, 'rgba(255,170,60,.8)'); g.addColorStop(1, 'rgba(255,100,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 128); });
  const candles = new THREE.Group(); scene.add(candles); const flames = [];
  [[-.09, .05, .17], [.08, -.06, .22]].forEach(([x, z, h]) => {
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, .03, 24), new THREE.MeshStandardMaterial({ color: '#b08d57', metalness: 1, roughness: .25 })); holder.position.set(x, .015, z); candles.add(holder);
    const cd = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, h, 20), new THREE.MeshStandardMaterial({ color: '#f6efe2', roughness: .7 })); cd.position.set(x, .03 + h / 2, z); cd.castShadow = true; candles.add(cd);
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flame, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.scale.set(.035, .07, 1); f.position.set(x, .055 + h, z); candles.add(f);
    const pl = new THREE.PointLight('#ffb35c', .5, 1.6, 1.6); pl.position.set(x, .08 + h, z); candles.add(pl); flames.push({ f, pl });
  });
  const placeCandles = () => candles.position.y = Y();

  // Cubiertos por comensal
  const place = new THREE.Group(); scene.add(place);
  const white = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .15, clearcoat: .6 }), steel = new THREE.MeshStandardMaterial({ color: '#cfd3d6', metalness: 1, roughness: .2 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#fff', transmission: 1, roughness: 0, thickness: .01, ior: 1.5 });
  const wineGlass = () => new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.035, 0], [.004, .008], [.004, .09], [.03, .105], [.042, .16], [.038, .2]].map(p => new THREE.Vector2(...p)), 32), glassMat);
  let guests = 2;
  const setGuests = n => {
    guests = n; place.clear(); chairs.clear();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + Math.PI / 2, r = TR - .14, g = new THREE.Group();
      const charger = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .008, 48), new THREE.MeshStandardMaterial({ color: '#c9a86a', metalness: .8, roughness: .3 })); g.add(charger);
      const knife = new THREE.Mesh(new THREE.BoxGeometry(.013, .004, .2), steel); knife.position.set(.19, 0, 0); g.add(knife);
      const fork = knife.clone(); fork.position.x = -.19; g.add(fork);
      const nap = new THREE.Mesh(new THREE.BoxGeometry(.08, .015, .14), new THREE.MeshStandardMaterial({ color: acc, roughness: .9 })); nap.position.set(-.26, .004, 0); g.add(nap);
      const gl = wineGlass(); gl.position.set(.17, 0, -.18); g.add(gl);
      g.position.set(Math.cos(a) * r, Y() + .004, Math.sin(a) * r); g.rotation.y = -a + Math.PI / 2; g.traverse(o => o.castShadow = true); place.add(g);
      const ch = chairProto.clone(); const cr = TR + .38; ch.position.set(Math.cos(a) * cr, 0, Math.sin(a) * cr); ch.rotation.y = -a - Math.PI / 2; chairs.add(ch);
    }
  };

  // Platos de la carta (fotos reales de los platos)
  const carta = [...document.querySelectorAll('.dish')].map(d => ({ n: (d.querySelector('h3') || {}).textContent, p: parseFloat(((d.querySelector('.pr') || {}).textContent || '0').replace(',', '.')) || 0, img: d.dataset.img })).filter(d => d.n);
  const dishes = carta.length ? carta : [{ n: 'Croquetas caseras', p: 12, img: '1504674900247-0877df9cc836' }, { n: 'Pizza al horno', p: 14, img: '1565299624946-b28f40a0ae38' }, { n: 'Plato del día', p: 16, img: '1414235077428-338989a2e8c0' }];
  const texCache = {};
  const foodTex = id => texCache[id] || (texCache[id] = new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => res(W.canvasTex(512, 512, (c, w, h) => { c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.clip(); const s = Math.min(im.width, im.height) * .82; c.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, w, h); }));
    im.onerror = () => res(null); im.src = 'https://images.unsplash.com/photo-' + id + '?w=600&h=600&fit=crop&q=75&auto=format';
  }));
  const plateGeo = new THREE.LatheGeometry([[0, 0], [.12, 0], [.15, .01], [.2, .024], [.21, .022], [.155, .005], [0, .005]].map(p => new THREE.Vector2(...p)), 64);
  const slots = [[0, .2], [.24, -.08], [-.24, -.08], [.0, -.28], [.3, .2], [-.3, .2], [.28, -.32], [-.28, -.32]];
  const served = []; const steamTex = W.canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const refresh = () => { const tot = served.reduce((a, s) => a + s.d.p, 0); ui.set('En la mesa', served.length ? served.map(s => s.d.n).join(', ') : '—'); ui.set('Total', tot ? tot.toFixed(2).replace('.', ',') + ' €' : '—'); };
  const serve = async d => {
    if (served.length >= slots.length) return ui.toast('La mesa está llena 😄');
    const used = new Set(served.map(s => s.slot)), slot = slots.findIndex((_, i) => !used.has(i));
    const g = new THREE.Group(), plate = new THREE.Mesh(plateGeo, white); plate.castShadow = true; plate.receiveShadow = true; g.add(plate);
    const tx = await foodTex(d.img);
    const food = new THREE.Mesh(new THREE.CircleGeometry(.142, 64), new THREE.MeshStandardMaterial({ map: tx, color: tx ? '#fff' : '#b5651d', roughness: .65 }));
    food.rotation.x = -Math.PI / 2; food.position.y = .0065; g.add(food);
    for (let k = 0; k < 4; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })); s.userData.ph = Math.random() * 3; g.add(s); }
    const [x, z] = slots[slot]; g.position.set(x * (TR / .5), Y() + 1, z * (TR / .5)); g.rotation.y = Math.random() * 6; g.userData.dish = true; scene.add(g);
    const o = { g, d, slot }; served.push(o); refresh();
    if (window.gsap) gsap.to(g.position, { y: Y(), duration: .8, ease: 'bounce.out' }); else g.position.y = Y();
    ui.toast('Servido: ' + d.n);
  };
  const removeServed = o => { served.splice(served.indexOf(o), 1); refresh(); if (window.gsap) gsap.to(o.g.position, { y: Y() + 1, duration: .4, ease: 'power2.in', onComplete: () => scene.remove(o.g) }); else scene.remove(o.g); };
  // Bebidas
  const drinks = [];
  const pour = kind => {
    const C = { vino: ['#4a0a14', .6], agua: ['#d8ecff', .05], cerveza: ['#d99a17', .5], cava: ['#f0dc96', .35] }[kind];
    const g = new THREE.Group(), gl = wineGlass(); const liq = new THREE.Mesh(new THREE.CylinderGeometry(.035, .028, .045, 32), new THREE.MeshPhysicalMaterial({ color: C[0], transmission: C[1], roughness: .05, ior: 1.33 })); liq.position.y = .13;
    g.add(gl, liq); const a = Math.random() * Math.PI * 2; g.position.set(Math.cos(a) * TR * .45, Y(), Math.sin(a) * TR * .45); scene.add(g); drinks.push(g);
    if (window.gsap) gsap.from(liq.scale, { y: .01, duration: 1.2, ease: 'power2.out' });
  };

  // Opciones
  ui.chips('Carta', dishes.map((d, i) => ({ v: String(i), l: d.n + (d.p ? ' · ' + d.p + '€' : ''), i: '🍽️' })), null, (v, b) => { b.classList.remove('on'); ui.del('Carta'); serve(dishes[+v]); });
  ui.chips('Bebidas', [{ v: 'vino', l: 'Vino tinto', i: '🍷' }, { v: 'cava', l: 'Cava', i: '🥂' }, { v: 'cerveza', l: 'Caña', i: '🍺' }, { v: 'agua', l: 'Agua', i: '💧' }], null, (v, b) => { b.classList.remove('on'); pour(v); ui.set('Bebidas', drinks.length + (drinks.length === 1 ? ' copa' : ' copas')); });
  ui.chips('Comensales', [{ v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }], '2', v => setGuests(+v));
  ui.swatches('Mantel', [{ v: '#e6ddcc', l: 'Lino blanco' }, { v: '#b4532a', l: 'Terracota' }, { v: '#55613a', l: 'Verde oliva' }, { v: '#1d1d1f', l: 'Negro' }, { v: acc, l: 'Color de la casa' }, { v: 'none', l: 'Madera vista' }], '#e6ddcc', v => {
    cloth.visible = v !== 'none'; if (v !== 'none') clothMat.color.set(v);
    place.children.forEach(g => g.position.y = Y() + .004); served.forEach(s => s.g.position.y = Y()); drinks.forEach(d => d.position.y = Y()); placeCandles();
  }, false);
  ui.chips('Salón', [{ v: 'noche', l: 'Cena', i: '🌙' }, { v: 'dia', l: 'Comida', i: '☀️' }, { v: 'barra', l: 'Zona de barra', i: '🍸' }], 'noche', async v => { await setEnv(v); flames.forEach(f => { f.f.visible = v !== 'dia'; f.pl.intensity = v === 'dia' ? 0 : .5; }); });
  ui.buttons([{ l: '⭐ Menú degustación', main: true, fn: () => dishes.slice(0, 5).forEach((d, i) => setTimeout(() => serve(d), i * 350)) }, { l: '🧹 Recoger la mesa', fn: () => { [...served].forEach(removeServed); drinks.splice(0).forEach(d => scene.remove(d)); ui.set('Bebidas', '—'); } }]);
  setGuests(2); placeCandles(); refresh(); ui.del('Carta'); ui.del('Bebidas');

  // Clic en un plato para retirarlo
  const ray = new THREE.Raycaster(), m = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(m, W.camera); const hit = ray.intersectObjects(served.map(s => s.g), true)[0];
    if (hit) { let o = hit.object; while (o && !o.userData.dish) o = o.parent; const s = served.find(x => x.g === o); if (s) removeServed(s); }
  });
  W.onFrame((dt, t) => {
    flames.forEach((c, i) => { const k = 1 + Math.sin(t * 13 + i) * .08 + Math.sin(t * 7.3 + i * 2) * .06; c.f.scale.set(.035 * k, .07 * k, 1); if (c.f.visible) c.pl.intensity = .5 * k; });
    served.forEach(s => s.g.children.filter(o => o.isSprite).forEach(sp => { const p = (t * .35 + sp.userData.ph) % 1; sp.position.set(Math.sin(t + sp.userData.ph * 5) * .04, .04 + p * .32, Math.cos(t * .8 + sp.userData.ph) * .04); sp.material.opacity = Math.sin(p * Math.PI) * .3; sp.scale.setScalar(.08 + p * .18); }));
  });
};
