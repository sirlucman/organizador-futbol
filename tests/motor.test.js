#!/usr/bin/env node
/* Tests del motor de generación de equipos. Se corren con:  node tests/motor.test.js
 *
 * Dos bloques:
 *
 *   BASELINE  — comportamiento actual del motor. Tiene que pasar HOY. Si algo de acá se
 *               rompe, es una regresión y el runner devuelve código de salida 1.
 *
 *   PENDIENTE — comportamiento que exige la feature 014, todavía sin
 *               implementar. Falla a propósito hasta que se implemente cada una, y no
 *               hace fallar el runner: es la lista de lo que falta. Cuando una pasa, hay
 *               que moverla al bloque BASELINE (pasa a ser comportamiento a preservar).
 */
const { cargarMotor } = require('./harness');
const F = require('./fixtures');

/* ---------- helpers de aserción ---------- */
class FalloAssert extends Error {}
const fallar = msg => { throw new FalloAssert(msg); };
const ok = (cond, msg) => { if (!cond) fallar(msg); };
const eq = (actual, esperado, msg) => {
  if (actual !== esperado) fallar(`${msg}\n      esperado: ${JSON.stringify(esperado)}\n      obtenido: ${JSON.stringify(actual)}`);
};
const r1 = x => Math.round(x * 10) / 10;

/* ---------- helpers de dominio ---------- */
function armar(plantel, config = {}, opciones = {}) {
  const motor = cargarMotor({ puntaje: { params: { diferenciaMaxima: 0, ...(config.params || {}) } }, ...(config.reglas || {}) });
  let unidades = F.unidadesDe(plantel, motor);
  // El orden de las unidades es el orden de convocatoria, que en la vida real es cualquiera.
  // `rotar` permite probar la misma consigna con distintos órdenes: una garantía del motor
  // que solo se cumple para algunos órdenes no es una garantía.
  if (opciones.rotar) unidades = [...unidades.slice(opciones.rotar), ...unidades.slice(0, opciones.rotar)];
  const bloqueados = opciones.bloqueados || [];
  const prevTeamOf = opciones.prevTeamOf || {};
  const estrategia = opciones.estrategia || 3;
  const res = estrategia === 1 ? motor.generarEquiposEstrategia1(unidades, bloqueados, prevTeamOf)
    : estrategia === 2 ? motor.generarEquiposEstrategia2(unidades, bloqueados, prevTeamOf, null)
      : motor.generarEquiposEstrategia3(unidades, bloqueados, prevTeamOf, null, plantel.formacion);
  const porJugador = F.jugadoresPorUnidad(plantel, motor);
  const unidadesPorId = {};
  unidades.forEach(u => { unidadesPorId[u.id] = u; });
  return {
    motor, unidades, unidadesPorId, res, porJugador,
    diferencia: r1(Math.abs(res.sumaBlanco - res.sumaNegro)),
    equipoDe: jugadorId => (res.blanco.includes(porJugador[jugadorId]) ? 'blanco' : 'negro'),
    posicionDe: jugadorId => res.posicionAsignada[porJugador[jugadorId]],
    // Nivel de encaje de una unidad en la posición que le tocó: 'principal' | 'secundaria' | 'descubierta'
    encajeDe: unidadId => {
      const u = unidadesPorId[unidadId];
      const pos = res.posicionAsignada[unidadId];
      if (pos === 'Arquero') return u.principal === 'Arquero' ? 'principal' : 'secundaria';
      if (u.principal === pos) return 'principal';
      return (u.secundarias || []).includes(pos) ? 'secundaria' : 'descubierta';
    },
    // Qué equipo quedó con arquero fijo cuando solo uno lo tiene, o null si los dos lo
    // tienen o ninguno. Se lee de arquerosInfo porque es lo único que devuelven las tres
    // estrategias por igual (la Estrategia 1 no devuelve posicionAsignada).
    equipoConArqueroFijo: () => {
      if (!res.arquerosInfo.compensado) return null;
      return res.arquerosInfo.equipoCompensado === 'blanco' ? 'negro' : 'blanco';
    },
    duplasPorEquipo: () => {
      const cuenta = { blanco: 0, negro: 0 };
      unidades.filter(u => u._duplaIds).forEach(u => {
        cuenta[res.blanco.includes(u.id) ? 'blanco' : 'negro']++;
      });
      return cuenta;
    },
  };
}

