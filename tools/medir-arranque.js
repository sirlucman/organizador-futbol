#!/usr/bin/env node
/* Sonda de arranque: cuánto tarda la barra de solapas en quedar pintada, y cuántas lecturas de
 * Firestore cuesta un arranque.
 *
 * Los tests responden "¿la barra se pinta completa?" sobre un doble sin red. Esto responde las dos
 * preguntas que un doble no puede: "¿CUÁNTO tarda contra Firebase de verdad?" y "¿CUÁNTAS lecturas
 * cuesta?". Las dos son requisitos cuantificados de la feature rol-en-el-token y ninguna se puede
 * verificar leyendo código (NFR-001, NFR-001b, NFR-002, NFR-004, NFR-007).
 *
 * Cómo mide las lecturas: envuelve `firebase.firestore` ANTES de que arranque la aplicación y
 * cuenta los `get` por colección. Es exacto porque la aplicación tiene exactamente tres puntos de
 * acceso a Firestore —`window.storage.get`, `window.storage.set` y, antes de esta feature,
 * `resolveSession`— y todos pasan por ahí. Lo que este conteo NO ve son los `get()` que hacen las
 * propias Security Rules: esos no los ejecuta el cliente. Para ésos la evidencia es estructural
 * (el texto publicado no contiene `get(`) más el panel de uso de la consola de Firebase.
 *
 * Cómo mide el tiempo: registra en cada frame si `#appRoot` está visible y qué solapas tiene, de
 * la misma forma que el registrador de tests/layout.test.js. De ahí salen las dos magnitudes:
 *
 *   hueco de la solapa      desde que la aplicación aparece hasta que la barra queda con su
 *                           composición final. Con esta feature es 0 por construcción: el rol se
 *                           resuelve ANTES de revelar appRoot (TD-02)
 *   arranque completo       desde el primer frame hasta la barra final. Es el hueco más lo que
 *                           tarde el refresco del token, y es la magnitud que NFR-001b acota
 *
 * Desde el 2026-09-10 el "arranque completo" incluye además la lectura a Firestore (~620 ms): la
 * aplicación se revela recién cuando loadAll() terminó de pintar, así que la barra de solapas y
 * los datos aparecen en el mismo frame. Por eso el objetivo de NFR-001b saltó de 600 a 2000 ms
 * sin que la aplicación se haya vuelto más lenta — lo que se movió es el instante que cierra la
 * medición. Lo que esta sonda NO ve, y es lo que el cambio compra, son los frames con la
 * aplicación visible y vacía: eso lo mide el escenario `carga` de tests/layout.test.js.
 *
 * Uso:
 *   node tools/medir-arranque.js --caso=vigente                 token vigente (NFR-001, AC-10)
 *   node tools/medir-arranque.js --caso=vencido                  token sin claim, con refresco (NFR-001b, AC-11)
 *   node tools/medir-arranque.js --caso=vigente --lecturas       sólo el conteo por colección (NFR-002, AC-12)
 *
 * Opciones:
 *   --caso=vigente|vencido  qué arranque medir (default: vigente)
 *   --corridas=3            cuántas veces, en contextos limpios. Se informa la MEDIANA
 *   --usuario= --password=  credenciales de staging. Sin ellas usa las de ROL_MEDIR_USER/PASS
 *   --lecturas              omite el cronómetro e informa sólo el conteo de lecturas
 *   --puerto=0              puerto del servidor local (0 = uno libre)
 *
 * Mide contra STAGING, no contra producción: sirve el index.html del repo por HTTP en 127.0.0.1, y
 * cualquier hostname que no sea el de GitHub Pages hace que la aplicación se conecte al proyecto
 * de staging (index.html:1326). Sólo lee; no escribe nada.
 *
 * El caso `vencido` no espera una hora: fuerza el camino del refresco vaciando el claim `rol` del
 * token que el SDK entrega la primera vez. Es el mismo intercambio de red contra el endpoint de
 * tokens que hace el SDK cuando el token expira solo — el mismo mecanismo, no la misma corrida, y
 * así está anotado en el marcador [UNVERIFIED] de NFR-001b.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

const arg = (nombre, def) => {
  const a = process.argv.find(x => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : def;
};
const flag = nombre => process.argv.includes(`--${nombre}`);

const CASO = arg('caso', 'vigente');
const CORRIDAS = Number(arg('corridas', 3));
const USUARIO = arg('usuario', process.env.ROL_MEDIR_USER);
const PASSWORD = arg('password', process.env.ROL_MEDIR_PASS);
const SOLO_LECTURAS = flag('lecturas');

if (!['vigente', 'vencido'].includes(CASO)) {
  console.error(`--caso debe ser "vigente" o "vencido", no ${JSON.stringify(CASO)}`);
  process.exit(1);
}
if (!USUARIO || !PASSWORD) {
  console.error('Faltan credenciales de staging. Pasalas con --usuario= --password=, o por\n' +
    'ROL_MEDIR_USER / ROL_MEDIR_PASS en el entorno. La sonda entra a la aplicación como una\n' +
    'persona: sin cuenta no hay arranque que medir.');
  process.exit(1);
}

/* Servir por HTTP y no abrir con file:// para que las rutas relativas de los assets resuelvan
   como en producción — mismo criterio que tests/layout.test.js. */
