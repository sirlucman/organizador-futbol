/* Fixtures con forma de APLICACIÓN, y el doble de Firebase que los sirve.
 *
 * fixtures.js tiene planteles con forma de MOTOR (`individuales`, `duplas`), que
 * es lo que consume `generarEquiposEstrategiaN`. La aplicación, en cambio, lee de
 * Firestore un `players` y un `partidos` con otra forma. Este módulo convierte lo
 * primero en lo segundo, así el partido testigo —plantel real de staging, con sus
 * nombres largos de verdad, que es lo que empuja el ancho mínimo de una fila— se
 * reusa en vez de inventar datos nuevos.
 *
 * `fakeFirebase` reemplaza el único global del que cuelga toda la persistencia.
 * `index.html` hace `firebase.initializeApp` + `firebase.firestore()` +
 * `firebase.auth()` y de ahí en adelante todo pasa por `window.storage`,
 * `window.auth` y `resolveSession`. Falseando ese objeto arranca la aplicación
 * REAL, entera, sin red y sin credenciales — y el test mide lo que la aplicación
 * pinta, no una maqueta.
 */
const { PARTIDO_TESTIGO, aPuestos } = require('./fixtures.js');

/* Los ids que la aplicación lee al arrancar (ver DOCS_SOLO_ADMIN y loadAll en
   index.html). Los que no se completan quedan en null, que la aplicación
   interpreta como "sin configurar" y resuelve con sus defaults. */
/* `reclasificados`: el plantel pasa por `aPuestos` (los ocho puestos, con los puntajes viejos
   conservados) y los PARTIDOS quedan tal cual, con sus posiciones viejas guardadas. Es el estado
   de la base después de que el administrador reclasificó a todos: cada escenario que lo usa
   ejercita, sin decirlo, la lectura de un partido viejo (desglose-posiciones S-10, TD-15). */
/* `aRevisar`: ids que, aun con el plantel reclasificado, se dejan con sus posiciones viejas. Es el
   día del cambio para unos pocos, que es lo que necesita el escenario del bloqueo (S-04). */
