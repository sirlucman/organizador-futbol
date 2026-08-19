# Tasks: Motor de generación de equipos — Estrategia 3 (formación fija)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Tests**: no hay suite automatizada en el proyecto (single-file HTML, ver Testing en plan.md); la validación es manual siguiendo [quickstart.md](quickstart.md).

**Organización**: todas las tareas tocan el mismo archivo (`index.html`), así que dentro de cada fase van secuenciales salvo que se indique `[P]` para bloques de datos claramente independientes (distintas constantes/objetos, sin dependencia funcional entre sí).

## Phase 1: Setup

No aplica: no hay infraestructura nueva que montar (single-file, sin build step, sin dependencias nuevas — ver plan.md Technical Context). Se pasa directo a Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: estructuras de datos que todas las user stories de esta feature necesitan antes de poder implementar el algoritmo, la explicación o la UI de configuración.

**⚠️ CRITICAL**: ninguna tarea de User Story puede empezar hasta cerrar esta fase.

- [X] T001 [P] En `index.html`, extender `CANCHAS` (línea ~678) agregando el campo `formacion: {defensores, volantes, delanteros}` a `futbol8` (`{3,3,1}`) y `futbol9` (`{3,4,1}`), según Decisión 5 de `research.md` y la forma documentada en `data-model.md`. (FR-018)
- [X] T002 [P] En `index.html`, agregar la entrada `estrategia3` a `ESTRATEGIAS` (línea ~682) con `{label, resumen, descripcion}` describiendo "formación fija", siguiendo la forma de las entradas existentes. (FR-001)

**Checkpoint**: con `CANCHAS[...].formacion` y `ESTRATEGIAS.estrategia3` definidos, ya se puede implementar el algoritmo de User Story 1.

---

## Phase 3: User Story 1 - Generar equipos equilibrados automáticamente con Estrategia 3 (Priority: P1) 🎯 MVP de esta feature

**Goal**: el administrador selecciona Estrategia 3 para un partido y el motor arma dos equipos aplicando primero las reglas de arquero de Estrategia 2 y luego completando la formación fija de campo correspondiente al tamaño de cancha (FR-018 a FR-021).

**Independent Test**: generar equipos con Estrategia 3 sobre un mismo conjunto de titulares en los 4 escenarios de `quickstart.md` (formación cumplida, excedente reubicado por secundaria, fallback total, jugador sin puntaje) y verificar que cada resultado respete FR-018 a FR-021, sin tocar el comportamiento de Estrategia 1/2.

### Implementation for User Story 1

