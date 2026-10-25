/* Tienda de ropa · Probador: elige look (fotos reales), tu talla según altura y peso, color y te lo guardamos 48 h + estilista por chat */
FXSTUDIO.scenes.probador = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const L = {
    blazer: { l: 'Blazer y pantalón sastre', ph: '1628102160678-cfb60e4e18e6', p: [['Blazer oversize', 79], ['Pantalón sastre', 49]], o: 'Oficina · entrevista' },
    blanco: { l: 'Camisa blanca total', ph: '1619086303291-0ef7699e4b31', p: [['Camisa de popelín', 45], ['Pantalón ancho', 49]], o: 'Diario · elegante' },
    vestido: { l: 'Vestido de invitada', ph: '1617690033147-ce6b332d677b', p: [['Vestido midi', 89], ['Bolso de mano', 35]], o: 'Boda · evento' },
    traje: { l: 'Traje de hombre', ph: '1618886614638-80e3c103d31a', p: [['Americana', 129], ['Pantalón de traje', 59], ['Camisa', 39]], o: 'Ceremonia · trabajo' },
    casual: { l: 'Casual de fin de semana', ph: '1537261131936-3cdff36a1ac9', p: [['Polo de algodón', 35], ['Zapatillas blancas', 69]], o: 'Diario · cómodo' },
    sneakers: { l: 'Zapatillas', ph: '1542291026-7eec264c27ff', p: [['Zapatillas edición limitada', 119]], o: 'Calle · colección' }
  };
  const COL = { natural: ['Natural', 'none'], negro: ['Negro', 'grayscale(1) contrast(1.15) brightness(.9)'], arena: ['Arena', 'sepia(.55) saturate(.8) brightness(1.05)'], frio: ['Azul frío', 'hue-rotate(185deg) saturate(.8)'] };
  let look = 'blazer', alt = 168, kg = 62, fit = 'regular', col = 'natural', hold = null;
  const size = () => { const bmi = kg / ((alt / 100) ** 2), idx = Math.max(0, Math.min(5, Math.round((bmi - 18) / 2.3 + (alt > 182 ? 1 : 0) + (fit === 'holgado' ? 1 : fit === 'ajustado' ? -1 : 0)))); return ['XS', 'S', 'M', 'L', 'XL', 'XXL'][idx]; };
  const total = () => L[look].p.reduce((a, x) => a + x[1], 0);
  const box = P.box();
  const draw = () => {
    const x = L[look], t = total(), s = size();
    P.card('<small>TU LOOK · ' + x.o.toUpperCase() + '</small><b>' + x.l + '</b><ul>' + x.p.map(q => '<li>' + q[0] + ' · ' + q[1] + ' €</li>').join('') + '</ul><em>' + t + ' € · talla ' + s + ' · ' + COL[col][0] + '</em>');
    box.innerHTML = hold ? '<h4>Te lo guardamos</h4><div class="vt-big">' + hold + '<em>h</em></div><div class="vt-meter"><i style="width:' + hold / 48 * 100 + '%"></i></div><div class="vt-row"><span>Probador</span><b>Reservado</b></div>' : '<h4>Tu talla</h4><div class="vt-big">' + s + '</div><div class="vt-row"><span>Altura · peso</span><b>' + alt + ' cm · ' + kg + ' kg</b></div><div class="vt-row"><span>Corte</span><b>' + fit + '</b></div>';
    ui.set('Look', x.l); ui.set('Talla', s); ui.set('Color', COL[col][0]); ui.set('Total', t + ' €');
  };
  const pick = v => { look = v; const x = L[v]; P.show(x.ph, COL[col][1]); P.caption(x.l, x.o); P.zone(''); draw(); };
  ui.chips('Look', Object.entries(L).map(([v, x]) => ({ v, l: x.l })), look, pick);
  ui.range('Altura', { min: 150, max: 200, value: alt, unit: ' cm' }, v => { alt = v; draw(); });
  ui.range('Peso', { min: 40, max: 120, value: kg, unit: ' kg' }, v => { kg = v; draw(); });
  ui.chips('Cómo te gusta', [{ v: 'ajustado', l: 'Ajustado' }, { v: 'regular', l: 'Regular' }, { v: 'holgado', l: 'Holgado' }], fit, v => { fit = v; draw(); });
  ui.chips('Color', Object.entries(COL).map(([v, c]) => ({ v, l: c[0] })), col, v => { col = v; P.show(L[look].ph, COL[v][1]); draw(); });
  ui.buttons([{ l: '🛍️ Guárdamelo 48 h', main: true, fn: () => { hold = 48; draw(); ui.set('Reserva', 'Probador · 48 h'); ui.toast('¡Reservado! Pásate cuando quieras a probártelo'); if (g) g.fromTo(box, { scale: .9 }, { scale: 1, duration: .6, ease: 'back.out(2)' }); } }, { l: 'Enviar a casa', fn: () => { ui.set('Entrega', 'Envío 24–48 h · gratis desde 60 €'); ui.toast('Envío gratis desde 60 € · cambios en 30 días'); } }]);
  const kb = [
    { k: ['talla', 'que talla', 'me queda', 'mido', 'peso'], t: '¿Qué talla soy?', u: 'baja', p: '—', d: '—', a: 'Mueve <b>altura y peso</b> en el probador y te digo tu talla. Si dudas entre dos, te guardamos ambas en el probador y te llevas la buena.', on: () => {} },
    { k: ['boda', 'invitada', 'evento', 'comunion', 'bautizo', 'graduacion'], t: 'Look para una boda', u: 'baja', p: 'desde 89 €', d: 'arreglos en 48 h', a: 'Para invitada te propongo un <b>vestido midi</b> con bolso de mano; si es de mañana, colores claros. Hacemos arreglos de bajo y cintura en 48 h.', on: () => pick('vestido') },
    { k: ['entrevista', 'trabajo', 'oficina', 'reunion'], t: 'Entrevista o trabajo', u: 'baja', p: 'desde 128 €', d: '—', a: 'Un <b>blazer bien cortado</b> con pantalón sastre funciona en casi cualquier entrevista. En negro o arena, lo combinas toda la semana.', on: () => pick('blazer') },
    { k: ['traje', 'hombre', 'novio', 'americana', 'chaqueta'], t: 'Traje de hombre', u: 'baja', p: 'desde 188 €', d: 'arreglos incluidos', a: 'Traje de americana y pantalón con <b>arreglos de bajo y manga incluidos</b>. Para novio, cita privada en tienda fuera de horario.', on: () => pick('traje') },
    { k: ['devolucion', 'devolver', 'cambio', 'cambiar', 'no me queda'], t: 'Cambios y devoluciones', u: 'baja', p: 'gratis', d: '30 días', a: 'Tienes <b>30 días</b> para cambiar o devolver, en tienda o por mensajero, con la etiqueta puesta. Te devolvemos el dinero en el mismo método de pago.', on: () => {} },
    { k: ['envio', 'enviar', 'casa', 'domicilio', 'cuanto tarda'], t: 'Envíos', u: 'baja', p: 'gratis desde 60 €', d: '24–48 h', a: 'Enviamos a toda España en <b>24–48 h</b>; en el barrio, en bici el mismo día. Gratis a partir de 60 €.', on: () => {} },
    { k: ['regalo', 'regalar', 'tarjeta regalo', 'cumpleanos'], t: 'Quiero regalar', u: 'baja', p: 'desde 25 €', d: '—', a: 'La <b>tarjeta regalo</b> no caduca en un año y la envolvemos gratis. Si sabes su talla, también guardamos el ticket regalo para cambios.', on: () => pick('casual') },
    { k: ['zapatillas', 'sneakers', 'edicion limitada', 'drop', 'lanzamiento'], t: 'Zapatillas y lanzamientos', u: 'baja', p: 'desde 69 €', d: '—', a: 'Avisamos por WhatsApp de los <b>lanzamientos</b> antes que en redes y guardamos tu número 24 h. Pídelo por chat.', on: () => pick('sneakers') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Estilista ' + (FX.BIZ.nombre || ''), avatar: '🧥', fab: '¿Qué te pongo?', placeholder: 'Ej.: tengo una boda, ¿qué talla soy?…', quick: ['Tengo una boda', 'Entrevista de trabajo', '¿Qué talla soy?', 'Cambios y devoluciones', 'Envíos'], label: 'Consulta', waIntro: 'Hola, me interesa este look: ', cta: 'Guárdamelo en tienda', hello: 'Hola ✨ Dime para qué ocasión buscas ropa y te preparo el look con tu talla.' });
  pick('blazer');
};
