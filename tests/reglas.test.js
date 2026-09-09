#!/usr/bin/env node
/* Test de integración de la feature "rol en el token", contra el proyecto Firebase de STAGING.
 *
 *     node tests/reglas.test.js                  sin credenciales avisa y NO falla
 *     REGLAS_STRICT=1 node tests/reglas.test.js  en CI: la ausencia de credenciales sí falla
 *
 * Es el único test del repo que toca un proyecto Firebase de verdad, y no se puede evitar: lo que
 * verifica —que el claim llegue a la cuenta, y que las Security Rules publicadas autoricen leyendo
 * ese claim— no existe dentro del repositorio. Las reglas no están versionadas: se publican a mano
 * desde la consola de cada proyecto, así que la única forma de saber qué dicen es preguntárselo al
 * proyecto. tests/rol-script.test.js cubre con dobles todo lo que sí se puede probar sin red.
 *
 * Sigue el patrón de salteo de tests/layout.test.js: sin credenciales avisa y devuelve 0, para no
 * romperle la corrida a quien sólo quiere correr el motor; con REGLAS_STRICT=1 la ausencia falla,
 * que es lo que conviene en CI, donde un test que nunca corre se lee como que todo anda.
 *
 * Credenciales, todas del entorno (nunca del repositorio):
 *
 *   ROL_TEST_LLAVE           ruta a la llave de cuenta de servicio de STAGING (la del Admin SDK)
 *   ROL_TEST_ADMIN_USER      email de una cuenta admin de staging
 *   ROL_TEST_ADMIN_PASS      su contraseña
 *   ROL_TEST_JUGADOR_USER    email de una cuenta jugador de staging
 *   ROL_TEST_JUGADOR_PASS    su contraseña
 *
 * La llave habilita los casos del SCRIPT (§7.2 del Implementation Plan); los cuatro de cuenta
 * habilitan los casos de las REGLAS (§7.4), que entran por la API REST y no por el SDK: así el
 * test no agrega ninguna dependencia instalable más allá del Admin SDK, que el script ya pide.
 *
 * Cada caso lleva su identificador de la Spec en el TÍTULO, con el prefijo de rebanada
 * ("rol/S-04"), que es la convención de binding que fija AGENTS.md.
 *
 * IMPORTANTE: este test ESCRIBE en staging (estampa claims sobre una cuenta de prueba). No apuntar
 * ROL_TEST_LLAVE a la llave de producción.
 */
const { asignar, listar } = require('../tools/rol.js');

const SPEC = 'docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md';

/* Proyecto de staging, mismo config que usa index.html cuando el hostname no es el de producción
   (index.html:1334-1341). La apiKey de un proyecto Firebase es pública por diseño —viaja en el
   HTML publicado— y no autoriza nada por sí sola: quien autoriza son las reglas, que es
   justamente lo que este test verifica. */
const PROYECTO = 'organizador-futbol-staging';
const API_KEY = 'AIzaSyD43vH2kraPrPyU3YyhoZl-1H0oNzOTNUc';

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
const pendientes = [];
function prueba(titulo, fn) { pendientes.push({ titulo, fn }); }

/* ---------- entrada por REST, sin SDK de cliente ----------
   Identity Toolkit y Firestore tienen API REST, y las Security Rules se aplican igual que por el
   SDK: el token de la cuenta viaja como Bearer y la regla lee sus claims. Entrar por acá evita
   instalar el SDK de cliente sólo para el test, que sería una segunda dependencia externa. */
async function entrar(email, password) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(`No se pudo entrar como ${email}: ${cuerpo.error && cuerpo.error.message}`);
  return { idToken: cuerpo.idToken, refreshToken: cuerpo.refreshToken, uid: cuerpo.localId };
}

/* Canjea el refresh token por uno nuevo. Es el equivalente por REST de getIdTokenResult(true) del
   cliente: es lo que hace que un claim recién estampado aparezca sin cerrar sesión (FR-031). */
async function refrescar(refreshToken) {
  const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(`No se pudo refrescar el token: ${cuerpo.error && cuerpo.error.message}`);
  return cuerpo.id_token;
}

/* Los claims viajan en el payload del JWT, que es base64url sin cifrar. No se verifica la firma
   acá a propósito: quien la verifica es Firebase del otro lado, y lo que este test quiere saber es
   qué dice el token que la cuenta acaba de recibir. */
function claimsDe(idToken) {
  const payload = idToken.split('.')[1];
  return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
}

