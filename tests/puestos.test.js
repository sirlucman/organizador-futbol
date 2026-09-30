#!/usr/bin/env node
/* Tests de "Desglose de posiciones". Se corren con:
 *
 *     node tests/puestos.test.js
 *
 * Cubren lo que NO necesita un navegador: el catálogo de ocho puestos y sus derivadas, el motor
 * con los puestos nuevos (recortado de index.html con `cargarMotor`), la reclasificación, el
 * filtro y el orden de la lista, el bloqueo, la cancha por lados y la lectura de los partidos
 * guardados con posiciones viejas. Lo que se ve en pantalla vive en tests/layout.test.js
 * (escenarios `puestos-*`).
 *
 * Los tests que ya existían (motor, cancha, panel, finalizado, colores) siguen escritos con las
 * posiciones viejas A PROPÓSITO: son la red de regresión que prueba que generalizar el motor no
 * cambió el algoritmo (Implementation Plan, TD-05). Este archivo prueba el catálogo nuevo.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, con guion y con el prefijo de la
 * feature ("puestos/S-05b"): es la convención de binding de AGENTS.md, y los gates del
 * Implementation Plan (T-2.D8, T-2.D9) lo buscan con grep.
 */
const fs = require('fs');
const path = require('path');
const { extraer, cargarMotor, DECLARACIONES_CATALOGO } = require('./harness');
const F = require('./fixtures');

const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

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

/* ---------- planteles con los puestos nuevos ---------- */
const J = (id, principal, secundarias = [], scores = {}) =>
  ({ id, nombre: id, apellido: '', principal, secundarias, scores: { ...scores } });
const CAMPO = ['LI', 'DC', 'LD', 'MI', 'MC', 'MD', 'DEL'];
const FORMACION_8 = F.FORMACION_PUESTOS.futbol8;
const FORMACION_9 = F.FORMACION_PUESTOS.futbol9;

// Dos arqueros y `porPuesto[p]` naturales de cada puesto de campo, todos con la misma nota salvo
// que `notas` diga otra cosa. Sin secundarias: cada puesto se cubre sólo con sus naturales.
function plantelNatural(porPuesto, notas = {}) {
  const individuales = [J('arq1', 'Arquero', [], { Arquero: 7 }), J('arq2', 'Arquero', [], { Arquero: 7 })];
  CAMPO.forEach(pos => {
    for (let i = 0; i < (porPuesto[pos] || 0); i++) {
      const id = `${pos.toLowerCase()}${i + 1}`;
      individuales.push(J(id, pos, [], { [pos]: notas[id] !== undefined ? notas[id] : 6 }));
    }
  });
  return individuales;
}
const DOS_DE_CADA = { LI: 2, DC: 2, LD: 2, MI: 2, MC: 2, MD: 2, DEL: 2 };

/* El harness deja sin params a toda regla que no se le pasa, y `usarSecundarias` sin valor es
   falso. En la aplicación arranca prendido (su default de REGLAS_CATALOGO), así que acá también. */
function motorCon(config = {}) {
  return cargarMotor({
    posiciones: { params: { usarSecundarias: true } },
    puntaje: { params: { diferenciaMaxima: 0 } },
    balanceLineas: { params: { margenTotal: 1 } },
    ...config,
  });
}
const motor = motorCon();

const equipoDe = (res, id) => (res.blanco.includes(id) ? 'blanco' : 'negro');
// Cuántos titulares de cada puesto asignado tiene un equipo.
function puestosDelEquipo(res, equipo) {
  const out = {};
  res[equipo].forEach(id => {
    const pos = res.posicionAsignada[id];
    out[pos] = (out[pos] || 0) + 1;
  });
  return out;
}

/* Planteles al azar con siete puestos: el mismo generador que usa tools/medir-motor.js (principal
   sesgado por línea, secundarias con sesgo a la misma línea). Determinista por semilla. */
