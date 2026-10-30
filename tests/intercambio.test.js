#!/usr/bin/env node
/* Tests del intercambio de puesto (posiciones-del-jugador). Se corren con:
 *
 *     node tests/intercambio.test.js
 *
 * Cubren lo que NO necesita un navegador: la regla de compatibilidad, el toque como máquina de
 * estados, la escritura del intercambio, el drop como decisión y los textos de los avisos, más
 * tres propiedades sobre partidos generados al azar. Lo que sólo existe en el navegador —que el
 * toque llegue al manejador, que tocar el fondo cancele, el dibujo, el aviso, el rol— vive en
 * tests/layout.test.js, en los escenarios `intercambio-*`.
 *
 * Como el resto de la aplicación, todo vive dentro del IIFE de index.html y no exporta nada. Se
 * recortan las declaraciones por NOMBRE con el `extraer` de tests/harness.js, con lista propia
 * para no acoplar el sandbox del motor a funciones que no usa (Implementation Plan, TD-16).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas, con guion y con el
 * prefijo `intercambio/` ("intercambio/S-NNx"): es la convención de binding de AGENTS.md, y el
 * prefijo distingue estos IDs de los de las otras Specs (TC-031).
 */
const fs = require('fs');
const path = require('path');
const { extraer, DECLARACIONES_CATALOGO } = require('./harness');
const { docsDesde, agregarDatosDeIntercambio } = require('./fixtures-app');

const SPEC = 'docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md';
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

/* En orden de dependencia: el catálogo primero, porque casi todo pregunta la línea de un puesto. */
const DECLARACIONES = [
  ...DECLARACIONES_CATALOGO,
  'computeAvg',
  'valorGeneralDe',
  'puntajeEnPosicion',
  'COSTO_DESCUBIERTA',
  'costoEncaje',
  'cubrePosicionGuardada',
  'getDuplaPartner',
  'construirUnidadDupla',
  'posicionAsignadaDe',
  'valorDePuntaje',
  'unidadDelPartido',
  'moverUnJugadorDeEquipo',
  'jugadoresDeEquipoOrdenados',
  'agruparFilasDeEquipo',
  'sumaVigenteDeEquipo',
  'sumasVigentes',
  'colapsarDuplasParaLinea',
  'faltantesDeFormacionVigente',
  'fullName',
  'escaparHtml',
  // Lo de esta feature.
  'tienePuestos',
  'unidadDeCobertura',
  'mismaUnidad',
  'evaluarIntercambio',
  'candidatosDeIntercambio',
  'nombreDeGrupo',
  'grupoDeUnidad',
  'avisoDeRechazo',
  'textoAvisoIntercambio',
  'resolverToqueCamiseta',
  'resolverDestinoDrop',
  'intercambiarUnidades',
];

function cargar() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  /* `moverUnJugadorDeEquipo` y la agrupación en filas leen el plantel del ámbito del IIFE: se
     declara acá con un setter, como en tests/cancha.test.js. */
  const prelude = 'let players = [];\nfunction __setPlayers(p){ players = p; }\n';
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const I = cargar();

/* ---------- helpers de aserción (mismos que cancha.test.js) ---------- */
class FalloAssert extends Error {}
const fallar = msg => { throw new FalloAssert(msg); };
const ok = (cond, msg) => { if (!cond) fallar(msg); };
const eq = (actual, esperado, msg) => {
  const a = JSON.stringify(actual), e = JSON.stringify(esperado);
  if (a !== e) fallar(`${msg}\n      esperado: ${e}\n      obtenido: ${a}`);
};

let pasaron = 0;
const fallos = [];
function prueba(titulo, fn) {
  try { fn(); pasaron++; console.log(`  \x1b[32m✓\x1b[0m ${titulo}`); }
  catch (e) {
    fallos.push({ titulo, error: e });
    console.log(`  \x1b[31m✗\x1b[0m ${titulo}`);
    console.log(`      ${e.message.split('\n').join('\n      ')}`);
  }
}

/* ---------- los datos: los mismos partidos que usan los escenarios de layout ---------- */
/* `agregarDatosDeIntercambio` (tests/fixtures-app.js) arma el plantel y los partidos `m-int-*`
   pensados para cada escenario de la Spec; ver su comentario. Cada llamada a `partido` devuelve una
   copia nueva, así un caso puede mutarla sin afectar al siguiente. */
