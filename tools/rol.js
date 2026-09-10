#!/usr/bin/env node
/* Asignación y listado de roles de cuenta (feature "rol en el token").
 *
 * El rol de cada cuenta ("admin" / "jugador") viaja en los *custom claims* del token de Firebase
 * Auth, que es lo que leen la aplicación y las Firestore Security Rules. Un claim sólo se puede
 * escribir con el Admin SDK, o sea desde fuera del navegador: de ahí este script. Además del
 * claim —que es la fuente de verdad— mantiene el registro legible `userRoles/{uid}`, que ya no
 * lo lee nadie para decidir nada pero sigue siendo la única forma de ver los roles desde la
 * consola de Firebase (D-05, TC-013).
 *
 * El Admin SDK vive EXCLUSIVAMENTE acá (TC-003): no aparece en index.html ni es dependencia
 * versionada del repositorio. Se instala aparte, igual que Playwright:
 *
 *     npm i firebase-admin
 *
 * API del Admin SDK verificada contra la documentación oficial el 2026-09-09, sobre
 * firebase-admin 14.3.0 (cierra el marcador [UNVERIFIED] de A-07 del Implementation Plan):
 *   - getUser(uid) / getUserByEmail(email)  → UserRecord, o rechaza si la cuenta no existe
 *     https://firebase.google.com/docs/auth/admin/manage-users
 *   - setCustomUserClaims(uid, claims)      → SOBRESCRIBE los claims previos, no los mezcla.
 *     El payload no puede superar los 1000 bytes.
 *     https://firebase.google.com/docs/auth/admin/custom-claims
 *   - listUsers(maxResults, pageToken)      → { users, pageToken }. `maxResults` tiene 1000 de
 *     default y de máximo; cuando no quedan más páginas, no devuelve `pageToken`.
 *     https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.listusersresult
 *
 * Un detalle que la documentación NO deja ver y que hubo que comprobar sobre la versión instalada:
 * en la 14 la API con espacio de nombres murió. El `admin.auth()` / `admin.firestore()` /
 * `admin.credential.cert()` que aparece en casi todos los ejemplos de internet tira
 * `Cannot read properties of undefined`, porque el require de la raíz ya sólo trae lo de `app`.
 * Va la API modular: `firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore`.
 *
 * Uso:
 *   node tools/rol.js asignar <email|uid> <admin|jugador> [jugadorId] --llave=<ruta>
 *   node tools/rol.js listar --llave=<ruta>
 *
 * Ejemplos:
 *   node tools/rol.js asignar admin@organizador-futbol.local admin --llave=~/llaves/staging.json
 *   node tools/rol.js asignar jugador@organizador-futbol.local jugador p-12 --llave=~/llaves/prod.json
 *   node tools/rol.js listar --llave=~/llaves/staging.json
 *
 * La llave de cuenta de servicio NO tiene default y no se lee del entorno: sin --llave el script
 * termina con código 1 antes de tocar nada (TC-045). Da acceso total al proyecto, así que vive
 * fuera del repositorio y .gitignore la ignora explícitamente (TC-032). Su contenido nunca se
 * imprime, ni siquiera dentro de un mensaje de error (TC-047).
 *
 * El núcleo se exporta como módulo y recibe el SDK por parámetro; la CLI sólo arranca bajo
 * `require.main === module`. Es lo que le permite a tests/rol-script.test.js probar los casos de
 * rechazo con un doble inyectado, sin credenciales ni red (TD-09).
 */
const fs = require('fs');
const path = require('path');

/* Conjunto cerrado de roles. Es el mismo que declara index.html: si uno de los dos cambia, hay
   que cambiar el otro — no hay forma de compartir una constante entre el IIFE de la aplicación y
   un script de Node sin agregar un paso de build, que TC-002 prohíbe. */
const ROLES_VALIDOS = ['admin', 'jugador'];

/* El registro legible que este script mantiene al día. Ya no es fuente de verdad (lo es el
   claim), pero sigue siendo lo que se ve desde la consola de Firebase (D-05). */
const COLECCION_REGISTRO = 'userRoles';

/* Devuelve el rol si pertenece al conjunto cerrado; tira si no.
   La comparación es por igualdad exacta de string: `Admin`, `ADMIN` y `administrador` son
   inválidos, y un valor ausente no se interpreta como nada (TC-042, TC-044, FR-023). */
function validarRol(rol) {
  if (!ROLES_VALIDOS.includes(rol)) {
    throw new Error(`Rol inválido: ${JSON.stringify(rol)}. Los válidos son: ${ROLES_VALIDOS.join(', ')}.`);
  }
  return rol;
}

