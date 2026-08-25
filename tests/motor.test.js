#!/usr/bin/env node
/* Tests del motor de generación de equipos. Se corren con:  node tests/motor.test.js
 *
 * Dos bloques:
 *
 *   BASELINE  — comportamiento actual del motor. Tiene que pasar HOY. Si algo de acá se
 *               rompe, es una regresión y el runner devuelve código de salida 1.
 *
 *   PENDIENTE — comportamiento que exigen las features todavía sin
 *               implementar. Falla a propósito hasta que se implemente cada una, y no
 *               hace fallar el runner: es la lista de lo que falta. Cuando una pasa, hay
 *               que moverla al bloque BASELINE (pasa a ser comportamiento a preservar).
 */
const { cargarMotor } = require('./harness');
const F = require('./fixtures');
const { optimoConjunto, comparativa } = require('./optimo-conjunto');

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
  const motor = cargarMotor({
    puntaje: { params: { diferenciaMaxima: 0, ...(config.params || {}) } },
    // El harness no conoce los defaults del catálogo: se repite acá el de la regla de balance por
    // línea (margenTotal: 1) para que los tests corran contra la configuración real de la app.
    balanceLineas: { params: { margenTotal: 1 } },
    ...(config.reglas || {}),
  });
  let unidades = F.unidadesDe(plantel, motor);
  // El orden de las unidades es el orden de convocatoria, que en la vida real es cualquiera.
  // `rotar` permite probar la misma consigna con distintos órdenes: una garantía del motor
  // que solo se cumple para algunos órdenes no es una garantía.
  if (opciones.rotar) unidades = [...unidades.slice(opciones.rotar), ...unidades.slice(0, opciones.rotar)];
  const bloqueados = opciones.bloqueados || [];
  const prevTeamOf = opciones.prevTeamOf || {};
  const estrategia = opciones.estrategia || 3;
  const prevPos = opciones.prevPosicionAsignada || null;
  const res = estrategia === 1 ? motor.generarEquiposEstrategia1(unidades, bloqueados, prevTeamOf)
    : estrategia === 2 ? motor.generarEquiposEstrategia2(unidades, bloqueados, prevTeamOf, prevPos)
      : estrategia === 4 ? motor.generarEquiposEstrategia4(unidades, bloqueados, prevTeamOf, prevPos, plantel.formacion)
        : motor.generarEquiposEstrategia3(unidades, bloqueados, prevTeamOf, prevPos, plantel.formacion);
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
    // Diferencia de puntaje de una línea, con signo (Blanco - Negro).
    difLinea: pos => (res.balanceLineas && res.balanceLineas[pos] ? res.balanceLineas[pos].diferencia : 0),
    // Lo que minimiza la Estrategia 4: suma de cuadrados de la diferencia de cada línea de campo.
    // Un solo número que dice "cuán desparejas quedaron las líneas", castigando concentrar todo
    // el desbalance en una (que es exactamente el problema que motivó la estrategia).
    costoLineas: () => r1(motor.ORDEN_FORMACION.reduce((acc, pos) => {
      const d = res.balanceLineas[pos].diferencia;
      return acc + d * d;
    }, 0)),
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

// 014 cambió este caso: antes la dupla valía lo mismo en las 4 posiciones. Ahora el valor general
// (promedio de los promedios) sigue existiendo — lo usa la Estrategia 1 — pero viaja en
// `_valorGeneral`, y `scores` guarda el valor por posición.
test('El valor general de una dupla es el promedio de los promedios de sus integrantes', () => {
  const motor = cargarMotor();
  const [[claudio, juan], [walther, lautaro]] = F.PARTIDO_TESTIGO.duplas;
  const cj = motor.construirUnidadDupla(claudio, juan);
  const wl = motor.construirUnidadDupla(walther, lautaro);
  // Claudio promedia 5.5 (6 y 5), Juan 6 → 5.75, redondeado a 5.8
  eq(cj._valorGeneral, 5.8, 'la dupla Claudio/Juan debería valer 5.8 en general');
  eq(motor.valorGeneralDe(cj), 5.8, 'y valorGeneralDe devuelve ese mismo número');
  // Delantero no lo cubre ninguno de los dos: ahí la fórmula por posición colapsa al valor general
  eq(cj.scores.Delantero, 5.8, 'en una posición que ninguno cubre vale lo mismo que antes de 014');
  // Walther promedia 5.5, Lautaro 7 → 6.25, redondeado a 6.3
  eq(wl._valorGeneral, 6.3, 'la dupla Walther/Lautaro debería valer 6.3 en general');
});

test('La dupla Claudio/Juan no cubre Delantero (ni principal ni secundaria)', () => {
  const motor = cargarMotor();
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  const cj = motor.construirUnidadDupla(claudio, juan);
  eq(cj.principal, 'Defensor', 'la principal de la unidad es la de Claudio');
  ok(cj.secundarias.includes('Volante'), 'Volante queda como secundaria de la unidad');
  ok(!cj.secundarias.includes('Delantero'), 'Delantero NO debería ser una posición de la unidad');
});

