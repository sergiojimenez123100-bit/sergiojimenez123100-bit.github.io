/* Carpintería · Diseña tu mueble a escala (SVG con cotas y veta): tipo, medidas, madera, acabado y cajones → precio orientativo y plazo + chat del carpintero */
FXSTUDIO.scenes.mueble = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const TIP = {
    mesa: { l: 'Mesa de comedor', w: 200, h: 76, f: 95, base: 220, ph: '1758977404039-6e834be8eca8' },
    estanteria: { l: 'Estantería', w: 120, h: 200, f: 35, base: 120, ph: '1594620302200-9a762244a156' },
    aparador: { l: 'Aparador', w: 160, h: 85, f: 45, base: 180, ph: '1532588213355-52317771cce6' },
    armario: { l: 'Armario', w: 150, h: 230, f: 60, base: 320, ph: '1558997519-83ea9252edf8' }
  };
  const MAD = [{ v: '#b98a55', l: 'Roble', k: 1.25 }, { v: '#6b4a32', l: 'Nogal', k: 1.7 }, { v: '#d2a77a', l: 'Haya', k: 1.05 }, { v: '#e3c08b', l: 'Pino', k: .75 }, { v: '#d8c3a0', l: 'Fresno', k: 1.15 }];
  const ACA = { aceite: ['Aceite natural', 0, null], barniz: ['Barniz mate', 40, null], lacado: ['Lacado blanco', 140, '#f1efea'], tinte: ['Tinte oscuro', 60, '#3b2618'] };
  let tip = 'mesa', W = 200, Hh = 76, Fd = 95, mad = MAD[0], aca = 'aceite', caj = 0;
  const pane = document.createElement('div');
  pane.style.cssText = 'position:absolute;left:6%;right:6%;top:6%;bottom:14%;z-index:2;border-radius:20px;background:rgba(250,246,238,.9);backdrop-filter:blur(10px);box-shadow:0 20px 50px rgba(0,0,0,.2);display:grid;place-items:center;padding:14px';
  P.room.querySelector('.vt-photo').appendChild(pane);
  const box = P.box();
  const svg = () => {
    // Escala fija (la de las medidas máximas): así el ancho y el alto se ven independientes y a escala real
    const col = ACA[aca][2] || mad.v, S = Math.min(234 / 320, 190 / 260), w = W * S, h = Hh * S, x0 = 200 - w / 2, y0 = 230 - h, grain = ACA[aca][2] === '#f1efea' ? '' : '<g opacity=".22" stroke="#2b1d12" stroke-width=".8" fill="none">' + Array.from({ length: 9 }, (_, i) => '<path d="M' + x0 + ' ' + (y0 + 6 + i * h / 9) + ' C' + (x0 + w * .3) + ' ' + (y0 + i * h / 9) + ' ' + (x0 + w * .6) + ' ' + (y0 + 12 + i * h / 9) + ' ' + (x0 + w) + ' ' + (y0 + 4 + i * h / 9) + '"/>').join('') + '</g>';
    let body = '';
    if (tip === 'mesa') { const t = Math.max(6, h * .09); body = '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + t + '" rx="2"/><rect x="' + (x0 + w * .06) + '" y="' + (y0 + t) + '" width="' + Math.max(6, w * .045) + '" height="' + (h - t) + '"/><rect x="' + (x0 + w * .895) + '" y="' + (y0 + t) + '" width="' + Math.max(6, w * .045) + '" height="' + (h - t) + '"/>'; }
    else {
      const n = tip === 'estanteria' ? Math.max(2, Math.round(Hh / 38)) : 1;
      body = '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="2"/>';
      if (tip === 'estanteria') body += Array.from({ length: n - 1 }, (_, i) => '<rect x="' + (x0 + 5) + '" y="' + (y0 + (i + 1) * h / n - 2) + '" width="' + (w - 10) + '" height="4" fill="#0002"/>').join('') + '<rect x="' + (x0 + 5) + '" y="' + (y0 + 5) + '" width="' + (w - 10) + '" height="' + (h - 10) + '" fill="#0001"/>';
      else {
        const cw = caj ? w * .32 : 0, doors = tip === 'armario' ? 2 : Math.max(1, Math.round((w - cw) / (90 * S)));
        body += Array.from({ length: doors }, (_, i) => { const dw = (w - cw - 8) / doors; return '<rect x="' + (x0 + 4 + i * dw) + '" y="' + (y0 + 4) + '" width="' + (dw - 4) + '" height="' + (h - 8) + '" fill="none" stroke="#0003"/><circle cx="' + (x0 + 4 + i * dw + (i % 2 ? 8 : dw - 12)) + '" cy="' + (y0 + h / 2) + '" r="2.5" fill="#333"/>'; }).join('');
        if (caj) body += Array.from({ length: caj }, (_, i) => { const ch = (h - 8) / caj; return '<rect x="' + (x0 + w - cw - 2) + '" y="' + (y0 + 4 + i * ch) + '" width="' + (cw - 2) + '" height="' + (ch - 3) + '" fill="none" stroke="#0003"/><rect x="' + (x0 + w - cw / 2 - 10) + '" y="' + (y0 + 4 + i * ch + ch / 2 - 1.5) + '" width="18" height="3" rx="1.5" fill="#333"/>'; }).join('');
      }
    }
    const cota = (x1, y1, x2, y2, t, vert) => '<g stroke="#b5652b" fill="#b5652b" style="font:600 11px system-ui"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/><line x1="' + (vert ? x1 - 4 : x1) + '" y1="' + (vert ? y1 : y1 - 4) + '" x2="' + (vert ? x1 + 4 : x1) + '" y2="' + (vert ? y1 : y1 + 4) + '"/><line x1="' + (vert ? x2 - 4 : x2) + '" y1="' + (vert ? y2 : y2 - 4) + '" x2="' + (vert ? x2 + 4 : x2) + '" y2="' + (vert ? y2 : y2 + 4) + '"/><text stroke="none" x="' + (vert ? x1 + 8 : (x1 + x2) / 2) + '" y="' + (vert ? (y1 + y2) / 2 : y1 - 6) + '" text-anchor="' + (vert ? 'start' : 'middle') + '">' + t + '</text></g>';
    const ph = 170 * S, px = 44, person = '<g fill="#7a655333"><circle cx="' + px + '" cy="' + (230 - ph + 9) + '" r="9"/><path d="M' + (px - 11) + ' ' + (230 - ph + 22) + 'h22l4 ' + ph * .42 + 'h-8l-3 ' + (ph * .58 - 22) + 'h-8l-3 ' + (22 - ph * .58) + 'h-8z"/><text x="' + px + '" y="' + (230 - ph - 6) + '" text-anchor="middle" style="font:500 10px system-ui" fill="#7a6553">1,70 m</text></g>';
    return '<svg viewBox="0 0 400 270" style="width:100%;height:100%"><line x1="10" y1="231" x2="390" y2="231" stroke="#0003"/>' + person + '<g fill="' + col + '" stroke="#2b1d1233">' + body + '</g>' + grain + cota(x0, y0 - 14, x0 + w, y0 - 14, W + ' cm') + cota(x0 + w + 14, y0, x0 + w + 14, y0 + h, Hh + ' cm', true) + '<text x="200" y="258" text-anchor="middle" style="font:500 11px system-ui" fill="#7a6553">Fondo ' + Fd + ' cm · ' + mad.l + ' · ' + ACA[aca][0].toLowerCase() + '</text></svg>';
  };
  const calc = () => { const m2 = (W * Hh + W * Fd + Hh * Fd) / 10000 * (tip === 'mesa' ? .55 : 1.4); return Math.round((TIP[tip].base + m2 * 260 * mad.k + ACA[aca][1] + caj * 45) / 10) * 10; };
  const draw = () => {
    pane.innerHTML = svg(); const p = calc(), sem = 3 + Math.round(p / 900);
    P.card('<small>' + TIP[tip].l.toUpperCase() + ' A MEDIDA</small><b>' + mad.l + ' · ' + ACA[aca][0].toLowerCase() + '</b><ul><li>' + W + ' × ' + Hh + ' × ' + Fd + ' cm</li>' + (caj ? '<li>' + caj + ' cajones con cierre suave</li>' : '') + '<li>Medición en casa gratis</li><li>Garantía 5 años</li></ul><em>Desde ' + p.toLocaleString('es-ES') + ' € · taller ' + sem + '–' + (sem + 2) + ' semanas</em>');
    box.innerHTML = '<h4>Precio orientativo</h4><div class="vt-big">' + p.toLocaleString('es-ES') + '<em> €</em></div><div class="vt-row"><span>Madera</span><b>' + mad.l + ' FSC</b></div><div class="vt-row"><span>Plazo</span><b>' + sem + '–' + (sem + 2) + ' sem.</b></div>';
    ['Ancho', 'Alto', 'Fondo'].forEach(k => ui.del(k)); // ya van juntas en «Medidas»
    ui.set('Mueble', TIP[tip].l); ui.set('Medidas', W + ' × ' + Hh + ' × ' + Fd + ' cm'); ui.set('Madera', mad.l); ui.set('Acabado', ACA[aca][0]); if (caj) ui.set('Cajones', caj); else ui.del('Cajones'); ui.set('Precio orientativo', 'desde ' + p.toLocaleString('es-ES') + ' €');
  };
  const ranges = () => {
    ui.redo('Ancho', () => ui.range('Ancho', { min: 40, max: 320, step: 5, value: W, unit: ' cm' }, v => { W = v; draw(); }));
    ui.redo('Alto', () => ui.range('Alto', { min: 30, max: 260, step: 5, value: Hh, unit: ' cm' }, v => { Hh = v; draw(); }));
    ui.redo('Fondo', () => ui.range('Fondo', { min: 25, max: 120, step: 5, value: Fd, unit: ' cm' }, v => { Fd = v; draw(); }));
  };
  ui.chips('Mueble', Object.entries(TIP).map(([v, t]) => ({ v, l: t.l })), tip, v => { tip = v; ({ w: W, h: Hh, f: Fd } = TIP[v]); caj = v === 'aparador' ? 3 : 0; P.show(TIP[v].ph, 'blur(4px)'); P.caption(TIP[v].l, 'Hecho en nuestro taller'); ranges(); ui.redo('Cajones', cajG); draw(); if (g) g.fromTo(pane.firstChild, { scale: .92, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }); });
  ui.range('Ancho', { min: 40, max: 320, step: 5, value: W, unit: ' cm' }, v => { W = v; draw(); });
  ui.range('Alto', { min: 30, max: 260, step: 5, value: Hh, unit: ' cm' }, v => { Hh = v; draw(); });
  ui.range('Fondo', { min: 25, max: 120, step: 5, value: Fd, unit: ' cm' }, v => { Fd = v; draw(); });
  ui.swatches('Madera', MAD.map(m => ({ v: m.v, l: m.l })), mad.v, v => { mad = MAD.find(m => m.v === v) || mad; draw(); }, false);
  ui.chips('Acabado', Object.entries(ACA).map(([v, a]) => ({ v, l: a[0] + (a[1] ? ' +' + a[1] + ' €' : '') })), aca, v => { aca = v; draw(); });
  const cajG = () => ui.range('Cajones', { min: 0, max: 6, value: caj, fmt: v => v ? v + ' cajones' : 'Sin cajones' }, v => { caj = v; draw(); });
  cajG();
  ui.buttons([{ l: '📐 Pedir medición en casa', main: true, fn: () => { ui.set('Medición', 'En casa, gratis'); ui.toast('¡Apuntado! Te llamamos para ir a medir'); } }]);
  const kb = [
    { k: ['precio', 'cuanto cuesta', 'mesa', 'presupuesto'], t: '¿Cuánto cuesta?', u: 'baja', p: 'mesa desde 690 €', d: '—', a: 'Una mesa maciza de roble de 200 cm ronda los 900–1.300 €. Mueve las medidas aquí al lado y verás el precio al momento; el definitivo, tras medir.', on: () => {} },
    { k: ['plazo', 'cuanto tarda', 'semanas', 'urgente'], t: 'Plazos', u: 'baja', p: '—', d: '3–6 semanas', a: 'Entre 3 y 6 semanas según la pieza. Si es urgente, dínoslo: a veces podemos adelantar.', on: () => {} },
    { k: ['exterior', 'terraza', 'jardin', 'intemperie'], t: 'Para exterior', u: 'baja', p: '—', d: '—', a: 'Para fuera usamos <b>iroko</b> o <b>pino tratado autoclave</b> con aceite de exterior. Hay que reaceitar una vez al año.', on: () => {} },
    { k: ['restaurar', 'antiguo', 'abuela', 'heredado', 'arreglar'], t: 'Restaurar un mueble', u: 'baja', p: 'presupuesto gratis', d: '2–4 semanas', a: 'Mándanos fotos por WhatsApp. Decapamos, reparamos ensambles, tratamos carcoma y devolvemos el acabado original.', on: () => {} },
    { k: ['carcoma', 'agujeritos', 'serrin'], t: 'Carcoma', u: 'media', p: 'desde 60 €', d: '—', a: 'Si sale serrín fino, está activa. Tratamos con producto específico y sellamos. Cuanto antes, mejor para que no pase a otros muebles.', on: () => {} },
    { k: ['armario', 'empotrado', 'vestidor', 'hueco'], t: 'Armario empotrado', u: 'baja', p: 'desde 1.200 €', d: '4–6 semanas', a: 'Lo hacemos al milímetro con el interior que necesites: barras, cajones, zapatero. Medimos en casa gratis.', on: () => { tip = 'armario'; ui.pick('Mueble', tip); ({ w: W, h: Hh, f: Fd } = TIP.armario); ranges(); draw(); } },
    { k: ['madera', 'roble', 'nogal', 'pino', 'cual es mejor'], t: '¿Qué madera elijo?', u: 'baja', p: '—', d: '—', a: '<b>Roble</b>: duro y clásico. <b>Nogal</b>: oscuro y elegante. <b>Haya</b>: clara y resistente. <b>Pino</b>: la más económica. Todas certificadas FSC.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Carpintero de ' + (FX.BIZ.nombre || ''), avatar: '🪚', fab: '¿Qué mueble necesitas?', placeholder: 'Ej.: mesa de 2 m, restaurar un mueble…', quick: ['¿Cuánto cuesta una mesa?', 'Restaurar un mueble', 'Armario empotrado', '¿Qué madera elijo?', 'Plazos'], label: 'Consulta', waIntro: 'Hola, os escribo por un mueble: ', cta: 'Pedir presupuesto', hello: 'Hola 🪚 Cuéntame qué mueble tienes en mente y te oriento con madera, precio y plazo.' });
  P.show(TIP.mesa.ph, 'blur(4px)'); P.caption(TIP.mesa.l, 'Hecho en nuestro taller'); draw();
};
