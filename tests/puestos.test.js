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

prueba('puestos/FR-068: una dupla vale, en cada uno de los ocho puestos, el promedio del aporte de sus integrantes', () => {
  /* Dos jugadores ya reclasificados. `a` conserva además su puntaje viejo de Defensor (FR-027),
     que no tiene que entrar en su promedio general (FR-028) ni en ningún puesto nuevo. */
  const a = J('a', 'LD', ['DC'], { LD: 8, DC: 6, Defensor: 9 });
  const b = J('b', 'LD', ['MC'], { LD: 6, MC: 7 });
  const d = motor.construirUnidadDupla(a, b);
  eq(Object.keys(d.scores).filter(k => motor.VALORES_PUESTO.includes(k)), motor.VALORES_PUESTO, 'tiene un valor por cada puesto del catálogo');
  // Los dos tienen nota en LD (8 y 6).
  eq(d.scores.LD, 7, 'LD: el promedio de las dos notas');
  // En DC sólo `a` tiene nota (6); `b` aporta su promedio general, 6,5 (LD 6, MC 7).
  eq(d.scores.DC, 6.3, 'DC: la nota de uno y el promedio general del otro');
  // En MC sólo `b` tiene nota (7); `a` aporta su promedio general, 7 (LD 8, DC 6: sin el Defensor 9).
  eq(d.scores.MC, 7, 'MC: el promedio general de `a` no cuenta su puntaje viejo');
  // Ninguno juega MI ni ARQ: la fórmula colapsa al promedio de los promedios generales.
  eq(d.scores.MI, 6.8, 'MI: sin notas, el valor general de siempre');
  eq(d.scores.Arquero, 6.8, 'ARQ: ídem');
  eq(d._valorGeneral, 6.8, 'el valor general de la unidad');
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

/* ================================================================= LA CANCHA Y LO GUARDADO */
const { docsDesde } = require('./fixtures-app');
const { execFileSync } = require('child_process');

/* El panel y la cancha reales, recortados de un index.html. `players` lo declara el prelude con un
   setter, como en panel.test.js. Sirve también para cargar la versión ANTERIOR al catálogo de
   puestos (commit 854d673), que declara sus posiciones con otros nombres y en otro orden. */
const DECLARACIONES_LECTURA = [
  ...DECLARACIONES_CATALOGO, 'computeAvg', 'valorGeneralDe', 'puntajeEnPosicion', 'lineaDeUnSoloLugar',
  'objetivoDiferencia', 'esDupla', 'getDuplaPartner', 'posicionAsignadaDe', 'construirUnidadDupla',
  'valorDePuntaje', 'jugadoresDeEquipoOrdenados', 'agruparFilasDeEquipo', 'agruparEnLineasDeCancha',
  'MAX_POR_SUBFILA', 'partirLineaEnSubfilas',
  'sumasPorLinea', 'balanceLineasDe', 'balanceGuardadoPorLinea', 'colapsarDuplasParaLinea', 'balanceLineasVigente',
  'celdasDiferenciaPorLinea', 'sumaVigenteDeEquipo', 'sumasVigentes', 'COSTO_DESCUBIERTA',
  'costoEncaje', 'cubrePosicionGuardada', 'faltantesDeFormacionVigente', 'repartoDivergeDeLaGeneracion',
  'CANCHAS', 'formacionTexto',
];
const DECLARACIONES_SIN_CATALOGO = ['POSITIONS', 'ORDEN_FORMACION', 'FORMACION_KEY_POR_POSICION',
  'ORDEN_LINEAS', 'LABEL_LINEA', 'ORDEN_POSICION_LECTURA'];
function cargarLectura(fuente) {
  const conCatalogo = /\n[ \t]*const LINEAS\b/.test(fuente);
  const base = conCatalogo ? DECLARACIONES_LECTURA
    : [...DECLARACIONES_SIN_CATALOGO, ...DECLARACIONES_LECTURA.filter(n => !DECLARACIONES_SIN_CATALOGO.includes(n))];
  const nombres = base.filter(n => new RegExp(`\\n[ \\t]*(function|const|let)[ \\t]+${n}\\b`).test(fuente));
  const cuerpo = nombres.map(n => extraer(fuente, n)).join('\n\n');
  return new Function(`let players = [];\nfunction __setPlayers(p){ players = p; }\n${cuerpo}\nreturn { __setPlayers, ${nombres.join(', ')} };`)();
}
const L = cargarLectura(src);
let anterior = null;
try {
  anterior = cargarLectura(execFileSync('git', ['show', '854d673:index.html'],
    { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
} catch (e) { anterior = null; }

// El plantel y los partidos de la app de prueba, con el puntaje de cada jugador ya adentro.
function datosApp(opciones) {
  const d = docsDesde(undefined, opciones);
  const scores = JSON.parse(d.playerScores || '{}');
  const jugadores = JSON.parse(d.players).map(p => ({ ...p, scores: scores[p.id] || {} }));
  return { jugadores, partidos: JSON.parse(d.partidos) };
}
const porIdDe = jugadores => Object.fromEntries(jugadores.map(p => [p.id, p]));
// Cómo se ve la cancha de un equipo: las filas de arriba abajo, con los ids de cada unidad.
function cancha(P, jugadores, m, equipo) {
  P.__setPlayers(jugadores);
  const filas = P.agruparEnLineasDeCancha(m, P.agruparFilasDeEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos[equipo])));
  return filas.map(f => ({ linea: f.linea, ids: f.unidades.map(u => u.map(j => j.id).join('+')) }));
}
// Lo que muestra un partido: filas de las dos canchas, totales, celdas de línea y faltantes.
function vista(P, jugadores, m, { etiquetaDeFila = x => x } = {}) {
  P.__setPlayers(jugadores);
  const porId = porIdDe(jugadores);
  const filas = ['blanco', 'negro'].map(e => {
    const agrupadas = P.agruparEnLineasDeCancha(m, P.agruparFilasDeEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos[e])));
    return agrupadas.map(f => [etiquetaDeFila(f.linea || f.pos), f.unidades.map(u => u.map(j => j.id).join('+'))]);
  });
  const redondear = x => Math.round(x * 10) / 10;
  const suma = P.sumasVigentes(m);
  const celdas = (P.celdasDiferenciaPorLinea(m, porId, 1) || []).map(c => [c.etiqueta, c.blanco, c.negro, c.texto]);
  const faltantes = P.faltantesDeFormacionVigente(m, porId);
  return { filas, totales: [redondear(suma.blanco), redondear(suma.negro)], celdas,
    faltantes: faltantes && [faltantes.blanco.length, faltantes.negro.length] };
}
const ETIQUETA_VIEJA = { Arquero: 'Arco', Defensor: 'Defensa', Volante: 'Medio', Delantero: 'Ataque' };

console.log('\n\x1b[1mLA CANCHA\x1b[0m — cada uno en su lado\n');

// Un partido generado con Formación Fija, con la forma que le deja `__generarEquipos`.
function partidoGenerado(individuales, formacion, cancha = 'futbol8') {
  const res = generar4(motor, individuales, formacion);
  return { id: 'm', cancha, duplas: [], bloqueados: [], equipos: { ...res, estrategiaKey: 'estrategia4' } };
}
const siglasDeFilas = (jugadores, m, equipo) => {
  L.__setPlayers(jugadores);
  return L.agruparEnLineasDeCancha(m, L.agruparFilasDeEquipo(m, L.jugadoresDeEquipoOrdenados(m, m.equipos[equipo])))
    .map(f => f.unidades.map(u => L.siglaDe(L.posicionAsignadaDe(u[0], m))));
};

prueba('puestos/S-09: de arriba abajo Ataque, Medio, Defensa y Arco, cada fila de izquierda a derecha', () => {
  const jugadores = plantelNatural(DOS_DE_CADA);
  const m = partidoGenerado(jugadores, FORMACION_8);
  ['blanco', 'negro'].forEach(e => eq(siglasDeFilas(jugadores, m, e), [['DEL'], ['MI', 'MC', 'MD'], ['LI', 'DC', 'LD'], ['ARQ']], `el ${e}`));
});

prueba('puestos/S-09a: en Fútbol 9 el Medio se ve MI, MC, MC, MD', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, MC: 4 });
  const m = partidoGenerado(jugadores, FORMACION_9, 'futbol9');
  ['blanco', 'negro'].forEach(e => eq(siglasDeFilas(jugadores, m, e)[1], ['MI', 'MC', 'MC', 'MD'], `el Medio del ${e}`));
});