/* ---------- credenciales ---------- */
const LLAVE = process.env.ROL_TEST_LLAVE;
const CUENTAS_TEST = {
  admin: { user: process.env.ROL_TEST_ADMIN_USER, pass: process.env.ROL_TEST_ADMIN_PASS },
  jugador: { user: process.env.ROL_TEST_JUGADOR_USER, pass: process.env.ROL_TEST_JUGADOR_PASS },
};
const HAY_LLAVE = !!LLAVE;
const HAY_CUENTAS = !!(CUENTAS_TEST.admin.user && CUENTAS_TEST.admin.pass &&
                       CUENTAS_TEST.jugador.user && CUENTAS_TEST.jugador.pass);

const FALTAN = [
  !HAY_LLAVE && 'ROL_TEST_LLAVE (habilita los casos del script)',
  !HAY_CUENTAS && 'ROL_TEST_ADMIN_USER/PASS y ROL_TEST_JUGADOR_USER/PASS (habilitan los casos de las reglas)',
].filter(Boolean);

/* El salteo es PARCIAL a propósito: la llave y las cuentas habilitan grupos de casos distintos, y
   quien tiene una sola de las dos cosas puede correr su mitad. Lo que no se admite es que un
   grupo entero no corra en silencio — con REGLAS_STRICT=1 cualquier credencial que falte falla. */
if (FALTAN.length) {
  const msg = `faltan credenciales de staging:\n    ${FALTAN.join('\n    ')}\n` +
    'Sin ellas no hay forma de verificar que el claim llegue ni qué autorizan las reglas\n' +
    'publicadas: las reglas no viven en el repositorio, se publican a mano desde la consola.';
  if (process.env.REGLAS_STRICT) { console.error('FALLA: ' + msg); process.exit(1); }
  if (!HAY_LLAVE && !HAY_CUENTAS) {
    console.log('SALTEADO — ' + msg);
    console.log('\n(exit 0: la ausencia de credenciales no es una regresión. REGLAS_STRICT=1 la convierte en falla.)');
    process.exit(0);
  }
  console.log('PARCIAL — ' + msg + '\n');
}

/* ---------- casos del script (Rama 1) ---------- */

