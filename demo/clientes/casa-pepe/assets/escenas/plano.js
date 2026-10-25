/* Tienda de muebles · ¿Cabe en tu salón? Plano a escala con ancho y largo independientes, muebles reales que se arrastran, giran y se quitan, aviso de choques y espacio libre, tapicería y precio + chat del asesor */
FXSTUDIO.scenes.plano = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  // medidas en cm: w = ancho, d = fondo; tap = admite tapicería; z = alfombra (va debajo y no choca)
  const ITEMS = {
    sofa: { l: 'Sofá 3 plazas', w: 220, d: 95, pr: 899, tap: 1, ph: '1759722665629-29df6ee4f9a5' },
    chaise: { l: 'Chaise longue', w: 280, d: 160, pr: 1290, tap: 1, ph: '1590251024078-8a6d9f90b02d' },
    sillon: { l: 'Sillón', w: 85, d: 85, pr: 349, tap: 1, ph: '1580480055273-228ff5388ef8' },
    centro: { l: 'Mesa de centro', w: 110, d: 60, pr: 189, ph: '1647967527216-adea2f078e07' },
    tv: { l: 'Mueble de TV', w: 180, d: 45, pr: 329, ph: '1583847268964-b28dc8f51f92' },
    comedor: { l: 'Mesa de comedor (6)', w: 180, d: 90, pr: 990, ph: '1758977403341-0104135995af' },
    estanteria: { l: 'Estantería', w: 100, d: 35, pr: 249, ph: '1631679706909-1844bbd07221' },
    lampara: { l: 'Lámpara de pie', w: 40, d: 40, pr: 89, ph: '1634712282287-14ed57b9cc89' },
    alfombra: { l: 'Alfombra 200×290', w: 290, d: 200, pr: 179, z: 1, ph: '1603913996638-c01100417b4a' }
  };
  const TELA = [{ v: '#b9b2a6', l: 'Lino arena' }, { v: '#5d6b58', l: 'Terciopelo oliva' }, { v: '#2f3b52', l: 'Pana azul noche' }, { v: '#c8875a', l: 'Piel coñac' }, { v: '#e7e2d8', l: 'Bouclé crudo' }];
  const MAXW = 600, MAXL = 700, S = Math.min(250 / MAXW, 272 / MAXL), CX = 150; // escala fija: el ancho y el largo se ven independientes
  let W = 420, L = 500, tela = TELA[0], sel = null;
  // posición por defecto (cm desde la esquina superior izquierda del salón) y giro
  const DEF = { tv: [.5, 0, 0, 1], sofa: [.5, 1, 0, 1], centro: [.5, .62, 0], alfombra: [.5, .66, 0], sillon: [0, .62, 0], lampara: [1, 1, 0], chaise: [.5, 1, 0, 1], comedor: [.78, .12, 0], estanteria: [0, 0, 0] };
  let inst = ['sofa', 'centro', 'tv', 'alfombra', 'sillon'].map(k => ({ k, r: DEF[k][2], ...pos(k) }));
  function dims(o) { const I = ITEMS[o.k]; return o.r % 180 ? [I.d, I.w] : [I.w, I.d]; }
  function pos(k) { const I = ITEMS[k], [fx, fy] = DEF[k] || [.5, .5]; return { x: Math.round((W - I.w) * fx), y: Math.round((L - I.d) * fy) }; }
  const clamp = o => { const [w, d] = dims(o); o.x = Math.max(0, Math.min(W - w, o.x)); o.y = Math.max(0, Math.min(L - d, o.y)); };
  const pane = document.createElement('div');
  pane.style.cssText = 'position:absolute;left:5%;right:5%;top:5%;bottom:13%;z-index:2;border-radius:20px;background:rgba(250,248,244,.93);backdrop-filter:blur(10px);box-shadow:0 20px 50px rgba(0,0,0,.2);display:grid;place-items:center;padding:10px';
  P.room.querySelector('.vt-photo').appendChild(pane);
  const box = P.box(), eur = n => n.toLocaleString('es-ES') + ' €';
  const check = () => {
    const bad = new Set(), out = new Set(), solid = inst.filter(o => !ITEMS[o.k].z);
    inst.forEach(o => { const [w, d] = dims(o); if (w > W || d > L) out.add(o); });
    for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], b = solid[j], [aw, ad] = dims(a), [bw, bd] = dims(b);
      if (a.x < b.x + bw && b.x < a.x + aw && a.y < b.y + bd && b.y < a.y + ad) { bad.add(a); bad.add(b); }
    }
    const used = solid.reduce((s, o) => s + ITEMS[o.k].w * ITEMS[o.k].d, 0), free = Math.max(0, Math.round(100 - used / (W * L) * 100));
    return { bad, out, free };
  };
  const draw = () => {
    inst.forEach(clamp);
    const c = check(), ox = CX - W * S / 2, oy = 22, X = v => ox + v * S, Y = v => oy + v * S;
    const it = [...inst].sort((a, b) => (ITEMS[b.k].z || 0) - (ITEMS[a.k].z || 0)).map(o => {
      const I = ITEMS[o.k], [w, d] = dims(o), hit = c.bad.has(o) || c.out.has(o), fill = I.z ? '#d9c3a5' : I.tap ? tela.v : '#a07a52';
      return '<g class="pl-it" data-i="' + inst.indexOf(o) + '" style="cursor:grab"><rect x="' + X(o.x) + '" y="' + Y(o.y) + '" width="' + w * S + '" height="' + d * S + '" rx="' + (I.z ? 1 : 3) + '" fill="' + fill + '" fill-opacity="' + (I.z ? .55 : .9) + '" stroke="' + (hit ? '#d13b2f' : o === sel ? '#1f6feb' : '#0004') + '" stroke-width="' + (hit || o === sel ? 2 : 1) + '"' + (I.z ? ' stroke-dasharray="4 3"' : '') + '/>' +
        (w * S > 34 ? '<text x="' + (X(o.x) + w * S / 2) + '" y="' + (Y(o.y) + d * S / 2 + 3) + '" text-anchor="middle" style="font:600 8.5px system-ui;pointer-events:none" fill="' + (I.tap && /^#[2-6]/.test(tela.v) ? '#fff' : '#3a2f25') + '">' + I.l.replace(/ \(.*|\s\d.*$/, '') + '</text>' : '') + '</g>';
    }).join('');
    const cota = (x1, y1, x2, y2, t, v) => '<g stroke="#8a6d4f" fill="#8a6d4f" style="font:600 10px system-ui"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/><text stroke="none" x="' + (v ? x1 + 6 : (x1 + x2) / 2) + '" y="' + (v ? (y1 + y2) / 2 + 3 : y1 - 5) + '" text-anchor="' + (v ? 'start' : 'middle') + '">' + t + '</text></g>';
    pane.innerHTML = '<svg viewBox="0 0 320 330" style="width:100%;height:100%;touch-action:none;user-select:none"><rect x="' + ox + '" y="' + oy + '" width="' + W * S + '" height="' + L * S + '" fill="#efe6d8" stroke="#5a4636" stroke-width="3"/>' +
      '<rect x="' + (ox + W * S * .35) + '" y="' + (oy + L * S - 2) + '" width="' + W * S * .3 + '" height="4" fill="#9cc3e6"/>' + it +
      cota(ox, oy - 8, ox + W * S, oy - 8, (W / 100).toFixed(2).replace('.', ',') + ' m') + cota(ox + W * S + 8, oy, ox + W * S + 8, oy + L * S, (L / 100).toFixed(2).replace('.', ',') + ' m', true) +
      '<text x="160" y="322" text-anchor="middle" style="font:500 10px system-ui" fill="#7a6553">' + (c.bad.size || c.out.size ? '⚠️ Hay muebles que se chocan o no caben' : '✔ Todo cabe · ' + c.free + ' % de suelo libre') + ' · arrastra para mover</text></svg>';
    const tot = inst.reduce((s, o) => s + ITEMS[o.k].pr, 0), ok = !c.bad.size && !c.out.size;
    P.card('<small>TU SALÓN · ' + (W / 100).toFixed(2).replace('.', ',') + ' × ' + (L / 100).toFixed(2).replace('.', ',') + ' M</small><b>' + (ok ? 'Todo cabe ✔' : 'Revisa la distribución') + '</b><ul>' + inst.map(o => '<li>' + ITEMS[o.k].l + (ITEMS[o.k].tap ? ' · ' + tela.l.toLowerCase() : '') + ' · ' + eur(ITEMS[o.k].pr) + (c.out.has(o) ? ' · <b>no cabe</b>' : c.bad.has(o) ? ' · <b>se choca</b>' : '') + '</li>').join('') + '</ul><em>Entrega y montaje gratis en Madrid</em>');
    box.innerHTML = '<h4>Total</h4><div class="vt-big">' + tot.toLocaleString('es-ES') + '<em> €</em></div><div class="vt-row"><span>Suelo libre</span><b>' + c.free + ' %</b></div><div class="vt-row"><span>En 12 meses</span><b>' + eur(Math.ceil(tot / 12)) + '/mes</b></div>';
    ui.set('Salón', (W / 100).toFixed(2).replace('.', ',') + ' × ' + (L / 100).toFixed(2).replace('.', ',') + ' m'); ui.del('Ancho del salón'); ui.del('Largo del salón');
    ui.set('Muebles', inst.map(o => ITEMS[o.k].l).join(', ') || '—'); ui.set('Total', eur(tot) + (ok ? '' : ' · revisar medidas'));
  };
  // Al cambiar las medidas, cada mueble conserva su posición relativa (no se quedan apelotonados al encoger y volver a agrandar)
  const resize = (nW, nL) => { const rel = inst.map(o => { const [w, d] = dims(o); return [W > w ? o.x / (W - w) : 0, L > d ? o.y / (L - d) : 0]; }); W = nW; L = nL; inst.forEach((o, i) => { const [w, d] = dims(o); o.x = Math.round(Math.max(0, W - w) * rel[i][0]); o.y = Math.round(Math.max(0, L - d) * rel[i][1]); }); draw(); };
  // Arrastrar muebles con ratón o dedo
  let drag = null;
  const pt = e => { const s = pane.querySelector('svg'), m = s.getScreenCTM().inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return p; };
  pane.addEventListener('pointerdown', e => {
    const gEl = e.target.closest('.pl-it'); if (!gEl) { sel = null; draw(); return; }
    const o = inst[+gEl.dataset.i], p = pt(e), ox = CX - W * S / 2, oy = 22;
    sel = o; drag = { o, dx: (p.x - ox) / S - o.x, dy: (p.y - oy) / S - o.y, id: e.pointerId }; pane.setPointerCapture(e.pointerId);
    P.show(ITEMS[o.k].ph); P.caption(ITEMS[o.k].l, ITEMS[o.k].w + ' × ' + ITEMS[o.k].d + ' cm · ' + eur(ITEMS[o.k].pr)); draw(); e.preventDefault();
  });
  pane.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const p = pt(e), ox = CX - W * S / 2, oy = 22; drag.o.x = Math.round((p.x - ox) / S - drag.dx); drag.o.y = Math.round((p.y - oy) / S - drag.dy); draw(); });
  const end = () => { if (drag) { drag = null; draw(); } };
  pane.addEventListener('pointerup', end); pane.addEventListener('pointercancel', end);
  ui.range('Ancho del salón', { min: 250, max: MAXW, step: 10, value: W, fmt: v => (v / 100).toFixed(2).replace('.', ',') + ' m' }, v => resize(v, L));
  ui.range('Largo del salón', { min: 250, max: MAXL, step: 10, value: L, fmt: v => (v / 100).toFixed(2).replace('.', ',') + ' m' }, v => resize(W, v));
  ui.chips('Muebles', Object.entries(ITEMS).map(([v, I]) => ({ v, l: I.l })), inst.map(o => o.k), v => {
    const add = v.find(k => !inst.some(o => o.k === k));
    inst = inst.filter(o => v.includes(o.k)); if (add) { const o = { k: add, r: (DEF[add] || [])[2] || 0, ...pos(add) }; inst.push(o); sel = o; P.show(ITEMS[add].ph); P.caption(ITEMS[add].l, ITEMS[add].w + ' × ' + ITEMS[add].d + ' cm · ' + eur(ITEMS[add].pr)); }
    if (sel && !inst.includes(sel)) sel = null; draw();
  }, true);
  ui.swatches('Tapicería', TELA, tela.v, v => { tela = TELA.find(t => t.v === v) || { v, l: 'Color a medida' }; draw(); });
  ui.buttons([
    { l: '↻ Girar seleccionado', fn: () => { if (!sel) return ui.toast('Toca un mueble del plano para elegirlo'); sel.r = (sel.r + 90) % 360; draw(); } },
    { l: '🚚 Pedir con montaje', main: true, fn: () => { const c = check(); ui.toast(c.bad.size || c.out.size ? 'Aún hay muebles que no caben: muévelos o gíralos' : 'Perfecto: te lo llevamos y montamos gratis'); } }
  ]);
  const kb = [
    { k: ['cabe', 'medidas', 'espacio', 'paso'], t: '¿Me cabe?', u: 'baja', p: '—', d: '—', a: 'Deja al menos <b>60–80 cm de paso</b> entre el sofá y la mesa de centro, y 90 cm alrededor de la mesa de comedor para retirar las sillas. Si dudas, vamos a medir gratis.', on: () => {} },
    { k: ['entrega', 'plazo', 'cuando', 'envio', 'montaje'], t: 'Entrega y montaje', u: 'baja', p: 'gratis en Madrid', d: '1–3 semanas', a: 'Lo que hay en tienda, en 48–72 h. Sofás a medida en 3–5 semanas. El montaje y la retirada del mueble viejo son gratis en Madrid.', on: () => {} },
    { k: ['plazos', 'financiar', 'cuotas', 'pagar'], t: 'Pago a plazos', u: 'baja', p: 'sin intereses', d: '—', a: 'Financiamos en 3, 6 o 12 meses sin intereses a partir de 300 €.', on: () => {} },
    { k: ['tela', 'tapiceria', 'mancha', 'gato', 'perro', 'mascota', 'ninos'], t: 'Tela antimanchas', u: 'baja', p: '—', d: '—', a: 'Con niños o mascotas recomendamos <b>terciopelo o pana de tejido técnico</b>: antimanchas, se limpia con agua y resiste arañazos.', on: () => { tela = TELA[1]; ui.pick('Tapicería', tela.v); draw(); } },
    { k: ['devolver', 'devolucion', 'cambio', 'no me gusta'], t: 'Devoluciones', u: 'baja', p: '—', d: '30 días', a: 'Tienes 30 días para devolver los muebles de catálogo. Los hechos a medida no se pueden devolver, por eso te damos muestras de tela gratis.', on: () => {} },
    { k: ['pequeño', 'piso pequeno', 'estudio', 'salon pequeno'], t: 'Salón pequeño', u: 'baja', p: '—', d: '—', a: 'Para salones de menos de 3,5 m mejor un sofá de 2 plazas o un chaise longue reversible, y una mesa de centro elevable que sirve de comedor.', on: () => { resize(330, 380); ui.redo('Ancho del salón', () => ui.range('Ancho del salón', { min: 250, max: MAXW, step: 10, value: W, fmt: v => (v / 100).toFixed(2).replace('.', ',') + ' m' }, v => resize(v, L))); ui.redo('Largo del salón', () => ui.range('Largo del salón', { min: 250, max: MAXL, step: 10, value: L, fmt: v => (v / 100).toFixed(2).replace('.', ',') + ' m' }, v => resize(W, v))); draw(); } }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Asesor de ' + (FX.BIZ.nombre || ''), avatar: '🛋️', fab: '¿Te ayudo a elegir?', placeholder: 'Ej.: ¿me cabe el sofá?, tengo gato…', quick: ['¿Me cabe?', 'Entrega y montaje', 'Tengo mascota', 'Pago a plazos', 'Salón pequeño'], label: 'Consulta', waIntro: 'Hola, os escribo desde la web: ', cta: 'Hablar con un asesor', hello: 'Hola 👋 Pon las medidas de tu salón y mueve los muebles: te digo si cabe todo.' });
  P.show(ITEMS.sofa.ph); P.caption('Tu salón a escala', 'Arrastra los muebles con el dedo o el ratón'); draw();
};
