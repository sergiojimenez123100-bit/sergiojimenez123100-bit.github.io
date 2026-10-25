/* Autoescuela · Calculadora de carnet (permiso, prácticas, ritmo, teórico) → precio, semanas y fecha estimada + mini test DGT + chat del profe */
FXSTUDIO.scenes.carnet = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const PER = {
    B: { l: '🚗 Coche (B)', base: 290, cl: 32, pr: 22, ph: '1516862523118-a3724eb136d7', d: 'Desde 18 años' },
    A2: { l: '🏍️ Moto (A2)', base: 260, cl: 38, pr: 12, ph: '1691371107034-e28ee43a669e', d: 'Desde 18 años · pista + circulación' },
    AM: { l: '🛵 Ciclomotor (AM)', base: 160, cl: 30, pr: 6, ph: '1593153121623-3180d7e37775', d: 'Desde 15 años' },
    C: { l: '🚚 Camión (C)', base: 520, cl: 55, pr: 14, ph: '1553782097-130fef5d3e27', d: 'Necesitas el B' }
  };
  const RIT = { 1: '1 clase/semana', 2: '2 clases/semana', 3: '3 clases/semana', 5: 'Intensivo (5/semana)' };
  const TEO = { pres: ['Presencial', 5, 0], online: ['Online con profe', 4, -30], intens: ['Intensivo 15 días', 2, 60] };
  const Q = [
    ['En una vía urbana con un carril por sentido, ¿velocidad máxima?', ['30 km/h', '40 km/h', '50 km/h'], 0],
    ['Tasa máxima de alcohol en aire espirado para noveles:', ['0,10 mg/l', '0,15 mg/l', '0,25 mg/l'], 1],
    ['¿Con cuántos puntos empieza un conductor novel?', ['8 puntos', '12 puntos', '15 puntos'], 0],
    ['En una glorieta, ¿quién tiene preferencia?', ['Quien entra', 'Quien ya circula dentro', 'Quien viene por la derecha'], 1],
    ['Semáforo en ámbar intermitente significa…', ['Detenerse siempre', 'Pasar con precaución', 'Acelerar para cruzar'], 1]
  ];
  let per = 'B', pr = PER.B.pr, rit = 2, teo = 'online', qi = 0, ok = 0, done = 0;
  const box = P.box();
  const quiz = () => {
    const [q, opts] = Q[qi % Q.length];
    box.innerHTML = '<h4>Test DGT · ' + ok + '/' + done + '</h4><p style="margin:6px 0 8px;font-size:12.5px;line-height:1.35">' + q + '</p>' + opts.map((o, i) => '<button type="button" data-i="' + i + '" style="display:block;width:100%;text-align:left;margin:4px 0;padding:7px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.18);color:inherit;font:inherit">' + o + '</button>').join('');
    box.querySelectorAll('button').forEach(b => b.onclick = () => {
      const right = +b.dataset.i === Q[qi % Q.length][2]; done++; if (right) ok++;
      b.style.background = right ? '#1f9d55' : '#c0392b'; if (!right) box.querySelector('[data-i="' + Q[qi % Q.length][2] + '"]').style.background = '#1f9d55';
      ui.set('Test DGT', ok + ' de ' + done + ' bien'); setTimeout(() => { qi++; quiz(); }, 1100);
    });
  };
  const draw = () => {
    const p = PER[per], t = TEO[teo], semPr = Math.ceil(pr / rit), sem = t[1] + semPr + 4, total = p.base + t[2] + pr * p.cl;
    const f = new Date(Date.now() + sem * 7 * 864e5).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    P.card('<small>TU PLAN · ' + p.l.toUpperCase() + '</small><b>Carnet hacia el ' + f + '</b><ul><li>Teórico ' + t[0].toLowerCase() + ' · ' + t[1] + ' sem.</li><li>' + pr + ' prácticas · ' + RIT[rit] + ' · ' + semPr + ' sem.</li><li>Examen DGT · ~4 sem. de espera</li></ul><em>' + total.toLocaleString('es-ES') + ' € · o 3 plazos de ' + Math.ceil(total / 3) + ' € sin intereses</em>');
    ui.set('Permiso', p.l); ui.set('Prácticas', pr + ' clases · ' + RIT[rit]); ui.set('Teórico', t[0]); ui.set('Precio', total.toLocaleString('es-ES') + ' €'); ui.set('Carnet aprox.', f + ' (' + sem + ' semanas)');
  };
  const pick = v => { per = v; P.show(PER[v].ph); P.caption(PER[v].l, PER[v].d); draw(); };
  ui.chips('Permiso', Object.entries(PER).map(([v, p]) => ({ v, l: p.l })), per, v => { pick(v); ui.redo('Prácticas', () => ui.range('Prácticas', { min: 4, max: 40, value: (pr = PER[v].pr), fmt: n => n + ' clases' }, n => { pr = n; draw(); })); });
  ui.range('Prácticas', { min: 4, max: 40, value: pr, fmt: n => n + ' clases' }, n => { pr = n; draw(); });
  ui.chips('Ritmo', Object.entries(RIT).map(([v, l]) => ({ v, l })), String(rit), v => { rit = +v; draw(); });
  ui.chips('Teórico', Object.entries(TEO).map(([v, t]) => ({ v, l: t[0] + (t[2] ? (t[2] > 0 ? ' (+' : ' (') + t[2] + ' €)' : '') })), teo, v => { teo = v; draw(); });
  ui.buttons([{ l: '🚦 Reservar práctica de prueba', main: true, fn: () => { ui.set('Prueba', 'Primera práctica de valoración'); ui.toast('¡Hecho! Te llamamos para darte día y hora'); if (g) g.fromTo(P.img, { x: -12 }, { x: 0, duration: .8, ease: 'elastic.out(1,.4)' }); } }]);
  const kb = [
    { k: ['nervios', 'miedo', 'ansiedad', 'me bloqueo'], t: 'Nervios al volante', u: 'baja', p: '—', d: '—', a: 'Es lo más normal. Empezamos en calles tranquilas y no salimos a avenidas hasta que tú quieras. El día del examen, el profe va contigo en el coche.', on: () => {} },
    { k: ['suspendi', 'suspenso', 'he suspendido', 'otra autoescuela'], t: 'Vengo de suspender', u: 'media', p: 'tasa DGT 94,05 €', d: '~3 semanas', a: 'Hacemos una práctica de valoración, vemos qué falló y preparamos solo eso. Te pasamos el expediente de tu otra autoescuela sin papeleo.', on: () => { pr = 8; ui.pick('Prácticas', pr); draw(); } },
    { k: ['cuantas clases', 'cuantas practicas', 'cuantas necesito'], t: '¿Cuántas prácticas?', u: 'baja', p: '32 €/clase', d: '—', a: 'De media, <b>20–25 clases</b> en coche. Si ya has conducido algo, menos. Lo sabrás tras la primera práctica.', on: () => {} },
    { k: ['rapido', 'urgente', 'cuanto antes', 'intensivo', 'verano'], t: 'Lo necesito rápido', u: 'media', p: '+60 € teórico intensivo', d: '6–8 semanas', a: 'Teórico intensivo en 15 días + 5 prácticas por semana. Con buena suerte con las fechas de la DGT, carnet en unas 6–8 semanas.', on: () => { teo = 'intens'; rit = 5; ui.pick('Teórico', teo); ui.pick('Ritmo', rit); draw(); } },
    { k: ['extranjero', 'canje', 'otro pais', 'convalidar'], t: 'Carnet extranjero', u: 'baja', p: 'según país', d: '—', a: 'Algunos países tienen canje directo con España. Si no, preparamos el práctico con clases de adaptación. Escríbenos tu país.', on: () => {} },
    { k: ['automatico', 'cambio automatico'], t: 'Coche automático', u: 'baja', p: 'mismo precio', d: 'menos clases', a: 'Tenemos coche automático. Ojo: el carnet queda limitado a automáticos hasta que hagas el examen con manual.', on: () => {} },
    { k: ['moto', 'a2', 'a1', 'scooter'], t: 'Carnet de moto', u: 'baja', p: 'desde 450 €', d: '4–6 semanas', a: 'Pista propia para las maniobras y salidas a circulación. Ponemos casco y guantes las primeras clases.', on: () => pick('A2') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Profe de ' + (FX.BIZ.nombre || ''), avatar: '🚦', fab: '¿Dudas con el carnet?', placeholder: 'Ej.: me pongo muy nervioso, lo necesito rápido…', quick: ['Me pongo nervioso', 'Lo necesito rápido', 'Vengo de suspender', '¿Cuántas prácticas?', 'Carnet de moto'], label: 'Consulta', waIntro: 'Hola, os escribo por el carnet: ', cta: 'Empezar el carnet', hello: 'Hola 👋 ¿Qué carnet quieres sacar? Te digo precio, plazos y cómo vamos a ir.' });
  pick('B'); quiz();
};