const DATOS = agregarDatosDeIntercambio(docsDesde());
const J = (id, principal, secundarias = [], scores = {}) =>
  ({ id, nombre: id, apellido: '', principal, secundarias, scores: { [principal]: 6, ...scores } });
/* Dos jugadores de más para armar duplas a medida: los dos son DC, y sólo `u-x` cubre LD. */
const EXTRA = [J('u-x', 'DC', ['LD'], { LD: 5 }), J('u-y', 'DC'), J('u-z', 'MI')];
const PLANTEL = JSON.parse(DATOS.players).concat(EXTRA);
const porId = Object.fromEntries(PLANTEL.map(p => [p.id, p]));
const usarPlantel = () => I.__setPlayers(PLANTEL);
usarPlantel();
const partido = id => JSON.parse(DATOS.partidos).find(m => m.id === id);
const puesto = (m, id) => m.equipos.posicionAsignada[id];
const unidadesDe = (m, equipo) => I.agruparFilasDeEquipo(m, I.jugadoresDeEquipoOrdenados(m, m.equipos[equipo])).length;
const seleccion = (m, id) => ({ matchId: m.id, id, candidatos: I.candidatosDeIntercambio(m, id, porId) });

/* Reemplaza a `id` del Blanco por una dupla nueva que juega su mismo puesto. */
function conDupla(m, id, a, b) {
  const pos = puesto(m, id);
  m.equipos.blanco = m.equipos.blanco.filter(x => x !== id).concat([a, b]);
  delete m.equipos.posicionAsignada[id];
  m.equipos.posicionAsignada[a] = pos;
  m.equipos.posicionAsignada[b] = pos;
  m.duplas = (m.duplas || []).concat([[a, b]]);
  return m;
}

console.log(`\nEl intercambio de puesto — ${SPEC}\n`);
console.log('\x1b[1mLA REGLA\x1b[0m — quién es candidato de quién\n');

prueba('"intercambio/S-01" los candidatos de Juan son Pedro en su equipo y Diego en el otro, y nadie más', () => {
  eq(I.candidatosDeIntercambio(partido('m-int-8'), 'int-juan', porId), ['int-pedro', 'int-diego'],
    'Juan (DC; LD, LI) cubre el puesto de los dos y los dos cubren DC');
});

prueba('"intercambio/S-01a" una dupla con un integrante que cubre LD es candidata de Pedro, como lo sería para el motor', () => {
  const m = conDupla(partido('m-int-8'), 'int-juan', 'u-x', 'u-y');
  ok(I.candidatosDeIntercambio(m, 'u-x', porId).includes('int-pedro'), 'la dupla cubre LD por u-x y Pedro cubre DC: Pedro es candidato');
  ok(I.candidatosDeIntercambio(m, 'u-y', porId).includes('int-pedro'),
    'también preguntando desde u-y, que no cubre LD: la que cuenta es la unidad, no el integrante');
  ok(I.cubrePosicionGuardada(I.construirUnidadDupla(porId['u-x'], porId['u-y']), 'LD') < I.COSTO_DESCUBIERTA,
    'es el mismo criterio del motor: la unión de los puestos de los dos (D-07)');
  const sinLD = conDupla(partido('m-int-8'), 'int-juan', 'u-y', 'u-z');
  sinLD.equipos.posicionAsignada['u-y'] = sinLD.equipos.posicionAsignada['u-z'] = 'DC';
  ok(!I.candidatosDeIntercambio(sinLD, 'u-y', porId).includes('int-pedro'), 'si ninguno de los dos cubre LD, Pedro no es candidato');
});

prueba('"intercambio/S-01h" un compañero con el mismo puesto asignado no es candidato', () => {
  const m = partido('m-int-9');   // Lucas y la dupla Ramiro + Esteban, los dos MC del Blanco
  eq(I.evaluarIntercambio(m, 'int-lucas', 'int-ramiro', porId), { valido: false, motivo: 'mismo-puesto' },
    'mismo equipo y mismo puesto: el intercambio no cambiaría nada (FR-023)');
  ok(!I.candidatosDeIntercambio(m, 'int-lucas', porId).includes('int-ramiro'), 'y por eso no se resalta');
});

