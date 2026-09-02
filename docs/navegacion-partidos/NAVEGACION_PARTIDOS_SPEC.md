# Partido en dos columnas — Spec

> **Status:** Draft · **Date:** 2026-09-02 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [NAVEGACION_PARTIDOS_CONCEPT.md](./NAVEGACION_PARTIDOS_CONCEPT.md)
>
> **Implementation plan:** [NAVEGACION_PARTIDOS_IMPLEMENTATION_PLAN.md](./NAVEGACION_PARTIDOS_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5 *Sources &
> Origins* del Concept Note. Donde un `FR-*`/`NFR-*`/`TC-*` se apoya en una ubicación de
> código, un contrato de componente o una Spec vigente que el Concept Note no cubre, la
> cita va **en línea** en la sección donde se define el requisito.

## 1. Purpose

Esta Spec define el comportamiento del layout de dos columnas de la pantalla de partido
(turnos `12a`/`12b`/`12c`, `13a`, `14a` del proyecto de diseño "Diseño de equipos en
cancha"), que reemplaza el apilado vertical actual de convocados y equipos —el origen del
scroll cruzado que motiva esta feature, ver Concept Note §2— por dos columnas visibles a
la vez: qué se muestra en cada columna, cómo se resuelve en viewports angostos, y cómo
se comporta el empty state cuando los equipos todavía no se generaron. No cubre el motor
de generación de equipos ni el modelo de carga de resultados (ver Concept Note §4) — ambos
se reutilizan sin cambios. El detalle de implementación (archivos, funciones exactas,
orden de branches) vive en el Implementation Plan.

## 2. Summary

Hoy la pantalla de un partido apila la cola de convocados arriba del panel de equipos
generados. Esta feature los pone lado a lado en desktop — convocados en una columna fija
de 352px, equipos en una columna flexible — con un empty state propio cuando los equipos
todavía no se generaron, y el mismo layout de dos columnas (en modo lectura) para un
partido finalizado. En viewports angostos, un switch de dos pestañas reemplaza las dos
columnas, y la carga de resultado vive dentro de ese mismo switch. La aplicación sigue
siendo la misma herramienta de armado de equipos y carga de resultados; lo que cambia es
cómo se distribuye esa información en pantalla, no qué información existe.

## 3. Scope

### 3.1 In scope

- El layout de dos columnas en `#matchDetailView` para viewports anchos (`12a`).
- El empty state del panel de equipos cuando no hay titulares o cuando hay titulares
  pero los equipos no se generaron (`12b`).
- El mismo layout de dos columnas, en modo lectura, para un partido finalizado (`12c`).
- El switch de dos pestañas para viewports angostos (`13a`).
- La reubicación de la carga de resultado dentro de ese switch, incluyendo el botón "+"
  nuevo en cada fila de detalle (`14a`).

### 3.2 Out of scope / non-goals

- El sistema shall no modificar el motor de generación de equipos, sus estrategias, ni
  sus reglas.
- El sistema shall no modificar el modelo de eventos de la rebanada 5 ni las funciones de
  agregar/quitar evento de la rebanada 6 — se reutilizan tal cual (ver §4 TC-004/TC-005).
- El sistema shall no implementar `13b` (apilado con convocatoria plegada al pie).
- El sistema shall no rediseñar los botones de ciclo de vida del header (Reabrir/Cerrar
  inscripción, Eliminar partido) más allá de un posible restyle visual.
- El sistema shall no implementar el scroll `sticky` de la columna de convocados
  (`OPEN-Q-04` del Concept Note, queda para una Spec futura).
- El sistema shall no implementar la pastilla de puesto en la camiseta (turnos 9/10/11).

### 3.3 Constraints inherited from the Concept Note

- **D-01** (grid de dos columnas, 352px fijo / flexible) — inherited; esta Spec define el
  comportamiento exacto en §7.1.
- **D-02** (switch de pestañas en viewports angostos, reemplaza el apilado actual) —
  inherited; ver §7.3.
- **D-03** (`14a` se implementa junto con `13a`) — inherited; ver §7.4.
- **D-04** (empty state usa `EmptyState` del design system pero conserva las dos
  condiciones de validación existentes) — inherited; ver §7.2.
- **D-05** (diseño gana caso por caso, no automáticamente) — inherited como principio de
  resolución de conflictos, no como requisito verificable; no genera un `FR`/`TC` propio.
- **D-06** (el subtítulo de estrategia aplicada NO se implementa en `12c`) — inherited;
  ver `TC-006`.
- **D-07** (los botones de header existentes no cambian de comportamiento) — inherited;
  ver §3.2.
- Se hereda también, sin cambios, el modelo de permisos de
  [`007-permisos-por-usuario`](../../.specify/specs/007-permisos-por-usuario/spec.md) y
  las restricciones de rol `jugador` de
  [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)
  `FR-046`/`FR-081`: el layout de dos columnas no cambia qué ve cada rol, solo cómo se
  distribuye en pantalla.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — El layout de dos columnas (`FR-001`) shall reutilizar los componentes ya
  vendorizados del `football-app-design-system` (`Card`, `EmptyState`, `Badge`,
  `TextInput`) en vez de introducir un sistema de componentes paralelo.

### 4.2 Architectural / integration constraints

- **TC-002** — La columna izquierda de convocados (`FR-001`) shall reutilizar
  `renderConvocadosList` ([index.html:5739-5814](../../index.html#L5739-L5814)) sin
  reescribir su lógica de arrastre/orden.
- **TC-003** — La columna derecha de equipos (`FR-001`) shall reutilizar
  `renderZonaEquipos`/`renderCanchaEquipo` sin reescribir el render de cancha/camiseta.
- **TC-004** — El botón "+" de cada fila de detalle (`FR-013`/`FR-014`) shall invocar la
  misma función de agregar evento que ya usa el toque sobre la camiseta
  (`CARGA_POR_TOQUE_SPEC.md` `FR-030`/`FR-031`), sin duplicar lógica de creación de
  eventos.
- **TC-005** — El botón "−" de cada fila de detalle (ya existente) shall seguir
  invocando exactamente la misma función que hoy (`CARGA_POR_TOQUE_SPEC.md` `FR-051`),
  sin cambios de comportamiento.
- **TC-006** — El encabezado del partido finalizado (`FR-004`) shall **no** mostrar la
  estrategia aplicada como subtítulo, preservando la decisión ya tomada en código
  (`FR-084`, `D-25` de
  [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)).
  Grounded en `Concept Note D-06`.
- **TC-007** — El switch mobile (`FR-009`) shall **reemplazar** el CSS de
  [index.html:518-528](../../index.html#L518-L528) (el `@media (max-width: 900px)` que
  hoy cae a una sola columna dentro de `.teams-wrap`), no coexistir con él ni duplicar la
  regla.

### 4.3 Compliance / regulatory constraints

*Ninguna* — ver Concept Note §5.2, sin datos regulados.

### 4.4 Conventions to follow

- **TC-030** — Todo test que verifique un `FR-*`/`NFR-*`/`TC-*` de esta Spec shall
  embeber su identificador en forma canónica dentro de un literal de cadena, siguiendo la
  convención ya usada por las rebanadas de "Equipos en el campo" (`AGENTS.md` § Tests).

### 4.5 Security constraints (`MD-31`)

`Security constraints: none — see Concept §5.2 posture.` Sin input externo no confiable,
sin datos regulados, sin superficie de despliegue nueva — ninguna categoría del CWE Top
25 aplica a este cambio de layout. (`TC-006`, la decisión de no mostrar la estrategia
aplicada, no defiende ningún CWE — es un constraint de contenido, no de seguridad; vive
en §4.2.)

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Admin | Organiza los partidos: convoca jugadores, genera equipos, carga el resultado | Ver convocados y equipos generados juntos, sin scroll cruzado; cargar el resultado rápido desde el celular |
| Jugador | Consulta los partidos del grupo | Ver quién quedó en qué equipo y el resultado, de solo lectura, en el mismo layout que el admin |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como admin, quiero ver convocados y equipos generados lado a lado, para no scrollear entre la cola y la cancha. | FR-001, FR-002, FR-003 |
| US-02 | Como admin, quiero arrastrar un suplente a titular sin perder de vista el panel de equipos. | FR-002 |
| US-03 | Como admin o jugador, quiero un empty state claro cuando los equipos todavía no se generaron. | FR-005, FR-006, FR-007, FR-008 |
| US-04 | Como admin o jugador, quiero ver un partido finalizado en el mismo layout de dos columnas, de lectura. | FR-004 |
| US-05 | Como admin, en el celular, quiero un switch de una pestaña a la vez en vez de scrollear un apilado largo. | FR-009, FR-010, FR-011, FR-012 |
| US-06 | Como admin, en el celular, con la inscripción cerrada quiero entrar directo a cargar el resultado. | FR-010 |
| US-07 | Como admin, en el celular, quiero sumar un evento a una fila de detalle sin volver a tocar la camiseta. | FR-013, FR-014 |

## 6. Glossary

| Term | Definition |
|---|---|
| Convocado | Jugador (o dupla de rotación) anotado para un partido, sea titular o suplente. |
| Titular / Suplente | Convocado que entra o no en la formación inicial, según su posición en la cola de convocatoria. |
| Dupla | Dos jugadores que rotan como una sola unidad de convocatoria. |
| Cancha | Representación visual del equipo generado, con una camiseta por jugador ubicada según su posición en la formación. |
| Camiseta | Elemento visual individual dentro de la cancha que representa a un jugador o dupla. |
| Switch (mobile) | Control de dos pestañas que muestra un panel a la vez por debajo del breakpoint (`A-01`). |
| Fila de detalle | Renglón bajo la cancha, uno por jugador y familia de evento con al menos un evento cargado (definido en `CARGA_POR_TOQUE_SPEC.md`). |
| Familia de evento | Agrupación de tipos de evento que comparte una fila de detalle y un botón "−"/"+" (definido en `CARGA_POR_TOQUE_SPEC.md`). |
| Breakpoint | Ancho de viewport en el que el layout de dos columnas cede al switch mobile (`A-01`). |

## 7. Functional requirements

### 7.1 Layout de dos columnas (desktop)

- **FR-001** — While el viewport es ≥ el breakpoint (`A-01`), el sistema shall mostrar la
  convocatoria y el panel de equipos generados como dos columnas dentro de
  `#matchDetailView`: una columna izquierda de 352px con la convocatoria, y una columna
  derecha flexible con el panel de equipos.
- **FR-002** — El sistema shall reutilizar, sin cambios de comportamiento, la lógica de
  arrastre de `renderConvocadosList` (mover un suplente a titular y viceversa) dentro de
  la columna izquierda.
- **FR-003** — El sistema shall reutilizar, sin cambios de comportamiento,
  `renderZonaEquipos`/`renderCanchaEquipo` dentro de la columna derecha.
- **FR-004** — Where `m.estado === 'Finalizado'` y no hay edición de resultado en curso,
  el sistema shall usar el mismo layout de dos columnas (`FR-001`), con la columna
  izquierda de convocados en modo lectura (sin buscador, sin botón de quitar, sin
  arrastre) y la columna derecha mostrando el resultado y las camisetas con estadísticas.

### 7.2 Empty state del panel de equipos

- **FR-005** — When no hay titulares convocados (`titularIds.length === 0`), el sistema
  shall mostrar en la columna derecha un componente `EmptyState`
  ([`_ds_bundle.js:528-535`](../equipos-en-el-campo/handoff/_ds/football-app-design-system-49d016f4-ea4c-4c74-a558-2de1c1c22f99/_ds_bundle.js#L528-L535))
  con el mismo copy que usa hoy el código
  ([index.html:5216](../../index.html#L5216)): "Convocá al menos un titular para poder
  generar equipos."
- **FR-006** — When hay al menos un titular convocado pero `m.equipos` no existe, el
  sistema shall mostrar en la columna derecha un componente `EmptyState` con título
  "Todavía no generaste los equipos" y el caption "Cuando los generes, los dos equipos
  aparecen acá sobre el campo. Podés seguir moviendo la cola de convocados mientras
  tanto.", seguido — como bloque **separado**, no como contenido interno del
  `EmptyState` (`EmptyState` no anida hijos adicionales debajo de `caption`/`action` per
  `_ds_bundle.js:560-577`) — de una lista "Con qué va a armar" que resume la
  convocatoria actual.
- **FR-007** — Where la sesión tiene rol admin y aplica `FR-006`, el sistema shall
  mostrar el botón "Generar equipos" junto al título del panel derecho (hereda el
  permiso admin-only ya existente en [index.html:5222-5224](../../index.html#L5222-L5224),
  resuelve `OPEN-Q-02` del Concept Note).
- **FR-008** — Where la sesión tiene rol jugador y aplica `FR-006`, el sistema shall no
  mostrar el botón "Generar equipos" (hereda el comportamiento ya existente).

### 7.3 Switch de pestañas (mobile)

- **FR-009** — While el viewport es < el breakpoint (`A-01`), el sistema shall reemplazar
  el layout de dos columnas por un switch de dos pestañas ("Convocados"/"Equipos", o
  "Convocados"/"Resultado" cuando la inscripción está cerrada), mostrando un panel a la
  vez.
- **FR-010** — Where la inscripción del partido está cerrada, el switch mobile (`FR-009`)
  shall arrancar seleccionado en la pestaña "Resultado".
- **FR-011** — Where la inscripción del partido está abierta, el switch mobile (`FR-009`)
  shall arrancar seleccionado en la pestaña "Convocados".
- **FR-012** — While la inscripción está cerrada, la pestaña "Convocados" del switch
  mobile shall mostrarse en modo lectura (sin buscador, sin botón de quitar, sin
  arrastre), igual que la columna izquierda en `FR-004`.

### 7.4 Carga de resultado en el switch (mobile)

- **FR-013** — El sistema shall mostrar, en cada fila de detalle de carga (ya introducida
  por `CARGA_POR_TOQUE_SPEC.md` `FR-042`), un botón "+" además del botón "−" ya
  existente.
- **FR-014** — When el administrador toca el botón "+" de una fila de detalle (`FR-013`),
  el sistema shall agregar un evento del mismo tipo y familia al mismo jugador, con el
  mismo efecto observable que tocar la camiseta de ese jugador
  (`CARGA_POR_TOQUE_SPEC.md` `FR-030`).
- **FR-015** — Where el rol de la sesión no es admin, el sistema shall no mostrar los
  botones "+"/"−" de las filas de detalle (hereda `CARGA_POR_TOQUE_SPEC.md` `FR-003`).

## 8. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Accessibility | El componente `EmptyState` y el switch de pestañas mobile shall cumplir el mismo mínimo de contraste AA y tamaño táctil ≥24×24px que ya exige `INVARIANTE_CANCHA_A11Y` (heredado de `CANCHA_SPEC.md`, rebanada 1). |
| NFR-002 | Performance | El cambio de pestaña en el switch mobile (`FR-009`) shall completarse visualmente en ≤ 150ms, usando la transición `--duration-fast` ya definida en `tokens/motion.css` (140ms — verificado contra el archivo), sin refetch de datos del partido. |
| NFR-003 | Usability | El layout de dos columnas (`FR-001`) shall verificarse en al menos 1280px (ancho del mockup `12a`) y en el breakpoint elegido (`A-01`), confirmando que el panel de equipos no cae por debajo del ancho que [index.html:518-521](../../index.html#L518-L521) ya documenta como el límite de "cada panel queda con 328px útiles" para el grid interno blanco/negro. |
| NFR-004 | Maintainability | Todo test que verifique un `FR-*`/`NFR-*`/`TC-*` de esta Spec shall embeber su identificador en forma canónica dentro de un literal de cadena (`TC-030`). |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — Admin ve el layout de dos columnas con equipos generados (covers FR-001, FR-002, FR-003)

- **Given** un partido con al menos un titular convocado y equipos ya generados
- **And** el viewport es ≥ el breakpoint (`A-01`)
- **And** la sesión es admin
- **When** se abre la pantalla del partido
- **Then** el sistema shall mostrar la convocatoria en una columna izquierda de 352px y
  el panel de equipos en una columna derecha, ambas visibles sin scroll vertical
  independiente entre sí

**Variants:**

- `S-01a [boundary]` — viewport exactamente en el breakpoint — el layout de dos columnas
  se mantiene (el switch aparece recién por debajo)
- `S-01b [boundary]` — viewport 1px por debajo del breakpoint — cae al switch mobile
  (`FR-009`)
- `S-01c [failure]` — el partido no tiene ningún convocado — la columna izquierda
  muestra su propio `EmptyState` ya existente ("Todavía no convocaste jugadores para
  este partido."), sin cambios de esta Spec
- `S-01d [property]` — para cualquier cantidad de titulares entre 1 y el máximo de la
  formación, arrastrar un suplente por encima del corte de titulares dentro del layout de
  dos columnas produce exactamente el mismo resultado que producía antes de esta feature
  (invariante ya garantizado por `renderConvocadosList`, no reimplementado)

#### Scenario S-02 — Admin arrastra un suplente a titular sin salir de la vista de equipos (covers FR-002)

- **Given** el layout de dos columnas activo
- **And** al menos un suplente en la cola izquierda
- **When** el admin arrastra el suplente por encima del corte de titulares
- **Then** el suplente pasa a titular en la misma interacción
- **And** el panel derecho de equipos permanece visible, sin recargar la pantalla

**Variants:**

- `S-02a [failure]` — el admin suelta el suplente fuera del área de la cola (drag
  cancelado) — el orden no cambia, comportamiento ya existente heredado

#### Scenario S-03 — Empty state cuando no hay titulares convocados (covers FR-005)

- **Given** una convocatoria sin ningún titular (todos suplentes o cola vacía)
- **And** el layout de dos columnas activo
- **When** se renderiza la columna derecha
- **Then** el sistema shall mostrar el `EmptyState` "Convocá al menos un titular para
  poder generar equipos." en vez de la cancha

Variants: none — single-path scenario.

#### Scenario S-04 — Empty state cuando hay titulares pero los equipos no se generaron (covers FR-006, FR-007, FR-008)

- **Given** al menos un titular convocado
- **And** `m.equipos` no existe
- **And** el layout de dos columnas activo
- **When** se renderiza la columna derecha
- **Then** el sistema shall mostrar el `EmptyState` "Todavía no generaste los equipos"
  con la lista "Con qué va a armar" como bloque separado debajo

**Variants:**

- `S-04a [boundary]` — la sesión es admin — se muestra además el botón "Generar
  equipos" (cubre `FR-007`)
- `S-04b [boundary]` — la sesión es jugador — no se muestra el botón (cubre `FR-008`)
- `S-04c [failure]` — el admin toca "Generar equipos" y la generación falla —
  comportamiento heredado de `__generarEquipos`, sin cambios de esta Spec; el panel
  permanece en el mismo `EmptyState`

#### Scenario S-05 — Partido finalizado usa el mismo layout de dos columnas, de lectura (covers FR-004, TC-006)

- **Given** un partido `Finalizado` con resultado guardado, sin edición en curso
- **And** el viewport es ≥ el breakpoint (`A-01`)
- **When** cualquier rol abre la pantalla del partido
- **Then** el sistema shall mostrar el mismo grid de dos columnas: convocados de lectura
  a la izquierda, resultado y camisetas con estadísticas a la derecha
- **And** el sistema shall no mostrar el subtítulo de estrategia aplicada

**Variants:**

- `S-05a [boundary]` — rol admin — ve además el ícono de "Editar resultado" en el
  encabezado (heredado de `PARTIDO_FINALIZADO_SPEC.md` `FR-060`, sin cambios)
- `S-05b [boundary]` — rol jugador — no ve el ícono de "Editar resultado" (heredado, sin
  cambios)

#### Scenario S-06 — El switch reemplaza el apilado simple en mobile (covers FR-009, FR-010, FR-011)

- **Given** un viewport por debajo del breakpoint (`A-01`)
- **And** un partido con inscripción abierta
- **When** se abre la pantalla del partido
- **Then** el sistema shall mostrar un switch de dos pestañas "Convocados"/"Equipos",
  arrancando en "Convocados"

**Variants:**

- `S-06a [boundary]` — inscripción cerrada — el switch muestra "Convocados"/"Resultado"
  y arranca en "Resultado" (cubre `FR-010`)
- `S-06b [property]` — para cualquier estado de inscripción (abierta/cerrada), exactamente
  una pestaña está activa a la vez

#### Scenario S-07 — Carga de resultado con el botón "+" en la fila de detalle (covers FR-013, FR-014)

- **Given** el switch mobile en la pestaña "Resultado", modo de carga activo
- **And** la sesión es admin
- **And** una fila de detalle ya existente para un jugador
- **When** el admin toca el botón "+" de esa fila
- **Then** el sistema shall agregar un evento del mismo tipo a ese jugador, con el mismo
  efecto que tocar su camiseta
- **And** el marcador y la pastilla de esa camiseta shall actualizarse de inmediato

**Variants:**

- `S-07a [failure]` — la fila queda sin eventos después de tocar "−" — la fila
  desaparece (heredado, `CARGA_POR_TOQUE_SPEC.md` `FR-053`, sin cambios)
- `S-07b [concurrency]` — el admin toca "+" dos veces seguidas en la misma fila — se
  agregan dos eventos, uno por toque, sin condición de carrera (la función reutilizada,
  `TC-004`, ya garantiza esto)

### 9.2 Edge cases

*No aplica* — todos los casos límite identificados (viewport en el breakpoint, rol sin
permiso, fila sin eventos) tienen un padre happy-path claro y viven como `Variants:` bajo
su escenario en §9.1, según la convención de la guía de autoría.

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Rol jugador no ve controles de carga en el switch mobile (covers FR-015)

- **Given** el switch mobile en la pestaña "Resultado"
- **And** la sesión es jugador
- **When** se renderizan las filas de detalle
- **Then** el sistema shall no mostrar los botones "+"/"−" en ninguna fila

Variants: none — single-path scenario.

## 10. Data model & external contracts

No aplica — esta feature no introduce ninguna entidad de dominio nueva; lee y muestra
los mismos campos (`m.convocados`, `m.equipos`, `m.estado`, `m.resultado`) ya modelados
por rebanadas anteriores de "Equipos en el campo". Se omite el diagrama `erDiagram` de
§10.1.1 por criterio explícito de `MD-24` (requerido solo con ≥1 entidad nueva).

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9 (S-01 a S-07, S-20, y sus variantes) pasan
  contra una build reciente (covers FR-001 a FR-015).
- **AC-02** — El layout de dos columnas (`FR-001`) se verifica visualmente en los anchos
  de `NFR-003`.
- **AC-03** — El botón "Generar equipos" respeta el permiso admin-only (`S-04a`/`S-04b`)
  sin regresión sobre el comportamiento ya existente.

### 11.2 Non-functional acceptance

- **AC-10** — `NFR-002` verificado por una medición de tiempo de transición del switch
  en al menos un dispositivo mobile real.
- **AC-11** — `NFR-001` verificado contra el mismo checklist de accesibilidad que ya usa
  `INVARIANTE_CANCHA_A11Y`.

### 11.3 Constraint compliance

- **AC-15** — `TC-001` a `TC-003` verificados por revisión de código: no se introduce un
  sistema de componentes paralelo, y `renderConvocadosList`/`renderZonaEquipos` no se
  reescriben.
- **AC-16** — `TC-004`/`TC-005` verificados por un test que confirma que el botón "+"/"−"
  invoca literalmente las mismas funciones que ya usa la rebanada 6.
- **AC-17** — `TC-006` verificado por inspección visual/snapshot: el subtítulo de
  estrategia no aparece en `S-05`.
- **AC-18** — `TC-007` verificado confirmando que la regla CSS de
  [index.html:522](../../index.html#L522) fue reemplazada, no duplicada.

### 11.4 Negative / safety acceptance

- **AC-20** — `S-04c` (falla de generación) no deja el panel derecho en un estado
  inconsistente (sin equipos parciales visibles).

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 — incluida cada variante — tiene al menos un test
  referenciado en el §12.1 del Plan, con el ID embebido según `TC-030`. Todo encabezado
  de escenario en §9 va seguido de un bloque `Variants:` o de la declaración explícita
  `Variants: none — single-path scenario`.
- **AC-51** — Todo NFR cuantificado en §8 tiene un test de medición referenciado en el
  §12 del Plan.
- **AC-52** — Todo TC en §4 tiene un chequeo de cumplimiento en §11.3 Y una entrada en el
  §12 del Plan.
- **AC-53** — El cambio tiene al menos una fila `IMP-*` en el §12.2 del Plan por cada
  alcance materialmente afectado (`code`/`system`/`business`/`external`).
- **AC-54** — Todo NFR cuantificado en §8 tiene al menos una fila `OBS-*` en el §11 del
  Plan.
- **AC-55** — El lockfile de la rama no tiene ningún advisory sin waiver, o el Plan
  declara `Supply-chain: none — <reason>` en su §5 (esta feature no agrega dependencias
  nuevas, por lo que se espera la declaración `none`).

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Uso sin scroll cruzado | El admin arma equipos sin bajar y volver a subir la pantalla, en uso real | Observación directa / dogfooding (app de un solo grupo, sin telemetría) |
| Regresión cero en carga mobile | Cero reportes de "no encuentro el botón de resultado" tras mover el switch a "Resultado" por defecto | Feedback directo del grupo tras el primer partido con inscripción cerrada |

## 13. Dependencies

- **Upstream services / specs:** las seis rebanadas mergeadas de "Equipos en el campo"
  (`CANCHA_SPEC.md`, `ARRASTRE_SPEC.md`, `PANEL_ARMADO_SPEC.md`,
  `PARTIDO_FINALIZADO_SPEC.md`, `MODELO_EVENTOS_SPEC.md`, `CARGA_POR_TOQUE_SPEC.md`).
- **Internal modules / teams:** ninguno — proyecto de una persona.
- **Feature flags / config:** ninguno nuevo.
- **Third-party APIs:** ninguna nueva — Firebase ya en uso.

## 14. Assumptions

- **A-01** — El breakpoint entre el layout de dos columnas y el switch mobile (`FR-001`
  / `FR-009`) es mayor a los 900px que hoy usa el grid interno blanco/negro
  ([index.html:518-521](../../index.html#L518-L521)), porque sumar la columna de
  convocados (352px + 16px de gap) reduce el ancho disponible para el panel de equipos
  respecto de hoy. El propio comentario de esa línea documenta que el panel ya se siente
  ajustado por debajo de 900px de ancho **disponible para él solo** — con la columna de
  convocados restando ~368px, el breakpoint outer probablemente ronda 1100-1280px, pero
  el valor exacto no está validado contra un dispositivo real (`OPEN-Q-01` permanece
  abierta).
- **A-02** — El componente `EmptyState` no necesita una prop nueva para la lista "Con qué
  va a armar": se renderiza como un bloque hermano después del componente, no como hijo
  interno — verificado contra `_ds_bundle.js:528-577` (el componente solo acepta
  `media`/`title`/`caption`/`action` y no anida contenido adicional).

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| El breakpoint elegido en la Plan (`OPEN-Q-01`/`A-01`) resulta incorrecto en dispositivos reales y dos columnas quedan apretadas | Med | Med | `AC-02`/`NFR-003` exigen verificación en al menos dos anchos reales antes de cerrar el branch correspondiente |
| El botón "+" nuevo (`FR-013`) introduce una segunda superficie de interacción que diverge de la del toque en la camiseta si no reutiliza literalmente la misma función | Med | Baja | `TC-004`/`AC-16` exigen que ambas superficies invoquen la misma función, verificado por test |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | ¿Cuál es el breakpoint exacto (`A-01`) validado contra dispositivos reales? | Lucas | Implementation Plan | Inherited de Concept Note `OPEN-Q-01`; ver razonamiento en `A-01` |
| OPEN-Q-04 | ¿La columna de convocados debe quedar `sticky` al hacer scroll? | Lucas | Spec revision (futura) | Inherited de Concept Note `OPEN-Q-04`; explícitamente fuera de alcance de esta Spec (§3.2) |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** FR-001 a FR-015, NFR-001 a NFR-004, TC-001 a
  TC-007, AC-01 a AC-55, y las constraints heredadas en §3.3.
- **Plan has freedom over:** el nombre exacto de las funciones/módulos que implementan
  el grid de dos columnas y el switch, la estructura interna del componente `EmptyState`
  en el código (mientras cumpla `TC-001`), el orden de branches, y el detalle exacto de
  la sintaxis CSS del grid (`grid-template-columns` u otra equivalente).
- **Plan must resolve:** OPEN-Q-01 (validar el breakpoint contra dispositivos reales
  antes de cerrar el branch de layout desktop/mobile).

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-02 | Lucas Manoukian | Initial draft. Self-critique: passed (1🔴 / 3🟡 / 2🔵) — corregidos: §4.5 se autocontradecía (declaraba "none" y listaba TC-006 ahí mismo, movido a §4.2), FR-015 saltado (renumerado desde FR-016), NFR-002 citaba <100ms contra un token que en realidad vale 140ms (corregido a ≤150ms), §9.2 omitida sin declarar (agregada), más ajustes de "por qué" en §1. |

---

*This Spec defines what the system shall do, how it shall behave, and which solutions
are admissible. Concrete implementation choices live in
[NAVEGACION_PARTIDOS_IMPLEMENTATION_PLAN.md](./NAVEGACION_PARTIDOS_IMPLEMENTATION_PLAN.md).
Motivation and decision rationale live in
[NAVEGACION_PARTIDOS_CONCEPT.md](./NAVEGACION_PARTIDOS_CONCEPT.md).*