function docsDesde(fixture = PARTIDO_TESTIGO, { reclasificados = true, aRevisar = [] } = {}) {
  if (reclasificados) {
    const original = fixture;
    const deOriginal = p => original.individuales.concat((original.duplas || []).flat()).find(x => x.id === p.id);
    const traducido = aPuestos(fixture);
    const volver = p => (aRevisar.includes(p.id) ? deOriginal(p) : p);
    fixture = { ...traducido, individuales: traducido.individuales.map(volver),
      duplas: (traducido.duplas || []).map(par => par.map(volver)) };
  }
  const duplas = fixture.duplas || [];
  /* Las duplas van PRIMERO para que sus cuatro integrantes entren en el cupo de titulares.
     Con ellas al final sólo la primera llegaba a un equipo, y el resumen de generación caía
     siempre en el caso de una sola dupla ubicada — las ramas de reparto par y desparejo no se
     ejercitaban nunca. */
  const jugadores = [...duplas.flat(), ...fixture.individuales];

  /* Estadísticas acumuladas: existen para que la fila del listado pinte
     `.row-stats`, que es parte de lo que hay que medir (004 FR-006). */
  const players = jugadores.map((p, i) => ({
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido || '',
    estado: i === jugadores.length - 1 ? 'Inactivo' : 'Activo',
    principal: p.principal,
    secundarias: p.secundarias || [],
    scores: p.scores || {},
    partidosJugados: 12 + i, partidosGanados: 6, partidosEmpatados: 3, partidosPerdidos: 3,
    goles: 10 + i, asistencias: 4 + i,
  }));

  /* Tres jugadores de más allá del cupo: el partido testigo da exactamente 16 unidades
     (14 individuales + 2 duplas) y el cupo de Fútbol 8 son 16, así que sin esto la lista
     de convocatoria nunca tiene suplentes y la sección "Suplentes" de renderConvocadosList
     no se ejercita. Los nombres son largos a propósito, igual que los del testigo. */
  ['Maximiliano Etchegaray', 'Bartolomé Villanueva', 'Juan Cruz Ibarrola'].forEach((nombre, i) => {
    const principal = (reclasificados ? ['MC', 'DC', 'DEL'] : ['Volante', 'Defensor', 'Delantero'])[i];
    const scores = { Volante: 5, Defensor: 5, Delantero: 5 };
    if (reclasificados) scores[principal] = 5;
    players.push({ id: `sup${i}`, nombre, apellido: '', estado: 'Activo',
      principal, secundarias: [], scores,
      partidosJugados: 4, partidosGanados: 2, partidosEmpatados: 1, partidosPerdidos: 1, goles: 2, asistencias: 1 });
  });

  const ids = players.map(p => p.id);
  const titulares = ids.slice(0, 16);
  const duplasIds = duplas.map(([a, b]) => [a.id, b.id]);
  /* Los equipos se arman respetando lo que el motor garantiza: los dos integrantes de una
     dupla van juntos, y las duplas se reparten una por equipo (011 FR-007). Partirlas acá
     produciría un armado que el motor nunca genera. */
  const dA = duplasIds[0] || [], dB = duplasIds[1] || [];
  const sueltos = titulares.filter(id => ![...dA, ...dB].includes(id));
  const blancoIds = [...dA, ...sueltos.slice(0, 8 - dA.length)];
  const negroIds = [...dB, ...sueltos.slice(8 - dA.length, 16 - dA.length - dB.length)];

  /* La formación 3-3-1 repartida sobre cada equipo, eligiendo para cada lugar a alguien que
     TENGA puntaje en esa posición.

     Antes esto era `i % 8 === 0 ? 'Arquero' : principal`, que ubicaba de arquero a quien tocara
     por índice. El resultado era un armado que el motor nunca produce, y sobre todo un armado
     donde el Arco y el Ataque sumaban CERO en los dos equipos: sin puntaje en la posición
     asignada, esas dos líneas quedaban vacías y el bloque de diferencia por línea no las
     dibujaba. O sea que el fixture no podía ejercitar justo el caso que distingue a `D-22`.

     Con el plantel testigo, además, el reparto queda naturalmente desparejo en las dos líneas
     de un solo lugar —hay un único candidato a arquero (011 § Caso testigo)—, que es
     exactamente el caso que la regla de color tiene que dejar sin marcar. */
  /* El orden en que se LLENAN los lugares no es el orden en que se leen: primero las líneas de
     un solo lugar —arco y ataque—, que son las escasas, y después las de tres. Llenando por el
     orden de lectura, el único titular con puntaje de delantero se gastaba antes como volante y
     el ataque quedaba en cero para los dos equipos. El motor real resuelve el arco primero por
     la misma razón (003 FR-005). */
  const FORMACION_831 = ['Arquero', 'Delantero', 'Defensor', 'Defensor', 'Defensor', 'Volante', 'Volante', 'Volante'];
  function asignarFormacion(equipoIds, formacion) {
    const out = {};
    const pendientes = [...equipoIds];
    /* Una unidad de dupla ocupa UN lugar entre sus dos integrantes: los dos reciben la misma
       posición, como hace el motor. */
    const pareja = id => duplasIds.find(par => par.includes(id));
    const puntajeEn = (id, pos) => {
      const p = players.find(x => x.id === id);
      const v = p && p.scores ? p.scores[pos] : null;
      return (v === null || v === undefined || v === '') ? -1 : Number(v);
    };
    formacion.forEach(pos => {
      if (!pendientes.length) return;
      // El mejor disponible para este lugar; si nadie puntúa ahí, el primero que quede.
      let elegido = pendientes[0], mejor = -2;
      pendientes.forEach(id => {
        const v = puntajeEn(id, pos);
        if (v > mejor) { mejor = v; elegido = id; }
      });
      const unidad = pareja(elegido) || [elegido];
      unidad.forEach(id => { out[id] = pos; });
      unidad.forEach(id => {
        const i = pendientes.indexOf(id);
        if (i >= 0) pendientes.splice(i, 1);
      });
    });
    pendientes.forEach(id => { out[id] = (players.find(x => x.id === id) || {}).principal || 'Volante'; });
    return out;
  }

  const equipos = {
    blanco: blancoIds,
    negro: negroIds,
    sumaBlanco: 51.8, sumaNegro: 51.3,
    posicionAsignada: {
      ...asignarFormacion(blancoIds, FORMACION_831),
      ...asignarFormacion(negroIds, FORMACION_831),
    },
    /* Campos que el generador siempre escribe y el resumen lee. Sin ellos la explicación
       renderizaba "Se mantuvieron NaN asignaciones; undefined jugadores cambiaron de
       equipo": ruido de fixture que puede tapar un problema real. */
    /* Segunda generación con dos cambios, y no la primera: es lo que hace que el receipt emita
       "Se mantuvieron N asignaciones de la generación anterior; 2 jugadores cambiaron de equipo",
       la única línea de este fixture que pertenece al grupo "Como lo armó el motor". Sin ella el
       bloque nunca se puede ver dividido en dos grupos y el escenario `panel-receipt-abierto` no
       tendría el caso más alto que medir (`FR-072b`). */
    esPrimeraGeneracion: false,
    cambios: 2,
    estrategia: 'Formación fija',
    estrategiaKey: 'estrategia4',
    /* `formacion` y `balanceLineas` los escribe el generador con las Estrategias 3 y 4, y sin
       ellos el bloque de diferencia por línea NO SE DIBUJA — así que hasta la rebanada 3 ningún
       escenario de layout medía la pantalla que se publica. Los valores están elegidos para que
       la grilla ejercite el caso que distingue D-22: el Arco desparejo por 4 y la Defensa por 3,
       con un desvío aceptable de 1, la Defensa se marca y el Arco no. Ver PANEL_ARMADO
       Implementation Plan, TD-11. */
    formacion: {
      objetivo: { defensores: 3, volantes: 3, delanteros: 1 },
      /* `blanco`/`negro` con su `cumplida` son parte de la forma que el generador escribe, y el
         resumen los lee sin guarda: un `formacion` con sólo `objetivo` rompe el render entero. */
      blanco: { cumplida: true, faltantes: [] },
      negro: { cumplida: true, faltantes: [] },
    },
    balanceLineas: {
      Arquero:   { blanco: 9,    negro: 5,    diferencia: 4 },
      Defensor:  { blanco: 21,   negro: 18,   diferencia: 3 },
      Volante:   { blanco: 14.8, negro: 14.8, diferencia: 0 },
      Delantero: { blanco: 7,    negro: 13.5, diferencia: -6.5 },
    },
  };
  /* Forma canónica de las duplas, igual que `canonicalDuplas` en index.html: es lo que el
     armado guarda para poder detectar que la convocatoria cambió, y lo que el resumen usa
     para explicar el reparto de duplas que realmente se hizo. Sin esto la explicación no
     se renderiza y el escenario no prueba nada de eso. */
  const duplasSnapshot = JSON.stringify(duplasIds.map(par => [...par].sort()).sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])));

  /* Fútbol 9 con el MISMO plantel: nueve unidades de armado por equipo, en la formación
     1 ARQ / 3 DEF / 4 VOL / 1 DEL que el motor produce para esa cancha. Es la única forma de
     ejercitar la fila de cuatro camisetas, que es el caso más ancho de la cancha y el que decide
     el escalón de medidas a 360px (Spec de la cancha, S-01a, S-06).

     Se reusa el plantel testigo y NO `PARTIDO_CANCHA9_EMPATE`, aunque ese fixture ya sea de
     cancha de 9: sus nombres son sintéticos y cortos ("Jugador 10"), y lo que empuja el ancho de
     una camiseta son los nombres largos de verdad. Un fixture de 9 con nombres cortos mediría el
     caso equivocado.

     La dupla se ubica a propósito como PRIMER volante, o sea dentro de la fila de cuatro: la
     cápsula de dos nombres es más ancha que un nombre solo, así que es el peor caso y el que
     conviene mirar primero. */
  /* Los sueltos del partido de 8 son sólo doce —`titulares` corta en dieciséis ids y cuatro se
     los llevan las duplas—, y para nueve por equipo hacen falta dieciséis. Así que acá los
     sueltos salen del plantel COMPLETO, incluidos los tres jugadores de más allá del cupo de 8. */
  const duplaBlanco = dA, duplaNegro = dB;
  const sueltos9 = ids.filter(id => ![...dA, ...dB].includes(id)).map(id => [id]);
  const unidadesBlanco9 = [sueltos9[0], sueltos9[1], sueltos9[2], sueltos9[3], duplaBlanco, sueltos9[4], sueltos9[5], sueltos9[6], sueltos9[7]];
  const unidadesNegro9 = [sueltos9[8], sueltos9[9], sueltos9[10], sueltos9[11], duplaNegro, sueltos9[12], sueltos9[13], sueltos9[14], sueltos9[15]];
  const FORMACION_9 = ['Arquero', 'Defensor', 'Defensor', 'Defensor', 'Volante', 'Volante', 'Volante', 'Volante', 'Delantero'];
  const posicion9 = {};
  [unidadesBlanco9, unidadesNegro9].forEach(equipo => equipo.forEach((unidad, i) => {
    unidad.forEach(id => { posicion9[id] = FORMACION_9[i]; });
  }));
  const equipos9 = {
    blanco: unidadesBlanco9.flat(),
    negro: unidadesNegro9.flat(),
    sumaBlanco: 59.5, sumaNegro: 58,
    posicionAsignada: posicion9,
    esPrimeraGeneracion: true, cambios: 0,
    estrategia: 'Formación fija', estrategiaKey: 'estrategia4',
    duplasSnapshot,
    /* Cancha de 9: el Medio tiene CUATRO lugares por equipo, así que sí puede marcarse como
       excedido — es lo que distingue este fixture del de 8 para la regla de D-22. */
    formacion: {
      objetivo: { defensores: 3, volantes: 4, delanteros: 1 },
      blanco: { cumplida: true, faltantes: [] },
      negro: { cumplida: true, faltantes: [] },
    },
    balanceLineas: {
      Arquero:   { blanco: 9,    negro: 5,  diferencia: 4 },
      Defensor:  { blanco: 20,   negro: 19, diferencia: 1 },
      Volante:   { blanco: 23.5, negro: 20, diferencia: 3.5 },
      Delantero: { blanco: 7,    negro: 14, diferencia: -7 },
    },
  };

  /* Un partido por estado, porque cada estado pinta una fila distinta: sin
     inputs, con los tres inputs de carga de resultado, y con los stats de
     sólo lectura (que llevan white-space:nowrap). Los dos últimos son de la cancha: el de
     fútbol 9 y uno sin equipos generados, que es el estado en que la cancha NO se dibuja. */
  const partidos = [
    { id: 'm-abierto', fecha: '2026-09-03', cancha: 'futbol8', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [titulares[1]], duplas: duplasIds, equipos: { ...equipos, duplasSnapshot } },
    { id: 'm-cerrado', fecha: '2026-08-27', cancha: 'futbol8', estado: 'Equipos generados',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos: { ...equipos, duplasSnapshot } },
    { id: 'm-finalizado', fecha: '2026-08-20', cancha: 'futbol8', estado: 'Finalizado',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos: { ...equipos, duplasSnapshot },
      /* `golesEnContra` en dos titulares — el índice 0 (Claudio, integrante de la dupla `d1`) y
         el índice 5 (Anibal, suelto) —, elegidos porque ya son válidos respecto de `golesPenal`
         en el patrón `i % 3` / `i % 2` existente: sin esto ningún escenario de layout podía
         ejercitar el chip ni la fila de detalle de gol en contra (rebanada 4, S-03b, S-05c). */
      resultado: { finalizadoEn: 1756000000000,
        statsPorJugador: Object.fromEntries(titulares.map((id, i) => [id, {
          goles: i % 3, golesPenal: i % 2, asistencias: (i + 1) % 3,
          ...(i === 0 || i === 5 ? { golesEnContra: 1 } : {}) }])) } },
    /* El único partido finalizado ya en el modelo de eventos (rebanada 5, D-04): `m.resultado`
       tiene `eventos`, nunca `statsPorJugador`. Mismos índices que `m-finalizado` (0: Claudio,
       de la dupla `d1`; 5: Anibal, suelto) para poder comparar los dos formatos lado a lado
       (eventos/S-02, eventos/S-03). */
    { id: 'm-finalizado-eventos', fecha: '2026-08-22', cancha: 'futbol8', estado: 'Finalizado',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos: { ...equipos, duplasSnapshot },
      resultado: { finalizadoEn: 1756200000000,
        eventos: [
          { jugadorId: titulares[0], tipo: 'gol' },
          { jugadorId: titulares[0], tipo: 'golPenal' },
          { jugadorId: titulares[0], tipo: 'asistencia' },
          { jugadorId: titulares[5], tipo: 'golEnContra' },
        ] } },
    { id: 'm-nueve', fecha: '2026-09-10', cancha: 'futbol9', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [equipos9.blanco[0]], duplas: duplasIds, equipos: equipos9 },
    /* Partido de fútbol 9 finalizado, sin editar: el único caso de la cancha de 9 en este
       estado (rebanada 4, S-01b, S-10, S-10a). Mismo plantel que `m-nueve`, reusando `equipos9`. */
    { id: 'm-finalizado-nueve', fecha: '2026-09-24', cancha: 'futbol9', estado: 'Finalizado',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos: equipos9,
      /* El primer titular gana gol Y asistencia a la vez, a propósito: es la fila de cuatro
         volantes de fútbol 9 (chip-size 48px), el caso más angosto donde los dos chips pueden
         solaparse (INVARIANTE_CHIPS_ESTADISTICA). */
      resultado: { finalizadoEn: 1756100000000,
        statsPorJugador: Object.fromEntries([...equipos9.blanco, ...equipos9.negro].map((id, i) => [id, { goles: i === 0 ? 1 : i % 2, golesPenal: 0, asistencias: i === 0 ? 1 : (i + 1) % 2 }])) } },
    /* Sin `equipos`: la tarjeta no pinta ni cancha ni lista, y es el estado que verifica que la
       cancha no aparece antes de que el motor reparta (Spec de la cancha, S-10c). */
    { id: 'm-sin-equipos', fecha: '2026-09-17', cancha: 'futbol8', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds },
  ];

  return {
    players: JSON.stringify(players),
    partidos: JSON.stringify(partidos),
    motorConfig: null,          // la aplicación aplica normalizeMotorConfig(null)
    playerScores: null,         // los puntajes ya vienen dentro de `players`
    partidosArmado: null,       // idem: el armado ya viene dentro de `partidos`
    statsGanadosEmpatadosPerdidosMigrado: 'true',
    puntajeArmadoSeparadoMigrado: 'true',
  };
}

