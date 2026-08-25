/* Planteles de prueba para el motor.
 *
 * `PARTIDO_TESTIGO` son los datos reales del partido que motivó las features 009/010/011,
 * leídos de la base de staging (ver .specify/specs/011-encaje-optimo-formacion/spec.md →
 * "Caso testigo"). El motor actual sobre este plantel reproduce exactamente el armado que
 * se vio en la aplicación: Blanco 51.8 / Negro 51.3.
 *
 * Detalle relevante del plantel: hay UN solo candidato a arquero y entra por posición
 * secundaria (Nilo, que es defensor con Arquero como secundaria), así que un equipo
 * queda sin arquero fijo. Y las dos duplas cubren Defensor y Volante entre sus
 * integrantes, pero ninguna cubre Delantero.
 */

const P = (id, nombre, principal, secundarias, scores) => ({ id, nombre, apellido: '', principal, secundarias, scores });

const PARTIDO_TESTIGO = {
  cancha: 'futbol8',                                        // formación 3-3-1
  formacion: { defensores: 3, volantes: 3, delanteros: 1 },
  individuales: [
    P('nilo',      'Nilo',                   'Defensor',  ['Arquero'],   { Arquero: 6, Defensor: 6 }),
    P('anibal',    'Anibal Leal',            'Defensor',  [],            { Defensor: 7 }),
    P('lucas',     'Lucas Manoukian',        'Defensor',  ['Volante'],   { Defensor: 8, Volante: 8 }),
    P('gonzalo',   'Gonzalo Zanotto',        'Defensor',  [],            { Defensor: 5 }),
    P('joaquinb',  'Joaquín Benítez',        'Volante',   ['Defensor'],  { Defensor: 7, Volante: 7 }),
    P('leandrob',  'Leandro Benítez',        'Volante',   ['Delantero'], { Volante: 7, Delantero: 6 }),
    P('fabian',    'Fabian',                 'Volante',   [],            { Volante: 6 }),
    P('alfredo',   'Alfredo',                'Defensor',  [],            { Defensor: 5 }),
    P('gabriel',   'Gabriel Devoto',         'Defensor',  ['Volante'],   { Defensor: 7, Volante: 7 }),
    P('agustinb',  'Agustín Benítez',        'Defensor',  [],            { Defensor: 6 }),
    P('joaquinl',  'Joaquín Leal',           'Defensor',  [],            { Defensor: 5 }),
    P('benjamin',  'Benjamín',               'Volante',   [],            { Volante: 7 }),
    P('lauty',     'Leandro "cuñado" Lauty', 'Volante',   [],            { Volante: 7 }),
    P('esteban',   'Esteban Souto',          'Delantero', [],            { Delantero: 8 }),
  ],
  duplas: [
    // Claudio (defensor, secundaria volante) + Juan, su hijo (volante). Valor combinado: 5.8
    [P('claudio', 'Claudio', 'Defensor', ['Volante'], { Defensor: 6, Volante: 5 }),
     P('juan',    'Juan (Hijo de Claudio)', 'Volante', [], { Volante: 6 })],
    // Walther (defensor, secundaria volante) + Lautaro (volante). Valor combinado: 6.3
    [P('walther', 'Walther Leal', 'Defensor', ['Volante'], { Defensor: 6, Volante: 5 }),
     P('lautaro', 'Lautaro Leal', 'Volante', [], { Volante: 7 })],
  ],
};

/* Partido del 2026-08-24, el que motivó la Estrategia 4. La Estrategia 3 lo cerró con la
   diferencia total en 0.3 y estas líneas: arco +3 y ataque +4 para Blanco, defensa -6.5 para
   Blanco. Los dos equipos sumaban lo mismo y no se parecían en nada: Blanco tenía el mejor
   arquero y el mejor delantero, y esos 7 puntos de ventaja se los pagó con la defensa entera.

   Detalles del plantel que hacen al caso: hay dos líneas de UN solo lugar por equipo (arco y
   ataque, formación 3-3-1) con una diferencia grande entre sus dos ocupantes — 9 contra 6 en el
   arco y 8 contra 4 en el ataque — y ninguna de las dos se puede emparejar repartiendo. Lo único
   que se puede elegir es si se suman o se cancelan.

   Los puntajes son los que se vieron en el panel de la aplicación. Los de las posiciones que
   nadie jugó no están en la captura, así que solo se cargan los que hacían falta para reproducir
   el armado (es lo que el motor mira: cada unidad vale su nota en el puesto que le tocó). */