prueba('puestos/S-09b: con "Por puntaje", dos LD y un DC en la Defensa se ven DC, LD, LD', () => {
  const jugadores = [J('ld1', 'LD'), J('dc1', 'DC'), J('ld2', 'LD')];
  const m = { id: 'm', duplas: [], equipos: { blanco: ['ld1', 'dc1', 'ld2'], negro: [], posicionAsignada: null } };
  eq(siglasDeFilas(jugadores, m, 'blanco')[2], ['DC', 'LD', 'LD'], 'el central antes que los dos derechos');
});

prueba('puestos/S-09c: cinco de Defensa (LI, LI, DC, LD, LD): arriba LI, LI, DC y abajo LD, LD', () => {
  const jugadores = [J('ld1', 'LD'), J('li1', 'LI'), J('dc1', 'DC'), J('ld2', 'LD'), J('li2', 'LI')];
  const m = { id: 'm', duplas: [], equipos: { blanco: jugadores.map(p => p.id), negro: [], posicionAsignada: null } };
  L.__setPlayers(jugadores);
  const defensa = L.agruparEnLineasDeCancha(m, L.agruparFilasDeEquipo(m, L.jugadoresDeEquipoOrdenados(m, m.equipos.blanco)))
    .find(f => f.linea === 'Defensa');
  eq(L.partirLineaEnSubfilas(defensa.unidades).map(sf => sf.map(u => u[0].principal)), [['LI', 'LI', 'DC'], ['LD', 'LD']],
    'la sub-fila de arriba lleva los primeros de izquierda a derecha');
});

prueba('puestos/S-09d: dos repintados del mismo reparto dibujan las camisetas en el mismo orden', () => {
  for (let semilla = 1; semilla <= 30; semilla++) {
    const plantel = plantelAlAzar(semilla, 9);
    const m = partidoGenerado(plantel.individuales, plantel.formacion, 'futbol9');
    ['blanco', 'negro'].forEach(e => eq(cancha(L, plantel.individuales, m, e), cancha(L, plantel.individuales, m, e), `semilla ${semilla}, ${e}`));
  }
});