prueba('"intercambio/S-02b" mismo puesto en equipos distintos es candidato, y el intercambio sólo cambia el equipo', () => {
  const m = partido('m-int-8');
  ok(I.evaluarIntercambio(m, 'int-lucas', 'int-ezequiel', porId).valido, 'MC con MC entre equipos: FR-023 no aplica');
  I.intercambiarUnidades(m, 'int-lucas', 'int-ezequiel');
  eq([puesto(m, 'int-lucas'), puesto(m, 'int-ezequiel')], ['MC', 'MC'], 'los dos siguen de MC');
  ok(m.equipos.negro.includes('int-lucas') && m.equipos.blanco.includes('int-ezequiel'), 'y cambiaron de equipo');
});

prueba('"intercambio/S-02d" un jugador del otro equipo que cubre MC, pero cuyo puesto Lucas no cubre, no es candidato', () => {
  const m = partido('m-int-8');   // Ramón: principal MC, juega de DEL
  eq(I.evaluarIntercambio(m, 'int-lucas', 'int-ramon', porId), { valido: false, motivo: 'a-no-cubre' },
    'Lucas (MC; MD) no cubre DEL');
  ok(!I.candidatosDeIntercambio(m, 'int-lucas', porId).includes('int-ramon'), 'y no se resalta');
});

prueba('"intercambio/S-01e" quien no tiene candidatos recibe el aviso con su nombre', () => {
  eq(I.candidatosDeIntercambio(partido('m-int-8'), 'int-img', porId), [], 'el DEL del Blanco no tiene con quién intercambiar');
  eq(I.textoAvisoIntercambio('sin-candidatos', { a: 'Juan Pérez' }), 'Nadie puede intercambiar puesto con Juan Pérez', 'el texto de FR-018');
});

prueba('"intercambio/S-04a" el arquero de secundaria con candado tiene los candidatos de su puesto asignado, nunca el arco', () => {
  const m = partido('m-int-sin-arquero');   // Julián: MI, con Arquero de secundaria y candado
  const c = I.candidatosDeIntercambio(m, 'int-julian', porId);
  eq(c, ['int-bruno'], 'sus candidatos son los que cubren MI y cuyo puesto él cubre');
  ok(c.every(id => I.unidadDelPartido(m, id)), 'todo candidato es una unidad del reparto, no un lugar: el arco vacío no se ofrece (FR-050)');
});

prueba('"intercambio/S-05" sin puestos, son candidatas todas las del otro equipo y ninguna del propio', () => {
  const m = partido('m-int-puntaje');
  eq(I.candidatosDeIntercambio(m, 'int-juan', porId).sort(), [...m.equipos.negro].sort(), 'todo el Negro (FR-024)');
  eq(I.evaluarIntercambio(m, 'int-juan', 'int-pedro', porId), { valido: false, motivo: 'mismo-equipo' }, 'y ninguna del Blanco');
});

prueba('"intercambio/S-20b" un identificador ajeno al reparto no es candidato de nadie ni se escribe', () => {
  const m = partido('m-int-8');
  ['no-existe', '', 'int-agustin', '{"id":"int-juan"}', undefined].forEach(x => {
    eq(I.evaluarIntercambio(m, 'int-juan', x, porId), { valido: false, motivo: 'ajeno' }, `destino ${JSON.stringify(x)}`);
    eq(I.evaluarIntercambio(m, x, 'int-juan', porId), { valido: false, motivo: 'ajeno' }, `origen ${JSON.stringify(x)}`);
  });
  const antes = JSON.stringify(m);
  I.intercambiarUnidades(m, 'int-juan', 'no-existe');
  I.intercambiarUnidades(m, 'int-agustin', 'int-juan');
  eq(JSON.stringify(m), antes, 'intercambiar con un identificador ajeno no cambia nada (TC-042)');
});

console.log('\n\x1b[1mEL TOQUE\x1b[0m — resolverToqueCamiseta\n');

