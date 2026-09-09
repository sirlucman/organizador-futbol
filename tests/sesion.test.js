#!/usr/bin/env node
/* Tests de la resolución del rol desde el claim del token (feature "rol en el token"). Se corren:
 *
 *     node tests/sesion.test.js
 *
 * Cubren lo que `resolveSession()` DECIDE, que es lo que no se puede ver desde el DOM: qué rol
 * queda en `window.session` para cada forma que puede tener el claim, cuántas veces se refresca el
 * token, y que no exista código que lea una pista del rol. Lo que sí necesita píxeles —que la
 * barra de solapas se pinte una sola vez, que el loader entre a 360 px— vive en
 * tests/layout.test.js.
 *
 * Recorta las declaraciones de index.html por NOMBRE con `extraer` de harness.js, igual que
 * panel.test.js, y le inyecta un `user` falso cuyo `getIdTokenResult(forzado)` devuelve claims
 * distintos según se pida o no un token nuevo: es lo que vuelve unitario el corte (S-11), que en
 * la realidad depende de una sesión abierta desde antes del cambio.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas y con el prefijo de
 * rebanada ("rol/S-10a"), que es la convención de binding que fija AGENTS.md: los gates del plan
 * lo buscan con grep, y un identificador en un comentario daría falso positivo.
 */
const fs = require('fs');
const path = require('path');
const { extraer } = require('./harness');

const SPEC = 'docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md';
const INDEX = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');

/* En orden de dependencia. `refrescoIntentado` entra en la lista porque es la bandera que acota
   el refresco (TC-046): sin recortarla, el sandbox no la tendría declarada y el código no
   evaluaría — que es exactamente el aviso que se quiere si alguien la borra. */
const DECLARACIONES = [
  'ROLES_VALIDOS',
  'refrescoIntentado',
  'resolveSession',
  'isAdmin',
  'DOCS_SOLO_ADMIN',
  'iniciarLecturas',
];

/* El sandbox necesita `window` (resolveSession escribe `window.session`) y un `console.error` que
   no ensucie la salida del test: el camino de error de S-01c loguea a propósito, y verlo entre los
   ✓ haría parecer que algo se rompió. Los mensajes quedan guardados para poder afirmar sobre
   ellos. */
function cargarSesion() {
  const cuerpo = DECLARACIONES.map(n => extraer(src, n)).join('\n\n');
  const prelude = `
    const window = { session: { rol: 'jugador', jugadorId: null } };
    const __errores = [];
    const console = { error: (...a) => __errores.push(a.join(' ')), log: () => {} };
    /* iniciarLecturas() lo llama por cada clave; lo que devuelva no importa acá, sólo
       importa QUÉ claves pide. */
    function pedirDoc(clave){ return Promise.resolve(null); }
  `;
  const exports = `return { ${DECLARACIONES.join(', ')}, window, __errores,
    __refrescoIntentado: () => refrescoIntentado };`;
  try {
    return new Function(`${prelude}\n${cuerpo}\n${exports}`)();
  } catch (e) {
    throw new Error(`El código extraído de index.html no evaluó: ${e.message}`);
  }
}

/* Un `user` de Firebase Auth falso. `primero` son los claims del token que la cuenta ya tiene;
   `refresco` los del token nuevo. `llamadas` registra cada pedido con su bandera de forzado, que
   es sobre lo que se afirma TC-046. */
function userFalso({ primero = {}, refresco = {}, refrescoFalla = false } = {}) {
  const llamadas = [];
  return {
    llamadas,
    uid: 'u-test',
    getIdTokenResult: async (forzado) => {
      llamadas.push(!!forzado);
      if (forzado) {
        if (refrescoFalla) throw new Error('no se pudo refrescar el token');
        return { claims: refresco };
      }
      return { claims: primero };
    },
  };
}

/* ---------- helpers de aserción (copiados de tests/panel.test.js: la convención del repo es
     duplicarlos, no factorizarlos) ---------- */
