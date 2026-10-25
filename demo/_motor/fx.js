/* =========================================================
   FX · motor de animaciones compartido (inspirado en VeridIA)
   Requiere GSAP + ScrollTrigger (+ Lenis opcional).
   Cada página define window.PAGE = { init, opening, hero }.
   Todo se activa con atributos data-* (ver LEEME.md).
   ========================================================= */
(() => {
  window.FX_BOOT = true;
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);
  /* Configuración personalizada: la que viene horneada por el robot (#edits) + la guardada en este navegador */
  const CFG_KEY = 'fxcfg:' + location.pathname;
  const CFG = (() => {
    let base = {}, local = {};
    try { base = JSON.parse(document.getElementById('edits').textContent); } catch (e) {}
    try { local = JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) {}
    const m = Object.assign({}, base, local);
    ['biz', 'tema', 'textos', 'imagenes'].forEach(k => m[k] = Object.assign({}, base[k], local[k]));
    m.ocultos = local.ocultos || base.ocultos || [];
    return m;
  })();
  const EDIT = qs.get('editar') === '1';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('motion') === '0' || CFG.tema.anim === 'sin' || EDIT;
  const SOFT = CFG.tema.anim === 'suave';
  const FINE = matchMedia('(pointer: fine)').matches;
  const MOBILE = innerWidth < 760;
  if (RM) root.classList.add('rm');
  if (FINE) root.classList.add('fine');
  if (!window.gsap) { root.classList.add('fx-fail'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const PAGE = window.PAGE || {};
  const accent = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#ffffff';
  const PTR = { x: -9999, y: -9999, px: -9999, py: -9999 };
  addEventListener('pointermove', e => { PTR.x = e.clientX; PTR.y = e.clientY; PTR.px = e.pageX; PTR.py = e.pageY; }, { passive: true });

  /* ---------- 1. Datos del negocio (los rellena el robot) ---------- */
  const BIZ = (() => { try { return JSON.parse($('#biz').textContent); } catch (e) { return {}; } })();
  Object.assign(BIZ, CFG.biz);
  window.BIZ = BIZ;

  /* ---------- 0. Contenido editable: se calcula ANTES de tocar el DOM para que las claves sean estables ---------- */
  const TXT_SEL = 'main h1, main h2, main h3, main h4, main p, main li, main blockquote, main q, main figcaption, main .btn, main .chip, header .btn, footer .foot-word';
  const BAD = '[data-biz], [id], .fx-story, .fx-reviews, label, script, svg, img, canvas, input, select, textarea, [data-open-status], [data-count], [data-horario], iframe';
  const ED = {
    texts: $$(TXT_SEL).filter(el => !el.matches(BAD) && !el.closest('.fx-story, .fx-reviews, form, [data-marquee], .op-word, #opening') && !el.querySelector(BAD + ', ' + TXT_SEL)),
    imgs: $$('main img, header img').filter(el => !el.closest('.fx-story, .fx-reviews, #opening')),
    blocks: $$('main > section, main > div')
  };
  const ALLOWED = { EM: 1, B: 1, STRONG: 1, I: 1, BR: 1, SPAN: 1, MARK: 1 };
  function clean(html) {
    const t = document.createElement('template'); t.innerHTML = html;
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 1) { if (!ALLOWED[c.tagName]) { c.replaceWith(...c.childNodes); return walk(n); } [...c.attributes].forEach(a => { if (a.name !== 'class') c.removeAttribute(a.name); }); walk(c); }
      else if (c.nodeType !== 3) c.remove();
    });
    walk(t.content); return t.innerHTML;
  }
  function applyConfig() {
    Object.entries(CFG.textos).forEach(([i, h]) => { const el = ED.texts[+i]; if (el) el.innerHTML = clean(h); });
    Object.entries(CFG.imagenes).forEach(([i, src]) => { const el = ED.imgs[+i]; if (el && /^(data:image\/|assets\/|https:)/.test(src)) { el.src = src; el.removeAttribute('srcset'); } });
    CFG.ocultos.forEach(i => { const el = ED.blocks[+i]; if (el) el.style.display = 'none'; });
    const T = CFG.tema;
    if (T.acento) root.style.setProperty('--accent', T.acento);
    if (T.fuente) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + T.fuente.replace(/ /g, '+') + ':wght@400;600;800&display=swap'; document.head.appendChild(l);
      root.style.setProperty('--font-d', "'" + T.fuente + "', serif");
    }
    if (T.cursor) root.dataset.fxCursor = T.cursor;
  }
  applyConfig();
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const digits = s => String(s || '').replace(/\D/g, '');
  function bindBiz() {
    $$('[data-biz]').forEach(el => { const v = get(BIZ, el.dataset.biz); if (v === '') el.style.display = 'none'; else if (v != null) el.textContent = v; });
    const tel = digits(BIZ.telefono), wa = digits(BIZ.whatsapp || BIZ.telefono);
    const waNum = wa.length === 9 ? '34' + wa : wa;
    const waTxt = BIZ.whatsappTexto || ('Hola ' + (BIZ.nombre || '') + ', os escribo desde la web.');
    const enc = encodeURIComponent(BIZ.direccion || BIZ.zona || 'Madrid');
    const L = {
      tel: 'tel:+34' + tel.slice(-9),
      wa: 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(waTxt),
      mail: 'mailto:' + (BIZ.email || ''),
      maps: 'https://www.google.com/maps/search/?api=1&query=' + enc,
      ig: BIZ.instagram ? 'https://instagram.com/' + String(BIZ.instagram).replace('@', '') : ''
    };
    $$('[data-biz-link]').forEach(a => {
      const k = a.dataset.bizLink; if (!L[k]) { if (k === 'ig') a.remove(); return; }
      a.href = L[k]; if (k === 'wa' || k === 'maps' || k === 'ig') { a.target = '_blank'; a.rel = 'noopener'; }
    });
    $$('[data-biz-fit]').forEach(el => el.style.setProperty('--len', Math.max(4, el.textContent.trim().length)));
    $$('iframe[data-biz-map]').forEach(f => { f.src = 'https://maps.google.com/maps?q=' + enc + '&z=15&output=embed'; });
    if (BIZ.color && !CFG.tema.acento) root.style.setProperty('--accent', BIZ.color);
    if (BIZ.nombre) document.title = BIZ.nombre + (BIZ.lema ? ' · ' + BIZ.lema : '');
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    // Horario: tabla + estado "abierto ahora"
    const H = BIZ.horario || {};
    const DAYS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'], NAMES = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' };
    $$('[data-horario]').forEach(ul => {
      ul.innerHTML = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map(d => '<li' + (DAYS[new Date().getDay()] === d ? ' class="today"' : '') + '><span>' + NAMES[d] + '</span><b>' + (H[d] || 'Cerrado') + '</b></li>').join('');
    });
    $$('[data-open-status]').forEach(el => {
      const now = new Date(), d = DAYS[now.getDay()], mins = now.getHours() * 60 + now.getMinutes();
      const slots = String(H[d] || '').split(',').map(s => s.trim().match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/)).filter(Boolean);
      let open = null;
      slots.forEach(m => { const a = +m[1] * 60 + +m[2]; let b = +m[3] * 60 + +m[4]; if (b <= a) b += 1440; if (mins >= a && mins < b) open = m[3] + ':' + m[4]; });
      el.classList.toggle('is-open', !!open);
      el.innerHTML = '<i></i>' + (open ? 'Abierto ahora · hasta las ' + open : 'Ahora cerrado · ' + (BIZ.cita ? 'pide cita por WhatsApp' : 'escríbenos por WhatsApp'));
    });
    if (BIZ.demo) {
      const b = document.createElement('div'); b.className = 'fx-demo';
      b.innerHTML = '<b>Maqueta</b> de demostración · datos de ejemplo';
      document.body.appendChild(b);
    }
  }

  /* ---------- 2. Partir texto en letras / palabras ---------- */
  function splitChars(el) {
    if (EDIT) return [];
    if (el._chars) return el._chars;
    const out = [];
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    if (el.tagName === 'DIV' && !el.getAttribute('role')) el.setAttribute('role', 'img'); // un div con aria-label necesita rol
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          [...part].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; const i = document.createElement('span'); i.className = 'ci'; i.textContent = c; s.appendChild(i); w.appendChild(s); out.push(s); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el._chars = out; return out;
  }
  function splitWords(el) {
    if (EDIT) return [];
    if (el._words) return el._words;
    const out = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'wd'; const i = document.createElement('span'); i.className = 'wi'; i.textContent = part; w.appendChild(i); frag.appendChild(w); out.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el._words = out; return out;
  }

  /* ---------- 3. Texto que se descifra ---------- */
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function scramble(el, total = 18) {
    if (el._busy || RM) return; el._busy = true;
    const final = el.dataset.text || el.textContent; el.dataset.text = final;
    let f = 0;
    const iv = setInterval(() => {
      f++;
      el.textContent = final.split('').map((c, i) => c === ' ' ? ' ' : (i < (f / total) * final.length ? c : GLYPHS[Math.random() * GLYPHS.length | 0])).join('');
      if (f >= total) { clearInterval(iv); el.textContent = final; el._busy = false; }
    }, 32);
  }

  /* ---------- 4. Letras que reaccionan al cursor ---------- */
  function hotLetters(el) {
    if (!FINE || RM) return;
    const chars = splitChars(el).map(c => c.firstChild), R = +el.dataset.hot || 180;
    let pos = [], raf = 0;
    const measure = () => { pos = chars.map(c => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY]; }); };
    measure(); addEventListener('resize', measure); el._measure = measure;
    addEventListener('pointermove', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        chars.forEach((c, i) => { const p = pos[i]; if (!p) return; const d = Math.hypot(PTR.px - p[0], PTR.py - p[1]); const f = Math.max(0, 1 - d / R); c.style.setProperty('--h', (f * f).toFixed(3)); });
      });
    }, { passive: true });
  }

  /* ---------- 5. Cursor personalizado ---------- */
  function cursor() {
    if (!FINE || RM || SOFT) return;
    // El puntero del sistema no se oculta nunca: el efecto solo acompaña
    const style = root.dataset.fxCursor, ring = document.createElement('div'), tag = document.createElement('div');
    ring.className = 'fx-ring' + (style === 'cross' ? ' brk' : ''); tag.className = 'fx-tag';
    document.body.append(ring, tag);
    const rx = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
    const tx = gsap.quickTo(tag, 'x', { duration: .2, ease: 'power3' }), ty = gsap.quickTo(tag, 'y', { duration: .2, ease: 'power3' });
    let lock = null;   // en «esquinas», el marco se ajusta al botón bajo el ratón
    if (style === 'blend') { const gl = document.createElement('div'); gl.className = 'fx-glow'; document.body.appendChild(gl); const gx = gsap.quickTo(gl, 'x', { duration: .9, ease: 'power3' }), gy = gsap.quickTo(gl, 'y', { duration: .9, ease: 'power3' }); addEventListener('pointermove', e => { gx(e.clientX); gy(e.clientY); }, { passive: true }); }
    if (style === 'trail') {
      const tr = Array.from({ length: 4 }, (_, i) => { const d = document.createElement('i'); d.className = 'fx-trail'; d.style.scale = 1 - i * .18; d.style.filter = 'opacity(' + (.55 - i * .12) + ')'; document.body.appendChild(d); return d; }), pos = tr.map(() => ({ x: -99, y: -99 }));
      gsap.ticker.add(() => pos.forEach((p, i) => { const t = i ? pos[i - 1] : PTR; p.x += (t.x - p.x) * .35; p.y += (t.y - p.y) * .35; tr[i].style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; }));
    }
    addEventListener('pointermove', e => { if (!lock) { rx(e.clientX); ry(e.clientY); } tx(e.clientX); ty(e.clientY); root.classList.add('fx-cursor-in'); }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('fx-cursor-in'));
    addEventListener('scroll', () => { if (lock) { lock = null; ring.style.width = ring.style.height = ''; } }, { passive: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a, button, [data-cursor], label, summary, select'), label = t && t.dataset.cursor || '';
      ring.classList.toggle('hov', !!t); tag.textContent = label; tag.classList.toggle('on', !!label);
      root.classList.toggle('fx-cursor-text', !!e.target.closest('input, textarea'));
      if (style === 'cross') {
        const r = t && t.getBoundingClientRect();
        if (r && r.width < 420 && r.height < 160) { lock = t; ring.style.width = r.width + 12 + 'px'; ring.style.height = r.height + 12 + 'px'; rx(r.left + r.width / 2); ry(r.top + r.height / 2); }
        else { lock = null; ring.style.width = ring.style.height = ''; }
      }
    });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
  }

  /* ---------- 6. Botones magnéticos con etiqueta deslizante ---------- */
  function buttons() {
    $$('.btn').forEach(b => {
      if (!b.querySelector('.sl') && !EDIT) {
        const t = b.textContent.trim(), alt = b.dataset.alt || t;
        b.innerHTML = '<span class="sl"><span>' + t + '</span><span aria-hidden="true">' + alt + '</span></span>';
      }
      b.addEventListener('pointerenter', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--bx', (e.clientX - r.left) + 'px'); b.style.setProperty('--by', (e.clientY - r.top) + 'px'); });
    });
    if (!FINE || RM) return;
    $$('.magnetic, [data-magnetic]').forEach(b => {
      const s = +b.dataset.magnetic || .35, inner = b.querySelector('.sl');
      const xT = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yT = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      const ix = inner && gsap.quickTo(inner, 'x', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); xT(x * s); yT(y * s); if (ix) ix(x * s * .4); });
      b.addEventListener('pointerleave', () => { gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.35)' }); if (inner) gsap.to(inner, { x: 0, duration: .9, ease: 'elastic.out(1,.35)' }); });
    });
  }

  /* ---------- 7. Inclinación 3D con brillo ---------- */
  function tilt(el, max = +el.dataset.tilt || 10) {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%'); el.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%'); });
    if (!FINE || RM) return;
    if (!el.querySelector('.fx-glare')) { const g = document.createElement('i'); g.className = 'fx-glare'; el.appendChild(g); }
    gsap.set(el, { transformPerspective: 900 });
    const rX = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3.out' }), rY = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3.out' });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); rY(((e.clientX - r.left) / r.width - .5) * max); rX(-((e.clientY - r.top) / r.height - .5) * max); });
    el.addEventListener('pointerleave', () => { rX(0); rY(0); });
  }

  /* ---------- 8. Contador tipo cuentakilómetros ---------- */
  function odometer(el) {
    const s = el.dataset.count || el.textContent.trim(); el.textContent = ''; el.classList.add('odo');
    el.insertAdjacentHTML('beforeend', '<span class="sr-only">' + s + '</span>');
    const cols = [...s].map(ch => {
      if (!/\d/.test(ch)) { const t = document.createElement('span'); t.className = 'odo-s'; t.setAttribute('aria-hidden', 'true'); t.textContent = ch; el.appendChild(t); return null; }
      const c = document.createElement('span'); c.className = 'odo-c'; c.setAttribute('aria-hidden', 'true');
      for (let k = 0; k < 20; k++) { const x = document.createElement('span'); x.textContent = k % 10; c.appendChild(x); }
      el.appendChild(c); return [c, +ch];
    }).filter(Boolean);
    const run = () => cols.forEach(([c, d], i) => {
      const y = -(d + 10) * 5;
      if (RM) { gsap.set(c, { yPercent: y }); return; }
      gsap.fromTo(c, { yPercent: 0 }, { yPercent: y, duration: 1.4 + i * .25, delay: i * .07, ease: 'expo.out' });
    });
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: run });
  }

  /* ---------- 9. Marquesinas que aceleran con el scroll ---------- */
  let lenis = null;
  function marquee(m) {
    const group = m.querySelector('.mq-group'); if (!group) return;
    const track = document.createElement('div'); track.className = 'mq-track'; group.before(track); track.appendChild(group);
    const reps = Math.max(2, Math.ceil(innerWidth * 2 / Math.max(group.offsetWidth, 1)) + 1);
    for (let i = 1; i < reps; i++) { const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
    let w = group.offsetWidth, x = 0, vis = true;
    const H = { v: 0 }, sp = +m.dataset.marquee || 1, dir = m.dataset.dir === 'right' ? 1 : -1;
    if (dir > 0) x = -w;
    new IntersectionObserver(es => vis = es[0].isIntersecting).observe(m);
    addEventListener('resize', () => { w = group.offsetWidth; });
    if (FINE && !m.hasAttribute('data-nopause')) { m.addEventListener('pointerenter', () => gsap.to(H, { v: 1, duration: .6 })); m.addEventListener('pointerleave', () => gsap.to(H, { v: 0, duration: .6 })); }
    if (RM) return;
    gsap.ticker.add(() => {
      if (!vis) return;
      const v = lenis ? lenis.velocity : 0;
      const d = v < -0.5 ? -dir : dir;
      x += d * sp * (1 + Math.min(Math.abs(v), 50) * .12) * (1 - H.v * .9);
      if (x <= -w) x += w; if (x > 0) x -= w;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      if (m.hasAttribute('data-skew')) track.style.setProperty('--sk', Math.max(-12, Math.min(12, v * .6)) + 'deg');
    });
  }

  /* ---------- 10. Lienzos ambientales que reaccionan al ratón ---------- */
  function ambient(cv) {
    const mode = cv.dataset.amb, host = cv.parentNode, ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, MOB ? 1.25 : 2);
    let col = cv.dataset.color || accent(), col2 = cv.dataset.color2 || col;
    let w = 0, h = 0, pts = [], on = false, t0 = performance.now();
    const rnd = (a, b) => a + Math.random() * (b - a);
    const CH = '01<>/{}#*+=ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function make() {
      pts = [];
      const area = w * h, dens = MOBILE ? 2 : 1;
      if (mode === 'grid') { const cs = +cv.dataset.cell || 34; for (let y = cs / 2; y < h; y += cs) for (let x = cs / 2; x < w; x += cs) pts.push({ x, y }); return; }
      if (mode === 'glyphs') { const cs = 30; for (let y = cs; y < h; y += cs) for (let x = cs / 2; x < w; x += cs) pts.push({ x, y, c: CH[Math.random() * CH.length | 0], a: 0 }); return; }
      if (mode === 'speed') { for (let i = 0; i < Math.min(160, area / 9000 / dens); i++) pts.push({ x: rnd(0, w), y: rnd(0, h), l: rnd(30, 220), v: rnd(4, 16), a: rnd(.1, .7) }); return; }
      const n = mode === 'web' ? Math.min(90, area / 15000 / dens) : Math.min(mode === 'stars' ? 260 : 170, area / 7000 / dens);
      for (let i = 0; i < n; i++) pts.push(spawn(true));
    }
    function spawn(init) {
      if (mode === 'embers') return { x: rnd(0, w), y: init ? rnd(0, h) : h + 10, vx: rnd(-.3, .3), vy: -rnd(.6, 2.2), r: rnd(.6, 2.6), life: rnd(.4, 1), ph: rnd(0, 6) };
      if (mode === 'bubbles') return { x: rnd(0, w), y: init ? rnd(0, h) : h + 30, vy: -rnd(.3, 1.1), r: rnd(3, 22), ph: rnd(0, 6), pop: 0 };
      if (mode === 'stars') return { x: rnd(0, w), y: rnd(0, h), r: rnd(.3, 1.6), ph: rnd(0, 6), sp: rnd(.5, 2.5) };
      return { x: rnd(0, w), y: rnd(0, h), vx: rnd(-.25, .25), vy: mode === 'dust' ? -rnd(.08, .4) : rnd(-.25, .25), r: rnd(.5, 1.9), ph: rnd(0, 6) };
    }
    function size() { w = host.offsetWidth; h = host.offsetHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); make(); }
    function draw() {
      if (!on) return;
      requestAnimationFrame(draw);
      const r = cv.getBoundingClientRect(), mx = PTR.x - r.left, my = PTR.y - r.top, t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      if (mode === 'grid') {
        ctx.fillStyle = col;
        pts.forEach(p => { const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 220); const ox = d ? dx / d * f * 22 : 0, oy = d ? dy / d * f * 22 : 0; ctx.globalAlpha = .12 + f * .8; ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, 1.1 + f * 3, 0, 7); ctx.fill(); });
      } else if (mode === 'glyphs') {
        ctx.font = '12px ui-monospace,monospace'; ctx.fillStyle = col;
        pts.forEach(p => { const d = Math.hypot(p.x - mx, p.y - my), f = Math.max(0, 1 - d / 200); p.a += (f - p.a) * .08; if (Math.random() < .004 + f * .08) p.c = CH[Math.random() * CH.length | 0]; ctx.globalAlpha = .05 + p.a * .9; ctx.fillText(p.c, p.x, p.y); });
      } else if (mode === 'speed') {
        ctx.lineCap = 'round';
        pts.forEach(p => { const f = Math.max(0, 1 - Math.abs(p.y - my) / 120) * (mx > -100 ? 1 : 0); p.x -= p.v * (1 + f * 3); if (p.x + p.l < 0) { p.x = w + rnd(0, 200); p.y = rnd(0, h); } const g = ctx.createLinearGradient(p.x, 0, p.x + p.l, 0); g.addColorStop(0, col); g.addColorStop(1, 'transparent'); ctx.strokeStyle = g; ctx.globalAlpha = Math.min(1, p.a + f * .6); ctx.lineWidth = 1 + f * 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.l * (1 + f), p.y); ctx.stroke(); });
      } else if (mode === 'embers') {
        ctx.globalCompositeOperation = 'lighter';
        if (mx > 0 && mx < w && my > 0 && my < h && Math.random() < .6) { const p = spawn(false); p.x = mx + rnd(-20, 20); p.y = my + rnd(-10, 10); p.vy = -rnd(1, 3); pts.push(p); }
        pts.forEach(p => { p.ph += .05; p.x += p.vx + Math.sin(p.ph) * .4; p.y += p.vy; p.life -= .0025; const a = Math.max(0, p.life) * (.6 + Math.sin(p.ph * 3) * .4); const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5); g.addColorStop(0, col2); g.addColorStop(.3, col); g.addColorStop(1, 'transparent'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 7); ctx.fill(); });
        pts = pts.filter(p => p.life > 0 && p.y > -20);
        while (pts.length < Math.min(170, w * h / 7000)) pts.push(spawn(false));
        ctx.globalCompositeOperation = 'source-over';
      } else if (mode === 'bubbles') {
        ctx.strokeStyle = col; ctx.fillStyle = col;
        pts.forEach((p, i) => { p.ph += .02; p.y += p.vy; p.x += Math.sin(p.ph) * .5; const d = Math.hypot(p.x - mx, p.y - my); if (d < p.r + 30 && !p.pop) p.pop = 1; if (p.pop) { p.pop += .08; ctx.globalAlpha = Math.max(0, .6 - p.pop * .3); ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.pop, 0, 7); ctx.stroke(); if (p.pop > 2) pts[i] = spawn(false); return; } ctx.globalAlpha = .35; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke(); ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(p.x - p.r * .35, p.y - p.r * .35, p.r * .18, 0, 7); ctx.fill(); if (p.y < -30) pts[i] = spawn(false); });
      } else if (mode === 'stars') {
        ctx.fillStyle = col;
        pts.forEach(p => { const d = Math.hypot(p.x - mx, p.y - my), f = Math.max(0, 1 - d / 160); ctx.globalAlpha = (.3 + Math.sin(t * p.sp + p.ph) * .3 + .2) + f * .6; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + f * 1.5, 0, 7); ctx.fill(); });
      } else { // dust · web
        ctx.fillStyle = col;
        pts.forEach(p => {
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
          if (d < 140 && d > 0) { p.x += dx / d * 1.4; p.y += dy / d * 1.4; }
          p.x += p.vx; p.y += p.vy;
          if (p.y < -5) p.y = h + 5; if (p.y > h + 5) p.y = -5; if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
          ctx.globalAlpha = .25 + Math.sin(t * 2 + p.ph) * .2 + .2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        });
        if (mode === 'web') {
          ctx.strokeStyle = col; ctx.lineWidth = .7;
          for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 120) { ctx.globalAlpha = (1 - d / 120) * .35; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
          pts.forEach(p => { const d = Math.hypot(p.x - mx, p.y - my); if (d < 180) { ctx.globalAlpha = (1 - d / 180) * .8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke(); } });
        }
      }
      ctx.globalAlpha = 1;
    }
    size(); addEventListener('resize', () => { clearTimeout(cv._rt); cv._rt = setTimeout(size, 150); });
    if (RM) { on = true; draw(); on = false; return; }
    new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !on) { on = true; draw(); } else if (!v) on = false; }).observe(host);
    cv._setColor = (c, c2) => { col = c; col2 = c2 || c; };
  }

  /* ---------- 11. Revelados al hacer scroll ---------- */
  function reveals() {
    if (RM) return;
    $$('[data-split]:not([data-manual])').forEach(el => {
      const chars = splitChars(el), v = el.dataset.split;
      // Por defecto: las letras giran en 3D desde abajo, como fichas que se levantan
      const from = v === 'fall' ? { yPercent: -120, rotation: -12, opacity: 0 } : v === 'blur' ? { opacity: 0, filter: 'blur(12px)', scale: 1.4 } : v === 'up' ? { yPercent: 120, rotation: 8 } : { rotationX: -100, yPercent: 60, z: -40, opacity: 0, transformOrigin: '50% 100% -20px' };
      gsap.from(chars, { ...from, duration: 1.05, ease: 'expo.out', stagger: .028, scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onComplete: () => el.classList.add('split-done') });
    });
    $$('[data-reveal]').forEach(el => {
      const v = el.dataset.reveal, st = { trigger: el, start: 'top 90%', once: true };
      if (v === 'lines') {
        const u = splitWords(el);
        gsap.from(u, { yPercent: 115, rotation: 3, duration: .75, ease: 'power3.out', stagger: .018, scrollTrigger: st });
        if (FINE) el.addEventListener('mouseenter', () => { if (el._wave) return; el._wave = true; gsap.to(u, { y: -7, duration: .25, ease: 'power2.out', stagger: .03, yoyo: true, repeat: 1, onComplete: () => el._wave = false }); });
      } else if (v === 'read') {
        const u = splitWords(el);
        gsap.fromTo(u, { opacity: .14 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 40%', scrub: true } });
      } else if (v === 'clip') {
        const img = el.querySelector('img, video');
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: st });
        if (img) gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: st });
      } else if (v === 'stagger') {
        gsap.from(el.children, { y: 90, z: -160, rotationX: -32, opacity: 0, transformPerspective: 1100, transformOrigin: '50% 100%', duration: 1.1, ease: 'expo.out', stagger: .09, scrollTrigger: st, clearProps: 'z,rotationX' });
      } else if (v === 'scale') {
        gsap.from(el, { scale: .82, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: st });
      } else if (v === 'left' || v === 'right') {
        gsap.from(el, { x: v === 'left' ? -80 : 80, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: st });
      } else {
        gsap.from(el, { y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: st });
      }
    });
    $$('[data-scramble]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el) }));
    $$('[data-speed]').forEach(el => gsap.to(el, { yPercent: -(+el.dataset.speed) * 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('[data-parallax-img]').forEach(el => { const img = el.querySelector('img'); gsap.fromTo(img, { yPercent: -10, scale: 1.2 }, { yPercent: 10, scale: 1.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    $$('[data-wm]').forEach(el => gsap.fromTo(el, { xPercent: +el.dataset.wm || 8 }, { xPercent: -(+el.dataset.wm || 8) * 3, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('[data-rotate-scroll]').forEach(el => gsap.to(el, { rotation: +el.dataset.rotateScroll || 180, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('[data-draw]').forEach(el => { const paths = el.tagName === 'path' ? [el] : $$('path, line, polyline, circle, rect', el); paths.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 1000; gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }); }); });
    // Paneles grandes que se elevan en 3D al entrar (efecto «tapa que se abre»)
    $$('[data-rise], .book-in, .book-card, .cita-card, .trial-in, .qbox, .q-box, .fin, .contact .ct, .vbox').forEach(el => {
      if (el.closest('.fx-story') || el.hasAttribute('data-reveal')) return;
      gsap.fromTo(el, { rotationX: 22, y: 110, scale: .9, transformPerspective: 1400, transformOrigin: '50% 100%' }, { rotationX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: .6 } });
    });
    // Las imágenes se inclinan con la velocidad del scroll
    const sk = $$('[data-reveal="clip"], .hs-item .im, .hs-item.card .im, .mosaic figure, .side, .ac').map(el => gsap.quickTo(el, 'skewY', { duration: .5, ease: 'power3' }));
    if (sk.length && lenis) gsap.ticker.add(() => { const v = Math.max(-4, Math.min(4, lenis.velocity * .18)); sk.forEach(f => f(v)); });
    // La palabra gigante del pie entra rodando en 3D
    $$('[data-magnet-letters]').forEach(el => { const ch = splitChars(el); gsap.fromTo(ch, { rotationX: -95, yPercent: 40, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%' }, { rotationX: 0, yPercent: 0, opacity: 1, ease: 'power2.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 85%', scrub: .8 } }); });
    // Fondo de página que cambia por sección
    $$('[data-bg]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => { if (s.isActive) gsap.to(document.body, { backgroundColor: sec.dataset.bg, color: sec.dataset.fg || null, duration: .7, ease: 'power2.out' }); } }));
  }

  /* ---------- 12. Historia 3D tipo vídeo (scroll fijado) ----------
     <section class="fx-story"><script type="application/json">{eyebrow,title,play,metric:{label,dec,suf,pre},frames:[{k,t,p,img,v}]}</script></section> */
  const UNS = id => 'https://images.unsplash.com/photo-' + id + '?w=1600&q=70&auto=format';
  function buildStory(sec) {
    let D; try { D = JSON.parse(sec.querySelector('script').textContent); } catch (e) { return; }
    const M = D.metric || {}, n = D.frames.length;
    const fmt = v => (M.pre || '') + (+v).toFixed(M.dec || 0).replace('.', ',') + (M.suf || '');
    sec.classList.add('st-' + (D.layout || 'cinema'));
    sec.innerHTML = '<div class="st-pin"><div class="st-head"><div><p class="st-eyebrow">' + (D.eyebrow || '') + '</p><h2 data-split>' + D.title + '</h2></div>' +
      '<div class="st-ctrl"><span class="st-count"><b>01</b> / ' + String(n).padStart(2, '0') + '</span><button type="button" class="st-play" data-cursor="Play"><i>▶</i><span>' + (D.play || 'Ver en vídeo') + '</span></button></div></div>' +
      '<div class="st-stage">' + D.frames.map((f, i) => '<figure class="st-frame' + (i ? '' : ' on') + '"><div class="st-media"><img src="' + UNS(f.img) + '" alt="" loading="' + (i ? 'lazy' : 'eager') + '"></div><figcaption><span class="st-k">' + f.k + '</span><h3>' + f.t + '</h3><p>' + f.p + '</p></figcaption></figure>').join('') +
      '<div class="st-hud"><small>' + (M.label || '') + '</small><b class="st-val">' + fmt(D.frames[0].v) + '</b><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path class="st-base"/><path class="st-line"/></svg></div>' +
      '<div class="st-rec"><i></i>REC <span class="st-tc">00:00</span></div></div>' +
      '<div class="st-time"><div class="st-track"><i class="st-fill"></i></div><div class="st-steps">' + D.frames.map((f, i) => '<button type="button" data-i="' + i + '"><b>' + f.k + '</b><span>' + f.t + '</span></button>').join('') + '</div></div></div>';
    sec._story = { D, n, fmt };
    // Gráfica de progreso con los valores de cada escena
    const vs = D.frames.map(f => +f.v), lo = Math.min(...vs), hi = Math.max(...vs), rng = hi - lo || 1;
    const pts = vs.map((v, i) => [10 + i * (180 / Math.max(1, n - 1)), 52 - (v - lo) / rng * 42]);
    const d = 'M' + pts.map(p => p.join(' ')).join(' L');
    $$('.st-base, .st-line', sec).forEach(p => p.setAttribute('d', d));
  }
  function story(sec) {
    const S = sec._story; if (!S) return;
    const { D, n, fmt } = S, L0 = D.layout || 'cinema', frames = $$('.st-frame', sec), val = $('.st-val', sec), line = $('.st-line', sec), L = line.getTotalLength();
    const steps = $$('.st-steps button', sec), cnt = $('.st-count b', sec), fill = $('.st-fill', sec), tc = $('.st-tc', sec), play = $('.st-play', sec);
    const caps = frames.map(f => f.querySelector('figcaption')), imgs = frames.map(f => $('img', f));
    const tilt = frames.map((_, i) => [-7, 5, -3, 6, -5, 4][i % 6] * (MOB ? .35 : 1));
    line.style.strokeDasharray = L;
    const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
    // Cada escena se queda quieta el 55 % del tramo y transiciona el 45 % restante (ritmo de vídeo)
    const pace = t => { const a = Math.floor(t), f = t - a; return Math.min(n - 1, a + ease((f - .55) / .45)); };
    const render = raw => {
      const t = pace(Math.max(0, Math.min(n - 1, raw)));
      frames.forEach((fr, i) => {
        const d = i - t, ad = Math.abs(d), s = d < 0 ? -1 : 1, o = {};
        if (L0 === 'film') { Object.assign(o, { xPercent: d * 78, rotationY: -d * 38, z: -ad * 260, opacity: Math.max(0, 1 - ad * .45), zIndex: 10 - Math.round(ad * 2) }); }
        else if (L0 === 'phone') { Object.assign(o, { yPercent: d * 104, scale: 1 - Math.min(ad, 1) * .12, rotationX: -d * 10, opacity: ad < 1.05 ? 1 : 0, zIndex: 10 - Math.round(ad) }); }
        else if (L0 === 'polaroid') {
          if (d > 0) Object.assign(o, { yPercent: -150 * Math.min(d, 1), rotation: tilt[i] + 40 * Math.min(d, 1), scale: 1 + .25 * Math.min(d, 1), opacity: d < 1 ? 1 : 0 });
          else Object.assign(o, { yPercent: 0, xPercent: d * 6, rotation: tilt[i], scale: 1 + d * .04, opacity: d > -3 ? 1 : 0 });
          o.zIndex = i + 1;
        }
        else if (L0 === 'split') { Object.assign(o, { rotationX: d > 0 ? -95 * Math.min(d, 1) : 95 * Math.min(ad, 1), yPercent: d * 18, z: -ad * 200, opacity: ad < 1 ? 1 - ad * .6 : 0, transformOrigin: d > 0 ? '50% 100%' : '50% 0%', zIndex: 10 - Math.round(ad) }); }
        else { Object.assign(o, d < 0 ? { z: -520 * Math.min(ad, 1), rotationY: (i % 2 ? 28 : -28) * Math.min(ad, 1), xPercent: (i % 2 ? 26 : -26) * Math.min(ad, 1), opacity: 1 - Math.min(ad, 1) } : { z: 380 * Math.min(d, 1), rotationY: (i % 2 ? 42 : -42) * Math.min(d, 1), xPercent: (i % 2 ? 70 : -70) * Math.min(d, 1), opacity: 1 - Math.min(d, 1) }, { zIndex: 10 - Math.round(ad) }); }
        gsap.set(fr, o);
        gsap.set(imgs[i], { scale: 1.16 - Math.max(-1, Math.min(1, d)) * .1, xPercent: Math.max(-1, Math.min(1, d)) * 6 });
        gsap.set(caps[i], { opacity: Math.max(0, 1 - ad * 2.4), y: d * 60, rotationX: d * -30 });
      });
      val.textContent = fmt(+D.frames[Math.floor(t)].v + (D.frames[Math.min(n - 1, Math.floor(t) + 1)].v - D.frames[Math.floor(t)].v) * (t - Math.floor(t)));
      line.style.strokeDashoffset = L * (1 - t / Math.max(1, n - 1));
      const cur = Math.round(t);
      steps.forEach((s, i) => { s.classList.toggle('on', i === cur); s.classList.toggle('done', i < cur); });
      cnt.textContent = String(cur + 1).padStart(2, '0');
      const p = raw / Math.max(1, n - 1); fill.style.transform = 'scaleX(' + p + ')';
      const secs = Math.round(p * n * 6); tc.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
    };
    if (RM) { sec.classList.add('st-static'); render(n - 1); frames.forEach(f => gsap.set(f, { clearProps: 'all' })); caps.forEach(c => gsap.set(c, { clearProps: 'all' })); return; }
    const proxy = { t: 0 };
    render(0);
    const tw = gsap.to(proxy, { t: n - 1, ease: 'none', onUpdate: () => render(proxy.t), scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * n * (MOB ? .42 : .7), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
    const st = tw.scrollTrigger, goTo = (p, dur) => { const y = st.start + (st.end - st.start) * p; if (lenis) lenis.scrollTo(y, { duration: dur, easing: x => x, lock: false }); else scrollTo({ top: y, behavior: dur ? 'smooth' : 'auto' }); };
    steps.forEach((s, i) => s.addEventListener('click', () => goTo(i / Math.max(1, n - 1), 1.2)));
    let playing = false;
    const stop = () => { playing = false; play.classList.remove('is-on'); play.firstChild.textContent = '▶'; };
    play.addEventListener('click', () => {
      if (playing) { if (lenis) { lenis.stop(); lenis.start(); } stop(); return; }
      if (st.progress > .97 || st.progress < .01) { if (lenis) lenis.scrollTo(st.start + 2, { immediate: true }); else scrollTo(0, st.start + 2); }
      playing = true; play.classList.add('is-on'); play.firstChild.textContent = '❚❚';
      const dur = (1 - st.progress) * n * 3.4;
      if (lenis) lenis.scrollTo(st.end, { duration: dur, easing: x => x, onComplete: stop }); else { scrollTo({ top: st.end, behavior: 'smooth' }); stop(); }
    });
    addEventListener('wheel', () => { if (playing) stop(); }, { passive: true });
  }

  /* ---------- Opiniones: 5 formatos (google, deck, chat, big, wall) ----------
     <section class="fx-reviews"><script type="application/json">{eyebrow,title,layout,rating,count,items:[{n,t,s,src}]}</script></section> */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const stars = k => '★★★★★'.slice(0, k || 5) + '<span style="opacity:.25">' + '★★★★★'.slice(0, 5 - (k || 5)) + '</span>';
  function reviewsBlock(sec) {
    let D; try { D = JSON.parse(sec.querySelector('script').textContent); } catch (e) { return; }
    const it = D.items || [], lay = D.layout || 'google', ini = s => esc(String(s || '?').trim()[0] || '?').toUpperCase();
    sec.classList.add('rv-' + lay);
    let body = '';
    if (lay === 'google') {
      const dist = [78, 15, 4, 2, 1];
      body = '<div class="rg"><div class="rg-sum"><b class="rg-n">' + esc(D.rating || '4,9') + '</b><div class="rg-st">' + stars(5) + '</div><small>' + esc(D.count || 'Más de 200') + ' reseñas en Google</small>' +
        dist.map((p, i) => '<div class="rg-bar"><span>' + (5 - i) + '</span><i><b style="--w:' + p + '%"></b></i></div>').join('') + '</div><div class="rg-list">' +
        it.map((r, i) => '<article class="rg-card' + (i ? '' : ' on') + '"><header><i>' + ini(r.n) + '</i><div><b>' + esc(r.n) + '</b><small>' + esc(r.src || 'Google') + ' · hace ' + (2 + i * 3) + ' días</small></div><span class="g">G</span></header><div class="rg-st">' + stars(r.s) + '</div><p>' + esc(r.t) + '</p></article>').join('') + '</div></div>';
    } else if (lay === 'deck') {
      body = '<div class="rd"><div class="rd-stack">' + it.map((r, i) => '<article class="rd-card" style="--i:' + i + '"><div class="rg-st">' + stars(r.s) + '</div><p>«' + esc(r.t) + '»</p><footer><i>' + ini(r.n) + '</i><span><b>' + esc(r.n) + '</b><small>' + esc(r.src || 'Google') + '</small></span></footer></article>').join('') + '</div><div class="rd-ui"><button type="button" class="rd-next" data-cursor="Siguiente">Siguiente opinión →</button><small>Arrastra o pulsa la tarjeta</small></div></div>';
    } else if (lay === 'chat') {
      body = '<div class="rc"><div class="rc-phone"><div class="rc-top"><i>' + ini(BIZ.nombre) + '</i><div><b>' + esc(BIZ.nombre || '') + '</b><small>en línea</small></div></div><div class="rc-body"></div></div><div class="rc-side"><b class="rg-n">' + esc(D.rating || '4,9') + '</b><div class="rg-st">' + stars(5) + '</div><p>Mensajes reales que nos mandáis después de venir. Gracias por cada uno.</p></div></div>';
    } else if (lay === 'big') {
      body = '<div class="rb"><div class="rb-q">' + it.map((r, i) => '<blockquote class="' + (i ? '' : 'on') + '"><p>«' + esc(r.t) + '»</p><cite>' + esc(r.n) + ' · ' + esc(r.src || 'Google') + '</cite></blockquote>').join('') + '</div><div class="rb-av">' + it.map((r, i) => '<button type="button" class="' + (i ? '' : 'on') + '" data-i="' + i + '" aria-label="Opinión de ' + esc(r.n) + '">' + ini(r.n) + '</button>').join('') + '</div></div>';
    } else {
      const card = r => '<article class="rw-card"><div class="rg-st">' + stars(r.s) + '</div><p>«' + esc(r.t) + '»</p><small>' + esc(r.n) + ' · ' + esc(r.src || 'Google') + '</small></article>';
      body = '<div class="rw"><div data-marquee=".5"><div class="mq-group">' + it.map(card).join('') + '</div></div><div data-marquee=".4" data-dir="right"><div class="mq-group">' + it.slice().reverse().map(card).join('') + '</div></div></div>';
    }
    sec.innerHTML = '<div class="rv-wrap"><p class="st-eyebrow">' + (D.eyebrow || 'Opiniones') + '</p><h2 data-split>' + (D.title || 'Lo que dicen') + '</h2>' + body + '<p class="rv-note">' + esc(D.note || 'Opiniones de ejemplo') + '</p></div>';
    const once = fn => { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: .3 }); io.observe(sec); };
    if (lay === 'google') {
      const cards = $$('.rg-card', sec); let k = 0;
      once(() => { $$('.rg-bar b', sec).forEach((b, i) => gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: 1.2, delay: i * .1, ease: 'expo.out' })); });
      if (!RM && cards.length > 1) setInterval(() => { const a = cards[k], b = cards[k = (k + 1) % cards.length]; a.classList.remove('on'); b.classList.add('on'); gsap.fromTo(b, { rotationX: -70, y: 40, opacity: 0, transformPerspective: 900 }, { rotationX: 0, y: 0, opacity: 1, duration: .9, ease: 'expo.out' }); }, 4500);
    } else if (lay === 'deck') {
      const stack = $('.rd-stack', sec); let order = $$('.rd-card', sec);
      const lay3d = () => order.forEach((c, i) => gsap.to(c, { y: i * 16, z: -i * 60, rotation: i ? (i % 2 ? 3 : -3) * i : 0, scale: 1 - i * .04, opacity: i > 3 ? 0 : 1, zIndex: 50 - i, duration: .7, ease: 'expo.out', transformPerspective: 1200 }));
      const next = (dir = 1) => { const c = order.shift(); gsap.to(c, { x: dir * 520, rotation: dir * 24, opacity: 0, duration: .5, ease: 'power2.in', onComplete: () => { gsap.set(c, { x: 0 }); order.push(c); lay3d(); } }); };
      lay3d();
      $('.rd-next', sec).addEventListener('click', () => next(1));
      let sx = null; stack.addEventListener('pointerdown', e => sx = e.clientX); stack.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; next(Math.abs(dx) > 20 ? Math.sign(dx) : 1); sx = null; });
      if (!RM) { let hov = false; sec.addEventListener('pointerenter', () => hov = true); sec.addEventListener('pointerleave', () => hov = false); setInterval(() => { if (!hov) next(1); }, 4200); }
    } else if (lay === 'chat') {
      const box = $('.rc-body', sec);
      const add = (html, cls) => { const m = document.createElement('div'); m.className = 'rc-msg ' + cls; m.innerHTML = html; box.appendChild(m); gsap.from(m, { y: 20, scale: .9, opacity: 0, duration: .45, ease: 'back.out(2)' }); box.scrollTop = box.scrollHeight; return m; };
      const hhmm = i => { const d = new Date(Date.now() - (it.length - i) * 3600e3 * 5); return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); };
      once(async () => {
        for (let i = 0; i < it.length; i++) {
          const r = it[i];
          if (!RM) { const t = add('<i class="rc-dots"><b></b><b></b><b></b></i>', 'in'); await new Promise(z => setTimeout(z, 1100)); t.remove(); }
          add('<small>' + esc(r.n) + '</small>' + esc(r.t) + ' <span class="rc-st">' + '★'.repeat(r.s || 5) + '</span><time>' + hhmm(i) + '</time>', 'in');
          await new Promise(z => setTimeout(z, RM ? 0 : 700));
          add('¡Mil gracias, ' + esc(String(r.n).split(' ')[0]) + '! 🙌 Os esperamos pronto.<time>' + hhmm(i) + ' ✓✓</time>', 'out');
          await new Promise(z => setTimeout(z, RM ? 0 : 900));
        }
      });
    } else if (lay === 'big') {
      const qs2 = $$('.rb-q blockquote', sec), av = $$('.rb-av button', sec); let k = 0, tm;
      const show = i => { qs2[k].classList.remove('on'); av[k].classList.remove('on'); k = i; qs2[k].classList.add('on'); av[k].classList.add('on'); const w = splitWords(qs2[k].querySelector('p')); if (!RM && w.length) gsap.fromTo(w, { yPercent: 110, opacity: 0, rotationX: -60 }, { yPercent: 0, opacity: 1, rotationX: 0, stagger: .025, duration: .7, ease: 'expo.out' }); };
      av.forEach((b, i) => b.addEventListener('click', () => { clearInterval(tm); show(i); }));
      if (!RM) tm = setInterval(() => show((k + 1) % qs2.length), 5500);
    }
  }

  /* ---------- Avisos en vivo (prueba social) ---------- */
  function toasts() {
    const L = (BIZ.avisos || []).filter(Boolean);
    if (!L.length || CFG.tema.avisos === false || EDIT || RM || MOB) return;
    const box = document.createElement('div'); box.className = 'fx-toast'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box);
    let i = Math.floor(Math.random() * L.length);
    const show = () => {
      const txt = String(L[i++ % L.length]), m = txt.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u);
      box.innerHTML = '<i>' + (m ? m[1] : '✓') + '</i><div><b>' + esc(m ? m[2] : txt) + '</b><small>hace ' + (1 + Math.floor(Math.random() * 14)) + ' min · ' + esc(BIZ.zona || '') + '</small></div><button type="button" aria-label="Cerrar">×</button>';
      box.querySelector('button').onclick = () => { CFG.tema.avisos = false; box.remove(); };
      gsap.fromTo(box, { y: 60, rotationX: -80, opacity: 0, transformPerspective: 600 }, { y: 0, rotationX: 0, opacity: 1, duration: .8, ease: 'back.out(1.6)' });
      gsap.to(box, { y: 30, opacity: 0, duration: .5, delay: 5.5, ease: 'power2.in' });
    };
    setTimeout(() => { show(); setInterval(() => { if (document.body.contains(box)) show(); }, 14000); }, 7000);
  }

  /* ---------- Mapa 3D moderno (se carga solo cuando hace falta) ---------- */
  const loadJS = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  function maps() {
    $$('iframe[data-biz-map]').forEach(f => {
      const cs = getComputedStyle(f), d = document.createElement('div');
      d.className = 'fx-map'; d.setAttribute('data-lenis-prevent', '');
      d.style.borderRadius = cs.borderRadius; d.style.minHeight = Math.max(380, parseFloat(cs.minHeight) || 0, parseFloat(cs.height) || 0) + 'px'; d.style.marginTop = cs.marginTop;
      f.replaceWith(d);
    });
    const ms = $$('.fx-map'); if (!ms.length) return;
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return; io.disconnect();
      // Por defecto el mapa radar limpio; el mapa 3D de calles si se elige en «Personaliza» (tema.vista = 'mapa')
      const tipo = CFG.tema.vista || (BIZ.mapa && BIZ.mapa.vista) || 'radar';
      const file = tipo === 'mapa' ? 'fx-mapa.js' : 'fx-radar.js', fn = tipo === 'mapa' ? 'FXMAP' : 'FXRADAR';
      loadJS(BASE + file).then(() => ms.forEach(m => window[fn](m, FX))).catch(() => ms.forEach(m => m.classList.add('fx-map-fail')));
    }, { rootMargin: '700px' });
    ms.forEach(m => io.observe(m));
  }

  /* ---------- Fondo vivo: manchas de color de la marca que flotan + trama que se desplaza con el scroll ---------- */
  function ambience() {
    if (EDIT) return;
    const bg = document.createElement('div'); bg.className = 'fx-bgfx'; bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML = '<i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="dots"></i>';
    document.body.prepend(bg);
    if (RM) return;
    const b3 = $('.b3', bg), xT = gsap.quickTo(b3, 'x', { duration: 3, ease: 'power2' }), yT = gsap.quickTo(b3, 'y', { duration: 3, ease: 'power2' });
    if (FINE) addEventListener('pointermove', e => { xT(e.clientX - innerWidth / 2); yT(e.clientY - innerHeight / 2); }, { passive: true });
    let raf = 0; addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; bg.style.setProperty('--sy', (scrollY * .06 % 40) + 'px'); bg.style.setProperty('--hue', (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 40) + 'deg'); }); }, { passive: true });
  }

  /* ---------- Secciones bien separadas: bandas alternas, separador numerado y aire mínimo ---------- */
  function sections() {
    let k = 1;
    $$('main > section, main > div').forEach(sec => {
      if (sec.matches('.hero, .cn-win, .fx-story, [data-hscroll], [data-marquee], .mq, .belt, .stickers') || sec.closest('.hero')) return;
      if (sec.offsetHeight < 140) return;
      k++;
      sec.classList.add('fx-sec');
      const cs = getComputedStyle(sec), own = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' || cs.backgroundImage !== 'none';
      if (!own && k % 2 === 1) sec.classList.add('fx-band');
      if (MOB) { sec.style.paddingTop = '76px'; sec.style.paddingBottom = '52px'; }
      else { if (parseFloat(cs.paddingTop) < 90) sec.style.paddingTop = '100px'; if (parseFloat(cs.paddingBottom) < 80) sec.style.paddingBottom = '90px'; }
      const h = sec.querySelector('h2'), name = h ? (h.getAttribute('aria-label') || h.textContent).replace(/\s+/g, ' ').trim().split(' ').slice(0, 4).join(' ') : '';
      const d = document.createElement('div'); d.className = 'fx-div'; d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<i></i><b>' + String(k).padStart(2, '0') + '</b><span>' + esc(name) + '</span><i></i>';
      sec.prepend(d);
      if (!RM) ScrollTrigger.create({ trigger: sec, start: 'top 85%', once: true, onEnter: () => d.classList.add('on') }); else d.classList.add('on');
    });
  }

  /* ---------- Móvil y lectura rápida: nada se sale, listas largas en carrusel y menú de secciones ---------- */
  const MOB = matchMedia('(max-width:760px)').matches;
  const SKIPFIT = '.hero, .fx-story, [data-hscroll], [data-marquee], .mq-track, .fx-studio, .fx-reviews, canvas, svg';
  function fitMobile() {
    if (!MOB) return;
    const W = document.documentElement.clientWidth, fix = [];
    $$('main *').forEach(el => {
      if (!el.firstElementChild && !/^H[1-4]$/.test(el.tagName)) return;
      if (!(el.scrollWidth > el.clientWidth + 4 || el.getBoundingClientRect().right > W + 2) || el.closest(SKIPFIT) || el.closest('.fx-swipe')) return;
      const cs = getComputedStyle(el); if (cs.position === 'absolute' || cs.position === 'fixed') return;
      fix.push([el, cs.display, cs.flexWrap, cs.overflowX]);
    });
    fix.forEach(([el, dp, fw, ox]) => {
      if (dp.includes('grid')) el.style.gridTemplateColumns = 'minmax(0,1fr)';
      else if (dp.includes('flex') && fw === 'nowrap' && ox === 'visible') el.style.flexWrap = 'wrap';
      if (/^H[1-4]$/.test(el.tagName)) el.style.overflowWrap = 'break-word';
    });
  }
  // Títulos con una palabra más ancha que su caja («TERAPÉUTICO» en una tarjeta estrecha): se reduce la letra
  // hasta que cabe entera, en vez de partirla letra a letra
  function fitWords() {
    const grp = new Map();
    $$('main h1, main h2, main h3, main h4').forEach(el => {
      if (!el.offsetWidth || el.closest(SKIPFIT) || getComputedStyle(el).whiteSpace === 'nowrap') return;
      const st = el.style; if (st.fontSize && !el._fw) return; // tamaño puesto a mano
      st.fontSize = ''; const ow = st.overflowWrap, wb = st.wordBreak; st.overflowWrap = 'normal'; st.wordBreak = 'keep-all';
      let fs = parseFloat(getComputedStyle(el).fontSize); const min = fs * .55;
      for (let n = 0; el.scrollWidth > el.clientWidth + 1 && fs > min && n < 12; n++) { fs *= .93; st.fontSize = fs + 'px'; el._fw = 1; }
      st.overflowWrap = ow; st.wordBreak = wb;
      const box = el.parentElement && el.parentElement.parentElement; // tarjetas hermanas de la misma rejilla
      if (el._fw && box) { const m = grp.get(box) || new Map(), w = el.parentElement.offsetWidth; m.set(w, Math.min(m.get(w) || 1e3, fs)); grp.set(box, m); }
    });
    grp.forEach((m, box) => $$(':scope > * > h1, :scope > * > h2, :scope > * > h3, :scope > * > h4', box).forEach(h => {
      const fs = m.get(h.parentElement.offsetWidth); if (fs && parseFloat(getComputedStyle(h).fontSize) > fs) { h.style.fontSize = fs + 'px'; h._fw = 1; } }));
  }
  if (document.fonts) document.fonts.ready.then(() => setTimeout(fitWords, 60));
  // En móvil, una columna larga de tarjetas (equipo, servicios, planes…) pasa a carrusel deslizable
  function swipes() {
    if (!MOB) return;
    $$('main > section').forEach(sec => {
      if (sec.matches(SKIPFIT) || sec.querySelector('form, .pills, input')) return;
      $$('*', sec).forEach(el => {
        if (el.closest('.fx-swipe') || el.closest(SKIPFIT) || el.children.length < 3) return;
        const cs = getComputedStyle(el);
        if (!/grid|flex/.test(cs.display) || cs.position === 'absolute') return;
        const kids = [...el.children].filter(c => c.offsetHeight > 0);
        if (kids.length < 3 || kids.some(c => c.offsetHeight < 90)) return;
        const lefts = new Set(kids.map(c => Math.round(c.getBoundingClientRect().left)));
        if (lefts.size > 1 || el.offsetHeight < innerHeight * .9) return;
        el.classList.add('fx-swipe');
        const dots = document.createElement('div'); dots.className = 'fx-swipe-dots'; dots.innerHTML = kids.map(() => '<i></i>').join('') + '<span>Desliza →</span>';
        el.after(dots);
        const mark = () => { const i = Math.round(el.scrollLeft / (kids[0].offsetWidth + 12)); $$('i', dots).forEach((d, j) => d.classList.toggle('on', j === i)); };
        el.addEventListener('scroll', mark, { passive: true }); mark();
      });
    });
  }
  // Menú fijo de secciones para saltar directo a lo que interesa sin bajar
  const NAVN = { configurador: 'Pruébalo', precios: 'Precios', tarifas: 'Tarifas', planes: 'Planes', carta: 'Carta', servicios: 'Servicios', tratamientos: 'Tratamientos', equipo: 'Equipo', galeria: 'Galería', opiniones: 'Opiniones', reserva: 'Reservar', cita: 'Pedir cita', contacto: 'Contacto', historia: 'Nosotros', propiedades: 'Pisos', zonas: 'Zonas', garantias: 'Garantías', averia: 'Avería', valorar: 'Valorar', prueba: 'Prueba gratis', consulta: 'Consulta', presupuesto: 'Presupuesto', test: 'Test', sesiones: 'Sesiones', mascota: 'Tu mascota', dolor: 'Dolor' };
  function quicknav() {
    $$('main > section.contact:not([id])').forEach(s => { if (!document.getElementById('contacto')) s.id = 'contacto'; });
    const secs = $$('main > section[id]').filter(s => !s.matches('.hero') && s.offsetHeight > 120);
    if (secs.length < 3) return;
    const nav = document.createElement('nav'); nav.className = 'fx-qnav'; nav.setAttribute('aria-label', 'Secciones');
    nav.innerHTML = '<div>' + secs.map(s => '<a href="#' + s.id + '">' + esc(NAVN[s.id] || s.id.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())) + '</a>').join('') + '</div>';
    document.body.appendChild(nav);
    const links = $$('a', nav), bar = nav.firstChild, top = $('.fx-nav') || $('header');
    links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById(a.hash.slice(1)); if (lenis) lenis.scrollTo(t, { offset: -40 }); else t.scrollIntoView({ behavior: 'smooth' }); }));
    let last = -2;
    const place = () => {
      nav.classList.toggle('on', scrollY > innerHeight * .6);
      const b = top ? top.getBoundingClientRect().bottom : 0;
      nav.style.top = (top && !top.classList.contains('hide') && b > 0 ? b : 0) + 'px';
      let cur = -1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      if (cur === last) return; last = cur;
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
      if (links[cur]) bar.scrollTo({ left: links[cur].offsetLeft - bar.clientWidth / 2 + links[cur].offsetWidth / 2, behavior: 'smooth' });
    };
    addEventListener('scroll', place, { passive: true }); if (lenis) lenis.on('scroll', place); gsap.ticker.add(() => { if (Math.abs(scrollY - (place.y || 0)) > 4) { place.y = scrollY; place(); } }); place();
  }

  /* ---------- 13. Scroll horizontal fijado ---------- */
  function pins() {
    // Se crean en orden de aparición para que los pins no se pisen
    $$('[data-hscroll], .fx-story').forEach(sec => sec.classList.contains('fx-story') ? story(sec) : hscroll(sec));
  }
  function hscroll(sec) {
    {
      const track = sec.querySelector('.hs-track'); if (!track) return;
      if (RM || innerWidth < 900) { sec.classList.add('hs-native'); return; }
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.hs-item', track).forEach(it => {
        const img = it.querySelector('img'); if (img) gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        // Cada tarjeta gira en 3D al cruzar la pantalla, como un carrusel
        gsap.fromTo(it, { rotationY: -22, transformPerspective: 1200 }, { rotationY: 22, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        gsap.to(it, { keyframes: { scale: [.86, 1, .86] }, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      });
    }
  }

  /* Hero en 3D: el contenido gira con el ratón y se inclina hacia atrás al bajar */
  function hero3d() {
    const h = $('.hero'); if (!h || RM) return;
    const w = h.querySelector(':scope > .wrap') || h.querySelector('.wrap'); if (!w) return;
    h.style.perspective = '1400px';
    gsap.set(w, { transformOrigin: '50% 30%' });
    if (FINE) {
      const ry = gsap.quickTo(w, 'rotationY', { duration: 1.4, ease: 'power3' }), rz = gsap.quickTo(w, 'rotationZ', { duration: 1.4, ease: 'power3' });
      addEventListener('pointermove', e => { if (scrollY > innerHeight) return; const x = e.clientX / innerWidth - .5; ry(x * 7); rz(x * -.8); }, { passive: true });
    }
    gsap.to(w, { rotationX: 16, z: -220, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- 13. Letras del pie que se levantan ---------- */
  function magnetLetters(el) {
    const chars = splitChars(el);
    if (!FINE || RM) return;
    const ys = chars.map(s => gsap.quickTo(s, 'y', { duration: .6, ease: 'power3.out' }));
    el.addEventListener('pointermove', e => chars.forEach((s, i) => { const r = s.getBoundingClientRect(), f = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 260); ys[i](-f * f * 50); s.classList.toggle('hot', f > .65); }));
    el.addEventListener('pointerleave', () => chars.forEach((s, i) => { ys[i](0); s.classList.remove('hot'); }));
  }

  /* ---------- 14. Utilidades varias ---------- */
  function misc() {
    // Barra de progreso
    const pb = document.createElement('div'); pb.className = 'fx-progress'; document.body.appendChild(pb);
    gsap.to(pb, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
    // Cabecera que se esconde al bajar
    const nav = $('.fx-nav');
    if (nav) { let last = 0; addEventListener('scroll', () => { const y = scrollY; nav.classList.toggle('scrolled', y > 40); nav.classList.toggle('hide', y > last && y > 400 && !root.classList.contains('menu-open')); last = y; }, { passive: true }); }
    $$('[data-menu-toggle]').forEach(b => b.addEventListener('click', () => { const o = root.classList.toggle('menu-open'); b.setAttribute('aria-expanded', o); if (lenis) o ? lenis.stop() : lenis.start(); }));
    $$('.fx-menu a').forEach(a => a.addEventListener('click', () => { root.classList.remove('menu-open'); if (lenis) lenis.start(); }));
    // Anclas suaves
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return; e.preventDefault(); if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.4 }); else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }));
    // Foco que sigue al ratón
    $$('[data-spot]').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
    // Profundidad con el ratón
    if (FINE && !RM) $$('[data-depth]').forEach(el => { const d = +el.dataset.depth, xT = gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }), yT = gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }); addEventListener('pointermove', e => { xT((e.clientX / innerWidth - .5) * -d); yT((e.clientY / innerHeight - .5) * -d); }, { passive: true }); });
    // Hover con descifrado
    $$('[data-scramble], .scramble').forEach(el => el.addEventListener('mouseenter', () => scramble(el)));
    // Formularios que se envían por WhatsApp
    $$('form[data-wa-form]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const lines = [...new FormData(f)].filter(([, v]) => String(v).trim()).map(([k, v]) => '• ' + k + ': ' + v);
      const wa = digits(BIZ.whatsapp || BIZ.telefono), num = wa.length === 9 ? '34' + wa : wa;
      const msg = (f.dataset.waForm || 'Hola ' + (BIZ.nombre || '') + ', quiero información:') + '\n' + lines.join('\n');
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      const b = f.querySelector('[type=submit]'); if (b) { b.classList.add('sent'); setTimeout(() => b.classList.remove('sent'), 2500); }
    }));
    // Acordeones con altura animada
    $$('[data-acc] > *').forEach(it => { const h = it.querySelector('.acc-h'); if (!h) return; h.addEventListener('click', () => { const open = it.classList.toggle('open'); h.setAttribute('aria-expanded', open); const b = it.querySelector('.acc-b'); gsap.to(b, { height: open ? 'auto' : 0, duration: .55, ease: 'expo.out' }); }); });
  }

  /* ---------- 15. Arranque: opening → hero → resto ---------- */
  const FX = window.FX = { $, $$, RM, SOFT, EDIT, FINE, MOBILE, BIZ, PTR, CFG, CFG_KEY, ED, clean, BASE, esc, splitChars, splitWords, scramble, tilt, odometer, ambient, accent, get lenis() { return lenis; } };

  function boot() {
    bindBiz();
    if (!RM && window.Lenis) {
      lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    }
    cursor(); buttons();
    $$('[data-tilt]').forEach(el => tilt(el));
    $$('[data-count]').forEach(odometer);
    $$('.fx-reviews').forEach(reviewsBlock);
    $$('[data-marquee]').forEach(marquee);
    $$('.fx-story').forEach(buildStory);
    maps(); ambience();
    if ($('.fx-studio')) loadJS(BASE + 'fx-studio.js').then(() => $$('.fx-studio').forEach(s => window.FXSTUDIO.mount(s, FX))).catch(() => {});
    if (BIZ.demo || EDIT || qs.get('personalizar') === '1') loadJS(BASE + 'fx-editor.js').catch(() => {});
    $$('canvas[data-amb]').forEach(ambient);
    $$('[data-magnet-letters]').forEach(magnetLetters);
    if (PAGE.init) try { PAGE.init(FX); } catch (e) { (window.FX_ERRS = window.FX_ERRS || []).push(String(e)); console.warn("PAGE.init", e); }
    $$('[data-hot]').forEach(hotLetters);

    const op = $('#opening'), film = $('.fx-film');
    const wantIntro = op && PAGE.opening && !RM && qs.get('intro') !== '0' && CFG.tema.intro !== false;
    const afterOpening = () => {
      if (op) op.style.display = 'none';
      root.classList.remove('opening'); root.classList.add('opened');
      if (lenis) lenis.start();
      const tl = gsap.timeline({ onComplete: () => { $$('[data-hot], [data-split][data-manual]').forEach(el => { el.classList.add('split-done'); if (el._measure) el._measure(); }); } });
      if (film) { if (!RM) tl.from($$('[data-hero-hide]', film), { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }, .5); }
      else if (PAGE.hero && !RM) PAGE.hero(tl, FX);
      sections(); if (!SOFT && !film) hero3d(); pins(); reveals(); misc(); toasts();
      quicknav(); (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => { fitMobile(); swipes(); fitWords(); setTimeout(() => { fitMobile(); fitWords(); }, 1800); });
      addEventListener('resize', () => { clearTimeout(fitWords._t); fitWords._t = setTimeout(fitWords, 250); });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    // Corto de entrada: sustituye a la apertura y se queda como hero en bucle
    if (film) {
      if (op) op.remove();
      const go = () => window.FXCINE.mount(film, FX, { intro: !RM && qs.get('intro') !== '0' && CFG.tema.intro !== false && !BIZ.sinCorto, story: !BIZ.sinHistoria && qs.get('historia') !== '0' }).then(afterOpening);
      (window.FXCINE ? Promise.resolve() : loadJS(BASE + 'fx-cine.js')).then(go).catch(afterOpening);
      return;
    }
    if (!wantIntro) { afterOpening(); return; }
    root.classList.add('opening');
    if (lenis) lenis.stop();
    scrollTo(0, 0);
    const skip = document.createElement('button'); skip.className = 'fx-skip'; skip.type = 'button'; skip.innerHTML = 'Saltar intro <kbd>Esc</kbd>';
    document.body.appendChild(skip);
    let done = false;
    const finish = () => { if (done) return; done = true; skip.remove(); removeEventListener('keydown', onKey); afterOpening(); };
    const tl = gsap.timeline({ onComplete: finish });
    const onKey = e => { if (e.key === 'Escape') tl.progress(1); };
    skip.addEventListener('click', () => tl.progress(1));
    addEventListener('keydown', onKey);
    PAGE.opening(tl, FX);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
