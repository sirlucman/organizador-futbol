#!/usr/bin/env node
/* Herramienta de medición del motor de generación de equipos.
 *
 * Los tests responden "¿el motor cumple?" sobre un puñado de planteles elegidos. Esto responde
 * otras dos preguntas que un test no puede: "¿CUÁNTO cuesta un problema?" y "¿el motor de hace N
 * commits se comportaba distinto?". Las dos hicieron falta para decidir el arreglo del desempate de
 * encaje (FR-028): sin medirlo primero, la limitación parecía teórica y no había con qué justificar
 * el cambio; medida, resultó que en planteles con empate el motor se quedaba corto en cerca de la
 * mitad de los casos.
 *
 * Usa el mismo verificador del óptimo que los tests (tests/optimo-conjunto.js) a propósito: si cada
 * uno tuviera su definición de "óptimo", una podría pasar mientras la otra falla.
 *
 * Uso:
 *   node tools/medir-motor.js verificar                    los planteles del repo, con y sin bloqueados
 *   node tools/medir-motor.js buscar [opciones]            busca planteles donde el motor no sea óptimo
 *   node tools/medir-motor.js comparar <commit> [opciones] el motor actual contra el de ese commit
 *   node tools/medir-motor.js volcar <semilla> [opciones]  imprime un plantel como código de fixture
 *   node tools/medir-motor.js perf [opciones]              cuánto tarda una generación
 *
 * Opciones (las que aplican a cada subcomando):
 *   --cancha=8|9     tamaño de cancha de los planteles generados (default 8)
 *   --n=300          cuántos planteles generar
 *   --semilla=1      primera semilla (el generador es determinista: misma semilla, mismo plantel)
 *   --mezcla=0.7     proporción de titulares con posición secundaria cargada. Es la palanca que
 *                    controla cuántos empates de encaje hay, o sea cuán duro es el caso.
 *   --bloqueados=0   cuántos titulares bloquear POR EQUIPO (0 = ninguno)
 *   --margen=1       `diferenciaMaxima` de la generación
 *   --tope=20000     tope de escenarios empatados que el verificador enumera
 *   --detalle        imprime el armado del motor contra el óptimo, unidad por unidad
 *
 * Ejemplos:
 *   node tools/medir-motor.js buscar --cancha=9 --mezcla=0.6 --n=400
 *   node tools/medir-motor.js comparar 1e1ee47 --cancha=9 --n=400 --mezcla=0.6
 *   node tools/medir-motor.js verificar --bloqueados=4
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const { cargarMotor } = require(path.join(RAIZ, 'tests/harness'));
const F = require(path.join(RAIZ, 'tests/fixtures'));
const { optimoConjunto, comparativa } = require(path.join(RAIZ, 'tests/optimo-conjunto'));

/* ---------------- opciones ---------------- */
const argv = process.argv.slice(2);
const comando = argv.find(a => !a.startsWith('--')) || 'ayuda';
const posicionales = argv.filter(a => !a.startsWith('--')).slice(1);
const opt = (nombre, def) => {
  const a = argv.find(x => x.startsWith(`--${nombre}=`));
  if (a) return a.slice(nombre.length + 3);
  return argv.includes(`--${nombre}`) ? true : def;
};
const num = (nombre, def) => Number(opt(nombre, def));
const O = {
  cancha: num('cancha', 8),
  n: num('n', 300),
  semilla: num('semilla', 1),
  mezcla: num('mezcla', 0.7),
  bloqueados: num('bloqueados', 0),
  margen: num('margen', 1),
  tope: num('tope', 20000),
  detalle: !!opt('detalle', false),
};

/* ---------------- planteles generados ---------------- */
const CAMPO = ['Defensor', 'Volante', 'Delantero'];

