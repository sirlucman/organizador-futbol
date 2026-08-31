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
  const equipos = {
    blanco: [...dA, ...sueltos.slice(0, 8 - dA.length)],
    negro: [...dB, ...sueltos.slice(8 - dA.length, 16 - dA.length - dB.length)],
    sumaBlanco: 51.8, sumaNegro: 51.3,
    posicionAsignada: Object.fromEntries(titulares.map((id, i) => {
      const p = players.find(x => x.id === id);
      return [id, i % 8 === 0 ? 'Arquero' : p.principal];
    })),
    /* Campos que el generador siempre escribe y el resumen lee. Sin ellos la explicación
       renderizaba "Se mantuvieron NaN asignaciones; undefined jugadores cambiaron de
       equipo": ruido de fixture que puede tapar un problema real. */
    esPrimeraGeneracion: true,
    cambios: 0,
    estrategia: 'Formación fija pareja',
    estrategiaKey: 'estrategia4',
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
      resultado: { finalizadoEn: 1756000000000,
        statsPorJugador: Object.fromEntries(titulares.map((id, i) => [id, { goles: i % 3, golesPenal: i % 2, asistencias: (i + 1) % 3 }])) } },
    { id: 'm-nueve', fecha: '2026-09-10', cancha: 'futbol9', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [equipos9.blanco[0]], duplas: duplasIds, equipos: equipos9 },
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
    set: async (obj) => { window.__escrituras.push(key); docs[key] = obj && obj.value; },
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
