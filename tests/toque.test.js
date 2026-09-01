#!/usr/bin/env node
/* Tests de la carga por toque (rebanada 6 de "Equipos en el campo"). Se corren con:
 *
 *     node tests/toque.test.js
 *
 * Cubre las siete funciones puras que sostienen el toque —familia de un tipo, validación,
 * agregar, quitar por familia, deshacer, el predicado del modo de carga y las filas de detalle—
 * más el test de propiedad que verifica NFR-004 (el marcador coincide siempre con
 * `totalGolesEquipo` aplicado al borrador). Lo que sólo se puede afirmar sobre un toque real en el
 * DOM —tocar `.camiseta-nombre`, la dupla, Deshacer deshabilitado visualmente, Finalizar/Editar—
 * vive en tests/layout.test.js (Implementation Plan, TD-05, §12.1).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, con el prefijo de rebanada
 * ("toque/S-01b"), que es la convención de binding que fija AGENTS.md.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/equipos-en-el-campo/rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia, más las dos de la rebanada 5 que el test de propiedad reutiliza
   (TC-002, mismo criterio que eventos.test.js). `players` y `editandoResultadoFinalizado` los
   declara el prelude con setters: son las dos variables de módulo externas que estas funciones
   leen. */
const DECLARACIONES = [
  'familiaDeTipo',
  'puedeAgregarEvento',
  'agregarEvento',
  'quitarUltimoDeFamilia',
  'deshacerUltimoEvento',
  'enModoCarga',
  'detalleCargaDeEquipo',
  'statsPorJugadorDesdeEventos',
  'totalGolesEquipo',
];