/* Corre la misma comprobación con todos los órdenes de convocatoria posibles (rotaciones de
   la lista de unidades) y falla nombrando el primer orden en el que no se cumple. */
function paraTodoOrden(plantel, config, comprobar, opciones = {}) {
  const total = plantel.individuales.length + plantel.duplas.length;
  for (let rotar = 0; rotar < total; rotar++) {
    const a = armar(plantel, config, { ...opciones, rotar });
    try { comprobar(a); }
    catch (e) {
      if (e instanceof FalloAssert) {
        const est = opciones.estrategia ? `Estrategia ${opciones.estrategia}, ` : '';
        fallar(`${est}orden de convocatoria rotado en ${rotar}: ${e.message}`);
      }
      throw e;
    }
  }
}

const TESTS = [];
const test = (nombre, fn) => TESTS.push({ nombre, feature: null, fn });
const pendiente = (feature, nombre, fn) => TESTS.push({ nombre, feature, fn });

/* ======================= BASELINE ======================= */

test('El valor de una dupla es el promedio de los promedios, igual en las 4 posiciones', () => {
  const motor = cargarMotor();
  const [[claudio, juan], [walther, lautaro]] = F.PARTIDO_TESTIGO.duplas;
  const cj = motor.construirUnidadDupla(claudio, juan);
  const wl = motor.construirUnidadDupla(walther, lautaro);
  // Claudio promedia 5.5 (6 y 5), Juan 6 → 5.75, redondeado a 5.8
  eq(cj.scores.Delantero, 5.8, 'la dupla Claudio/Juan debería valer 5.8');
  eq(cj.scores.Volante, 5.8, 'la dupla vale lo mismo en Volante que en Delantero');
  eq(cj.scores.Arquero, 5.8, 'la dupla vale lo mismo en Arquero');
  // Walther promedia 5.5, Lautaro 7 → 6.25, redondeado a 6.3
  eq(wl.scores.Volante, 6.3, 'la dupla Walther/Lautaro debería valer 6.3');
});

test('La dupla Claudio/Juan no cubre Delantero (ni principal ni secundaria)', () => {
  const motor = cargarMotor();
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  const cj = motor.construirUnidadDupla(claudio, juan);
  eq(cj.principal, 'Defensor', 'la principal de la unidad es la de Claudio');
  ok(cj.secundarias.includes('Volante'), 'Volante queda como secundaria de la unidad');
  ok(!cj.secundarias.includes('Delantero'), 'Delantero NO debería ser una posición de la unidad');
});

test('Partido testigo: armado con encaje óptimo (50.8 / 51.3)', () => {
  // Antes de 011 este mismo plantel daba 51.8 / 51.3 con la dupla Claudio/Juan de Delantero,
  // una posición que no cubre ninguno de sus dos integrantes. La diferencia sigue siendo 0.5,
  // que es el piso matemático de este plantel con los dos equipos parejos.
  const a = armar(F.PARTIDO_TESTIGO);
  eq(r1(a.res.sumaBlanco), 50.8, 'suma del Blanco');
  eq(r1(a.res.sumaNegro), 51.3, 'suma del Negro');
  eq(a.diferencia, 0.5, 'diferencia de puntaje');
});

test('Partido testigo: hay un solo arquero y entra por posición secundaria', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  eq(a.res.arquerosInfo.compensado, true, 'debería marcar que hay un solo arquero');
  eq(a.res.arquerosPorSecundaria.length, 1, 'el arquero entra por secundaria');
  eq(a.posicionDe('nilo'), 'Arquero', 'Nilo ocupa el arco');
  eq(a.equipoConArqueroFijo(), 'blanco', 'el arquero queda en el Blanco y el Negro rota');
});

