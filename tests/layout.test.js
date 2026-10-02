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
   cambia de forma: el piso, cada breakpoint del CSS (480, 700, 760) medido de los
   dos lados, y la franja de tablet. Un dispositivo popular puede caer lejos de
   todo borde y no probar nada. */
// 1099/1100: breakpoint del layout de dos columnas de la pantalla de partido
// (NAVEGACION_PARTIDOS_SPEC.md TC-007, A-01) — medido de los dos lados, mismo criterio que el
// resto de la lista.
// 759/760: corte del listado de jugadores — de 760 para arriba el renglón es una grilla de
// columnas con encabezado fijo (turno 16b); por debajo vuelve al apilado (16c).
const ANCHOS = [360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 759, 760, 768, 900, 1099, 1100, 1200];

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
/* En el listado de jugadores, abajo del corte de 760px el renglón vuelve al apilado
   (turno 16c): nombre, puestos y estadísticas uno debajo del otro dentro de
   `.row-main`, y a la derecha los dos únicos controles que quedaron —el puntaje y
   el menú de "…"— en el MISMO renglón.

   Hasta el turno 16 los controles eran cuatro (puntaje, interruptor, editar,
   eliminar): ~158px que no encogían, que dejaban a `.row-main` con 76px a 360px y
   obligaban a bajarlos a un renglón propio. Con dos (68px) entran al lado del
   nombre, y lo que hay que asegurar ahora es lo contrario que antes: que entren.
   Nada de esto desborda, así que MEDIR no lo ve. */
const INVARIANTE_FILA_DE_JUGADOR = () => {
  if (document.documentElement.clientWidth >= 760) return [];
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
    /* Los controles visibles tienen que compartir renglón con `.row-main`: si alguno
       cae debajo, la fila pasa a dos renglones y el listado se estira ~40%. Se filtra
       por ancho porque las celdas de columna (`.row-col`) existen en el DOM pero están
       en `display:none` en esta banda. */
    const cajaMain = main.getBoundingClientRect();
    const abajo = [...fila.children]
      .filter(k => k !== main && k !== badge)
      .filter(k => k.getBoundingClientRect().width > 0)
      .filter(k => k.getBoundingClientRect().top > cajaMain.bottom - 2);
    if (abajo.length) problemas.push(`"${quien}": ${abajo.length} control(es) bajaron a un renglón propio en vez de entrar al lado del nombre`);
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
  // Deshacer vive al pie de las dos canchas, junto a Guardar cuando corresponde (`.carga-acciones`,
  // diseño 8e del handoff) — ya no arriba, en la toolbar de tipo de evento (2026-09-02).
  const deshacer = document.querySelector('.carga-acciones .panel-icono');
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
  // ".detalle-agregar-btn" (el "+"): mismo piso táctil que el "−", NFR-001 de
  // NAVEGACION_PARTIDOS_SPEC.md — no tenía chequeo de tamaño hasta esta feature.
  for (const btn of document.querySelectorAll('.detalle-quitar-btn, .detalle-agregar-btn')) {
    const signo = btn.classList.contains('detalle-agregar-btn') ? '+' : '−';
    const b = btn.getBoundingClientRect();
    if (b.width < piso - 0.5 || b.height < piso - 0.5) {
      problemas.push(`el botón "${signo}" mide ${Math.round(b.width)}x${Math.round(b.height)}px, por debajo del piso de ${piso}px a ${window.innerWidth}px (toque/NFR-002, partido/NFR-001)`);
    }
    if (!(btn.getAttribute('aria-label') || '').trim() || !(btn.getAttribute('title') || '').trim()) {
      problemas.push(`un botón "${signo}" quedó sin aria-label o sin title (toque/NFR-003)`);
    }
  }
  for (const tab of document.querySelectorAll('.evento-tab')) {
    if (!tab.textContent.trim()) problemas.push('una opción del selector de evento quedó sin texto (toque/NFR-003)');
  }
  return [...new Set(problemas)].slice(0, 4);
};

/* El layout de dos columnas de la pantalla de partido (NAVEGACION_PARTIDOS_SPEC.md, FR-001,
   FR-009). Por debajo del breakpoint (A-01) el switch manda: se ve una sola columna a la vez y
   `.match-mobile-switch` está visible. En el breakpoint para arriba, las dos columnas se ven
   juntas y el switch se oculta. Corre en cada ancho medido (no una vez), porque es exactamente lo
   que cambia con el ancho — "partido/S-01", "partido/S-01a", "partido/S-01b", "partido/S-06",
   "partido/S-06b". */
const INVARIANTE_PARTIDO_DOS_COLUMNAS = () => {
  const columnas = document.getElementById('matchColumns');
  if (!columnas) return [];
  const problemas = [];
  const conv = document.getElementById('matchColConvocados');
  const eq = document.getElementById('matchColEquipos');
  const switchEl = document.getElementById('matchMobileSwitch');
  const visible = (elemento) => elemento && getComputedStyle(elemento).display !== 'none';
  if (document.documentElement.clientWidth >= 1100) {
    if (visible(switchEl)) problemas.push(`el switch mobile sigue visible a ${window.innerWidth}px (≥1100, partido/S-01)`);
    if (!visible(conv) || !visible(eq)) problemas.push(`las dos columnas no se ven juntas a ${window.innerWidth}px (≥1100, partido/S-01)`);
  } else {
    if (!visible(switchEl)) problemas.push(`el switch mobile no se ve a ${window.innerWidth}px (<1100, partido/S-06)`);
    const tab = columnas.getAttribute('data-mob-tab');
    const otraVisible = tab === 'convocados' ? visible(eq) : visible(conv);
    if (otraVisible) problemas.push(`se ven las dos columnas a la vez a ${window.innerWidth}px, con la pestaña "${tab}" activa (partido/S-06b)`);
  }
  return problemas;
};

/* ---- orden por columnas: ayudantes de los escenarios `orden-*` ---- */
const TITULO_ORDEN = criterio => `.roster-head button.roster-orden[data-criterio="${criterio}"]`;

/* Antes del cambio de encabezado (T-2.8 del Plan) esto es lo que hace fallar a los escenarios:
   que el título no sea un botón. Se pregunta primero en vez de dejar que `page.click` espere
   30 segundos por un selector que no existe. */
async function exigirTituloOrden(page, criterio) {
  if (!(await page.$(TITULO_ORDEN(criterio)))) throw new Error(`no hay botón de título "${criterio}" en el encabezado del listado`);
}

/* El estado que miden los dos escenarios de encabezado: en la banda ancha el orden en Pos; en la
   angosta el menú con su opción de texto más largo, "Partidos jugados ↓" (S-09b). */
async function prepararEncabezadoOrden(page) {
  await irAPestania(page, 'Jugadores');
  if ((await page.evaluate(() => document.documentElement.clientWidth)) >= 760) {
    await exigirTituloOrden(page, 'posicion');
    await page.click(TITULO_ORDEN('posicion'));
  } else {
    await page.selectOption('#ordenModo', 'pj_desc');
  }
}

/* Lo que se ve del listado en la banda ancha: por fila, el nombre, la sigla del puesto y las
   celdas de PJ, Goles y Asist; y qué títulos llevan el indicador de sentido. */
const LEER_LISTADO_ORDEN = () => ({
  filas: [...document.querySelectorAll('.roster .row')].map(f => {
    const c = [...f.querySelectorAll('.row-col')].map(x => x.textContent.trim());
    return { nombre: f.querySelector('.row-name').textContent.trim(), sigla: f.querySelector('.badge').textContent.trim(), pj: c[0], goles: c[2], asist: c[3] };
  }),
  conIndicador: [...document.querySelectorAll('.roster-head .roster-orden-icono')].map(i => i.closest('button').dataset.criterio),
});

/* Que las filas estén ordenadas por una columna numérica en un sentido, con los que nunca jugaron
   ("—" en PJ) al final (FR-007). El desempate alfabético lo cubre tests/orden.test.js. */
function revisarOrdenNumerico(filas, campo, sentido, contexto) {
  const problemas = [];
  const primeraSinPartidos = filas.findIndex(f => f.pj === '—');
  if (primeraSinPartidos >= 0 && filas.slice(primeraSinPartidos).some(f => f.pj !== '—')) problemas.push(`${contexto}: hay un jugador que jugó después de uno sin partidos`);
  const valores = filas.filter(f => f.pj !== '—').map(f => Number(f[campo]));
  for (let i = 1; i < valores.length; i++) {
    if (sentido === 'desc' ? valores[i] > valores[i - 1] : valores[i] < valores[i - 1]) {
      problemas.push(`${contexto}: ${campo} no está en sentido ${sentido} (${valores.join(', ')})`);
      break;
    }
  }
  return problemas;
}

/* S-09, S-09a, S-09b: de 760 para arriba, los títulos en orden y el indicador dentro de su celda
   y del viewport, con el orden en Pos y —si la grilla tiene Pts— en Pts. Abajo de 760, el menú
   con su opción más larga dentro del viewport. El desborde general lo mide MEDIR. */
const INVARIANTE_ENCABEZADO_ORDEN = () => {
  const problemas = [];
  const ancho = document.documentElement.clientWidth;
  if (ancho < 760) {
    const menu = document.getElementById('ordenModo');
    if (!menu || !menu.offsetParent) return ['abajo de 760px el menú de orden no se ve (orden/S-09b)'];
    const texto = menu.options[menu.selectedIndex] && menu.options[menu.selectedIndex].text;
    if (texto !== 'Partidos jugados ↓') problemas.push(`el menú tendría que mostrar "Partidos jugados ↓" y muestra ${JSON.stringify(texto)} (orden/S-09b)`);
    if (menu.getBoundingClientRect().right > ancho + 0.5) problemas.push('el menú de orden se sale del viewport (orden/S-09b)');
    return problemas;
  }
  const esJugador = document.body.classList.contains('role-jugador');
  const esperados = ['Pos', 'Jugador', 'PJ', 'G E P', 'Goles', 'Asist'].concat(esJugador ? [] : ['Pts']);
  const rotulos = [...document.querySelectorAll('.roster-head > div')].map(d => d.textContent.trim()).filter(Boolean);
  if (JSON.stringify(rotulos) !== JSON.stringify(esperados)) problemas.push(`los títulos tendrían que ser ${esperados.join(', ')} y son ${rotulos.join(', ')} (orden/S-09)`);
  const medir = criterio => {
    const boton = document.querySelector(`.roster-head button.roster-orden[data-criterio="${criterio}"]`);
    if (!boton) return [`no hay botón de título "${criterio}" en el encabezado (orden/S-09)`];
    const icono = boton.querySelector('.roster-orden-icono');
    if (!icono) return [`con el orden en "${criterio}" su título no muestra el indicador (orden/S-09)`];
    const celda = boton.parentElement.getBoundingClientRect(), i = icono.getBoundingClientRect(), b = boton.getBoundingClientRect();
    const fuera = [];
    if (i.right > celda.right + 0.5 || i.left < celda.left - 0.5) fuera.push(`el indicador de "${criterio}" sale de su celda (${Math.round(i.left)}–${Math.round(i.right)} contra ${Math.round(celda.left)}–${Math.round(celda.right)}) (orden/S-09)`);
    if (b.right > celda.right + 0.5) fuera.push(`el botón de "${criterio}" sale de su celda (orden/S-09)`);
    if (i.right > ancho + 0.5) fuera.push(`el indicador de "${criterio}" sale del viewport (orden/S-09)`);
    if (document.documentElement.scrollWidth !== ancho) fuera.push(`con el orden en "${criterio}" hay scroll horizontal (orden/NFR-005)`);
    return fuera;
  };
  problemas.push(...medir('posicion'));
  if (!esJugador) {
    window.__ordenarPorColumna('puntaje');
    problemas.push(...medir('puntaje'));
  }
  return problemas;
};

/* Abre otra página en el mismo contexto, con su propio doble, y la deja en Jugadores. Es "recargar"
   (los datos que dejó la primera) o "entrar con otra cuenta" (otro `uid` u otro rol). El doble y el
   bloqueo del CDN se instalan por página, como en `rol-dos-pestanias`. */
async function abrirOtraPagina(page, { rol, datos, doble = {}, ancho = 1200 }) {
  const otra = await page.context().newPage();
  await otra.setViewportSize({ width: ancho, height: 900 });
  await otra.route('**/firebasejs/**', r => r.abort());
  await otra.addInitScript(fakeFirebase, Object.assign({ datos, rol }, doble));
  await otra.goto(page.url(), { waitUntil: 'networkidle' });
  await otra.waitForSelector('#appRoot', { state: 'attached' });
  await otra.waitForTimeout(600);
  await irAPestania(otra, 'Jugadores');
  return otra;
}

/* Los datos de prueba con la preferencia de una cuenta sembrada, como la dejaría Firestore. */
function datosConPreferencia(valor, uid = 'u-test') {
  const datos = docsDesde();
  if (valor !== undefined) datos[`preferenciasOrden/${uid}`] = valor;
  return datos;
}

/* El orden base de los datos de prueba, como nombres visibles: la migración de `orden` lo asigna
   en el alfabético existente (apellido y nombre), que es también como se ordena sin `orden`. */
function nombresEnOrdenBase() {
  const players = JSON.parse(docsDesde().players);
  return players.sort((a, b) => (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre))
    .map(p => ((p.nombre || '') + ' ' + (p.apellido || '')).trim());
}