- [X] T003 [US1] En `index.html`, crear la función `generarEquiposEstrategia3(titularesPlayers, bloqueados, prevTeamOf, prevPosicionAsignada)`, junto a `generarEquiposEstrategia2` (~línea 1614), reutilizando `resolverArqueros` (línea 1487) exactamente como lo hace `generarEquiposEstrategia2` (líneas 1637-1676) para asignar arqueros antes de resolver la formación. (FR-018, Decisión 4 de research.md) — implementado extrayendo la lógica de arqueros a la función compartida `asignarArquerosPorNiveles`, usada por Estrategia 2 y 3.
- [X] T004 [US1] Dentro de `generarEquiposEstrategia3`, implementar el bucle de asignación de formación sobre los jugadores de campo restantes: iterar posiciones en orden `[Defensor, Volante, Delantero]` y, dentro de cada posición, cada lugar de la formación (`CANCHAS[m.cancha].formacion`) resolviendo Equipo A y Equipo B antes de pasar al siguiente lugar, tomando candidatos de un pool global de titulares aún no asignados (Decisión 2 de research.md; Clarifications del spec). (FR-018, FR-019)
- [X] T005 [US1] Dentro del bucle de T004, para cada lugar aplicar el orden de candidatos de FR-019: (a) naturales con puntaje → (a') naturales sin puntaje → (b) secundarios con puntaje → (b') secundarios sin puntaje, tratando "sin puntaje" siempre como última prioridad de su nivel (Decisión 1 de research.md, Clarifications del spec). (FR-019)
- [X] T006 [US1] Dentro del bucle de T004, implementar el fallback (c) de FR-019: cuando ningún titular tiene esa posición ni como principal ni como secundaria, elegir "cualquier titular disponible" priorizando no alejarse del `diferenciaMaxima` configurado; cuando varios lugares necesiten este fallback en la misma ronda, resolverlos en el orden de posición ascendente ya fijado por el bucle de T004 (Decisión 3 de research.md). (FR-019c)
- [X] T007 [US1] Dentro de `generarEquiposEstrategia3`, implementar FR-020: antes de que un titular natural excedente de una posición (sin lugar en la formación) caiga al fallback de T006, intentar reubicarlo en su mejor posición secundaria que coincida con un lugar vacante de la formación. (FR-020) — se da naturalmente al buscar secundarios sobre el pool global compartido (sin lógica especial de "excedente").
- [X] T008 [US1] En `generarEquiposEstrategia3`, registrar en el resultado los campos `swaps` (con `motivo: 'formacion'` para los casos de T005/T006/T007 que usaron una posición secundaria con puntaje menor a otro candidato disponible, distinto del `motivo: 'imparidad'` de Estrategia 2) y `formacion: {objetivo, equipoA: {cumplida, faltantes}, equipoB: {cumplida, faltantes}}`, marcando `cumplida:false` solo cuando algún lugar de ese equipo se cubrió vía el fallback (c). (FR-021, AC8/AC9 US2, forma definida en data-model.md) — campos finales usan `blanco`/`negro` (no `equipoA`/`equipoB`) para ser consistentes con el resto del resultado.
- [X] T009 [US1] Dentro de `generarEquiposEstrategia3`, repartir cualquier jugador de campo remanente (pool mayor al requerido por la formación) con `repartirBucketBalanceado` (línea 1592), igual que el colchón de Estrategia 2. (FR-006)
- [X] T007b **Bug encontrado en staging** (usuario, 2026-08-18): con un solo arquero natural y ningún candidato por secundaria (AC5), un equipo queda con un integrante menos tras el Paso 1 (arqueros); la cuota de formación fija no compensaba esa diferencia, dando equipos de tamaño desparejo (ej. 9 vs 7) en vez de repartir ese lugar de campo extra al equipo corto. Corregido ajustando `remaining[equipoCorto]` antes de aplicar bloqueados. Verificado con: (a) reproducción manual del caso exacto, (b) fuzz test de 2000 rosters aleatorios (F8/F9, con/sin arqueros, con/sin secundarias) — 0 fallos tras el fix, y (c) reverificación en staging vía Playwright.
- [X] T008c **Fix de permisos encontrado en revisión** (2026-08-18): el campo `formacion` (detalle de qué lugares no se pudieron cubrir por equipo) no estaba en `CAMPOS_EQUIPOS_ARMADO`, así que se guardaba en el documento público `partidos` — visible para cuentas "jugador", igual que `swaps`/`arquerosInfo` no deberían estarlo (ver `.specify/specs/007-permisos-por-usuario/contracts/firestore-rules.md`). Agregado a `CAMPOS_EQUIPOS_ARMADO` para que quede en `partidosArmado` (admin-only), consistente con el resto de la explicación de generación.
- [X] T007c **Segundo bug encontrado por el usuario** (2026-08-18): con roster real, el motor asignó a Esteban Souto (único delantero natural, sin secundarias) como volante y a Gonzalo Zanotto (defensor natural, sin secundarias) como delantero, y no se acercó a la `diferenciaMaxima` configurada aun habiendo margen para hacerlo. Dos causas distintas, ambas corregidas:
  - **Orden de posiciones sin protección**: al procesar Defensor→Volante→Delantero en una sola pasada por posición (natural→secundario→fallback antes de pasar a la siguiente posición), el fallback de Volante podía "gastar" al único delantero natural antes de llegar a la ronda de Delantero. Se reestructuró en 3 pasadas por NIVEL (naturales de las 3 posiciones → secundarios de las 3 posiciones → fallback de las 3 posiciones), preservando el orden Defensor/Volante/Delantero dentro de cada nivel.
  - **Orden de equipos fijo**: dentro de cada ronda, siempre se servía primero a "blanco", dándole sistemáticamente el mejor candidato disponible de cada lugar sin mirar qué equipo iba perdiendo en puntaje (violaba el espíritu de FR-004 dentro de la prioridad de formación). Se agregó `ordenEquiposPorPuntaje()`, que sirve primero al equipo con menos puntaje acumulado en ese momento, igual que ya hace `repartirBucketBalanceado` en Estrategia 2.
  - Verificado con: reproducción manual del caso reportado (diferencia bajó de 18 a 4 puntos con el mismo roster, y ambos jugadores quedaron en su posición correcta) y fuzz test de 3000 rosters aleatorios con puntajes reales (0 fallos de tamaño/duplicados; diferencia de puntaje promedio 5.6 sobre puntajes 0-10 completamente aleatorios).
