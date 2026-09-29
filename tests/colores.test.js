#!/usr/bin/env node
/* Tests de "Intercambiar colores". Se corren con:
 *
 *     node tests/colores.test.js
 *
 * Cubren la parte que NO necesita un navegador: qué campos invierte `invertirColoresDelPartido`,
 * cuáles deja quietos, que dos intercambios dejen el partido idéntico, y que una regeneración
 * posterior respete a los bloqueados en su color nuevo. Lo que se ve en pantalla —el botón, el
 * orden del encabezado, la pestaña visible, lo que se guarda— vive en tests/layout.test.js.
 *
 * Las propiedades corren sobre partidos armados por el motor real, recortado con `cargarMotor`,
 * con cada estrategia vigente (Spec AC-02): una garantía que sólo se cumple sobre un partido
 * inventado no es una garantía.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas, con guion y con el
 * prefijo de la feature ("colores/S-01b"): es la convención de binding de AGENTS.md, y los gates
 * del Implementation Plan (T-2.D8, T-2.D9) lo buscan con grep.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { extraer, cargarMotor } = require('./harness');
const F = require('./fixtures');

const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

const DECLARACIONES = ['intercambiarClaves', 'invertirColoresDelPartido'];
const C = new Function(`${DECLARACIONES.map(n => extraer(src, n)).join('\n\n')}\nreturn { ${DECLARACIONES.join(', ')} };`)();

/* ---------- helpers de aserción (mismos que cancha.test.js) ---------- */
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

/* ---------- partidos armados por el motor real ---------- */
const ESTRATEGIAS_VIGENTES = [1, 2, 4];             // la 3 se retiró (ESTRATEGIAS_RETIRADAS)
const PLANTELES = {
  testigo: F.PARTIDO_TESTIGO,
  'lineas-desparejas': F.PARTIDO_LINEAS_DESPAREJAS,
  'empate-encaje': F.PARTIDO_EMPATE_ENCAJE,
  'cancha9-empate': F.PARTIDO_CANCHA9_EMPATE,
  'con-duplas': F.plantelConDuplas({ duplas: 2, arqueros: 1 }),
};
const motor = cargarMotor({
  puntaje: { params: { diferenciaMaxima: 0 } },
  balanceLineas: { params: { margenTotal: 1 } },
});

function generar(plantel, estrategia, { bloqueados = [], prevTeamOf = {}, prevPos = null } = {}) {
  const unidades = F.unidadesDe(plantel, motor);
  return estrategia === 1 ? motor.generarEquiposEstrategia1(unidades, bloqueados, prevTeamOf)
    : estrategia === 2 ? motor.generarEquiposEstrategia2(unidades, bloqueados, prevTeamOf, prevPos)
      : motor.generarEquiposEstrategia4(unidades, bloqueados, prevTeamOf, prevPos, plantel.formacion);
}

/* Un partido con la forma que deja `__generarEquipos` (index.html), a partir del resultado de
   una estrategia. Se copian también los campos que el intercambio NO debe tocar, para que el
   diff de NFR-004 los vea. */
function partidoDesde(res, extra = {}) {
  return copia({
    id: 'm-test', estado: 'Equipos generados', convocados: [...res.blanco, ...res.negro],
    bloqueados: extra.bloqueados || [],
    equipos: {
      estrategiaKey: 'estrategia4', estrategia: 'Formación fija pareja',
      blanco: res.blanco, negro: res.negro,
      titularesSnapshot: [...res.blanco, ...res.negro], duplasSnapshot: [], configHash: 'h',
      sumaBlanco: res.sumaBlanco, sumaNegro: res.sumaNegro,
      cambios: 3, esPrimeraGeneracion: false,
      posicionAsignada: res.posicionAsignada || null,
      posicionOverride: res.posicionOverride || null,
      swaps: res.swaps || [],
      arquerosInfo: res.arquerosInfo || null,
      arquerosExcedentes: res.arquerosExcedentes || [],
      arquerosPorSecundaria: res.arquerosPorSecundaria || [],
      formacion: res.formacion || null,
      balanceLineas: res.balanceLineas || null,
      enumeracionTruncada: !!res.enumeracionTruncada,
    },
  });
}

