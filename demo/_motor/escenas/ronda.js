/* Bar · Monta la ronda: cuántos sois, bebidas y tapas (fotos reales), zona y hora → ticket con precio por cabeza + chat del camarero */
FXSTUDIO.scenes.ronda = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const BEB = { cana: ['🍺 Caña', 2], doble: ['🍺 Doble', 3], vermut: ['🍷 Vermut de grifo', 3], tinto: ['🍷 Tinto de la casa', 2.8], refresco: ['🥤 Refresco', 2.2], sin: ['🧃 Sin alcohol', 2.5] };
  const TAP = {
    bravas: ['Bravas de la casa', 6, '1565599837634-134bc3aadce8'], croquetas: ['Croquetas de jamón (6)', 8, '1683694062041-cc62c5390b13'],
    tortilla: ['Tortilla jugosa', 7, '1639669794539-952631b44515'], jamon: ['Ración de jamón', 16, '1709790028365-d49ae1e20f53'],
    pimientos: ['Pimientos de Padrón', 6, '1780823223692-b21c51644ab0'], boquerones: ['Boquerones en vinagre', 7, '1762710526517-8393c1222a78'], pan: ['Pan con tomate', 3.5, '1711805064484-a77096f599a6']
  };
  const ZON = { terraza: ['☀️ Terraza', '1649082236294-94468ba45741'], barra: ['🍻 Barra', '1572116469696-31de0f17cc34'], sala: ['🪑 Sala', '1485872299829-c673f5194813'] };
  let per = 4, rondas = 2, beb = ['cana', 'vermut'], tap = ['bravas', 'croquetas', 'tortilla'], zona = 'terraza', hora = '21:00';
  const box = P.box(), eur = n => n.toFixed(2).replace('.', ',') + ' €';
  const draw = () => {
    const bebN = per * rondas, precioBeb = beb.length ? beb.reduce((a, k) => a + BEB[k][1], 0) / beb.length : 0, tBeb = bebN * precioBeb;
    const racion = Math.max(1, Math.ceil(per / 3)), tTap = tap.reduce((a, k) => a + TAP[k][1] * racion, 0), tot = tBeb + tTap;
    P.card('<small>TU MESA · ' + ZON[zona][0].toUpperCase() + ' · ' + hora + '</small><b>' + per + ' personas · ' + rondas + (rondas > 1 ? ' rondas' : ' ronda') + '</b><ul>' +
      '<li>' + bebN + ' bebidas (' + (beb.map(k => BEB[k][0]).join(', ') || '—') + ') · ' + eur(tBeb) + '</li>' + tap.map(k => '<li>' + racion + '× ' + TAP[k][0] + ' · ' + eur(TAP[k][1] * racion) + '</li>').join('') + '</ul><em>Total ' + eur(tot) + ' · con tapa de cortesía en cada caña</em>');
    box.innerHTML = '<h4>Sale por cabeza</h4><div class="vt-big">' + eur(per ? tot / per : 0).replace(' €', '') + '<em> €</em></div><div class="vt-row"><span>Raciones</span><b>' + tap.length * racion + '</b></div><div class="vt-row"><span>Bebidas</span><b>' + bebN + '</b></div>';
    ui.set('Personas', per); ui.set('Zona', ZON[zona][0] + ' · ' + hora); ui.set('Bebidas', beb.map(k => BEB[k][0]).join(', ') || '—'); ui.set('Tapas', tap.map(k => TAP[k][0]).join(', ') || '—'); ui.set('Total aprox.', eur(tot) + ' (' + eur(per ? tot / per : 0) + '/pers.)');
  };
  ui.range('¿Cuántos sois?', { min: 2, max: 16, value: per, fmt: v => v + ' personas' }, v => { per = v; draw(); });
  ui.range('Rondas', { min: 1, max: 4, value: rondas, fmt: v => v + (v > 1 ? ' rondas' : ' ronda') }, v => { rondas = v; draw(); });
  ui.chips('Bebidas', Object.entries(BEB).map(([v, b]) => ({ v, l: b[0] + ' · ' + eur(b[1]) })), beb, v => { beb = v; draw(); }, true);
  ui.chips('Para picar', Object.entries(TAP).map(([v, t]) => ({ v, l: t[0] + ' · ' + eur(t[1]) })), tap, v => { const add = v.find(x => !tap.includes(x)); tap = v; draw(); if (add) { P.show(TAP[add][2]); P.caption(TAP[add][0], eur(TAP[add][1]) + ' la ración'); } }, true);
  ui.chips('Zona', Object.entries(ZON).map(([v, z]) => ({ v, l: z[0] })), zona, v => { zona = v; P.show(ZON[v][1]); P.caption(ZON[v][0], 'Te guardamos la mesa 15 min'); draw(); });
  ui.chips('Hora', ['13:30', '14:30', '20:00', '21:00', '22:00'].map(v => ({ v, l: v })), hora, v => { hora = v; draw(); });
  ui.buttons([{ l: '🍻 ¡Chin chin!', main: true, fn: () => { ui.toast('Mesa apuntada: confírmala por WhatsApp'); if (g) g.fromTo(P.img, { rotate: -1.5 }, { rotate: 0, duration: .9, ease: 'elastic.out(1,.35)' }); } }]);
  const kb = [
    { k: ['gluten', 'celiaco', 'celiaca'], t: 'Sin gluten', u: 'baja', p: '—', d: '—', a: 'Tortilla, patatas, pimientos y croquetas de jamón sin gluten (freidora aparte). Cerveza sin gluten de botella.', on: () => { tap = ['tortilla', 'pimientos']; ui.pick('Para picar', tap); draw(); } },
    { k: ['vegano', 'vegetariano', 'sin carne'], t: 'Vegetariano o vegano', u: 'baja', p: '—', d: '—', a: 'Bravas (salsa sin huevo), pimientos de Padrón y pan con tomate son veganos. La tortilla es vegetariana.', on: () => { tap = ['bravas', 'pimientos', 'pan']; ui.pick('Para picar', tap); draw(); } },
    { k: ['perro', 'mascota', 'perrito'], t: 'Con perro', u: 'baja', p: '—', d: '—', a: 'En la terraza, encantados. Le sacamos un cuenco de agua.', on: () => { zona = 'terraza'; ui.pick('Zona', zona); draw(); } },
    { k: ['futbol', 'partido', 'champions', 'madrid', 'atleti', 'liga'], t: 'Ver el partido', u: 'media', p: '—', d: 'reserva antes', a: 'Ponemos todos los partidos con sonido en la sala. Los días grandes se llena: <b>reserva con nombre</b>.', on: () => { zona = 'sala'; ui.pick('Zona', zona); draw(); } },
    { k: ['cumpleanos', 'cumple', 'despedida', 'grupo', 'cena de empresa'], t: 'Grupos y celebraciones', u: 'media', p: 'desde 15 €/pers.', d: '—', a: 'Para más de 10 os montamos mesa larga y menú de raciones al centro desde 15 €/persona con bebida.', on: () => { per = 12; ui.pick('¿Cuántos sois?', per); draw(); } },
    { k: ['ninos', 'nino', 'carrito', 'bebe'], t: 'Con niños', u: 'baja', p: '—', d: '—', a: 'Tenemos tronas y sitio para el carrito en la terraza.', on: () => {} },
    { k: ['caro', 'precio', 'cuanto', 'cuesta'], t: 'Precios', u: 'baja', p: 'caña 2 €', d: '—', a: 'Caña con tapa 2 €, vermut 3 €, raciones de 6 a 16 €. Monta tu ronda aquí al lado y verás cuánto sale por cabeza.', on: () => {} }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Camarero de ' + (FX.BIZ.nombre || ''), avatar: '🍺', fab: '¿Qué os pongo?', placeholder: 'Ej.: somos celíacos, venimos con perro…', quick: ['Sin gluten', 'Venimos con perro', 'Ver el partido', 'Cumpleaños', 'Vegano'], label: 'Consulta', waIntro: 'Hola, os escribo desde la web: ', cta: 'Reservar mesa', hello: 'Hola 👋 ¿Cuántos sois y qué os apetece? Pregúntame lo que quieras.' });
  P.show(ZON.terraza[1]); P.caption(ZON.terraza[0], 'Te guardamos la mesa 15 min'); draw();
};
