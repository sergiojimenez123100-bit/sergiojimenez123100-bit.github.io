/* =========================================================
   FX · Mapa 3D moderno (MapLibre + OpenFreeMap, sin claves)
   - Edificios en 3D, colores tomados de la marca de cada web
   - Vuelo de cámara al entrar, giro lento, marcador con pulso
   - «¿A cuánto estoy?» con la ubicación del visitante + botones para llegar
   Estilos (BIZ.mapa.estilo o CFG.tema.mapa): auto · oscuro · claro · color · calles
   ========================================================= */
(() => {
  const ML_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js';
  const ML_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  const STYLES = { oscuro: 'dark', claro: 'positron', color: 'positron', calles: 'liberty' };
  const MADRID = [-3.7038, 40.4168];

  const load = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  let libP = null;
  const lib = () => libP || (libP = (() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ML_CSS; document.head.appendChild(l); return load(ML_JS); })());

  // --- Colores ---
  const parse = c => {
    c = String(c).trim();
    if (c[0] === '#') { if (c.length === 4) c = '#' + [...c.slice(1)].map(x => x + x).join(''); return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
    const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  };
  const mix = (a, b, t) => { const A = parse(a), B = parse(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  const lum = c => { const [r, g, b] = parse(c); return (r * .299 + g * .587 + b * .114) / 255; };

  async function geocode(BIZ) {
    if (BIZ.lat && BIZ.lng) return [+BIZ.lng, +BIZ.lat];
    const q = BIZ.direccion || BIZ.zona; if (!q) return MADRID;
    const key = 'fxgeo:' + q;
    try { const c = JSON.parse(localStorage.getItem(key)); if (c) return c; } catch (e) {}
    try {
      const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q));
      const j = await r.json(); if (j[0]) { const p = [+j[0].lon, +j[0].lat]; try { localStorage.setItem(key, JSON.stringify(p)); } catch (e) {} return p; }
    } catch (e) {}
    return MADRID;
  }

  function recolor(map, mode, P) {
    if (mode === 'calles') return;
    const dark = mode === 'oscuro' || (mode === 'auto' && lum(P.bg) < .5);
    const base = dark ? mix(P.bg, '#000', .35) : mix(P.bg, '#fff', .45);
    const land = dark ? mix(P.bg, P.fg, .05) : mix(P.bg, '#fff', .2);
    const water = mode === 'color' ? mix(P.accent, P.bg, .55) : (dark ? mix(P.bg, P.accent, .18) : mix('#cfe3ef', P.accent, .12));
    const road = dark ? mix(P.bg, P.fg, .2) : mix(P.bg, P.fg, .12);
    const major = mix(P.accent, dark ? P.bg : '#fff', mode === 'color' ? .1 : .35);
    const park = dark ? mix(P.bg, '#3a6b4a', .25) : mix('#dfeedd', P.bg, .3);
    map.getStyle().layers.forEach(l => {
      const id = l.id, sl = l['source-layer'] || '';
      try {
        if (l.type === 'background') map.setPaintProperty(id, 'background-color', base);
        else if (l.type === 'fill' && sl === 'water') map.setPaintProperty(id, 'fill-color', water);
        else if (l.type === 'fill' && (sl === 'park' || /park|wood|grass/.test(id))) map.setPaintProperty(id, 'fill-color', park);
        else if (l.type === 'fill' && (sl === 'landuse' || sl === 'landcover')) map.setPaintProperty(id, 'fill-color', land);
        else if (l.type === 'fill' && sl === 'building') map.setLayoutProperty(id, 'visibility', 'none');
        else if (l.type === 'line' && sl === 'transportation') map.setPaintProperty(id, 'line-color', /motorway|trunk|primary/.test(id) ? major : road);
        else if (l.type === 'line' && sl === 'waterway') map.setPaintProperty(id, 'line-color', water);
        else if (l.type === 'symbol' && map.getLayoutProperty(id, 'text-field')) {
          map.setPaintProperty(id, 'text-color', dark ? mix(P.fg, P.bg, .3) : mix(P.fg, P.bg, .25));
          map.setPaintProperty(id, 'text-halo-color', base);
        }
      } catch (e) {}
    });
    return { dark, bld: dark ? mix(P.bg, P.fg, .14) : mix(P.bg, '#fff', .7), bldTop: dark ? mix(P.bg, P.fg, .3) : mix(P.bg, P.fg, .08) };
  }

  window.FXMAP = async function (el, FX) {
    const BIZ = FX.BIZ, cs = getComputedStyle(document.documentElement);
    const P = { bg: cs.getPropertyValue('--bg').trim() || '#111', fg: cs.getPropertyValue('--fg').trim() || '#eee', accent: cs.getPropertyValue('--accent').trim() || '#ff5a1f' };
    const mode = (FX.CFG.tema && FX.CFG.tema.mapa) || (BIZ.mapa && BIZ.mapa.estilo) || 'auto';
    const style = STYLES[mode] || (lum(P.bg) < .5 ? 'dark' : 'positron');
    el.classList.add(style === 'dark' ? 'fx-map-dark' : 'fx-map-light');
    const enc = encodeURIComponent(BIZ.direccion || BIZ.zona || 'Madrid');
    el.innerHTML = '<div class="fxm-canvas"></div>' +
      '<div class="fxm-card"><b>' + FX.esc(BIZ.nombre || '') + '</b><span>' + FX.esc(BIZ.direccion || BIZ.zona || '') + '</span><em class="fxm-dist"></em>' +
      '<div class="fxm-go"><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + enc + '">Google Maps</a><a target="_blank" rel="noopener" href="https://waze.com/ul?q=' + enc + '&navigate=yes">Waze</a><a target="_blank" rel="noopener" href="https://maps.apple.com/?daddr=' + enc + '">Apple</a></div></div>' +
      '<div class="fxm-tools"><button type="button" data-a="me" title="¿A cuánto estoy?">📍 ¿A cuánto estoy?</button><button type="button" data-a="3d" title="Vista 2D/3D">2D</button><button type="button" data-a="in" aria-label="Acercar">+</button><button type="button" data-a="out" aria-label="Alejar">−</button><button type="button" data-a="home" aria-label="Volver al negocio">◎</button></div>' +
      '<div class="fxm-hint">Ctrl + rueda para hacer zoom</div>';
    let center;
    try { [center] = await Promise.all([geocode(BIZ), lib()]); } catch (e) { el.classList.add('fx-map-fail'); el.querySelector('.fxm-canvas').innerHTML = '<a class="fxm-fallback" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + enc + '">Ver en Google Maps ↗</a>'; return; }
    if (!window.maplibregl) { el.classList.add('fx-map-fail'); return; }
    const map = new maplibregl.Map({
      container: el.querySelector('.fxm-canvas'), style: 'https://tiles.openfreemap.org/styles/' + style,
      center: [center[0] + .06, center[1] - .03], zoom: 11.2, pitch: 0, bearing: 0, attributionControl: { compact: true },
      cooperativeGestures: true, fadeDuration: 0
    });
    map.on('styleimagemissing', e => { if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) }); });
    let spin = null, is3d = true;
    map.on('load', () => {
      const C = recolor(map, mode, P) || { bld: '#d9d4cc', bldTop: '#c4beb4' };
      const src = Object.keys(map.getStyle().sources).find(k => map.getStyle().sources[k].type === 'vector');
      map.getStyle().layers.filter(l => l.type === 'fill-extrusion').forEach(l => map.setLayoutProperty(l.id, 'visibility', 'none'));
      map.addLayer({
        id: 'fx-3d', type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 13,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 8], 0, C.bld, 60, C.bldTop],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, ['coalesce', ['get', 'render_height'], 8]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': .92
        }
      });
      // Halo del negocio en el suelo
      map.addSource('fx-pt', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: center } } });
      map.addLayer({ id: 'fx-halo', type: 'circle', source: 'fx-pt', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 20, 17, 120], 'circle-color': P.accent, 'circle-opacity': .16, 'circle-blur': .6, 'circle-pitch-alignment': 'map' } });
      const mk = document.createElement('div'); mk.className = 'fxm-pin';
      mk.innerHTML = '<i></i><i></i><b><em>' + FX.esc(String(BIZ.nombre || '·').trim()[0] || '·') + '</em></b><span>' + FX.esc(BIZ.nombre || '') + '</span>';
      new maplibregl.Marker({ element: mk, anchor: 'bottom' }).setLngLat(center).addTo(map);
      // Vuelo de cámara cuando el mapa entra en pantalla
      const fly = () => map.flyTo({ center, zoom: 16.4, pitch: 62, bearing: -28, duration: FX.RM ? 0 : 4200, essential: true, curve: 1.6 });
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fly(); } }, { threshold: .35 });
      io.observe(el);
      map.once('moveend', () => { if (FX.RM) return; const rot = () => { if (!spin) return; map.rotateTo(map.getBearing() + 40, { duration: 24000, easing: t => t }); }; spin = true; map.on('moveend', () => spin && rot()); rot(); });
    });
    const stopSpin = () => { spin = false; map.stop(); };
    ['mousedown', 'touchstart', 'wheel'].forEach(ev => el.addEventListener(ev, stopSpin, { passive: true }));
    // Herramientas
    el.querySelector('.fxm-tools').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; stopSpin();
      const a = b.dataset.a;
      if (a === 'in') map.zoomIn(); else if (a === 'out') map.zoomOut();
      else if (a === 'home') map.flyTo({ center, zoom: 16.4, pitch: is3d ? 62 : 0, bearing: is3d ? -28 : 0, duration: 1800 });
      else if (a === '3d') { is3d = !is3d; b.textContent = is3d ? '2D' : '3D'; map.easeTo({ pitch: is3d ? 62 : 0, bearing: is3d ? -28 : 0, duration: 1200 }); }
      else if (a === 'me') {
        const out = el.querySelector('.fxm-dist');
        if (!navigator.geolocation) { out.textContent = 'Tu navegador no permite ubicarte'; return; }
        out.textContent = 'Buscando tu ubicación…';
        navigator.geolocation.getCurrentPosition(pos => {
          const me = [pos.coords.longitude, pos.coords.latitude];
          const R = 6371, dLat = (me[1] - center[1]) * Math.PI / 180, dLng = (me[0] - center[0]) * Math.PI / 180;
          const h = Math.sin(dLat / 2) ** 2 + Math.cos(center[1] * Math.PI / 180) * Math.cos(me[1] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
          const km = 2 * R * Math.asin(Math.sqrt(h)) * 1.3;
          const walk = Math.round(km / 4.8 * 60), car = Math.max(2, Math.round(km / 22 * 60));
          out.textContent = 'Estás a ' + km.toFixed(1).replace('.', ',') + ' km · ' + (walk < 60 ? walk + ' min andando' : car + ' min en coche');
          const line = { type: 'Feature', geometry: { type: 'LineString', coordinates: [me, center] } };
          if (map.getSource('fx-route')) map.getSource('fx-route').setData(line);
          else {
            map.addSource('fx-route', { type: 'geojson', data: line });
            map.addLayer({ id: 'fx-route', type: 'line', source: 'fx-route', paint: { 'line-color': P.accent, 'line-width': 4, 'line-dasharray': [1, 1.5] } });
            const me1 = document.createElement('div'); me1.className = 'fxm-me'; new maplibregl.Marker({ element: me1 }).setLngLat(me).addTo(map);
          }
          map.fitBounds([me, center], { padding: 90, pitch: 45, duration: 2000, maxZoom: 16 });
        }, () => { out.textContent = 'No hemos podido ubicarte'; }, { timeout: 8000 });
      }
    });
  };
})();