console.log('\n\x1b[1mLOS PARTIDOS GUARDADOS\x1b[0m — se siguen viendo como se jugaron\n');

prueba('puestos/S-10: un partido viejo de Formación Fija, con todos reclasificados, se ve igual que antes del cambio', () => {
  if (!anterior) { console.log('      \x1b[33m∅ salteado\x1b[0m — no se pudo leer index.html de 854d673 con git'); return; }
  const viejos = datosApp({ reclasificados: false });
  const nuevos = datosApp({ reclasificados: true });
  ['m-finalizado', 'm-finalizado-eventos', 'm-abierto'].forEach(id => {
    const m = nuevos.partidos.find(x => x.id === id);
    const intacto = JSON.stringify(m);
    const antes = vista(anterior, viejos.jugadores, viejos.partidos.find(x => x.id === id), { etiquetaDeFila: x => ETIQUETA_VIEJA[x] || x });
    const despues = vista(L, nuevos.jugadores, m);
    eq(despues.filas, antes.filas, `${id}: cada camiseta en la misma fila y en el mismo orden`);
    eq(despues.totales, antes.totales, `${id}: los mismos totales`);
    eq(despues.celdas, antes.celdas, `${id}: la misma diferencia por línea`);
    eq(despues.faltantes, antes.faltantes, `${id}: la misma formación cumplida o no`);
    eq(JSON.stringify(m), intacto, `${id}: leerlo no lo modificó (FR-084)`);
  });
  const m = nuevos.partidos.find(x => x.id === 'm-finalizado');
  eq(L.etiquetaFormacion(m.equipos.formacion.objetivo), '3-3-1', 'la etiqueta de la formación guardada');
});

prueba('puestos/S-10a: el mismo partido, antes de reclasificar a nadie, también se ve igual', () => {
  if (!anterior) { console.log('      \x1b[33m∅ salteado\x1b[0m — no se pudo leer index.html de 854d673 con git'); return; }
  const viejos = datosApp({ reclasificados: false });
  ['m-finalizado', 'm-nueve'].forEach(id => {
    const m = viejos.partidos.find(x => x.id === id);
    eq(vista(L, viejos.jugadores, m), vista(anterior, viejos.jugadores, m, { etiquetaDeFila: x => ETIQUETA_VIEJA[x] || x }),
      `${id}: igual que con el código de antes`);
  });
});

prueba('puestos/S-10b: un partido viejo de Fútbol 9 se rotula 3-4-1', () => {
  const { partidos } = datosApp();
  const m = partidos.find(x => x.id === 'm-finalizado-nueve');
  eq(L.etiquetaFormacion(m.equipos.formacion.objetivo), '3-4-1', 'desde la formación guardada');
  eq(L.formacionTexto(m), '3-4-1', 'desde el tamaño de cancha');
});

prueba('puestos/S-10c: un partido viejo de "Por puntaje" dibuja a cada uno en la línea de su principal actual', () => {
  const { jugadores, partidos } = datosApp();
  const m = JSON.parse(JSON.stringify(partidos.find(x => x.id === 'm-finalizado')));
  m.equipos.posicionAsignada = null;
  m.equipos.estrategiaKey = 'estrategia1';
  L.__setPlayers(jugadores);
  const porId = porIdDe(jugadores);
  L.agruparEnLineasDeCancha(m, L.agruparFilasDeEquipo(m, L.jugadoresDeEquipoOrdenados(m, m.equipos.blanco))).forEach(f => {
    f.unidades.forEach(u => eq(L.lineaDe(porId[u[0].id].principal), f.linea, `${u[0].id} en la fila de su principal`));
  });
});

prueba('puestos/S-10d: en ningún partido guardado cae una camiseta en la fila de "sin puesto reconocible"', () => {
  [datosApp({ reclasificados: false }), datosApp({ reclasificados: true })].forEach(({ jugadores, partidos }) => {
    partidos.filter(m => m.equipos).forEach(m => ['blanco', 'negro'].forEach(e => {
      const filas = cancha(L, jugadores, m, e);
      eq(filas.map(f => f.linea), ['Ataque', 'Medio', 'Defensa', 'Arco'], `${m.id}, ${e}: sólo las cuatro líneas`);
    }));
  });
});

prueba('puestos/S-20a: un valor guardado cualquiera ("Líbero") cae en la fila aparte, debajo del arco, sin error', () => {
  const jugadores = [J('a', 'Arquero'), J('x', 'DC'), J('z', 'DC')];
  const m = { id: 'm', duplas: [], equipos: { blanco: ['a', 'x', 'z'], negro: [], posicionAsignada: { a: 'Arquero', x: 'DC', z: 'Líbero' } } };
  eq(cancha(L, jugadores, m, 'blanco').map(f => f.linea), ['Ataque', 'Medio', 'Defensa', 'Arco', 'Líbero'], 'la fila aparte, al final');
  eq(L.lineaDe('Líbero'), null, 'no tiene línea');
  eq(L.siglaDe('<img src=x>'), '<img src=x>', 'la etiqueta devuelve el valor tal cual: quien lo inserta lo escapa (TC-040)');
});