const casos = [];
for (const [nombre, plantel] of Object.entries(PLANTELES)) {
  for (const e of ESTRATEGIAS_VIGENTES) casos.push({ nombre: `${nombre}/estrategia${e}`, plantel, m: partidoDesde(generar(plantel, e)) });
}

/* Un partido sintético con todos los campos por color llenos y valores fáciles de leer. */
function partidoSintetico() {
  return {
    id: 'm-sint', estado: 'Equipos generados', bloqueados: ['b1'],
    equipos: {
      blanco: ['b1', 'b2', 'b3'], negro: ['n1', 'n2'],
      sumaBlanco: 20.5, sumaNegro: 14,
      cambios: 2, esPrimeraGeneracion: false,
      posicionAsignada: { b1: 'Arquero', b2: 'Defensor', b3: 'Volante', n1: 'Defensor', n2: 'Delantero' },
      swaps: [{ playerId: 'b3', desde: 'Defensor', hacia: 'Volante' }],
      arquerosInfo: { total: 1, compensado: true, equipoCompensado: 'negro', compensacion: 3 },
      formacion: {
        objetivo: { defensores: 1, volantes: 1, delanteros: 1 },
        blanco: { cumplida: false, faltantes: ['Delantero'] },
        negro: { cumplida: false, faltantes: ['Volante'] },
      },
      balanceLineas: {
        Arquero: { blanco: 6, negro: 0, diferencia: 6 },
        Defensor: { blanco: 7, negro: 7, diferencia: 0 },
        Volante: { blanco: 7.5, negro: 0, diferencia: 7.5 },
        Delantero: { blanco: 0, negro: 7, diferencia: -7 },
      },
    },
  };
}

console.log('\nInvertir los colores de un partido');

prueba('colores/S-01: las listas, las sumas, el balance y la formación quedan invertidos', () => {
  const m = partidoSintetico();
  const antes = copia(m);
  C.invertirColoresDelPartido(m);
  const e = m.equipos;
  eq(e.blanco, antes.equipos.negro, 'el Blanco tiene que ser el grupo que era el Negro, en el mismo orden (FR-010, FR-011)');
  eq(e.negro, antes.equipos.blanco, 'el Negro tiene que ser el grupo que era el Blanco, en el mismo orden (FR-010, FR-011)');
  eq([e.sumaBlanco, e.sumaNegro], [14, 20.5], 'las sumas se invierten (FR-012)');
  eq(e.balanceLineas.Arquero, { blanco: 0, negro: 6, diferencia: -6 }, 'cada línea se invierte y su diferencia cambia de signo (FR-013, TD-03)');
  eq(e.balanceLineas.Delantero, { blanco: 7, negro: 0, diferencia: 7 }, 'una diferencia negativa pasa a positiva (TD-03)');
  ok(Object.is(e.balanceLineas.Defensor.diferencia, 0), 'una diferencia 0 sigue siendo 0 y no -0 (TD-03)');
  eq(e.formacion.blanco, antes.equipos.formacion.negro, 'la formación del Blanco es la que era del Negro (FR-014)');
  eq(e.formacion.objetivo, antes.equipos.formacion.objetivo, 'el objetivo de formación no cambia (TD-04)');
});

prueba('colores/S-01a: en todo partido generado, los compañeros siguen siendo compañeros', () => {
  for (const { nombre, m } of casos) {
    const antes = copia(m.equipos);
    C.invertirColoresDelPartido(m);
    eq(new Set(m.equipos.blanco).size, antes.negro.length, `${nombre}: el Blanco nuevo tiene que tener exactamente al grupo del Negro viejo`);
    eq(m.equipos.blanco, antes.negro, `${nombre}: el grupo del Negro pasa entero al Blanco (FR-011b)`);
    eq(m.equipos.negro, antes.blanco, `${nombre}: el grupo del Blanco pasa entero al Negro (FR-011b)`);
    C.invertirColoresDelPartido(m);                    // deja el caso como estaba para S-01b
  }
  ok(casos.length === ESTRATEGIAS_VIGENTES.length * Object.keys(PLANTELES).length, 'se tienen que haber generado todos los casos');
});

