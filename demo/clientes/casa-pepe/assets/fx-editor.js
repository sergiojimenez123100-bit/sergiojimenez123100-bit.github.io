/* =========================================================
   FX · Personaliza tu web
   Panel para que el cliente cambie su web en directo:
   datos, colores, tipografía, cursor, animaciones, mapa, avisos,
   textos e imágenes (modo edición) y secciones visibles.
   Se guarda en este navegador y se descarga como .json para el robot.
   ========================================================= */
(() => {
  const FX = window.FX; if (!FX || window.FXE) return; window.FXE = true;
  const { $, $$, CFG, CFG_KEY, ED, BIZ, EDIT, clean, esc } = FX;
  const root = document.documentElement;
  const save = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify({ biz: CFG.biz, tema: CFG.tema, textos: CFG.textos, imagenes: CFG.imagenes, ocultos: CFG.ocultos })); return true; } catch (e) { alert('No caben más fotos en este navegador. Usa fotos más pequeñas o descarga la configuración.'); return false; } };
  const reload = (edit) => { const u = new URL(location.href); u.searchParams.delete('editar'); if (edit) u.searchParams.set('editar', '1'); u.searchParams.set('intro', '0'); u.hash = ''; location.href = u.toString(); };
  const FONTS = ['Fraunces', 'Playfair Display', 'DM Serif Display', 'Cormorant Garamond', 'Anton', 'Bebas Neue', 'Unbounded', 'Bricolage Grotesque', 'Space Grotesk', 'Sora', 'Caveat'];
  const SW = ['#ff6a1a', '#e63946', '#d4ff00', '#00b39b', '#2f5bff', '#8c1c2c', '#c9a86a', '#ff7a59', '#7c3aed', '#0ea5e9', '#16a34a', '#111111'];
  const css = document.createElement('style');
  css.textContent = `
.fxe-fab{position:fixed;left:16px;bottom:54px;z-index:400;display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:99px;background:#111;color:#fff;font:600 14px/1 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.2);cursor:pointer}
.fxe-fab i{font-style:normal;display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#ff6a1a,#7c3aed,#00b39b);}
.fxe-panel{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);z-index:410;background:#0f0f12;color:#eee;font:14px/1.45 system-ui,sans-serif;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .5s cubic-bezier(.7,0,.2,1);box-shadow:-20px 0 60px rgba(0,0,0,.4)}
.fxe-panel.on{transform:none}
.fxe-panel *{box-sizing:border-box;cursor:auto}
.fxe-panel button,.fxe-panel label,.fxe-panel a{cursor:pointer}
.fxe-h{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #26262c}
.fxe-h b{font-size:17px}.fxe-h small{display:block;color:#888;font-size:12px}
.fxe-x{background:#222;color:#fff;border:0;width:34px;height:34px;border-radius:50%;font-size:18px}
.fxe-tabs{display:flex;gap:4px;padding:10px 12px;border-bottom:1px solid #26262c}
.fxe-tabs button{flex:1;padding:9px 6px;border-radius:10px;border:0;background:transparent;color:#aaa;font:600 13px system-ui}
.fxe-tabs button.on{background:#222;color:#fff}
.fxe-body{flex:1;overflow:auto;padding:18px 20px 30px}
.fxe-sec{display:none}.fxe-sec.on{display:block}
.fxe-l{display:block;margin:0 0 12px}
.fxe-l span{display:block;font:600 12px system-ui;color:#999;margin-bottom:5px;letter-spacing:.02em}
.fxe-l input,.fxe-l textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #2c2c33;background:#18181c;color:#fff;font:14px system-ui;outline:none}
.fxe-l input:focus,.fxe-l textarea:focus{border-color:#7c3aed}
.fxe-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fxe-t{font:700 12px system-ui;letter-spacing:.12em;text-transform:uppercase;color:#7c7c88;margin:22px 0 10px}
.fxe-t:first-child{margin-top:0}
.fxe-sw{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.fxe-sw button{width:32px;height:32px;border-radius:50%;border:2px solid #0f0f12;outline:2px solid transparent;transition:transform .2s}
.fxe-sw button:hover{transform:scale(1.12)}
.fxe-sw button.on{outline-color:#fff}
.fxe-sw input{width:40px;height:34px;border:0;background:none;padding:0}
.fxe-opts{display:flex;flex-wrap:wrap;gap:6px}
.fxe-opts button{padding:9px 12px;border-radius:10px;border:1px solid #2c2c33;background:#18181c;color:#ddd;font:500 13px system-ui}
.fxe-opts button.on{background:#fff;color:#111;border-color:#fff}
.fxe-fonts button{font-size:16px}
.fxe-main{display:block;width:100%;margin-top:14px;padding:13px;border-radius:12px;border:0;background:linear-gradient(135deg,#7c3aed,#ff6a1a);color:#fff;font:700 15px system-ui}
.fxe-sec2{width:100%;margin-top:8px;padding:11px;border-radius:12px;border:1px solid #2c2c33;background:#18181c;color:#ddd;font:600 14px system-ui}
.fxe-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1f1f24}
.fxe-row span{max-width:75%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fxe-sw2{width:42px;height:24px;border-radius:99px;background:#333;border:0;position:relative}
.fxe-sw2::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s}
.fxe-sw2.on{background:#16a34a}.fxe-sw2.on::after{transform:translateX(18px)}
.fxe-note{color:#888;font-size:12.5px;margin:8px 0 0}
.fxe-bar{position:fixed;left:50%;top:14px;translate:-50% 0;z-index:420;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 18px;border-radius:16px;background:#111;color:#fff;font:500 14px system-ui;box-shadow:0 20px 50px rgba(0,0,0,.35);max-width:calc(100% - 24px);flex-wrap:wrap}
.fxe-bar button{padding:9px 14px;border-radius:10px;border:0;font:700 13px system-ui;cursor:pointer}
.fxe-bar .ok{background:#16a34a;color:#fff}.fxe-bar .no{background:#333;color:#fff}
html.fxe-edit [data-fxe-t]{outline:1.5px dashed rgba(124,58,237,.0);outline-offset:4px;transition:outline-color .2s;cursor:text!important}
html.fxe-edit [data-fxe-t]:hover{outline-color:rgba(124,58,237,.9)}
html.fxe-edit [data-fxe-t]:focus{outline:2px solid #7c3aed;background:rgba(124,58,237,.06)}
html.fxe-edit [data-fxe-i]{cursor:copy!important;outline:3px solid transparent;outline-offset:-3px;transition:outline-color .2s}
html.fxe-edit [data-fxe-i]:hover{outline-color:#ff6a1a}
.fxe-hide{position:absolute;right:14px;top:14px;z-index:30;padding:7px 11px;border-radius:99px;border:0;background:#111;color:#fff;font:600 12px system-ui;opacity:.0;transition:opacity .2s;cursor:pointer!important}
html.fxe-edit [data-fxe-b]{position:relative}
html.fxe-edit [data-fxe-b]:hover>.fxe-hide{opacity:1}
html.fxe-edit [data-fxe-b].fxe-off{opacity:.25;filter:grayscale(1)}
html.fxe-edit [data-fxe-b].fxe-off>.fxe-hide{opacity:1;background:#16a34a}
html.fxe-edit body{padding-top:0}
@media (max-width:760px){.fxe-fab{bottom:56px;left:12px;padding:0;width:46px;height:46px;justify-content:center;font-size:0}.fxe-fab i{width:46px;height:46px;font-size:18px}}
`;
  document.head.appendChild(css);

  /* ========== MODO EDICIÓN (?editar=1) ========== */
  if (EDIT) {
    root.classList.add('fxe-edit');
    const start = ED.texts.map(el => el.innerHTML), newImg = {}, hid = new Set(CFG.ocultos.map(Number));
    ED.texts.forEach((el, i) => { el.setAttribute('data-fxe-t', i); el.contentEditable = 'true'; el.spellcheck = false; });
    ED.imgs.forEach((el, i) => { el.setAttribute('data-fxe-i', i); el.title = 'Clic para cambiar esta foto'; });
    ED.blocks.forEach((el, i) => {
      el.setAttribute('data-fxe-b', i); el.style.display = '';
      if (hid.has(i)) el.classList.add('fxe-off');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fxe-hide'; b.textContent = hid.has(i) ? 'Mostrar sección' : 'Ocultar sección';
      b.onclick = e => { e.stopPropagation(); e.preventDefault(); const off = el.classList.toggle('fxe-off'); off ? hid.add(i) : hid.delete(i); b.textContent = off ? 'Mostrar sección' : 'Ocultar sección'; };
      el.prepend(b);
    });
    // Nada navega mientras editas
    document.addEventListener('click', e => {
      const im = e.target.closest('[data-fxe-i]');
      if (im) { e.preventDefault(); pick(im); return; }
      if (e.target.closest('a, button:not(.fxe-hide):not(.fxe-bar button)') && !e.target.closest('.fxe-bar')) e.preventDefault();
    }, true);
    document.addEventListener('submit', e => e.preventDefault(), true);
    // Pegar solo texto
    document.addEventListener('paste', e => { if (!e.target.closest('[data-fxe-t]')) return; e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text')); });
    function pick(img) {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = () => {
        const f = inp.files[0]; if (!f) return;
        const r = new FileReader(); r.onload = () => {
          const im = new Image(); im.onload = () => {
            const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
            c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            const url = c.toDataURL('image/jpeg', .8); img.src = url; img.removeAttribute('srcset'); newImg[img.dataset.fxeI] = url;
          }; im.src = r.result;
        }; r.readAsDataURL(f);
      };
      inp.click();
    }
    const bar = document.createElement('div'); bar.className = 'fxe-bar';
    bar.innerHTML = '<span>✏️ <b>Modo edición</b> · Haz clic en cualquier texto para escribir o en una foto para cambiarla. Pasa por una sección para ocultarla.</span><button type="button" class="ok">Guardar y ver</button><button type="button" class="no">Cancelar</button>';
    document.body.appendChild(bar);
    bar.querySelector('.no').onclick = () => reload(false);
    bar.querySelector('.ok').onclick = () => {
      ED.texts.forEach((el, i) => { if (el.innerHTML !== start[i]) CFG.textos[i] = clean(el.innerHTML); });
      Object.assign(CFG.imagenes, newImg);
      CFG.ocultos = [...hid];
      if (save()) reload(false);
    };
    return;
  }

  /* ========== PANEL ========== */
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'fxe-fab'; fab.innerHTML = '<i>✎</i>Personaliza esta web'; fab.setAttribute('data-cursor', 'Editar');
  const P = document.createElement('aside'); P.className = 'fxe-panel'; P.setAttribute('data-lenis-prevent', ''); P.setAttribute('aria-label', 'Personalizar la web');
  const T = CFG.tema, B = Object.assign({}, BIZ), H = B.horario || {};
  const field = (k, label, ph) => '<label class="fxe-l"><span>' + label + '</span><input data-b="' + k + '" value="' + esc(B[k] || '') + '" placeholder="' + esc(ph || '') + '"></label>';
  const days = [['lun', 'Lunes'], ['mar', 'Martes'], ['mie', 'Miércoles'], ['jue', 'Jueves'], ['vie', 'Viernes'], ['sab', 'Sábado'], ['dom', 'Domingo']];
  const opts = (k, list) => '<div class="fxe-opts" data-o="' + k + '">' + list.map(([v, l]) => '<button type="button" data-v="' + v + '" class="' + ((T[k] || list[0][0]) === v ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
  const cur = (getComputedStyle(root).getPropertyValue('--accent') || '').trim();
  const secName = el => { const h = el.querySelector('h2'); const t = (h && (h.getAttribute('aria-label') || h.textContent)) || el.id || el.className.split(' ')[0] || 'Sección'; return t.replace(/\s+/g, ' ').trim().slice(0, 48); };
  P.innerHTML = '<div class="fxe-h"><div><b>Personaliza tu web</b><small>Los cambios se ven al momento</small></div><button type="button" class="fxe-x" aria-label="Cerrar">×</button></div>' +
    '<div class="fxe-tabs"><button type="button" class="on" data-t="0">Negocio</button><button type="button" data-t="1">Estilo</button><button type="button" data-t="2">Contenido</button><button type="button" data-t="3">Guardar</button></div><div class="fxe-body">' +
    '<div class="fxe-sec on">' + '<p class="fxe-t">Tus datos</p>' + field('nombre', 'Nombre del negocio') + field('lema', 'Frase corta') + field('zona', 'Barrio / zona', 'Malasaña, Madrid') + field('direccion', 'Dirección completa (para el mapa)') +
      '<div class="fxe-g">' + field('telefono', 'Teléfono') + field('whatsapp', 'WhatsApp') + '</div>' + field('email', 'Email') + field('instagram', 'Instagram', '@tunegocio') +
      '<p class="fxe-t">Horario</p><div class="fxe-g">' + days.map(([k, l]) => '<label class="fxe-l"><span>' + l + '</span><input data-h="' + k + '" value="' + esc(H[k] || '') + '" placeholder="10:00-14:00, 17:00-20:00"></label>').join('') + '</div>' +
      '<p class="fxe-t">Avisos en vivo (uno por línea)</p><label class="fxe-l"><textarea rows="4" data-av aria-label="Avisos en vivo, uno por línea">' + esc((B.avisos || []).join('\n')) + '</textarea></label>' +
      '<button type="button" class="fxe-main" data-apply>Aplicar cambios</button></div>' +
    '<div class="fxe-sec"><p class="fxe-t">Color principal</p><div class="fxe-sw">' + SW.map(c => '<button type="button" style="background:' + c + '" data-c="' + c + '" aria-label="' + c + '"></button>').join('') + '<input type="color" value="' + (/^#/.test(cur) ? cur : '#ff6a1a') + '" aria-label="Elegir color"></div>' +
      '<p class="fxe-t">Tipografía de títulos</p><div class="fxe-opts fxe-fonts">' + ['<button type="button" data-f="" class="' + (T.fuente ? '' : 'on') + '">Original</button>'].concat(FONTS.map(f => '<button type="button" data-f="' + f + '" style="font-family:\'' + f + '\'" class="' + (T.fuente === f ? 'on' : '') + '">' + f + '</button>')).join('') + '</div>' +
      '<p class="fxe-t">Animaciones</p>' + opts('anim', [['completas', 'Completas'], ['suave', 'Suaves'], ['sin', 'Sin animación']]) +
      '<p class="fxe-t">Cursor</p>' + opts('cursor', [['', 'De la plantilla'], ['ring', 'Anillo'], ['blend', 'Foco'], ['trail', 'Estela'], ['cross', 'Mira']]) +
      '<p class="fxe-t">Tipo de mapa</p>' + opts('vista', [['radar', 'Radar con distancias'], ['mapa', 'Mapa 3D de calles']]) +
      '<p class="fxe-t">Colores del mapa 3D</p>' + opts('mapa', [['auto', 'Automático'], ['oscuro', 'Oscuro'], ['claro', 'Claro'], ['color', 'Con mi color'], ['calles', 'Calles 3D']]) +
      '<p class="fxe-t">Extras</p><div class="fxe-row"><span>Intro animada al entrar</span><button type="button" class="fxe-sw2 ' + (T.intro === false ? '' : 'on') + '" data-tg="intro"></button></div><div class="fxe-row"><span>Avisos en vivo</span><button type="button" class="fxe-sw2 ' + (T.avisos === false ? '' : 'on') + '" data-tg="avisos"></button></div>' +
      '<p class="fxe-note">Animaciones, cursor y mapa se aplican al recargar.</p><button type="button" class="fxe-main" data-reload>Ver cambios</button></div>' +
    '<div class="fxe-sec"><p class="fxe-t">Textos y fotos</p><p class="fxe-note" style="margin-bottom:10px">Entra en modo edición y haz clic en cualquier texto para escribir o en cualquier foto para subir la tuya (también desde el móvil).</p><button type="button" class="fxe-main" data-edit>✏️ Editar textos y fotos</button>' +
      '<p class="fxe-t">Secciones visibles</p>' + ED.blocks.map((el, i) => '<div class="fxe-row"><span>' + esc(secName(el)) + '</span><button type="button" class="fxe-sw2 ' + (CFG.ocultos.map(Number).includes(i) ? '' : 'on') + '" data-blk="' + i + '"></button></div>').join('') + '</div>' +
    '<div class="fxe-sec"><p class="fxe-t">Tu configuración</p><p class="fxe-note">Todo lo que cambias se guarda en este navegador. Descárgalo y envíanoslo: con ese archivo publicamos tu web tal cual la has dejado.</p>' +
      '<button type="button" class="fxe-main" data-dl>⬇ Descargar mi configuración</button><button type="button" class="fxe-sec2" data-wa>Enviar por WhatsApp que ya la tengo</button><button type="button" class="fxe-sec2" data-reset>Volver a la versión original</button></div>' +
    '</div>';
  document.body.append(fab, P);
  if (T.fuente !== undefined || true) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + FONTS.map(f => 'family=' + f.replace(/ /g, '+')).join('&') + '&display=swap'; document.head.appendChild(l); }
  const open = v => { P.classList.toggle('on', v); if (FX.lenis) v ? FX.lenis.stop() : FX.lenis.start(); };
  fab.onclick = () => open(true); P.querySelector('.fxe-x').onclick = () => open(false);
  addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  P.querySelector('.fxe-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('.fxe-tabs button', P).forEach(x => x.classList.toggle('on', x === b)); $$('.fxe-sec', P).forEach((s, i) => s.classList.toggle('on', i === +b.dataset.t)); };
  // Negocio
  P.querySelector('[data-apply]').onclick = () => {
    const biz = {}; $$('[data-b]', P).forEach(i => biz[i.dataset.b] = i.value.trim());
    const h = {}; $$('[data-h]', P).forEach(i => h[i.dataset.h] = i.value.trim() || 'Cerrado'); biz.horario = h;
    biz.avisos = P.querySelector('[data-av]').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (biz.direccion !== BIZ.direccion) { delete CFG.biz.lat; delete CFG.biz.lng; biz.lat = ''; biz.lng = ''; }
    Object.assign(CFG.biz, biz); if (save()) reload(false);
  };
  // Estilo en directo
  const setAccent = c => { root.style.setProperty('--accent', c); CFG.tema.acento = c; $$('.fxe-sw button', P).forEach(b => b.classList.toggle('on', b.dataset.c === c)); save(); };
  P.querySelector('.fxe-sw').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setAccent(b.dataset.c); });
  P.querySelector('.fxe-sw input').addEventListener('input', e => setAccent(e.target.value));
  P.querySelector('.fxe-fonts').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; $$('.fxe-fonts button', P).forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f; if (f) { CFG.tema.fuente = f; root.style.setProperty('--font-d', "'" + f + "', serif"); } else { delete CFG.tema.fuente; root.style.removeProperty('--font-d'); }
    save();
  });
  $$('[data-o]', P).forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); CFG.tema[g.dataset.o] = b.dataset.v; if (!b.dataset.v) delete CFG.tema[g.dataset.o]; save(); }));
  $$('[data-tg]', P).forEach(b => b.onclick = () => { const on = b.classList.toggle('on'); CFG.tema[b.dataset.tg] = on; save(); });
  P.querySelector('[data-reload]').onclick = () => reload(false);
  // Contenido
  P.querySelector('[data-edit]').onclick = () => reload(true);
  $$('[data-blk]', P).forEach(b => b.onclick = () => {
    const i = +b.dataset.blk, on = b.classList.toggle('on'), set = new Set(CFG.ocultos.map(Number));
    on ? set.delete(i) : set.add(i); CFG.ocultos = [...set]; ED.blocks[i].style.display = on ? '' : 'none'; save();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
  // Guardar
  const nicho = (location.pathname.match(/maquetas\/([^/]+)/) || [])[1] || BIZ.nicho || '';
  P.querySelector('[data-dl]').onclick = () => {
    const data = { pagina: nicho, creado: new Date().toISOString(), biz: CFG.biz, tema: CFG.tema, textos: CFG.textos, imagenes: CFG.imagenes, ocultos: CFG.ocultos };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = 'mi-web-' + (String(CFG.biz.nombre || BIZ.nombre || 'negocio').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
  };
  P.querySelector('[data-wa]').onclick = () => window.open('https://wa.me/?text=' + encodeURIComponent('¡Ya tengo mi web personalizada! Te mando el archivo de configuración. (' + (CFG.biz.nombre || BIZ.nombre || '') + ')'), '_blank', 'noopener');
  P.querySelector('[data-reset]').onclick = () => { if (confirm('¿Volver a la versión original? Se perderán los cambios guardados en este navegador.')) { localStorage.removeItem(CFG_KEY); reload(false); } };
})();