test('Partido testigo: los dos equipos quedan con la misma cantidad de unidades', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  eq(a.res.blanco.length, 8, 'unidades en el Blanco');
  eq(a.res.negro.length, 8, 'unidades en el Negro');
});

test('La Estrategia 2 sí respeta la compensación por arquero (no tiene refinamiento final)', () => {
  // Se pasa la ventaja explícita para que el test siga valiendo después de 009, donde el
  // valor pasa a ser configurable: antes de 009 el parámetro se ignora y da 6 igual.
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 6 } }, { estrategia: 2 });
  const favorNegro = r1(a.res.sumaNegro - a.res.sumaBlanco);
  ok(favorNegro > 4, `el Negro (sin arquero fijo) termina arriba con Estrategia 2: ${favorNegro}`);
});

test('Estrategia 1 sobre el partido testigo: armado de referencia', () => {
  // Antes de 013 daba 49.3 / 53.3. Cambió porque las duplas se ubican primero para que su cupo
  // por equipo se pueda respetar, y eso corre el orden del reparto. Los partidos sin duplas se
  // arman exactamente igual que antes.
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 6 } }, { estrategia: 1 });
  eq(r1(a.res.sumaBlanco), 48.8, 'suma del Blanco con Estrategia 1');
  eq(r1(a.res.sumaNegro), 53.8, 'suma del Negro con Estrategia 1');
  eq(a.duplasPorEquipo().blanco, 1, 'una dupla en cada equipo');
});

test('012: el puntaje visible de cada unidad suma exactamente el total del equipo', () => {
  // El criterio de la feature: sumando a mano los números que se ven tiene que dar el total que
  // muestra el panel. Antes no daba — en este mismo partido se veían 46 y el total decía 51.8,
  // porque de la dupla se mostraban las notas individuales y no el valor que el motor sumó.
  const a = armar(F.PARTIDO_TESTIGO);
  // `m` como lo ve el panel: posiciones asignadas por id de jugador real, no de unidad.
  const posPorJugador = {};
  a.unidades.forEach(u => {
    (u._duplaIds || [u.id]).forEach(id => { posPorJugador[id] = a.res.posicionAsignada[u.id]; });
  });
  const m = { equipos: { posicionAsignada: posPorJugador } };
  const grupoDe = u => (u._duplaMiembros ? u._duplaMiembros : [u]);
  [['blanco', a.res.sumaBlanco], ['negro', a.res.sumaNegro]].forEach(([equipo, total]) => {
    const visible = a.unidades
      .filter(u => a.res[equipo].includes(u.id))
      .reduce((suma, u) => suma + (a.motor.valorDePuntaje(grupoDe(u), m) || 0), 0);
    eq(r1(visible), r1(total), `la suma de los puntajes visibles del ${equipo} debe dar su total`);
  });
});

test('012: una dupla con puntaje no cuenta como jugadores sin puntaje', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  const posPorJugador = {};
  a.unidades.forEach(u => {
    (u._duplaIds || [u.id]).forEach(id => { posPorJugador[id] = a.res.posicionAsignada[u.id]; });
  });
  const m = { equipos: { posicionAsignada: posPorJugador } };
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  const valor = a.motor.valorDePuntaje([claudio, juan], m);
  ok(valor !== null, 'la dupla Claudio/Juan tiene puntaje: no debe contarse como "sin puntaje"');
  eq(valor, 5.8, 'y el valor que se muestra es el que el motor usó');
});

/* ======================= 009 y 010 IMPLEMENTADAS: comportamiento a preservar ==== */

test('Con la ventaja en 0 no se compensa al equipo sin arquero fijo', () => {
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 0 } });
  eq(a.res.arquerosInfo.compensacion, 0, 'con la ventaja en 0 no debería haber ninguna compensación');
});

test('La ventaja es la configurada, no el puntaje del arquero', () => {
  // Mismo plantel pero con un arquero de 9: la ventaja debe seguir siendo la configurada.
  const plantel = JSON.parse(JSON.stringify(F.PARTIDO_TESTIGO));
  plantel.individuales.find(p => p.id === 'nilo').scores.Arquero = 9;
  const a = armar(plantel, { params: { ventajaSinArquero: 6 } });
  eq(a.res.arquerosInfo.compensacion, 6, 'la ventaja debería venir de la configuración, no del puntaje del arquero');
});

