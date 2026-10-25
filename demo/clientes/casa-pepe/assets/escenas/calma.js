/* Psicología · Un minuto de calma: paisaje real a pantalla completa, sonido ambiente en directo, respiración guiada y chat de orientación */
FXSTUDIO.scenes.calma = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui, { full: true }), g = window.gsap;
  const L = { mar: ['Mar al atardecer', '1510297895683-0f27794412d5'], bosque: ['Bosque', '1448375240586-882707db888b'], montana: ['Lago de montaña', '1448518340475-e3c680e9b4be'], lluvia: ['Lluvia en la ventana', '1501691223387-dd0500403074'] };
  let kb_ = null;
  const drift = () => { if (kb_) kb_.kill(); if (g) kb_ = g.fromTo(P.img, { scale: 1.04, xPercent: -1 }, { scale: 1.16, xPercent: 1.5, duration: 40, ease: 'none', yoyo: true, repeat: -1 }); };
  const land = v => { P.show(L[v][1]).then(drift); ui.set('Paisaje', L[v][0]); };
  // Círculo de respiración sobre la foto
  const br = document.createElement('div'); br.className = 'cm-br';
  br.style.cssText = 'position:absolute;left:50%;top:50%;width:220px;height:220px;margin:-110px 0 0 -110px;display:grid;place-items:center;pointer-events:none;opacity:0';
  br.innerHTML = '<i style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.35),rgba(255,255,255,.08));border:2px solid rgba(255,255,255,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transform:scale(.55)"></i><b style="position:relative;font:600 22px Georgia,serif;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)">Inspira</b><small style="position:absolute;bottom:-30px;color:#fff;font:13px system-ui;opacity:.85;text-shadow:0 1px 6px rgba(0,0,0,.6)"></small>';
  P.room.appendChild(br);
  const ring = br.querySelector('i'), word = br.querySelector('b'), clock = br.querySelector('small');
  const PAT = { '446': [4, 4, 6, 0, 'Relajante 4-4-6'], '478': [4, 7, 8, 0, 'Para dormir 4-7-8'], '4444': [4, 4, 4, 4, 'Cuadrada 4-4-4-4'], '55': [5, 0, 5, 0, 'Coherencia 5-5'] };
  let pat = '446', mins = 0, tl = null, endAt = 0, tick = null;
  const breathe = () => {
    if (tl) tl.kill(); clearInterval(tick); if (!g) return;
    if (!mins) { g.to(br, { opacity: 0, duration: .6 }); ui.del('Respiración'); return; }
    const [a, h, e, h2] = PAT[pat]; g.to(br, { opacity: 1, duration: .6 });
    tl = g.timeline({ repeat: -1 });
    tl.call(() => word.textContent = 'Inspira').to(ring, { scale: 1, duration: a, ease: 'sine.inOut' });
    if (h) tl.call(() => word.textContent = 'Mantén').to(ring, { scale: 1.02, duration: h });
    tl.call(() => word.textContent = 'Suelta').to(ring, { scale: .55, duration: e, ease: 'sine.inOut' });
    if (h2) tl.call(() => word.textContent = 'Pausa').to(ring, { scale: .54, duration: h2 });
    endAt = Date.now() + mins * 60000;
    tick = setInterval(() => { const s = Math.max(0, Math.round((endAt - Date.now()) / 1000)); clock.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (!s) { clearInterval(tick); tl.kill(); word.textContent = 'Muy bien 🌿'; ui.toast('Sesión completada. Gracias por dedicarte este rato.'); } }, 500);
    ui.set('Respiración', mins + ' min · ' + PAT[pat][4]);
  };
  // Sonido ambiente generado en directo (sin archivos)
  let ac = null; const bus = {};
  const audio = () => {
    if (ac) return ac; ac = new (window.AudioContext || window.webkitAudioContext)();
    const noise = brown => { const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; } const s = ac.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
    const mk = (src, f, q, type = 'bandpass') => { const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const gn = ac.createGain(); gn.gain.value = 0; src.connect(fl); fl.connect(gn); gn.connect(ac.destination); return gn; };
    bus.lluvia = mk(noise(false), 1800, .6); bus.mar = mk(noise(true), 500, .4, 'lowpass');
    bus.pajaros = ac.createGain(); bus.pajaros.gain.value = 0; bus.pajaros.connect(ac.destination);
    setInterval(() => { if (!ac || bus.pajaros.gain.value < .01) return; const o = ac.createOscillator(), e = ac.createGain(), t = ac.currentTime, f = 2400 + Math.random() * 1600; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + .08); o.frequency.exponentialRampToValueAtTime(f * .9, t + .18); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.05, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(e); e.connect(bus.pajaros); o.start(t); o.stop(t + .3); }, 900);
    return ac;
  };
  const SND = { mar: ['mar', .55], bosque: ['pajaros', 1], montana: ['pajaros', .6], lluvia: ['lluvia', .25] };
  let sound = 'off', vol = 50, cur = 'mar';
  const mix = () => {
    if (sound === 'off' && !ac) return; audio(); if (ac.state === 'suspended') ac.resume();
    const want = sound === 'off' ? null : SND[cur];
    ['lluvia', 'mar', 'pajaros'].forEach(k => bus[k].gain.setTargetAtTime(want && want[0] === k ? vol / 100 * want[1] : 0, ac.currentTime, .4));
    ui.set('Sonido', sound === 'off' ? 'Silencio' : vol + ' %');
  };
  ui.chips('Paisaje', Object.entries(L).map(([v, l]) => ({ v, l: l[0] })), cur, v => { cur = v; land(v); if (ac) mix(); });
  ui.chips('Sonido ambiente', [{ v: 'paisaje', l: '🔊 Activar' }, { v: 'off', l: '🔇 Silencio' }], 'off', v => { sound = v; mix(); });
  ui.range('Volumen', { min: 0, max: 100, value: vol, unit: ' %' }, v => { vol = v; if (ac) mix(); });
  ui.chips('Respiración', Object.entries(PAT).map(([v, p]) => ({ v, l: p[4] })), pat, v => { pat = v; breathe(); });
  ui.chips('Duración', [{ v: '0', l: 'Apagada' }, { v: '1', l: '1 min' }, { v: '3', l: '3 min' }, { v: '5', l: '5 min' }], '0', v => { mins = +v; breathe(); });
  const kb = [
    { k: ['suicid', 'quitarme la vida', 'no quiero vivir', 'hacerme dano', 'autolesion', 'matarme', 'desaparecer'], t: 'Necesitas ayuda ahora', u: 'alta', p: 'gratuito', d: '24 h', a: 'Gracias por contarlo. No estás solo/a. Llama ahora al <b>024</b> (línea de atención a la conducta suicida, gratuita, confidencial, 24 h) o al <b>112</b> si estás en peligro inmediato. Si puedes, quédate con alguien de confianza. Cuando estés a salvo, aquí estaremos para acompañarte.', on: () => { P.caption('024 · Atención 24 h', 'Gratuito y confidencial'); } },
    { k: ['ansiedad', 'ataque de panico', 'me ahogo', 'nervios', 'taquicardia', 'angustia'], t: 'Ansiedad', u: 'media', p: '1.ª sesión 40 €', d: 'esta semana', a: 'Ahora mismo: activa la respiración <b>4-4-6</b> aquí al lado; alargar la espiración calma el sistema nervioso en un par de minutos. La ansiedad responde muy bien a la terapia cognitivo-conductual: en 8–12 sesiones aprenderás a manejarla.', on: () => { pat = '446'; mins = 3; ui.pick('Respiración', pat); ui.pick('Duración', String(mins)); breathe(); } },
    { k: ['no duermo', 'insomnio', 'dormir', 'me despierto'], t: 'Problemas de sueño', u: 'baja', p: '1.ª sesión 40 €', d: 'con cita', a: 'Prueba la respiración <b>4-7-8</b> ya en la cama, deja el móvil fuera del dormitorio y levántate siempre a la misma hora. Si dura más de 3 semanas, trabajamos el insomnio con TCC-I, más eficaz a largo plazo que la medicación.', on: () => { pat = '478'; mins = 5; cur = 'lluvia'; ui.pick('Respiración', pat); ui.pick('Duración', String(mins)); ui.pick('Paisaje', cur); land('lluvia'); breathe(); } },
    { k: ['triste', 'depresion', 'sin ganas', 'vacio', 'lloro', 'apatia', 'desanimado'], t: 'Tristeza o depresión', u: 'media', p: '1.ª sesión 40 €', d: 'esta semana', a: 'Si llevas más de dos semanas sin ganas de nada, merece la pena hablarlo. Mientras tanto, pequeñas cosas ayudan: salir a la luz por la mañana, moverte 20 minutos y contárselo a alguien. Pedir ayuda es un paso valiente.', on: () => land('montana') },
    { k: ['estres', 'trabajo', 'agotado', 'burnout', 'quemado', 'jefe'], t: 'Estrés o agotamiento laboral', u: 'baja', p: '1.ª sesión 40 €', d: 'con cita', a: 'El agotamiento no se arregla solo con vacaciones. Trabajamos límites, organización y descanso real. Haz ahora 3 minutos de respiración aquí al lado: es un buen comienzo.', on: () => { mins = 3; ui.pick('Duración', String(mins)); breathe(); } },
    { k: ['pareja', 'discutimos', 'relacion', 'infidelidad', 'separacion'], t: 'Terapia de pareja', u: 'baja', p: 'sesión 60 €', d: 'con cita', a: 'Las sesiones son con los dos, en un espacio neutral. Trabajamos comunicación, conflictos y acuerdos. También puedes venir solo/a si tu pareja aún no quiere.', on: () => land('mar') },
    { k: ['duelo', 'fallecio', 'perdida', 'murio', 'echo de menos'], t: 'Duelo', u: 'baja', p: '1.ª sesión 40 €', d: 'a tu ritmo', a: 'El duelo no tiene un tiempo correcto. Si sientes que te bloquea la vida diaria pasados unos meses, podemos acompañarte a atravesarlo.', on: () => land('bosque') },
    { k: ['autoestima', 'inseguridad', 'no valgo', 'me comparo'], t: 'Autoestima', u: 'baja', p: '1.ª sesión 40 €', d: 'con cita', a: 'Trabajamos el diálogo interno y los límites. Un primer ejercicio: escribe cada noche tres cosas que hiciste bien hoy, por pequeñas que sean.', on: () => land('montana') },
    { k: ['hijo', 'adolescente', 'nino', 'colegio', 'tdah'], t: 'Infantil y adolescentes', u: 'baja', p: '1.ª sesión 40 €', d: 'con cita', a: 'Primera entrevista con los padres y después sesiones con el menor, coordinadas con el colegio si hace falta.', on: () => land('bosque') },
    { k: ['online', 'videollamada', 'precio', 'cuanto cuesta', 'primera sesion'], t: 'Cómo empezar', u: 'baja', p: '1.ª sesión 40 €', d: 'presencial u online', a: 'La primera sesión sirve para conocernos y ver si encajamos. Puede ser presencial u online por videollamada, con la misma eficacia.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: FX.BIZ.nombre || 'Consulta', avatar: '🌿', fab: '¿Cómo te sientes hoy?', placeholder: 'Ej.: tengo ansiedad, no duermo bien…', quick: ['Tengo ansiedad', 'No duermo bien', 'Me siento triste', 'Estrés en el trabajo', 'Terapia de pareja'], label: 'Motivo', waIntro: 'Hola, me gustaría pedir cita. Os cuento: ', cta: 'Reservar primera sesión', hello: 'Hola 🌿 Este es un espacio seguro. Cuéntame cómo te sientes y te oriento sobre cómo podemos ayudarte. Si estás en peligro, llama al 024 o al 112.', unknown: 'Gracias por contármelo. Cada persona es distinta: escríbenos y te respondemos con calma y en confidencialidad. Si estás en peligro, llama al 024 o al 112.' });
  land('mar'); ui.hint('Activa el sonido y respira con nosotros');
};
