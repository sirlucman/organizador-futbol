#!/usr/bin/env node
/* Tests de "Orden por columnas del listado de jugadores". Se corren con:
 *
 *     node tests/orden.test.js
 *
 * Cubren la parte que NO necesita un navegador: el comparador `sortRoster` en sus trece modos,
 * qué sentido aplica el primer toque sobre una columna, cómo se limpia una preferencia leída de
 * Firestore, cómo queda el orden manual después de soltar una fila, y qué anuncia cada título.
 * Lo que se ve en pantalla —los títulos, el menú, el arrastre real, lo que se guarda— vive en
 * tests/layout.test.js; las reglas de Firestore, en tests/reglas.test.js.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas, con guion y con el
 * prefijo de la feature ("orden/S-01b"): es la convención de binding de AGENTS.md, y los gates
 * del Implementation Plan (T-2.D8, T-2.D9) lo buscan con grep.
 */
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { extraer, DECLARACIONES_CATALOGO } = require('./harness');

const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

const DECLARACIONES = [
  ...DECLARACIONES_CATALOGO, 'computeAvg', 'fullName', 'alfabetico', 'ORDEN_MODOS', 'CAMPO_DE_COLUMNA',
  'sortRoster', 'PRIMER_SENTIDO', 'modoTrasElegirColumna', 'normalizarPreferenciaOrden',
  'ordenManualTrasSoltar', 'etiquetaTituloOrden',
];
const O = new Function(`${DECLARACIONES.map(n => extraer(src, n)).join('\n\n')}\nreturn { ${DECLARACIONES.join(', ')} };`)();

/* ---------- helpers de aserción (mismos que colores.test.js) ---------- */
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

/* ---------- planteles ---------- */
// Un jugador con la forma que tiene en `players` después de que la app calculó sus estadísticas.
// `pj` vacío o 0 es "sin partidos" (Spec §6).
function J(id, nombre, apellido, { pj, goles = 0, asist = 0, principal = 'MC', orden, scores = {} } = {}) {
  const p = { id, nombre, apellido, principal, secundarias: [], scores: { ...scores } };
  if (pj !== undefined) { p.partidosJugados = pj; p.golesTotales = goles; p.asistenciasTotales = asist; }
  if (orden !== undefined) p.orden = orden;
  return p;
}
const ids = lista => lista.map(p => p.id);
const ordenar = (lista, modo, manual) => ids(O.sortRoster(lista, modo, manual));

// El plantel de S-01: Ana y Beto con 5 goles, Ciro con 2, Dani que nunca jugó.
const plantelS01 = () => [
  J('dani', 'Dani', 'Sosa', { principal: 'DEL' }),
  J('ciro', 'Ciro', 'Paz', { pj: 4, goles: 2, principal: 'DEL' }),
  J('beto', 'Beto', 'Ríos', { pj: 4, goles: 5 }),
  J('ana', 'Ana', 'Ríos', { pj: 4, goles: 5 }),
];

// El plantel de S-05: por Goles descendente queda Ana, Beto, Ciro, Dani, Eva. Ciro y Eva son DEL.
const plantelS05 = () => [
  J('eva', 'Eva', 'Vera', { pj: 2, goles: 1, principal: 'DEL', orden: 4 }),
  J('ciro', 'Ciro', 'Paz', { pj: 2, goles: 3, principal: 'DEL', orden: 2 }),
  J('ana', 'Ana', 'Ríos', { pj: 2, goles: 5, orden: 0 }),
  J('dani', 'Dani', 'Sosa', { pj: 2, goles: 2, orden: 3 }),
  J('beto', 'Beto', 'Ruiz', { pj: 2, goles: 4, orden: 1 }),
];

/* Planteles al azar, deterministas por semilla (mismo generador que puestos.test.js). Pocos
   nombres y pocos valores para que haya empates, y algunos sin partidos o sin puntaje. */
