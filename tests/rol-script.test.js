#!/usr/bin/env node
/* Tests del script de roles (tools/rol.js, feature "rol en el token"). Se corren con:
 *
 *     node tests/rol-script.test.js
 *
 * Cubren lo que el script DECIDE, que es lo que se puede probar sin credenciales ni red: que
 * ningún camino de rechazo escriba, que el listado señale las cuentas sin rol, y que el claim y
 * el registro salgan siempre de la misma función. Lo que necesita un proyecto Firebase de verdad
 * —que la escritura llegue, que dos corridas solapadas queden coherentes— vive en
 * tests/reglas.test.js, que sí pide credenciales de staging.
 *
 * El SDK entra por parámetro (Implementation Plan, TD-09), así que acá se le inyecta un doble que
 * registra cada escritura en una lista. Es lo que vuelve verificable "no escribió NADA": no
 * alcanza con que la función tire, hay que poder mirar que la lista quedó vacía.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, entre comillas y con el prefijo de
 * rebanada ("rol/S-04b"), que es la convención de binding que fija AGENTS.md: los gates del plan
 * lo buscan con grep, y un identificador en un comentario daría falso positivo.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { asignar, listar, validarRol, cargarSdk } = require('../tools/rol.js');

const SPEC = 'docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md';

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
/* Todos los casos del script son asíncronos —el núcleo devuelve promesas—, así que `prueba` los
   ENCOLA y el runner del final los espera en orden, para que la salida se siga leyendo de arriba
   hacia abajo. Es la única diferencia con el `prueba` sincrónico de tests/panel.test.js. */
const pendientes = [];
function prueba(titulo, fn) { pendientes.push({ titulo, fn }); }

/* ---------- doble del Admin SDK ----------
   Superficie mínima que usa tools/rol.js: getUser, getUserByEmail, setCustomUserClaims, listUsers
   y collection().doc().set(). Cada escritura queda anotada en `escrituras` con su tipo, para
   poder afirmar tanto QUÉ se escribió como que no se escribió NADA. */
function sdkFalso({ cuentas = [], fallaRegistro = false } = {}) {
  const escrituras = [];
  const usuarios = cuentas.map(c => ({ ...c, customClaims: c.customClaims || undefined }));
  const buscar = pred => {
    const u = usuarios.find(pred);
    if (!u) return Promise.reject(new Error('auth/user-not-found'));
    return Promise.resolve(u);
  };
  return {
    escrituras,
    usuarios,
    proyecto: 'proyecto-de-prueba',
    auth: {
      getUser: uid => buscar(u => u.uid === uid),
      getUserByEmail: email => buscar(u => u.email === email),
      setCustomUserClaims: async (uid, claims) => {
        escrituras.push({ tipo: 'claim', uid, claims });
        const u = usuarios.find(x => x.uid === uid);
        u.customClaims = claims;
      },
      /* Pagina de a `maxResults` como el Admin SDK real: sin `pageToken` cuando no quedan más. */
      listUsers: async (maxResults, pageToken) => {
        const desde = pageToken ? Number(pageToken) : 0;
        const hasta = desde + maxResults;
        const pagina = usuarios.slice(desde, hasta);
        return hasta < usuarios.length ? { users: pagina, pageToken: String(hasta) } : { users: pagina };
      },
    },
    firestore: {
      collection: col => ({
        doc: uid => ({
          set: async datos => {
            if (fallaRegistro) throw new Error('firestore no disponible');
            escrituras.push({ tipo: 'registro', col, uid, datos });
          },
        }),
      }),
    },
  };
}

const CUENTAS = [
  { uid: 'u-admin', email: 'admin@organizador-futbol.local' },
  { uid: 'u-jug', email: 'jugador@organizador-futbol.local', customClaims: { rol: 'jugador', jugadorId: 'p-7' } },
];

/* Corre `fn` y devuelve el error que tiró. Falla si NO tiró: un rechazo que no rechaza es
   exactamente la regresión que estos casos buscan. */
async function tira(fn, msg) {
  try { await fn(); }
  catch (e) { return e; }
  return fallar(msg);
}

console.log('\nScript de roles — tools/rol.js');
console.log(`Spec: ${SPEC}\n`);

/* ---------- rechazos: nada se escribe ---------- */