if (HAY_LLAVE) {
  const { cargarSdk } = require('../tools/rol.js');
  const sdk = cargarSdk(LLAVE);
  ok(sdk.proyecto === PROYECTO,
    `la llave de ROL_TEST_LLAVE es del proyecto "${sdk.proyecto}" y este test escribe: sólo se admite ${PROYECTO}`);

  /* Una cuenta dedicada al test, para no pisar el rol de las cuentas que usa el propietario.
     Se crea la primera vez y se reusa después. */
  const EMAIL_TEST = 'rol-test@organizador-futbol.local';
  let uidTest = null;

  async function cuentaDePrueba() {
    if (uidTest) return uidTest;
    try {
      uidTest = (await sdk.auth.getUserByEmail(EMAIL_TEST)).uid;
    } catch (e) {
      uidTest = (await sdk.auth.createUser({ email: EMAIL_TEST, password: 'rol-test-' + Date.now() })).uid;
    }
    return uidTest;
  }
  async function claimsVivos(uid) { return (await sdk.auth.getUser(uid)).customClaims || {}; }
  async function registroVivo(uid) {
    const doc = await sdk.firestore.collection('userRoles').doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  prueba('"rol/S-04" asignar un rol deja el claim escrito y el registro reflejándolo', async () => {
    const uid = await cuentaDePrueba();
    await asignar(sdk, { cuenta: EMAIL_TEST, rol: 'admin' });
    eq(await claimsVivos(uid), { rol: 'admin', jugadorId: null }, 'el claim quedó en la cuenta (FR-020)');
    eq(await registroVivo(uid), { rol: 'admin', jugadorId: null }, 'y el registro legible dice lo mismo (FR-022, TC-013)');
  });

  /* Este caso necesita las dos cosas: la llave para estampar y las credenciales para entrar. */
  if (HAY_CUENTAS) prueba('"rol/S-04" el rol asignado aparece en el token siguiente, sin cerrar sesión', async () => {
    /* Es FR-031 medido y no afirmado: el claim se estampa del lado servidor y el token nuevo que
       la cuenta obtiene por refresco ya lo trae. Se usa la cuenta admin del propietario, que es de
       la que se tienen credenciales de ingreso. */
    const uid = (await sdk.auth.getUserByEmail(CUENTAS_TEST.admin.user)).uid;
    const antes = await claimsVivos(uid);
    const sesion = await entrar(CUENTAS_TEST.admin.user, CUENTAS_TEST.admin.pass);
    await asignar(sdk, { cuenta: CUENTAS_TEST.admin.user, rol: 'admin' });
    const nuevo = await refrescar(sesion.refreshToken);
    eq(claimsDe(nuevo).rol, 'admin', 'el token refrescado trae el claim recién estampado (FR-031, S-11a)');
    /* Se deja como estaba si tenía otra cosa: este test no debe cambiar el rol de una cuenta real. */
    if (antes.rol && antes.rol !== 'admin') await sdk.auth.setCustomUserClaims(uid, antes);
  });

  prueba('"rol/S-04a" reasignar el mismo rol es idempotente contra el proyecto real', async () => {
    const uid = await cuentaDePrueba();
    await asignar(sdk, { cuenta: EMAIL_TEST, rol: 'jugador', jugadorId: 'p-test' });
    const claim1 = await claimsVivos(uid), registro1 = await registroVivo(uid);
    await asignar(sdk, { cuenta: EMAIL_TEST, rol: 'jugador', jugadorId: 'p-test' });
    eq(await claimsVivos(uid), claim1, 'el claim quedó igual después de la segunda corrida (FR-028)');
    eq(await registroVivo(uid), registro1, 'y el registro también');
  });

  prueba('"rol/S-04e" dos corridas solapadas dejan claim y registro coherentes entre sí', async () => {
    const uid = await cuentaDePrueba();
    /* Sin await entre las dos: se lanzan a la vez y se espera a las dos juntas, que es lo que hace
       el propietario cuando corre el script dos veces sin pensarlo. TC-013 no promete cuál de las
       dos gana; promete que el claim y el registro terminen diciendo lo mismo. */
    await Promise.all([
      asignar(sdk, { cuenta: EMAIL_TEST, rol: 'admin' }),
      asignar(sdk, { cuenta: EMAIL_TEST, rol: 'jugador', jugadorId: 'p-test' }),
    ]);
    const claim = await claimsVivos(uid), registro = await registroVivo(uid);
    ok(['admin', 'jugador'].includes(claim.rol), `el rol final es una de las dos corridas: ${claim.rol}`);
    eq(registro, { rol: claim.rol, jugadorId: claim.jugadorId || null },
      'y el registro coincide con el claim: nunca queda diciendo el rol de la otra corrida (TC-013)');
  });

  prueba('"rol/S-05" el listado contra el proyecto real informa el rol de cada cuenta', async () => {
    const uid = await cuentaDePrueba();
    const cuentas = await listar(sdk);
    ok(cuentas.length > 0, 'el proyecto tiene al menos una cuenta');
    const fila = cuentas.find(c => c.uid === uid);
    ok(fila, 'la cuenta de prueba aparece en el listado (FR-025)');
    eq(fila.rol, (await claimsVivos(uid)).rol || null, 'y su rol es el que tiene estampado');
    ok(cuentas.every(c => c.rol === null || ['admin', 'jugador'].includes(c.rol)),
      'ninguna cuenta informa un rol fuera del conjunto cerrado (FR-026)');
  });
}

/* ---------- casos de las reglas (Rama 3) ----------
   Se agregan en feature/rol-en-el-token-reglas, cuando las reglas nuevas estén publicadas: hasta
   entonces las reglas viejas siguen resolviendo el rol con su get() sobre userRoles y estos casos
   medirían el mecanismo que la feature reemplaza. Los helpers de entrada por REST de arriba son
   los que van a usar. */

/* ---------- salida ---------- */

(async () => {
  console.log('\nRol en el token — integración contra staging');
  console.log(`Spec: ${SPEC} · proyecto: ${PROYECTO}\n`);
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
  /* Cero casos corridos no es "todo bien": es que las credenciales que había no habilitaban
     ninguno. Decirlo en verde sería exactamente el salteo silencioso que el patrón evita. */
  if (pendientes.length === 0) {
    console.log('\x1b[33m! ningún caso corrió: las credenciales presentes no habilitan ninguno\x1b[0m\n');
    process.exit(process.env.REGLAS_STRICT ? 1 : 0);
  }
  console.log(`Pasaron: ${pasaron}/${pasaron}`);
  console.log('\x1b[32m✓ el claim llega a la cuenta y el registro lo refleja\x1b[0m\n');
  process.exit(0);
})();