function rng(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function plantelAlAzar(semilla, cancha = 8) {
  const r = rng(semilla);
  const nota = () => Math.round((3 + r() * 6) * 2) / 2;
  const deCampo = cancha === 9 ? 16 : 14;
  const individuales = [J('arq0', 'Arquero', [], { Arquero: nota() }), J('arq1', 'Arquero', [], { Arquero: nota() })];
  const linea = { LI: 'D', DC: 'D', LD: 'D', MI: 'M', MC: 'M', MD: 'M', DEL: 'A' };
  for (let i = 0; i < deCampo; i++) {
    const x = r();
    const principal = x < 0.42 ? ['LI', 'DC', 'DC', 'LD'][Math.floor(r() * 4)]
      : x < 0.85 ? ['MI', 'MC', 'MC', 'MD'][Math.floor(r() * 4)] : 'DEL';
    const secundarias = [];
    if (r() < 0.8) {
      const k = 1 + Math.floor(r() * 2);
      const candidatas = CAMPO.filter(p => p !== principal)
        .sort((a, b) => (linea[b] === linea[principal]) - (linea[a] === linea[principal]));
      for (let j = 0; j < k; j++) {
        const elegida = r() < 0.7 ? candidatas[j] : candidatas[Math.floor(r() * candidatas.length)];
        if (!secundarias.includes(elegida)) secundarias.push(elegida);
      }
    }
    const scores = { [principal]: nota() };
    secundarias.forEach(p => { scores[p] = nota(); });
    individuales.push(J(`j${i}`, principal, secundarias, scores));
  }
  return { cancha: cancha === 9 ? 'futbol9' : 'futbol8', formacion: cancha === 9 ? FORMACION_9 : FORMACION_8, individuales, duplas: [] };
}

/* ================================================================= CATÁLOGO */
console.log('\n\x1b[1mCATÁLOGO\x1b[0m — ocho puestos, cuatro líneas, tres posiciones viejas\n');

prueba('puestos/TC-013: la etiqueta de la formación se cuenta por línea, con la forma vieja y con la nueva', () => {
  eq(motor.etiquetaFormacion(FORMACION_8), '3-3-1', 'Fútbol 8 por puesto');
  eq(motor.etiquetaFormacion(FORMACION_9), '3-4-1', 'Fútbol 9 por puesto');
  eq(motor.etiquetaFormacion({ defensores: 3, volantes: 3, delanteros: 1 }), '3-3-1', 'Fútbol 8 guardado antes del cambio');
  eq(motor.etiquetaFormacion({ defensores: 3, volantes: 4, delanteros: 1 }), '3-4-1', 'Fútbol 9 guardado antes del cambio');
});

/* ================================================================= FORMACIÓN FIJA */
console.log('\n\x1b[1mFORMACIÓN FIJA\x1b[0m — un lugar de cada puesto en cada equipo\n');

const generar4 = (m, individuales, formacion, extra = {}) => m.generarEquiposEstrategia4(
  individuales, extra.bloqueados || [], extra.prevTeamOf || {}, extra.prevPos || null, formacion);

prueba('puestos/S-05: con dos naturales de cada puesto, cada equipo tiene exactamente un titular en cada uno', () => {
  const res = generar4(motor, plantelNatural(DOS_DE_CADA), FORMACION_8);
  ['blanco', 'negro'].forEach(e => {
    eq(puestosDelEquipo(res, e), { Arquero: 1, LI: 1, DC: 1, LD: 1, MI: 1, MC: 1, MD: 1, DEL: 1 }, `el ${e}`);
    ok(res.formacion[e].cumplida, `la formación del ${e} se cumplió`);
  });
  eq(res.swaps, [], 'sin secundarias usadas');
});

prueba('puestos/S-05a: en Fútbol 9 con cuatro MC naturales, cada equipo tiene dos MC', () => {
  const res = generar4(motor, plantelNatural({ ...DOS_DE_CADA, MC: 4 }), FORMACION_9);
  ['blanco', 'negro'].forEach(e => {
    eq(puestosDelEquipo(res, e).MC, 2, `el ${e} tiene dos MC`);
    ok(res.formacion[e].cumplida, `la formación del ${e} se cumplió`);
  });
  eq(motor.etiquetaFormacion(res.formacion.objetivo), '3-4-1', 'la etiqueta de lo guardado es 3-4-1');
});

prueba('puestos/S-05b: un solo LI natural y un DC con LI de secundario: ese DC es el LI del otro equipo', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, LI: 1, DC: 3 });
  jugadores.find(p => p.id === 'dc3').secundarias = ['LI'];
  jugadores.find(p => p.id === 'dc3').scores.LI = 6;
  const res = generar4(motor, jugadores, FORMACION_8);
  eq(res.posicionAsignada.dc3, 'LI', 'dc3 juega de LI');
  ok(equipoDe(res, 'dc3') !== equipoDe(res, 'li1'), 'en el equipo que no tiene al LI natural');
  ok(res.swaps.some(s => s.playerId === 'dc3' && s.hacia === 'LI' && s.motivo === 'formacion'),
    'y queda registrado como uso de su puesto secundario, que la explicación nombra');
  ok(res.formacion.blanco.cumplida && res.formacion.negro.cumplida, 'las dos formaciones se cumplen');
});

