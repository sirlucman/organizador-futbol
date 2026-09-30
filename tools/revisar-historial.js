#!/usr/bin/env node
/* Revisa el historial de partidos de STAGING contra el catálogo de puestos, sin escribir nada.
 *
 *     ROL_TEST_ADMIN_USER=… ROL_TEST_ADMIN_PASS=… node tools/revisar-historial.js
 *     REVISAR_STRICT=1 node tools/revisar-historial.js   en CI: la ausencia de credenciales falla
 *
 * Es la verificación de `NFR-005` y de la Assumption `A-01` de desglose-posiciones (Spec §8, §14;
 * Implementation Plan TD-16, T-2.28): lo que ningún test del repositorio puede ver, porque los
 * partidos reales no están en el repositorio. Para cada partido guardado corre las funciones
 * REALES de lectura de index.html (recortadas por nombre con `extraer`, como los tests) y mira:
 *
 *   1. Que ninguna camiseta caiga en la fila de "sin puesto reconocible" (FR-075): toda posición
 *      guardada tiene que ser un puesto o una posición vieja (A-01).
 *   2. Que los totales de cada partido finalizado cuyo armado asignó posiciones sean los mismos
 *      con el plantel tal cual y con el plantel reclasificado. La reclasificación se hace EN
 *      MEMORIA, con la misma traducción determinista de los tests (`aPuestos`): no toca la base.
 *
 * Sólo hace GET: entra por la API REST de Identity Toolkit con la cuenta admin de staging (la
 * misma que usa tests/reglas.test.js) y lee los cuatro documentos de `data/` por la API REST de
 * Firestore. Las credenciales vienen del entorno, nunca del repositorio.
 *
 * Para que sirva, staging tiene que tener datos reales: antes de correrlo se sincroniza desde
 * producción con tools/sync-staging-data.html.
 */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const { extraer, DECLARACIONES_CATALOGO } = require(path.join(RAIZ, 'tests/harness'));
const { aPuestos } = require(path.join(RAIZ, 'tests/fixtures'));

// Mismo proyecto y apiKey que index.html fuera de producción (y que tests/reglas.test.js).
const PROYECTO = 'organizador-futbol-staging';
const API_KEY = 'AIzaSyD43vH2kraPrPyU3YyhoZl-1H0oNzOTNUc';
const RUTA = doc => `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/${doc}`;

/* ---------- las funciones de lectura de la aplicación ---------- */
const DECLARACIONES = [
  ...DECLARACIONES_CATALOGO, 'computeAvg', 'valorGeneralDe', 'puntajeEnPosicion', 'lineaDeUnSoloLugar',
  'objetivoDiferencia', 'esDupla', 'getDuplaPartner', 'posicionAsignadaDe', 'construirUnidadDupla',
  'valorDePuntaje', 'jugadoresDeEquipoOrdenados', 'agruparFilasDeEquipo', 'agruparEnLineasDeCancha',
  'sumasPorLinea', 'balanceLineasDe', 'colapsarDuplasParaLinea', 'sumaVigenteDeEquipo', 'sumasVigentes',
];
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const APP = new Function(`let players = [];\nfunction __setPlayers(p){ players = p; }\n${DECLARACIONES.map(n => extraer(src, n)).join('\n\n')}\nreturn { __setPlayers, ${DECLARACIONES.join(', ')} };`)();

/* ---------- lectura de staging, sólo GET ---------- */
async function entrar(email, password) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(`No se pudo entrar como ${email}: ${cuerpo.error && cuerpo.error.message}`);
  return cuerpo.idToken;
}
// El valor de un documento de `data/`: la aplicación guarda cada uno como `{ value: "<json>" }`.
async function leer(idToken, doc, porDefecto) {
  const r = await fetch(RUTA(`data/${doc}`), { headers: { Authorization: 'Bearer ' + idToken } });
  if (r.status === 404) return porDefecto;
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(`No se pudo leer data/${doc}: ${cuerpo.error && cuerpo.error.status}`);
  const valor = cuerpo.fields && cuerpo.fields.value && cuerpo.fields.value.stringValue;
  return valor ? JSON.parse(valor) : porDefecto;
}

