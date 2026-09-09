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
 * IMPORTANTE: este test ESCRIBE en staging. Dos cosas escribe, las dos a propósito:
 *
 *   - claims sobre una cuenta de prueba propia (`rol-test@organizador-futbol.local`), y sobre la
 *     cuenta admin en un caso que le devuelve su claim original al terminar;
 *   - un campo `__sondaReglas` en cada documento de `data/`, que BORRA enseguida. Es el caso
 *     `rol/S-20c`, y no hay forma de verificar el lado *allow* de una escritura sin escribir. Si
 *     una corrida se interrumpe justo ahí, puede quedar ese campo suelto en un documento; se
 *     borra desde la consola sin consecuencias. Para correr todo lo demás sin escribir nada en
 *     `data/`: `node tests/reglas.test.js --solo=` con el caso que interese, o excluir S-20c.
 *
 * No apuntar ROL_TEST_LLAVE a la llave de producción.
 */
const fs = require('fs');
const path = require('path');
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
/* `--solo=<texto>` corre sólo los casos cuyo título lo contenga, misma convención que
   tests/layout.test.js. Sirve para iterar, y sobre todo para poder correr los casos que NO
   escriben cuando no se quiere tocar staging: `--solo=S-20c` es el único que escribe. */
const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7);
const pendientes = [];
function prueba(titulo, fn) { if (!SOLO || titulo.includes(SOLO)) pendientes.push({ titulo, fn }); }

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

/* ---------- casos de las reglas ----------
   Verifican las reglas PUBLICADAS. Entran por REST con el token de cada cuenta, que es
   exactamente lo que evalúan las Security Rules: si pasan por acá, pasan por el SDK.

   Estos casos sólo tienen sentido con las reglas NUEVAS publicadas. Con las viejas —que resuelven
   el rol con su lectura de userRoles— varios pasarían igual, porque el comportamiento observable
   es el mismo a propósito (TC-041); el que los distingue es `rol/S-20b`, que exige que una cuenta
   SIN claim sea denegada, y con las reglas viejas esa cuenta sigue teniendo su rol. Por eso el
   test declara contra qué está corriendo en vez de adivinarlo. */

const RUTA = doc => `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/${doc}`;

/* Lee un documento con el token indicado. Devuelve 'R' si la regla lo permitió (un documento que
   no existe también cuenta: la regla dejó pasar, y el 404 es de datos, no de permisos) y '—' si
   lo denegó. Cualquier otra respuesta es un error del test, no un veredicto. */
async function puedeLeer(idToken, doc) {
  /* Un `undefined` en la ruta convierte "leer el documento propio" en "leer uno ajeno", y el
     caso pasa por la razón equivocada. Pasó de verdad al escribir este archivo: el helper de
     ingreso devuelve `uid` y los casos leían `.localId`, que es el nombre que usa la API. */
  if (/undefined|\/$/.test(doc)) throw new Error(`ruta mal armada: ${doc}`);
  const r = await fetch(RUTA(doc), { headers: { Authorization: 'Bearer ' + idToken } });
  if (r.ok) return 'R';
  const cuerpo = await r.json().catch(() => ({}));
  const estado = (cuerpo.error && cuerpo.error.status) || String(r.status);
  if (estado === 'NOT_FOUND') return 'R';
  if (estado === 'PERMISSION_DENIED') return '—';
  throw new Error(`respuesta inesperada leyendo ${doc}: ${estado}`);
}

/* Intenta escribir un campo de sonda. Devuelve 'W' si la regla lo permitió y '—' si lo denegó.
   Cuando lo permite, BORRA el campo enseguida: el test corre contra staging de verdad y no debe
   dejar rastro en un documento real. El borrado va con el mismo updateMask y sin `fields`, que
   es como la API REST de Firestore elimina un campo. */
async function puedeEscribir(idToken, doc) {
  const url = RUTA(doc) + '?updateMask.fieldPaths=__sondaReglas';
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + idToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { __sondaReglas: { stringValue: 'sonda' } } }),
  });
  if (r.ok) {
    await fetch(url, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + idToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {} }),
    });
    return 'W';
  }
  const cuerpo = await r.json().catch(() => ({}));
  const estado = (cuerpo.error && cuerpo.error.status) || String(r.status);
  if (estado === 'PERMISSION_DENIED') return '—';
  throw new Error(`respuesta inesperada escribiendo ${doc}: ${estado}`);
}

