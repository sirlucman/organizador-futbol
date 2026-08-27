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
  const jugadores = [...fixture.individuales, ...duplas.flat()];

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
  const equipos = {
    blanco: titulares.slice(0, 8),
    negro: titulares.slice(8, 16),
    sumaBlanco: 51.8, sumaNegro: 51.3,
    posicionAsignada: Object.fromEntries(titulares.map((id, i) => {
      const p = players.find(x => x.id === id);
      return [id, i % 8 === 0 ? 'Arquero' : p.principal];
    })),
  };
  const duplasIds = duplas.map(([a, b]) => [a.id, b.id]);

  /* Un partido por estado, porque cada estado pinta una fila distinta: sin
     inputs, con los tres inputs de carga de resultado, y con los stats de
     sólo lectura (que llevan white-space:nowrap). */
  const partidos = [
    { id: 'm-abierto', fecha: '2026-09-03', cancha: 'futbol8', estado: 'Inscripción abierta',
      convocados: ids, inscripcionCerrada: false, estrategia: 'estrategia4',
      bloqueados: [titulares[1]], duplas: duplasIds, equipos },
    { id: 'm-cerrado', fecha: '2026-08-27', cancha: 'futbol8', estado: 'Equipos generados',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos },
    { id: 'm-finalizado', fecha: '2026-08-20', cancha: 'futbol8', estado: 'Finalizado',
      convocados: ids, inscripcionCerrada: true, estrategia: 'estrategia4',
      bloqueados: [], duplas: duplasIds, equipos,
      resultado: { finalizadoEn: 1756000000000,
        statsPorJugador: Object.fromEntries(titulares.map((id, i) => [id, { goles: i % 3, golesPenal: i % 2, asistencias: (i + 1) % 3 }])) } },
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
  const doc = (col, key) => ({
    get: async () => {
      if (col === 'userRoles') return { exists: true, data: () => ({ rol, jugadorId: null }) };
      const value = docs[key];
      return value === null || value === undefined ? { exists: false, data: () => ({}) } : { exists: true, data: () => ({ value }) };
    },
    set: async (obj) => { docs[key] = obj && obj.value; },
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
