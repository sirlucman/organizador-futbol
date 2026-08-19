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

module.exports = { PARTIDO_TESTIGO, plantelConDuplas, unidadesDe, jugadoresPorUnidad, P };