test('Partido testigo: armado con encaje óptimo (50.5 / 51.0)', () => {
  // Antes de 011 este mismo plantel daba 51.8 / 51.3 con la dupla Claudio/Juan de Delantero,
  // una posición que no cubre ninguno de sus dos integrantes.
  // 014 bajó los dos totales, porque las dos duplas juegan de Volante y ahora valen sus notas de
  // Volante y no el promedio de sus promedios: Claudio/Juan 5.5 en vez de 5.8 (Blanco 50.8 → 50.5)
  // y Walther/Lautaro 6.0 en vez de 6.3 (Negro 51.3 → 51.0). La diferencia sigue siendo 0.5, el
  // piso matemático de este plantel con los dos equipos parejos.
  const a = armar(F.PARTIDO_TESTIGO);
  eq(r1(a.res.sumaBlanco), 50.5, 'suma del Blanco');
  eq(r1(a.res.sumaNegro), 51, 'suma del Negro');
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
  // 5.5 desde 014: la dupla juega de Volante y ahí vale las notas de Volante de sus integrantes.
  eq(valor, 5.5, 'y el valor que se muestra es el que el motor usó');
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

/* ====== El bloqueo es sobre el EQUIPO, no sobre la posición (FR-015) ====== */

/* Simula el ciclo real de la aplicación, que es donde aparecía el problema:
   generar → mover unidades a mano entre equipos (`__moverJugadorManual` cambia el equipo y NO toca
   las posiciones, así que la formación queda rota) → bloquear a TODOS → regenerar.
   El armado guardado lleva los ids REALES de cada dupla, sin su clave sintética (eso hace
   `expandirUnidadesEnResultado`), igual que lo guarda la aplicación. */
function cicloRealDeRegeneracion(plantel, opciones = {}, config = {}) {
  const primera = armar(plantel, config, opciones);
  const { motor, porJugador } = primera;
  const equipos = { blanco: [...primera.res.blanco], negro: [...primera.res.negro] };

  (opciones.moverAMano || []).forEach(([jugadorA, jugadorB]) => {
    const uA = porJugador[jugadorA], uB = porJugador[jugadorB];
    const eqA = equipos.blanco.includes(uA) ? 'blanco' : 'negro';
    const eqB = equipos.blanco.includes(uB) ? 'blanco' : 'negro';
    ok(eqA !== eqB, `${jugadorA} y ${jugadorB} ya estaban en el mismo equipo: el movimiento no prueba nada`);
    equipos[eqA][equipos[eqA].indexOf(uA)] = uB;
    equipos[eqB][equipos[eqB].indexOf(uB)] = uA;
  });

  const unidadPorId = {};
  primera.unidades.forEach(u => { if (u._duplaIds) unidadPorId[u.id] = u._duplaIds; });
  const guardado = motor.expandirUnidadesEnResultado(
    { ...primera.res, blanco: equipos.blanco, negro: equipos.negro }, unidadPorId);

  const prevTeamOf = {};
  guardado.blanco.forEach(id => { prevTeamOf[id] = 'blanco'; });
  guardado.negro.forEach(id => { prevTeamOf[id] = 'negro'; });

  // Lo que repone __generarEquipos antes de llamar a la estrategia: la clave sintética de cada
  // dupla en el mapa de equipos y en la lista de bloqueados.
  const prevTeamOfConUnidades = { ...prevTeamOf };
  const bloqueadosConUnidades = Object.keys(prevTeamOf);
  primera.unidades.forEach(u => {
    if (!u._duplaIds) return;
    prevTeamOfConUnidades[u.id] = prevTeamOf[u._duplaIds[0]];
    bloqueadosConUnidades.push(u.id);
  });

  const segunda = armar(plantel, config, {
    ...opciones,
    bloqueados: bloqueadosConUnidades,
    prevTeamOf: prevTeamOfConUnidades,
    prevPosicionAsignada: guardado.posicionAsignada,
  });
  return { primera, segunda, equiposTrasMover: equipos };
}

/* Cuánto se apartan los dos equipos de tener la misma cantidad en cada puesto de campo. Es el
   objetivo de la Estrategia 2, que no tiene una formación fija que cumplir. */
const desequilibrioDe = (a) => {
  const cuenta = { blanco: {}, negro: {} };
  ['Defensor', 'Volante', 'Delantero'].forEach(pos => { cuenta.blanco[pos] = 0; cuenta.negro[pos] = 0; });
  ['blanco', 'negro'].forEach(equipo => {
    (equipo === 'blanco' ? a.res.blanco : a.res.negro).forEach(id => {
      const pos = a.res.posicionAsignada[id];
      if (pos !== 'Arquero') cuenta[equipo][pos]++;
    });
  });
  return ['Defensor', 'Volante', 'Delantero'].reduce((t, pos) => t + Math.abs(cuenta.blanco[pos] - cuenta.negro[pos]), 0);
};

const formacionDe = (a, equipo) => {
  const cuenta = { Arquero: 0, Defensor: 0, Volante: 0, Delantero: 0 };
  (equipo === 'blanco' ? a.res.blanco : a.res.negro).forEach(id => { cuenta[a.res.posicionAsignada[id]]++; });
  return cuenta;
};

/* El caso reportado: se mueven dos jugadores a mano (queda un equipo con un defensor de más y el
   otro con un volante de más), se bloquea a todos y se regenera. Ningún jugador puede cambiar de
   equipo, pero la formación se arregla igual devolviendo gente a su puesto DENTRO de cada equipo. */
test('Con todo bloqueado y la formación rota a mano, la regeneración la arregla sin mover a nadie de equipo', () => {
  const { primera, segunda, equiposTrasMover } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, {
    estrategia: 3,
    moverAMano: [['joaquinb', 'lucas']],   // Volante (sec. Defensor) por Defensor (sec. Volante)
  });

  // El plantel tiene un solo candidato a arquero: el equipo que se queda sin arquero fijo juega con
  // un jugador de campo más (4-3-1 en vez de 3-3-1), que es la formación que le toca.
  const conArquero = formacionDe(segunda, 'blanco').Arquero === 1 ? 'blanco' : 'negro';
  const sinArquero = conArquero === 'blanco' ? 'negro' : 'blanco';
  eq(JSON.stringify(formacionDe(segunda, conArquero)), JSON.stringify({ Arquero: 1, Defensor: 3, Volante: 3, Delantero: 1 }),
    `formación del equipo con arquero fijo (${conArquero})`);
  eq(JSON.stringify(formacionDe(segunda, sinArquero)), JSON.stringify({ Arquero: 0, Defensor: 4, Volante: 3, Delantero: 1 }),
    `formación del equipo sin arquero fijo (${sinArquero})`);

  ok(segunda.res.formacion.blanco.cumplida && segunda.res.formacion.negro.cumplida,
    `la formación debería quedar cumplida en los dos equipos, quedó ${JSON.stringify(segunda.res.formacion)}`);

  // Y nadie se movió de equipo: el bloqueo se respetó, incluidos los dos que se movieron a mano.
  primera.unidades.forEach(u => {
    const esperado = equiposTrasMover.blanco.includes(u.id) ? 'blanco' : 'negro';
    const quedo = segunda.res.blanco.includes(u.id) ? 'blanco' : 'negro';
    eq(quedo, esperado, `${u.id} cambió de equipo`);
  });
});

test('Con todo bloqueado, nadie termina en una posición que no cubre', () => {
  const { segunda } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, {
    estrategia: 3,
    moverAMano: [['joaquinb', 'lucas']],
  });
  segunda.unidades.forEach(u => {
    ok(segunda.encajeDe(u.id) !== 'descubierta',
      `${u.id} quedó de ${segunda.res.posicionAsignada[u.id]}, posición que no cubre`);
  });
});

