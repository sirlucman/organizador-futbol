#!/usr/bin/env node
/* Test de escapado de texto de jugador. Se corre con:
 *
 *     node tests/escapado.test.js
 *
 * AGENTS.md → Estilo fija una regla transversal: «Todo texto que venga de un jugador se escapa
 * antes de insertarse, tanto en contenido como en atributos». No es de ninguna Spec en
 * particular —la auditoría de conformidad del 2026-09-23 encontró cuatro superficies que la
 * violaban y ninguna tenía un ID que las cubriera— así que este caso NO lleva identificador de
 * Spec: no hay ninguno que satisfacer. Si alguna Spec adopta la regla como `TC-*`, el binding
 * va acá, en el título, como pide AGENTS.md → Tests.
 *
 * Es un test de fuente, no de comportamiento, con el mismo criterio que la verificación de
 * literales de color de tests/cancha.test.js: recorre `index.html` y exige que toda
 * interpolación de un nombre de jugador pase por `escaparHtml`. Cubre el archivo entero, así
 * que también atrapa la superficie que se escriba mañana, no sólo las cuatro que se arreglaron.
 *
 * Las excepciones se listan por NOMBRE DE FUNCIÓN, no por número de línea, para que mover
 * código no las invalide — y cada una trae su propia aserción de que sigue siendo segura
 * (`las excepciones siguen siendo seguras`). Una lista de excepciones que nadie revalida deja
 * de ser una excepción y pasa a ser un agujero.
 */
const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* Funciones que interpolan un nombre sin escapar de forma legítima, y por qué. */
const EXCEPCIONES = {
  formatearFormacionParaCopiar: 'arma texto plano para el portapapeles, no HTML',
  __deletePlayer: 'el mensaje va a openConfirm, que escribe con textContent',
  explicacionesDelArmado: 'las líneas se escapan al insertarse, en renderPorQueQuedaronAsi',
};

/* ---------- helpers de aserción (mismos que eventos.test.js) ---------- */
class FalloAssert extends Error {}
const fallar = msg => { throw new FalloAssert(msg); };
const ok = (cond, msg) => { if (!cond) fallar(msg); };

let pasaron = 0;
const fallos = [];
function prueba(titulo, fn) {
  try { fn(); pasaron++; console.log(`  \x1b[32m✓\x1b[0m ${titulo}`); }
  catch (e) {
    fallos.push(titulo);
    console.log(`  \x1b[31m✗\x1b[0m ${titulo}\n      ${e instanceof FalloAssert ? e.message : e.stack}`);
  }
}

