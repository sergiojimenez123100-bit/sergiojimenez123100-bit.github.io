/* Discoteca · Elige noche, zona (fotos reales), gente, botellas y extras → precio por persona y entrada con QR neón + chat del portero */
FXSTUDIO.scenes.reservado = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff2bd6';
  const NOC = { jue: ['Jueves Universitario', 'Comercial y hits'], vie: ['Viernes House', 'House y tech house'], sab: ['Sábado Latino', 'Reggaetón y salsa'] };
  const ZON = {
    lista: { l: '📝 Lista', p: 0, cap: 0, inc: 0, ph: '1545128485-c400e7702796', d: 'Gratis antes de la 1:30 · después 15 € con copa' },
    pista: { l: '🎟️ Entrada + copa', p: 20, cap: 0, inc: 0, ph: '1764510377343-e5b12385791b', d: '20 € por persona con una copa' },
    reservado: { l: '🛋️ Reservado', p: 250, cap: 8, inc: 1, ph: '1569924995012-c4c706bfcd51', d: 'Hasta 8 personas · 1 botella incluida' },
    vip: { l: '👑 VIP cabina', p: 600, cap: 12, inc: 3, ph: '1763757575623-ffafe0867aa3', d: 'Junto a la cabina · hasta 12 · 3 botellas' }
  };
  const BOT = { gin: ['Ginebra premium', 150], ron: ['Ron añejo', 140], vodka: ['Vodka', 140], whisky: ['Whisky', 160], cava: ['Champán', 220] };
  let noc = 'sab', zona = 'reservado', per = 8, bot = ['gin'], cumple = false;
  const box = P.box(), qr = document.createElement('div'); P.room.appendChild(qr);
  const seed = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => (h = (h * 1103515245 + 12345) >>> 0) / 4294967296; };
  const calc = () => {
    const z = ZON[zona]; let t;
    if (zona === 'lista') t = 0; else if (zona === 'pista') t = per * z.p;
    else { const extra = Math.max(0, per - z.cap) * 25, pagadas = Math.max(0, bot.length - z.inc); t = z.p + extra + bot.slice(z.inc).reduce((a, k) => a + BOT[k][1], 0) * (pagadas ? 1 : 0); }
    return t;
  };
  const draw = () => {
    const z = ZON[zona], t = calc(), code = 'ORB-' + noc.toUpperCase() + '-' + String(per * 137 + t).slice(-4), r = seed(code);
    let cells = ''; for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) if ((x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5) || r() > .5) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    qr.style.cssText = 'position:absolute;left:6%;bottom:9%;z-index:3;width:min(240px,46%);padding:14px;border-radius:16px;background:rgba(10,4,20,.82);border:1px solid ' + acc + ';box-shadow:0 0 30px ' + acc + '88,inset 0 0 20px ' + acc + '33;color:#fff;font:12px/1.3 system-ui;backdrop-filter:blur(8px)';
    qr.innerHTML = '<div style="display:flex;gap:12px;align-items:center"><svg viewBox="0 0 9 9" width="64" height="64" style="background:#fff;padding:4px;border-radius:6px;flex:none" fill="#0a0414">' + cells + '</svg><div><b style="font:800 13px system-ui;letter-spacing:.08em;color:' + acc + ';text-shadow:0 0 10px ' + acc + '">' + esc(FX.BIZ.nombre || 'CLUB') + '</b><div>' + NOC[noc][0] + '</div><div style="opacity:.7">' + z.l.replace(/^\S+ /, '') + ' · ' + per + ' pers.' + (cumple ? ' · 🎂' : '') + '</div><code style="opacity:.6;font-size:10px">' + code + '</code></div></div>';
    P.card('<small>' + NOC[noc][0].toUpperCase() + ' · ' + NOC[noc][1] + '</small><b>' + z.l + ' · ' + per + ' personas</b><ul>' + (zona === 'reservado' || zona === 'vip' ? '<li>' + z.inc + (z.inc > 1 ? ' botellas incluidas' : ' botella incluida') + '</li>' + bot.map((k, i) => '<li>' + BOT[k][0] + (i < z.inc ? ' · incluida' : ' · ' + BOT[k][1] + ' €') + '</li>').join('') + (per > z.cap ? '<li>' + (per - z.cap) + ' personas extra · 25 € c/u</li>' : '') : '<li>' + z.d + '</li>') + (cumple ? '<li>🎂 Tarta con bengalas y cava · gratis</li>' : '') + '</ul><em>' + (t ? t + ' € · ' + Math.ceil(t / per) + ' € por persona' : 'Gratis en lista antes de la 1:30') + '</em>');
    box.innerHTML = '<h4>Por persona</h4><div class="vt-big">' + Math.ceil(t / per) + '<em> €</em></div><div class="vt-row"><span>Total</span><b>' + t + ' €</b></div><div class="vt-row"><span>Entrada</span><b>Sin cola</b></div>';
    ui.set('Noche', NOC[noc][0]); ui.set('Zona', z.l); ui.set('Personas', per); if (zona === 'reservado' || zona === 'vip') ui.set('Botellas', bot.map(k => BOT[k][0]).join(', ') || '—'); else ui.del('Botellas'); ui.set('Total', t + ' € (' + Math.ceil(t / per) + ' €/pers.)'); if (cumple) ui.set('Cumpleaños', 'Sí, con tarta'); else ui.del('Cumpleaños');
  };
  const esc = FX.esc;
  ui.chips('Noche', Object.entries(NOC).map(([v, n]) => ({ v, l: n[0] })), noc, v => { noc = v; draw(); });
  ui.chips('Zona', Object.entries(ZON).map(([v, z]) => ({ v, l: z.l })), zona, v => { zona = v; P.show(ZON[v].ph); P.caption(ZON[v].l, ZON[v].d); draw(); });
  ui.range('Personas', { min: 2, max: 16, value: per, fmt: v => v + ' personas' }, v => { per = v; draw(); });
  ui.chips('Botellas (reservados)', Object.entries(BOT).map(([v, b]) => ({ v, l: b[0] + ' · ' + b[1] + ' €' })), bot, v => { bot = v; draw(); }, true);
  ui.chips('¿Es un cumpleaños?', [{ v: 'no', l: 'No' }, { v: 'si', l: '🎂 Sí' }], 'no', v => { cumple = v === 'si'; draw(); });
  ui.buttons([{ l: '🔊 Subir el volumen', main: true, fn: () => { ui.toast('¡Reserva lista! Envíala por WhatsApp y entra sin cola'); if (g) { g.fromTo(qr, { scale: .85, rotate: -4 }, { scale: 1, rotate: 0, duration: .8, ease: 'elastic.out(1,.4)' }); g.fromTo(P.img, { filter: 'hue-rotate(90deg) saturate(2)' }, { filter: 'hue-rotate(0deg) saturate(1)', duration: 1.2 }); } } }]);
  const kb = [
    { k: ['vestir', 'ropa', 'dress code', 'zapatillas', 'chanclas'], t: 'Código de vestimenta', u: 'baja', p: '—', d: '—', a: 'Arreglado informal. Zapatillas limpias sí; chanclas, chándal o camisetas de equipo, no.', on: () => {} },
    { k: ['edad', 'menor', '17', '18', 'dni'], t: 'Edad mínima', u: 'media', p: '—', d: '—', a: '<b>18 años</b>, sin excepciones. Trae DNI, pasaporte o carnet de conducir físico.', on: () => {} },
    { k: ['lista', 'gratis', 'sin pagar'], t: 'Lista de invitados', u: 'baja', p: 'gratis antes de 1:30', d: '—', a: 'Mándanos por WhatsApp nombres y cuántos sois antes de las 23:00. Entrada gratis hasta la 1:30.', on: () => { zona = 'lista'; ui.pick('Zona', zona); P.show(ZON.lista.ph); draw(); } },
    { k: ['cumple', 'cumpleanos', 'aniversario', 'despedida'], t: 'Cumpleaños', u: 'baja', p: 'tarta gratis', d: '—', a: 'Con reservado, tarta con bengalas y cava de regalo. El DJ te felicita por el micro si quieres.', on: () => { cumple = true; zona = 'reservado'; ui.pick('Zona', zona); ui.pick('¿Es un cumpleaños?', cumple ? 'si' : 'no'); draw(); } },
    { k: ['hora', 'abris', 'cerrais', 'cuando'], t: 'Horario', u: 'baja', p: '—', d: '—', a: 'Jueves de 23:30 a 5:00. Viernes y sábado de 00:00 a 6:00. La pista se llena a partir de la 1:30.', on: () => {} },
    { k: ['abrigo', 'ropero', 'guardarropa', 'chaqueta'], t: 'Ropero', u: 'baja', p: '2 €', d: '—', a: 'Ropero vigilado a la entrada por 2 €.', on: () => {} },
    { k: ['seguridad', 'mal', 'me encuentro mal', 'acoso', 'punto violeta'], t: 'Seguridad', u: 'alta', p: '—', d: 'al momento', a: 'Habla con cualquier persona de seguridad o del <b>Punto Violeta</b> junto a la barra. Si es una emergencia, 112.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Puerta de ' + (FX.BIZ.nombre || ''), avatar: '🕶️', fab: '¿Dudas para esta noche?', placeholder: 'Ej.: ¿cómo voy vestido? es mi cumple…', quick: ['¿Cómo voy vestido?', 'Lista gratis', 'Es mi cumple', 'Edad mínima', 'Horario'], label: 'Consulta', waIntro: 'Hola, os escribo por esta noche: ', cta: 'Reservar', hello: 'Hey 👋 ¿Qué noche venís y cuántos sois? Pregúntame lo que quieras.' });
  P.show(ZON.reservado.ph); P.caption(ZON.reservado.l, ZON.reservado.d); draw();
};