function rng(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const NOMBRES = ['Ana', 'Beto', 'Ciro', 'Dani', 'Eva'];
const APELLIDOS = ['Paz', 'Ríos', 'Sosa', 'Vera'];
const VALORES_PUESTO = ['Arquero', 'LI', 'DC', 'LD', 'MI', 'MC', 'MD', 'DEL'];
function plantelAlAzar(semilla, n = 3 + Math.floor(rng(semilla)() * 20)) {
  const r = rng(semilla);
  const elegir = xs => xs[Math.floor(r() * xs.length)];
  return Array.from({ length: n }, (_, i) => {
    const jugo = r() < 0.75;
    const principal = elegir(VALORES_PUESTO);
    return J(`p${i}`, elegir(NOMBRES), elegir(APELLIDOS), {
      pj: jugo ? 1 + Math.floor(r() * 4) : (r() < 0.5 ? 0 : undefined),
      goles: Math.floor(r() * 4), asist: Math.floor(r() * 3), principal,
      orden: r() < 0.9 ? Math.floor(r() * n) : undefined,
      scores: r() < 0.8 ? { [principal]: 1 + Math.floor(r() * 4) } : {},
    });
  });
}

/* Qué ordena cada columna: la clave, y si el jugador "tiene dato" (sin dato va al final). */
const CLAVES = {
  posicion: { clave: p => O.ordenDePuesto(p.principal), tieneDato: () => true },
  jugador: { clave: p => O.fullName(p), tieneDato: () => true },
  pj: { clave: p => p.partidosJugados || 0, tieneDato: p => !!p.partidosJugados },
  goles: { clave: p => p.golesTotales || 0, tieneDato: p => !!p.partidosJugados },
  asist: { clave: p => p.asistenciasTotales || 0, tieneDato: p => !!p.partidosJugados },
  puntaje: { clave: p => O.computeAvg(p.scores, O.posicionesDe(p)), tieneDato: p => O.computeAvg(p.scores, O.posicionesDe(p)) !== null },
};
const comparar = (a, b) => typeof a === 'string' ? a.localeCompare(b) : a - b;

console.log('\n\x1b[1mEL COMPARADOR\x1b[0m — seis columnas, dos sentidos, desempate A→Z\n');

prueba('orden/S-01a: todos con los mismos goles: el orden es el alfabético existente en los dos sentidos', () => {
  const plantel = [
    J('c', 'Ciro', 'Paz', { pj: 3, goles: 2 }), J('a', 'Ana', 'Ríos', { pj: 1, goles: 2 }),
    J('b', 'Beto', 'Alfa', { pj: 2, goles: 2 }),
  ];
  const alfabetico = ids([...plantel].sort(O.alfabetico));
  eq(alfabetico, ['b', 'c', 'a'], 'Alfa, Paz, Ríos');
  eq(ordenar(plantel, 'goles_desc'), alfabetico, 'descendente');
  eq(ordenar(plantel, 'goles_asc'), alfabetico, 'ascendente');
});

prueba('orden/S-01b: nadie jugó: la lista es el alfabético existente en PJ, Goles y Asist', () => {
  const plantel = [J('c', 'Ciro', 'Paz'), J('a', 'Ana', 'Ríos', { pj: 0 }), J('b', 'Beto', 'Alfa')];
  ['pj_desc', 'pj_asc', 'goles_desc', 'goles_asc', 'asist_desc', 'asist_asc'].forEach(modo =>
    eq(ordenar(plantel, modo), ['b', 'c', 'a'], modo));
});

prueba('orden/S-01c: con Goles activo, tocar "Jugador" ordena A→Z por nombre visible', () => {
  const modo = O.modoTrasElegirColumna('jugador', 'goles_desc');
  eq(modo, 'jugador_asc', 'primer sentido de Jugador');
  eq(ordenar(plantelS01(), modo), ['ana', 'beto', 'ciro', 'dani'], 'Ana, Beto, Ciro, Dani');
});

prueba('orden/S-01d: tocar "Pos" ordena por la secuencia de puestos, ARQ primero', () => {
  const modo = O.modoTrasElegirColumna('posicion', 'goles_desc');
  eq(modo, 'posicion_asc', 'primer sentido de Pos');
  const plantel = [J('d', 'Del', 'A', { principal: 'DEL' }), J('m', 'Med', 'B', { principal: 'MC' }),
    J('q', 'Arq', 'C', { principal: 'Arquero' }), J('l', 'Lat', 'D', { principal: 'LI' })];
  eq(ordenar(plantel, modo), ['q', 'l', 'm', 'd'], 'ARQ, LI, MC, DEL');
});

prueba('orden/S-01e: PJ 3 con 0 goles queda antes que el que nunca jugó, en los dos sentidos', () => {
  const plantel = [...plantelS01(), J('cero', 'Eva', 'Vera', { pj: 3, goles: 0 })];
  eq(ordenar(plantel, 'goles_desc'), ['ana', 'beto', 'ciro', 'cero', 'dani'], 'descendente');
  eq(ordenar(plantel, 'goles_asc'), ['cero', 'ciro', 'ana', 'beto', 'dani'], 'ascendente');
});

prueba('orden/S-01f: para 200 planteles y cada columna, descendente invierte a ascendente, los sin dato al final, desempate A→Z', () => {
  for (let semilla = 1; semilla <= 200; semilla++) {
    const plantel = plantelAlAzar(semilla);
    Object.entries(CLAVES).forEach(([columna, { clave, tieneDato }]) => {
      const claves = {};
      ['asc', 'desc'].forEach(sentido => {
        const lista = O.sortRoster(plantel, `${columna}_${sentido}`);
        const signo = sentido === 'asc' ? 1 : -1;
        const conDato = lista.filter(tieneDato);
        eq(lista.slice(0, conDato.length).map(p => p.id), ids(conDato), `semilla ${semilla}, ${columna}_${sentido}: los sin dato al final`);
        const sinDato = lista.slice(conDato.length);
        eq(ids(sinDato), ids([...sinDato].sort(O.alfabetico)), `semilla ${semilla}, ${columna}_${sentido}: los sin dato en A→Z`);
        for (let i = 1; i < conDato.length; i++) {
          const c = comparar(clave(conDato[i - 1]), clave(conDato[i])) * signo;
          ok(c <= 0, `semilla ${semilla}, ${columna}_${sentido}: ${conDato[i - 1].id} antes que ${conDato[i].id} rompe el sentido`);
          if (c === 0) ok(O.alfabetico(conDato[i - 1], conDato[i]) <= 0, `semilla ${semilla}, ${columna}_${sentido}: el empate no es A→Z`);
        }
        claves[sentido] = conDato.map(clave);
      });
      eq(claves.desc, [...claves.asc].reverse(), `semilla ${semilla}, ${columna}: descendente es ascendente invertido entre los con dato`);
    });
  }
});

prueba('orden/S-01h: Jugador A→Z con "Ana Zeta" y "Beto Alfa" pone primero a Ana, aunque por apellido iría Beto', () => {
  const plantel = [J('beto', 'Beto', 'Alfa'), J('ana', 'Ana', 'Zeta')];
  eq(ids([...plantel].sort(O.alfabetico)), ['beto', 'ana'], 'por apellido iría Beto');
  eq(ordenar(plantel, 'jugador_asc'), ['ana', 'beto'], 'A→Z por nombre visible');
  eq(ordenar(plantel, 'jugador_desc'), ['beto', 'ana'], 'Z→A por nombre visible');
});

prueba('orden/S-01k: Pts de mayor a menor promedio, y el que no tiene puntaje al final en los dos sentidos', () => {
  const plantel = [
    J('sin', 'Ana', 'Alfa', { principal: 'MC' }),
    J('siete', 'Beto', 'Paz', { principal: 'MC', scores: { MC: 7 } }),
    J('nueve', 'Ciro', 'Ríos', { principal: 'DC', scores: { DC: 9 } }),
  ];
  eq(ordenar(plantel, 'puntaje_desc'), ['nueve', 'siete', 'sin'], 'descendente');
  eq(ordenar(plantel, 'puntaje_asc'), ['siete', 'nueve', 'sin'], 'ascendente');
});

console.log('\n\x1b[1mLA PREFERENCIA LEÍDA\x1b[0m — lo que no se entiende cae a Manual\n');

prueba('orden/S-04b: criterio desconocido, sentido desconocido o contenido ilegible: Manual', () => {
  const crudos = [null, undefined, '', 'no es json', '{"modo":', '[1,2]', '"goles_desc"', '42', 'null',
    '{"modo":"foo_desc"}', '{"modo":"goles_arriba"}', '{"modo":"goles"}', '{"modo":"<img src=x>"}',
    '{"modo":"constructor"}', '{"modo":"manual_desc"}', '{"ordenManual":["a"]}', '{"modo":7}'];
  crudos.forEach(crudo => eq(O.normalizarPreferenciaOrden(crudo).modo, 'manual', `crudo ${JSON.stringify(crudo)}`));
  eq(O.normalizarPreferenciaOrden({ modo: 'goles_desc' }).modo, 'manual', 'un valor que no es texto');
  eq(O.normalizarPreferenciaOrden('{"modo":"goles_desc","ordenManual":"a,b"}'), { modo: 'goles_desc', ordenManual: [] },
    'un modo válido se conserva; un orden manual que no es lista queda vacío');
  O.ORDEN_MODOS.forEach(modo => eq(O.normalizarPreferenciaOrden(JSON.stringify({ modo, ordenManual: [] })).modo, modo, `${modo} se reconoce`));
});

prueba('orden/S-07b: ids repetidos, que no son texto o que no existen se ignoran y cada jugador aparece una vez', () => {
  const crudo = JSON.stringify({ modo: 'manual', ordenManual: ['c', 1, 'a', 'c', null, { id: 'b' }, 'fantasma', ['b'], 'a'] });
  const { modo, ordenManual } = O.normalizarPreferenciaOrden(crudo);
  eq([modo, ordenManual], ['manual', ['c', 'a', 'fantasma']], 'sólo texto, primera aparición');
  const plantel = [J('a', 'Ana', 'A', { orden: 0 }), J('b', 'Beto', 'B', { orden: 1 }), J('c', 'Ciro', 'C', { orden: 2 })];
  eq(ordenar(plantel, 'manual', ordenManual), ['c', 'a', 'b'], 'el id que no existe no aparece; Beto va después, en el orden base');
  eq(ordenar(plantel, 'manual', ['c', 'c', 'a']), ['c', 'a', 'b'], 'el comparador tampoco repite aunque la lista venga sin limpiar');
});

prueba('orden/S-07c: un orden manual guardado vacío muestra el orden base', () => {
  const plantel = [J('b', 'Beto', 'B', { orden: 1 }), J('a', 'Ana', 'A', { orden: 0 }), J('x', 'Xul', 'X')];
  eq(O.normalizarPreferenciaOrden('{"modo":"manual","ordenManual":[]}'), { modo: 'manual', ordenManual: [] }, 'normalizado');
  eq(ordenar(plantel, 'manual', []), ['a', 'b', 'x'], 'por `orden`; sin `orden` al final');
});

console.log('\n\x1b[1mEL ORDEN MANUAL\x1b[0m — sigue al plantel\n');

prueba('orden/S-07: orden manual Beto, Ana, Ciro; se agrega Fede y se borra Ciro: Beto, Ana, Fede', () => {
  const plantel = [J('ana', 'Ana', 'A', { orden: 0 }), J('beto', 'Beto', 'B', { orden: 1 }), J('fede', 'Fede', 'F', { orden: 3 })];
  eq(ordenar(plantel, 'manual', ['beto', 'ana', 'ciro']), ['beto', 'ana', 'fede'], 'Fede al final, Ciro no está');
});

prueba('orden/S-07a: una cuenta que nunca arrastró ve el orden base, con Fede al final', () => {
  const plantel = [J('fede', 'Fede', 'F', { orden: 3 }), J('beto', 'Beto', 'B', { orden: 1 }), J('ana', 'Ana', 'A', { orden: 0 }), J('ciro', 'Ciro', 'C', { orden: 2 })];
  eq(ordenar(plantel, 'manual'), ['ana', 'beto', 'ciro', 'fede'], 'sin tercer argumento');
  eq(ordenar(plantel, 'manual', O.normalizarPreferenciaOrden(null).ordenManual), ['ana', 'beto', 'ciro', 'fede'], 'sin preferencia guardada');
});

console.log('\n\x1b[1mEL SOLTADO\x1b[0m — la lista completa en el orden activo\n');

prueba('orden/S-05: por Goles, soltar a Dani sobre Beto deja Ana, Dani, Beto, Ciro, Eva', () => {
  const completa = ordenar(plantelS05(), 'goles_desc');
  eq(completa, ['ana', 'beto', 'ciro', 'dani', 'eva'], 'el orden activo');
  eq(O.ordenManualTrasSoltar(completa, 'dani', 'beto'), ['ana', 'dani', 'beto', 'ciro', 'eva'], 'Dani antes de Beto');
  eq(O.ordenManualTrasSoltar(completa, 'ana', 'ciro'), ['beto', 'ana', 'ciro', 'dani', 'eva'], 'hacia abajo, también inmediatamente antes');
  eq(completa, ['ana', 'beto', 'ciro', 'dani', 'eva'], 'no muta la lista que recibe');
});

prueba('orden/S-05a: soltar a Dani sobre sí mismo no cambia nada', () => {
  const completa = ordenar(plantelS05(), 'goles_desc');
  eq(O.ordenManualTrasSoltar(completa, 'dani', 'dani'), completa, 'sobre sí mismo');
  eq(O.ordenManualTrasSoltar(completa, 'fantasma', 'beto'), completa, 'un arrastrado que no está');
  eq(O.ordenManualTrasSoltar(completa, 'dani', 'fantasma'), completa, 'un destino que no está');
});

prueba('orden/S-05b: Goles y filtro DEL, Eva sobre Ciro: Ana, Beto, Eva, Ciro, Dani', () => {
  const plantel = plantelS05();
  const visibles = ids(O.sortRoster(plantel.filter(p => p.principal === 'DEL'), 'goles_desc'));
  eq(visibles, ['ciro', 'eva'], 'visibles con el filtro');
  eq(O.ordenManualTrasSoltar(ordenar(plantel, 'goles_desc'), 'eva', 'ciro'), ['ana', 'beto', 'eva', 'ciro', 'dani'], 'los ocultos quedan donde estaban por Goles');
});

prueba('orden/S-05c: Manual Ana..Eva y búsqueda que deja a Beto y Eva, Eva sobre Beto: Ana, Eva, Beto, Ciro, Dani', () => {
  const completa = ordenar(plantelS05(), 'manual', ['ana', 'beto', 'ciro', 'dani', 'eva']);
  eq(completa, ['ana', 'beto', 'ciro', 'dani', 'eva'], 'el orden manual');
  eq(O.ordenManualTrasSoltar(completa, 'eva', 'beto'), ['ana', 'eva', 'beto', 'ciro', 'dani'], 'los ocultos conservan su lugar relativo');
});

prueba('orden/S-05g: para cualquier plantel, modo, filtro y par, el orden manual tiene a cada jugador exactamente una vez', () => {
  for (let semilla = 1; semilla <= 300; semilla++) {
    const r = rng(semilla * 7);
    const plantel = plantelAlAzar(semilla);
    const modo = O.ORDEN_MODOS[Math.floor(r() * O.ORDEN_MODOS.length)];
    const manual = ids(plantel).filter(() => r() < 0.5).concat(r() < 0.3 ? ['fantasma'] : []);
    const puesto = VALORES_PUESTO[Math.floor(r() * VALORES_PUESTO.length)];
    const visibles = r() < 0.5 ? plantel : plantel.filter(p => p.principal === puesto);
    if (!visibles.length) continue;
    const arrastrado = visibles[Math.floor(r() * visibles.length)].id;
    const destino = visibles[Math.floor(r() * visibles.length)].id;
    const resultado = O.ordenManualTrasSoltar(ordenar(plantel, modo, manual), arrastrado, destino);
    eq([...resultado].sort(), ids(plantel).sort(), `semilla ${semilla}: ${modo}, ${arrastrado} sobre ${destino}`);
  }
});

console.log('\n\x1b[1mLOS TÍTULOS\x1b[0m — qué se anuncia\n');

prueba('orden/S-08a: en cualquier secuencia de cambios y arrastres, a lo sumo un título anuncia sentido, ninguno en Manual', () => {
  const COLUMNAS = Object.keys(O.PRIMER_SENTIDO);
  for (let semilla = 1; semilla <= 100; semilla++) {
    const r = rng(semilla);
    let modo = 'manual';
    for (let paso = 0; paso < 30; paso++) {
      modo = r() < 0.2 ? 'manual' : O.modoTrasElegirColumna(COLUMNAS[Math.floor(r() * COLUMNAS.length)], modo);
      const conSentido = COLUMNAS.filter(c => O.etiquetaTituloOrden(c, modo).includes(', '));
      ok(conSentido.length === (modo === 'manual' ? 0 : 1), `semilla ${semilla}, paso ${paso}, ${modo}: anuncian sentido ${conSentido.join(', ') || 'ninguno'}`);
      if (modo !== 'manual') eq(conSentido, [modo.split('_')[0]], `semilla ${semilla}, paso ${paso}: el que anuncia es el activo`);
    }
  }
  eq(O.etiquetaTituloOrden('pj', 'pj_desc'), 'Partidos jugados, de mayor a menor', 'PJ descendente');
  eq(O.etiquetaTituloOrden('pj', 'pj_asc'), 'Partidos jugados, de menor a mayor', 'PJ ascendente');
  eq(O.etiquetaTituloOrden('jugador', 'jugador_asc'), 'Jugador, de la A a la Z', 'Jugador A→Z');
  eq(O.etiquetaTituloOrden('posicion', 'posicion_desc'), 'Posición, del delantero al arquero', 'Pos descendente');
  eq(O.etiquetaTituloOrden('goles', 'pj_desc'), 'Goles', 'otra columna: sólo el nombre');
});

console.log('\n\x1b[1mEL TIEMPO\x1b[0m — 500 jugadores\n');

prueba('orden/NFR-003: con 500 jugadores, cada uno de los trece modos ordena en 50 ms o menos (mediana de 5)', () => {
  const plantel = plantelAlAzar(99, 500);
  const manual = ids(plantel).reverse();
  const tiempos = O.ORDEN_MODOS.map(modo => {
    const corridas = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      O.sortRoster(plantel, modo, manual);
      corridas.push(performance.now() - t0);
    }
    corridas.sort((a, b) => a - b);
    return { modo, mediana: corridas[2] };
  });
  const lentos = tiempos.filter(t => t.mediana > 50);
  eq(lentos, [], 'modos por encima de 50 ms');
  console.log(`      la mediana más alta: ${Math.max(...tiempos.map(t => t.mediana)).toFixed(2)} ms`);
});

