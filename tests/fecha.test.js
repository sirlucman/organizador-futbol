#!/usr/bin/env node
/* Tests de "Editar la fecha de un partido". Se corren con:
 *
 *     node tests/fecha.test.js
 *
 * Cubren la parte que NO necesita un navegador: qué texto cuenta como fecha válida
 * (`esFechaValida`) y qué cambia en el partido al editar la fecha (`cambiarFechaDelPartido`).
 * Lo que se ve en pantalla —el lápiz, la ventana, lo que se guarda, el rol— vive en
 * tests/layout.test.js, escenarios `fecha-*`.
 *
 * Las propiedades corren sobre los partidos de `docsDesde()` —sin equipos, con equipos,
 * inscripción cerrada, finalizado en los dos formatos de resultado, fútbol 9— (Spec AC-02).
 * `tests/harness.js` no cambia: el sandbox del motor no necesita estas funciones (Plan TD-10).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas, con guion y con el
 * prefijo de la feature ("fecha/S-01f"): es la convención de binding de AGENTS.md, y los gates
 * del Implementation Plan (T-2.D8, T-2.D9) lo buscan con grep.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');
const { docsDesde } = require('./fixtures-app');

const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

const DECLARACIONES = ['esFechaValida', 'cambiarFechaDelPartido'];
const C = new Function(`${DECLARACIONES.map(n => extraer(src, n)).join('\n\n')}\nreturn { ${DECLARACIONES.join(', ')} };`)();

/* ---------- helpers de aserción (mismos que colores.test.js) ---------- */
class FalloAssert extends Error {}
const fallar = msg => { throw new FalloAssert(msg); };
const ok = (cond, msg) => { if (!cond) fallar(msg); };
const eq = (actual, esperado, msg) => {
  const a = JSON.stringify(actual), e = JSON.stringify(esperado);
  if (a !== e) fallar(`${msg}\n      esperado: ${e}\n      obtenido: ${a}`);
};
const copia = x => JSON.parse(JSON.stringify(x));

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

/* Los partidos tal como se guardan: el JSON de `docsDesde()`. */
const PARTIDOS = JSON.parse(docsDesde().partidos);

/* Las claves en las que difieren dos partidos, comparando el JSON de cada valor (NFR-003). */
function clavesDistintas(antes, despues) {
  const claves = new Set([...Object.keys(antes), ...Object.keys(despues)]);
  return [...claves].filter(k => JSON.stringify(antes[k]) !== JSON.stringify(despues[k])).sort();
}

/* mulberry32: un generador chico y determinista (como intercambio.test.js). Con la semilla
   fija, una falla se repite igual. */
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
const dos = n => String(n).padStart(2, '0');
/* Una fecha real del calendario entre 1900 y 2199, armada sin pasar por `esFechaValida`. */
function fechaAlAzar(r) {
  const anio = 1900 + Math.floor(r() * 300);
  const mes = 1 + Math.floor(r() * 12);
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const dia = 1 + Math.floor(r() * diasDelMes);
  return `${anio}-${dos(mes)}-${dos(dia)}`;
}

const INVALIDAS = ['2026-02-30', '15/11/2026', 'hola', '', '20260-11-15', null, undefined, 20261115,
  '2025-02-29', '2100-02-29', '2026-13-01', '2026-04-31'];
const VALIDAS = ['2024-02-29', '2026-11-15', '0050-01-01'];

console.log('\n\x1b[1mVALIDACIÓN\x1b[0m — qué texto es una fecha válida\n');

prueba('fecha/TC-041: esFechaValida acepta sólo un YYYY-MM-DD que es un día real del calendario', () => {
  for (const v of INVALIDAS) ok(C.esFechaValida(v) === false, `${JSON.stringify(v)} no es una fecha válida`);
  for (const v of VALIDAS) ok(C.esFechaValida(v) === true, `${JSON.stringify(v)} es una fecha válida`);
});

prueba('fecha/S-20a: con un valor que no es una fecha válida, cambiarFechaDelPartido no toca el partido', () => {
  for (const original of PARTIDOS) {
    for (const v of INVALIDAS) {
      const m = copia(original);
      ok(C.cambiarFechaDelPartido(m, v) === false, `${original.id} con ${JSON.stringify(v)}: tiene que devolver false`);
      eq(m, original, `${original.id} con ${JSON.stringify(v)}: el partido tiene que quedar idéntico`);
    }
  }
});

console.log('\n\x1b[1mQUÉ CAMBIA\x1b[0m — sólo la fecha\n');

prueba('fecha/S-01e: una fecha de hace un año y una de dentro de un año se aceptan', () => {
  const m = copia(PARTIDOS.find(p => p.id === 'm-abierto'));
  for (const f of ['2025-11-06', '2027-11-06']) {
    ok(C.cambiarFechaDelPartido(m, f) === true, `${f}: tiene que devolver true`);
    eq(m.fecha, f, `${f}: tiene que quedar en m.fecha`);
  }
});

prueba('fecha/S-04: con la misma fecha que ya tiene, cambiarFechaDelPartido devuelve false y no toca el partido', () => {
  for (const original of PARTIDOS) {
    const m = copia(original);
    ok(C.cambiarFechaDelPartido(m, original.fecha) === false, `${original.id}: tiene que devolver false`);
    eq(m, original, `${original.id}: el partido tiene que quedar idéntico`);
  }
});

console.log('\n\x1b[1mPROPIEDADES\x1b[0m — 200 fechas al azar por partido, semilla fija\n');

/* Para cada partido del fixture y 200 fechas válidas distintas de la suya: aplica el cambio
   sobre una copia del arreglo entero y devuelve, por cada corrida, el antes y el después. */
function corridas(fn) {
  const r = azar(20261106);
  for (let i = 0; i < PARTIDOS.length; i++) {
    for (let n = 0; n < 200; n++) {
      let f;
      do { f = fechaAlAzar(r); } while (f === PARTIDOS[i].fecha);
      const lista = copia(PARTIDOS);
      ok(C.cambiarFechaDelPartido(lista[i], f) === true, `${PARTIDOS[i].id} con ${f}: tiene que devolver true`);
      fn({ i, f, antes: PARTIDOS, despues: lista });
    }
  }
}

prueba('fecha/S-01f: cualquier partido y cualquier fecha válida distinta: cambia la fecha y los demás partidos no cambian', () => {
  corridas(({ i, f, antes, despues }) => {
    eq(despues[i].fecha, f, `${antes[i].id}: la fecha nueva tiene que quedar guardada`);
    antes.forEach((p, j) => { if (j !== i) eq(despues[j], p, `${antes[i].id} con ${f}: ${p.id} no tiene que cambiar`); });
  });
});

prueba('fecha/NFR-003: comparado clave por clave, el partido difiere del anterior sólo en fecha', () => {
  corridas(({ i, f, antes, despues }) => {
    eq(clavesDistintas(antes[i], despues[i]), ['fecha'], `${antes[i].id} con ${f}: campos distintos`);
  });
});

prueba('fecha/TC-013: el cambio de fecha no agrega ninguna clave al partido', () => {
  corridas(({ i, f, antes, despues }) => {
    eq(Object.keys(despues[i]).sort(), Object.keys(antes[i]).sort(), `${antes[i].id} con ${f}: claves del partido`);
  });
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ la fecha se valida y cambiar la fecha cambia sólo la fecha\x1b[0m');
process.exit(0);