prueba('puestos/S-05c: un solo LI natural y nadie con LI de secundario: se completa igual y falta LI en un equipo', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, LI: 1, DC: 3 });
  const res = generar4(motor, jugadores, FORMACION_8);
  eq(res.blanco.length + res.negro.length, 16, 'los dieciséis titulares quedan en algún equipo');
  eq(res.blanco.length, res.negro.length, 'ocho contra ocho');
  const sinLi = equipoDe(res, 'li1') === 'blanco' ? 'negro' : 'blanco';
  eq(res.formacion[sinLi].faltantes, ['LI'], `en el ${sinLi} falta exactamente LI`);
  ok(res.formacion[sinLi === 'blanco' ? 'negro' : 'blanco'].cumplida, 'el otro equipo la cumple');
});

prueba('puestos/S-05d: si los principales y secundarios alcanzan, cada equipo cubre todos los puestos con quien los juega', () => {
  let alcanzaban = 0;
  for (let semilla = 1; semilla <= 200; semilla++) {
    for (const cancha of [8, 9]) {
      const plantel = plantelAlAzar(semilla, cancha);
      const campo = plantel.individuales.filter(p => p.principal !== 'Arquero');
      const cupoGlobal = {};
      Object.entries(plantel.formacion).forEach(([pos, n]) => { cupoGlobal[pos] = 2 * n; });
      const asignacion = motor.asignarPosicionesOptimo(campo, cupoGlobal);
      const costo = campo.reduce((a, u) => a + motor.costoEncaje(u, asignacion[u.id]), 0);
      if (costo >= motor.COSTO_DESCUBIERTA) continue; // no alcanzaban: el caso es S-05c
      alcanzaban++;
      const res = generar4(motor, plantel.individuales, plantel.formacion);
      ['blanco', 'negro'].forEach(e => ok(res.formacion[e].cumplida,
        `semilla ${semilla}, cancha ${cancha}: alcanzaban y al ${e} le faltó ${JSON.stringify(res.formacion[e].faltantes)}`));
    }
  }
  ok(alcanzaban > 50, `la propiedad necesita casos que la ejerciten; hubo ${alcanzaban}`);
});

/* ================================================================= EQUILIBRIO DE LÍNEAS */
console.log('\n\x1b[1mEQUILIBRIO DE LÍNEAS\x1b[0m — se mide por línea, se reparte por puesto\n');

prueba('puestos/S-06c: para todo armado, la suma de las cuatro líneas de un equipo es el total del equipo', () => {
  for (let semilla = 1; semilla <= 100; semilla++) {
    for (const cancha of [8, 9]) {
      const plantel = plantelAlAzar(semilla, cancha);
      const res = generar4(motor, plantel.individuales, plantel.formacion);
      ['blanco', 'negro'].forEach(e => {
        const porLinea = motor.ORDEN_LINEAS.reduce((a, l) => a + ((res.balanceLineas[l] || {})[e] || 0), 0);
        const total = e === 'blanco' ? res.sumaBlanco : res.sumaNegro;
        ok(Math.abs(porLinea - total) < 0.2, `semilla ${semilla}, cancha ${cancha}, ${e}: líneas ${porLinea}, total ${total}`);
      });
      eq(Object.keys(res.balanceLineas).sort(), [...motor.ORDEN_LINEAS].sort(), 'el balance se guarda por línea, no por puesto');
    }
  }
});

prueba('puestos/S-06d: intercambiar entre equipos a dos titulares del mismo puesto no cambia el encaje del armado', () => {
  for (let semilla = 1; semilla <= 60; semilla++) {
    const plantel = plantelAlAzar(semilla, 8);
    const porId = Object.fromEntries(plantel.individuales.map(p => [p.id, p]));
    const res = generar4(motor, plantel.individuales, plantel.formacion);
    const encaje = (b, n) => [...b, ...n].reduce((a, id) => a + motor.costoEncaje(porId[id], res.posicionAsignada[id]), 0);
    const cupos = (b, n) => JSON.stringify([b, n].map(ids => ids.map(id => res.posicionAsignada[id]).sort()));
    const antes = { encaje: encaje(res.blanco, res.negro), cupos: cupos(res.blanco, res.negro) };
    res.blanco.forEach((idB, i) => res.negro.forEach((idN, j) => {
      if (res.posicionAsignada[idB] !== res.posicionAsignada[idN]) return;
      const b = [...res.blanco], n = [...res.negro];
      b[i] = idN; n[j] = idB;
      eq(encaje(b, n), antes.encaje, `semilla ${semilla}: ${idB} por ${idN}`);
      eq(cupos(b, n), antes.cupos, `semilla ${semilla}: cada equipo conserva sus puestos`);
    }));
  }
});