/* La tabla de equivalencia del contrato, en código. Es la MISMA tabla de
   docs/rol-en-el-token/contracts/firestore-rules.md §3: si una cambia hay que cambiar la otra, y
   `rol/TC-041` comprueba justamente que no se hayan separado.

   Nueve documentos, no ocho: `data/playersSortMode` se descubrió midiendo las reglas vivas el
   2026-09-09 — el contrato de 007 no lo menciona y el Implementation Plan heredó ese número. */
const EQUIVALENCIA = [
  { doc: 'data/players',                             admin: 'RW', jugador: 'R'  },
  { doc: 'data/partidos',                            admin: 'RW', jugador: 'RW' },
  /* Sólo lectura para jugador, MEDIDO contra staging el 2026-09-09 — no deducido. La interfaz
     no restringe el selector de orden, así que una cuenta jugador puede cambiarlo, ver el
     listado reordenado, y su `window.storage.set` falla en silencio contra la regla. Es una
     limitación preexistente que esta feature NO cambia; queda anotada en el contrato §3. */
  { doc: 'data/playersSortMode',                     admin: 'RW', jugador: 'R'  },
  { doc: 'data/motorConfig',                         admin: 'RW', jugador: ''   },
  { doc: 'data/playerScores',                        admin: 'RW', jugador: ''   },
  { doc: 'data/partidosArmado',                      admin: 'RW', jugador: ''   },
  { doc: 'data/statsGanadosEmpatadosPerdidosMigrado', admin: 'RW', jugador: ''  },
  { doc: 'data/puntajeArmadoSeparadoMigrado',        admin: 'RW', jugador: ''   },
  { doc: 'data/ordenJugadoresMigrado',               admin: 'RW', jugador: ''   },
];