/* ================================================================= LA FICHA Y LA LISTA */
const DECLARACIONES_FICHA = [
  ...DECLARACIONES_CATALOGO, 'blankScores', 'computeAvg', 'puntajesViejosDe', 'estadoInicialDeFicha',
  'precargaDePuesto', 'scoresAlGuardar', 'textoAntesDeReclasificar', 'FILTRO_A_REVISAR', 'pasaFiltroPuesto',
  'alfabetico', 'sortRoster',
];
const FICHA = new Function(`${DECLARACIONES_FICHA.map(n => extraer(src, n)).join('\n\n')}\nreturn { ${DECLARACIONES_FICHA.join(', ')} };`)();
// Juan, de la Spec: Defensor 7 de principal y Volante 6 de secundaria.
const juan = () => J('juan', 'Defensor', ['Volante'], { Defensor: 7, Volante: 6 });
// La ficha abierta, con la precarga aplicada a medida que se eligen puestos, como hace la pantalla.
function reclasificar(p, elecciones) {
  const inicial = FICHA.estadoInicialDeFicha(p);
  const scores = { ...inicial.scores };
  const elegidos = [inicial.principal, ...inicial.secundarias].filter(Boolean);
  elecciones.forEach(pos => { scores[pos] = FICHA.precargaDePuesto(pos, inicial.puntajesViejos, scores); elegidos.push(pos); });
  return { inicial, scores, elegidos };
}

console.log('\n\x1b[1mLA FICHA\x1b[0m — reclasificar sin perder los puntajes\n');

prueba('puestos/S-01a: principal Arquero y secundaria Defensor: ARQ viene elegido con su puntaje y está a revisar por la secundaria', () => {
  const p = J('a', 'Arquero', ['Defensor'], { Arquero: 8, Defensor: 5 });
  ok(FICHA.estaARevisar(p), 'está a revisar');
  const inicial = FICHA.estadoInicialDeFicha(p);
  eq([inicial.principal, inicial.secundarias, inicial.scores.Arquero], ['Arquero', [], 8], 'ARQ elegido, con su 8; la secundaria vieja sin elegir');
  eq(inicial.puntajesViejos, [{ posicion: 'Defensor', valor: 5 }], 'el puntaje viejo de Defensor queda para precargar');
});

prueba('puestos/S-01b: principal Arquero sin secundarias: no está a revisar y no se le pide nada', () => {
  const p = J('a', 'Arquero', [], { Arquero: 8 });
  ok(!FICHA.estaARevisar(p), 'no está a revisar');
  const inicial = FICHA.estadoInicialDeFicha(p);
  eq([inicial.principal, inicial.reclasificando, inicial.puntajesViejos], ['Arquero', false, []], 'la ficha abre como la de cualquier jugador');
});

prueba('puestos/S-01c: elegir MI sin puntaje viejo de Medio deja vacío su casillero', () => {
  const p = J('p', 'Defensor', [], { Defensor: 7 });
  const { scores } = reclasificar(p, ['LD', 'MI']);
  eq([scores.LD, scores.MI], [7, null], 'LD con el 7 de Defensor, MI vacío');
});

prueba('puestos/S-01d: borrar el puntaje precargado de LD y guardar: LD sin puntaje y el jugador deja de estar a revisar', () => {
  const { scores, elegidos } = reclasificar(juan(), ['LD', 'DC', 'MD']);
  scores.LD = null;
  const guardado = { ...juan(), principal: 'LD', secundarias: ['DC', 'MD'], scores: FICHA.scoresAlGuardar(scores, elegidos) };
  eq(guardado.scores.LD, null, 'LD sin puntaje');
  ok(!FICHA.estaARevisar(guardado), 'ya no está a revisar');
});

prueba('puestos/S-01f: para todo jugador a revisar y toda elección de puestos, los puntajes viejos quedan idénticos', () => {
  const r = rng(11);
  const VIEJAS = ['Defensor', 'Volante', 'Delantero'];
  for (let i = 0; i < 500; i++) {
    const principal = r() < 0.2 ? 'Arquero' : VIEJAS[Math.floor(r() * 3)];
    const secundarias = VIEJAS.filter(v => v !== principal && r() < 0.4);
    if (!secundarias.length && principal === 'Arquero') secundarias.push('Volante');
    const scores = {};
    [principal, ...secundarias].forEach(pos => { if (r() < 0.8) scores[pos] = 1 + Math.floor(r() * 10); });
    const p = J(`p${i}`, principal, secundarias, scores);
    const viejos = Object.fromEntries(Object.entries(scores).filter(([k]) => FICHA.esPosicionVieja(k)));
    const elecciones = CAMPO.filter(() => r() < 0.4);
    const { scores: enFicha, elegidos } = reclasificar(p, elecciones);
    elecciones.forEach(pos => { if (r() < 0.3) enFicha[pos] = r() < 0.5 ? null : 1 + Math.floor(r() * 10); });
    const guardados = FICHA.scoresAlGuardar(enFicha, elegidos);
    const despues = Object.fromEntries(Object.entries(guardados).filter(([k]) => FICHA.esPosicionVieja(k)));
    eq(despues, viejos, `jugador ${i}: los puntajes viejos no cambian`);
  }
});

prueba('puestos/S-02b: sacar LD de los secundarios después de cargarle 6 descarta ese puntaje al guardar', () => {
  const scores = { ...FICHA.blankScores(), DC: 8, LD: 6 };
  const guardados = FICHA.scoresAlGuardar(scores, ['DC']);
  eq([guardados.DC, guardados.LD], [8, null], 'DC se queda, LD se descarta');
});

