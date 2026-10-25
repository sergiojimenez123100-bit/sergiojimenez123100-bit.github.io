/* Farmacia · Dime qué te pasa y te preparo la bolsa: necesidades (fotos reales), para quién, recogida + chat del farmacéutico con señales de alarma */
FXSTUDIO.scenes.botiquin = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const N = {
    resfriado: { l: 'Resfriado', i: '🤧', ph: '1607619056574-7b8d3ee536b2', p: [['Paracetamol 1 g (genérico)', 2.5], ['Suero fisiológico', 3.9], ['Pastillas para la garganta', 6.5]] },
    alergia: { l: 'Alergia', i: '🌼', ph: '1471864190281-a93a3070b6de', p: [['Antihistamínico (cetirizina)', 4.2], ['Colirio lubricante', 7.9]] },
    dolor: { l: 'Dolor de cabeza', i: '🤕', ph: '1631549916768-4119b2e5f926', p: [['Ibuprofeno 400 mg (genérico)', 2.9], ['Paracetamol 1 g (genérico)', 2.5]] },
    piel: { l: 'Sol y piel', i: '☀️', ph: '1757800945999-ed0fa905d0f5', p: [['Protector solar SPF 50', 15.9], ['After sun con aloe', 9.5]] },
    digestion: { l: 'Digestión', i: '🫄', ph: '1587854692152-cbe660dbde88', p: [['Sales de rehidratación', 5.5], ['Probiótico 10 días', 12.9]] },
    dormir: { l: 'Dormir mal', i: '🌙', ph: '1512069772995-ec65ed45afd6', p: [['Melatonina 1,9 mg', 9.9], ['Infusión relajante', 4.5]] },
    picaduras: { l: 'Picaduras', i: '🦟', ph: '1628771065518-0d82f1938462', p: [['Repelente de mosquitos', 8.9], ['Gel calmante', 6.9]] },
    viaje: { l: 'Botiquín de viaje', i: '🧳', ph: '1576671081837-49000212a370', p: [['Tiritas surtidas', 3.5], ['Gasas y esparadrapo', 4.9], ['Antiséptico', 4.2], ['Termómetro digital', 8.9]] }
  };
  const QUIEN = { adulto: 'Adulto', nino: 'Niño (2–12 años)', embarazo: 'Embarazada' };
  const RECO = { hoy: ['Hoy en la farmacia', 0], manana: ['Mañana a primera hora', 0], casa: ['A domicilio en el barrio', 2.5] };
  let sel = ['resfriado'], quien = 'adulto', reco = 'hoy';
  const items = () => {
    const m = new Map();
    sel.forEach(k => N[k].p.forEach(([n, pr]) => {
      if (quien === 'nino' && /Ibuprofeno 400|Paracetamol 1 g/.test(n)) { n = 'Paracetamol jarabe infantil'; pr = 3.4; }
      if (quien === 'embarazo' && /Ibuprofeno|Melatonina/.test(n)) return;
      m.set(n, pr);
    }));
    return [...m];
  };
  const box = P.box();
  const draw = () => {
    const it = items(), sub = it.reduce((a, [, p]) => a + p, 0), tot = sub + RECO[reco][1];
    P.card('<small>TU BOLSA · ' + QUIEN[quien].toUpperCase() + '</small><b>' + sel.map(k => N[k].i).join(' ') + ' ' + (sel.map(k => N[k].l).join(' + ') || 'Elige qué necesitas') + '</b><ul>' + it.map(([n, p]) => '<li>' + n + ' · ' + p.toFixed(2).replace('.', ',') + ' €</li>').join('') + '</ul>' +
      (quien === 'embarazo' ? '<em>En el embarazo, evita el ibuprofeno: te lo confirmamos en el mostrador.</em>' : '<em>Consulta siempre el prospecto. Te lo explicamos al recoger.</em>'));
    box.innerHTML = '<h4>Total aproximado</h4><div class="vt-big">' + tot.toFixed(2).replace('.', ',') + '<em> €</em></div><div class="vt-row"><span>Productos</span><b>' + it.length + '</b></div><div class="vt-row"><span>Recogida</span><b>' + RECO[reco][0] + '</b></div>';
    ui.set('Necesito', sel.map(k => N[k].l).join(', ') || '—'); ui.set('Para', QUIEN[quien]); ui.set('Productos', it.map(([n]) => n).join(', ') || '—'); ui.set('Total', tot.toFixed(2).replace('.', ',') + ' €'); ui.set('Recogida', RECO[reco][0]);
  };
  const focus = k => { if (!k) return; P.show(N[k].ph); P.caption(N[k].i + ' ' + N[k].l, N[k].p.length + ' productos recomendados'); };
  ui.chips('¿Qué necesitas?', Object.entries(N).map(([v, n]) => ({ v, l: n.i + ' ' + n.l })), sel, v => { const add = v.find(x => !sel.includes(x)); sel = v; draw(); focus(add || sel[sel.length - 1]); }, true);
  ui.chips('¿Para quién?', Object.entries(QUIEN).map(([v, l]) => ({ v, l })), quien, v => { quien = v; draw(); });
  ui.chips('Recogida', Object.entries(RECO).map(([v, r]) => ({ v, l: r[0] + (r[1] ? ' (+' + r[1].toFixed(2).replace('.', ',') + ' €)' : '') })), reco, v => { reco = v; draw(); });
  ui.buttons([{ l: '🛍️ Preparar mi bolsa', main: true, fn: () => { if (!sel.length) return ui.toast('Elige al menos una necesidad'); ui.toast('¡Hecho! Te avisamos por WhatsApp cuando esté lista'); if (g) g.fromTo(P.img, { scale: 1.1 }, { scale: 1.04, duration: .8, ease: 'back.out(2)' }); } }]);
  const kb = [
    { k: ['dolor en el pecho', 'me ahogo', 'no puedo respirar', 'desmayo', 'inconsciente', 'convulsion'], t: '⚠️ Esto es una urgencia', u: 'alta', p: '—', d: 'ahora', a: '<b>Llama al 112 ahora mismo.</b> No esperes a ver si se pasa. Si estás cerca, ven y te ayudamos mientras llega la ambulancia.', on: () => {} },
    { k: ['fiebre', 'nino', 'nina', 'bebe', 'hijo', 'hija'], t: 'Fiebre en niños', u: 'media', p: 'desde 3,40 €', d: '—', a: 'Paracetamol en <b>jarabe infantil</b> con la dosis según su peso (te la calculamos). Si tiene menos de 3 meses, fiebre de más de 3 días, manchas en la piel o está muy decaído, <b>acude al pediatra o a urgencias</b>.', on: () => { quien = 'nino'; sel = ['resfriado']; ui.pick('¿Qué necesitas?', sel); ui.pick('¿Para quién?', quien); draw(); focus('resfriado'); } },
    { k: ['tos', 'garganta', 'mocos', 'resfriado', 'gripe', 'catarro'], t: 'Resfriado o gripe', u: 'baja', p: 'desde 2,50 €', d: '5–7 días', a: 'Descanso, líquidos y paracetamol para el malestar. Lavados nasales con suero. Si la fiebre pasa de 3 días o te cuesta respirar, ve al médico.', on: () => { sel = ['resfriado']; ui.pick('¿Qué necesitas?', sel); draw(); focus('resfriado'); } },
    { k: ['alergia', 'estornudos', 'polen', 'ojos llorosos', 'picor de ojos'], t: 'Alergia', u: 'baja', p: 'desde 4,20 €', d: 'temporada', a: 'Un antihistamínico que no da sueño y colirio lubricante. Si se te cierra la garganta o se hinchan labios, es urgente: 112.', on: () => { sel = ['alergia']; ui.pick('¿Qué necesitas?', sel); draw(); focus('alergia'); } },
    { k: ['cabeza', 'migrana', 'jaqueca', 'dolor'], t: 'Dolor de cabeza', u: 'baja', p: 'desde 2,50 €', d: '—', a: 'Paracetamol o ibuprofeno, sin pasar de la dosis del prospecto. Si es el peor dolor de tu vida, súbito o con fiebre y rigidez de cuello: urgencias.', on: () => { sel = ['dolor']; ui.pick('¿Qué necesitas?', sel); draw(); focus('dolor'); } },
    { k: ['sol', 'quemadura', 'quemado', 'piel', 'manchas'], t: 'Sol y quemaduras', u: 'baja', p: 'desde 9,50 €', d: '—', a: 'After sun con aloe varias veces al día y nada de sol hasta que se cure. Si hay ampollas grandes o fiebre, que te lo vea un médico.', on: () => { sel = ['piel']; ui.pick('¿Qué necesitas?', sel); draw(); focus('piel'); } },
    { k: ['diarrea', 'vomito', 'estomago', 'gastroenteritis', 'digestion', 'gases'], t: 'Estómago revuelto', u: 'media', p: 'desde 5,50 €', d: '2–3 días', a: '<b>Sales de rehidratación</b> a sorbos y dieta suave. Si hay sangre, fiebre alta o no retienes líquidos, médico.', on: () => { sel = ['digestion']; ui.pick('¿Qué necesitas?', sel); draw(); focus('digestion'); } },
    { k: ['dormir', 'insomnio', 'no duermo', 'desvelo'], t: 'Dormir mal', u: 'baja', p: 'desde 4,50 €', d: '—', a: 'Melatonina 1,9 mg media hora antes de dormir y nada de pantallas en la cama. Si dura más de un mes, coméntalo con tu médico.', on: () => { sel = ['dormir']; ui.pick('¿Qué necesitas?', sel); draw(); focus('dormir'); } },
    { k: ['dia despues', 'pastilla del dia despues', 'anticonceptivo de emergencia'], t: 'Anticoncepción de emergencia', u: 'alta', p: 'consultar', d: 'cuanto antes', a: 'Se dispensa <b>sin receta</b> y con total discreción. Cuanto antes se toma, más eficaz. Ven directamente y pregunta en el mostrador.', on: () => {} },
    { k: ['receta', 'tarjeta sanitaria', 'electronica'], t: 'Receta electrónica', u: 'baja', p: '—', d: 'al momento', a: 'Solo necesitamos la tarjeta sanitaria. Si no tenemos el medicamento, te lo pedimos y en 2 horas está.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Farmacéutica de ' + (FX.BIZ.nombre || ''), avatar: '👩‍⚕️', fab: '¿Qué te pasa?', placeholder: 'Ej.: mi hijo tiene fiebre, tengo alergia…', quick: ['Mi hijo tiene fiebre', 'Tengo tos y mocos', 'Alergia', 'Me he quemado con el sol', 'Receta electrónica'], label: 'Consulta', waIntro: 'Hola, os consulto desde la web: ', cta: 'Encargar esto', hello: 'Hola 👋 Cuéntame qué te pasa y te digo qué puede ayudarte. Si es algo grave, te diré que vayas al médico.' });
  draw(); focus('resfriado');
};