- [X] T007d **Tercer bug encontrado por el usuario y rediseño del Paso 2** (2026-08-18): con el mismo roster real, Gonzalo Zanotto (defensor natural, sin secundarias) volvió a terminar de volante — donde no suma puntaje — mientras Lucas Manoukian, que sí tiene Volante como secundaria, se quedaba en su lugar natural de Defensor. La causa es de fondo y no se resolvía con otro parche: al decidir posición y equipo en un mismo paso, "quién sobra" en una posición se elegía solo por puntaje, sin mirar si esa persona tiene alguna otra posición donde sume. Se reescribió el Paso 2 en dos niveles independientes:
  - **Nivel de posición** (sin mirar equipos): todos arrancan en su posición natural y se corrigen excedentes contra el cupo global de la formación. Ante un excedente, se mueve primero a quien SÍ tiene otra posición secundaria útil (FR-020) y, entre esos, al de menor puntaje; quien no tiene ninguna alternativa se queda, porque moverlo garantiza que no sume en ningún lado. Los faltantes se cubren con los movidos que tengan esa posición como secundaria (mejor puntaje primero) y, recién si ninguno sirve, con cualquiera (FR-019c).
  - **Nivel de equipo**: ya definido quién juega dónde, cada grupo de posición se reparte entre blanco y negro con `repartirBucketBalanceado`, la misma función ya probada de Estrategia 2.
  - **Paso 5 nuevo — refinamiento final** (FR-004): los pasos anteriores arman los equipos de una sola pasada y nunca revisan el resultado. Se agregó una pasada que busca pares de titulares de la MISMA posición en equipos distintos cuyo intercambio achique la diferencia de puntaje, aplica el mejor y repite hasta que ninguno mejore. Como el intercambio es siempre dentro de la misma posición (y excluye arqueros y bloqueados), la formación y el tamaño de cada equipo quedan intactos; y como solo se aplica si reduce la diferencia, no puede empeorar el balance.
  - `elegirPorMenorDiferencia` quedó sin uso con el rediseño y se eliminó.
  - Verificado, antes y después de tocar el código, simulando contra los puntajes reales de staging: en el partido reportado la diferencia bajó de 1.1 a 0.1, ambos equipos cumplen la formación y el único cambio de posición es el de una dupla que sí tiene esa posición como secundaria (Gonzalo queda de Defensor y Esteban de Delantero). Fuzz de 9000 rosters aleatorios sobre el código ya aplicado: 0 fallos, diferencia promedio 0.67 (antes 5.5) y máxima 6 (antes 27), con igual o mejor cumplimiento de formación. Regresión de Estrategia 2 sobre 3000 rosters: 0 fallos.
- [X] T010 [US1] En `index.html`, extender `window.__generarEquipos` (switch de `estrategiaKey`, ~línea 1850-1853) para invocar `generarEquiposEstrategia3` cuando `estrategiaKey === 'estrategia3'`, sin modificar las ramas existentes de Estrategia 1/2. (FR-001, FR-017)
- [X] T011 [US1] En `index.html`, incluir la opción "Estrategia 3" en el dropdown `#selectEstrategia` (renderizado en `renderTeamsSection`, líneas ~2226-2236) usando la nueva entrada `ESTRATEGIAS.estrategia3` de T002; `bindSelectorEstrategia` (líneas 2209-2217) no debería requerir cambios al ya asignar `m.estrategia = sel.value` genéricamente. (FR-001, FR-011) — confirmado: el dropdown itera `Object.entries(ESTRATEGIAS)` genéricamente, sin cambios de código.