prueba('puestos/S-01: Juan, Defensor 7 y Volante 6: LD y DC arrancan en 7, MD en 6; después de guardar su promedio es 6', () => {
  const { inicial, scores, elegidos } = reclasificar(juan(), ['LD', 'DC', 'MD']);
  eq([inicial.principal, inicial.secundarias], ['', []], 'principal y secundarios sin elegir');
  eq(FICHA.textoAntesDeReclasificar(inicial.puntajesViejos), 'Antes: Defensor 7 · Volante 6', 'la referencia de sólo lectura');
  eq([scores.LD, scores.DC, scores.MD], [7, 7, 6], 'la precarga por línea');
  scores.DC = 5;
  const guardado = { ...juan(), principal: 'LD', secundarias: ['DC', 'MD'], scores: FICHA.scoresAlGuardar(scores, elegidos) };
  eq([guardado.scores.LD, guardado.scores.DC, guardado.scores.MD], [7, 5, 6], 'LD 7, DC 5, MD 6');
  eq(FICHA.computeAvg(guardado.scores, FICHA.posicionesDe(guardado)), 6, 'el promedio sale sólo de los puestos nuevos');
  eq([guardado.scores.Defensor, guardado.scores.Volante], [7, 6], 'los puntajes viejos siguen guardados');
  eq(FICHA.computeAvg(juan().scores, FICHA.posicionesDe(juan())), 6.5, 'a revisar, el promedio sigue siendo el de sus puntajes viejos');
});

console.log('\n\x1b[1mLA LISTA\x1b[0m — encontrar a los que faltan reclasificar\n');

const plantelDeLista = () => [
  J('del', 'DEL'), J('dc2', 'DC'), J('viejo', 'Defensor'), J('li', 'LI'), J('arq', 'Arquero'), J('dc1', 'DC'),
].map((p, i) => ({ ...p, apellido: String.fromCharCode(97 + i) }));
const ordenar = (modo, lista = plantelDeLista()) => FICHA.sortRoster(lista, modo).map(p => p.principal);

prueba('puestos/S-03: por puesto ascendente la lista queda ARQ, LI, DC, DC, "Defensor", DEL, y "A revisar" deja sólo al viejo', () => {
  eq(ordenar('posicion_asc'), ['Arquero', 'LI', 'DC', 'DC', 'Defensor', 'DEL'], 'el viejo al final de su línea');
  eq(plantelDeLista().filter(p => FICHA.pasaFiltroPuesto(p, FICHA.FILTRO_A_REVISAR)).map(p => p.id), ['viejo'], 'filtro "A revisar"');
});

prueba('puestos/S-03a: descendente invierte el orden', () => {
  eq(ordenar('posicion_desc'), ['DEL', 'Defensor', 'DC', 'DC', 'LI', 'Arquero'], 'de DEL a ARQ');
});

prueba('puestos/S-03b: el filtro DC muestra los dos DC y no al "Defensor"', () => {
  eq(plantelDeLista().filter(p => FICHA.pasaFiltroPuesto(p, 'DC')).map(p => p.id).sort(), ['dc1', 'dc2'], 'sólo los DC');
});

/* ================================================================= EL BLOQUEO */
const DECLARACIONES_BLOQUEO = [
  ...DECLARACIONES_CATALOGO, 'CANCHAS', 'titularesRequeridos', 'getDuplaPartner', 'getUnidadesConvocatoria',
  'getTitularIds', 'titularesARevisar', 'posicionesPreviasVigentes',
];
const BLOQUEO = new Function(`let players = [];\nfunction __setPlayers(p){ players = p; }\n${DECLARACIONES_BLOQUEO.map(n => extraer(src, n)).join('\n\n')}\nreturn { __setPlayers, ${DECLARACIONES_BLOQUEO.join(', ')} };`)();
// Un partido de Fútbol 8 con 16 titulares al día y los `extra` que se le agreguen al final de la cola.
function partidoCon({ aRevisar = [], extra = [], duplas = [] } = {}) {
  const alDia = plantelNatural(DOS_DE_CADA);
  const jugadores = alDia.map(p => aRevisar.includes(p.id) ? { ...p, principal: 'Defensor', scores: { Defensor: 6 } } : p).concat(extra);
  BLOQUEO.__setPlayers(jugadores);
  return { id: 'm', cancha: 'futbol8', convocados: jugadores.map(p => p.id), duplas, bloqueados: [] };
}
const nombresARevisar = m => BLOQUEO.titularesARevisar(m).map(p => p.id);

console.log('\n\x1b[1mEL BLOQUEO\x1b[0m — no se genera con titulares a revisar\n');

prueba('puestos/S-04a: el único a revisar es suplente: el partido no se bloquea', () => {
  const m = partidoCon({ extra: [J('suplente', 'Volante', [], { Volante: 6 })] });
  eq(nombresARevisar(m), [], 'nadie bloquea');
});

prueba('puestos/S-04b: se baja un titular y entra un suplente a revisar: el partido queda bloqueado', () => {
  const m = partidoCon({ extra: [J('suplente', 'Volante', [], { Volante: 6 })] });
  m.convocados = m.convocados.filter(id => id !== 'li1');
  eq(nombresARevisar(m), ['suplente'], 'el que entró es titular y bloquea');
});