/* Inicializa el Admin SDK con la llave de la ruta indicada y devuelve el `sdk` que consumen
   `asignar` y `listar`. Exige la ruta: no hay modo sin credencial ni respaldo por variable de
   entorno (FR-027, TC-045).

   Ningún mensaje de error de acá incluye el CONTENIDO de la llave, sólo su ruta (TC-047): un
   `require` que falla al parsear un JSON puede citar el fragmento que lo rompió, así que se lee
   y se parsea a mano para poder controlar qué se dice. */
function cargarSdk(rutaLlave) {
  if (!rutaLlave) {
    throw new Error('Falta la llave de cuenta de servicio. Agregá --llave=<ruta al .json>.');
  }
  const abs = path.resolve(rutaLlave.replace(/^~(?=$|\/)/, process.env.HOME || '~'));
  if (!fs.existsSync(abs)) {
    throw new Error(`No existe la llave de cuenta de servicio en: ${abs}`);
  }
  let credencial;
  try {
    credencial = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    throw new Error(`La llave de ${abs} no es un JSON válido.`);
  }
  if (!credencial.project_id || !credencial.private_key || !credencial.client_email) {
    throw new Error(`La llave de ${abs} no parece una llave de cuenta de servicio de Firebase ` +
      '(le faltan project_id, private_key o client_email).');
  }

  /* API MODULAR, no la vieja con espacio de nombres. En firebase-admin 14 el `admin.auth()` /
     `admin.firestore()` / `admin.credential.cert()` de los ejemplos viejos ya no existe: el
     require de la raíz sólo trae lo de `app` (initializeApp, cert), y auth y firestore salen de
     sus propios subpaths. Comprobado sobre 14.3.0 instalado, no deducido de la documentación. */
  let app, authMod, firestoreMod;
  try {
    app = require('firebase-admin/app');
    authMod = require('firebase-admin/auth');
    firestoreMod = require('firebase-admin/firestore');
  } catch (e) {
    /* El mensaje nombra la raíz del proyecto porque `npm i` hay que correrlo ahí: el
       `node_modules` del repositorio es el que este script consume. Node resuelve las
       dependencias desde la carpeta del SCRIPT, no desde el directorio actual, así que correr
       `node <ruta>/tools/rol.js` desde cualquier lado funciona igual. */
    const raiz = path.resolve(__dirname, '..');
    throw new Error('No se pudo cargar firebase-admin. Es una dependencia externa al repositorio ' +
      '(TC-003), igual que Playwright:\n' +
      `    cd ${raiz} && npm i firebase-admin\n\n` +
      `  (detalle: ${e.message.split('\n')[0]})`);
  }

  /* La app de Firebase se nombra por proyecto y se REUSA si ya está abierta. `initializeApp` con
     un nombre que ya existe tira, y con eso `cargarSdk` no se podía llamar dos veces en el mismo
     proceso — que es exactamente lo que hace tests/reglas.test.js cuando un caso necesita el
     Admin SDK además del que abrió al arrancar. Se vio fallar así, con un mensaje que no dejaba
     claro que el problema era del script y no de las reglas que estaba probando. */
  const nombreApp = 'rol-' + credencial.project_id;
  const instancia = app.getApps().find(a => a.name === nombreApp) ||
    app.initializeApp({ credential: app.cert(credencial) }, nombreApp);
  return {
    proyecto: credencial.project_id,
    auth: authMod.getAuth(instancia),
    firestore: firestoreMod.getFirestore(instancia),
  };
}

/* Resuelve la cuenta por email o por uid. `cuenta` se toma como email si contiene "@", que es la
   forma en que el propietario las nombra (todas las cuentas del proyecto son email/password). */
async function buscarCuenta(sdk, cuenta) {
  if (!cuenta) throw new Error('Falta la cuenta (email o uid).');
  try {
    return cuenta.includes('@')
      ? await sdk.auth.getUserByEmail(cuenta)
      : await sdk.auth.getUser(cuenta);
  } catch (e) {
    throw new Error(`No existe la cuenta ${cuenta} en este proyecto.`);
  }
}

/* Asigna un rol a una cuenta: valida, resuelve la cuenta, estampa el claim y escribe el registro.
   FR-020, FR-021, FR-022, FR-024, FR-028, TC-013.

   El ORDEN de las dos escrituras importa y no es casual. Primero el claim, después el registro:
   si falla la segunda, la fuente de verdad ya quedó bien y lo que queda atrasado es el registro
   legible, que es la inconsistencia inofensiva. Al revés sería la peligrosa —la consola diría
   "admin" y la cuenta no lo sería (S-04e, AC-21).

   Las validaciones van TODAS antes de la primera escritura: un rechazo no deja nada escrito
   (TC-044).

   `jugadorId` sólo aplica al rol "jugador" (FR-021). Una cuenta "admin" no tiene jugador
   vinculado, así que se fuerza a null en vez de arrastrar lo que se haya pasado. */
