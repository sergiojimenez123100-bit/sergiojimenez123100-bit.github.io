/* Gimnasio · Barra olímpica en un gimnasio real fotografiado en 360°: carga discos, levanta y calcula tu plan */
FXSTUDIO.scenes.barra = async ({ stage, ui, FX, studio }) => {
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4ff00';
  const W = await studio.world(stage, { cam: [2.6, 1.1, 2.9], target: [0, .4, 0], minD: 1.6, maxD: 6, exposure: 1, autoRotateSpeed: .4, shadows: true, fov: 45 });
  const { THREE, scene, renderer } = W;
  const ENV = { sala: ['gym_01', 1.7, 0], box: ['crossfit_gym', 1.7, 0] };
  const setEnv = async k => { ui.hint('Cargando el gimnasio…'); const [id, h, r] = ENV[k]; await studio.hdri(W, id, { res: '2k', ground: true, height: h, radius: 30, rotate: r }); ui.hint('Añade discos y pulsa «Levantar»'); };
  await setEnv('sala');
  const key = new THREE.DirectionalLight('#ffffff', 1.3); key.position.set(1.5, 4, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2 }); key.shadow.radius = 5; key.shadow.bias = -.0004; scene.add(key);
  const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: .45 })); shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = .032; shadowFloor.receiveShadow = true; scene.add(shadowFloor);

  // Tarima de halterofilia: madera real en el centro, caucho a los lados, logo pintado
  let signTxt = String(FX.BIZ.nombre || 'GYM').toUpperCase();
  const woodMat = studio.pbr(W, 'plank_flooring_02', [1.4, 1.4]);
  const logoMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: .8, depthWrite: false });
  const drawLogo = () => { logoMat.map = W.canvasTex(1024, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.globalAlpha = .82; c.font = '900 150px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = acc; c.fillText(signTxt.slice(0, 12), w / 2, h / 2); c.globalAlpha = .5; c.lineWidth = 10; c.strokeStyle = acc; c.strokeRect(40, 60, w - 80, h - 120); }); logoMat.needsUpdate = true; };
  drawLogo();
  const plat = new THREE.Mesh(new THREE.BoxGeometry(1.2, .03, 2.4), woodMat); plat.position.y = .015; plat.receiveShadow = true; scene.add(plat);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .55), logoMat); logo.rotation.x = -Math.PI / 2; logo.rotation.z = Math.PI / 2; logo.position.y = .031; scene.add(logo);
  const rubber = new THREE.MeshStandardMaterial({ color: '#141414', roughness: .95 });
  [-1, 1].forEach(s => { const r = new THREE.Mesh(new THREE.BoxGeometry(.9, .03, 2.4), rubber); r.position.set(s * 1.05, .015, 0); r.receiveShadow = true; scene.add(r); });

  // Barra olímpica 20 kg
  const steel = new THREE.MeshStandardMaterial({ color: '#c8ccd0', metalness: 1, roughness: .22 });
  const knurlTex = W.canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#8d9196'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.35)'; for (let i = -h; i < w; i += 6) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i + h, 0); c.lineTo(i, h); c.stroke(); } });
  knurlTex.wrapS = knurlTex.wrapT = THREE.RepeatWrapping; knurlTex.repeat.set(12, 1);
  const bar = new THREE.Group(); scene.add(bar);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 1.31, 32), steel); shaft.rotation.z = Math.PI / 2; bar.add(shaft);
  const knurl = new THREE.Mesh(new THREE.CylinderGeometry(.0145, .0145, .9, 32), new THREE.MeshStandardMaterial({ map: knurlTex, metalness: 1, roughness: .55 })); knurl.rotation.z = Math.PI / 2; bar.add(knurl);
  [-1, 1].forEach(s => { const sl = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .42, 32), steel); sl.rotation.z = Math.PI / 2; sl.position.x = s * .87; bar.add(sl); const col = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .03, 32), steel); col.rotation.z = Math.PI / 2; col.position.x = s * .66; bar.add(col); });
  bar.traverse(o => o.castShadow = true);

  // Discos de goma con el peso grabado en la cara
  const PL = { 25: [.225, .065, '#c1202d'], 20: [.225, .055, '#1d55c4'], 15: [.225, .045, '#e2b400'], 10: [.225, .04, '#2a8a46'], 5: [.115, .03, '#e9e9e9'], 2.5: [.095, .022, '#1a1a1a'] };
  let theme = 'comp';
  const plateColor = kg => theme === 'negro' ? '#1b1b1b' : theme === 'marca' ? acc : PL[kg][2];
  const faceTex = {};
  const face = (kg, col) => { const k = kg + col; return faceTex[k] || (faceTex[k] = W.canvasTex(512, 512, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.globalAlpha = .18; c.fillStyle = '#000'; c.beginPath(); c.arc(w / 2, h / 2, w * .45, 0, 7); c.arc(w / 2, h / 2, w * .38, 0, 7, true); c.fill(); c.globalAlpha = .55; c.fillStyle = col === '#e9e9e9' ? '#333' : '#fff'; c.font = '800 54px system-ui'; c.textAlign = 'center'; c.fillText(String(kg).replace('.', ',') + ' KG', w / 2, h * .2 + 30); c.save(); c.translate(w / 2, h * .82); c.fillText(String(FX.BIZ.nombre || '').toUpperCase().slice(0, 12), 0, 0); c.restore(); c.globalAlpha = 1; c.fillStyle = '#bfc3c7'; c.beginPath(); c.arc(w / 2, h / 2, w * .11, 0, 7); c.fill(); })); };
  const plates = [];
  const layout = () => { let off = .69; plates.slice().sort((a, b) => b.kg - a.kg).forEach(p => { const t = PL[p.kg][1]; p.L.position.x = -(off + t / 2); p.R.position.x = off + t / 2; off += t + .003; }); bar.userData.floorY = plates.reduce((m, p) => Math.max(m, PL[p.kg][0]), .225) + .03; };
  const mk = kg => { const [r, t] = PL[kg], col = plateColor(kg); const side = new THREE.MeshStandardMaterial({ color: col, roughness: .85 }), f = new THREE.MeshStandardMaterial({ map: face(kg, col), roughness: .8 }); const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 72), [side, f, f]); disc.rotation.z = Math.PI / 2; disc.castShadow = true; const g = new THREE.Group(); g.add(disc); g.userData.kg = kg; bar.add(g); return g; };
  const total = () => 20 + plates.reduce((a, p) => a + p.kg * 2, 0);
  const hud = document.createElement('div'); hud.className = 'sd-dom br-hud'; hud.innerHTML = '<small>Peso total</small><b>20<i> kg</i></b><span class="br-rec"></span>'; stage.appendChild(hud);
  let rec = 0, shown = 20, lifting = false, goal = 140, freq = 3;
  const plan = () => { const cur = total(), weeks = Math.max(0, Math.ceil((goal - cur) / (freq >= 4 ? 3.5 : freq === 3 ? 2.5 : 1.5))); ui.set('Tu plan', cur >= goal ? '¡Objetivo conseguido!' : weeks + ' semanas para ' + goal + ' kg (' + freq + ' días/sem)'); };
  const upd = () => {
    const kg = total(); ui.set('Peso en la barra', kg + ' kg'); ui.set('Discos', plates.length ? plates.map(p => String(p.kg).replace('.', ',')).join(' + ') + ' (por lado)' : 'Barra sola');
    const o = { v: shown }; if (window.gsap) gsap.to(o, { v: kg, duration: .6, onUpdate: () => hud.querySelector('b').firstChild.textContent = Math.round(o.v * 10) / 10 }); else hud.querySelector('b').firstChild.textContent = kg; shown = kg;
    layout(); if (!lifting) bar.position.y = bar.userData.floorY; plan();
  };
  const add = kg => {
    if (plates.reduce((a, p) => a + PL[p.kg][1], 0) + PL[kg][1] > .4) return ui.toast('No caben más discos en la barra');
    const p = { kg, L: mk(kg), R: mk(kg) }; plates.push(p); layout();
    if (window.gsap) [p.L, p.R].forEach(g => { const x = g.position.x; gsap.fromTo(g.position, { x: x * 1.9, y: .4 }, { x, y: 0, duration: .55, ease: 'back.out(1.4)' }); });
    upd();
  };
  bar.userData.floorY = .255; bar.position.y = .255;
  const lift = () => {
    if (lifting || !window.gsap) return; lifting = true; const kg = total(), y0 = bar.userData.floorY, heavy = Math.min(1, kg / 200);
    const tl = gsap.timeline({ onComplete: () => { lifting = false; } });
    tl.to(bar.position, { y: y0 + .05, duration: .25 + heavy * .5, ease: 'power1.in' }).to(bar.position, { y: 1.0, duration: .6 + heavy * .4, ease: 'power2.out' })
      .to(bar.rotation, { z: .02, duration: .08, yoyo: true, repeat: 5 }, '<.3').to(W.camera.position, { y: '+=' + (.02 + heavy * .05), duration: .05, yoyo: true, repeat: 7 }, '<')
      .to(bar.position, { y: y0, duration: .55, ease: 'bounce.out' }, '+=.5');
    if (kg > rec && kg > 20) { rec = kg; tl.call(() => { hud.querySelector('.br-rec').textContent = '🏆 ¡Nuevo récord! ' + kg + ' kg'; ui.toast('¡Nuevo récord personal!'); ui.set('Mejor marca', kg + ' kg'); }, null, 1.2); }
  };
  ui.chips('Añadir discos (por lado)', [25, 20, 15, 10, 5, 2.5].map(k => ({ v: String(k), l: '+' + String(k).replace('.', ',') + ' kg' })), null, (v, b) => { b.classList.remove('on'); ui.del('Añadir discos (por lado)'); add(+v); });
  ui.buttons([{ l: '🏋️ Levantar', main: true, fn: lift }, { l: '↩︎ Quitar disco', fn: () => { const p = plates.pop(); if (p) { bar.remove(p.L, p.R); upd(); } } }, { l: 'Vaciar', fn: () => { plates.splice(0).forEach(p => bar.remove(p.L, p.R)); upd(); } }]);
  ui.chips('Discos', [{ v: 'comp', l: 'Competición' }, { v: 'negro', l: 'Negro mate' }, { v: 'marca', l: 'Color del gym' }], 'comp', v => { theme = v; plates.forEach(p => [p.L, p.R].forEach(g => { const d = g.children[0], col = plateColor(p.kg); d.material[0].color.set(col); d.material[1].map = d.material[2].map = face(p.kg, col); d.material[1].needsUpdate = true; })); });
  ui.chips('Zona', [{ v: 'sala', l: 'Sala de musculación' }, { v: 'box', l: 'Box funcional' }], 'sala', v => setEnv(v));
  ui.range('Tu objetivo', { min: 40, max: 250, step: 5, value: goal, unit: ' kg' }, v => { goal = v; plan(); });
  ui.chips('Días por semana', [{ v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }, { v: '5', l: '5' }], '3', v => { freq = +v; plan(); });
  ui.text('Logo en la tarima', signTxt, v => { signTxt = (v || ' ').toUpperCase(); drawLogo(); });
  [20, 10].forEach(add);
};
