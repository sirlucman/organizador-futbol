#!/usr/bin/env node
/* Tests de la cancha (rebanada 1 de "Equipos en el campo"). Se corren con:
 *
 *     node tests/cancha.test.js
 *
 * Cubren la parte de la cancha que NO necesita un navegador: agrupar las unidades de armado en
 * líneas, partir una línea de cinco o más en sub-filas, el nombre corto y el escapado. Lo que sí
 * necesita medir píxeles —que las camisetas entren, que no se superpongan, que el candado sea
 * alcanzable— vive en tests/layout.test.js.
 *
 * Como el motor, la cancha vive dentro del IIFE de index.html y no exporta nada. Se recortan las
 * declaraciones por NOMBRE con el mismo `extraer` que usa tests/harness.js, pero con lista propia:
 * el sandbox del motor no necesita nada de esto, y meterlas ahí acoplaría dos cosas que no se
 * tocan (Implementation Plan, TD-10).
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas y con guion
 * ("S-02a"), que es la convención de binding que fija AGENTS.md: los gates del plan lo buscan
 * con grep, y un identificador en un comentario daría falso positivo.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia, como en harness.js: ORDEN_LINEAS necesita ORDEN_FORMACION, y
   agruparEnLineasDeCancha necesita las dos más posicionAsignadaDe. */
const DECLARACIONES = [
  'ORDEN_FORMACION',
  'ORDEN_LINEAS',
  'MAX_POR_SUBFILA',
  'posicionAsignadaDe',
  'escaparHtml',
  'nombreCorto',
  'agruparEnLineasDeCancha',
  'partirLineaEnSubfilas',
];