prueba('puestos/S-04c: una dupla titular con un integrante a revisar nombra a ese integrante', () => {
  const m = partidoCon({ aRevisar: ['mc2'] });
  m.duplas = [['mc1', 'mc2']];
  eq(nombresARevisar(m), ['mc2'], 'el integrante a revisar, no la dupla entera');
});

prueba('puestos/S-11a: Juan todavía está a revisar: el partido no se regenera', () => {
  const m = partidoCon({ aRevisar: ['ld1'] });
  eq(nombresARevisar(m), ['ld1'], 'bloquea');
});

prueba('puestos/S-11: regenerar un partido viejo con un bloqueado guardado como "Defensor", ya reclasificado a LD', () => {
  const jugadores = plantelNatural(DOS_DE_CADA);
  const primera = generar4(motor, jugadores, FORMACION_8);
  const prevTeamOf = Object.fromEntries([...primera.blanco.map(id => [id, 'blanco']), ...primera.negro.map(id => [id, 'negro'])]);
  // Lo guardado antes del cambio: ld1 figuraba como "Defensor".
  const guardado = { ...primera.posicionAsignada, ld1: 'Defensor' };
  const prev = BLOQUEO.posicionesPreviasVigentes(guardado);
  ok(!('ld1' in prev), 'la posición vieja no se reusa');
  const res = generar4(motor, jugadores, FORMACION_8, { bloqueados: ['ld1'], prevTeamOf, prevPos: prev });
  eq(equipoDe(res, 'ld1'), prevTeamOf.ld1, 'sigue en su equipo');
  ok(!!motor.puestoDe(res.posicionAsignada.ld1), `y juega un puesto del catálogo (${res.posicionAsignada.ld1})`);
});

/* ================================================================= LOS TEXTOS */
/* La explicación real del armado, recortada con lo que necesita. `reglaEnabled`/`reglaParam` los
   declara el prelude, como en panel.test.js; `diferenciaMaxima` en 1 da el umbral del color. */
const DECLARACIONES_RECEIPT = [...new Set([
  ...DECLARACIONES_LECTURA, 'escaparHtml', 'fullName', 'titularesRequeridos', 'getUnidadesConvocatoria',
  'getTitularIds', 'conteoSinPuntajePorEquipo', 'aplicaEnEstrategia', 'margenTotalPorLinea',
  'duplasDeLaFormacion', 'explicacionesDelArmado',
])];
const RECEIPT = new Function(`
  let players = [];
  function __setPlayers(p){ players = p; }
  let motorConfig = { reglas: [] };
  const REGLAS_CATALOGO = {};
  const ESTRATEGIAS = { estrategia1: {}, estrategia2: {}, estrategia4: {} };
  const ESTRATEGIAS_RETIRADAS = { estrategia3: 'estrategia4' };
  function reglaEnabled(){ return true; }
  function reglaParam(key, pk){ return key === 'puntaje' && pk === 'diferenciaMaxima' ? 1 : (key === 'balanceLineas' ? 1 : null); }
  ${DECLARACIONES_RECEIPT.map(n => extraer(src, n)).join('\n\n')}
  return { __setPlayers, ${DECLARACIONES_RECEIPT.join(', ')} };`)();
// Todas las frases de la explicación de un armado, en el orden en que se muestran.
function explicacion(jugadores, m) {
  RECEIPT.__setPlayers(jugadores);
  const e = RECEIPT.explicacionesDelArmado(m, m.equipos, jugadores);
  return [...(e.vigentes || []), ...(e.generacion || [])];
}
function partidoDe(res, jugadores, estrategiaKey, cancha = 'futbol8') {
  return { id: 'm', cancha, convocados: jugadores.map(p => p.id), duplas: [], bloqueados: [],
    equipos: { ...res, estrategiaKey, esPrimeraGeneracion: true, cambios: 0 } };
}

console.log('\n\x1b[1mLOS TEXTOS\x1b[0m — el resumen nombra los puestos nuevos\n');

prueba('puestos/S-05: la explicación dice que la formación 3-3-1 se cumplió en ambos equipos', () => {
  const jugadores = plantelNatural(DOS_DE_CADA);
  const frases = explicacion(jugadores, partidoDe(generar4(motor, jugadores, FORMACION_8), jugadores, 'estrategia4'));
  ok(frases.includes('Formación 3-3-1 cumplida en ambos equipos.'), frases.join(' | '));
});

prueba('puestos/S-05a: en Fútbol 9 la explicación dice 3-4-1', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, MC: 4 });
  const frases = explicacion(jugadores, partidoDe(generar4(motor, jugadores, FORMACION_9), jugadores, 'estrategia4', 'futbol9'));
  ok(frases.includes('Formación 3-4-1 cumplida en ambos equipos.'), frases.join(' | '));
});

prueba('puestos/S-05b: la explicación dice "Se usó a dc3 de LI, su puesto secundario"', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, LI: 1, DC: 3 });
  Object.assign(jugadores.find(p => p.id === 'dc3'), { secundarias: ['LI'], scores: { DC: 6, LI: 6 } });
  const frases = explicacion(jugadores, partidoDe(generar4(motor, jugadores, FORMACION_8), jugadores, 'estrategia4'));
  ok(frases.includes('Se usó a dc3 de LI, su puesto secundario.'), frases.join(' | '));
});