console.log('\n\x1b[1mLA FUENTE\x1b[0m — lo que sólo se prueba leyendo index.html\n');

/* El bloque de `window.preferenciaDeOrden`, desde su asignación hasta la llave que la cierra. */
function bloqueDePreferencia() {
  const desde = src.indexOf('window.preferenciaDeOrden = {');
  const hasta = src.indexOf('\n  };', desde);
  ok(desde > 0 && hasta > desde, 'se encuentra el bloque de window.preferenciaDeOrden');
  return [desde, hasta];
}
const apariciones = texto => {
  const out = [];
  for (let i = src.indexOf(texto); i !== -1; i = src.indexOf(texto, i + 1)) out.push(i);
  return out;
};

prueba('orden/TC-013: la colección y la cuenta sólo aparecen dentro de window.preferenciaDeOrden', () => {
  const [desde, hasta] = bloqueDePreferencia();
  ['preferenciasOrden', 'currentUser'].forEach(texto => {
    const todas = apariciones(texto);
    ok(todas.length > 0, `${texto} aparece en index.html`);
    const fuera = todas.filter(i => i < desde || i > hasta).map(i => src.slice(0, i).split('\n').length);
    eq(fuera, [], `líneas de index.html con ${texto} fuera del bloque`);
  });
});

prueba('orden/S-03b: la preferencia se lee sólo al arrancar: index.html no escucha cambios en vivo', () => {
  eq(apariciones('onSnapshot').length, 0, 'apariciones de onSnapshot');
});