prueba('"intercambio/S-01b" tocar a un compañero que no es candidato lo selecciona, sin intercambiar', () => {
  const m = partido('m-int-8');
  eq(I.resolverToqueCamiseta(m, seleccion(m, 'int-juan'), 'int-nico', porId), { accion: 'seleccionar', id: 'int-nico' }, 'FR-014');
});

prueba('"intercambio/S-01c" tocar la seleccionada, o la pareja de su dupla, cancela', () => {
  const m = partido('m-int-9');
  eq(I.resolverToqueCamiseta(m, seleccion(m, 'int-juan'), 'int-juan', porId), { accion: 'cancelar' }, 'la misma camiseta (FR-015)');
  eq(I.resolverToqueCamiseta(m, seleccion(m, 'int-ramiro'), 'int-esteban', porId), { accion: 'cancelar' }, 'la dupla es una sola unidad');
});

prueba('"intercambio/S-01" tocar un candidato intercambia; sin selección, o con la de otro partido, selecciona', () => {
  const m = partido('m-int-8');
  eq(I.resolverToqueCamiseta(m, seleccion(m, 'int-juan'), 'int-pedro', porId), { accion: 'intercambiar', id: 'int-pedro' }, 'FR-013');
  eq(I.resolverToqueCamiseta(m, null, 'int-pedro', porId), { accion: 'seleccionar', id: 'int-pedro' }, 'FR-010');
  const otro = partido('m-int-9');
  eq(I.resolverToqueCamiseta(m, seleccion(otro, 'int-juan'), 'int-pedro', porId), { accion: 'seleccionar', id: 'int-pedro' },
    'una selección de otro partido no cuenta: hay a lo sumo una en la pantalla (FR-019)');
});

prueba('"intercambio/S-01j" si el reparto cambió entre los dos toques, el segundo no intercambia y avisa', () => {
  /* La aplicación no escucha cambios de otra sesión en vivo, así que el caso sólo se produce acá:
     el partido se muta entre la selección y el segundo toque (Implementation Plan §7.2.1). */
  let m = partido('m-int-8');
  let sel = seleccion(m, 'int-juan');
  m.equipos.posicionAsignada['int-pedro'] = 'MI';   // Pedro ya no juega un puesto que Juan cubra
  eq(I.resolverToqueCamiseta(m, sel, 'int-pedro', porId), { accion: 'reparto-cambio' }, 'Pedro estaba marcado y ya no es candidato (FR-034b)');
  m = partido('m-int-8');
  sel = seleccion(m, 'int-juan');
  m.equipos.blanco = m.equipos.blanco.filter(id => id !== 'int-pedro');
  eq(I.resolverToqueCamiseta(m, sel, 'int-pedro', porId), { accion: 'reparto-cambio' }, 'Pedro ya no está en el reparto (FR-034)');
  eq(I.textoAvisoIntercambio('reparto-cambio'), 'Ya no se puede intercambiar: el reparto cambió', 'el texto de FR-034b');
});

console.log('\n\x1b[1mLA ESCRITURA\x1b[0m — intercambiarUnidades\n');

prueba('"intercambio/S-01" Juan y Pedro intercambian puesto en el Blanco y el total baja 4', () => {
  const m = partido('m-int-8');
  const antes = I.sumasVigentes(m);
  I.intercambiarUnidades(m, 'int-juan', 'int-pedro');
  eq([puesto(m, 'int-juan'), puesto(m, 'int-pedro')], ['LD', 'DC'], 'cada uno tomó el puesto del otro (FR-030)');
  ok(m.equipos.blanco.includes('int-juan') && m.equipos.blanco.includes('int-pedro'), 'los dos siguen en el Blanco');
  eq(I.sumasVigentes(m).blanco, antes.blanco - 4, 'de 7 + 8 a 6 + 5 (FR-070)');
  eq(I.sumasVigentes(m).negro, antes.negro, 'el Negro no cambia');
});

prueba('"intercambio/S-01f" el intercambio se aplica con candado, y la unidad sigue fijada', () => {
  const m = partido('m-int-8');   // Pedro tiene candado
  I.intercambiarUnidades(m, 'int-juan', 'int-pedro');
  eq(puesto(m, 'int-pedro'), 'DC', 'el candado no impide intercambiar (FR-035)');
  eq(m.bloqueados, ['int-pedro'], 'y Pedro sigue fijado');
});