function cargarToque(){
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  const prelude = `
    let players = [];
    let editandoResultadoFinalizado = null;
    function __setPlayers(p){ players = p; }
    function __setEditando(id){ editandoResultadoFinalizado = id; }
  `;
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, __setEditando, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const P = cargarToque();

/* ---------- helpers de aserción (mismos que eventos.test.js/finalizado.test.js) ---------- */
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

/* ---------- helpers de dominio ---------- */
const BLANCO = ['j1', 'j2', 'j3'];
const NEGRO = ['j4', 'j5', 'j6'];
const CONVOCADOS = [...BLANCO, ...NEGRO];
const equipoDe = (id) => BLANCO.includes(id) ? BLANCO : NEGRO;
const TIPOS = ['gol', 'golPenal', 'golEnContra', 'asistencia'];

/* Genera una secuencia de N toques válidos: en cada paso elige jugador y tipo al azar y sólo
   agrega el evento si `puedeAgregarEvento` lo permite contra el borrador acumulado hasta ese
   momento (FR-032, FR-034) — nunca contra un snapshot inicial (T-1.25). */
function secuenciaDeToquesValidos(n){
  let eventos = [];
  for(let i = 0; i < n; i++){
    const jugadorId = CONVOCADOS[Math.floor(Math.random() * CONVOCADOS.length)];
    const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const idsEquipoDeJugador = equipoDe(jugadorId);
    if(P.puedeAgregarEvento(eventos, CONVOCADOS, jugadorId, tipo, idsEquipoDeJugador)){
      eventos = P.agregarEvento(eventos, jugadorId, tipo);
    }
  }
  return eventos;
}

console.log(`\nLa carga por toque — ${SPEC}\n`);

/* ================================================================= LA VALIDACIÓN */
console.log('\x1b[1mLA VALIDACIÓN\x1b[0m — puedeAgregarEvento decide antes de agregar (FR-032, FR-033, FR-034)\n');

prueba('"toque/S-01b" un jugador que no pertenece a la convocatoria se rechaza sin cambiar el borrador', () => {
  const eventos = [];
  const puede = P.puedeAgregarEvento(eventos, CONVOCADOS, 'intruso', 'gol', BLANCO);
  eq(puede, false, 'el jugador "intruso" no está en CONVOCADOS');
});

prueba('"toque/S-02" un penal a un jugador con cero goles previos se permite (FR-033: sin restricción histórica)', () => {
  const puede = P.puedeAgregarEvento([], CONVOCADOS, 'j1', 'golPenal', BLANCO);
  eq(puede, true, 'un golPenal nunca se deshabilita por los goles previos del jugador');
});

prueba('"toque/S-03" una asistencia se permite cuando el equipo del jugador ya tiene un gol en el borrador', () => {
  const eventos = [{ jugadorId: 'j1', tipo: 'gol' }];
  const puede = P.puedeAgregarEvento(eventos, CONVOCADOS, 'j2', 'asistencia', BLANCO);
  eq(puede, true, 'j1 y j2 son del mismo equipo (Blanco) y Blanco ya metió un gol');
});

prueba('"toque/S-03a" una asistencia se rechaza cuando el equipo del jugador tocado tiene cero goles', () => {
  const eventos = [{ jugadorId: 'j4', tipo: 'golEnContra' }]; // en contra no cuenta como gol propio (familia "contra")
  const puede = P.puedeAgregarEvento(eventos, CONVOCADOS, 'j1', 'asistencia', BLANCO);
  eq(puede, false, 'Blanco no tiene ningún evento de familia "goles" en el borrador');
});

prueba('"toque/S-03b" la regla de asistencia se evalúa contra el borrador actual, no un snapshot inicial', () => {
  let eventos = [];
  eq(P.puedeAgregarEvento(eventos, CONVOCADOS, 'j2', 'asistencia', BLANCO), false, 'todavía sin goles, se rechaza');
  eventos = P.agregarEvento(eventos, 'j1', 'gol'); // Blanco mete un gol dentro de la misma sesión
  eq(P.puedeAgregarEvento(eventos, CONVOCADOS, 'j2', 'asistencia', BLANCO), true, 'ahora sí, evaluado contra el borrador ya actualizado');
});

/* ================================================================= EL PENAL, COMO PROPIEDAD */
console.log('\n\x1b[1mEL PENAL\x1b[0m — golesPenal nunca supera a goles, para cualquier secuencia de toques (D-04)\n');

prueba('"toque/S-02b" [property] para 500 secuencias de toques válidos, golesPenal <= goles en todo jugador', () => {
  for(let i = 0; i < 500; i++){
    const eventos = secuenciaDeToquesValidos(20);
    const stats = P.statsPorJugadorDesdeEventos(eventos, CONVOCADOS);
    Object.entries(stats).forEach(([id, st]) => {
      ok(st.golesPenal <= st.goles, `iteración ${i}, jugador ${id}: golesPenal (${st.golesPenal}) > goles (${st.goles}) — eventos: ${JSON.stringify(eventos)}`);
    });
  }
});

/* ================================================================= EL BOTÓN "−" */
console.log('\n\x1b[1mEL BOTÓN "−"\x1b[0m — quitarUltimoDeFamilia quita el más reciente de esa familia y jugador (FR-051)\n');

prueba('"toque/S-04" con dos eventos de la familia "goles" (uno golPenal), "−" quita el golPenal, el más reciente', () => {
  const eventos = [
    { jugadorId: 'j1', tipo: 'gol' },
    { jugadorId: 'j1', tipo: 'golPenal' },
  ];
  const resultado = P.quitarUltimoDeFamilia(eventos, 'j1', 'goles');
  eq(resultado, [{ jugadorId: 'j1', tipo: 'gol' }], 'queda sólo el gol de juego, sin la nota de penal');
});

prueba('"toque/S-04a" [boundary] una fila con un solo evento desaparece de detalleCargaDeEquipo tras el "−"', () => {
  P.__setPlayers([{ id: 'j1' }]);
  const antes = P.detalleCargaDeEquipo(['j1'], [{ jugadorId: 'j1', tipo: 'gol' }]);
  eq(antes.length, 1, 'antes de quitar, la fila de goles de j1 existe');
  const despues = P.quitarUltimoDeFamilia([{ jugadorId: 'j1', tipo: 'gol' }], 'j1', 'goles');
  const filas = P.detalleCargaDeEquipo(['j1'], despues);
  eq(filas, [], 'sin eventos, la fila de detalle de j1 desaparece (FR-053)');
});

prueba('"toque/S-04b" [property] "−" quita siempre el más reciente de esa familia y jugador, sin importar qué haya entre medio', () => {
  for(let i = 0; i < 200; i++){
    const eventos = secuenciaDeToquesValidos(25);
    // Elige al azar una combinación jugador+familia que sí tenga al menos un evento.
    const candidatos = eventos.map((ev, idx) => ({ idx, jugadorId: ev.jugadorId, familia: P.familiaDeTipo(ev.tipo) }));
    if(candidatos.length === 0) continue;
    const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    const ultimoIdxEsperado = [...eventos].map((ev, idx) => ({ idx, jugadorId: ev.jugadorId, familia: P.familiaDeTipo(ev.tipo) }))
      .filter(c => c.jugadorId === elegido.jugadorId && c.familia === elegido.familia)
      .pop().idx;
    const esperado = [...eventos.slice(0, ultimoIdxEsperado), ...eventos.slice(ultimoIdxEsperado + 1)];
    const resultado = P.quitarUltimoDeFamilia(eventos, elegido.jugadorId, elegido.familia);
    eq(resultado, esperado, `iteración ${i}: se quitó un índice distinto del más reciente para ${elegido.jugadorId}/${elegido.familia}`);
  }
});

prueba('"toque/S-04c" [property] si el evento quitado es un golPenal, goles y golesPenal bajan a la vez, nunca golesPenal > goles', () => {
  for(let i = 0; i < 200; i++){
    let eventos = secuenciaDeToquesValidos(15);
    eventos = P.agregarEvento(eventos, 'j1', 'golPenal'); // asegura al menos un golPenal de j1 al final
    const antes = P.statsPorJugadorDesdeEventos(eventos, CONVOCADOS).j1;
    const despues = P.statsPorJugadorDesdeEventos(P.quitarUltimoDeFamilia(eventos, 'j1', 'goles'), CONVOCADOS).j1;
    eq(despues.goles, antes.goles - 1, `iteración ${i}: goles debía bajar en uno`);
    eq(despues.golesPenal, antes.golesPenal - 1, `iteración ${i}: golesPenal debía bajar en uno junto con goles`);
    ok(despues.golesPenal <= despues.goles, `iteración ${i}: golesPenal (${despues.golesPenal}) > goles (${despues.goles})`);
  }
});

/* ================================================================= DESHACER */
console.log('\n\x1b[1mDESHACER\x1b[0m — deshacerUltimoEvento quita el más reciente de todo el borrador (FR-061)\n');

prueba('"toque/S-05" Deshacer quita el evento agregado más recientemente, sin importar jugador ni tipo', () => {
  const eventos = [
    { jugadorId: 'j1', tipo: 'gol' },
    { jugadorId: 'j4', tipo: 'asistencia' },
  ];
  eq(P.deshacerUltimoEvento(eventos), [{ jugadorId: 'j1', tipo: 'gol' }], 'se quita el último, sin importar a quién pertenece');
});

prueba('"toque/S-05b" [property] deshacer tantas veces como eventos tenga el borrador lo deja exactamente vacío', () => {
  for(let i = 0; i < 100; i++){
    let eventos = secuenciaDeToquesValidos(Math.floor(Math.random() * 15));
    const n = eventos.length;
    for(let k = 0; k < n; k++) eventos = P.deshacerUltimoEvento(eventos);
    eq(eventos, [], `iteración ${i}: tras ${n} deshacer, el borrador debía quedar vacío`);
  }
});

prueba('"toque/S-05c" [concurrency] Deshacer tras un doble toque casi simultáneo quita exactamente uno, el más reciente', () => {
  let eventos = [];
  // Simula S-01c: dos toques sobre el mismo jugador sin esperar entre medio.
  eventos = P.agregarEvento(eventos, 'j1', 'gol');
  eventos = P.agregarEvento(eventos, 'j1', 'gol');
  eq(eventos.length, 2, 'el doble toque agregó dos eventos');
  const despuesDeDeshacer = P.deshacerUltimoEvento(eventos);
  eq(despuesDeDeshacer.length, 1, 'Deshacer quitó exactamente uno de los dos');
  eq(despuesDeDeshacer, [{ jugadorId: 'j1', tipo: 'gol' }], 'queda el primero de los dos toques');
});

/* ================================================================= CAMBIAR DE EQUIPO */
console.log('\n\x1b[1mCAMBIAR DE EQUIPO\x1b[0m — el marcador del equipo no visible también deriva del borrador completo (FR-020 a FR-022)\n');

prueba('"toque/S-06a" [property] el marcador de cada equipo coincide con totalGolesEquipo, esté o no a la vista', () => {
  for(let i = 0; i < 200; i++){
    const eventos = secuenciaDeToquesValidos(20);
    const stats = P.statsPorJugadorDesdeEventos(eventos, CONVOCADOS);
    const marcadorBlanco = P.totalGolesEquipo(BLANCO, NEGRO, stats);
    const marcadorNegro = P.totalGolesEquipo(NEGRO, BLANCO, stats);
    // Cálculo independiente: goles propios (de juego + penal) del equipo, más los en contra que
    // metió el rival en su propio arco.
    const cuenta = (idsPropio, idsRival) => eventos.filter(ev => idsPropio.includes(ev.jugadorId) && (ev.tipo === 'gol' || ev.tipo === 'golPenal')).length
      + eventos.filter(ev => idsRival.includes(ev.jugadorId) && ev.tipo === 'golEnContra').length;
    eq(marcadorBlanco, cuenta(BLANCO, NEGRO), `iteración ${i}: marcador de Blanco no coincide con el cálculo independiente`);
    eq(marcadorNegro, cuenta(NEGRO, BLANCO), `iteración ${i}: marcador de Negro no coincide con el cálculo independiente — el equipo "no visible" deriva igual (FR-022)`);
  }
});

/* ================================================================= EL MARCADOR, COMO PROPIEDAD */
console.log('\n\x1b[1mEL MARCADOR\x1b[0m — coincide siempre con totalGolesEquipo sobre el borrador (NFR-004, T-1.25)\n');

prueba('"toque/S-01d" [property] para 500 secuencias de hasta 6 convocados, el marcador coincide con totalGolesEquipo(borrador) (NFR-004)', () => {
  for(let i = 0; i < 500; i++){
    const eventos = secuenciaDeToquesValidos(20);
    const stats = P.statsPorJugadorDesdeEventos(eventos, CONVOCADOS);
    const marcadorBlanco = P.totalGolesEquipo(BLANCO, NEGRO, stats);
    const marcadorNegro = P.totalGolesEquipo(NEGRO, BLANCO, stats);
    const cuenta = (idsPropio, idsRival) => eventos.filter(ev => idsPropio.includes(ev.jugadorId) && (ev.tipo === 'gol' || ev.tipo === 'golPenal')).length
      + eventos.filter(ev => idsRival.includes(ev.jugadorId) && ev.tipo === 'golEnContra').length;
    eq(marcadorBlanco, cuenta(BLANCO, NEGRO), `iteración ${i}: Blanco — eventos: ${JSON.stringify(eventos)}`);
    eq(marcadorNegro, cuenta(NEGRO, BLANCO), `iteración ${i}: Negro — eventos: ${JSON.stringify(eventos)}`);
  }
});

/* ================================================================= EL MODO DE CARGA */
console.log('\n\x1b[1mEL MODO DE CARGA\x1b[0m — enModoCarga (FR-001, FR-002)\n');

prueba('enModoCarga es cierto con la inscripción cerrada y el partido sin finalizar', () => {
  P.__setEditando(null);
  eq(P.enModoCarga({ inscripcionCerrada: true, estado: 'Equipos generados', id: 'm1' }), true, 'inscripción cerrada, no finalizado');
});

prueba('enModoCarga es cierto sobre un finalizado con su edición en curso, y falso sin ella', () => {
  P.__setEditando('m1');
  eq(P.enModoCarga({ inscripcionCerrada: true, estado: 'Finalizado', id: 'm1' }), true, 'edición en curso sobre ese mismo partido');
  eq(P.enModoCarga({ inscripcionCerrada: true, estado: 'Finalizado', id: 'm2' }), false, 'finalizado, pero de OTRO partido');
  P.__setEditando(null);
  eq(P.enModoCarga({ inscripcionCerrada: true, estado: 'Finalizado', id: 'm1' }), false, 'finalizado, sin ninguna edición en curso');
});

/* ---------- salida ---------- */
console.log('');
if (fallos.length) {
  console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
  process.exit(1);
}
console.log(`Pasaron: ${pasaron}/${pasaron}`);
console.log('\x1b[32m✓ la carga por toque valida, agrega, quita y deshace como fija la Spec\x1b[0m\n');