const PARTIDO_LINEAS_DESPAREJAS = {
  cancha: 'futbol8',
  formacion: { defensores: 3, volantes: 3, delanteros: 1 },
  individuales: [
    P('vallejos', 'Nicolás Vallejos',     'Arquero',   [],           { Arquero: 9 }),
    P('alfredo',  'Alfredo',              'Defensor',  [],           { Defensor: 5.5 }),
    P('joaquinl', 'Joaquín Leal',         'Defensor',  [],           { Defensor: 5 }),
    P('agustinb', 'Agustín Benítez',      'Defensor',  [],           { Defensor: 5 }),
    P('benjamin', 'Benjamín',             'Volante',   [],           { Volante: 7.5 }),
    P('leandrob', 'Leandro Benítez',      'Volante',   [],           { Volante: 7 }),
    P('esteban',  'Esteban Souto',        'Delantero', [],           { Delantero: 8 }),
    P('nilo',     'Nilo',                 'Defensor',  ['Arquero'],  { Arquero: 6, Defensor: 6 }),
    P('lucas',    'Lucas Manoukian',      'Defensor',  [],           { Defensor: 8 }),
    P('anibal',   'Anibal Leal',          'Defensor',  [],           { Defensor: 7 }),
    P('joaquinb', 'Joaquín Benítez',      'Volante',   ['Defensor'], { Defensor: 7, Volante: 7 }),
    P('salto',    'Joaquín Saltolastra',  'Volante',   [],           { Volante: 8 }),
    P('exequiel', 'Exequiel Geraldo',     'Volante',   [],           { Volante: 7 }),
    P('fabian',   'Fabian',               'Volante',   [],           { Volante: 6 }),
    P('chipi',    'Chipi',                'Delantero', [],           { Delantero: 4 }),
  ],
  duplas: [
    [P('walther', 'Walther Leal', 'Defensor', ['Volante'], { Defensor: 6, Volante: 5.5 }),
     P('lautaro', 'Lautaro Leal', 'Volante',  [],          { Volante: 7 })],
  ],
};

/* Plantel sintético que expone el desempate de encaje de la Estrategia 4.
 *
 * El motor decide en dos pasos: primero QUIÉN JUEGA DE QUÉ (encaje) y después CÓMO SE REPARTEN
 * entre los dos equipos. El segundo paso enumera todos los repartos posibles y es óptimo, pero
 * solo dentro del escenario de posiciones que le entregó el primero — y el primero elige uno
 * cualquiera entre todos los que empatan en encaje. Cuando el escenario descartado era el que
 * habilitaba el mejor balance por línea, el motor no lo ve.
 *
 * Lo que hace a este plantel un caso testigo: 8 titulares tienen Defensor como principal para 6
 * lugares y 6 tienen Volante para 6, así que hay que correr gente a su secundaria y CUÁLES se
 * corren empata en encaje de 12 formas distintas. Entre esas 12, el ataque (un solo lugar por
 * equipo) puede quedar desparejo por 4.5 o por 0.5 según a quién le toque, y esa diferencia el
 * paso de reparto no la puede arreglar porque llega cuando el escenario ya está elegido.
 *
 * Armado del motor: ataque -4.5, suma de cuadrados de las líneas de campo 21.5, total -0.5.
 * Mejor armado del espacio conjunto, con el MISMO encaje: ninguna línea desparejo por más de 1,
 * suma de cuadrados 1.5, total +0.5 (dentro del margen de 1).
 *
 * Los puntajes son sintéticos y no un partido real: los planteles reales de `PARTIDO_TESTIGO` y
 * `PARTIDO_LINEAS_DESPAREJAS` tienen tan pocas posiciones secundarias cargadas que sus clases de
 * empate son de 1 y 2 escenarios, y el motor acierta en ellos.
 *
 * Se regenera exacto con:  node tools/medir-motor.js volcar 4 --cancha=8 --mezcla=0.85
 */