async function asignar(sdk, { cuenta, rol, jugadorId } = {}) {
  validarRol(rol);
  const usuario = await buscarCuenta(sdk, cuenta);
  const vinculo = rol === 'jugador' ? (jugadorId || null) : null;

  const claims = { rol, jugadorId: vinculo };
  await sdk.auth.setCustomUserClaims(usuario.uid, claims);
  await sdk.firestore.collection(COLECCION_REGISTRO).doc(usuario.uid).set({ rol, jugadorId: vinculo });

  return { uid: usuario.uid, email: usuario.email || null, rol, jugadorId: vinculo };
}

/* Lista todas las cuentas del proyecto con el rol que tiene estampado cada una. `rol` es null
   cuando la cuenta no tiene claim, que es lo que hace visible el "sin rol" del listado
   (FR-025, FR-026).

   Pagina hasta agotar: `listUsers` devuelve como mucho 1000 por página y omite `pageToken`
   cuando no quedan más. El proyecto tiene un puñado de cuentas, pero paginar mal acá se vería
   como "faltan cuentas" y no como un error. */
async function listar(sdk) {
  const cuentas = [];
  let pageToken;
  do {
    const pagina = await sdk.auth.listUsers(1000, pageToken);
    for (const u of pagina.users) {
      const claims = u.customClaims || {};
      cuentas.push({
        uid: u.uid,
        email: u.email || null,
        rol: ROLES_VALIDOS.includes(claims.rol) ? claims.rol : null,
        jugadorId: claims.jugadorId || null,
      });
    }
    pageToken = pagina.pageToken;
  } while (pageToken);
  return cuentas;
}

/* ------------------------------------------------------------------------- CLI */

function imprimirListado(cuentas) {
  const anchoEmail = Math.max(5, ...cuentas.map(c => (c.email || c.uid).length));
  console.log('');
  for (const c of cuentas) {
    const quien = (c.email || c.uid).padEnd(anchoEmail);
    const rol = c.rol === null ? 'SIN ROL' : c.rol;
    const vinculo = c.jugadorId ? `  jugadorId=${c.jugadorId}` : '';
    console.log(`  ${quien}  ${rol.padEnd(8)}${vinculo}`);
  }
  /* Las cuentas sin rol se declaran SIEMPRE, aunque no haya ninguna: una sección que desaparece
     cuando está vacía se lee igual que una que no se calculó (S-05a, FR-026). */
  const huerfanas = cuentas.filter(c => c.rol === null);
  console.log('');
  console.log(huerfanas.length === 0
    ? `  ${cuentas.length} cuenta(s); ninguna sin rol asignado.`
    : `  ${cuentas.length} cuenta(s); ${huerfanas.length} sin rol asignado: ${huerfanas.map(c => c.email || c.uid).join(', ')}`);
  console.log('');
}

const USO = [
  'Uso:',
  '  node tools/rol.js asignar <email|uid> <admin|jugador> [jugadorId] --llave=<ruta>',
  '  node tools/rol.js listar --llave=<ruta>',
].join('\n');

async function main(argv) {
  const llave = (argv.find(a => a.startsWith('--llave=')) || '').slice(8);
  const libres = argv.filter(a => !a.startsWith('--'));
  const comando = libres[0];

  if (comando !== 'asignar' && comando !== 'listar') {
    throw new Error(`Comando desconocido: ${comando || '(ninguno)'}\n${USO}`);
  }

  /* La llave se exige ANTES de mirar el resto de los argumentos: sin credencial no hay ningún
     camino que opere, ni siquiera uno que falle más adelante por otra razón (TC-045). */
  const sdk = cargarSdk(llave);

  if (comando === 'listar') {
    const cuentas = await listar(sdk);
    console.log(`Roles del proyecto ${sdk.proyecto}:`);
    imprimirListado(cuentas);
    return;
  }

  const [, cuenta, rol, jugadorId] = libres;
  const r = await asignar(sdk, { cuenta, rol, jugadorId });
  console.log(`Listo en ${sdk.proyecto}: ${r.email || r.uid} → rol=${r.rol}` +
    (r.jugadorId ? `, jugadorId=${r.jugadorId}` : '') + ` (uid ${r.uid})`);
  console.log('El rol nuevo aplica a partir del siguiente token que obtenga la cuenta (FR-031).');
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(e => {
    console.error(`\n  ${e.message}\n`);
    process.exit(1);
  });
}

module.exports = { asignar, listar, validarRol, cargarSdk, ROLES_VALIDOS, COLECCION_REGISTRO };
