/* Tanatorio · Presupuesto orientativo y transparente (cada partida con su precio), seguro de decesos y guía de primeros pasos + chat de atención 24 h. Tono sereno. */
FXSTUDIO.scenes.despedida = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const FIJO = [['Recogida y traslado (24 h)', 250], ['Acondicionamiento', 290], ['Gestión de trámites', 390]];
  const TIPO = { inh: ['Inhumación', '1785037572750-e84fa501dc63', 520], cre: ['Incineración', '1476900164809-ff19b8ae5968', 480] };
  const SALA = { std: ['Sala velatorio (24 h)', 650], amp: ['Sala amplia (24 h)', 900], sin: ['Sin velatorio', 0] };
  const CER = { rel: ['Ceremonia religiosa', 0], civ: ['Ceremonia civil con oficiante', 250], sin: ['Sin ceremonia', 0] };
  const FER = { inh: { bas: ['Féretro sencillo', 690], med: ['Féretro de roble', 1200], eco: ['Féretro ecológico', 850] }, cre: { bas: ['Urna básica', 90], med: ['Urna cerámica', 220], eco: ['Urna biodegradable', 150] } };
  const FLO = { corona: ['Corona', 180], centro: ['Centro de flores', 90], ramo: ['Ramo', 60] };
  const EXT = { esquela: ['Esquela en prensa', 220], record: ['Recordatorios', 60], musica: ['Música en directo', 200], video: ['Vídeo homenaje', 120], libro: ['Libro de firmas', 40] };
  const PH = { std: '1785037572750-e84fa501dc63', amp: '1486102515046-44130769cb25', sin: '1567428051128-5f09a0200655' };
  let tipo = 'inh', sala = 'std', cer = 'rel', fer = 'bas', flo = ['centro'], ext = ['record'], seguro = false;
  const box = P.box(), eur = n => n.toLocaleString('es-ES') + ' €';
  const lines = () => [...FIJO, [TIPO[tipo][0] + ' · tasas municipales aprox.', TIPO[tipo][2]], SALA[sala], CER[cer], FER[tipo][fer], ...flo.map(k => FLO[k]), ...ext.map(k => EXT[k])].filter(l => l[1] || /Ceremonia religiosa/.test(l[0]));
  const draw = () => {
    const L = lines(), tot = L.reduce((a, l) => a + l[1], 0);
    P.card('<small>PRESUPUESTO ORIENTATIVO · IVA INCLUIDO</small><b>' + TIPO[tipo][0] + ' · ' + SALA[sala][0].toLowerCase() + '</b><ul>' + L.map(l => '<li>' + l[0] + ' · ' + (l[1] ? eur(l[1]) : 'sin coste') + '</li>').join('') + '</ul><em>' + (seguro ? 'Con seguro de decesos, normalmente cubierto. Nosotros hablamos con la aseguradora.' : 'Total aproximado ' + eur(tot) + '. Te damos el presupuesto cerrado por escrito.') + '</em>');
    box.innerHTML = '<h4>' + (seguro ? 'Cubierto por el seguro' : 'Total orientativo') + '</h4><div class="vt-big" style="color:#e9dcc0">' + (seguro ? '✓' : eur(tot).replace(' €', '')) + '<em>' + (seguro ? '' : ' €') + '</em></div><div class="vt-row"><span>1.º</span><b>Certificado médico</b></div><div class="vt-row"><span>2.º</span><b>Llamarnos (24 h)</b></div><div class="vt-row"><span>3.º</span><b>Nosotros hacemos el resto</b></div>';
    ui.set('Servicio', TIPO[tipo][0]); ui.set('Sala', SALA[sala][0]); ui.set('Ceremonia', CER[cer][0]); ui.set(tipo === 'inh' ? 'Féretro' : 'Urna', FER[tipo][fer][0]); ui.del(tipo === 'inh' ? 'Urna' : 'Féretro');
    ui.set('Flores', flo.map(k => FLO[k][0]).join(', ') || 'Sin flores'); ui.set('Otros', ext.map(k => EXT[k][0]).join(', ') || '—'); ui.set('Seguro de decesos', seguro ? 'Sí' : 'No'); ui.set('Total orientativo', seguro ? 'Según póliza' : eur(tot));
  };
  const show = (id, t, s) => { P.show(id, 'saturate(.85)'); P.caption(t, s); };
  ui.chips('Servicio', Object.entries(TIPO).map(([v, t]) => ({ v, l: t[0] })), tipo, v => { tipo = v; show(TIPO[v][1], TIPO[v][0], 'Os acompañamos en cada paso'); ui.redo(tipo === 'inh' ? 'Urna' : 'Féretro', () => ferGroup()); draw(); });
  ui.chips('Velatorio', Object.entries(SALA).map(([v, s]) => ({ v, l: s[0] + (s[1] ? ' · ' + eur(s[1]) : '') })), sala, v => { sala = v; show(PH[v], SALA[v][0], 'Privada, luminosa y con zona de descanso'); draw(); });
  ui.chips('Ceremonia', Object.entries(CER).map(([v, c]) => ({ v, l: c[0] + (c[1] ? ' · ' + eur(c[1]) : '') })), cer, v => { cer = v; draw(); });
  const ferGroup = () => ui.chips(tipo === 'inh' ? 'Féretro' : 'Urna', Object.entries(FER[tipo]).map(([v, f]) => ({ v, l: f[0] + ' · ' + eur(f[1]) })), fer, v => { fer = v; draw(); });
  ferGroup();
  ui.chips('Flores', Object.entries(FLO).map(([v, f]) => ({ v, l: f[0] + ' · ' + eur(f[1]) })), flo, v => { flo = v; if (v.length) show('1784121352998-b4db64622034', 'Flores', 'Coronas, centros y ramos frescos'); draw(); }, true);
  ui.chips('Otros detalles', Object.entries(EXT).map(([v, e]) => ({ v, l: e[0] + ' · ' + eur(e[1]) })), ext, v => { ext = v; draw(); }, true);
  ui.chips('¿Tenía seguro de decesos?', [{ v: 'no', l: 'No / no lo sé' }, { v: 'si', l: 'Sí' }], 'no', v => { seguro = v === 'si'; draw(); });
  ui.buttons([{ l: '🕊️ Hablar con un asesor', main: true, fn: () => ui.toast('Te llamamos en unos minutos, a cualquier hora') }]);
  const kb = [
    { k: ['casa', 'domicilio', 'ha fallecido en casa', 'murio en casa'], t: 'Si ha fallecido en casa', u: 'alta', p: '—', d: 'ahora', a: 'Lo primero, llama a su médico de cabecera o al <b>112</b> para que certifiquen el fallecimiento. Después llámanos: vamos en menos de una hora y nos ocupamos de todo lo demás. No hace falta que hagas nada más.', on: () => {} },
    { k: ['hospital', 'residencia', 'clinica'], t: 'Si ha fallecido en hospital o residencia', u: 'media', p: '—', d: 'hoy', a: 'El propio centro emite el certificado médico. Llámanos y nos coordinamos con ellos para el traslado. Puedes pedir que avisen a la funeraria que elijas.', on: () => {} },
    { k: ['seguro', 'decesos', 'aseguradora', 'poliza'], t: 'Seguro de decesos', u: 'media', p: 'según póliza', d: '—', a: 'Dinos el nombre de la aseguradora (o búscalo en sus papeles o en el banco). Nosotros hablamos con ellos; tienes derecho a elegir funeraria.', on: () => { seguro = true; ui.pick('¿Tenía seguro de decesos?', seguro ? 'si' : 'no'); draw(); } },
    { k: ['incineracion', 'cenizas', 'urna', 'esparcir'], t: 'Incineración y cenizas', u: 'baja', p: 'urna desde 90 €', d: '—', a: 'Las cenizas pueden ir a un columbario, a una sepultura o a un lugar significativo respetando la normativa local (no en la vía pública). Te asesoramos sin prisas.', on: () => { tipo = 'cre'; ui.pick('Servicio', tipo); draw(); } },
    { k: ['tramites', 'papeles', 'certificado', 'registro', 'pension', 'herencia'], t: 'Trámites', u: 'baja', p: 'incluidos', d: '—', a: 'Hacemos la inscripción en el Registro Civil y te entregamos los certificados de defunción. Te orientamos con pensión de viudedad, banco y últimas voluntades.', on: () => {} },
    { k: ['civil', 'no religiosa', 'laica', 'musica', 'palabras'], t: 'Ceremonia civil', u: 'baja', p: '250 €', d: '—', a: 'Un oficiante prepara con la familia unas palabras, lecturas y música. Puede hacerse en sala o en el cementerio.', on: () => { cer = 'civ'; ui.pick('Ceremonia', cer); draw(); } },
    { k: ['duelo', 'triste', 'no puedo', 'apoyo', 'psicologo'], t: 'Apoyo en el duelo', u: 'baja', p: 'gratuito', d: '—', a: 'Lo que sientes es normal. Tenemos grupos de apoyo al duelo gratuitos y podemos ponerte en contacto con una psicóloga. Si te sientes desbordado, el <b>024</b> atiende 24 h.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Atención 24 h · ' + (FX.BIZ.nombre || ''), avatar: '🕊️', fab: '¿Qué hacer ahora?', placeholder: 'Ej.: ha fallecido en casa, tenía seguro…', quick: ['Ha fallecido en casa', 'En el hospital', 'Tenía seguro', 'Incineración', 'Apoyo en el duelo'], label: 'Consulta', waIntro: 'Hola, necesito ayuda: ', cta: 'Llamar ahora', hello: 'Siento mucho tu pérdida. Estoy aquí para ayudarte, paso a paso. Cuéntame qué ha pasado.', unknown: 'Prefiero que lo hablemos con calma. Llámanos o escríbenos y te atendemos ahora mismo, a cualquier hora.' });
  show(PH.std, SALA.std[0], 'Privada, luminosa y con zona de descanso'); draw();
};
