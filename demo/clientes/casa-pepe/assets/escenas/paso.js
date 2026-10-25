/* Escuela de baile · Elige estilo (fotos reales), nivel y días; ritmo que late al compás y horario con precio + chat de orientación */
FXSTUDIO.scenes.paso = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const E = {
    salsa: { l: 'Salsa', i: '💃', ph: '1555489401-79c274997434', bpm: 180, cnt: '1 2 3 · 5 6 7', h: ['Lun 20:00', 'Mié 20:00', 'Vie 21:00'], d: 'Pareja · social' },
    bachata: { l: 'Bachata', i: '🌹', ph: '1758810409996-583f3bad7d51', bpm: 128, cnt: '1 2 3 tap · 5 6 7 tap', h: ['Mar 20:00', 'Jue 20:00', 'Sáb 12:00'], d: 'Pareja · sensual' },
    ballet: { l: 'Ballet', i: '🩰', ph: '1495791185843-c73f2269f669', bpm: 90, cnt: '1 y 2 y 3 y', h: ['Lun 18:00', 'Mié 18:00', 'Sáb 10:00'], d: 'Técnica · postura' },
    hiphop: { l: 'Hip hop', i: '🧢', ph: '1536129808005-fae894214c73', bpm: 96, cnt: '1 e & a 2', h: ['Mar 19:00', 'Jue 19:00', 'Vie 19:00'], d: 'Urbano · coreos' },
    contemporaneo: { l: 'Contemporáneo', i: '🌊', ph: '1541904845547-0eaf866de232', bpm: 76, cnt: 'respira · suelta', h: ['Lun 19:30', 'Jue 18:30'], d: 'Expresión · suelo' },
    infantil: { l: 'Infantil (4–12)', i: '🧒', ph: '1524594152303-9fd13543fe6e', bpm: 110, cnt: '¡1, 2, 3 y salto!', h: ['Mar 17:30', 'Jue 17:30', 'Sáb 11:00'], d: 'Juego · ritmo' }
  };
  const NIV = { cero: 'Desde cero', basico: 'Básico', medio: 'Intermedio', avanzado: 'Avanzado' };
  let est = 'salsa', niv = 'cero', dias = 2, pareja = false, beat = null;
  const PRE = { 1: 39, 2: 59, 3: 75 }, price = () => Math.max(0, PRE[dias] - (pareja && /salsa|bachata/.test(est) ? 0 : 0)) * (pareja ? 1.8 : 1);
  const box = P.box();
  const pulse = () => {
    clearInterval(beat); const e = E[est]; let n = 0;
    box.innerHTML = '<h4>Siente el compás</h4><div class="vt-big">' + e.bpm + '<em>bpm</em></div><div class="pz-dots">' + Array.from({ length: 8 }, (_, i) => '<i>' + (i + 1) + '</i>').join('') + '</div><div class="vt-row"><span>Se cuenta</span><b>' + e.cnt + '</b></div>';
    const dots = box.querySelectorAll('.pz-dots i');
    beat = setInterval(() => { dots.forEach((d, i) => d.classList.toggle('on', i === n % 8)); if (g && n % 8 === 0) g.fromTo(P.img, { scale: 1.06 }, { scale: 1.03, duration: .3 }); n++; }, 60000 / e.bpm);
  };
  const draw = () => {
    const e = E[est], p = Math.round(price()), hs = e.h.slice(0, dias);
    P.card('<small>TU PLAN · ' + NIV[niv].toUpperCase() + '</small><b>' + e.i + ' ' + e.l + '</b><ul>' + hs.map(h => '<li>' + h + ' · 60 min</li>').join('') + (dias > e.h.length ? '<li>+ práctica libre el viernes</li>' : '') + '</ul><em>' + p + ' €/mes' + (pareja ? ' (pareja)' : '') + ' · 1.ª clase gratis</em>');
    ui.set('Estilo', e.l); ui.set('Nivel', NIV[niv]); ui.set('Días', dias + ' por semana · ' + hs.join(', ')); ui.set('Cuota', p + ' €/mes');
  };
  const pick = v => { est = v; const e = E[v]; P.show(e.ph); P.caption(e.l, e.d); P.zone(''); pulse(); draw(); };
  ui.chips('Estilo', Object.entries(E).map(([v, e]) => ({ v, l: e.l, i: e.i })), est, pick);
  ui.chips('Tu nivel', Object.entries(NIV).map(([v, l]) => ({ v, l })), niv, v => { niv = v; draw(); });
  ui.range('Días por semana', { min: 1, max: 3, value: dias, fmt: v => v + (v > 1 ? ' días' : ' día') }, v => { dias = v; draw(); });
  ui.chips('¿Vienes en pareja?', [{ v: 'no', l: 'Vengo solo/a' }, { v: 'si', l: 'En pareja' }], 'no', v => { pareja = v === 'si'; draw(); });
  ui.buttons([{ l: '🎟️ Reservar clase de prueba', main: true, fn: () => { ui.set('Prueba', 'Clase gratis'); ui.toast('¡Plaza guardada! Te confirmamos por WhatsApp'); if (g) g.fromTo(P.img, { rotate: -1 }, { rotate: 0, duration: .8, ease: 'elastic.out(1,.4)' }); } }]);
  const kb = [
    { k: ['no se bailar', 'nunca he bailado', 'torpe', 'sin ritmo', 'desde cero', 'principiante'], t: 'Nunca he bailado', u: 'baja', p: '1.ª clase gratis', d: 'esta semana', a: 'Perfecto: los grupos <b>«Desde cero»</b> empiezan cada mes y el 80 % llega sin saber nada. En 4 semanas bailas una canción entera. Te recomiendo <b>bachata</b> para empezar: es la más fácil de coger.', on: () => { niv = 'cero'; ui.pick('Tu nivel', niv); pick('bachata'); } },
    { k: ['pareja', 'sin pareja', 'solo', 'sola', 'no tengo pareja'], t: '¿Hace falta pareja?', u: 'baja', p: '—', d: '—', a: 'No. En salsa y bachata <b>rotamos</b> cada pocos minutos, así aprendes a bailar con cualquiera. Si venís en pareja, tenéis cuota de pareja.', on: () => pick('salsa') },
    { k: ['boda', 'baile nupcial', 'primer baile', 'novios'], t: 'Baile de boda', u: 'media', p: 'pack 5 clases 180 €', d: 'mín. 6 semanas antes', a: 'Montamos <b>vuestra coreografía con vuestra canción</b> en 5 clases privadas, más un ensayo con el vestido. Escríbenos con la fecha de la boda.', on: () => pick('bachata') },
    { k: ['niño', 'niña', 'hijo', 'hija', 'infantil', 'años', 'peque'], t: 'Clases para niños', u: 'baja', p: '39 €/mes', d: 'grupos por edad', a: 'Grupos de <b>4–6, 7–9 y 10–12 años</b>, máximo 12 peques. Trabajan ritmo, coordinación y una función de fin de curso en junio.', on: () => pick('infantil') },
    { k: ['ropa', 'que llevo', 'zapatos', 'zapatillas', 'que me pongo'], t: '¿Qué ropa llevo?', u: 'baja', p: '—', d: '—', a: 'Ropa cómoda y calzado que gire bien (nada de suela de goma que agarre). Para ballet, maillot y medias puntas; te asesoramos en la primera clase.', on: () => {} },
    { k: ['precio', 'cuanto cuesta', 'cuota', 'matricula', 'tarifa'], t: 'Precios', u: 'baja', p: 'desde 39 €/mes', d: 'sin matrícula', a: '<b>1 día: 39 € · 2 días: 59 € · 3 días: 75 €</b> al mes. Sin matrícula y sin permanencia. La primera clase es gratis.', on: () => {} },
    { k: ['rodilla', 'lesion', 'espalda', 'mayor', 'edad', 'embarazada'], t: 'Lesiones o edad', u: 'media', p: '—', d: '—', a: 'Avisa al profe antes de empezar y adaptamos los giros e impactos. Contemporáneo y bachata son muy amables con las articulaciones. Si tienes una lesión reciente, consulta antes con tu médico.', on: () => pick('contemporaneo') },
    { k: ['hip hop', 'urbano', 'coreo', 'k-pop', 'kpop', 'reggaeton', 'commercial'], t: 'Baile urbano', u: 'baja', p: 'desde 39 €/mes', d: '—', a: 'En <b>hip hop</b> aprendes una coreo nueva cada mes y grabamos vídeo al final para que lo subas. Hay grupo de K-pop los viernes.', on: () => pick('hiphop') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Profe ' + (FX.BIZ.nombre || ''), avatar: '💃', fab: '¿Qué baile es para ti?', placeholder: 'Ej.: nunca he bailado, quiero preparar mi boda…', quick: ['Nunca he bailado', 'No tengo pareja', 'Baile de boda', 'Clases para niños', 'Precios'], label: 'Consulta', waIntro: 'Hola, os escribo por las clases: ', cta: 'Reservar clase de prueba', hello: 'Hola 👋 Cuéntame qué te apetece bailar o si empiezas de cero y te digo el grupo perfecto.' });
  pick('salsa');
};
