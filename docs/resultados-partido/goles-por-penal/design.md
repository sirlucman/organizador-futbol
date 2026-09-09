## Context

Ver `proposal.md` - Why. La app es un único archivo `index.html` sin framework ni tipos; el estado de goles vive en `matches[].resultado.statsPorJugador[jugadorId] = { goles, asistencias }` y se resume en `players[].golesTotales` (ver hallazgos de exploración citados en el proposal). No hay hoy ningún concepto de "tipo de gol".

## Goals / Non-Goals

**Goals:**
- Agregar `golesPenal` como campo hermano de `goles` en `statsPorJugador`, sin romper partidos existentes (campo ausente = 0 penales).
- Reutilizar el patrón de habilitación condicional ya usado para asistencias (`actualizarAsistenciasHabilitadas`) para penales.
- Mantener sin cambios cualquier pantalla/función que no necesite distinguir penales (`renderPlayersTab`, `teamHeaderTotalText`, `updateTeamTotalsDisplay`).

**Non-Goals:**
- No se agrega una pantalla de estadísticas por jugador que muestre penales (queda para un cambio futuro).
- No se modela el gol como una lista de eventos individuales (quién, minuto, tipo); se mantiene el modelo de contadores agregados por jugador y partido.

## Decisions

- **Campo nuevo `golesPenal` (no un array de eventos)**: consistente con el modelo actual de contadores simples (`goles`, `asistencias`). Un array de eventos de gol sería más expresivo pero implicaría migrar todo el modelo existente; fuera de alcance dado que el requerimiento solo pide un conteo por partido.
- **Validación de penales ≤ goles en el punto de entrada (listener de `.team-stat-input`)**: al igual que `actualizarAsistenciasHabilitadas` ya deshabilita/limita asistencias cuando el equipo no anotó, se agrega la misma lógica para el input de penales: se deshabilita o se clampa a 0 si el jugador no tiene goles, y se clampa el valor de penal a no superar el valor de goles del jugador cuando cambia cualquiera de los dos inputs. Se valida en el cliente al escribir en el draft (`resultadoDraft.stats[pid].golesPenal`), no solo al finalizar, para dar feedback inmediato y evitar guardar un estado inconsistente.
- **Acumulado de por vida (`golesPenalTotales`)**: se agrega en paralelo a `golesTotales` en `recomputeAllPlayerStatsFromMatches()` y en el handler de "Finalizar partido", reusando el mismo bucle de acumulación en vez de crear una función separada, para no duplicar lógica de recorrido de partidos.
- **Formato de visualización**: se resuelve en `matchResultSummaryHtml()` al construir cada línea de goleador: si `golesPenal > 0` se agrega el sufijo ` (M de penal)` después del ícono de gol; si es 0, no se agrega nada (comportamiento actual sin cambios).

## Risks / Trade-offs

- [Partidos históricos sin `golesPenal`] → Tratar `golesPenal` ausente como `0` en toda lectura (acumulación, renderizado, validación), sin necesidad de migración de datos.
- [Edición de un partido ya finalizado] → La misma validación de clamp/deshabilitado debe aplicarse tanto en carga inicial como en edición posterior, reusando el mismo listener y el mismo draft state para no duplicar reglas en dos lugares.
- [Inconsistencia si se edita `goles` después de fijar `golesPenal`] → Al bajar el valor de `goles` por debajo del `golesPenal` ya cargado, el listener debe clampar `golesPenal` al nuevo valor de `goles` en el mismo evento de cambio.
