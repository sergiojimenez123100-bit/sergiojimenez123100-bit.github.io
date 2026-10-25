/* Barbería · Elige servicio y estilo sobre fotos reales del sillón, reserva hueco y pregunta al barbero qué te queda */
FXSTUDIO.scenes.corte = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui);
  const SV = {
    corte: { l: 'Corte', i: '✂️', ph: '1647140655214-e4a2d914971f', p: 15, m: 30 },
    degradado: { l: 'Degradado a navaja', i: '🪒', ph: '1599351431202-1e0f0137899a', p: 18, m: 40 },
    combo: { l: 'Corte + barba', i: '🧔', ph: '1640301133543-41fe25ad6450', p: 24, m: 50 },
    barba: { l: 'Arreglo de barba', i: '🧴', ph: '1599011176306-4a96f1516d4d', p: 12, m: 25 },
    maquina: { l: 'Rapado a máquina', i: '⚡', ph: '1493256338651-d82f7acb2b38', p: 10, m: 20 }
  };
  const ST = {
    bajo: ['Low fade', 'Degradado bajo, por encima de la oreja. Discreto y vale para la oficina.', 3],
    medio: ['Mid fade', 'Degradado medio, el más pedido: limpio por los lados y volumen arriba.', 3],
    alto: ['High fade', 'Degradado alto, muy marcado. Repaso cada 2 semanas.', 2],
    crop: ['Crop texturizado', 'Flequillo corto y texturizado con puntas desfiladas. Ideal si tienes entradas.', 4],
    pompadour: ['Pompadour', 'Volumen atrás con cera mate o pomada. Para pelo de más de 8 cm.', 4],
    clasico: ['Clásico a tijera', 'Raya al lado y tijera en todo el pelo. Atemporal.', 5]
  };
  let sv = 'degradado', st = 'medio', extra = [], slot = '';
  const EX = { lavado: ['Lavado y masaje', 4], cejas: ['Cejas', 3], toalla: ['Toalla caliente', 3], color: ['Matizado de canas', 12] };
  const total = () => SV[sv].p + extra.reduce((a, k) => a + EX[k][1], 0);
  const card = () => {
    const s = SV[sv], y = ST[st], hasCut = sv !== 'barba';
    P.card('<small>TU CITA</small><b>' + s.i + ' ' + s.l + '</b>' + (hasCut ? '<small>' + y[0].toUpperCase() + '</small><p style="margin:6px 0">' + y[1] + '</p>' : '') + '<ul>' + extra.map(k => '<li>+ ' + EX[k][0] + '</li>').join('') + '<li>⏱️ ' + (s.m + extra.length * 10) + ' min' + (hasCut ? ' · repaso cada ' + y[2] + ' semanas' : '') + '</li></ul><em>' + total() + ' €' + (slot ? ' · ' + slot : '') + '</em>');
    P.caption(s.l, hasCut ? y[0] : 'Perfilado con navaja');
    ui.set('Total', total() + ' €');
  };
  const go = () => { P.show(SV[sv].ph); card(); };
  ui.chips('Servicio', Object.entries(SV).map(([v, s]) => ({ v, l: s.l + ' · ' + s.p + ' €', i: s.i })), sv, v => { sv = v; go(); });
  ui.chips('Estilo', Object.entries(ST).map(([v, s]) => ({ v, l: s[0] })), st, v => { st = v; card(); P.zone(ST[v][0], 50, 28); });
  ui.chips('Extras', Object.entries(EX).map(([v, e]) => ({ v, l: e[0] + ' +' + e[1] + ' €' })), [], v => { extra = v; card(); }, true);
  const d = new Date(), days = [0, 1, 2].map(i => { const x = new Date(d); x.setDate(d.getDate() + i); return i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : x.toLocaleDateString('es-ES', { weekday: 'long' }); });
  const hours = ['10:30', '12:00', '17:15', '18:45', '20:00'];
  ui.chips('Reserva tu hueco', days.flatMap((dd, i) => hours.filter((_, j) => (i + j) % 2 === 0 || i > 0).slice(0, 3).map(h => ({ v: dd + ' ' + h, l: dd + ' ' + h }))), '', v => { slot = v; card(); ui.toast('Hueco guardado: ' + v); });
  const kb = [
    { k: ['cara redonda', 'redonda', 'mofletes'], t: 'Cara redonda', u: 'baja', p: 'desde 18 €', d: '40 min', a: 'Te favorece <b>volumen arriba y laterales cortos</b> (mid o high fade con tupé o pompadour): alarga la cara. Evita flequillo recto y laterales anchos. Una barba corta y marcada en la mandíbula ayuda mucho.', on: () => { st = 'pompadour'; ui.pick('Estilo', st); card(); P.zone('Volumen arriba', 50, 22); } },
    { k: ['cara alargada', 'alargada', 'cara larga', 'cara fina'], t: 'Cara alargada', u: 'baja', p: 'desde 15 €', d: '30 min', a: 'Mejor <b>laterales no tan cortos</b> (low fade) y algo de flequillo para acortar visualmente. Nada de mucho volumen arriba.', on: () => { st = 'bajo'; ui.pick('Estilo', st); card(); P.zone('Laterales con algo de largo', 30, 40); } },
    { k: ['entradas', 'calvicie', 'se me cae el pelo', 'coronilla', 'poco pelo'], t: 'Entradas o poco pelo', u: 'baja', p: 'desde 15 €', d: '30 min', a: 'Un <b>crop texturizado</b> con flequillo corto disimula las entradas, o un rapado limpio si prefieres asumirlo con estilo. Pelo largo y peinado hacia atrás las marca más.', on: () => { st = 'crop'; ui.pick('Estilo', st); card(); P.zone('Flequillo texturizado', 50, 20); } },
    { k: ['rizado', 'rizos', 'afro', 'encrespado'], t: 'Pelo rizado', u: 'baja', p: 'desde 18 €', d: '40 min', a: 'Lo cortamos <b>en seco</b> para respetar el rizo, con degradado en los lados y los rizos definidos arriba. Te recomendamos crema de rizo, no cera.', on: () => { st = 'medio'; ui.pick('Estilo', st); card(); } },
    { k: ['barba irregular', 'calvas en la barba', 'barba despoblada', 'no me crece'], t: 'Barba irregular', u: 'baja', p: '12 €', d: '25 min', a: 'Llevarla <b>corta (3–5 mm) y bien perfilada</b> en mejillas y cuello disimula los huecos. Aceite de barba a diario y paciencia: tarda 6–8 semanas en rellenar.', on: () => { sv = 'barba'; ui.pick('Servicio', sv); go(); P.zone('Perfilado de mejilla', 55, 45); } },
    { k: ['granos', 'irritacion', 'cortes al afeitar', 'pelos enquistados', 'foliculitis'], t: 'Irritación al afeitar', u: 'baja', p: 'afeitado 14 €', d: '30 min', a: 'Afeitamos con <b>toalla caliente</b> y a favor del pelo, con cuchilla nueva para cada cliente. En casa: exfolia 2 veces por semana y no repases dos veces la misma zona.', on: () => { sv = 'barba'; extra = ['toalla']; ui.pick('Servicio', sv); ui.pick('Extras', extra); go(); } },
    { k: ['caspa', 'picor', 'cuero cabelludo', 'grasa'], t: 'Caspa o cuero cabelludo graso', u: 'baja', p: 'lavado 4 €', d: '10 min', a: 'Usa champú con piritiona de zinc o ketoconazol 2 veces por semana y aclara bien. Si pica mucho o hay heridas, consúltalo con un dermatólogo.', on: () => { extra = ['lavado']; ui.pick('Extras', extra); card(); } },
    { k: ['canas', 'gris', 'tinte', 'color'], t: 'Canas', u: 'baja', p: '+12 €', d: '+15 min', a: 'El <b>matizado</b> no tapa del todo: reduce las canas un 50 % y queda natural, sin raíz marcada. Dura unas 4–6 semanas.', on: () => { extra = ['color']; ui.pick('Extras', extra); card(); } },
    { k: ['nino', 'hijo', 'crio', 'peque'], t: 'Corte infantil', u: 'baja', p: '12 €', d: '25 min', a: 'Hasta 12 años, 12 €. Mejor a primera hora de la mañana o los sábados, que hay menos espera.', on: () => { sv = 'corte'; ui.pick('Servicio', sv); go(); } },
    { k: ['boda', 'evento', 'novio', 'graduacion'], t: 'Para un evento', u: 'baja', p: 'pack novio 45 €', d: '75 min', a: 'Ven <b>3–4 días antes</b> para que el corte asiente; el día del evento solo perfilamos barba y peinamos. Pack novio con toalla caliente y mascarilla.', on: () => { sv = 'combo'; extra = ['toalla', 'cejas']; ui.pick('Servicio', sv); ui.pick('Extras', extra); go(); } }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Barbero ' + (FX.BIZ.nombre || ''), avatar: '💈', fab: '¿Qué corte me queda?', placeholder: 'Ej.: tengo la cara redonda, tengo entradas…', quick: ['Tengo la cara redonda', 'Tengo entradas', 'Me irrita afeitarme', 'Pelo rizado', 'Es para una boda'], label: 'Consejo', waIntro: 'Hola, quería preguntaros: ', cta: 'Reservar con este consejo', hello: 'Hola 👋 Cuéntame cómo es tu cara o tu pelo y te digo qué corte te queda mejor.' });
  go();
};
