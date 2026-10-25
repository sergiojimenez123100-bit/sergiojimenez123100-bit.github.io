/* Dental · Tu sonrisa real: tratamientos con fotos, antes/después del blanqueamiento por tonos y chat de urgencias */
FXSTUDIO.scenes.sonrisa = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const T = {
    blanq: { l: 'Blanqueamiento', i: '✨', ph: '1654373535457-383a0a4d00f9', p: 'desde 290 €', s: '1 sesión en clínica + férulas', d: '1 – 2 semanas', z: ['Esmalte', 50, 55] },
    invis: { l: 'Ortodoncia invisible', i: '😁', ph: '1609840114035-3c981b782dfe', p: 'desde 2.900 € · 59 €/mes', s: 'alineadores cada 2 semanas', d: '6 – 18 meses', z: ['Alineador', 50, 60] },
    implante: { l: 'Implantes', i: '🦷', ph: '1593022356769-11f762e25ed9', p: 'desde 790 € / pieza', s: '2 citas + revisión', d: '3 – 4 meses', z: ['Implante de titanio', 50, 50] },
    carillas: { l: 'Carillas', i: '💎', ph: '1675526607070-f5cbd71dde92', p: 'desde 320 € / pieza', s: '2 – 3 citas', d: '2 semanas', z: ['Carillas de porcelana', 50, 62] },
    limpieza: { l: 'Limpieza y revisión', i: '🪥', ph: '1629909613654-28e377c37b09', p: '39 € (gratis 1.ª visita)', s: '1 cita de 40 min', d: 'en el día', z: ['Gabinete', 50, 50] }
  };
  // Escala de color dental (Vita): cuanto más claro, más brillo y menos amarillo
  const SH = [{ v: 'A3', f: 'sepia(.42) saturate(1.25) brightness(.93)' }, { v: 'A2', f: 'sepia(.28) saturate(1.15) brightness(.97)' }, { v: 'A1', f: 'sepia(.14) brightness(1)' }, { v: 'B1', f: 'sepia(.05) brightness(1.03)' }, { v: 'BL2', f: 'brightness(1.06) contrast(1.03)' }, { v: 'BL1', f: 'brightness(1.1) contrast(1.05) saturate(.92)' }];
  let tr = 'blanq', from = 0, to = 4, split = 50;
  // Antes / después: la misma foto, recortada, con el tono de partida
  const ba = document.createElement('div'); ba.className = 'vt-ba'; ba.innerHTML = '<img alt=""><span class="vt-tag" style="left:14px">ANTES</span>'; P.room.querySelector('.vt-photo').appendChild(ba);
  const line = document.createElement('div'); line.className = 'vt-ba-line'; line.innerHTML = '<b>⇆ Desliza</b>'; P.room.querySelector('.vt-photo').appendChild(line);
  const after = document.createElement('span'); after.className = 'vt-tag'; after.style.right = '14px'; after.textContent = 'DESPUÉS'; P.room.querySelector('.vt-photo').appendChild(after);
  const paint = () => { ba.style.clipPath = 'inset(0 ' + (100 - split) + '% 0 0)'; line.style.left = split + '%'; };
  const fig = P.room.querySelector('.vt-photo');
  const drag = e => { const r = fig.getBoundingClientRect(); split = Math.max(3, Math.min(97, (e.clientX - r.left) / r.width * 100)); paint(); };
  fig.addEventListener('pointerdown', e => { if (tr !== 'blanq') return; drag(e); fig.setPointerCapture(e.pointerId); fig.onpointermove = drag; });
  fig.addEventListener('pointerup', () => fig.onpointermove = null);
  const card = () => {
    const t = T[tr], gain = Math.max(0, to - from);
    P.card('<small>TU TRATAMIENTO</small><b>' + t.i + ' ' + t.l + '</b><ul><li>💶 ' + t.p + '</li><li>🗓️ ' + t.s + '</li><li>⏱️ ' + t.d + '</li></ul>' + (tr === 'blanq' ? '<em>' + SH[from].v + ' → ' + SH[to].v + (gain ? ' · ' + gain + (gain > 1 ? ' tonos' : ' tono') + ' más blanco' : '') + '</em>' : '<em>Financiación sin intereses</em>'));
    ui.set('Tratamiento', t.l); ui.set('Precio orientativo', t.p);
  };
  const show = async () => {
    const t = T[tr], bl = tr === 'blanq';
    [ba, line, after].forEach(n => n.hidden = !bl);
    await P.show(t.ph, bl ? SH[to].f : '');
    ba.querySelector('img').src = P.img.src; ba.querySelector('img').style.filter = SH[from].f;
    P.zone(bl ? '' : t.z[0], t.z[1], t.z[2]); P.caption(bl ? 'Simulación de blanqueamiento' : t.l, bl ? 'Arrastra la línea para comparar' : 'Pide tu estudio gratuito');
    if (bl && g) { split = 85; g.to({ v: 85 }, { v: 50, duration: 1.4, ease: 'power2.inOut', onUpdate() { split = this.targets()[0].v; paint(); } }); }
    paint(); card();
  };
  const toneUI = () => {
    ['Tu tono actual', 'Tono que quieres'].forEach(ui.drop);
    if (tr !== 'blanq') return;
    ui.chips('Tu tono actual', SH.slice(0, 4).map((s, i) => ({ v: String(i), l: s.v })), String(from), v => { from = +v; if (to <= from) to = Math.min(5, from + 1); ba.querySelector('img').style.filter = SH[from].f; P.img.style.filter = SH[to].f; card(); });
    ui.chips('Tono que quieres', SH.slice(2).map((s, i) => ({ v: String(i + 2), l: s.v })), String(to), v => { to = Math.max(+v, from); P.img.style.filter = SH[to].f; card(); });
  };
  ui.chips('Tratamiento', Object.entries(T).map(([v, t]) => ({ v, l: t.l, i: t.i })), tr, v => { tr = v; toneUI(); show(); });
  toneUI();
  const kb = [
    { k: ['se me ha caido un diente', 'diente caido', 'se ha salido', 'golpe en la boca', 'arrancado'], t: 'Diente arrancado por un golpe', u: 'alta', p: 'urgencia 50 €', d: 'antes de 1 hora', a: 'Cógelo por la corona (nunca por la raíz), no lo frotes y mételo en <b>leche</b> o suero. Si puedes, recolócalo en su sitio y muerde una gasa. <b>Ven en menos de 1 hora</b>: así se puede salvar.', on: () => P.zone('Urgencia dental', 50, 55) },
    { k: ['flemon', 'hinchado', 'cara hinchada', 'pus', 'fiebre'], t: 'Flemón o infección', u: 'alta', p: 'urgencia 50 €', d: 'hoy mismo', a: 'Frío por fuera en tramos de 10 min, nunca calor. Si tienes fiebre o se hincha hacia el ojo o el cuello, <b>ven hoy</b>: hay que drenar y pautar antibiótico.', on: () => P.zone('Infección', 40, 50) },
    { k: ['dolor de muelas', 'me duele una muela', 'dolor', 'muela', 'me duele'], t: 'Dolor de muelas', u: 'media', p: 'consulta + radiografía 35 €', d: 'en 24 h', a: 'Suele ser una <b>caries profunda</b> que llega al nervio. Toma un analgésico que ya uses habitualmente y evita lo muy frío o caliente. Te hacemos radiografía digital y lo resolvemos en la misma cita si es posible.', on: () => P.zone('Muela · posible caries', 38, 52) },
    { k: ['roto', 'partido', 'se me ha roto', 'trozo', 'empaste'], t: 'Diente roto o empaste caído', u: 'media', p: 'desde 45 €', d: 'en 24–48 h', a: 'Guarda el trozo en leche y no mastiques por ese lado. Si duele con el aire es que el nervio está expuesto: ven cuanto antes. Lo reconstruimos con composite del mismo color.', on: () => P.zone('Reconstrucción', 50, 55) },
    { k: ['sangran', 'sangrado', 'encias', 'sangre al cepillar'], t: 'Sangrado de encías', u: 'baja', p: 'limpieza 39 €', d: 'esta semana', a: 'Casi siempre es <b>gingivitis</b> por sarro. No dejes de cepillarte: sigue haciéndolo suave. Con una limpieza profesional suele desaparecer en una o dos semanas.', on: () => P.zone('Encías', 50, 45) },
    { k: ['sensibilidad', 'frio', 'calambre', 'sensible'], t: 'Sensibilidad dental', u: 'baja', p: 'desde 30 €', d: 'esta semana', a: 'Usa pasta para dientes sensibles 2 semanas y evita cepillar fuerte. Si no mejora, sellamos la zona del cuello del diente.', on: () => P.zone('Cuello del diente', 50, 58) },
    { k: ['mal aliento', 'halitosis', 'huele la boca'], t: 'Mal aliento', u: 'baja', p: 'limpieza 39 €', d: 'con cita', a: 'En 9 de cada 10 casos viene de la boca: sarro, encías o la lengua. Limpia también la lengua y ven a una revisión.', on: () => P.zone('Lengua y encías', 50, 60) },
    { k: ['torcidos', 'ortodoncia', 'brackets', 'alineadores', 'invisible'], t: 'Dientes torcidos', u: 'baja', p: 'estudio gratis', d: 'con cita', a: 'Hacemos escáner 3D sin moldes y te enseñamos en pantalla cómo quedará tu sonrisa antes de empezar. Pruébalo arriba en «Ortodoncia invisible».', on: () => { tr = 'invis'; ui.pick('Tratamiento', tr); show(); } },
    { k: ['amarillo', 'manchas', 'blanquear', 'blanqueamiento', 'cafe', 'tabaco'], t: 'Dientes amarillos o con manchas', u: 'baja', p: 'desde 290 €', d: '1 – 2 semanas', a: 'El blanqueamiento profesional aclara de 2 a 6 tonos sin dañar el esmalte. Mueve la línea del simulador para ver el antes y después.', on: () => { tr = 'blanq'; ui.pick('Tratamiento', tr); show(); } },
    { k: ['me falta', 'hueco', 'implante', 'dentadura', 'protesis'], t: 'Me falta un diente', u: 'baja', p: 'desde 790 €', d: '3 – 4 meses', a: 'Un implante sustituye la raíz y no toca los dientes de al lado. Si falta hace tiempo, valoramos el hueso con un TAC 3D en la misma visita.', on: () => { tr = 'implante'; ui.pick('Tratamiento', tr); show(); } },
    { k: ['nino', 'hijo', 'hija', 'diente de leche', 'caries nino'], t: 'Odontopediatría', u: 'baja', p: 'revisión gratis', d: 'con cita', a: 'Primera visita al salir los primeros dientes y revisión cada 6 meses. Sellamos las muelas para prevenir caries.', on: () => P.zone('Revisión infantil', 50, 50) }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Urgencias ' + (FX.BIZ.nombre || ''), avatar: '🦷', fab: '¿Qué te pasa en la boca?', placeholder: 'Ej.: me duele una muela, me sangran las encías…', quick: ['Me duele una muela', 'Se me ha roto un diente', 'Me sangran las encías', 'Tengo la cara hinchada', 'Quiero blanquear'], label: 'Consulta', waIntro: 'Hola, os escribo por esto: ', cta: 'Pedir cita para esto' });
  await show();
};
