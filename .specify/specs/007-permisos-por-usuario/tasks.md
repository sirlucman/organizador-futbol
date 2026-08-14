---

description: "Task list template for feature implementation"
---

# Tasks: Permisos por perfil de usuario

**Input**: Design documents from `.specify/specs/007-permisos-por-usuario/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/firestore-rules.md](./contracts/firestore-rules.md), [quickstart.md](./quickstart.md)

**Tests**: No solicitadas explícitamente en spec.md (proyecto sin suite automatizada, ver plan.md → Testing). La validación es manual vía `quickstart.md`, referenciada en la Fase de Polish.

**Organización**: Todo el código de la app vive en un único archivo (`index.html`, sin build step) — ver plan.md → Project Structure. Por eso casi ninguna tarea de código se marca `[P]`: aunque toquen funciones distintas, comparten el mismo archivo y se pisarían entre sí si se ejecutan en paralelo. Solo se marcan `[P]` las tareas de configuración manual en Firebase Console, que no tocan `index.html`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (no toca `index.html`, sin dependencias)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: Preparar Firestore (reglas + datos de prueba) antes de tocar código.

**Nota**: T001-T004 son acciones manuales en la Consola de Firebase — se hicieron interactivamente durante la validación, en ambos proyectos.

- [X] T001 Publicar las reglas de Firestore de [contracts/firestore-rules.md](./contracts/firestore-rules.md) en los proyectos `organizador-futbol-staging` y `organizador-futbol` (Consola de Firebase → Firestore Database → Rules → Publicar), reemplazando la regla única de `005-login-basico`. Hecho en ambos proyectos (incluye los dos matches de flags de migración agregados durante la validación).
- [X] T002 [P] Crear el documento `userRoles/{uid}` con `{ rol: "admin" }` para la cuenta admin ya existente, en `organizador-futbol-staging` y en `organizador-futbol` (Consola de Firebase → Firestore Database). Hecho en ambos proyectos.
- [X] T003 [P] Crear una cuenta de Firebase Auth de prueba con rol "jugador" en `organizador-futbol-staging` (Authentication → Add user) y su documento `userRoles/{uid}` con `{ rol: "jugador", jugadorId: "<id de un jugador existente>" }`, según prerrequisitos de [quickstart.md](./quickstart.md).
- [X] T004 [P] En `organizador-futbol-staging`, asegurar datos de prueba suficientes: al menos un jugador sin ningún puntaje cargado en `data/players`, y un partido con equipos ya generados donde el jugador de prueba esté anotado en la convocatoria junto a otro jugador (Consola de Firebase o la app logueada como admin).

**Checkpoint**: Firestore listo (reglas + cuentas + datos) para validar cualquier historia de usuario una vez implementado el código.

---

## Phase 2: Foundational (bloqueante para todas las historias)

**Purpose**: Resolver el rol de la cuenta logueada y separar en Firestore los datos restringidos de los públicos — ninguna historia de usuario puede implementarse sin esto (ver `data-model.md` y `research.md`).

**⚠️ CRITICAL**: Ninguna tarea de las Fases 3-5 puede empezar hasta terminar esta fase.

- [X] T005 Implementar el wrapper `window.session` en `index.html`, junto a `window.storage`/`window.auth`: tras un login exitoso (dentro del flujo de `onAuthChange`), leer `userRoles/{uid}` y exponer `{ rol, jugadorId }`; si no existe el documento para ese `uid`, resolver `rol: "jugador"` sin `jugadorId` (fail-closed, nunca asumir "admin" por defecto) — ver `data-model.md` → Sesión de usuario.
- [X] T006 Migrar `loadPlayers()`/`savePlayers()` en `index.html` (~líneas 810, 869) para leer/escribir el puntaje por posición (`p.scores`) en el documento `data/playerScores` (`{ [jugadorId]: { [posicion]: puntaje } }`) en vez de dentro de `data/players`, manteniendo el resto de los campos de Jugador (nombre, estado, estadísticas acumuladas) en `data/players` — ver `data-model.md` → Jugador. Si `session.rol === 'jugador'`, no solicitar `playerScores` (las reglas lo rechazarían igual, pero evita una llamada de red innecesaria).
- [X] T007 Migrar `loadMatches()`/`saveMatches()` en `index.html` (~líneas 812, 870) para leer/escribir `estrategiaKey`, `diferenciaPuntaje`, cantidad de jugadores sin puntaje y `bloqueados`/explicación de armado por partido en el documento `data/partidosArmado` (`{ [partidoId]: {...} }`), manteniendo en `data/partidos` el resto (estado, convocatoria, `equipos.blanco`/`equipos.negro`, resultado, estadísticas de gol/asistencia por partido) — ver `data-model.md` → Partido. Si `session.rol === 'jugador'`, no solicitar `partidosArmado`.
- [X] T008 Migrar los datos ya existentes de `data/players` y `data/partidos` en `organizador-futbol-staging` y `organizador-futbol` a los nuevos documentos `data/playerScores` y `data/partidosArmado` (script puntual o pasos manuales vía consola del navegador con la app cargada como admin), para no perder puntajes ni datos de armado ya cargados por el uso real de la app.
  - Implementado como auto-migración en `loadAll()` (flag `puntajeArmadoSeparadoMigrado`, mismo patrón que la migración de G/E/P ya existente): la separación ocurre sola la primera vez que "admin" inicia sesión después de este deploy. **Importante para el despliegue**: publicar el código (T005-T019) y dejar que "admin" inicie sesión al menos una vez ANTES de publicar las reglas de Firestore restringidas (T001) — así los documentos `playerScores`/`partidosArmado` ya existen separados cuando una cuenta "jugador" empiece a operar bajo las reglas nuevas.

**Checkpoint**: `window.session` disponible en toda la app; los documentos restringidos ya no están mezclados con los públicos. A partir de acá se puede empezar cualquier historia de usuario.

---

## Phase 3: User Story 1 - Un jugador ve una interfaz restringida (Priority: P1) 🎯 MVP

**Goal**: Una cuenta "jugador" navega la app sin ver la solapa Configuración, sin opciones de administrar jugadores, y sin puntajes/estrategia/diferencias/bloqueados/explicación de armado en ningún lado.

**Independent Test**: Login con la cuenta "jugador" de prueba (T003) y recorrer Jugadores/Partidos/menú de navegación siguiendo el escenario 1 de [quickstart.md](./quickstart.md); repetir con la cuenta admin y verificar que no cambió nada para ella (FR-002).

### Implementation for User Story 1

- [X] T009 [US1] En `index.html`, ocultar el tab "Configuración" (`data-tab="motor"`, ~línea 342) de la navegación cuando `session.rol === 'jugador'` (FR-012).
- [X] T010 [US1] En `renderPlayersTab()` (`index.html` ~línea 1061), cuando `session.rol === 'jugador'`: mostrar el listado completo de jugadores (incluidos los que no tienen ningún puntaje cargado) sin mostrar el puntaje de ninguno, mantener visibles las estadísticas acumuladas (`partidosJugados`/G/E/P/goles/asistencias, aunque estén en 0), y ocultar los controles de crear/editar/eliminar/inhabilitar jugador (FR-003, FR-004, FR-013).
- [X] T011 [US1] En el bloque de detalle de partido con equipos armados (`index.html` ~líneas 1886-1928), cuando `session.rol === 'jugador'`: ocultar `teams-subtitle` (estrategia utilizada), el bloque `conv-summary` (diferencia de puntaje, cantidad de jugadores sin puntaje, jugadores bloqueados) y el `explain-box` ("por qué quedaron así"), manteniendo visible qué jugador quedó en qué equipo (FR-005, FR-006, FR-007, FR-013).

**Checkpoint**: User Story 1 completa y verificable de forma independiente.

---

## Phase 4: User Story 2 - Un jugador no puede realizar acciones administrativas sobre un partido (Priority: P2)

**Goal**: Una cuenta "jugador" no puede generar/regenerar equipos, cerrar/reabrir inscripción, finalizar un partido, crear/eliminar un partido, editar un resultado ya cargado, ni editar manualmente el armado de equipos (drag&drop/bloqueos).

**Independent Test**: Login con la cuenta "jugador" y confirmar, siguiendo el escenario 2 de [quickstart.md](./quickstart.md), que ninguna de esas acciones está disponible en la interfaz ni se ejecuta si se fuerza la llamada a las funciones subyacentes.

### Implementation for User Story 2

- [X] T012 [US2] En `index.html`, ocultar el botón de generar/regenerar equipos y agregar un guard al inicio de `__generarEquipos` (~línea 1486) que corte si `session.rol !== 'admin'` (FR-008).
- [X] T013 [US2] En `index.html`, ocultar el control de cerrar/reabrir inscripción y agregar guard en `__toggleInscripcion` (~línea 1542) que corte si `session.rol !== 'admin'` (FR-009).
- [X] T014 [US2] En `index.html`, ocultar la acción de finalizar partido y agregar guard en `__finalizarPartido` (~línea 1559) que corte si `session.rol !== 'admin'` (FR-009).
- [X] T015 [US2] En `index.html`, ocultar la opción de editar un resultado ya finalizado y agregar guard en `__editarResultadoFinalizado`/`__guardarEdicionResultado` (~líneas 1598-1618) que corte si `session.rol !== 'admin'` (FR-010).
- [X] T016 [US2] En `index.html`, ocultar el botón "+ Nuevo partido" (~línea 416) y el control de eliminar partido, y agregar guard en `__deleteMatch` (~línea 2044) y en el handler de creación de partido, que corten si `session.rol !== 'admin'` (FR-009b).
- [X] T017 [US2] En `index.html`, ocultar los controles de edición manual de equipos y agregar guards en `__toggleBloqueo`/`__dragStartJugador`/`__dropOnTeam`/`__moverJugadorManual` (~líneas 1708-1728) que corten si `session.rol !== 'admin'` (consistente con FR-008: la edición manual es parte del armado de equipos).

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Un jugador solo puede darse de baja a sí mismo de una convocatoria (Priority: P3)

**Goal**: Una cuenta "jugador" puede anotar a cualquier jugador a una convocatoria (sin cambios) y darse de baja a sí misma, pero no puede eliminar a otro jugador ya anotado.

**Independent Test**: Login con la cuenta "jugador", anotada junto a otro jugador en la convocatoria de un partido; seguir el escenario 3 de [quickstart.md](./quickstart.md).

### Implementation for User Story 3

- [X] T018 [US3] En `index.html`, agregar guard en `__removeFromMatch` (~línea 2159) que permita la baja solo si `session.rol === 'admin'` o el jugador a eliminar es `session.jugadorId`; en cualquier otro caso, cortar sin ejecutar la baja (FR-011).
- [X] T019 [US3] En `index.html`, en el render de la lista de convocatoria, ocultar el botón "eliminar de la convocatoria" para cualquier jugador distinto de `session.jugadorId` cuando `session.rol === 'jugador'`, dejándolo visible solo sobre el propio jugador vinculado (FR-011).

**Checkpoint**: Las tres historias de usuario funcionan de forma independiente y en conjunto.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar los límites documentados en el plan y validar el conjunto.

- [X] T020 [P] Agregar a `Roadmap.md` la mejora futura señalada en `research.md` #3 (migrar `data/partidos` a documentos estructurados por partido para poder reforzar por reglas, y no solo por la app, que "jugador" solo modifique su propia convocatoria).
- [X] T021 Ejecutar de punta a punta los tres escenarios de [quickstart.md](./quickstart.md) en `organizador-futbol-staging`, con la cuenta "jugador" de prueba y con la cuenta admin. Validado interactivamente: US1 (sin Configuración/puntajes/CRUD para jugador), US2 (sin estrategia/diferencias/bloqueados/explicación/generar equipos), US3 (baja de convocatoria solo sobre uno mismo).
- [X] T022 Recorrer la aplicación completa logueado como admin y confirmar que ninguna restricción nueva de esta feature le afecta (SC-004). Confirmado: Configuración, puntajes y todos los controles visibles como antes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede arrancar de inmediato (tareas de Firebase Console).
- **Foundational (Phase 2)**: Depende de que T001-T004 estén listos para poder probar contra Firestore real; BLOQUEA las historias de usuario.
- **User Stories (Phase 3-5)**: Todas dependen de que termine la Fase 2. Entre sí, US1/US2/US3 son independientes en función pero **comparten `index.html`**, por lo que en la práctica conviene implementarlas en orden de prioridad (P1 → P2 → P3) en vez de en paralelo, para evitar conflictos de merge en el mismo archivo.
- **Polish (Phase 6)**: Depende de que las historias que se quieran entregar ya estén completas.

### Parallel Opportunities

- T002, T003, T004 (Fase 1) se pueden hacer en paralelo entre sí (todas son configuración en Firebase Console, no tocan código).
- T020 (Fase 6) no depende de las demás tareas de esa fase y se puede hacer en paralelo.
- Las tareas de código (T005-T019) tocan todas `index.html`: no se marcan `[P]` para evitar ediciones simultáneas del mismo archivo, aunque conceptualmente varias son independientes entre sí.

---

## Implementation Strategy

### MVP First (User Story 1 únicamente)

1. Completar Fase 1 (Setup) y Fase 2 (Foundational) — sin esto ninguna restricción es real.
2. Completar Fase 3 (User Story 1).
3. Validar con el escenario 1 de `quickstart.md` antes de seguir.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. User Story 1 → validar → esto ya es demostrable como MVP de la feature (interfaz restringida).
3. User Story 2 → validar → agrega el bloqueo de acciones administrativas.
4. User Story 3 → validar → agrega el autoservicio acotado de convocatoria.
5. Polish → cierre y validación final end-to-end.