prueba('"intercambio/S-02" Lucas y Tomás intercambian equipo y puesto, y cada equipo conserva sus puestos', () => {
  const m = partido('m-int-8');
  const puestosDe = equipo => m.equipos[equipo].map(id => puesto(m, id)).sort();
  const antes = { blanco: puestosDe('blanco'), negro: puestosDe('negro') };
  I.intercambiarUnidades(m, 'int-lucas', 'int-tomas');
  ok(m.equipos.negro.includes('int-lucas') && puesto(m, 'int-lucas') === 'MD', 'Lucas en el Negro de MD (FR-031)');
  ok(m.equipos.blanco.includes('int-tomas') && puesto(m, 'int-tomas') === 'MC', 'Tomás en el Blanco de MC');
  eq({ blanco: puestosDe('blanco'), negro: puestosDe('negro') }, antes, 'los dos equipos tienen los mismos puestos que antes');
});

prueba('"intercambio/S-02c" una dupla con un jugador suelto: misma cantidad de unidades, distinta de personas', () => {
  const m = partido('m-int-9');   // la dupla Ramiro + Esteban, MC del Blanco; Ezequiel, MC del Negro
  const unidades = [unidadesDe(m, 'blanco'), unidadesDe(m, 'negro')];
  ok(I.evaluarIntercambio(m, 'int-ramiro', 'int-ezequiel', porId).valido, 'son candidatos entre sí');
  I.intercambiarUnidades(m, 'int-ramiro', 'int-ezequiel');
  ok(m.equipos.negro.includes('int-ramiro') && m.equipos.negro.includes('int-esteban'), 'la dupla viaja entera');
  eq([unidadesDe(m, 'blanco'), unidadesDe(m, 'negro')], unidades, 'las unidades no cambian (FR-032)');
  eq([m.equipos.blanco.length, m.equipos.negro.length], [9, 10], 'las personas sí: el Blanco tenía 10 y el Negro 9');
});

prueba('"intercambio/S-05" sin puestos sólo cambia el equipo y no escribe ningún puesto asignado', () => {
  const m = partido('m-int-puntaje');
  const override = JSON.stringify(m.equipos.posicionOverride);
  I.intercambiarUnidades(m, 'int-nico', 'int-diego');
  ok(m.equipos.negro.includes('int-nico') && m.equipos.blanco.includes('int-diego'), 'cambiaron de equipo');
  ok(!('posicionAsignada' in m.equipos), 'no apareció posicionAsignada (FR-033)');
  eq(JSON.stringify(m.equipos.posicionOverride), override, 'la marca de dibujo del arquero no se toca');
});

prueba('"intercambio/NFR-005" el intercambio escribe sólo los dos equipos y los puestos de las dos unidades', () => {
  const m = partido('m-int-9');
  const antes = JSON.parse(JSON.stringify(m));
  I.intercambiarUnidades(m, 'int-ramiro', 'int-ezequiel');
  const sinReparto = x => { const c = JSON.parse(JSON.stringify(x)); ['blanco', 'negro', 'posicionAsignada'].forEach(k => delete c.equipos[k]); return c; };
  eq(sinReparto(m), sinReparto(antes), 'nada fuera de blanco, negro y posicionAsignada; sumaBlanco y sumaNegro incluidas');
  const cambiadas = Object.keys(m.equipos.posicionAsignada).filter(k => m.equipos.posicionAsignada[k] !== antes.equipos.posicionAsignada[k]);
  ok(cambiadas.every(k => ['int-ramiro', 'int-esteban', 'int-ezequiel'].includes(k)), `cambiaron entradas ajenas: ${cambiadas.join(', ')}`);
});

console.log('\n\x1b[1mEL DROP\x1b[0m — resolverDestinoDrop\n');

prueba('"intercambio/S-03" soltar sobre una camiseta del propio equipo es un intercambio a evaluar', () => {
  eq(I.resolverDestinoDrop(partido('m-int-8'), 'int-juan', { clase: 'camiseta', id: 'int-pedro' }),
    { tipo: 'intercambiar', idDestino: 'int-pedro' }, 'la regla la aplica después aplicarDrop (FR-041, TD-05)');
});