test('Con todo bloqueado y la formación ya cumplida, regenerar no cambia el armado', () => {
  const { primera, segunda } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, { estrategia: 3 });
  primera.unidades.forEach(u => {
    eq(segunda.res.posicionAsignada[u.id], primera.res.posicionAsignada[u.id], `posición de ${u.id}`);
    eq(segunda.res.blanco.includes(u.id), primera.res.blanco.includes(u.id), `equipo de ${u.id}`);
  });
});

test('La formación reportada mira a los bloqueados, no solo a los libres', () => {
  // Un plantel donde el equipo roto NO se puede arreglar: los bloqueados dejan al Blanco sin
  // volantes suficientes. Antes esto se reportaba como "cumplida" porque los faltantes se
  // acumulaban solo sobre los titulares libres.
  const { segunda } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, {
    estrategia: 3,
    moverAMano: [['joaquinb', 'joaquinl']],  // Volante flexible por un defensor puro
  });
  const roto = ['blanco', 'negro'].filter(e => !segunda.res.formacion[e].cumplida);
  eq(roto.length, 1, `debería haber exactamente un equipo fuera de formación, hay ${roto.length}`);
  ok(segunda.res.formacion[roto[0]].faltantes.length > 0, 'el equipo fuera de formación debería listar qué lugar falta');
});

/* La Estrategia 2 no tiene formación fija, pero sí un objetivo de posiciones: que los dos equipos
   queden parejos en cada puesto. Vale lo mismo — el bloqueo no debería impedirle emparejarlos. */
const CON_SECUNDARIAS = { reglas: { posiciones: { enabled: true, params: { usarSecundarias: true } } } };

test('Estrategia 2: con todo bloqueado, los puestos se emparejan igual entre los equipos', () => {
  const opciones = { estrategia: 2, moverAMano: [['joaquinb', 'alfredo']] };
  const { primera, segunda } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, opciones, CON_SECUNDARIAS);
  // El movimiento manual desbalancea los puestos; con todo bloqueado nadie puede cambiar de equipo,
  // pero el motor tiene que poder recuperar el mismo equilibrio de la generación original.
  eq(desequilibrioDe(segunda), desequilibrioDe(primera),
    'el desequilibrio por puesto debería volver al de la generación original');
});

test('Estrategia 2: el repaso de posiciones no saca a nadie de su equipo', () => {
  const opciones = { estrategia: 2, moverAMano: [['joaquinb', 'alfredo']] };
  const { primera, segunda, equiposTrasMover } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, opciones, CON_SECUNDARIAS);
  primera.unidades.forEach(u => {
    eq(segunda.res.blanco.includes(u.id) ? 'blanco' : 'negro',
      equiposTrasMover.blanco.includes(u.id) ? 'blanco' : 'negro', `${u.id} cambió de equipo`);
  });
});

test('Estrategia 2: nadie termina en una posición que no cubre', () => {
  const opciones = { estrategia: 2, moverAMano: [['joaquinb', 'alfredo']] };
  const { segunda } = cicloRealDeRegeneracion(F.PARTIDO_TESTIGO, opciones, CON_SECUNDARIAS);
  segunda.unidades.forEach(u => {
    ok(segunda.encajeDe(u.id) !== 'descubierta',
      `${u.id} quedó de ${segunda.res.posicionAsignada[u.id]}, posición que no cubre`);
  });
});