/* Los datos del intercambio de puesto (posiciones-del-jugador, Implementation Plan TD-17).

   Se SUMAN a los de `docsDesde` y no se escriben sobre ellos: los partidos de `docsDesde` guardan
   posiciones del catálogo viejo a propósito (ver `reclasificados`), y `D-32` dice que un partido
   editable ya no las tiene. Escribir los escenarios del intercambio sobre esos datos probaría un
   estado que la feature declara inexistente. Agregarlos aparte no cambia ninguno de los escenarios
   que ya pasan. Se engancha con el `transformarDatos` de `tests/layout.test.js`.

   El plantel está armado para que cada escenario de la Spec tenga su caso exacto:
     - Juan (DC; LD y LI) y Pedro (LD; DC) son los de `S-01`: intercambiarlos baja 4 el Blanco.
       Nico, LI puro, es el candidato con costo de Juan: Juan cubre LI y Nico no cubre DC (`S-01n`).
     - Lucas (MC; MD) y Tomás (MD; MC) son los de `S-02`, en equipos distintos.
     - Mateo y Bruno, MI puros de 6 en equipos distintos, son el intercambio de `S-07a`.
     - El jugador `<img …>` es el DEL del Blanco y no tiene candidatos en `m-int-8`: el Negro juega
       sin DEL —Ramón, su DEL de Fútbol 9, está de MC, un lugar de más—, así que no hay ningún otro
       DEL con quien intercambiar. Él no cubre DC: soltarlo sobre Diego produce el aviso de `S-21`
       con su nombre. En `m-int-9` Ramón sí está de DEL, sin declararlo: fuera de puesto (`S-02i`).
     - Julián (MI; Arquero de secundaria) es el de `S-04a`, con candado en `m-int-sin-arquero`.
     - La dupla Ramiro (LD; MC) + Esteban (MC) va en la fila de cuatro de Fútbol 9, que es el caso
       más ancho de la cancha (`S-22`).
   Cada jugador tiene puntaje en el puesto que se le asigna, así los totales son las sumas a mano
   que se anotan abajo y el resumen de un partido recién armado no aparece dividido (`S-07`). */