function servir() {
  const TIPOS = { '.html': 'text/html', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const abs = path.join(RAIZ, rel);
    if (!abs.startsWith(RAIZ) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs)] || 'application/octet-stream' });
    fs.createReadStream(abs).pipe(res);
  });
  return new Promise(resolve => server.listen(Number(arg('puerto', 0)), '127.0.0.1', () => resolve({ server, puerto: server.address().port })));
}

/* La sonda: se inyecta antes de que corra index.html. Envuelve `firebase.firestore` para contar
   los `get` por colección, opcionalmente vacía el claim del primer token, y muestrea el pintado
   frame a frame. */
function sonda({ vencido }) {
  window.__lecturas = {};
  window.__refrescos = 0;
  window.__pintados = [];
  window.__tAuth = null;
  window.__rol = null;

  /* Envuelve `firestore` para contar los `get` por colección. */
  const envolverFirestore = real => function (...args) {
    const db = real.apply(this, args);
    const collectionReal = db.collection.bind(db);
    db.collection = col => {
      const ref = collectionReal(col);
      const docReal = ref.doc.bind(ref);
      ref.doc = key => {
        const d = docReal(key);
        const getReal = d.get.bind(d);
        d.get = (...a) => { window.__lecturas[col] = (window.__lecturas[col] || 0) + 1; return getReal(...a); };
        return d;
      };
      return ref;
    };
    return db;
  };

  /* Envuelve `auth` para (1) marcar el instante en que onAuthChange entrega la cuenta, que es de
     donde arranca la magnitud que NFR-001b acota, (2) contar los refrescos forzados del token y
     (3) en el caso `vencido`, entregar el primer token sin el claim `rol`. */
  const envolverAuth = real => function (...args) {
    const auth = real.apply(this, args);
    const onReal = auth.onAuthStateChanged.bind(auth);
    auth.onAuthStateChanged = cb => onReal(user => {
      if (!user) return cb(user);
      if (window.__tAuth === null) window.__tAuth = performance.now();
      const getIdTokenResultReal = user.getIdTokenResult.bind(user);
      let primera = true;
      user.getIdTokenResult = async forzado => {
        if (forzado) window.__refrescos++;
        const r = await getIdTokenResultReal(forzado);
        window.__rol = (r.claims || {}).rol === undefined ? null : (r.claims || {}).rol;
        if (vencido && primera && !forzado) {
          primera = false;
          const claims = Object.assign({}, r.claims);
          delete claims.rol;
          window.__rol = null;
          return Object.assign({}, r, { claims });
        }
        return r;
      };
      return cb(user);
    });
    return auth;
  };

  /* El punto de intercepción es la ASIGNACIÓN de los globales, no un sondeo.
     Por qué: index.html carga los tres <script> del CDN y después corre su IIFE, que llama a
     `firebase.firestore()` de entrada. Entre lo uno y lo otro no hay ningún hueco de tarea, así
     que un `setTimeout` que espere a que `window.firebase` aparezca corre SIEMPRE tarde — la
     aplicación ya se quedó con la referencia sin envolver, y el contador de lecturas informaba
     cero para todo, que se lee igual que "no leyó nada". Pasó de verdad: la primera versión de
     esta sonda daba `0 refrescos` y `ninguna lectura` contra staging.
     Con `defineProperty` el envoltorio se aplica en el momento exacto en que cada script del CDN
     asigna su pieza (`firebase-app` define `firebase`; `firebase-auth` y `firebase-firestore` le
     cuelgan `auth` y `firestore` después), sin depender de ningún orden. */
  const envoltorios = { firestore: envolverFirestore, auth: envolverAuth };
  const interceptarPiezas = obj => {
    for (const clave of Object.keys(envoltorios)) {
      let real;
      try {
        Object.defineProperty(obj, clave, {
          configurable: true,
          get() { return real; },
          set(v) {
            /* Se envuelve la función y se le copian sus propiedades: el SDK cuelga cosas de ahí
               (`firebase.auth.Auth.Persistence.LOCAL`, que index.html usa), y perderlas rompe la
               aplicación en vez de medirla. */
            const envuelta = envoltorios[clave](v);
            Object.assign(envuelta, v);
            Object.setPrototypeOf(envuelta, Object.getPrototypeOf(v));
            real = envuelta;
          },
        });
      } catch (e) { /* si el SDK ya la definió como no configurable, se mide sin esa pieza */ }
    }
  };

  let firebaseInterno;
  Object.defineProperty(window, 'firebase', {
    configurable: true,
    get() { return firebaseInterno; },
    set(v) { firebaseInterno = v; interceptarPiezas(v); },
  });

  const muestrear = () => {
    const app = document.getElementById('appRoot');
    if (app) {
      window.__pintados.push({
        t: performance.now(),
        appVisible: app.style.display !== 'none' && app.offsetParent !== null,
        solapas: [...document.querySelectorAll('.tabs .tab-btn')].filter(b => b.offsetParent !== null).length,
      });
    }
    if (window.__pintados.length < 3000) requestAnimationFrame(muestrear);
  };
  requestAnimationFrame(muestrear);
}