/* ============ 014 IMPLEMENTADA: comportamiento a preservar ============ */

test('014: la dupla vale el promedio de las notas de sus integrantes en esa posición', () => {
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

test('014: dupla con un solo integrante puntuado: vale lo que ese integrante', () => {
  const motor = cargarMotor();
  const conNota = F.P('a', 'Con nota', 'Volante', [], { Volante: 8 });
  const sinNada = F.P('b', 'Sin nada', 'Defensor', [], {});
  const u = motor.construirUnidadDupla(conNota, sinNada);
  eq(u.scores.Volante, 8, 'en Volante vale la nota del único puntuado');
  eq(u.scores.Defensor, 8, 'en Defensor también: no hay otro valor disponible');
});

test('014: dupla sin ningún puntaje: sigue siendo "sin puntaje"', () => {
  const motor = cargarMotor();
  const u = motor.construirUnidadDupla(
    F.P('a', 'Uno', 'Volante', [], {}),
    F.P('b', 'Otro', 'Defensor', [], {}),
  );
  eq(motor.computeAvg(u.scores), null, 'la unidad no debería tener puntaje');
});

test('014: la Estrategia 1 no cambia: sigue usando el promedio de los promedios', () => {
  const a = armar(F.PARTIDO_TESTIGO, { params: { ventajaSinArquero: 6 } }, { estrategia: 1 });
  eq(r1(a.res.sumaBlanco), 48.8, 'suma del Blanco con Estrategia 1');
  eq(r1(a.res.sumaNegro), 53.8, 'suma del Negro con Estrategia 1');
});

// FR-011: la columna de puntajes del panel muestra el número siempre que la unidad tenga valor,
// incluso en una posición que ninguno de los dos integrantes cubre (donde el número sale del
// promedio de los promedios generales). "Sin puntaje" en la columna queda solo para FR-004.
test('014: el panel muestra el número aunque ninguno cubra la posición', () => {
  const motor = cargarMotor();
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  // Delantero: ninguno de los dos tiene nota cargada ahí.
  const m = { equipos: { posicionAsignada: { [claudio.id]: 'Delantero', [juan.id]: 'Delantero' } } };
  eq(motor.valorDePuntaje([claudio, juan], m), 5.8, 'la columna debe mostrar el número, no "sin puntaje"');
});

test('014: el panel muestra "sin puntaje" solo cuando la unidad no tiene ningún valor', () => {
  const motor = cargarMotor();
  const a = F.P('a', 'Uno', 'Volante', [], {});
  const b = F.P('b', 'Otro', 'Defensor', [], {});
  const m = { equipos: { posicionAsignada: { a: 'Volante', b: 'Volante' } } };
  eq(motor.valorDePuntaje([a, b], m), null, 'sin ninguna nota cargada, la columna sí queda "sin puntaje"');
});

// FR-012 (la leyenda "sin puntaje" al lado del nombre de cada integrante sin nota en el puesto)
// vive en renderTeamPlayerRowDupla, que es HTML y no se puede extraer con este harness: se
// verifica en el navegador. Acá se prueba la condición que la dispara.
test('014: la leyenda por integrante se dispara cuando no tiene nota en el puesto', () => {
  const motor = cargarMotor();
  const [[claudio, juan]] = F.PARTIDO_TESTIGO.duplas;
  eq(motor.puntajeEnPosicion(claudio, 'Delantero'), 0, 'Claudio no tiene nota de Delantero → leyenda');
  eq(motor.puntajeEnPosicion(juan, 'Delantero'), 0, 'Juan tampoco → leyenda en los dos');
  ok(motor.puntajeEnPosicion(juan, 'Volante') > 0, 'en Volante Juan sí tiene nota → sin leyenda');
});

/* ---------- Estrategia 4: "Formación fija pareja" (balance por línea) ----------
   La estrategia arma igual que la 3 hasta las posiciones y cambia una sola cosa: cómo elige el
   reparto entre los dos equipos. Por eso los tests se dividen en dos grupos: los que verifican
   que lo NUEVO funciona (las líneas quedan parejas) y los que verifican que lo VIEJO sigue
   valiendo (formación, encaje, duplas, bloqueados, cantidad de jugadores). El segundo grupo es
   el que importa cuando algo se rompa: una estrategia que empareja líneas rompiendo la formación
   no sirve para nada. */

// Margen de 1 punto en el total, que es el default de la regla y el que tenía configurado el
// partido real. Sin margen la estrategia solo puede desempatar, no acomodar (ver test de abajo).
const CONFIG_LINEAS = { params: { diferenciaMaxima: 1 } };

test('E4: en el partido que la motivó, ninguna línea de campo queda despareja por más de 1', () => {
  const a = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  ok(Math.abs(a.difLinea('Defensor')) <= 1, `la defensa quedó despareja por ${a.difLinea('Defensor')}`);
  ok(Math.abs(a.difLinea('Volante')) <= 1, `el mediocampo quedó desparejo por ${a.difLinea('Volante')}`);
});

test('E4: sobre el mismo partido, deja las líneas más parejas que la Estrategia 3', () => {
  const e3 = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 3 });
  const e4 = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  ok(e4.costoLineas() < e3.costoLineas(),
    `la 4 no mejoró: costo de líneas 3 = ${e3.costoLineas()}, 4 = ${e4.costoLineas()}`);
});

