/* Test de layout responsive — Principio V de la constitución.
 *
 * Verifica lo que el principio exige y que no se puede verificar leyendo código:
 * que la interfaz no produzca scroll horizontal, ni deje ningún elemento fuera
 * del viewport, en ningún ancho desde el ancho mínimo soportado hacia arriba.
 *
 * Arranca la APLICACIÓN REAL. No hay maqueta ni copia de markup: se sirve el
 * `index.html` del repo por HTTP y se falsea el único global del que cuelga toda
 * la persistencia (`firebase`, ver tests/fixtures-app.js). De ahí en adelante
 * corre el código real —los mismos renderers, el mismo CSS, los mismos
 * contenedores— con el plantel real del partido testigo, que es el que tiene los
 * nombres largos que empujan el ancho mínimo de una fila.
 *
 * Es el único test del repo con una dependencia externa, y no se puede evitar:
 * calcular un layout de CSS grid/flex requiere un motor de render. Si Playwright
 * no está instalado el test avisa y NO falla (código 0), para no romper a quien
 * solo quiere correr el motor. Con LAYOUT_STRICT=1 la ausencia sí falla — es lo
 * que conviene en CI, donde un test que nunca corre se lee como que todo anda.
 *
 *   node tests/layout.test.js
 *   LAYOUT_STRICT=1 node tests/layout.test.js
 *   node tests/layout.test.js --solo=ficha      # un escenario, para iterar
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { docsDesde, fakeFirebase } = require('./fixtures-app.js');

const RAIZ = path.join(__dirname, '..');

/* Ancho mínimo soportado: lo declara el Principio V. Se mide de acá hacia
   arriba, sin techo; por debajo la interfaz puede degradarse. Si el piso del
   proyecto cambia, se cambia en el principio y acá. */
const ANCHO_MINIMO = 360;

/* Los anchos NO son "los dispositivos populares" sino los bordes donde el layout
   cambia de forma: el piso, cada breakpoint del CSS (480, 560, 700) medido de los
   dos lados, y la franja de tablet. Un dispositivo popular puede caer lejos de
   todo borde y no probar nada. */
const ANCHOS = [360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200];

/* ------------------------------------------------------------------ servidor */

/* Servir por HTTP y no abrir el archivo con file:// para que las rutas relativas
   de los assets resuelvan como en producción, y para poder interceptar los
   <script> del CDN de Firebase. */
function servir() {
  const TIPOS = { '.html': 'text/html', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const abs = path.join(RAIZ, rel);
    if (!abs.startsWith(RAIZ) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs)] || 'application/octet-stream' });
    fs.createReadStream(abs).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, puerto: server.address().port })));
}

/* Un invariante es una aserción de LAYOUT que no es desborde, y por eso MEDIR no
   la ve: el contenido puede estar entero dentro del viewport y aun así alineado
   mal. Se declara por escenario (campo `invariante`), corre dentro de la página en
   cada ancho y devuelve la lista de problemas — vacía si está bien.

   Hoy hay uno solo; si aparece un segundo conviene sacarlos a su propio módulo. */

/* Los inputs de carga de resultado deben estar SIEMPRE en su propio renglón y
   centrados cuando el panel es angosto, no sólo cuando no entran. Dejarlo al wrap
   natural mezclaba filas de 39px con filas de 69px según el largo del nombre, y esa
   irregularidad se lee peor que la línea extra.

   El umbral es el ancho del PANEL y no el del viewport, igual que la container
   query del CSS: el mismo panel de 373px aparece en una columna a 360px de
   viewport y en dos columnas a 1400px, porque `.wrap` está topeado en 760px.
   Asertando sobre el panel, el invariante cubre las dos bandas con una sola regla
   y no queda ningún ancho exento. */
