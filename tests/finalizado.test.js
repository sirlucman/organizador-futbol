#!/usr/bin/env node
/* Tests del partido finalizado (rebanada 4 de "Equipos en el campo"). Se corren con:
 *
 *     node tests/finalizado.test.js
 *
 * Cubren lo que decide un número o un texto sin DOM: los chips de estadística, la fila de
 * resultado y las filas de detalle — todas funciones puras que consumen
 * `m.resultado.statsPorJugador`, un dominio de datos que ni `cancha.test.js` (geometría) ni
 * `panel.test.js` (números derivados del motor) cubren. Lo que sólo se puede afirmar sobre el
 * DOM real —que la cancha reemplace a la lista, que el encabezado tenga los dos íconos— vive en
 * tests/layout.test.js (Implementation Plan, TD-08).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, con el prefijo de rebanada
 * ("finalizado/S-03a"), que es la convención de binding que fija AGENTS.md.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia. `players` lo declara el prelude con un setter, con el mismo criterio
   que panel.test.js usa para `motorConfig`. */
const DECLARACIONES = [
  'CANCHAS',
  'ESTRATEGIAS',
  'escaparHtml',
  'fullName',
  'canchaLabel',
  'formacionTexto',
  'totalGolesEquipo',
  'statsPorJugadorDesdeEventos',
  'statsPorJugadorDelPartido',
  'statsAgregadasDeUnidad',
  'GOAL_ICON',
  'RED_GOAL_ICON',
  'BOOT_ICON',
  'renderChipsEstadistica',
  'goleadoresDeEquipo',
  'renderFilasDetalle',
  'ANCHO_UNA_COLUMNA',
  'enUnaColumna',
  'golesEquipoActual',
  'renderFilaResultado',
];

function cargarFinalizado() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  /* `golesEquipoActual` lee el borrador de carga y `enUnaColumna` consulta el ancho: sin
     navegador, el borrador arranca vacío y la media query se responde con el ancho que fije el
     test (por defecto dos columnas, que es donde la fila de resultado muestra los costados). */
  const prelude = `
    let players = [];
    function __setPlayers(p){ players = p; }
    let resultadoDraft = null;
    let __unaColumna = false;
    function __setUnaColumna(v){ __unaColumna = v; }
    const window = { matchMedia: () => ({ matches: __unaColumna }) };
  `;
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, __setUnaColumna, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const P = cargarFinalizado();

/* ---------- helpers de aserción (mismos que panel.test.js) ---------- */
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
const J = (id, nombre, apellido) => ({ id, nombre, apellido: apellido || '' });

console.log(`\nEl partido finalizado — ${SPEC}\n`);

/* ================================================================= LOS CHIPS DE ESTADÍSTICA */
console.log('\x1b[1mLOS CHIPS\x1b[0m — qué chip aparece, dónde, y con qué número (FR-030 a FR-036)\n');

prueba('"finalizado/S-03" cada chip muestra lo que la unidad metió', () => {
  const stats = {
    j1: { goles: 2, golesPenal: 1, asistencias: 0 },
    j2: { goles: 0, asistencias: 1 },
    j3: { goles: 0, golesEnContra: 1 },
    j4: { goles: 0 },
  };
  const chipsDe = id => P.renderChipsEstadistica(P.statsAgregadasDeUnidad([{ id }], stats));

  const c1 = chipsDe('j1');
  ok(c1.golesHtml.includes('2') && c1.golesHtml.includes(P.GOAL_ICON), 'el primero lleva un chip de goles con "2" y GOAL_ICON');
  eq(c1.asistenciasHtml, '', 'y sin chip de asistencia');

  const c2 = chipsDe('j2');
  eq(c2.golesHtml, '', 'el segundo no lleva chip de goles');
  ok(c2.asistenciasHtml.includes('1') && c2.asistenciasHtml.includes(P.BOOT_ICON), 'lleva chip de asistencia con "1" y BOOT_ICON');

  const c3 = chipsDe('j3');
  ok(c3.golesHtml.includes('1') && c3.golesHtml.includes(P.RED_GOAL_ICON), 'el tercero lleva chip de gol en contra con "1" y RED_GOAL_ICON');

  const c4 = chipsDe('j4');
  eq(c4, { asistenciasHtml: '', golesHtml: '' }, 'el cuarto no lleva ningún chip');
});