/* El corazón del asunto. Arco y ataque tienen un solo lugar por equipo: 9 contra 6 y 8 contra 4.
   Esa diferencia existe en TODOS los armados posibles y no hay reparto que la borre — lo único
   que se puede elegir es de qué lado cae cada una. La Estrategia 3 las dejó a las dos a favor de
   Blanco (7 puntos que la defensa tuvo que devolver enteros); la 4 las cruza. */
test('E4: las líneas de un solo lugar quedan a favor de equipos distintos, para compensarse', () => {
  const a = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  const arco = a.difLinea('Arquero'), ataque = a.difLinea('Delantero');
  ok(arco !== 0 && ataque !== 0, 'el fixture tiene que tener las dos líneas desparejas');
  ok(Math.sign(arco) !== Math.sign(ataque),
    `arco (${arco}) y ataque (${ataque}) quedaron a favor del mismo equipo, en vez de compensarse`);
});

test('E4: el total no se aleja de lo buscado más que el margen configurado', () => {
  paraTodoOrden(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, a => {
    const objetivo = a.motor.objetivoDiferencia(a.res.arquerosInfo);
    const desvio = r1(Math.abs(a.res.sumaBlanco - a.res.sumaNegro - objetivo));
    ok(desvio <= 1 + 1e-9, `el desvío del total fue ${desvio}, y el margen es 1`);
  }, { estrategia: 4 });
});

/* Con margen 0 el total manda por completo y las líneas solo desempatan entre armados que ya
   empatan en el mejor total posible. Es la garantía que hace segura a la estrategia: nunca
   entrega un total peor del que se podría haber conseguido. */
test('E4: con margen 0 no empeora el total respecto de la Estrategia 3', () => {
  const sinMargen = { params: { diferenciaMaxima: 0 } };
  const e3 = armar(F.PARTIDO_LINEAS_DESPAREJAS, sinMargen, { estrategia: 3 });
  const e4 = armar(F.PARTIDO_LINEAS_DESPAREJAS, sinMargen, { estrategia: 4 });
  ok(e4.diferencia <= e3.diferencia + 1e-9,
    `con margen 0 la 4 empeoró el total: 3 = ${e3.diferencia}, 4 = ${e4.diferencia}`);
});

test('E4: el balance por línea suma exactamente el total de cada equipo', () => {
  const a = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  ['blanco', 'negro'].forEach(equipo => {
    const suma = a.motor.ORDEN_LINEAS.reduce((acc, pos) => acc + a.res.balanceLineas[pos][equipo], 0);
    const total = equipo === 'blanco' ? a.res.sumaBlanco : a.res.sumaNegro;
    eq(r1(suma), r1(total), `el balance por línea del equipo ${equipo} no suma su total`);
  });
});

// --- lo que la Estrategia 4 hereda de la 3 y no puede romper ---

test('E4: la formación se completa en los dos equipos, con cualquier orden', () => {
  [F.PARTIDO_TESTIGO, F.PARTIDO_LINEAS_DESPAREJAS].forEach(plantel => {
    paraTodoOrden(plantel, CONFIG_LINEAS, a => {
      ok(a.res.formacion.blanco.cumplida && a.res.formacion.negro.cumplida,
        `formación incompleta: blanco ${JSON.stringify(a.res.formacion.blanco.faltantes)}, negro ${JSON.stringify(a.res.formacion.negro.faltantes)}`);
    }, { estrategia: 4 });
  });
});

test('E4: nadie termina en una posición que no cubre, con cualquier orden', () => {
  [F.PARTIDO_TESTIGO, F.PARTIDO_LINEAS_DESPAREJAS].forEach(plantel => {
    paraTodoOrden(plantel, CONFIG_LINEAS, a => {
      a.unidades.forEach(u => {
        ok(a.encajeDe(u.id) !== 'descubierta', `${u.id} quedó en ${a.res.posicionAsignada[u.id]}, que no cubre`);
      });
    }, { estrategia: 4 });
  });
});

test('E4: los dos equipos quedan con la misma cantidad de unidades, con cualquier orden', () => {
  paraTodoOrden(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, a => {
    eq(a.res.blanco.length, a.res.negro.length, 'equipos con distinta cantidad de unidades');
  }, { estrategia: 4 });
});

test('E4: las duplas se reparten con las mismas reglas que la Estrategia 3', () => {
  [1, 2, 3, 4].forEach(cantidad => {
    const plantel = F.plantelConDuplas({ duplas: cantidad, arqueros: 1 });
    paraTodoOrden(plantel, CONFIG_LINEAS, a => {
      const cuenta = a.duplasPorEquipo();
      ok(Math.abs(cuenta.blanco - cuenta.negro) <= 1,
        `${cantidad} duplas repartidas ${cuenta.blanco}/${cuenta.negro}`);
      // Con cantidad impar, la que sobra va al equipo CON arquero fijo (FR-007b de 011).
      if (cantidad % 2 === 1) {
        const conArquero = a.equipoConArqueroFijo();
        if (conArquero) {
          ok(cuenta[conArquero] > cuenta[conArquero === 'blanco' ? 'negro' : 'blanco'],
            `la dupla impar no fue al equipo con arquero fijo (${conArquero})`);
        }
      }
    }, { estrategia: 4 });
  });
});

