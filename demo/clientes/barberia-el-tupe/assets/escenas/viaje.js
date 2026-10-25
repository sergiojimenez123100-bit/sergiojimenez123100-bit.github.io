/* Agencia de viajes · Planifica tu viaje: destino (fotos reales), días, viajeros, hotel, temporada y extras → itinerario día a día y precio por persona + chat de la agente */
FXSTUDIO.scenes.viaje = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  // vuelo ida y vuelta desde Madrid (€/pers.), hotel por noche y habitación doble [3★, 4★, 5★], días recomendados y plan
  const DEST = {
    santorini: { l: 'Santorini', p: 'Grecia', f: '🌅', ph: '1613395877344-13d4a8e0d49e', v: 240, h: [85, 140, 260], d: 6, plan: ['Llegada a Fira y atardecer en Oia', 'Barco por la caldera y aguas termales', 'Playa Roja y Akrotiri', 'Cata de vinos volcánicos', 'Día libre en la playa de Kamari', 'Paseo por Pyrgos'] },
    paris: { l: 'París', p: 'Francia', f: '🗼', ph: '1502602898657-3e91760cbb34', v: 160, h: [110, 170, 320], d: 4, plan: ['Llegada y paseo por el Sena', 'Louvre y Jardín de las Tullerías', 'Montmartre y Sacré-Cœur', 'Torre Eiffel y crucero nocturno', 'Versalles', 'Le Marais y compras'] },
    roma: { l: 'Roma', p: 'Italia', f: '🏛️', ph: '1552832230-c0197dd311b5', v: 150, h: [90, 140, 260], d: 4, plan: ['Llegada y cena en el Trastevere', 'Coliseo y Foro Romano', 'Vaticano y Capilla Sixtina', 'Fontana di Trevi y Panteón', 'Villa Borghese', 'Excursión a Tívoli'] },
    kioto: { l: 'Japón', p: 'Tokio y Kioto', f: '⛩️', ph: '1545569341-9eb8b30979d9', v: 980, h: [90, 150, 300], d: 10, plan: ['Llegada a Tokio', 'Shibuya, Shinjuku y Asakusa', 'Excursión al monte Fuji', 'Tren bala a Kioto', 'Templo Kinkaku-ji y Gion', 'Fushimi Inari', 'Nara y sus ciervos', 'Osaka y su comida callejera', 'Día libre en Kioto', 'Vuelta desde Osaka'] },
    nuevayork: { l: 'Nueva York', p: 'EE. UU.', f: '🗽', ph: '1496588152823-86ff7695e68f', v: 520, h: [180, 260, 420], d: 6, plan: ['Llegada y Times Square', 'Central Park y museos', 'Puente de Brooklyn y DUMBO', 'Estatua de la Libertad y Wall Street', 'High Line y Chelsea', 'Mirador del Empire State'] },
    maldivas: { l: 'Maldivas', p: 'océano Índico', f: '🏝️', ph: '1573843981267-be1999ff37cd', v: 890, h: [180, 320, 650], d: 8, plan: ['Llegada y lancha al resort', 'Snorkel en el arrecife', 'Día de spa y playa', 'Excursión para ver delfines', 'Cena en la arena', 'Buceo con mantas', 'Día libre en la villa', 'Vuelta a Malé'] },
    islandia: { l: 'Islandia', p: 'Ring Road', f: '🌋', ph: '1500043357865-c6b8827edf10', v: 330, h: [120, 190, 320], d: 7, plan: ['Llegada a Reikiavik', 'Círculo Dorado: Gullfoss y Geysir', 'Costa sur y playa negra de Reynisfjara', 'Laguna glaciar de Jökulsárlón', 'Cascadas de Skógafoss y Seljalandsfoss', 'Auroras boreales (en temporada)', 'Laguna Azul y vuelta'] },
    kenia: { l: 'Safari en Kenia', p: 'Masái Mara', f: '🦁', ph: '1577971132997-c10be9372519', v: 780, h: [140, 230, 420], d: 8, plan: ['Llegada a Nairobi', 'Safari en el Masái Mara', 'Safari al amanecer', 'Visita a un poblado masái', 'Lago Nakuru y sus flamencos', 'Parque Amboseli con el Kilimanjaro', 'Safari en globo (opcional)', 'Vuelta desde Nairobi'] }
  };
  const TEMP = { baja: ['Temporada baja', .85], media: ['Temporada media', 1], alta: ['Temporada alta', 1.3] };
  const EXT = { seguro: ['🛡️ Seguro con cancelación', 45, 'pers'], traslados: ['🚐 Traslados aeropuerto-hotel', 30, 'pers'], excursiones: ['🧭 Excursiones guiadas', 25, 'dia'], coche: ['🚗 Coche de alquiler', 40, 'dia-grupo'] };
  let dest = 'santorini', dias = DEST.santorini.d, per = 2, est = 1, temp = 'media', ext = ['seguro', 'traslados'];
  const box = P.box(), eur = n => Math.round(n).toLocaleString('es-ES') + ' €';
  const calc = () => {
    const D = DEST[dest], noches = dias - 1, hab = Math.ceil(per / 2), k = TEMP[temp][1];
    const hotel = D.h[est] * noches * hab * k, vuelo = D.v * per * k;
    const extras = ext.reduce((a, e) => { const [, pr, t] = EXT[e]; return a + (t === 'pers' ? pr * per : t === 'dia' ? pr * per * Math.max(1, noches - 1) : pr * dias); }, 0);
    const total = vuelo + hotel + extras; return { noches, hab, hotel, vuelo, extras, total, pp: total / per };
  };
  const draw = () => {
    const D = DEST[dest], c = calc(), stars = '★'.repeat(est + 3);
    const days = Array.from({ length: dias }, (_, i) => i === dias - 1 && dias > 1 ? 'Vuelta a Madrid' : D.plan[i] || 'Día libre para explorar');
    const shown = days.slice(0, 5).map((t, i) => '<li><b>Día ' + (i + 1) + '</b> · ' + t + '</li>').join('') + (dias > 5 ? '<li>… y ' + (dias - 5) + ' días más</li>' : '');
    P.card('<small>' + D.f + ' ' + D.l.toUpperCase() + ' · ' + D.p.toUpperCase() + '</small><b>' + dias + ' días · ' + c.noches + ' noches · ' + per + (per > 1 ? ' viajeros' : ' viajero') + '</b><ul>' + shown + '</ul><em>Hotel ' + stars + ' · ' + TEMP[temp][0].toLowerCase() + ' · vuelo desde Madrid</em>');
    box.innerHTML = '<h4>Por persona</h4><div class="vt-big">' + Math.round(c.pp).toLocaleString('es-ES') + '<em> €</em></div><div class="vt-row"><span>Vuelos</span><b>' + eur(c.vuelo) + '</b></div><div class="vt-row"><span>Hotel (' + c.hab + ' hab.)</span><b>' + eur(c.hotel) + '</b></div>' + (c.extras ? '<div class="vt-row"><span>Extras</span><b>' + eur(c.extras) + '</b></div>' : '') + '<div class="vt-row"><span>Total</span><b>' + eur(c.total) + '</b></div>';
    ui.set('Destino', D.l + ' (' + D.p + ')'); ui.set('Viaje', dias + ' días · ' + per + (per > 1 ? ' viajeros' : ' viajero')); ui.set('Hotel', stars + ' · ' + TEMP[temp][0].toLowerCase());
    ui.set('Extras', ext.map(e => EXT[e][0].replace(/^\S+\s/, '')).join(', ') || 'Ninguno'); ui.set('Precio aprox.', eur(c.pp) + '/pers. · ' + eur(c.total) + ' total');
  };
  const show = () => { const D = DEST[dest]; P.show(D.ph); P.caption(D.f + ' ' + D.l, 'Recomendado: ' + D.d + ' días'); };
  const diasG = () => ui.range('Días', { min: 3, max: 15, value: dias, fmt: v => v + ' días' }, v => { dias = v; draw(); });
  ui.chips('Destino', Object.entries(DEST).map(([v, d]) => ({ v, l: d.f + ' ' + d.l })), dest, v => { dest = v; dias = DEST[v].d; show(); ui.redo('Días', diasG); draw(); if (g) g.fromTo(P.img, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: 'power2.out' }); });
  diasG();
  ui.range('Viajeros', { min: 1, max: 8, value: per, fmt: v => v + (v > 1 ? ' personas' : ' persona') }, v => { per = v; draw(); });
  ui.chips('Hotel', [{ v: 0, l: '★★★' }, { v: 1, l: '★★★★' }, { v: 2, l: '★★★★★' }], est, v => { est = +v; draw(); });
  ui.chips('Cuándo', Object.entries(TEMP).map(([v, t]) => ({ v, l: t[0] })), temp, v => { temp = v; draw(); });
  ui.chips('Extras', Object.entries(EXT).map(([v, e]) => ({ v, l: e[0] + ' · ' + e[1] + ' €' + (e[2] === 'pers' ? '/pers.' : '/día') })), ext, v => { ext = v; draw(); }, true);
  ui.buttons([{ l: '✈️ Reservar plaza', main: true, fn: () => { ui.toast('Te lo bloqueamos 48 h sin compromiso: confírmalo por WhatsApp'); if (g) g.fromTo(P.img, { y: 0 }, { y: -8, duration: .3, yoyo: true, repeat: 1, ease: 'power1.inOut' }); } }]);
  const kb = [
    { k: ['pasaporte', 'visado', 'visa', 'documentacion', 'dni', 'esta'], t: 'Documentación', u: 'media', p: '—', d: 'revisa con tiempo', a: 'Para Europa basta el DNI. Japón y Maldivas piden pasaporte con 6 meses de validez; Estados Unidos, además, la autorización ESTA; Kenia, visado electrónico. <b>Te lo gestionamos nosotros.</b>', on: () => {} },
    { k: ['seguro', 'cancelar', 'cancelacion', 'anular', 'enfermo'], t: 'Seguro y cancelación', u: 'baja', p: 'desde 45 €/pers.', d: '—', a: 'El seguro con cancelación te devuelve lo pagado si no puedes viajar por enfermedad u otras causas justificadas, y cubre gastos médicos en destino.', on: () => { if (!ext.includes('seguro')) ext = [...ext, 'seguro']; ui.pick('Extras', ext); draw(); } },
    { k: ['luna de miel', 'boda', 'recien casados', 'romantico', 'aniversario'], t: 'Luna de miel', u: 'baja', p: '—', d: 'reserva con 3–6 meses', a: 'Maldivas o Santorini con hotel 5★ son los favoritos. Avisamos al hotel para que os reciban con detalle de bienvenida.', on: () => { dest = 'maldivas'; dias = 9; per = 2; est = 2; ui.pick('Destino', dest); ui.pick('Viajeros', per); ui.pick('Hotel', est); show(); ui.redo('Días', diasG); draw(); } },
    { k: ['ninos', 'nino', 'familia', 'hijos', 'bebe'], t: 'Viajar con niños', u: 'baja', p: 'descuento infantil', d: '—', a: 'Los menores de 12 años tienen descuento en vuelo y muchas veces duermen gratis en la habitación de los padres. Roma o París funcionan genial en familia.', on: () => { dest = 'roma'; dias = 5; per = 4; ui.pick('Destino', dest); ui.pick('Viajeros', per); show(); ui.redo('Días', diasG); draw(); } },
    { k: ['plazos', 'pagar', 'financiar', 'cuotas', 'pago'], t: 'Pago a plazos', u: 'baja', p: 'sin intereses', d: '—', a: 'Reservas con el 30 % y el resto hasta 30 días antes de salir. También financiamos en 3, 6 o 12 meses sin intereses.', on: () => {} },
    { k: ['ultima hora', 'ya', 'este fin de semana', 'urgente', 'mañana'], t: 'Última hora', u: 'alta', p: '—', d: 'hoy mismo', a: 'Tenemos plazas de última hora en Roma y París con salida esta semana. <b>Escríbenos ahora</b> y te pasamos opciones hoy.', on: () => { dest = 'paris'; dias = 4; temp = 'baja'; ui.pick('Destino', dest); ui.pick('Cuándo', temp); show(); ui.redo('Días', diasG); draw(); } },
    { k: ['auroras', 'frio', 'nieve', 'aventura'], t: 'Viaje de aventura', u: 'baja', p: '—', d: 'sep–mar para auroras', a: 'Islandia de septiembre a marzo para ver auroras boreales, o safari en Kenia de julio a octubre para la gran migración.', on: () => { dest = 'islandia'; ui.pick('Destino', dest); dias = 7; show(); ui.redo('Días', diasG); draw(); } }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Agente de ' + (FX.BIZ.nombre || ''), avatar: '🧳', fab: '¿Dudas con tu viaje?', placeholder: 'Ej.: ¿necesito visado?, luna de miel…', quick: ['¿Necesito visado?', 'Seguro de cancelación', 'Luna de miel', 'Viajar con niños', 'Pago a plazos'], label: 'Consulta', waIntro: 'Hola, os escribo desde la web: ', cta: 'Hablar con una agente', hello: 'Hola 👋 Dime adónde te apetece ir y te ayudo con vuelos, hotel y papeles.' });
  show(); draw();
};