const INVARIANTE_INPUTS_DE_CARGA = () => {
  /* Todo lo que el invariante usa vive acá adentro: lo que viaja al navegador es el
     texto de esta función, así que una referencia a una constante del módulo llega
     colgando y tira ReferenceError dentro de la página. */
  // Tiene que quedar igual al `@container (max-width: ...)` de `.team-stat-group` en index.html —
  // ver el comentario ahí para de dónde sale el número (se remidió al agregar el gol en contra).
  const UMBRAL_PANEL_ANGOSTO = 550;
  /* Una container query mide el CONTENT BOX del contenedor, no el border box: el
     panel de 528px con 16px de padding por lado se evalúa como 496px, y por eso
     matchea contra 500. Medir igual acá es lo que evita que el test y el CSS
     discrepen justo en el borde del umbral, que es donde importa. */
  const anchoDeContenido = (el) => {
    const cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  };

  const filas = [...document.querySelectorAll('.team-player-row:not(.team-player-row-dupla)')];
  if (!filas.length) return ['no se encontró ninguna .team-player-row: ¿cambió el markup del panel de equipos?'];
  const conGrupo = filas.filter(f => f.querySelector(':scope > .team-stat-group'));
  if (!conGrupo.length) return ['ninguna fila tiene .team-stat-group: ¿se dejó de agrupar los inputs de carga?'];

  const problemas = [];
  for (const fila of conGrupo) {
    const nombre = fila.querySelector(':scope > span:not([class])');
    if (!nombre) continue;
    const quien = nombre.textContent.trim().slice(0, 22);
    const panelEl = fila.closest('.team-panel');
    const panel = panelEl.getBoundingClientRect();
    const anchoUtil = anchoDeContenido(panelEl);
    const angosto = anchoUtil <= UMBRAL_PANEL_ANGOSTO;
    const g = fila.querySelector(':scope > .team-stat-group').getBoundingClientRect();
    const bajoDeLinea = g.top > nombre.getBoundingClientRect().top + 2;

    if (angosto && !bajoDeLinea) {
      problemas.push(`"${quien}": panel angosto (${Math.round(anchoUtil)}px útiles) y los inputs quedaron en el renglón del nombre`);
      continue;
    }
    /* El panel ancho es el otro lado de la misma moneda: si ahí la fila envuelve,
       la irregularidad volvió por donde se la sacó. */
    if (!angosto && bajoDeLinea) {
      problemas.push(`"${quien}": panel ancho (${Math.round(anchoUtil)}px útiles) y los inputs bajaron de renglón habiendo lugar`);
      continue;
    }
    if (!angosto) continue;
    const desvio = Math.round(((g.left + g.right) / 2) - ((panel.left + panel.right) / 2));
    if (Math.abs(desvio) > 2) problemas.push(`"${quien}": los inputs no están centrados (desvío ${desvio}px)`);
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* En el listado de jugadores, los controles de administración deben bajar a su
   propio renglón por debajo de 560px, para que el nombre y las estadísticas tengan
   el ancho completo. Sin eso `.row-main` quedaba con 76px a 360px y adentro se
   apilaban el nombre en tres líneas y las estadísticas en cuatro, con filas de 94
   a 130px. Nada de eso desborda, así que MEDIR no lo veía. */
const INVARIANTE_FILA_DE_JUGADOR = () => {
  if (document.documentElement.clientWidth > 560) return [];
  const filas = [...document.querySelectorAll('.roster .row')];
  if (!filas.length) return ['no se encontró ninguna .roster .row: ¿cambió el markup del listado?'];

  const problemas = [];
  for (const fila of filas) {
    const badge = fila.querySelector(':scope > .badge');
    const main = fila.querySelector(':scope > .row-main');
    const nombre = fila.querySelector('.row-name');
    if (!badge || !main || !nombre) continue;
    const quien = nombre.textContent.trim().slice(0, 22);
    /* El badge y el nombre comparten renglón: si `.row-main` se fue abajo, la fila
       quedó en tres líneas en vez de dos y el listado crece ~40%. */
    if (main.getBoundingClientRect().top > badge.getBoundingClientRect().top + 2) {
      problemas.push(`"${quien}": el nombre bajó de renglón y dejó al badge solo arriba`);
      continue;
    }
    if (nombre.getBoundingClientRect().height > 22) problemas.push(`"${quien}": el nombre quedó partido en más de una línea`);
    const stats = fila.querySelector('.row-stats');
    if (stats && stats.getBoundingClientRect().height > 20) problemas.push(`"${quien}": las estadísticas quedaron en más de una línea`);
    /* Lo que de verdad hay que asegurar: que TODOS los controles bajen, no sólo que
       el nombre entre. Con `flex-wrap` sola el nombre también entra, pero cuántos
       controles suben depende del largo de cada nombre — a 480px quedaban 3 o 4
       arriba en unas filas y 0 en otras, con alturas de 66 a 104px. Es la misma
       irregularidad que el fix vino a sacar, y la primera versión de este
       invariante la dejaba pasar por mirar sólo el nombre. */
    const arriba = [...fila.children]
      .filter(k => k !== main && !k.classList.contains('badge'))
      .filter(k => Math.abs(k.getBoundingClientRect().top - main.getBoundingClientRect().top) < 25);
    if (arriba.length) problemas.push(`"${quien}": ${arriba.length} control(es) quedaron en el renglón del nombre en vez de bajar`);
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* Sobre la cancha, "entra" no alcanza: las camisetas pueden estar todas dentro del viewport y aun
   así encimarse unas con otras, o quedar con el nombre en un cuerpo que no se lee. Ninguna de las
   dos cosas produce desborde, así que MEDIR no las ve.

   El umbral de 10.5px no es una opinión: es el cuerpo más chico que el handoff especifica para el
   nombre, y NFR-002 lo fija como piso. Por debajo de eso el diseño ya no dice nada. */
const INVARIANTE_CANCHA = () => {
  const canchas = [...document.querySelectorAll('.cancha')];
  if (!canchas.length) return ['no se encontró ninguna .cancha: ¿cambió el markup del panel de equipos?'];

  const problemas = [];
  for (const cancha of canchas) {
    const campo = cancha.getBoundingClientRect();
    for (const fila of cancha.querySelectorAll('.cancha-subfila')) {
      const camisetas = [...fila.querySelectorAll(':scope > .camiseta')];
      /* La caja que importa NO es la de la columna: las columnas son flex items y nunca se
         solapan entre sí —flex las encoge antes—, así que compararlas no puede fallar nunca y el
         invariante no probaría nada. Lo que sí puede encimarse son los ADORNOS, que están en
         `position: absolute` y sobresalen de la columna a propósito: el candado por la izquierda,
         la píldora de puntaje por la derecha. Con las columnas apretadas, la píldora de una
         camiseta y el candado de la siguiente son lo primero que choca. Se mide la unión de la
         camiseta con sus adornos. */
      const cajas = camisetas.map(c => {
        const partes = [c.querySelector('.camiseta-fig'), c.querySelector('.camiseta-puntaje'), c.querySelector('.camiseta-candado')]
          .filter(Boolean).map(e => e.getBoundingClientRect());
        return {
          n: (c.querySelector('.camiseta-nombre') || {}).textContent || '?',
          b: { left: Math.min(...partes.map(r => r.left)), right: Math.max(...partes.map(r => r.right)) },
        };
      });
      /* Encimarse con la vecina: se comparan sólo pares ADYACENTES, que es donde puede pasar. */
      for (let i = 1; i < cajas.length; i++) {
        if (cajas[i].b.left < cajas[i - 1].b.right - 0.5) {
          problemas.push(`"${cajas[i - 1].n}" y "${cajas[i].n}" se enciman (${Math.round(cajas[i - 1].b.right - cajas[i].b.left)}px)`);
        }
      }
      /* Salirse del campo: la camiseta puede no desbordar la página y aun así quedar pisando el
         borde del césped, que se lee como un error de dibujo. */
      for (const { n, b } of cajas) {
        if (b.left < campo.left - 0.5 || b.right > campo.right + 0.5) {
          problemas.push(`"${n}" se sale del campo (${Math.round(b.left)}..${Math.round(b.right)} contra ${Math.round(campo.left)}..${Math.round(campo.right)})`);
        }
      }
    }
    for (const nombre of cancha.querySelectorAll('.camiseta-nombre')) {
      const fs = parseFloat(getComputedStyle(nombre).fontSize);
      if (fs < 10.5) problemas.push(`"${nombre.textContent}" quedó en ${fs}px, por debajo del piso de 10.5px`);
    }
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* El candado es el único control de la cancha y es solo-ícono: sin nombre accesible no se puede
   saber qué hace. Y su objetivo táctil no puede achicarse respecto del botón de la lista que
   reemplaza, que medía 24px (NFR-003, NFR-004). */
const INVARIANTE_CANCHA_A11Y = () => {
  const candados = [...document.querySelectorAll('.camiseta-candado')];
  if (!candados.length) return [];  // sin admin o con el partido cerrado no hay candados, y está bien
  const problemas = [];
  for (const c of candados) {
    const etiqueta = (c.getAttribute('aria-label') || '').trim();
    if (!etiqueta) problemas.push('un candado quedó sin aria-label: es solo-ícono, no se puede saber qué hace');
    if (!(c.getAttribute('title') || '').trim()) problemas.push(`el candado "${etiqueta}" quedó sin title`);
    const b = c.getBoundingClientRect();
    if (b.width < 24 - 0.5 || b.height < 24 - 0.5) {
      problemas.push(`el candado "${etiqueta}" mide ${Math.round(b.width)}x${Math.round(b.height)}px, por debajo del piso de 24px`);
    }
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* En una columna se ve UN equipo por vez: si hubiera dos canchas con selector, o una sin él,
   el modo de layout y el render estarían discrepando. Y la pestaña es el destino de todo
   movimiento en angosto, así que su tamaño es funcional: el piso son 44px (NFR-002). */
const INVARIANTE_SELECTOR = () => {
  const canchas = document.querySelectorAll('.cancha').length;
  const tabs = [...document.querySelectorAll('.equipo-tab')];
  if (!canchas) return [];   // pantallas sin cancha: no aplica
  const problemas = [];
  if (tabs.length && canchas !== 1) {
    problemas.push(`hay selector y ${canchas} canchas: en una columna se dibuja una sola`);
  }
  if (!tabs.length && canchas !== 2) {
    problemas.push(`no hay selector y ${canchas} cancha(s): en dos columnas se dibujan las dos`);
  }
  for (const tab of tabs) {
    const b = tab.getBoundingClientRect();
    if (b.width < 44 - 0.5 || b.height < 44 - 0.5) {
      problemas.push(`la pestaña "${tab.textContent.trim()}" mide ${Math.round(b.width)}x${Math.round(b.height)}px, por debajo del piso de 44px`);
    }
    if (!(tab.getAttribute('aria-pressed') || '').trim()) {
      problemas.push(`la pestaña "${tab.textContent.trim()}" no expone aria-pressed: no se sabe cuál está seleccionada`);
    }
  }
  /* Toda camiseta arrastrable anuncia el gesto; si no, el arrastre es invisible para quien no
     lo descubre por accidente (NFR-003). */
  for (const c of document.querySelectorAll('.camiseta[draggable="true"]')) {
    if (!(c.getAttribute('title') || '').trim()) problemas.push('una camiseta arrastrable quedó sin title');
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* Donde no hay cancha no puede haber arrastre: ni camisetas arrastrables, ni zonas de drop, ni
   selector. Corre en TODAS las pantallas, que es lo que hace que valga — un escenario que sólo
   mira la pantalla que le toca no puede afirmar que el arrastre no se filtró a otra
   (S-10, S-10a, S-10b, S-10c, S-06b). */
const INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA = () => {
  if (document.querySelector('.cancha')) return [];
  const problemas = [];
  const arrastrables = document.querySelectorAll('[draggable="true"]').length;
  const filas = document.querySelectorAll('.team-player-row[draggable]').length;
  const tabs = document.querySelectorAll('.equipo-tab').length;
  const zonas = document.querySelectorAll('.team-panel[ondrop], .cancha[ondrop]').length;
  if (filas) problemas.push(`${filas} fila(s) de equipo siguen arrastrables sin cancha en pantalla (FR-050)`);
  if (tabs) problemas.push(`se dibujó el selector de equipo en una pantalla sin cancha (FR-040)`);
  if (zonas) problemas.push(`${zonas} zona(s) de drop de equipos en una pantalla sin cancha`);
  /* Los arrastres de convocatoria y plantel NO entran acá: son mecanismos distintos sobre
     pantallas distintas, y esta rebanada los deja como están (FR-052). */
  if (arrastrables && !document.querySelector('.conv-row[draggable="true"], .row[draggable="true"]')) {
    problemas.push(`quedaron ${arrastrables} elementos arrastrables sin cancha y sin ser convocatoria ni plantel`);
  }
  return problemas;
};

/* ----------------------------------------------------------------- escenarios */

/* Cada escenario recibe la página con la aplicación ya cargada y logueada, y la
   deja en la pantalla a medir. El nombre es lo que se imprime al fallar, así que
   describe la pantalla, no el mecanismo. Si `preparar` no llega a la pantalla,
   tira: el escenario se reporta como `!` y el runner devuelve 1. No hay salteo —
   un escenario que no corre y no avisa es cobertura perdida en silencio.
   `rol` elige con qué cuenta se entra: 'admin' pinta los controles de
   administración (que son los que más ancho piden), 'jugador' no. */
const ESCENARIOS = [
  { clave: 'login', rol: 'admin', nombre: 'pantalla de login',
    async preparar(page) { await page.evaluate(() => {
      document.getElementById('appRoot').style.display = 'none';
      document.getElementById('loginScreen').style.display = '';
    }); } },

  { clave: 'jugadores', rol: 'admin', nombre: 'listado de jugadores (admin)',
    invariante: INVARIANTE_FILA_DE_JUGADOR,
    async preparar(page) { await irAPestania(page, 'Jugadores'); } },

  { clave: 'jugadores-jugador', rol: 'jugador', nombre: 'listado de jugadores (rol jugador)',
    async preparar(page) { await irAPestania(page, 'Jugadores'); } },

  /* La ficha abierta trae .index-card, .field-row, .pos-badges y .scores-grid
     (4 columnas que colapsan a 2 en 480px), más el .info-icon. */
  { clave: 'ficha', rol: 'admin', nombre: 'ficha de jugador (alta/edición)',
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      await page.click('.roster .row .icon-btn[title="Editar"]');
      await page.waitForSelector('.card-pin-wrap.open');
    } },

  /* El tooltip de ayuda es el caso que motivó medir esto: .info-tip tiene
     width:250px con max-width:70vw, posicionado left:50% translateX(-50%) sobre
     un ícono que puede estar pegado al borde derecho. Se lo fuerza visible con la
     misma clase que usa el click en mobile (.show-tip). */
  { clave: 'tooltip', rol: 'admin', nombre: 'tooltip de ayuda (.info-tip) desplegado',
    async preparar(page) {
      await irAPestania(page, 'Configuración');
      await page.evaluate(() => {
        document.querySelectorAll('.info-icon').forEach(i => i.classList.add('show-tip'));
      });
      await page.waitForTimeout(150);
    } },

  { clave: 'partidos', rol: 'admin', nombre: 'lista de partidos (admin)',
    async preparar(page) { await irAPestania(page, 'Partidos'); } },

  { clave: 'partido-abierto', rol: 'admin', nombre: 'detalle de partido · inscripción abierta',
    async preparar(page) { await abrirPartido(page, '2026-09-03'); } },

  { clave: 'partido-cerrado', rol: 'admin', nombre: 'detalle de partido · cargar resultado',
    spec: ['cancha/S-10', 'arrastre/S-10', 'arrastre/S-06b'], invariante: INVARIANTE_INPUTS_DE_CARGA,
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); } },

  { clave: 'partido-finalizado', rol: 'admin', nombre: 'detalle de partido · finalizado',
    spec: ['cancha/S-10a', 'arrastre/S-10a'], invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-08-20'); } },

  /* --- la cancha (rebanada 1 de "Equipos en el campo") --- */

  { clave: 'cancha-8', rol: 'admin', nombre: 'equipos generados sobre la cancha · fútbol 8',
    /* `S-01f` es la propiedad de no-superposición: la satisface INVARIANTE_CANCHA, que corre en
       los trece anchos y sobre las dos canchas. Se declara acá porque los invariantes no llevan
       lista propia de identificadores. */
    /* El invariante del selector se suma acá porque estos dos escenarios son los que corren en
       los TRECE anchos: es donde 'una cancha con selector, dos sin él' se verifica de verdad
       en todo el rango, y no sólo en los cuatro que mide `arrastre-selector` (S-04d). */
    spec: ['cancha/S-01', 'cancha/S-01f', 'cancha/S-03', 'cancha/NFR-001', 'cancha/NFR-006', 'arrastre/S-04d', 'arrastre/NFR-001'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR],
    /* La línea de base se toma DESPUÉS de que la aplicación cargó y ANTES de entrar al partido.
       Al arrancar, la aplicación corre sus migraciones y escribe `players`, `playerScores` y
       `ordenJugadoresMigrado`; eso es de siempre y no tiene nada que ver con la cancha. Lo que
       NFR-006 pide es que dibujar la cancha no agregue ninguna escritura, no que la aplicación
       no escriba nunca. */
    async preparar(page) {
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      await abrirPartido(page, '2026-09-03');
    },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó ninguna cancha con la inscripción abierta');
        if (document.querySelector('.team-player-row')) problemas.push('quedó una fila de la lista vieja en la pantalla de equipos generados (D-12)');
        const nuevas = (window.__escrituras || []).slice(window.__escrituras_base || 0);
        if (nuevas.length) problemas.push(`dibujar la cancha escribió: ${[...new Set(nuevas)].join(', ')} (NFR-006)`);
        return problemas;
      });
    } },

  { clave: 'cancha-9', rol: 'admin', nombre: 'equipos generados sobre la cancha · fútbol 9 (fila de cuatro)',
    spec: ['cancha/S-01a', 'cancha/S-01f', 'cancha/S-03a', 'cancha/S-06', 'cancha/S-06a', 'cancha/S-06b', 'cancha/S-06c', 'cancha/S-06d', 'cancha/NFR-001', 'cancha/NFR-002', 'arrastre/S-04d', 'arrastre/NFR-001'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        const cancha = document.querySelector('.cancha');
        if (!cancha) return ['no se dibujó la cancha de fútbol 9'];
        if (cancha.getAttribute('data-max-fila') !== '4') {
          problemas.push(`la cancha de 9 debería tener una fila de cuatro, y data-max-fila dice ${cancha.getAttribute('data-max-fila')}`);
        }
        const lineas = cancha.querySelectorAll('.cancha-linea');
        if (lineas.length !== 4) problemas.push(`se dibujaron ${lineas.length} líneas y la formación 1/3/4/1 tiene cuatro`);
        return problemas;
      });
    } },

  { clave: 'cancha-jugador', rol: 'jugador', nombre: 'equipos generados sobre la cancha (rol jugador)',
    spec: ['cancha/S-05', 'cancha/S-04c'],
    invariantes: [INVARIANTE_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      return page.evaluate(async () => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('el rol jugador no ve la cancha');
        if (document.querySelector('.camiseta-puntaje')) problemas.push('el rol jugador ve puntajes sobre las camisetas (FR-024)');
        if (document.querySelector('.camiseta-candado')) problemas.push('el rol jugador ve candados (FR-030)');
        /* Esconder el botón no alcanza: la acción tiene que estar cerrada también en el handler,
           que es lo que un rol sin permiso puede invocar desde la consola (FR-034, TC-040). */
        const antes = (window.__escrituras || []).length;
        const camiseta = document.querySelector('.camiseta');
        const idPartido = 'm-abierto';
        if (window.__toggleBloqueo && camiseta) {
          window.__toggleBloqueo(idPartido, 'nilo');
          await new Promise(r => setTimeout(r, 150));
          if ((window.__escrituras || []).length > antes) {
            problemas.push('__toggleBloqueo escribió con rol jugador: la guarda de rol no está en el handler (FR-034)');
          }
        }
        return problemas;
      });
    } },

  { clave: 'cancha-candado', rol: 'admin', nombre: 'candado sobre la camiseta',
    /* Cuatro anchos y no trece: lo que se prueba es comportamiento. Los cuatro cubren igual los
       cuatro escalones de medidas, que es lo único sensible al ancho acá (el tamaño del candado). */
    anchos: [360, 390, 901, 1200],
    /* La rebanada 2 vuelve arrastrable la camiseta que contiene este botón, así que su
       comportamiento pasa a ser una no-regresión de esta rebanada además de un requisito de
       la anterior: por eso el escenario lleva ahora identificadores de las dos. */
    spec: ['cancha/S-04', 'cancha/S-04a', 'cancha/S-04b', 'cancha/S-04d', 'arrastre/S-05', 'cancha/NFR-003', 'cancha/NFR-004', 'cancha/NFR-005'],
    invariantes: [INVARIANTE_CANCHA_A11Y],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      const problemas = [];
      /* S-04: fijar a un jugador desde su camiseta. Se elige uno SIN fijar, se lo toca, y se
         comprueba que quedó fijado y que el resto del reparto no se movió. */
      const estado = async () => page.evaluate(() => ({
        fijados: [...document.querySelectorAll('.camiseta-candado.fijado')].map(c => c.getAttribute('aria-label')),
        nombres: [...document.querySelectorAll('.camiseta-nombre')].map(n => n.textContent),
      }));
      const inicial = await estado();
      const libre = await page.$('.camiseta-candado:not(.fijado)');
      if (!libre) return ['no había ningún candado sin fijar para probar S-04'];
      await libre.click(); await page.waitForTimeout(300);
      const despues = await estado();
      if (despues.fijados.length !== inicial.fijados.length + 1) {
        problemas.push(`tocar un candado libre dejó ${despues.fijados.length} fijados y había ${inicial.fijados.length}`);
      }
      if (JSON.stringify(despues.nombres) !== JSON.stringify(inicial.nombres)) {
        problemas.push('fijar a un jugador movió el reparto: los nombres cambiaron de lugar');
      }
      /* S-04b y S-04d: tocar dos veces el MISMO candado vuelve al estado inicial, sin duplicar
         al jugador en la lista de bloqueados. */
      const mismo = await page.$('.camiseta-candado.fijado');
      await mismo.click(); await page.waitForTimeout(300);
      const vuelta = await estado();
      if (vuelta.fijados.length !== inicial.fijados.length) {
        problemas.push(`dos toques sobre el mismo candado no volvieron al estado inicial (${vuelta.fijados.length} vs ${inicial.fijados.length})`);
      }
      /* S-04a: el candado de una dupla aplica a los dos integrantes. La dupla es una sola
         camiseta, así que lo observable es que su aria-label nombre a los dos. */
      const etiquetaDupla = await page.evaluate(() => {
        const capsula = document.querySelector('.camiseta-dupla');
        if (!capsula) return null;
        const boton = capsula.closest('.camiseta').querySelector('.camiseta-candado');
        return boton ? boton.getAttribute('aria-label') : null;
      });
      if (etiquetaDupla && !etiquetaDupla.includes('/')) {
        problemas.push(`el candado de la dupla nombra a un solo jugador: "${etiquetaDupla}" (FR-032)`);
      }
      /* NFR-005: repintar tras alternar un candado, con 18 titulares, por debajo de 100ms. */
      const ms = await page.evaluate(async () => {
        const t0 = performance.now();
        window.__toggleBloqueo('m-nueve', 'nilo');
        await new Promise(r => requestAnimationFrame(r));
        return performance.now() - t0;
      });
      if (ms > 100) problemas.push(`repintar tras alternar un candado tardó ${Math.round(ms)}ms, por encima del techo de 100ms (NFR-005)`);
      return problemas;
    } },

  { clave: 'arrastre-selector', rol: 'admin', nombre: 'selector de equipo y zonas de drop',
    /* Los cuatro anchos son los que importan: 360 y 900 caen de un lado del punto de corte, 901
       y 1200 del otro. Son S-04a y S-04b, que es lo que impide que el literal del CSS y el del
       JavaScript se desincronicen (TC-015). */
    anchos: [360, 900, 901, 1200],
    spec: ['arrastre/S-04', 'arrastre/S-04a', 'arrastre/S-04b', 'arrastre/S-06', 'arrastre/S-04d', 'arrastre/NFR-002', 'arrastre/NFR-003'],
    invariantes: [INVARIANTE_SELECTOR],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      const problemas = [];
      const foto = () => page.evaluate(() => ({
        ancho: window.innerWidth,
        canchas: document.querySelectorAll('.cancha').length,
        tabs: document.querySelectorAll('.equipo-tab').length,
        visible: document.querySelector('.equipo-tabs') ? document.querySelector('.equipo-tabs').dataset.visible : null,
        arrastrables: document.querySelectorAll('.camiseta[draggable="true"]').length,
        canchasConDrop: [...document.querySelectorAll('.cancha')].filter(c => c.getAttribute('ondrop')).length,
        panelesConDrop: [...document.querySelectorAll('.team-panel')].filter(c => c.getAttribute('ondrop')).length,
        filasArrastrables: document.querySelectorAll('.team-player-row[draggable]').length,
        realcesQueCapturan: [...document.querySelectorAll('.drop-realce')]
          .filter(r => getComputedStyle(r).pointerEvents !== 'none').length,
      }));
      const a = await foto();
      const unaColumna = a.ancho <= 900;
      if (unaColumna && (a.canchas !== 1 || a.tabs !== 2)) {
        problemas.push(`a ${a.ancho}px debería haber 1 cancha y 2 pestañas, y hay ${a.canchas} y ${a.tabs} (S-04a)`);
      }
      if (!unaColumna && (a.canchas !== 2 || a.tabs !== 0)) {
        problemas.push(`a ${a.ancho}px deberían verse las 2 canchas sin selector, y hay ${a.canchas} y ${a.tabs} pestañas (S-04b)`);
      }
      /* S-06: el DOM declara qué acepta. El drop vive en la cancha y en la pestaña, no en el
         panel, para que el realce coincida con la zona que efectivamente recibe (TC-014). */
      if (!a.arrastrables) problemas.push('ninguna camiseta quedó marcada como arrastrable');
      if (a.canchasConDrop !== a.canchas) problemas.push(`${a.canchas - a.canchasConDrop} cancha(s) sin aceptar el drop`);
      if (a.panelesConDrop) problemas.push(`${a.panelesConDrop} panel(es) siguen aceptando el drop: la zona es la cancha (TC-014)`);
      if (a.filasArrastrables) problemas.push(`quedaron ${a.filasArrastrables} filas de lista arrastrables (FR-050)`);
      if (a.realcesQueCapturan) problemas.push(`${a.realcesQueCapturan} realce(s) capturan el puntero y se comerían el dragover (TC-034)`);
      /* S-04: activar la otra pestaña cambia el equipo visible. */
      if (unaColumna) {
        const otra = await page.$('.equipo-tab[aria-pressed="false"]');
        if (!otra) { problemas.push('no había pestaña inactiva para probar el cambio de equipo'); return problemas; }
        await otra.click(); await page.waitForTimeout(300);
        const b = await foto();
        if (b.visible === a.visible) problemas.push(`activar la otra pestaña no cambió el equipo visible (sigue en ${b.visible})`);
        if (b.canchas !== 1) problemas.push(`tras cambiar de pestaña hay ${b.canchas} canchas y debería haber 1`);
      }
      return problemas;
    } },

  { clave: 'arrastre-drop', rol: 'admin', nombre: 'soltar una camiseta: mover, intercambiar y cancelar',
    /* Comportamiento, no layout: dos anchos, uno de cada lado del punto de corte, porque las
       zonas disponibles difieren (en angosto la pestaña; en ancho la cancha y la camiseta). */
    anchos: [360, 1200],
    spec: ['arrastre/S-01', 'arrastre/S-01e', 'arrastre/S-02', 'arrastre/S-21d', 'arrastre/NFR-004', 'arrastre/NFR-005', 'arrastre/NFR-007'],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      const problemas = [];
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      const posicionesAntes = JSON.parse(docsDesde()['partidos']).find(x => x.id === 'm-nueve').equipos.posicionAsignada;
      /* El drop nativo no se puede conducir con el mouse de Playwright, así que se despacha el
         evento con su DataTransfer. Cubre el cableado DOM → manejador, que es lo que un test
         puede cubrir; que el navegador dispare el gesto desde un dedo queda en A-01. */
      const r = await page.evaluate(async () => {
        const antes = [...document.querySelectorAll('.cancha')].map(c => c.querySelectorAll('.camiseta').length);
        const cam = document.querySelector('.camiseta[draggable="true"]');
        const pest = [...document.querySelectorAll('.equipo-tab')].find(b => b.getAttribute('aria-pressed') === 'false');
        const otraCancha = [...document.querySelectorAll('.cancha')][1];
        const dt = new DataTransfer();
        cam.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        const id = dt.getData('text/plain');
        const zona = pest || otraCancha;
        zona.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
        const realce = zona.querySelector('.drop-realce');
        const realceVisible = realce ? getComputedStyle(realce).display !== 'none' : false;
        const t0 = performance.now();
        zona.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
        await new Promise(res => requestAnimationFrame(res));
        const ms = performance.now() - t0;
        return { id, antes, realceVisible, ms, viaPestania: !!pest };
      });
      await page.waitForTimeout(300);
      const tras = await page.evaluate(() => ({
        porCancha: [...document.querySelectorAll('.cancha')].map(c => c.querySelectorAll('.camiseta').length),
        visible: document.querySelector('.equipo-tabs') ? document.querySelector('.equipo-tabs').dataset.visible : null,
        realcesPegados: document.querySelectorAll('.drop-activo').length,
        escrituras: (window.__escrituras || []).length - window.__escrituras_base,
      }));
      if (!r.realceVisible) problemas.push('la zona bajo el puntero no se realzó durante el dragover (FR-014)');
      if (!r.id) problemas.push('el dragstart no dejó el identificador en el dataTransfer');
      if (!tras.escrituras) problemas.push('soltar sobre una zona válida no produjo ninguna escritura (S-01)');
      if (tras.realcesPegados) problemas.push(`quedaron ${tras.realcesPegados} realce(s) pegados tras soltar (FR-008)`);
      if (r.viaPestania) {
        /* S-01: soltar sobre la pestaña mueve Y revela ese equipo, para que el resultado quede a
           la vista (FR-034). */
        if (tras.porCancha[0] !== r.antes[0] + 1) {
          problemas.push(`tras soltar en la pestaña la cancha visible tiene ${tras.porCancha[0]} camisetas y debería tener ${r.antes[0] + 1} (S-01, FR-034)`);
        }
      } else if (tras.porCancha[1] !== r.antes[1] + 1 || tras.porCancha[0] !== r.antes[0] - 1) {
        problemas.push(`tras soltar en la cancha contraria quedó ${JSON.stringify(tras.porCancha)} y se esperaba [${r.antes[0] - 1}, ${r.antes[1] + 1}]`);
      }
      if (r.ms > 150) problemas.push(`el ciclo soltar-guardar-repintar tardó ${Math.round(r.ms)}ms, por encima del techo de 150ms (NFR-004)`);

      /* NFR-005 y TC-012: no alcanza con que se haya escrito — importa QUÉ. El conjunto de
         claves no puede crecer, y la posición asignada de nadie puede haber cambiado: la línea
         en la que cae cada camiseta se deriva de ese dato, y esta rebanada no lo toca. */
      const datos = await page.evaluate(() => {
        const docs = window.__ultimosDocs || {};
        const partidos = docs['partidos'] ? JSON.parse(docs['partidos']) : null;
        const m = partidos ? partidos.find(x => x.id === 'm-nueve') : null;
        return {
          claves: [...new Set(window.__escrituras || [])],
          posicionAsignada: m && m.equipos ? m.equipos.posicionAsignada : null,
        };
      });
      const permitidas = ['partidos', 'partidosArmado', 'players', 'playerScores', 'motorConfig',
        'ordenJugadoresMigrado', 'statsGanadosEmpatadosPerdidosMigrado', 'partidosArmadoMigrado'];
      const deMas = datos.claves.filter(k => !permitidas.includes(k));
      if (deMas.length) problemas.push(`se escribieron claves inesperadas: ${deMas.join(', ')} (NFR-005)`);
      if (!datos.posicionAsignada) problemas.push('no se pudo leer la posición asignada del documento escrito (NFR-005)');
      else if (JSON.stringify(datos.posicionAsignada) !== JSON.stringify(posicionesAntes)) {
        problemas.push('un movimiento manual cambió la posición asignada de alguien (TC-012, FR-022)');
      }

      /* S-01e: un arrastre que se cancela antes de soltarse no modifica nada. */
      const cancelado = await page.evaluate(() => {
        const antes = [...document.querySelectorAll('.cancha')].map(c => c.querySelectorAll('.camiseta').length);
        const escrituras = (window.__escrituras || []).length;
        const cam = document.querySelector('.camiseta[draggable="true"]');
        const dt = new DataTransfer();
        cam.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        const zona = document.querySelector('.equipo-tab[aria-pressed="false"]') || [...document.querySelectorAll('.cancha')][1];
        zona.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
        cam.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
        return {
          igual: JSON.stringify(antes) === JSON.stringify([...document.querySelectorAll('.cancha')].map(c => c.querySelectorAll('.camiseta').length)),
          sinEscribir: (window.__escrituras || []).length === escrituras,
          realces: document.querySelectorAll('.drop-activo').length,
        };
      });
      if (!cancelado.igual) problemas.push('cancelar el arrastre movió a alguien (S-01e)');
      if (!cancelado.sinEscribir) problemas.push('cancelar el arrastre produjo una escritura (S-01e)');
      if (cancelado.realces) problemas.push('cancelar el arrastre dejó el realce pegado (S-01e, FR-008)');

      /* S-21d: un drop con contenido que no es una unidad del partido no mueve ni revela nada. */
      const basura = await page.evaluate(() => {
        const escrituras = (window.__escrituras || []).length;
        const visible = document.querySelector('.equipo-tabs') ? document.querySelector('.equipo-tabs').dataset.visible : null;
        const zona = document.querySelector('.equipo-tab[aria-pressed="false"]') || [...document.querySelectorAll('.cancha')][1];
        const dt = new DataTransfer();
        dt.setData('text/plain', 'no-soy-un-jugador');
        zona.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
        return {
          sinEscribir: (window.__escrituras || []).length === escrituras,
          visibleIgual: (document.querySelector('.equipo-tabs') ? document.querySelector('.equipo-tabs').dataset.visible : null) === visible,
        };
      });
      if (!basura.sinEscribir) problemas.push('un drop con contenido ajeno al partido produjo una escritura (S-21d, TC-041)');
      if (!basura.visibleIgual) problemas.push('un drop con contenido ajeno cambió el equipo visible (S-21d)');
      return problemas;
    } },

  { clave: 'arrastre-jugador', rol: 'jugador', nombre: 'la cancha con rol jugador: selector sí, arrastre no',
    anchos: [360, 1200],
    spec: ['arrastre/S-06a', 'arrastre/S-04c'],
    invariantes: [INVARIANTE_SELECTOR],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      const problemas = [];
      const a = await page.evaluate(() => ({
        ancho: window.innerWidth,
        tabs: document.querySelectorAll('.equipo-tab').length,
        arrastrables: document.querySelectorAll('.camiseta[draggable="true"]').length,
        zonasConDrop: document.querySelectorAll('[ondrop]').length,
        visible: document.querySelector('.equipo-tabs') ? document.querySelector('.equipo-tabs').dataset.visible : null,
      }));
      if (a.arrastrables) problemas.push(`el rol jugador vio ${a.arrastrables} camisetas arrastrables (FR-041)`);
      if (a.zonasConDrop) problemas.push(`el rol jugador vio ${a.zonasConDrop} zonas de drop (FR-041b, FR-038b)`);
      /* S-04c: el selector SÍ está para el jugador — puede mirar el otro equipo, no moverlo. */
      if (a.ancho <= 900) {
        if (a.tabs !== 2) { problemas.push(`el rol jugador debería ver el selector en una columna, y vio ${a.tabs} pestañas (FR-038)`); return problemas; }
        await page.click('.equipo-tab[aria-pressed="false"]');
        await page.waitForTimeout(300);
        const b = await page.evaluate(() => document.querySelector('.equipo-tabs').dataset.visible);
        if (b === a.visible) problemas.push('el rol jugador no pudo cambiar de equipo visible (FR-038)');
      }
      return problemas;
    } },

  { clave: 'arrastre-permisos', rol: 'jugador', nombre: 'invocar el movimiento sin permiso no escribe',
    anchos: [1200],
    spec: ['arrastre/S-20', 'arrastre/S-20c', 'arrastre/NFR-007'],
    async preparar(page) { await abrirPartido(page, '2026-09-10'); },
    async comprobar(page) {
      /* La guarda está en el manejador y no sólo en el render: una vista que apenas deja de
         marcar la camiseta como arrastrable deja la acción alcanzable desde la consola (TC-040). */
      /* Origen y destino son de equipos DISTINTOS, leídos del fixture. Un primer intento pasaba
         el mismo jugador en los dos lados, y así el intercambio no hacía nada por su propia
         regla: el escenario pasaba sin ejercitar la guarda. Es la ruta del intercambio la que
         importa acá, porque es la única que no tiene otra guarda detrás. */
      const nueve = JSON.parse(docsDesde()['partidos']).find(x => x.id === 'm-nueve');
      const origen = nueve.equipos.blanco[0];
      const destino = nueve.equipos.negro[0];
      const base = await page.evaluate(({ origen, destino }) => {
        const n = (window.__escrituras || []).length;
        const dt = new DataTransfer();
        dt.setData('text/plain', origen);
        const ev = () => new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
        window.__dropEnCancha(ev(), 'm-nueve', 'negro');
        window.__dropEnPestana(ev(), 'm-nueve', 'negro');
        window.__dropEnCamiseta(ev(), 'm-nueve', destino);
        return n;
      }, { origen, destino });
      /* `saveMatches` es async: la escritura llega varios `await` después de que el manejador
         vuelve. Leer el contador de forma síncrona daba cero SIEMPRE, con guarda y sin ella —
         un test que no podía fallar. */
      await page.waitForTimeout(400);
      const r = await page.evaluate(n => (window.__escrituras || []).length - n, base);
      return r ? [`invocar los manejadores con rol jugador produjo ${r} escritura(s) (S-20, TC-040)`] : [];
    } },

  { clave: 'arrastre-permisos-estado', rol: 'admin', nombre: 'invocar el movimiento con el partido cerrado o finalizado no escribe',
    anchos: [1200],
    spec: ['arrastre/S-20a', 'arrastre/S-20b'],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); },
    async comprobar(page) {
      /* El identificador que se pasa SÍ pertenece a esos partidos, a propósito: si se usara uno
         inventado, el test pasaría por la validación de identificador (TC-041) y no probaría lo
         que dice probar, que es la guarda de ESTADO (TC-040). */
      /* Los identificadores salen del MISMO fixture que alimenta a la aplicación, leído acá en
         Node: así el test no necesita ningún gancho dentro de `index.html`. */
      const partidos = JSON.parse(docsDesde()['partidos']);
      const casos = ['m-cerrado', 'm-finalizado'].map(id => {
        const m = partidos.find(x => x.id === id);
        return { matchId: id, pid: m && m.equipos ? m.equipos.blanco[0] : null };
      });
      const base = await page.evaluate((casos) => {
        const n = (window.__escrituras || []).length;
        for (const { matchId, pid } of casos) {
          if (!pid) continue;
          const dt = new DataTransfer();
          dt.setData('text/plain', pid);
          window.__dropEnCancha(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }), matchId, 'negro');
          window.__dropEnPestana(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }), matchId, 'negro');
        }
        return n;
      }, casos);
      /* Ver el comentario de `arrastre-permisos`: `saveMatches` es async y hay que esperarla, o
         el test pasa siempre. */
      await page.waitForTimeout(400);
      const escrituras = await page.evaluate(n => (window.__escrituras || []).length - n, base);
      const problemas = [];
      for (const caso of casos) {
        if (!caso.pid) problemas.push(`no se pudo leer el reparto de ${caso.matchId} para la prueba`);
      }
      if (escrituras) problemas.push(`invocar los manejadores sobre un partido cerrado o finalizado produjo ${escrituras} escritura(s): la guarda de estado no corrió (S-20a, S-20b, TC-040)`);
      return problemas;
    } },

  { clave: 'partido-editando', rol: 'admin', nombre: 'detalle de partido · finalizado, editando el resultado',
    /* La pantalla no la toca esta rebanada —conserva la lista—, así que acá se verifica sólo eso.
       El layout de la lista con inputs ya lo miden `partido-cerrado` y `partido-finalizado`. */
    anchos: [360, 900, 1200], spec: ['cancha/S-10b', 'arrastre/S-10b'],
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) {
      await abrirPartido(page, '2026-08-20');
      await page.click('button:has-text("Editar resultado")');
      await page.waitForTimeout(400);
    },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        if (document.querySelector('.cancha')) problemas.push('se dibujó la cancha editando un resultado finalizado (FR-042)');
        if (!document.querySelector('.team-player-row')) problemas.push('desapareció la lista de filas al editar un resultado finalizado');
        return problemas;
      });
    } },

  { clave: 'partido-sin-equipos', rol: 'admin', nombre: 'detalle de partido · sin equipos generados',
    anchos: [360, 1200], spec: ['cancha/S-10c', 'arrastre/S-10c'],
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-09-17'); },
    async comprobar(page) {
      return page.evaluate(() =>
        document.querySelector('.cancha') ? ['se dibujó una cancha sin que el motor hubiera repartido los equipos'] : []);
    } },

  { clave: 'partido-jugador', rol: 'jugador', nombre: 'detalle de partido · finalizado (rol jugador)',
    async preparar(page) { await abrirPartido(page, '2026-08-20'); } },

  { clave: 'configuracion', rol: 'admin', nombre: 'configuración del motor',
    async preparar(page) { await irAPestania(page, 'Configuración'); } },

  /* Modales: .modal-card tiene max-width:440px + width:100%, y el de duplas
     además una lista con max-height propio. */
  { clave: 'modal-nuevo-partido', rol: 'admin', nombre: 'modal · nuevo partido',
    async preparar(page) {
      await irAPestania(page, 'Partidos');
      await page.click('#btnNuevoPartido');
      await page.waitForSelector('#newMatchModal.open');
    } },

  { clave: 'modal-dupla', rol: 'admin', nombre: 'modal · crear dupla de rotación',
    async preparar(page) {
      await abrirPartido(page, '2026-09-03');
      /* waitForSelector y no page.$: si el botón no está, esto tira y el escenario se
         reporta como `!`. Con page.$ + salteo, una carrera de timing bajaba la cobertura
         sin que nada lo dijera — que es justo lo que un test no puede hacer.

         `.btn-ghost` y no `img.icon-dupla`: DOS botones distintos de la fila llevan ese
         ícono, "Agregar rotación" (abre el modal) y "Deshacer rotación" (rompe el vínculo).
         El selector por ícono tomaba el primero del DOM, así que cuando el fixture pasó a
         tener una dupla en la primera fila empezó a clickear Deshacer: el modal nunca se
         abría y el escenario moría por timeout. */
      await page.waitForSelector('.conv-row .btn-ghost', { timeout: 5000 });
      await page.click('.conv-row .btn-ghost');
      await page.waitForSelector('#duplaModal.open');
    } },

  { clave: 'toast', rol: 'admin', nombre: 'toast de aviso',
    async preparar(page) {
      await irAPestania(page, 'Partidos');
      await page.evaluate(() => window.__showToast && window.__showToast('No se pudo copiar la formación al portapapeles', 'error'));
      await page.waitForTimeout(150);
    } },
];