prueba('colores/S-01b: en todo partido generado, intercambiar dos veces deja el partido idéntico', () => {
  for (const { nombre, m } of casos) {
    const original = copia(m);
    C.invertirColoresDelPartido(m);
    ok(JSON.stringify(m) !== JSON.stringify(original), `${nombre}: un intercambio tiene que cambiar algo`);
    C.invertirColoresDelPartido(m);
    assert.deepStrictEqual(m, original, `${nombre}: dos intercambios tienen que dejar el partido idéntico (FR-018)`);
  }
});

prueba('colores/S-01c: con titulares impares, el grupo con uno más pasa a ser el Negro', () => {
  const plantel = { ...F.PARTIDO_TESTIGO, individuales: F.PARTIDO_TESTIGO.individuales.slice(0, -1) };
  for (const e of ESTRATEGIAS_VIGENTES) {
    const m = partidoDesde(generar(plantel, e));
    const [b, n] = [m.equipos.blanco.length, m.equipos.negro.length];
    ok(b !== n, `estrategia${e}: el plantel impar tiene que dejar equipos de distinto tamaño`);
    C.invertirColoresDelPartido(m);
    eq([m.equipos.blanco.length, m.equipos.negro.length], [n, b], `estrategia${e}: los tamaños se invierten con los grupos`);
  }
});

prueba('colores/S-01d: con un solo arquero, el equipo compensado pasa al otro color y sigue siendo el que no tiene arquero', () => {
  const m = partidoSintetico();
  C.invertirColoresDelPartido(m);
  eq(m.equipos.arquerosInfo.equipoCompensado, 'blanco', 'equipoCompensado cambia de color (FR-015)');
  const conArquero = ['blanco', 'negro'].filter(k => m.equipos[k].some(id => m.equipos.posicionAsignada[id] === 'Arquero'));
  eq(conArquero, ['negro'], 'el equipo con arquero es el otro, así que la frase "quedó sin arquero fijo" nombra al correcto (FR-032)');
  eq(m.equipos.arquerosInfo.compensacion, 3, 'el resto de arquerosInfo no cambia (FR-017)');

  const sinCompensar = partidoSintetico();
  sinCompensar.equipos.arquerosInfo = { total: 2, compensado: false, equipoCompensado: null, compensacion: 0 };
  C.invertirColoresDelPartido(sinCompensar);
  eq(sinCompensar.equipos.arquerosInfo.equipoCompensado, null, 'sin equipo compensado, sigue sin haberlo (TD-04)');
});

prueba('colores/S-01e: los dos integrantes de una dupla siguen en el mismo equipo', () => {
  const plantel = PLANTELES['con-duplas'];
  const porJugador = F.jugadoresPorUnidad(plantel, motor);
  for (const { nombre, m } of casos.filter(c => c.plantel === plantel)) {
    C.invertirColoresDelPartido(m);
    for (const [a, b] of plantel.duplas) {
      const equipoDe = id => (m.equipos.blanco.includes(porJugador[id]) ? 'blanco' : 'negro');
      eq(equipoDe(a.id), equipoDe(b.id), `${nombre}: ${a.id} y ${b.id} tienen que seguir juntos (FR-011b)`);
    }
    C.invertirColoresDelPartido(m);
  }
});

prueba('colores/S-01f: una generación sin balance por línea ni formación se invierte sin fallar', () => {
  const m = partidoSintetico();
  m.equipos.balanceLineas = null;
  m.equipos.formacion = null;
  C.invertirColoresDelPartido(m);
  eq([m.equipos.balanceLineas, m.equipos.formacion], [null, null], 'los campos vacíos siguen vacíos (FR-013, FR-014)');

  const viejo = { equipos: { blanco: ['a'], negro: ['b'] } };
  C.invertirColoresDelPartido(viejo);
  eq(Object.keys(viejo.equipos).sort(), ['blanco', 'negro'], 'un partido viejo sin sumas no gana claves nuevas (NFR-004)');
});

