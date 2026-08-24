/* Harness de tests del motor de generación de equipos.
 *
 * El motor vive dentro del IIFE de index.html y no exporta nada, así que no se puede
 * importar. En vez de duplicar el código (que dejaría de probar el motor real) o de
 * refactorizar index.html, este harness recorta del archivo las declaraciones que le
 * pide por NOMBRE y las evalúa en un sandbox con lo mínimo alrededor.
 *
 * Se recorta por nombre y no por número de línea a propósito: mover código dentro de
 * index.html no rompe los tests; renombrar o borrar una de estas funciones sí, y ahí
 * el test falla con un mensaje claro, que es el aviso que se quiere.
 */
const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'index.html');

/* Avanza desde `i` hasta el final de la declaración, saltando comentarios y strings
   para que las llaves que aparecen dentro de ellos no descuadren el conteo. */
function finDeDeclaracion(src, i, esFuncion) {
  let depth = 0, visto = false;
  while (i < src.length) {
    const c = src[i], sig = src[i + 1];
    if (c === '/' && sig === '/') { i = src.indexOf('\n', i); if (i === -1) return src.length; continue; }
    if (c === '/' && sig === '*') { const f = src.indexOf('*/', i); i = f === -1 ? src.length : f + 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const abre = c; i++;
      while (i < src.length && src[i] !== abre) { i += src[i] === '\\' ? 2 : 1; }
      i++; continue;
    }
    if (c === '{' || c === '(' || c === '[') { depth++; visto = true; }
    else if (c === '}' || c === ')' || c === ']') {
      depth--;
      if (depth === 0 && esFuncion && visto && c === '}') return i + 1;
    }
    else if (!esFuncion && depth === 0 && (c === ';' || c === '\n')) return i;
    i++;
  }
  return src.length;
}

function extraer(src, nombre) {
  const re = new RegExp(`\\n[ \\t]*(function|const|let)[ \\t]+${nombre}\\b`);
  const m = re.exec(src);
  if (!m) throw new Error(`No se encontró la declaración de "${nombre}" en index.html. ` +
    `Si se renombró o se movió a otro archivo, hay que actualizar tests/harness.js.`);
  const desde = m.index + 1;
  const hasta = finDeDeclaracion(src, desde, m[1] === 'function');
  return src.slice(desde, hasta) + (m[1] === 'function' ? '' : ';');
}

/* Todo lo que el motor necesita para correr, en orden de dependencia. */
const DECLARACIONES = [
  'POSITIONS',
  'CANCHAS',
  'computeAvg',
  'valorGeneralDe',
  'ventajaSinArquero',
  'objetivoDiferencia',
  'puntajeEnPosicion',
  'mejorPosicionAlternativa',
  'resolverArqueros',
  'asignarArquerosPorNiveles',
  'esDupla',
  'cupoDuplasPorEquipo',
  'repartirBucketBalanceado',
  'ORDEN_FORMACION',
  'FORMACION_KEY_POR_POSICION',
  'tieneScoreEnPosicion',
  'COSTO_DESCUBIERTA',
  'costoEncaje',
  'asignarPosicionesOptimo',
  'generarEquiposEstrategia1',
  'generarEquiposEstrategia2',
  'generarEquiposEstrategia3',
  'construirUnidadDupla',
  'expandirUnidadesEnResultado',
  'posicionAsignadaDe',
  'valorDePuntaje',
];

/* Construye el motor con una configuración de reglas dada.
   `config` acepta las claves de reglas y sus params, por ejemplo:
     { puntaje: { enabled: true, params: { diferenciaMaxima: 0, ventajaSinArquero: 6 } } }
   Las reglas que no se pasan quedan activas y sin params, que es el default del catálogo. */
function cargarMotor(config = {}) {
  const src = fs.readFileSync(INDEX, 'utf8');
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');

  const prelude = `
    const __config = arguments[0];
    function reglaEnabled(key){
      const r = __config[key];
      return r && r.enabled !== undefined ? !!r.enabled : true;
    }
    function reglaParam(key, pk){
      const r = __config[key];
      return r && r.params ? r.params[pk] : undefined;
    }
  `;
  const exports = `return { ${DECLARACIONES.join(', ')} };`;

  try {
    return new Function(`${prelude}\n${cuerpo}\n${exports}`)(config);
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}

module.exports = { cargarMotor, extraer, DECLARACIONES };