prueba('"rol/S-04b" un rol fuera del conjunto cerrado no escribe ni el claim ni el registro', async () => {
  const sdk = sdkFalso({ cuentas: CUENTAS });
  await tira(() => asignar(sdk, { cuenta: 'admin@organizador-futbol.local', rol: 'superadmin' }),
    'asignar con un rol inválido debería tirar');
  eq(sdk.escrituras, [], 'un rol inválido no debería dejar ninguna escritura (FR-023)');
});

prueba('"rol/TC-044" el conjunto cerrado se valida ANTES de resolver la cuenta', async () => {
  /* Sin cuentas en el doble: si la validación fuera después de buscar la cuenta, el error sería
     "no existe la cuenta" y no el del rol. El orden es lo que garantiza que un rol inválido no
     llegue nunca a tocar el proyecto. */
  const sdk = sdkFalso({ cuentas: [] });
  const e = await tira(() => asignar(sdk, { cuenta: 'quien@sea.local', rol: 'administrador' }),
    'debería tirar');
  ok(/Rol inválido/.test(e.message), `el error debería ser el del rol y no el de la cuenta: ${e.message}`);
  eq(sdk.escrituras, [], 'y no debería haber escrito nada');
});

prueba('"rol/TC-042" la comparación del rol es por igualdad exacta, sin normalizar la caja', async () => {
  for (const malo of ['Admin', 'ADMIN', 'administrador', 'jugador ', ' admin', 'Jugador']) {
    const e = await tira(() => Promise.resolve(validarRol(malo)), `validarRol(${JSON.stringify(malo)}) debería tirar`);
    ok(/Rol inválido/.test(e.message), `${JSON.stringify(malo)} debería ser inválido`);
  }
  eq(validarRol('admin'), 'admin', 'y "admin" exacto debería pasar');
  eq(validarRol('jugador'), 'jugador', 'y "jugador" exacto también');
});

prueba('"rol/TC-042" un rol ausente o de otro tipo no se interpreta como válido', async () => {
  for (const malo of [undefined, null, '', 0, true, ['admin'], { rol: 'admin' }]) {
    await tira(() => Promise.resolve(validarRol(malo)), `validarRol(${JSON.stringify(malo)}) debería tirar`);
  }
});

prueba('"rol/S-04c" una cuenta que no existe no deja ninguna escritura', async () => {
  const sdk = sdkFalso({ cuentas: CUENTAS });
  const e = await tira(() => asignar(sdk, { cuenta: 'fantasma@organizador-futbol.local', rol: 'admin' }),
    'asignar sobre una cuenta inexistente debería tirar');
  ok(/No existe la cuenta/.test(e.message), `el mensaje debería nombrar la cuenta: ${e.message}`);
  eq(sdk.escrituras, [], 'una cuenta inexistente no debería dejar ninguna escritura (FR-024)');
});

prueba('"rol/S-04d" sin llave en la ruta indicada, el script se interrumpe sin operar', async () => {
  const inexistente = path.join(os.tmpdir(), 'llave-que-no-existe-' + Date.now() + '.json');
  const e = await tira(() => Promise.resolve(cargarSdk(inexistente)), 'cargarSdk debería tirar');
  ok(/No existe la llave/.test(e.message), `el mensaje debería decir que la llave no está: ${e.message}`);
  ok(!fs.existsSync(inexistente), 'y no debería haber creado nada en esa ruta');
});

