/* Óptica · Probador de monturas: forma, material, color y lentes dibujados en vivo (SVG), consejo según tu cara, «salir al sol» con fotocromáticas + chat del óptico */
FXSTUDIO.scenes.gafas = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const FORM = {
    redonda: { l: 'Redonda', p: 119, d: (cx) => '<circle cx="' + cx + '" cy="0" r="56"/>', cara: ['cuadrada', 'corazon'] },
    rect: { l: 'Rectangular', p: 109, d: (cx) => '<rect x="' + (cx - 66) + '" y="-46" width="132" height="92" rx="16"/>', cara: ['redonda', 'ovalada'] },
    aviador: { l: 'Aviador', p: 139, d: (cx, s) => '<path d="M' + (cx - 64 * s) + ' -40 Q' + cx + ' -52 ' + (cx + 64 * s) + ' -40 Q' + (cx + 70 * s) + ' 30 ' + (cx + 20 * s) + ' 52 Q' + (cx - 50 * s) + ' 64 ' + (cx - 66 * s) + ' 0 Z"/>', cara: ['ovalada', 'corazon', 'cuadrada'] },
    gatuna: { l: 'Ojo de gato', p: 129, d: (cx, s) => '<path d="M' + (cx - 62 * s) + ' -20 Q' + (cx - 30 * s) + ' -50 ' + (cx + 74 * s) + ' -56 Q' + (cx + 70 * s) + ' 40 ' + (cx + 10 * s) + ' 46 Q' + (cx - 60 * s) + ' 48 ' + (cx - 62 * s) + ' -20 Z"/>', cara: ['redonda', 'cuadrada', 'ovalada'] }
  };
  const COL = [{ v: '#161616', l: 'Negro mate' }, { v: 'carey', l: 'Carey' }, { v: '#c9a24a', l: 'Oro' }, { v: '#1d2a4a', l: 'Azul noche' }, { v: 'cristal', l: 'Cristal' }, { v: '#8b2335', l: 'Burdeos' }];
  const LEN = { mono: ['Monofocales', 79], prog: ['Progresivas', 249], ocu: ['Ocupacionales (pantallas)', 149], sol: ['Sol graduadas', 119] };
  const TRA = { ar: ['Antirreflejante', 30], azul: ['Filtro luz azul', 25], foto: ['Fotocromáticas', 60], fina: ['Adelgazadas 1.67', 70] };
  const CARA = { ovalada: 'Ovalada', redonda: 'Redonda', cuadrada: 'Cuadrada', corazon: 'Corazón' };
  let form = 'redonda', mat = 'acetato', col = '#161616', len = 'mono', tra = ['ar'], cara = 'ovalada', sol = 0;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:absolute;left:8%;right:8%;top:22%;height:44%;z-index:2;display:grid;place-items:center;border-radius:24px;background:rgba(255,255,255,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 50px rgba(0,0,0,.18)';
  P.room.querySelector('.vt-photo').appendChild(ov);
  const box = P.box();
  const svg = () => {
    const F = FORM[form], w = mat === 'metal' ? 4 : 13, carey = col === 'carey', cris = col === 'cristal';
    const stroke = carey ? 'url(#cy)' : cris ? 'rgba(120,140,150,.55)' : col, tint = sol ? 'rgba(40,40,46,' + (.15 + sol * .6) + ')' : (len === 'sol' ? 'rgba(40,40,46,.7)' : 'rgba(160,200,230,.14)');
    return '<svg viewBox="-260 -110 520 220" style="width:92%;height:92%;overflow:visible;filter:drop-shadow(0 18px 18px rgba(0,0,0,.25))">' +
      '<defs><pattern id="cy" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#5a2f14"/><circle cx="7" cy="8" r="7" fill="#a5611f"/><circle cx="20" cy="18" r="6" fill="#2a1408"/><circle cx="20" cy="4" r="4" fill="#c7843a"/></pattern>' +
      '<linearGradient id="rf" x1="0" y1="0" x2="1" y2="1"><stop offset=".2" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<g fill="' + tint + '">' + F.d(-92, -1) + F.d(92, 1) + '</g>' +
      '<g fill="url(#rf)" opacity=".7">' + F.d(-92, -1) + F.d(92, 1) + '</g>' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linejoin="round">' + F.d(-92, -1) + F.d(92, 1) +
      '<path d="M-30 -14 Q0 -30 30 -14" stroke-width="' + Math.max(4, w * .7) + '"/><path d="M' + (form === 'gatuna' ? -166 : -158) + ' -26 L-238 -36 M' + (form === 'gatuna' ? 166 : 158) + ' -26 L238 -36" stroke-width="' + Math.max(4, w * .6) + '"/></g></svg>';
  };
  const price = () => FORM[form].p + (mat === 'titanio' ? 60 : 0) + LEN[len][1] + tra.reduce((a, k) => a + TRA[k][1], 0);
  const draw = () => {
    ov.innerHTML = svg();
    const fit = FORM[form].cara.includes(cara), p = price();
    P.card('<small>TU MONTURA · ' + (COL.find(c => c.v === col) || {}).l.toUpperCase() + '</small><b>' + FORM[form].l + ' de ' + mat + '</b><ul><li>' + LEN[len][0] + '</li>' + tra.map(k => '<li>' + TRA[k][0] + ' · +' + TRA[k][1] + ' €</li>').join('') + '<li>' + (fit ? '✅ Favorece a cara ' + CARA[cara].toLowerCase() : '💡 Para cara ' + CARA[cara].toLowerCase() + ' prueba: ' + Object.values(FORM).filter(f => f.cara.includes(cara)).map(f => f.l).join(', ')) + '</li></ul><em>' + p + ' € con graduación incluida · listas en ' + (len === 'prog' ? '5–7 días' : '48 h') + '</em>');
    box.innerHTML = '<h4>Precio total</h4><div class="vt-big">' + p + '<em> €</em></div><div class="vt-row"><span>Montura</span><b>' + (FORM[form].p + (mat === 'titanio' ? 60 : 0)) + ' €</b></div><div class="vt-row"><span>Lentes</span><b>' + (p - FORM[form].p - (mat === 'titanio' ? 60 : 0)) + ' €</b></div><div class="vt-row"><span>Graduación</span><b>Gratis</b></div>';
    ui.set('Montura', FORM[form].l + ' · ' + mat + ' · ' + (COL.find(c => c.v === col) || {}).l); ui.set('Lentes', LEN[len][0] + (tra.length ? ' + ' + tra.map(k => TRA[k][0]).join(', ') : '')); ui.set('Precio', p + ' €');
  };
  ui.chips('Forma', Object.entries(FORM).map(([v, f]) => ({ v, l: f.l })), form, v => { form = v; draw(); if (g) g.fromTo(ov.firstChild, { scale: .9, rotate: -3 }, { scale: 1, rotate: 0, duration: .6, ease: 'back.out(2)' }); });
  ui.chips('Material', [{ v: 'acetato', l: 'Acetato italiano' }, { v: 'metal', l: 'Metal fino' }, { v: 'titanio', l: 'Titanio (+60 €)' }], mat, v => { mat = v === 'titanio' ? 'titanio' : v; draw(); });
  ui.swatches('Color', COL.map(c => ({ v: c.v === 'carey' ? '#7a3f17' : c.v === 'cristal' ? '#dfe7ea' : c.v, l: c.l })), '#161616', v => { const c = COL.find(c => (c.v === 'carey' ? '#7a3f17' : c.v === 'cristal' ? '#dfe7ea' : c.v) === v); col = c ? c.v : v; draw(); }, false);
  ui.chips('Lentes', Object.entries(LEN).map(([v, l]) => ({ v, l: l[0] + ' · ' + l[1] + ' €' })), len, v => { len = v; draw(); });
  ui.chips('Tratamientos', Object.entries(TRA).map(([v, t]) => ({ v, l: t[0] + ' +' + t[1] + ' €' })), tra, v => { tra = v; draw(); }, true);
  ui.chips('Tu cara es…', Object.entries(CARA).map(([v, l]) => ({ v, l })), cara, v => { cara = v; draw(); });
  ui.buttons([{ l: '☀️ Salir al sol', main: true, fn: () => { if (!tra.includes('foto')) { ui.toast('Añade «Fotocromáticas» para verlas oscurecer'); return; } const o = { s: 0 }; if (g) g.to(o, { s: 1, duration: 1.6, yoyo: true, repeat: 1, repeatDelay: 1, ease: 'sine.inOut', onUpdate: () => { sol = o.s; ov.innerHTML = svg(); }, onComplete: () => { sol = 0; draw(); } }); } }]);
  const kb = [
    { k: ['destellos', 'cortina', 'manchas de repente', 'perdi vision', 'vision doble', 'ojo rojo y dolor'], t: '⚠️ Síntoma urgente', u: 'alta', p: '—', d: 'hoy', a: 'Destellos, una cortina o pérdida de visión repentina pueden ser un desprendimiento de retina. <b>Ve hoy a urgencias de oftalmología</b>.', on: () => {} },
    { k: ['lejos', 'borroso', 'pizarra', 'carteles', 'miopia'], t: 'Veo borroso de lejos', u: 'media', p: 'graduación gratis', d: '20 min', a: 'Suena a miopía o astigmatismo. Te graduamos gratis en 20 minutos y te decimos si necesitas gafas o lentillas.', on: () => { len = 'mono'; ui.pick('Lentes', len); draw(); } },
    { k: ['cerca', 'leer', 'letra pequena', 'movil', 'brazos', 'presbicia', '40', '45'], t: 'Me cuesta leer de cerca', u: 'baja', p: 'progresivas desde 249 €', d: '—', a: 'A partir de los 40–45 es la presbicia (vista cansada). Si también necesitas ver de lejos, las <b>progresivas</b> lo hacen todo; adaptación garantizada.', on: () => { len = 'prog'; ui.pick('Lentes', len); draw(); } },
    { k: ['pantalla', 'ordenador', 'cansancio', 'teletrabajo', 'dolor de cabeza'], t: 'Muchas horas de pantalla', u: 'baja', p: 'desde 149 €', d: '—', a: 'Las <b>ocupacionales</b> enfocan a distancia de pantalla; con antirreflejante y filtro de luz azul notarás menos fatiga. Recuerda la regla 20-20-20.', on: () => { len = 'ocu'; tra = ['ar', 'azul']; ui.pick('Lentes', len); ui.pick('Tratamientos', tra); draw(); } },
    { k: ['seco', 'arenilla', 'pican', 'escuecen', 'lagrimeo'], t: 'Ojo seco', u: 'baja', p: 'lágrimas desde 9 €', d: '—', a: 'Lágrimas artificiales sin conservantes y parpadear más delante de pantallas. Si no mejora en 2 semanas, consulta al oftalmólogo.', on: () => {} },
    { k: ['lentillas', 'lentes de contacto', 'deporte'], t: 'Lentillas', u: 'baja', p: 'prueba gratis', d: '—', a: 'Te hacemos la adaptación y una prueba gratis con diarias. Ideales para deporte o para alternar con gafas.', on: () => {} },
    { k: ['nino', 'hijo', 'miopia infantil', 'colegio'], t: 'Revisión infantil', u: 'media', p: 'programa control miopía', d: '—', a: 'Revisión anual desde los 4 años. Si hay miopía que avanza, tenemos lentes de control de miopía y seguimiento.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Óptico de ' + (FX.BIZ.nombre || ''), avatar: '👓', fab: '¿Qué tal ves?', placeholder: 'Ej.: veo borroso de lejos, me cuesta leer…', quick: ['Veo borroso de lejos', 'Me cuesta leer', 'Muchas pantallas', 'Ojo seco', 'Lentillas'], label: 'Consulta', waIntro: 'Hola, os consulto desde la web: ', cta: 'Pedir graduación', hello: 'Hola 👓 Cuéntame cómo ves y te digo qué lentes te irían mejor.' });
  P.show('1545038500-1df28978d761', 'blur(2px) brightness(1.05)'); P.caption('Probador virtual', 'Cambia forma, color y lentes'); draw();
};
