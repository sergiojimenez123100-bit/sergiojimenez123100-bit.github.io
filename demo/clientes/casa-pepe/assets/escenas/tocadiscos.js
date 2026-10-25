/* Vinilos · Cubeta online: género → discos (portadas generadas), estado y precio; el disco se pone en un plato que gira con brazo y crujido sintetizado + chat del dependiente */
FXSTUDIO.scenes.tocadiscos = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff5c39';
  const GEN = {
    jazz: ['🎷 Jazz', '1526394931762-90052e97b376', [['Kind of Blue', 'Miles Davis', 1959, 26], ['A Love Supreme', 'John Coltrane', 1965, 28], ['Time Out', 'Dave Brubeck', 1959, 24], ['Moanin\'', 'Art Blakey', 1958, 25]]],
    soul: ['🎙️ Soul y funk', '1602848597941-0d3d3a2c1241', [['What\'s Going On', 'Marvin Gaye', 1971, 27], ['Songs in the Key of Life', 'Stevie Wonder', 1976, 38], ['Superfly', 'Curtis Mayfield', 1972, 26], ['I Never Loved a Man', 'Aretha Franklin', 1967, 25]]],
    rock: ['🎸 Rock', '1785370145134-891856533f6d', [['Rumours', 'Fleetwood Mac', 1977, 29], ['London Calling', 'The Clash', 1979, 32], ['Led Zeppelin IV', 'Led Zeppelin', 1971, 30], ['The Dark Side of the Moon', 'Pink Floyd', 1973, 33]]],
    flamenco: ['💃 Flamenco', '1786418288597-ed51fa73230c', [['La leyenda del tiempo', 'Camarón', 1979, 28], ['Fuente y caudal', 'Paco de Lucía', 1973, 26], ['Almoraima', 'Paco de Lucía', 1976, 26], ['Omega', 'Enrique Morente', 1996, 34]]],
    electro: ['🎛️ Electrónica', '1616714109948-c74fe5029a4d', [['Discovery', 'Daft Punk', 2001, 34], ['Homework', 'Daft Punk', 1997, 32], ['Selected Ambient Works 85–92', 'Aphex Twin', 1992, 31], ['Music Has the Right to Children', 'Boards of Canada', 1998, 35]]],
    hiphop: ['🎤 Hip hop', '1669801158950-f663cf15298c', [['Illmatic', 'Nas', 1994, 29], ['The Low End Theory', 'A Tribe Called Quest', 1991, 30], ['Enter the Wu-Tang', 'Wu-Tang Clan', 1993, 31], ['Madvillainy', 'Madvillain', 2004, 33]]],
    pop: ['🎤 Pop español', '1580656449278-e8381933522c', [['Entre el cielo y el suelo', 'Mecano', 1986, 24], ['Senderos de traición', 'Héroes del Silencio', 1990, 27], ['La canción de Juan Perro', 'Radio Futura', 1987, 25], ['El mal querer', 'Rosalía', 2018, 29]]]
  };
  const EST = { nuevo: ['Nuevo · precintado', 1], nm: ['Segunda mano · NM', .75], vg: ['Segunda mano · VG+', .55] };
  let gen = 'jazz', di = 0, est = 'nuevo', rpm = 33, on = false, ctx = null, crack = null;
  const hue = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const tt = document.createElement('div');
  tt.style.cssText = 'position:absolute;left:5%;right:5%;top:6%;bottom:16%;z-index:2;display:grid;place-items:center;pointer-events:none';
  P.room.querySelector('.vt-photo').appendChild(tt);
  const box = P.box();
  const cover = (d, sz) => { const h = hue(d[0] + d[1]); return '<div style="width:' + sz + 'px;height:' + sz + 'px;flex:none;border-radius:4px;background:linear-gradient(135deg,hsl(' + h + ' 60% 45%),hsl(' + ((h + 70) % 360) + ' 70% 25%));color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:6px;font:700 9px/1.1 system-ui;box-shadow:0 6px 14px rgba(0,0,0,.3)">' + FX.esc(d[0]) + '<span style="font-weight:400;opacity:.8">' + FX.esc(d[1]) + '</span></div>'; };
  const deck = () => {
    const d = GEN[gen][2][di], h = hue(d[0] + d[1]);
    tt.innerHTML = '<svg viewBox="0 0 520 380" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 26px 30px rgba(0,0,0,.45))">' +
      '<defs><radialGradient id="vg"><stop offset="0" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient><linearGradient id="pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b4a2e"/><stop offset="1" stop-color="#3a2616"/></linearGradient></defs>' +
      '<rect x="10" y="10" width="500" height="360" rx="22" fill="url(#pl)"/><rect x="10" y="10" width="500" height="360" rx="22" fill="none" stroke="#ffffff22"/>' +
      '<circle cx="200" cy="190" r="158" fill="#1a1a1a"/><g class="vn" style="transform-origin:200px 190px">' +
      '<circle cx="200" cy="190" r="150" fill="url(#vg)"/>' + [140, 128, 116, 104, 92, 80].map(r => '<circle cx="200" cy="190" r="' + r + '" fill="none" stroke="#ffffff10" stroke-width="1"/>').join('') +
      '<path d="M90 120 A130 130 0 0 1 200 60" stroke="#ffffff22" stroke-width="18" fill="none"/>' +
      '<circle cx="200" cy="190" r="52" fill="hsl(' + h + ' 65% 50%)"/><text x="200" y="182" text-anchor="middle" fill="#fff" style="font:700 11px system-ui">' + FX.esc(d[0].slice(0, 22)) + '</text><text x="200" y="198" text-anchor="middle" fill="#fff" style="font:10px system-ui;opacity:.8">' + FX.esc(d[1]) + '</text><circle cx="200" cy="190" r="5" fill="#ddd"/></g>' +
      '<g class="arm" style="transform-origin:430px 70px"><circle cx="430" cy="70" r="26" fill="#bfbfbf"/><circle cx="430" cy="70" r="12" fill="#888"/><path d="M430 70 L410 250 L370 285" stroke="#d9d9d9" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="352" y="276" width="30" height="18" rx="4" fill="#222" transform="rotate(30 367 285)"/></g>' +
      '<circle cx="455" cy="320" r="14" fill="' + (on ? acc : '#333') + '"/><text x="470" y="352" fill="#fff" style="font:700 11px system-ui" text-anchor="end">' + rpm + ' RPM</text></svg>';
    const vn = tt.querySelector('.vn'), arm = tt.querySelector('.arm');
    if (g) { g.set(arm, { rotate: on ? 22 : 0 }); if (on) g.to(vn, { rotate: '+=360', duration: 60 / rpm * (rpm === 33 ? 1 : 1), repeat: -1, ease: 'none' }); }
  };
  const sound = start => {
    if (!start) { if (crack) { crack.stop(); crack = null; } return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; ctx = ctx || new C(); ctx.resume();
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() < .0009 ? (Math.random() * 2 - 1) * .9 : 0) + (Math.random() * 2 - 1) * .012;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain(); s.buffer = b; s.loop = true; f.type = 'highpass'; f.frequency.value = 900; v.gain.value = .5; s.connect(f); f.connect(v); v.connect(ctx.destination); s.start(); crack = s;
  };
  const draw = () => {
    const L = GEN[gen][2], d = L[di], pr = Math.round(d[3] * EST[est][1]);
    deck();
    P.card('<small>' + GEN[gen][0].toUpperCase() + ' · CUBETA</small><b>' + FX.esc(d[0]) + '</b><div style="display:flex;gap:6px;margin:8px 0">' + L.map((x, i) => '<span style="outline:' + (i === di ? '2px solid ' + acc : 'none') + ';border-radius:4px">' + cover(x, 46) + '</span>').join('') + '</div><ul><li>' + FX.esc(d[1]) + ' · ' + d[2] + '</li><li>' + EST[est][0] + '</li></ul><em>' + pr + ' € · te lo guardamos 3 días</em>');
    box.innerHTML = '<h4>' + (on ? 'Sonando' : 'En el plato') + '</h4><div class="vt-big">' + rpm + '<em> rpm</em></div><div class="vt-row"><span>Precio</span><b>' + pr + ' €</b></div><div class="vt-row"><span>Estado</span><b>' + EST[est][0].split(' · ').pop() + '</b></div>';
    ui.set('Disco', d[0] + ' — ' + d[1] + ' (' + d[2] + ')'); ui.set('Estado', EST[est][0]); ui.set('Precio', pr + ' €');
  };
  const discos = () => ui.chips('Disco', GEN[gen][2].map((d, i) => ({ v: String(i), l: d[0] + ' · ' + d[1] })), String(di), v => { di = +v; draw(); if (g) g.fromTo(tt.querySelector('.vn'), { scale: .8, opacity: .3 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }); });
  ui.chips('Género', Object.entries(GEN).map(([v, x]) => ({ v, l: x[0] })), gen, v => { gen = v; di = 0; P.show(GEN[v][1], 'blur(3px) brightness(.75)'); P.caption(GEN[v][0], GEN[v][2].length + ' discos destacados'); ui.redo('Disco', discos); draw(); });
  discos();
  ui.chips('Estado', Object.entries(EST).map(([v, e]) => ({ v, l: e[0] })), est, v => { est = v; draw(); });
  ui.chips('Velocidad', [{ v: '33', l: '33⅓ rpm (LP)' }, { v: '45', l: '45 rpm (single)' }], '33', v => { rpm = +v; draw(); });
  ui.buttons([{ l: '▶ Poner / parar', main: true, fn: () => { on = !on; sound(on); draw(); if (on && g) g.fromTo(tt.querySelector('.arm'), { rotate: 0 }, { rotate: 22, duration: 1.2, ease: 'power2.inOut' }); } }]);
  new IntersectionObserver(es => { if (!es[0].isIntersecting && on) { on = false; sound(false); draw(); } }).observe(stage);
  const kb = [
    { k: ['busco', 'buscando', 'teneis', 'tienen', 'disco de', 'primera edicion'], t: 'Busco un disco', u: 'baja', p: '—', d: '24 h', a: 'Dime artista y título por WhatsApp: miramos en tienda y en el almacén. Si no está, te avisamos cuando entre.', on: () => {} },
    { k: ['tocadiscos', 'empezar', 'equipo', 'altavoces', 'primer tocadiscos'], t: 'Mi primer tocadiscos', u: 'baja', p: 'desde 149 €', d: '—', a: 'Un plato con previo integrado + dos altavoces activos y listo. Evita las maletas baratas: rayan los discos. Te lo dejamos montado y probado.', on: () => {} },
    { k: ['vender', 'colección', 'coleccion', 'herencia', 'mi padre', 'compran'], t: 'Vender una colección', u: 'baja', p: 'tasación gratis', d: '48 h', a: 'Vamos a casa, revisamos disco a disco y te pagamos al momento. Sin compromiso.', on: () => {} },
    { k: ['estado', 'vg', 'nm', 'goldmine', 'rayado'], t: 'Estados del vinilo', u: 'baja', p: '—', d: '—', a: '<b>M</b> perfecto, <b>NM</b> casi nuevo, <b>VG+</b> marcas leves que apenas suenan, <b>VG</b> se oye algo de ruido. Todo lo escuchamos antes de ponerle nota.', on: () => {} },
    { k: ['limpiar', 'limpieza', 'polvo', 'cuidar'], t: 'Cuidar los discos', u: 'baja', p: 'kit 19 €', d: '—', a: 'Guárdalos de pie, con funda interior antiestática y cepillo de fibra de carbono antes de cada escucha. Tenemos máquina de lavado por 2 €/disco.', on: () => {} },
    { k: ['regalo', 'regalar', 'cumpleanos', 'no se que'], t: 'Para regalar', u: 'baja', p: 'tarjeta desde 20 €', d: '—', a: 'Dime qué escucha y te propongo tres; o tarjeta regalo para que rebusque en la tienda.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Dependiente de ' + (FX.BIZ.nombre || ''), avatar: '💿', fab: '¿Qué buscas?', placeholder: 'Ej.: busco un disco, quiero un tocadiscos…', quick: ['Busco un disco', 'Mi primer tocadiscos', 'Vender mi colección', 'Para regalar', 'Estados del vinilo'], label: 'Consulta', waIntro: 'Hola, os escribo por un disco: ', cta: 'Reservar este disco', hello: 'Hola 💿 ¿Buscas algo concreto o te apetece rebuscar? Te ayudo.' });
  P.show(GEN.jazz[1], 'blur(3px) brightness(.75)'); P.caption(GEN.jazz[0], '4 discos destacados'); draw();
};