prueba('"intercambio/S-03d" soltar sobre sí misma, sobre su pareja de dupla o sobre la cancha propia no hace nada', () => {
  const m = partido('m-int-9');
  eq(I.resolverDestinoDrop(m, 'int-juan', { clase: 'camiseta', id: 'int-juan' }), null, 'sobre sí misma (FR-044)');
  eq(I.resolverDestinoDrop(m, 'int-ramiro', { clase: 'camiseta', id: 'int-esteban' }), null, 'sobre la pareja de su dupla');
  eq(I.resolverDestinoDrop(m, 'int-juan', { clase: 'cancha', equipo: 'blanco' }), null, 'sobre la cancha propia');
  eq(I.resolverDestinoDrop(m, 'int-juan', { clase: 'cancha', equipo: 'negro' }), { tipo: 'mover', equipo: 'negro' }, 'sobre la del otro equipo, el pase de siempre (FR-043)');
});

console.log('\n\x1b[1mLOS AVISOS\x1b[0m — textoAvisoIntercambio\n');

prueba('"intercambio/S-03a" soltar sobre un compañero que no cubre DC avisa quién no juega de qué', () => {
  const m = partido('m-int-8');
  const e = I.evaluarIntercambio(m, 'int-juan', 'int-nico', porId);
  eq(e, { valido: false, motivo: 'b-no-cubre' }, 'Juan cubre LI y Nico no cubre DC');
  eq(I.avisoDeRechazo(m, 'int-juan', 'int-nico', e.motivo, porId), 'Nicolás Lagos no juega de Defensor Central', 'FR-042b');
});

prueba('"intercambio/S-03b" los otros dos textos del rechazo, y ninguno para el mismo puesto', () => {
  eq(I.textoAvisoIntercambio('a-no-cubre', { a: 'Lucas Herrera', puestoB: 'DEL' }), 'Lucas Herrera no juega de Delantero Central', 'FR-042c');
  eq(I.textoAvisoIntercambio('ninguno-cubre', {}), 'Ninguno de los dos juega en el puesto del otro', 'FR-042d');
  eq(I.textoAvisoIntercambio('mismo-puesto', {}), null, 'un compañero del mismo puesto no tiene nada que explicar (FR-042)');
  eq(I.textoAvisoIntercambio('mismo-equipo', {}), null, 'sin puestos, el propio equipo tampoco (FR-045b)');
});

prueba('"intercambio/S-21" el nombre del aviso de un drop rechazado va tal cual, como texto, para insertarse con textContent', () => {
  const m = partido('m-int-8');
  eq(I.avisoDeRechazo(m, 'int-diego', 'int-img', 'b-no-cubre', porId), '<img src=x onerror=alert(1)> no juega de Defensor Central',
    'texto plano: escaparlo acá lo mostraría con entidades, porque el aviso usa textContent (TC-041)');
});

prueba('"intercambio/S-21a" el nombre del aviso sin candidatos va tal cual, como texto', () => {
  const m = partido('m-int-8');
  eq(I.textoAvisoIntercambio('sin-candidatos', { a: I.nombreDeGrupo(I.grupoDeUnidad(m, 'int-img')) }),
    'Nadie puede intercambiar puesto con <img src=x onerror=alert(1)>', 'FR-018, TC-041');
});

prueba('"intercambio/TC-043" ningún aviso lleva puntajes: no hay dígitos fuera de los nombres', () => {
  const textos = [
    I.textoAvisoIntercambio('sin-candidatos', { a: 'Juan Pérez' }),
    I.textoAvisoIntercambio('reparto-cambio'),
    I.textoAvisoIntercambio('b-no-cubre', { b: 'Pedro Gómez', puestoA: 'DC' }),
    I.textoAvisoIntercambio('a-no-cubre', { a: 'Juan Pérez', puestoB: 'LD' }),
    I.textoAvisoIntercambio('ninguno-cubre', {}),
  ];
  textos.forEach(t => ok(!/\d/.test(t), `"${t}" tiene un número`));
});

