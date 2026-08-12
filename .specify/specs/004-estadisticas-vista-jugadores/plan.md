# Implementation Plan: Estadísticas acumuladas en la vista de jugadores

**Branch**: `004-estadisticas-vista-jugadores` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification en `.specify/specs/004-estadisticas-vista-jugadores/spec.md`. Los totales de goles y asistencias ya se acumulan por jugador desde FR-014 de `002-gestion-jugadores`, pero nunca se muestran; los partidos jugados no se acumulan en absoluto todavía.

## Summary

Agregar un campo acumulado nuevo (`partidosJugados`) al jugador, incrementado junto con los goles/asistencias en el mismo punto donde ya se acumulan (al finalizar un partido, y solo para quienes integraron alguno de los dos equipos — la Clarificación de la sesión 2026-08-11 descarta a los suplentes que no llegaron a jugar). Después, mostrar las tres estadísticas (partidos jugados, goles, asistencias) directamente en cada fila del listado de jugadores, con el campo vacío para quien nunca jugó un partido finalizado.

## Technical Context

**Language/Version**: JavaScript (vanilla, sin build step), embebido en `index.html`.

**Primary Dependencies**: Ninguna nueva. Toca `window.__finalizarPartido` (mismo punto que ya acumula `golesTotales`/`asistenciasTotales` desde FR-014) y `renderPlayersTab` (listado de jugadores).

**Storage**: Cloud Firestore, vía `players`. Se agrega un campo nuevo (`partidosJugados`) al documento de jugador; los documentos existentes sin ese campo se leen como "nunca jugó" (campo vacío en la UI), no como 0 — no requiere migración de datos.

**Testing**: No hay suite automatizada en el proyecto. Validación manual: finalizar un partido y confirmar que cada titular convocado suma 1 partido jugado en el listado, que un suplente que no llegó a integrar un equipo no suma nada, y que un jugador nunca convocado sigue mostrando el campo vacío.

**Target Platform**: Navegador (desktop + mobile), sin cambios de plataforma.

**Project Type**: Web app de un solo archivo (`index.html`).

**Performance Goals**: N/A — el cálculo ya ocurre sobre datos en memoria del tamaño acotado que define la constitución (hasta ~500 jugadores/partidos).

**Constraints**: Cambio mínimo y localizado (Constitución, Principio II). El incremento de `partidosJugados` debe reutilizar exactamente la misma población que ya recorre el `forEach` de `golesTotales`/`asistenciasTotales` (los ids de `resultadoDraft.stats`, que `ensureResultadoDraft` ya limita a `equipos.blanco`/`equipos.negro`) — no agregar una segunda fuente de verdad para "quién jugó".

**Scale/Scope**: Un punto de escritura (`__finalizarPartido`) y un punto de lectura/render (`renderPlayersTab`, fila del listado de jugadores).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (specs como fuente de verdad)**: el spec `004-estadisticas-vista-jugadores` ya define FR-001 a FR-006 y la entidad Jugador con el nuevo acumulado; este plan solo traduce eso a los puntos exactos del código. PASA.
- **Principio II (simplicidad)**: se reutiliza el mismo bucle y la misma población (`equipos.blanco`/`negro`) que ya usa FR-014 para goles/asistencias, en vez de crear un mecanismo de conteo paralelo o un modelo de datos nuevo. PASA.
- **Principio III (explicabilidad)**: no aplica — este cambio no toca el motor de generación de equipos ni sus decisiones.
- **Principio IV (arquitectura desacoplada)**: la escritura usa `savePlayers()` y la lectura usa el mismo objeto `players` en memoria que ya consume `renderPlayersTab`, sin asumir detalles de Firestore. PASA.

No hay violaciones que requieran justificar en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/004-estadisticas-vista-jugadores/
├── spec.md               # ya define FR-001 a FR-006 y la entidad Jugador con el acumulado
├── plan.md               # este archivo
└── tasks.md              # generado por /speckit-tasks
```

Sin `research.md` (sin incógnitas técnicas: la fuente de "quién jugó" ya está resuelta por la Clarificación de la sesión 2026-08-11), sin `data-model.md` separado (el modelo ya está descrito en el spec — Key Entities: un campo nuevo, `partidosJugados`, sobre la entidad Jugador ya existente), sin `contracts/` (app interna sin interfaz externa).

### Source Code (repositorio)

```text
index.html
├── window.__finalizarPartido()   # en el mismo forEach que ya acumula golesTotales/asistenciasTotales
│                                    (FR-014), sumar también p.partidosJugados = (p.partidosJugados||0)+1
│                                    — sin tocar la población recorrida (ya es equipos.blanco+negro)
└── renderPlayersTab()             # fila del listado: agregar las 3 estadísticas (partidos jugados,
                                     golesTotales, asistenciasTotales), mostrando el campo vacío cuando
                                     p.partidosJugados es undefined (FR-004) y "0" cuando existe pero es 0
```

**Structure Decision**: cambio puntual dentro de `index.html`, sin nuevos archivos ni módulos, coherente con la arquitectura single-file del proyecto y con el Principio II de la constitución.

## Complexity Tracking

*(sin violaciones a justificar)*