test('Sin equipo sin arquero fijo, la ventaja configurada no se aplica', () => {
  // Dos arqueros naturales: los dos equipos tienen arquero fijo.
  const plantel = F.plantelConDuplas({ duplas: 2, arqueros: 2 });
  const a = armar(plantel, { params: { ventajaSinArquero: 6 } });
  eq(a.res.arquerosInfo.compensacion, 0, 'con arquero fijo en los dos equipos no hay nada que compensar');
});



test('La ventaja configurada sobrevive al refinamiento final', () => {
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 6 } });
  const favorNegro = r1(a.res.sumaNegro - a.res.sumaBlanco);
  ok(favorNegro > 4, `el Negro (sin arquero fijo) debería terminar ~6 puntos arriba, quedó ${favorNegro}`);
});

test('Con la ventaja en 0 el armado no cambia respecto del actual (no regresión)', () => {
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 0 } });
  eq(a.diferencia, 0.5, 'con objetivo cero, la diferencia debería seguir siendo la mínima alcanzable');
});

/* ======= 011 IMPLEMENTADA: comportamiento a preservar (era el bloque PENDIENTE) ======= */

test('Partido testigo: la formación se completa en los dos equipos, con cualquier orden', () => {
  paraTodoOrden(F.PARTIDO_TESTIGO, {}, a => {
    eq(a.res.formacion.blanco.cumplida, true, 'el Blanco debería completar la formación 3-3-1');
    eq(a.res.formacion.negro.cumplida, true, 'el Negro también');
  });
});

test('Partido testigo: nadie queda en una posición que no cubre', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  const descubiertas = a.unidades
    .map(u => u.id)
    .filter(id => a.encajeDe(id) === 'descubierta');
  eq(descubiertas.length, 0, `no debería haber lugares descubiertos, hay: ${descubiertas.join(', ')}`);
});

test('Partido testigo: Leandro Benítez va de Delantero y la dupla de Volante', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  eq(a.posicionDe('leandrob'), 'Delantero', 'Leandro Benítez tiene Delantero como secundaria');
  eq(a.posicionDe('claudio'), 'Volante', 'la dupla Claudio/Juan cubre Volante con sus dos integrantes');
  // No se afirma que los dos queden en el mismo equipo: eso era un artefacto del armado anterior.
  // La asignación de posiciones no depende del equipo, y con la ventaja por arquero en 0 (el
  // default desde 009) el reparto entre equipos da distinto aunque las posiciones sean las mismas.
});

test('Partido testigo: arreglar la formación no empeora el balance', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  ok(a.diferencia <= 0.5, `la diferencia no debería ser peor que 0.5 (el piso del plantel), quedó ${a.diferencia}`);
});

test('Partido testigo: los integrantes de las duplas quedan donde tienen puntaje cargado', () => {
  const a = armar(F.PARTIDO_TESTIGO);
  const sinPuntaje = [];
  F.PARTIDO_TESTIGO.duplas.flat().forEach(p => {
    const pos = a.posicionDe(p.id);
    const v = p.scores[pos];
    if (v === undefined || v === null || v === '') sinPuntaje.push(`${p.nombre} en ${pos}`);
  });
  eq(sinPuntaje.length, 0, `nadie de una dupla debería quedar sin puntaje en su posición: ${sinPuntaje.join(', ')}`);
});

test('Duplas par (2): una por equipo, con cualquier orden de convocatoria', () => {
  paraTodoOrden(F.plantelConDuplas({ duplas: 2, arqueros: 1 }), {}, a => {
    const c = a.duplasPorEquipo();
    eq(c.blanco, 1, 'duplas en el Blanco');
    eq(c.negro, 1, 'duplas en el Negro');
  });
});