prueba('"intercambio/S-01e" el nombre de una dupla en un aviso es el de su camiseta: los dos, con barra', () => {
  const m = partido('m-int-9');
  eq(I.nombreDeGrupo(I.grupoDeUnidad(m, 'int-esteban')), 'Ramiro Castro / Esteban Luna', 'TD-12');
});

/* ---------- propiedades ---------- */
console.log('\n\x1b[1mPROPIEDADES\x1b[0m — 500 pares al azar, semilla fija\n');

/* mulberry32: un generador chico y determinista. Con la semilla fija, una falla se repite igual. */
function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const PUESTOS_8 = ['Arquero', 'LI', 'DC', 'LD', 'MI', 'MC', 'MD', 'DEL'];
/* Un partido de Fútbol 8 al azar con los ocho puestos: cada lugar lo ocupa un jugador o, una vez
   de cada cinco, una dupla. La principal es la del lugar la mitad de las veces; las secundarias,
   de cero a dos al azar. Así hay de todo: quien cubre su lugar, quien no, duplas que lo cubren por
   un solo integrante. */
function partidoAlAzar(r, n) {
  const elegir = lista => lista[Math.floor(r() * lista.length)];
  const jugadores = [];
  const jugador = (id, lugar) => {
    const principal = r() < 0.5 ? lugar : elegir(PUESTOS_8);
    const secundarias = [...new Set(Array.from({ length: Math.floor(r() * 3) }, () => elegir(PUESTOS_8)))].filter(p => p !== principal);
    const scores = Object.fromEntries([principal, ...secundarias].map(p => [p, 1 + Math.floor(r() * 9)]));
    const p = { id, nombre: id, apellido: '', principal, secundarias, scores };
    jugadores.push(p);
    return p;
  };
  const m = { id: `azar-${n}`, duplas: [], bloqueados: [],
    equipos: { blanco: [], negro: [], posicionAsignada: {}, sumaBlanco: 0, sumaNegro: 0,
      arquerosInfo: { compensado: r() < 0.5, equipoCompensado: elegir(['blanco', 'negro']), compensacion: Math.floor(r() * 6) } } };
  ['blanco', 'negro'].forEach(equipo => PUESTOS_8.forEach((lugar, i) => {
    const base = `${equipo[0]}${n}-${i}`;
    const ids = r() < 0.2 ? [base + 'a', base + 'b'] : [base];
    ids.forEach(id => { jugador(id, lugar); m.equipos[equipo].push(id); m.equipos.posicionAsignada[id] = lugar; });
    if (ids.length === 2) m.duplas.push(ids);
  }));
  return { m, jugadores };
}
/* Corre `cuantos` intercambios válidos al azar y le pasa cada uno a `verificar`. */
function intercambiosAlAzar(semilla, cuantos, verificar) {
  const r = azar(semilla);
  let aplicados = 0, intentos = 0;
  while (aplicados < cuantos && intentos < cuantos * 40) {
    intentos++;
    const { m, jugadores } = partidoAlAzar(r, intentos);
    I.__setPlayers(jugadores);
    const pid = Object.fromEntries(jugadores.map(p => [p.id, p]));
    const todos = [...m.equipos.blanco, ...m.equipos.negro];
    const a = todos[Math.floor(r() * todos.length)], b = todos[Math.floor(r() * todos.length)];
    if (!I.evaluarIntercambio(m, a, b, pid).valido) continue;
    const antes = JSON.parse(JSON.stringify(m));
    I.intercambiarUnidades(m, a, b);
    verificar({ m, antes, a, b, pid });
    aplicados++;
  }
  usarPlantel();
  ok(aplicados === cuantos, `sólo se encontraron ${aplicados} intercambios válidos en ${intentos} intentos`);
}

prueba('"intercambio/S-01l" tras todo intercambio válido, cada una de las dos unidades queda en un puesto que cubre', () => {
  intercambiosAlAzar(0x5eed01, 500, ({ m, a, b, pid }) => {
    [a, b].forEach(id => {
      const costo = I.cubrePosicionGuardada(I.unidadDeCobertura(m, id, pid), m.equipos.posicionAsignada[id]);
      ok(costo < I.COSTO_DESCUBIERTA, `${id} quedó de ${m.equipos.posicionAsignada[id]}, que no cubre (FR-021)`);
    });
  });
});