prueba('puestos/S-06e: dos DC con LD de secundario en el mismo equipo: el que vale más de LD juega de LD', () => {
  /* Juan y Pedro, DC de principal y LD de secundario, bloqueados en el Blanco. Las dos formas de
     ubicarlos encajan igual; sólo cambia la línea: Juan LD 9 + Pedro DC 5 + LI 5 = 19 contra los
     18 del Negro, en vez de 5 + 4 + 5 = 14. Todo lo demás empata. */
  const jugadores = [
    J('arqB', 'Arquero', [], { Arquero: 7 }), J('arqN', 'Arquero', [], { Arquero: 7 }),
    J('juan', 'DC', ['LD'], { DC: 5, LD: 9 }), J('pedro', 'DC', ['LD'], { DC: 5, LD: 4 }), J('liB', 'LI', [], { LI: 5 }),
    J('ldN', 'LD', [], { LD: 6 }), J('dcN', 'DC', [], { DC: 6 }), J('liN', 'LI', [], { LI: 6 }),
    ...['MI', 'MC', 'MD', 'DEL'].flatMap(pos => [J(`${pos}B`, pos, [], { [pos]: 6 }), J(`${pos}N`, pos, [], { [pos]: 6 })]),
  ];
  const prevTeamOf = Object.fromEntries(jugadores.map(p => [p.id, p.id.endsWith('B') || ['juan', 'pedro'].includes(p.id) ? 'blanco' : 'negro']));
  // La generación anterior los había dejado al revés: Pedro de LD y Juan de DC.
  const prevPos = Object.fromEntries(jugadores.map(p => [p.id, p.principal]));
  prevPos.pedro = 'LD';
  const res = generar4(motor, jugadores, FORMACION_8, { bloqueados: jugadores.map(p => p.id), prevTeamOf, prevPos });
  eq(res.posicionAsignada.juan, 'LD', 'Juan juega de LD');
  eq(res.posicionAsignada.pedro, 'DC', 'Pedro juega de DC');
  eq(res.balanceLineas.Defensa.blanco, 19, 'Defensa del Blanco: 19');
  eq(res.balanceLineas.Defensa.negro, 18, 'Defensa del Negro: 18');
});

/* ================================================================= POR POSICIÓN Y PUNTAJE */
console.log('\n\x1b[1mPOR POSICIÓN Y PUNTAJE\x1b[0m — cada puesto parejo entre los dos equipos\n');

const generar2 = (m, individuales) => m.generarEquiposEstrategia2(individuales, [], {}, null);

prueba('puestos/S-07: con dos naturales de cada puesto, cada equipo tiene exactamente un titular de cada uno', () => {
  const res = generar2(motor, plantelNatural(DOS_DE_CADA));
  ['blanco', 'negro'].forEach(e => {
    eq(puestosDelEquipo(res, e), { Arquero: 1, LI: 1, DC: 1, LD: 1, MI: 1, MC: 1, MD: 1, DEL: 1 }, `el ${e}`);
  });
});

const plantelTresLd = () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, LD: 3, LI: 1 });
  const ld3 = jugadores.find(p => p.id === 'ld3');
  ld3.secundarias = ['LI'];
  ld3.scores.LI = 6;
  return jugadores;
};

prueba('puestos/S-07a: tres LD, uno con LI de secundario, y un solo LI: ese LD pasa a LI', () => {
  const res = generar2(motor, plantelTresLd());
  eq(res.posicionAsignada.ld3, 'LI', 'ld3 juega de LI');
  ok(res.swaps.some(s => s.playerId === 'ld3' && s.desde === 'LD' && s.hacia === 'LI'), 'y queda registrado para la explicación');
  ['blanco', 'negro'].forEach(e => {
    eq(puestosDelEquipo(res, e).LD, 1, `el ${e} tiene un LD`);
    eq(puestosDelEquipo(res, e).LI, 1, `el ${e} tiene un LI`);
  });
});

prueba('puestos/S-07b: el mismo plantel sin usarSecundarias no usa ninguna secundaria y un equipo queda con dos LD', () => {
  const sin = motorCon({ posiciones: { params: { usarSecundarias: false } } });
  const res = generar2(sin, plantelTresLd());
  eq(res.swaps, [], 'ninguna secundaria');
  const lds = ['blanco', 'negro'].map(e => puestosDelEquipo(res, e).LD || 0).sort();
  eq(lds, [1, 2], 'uno de los equipos tiene dos LD');
});