const PARTIDO_EMPATE_ENCAJE = {
  cancha: 'futbol8',
  formacion: { defensores: 3, volantes: 3, delanteros: 1 },
  individuales: [
    P('arq0', 'Arquero 0', 'Arquero', [], { Arquero: 4.5 }),
    P('arq1', 'Arquero 1', 'Arquero', [], { Arquero: 7 }),
    P('j0', 'Jugador 0', 'Volante', ['Defensor'], { Volante: 6.5, Defensor: 3.5 }),
    P('j1', 'Jugador 1', 'Defensor', ['Delantero'], { Defensor: 6.5, Delantero: 6 }),
    P('j2', 'Jugador 2', 'Volante', ['Delantero'], { Volante: 5.5, Delantero: 5 }),
    P('j3', 'Jugador 3', 'Defensor', ['Volante'], { Defensor: 4.5, Volante: 8 }),
    P('j4', 'Jugador 4', 'Defensor', ['Volante'], { Defensor: 3, Volante: 5.5 }),
    P('j5', 'Jugador 5', 'Volante', ['Delantero'], { Volante: 7, Delantero: 7 }),
    P('j6', 'Jugador 6', 'Defensor', ['Delantero'], { Defensor: 5, Delantero: 3 }),
    P('j7', 'Jugador 7', 'Volante', ['Defensor'], { Volante: 4, Defensor: 7 }),
    P('j8', 'Jugador 8', 'Volante', ['Defensor'], { Volante: 4, Defensor: 7 }),
    P('j9', 'Jugador 9', 'Defensor', ['Delantero'], { Defensor: 8.5, Delantero: 6.5 }),
    P('j10', 'Jugador 10', 'Defensor', ['Volante'], { Defensor: 4.5, Volante: 4.5 }),
    P('j11', 'Jugador 11', 'Volante', ['Defensor'], { Volante: 7.5, Defensor: 3.5 }),
    P('j12', 'Jugador 12', 'Defensor', ['Delantero'], { Defensor: 8.5, Delantero: 4 }),
    P('j13', 'Jugador 13', 'Volante', ['Delantero'], { Volante: 6, Delantero: 8.5 }),
  ],
  duplas: [],
};

/* Plantel sintético de CANCHA DE 9 (formación 3-4-1, 18 unidades) con empates de encaje.
 *
 * Los otros planteles son todos de cancha de 8, así que la formación 3-4-1 no estaba cubierta por
 * ningún test del motor. No es un tamaño más: el mediocampo pasa de 3 a 4 lugares por equipo, y con
 * eso la enumeración del reparto crece de 800 combinaciones a 2.800 (C(6,3)·C(8,4)·C(2,1)).
 *
 * Es además un test de regresión real del desempate de encaje (FR-028), no solo de cobertura: se lo
 * eligió comprobando que el motor ANTERIOR al arreglo no llegaba al óptimo en este plantel.
 *
 *   Motor anterior: Defensa +1.5, Medio +1, Ataque -5  → suma de cuadrados 28.25
 *   Motor actual:   Defensa  0,   Medio  0, Ataque -0.5 → suma de cuadrados 0.25 (el óptimo)
 *
 * Los dos respetan el margen de 1 punto en el total. La diferencia entera está en el ataque, que
 * tiene un solo lugar por equipo: con 10 escenarios de posiciones empatados en encaje, cuál se
 * elija decide quién juega ahí, y el motor anterior se quedaba con el primero que encontraba.
 *
 * Puntajes sintéticos. Se regenera exacto con:
 *   node tools/medir-motor.js volcar 147 --cancha=9 --mezcla=0.6
 * Se lo encontró comparando contra el motor previo al arreglo:
 *   node tools/medir-motor.js comparar <commit> --cancha=9 --n=200 --mezcla=0.6
 */
