/* Estética · Bono regalo con fotos reales de cada tratamiento, tarjeta que se envuelve y asesora de piel por chat */
FXSTUDIO.scenes.bono = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c9a27e';
  const TR = {
    facial: ['Higiene facial profunda', '1570172619644-dfd03ed5d881', 45, 60],
    masaje: ['Masaje relajante', '1519824145371-296894a0daa9', 50, 50],
    piedras: ['Masaje con piedras calientes', '1696841212541-449ca29397cc', 65, 75],
    mani: ['Manicura semipermanente', '1632345031435-8727f6897d53', 22, 45],
    pestanas: ['Lifting de pestañas', '1589710751893-f9a6770ad71b', 39, 50],
    mascarilla: ['Ritual con mascarilla', '1643684391140-c5056cfd3436', 35, 40]
  };
  let sel = ['facial', 'masaje'], para = 'Lucía', de = '', dedic = 'Para que te cuides tanto como cuidas de los demás', style = 'crema', wrapped = false;
  const STY = { crema: ['#f6efe6', '#3b2f2a'], negro: ['#151515', '#f3e6d0'], marca: [acc, '#111'] };
  const total = () => sel.reduce((a, k) => a + TR[k][2], 0), pack = () => sel.length >= 3 ? .15 : sel.length === 2 ? .1 : 0;
  const code = () => 'REGALO-' + (para || 'X').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X') + '-' + String(total() * 37 % 9000 + 1000);
  const gift = document.createElement('div'); gift.className = 'bn-card'; P.room.appendChild(gift);
  const draw = () => {
    const [bg, ink] = STY[style], t = total(), d = Math.round(t * (1 - pack()));
    gift.style.cssText = 'position:absolute;right:3%;bottom:76px;width:min(360px,62%);z-index:4;aspect-ratio:1.6;border-radius:18px;padding:16px 18px;box-shadow:0 30px 60px rgba(0,0,0,.35);background:' + bg + ';color:' + ink + ';font:13px/1.35 system-ui;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden';
    gift.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font:700 11px system-ui;letter-spacing:.18em">TARJETA REGALO</b><span style="font-size:11px;opacity:.7">' + FX.esc(FX.BIZ.nombre || '') + '</span></div>' +
      '<div style="display:flex;gap:6px">' + sel.map(k => '<img src="' + studio.img(TR[k][1], 160) + '" style="width:44px;height:44px;border-radius:10px;object-fit:cover">').join('') + '</div>' +
      '<div><div style="font:600 18px Georgia,serif">Para ' + FX.esc(para || '…') + '</div><div style="opacity:.75;font-style:italic">“' + FX.esc(dedic) + '”' + (de ? ' — ' + FX.esc(de) : '') + '</div></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:end"><code style="font-size:11px;opacity:.7">' + code() + '</code><b style="font:800 22px system-ui">' + d + ' €' + (pack() ? ' <s style="font-size:12px;opacity:.5">' + t + ' €</s>' : '') + '</b></div>' +
      (wrapped ? '<div class="bn-rib" style="position:absolute;inset:0;pointer-events:none"><i style="position:absolute;left:84%;top:0;bottom:0;width:16px;background:' + (style === 'marca' ? '#111' : acc) + ';opacity:.92"></i><i style="position:absolute;top:20%;left:0;right:0;height:16px;background:' + (style === 'marca' ? '#111' : acc) + ';opacity:.92"></i><span style="position:absolute;left:84%;top:20%;transform:translate(-40%,-45%);font-size:40px">🎀</span></div>' : '');
    ui.set('Tratamientos', sel.map(k => TR[k][0]).join(' + ') || '—'); ui.set('Precio', d + ' €' + (pack() ? ' (−' + pack() * 100 + ' % pack)' : '')); ui.set('Tiempo total', sel.reduce((a, k) => a + TR[k][3], 0) + ' min');
  };
  const focus = k => { if (!k) return; P.show(TR[k][1]); P.caption(TR[k][0], TR[k][2] + ' € · ' + TR[k][3] + ' min'); };
  ui.chips('Tratamientos', Object.entries(TR).map(([v, t]) => ({ v, l: t[0] + ' · ' + t[2] + ' €' })), sel, (v, b) => { const added = v.find(x => !sel.includes(x)); sel = v; wrapped = false; draw(); focus(added || sel[sel.length - 1]); if (g) g.fromTo(gift, { y: -8 }, { y: 0, duration: .4, ease: 'back.out(3)' }); }, true);
  ui.text('Para', para, v => { para = v; wrapped = false; draw(); }, 'Nombre de quien lo recibe');
  ui.text('De parte de', de, v => { de = v; draw(); }, 'Tu nombre');
  ui.chips('Dedicatoria', [{ v: 'Para que te cuides tanto como cuidas de los demás', l: 'Cuídate' }, { v: '¡Feliz cumpleaños! Hoy toca mimarte', l: 'Cumpleaños' }, { v: 'Gracias por todo, mamá', l: 'Día de la Madre' }, { v: 'Un plan para nosotros dos', l: 'Pareja' }], dedic, v => { dedic = v; draw(); });
  ui.chips('Tarjeta', [{ v: 'crema', l: 'Crema' }, { v: 'negro', l: 'Negro y oro' }, { v: 'marca', l: 'Color del centro' }], style, v => { style = v; draw(); });
  ui.buttons([{ l: '🎁 Envolver regalo', main: true, fn: () => { if (!sel.length) return ui.toast('Elige al menos un tratamiento'); wrapped = true; draw(); if (g) g.fromTo(gift, { rotateY: -90, scale: .8 }, { rotateY: 0, scale: 1, duration: .9, ease: 'back.out(1.6)' }); ui.toast('¡Listo para regalar! Válido 12 meses'); } }]);
  const kb = [
    { k: ['acne', 'granos', 'espinillas', 'puntos negros', 'poros'], t: 'Acné o poros abiertos', u: 'baja', p: 'higiene facial 45 €', d: '60 min', a: 'Empezamos con una <b>higiene facial profunda</b> con extracción y peeling suave; después, una sesión al mes. En casa: limpiador con ácido salicílico y nunca dormir maquillada. Si es acné inflamado con dolor, consúltalo con tu dermatólogo.', on: () => focus('facial') },
    { k: ['manchas', 'melasma', 'sol', 'paño'], t: 'Manchas en la piel', u: 'baja', p: 'peeling desde 60 €', d: '3 – 4 sesiones', a: 'Las manchas por sol mejoran con <b>peelings despigmentantes</b> en otoño-invierno. Imprescindible protector solar 50 todo el año, también en invierno.', on: () => focus('facial') },
    { k: ['arrugas', 'flacidez', 'antiedad', 'lineas de expresion', 'cuello'], t: 'Arrugas y flacidez', u: 'baja', p: 'desde 55 €', d: 'bono de 5', a: 'Radiofrecuencia facial y mascarillas con vitamina C. Notarás la piel más firme a partir de la tercera sesión.', on: () => focus('mascarilla') },
    { k: ['ojeras', 'bolsas', 'ojos cansados'], t: 'Ojeras y bolsas', u: 'baja', p: '35 €', d: '40 min', a: 'Drenaje linfático manual y mascarilla descongestiva. En casa: frío por la mañana y dormir con la cabeza un poco más alta.', on: () => focus('mascarilla') },
    { k: ['estres', 'contractura', 'espalda', 'cansada', 'relajar', 'dormir'], t: 'Estrés y tensión', u: 'baja', p: 'desde 50 €', d: '50 – 75 min', a: 'El <b>masaje con piedras calientes</b> es el más relajante: el calor suelta la musculatura en profundidad. Si hay dolor concreto o lesión, mejor un fisioterapeuta.', on: () => focus('piedras') },
    { k: ['unas', 'se me rompen', 'manicura', 'unas debiles', 'semipermanente'], t: 'Uñas débiles', u: 'baja', p: '22 €', d: '45 min', a: 'Retiramos el semipermanente sin limar la uña natural y aplicamos base fortalecedora. Dura 2–3 semanas sin levantarse.', on: () => focus('mani') },
    { k: ['pestanas', 'cejas', 'mirada'], t: 'Pestañas y cejas', u: 'baja', p: '39 €', d: '50 min', a: 'El <b>lifting de pestañas</b> las riza desde la raíz sin extensiones y dura 6–8 semanas. Podemos añadir tinte y diseño de cejas.', on: () => focus('pestanas') },
    { k: ['regalo', 'regalar', 'cumpleanos', 'madre', 'pareja', 'amiga'], t: 'Quiero regalar algo', u: 'baja', p: 'desde 22 €', d: 'válido 12 meses', a: 'El más regalado: <b>facial + masaje</b> (−10 %). Con 3 tratamientos, −15 %. Personaliza la tarjeta aquí al lado y pulsa «Envolver regalo».', on: () => { sel = ['facial', 'masaje']; ui.pick('Tratamientos', sel); draw(); focus('masaje'); } },
    { k: ['embarazada', 'embarazo', 'lactancia'], t: 'Embarazo', u: 'baja', p: '—', d: '—', a: 'Tenemos masaje prenatal a partir del segundo trimestre y tratamientos faciales sin ácidos. Avísanos al reservar para adaptarlo.', on: () => focus('masaje') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Asesora ' + (FX.BIZ.nombre || ''), avatar: '🌸', fab: '¿Qué necesita tu piel?', placeholder: 'Ej.: tengo manchas, quiero regalar algo…', quick: ['Tengo manchas', 'Acné y poros', 'Mucho estrés', 'Quiero regalar algo', 'Arrugas'], label: 'Consulta', waIntro: 'Hola, quería consultaros: ', cta: 'Reservar esto', hello: 'Hola 🌸 Cuéntame qué te preocupa de tu piel o a quién quieres regalar y te recomiendo el tratamiento.' });
  draw(); focus('facial');
};
