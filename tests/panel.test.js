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
  'colapsarDuplasParaLinea',
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
  'sumaVigenteDeEquipo',
  'sumasVigentes',
  // El recuento de formación sobre el reparto en pantalla y lo que necesita.
  'COSTO_DESCUBIERTA',
  'costoEncaje',
  'faltantesDeFormacionVigente',
  'repartoDivergeDeLaGeneracion',
  'ICON_CHEVRON_RECEIPT',
  'unidadDelPartido',
  'moverUnJugadorDeEquipo',
  'intercambiarUnidades',
  'resumenDiferenciaEquipos',
  'conteoSinPuntajePorEquipo',
  'estrategiaValida',
  'renderPorQueQuedaronAsi',
];

/* Las declaraciones que necesita `explicacionesDelArmado`, que se carga aparte para poder
   compararlo contra la versión anterior de index.html (ver S-05g). */
const DECLARACIONES_RECEIPT = [
  'aplicaEnEstrategia',
  'margenTotalPorLinea',
  'objetivoDiferencia',
  'duplasDeLaFormacion',
  'explicacionesDelArmado',
];

function cargarPanel() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  const prelude = `
    let players = [];
    function __setPlayers(p){ players = p; }
    let motorConfig = { reglas: [] };
    function __setMotorConfig(c){ motorConfig = c; }
    /* Estado de pantalla del desplegable del receipt: renderPorQueQuedaronAsi lo lee del ámbito
       del IIFE, igual que lee players. El setter permite probar los dos estados sin DOM.
       (Sin comillas invertidas: este prelude es un template literal y las cortaría.) */
    let receiptAbiertoDe = null;
    function __setReceiptAbiertoDe(v){ receiptAbiertoDe = v; }
    const ESTRATEGIAS = { estrategia1:{}, estrategia2:{}, estrategia3:{}, estrategia4:{} };
  `;
  try {
    return new Function(`${prelude}${cuerpo}\nreturn { __setPlayers, __setMotorConfig, __setReceiptAbiertoDe, ESTRATEGIAS, ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const P = cargarPanel();

/* El receipt se carga aparte y desde una FUENTE arbitraria, para poder correr el mismo armado
   contra este index.html y contra el de un commit anterior. Es lo que hace de `NFR-007b` —"ninguna
   explicación se pierde al partir el bloque en dos"— un criterio medible y no una declaración.
   (Hasta el 2026-09-10 sostenía a `NFR-007`, "el receipt dice exactamente lo mismo que decía", que
   `FR-072b` invirtió: el mecanismo sirve igual, cambió lo que se le pregunta.)
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

/* El total del encabezado y la píldora se leían de `sumaBlanco`/`sumaNegro` —el valor calculado
   al generar, parcheado a mano en cada movimiento— mientras la grilla por línea se recalculaba.
   Los dos números salían del mismo reparto y no coincidían. Bug de producción del 2026-09-10. */
prueba('"panel/S-06g" el total de un equipo se recalcula del reparto en pantalla, no del guardado', () => {
  const m = ARMADO_8();
  const guardadoBlanco = m.equipos.sumaBlanco;
  // b2 (Defensor, 8) pasa al Negro a mano, por la misma función que usa el arrastre.
  P.moverUnJugadorDeEquipo(m, 'b2', 'negro');
  eq(m.equipos.sumaBlanco, guardadoBlanco, 'el valor guardado no se toca: es el registro de la generación (TC-011)');
  eq(P.sumaVigenteDeEquipo(m, m.equipos.blanco), guardadoBlanco - 8, 'el total en pantalla sí baja los 8 de b2');
  eq(P.sumasVigentes(m).negro, m.equipos.sumaNegro + 8, 'y el del Negro los gana');
});

prueba('"panel/S-06h" mover una dupla mueve el puntaje de la UNIDAD, no la suma de sus dos integrantes', () => {
  /* La dupla b2(9) + b3(5) ocupa un solo lugar y vale 7 —el promedio—, que es lo que el motor
     contó una única vez en el total. El parche del movimiento restaba y sumaba los puntajes
     INDIVIDUALES, así que arrastrarla movía 14 puntos en vez de 7 y rompía los dos totales. */
  const m = M(
    [['b1','Arquero',6],['b2','Volante',9],['b3','Volante',5],['b4','Volante',6]],
    [['n1','Arquero',6],['n2','Volante',7],['n3','Volante',6]],
    { duplas: [['b2','b3']], sumaBlanco: 19, sumaNegro: 19 });
  eq(P.sumasVigentes(m), { blanco: 19, negro: 19 }, 'recién generado, el total en pantalla es el que guardó el motor');
  eq(P.resumenDiferenciaEquipos(m, 1).texto, 'Equipos parejos', 'y la píldora dice que están parejos');

  P.moverUnJugadorDeEquipo(m, 'b2', 'negro');
  P.moverUnJugadorDeEquipo(m, P.getDuplaPartner(m, 'b2'), 'negro'); // la dupla viaja junta (FR-011)
  eq(P.sumasVigentes(m), { blanco: 12, negro: 26 }, 'el Blanco pierde los 7 de la unidad, no los 14 de sus integrantes');
  eq(P.resumenDiferenciaEquipos(m, 1).texto, 'Diferencia 14 pts', 'y la píldora dice 14, no 28');
});

prueba('"panel/S-06i" el total del encabezado es siempre la suma de la grilla por línea', () => {
  const casos = [
    ['recién generado', ARMADO_8()],
    ['con una unidad movida a mano', (() => { const m = ARMADO_8(); P.moverUnJugadorDeEquipo(m, 'b2', 'negro'); return m; })()],
    ['con dos unidades intercambiadas', (() => { const m = ARMADO_8(); P.intercambiarUnidades(m, 'b2', 'n2'); return m; })()],
  ];
  casos.forEach(([etiqueta, m]) => {
    const balance = P.balanceLineasVigente(m, porIdDe(m));
    const porLinea = lado => Object.values(balance).reduce((t, l) => t + l[lado], 0);
    const suma = P.sumasVigentes(m);
    eq(Math.round(suma.blanco * 10) / 10, Math.round(porLinea('blanco') * 10) / 10, `Blanco coincide (${etiqueta})`);
    eq(Math.round(suma.negro * 10) / 10, Math.round(porLinea('negro') * 10) / 10, `Negro coincide (${etiqueta})`);
  });
});

prueba('"panel/S-06j" cambiar el puntaje de un jugador después de generar cambia el total en pantalla', () => {
  /* `equiposStale` no mira los puntajes, así que el partido no queda marcado para regenerar:
     si el total no se recalculara, envejecería sin que nada lo avise. */
  const m = ARMADO_8();
  const antes = P.sumasVigentes(m).blanco;
  const b2 = plantel.find(p => p.id === 'b2');
  b2.scores[P.posicionAsignadaDe(b2, m)] = 1; // de 8 a 1
  eq(P.sumasVigentes(m).blanco, antes - 7, 'el total del Blanco sigue al puntaje nuevo');
  eq(m.equipos.sumaBlanco, antes, 'y el guardado queda como estaba, registrando la generación');
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
  eq(medio.blanco, 6, 'la dupla entra una sola vez, con el promedio de sus dos integrantes (FR-036), no la suma');
  eq(medio.negro, 12, 'sin dupla, cada volante del Negro suma su propio puntaje');
  eq(medio.texto, '+6 Negro', 'el promedio de la dupla (6) queda por debajo de los dos volantes sueltos del Negro (12)');
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
  const html = P.renderPorQueQuedaronAsi({ vigentes: ['<img src=x onerror=alert(1)> está bloqueado en el Equipo Blanco.'], generacion: [] });
  ok(!html.includes('<img'), 'la etiqueta no llega al DOM como etiqueta');
  ok(html.includes('&lt;img'), 'llega escapada');
});

prueba('"panel/S-22" el escapado alcanza igual al grupo generado por el motor', () => {
  const html = P.renderPorQueQuedaronAsi({ vigentes: [], generacion: ['<img src=x onerror=alert(1)> ocupó el arco por su posición secundaria.'] });
  ok(!html.includes('<img'), 'el grupo nuevo no es una vía de escape del escapado');
  ok(html.includes('&lt;img'), 'llega escapado igual que el otro');
});

prueba('"panel/S-22a" la comilla doble se escapa: es la que rompe un atributo', () => {
  const html = P.renderPorQueQuedaronAsi({ vigentes: ['Juan "El Loco" está bloqueado en el Equipo Blanco.'], generacion: [] });
  ok(!html.includes('"El Loco"'), 'la comilla cruda no sobrevive');
  ok(html.includes('&quot;'), 'se escapa');
});

prueba('"panel/S-22b" el escapado alcanza a cualquier explicación, no sólo a la del bloqueado', () => {
  const html = P.renderPorQueQuedaronAsi({
    vigentes: ['<b>uno</b> está bloqueado en el Equipo Blanco.'],
    generacion: ['<i>dos</i> ocupó el arco por su posición secundaria.'],
  });
  ok(!html.includes('<b>') && !html.includes('<i>'), 'ninguna explicación se inserta cruda');
});

prueba('"panel/S-05c" sin explicaciones no se dibuja el bloque ni su divisor', () => {
  eq(P.renderPorQueQuedaronAsi({ vigentes: [], generacion: [] }), '', 'los dos grupos vacíos no producen nada');
  eq(P.renderPorQueQuedaronAsi(null), '', 'null tampoco');
});

/* ---------- el desplegable (2026-09-10) ---------- */

prueba('"panel/S-05h" el bloque es un desplegable cerrado por default', () => {
  P.__setReceiptAbiertoDe(null);
  const html = P.renderPorQueQuedaronAsi({ vigentes: ['algo'], generacion: [] }, 'm1');
  ok(html.startsWith('<details'), 'es un <details>, no un <div>: trae el plegado y el teclado del navegador');
  ok(!html.includes(' open'), 'y arranca cerrado, para no ensuciar la pantalla');
  ok(html.includes('<summary'), 'el rótulo es el <summary>, así que es lo único que se ve cerrado');
});

prueba('"panel/S-05h" un bloque abierto sigue abierto después de repintar, y sólo el de su partido', () => {
  /* `renderTeamsSection` repinta la sección entera en cada cambio. Sin recordar el estado, el
     bloque se cerraría solo justo al mover un jugador, que es cuando se lo quiere mirar. */
  P.__setReceiptAbiertoDe('m1');
  ok(P.renderPorQueQuedaronAsi({ vigentes: ['algo'], generacion: [] }, 'm1').includes(' open'),
    'el partido cuyo bloque se abrió lo vuelve a pintar abierto');
  ok(!P.renderPorQueQuedaronAsi({ vigentes: ['algo'], generacion: [] }, 'm2').includes(' open'),
    'otro partido arranca cerrado: el estado es de un solo partido a la vez');
  P.__setReceiptAbiertoDe(null);
});

/* El defecto que encontró el propietario el 2026-09-10 en el partido del sábado 12: había sólo
   generado, sin tocar nada, y el bloque aparecía partido en dos. Recién generado TODO lo que se ve
   lo hizo el motor, así que la división no describe ninguna diferencia real. */
prueba('"panel/S-05j" recién generado el bloque va en una sola lista, sin rótulos de grupo', () => {
  const { cargarMotor } = require('./harness');
  const motor = cargarMotor({ puntaje: { enabled: true, params: { diferenciaMaxima: 2, ventajaSinArquero: 6 } } });
  const JP = (id, principal, scores, secundarias) =>
    ({ id, nombre: id, apellido: '', principal, secundarias: secundarias || [], scores });
  const base = [
    JP('ar1','Arquero',{Arquero:8, Defensor:6}), JP('ar2','Arquero',{Arquero:7}),
    JP('df1','Defensor',{Defensor:9}), JP('df2','Defensor',{Defensor:5}),
    JP('df3','Defensor',{Defensor:7, Volante:6},['Volante']), JP('df4','Defensor',{Defensor:6}),
    JP('df5','Defensor',{Defensor:6.5}), JP('df6','Defensor',{Defensor:5.5}),
    JP('vo1','Volante',{Volante:8}), JP('vo2','Volante',{Volante:7, Defensor:6},['Defensor']),
    JP('vo3','Volante',{Volante:6}), JP('vo4','Volante',{Volante:6.5}),
    JP('vo5','Volante',{Volante:7.5}), JP('vo6','Volante',{Volante:5}),
    JP('de1','Delantero',{Delantero:8}), JP('de2','Delantero',{Delantero:7}),
    JP('vo7','Volante',{Volante:6.2}),
  ];
  const estrategias = ['generarEquiposEstrategia1','generarEquiposEstrategia2','generarEquiposEstrategia3','generarEquiposEstrategia4'];
  estrategias.forEach(estrategia => {
    [false, true].forEach(conDupla => {
      const plantelMotor = base.map(p => ({ ...p, scores: { ...p.scores } }));
      const porId = Object.fromEntries(plantelMotor.map(p => [p.id, p]));
      P.__setPlayers(plantelMotor);
      const DUPLA = ['df1','df2'];
      let unidades = plantelMotor.slice(0, 16);
      const unidadPorId = {};
      if (conDupla) {
        const u = P.construirUnidadDupla(porId.df1, porId.df2);
        unidades = plantelMotor.filter(p => !DUPLA.includes(p.id)).concat([u]);
        unidadPorId[u.id] = DUPLA;
      }
      let r = motor[estrategia](unidades, [], {}, {}, FORMACION_8);
      if (conDupla) r = motor.expandirUnidadesEnResultado(r, unidadPorId);
      const m = {
        id: 'm1', convocados: plantelMotor.map(p => p.id), duplas: conDupla ? [DUPLA] : [], bloqueados: [],
        equipos: {
          blanco: r.blanco, negro: r.negro, sumaBlanco: r.sumaBlanco, sumaNegro: r.sumaNegro,
          posicionAsignada: r.posicionAsignada, posicionOverride: r.posicionOverride,
          estrategiaKey: estrategia, formacion: r.formacion || null,
          arquerosInfo: r.arquerosInfo, balanceLineas: r.balanceLineas || null,
        },
      };
      const etiqueta = `${estrategia}${conDupla ? ' con dupla' : ''}`;
      eq(P.repartoDivergeDeLaGeneracion(m, porId), false,
        `${etiqueta}: recién generado el reparto NO se apartó de la generación`);
    });
  });
});

prueba('"panel/S-05j" sin dividir es una sola lista en el orden de siempre; al apartarse, dos grupos', () => {
  const explicaciones = {
    vigentes: ['vig-1', 'vig-2'],
    generacion: ['gen-1'],
    // El orden de emisión intercala los dos grupos: es el que la lista única tiene que conservar.
    ordenadas: [{ texto: 'gen-1', grupo: 'generacion' }, { texto: 'vig-1', grupo: 'vigentes' }, { texto: 'vig-2', grupo: 'vigentes' }],
  };
  const unica = P.renderPorQueQuedaronAsi(explicaciones, 'm1', false);
  ok(!unica.includes('panel-receipt-grupo'), 'sin dividir no se emite ningún rótulo de grupo');
  eq(unica.match(/<ul/g).length, 1, 'y hay una sola lista');
  const orden = [...unica.matchAll(/<li>([^<]+)<\/li>/g)].map(x => x[1]);
  eq(orden, ['gen-1', 'vig-1', 'vig-2'], 'la lista única conserva el orden de emisión, no el de los grupos');

  const dividida = P.renderPorQueQuedaronAsi(explicaciones, 'm1', true);
  ok(dividida.includes('Con tus cambios') && dividida.includes('Como lo armó el motor'),
    'apartado de la generación, sí se rotulan los dos grupos');
  eq(dividida.match(/<ul/g).length, 2, 'y hay dos listas');
});

prueba('"panel/S-05j" un movimiento manual hace que el reparto se aparte, y un intercambio neutro no', () => {
  const armado = () => M(
    [['b1','Arquero',6],['b2','Defensor',7],['b3','Defensor',6],['b4','Defensor',6],
     ['b5','Volante',6],['b6','Volante',6],['b7','Volante',6],['b8','Delantero',6]],
    [['n1','Arquero',6],['n2','Defensor',6],['n3','Defensor',6],['n4','Defensor',6],
     ['n5','Volante',6],['n6','Volante',6],['n7','Volante',6],['n8','Delantero',6]]);
  const m = armado();
  /* El balance guardado tiene que ser el de este reparto: `M` no lo calcula, lo deja en `{}`. */
  m.equipos.balanceLineas = P.balanceLineasVigente({ ...m, equipos: { ...m.equipos, balanceLineas: {} } }, porIdDe(m));
  m.equipos.formacion = { objetivo: FORMACION_8, blanco: { cumplida: true, faltantes: [] }, negro: { cumplida: true, faltantes: [] } };
  eq(P.repartoDivergeDeLaGeneracion(m, porIdDe(m)), false, 'sin tocar nada, no se apartó');

  P.moverUnJugadorDeEquipo(m, 'b2', 'negro');
  eq(P.repartoDivergeDeLaGeneracion(m, porIdDe(m)), true, 'pasar un defensor al otro equipo sí lo aparta');

  /* Intercambiar dos jugadores del mismo puesto y el mismo puntaje no cambia ninguna de las tres
     medidas, así que los dos grupos dirían lo mismo y dividirlos sería ruido. */
  const m2 = armado();
  m2.equipos.balanceLineas = P.balanceLineasVigente({ ...m2, equipos: { ...m2.equipos, balanceLineas: {} } }, porIdDe(m2));
  m2.equipos.formacion = { objetivo: FORMACION_8, blanco: { cumplida: true, faltantes: [] }, negro: { cumplida: true, faltantes: [] } };
  P.intercambiarUnidades(m2, 'b3', 'n2'); // los dos Defensor, los dos 6
  eq(P.repartoDivergeDeLaGeneracion(m2, porIdDe(m2)), false,
    'un intercambio que no cambia ningún número no cuenta como apartarse');
});

prueba('"panel/S-05i" ya dividido, los dos grupos se rotulan sólo cuando hay algo en los dos', () => {
  const conLosDos = P.renderPorQueQuedaronAsi({ vigentes: ['a'], generacion: ['b'] }, 'm1', true);
  ok(conLosDos.includes('Con tus cambios') && conLosDos.includes('Como lo armó el motor'),
    'con los dos grupos, cada uno dice qué es');
  const soloVigentes = P.renderPorQueQuedaronAsi({ vigentes: ['a'], generacion: [] }, 'm1', true);
  ok(!soloVigentes.includes('Con tus cambios'),
    'con un grupo solo, contrastarlo contra un grupo ausente confundiría en vez de aclarar');
  const soloGeneracion = P.renderPorQueQuedaronAsi({ vigentes: [], generacion: ['b'] }, 'm1', true);
  ok(soloGeneracion.includes('Como lo armó el motor'),
    'salvo el de generación, que sí necesita decir que no describe el estado actual');
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
console.log('\x1b[1mEL RECEIPT SE PARTIÓ EN DOS\x1b[0m — ninguna explicación se perdió en el reparto\n');

/* Reemplaza a "panel/S-05d" ("el receipt produce las mismas cadenas que antes de extraerlo"), que
   guardaba `NFR-007` —"el receipt dice exactamente lo mismo que decía"—. Esa premisa la retiró el
   propietario el 2026-09-10: el bloque AHORA tiene que ajustarse a los cambios hechos después de
   generar, así que un test que exige que su texto no cambie ya no describe lo que se quiere.

   Lo que se guarda en su lugar es más fuerte y es el riesgo real de partir una lista en dos:
   perder una explicación por el camino. Se corre el mismo armado contra este index.html y contra
   el anterior, y se exige que la UNIÓN de los dos grupos nuevos sea exactamente el conjunto de
   cadenas que emitía la lista vieja. Mismo mecanismo de `cargarReceipt` que usaba S-05d. */
prueba('"panel/S-05g" los dos grupos juntos dicen exactamente lo que decía la lista única', () => {
  let anterior;
  try {
    anterior = require('child_process')
      .execFileSync('git', ['show', '0780e54:index.html'], { cwd: path.join(__dirname, '..'), maxBuffer: 64 * 1024 * 1024 })
      .toString('utf8');
  } catch (e) {
    console.log('      \x1b[33m∅ salteado\x1b[0m — no se pudo leer index.html de 0780e54 con git');
    return;
  }
  const receiptAntes = cargarReceipt(anterior);
  const receiptAhora = cargarReceipt(src);
  ok(typeof receiptAntes.explicacionesDelArmado === 'function', 'la versión anterior tiene la función, que es lo que hace comparable la lista');

  /* Un armado que dispara la mayor cantidad de líneas posible: formación fija pareja, un arquero
     excedente, una dupla, un bloqueado, una segunda generación y una regla apagada. */
  const armado = () => {
    const jugadores = [
      J('b-arq', 'Arquero', 8), J('b-def1', 'Defensor', 7), J('b-def2', 'Defensor', 6),
      J('b-def3', 'Defensor', 6), J('b-vol1', 'Volante', 7), J('b-vol2', 'Volante', 6),
      J('b-vol3', 'Volante', 6), J('b-del', 'Delantero', 7),
      /* 17º convocado: la dupla b-vol1+b-vol2 ocupa UN lugar de la formación, así que sin este el
         Blanco quedaría con 7 unidades contra 8 del Negro y su formación figuraría —con razón—
         incompleta, que no es lo que este caso quiere medir. */
      J('b-vol4', 'Volante', 6),
      J('n-arq', 'Arquero', 6), J('n-def1', 'Defensor', 6), J('n-def2', 'Defensor', 6),
      J('n-def3', 'Defensor', 6), J('n-vol1', 'Volante', 6), J('n-vol2', 'Volante', 6),
      J('n-vol3', 'Volante', 6), J('n-del', 'Delantero', 6),
    ];
    const posicionAsignada = {};
    jugadores.forEach(p => { posicionAsignada[p.id] = p.principal; });
    const ids = jugadores.map(p => p.id);
    return {
      jugadores,
      m: {
        id: 'm1', convocados: ids, duplas: [['b-vol1', 'b-vol2']], bloqueados: ['b-def1'],
        equipos: {
          blanco: ids.slice(0, 9), negro: ids.slice(9),
          sumaBlanco: 53, sumaNegro: 48, posicionAsignada,
          estrategiaKey: 'estrategia4',
          formacion: { objetivo: FORMACION_8, blanco: { cumplida: true, faltantes: [] }, negro: { cumplida: true, faltantes: [] } },
          arquerosInfo: { total: 2, compensado: false },
          arquerosExcedentes: [{ playerId: 'n-arq', pos: 'Delantero' }],
          arquerosPorSecundaria: [{ playerId: 'b-del' }],
          duplasSnapshot: JSON.stringify([['b-vol1', 'b-vol2']]),
          esPrimeraGeneracion: false, cambios: 2,
          swaps: [{ playerId: 'n-vol1', desde: 'Volante', hacia: 'Defensor', motivo: 'formacion' }],
          balanceLineas: null, enumeracionTruncada: true, // se completa abajo, con el reparto ya armado
        },
      },
    };
  };

  const { jugadores, m } = armado();
  /* El balance guardado tiene que ser el que el motor guardaría para ESTE reparto, con la dupla
     contada una sola vez: la versión anterior lo lee de `eq.balanceLineas` y la nueva lo recalcula
     colapsando duplas, así que con un balance sin colapsar las dos hablarían de balances distintos
     y la comparación mediría eso en vez de medir si se perdió una línea. */
  P.__setPlayers(jugadores);
  m.equipos.balanceLineas = P.balanceLineasVigente(
    { ...m, equipos: { ...m.equipos, balanceLineas: {} } },
    Object.fromEntries(jugadores.map(p => [p.id, p])));
  receiptAntes.__setPlayers(jugadores);
  receiptAhora.__setPlayers(jugadores);
  const antes = receiptAntes.explicacionesDelArmado(m, m.equipos, jugadores);
  const ahoraDos = receiptAhora.explicacionesDelArmado(m, m.equipos, jugadores);
  ok(Array.isArray(antes), 'antes devolvía una lista plana');
  ok(Array.isArray(ahoraDos.vigentes) && Array.isArray(ahoraDos.generacion), 'ahora devuelve los dos grupos');
  const ahora = [...ahoraDos.vigentes, ...ahoraDos.generacion];

  ok(antes.length > 6, `el armado de prueba tiene que disparar muchas líneas, disparó ${antes.length}`);
  eq(ahora.length, antes.length, 'la unión de los dos grupos tiene la misma cantidad de líneas');

  /* La ÚNICA cadena que cambió de texto, declarada por su prefijo exacto: la del bloqueado. Decía
     "permaneció en el Equipo X porque estaba bloqueado", y eso era falso en cuanto se arrastraba a
     un jugador bloqueado —nombraba el equipo nuevo afirmando que no se había movido—. Se lista una
     sola, y por texto exacto, con el mismo criterio con el que S-05d listaba sus excepciones: una
     excepción declarada de más tapa la próxima regresión de verdad. */
  const REESCRITAS = {
    'b-def1 permaneció en el Equipo Blanco porque estaba bloqueado.':
      'b-def1 está bloqueado en el Equipo Blanco: la próxima generación no lo va a mover de ahí.',
  };
  const normalizar = l => REESCRITAS[l] || l;
  ok(antes.some(l => REESCRITAS[l]), 'el armado de prueba tiene que disparar la línea del bloqueado, que es la única reescrita');
  eq([...ahora].sort(), [...antes.map(normalizar)].sort(),
     'ninguna explicación se perdió ni se inventó al partir la lista en dos grupos');

  // Y el reparto entre grupos es el declarado: lo que narra al motor va aparte.
  ok(ahoraDos.generacion.some(l => l.includes('posición secundaria de')), 'los swaps van al grupo de la generación');
  ok(ahoraDos.generacion.some(l => l.includes('demasiadas combinaciones')), 'la enumeración truncada también');
  ok(ahoraDos.generacion.some(l => l.includes('generación anterior')), 'y la comparación entre generaciones');
  ok(ahoraDos.vigentes.some(l => l.includes('dupla de rotación quedó en el Equipo')), 'el reparto de duplas describe lo que se ve');
  ok(ahoraDos.vigentes.some(l => l.includes('está bloqueado en el Equipo')), 'y el bloqueo también');
});

prueba('"panel/S-06k" mover un jugador ajusta el grupo vigente y deja intacto el de la generación', () => {
  /* Es el pedido del propietario del 2026-09-10: que el bloque se ajuste a los cambios hechos
     después de generar. Se corre el receipt real antes y después de un movimiento. */
  const R = cargarReceipt(src);
  const jugadores = [
    J('b-arq','Arquero',6), J('b-def1','Defensor',6), J('b-def2','Defensor',6), J('b-def3','Defensor',6),
    J('b-vol1','Volante',6), J('b-vol2','Volante',6), J('b-vol3','Volante',6), J('b-del','Delantero',6),
    J('n-arq','Arquero',6), J('n-def1','Defensor',6), J('n-def2','Defensor',6), J('n-def3','Defensor',6),
    J('n-vol1','Volante',6), J('n-vol2','Volante',6), J('n-vol3','Volante',6), J('n-del','Delantero',6),
  ];
  R.__setPlayers(jugadores);
  P.__setPlayers(jugadores);
  const ids = jugadores.map(p => p.id);
  const posicionAsignada = {};
  jugadores.forEach(p => { posicionAsignada[p.id] = p.principal; });
  const m = {
    id: 'm1', convocados: ids, duplas: [], bloqueados: [],
    equipos: {
      blanco: ids.slice(0, 8), negro: ids.slice(8), sumaBlanco: 48, sumaNegro: 48, posicionAsignada,
      estrategiaKey: 'estrategia4', formacion: { objetivo: FORMACION_8, blanco: { cumplida: true, faltantes: [] }, negro: { cumplida: true, faltantes: [] } },
      arquerosInfo: { total: 2, compensado: false }, esPrimeraGeneracion: false, cambios: 3,
      balanceLineas: {}, swaps: [],
    },
  };
  const antes = R.explicacionesDelArmado(m, m.equipos, jugadores);
  ok(antes.vigentes.some(l => l === 'Formación 3-3-1 cumplida en ambos equipos.'),
    'recién generado el bloque dice que la formación está cumplida');

  P.moverUnJugadorDeEquipo(m, 'b-def1', 'negro');
  const despues = R.explicacionesDelArmado(m, m.equipos, jugadores);
  ok(despues.vigentes.some(l => l === 'No se pudo completar la formación 3-3-1 en el Equipo Blanco.'),
    'después de sacarle un defensor al Blanco, el bloque lo dice — antes seguía afirmando "cumplida"');
  eq(despues.generacion, antes.generacion,
    'y el grupo "Como lo armó el motor" no se mueve: describe lo que hizo el motor, que no cambió');
});

/* `faltantesDeFormacionVigente` espeja la regla de `calcularFaltantes`, que vive dentro del motor
   y depende de su estado interno. Que las dos coincidan no se afirma: se mide, corriendo el motor
   de verdad y comparando su veredicto guardado con el recalculado sobre el mismo reparto. Es la
   misma disciplina con la que se verificó el total de cada equipo (`FR-070b`). */
prueba('"panel/S-05f" el recuento de formación en vivo coincide con el del motor recién generado', () => {
  const { cargarMotor } = require('./harness');
  const motor = cargarMotor({ puntaje: { enabled: true, params: { diferenciaMaxima: 2, ventajaSinArquero: 0 } } });
  const JP = (id, principal, scores, secundarias) =>
    ({ id, nombre: id, apellido: '', principal, secundarias: secundarias || [], scores });
  const plantelMotor = [
    JP('ar1', 'Arquero', { Arquero: 8, Defensor: 6 }), JP('ar2', 'Arquero', { Arquero: 7 }),
    JP('df1', 'Defensor', { Defensor: 9 }), JP('df2', 'Defensor', { Defensor: 5 }),
    JP('df3', 'Defensor', { Defensor: 7, Volante: 6 }, ['Volante']), JP('df4', 'Defensor', { Defensor: 6 }),
    JP('df5', 'Defensor', { Defensor: 6.5 }), JP('df6', 'Defensor', { Defensor: 5.5 }),
    JP('vo1', 'Volante', { Volante: 8 }), JP('vo2', 'Volante', { Volante: 7, Defensor: 6 }, ['Defensor']),
    JP('vo3', 'Volante', { Volante: 6 }), JP('vo4', 'Volante', { Volante: 6.5 }),
    JP('vo5', 'Volante', { Volante: 7.5 }), JP('vo6', 'Volante', { Volante: 5 }),
    JP('de1', 'Delantero', { Delantero: 8 }), JP('de2', 'Delantero', { Delantero: 7 }),
  ];
  const porId = Object.fromEntries(plantelMotor.map(p => [p.id, p]));
  const extra = JP('vo7', 'Volante', { Volante: 6.2 }); // 17º convocado: la dupla ocupa un solo lugar
  plantelMotor.push(extra);
  porId[extra.id] = extra;
  P.__setPlayers(plantelMotor);
  const DUPLA = ['df1', 'df2'];
  ['generarEquiposEstrategia3', 'generarEquiposEstrategia4'].forEach(estrategia => {
    /* Con dupla y sin dupla: el caso con dupla es el que falló el 2026-09-10 —el recuento contaba
       a sus dos integrantes por separado, inflaba un equipo, el ajuste de "equipo corto" le
       regalaba un lugar al otro y ese otro figuraba con un puesto faltante que no le faltaba. */
    [false, true].forEach(conDupla => {
      let unidades = plantelMotor.slice(0, 16);
      const unidadPorId = {};
      if (conDupla) {
        const u = P.construirUnidadDupla(porId.df1, porId.df2);
        unidades = plantelMotor.filter(p => !DUPLA.includes(p.id)).concat([u]);
        unidadPorId[u.id] = DUPLA;
      }
      let r = motor[estrategia](unidades, [], {}, {}, FORMACION_8);
      if (conDupla) r = motor.expandirUnidadesEnResultado(r, unidadPorId);
      const m = {
        id: 'm1', convocados: plantelMotor.map(p => p.id), duplas: conDupla ? [DUPLA] : [], bloqueados: [],
        equipos: {
          blanco: r.blanco, negro: r.negro, sumaBlanco: r.sumaBlanco, sumaNegro: r.sumaNegro,
          posicionAsignada: r.posicionAsignada, estrategiaKey: estrategia,
          formacion: r.formacion, arquerosInfo: r.arquerosInfo, balanceLineas: r.balanceLineas,
        },
      };
      const etiqueta = `${estrategia}${conDupla ? ' con dupla' : ''}`;
      const vigente = P.faltantesDeFormacionVigente(m, porId);
      ['blanco', 'negro'].forEach(equipo => {
        eq(vigente[equipo].length === 0, r.formacion[equipo].cumplida,
          `${etiqueta}: el veredicto de cumplimiento del ${equipo} tiene que coincidir con el del motor`);
        eq([...vigente[equipo]].sort(), [...r.formacion[equipo].faltantes].sort(),
          `${etiqueta}: y los lugares faltantes del ${equipo} también`);
      });
    });
  });
});

prueba('"panel/S-05f" mover un jugador puede romper una formación que la generación cumplía', () => {
  /* Es el caso que motiva el recálculo: la línea decía "cumplida en ambos equipos" para siempre,
     porque leía la bandera que la generación había guardado. */
  const m = M(
    [['b1','Arquero',6],['b2','Defensor',6],['b3','Defensor',6],['b4','Defensor',6],
     ['b5','Volante',6],['b6','Volante',6],['b7','Volante',6],['b8','Delantero',6]],
    [['n1','Arquero',6],['n2','Defensor',6],['n3','Defensor',6],['n4','Defensor',6],
     ['n5','Volante',6],['n6','Volante',6],['n7','Volante',6],['n8','Delantero',6]]);
  eq(P.faltantesDeFormacionVigente(m, porIdDe(m)).blanco, [], 'recién generado, el Blanco tiene su 3-3-1 completo');
  P.moverUnJugadorDeEquipo(m, 'b2', 'negro');
  ok(P.faltantesDeFormacionVigente(m, porIdDe(m)).blanco.includes('Defensor'),
    'con un defensor menos, al Blanco le falta un lugar en defensa');
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