function agregarDatosDeIntercambio(datos) {
  const J = (id, nombre, apellido, principal, scores, secundarias = []) => ({
    id, nombre, apellido, estado: 'Activo', principal, secundarias, scores,
    partidosJugados: 10, partidosGanados: 5, partidosEmpatados: 2, partidosPerdidos: 3, goles: 3, asistencias: 2,
  });
  const nuevos = [
    J('int-fermin', 'Fermín', 'Arce', 'Arquero', { Arquero: 6 }),
    J('int-nico', 'Nicolás', 'Lagos', 'LI', { LI: 6 }),
    J('int-juan', 'Juan', 'Pérez', 'DC', { DC: 7, LD: 6, LI: 5 }, ['LD', 'LI']),
    J('int-pedro', 'Pedro', 'Gómez', 'LD', { LD: 8, DC: 5 }, ['DC']),
    J('int-mateo', 'Mateo', 'Ruiz', 'MI', { MI: 6 }),
    J('int-lucas', 'Lucas', 'Herrera', 'MC', { MC: 7, MD: 6 }, ['MD']),
    J('int-martin', 'Martín', 'Sosa', 'MD', { MD: 6 }),
    J('int-img', '<img src=x onerror=alert(1)>', '', 'DEL', { DEL: 7 }),
    J('int-gabriel', 'Gabriel', 'Ortiz', 'Arquero', { Arquero: 6 }),
    J('int-sergio', 'Sergio', 'Paz', 'LI', { LI: 6 }),
    J('int-diego', 'Diego', 'Ramos', 'DC', { DC: 6, DEL: 5 }, ['DEL']),
    J('int-hernan', 'Hernán', 'Vega', 'LD', { LD: 7 }),
    J('int-bruno', 'Bruno', 'Díaz', 'MI', { MI: 6 }),
    J('int-ezequiel', 'Ezequiel', 'Romero', 'MC', { MC: 6 }),
    J('int-tomas', 'Tomás', 'Silva', 'MD', { MD: 6, MC: 7 }, ['MC']),
    J('int-ramon', 'Ramón', 'Acosta', 'MC', { MC: 7 }),
    J('int-agustin', 'Agustín', 'Molina', 'MC', { MC: 6 }),
    J('int-ramiro', 'Ramiro', 'Castro', 'LD', { LD: 6, MC: 6 }, ['MC']),
    J('int-esteban', 'Esteban', 'Luna', 'MC', { MC: 6 }),
    J('int-julian', 'Julián', 'Torres', 'MI', { MI: 5, Arquero: 4 }, ['Arquero']),
  ];

  /* Un reparto con puestos: `[id, puesto]` por equipo. */
  const reparto = (blanco, negro, extra = {}) => ({
    blanco: blanco.map(([id]) => id),
    negro: negro.map(([id]) => id),
    posicionAsignada: Object.fromEntries([...blanco, ...negro]),
    esPrimeraGeneracion: true, cambios: 0,
    estrategia: 'Por posición y puntaje', estrategiaKey: 'estrategia2',
    duplasSnapshot: '[]',
    ...extra,
  });
  const BLANCO_8 = [['int-fermin', 'Arquero'], ['int-nico', 'LI'], ['int-juan', 'DC'], ['int-pedro', 'LD'],
    ['int-mateo', 'MI'], ['int-lucas', 'MC'], ['int-martin', 'MD'], ['int-img', 'DEL']];
  const NEGRO_8 = [['int-gabriel', 'Arquero'], ['int-sergio', 'LI'], ['int-diego', 'DC'], ['int-hernan', 'LD'],
    ['int-bruno', 'MI'], ['int-ezequiel', 'MC'], ['int-tomas', 'MD'], ['int-ramon', 'MC']];
  // Blanco 6+6+7+8+6+7+6+7 = 53. Negro 6+6+6+7+6+6+6+7 = 50.
  const equipos8 = reparto(BLANCO_8, NEGRO_8, { sumaBlanco: 53, sumaNegro: 50 });
  const ids8 = [...equipos8.blanco, ...equipos8.negro];

  /* Fútbol 9: la fila de cuatro del Medio con la dupla adentro. Juan, Pedro, Lucas y Tomás
     siguen donde estaban, así que la selección de Lucas tiene candidatos en los dos equipos:
     Martín en el propio, con costo —no juega MC—, y Ezequiel, Agustín y Tomás en el otro. En el
     Negro hay tres fuera de puesto, para el diseño 19a: Ramón de DEL, Hernán (LD) de MI, en la fila
     de cuatro, y Bruno (MI) de LD (`S-02i`, `S-22c`). */
  const BLANCO_9 = [['int-fermin', 'Arquero'], ['int-nico', 'LI'], ['int-juan', 'DC'], ['int-pedro', 'LD'],
    ['int-mateo', 'MI'], ['int-lucas', 'MC'], ['int-ramiro', 'MC'], ['int-esteban', 'MC'], ['int-martin', 'MD'], ['int-img', 'DEL']];
  const NEGRO_9 = [['int-gabriel', 'Arquero'], ['int-sergio', 'LI'], ['int-diego', 'DC'], ['int-hernan', 'MI'],
    ['int-bruno', 'LD'], ['int-ezequiel', 'MC'], ['int-agustin', 'MC'], ['int-tomas', 'MD'], ['int-ramon', 'DEL']];
  const duplas9 = [['int-ramiro', 'int-esteban']];
  /* La dupla vale 6 en MC (los dos tienen 6): Blanco 53 + 6 = 59. Negro 6+6+6+6+6+6 = 36: Ramón,
     Hernán y Bruno no tienen puntaje en el puesto que ocupan. */
  const equipos9 = reparto(BLANCO_9, NEGRO_9, { sumaBlanco: 59, sumaNegro: 36,
    duplasSnapshot: JSON.stringify(duplas9.map(par => [...par].sort())) });
  const ids9 = [...equipos9.blanco, ...equipos9.negro];

  /* El arquero del Blanco pasó al Negro por un pase hecho a mano (conserva ARQ, `FR-043`), y el
     Blanco quedó con el arco vacío y siete unidades. Julián, con Arquero de secundaria, tiene
     candado: el motor no lo mueve al arco al regenerar (`S-04a`). */
  const BLANCO_SA = [['int-nico', 'LI'], ['int-julian', 'MI'], ['int-juan', 'DC'], ['int-pedro', 'LD'],
    ['int-lucas', 'MC'], ['int-martin', 'MD'], ['int-img', 'DEL']];
  const NEGRO_SA = [...NEGRO_8, ['int-fermin', 'Arquero']];
  // Blanco 6+5+7+8+7+6+7 = 46. Negro 50 + 6 (Fermín) = 56.
  const equiposSA = reparto(BLANCO_SA, NEGRO_SA, { sumaBlanco: 46, sumaNegro: 56 });

  /* "Solo por puntaje": sin `posicionAsignada`. El motor sólo marca al arquero que ubicó en el arco
     (`posicionOverride`); los demás se dibujan en la línea de su principal. El Blanco no tiene a
     nadie en el arco (`S-04c`, `S-05b`). Los totales son la suma de los promedios generales, que
     es lo que suma un partido sin puestos (`valorDePuntaje`). */
  const BLANCO_P = ['int-nico', 'int-julian', 'int-juan', 'int-pedro', 'int-lucas', 'int-martin', 'int-mateo', 'int-img'];
  const NEGRO_P = ['int-gabriel', 'int-sergio', 'int-diego', 'int-hernan', 'int-bruno', 'int-ezequiel', 'int-tomas', 'int-ramon'];
  const equiposP = { blanco: BLANCO_P, negro: NEGRO_P, sumaBlanco: 48, sumaNegro: 50,
    posicionOverride: { 'int-gabriel': 'Arquero' }, esPrimeraGeneracion: true, cambios: 0,
    estrategia: 'Solo por puntaje', estrategiaKey: 'estrategia1', duplasSnapshot: '[]' };

  const partido = (id, fecha, cancha, equipos, convocados, extra = {}) => ({
    id, fecha, cancha, estado: 'Inscripción abierta', convocados, inscripcionCerrada: false,
    estrategia: equipos.estrategiaKey, bloqueados: [], duplas: [], equipos, ...extra,
  });
  const copia = x => JSON.parse(JSON.stringify(x));
  /* Fechas propias, con días que no usa ningún partido de `docsDesde`: `abrirPartido` encuentra la
     tarjeta por el día del mes. */
  const nuevosPartidos = [
    partido('m-int-8', '2026-10-13', 'futbol8', equipos8, ids8, { bloqueados: ['int-pedro'] }),
    partido('m-int-9', '2026-10-14', 'futbol9', equipos9, ids9, { duplas: duplas9 }),
    partido('m-int-sin-arquero', '2026-10-15', 'futbol8', equiposSA, [...equiposSA.blanco, ...equiposSA.negro],
      { bloqueados: ['int-julian'] }),
    partido('m-int-puntaje', '2026-10-16', 'futbol8', equiposP, [...BLANCO_P, ...NEGRO_P]),
    partido('m-int-cerrado', '2026-10-18', 'futbol8', copia(equipos8), ids8,
      { estado: 'Equipos generados', inscripcionCerrada: true }),
    partido('m-int-finalizado', '2026-10-19', 'futbol8', copia(equipos8), ids8,
      { estado: 'Finalizado', inscripcionCerrada: true, resultado: { finalizadoEn: 1760900000000, eventos: [] } }),
  ];

  datos.players = JSON.stringify(JSON.parse(datos.players).concat(nuevos));
  datos.partidos = JSON.stringify(JSON.parse(datos.partidos).concat(nuevosPartidos));
  return datos;
}

