#!/usr/bin/env node
/* Tests del modelo de eventos (rebanada 5 de "Equipos en el campo"). Se corren con:
 *
 *     node tests/eventos.test.js
 *
 * Cubre las tres funciones puras que reemplazan la persistencia de resultado —síntesis,
 * derivación y el despacho entre eventos y statsPorJugador— y el recálculo acumulado sobre un
 * historial con partidos de los dos formatos. Esta rebanada no tiene ninguna superficie visual:
 * lo que se escribe realmente al finalizar o editar un partido vive en tests/layout.test.js
 * (Implementation Plan, TD-07).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, con el prefijo de rebanada
 * ("eventos/S-01a"), que es la convención de binding que fija AGENTS.md.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/equipos-en-el-campo/rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia. `matches` y `players` los declara el prelude con setters, mismo
   criterio que finalizado.test.js usa para `players`. */
const DECLARACIONES = [
  'totalGolesEquipo',
  'statsPorJugadorDesdeEventos',
  'eventosDesdeStats',
  'statsPorJugadorDelPartido',
  'recomputeAllPlayerStatsFromMatches',
];

function cargarEventos() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  const prelude = `
    let matches = [];
    let players = [];
    function __setMatches(m){ matches = m; }
    function __setPlayers(p){ players = p; }
  `;
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setMatches, __setPlayers, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const P = cargarEventos();

/* ---------- helpers de aserción (mismos que finalizado.test.js) ---------- */
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
const borradorAlAzar = (ids) => {
  const stats = {};
  ids.forEach(id => {
    const goles = Math.floor(Math.random() * 6);
    stats[id] = {
      goles,
      golesPenal: Math.floor(Math.random() * (goles + 1)), // golesPenal <= goles, mismo clamp que la grilla
      golesEnContra: Math.floor(Math.random() * 4),
      asistencias: Math.floor(Math.random() * 5),
    };
  });
  return stats;
};

console.log(`\nEl modelo de eventos — ${SPEC}\n`);

/* ================================================================= LA SÍNTESIS DE EVENTOS */
console.log('\x1b[1mLA SÍNTESIS\x1b[0m — de un borrador de contadores a una secuencia de eventos (FR-020, FR-021)\n');

prueba('"eventos/S-01" sintetiza goles, penal, en contra y asistencia en el orden fijo', () => {
  const stats = { j1: { goles: 2, golesPenal: 1, golesEnContra: 1, asistencias: 1 } };
  const eventos = P.eventosDesdeStats(['j1'], stats);
  eq(eventos, [
    { jugadorId: 'j1', tipo: 'gol' },
    { jugadorId: 'j1', tipo: 'golPenal' },
    { jugadorId: 'j1', tipo: 'golEnContra' },
    { jugadorId: 'j1', tipo: 'asistencia' },
  ], 'un gol de juego, un penal, un en contra y una asistencia, en ese orden');
});

prueba('"eventos/S-01a" un borrador en cero sintetiza un arreglo vacío, no ausente', () => {
  const stats = { j1: { goles: 0, golesPenal: 0, golesEnContra: 0, asistencias: 0 }, j2: { goles: 0, golesPenal: 0, golesEnContra: 0, asistencias: 0 } };
  const eventos = P.eventosDesdeStats(['j1', 'j2'], stats);
  ok(Array.isArray(eventos), 'sigue siendo un arreglo');
  eq(eventos.length, 0, 'sin eventos');
});

prueba('"eventos/S-01b" un jugador con 5 goles (3 de penal), 2 en contra y 4 asistencias', () => {
  const eventos = P.eventosDesdeStats(['j1'], { j1: { goles: 5, golesPenal: 3, golesEnContra: 2, asistencias: 4 } });
  const contar = tipo => eventos.filter(e => e.tipo === tipo).length;
  eq(contar('gol'), 2, '2 goles de juego (5 - 3 de penal)');
  eq(contar('golPenal'), 3, '3 de penal');
  eq(contar('golEnContra'), 2, '2 en contra');
  eq(contar('asistencia'), 4, '4 asistencias');
  eq(eventos.length, 11, 'once eventos en total (2 + 3 + 2 + 4)');
});

prueba('"eventos/S-01c" [property] sintetizar y derivar un borrador cualquiera devuelve exactamente ese borrador (NFR-001)', () => {
  const ids = ['j1', 'j2', 'j3', 'j4'];
  for (let i = 0; i < 500; i++) {
    const stats = borradorAlAzar(ids);
    const eventos = P.eventosDesdeStats(ids, stats);
    const derivado = P.statsPorJugadorDesdeEventos(eventos, ids);
    eq(derivado, stats, `iteración ${i} con el borrador ${JSON.stringify(stats)}`);
  }
});

/* ================================================================= LA DERIVACIÓN DE ESTADÍSTICAS */
console.log('\n\x1b[1mLA DERIVACIÓN\x1b[0m — de una secuencia de eventos a los cuatro contadores (FR-010 a FR-016)\n');

prueba('"eventos/S-02" la derivación reproduce goles, penal, en contra y asistencias', () => {
  const eventos = [
    { jugadorId: 'j1', tipo: 'gol' }, { jugadorId: 'j1', tipo: 'golPenal' },
    { jugadorId: 'j2', tipo: 'asistencia' }, { jugadorId: 'j3', tipo: 'golEnContra' },
  ];
  const stats = P.statsPorJugadorDesdeEventos(eventos, ['j1', 'j2', 'j3', 'j4']);
  eq(stats.j1, { goles: 2, golesPenal: 1, golesEnContra: 0, asistencias: 0 }, 'j1: 2 goles (1 de penal)');
  eq(stats.j2, { goles: 0, golesPenal: 0, golesEnContra: 0, asistencias: 1 }, 'j2: 1 asistencia');
  eq(stats.j3, { goles: 0, golesPenal: 0, golesEnContra: 1, asistencias: 0 }, 'j3: 1 en contra');
});

