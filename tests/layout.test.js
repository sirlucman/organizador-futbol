/* Test de layout responsive — Principio V de la constitución.
 *
 * Verifica lo que el Principio V exige y que ningún test puede verificar leyendo
 * código: que la interfaz no produzca scroll horizontal en ningún ancho desde el
 * ancho mínimo soportado (360px) hacia arriba.
 *
 * Mide el MARKUP REAL con el CSS REAL. Las dos cosas se recortan de index.html
 * por nombre vía tests/harness.js (`cargarVistas`, `cargarCSS`), igual que los
 * tests del motor: no hay una copia del HTML ni un snapshot del CSS que se
 * pueda desincronizar. Lo único que el test escribe a mano son los DATOS del
 * escenario (el partido, el plantel) y la cadena de contenedores que envuelve a
 * cada bloque, que es la parte de index.html que es markup estático.
 *
 * Este es el único test del repo con una dependencia externa, y no se puede
 * evitar: calcular un layout de CSS grid/flex requiere un motor de render. Si
 * Playwright no está instalado el test avisa y NO falla (código 0), para no
 * romper `node tests/motor.test.js`, que sigue siendo cero-dependencias.
 * Con LAYOUT_STRICT=1 la ausencia de Playwright sí falla — es lo que conviene
 * en CI, donde un test que nunca corre es peor que uno que falla.
 *
 *   node tests/layout.test.js
 *   LAYOUT_STRICT=1 node tests/layout.test.js
 */
const { cargarVistas, cargarCSS } = require('./harness.js');

/* Ancho mínimo soportado: lo declara el Principio V de la constitución.
   Se mide de acá hacia arriba, sin techo. Por debajo la interfaz puede
   degradarse. Si el piso del proyecto cambia, se cambia acá y en el principio. */
const ANCHO_MINIMO = 360;

/* Anchos a medir. No son "los dispositivos populares" sino los bordes donde el
   layout cambia de forma: el piso, los breakpoints declarados en el CSS (480,
   560, 700) y sus dos lados, y la franja de tablet, que es donde el desborde
   fue peor y donde es más fácil no mirar. */
const ANCHOS = [360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200];

/* ---------------------------------------------------------------- escenarios */

const JUGADORES = [
  { id: 'p1', nombre: 'Esteban', apellido: 'Souto',   principal: 'Arquero',   scores: { Arquero: 9, Defensor: 5, Volante: 4, Delantero: 3 } },
  { id: 'p2', nombre: 'Nicolás', apellido: 'Vallejos', principal: 'Defensor',  scores: { Arquero: 3, Defensor: 8, Volante: 6, Delantero: 4 } },
  { id: 'p3', nombre: 'Maximiliano', apellido: 'Etchegaray', principal: 'Volante', scores: { Arquero: 2, Defensor: 6, Volante: 9, Delantero: 7 } },
  { id: 'p4', nombre: 'Bartolomé', apellido: 'Villanueva', principal: 'Delantero', scores: { Arquero: 1, Defensor: 4, Volante: 6, Delantero: 8 } },
];

/* El nombre más largo del plantel es deliberado: es lo que empuja el ancho
   mínimo de la fila, así que un test con nombres cortos no prueba nada. */
const PARTIDO_BASE = {
  id: 'm1', fecha: '2026-08-27', cancha: 11, estado: 'Abierto',
  convocados: JUGADORES.map(p => ({ id: p.id, rol: 'titular' })),
  bloqueados: ['p2'],
  equipos: {
    blanco: ['p1', 'p2'], negro: ['p3', 'p4'],
    sumaBlanco: 17, sumaNegro: 17,
    posicionAsignada: { p1: 'Arquero', p2: 'Defensor', p3: 'Volante', p4: 'Delantero' },
  },
};

function partido(cambios) { return { ...PARTIDO_BASE, ...cambios }; }

/* Cadena de contenedores que envuelve al panel de equipos en index.html
   (.wrap > .tab-panel > div > .teams-section > .teams-wrap > .team-panel). */
