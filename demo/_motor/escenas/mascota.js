/* Veterinaria · Tu mascota real en consulta: elige raza (fotos reales), constantes en vivo, cartilla y triaje por chat */
FXSTUDIO.scenes.mascota = async ({ stage, ui, FX, studio }) => {
  stage.classList.add('light');
  const g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff7a59';
  const IMG = id => 'https://images.unsplash.com/photo-' + id + '?w=1400&q=80&auto=format&fit=crop';
  // [nombre, foto, peso ideal min-max kg, pulsaciones]
  const BREEDS = {
    perro: [['Golden retriever', '1552053831-71594a27632d', 25, 34, 90], ['Labrador', '1518717758536-85ae29035b6d', 25, 36, 90], ['Border collie', '1587300003388-59208cc962cb', 14, 20, 95], ['Pastor australiano', '1601979031925-424e53b6caaa', 16, 32, 95], ['Beagle', '1543466835-00a7907e9de1', 9, 14, 100], ['Corgi', '1537151608828-ea2b11777ee8', 10, 14, 105], ['Bulldog francés', '1583511655857-d19b40a7a54e', 8, 13, 110], ['Carlino', '1517849845537-4d257902454a', 6, 9, 115], ['Mestizo', '1561037404-61cd46aa615b', 10, 25, 100]],
    gato: [['Europeo atigrado', '1574158622682-e40e69881006', 3.5, 5.5, 170], ['Atigrado gris', '1495360010541-f48722b34f7d', 3.5, 5.5, 170], ['Naranja', '1573865526739-10659fec78a5', 4, 6, 165], ['Común europeo', '1596854407944-bf87f6fdd49e', 3.5, 5.5, 170]],
    conejo: [['Conejo enano', '1585110396000-c9ffd4e4b308', 1, 2, 210], ['Belier', '1535241749838-299277b6305f', 1.5, 2.5, 200]]
  };
  const KITTEN = '1592194996308-7b43878e84a6', TEMP = { perro: 38.6, gato: 38.7, conejo: 39.1 };
  let sp = 'perro', bi = 0, name = 'Toby', age = 3, weight = 30, motive = 'revision';
  const B = () => BREEDS[sp][bi];

  // Consulta: foto real a pantalla completa + monitor de constantes
  stage.insertAdjacentHTML('beforeend', `<div class="sd-dom vt-room">
    <div class="vt-bg"></div><figure class="vt-photo"><img alt=""><div class="vt-scan"></div><span class="vt-zone" hidden><i></i><b></b></span><figcaption><b class="vt-name"></b><small class="vt-breed"></small></figcaption></figure>
    <div class="vt-mon"><header><i></i>Monitor · consulta 1</header><canvas width="300" height="70"></canvas>
      <div class="vt-vit"><div><small>Pulso</small><b class="vt-bpm">—</b><em>lpm</em></div><div><small>Temp.</small><b class="vt-tmp">—</b><em>°C</em></div><div><small>Peso</small><b class="vt-kg">—</b><em>kg</em></div></div>
      <div class="vt-bcs"><span><i></i></span><small></small></div></div>
    <div class="vt-card"></div></div>`);
  const $ = s => stage.querySelector(s), img = $('.vt-photo img'), bg = $('.vt-bg'), cv = $('.vt-mon canvas'), cx = cv.getContext('2d');
  const setPhoto = () => {
    const id = sp === 'gato' && age < 1 ? KITTEN : B()[1], url = IMG(id);
    const pre = new Image(); pre.onload = () => { img.src = url; bg.style.backgroundImage = 'url(' + url + ')'; if (g) { g.fromTo(img, { scale: 1.12, opacity: 0 }, { scale: 1.04, opacity: 1, duration: 1, ease: 'power2.out' }); g.fromTo('.vt-scan', { yPercent: -100, opacity: 1 }, { yPercent: 100, opacity: 0, duration: 1.6, ease: 'power1.inOut' }); } ui.hint(''); };
    ui.hint('Cargando foto…'); pre.src = url;
  };
  // Electrocardiograma en vivo
  let bpm = 90, t0 = performance.now(), last = 0, ys = new Array(150).fill(35);
  const beat = p => p < .04 ? -Math.sin(p / .04 * Math.PI) * 4 : p < .08 ? 0 : p < .1 ? 10 : p < .13 ? -30 : p < .16 ? 14 : p < .3 ? -Math.sin((p - .16) / .14 * Math.PI) * 6 : 0;
  const ecg = now => {
    if (!stage.isConnected) return; requestAnimationFrame(ecg); if (now - last < 33) return; last = now;
    const per = 60000 / bpm, p = ((now - t0) % per) / per * (bpm > 150 ? 1.6 : 1); ys.push(35 + beat(p % 1)); ys.shift();
    cx.clearRect(0, 0, 300, 70); cx.strokeStyle = 'rgba(46,213,115,.15)'; cx.lineWidth = 1; for (let x = 0; x < 300; x += 15) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, 70); cx.stroke(); }
    cx.strokeStyle = '#2ed573'; cx.lineWidth = 2; cx.shadowColor = '#2ed573'; cx.shadowBlur = 6; cx.beginPath(); ys.forEach((y, i) => i ? cx.lineTo(i * 2, y) : cx.moveTo(0, y)); cx.stroke(); cx.shadowBlur = 0;
  };
  requestAnimationFrame(ecg);
  setInterval(() => { if (!stage.isConnected) return; const v = bpm + Math.round((Math.random() - .5) * 6); $('.vt-bpm').textContent = v; $('.vt-mon header i').classList.toggle('on'); }, 1500);

  const fmt = n => String(Math.round(n * 10) / 10).replace('.', ',');
  const update = () => {
    const [br, , lo, hi, hr] = B(), kg = weight;
    bpm = hr + (age < 1 ? 20 : age >= 9 ? -8 : 0);
    $('.vt-name').textContent = name || 'Tu mascota'; $('.vt-breed').textContent = br + ' · ' + (age < 1 ? (sp === 'gato' ? 'gatito' : 'cachorro') : age + (age === 1 ? ' año' : ' años'));
    $('.vt-tmp').textContent = fmt(TEMP[sp] + (motive === 'urgencia' ? .9 : 0)); $('.vt-kg').textContent = fmt(kg);
    const r = (kg - lo) / (hi - lo), state = r < -.1 ? ['Bajo peso', '#3b82f6'] : r > 1.15 ? ['Sobrepeso', '#ef4444'] : r > 1 ? ['Algo por encima', '#f59e0b'] : ['Peso ideal', '#22c55e'];
    const bar = $('.vt-bcs i'); bar.style.left = Math.max(2, Math.min(98, 15 + r * 70)) + '%'; bar.style.background = state[1];
    $('.vt-bcs small').textContent = state[0] + ' · ideal ' + fmt(lo) + '–' + fmt(hi) + ' kg';
    const vac = sp === 'perro' ? (age < 1 ? ['Polivalente (6, 8 y 12 sem.)', 'Rabia (3 meses)', 'Desparasitación mensual'] : ['Polivalente anual', 'Rabia anual', 'Desparasitación trimestral'])
      : sp === 'gato' ? (age < 1 ? ['Trivalente (8 y 12 sem.)', 'Leucemia felina', 'Desparasitación'] : ['Trivalente anual', 'Rabia (si sale)', 'Desparasitación trimestral'])
      : ['Mixomatosis (semestral)', 'Hemorrágica vírica (anual)', 'Revisión dental'];
    const plan = age < 1 ? 'Plan Cachorro · 14 €/mes' : age >= 8 ? 'Plan Sénior · 25 €/mes' : 'Plan Adulto · 19 €/mes';
    const M = { revision: 'Revisión general', vacunas: 'Vacunación', urgencia: 'Urgencia', peluqueria: 'Peluquería y baño', dental: 'Limpieza dental' };
    $('.vt-card').innerHTML = '<small>CARTILLA DE SALUD</small><b>🐾 ' + FX.esc(name || 'Tu mascota') + '</b><small>Chip · 941 000 ' + String(1e5 + (name || 'x').length * 7919 % 9e5).slice(0, 6) + '</small><ul>' + vac.map(v => '<li>' + v + '</li>').join('') + '</ul><em>' + plan + '</em>';
    ui.set('Mascota', (name || '—') + ' · ' + br); ui.set('Peso', fmt(kg) + ' kg (' + state[0].toLowerCase() + ')'); ui.set('Motivo', M[motive]); ui.set('Plan recomendado', plan);
  };
  const breedChips = () => {
    ui.redo('Raza', () => ui.chips('Raza', BREEDS[sp].map((b, i) => ({ v: String(i), l: b[0] })), String(bi), v => { bi = +v; weight = Math.round((B()[2] + B()[3]) / 2 * 10) / 10; wr(); setPhoto(); update(); }));
  };
  let wInput;
  const wr = () => { const [, , lo, hi] = B(); wInput = ui.redo('Peso actual', () => ui.range('Peso actual', { min: Math.max(.5, Math.floor(lo * .5)), max: Math.ceil(hi * 1.6), step: sp === 'perro' ? .5 : .1, value: weight, unit: ' kg' }, v => { weight = +v; update(); })); };

  // Zonas del cuerpo que señala el triaje
  const zone = (label, x = 50, y = 45) => { const z = $('.vt-zone'); z.hidden = false; z.style.left = x + '%'; z.style.top = y + '%'; z.querySelector('b').textContent = label; if (g) g.fromTo(z, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' }); };
  const urg = () => { motive = 'urgencia'; update(); };
  const kb = [
    { k: ['veneno', 'chocolate', 'se ha comido', 'comio', 'trago', 'raticida', 'uvas', 'pastillas', 'intoxicado'], t: 'Posible intoxicación', u: 'alta', p: 'urgencia 60 €', d: 'ven ya', a: '<b>No le provoques el vómito</b> por tu cuenta ni le des leche. Guarda el envoltorio o una foto de lo que ha comido y anota la hora. Chocolate, uvas, xilitol, raticidas y medicamentos humanos son muy tóxicos: cuanto antes, mejor pronóstico.', on: () => { zone('Aparato digestivo', 50, 60); urg(); } },
    { k: ['atropell', 'golpe', 'caida', 'herida', 'sangra', 'mordisco', 'pelea'], t: 'Traumatismo o herida', u: 'alta', p: 'urgencia 60 €', d: 'ven ya', a: 'Mantenlo quieto y abrigado. Si sangra, presiona con una gasa limpia sin retirarla. Aunque parezca que está bien, tras un golpe puede haber lesiones internas: hacemos ecografía en el momento.', on: () => { zone('Exploración traumatológica', 50, 50); urg(); } },
    { k: ['respira', 'ahoga', 'jadea', 'lengua morada', 'asfixia', 'golpe de calor'], t: 'Dificultad para respirar', u: 'alta', p: 'urgencia 60 €', d: 'ven ya', a: 'Es una <b>urgencia</b>. Llévalo a un sitio fresco, no le fuerces a beber y ven directamente; avísanos por WhatsApp y te esperamos con oxígeno preparado.', on: () => { zone('Aparato respiratorio', 46, 42); urg(); } },
    { k: ['vomit', 'diarrea', 'devuelve', 'heces', 'caca', 'barriga', 'tripa'], t: 'Vómitos o diarrea', u: 'media', p: 'consulta 35 €', d: 'hoy mismo', a: 'Retira la comida 8–12 h (no el agua) y luego dale arroz con pollo cocido en poca cantidad. Ven <b>hoy</b> si hay sangre, si vomita más de 3 veces, si está apático o si es cachorro: se deshidratan muy rápido.', on: () => zone('Aparato digestivo', 50, 62) },
    { k: ['no come', 'no quiere comer', 'apatico', 'triste', 'decaido', 'no bebe', 'bebe mucho'], t: 'No come o está decaído', u: 'media', p: 'consulta 35 €', d: 'en 24 h', a: 'Si lleva más de 24 h sin comer (12 h en gatos y conejos) hay que verlo: en conejos puede ser un <b>íleo</b> y en gatos un problema hepático. Hacemos analítica completa con resultados en 20 minutos.', on: () => zone('Analítica general', 50, 50) },
    { k: ['cojea', 'pata', 'cojera', 'no apoya', 'le duele', 'cadera', 'artrosis'], t: 'Cojera', u: 'media', p: 'consulta + rayos X desde 70 €', d: 'en 24–48 h', a: 'Revisa entre los dedos (espigas, cortes). Reposo y paseos cortos. Si no apoya la pata o la cojera dura más de 2 días, hacemos radiografía digital en consulta.', on: () => zone('Extremidades · traumatología', 40, 78) },
    { k: ['picor', 'rasca', 'se rasca', 'pica', 'calvas', 'granos', 'piel', 'alergia', 'se lame'], t: 'Picores o problemas de piel', u: 'baja', p: 'consulta 35 €', d: 'esta semana', a: 'Lo más común son <b>pulgas</b>, alergia alimentaria o atopia. Comprueba que la desparasitación está al día. En consulta hacemos citología de piel y te damos un tratamiento que alivia en 48 h.', on: () => zone('Dermatología', 58, 55) },
    { k: ['pulga', 'garrapata', 'parasito', 'gusanos', 'lombrices', 'desparasit'], t: 'Parásitos', u: 'baja', p: 'desde 15 €', d: 'esta semana', a: 'Para quitar una garrapata, usa pinzas finas y tira recto, sin girar ni aplicar aceite. Te recomendamos la pipeta o pastilla adecuada a su peso y te avisamos por WhatsApp cuando toque la siguiente.', on: () => zone('Desparasitación', 55, 45) },
    { k: ['oido', 'oreja', 'sacude la cabeza', 'olor en la oreja'], t: 'Otitis', u: 'baja', p: 'consulta 35 €', d: 'esta semana', a: 'Si sacude la cabeza o huele mal la oreja, suele ser otitis (hongos o bacterias). <b>No le metas bastoncillos</b>. Miramos el oído con otoscopio y te damos las gotas exactas.', on: () => zone('Oídos', 38, 22) },
    { k: ['ojo', 'ojos', 'legaña', 'lagrima', 'ojo rojo', 'guiña'], t: 'Problema en los ojos', u: 'media', p: 'consulta 35 €', d: 'en 24 h', a: 'Limpia con suero fisiológico. Si guiña el ojo o lo tiene rojo, puede ser una úlcera de córnea: no uses colirios humanos y ven en 24 h; hacemos la prueba de fluoresceína al momento.', on: () => zone('Oftalmología', 44, 32) },
    { k: ['tos', 'estornud', 'mocos', 'tose'], t: 'Tos o estornudos', u: 'media', p: 'consulta 35 €', d: 'en 24–48 h', a: 'Puede ser tos de las perreras, rinitis o un cuerpo extraño (espigas). Evita el collar si tose y usa arnés. Si tiene fiebre o le cuesta respirar, ven hoy.', on: () => zone('Aparato respiratorio', 46, 42) },
    { k: ['orina', 'pis', 'sangre en la orina', 'no hace pis', 'arenero'], t: 'Problemas al orinar', u: 'alta', p: 'consulta 35 € + analítica', d: 'hoy mismo', a: 'Si es un <b>gato macho que no consigue orinar</b>, es una urgencia: puede tener una obstrucción. Si orina poco y a menudo, trae una muestra en un bote limpio.', on: () => zone('Aparato urinario', 60, 62) },
    { k: ['diente', 'boca', 'mal aliento', 'sarro', 'encias'], t: 'Boca y dientes', u: 'baja', p: 'limpieza desde 90 €', d: 'con cita', a: 'El mal aliento casi siempre es <b>sarro</b>. Hacemos limpieza con ultrasonidos bajo sedación y te enseñamos a cepillarle en casa.', on: () => { zone('Odontología', 48, 40); motive = 'dental'; ui.pick('Motivo de la visita', motive); update(); } },
    { k: ['vacuna', 'cartilla', 'chip', 'pasaporte', 'viaje'], t: 'Vacunas, chip o pasaporte', u: 'baja', p: 'desde 30 €', d: 'con cita', a: 'Te ponemos al día la cartilla, el chip y el pasaporte europeo para viajar. Te recordamos cada vacuna por WhatsApp.', on: () => { zone('Medicina preventiva', 50, 45); motive = 'vacunas'; ui.pick('Motivo de la visita', motive); update(); } },
    { k: ['esteriliz', 'castra', 'celo', 'operar'], t: 'Esterilización', u: 'baja', p: 'desde 120 €', d: 'con cita', a: 'Cirugía en el día, con anestesia inhalatoria y monitorización. Viene en ayunas por la mañana y se va a casa por la tarde con su collar isabelino.', on: () => zone('Cirugía', 55, 60) },
    { k: ['peso', 'gordo', 'delgado', 'dieta', 'pienso'], t: 'Control de peso', u: 'baja', p: 'gratis en revisión', d: 'con cita', a: 'Mira el indicador del monitor: compara su peso con el ideal de su raza. Te hacemos un plan de alimentación con la cantidad exacta de pienso al día.', on: () => zone('Nutrición', 55, 58) }
  ];

  ui.chips('Especie', [{ v: 'perro', l: 'Perro', i: '🐶' }, { v: 'gato', l: 'Gato', i: '🐱' }, { v: 'conejo', l: 'Conejo', i: '🐰' }], sp, v => { sp = v; bi = 0; weight = Math.round((B()[2] + B()[3]) / 2 * 10) / 10; breedChips(); wr(); setPhoto(); update(); });
  breedChips();
  ui.text('Nombre', name, v => { name = v; update(); }, 'Nombre de tu mascota');
  ui.range('Edad', { min: 0, max: 16, value: age, fmt: v => v < 1 ? 'Cachorro' : v + (v === 1 ? ' año' : ' años') }, v => { const was = age < 1; age = +v; if (sp === 'gato' && was !== age < 1) setPhoto(); update(); });
  wr();
  ui.chips('Motivo de la visita', [{ v: 'revision', l: 'Revisión' }, { v: 'vacunas', l: 'Vacunas' }, { v: 'dental', l: 'Dental' }, { v: 'peluqueria', l: 'Peluquería' }, { v: 'urgencia', l: 'Urgencia' }], motive, v => { motive = v; update(); });
  studio.chat(stage, ui, { FX, kb, name: 'Triaje ' + (FX.BIZ.nombre || ''), avatar: '🩺', fab: '¿Qué le pasa a tu mascota?', placeholder: 'Ej.: vomita, cojea, se ha comido chocolate…', quick: ['Vomita', 'No come', 'Cojea', 'Se rasca mucho', 'Se ha comido chocolate'], label: 'Triaje', waIntro: 'Hola, a mi mascota le pasa esto: ', cta: 'Pedir cita para esto' });
  setPhoto(); update();
};