/* El cuerpo de un manejador `window.__<nombre> = (async) function(…){ … };`, hasta su llave de cierre. */
function cuerpoDeManejador(nombre) {
  const desde = src.indexOf(`window.${nombre} = `);
  ok(desde > 0, `se encuentra window.${nombre}`);
  const hasta = src.indexOf('\n  };', desde);
  return src.slice(desde, hasta);
}

prueba('orden/S-06: cualquier cuenta arrastra: ni el inicio ni el soltado del listado preguntan por el rol', () => {
  ['__dragStartRosterRow', '__dropOnRosterRow'].forEach(nombre =>
    ok(!cuerpoDeManejador(nombre).includes('isAdmin'), `window.${nombre} consulta isAdmin`));
});

prueba('orden/TC-041: ningún camino del soltado del listado escribe data/players', () => {
  const cuerpo = cuerpoDeManejador('__dropOnRosterRow');
  ['savePlayers', 'storage.set', "'players'"].forEach(texto =>
    ok(!cuerpo.includes(texto), `window.__dropOnRosterRow contiene ${texto}`));
  ok(cuerpo.includes('guardarPreferenciaOrden'), 'el soltado guarda la preferencia de la cuenta');
});

prueba('orden/TC-044: un modo leído con texto HTML no llega a la pantalla: los títulos y el menú sólo usan rótulos fijos', () => {
  const HOSTILES = ['<img src=x onerror=alert(1)>', 'goles_<img src=x>', '"><script>x</script>', 'puntaje_desc" onclick="x'];
  const NOMBRES = { posicion: 'Posición', jugador: 'Jugador', pj: 'Partidos jugados', goles: 'Goles', asist: 'Asistencias', puntaje: 'Pts' };
  HOSTILES.forEach(modo => {
    Object.entries(NOMBRES).forEach(([criterio, nombre]) =>
      eq(O.etiquetaTituloOrden(criterio, modo), nombre, `título de ${criterio} con modo ${JSON.stringify(modo)}`));
    eq(O.normalizarPreferenciaOrden(JSON.stringify({ modo, ordenManual: [modo] })).modo, 'manual', `normalizado ${JSON.stringify(modo)}`);
  });
  /* El menú, recortado con lo mínimo alrededor: aunque el estado en memoria tuviera un modo hostil
     (la normalización lo impide), lo insertado son sólo los rótulos de ORDEN_MODO_LABELS. */
  ['admin', 'jugador'].forEach(rol => HOSTILES.forEach(modo => {
    const menu = new Function(`
      let ordenActivo = ${JSON.stringify(modo)};
      const isAdmin = () => ${rol === 'admin'};
      const select = { innerHTML: '' };
      const el = () => select;
      ${['ORDEN_MODOS', 'ORDEN_MODO_LABELS', 'effectiveSortMode', 'renderOrdenModoSelect'].map(n => extraer(src, n)).join('\n')}
      renderOrdenModoSelect();
      return select.innerHTML;`)();
    ok(!/<(?!\/?option\b)/i.test(menu), `${rol}, modo ${JSON.stringify(modo)}: el menú tiene una etiqueta que no es <option>: ${menu}`);
    ok(!menu.includes('onclick') && !menu.includes('onerror'), `${rol}, modo ${JSON.stringify(modo)}: el menú tiene un atributo de evento`);
  }));
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ el listado se ordena por cada columna, en los dos sentidos, y el orden manual sigue al plantel\x1b[0m');
process.exit(0);