async function irAPestania(page, texto) {
  await page.click(`.tab-btn:has-text("${texto}")`);
  await page.waitForTimeout(350);
}

/* Se clickea `.match-card-top` y NO el centro de la tarjeta, y después se espera a que el detalle
   esté visible de verdad.

   Las dos cosas salieron del mismo hallazgo. La tarjeta de un partido finalizado mide 256px de
   alto —lleva el resumen del resultado— contra los 71px de las demás, así que su centro cae sobre
   `.match-result`, y desde ahí el click no llega al `onclick` de la tarjeta. Como el escenario
   sólo dormía medio segundo y medía lo que hubiera en pantalla, `partido-finalizado` y
   `partido-jugador` venían midiendo la LISTA de partidos creyendo que medían el detalle: pasaban
   en verde sin haber llegado nunca a la pantalla que dicen medir.

   La espera explícita es la parte que impide que vuelva a pasar en silencio: si el detalle no
   abre, el escenario se reporta como `!` (no se pudo preparar) en vez de medir otra pantalla. */
async function abrirPartido(page, fechaIso) {
  await irAPestania(page, 'Partidos');
  const dia = String(Number(fechaIso.slice(8, 10)));
  await page.click(`.match-card:has-text(" ${dia} de ") .match-card-top`);
  await page.waitForFunction(() => {
    const v = document.getElementById('matchDetailView');
    return v && v.style.display !== 'none';
  }, null, { timeout: 5000 });
  await page.waitForTimeout(300);
}