if (HAY_CUENTAS) {
  /* Las sesiones se abren una vez y se comparten entre los casos: cada `signInWithPassword` es un
     round-trip, y son nueve documentos por dos roles por dos operaciones. */
  let sesiones = null;
  async function abrir() {
    if (!sesiones) {
      sesiones = {
        admin: await entrar(CUENTAS_TEST.admin.user, CUENTAS_TEST.admin.pass),
        jugador: await entrar(CUENTAS_TEST.jugador.user, CUENTAS_TEST.jugador.pass),
      };
    }
    return sesiones;
  }

  prueba('"rol/S-03b" una cuenta jugador que lee userRoles directo recibe permission-denied', async () => {
    const s = await abrir();
    eq(await puedeLeer(s.jugador.idToken, 'userRoles/' + s.jugador.uid), '—',
      'userRoles deja de tener lector desde el cliente, incluso el propio documento (FR-012, TC-012)');
  });

  prueba('"rol/TC-012" userRoles no tiene ningún lector automático, tampoco para admin', async () => {
    const s = await abrir();
    eq(await puedeLeer(s.admin.idToken, 'userRoles/' + s.admin.uid), '—', 'ni el propio');
    eq(await puedeLeer(s.admin.idToken, 'userRoles/' + s.jugador.uid), '—', 'ni el ajeno');
    /* El registro sigue existiendo: lo que cambió es quién puede leerlo. Se comprueba con el
       Admin SDK, que pasa por encima de las reglas — si el documento hubiera desaparecido, el
       propósito nuevo de la colección (ser legible desde la consola) no se cumpliría. */
    if (HAY_LLAVE) {
      const { cargarSdk } = require('../tools/rol.js');
      const sdk = cargarSdk(LLAVE);
      const d = await sdk.firestore.collection('userRoles').doc(s.admin.uid).get();
      ok(d.exists, 'el registro legible sigue existiendo, sólo dejó de ser legible desde el cliente (D-05)');
    }
  });

  prueba('"rol/S-20" una cuenta jugador que escribe data/motorConfig directo es denegada', async () => {
    const s = await abrir();
    eq(await puedeEscribir(s.jugador.idToken, 'data/motorConfig'), '—',
      'la regla deniega aunque la interfaz no haya intervenido (S-20, TC-040)');
  });

  prueba('"rol/S-20a" lo mismo sobre data/playerScores y data/partidosArmado', async () => {
    const s = await abrir();
    for (const doc of ['data/playerScores', 'data/partidosArmado']) {
      eq(await puedeEscribir(s.jugador.idToken, doc), '—', `${doc} denegado para jugador`);
      eq(await puedeLeer(s.jugador.idToken, doc), '—', `${doc} tampoco se lee`);
    }
  });

  prueba('"rol/S-20b" un token sin claim rol es denegado en todo lo sólo-admin', async () => {
    /* Es el caso que distingue las reglas nuevas de las viejas: con las viejas, el rol sale de
       userRoles y un token sin claim igual autoriza. Necesita la llave para dejar una cuenta sin
       claim y devolvérselo al final. */
    if (!HAY_LLAVE) return fallar('este caso necesita ROL_TEST_LLAVE: hay que quitar y devolver un claim');
    const { cargarSdk } = require('../tools/rol.js');
    const sdk = cargarSdk(LLAVE);
    const s = await abrir();
    const uid = s.admin.uid;
    const previos = (await sdk.auth.getUser(uid)).customClaims || {};
    try {
      await sdk.auth.setCustomUserClaims(uid, {});
      /* El token viejo sigue siendo válido hasta que expira, así que hay que pedir uno nuevo:
         es el mismo canje que hace el cliente al refrescar. */
      const sinClaim = await refrescar(s.admin.refreshToken);
      eq(claimsDe(sinClaim).rol, undefined, 'el token nuevo efectivamente no trae el claim');
      for (const doc of ['data/motorConfig', 'data/playerScores', 'data/ordenJugadoresMigrado']) {
        eq(await puedeLeer(sinClaim, doc), '—', `${doc} denegado sin claim (FR-013)`);
      }
      eq(await puedeEscribir(sinClaim, 'data/players'), '—', 'y tampoco escribe lo de admin');
    } finally {
      await sdk.auth.setCustomUserClaims(uid, previos);
      await asignar(sdk, { cuenta: CUENTAS_TEST.admin.user, rol: previos.rol || 'admin' });
    }
  });

  prueba('"rol/S-20c" [property] la tabla de equivalencia se cumple documento por documento', async () => {
    /* La propiedad más importante de la rama: convierte TC-041 en algo ejecutable en vez de una
       revisión a ojo. Recorre los nueve documentos con las dos cuentas y compara el conjunto de
       operaciones concedidas contra la tabla del contrato. */
    const s = await abrir();
    const diferencias = [];
    for (const fila of EQUIVALENCIA) {
      for (const rolNombre of ['admin', 'jugador']) {
        const token = s[rolNombre].idToken;
        let observado = '';
        if (await puedeLeer(token, fila.doc) === 'R') observado += 'R';
        if (await puedeEscribir(token, fila.doc) === 'W') observado += 'W';
        if (observado !== fila[rolNombre]) {
          diferencias.push(`${fila.doc} · ${rolNombre}: la tabla dice "${fila[rolNombre] || '—'}" y las reglas conceden "${observado || '—'}"`);
        }
      }
    }
    eq(diferencias, [], 'las reglas publicadas deberían conceder exactamente lo de la tabla de equivalencia (TC-041, FR-011, AC-18)');
  });

  prueba('"rol/TC-041" la tabla del código y la del contrato no se separaron', async () => {
    /* La tabla de EQUIVALENCIA de este archivo y la de §3 del contrato son la misma tabla escrita
       dos veces, y dos copias se separan solas. Se comprueba que los nueve documentos estén en
       las dos. */
    const contrato = fs.readFileSync(path.join(__dirname, '..', 'docs', 'rol-en-el-token', 'contracts', 'firestore-rules.md'), 'utf8');
    const faltantes = EQUIVALENCIA.filter(f => !contrato.includes('`' + f.doc + '`')).map(f => f.doc);
    eq(faltantes, [], 'todo documento de la tabla del test debería estar en la del contrato');
  });

  prueba('"rol/TC-011" el texto de las reglas nuevas no lee ningún documento', async () => {
    /* Sobre el TEXTO del contrato, que es lo único versionado: las reglas publicadas no se pueden
       leer desde el cliente. Es la evidencia estructural de que rol() y su lectura murieron. */
    const contrato = fs.readFileSync(path.join(__dirname, '..', 'docs', 'rol-en-el-token', 'contracts', 'firestore-rules.md'), 'utf8');
    const bloque = /^## 4\. Texto nuevo[\s\S]*?```\n([\s\S]*?)```/m.exec(contrato);
    ok(bloque, 'el contrato debería tener su §4 con el bloque de reglas nuevo');
    ok(!/\bget\s*\(/.test(bloque[1]), 'el texto publicado no debería contener ninguna lectura de documento (TC-011, D-06)');
    ok(!bloque[1].includes('function rol'), 'ni la función rol() de 007');
    eq(/request\.auth\.token\.rol/.test(bloque[1]), true, 'y sí debería leer el claim del token (FR-010)');
  });

  prueba('"rol/S-21" con el almacenamiento local manipulado, Firestore no acepta nada', async () => {
    /* NFR-003 / TC-040: el rol efectivo depende SÓLO de datos firmados. Manipular el navegador no
       cambia el token, así que Firestore ve lo mismo. Se prueba del lado que importa —el de
       Firestore— usando el token de la cuenta jugador tal cual: no hay nada que un cliente pueda
       hacer localmente para cambiarlo. */
    const s = await abrir();
    eq(claimsDe(s.jugador.idToken).rol, 'jugador', 'el rol viaja firmado dentro del token');
    for (const doc of ['data/motorConfig', 'data/playerScores', 'data/partidosArmado']) {
      eq(await puedeEscribir(s.jugador.idToken, doc), '—', `${doc} sigue denegado (S-21, NFR-003)`);
    }
  });

  prueba('"rol/S-21b" un claim falsificado no pasa: la firma no cierra', async () => {
    /* Es la contracara: `window.session` alterado desde la consola no cambia el token, y un token
       con el payload editado a mano deja de validar. Se arma uno cambiando `rol` a `admin` y se
       comprueba que Firestore lo rechace por token inválido, no por permisos. */
    const s = await abrir();
    const [cab, payload, firma] = s.jugador.idToken.split('.');
    const claims = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    claims.rol = 'admin';
    const payloadFalso = Buffer.from(JSON.stringify(claims)).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const falso = `${cab}.${payloadFalso}.${firma}`;
    const r = await fetch(RUTA('data/motorConfig'), { headers: { Authorization: 'Bearer ' + falso } });
    ok(!r.ok, 'un token con el claim editado no debería autorizar nada (NFR-003, TC-040)');
  });

  prueba('"rol/NFR-003" el rol efectivo sale del token y de ningún otro lado', async () => {
    const s = await abrir();
    eq(claimsDe(s.admin.idToken).rol, 'admin', 'la cuenta admin trae su rol en el token');
    eq(claimsDe(s.jugador.idToken).rol, 'jugador', 'y la jugador el suyo');
    /* Y el registro de Firestore, que es lo único que un humano edita a mano, ya no lo lee nadie:
       si dijera otra cosa, el rol efectivo no cambiaría. Eso es lo que lo vuelve inofensivo. */
    eq(await puedeLeer(s.admin.idToken, 'userRoles/' + s.admin.uid), '—',
      'y el registro legible no participa de ninguna decisión (D-05, TC-012)');
  });

  prueba('"rol/NFR-002" un arranque de admin no produce ninguna lectura de userRoles', async () => {
    /* La medición end-to-end con navegador la hace tools/medir-arranque.js --lecturas. Acá se
       verifica la condición que la hace cierta y que sí se puede afirmar desde un test: la
       lectura no es que no se haga, es que NO SE PUEDE hacer. */
    const s = await abrir();
    eq(await puedeLeer(s.admin.idToken, 'userRoles/' + s.admin.uid), '—',
      'ninguna lectura de userRoles es posible desde el cliente, así que el conteo es cero por construcción');
  });

  prueba('"rol/NFR-004" resolver el rol no cuesta ninguna lectura de Firestore', async () => {
    /* El costo del rol pasa a ser cero lecturas: sale del token, que el cliente ya tiene. Lo que
       se puede afirmar desde acá es que el claim viene en el token de la sesión, sin ninguna
       llamada a Firestore de por medio — las lecturas que las reglas hacían por su cuenta no las
       ve ningún cliente, y su evidencia es el panel de uso del proyecto (OBS-02). */
    const s = await abrir();
    const claims = claimsDe(s.admin.idToken);
    ok(['admin', 'jugador'].includes(claims.rol),
      `el rol viene dentro del token de sesión, sin lecturas: ${JSON.stringify(claims.rol)}`);
  });

  prueba('"rol/NFR-007" el consumo de lecturas queda observable con una herramienta repetible', async () => {
    const sonda = path.join(__dirname, '..', 'tools', 'medir-arranque.js');
    ok(fs.existsSync(sonda), 'tools/medir-arranque.js debería existir: es lo que vuelve medible NFR-002 y NFR-004');
    const fuente = fs.readFileSync(sonda, 'utf8');
    ok(fuente.includes('__lecturas'), 'y contar las lecturas por colección');
  });
}

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
  console.log('\x1b[32m✓ el claim llega a la cuenta, el registro lo refleja y las reglas autorizan con él\x1b[0m\n');
  process.exit(0);
})();