/* Se inyecta con page.addInitScript ANTES de que corra el script de index.html,
   y los tres <script> del CDN de Firebase se bloquean con page.route. Tiene que
   ser una función serializable —nada de closures sobre el módulo— y recibir un
   único argumento, que es lo que admite addInitScript. */
function fakeFirebase({ datos, rol, jugadorId, claimAusente, refrescoTrae, refrescoFalla, refrescoDemora, sinSesion, lecturaDemora, escrituraFalla, uid = 'u-test' }) {
  const docs = datos;
  /* Registro de escrituras. La cancha es presentación pura y no debe agregar ni un campo nuevo a
     lo que se persiste (Spec de la cancha, NFR-006): con esto un escenario puede abrir la
     pantalla, mirar `window.__escrituras` y comparar el conjunto de claves contra el esperado.
     Es una lista y no un contador porque también interesa el ORDEN cuando algo escribe de más. */
  window.__escrituras = [];
  /* Lecturas por colección. Es lo que permite a un escenario afirmar CERO lecturas de `userRoles`
     en un arranque de admin (rol-en-el-token, NFR-002/NFR-007): la ausencia de una lectura no se
     puede ver desde el DOM, y sin contador habría que creerle al código. */
  window.__lecturas = {};
  /* Cuántas veces se pidió un token FORZADO. TC-046 acota el refresco a uno por carga de página,
     y esa es una propiedad sobre el número de llamadas, no sobre el resultado (S-11c). */
  window.__refrescos = 0;
  /* Los documentos de `data` se guardan por su clave sola, como siempre; los de cualquier otra
     colección, como '<colección>/<clave>' (orden-por-columnas TD-15). Así un escenario siembra la
     preferencia de una cuenta con `datos['preferenciasOrden/u-test']` sin chocar con un documento
     de `data` del mismo nombre, y `window.__escrituras` dice en qué colección se escribió. */
  const doc = (col, clave) => {
    const key = col === 'data' ? clave : `${col}/${clave}`;
    return {
      get: async () => {
        window.__lecturas[col] = (window.__lecturas[col] || 0) + 1;
        /* `lecturaDemora` existe para poder MEDIR la pantalla de carga del arranque: contra
           Firestore la espera dura ~620 ms de mediana, y con el doble es cero, así que sin esto un
           escenario tendría que ganarle una carrera a su propia aplicación. */
        if (lecturaDemora) await new Promise(r => setTimeout(r, lecturaDemora));
        const value = docs[key];
        return value === null || value === undefined ? { exists: false, data: () => ({}) } : { exists: true, data: () => ({ value }) };
      },
      set: async (obj) => {
        /* `escrituraFalla` hace que TODA escritura tire, como una red caída o un permiso negado. La
           pide el intercambio de colores (S-07c): la Spec fija que ante un guardado fallido la
           aplicación se comporte como con cualquier otra edición, y eso sólo se puede ver si el
           doble sabe fallar. No se registra la escritura, porque no ocurrió. */
        if (escrituraFalla) throw new Error('no se pudo guardar');
        window.__escrituras.push(key);
        /* Además de la clave, el CONTENIDO. La rebanada 2 necesita comprobar no sólo que se
           escribió, sino QUÉ: que el conjunto de campos del partido no creció y que
           `posicionAsignada` quedó igual (Spec del arrastre, NFR-005, TC-012). */
        window.__ultimosDocs = window.__ultimosDocs || {};
        window.__ultimosDocs[key] = obj && obj.value;
        docs[key] = obj && obj.value;
      },
    };
  };
  /* El punto de intercepción del rol es el TOKEN, no la colección `userRoles` (rol-en-el-token,
     TC-033/TD-07). Antes esta misma función servía un documento `userRoles` falso; ahora entrega
     un `user` con `getIdTokenResult`, que es de donde la aplicación lee el claim. Es el mismo
     mecanismo —un único global falseado, sin red— movido de Firestore a Auth.

     `rol` se conserva con su nombre y su significado, así que los ~20 escenarios de layout que
     ya lo pasaban siguen funcionando sin tocarse, y tools/servir-fixture.js tampoco cambia.
     Los campos opcionales son lo que permite escribir el corte y el fail-closed como escenarios:

       jugadorId     el Jugador vinculado que viaja en el claim (rol "jugador")
       claimAusente  el primer token NO trae claim `rol`, como una sesión abierta antes del corte
       refrescoTrae  qué rol trae el token refrescado ('admin' | 'jugador' | null = sigue sin claim)
       refrescoFalla el refresco tira, para el camino de error de S-01c
       refrescoDemora cuántos ms tarda el refresco. Contra Firebase mide 250 ms de mediana; acá es
                     0 por default, y el escenario del corte lo pone en 250 para que la espera del
                     arranque con token vencido sea la real y no cero
       sinSesion     no hay nadie logueado: `onAuthStateChanged` entrega null y la aplicación
                     queda en la pantalla de login. Es la única forma de llegar ahí, porque por
                     default el doble entra siempre
       lecturaDemora cuántos ms tarda CADA lectura de Firestore. Contra Firestore la primera
                     respuesta llega a los ~620 ms de mediana (todas juntas: abrir el canal es lo
                     que se paga, no cada documento); acá es 0 por default, y el escenario de la
                     pantalla de carga lo estira para poder medirla
       uid           el `uid` de la cuenta ('u-test' por default). Dos escenarios con uid distinto
                     sobre los mismos datos son dos cuentas (orden-por-columnas S-03c)

     `currentUser` queda con la cuenta desde que `onAuthStateChanged` la entrega, como en el SDK:
     es de donde la preferencia de orden saca el `uid` (orden-por-columnas TD-02). */
  let usuarioActual = null;
  const auth = () => ({
    get currentUser() { return usuarioActual; },
    setPersistence: async () => {},
    signInWithEmailAndPassword: async () => {},
    signOut: async () => {},
    onAuthStateChanged: (cb) => sinSesion ? cb(null) : cb(usuarioActual = {
      uid,
      getIdTokenResult: async (forzado) => {
        if (forzado) {
          window.__refrescos++;
          if (refrescoDemora) await new Promise(r => setTimeout(r, refrescoDemora));
          if (refrescoFalla) throw new Error('no se pudo refrescar el token');
          return { claims: refrescoTrae ? { rol: refrescoTrae, jugadorId: jugadorId || null } : {} };
        }
        /* `claimAusente` gana sobre `rol` en el primer token a propósito: un escenario del corte
           declara las dos cosas —qué rol tiene la cuenta del lado servidor y que su token viejo
           todavía no lo trae. */
        if (claimAusente) return { claims: {} };
        return { claims: { rol, jugadorId: jugadorId || null } };
      },
    }),
  });
  auth.Auth = { Persistence: { LOCAL: 'local' } };
  window.firebase = {
    initializeApp: () => {},
    firestore: () => ({ collection: (col) => ({ doc: (key) => doc(col, key) }) }),
    auth,
  };
}

module.exports = { docsDesde, fakeFirebase, agregarDatosDeIntercambio };