prueba('"intercambio/S-01m" tras todo intercambio, cada equipo tiene la misma cantidad de unidades', () => {
  intercambiosAlAzar(0x5eed02, 500, ({ m, antes }) => {
    const u = (x, e) => I.agruparFilasDeEquipo(x, I.jugadoresDeEquipoOrdenados(x, x.equipos[e])).length;
    eq([u(m, 'blanco'), u(m, 'negro')], [u(antes, 'blanco'), u(antes, 'negro')], `en ${m.id} (FR-032)`);
  });
});

prueba('"intercambio/S-04d" ningún intercambio modifica la ventaja por no tener arquero fijo', () => {
  intercambiosAlAzar(0x5eed03, 500, ({ m, antes }) => {
    eq(m.equipos.arquerosInfo, antes.equipos.arquerosInfo, `en ${m.id} (FR-057)`);
  });
});

/* ---------- la misma regla que "lugares sin cubrir" ---------- */
console.log('\n\x1b[1mTC-010\x1b[0m — la compatibilidad y "lugares sin cubrir" no pueden disentir\n');

prueba('"intercambio/TC-010" para todo par (unidad, puesto), cubrir según el intercambio es no faltar según el recálculo', () => {
  /* Fútbol 9 con la dupla y con Ramón fuera de su puesto. Para cada unidad U y cada lugar de la
     formación, se le da a U ese lugar —intercambiando con quien lo ocupaba, para que no quede
     ninguno vacío— y se compara lo que `faltantesDeFormacionVigente` cuenta como descubierto con
     lo que da `cubrePosicionGuardada(unidadDeCobertura(...))` para cada unidad de ese reparto.
     Incluye a la dupla asignada a puestos que cubre por uno solo de sus integrantes (AC-33). */
  /* La dupla va en los dos órdenes: Esteban (MC) cubre un subconjunto de lo que cubre Ramiro
     (LD, MC), así que con Ramiro primero, mirar sólo al primer integrante daría lo mismo que mirar
     a la unidad, y el caso no distinguiría una cosa de la otra. */
  const lugares = ['LI', 'DC', 'LD', 'MI', 'MC', 'MD', 'DEL'];
  let comparados = 0;
  [false, true].forEach(invertida => {
  const base = partido('m-int-9');
  base.equipos.formacion = { objetivo: { LI: 1, DC: 1, LD: 1, MI: 1, MC: 2, MD: 1, DEL: 1 } };
  if (invertida) {
    const b = base.equipos.blanco, i = b.indexOf('int-ramiro');
    [b[i], b[i + 1]] = [b[i + 1], b[i]];
  }
  ['blanco', 'negro'].forEach(equipo => {
    const grupos = I.agruparFilasDeEquipo(base, I.jugadoresDeEquipoOrdenados(base, base.equipos[equipo]));
    grupos.forEach(grupo => lugares.forEach(lugar => {
      const m = JSON.parse(JSON.stringify(base));
      const ocupante = grupos.map(g => g[0].id).find(id => puesto(m, id) === lugar && !I.mismaUnidad(m, id, grupo[0].id));
      if (ocupante) I.intercambiarUnidades(m, grupo[0].id, ocupante);
      else return;
      const esperado = I.agruparFilasDeEquipo(m, I.jugadoresDeEquipoOrdenados(m, m.equipos[equipo]))
        .map(g => g[0].id)
        .filter(id => lugares.includes(puesto(m, id)))
        .filter(id => I.cubrePosicionGuardada(I.unidadDeCobertura(m, id, porId), puesto(m, id)) >= I.COSTO_DESCUBIERTA)
        .map(id => puesto(m, id)).sort();
      eq(I.faltantesDeFormacionVigente(m, porId)[equipo].slice().sort(), esperado,
        `${equipo}: ${I.nombreDeGrupo(grupo)} de ${lugar}`);
      comparados++;
    }));
  });
  });
  ok(comparados > 50, `sólo se compararon ${comparados} repartos`);
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ el intercambio decide, escribe y avisa como fija la Spec\x1b[0m');
process.exit(0);