**Checkpoint**: en este punto, seleccionar Estrategia 3 y generar equipos ya produce un resultado válido según FR-018 a FR-021, verificable con los escenarios 1 a 4 de `quickstart.md` (aunque el resumen/explicación todavía no muestre las menciones de formación — eso es User Story 2).

---

## Phase 4: User Story 2 - Ver explicación y resumen de la generación con Estrategia 3 (Priority: P1)

**Goal**: después de generar con Estrategia 3, el administrador ve en el resumen y la explicación si la formación se cumplió en cada equipo, y qué decisiones de formación se tomaron (uso de secundaria con puntaje menor).

**Independent Test**: generar con Estrategia 3 en los escenarios 1, 2 y 3 de `quickstart.md` y verificar que la explicación mencione, según corresponda, la formación cumplida/no cumplida y el uso de secundarias para completarla.

### Implementation for User Story 2

- [X] T012 [US2] En `index.html`, dentro del bloque de explicaciones de `renderTeamsSection` (~líneas 2295-2412), agregar una rama `esEstrategia3` que muestre balance de posiciones y de arqueros (reusando lo que ya se muestra para Estrategia 2) más una mención explícita del cumplimiento de formación por equipo, usando `eq.formacion.equipoA/equipoB.cumplida` de T008 (ej. "Formación 3-3-1 cumplida en ambos equipos" / "No se pudo completar el mediocampo del Equipo B"). (FR-009, AC8 US2)
- [X] T013 [US2] En el mismo bloque de explicaciones, extender el manejo de `eq.swaps` (líneas ~2320-2325, hoy condicionado a `esEstrategia2`) para incluir también `esEstrategia3`, distinguiendo el texto de la mención según `swap.motivo` (`'imparidad'` vs `'formacion'` de T008), cubriendo el caso de secundaria usada con puntaje menor a otro candidato disponible. (AC1 US2, AC9 US2) — de paso se generalizó el filtro de `reglasApagadas` (antes hardcodeado a `'estrategia2'`) para usar `eq.estrategiaKey` genéricamente.

**Checkpoint**: User Story 1 y 2 funcionan juntas de punta a punta — generar con Estrategia 3 y ver la explicación/resumen reflejando exactamente lo que el motor decidió.

---

## Phase 5: User Story 3 - Configurar reglas del motor con Estrategia 3 (Priority: P2)

**Goal**: la sección Configuración muestra "cumplir la formación fija" como invariante no configurable (no como regla apagable), y solo cuando la estrategia relevante es Estrategia 3.

**Independent Test**: con Estrategia 3 seleccionada, abrir Configuración y verificar que "cumplir la formación fija" aparece sin switch, mientras que "Balancear jugadores sin puntaje" sigue configurable (escenario 5 de `quickstart.md`).

### Implementation for User Story 3

- [X] T014 [US3] En `index.html`, agregar a `REGLAS_INVARIANTES` (línea ~737) la entrada informativa `{key: 'formacionFija', label: 'Formación fija', descripcion, soloEnEstrategia: 'estrategia3'}`, según la forma definida en `data-model.md`. (FR-018, Decisión 6 de research.md) — se usó el campo `soloEn` (no `soloEnEstrategia`) para reusar tal cual el filtro genérico que `renderMotorTab` ya aplicaba a invariantes.
- [X] T015 [US3] En la sección de Configuración (`renderMotorTab`), filtrar la lista de invariantes mostrados por `soloEnEstrategia` (mostrar `formacionFija` solo si la estrategia actual/por defecto es `estrategia3`), reusando el mismo patrón de atenuado/filtrado ya usado para reglas `soloEn` de Estrategia 2 (US3 AC6). (US3 AC6, AC8) — sin cambios de código: `renderMotorTab` ya filtraba invariantes por `inv.soloEn === estrategia`, así que T014 solo con el campo `soloEn` alcanzó.

**Checkpoint**: las 3 user stories P1/P1/P2 afectadas por esta feature están completas e independientemente verificables.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: validar que la feature completa funciona de punta a punta y que no rompió nada existente.