prueba('"finalizado/S-03a" un gol exacto muestra "1", no lo omite', () => {
  const c = P.renderChipsEstadistica(P.statsAgregadasDeUnidad([{ id: 'j' }], { j: { goles: 1 } }));
  ok(c.golesHtml.includes('1'), 'el chip de goles muestra "1"');
});

prueba('"finalizado/S-03b" gol + gol en contra + asistencia a la vez lleva los tres chips', () => {
  const c = P.renderChipsEstadistica(P.statsAgregadasDeUnidad([{ id: 'j' }], { j: { goles: 1, golesEnContra: 1, asistencias: 1 } }));
  ok(c.asistenciasHtml.includes(P.BOOT_ICON), 'el chip de asistencia va a la izquierda');
  ok(c.golesHtml.includes(P.GOAL_ICON) && c.golesHtml.includes(P.RED_GOAL_ICON), 'los dos chips de goles van juntos a la derecha');
});

prueba('"finalizado/S-03c" en una dupla, el chip combinado muestra el gol de cualquiera de los dos integrantes', () => {
  const stats = { a: { goles: 1 }, b: { goles: 0 } };
  const agregadas = P.statsAgregadasDeUnidad([{ id: 'a' }, { id: 'b' }], stats);
  eq(agregadas.goles, 1, 'la unidad suma 1 gol entre los dos integrantes');
  const c = P.renderChipsEstadistica(agregadas);
  ok(c.golesHtml.includes('1'), 'el chip de goles de la camiseta compartida muestra "1"');
});

prueba('"finalizado/S-03d" la suma de los chips coincide con la suma de stats de la unidad', () => {
  const stats = { a: { goles: 2, golesEnContra: 1, asistencias: 3 }, b: { goles: 1, golesEnContra: 0, asistencias: 0 } };
  [[{ id: 'a' }], [{ id: 'a' }, { id: 'b' }], [{ id: 'b' }]].forEach(grupo => {
    const agregadas = P.statsAgregadasDeUnidad(grupo, stats);
    const esperado = grupo.reduce((s, p) => s + (stats[p.id].goles || 0) + (stats[p.id].golesEnContra || 0) + (stats[p.id].asistencias || 0), 0);
    eq(agregadas.goles + agregadas.golesEnContra + agregadas.asistencias, esperado, `no coincide para ${JSON.stringify(grupo)}`);
  });
});

/* ================================================================= LA FILA DE RESULTADO */
console.log('\n\x1b[1mLA FILA DE RESULTADO\x1b[0m — nombre, puntaje de armado y marcador (FR-040 a FR-042)\n');

prueba('"finalizado/S-04" la fila de resultado muestra nombre, puntaje de armado y marcador', () => {
  const m = { id: 'm1', estado: 'Finalizado', equipos: { blanco: ['b1'], negro: ['n1'], sumaBlanco: 52.5, sumaNegro: 51.5 },
    resultado: { statsPorJugador: { b1: { goles: 4 }, n1: { goles: 3 } } } };
  const html = P.renderFilaResultado(m);
  ok(html.includes('Blanco') && html.includes('Negro'), 'los dos nombres de equipo aparecen');
  ok(html.includes('52.5') && html.includes('51.5'), 'los dos puntajes de armado aparecen');
  ok(html.includes('>4<') && html.includes('>3<'), 'el marcador real (4 - 3) aparece');
});

prueba('"finalizado/S-04" en una columna la fila queda con el marcador solo (12c es de dos columnas)', () => {
  const m = { id: 'm1', estado: 'Finalizado', equipos: { blanco: ['b1'], negro: ['n1'], sumaBlanco: 52.5, sumaNegro: 51.5 },
    resultado: { statsPorJugador: { b1: { goles: 4 }, n1: { goles: 3 } } } };
  P.__setUnaColumna(true);
  const html = P.renderFilaResultado(m);
  P.__setUnaColumna(false);
  ok(!html.includes('resultado-equipo'), 'no se emiten los costados');
  ok(!html.includes('52.5') && !html.includes('51.5'), 'el puntaje de armado no se repite: vive arriba del campo');
  ok(html.includes('>4<') && html.includes('>3<'), 'el marcador real sigue');
});

