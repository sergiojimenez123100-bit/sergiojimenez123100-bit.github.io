/* =========================================================
   FX · Cine: al entrar se ve un corto a pantalla completa (planos con
   movimiento de cámara, transiciones, títulos animados, destellos y
   sonido opcional) que termina convertido en el hero en bucle.
   Uso: <section class="hero fx-film"><script type="application/json">{
     "estilo":"cine|neon|calma|urbano", "ritmo":1, "claim":"…",
     "shots":[{"img":"id-unsplash|url","vid":"url.mp4","k":"Capítulo","t":"Título <em>clave</em>",
               "s":"subtítulo","n":{"v":1200,"l":"clientes","suf":"+"},"big":"PALABRA","cam":"in|out|l|r|u","fx":"zoom|flash|wipe|iris|glitch|fade","pos":"c|l|r"}]
   }</script> … .film-hud …</section>
   ========================================================= */
(() => {
  const g = () => window.gsap;
  const LOW = matchMedia('(max-width:760px)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const DPR = Math.min(devicePixelRatio || 1, LOW ? 1.4 : 2);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const STY = {
    cine: { fx: ['whip', 'flash', 'punch', 'zoom', 'whip', 'wipe'], loop: ['fade', 'zoom', 'wipe'], dur: 1.95, flare: true, beat: .47 },
    neon: { fx: ['glitch', 'punch', 'whip', 'flash', 'glitch', 'punch'], loop: ['glitch', 'fade', 'zoom'], dur: 1.75, flare: true, beat: .45 },
    urbano: { fx: ['whip', 'glitch', 'punch', 'whip', 'flash', 'glitch'], loop: ['wipe', 'fade', 'glitch'], dur: 1.8, flare: true, beat: .45 },
    calma: { fx: ['fade', 'fade', 'wipe', 'fade', 'fade', 'fade'], loop: ['fade'], dur: 3, flare: false }
  };
  const CAMS = ['in', 'l', 'out', 'r', 'u', 'in'];

  /* Sonido sintetizado (sin archivos): colchón grave, barridos y golpe final */
  const SND = {
    ctx: null, out: null, on: false,
    start() {
      if (!this.ctx) {
        const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
        const c = this.ctx = new C(); this.out = c.createGain(); this.out.gain.value = 0; this.out.connect(c.destination);
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(this.out);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .08; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
        [55, 82.4, 110.6].forEach((f, i) => { const o = c.createOscillator(), og = c.createGain(); o.type = i ? 'sawtooth' : 'sine'; o.frequency.value = f; o.detune.value = i * 7; og.gain.value = i ? .035 : .12; o.connect(og); og.connect(lp); o.start(); });
        const n = c.createBuffer(1, c.sampleRate, c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = n;
      }
      this.ctx.resume(); this.on = true; this.out.gain.setTargetAtTime(.55, this.ctx.currentTime, .4);
    },
    stop() { if (!this.ctx) return; this.on = false; this.out.gain.setTargetAtTime(0, this.ctx.currentTime, .15); },
    whoosh(len = .7) {
      if (!this.on) return; const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain();
      s.buffer = this.noise; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4200, t + len);
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(.32, t + len * .55); v.gain.linearRampToValueAtTime(0, t + len);
      s.connect(f); f.connect(v); v.connect(this.out); s.start(t); s.stop(t + len + .05);
    },
    kick() {
      if (!this.on) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), v = c.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .22); v.gain.setValueAtTime(.7, t); v.gain.exponentialRampToValueAtTime(.001, t + .3);
      o.connect(v); v.connect(this.out); o.start(t); o.stop(t + .32);
    },
    hit() {
      if (!this.on) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), v = c.createGain();
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(34, t + 1.2); v.gain.setValueAtTime(.9, t); v.gain.exponentialRampToValueAtTime(.001, t + 1.6);
      o.connect(v); v.connect(this.out); o.start(t); o.stop(t + 1.7); this.whoosh(.35);
    }
  };

  function splitWords(el) {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.append(' '); return; } const o = document.createElement('span'), i = document.createElement('span'); o.className = 'cw'; i.className = 'ci'; i.textContent = p; o.append(i); f.append(o); });
        c.replaceWith(f);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
    walk(el); return [...el.querySelectorAll('.ci')];
  }

  function mount(sec, FX, opt = {}) {
    let D = {}; try { D = JSON.parse(sec.querySelector('script[type="application/json"]').textContent); } catch (e) {}
    const S = STY[D.estilo] || STY.cine, R = D.ritmo || 1, BIZ = FX.BIZ || {}, root = document.documentElement, RM = FX.RM;
    const shots = (D.shots || []).filter(s => s.img || s.vid || s.wall || s.phone);
    sec.dataset.estilo = D.estilo || 'cine';
    const W = Math.min(2400, Math.round(innerWidth * DPR * 1.18 / 50) * 50), H = Math.min(2400, Math.round(innerHeight * DPR * 1.18 / 50) * 50);
    const url = id => !/^\d{9,13}-[0-9a-f]{10,14}$/.test(id) ? id : 'https://images.unsplash.com/photo-' + id + '?w=' + W + '&h=' + H + '&q=72&auto=format&fit=crop';

    const st = document.createElement('div'); st.className = 'cn-stage'; st.setAttribute('aria-hidden', 'true');
    st.innerHTML = '<div class="cn-shots"></div><div class="cn-leak"></div><div class="cn-vig"></div><div class="cn-grain"></div><div class="cn-flare"></div><div class="cn-edge"></div><div class="cn-flash"></div>' +
      '<div class="cn-titles"></div><div class="cn-card"></div><div class="cn-bar cn-t"></div><div class="cn-bar cn-b"></div>' +
      '<div class="cn-prog"><i></i></div><div class="cn-chap"><b></b><span></span></div>';
    sec.prepend(st);
    const $ = s => st.querySelector(s), SH = $('.cn-shots'), TT = $('.cn-titles'), CARD = $('.cn-card');

    // Controles (fuera del stage para poder pulsarlos)
    const ui = document.createElement('div'); ui.className = 'cn-ui';
    ui.innerHTML = '<div class="cn-dots">' + shots.map((s, i) => '<button type="button" aria-label="Plano ' + (i + 1) + '"><i></i></button>').join('') + '</div>' +
      '<div class="cn-btns"><button type="button" class="cn-snd" aria-pressed="false" aria-label="Activar sonido" data-cursor="Sonido"><span class="cn-eq"><i></i><i></i><i></i><i></i></span><em>Sonido</em></button>' +
      '<button type="button" class="cn-replay" data-cursor="Ver"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M8 5v14l11-7z"/></svg><em>Ver el corto</em></button>' +
      '<button type="button" class="cn-skip">Saltar <kbd>Esc</kbd></button></div>';
    sec.append(ui);
    const dots = [...ui.querySelectorAll('.cn-dots button')], snd = ui.querySelector('.cn-snd');
    snd.addEventListener('click', () => { SND.on ? SND.stop() : SND.start(); snd.setAttribute('aria-pressed', SND.on); snd.classList.toggle('on', SND.on); });

    /* Carga de planos */
    const cache = {}; let vidN = 0;
    function media(i) {
      if (cache[i]) return cache[i]; if (!shots[i]) return { p: Promise.resolve() };
      const s = shots[i]; let el, p;
      const imgs = (list, n) => Promise.all(list.slice(0, n).map(im => (im.decode ? im.decode() : Promise.resolve()).catch(() => {})));
      if (s.wall) {
        el = document.createElement('div'); el.className = 'cn-wall'; const W2 = s.wall.concat(s.wall);
        el.innerHTML = '<div class="cn-tilt">' + [0, 1, 2].map(r => '<div class="cn-row">' + W2.slice(r * 4, r * 4 + 9).map(u => '<img alt="" decoding="async" src="' + url(u) + '">').join('') + '</div>').join('') + '</div>';
        p = imgs([...el.querySelectorAll('img')], 6);
      } else if (s.phone) {
        el = document.createElement('div'); el.className = 'cn-dev';
        el.innerHTML = '<div class="cn-dbg" style="background-image:url(' + url(s.phone[1] || s.phone[0]) + ')"></div>' + s.phone.map((u, k) => '<figure class="cn-ph p' + k + '"><img alt="" src="' + url(u) + '"></figure>').join('');
        p = imgs([...el.querySelectorAll('img')], 3);
      } else if (s.vid && (!s.img || !LOW || (i > 0 && vidN++ < 1))) {
        el = document.createElement('video'); Object.assign(el, { muted: true, playsInline: true, loop: true, preload: 'auto' }); el.setAttribute('muted', ''); el.setAttribute('playsinline', '');
        // En móvil, la versión 360p de Mixkit (≈5 veces menos peso que la 720p)
        const lo = LOW ? s.vid.replace(/-720\.mp4$/, '-360.mp4') : s.vid, v = el;
        if (s.img) el.poster = url(s.img); el.src = lo;
        p = new Promise(r => { v.addEventListener('canplay', r, { once: true }); v.addEventListener('error', function fb() { if (v.src.endsWith('-360.mp4') && lo !== s.vid) { v.src = s.vid; return; } v.removeEventListener('error', fb); r(); }); });
      } else {
        el = new Image(); el.alt = ''; el.decoding = 'async'; el.src = url(s.img);
        p = (el.decode ? el.decode() : new Promise(r => el.onload = r)).catch(() => {});
      }
      return (cache[i] = { el, p });
    }
    const ready = i => Promise.race([media(i).p, wait(1400)]);

    /* Un plano: capa + cámara + transición */
    let cur = null, cam = null;
    function enter(i, fx, dur) {
      const G = g(), s = shots[i], m = media(i), L = document.createElement('div'); L.className = 'cn-shot';
      const el = m.el.tagName === 'VIDEO' ? m.el : m.el.cloneNode(true); L.append(el); SH.append(L);
      if (el.tagName === 'VIDEO') { el.currentTime = 0; el.play().catch(() => {}); }
      const c = s.cam || CAMS[i % CAMS.length], from = { in: { scale: 1.04 }, out: { scale: 1.24 }, l: { scale: 1.16, xPercent: 3.5 }, r: { scale: 1.16, xPercent: -3.5 }, u: { scale: 1.16, yPercent: 3.5 } }[c] || { scale: 1.1 },
        to = { in: { scale: 1.2 }, out: { scale: 1.04 }, l: { scale: 1.16, xPercent: -3.5 }, r: { scale: 1.16, xPercent: 3.5 }, u: { scale: 1.16, yPercent: -3.5 } }[c] || { scale: 1.02 };
      if (RM) { if (!s.wall && !s.phone) G.set(el, to); }
      else if (s.wall) { el.querySelectorAll('.cn-row').forEach((r, k) => G.fromTo(r, { xPercent: k % 2 ? -22 : -2 }, { xPercent: k % 2 ? -2 : -22, duration: dur + 1.8, ease: 'none' })); cam = G.fromTo(el, { scale: 1.18 }, { scale: 1, duration: dur + 1.4, ease: 'power1.out' }); }
      else if (s.phone) { cam = G.fromTo(el.querySelectorAll('.cn-ph'), { yPercent: k => 40 + k * 14, opacity: 0, rotate: k => (1 - k) * 8 }, { yPercent: k => (k - 1) * -5, opacity: 1, rotate: k => (k - 1) * 4, duration: 1.3, ease: 'expo.out', stagger: .14 }); G.fromTo(el.querySelectorAll('.cn-ph img'), { yPercent: 0 }, { yPercent: -6, duration: dur + 1.4, ease: 'none' }); }
      else { cam = G.fromTo(el, from, Object.assign({ duration: dur + 1.4, ease: 'none' }, to)); }
      const prev = cur; cur = L;
      const done = () => { if (prev && prev !== L) { const v = prev.querySelector('video'); if (v) v.pause(); prev.remove(); } };
      if (RM || !prev) { G.fromTo(L, { opacity: 0 }, { opacity: 1, duration: RM ? .01 : .9, ease: 'power2.out', onComplete: done }); return; }
      if (fx === 'glitch' && LOW) fx = 'flash';
      if (fx === 'zoom' && LOW) fx = 'punch';
      SND.whoosh(fx === 'fade' ? 1 : .6);
      const T = G.timeline({ onComplete: done });
      if (playing && S.beat) G.fromTo(SH, { x: (Math.random() - .5) * 22, y: (Math.random() - .5) * 12, rotate: (Math.random() - .5) * 1.2 }, { x: 0, y: 0, rotate: 0, duration: .55, ease: 'elastic.out(1,.35)' });
      if (fx === 'whip') {
        const bl = LOW ? 'none' : 'blur(18px)';
        T.to(prev, { xPercent: -40, filter: bl, duration: .34, ease: 'power3.in' }, 0)
          .fromTo(L, { xPercent: 45, filter: bl }, { xPercent: 0, filter: 'blur(0px)', duration: .55, ease: 'expo.out', clearProps: 'filter' }, .2);
      } else if (fx === 'punch') {
        T.to($('.cn-flash'), { opacity: .7, duration: .08 }).set(L, { opacity: 1 })
          .fromTo(L, { scale: 1.45 }, { scale: 1, duration: .75, ease: 'expo.out' }).to($('.cn-flash'), { opacity: 0, duration: .45 }, .1);
      } else if (fx === 'flash') {
        T.to($('.cn-flash'), { opacity: .95, duration: .12, ease: 'power2.in' }).set(L, { opacity: 1 }).to($('.cn-flash'), { opacity: 0, duration: .55, ease: 'power2.out' });
      } else if (fx === 'zoom') {
        T.to(prev, { scale: 1.35, opacity: 0, filter: 'blur(14px)', duration: .7, ease: 'power3.in' }, 0)
          .fromTo(L, { opacity: 0, scale: 1.3, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .9, ease: 'expo.out', clearProps: 'filter' }, .35);
      } else if (fx === 'wipe') {
        T.fromTo(L, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: .9, ease: 'expo.inOut' }, 0)
          .fromTo($('.cn-edge'), { left: '100%', opacity: 1 }, { left: '0%', duration: .9, ease: 'expo.inOut' }, 0).to($('.cn-edge'), { opacity: 0, duration: .3 });
      } else if (fx === 'iris') {
        T.fromTo(L, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1, ease: 'expo.inOut' }, 0);
      } else if (fx === 'glitch') {
        for (let k = 0; k < 7; k++) { const a = Math.random() * 70, b = Math.random() * (90 - a); T.set(L, { opacity: 1, clipPath: 'inset(' + a + '% 0 ' + b + '% 0)', x: (Math.random() - .5) * 60, filter: 'hue-rotate(' + (Math.random() * 180) + 'deg) saturate(2)' }, k * .05); }
        T.set(L, { clipPath: 'inset(0% 0 0% 0)', x: 0, filter: 'none' }, .36).fromTo(st, { x: -10 }, { x: 0, duration: .4, ease: 'elastic.out(1,.25)' }, 0);
      } else {
        T.fromTo(L, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.inOut' });
      }
      if (S.flare && !LOW) G.fromTo($('.cn-flare'), { top: (20 + Math.random() * 55) + '%', xPercent: -60, opacity: 0 }, { xPercent: 60, opacity: .9, duration: 1.1, ease: 'power2.out', yoyo: false, onComplete: () => G.to($('.cn-flare'), { opacity: 0, duration: .5 }) });
      G.to($('.cn-leak'), { '--lx': (15 + Math.random() * 70) + '%', '--ly': (15 + Math.random() * 70) + '%', opacity: S.beat ? .55 + Math.random() * .4 : .35 + Math.random() * .35, duration: S.beat ? 1.2 : 2, ease: 'sine.inOut' });
    }

    /* Títulos del corto */
    function title(i, dur) {
      const G = g(), s = shots[i]; if (!s.t && !s.n) return;
      const pos = s.pos || ['c', 'l', 'r', 'c', 'l', 'c'][i % 6], box = document.createElement('div'); box.className = 'cn-tt cn-' + pos;
      box.innerHTML = (s.big ? '<div class="cn-big">' + esc(s.big) + '</div>' : '') + (s.k ? '<p class="cn-k"><i></i><span>' + esc(s.k) + '</span></p>' : '') +
        (s.n ? '<div class="cn-n"><b>0</b><span>' + esc(s.n.l || '') + '</span></div>' : '') + (s.t ? '<h2 class="cn-h">' + s.t + '</h2>' : '') + (s.s ? '<p class="cn-s">' + esc(s.s) + '</p>' : '');
      TT.append(box);
      const ws = box.querySelector('.cn-h') ? splitWords(box.querySelector('.cn-h')) : [], T = G.timeline();
      if (s.big) T.fromTo(box.querySelector('.cn-big'), { xPercent: 12, opacity: 0 }, { xPercent: -12, opacity: 1, duration: dur + .6, ease: 'none' }, 0);
      if (s.k) T.from(box.querySelector('.cn-k i'), { scaleX: 0, duration: .7, ease: 'expo.out' }, .15).from(box.querySelector('.cn-k span'), { opacity: 0, letterSpacing: '.7em', duration: .9, ease: 'expo.out' }, .15);
      if (s.n) { const b = box.querySelector('.cn-n b'), o = { v: 0 }; T.from(box.querySelector('.cn-n'), { opacity: 0, y: 20, scale: S.beat ? 1.6 : 1, duration: S.beat ? .6 : .5, ease: S.beat ? 'back.out(2)' : 'power2.out' }, .1).to(o, { v: s.n.v, duration: Math.min(1.6, dur * .7), ease: 'expo.out', onUpdate: () => b.textContent = (s.n.pre || '') + Math.round(o.v).toLocaleString('es-ES') + (s.n.suf || '') }, .2); }
      if (ws.length && S.beat) {
        T.from(ws, { yPercent: 125, rotate: 9, skewX: -14, scale: 1.25, duration: .75, ease: 'back.out(1.7)', stagger: .055 }, .12)
          .fromTo(box.querySelector('.cn-h'), { textShadow: '-7px 0 rgba(255,0,90,.85), 7px 0 rgba(0,220,255,.85)' }, { textShadow: '0px 0 rgba(255,0,90,0), 0px 0 rgba(0,220,255,0)', duration: .7, ease: 'power2.out' }, .12)
          .to(box.querySelector('.cn-h'), { scale: 1.05, duration: dur, ease: 'none' }, .2);
      } else if (ws.length) T.from(ws, Object.assign({ yPercent: 115, rotate: 5, duration: 1, ease: 'expo.out', stagger: .07 }, LOW ? {} : { filter: 'blur(8px)' }), .25);
      if (s.s) T.from(box.querySelector('.cn-s'), { opacity: 0, y: 16, duration: .8, ease: 'power3.out' }, .6);
      T.to(box, { opacity: 0, y: -14, filter: LOW ? 'none' : 'blur(6px)', duration: .45, ease: 'power2.in', onComplete: () => box.remove() }, Math.max(1, dur - .3));
    }

    function chapter(i) {
      $('.cn-chap b').textContent = String(i + 1).padStart(2, '0'); $('.cn-chap span').textContent = shots[i].k || '';
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('seen', k < i); });
    }

    function nameCard(big, sub, out) {
      const G = g(); CARD.innerHTML = '<p class="cn-cz">' + esc(sub || '') + '</p><h2 class="cn-cn">' + esc(big) + '</h2>';
      const chars = [...CARD.querySelector('.cn-cn').textContent].map(ch => '<span class="cc">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>').join('');
      CARD.querySelector('.cn-cn').innerHTML = chars;
      const T = G.timeline(); G.set(CARD, { opacity: 1 });
      T.fromTo(CARD.querySelectorAll('.cc'), { opacity: 0, y: 30, filter: LOW ? 'none' : 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: { each: .045, from: 'center' } }, 0)
        .from(CARD.querySelector('.cn-cz'), { opacity: 0, letterSpacing: '.9em', duration: 1.2, ease: 'expo.out' }, .2);
      if (out) T.to(CARD, { opacity: 0, scale: 1.08, filter: LOW ? 'none' : 'blur(10px)', duration: .6, ease: 'power2.in' }, out);
      return T;
    }

    /* ---------- Corto de entrada ---------- */
    let playing = false, abort = false, loopT = 0, li = 0, visible = true;
    function lock(on) {
      root.classList.toggle('filming', on); sec.classList.toggle('is-intro', on);
      const L = FX.lenis; if (L) on ? L.stop() : L.start();
    }
    function stopAll() { const G = g(); if (preT) preT.progress(1); beat(false); G.killTweensOf(st.querySelectorAll('*')); TT.innerHTML = ''; G.set(CARD, { opacity: 0 }); G.set([$('.cn-edge'), $('.cn-flash'), $('.cn-flare')], { opacity: 0 }); }

    let preT = null, beatT = null, beatI = 0;
    /* Vídeo previo (~3,8 s), sutil: motas de luz que flotan, una línea fina que se abre desde el centro,
       un resplandor suave y, al apagarse la línea, aparece la marca */
    function preroll() {
      return new Promise(res => {
        const G = g(), cv = document.createElement('canvas'); cv.className = 'cn-pre'; st.insertBefore(cv, TT);
        const ctx = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, LOW ? 1.25 : 2), Wc = cv.width = st.clientWidth * dpr, Hc = cv.height = st.clientHeight * dpr;
        const acc = getComputedStyle(sec).getPropertyValue('--accent').trim() || '#cc9166', cx = Wc / 2, cy = Hc / 2;
        const M = Array.from({ length: LOW ? 34 : 60 }, () => ({ x: Math.random() * Wc, y: Math.random() * Hc, r: (.4 + Math.random() * 1.3) * dpr, v: (.08 + Math.random() * .25) * dpr, p: Math.random() * 6.28 }));
        const o = { line: 0, la: 0, glow: 0, dust: 0 }; let raf = 0, t = 0;
        const draw = () => {
          raf = requestAnimationFrame(draw); t += .016;
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, Wc, Hc);
          ctx.globalCompositeOperation = 'lighter';
          if (o.glow > .005) { const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(Wc, Hc) * .45); gr.addColorStop(0, acc); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = o.glow; ctx.fillStyle = gr; ctx.fillRect(0, 0, Wc, Hc); }
          for (const m of M) { m.y -= m.v; if (m.y < -4) m.y = Hc + 4; ctx.globalAlpha = o.dust * (.35 + .35 * Math.sin(t * 1.4 + m.p)); ctx.fillStyle = '#fff1d6'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill(); }
          if (o.la > .005) {
            const w = Wc * .34 * o.line, gl = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
            gl.addColorStop(0, 'rgba(0,0,0,0)'); gl.addColorStop(.3, acc); gl.addColorStop(.5, '#fff8ea'); gl.addColorStop(.7, acc); gl.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = o.la; ctx.fillStyle = gl; ctx.shadowColor = acc; ctx.shadowBlur = 18 * dpr; ctx.fillRect(cx - w, cy - .75 * dpr, w * 2, 1.5 * dpr); ctx.shadowBlur = 0;
          }
        };
        draw();
        const name = BIZ.nombre || D.logo || '', sub = (D.pre || (BIZ.zona ? BIZ.zona.split(',')[0] : '')) + ' · presenta';
        preT = G.timeline({ onComplete: () => { cancelAnimationFrame(raf); cv.remove(); preT = null; res(); } })
          .to(o, { dust: 1, duration: 1.2, ease: 'sine.out' }, 0)
          .to(o, { la: 1, duration: .5, ease: 'sine.out' }, .3)
          .to(o, { line: 1, duration: 1.7, ease: 'expo.inOut' }, .3)
          .to(o, { glow: .22, duration: 1.4, ease: 'sine.inOut' }, .9)
          .add(() => SND.whoosh(1.4), .4)
          .add(() => {
            const T = nameCard(name, sub, 1.35);
            G.fromTo(CARD.querySelector('.cn-cn'), { letterSpacing: '.18em', opacity: .0 }, { letterSpacing: '-.03em', opacity: 1, duration: 1.6, ease: 'expo.out' });
            return T;
          }, 1.85)
          .to(o, { la: 0, duration: .9, ease: 'sine.in' }, 1.9)
          .to(o, { glow: .1, duration: 1, ease: 'sine.out' }, 2.3)
          .to(o, { dust: 0, glow: 0, duration: .7, ease: 'sine.in' }, 3.1)
          .to(cv, { opacity: 0, duration: .5 }, 3.3);
      });
    }
    function beat(on) {
      const G = g(); if (beatT) { beatT.kill(); beatT = null; } clearInterval(beatI); G.set(SH, { scale: 1 });
      if (!on || !S.beat || RM) return;
      beatT = G.to(SH, { scale: 1.022, duration: S.beat / 2, yoyo: true, repeat: -1, ease: 'power1.out' });
      beatI = setInterval(() => SND.kick(), S.beat * 1000);
    }
    async function intro() {
      const G = g(); playing = true; abort = false; clearTimeout(loopT); lock(true); scrollTo(0, 0);
      const list = shots.slice(0, D.planos || 6), dur = (D.dur || S.dur) / R, total = 3.8 + list.length * dur + 2.6;
      G.set($('.cn-bar.cn-t'), { yPercent: 0 }); G.set($('.cn-bar.cn-b'), { yPercent: 0 }); G.set(st.querySelectorAll('.cn-prog, .cn-chap'), { opacity: 1 });
      const prog = G.fromTo($('.cn-prog i'), { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'none' });
      ready(0); ready(1);
      // Vídeo previo de 4 s: salto a la luz y la marca
      await preroll(); if (abort) return;
      beat(true);
      for (let i = 0; i < list.length; i++) {
        await ready(i); if (abort) return; ready(i + 1);
        enter(i, list[i].fx || S.fx[i % S.fx.length], dur); title(i, dur); chapter(i);
        await wait(dur * 1000); if (abort) return;
      }
      // Cierre: nombre + lema y el telón se abre al hero
      SND.hit();
      G.to($('.cn-flash'), { opacity: .5, duration: .1, yoyo: true, repeat: 1 });
      beat(false); nameCard(BIZ.nombre || D.logo || '', D.claim || BIZ.lema || '', 0);
      await wait(1900); if (abort) return;
      prog.kill(); finish();
    }
    function finish() {
      const G = g(); abort = true; playing = false; stopAll();
      G.to(CARD, { opacity: 0, scale: 1.06, duration: .7, ease: 'power2.in' });
      G.to($('.cn-bar.cn-t'), { yPercent: -101, duration: 1.2, ease: 'expo.inOut' }); G.to($('.cn-bar.cn-b'), { yPercent: 101, duration: 1.2, ease: 'expo.inOut' });
      G.to(st.querySelectorAll('.cn-prog, .cn-chap'), { opacity: 0, duration: .4, onComplete: () => G.set(st.querySelectorAll('.cn-prog, .cn-chap'), { clearProps: 'opacity' }) });
      lock(false); sec.classList.add('is-loop');
      if (!cur) enter(0, 'fade', 6);
      li = Math.max(0, dots.findIndex(d => d.classList.contains('on'))); chapter(li);
      loopT = setTimeout(loop, 4200);
      if (resolveIntro) { resolveIntro(); resolveIntro = null; }
    }
    /* ---------- Hero en bucle ---------- */
    function loop() {
      clearTimeout(loopT); if (playing || RM) return;
      if (!visible || document.hidden) { loopT = setTimeout(loop, 800); return; }
      li = (li + 1) % shots.length; ready(li).then(() => { if (playing) return; enter(li, S.loop[li % S.loop.length], 5.6); chapter(li); ready((li + 1) % shots.length); loopT = setTimeout(loop, 5600); });
    }
    dots.forEach((d, k) => d.addEventListener('click', () => { if (playing) return; clearTimeout(loopT); li = k; ready(k).then(() => { enter(k, 'zoom', 6); chapter(k); loopT = setTimeout(loop, 6000); }); }));
    ui.querySelector('.cn-skip').addEventListener('click', () => playing && finish());
    addEventListener('keydown', e => { if (e.key === 'Escape' && playing) finish(); });
    ui.querySelector('.cn-replay').addEventListener('click', () => { if (playing) return; stopAll(); if (FX.lenis) FX.lenis.scrollTo(0, { immediate: true }); intro(); });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) winOn = -1; if (opt.story) return; const v = cur && cur.querySelector('video'); if (v) visible ? v.play().catch(() => {}) : v.pause(); }).observe(sec);
    // Parallax suave del corto al bajar (sin modo historia)
    const par = !RM && !opt.story && g().to ? g().to(st, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } }) : null;

    /* ---------- Modo historia: el corto se queda fijo detrás de la página y reaparece entre secciones
       con los títulos del propio corto, que se escriben al bajar. La cámara se acerca con el scroll. ---------- */
    let winOn = -1;
    function showWin(i) {
      if (playing || i === winOn || !shots[i]) return; winOn = i; clearTimeout(loopT); li = i;
      ready(i).then(() => { if (playing || winOn !== i) return; enter(i, i % 2 ? 'zoom' : 'wipe', 7); chapter(i); ready((i + 1) % shots.length); });
    }
    function story() {
      if (sec._story || !window.ScrollTrigger) return; sec._story = true;
      const G = g(); root.classList.add('cn-story');
      if (par) { par.scrollTrigger && par.scrollTrigger.kill(); par.kill(); }
      document.body.insertBefore(st, document.body.firstChild); st.classList.add('cn-fixed'); G.set(st, { clearProps: 'transform' });
      const v0 = cur && cur.querySelector('video'); if (v0) v0.play().catch(() => {});
      // Las secciones tapan el corto; donde no hay sección, se ve
      const cards = [...sec.parentElement.children, ...document.querySelectorAll('body > footer')].filter(el => el !== sec && el !== st && !/^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName) && !el.classList.contains('cn-win'));
      cards.forEach(el => {
        const cs = getComputedStyle(el); if (cs.display === 'none' || /fixed|absolute|sticky/.test(cs.position)) return;
        if (cs.position === 'static') el.style.position = 'relative';
        if (cs.zIndex === 'auto') el.style.zIndex = 1;
        const bg = cs.backgroundColor; if (!bg || bg === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(bg)) el.style.backgroundColor = el.dataset.bg || 'var(--bg)';
      });
      trim(document);
      // Ventanas: entre secciones vuelve el corto con su capítulo
      const targets = cards.filter(el => el.tagName === 'SECTION' && el.offsetHeight > 260 && getComputedStyle(el).display !== 'none');
      const n = Math.min(shots.length - 1, targets.length - 1), wins = [];
      for (let k = 0; k < n; k++) {
        const t = targets[1 + k], s = shots[k + 1]; if (!t || !s) break;
        const w = document.createElement('div'); w.className = 'cn-win'; w.setAttribute('aria-hidden', 'true');
        const head = s.t || (s.n ? (s.n.pre || '') + Number(s.n.v).toLocaleString('es-ES') + (s.n.suf || '') + ' <em>' + esc(s.n.l || '') + '</em>' : '');
        w.innerHTML = '<div class="cn-wt"><span class="cn-wn">' + String(k + 2).padStart(2, '0') + ' / ' + String(shots.length).padStart(2, '0') + '</span>' + (s.k ? '<p class="cn-k"><i></i><span>' + esc(s.k) + '</span></p>' : '') + '<h2 class="cn-h">' + head + '</h2></div>';
        t.before(w); wins.push(w);
        const ws = splitWords(w.querySelector('.cn-h'));
        const wtl = RM ? null : G.timeline({ scrollTrigger: { trigger: w, start: 'top 90%', end: 'bottom 10%', scrub: .7 } });
        if (wtl && w.querySelector('.cn-k')) wtl.from(w.querySelector('.cn-k'), { opacity: 0, letterSpacing: '.9em', duration: .25 }, .04);
        if (wtl) wtl.from(w.querySelector('.cn-wn'), { yPercent: 80, opacity: 0, duration: .2 }, 0)
          .from(ws, { yPercent: 115, opacity: 0, rotate: 5, stagger: .035, duration: .25 }, .08)
          .to(w.querySelector('.cn-wt'), { opacity: 0, y: -70, scale: .96, duration: .22 }, .78);
        ScrollTrigger.create({ trigger: w, start: 'top 65%', end: 'bottom 35%', onToggle: e => { if (e.isActive) showWin(k + 1); } });
      }
      // La cámara acompaña: el corto se acerca poco a poco mientras bajas
      if (!RM) G.fromTo(SH, { scale: 1 }, { scale: 1.14, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
      // Solo se reproduce cuando se ve (ahorra batería)
      const io = new IntersectionObserver(es => {
        es.forEach(e => e.target._vis = e.isIntersecting);
        const any = [sec, ...wins].some(el => el._vis), v = cur && cur.querySelector('video');
        if (v) any ? v.play().catch(() => {}) : v.pause();
        st.classList.toggle('cn-dim', !any);
      });
      [sec, ...wins].forEach(el => io.observe(el));
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    let resolveIntro = null;
    if (!shots.length) return Promise.resolve();
    if (opt.intro && !RM) return new Promise(r => { resolveIntro = () => { if (opt.story) story(); r(); }; intro(); });
    enter(0, 'fade', 6); chapter(0); g().set(st.querySelectorAll('.cn-bar'), { yPercent: k => k ? 101 : -101 }); sec.classList.add('is-loop');
    if (opt.story) story();
    if (!RM) loopT = setTimeout(loop, 5200);
    return Promise.resolve();
  }

  /* Menos texto: fuera párrafos largos (el configurador, opiniones, formularios y contacto se respetan) */
  const KEEP = '.fx-studio, .fx-reviews, form, footer, .film-hud, .cn-win, .cn-stage, [data-horario], #contacto, .contact, .ct, .vx, .vx-info, .sd-panel, [role=dialog], .bot, .faq, nav, header, .receipt, [data-acc]';
  function trim(doc) {
    doc.querySelectorAll('main p, main li, main blockquote, body > section p, body > section li').forEach(p => {
      if (p.closest(KEEP) || p.querySelector('a.btn, button, input, b[data-count], [data-count]')) return;
      const n = (p.textContent || '').trim().split(/\s+/).length;
      if (n > 10 || (n > 5 && /(^|\s|-)(lead|intro|sub|desc|muted|note)(\s|-|$)/.test(p.className))) p.classList.add('cn-cut');
    });
  }

  window.FXCINE = { mount, SND };
})();