/* ---------- utilidades ---------- */
/* Saca comentarios para no contar una mención en prosa como una interpolación real. */
function sinComentarios(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
          .split('\n').map(l => (/^\s*\/\//.test(l) ? '' : l)).join('\n');
}
/* Nombre de la función que contiene el offset dado. */
function funcionQueContiene(s, offset) {
  const antes = s.slice(0, offset).split('\n');
  for (let i = antes.length - 1; i >= 0; i--) {
    const m = /^  (?:async )?function ([A-Za-z_$][\w$]*)/.exec(antes[i])
           || /^  window\.(__[\w$]*) = function/.exec(antes[i]);
    if (m) return m[1];
  }
  return '(nivel superior)';
}
/* Cuerpo de una función, para poder afirmar cosas sobre ella. */
function cuerpoDe(nombre) {
  const re = new RegExp(`\\n  (?:async )?(?:function ${nombre}\\b|window\\.${nombre.replace(/\$/g, '\\$')} = function)`);
  const m = re.exec(src);
  ok(m, `no se encontró la función "${nombre}" en index.html (¿se renombró?)`);
  const desde = m.index;
  const fin = src.indexOf('\n  }', desde);
  return src.slice(desde, fin === -1 ? src.length : fin);
}

const limpio = sinComentarios(src);
const PRODUCTORES = ['fullName', 'nombreCorto'];

console.log('\nEscapado del texto que viene de un jugador (AGENTS.md → Estilo)\n');

prueba('ningún nombre de jugador se interpola en HTML sin pasar por escaparHtml', () => {
  const sinEscapar = [];
  for (const prod of PRODUCTORES) {
    const aguja = prod + '(';
    for (let i = limpio.indexOf(aguja); i !== -1; i = limpio.indexOf(aguja, i + 1)) {
      if (limpio.slice(i - 12, i) === 'escaparHtml(') continue;      // ya escapado
      /* Sólo interesa la interpolación en una plantilla (`${...}`) o la concatenación de
         cadenas (`... + fullName(p)`), que son las dos formas en que un nombre llega a
         innerHTML. Un uso como `normalize(fullName(p))` o `fullName(p).split(...)` calcula,
         no inyecta, y la declaración `function nombreCorto(p)` tampoco. */
      const previo = limpio.slice(0, i).replace(/\s+$/, '');
      const interpola = previo.endsWith('${') || previo.endsWith('+');
      if (!interpola) continue;
      const fn = funcionQueContiene(limpio, i);
      if (EXCEPCIONES[fn]) continue;
      const linea = limpio.slice(0, i).split('\n').length;
      sinEscapar.push(`index.html:${linea}  en ${fn}()  →  ${src.split('\n')[linea - 1].trim().slice(0, 90)}`);
    }
  }
  ok(sinEscapar.length === 0,
    `hay ${sinEscapar.length} interpolación(es) de nombre sin escapar:\n      ` + sinEscapar.join('\n      ') +
    `\n\n      Si la superficie no es HTML, agregá la función a EXCEPCIONES en este archivo, con su razón.`);
});

prueba('las excepciones siguen siendo seguras', () => {
  ok(/textContent = message/.test(cuerpoDe('openConfirm')),
    'openConfirm ya no escribe con textContent: __deletePlayer deja de ser una excepción válida');
  ok(!/innerHTML/.test(cuerpoDe('openConfirm')),
    'openConfirm pasó a usar innerHTML: __deletePlayer deja de ser una excepción válida');
  ok(/escaparHtml\(e\)/.test(cuerpoDe('renderPorQueQuedaronAsi')),
    'renderPorQueQuedaronAsi ya no escapa cada línea al insertarla: explicacionesDelArmado deja de ser una excepción válida');
  ok(!/innerHTML/.test(cuerpoDe('formatearFormacionParaCopiar')),
    'formatearFormacionParaCopiar escribe HTML: deja de ser una excepción válida');
  ok(/writeText\(/.test(cuerpoDe('__copiarFormacion')),
    'el resultado de formatearFormacionParaCopiar ya no va al portapapeles');
});

prueba('el término de búsqueda tampoco se interpola crudo en el vacío del autocompletado', () => {
  /* No es texto de un jugador sino lo que tecleó quien busca, así que queda fuera del barrido
     de arriba; es igualmente una inyección (sobre la propia sesión) y se arregló en el mismo
     commit, así que se cuida acá para que no vuelva. */
  const cuerpo = cuerpoDe('renderAutocomplete');
  const vacio = /ac-empty[\s\S]*?<\/div>/.exec(cuerpo);
  ok(vacio, 'no se encontró el estado vacío de renderAutocomplete');
  ok(!/\$\{term\}/.test(vacio[0]),
    `el término de búsqueda se interpola sin escapar en el estado vacío:\n      ${vacio[0].trim().slice(0, 120)}`);
  ok(/\$\{escaparHtml\(term\)\}/.test(vacio[0]),
    'el término de búsqueda debería pasar por escaparHtml');
});

prueba('escaparHtml neutraliza los cuatro caracteres que rompen HTML', () => {
  const m = /function escaparHtml[\s\S]*?\n  \}/.exec(src);
  ok(m, 'no se encontró escaparHtml en index.html');
  const escaparHtml = new Function(m[0] + '; return escaparHtml;')();
  const salida = escaparHtml('<img src=x onerror=alert(1)> "comilla" & <b>');
  ok(!/[<>]/.test(salida), `sobrevivió un < o un > sin escapar: ${salida}`);
  ok(!salida.includes('"'), `sobrevivió una comilla doble sin escapar: ${salida}`);
  ok(salida.includes('&amp;'), `el & no se escapó primero: ${salida}`);
});

/* ---------- salida ---------- */
console.log('');
if (fallos.length) {
  console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
  process.exit(1);
}
console.log(`Pasaron: ${pasaron}/${pasaron}`);
console.log('\x1b[32m✓ todo texto de jugador que llega al DOM pasa por escaparHtml\x1b[0m\n');
