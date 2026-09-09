# Tasks: Estadísticas acumuladas en la vista de jugadores

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: no hay suite automatizada en el proyecto; se valida manualmente en navegador (ver checkpoints de cada fase).

**Organización**: cambio acotado a dos puntos de `index.html` (un punto de escritura, un punto de render). Sin Fases de "Setup" ni "Foundational" de infraestructura nueva — solo la fase que bloquea a ambas historias por compartir el mismo dato.

## Phase 1: Fundacional — acumular partidos jugados al finalizar (bloquea US1 y US2)

**Propósito**: agregar el dato nuevo (`partidosJugados`) exactamente en el mismo punto donde ya se acumulan `golesTotales`/`asistenciasTotales` (FR-014), para que tanto "verlo en el listado" (US1) como "que se actualice solo" (US2) tengan algo real detrás.

- [x] T001 En `index.html`, dentro de `window.__finalizarPartido(matchId)`, en el mismo `forEach` que ya recorre `resultadoDraft.stats` para sumar `golesTotales`/`asistenciasTotales` (FR-014): agregar `p.partidosJugados = (p.partidosJugados || 0) + 1;`. No agregar un recorrido ni una población nueva — este `forEach` ya está limitado a `equipos.blanco`/`equipos.negro` por `ensureResultadoDraft`, que es exactamente la población que la Clarificación de la sesión 2026-08-11 definió como "jugó" (excluye suplentes que no integraron un equipo).

**Checkpoint**: finalizar un partido con 2+ titulares y, por consola (`players` en memoria) o inspección del documento en Firestore, confirmar que cada titular convocado a ese partido tiene `partidosJugados` incrementado en 1, y que un suplente convocado que no integró ningún equipo no tiene el campo tocado.

---

## Phase 2: User Story 1 - Ver el historial acumulado de cada jugador (Priority: P1) 🎯 MVP

**Goal**: el administrador ve partidos jugados, goles y asistencias de cada jugador directamente en el listado de jugadores, sin abrir otra pantalla.

**Independent Test**: con la Fase 1 ya acumulando datos, finalizar uno o más partidos y verificar en el listado de jugadores que cada titular convocado muestra la cantidad correcta de partidos jugados, goles y asistencias; un jugador nunca convocado a un partido finalizado muestra el campo vacío en las tres.

### Implementation for User Story 1

- [x] T002 [US1] En `index.html`, dentro de `renderPlayersTab()`, en el template de cada fila del listado (`roster.innerHTML = list.map(p => ...)`): agregar un bloque con las 3 estadísticas — `p.partidosJugados`, `p.golesTotales`, `p.asistenciasTotales` — mostrando el campo vacío (mismo criterio visual que ya usa `avg-chip` para "sin puntaje") cuando `p.partidosJugados` es `undefined` (FR-004), y los valores numéricos (con `golesTotales`/`asistenciasTotales` leídos con `|| 0`) cuando `p.partidosJugados >= 1`.
- [x] T003 [P] [US1] En `index.html`, agregar una clase CSS mínima para el nuevo bloque de estadísticas de la fila (reutilizando el patrón visual ya existente de `.avg-chip`/`.row-tags`). No se agregó una regla nueva en `@media (max-width: 480px)`: a diferencia de `.row-tags` (badges que se apilan y se ocultan en mobile), `.row-stats` es una sola línea de texto corto dentro de `.row-main` (`flex:1 1 auto; min-width:0`), que ya envuelve sin romper el layout — agregar una regla ahí hubiera sido complejidad sin necesidad real (Principio II de la constitución).

**Checkpoint**: abrir la pestaña "Jugadores" con partidos ya finalizados (Fase 1) y confirmar de un vistazo, sin clics adicionales, las 3 estadísticas de cada jugador — incluidos los casos: jugador con historial, jugador nunca convocado (campo vacío) y jugador con partidos jugados pero 0 goles/asistencias (debe mostrar "0", no vacío).

---

## Phase 3: User Story 2 - Las estadísticas se actualizan solas al finalizar un partido (Priority: P2)

**Goal**: al finalizar un partido, el listado de jugadores refleja los nuevos totales sin ninguna acción manual adicional.

**Independent Test**: finalizar un partido y, sin recargar datos a mano, volver al listado de jugadores y verificar que ya muestra los totales nuevos.

**Nota**: no requiere código nuevo — la Fase 1 (T001) ya es la actualización automática, y `renderMatchesTab()`/`savePlayers()` ya disparan sin intervención manual dentro del mismo flujo de `__finalizarPartido`. Esta fase es de verificación.

- [x] T004 [US2] Verificado a nivel de lógica (sin suite automatizada en el proyecto, ver plan.md): la misma llamada a `__finalizarPartido` ejecuta el incremento (T001) y dispara `renderMatchesTab()`; `renderPlayersTab()` lee `players` en memoria en cada render, así que el listado de Jugadores refleja los nuevos totales en la siguiente vez que se abre esa pestaña, sin recálculo manual. Simulado con datos de prueba (ver sesión de implementación): 2 partidos finalizados acumulan correctamente 2 PJ/1G/2A.

---

## Phase 4: User Story 3 - El historial se conserva para jugadores inactivos o eliminados del plantel (Priority: P3)

**Goal**: un jugador desactivado sigue mostrando sus estadísticas acumuladas mientras aparezca en el listado.

**Independent Test**: desactivar un jugador con partidos jugados previos y verificar que el listado sigue mostrando los mismos valores.

**Nota**: no requiere código nuevo — `window.__toggleEstado` no toca `partidosJugados`/`golesTotales`/`asistenciasTotales`, y T002 lee esos campos del mismo objeto `p` sin filtrar por `estado`. Esta fase es de verificación.

- [x] T005 [US3] Verificado por lectura de código: `window.__toggleEstado(id)` solo modifica `p.estado`; no toca `partidosJugados`/`golesTotales`/`asistenciasTotales`. `renderPlayersTab()` calcula `statsText` a partir de esos mismos campos sin filtrar por `estado`, por lo que un jugador desactivado sigue mostrando su historial acumulado sin cambios.

---

## Dependencies & Execution Order

- **Fase 1 (Fundacional)**: sin dependencias — bloquea las Fases 2 y 3 (ambas necesitan que `partidosJugados` exista y se incremente correctamente).
- **Fase 2 (US1)**: depende de Fase 1. T003 puede hacerse en paralelo con T002 (T003 es CSS, T002 es el markup que la usa) pero conviene hacer T002 primero para saber qué clases hacen falta.
- **Fase 3 (US2)**: depende de Fase 1 y Fase 2 (para poder verificar visualmente el resultado). Sin tareas de código propias.
- **Fase 4 (US3)**: depende de Fase 2 (para poder verificar visualmente el resultado). Sin tareas de código propias.

## Implementation Strategy

### MVP (mínimo con valor visible)

1. Fase 1 (T001) — sin esto no hay dato que mostrar.
2. Fase 2 (T002, T003) — con esto el pedido original ("agregar partidos jugados, goles y asistencias a la vista de jugadores") ya está cumplido y visible.
3. Fases 3 y 4 son verificación de que no se rompió nada ya vigente (FR-003, FR-005) — no agregan UI ni datos nuevos.

## Notas

- No se agregan Fases de "Setup" ni "Foundational" de infraestructura: no hay proyecto que inicializar, dependencias que instalar ni build step (single-file `index.html`).
- No se generan tareas de test automatizado: el proyecto no tiene suite de tests (ver `plan.md`, sección Testing).
