#!/usr/bin/env node
/* Tests del panel de armado (rebanada 3 de "Equipos en el campo"). Se corren con:
 *
 *     node tests/panel.test.js
 *
 * Cubren lo que el panel DECIDE, que es lo que no se puede probar desde el DOM: la regla de
 * color de la grilla de diferencia por línea, el recálculo sobre el reparto en pantalla, el
 * desglose de titulares sin puntaje, la validación del combo y el escapado del receipt. Lo que
 * sí necesita medir píxeles —que el encabezado entre, que los botones sean alcanzables— vive
 * en tests/layout.test.js.
 *
 * Archivo propio y no una extensión de cancha.test.js (Implementation Plan, TD-08): estas
 * funciones consumen salidas del MOTOR —balanceLineasDe, sumasPorLinea, LABEL_LINEA— y no
 * geometría de la cancha, así que la lista de aquel archivo crecería con ocho nombres que la
 * cancha no usa.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas y con el prefijo de
 * rebanada ("panel/S-04a"), que es la convención de binding que fija AGENTS.md: los gates del
 * plan lo buscan con grep, y un identificador en un comentario daría falso positivo.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia. `players` y `motorConfig` los declara el prelude con setters, con el
   mismo criterio con el que harness.js declara reglaEnabled/reglaParam para el motor. */
const DECLARACIONES = [
  'POSITIONS',
  'computeAvg',
  'valorGeneralDe',
  'puntajeEnPosicion',
  'ORDEN_FORMACION',
  'FORMACION_KEY_POR_POSICION',
  'ORDEN_LINEAS',
  'LABEL_LINEA',
  'lineaDeUnSoloLugar',
  'escaparHtml',
  'fullName',
  'objetivoDiferencia',
  'esDupla',
  'getDuplaPartner',
  'posicionAsignadaDe',
  'construirUnidadDupla',
  'valorDePuntaje',
  'ORDEN_POSICION_LECTURA',
  'jugadoresDeEquipoOrdenados',
  'agruparFilasDeEquipo',
  'sumasPorLinea',
  'balanceLineasDe',
  'canonicalDuplas',
  'CANCHAS',
  'titularesRequeridos',
  'getUnidadesConvocatoria',
  'getTitularIds',
  'reglasOrdenadas',
  'motorConfigHash',
  'equiposStale',
  'balanceLineasVigente',
  'celdasDiferenciaPorLinea',
  'resumenDiferenciaEquipos',
  'conteoSinPuntajePorEquipo',
  'estrategiaValida',
  'renderPorQueQuedaronAsi',
];

/* Las declaraciones que necesita `explicacionesDelArmado`, que se carga aparte para poder
   compararlo contra la versión anterior de index.html (ver S-05d). */
const DECLARACIONES_RECEIPT = [
  'aplicaEnEstrategia',
  'margenTotalPorLinea',
  'objetivoDiferencia',
  'explicacionesDelArmado',
];

function cargarPanel() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  const prelude = `
    let players = [];
    function __setPlayers(p){ players = p; }
    let motorConfig = { reglas: [] };
    function __setMotorConfig(c){ motorConfig = c; }
    const ESTRATEGIAS = { estrategia1:{}, estrategia2:{}, estrategia3:{}, estrategia4:{} };
  `;
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, __setMotorConfig, ESTRATEGIAS, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const P = cargarPanel();

/* El receipt se carga aparte y desde una FUENTE arbitraria, para poder correr el mismo armado
   contra este index.html y contra el de un commit anterior. Es lo que hace de `NFR-007` —"el
   receipt dice exactamente lo mismo que decía"— un criterio medible y no una declaración.
   Mismo mecanismo que `tools/medir-motor.js` usa para comparar motores entre commits. */
