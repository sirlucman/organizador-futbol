# Research: Estrategia 3 (formación fija)

**Input**: Technical Context de [plan.md](plan.md). No quedaron `NEEDS CLARIFICATION` sin resolver: las 3 ambigüedades de algoritmo se cerraron en la sesión de `/speckit-clarify` del 2026-08-18 (ver `## Clarifications` en [spec.md](spec.md)). Este documento consolida esas decisiones más las de implementación derivadas de explorar el código existente, para que `/speckit-tasks` no tenga que volver a investigarlas.

## Decisión 1: Tratamiento de jugadores sin puntaje en la asignación de formación

- **Decision**: dentro de cada nivel de candidatos de FR-019 (a: principal, b: secundaria), un jugador sin puntaje cargado en esa posición se considera con la prioridad más baja de ese nivel — se lo elige solo si no queda ningún candidato con puntaje disponible en ese mismo nivel y lugar.
- **Rationale**: consistente con FR-006, que ya excluye a estos jugadores del cálculo de puntaje total; no inventa un valor (descartado: puntaje neutro/promedio) ni los saca de la lógica de formación (descartado: rompería SC-006, la formación podría no completarse aun habiendo candidato disponible).
- **Alternatives considered**: puntaje neutro/promedio (rechazado: introduce una ambigüedad nueva sobre cómo promediar); excluir de la formación y repartir al final (rechazado: contradice la prioridad formación > puntaje de FR-018).

## Decisión 2: Orden de armado de ambos equipos

- **Decision**: el motor resuelve ambos equipos en simultáneo, lugar por lugar (ej. decide el Defensor #1 de Equipo A y de Equipo B antes de pasar al Defensor #2), tomando siempre candidatos de un pool global de titulares aún no asignados. Nunca completa un equipo entero antes de empezar el otro.
- **Rationale**: evita que el equipo procesado primero se quede sistemáticamente con los mejores candidatos a costa del segundo, especialmente relevante en el fallback FR-019(c). Coherente con el Principio II (mecanismo simple: un solo bucle sobre lugares de formación, no una fase por equipo).
- **Alternatives considered**: equipo por equipo (rechazado: sesga la calidad de asignación a favor del primer equipo armado en casos límite).

## Decisión 3: Orden de resolución cuando varios lugares necesitan el fallback FR-019(c) simultáneamente

- **Decision**: orden de posición ascendente — Defensor, Volante, Delantero (el arco ya se resolvió antes, vía la lógica de FR-005) — el mismo orden ya usado para mostrar jugadores dentro de un equipo (FR-007).
- **Rationale**: reutiliza una convención de orden que el spec ya establece en vez de introducir un criterio nuevo (ej. "lugar más difícil de cubrir primero"), manteniendo el algoritmo simple y predecible/testeable.
- **Alternatives considered**: orden por menor cantidad de candidatos restantes (rechazado: agrega una heurística adicional sin beneficio claro dado el volumen acotado de jugadores por partido).

## Decisión 4: Reutilización de la lógica de arqueros de Estrategia 2

- **Decision**: `generarEquiposEstrategia3` invoca la misma lógica de resolución de arqueros que usa `generarEquiposEstrategia2` (naturales primero, secundarios solo si falta alguno, ver `resolverArqueros` en `index.html:1487` y su uso en `generarEquiposEstrategia2` líneas 1637-1676), sin duplicar el código, antes de calcular la formación fija sobre los jugadores de campo restantes.
- **Rationale**: FR-018 exige exactamente las mismas reglas de arquero que FR-005; duplicar la lógica violaría el Principio II y crearía riesgo de divergencia futura entre estrategias (violaría también el Principio IV — reglas que se agregan sin modificar las existentes, FR-017).
- **Alternatives considered**: reimplementar la lógica de arqueros dentro de la nueva función (rechazado: duplicación innecesaria).

## Decisión 5: Extensión del catálogo de canchas→formación

- **Decision**: se agrega a la estructura `CANCHAS` (index.html:678-681) la formación objetivo de campo por cancha: `futbol8 → {defensores:3, volantes:3, delanteros:1}`, `futbol9 → {defensores:3, volantes:4, delanteros:1}`. Un tamaño de cancha sin formación definida queda fuera de alcance (Edge Case ya documentado en el spec) — no se implementa ningún fallback de formación genérica.
- **Rationale**: `CANCHAS` ya es la fuente de verdad de tamaño de cancha (`jugadoresPorEquipo`) consumida por `titularesRequeridos(m)`; agregar la formación ahí evita crear una segunda estructura paralela de mapeo cancha→formación.
- **Alternatives considered**: estructura nueva separada `FORMACIONES_POR_CANCHA` (rechazado: fragmenta la fuente de verdad de "qué implica cada tamaño de cancha" sin necesidad).

## Decisión 6: Invariante "cumplir formación fija" fuera de `REGLAS_CATALOGO`

- **Decision**: no se agrega como entrada de `REGLAS_CATALOGO` (que es para reglas configurables); se agrega como entrada informativa en `REGLAS_INVARIANTES`, visible en la UI de Configuración solo cuando la estrategia por defecto/actual es Estrategia 3, análogo a cómo hoy se atenúan reglas de "scope Estrategia 2" cuando está activa Estrategia 1 (US3 AC6).
- **Rationale**: FR-018 dice explícitamente que cumplir la formación es un invariante no configurable, igual que arqueros y balance de puntaje — no debe aparecer con switch de habilitar/deshabilitar.
- **Alternatives considered**: agregarlo a `REGLAS_CATALOGO` con `siempreFija:true` como se hizo con `puntaje` (rechazado: `puntaje` es un invariante que aplica a *todas* las estrategias; este invariante nuevo aplica *solo* a Estrategia 3, y `REGLAS_CATALOGO` no tiene hoy un mecanismo de "invariante condicionado a una estrategia" — forzarlo ahí requeriría lógica adicional en `reglaEsNucleo`/`normalizeMotorConfig` que `REGLAS_INVARIANTES` ya evita al ser puramente informativo).
