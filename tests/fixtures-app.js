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
const { PARTIDO_TESTIGO } = require('./fixtures.js');

/* Los ids que la aplicación lee al arrancar (ver DOCS_SOLO_ADMIN y loadAll en
   index.html). Los que no se completan quedan en null, que la aplicación
   interpreta como "sin configurar" y resuelve con sus defaults. */
function docsDesde(fixture = PARTIDO_TESTIGO) {
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
    players.push({ id: `sup${i}`, nombre, apellido: '', estado: 'Activo',
      principal: ['Volante', 'Defensor', 'Delantero'][i], secundarias: [], scores: { Volante: 5, Defensor: 5, Delantero: 5 },
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
    esPrimeraGeneracion: true,
    cambios: 0,
    estrategia: 'Formación fija pareja',
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
    estrategia: 'Formación fija pareja', estrategiaKey: 'estrategia4',
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
    { id: 'm-nueve', fecha: '2026-09-10', cancha: 'futbol9', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [equipos9.blanco[0]], duplas: duplasIds, equipos: equipos9 },
    /* Partido de fútbol 9 finalizado, sin editar: el único caso de la cancha de 9 en este
       estado (rebanada 4, S-01b, S-10, S-10a). Mismo plantel que `m-nueve`, reusando `equipos9`. */
    { id: 'm-finalizado-nueve', fecha: '2026-09-24', cancha: 'futbol9', estado: 'Finalizado',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos: equipos9,
      resultado: { finalizadoEn: 1756100000000,
        statsPorJugador: Object.fromEntries([...equipos9.blanco, ...equipos9.negro].map((id, i) => [id, { goles: i % 2, golesPenal: 0, asistencias: (i + 1) % 2 }])) } },
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

/* Se inyecta con page.addInitScript ANTES de que corra el script de index.html,
   y los tres <script> del CDN de Firebase se bloquean con page.route. Tiene que
   ser una función serializable —nada de closures sobre el módulo— y recibir un
   único argumento, que es lo que admite addInitScript. */
function fakeFirebase({ datos, rol }) {
  const docs = datos;
  /* Registro de escrituras. La cancha es presentación pura y no debe agregar ni un campo nuevo a
     lo que se persiste (Spec de la cancha, NFR-006): con esto un escenario puede abrir la
     pantalla, mirar `window.__escrituras` y comparar el conjunto de claves contra el esperado.
     Es una lista y no un contador porque también interesa el ORDEN cuando algo escribe de más. */
  window.__escrituras = [];
  const doc = (col, key) => ({
    get: async () => {
      if (col === 'userRoles') return { exists: true, data: () => ({ rol, jugadorId: null }) };
      const value = docs[key];
      return value === null || value === undefined ? { exists: false, data: () => ({}) } : { exists: true, data: () => ({ value }) };
    },
    set: async (obj) => {
      window.__escrituras.push(key);
      /* Además de la clave, el CONTENIDO. La rebanada 2 necesita comprobar no sólo que se
         escribió, sino QUÉ: que el conjunto de campos del partido no creció y que
         `posicionAsignada` quedó igual (Spec del arrastre, NFR-005, TC-012). */
      window.__ultimosDocs = window.__ultimosDocs || {};
      window.__ultimosDocs[key] = obj && obj.value;
      docs[key] = obj && obj.value;
    },
  });
  const auth = () => ({
    setPersistence: async () => {},
    signInWithEmailAndPassword: async () => {},
    signOut: async () => {},
    onAuthStateChanged: (cb) => cb({ uid: 'u-test' }),
  });
  auth.Auth = { Persistence: { LOCAL: 'local' } };
  window.firebase = {
    initializeApp: () => {},
    firestore: () => ({ collection: (col) => ({ doc: (key) => doc(col, key) }) }),
    auth,
  };
}

module.exports = { docsDesde, fakeFirebase };
