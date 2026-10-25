/* Tienda de tecnología y drones · Elige equipo (fotos reales), uso y peso: qué necesitas para volar legal en España, presupuesto con extras y técnico por chat */
FXSTUDIO.scenes.dron = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const D = {
    mini: { l: 'Dron mini (<250 g)', i: '🛸', ph: '1770260071751-0711b6f26ff4', g: 249, p: 459, t: 34, z: ['Cámara 4K', 50, 55] },
    camara: { l: 'Dron con cámara pro', i: '📷', ph: '1507582020474-9a35b7d455d9', g: 895, p: 1399, t: 43, z: ['Gimbal 3 ejes', 50, 60] },
    fpv: { l: 'Dron FPV', i: '🥽', ph: '1577533870320-2c31e7e41028', g: 410, p: 999, t: 20, z: ['Cámara FPV', 50, 50] },
    accion: { l: 'Cámara de acción', i: '🎥', ph: '1506731249430-5c2146c9db5f', g: 154, p: 399, t: 0, z: ['Estabilizador', 50, 50] },
    audio: { l: 'Auriculares y gadgets', i: '🎧', ph: '1505740420928-5e560c06d30e', g: 0, p: 249, t: 0, z: ['Cancelación de ruido', 50, 50] }
  };
  const EX = { bat: ['Batería extra', 79], nd: ['Filtros ND', 49], funda: ['Mochila de transporte', 39], seguro: ['Seguro RC 1 año', 49], curso: ['Curso A1/A3 + práctica', 89], care: ['Garantía ampliada 2 años', 119] };
  const USO = { ocio: 'Ocio / viajes', video: 'Foto y vídeo', pro: 'Trabajo profesional' };
  let it = 'mini', uso = 'ocio', ex = ['bat'];
  const isDrone = () => D[it].t > 0;
  const rules = () => {
    const d = D[it]; if (!isDrone()) return [['Sin papeleo', 'No necesita registro ni licencia', 1]];
    const R = [['Registro de operador en AESA', 'Obligatorio si lleva cámara · online y gratis', 1]];
    if (d.g >= 250) R.push(['Examen A1/A3 de AESA', 'Online y gratis · te preparamos aquí', ex.includes('curso')]);
    else R.push(['Sin examen obligatorio', 'Categoría C0, menos de 250 g', 1]);
    R.push(['Seguro de responsabilidad civil', 'Muy recomendable (obligatorio en uso profesional)', ex.includes('seguro')]);
    if (it === 'fpv') R.push(['Observador a tu lado', 'Con gafas FPV necesitas un observador', 1]);
    if (uso === 'pro') R.push(['Categoría específica / STS', 'Para trabajos fuera de la categoría abierta', 0]);
    R.push(['Consultar la zona antes de volar', 'App ENAIRE Drones: gran parte de Madrid es zona restringida', 1]);
    return R;
  };
  const box = P.box();
  const draw = () => {
    const d = D[it], tot = d.p + ex.reduce((a, k) => a + EX[k][1], 0), R = rules(), ok = R.filter(r => r[2]).length;
    P.card('<small>' + (isDrone() ? 'PARA VOLAR LEGAL EN ESPAÑA' : 'LISTO PARA USAR') + '</small><ul style="list-style:none;padding:0;margin:6px 0">' + R.map(r => '<li>' + (r[2] ? '✅' : '⬜') + ' <b style="font-size:13px">' + r[0] + '</b><br><span style="opacity:.7;font-size:12px">' + r[1] + '</span></li>').join('') + '</ul><em>Orientativo · normativa UE 2019/947</em>');
    box.innerHTML = '<h4>Tu equipo</h4><div class="vt-big">' + tot + '<em>€</em></div><div class="vt-row"><span>Peso</span><b>' + (d.g ? d.g + ' g' : '—') + '</b></div>' + (d.t ? '<div class="vt-row"><span>Vuelo por batería</span><b>' + d.t + ' min' + (ex.includes('bat') ? ' ×2' : '') + '</b></div>' : '') + '<div class="vt-meter"><i style="width:' + ok / R.length * 100 + '%"></i></div><small style="opacity:.7">' + ok + ' de ' + R.length + ' requisitos cubiertos</small>';
    ui.set('Equipo', d.l); ui.set('Uso', USO[uso]); ui.set('Extras', ex.map(k => EX[k][0]).join(', ') || '—'); ui.set('Total', tot + ' €');
  };
  const pick = v => { it = v; const d = D[v]; P.show(d.ph); P.zone(d.z[0], d.z[1], d.z[2]); P.caption(d.l, 'desde ' + d.p + ' €'); draw(); };
  ui.chips('¿Qué buscas?', Object.entries(D).map(([v, d]) => ({ v, l: d.l, i: d.i })), it, pick);
  ui.chips('Para qué lo quieres', Object.entries(USO).map(([v, l]) => ({ v, l })), uso, v => { uso = v; draw(); });
  ui.chips('Extras', Object.entries(EX).map(([v, x]) => ({ v, l: x[0] + ' · ' + x[1] + ' €' })), ex, v => { ex = v; draw(); }, true);
  ui.buttons([{ l: '🧪 Probarlo en tienda', main: true, fn: () => { ui.set('Cita', 'Demo en tienda'); ui.toast('Te lo dejamos montado y cargado para probarlo'); if (g) g.fromTo(P.img, { y: 10 }, { y: 0, duration: .8, ease: 'elastic.out(1,.4)' }); } }, { l: 'Financiar', fn: () => { const t = D[it].p + ex.reduce((a, k) => a + EX[k][1], 0); ui.set('Financiación', '12 meses · ' + Math.ceil(t / 12) + ' €/mes'); ui.toast('12 meses sin intereses · ' + Math.ceil(t / 12) + ' €/mes'); } }]);
  const kb = [
    { k: ['licencia', 'carnet', 'examen', 'a1', 'a3', 'necesito', 'papeles'], t: '¿Necesito licencia?', u: 'baja', p: 'curso 89 €', d: '1 tarde', a: 'Por debajo de <b>250 g</b> no hace falta examen, solo registrarte como operador en AESA si lleva cámara. Por encima, el examen <b>A1/A3</b> es online y gratis; nosotros te preparamos y practicas con un instructor.', on: () => { pick('camara'); } },
    { k: ['donde puedo volar', 'volar en madrid', 'zona', 'prohibido', 'parque', 'playa', 'ciudad'], t: '¿Dónde puedo volar?', u: 'media', p: '—', d: '—', a: 'Gran parte de Madrid está cerca de aeropuertos y helipuertos, así que es <b>zona restringida</b>. Consulta siempre la app <b>ENAIRE Drones</b> antes de despegar. Nunca sobre gente, a más de 120 m ni de noche sin luces. Te enseñamos zonas cercanas donde se puede.', on: () => P.zone('Consulta ENAIRE Drones', 50, 45) },
    { k: ['seguro', 'responsabilidad civil', 'si se cae', 'accidente'], t: 'Seguro', u: 'baja', p: '49 €/año', d: '—', a: 'Un seguro de <b>responsabilidad civil</b> cubre daños a terceros si el dron cae. Es obligatorio para uso profesional y muy recomendable siempre. Te lo dejamos activado al comprar.', on: () => { if (!ex.includes('seguro')) ex.push('seguro'); ui.pick('Extras', ex); draw(); } },
    { k: ['primer dron', 'empezar', 'principiante', 'regalo', 'nino', 'barato'], t: 'Mi primer dron', u: 'baja', p: 'desde 459 €', d: '—', a: 'Para empezar, un <b>mini de menos de 250 g</b>: graba en 4K, se pliega en el bolsillo y no necesitas examen. Te lo dejamos configurado y te damos una clase de vuelo.', on: () => pick('mini') },
    { k: ['fpv', 'gafas', 'carreras', 'acrobacias', 'freestyle'], t: 'Drones FPV', u: 'baja', p: 'desde 999 €', d: '—', a: 'El FPV se vuela con gafas, en primera persona. Empieza en el <b>simulador</b> (te lo instalamos) y necesitas a un observador a tu lado. Necesita examen A1/A3 si pesa más de 250 g.', on: () => pick('fpv') },
    { k: ['roto', 'reparar', 'reparacion', 'se ha caido', 'helice', 'no enciende', 'gimbal'], t: 'Reparación', u: 'media', p: 'diagnóstico gratis', d: '48–72 h', a: 'Diagnóstico <b>gratis</b> en tienda. Hélices y brazos en el día; gimbal y placa en 48–72 h con piezas originales. Si tienes garantía o seguro, lo tramitamos nosotros.', on: () => P.zone('Taller de reparación', 50, 50) },
    { k: ['trabajo', 'profesional', 'inspeccion', 'boda', 'inmobiliaria', 'fotografia aerea'], t: 'Uso profesional', u: 'media', p: 'a medida', d: '—', a: 'Para trabajar (inmobiliarias, bodas, inspecciones) necesitas operar en categoría abierta o específica según el vuelo, seguro obligatorio y, a veces, permisos de zona. Te asesoramos con el papeleo.', on: () => { uso = 'pro'; ui.pick('Para qué lo quieres', uso); pick('camara'); } },
    { k: ['financiar', 'plazos', 'pagar a plazos', 'cuotas'], t: 'Financiación', u: 'baja', p: '12 meses sin intereses', d: '—', a: 'Financiamos en <b>12 meses sin intereses</b> a partir de 300 € con tu DNI y una tarjeta. Te decimos la cuota exacta aquí al lado con el botón «Financiar».', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Técnico ' + (FX.BIZ.nombre || ''), avatar: '🛸', fab: '¿Puedo volar esto?', placeholder: 'Ej.: ¿necesito licencia?, ¿dónde puedo volar?…', quick: ['¿Necesito licencia?', '¿Dónde puedo volar?', 'Mi primer dron', 'Se me ha roto', 'Financiación'], label: 'Consulta', waIntro: 'Hola, os consulto por este equipo: ', cta: 'Reservar demo en tienda', hello: 'Hola 👋 Dime qué quieres grabar o volar y te digo qué equipo te conviene y qué papeles necesitas.' });
  pick('mini');
};
