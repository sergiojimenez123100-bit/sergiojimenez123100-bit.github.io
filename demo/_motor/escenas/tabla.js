/* Skate · Monta tu tabla: deck a escala (SVG) con medida, gráfico, grip, ejes y ruedas; se da la vuelta, recomienda medida por tu pie y uso + chat del rider */
FXSTUDIO.scenes.tabla = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff4f1a';
  const GRA = {
    llamas: ['Llamas', c => '<rect width="100%" height="100%" fill="#111"/>' + [0, 1, 2, 3, 4].map(i => '<path d="M' + (i * 22 - 10) + ' 640 Q' + (i * 22) + ' ' + (420 - i * 30) + ' ' + (i * 22 + 18) + ' 520 Q' + (i * 22 + 30) + ' 380 ' + (i * 22 + 34) + ' 640Z" fill="' + c + '" opacity=".9"/>').join('')],
    ondas: ['Ondas', c => '<rect width="100%" height="100%" fill="' + c + '"/>' + Array.from({ length: 14 }, (_, i) => '<path d="M-10 ' + (i * 46 + 20) + ' Q30 ' + (i * 46) + ' 60 ' + (i * 46 + 20) + ' T130 ' + (i * 46 + 20) + '" stroke="#fff" stroke-width="7" fill="none" opacity=".85"/>').join('')],
    cuadros: ['Cuadros', c => Array.from({ length: 28 }, (_, y) => Array.from({ length: 4 }, (_, x) => '<rect x="' + x * 30 + '" y="' + y * 24 + '" width="30" height="24" fill="' + ((x + y) % 2 ? '#fff' : c) + '"/>').join('')).join('')],
    logo: ['Logo de la tienda', c => '<rect width="100%" height="100%" fill="#f2efe6"/><circle cx="60" cy="320" r="46" fill="' + c + '"/><text x="60" y="334" font-family="Anton,Impact,sans-serif" font-size="40" text-anchor="middle" fill="#fff">' + FX.esc((FX.BIZ.nombre || 'SK8').split(' ')[0].slice(0, 4).toUpperCase()) + '</text>'],
    liso: ['Liso', c => '<rect width="100%" height="100%" fill="' + c + '"/>']
  };
  const MED = { '7.75': 'Hasta pie 39', '8.0': 'Pie 40–42', '8.25': 'Pie 42–44', '8.5': 'Pie 44 o más' };
  const EJE = { std: ['Estándar', 45], light: ['Ligeros (huecos)', 65], ti: ['Titanio', 95] };
  const RUE = { park: ['52 mm · 99A · park', 35], street: ['54 mm · 101A · street', 40], cruiser: ['56 mm · 78A · crucero', 45] };
  const ROD = { basic: ['ABEC 7', 15], swiss: ['Swiss', 45] };
  let med = '8.0', gra = 'llamas', gc = acc, grip = 'negro', eje = 'std', rue = 'street', wc = '#f5f1e3', rod = 'basic', pie = 42, flip = true;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;left:0;right:0;top:4%;bottom:14%;z-index:2;display:grid;place-items:center;perspective:900px;pointer-events:none';
  P.room.querySelector('.vt-photo').appendChild(wrap);
  const box = P.box();
  const deck = () => {
    const W = 120 * (+med / 8), side = flip ? 'abajo' : 'arriba';
    const shape = 'M' + (60 - W / 2) + ' 70 Q' + (60 - W / 2) + ' 0 60 0 Q' + (60 + W / 2) + ' 0 ' + (60 + W / 2) + ' 70 L' + (60 + W / 2) + ' 570 Q' + (60 + W / 2) + ' 640 60 640 Q' + (60 - W / 2) + ' 640 ' + (60 - W / 2) + ' 570 Z';
    const trucks = [110, 530].map(y => flip ? '<rect x="' + (60 - W / 2 - 14) + '" y="' + (y - 10) + '" width="' + (W + 28) + '" height="20" rx="8" fill="#9aa0a6"/><rect x="' + (60 - 22) + '" y="' + (y - 24) + '" width="44" height="48" rx="10" fill="#6b7177"/>' + [-1, 1].map(s => '<rect x="' + (60 + s * (W / 2 + 10) - 12) + '" y="' + (y - 24) + '" width="24" height="48" rx="9" fill="' + wc + '" stroke="#0003"/>').join('') : [-1, 1].map(s => [-1, 1].map(t => '<circle cx="' + (60 + s * 16) + '" cy="' + (y + t * 16) + '" r="3.5" fill="#bbb"/>').join('')).join('')).join('');
    return '<svg viewBox="-20 -110 680 220" style="width:94%;max-height:100%;overflow:visible;transform:rotate(-8deg);filter:drop-shadow(0 24px 22px rgba(0,0,0,.35))"><defs><clipPath id="dk"><path d="' + shape + '"/></clipPath><pattern id="gr" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="' + (grip === 'negro' ? '#1b1b1b' : grip === 'claro' ? 'rgba(30,30,30,.25)' : acc) + '"/><circle cx="2" cy="2" r=".8" fill="#fff" opacity=".18"/></pattern></defs><g transform="translate(0,60) rotate(-90)">' +
      '<g clip-path="url(#dk)">' + (flip ? GRA[gra][1](gc) : (grip === 'claro' ? GRA[gra][1](gc) : '') + '<rect width="100%" height="100%" fill="url(#gr)"/>') + '</g><path d="' + shape + '" fill="none" stroke="#0006" stroke-width="2"/>' + trucks + '</g></svg>';
  };
  const price = () => (gra === 'logo' ? 65 : 55) + EJE[eje][1] + RUE[rue][1] + ROD[rod][1] + (grip === 'color' ? 5 : 0);
  const draw = () => {
    wrap.innerHTML = deck();
    const rec = pie <= 39 ? '7.75' : pie <= 42 ? '8.0' : pie <= 44 ? '8.25' : '8.5', uso = rue === 'cruiser' ? 'Crucero y ciudad' : rue === 'park' ? 'Park y bowl' : 'Street y técnica', p = price();
    P.card('<small>TU TABLA · ' + med + '"</small><b>' + GRA[gra][0] + ' + grip ' + grip + '</b><ul><li>Ejes ' + EJE[eje][0].toLowerCase() + '</li><li>Ruedas ' + RUE[rue][0] + '</li><li>Rodamientos ' + ROD[rod][0] + '</li><li>' + (rec === med ? '✅ Medida perfecta para tu pie' : '💡 Para un ' + pie + ' te iría mejor ' + rec + '"') + '</li></ul><em>' + p + ' € · montaje gratis en 15 min</em>');
    box.innerHTML = '<h4>Para qué es</h4><div class="vt-big" style="font-size:24px!important">' + uso + '</div><div class="vt-row"><span>Tu pie</span><b>' + pie + ' → ' + rec + '"</b></div><div class="vt-row"><span>Total</span><b>' + p + ' €</b></div>';
    ui.set('Deck', med + '" · ' + GRA[gra][0]); ui.set('Grip', grip); ui.set('Ejes', EJE[eje][0]); ui.set('Ruedas', RUE[rue][0]); ui.set('Rodamientos', ROD[rod][0]); ui.set('Precio', p + ' €');
  };
  const pop = () => { if (g) g.fromTo(wrap.firstChild, { y: 30, rotate: -16 }, { y: 0, rotate: -8, duration: .7, ease: 'back.out(2.5)' }); };
  ui.range('Tu número de pie', { min: 35, max: 47, value: pie, fmt: v => 'Pie ' + v }, v => { pie = v; draw(); });
  ui.chips('Medida del deck', Object.entries(MED).map(([v, l]) => ({ v, l: v + '" · ' + l })), med, v => { med = v; draw(); pop(); });
  ui.chips('Gráfico', Object.entries(GRA).map(([v, x]) => ({ v, l: x[0] })), gra, v => { gra = v; flip = true; draw(); pop(); });
  ui.swatches('Color del gráfico', [{ v: acc, l: 'Color tienda' }, { v: '#1e88e5', l: 'Azul' }, { v: '#2e7d32', l: 'Verde' }, { v: '#fdd835', l: 'Amarillo' }, { v: '#8e24aa', l: 'Morado' }], acc, v => { gc = v; flip = true; draw(); });
  ui.chips('Grip', [{ v: 'negro', l: 'Negro clásico' }, { v: 'claro', l: 'Transparente' }, { v: 'color', l: 'De color (+5 €)' }], grip, v => { grip = v; flip = false; draw(); pop(); });
  ui.chips('Ejes', Object.entries(EJE).map(([v, e]) => ({ v, l: e[0] + ' · ' + e[1] + ' €' })), eje, v => { eje = v; flip = true; draw(); });
  ui.chips('Ruedas', Object.entries(RUE).map(([v, r]) => ({ v, l: r[0] + ' · ' + r[1] + ' €' })), rue, v => { rue = v; flip = true; draw(); });
  ui.swatches('Color de ruedas', [{ v: '#f5f1e3', l: 'Natural' }, { v: '#111111', l: 'Negro' }, { v: '#ff5252', l: 'Rojo' }, { v: '#40c4ff', l: 'Azul' }], wc, v => { wc = v; flip = true; draw(); });
  ui.chips('Rodamientos', Object.entries(ROD).map(([v, r]) => ({ v, l: r[0] + ' · ' + r[1] + ' €' })), rod, v => { rod = v; draw(); });
  ui.buttons([{ l: '🔄 Dar la vuelta', fn: () => { flip = !flip; if (g) g.to(wrap, { rotateY: 90, duration: .25, ease: 'power2.in', onComplete: () => { draw(); g.fromTo(wrap, { rotateY: -90 }, { rotateY: 0, duration: .35, ease: 'power2.out' }); } }); else draw(); } }, { l: '🛹 ¡Ollie!', main: true, fn: () => { if (g) g.timeline().to(wrap, { y: -90, rotate: 8, duration: .28, ease: 'power2.out' }).to(wrap, { y: 0, rotate: 0, duration: .4, ease: 'bounce.out' }); ui.toast('Tabla lista: te la montamos en 15 min'); } }]);
  const kb = [
    { k: ['empezar', 'principiante', 'primera tabla', 'nunca', 'aprender'], t: 'Primera tabla', u: 'baja', p: 'desde 89 €', d: '—', a: 'Una completa de <b>8.0"</b> con ruedas de 54 mm y ejes estándar va perfecta para aprender. Y las clases del sábado incluyen protecciones.', on: () => { med = '8.0'; rue = 'street'; eje = 'std'; ui.pick('Medida del deck', med); ui.pick('Ruedas', rue); ui.pick('Ejes', eje); draw(); } },
    { k: ['medida', 'ancho', 'que medida', 'pulgadas'], t: '¿Qué medida?', u: 'baja', p: '—', d: '—', a: 'Va por el pie y el estilo: hasta 39 → 7.75"; 40–42 → 8.0"; 42–44 → 8.25"; 44+ → 8.5". Para bowl, un poco más ancha.', on: () => {} },
    { k: ['bowl', 'park', 'rampa', 'transicion'], t: 'Para bowl y park', u: 'baja', p: '—', d: '—', a: 'Deck de 8.25"+, ruedas duras de 52–54 mm (99A+) y ejes estándar que aguanten golpes.', on: () => { med = '8.25'; rue = 'park'; ui.pick('Medida del deck', med); ui.pick('Ruedas', rue); draw(); } },
    { k: ['crucero', 'ir a clase', 'moverme', 'ciudad', 'suelo malo', 'cruiser'], t: 'Para moverte por la ciudad', u: 'baja', p: '—', d: '—', a: 'Ruedas blandas de 56 mm (78A): absorben baches y suenan menos. Rodamientos Swiss si haces muchos kilómetros.', on: () => { rue = 'cruiser'; rod = 'swiss'; ui.pick('Ruedas', rue); ui.pick('Rodamientos', rod); draw(); } },
    { k: ['rodamientos', 'no rueda', 'suena', 'chirria'], t: 'No rueda bien', u: 'media', p: 'desde 5 €', d: '15 min', a: 'Seguramente rodamientos sucios u oxidados. Tráela: los limpiamos o cambiamos al momento.', on: () => {} },
    { k: ['grip', 'lija', 'cambiar grip'], t: 'Cambiar el grip', u: 'baja', p: '10 € con montaje', d: '10 min', a: 'Te ponemos grip nuevo en 10 minutos. El transparente deja ver el gráfico del deck.', on: () => { grip = 'claro'; ui.pick('Grip', grip); draw(); } }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Rider de ' + (FX.BIZ.nombre || ''), avatar: '🛹', fab: '¿Qué tabla te pillo?', placeholder: 'Ej.: empiezo de cero, quiero ir a clase en tabla…', quick: ['Primera tabla', '¿Qué medida?', 'Para bowl', 'Para la ciudad', 'No rueda bien'], label: 'Consulta', waIntro: 'Hey, os escribo por una tabla: ', cta: 'Montar esta tabla', hello: 'Hey 🛹 ¿Para qué la quieres: street, bowl o moverte por la ciudad? Te digo qué piezas pillar.' });
  P.show('1688318375271-b25e13f196ca', 'blur(3px) brightness(.9)'); P.caption('Tu tabla', 'Pieza a pieza, a tu medida'); draw();
};
