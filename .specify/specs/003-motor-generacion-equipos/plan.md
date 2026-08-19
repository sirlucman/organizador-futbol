# Implementation Plan: Motor de generación de equipos — Estrategia 3 (formación fija)

**Branch**: `003-motor-generacion-equipos` | **Date**: 2026-08-18 | **Spec**: [spec.md](spec.md)

**Input**: Actualización del spec del 2026-08-18 (FR-018 a FR-021, AC10-13 de US1, AC8-9 de US2, AC8 de US3) que agrega la Estrategia 3 (formación fija): además de las reglas de arquero de la Estrategia 2, intenta completar en cada equipo una formación de posiciones fija según el tamaño de cancha (3-3-1 para cancha de 8, 3-4-1 para cancha de 9), con prioridad fija arquero > formación > diferencia de puntaje (best effort). El plan anterior (cerrar el gap del invariante "Balancear puntaje") ya está implementado (ver `tasks.md`, todas las tareas cerradas); este plan cubre únicamente el trabajo nuevo de la Estrategia 3.

## Summary

Agregar una tercera estrategia de generación (`generarEquiposEstrategia3`) que reutiliza la resolución de arqueros de la Estrategia 2 (FR-005) y luego completa, lugar por lugar y en simultáneo para ambos equipos, una formación fija de posiciones de campo determinada por el tamaño de cancha del partido, con fallback a "cualquier titular disponible" cuando ningún candidato natural o secundario puede cubrir un lugar. Se extiende el catálogo de estrategias, la sección de Configuración (para reflejar que "cumplir la formación" no es una regla apagable), y la explicación/resumen de generación (para reportar si la formación se cumplió).

## Technical Context

**Language/Version**: JavaScript (vanilla, sin build step), embebido en `index.html`.

**Primary Dependencies**: Ninguna nueva. Se extiende el motor ya existente en `index.html` (`ESTRATEGIAS`, `CANCHAS`, `REGLAS_CATALOGO`, `REGLAS_INVARIANTES`, `generarEquiposEstrategia2`, `resolverArqueros`, `repartirBucketBalanceado`, `explicacionesGeneracion`).

**Storage**: Cloud Firestore, vía `motorConfig` (configuración global) y el documento de partido (`m.estrategia`, `m.cancha`). Sin cambios de esquema: la Estrategia 3 es un valor más de `m.estrategia` (`'estrategia3'`), y usa `m.cancha` (ya existente) para determinar la formación objetivo.

**Testing**: No hay suite automatizada en el proyecto (single-file HTML). Validación manual en navegador: generar equipos con Estrategia 3 en distintos escenarios de pool de titulares (formación completa, excedentes, faltantes, sin candidatos).

**Target Platform**: Navegador (desktop + mobile), sin cambios de plataforma.

**Project Type**: Web app de un solo archivo (`index.html`).

**Performance Goals**: N/A — el algoritmo de asignación opera sobre como mucho ~18 titulares (cancha de 9); sin impacto de performance relevante.

**Constraints**: La formación fija es un invariante no configurable, exclusivo de Estrategia 3 (Constitución, Principio II — no se generaliza el mecanismo de invariantes a "invariantes condicionados por estrategia" más allá de lo estrictamente necesario para esto). El algoritmo MUST resolver ambos equipos en simultáneo, lugar por lugar, desde un pool global de titulares no asignados, en orden de posición ascendente (Defensor, Volante, Delantero) cuando haga falta el fallback de FR-019(c) — definido en `## Clarifications` del spec.

**Scale/Scope**: Cambio acotado a `index.html`: una nueva función de generación, extensión del catálogo de estrategias y de canchas→formación, extensión de la UI de Configuración y de la explicación de generación. No afecta otras features ni el modelo de datos de Jugador/Partido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (specs como fuente de verdad)**: el spec ya define completamente el comportamiento de Estrategia 3 (FR-018 a FR-021) y las 3 ambigüedades de algoritmo quedaron resueltas en `## Clarifications` (sesión 2026-08-18) antes de este plan. PASA.
- **Principio II (simplicidad)**: se reutiliza `resolverArqueros`/lógica de arqueros de Estrategia 2 tal cual, sin duplicarla; la asignación de formación se implementa como una función nueva y acotada, sin generalizar el motor a un sistema de "formaciones configurables" que el spec no pide (solo 3-3-1 y 3-4-1, hardcodeadas). PASA.
- **Principio III (explicabilidad)**: toda decisión de formación (uso de secundaria con puntaje menor, fallback FR-019(c), cumplimiento o no de la formación) se refleja en la explicación de generación (FR-009, FR-018 a FR-021, AC8-9 de US2). Se planifica explícitamente en Phase 1. PASA.
- **Principio IV (arquitectura desacoplada)**: la nueva función vive en la misma capa que `generarEquiposEstrategia2` (motor), sin acoplarse a detalles de Firestore ni de la UI; la UI solo lee el resultado y el catálogo de estrategias/canchas. Se agrega sin modificar `generarEquiposEstrategia1`/`generarEquiposEstrategia2` existentes (FR-017). PASA.
- **Principio V (responsive)**: no se agregan pantallas nuevas; se extiende el dropdown de estrategia y el resumen de generación ya existentes, ambos ya responsive. PASA.

No hay violaciones que requieran justificar en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/003-motor-generacion-equipos/
├── spec.md               # actualizado 2026-08-18 (FR-018 a FR-021 + Clarifications)
├── plan.md               # este archivo
├── research.md           # Phase 0 (este plan)
├── data-model.md         # Phase 1 (este plan)
├── quickstart.md         # Phase 1 (este plan)
└── tasks.md              # se regenera con /speckit-tasks (el actual es del gap ya cerrado)
```

No se genera `/contracts/`: la app es de un solo archivo sin interfaz externa (API/CLI); el "contrato" relevante es el resultado de `generarEquiposEstrategia3` documentado en `data-model.md`.

### Source Code (repositorio)

```text
index.html
├── CANCHAS                          # agregar formación objetivo por cancha: { defensores, volantes, delanteros }
├── ESTRATEGIAS                      # agregar entrada 'estrategia3' (label, resumen, descripcion)
├── REGLAS_INVARIANTES               # agregar entrada informativa "Formación fija" (solo visible/aplicable si estrategia===3)
├── generarEquiposEstrategia3()      # nueva función: arqueros (reusa lógica de Estrategia 2) → asignación de formación lugar-por-lugar (FR-019/020) → resto vía repartirBucketBalanceado si sobran lugares no-formación
├── window.__generarEquipos          # extender el switch de estrategiaKey (línea ~1850) para llamar a generarEquiposEstrategia3
├── renderTeamsSection (bloque de explicaciones ~2295-2412)  # agregar rama esEstrategia3: mención de formación cumplida/no cumplida por equipo, y de usos de secundaria con puntaje menor (AC9 US2)
├── bindSelectorEstrategia / #selectEstrategia  # incluir la nueva opción en el dropdown existente
└── renderMotorTab / sección Configuración      # ocultar "cumplir formación fija" como regla apagable cuando estrategia===3 (igual tratamiento que los invariantes existentes)
```

**Structure Decision**: cambios puntuales dentro del único archivo existente (`index.html`), siguiendo el mismo patrón que `generarEquiposEstrategia2` — sin nuevos archivos, módulos ni dependencias, coherente con la arquitectura single-file del proyecto y con el Principio II.

## Complexity Tracking

*(sin violaciones a justificar)*
