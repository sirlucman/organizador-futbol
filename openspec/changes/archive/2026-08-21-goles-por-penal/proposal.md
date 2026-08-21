## Why

Hoy un gol de penal se registra igual que cualquier otro gol, sin forma de distinguirlo. Se necesita diferenciar cuántos de los goles de un jugador en un partido fueron de penal, para mostrarlo en la ficha del partido y dejar el dato preparado para futuras estadísticas por jugador, sin alterar el comportamiento actual de la pantalla "jugadores".

## What Changes

- Se agrega un contador de "goles de penal" por jugador y por partido, además del contador de goles existente.
- El contador de penales se carga en la pantalla de carga/edición del resultado del partido, con la misma UI/lógica que el contador de goles (input numérico habilitado solo si el jugador tiene goles).
- Regla de validación: los penales convertidos de un jugador no pueden superar sus goles convertidos en ese partido (y por lo tanto un equipo sin goles no puede tener penales).
- En la ficha del partido (resumen de goleadores), cuando un jugador tiene penales convertidos se muestra el formato `Jugador (N, M pen)` (N = goles totales, M = goles de penal). Si no tiene penales, se muestra igual que hoy.
- El total de goles por equipo y el total de goles del jugador (pantalla "jugadores") no cambian: siguen contando el penal como un gol más, sin distinguirlo.
- Se persiste el conteo de penales por jugador a nivel de partido (`statsPorJugador`) y se acumula un total de penales de por vida en el jugador, para uso futuro en estadísticas por jugador — sin exponerlo todavía en ninguna pantalla de agregados.

## Capabilities

### New Capabilities
- `resultados-partido`: registro y visualización de estadísticas de gol por jugador en un partido, incluyendo la distinción entre goles de penal y goles de juego.

### Modified Capabilities
(ninguna — no existen specs previos en `openspec/specs/`; esta es la primera spec del área de resultados de partido)

## Impact

- `index.html`: `renderStatsYPuntajeMiembro` (inputs de carga de resultado), listener sobre `.team-stat-input` y `actualizarAsistenciasHabilitadas` (habilitación de inputs y draft state), `matchResultSummaryHtml` (formato de goleadores en la ficha), `recomputeAllPlayerStatsFromMatches` y el handler de "Finalizar partido" (acumulación de totales de jugador).
- Modelo de datos: `matches[].resultado.statsPorJugador[jugadorId]` gana un campo `golesPenal`; `players[].` gana un campo agregado de por vida (p. ej. `golesPenalTotales`) no mostrado en UI todavía.
- Sin cambios en: `renderPlayersTab` (pantalla "jugadores"), `teamHeaderTotalText`/`updateTeamTotalsDisplay` (totales por equipo).