test('Duplas par (4): dos y dos, con cualquier orden de convocatoria', () => {
  paraTodoOrden(F.plantelConDuplas({ duplas: 4, arqueros: 1 }), {}, a => {
    const c = a.duplasPorEquipo();
    eq(c.blanco, 2, 'duplas en el Blanco');
    eq(c.negro, 2, 'duplas en el Negro');
  });
});

test('Duplas impar (1): la dupla va al equipo CON arquero fijo, con cualquier orden', () => {
  paraTodoOrden(F.plantelConDuplas({ duplas: 1, arqueros: 1 }), {}, a => {
    const conArquero = a.equipoConArqueroFijo();
    ok(conArquero !== null, 'el plantel debería dejar a un solo equipo con arquero fijo');
    const c = a.duplasPorEquipo();
    eq(c[conArquero], 1, `la única dupla debería quedar en el equipo con arquero fijo (${conArquero})`);
    eq(c[conArquero === 'blanco' ? 'negro' : 'blanco'], 0, 'el equipo que rota el arco no debería recibir dupla');
  });
});

test('Duplas impar (3): dos al equipo con arquero fijo y una al que rota, con cualquier orden', () => {
  paraTodoOrden(F.plantelConDuplas({ duplas: 3, arqueros: 1 }), {}, a => {
    const conArquero = a.equipoConArqueroFijo();
    ok(conArquero !== null, 'el plantel debería dejar a un solo equipo con arquero fijo');
    const c = a.duplasPorEquipo();
    eq(c[conArquero], 2, `el equipo con arquero fijo (${conArquero}) debería recibir dos duplas`);
    eq(c[conArquero === 'blanco' ? 'negro' : 'blanco'], 1, 'el que rota el arco, una');
  });
});

test('Duplas impar con arquero en los dos equipos: sin criterio de desempate, pero nunca todas juntas', () => {
  paraTodoOrden(F.plantelConDuplas({ duplas: 3, arqueros: 2 }), {}, a => {
    const c = a.duplasPorEquipo();
    ok((c.blanco === 2 && c.negro === 1) || (c.blanco === 1 && c.negro === 2),
      `con 3 duplas y arquero en los dos equipos debería quedar 2-1, quedó ${c.blanco}-${c.negro}`);
  });
});

/* ======================= 013 IMPLEMENTADA: comportamiento a preservar ==== */

[1, 2].forEach(estrategia => {
  test(`Estrategia ${estrategia}: 2 duplas → una por equipo, con cualquier orden`, () => {
    paraTodoOrden(F.plantelConDuplas({ duplas: 2, arqueros: 1 }), {}, a => {
      const c = a.duplasPorEquipo();
      eq(c.blanco, 1, 'duplas en el Blanco');
      eq(c.negro, 1, 'duplas en el Negro');
    }, { estrategia });
  });

  test(`Estrategia ${estrategia}: 1 dupla → al equipo CON arquero fijo, con cualquier orden`, () => {
    paraTodoOrden(F.plantelConDuplas({ duplas: 1, arqueros: 1 }), {}, a => {
      const conArquero = a.equipoConArqueroFijo();
      ok(conArquero !== null, 'el plantel debería dejar a un solo equipo con arquero fijo');
      const c = a.duplasPorEquipo();
      eq(c[conArquero], 1, `la dupla debería quedar en el equipo con arquero fijo (${conArquero})`);
    }, { estrategia });
  });

  test(`Estrategia ${estrategia}: 3 duplas → dos al equipo con arquero fijo`, () => {
    paraTodoOrden(F.plantelConDuplas({ duplas: 3, arqueros: 1 }), {}, a => {
      const conArquero = a.equipoConArqueroFijo();
      ok(conArquero !== null, 'el plantel debería dejar a un solo equipo con arquero fijo');
      const c = a.duplasPorEquipo();
      eq(c[conArquero], 2, `el equipo con arquero fijo (${conArquero}) debería recibir dos`);
      eq(c[conArquero === 'blanco' ? 'negro' : 'blanco'], 1, 'el otro, una');
    }, { estrategia });
  });
});

/* ======================= PENDIENTE 014 ======================= */