function fallar(msg) { throw new Error(msg); }
const ok = (cond, msg) => { if (!cond) fallar(msg); };
const eq = (actual, esperado, msg) => {
  const a = JSON.stringify(actual), e = JSON.stringify(esperado);
  if (a !== e) fallar(`${msg}\n      esperado: ${e}\n      obtenido: ${a}`);
};

let pasaron = 0;
const fallos = [];
/* Los casos son asíncronos —`resolveSession` devuelve una promesa—, así que `prueba` los encola y
   el runner del final los espera en orden, para que la salida se lea de arriba hacia abajo. */
const pendientes = [];
function prueba(titulo, fn) { pendientes.push({ titulo, fn }); }

/* Resuelve con un sandbox NUEVO en cada caso: `refrescoIntentado` es estado de módulo, y
   compartirlo entre casos haría que el orden de ejecución cambiara los resultados. */
async function resolver(opciones) {
  const S = cargarSesion();
  const user = userFalso(opciones);
  await S.resolveSession(user);
  return { S, user, sesion: S.window.session, esAdmin: S.isAdmin() };
}

console.log('\nResolución del rol desde el claim del token');
console.log(`Spec: ${SPEC}\n`);

/* ---------- el camino feliz ---------- */

prueba('"rol/S-01a" un token con el claim resuelve admin sin pedir ningún refresco', async () => {
  const r = await resolver({ primero: { rol: 'admin', jugadorId: null } });
  eq(r.sesion, { rol: 'admin', jugadorId: null }, 'window.session queda en admin');
  ok(r.esAdmin, 'isAdmin() dice que sí');
  eq(r.user.llamadas, [false], 'un solo pedido de token, sin forzar: leer el claim no toca la red (NFR-001)');
});

prueba('"rol/S-01a" una cuenta jugador resuelve con su jugador vinculado', async () => {
  const r = await resolver({ primero: { rol: 'jugador', jugadorId: 'p-7' } });
  eq(r.sesion, { rol: 'jugador', jugadorId: 'p-7' }, 'el jugadorId sale del claim (FR-003)');
  ok(!r.esAdmin, 'y no es admin');
  eq(r.user.llamadas, [false], 'sin refresco');
});

prueba('"rol/S-03a" un claim jugadorId nulo o ausente deja el jugador sin vínculo', async () => {
  for (const claims of [{ rol: 'jugador', jugadorId: null }, { rol: 'jugador' }, { rol: 'jugador', jugadorId: '' }]) {
    const r = await resolver({ primero: claims });
    eq(r.sesion, { rol: 'jugador', jugadorId: null },
      `un claim ${JSON.stringify(claims)} resuelve jugador sin vínculo`);
  }
});

prueba('"rol/S-01a" un claim jugadorId sobre una cuenta admin no se arrastra', async () => {
  /* Una cuenta admin no tiene Jugador vinculado (data-model de 007). Si un claim viejo trajera
     uno, arrastrarlo dejaría `window.session` con una forma que el resto de la interfaz no
     espera. */
  const r = await resolver({ primero: { rol: 'admin', jugadorId: 'p-9' } });
  eq(r.sesion, { rol: 'admin', jugadorId: null }, 'admin siempre sin jugadorId');
});

/* ---------- fail-closed: nada que no sea exactamente "admin" da admin ---------- */

prueba('"rol/S-10" un token sin claim resuelve jugador sin vínculo y sin avisar nada', async () => {
  const r = await resolver({ primero: {}, refresco: {} });
  eq(r.sesion, { rol: 'jugador', jugadorId: null }, 'fail-closed: jugador sin vínculo (FR-007)');
  eq(r.S.__errores, [], 'y en silencio: sin claim no es una falla, es una cuenta sin rol (AC-22)');
});

prueba('"rol/S-10a" un claim rol vacío se trata como jugador', async () => {
  const r = await resolver({ primero: { rol: '' } });
  eq(r.sesion, { rol: 'jugador', jugadorId: null }, 'la cadena vacía no es un rol válido');
  eq(r.user.llamadas, [false], 'y no dispara refresco: el claim está, sólo trae algo que no reconocemos (TC-046)');
});

