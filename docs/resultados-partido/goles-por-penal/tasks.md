## 1. Modelo de datos

- [x] 1.1 Agregar `golesPenal` como campo por defecto (0) al inicializar `resultadoDraft.stats[pid]` y al leer `statsPorJugador` existentes, tratando ausencia como 0, y verificar que un partido guardado antes de este cambio se sigue leyendo sin errores
- [x] 1.2 Agregar `golesPenalTotales` (inicializado en 0) al objeto de jugador donde ya viven `golesTotales`/`asistenciasTotales`, y verificar que un jugador nuevo lo tiene en 0

## 2. Carga de resultado (UI de entrada)

- [x] 2.1 Agregar un input numérico `data-tipo="golesPenal"` junto al input de goles en `renderStatsYPuntajeMiembro`, visible solo en modo edición, y verificar visualmente que aparece junto al de goles para cada jugador del roster
- [x] 2.2 Extender el listener sobre `.team-stat-input` para escribir `golesPenal` en `resultadoDraft.stats[pid]` y clampar su valor a no superar `goles` del mismo jugador en el mismo evento de cambio (en cualquier dirección: al subir penales o al bajar goles), y verificar con un caso manual que no se puede dejar `golesPenal > goles`
- [x] 2.3 Extender `actualizarAsistenciasHabilitadas` (o agregar la función equivalente) para deshabilitar/limitar a 0 el input de `golesPenal` cuando el jugador no tiene goles o su equipo no anotó, igual que ya ocurre con asistencias, y verificar que un jugador sin goles no puede ingresar penales

## 3. Ficha del partido (resumen de goleadores)

- [x] 3.1 Actualizar `matchResultSummaryHtml` para agregar el sufijo ` (M de penal)` después del ícono de gol cuando `golesPenal > 0`, sin pluralizar, y dejar igual que antes cuando `golesPenal` es 0, y verificar con un partido de prueba que un jugador con 3 goles y 1 penal se muestra como "Nombre 3⚽ (1 de penal)" y uno con 3 goles y 2 penales como "Nombre 3⚽ (2 de penal)"
- [x] 3.2 Verificar que `teamHeaderTotalText`/`updateTeamTotalsDisplay` no requieren cambios porque ya suman `goles` (que incluye los penales)

## 4. Acumulación de estadísticas de jugador

- [x] 4.1 Actualizar `recomputeAllPlayerStatsFromMatches()` para acumular `golesPenalTotales` sumando `golesPenal` de cada partido, y verificar recalculando sobre datos de prueba que el total coincide con la suma manual
- [x] 4.2 Actualizar el handler inline de "Finalizar partido" para acumular `golesPenalTotales` de la misma forma, y verificar que finalizar un partido con penales deja el mismo resultado que ejecutar el recompute completo

## 5. Pantalla "jugadores" (sin cambios de comportamiento)

- [x] 5.1 Verificar que `renderPlayersTab()` sigue usando únicamente `p.golesTotales` sin leer `golesPenalTotales`, confirmando que la pantalla "jugadores" no muestra ni menciona penales
