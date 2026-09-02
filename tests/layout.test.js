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

/* Los chips de estadística del partido finalizado (rebanada 4): asistencias a la izquierda de la
   camiseta, goles/en contra a la derecha. Un jugador con las dos cosas a la vez es el caso común,
   no un borde — y llegó a producción con los dos grupos superpuestos (`--stat-edge`/`--stat-pad`
   del handoff no dejaban lugar en una camiseta de 44 a 52px). Se compara el borde derecho de un
   grupo contra el izquierdo del otro, DENTRO de la misma camiseta — es la comparación que
   `INVARIANTE_CANCHA` no hace, porque esa sólo mide camisetas vecinas entre sí. */
const INVARIANTE_CHIPS_ESTADISTICA = () => {
  const problemas = [];
  for (const cam of document.querySelectorAll('.camiseta')) {
    const asis = cam.querySelector('.stat-asistencias');
    const gol = cam.querySelector('.stat-goles');
    if (!asis || !gol) continue;
    const a = asis.getBoundingClientRect(), g = gol.getBoundingClientRect();
    if (a.right > g.left + 0.5) {
      const nombre = (cam.querySelector('.camiseta-nombre') || {}).textContent || '?';
      problemas.push(`"${nombre}": el chip de asistencias se solapa con el de goles (${Math.round(a.right - g.left)}px)`);
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
  /* La pista del selector tiene que distinguirse de lo que tiene detrás, o el control no se lee
     como uno de dos posiciones. Es una regla de relación y no de valor: copiar el token literal
     del handoff dejaba la pista del mismo color que el fondo de página, y ningún otro test lo
     veía porque el layout entraba perfecto. */
  if (tabs.length) {
    const contenedor = tabs[0].parentElement;
    let detras = contenedor.parentElement, fondo = 'rgba(0, 0, 0, 0)';
    while (detras && fondo === 'rgba(0, 0, 0, 0)') { fondo = getComputedStyle(detras).backgroundColor; detras = detras.parentElement; }
    if (getComputedStyle(contenedor).backgroundColor === fondo) {
      problemas.push('la pista del selector tiene el mismo color que el fondo de atrás: el control no se lee');
    }
  }
  /* Toda camiseta arrastrable anuncia el gesto; si no, el arrastre es invisible para quien no
     lo descubre por accidente (NFR-003). */
  for (const c of document.querySelectorAll('.camiseta[draggable="true"]')) {
    if (!(c.getAttribute('title') || '').trim()) problemas.push('una camiseta arrastrable quedó sin title');
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* El panel de armado (rebanada 3). Corre en las pantallas que tienen cancha y equipos
   generados, en los trece anchos: es donde el encabezado nuevo tiene que entrar y donde sus dos
   botones tienen que seguir siendo alcanzables (NFR-002, NFR-003).

   El piso de 44px es el mismo que la rebanada 2 le puso a la pestaña, y por la misma razón: el
   handoff dibuja el ícono en 16px con 6px de padding —28px de lado— y su propio design system
   declara un mínimo táctil de 48. El dibujo se conserva y el área se agrega. */
const INVARIANTE_PANEL = () => {
  const header = document.querySelector('.panel-header');
  if (!header) return [];
  const problemas = [];
  for (const b of document.querySelectorAll('.panel-icono')) {
    const r = b.getBoundingClientRect();
    if (r.width < 44 - 0.5 || r.height < 44 - 0.5) {
      problemas.push(`el botón "${b.getAttribute('aria-label')}" mide ${Math.round(r.width)}x${Math.round(r.height)}px, por debajo del piso de 44px`);
    }
    if (!(b.getAttribute('aria-label') || '').trim()) {
      problemas.push('un botón de ícono del encabezado quedó sin nombre accesible');
    }
  }
  /* Ninguna de las cuatro cajitas retiradas puede reaparecer dentro de la tarjeta de equipos:
     el retiro es retiro y no ocultamiento (TC-014, AC-07). */
  const seccion = document.getElementById('teamsSection');
  if (seccion && seccion.querySelector('.conv-summary')) {
    problemas.push('volvió un .conv-summary a la tarjeta de equipos: los tres resúmenes se retiraron (D-23)');
  }
  /* El color no puede ser el único portador de "esta línea se pasó": la celda dice además el
     número con su signo y el bloque declara el umbral en palabras (NFR-003). */
  for (const celda of document.querySelectorAll('.panel-celda.excedida')) {
    const dif = celda.querySelector('.panel-celda-dif');
    if (!dif || !dif.textContent.trim() || dif.textContent.trim() === 'Parejo') {
      problemas.push('una celda marcada como excedida no dice en texto cuánto ni a favor de quién');
    }
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
  const tabs = document.querySelectorAll('.equipo-tab').length;
  const zonas = document.querySelectorAll('.team-panel[ondrop], .cancha[ondrop]').length;
  if (tabs) problemas.push(`se dibujó el selector de equipo en una pantalla sin cancha (FR-040)`);
  if (zonas) problemas.push(`${zonas} zona(s) de drop de equipos en una pantalla sin cancha`);
  /* Los arrastres de convocatoria y plantel NO entran acá: son mecanismos distintos sobre
     pantallas distintas, y esta rebanada los deja como están (FR-052). */
  if (arrastrables && !document.querySelector('.conv-row[draggable="true"], .row[draggable="true"]')) {
    problemas.push(`quedaron ${arrastrables} elementos arrastrables sin cancha y sin ser convocatoria ni plantel`);
  }
  return problemas;
};

/* La carga por toque (rebanada 6): el piso táctil de Deshacer (44×44, mismo que `.panel-icono` ya
   tenía) y del botón "−" (26×26 desde 390px, 38×38 debajo — NFR-002), más el nombre accesible de
   los dos y que cada opción del selector de evento se distinga por texto, no sólo color
   (NFR-003). Corre en los trece anchos porque el piso de "−" cambia con el ancho. */
const INVARIANTE_CARGA_TOQUE = () => {
  if (!document.querySelector('.carga-toolbar')) return [];
  const problemas = [];
  const deshacer = document.querySelector('.carga-toolbar .panel-icono');
  if (deshacer) {
    const b = deshacer.getBoundingClientRect();
    if (b.width < 44 - 0.5 || b.height < 44 - 0.5) {
      problemas.push(`Deshacer mide ${Math.round(b.width)}x${Math.round(b.height)}px, por debajo del piso de 44px (toque/NFR-002)`);
    }
    if (!(deshacer.getAttribute('aria-label') || '').trim() || !(deshacer.getAttribute('title') || '').trim()) {
      problemas.push('Deshacer quedó sin aria-label o sin title (toque/NFR-003)');
    }
  }
  const piso = window.innerWidth < 390 ? 38 : 26;
  for (const btn of document.querySelectorAll('.detalle-quitar-btn')) {
    const b = btn.getBoundingClientRect();
    if (b.width < piso - 0.5 || b.height < piso - 0.5) {
      problemas.push(`el botón "−" mide ${Math.round(b.width)}x${Math.round(b.height)}px, por debajo del piso de ${piso}px a ${window.innerWidth}px (toque/NFR-002)`);
    }
    if (!(btn.getAttribute('aria-label') || '').trim() || !(btn.getAttribute('title') || '').trim()) {
      problemas.push('un botón "−" quedó sin aria-label o sin title (toque/NFR-003)');
    }
  }
  for (const tab of document.querySelectorAll('.evento-tab')) {
    if (!tab.textContent.trim()) problemas.push('una opción del selector de evento quedó sin texto (toque/NFR-003)');
  }
  return [...new Set(problemas)].slice(0, 4);
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
    /* `finalizado/S-02c`: este mismo `comprobar` ya verifica que los bloques del panel de armado
       (combo, receipt, diferencia por línea) siguen ahí con la inscripción cerrada y no
       finalizada, exactamente lo que esa variante pide. Desde la rebanada 6 (D-12, TC-011) la
       cancha se muestra siempre, sin excepción: ya no hay un estado "cerrado" que vuelva a la
       lista de filas, así que esa rama dejó de existir para verificar. */
    spec: ['cancha/S-10', 'arrastre/S-10', 'arrastre/S-06b', 'panel/S-11', 'panel/S-11b', 'panel/S-02b', 'panel/S-03c', 'finalizado/S-02c'],
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); },
    async comprobar(page) {
      /* Con la inscripción cerrada el combo se sigue viendo pero deshabilitado, el aviso de
         desactualizado no aparece, y los bloques del panel que no dependen de la cancha siguen
         ahí (panel S-02b, S-03c, S-11, S-11b). */
      return page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha con la inscripción cerrada (D-12, TC-011)');
        const combo = document.querySelector('#selectEstrategia');
        if (!combo) problemas.push('el combo de estrategia desapareció con la inscripción cerrada (panel FR-010)');
        else if (!combo.disabled) problemas.push('el combo quedó habilitado con la inscripción cerrada (panel FR-015, S-02b)');
        if (document.querySelector('.panel-aviso')) problemas.push('apareció el aviso de desactualizado con la inscripción cerrada (panel FR-024, S-03c)');
        if (!document.querySelector('.panel-header')) problemas.push('la tarjeta perdió el encabezado nuevo (panel S-11)');
        if (!document.querySelector('.panel-receipt')) problemas.push('la tarjeta perdió el receipt (panel S-11)');
        if (!document.querySelector('.panel-lineas')) problemas.push('la tarjeta perdió la diferencia por línea (panel S-11)');
        return problemas;
      });
    } },

  { clave: 'partido-finalizado', rol: 'admin', nombre: 'detalle de partido · finalizado',
    /* `cancha/S-10a`, `arrastre/S-10a` y `panel/S-11a` decían "partido finalizado: mismo
       resultado que cerrado, sin cancha" — la rebanada 4 invierte exactamente eso (FR-020), así
       que esos tres tags dejan de describir esta pantalla y se reemplazan por los de la Spec de
       esta rebanada. */
    spec: ['finalizado/S-01', 'finalizado/S-01a', 'finalizado/S-02', 'finalizado/S-02a', 'finalizado/S-03', 'finalizado/S-04', 'finalizado/S-04b', 'finalizado/S-05'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR, INVARIANTE_PANEL, INVARIANTE_CHIPS_ESTADISTICA, INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-08-20'); },
    async comprobar(page) {
      /* A 360px (una columna): título con sólo la fecha, selector sin puntaje de armado en la
         fila de resultado, y ningún bloque del panel de armado que ya no aplica a este estado. */
      const unaColumna = await page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha del partido finalizado (finalizado/S-02)');
        if (!document.querySelector('.stat-goles, .stat-asistencias')) problemas.push('ninguna camiseta lleva chips de estadística (finalizado/S-03)');
        if (!document.querySelector('.fila-resultado')) problemas.push('no apareció la fila de resultado (finalizado/S-04)');
        if (!document.querySelector('.detalle-fila, .detalle-vacio')) problemas.push('no apareció ninguna fila de detalle (finalizado/S-05)');
        if (document.querySelector('.panel-lineas')) problemas.push('sigue la diferencia por línea en el partido finalizado (FR-043)');
        if (document.querySelector('.panel-receipt')) problemas.push('sigue el receipt en el partido finalizado (FR-043)');
        if (document.querySelector('.panel-pildora')) problemas.push('sigue la píldora de diferencia en el partido finalizado (FR-043)');
        const h4 = document.querySelector('.team-panel h4');
        if (h4 && /\d/.test(h4.textContent)) problemas.push(`el encabezado del panel de equipo repite un número (finalizado/FR-042b): "${h4.textContent.trim()}"`);
        const titulo = (document.querySelector('.panel-header-titulo h3') || {}).textContent || '';
        if (titulo.includes(' - ')) problemas.push(`a 360px el título incluyó el tamaño de cancha (finalizado/S-01a): "${titulo}"`);
        const puntajes = [...document.querySelectorAll('.resultado-puntaje')];
        if (puntajes.some(p => p.getBoundingClientRect().width > 0)) problemas.push('a 360px se ve el puntaje de armado en la fila de resultado (finalizado/S-04b)');
        const iconos = document.querySelectorAll('.panel-header-acciones .panel-icono');
        if (iconos.length !== 2) problemas.push(`el encabezado nuevo tiene ${iconos.length} ícono(s) de acción en vez de 2 (finalizado/S-01)`);
        return problemas;
      });
      /* A 1200px (dos columnas): el título suma el tamaño de cancha y la fila de resultado
         vuelve a mostrar el puntaje de armado (FR-002, FR-041). */
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.waitForTimeout(200);
      const dosColumnas = await page.evaluate(() => {
        const problemas = [];
        const titulo = (document.querySelector('.panel-header-titulo h3') || {}).textContent || '';
        if (!titulo.includes(' - ')) problemas.push(`a 1200px el título no incluyó el tamaño de cancha (finalizado/S-01): "${titulo}"`);
        const puntajes = [...document.querySelectorAll('.resultado-puntaje')];
        if (!puntajes.length || puntajes.some(p => p.getBoundingClientRect().width === 0)) {
          problemas.push('a 1200px no se ve el puntaje de armado en la fila de resultado (finalizado/S-04)');
        }
        return problemas;
      });
      return [...unaColumna, ...dosColumnas];
    } },

  /* --- la cancha (rebanada 1 de "Equipos en el campo") --- */

  { clave: 'cancha-8', rol: 'admin', nombre: 'equipos generados sobre la cancha · fútbol 8',
    /* `S-01f` es la propiedad de no-superposición: la satisface INVARIANTE_CANCHA, que corre en
       los trece anchos y sobre las dos canchas. Se declara acá porque los invariantes no llevan
       lista propia de identificadores. */
    /* El invariante del selector se suma acá porque estos dos escenarios son los que corren en
       los TRECE anchos: es donde 'una cancha con selector, dos sin él' se verifica de verdad
       en todo el rango, y no sólo en los cuatro que mide `arrastre-selector` (S-04d). */
    spec: ['cancha/S-01', 'cancha/S-01f', 'cancha/S-03', 'cancha/NFR-001', 'cancha/NFR-006', 'arrastre/S-04d', 'arrastre/NFR-001', 'panel/S-01b', 'panel/NFR-001', 'panel/NFR-002', 'panel/NFR-003'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR, INVARIANTE_PANEL],
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
    spec: ['cancha/S-01a', 'cancha/S-01f', 'cancha/S-03a', 'cancha/S-06', 'cancha/S-06a', 'cancha/S-06b', 'cancha/S-06c', 'cancha/S-06d', 'cancha/NFR-001', 'cancha/NFR-002', 'arrastre/S-04d', 'arrastre/NFR-001', 'panel/NFR-001', 'panel/NFR-002'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR, INVARIANTE_PANEL],
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
    spec: ['cancha/S-05', 'cancha/S-04c', 'panel/S-01d', 'panel/S-02c', 'panel/S-04g', 'panel/S-05e', 'panel/S-20', 'panel/S-20a', 'panel/S-20b', 'panel/S-20c', 'eventos/S-20', 'toque/S-07d'],
    invariantes: [INVARIANTE_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      return page.evaluate(async () => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('el rol jugador no ve la cancha');
        if (document.querySelector('.camiseta-puntaje')) problemas.push('el rol jugador ve puntajes sobre las camisetas (FR-024)');
        if (document.querySelector('.camiseta-candado')) problemas.push('el rol jugador ve candados (FR-030)');
        /* Los bloques que la rebanada 3 agrega son datos de armado, y 007-permisos-por-usuario
           se los prohíbe a este rol. Copiar SÍ lo tiene: el texto que copia son nombres. */
        if (document.querySelector('.panel-pildora')) problemas.push('el rol jugador ve la píldora de diferencia (panel FR-081)');
        if (document.querySelector('.panel-lineas')) problemas.push('el rol jugador ve la diferencia por línea (panel FR-081)');
        if (document.querySelector('.panel-receipt')) problemas.push('el rol jugador ve el receipt del motor (panel FR-046)');
        if (document.querySelector('.panel-estrategia')) problemas.push('el rol jugador ve el combo de estrategia (panel FR-080)');
        if (document.querySelector('.panel-aviso')) problemas.push('el rol jugador ve el aviso de equipos desactualizados (panel FR-080)');
        if (document.querySelector('.panel-icono-regenerar')) problemas.push('el rol jugador ve el botón de regenerar (panel FR-080)');
        if (document.querySelector('.panel-botonera')) problemas.push('el rol jugador ve la botonera de ciclo de vida (panel FR-080)');
        if (!document.querySelector('.panel-icono-copiar')) problemas.push('el rol jugador perdió el botón de copiar, que ya tenía (panel FR-001)');
        /* La guarda tiene que estar en el HANDLER y no sólo en la decisión de dibujar: es lo que
           un rol sin permiso puede invocar desde la consola (panel S-20a, S-20b, TC-040). */
        const escrituras0 = (window.__escrituras || []).length;
        if (window.__generarEquipos) { window.__generarEquipos('m-abierto'); await new Promise(r => setTimeout(r, 150)); }
        if ((window.__escrituras || []).length > escrituras0) {
          problemas.push('__generarEquipos escribió con rol jugador: la guarda de rol no está en el handler (panel S-20a)');
        }
        const escrituras1 = (window.__escrituras || []).length;
        if (window.__finalizarPartido) { window.__finalizarPartido('m-abierto'); await new Promise(r => setTimeout(r, 150)); }
        if ((window.__escrituras || []).length > escrituras1) {
          problemas.push('__finalizarPartido escribió con rol jugador (panel S-20c, eventos/S-20, toque/S-07d)');
        }
        /* Mismo chequeo para la edición de un resultado ya finalizado (rebanada 5, eventos/S-20):
           ni el modelo de eventos ni el histórico deberían poder escribirse con este rol. */
        const escrituras1b = (window.__escrituras || []).length;
        if (window.__guardarEdicionResultado) { window.__guardarEdicionResultado('m-finalizado-eventos'); await new Promise(r => setTimeout(r, 150)); }
        if ((window.__escrituras || []).length > escrituras1b) {
          problemas.push('__guardarEdicionResultado escribió con rol jugador (eventos/S-20, toque/S-07d)');
        }
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

  /* --- el panel de armado (rebanada 3 de "Equipos en el campo") --- */

  { clave: 'panel-armado', rol: 'admin', nombre: 'el panel alrededor de la cancha',
    /* Comportamiento y estructura, no medidas: los invariantes ya cubren los trece anchos desde
       los escenarios de cancha. Acá se mira uno de cada lado del punto de corte, porque la
       píldora cambia de lugar (FR-004 vs FR-005). */
    anchos: [360, 1200],
    spec: ['panel/S-01', 'panel/S-01c', 'panel/S-02', 'panel/S-03', 'panel/S-05', 'panel/S-07', 'panel/S-07a', 'panel/S-07b', 'panel/S-07c', 'panel/S-10'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const problemas = [];
      const ancho = page.viewportSize().width;
      const estructura = await page.evaluate(() => {
        const sec = document.getElementById('teamsSection');
        const header = sec.querySelector('.panel-header');
        return {
          titulo: header ? header.querySelector('h3').textContent.trim() : null,
          pildoraEnHeader: !!(header && header.querySelector('.panel-pildora')),
          pildoraEnFila: !!sec.querySelector('.panel-pildora-fila .panel-pildora'),
          copiar: !!sec.querySelector('.panel-icono-copiar'),
          regenerar: !!sec.querySelector('.panel-icono-regenerar'),
          ordenIconos: [...sec.querySelectorAll('.panel-icono')].map(b => b.className.includes('copiar') ? 'copiar' : 'regenerar'),
          combo: !!sec.querySelector('#selectEstrategia'),
          resumen: (sec.querySelector('.panel-estrategia-resumen') || {}).textContent || '',
          interrogacion: !!sec.querySelector('.info-icon'),
          celdas: [...sec.querySelectorAll('.panel-celda')].map(c => c.querySelector('.panel-celda-linea').textContent.trim()),
          receipt: !!sec.querySelector('.panel-receipt'),
          receiptItems: sec.querySelectorAll('.panel-receipt li').length,
          receiptConCaja: sec.querySelector('.panel-receipt')
            ? getComputedStyle(sec.querySelector('.panel-receipt')).backgroundColor !== 'rgba(0, 0, 0, 0)' : false,
          cajitas: sec.querySelectorAll('.conv-summary').length,
          copiarEnPie: !!sec.querySelector('.panel-botonera .btn-ghost[onclick*="copiarFormacion"]'),
        };
      });
      if (estructura.titulo !== 'Alineaciones') problemas.push(`el encabezado dice "${estructura.titulo}" y debería decir "Alineaciones" (FR-001)`);
      if (!estructura.copiar || !estructura.regenerar) problemas.push('faltan los botones de ícono del encabezado (FR-001, FR-002)');
      if (estructura.ordenIconos.join(',') !== 'copiar,regenerar') problemas.push(`los íconos van Copiar primero y quedaron ${estructura.ordenIconos.join(',')} (FR-002b)`);
      if (estructura.copiarEnPie) problemas.push('Copiar sigue al pie: subió al encabezado (FR-063)');
      if (estructura.cajitas) problemas.push(`quedaron ${estructura.cajitas} .conv-summary en la tarjeta: los tres resúmenes se retiraron (D-23, AC-07)`);
      if (!estructura.combo) problemas.push('no se dibujó el combo de estrategia (FR-010)');
      if (!estructura.resumen.trim()) problemas.push('el combo no muestra el resumen de la estrategia (FR-011)');
      if (estructura.interrogacion) problemas.push('sigue el ícono "?" en el combo: lo reemplaza el resumen visible (FR-012)');
      /* La grilla sólo aparece si el armado guardado lleva balance por línea. El fixture ahora lo
         lleva, así que ausencia acá es un fallo y no un "no aplica" (FR-030, S-10). */
      if (estructura.celdas.join(',') !== 'Arco,Defensa,Medio,Ataque') {
        problemas.push(`la grilla dibujó [${estructura.celdas.join(', ')}] y se esperaban las cuatro líneas (FR-030, FR-031b)`);
      }
      if (!estructura.receipt) problemas.push('no se dibujó el bloque "Por qué quedaron así" (FR-040)');
      if (!estructura.receiptItems) problemas.push('el receipt quedó sin ninguna viñeta (FR-041)');
      if (estructura.receiptConCaja) problemas.push('el receipt conserva fondo propio: va sin caja, con divisor (FR-042)');
      /* La píldora vive en el encabezado en dos columnas y baja a su propia fila en una. */
      if (ancho >= 901 && !estructura.pildoraEnHeader) problemas.push('en dos columnas la píldora va en el encabezado (FR-004)');
      if (ancho <= 900 && !estructura.pildoraEnFila) problemas.push('en una columna la píldora baja a la fila del equipo visible (FR-005)');

      /* S-03: el aviso aparece con su texto de siempre cuando algo cambió desde la generación.
         El fixture lo dispara porque su configHash no coincide con el de la aplicación. */
      const aviso = await page.evaluate(() => {
        const a = document.querySelector('.panel-aviso');
        return a ? { texto: a.textContent, regenerar: !!a.querySelector('button') } : null;
      });
      if (!aviso) problemas.push('no se dibujó el aviso de equipos desactualizados (S-03)');
      else {
        if (!aviso.texto.includes('La convocatoria, la estrategia o la configuración del motor cambiaron')) {
          problemas.push('el aviso no conserva el texto que cubre los cuatro disparadores (D-05, FR-021)');
        }
        if (!aviso.regenerar) problemas.push('el aviso no ofrece regenerar (FR-022)');
      }

      /* S-07a / S-07b: el navegador conducido arranca SIN permiso de portapapeles, que es
         exactamente el caso de fallo. La confirmación no aparece y el error se cuenta con el
         aviso flotante, que es lo único que queda para contarlo (FR-006b, FR-006c). */
      const denegado = await page.evaluate(async () => {
        const btn = document.querySelector('.panel-icono-copiar');
        btn.click();
        await new Promise(r => setTimeout(r, 300));
        return {
          tilde: document.querySelector('.panel-icono-copiar').classList.contains('copiado'),
          aviso: !!document.querySelector('#appToast.show'),
        };
      });
      if (denegado.tilde) problemas.push('sin acceso al portapapeles apareció el tilde de confirmación (FR-006c)');
      if (!denegado.aviso) problemas.push('sin acceso al portapapeles no se avisó el error (FR-006b)');

      /* S-07 y S-07c: con permiso, copiar confirma con su propio ícono y sin aviso flotante, y
         dos clicks seguidos no dejan el tilde trabado ni dos temporizadores compitiendo. */
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      const copiado = await page.evaluate(async () => {
        const btn = () => document.querySelector('.panel-icono-copiar');
        const toast = document.getElementById('appToast');
        if (toast) toast.classList.remove('show');
        btn().click();
        await new Promise(r => setTimeout(r, 300));
        const tras1 = btn().classList.contains('copiado');
        const avisoTras1 = !!document.querySelector('#appToast.show');
        btn().click();
        await new Promise(r => setTimeout(r, 300));
        const tras2 = btn().classList.contains('copiado');
        return { tras1, tras2, avisoTras1 };
      });
      if (!copiado.tras1) problemas.push('copiar no cambió el ícono a un tilde (FR-006)');
      if (copiado.avisoTras1) problemas.push('copiar mostró un aviso flotante además del tilde: la confirmación es el ícono (FR-006)');
      if (!copiado.tras2) problemas.push('un segundo click antes del plazo dejó el tilde trabado o apagado (S-07c)');
      await page.waitForTimeout(2000);
      const volvio = await page.evaluate(() => !document.querySelector('.panel-icono-copiar').classList.contains('copiado'));
      if (!volvio) problemas.push('el tilde no volvió solo al ícono de copiar pasados 1800ms (FR-006)');
      return problemas;
    } },

  { clave: 'panel-umbral', rol: 'admin', nombre: 'la regla de color con un desvío aceptable configurado',
    /* Un solo ancho: la regla de color no depende del layout, y lo que se mide acá es cuáles
       celdas quedan marcadas. La regla en sí está cubierta por unidad en panel.test.js. */
    anchos: [1200],
    spec: ['panel/S-04', 'panel/S-04a'],
    /* El umbral se pone por la pantalla de Configuración y no por el fixture, para no cambiar el
       camino sin umbral que miden todos los demás escenarios (Implementation Plan, TD-10). */
    async preparar(page) {
      await irAPestania(page, 'Configuración');
      const campo = await page.$('input[type="number"]');
      if (campo) { await campo.fill('1'); await campo.dispatchEvent('change'); await page.waitForTimeout(250); }
      await abrirPartido(page, '2026-09-03');
    },
    async comprobar(page) {
      const problemas = [];
      const celdas = await page.evaluate(() => [...document.querySelectorAll('.panel-celda')].map(c => ({
        linea: c.querySelector('.panel-celda-linea').textContent.trim(),
        texto: c.querySelector('.panel-celda-dif').textContent.trim(),
        excedida: c.classList.contains('excedida'),
      })));
      const desvio = await page.evaluate(() => {
        const d = document.querySelector('.panel-lineas-desvio');
        return d ? d.textContent.trim() : null;
      });
      if (!celdas.length) return ['no se dibujó la grilla de diferencia por línea (FR-030)'];
      if (!desvio || !desvio.includes('Desvío aceptable')) problemas.push('con umbral configurado, el bloque debe declararlo en palabras (FR-032, NFR-003)');
      const por = Object.fromEntries(celdas.map(c => [c.linea, c]));
      /* El plantel testigo tiene un solo candidato a arquero y un solo titular con puntaje de
         delantero, así que el Arco y el Ataque quedan desparejos por 6. Aunque son líneas de un
         solo lugar por equipo (esa diferencia sigue siendo inevitable y el receipt la sigue
         explicando así), el color ya no distingue: con el umbral en 1, las cuatro líneas que
         superan el desvío se marcan igual. */
      if (!por.Defensa || !por.Defensa.excedida) problemas.push('la Defensa supera el desvío y podía repartirse: debería quedar marcada (FR-033)');
      if (!por.Medio || !por.Medio.excedida) problemas.push('el Medio supera el desvío y podía repartirse: debería quedar marcado (FR-033)');
      if (!por.Arco) problemas.push('el Arco no se dibujó: el fixture debería dejarlo con puntaje');
      else if (!por.Arco.excedida) problemas.push(`el Arco supera el desvío (${por.Arco.texto}): debería quedar marcado igual que Defensa y Medio`);
      if (!por.Ataque) problemas.push('el Ataque no se dibujó: el fixture debería dejarlo con puntaje');
      else if (!por.Ataque.excedida) problemas.push(`el Ataque supera el desvío (${por.Ataque.texto}): debería quedar marcado igual que Defensa y Medio`);
      return problemas;
    } },

  { clave: 'panel-recalculo', rol: 'admin', nombre: 'los números siguen al reparto y el texto no',
    anchos: [1200],
    spec: ['panel/S-06', 'panel/S-06b', 'panel/NFR-004', 'panel/NFR-005'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const problemas = [];
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      const leer = () => page.evaluate(() => ({
        pildora: (document.querySelector('.panel-pildora') || {}).textContent || null,
        celdas: [...document.querySelectorAll('.panel-celda')].map(c => c.querySelector('.panel-celda-cifras').textContent.trim()),
        receipt: [...document.querySelectorAll('.panel-receipt li')].map(li => li.textContent.trim()),
      }));
      const antes = await leer();
      const ms = await page.evaluate(async () => {
        const cam = document.querySelector('.camiseta[draggable="true"]');
        const otra = [...document.querySelectorAll('.cancha')][1];
        const dt = new DataTransfer();
        cam.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        const t0 = performance.now();
        otra.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
        await new Promise(res => requestAnimationFrame(res));
        return performance.now() - t0;
      });
      await page.waitForTimeout(300);
      const despues = await leer();
      if (!antes.celdas.length) return ['no había grilla que recalcular: el fixture debería llevar balanceLineas'];
      if (JSON.stringify(antes.celdas) === JSON.stringify(despues.celdas)) {
        problemas.push('la grilla muestra los mismos números después de mover a alguien: no se recalculó (FR-071, D-25)');
      }
      if (antes.pildora === despues.pildora) {
        problemas.push('la píldora muestra la misma diferencia después de mover a alguien (FR-070)');
      }
      /* La otra mitad de D-25: el texto NO sigue al reparto. Describe la última generación. */
      if (JSON.stringify(antes.receipt) !== JSON.stringify(despues.receipt)) {
        problemas.push('el receipt cambió tras un movimiento manual: describe la generación, no el estado (FR-072)');
      }
      if (ms > 150) problemas.push(`el ciclo mover-recalcular-repintar tardó ${Math.round(ms)}ms, por encima del techo de 150ms (NFR-004)`);
      /* El recálculo es de render: no escribe nada por sí mismo. Lo que escribe es el movimiento,
         que ya existía (FR-073, NFR-005). */
      const claves = await page.evaluate(() =>
        [...new Set((window.__escrituras || []).slice(window.__escrituras_base || 0))]);
      const permitidas = ['partidos', 'partidosArmado'];
      const deMas = claves.filter(k => !permitidas.includes(k));
      if (deMas.length) problemas.push(`el recálculo escribió claves inesperadas: ${deMas.join(', ')} (FR-073, NFR-005)`);
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
    /* `cancha/S-10b` y `arrastre/S-10b` decían "editando un finalizado: sin cancha, vuelve la
       lista" — la rebanada 6 cierra exactamente esa frontera (D-12, TC-011): la cancha se muestra
       en TODO estado, sin ninguna excepción, así que esos dos tags dejan de describir esta
       pantalla (mismo criterio que la rebanada 4 usó para `cancha/S-10a` en `partido-finalizado`).
       `finalizado/S-01d`/`finalizado/S-02b` siguen vigentes: no son sobre cancha-vs-lista. */
    anchos: [360, 900, 1200], spec: ['finalizado/S-01d', 'finalizado/S-02b', 'toque/S-07'],
    async preparar(page) {
      await abrirPartido(page, '2026-08-20');
      // El botón dejó de llevar texto visible: ahora es un ícono con aria-label (rebanada 4, FR-006).
      await page.click('[aria-label="Editar resultado"]');
      await page.waitForTimeout(400);
    },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha editando un resultado finalizado (D-12, TC-011)');
        if (document.querySelector('.team-player-row')) problemas.push('volvió la lista de filas vieja al editar un resultado finalizado (D-12)');
        if (!document.querySelector('.carga-toolbar')) problemas.push('no apareció el selector de tipo de evento al editar un resultado finalizado (toque/S-07)');
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
    spec: ['finalizado/S-01c', 'finalizado/S-20', 'toque/S-07d'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR, INVARIANTE_CHIPS_ESTADISTICA, INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA],
    async preparar(page) { await abrirPartido(page, '2026-08-20'); },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        /* Mismo contenido que `partido-finalizado`, salvo el lápiz (TD-01, FR-060, FR-061): los
           dos roles comparten la misma rama de render. */
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha del partido finalizado para el rol jugador (finalizado/S-01c)');
        if (!document.querySelector('.stat-goles, .stat-asistencias')) problemas.push('ninguna camiseta lleva chips de estadística para el rol jugador');
        if (!document.querySelector('.fila-resultado')) problemas.push('no apareció la fila de resultado para el rol jugador');
        if (!document.querySelector('.detalle-fila, .detalle-vacio')) problemas.push('no apareció ninguna fila de detalle para el rol jugador');
        if (document.querySelector('.panel-icono-editar')) problemas.push('el rol jugador ve el ícono de editar resultado (finalizado/S-01c, FR-061)');
        // Invocación directa, sin pasar por ningún botón: la guarda vive en la propia función
        // (FR-062, TC-040), y llamarla sin permiso no debe mover ni un dato ni la pantalla.
        const escriturasAntes = (window.__escrituras || []).length;
        window.__editarResultadoFinalizado('m-finalizado');
        if ((window.__escrituras || []).length !== escriturasAntes) {
          problemas.push('invocar __editarResultadoFinalizado sin permiso produjo una escritura (finalizado/S-20, TC-040, toque/S-07d)');
        }
        if (!document.querySelector('.cancha')) problemas.push('invocar __editarResultadoFinalizado sin permiso cambió la pantalla a la de edición (finalizado/S-20, TC-040)');
        return problemas;
      });
    } },

  { clave: 'finalizado-nueve', rol: 'admin', nombre: 'partido finalizado · fútbol 9',
    /* Mismo criterio que `partido-editando` (`arrastre/S-10b`): no depende del ancho más allá
       del corte de columnas, así que basta con los dos anchos donde el corte cambia de lado. */
    anchos: [360, 1200],
    spec: ['finalizado/S-01b', 'finalizado/S-10', 'finalizado/S-10a'],
    invariantes: [INVARIANTE_CHIPS_ESTADISTICA],
    async preparar(page) { await abrirPartido(page, '2026-09-24'); },
    async comprobar(page) {
      const unaColumna = await page.evaluate(() => (document.querySelector('.panel-header-estrategia') || {}).textContent || '');
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.waitForTimeout(200);
      const dosColumnas = await page.evaluate(() => (document.querySelector('.panel-header-estrategia') || {}).textContent || '');
      const problemas = [];
      if (!/^Fútbol 9 · Formación 3-4-1 · Estrategia:/.test(unaColumna)) {
        problemas.push(`a 360px la línea de estrategia de fútbol 9 no coincide (finalizado/S-10a): "${unaColumna}"`);
      }
      if (!/^Formación 3-4-1 · Estrategia:/.test(dosColumnas)) {
        problemas.push(`a 1200px la línea de estrategia de fútbol 9 no coincide (finalizado/S-01b, finalizado/S-10): "${dosColumnas}"`);
      }
      return problemas;
    } },

  /* La carga por toque (rebanada 6 de "Equipos en el campo"). Corre en los trece anchos por
     `INVARIANTE_CARGA_TOQUE` (NFR-001, NFR-002); el comportamiento —lo que no depende del
     ancho— corre una sola vez, en el primer ancho de la lista (360px, una columna, con
     selector de equipo). Guardar/editar/cancelar quedan en `eventos-finalizar`/`eventos-editar`,
     reescritos para tocar en vez de llenar inputs (toque/S-07, S-07a, S-07b, S-07c, S-07d). */
  { clave: 'carga-por-toque', rol: 'admin', nombre: 'cargar un resultado tocando la cancha',
    spec: ['toque/S-01', 'toque/S-01a', 'toque/S-01c', 'toque/S-01e', 'toque/S-01f', 'toque/S-04d', 'toque/S-04e', 'toque/S-05a', 'toque/S-06'],
    invariantes: [INVARIANTE_CARGA_TOQUE],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); }, // m-cerrado: cerrado, sin resultado
    async comprobar(page) {
      return page.evaluate(async () => {
        const problemas = [];
        const individuales = () => [...document.querySelectorAll('.camiseta-nombre')].filter(n => !n.closest('.camiseta-dupla'));
        const pillDe = (nombre) => {
          const p = nombre.closest('.camiseta').querySelector('.stat-goles .stat-pill');
          return p ? p.textContent.trim() : null;
        };

        // toque/S-01, S-01a: tocar el nombre agrega un evento y sube la pastilla a "1"; un
        // segundo toque la suma a "2" (FR-030, FR-031, FR-040, FR-041).
        if (!individuales().length) { problemas.push('no se encontró ningún nombre individual (no-dupla) en m-cerrado'); return problemas; }
        individuales()[0].click();
        let pill = pillDe(individuales()[0]);
        if (pill !== '1') problemas.push(`tocar el nombre no dejó la pastilla en "1" (toque/S-01): "${pill}"`);
        individuales()[0].click();
        pill = pillDe(individuales()[0]);
        if (pill !== '2') problemas.push(`un segundo toque no sumó la pastilla a "2" (toque/S-01a): "${pill}"`);

        // toque/S-01c [concurrency]: dos toques disparados sin esperar entre medio agregan
        // exactamente dos eventos, no uno ni tres.
        const n = individuales()[0];
        n.click(); n.click();
        pill = pillDe(individuales()[0]);
        if (pill !== '4') problemas.push(`el doble toque casi simultáneo no dejó la pastilla en "4" (toque/S-01c): "${pill}"`);

        // toque/S-01f: sobre una unidad individual, tocar la CAMISETA (la silueta, no sólo el
        // nombre) también agrega el evento — la convivencia práctica en un teléfono real mostró
        // que el nombre solo era un blanco demasiado chico.
        const figIndividual = individuales()[0].closest('.camiseta').querySelector('.camiseta-fig');
        figIndividual.click();
        pill = pillDe(individuales()[0]);
        if (pill !== '5') problemas.push(`tocar la camiseta (no el nombre) no sumó la pastilla a "5" (toque/S-01f, FR-030): "${pill}"`);

        // toque/S-04d, S-04e: mantener presionado saca uno de la familia activa, y el toque corto
        // que sigue —su cola natural al soltar— no vuelve a agregar (FR-054, FR-054b). Se invoca
        // el handler directamente en vez de esperar un `setTimeout` real de 550ms en cada uno de
        // los trece anchos; acá sólo hace falta un `await` real una vez, en el primer ancho.
        const idIndividual = individuales()[0].closest('.camiseta').getAttribute('onclick').match(/,'([^']+)'\)/)[1];
        window.__presionarInicio('m-cerrado', idIndividual);
        await new Promise(r => setTimeout(r, 650));
        pill = pillDe(individuales()[0]);
        if (pill !== '4') problemas.push(`mantener presionado no bajó la pastilla a "4" (toque/S-04d, FR-054): "${pill}"`);
        window.__tocarNombreJugador('m-cerrado', idIndividual); // la cola del gesto: no debe agregar de nuevo
        pill = pillDe(individuales()[0]);
        if (pill !== '4') problemas.push(`el toque que sigue a una mantención resuelta agregó de más (toque/S-04e, FR-054b): "${pill}"`);
        individuales()[0].click(); // un toque genuino posterior sí debe agregar, normal
        pill = pillDe(individuales()[0]);
        if (pill !== '5') problemas.push(`un toque normal después de una mantención resuelta no volvió a agregar (toque/S-04e): "${pill}"`);

        // toque/S-04e [failure]: mantener presionado a un jugador sin ningún evento de la familia
        // activa no cambia el borrador — ni agrega ni quita ninguna fila de detalle.
        const sinEventos = individuales()[1];
        if (!sinEventos) {
          problemas.push('no se encontró un segundo nombre individual sin eventos para probar toque/S-04e');
        } else {
          const idSinEventos = sinEventos.closest('.camiseta').getAttribute('onclick').match(/,'([^']+)'\)/)[1];
          const filasAntesDeLaMantencion = document.querySelectorAll('.detalle-fila').length;
          window.__presionarInicio('m-cerrado', idSinEventos);
          await new Promise(r => setTimeout(r, 650));
          // El click que sigue al soltar (misma gesticulación física) también hay que simularlo:
          // es la cola natural de ESTA mantención, no un toque nuevo (FR-054b).
          window.__tocarNombreJugador('m-cerrado', idSinEventos);
          if (document.querySelectorAll('.detalle-fila').length !== filasAntesDeLaMantencion) {
            problemas.push('mantener presionado (+ su toque final) a un jugador sin eventos de la familia activa cambió el detalle (toque/S-04e)');
          }
        }

        // toque/S-01e: tocar el nombre de un integrante de una dupla agrega el evento sólo a ESE
        // integrante — el detalle muestra una fila propia por jugador, nunca combinada (FR-030b).
        const dupla = document.querySelector('.camiseta-dupla');
        if (!dupla) {
          problemas.push('no se encontró ninguna dupla de rotación en m-cerrado (toque/S-01e)');
        } else {
          // Sobre una dupla el toque queda acotado al nombre de cada integrante: tocar la
          // camiseta fuera de los dos nombres no agrega ningún evento, porque ahí no hay a quién
          // atribuírselo sin un segundo control (FR-030b, TD-01).
          const filasAntesDeTocarLaCamiseta = document.querySelectorAll('.detalle-fila').length;
          dupla.closest('.camiseta').querySelector('.camiseta-fig').click();
          if (document.querySelectorAll('.detalle-fila').length !== filasAntesDeTocarLaCamiseta) {
            problemas.push('tocar la camiseta de una dupla fuera de los nombres agregó un evento (toque/S-01e, FR-030b)');
          }
          const nombresDupla = [...dupla.querySelectorAll('.camiseta-nombre')];
          if (nombresDupla.length !== 2) {
            problemas.push(`la dupla no tiene exactamente dos nombres (toque/S-01e): ${nombresDupla.length}`);
          } else {
            // El orden de las filas de detalle es por convocatoria, no por orden de toque: hay
            // que ubicar la fila de cada integrante por su jugadorId (el que ya lleva el
            // `onclick` del nombre), no por posición.
            const idDe = (nombre) => nombre.getAttribute('onclick').match(/,'([^']+)'\)/)[1];
            const idA = idDe(nombresDupla[0]), idB = idDe(nombresDupla[1]);
            const filaDe = (id) => [...document.querySelectorAll('.detalle-fila')]
              .find(f => { const b = f.querySelector('.detalle-quitar-btn'); return b && b.getAttribute('onclick').includes(`'${id}','goles'`); });
            const filasAntes = document.querySelectorAll('.detalle-fila').length;
            nombresDupla[0].click();
            const filasA = document.querySelectorAll('.detalle-fila');
            if (filasA.length !== filasAntes + 1) {
              problemas.push(`tocar el primer integrante de la dupla no agregó una fila de detalle propia (toque/S-01e): ${filasAntes} -> ${filasA.length}`);
            }
            const cifraA = filaDe(idA) && filaDe(idA).querySelector('.detalle-cifra');
            if (!cifraA || cifraA.textContent.trim() !== '1') problemas.push(`la fila del primer integrante no muestra "1" (toque/S-01e): "${cifraA && cifraA.textContent.trim()}"`);
            nombresDupla[1].click();
            const filasB = document.querySelectorAll('.detalle-fila');
            if (filasB.length !== filasAntes + 2) {
              problemas.push(`tocar el segundo integrante de la dupla no agregó una segunda fila propia (toque/S-01e): ${filasAntes} -> ${filasB.length}`);
            }
            // La fila del primer integrante no debe haber cambiado: cada nombre es su propio destino.
            const cifraAOtraVez = filaDe(idA) && filaDe(idA).querySelector('.detalle-cifra');
            if (!cifraAOtraVez || cifraAOtraVez.textContent.trim() !== '1') {
              problemas.push(`tocar al segundo integrante alteró la fila del primero (toque/S-01e): "${cifraAOtraVez && cifraAOtraVez.textContent.trim()}"`);
            }
            const cifraB = filaDe(idB) && filaDe(idB).querySelector('.detalle-cifra');
            if (!cifraB || cifraB.textContent.trim() !== '1') problemas.push(`la fila del segundo integrante no muestra "1" (toque/S-01e): "${cifraB && cifraB.textContent.trim()}"`);
          }
        }

        // toque/S-06: cambiar de pestaña de equipo conserva los eventos ya cargados de Blanco, y
        // el marcador del equipo que no está en pantalla también deriva del borrador completo
        // (FR-020 a FR-022).
        const totalBlanco = document.getElementById('totalBlancoSpan');
        const marcadorBlancoAntes = totalBlanco ? totalBlanco.textContent : null;
        const tabOtra = document.querySelector('.equipo-tab[aria-pressed="false"]');
        if (!tabOtra) {
          problemas.push('no había pestaña del otro equipo para cambiar (toque/S-06)');
        } else {
          tabOtra.click();
          const totalNegroAntes = document.getElementById('totalNegroSpan');
          if (!totalNegroAntes || !/·\s*0\s*goles/.test(totalNegroAntes.textContent)) {
            problemas.push(`el marcador de Negro antes de tocarlo no muestra "0 goles" (toque/S-06, FR-022): "${totalNegroAntes && totalNegroAntes.textContent}"`);
          }
          const nombreNegro = individuales()[0];
          if (nombreNegro) nombreNegro.click();
          const totalNegroDespues = document.getElementById('totalNegroSpan');
          if (!totalNegroDespues || !/·\s*1\s*gol\b/.test(totalNegroDespues.textContent)) {
            problemas.push(`tocar un nombre de Negro no actualizó su marcador a "1 gol" (toque/S-06): "${totalNegroDespues && totalNegroDespues.textContent}"`);
          }
          const tabBlanco = document.querySelector('.equipo-tab[aria-pressed="false"]');
          if (tabBlanco) tabBlanco.click();
          const totalBlancoDespues = document.getElementById('totalBlancoSpan');
          if (!totalBlancoDespues || totalBlancoDespues.textContent !== marcadorBlancoAntes) {
            problemas.push(`el marcador de Blanco cambió al volver de la pestaña de Negro (toque/S-06): "${marcadorBlancoAntes}" -> "${totalBlancoDespues && totalBlancoDespues.textContent}"`);
          }
        }

        // toque/S-05a: Deshacer está habilitado mientras el borrador tiene eventos, y se
        // deshabilita exactamente cuando queda vacío (FR-062).
        const deshacer = () => document.querySelector('.carga-toolbar .panel-icono');
        if (!deshacer()) {
          problemas.push('no se encontró el botón Deshacer (toque/S-05a)');
        } else if (deshacer().disabled) {
          problemas.push('Deshacer está deshabilitado con eventos ya cargados (toque/S-05a)');
        } else {
          let vueltas = 0;
          while (deshacer() && !deshacer().disabled && vueltas < 20) { deshacer().click(); vueltas++; }
          if (!deshacer() || !deshacer().disabled) problemas.push(`Deshacer nunca quedó deshabilitado tras ${vueltas} toques (toque/S-05a)`);
        }

        return problemas;
      });
    } },

  /* Las tres escenarios de abajo no miden geometría: existen sólo para inspeccionar
     `window.__ultimosDocs`, el documento realmente persistido, no el viewport. Un solo ancho
     alcanza. Desde la rebanada 6 la carga es por toque, no por input numérico — `eventos-finalizar`
     y `eventos-editar` (rebanada 5) se reescriben para tocar nombres en vez de llenar
     `.team-stat-input`, que ya no existe (D-12); el contrato que verifican (qué formato persiste
     `m.resultado`) no cambió, sólo el gesto que lo llena. */
  { clave: 'eventos-finalizar', rol: 'admin', nombre: 'finalizar un partido nuevo persiste eventos',
    anchos: [1200],
    spec: ['eventos/S-01', 'eventos/S-01a', 'toque/S-07', 'toque/S-07a'],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); }, // m-cerrado: cerrado, sin resultado
    async comprobar(page) {
      const problemas = [];

      // eventos/S-01, toque/S-07: tocar el nombre de un titular carga un evento no trivial, y
      // finalizar persiste `eventos`, no `statsPorJugador` (FR-030, FR-071). Sobre una unidad
      // individual el toque vive en el contenedor `.camiseta`, no en el `<span>` del nombre
      // (toque/S-01f): el click sobre el nombre sigue funcionando por burbujeo, pero el
      // `onclick` con el jugadorId hay que leerlo del contenedor.
      const jugadorId = await page.evaluate(() => {
        const nombre = [...document.querySelectorAll('.camiseta-nombre')].find(n => !n.closest('.camiseta-dupla'));
        if (!nombre) return null;
        const id = nombre.closest('.camiseta').getAttribute('onclick').match(/,'([^']+)'\)/)[1];
        nombre.click();
        return id;
      });
      if (!jugadorId) {
        problemas.push('no se encontró ningún nombre individual (no-dupla) para tocar en m-cerrado (eventos/S-01)');
        return problemas;
      }
      await page.evaluate((id) => window.__finalizarPartido(id), 'm-cerrado');
      await page.waitForSelector('#confirmModal.open');
      await page.click('#btnConfirmOk');
      await page.waitForTimeout(200);

      const doc1 = await page.evaluate(() =>
        (JSON.parse(window.__ultimosDocs.partidos || '[]')).find(p => p.id === 'm-cerrado'));
      if (!doc1 || !doc1.resultado) { problemas.push('finalizar m-cerrado no dejó ningún resultado persistido (eventos/S-01)'); return problemas; }
      if (!Array.isArray(doc1.resultado.eventos)) problemas.push('el resultado persistido no tiene "eventos" como arreglo (eventos/S-01, FR-071)');
      else if (doc1.resultado.eventos.length === 0) problemas.push('el arreglo de eventos quedó vacío, pese a haber tocado un nombre (eventos/S-01, toque/S-07)');
      else if (!doc1.resultado.eventos.some(e => e.jugadorId === jugadorId && e.tipo === 'gol')) {
        problemas.push(`el evento tocado (gol de ${jugadorId}) no aparece en la secuencia persistida (toque/S-07)`);
      }
      if ('statsPorJugador' in doc1.resultado) problemas.push('el resultado persistido todavía tiene la clave "statsPorJugador" (eventos/S-01, FR-071)');

      // eventos/S-01a, toque/S-07a: un borrador vacío (m-abierto, cerrado sin tocar ningún
      // nombre) también persiste un arreglo de eventos VACÍO, no ausente.
      await page.evaluate(() => window.__toggleInscripcion('m-abierto'));
      // window.__openMatch, no abrirPartido: ya estamos dentro del detalle de m-cerrado, y la
      // lista de partidos no queda visible para volver a clickear una tarjeta (D-08, TD-07).
      await page.evaluate(() => window.__openMatch('m-abierto'));
      await page.waitForTimeout(300); // deja correr ensureResultadoDraft, ya con la inscripción cerrada
      await page.evaluate(() => window.__finalizarPartido('m-abierto'));
      await page.waitForSelector('#confirmModal.open');
      await page.click('#btnConfirmOk');
      await page.waitForTimeout(200);
      const doc2 = await page.evaluate(() =>
        (JSON.parse(window.__ultimosDocs.partidos || '[]')).find(p => p.id === 'm-abierto'));
      if (!doc2 || !doc2.resultado || !Array.isArray(doc2.resultado.eventos)) {
        problemas.push('finalizar sin tocar ningún nombre no dejó "eventos" como arreglo (eventos/S-01a, toque/S-07a)');
      } else if (doc2.resultado.eventos.length !== 0) {
        problemas.push(`el borrador vacío debería dar un arreglo vacío, no ${doc2.resultado.eventos.length} eventos (eventos/S-01a, toque/S-07a)`);
      }
      return problemas;
    } },

  { clave: 'eventos-editar', rol: 'admin', nombre: 'editar un resultado preserva el formato del partido',
    anchos: [1200],
    spec: ['eventos/S-03', 'eventos/S-03a', 'eventos/S-04', 'toque/S-07', 'toque/S-07b', 'toque/S-07c'],
    async preparar(page) { await abrirPartido(page, '2026-08-22'); }, // m-finalizado-eventos
    async comprobar(page) {
      const problemas = [];

      // toque/S-07b: tocar un nombre y después Cancelar descarta el borrador sin escribir nada
      // en m.resultado (FR-074) — se prueba ANTES de guardar nada, sobre el estado original.
      await page.click('[aria-label="Editar resultado"]');
      await page.waitForTimeout(300);
      const original = await page.evaluate(() => JSON.stringify(window.__ultimosDocs || {}));
      await page.evaluate(() => {
        const nombre = document.querySelector('.camiseta-nombre');
        if (nombre) nombre.click();
      });
      await page.evaluate(() => window.__cancelarEdicionResultado('m-finalizado-eventos'));
      await page.waitForTimeout(150);
      const trasCancelar = await page.evaluate(() => JSON.stringify(window.__ultimosDocs || {}));
      if (trasCancelar !== original) problemas.push('Cancelar dejó una escritura en window.__ultimosDocs, pese a no haber guardado (toque/S-07b, FR-074)');

      // eventos/S-03, eventos/S-03a, toque/S-07: editar un partido con `eventos` reconstruye la
      // secuencia; tocar el botón "−" de la fila de asistencias la hace desaparecer del arreglo
      // (no la deja en 0, D-04), y tocar un nombre agrega un evento nuevo.
      await page.click('[aria-label="Editar resultado"]');
      await page.waitForTimeout(300);
      const nuevoJugadorId = await page.evaluate(() => {
        const filaAsist = [...document.querySelectorAll('.detalle-fila')].find(f => f.querySelector('img[alt="Asistencias"]'));
        if (filaAsist) filaAsist.querySelector('.detalle-quitar-btn').click();
        const nombre = [...document.querySelectorAll('.camiseta-nombre')].find(n => !n.closest('.camiseta-dupla'));
        if (!nombre) return null;
        // El onclick con el jugadorId vive en el contenedor sobre una unidad individual (toque/S-01f).
        const id = nombre.closest('.camiseta').getAttribute('onclick').match(/,'([^']+)'\)/)[1];
        nombre.click();
        return id;
      });
      await page.evaluate(() => window.__guardarEdicionResultado('m-finalizado-eventos'));
      await page.waitForSelector('#confirmModal.open');
      await page.click('#btnConfirmOk');
      await page.waitForTimeout(200);
      const doc1 = await page.evaluate(() =>
        (JSON.parse(window.__ultimosDocs.partidos || '[]')).find(p => p.id === 'm-finalizado-eventos'));
      if (!doc1 || !Array.isArray(doc1.resultado.eventos)) problemas.push('editar m-finalizado-eventos no dejó "eventos" como arreglo (eventos/S-03)');
      else {
        if (doc1.resultado.eventos.some(e => e.tipo === 'asistencia')) problemas.push('la asistencia sacada con "−" sigue en la secuencia reconstruida (eventos/S-03a)');
        if (nuevoJugadorId && !doc1.resultado.eventos.some(e => e.jugadorId === nuevoJugadorId && e.tipo === 'gol')) {
          problemas.push('el evento agregado por toque durante la edición no aparece en la secuencia guardada (toque/S-07)');
        }
      }
      if (doc1 && 'statsPorJugador' in doc1.resultado) problemas.push('editar un partido con eventos le agregó la clave "statsPorJugador" (eventos/S-03)');

      // eventos/S-04, toque/S-07c: editar un partido histórico (sólo statsPorJugador) sigue
      // escribiendo statsPorJugador, sin ganar nunca la clave "eventos" — no se migra al
      // editarlo (D-06). window.__openMatch, no abrirPartido: ya estamos dentro de otro detalle,
      // sin la lista visible para volver a clickear una tarjeta (mismo criterio de arriba).
      await page.evaluate(() => window.__openMatch('m-finalizado'));
      await page.waitForTimeout(300);
      await page.click('[aria-label="Editar resultado"]');
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const nombre = [...document.querySelectorAll('.camiseta-nombre')].find(n => !n.closest('.camiseta-dupla'));
        if (nombre) nombre.click();
      });
      await page.evaluate(() => window.__guardarEdicionResultado('m-finalizado'));
      await page.waitForSelector('#confirmModal.open');
      await page.click('#btnConfirmOk');
      await page.waitForTimeout(200);
      const doc2 = await page.evaluate(() =>
        (JSON.parse(window.__ultimosDocs.partidos || '[]')).find(p => p.id === 'm-finalizado'));
      if (!doc2 || !doc2.resultado.statsPorJugador) problemas.push('editar m-finalizado no dejó "statsPorJugador" (eventos/S-04, toque/S-07c)');
      if (doc2 && 'eventos' in doc2.resultado) problemas.push('editar un partido histórico le agregó la clave "eventos": se migró sin que D-06 lo permita (eventos/S-04, toque/S-07c)');

      return problemas;
    } },

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