prueba('puestos/S-05c: sin nadie que juegue LI, la explicación dice "No se pudo cubrir LI en el Equipo …"', () => {
  const jugadores = plantelNatural({ ...DOS_DE_CADA, LI: 1, DC: 3 });
  const res = generar4(motor, jugadores, FORMACION_8);
  const sinLi = equipoDe(res, 'li1') === 'blanco' ? 'Negro' : 'Blanco';
  const frases = explicacion(jugadores, partidoDe(res, jugadores, 'estrategia4'));
  ok(frases.includes(`No se pudo cubrir LI en el Equipo ${sinLi}.`), frases.join(' | '));
});

// Un armado de Formación Fija con las líneas de campo a pedido, para mirar la grilla y el receipt.
function armadoConLineas(blanco, negro) {
  const jugadores = [...blanco, ...negro].map(([id, pos, v]) => J(id, pos, [], { [pos]: v }));
  const porId = porIdDe(jugadores);
  const posicionAsignada = Object.fromEntries(jugadores.map(p => [p.id, p.principal]));
  const ids = l => l.map(([id]) => id);
  const m = { id: 'm', cancha: 'futbol8', convocados: jugadores.map(p => p.id), duplas: [], bloqueados: [],
    equipos: { blanco: ids(blanco), negro: ids(negro), posicionAsignada, estrategiaKey: 'estrategia4',
      esPrimeraGeneracion: true, cambios: 0, arquerosInfo: { total: 2, compensado: false },
      formacion: { objetivo: FORMACION_8, blanco: { cumplida: true, faltantes: [] }, negro: { cumplida: true, faltantes: [] } } } };
  m.equipos.balanceLineas = L.balanceLineasDe(m.equipos.blanco, m.equipos.negro, posicionAsignada, porId);
  const suma = l => l.reduce((t, [, , v]) => t + v, 0);
  m.equipos.sumaBlanco = suma(blanco); m.equipos.sumaNegro = suma(negro);
  return { m, jugadores, porId };
}
const medioYAtaque = (b, n) => [['MI', 6], ['MC', 6], ['MD', 6], ['DEL', b]].map(([pos, v]) => [`${pos}${n}`, pos, v]);

prueba('puestos/S-06: LD 7, DC 6, LI 5 contra 6, 6, 6: la celda de Defensa dice 18 contra 18 y "Parejo"', () => {
  const { m, jugadores, porId } = armadoConLineas(
    [['arqB', 'Arquero', 7], ['ldB', 'LD', 7], ['dcB', 'DC', 6], ['liB', 'LI', 5], ...medioYAtaque(6, 'B')],
    [['arqN', 'Arquero', 7], ['ldN', 'LD', 6], ['dcN', 'DC', 6], ['liN', 'LI', 6], ...medioYAtaque(6, 'N')]);
  L.__setPlayers(jugadores);
  const celdas = L.celdasDiferenciaPorLinea(m, porId, 1);
  eq(celdas.map(c => c.etiqueta), ['Arco', 'Defensa', 'Medio', 'Ataque'], 'las celdas se llaman como hoy (FR-002)');
  const defensa = celdas.find(c => c.etiqueta === 'Defensa');
  eq([defensa.blanco, defensa.negro, defensa.texto], [18, 18, 'Parejo'], 'Defensa 18 contra 18');
});

prueba('puestos/S-06a: Arco y Ataque desparejas se distinguen como excedidas y la explicación dice que no se pueden repartir', () => {
  const { m, jugadores, porId } = armadoConLineas(
    [['arqB', 'Arquero', 9], ['ldB', 'LD', 6], ['dcB', 'DC', 6], ['liB', 'LI', 6], ...medioYAtaque(9, 'B')],
    [['arqN', 'Arquero', 5], ['ldN', 'LD', 6], ['dcN', 'DC', 6], ['liN', 'LI', 6], ...medioYAtaque(5, 'N')]);
  L.__setPlayers(jugadores);
  const celdas = L.celdasDiferenciaPorLinea(m, porId, 1);
  ok(celdas.find(c => c.etiqueta === 'Arco').excedida && celdas.find(c => c.etiqueta === 'Ataque').excedida,
    'con la misma regla que Defensa y Medio (Declaración de reemplazo, PANEL_ARMADO FR-034)');
  const frases = explicacion(jugadores, m);
  ok(frases.some(f => f.startsWith('Arco y Ataque tienen un solo lugar por equipo')), frases.join(' | '));
});

prueba('puestos/S-06b: en Fútbol 9 el Medio tiene cuatro lugares y no se nombra como línea de un solo lugar', () => {
  eq(L.lineaDeUnSoloLugar('Medio', { objetivo: FORMACION_9 }), false, 'Medio no');
  eq(L.lineaDeUnSoloLugar('Ataque', { objetivo: FORMACION_9 }), true, 'Ataque sí');
  eq(L.lineaDeUnSoloLugar('Defensa', { objetivo: FORMACION_8 }), false, 'Defensa no: LI, DC y LD suman tres lugares');
});