test('E4: un titular bloqueado nunca cambia de equipo', () => {
  const previo = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  const prevTeamOf = {};
  previo.res.blanco.forEach(id => { prevTeamOf[id] = 'blanco'; });
  previo.res.negro.forEach(id => { prevTeamOf[id] = 'negro'; });
  // Se bloquea medio plantel: los bloqueados se quedan y el resto se reacomoda alrededor.
  const bloqueados = [...previo.res.blanco.slice(0, 4), ...previo.res.negro.slice(0, 4)];
  const a = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, {
    estrategia: 4, bloqueados, prevTeamOf, prevPosicionAsignada: previo.res.posicionAsignada,
  });
  bloqueados.forEach(id => {
    const quedaEn = a.res.blanco.includes(id) ? 'blanco' : 'negro';
    eq(quedaEn, prevTeamOf[id], `el bloqueado ${id} cambió de equipo`);
  });
});

/* El reparto se elige enumerando: con el mismo plantel, el óptimo es el mismo aunque cambie el
   orden de convocatoria. Los empates se desempatan por el primero generado, así que los equipos
   pueden no ser idénticos entre órdenes — pero el costo de líneas y el total sí tienen que serlo,
   porque son el óptimo y el óptimo no depende del orden en que se recorren las opciones. */
test('E4: el resultado no depende del orden de convocatoria', () => {
  const referencia = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 4 });
  paraTodoOrden(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, a => {
    eq(a.costoLineas(), referencia.costoLineas(), 'el costo de líneas cambió con el orden');
    eq(a.diferencia, referencia.diferencia, 'la diferencia de puntaje cambió con el orden');
  }, { estrategia: 4 });
});

test('E4: no se probaron combinaciones de más (la enumeración nunca se trunca)', () => {
  [F.PARTIDO_TESTIGO, F.PARTIDO_LINEAS_DESPAREJAS, F.plantelConDuplas({ duplas: 0, arqueros: 2 })].forEach(plantel => {
    const a = armar(plantel, CONFIG_LINEAS, { estrategia: 4 });
    ok(!a.res.enumeracionTruncada, 'la enumeración se truncó: el armado puede no ser el óptimo');
  });
});

/* La garantía sobre la que se apoya toda la estrategia: el reparto elegido es el ÓPTIMO, no el
   mejor que encontró buscando. Se verifica por fuerza bruta y SIN usar la enumeración del motor:
   se toman las posiciones que eligió, se generan las 2^n asignaciones de unidades a equipos, se
   descartan las que rompen una restricción dura (cupo por posición y cupo de duplas, leídos del
   armado real) y se comprueba que ninguna de las que quedan sea mejor. Si el motor tuviera un
   error en la enumeración o en el costo, es acá donde aparece. */
test('E4: el reparto elegido es el óptimo (fuerza bruta independiente)', () => {
  const casos = [
    ['partido del 2026-08-24', F.PARTIDO_LINEAS_DESPAREJAS, { params: { diferenciaMaxima: 1 } }],
    ['partido del 2026-08-24, sin margen', F.PARTIDO_LINEAS_DESPAREJAS, { params: { diferenciaMaxima: 0 } }],
    ['partido testigo', F.PARTIDO_TESTIGO, { params: { diferenciaMaxima: 1 } }],
    ['partido testigo con ventaja 6', F.PARTIDO_TESTIGO, { params: { diferenciaMaxima: 1, ventajaSinArquero: 6 } }],
    ['4 duplas', F.plantelConDuplas({ duplas: 4, arqueros: 2 }), { params: { diferenciaMaxima: 1 } }],
    ['1 dupla y 1 arquero', F.plantelConDuplas({ duplas: 1, arqueros: 1 }), { params: { diferenciaMaxima: 1 } }],
    ['sin arqueros', F.plantelConDuplas({ duplas: 0, arqueros: 0 }), { params: { diferenciaMaxima: 1 } }],
  ];
  const r4 = x => Math.round(x * 10000) / 10000;
  casos.forEach(([nombre, plantel, config]) => {
    const a = armar(plantel, config, { estrategia: 4 });
    const { motor, res, unidadesPorId } = a;
    const objetivo = motor.objetivoDiferencia(res.arquerosInfo);
    const banda = motor.margenTotalPorLinea();
    const valor = id => motor.puntajeEnPosicion(unidadesPorId[id], res.posicionAsignada[id]);
    const esDupla = id => !!unidadesPorId[id]._duplaIds;

    const arqueros = { blanco: 0, negro: 0 };
    const libres = [];
    ['blanco', 'negro'].forEach(e => res[e].forEach(id => {
      if (res.posicionAsignada[id] === 'Arquero') arqueros[e] += valor(id);
      else libres.push({ id, pos: res.posicionAsignada[id], equipo: e });
    }));
    // Restricciones duras leídas del armado real, no de la lógica del motor.
    const cupo = {}, duplas = { blanco: 0, negro: 0 };
    libres.forEach(u => {
      cupo[u.pos] = cupo[u.pos] || { blanco: 0, negro: 0 };
      cupo[u.pos][u.equipo]++;
      if (esDupla(u.id)) duplas[u.equipo]++;
    });

    const costoDe = asignacion => {
      const suma = { ...arqueros };
      const lineas = {};
      libres.forEach((u, i) => {
        const e = asignacion[i];
        suma[e] += valor(u.id);
        lineas[u.pos] = lineas[u.pos] || { blanco: 0, negro: 0 };
        lineas[u.pos][e] += valor(u.id);
      });
      const desvio = Math.abs(r4(suma.blanco - suma.negro - objetivo));
      const costoLineas = motor.ORDEN_FORMACION.reduce((acc, pos) => {
        if (!lineas[pos]) return acc;
        const d = r4(lineas[pos].blanco - lineas[pos].negro);
        return acc + d * d;
      }, 0);
      return [Math.max(0, r4(desvio - banda)), r4(costoLineas), desvio];
    };

    const costoMotor = costoDe(libres.map(u => u.equipo));
    const n = libres.length;
    ok(n <= 20, `el caso "${nombre}" tiene ${n} unidades libres: 2^n no es razonable`);
    let mejor = null, validos = 0;
    for (let mask = 0; mask < (1 << n); mask++) {
      const asignacion = [];
      for (let i = 0; i < n; i++) asignacion.push((mask >> i) & 1 ? 'blanco' : 'negro');
      const c = {}, d = { blanco: 0, negro: 0 };
      libres.forEach((u, i) => {
        c[u.pos] = c[u.pos] || { blanco: 0, negro: 0 };
        c[u.pos][asignacion[i]]++;
        if (esDupla(u.id)) d[asignacion[i]]++;
      });
      const respeta = motor.ORDEN_FORMACION.every(pos => !cupo[pos]
        || (c[pos].blanco === cupo[pos].blanco && c[pos].negro === cupo[pos].negro));
      if (!respeta || d.blanco !== duplas.blanco || d.negro !== duplas.negro) continue;
      validos++;
      const costo = costoDe(asignacion);
      if (mejor === null || motor.mejorCostoLex(costo, mejor)) mejor = costo;
    }
    ok(validos > 1, `el caso "${nombre}" solo tenía ${validos} reparto válido: no prueba nada`);
    ok(!motor.mejorCostoLex(mejor, costoMotor),
      `en "${nombre}" había un reparto mejor: motor ${JSON.stringify(costoMotor)}, óptimo ${JSON.stringify(mejor)}`);
  });
});