/* Deriva las magnitudes de las muestras. `final` es la composición que la barra tiene al terminar:
   se compara contra ella y no contra un 3 fijo, para que la sonda sirva igual con una cuenta
   jugador. */
function magnitudes(pintados, tAuth) {
  if (!pintados.length) return null;
  const final = pintados[pintados.length - 1].solapas;
  const visibles = pintados.filter(m => m.appVisible);
  if (!visibles.length) return null;
  const aparece = visibles[0].t;
  const completa = (visibles.find(m => m.solapas === final) || visibles[visibles.length - 1]).t;
  /* El origen es el instante en que `onAuthChange` entregó la cuenta, que es como el Glosario de
     la Spec define el arranque, y NO el primer frame de la página. Medir desde el primer frame
     metía adentro el tiempo que esta sonda tarda en encontrar el formulario, tipear y hacer clic
     —1,7 s de latencia de la propia herramienta— y el número no significaba nada. */
  const t0 = tAuth === null || tAuth === undefined ? pintados[0].t : tAuth;
  return {
    solapasFinal: final,
    /* El hueco que el Glosario de la Spec define: desde que la aplicación aparece hasta que la
       barra queda con su composición final. */
    hueco: Math.round(completa - aparece),
    /* Lo que NFR-001b acota (corregido): toda la espera desde que la página empieza a vivir
       hasta que la barra queda pintada. El hueco de arriba es 0 por construcción (TD-02), así que
       medir sólo el hueco no diría nada; lo que hay que acotar es esto. */
    arranque: Math.round(completa - t0),
    /* Muestras donde la aplicación ya estaba visible con la barra incompleta: con esta feature
       tiene que ser 0 (FR-002). Es la magnitud que hace la mejora visible, no sólo más rápida. */
    framesIncompletos: visibles.filter(m => m.solapas !== final).length,
  };
}

const mediana = xs => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