prueba('puestos/S-07: el resumen de "Por posición y puntaje" muestra el balance por puesto', () => {
  const jugadores = plantelNatural(DOS_DE_CADA);
  const frases = explicacion(jugadores, partidoDe(generar2(motor, jugadores), jugadores, 'estrategia2'));
  ok(frases.includes('Balance por puesto (Blanco–Negro): LI 1–1 · DC 1–1 · LD 1–1 · MI 1–1 · MC 1–1 · MD 1–1 · DEL 1–1.'), frases.join(' | '));
});

prueba('puestos/S-07a: la explicación dice que ld3 pasó a LI, su puesto secundario', () => {
  const jugadores = plantelTresLd();
  const frases = explicacion(jugadores, partidoDe(generar2(motor, jugadores), jugadores, 'estrategia2'));
  ok(frases.includes('Se usó a ld3 de LI, su puesto secundario, para emparejar los puestos.'), frases.join(' | '));
});

prueba('puestos/S-08: la explicación nombra al arquero desplazado como DEL', () => {
  const jugadores = [
    J('arqA', 'Arquero', ['DC'], { Arquero: 8, DC: 5 }), J('arqB', 'Arquero', [], { Arquero: 7 }), J('arqC', 'Arquero', [], { Arquero: 5 }),
    ...plantelNatural(DOS_DE_CADA).filter(p => p.principal !== 'Arquero').slice(0, 13),
  ];
  const frases = explicacion(jugadores, partidoDe(generar4(motor, jugadores, FORMACION_8), jugadores, 'estrategia4'));
  ok(frases.includes('arqC jugaba de arquero pero se ubicó como DEL porque cada equipo lleva un solo arquero.'), frases.join(' | '));
});

prueba('puestos/S-12: Configuración describe estrategias y reglas con los puestos, sin defensores, volantes ni delanteros', () => {
  const C = new Function(`${[...DECLARACIONES_CATALOGO, 'CANCHAS', 'ESTRATEGIAS', 'REGLAS_CATALOGO', 'REGLAS_INVARIANTES']
    .map(n => extraer(src, n)).join('\n\n')}\nreturn { ESTRATEGIAS, REGLAS_CATALOGO, REGLAS_INVARIANTES };`)();
  const textos = [];
  const juntar = o => Object.values(o).forEach(v => {
    if (typeof v === 'string') textos.push(v);
    else if (v && typeof v === 'object') juntar(v);
  });
  juntar(C);
  const viejas = textos.filter(t => /\b(defensor|defensores|volante|volantes|delantero|delanteros)\b/i.test(t));
  eq(viejas, [], 'ningún texto nombra una posición vieja');
  const formacion = C.ESTRATEGIAS.estrategia4.descripcion;
  ok(formacion.includes('Fútbol 8, 3-3-1: LI, DC, LD, MI, MC, MD y DEL'), `Formación Fija nombra los puestos de 3-3-1: ${formacion}`);
  ok(formacion.includes('Fútbol 9, 3-4-1: LI, DC, LD, MI, MC, MC, MD y DEL'), 'y los de 3-4-1');
});

prueba('puestos/NFR-006: fuera del catálogo, index.html no tiene literales de posiciones viejas ni listas de siglas', () => {
  const desde = src.indexOf('/* ================= CATÁLOGO DE PUESTOS Y LÍNEAS');
  const hasta = src.indexOf('// Orden de listado de jugadores (FR-001)');
  ok(desde > 0 && hasta > desde, 'se encuentra el bloque del catálogo');
  const fuera = src.slice(0, desde) + src.slice(hasta);
  // FORMACION_VIEJA vive en el catálogo; las siglas sueltas sólo en CANCHAS (formaciones) y en él.
  const literales = fuera.match(/'(Defensor|Volante|Delantero)'/g) || [];
  eq(literales, [], 'ningún literal de posición vieja');
  const listas = fuera.match(/\[\s*'(LI|DC|LD|MI|MC|MD|DEL)'\s*,\s*'(LI|DC|LD|MI|MC|MD|DEL)'/g) || [];
  eq(listas, [], 'ninguna lista de siglas');
});

prueba('puestos/NFR-001: cada plantel de referencia genera con Formación Fija en 50 ms o menos, en Fútbol 8 y 9', () => {
  const referencias = [F.PARTIDO_LINEAS_DESPAREJAS, F.PARTIDO_TESTIGO, F.PARTIDO_EMPATE_ENCAJE, F.PARTIDO_CANCHA9_EMPATE,
    F.plantelConDuplas({ duplas: 4, arqueros: 2 })];
  referencias.forEach((ref, i) => ['futbol8', 'futbol9'].forEach(cancha => {
    const plantel = F.aPuestos({ ...ref, cancha });
    const unidades = F.unidadesDe(plantel, motor);
    const tiempos = [];
    for (let k = 0; k < 20; k++) {
      const t0 = process.hrtime.bigint();
      motor.generarEquiposEstrategia4(unidades, [], {}, null, plantel.formacion);
      tiempos.push(Number(process.hrtime.bigint() - t0) / 1e6);
    }
    tiempos.sort((a, b) => a - b);
    const mediana = tiempos[10];
    ok(mediana <= 50, `referencia ${i + 1} en ${cancha}: ${mediana.toFixed(1)} ms`);
  }));
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ los ocho puestos se eligen, se reparten, se dibujan y se leen como fija la Spec\x1b[0m');
process.exit(0);