pendiente('014', 'La dupla vale el promedio de las notas de sus integrantes en esa posición', () => {
  const motor = cargarMotor();
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  const cj = motor.construirUnidadDupla(claudio, juan);
  // Volante: los dos tienen nota (Claudio 5, Juan 6) → 5.5
  eq(cj.scores.Volante, 5.5, 'valor de la dupla en Volante');
  // Defensor: solo Claudio tiene nota (6); Juan entra con su promedio general (6) → 6.0
  eq(cj.scores.Defensor, 6, 'valor de la dupla en Defensor');
  // Delantero: ninguno tiene nota → promedio de promedios generales, el valor de siempre
  eq(cj.scores.Delantero, 5.8, 'valor de la dupla en Delantero (caso degenerado, igual que hoy)');
});

pendiente('014', 'Dupla con un solo integrante puntuado: vale lo que ese integrante', () => {
  const motor = cargarMotor();
  const conNota = F.P('a', 'Con nota', 'Volante', [], { Volante: 8 });
  const sinNada = F.P('b', 'Sin nada', 'Defensor', [], {});
  const u = motor.construirUnidadDupla(conNota, sinNada);
  eq(u.scores.Volante, 8, 'en Volante vale la nota del único puntuado');
  eq(u.scores.Defensor, 8, 'en Defensor también: no hay otro valor disponible');
});

pendiente('014', 'Dupla sin ningún puntaje: sigue siendo "sin puntaje"', () => {
  const motor = cargarMotor();
  const u = motor.construirUnidadDupla(
    F.P('a', 'Uno', 'Volante', [], {}),
    F.P('b', 'Otro', 'Defensor', [], {}),
  );
  eq(motor.computeAvg(u.scores), null, 'la unidad no debería tener puntaje');
});

pendiente('014', 'La Estrategia 1 no cambia: sigue usando el promedio de los promedios', () => {
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 6 } }, { estrategia: 1 });
  eq(r1(a.res.sumaBlanco), 48.8, 'suma del Blanco con Estrategia 1');
  eq(r1(a.res.sumaNegro), 53.8, 'suma del Negro con Estrategia 1');
});

/* ======================= runner ======================= */
const resultados = TESTS.map(t => {
  try { t.fn(); return { ...t, paso: true }; }
  catch (e) {
    if (e instanceof FalloAssert) return { ...t, paso: false, motivo: e.message };
    return { ...t, paso: false, motivo: `error inesperado: ${e.stack}` };
  }
});

const baseline = resultados.filter(r => !r.feature);
const pendientes = resultados.filter(r => r.feature);

console.log('\n\x1b[1mBASELINE\x1b[0m — comportamiento actual, tiene que pasar hoy');
baseline.forEach(r => {
  console.log(`  ${r.paso ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${r.nombre}`);
  if (!r.paso) console.log(`      ${r.motivo.replace(/\n/g, '\n      ')}`);
});

console.log('\n\x1b[1mPENDIENTE\x1b[0m — lo que exigen las features todavía sin implementar');
['014'].forEach(f => {
  const delFeature = pendientes.filter(r => r.feature === f);
  if (!delFeature.length) return;
  console.log(`  \x1b[1m${f}\x1b[0m`);
  delFeature.forEach(r => {
    console.log(`    ${r.paso ? '\x1b[32m✓ ya cumple\x1b[0m' : '\x1b[33m○ falta\x1b[0m'} ${r.nombre}`);
    if (!r.paso) console.log(`        ${r.motivo.split('\n')[0]}`);
  });
});

const fallosBaseline = baseline.filter(r => !r.paso).length;
const listos = pendientes.filter(r => r.paso).length;
console.log(`\nBaseline: ${baseline.length - fallosBaseline}/${baseline.length} · ` +
  `Pendientes cumplidos: ${listos}/${pendientes.length}`);
if (listos > 0) console.log('Los pendientes marcados "ya cumple" hay que moverlos al bloque BASELINE.');
if (fallosBaseline > 0) console.log('\x1b[31mHay regresiones en el comportamiento actual.\x1b[0m');
process.exit(fallosBaseline > 0 ? 1 : 0);
