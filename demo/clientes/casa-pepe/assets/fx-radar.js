/* =========================================================
   FX · Mapa radar limpio (MapLibre + OpenFreeMap, sin claves)
   Mapa real muy apagado con los colores de la marca, anillos de 100/250/500 m
   con minutos andando, un barrido suave que ilumina lo que hay cerca
   (metro, bus, parking, parques, lugares: BIZ.cerca, lo calcula el robot)
   y una lista ordenada por distancia. Tocar un punto traza la línea, da
   metros y minutos y el botón para ir. «¿A cuánto estoy yo?» con la ubicación.
   ========================================================= */
(() => {
  const ML_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js';
  const ML_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  const T = { metro: ['Metro', '🚇', '#3b82f6'], bus: ['Bus', '🚌', '#f59e0b'], parking: ['Parking', '🅿️', '#a78bfa'], parque: ['Parques', '🌳', '#22c55e'], lugar: ['Lugares', '🏛️', '#ec4899'] };
  const WALK = 80, MADRID = [-3.7038, 40.4168];
  const load = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  let libP = null;
  const lib = () => libP || (libP = (() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ML_CSS; document.head.appendChild(l); return load(ML_JS); })());
  const parse = c => { c = String(c).trim(); if (c[0] === '#') { if (c.length === 4) c = '#' + [...c.slice(1)].map(x => x + x).join(''); return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); } const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128]; };
  const mix = (a, b, t) => { const A = parse(a), B = parse(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  const lum = c => { const [r, g, b] = parse(c); return (r * .299 + g * .587 + b * .114) / 255; };
  const dest = (ll, d, b) => { const R = 6371000, la = ll[1] * Math.PI / 180, lo = ll[0] * Math.PI / 180, br = b * Math.PI / 180, a = d / R, la2 = Math.asin(Math.sin(la) * Math.cos(a) + Math.cos(la) * Math.sin(a) * Math.cos(br)); return [(lo + Math.atan2(Math.sin(br) * Math.sin(a) * Math.cos(la), Math.cos(a) - Math.sin(la) * Math.sin(la2))) * 180 / Math.PI, la2 * 180 / Math.PI]; };
  const dist = (a, b) => { const r = x => x * Math.PI / 180, h = Math.sin(r(b[1] - a[1]) / 2) ** 2 + Math.cos(r(a[1])) * Math.cos(r(b[1])) * Math.sin(r(b[0] - a[0]) / 2) ** 2; return 2 * 6371000 * Math.asin(Math.sqrt(h)); };
  const fmt = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km';
  const mins = m => Math.max(1, Math.round(m / WALK));

  const CSS = `.fxr{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;font:14px/1.4 var(--font-b,system-ui);color:var(--r-fg)}
.fxr.wide{grid-template-columns:minmax(0,1fr) 290px;grid-template-rows:minmax(0,1fr)}
.fxr>*{min-width:0}
.fxr-mapw{position:relative;overflow:hidden}
.fxr-map{position:absolute!important;inset:0}
.fxr-rad{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
.fxr-sweep{position:absolute;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 84%,color-mix(in srgb,var(--accent) 14%,transparent) 97%,color-mix(in srgb,var(--accent) 55%,transparent) 99.6%,transparent 100%)}
.fxr-lab{position:absolute;transform:translate(-50%,-50%);font:500 10.5px ui-monospace,Menlo,monospace;color:var(--r-mut);background:color-mix(in srgb,var(--r-bg) 85%,transparent);padding:2px 7px;border-radius:99px;white-space:nowrap;box-shadow:0 0 0 1px var(--r-line)}
.fxr-pin{position:absolute;width:18px;height:18px;margin:-9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 28%,transparent),0 4px 14px rgba(0,0,0,.35)}
.fxr-pin::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--accent);animation:fxrPing 2.4s ease-out infinite}
@keyframes fxrPing{to{transform:scale(2.6);opacity:0}}
.fxr-pin b{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);white-space:nowrap;font:600 12px var(--font-b,system-ui);color:var(--r-fg);background:var(--r-panel);padding:5px 10px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.fxr-pt{position:absolute;z-index:3;width:28px;height:28px;margin:-14px;border-radius:50%;display:grid;place-items:center;font-size:13px;line-height:1;background:var(--r-panel);box-shadow:0 0 0 1px var(--r-line),0 4px 12px rgba(0,0,0,.25);cursor:pointer;transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,opacity .4s;pointer-events:auto;border:0;padding:0}
.fxr-pt::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1.5px solid var(--c);opacity:0;transform:scale(.6);transition:all .6s}
.fxr-pt.lit::after{opacity:.9;transform:scale(1.25)}
.fxr-pt.lit{box-shadow:0 0 0 2px var(--c),0 0 18px color-mix(in srgb,var(--c) 60%,transparent)}
.fxr-pt.sel{transform:scale(1.25);box-shadow:0 0 0 2.5px var(--c),0 6px 18px rgba(0,0,0,.3)}
.fxr-pt.off{opacity:0;pointer-events:none;transform:scale(.4)}
.fxr-tip{position:absolute;z-index:4;transform:translate(-50%,calc(-100% - 22px));background:var(--r-panel);color:var(--r-fg);padding:9px 12px;border-radius:12px;font-size:12.5px;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.3);pointer-events:none;opacity:0;transition:opacity .3s}
.fxr-tip.on{opacity:1}.fxr-tip b{display:block;font-size:13px}.fxr-tip span{color:var(--r-mut)}
.fxr-tools{position:absolute;z-index:4;left:12px;top:12px;display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;max-width:calc(100% - 24px)}
.fxr-tools::-webkit-scrollbar{display:none}
.fxr-tools button{flex:none}
.fxr-tools button,.fxr-me{display:flex;align-items:center;gap:6px;border:0;padding:7px 11px;border-radius:99px;background:var(--r-panel);color:var(--r-fg);font:500 12px var(--font-b,system-ui);cursor:pointer;box-shadow:0 0 0 1px var(--r-line),0 4px 12px rgba(0,0,0,.18);transition:opacity .3s}
.fxr-tools button i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.fxr-tools button.off{opacity:.45}
.fxr-me{position:absolute;z-index:4;right:12px;bottom:12px;padding:9px 13px;font-weight:600;background:var(--r-fg);color:var(--r-bg)}
.fxr-list{display:flex;flex-direction:column;background:var(--r-panel);border-top:1px solid var(--r-line);min-height:0}
.fxr.wide .fxr-list{border-top:0;border-left:1px solid var(--r-line)}
.fxr-head{padding:14px 14px 8px}
.fxr-head b{display:block;font-size:15px}
.fxr-head span{color:var(--r-mut);font-size:12px}
.fxr-items{display:flex;gap:6px;overflow-x:auto;padding:0 10px 8px;scrollbar-width:none;scroll-snap-type:x mandatory}
.fxr.wide .fxr-items{flex-direction:column;overflow-x:hidden;overflow-y:auto;gap:2px;scrollbar-width:thin;flex:1}
.fxr-items::-webkit-scrollbar{display:none}
.fxr-it{flex:none;width:230px;display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;border:0;background:color-mix(in srgb,var(--r-fg) 4%,transparent);color:inherit;text-align:left;padding:9px 10px;border-radius:14px;cursor:pointer;font:inherit;scroll-snap-align:start;transition:background .25s}
.fxr.wide .fxr-it{width:auto;background:none}
.fxr-it:hover,.fxr-it.sel{background:color-mix(in srgb,var(--r-fg) 8%,transparent)}
.fxr-it .ic{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;background:color-mix(in srgb,var(--c) 18%,transparent)}
.fxr-it b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fxr-it small{color:var(--r-mut);font-size:11.5px}
.fxr-it .d{text-align:right;font:500 12px ui-monospace,Menlo,monospace}
.fxr-it .d em{display:block;font-style:normal;color:var(--r-mut);font-size:11px}
.fxr-it[hidden]{display:none}
.fxr-go{display:flex;gap:6px;padding:4px 10px 12px}
.fxr a,.fxr button{text-transform:none;letter-spacing:normal;line-height:1.3}
.fxr-go a{display:block;flex:1;text-align:center;padding:10px 8px;border-radius:12px;background:color-mix(in srgb,var(--r-fg) 7%,transparent);color:var(--r-fg);font:600 12.5px var(--font-b,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fxr-go a:first-child{flex:2;background:var(--accent);color:var(--btn-ink,#000)}
.fxr .maplibregl-ctrl-attrib{font-size:10px;opacity:.6}
.fxr .maplibregl-cooperative-gesture-screen{font:500 14px var(--font-b,system-ui)}`;

  async function geocode(BIZ) {
    if (BIZ.lat && BIZ.lng) return [+BIZ.lng, +BIZ.lat];
    const q = BIZ.direccion || BIZ.zona; if (!q) return MADRID;
    try { const c = JSON.parse(localStorage.getItem('fxgeo:' + q)); if (c) return c; } catch (e) {}
    try { const j = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q))).json(); if (j[0]) { const p = [+j[0].lon, +j[0].lat]; try { localStorage.setItem('fxgeo:' + q, JSON.stringify(p)); } catch (e) {} return p; } } catch (e) {}
    return MADRID;
  }

  window.FXRADAR = async function (el, FX) {
    if (!document.getElementById('fxr-css')) { const s = document.createElement('style'); s.id = 'fxr-css'; s.textContent = CSS; document.head.appendChild(s); }
    const BIZ = FX.BIZ, esc = FX.esc, cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg').trim() || '#111', fg = cs.getPropertyValue('--fg').trim() || '#eee', acc = cs.getPropertyValue('--accent').trim() || '#ff5a1f';
    const dark = lum(bg) < .5;
    // Paleta del mapa y del panel sacada de la marca, muy apagada para que destaque el radar
    const P = dark
      ? { bg: mix(bg, '#000', .25), land: mix(bg, '#000', .2), water: mix(bg, acc, .12), park: mix(bg, '#2f5a3c', .2), bld: mix(bg, fg, .05), road: mix(bg, fg, .1), major: mix(bg, fg, .16), text: mix(bg, fg, .38), ring: mix(bg, fg, .3), panel: mix(bg, fg, .06) }
      : { bg: mix(bg, '#fff', .35), land: mix(bg, '#fff', .45), water: mix('#d6e3ea', acc, .1), park: mix('#e3eadb', bg, .3), bld: mix(bg, fg, .07), road: '#ffffff', major: '#ffffff', text: mix(fg, bg, .55), ring: mix(bg, fg, .28), panel: '#ffffff' };
    el.style.minHeight = Math.max(460, parseFloat(el.style.minHeight) || 0) + 'px';
    el.style.background = P.bg;
    Object.entries({ '--r-bg': P.bg, '--r-fg': dark ? mix(fg, '#fff', .2) : mix(fg, '#000', .2), '--r-mut': dark ? mix(fg, bg, .45) : mix(fg, bg, .45), '--r-panel': P.panel, '--r-line': dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.08)' }).forEach(([k, v]) => el.style.setProperty(k, v));
    const cerca = (BIZ.cerca || []).filter(p => T[p.t] && p.d > 0).sort((a, b) => a.d - b.d).slice(0, 12);
    const types = [...new Set(cerca.map(p => p.t))];
    const far = cerca.length ? cerca[cerca.length - 1].d : 400, RINGS = far > 620 ? [100, 300, 600, 1000] : [100, 250, 500];
    const name = String(BIZ.nombre || '').trim(), addr = BIZ.direccion || BIZ.zona || '', enc = encodeURIComponent(addr || 'Madrid');
    el.innerHTML = '<div class="fxr"><div class="fxr-mapw"><div class="fxr-map"></div><div class="fxr-rad"></div>' +
      (types.length > 1 ? '<div class="fxr-tools">' + types.map(k => '<button type="button" data-k="' + k + '" style="--c:' + T[k][2] + '"><i></i>' + T[k][0] + '</button>').join('') + '</div>' : '') +
      '<button type="button" class="fxr-me">📍 ¿A cuánto estoy yo?</button></div>' +
      '<aside class="fxr-list"><div class="fxr-head"><b>' + (cerca.length ? 'Qué hay cerca' : esc(name)) + '</b><span>' + (cerca.length ? 'A pie desde la puerta · minutos aproximados' : esc(addr)) + '</span></div>' +
      '<div class="fxr-items">' + cerca.map((p, i) => '<button type="button" class="fxr-it" data-i="' + i + '" style="--c:' + T[p.t][2] + '"><span class="ic">' + T[p.t][1] + '</span><span><b>' + esc(p.n) + '</b><small>' + T[p.t][0] + '</small></span><span class="d">' + fmt(p.d) + '<em>' + mins(p.d) + ' min</em></span></button>').join('') + '</div>' +
      '<div class="fxr-go"><a class="fxr-gm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + enc + '">Cómo llegar</a><a target="_blank" rel="noopener" href="https://waze.com/ul?q=' + enc + '&navigate=yes">Waze</a></div></aside></div>';
    const root = el.querySelector('.fxr'), rad = el.querySelector('.fxr-rad'), gm = el.querySelector('.fxr-gm');
    new ResizeObserver(() => root.classList.toggle('wide', el.clientWidth >= 760)).observe(el);
    let center;
    try { [center] = await Promise.all([geocode(BIZ), lib()]); } catch (e) { el.classList.add('fx-map-fail'); return; }
    if (!window.maplibregl) { el.classList.add('fx-map-fail'); return; }
    cerca.forEach(p => p.ll = dest(center, p.d, p.b));
    const map = new maplibregl.Map({ container: el.querySelector('.fxr-map'), style: 'https://tiles.openfreemap.org/styles/' + (dark ? 'dark' : 'positron'), center, zoom: 15.5, attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, cooperativeGestures: true, fadeDuration: 0,
      locale: { 'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl + rueda para acercar el mapa', 'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + rueda para acercar el mapa', 'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa' } });
    map.touchZoomRotate.disableRotation();
    new ResizeObserver(() => { map.resize(); place(); }).observe(el.querySelector('.fxr-mapw'));
    let sel = null, me = null, hidden = new Set();
    const ring = r => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: Array.from({ length: 121 }, (_, i) => dest(center, r, i * 3)) } });
    map.on('load', () => {
      const at = el.querySelector('.maplibregl-ctrl-attrib'); if (at) at.classList.remove('maplibregl-compact-show');
      map.getStyle().layers.forEach(l => { const id = l.id, sl = l['source-layer'] || ''; try {
        if (l.type === 'background') map.setPaintProperty(id, 'background-color', P.bg);
        else if (l.type === 'fill' && sl === 'water') map.setPaintProperty(id, 'fill-color', P.water);
        else if (l.type === 'fill' && (sl === 'park' || /park|wood|grass/.test(id))) map.setPaintProperty(id, 'fill-color', P.park);
        else if (l.type === 'fill' && (sl === 'landuse' || sl === 'landcover')) map.setPaintProperty(id, 'fill-color', P.land);
        else if (l.type === 'fill' && sl === 'building') { map.setPaintProperty(id, 'fill-color', P.bld); map.setPaintProperty(id, 'fill-outline-color', P.bld); }
        else if (l.type === 'line' && sl === 'transportation') map.setPaintProperty(id, 'line-color', /motorway|trunk|primary/.test(id) ? P.major : P.road);
        else if (l.type === 'line' || l.type === 'fill-extrusion') map.setLayoutProperty(id, 'visibility', 'none');
        else if (l.type === 'symbol') { if (/transportation_name|road/.test(id)) { map.setPaintProperty(id, 'text-color', P.text); map.setPaintProperty(id, 'text-halo-color', P.bg); } else map.setLayoutProperty(id, 'visibility', 'none'); }
      } catch (e) {} });
      map.addSource('fxr-rings', { type: 'geojson', data: { type: 'FeatureCollection', features: RINGS.map(ring) } });
      map.addLayer({ id: 'fxr-rings', type: 'line', source: 'fxr-rings', paint: { 'line-color': P.ring, 'line-width': 1.2, 'line-dasharray': [2, 3] } });
      map.addSource('fxr-link', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'fxr-link', type: 'line', source: 'fxr-link', paint: { 'line-color': acc, 'line-width': 2.5, 'line-dasharray': [1, 1.6] }, layout: { 'line-cap': 'round' } });
      const b = new maplibregl.LngLatBounds(); [0, 90, 180, 270].forEach(a => b.extend(dest(center, RINGS[RINGS.length - 1], a))); map.fitBounds(b, { padding: 26, duration: 0 });
      overlay();
    });
    map.on('move', place); map.on('resize', place);
    function overlay() {
      rad.innerHTML = (FX.RM ? '' : '<div class="fxr-sweep"></div>') + RINGS.map(r => '<span class="fxr-lab" data-r="' + r + '">' + fmt(r) + ' · ' + mins(r) + ' min</span>').join('') + '<div class="fxr-pin"><b>' + esc(name) + '</b></div><div class="fxr-tip"></div>';
      cerca.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'fxr-pt'; b.style.setProperty('--c', T[p.t][2]); b.textContent = T[p.t][1]; b.setAttribute('aria-label', p.n + ', ' + fmt(p.d)); b.onclick = () => select(p); p.el = b; rad.appendChild(b); });
      place();
    }
    function place() {
      if (!rad.firstChild || !center) return;
      const c = map.project(center), e = map.project(dest(center, RINGS[RINGS.length - 1], 90)), R = Math.abs(e.x - c.x), sw = rad.querySelector('.fxr-sweep'), pin = rad.querySelector('.fxr-pin');
      if (sw) Object.assign(sw.style, { left: c.x - R + 'px', top: c.y - R + 'px', width: 2 * R + 'px', height: 2 * R + 'px' });
      pin.style.left = c.x + 'px'; pin.style.top = c.y + 'px';
      rad.querySelectorAll('.fxr-lab').forEach(l => { const q = map.project(dest(center, +l.dataset.r, 0)); l.style.left = q.x + 'px'; l.style.top = q.y + 'px'; });
      cerca.forEach(p => { if (!p.el) return; const q = map.project(p.ll); p.el.style.left = q.x + 'px'; p.el.style.top = q.y + 'px'; });
      if (me && me.el) { const q = map.project(me.ll); me.el.style.left = q.x + 'px'; me.el.style.top = q.y + 'px'; }
      const tp = rad.querySelector('.fxr-tip'); if (tp && tp._ll) { const q = map.project(tp._ll); tp.style.left = q.x + 'px'; tp.style.top = q.y + 'px'; }
    }
    // Barrido lento (solo cuando el mapa se ve): ilumina cada punto al pasar
    let vis = false, t0 = performance.now();
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) loop(); }).observe(el);
    function loop() { if (!vis || FX.RM) return; const sw = rad.querySelector('.fxr-sweep'); if (sw) { const a = ((performance.now() - t0) / 7000 * 360) % 360; sw.style.transform = 'rotate(' + a + 'deg)'; cerca.forEach(p => p.el && p.el.classList.toggle('lit', (a - p.b + 360) % 360 < 50)); } requestAnimationFrame(loop); }
    function tip(ll, html) { const tp = rad.querySelector('.fxr-tip'); if (!tp) return; tp._ll = ll; if (!ll) { tp.classList.remove('on'); return; } tp.innerHTML = html; tp.classList.add('on'); place(); }
    function link(ll) { const s = map.getSource('fxr-link'); if (s) s.setData({ type: 'FeatureCollection', features: ll ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [center, ll] } }] : [] }); }
    function select(p) {
      sel = p; cerca.forEach(x => x.el && x.el.classList.toggle('sel', x === p)); el.querySelectorAll('.fxr-it').forEach(it => it.classList.toggle('sel', p && cerca[+it.dataset.i] === p));
      if (!p) { link(null); tip(null); gm.textContent = 'Cómo llegar'; gm.href = 'https://www.google.com/maps/dir/?api=1&destination=' + enc; return; }
      link(p.ll); tip(p.ll, '<b>' + T[p.t][1] + ' ' + esc(p.n) + '</b><span>' + fmt(p.d) + ' · ' + mins(p.d) + ' min andando</span>');
      gm.textContent = 'Ir desde ' + p.n + ' · ' + mins(p.d) + ' min'; gm.href = 'https://www.google.com/maps/dir/?api=1&origin=' + p.ll[1] + ',' + p.ll[0] + '&destination=' + center[1] + ',' + center[0] + '&travelmode=walking';
      const it = el.querySelector('.fxr-it.sel'); if (it) it.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
    el.querySelector('.fxr-items').addEventListener('click', e => { const b = e.target.closest('.fxr-it'); if (!b) return; const p = cerca[+b.dataset.i]; select(p); map.easeTo({ center: [(center[0] + p.ll[0]) / 2, (center[1] + p.ll[1]) / 2], duration: 700 }); });
    const tools = el.querySelector('.fxr-tools');
    if (tools) tools.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k; hidden.has(k) ? hidden.delete(k) : hidden.add(k); b.classList.toggle('off', hidden.has(k)); cerca.forEach((p, i) => { if (p.el) p.el.classList.toggle('off', hidden.has(p.t)); el.querySelector('.fxr-it[data-i="' + i + '"]').hidden = hidden.has(p.t); }); if (sel && hidden.has(sel.t)) select(null); });
    el.querySelector('.fxr-me').addEventListener('click', ev => {
      const btn = ev.currentTarget; if (!navigator.geolocation) { btn.textContent = 'Tu navegador no permite ubicarte'; return; }
      btn.textContent = 'Buscando…';
      navigator.geolocation.getCurrentPosition(pos => {
        const ll = [pos.coords.longitude, pos.coords.latitude], m = dist(ll, center) * 1.25; select(null);
        me = me || { el: Object.assign(document.createElement('div'), { className: 'fxr-pt' }) }; me.ll = ll; me.el.style.setProperty('--c', '#0ea5e9'); me.el.textContent = '🧍'; rad.appendChild(me.el);
        link(ll); tip(ll, '<b>Estás a ' + fmt(m) + '</b><span>' + (m < 2500 ? mins(m) + ' min andando' : 'unos ' + Math.max(5, Math.round(m / 350)) + ' min en coche o transporte') + '</span>');
        gm.textContent = 'Cómo llegar desde aquí'; gm.href = 'https://www.google.com/maps/dir/?api=1&origin=' + ll[1] + ',' + ll[0] + '&destination=' + center[1] + ',' + center[0] + '&travelmode=' + (m < 2500 ? 'walking' : 'transit');
        const b = new maplibregl.LngLatBounds(); b.extend(ll); b.extend(center); map.fitBounds(b, { padding: 70, maxZoom: 16, duration: 1200 }); btn.textContent = '📍 ¿A cuánto estoy yo?';
      }, () => { btn.textContent = 'No hemos podido ubicarte'; setTimeout(() => btn.textContent = '📍 ¿A cuánto estoy yo?', 2500); }, { timeout: 8000 });
    });
  };
})();