const PARTIDO_CANCHA9_EMPATE = {
  cancha: 'futbol9',
  formacion: { defensores: 3, volantes: 4, delanteros: 1 },
  individuales: [
    P('arq0', 'Arquero 0', 'Arquero', [], { Arquero: 5 }),
    P('arq1', 'Arquero 1', 'Arquero', [], { Arquero: 6.5 }),
    P('j0', 'Jugador 0', 'Volante', ['Defensor'], { Volante: 6, Defensor: 7 }),
    P('j1', 'Jugador 1', 'Defensor', ['Volante'], { Defensor: 6, Volante: 5.5 }),
    P('j2', 'Jugador 2', 'Defensor', [], { Defensor: 6.5 }),
    P('j3', 'Jugador 3', 'Defensor', ['Delantero'], { Defensor: 4.5, Delantero: 3 }),
    P('j4', 'Jugador 4', 'Defensor', ['Delantero'], { Defensor: 7.5, Delantero: 4.5 }),
    P('j5', 'Jugador 5', 'Defensor', ['Volante'], { Defensor: 6, Volante: 8.5 }),
    P('j6', 'Jugador 6', 'Volante', [], { Volante: 9 }),
    P('j7', 'Jugador 7', 'Volante', ['Defensor'], { Volante: 6, Defensor: 3 }),
    P('j8', 'Jugador 8', 'Defensor', ['Delantero'], { Defensor: 8, Delantero: 8 }),
    P('j9', 'Jugador 9', 'Volante', [], { Volante: 3 }),
    P('j10', 'Jugador 10', 'Volante', ['Defensor'], { Volante: 6.5, Defensor: 5.5 }),
    P('j11', 'Jugador 11', 'Volante', ['Defensor'], { Volante: 6.5, Defensor: 3.5 }),
    P('j12', 'Jugador 12', 'Defensor', ['Delantero'], { Defensor: 5, Delantero: 4.5 }),
    P('j13', 'Jugador 13', 'Delantero', ['Defensor'], { Delantero: 4, Defensor: 3 }),
    P('j14', 'Jugador 14', 'Defensor', ['Delantero'], { Defensor: 7.5, Delantero: 9 }),
    P('j15', 'Jugador 15', 'Volante', ['Defensor'], { Volante: 5.5, Defensor: 4 }),
  ],
  duplas: [],
};

/* Plantel sintético parametrizable, para probar el reparto de duplas sin depender del
   partido real. Devuelve 16 unidades de armado (8 por equipo, cancha de 8) con la
   cantidad de duplas pedida y la cantidad de arqueros naturales pedida. */
function plantelConDuplas({ duplas = 1, arqueros = 1 } = {}) {
  const individuales = [];
  const pares = [];
  for (let i = 0; i < duplas; i++) {
    pares.push([
      P(`dupA${i}`, `DuplaA${i}`, 'Defensor', ['Volante'], { Defensor: 6, Volante: 6 }),
      P(`dupB${i}`, `DuplaB${i}`, 'Volante', ['Defensor'], { Defensor: 6, Volante: 6 }),
    ]);
  }
  for (let i = 0; i < arqueros; i++) {
    individuales.push(P(`arq${i}`, `Arquero${i}`, 'Arquero', [], { Arquero: 6 }));
  }
  // El resto se completa con defensores, volantes y delanteros "planos" de 6 puntos, de
  // modo que ningún test de reparto de duplas dependa de diferencias de puntaje.
  const faltan = 16 - pares.length - individuales.length;
  const rueda = ['Defensor', 'Volante', 'Defensor', 'Volante', 'Delantero'];
  for (let i = 0; i < faltan; i++) {
    const pos = rueda[i % rueda.length];
    individuales.push(P(`ind${i}`, `Jugador${i}`, pos, ['Defensor', 'Volante', 'Delantero'].filter(p => p !== pos), {
      Defensor: 6, Volante: 6, Delantero: 6,
    }));
  }
  return { cancha: 'futbol8', formacion: { defensores: 3, volantes: 3, delanteros: 1 }, individuales, duplas: pares };
}

/* Convierte un plantel en la lista de unidades de armado que consume el motor, en el
   mismo orden en el que las armaría la aplicación (individuales y duplas mezcladas por
   orden de convocatoria; acá: individuales primero, duplas después). */
function unidadesDe(plantel, motor) {
  return [
    ...plantel.individuales,
    ...plantel.duplas.map(([a, b]) => motor.construirUnidadDupla(a, b)),
  ];
}

/* Índice id de jugador real → unidad que lo contiene, para poder afirmar sobre
   jugadores individuales aunque el motor opere sobre unidades. */
function jugadoresPorUnidad(plantel, motor) {
  const out = {};
  plantel.individuales.forEach(p => { out[p.id] = p.id; });
  plantel.duplas.forEach(([a, b]) => {
    const u = motor.construirUnidadDupla(a, b);
    out[a.id] = u.id;
    out[b.id] = u.id;
  });
  return out;
}

module.exports = { PARTIDO_TESTIGO, PARTIDO_LINEAS_DESPAREJAS, PARTIDO_EMPATE_ENCAJE, PARTIDO_CANCHA9_EMPATE, plantelConDuplas, unidadesDe, jugadoresPorUnidad, P };