function cargarReceipt(fuente) {
  const nombres = [...DECLARACIONES, ...DECLARACIONES_RECEIPT]
    .filter(n => new RegExp(`\\n[ \\t]*(function|const|let)[ \\t]+${n}\\b`).test(fuente));
  const cuerpo = nombres.map(n => extraer(fuente, n)).join('\n\n');
  const prelude = `
    let players = [];
    function __setPlayers(p){ players = p; }
    let motorConfig = { reglas: [] };
    function reglaEnabled(){ return true; }
    function reglaParam(){ return null; }
    const REGLAS_CATALOGO = {};
    const ESTRATEGIAS = { estrategia1:{}, estrategia2:{}, estrategia3:{}, estrategia4:{} };
  `;
  return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, ${nombres.join(', ')} };`)();
}

/* ---------- helpers de aserción (mismos que motor.test.js y cancha.test.js) ---------- */
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
const FORMACION_8 = { defensores: 3, volantes: 3, delanteros: 1 };
const FORMACION_9 = { defensores: 3, volantes: 4, delanteros: 1 };

/* Un jugador con puntaje en una sola posición: es lo único que el panel le mira. */
function J(id, pos, valor) {
  const scores = {};
  if (valor !== null && valor !== undefined) scores[pos] = valor;
  return { id, nombre: id, apellido: '', principal: pos, secundarias: [], scores };
}

/* Un partido con equipos armados. `blanco` y `negro` son listas de [id, posición, puntaje]. */
let plantel = [];
function M(blanco, negro, opciones = {}) {
  const todos = [...blanco, ...negro].map(([id, pos, v]) => J(id, pos, v));
  plantel = todos;
  P.__setPlayers(todos);
  const posicionAsignada = {};
  [...blanco, ...negro].forEach(([id, pos]) => { posicionAsignada[id] = pos; });
  const suma = lista => lista.reduce((t, [, , v]) => t + (v || 0), 0);
  const m = {
    id: 'm1',
    convocados: todos.map(p => p.id),
    duplas: opciones.duplas || [],
    bloqueados: opciones.bloqueados || [],
    equipos: {
      blanco: blanco.map(([id]) => id),
      negro: negro.map(([id]) => id),
      sumaBlanco: opciones.sumaBlanco !== undefined ? opciones.sumaBlanco : suma(blanco),
      sumaNegro: opciones.sumaNegro !== undefined ? opciones.sumaNegro : suma(negro),
      posicionAsignada,
      estrategiaKey: 'estrategia4',
      formacion: opciones.formacion === null ? null : { objetivo: opciones.formacion || FORMACION_8 },
      arquerosInfo: opciones.arquerosInfo || null,
      balanceLineas: opciones.sinBalance ? null : {},
    },
  };
  return m;
}
/* `balanceLineasDe` consume un mapa id → unidad de armado, y le pide el puntaje EN LA POSICIÓN
   asignada. Se arma del mismo plantel que `M` acaba de declarar. */
function porIdDe(m) {
  const out = {};
  [...(m.equipos.blanco || []), ...(m.equipos.negro || [])].forEach(id => {
    const p = plantel.find(x => x.id === id);
    if (p) out[id] = p;
  });
  return out;
}

console.log(`\nEl panel de armado — ${SPEC}\n`);

/* ================================================================= LÍNEA DE UN SOLO LUGAR */
console.log('\x1b[1mLÍNEA DE UN SOLO LUGAR\x1b[0m — qué línea tiene un solo cupo por equipo (D-22)\n');

prueba('"panel/S-04e" el arco y, cuando la formación le da un solo cupo, el ataque son líneas de un solo lugar', () => {
  const combinaciones = [FORMACION_8, FORMACION_9, { defensores: 4, volantes: 4, delanteros: 1 }];
  combinaciones.forEach(formacion => {
    ['Arquero', 'Defensor', 'Volante', 'Delantero'].forEach(pos => {
      const unico = P.lineaDeUnSoloLugar(pos, { objetivo: formacion });
      if (unico) {
        ok(unico === true, `${pos} con ${JSON.stringify(formacion)} debería ser línea de un solo lugar`);
      }
    });
    ok(P.lineaDeUnSoloLugar('Arquero', { objetivo: formacion }) === true, 'el arco siempre es de un solo lugar');
    ok(P.lineaDeUnSoloLugar('Delantero', { objetivo: formacion }) === true, 'con un delantero, el ataque es de un solo lugar');
  });
});

prueba('"panel/S-04d" en fútbol 9 el Medio tiene cuatro lugares y no es de un solo lugar; Arco y Ataque sí', () => {
  const f = { objetivo: FORMACION_9 };
  eq(P.lineaDeUnSoloLugar('Volante', f), false, 'el medio de la cancha de 9 no es de un solo lugar');
  eq(P.lineaDeUnSoloLugar('Arquero', f), true, 'el arco sí');
  eq(P.lineaDeUnSoloLugar('Delantero', f), true, 'el ataque sí');
});

prueba('"panel/S-04" sin formación guardada, ninguna línea de campo se toma como de un solo lugar', () => {
  eq(P.lineaDeUnSoloLugar('Delantero', null), false, 'sin formación no se puede afirmar el cupo');
  eq(P.lineaDeUnSoloLugar('Arquero', null), true, 'el arco no depende de la formación');
});

console.log('');
console.log('\x1b[1mLA GRILLA\x1b[0m — celdas, umbral y color\n');

/* Un armado de 8 con las cuatro líneas pobladas. Defensa despareja por 3, Arco por 4. */
const ARMADO_8 = () => M(
  [['b1','Arquero',9],['b2','Defensor',8],['b3','Defensor',7],['b4','Defensor',6],
   ['b5','Volante',6],['b6','Volante',6],['b7','Volante',6],['b8','Delantero',7]],
  [['n1','Arquero',5],['n2','Defensor',6],['n3','Defensor',6],['n4','Defensor',6],
   ['n5','Volante',6],['n6','Volante',6],['n7','Volante',6],['n8','Delantero',7]]);

prueba('"panel/S-04" con umbral, cualquier línea que lo supere se marca, sea o no de un solo lugar', () => {
  const m = ARMADO_8();
  const celdas = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1);
  const porPos = Object.fromEntries(celdas.map(c => [c.pos, c]));
  eq(porPos.Defensor.diferencia, 3, 'la defensa se lleva 3 puntos');
  eq(porPos.Defensor.excedida, true, 'la defensa supera el desvío y podía repartirse: va marcada');
  eq(porPos.Arquero.diferencia, 4, 'el arco se lleva 4 puntos');
  eq(porPos.Arquero.excedida, true, 'el arco supera el desvío: se marca igual que defensa y medio');
  eq(porPos.Delantero.excedida, false, 'el ataque quedó parejo (0 de diferencia): no hay nada que marcar');
});

prueba('"panel/S-04a" una diferencia igual al desvío no se marca: la regla es "supera", no "alcanza"', () => {
  const m = ARMADO_8();
  const celdas = P.celdasDiferenciaPorLinea(m, porIdDe(m), 3);
  const defensa = celdas.find(c => c.pos === 'Defensor');
  eq(defensa.diferencia, 3, 'la defensa se lleva exactamente 3');
  eq(defensa.excedida, false, 'con el desvío en 3, una diferencia de 3 entra');
});

prueba('"panel/S-04b" una línea pareja dice "Parejo" y no "+0"', () => {
  const m = ARMADO_8();
  const celda = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1).find(c => c.pos === 'Volante');
  eq(celda.diferencia, 0, 'el medio quedó igual');
  eq(celda.texto, 'Parejo', 'una diferencia de cero se dice en palabras');
  eq(celda.aFavor, null, 'y no favorece a nadie');
});

prueba('"panel/S-04c" sin umbral configurado, la grilla se muestra entera y sin ninguna celda marcada', () => {
  const m = ARMADO_8();
  [null, undefined, ''].forEach(sinUmbral => {
    const celdas = P.celdasDiferenciaPorLinea(m, porIdDe(m), sinUmbral);
    ok(celdas.length === 4, `las cuatro líneas se muestran igual (umbral ${JSON.stringify(sinUmbral)})`);
    ok(celdas.every(c => c.excedida === false), 'sin umbral la aplicación no emite juicio (D-15)');
  });
});

prueba('"panel/S-04f" un armado sin balance por línea guardado no produce grilla', () => {
  const m = M([['b1','Arquero',9]], [['n1','Arquero',5]], { sinBalance: true });
  eq(P.celdasDiferenciaPorLinea(m, porIdDe(m), 1), null, 'sin balanceLineas guardado no hay bloque (TC-015)');
  eq(P.balanceLineasVigente(m, porIdDe(m)), null, 'y tampoco recálculo');
});

prueba('"panel/S-04" el texto de cada celda nombra al equipo favorecido', () => {
  const m = ARMADO_8();
  const celdas = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1);
  eq(celdas.find(c => c.pos === 'Defensor').texto, '+3 Blanco', 'la defensa favorece al Blanco');
  eq(celdas.find(c => c.pos === 'Arquero').texto, '+4 Blanco', 'el arco también');
  eq(celdas.map(c => c.etiqueta), ['Arco','Defensa','Medio','Ataque'], 'las etiquetas son las del resto de la aplicación');
});

console.log('');
console.log('\x1b[1mEL RECÁLCULO\x1b[0m — los números siguen al reparto en pantalla (D-25)\n');

prueba('"panel/S-06" mover una unidad al otro equipo cambia la grilla', () => {
  const m = ARMADO_8();
  const antes = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1).find(c => c.pos === 'Defensor');
  // El movimiento manual: b2 (Defensor, 8) pasa al Negro. No toca posicionAsignada (D-20).
  m.equipos.blanco = m.equipos.blanco.filter(id => id !== 'b2');
  m.equipos.negro = [...m.equipos.negro, 'b2'];
  const despues = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1).find(c => c.pos === 'Defensor');
  eq(antes.diferencia, 3, 'antes del movimiento la defensa se llevaba 3');
  eq(despues.blanco, 13, 'el Blanco pierde los 8 de b2');
  eq(despues.negro, 26, 'y el Negro los gana');
  ok(despues.diferencia !== antes.diferencia, 'la grilla dejó de mostrar el número viejo');
});

prueba('"panel/S-06a" la suma de las líneas de un equipo es su total', () => {
  const m = ARMADO_8();
  const balance = P.balanceLineasVigente(m, porIdDe(m));
  const totalBlanco = Object.values(balance).reduce((t, l) => t + l.blanco, 0);
  const totalNegro = Object.values(balance).reduce((t, l) => t + l.negro, 0);
  eq(totalBlanco, m.equipos.sumaBlanco, 'las líneas del Blanco suman su total');
  eq(totalNegro, m.equipos.sumaNegro, 'las del Negro también');
});

prueba('"panel/S-06d" una línea que queda vacía para un equipo muestra 0 y la diferencia entera', () => {
  const m = ARMADO_8();
  // Los tres volantes del Blanco se van al Negro: el Medio del Blanco queda vacío.
  ['b5','b6','b7'].forEach(id => {
    m.equipos.blanco = m.equipos.blanco.filter(x => x !== id);
    m.equipos.negro = [...m.equipos.negro, id];
  });
  const medio = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1).find(c => c.pos === 'Volante');
  eq(medio.blanco, 0, 'el Blanco se quedó sin medio');
  eq(medio.negro, 36, 'el Negro se llevó los seis');
  eq(medio.texto, '+36 Negro', 'y la celda lo dice');
});

prueba('"panel/S-06f" sin balance por línea, el recálculo no produce nada pero la píldora sí', () => {
  const m = M([['b1','Arquero',9]], [['n1','Arquero',5]], { sinBalance: true });
  eq(P.celdasDiferenciaPorLinea(m, porIdDe(m), 1), null, 'no hay grilla');
  eq(P.resumenDiferenciaEquipos(m, 1).texto, 'Diferencia 4 pts', 'la píldora se calcula igual');
});

prueba('"panel/S-06c" una dupla entra en su línea como el promedio de sus dos integrantes', () => {
  const m = M(
    [['b1','Arquero',9],['b2','Volante',8],['b3','Volante',4]],
    [['n1','Arquero',9],['n2','Volante',6],['n3','Volante',6]],
    { duplas: [['b2','b3']] });
  const medio = P.celdasDiferenciaPorLinea(m, porIdDe(m), 1).find(c => c.pos === 'Volante');
  eq(medio.blanco, 12, 'los dos integrantes suman su puntaje en la línea, igual que en el total');
  eq(medio.negro, 12, 'y el Negro también');
  eq(medio.texto, 'Parejo', 'con el promedio de 6 por integrante, la línea queda pareja');
});

console.log('');
console.log('\x1b[1mLA PÍLDORA\x1b[0m — diferencia total y desvío respecto de la buscada\n');

prueba('"panel/S-01a" una diferencia de cero dice "Equipos parejos"', () => {
  const m = M([['b1','Arquero',6]], [['n1','Arquero',6]]);
  const r = P.resumenDiferenciaEquipos(m, 1);
  eq(r.diferencia, 0, 'los dos suman lo mismo');
  eq(r.texto, 'Equipos parejos', 'y se dice en palabras, no "Diferencia 0 pts"');
  eq(r.excedida, false, 'cero nunca supera un umbral');
});

prueba('"panel/S-01" una diferencia distinta de cero se dice con su número', () => {
  const m = M([['b1','Arquero',9]], [['n1','Arquero',6]]);
  eq(P.resumenDiferenciaEquipos(m, 5).texto, 'Diferencia 3 pts', 'tres puntos de diferencia');
  eq(P.resumenDiferenciaEquipos(M([['b1','Arquero',7]], [['n1','Arquero',6]]), 5).texto,
    'Diferencia 1 pt', 'y un punto va en singular');
});

prueba('"panel/S-01e" con una ventaja buscada alcanzada exactamente, la píldora NO se marca', () => {
  /* Es la regla de 009-ventaja-sin-arquero FR-010: lo que se compara con el desvío aceptable es
     el apartamiento respecto de la diferencia BUSCADA, no la diferencia cruda. */
  const m = M([['b1','Arquero',12]], [['n1','Arquero',6]], {
    arquerosInfo: { compensado: true, equipoCompensado: 'blanco', compensacion: 6 } });
  const r = P.resumenDiferenciaEquipos(m, 1);
  eq(r.diferencia, 6, 'la diferencia cruda es de 6 puntos');
  eq(r.buscada, 6, 'y la buscada también');
  eq(r.desvio, 0, 'así que el desvío es cero');
  eq(r.excedida, false, 'alcanzar la ventaja buscada es un acierto, no un problema');
  eq(r.aFavorDe, 'Blanco', 'la píldora puede declarar a quién favorece');
});

prueba('"panel/S-01" sin umbral configurado la píldora nunca se marca', () => {
  const m = M([['b1','Arquero',20]], [['n1','Arquero',1]]);
  [null, undefined, ''].forEach(sinUmbral => {
    eq(P.resumenDiferenciaEquipos(m, sinUmbral).excedida, false,
      `sin umbral no se emite juicio (${JSON.stringify(sinUmbral)})`);
  });
  eq(P.resumenDiferenciaEquipos(m, 1).excedida, true, 'con umbral en 1, una diferencia de 19 sí lo supera');
});

console.log('');
console.log('\x1b[1mTITULARES SIN PUNTAJE\x1b[0m — el desglose que reemplaza a las cajitas (FR-052)\n');

prueba('"panel/S-05a" un solo titular sin puntaje se cuenta en su equipo', () => {
  const m = M([['b1','Arquero',9],['b2','Defensor',null]], [['n1','Arquero',9]]);
  eq(P.conteoSinPuntajePorEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos.blanco),
    P.jugadoresDeEquipoOrdenados(m, m.equipos.negro)), { total: 1, blanco: 1, negro: 0 },
    'uno en el Blanco, ninguno en el Negro');
});

prueba('"panel/S-05b" sin titulares sin puntaje, el conteo es cero y la línea no se emite', () => {
  const m = M([['b1','Arquero',9]], [['n1','Arquero',9]]);
  eq(P.conteoSinPuntajePorEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos.blanco),
    P.jugadoresDeEquipoOrdenados(m, m.equipos.negro)), { total: 0, blanco: 0, negro: 0 },
    'nadie sin puntaje');
});

prueba('"panel/S-06e" mover un titular sin puntaje cambia el desglose, no el total', () => {
  const m = M([['b1','Arquero',9],['b2','Defensor',null]], [['n1','Arquero',9]]);
  const antes = P.conteoSinPuntajePorEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos.blanco),
    P.jugadoresDeEquipoOrdenados(m, m.equipos.negro));
  m.equipos.blanco = ['b1'];
  m.equipos.negro = ['n1', 'b2'];
  const despues = P.conteoSinPuntajePorEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos.blanco),
    P.jugadoresDeEquipoOrdenados(m, m.equipos.negro));
  eq(antes, { total: 1, blanco: 1, negro: 0 }, 'antes estaba en el Blanco');
  eq(despues, { total: 1, blanco: 0, negro: 1 }, 'después en el Negro, y el total no cambió');
});

prueba('"panel/S-05a" una dupla sin puntaje cuenta UNA vez, no dos', () => {
  /* Es la regla de 012-puntajes-coherentes-panel: la unidad de armado es lo que el motor
     repartió, y una dupla ocupa una sola vacante entre sus dos integrantes. */
  const m = M([['b1','Arquero',9],['b2','Volante',null],['b3','Volante',null]],
    [['n1','Arquero',9]], { duplas: [['b2','b3']] });
  eq(P.conteoSinPuntajePorEquipo(m, P.jugadoresDeEquipoOrdenados(m, m.equipos.blanco),
    P.jugadoresDeEquipoOrdenados(m, m.equipos.negro)), { total: 1, blanco: 1, negro: 0 },
    'la dupla sin puntaje es UNA unidad sin puntaje');
});

console.log('');
console.log('\x1b[1mENTRADA Y ESCAPADO\x1b[0m — lo que el panel no debe aceptar ni ejecutar\n');

prueba('"panel/S-21" un valor que no es una clave del catálogo no se acepta', () => {
  eq(P.estrategiaValida('estrategia4'), true, 'las cuatro del catálogo sí');
  eq(P.estrategiaValida('estrategia9'), false, 'una que no existe, no');
});

prueba('"panel/S-21a" la cadena vacía no es una estrategia', () => {
  eq(P.estrategiaValida(''), false, 'vacío no valida');
  eq(P.estrategiaValida(null), false, 'null tampoco');
  eq(P.estrategiaValida(undefined), false, 'undefined tampoco');
});

prueba('"panel/S-21b" una clave heredada de Object no se cuela como estrategia', () => {
  eq(P.estrategiaValida('toString'), false, 'la validación mira claves propias, no la cadena de prototipos');
  eq(P.estrategiaValida('constructor'), false, 'constructor tampoco');
});

prueba('"panel/S-22" un nombre con marcado dentro del receipt se muestra como texto literal', () => {
  const html = P.renderPorQueQuedaronAsi(['<img src=x onerror=alert(1)> permaneció en el Equipo Blanco porque estaba bloqueado.']);
  ok(!html.includes('<img'), 'la etiqueta no llega al DOM como etiqueta');
  ok(html.includes('&lt;img'), 'llega escapada');
});

prueba('"panel/S-22a" la comilla doble se escapa: es la que rompe un atributo', () => {
  const html = P.renderPorQueQuedaronAsi(['Juan "El Loco" permaneció en el Equipo Blanco.']);
  ok(!html.includes('"El Loco"'), 'la comilla cruda no sobrevive');
  ok(html.includes('&quot;'), 'se escapa');
});

prueba('"panel/S-22b" el escapado alcanza a cualquier explicación, no sólo a la del bloqueado', () => {
  const html = P.renderPorQueQuedaronAsi([
    '<b>uno</b> jugaba de arquero pero se ubicó como Delantero.',
    '<i>dos</i> ocupó el arco por su posición secundaria.',
  ]);
  ok(!html.includes('<b>') && !html.includes('<i>'), 'ninguna explicación se inserta cruda');
});

prueba('"panel/S-05c" sin explicaciones no se dibuja el bloque ni su divisor', () => {
  eq(P.renderPorQueQuedaronAsi([]), '', 'lista vacía no produce nada');
  eq(P.renderPorQueQuedaronAsi(null), '', 'null tampoco');
});

console.log('');
console.log('\x1b[1mEL AVISO Y EL COMBO\x1b[0m — cuándo el armado está desactualizado\n');

/* `equiposStale` compara el armado guardado contra el estado actual del partido. Los cuatro
   disparadores son los que el texto del aviso nombra, y por eso D-05 conserva ese texto en vez
   del del handoff, que sólo habla de la estrategia. */
function partidoConArmadoAlDia() {
  const m = M([['b1','Arquero',9],['b2','Defensor',7]], [['n1','Arquero',5],['n2','Defensor',7]]);
  m.estrategia = 'estrategia4';
  m.equipos.titularesSnapshot = [...m.convocados];
  m.equipos.duplasSnapshot = P.canonicalDuplas(m);
  m.equipos.configHash = P.motorConfigHash();
  return m;
}

prueba('"panel/S-03a" cambiar la estrategia elegida deja el armado desactualizado', () => {
  const m = partidoConArmadoAlDia();
  eq(P.equiposStale(m), false, 'recién generado, el armado está al día');
  m.estrategia = 'estrategia3';
  eq(P.equiposStale(m), true, 'elegir otra estrategia sin regenerar lo desactualiza');
});

prueba('"panel/S-03b" crear o deshacer una dupla también lo desactualiza', () => {
  const m = partidoConArmadoAlDia();
  eq(P.equiposStale(m), false, 'punto de partida al día');
  m.duplas = [['b1', 'b2']];
  eq(P.equiposStale(m), true, 'cambiar las duplas cambia cómo el motor agrupó para repartir');
});

prueba('"panel/S-03" cambiar la configuración del motor lo desactualiza', () => {
  const m = partidoConArmadoAlDia();
  m.equipos.configHash = 'otro-hash';
  eq(P.equiposStale(m), true, 'el cuarto disparador que el texto del aviso nombra (D-05)');
});

prueba('"panel/S-02a" cada estrategia del catálogo tiene su propio resumen, no vacío', () => {
  /* El combo ya NO muestra este campo (FR-011 invertido el 2026-09-02: el resumen permanente
     resultó más ruido que ayuda en la pantalla de equipos generados) — el campo sigue existiendo
     en el catálogo igual, y este test valida sólo la integridad del dato, no dónde se usa. */
  const catalogo = src.match(/const ESTRATEGIAS = \{[\s\S]*?\n  \};/);
  ok(catalogo, 'el catálogo de estrategias sigue existiendo');
  const resumenes = [...catalogo[0].matchAll(/resumen: '([^']+)'/g)].map(m => m[1]);
  eq(resumenes.length, 4, 'las cuatro estrategias del catálogo traen resumen');
  ok(resumenes.every(r => r.trim().length > 10), 'ninguno está vacío ni es un placeholder');
  eq(new Set(resumenes).size, 4, 'y los cuatro son distintos entre sí');
});

console.log('');
console.log('\x1b[1mEL RECEIPT NO CAMBIÓ\x1b[0m — la extracción movió código, no texto (NFR-007)\n');

prueba('"panel/S-05d" el receipt produce las mismas cadenas que antes de extraerlo', () => {
  /* La versión de referencia sale del index.html de `main` en el commit del merge de la Spec,
     leído con git. Sin git —un tarball, un CI sin historia— el caso se declara salteado en vez
     de dar un falso verde: lo que no se pudo comparar, no se afirma. */
  let anterior;
  try {
    anterior = require('child_process')
      .execFileSync('git', ['show', '0488d7b:index.html'], { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 })
      .toString('utf8');
  } catch (e) {
    console.log('      \x1b[33m∅ salteado\x1b[0m — no se pudo leer index.html de 0488d7b con git');
    return;
  }
  const receiptAntes = cargarReceipt(anterior);
  const receiptAhora = cargarReceipt(src);
  ok(!receiptAntes.explicacionesDelArmado,
    'en la versión anterior el receipt NO tenía función con nombre: por eso hubo que extraerlo');
  ok(typeof receiptAhora.explicacionesDelArmado === 'function',
    'en esta versión sí, que es lo que hace comparable la lista');
  /* Con la versión anterior no hay función que llamar —el bloque vivía en línea dentro de
     renderTeamsSection—, así que lo que se compara es el TEXTO del bloque, carácter por
     carácter, ignorando la indentación que la extracción cambió. */
  const bloqueDe = (fuente) => {
    const i = fuente.indexOf('const explicaciones = [];');
    const j = fuente.indexOf('Reglas desactivadas en el motor:', i);
    const k = fuente.indexOf('}', j);
    /* Se comparan LÍNEAS DE CÓDIGO: los comentarios se sacan antes, porque la extracción los
       reescribió a propósito y compararlos sería comparar prosa. */
    return fuente.slice(i, k + 1)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map(l => l.replace(/\/\/.*$/, '').trim())
      .filter(Boolean)
      .join('\n');
  };
  const antes = bloqueDe(anterior), ahora = bloqueDe(src);
  const lineasAntes = antes.split('\n'), lineasAhora = ahora.split('\n');
  /* Las diferencias esperadas y declaradas son exactamente dos: el predicado de línea de un solo
     lugar, que pasó a llamar a `lineaDeUnSoloLugar` (TC-013), y la línea de titulares sin
     puntaje, que ganó el desglose por equipo (FR-052). Cualquier otra es una regresión. */
  const soloEn = (a, b) => a.filter(l => !b.includes(l));
  const nuevas = soloEn(lineasAhora, lineasAntes);
  const perdidas = soloEn(lineasAntes, lineasAhora);
  const esperado = l => l.includes('lineaDeUnSoloLugar')
    || l.includes('unSoloLugar = ORDEN_LINEAS')
    || l.includes('.filter(pos =>')
    || l.includes("if(pos === 'Arquero') return true;")
    || l.includes('eq.formacion && eq.formacion.objetivo')
    || l.includes('Se distribuyeron ');
  const inesperadasNuevas = nuevas.filter(l => !esperado(l));
  const inesperadasPerdidas = perdidas.filter(l => !esperado(l));
  eq(inesperadasNuevas, [], 'la extracción no debería haber agregado ninguna línea de lógica nueva');
  eq(inesperadasPerdidas, [], 'la extracción no debería haber perdido ninguna línea de lógica');
});

prueba('"panel/S-05a" la línea de titulares sin puntaje declara el desglose por equipo', () => {
  const linea = src.match(/Se distribuyeron \$\{totalSinPuntaje\}[^`]*/);
  ok(linea, 'la línea de titulares sin puntaje sigue existiendo');
  ok(linea[0].includes('en el Blanco') && linea[0].includes('en el Negro'),
    'y dice cuántos quedaron en cada equipo, que es lo que reemplaza a las cajitas retiradas (FR-052)');
});

/* ---------- salida ---------- */
console.log('');
if (fallos.length) {
  console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
  process.exit(1);
}
console.log(`Pasaron: ${pasaron}/${pasaron}`);
console.log('\x1b[32m✓ el panel decide los números y el color como fija la Spec\x1b[0m\n');