/* ---------- la revisión ---------- */
// Lo mismo que hace loadAll para un admin: puntajes adentro de cada jugador, armado adentro de cada partido.
function armar(players, scores, partidos, armado) {
  const jugadores = players.map(p => ({ ...p, secundarias: p.secundarias || [], scores: scores[p.id] || {} }));
  const matches = partidos.map(m => {
    const a = armado[m.id];
    const copia = JSON.parse(JSON.stringify(m));
    if (a && copia.equipos) Object.assign(copia.equipos, a.equipos || {});
    if (!copia.duplas) copia.duplas = [];
    return copia;
  });
  return { jugadores, matches };
}
function reclasificados(jugadores) {
  return aPuestos({ cancha: 'futbol8', individuales: jugadores, duplas: [] }).individuales;
}
function filas(jugadores, m, equipo) {
  APP.__setPlayers(jugadores);
  return APP.agruparEnLineasDeCancha(m, APP.agruparFilasDeEquipo(m, APP.jugadoresDeEquipoOrdenados(m, m.equipos[equipo] || [])));
}
function totales(jugadores, m) {
  APP.__setPlayers(jugadores);
  const s = APP.sumasVigentes(m);
  return [Math.round(s.blanco * 10) / 10, Math.round(s.negro * 10) / 10];
}

async function main() {
  const usuario = process.env.ROL_TEST_ADMIN_USER, clave = process.env.ROL_TEST_ADMIN_PASS;
  if (!usuario || !clave) {
    console.log('revisar-historial: faltan ROL_TEST_ADMIN_USER / ROL_TEST_ADMIN_PASS (cuenta admin de staging).');
    return process.env.REVISAR_STRICT ? 1 : 0;
  }
  const token = await entrar(usuario, clave);
  const [players, scores, partidos, armado] = await Promise.all([
    leer(token, 'players', []), leer(token, 'playerScores', {}), leer(token, 'partidos', []), leer(token, 'partidosArmado', {}),
  ]);
  const { jugadores, matches } = armar(players, scores, partidos, armado);
  const despues = reclasificados(jugadores);
  const conEquipos = matches.filter(m => m.equipos && m.equipos.blanco);
  console.log(`Staging: ${jugadores.length} jugadores (${jugadores.filter(APP.estaARevisar).length} a revisar), ` +
    `${matches.length} partidos, ${conEquipos.length} con equipos.\n`);

  const problemas = [];
  const valoresRaros = new Map();
  let camisetas = 0;
  conEquipos.forEach(m => {
    [jugadores, despues].forEach((plantel, k) => ['blanco', 'negro'].forEach(e => {
      filas(plantel, m, e).forEach(f => {
        camisetas += k === 0 ? f.unidades.length : 0;
        if (!APP.ORDEN_LINEAS.includes(f.linea)) {
          valoresRaros.set(f.linea, (valoresRaros.get(f.linea) || 0) + f.unidades.length);
          problemas.push(`${m.id} (${m.fecha}), ${e}${k ? ', reclasificado' : ''}: ${f.unidades.length} camiseta(s) en la fila de "${f.linea}"`);
        }
      });
    }));
  });

  // Totales: sólo los finalizados cuyo armado asignó posiciones (NFR-005, enmienda del 2026-09-30).
  const conPosiciones = conEquipos.filter(m => m.estado === 'Finalizado' && m.equipos.posicionAsignada
    && m.equipos.estrategiaKey !== 'estrategia1');
  conPosiciones.forEach(m => {
    const a = totales(jugadores, m), b = totales(despues, m);
    if (a[0] !== b[0] || a[1] !== b[1]) problemas.push(`${m.id} (${m.fecha}): totales ${a.join('–')} antes y ${b.join('–')} después de reclasificar`);
  });

  console.log(`puestos/NFR-005 · fila de "sin puesto reconocible": ${[...valoresRaros.values()].reduce((a, b) => a + b, 0)} camiseta(s) de ${camisetas}`);
  if (valoresRaros.size) console.log(`  valores guardados que no son puesto ni posición vieja (A-01): ${[...valoresRaros.keys()].map(v => JSON.stringify(v)).join(', ')}`);
  console.log(`puestos/NFR-005 · totales iguales antes y después de reclasificar: ${conPosiciones.length - problemas.filter(p => p.includes('totales')).length} de ${conPosiciones.length} partidos finalizados con posiciones`);
  if (problemas.length) {
    console.log('\nProblemas:');
    problemas.forEach(p => console.log('  - ' + p));
    return 1;
  }
  console.log('\n✓ el historial de staging se lee entero con el catálogo de puestos');
  return 0;
}

main().then(c => process.exit(c)).catch(e => { console.error(e.message); process.exit(1); });