// LCG sembrado en vez de Math.random: cada hallazgo se puede reproducir con su semilla, que es lo
// único que hace útil a una búsqueda aleatoria (un contraejemplo que no se puede volver a generar
// no sirve para escribir un fixture).
function rng(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* Un plantel al azar del tamaño pedido, con 2 arqueros naturales (así no hay compensación de arco
   ni remanente) y el resto de campo.

   Los principales se sortean SIN respetar la formación a propósito. Los empates de encaje —lo que
   se quiere estresar— aparecen justamente cuando sobran titulares de una posición y hay que elegir
   CUÁLES se corren a su secundaria. Un plantel con los principales calzados a la formación tiene una
   sola asignación óptima y no ejercita nada. */
function plantelAlAzar(semilla, { cancha, mezcla }) {
  const rand = rng(semilla);
  const nota = () => Math.round((3 + rand() * 6) * 2) / 2; // 3 a 9 en pasos de 0.5
  const deCampo = cancha === 9 ? 16 : 14;
  const formacion = cancha === 9
    ? { defensores: 3, volantes: 4, delanteros: 1 }
    : { defensores: 3, volantes: 3, delanteros: 1 };
  const individuales = [
    F.P('arq0', 'Arquero 0', 'Arquero', [], { Arquero: nota() }),
    F.P('arq1', 'Arquero 1', 'Arquero', [], { Arquero: nota() }),
  ];
  // Distribución sesgada, como un plantel real: muchos defensores y volantes, pocos delanteros.
  const sortear = () => { const x = rand(); return x < 0.42 ? 'Defensor' : x < 0.85 ? 'Volante' : 'Delantero'; };
  for (let i = 0; i < deCampo; i++) {
    const principal = sortear();
    const otras = CAMPO.filter(p => p !== principal);
    const secundarias = rand() < mezcla ? [otras[Math.floor(rand() * otras.length)]] : [];
    const scores = { [principal]: nota() };
    secundarias.forEach(p => { scores[p] = nota(); });
    individuales.push(F.P(`j${i}`, `Jugador ${i}`, principal, secundarias, scores));
  }
  return { cancha: cancha === 9 ? 'futbol9' : 'futbol8', formacion, individuales, duplas: [] };
}

/* ---------------- generación ---------------- */
function construirMotor(indexPath) {
  return cargarMotor(
    { puntaje: { params: { diferenciaMaxima: O.margen } }, balanceLineas: { params: { margenTotal: 1 } } },
    indexPath ? { index: indexPath, omitirFaltantes: true } : {}
  );
}

/* Genera con Estrategia 4 y devuelve lo que el verificador necesita. Con `bloqueados > 0` genera
   dos veces: la primera para tener de dónde sacar el equipo anterior de cada uno, y la segunda con
   esa cantidad de titulares bloqueados por equipo. */
function generar(motor, plantel, bloquearPorEquipo) {
  const unidades = F.unidadesDe(plantel, motor);
  const unidadesPorId = {};
  unidades.forEach(u => { unidadesPorId[u.id] = u; });
  const primera = motor.generarEquiposEstrategia4(unidades, [], {}, null, plantel.formacion);
  if (!bloquearPorEquipo) return { motor, res: primera, unidadesPorId, pin: {} };

  const prevTeamOf = {};
  primera.blanco.forEach(id => { prevTeamOf[id] = 'blanco'; });
  primera.negro.forEach(id => { prevTeamOf[id] = 'negro'; });
  const bloqueados = [
    ...primera.blanco.slice(0, bloquearPorEquipo),
    ...primera.negro.slice(0, bloquearPorEquipo),
  ];
  const res = motor.generarEquiposEstrategia4(unidades, bloqueados, prevTeamOf, primera.posicionAsignada, plantel.formacion);
  // El bloqueo fija el EQUIPO y no la posición, así que el espacio a comparar deja libre el puesto.
  const pin = {};
  bloqueados.forEach(id => { if (res.posicionAsignada[id] !== 'Arquero') pin[id] = prevTeamOf[id]; });
  const seMovieron = bloqueados.filter(id => (res.blanco.includes(id) ? 'blanco' : 'negro') !== prevTeamOf[id]);
  return { motor, res, unidadesPorId, pin, seMovieron };
}

// Un análisis completo: genera, y compara contra el óptimo del espacio conjunto.
function analizar(motor, plantel) {
  const g = generar(motor, plantel, O.bloqueados);
  const v = optimoConjunto(g, g.pin, O.tope);
  if (!v.mejorCosto) return null; // ningún armado válido (cupo de duplas imposible)
  return { ...v, res: g.res, seMovieron: g.seMovieron || [], hayMejor: motor.mejorCostoLex(v.mejorCosto, v.costoMotor) };
}

// La suma de cuadrados es difícil de leer: se traduce a la diferencia de UNA línea equivalente, que
// es la unidad en la que el problema se ve en el resumen de la aplicación.
const enPuntos = costo => Math.sqrt(costo);
const pct = (arr, p) => arr.length ? arr[Math.min(arr.length - 1, Math.floor(p * arr.length))] : 0;

/* ---------------- subcomando: verificar ---------------- */
function verificar() {
  const motor = construirMotor();
  const casos = [
    ['partido del 2026-08-24', F.PARTIDO_LINEAS_DESPAREJAS],
    ['partido testigo', F.PARTIDO_TESTIGO],
    ['empate de encaje (cancha de 8)', F.PARTIDO_EMPATE_ENCAJE],
    ['empate de encaje (cancha de 9)', F.PARTIDO_CANCHA9_EMPATE],
    ['4 duplas', F.plantelConDuplas({ duplas: 4, arqueros: 2 })],
    ['1 dupla y 1 arquero', F.plantelConDuplas({ duplas: 1, arqueros: 1 })],
  ];
  console.log(`planteles del repositorio · margen ${O.margen} · ${O.bloqueados ? O.bloqueados * 2 + ' bloqueados' : 'sin bloqueados'}\n`);
  let fallos = 0;
  casos.forEach(([nombre, plantel]) => {
    const r = analizar(motor, plantel);
    if (!r) { console.log(`  · ${nombre}: sin armados válidos`); return; }
    if (r.hayMejor) fallos++;
    console.log(`  ${r.hayMejor ? '✗' : '✓'} ${nombre}`);
    console.log(`      encaje ${r.encajeMotor} (mínimo del espacio ${r.encajeOptimo}) · ${r.cantParticiones} escenarios empatados · ${r.repartos} repartos`);
    console.log(`      costo motor  ${JSON.stringify(r.costoMotor)}`);
    console.log(`      costo óptimo ${JSON.stringify(r.mejorCosto)}`);
    if (r.seMovieron.length) console.log(`      ✗ FR-015 violado: ${r.seMovieron.join(', ')} cambiaron de equipo`);
    if (r.cantParticiones <= 1) console.log('      (un solo escenario óptimo: este plantel no ejercita el desempate)');
    if (r.hayMejor && O.detalle) console.log(comparativa(r));
  });
  console.log(`\n${fallos === 0 ? 'Todos óptimos.' : `${fallos} plantel(es) NO óptimos.`}`);
  return fallos;
}

/* ---------------- subcomando: buscar ---------------- */
function buscar() {
  const motor = construirMotor();
  let analizados = 0, saltados = 0, conEmpate = 0, violaciones = 0, encajePeor = 0, truncados = 0;
  const perdidas = [];
  const hallazgos = [];
  let maxEscenarios = 0;
  const t0 = Date.now();

  for (let k = 0; k < O.n; k++) {
    const semilla = O.semilla + k;
    const plantel = plantelAlAzar(semilla, O);
    let r;
    try { r = analizar(motor, plantel); } catch (e) { saltados++; continue; }
    if (!r) { saltados++; continue; }
    // Un plantel que no puede cubrir la formación no dice nada del reparto.
    if (r.encajeMotor >= motor.COSTO_DESCUBIERTA) { saltados++; continue; }
    analizados++;
    if (r.cantParticiones > 1) conEmpate++;
    if (r.seMovieron.length) violaciones++;
    if (r.encajeMotor !== r.encajeOptimo) encajePeor++;
    maxEscenarios = Math.max(maxEscenarios, r.cantParticiones);
    if (r.truncada) truncados++;
    if (r.hayMejor) {
      perdidas.push(enPuntos(r.costoMotor[2]) - enPuntos(r.mejorCosto[2]));
      hallazgos.push({ semilla, r });
    }
  }

  console.log(`cancha ${O.cancha} · mezcla ${O.mezcla} · ${O.bloqueados ? O.bloqueados * 2 + ' bloqueados' : 'sin bloqueados'} · semillas ${O.semilla}..${O.semilla + O.n - 1}`);
  console.log(`  analizados ${analizados} · saltados ${saltados} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  con empate de encaje (>1 escenario): ${conEmpate}/${analizados} · máximo ${maxEscenarios} escenarios`);
  if (truncados) console.log(`  ! en ${truncados} se alcanzó el tope de ${O.tope} escenarios: ahí la comparación es parcial, no prueba optimalidad`);
  if (violaciones) console.log(`  ✗ FR-015 violado en ${violaciones}`);
  if (encajePeor) console.log(`  ✗ encaje por debajo del mínimo en ${encajePeor}`);
  console.log(`  armados NO óptimos: ${hallazgos.length}` +
    (analizados ? ` (${(100 * hallazgos.length / analizados).toFixed(0)}% del total, ` +
      `${conEmpate ? (100 * hallazgos.length / conEmpate).toFixed(0) : 0}% de los que tienen empate)` : ''));
  if (perdidas.length) {
    perdidas.sort((a, b) => a - b);
    console.log(`  pérdida equivalente en puntos de una línea: mediana ${pct(perdidas, 0.5).toFixed(1)} · ` +
      `p90 ${pct(perdidas, 0.9).toFixed(1)} · máximo ${perdidas[perdidas.length - 1].toFixed(1)}`);
    console.log('\n  primeros hallazgos (reproducibles con --semilla=N --n=1):');
    hallazgos.slice(0, 8).forEach(({ semilla, r }) => {
      console.log(`    semilla ${semilla}: ${r.cantParticiones} escenarios · costo de líneas ${r.costoMotor[2]} -> óptimo ${r.mejorCosto[2]}`);
      if (O.detalle) console.log(comparativa(r));
    });
  }
  return hallazgos.length;
}

/* ---------------- subcomando: comparar ---------------- */
/* Vuelca el index.html de un commit a un archivo temporal y corre la misma búsqueda con los dos
   motores sobre los mismos planteles. Es lo que permite afirmar "esto era un problema y ya no", y
   lo que se usó para elegir los fixtures de regresión: un fixture donde el motor viejo ya acertaba
   no protege de nada. */
function comparar() {
  const ref = posicionales[0];
  if (!ref) { console.error('Falta el commit. Ejemplo: node tools/medir-motor.js comparar 1e1ee47'); return 1; }
  let src;
  try {
    src = execFileSync('git', ['show', `${ref}:index.html`], { cwd: RAIZ, maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    console.error(`No pude leer index.html de "${ref}". ¿Existe ese commit?`);
    return 1;
  }
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'medir-motor-')), 'index.html');
  fs.writeFileSync(tmp, src);

  const actual = construirMotor();
  const previo = construirMotor(tmp);
  let n = 0, fallaActual = 0, fallaPrevio = 0;
  const candidatos = [];

  for (let k = 0; k < O.n; k++) {
    const semilla = O.semilla + k;
    const plantel = plantelAlAzar(semilla, O);
    let ra, rp;
    try { ra = analizar(actual, plantel); rp = analizar(previo, plantel); } catch (e) { continue; }
    if (!ra || !rp) continue;
    if (ra.encajeMotor >= actual.COSTO_DESCUBIERTA) continue;
    n++;
    if (ra.hayMejor) fallaActual++;
    if (rp.hayMejor) fallaPrevio++;
    // Los planteles interesantes son los que MEJORARON: sirven como fixture de regresión.
    if (rp.hayMejor && !ra.hayMejor) {
      candidatos.push({ semilla, escenarios: ra.cantParticiones, previo: rp.costoMotor[2], actual: ra.costoMotor[2], optimo: ra.mejorCosto[2] });
    }
  }

  console.log(`cancha ${O.cancha} · mezcla ${O.mezcla} · ${n} planteles · actual vs ${ref}\n`);
  console.log(`  armados NO óptimos con el motor de ${ref}: ${fallaPrevio}` + (n ? ` (${(100 * fallaPrevio / n).toFixed(0)}%)` : ''));
  console.log(`  armados NO óptimos con el motor actual:   ${fallaActual}` + (n ? ` (${(100 * fallaActual / n).toFixed(0)}%)` : ''));
  if (candidatos.length) {
    candidatos.sort((a, b) => (b.previo - b.actual) - (a.previo - a.actual));
    console.log('\n  mejores candidatos a fixture de regresión (el previo fallaba, el actual acierta):');
    candidatos.slice(0, 8).forEach(c => console.log(
      `    semilla ${c.semilla}: ${c.escenarios} escenarios · costo de líneas ${c.previo} -> ${c.actual} (óptimo ${c.optimo})`));
    console.log('\n  para volcar uno como fixture: node tools/medir-motor.js buscar --semilla=N --n=1 --detalle');
  }
  fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
  return 0;
}