function envolverEquipos(filasHtml, clase = 'blanco') {
  return `<div class="wrap"><div class="tab-panel active"><div>
    <div class="teams-section">
      <h3>Equipos generados</h3>
      <div class="teams-wrap">
        <div class="team-panel ${clase}">
          <h4>Equipo Blanco <span class="team-total">17.0 pts</span></h4>
          ${filasHtml}
        </div>
        <div class="team-panel negro">
          <h4>Equipo Negro <span class="team-total">17.0 pts</span></h4>
          ${filasHtml}
        </div>
      </div>
    </div>
  </div></div></div>`;
}

/* Cadena de contenedores de una regla en Configuración
   (.wrap > .tab-panel > .rules-list > .rule-card > .rule-extra). */
function envolverRegla(paramsHtml, label) {
  return `<div class="wrap"><div class="tab-panel active"><div class="rules-list">
    <div class="rule-card">
      <div class="rule-top">
        <div class="rule-order"><button>▲</button><button>▼</button></div>
        <div class="rule-main">
          <div class="rule-name">${label}</div>
          <div class="rule-desc">Busca que los dos equipos sumen un puntaje lo más parecido posible.</div>
        </div>
        <div class="rule-switch-wrap"><button class="switch on"></button><span class="rule-switch-label">Activado</span></div>
      </div>
      <div class="rule-extra">${paramsHtml}</div>
    </div>
  </div></div></div>`;
}

/* Cada escenario devuelve el HTML de un fragmento de la aplicación, armado con
   las funciones de render reales. El nombre describe qué pantalla es, porque es
   lo que se imprime cuando falla. */
function escenarios() {
  const casos = [];

  /* Panel de equipos, modo "cargar resultado": la fila más cargada que existe
     — badge + nombre + puntaje + 3 inputs numéricos + 3 etiquetas. Es la que
     estiraba la página a 442px de ancho fijo antes del fix de .teams-wrap. */
  {
    const v = cargarVistas({}, { estado: { rol: 'admin', players: JUGADORES, resultadoDraft: { matchId: 'm1', stats: { p1: { goles: 2, golesPenal: 1, asistencias: 1 } } } } });
    const m = partido({ inscripcionCerrada: true });
    const filas = JUGADORES.map(p => v.renderTeamPlayerRow(p, m)).join('');
    casos.push({ nombre: 'panel de equipos · cargar resultado (admin)', html: envolverEquipos(filas) });
  }

  /* Mismo panel con la inscripción abierta: sin inputs, pero con el candado de
     bloqueo y los atributos de drag. */
  {
    const v = cargarVistas({}, { estado: { rol: 'admin', players: JUGADORES } });
    const m = partido({});
    const filas = JUGADORES.map(p => v.renderTeamPlayerRow(p, m)).join('');
    casos.push({ nombre: 'panel de equipos · inscripción abierta (admin)', html: envolverEquipos(filas) });
  }

  /* Partido finalizado: los stats pasan a .team-stat-readonly, que lleva
     white-space:nowrap — el candidato natural a desbordar. */
  {
    const v = cargarVistas({}, { estado: { rol: 'admin', players: JUGADORES } });
    const m = partido({ estado: 'Finalizado', resultado: { statsPorJugador: { p1: { goles: 3, golesPenal: 1, asistencias: 2 }, p2: { goles: 0, golesPenal: 0, asistencias: 1 } } } });
    const filas = JUGADORES.map(p => v.renderTeamPlayerRow(p, m)).join('');
    casos.push({ nombre: 'panel de equipos · partido finalizado', html: envolverEquipos(filas) });
  }

  /* Fila de dupla de rotación: dos integrantes apilados en un mismo renglón
     (012 FR-007 exige que siga siendo operable al ancho mínimo). */
  {
    const v = cargarVistas({}, { estado: { rol: 'admin', players: JUGADORES, resultadoDraft: { matchId: 'm1', stats: {} } } });
    const m = partido({ inscripcionCerrada: true });
    const fila = v.renderTeamPlayerRowDupla(JUGADORES[1], JUGADORES[2], m);
    casos.push({ nombre: 'panel de equipos · fila de dupla, cargar resultado', html: envolverEquipos(fila) });
  }

  /* Fila de parámetro numérico de una regla: es lo que exige 009 FR-014. La
     etiqueta "Ventaja para el equipo sin arquero fijo" es la más larga del
     catálogo, así que es el peor caso de esta vista. */
  {
    const v = cargarVistas({}, { estado: { rol: 'admin' } });
    const meta = v.REGLAS_CATALOGO.puntaje;
    const params = v.renderRuleParams({ key: 'puntaje', enabled: true, params: { diferenciaMaxima: 2, ventajaSinArquero: 6 } }, meta);
    casos.push({ nombre: 'configuración · parámetros de "Emparejar el puntaje" (009 FR-014)', html: envolverRegla(params, meta.label) });
  }

  return casos;
}