/* La verificación del óptimo del espacio conjunto vive en su propio módulo porque la comparte la
   herramienta de medición (tools/medir-motor.js). Ver optimo-conjunto.js para qué enumera y por qué. */

test('E4: el armado es el óptimo del espacio conjunto (posiciones × reparto)', () => {
  const casos = [
    ['partido del 2026-08-24', F.PARTIDO_LINEAS_DESPAREJAS, { params: { diferenciaMaxima: 1 } }],
    ['partido del 2026-08-24, sin margen', F.PARTIDO_LINEAS_DESPAREJAS, { params: { diferenciaMaxima: 0 } }],
    ['partido testigo', F.PARTIDO_TESTIGO, { params: { diferenciaMaxima: 1 } }],
    ['4 duplas', F.plantelConDuplas({ duplas: 4, arqueros: 2 }), { params: { diferenciaMaxima: 1 } }],
    ['empate de encaje', F.PARTIDO_EMPATE_ENCAJE, { params: { diferenciaMaxima: 1 } }],
    ['cancha de 9 con empate', F.PARTIDO_CANCHA9_EMPATE, { params: { diferenciaMaxima: 1 } }],
  ];
  casos.forEach(([nombre, plantel, config]) => {
    const a = armar(plantel, config, { estrategia: 4 });
    const v = { ...optimoConjunto(a), res: a.res };
    eq(v.encajeMotor, v.encajeOptimo, `en "${nombre}" el motor no alcanzó el mejor encaje posible`);
    ok(!a.motor.mejorCostoLex(v.mejorCosto, v.costoMotor),
      `en "${nombre}" hay un armado mejor con el MISMO encaje (${v.cantParticiones} particiones empatadas, ${v.repartos} repartos):\n` +
      `      motor  = ${JSON.stringify(v.costoMotor)}\n` +
      `      óptimo = ${JSON.stringify(v.mejorCosto)}\n` +
      `        unidad     motor                óptimo\n${comparativa(v)}`);
  });
});

/* Sin estos casos el test de arriba no probaría el desempate: si cada plantel tiene una sola
   partición óptima de encaje, no hay empate que desaprovechar y pasaría igual estando roto. */
test('E4: los fixtures del desempate tienen varias particiones empatadas en encaje', () => {
  [['cancha de 8', F.PARTIDO_EMPATE_ENCAJE], ['cancha de 9', F.PARTIDO_CANCHA9_EMPATE]].forEach(([nombre, plantel]) => {
    const v = optimoConjunto(armar(plantel, { params: { diferenciaMaxima: 1 } }, { estrategia: 4 }));
    ok(v.cantParticiones > 1,
      `el fixture de ${nombre} quedó con ${v.cantParticiones} partición(es) óptima(s): ya no ejercita el desempate`);
  });
});

/* La formación 3-4-1 no estaba cubierta por ningún test: todos los demás planteles son de cancha
   de 8. Lo que cambia no es solo el tamaño — el mediocampo pasa a 4 lugares por equipo y la
   enumeración del reparto crece de 800 combinaciones a 2.800. */
