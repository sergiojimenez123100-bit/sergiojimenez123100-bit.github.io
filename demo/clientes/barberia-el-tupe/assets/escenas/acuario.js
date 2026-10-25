/* Tienda de acuarios · Acuario 3D a medida: tamaño, tipo de agua, sustrato, rocas y raíces reales (Poly Haven, CC0),
   plantas que se mecen, peces de 10 especies que nadan en banco, cristal, marco, fondo y luz con cáusticas.
   Pulsa en el agua para dar de comer. */
FXSTUDIO.scenes.acuario = async ({ stage, ui, FX, studio }) => {
  const W = await studio.world(stage, { cam: [0, .3, 2], target: [0, .22, 0], fov: 36, shadows: true, exposure: 1.05, minD: .6, maxD: 4, autoRotate: false, maxPolar: Math.PI / 1.85 });
  const { THREE } = W, S = W.scene, g = window.gsap, V3 = THREE.Vector3, rnd = (a, b) => a + Math.random() * (b - a);
  S.background = new THREE.Color('#0b0f14'); S.fog = new THREE.Fog('#0b0f14', 3.2, 7);
  studio.hdri(W, 'brown_photostudio_02', { intensity: .32 }).catch(() => {});
  W.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ---------- Cáusticas: patrón de luz del agua proyectado sobre todo lo que hay dentro ---------- */
  const U = { uTime: { value: 0 }, uWater: { value: .4 }, uBox: { value: new THREE.Vector2(.4, .17) }, uCol: { value: new THREE.Color('#e9fbff') }, uCaus: { value: 1 } };
  const CAUS = `uniform float uTime,uWater,uCaus;uniform vec2 uBox;uniform vec3 uCol;varying vec3 vWP;
vec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float cz(vec2 p,float t){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=.5+.45*sin(t+6.2831*h2(i+g));float d=length(g+o-f);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return 1.-smoothstep(0.,.2,d2-d1);}
float caus(vec2 p,float t){float v=clamp(cz(p*24.,t*.9)*.6+cz(p*37.+3.7,t*1.25)*.4,0.,1.);return v*v;}`;
  // Parchea un material: cáusticas + (opcional) ondulación de pez o balanceo de planta
  const patch = (m, o = {}) => {
    if (m.userData.aq) return m; m.userData.aq = 1;
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, o.uni || {});
      sh.vertexShader = 'varying vec3 vWP;\n' + (o.vdecl || '') + sh.vertexShader
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (o.vbody || ''))
        .replace('#include <project_vertex>', '#include <project_vertex>\n{vec4 wq=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nwq=instanceMatrix*wq;\n#endif\nvWP=(modelMatrix*wq).xyz;}');
      sh.fragmentShader = CAUS + '\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        'float inW=step(vWP.y,uWater)*step(abs(vWP.x),uBox.x)*step(abs(vWP.z),uBox.y);\ngl_FragColor.rgb+=uCol*caus(vWP.xz,uTime)*uCaus*inW*' + (o.k || '.5') + ';\n#include <dithering_fragment>');
    };
    m.customProgramCacheKey = () => 'aq' + (o.key || '') + (o.k || '');
    return m;
  };
  const SWIM = { key: 'fish', vdecl: 'uniform float fT,fA,fL;\n', vbody: 'float sw=clamp((fL*.18-transformed.x)/fL,0.,1.3);transformed.z+=sin(fT-transformed.x/fL*6.5)*fA*fL*sw*sw;' };
  const SWAY = { key: 'sway', k: '.3', vdecl: 'uniform float uTime;\n', vbody: '{float hh=max(position.y,0.);vec3 ip=vec3(0.);\n#ifdef USE_INSTANCING\nip=instanceMatrix[3].xyz;\n#endif\nfloat ph=uTime*1.1+ip.x*23.+ip.z*17.;transformed.x+=sin(ph)*hh*hh*.035;transformed.z+=cos(ph*.8)*hh*hh*.02;}' };
  const SWAYL = { key: 'swayl', k: '.3', vdecl: 'uniform float uTime;\n', vbody: '{vec3 ip=vec3(0.);\n#ifdef USE_INSTANCING\nip=instanceMatrix[3].xyz;\n#endif\nfloat a=ip.y*ip.y*1.4,ph=uTime*1.1+ip.x*9.+ip.z*7.;transformed.x+=sin(ph)*a*.25/max(length(instanceMatrix[0].xyz),.001);transformed.z+=cos(ph*.8)*a*.15/max(length(instanceMatrix[0].xyz),.001);}' };

  /* ---------- Texturas generadas: escamas (normal map), aletas, superficie del agua, rayos de luz ---------- */
  const scales = (() => {
    const n = 256, h = new Float32Array(n * n), c = 16;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const row = Math.floor(y / c * 1.4), ox = (row % 2) * c / 2, fx = ((x + ox) % c) / c, fy = (y / c * 1.4) % 1;
      h[y * n + x] = Math.max(0, 1 - Math.hypot(fx - .5, (fy - .1) * 1.1) * 1.6);
    }
    return W.canvasTex(n, n, (ctx) => {
      const im = ctx.createImageData(n, n);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = h[y * n + (x + 1) % n] - h[y * n + (x + n - 1) % n], dy = h[((y + 1) % n) * n + x] - h[((y + n - 1) % n) * n + x], l = Math.hypot(dx * 3, dy * 3, 1), i = (y * n + x) * 4;
        im.data[i] = (-dx * 3 / l * .5 + .5) * 255; im.data[i + 1] = (-dy * 3 / l * .5 + .5) * 255; im.data[i + 2] = (1 / l * .5 + .5) * 255; im.data[i + 3] = 255;
      }
      ctx.putImageData(im, 0, 0);
    });
  })();
  scales.colorSpace = THREE.NoColorSpace; scales.wrapS = scales.wrapT = THREE.RepeatWrapping; scales.repeat.set(3, 2);
  const finTex = {};
  const fin = (base, edge, a = .8, spots) => finTex[base + edge + a + spots] || (finTex[base + edge + a + spots] = W.canvasTex(128, 128, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(w, 0, 0, 0); gr.addColorStop(0, base); gr.addColorStop(1, edge);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1.2;
    for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(w, h / 2 + (i - 8) * 4); ctx.quadraticCurveTo(w * .5, h / 2 + (i - 8) * 6, 0, h / 2 + (i - 8) * 9); ctx.stroke(); }
    if (spots) { ctx.fillStyle = spots; for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(rnd(0, w * .8), rnd(0, h), rnd(2, 5), 0, 7); ctx.fill(); } }
    ctx.globalCompositeOperation = 'destination-in';
    const al = ctx.createLinearGradient(w, 0, 0, 0); al.addColorStop(0, `rgba(0,0,0,${a})`); al.addColorStop(.85, `rgba(0,0,0,${a * .75})`); al.addColorStop(1, 'rgba(0,0,0,.05)');
    ctx.fillStyle = al; ctx.fillRect(0, 0, w, h);
  }));
  const waveN = (() => {
    const n = 256, hh = (x, y) => Math.sin(x * 6.283 / n * 3) * .5 + Math.sin((x + y) * 6.283 / n * 5) * .3 + Math.sin((y * 2 - x) * 6.283 / n * 4) * .25 + Math.sin(y * 6.283 / n * 7) * .2;
    const t = W.canvasTex(n, n, (ctx) => { const im = ctx.createImageData(n, n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const dx = hh(x + 1, y) - hh(x - 1, y), dy = hh(x, y + 1) - hh(x, y - 1), l = Math.hypot(dx * 8, dy * 8, 1), i = (y * n + x) * 4; im.data[i] = (-dx * 8 / l * .5 + .5) * 255; im.data[i + 1] = (-dy * 8 / l * .5 + .5) * 255; im.data[i + 2] = (1 / l * .5 + .5) * 255; im.data[i + 3] = 255; } ctx.putImageData(im, 0, 0); });
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const rayTex = W.canvasTex(64, 256, (ctx, w, h) => { const gr = ctx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'destination-in'; const gx = ctx.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(.5, '#000'); gx.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gx; ctx.fillRect(0, 0, w, h); });

  /* ---------- Especies: forma, aletas, color, zona del acuario y comportamiento ---------- */
  const C = (h) => new THREE.Color(h), mix = (a, b, t) => a.clone().lerp(b, Math.max(0, Math.min(1, t))), band = (u, c, w) => Math.abs(u - c) < w;
  const SP = {
    neon: { n: 'Neón', i: '✨', L: .05, h: .27, w: .16, tail: ['fork', .55], dor: [.6, .48, .14, .1], ana: [.45, .3, .1, .08], eye: 1.3, iris: '#c9d4d0', iri: 1, zone: [.3, .8], v: .09, school: 1, add: 8, cm: 3, eur: 2.5, finC: ['#d8e6e0', '#ffffff', .22],
      paint: (u, vy) => vy > .05 && vy < .42 && u > .12 && u < .93 ? C('#0fb8ff') : vy < .08 && u < .58 && u > .05 ? C('#d81e34') : vy > .4 ? C('#3f4a3c') : C('#8f9b8a') },
    guppy: { n: 'Guppy', i: '🎏', L: .045, h: .3, w: .18, tail: ['fan', 1.15], dor: [.55, .38, .2, .18], ana: [.42, .32, .1, .06], eye: 1.25, iris: '#d9cf9a', iri: .4, zone: [.55, .95], v: .07, add: 3, cm: 4, eur: 4, finC: ['#ff7b1c', '#2c6dff', .85, 'rgba(10,10,20,.6)'],
      paint: (u, vy) => u < .35 && vy > -.3 ? mix(C('#9aa59b'), C('#ff8a3d'), (.35 - u) * 3) : vy > .45 ? C('#76806f') : C('#c9cfbd') },
    betta: { n: 'Betta', i: '🎐', L: .065, h: .32, w: .2, tail: ['veil', 1.7], dor: [.5, .2, .4, .32], ana: [.6, .15, .45, .38], eye: 1.1, iris: '#3a1414', iri: .9, zone: [.6, .95], v: .03, solo: 1, add: 1, cm: 6, eur: 12, finC: ['#1f3be0', '#b5122a', .92],
      paint: (u, vy) => mix(C('#1c3bd6'), C('#c4162a'), (.55 - u) * 1.8 + (vy < 0 ? .2 : 0)) },
    escalar: { n: 'Escalar', i: '🔺', L: .085, h: .78, w: .12, tail: ['lyre', .7], dor: [.62, .38, .6, .22], ana: [.56, .34, .66, .18], eye: 1.2, iris: '#b3261e', iri: .25, zone: [.35, .8], v: .045, add: 1, cm: 15, eur: 9, finC: ['#c9cdbf', '#2a2c2e', .32],
      paint: (u, vy) => band(u, .8, .035) || band(u, .53, .045) || band(u, .27, .03) ? C('#14161a') : vy > .5 ? C('#b8bba8') : C('#e7e9dd') },
    disco: { n: 'Disco', i: '🔵', L: .12, h: .95, w: .15, tail: ['fan', .38], dor: [.78, .16, .14, .05], ana: [.68, .2, .14, .05], eye: 1, iris: '#d7261e', iri: .55, zone: [.3, .75], v: .04, add: 1, cm: 15, eur: 45, finC: ['#1aa6a3', '#c0442a', .85],
      paint: (u, vy) => Math.sin(vy * 17 + Math.sin(u * 11) * 2.2) > .5 ? C('#b8452c') : band(u, .5, .02) || band(u, .3, .02) ? C('#147d7a') : C('#22b8b3') },
    cory: { n: 'Corydoras', i: '🐾', L: .05, h: .4, w: .32, tail: ['fork', .45], dor: [.62, .48, .32, .1], ana: [.38, .3, .1, .05], eye: 1.3, iris: '#2a2a2a', iri: .15, zone: [0, .08], v: .03, school: 1, add: 4, cm: 5, eur: 5, finC: ['#e3d5b4', '#ffffff', .4, 'rgba(40,30,20,.6)'],
      paint: (u, vy, vz, i) => (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 > .86 ? C('#3b3126') : vy > .4 ? C('#8f8064') : C('#d5c49b') },
    cometa: { n: 'Cometa', i: '🐠', L: .1, h: .42, w: .3, tail: ['fork', 1.05], dor: [.6, .36, .22, .12], ana: [.36, .28, .12, .06], eye: 1.2, iris: '#e0b04a', iri: .3, zone: [.15, .95], v: .065, add: 1, cm: 20, eur: 6, finC: ['#ff8a1e', '#ffd28a', .7],
      paint: (u, vy, vz, i, var2) => var2 && Math.sin(u * 13 + vy * 4) > .45 ? C('#f4efe6') : vy < -.35 ? C('#ffc04a') : C('#ff6d0d') },
    oranda: { n: 'Oranda', i: '🏮', L: .09, h: .62, w: .5, tail: ['veil', 1.2], dor: [.62, .3, .28, .14], ana: [.3, .22, .2, .1], eye: 1.1, iris: '#1d1d1d', iri: .2, zone: [.15, .9], v: .035, add: 1, cm: 18, eur: 14, finC: ['#ff5a1a', '#ffe2c8', .62],
      paint: (u, vy) => u > .78 && vy > .1 ? C('#ff3d14') : vy < -.3 ? C('#ffb24a') : C('#ff6a12') },
    payaso: { n: 'Payaso', i: '🤡', L: .08, h: .45, w: .25, tail: ['fan', .48], dor: [.72, .3, .2, .08], ana: [.4, .26, .14, .06], eye: 1.2, iris: '#e05a0a', iri: .3, zone: [.2, .7], v: .05, add: 2, cm: 9, eur: 29, finC: ['#ff6a00', '#0d0d0d', .95],
      paint: (u) => [[.8, .045], [.5, .06], [.1, .035]].some(([c, w]) => band(u, c, w)) ? C('#f7f7f2') : [[.8, .06], [.5, .075], [.1, .05]].some(([c, w]) => band(u, c, w)) ? C('#101010') : C('#ff6200') },
    cirujano: { n: 'Cirujano azul', i: '💙', L: .13, h: .6, w: .14, tail: ['fork', .5], dor: [.75, .2, .14, .04], ana: [.62, .22, .12, .04], eye: 1, iris: '#121212', iri: .7, zone: [.2, .9], v: .1, solo: 1, add: 1, cm: 30, eur: 79, finC: ['#1b3fd4', '#0b0b14', .95],
      paint: (u, vy) => u < .2 && Math.abs(vy) < .55 ? C('#ffd21c') : (Math.abs(vy - (.25 + Math.sin(u * 5) * .2)) < .17 && u > .25 && u < .85) || (vy > .55 && u > .3) ? C('#0b0c18') : C('#1f4ae3') }
  };
  const TYPES = { tropical: { l: 'Tropical (agua dulce)', fish: ['neon', 'guppy', 'betta', 'escalar', 'disco', 'cory'], temp: '24–26 °C · pH 6,5–7', sub: 'arena', water: '#4f9c8a' },
    marino: { l: 'Marino', fish: ['payaso', 'cirujano'], temp: '25 °C · salinidad 1,025', sub: 'coral', water: '#3f8fd0' },
    fria: { l: 'Agua fría', fish: ['cometa', 'oranda'], temp: '18–22 °C · pH 7–7,5', sub: 'grava', water: '#7f9a6a' } };

  /* ---------- Geometría de pez: cuerpo torneado, aletas, ojos y colores por vértice ---------- */
  const prof = u => u < .62 ? .1 + .9 * Math.pow(Math.sin(u / .62 * Math.PI / 2), 1.25) : Math.sqrt(Math.max(0, 1 - Math.pow((u - .62) / .38, 2)));
  const geoCache = {};
  function fishGeo(k, variant) {
    const id = k + (variant || ''); if (geoCache[id]) return geoCache[id];
    const sp = SP[k], L = sp.L * 1.45, H = L * sp.h, Wd = L * sp.w, pts = [];
    for (let i = 0; i <= 44; i++) { const u = i / 44; pts.push(new THREE.Vector2(Math.max(prof(u), .0005), (u - .5) * L)); }
    const body = new THREE.LatheGeometry(pts, 40); body.rotateZ(-Math.PI / 2);
    const p = body.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i) * H / 2, z = p.getZ(i) * Wd / 2, u = x / L + .5, r = Math.max(prof(u), .01), vy = y / (H / 2 * r);
      p.setXYZ(i, x, y < 0 ? y * .92 : y, z);
      c.copy(sp.paint(u, vy, z, i, variant)); c.lerp(C('#f2f2ea'), Math.max(0, -vy - .55) * .35); c.multiplyScalar(vy > .6 ? .82 : 1);
      col.set([c.r, c.g, c.b], i * 3);
    }
    body.setAttribute('color', new THREE.BufferAttribute(col, 3)); body.computeVertexNormals();
    const top = x => H / 2 * prof(x / L + .5), T = L * sp.tail[1], s = new THREE.Shape(), ty = sp.tail[0];
    if (ty === 'fork') { s.moveTo(0, .07 * T); s.quadraticCurveTo(-.25 * T, .18 * T, -.6 * T, .42 * T); s.quadraticCurveTo(-.4 * T, .1 * T, -.32 * T, 0); s.quadraticCurveTo(-.4 * T, -.1 * T, -.6 * T, -.42 * T); s.quadraticCurveTo(-.25 * T, -.18 * T, 0, -.07 * T); }
    else if (ty === 'fan') { s.moveTo(0, .06 * T); s.bezierCurveTo(-.3 * T, .36 * T, -.66 * T, .42 * T, -.62 * T, 0); s.bezierCurveTo(-.66 * T, -.42 * T, -.3 * T, -.36 * T, 0, -.06 * T); }
    else if (ty === 'veil') { s.moveTo(0, .08 * T); s.bezierCurveTo(-.4 * T, .5 * T, -.9 * T, .32 * T, -1 * T, -.12 * T); s.bezierCurveTo(-.86 * T, -.58 * T, -.35 * T, -.58 * T, 0, -.08 * T); }
    else { s.moveTo(0, .07 * T); s.quadraticCurveTo(-.3 * T, .2 * T, -.85 * T, .6 * T); s.quadraticCurveTo(-.45 * T, .14 * T, -.3 * T, 0); s.quadraticCurveTo(-.45 * T, -.14 * T, -.85 * T, -.6 * T); s.quadraticCurveTo(-.3 * T, -.2 * T, 0, -.07 * T); }
    const tail = new THREE.ShapeGeometry(s, 10); tail.translate(-L * .47, 0, 0);
    const vfin = ([a, b, hh, sw], down) => { const xa = (a - .5) * L, xb = (b - .5) * L, sg = down ? -1 : 1, ya = sg * top(xa) * .82, yb = sg * top(xb) * .8, f = new THREE.Shape(); f.moveTo(xa, ya); f.quadraticCurveTo(xa - L * .05, ya + sg * L * hh * .9, xb - L * sw, sg * (Math.max(Math.abs(ya), Math.abs(yb)) + L * hh)); f.quadraticCurveTo(xb - L * sw * .3, yb + sg * L * hh * .2, xb, yb); f.lineTo(xa, ya); return new THREE.ShapeGeometry(f, 8); };
    const pec = new THREE.Shape(); pec.absellipse(0, 0, L * .1, L * .04, 0, Math.PI * 2); const pg = new THREE.ShapeGeometry(pec, 12); pg.translate(-L * .09, 0, 0);
    const fins = [tail, vfin(sp.dor), vfin(sp.ana, 1)];
    [...fins, pg].forEach(gq => { gq.computeBoundingBox(); const bb = gq.boundingBox, uv = gq.attributes.uv, pq = gq.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pq.getX(i) - bb.min.x) / (bb.max.x - bb.min.x || 1), (pq.getY(i) - bb.min.y) / (bb.max.y - bb.min.y || 1)); });
    const ex = (.84 - .5) * L, er = L * .045 * sp.eye;
    return (geoCache[id] = { body, fins, pec: pg, L, H, Wd, eye: [ex, top(ex) * .2, Wd / 2 * prof(.84) * .9, er], pecPos: [(.66 - .5) * L, -top((.66 - .5) * L) * .25, Wd / 2 * prof(.66) * .95] });
  }
  const eyeGeo = new THREE.SphereGeometry(1, 16, 12), pupilMat = new THREE.MeshPhysicalMaterial({ color: '#030303', roughness: .05, clearcoat: 1 }), irisMats = {};

  /* ---------- Acuario: cristal, agua, sustrato, fondo, marco, luz y mueble ---------- */
  const SIZES = { 60: [.6, .36, .3], 120: [.8, .45, .35], 240: [1.2, .5, .42], 450: [1.5, .6, .5] };
  const PRICE = { 60: 169, 120: 319, 240: 569, 450: 1040 };
  const SUBS = { arena: ['coast_sand_01', 'Arena fina', {}], grava: ['ganges_river_pebbles', 'Grava de río', {}], negra: ['coast_sand_01', 'Arena negra', { color: '#2d2c2a' }], coral: ['coral_gravel', 'Arena coralina', {}] };
  const GLASS = { claro: ['Extraclaro', '#ffffff', '#d9f2ef', .06], normal: ['Float (verdoso)', '#e7fff7', '#6fb79f', .08], ahumado: ['Ahumado', '#9aa0a3', '#4b5052', .2], azul: ['Azulado', '#cfe6ff', '#7fb2e6', .1] };
  const LIGHTS = { dia: ['Día', '#f2fbff', 2.4, '#e9fbff', 1], amanecer: ['Amanecer', '#ffcf9a', 2.4, '#ffe2bd', .8], plantada: ['Plantada RGB', '#ffb8f2', 2.8, '#ffd6ff', .9], noche: ['Luna azul', '#4f7dff', 1.1, '#8fb0ff', .55] };
  let size = 120, type = 'tropical', sub = 'arena', glass = 'claro', back = 'negro', frame = 'sin', light = 'dia', bubblesOn = true;
  let w, h, d, wy, tank = null, subMesh = null, subMat = null, waterMat = null, surf = null;
  const fish = [], decor = [], flakes = [], schools = {};
  const subH = (x, z) => .03 + .055 * (.5 - z / d) + Math.sin(x * 9) * .006 + Math.sin(z * 13 + x * 4) * .004;
  const sun = new THREE.DirectionalLight('#f2fbff', 2.4); sun.position.set(.2, 2.4, .5); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: .5, far: 4 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .01;
  S.add(sun, sun.target, new THREE.HemisphereLight('#9fb8c8', '#1a1410', .35));
  const fill = new THREE.PointLight('#bfe6ff', .4, 3); fill.position.set(0, .3, 1.2); S.add(fill);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: .03, metalness: 0, transparent: true, opacity: .03, envMapIntensity: 2.2, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const edgeMat = new THREE.MeshPhysicalMaterial({ color: '#d9f2ef', roughness: .08, transparent: true, opacity: .55, clearcoat: 1 });
  const woodMat = studio.pbr(W, 'dark_wood', [2, 1]);
  const frameMats = { negro: new THREE.MeshStandardMaterial({ color: '#111214', roughness: .4 }), blanco: new THREE.MeshStandardMaterial({ color: '#eceae4', roughness: .45 }), madera: studio.pbr(W, 'walnut_veneer', [3, .2]) };
  const standMat = studio.pbr(W, 'walnut_veneer', [2, 1]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), studio.pbr(W, 'dark_wood', [8, 8], { color: '#6d5a4a' })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.72; floor.receiveShadow = true; S.add(floor);
  const box = (sx, sy, sz, m, x, y, z, sh) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); o.position.set(x, y, z); if (sh) { o.castShadow = o.receiveShadow = true; } return o; };
  function buildTank() {
    if (tank) { decor.forEach(it => it.g && tank.remove(it.g)); fish.forEach(f => tank.remove(f.g)); S.remove(tank); tank.traverse(o => { if (o.geometry && !o.userData.keep) o.geometry.dispose(); }); }
    [w, h, d] = SIZES[size]; wy = h * .93; tank = new THREE.Group(); S.add(tank);
    U.uWater.value = wy; U.uBox.value.set(w / 2 - .006, d / 2 - .006);
    const t = .006;
    [[w, h, t, 0, h / 2, d / 2], [w, h, t, 0, h / 2, -d / 2], [t, h, d, w / 2, h / 2, 0], [t, h, d, -w / 2, h / 2, 0], [w, t, d, 0, t / 2, 0]].forEach(a => { const m = box(a[0], a[1], a[2], glassMat, a[3], a[4], a[5]); m.renderOrder = 6; tank.add(m); });
    // cantos del cristal: delatan el grosor y el tono (verde en el float, casi blanco en el extraclaro)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) tank.add(box(.007, h, .007, edgeMat, sx * w / 2, h / 2, sz * d / 2));
    for (const y of [0, h]) for (const sz of [-1, 1]) tank.add(box(w, .007, .007, edgeMat, 0, y, sz * d / 2));
    for (const y of [0, h]) for (const sx of [-1, 1]) tank.add(box(.007, .007, d, edgeMat, sx * w / 2, y, 0));
    if (frame !== 'sin') { const fm = frameMats[frame]; for (const y of [.012, h - .012]) { tank.add(box(w + .02, .026, .016, fm, 0, y, d / 2 + .004, 1), box(w + .02, .026, .016, fm, 0, y, -d / 2 - .004, 1), box(.016, .026, d + .02, fm, w / 2 + .004, y, 0, 1), box(.016, .026, d + .02, fm, -w / 2 - .004, y, 0, 1)); } }
    // agua: volumen tintado + superficie con oleaje
    waterMat = new THREE.MeshPhysicalMaterial({ color: TYPES[type].water, transparent: true, opacity: .07, roughness: .1, depthWrite: false });
    const wv = new THREE.Mesh(new THREE.BoxGeometry(w - .014, wy - .006, d - .014), waterMat); wv.position.y = (wy + .006) / 2; wv.renderOrder = 5; tank.add(wv);
    surf = new THREE.Mesh(new THREE.PlaneGeometry(w - .014, d - .014), new THREE.MeshPhysicalMaterial({ color: '#dff6ff', transparent: true, opacity: .32, roughness: .04, normalMap: waveN, normalScale: new THREE.Vector2(.5, .5), side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 2.5 }));
    surf.rotation.x = -Math.PI / 2; surf.position.y = wy; surf.renderOrder = 5; surf.material.normalMap.repeat.set(w * 3, d * 3); tank.add(surf);
    // sustrato con pendiente hacia atrás y frente visible a través del cristal
    const sg = new THREE.PlaneGeometry(w - .014, d - .014, 80, 36); sg.rotateX(-Math.PI / 2);
    const sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) sp.setY(i, subH(sp.getX(i), sp.getZ(i))); sg.computeVertexNormals();
    subMesh = new THREE.Mesh(sg, subMat || setSub(sub, true)); subMesh.receiveShadow = true; tank.add(subMesh);
    const fg = new THREE.PlaneGeometry(w - .014, 1, 60, 1), fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) fp.setY(i, fp.getY(i) > 0 ? subH(fp.getX(i), d / 2 - .008) : .004);
    const front = new THREE.Mesh(fg, subMesh.material); front.position.z = d / 2 - .0075; tank.add(front); subMesh.userData.front = front;
    // fondo trasero
    const bk = { negro: new THREE.MeshStandardMaterial({ color: '#040506', roughness: .7 }), azul: new THREE.MeshBasicMaterial({ map: W.canvasTex(4, 256, (c, a, b) => { const gr = c.createLinearGradient(0, 0, 0, b); gr.addColorStop(0, '#2b7fd0'); gr.addColorStop(1, '#03122a'); c.fillStyle = gr; c.fillRect(0, 0, a, b); }) }), esmerilado: new THREE.MeshBasicMaterial({ map: W.canvasTex(4, 256, (c, a, b) => { const gr = c.createLinearGradient(0, 0, 0, b); gr.addColorStop(0, '#f4fbff'); gr.addColorStop(1, '#8fb3c9'); c.fillStyle = gr; c.fillRect(0, 0, a, b); }) }) }[back];
    if (bk) tank.add(box(w, h, .004, bk, 0, h / 2, -d / 2 - .006));
    // pantalla LED sobre patas y mueble
    tank.add(box(w * .96, .012, .07, frameMats.negro, 0, h + .05, 0, 1));
    const strip = box(w * .9, .002, .04, new THREE.MeshBasicMaterial({ color: LIGHTS[light][1] }), 0, h + .043, 0); strip.userData.led = 1; tank.add(strip);
    for (const sx of [-1, 1]) tank.add(box(.01, .05, .05, frameMats.negro, sx * w * .46, h + .022, 0));
    tank.add(box(w + .06, .7, d + .06, standMat, 0, -.35 - .004, 0, 1), box(w + .06, .02, d + .06, woodMat, 0, -.012, 0, 1));
    // termocalentador, difusor y rayos de luz
    if (type !== 'fria') { const ht = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, h * .55, 16), new THREE.MeshPhysicalMaterial({ color: '#cfe7ff', transparent: true, opacity: .45, roughness: .05, clearcoat: 1 })); ht.position.set(w / 2 - .03, h * .5, -d / 2 + .03); ht.rotation.z = .08; tank.add(ht); }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.012, .014, .012, 18), new THREE.MeshStandardMaterial({ color: '#4a4d50', roughness: .95 })); st.position.set(-w / 2 + .06, subH(-w / 2 + .06, -d / 2 + .05) + .004, -d / 2 + .05); tank.add(st); bubbles.from.copy(st.position);
    rays.length = 0;
    for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(rnd(.04, .1), wy * 1.05), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, opacity: .05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, color: LIGHTS[light][3] })); r.position.set(rnd(-w / 2.4, w / 2.4), wy / 2, rnd(-d / 3, d / 4)); r.rotation.set(0, rnd(-.4, .4), rnd(-.18, .18)); r.renderOrder = 4; r.userData.ph = rnd(0, 6); tank.add(r); rays.push(r); }
    // motas en suspensión que atrapan la luz
    const mp = new Float32Array(240 * 3); for (let i = 0; i < 240; i++) mp.set([rnd(-w / 2, w / 2) * .95, rnd(.05, wy * .95), rnd(-d / 2, d / 2) * .9], i * 3);
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    motes = new THREE.Points(mg, new THREE.PointsMaterial({ size: .0025, color: '#eaf6ff', transparent: true, opacity: .55, depthWrite: false })); tank.add(motes);
    tank.add(bubbles.mesh, flakeMesh);
    sun.target.position.set(0, h / 2, 0); sun.position.set(.15, h + 2, .45);
    applyGlass(); applyLight();
    decor.forEach(placeDecor); fish.forEach(f => { f.pos.set(rnd(-w / 2.5, w / 2.5), rnd(.1, wy - .05), rnd(-d / 3, d / 3)); f.g.position.copy(f.pos); tank.add(f.g); });
    W.view([0, h * .58, frontDist()], [0, h * .45, 0], 1.2);
    stats();
  }
  let motes = null; const rays = [];
  const frontDist = () => Math.max(w * 1.75, 1.25) * Math.max(1, 1.25 / (stage.clientWidth / (stage.clientHeight || 1)));
  function setSub(k, ret) {
    const s = SUBS[k]; sub = k; const m = studio.pbr(W, s[0], [1, 1], s[2]); ['map', 'normalMap', 'roughnessMap'].forEach(t => m[t] && m[t].repeat.set(4, 2)); patch(m, { k: '.5' }); subMat = m;
    if (ret) return m; subMesh.material = m; subMesh.userData.front.material = m; stats(); return m;
  }
  function applyGlass() { const gq = GLASS[glass]; glassMat.color.set(gq[1]); glassMat.opacity = gq[3]; edgeMat.color.set(gq[2]); }
  function applyLight() {
    const l = LIGHTS[light]; sun.color.set(l[1]); sun.intensity = l[2]; U.uCol.value.set(l[3]); U.uCaus.value = l[4];
    S.background.set(light === 'noche' ? '#05070d' : '#0b0f14'); S.fog.color.copy(S.background);
    rays.forEach(r => r.material.color.set(l[3])); if (tank) tank.traverse(o => { if (o.userData.led) o.material.color.set(l[1]); });
  }

  /* ---------- Burbujas y comida ---------- */
  const bubbles = { mesh: new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: .45, roughness: 0, envMapIntensity: 3, clearcoat: 1, depthWrite: false }), 70), from: new V3(), p: [] };
  bubbles.mesh.userData.keep = 1; bubbles.mesh.frustumCulled = false; bubbles.mesh.renderOrder = 3;
  for (let i = 0; i < 70; i++) bubbles.p.push({ y: Math.random(), x: 0, z: 0, s: rnd(.0015, .0045), ph: rnd(0, 6), v: rnd(.12, .22) });
  const flakeMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(.007, .006), new THREE.MeshStandardMaterial({ color: '#d9822b', side: THREE.DoubleSide, roughness: .8 }), 60);
  flakeMesh.userData.keep = 1; flakeMesh.count = 0; flakeMesh.frustumCulled = false;
  function feed(x, z) { for (let i = 0; i < 14 && flakes.length < 60; i++) flakes.push({ p: new V3(x + rnd(-.04, .04), wy - .002, z + rnd(-.03, .03)), r: rnd(0, 6), v: rnd(.006, .014) }); ui.hint('¡A comer! Los peces suben a por la comida'); setTimeout(() => ui.hint(''), 2500); }

  /* ---------- Peces ---------- */
  function addFish(k, variant) {
    const sp = SP[k], G = fishGeo(k, variant), uni = { fT: { value: rnd(0, 20) }, fA: { value: .1 }, fL: { value: G.L } };
    const body = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .3, metalness: .06, clearcoat: .45, clearcoatRoughness: .3, iridescence: sp.iri * .6, iridescenceIOR: 1.5, normalMap: scales, normalScale: new THREE.Vector2(.3, .3), envMapIntensity: .7 });
    patch(body, Object.assign({ uni }, SWIM));
    const fc = sp.finC, fm = patch(new THREE.MeshPhysicalMaterial({ map: fin(fc[0], fc[1], fc[2], fc[3]), transparent: true, side: THREE.DoubleSide, roughness: .45, depthWrite: false, iridescence: sp.iri * .5 }), Object.assign({ uni }, SWIM));
    const grp = new THREE.Group(), bm = new THREE.Mesh(G.body, body); bm.castShadow = true; grp.add(bm);
    G.fins.forEach(fg => { const m = new THREE.Mesh(fg, fm); m.renderOrder = 1; grp.add(m); });
    const pecs = [-1, 1].map(sg => { const m = new THREE.Mesh(G.pec, fm); m.position.set(G.pecPos[0], G.pecPos[1], sg * G.pecPos[2]); m.rotation.y = sg * .7; grp.add(m); return m; });
    const im = irisMats[sp.iris] || (irisMats[sp.iris] = new THREE.MeshPhysicalMaterial({ color: sp.iris, roughness: .2, clearcoat: 1 }));
    [-1, 1].forEach(sg => { const [ex, ey, ez, er] = G.eye; const e = new THREE.Mesh(eyeGeo, im); e.scale.setScalar(er); e.position.set(ex, ey, sg * ez); const pu = new THREE.Mesh(eyeGeo, pupilMat); pu.scale.setScalar(.62); pu.position.z = sg * .5; e.add(pu); grp.add(e); });
    grp.rotation.order = 'YZX';
    const f = { k, sp, g: grp, uni, pecs, pos: new V3(rnd(-w / 3, w / 3), rnd(.12, wy - .05), rnd(-d / 3, d / 3)), vel: new V3(rnd(-.02, .02), 0, rnd(-.02, .02)), tgt: new V3(), t: 0, sp0: rnd(.7, 1.15), yaw: 0, pitch: 0, roll: 0 };
    if (sp.school) { const s = schools[k] || (schools[k] = { lead: null }); if (!s.lead || !fish.includes(s.lead)) s.lead = f; else f.off = new V3(rnd(-.06, .06), rnd(-.03, .03), rnd(-.05, .05)); }
    grp.position.copy(f.pos); retarget(f); tank.add(grp); fish.push(f);
    if (g) g.from(grp.scale, { x: .01, y: .01, z: .01, duration: .8, ease: 'back.out(2)' });
    return f;
  }
  function zoneY(sp) { const lo = subH(0, 0) + .03, hi = wy - .025; return [lo + (hi - lo) * sp.zone[0], lo + (hi - lo) * sp.zone[1]]; }
  function retarget(f) {
    const [y0, y1] = zoneY(f.sp); let x = rnd(-w / 2 + .06, w / 2 - .06), z = rnd(-d / 2 + .05, d / 2 - .05);
    const an = f.k === 'payaso' && decor.find(o => o.k === 'anemona'); if (an && Math.random() < .7) { x = an.g.position.x + rnd(-.05, .05); z = an.g.position.z + rnd(-.04, .04); }
    f.tgt.set(x, f.sp.zone[1] < .1 ? subH(x, z) + .012 + f.sp.L * .3 : rnd(y0, y1), z); f.t = rnd(3, 8); f.sp0 = rnd(.55, 1.2);
  }
  const tmp = new V3(), des = new V3();
  function swim(f, dt) {
    const sp = f.sp, s = schools[f.k]; let speed = sp.v * f.sp0;
    const food = flakes.length && sp.zone[1] > .1 ? flakes.reduce((b, q) => (!b || q.p.distanceToSquared(f.pos) < b.p.distanceToSquared(f.pos) ? q : b), null) : null;
    if (food) { f.tgt.copy(food.p); speed = sp.v * 2.2; if (food.p.distanceTo(f.pos) < f.sp.L * .9) flakes.splice(flakes.indexOf(food), 1); }
    else if (f.off && s && s.lead && fish.includes(s.lead)) { f.tgt.copy(s.lead.pos).add(f.off); speed = sp.v * (1 + Math.min(1.2, f.pos.distanceTo(f.tgt) * 6)); }
    else if ((f.t -= dt) < 0 || f.pos.distanceTo(f.tgt) < .03) retarget(f);
    des.subVectors(f.tgt, f.pos); const dist = des.length(); des.setLength(speed * Math.min(1, dist / .06));
    // muros: el pez gira antes de tocar el cristal
    const mx = w / 2 - .04, mz = d / 2 - .035;
    if (f.pos.x > mx - .03) des.x -= .05; if (f.pos.x < -mx + .03) des.x += .05; if (f.pos.z > mz - .03) des.z -= .05; if (f.pos.z < -mz + .03) des.z += .05;
    f.vel.lerp(des, 1 - Math.exp(-dt * (food ? 4 : 1.6)));
    f.pos.addScaledVector(f.vel, dt); f.pos.x = Math.max(-mx, Math.min(mx, f.pos.x)); f.pos.z = Math.max(-mz, Math.min(mz, f.pos.z));
    f.pos.y = Math.max(subH(f.pos.x, f.pos.z) + .008 + sp.L * .25, Math.min(wy - .015, f.pos.y));
    const v = f.vel.length();
    if (v > .004) { const yaw = Math.atan2(-f.vel.z, f.vel.x); let dy = yaw - f.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); f.yaw += dy * Math.min(1, dt * 4); f.roll += (-dy * .6 - f.roll) * Math.min(1, dt * 3); const pt = Math.max(-.45, Math.min(.45, Math.atan2(f.vel.y, Math.hypot(f.vel.x, f.vel.z)))); f.pitch += (pt - f.pitch) * Math.min(1, dt * 3); }
    f.g.position.copy(f.pos); f.g.rotation.set(f.roll, f.yaw, f.pitch);
    f.uni.fT.value += dt * (5 + v / sp.L * 7); f.uni.fA.value = .06 + Math.min(.16, v / sp.v * .08) + Math.abs(f.roll) * .15;
    const fl = Math.sin(f.uni.fT.value * 1.3) * .35; f.pecs[0].rotation.y = -.7 - fl; f.pecs[1].rotation.y = .7 + fl;
  }
  function removeFish(k) { const i = fish.map(f => f.k).lastIndexOf(k); if (i < 0) return; const f = fish.splice(i, 1)[0]; tank.remove(f.g); if (schools[k] && schools[k].lead === f) { const nx = fish.find(o => o.k === k); schools[k].lead = nx || null; if (nx) delete nx.off; } }

  /* ---------- Decoración: rocas y raíces reales, plantas y corales ---------- */
  const MODELS = { roca: ['rock_moss_set_01', 'namaqualand_boulder_02', 'rock_07', 'stone_01'], raiz: ['pine_roots', 'root_cluster_01', 'single_root', 'dead_quiver_branch_01'], helecho: ['fern_02'], musgo: ['moss_01'], concha: ['lambis_shell'] };
  const DEC = { roca: ['🪨', 'Roca', 9, [.13, .22]], raiz: ['🪵', 'Raíz / madera', 19, [.26, .42]], plantas: ['🌿', 'Plantas altas', 12], roja: ['🌺', 'Planta roja', 9], helecho: ['🌱', 'Helecho', 8, [.09, .13]], musgo: ['🍀', 'Musgo tapizante', 7, [.08, .12]], concha: ['🐚', 'Caracola', 12, [.06, .09]], coral: ['🪸', 'Coral', 35], anemona: ['🌸', 'Anémona', 49] };
  const DEC_BY = { tropical: ['roca', 'raiz', 'plantas', 'roja', 'helecho', 'musgo'], marino: ['roca', 'coral', 'anemona', 'concha'], fria: ['roca', 'raiz', 'plantas', 'helecho'] };
  const mcache = {};
  async function model(id, sz) {
    const src = mcache[id] || (mcache[id] = studio.model(W, id, { size: 1 }).then(m => { m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); patch(o.material, { k: '.45' }); } }); return m; }));
    const m = (await src).clone(); m.scale.setScalar(sz); return m;
  }
  const leafMat = (c1, c2) => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .6 }); m.userData.c = [c1, c2]; return m; };
  function vallis(n, hMax, c1, c2) {
    const gq = new THREE.PlaneGeometry(.007, 1, 1, 12); gq.translate(0, .5, 0);
    const pq = gq.attributes.position, col = new Float32Array(pq.count * 3), a = C(c1), b = C(c2), c = new THREE.Color();
    for (let i = 0; i < pq.count; i++) { const y = pq.getY(i); pq.setX(i, pq.getX(i) * (1 - y * .3)); c.copy(a).lerp(b, y); col.set([c.r, c.g, c.b], i * 3); }
    gq.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.InstancedMesh(gq, patch(leafMat(), SWAY), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const r = Math.sqrt(Math.random()) * .035, an = rnd(0, 6.3); o.position.set(Math.cos(an) * r, 0, Math.sin(an) * r); o.rotation.set(rnd(-.12, .12), rnd(0, 3.14), rnd(-.12, .12)); o.scale.set(1, hMax * rnd(.55, 1), 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    m.castShadow = true; return m;
  }
  function stems(nStem, hMax, c1, c2) {
    const leaf = new THREE.CircleGeometry(1, 10); leaf.scale(.011, .004, 1); leaf.translate(.011, 0, 0);
    const per = 16, m = new THREE.InstancedMesh(leaf, patch(new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .55 }), SWAYL), nStem * per * 2), o = new THREE.Object3D(), a = C(c1), b = C(c2); let k = 0;
    for (let s = 0; s < nStem; s++) { const bx = rnd(-.03, .03), bz = rnd(-.03, .03), hh = hMax * rnd(.6, 1); for (let i = 0; i < per; i++) for (const sg of [0, Math.PI]) { const y = (i + 1) / per * hh; o.position.set(bx + Math.sin(y * 9 + s) * .004, y, bz); o.rotation.set(rnd(-.3, .3), sg + i * .9, -.35); o.scale.setScalar(.7 + .5 * (1 - i / per)); o.updateMatrix(); m.setMatrixAt(k, o.matrix); m.setColorAt(k++, a.clone().lerp(b, i / per)); } }
    m.castShadow = true; return m;
  }
  function coral() {
    const grp = new THREE.Group(), col = ['#ff7aa8', '#ffb15c', '#b78cff', '#57e0c8'][Math.floor(rnd(0, 4))];
    const mat = patch(new THREE.MeshStandardMaterial({ color: col, roughness: .7, emissive: col, emissiveIntensity: .08 }), { k: '.3' });
    const branch = (p, dir, len, r, depth) => { const e = p.clone().addScaledVector(dir, len), c = new THREE.Mesh(new THREE.CylinderGeometry(r * .7, r, len, 8), mat); c.position.copy(p).add(e).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir); c.castShadow = true; grp.add(c); const tip = new THREE.Mesh(new THREE.SphereGeometry(r * .75, 8, 6), mat); tip.position.copy(e); grp.add(tip); if (depth > 0) for (let i = 0; i < 2 + (depth > 1 ? 1 : 0); i++) branch(e, dir.clone().add(new V3(rnd(-.7, .7), rnd(.2, .6), rnd(-.7, .7))).normalize(), len * .78, r * .72, depth - 1); };
    branch(new V3(), new V3(0, 1, 0), .035, .007, 3); return grp;
  }
  function anemone() {
    const grp = new THREE.Group(), tg = new THREE.CapsuleGeometry(.0028, .045, 3, 6); tg.translate(0, .025, 0);
    const m = new THREE.InstancedMesh(tg, patch(new THREE.MeshStandardMaterial({ color: '#d58bd6', roughness: .5, emissive: '#7a2b7d', emissiveIntensity: .25 }), SWAY), 140), o = new THREE.Object3D();
    for (let i = 0; i < 140; i++) { const r = Math.sqrt(Math.random()) * .045, an = rnd(0, 6.3); o.position.set(Math.cos(an) * r, .01, Math.sin(an) * r); o.rotation.set(Math.sin(an) * r * 14, 0, -Math.cos(an) * r * 14); o.scale.setScalar(rnd(.7, 1.2)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    const base = new THREE.Mesh(new THREE.SphereGeometry(.05, 20, 10, 0, 6.3, 0, 1.2), new THREE.MeshStandardMaterial({ color: '#8a4b6f', roughness: .8 })); base.scale.y = .35;
    grp.add(base, m); return grp;
  }
  async function addDecor(k, at) {
    const it = { k, rx: at ? at[0] : rnd(-.8, .8), rz: at ? at[1] : (k === 'plantas' || k === 'roja' ? rnd(-.85, -.3) : rnd(-.7, .15)), ry: rnd(0, 6.3), s: 1 }, sc = Math.min(1.25, (SIZES[size][0] / .8) ** .6);
    let o;
    if (MODELS[k]) { ui.hint('Colocando ' + DEC[k][1].toLowerCase() + '…'); const id = MODELS[k][Math.floor(rnd(0, MODELS[k].length))]; o = await model(id, rnd(...DEC[k][3]) * sc); ui.hint(''); }
    else if (k === 'plantas') o = vallis(type === 'marino' ? 10 : 26, h * rnd(.6, .85), '#2c5a1e', type === 'fria' ? '#a5c46a' : '#7fcf4a');
    else if (k === 'roja') o = stems(6, h * rnd(.35, .5), '#5f8a2c', '#e0472e');
    else if (k === 'coral') o = coral();
    else if (k === 'anemona') o = anemone();
    if (!o) return;
    it.g = o; o.traverse(q => { if (q.isMesh) q.castShadow = q.receiveShadow = true; }); decor.push(it); placeDecor(it); tank.add(o);
    if (g) g.from(o.position, { y: wy, duration: .9, ease: 'bounce.out' });
    stats(); return it;
  }
  function placeDecor(it) { if (!it.g) return; const x = it.rx * (w / 2 - .06), z = it.rz * (d / 2 - .05); it.g.position.set(x, subH(x, z) - .004, z); it.g.rotation.y = it.ry; if (it.g.parent !== tank && tank) tank.add(it.g); }
  function clearDecor() { decor.splice(0).forEach(it => tank.remove(it.g)); }
  function clearFish() { fish.splice(0).forEach(f => tank.remove(f.g)); Object.keys(schools).forEach(k => delete schools[k]); }

  /* ---------- Panel de datos: litros, carga, compatibilidad y presupuesto ---------- */
  const mon = document.createElement('div'); mon.className = 'vt-mon aq-mon'; stage.appendChild(mon);
  function stats() {
    if (!w) return;
    const L = Math.round(w * h * d * 1000 * .9), cnt = {}; fish.forEach(f => cnt[f.k] = (cnt[f.k] || 0) + 1);
    const load = Math.round(fish.reduce((a, f) => a + f.sp.cm, 0) / L * 100), warn = [];
    if ((cnt.betta || 0) > 1) warn.push('Más de un betta macho: se pelean');
    if (cnt.escalar && cnt.neon) warn.push('El escalar adulto puede comerse a los neones');
    if (cnt.disco && L < 200) warn.push('El disco necesita 200 L o más');
    if (cnt.cirujano && L < 300) warn.push('El cirujano azul necesita 300 L o más');
    if ((cnt.cometa || 0) + (cnt.oranda || 0) && L < 100) warn.push('Los carasius necesitan 100 L o más');
    if (cnt.cory && cnt.cory < 4) warn.push('Los corydoras van en grupos de 4 o más');
    if (load > 100) warn.push('Demasiados peces para ' + L + ' L');
    const eq = Math.round(PRICE[size] * (type === 'marino' ? 1.6 : 1)), fe = fish.reduce((a, f) => a + f.sp.eur, 0), de = decor.reduce((a, it) => a + DEC[it.k][2], 0), tot = eq + fe + de;
    mon.innerHTML = '<h4>Tu acuario</h4><div class="vt-big">' + L + '<em>litros</em></div>' +
      '<div class="vt-row"><span>Agua</span><b>' + TYPES[type].temp + '</b></div><div class="vt-row"><span>Peces</span><b>' + fish.length + '</b></div>' +
      '<div class="vt-meter"><i style="width:' + Math.min(100, load) + '%;background:' + (load > 100 ? '#ef4444' : load > 75 ? '#f59e0b' : '#22c55e') + '"></i></div><small style="opacity:.75">Carga ' + load + ' %</small>' +
      '<div class="aq-w">' + (warn.length ? warn.map(x => '⚠️ ' + x).join('<br>') : '✅ Todo compatible') + '</div>' +
      '<div class="vt-row"><span>Montado y listo</span><b>' + tot.toLocaleString('es-ES') + ' €</b></div>';
    ui.set('Acuario', SIZES[size][0] * 100 + ' cm · ' + L + ' L · ' + TYPES[type].l);
    ui.set('Peces', Object.entries(cnt).map(([k, n]) => n + ' ' + SP[k].n.toLowerCase()).join(', ') || '—');
    ui.set('Decoración', Object.entries(decor.reduce((a, it) => (a[it.k] = (a[it.k] || 0) + 1, a), {})).map(([k, n]) => n + ' ' + DEC[k][1].toLowerCase()).join(', ') || '—');
    ui.set('Presupuesto orientativo', tot.toLocaleString('es-ES') + ' € (acuario, equipo, montaje, peces y decoración)');
    const fg = groups().fishG; if (fg) fg.querySelectorAll('[data-c]').forEach(b => b.textContent = cnt[b.dataset.c] || 0);
  }
  const groups = () => ({ fishG: [...stage.closest('.sd-main').querySelectorAll('.sd-g')].find(n => n.dataset.l === 'Peces') });

  /* ---------- Montajes de partida por tipo de agua ---------- */
  async function preset() {
    clearFish(); clearDecor();
    const P = { tropical: { dec: [['raiz', [.1, -.45]], ['roca', [-.45, -.3]], ['roca', [.55, -.1]], ['plantas', [-.75, -.7]], ['plantas', [.75, -.75]], ['roja', [-.2, -.75]], ['helecho', [.35, -.35]], ['musgo', [-.1, .05]]], fish: [['neon', 10], ['escalar', 2], ['cory', 4], ['guppy', 3]] },
      marino: { dec: [['roca', [-.4, -.35]], ['roca', [.3, -.4]], ['roca', [.65, -.05]], ['anemona', [-.1, -.05]], ['coral', [.05, -.6]], ['coral', [-.7, -.55]], ['concha', [.45, .2]]], fish: [['payaso', 2], ['cirujano', 1]] },
      fria: { dec: [['roca', [-.4, -.3]], ['roca', [.45, -.25]], ['plantas', [-.75, -.7]], ['plantas', [.7, -.7]], ['raiz', [0, -.5]]], fish: [['cometa', 2], ['oranda', 2]] } }[type];
    P.fish.forEach(([k, n]) => { for (let i = 0; i < n; i++) addFish(k, k === 'cometa' ? i % 2 : 0); });
    stats();
    for (const [k, at] of P.dec) await addDecor(k, at).catch(() => {});
  }

  /* ---------- Interfaz ---------- */
  ui.chips('Tipo de acuario', Object.entries(TYPES).map(([v, t]) => ({ v, l: t.l })), type, v => { type = v; waterMat && waterMat.color.set(TYPES[v].water); setSub(TYPES[v].sub); ui.redo('Peces', fishUI); ui.redo('Decoración', decUI); buildTank(); preset(); ui.toast('Montaje de ejemplo para ' + TYPES[v].l.toLowerCase()); });
  ui.chips('Tamaño', Object.entries(SIZES).map(([v, s]) => ({ v, l: s[0] * 100 + ' cm · ' + v + ' L' })), String(size), v => { size = +v; buildTank(); });
  const fishUI = () => { const gq = ui.group('Peces', '<div class="aq-list">' + TYPES[type].fish.map(k => '<span class="aq-f"><button type="button" data-a="-" data-k="' + k + '" aria-label="Quitar ' + SP[k].n + '">−</button><i>' + SP[k].i + '</i>' + SP[k].n + ' <b data-c="' + k + '">0</b><button type="button" data-a="+" data-k="' + k + '" aria-label="Añadir ' + SP[k].n + '">+</button></span>').join('') + '</div>');
    gq.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k; if (b.dataset.a === '+') { for (let i = 0; i < (SP[k].add > 2 ? Math.ceil(SP[k].add / 2) : 1); i++) addFish(k, k === 'cometa' ? Math.random() < .5 ? 1 : 0 : 0); } else { for (let i = 0; i < (SP[k].add > 2 ? Math.ceil(SP[k].add / 2) : 1); i++) removeFish(k); } stats(); }); return gq; };
  fishUI();
  const decUI = () => { const gq = ui.group('Decoración', '<div class="sd-ch">' + DEC_BY[type].map(k => '<button type="button" data-k="' + k + '"><i>' + DEC[k][0] + '</i>' + DEC[k][1] + '</button>').join('') + '<button type="button" data-k="-"><i>↩️</i>Quitar última</button></div>');
    gq.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.k === '-') { const it = decor.pop(); if (it) tank.remove(it.g); stats(); } else addDecor(b.dataset.k).catch(() => ui.hint('')); }); return gq; };
  decUI();
  ui.chips('Sustrato', Object.entries(SUBS).map(([v, s]) => ({ v, l: s[1] })), sub, v => setSub(v));
  ui.chips('Cristal', Object.entries(GLASS).map(([v, q]) => ({ v, l: q[0] })), glass, v => { glass = v; applyGlass(); });
  ui.chips('Marco', [{ v: 'sin', l: 'Sin marco' }, { v: 'negro', l: 'Negro' }, { v: 'blanco', l: 'Blanco' }, { v: 'madera', l: 'Madera' }], frame, v => { frame = v; buildTank(); });
  ui.chips('Fondo trasero', [{ v: 'negro', l: 'Negro' }, { v: 'azul', l: 'Azul profundo' }, { v: 'esmerilado', l: 'Esmerilado retroiluminado' }, { v: 'sin', l: 'Transparente' }], back, v => { back = v; buildTank(); });
  ui.chips('Luz', Object.entries(LIGHTS).map(([v, l]) => ({ v, l: l[0] })), light, v => { light = v; applyLight(); });
  ui.chips('Burbujas', [{ v: 'si', l: 'Con difusor' }, { v: 'no', l: 'Sin burbujas' }], 'si', v => { bubblesOn = v === 'si'; bubbles.mesh.visible = bubblesOn; });
  ui.buttons([{ l: '🍤 Dar de comer', main: true, fn: () => feed(rnd(-w / 4, w / 4), rnd(-d / 4, d / 6)) }, { l: '👁️ Frontal', fn: () => W.view([0, h * .58, frontDist()], [0, h * .45, 0]) }, { l: 'Lateral', fn: () => W.view([w * 1.3, h * .6, d * 1.4], [0, h * .45, 0]) }, { l: 'Desde arriba', fn: () => W.view([0, h + .9, .25], [0, h * .3, 0]) }, { l: 'De cerca', fn: () => W.view([w * .15, h * .5, d / 2 + .32], [0, h * .42, 0]) }]);

  // Pulsar (sin arrastrar) dentro del acuario = echar comida en ese punto
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  W.renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
  W.renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    const r = W.renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, W.camera);
    const p = ray.ray.intersectPlane(new THREE.Plane(new V3(0, 0, -1), d / 2), new V3()) || ray.ray.intersectPlane(new THREE.Plane(new V3(0, 1, 0), -wy), new V3());
    if (p && Math.abs(p.x) < w / 2 && p.y > 0 && p.y < h + .05) feed(p.x, Math.min(d / 4, p.z));
  });

  /* ---------- Bucle ---------- */
  const o3 = new THREE.Object3D();
  W.onFrame((dt, t) => {
    U.uTime.value = t;
    if (surf) { surf.material.normalMap.offset.set(t * .012, t * .008); }
    rays.forEach(r => { r.material.opacity = (.035 + Math.sin(t * .7 + r.userData.ph) * .025) * U.uCaus.value; r.position.x += Math.sin(t * .2 + r.userData.ph) * .0002; });
    if (motes) motes.rotation.y = Math.sin(t * .05) * .02, motes.position.y = Math.sin(t * .3) * .004;
    fish.forEach(f => swim(f, dt));
    if (bubblesOn) { bubbles.p.forEach((b, i) => { b.y += dt * b.v / Math.max(wy, .1); if (b.y > 1) { b.y = 0; b.ph = rnd(0, 6); } const y = bubbles.from.y + b.y * (wy - bubbles.from.y); o3.position.set(bubbles.from.x + Math.sin(t * 3 + b.ph) * .006 * b.y + b.y * .02, y, bubbles.from.z + Math.cos(t * 2.6 + b.ph) * .005); o3.scale.setScalar(b.s * (1 + b.y * .6)); o3.updateMatrix(); bubbles.mesh.setMatrixAt(i, o3.matrix); }); bubbles.mesh.instanceMatrix.needsUpdate = true; }
    flakes.forEach((q, i) => { if (q.p.y > subH(q.p.x, q.p.z) + .004) { q.p.y -= dt * q.v; q.p.x += Math.sin(t + q.r) * dt * .004; } q.r += dt * 1.5; o3.position.copy(q.p); o3.rotation.set(q.r, q.r * .7, 0); o3.scale.setScalar(1); o3.updateMatrix(); flakeMesh.setMatrixAt(i, o3.matrix); });
    flakeMesh.count = flakes.length; flakeMesh.instanceMatrix.needsUpdate = true;
  });

  const kb = [
    { k: ['ciclar', 'ciclado', 'nuevo', 'empezar', 'primer acuario', 'cuando meto los peces', 'montar'], t: 'Mi primer acuario', u: 'media', p: 'kit desde 169 €', d: '3–4 semanas', a: 'Lo más importante es <b>ciclar el acuario</b>: 3–4 semanas con filtro funcionando y bacterias para que se forme el ciclo del nitrógeno. Después los peces van entrando poco a poco. Te lo dejamos montado y te hacemos los análisis de agua gratis.', on: () => {} },
    { k: ['turbia', 'blanca', 'verde', 'agua sucia', 'algas', 'olor'], t: 'Agua turbia o con algas', u: 'media', p: 'análisis gratis', d: 'hoy', a: 'Agua blanquecina = bacterias (acuario joven); verde o algas = demasiada luz o nutrientes. Reduce la luz a 7–8 h, no sobrealimentes y haz un cambio del 25 %. Tráenos una muestra en un bote limpio y la analizamos gratis.', on: () => {} },
    { k: ['muerto', 'se mueren', 'punto blanco', 'enfermo', 'manchas', 'aletas rotas', 'no come'], t: 'Peces enfermos', u: 'alta', p: 'diagnóstico gratis', d: 'hoy', a: 'Si ves <b>puntos blancos</b> (ictio), sube poco a poco la temperatura a 28 °C y trae una foto: tenemos el tratamiento. Si se mueren varios, haz ya un cambio de agua del 30 % y tráenos una muestra para medir amoniaco y nitritos.', on: () => {} },
    { k: ['cuantos peces', 'cuantos caben', 'litros', 'tamaño'], t: '¿Cuántos peces caben?', u: 'baja', p: '—', d: '—', a: 'Como regla orientativa, <b>1 cm de pez adulto por litro</b> en peces pequeños tropicales. Aquí al lado ves la <b>carga</b> de tu acuario en tiempo real y si las especies son compatibles.', on: () => {} },
    { k: ['comida', 'alimentar', 'cuanto como', 'vacaciones', 'comedero'], t: 'Comida y vacaciones', u: 'baja', p: 'comederos desde 19 €', d: '—', a: 'Lo que coman en <b>2 minutos</b>, una o dos veces al día. Para vacaciones, un comedero automático o nuestro servicio de cuidado a domicilio. Pulsa en el agua del acuario de aquí al lado y verás cómo suben a comer.', on: () => feed(0, 0) },
    { k: ['marino', 'arrecife', 'coral', 'payaso', 'nemo', 'salada'], t: 'Acuario marino', u: 'baja', p: 'desde 499 €', d: '4–6 semanas', a: 'Un marino necesita sal de calidad, ósmosis y más paciencia, pero no es imposible. Para empezar recomendamos <b>120 L o más</b>, roca viva y un par de payasos con su anémona.', on: () => { if (type !== 'marino') stage.closest('.sd-main').querySelector('.sd-g [data-v=marino]').click(); } },
    { k: ['mantenimiento', 'limpiar', 'cambio de agua', 'filtro', 'no tengo tiempo'], t: 'Mantenimiento', u: 'baja', p: 'desde 39 €/mes', d: 'cada 2–4 semanas', a: 'Cambio del <b>20–25 % semanal</b> con agua acondicionada y el filtro se limpia con agua del propio acuario. Si no tienes tiempo, nuestro plan de mantenimiento va a tu casa o a tu negocio.', on: () => {} },
    { k: ['domicilio', 'llevar', 'envio', 'traer', 'transporte', 'peces vivos'], t: 'Montaje y peces vivos', u: 'baja', p: 'montaje desde 49 €', d: 'con cita', a: 'Montamos el acuario en tu casa. Los <b>peces vivos se recogen en tienda</b> en bolsa con oxígeno para que viajen seguros; para pedidos grandes, los llevamos nosotros.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Acuariófilo ' + (FX.BIZ.nombre || ''), avatar: '🐠', fab: '¿Dudas con tu acuario?', placeholder: 'Ej.: tengo el agua turbia, ¿cuántos peces caben?…', quick: ['Mi primer acuario', 'Agua turbia', 'Puntos blancos', '¿Cuántos peces caben?', 'Acuario marino'], label: 'Consulta', waIntro: 'Hola, os consulto por mi acuario: ', cta: 'Reservar mi acuario', hello: 'Hola 🐠 Cuéntame qué acuario tienes o quieres montar y te ayudo con los peces, el agua y el mantenimiento.' });

  setSub(sub, true); buildTank(); await preset();
  ui.hint('Arrastra para girar · pulsa en el agua para dar de comer'); setTimeout(() => ui.hint(''), 4500);
};