/* ------------------------------------------------------------------- medición */

function paginaHtml(css, cuerpo) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style></head><body>${cuerpo}</body></html>`;
}

/* Dos comprobaciones distintas, y hacen falta las dos:
   - `desborde` es el síntoma que ve el usuario: la página scrollea de costado.
   - `salidos` atrapa un elemento que se sale de su contenedor sin producir
     scroll, porque algo más arriba lo recorta. Eso no scrollea pero igual
     esconde un control, que es el bug de .match-card-top. */
const MEDIR = () => {
  const de = document.documentElement;
  const limite = de.clientWidth;
  const salidos = [];
  document.querySelectorAll('body *').forEach(el => {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.right > limite + 0.5) {
      const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase();
      salidos.push({ sel: cls, right: Math.round(b.right) });
    }
  });
  /* Se reporta el más externo de cada rama: si una fila se sale, sus hijos
     también, y listarlos todos entierra el dato útil. */
  const unicos = [];
  salidos.forEach(s => { if (!unicos.some(u => u.sel === s.sel)) unicos.push(s); });
  return { desborde: de.scrollWidth - de.clientWidth, limite, salidos: unicos.slice(0, 6) };
};

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (e) {
    const msg = 'playwright no está instalado. Para correr el test de layout:\n' +
                '    npx playwright install chromium && npm i playwright\n' +
                'Calcular un layout de CSS grid/flex necesita un motor de render: no hay forma de\n' +
                'verificar el Principio V sin uno.';
    if (process.env.LAYOUT_STRICT) { console.error('FALLA: ' + msg); process.exit(1); }
    console.log('SALTEADO — ' + msg);
    console.log('\n(exit 0: la ausencia del navegador no es una regresión. LAYOUT_STRICT=1 la convierte en falla.)');
    process.exit(0);
  }

  const css = cargarCSS();
  const casos = escenarios();
  console.log(`Layout responsive — Principio V · ancho mínimo soportado ${ANCHO_MINIMO}px`);
  console.log(`${casos.length} escenarios × ${ANCHOS.length} anchos (${ANCHOS[0]}–${ANCHOS[ANCHOS.length - 1]}px)\n`);

  const browser = await chromium.launch();
  const fallas = [];

  for (const caso of casos) {
    const linea = [];
    for (const w of ANCHOS) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.setContent(paginaHtml(css, caso.html), { waitUntil: 'load' });
      const r = await page.evaluate(MEDIR);
      await page.close();
      const mal = r.desborde > 0 || r.salidos.length > 0;
      linea.push(mal ? `${w}✗` : `${w}·`);
      if (mal) fallas.push({ caso: caso.nombre, ancho: w, ...r });
    }
    const ok = !fallas.some(f => f.caso === caso.nombre);
    console.log(`  ${ok ? '✓' : '✗'} ${caso.nombre}`);
    if (!ok) console.log(`      ${linea.join(' ')}`);
  }

  await browser.close();

  if (fallas.length === 0) {
    console.log(`\n✓ sin scroll horizontal ni elementos fuera de su contenedor en ningún ancho ≥ ${ANCHO_MINIMO}px`);
    process.exit(0);
  }

  console.log(`\n✗ ${fallas.length} medicion(es) fuera de norma:\n`);
  for (const f of fallas) {
    console.log(`  ${f.caso} @ ${f.limite}px`);
    if (f.desborde > 0) console.log(`      scroll horizontal: +${f.desborde}px`);
    for (const s of f.salidos) console.log(`      se sale del viewport: ${s.sel} (borde derecho en ${s.right}px)`);
  }
  console.log('\nPrincipio V: la interfaz debe funcionar en cualquier ancho desde ' + ANCHO_MINIMO + 'px hacia arriba.');
  process.exit(1);
}

main().catch(e => { console.error('El test de layout se cayó:', e); process.exit(1); });
