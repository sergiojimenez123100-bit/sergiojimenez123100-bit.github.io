/* Academia · Monta tu horario arrastrando asignaturas sobre un aula real y pregunta al orientador por chat */
FXSTUDIO.scenes.horario = async ({ stage, ui, FX, studio }) => {
  stage.classList.add('light');
  const g = window.gsap, acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2440ff';
  const SUB = [['Mates', '#ffe14d', '📐'], ['Física', '#7de0b6', '⚛️'], ['Química', '#ff8fb1', '🧪'], ['Inglés', '#bcd0ff', '💬'], ['Lengua', '#ffc58a', '📝'], ['Biología', '#c3f0a0', '🧬'], ['Historia', '#e4c8ff', '🏛️']];
  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], HOURS = ['16:00', '17:00', '18:00', '19:00', '20:00'];
  const box = document.createElement('div'); box.className = 'sd-dom hz'; stage.appendChild(box);
  const st = document.createElement('style'); st.textContent = `
  .sd-stage>.hz{display:grid;grid-template-rows:auto 1fr;gap:12px;padding:18px;color:#141b3a;font:14px system-ui;background-image:linear-gradient(rgba(36,64,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(36,64,255,.06) 1px,transparent 1px);background-size:24px 24px}
  .hz-pal{display:flex;flex-wrap:wrap;gap:8px}
  .hz-chip{padding:9px 13px;border-radius:12px;border:2px solid #141b3a;background:var(--c);font-weight:700;cursor:grab;touch-action:none;user-select:none;box-shadow:3px 3px 0 #141b3a;transition:transform .2s}
  .hz-chip:active{cursor:grabbing}
  .hz-grid{display:grid;grid-template-columns:56px repeat(5,1fr);grid-auto-rows:1fr;gap:6px;min-height:0}
  .hz-grid>b{display:grid;place-items:center;font-size:12px;opacity:.6}
  .hz-cell{border-radius:12px;border:2px dashed rgba(20,27,58,.15);background:rgba(255,255,255,.7);display:grid;place-items:center;transition:background .2s,border-color .2s;min-height:42px}
  .hz-cell.over{border-color:${acc};background:color-mix(in srgb,${acc} 12%,#fff)}
  .hz-blk{width:calc(100% - 6px);height:calc(100% - 6px);border-radius:10px;border:2px solid #141b3a;background:var(--c);display:grid;place-items:center;font-weight:800;font-size:13px;cursor:pointer;box-shadow:2px 2px 0 #141b3a}
  .hz-ghost{position:fixed;z-index:9999;pointer-events:none;transform:rotate(-4deg) scale(1.08)}`;
  stage.appendChild(st); box.style.paddingBottom = '70px';
  const PH = { eso: '1756032433560-56547efed550', bach: '1761546571631-a4d61b55cd2f', pau: '1758270704524-596810e891b5' };
  const room = v => { const u = studio.img(PH[v], 1600), im = new Image(); im.onload = () => { box.style.backgroundImage = 'linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.86)),url(' + u + ')'; box.style.backgroundSize = 'cover'; box.style.backgroundPosition = 'center'; if (g) g.fromTo(box, { opacity: .6 }, { opacity: 1, duration: .6 }); }; im.src = u; };
  box.innerHTML = '<div class="hz-pal">' + SUB.map((s, i) => '<div class="hz-chip" data-i="' + i + '" style="--c:' + s[1] + '">' + s[2] + ' ' + s[0] + '</div>').join('') + '</div><div class="hz-grid"><b></b>' + DAYS.map(d => '<b>' + d + '</b>').join('') + HOURS.map((h, r) => '<b>' + h + '</b>' + DAYS.map((_, c) => '<div class="hz-cell" data-k="' + r + '-' + c + '"></div>').join('')).join('') + '</div>';
  const plan = {};
  const render = () => {
    box.querySelectorAll('.hz-cell').forEach(c => { const i = plan[c.dataset.k]; c.innerHTML = i == null ? '' : '<div class="hz-blk" style="--c:' + SUB[i][1] + '" title="Quitar">' + SUB[i][2] + ' ' + SUB[i][0] + '</div>'; });
    const used = [...new Set(Object.values(plan))], hrs = Object.keys(plan).length;
    const price = used.length ? (used.length === 1 ? 69 : used.length === 2 ? 119 : 119 + (used.length - 2) * 50) : 0;
    ui.set('Asignaturas', used.map(i => SUB[i][0]).join(', ') || '—'); ui.set('Horas a la semana', hrs + ' h'); ui.set('Cuota orientativa', price ? price + ' €/mes' : '—');
    ui.set('Horario', Object.entries(plan).sort().map(([k, i]) => { const [r, c] = k.split('-'); return DAYS[c] + ' ' + HOURS[r] + ' ' + SUB[i][0]; }).join(' · ') || '—');
  };
  const put = (k, i) => { plan[k] = i; render(); const blk = box.querySelector('[data-k="' + k + '"] .hz-blk'); if (g && blk) g.from(blk, { scale: .3, rotation: -12, duration: .5, ease: 'back.out(2.4)' }); };
  // Arrastrar con puntero (ratón y táctil)
  let drag = null;
  box.addEventListener('pointerdown', e => {
    const c = e.target.closest('.hz-chip'); if (!c) return; e.preventDefault();
    const gh = c.cloneNode(true); gh.classList.add('hz-ghost'); document.body.appendChild(gh); drag = { i: +c.dataset.i, gh };
    const move = ev => { gh.style.left = ev.clientX - 30 + 'px'; gh.style.top = ev.clientY - 18 + 'px'; box.querySelectorAll('.hz-cell').forEach(x => x.classList.remove('over')); const el = document.elementFromPoint(ev.clientX, ev.clientY), cell = el && el.closest('.hz-cell'); if (cell) cell.classList.add('over'); drag.cell = cell; };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); gh.remove(); box.querySelectorAll('.hz-cell').forEach(x => x.classList.remove('over')); if (drag.cell) put(drag.cell.dataset.k, drag.i); drag = null; };
    move(e); addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  box.addEventListener('click', e => { const b = e.target.closest('.hz-blk'); if (b) { delete plan[b.closest('.hz-cell').dataset.k]; render(); } });
  const PRESET = { eso: [['0-0', 0], ['0-2', 0], ['1-1', 3], ['1-3', 3], ['2-4', 4]], bach: [['0-0', 0], ['0-2', 0], ['1-1', 1], ['1-3', 1], ['2-0', 2], ['2-2', 2]], pau: [['0-0', 0], ['0-1', 1], ['0-2', 0], ['0-3', 2], ['1-0', 5], ['1-2', 3], ['1-4', 4], ['2-1', 6]] };
  ui.chips('Curso', [{ v: 'eso', l: 'ESO' }, { v: 'bach', l: 'Bachillerato' }, { v: 'pau', l: 'PAU' }], 'eso', v => room(v));
  ui.buttons([{ l: '✨ Horario recomendado', main: true, fn: () => { Object.keys(plan).forEach(k => delete plan[k]); render(); const cur = stage.closest('.fx-studio').querySelector('.sd-ch button.on'); const p = PRESET[cur ? cur.dataset.v : 'eso']; p.forEach(([k, i], n) => setTimeout(() => put(k, i), n * 160)); } }, { l: 'Borrar todo', fn: () => { Object.keys(plan).forEach(k => delete plan[k]); render(); } }]);
  const tools = stage.querySelector('.sd-tools'); if (tools) { tools.style.top = 'auto'; tools.style.bottom = '14px'; tools.style.right = 'auto'; tools.style.left = '14px'; }
  ui.hint('Arrastra las asignaturas a la semana · clic en un bloque para quitarlo');
  const preset = v => { const b = [...stage.closest('.fx-studio').querySelectorAll('.sd-ch button')].find(x => x.dataset.v === v); if (b) b.click(); stage.closest('.fx-studio').querySelector('.sd-act .main').click(); };
  const kb = [
    { k: ['suspendo mates', 'matematicas', 'mates', 'no entiendo las mates', 'ecuaciones'], t: 'Matemáticas atascadas', u: 'media', p: '69 €/mes · 2 h/semana', d: 'empieza esta semana', a: 'Las mates se atascan por una base que falla, no por falta de capacidad. Hacemos una <b>prueba de nivel gratis</b> para ver dónde se rompió la cadena y lo reforzamos con 2 h semanales en grupos de máximo 6.', on: () => { const c = box.querySelector('[data-k="0-0"]'); if (c) c.scrollIntoView({ block: 'nearest' }); } },
    { k: ['selectividad', 'pau', 'evau', 'ebau', 'nota de corte', 'carrera'], t: 'Preparar la PAU', u: 'media', p: 'desde 169 €/mes', d: 'de enero a junio', a: 'Plan intensivo con simulacros cada mes con exámenes reales de la Comunidad de Madrid y corrección como en el tribunal. Te monto el horario recomendado aquí al lado.', on: () => preset('pau') },
    { k: ['bachillerato', 'fisica', 'quimica', 'bachiller'], t: 'Bachillerato de ciencias', u: 'baja', p: '119 €/mes', d: '4 h/semana', a: 'Física y Química con problemas tipo examen y un profesor por asignatura. Te propongo un horario aquí al lado.', on: () => preset('bach') },
    { k: ['eso', 'deberes', 'organizarse', 'tecnicas de estudio', 'no estudia', 'no se concentra'], t: 'ESO y hábitos de estudio', u: 'baja', p: '69 €/mes', d: 'tardes de 16 a 18 h', a: 'Además del refuerzo, enseñamos a <b>planificar la semana</b>, hacer esquemas y preparar exámenes. Las familias reciben un informe mensual.', on: () => preset('eso') },
    { k: ['ingles', 'b1', 'b2', 'c1', 'cambridge', 'first', 'idiomas'], t: 'Inglés y certificados', u: 'baja', p: '79 €/mes', d: '2 h/semana', a: 'Grupos por nivel para B1, B2 (First) y C1 (Advanced) con simulacros oficiales de Cambridge. Prueba de nivel gratuita en 20 minutos.', on: () => {} },
    { k: ['tdah', 'dislexia', 'necesidades', 'le cuesta leer', 'atencion'], t: 'Necesidades específicas', u: 'baja', p: 'clase individual 25 €/h', d: 'con cita', a: 'Clases individuales o grupos muy reducidos, con materiales adaptados y coordinación con el orientador del colegio.', on: () => {} },
    { k: ['examen manana', 'examen', 'recuperacion', 'septiembre', 'urgente'], t: 'Examen muy cercano', u: 'alta', p: 'clase suelta 25 €/h', d: 'hoy o mañana', a: 'Hacemos clases sueltas de repaso con los exámenes del profesor si los tienes. Escríbenos por WhatsApp con la asignatura y el temario y te buscamos hueco hoy.', on: () => {} },
    { k: ['precio', 'cuanto cuesta', 'matricula', 'prueba gratis', 'clase de prueba'], t: 'Precios y clase de prueba', u: 'baja', p: 'sin matrícula', d: 'primera clase gratis', a: 'Sin matrícula y la <b>primera clase es gratis</b>. 1 asignatura 69 €/mes, 2 asignaturas 119 €/mes y cada una más +50 €. Monta tu horario aquí al lado y verás la cuota.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Orientación ' + (FX.BIZ.nombre || ''), avatar: '🎓', fab: '¿En qué necesitas ayuda?', placeholder: 'Ej.: suspendo mates, quiero preparar la PAU…', quick: ['Suspendo mates', 'Preparar la PAU', 'Inglés B2', 'No se concentra', 'Examen mañana'], label: 'Necesidad', waIntro: 'Hola, os escribo por esto: ', cta: 'Reservar clase de prueba', hello: 'Hola 👋 Cuéntame curso y asignatura y te digo cómo lo trabajaríamos, horario y cuota.' });
  room('eso');
  render();
};
