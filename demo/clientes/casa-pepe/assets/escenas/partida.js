/* Juegos de mesa · Recomendador por jugadores, tiempo y estilo → podio de juegos + dado que elige por ti + reserva de mesa + chat del monitor */
FXSTUDIO.scenes.partida = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const J = [
    ['Catan', 3, 4, 75, 'estrategia familiar', '10+', 'Comercia, construye y no te fíes de nadie.'],
    ['Carcassonne', 2, 5, 40, 'familiar estrategia', '7+', 'Losetas, caminos y ciudades medievales.'],
    ['Aventureros al tren', 2, 5, 60, 'familiar', '8+', 'Une ciudades de Europa en tren.'],
    ['Dixit', 3, 8, 30, 'party familiar', '8+', 'Cartas ilustradas y mucha imaginación.'],
    ['Código Secreto', 4, 8, 20, 'party deduccion', '10+', 'Dos equipos y una pista por turno.'],
    ['Pandemic', 2, 4, 45, 'cooperativo estrategia', '8+', 'Salvad el mundo juntos (o no).'],
    ['Azul', 2, 4, 40, 'estrategia familiar', '8+', 'Azulejos portugueses y puntos.'],
    ['Wingspan', 1, 5, 70, 'estrategia', '10+', 'Atrae aves a tu reserva natural.'],
    ['7 Wonders', 3, 7, 30, 'estrategia party', '10+', 'Civilizaciones en tres eras rápidas.'],
    ['Exploding Kittens', 2, 5, 15, 'party', '7+', 'Gatitos explosivos. Así de simple.'],
    ['Jaipur', 2, 2, 30, 'dos estrategia', '10+', 'Duelo de mercaderes en la India.'],
    ['Patchwork', 2, 2, 30, 'dos familiar', '8+', 'Haz la colcha más bonita.'],
    ['The Crew', 2, 5, 20, 'cooperativo', '10+', 'Misiones espaciales en cartas.'],
    ['Cluedo', 3, 6, 45, 'deduccion familiar', '8+', '¿Quién, dónde y con qué?'],
    ['Terraforming Mars', 1, 5, 120, 'estrategia', '12+', 'Convierte Marte en un hogar.'],
    ['Just One', 3, 7, 20, 'party cooperativo', '8+', 'Una palabra cada uno. Sin repetir.'],
    ['Dobble', 2, 8, 15, 'familiar party', '6+', 'Reflejos puros: encuentra el símbolo.']
  ];
  const EST = { estrategia: ['🧠 Estrategia', '1629760946220-5693ee4c46ac'], party: ['😂 Risas', '1762068383426-2e4389df451c'], cooperativo: ['🤝 Cooperativo', '1763875067516-e947790c74ac'], familiar: ['👨‍👩‍👧 Con niños', '1659480142923-0cd01191e0e9'], deduccion: ['🕵️ Deducción', '1632501641765-e568d28b0015'], dos: ['💞 Para dos', '1547638375-ebf04735d792'] };
  const TIE = { 20: 'Menos de 30 min', 45: '30–60 min', 90: '1–2 horas', 150: 'Toda la tarde' };
  let n = 4, t = 45, est = 'party', cuando = 'Hoy', top = [];
  const DADO = '⚀⚁⚂⚃⚄⚅', box = P.box();
  const rank = () => J.map(j => { let s = 0; if (n >= j[1] && n <= j[2]) s += 5; else s -= 6; s -= Math.abs(j[3] - t) / 25; if (j[4].includes(est)) s += 4; return [s, j]; }).sort((a, b) => b[0] - a[0]).slice(0, 3).map(x => x[1]);
  const draw = () => {
    top = rank(); const pr = n * 4;
    P.card('<small>PARA ' + n + ' · ' + TIE[t].toUpperCase() + ' · ' + EST[est][0].toUpperCase() + '</small><b>🏆 ' + top[0][0] + '</b><ul>' + top.map((j, i) => '<li>' + ['🥇', '🥈', '🥉'][i] + ' <b>' + j[0] + '</b> · ' + j[1] + '–' + j[2] + ' jug. · ' + j[3] + ' min · ' + j[5] + '<br><span style="opacity:.7">' + j[6] + '</span></li>').join('') + '</ul><em>Mesa ' + cuando.toLowerCase() + ' · ' + pr + ' € (4 €/pers.) · te lo explicamos en 5 min</em>');
    ui.set('Jugadores', n); ui.set('Tiempo', TIE[t]); ui.set('Estilo', EST[est][0]); ui.set('Juego', top[0][0]); ui.set('Mesa', cuando + ' · ' + pr + ' €');
  };
  const roll = () => {
    let k = 0; const iv = setInterval(() => { box.querySelector('.vt-big').textContent = DADO[Math.floor(Math.random() * 6)]; if (++k > 10) { clearInterval(iv); const j = top[Math.floor(Math.random() * top.length)]; box.querySelector('.dz').innerHTML = 'Hoy jugáis a <b>' + j[0] + '</b>'; ui.set('Juego', j[0] + ' (lo eligió el dado)'); } }, 80);
    if (g) g.fromTo(box.querySelector('.vt-big'), { rotate: -200, scale: .6 }, { rotate: 0, scale: 1, duration: .9, ease: 'back.out(2)' });
  };
  box.innerHTML = '<h4>¿No os decidís?</h4><div class="vt-big" style="font-size:54px;color:#fff">⚄</div><div class="dz vt-row"><span>Tira el dado y elige el juego</span></div><button type="button" class="dz-b" style="margin-top:8px;width:100%;padding:8px;border-radius:10px;background:var(--accent);color:var(--btn-ink,#000);font:700 12px system-ui">🎲 Tirar dado</button>';
  box.querySelector('.dz-b').onclick = roll;
  ui.range('Jugadores', { min: 1, max: 10, value: n, fmt: v => v + (v > 1 ? ' jugadores' : ' jugador') }, v => { n = v; draw(); });
  ui.chips('Tiempo', Object.entries(TIE).map(([v, l]) => ({ v, l })), String(t), v => { t = +v; draw(); });
  ui.chips('Estilo', Object.entries(EST).map(([v, e]) => ({ v, l: e[0] })), est, v => { est = v; P.show(EST[v][1]); P.caption(EST[v][0], 'Más de 600 juegos en la ludoteca'); draw(); });
  ui.chips('¿Cuándo venís?', ['Hoy', 'Mañana', 'Este finde'].map(v => ({ v, l: v })), cuando, v => { cuando = v; draw(); });
  ui.buttons([{ l: '🎲 Guardar mesa', main: true, fn: () => { ui.toast('¡Mesa guardada con ' + top[0][0] + ' preparado!'); roll(); } }]);
  const kb = [
    { k: ['ninos', 'nino', 'hijos', 'peques', 'familia'], t: 'Con niños', u: 'baja', p: '4 €/pers.', d: '—', a: 'Para 6–8 años: <b>Dobble</b>, <b>Patchwork</b> o <b>Carcassonne</b>. Para más pequeños tenemos juegos de 4+.', on: () => { est = 'familiar'; ui.pick('Estilo', est); draw(); } },
    { k: ['dos', 'pareja', 'novio', 'novia', 'cita'], t: 'Para dos', u: 'baja', p: '8 €', d: '—', a: 'Los favoritos para dos: <b>Jaipur</b> (pique sano) y <b>Patchwork</b> (relajado). Si os gusta cooperar, <b>The Crew</b>.', on: () => { n = 2; est = 'dos'; ui.pick('Jugadores', n); ui.pick('Estilo', est); draw(); } },
    { k: ['muchos', 'grupo grande', 'somos 8', 'somos 10', 'cumpleanos', 'cumple'], t: 'Grupos grandes', u: 'baja', p: 'desde 12 €/pers. cumple', d: '—', a: 'Para 6–10: <b>Código Secreto</b>, <b>Dixit</b> o <b>Just One</b>. Para cumpleaños, merienda + monitor desde 12 €/persona.', on: () => { n = 8; est = 'party'; ui.pick('Jugadores', n); ui.pick('Estilo', est); draw(); } },
    { k: ['nunca', 'principiante', 'no sabemos', 'facil', 'primera vez'], t: 'Primera vez', u: 'baja', p: '—', d: '—', a: 'Empezad por <b>Aventureros al tren</b> o <b>Just One</b>: se explican en 5 minutos y enganchan.', on: () => { t = 45; est = 'familiar'; ui.pick('Estilo', est); ui.pick('Tiempo', t); draw(); } },
    { k: ['estrategia', 'dificil', 'pesado', 'euro', 'experto'], t: 'Algo con chicha', u: 'baja', p: '—', d: '—', a: '<b>Terraforming Mars</b> o <b>Wingspan</b> si tenéis la tarde; <b>7 Wonders</b> si queréis estrategia rápida.', on: () => { est = 'estrategia'; t = 150; ui.pick('Estilo', est); ui.pick('Tiempo', t); draw(); } },
    { k: ['precio', 'cuanto', 'cuesta', 'pagar'], t: 'Precio', u: 'baja', p: '4 €/pers.', d: 'sin límite', a: '4 € por persona sin límite de tiempo, o gratis si consumes más de 8 €.', on: () => {} },
    { k: ['torneo', 'competir', 'campeonato'], t: 'Torneos', u: 'baja', p: '5 €', d: 'sábados', a: 'Cada sábado a las 17:00, con premio para el podio. Este mes: Carcassonne.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Monitor de ' + (FX.BIZ.nombre || ''), avatar: '🎲', fab: '¿A qué jugamos?', placeholder: 'Ej.: somos dos, venimos con niños…', quick: ['Venimos con niños', 'Somos dos', 'Somos 8', 'Primera vez', 'Algo de estrategia'], label: 'Consulta', waIntro: 'Hola, os escribo para jugar: ', cta: 'Reservar mesa', hello: 'Hola 🎲 Dime cuántos sois y qué os gusta y os busco el juego perfecto.' });
  P.show(EST.party[1]); P.caption(EST.party[0], 'Más de 600 juegos en la ludoteca'); draw();
};