/* ---------------- subcomando: volcar ---------------- */
/* Imprime un plantel generado como código listo para pegar en tests/fixtures.js. Es el último paso
   del ciclo: `comparar` da una semilla interesante, `volcar` la convierte en fixture. Sin esto, pasar
   de un hallazgo a un test es transcribir 18 líneas de puntajes a mano. */
function volcar() {
  const semilla = Number(posicionales[0]);
  if (!Number.isFinite(semilla)) {
    console.error('Falta la semilla. Ejemplo: node tools/medir-motor.js volcar 147 --cancha=9');
    return 1;
  }
  const plantel = plantelAlAzar(semilla, O);
  const motor = construirMotor();
  const r = analizar(motor, plantel);
  const f = plantel.formacion;
  console.log(`// Generado con: node tools/medir-motor.js volcar ${semilla} --cancha=${O.cancha} --mezcla=${O.mezcla}`);
  if (r) {
    console.log(`// ${r.cantParticiones} escenarios empatados en encaje ${r.encajeMotor} · ` +
      `costo de líneas ${r.costoMotor[2]} (óptimo del espacio ${r.mejorCosto[2]})`);
  }
  console.log(`const PARTIDO_X = {`);
  console.log(`  cancha: '${plantel.cancha}',`);
  console.log(`  formacion: { defensores: ${f.defensores}, volantes: ${f.volantes}, delanteros: ${f.delanteros} },`);
  console.log(`  individuales: [`);
  plantel.individuales.forEach(j => {
    const sec = `[${j.secundarias.map(x => `'${x}'`).join(', ')}]`;
    const sc = `{ ${Object.entries(j.scores).map(([k, v]) => `${k}: ${v}`).join(', ')} }`;
    console.log(`    P('${j.id}', '${j.nombre}', '${j.principal}', ${sec}, ${sc}),`);
  });
  console.log(`  ],\n  duplas: [],\n};`);
  return 0;
}

