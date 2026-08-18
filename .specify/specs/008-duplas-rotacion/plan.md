# Implementation Plan: Duplas de rotación entre jugadores

**Branch**: `008-duplas-rotacion` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/008-duplas-rotacion/spec.md`

## Summary

Se agrega la posibilidad de vincular a dos jugadores convocados (o uno convocado y otro no) como "dupla de rotación" dentro de un partido puntual: juntos ocupan una única vacante de titular, el motor de generación los trata como una sola unidad de balance y de invariante de arquero, la edición manual (drag & drop, candado) los mueve/bloquea en conjunto, y cada integrante sigue acumulando sus propias estadísticas (goles/asistencias/partidos jugados). El enfoque técnico evita mutar el orden de `convocados` (que ya funciona hoy por posición en el array): las duplas se registran como una lista de pares `[idA, idB]` dentro del propio documento del partido (`m.duplas`, mismo patrón que `m.bloqueados`), y toda la lógica de titulares/suplentes, del motor y de edición manual pasa a operar sobre una vista derivada de "unidades de convocatoria" (jugador individual o par) calculada en el momento a partir de `convocados` + `duplas`, sin persistir un orden nuevo ni migrar la forma de `convocados`.

## Technical Context

**Language/Version**: JavaScript (ES6+), sin build step, embebido en un único `index.html` (mismo patrón que `007-permisos-por-usuario`).

**Primary Dependencies**: Firebase JS SDK compat v11.0.2 vía CDN (`firebase-app-compat`, `firebase-firestore-compat`, `firebase-auth-compat`) — ya en uso, sin dependencias nuevas.

**Storage**: Cloud Firestore. No se agrega ninguna colección ni documento nuevo: el vínculo de dupla se persiste como un campo nuevo (`duplas`) dentro de cada partido, en el documento blob ya existente `data/partidos` — mismo documento y mismas reglas de acceso que ya usan `convocados`/`bloqueados` (ver `data-model.md`).

**Testing**: Sin suite automatizada en este proyecto (consistente con el resto de la app); validación manual vía `quickstart.md`.

**Target Platform**: Navegador web responsive (mismo target que el resto de la app; ver Principio V).

**Project Type**: Aplicación web de una sola página (sin separación frontend/backend).

**Constraints**: Sin Firebase CLI ni `firebase.json` en el repo — no se requieren cambios de Firestore Security Rules para esta feature (`data/partidos` ya permite lectura/escritura a "admin" y "jugador" desde `007-permisos-por-usuario`; la restricción fina de quién puede deshacer un vínculo se valida en la app, mismo criterio ya aceptado para la baja de convocatoria — ver `research.md` #4).

**Scale/Scope**: Mismo volumen que el resto de la app (hasta ~500 jugadores/partidos); como máximo `jugadoresPorEquipo * 2` convocados por partido (18 en Fútbol 9), por lo que la cantidad de duplas por partido es acotada de forma natural.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| I. Specs como fuente de verdad | Cumple: toda decisión de este plan tiene su FR o clarificación correspondiente en `spec.md` (13 clarificaciones en la sesión 2026-08-15 + 1 en 2026-08-17). |
| II. Simplicidad ante todo | Cumple: se descarta migrar `convocados` a una estructura que agrupe pares (ver `research.md` #2) a favor de una vista derivada calculada en cada render, evitando tocar el formato de datos ya usado por decenas de funciones existentes. |
| III. Explicabilidad del motor | Cumple: el resumen de generación (`m.equipos`, banner de armado) sigue reflejando decisiones reales — se agrega que una dupla se explica como una sola unidad (valor combinado, posición elegida), no dos entradas separadas; no se introduce ninguna regla del motor que no sea explicable. |
| IV. Arquitectura desacoplada y modular | Cumple: la noción de "unidad de convocatoria/armado" se implementa como una capa de lectura sobre `convocados`+`duplas` (nueva función pura), sin que la UI asuma detalles del motor ni el motor asuma detalles de Firestore — mismo patrón de wrappers (`window.storage`, `window.session`) ya usado en el proyecto. |
| V. Responsive por diseño | Cumple: los cambios de interfaz (botón "Agregar rotación", buscador, indicador de vínculo) reutilizan los mismos componentes responsive ya existentes en la fila de convocado (`renderConvocadosList`), sin layouts nuevos atados a resolución. |

**Resultado**: PASS sin excepciones — no se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/008-duplas-rotacion/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No se genera carpeta `contracts/`: esta feature no agrega ni modifica Firestore Security Rules (reutiliza el acceso ya vigente a `data/partidos` desde `007-permisos-por-usuario`) ni ningún otro contrato externo — mismo criterio que `001-organizacion-partidos` y `003-motor-generacion-equipos`, que tampoco tienen `contracts/`.

### Source Code (repository root)

```text
index.html   # Único archivo de la app (~2687 líneas): UI, motor de generación y wrappers
             # window.storage / window.session (ambos ya existentes) se usan sin cambios de forma.
             # Cambios de esta feature, todos dentro de index.html:
             #   - Partido: nuevo campo `duplas: [[idA, idB], ...]` (junto a `convocados`/`bloqueados`).
             #   - Nueva función pura `getUnidadesConvocatoria(m)` (capa derivada, ver data-model.md):
             #     colapsa `convocados` + `duplas` en una lista ordenada de "unidades" (1 o 2 ids).
             #   - `getTitularIds(m)` y el cálculo de titulares/suplentes pasan a apoyarse en esa
             #     lista de unidades en vez de operar directo sobre `convocados`.
             #   - `generarEquiposEstrategia1`/`generarEquiposEstrategia2`/`resolverArqueros` reciben
             #     "unidades de armado" (jugador real o par combinado) en vez de jugadores sueltos.
             #   - `__moverJugadorManual`/`__toggleBloqueo` resuelven el partner de dupla (vía `m.duplas`)
             #     y aplican la misma acción a ambos ids.
             #   - Nuevos handlers `window.__vincularDupla(matchId, idA, idB)` /
             #     `window.__deshacerDupla(matchId, idA_o_idB)`, y UI nueva en `renderConvocadosList`
             #     ("Agregar rotación" / indicador de vínculo + "Deshacer").
             # No se agregan archivos ni módulos nuevos: no hay build step ni framework de componentes
             # que lo justifique (Principio II), mismo criterio que `007-permisos-por-usuario`.
```

**Structure Decision**: Se mantiene la estructura de archivo único (`index.html`) ya usada por toda la app. El único dato nuevo persistido es un campo (`duplas`) dentro de un documento ya existente (`data/partidos`) — no hay cambio de "estructura" del lado de Firestore ni del código fuente más allá de funciones nuevas dentro del mismo archivo.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

Sin violaciones — tabla omitida.