prueba('"rol/S-10b" un claim con un valor desconocido se trata como jugador', async () => {
  for (const malo of ['Admin', 'ADMIN', 'administrador', 'root', ' admin', 'admin ']) {
    const r = await resolver({ primero: { rol: malo } });
    eq(r.sesion, { rol: 'jugador', jugadorId: null }, `el claim ${JSON.stringify(malo)} no debería dar admin`);
  }
});

prueba('"rol/TC-042" la comparación del claim es por igualdad exacta, sin coerción', async () => {
  /* Un claim que no es string no debe entrar por coerción: `['admin']` compara igual que 'admin'
     con `==`, y un objeto con toString podría colarse si la comparación fuera laxa. */
  for (const malo of [['admin'], { toString: () => 'admin' }, 1, true]) {
    const r = await resolver({ primero: { rol: malo } });
    eq(r.sesion.rol, 'jugador', `un claim ${JSON.stringify(malo)} no debería resolver admin`);
  }
});

prueba('"rol/TC-043" ninguna forma de claim ausente, vacío o desconocido da admin', async () => {
  const formas = [{}, { rol: undefined }, { rol: null }, { rol: '' }, { rol: 'Admin' },
                  { rol: 'administrador' }, { rol: 0 }, { rol: false }, { rol: {} }];
  for (const primero of formas) {
    const r = await resolver({ primero, refresco: primero });
    ok(!r.esAdmin, `isAdmin() debería ser false para ${JSON.stringify(primero)}`);
    eq(r.sesion.rol, 'jugador', `y el rol jugador para ${JSON.stringify(primero)}`);
  }
});

prueba('"rol/TC-043" sin objeto user, la sesión queda en el rol más restringido', async () => {
  for (const user of [null, undefined, {}, { uid: 'u' }]) {
    const S = cargarSesion();
    await S.resolveSession(user);
    eq(S.window.session, { rol: 'jugador', jugadorId: null },
      `un user ${JSON.stringify(user)} no debería dar admin`);
  }
});

/* ---------- el corte: refresco del token ---------- */

prueba('"rol/S-11a" sin claim, el refresco lo trae y el rol resuelve admin', async () => {
  const r = await resolver({ primero: {}, refresco: { rol: 'admin', jugadorId: null } });
  eq(r.sesion, { rol: 'admin', jugadorId: null }, 'resuelve con el token nuevo (FR-006, FR-030)');
  eq(r.user.llamadas, [false, true], 'un pedido normal y UN refresco forzado');
});

prueba('"rol/S-11b" si el refresco tampoco trae el claim, resuelve jugador en silencio', async () => {
  const r = await resolver({ primero: {}, refresco: {} });
  eq(r.sesion, { rol: 'jugador', jugadorId: null }, 'jugador sin vínculo (FR-007)');
  eq(r.user.llamadas, [false, true], 'se intentó el refresco una vez');
  eq(r.S.__errores, [], 'y no se avisa nada: la cuenta simplemente no fue estampada (AC-22)');
});

prueba('"rol/S-01c" si el refresco falla, resuelve jugador sin romperse', async () => {
  const r = await resolver({ primero: {}, refrescoFalla: true });
  eq(r.sesion, { rol: 'jugador', jugadorId: null }, 'fail-closed ante el error de red');
  eq(r.S.__errores.length, 1, 'y esto SÍ se loguea: un refresco que falla es una falla, no una cuenta sin rol');
});

