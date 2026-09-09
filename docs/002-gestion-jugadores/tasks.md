# Tasks: Gestión de jugadores — implementar goles/asistencias acumulados (FR-014)

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: no hay suite automatizada en el proyecto; se valida manualmente en navegador (ver checkpoint).

**Organización**: cambio acotado a un único punto de escritura en `index.html`.

## Fase única: Acumular goles/asistencias en el jugador al finalizar un partido (FR-014)

- [x] T001 [US4] En `index.html`, dentro de `window.__finalizarPartido(matchId)`: recorre `resultadoDraft.stats` y suma `goles`/`asistencias` a `p.golesTotales`/`p.asistenciasTotales` de cada jugador encontrado en `players`, inicializando en 0 si no existían.
- [x] T002 [US4] En el mismo bloque, se agregó `savePlayers()` después de actualizar los acumulados (además del `saveMatches()` ya existente).
- [x] T003 [US4] Verificado: ningún otro punto de lectura de goles/asistencias fue tocado — siguen leyendo de `m.resultado.statsPorJugador`/`resultadoDraft.stats` como antes; el acumulado es aditivo y sin UI de lectura (FR-014).

**Checkpoint de validación manual**:

1. Cargar goles/asistencias para un jugador en un partido, finalizarlo, y verificar (por consola o inspección del documento en Firestore) que `golesTotales`/`asistenciasTotales` del jugador aumentaron en la cantidad correcta.
2. Finalizar un segundo partido con el mismo jugador: confirmar que el acumulado se **suma** al anterior, no lo reemplaza.
3. Confirmar que la pantalla de Jugadores no muestra estos campos en ningún lado.
4. Confirmar que un jugador que nunca jugó (sin partidos finalizados) no tiene estos campos, o los tiene en 0 — sin romper ninguna lectura existente.

## Notas

- No se agregan Fases de "Setup" ni "Foundational": no hay infraestructura nueva que montar.
- No se modifica el generador de jugadores de prueba (fuera de spec, ver plan.md).
