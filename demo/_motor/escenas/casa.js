/* Fontanero / electricista · Elige la avería (fotos reales), qué hacer mientras llegamos y técnico en camino en directo */
FXSTUDIO.scenes.casa = async ({ stage, ui, FX, studio }) => {
  const P = studio.photo(stage, ui), g = window.gsap;
  const A = {
    fuga: { l: 'Fuga de agua', i: '💧', ph: '1526898943670-92bfa9f94c12', p: 'desde 59 €', u: 'alta', now: 'Cierra la <b>llave de paso</b> general (suele estar en la cocina, el baño o junto al contador) y quita la luz de la zona mojada.', z: ['Tubería', 50, 50] },
    grifo: { l: 'Grifo que gotea', i: '🚰', ph: '1560673429-b9b9338a360a', p: 'desde 45 €', u: 'baja', now: 'Cierra la llave de escuadra de debajo del lavabo. Un goteo pierde unos 30 litros al día.', z: ['Cartucho del grifo', 50, 35] },
    atasco: { l: 'Atasco', i: '🪠', ph: '1654440122140-f1fc995ddb34', p: 'desde 65 €', u: 'media', now: 'No eches sosa cáustica (daña las tuberías y quema). Prueba con agua muy caliente y un desatascador de ventosa.', z: ['Sifón', 50, 55] },
    calentador: { l: 'Calentador / caldera', i: '🔥', ph: '1676210134190-3f2c0d5cf58d', p: 'diagnóstico 49 €', u: 'media', now: 'Mira la presión (entre 1 y 1,5 bar) y reinicia una vez. Si huele a gas, no lo toques: sal y llama al 112.', z: ['Quemador', 50, 45] },
    luz: { l: 'Sin luz / salta el diferencial', i: '⚡', ph: '1544724569-5f546fd6f2b5', p: 'desde 55 €', u: 'alta', now: 'Baja todos los automáticos, sube el general y ve subiendo uno a uno: el que lo hace saltar es el circuito con la avería. Déjalo bajado.', z: ['Cuadro eléctrico', 50, 45] },
    enchufe: { l: 'Enchufe que chispea', i: '🔌', ph: '1484024091473-858a1e7ece52', p: 'desde 45 €', u: 'alta', now: 'Desenchufa lo que haya conectado y baja el automático de ese circuito. No lo uses hasta que lo revisemos.', z: ['Toma de corriente', 50, 50] }
  };
  let av = 'fuga', when = 'ya', timer = null;
  const box = P.box();
  const idle = () => { box.innerHTML = '<h4>Técnico disponible</h4><div class="vt-row"><span>Zona</span><b>' + FX.esc(FX.BIZ.barrio || FX.BIZ.ciudad || 'Madrid') + '</b></div><div class="vt-row"><span>Llegada estimada</span><b>' + (when === 'ya' ? '30 – 45 min' : 'a la hora elegida') + '</b></div><div class="vt-row"><span>Desplazamiento</span><b>' + (when === 'ya' ? '25 € urgencia' : 'gratis') + '</b></div>'; };
  const card = () => { const a = A[av]; P.card('<small>MIENTRAS LLEGAMOS</small><b>' + a.i + ' ' + a.l + '</b><p style="margin:6px 0">' + a.now + '</p><em>' + a.p + ' · precio cerrado</em>'); ui.set('Avería', a.l); ui.set('Precio', a.p); };
  const pick = v => { av = v; const a = A[v]; P.show(a.ph); P.zone(a.z[0], a.z[1], a.z[2]); P.caption(a.l, { alta: '🔴 Urgente', media: '🟠 Hoy', baja: '🟢 Cuando te venga bien' }[a.u]); card(); };
  const dispatch = () => {
    clearInterval(timer); let left = when === 'ya' ? 35 : 0, total = left;
    P.show('1749532125405-70950966b0e5'); P.caption('Tu técnico va de camino', 'Furgoneta equipada · material incluido'); P.zone('');
    if (!left) { box.innerHTML = '<h4>Cita confirmada</h4><div class="vt-big">✓</div><div class="vt-row"><span>Cuándo</span><b>' + when + '</b></div>'; ui.set('Cita', when); return ui.toast('Cita reservada'); }
    const tick = () => { box.innerHTML = '<h4>Técnico en camino 🚐</h4><div class="vt-big">' + left + '<em>min</em></div><div class="vt-meter"><i style="width:' + (1 - left / total) * 100 + '%"></i></div><div class="vt-row"><span>Técnico</span><b>' + (av === 'luz' || av === 'enchufe' ? 'Javier · electricista' : 'Marcos · fontanero') + '</b></div>'; if (!left) { clearInterval(timer); ui.toast('¡El técnico ha llegado!'); } left--; };
    tick(); timer = setInterval(tick, 900); ui.set('Cita', 'Urgente · ~' + total + ' min');
  };
  ui.chips('¿Qué pasa?', Object.entries(A).map(([v, a]) => ({ v, l: a.l, i: a.i })), av, pick);
  ui.chips('¿Cuándo?', [{ v: 'ya', l: 'Ahora mismo' }, { v: 'Hoy por la tarde', l: 'Hoy por la tarde' }, { v: 'Mañana por la mañana', l: 'Mañana por la mañana' }], when, v => { when = v; idle(); });
  ui.buttons([{ l: '🚐 Pedir técnico', main: true, fn: dispatch }, { l: 'Reiniciar', fn: () => { clearInterval(timer); idle(); pick(av); } }]);
  const kb = [
    { k: ['gas', 'huele a gas', 'olor a gas', 'butano'], t: 'Olor a gas', u: 'alta', p: '—', d: 'ya', a: '<b>No enciendas ni apagues luces ni nada eléctrico</b>, no uses el móvil dentro. Cierra la llave del gas si puedes, abre ventanas, sal de casa y llama al <b>112</b> o al teléfono de urgencias de tu distribuidora desde fuera.', on: () => pick('calentador') },
    { k: ['inundacion', 'fuga', 'sale agua', 'revienta', 'tuberia rota', 'mancha en el techo', 'vecino de abajo'], t: 'Fuga de agua', u: 'alta', p: 'desde 59 €', d: '30 – 45 min', a: 'Cierra la <b>llave de paso</b> ya y quita la luz si el agua llega a enchufes. Haz fotos para el seguro: la mayoría cubre la reparación y nosotros tramitamos el parte.', on: () => pick('fuga') },
    { k: ['salta el diferencial', 'sin luz', 'se va la luz', 'diferencial', 'automatico', 'apagon'], t: 'Se va la luz', u: 'alta', p: 'desde 55 €', d: '30 – 45 min', a: 'Baja todos los automáticos, sube el general y ve subiendo uno a uno. Si salta con uno concreto, déjalo bajado y usa el resto. Si no hay luz en todo el edificio, es la compañía.', on: () => pick('luz') },
    { k: ['chispa', 'chispea', 'humo', 'quemado', 'olor a quemado', 'enchufe'], t: 'Chispas u olor a quemado', u: 'alta', p: 'desde 45 €', d: '30 – 45 min', a: 'Baja el automático de esa zona ya. <b>Si hay humo o fuego, nunca agua</b>: sal y llama al 112. Un enchufe caliente o negro hay que cambiarlo.', on: () => pick('enchufe') },
    { k: ['atasco', 'atascado', 'no traga', 'water', 'vater', 'inodoro', 'fregadero', 'mal olor'], t: 'Atasco', u: 'media', p: 'desde 65 €', d: 'hoy', a: 'Desatascador de ventosa y agua caliente (no hirviendo en el váter, que puede romper la porcelana). Nada de sosa. Si se atascan varios desagües a la vez, el problema es la bajante.', on: () => pick('atasco') },
    { k: ['agua caliente', 'calentador', 'caldera', 'no calienta', 'presion', 'termo'], t: 'Sin agua caliente', u: 'media', p: 'diagnóstico 49 €', d: 'hoy', a: 'Comprueba que la presión está entre 1 y 1,5 bar y que hay luz y gas. Reinicia una vez. Si da error, haz una foto del código y mándanosla: llegamos con la pieza.', on: () => pick('calentador') },
    { k: ['gotea', 'grifo', 'cisterna', 'pierde agua'], t: 'Grifo o cisterna que pierde', u: 'baja', p: 'desde 45 €', d: 'cuando te venga bien', a: 'Cierra la llave de escuadra de ese grifo o cisterna. Cambiamos cartucho o mecanismo en 30 minutos; llevamos los repuestos más comunes.', on: () => pick('grifo') },
    { k: ['boletin', 'certificado electrico', 'cie', 'potencia', 'subir potencia', 'instalacion nueva', 'reforma'], t: 'Boletín o instalación nueva', u: 'baja', p: 'desde 120 €', d: 'con cita', a: 'Somos instaladores autorizados: hacemos el certificado (antiguo boletín), cambios de potencia y cuadros nuevos con presupuesto cerrado.', on: () => pick('luz') }
  ];
  studio.chat(stage, ui, { FX, kb, name: 'Urgencias ' + (FX.BIZ.nombre || ''), avatar: '🧰', fab: '¿Qué avería tienes?', placeholder: 'Ej.: sale agua del techo, salta el diferencial…', quick: ['Huele a gas', 'Sale agua', 'Salta el diferencial', 'Atasco en el váter', 'No hay agua caliente'], label: 'Avería', waIntro: 'Hola, tengo esta avería: ', cta: 'Pedir técnico ahora' });
  idle(); pick('fuga');
};