/* ---------------- subcomando: perf ---------------- */
function perf() {
  const motor = construirMotor();
  console.log(`tiempo por generación con Estrategia 4 · margen ${O.margen}\n`);
  const casos = [
    ['partido del 2026-08-24', F.PARTIDO_LINEAS_DESPAREJAS],
    ['partido testigo', F.PARTIDO_TESTIGO],
    ['empate de encaje (cancha de 8)', F.PARTIDO_EMPATE_ENCAJE],
    ['empate de encaje (cancha de 9)', F.PARTIDO_CANCHA9_EMPATE],
    ['4 duplas', F.plantelConDuplas({ duplas: 4, arqueros: 2 })],
  ];
  const medir = (plantel, vueltas) => {
    const unidades = F.unidadesDe(plantel, motor);
    const t0 = process.hrtime.bigint();
    for (let i = 0; i < vueltas; i++) motor.generarEquiposEstrategia4(unidades, [], {}, null, plantel.formacion);
    return Number(process.hrtime.bigint() - t0) / 1e6 / vueltas;
  };
  casos.forEach(([nombre, plantel]) => {
    console.log(`  ${nombre.padEnd(34)} ${medir(plantel, 200).toFixed(1)} ms`);
  });
  // El peor caso no está en los fixtures: es un plantel donde casi todos tienen secundaria, que es
  // lo que maximiza la cantidad de escenarios empatados y por lo tanto el trabajo del reparto.
  let peor = { ms: 0, semilla: null, escenarios: 0, truncada: false };
  for (let s = 1; s <= 300; s++) {
    const plantel = plantelAlAzar(s, { cancha: O.cancha, mezcla: 0.95 });
    const unidades = F.unidadesDe(plantel, motor);
    const res = motor.generarEquiposEstrategia4(unidades, [], {}, null, plantel.formacion);
    const ms = medir(plantel, 10);
    if (ms > peor.ms) peor = { ms, semilla: s, truncada: !!res.enumeracionTruncada };
  }
  console.log(`\n  peor caso de 300 planteles con mezcla 0.95 (cancha ${O.cancha}):`);
  console.log(`    semilla ${peor.semilla} · ${peor.ms.toFixed(1)} ms${peor.truncada ? ' · ENUMERACIÓN TRUNCADA' : ''}`);
  console.log(`    topes del motor: ${motor.MAX_ASIGNACIONES_ENCAJE} escenarios, ${motor.MAX_REPARTOS_EVALUADOS} repartos en total`);
  return 0;
}

/* ---------------- despacho ---------------- */
const comandos = { verificar, buscar, comparar, volcar, perf };
if (!comandos[comando]) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('\n').slice(1).map(l => l.replace(/^ \* ?/, '')).join('\n'));
  process.exit(comando === 'ayuda' ? 0 : 1);
}
process.exit(comandos[comando]() ? 1 : 0);
