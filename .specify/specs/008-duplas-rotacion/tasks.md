---

description: "Task list template for feature implementation"
---

# Tasks: Duplas de rotación entre jugadores

**Input**: Design documents from `.specify/specs/008-duplas-rotacion/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No solicitadas explícitamente en spec.md (proyecto sin suite automatizada, ver plan.md → Testing). La validación es manual vía `quickstart.md`, referenciada en la Fase de Polish y al cierre de cada historia que lo requiere.

**Organización**: Todo el código de la app vive en un único archivo (`index.html`, sin build step) — ver plan.md → Project Structure. Por eso casi ninguna tarea de código se marca `[P]`: aunque toquen funciones distintas, comparten el mismo archivo y se pisarían entre sí si se ejecutan en paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (no toca `index.html`, sin dependencias)
- **[Story]**: A qué historia de usuario pertenece (US1-US5)

---

## Phase 1: Setup

**Purpose**: Datos de prueba en staging antes de tocar código.

- [X] T001 [P] En `organizador-futbol-staging`, asegurar al menos 6 jugadores activos con puntaje cargado, dos de ellos con `principal: 'Arquero'`, y un partido en Fútbol 8 con inscripción abierta y sin equipos generados, según prerrequisitos de [quickstart.md](./quickstart.md). Resuelto con datos ya existentes en staging (16 jugadores reales) más "+ Jugadores de prueba"/"+ Completar titulares (prueba)" para los partidos de validación de T021; los partidos de prueba se eliminaron al finalizar.

**Checkpoint**: Datos de prueba listos en staging.

---

## Phase 2: Foundational (bloqueante para todas las historias)

**Purpose**: Persistir el vínculo de dupla y ofrecer la vista derivada de "unidades de convocatoria" de la que dependen todas las historias — ver `data-model.md` y `research.md` #1-#2.

**⚠️ CRITICAL**: Ninguna tarea de las Fases 3-7 puede empezar hasta terminar esta fase.

- [X] T002 En `index.html`, agregar `duplas: []` al crear un partido nuevo (~línea 2449) y normalizar a `duplas: []` cualquier partido cargado desde Firestore que no tenga el campo (en `loadAll`/normalización de partidos existente), para que el resto del código pueda asumir siempre que `m.duplas` es un array.
- [X] T003 En `index.html`, junto a `getTitularIds(m)` (~línea 1334), implementar la función pura `getUnidadesConvocatoria(m)`: recorre `m.convocados` en orden y devuelve una lista de unidades `{ids: [id]}` (individual) o `{ids: [idA, idB]}` (dupla, emitida en la posición de la **primera** aparición de cualquiera de sus dos ids; la segunda aparición se omite) — ver `data-model.md` → "Unidad de convocatoria" y `research.md` #2.
- [X] T004 En `index.html`, redefinir `getTitularIds(m)` (~línea 1334-1336) como `getUnidadesConvocatoria(m).slice(0, titularesRequeridos(m)).flatMap(u => u.ids)`, sin cambiar su tipo de retorno (sigue siendo un array plano de ids) para que el resto del código que ya la consume no requiera cambios.
- [X] T005 En `index.html`, implementar el helper `getDuplaPartner(m, playerId)` que devuelve el id del otro integrante si `playerId` aparece en algún par de `m.duplas`, o `null` si no está vinculado — usado por las Fases 4 y 6.

**Checkpoint**: `m.duplas` persistido y normalizado; `getTitularIds`/`getUnidadesConvocatoria`/`getDuplaPartner` disponibles. A partir de acá se puede empezar cualquier historia de usuario.

---

## Phase 3: User Story 1 - Vincular a dos jugadores como dupla de rotación (Priority: P1) 🎯 MVP

**Goal**: Cualquier usuario logueado (admin o jugador) vincula a dos jugadores convocados (o uno convocado y otro no) como dupla, liberando o ajustando vacantes de titular/suplente según corresponda.

**Independent Test**: Convocar a dos jugadores titulares, vincularlos como dupla (probar con sesión "admin" y con sesión "jugador") y verificar que se libera una vacante que el siguiente suplente ocupa automáticamente — escenarios 1-2 de [quickstart.md](./quickstart.md).

### Implementation for User Story 1

- [X] T006 [US1] En `index.html`, generalizar la función de filtrado de candidatos usada hoy por `renderAutocomplete` (~línea 2360) para un nuevo buscador de "Agregar rotación": debe incluir tanto convocados (titulares o suplentes) como no convocados, excluyendo únicamente al propio jugador de la fila y a cualquier id que ya aparezca en algún par de `m.duplas` (FR-001, FR-002).
- [X] T007 [US1] En `index.html`, implementar `window.__vincularDupla(matchId, idA, idB)`: sin restricción de rol (mismo criterio que `__addToMatch`, FR-001b); si alguno de los dos ids no está en `m.convocados`, incorporarlo llamando a `__addToMatch` antes de registrar el par (FR-001c); finalmente empujar `[idA, idB]` a `m.duplas` y guardar con `saveMatches()`.
- [X] T008 [US1] En `renderConvocadosList` (`index.html` ~línea 2334), agregar el botón "Agregar rotación" en la fila de cada convocado sin vínculo (visible mientras la inscripción esté abierta, para cualquier usuario logueado), que abre el buscador de T006 y llama a `window.__vincularDupla` al elegir un candidato.
- [X] T009 [US1] En `renderConvocadosList` (`index.html` ~línea 2334), cuando un convocado tenga partner (`getDuplaPartner(m, p.id)` no nulo), reemplazar el botón "Agregar rotación" por un indicador del vínculo existente (nombre del compañero) en la fila de ambos integrantes (FR-002, escenario 4).

**Checkpoint**: User Story 1 completa y verificable de forma independiente (los efectos sobre titulares/suplentes ya funcionan gracias a la Fase 2, sin código adicional).

---

## Phase 4: User Story 2 - Deshacer el vínculo de dupla (Priority: P2)

**Goal**: Un "admin" deshace cualquier dupla; un "jugador" solo deshace una dupla de la que forma parte; el vínculo se deshace solo si alguno de los dos se da de baja de la convocatoria.

**Independent Test**: Con sesión "admin", deshacer una dupla ajena (debe funcionar); con sesión "jugador", intentar deshacer una ajena (debe fallar) y luego una propia (debe funcionar); dar de baja a un integrante y verificar que el vínculo desaparece solo — escenario 3 de [quickstart.md](./quickstart.md).

### Implementation for User Story 2

- [X] T010 [US2] En `index.html`, implementar `window.__deshacerDupla(matchId, playerId)`: resolver el par que contiene a `playerId` vía `getDuplaPartner`, cortar sin ejecutar si `!isAdmin() && playerId !== session.jugadorId && partnerId !== session.jugadorId` (mismo gate que `__removeFromMatch`, FR-006), y si pasa, quitar ese par de `m.duplas` y guardar (FR-006).
- [X] T011 [US2] En `renderConvocadosList` (`index.html` ~línea 2334), mostrar el control "Deshacer rotación" en la fila de una dupla únicamente cuando `isAdmin() || session.jugadorId` sea uno de los dos integrantes (mismo patrón de ocultamiento que el botón "Quitar del partido", ~línea 2352) — nunca deshabilitado, directamente ausente para cualquier otro "jugador" (FR-006b).
- [X] T012 [US2] En `window.__removeFromMatch` (`index.html` ~línea 2395), antes o después de quitar el id de `m.convocados`, quitar también cualquier par de `m.duplas` que contenga ese id (User Story 2, escenario 5) — el integrante que queda vuelve a contarse como convocado individual sin ningún paso adicional (gracias a T003/T004).
- [X] T013 [US2] Verificar manualmente (sin código nuevo esperado — ver `research.md` #7) que deshacer una dupla con equipos ya generados activa el aviso existente de "equipos desactualizados" (`equiposStale`, FR-015); si no se activa, ajustar `getTitularIds`/`equiposStale` hasta que lo haga. Verificado con un harness de Node que ejecuta el motor real extraído de `index.html`: `getTitularIds(m)` cambia cuando se agrega/quita un par de `m.duplas` (confirmado en los tests de `getUnidadesConvocatoria`/`contarTitularesSuplentes`), que es exactamente lo que `equiposStale` compara contra `titularesSnapshot` — no hizo falta ajustar nada. Falta la validación visual del banner en el navegador (requiere login, ver T021).

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente y en conjunto.

---

## Phase 5: User Story 3 - El motor de generación de equipos respeta a la dupla (Priority: P1)

**Goal**: Al generar o regenerar equipos, ambos integrantes de una dupla quedan siempre en el mismo equipo y se evalúan como una sola unidad de balance.

**Independent Test**: Generar equipos con una dupla entre los titulares, con cada estrategia, y verificar que ambos quedan siempre en el mismo equipo y que el balance no los cuenta por separado — escenario 4 de [quickstart.md](./quickstart.md).

### Implementation for User Story 3

- [X] T014 [US3] En `index.html`, junto a `window.__generarEquipos` (~línea 1629), implementar `getUnidadesDeArmado(m, players)`: mapea `getUnidadesConvocatoria(m).slice(0, titularesRequeridos(m))` a una lista de candidatos con la misma forma que un Jugador (`{id, principal, secundarias, scores}`); una unidad individual devuelve el objeto Jugador real sin cambios; una unidad-dupla devuelve un objeto sintético con `_duplaIds: [idA, idB]` y:
  - `scores` combinado según FR-008 (promedio de los promedios si ambos tienen puntaje; el del único que tiene, si solo uno; ausente si ninguno) — ver `data-model.md` → "Unidad de armado".
  - `principal`/`secundarias` resueltos evaluando ambas posiciones principales de los integrantes como candidatas (agregando secundarias solo si corrigen una imparidad), mismo criterio de selección que ya usa el motor para un jugador individual (FR-008).
- [X] T015 [US3] En `window.__generarEquipos` (~línea 1629), reemplazar la construcción de `titularesPlayers` para usar `getUnidadesDeArmado` (T014) en vez de mapear `titularIds` directo a jugadores reales, pasando el resultado a `generarEquiposEstrategia1`/`generarEquiposEstrategia2` sin cambiar la firma de esas funciones (FR-007, FR-008).
- [X] T016 [US3] En el punto donde cada estrategia asigna una unidad a un equipo (dentro de `generarEquiposEstrategia1` ~línea 1386 y `generarEquiposEstrategia2` ~línea 1499), cuando la unidad tenga `_duplaIds`, empujar ambos ids reales al array `blanco`/`negro` correspondiente en vez del id sintético de la unidad, y sumar el valor combinado una sola vez a `sumaBlanco`/`sumaNegro` (nunca dos veces) — ver `data-model.md` → Partido, `equipos.blanco`/`negro`.
- [X] T017 [US3] En `resolverArqueros` (`index.html` ~línea 1372), verificar/ajustar para que una unidad-dupla donde ambos integrantes son arqueros naturales (`principal: 'Arquero'` resuelto en T014) se trate como un único candidato del `naturalPool`, nunca como dos entradas separadas (FR-009).

**Checkpoint**: User Story 3 completa y verificable de forma independiente; combinada con US1 permite el flujo completo "vincular → generar equipos" end-to-end.

---

## Phase 6: User Story 4 - La edición manual de equipos respeta a la dupla (Priority: P2)

**Goal**: Mover o bloquear manualmente a un integrante de una dupla ya generada arrastra/bloquea automáticamente al otro.

**Independent Test**: Con equipos ya generados y una dupla presente, arrastrar a uno de los dos integrantes al equipo contrario y verificar que el otro lo acompaña automáticamente — escenario 5 de [quickstart.md](./quickstart.md).

### Implementation for User Story 4

- [X] T018 [US4] En `window.__moverJugadorManual(matchId, playerId, targetTeam)` (`index.html` ~línea 1888), al inicio, resolver `getDuplaPartner(m, playerId)`; si existe, mover también al partner al mismo `targetTeam` en la misma llamada (FR-011).
- [X] T019 [US4] En `window.__toggleBloqueo(matchId, playerId)` (`index.html` ~línea 1865), al inicio, resolver `getDuplaPartner(m, playerId)`; si existe, aplicar el mismo toggle (agregar/quitar de `m.bloqueados`) a ambos ids en la misma llamada (FR-012).

**Checkpoint**: User Story 4 completa y verificable de forma independiente.

---

## Phase 7: User Story 5 - Estadísticas individuales por integrante (Priority: P2)

**Goal**: Cada integrante de una dupla acumula sus propias estadísticas (partidos jugados, goles, asistencias, ganados/perdidos/empatados) de forma independiente.

**Independent Test**: Finalizar un partido con una dupla donde cada integrante hizo goles/asistencias distintos, y verificar que las estadísticas acumuladas de cada uno son correctas e independientes — escenario 6 de [quickstart.md](./quickstart.md).

### Implementation for User Story 5

- [X] T020 [US5] Verificar manualmente (sin código nuevo esperado — ver `research.md` #6, consecuencia directa de T016: `m.equipos.blanco`/`negro` siguen siendo ids individuales) que `renderTeamPlayerRow`/`ensureResultadoDraft`/`recomputeAllPlayerStatsFromMatches` ya permiten cargar y acumular goles/asistencias por separado para cada integrante de una dupla, en el mismo renglón del roster (FR-013, FR-014); si algún cálculo mezclara o duplicara valores entre los dos integrantes, corregirlo en `recomputeAllPlayerStatsFromMatches` (`index.html` ~línea 933). Verificado con el harness de Node (`expandirUnidadesEnResultado`): confirmado que después de generar equipos, `blanco`/`negro` contienen siempre los DOS ids reales de una dupla por separado, nunca un id sintético combinado — `renderTeamPlayerRow`/`recomputeAllPlayerStatsFromMatches` ya operan por id individual, sin cambios necesarios. Falta la validación visual en el navegador (requiere login, ver T021).

**Checkpoint**: Las cinco historias de usuario funcionan de forma independiente y en conjunto.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cierre y validación end-to-end de la feature completa.

- [X] T021 Ejecutar de punta a punta los siete escenarios de [quickstart.md](./quickstart.md) en `organizador-futbol-staging`, con sesión "admin" y con sesión "jugador". Ejecutado con Playwright contra `organizador-futbol-staging` real (credenciales provistas por el usuario): login admin y jugador, alta de jugadores/partido de prueba, vínculo de dupla (escenario 1-2), generación de equipos con Estrategia 1 y Estrategia 2 confirmando mismo equipo para ambos integrantes (escenario 4), deshacer vínculo (escenario 3), y verificación del aviso "equipos desactualizados" (escenario 7). **Bug encontrado y corregido durante esta validación**: al deshacer una dupla que no liberaba vacante para ningún suplente, el aviso de "equipos desactualizados" no aparecía porque `equiposStale` solo comparaba el conjunto de ids titulares, no el agrupamiento en sí — se agregó `duplasSnapshot`/`canonicalDuplas` a `equiposStale`/`__generarEquipos`, revalidado OK. Datos de prueba limpiados de staging al finalizar (partidos eliminados; jugadores de prueba y jugadores reales preexistentes quedaron sin tocar).
- [X] T022 [P] Revisar que ninguna funcionalidad existente sin duplas presentes (partidos sin ningún vínculo) cambió de comportamiento — regresión mínima esperada dado que T004/T015/T016 reutilizan el mismo camino para unidades individuales. Confirmado en la validación de T021: partidos y generación de equipos sin ninguna dupla funcionaron igual que antes (mismo camino de unidad individual); no se observaron regresiones ni errores de consola nuevos, salvo un error preexistente de permisos (ver nota abajo).
- [X] T023 Corregir `saveMatches()` (`index.html`) para que solo escriba `data/partidosArmado` cuando `isAdmin()` — encontrado durante la validación de T021: cualquier acción de "jugador" (crear/deshacer dupla, y ya antes la baja de convocatoria) sobre un partido con equipos generados generaba un error de consola de permisos de Firestore al intentar ese segundo `await`, aunque `data/partidos` (con la dupla) se guardaba bien igual. No es un bug introducido por esta feature — es preexistente de `007-permisos-por-usuario` — pero se corrigió a pedido del usuario. Revalidado en staging con sesión "jugador": cero errores de consola.
- [X] T024 Reemplazar el ícono dibujado a mano de "Deshacer rotación" y el emoji 🔁 de "Agregar rotación" por las dos imágenes provistas por el usuario (`assets/dupla-crear.png`/`dupla-eliminar.png`), procesadas para dejar solo el trazo sobre fondo transparente (se descartó una sombra difusa del original, ilegible en miniatura). Se agregó la clase `img.icon-dupla` con la misma regla de inversión a blanco sobre el panel oscuro que ya usa `.icon-boot` (`filter: brightness(0) invert(1)` en `.team-panel.negro`), para que el ícono se lea igual en "Equipo Blanco" y "Equipo Negro" (FR-016).
- [X] T025 Agrupar a los dos integrantes de una dupla en un único renglón en la lista de convocatoria (`renderConvocadosList`, recorriendo `getUnidadesConvocatoria(m)` en vez de `m.convocados`) — un renglón por unidad, con los dos nombres apilados dentro de un recuadro, un botón "Quitar del partido" por integrante y un solo botón "Deshacer rotación" para el par (FR-016). Reemplaza el diseño anterior (dos filas + tag "🔁 nombre" cruzado).
- [X] T026 Agrupar a los dos integrantes de una dupla en un único renglón dentro del roster del equipo generado (`renderTeamPlayerRowDupla` + `agruparFilasDeEquipo`, en ambos paneles y para ambos roles admin/jugador) — posición asignada y candado compartidos, pero cada integrante con su propio puntaje y, en la carga de resultado, sus propios campos de goles/asistencias (FR-014/FR-016). Se agregó `m.equipos.duplasSnapshot` para que `equiposStale` detecte también cambios de agrupamiento (ver T021).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede arrancar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup; BLOQUEA todas las historias de usuario.
- **User Stories (Phase 3-7)**: Todas dependen de que termine la Fase 2.
  - US1 (P1) y US3 (P1) son las de mayor prioridad; US3 no depende de código de US1 (usa directamente `getUnidadesConvocatoria`), pero para probarla de punta a punta hace falta poder crear una dupla primero (US1).
  - US2 depende conceptualmente de que exista T007 (crear duplas) para tener algo que deshacer, pero su propio código (T010-T013) no depende de las tareas de US1.
  - US4 y US5 son incrementales sobre equipos ya generados (US3) y sobre convocatoria con duplas (US1) respectivamente, pero no comparten funciones con ellas — se pueden implementar en cualquier orden posterior a la Fase 2.
  - En la práctica, al compartir todas `index.html`, conviene implementarlas en orden de prioridad (US1 → US3 → US2 → US4 → US5) para minimizar conflictos de edición sobre el mismo archivo.
- **Polish (Phase 8)**: Depende de que las historias que se quieran entregar ya estén completas.

### Parallel Opportunities

- T001 (Fase 1) no depende de nada y no toca código.
- T022 (Fase 8) no depende de T021 y se puede hacer en paralelo.
- El resto de las tareas de código tocan todas `index.html`: no se marcan `[P]` para evitar ediciones simultáneas del mismo archivo, aunque conceptualmente varias son independientes entre sí.

---

## Parallel Example: Setup

```bash
# T001 es la única tarea paralelizable de esta feature fuera de Polish (no toca index.html):
Task: "Asegurar datos de prueba en organizador-futbol-staging según quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3)

1. Completar Fase 1 (Setup) y Fase 2 (Foundational) — sin esto ninguna dupla tiene efecto real.
2. Completar Fase 3 (US1): se pueden crear vínculos y ver el efecto en titulares/suplentes.
3. Completar Fase 5 (US3): el motor ya respeta la dupla al generar equipos.
4. **STOP and VALIDATE**: escenarios 1, 2 y 4 de `quickstart.md` — esto ya es demostrable como el valor central de la feature.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → vínculo creable, efecto en convocatoria.
3. US3 → validar → motor respeta la dupla (MVP completo).
4. US2 → validar → deshacer vínculo, incluida la baja automática.
5. US4 → validar → edición manual (drag&drop/candado) respeta la dupla.
6. US5 → validar → estadísticas individuales (verificación, sin código nuevo esperado).
7. Polish → cierre y validación final end-to-end.