prueba('"rol/S-11c" [property] el refresco forzado ocurre a lo sumo una vez por carga de página', async () => {
  /* La propiedad es sobre CUALQUIER secuencia de resoluciones dentro de la misma página: un
     cambio de cuenta, un logout y login, varias llamadas seguidas. Se prueban 40 secuencias al
     azar sobre el MISMO sandbox, que es lo que representa una sola carga de página. */
  const S = cargarSesion();
  const posibles = [{}, { rol: 'admin' }, { rol: 'jugador', jugadorId: 'p-1' }, { rol: 'Admin' }, { rol: '' }];
  let forzados = 0;
  let semilla = 7;
  const azar = n => (semilla = (semilla * 1103515245 + 12345) % 2147483648) % n;
  for (let i = 0; i < 40; i++) {
    const user = userFalso({ primero: posibles[azar(posibles.length)], refresco: posibles[azar(posibles.length)] });
    await S.resolveSession(user);
    forzados += user.llamadas.filter(Boolean).length;
  }
  ok(forzados <= 1, `en 40 resoluciones el refresco forzado debería ocurrir a lo sumo una vez, ocurrió ${forzados} (TC-046)`);
  ok(S.__refrescoIntentado() === (forzados === 1),
    'y la bandera refleja si se intentó: es lo que acota el refresco, no un contador aparte');
});

prueba('"rol/TC-046" agotado el único refresco, un claim que aparece después ya no se busca', async () => {
  /* Es la contracara de S-11c y la razón por la que el límite es aceptable: si la cuenta se
     estampa DESPUÉS de esa única oportunidad, el rol nuevo entra en el próximo token que Firebase
     renueve solo, o al recargar la página. No se reintenta indefinidamente (CWE-770). */
  const S = cargarSesion();
  const primerUser = userFalso({ primero: {}, refresco: {} });
  await S.resolveSession(primerUser);
  eq(primerUser.llamadas, [false, true], 'la primera resolución gasta el refresco');

  const segundoUser = userFalso({ primero: {}, refresco: { rol: 'admin' } });
  await S.resolveSession(segundoUser);
  eq(segundoUser.llamadas, [false], 'la segunda ya no lo pide, aunque el refresco habría traído admin');
  eq(S.window.session, { rol: 'jugador', jugadorId: null }, 'y la sesión se queda en jugador hasta la próxima carga');
});

prueba('"rol/S-11" con el claim presente no se toca la red ni una vez de más', async () => {
  /* Es la mitad de NFR-001 que se puede probar sin navegador: el camino feliz no tiene ningún
     pedido forzado, o sea ningún round-trip. El tiempo lo mide layout.test.js. */
  const S = cargarSesion();
  for (const rol of ['admin', 'jugador', 'admin']) {
    const user = userFalso({ primero: { rol, jugadorId: null } });
    await S.resolveSession(user);
    eq(user.llamadas, [false], `resolver ${rol} no debería forzar ningún token`);
  }
  ok(!S.__refrescoIntentado(), 'y la bandera del refresco sigue sin gastarse');
});

/* ---------- las lecturas salen del rol resuelto ---------- */

prueba('"rol/S-01d" con el rol admin resuelto se piden los documentos sólo-admin', async () => {
  const S = cargarSesion();
  eq(Object.keys(S.iniciarLecturas(true)).sort(),
     ['players', 'partidos', 'playersSortMode'].concat(S.DOCS_SOLO_ADMIN).sort(),
     'admin pide los públicos más los seis sólo-admin (FR-009)');
});

prueba('"rol/S-03" con el rol jugador no se pide ningún documento sólo-admin', async () => {
  const S = cargarSesion();
  const claves = Object.keys(S.iniciarLecturas(false));
  eq(claves.sort(), ['players', 'partidos', 'playersSortMode'].sort(), 'sólo los públicos');
  eq(claves.filter(k => S.DOCS_SOLO_ADMIN.includes(k)), [], 'ninguno de los sólo-admin');
});

/* ---------- aserciones sobre la fuente ----------
   Es la única forma de probar la AUSENCIA de un camino de código. Mismo mecanismo que usa
   panel.test.js (`src.match(...)` sobre index.html). */

prueba('"rol/S-21a" [failure] no existe código que lea una pista del rol del navegador', async () => {
  for (const nombre of ['ROL_HINT_KEY', 'leerRolHint', 'guardarRolHint', 'rolHint']) {
    ok(!src.includes(nombre),
      `index.html no debería mencionar ${nombre}: el rol sale del token, no de localStorage (FR-008, D-12)`);
  }
});