prueba('"rol/TC-045" no hay ningún camino sin credencial: la llave no tiene default', async () => {
  for (const vacia of [undefined, null, '']) {
    const e = await tira(() => Promise.resolve(cargarSdk(vacia)), `cargarSdk(${JSON.stringify(vacia)}) debería tirar`);
    ok(/Falta la llave/.test(e.message), `el mensaje debería pedir --llave: ${e.message}`);
  }
  /* Y el respaldo por entorno tampoco existe: con la variable que un SDK usaría por convención
     puesta, cargarSdk sigue exigiendo la ruta explícita. */
  const previo = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/lo-que-sea.json';
  try {
    const e = await tira(() => Promise.resolve(cargarSdk()), 'cargarSdk sin ruta debería seguir tirando');
    ok(/Falta la llave/.test(e.message), 'la variable de entorno no debería habilitar ningún modo degradado');
  } finally {
    if (previo === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = previo;
  }
});

prueba('"rol/TC-047" el error de una llave ilegible no vuelca su contenido', async () => {
  const ruta = path.join(os.tmpdir(), 'llave-rota-' + Date.now() + '.json');
  /* Un JSON roto que contiene algo que parece una clave privada: si el mensaje de error citara
     el fragmento que no parseó —que es lo que hace el JSON.parse nativo cuando se lo deja
     hablar— la credencial terminaría en la consola y en cualquier log que la recoja.

     El encabezado PEM se arma por partes a propósito: el gate de TC-047 del Implementation Plan
     rastrea el encabezado de una clave privada por todo el repositorio, y tenerlo acá como
     literal lo haría fallar para siempre por culpa del test que verifica justamente eso. */
  const PEM = '-----BEGIN ' + 'PRIVATE' + ' KEY-----';
  const secreto = `${PEM}MIIsecretoQUEnoDEBEsalir-----END ${PEM.slice(11)}`;
  fs.writeFileSync(ruta, `{ "private_key": "${secreto}", ROTO }`);
  try {
    const e = await tira(() => Promise.resolve(cargarSdk(ruta)), 'cargarSdk debería tirar con un JSON roto');
    ok(!e.message.includes(secreto), `el mensaje no debería contener la llave: ${e.message}`);
    ok(!e.message.includes(PEM), 'ni un fragmento de ella');
    ok(/no es un JSON válido/.test(e.message), `y sí debería decir qué pasó: ${e.message}`);
  } finally { fs.unlinkSync(ruta); }
});

/* ---------- escritura conjunta ---------- */

prueba('"rol/TC-013" el claim y el registro salen de la misma corrida, en ese orden', async () => {
  const sdk = sdkFalso({ cuentas: CUENTAS });
  const r = await asignar(sdk, { cuenta: 'admin@organizador-futbol.local', rol: 'admin' });

  eq(sdk.escrituras.map(e => e.tipo), ['claim', 'registro'],
    'primero el claim (fuente de verdad) y después el registro legible: al revés, una falla parcial dejaría la consola mintiendo');
  const [claim, registro] = sdk.escrituras;
  eq(claim.uid, 'u-admin', 'el claim va sobre el uid resuelto');
  eq(claim.claims, { rol: 'admin', jugadorId: null }, 'una cuenta admin no tiene jugador vinculado (FR-021)');
  eq(registro.col, 'userRoles', 'el registro legible es userRoles (D-05)');
  eq(registro.uid, 'u-admin', 'y su documento es el uid');
  eq(registro.datos, { rol: 'admin', jugadorId: null }, 'el registro refleja exactamente lo que quedó en el claim (FR-022)');
  eq(r, { uid: 'u-admin', email: 'admin@organizador-futbol.local', rol: 'admin', jugadorId: null },
    'y la función devuelve lo que dejó escrito');
});

prueba('"rol/TC-013" el jugador vinculado viaja en el claim y en el registro por igual', async () => {
  const sdk = sdkFalso({ cuentas: CUENTAS });
  await asignar(sdk, { cuenta: 'jugador@organizador-futbol.local', rol: 'jugador', jugadorId: 'p-42' });
  const [claim, registro] = sdk.escrituras;
  eq(claim.claims, { rol: 'jugador', jugadorId: 'p-42' }, 'el claim lleva el jugadorId (FR-021)');
  eq(registro.datos, { rol: 'jugador', jugadorId: 'p-42' }, 'y el registro el mismo valor (FR-022)');
});

prueba('"rol/S-04a" reasignar el mismo rol es idempotente y no rompe nada', async () => {
  const sdk = sdkFalso({ cuentas: CUENTAS });
  const primera = await asignar(sdk, { cuenta: 'jugador@organizador-futbol.local', rol: 'jugador', jugadorId: 'p-7' });
  const escriturasPrimera = sdk.escrituras.slice();
  const segunda = await asignar(sdk, { cuenta: 'jugador@organizador-futbol.local', rol: 'jugador', jugadorId: 'p-7' });
  eq(segunda, primera, 'la segunda corrida devuelve el mismo resultado que la primera (FR-028)');
  eq(sdk.escrituras.slice(2).map(e => ({ tipo: e.tipo, datos: e.datos || e.claims })),
     escriturasPrimera.map(e => ({ tipo: e.tipo, datos: e.datos || e.claims })),
     'y escribe exactamente lo mismo: el estado final no depende de cuántas veces se corrió');
});

prueba('"rol/S-04e" si el registro falla, el claim ya quedó escrito y la falla se propaga', async () => {
  /* El orden de TC-013 elige deliberadamente cuál de las dos inconsistencias posibles se acepta:
     el claim bien y el registro atrasado. Lo que NO se acepta es que la falla pase inadvertida. */
  const sdk = sdkFalso({ cuentas: CUENTAS, fallaRegistro: true });
  await tira(() => asignar(sdk, { cuenta: 'admin@organizador-futbol.local', rol: 'admin' }),
    'una falla al escribir el registro debería propagarse y no tragarse');
  eq(sdk.escrituras.map(e => e.tipo), ['claim'], 'el claim —la fuente de verdad— ya quedó bien');
  eq(sdk.usuarios.find(u => u.uid === 'u-admin').customClaims, { rol: 'admin', jugadorId: null },
    'y la cuenta quedó con el rol correcto, que es la inconsistencia inofensiva');
});

/* ---------- listado ---------- */

prueba('"rol/S-05" el listado informa el rol de cada cuenta y marca las que no tienen', async () => {
  const sdk = sdkFalso({ cuentas: [
    { uid: 'u-1', email: 'a@x.local', customClaims: { rol: 'admin', jugadorId: null } },
    { uid: 'u-2', email: 'b@x.local', customClaims: { rol: 'jugador', jugadorId: 'p-3' } },
    { uid: 'u-3', email: 'c@x.local' },
  ] });
  const cuentas = await listar(sdk);
  eq(cuentas, [
    { uid: 'u-1', email: 'a@x.local', rol: 'admin', jugadorId: null },
    { uid: 'u-2', email: 'b@x.local', rol: 'jugador', jugadorId: 'p-3' },
    { uid: 'u-3', email: 'c@x.local', rol: null, jugadorId: null },
  ], 'cada cuenta con su rol, y null en la que no tiene claim (FR-025, FR-026)');
  eq(sdk.escrituras, [], 'listar no escribe nada');
});

prueba('"rol/S-05" un claim con un rol desconocido se informa como sin rol, no como ese valor', async () => {
  const sdk = sdkFalso({ cuentas: [{ uid: 'u-1', email: 'a@x.local', customClaims: { rol: 'Admin' } }] });
  const cuentas = await listar(sdk);
  eq(cuentas[0].rol, null, 'el listado no debería inventar un rol que la aplicación no reconocería (TC-042)');
});

prueba('"rol/S-05a" sin cuentas huérfanas, el listado no tiene ninguna marcada', async () => {
  const sdk = sdkFalso({ cuentas: [
    { uid: 'u-1', email: 'a@x.local', customClaims: { rol: 'admin', jugadorId: null } },
    { uid: 'u-2', email: 'b@x.local', customClaims: { rol: 'jugador', jugadorId: 'p-3' } },
  ] });
  const cuentas = await listar(sdk);
  eq(cuentas.filter(c => c.rol === null).length, 0, 'ninguna cuenta sin rol');
  eq(cuentas.length, 2, 'y las dos siguen apareciendo en el listado');
});

prueba('"rol/S-05b" todas las cuentas sin rol, como queda un proyecto antes de la mudanza', async () => {
  const sdk = sdkFalso({ cuentas: [
    { uid: 'u-1', email: 'a@x.local' },
    { uid: 'u-2', email: 'b@x.local' },
    { uid: 'u-3', email: null },
  ] });
  const cuentas = await listar(sdk);
  eq(cuentas.map(c => c.rol), [null, null, null], 'ninguna tiene claim todavía');
  eq(cuentas[2].email, null, 'una cuenta sin email igual aparece, identificada por uid');
});

prueba('"rol/S-05" el listado pagina hasta agotar las cuentas', async () => {
  /* El proyecto tiene un puñado de cuentas, pero paginar mal se vería como "faltan cuentas" y no
     como un error: con un doble que corta en 1000 por página, 2500 cuentas prueban las tres
     vueltas del bucle. */
  const muchas = Array.from({ length: 2500 }, (_, i) => ({ uid: `u-${i}`, email: `u${i}@x.local` }));
  const sdk = sdkFalso({ cuentas: muchas });
  const cuentas = await listar(sdk);
  eq(cuentas.length, 2500, 'el listado debería traer todas las páginas');
  eq(cuentas[2499].uid, 'u-2499', 'incluida la última');
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
  console.log('\x1b[32m✓ ningún camino de rechazo escribe, y el claim y el registro salen juntos\x1b[0m\n');
})();
