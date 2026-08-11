# Implementation Plan: Gestión de jugadores — implementar goles/asistencias acumulados (FR-014)

**Branch**: `002-gestion-jugadores` | **Date**: 2026-08-11 | **Spec**: [spec.md](spec.md)

**Input**: Gap identificado en `Roadmap.md` ("Pendientes de v1"): FR-014 del spec define que el jugador debe acumular goles y asistencias a través de los partidos, pero el código solo guarda ese resultado por partido, nunca lo propaga al jugador. Este plan cubre únicamente ese gap — el resto del spec ya está implementado y no se replanifica.

## Summary

Al finalizar un partido, sumar al jugador (no solo al partido) los goles y asistencias que hizo en ese partido, en dos campos acumulados nuevos. No se muestran en la pantalla de jugadores (reservados para una futura sección de Estadísticas, según ya define el spec).

## Technical Context

**Language/Version**: JavaScript (vanilla, sin build step), embebido en `index.html`.

**Primary Dependencies**: Ninguna nueva. Toca `window.__finalizarPartido` (única transición que fija el resultado de un partido) y el modelo de Jugador.

**Storage**: Cloud Firestore, vía `players` (colección de jugadores) y `matches` (colección de partidos, con `m.resultado.statsPorJugador`). El fix agrega dos campos nuevos al documento de jugador; campos ausentes en documentos viejos deben leerse como 0 (no requiere migración de datos existentes).

**Testing**: No hay suite automatizada en el proyecto. Validación manual: finalizar un partido con goles/asistencias cargados y confirmar que el jugador acumula esos valores; finalizar un segundo partido y confirmar que se suma, no se reemplaza.

**Target Platform**: Navegador (desktop + mobile), sin cambios de plataforma.

**Project Type**: Web app de un solo archivo (`index.html`).

**Performance Goals**: N/A.

**Constraints**: Cambio mínimo y localizado (Constitución, Principio II). No tocar los generadores de jugadores de prueba (líneas ~728 y ~1743, marcados explícitamente como "no forma parte de la spec") ni las pantallas de jugadores — FR-014 exige explícitamente que esto no se muestre ahí todavía.

**Scale/Scope**: Un solo punto de escritura (`__finalizarPartido`) y los sitios donde se lee `goles`/`asistencias` de un jugador quedan sin cambios (siguen leyendo del partido, no del acumulado — el acumulado es aditivo, no reemplaza nada existente).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (specs como fuente de verdad)**: el spec ya define FR-014 y el campo en Key Entities; este plan solo alinea el código. PASA.
- **Principio II (simplicidad)**: un único punto de escritura (`__finalizarPartido`), sin nuevas abstracciones ni capas. PASA.
- **Principio III (explicabilidad)**: no aplica — este cambio no afecta al motor de generación de equipos.
- **Principio IV (arquitectura desacoplada)**: la escritura del acumulado usa `savePlayers()`, la misma interfaz de persistencia ya desacoplada que usa el resto de la gestión de jugadores. PASA.

No hay violaciones que requieran justificar en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-gestion-jugadores/
├── spec.md               # ya define FR-014 y la entidad Jugador con el acumulado
├── plan.md               # este archivo
└── tasks.md              # generado por /speckit-tasks
```

Sin `research.md` (sin incógnitas técnicas), sin `data-model.md` separado (el modelo ya está descrito en el spec — Key Entities), sin `contracts/` (app interna sin interfaz externa).

### Source Code (repositorio)

```text
index.html
├── window.__finalizarPartido()   # al fijar m.resultado, recorrer statsPorJugador y sumar
│                                    goles/asistencias a cada Jugador correspondiente
└── (lectura) p.golesTotales / p.asistenciasTotales  # nuevos campos, leídos con "|| 0" donde
                                     falten en documentos existentes — sin UI que los muestre
```

**Structure Decision**: cambio puntual dentro de `index.html`, sin nuevos archivos ni módulos, coherente con la arquitectura single-file del proyecto.

## Complexity Tracking

*(sin violaciones a justificar)*