- [X] T016 Ejecutar manualmente los 6 escenarios de [quickstart.md](quickstart.md) (formación cumplida, excedente reubicado, fallback total, jugador sin puntaje, invariante no apagable, regresión Estrategia 1/2) y corregir cualquier desvío antes de dar la feature por terminada. Validado en navegador real contra staging (Playwright + servidor local, login admin): partido temporal Fútbol 8 con roster real desbalanceado (9 defensores, 1 arquero, 1 delantero, 4 volantes naturales) — el motor completó formación 1-3-3-1 en ambos equipos combinando naturales, una secundaria real (Gabriel Devoto → Volante, mencionada en la explicación) y fallback FR-019(c) para los lugares sin candidato (Delantero de ambos equipos, un Volante), marcando correctamente la formación como no cumplida en ambos equipos. Escenario 5 (Configuración) confirmado: "Formación fija" aparece como invariante fijo solo con Estrategia 3 seleccionada, "Repartir parejo por puesto" desaparece (soloEn:'estrategia2'), "Repartir a los jugadores sin puntaje" sigue configurable. Escenario 6 (regresión) confirmado sobre el mismo partido: Estrategia 2 y 1 generan igual que antes del refactor de `asignarArquerosPorNiveles`. El partido temporal y el cambio de estrategia por defecto se revirtieron al terminar, sin dejar rastros en staging.
- [X] T017 Actualizar el `Status` del spec (línea 7 de `spec.md`) para reflejar que la Estrategia 3 quedó implementada, siguiendo el mismo estilo usado para los gaps cerrados anteriormente. — se dejó explícito que la validación manual en navegador está pendiente de confirmación.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: sin dependencias — bloquea todo lo demás.
- **User Story 1 (Phase 3)**: depende de Phase 2 completa (T001, T002).
- **User Story 2 (Phase 4)**: depende de Phase 3 completa (necesita `eq.swaps`/`eq.formacion` que produce T008).
- **User Story 3 (Phase 5)**: depende de Phase 2 completa (T001/T002); independiente de Phase 3/4 en términos de código, pero conviene validarla junto a US1 porque ambas dependen de que exista `estrategia3`.
- **Polish (Phase 6)**: depende de que Phase 3, 4 y 5 estén completas.

### Dentro de cada User Story

- T003 → T004 → T005 → T006 → T007 → T008 → T009 (todas dentro de la misma función, orden de implementación sugerido; no son paralelizables entre sí porque construyen la misma función incrementalmente).
- T010 y T011 dependen de que T003-T009 dejen `generarEquiposEstrategia3` funcional (o al menos con firma estable) para conectarla al resto de la app.
- T012 y T013 dependen de T008 (necesitan la forma de `eq.formacion`/`eq.swaps.motivo`).
- T014 → T015 (la UI filtra por el campo que T014 agrega).

### Parallel Opportunities

- T001 y T002 son `[P]`: tocan estructuras de datos distintas (`CANCHAS` vs `ESTRATEGIAS`) sin dependencia entre sí.
- Fuera de eso, casi todo el trabajo cae sobre el mismo archivo (`index.html`) y las mismas funciones, por lo que la paralelización real es limitada — se prioriza el orden secuencial correcto por sobre marcar tareas como `[P]` artificialmente.

---

## Implementation Strategy

### MVP de esta feature (User Story 1 solamente)

1. Completar Phase 2 (Foundational).
2. Completar Phase 3 (User Story 1): con esto, Estrategia 3 ya genera equipos correctamente según FR-018 a FR-021, aunque el resumen todavía no lo explicite.
3. Validar con los escenarios 1-4 de `quickstart.md` antes de seguir.

### Entrega incremental

1. Foundational → Estrategia 3 existe como opción, con datos de formación por cancha.
2. + User Story 1 → el algoritmo funciona de punta a punta (MVP funcional, aunque "opaco").
3. + User Story 2 → el administrador puede confiar en el resultado (explicación completa) — cierra el propósito central del motor (Principio III de la constitución).
4. + User Story 3 → la configuración refleja correctamente el nuevo invariante.
5. Polish → validación end-to-end y regresión de Estrategia 1/2.