prueba('puestos/S-07c: con la regla de balancear posiciones apagada, los titulares se reparten en un solo grupo', () => {
  /* Si el reparto es de un solo grupo, el puesto de cada uno no influye: ponerles a todos el
     mismo puesto tiene que dar exactamente los mismos equipos. */
  const sin = motorCon({ posiciones: { enabled: false } });
  const jugadores = plantelAlAzar(7, 8).individuales;
  const res = generar2(sin, jugadores);
  const iguales = jugadores.map(p => p.principal === 'Arquero' ? p
    : { ...p, principal: 'DC', secundarias: [], scores: { DC: p.scores[p.principal] } });
  const resIguales = generar2(sin, iguales);
  eq(res.swaps, [], 'sin reglas de posición no se usa ninguna secundaria');
  eq([res.blanco, res.negro], [resIguales.blanco, resIguales.negro], 'el puesto de cada uno no cambió el reparto');
});

/* ================================================================= ARQUERO DESPLAZADO */
console.log('\n\x1b[1mARQUERO DESPLAZADO\x1b[0m — el que no gana el arco y no tiene secundarias\n');

prueba('puestos/S-08: tres arqueros, el que no gana el arco y no tiene secundarias queda como DEL, con cada estrategia', () => {
  const jugadores = [
    J('arqA', 'Arquero', ['DC'], { Arquero: 8, DC: 5 }), J('arqB', 'Arquero', [], { Arquero: 7 }), J('arqC', 'Arquero', [], { Arquero: 5 }),
    ...plantelNatural(DOS_DE_CADA).filter(p => p.principal !== 'Arquero').slice(0, 13),
  ];
  const r1 = motor.generarEquiposEstrategia1(jugadores, [], {});
  eq(r1.posicionOverride.arqC, 'DEL', 'Estrategia 1: arqC figura como DEL');
  eq(r1.arquerosExcedentes, [{ playerId: 'arqC', pos: 'DEL' }], 'Estrategia 1: la explicación lo registra como DEL');
  const r2 = generar2(motor, jugadores);
  eq(r2.posicionAsignada.arqC, 'DEL', 'Estrategia 2: arqC juega de DEL');
  eq(r2.arquerosExcedentes, [{ playerId: 'arqC', pos: 'DEL' }], 'Estrategia 2: registrado como DEL');
  const r4 = generar4(motor, jugadores, FORMACION_8);
  eq(r4.arquerosExcedentes, [{ playerId: 'arqC', pos: 'DEL' }], 'Formación Fija: registrado como DEL');
});

prueba('puestos/FR-067: con "Por puntaje" nadie recibe puesto asignado y la etiqueta es la sigla del principal', () => {
  const jugadores = plantelNatural(DOS_DE_CADA);
  const res = motor.generarEquiposEstrategia1(jugadores, [], {});
  ok(!res.posicionAsignada, 'la Estrategia 1 no asigna puestos');
  eq(jugadores.map(p => motor.siglaDe(p.principal)).slice(0, 4), ['ARQ', 'ARQ', 'LI', 'LI'], 'la etiqueta informativa es la sigla del principal');
});

/* ================================================================= VALORES DESCONOCIDOS */
console.log('\n\x1b[1mVALORES DESCONOCIDOS\x1b[0m — lo guardado que no es puesto ni posición vieja\n');

prueba('puestos/S-20b: un titular con principal desconocido no está a revisar y el motor lo reparte como sin puesto', () => {
  const jugadores = plantelNatural(DOS_DE_CADA).slice(0, 15);
  jugadores.push(J('libero', 'Líbero', [], { 'Líbero': 6 }));
  ok(!motor.estaARevisar(jugadores[15]), 'no está a revisar: no es una posición vieja');
  eq(motor.lineaDe('Líbero'), null, 'no tiene línea');
  const res = generar2(motor, jugadores);
  eq(res.blanco.length + res.negro.length, 16, 'queda en un equipo: antes se perdía fuera de todos los grupos');
  const r4 = generar4(motor, jugadores, FORMACION_8);
  eq(r4.blanco.length + r4.negro.length, 16, 'también con Formación Fija');
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ los ocho puestos se eligen, se reparten, se dibujan y se leen como fija la Spec\x1b[0m');
process.exit(0);
