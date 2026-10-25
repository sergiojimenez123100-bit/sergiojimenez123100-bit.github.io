/* Fisioterapia · Dónde te duele (fotos reales de consulta), carga real del cuello con el móvil y triaje por chat */
FXSTUDIO.scenes.postura = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const Z = {
    movil: { l: 'Cuello (móvil)', ph: '1543776231-5350211df62c', z: ['Cervicales', 46, 30], s: 6, p: 'Cervicalgia postural' },
    cuello: { l: 'Cuello y hombros', ph: '1768507423533-b87b62769758', z: ['Trapecio', 50, 35], s: 5, p: 'Terapia manual + ejercicios' },
    lumbar: { l: 'Espalda baja', ph: '1769029271190-36b22f5e6771', z: ['Zona lumbar', 50, 58], s: 6, p: 'Lumbalgia: terapia manual + core' },
    hombro: { l: 'Hombro', ph: '1645005512968-0c1fe99f0093', z: ['Manguito rotador', 55, 38], s: 8, p: 'Tendinopatía de hombro' },
    rodilla: { l: 'Rodilla / pierna', ph: '1649751361457-01d3a696c7e6', z: ['Rodilla', 50, 55], s: 8, p: 'Readaptación de rodilla' },
    deporte: { l: 'Lesión deportiva', ph: '1519823551278-64ac92734fb1', z: ['Descarga muscular', 50, 50], s: 4, p: 'Descarga + vuelta al deporte' }
  };
  let zone = 'movil', deg = 45, hours = 3, pain = 5;
  // Carga sobre las cervicales según la inclinación (Hansraj, 2014)
  const LOAD = [[0, 5], [15, 12], [30, 18], [45, 22], [60, 27]];
  const load = d => { for (let i = 1; i < LOAD.length; i++) if (d <= LOAD[i][0]) { const [a, b] = [LOAD[i - 1], LOAD[i]]; return a[1] + (b[1] - a[1]) * (d - a[0]) / (b[0] - a[0]); } return 27; };
  const box = P.box();
  const draw = () => {
    const z = Z[zone], kg = load(deg), sessions = Math.max(2, Math.round(z.s * (.5 + pain / 10))), price = sessions * 40 - (sessions >= 5 ? 25 : 0);
    box.innerHTML = zone === 'movil'
      ? '<h4>Carga sobre tu cuello</h4><div class="vt-big">' + Math.round(kg) + '<em>kg</em></div><div class="vt-meter"><i style="width:' + kg / 27 * 100 + '%;background:' + (kg > 20 ? '#ef4444' : kg > 12 ? '#f59e0b' : '#22c55e') + '"></i></div><div class="vt-row"><span>Inclinación</span><b>' + deg + '°</b></div><div class="vt-row"><span>Al año, con ' + hours + ' h/día</span><b>' + Math.round(kg * hours * 365 / 1000) + ' t</b></div>'
      : '<h4>Tu valoración</h4><div class="vt-row"><span>Zona</span><b>' + z.l + '</b></div><div class="vt-row"><span>Dolor</span><b>' + pain + ' / 10</b></div><div class="vt-meter"><i style="width:' + pain * 10 + '%;background:' + (pain > 7 ? '#ef4444' : pain > 4 ? '#f59e0b' : '#22c55e') + '"></i></div>';
    P.card('<small>PLAN RECOMENDADO</small><b>' + z.p + '</b><ul><li>' + sessions + ' sesiones de 50 min</li><li>Ejercicios para casa en vídeo</li><li>Revisión a las 4 semanas</li></ul><em>' + price + ' €' + (sessions >= 5 ? ' (bono −25 €)' : '') + '</em>');
    ui.set('Zona', z.l); ui.set('Plan', sessions + ' sesiones · ' + price + ' €');
  };
  const pick = v => { zone = v; const z = Z[v]; P.show(z.ph); P.zone(z.z[0], z.z[1], z.z[2]); P.caption(z.l, z.p); ['Inclinación del cuello', 'Horas al día con el móvil'].forEach(ui.drop); if (v === 'movil') neckUI(); draw(); };
  ui.chips('¿Dónde te duele?', Object.entries(Z).map(([v, z]) => ({ v, l: z.l })), zone, pick);
  ui.range('Intensidad del dolor', { min: 1, max: 10, value: pain, fmt: v => v + ' / 10' }, v => { pain = v; draw(); });
  const neckUI = () => {
    ui.range('Inclinación del cuello', { min: 0, max: 60, step: 5, value: deg, unit: '°' }, v => { deg = v; draw(); if (g) g.to(P.img, { rotate: -v / 30, duration: .4 }); });
    ui.range('Horas al día con el móvil', { min: 1, max: 8, value: hours, unit: ' h' }, v => { hours = v; draw(); });
  };
  const kb = [
    { k: ['hormigueo', 'no siento', 'perdida de fuerza', 'orina', 'adormecida', 'dolor en el pecho'], t: 'Señales de alarma', u: 'alta', p: '—', d: 'hoy', a: 'Si hay <b>pérdida de fuerza, hormigueo que no se va, problemas para orinar o dolor en el pecho</b>, acude a urgencias o llama al 112 antes de venir a fisioterapia.', on: () => P.zone('Revisión médica', 50, 45) },
    { k: ['ciatica', 'baja por la pierna', 'nervio ciatico', 'gluteo'], t: 'Ciática', u: 'media', p: 'valoración 40 €', d: 'esta semana', a: 'El dolor que <b>baja por la pierna</b> suele venir de la lumbar. No guardes cama: camina en tramos cortos y evita estar mucho sentado. Trabajamos movilidad neural y terapia manual.', on: () => pick('lumbar') },
    { k: ['lumbago', 'lumbar', 'espalda baja', 'riñones', 'me he quedado enganchado', 'agacharme'], t: 'Lumbalgia', u: 'media', p: 'desde 40 €', d: 'en 24–48 h', a: 'Calor local 15 min y moverte dentro de lo que el dolor permita (el reposo absoluto lo alarga). En 2–3 sesiones suele mejorar mucho.', on: () => pick('lumbar') },
    { k: ['cervical', 'cuello', 'mareo', 'tortícolis', 'torticolis', 'movil', 'ordenador'], t: 'Dolor cervical', u: 'baja', p: 'desde 40 €', d: 'esta semana', a: 'Muy ligado a la <b>postura con el móvil y el ordenador</b>: mira arriba cuánto peso soporta tu cuello. Sube la pantalla a la altura de los ojos y haz pausas cada 45 min.', on: () => pick('movil') },
    { k: ['contractura', 'nudo', 'trapecio', 'tension', 'estres'], t: 'Contractura', u: 'baja', p: '40 €', d: '1 – 2 sesiones', a: 'Masaje terapéutico, punción seca si hace falta y estiramientos. Calor en casa y vigila cómo duermes (almohada a la altura del hombro).', on: () => pick('cuello') },
    { k: ['esguince', 'tobillo', 'torcedura', 'me he torcido'], t: 'Esguince', u: 'media', p: 'desde 40 €', d: 'en 48 h', a: 'Las primeras 48 h: hielo 15 min cada 2–3 h, pierna en alto y vendaje. Si no puedes apoyar el pie ni dar 4 pasos, hazte una radiografía antes.', on: () => pick('rodilla') },
    { k: ['rodilla', 'menisco', 'ligamento', 'correr', 'running'], t: 'Dolor de rodilla', u: 'media', p: 'valoración 40 €', d: 'esta semana', a: 'Valoramos si es tendón, menisco o rótula con pruebas en consulta y ecografía. Fortalecer cuádriceps y glúteo es la base de casi todas.', on: () => pick('rodilla') },
    { k: ['hombro', 'no puedo levantar el brazo', 'tendinitis', 'manguito'], t: 'Dolor de hombro', u: 'media', p: 'desde 40 €', d: 'esta semana', a: 'Si duele al levantar el brazo por encima de la cabeza suele ser el <b>manguito rotador</b>. No lo inmovilices: trabajamos ejercicio terapéutico progresivo.', on: () => pick('hombro') },
    { k: ['deporte', 'sobrecarga', 'gemelo', 'tiron', 'rotura fibrilar', 'gimnasio'], t: 'Lesión deportiva', u: 'media', p: 'desde 40 €', d: 'en 24–48 h', a: 'Un tirón con dolor punzante puede ser <b>rotura fibrilar</b>: para, hielo y compresión. Hacemos ecografía y un plan para volver a entrenar sin recaídas.', on: () => pick('deporte') },
    { k: ['mandibula', 'atm', 'bruxismo', 'aprieto los dientes'], t: 'Mandíbula (ATM)', u: 'baja', p: '40 €', d: '3 – 4 sesiones', a: 'Trabajamos la articulación y la musculatura de la mandíbula y el cuello, coordinados con tu dentista si llevas férula.', on: () => pick('cuello') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Fisio ' + (FX.BIZ.nombre || ''), avatar: '🩻', fab: '¿Dónde te duele?', placeholder: 'Ej.: me duele la espalda baja, me he torcido el tobillo…', quick: ['Me duele la espalda baja', 'Dolor de cuello', 'Me he torcido el tobillo', 'Me duele la rodilla al correr', 'Ciática'], label: 'Valoración', waIntro: 'Hola, os escribo porque: ', cta: 'Pedir valoración' });
  pick('movil');
};
