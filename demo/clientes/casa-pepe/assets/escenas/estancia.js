/* Reformas / Inmobiliaria · Realista:
   - cocina: estancia con texturas fotográficas (Poly Haven) e iluminación real, antes/después
   - salón: decoración virtual (home staging) sobre una habitación vacía real fotografiada en 360° */
FXSTUDIO.scenes.estancia = async ({ stage, ui, FX, studio, data, sec }) => {
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff5b1f';
  const preset = data.preset || sec.dataset.preset || 'cocina';
  return preset === 'salon' ? salon() : cocina();

  /* ================= SALÓN · home staging en una habitación real ================= */
  async function salon() {
    const W = await studio.world(stage, { cam: [2.6, 1.55, 3.2], target: [0, .7, 0], minD: 1.5, maxD: 6, exposure: 1, autoRotateSpeed: .35, shadows: true, maxPolar: Math.PI / 2.1, fov: 50 });
    const { THREE, scene, renderer } = W;
    ui.hint('Arrastra para mirar la habitación');
    const ROOMS = { vacia: ['small_empty_room_3', 1.6, 0], luminoso: ['lebombo', 1.6, 0], blanco: ['white_home_studio', 1.6, 0] };
    const setRoom = async k => { ui.hint('Cargando la habitación…'); const [id, h, r] = ROOMS[k]; await studio.hdri(W, id, { res: '2k', ground: true, height: h, radius: 20, rotate: r }); ui.hint('Arrastra para mirar la habitación'); };
    await setRoom('luminoso');
    const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: .35 })); shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = .002; shadowFloor.receiveShadow = true; scene.add(shadowFloor);
    const sun = new THREE.DirectionalLight('#fff3df', 1.4); sun.position.set(-2.5, 4, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); sun.shadow.radius = 5; sun.shadow.bias = -.0004; scene.add(sun);
    const lamp = new THREE.PointLight('#ffcf8f', 0, 5, 1.5); lamp.position.set(1.2, 1.6, -.8); scene.add(lamp);
    const furn = new THREE.Group(); scene.add(furn);
    // Alfombra con textura de tejido real
    const rugTex = W.canvasTex(1024, 720, (c, w, h) => { c.fillStyle = '#e9e1d3'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { c.fillStyle = 'rgba(120,100,80,' + Math.random() * .08 + ')'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.strokeStyle = acc; c.globalAlpha = .7; c.lineWidth = 14; c.strokeRect(40, 40, w - 80, h - 80); c.lineWidth = 4; c.strokeRect(70, 70, w - 140, h - 140); });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.7), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .004, .1); rug.receiveShadow = true;
    const STYLES = {
      nordico: { sofa: 'sofa_03', table: 'coffee_table_round_01', chair: 'mid_century_lounge_chair', l: 'Nórdico' },
      moderno: { sofa: 'sofa_02', table: 'modern_coffee_table_02', chair: 'modern_arm_chair_01', l: 'Moderno' },
      clasico: { sofa: 'Sofa_01', table: 'CoffeeTable_01', chair: 'ArmChair_01', l: 'Clásico' }
    };
    const cache = {};
    const get = (id, o) => cache[id] || (cache[id] = studio.model(W, id, o));
    const extras = Promise.all([get('side_table_01', { height: .55 }), get('potted_plant_04', { height: 1.1 }), get('ceramic_vase_01', { height: .3 })]);
    let style = 'nordico', fabric = '#d9d2c5';
    const tint = (o, col) => o.traverse(n => { if (n.isMesh) { n.material = n.material.clone(); n.material.color.set(col); } });
    let soft = [];
    const build = async k => {
      style = k; const S = STYLES[k]; ui.hint('Amueblando…');
      const [sofa, table, chair] = await Promise.all([get(S.sofa, { size: 2.1 }), get(S.table, { size: 1.05 }), get(S.chair, { height: .85 })]);
      const [side, plant, vase] = await extras;
      furn.clear(); furn.add(rug);
      const s = sofa.clone(); s.position.set(0, 0, -1.05); furn.add(s); tint(s, fabric);
      const t = table.clone(); t.position.set(0, 0, .15); furn.add(t);
      const c = chair.clone(); c.position.set(1.45, 0, .2); c.rotation.y = -Math.PI / 2.4; furn.add(c); tint(c, fabric); soft = [s, c];
      const sd = side.clone(); sd.position.set(-1.35, 0, -1); furn.add(sd);
      const v = vase.clone(); v.position.set(-1.35, sd.userData.size.y, -1); furn.add(v);
      const p = plant.clone(); p.position.set(1.5, 0, -1.2); furn.add(p);
      if (window.gsap) furn.children.forEach((o, i) => gsap.from(o.position, { y: 1.2, duration: .7, delay: i * .07, ease: 'bounce.out' }));
      ui.set('Estilo', S.l); ui.hint('Arrastra para mirar la habitación');
    };
    await build('nordico');
    ui.chips('Estancia', [{ v: 'amueblado', l: 'Amueblada' }, { v: 'vacio', l: 'Vacía' }], 'amueblado', v => { const on = v === 'amueblado'; if (window.gsap) { if (on) furn.visible = true; gsap.to(furn.scale, { x: on ? 1 : .001, y: on ? 1 : .001, z: on ? 1 : .001, duration: .7, ease: on ? 'back.out(1.6)' : 'power2.in', onComplete: () => furn.visible = on }); } else furn.visible = on; });
    ui.chips('Estilo de decoración', Object.entries(STYLES).map(([v, o]) => ({ v, l: o.l })), 'nordico', v => build(v));
    ui.swatches('Tapicería', [{ v: '#d9d2c5', l: 'Lino natural' }, { v: '#8d8f93', l: 'Gris perla' }, { v: '#5d6b4f', l: 'Verde oliva' }, { v: '#b4643f', l: 'Terracota' }, { v: '#2f3d5c', l: 'Azul noche' }, { v: '#f4f1ea', l: 'Blanco roto' }, { v: acc, l: 'Color de la marca' }], '#d9d2c5', v => { fabric = v; soft.forEach(o => o.traverse(n => { if (n.isMesh) n.material.color.set(v); })); });
    ui.chips('Habitación', [{ v: 'vacia', l: 'Piso vacío' }, { v: 'luminoso', l: 'Salón luminoso' }, { v: 'blanco', l: 'Estudio blanco' }], 'luminoso', v => setRoom(v));
    ui.chips('Hora del día', [{ v: 'dia', l: 'Día', i: '☀️' }, { v: 'tarde', l: 'Atardecer', i: '🌇' }, { v: 'noche', l: 'Noche', i: '🌙' }], 'dia', v => {
      const T = { dia: [1, '#fff3df', 1.4, 0], tarde: [.75, '#ffb070', 1.1, 1.2], noche: [.35, '#6d84b8', .2, 3] }[v];
      renderer.toneMappingExposure = T[0]; sun.color.set(T[1]); sun.intensity = T[2]; lamp.intensity = T[3];
    });
    let m2 = 85;
    const price = () => ui.set('Valor estimado de la vivienda', (Math.round(m2 * 5200 / 1000) * 1000).toLocaleString('es-ES') + ' € (zona centro)');
    ui.range('Superficie del piso', { min: 40, max: 200, value: m2, unit: ' m²' }, v => { m2 = v; price(); });
    ui.chips('Cámara', [{ v: 'a', l: 'General' }, { v: 'b', l: 'Desde la puerta' }, { v: 'c', l: 'Sofá' }], 'a', v => { const V = { a: [[2.6, 1.55, 3.2], [0, .7, 0]], b: [[0, 1.6, 3.6], [0, .8, -.6]], c: [[-1.6, 1.1, 1.2], [.3, .6, -.8]] }[v]; W.view(V[0], V[1]); });
  }

  /* ================= COCINA · texturas reales y antes/después ================= */
  async function cocina() {
    const W = await studio.world(stage, { bg: '#d9d4cb', cam: [4.6, 3.1, 5.2], target: [0, 1, -.4], minD: 3, maxD: 9, exposure: 1, autoRotateSpeed: .25, shadows: true, maxPolar: Math.PI / 2.2, fov: 42 });
    const { THREE, scene, renderer } = W;
    W.controls.minAzimuthAngle = -.2; W.controls.maxAzimuthAngle = 1.5;
    ui.hint('Cargando materiales reales…');
    await studio.hdri(W, 'white_home_studio', { res: '1k', intensity: .55 });
    const RW = 6, RD = 4.6, RH = 2.7;
    const FLOORS = { parquet: ['herringbone_parquet', [3, 3], 'Parquet en espiga', 55], roble: ['laminate_floor_02', [3, 3], 'Tarima roble', 45], marmol: ['marble_01', [2, 2], 'Mármol', 95], cemento: ['concrete_floor_02', [2, 2], 'Microcemento', 60], hidraulico: ['floor_tiles_06', [4, 3], 'Baldosa hidráulica', 70] };
    const floorMats = {}; const fm = k => floorMats[k] || (floorMats[k] = studio.pbr(W, FLOORS[k][0], FLOORS[k][1]));
    const room = new THREE.Group(); scene.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), fm('parquet')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; room.add(floor);
    const wallMat = studio.pbr(W, 'white_plaster_02', [3, 1.5], { color: '#f1ece4' });
    const back = new THREE.Mesh(new THREE.BoxGeometry(RW, RH, .12), wallMat); back.position.set(0, RH / 2, -RD / 2 - .06); back.receiveShadow = true; room.add(back);
    const wx0 = -.9, wx1 = .9, wy0 = .9, wy1 = 2.25, L = new THREE.Group(); L.position.set(-RW / 2 - .06, 0, 0); room.add(L);
    [[RD, wy0, 0, wy0 / 2], [RD, RH - wy1, 0, wy1 + (RH - wy1) / 2], [(RD / 2 + wx0), wy1 - wy0, (-RD / 2 + wx0) / 2, (wy0 + wy1) / 2], [(RD / 2 - wx1), wy1 - wy0, (RD / 2 + wx1) / 2, (wy0 + wy1) / 2]].forEach(([d, h, z, y]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, h, d), wallMat); m.position.set(0, y, z); m.receiveShadow = true; L.add(m); });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), new THREE.MeshBasicMaterial({ color: '#e6f2ff' })); sky.position.set(-.3, (wy0 + wy1) / 2, 0); sky.rotation.y = Math.PI / 2; L.add(sky);
    const sun = new THREE.DirectionalLight('#fff4e0', 1.5); sun.position.set(-8, 5, 1); sun.target.position.set(1, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); sun.shadow.bias = -.0004; sun.shadow.radius = 4; scene.add(sun, sun.target);
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; room.add(m); return m; };
    // Muebles lacados, encimera de piedra real, tiradores metálicos
    const cab = new THREE.MeshPhysicalMaterial({ color: '#f4f3ef', roughness: .38, clearcoat: .4, clearcoatRoughness: .3 });
    const TOPS = { marmol: () => studio.pbr(W, 'marble_01', [1, .3], { roughness: .15 }), granito: () => studio.pbr(W, 'granite_tile', [1, .3], { roughness: .2 }), madera: () => studio.pbr(W, 'wood_table_001', [1, .3]), cemento: () => studio.pbr(W, 'concrete_floor_02', [1, .3]) };
    const topMats = {}; const tm = k => topMats[k] || (topMats[k] = TOPS[k]());
    const tops = [];
    const handle = new THREE.MeshStandardMaterial({ color: '#2a2a2a', metalness: 1, roughness: .25 });
    const z = -RD / 2 + .32;
    for (let i = 0; i < 6; i++) { const x = -1.9 + i * .62; box(.6, .82, .6, cab, x, .45, z); box(.016, .016, .3, handle, x, .78, z + .31).rotation.y = Math.PI / 2; if (i !== 2 && i !== 4) { box(.6, .7, .34, cab, x, 1.95, -RD / 2 + .17); box(.24, .014, .014, handle, x, 1.66, -RD / 2 + .35); } }
    tops.push(box(3.84, .04, .64, tm('marmol'), -.36, .88, z));
    box(.76, 2.1, .62, cab, 2.18, 1.05, z); box(.016, .5, .016, handle, 1.84, 1.3, z + .32);
    box(.5, .01, .44, new THREE.MeshPhysicalMaterial({ color: '#050505', roughness: .02, clearcoat: 1 }), -.36 + .62 * .5, .905, z);
    box(.44, .03, .36, new THREE.MeshStandardMaterial({ color: '#c9cdd1', metalness: 1, roughness: .18 }), .88, .9, z);
    box(1.8, .9, .8, cab, .2, .45, .55); tops.push(box(2.1, .04, 1, tm('marmol'), .2, .92, .55));
    // Taburetes y lámparas reales
    const lamps = [];
    const [stool, pend] = await Promise.all([studio.model(W, 'bar_chair_round_01', { height: .75 }), studio.model(W, 'hanging_industrial_lamp', { height: .45 })]);
    [-.4, .2, .8].forEach(x => { const s = stool.clone(); s.position.set(x, 0, 1.3); room.add(s); const p = pend.clone(); p.position.set(x, RH - .45, .55); room.add(p); const pl = new THREE.PointLight('#ffd7a3', 0, 3, 1.6); pl.position.set(x, RH - .55, .55); room.add(pl); lamps.push(pl); });
    // Opciones
    let fk = 'parquet', m2 = 14;
    const price = () => ui.set('Presupuesto orientativo', 'desde ' + Math.round(9500 + m2 * FLOORS[fk][3]).toLocaleString('es-ES') + ' €');
    ui.chips('Suelo', Object.entries(FLOORS).map(([v, o]) => ({ v, l: o[2] })), 'parquet', v => { fk = v; floor.material = fm(v); price(); });
    ui.swatches('Paredes', [{ v: '#f1ece4', l: 'Blanco roto' }, { v: '#e3d5bd', l: 'Arena' }, { v: '#a9b8a0', l: 'Verde salvia' }, { v: '#2e3a4d', l: 'Azul noche' }, { v: '#c98a6a', l: 'Terracota' }, { v: acc, l: 'Color de la marca' }], '#f1ece4', v => wallMat.color.set(v));
    ui.swatches('Muebles', [{ v: '#f4f3ef', l: 'Blanco lacado' }, { v: '#8f9e86', l: 'Verde salvia' }, { v: '#23314a', l: 'Azul noche' }, { v: '#b48558', l: 'Roble' }, { v: '#1a1a1a', l: 'Negro mate' }], '#f4f3ef', v => cab.color.set(v));
    ui.chips('Encimera', [{ v: 'marmol', l: 'Mármol' }, { v: 'granito', l: 'Granito' }, { v: 'madera', l: 'Madera' }, { v: 'cemento', l: 'Cemento' }], 'marmol', v => tops.forEach(t => t.material = tm(v)));
    ui.chips('Hora del día', [{ v: 'manana', l: 'Mañana', i: '☀️' }, { v: 'tarde', l: 'Atardecer', i: '🌇' }, { v: 'noche', l: 'Noche', i: '🌙' }], 'manana', v => {
      const t = { manana: ['#d9d4cb', '#fff4e0', 1.5, .55, 0, '#e6f2ff', [-8, 5, 1], 1], tarde: ['#c9a98a', '#ffb070', 2, .4, .8, '#ffc58f', [-8, 2.2, -2], .95], noche: ['#1b1d24', '#6d84b8', .15, .1, 2.2, '#20304f', [-8, 4, 0], .9] }[v];
      scene.background.set(t[0]); sun.color.set(t[1]); sun.position.set(...t[6]); sky.material.color.set(t[5]); scene.environmentIntensity = t[3]; renderer.toneMappingExposure = t[7];
      if (window.gsap) { gsap.to(sun, { intensity: t[2], duration: 1.2 }); lamps.forEach(l => gsap.to(l, { intensity: t[4], duration: 1.2 })); } else { sun.intensity = t[2]; lamps.forEach(l => l.intensity = t[4]); }
    });
    ui.range('Superficie', { min: 6, max: 30, value: m2, unit: ' m²' }, v => { m2 = v; price(); });
    // Antes / después
    let antes = false, keep = {};
    const old = { floor: studio.pbr(W, 'floor_tiles_02', [5, 4]), top: new THREE.MeshStandardMaterial({ color: '#8f8a7c', roughness: .6 }) };
    ui.buttons([{ l: '⟲ Ver el ANTES', main: true, fn: b => {
      antes = !antes; b.textContent = antes ? '✨ Ver el DESPUÉS' : '⟲ Ver el ANTES';
      if (antes) { keep = { cab: cab.color.getHex(), wall: wallMat.color.getHex(), floor: floor.material, top: tops[0].material }; cab.color.set('#7a5232'); cab.clearcoat = 0; wallMat.color.set('#d9cf9c'); floor.material = old.floor; tops.forEach(t => t.material = old.top); renderer.toneMappingExposure = .8; ui.toast('Así estaba…'); }
      else { cab.color.setHex(keep.cab); cab.clearcoat = .4; wallMat.color.setHex(keep.wall); floor.material = keep.floor; tops.forEach(t => t.material = keep.top); renderer.toneMappingExposure = 1; ui.toast('…y así queda ✨'); }
    } }]);
    ui.chips('Cámara', [{ v: 'a', l: 'General' }, { v: 'b', l: 'Frontal' }, { v: 'c', l: 'Detalle encimera' }], 'a', v => { const V = { a: [[4.6, 3.1, 5.2], [0, 1, -.4]], b: [[0, 1.7, 5.4], [0, 1.1, -1]], c: [[.8, 1.5, 1.6], [.2, .9, .4]] }[v]; W.view(V[0], V[1]); });
    price(); ui.hint('Arrastra para mirar la cocina');
  }
};