async function main() {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) {
    console.error('playwright no está instalado. Medir un arranque real necesita un navegador:\n' +
      '    npx playwright install chromium && npm i playwright');
    process.exit(1);
  }

  const { server, puerto } = await servir();
  const URL = `http://127.0.0.1:${puerto}/index.html`;
  const browser = await chromium.launch();

  console.log(`\nArranque contra STAGING · caso "${CASO}" · ${CORRIDAS} corrida(s) en contextos limpios`);
  console.log(`${URL}\n`);

  const filas = [];
  for (let i = 0; i < CORRIDAS; i++) {
    /* Contexto NUEVO por corrida: sin esto la segunda entra con la sesión ya persistida y con el
       token cacheado, que es otro caso — el que se está midiendo aparte. */
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await ctx.newPage();
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    await page.addInitScript(sonda, { vencido: CASO === 'vencido' });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#loginUsuario', { state: 'visible', timeout: 20000 });
    await page.fill('#loginUsuario', USUARIO);
    await page.fill('#loginPassword', PASSWORD);
    await page.click('#btnLogin');
    /* Se espera a que la barra de solapas esté pintada —que es lo que se cronometra— y después a
       que las lecturas se estabilicen, que es cuando loadAll terminó de traer todo. NO se espera
       `#roster`: vive en la solapa Jugadores, que no es la que abre por defecto, así que está
       oculto y la espera nunca se cumplía. */
    await page.waitForSelector('#appRoot', { state: 'visible', timeout: 30000 });
    await page.waitForFunction(() => {
      const total = Object.values(window.__lecturas || {}).reduce((a, b) => a + b, 0);
      if (window.__ultimoTotal === total) return true;
      window.__ultimoTotal = total;
      return false;
    }, { timeout: 30000, polling: 600 });

    const r = await page.evaluate(() => ({ pintados: window.__pintados, lecturas: window.__lecturas,
      refrescos: window.__refrescos, tAuth: window.__tAuth, rol: window.__rol,
      sesion: window.session, solapas: [...document.querySelectorAll('.tabs .tab-btn')].filter(b => b.offsetParent !== null).map(b => b.dataset.tab) }));
    const m = magnitudes(r.pintados, r.tAuth);
    if (!m) { console.log(`  corrida ${i + 1}: no se pudo medir (la aplicación no se reveló)`); }
    else {
      filas.push({ ...m, lecturas: r.lecturas, refrescos: r.refrescos });
      const l = Object.entries(r.lecturas).map(([c, n]) => `${c}=${n}`).join(' ') || '(ninguna)';
      console.log(`  corrida ${i + 1}: arranque ${m.arranque} ms · hueco ${m.hueco} ms · ` +
        `refrescos ${r.refrescos} · frames incompletos ${m.framesIncompletos} · lecturas ${l}`);
      console.log(`             claim rol=${JSON.stringify(r.rol)} · window.session.rol=${JSON.stringify((r.sesion||{}).rol)} · solapas: ${r.solapas.join('+') || '(ninguna)'}`);
    }
    if (errores.length) console.log(`             errores de página: ${errores.join(' / ')}`);
    await ctx.close();
  }

  await browser.close();
  server.close();

  if (!filas.length) { console.error('\nNinguna corrida pudo medirse.'); process.exit(1); }

  console.log('');
  const porColeccion = {};
  for (const f of filas) for (const [c, n] of Object.entries(f.lecturas)) porColeccion[c] = (porColeccion[c] || []).concat(n);

  if (!SOLO_LECTURAS) {
    console.log(`  MEDIANA de ${filas.length} corridas`);
    console.log(`    arranque completo (NFR-001b, AC-11) : ${mediana(filas.map(f => f.arranque))} ms   objetivo ≤ 2000 ms`);
    console.log(`    hueco de la solapa (NFR-001, AC-10) : ${mediana(filas.map(f => f.hueco))} ms   objetivo ≤ 50 ms`);
    console.log(`    refrescos forzados (TC-046)         : ${mediana(filas.map(f => f.refrescos))}   máximo admitido 1`);
    console.log(`    frames con la barra incompleta      : ${mediana(filas.map(f => f.framesIncompletos))}   objetivo 0 (FR-002)`);
    console.log('');
  }
  console.log('  LECTURAS de Firestore por colección (NFR-002, NFR-004, AC-12)');
  for (const [col, ns] of Object.entries(porColeccion)) {
    console.log(`    ${col.padEnd(12)} mediana ${mediana(ns)}   (${ns.join(', ')})`);
  }
  if (!porColeccion.userRoles) {
    console.log('    userRoles    0   ← ninguna lectura: es lo que NFR-002 compromete');
  }
  console.log('');
}

main().catch(e => { console.error('\n' + e.message + '\n'); process.exit(1); });