prueba('"finalizado/S-04a" el resultado 0 a 0 se muestra, no se omite', () => {
  const m = { id: 'm1', estado: 'Finalizado', equipos: { blanco: ['b1'], negro: ['n1'], sumaBlanco: 0, sumaNegro: 0 },
    resultado: { statsPorJugador: { b1: { goles: 0 }, n1: { goles: 0 } } } };
  const html = P.renderFilaResultado(m);
  const marcador = html.match(/<div class="resultado-marcador">.*?<\/div>/)[0];
  eq((marcador.match(/>0</g) || []).length, 2, 'los dos lados del marcador muestran "0"');
});

/* ================================================================= LAS FILAS DE DETALLE */
console.log('\n\x1b[1mLAS FILAS DE DETALLE\x1b[0m — quién metió qué, debajo de cada campo (FR-050 a FR-057)\n');

prueba('"finalizado/S-05" goles propios con nota de penal, y en contra en línea separada, ordenados por goles', () => {
  P.__setPlayers([J('j1', 'Juan', 'Perez'), J('j2', 'Ana', 'Gomez')]);
  const stats = { j1: { goles: 2, golesPenal: 1 }, j2: { goles: 0, golesEnContra: 1 } };
  const html = P.renderFilasDetalle(['j1', 'j2'], stats);
  ok(html.indexOf('Juan Perez') < html.indexOf('Ana Gomez'), 'el de más goles propios va primero');
  ok(html.includes('(1 de penal)'), 'la línea de goles lleva la nota de penal');
  ok(html.includes('(EC)') && html.includes('Ana Gomez'), 'la línea de en contra lleva el nombre, porque no tiene línea de goles propios');
});

prueba('"finalizado/S-05a" un equipo sin goleadores no muestra nada (ex FR-055, derogada)', () => {
  P.__setPlayers([J('j1', 'Juan', 'Perez')]);
  const html = P.renderFilasDetalle(['j1'], { j1: { goles: 0 } });
  eq(html, '', 'sin ningún aviso en lugar de las filas');
});

prueba('"finalizado/S-05b" un gol en contra y también gol propio: el nombre no se repite', () => {
  P.__setPlayers([J('j1', 'Juan', 'Perez')]);
  const html = P.renderFilasDetalle(['j1'], { j1: { goles: 1, golesEnContra: 1 } });
  eq((html.match(/Juan Perez/g) || []).length, 1, 'el nombre aparece una sola vez, en la línea de goles propios');
  ok(html.includes('(EC)'), 'la línea de en contra sigue existiendo, sin repetir el nombre');
});

prueba('"finalizado/S-05c" un nombre con caracteres de marcado se inserta escapado', () => {
  P.__setPlayers([J('j1', '<script>alert(1)</script>', '')]);
  const html = P.renderFilasDetalle(['j1'], { j1: { goles: 1 } });
  ok(!html.includes('<script>alert'), 'no se insertó el script crudo');
  ok(html.includes('&lt;script&gt;'), 'el nombre quedó escapado');
});

/* ================================================================= OTRAS FUNCIONES PURAS */
console.log('\n\x1b[1mOTRAS FUNCIONES PURAS\x1b[0m\n');

prueba('formacionTexto compone "defensores-volantes-delanteros" desde CANCHAS, nunca un literal (TC-035)', () => {
  eq(P.formacionTexto({ cancha: 'futbol8' }), '3-3-1', 'fútbol 8');
  eq(P.formacionTexto({ cancha: 'futbol9' }), '3-4-1', 'fútbol 9');
});

/* ---------- salida ---------- */
console.log('');
if (fallos.length) {
  console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
  process.exit(1);
}
console.log(`Pasaron: ${pasaron}/${pasaron}`);
console.log('\x1b[32m✓ los chips, la fila de resultado y las filas de detalle deciden lo que la Spec fija\x1b[0m\n');