const FILA_ORDEN = nombre => `.roster .row:has(.row-name:text-is(${JSON.stringify(nombre)}))`;
async function arrastrarFila(page, origen, destino) {
  await page.dragAndDrop(FILA_ORDEN(origen), FILA_ORDEN(destino));
  await page.waitForTimeout(300);
}
/* Lo que quedaría después de soltar `origen` sobre `destino`: inmediatamente antes (FR-031). */
function trasSoltar(nombres, origen, destino) {
  const sin = nombres.filter(n => n !== origen);
  sin.splice(sin.indexOf(destino), 0, origen);
  return sin;
}
const nombresDe = r => r.filas.map(f => f.nombre);
const estadoDelOrden = page => page.evaluate(() => {
  const menu = document.getElementById('ordenModo');
  const head = document.querySelector('.roster-head');
  const toast = document.getElementById('appToast');
  return {
    menuVisible: !!menu && getComputedStyle(menu).display !== 'none',
    menuTexto: menu && menu.options[menu.selectedIndex] ? menu.options[menu.selectedIndex].text : null,
    menuOpciones: menu ? [...menu.options].filter(o => !o.disabled).map(o => o.text) : [],
    titulosVisibles: !!head && getComputedStyle(head).display !== 'none',
    titulos: [...document.querySelectorAll('.roster-head button.roster-orden')].map(b => b.dataset.criterio),
    aviso: toast && toast.classList.contains('show') ? toast.textContent : null,
    escrituras: window.__escrituras.slice(window.__escrituras_base || 0),
    preferencia: (window.__ultimosDocs || {})['preferenciasOrden/u-test'] || null,
  };
});
const leerPreferencia = texto => { try { return JSON.parse(texto); } catch (e) { return null; } };

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

  /* ---- la pantalla de carga del arranque (2026-09-10) ----
     El estado de layout que agrega tapar la espera de las lecturas (`rol/NFR-006`, corregido ese
     día). Corre en todos los anchos como cualquier pantalla, y además comprueba lo que el
     desborde no ve: que mientras dura, la aplicación NO esté revelada, y que cuando termina la
     pelota se saque del DOM en vez de esconderse. */
  { clave: 'carga', rol: 'admin', nombre: 'pantalla de carga del arranque',
    spec: ['rol/NFR-006'],
    /* El doble responde al instante, así que sin demora la pantalla de carga ni llega a montar la
       pelota (se monta a los 400 ms) y no habría nada que medir. 1500 ms deja tiempo de sobra
       para que el runner llegue con su espera de 600 ms. */
    doble: { lecturaDemora: 1500 },
    async preparar(page) {
      await page.waitForFunction(() => {
        const l = document.getElementById('launchScreen');
        return l && l.style.display === 'flex' && l.querySelector('.ball-loader canvas');
      }, null, { timeout: 8000 });
    },
    async comprobar(page) {
      const problemas = [];
      const durante = await page.evaluate(() => ({
        app: document.getElementById('appRoot').style.display,
        login: !!document.getElementById('loginScreen').offsetParent,
        pelotas: document.querySelectorAll('#launchScreen .ball-loader canvas').length,
      }));
      if (durante.app !== 'none') problemas.push('la aplicación no debería estar revelada mientras se traen los datos: el punto del cambio es que aparezca entera de una vez');
      if (durante.login) problemas.push('la pantalla de login debería estar oculta durante la carga');
      if (durante.pelotas !== 1) problemas.push(`debería haber exactamente una pelota girando y hay ${durante.pelotas}`);

      await page.waitForFunction(() => document.getElementById('appRoot').style.display !== 'none', null, { timeout: 15000 });
      const despues = await page.evaluate(() => ({
        launch: document.getElementById('launchScreen').style.display,
        canvas: document.querySelectorAll('#launchScreen canvas').length,
        partidos: document.getElementById('matchList').children.length,
        solapas: [...document.querySelectorAll('.tabs .tab-btn')].filter(b => b.offsetParent !== null).length,
      }));
      if (despues.launch !== 'none') problemas.push(`al revelarse la aplicación la pantalla de carga quedó en display:${despues.launch}`);
      /* Esconderla con `display:none` no alcanza: el rAF del BallLoader descarta la instancia
         cuando el canvas deja de estar CONECTADO, así que una pelota escondida seguiría girando y
         gastando un frame cada 16 ms hasta que se cierre la pestaña. */
      if (despues.canvas) problemas.push('la pelota quedó en el DOM después de la carga: escondida sigue girando para siempre');
      if (!despues.partidos) problemas.push('la aplicación se reveló sin contenido: tiene que aparecer ya pintada');
      if (despues.solapas !== 3) problemas.push(`la barra apareció con ${despues.solapas} solapas en vez de 3`);
      return problemas;
    } },

  { clave: 'jugadores', rol: 'admin', nombre: 'listado de jugadores (admin)',
    invariante: INVARIANTE_FILA_DE_JUGADOR,
    async preparar(page) { await irAPestania(page, 'Jugadores'); } },

  { clave: 'jugadores-jugador', rol: 'jugador', nombre: 'listado de jugadores (rol jugador)',
    spec: ['rol/S-03'],
    async preparar(page) { await irAPestania(page, 'Jugadores'); } },

  /* ---- rol en el token: el primer pintado ----
     Los cinco escenarios de la feature rol-en-el-token. No miran el ancho —miran QUÉ se pintó y
     CUÁNDO— pero corren en todos los anchos igual, como no-regresión: la feature no agrega
     ninguna pantalla nueva (NFR-006) y lo que hay que comprobar es que no haya movido nada. */

  { clave: 'rol-admin-primer-pintado', rol: 'admin', nombre: 'la barra de solapas ya tiene Configuración en su primer pintado',
    spec: ['rol/S-01', 'rol/S-01d', 'rol/S-02', 'rol/NFR-001', 'rol/NFR-002', 'rol/NFR-007', 'orden/NFR-002'],
    async preparar(page) { /* la pantalla por default: la barra de solapas */ },
    async comprobar(page) {
      const r = await page.evaluate(() => ({
        pintados: window.__pintados, lecturas: window.__lecturas, refrescos: window.__refrescos,
      }));
      const problemas = [];
      /* FR-002: en TODA muestra donde appRoot ya estaba visible, la barra tiene las tres solapas.
         Antes de la feature esto fallaba: appRoot se revelaba primero y `role-jugador` se sacaba
         después, así que había muestras con dos solapas. */
      const visibles = r.pintados.filter(m => m.appVisible);
      if (!visibles.length) problemas.push('appRoot nunca se reveló: el escenario no llegó a medir');
      const incompletas = visibles.filter(m => m.solapas.length !== 3);
      if (incompletas.length) {
        problemas.push(`la barra se pintó con ${incompletas[0].solapas.join('+')} antes de tener sus tres solapas, ` +
          `en ${incompletas.length} de ${visibles.length} muestras (rol/S-01, FR-002)`);
      }
      /* NFR-002: cero lecturas de userRoles en un arranque de admin. El contador es por
         colección, así que la ausencia de la clave es la afirmación. */
      if (r.lecturas.userRoles) problemas.push(`hubo ${r.lecturas.userRoles} lectura(s) de userRoles (rol/NFR-002)`);
      /* FR-009 / S-01d: con el rol resuelto se pidieron los seis documentos sólo-admin junto con
         los tres públicos, de una sola vez. */
      if (r.lecturas.data !== 8) problemas.push(`un arranque de admin debería leer 8 documentos de data y leyó ${r.lecturas.data} (rol/S-01d, orden/NFR-002)`);
      /* orden-por-columnas NFR-002: sale `playersSortMode` de data y entra la preferencia de la cuenta. */
      if (r.lecturas.preferenciasOrden !== 1) problemas.push(`un arranque debería leer 1 preferencia de orden y leyó ${r.lecturas.preferenciasOrden || 0} (orden/NFR-002)`);
      /* NFR-001: con el claim presente no se toca la red para resolver el rol. */
      if (r.refrescos !== 0) problemas.push(`con el claim presente no debería refrescarse el token, y se refrescó ${r.refrescos} vez/veces (rol/NFR-001)`);
      return problemas;
    } },

  { clave: 'rol-jugador-primer-pintado', rol: 'jugador', nombre: 'con rol jugador, Configuración no aparece en ningún momento',
    spec: ['rol/S-03', 'rol/S-03a', 'rol/NFR-002', 'orden/NFR-002'],
    doble: { jugadorId: 'p1' },
    async preparar(page) { /* la barra de solapas */ },
    async comprobar(page) {
      const r = await page.evaluate(() => ({
        pintados: window.__pintados, lecturas: window.__lecturas, sesion: window.session,
      }));
      const problemas = [];
      /* La solapa de administración no se ve en NINGUNA muestra, ni siquiera un frame: la fuga
         que importa es la transitoria, porque es la que una revisión a ojo no encuentra. */
      const conMotor = r.pintados.filter(m => m.solapas.includes('motor'));
      if (conMotor.length) problemas.push(`la solapa Configuración estuvo visible en ${conMotor.length} muestra(s) con rol jugador (rol/S-03)`);
      if (r.lecturas.userRoles) problemas.push(`hubo ${r.lecturas.userRoles} lectura(s) de userRoles (rol/NFR-002)`);
      if (r.lecturas.data !== 2) problemas.push(`una cuenta jugador debería leer sólo los 2 documentos públicos y leyó ${r.lecturas.data} (rol/S-03, orden/NFR-002)`);
      if (r.lecturas.preferenciasOrden !== 1) problemas.push(`un arranque debería leer 1 preferencia de orden y leyó ${r.lecturas.preferenciasOrden || 0} (orden/NFR-002)`);
      if (r.sesion.jugadorId !== 'p1') problemas.push(`el jugadorId del claim debería estar en window.session y quedó ${JSON.stringify(r.sesion.jugadorId)} (rol/S-03a)`);
      return problemas;
    } },

  { clave: 'rol-corte-token-vencido', rol: 'admin', nombre: 'el corte: una sesión abierta desde antes del cambio',
    /* El camino de la mudanza, sobre la aplicación real: la cuenta ya está estampada del lado
       servidor pero su token todavía no trae el claim, así que hay que refrescarlo. Es el único
       arranque que cuesta una espera de red, y el que más fácil se rompe.

       Acá vivía el escenario del loader de sesión, que se dio de baja (ver el change log de la
       Spec): el loader tapaba justamente esta espera. Lo que el escenario verifica sigue siendo
       necesario con loader o sin él —que la cuenta entre bien, con un solo refresco y con la
       barra completa desde el primer frame—, así que se conserva sin la parte visual.

       `refrescoDemora` pone los 250 ms que el refresco mide contra Firebase, para que la espera
       sea la real y no cero. */
    doble: { claimAusente: true, refrescoTrae: 'admin', refrescoDemora: 250 },
    spec: ['rol/S-01b', 'rol/S-11', 'rol/S-11a', 'rol/NFR-001b'],
    async preparar(page) {
      await page.waitForFunction(() => window.session && window.session.rol === 'admin', { timeout: 8000 });
    },
    async comprobar(page) {
      const r = await page.evaluate(() => ({
        pintados: window.__pintados, refrescos: window.__refrescos, sesion: window.session,
        cardVisible: !!(document.getElementById('loginCard') || {}).offsetParent,
      }));
      const problemas = [];
      if (r.refrescos !== 1) problemas.push(`el refresco forzado deberia ocurrir exactamente una vez y ocurrio ${r.refrescos} (rol/S-11a, TC-046)`);
      if (r.sesion.rol !== 'admin') problemas.push(`el token refrescado traia admin y la sesion quedo en ${r.sesion.rol} (rol/S-11)`);
      if (r.cardVisible) problemas.push('la tarjeta de login quedo visible sobre la aplicacion (rol/S-01b)');
      /* Lo mismo que el camino con claim: la barra nunca se pinta incompleta, tampoco cuando la
         resolucion tuvo que esperar un refresco (FR-002). */
      const visibles = r.pintados.filter(m => m.appVisible);
      if (!visibles.length) problemas.push('appRoot nunca se revelo: el escenario no llego a medir');
      const incompletas = visibles.filter(m => m.solapas.length !== 3);
      if (incompletas.length) problemas.push(`tras el refresco la barra se pinto incompleta en ${incompletas.length} de ${visibles.length} muestras (rol/S-01b, FR-002)`);
      /* Lo que este chequeo mide es el SOBRECOSTO de la aplicacion sobre la espera del refresco,
         no el numero de NFR-001b: aca el refresco es el del doble (250 ms simulados), no el de
         Firebase. El numero real lo mide `tools/medir-arranque.js --caso=vencido` contra staging
         —mediana 497 ms, que es lo que llevo el objetivo de NFR-001b de 400 a 600 ms—, y una
         medicion de red no se puede hacer desde un doble.
         El presupuesto de sobrecosto es deliberadamente ajustado: si alguien metiera un segundo
         refresco, un `await` de mas o una demora propia, la espera se iria muy por encima de los
         250 ms simulados y esto lo veria, sin depender de cuanto tarde la red de verdad. */
      const SOBRECOSTO_MAXIMO = 150;
      if (visibles.length) {
        const completa = visibles.find(m => m.solapas.length === 3);
        const arranque = completa ? completa.t - r.pintados[0].t : Infinity;
        if (arranque > 250 + SOBRECOSTO_MAXIMO) {
          problemas.push(`el arranque con token vencido tardo ${arranque} ms sobre un refresco simulado de 250 ms: ` +
            `la aplicacion no deberia agregar mas de ${SOBRECOSTO_MAXIMO} ms encima (rol/NFR-001b)`);
        }
      }
      return problemas;
    } },

  { clave: 'rol-login-fallido', rol: 'admin', nombre: 'credenciales rechazadas: la pantalla de login se queda donde está',
    anchos: [360, 1200], spec: ['rol/S-02a'],
    /* `sinSesion` arranca la aplicación en la pantalla de login, que es la única forma de llegar
       ahí: por default el doble entra siempre. Un primer intento la simulaba escondiendo appRoot
       a mano después de haber entrado, y así `window.session` ya tenía el rol resuelto — el
       escenario afirmaba sobre un estado que no era el que dice medir. */
    doble: { sinSesion: true },
    async preparar(page) {
      /* El doble acepta cualquier contraseña, así que se lo hace rechazar acá. */
      await page.evaluate(() => {
        window.auth.login = async () => { throw new Error('auth/wrong-password'); };
        document.getElementById('loginUsuario').value = 'admin';
        document.getElementById('loginPassword').value = 'lo-que-no-es';
        document.getElementById('btnLogin').click();
      });
      await page.waitForFunction(() => document.getElementById('loginError').textContent.length > 0, { timeout: 3000 });
    },
    async comprobar(page) {
      const r = await page.evaluate(() => ({
        error: document.getElementById('loginError').textContent,
        cardVisible: !!(document.getElementById('loginCard') || {}).offsetParent,
        sesion: window.session,
      }));
      const problemas = [];
      if (!r.error) problemas.push('un login rechazado debería mostrar el mensaje de error');
      if (!r.cardVisible) problemas.push('la tarjeta de login debería seguir en pantalla para poder corregir las credenciales (rol/S-02a)');
      if (r.sesion.rol !== 'jugador') problemas.push(`un login rechazado no debería dejar rol ${r.sesion.rol} (rol/S-02a)`);
      return problemas;
    } },

  { clave: 'rol-dos-pestanias', rol: 'admin', nombre: 'dos pestañas del mismo navegador refrescan cada una su token',
    anchos: [1200],
    /* La bandera que acota el refresco es de MÓDULO y muere con la pestaña (TD-04). El riesgo real
       vive acá: si se hubiera persistido en localStorage, la segunda pestaña —que comparte el
       almacenamiento con la primera— no refrescaría y una cuenta admin entraría como jugador.
       Por eso la segunda página se abre en el MISMO contexto de Playwright; dos contextos
       separados no probarían nada. */
    doble: { claimAusente: true, refrescoTrae: 'admin' },
    spec: ['rol/S-02b', 'rol/TC-040', 'rol/TC-046'],
    async preparar(page) { /* la primera pestaña ya arrancó */ },
    async comprobar(page) {
      const primera = await page.evaluate(() => ({ refrescos: window.__refrescos, rol: window.session.rol }));
      const segunda = await page.context().newPage();
      /* El doble y el bloqueo del CDN se instalan por PÁGINA, no por contexto, así que la
         pestaña nueva necesita los suyos. Se le da la misma configuración que a la primera: el
         punto del escenario es que las dos arranquen igual y aun así cada una refresque. */
      await segunda.route('**/firebasejs/**', r => r.abort());
      await segunda.addInitScript(fakeFirebase, { datos: docsDesde(), rol: 'admin', claimAusente: true, refrescoTrae: 'admin' });
      await segunda.goto(page.url(), { waitUntil: 'networkidle' });
      await segunda.waitForSelector('#appRoot', { state: 'attached' });
      await segunda.waitForTimeout(600);
      const r2 = await segunda.evaluate(() => ({ refrescos: window.__refrescos, rol: window.session.rol }));
      await segunda.close();
      const problemas = [];
      if (primera.refrescos !== 1 || primera.rol !== 'admin') problemas.push(`la primera pestaña debería refrescar una vez y quedar admin, y quedó ${JSON.stringify(primera)} (rol/S-02b)`);
      if (r2.refrescos !== 1) problemas.push(`la segunda pestaña debería refrescar su propio token una vez y refrescó ${r2.refrescos}: la bandera se está compartiendo entre pestañas (rol/S-02b, TD-04)`);
      if (r2.rol !== 'admin') problemas.push(`la segunda pestaña debería resolver admin igual que la primera y resolvió ${r2.rol} (rol/S-02b)`);
      return problemas;
    } },

  /* La ficha abierta trae .index-card, .field-row, .pos-badges y .scores-grid
     (4 columnas que colapsan a 2 en 480px), más el .info-icon. */
  { clave: 'ficha', rol: 'admin', nombre: 'ficha de jugador (alta/edición)',
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      // El lápiz suelto del renglón se fue al menú de "…" con el turno 16.
      await page.click('.roster .row .conv-menu-btn');
      await page.click('#convMenu .conv-menu-item:has-text("Editar")');
      await page.waitForSelector('.card-pin-wrap.open');
    } },

  /* ---- desglose-posiciones ----
     La ficha con los ocho puestos, la reclasificación, la cancha por lados, lo guardado que no es
     un puesto y el rol jugador. Los datos por defecto traen el plantel ya reclasificado con los
     partidos viejos intactos (fixtures-app.js, TD-15); `fixture: { reclasificados: false }` lo
     trae como estaría el día del cambio, todos a revisar. */
  { clave: 'puestos-ficha', rol: 'admin', nombre: 'ficha de jugador con los ocho puestos elegidos',
    spec: ['puestos/S-02', 'puestos/S-02a', 'puestos/S-02c', 'puestos/S-03c', 'puestos/NFR-003'],
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      await page.click('#btnNuevo');
      await page.waitForSelector('.card-pin-wrap.open');
      await page.selectOption('#fPrincipal', 'DC');
      // Los siete restantes como secundarios: ocho casilleros, el caso más ancho de la ficha.
      for (let i = 0; i < 7; i++) {
        const libre = await page.$('#fSecBadges .pos-toggle:not(.on):not(.disabled)');
        if (!libre) break;
        await libre.click();
      }
    },
    async comprobar(page) {
      const problemas = [];
      const opciones = await page.$$eval('#fPrincipal option', os => os.map(o => ({ v: o.value, t: o.textContent })));
      const puestos = opciones.filter(o => o.v);
      if (puestos.length !== 8) problemas.push(`el selector de principal debería ofrecer los ocho puestos y ofrece ${puestos.length} (S-02)`);
      if (puestos.some(o => ['Defensor', 'Volante', 'Delantero'].includes(o.v))) problemas.push('el selector ofrece una posición vieja (FR-013)');
      if (puestos.some(o => !/^.+ \((ARQ|LI|DC|LD|MI|MC|MD|DEL)\)$/.test(o.t))) problemas.push(`cada opción tiene que decir nombre y sigla: ${JSON.stringify(puestos.map(o => o.t))} (FR-006)`);
      const casilleros = await page.$$eval('#fScoresGrid input', is => is.length);
      if (casilleros !== 8) problemas.push(`con los ocho puestos elegidos debería haber ocho casilleros y hay ${casilleros} (S-02a)`);
      // S-02c: un puntaje fuera de rango no se guarda.
      await page.fill('#fNombre', 'Zzz Nuevo');
      await page.fill('#fScoresGrid input[data-pos="DC"]', '11');
      await page.dispatchEvent('#fScoresGrid input[data-pos="DC"]', 'input');
      await page.click('#btnGuardar');
      const error = await page.textContent('#formError');
      if (!/entre 1 y 10/.test(error || '')) problemas.push(`con DC en 11 tendría que aparecer el error de rango y apareció "${error}" (S-02c)`);
      // S-02: DC 8, LD de secundario sin puntaje, y a guardar.
      for (const pos of ['LI', 'MI', 'MC', 'MD', 'DEL', 'Arquero']) {
        const b = await page.$(`#fSecBadges .pos-toggle.on[data-pos="${pos}"]`);
        if (b) await b.click();
      }
      await page.fill('#fScoresGrid input[data-pos="DC"]', '8');
      await page.dispatchEvent('#fScoresGrid input[data-pos="DC"]', 'input');
      await page.click('#btnGuardar');
      await page.waitForTimeout(300);
      const fila = await page.evaluate(() => {
        const row = [...document.querySelectorAll('.roster .row')].find(r => r.textContent.includes('Zzz Nuevo'));
        if (!row) return null;
        const badge = row.querySelector('.badge');
        return { sigla: badge.textContent.trim(), fondo: getComputedStyle(badge).backgroundColor, aRevisar: !!row.querySelector('.status-chip.a-revisar') };
      });
      if (!fila) problemas.push('el jugador nuevo no aparece en la lista (S-02)');
      else {
        if (fila.sigla !== 'DC') problemas.push(`la insignia debería decir DC y dice ${fila.sigla} (S-02)`);
        if (fila.fondo !== 'rgb(251, 146, 60)') problemas.push(`la insignia de DC debería ser naranja (Defensa) y es ${fila.fondo} (FR-004)`);
        if (fila.aRevisar) problemas.push('un jugador nuevo con puestos del catálogo no está a revisar (S-02)');
      }
      // S-03c: con el plantel reclasificado no queda nadie a revisar.
      await page.selectOption('#filters', 'a-revisar');
      await page.waitForTimeout(200);
      const vacio = await page.evaluate(() => (document.querySelector('.roster .empty-state') || {}).textContent || '');
      if (!/No hay jugadores que coincidan/.test(vacio)) problemas.push(`"A revisar" sin nadie a revisar tendría que mostrar la lista vacía de siempre (S-03c), y muestra "${vacio.trim()}"`);
      return problemas;
    } },

  { clave: 'puestos-reclasificar', rol: 'admin', nombre: 'reclasificar a un jugador con posiciones viejas',
    spec: ['puestos/S-01', 'puestos/S-01e', 'puestos/NFR-004'],
    fixture: { reclasificados: false },
    anchos: [360, 1200],
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      await page.selectOption('#filters', 'a-revisar');
      await page.waitForTimeout(200);
    },
    async comprobar(page) {
      const problemas = [];
      // NFR-004: toda etiqueta de puesto de la lista tiene su sigla en texto, no sólo color.
      const vacias = await page.$$eval('.roster .row .badge, .roster .row .row-tags .tag', es => es.filter(e => !e.textContent.trim()).length);
      if (vacias) problemas.push(`${vacias} etiqueta(s) de puesto sin texto (NFR-004)`);
      const marcadas = await page.$$eval('.roster .row', rs => rs.filter(r => r.querySelector('.status-chip.a-revisar')).length);
      const filas = await page.$$eval('.roster .row', rs => rs.length);
      if (!filas || marcadas !== filas) problemas.push(`el filtro "A revisar" tendría que mostrar sólo filas marcadas: ${marcadas} de ${filas} (FR-021, FR-031)`);
      // S-01: Claudio, Defensor 6 con Volante 5 de secundaria.
      await page.evaluate(() => window.__editPlayer('claudio'));
      await page.waitForSelector('.card-pin-wrap.open');
      const inicial = await page.evaluate(() => ({
        principal: document.getElementById('fPrincipal').value,
        on: document.querySelectorAll('#fSecBadges .pos-toggle.on').length,
        antes: document.getElementById('fAntes').hidden ? '' : document.getElementById('fAntes').textContent,
      }));
      if (inicial.principal || inicial.on) problemas.push(`al abrir, principal y secundarios tienen que estar sin elegir: ${JSON.stringify(inicial)} (FR-022)`);
      if (inicial.antes !== 'Antes: Defensor 6 · Volante 5') problemas.push(`la referencia dice "${inicial.antes}" (FR-022b)`);
      await page.selectOption('#fPrincipal', 'LD');
      await page.click('#fSecBadges .pos-toggle[data-pos="DC"]');
      await page.click('#fSecBadges .pos-toggle[data-pos="MD"]');
      const precarga = await page.$$eval('#fScoresGrid input', is => Object.fromEntries(is.map(i => [i.dataset.pos, i.value])));
      if (JSON.stringify(precarga) !== JSON.stringify({ LD: '6', DC: '6', MD: '5' })) problemas.push(`la precarga tendría que ser LD 6, DC 6, MD 5 y es ${JSON.stringify(precarga)} (FR-023)`);
      await page.fill('#fScoresGrid input[data-pos="DC"]', '4');
      await page.dispatchEvent('#fScoresGrid input[data-pos="DC"]', 'input');
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      await page.click('#btnGuardar');
      await page.waitForTimeout(300);
      const guardado = await page.evaluate(() => ({
        players: JSON.parse(window.__ultimosDocs.players),
        scores: JSON.parse(window.__ultimosDocs.playerScores),
      }));
      const c = guardado.players.find(p => p.id === 'claudio');
      if (!c || c.principal !== 'LD' || JSON.stringify(c.secundarias) !== JSON.stringify(['DC', 'MD'])) problemas.push(`se guardó ${JSON.stringify(c && [c.principal, c.secundarias])} (S-01)`);
      if (guardado.players.some(p => p.scores)) problemas.push('un puntaje quedó en el documento público de jugadores (TC-041)');
      const sc = guardado.scores.claudio || {};
      if (sc.LD !== 6 || sc.DC !== 4 || sc.MD !== 5) problemas.push(`los puntajes nuevos guardados son ${JSON.stringify(sc)} (S-01)`);
      if (sc.Defensor !== 6 || sc.Volante !== 5) problemas.push(`los puntajes viejos tendrían que seguir guardados y son ${JSON.stringify(sc)} (FR-027)`);
      // Por el nombre exacto: "Juan (Hijo de Claudio)" también contiene "Claudio" y sigue a revisar.
      const sigue = await page.$$eval('.roster .row .row-name', ns => ns.some(n => n.textContent.trim() === 'Claudio'));
      if (sigue) problemas.push('Claudio sigue apareciendo en el filtro "A revisar" después de reclasificarlo (FR-026)');
      // S-01e: guardar un jugador a revisar sin elegir principal no guarda.
      await page.evaluate(() => window.__editPlayer('anibal'));
      await page.waitForSelector('.card-pin-wrap.open');
      const antesDeGuardar = (await page.evaluate(() => window.__escrituras.length));
      await page.click('#btnGuardar');
      const error = await page.textContent('#formError');
      if (!/posición principal/.test(error || '')) problemas.push(`sin principal tendría que aparecer el error de siempre y apareció "${error}" (S-01e)`);
      if ((await page.evaluate(() => window.__escrituras.length)) !== antesDeGuardar) problemas.push('guardó sin principal (S-01e)');
      return problemas;
    } },

  { clave: 'puestos-jugador', rol: 'jugador', nombre: 'la lista con los puestos nuevos, rol jugador',
    spec: ['puestos/S-21'],
    anchos: [360, 1200],
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        const ficha = document.getElementById('formWrap');
        if (ficha && ficha.offsetParent !== null) problemas.push('el rol jugador ve la ficha de edición (S-21)');
        if (document.querySelector('.roster .avg-chip')) problemas.push('el rol jugador ve un puntaje en la lista (S-21, TC-041)');
        if (document.querySelector('.roster .conv-menu-btn')) problemas.push('el rol jugador ve el menú para editar jugadores (S-21)');
        return problemas;
      });
    } },

  /* Dos escenarios: el aviso en todos los anchos (es layout, NFR-003) y el flujo del bloqueo en uno
     solo (es comportamiento, y navega entre partidos). */
  { clave: 'puestos-bloqueo-aviso', rol: 'admin', nombre: 'el aviso de titulares a revisar',
    spec: ['puestos/S-04', 'puestos/NFR-003'],
    fixture: { aRevisar: ['anibal', 'gonzalo'] },
    async preparar(page) {
      await abrirPartido(page, '2026-09-17');
      await mostrarEquiposMobile(page);
      await page.waitForSelector('.panel-aviso-bloqueo', { timeout: 5000 });
    },
    async comprobar(page) {
      const texto = await page.textContent('.panel-aviso-bloqueo');
      return (/Anibal Leal/.test(texto) && /Gonzalo Zanotto/.test(texto)) ? []
        : [`el aviso tiene que nombrar a los dos titulares a revisar y dice "${texto.trim()}" (FR-042)`];
    } },

  { clave: 'puestos-bloqueo-flujo', rol: 'admin', nombre: 'el bloqueo de la generación, de punta a punta',
    spec: ['puestos/S-04', 'puestos/S-04d'],
    fixture: { aRevisar: ['anibal', 'gonzalo'] },
    anchos: [1200],
    async preparar(page) {
      await abrirPartido(page, '2026-09-17');
      await page.waitForSelector('.panel-aviso-bloqueo', { timeout: 5000 });
    },
    async comprobar(page) {
      const problemas = [];
      const texto = await page.textContent('.panel-aviso-bloqueo');
      if (!/Anibal Leal/.test(texto) || !/Gonzalo Zanotto/.test(texto)) problemas.push(`el aviso tiene que nombrar a los dos titulares a revisar y dice "${texto.trim()}" (FR-042)`);
      // S-04: tocar Generar no genera ni escribe.
      await page.evaluate(() => { window.__escrituras_base = window.__escrituras.length; });
      await page.locator('button:has-text("Generar equipos"):visible').first().click();
      await page.waitForTimeout(300);
      let nuevas = await page.evaluate(() => window.__escrituras.slice(window.__escrituras_base));
      if (nuevas.length) problemas.push(`tocar Generar con titulares a revisar escribió ${[...new Set(nuevas)].join(', ')} (FR-040)`);
      if (await page.$('.cancha')) problemas.push('se generaron equipos con titulares a revisar (FR-040)');
      // S-04d: un partido ya generado sigue igual y Regenerar no hace nada.
      await page.click('#btnVolverPartidos');
      await abrirPartido(page, '2026-09-03');
      if (!await page.$('.panel-aviso-bloqueo')) problemas.push('el partido con equipos también tiene que mostrar el aviso (FR-042)');
      if (!await page.$('.cancha')) problemas.push('los equipos ya generados tienen que seguir a la vista (FR-045)');
      const antes = await page.evaluate(() => [...document.querySelectorAll('.camiseta')].map(c => c.getAttribute('title')).join('|'));
      await page.evaluate(() => { window.__escrituras_base = window.__escrituras.length; });
      const regenerar = page.locator('.panel-icono-regenerar:visible').first();
      if (await regenerar.count()) await regenerar.click();
      else problemas.push('no se encontró el botón de Regenerar a la vista');
      await page.waitForTimeout(300);
      nuevas = await page.evaluate(() => window.__escrituras.slice(window.__escrituras_base));
      if (nuevas.length) problemas.push(`Regenerar con titulares a revisar escribió ${[...new Set(nuevas)].join(', ')} (FR-041)`);
      const despues = await page.evaluate(() => [...document.querySelectorAll('.camiseta')].map(c => c.getAttribute('title')).join('|'));
      if (antes !== despues) problemas.push('Regenerar con titulares a revisar cambió los equipos (FR-045, AC-30)');
      // S-04: reclasificados los dos, se genera.
      await page.click('#btnVolverPartidos');
      await irAPestania(page, 'Jugadores');
      for (const id of ['anibal', 'gonzalo']) {
        await page.evaluate(i => window.__editPlayer(i), id);
        await page.waitForSelector('.card-pin-wrap.open');
        await page.selectOption('#fPrincipal', 'DC');
        await page.click('#btnGuardar');
        await page.waitForTimeout(200);
      }
      await abrirPartido(page, '2026-09-17');
      if (await page.$('.panel-aviso-bloqueo')) problemas.push('reclasificados los dos, el aviso tendría que irse (FR-026)');
      await page.locator('button:has-text("Generar equipos"):visible').first().click();
      await page.waitForTimeout(500);
      if (!await page.$('.cancha')) problemas.push('reclasificados los dos, Generar tendría que generar (S-04)');
      return problemas;
    } },

  { clave: 'puestos-cancha', rol: 'admin', nombre: 'la cancha por lados, en un partido viejo y en uno recién generado',
    spec: ['puestos/S-09', 'puestos/S-10', 'puestos/NFR-003'],
    anchos: [360, 1200],
    /* La línea de base de escrituras se toma DESPUÉS de que la aplicación cargó (que escribe sus
       migraciones de siempre) y ANTES de abrir el partido, como en `cancha`: lo que FR-084 pide es
       que leer un partido guardado no agregue ninguna escritura. */
    async preparar(page) {
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      await abrirPartido(page, '2026-09-03');
      await mostrarEquiposMobile(page);
    },
    async comprobar(page) {
      const problemas = [];
      const escriturasDesdeLaBase = () => page.evaluate(() => (window.__escrituras || []).slice(window.__escrituras_base || 0));
      // S-10: el partido viejo, con el plantel ya reclasificado, se dibuja en las cuatro líneas.
      const filasViejo = await page.$$eval('.cancha', cs => cs.map(c => c.querySelectorAll('.cancha-linea').length));
      if (!filasViejo.length || filasViejo.some(n => n !== 4)) problemas.push(`el partido viejo tendría que dibujar cuatro filas por cancha y dibuja ${JSON.stringify(filasViejo)} (FR-074, S-10)`);
      let nuevas = await escriturasDesdeLaBase();
      if (nuevas.length) problemas.push(`abrir un partido guardado con posiciones viejas escribió ${[...new Set(nuevas)].join(', ')} (FR-084, TC-003, AC-17)`);
      // Lo mismo con un partido viejo ya finalizado, que se dibuja por otro camino.
      await page.click('#btnVolverPartidos');
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      await abrirPartido(page, '2026-08-20');
      if (!await page.$('.cancha')) problemas.push('el partido viejo finalizado no dibujó su cancha (S-10)');
      nuevas = await escriturasDesdeLaBase();
      if (nuevas.length) problemas.push(`abrir un partido viejo finalizado escribió ${[...new Set(nuevas)].join(', ')} (FR-084, TC-003, AC-17)`);
      await page.click('#btnVolverPartidos');
      await abrirPartido(page, '2026-09-03');
      await mostrarEquiposMobile(page);
      // S-09: regenerado con los puestos nuevos, cada fila de izquierda a derecha.
      await page.locator('.panel-icono-regenerar:visible').first().click();
      await page.waitForTimeout(500);
      await mostrarEquiposMobile(page);
      const filas = await page.$$eval('.cancha', cs => cs.map(c => [...c.querySelectorAll('.cancha-linea')].map(l =>
        [...l.querySelectorAll('.camiseta')].map(cam => cam.getAttribute('title')))));
      /* El puesto de cada camiseta se lee de su title, que lo nombra (FR-076). Fútbol 8 con los puestos
         cubiertos: cada Defensa es LI, DC, LD y cada Medio MI, MC, MD, en ese orden. */
      const PUESTOS = ['Lateral Izquierdo', 'Defensor Central', 'Lateral Derecho', 'Mediocampista Izquierdo',
        'Mediocampista Central', 'Mediocampista Derecho', 'Delantero Central', 'Arquero'];
      // El puesto asignado es el que el title nombra PRIMERO; el principal, si difiere, va después.
      const puesto = t => PUESTOS.filter(n => t.includes(n)).sort((x, y) => t.indexOf(x) - t.indexOf(y))[0] || '?';
      filas.forEach((cancha, i) => {
        const [ataque, medio, defensa] = cancha.map(fila => fila.map(puesto));
        if (JSON.stringify(defensa) !== JSON.stringify(['Lateral Izquierdo', 'Defensor Central', 'Lateral Derecho'])) problemas.push(`cancha ${i + 1}: la Defensa se ve ${JSON.stringify(defensa)} (FR-071)`);
        if (JSON.stringify(medio) !== JSON.stringify(['Mediocampista Izquierdo', 'Mediocampista Central', 'Mediocampista Derecho'])) problemas.push(`cancha ${i + 1}: el Medio se ve ${JSON.stringify(medio)} (FR-071)`);
        if (JSON.stringify(ataque) !== JSON.stringify(['Delantero Central'])) problemas.push(`cancha ${i + 1}: el Ataque se ve ${JSON.stringify(ataque)} (FR-070)`);
      });
      if (!filas.length) problemas.push('regenerar no dibujó ninguna cancha');
      return problemas;
    } },

  { clave: 'puestos-valor-desconocido', rol: 'admin', nombre: 'un partido guardado con un puesto que no es del catálogo',
    spec: ['puestos/S-20'],
    anchos: [1200],
    transformarDatos(datos) {
      const partidos = JSON.parse(datos.partidos);
      const m = partidos.find(x => x.id === 'm-abierto');
      m.equipos.posicionAsignada[m.equipos.blanco[0]] = '<img src=x onerror="window.__xss=1">';
      datos.partidos = JSON.stringify(partidos);
      // Y un principal que no es un puesto, en un jugador convocado: la insignia lo muestra (TC-040).
      const jugadores = JSON.parse(datos.players);
      jugadores.find(p => p.id === 'esteban').principal = '<b>x</b>';
      datos.players = JSON.stringify(jugadores);
    },
    async preparar(page) {
      await abrirPartido(page, '2026-09-03');
      await mostrarEquiposMobile(page);
    },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        if (window.__xss) problemas.push('el valor guardado ejecutó un script (TC-040, AC-31)');
        if (document.querySelector('.cancha img, .panel-receipt img')) problemas.push('el valor guardado se insertó como HTML (TC-040)');
        const canchas = [...document.querySelectorAll('.cancha')];
        if (!canchas.length) problemas.push('la pantalla no se dibujó');
        const conFilaAparte = canchas.filter(c => c.querySelectorAll('.cancha-linea').length === 5);
        if (conFilaAparte.length !== 1) problemas.push(`el jugador con el valor desconocido tendría que estar en una fila aparte, en una sola cancha: ${canchas.map(c => c.querySelectorAll('.cancha-linea').length)} (FR-075)`);
        const conTexto = [...document.querySelectorAll('.camiseta')].some(c => (c.getAttribute('title') || '').includes('<img src=x'));
        if (!conTexto) problemas.push('el valor tendría que aparecer como texto en el title de su camiseta (TC-040)');
        const insignias = [...document.querySelectorAll('.conv-pos-badge')];
        if (insignias.some(b => b.children.length)) problemas.push('una insignia de convocado insertó el principal como HTML en vez de como texto (TC-040)');
        if (!insignias.some(b => b.textContent.includes('<b>x</b>'))) problemas.push('la insignia del principal desconocido tendría que mostrarlo como texto (TC-040)');
        return problemas;
      });
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
    spec: ['partido/S-01', 'partido/S-01a', 'partido/S-01b', 'partido/S-06'],
    invariantes: [INVARIANTE_PARTIDO_DOS_COLUMNAS],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      // FR-011: con la inscripción abierta, el switch mobile arranca en "Convocados".
      return page.evaluate(() => {
        const tab = (document.getElementById('matchColumns') || {}).getAttribute?.('data-mob-tab');
        return tab === 'convocados' ? [] : [`el switch no arrancó en "Convocados" con la inscripción abierta (partido/S-06, arrancó en "${tab}")`];
      });
    } },

  { clave: 'partido-cerrado', rol: 'admin', nombre: 'detalle de partido · cargar resultado',
    /* `finalizado/S-02c`: este mismo `comprobar` ya verifica que los bloques del panel de armado
       (combo, receipt, diferencia por línea) siguen ahí con la inscripción cerrada y no
       finalizada, exactamente lo que esa variante pide. Desde la rebanada 6 (D-12, TC-011) la
       cancha se muestra siempre, sin excepción: ya no hay un estado "cerrado" que vuelva a la
       lista de filas, así que esa rama dejó de existir para verificar. */
    spec: ['cancha/S-10', 'arrastre/S-10', 'arrastre/S-06b', 'panel/S-11', 'panel/S-11b', 'panel/S-02b', 'panel/S-03c', 'finalizado/S-02c', 'partido/S-01', 'partido/S-06a'],
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA, INVARIANTE_PARTIDO_DOS_COLUMNAS],
    async preparar(page) { await abrirPartido(page, '2026-08-27'); },
    async comprobar(page) {
      /* NOTA (2026-09-02): a pedido del usuario, el combo de estrategia deja de mostrarse
         (deshabilitado) con la inscripción cerrada — la estrategia ya no se puede tocar en ese
         estado, así que se saca entero en vez de quedar ahí sin poder usarse; cambia lo que
         describían `panel/FR-010`/`FR-015`/`S-02b`. El aviso de desactualizado sigue sin
         aparecer, y los bloques del panel que no dependen de la cancha siguen ahí (S-11, S-11b). */
      return page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha con la inscripción cerrada (D-12, TC-011)');
        if (document.querySelector('#selectEstrategia')) problemas.push('el combo de estrategia sigue viéndose con la inscripción cerrada, ya no se puede modificar');
        if (document.querySelector('.panel-aviso')) problemas.push('apareció el aviso de desactualizado con la inscripción cerrada (panel FR-024, S-03c)');
        if (!document.querySelector('.panel-header')) problemas.push('la tarjeta perdió el encabezado nuevo (panel S-11)');
        if (!document.querySelector('.panel-receipt')) problemas.push('la tarjeta perdió el receipt (panel S-11)');
        if (!document.querySelector('.panel-lineas')) problemas.push('la tarjeta perdió la diferencia por línea (panel S-11)');
        // FR-010: con la inscripción cerrada, el switch mobile arranca en "Equipos"/"Resultado".
        const tab = (document.getElementById('matchColumns') || {}).getAttribute?.('data-mob-tab');
        if (tab !== 'equipos') problemas.push(`el switch no arrancó en "Equipos" con la inscripción cerrada (partido/S-06a, arrancó en "${tab}")`);
        return problemas;
      });
    } },

  { clave: 'partido-finalizado', rol: 'admin', nombre: 'detalle de partido · finalizado',
    /* `cancha/S-10a`, `arrastre/S-10a` y `panel/S-11a` decían "partido finalizado: mismo
       resultado que cerrado, sin cancha" — la rebanada 4 invierte exactamente eso (FR-020), así
       que esos tres tags dejan de describir esta pantalla y se reemplazan por los de la Spec de
       esta rebanada.

       NOTA (2026-09-04): al implementar el turno 12 del documento de diseño, la tarjeta pasa a
       titularse "Resultado" —sin la fecha ni la línea con la estrategia aplicada, que `12c` no
       dibuja y que el encabezado de la pantalla ya dice— y el nombre + puntaje de armado vuelven
       a los costados de la fila de resultado en dos columnas, con el encabezado de cada campo
       retirado en ese ancho. En una columna nada de eso cambia: la fila queda con el marcador y
       el puntaje sigue arriba del campo. `PARTIDO_FINALIZADO_SPEC.md` §18 lo registra. */
    spec: ['finalizado/S-01', 'finalizado/S-01a', 'finalizado/S-02', 'finalizado/S-02a', 'finalizado/S-03', 'finalizado/S-04', 'finalizado/S-04b', 'finalizado/S-05', 'partido/S-01', 'partido/S-05'],
    invariantes: [INVARIANTE_CANCHA, INVARIANTE_CANCHA_A11Y, INVARIANTE_SELECTOR, INVARIANTE_PANEL, INVARIANTE_CHIPS_ESTADISTICA, INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA, INVARIANTE_PARTIDO_DOS_COLUMNAS],
    async preparar(page) { await abrirPartido(page, '2026-08-20'); },
    async comprobar(page) {
      /* A 360px (una columna): título con sólo la fecha, la fila de resultado sin nombre ni
         puntaje de armado (los dos viven ahora en el encabezado de la cancha, y ahí el nombre se
         reemplaza por el puntaje porque la pestaña activa ya dice qué equipo es), y ningún
         bloque del panel de armado que ya no aplica a este estado. */
      const unaColumna = await page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha del partido finalizado (finalizado/S-02)');
        if (!document.querySelector('.stat-goles, .stat-asistencias')) problemas.push('ninguna camiseta lleva chips de estadística (finalizado/S-03)');
        if (!document.querySelector('.fila-resultado')) problemas.push('no apareció la fila de resultado (finalizado/S-04)');
        if (!document.querySelector('.detalle-fila, .detalle-vacio')) problemas.push('no apareció ninguna fila de detalle (finalizado/S-05)');
        if (document.querySelector('.panel-lineas')) problemas.push('sigue la diferencia por línea en el partido finalizado (FR-043)');
        if (document.querySelector('.panel-receipt')) problemas.push('sigue el receipt en el partido finalizado (FR-043)');
        if (document.querySelector('.panel-pildora')) problemas.push('sigue la píldora de diferencia en el partido finalizado (FR-043)');
        const nombre = document.querySelector('.team-panel h4 .team-name');
        if (nombre && nombre.getBoundingClientRect().width > 0) problemas.push('a 360px se ve el nombre del equipo en el encabezado de la cancha, repite la pestaña activa');
        const total = document.querySelector('.team-panel h4 .team-total');
        if (!total || total.getBoundingClientRect().width === 0 || !/\d/.test(total.textContent)) {
          problemas.push('a 360px no se ve el puntaje de armado en el encabezado de la cancha');
        }
        const titulo = (document.querySelector('.panel-header h3') || {}).textContent || '';
        if (titulo.trim() !== 'Resultado') problemas.push(`a 360px la tarjeta no se titula "Resultado" (finalizado/S-01a): "${titulo}"`);
        const nombresResultado = [...document.querySelectorAll('.resultado-nombre')];
        if (nombresResultado.some(n => n.getBoundingClientRect().width > 0)) problemas.push('a 360px se ve el nombre del equipo en la fila de resultado, lo dice la pestaña activa (finalizado/S-04b)');
        const puntajes = [...document.querySelectorAll('.resultado-puntaje')];
        if (puntajes.some(p => p.getBoundingClientRect().width > 0)) problemas.push('a 360px se ve el puntaje de armado en la fila de resultado, vive arriba del campo (finalizado/S-04b)');
        const iconos = document.querySelectorAll('.panel-header-acciones .panel-icono');
        if (iconos.length !== 2) problemas.push(`el encabezado nuevo tiene ${iconos.length} ícono(s) de acción en vez de 2 (finalizado/S-01)`);
        // TC-006 de NAVEGACION_PARTIDOS_SPEC.md (D-06 del Concept Note): la estrategia aplicada
        // no se nombra en ninguna parte de la pantalla — FR-084/D-25 de PANEL_ARMADO_SPEC.md se
        // mantienen vigentes, y desde 2026-09-04 el encabezado del finalizado tampoco la nombra
        // (FR-003/FR-005 de PARTIDO_FINALIZADO_SPEC.md, sin efecto).
        if (/Estrategia:/i.test(document.getElementById('matchDetailView').textContent)) {
          problemas.push('reapareció la estrategia aplicada como texto fijo en el finalizado (partido/S-05, TC-006, finalizado/S-01)');
        }
        return problemas;
      });
      /* A 1200px (dos columnas, el ancho de `12c`): la tarjeta sigue titulándose "Resultado", la
         fila de resultado lleva el nombre y el puntaje de armado a cada costado del marcador, y
         arriba de los campos no queda ningún encabezado que los repita. */
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.waitForTimeout(200);
      const dosColumnas = await page.evaluate(() => {
        const problemas = [];
        const titulo = (document.querySelector('.panel-header h3') || {}).textContent || '';
        if (titulo.trim() !== 'Resultado') problemas.push(`a 1200px la tarjeta no se titula "Resultado" (finalizado/S-01): "${titulo}"`);
        const nombresResultado = [...document.querySelectorAll('.resultado-nombre')];
        if (nombresResultado.length !== 2 || nombresResultado.some(n => n.getBoundingClientRect().width === 0)) {
          problemas.push('a 1200px la fila de resultado no muestra los dos nombres de equipo (finalizado/S-04)');
        }
        const puntajesResultado = [...document.querySelectorAll('.resultado-puntaje')];
        if (puntajesResultado.length !== 2 || puntajesResultado.some(p => p.getBoundingClientRect().width === 0 || !/\d/.test(p.textContent))) {
          problemas.push('a 1200px la fila de resultado no muestra los dos puntajes de armado (finalizado/S-04)');
        }
        if (document.querySelector('.team-panel h4')) {
          problemas.push('a 1200px quedó un encabezado arriba del campo: repite lo que la fila de resultado ya dice (finalizado/S-04, FR-042b)');
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
      await mostrarEquiposMobile(page);
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
    async preparar(page) { await abrirPartido(page, '2026-09-10'); await mostrarEquiposMobile(page); },
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
        if (document.querySelector('.chip-estrategia')) problemas.push('el rol jugador ve el combo de estrategia (panel FR-080)');
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
    async preparar(page) { await abrirPartido(page, '2026-09-10'); await mostrarEquiposMobile(page); },
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
    async preparar(page) { await abrirPartido(page, '2026-09-10'); await mostrarEquiposMobile(page); },
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
       píldora cambia de lugar (FR-004 vs FR-005).

       NOTA (2026-09-02): `panel/S-02` cambió de sentido (ver PANEL_ARMADO_SPEC.md §18) — el combo
       ya no muestra ningún resumen debajo, así que este escenario ahora sólo verifica que el
       combo se dibuje, sin ese texto. */
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
          /* Tres ramas y no un ternario: con dos, cualquier clase no reconocida caía en 'regenerar',
             y el botón de intercambiar colores se contaba como un segundo Regenerar. */
          ordenIconos: [...sec.querySelectorAll('.panel-icono')].map(b => b.classList.contains('panel-icono-intercambiar') ? 'intercambiar'
            : b.classList.contains('panel-icono-copiar') ? 'copiar' : b.classList.contains('panel-icono-regenerar') ? 'regenerar' : 'otro'),
          combo: !!sec.querySelector('#selectEstrategia'),
          interrogacion: !!sec.querySelector('.info-icon'),
          celdas: [...sec.querySelectorAll('.panel-celda')].map(c => c.querySelector('.panel-celda-linea').textContent.trim()),
          receipt: !!sec.querySelector('.panel-receipt'),
          receiptItems: sec.querySelectorAll('.panel-receipt li').length,
          /* Cerrado por omisión (`FR-072d`). Este escenario llega a la pantalla sin tocar nada,
             así que es el único lugar donde el estado inicial se puede afirmar de verdad. */
          receiptAbierto: !!(sec.querySelector('details.panel-receipt') || {}).open,
          receiptEsDesplegable: !!sec.querySelector('details.panel-receipt > summary'),
          receiptConCaja: sec.querySelector('.panel-receipt')
            ? getComputedStyle(sec.querySelector('.panel-receipt')).backgroundColor !== 'rgba(0, 0, 0, 0)' : false,
          cajitas: sec.querySelectorAll('.conv-summary').length,
          copiarEnPie: !!sec.querySelector('.panel-botonera .btn-ghost[onclick*="copiarFormacion"]'),
        };
      });
      if (estructura.titulo !== 'Alineaciones') problemas.push(`el encabezado dice "${estructura.titulo}" y debería decir "Alineaciones" (FR-001)`);
      if (!estructura.copiar || !estructura.regenerar) problemas.push('faltan los botones de ícono del encabezado (FR-001, FR-002)');
      /* FR-002b fijaba Copiar, Regenerar; lo reemplaza FR-042 de intercambiar-colores. */
      if (estructura.ordenIconos.join(',') !== 'intercambiar,copiar,regenerar') problemas.push(`los íconos van Intercambiar, Copiar, Regenerar y quedaron ${estructura.ordenIconos.join(',')} (intercambiar-colores FR-042)`);
      if (estructura.copiarEnPie) problemas.push('Copiar sigue al pie: subió al encabezado (FR-063)');
      if (estructura.cajitas) problemas.push(`quedaron ${estructura.cajitas} .conv-summary en la tarjeta: los tres resúmenes se retiraron (D-23, AC-07)`);
      if (!estructura.combo) problemas.push('no se dibujó el combo de estrategia (FR-010)');
      if (estructura.interrogacion) problemas.push('sigue el ícono "?" en el combo (FR-012)');
      /* La grilla sólo aparece si el armado guardado lleva balance por línea. El fixture ahora lo
         lleva, así que ausencia acá es un fallo y no un "no aplica" (FR-030, S-10). */
      if (estructura.celdas.join(',') !== 'Arco,Defensa,Medio,Ataque') {
        problemas.push(`la grilla dibujó [${estructura.celdas.join(', ')}] y se esperaban las cuatro líneas (FR-030, FR-031b)`);
      }
      if (!estructura.receipt) problemas.push('no se dibujó el bloque "Por qué quedaron así" (FR-040)');
      if (!estructura.receiptItems) problemas.push('el receipt quedó sin ninguna viñeta (FR-041)');
      if (estructura.receiptConCaja) problemas.push('el receipt conserva fondo propio: va sin caja, con divisor (FR-042)');
      if (!estructura.receiptEsDesplegable) problemas.push('el receipt no es un <details> con su <summary> (FR-072d)');
      if (estructura.receiptAbierto) problemas.push('el receipt se dibuja abierto y tiene que arrancar cerrado (FR-072d)');
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
      /* En 0.2 y no en 1: con las dos duplas del plantel testigo contando como el promedio de
         sus dos integrantes (FR-036) en vez de la suma de los dos, el Arco —que por descarte le
         toca a una dupla, al no haber ningún candidato natural— queda desparejo por sólo 0.3, no
         por 6. El umbral se corre para seguir por debajo de la diferencia más chica del fixture
         y seguir ejercitando el mismo caso de D-22. */
      if (campo) { await campo.fill('0.2'); await campo.dispatchEvent('change'); await page.waitForTimeout(250); }
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
      /* El plantel testigo tiene un solo candidato a arquero (Nilo, por posición secundaria) y
         ningún candidato a delantero fuera de Esteban, así que el Arco y el Ataque quedan
         desparejos: el Arco por 0.3 (a la dupla que le toca de arquero se le promedia el
         puntaje, FR-036) y el Ataque por 6. Aunque son líneas de un solo lugar por equipo (esa
         diferencia sigue siendo inevitable y el receipt la sigue explicando así), el color no
         las distingue de las demás: con el umbral por debajo de las cuatro diferencias, las
         cuatro líneas se marcan igual. */
      if (!por.Defensa || !por.Defensa.excedida) problemas.push('la Defensa supera el desvío y podía repartirse: debería quedar marcada (FR-033)');
      if (!por.Medio || !por.Medio.excedida) problemas.push('el Medio supera el desvío y podía repartirse: debería quedar marcado (FR-033)');
      if (!por.Arco) problemas.push('el Arco no se dibujó: el fixture debería dejarlo con puntaje');
      else if (!por.Arco.excedida) problemas.push(`el Arco supera el desvío (${por.Arco.texto}): debería quedar marcado igual que Defensa y Medio`);
      if (!por.Ataque) problemas.push('el Ataque no se dibujó: el fixture debería dejarlo con puntaje');
      else if (!por.Ataque.excedida) problemas.push(`el Ataque supera el desvío (${por.Ataque.texto}): debería quedar marcado igual que Defensa y Medio`);
      return problemas;
    } },

  { clave: 'panel-recalculo', rol: 'admin', nombre: 'los números y las explicaciones derivables siguen al reparto',
    anchos: [1200],
    spec: ['panel/S-06', 'panel/S-06b', 'panel/S-06k', 'panel/NFR-004', 'panel/NFR-005'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const problemas = [];
      await page.evaluate(() => { window.__escrituras_base = (window.__escrituras || []).length; });
      const leer = () => page.evaluate(() => ({
        pildora: (document.querySelector('.panel-pildora') || {}).textContent || null,
        celdas: [...document.querySelectorAll('.panel-celda')].map(c => c.querySelector('.panel-celda-cifras').textContent.trim()),
        /* Las tres listas posibles del receipt. Mientras el reparto no se haya apartado de la
           generación es UNA sola sin rótulos (`--unica`); apartado, son los dos grupos. Medirlas
           por separado es lo que permite afirmar que uno siguió al reparto y el otro no; antes
           era un solo `.panel-receipt li` y sólo se podía comparar el bloque entero, que es lo
           que este escenario afirmaba que NO cambiaba (`FR-072`). */
        unica: [...document.querySelectorAll('.panel-receipt-lista--unica li')].map(li => li.textContent.trim()),
        vigentes: [...document.querySelectorAll('.panel-receipt-lista--vigentes li')].map(li => li.textContent.trim()),
        generacion: [...document.querySelectorAll('.panel-receipt-lista--generacion li')].map(li => li.textContent.trim()),
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
      /* La enmienda de `D-25` (registrada como `D-26`): lo que se puede derivar del reparto sigue
         al reparto, y lo que narra una decisión del motor no. Antes este escenario afirmaba que el
         bloque ENTERO no cambiaba, que es exactamente lo que el propietario pidió invertir.

         Este fixture llega YA dividido, y a propósito: su `balanceLineas` guardado es sintético
         —está elegido a mano para ejercitar la regla de color de `D-22`, no calculado de su
         reparto—, así que el reparto en pantalla dice algo distinto de lo que dice el registro de
         la generación y `FR-072b2` divide el bloque con razón. Que un armado recién generado NO se
         divida se verifica en `panel/S-05j`, que corre el motor de verdad en las cuatro
         estrategias con y sin duplas; acá no hay armado recién generado que mirar. */
      if (antes.unica.length) {
        problemas.push('el fixture tiene un balance guardado que no es el de su reparto: el bloque debería venir dividido (FR-072b2)');
      }
      if (!antes.vigentes.length) problemas.push('el fixture debería producir explicaciones derivables del reparto (FR-072b)');
      if (!antes.generacion.length) problemas.push('el fixture debería producir explicaciones de la generación (FR-072b)');
      if (JSON.stringify(antes.vigentes) === JSON.stringify(despues.vigentes)) {
        problemas.push('el grupo "Con tus cambios" no cambió tras mover a alguien: tiene que seguir al reparto (FR-072c, D-26)');
      }
      if (JSON.stringify(antes.generacion) !== JSON.stringify(despues.generacion)) {
        problemas.push('el grupo "Como lo armó el motor" cambió tras un movimiento manual: describe la generación, no el estado (FR-072c)');
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

  /* El receipt pasó a ser un desplegable cerrado por omisión (`FR-072d`), y cerrado el navegador
     no dibuja su contenido: los invariantes de `panel-armado` medirían una caja vacía y el layout
     de los dos grupos —los rótulos, las viñetas largas, el texto que envuelve— nunca se mediría en
     360px. Este escenario lo abre en `preparar`, que es antes de `MEDIR`, para que las trece
     medidas de ancho lo tomen abierto.

     El fixture llega con los dos grupos sin necesidad de tocar nada, porque su `balanceLineas`
     guardado es sintético y no coincide con su reparto (ver `panel-recalculo`): es el caso más
     alto del bloque, que es el que conviene medir.

     `itemsVisibles` es lo que impide que el escenario se vuelva un falso verde: si el desplegable
     no llegara a abrirse, no habría nada renderizado y las medidas pasarían por vacías. */
  { clave: 'panel-receipt-abierto', rol: 'admin', nombre: 'el receipt desplegado, en los dos grupos',
    spec: ['panel/S-05h', 'panel/S-05i', 'panel/NFR-001', 'panel/NFR-002'],
    async preparar(page) {
      await abrirPartido(page, '2026-09-03');
      /* Debajo del punto de corte la columna de equipos arranca oculta, y con ella el receipt:
         sin esto no habría nada que abrir ni que medir en los anchos angostos, que son justo los
         que importan. */
      await mostrarEquiposMobile(page);
      await page.evaluate(() => {
        const d = document.querySelector('details.panel-receipt');
        if (d) d.open = true;
      });
      await page.waitForTimeout(120); // que termine la transición del chevron antes de medir
    },
    async comprobar(page) {
      const problemas = [];
      const r = await page.evaluate(() => {
        const d = document.querySelector('details.panel-receipt');
        if (!d) return null;
        const items = [...d.querySelectorAll('li')];
        return {
          abierto: d.open,
          itemsVisibles: items.filter(li => li.offsetParent !== null).length,
          grupos: [...d.querySelectorAll('.panel-receipt-grupo')].map(s => s.textContent.trim()),
          vigentes: d.querySelectorAll('.panel-receipt-lista--vigentes li').length,
          generacion: d.querySelectorAll('.panel-receipt-lista--generacion li').length,
          marcadorNativo: getComputedStyle(d.querySelector('summary')).listStyleType,
        };
      });
      if (!r) return ['no se dibujó el bloque "Por qué quedaron así" (FR-040)'];
      if (!r.abierto) problemas.push('el desplegable no quedó abierto: las medidas de este escenario serían de una caja vacía');
      if (!r.itemsVisibles) problemas.push('abierto, el bloque no renderizó ninguna viñeta: no hay nada que medir (FR-041)');
      if (!r.vigentes) problemas.push('el fixture debería producir explicaciones derivables del reparto (FR-072b)');
      if (!r.generacion) problemas.push('el fixture debería producir explicaciones de la generación (FR-072b)');
      if (r.grupos.join('|') !== 'Con tus cambios|Como lo armó el motor') {
        problemas.push(`los rótulos de grupo quedaron [${r.grupos.join(', ')}] y se esperaban los dos, en ese orden (FR-072b)`);
      }
      if (r.marcadorNativo !== 'none') problemas.push('el summary conserva el marcador nativo del navegador, que no está en el design system');
      // El estado inicial cerrado lo verifica `panel-armado`, que llega a la pantalla sin tocar nada.
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
    async preparar(page) { await abrirPartido(page, '2026-09-10'); await mostrarEquiposMobile(page); },
    async comprobar(page) {
      const problemas = [];
      const a = await page.evaluate(() => ({
        ancho: window.innerWidth,
        tabs: document.querySelectorAll('.equipo-tab').length,
        arrastrables: document.querySelectorAll('.camiseta[draggable="true"]').length,
        /* Fuera del listado de Jugadores: ahí cualquier cuenta arrastra para armar su propio orden
           (orden-por-columnas FR-030), y este escenario es sobre la cancha. */
        zonasConDrop: [...document.querySelectorAll('[ondrop]')].filter(z => !z.closest('.roster')).length,
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
    anchos: [360, 1200], spec: ['cancha/S-10c', 'arrastre/S-10c', 'partido/S-04', 'partido/S-04a'],
    invariantes: [INVARIANTE_SIN_ARRASTRE_FUERA_DE_LA_CANCHA, INVARIANTE_PARTIDO_DOS_COLUMNAS],
    async preparar(page) { await abrirPartido(page, '2026-09-17'); },
    async comprobar(page) {
      return page.evaluate(() => {
        const problemas = [];
        if (document.querySelector('.cancha')) problemas.push('se dibujó una cancha sin que el motor hubiera repartido los equipos');
        const vacio = document.querySelector('.empty-state-ds');
        if (!vacio) problemas.push('no apareció el empty state del design system (partido/S-04, FR-006)');
        else if (!/Todavía no generaste los equipos/.test(vacio.textContent)) problemas.push('el empty state no tiene el título esperado (partido/S-04)');
        if (!document.querySelector('.armado-preview')) problemas.push('no apareció la lista "Con qué va a armar" (partido/S-04, FR-006)');
        // FR-007: admin ve el botón "Generar equipos".
        if (![...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Generar equipos')) {
          problemas.push('el admin no ve el botón "Generar equipos" (partido/S-04a, FR-007)');
        }
        return problemas;
      });
    } },

  { clave: 'partido-sin-equipos-jugador', rol: 'jugador', nombre: 'detalle de partido · sin equipos generados (rol jugador)',
    anchos: [1200], spec: ['partido/S-04b'],
    async preparar(page) { await abrirPartido(page, '2026-09-17'); },
    async comprobar(page) {
      // FR-008: el rol jugador no ve el botón "Generar equipos", aunque vea el mismo empty state.
      return page.evaluate(() => {
        const problemas = [];
        if (!document.querySelector('.empty-state-ds')) problemas.push('el rol jugador no ve el empty state de equipos sin generar (partido/S-04b)');
        if ([...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Generar equipos')) {
          problemas.push('el rol jugador ve el botón "Generar equipos" (partido/S-04b, FR-008)');
        }
        return problemas;
      });
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
    /* Desde 2026-09-04 (`PARTIDO_FINALIZADO_SPEC.md` §18) fútbol 9 no cambia nada del
       encabezado: la línea con la formación y la estrategia se retiró, y la tarjeta se titula
       "Resultado" en los dos anchos. Lo que queda por verificar del tamaño de cancha es que la
       cancha dibuje la fila de cuatro volantes, y de eso ya se ocupa `INVARIANTE_CANCHA` sobre
       este mismo escenario. */
    async comprobar(page) {
      const leer = () => page.evaluate(() => ({
        titulo: ((document.querySelector('.panel-header h3') || {}).textContent || '').trim(),
        estrategia: /Estrategia:/i.test(document.getElementById('matchDetailView').textContent),
      }));
      const unaColumna = await leer();
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.waitForTimeout(200);
      const dosColumnas = await leer();
      const problemas = [];
      for (const [ancho, v] of [['360px', unaColumna], ['1200px', dosColumnas]]) {
        if (v.titulo !== 'Resultado') problemas.push(`a ${ancho} la tarjeta de fútbol 9 no se titula "Resultado" (finalizado/S-10): "${v.titulo}"`);
        if (v.estrategia) problemas.push(`a ${ancho} reapareció la estrategia aplicada en fútbol 9 (finalizado/S-01b, S-10a)`);
      }
      return problemas;
    } },

  /* La carga por toque (rebanada 6 de "Equipos en el campo"). Corre en los trece anchos por
     `INVARIANTE_CARGA_TOQUE` (NFR-001, NFR-002); el comportamiento —lo que no depende del
     ancho— corre una sola vez, en el primer ancho de la lista (360px, una columna, con
     selector de equipo). Guardar/editar/cancelar quedan en `eventos-finalizar`/`eventos-editar`,
     reescritos para tocar en vez de llenar inputs (toque/S-07, S-07a, S-07b, S-07c, S-07d). */
  { clave: 'carga-por-toque', rol: 'admin', nombre: 'cargar un resultado tocando la cancha',
    spec: ['toque/S-01', 'toque/S-01a', 'toque/S-01c', 'toque/S-01e', 'toque/S-01f', 'toque/S-04d', 'toque/S-04e', 'toque/S-05a', 'toque/S-06', 'partido/S-07', 'partido/S-07a', 'partido/S-07b'],
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

            // partido/S-07, TC-004 de NAVEGACION_PARTIDOS_SPEC.md: el botón "+" de la fila de
            // detalle produce el mismo efecto que tocar la camiseta — reutiliza la misma fila
            // (idA) que ya está en "1" por el toque de arriba.
            const filaA = filaDe(idA);
            const botonMas = filaA && filaA.querySelector('.detalle-agregar-btn');
            if (!botonMas) {
              problemas.push('no se encontró el botón "+" en la fila de detalle (partido/S-07, FR-013)');
            } else {
              botonMas.click();
              const cifraTrasMas = filaDe(idA).querySelector('.detalle-cifra');
              if (!cifraTrasMas || cifraTrasMas.textContent.trim() !== '2') {
                problemas.push(`el botón "+" no sumó la cifra a "2" (partido/S-07): "${cifraTrasMas && cifraTrasMas.textContent.trim()}"`);
              }
              // partido/S-07b [concurrency]: dos toques del "+" sin esperar agregan dos eventos.
              botonMas.click(); botonMas.click();
              const cifraTrasDoble = filaDe(idA).querySelector('.detalle-cifra');
              if (!cifraTrasDoble || cifraTrasDoble.textContent.trim() !== '4') {
                problemas.push(`el doble toque del "+" no dejó la cifra en "4" (partido/S-07b): "${cifraTrasDoble && cifraTrasDoble.textContent.trim()}"`);
              }
              // partido/S-07a [failure]: tocar "−" hasta vaciar la fila la hace desaparecer.
              const botonMenos = filaDe(idA).querySelector('.detalle-quitar-btn');
              for (let i = 0; i < 4; i++) { const f = filaDe(idA); if (f) f.querySelector('.detalle-quitar-btn').click(); }
              if (filaDe(idA)) problemas.push('la fila no desapareció al sacarle todos los eventos con "−" (partido/S-07a)');
            }
          }
        }

        // toque/S-06: cambiar de pestaña de equipo conserva los eventos ya cargados de Blanco, y
        // el marcador del equipo que no está en pantalla también deriva del borrador completo
        // (FR-020 a FR-022). El total de goles vive en la franja de resultado (`.resultado-gol`,
        // dos spans: Blanco y Negro en ese orden) — el header del equipo (`.team-total`) sólo
        // muestra el puntaje de armado desde que ese número se sacó de ahí por ser redundante
        // (2026-09-02, a pedido del usuario).
        const totalBlanco = document.getElementById('totalBlancoSpan');
        const marcadorBlancoAntes = totalBlanco ? totalBlanco.textContent : null;
        const golesResultado = () => [...document.querySelectorAll('.resultado-gol')];
        const tabOtra = document.querySelector('.equipo-tab[aria-pressed="false"]');
        if (!tabOtra) {
          problemas.push('no había pestaña del otro equipo para cambiar (toque/S-06)');
        } else {
          tabOtra.click();
          const golNegroAntes = golesResultado()[1];
          if (!golNegroAntes || golNegroAntes.textContent.trim() !== '0') {
            problemas.push(`el marcador de Negro antes de tocarlo no muestra "0" (toque/S-06, FR-022): "${golNegroAntes && golNegroAntes.textContent}"`);
          }
          const nombreNegro = individuales()[0];
          if (nombreNegro) nombreNegro.click();
          const golNegroDespues = golesResultado()[1];
          if (!golNegroDespues || golNegroDespues.textContent.trim() !== '1') {
            problemas.push(`tocar un nombre de Negro no actualizó su marcador a "1" (toque/S-06): "${golNegroDespues && golNegroDespues.textContent}"`);
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
        const deshacer = () => document.querySelector('.carga-acciones .panel-icono');
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

         Desde que las acciones viven en un menú, llegar al modal son dos pasos. Y el renglón
         se elige con `:not(.conv-row-dupla)` a propósito: el menú de un jugador que YA está en
         una rotación ofrece "Deshacer", no "Agregar", y el fixture tiene una dupla en la
         primera fila — tomar el primer menú del DOM abría el equivocado y el escenario moría
         por timeout. */
      await page.waitForSelector('.conv-row:not(.conv-row-dupla) .conv-menu-btn', { timeout: 5000 });
      await page.click('.conv-row:not(.conv-row-dupla) .conv-menu-btn');
      await page.click('.conv-menu-item:has-text("Agregar rotación")');
      await page.waitForSelector('#duplaModal.open');
    } },

  /* El menú de acciones de un convocado. Es la única superficie flotante de esta pantalla y se
     ancla al botón que lo abrió, así que lo que hay que ver es que no se salga del viewport por
     ningún lado. Se abre el de la ÚLTIMA fila, que es el caso que obliga al menú a subir en vez
     de bajar.

     La medición se toma DENTRO de `preparar`, apenas se abre, y se guarda en `window`: el menú
     se cierra solo ante cualquier scroll o resize —tiene que hacerlo, está anclado con
     `position:fixed` a un botón que se va de pantalla— y para cuando corre `comprobar` ya no
     está. Medir en el momento es la única forma de mirarlo sin desactivar ese comportamiento. */
  { clave: 'menu-convocado', rol: 'admin', nombre: 'menú de acciones de un convocado, abierto',
    async preparar(page) {
      await abrirPartido(page, '2026-09-03');
      // Con la inscripción abierta el switch ya arranca en "Convocados" (FR-011), pero se fija
      // explícito para no depender de eso en los anchos donde el switch manda.
      await page.evaluate(() => window.__setMobTab && window.__setMobTab('convocados'));
      await page.waitForTimeout(150);
      const botones = page.locator('.conv-row:not(.conv-row-dupla) .conv-menu-btn');
      await botones.last().waitFor({ timeout: 5000 });
      await botones.last().click();
      await page.waitForSelector('#convMenu:not([hidden])', { timeout: 5000 });
      await page.evaluate(() => {
        const problemas = [];
        const menu = document.getElementById('convMenu');
        const r = menu.getBoundingClientRect();
        const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
        if (r.left < 0 || r.right > w) problemas.push(`el menú se sale del viewport en horizontal a ${w}px (${Math.round(r.left)}–${Math.round(r.right)})`);
        if (r.top < 0 || r.bottom > h) problemas.push(`el menú se sale del viewport en vertical a ${w}px (${Math.round(r.top)}–${Math.round(r.bottom)} de ${h})`);
        const items = [...menu.querySelectorAll('.conv-menu-item')];
        if (items.length !== 2) problemas.push(`el menú del último convocado tiene ${items.length} opción(es) en vez de 2`);
        for (const it of items) {
          const b = it.getBoundingClientRect();
          if (b.height < 24 - 0.5) problemas.push(`una opción mide ${Math.round(b.height)}px de alto, por debajo del piso táctil de 24px`);
          if (!it.textContent.trim()) problemas.push('una opción del menú quedó sin texto');
        }
        window.__medicionMenu = problemas;
      });
    },
    /* Corre en los trece anchos vía `preparar`; `comprobar` sólo devuelve lo que aquél midió,
       en el primero. */
    async comprobar(page) {
      return page.evaluate(() => window.__medicionMenu || ['no se llegó a medir el menú']);
    } },

  { clave: 'toast', rol: 'admin', nombre: 'toast de aviso',
    async preparar(page) {
      await irAPestania(page, 'Partidos');
      await page.evaluate(() => window.__showToast && window.__showToast('No se pudo copiar la formación al portapapeles', 'error'));
      await page.waitForTimeout(150);
    } },

  /* --- intercambiar colores (docs/intercambiar-colores) --- */

  { clave: 'colores-encabezado', rol: 'admin', nombre: 'el encabezado con el botón de intercambiar colores',
    /* Layout, así que corre en los diecisiete anchos: el encabezado pasa de dos a tres botones y
       tiene que seguir entrando desde 360px (NFR-002). El desborde lo mide MEDIR en cada ancho;
       el piso de 44px y el nombre accesible, INVARIANTE_PANEL (NFR-003). El invariante propio
       mira lo que es de esta feature: que el botón esté, en su lugar y con el peso de Copiar. */
    spec: ['colores/S-05', 'colores/S-05a', 'colores/S-05b', 'colores/S-05c', 'colores/NFR-002', 'colores/NFR-003'],
    invariantes: [INVARIANTE_PANEL, () => {
      const problemas = [];
      const header = document.querySelector('#teamsSection .panel-header');
      if (!header) return ['no se encontró el encabezado de la tarjeta de equipos'];
      const btn = header.querySelector('.panel-icono-intercambiar');
      if (!btn) return ['falta el botón de intercambiar colores en el encabezado (FR-001)'];
      const orden = [...header.querySelectorAll('.panel-icono')].map(b =>
        b.classList.contains('panel-icono-intercambiar') ? 'intercambiar'
          : b.classList.contains('panel-icono-copiar') ? 'copiar'
            : b.classList.contains('panel-icono-regenerar') ? 'regenerar' : 'otro');
      if (orden.join(',') !== 'intercambiar,copiar,regenerar') problemas.push(`los íconos quedaron ${orden.join(',')} y van intercambiar, copiar, regenerar (FR-042)`);
      if (btn.getAttribute('aria-label') !== 'Intercambiar colores') problemas.push(`el botón se llama "${btn.getAttribute('aria-label')}" y tiene que llamarse "Intercambiar colores" (FR-041)`);
      if (btn.getAttribute('title') !== 'Intercambiar colores') problemas.push('el botón no tiene el título "Intercambiar colores" (FR-041)');
      const copiar = header.querySelector('.panel-icono-copiar');
      if (copiar && getComputedStyle(btn).color !== getComputedStyle(copiar).color) problemas.push('el botón de intercambiar no tiene el color de Copiar (FR-043)');
      const relleno = btn.querySelector('path.relleno');
      if (!relleno) problemas.push('el ícono no tiene la mitad rellena de la camiseta (FR-040)');
      else if (getComputedStyle(relleno).fill !== getComputedStyle(btn).color) problemas.push('la mitad rellena no usa el color del trazo (FR-040, TC-030)');
      return problemas;
    }],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); await mostrarEquiposMobile(page); } },

  { clave: 'colores-intercambio', rol: 'admin', nombre: 'tocar intercambiar colores: pantalla, guardado y doble toque',
    /* Comportamiento, no layout: un ancho. Lo que el panel DICE después (píldora, grilla, receipt)
       lo prueba tests/colores.test.js sobre las funciones reales; acá se mira el cableado de
       punta a punta: el clic, el repintado, qué se escribe y en qué documento. */
    anchos: [1200],
    spec: ['colores/S-01', 'colores/S-01h', 'colores/S-07', 'colores/S-07a', 'colores/S-07b', 'colores/NFR-001'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const problemas = [];
      const leer = () => page.evaluate(() => {
        const nombres = sel => [...document.querySelectorAll(sel)].map(c => c.getAttribute('aria-label') || c.textContent.trim()).sort();
        return { blanco: nombres('.camiseta.blanco-eq'), negro: nombres('.camiseta.negro-eq') };
      });
      const antes = await leer();
      if (!antes.blanco.length || !antes.negro.length) return ['el fixture tendría que dibujar las dos canchas'];
      const r = await page.evaluate(async () => {
        window.__escrituras_base = window.__escrituras.length;
        const t0 = performance.now();
        document.querySelector('.panel-icono-intercambiar').click();
        await new Promise(res => requestAnimationFrame(res));
        return { ms: performance.now() - t0 };
      });
      await page.waitForTimeout(300);
      const despues = await leer();
      if (JSON.stringify(despues.blanco) !== JSON.stringify(antes.negro) || JSON.stringify(despues.negro) !== JSON.stringify(antes.blanco)) {
        problemas.push('las camisetas no se repintaron con los grupos intercambiados (FR-010, FR-021, FR-030)');
      }
      if (r.ms > 150) problemas.push(`intercambiar tardó ${Math.round(r.ms)} ms y el techo es 150 (NFR-001)`);
      const guardado = await page.evaluate(() => ({
        escrituras: window.__escrituras.slice(window.__escrituras_base),
        docs: window.__ultimosDocs || {},
      }));
      if (guardado.escrituras.join(',') !== 'partidos,partidosArmado') {
        problemas.push(`se escribió [${guardado.escrituras.join(', ')}] y se esperaba partidos y partidosArmado, una vez cada uno (FR-020)`);
      }
      const publico = JSON.parse(guardado.docs.partidos || '[]').find(x => x.id === 'm-abierto');
      const armado = JSON.parse(guardado.docs.partidosArmado || '{}')['m-abierto'];
      if (!publico || !armado) return problemas.concat(['no quedó guardado el partido en los dos documentos (FR-020)']);
      const PUBLICOS = ['blanco', 'negro', 'posicionAsignada', 'posicionOverride'];
      const ARMADO = ['sumaBlanco', 'sumaNegro', 'balanceLineas', 'formacion', 'arquerosInfo'];
      const fugados = ARMADO.filter(k => k in publico.equipos);
      if (fugados.length) problemas.push(`campos de armado en el documento público: ${fugados.join(', ')} (TC-041, CWE-200)`);
      const faltan = ARMADO.filter(k => k !== 'arquerosInfo' && !(k in armado.equipos));
      if (faltan.length) problemas.push(`faltan en el documento de armado: ${faltan.join(', ')} (TC-041)`);
      const extra = Object.keys(publico.equipos).filter(k => !PUBLICOS.includes(k) && !['estrategiaKey', 'estrategia', 'titularesSnapshot', 'duplasSnapshot', 'configHash', 'cambios', 'esPrimeraGeneracion', 'swaps', 'arquerosExcedentes', 'arquerosPorSecundaria', 'enumeracionTruncada', 'resultado'].includes(k));
      if (extra.length) problemas.push(`campos nuevos en el partido guardado: ${extra.join(', ')} (NFR-004, TC-012)`);
      if (!publico.equipos.blanco || publico.equipos.blanco.length === 0) problemas.push('el documento público perdió la lista del Blanco');

      /* S-01h: dos toques seguidos, sin esperar el guardado del primero. La pantalla y lo último
         guardado tienen que terminar donde estaban antes de ESTE par de toques. */
      const previo = JSON.stringify(publico.equipos.blanco);
      await page.evaluate(() => {
        window.__escrituras_base = window.__escrituras.length;
        const b = () => document.querySelector('.panel-icono-intercambiar');
        b().click(); b().click();
      });
      await page.waitForTimeout(400);
      const tras2 = await leer();
      if (JSON.stringify(tras2) !== JSON.stringify(despues)) problemas.push('dos toques seguidos no dejaron la pantalla como estaba (FR-018, S-01h)');
      const ultimo = await page.evaluate(() => JSON.parse(window.__ultimosDocs.partidos).find(x => x.id === 'm-abierto').equipos.blanco);
      if (JSON.stringify(ultimo) !== previo) problemas.push('dos toques seguidos no dejaron guardado lo mismo que había (FR-018, S-01h)');
      const n = await page.evaluate(() => window.__escrituras.length - window.__escrituras_base);
      if (n !== 4) problemas.push(`dos toques escribieron ${n} veces y se esperaban 4 (dos documentos por toque)`);
      return problemas;
    } },

  { clave: 'colores-copiar', rol: 'admin', nombre: 'copiar los equipos después de intercambiar',
    anchos: [1200], spec: ['colores/S-03'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      const r = await page.evaluate(async () => {
        const nombres = sel => [...document.querySelectorAll(sel)].map(c => c.getAttribute('aria-label') || '');
        const leerTexto = async () => { document.querySelector('.panel-icono-copiar').click(); await new Promise(res => setTimeout(res, 300)); return navigator.clipboard.readText(); };
        const antes = await leerTexto();
        document.querySelector('.panel-icono-intercambiar').click();
        await new Promise(res => setTimeout(res, 300));
        const despues = await leerTexto();
        return { antes, despues, blancoAhora: nombres('.camiseta.blanco-eq') };
      });
      const bloque = (texto, color) => {
        const i = texto.indexOf(`*${color}*`);
        if (i < 0) return null;
        const resto = texto.slice(i + 1);
        const j = resto.search(/\*(Blanco|Negro)\*/);
        return resto.slice(0, j < 0 ? undefined : j);
      };
      const problemas = [];
      const blancoAntes = bloque(r.antes, 'Blanco'), negroAntes = bloque(r.antes, 'Negro');
      const blancoDespues = bloque(r.despues, 'Blanco'), negroDespues = bloque(r.despues, 'Negro');
      if (!blancoAntes || !negroAntes || !blancoDespues || !negroDespues) return ['el texto copiado no trae los dos encabezados *Blanco* y *Negro*'];
      const cuerpo = s => s.split('\n').slice(1).join('\n').trim();
      if (cuerpo(blancoDespues) !== cuerpo(negroAntes)) problemas.push('bajo *Blanco* no quedaron los jugadores que eran del Negro (FR-033)');
      if (cuerpo(negroDespues) !== cuerpo(blancoAntes)) problemas.push('bajo *Negro* no quedaron los jugadores que eran del Blanco (FR-033)');
      return problemas;
    } },

  { clave: 'colores-pestana', rol: 'admin', nombre: 'el equipo visible sigue a los mismos jugadores',
    anchos: [360, 1200],
    spec: ['colores/S-04', 'colores/S-04a', 'colores/S-04b', 'colores/S-04c'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); await mostrarEquiposMobile(page); },
    /* `comprobar` corre en el primer ancho (360); el de 1200 lo mide el invariante. */
    invariantes: [() => {
      if (window.innerWidth < 900) return [];
      const canchas = document.querySelectorAll('#teamsSection .cancha').length;
      return canchas === 2 ? [] : [`en dos columnas se ven ${canchas} canchas y tienen que verse las dos (S-04b)`];
    }],
    async comprobar(page) {
      const problemas = [];
      const estado = () => page.evaluate(() => {
        const tabs = document.querySelector('.equipo-tabs');
        const visibles = [...document.querySelectorAll('.camiseta')].filter(c => c.offsetParent !== null);
        return {
          visible: tabs ? tabs.dataset.visible : null,
          nombres: visibles.map(c => c.getAttribute('aria-label')).sort(),
          colores: [...new Set(visibles.map(c => c.classList.contains('blanco-eq') ? 'blanco' : 'negro'))],
        };
      });
      const tocar = async () => { await page.evaluate(() => document.querySelector('.panel-icono-intercambiar').click()); await page.waitForTimeout(300); };
      const a = await estado();
      if (a.visible !== 'blanco') return [`se esperaba arrancar viendo el Blanco y se ve ${a.visible} (FR-033 de la rebanada 2)`];
      await tocar();
      const b = await estado();
      if (b.visible !== 'negro') problemas.push(`viendo el Blanco, después de intercambiar el equipo visible es ${b.visible} y tenía que ser el Negro (FR-035)`);
      if (JSON.stringify(b.nombres) !== JSON.stringify(a.nombres)) problemas.push('después de intercambiar se ven otros jugadores: tenían que seguir a la vista los mismos (FR-035)');
      if (b.colores.join() !== 'negro') problemas.push(`los jugadores que se ven tenían que tener camiseta negra y tienen ${b.colores.join('/')} (S-04)`);
      await tocar();
      const c = await estado();
      if (c.visible !== 'blanco' || JSON.stringify(c.nombres) !== JSON.stringify(a.nombres)) problemas.push('viendo el Negro, intercambiar no volvió al Blanco con los mismos jugadores (S-04a)');
      await tocar();                                                            // queda en el Negro
      const escrito = await page.evaluate(() => JSON.stringify(window.__ultimosDocs || {}));
      if (/equipoVisible|visibleCancha/.test(escrito)) problemas.push('el equipo visible se guardó: es estado de pantalla (TC-035 de la rebanada 2, S-04c)');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await abrirPartido(page, '2026-09-03');
      await mostrarEquiposMobile(page);
      const d = await estado();
      if (d.visible !== 'blanco') problemas.push(`después de recargar el equipo visible es ${d.visible} y vuelve a ser el Blanco (S-04c)`);
      return problemas;
    } },

  { clave: 'colores-guardado-falla', rol: 'admin', nombre: 'intercambiar con el guardado fallando',
    anchos: [1200], spec: ['colores/S-07c'],
    doble: { escrituraFalla: true },
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));
      const r = await page.evaluate(async () => {
        const blanco = () => [...document.querySelectorAll('.camiseta.blanco-eq')].map(c => c.getAttribute('aria-label')).sort();
        const negroAntes = [...document.querySelectorAll('.camiseta.negro-eq')].map(c => c.getAttribute('aria-label')).sort();
        document.querySelector('.panel-icono-intercambiar').click();
        await new Promise(res => setTimeout(res, 300));
        return { aplicado: JSON.stringify(blanco()) === JSON.stringify(negroAntes), escrituras: window.__escrituras.length };
      });
      const problemas = [];
      if (!r.aplicado) problemas.push('con el guardado fallando, la pantalla no muestra lo aplicado (S-07c)');
      if (errores.length) problemas.push(`el guardado fallido dejó una excepción sin capturar: ${errores[0]} (S-07c)`);
      if (r.escrituras !== 0) problemas.push('el doble registró escrituras que fallaron');
      return problemas;
    } },

  { clave: 'colores-no-disponible', rol: 'admin', nombre: 'sin intercambiar fuera de la inscripción abierta',
    anchos: [1200],
    spec: ['colores/S-20', 'colores/S-20a', 'colores/S-20b', 'colores/S-20c', 'colores/S-20d'],
    async preparar(page) { await irAPestania(page, 'Partidos'); },
    async comprobar(page) {
      const problemas = [];
      /* Abre el partido, confirma que no hay botón, y lo invoca directo: ni el documento ni el
         contador de escrituras pueden moverse (TC-040). */
      const probar = async (fecha, id, etiqueta, antesDeMirar) => {
        await abrirPartido(page, fecha);
        if (antesDeMirar) { await page.evaluate(antesDeMirar); await page.waitForTimeout(300); }
        const r = await page.evaluate((mid) => {
          const hayBoton = !!document.querySelector('.panel-icono-intercambiar');
          const base = window.__escrituras.length;
          const antes = JSON.stringify(window.__ultimosDocs || {});
          window.__intercambiarColores(mid);
          return { hayBoton, escrituras: window.__escrituras.length - base, cambio: JSON.stringify(window.__ultimosDocs || {}) !== antes };
        }, id);
        if (r.hayBoton) problemas.push(`${etiqueta}: se ve el botón de intercambiar colores`);
        if (r.escrituras || r.cambio) problemas.push(`${etiqueta}: invocar el manejador directo cambió o guardó el partido (TC-040)`);
        await page.click('#btnVolverPartidos');
        await page.waitForTimeout(300);
      };
      await probar('2026-08-27', 'm-cerrado', 'inscripción cerrada (S-20)');
      await probar('2026-08-20', 'm-finalizado', 'partido finalizado (S-20a)');
      await probar('2026-08-20', 'm-finalizado', 'editando el resultado finalizado (S-20b)', () => window.__editarResultadoFinalizado('m-finalizado'));
      await probar('2026-09-17', 'm-sin-equipos', 'sin equipos generados (S-20c)');
      /* S-20d: reabrir la inscripción del partido cerrado lo vuelve a habilitar. */
      await abrirPartido(page, '2026-08-27');
      await page.evaluate(() => window.__toggleInscripcion('m-cerrado'));
      await page.waitForTimeout(300);
      if (!await page.evaluate(() => !!document.querySelector('.panel-icono-intercambiar'))) problemas.push('al reabrir la inscripción el botón no volvió (S-20d)');
      return problemas;
    } },

  { clave: 'colores-jugador', rol: 'jugador', nombre: 'el rol jugador no puede intercambiar colores',
    anchos: [1200], spec: ['colores/S-21', 'colores/S-21a'],
    async preparar(page) { await abrirPartido(page, '2026-09-03'); },
    async comprobar(page) {
      const r = await page.evaluate(() => {
        const hayBoton = !!document.querySelector('.panel-icono-intercambiar');
        const hayCancha = !!document.querySelector('.cancha');
        const base = window.__escrituras.length;
        const antes = [...document.querySelectorAll('.camiseta.blanco-eq')].map(c => c.getAttribute('aria-label'));
        window.__intercambiarColores('m-abierto');
        const despues = [...document.querySelectorAll('.camiseta.blanco-eq')].map(c => c.getAttribute('aria-label'));
        return { hayBoton, hayCancha, escrituras: window.__escrituras.length - base, igual: JSON.stringify(antes) === JSON.stringify(despues) };
      });
      const problemas = [];
      if (!r.hayCancha) problemas.push('el jugador tendría que ver la cancha del partido abierto');
      if (r.hayBoton) problemas.push('el rol jugador ve el botón de intercambiar colores (FR-004)');
      if (r.escrituras) problemas.push('invocar el manejador como jugador pidió un guardado (FR-005, TC-040)');
      if (!r.igual) problemas.push('invocar el manejador como jugador cambió los equipos (FR-005, TC-040)');
      return problemas;
    } },

  /* ---- orden por columnas: el encabezado ----
     Los escenarios de orden-por-columnas que dependen de los títulos de la grilla. Los dos de
     encabezado son de layout y corren en los diecisiete anchos: de 760 para arriba miden que el
     indicador quede dentro de su celda con el orden en Pos y en Pts (S-09); abajo, que el menú con
     su opción más larga no desborde (S-09b). Los dos de comportamiento corren a 1200. */
  { clave: 'orden-encabezado', rol: 'admin', nombre: 'el encabezado ordenable entra en todos los anchos',
    spec: ['orden/S-09', 'orden/S-09b', 'orden/NFR-005'],
    invariante: INVARIANTE_ENCABEZADO_ORDEN,
    async preparar(page) { await prepararEncabezadoOrden(page); } },

  { clave: 'orden-encabezado-jugador', rol: 'jugador', nombre: 'el encabezado ordenable entra en todos los anchos (rol jugador)',
    spec: ['orden/S-09a'],
    invariante: INVARIANTE_ENCABEZADO_ORDEN,
    async preparar(page) { await prepararEncabezadoOrden(page); } },

  { clave: 'orden-titulo', rol: 'admin', nombre: 'tocar el título de una columna ordena e invierte',
    anchos: [1200], spec: ['orden/S-01', 'orden/S-01i', 'orden/S-01j'],
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      await exigirTituloOrden(page, 'goles');
    },
    async comprobar(page) {
      const problemas = [];
      /* El arranque de admin ya escribió sus migraciones: lo que importa es lo que se escribe
         desde el primer toque. */
      await page.evaluate(() => { window.__escrituras_base = window.__escrituras.length; });
      await page.click(TITULO_ORDEN('goles'));
      let r = await page.evaluate(LEER_LISTADO_ORDEN);
      problemas.push(...revisarOrdenNumerico(r.filas, 'goles', 'desc', 'primer toque en Goles (orden/S-01)'));
      if (JSON.stringify(r.conIndicador) !== '["goles"]') problemas.push(`el indicador tendría que estar sólo en Goles y está en ${JSON.stringify(r.conIndicador)} (orden/S-01)`);
      await page.click(TITULO_ORDEN('goles'));
      r = await page.evaluate(LEER_LISTADO_ORDEN);
      problemas.push(...revisarOrdenNumerico(r.filas, 'goles', 'asc', 'segundo toque en Goles (orden/S-01)'));
      if (JSON.stringify(r.conIndicador) !== '["goles"]') problemas.push(`después del segundo toque el indicador está en ${JSON.stringify(r.conIndicador)} (orden/S-01)`);
      /* S-01i: con el filtro de puesto en DEL ordena sólo a los visibles. */
      await page.selectOption('#filters', 'DEL');
      await page.click(TITULO_ORDEN('goles'));
      r = await page.evaluate(LEER_LISTADO_ORDEN);
      if (!r.filas.length) problemas.push('con el filtro DEL no quedó ningún jugador visible: el escenario no prueba nada (orden/S-01i)');
      if (r.filas.some(f => f.sigla !== 'DEL')) problemas.push('con el filtro DEL se ven jugadores de otro puesto (orden/S-01i)');
      problemas.push(...revisarOrdenNumerico(r.filas, 'goles', 'desc', 'Goles con el filtro DEL (orden/S-01i)'));
      /* S-01j: se escribe sólo la preferencia de la cuenta, y lo último escrito es Goles descendente. */
      const e = await page.evaluate(() => ({ escrituras: window.__escrituras.slice(window.__escrituras_base), ultimo: (window.__ultimosDocs || {})['preferenciasOrden/u-test'] }));
      if (e.escrituras.some(k => k !== 'preferenciasOrden/u-test')) problemas.push(`elegir una columna escribió ${JSON.stringify(e.escrituras)}: sólo tendría que escribir la preferencia de la cuenta (orden/S-01j)`);
      if (e.escrituras.includes('playersSortMode')) problemas.push('elegir una columna escribió data/playersSortMode (orden/S-01j)');
      let guardado = null;
      try { guardado = JSON.parse(e.ultimo); } catch (err) { /* queda null */ }
      if (!guardado || guardado.modo !== 'goles_desc') problemas.push(`la preferencia guardada tendría que ser goles_desc y es ${JSON.stringify(e.ultimo)} (orden/S-01j)`);
      return problemas;
    } },

  { clave: 'orden-teclado', rol: 'admin', nombre: 'ordenar con el teclado desde los títulos',
    anchos: [1200], spec: ['orden/S-08', 'orden/S-08b', 'orden/NFR-004'],
    async preparar(page) {
      await irAPestania(page, 'Jugadores');
      await exigirTituloOrden(page, 'pj');
    },
    async comprobar(page) {
      const problemas = [];
      const etiquetas = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.roster-head button.roster-orden')]
        .map(b => [b.dataset.criterio, b.getAttribute('aria-label')])));
      const enFoco = () => page.evaluate(() => (document.activeElement && document.activeElement.dataset.criterio) || null);
      const esperadas = { posicion: 'Posición', jugador: 'Jugador', pj: 'Partidos jugados', goles: 'Goles', asist: 'Asistencias', puntaje: 'Pts' };
      let e = await etiquetas();
      if (JSON.stringify(e) !== JSON.stringify(esperadas)) problemas.push(`en Manual los títulos tendrían que anunciarse ${JSON.stringify(esperadas)} y se anuncian ${JSON.stringify(e)} (orden/NFR-004)`);
      /* S-08: llega con Tab a PJ, desde el título anterior. */
      await page.focus(TITULO_ORDEN('jugador'));
      await page.keyboard.press('Tab');
      if ((await enFoco()) !== 'pj') problemas.push(`Tab desde Jugador tendría que llevar a PJ y llevó a ${await enFoco()} (orden/S-08)`);
      await page.keyboard.press('Enter');
      let r = await page.evaluate(LEER_LISTADO_ORDEN);
      problemas.push(...revisarOrdenNumerico(r.filas, 'pj', 'desc', 'Enter sobre PJ (orden/S-08)'));
      e = await etiquetas();
      if (e.pj !== 'Partidos jugados, de mayor a menor') problemas.push(`después de Enter PJ se anuncia ${JSON.stringify(e.pj)} (orden/S-08)`);
      const otrosConSentido = Object.entries(e).filter(([c, t]) => c !== 'pj' && t.includes(', ')).map(([c]) => c);
      if (otrosConSentido.length) problemas.push(`otros títulos anuncian un sentido: ${otrosConSentido.join(', ')} (orden/S-08)`);
      if ((await enFoco()) !== 'pj') problemas.push(`después de Enter el foco tendría que seguir en PJ y está en ${await enFoco()} (orden/S-08)`);
      const contorno = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      if (contorno === 'none') problemas.push('el título con foco no muestra contorno de foco (orden/NFR-004)');
      await page.keyboard.press('Space');
      r = await page.evaluate(LEER_LISTADO_ORDEN);
      problemas.push(...revisarOrdenNumerico(r.filas, 'pj', 'asc', 'Espacio sobre PJ (orden/S-08)'));
      e = await etiquetas();
      if (e.pj !== 'Partidos jugados, de menor a mayor') problemas.push(`después de Espacio PJ se anuncia ${JSON.stringify(e.pj)} (orden/S-08)`);
      /* S-08b: G E P no es un botón y Tab lo saltea: de PJ va a Goles. */
      await page.keyboard.press('Tab');
      if ((await enFoco()) !== 'goles') problemas.push(`Tab desde PJ tendría que llevar a Goles y llevó a ${await enFoco()} (orden/S-08b)`);
      const gep = await page.evaluate(() => {
        const celda = document.querySelector('.roster-head .roster-head-gep');
        return celda ? { boton: !!celda.querySelector('button'), oculta: celda.getAttribute('aria-hidden') } : null;
      });
      if (!gep) problemas.push('no se encontró la celda de G E P (orden/S-08b)');
      else {
        if (gep.boton) problemas.push('el título de G E P es un botón (orden/S-08b)');
        if (gep.oculta !== 'true') problemas.push('la celda de G E P no lleva aria-hidden="true" (orden/NFR-004)');
      }
      return problemas;
    } },

  /* ---- orden por columnas: menú, persistencia y arrastre ----
     Comportamiento, así que corren en uno o dos anchos. Los que "recargan" abren una segunda página
     con los datos que dejó la primera; los que "entran con otra cuenta" cambian el `uid` del doble. */
  { clave: 'orden-menu', rol: 'jugador', nombre: 'ordenar desde el menú en el celular',
    anchos: [390, 759], spec: ['orden/S-02', 'orden/S-02a'],
    invariante: () => {
      const menu = document.getElementById('ordenModo');
      const head = document.querySelector('.roster-head');
      const problemas = [];
      if (!menu || getComputedStyle(menu).display === 'none') problemas.push('abajo de 760px el menú de orden no se ve (orden/S-02a)');
      if (head && getComputedStyle(head).display !== 'none') problemas.push('abajo de 760px se ven los títulos (orden/S-02a)');
      return problemas;
    },
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      const problemas = [];
      let e = await estadoDelOrden(page);
      if (e.menuTexto !== 'Ordenar por…') problemas.push(`en Manual el menú tendría que decir "Ordenar por…" y dice ${JSON.stringify(e.menuTexto)} (orden/S-02)`);
      const esperadas = ['Posición ↑', 'Posición ↓', 'Jugador ↑', 'Jugador ↓', 'Partidos jugados ↓', 'Partidos jugados ↑',
        'Goles ↓', 'Goles ↑', 'Asistencias ↓', 'Asistencias ↑'];
      if (JSON.stringify(e.menuOpciones) !== JSON.stringify(esperadas)) problemas.push(`las opciones del menú tendrían que ser ${esperadas.join(', ')} y son ${e.menuOpciones.join(', ')} (orden/S-02)`);
      await page.selectOption('#ordenModo', 'asist_desc');
      await page.waitForTimeout(200);
      problemas.push(...revisarOrdenNumerico((await page.evaluate(LEER_LISTADO_ORDEN)).filas, 'asist', 'desc', 'Asistencias ↓ desde el menú (orden/S-02)'));
      e = await estadoDelOrden(page);
      if (e.menuTexto !== 'Asistencias ↓') problemas.push(`después de elegir, el menú muestra ${JSON.stringify(e.menuTexto)} (orden/S-02)`);
      return problemas;
    } },

  { clave: 'orden-cruce', rol: 'admin', nombre: 'el orden se conserva al cruzar los 760px',
    anchos: [390], spec: ['orden/S-02a', 'orden/S-02b', 'orden/S-02c'],
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      const problemas = [];
      const en = async ancho => { await page.setViewportSize({ width: ancho, height: 900 }); await page.waitForTimeout(200); return estadoDelOrden(page); };
      let e = await en(390);
      if (!e.menuOpciones.includes('Pts ↓') || !e.menuOpciones.includes('Pts ↑')) problemas.push(`un admin a 390px tendría que ver Pts en los dos sentidos en el menú, y ve ${e.menuOpciones.join(', ')} (orden/S-02c)`);
      e = await en(759);
      if (!e.menuVisible || e.titulosVisibles) problemas.push(`a 759px tendría que verse el menú y no los títulos (menú ${e.menuVisible}, títulos ${e.titulosVisibles}) (orden/S-02a)`);
      e = await en(760);
      if (e.menuVisible || !e.titulosVisibles) problemas.push(`a 760px tendrían que verse los títulos y no el menú (menú ${e.menuVisible}, títulos ${e.titulosVisibles}) (orden/S-02a)`);
      await en(700);
      await page.selectOption('#ordenModo', 'asist_desc');
      await page.waitForTimeout(200);
      const antes = nombresDe(await page.evaluate(LEER_LISTADO_ORDEN));
      await en(900);
      const r = await page.evaluate(LEER_LISTADO_ORDEN);
      if (JSON.stringify(r.conIndicador) !== '["asist"]') problemas.push(`a 900px el indicador tendría que estar en Asist y está en ${JSON.stringify(r.conIndicador)} (orden/S-02b)`);
      const etiqueta = await page.evaluate(() => document.querySelector('.roster-head .roster-orden[data-criterio="asist"]').getAttribute('aria-label'));
      if (etiqueta !== 'Asistencias, de mayor a menor') problemas.push(`a 900px Asist se anuncia ${JSON.stringify(etiqueta)} (orden/S-02b)`);
      if (JSON.stringify(nombresDe(r)) !== JSON.stringify(antes)) problemas.push('al pasar de 700 a 900px la lista cambió de orden (orden/S-02b)');
      e = await en(700);
      if (e.menuTexto !== 'Asistencias ↓') problemas.push(`de vuelta a 700px el menú muestra ${JSON.stringify(e.menuTexto)} (orden/S-02b)`);
      return problemas;
    } },

  { clave: 'orden-persistencia', rol: 'admin', nombre: 'el orden guardado acompaña a la cuenta y no a las demás',
    anchos: [1200], spec: ['orden/S-03', 'orden/S-03c'],
    transformarDatos(datos) { datos['preferenciasOrden/u-test'] = JSON.stringify({ modo: 'goles_desc', ordenManual: [] }); },
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      const problemas = [];
      const r = await page.evaluate(LEER_LISTADO_ORDEN);
      if (JSON.stringify(r.conIndicador) !== '["goles"]') problemas.push(`con la preferencia en Goles la cuenta tendría que arrancar con el indicador en Goles, y está en ${JSON.stringify(r.conIndicador)} (orden/S-03)`);
      problemas.push(...revisarOrdenNumerico(r.filas, 'goles', 'desc', 'arranque con la preferencia en Goles (orden/S-03)'));
      /* S-03c: otra cuenta, sobre los mismos datos, no tiene preferencia: Manual, en el orden base. */
      const otra = await abrirOtraPagina(page, { rol: 'admin', datos: datosConPreferencia(JSON.stringify({ modo: 'goles_desc', ordenManual: [] })), doble: { uid: 'u-otro' } });
      const r2 = await otra.evaluate(LEER_LISTADO_ORDEN);
      const lecturas = await otra.evaluate(() => window.__lecturas.preferenciasOrden);
      await otra.close();
      if (r2.conIndicador.length) problemas.push(`la otra cuenta tendría que arrancar en Manual y tiene el indicador en ${r2.conIndicador.join(', ')} (orden/S-03c)`);
      if (JSON.stringify(nombresDe(r2)) !== JSON.stringify(nombresEnOrdenBase())) problemas.push('la otra cuenta no ve el orden base (orden/S-03c)');
      if (lecturas !== 1) problemas.push(`la otra cuenta tendría que leer su preferencia una vez y la leyó ${lecturas} (orden/S-03c)`);
      return problemas;
    } },

  { clave: 'orden-jugador', rol: 'jugador', nombre: 'una cuenta jugador ordena y su orden se guarda',
    anchos: [1200], spec: ['orden/S-04', 'orden/S-04a', 'orden/S-04b'],
    async preparar(page) { await irAPestania(page, 'Jugadores'); await exigirTituloOrden(page, 'asist'); },
    async comprobar(page) {
      const problemas = [];
      let e = await estadoDelOrden(page);
      if (e.titulos.includes('puntaje')) problemas.push('la cuenta jugador ve el título Pts (orden/S-04)');
      await page.click(TITULO_ORDEN('asist'));
      e = await estadoDelOrden(page);
      const guardada = leerPreferencia(e.preferencia);
      if (!guardada || guardada.modo !== 'asist_desc') problemas.push(`la cuenta jugador tendría que guardar asist_desc y guardó ${JSON.stringify(e.preferencia)} (orden/S-04)`);
      const recargada = await abrirOtraPagina(page, { rol: 'jugador', datos: datosConPreferencia(e.preferencia) });
      const r = await recargada.evaluate(LEER_LISTADO_ORDEN);
      await recargada.close();
      if (JSON.stringify(r.conIndicador) !== '["asist"]') problemas.push(`al recargar el indicador tendría que estar en Asist y está en ${JSON.stringify(r.conIndicador)} (orden/S-04)`);
      problemas.push(...revisarOrdenNumerico(r.filas, 'asist', 'desc', 'al recargar (orden/S-04)'));
      /* S-04a y S-04b: lo guardado no se puede usar → Manual, sin aviso, sin errores y sin reescribir. */
      const casos = [
        ['orden/S-04a', JSON.stringify({ modo: 'puntaje_desc', ordenManual: [] })],
        ['orden/S-04b', JSON.stringify({ modo: 'goles_arriba', ordenManual: [] })],
        ['orden/S-04b', JSON.stringify({ modo: 'tarjetas_desc', ordenManual: [] })],
        ['orden/S-04b', 'esto no es JSON'],
      ];
      for (const [id, valor] of casos) {
        const otra = await abrirOtraPagina(page, { rol: 'jugador', datos: datosConPreferencia(valor) });
        const errores = [];
        otra.on('pageerror', err => errores.push(err.message));
        const r2 = await otra.evaluate(LEER_LISTADO_ORDEN);
        const e2 = await estadoDelOrden(otra);
        await otra.close();
        if (r2.conIndicador.length) problemas.push(`con ${valor} la cuenta tendría que ver Manual y tiene el indicador en ${r2.conIndicador.join(', ')} (${id})`);
        if (JSON.stringify(nombresDe(r2)) !== JSON.stringify(nombresEnOrdenBase())) problemas.push(`con ${valor} la cuenta no ve el orden base (${id})`);
        if (e2.aviso) problemas.push(`con ${valor} apareció el aviso ${JSON.stringify(e2.aviso)} (${id})`);
        if (errores.length) problemas.push(`con ${valor} hubo un error de página: ${errores[0]} (${id})`);
        if (e2.escrituras.length) problemas.push(`con ${valor} el arranque escribió ${JSON.stringify(e2.escrituras)} (${id})`);
      }
      return problemas;
    } },

  { clave: 'orden-arrastre', rol: 'admin', nombre: 'arrastrar con un orden por columna arma el orden manual',
    anchos: [390, 1200], spec: ['orden/S-05', 'orden/S-05d', 'orden/S-05f', 'orden/S-05h'],
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      const problemas = [];
      /* A 390 (renglón apilado): Goles desde el menú, y el cuarto sobre el segundo. */
      await page.evaluate(() => { window.__escrituras_base = window.__escrituras.length; });
      await page.selectOption('#ordenModo', 'goles_desc');
      await page.waitForTimeout(200);
      const porGoles = nombresDe(await page.evaluate(LEER_LISTADO_ORDEN));
      const esperado = trasSoltar(porGoles, porGoles[3], porGoles[1]);
      await arrastrarFila(page, porGoles[3], porGoles[1]);
      const a390 = nombresDe(await page.evaluate(LEER_LISTADO_ORDEN));
      if (JSON.stringify(a390) !== JSON.stringify(esperado)) problemas.push(`a 390px, soltar a ${porGoles[3]} sobre ${porGoles[1]} dejó ${a390.slice(0, 5).join(', ')}… y tendría que dejar ${esperado.slice(0, 5).join(', ')}… (orden/S-05h)`);
      let e = await estadoDelOrden(page);
      if (e.menuTexto !== 'Ordenar por…') problemas.push(`después de arrastrar el menú tendría que decir "Ordenar por…" y dice ${JSON.stringify(e.menuTexto)} (orden/S-05)`);
      const guardada = leerPreferencia(e.preferencia);
      if (!guardada || guardada.modo !== 'manual') problemas.push(`el arrastre tendría que guardar modo manual y guardó ${JSON.stringify(e.preferencia)} (orden/S-05)`);
      else if (guardada.ordenManual.length !== porGoles.length) problemas.push(`el orden manual guardado tiene ${guardada.ordenManual.length} jugadores y el plantel ${porGoles.length} (orden/S-05)`);
      /* Al recargar, la misma lista, en Manual, sin indicador. */
      const recargada = await abrirOtraPagina(page, { rol: 'admin', datos: datosConPreferencia(e.preferencia) });
      const r = await recargada.evaluate(LEER_LISTADO_ORDEN);
      if (r.conIndicador.length) problemas.push(`al recargar ningún título tendría que tener indicador y lo tiene ${r.conIndicador.join(', ')} (orden/S-05)`);
      if (JSON.stringify(nombresDe(r)) !== JSON.stringify(esperado)) problemas.push('al recargar la lista no es la que dejó el arrastre (orden/S-05)');
      /* S-05d: tocar PJ ordena por PJ y conserva el orden manual guardado. */
      await recargada.click(TITULO_ORDEN('pj'));
      problemas.push(...revisarOrdenNumerico((await recargada.evaluate(LEER_LISTADO_ORDEN)).filas, 'pj', 'desc', 'PJ después del arrastre (orden/S-05d)'));
      const trasPJ = leerPreferencia(await recargada.evaluate(() => window.__ultimosDocs['preferenciasOrden/u-test']));
      if (!trasPJ || trasPJ.modo !== 'pj_desc' || JSON.stringify(trasPJ.ordenManual) !== JSON.stringify(guardada && guardada.ordenManual)) problemas.push('tocar PJ cambió el orden manual guardado (orden/S-05d)');
      /* S-05f: un id que ya no está no cambia nada ni escribe. */
      const f = await recargada.evaluate(async () => {
        const antes = window.__escrituras.length;
        const fila = document.querySelector('.roster .row[ondrop]');
        const destino = fila.getAttribute('ondrop').match(/'([^']+)'/)[1];
        const nombres = () => [...document.querySelectorAll('.roster .row-name')].map(n => n.textContent.trim());
        const previo = nombres();
        await window.__dropOnRosterRow({ preventDefault() {}, dataTransfer: { getData: () => 'jugador-que-no-existe' } }, destino);
        return { escribio: window.__escrituras.length !== antes, igual: JSON.stringify(previo) === JSON.stringify(nombres()) };
      });
      await recargada.close();
      if (f.escribio || !f.igual) problemas.push(`soltar un id que no está cambió la lista (${!f.igual}) o escribió (${f.escribio}) (orden/S-05f)`);
      /* S-05h: el mismo arrastre a 1200px da el mismo resultado que a 390px. */
      const ancha = await abrirOtraPagina(page, { rol: 'admin', datos: docsDesde() });
      await ancha.click(TITULO_ORDEN('goles'));
      await arrastrarFila(ancha, porGoles[3], porGoles[1]);
      const a1200 = nombresDe(await ancha.evaluate(LEER_LISTADO_ORDEN));
      await ancha.close();
      if (JSON.stringify(a1200) !== JSON.stringify(a390)) problemas.push('el mismo arrastre a 1200px dio otro resultado que a 390px (orden/S-05h)');
      return problemas;
    } },

  { clave: 'orden-arrastre-jugador', rol: 'jugador', nombre: 'una cuenta jugador arrastra sin tocar el plantel',
    anchos: [1200], spec: ['orden/S-06'],
    async preparar(page) { await irAPestania(page, 'Jugadores'); },
    async comprobar(page) {
      const problemas = [];
      await page.evaluate(() => { window.__escrituras_base = window.__escrituras.length; });
      const base = nombresDe(await page.evaluate(LEER_LISTADO_ORDEN));
      await arrastrarFila(page, base[2], base[0]);
      const despues = nombresDe(await page.evaluate(LEER_LISTADO_ORDEN));
      if (despues[0] !== base[2]) problemas.push(`el jugador arrastrado tendría que quedar primero y quedó ${despues[0]} (orden/S-06)`);
      const e = await estadoDelOrden(page);
      if (!e.escrituras.length) problemas.push('el arrastre del jugador no guardó nada (orden/S-06)');
      if (e.escrituras.some(k => k !== 'preferenciasOrden/u-test')) problemas.push(`el arrastre del jugador escribió ${JSON.stringify(e.escrituras)}: sólo puede escribir su preferencia, nunca players (orden/S-06)`);
      const recargada = await abrirOtraPagina(page, { rol: 'jugador', datos: datosConPreferencia(e.preferencia) });
      const r = nombresDe(await recargada.evaluate(LEER_LISTADO_ORDEN));
      await recargada.close();
      if (r[0] !== base[2]) problemas.push('al recargar el jugador arrastrado ya no está primero (orden/S-06)');
      const admin = await abrirOtraPagina(page, { rol: 'admin', datos: datosConPreferencia(e.preferencia), doble: { uid: 'u-admin' } });
      const ra = nombresDe(await admin.evaluate(LEER_LISTADO_ORDEN));
      await admin.close();
      if (JSON.stringify(ra) !== JSON.stringify(base)) problemas.push('el admin, al recargar, no ve el orden base: lo cambió el arrastre del jugador (orden/S-06)');
      return problemas;
    } },

  { clave: 'orden-guardado-falla', rol: 'admin', nombre: 'el orden con el guardado fallando',
    anchos: [1200], spec: ['orden/S-01g', 'orden/S-05e'],
    doble: { escrituraFalla: true },
    async preparar(page) { await irAPestania(page, 'Jugadores'); await exigirTituloOrden(page, 'goles'); },
    async comprobar(page) {
      const problemas = [];
      const errores = [];
      page.on('pageerror', err => errores.push(err.message));
      await page.click(TITULO_ORDEN('goles'));
      await page.waitForTimeout(300);
      let r = await page.evaluate(LEER_LISTADO_ORDEN);
      let e = await estadoDelOrden(page);
      if (e.aviso) problemas.push(`un cambio de columna que no se guardó no tendría que avisar, y avisó ${JSON.stringify(e.aviso)} (orden/S-01g)`);
      if (JSON.stringify(r.conIndicador) !== '["goles"]') problemas.push('con el guardado fallando, la lista tendría que quedar por Goles (orden/S-01g)');
      problemas.push(...revisarOrdenNumerico(r.filas, 'goles', 'desc', 'Goles con el guardado fallando (orden/S-01g)'));
      const porGoles = nombresDe(r);
      await arrastrarFila(page, porGoles[3], porGoles[1]);
      r = await page.evaluate(LEER_LISTADO_ORDEN);
      e = await estadoDelOrden(page);
      if (e.aviso !== 'No se pudo guardar el nuevo orden. Intentá de nuevo.') problemas.push(`un arrastre que no se guardó tendría que avisar, y el aviso es ${JSON.stringify(e.aviso)} (orden/S-05e)`);
      if (JSON.stringify(nombresDe(r)) !== JSON.stringify(porGoles)) problemas.push('después del arrastre fallido la lista no volvió a Goles (orden/S-05e)');
      if (JSON.stringify(r.conIndicador) !== '["goles"]') problemas.push(`después del arrastre fallido el indicador tendría que volver a Goles y está en ${JSON.stringify(r.conIndicador)} (orden/S-05e)`);
      if (errores.length) problemas.push(`el guardado fallido dejó una excepción sin capturar: ${errores[0]}`);
      return problemas;
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

/* Por debajo del breakpoint del switch mobile (NAVEGACION_PARTIDOS_SPEC.md FR-009), la
   columna de equipos arranca oculta salvo que la inscripción esté cerrada (FR-010/FR-011).
   La mayoría de los escenarios de cancha/candado/arrastre, escritos antes de esta feature,
   necesitan verla siempre — sólo los escenarios que prueban el switch en sí mismo (S-06,
   S-06a en `partido-abierto`/`partido-cerrado`) deben llamar a `abrirPartido` sin esto. */
async function mostrarEquiposMobile(page) {
  await page.evaluate(() => { const b = document.getElementById('mobTabEquiposBtn'); if (b) b.click(); });
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
      /* `doble` deja a un escenario configurar el resto del doble de Firebase además del rol:
         es lo que permite escribir el corte de la feature rol-en-el-token (un token sin claim,
         un refresco que demora o que falla) como escenarios y no como prosa. */
      /* `fixture` deja a un escenario pedir los datos de otra forma: los de desglose-posiciones
         piden el plantel SIN reclasificar para tener jugadores "a revisar" (fixtures-app.js). */
      /* `transformarDatos` deja a un escenario sembrar un dato que el fixture no trae (un valor
         guardado que no es un puesto, en `puestos-valor-desconocido`). */
      const datos = docsDesde(undefined, caso.fixture);
      if (caso.transformarDatos) caso.transformarDatos(datos);
      await page.addInitScript(fakeFirebase, Object.assign({ datos, rol: caso.rol }, caso.doble || {}));
      /* Registrador del PRIMER PINTADO. Se instala antes de que corra la aplicación y muestrea en
         cada frame qué solapas están visibles y si `#appRoot` ya se reveló. Es la única forma de
         verificar FR-002 —que la barra tenga su composición final en su primer pintado— porque
         mirar el DOM al final del test no distingue "siempre estuvo bien" de "se corrigió sola
         200 ms después", que es exactamente la regresión que la feature elimina. */
      await page.addInitScript(() => {
        window.__pintados = [];
        const muestrear = () => {
          const app = document.getElementById('appRoot');
          if (app) {
            window.__pintados.push({
              t: Math.round(performance.now()),
              appVisible: app.style.display !== 'none' && app.offsetParent !== null,
              solapas: [...document.querySelectorAll('.tabs .tab-btn')]
                .filter(b => b.offsetParent !== null).map(b => b.dataset.tab),
            });
          }
          if (window.__pintados.length < 600) requestAnimationFrame(muestrear);
        };
        requestAnimationFrame(muestrear);
      });
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