prueba('"rol/NFR-005" no queda nada cuya única razón fuera adelantarse a la lectura del rol', async () => {
  /* La pista era lo único, y su rastro más difícil de ver es el `uid` que `iniciarLecturas`
     recibía para consultarla: si volviera a recibir un uid, la pista estaría de vuelta. */
  const decl = extraer(src, 'iniciarLecturas');
  ok(/function iniciarLecturas\(esAdmin\)/.test(decl),
    `iniciarLecturas debería recibir el rol resuelto y no un uid (TD-05): ${decl.split('\n')[0]}`);
  ok(!/localStorage/.test(decl), 'y no debería tocar localStorage');
});

prueba('"rol/FR-032" no queda ningún camino que resuelva el rol leyendo userRoles', async () => {
  /* AC-04b: `userRoles` puede seguir nombrado en un comentario —explica de dónde viene el rol—
     pero no en una línea ejecutable. Se filtran los comentarios de línea y de bloque. */
  const sinComentarios = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  ok(!sinComentarios.includes('userRoles'),
    'ninguna línea ejecutable de index.html debería nombrar userRoles (FR-032, TC-012)');
});

prueba('"rol/TC-010" ninguna función de interfaz lee el token, el claim ni Firebase Auth', async () => {
  /* El desacople es el punto del diseño: el rol se accede por `window.session` / `isAdmin()`, y
     que venga de un token es un detalle del que el resto de la interfaz no se enteró. Se verifica
     contando dónde aparecen las lecturas de token: sólo dentro de resolveSession. */
  const decl = extraer(src, 'resolveSession');
  const enTodoElArchivo = (src.match(/getIdTokenResult|\.claims\b/g) || []).length;
  const enResolveSession = (decl.match(/getIdTokenResult|\.claims\b/g) || []).length;
  eq(enTodoElArchivo, enResolveSession,
    'todas las lecturas del token deberían estar dentro de resolveSession, y no hay ninguna afuera');
  const authDirecto = (src.match(/firebase\.auth\(\)/g) || []).length;
  eq(authDirecto, 1, 'firebase.auth() sólo se llama una vez, al armar el wrapper window.auth');
});

prueba('"rol/TC-010" el contrato de window.session y de isAdmin() no cambió', async () => {
  const S = cargarSesion();
  eq(Object.keys(S.window.session).sort(), ['jugadorId', 'rol'], 'window.session sigue teniendo los dos campos');
  eq(/function isAdmin\(\)\{ return window\.session\.rol === 'admin'; \}/.test(extraer(src, 'isAdmin')), true,
    'isAdmin() sigue siendo la misma comparación exacta (D-11)');
});

prueba('"rol/TC-002" no se agregó ningún SDK, build ni dependencia al cliente', async () => {
  const scripts = src.match(/<script src="[^"]+"/g) || [];
  eq(scripts.length, 3, `index.html debería seguir cargando exactamente los 3 <script> del CDN: ${scripts.join(', ')}`);
  ok(scripts.every(s => s.includes('firebasejs/11.0.2')), 'los tres siguen siendo del SDK compat 11.0.2');
  ok(!src.includes('firebase-admin'), 'y el Admin SDK no aparece en la aplicación (TC-003)');
});

/* ---------- salida ---------- */

(async () => {
  for (const { titulo, fn } of pendientes) {
    try { await fn(); pasaron++; console.log(`  \x1b[32m✓\x1b[0m ${titulo}`); }
    catch (e) {
      fallos.push({ titulo, error: e });
      console.log(`  \x1b[31m✗\x1b[0m ${titulo}`);
      console.log(`      ${e.message.split('\n').join('\n      ')}`);
    }
  }
  console.log('');
  if (fallos.length) {
    console.log(`\x1b[31m✗ ${fallos.length} fallo(s) — Pasaron: ${pasaron}\x1b[0m\n`);
    process.exit(1);
  }
  console.log(`Pasaron: ${pasaron}/${pasaron}`);
  console.log('\x1b[32m✓ el rol sale del claim, nada que no sea "admin" da admin, y el refresco está acotado\x1b[0m\n');
})();