test('E4: en cancha de 9 se cumple la formación 3-4-1 y nadie queda en un puesto que no cubre', () => {
  paraTodoOrden(F.PARTIDO_CANCHA9_EMPATE, { params: { diferenciaMaxima: 1 } }, a => {
    ok(a.res.formacion.blanco.cumplida && a.res.formacion.negro.cumplida,
      `formación incompleta: blanco ${JSON.stringify(a.res.formacion.blanco.faltantes)}, negro ${JSON.stringify(a.res.formacion.negro.faltantes)}`);
    eq(a.res.blanco.length, a.res.negro.length, 'equipos con distinta cantidad de unidades');
    a.unidades.forEach(u => {
      ok(a.encajeDe(u.id) !== 'descubierta', `${u.id} quedó en ${a.res.posicionAsignada[u.id]}, que no cubre`);
    });
    ok(!a.res.enumeracionTruncada, 'la enumeración se truncó: el armado puede no ser el óptimo');
  }, { estrategia: 4 });
});

/* Regresión concreta del desempate en cancha de 9 (FR-028). El motor anterior al arreglo dejaba el
   ataque desparejo por 5 en este plantel (suma de cuadrados 28.25); el óptimo del espacio conjunto
   es 0.25. Si el desempate se rompiera, este número se dispara y el test lo dice en puntos, que es
   más legible que un "no era el óptimo". */
test('E4: en cancha de 9 el desempate deja las líneas parejas (regresión, antes 28.25)', () => {
  const a = armar(F.PARTIDO_CANCHA9_EMPATE, { params: { diferenciaMaxima: 1 } }, { estrategia: 4 });
  // Sin `a.costoLineas()`, que redondea a un decimal y convierte el 0.25 de este plantel en 0.3.
  const costo = a.motor.ORDEN_FORMACION.reduce((acc, pos) => {
    const d = a.res.balanceLineas[pos].diferencia;
    return acc + d * d;
  }, 0);
  ok(costo <= 0.25 + 1e-9,
    `el costo de líneas fue ${costo} y el óptimo de este plantel es 0.25 ` +
    `(el motor previo al arreglo daba 28.25)`);
});

/* El caso que la verificación de arriba no cubría: con titulares BLOQUEADOS el armado arranca
   parcialmente fijo, así que la enumeración del reparto no lo decide todo y el refinamiento final
   (FR-027) tiene trabajo. Era la zona de la que no había garantía medida — de hecho el refinamiento
   existe justamente por ella. Se verifica que ahí también se llega al óptimo, sobre el mismo espacio
   conjunto pero restringido a los repartos que no mueven de equipo a ningún bloqueado.

   El bloqueo fija el EQUIPO y no la posición ("Bloquear en este equipo"), así que el espacio
   enumerado deja libre el puesto de los bloqueados, igual que hace el motor. */
test('E4: con titulares bloqueados el armado sigue siendo el óptimo del espacio conjunto', () => {
  const config = { params: { diferenciaMaxima: 1 } };
  [['cancha de 8', F.PARTIDO_EMPATE_ENCAJE], ['cancha de 9', F.PARTIDO_CANCHA9_EMPATE]].forEach(([cancha, plantel]) => {
    [2, 4].forEach(porEquipo => {
      const etiqueta = `${cancha}, ${porEquipo * 2} bloqueados`;
      const previo = armar(plantel, config, { estrategia: 4 });
      const prevTeamOf = {};
      previo.res.blanco.forEach(id => { prevTeamOf[id] = 'blanco'; });
      previo.res.negro.forEach(id => { prevTeamOf[id] = 'negro'; });
      const bloqueados = [...previo.res.blanco.slice(0, porEquipo), ...previo.res.negro.slice(0, porEquipo)];
      const a = armar(plantel, config, {
        estrategia: 4, bloqueados, prevTeamOf, prevPosicionAsignada: previo.res.posicionAsignada,
      });
      bloqueados.forEach(id => {
        const quedaEn = a.res.blanco.includes(id) ? 'blanco' : 'negro';
        eq(quedaEn, prevTeamOf[id], `en "${etiqueta}" el bloqueado ${id} cambió de equipo`);
      });
      const pin = {};
      bloqueados.forEach(id => {
        if (a.res.posicionAsignada[id] !== 'Arquero') pin[id] = prevTeamOf[id];
      });
      const v = { ...optimoConjunto(a, pin), res: a.res };
      eq(v.encajeMotor, v.encajeOptimo, `en "${etiqueta}" el motor no alcanzó el mejor encaje posible`);
      ok(!a.motor.mejorCostoLex(v.mejorCosto, v.costoMotor),
        `en "${etiqueta}" hay un armado mejor con el MISMO encaje (${v.cantParticiones} particiones, ${v.repartos} repartos):\n` +
        `      motor  = ${JSON.stringify(v.costoMotor)}\n` +
        `      óptimo = ${JSON.stringify(v.mejorCosto)}\n` +
        `        unidad     motor                óptimo\n${comparativa(v)}`);
    });
  });
});

test('E4: la Estrategia 3 sigue devolviendo el balance por línea, sin optimizarlo', () => {
  const a = armar(F.PARTIDO_LINEAS_DESPAREJAS, CONFIG_LINEAS, { estrategia: 3 });
  ok(a.res.balanceLineas && typeof a.res.balanceLineas.Defensor.diferencia === 'number',
    'la Estrategia 3 tiene que informar las líneas para poder compararla con la 4');
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