/* ------------------------------------------------------------------- medición */

/* Dos comprobaciones, y hacen falta las dos:
   - el scroll horizontal es el síntoma que ve el usuario;
   - un elemento puede salirse de su contenedor SIN producir scroll, si algo más
     arriba lo recorta. No scrollea y aun así esconde un control — ese fue el bug
     de .match-card-top, con los botones de admin en 379px dentro de un
     contenedor que terminaba en 325px.

   `position:fixed` se mide igual (el toast, los overlays de modal): que se salga
   del viewport es exactamente el bug que se busca. Lo que se excluye es lo
   invisible, porque un tooltip oculto con visibility:hidden no molesta a nadie. */
const MEDIR = () => {
  const de = document.documentElement;
  const limite = de.clientWidth;
  const fuera = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
    const b = el.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0) return;
    if (b.right > limite + 0.5) {
      const cls = typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase();
      fuera.push({ sel: cls, right: Math.round(b.right) });
    }
  });
  const unicos = [];
  fuera.forEach(f => { if (!unicos.some(u => u.sel === f.sel)) unicos.push(f); });
  return { desborde: de.scrollWidth - de.clientWidth, limite, fuera: unicos.slice(0, 6) };
};

/* ---------------------------------------------------------------------- runner */

async function main() {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) {
    const msg = 'playwright no está instalado. Para correr el test de layout:\n' +
                '    npx playwright install chromium && npm i playwright\n' +
                'Calcular un layout de CSS grid/flex necesita un motor de render: no hay forma\n' +
                'de verificar el Principio V sin uno.';
    if (process.env.LAYOUT_STRICT) { console.error('FALLA: ' + msg); process.exit(1); }
    console.log('SALTEADO — ' + msg);
    console.log('\n(exit 0: la ausencia del navegador no es una regresión. LAYOUT_STRICT=1 la convierte en falla.)');
    process.exit(0);
  }

  const soloArg = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7);
  const casos = soloArg ? ESCENARIOS.filter(e => e.clave.includes(soloArg)) : ESCENARIOS;
  if (casos.length === 0) {
    console.error(`Ningún escenario coincide con --solo=${soloArg}. Hay: ${ESCENARIOS.map(e => e.clave).join(', ')}`);
    process.exit(1);
  }

  const { server, puerto } = await servir();
  const URL = `http://127.0.0.1:${puerto}/index.html`;
  const browser = await chromium.launch();
  const fallas = [];
  const rotosInvariante = [];
  const rotos = [];

  console.log(`Layout responsive — Principio V · ancho mínimo soportado ${ANCHO_MINIMO}px`);
  const mediciones = casos.reduce((n, c) => n + (c.anchos || ANCHOS).length, 0);
  console.log(`${casos.length} escenarios · ${mediciones} mediciones (${ANCHOS[0]}–${ANCHOS[ANCHOS.length - 1]}px), sobre la aplicación real\n`);

  for (const caso of casos) {
    const marcas = [];
    /* Un escenario puede acotar los anchos que mide. Se usa sólo para los escenarios de
       COMPORTAMIENTO —que el candado haga lo que dice, que la cancha no aparezca donde no va—,
       cuya respuesta no depende del ancho: medirlos trece veces multiplica el tiempo de la suite
       sin agregar cobertura. Los escenarios de layout propiamente dichos NO lo declaran y siguen
       corriendo en los trece anchos, que es lo que exige el Principio V. */
    for (const w of (caso.anchos || ANCHOS)) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      /* Los tres <script> del CDN de Firebase no se descargan: el global lo
         provee el doble, y así el test no depende de la red. */
      await page.route('**/firebasejs/**', r => r.abort());
      await page.addInitScript(fakeFirebase, { datos: docsDesde(), rol: caso.rol });
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));
      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForSelector('#appRoot', { state: 'attached' });
      await page.waitForTimeout(600);

      try {
        await caso.preparar(page);
      } catch (e) {
        rotos.push({ caso: caso.nombre, ancho: w, error: e.message.split('\n')[0] });
        await ctx.close();
        marcas.push(`${w}!`);
        continue;
      }
      const r = await page.evaluate(MEDIR);
      /* `invariante` (uno) e `invariantes` (varios) conviven: los escenarios viejos declaran uno
         solo y la cancha necesita dos, el de geometría y el de accesibilidad. */
      const declarados = caso.invariantes || (caso.invariante ? [caso.invariante] : []);
      let problemas = [];
      for (const inv of declarados) problemas = problemas.concat(await page.evaluate(inv));
      /* `comprobar` es para lo que no es layout: que la cancha aparezca donde tiene que aparecer,
         que el candado haga lo que dice, que abrir la pantalla no escriba. No depende del ancho,
         así que corre UNA vez por escenario y no trece. */
      /* `comprobar` corre UNA vez por escenario, en su PRIMER ancho — el suyo, no el global.
         Decía `ANCHOS[0]`, y con eso un escenario que acotaba `anchos` sin incluir 360 nunca
         corría su comprobación y se reportaba en verde igual: salteo silencioso, que es
         justamente lo que el comentario de ESCENARIOS dice no querer. Lo descubrió
         `arrastre-permisos-estado`, que declara `anchos: [1200]`. */
      if (caso.comprobar && w === (caso.anchos || ANCHOS)[0]) {
        try { problemas = problemas.concat(await caso.comprobar(page)); }
        catch (e) { problemas.push('la comprobación de comportamiento tiró: ' + e.message.split('\n')[0]); }
      }
      await ctx.close();
      const mal = r.desborde > 0 || r.fuera.length > 0 || problemas.length > 0;
      marcas.push(mal ? `${w}✗` : `${w}·`);
      if (r.desborde > 0 || r.fuera.length > 0) fallas.push({ caso: caso.nombre, ...r });
      if (problemas.length) rotosInvariante.push({ caso: caso.nombre, ancho: r.limite, problemas });
    }
    const malEste = fallas.some(f => f.caso === caso.nombre) || rotos.some(f => f.caso === caso.nombre)
                 || rotosInvariante.some(f => f.caso === caso.nombre);
    console.log(`  ${malEste ? '✗' : '✓'} ${caso.nombre}`);
    if (malEste) console.log(`      ${marcas.join(' ')}`);
  }

  await browser.close();
  server.close();

  if (rotos.length) {
    console.log(`\n! ${rotos.length} escenario(s) no se pudieron preparar (el test no llegó a medir):\n`);
    for (const r of rotos.slice(0, 8)) console.log(`  ${r.caso} @ ${r.ancho}px — ${r.error}`);
    console.log('\nEsto no es un desborde: es el test que no supo llegar a la pantalla.');
    console.log('Suele significar que cambió un selector o un flujo — hay que actualizar el escenario.');
  }

  if (rotosInvariante.length) {
    console.log(`\n✗ ${rotosInvariante.length} invariante(s) de alineación roto(s):\n`);
    for (const r of rotosInvariante) {
      console.log(`  ${r.caso} @ ${r.ancho}px`);
      for (const p of r.problemas) console.log(`      ${p}`);
    }
    console.log('\nNo es desborde: el contenido entra, pero quedó alineado distinto de lo acordado.');
  }

  if (fallas.length === 0 && rotos.length === 0 && rotosInvariante.length === 0) {
    console.log(`\n✓ sin scroll horizontal ni elementos fuera del viewport en ningún ancho ≥ ${ANCHO_MINIMO}px`);
    console.log('✓ invariantes de alineación cumplidos');
    process.exit(0);
  }

  if (fallas.length) {
    console.log(`\n✗ ${fallas.length} medicion(es) fuera de norma:\n`);
    for (const f of fallas) {
      console.log(`  ${f.caso} @ ${f.limite}px`);
      if (f.desborde > 0) console.log(`      scroll horizontal: +${f.desborde}px`);
      for (const s of f.fuera) console.log(`      fuera del viewport: ${s.sel} (borde derecho en ${s.right}px)`);
    }
    console.log(`\nPrincipio V: la interfaz debe funcionar en cualquier ancho desde ${ANCHO_MINIMO}px hacia arriba.`);
  }
  process.exit(1);
}

main().catch(e => { console.error('El test de layout se cayó:', e); process.exit(1); });