function cargarCancha() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  try {
    return new Function(`${cuerpo}\nreturn { ${DECLARACIONES.join(', ')} };`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}
const C = cargarCancha();

/* ---------- helpers de aserción (mismos que motor.test.js) ---------- */
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
/* Un jugador mínimo, con lo único que la cancha le mira: id, nombre, posición principal. */
const J = (id, principal, nombre) => ({ id, principal, nombre: nombre || id, apellido: '' });
/* Un partido mínimo. `asignada` simula lo que deja el motor; sin él la cancha cae en la
   posición principal declarada, que es lo que pasa con la Estrategia 1. */
const M = (asignada) => ({ id: 'm1', equipos: asignada ? { posicionAsignada: asignada } : {} });
/* La cancha recibe GRUPOS (unidades de armado), no jugadores sueltos: un grupo de uno es un
   jugador, uno de dos es una dupla de rotación. */
const uno = j => [j];
const lineasDe = (m, grupos) => C.agruparEnLineasDeCancha(m, grupos).map(l => ({ pos: l.pos, n: l.unidades.length }));

console.log(`\nLa cancha — ${SPEC}\n`);
console.log('\x1b[1mAGRUPADO EN LÍNEAS\x1b[0m — el reparto de las camisetas sobre el campo\n');

prueba('"S-02" con la Estrategia 1 (sin posiciones asignadas) cada jugador cae en su posición declarada', () => {
  const grupos = [
    uno(J('a', 'Arquero')), uno(J('b', 'Defensor')), uno(J('c', 'Volante')), uno(J('d', 'Delantero')),
  ];
  eq(lineasDe(M(null), grupos),
     [{ pos: 'Delantero', n: 1 }, { pos: 'Volante', n: 1 }, { pos: 'Defensor', n: 1 }, { pos: 'Arquero', n: 1 }],
     'las cuatro líneas, en orden de dibujo: Ataque arriba, Arco abajo');
});

prueba('"S-01" la posición del motor gana sobre la principal declarada', () => {
  const j = J('x', 'Delantero');
  eq(lineasDe(M({ x: 'Arquero' }), [uno(j)]), [{ pos: 'Arquero', n: 1 }],
     'posicionAsignada del motor manda sobre p.principal');
});

prueba('"S-01b" una línea sin jugadores no se dibuja', () => {
  const grupos = [uno(J('b', 'Defensor')), uno(J('c', 'Volante')), uno(J('d', 'Delantero'))];
  const lineas = lineasDe(M(null), grupos);
  eq(lineas.map(l => l.pos), ['Delantero', 'Volante', 'Defensor'],
     'sin arquero asignado, la línea de Arco no aparece y el alto se reparte entre las tres');
});

prueba('"S-02c" un equipo sin ningún arquero no rompe el render', () => {
  const grupos = Array.from({ length: 8 }, (_, i) => uno(J('v' + i, 'Volante')));
  const lineas = lineasDe(M(null), grupos);
  eq(lineas.length, 1, 'una sola línea');
  eq(lineas[0], { pos: 'Volante', n: 8 }, 'los ocho volantes en la línea del Medio');
});

prueba('"S-01e" una unidad que no corresponde a ningún jugador no interrumpe el dibujo del resto', () => {
  /* La aplicación resuelve los ids con `players.find(...).filter(Boolean)`, así que un id que ya
     no existe llega como una lista más corta, no como `undefined`. Lo que se verifica es que el
     agrupado no dependa de que la cantidad sea la esperada. */
  const grupos = [uno(J('a', 'Arquero')), uno(J('b', 'Defensor'))];
  eq(lineasDe(M(null), grupos), [{ pos: 'Defensor', n: 1 }, { pos: 'Arquero', n: 1 }],
     'dibuja las dos unidades que sí existen');
});

prueba('"S-01" una posición fuera del catálogo cae al final y no rompe el orden', () => {
  const grupos = [uno(J('a', 'Arquero')), uno(J('z', 'Wing'))];
  eq(lineasDe(M(null), grupos).map(l => l.pos), ['Arquero', 'Wing'],
     'la posición desconocida queda debajo del arco, sin excepción');
});

prueba('"S-03" una dupla de rotación ocupa UNA sola posición en su línea', () => {
  const dupla = [J('d1', 'Volante'), J('d2', 'Volante')];
  const grupos = [dupla, uno(J('v', 'Volante'))];
  eq(lineasDe(M(null), grupos), [{ pos: 'Volante', n: 2 }],
     'dos unidades en el Medio: la dupla cuenta como una');
});

prueba('"S-03b" la dupla se ubica por la posición asignada de su PRIMER integrante', () => {
  const dupla = [J('d1', 'Volante'), J('d2', 'Delantero')];
  eq(lineasDe(M({ d1: 'Defensor' }), [dupla]), [{ pos: 'Defensor', n: 1 }],
     'la unidad va entera a una línea; no se parte entre dos');
});

prueba('"S-01" dos renderizados del mismo reparto dan el mismo orden', () => {
  const grupos = ['a', 'b', 'c'].map(id => uno(J(id, 'Volante')));
  const m = M(null);
  const primero = C.agruparEnLineasDeCancha(m, grupos)[0].unidades.map(u => u[0].id);
  const segundo = C.agruparEnLineasDeCancha(m, grupos)[0].unidades.map(u => u[0].id);
  eq(primero, segundo, 'el orden dentro de la línea es estable entre repintados');
  eq(primero, ['a', 'b', 'c'], 'y es el orden en que llegaron los grupos');
});

console.log('\n\x1b[1mSUB-FILAS\x1b[0m — el caso que el handoff no diseñó\n');

prueba('"S-01c" una línea de cuatro va en un solo renglón', () => {
  eq(C.partirLineaEnSubfilas([1, 2, 3, 4]).map(f => f.length), [4], 'sin partir');
});

prueba('"S-01d" una línea de cinco se parte en dos sub-filas, la de arriba con la mitad hacia arriba', () => {
  eq(C.partirLineaEnSubfilas([1, 2, 3, 4, 5]).map(f => f.length), [3, 2], 'tres arriba, dos abajo');
});

prueba('"S-02a" cinco volantes declarados producen la línea partida, no una fila de cinco', () => {
  const grupos = Array.from({ length: 5 }, (_, i) => uno(J('v' + i, 'Volante')));
  const linea = C.agruparEnLineasDeCancha(M(null), grupos)[0];
  eq(C.partirLineaEnSubfilas(linea.unidades).map(f => f.length), [3, 2],
     'es el caso real de la Estrategia 1, no uno hipotético');
});

prueba('"S-02b" los ocho titulares en la misma línea se parten en cuatro y cuatro', () => {
  eq(C.partirLineaEnSubfilas(Array.from({ length: 8 }, (_, i) => i)).map(f => f.length), [4, 4],
     'ninguna sub-fila supera las cuatro camisetas');
});

prueba('"S-02b" nueve en la misma línea siguen siendo dos sub-filas, no tres', () => {
  eq(C.partirLineaEnSubfilas(Array.from({ length: 9 }, (_, i) => i)).map(f => f.length), [5, 4],
     'FR-014 fija dos sub-filas; el ancho lo absorbe el escalón de medidas');
});

prueba('"S-01d" el corte no depende del contenido, sólo de cuántos son', () => {
  const cortos = C.partirLineaEnSubfilas(['a', 'b', 'c', 'd', 'e']).map(f => f.length);
  const largos = C.partirLineaEnSubfilas(['Maximiliano', 'Bartolomé', 'Juan Cruz', 'Leandro', 'Nicolás']).map(f => f.length);
  eq(cortos, largos, 'dos equipos con el mismo reparto se parten igual, con nombres largos o cortos');
});

console.log('\n\x1b[1mNOMBRE Y ESCAPADO\x1b[0m\n');

prueba('"S-01" el nombre de la camiseta es el primer nombre más la inicial del último apellido', () => {
  eq(C.nombreCorto({ nombre: 'Nicolás', apellido: 'Vallejos' }), 'Nicolás V.', 'caso típico');
  eq(C.nombreCorto({ nombre: 'Juan Cruz', apellido: 'de la Vega' }), 'Juan V.', 'apellido de varias palabras: la última identifica');
});

prueba('"S-01" un jugador sin apellido muestra sólo su nombre', () => {
  eq(C.nombreCorto({ nombre: 'Alfredo', apellido: '' }), 'Alfredo', 'el apellido es opcional en la ficha');
  eq(C.nombreCorto({ nombre: 'Fabian' }), 'Fabian', 'y puede no estar');
});

prueba('"S-20" un nombre con caracteres de marcado se muestra como texto literal', () => {
  eq(C.escaparHtml('Ana & <b>Luis</b>'), 'Ana &amp; &lt;b&gt;Luis&lt;/b&gt;', 'nada se interpreta como markup');
});

prueba('"S-20a" la comilla doble se escapa: es la que rompe un atributo', () => {
  /* No es un caso inventado: el plantel testigo de staging tiene a `Leandro "cuñado" Lauty`.
     Sin escapar, su title terminaría en `title="Leandro "cuñado" Lauty · Volante"` y el atributo
     se cortaría en la segunda comilla. */
  eq(C.escaparHtml('Leandro "cuñado" Lauty'), 'Leandro &quot;cuñado&quot; Lauty', 'la comilla no cierra el atributo');
});

prueba('"S-20b" una etiqueta de apertura de script no se ejecuta', () => {
  eq(C.escaparHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;', 'queda inerte');
});

prueba('"S-20" el ampersand se escapa primero, o se re-escaparían los otros tres', () => {
  eq(C.escaparHtml('&lt;'), '&amp;lt;', 'un texto que ya parece una entidad no se rompe');
});

prueba('"S-20" un nombre vacío o ausente no produce "undefined" sobre la camiseta', () => {
  eq(C.escaparHtml(undefined), '', 'undefined');
  eq(C.escaparHtml(null), '', 'null');
});

console.log('\n\x1b[1mDESIGN SYSTEM\x1b[0m — Principio VI\n');

prueba('"NFR-007" todo valor visual de la cancha sale de un token o de la lista de excepciones', () => {
  const ini = src.indexOf('/* ------------------------------------------------------------------ LA CANCHA');
  const fin = src.indexOf('  /* 900px: con dos columnas');
  ok(ini > 0 && fin > ini, 'no se encontró el bloque CSS de la cancha en index.html');
  const bloque = src.slice(ini, fin);

  /* Excepciones declaradas (Implementation Plan, TC-031). Son los tres colores del design system
     escritos en crudo porque llevan alfa, y `var()` no puede aportar el canal alfa de un token de
     color sólido sin un token de triple aparte que el sistema no define. */
  const HEX_PERMITIDOS = ['#ffffff', '#111827'];             // --chalk y --ink
  const RGB_PERMITIDOS = ['255 255 255', '17 24 39', '42 93 10']; // --chalk, --ink, --pitch-deep

  const hex = [...new Set(bloque.match(/#[0-9a-fA-F]{3,8}/g) || [])];
  const noDeclaradosHex = hex.filter(h => !HEX_PERMITIDOS.includes(h.toLowerCase()));
  eq(noDeclaradosHex, [], 'colores hexadecimales sin token ni excepción declarada');

  const rgb = [...new Set([...bloque.matchAll(/rgb\(\s*([0-9]+\s+[0-9]+\s+[0-9]+)/g)].map(m => m[1]))];
  const noDeclaradosRgb = rgb.filter(v => !RGB_PERMITIDOS.includes(v));
  eq(noDeclaradosRgb, [], 'colores rgb() sin token ni excepción declarada');

  const nombrados = [...new Set(bloque.match(/:\s*(red|blue|green|black|white|gray|grey)\b/g) || [])];
  eq(nombrados, [], 'colores por nombre CSS: nunca salen del design system');
});

/* ---------- resumen ---------- */
console.log(`\nPasaron: ${pasaron}/${pasaron + fallos.length}`);
if (fallos.length) {
  console.log(`\n\x1b[31m${fallos.length} caso(s) fallando.\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32m✓ la cancha agrupa, parte y escapa como fija la Spec\x1b[0m');
process.exit(0);