prueba('"eventos/S-02a" gol + gol en contra + asistencia a la vez, derivados los tres', () => {
  const eventos = [
    { jugadorId: 'j1', tipo: 'gol' },
    { jugadorId: 'j1', tipo: 'golEnContra' },
    { jugadorId: 'j1', tipo: 'asistencia' },
  ];
  const stats = P.statsPorJugadorDesdeEventos(eventos, ['j1']);
  eq(stats.j1, { goles: 1, golesPenal: 0, golesEnContra: 1, asistencias: 1 }, 'los tres contadores no nulos a la vez');
});

prueba('"eventos/S-02b" [property] los goles de penal derivados nunca superan a los goles derivados', () => {
  const tipos = ['gol', 'golPenal', 'golEnContra', 'asistencia'];
  const ids = ['j0', 'j1', 'j2'];
  for (let i = 0; i < 500; i++) {
    const eventos = [];
    const n = Math.floor(Math.random() * 20);
    for (let k = 0; k < n; k++){
      eventos.push({ jugadorId: ids[Math.floor(Math.random() * ids.length)], tipo: tipos[Math.floor(Math.random() * tipos.length)] });
    }
    const stats = P.statsPorJugadorDesdeEventos(eventos, ids);
    Object.entries(stats).forEach(([id, st]) => {
      ok(st.golesPenal <= st.goles, `iteración ${i}, jugador ${id}: golesPenal (${st.golesPenal}) > goles (${st.goles}) — eventos: ${JSON.stringify(eventos)}`);
    });
  }
});

prueba('"eventos/S-02c" un partido sin eventos y sin statsPorJugador deriva vacío sin lanzar', () => {
  const m = { equipos: { blanco: ['j1'], negro: ['j2'] }, resultado: {} };
  const stats = P.statsPorJugadorDelPartido(m);
  eq(stats, {}, 'devuelve un objeto vacío, no lanza excepción');
});

prueba('"eventos/S-02d" un jugador convocado sin ningún evento igual tiene entrada en cero', () => {
  const eventos = [{ jugadorId: 'j1', tipo: 'gol' }];
  const stats = P.statsPorJugadorDesdeEventos(eventos, ['j1', 'j2']);
  eq(stats.j2, { goles: 0, golesPenal: 0, golesEnContra: 0, asistencias: 0 }, 'j2 no metió nada pero tiene entrada en cero');
});

prueba('"eventos/despacho" statsPorJugadorDelPartido lee eventos si existen, y statsPorJugador si no', () => {
  const conEventos = { equipos: { blanco: ['j1'], negro: [] },
    resultado: { eventos: [{ jugadorId: 'j1', tipo: 'gol' }] } };
  eq(P.statsPorJugadorDelPartido(conEventos).j1.goles, 1, 'deriva desde eventos');

  const historico = { equipos: { blanco: ['j1'], negro: [] },
    resultado: { statsPorJugador: { j1: { goles: 3, golesPenal: 0, golesEnContra: 0, asistencias: 0 } } } };
  eq(P.statsPorJugadorDelPartido(historico).j1.goles, 3, 'lee statsPorJugador sin tocarlo, cuando no hay eventos');
});

/* ================================================================= EL RECÁLCULO ACUMULADO */
console.log('\n\x1b[1mEL RECÁLCULO ACUMULADO\x1b[0m — convive con partidos de los dos formatos (FR-010 a FR-016)\n');

prueba('"eventos/S-05" recomputeAllPlayerStatsFromMatches suma un partido histórico y uno con eventos', () => {
  const jugadoresTest = [{ id: 'j1' }];
  P.__setPlayers(jugadoresTest);
  P.__setMatches([
    { estado: 'Finalizado', equipos: { blanco: ['j1'], negro: ['j2'] },
      resultado: { statsPorJugador: {
        j1: { goles: 2, golesPenal: 0, golesEnContra: 0, asistencias: 0 },
        j2: { goles: 0, golesPenal: 0, golesEnContra: 0, asistencias: 0 } } } },
    { estado: 'Finalizado', equipos: { blanco: ['j1'], negro: ['j2'] },
      // Un solo evento "golPenal": cuenta como 1 gol Y como 1 penal a la vez (FR-003), nunca dos.
      resultado: { eventos: [
        { jugadorId: 'j1', tipo: 'golPenal' },
      ] } },
  ]);
  P.recomputeAllPlayerStatsFromMatches();
  eq(jugadoresTest[0].golesTotales, 3, '2 goles del partido histórico + 1 del partido con eventos');
  eq(jugadoresTest[0].golesPenalTotales, 1, 'sólo el segundo partido tiene un penal');
  eq(jugadoresTest[0].partidosJugados, 2, 'los dos partidos cuentan como jugados, sin importar el formato');
});

/* ---------- salida ---------- */
console.log('');
if (fallos.length) {
  console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
  process.exit(1);
}
console.log(`Pasaron: ${pasaron}/${pasaron}`);
console.log('\x1b[32m✓ el modelo de eventos deriva y sintetiza como fija la Spec\x1b[0m\n');