prueba('colores/S-01g: los bloqueados siguen bloqueados, ahora en el otro color', () => {
  const m = partidoSintetico();
  C.invertirColoresDelPartido(m);
  eq(m.bloqueados, ['b1'], 'la lista de bloqueados no cambia (FR-016)');
  ok(m.equipos.negro.includes('b1'), 'el bloqueado quedó en el Negro, que es el color nuevo de su grupo');
});

prueba('colores/NFR-004: sólo cambian los siete campos por color, sin claves nuevas', () => {
  const CAMPOS = ['blanco', 'negro', 'sumaBlanco', 'sumaNegro', 'balanceLineas', 'formacion', 'arquerosInfo'];
  for (const { nombre, m } of [...casos, { nombre: 'sintético', m: partidoSintetico() }]) {
    const antes = copia(m);
    C.invertirColoresDelPartido(m);
    eq(Object.keys(m).sort(), Object.keys(antes).sort(), `${nombre}: el partido no gana ni pierde claves (TC-012)`);
    eq(Object.keys(m.equipos).sort(), Object.keys(antes.equipos).sort(), `${nombre}: m.equipos no gana ni pierde claves (TC-012)`);
    const fuera = Object.keys(m).filter(k => k !== 'equipos' && JSON.stringify(m[k]) !== JSON.stringify(antes[k]));
    eq(fuera, [], `${nombre}: fuera de m.equipos no cambia nada (FR-016)`);
    const cambiados = Object.keys(m.equipos).filter(k => JSON.stringify(m.equipos[k]) !== JSON.stringify(antes.equipos[k]));
    const ajenos = cambiados.filter(k => !CAMPOS.includes(k));
    eq(ajenos, [], `${nombre}: sólo pueden cambiar los campos de NFR-004 (FR-017)`);
    C.invertirColoresDelPartido(m);
  }
});

console.log('\nRegenerar después de intercambiar');

/* `__generarEquipos` arma `prevTeamOf` leyendo las listas del partido (index.html) y le pasa los
   bloqueados a la estrategia. Acá se hace lo mismo, a mano, sobre el partido ya invertido. */
function prevTeamOfDe(m) {
  const out = {};
  m.equipos.blanco.forEach(id => { out[id] = 'blanco'; });
  m.equipos.negro.forEach(id => { out[id] = 'negro'; });
  return out;
}

prueba('colores/S-06: un bloqueado sigue en el color que le quedó después del intercambio', () => {
  for (const e of ESTRATEGIAS_VIGENTES) {
    const plantel = F.PARTIDO_TESTIGO;
    const m = partidoDesde(generar(plantel, e));
    const bloqueado = m.equipos.blanco.find(id => m.equipos.posicionAsignada == null || m.equipos.posicionAsignada[id] !== 'Arquero');
    C.invertirColoresDelPartido(m);
    ok(m.equipos.negro.includes(bloqueado), `estrategia${e}: el bloqueado tiene que haber pasado al Negro`);
    const res = generar(plantel, e, { bloqueados: [bloqueado], prevTeamOf: prevTeamOfDe(m), prevPos: m.equipos.posicionAsignada });
    ok(res.negro.includes(bloqueado), `estrategia${e}: al regenerar, ${bloqueado} tiene que seguir en el Negro (FR-050)`);
  }
});

prueba('colores/S-06a: sin bloqueados, regenerar después de intercambiar arma dos equipos completos', () => {
  for (const e of ESTRATEGIAS_VIGENTES) {
    const plantel = F.PARTIDO_TESTIGO;
    const m = partidoDesde(generar(plantel, e));
    const todos = [...m.equipos.blanco, ...m.equipos.negro].sort();
    C.invertirColoresDelPartido(m);
    const res = generar(plantel, e, { prevTeamOf: prevTeamOfDe(m), prevPos: m.equipos.posicionAsignada });
    eq([...res.blanco, ...res.negro].sort(), todos, `estrategia${e}: todos los titulares tienen que quedar en algún equipo`);
    ok(Math.abs(res.blanco.length - res.negro.length) <= 1, `estrategia${e}: los equipos tienen que quedar parejos en cantidad`);
  }
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ el intercambio de colores invierte lo que tiene que invertir y nada más\x1b[0m');
process.exit(0);
