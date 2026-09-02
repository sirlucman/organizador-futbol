# Partido en dos columnas — Concept Note

> **Status:** Draft · **Date:** 2026-09-02 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** [NAVEGACION_PARTIDOS_SPEC.md](./NAVEGACION_PARTIDOS_SPEC.md) · **Implementation plan:** *not yet written*

## 1. TL;DR

Hoy la pantalla de un partido apila la cola de convocados arriba y el panel de equipos
generados abajo: hay que scrollear para comparar la cola con la cancha. Se propone un
layout de dos columnas — convocados a la izquierda (352 px fijos), equipos generados a
la derecha — para el administrador en desktop, con un empty state propio cuando los
equipos todavía no se generaron, y el mismo layout (de solo lectura) para un partido ya
finalizado. En viewports angostos (≤ breakpoint a definir en la Spec) la pantalla resuelve
con un switch de pestañas en vez de dos columnas, y la carga de resultado vive dentro de
ese mismo switch. La decisión que el lector debe conocer antes que ninguna otra: el
diseño (`Equipos en el campo.dc.html`, turnos 12/13a/14a) gana sobre el código **caso por
caso**, no automáticamente — y en el primer caso concreto que ya apareció (el subtítulo de
estrategia aplicada en el partido finalizado) gana el código, porque es una decisión de
contenido ya tomada a propósito, no un desalineamiento de formato.

## 2. Problem statement

La pantalla del partido funciona hoy, pero obliga a un ida y vuelta constante entre dos
bloques de información que casi siempre se necesitan juntos.

- **Pain 1 — convocatoria y equipos se apilan verticalmente.** `renderMatchDetail()`
  ([index.html:5687](../../index.html#L5687)) llama primero a `renderConvocadosList(m)`
  y después a `renderTeamsSection(m)`, ambos dentro del mismo `#matchDetailView`
  ([index.html:951-980](../../index.html#L951-L980)). Para arrastrar un suplente a
  titular y después revisar cómo quedó el equipo hay que bajar, tocar, y volver a subir.
- **Pain 2 — el empty state de "equipos sin generar" es un párrafo suelto.** Hoy son dos
  mensajes de texto plano dentro del layout apilado
  ([index.html:5255-5258](../../index.html#L5255-L5258) y
  [index.html:5260-5265](../../index.html#L5260-L5265)), sin el componente `EmptyState`
  del design system que el resto de "Equipos en el campo" ya adoptó.
- **Pain 3 — el compacto no tiene una decisión de diseño explícita.** Por debajo de
  900 px ([index.html:523](../../index.html#L523)) hoy cae a un apilado simple sin más
  criterio que "no entran las dos columnas". El propio `DELTA.md` del proyecto de diseño
  lo marca como decisión pendiente entre dos alternativas (13a / 13b) — recién resuelta
  por el owner al pedir esta feature (§10, `D-02`).
- **Pain 4 — el partido finalizado no hereda el layout, solo el contenedor.** La rama de
  finalizado ([index.html:5241](../../index.html#L5241)) ya reutiliza
  `renderTeamsSectionImpl`, pero sigue heredando el apilado vertical, no una disposición
  de dos columnas.

## 3. Goals

- Que convocados y equipos se vean simultáneamente en desktop, sin scroll cruzado.
- Que arrastrar un suplente a titular no obligue a salir de la vista del panel de equipos.
- Que el empty state de "equipos sin generar" use el componente `EmptyState` del design
  system, consistente con el resto de la reescritura.
- Que un partido finalizado use el mismo layout de dos columnas, en modo lectura.
- Que en viewports angostos la pantalla resuelva con el switch de pestañas de `13a`,
  reemplazando el apilado simple actual.

## 4. Non-goals

- No se modifica el motor de generación de equipos, ni sus estrategias, ni sus reglas.
- No se rediseña el modelo de carga de resultados: `14a` reubica la planilla del turno 7
  (ya implementada, rebanadas 5 y 6) dentro del nuevo shell mobile; los pasos +/- por
  renglón son la única pieza funcionalmente nueva y quedan acotados a esa reubicación.
- No se rediseñan los botones de ciclo de vida del header (Reabrir/Cerrar inscripción,
  Eliminar partido) — ya existen en código ([index.html:5708](../../index.html#L5708),
  [index.html:961](../../index.html#L961)) y solo se restylean si su formato actual
  difiere del que dibujan los turnos 12a/12b/12c.
- No se implementan los turnos 9/10/11 (pastilla de puesto en la camiseta) — es un delta
  de diseño distinto (`A1` en `DELTA.md`), sin relación con el layout de dos columnas y
  permanentemente fuera del alcance de esta feature (podría abordarse como una feature
  propia, pero nunca como parte de esta).

> `13b` y `C1`/`C2` **no** están en esta lista: no son exclusiones permanentes, son
> diferimientos con una condición de retorno explícita — viven en §14, no acá, para no
> duplicar el mismo ítem con dos framings contradictorios.

## 5. Vision / desired end state

Es sábado a la tarde. El administrador entra al partido desde la computadora: a la
izquierda ve la cola de convocados fija; a la derecha, los dos equipos generados sobre la
cancha, con la formación reconocible de un vistazo. Arrastra un suplente arriba del corte
de titulares y lo ve pasar a titular sin perder de vista el campo — no tiene que scrollear
para confirmar que quedó bien. Si todavía no generó los equipos, el panel derecho muestra
un estado vacío con el botón "Generar equipos" y un adelanto de con qué va a armar, sin
que eso le impida seguir moviendo la cola de la izquierda mientras tanto.

Esa misma noche, desde el celular, la pantalla es un switch de dos pestañas. Como la
inscripción ya cerró, arranca en "Resultado" — lo que vino a hacer — y carga los goles
tocando la camiseta, sin salir de ese flujo para consultar la cola. Al otro día, cualquiera
del grupo abre el partido finalizado desde cualquier dispositivo y ve la misma disposición
de dos columnas (o el mismo switch en el celular), ahora de solo lectura: la convocatoria
a la izquierda, el resultado y las camisetas con los goles a la derecha.

### 5.1 System context diagram

*No aplica.* Esta feature no cruza un segundo boundary de sistema: sigue siendo el mismo
cliente (`index.html`) contra el mismo backend de Firebase ya en producción. Es un cambio
de layout y de componentes visuales, no de arquitectura. Se omite el diagrama `C4Context`
por criterio explícito de `MD-24` (requerido solo con ≥2 boundaries).

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Sin input externo no confiable. Todas las interacciones vienen de
  miembros autenticados del grupo (roles `admin` / `jugador`), ya filtrados por el modelo
  de permisos existente (`.specify/specs/007-permisos-por-usuario/spec.md`).
- **Data sensitivity** — Ninguna regulada: nombres de jugadores y puntajes de un grupo
  amateur de fútbol 5/8/9. No hay PII sensible, datos de pago ni credenciales.
- **Deployment surface** — SPA cliente (`index.html`) contra el mismo Firebase ya en
  producción. Esta feature no agrega endpoints, servicios ni superficie nueva: es un
  cambio de layout y de componentes visuales sobre datos que ya se leen y escriben hoy.

Dado que no se introduce superficie de entrada ni flujo de datos nuevo, se espera que la
Spec §4.5 declare `Security constraints: none — ver Concept §5.2`, salvo que la revisión
de la Spec encuentre algo puntual (por ejemplo, en el manejo del drag-and-drop entre
columnas) que amerite una `TC-*` específica.

## 6. Context & background

- **Existing system** — La pantalla de partido es una sola vista (`#matchDetailView`,
  [index.html:951-980](../../index.html#L951-L980)) orquestada por `renderMatchDetail()`
  ([index.html:5687](../../index.html#L5687)), que hoy apila `renderConvocadosList`
  ([index.html:5739-5814](../../index.html#L5739-L5814)) y `renderTeamsSectionImpl`
  ([index.html:5208-5313](../../index.html#L5208-L5313)).
- **Related work** — Esta feature es independiente de la iniciativa
  ["Equipos en el campo"](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md) (6
  rebanadas mergeadas), pero construye directamente sobre su resultado visual: la cancha,
  las camisetas y el candado que dibuja el panel derecho de esta feature son exactamente
  los de [rebanada-1-cancha](../equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md) y
  [rebanada-3-panel-armado](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md),
  y el patrón de "el partido finalizado reusa el mismo contenedor" viene de
  [rebanada-4-partido-finalizado](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md).
- **Organisational context** — El proyecto de diseño en Claude Design ("Diseño de equipos
  en cancha") mantiene un archivo `DELTA.md` que es el ledger vivo de qué está diseñado y
  no implementado, qué decidió el código sin que el diseño lo dibuje, y qué decisiones de
  diseño están pendientes. Su gobernanza por defecto es "el código manda"; §10 de este
  documento registra la excepción que el owner pidió para esta feature.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence:**

- [index.html:951-980](../../index.html#L951-L980) (`#matchDetailView`) — confirmó que
  convocados y equipos ya comparten una sola pantalla con scroll, no pestañas ni rutas
  separadas; fija qué reemplaza el nuevo grid de dos columnas.
- [index.html:5687](../../index.html#L5687) (`renderMatchDetail`) — el orquestador que
  llama `renderConvocadosList` y luego `renderTeamsSection`; pinned el único punto de
  entrada que esta feature debe conservar o reestructurar.
- [index.html:5208-5313](../../index.html#L5208-L5313) (`renderTeamsSectionImpl`) — pinned
  las dos ramas de empty state ya existentes (sin titulares vs. titulares-sin-generar),
  anteriores a esta feature y que `D-04` decide preservar.
- [index.html:5255-5258](../../index.html#L5255-L5258) y
  [index.html:5260-5265](../../index.html#L5260-L5265) — copy exacto de esos dos empty
  states, comparado contra el estado único que dibuja `12b` para detectar el gap de
  contenido (Pain 2, `D-04`).
- [index.html:5742-5745](../../index.html#L5742-L5745) — copy del empty state de
  convocados ("Todavía no convocaste jugadores para este partido."), confirmado
  **idéntico** al `caption` del `EmptyState` que dibuja `12a`/`12b`/`12c` — sin conflicto
  acá.
- [index.html:5241](../../index.html#L5241) (rama `Finalizado`) — pinned que el partido
  finalizado ya se resuelve dentro de la misma función/contenedor, precedente que esta
  feature extiende al layout de dos columnas (`12c`).
- [index.html:5169](../../index.html#L5169) y
  [index.html:5515-5526](../../index.html#L5515-L5526)
  (`renderEncabezadoPartidoFinalizado`) — confirmó que "Editar resultado" **ya** es un
  ícono en el encabezado del partido finalizado, igual a lo que dibuja `12c`. Esto
  resuelve lo que parecía un conflicto con la sección B de `DELTA.md` (que describe ese
  botón como texto en el pie) — ese renglón de `DELTA.md` está desactualizado respecto al
  código actual.
- [index.html:523](../../index.html#L523) — pinned el breakpoint actual (900 px) donde el
  layout cae a apilado simple; es lo que `13a` (`D-02`) reemplaza.
- [index.html:5708](../../index.html#L5708) y [index.html:961](../../index.html#L961) —
  confirmaron que los botones "Reabrir/Cerrar inscripción" y "Eliminar partido" ya existen
  en código, acotando `D-07` a un posible restyle visual, no a una funcionalidad nueva.

**Industry-standard evidence:**

- *Regulatory:* ninguna — sin datos regulados (§5.2).
- *Architectural:* ninguna mandada externamente; se sigue la convención ya vigente del
  proyecto de escribir Concept Note → Spec → Implementation Plan por rebanada
  (`docs/equipos-en-el-campo/*`).
- *Style / project convention:* los tokens de `football-app-design-system` ya
  vendorizados en
  [docs/equipos-en-el-campo/handoff/_ds/](../equipos-en-el-campo/handoff/_ds/). Se
  diffearon `colors.css` y `styles.css` contra el proyecto de diseño vivo y salieron
  **byte-idénticos**; el resto de los tokens (`spacing.css`, `typography.css`,
  `radius.css`, `elevation.css`, `motion.css`, `fonts.css`, `base.css`,
  `_ds_bundle.js`) **no** se re-diffearon contra el proyecto remoto en esta pasada —
  solo se confirmó que el archivo local existe y tiene el nombre esperado. Si la Spec
  necesita citar una medida específica de esos archivos, debe volver a verificarla
  contra el proyecto vivo antes de fijarla como `NFR`/`TC`.

**Prior-art evidence:**

- [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md) —
  prior art directo del lenguaje visual (cancha, camisetas, candado) que el panel derecho
  de esta feature reutiliza sin cambios.
- [PANEL_ARMADO_SPEC.md](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md) —
  antecesor directo de la tarjeta "Equipos generados" de `12a`.
- [PARTIDO_FINALIZADO_SPEC.md](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md) —
  antecesor directo del patrón "el finalizado reusa el mismo contenedor", y origen de
  `FR-060` (el ícono de "Editar resultado" en el encabezado) que `12c` continúa.
- `design_handoff_equipos_en_el_campo/DELTA.md` (Claude Design, proyecto "Diseño de
  equipos en cancha", `b84fe7fc-5cd9-43c2-b817-9a4287ba9c15`) — artefacto externo al
  repo, no un archivo de código; pinned tanto el conflicto de gobernanza (`D-05`) como el
  riesgo ya documentado del subtítulo de `12c` (`D-06`), ambos resueltos en §10.
- Claude Design, mismo proyecto, turnos `12` (`12a`/`12b`/`12c`), `13` (`13a`) y `14`
  (`14a`) de `Equipos en el campo.dc.html` — la fuente hi-fi que esta feature implementa.

## 7. Research & industry context

### 7.1 How established products handle this

*Omitido a propósito, no por olvido:* es una herramienta interna de un solo grupo, y la
decisión de layout (dos columnas en desktop, switch de pestañas en mobile) ya fue tomada
por el propio proceso de diseño interno documentado en `DELTA.md`, no por benchmarking de
mercado. No se comparó contra apps de gestión deportiva ni de fantasy football.

### 7.2 Relevant prior art / papers / standards

*Omitido a propósito, no por olvido:* no aplica literatura ni estándar externo — el
patrón de layout de dos columnas (lista fija + panel de contenido) es de uso general en
UI y no amerita cita académica o de estándar para esta feature.

### 7.3 Proofs of concept

| PoC | Status | Link | Qué probó | Qué descartó |
|---|---|---|---|---|
| Turnos 4-8 de `Equipos en el campo.dc.html`, ya mergeados en 6 rebanadas | Hecho | `docs/equipos-en-el-campo/` | Que traducir el canvas de diseño 1:1 a `index.html` con los tokens del design system funciona de forma confiable en producción (`DELTA.md`, sección D "Archivado"). | Una alternativa de armado por lista en vez de cancha (turno 8 descartado, 2026-08-31). |

## 8. Proposed direction

### 8.1 Approach

Tres cambios empaquetados como un solo rediseño de pantalla:

1. **Grid de dos columnas en desktop.** Reestructurar el DOM de `renderMatchDetail` para
   que, a partir de un breakpoint a definir en la Spec (`OPEN-Q-01`), `#matchDetailView`
   pase de apilado vertical a dos columnas — la izquierda de ancho fijo (352 px, tomado
   de `12a`), la derecha flexible: la columna izquierda reutiliza `renderConvocadosList`
   sin cambios de lógica, solo de contenedor; la columna derecha reutiliza
   `renderZonaEquipos`/`renderCanchaEquipo` sin cambios. La sintaxis CSS exacta
   (`grid-template-columns` u otra) queda para la Spec/Plan.
2. **Empty state con el componente del design system.** Reemplazar los dos párrafos
   sueltos actuales por un bloque `EmptyState` (título + caption), conservando las mismas
   dos condiciones de validación que ya existen (sin titulares vs. titulares-sin-generar,
   `D-04`), y agregando la lista "Con qué va a armar" solo en la segunda condición.
3. **Switch de pestañas por debajo del breakpoint.** Reemplazar el apilado simple actual
   por el switch Convocados/Equipos de `13a` (o Convocados/Resultado con inscripción
   cerrada, `14a`), reusando los mismos `render*` sin duplicar lógica.

Ninguno de los tres cambios toca el modelo de datos: leen los mismos campos
(`m.convocados`, `m.equipos`, `m.estado`, `m.resultado`) que ya escriben las rebanadas 5 y
6 de "Equipos en el campo".

### 8.2 Information / data model sketch

No aplica — no se introduce ningún concepto de dominio nuevo. Es un cambio puramente de
presentación sobre datos ya modelados.

## 9. Alternatives considered

### 9.1 Ancho de la columna de convocados: fijo (352 px) vs. proporcional

- **Descripción:** el turno `12a` fija la columna izquierda en 352 px; la alternativa
  sería un ancho proporcional (ej. 30/70%).
- **Pros (proporcional):** se adapta mejor a anchos intermedios.
- **Cons (proporcional):** desalinea las medidas de candado/pastilla ya ajustadas en
  turnos anteriores (11c) para un ancho de tarjeta fijo.
- **Decisión:** Selected — 352 px fijo, tal como dibuja `12a`/`12b`/`12c`.

### 9.2 Resolución mobile: switch de pestañas (`13a`) vs. apilado con convocatoria plegada (`13b`)

- **Descripción:** `DELTA.md` dejaba esto como decisión pendiente entre dos opciones que
  parten del mismo material.
- **Pros (`13a`):** un panel a la vez, sin contenido parcialmente oculto; más simple de
  implementar reusando el mismo componente que Convocados/Equipos.
- **Cons (`13a`):** para ver ambos paneles hay que tocar el switch, no hay vista combinada.
- **Decisión:** Selected — `13a`, elegida explícitamente por el owner al definir el
  alcance de esta feature. `13b` queda diferida (§14).

### 9.3 Empty state del panel de equipos: mensaje único (como dibuja `12b`) vs. las dos condiciones ya existentes

- **Descripción:** `12b` dibuja un solo estado vacío ("Todavía no generaste los
  equipos"), sin distinguir si hay titulares suficientes para generar.
- **Pros (mensaje único):** más simple, calca el diseño literalmente.
- **Cons (mensaje único):** pierde una validación de negocio real: hoy, sin titulares
  convocados, no se puede generar y el mensaje actual lo explica
  ([index.html:5255-5258](../../index.html#L5255-L5258)). El prototipo no modela ese caso
  porque siempre parte de una convocatoria completa.
- **Decisión:** Selected — conservar las dos condiciones, con el componente visual
  `EmptyState` del diseño (`D-04`). Queda anotado para que el owner lo desafíe en la
  revisión de este documento si prefiere el mensaje único.

### 9.4 Gobernanza diseño-vs-código: regla general vs. caso por caso

- **Descripción:** `DELTA.md` establece "el código manda" como regla general del
  proyecto. El owner pidió lo opuesto para esta feature.
- **Pros (caso por caso):** no revierte silenciosamente decisiones de contenido ya
  tomadas (como el subtítulo de estrategia, `D-06`); cada excepción queda documentada.
- **Cons (caso por caso):** más lento — cada inconsistencia real requiere una decisión
  puntual en vez de aplicar una regla mecánica.
- **Decisión:** Selected — caso por caso (`D-05`), con el primer caso ya resuelto (`D-06`).

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | Reemplazar el apilado vertical de `#matchDetailView` por un grid de dos columnas (352 px fijo / `1fr`) a partir de un breakpoint a definir en la Spec | Elimina el scroll cruzado entre convocatoria y cancha (Pain 1); ancho tomado literal de `12a` | Easy — cambio de CSS/layout, no de datos |
| D-02 | En viewports angostos, reemplazar el apilado simple actual ([index.html:523](../../index.html#L523)) por el switch de pestañas de `13a` | Resuelve la decisión pendiente de `DELTA.md` §A3, elegida explícitamente por el owner | Easy |
| D-03 | El turno `14a` se implementa junto con `13a`: la carga de resultado mobile vive dentro del mismo switch, que arranca en "Resultado" con inscripción cerrada | `14a` depende de `13a` (`DELTA.md` §A4) y ambos se pidieron juntos | Easy |
| D-04 | El empty state de "equipos sin generar" usa el componente `EmptyState` del design system, pero conserva las dos condiciones de validación ya existentes (sin titulares vs. titulares-sin-generar) en vez del estado único de `12b` | El prototipo no modela la validación de "sin titulares", que es una regla de negocio real (Pain 2) | Easy — no toca datos |
| D-05 | Ante una inconsistencia de formato entre el diseño (turnos 12/13a/14a) y el código, gana el diseño — pero cada caso se resuelve puntualmente con el owner, no automáticamente, y no se aplica a decisiones de contenido ya tomadas a propósito (ver `D-06`) | El owner pidió esta gobernanza para esta feature, en contraposición a la regla general de `DELTA.md` ("el código manda") | Hard de revertir en silencio — cualquier cambio a este acuerdo se anota acá y en `DELTA.md` |
| D-06 | El subtítulo "Estrategia: Formación fija pareja" que dibuja `12c` **no** se implementa; se mantiene la decisión ya tomada en código (`FR-084`, `D-25` de rebanada 3) de no mostrar la estrategia aplicada | Es una decisión de contenido deliberada y reciente (2026-09-02), no un desalineamiento de formato — `D-05` no aplica acá | Easy — es una línea de texto condicional |
| D-07 | Los botones de header ya existentes (Reabrir/Cerrar inscripción, Eliminar partido) no cambian de comportamiento; solo se restylean si su formato actual difiere del que dibujan `12a`/`12b`/`12c` | Están fuera del alcance funcional de este layout, ya implementados, pero comparten pantalla con el nuevo grid | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| El ancho fijo de 352 px puede no dejar espacio suficiente al panel de equipos en viewports intermedios (~1024-1279 px) que hoy caen al apilado simple | Med | Med | La Spec debe fijar el breakpoint exacto de transición al switch mobile (`OPEN-Q-01`) con una medición real, no asumir 1280 px porque es solo el ancho del mockup |
| Mover el drag-and-drop suplente→titular a un layout de grid podría romper el offset visual que separa titulares/suplentes | Med | Baja | Reusar los mismos handlers `onDragOver`/`onDrop` ya implementados en `renderConvocadosList`, cambiando solo el contenedor CSS |
| Los pasos +/- por renglón de `14a` son funcionalmente nuevos — podrían no estar cubiertos por el modelo de eventos de la rebanada 5 | Med | Med | La Spec debe verificar contra `MODELO_EVENTOS_SPEC.md` si el evento ±1 por fila ya es representable antes de comprometerse a la semántica de Deshacer |
| Aplicar `D-05` (diseño gana caso por caso) sin un proceso claro puede generar decisiones inconsistentes entre partes distintas del layout | Baja | Med | Cada decisión de formato tomada bajo `D-05` se registra en `DELTA.md`, tal como pide su sección "Cómo mantenerlo" |

## 12. Success signals

- El administrador arma equipos sin scrollear entre la cola y la cancha (observación
  directa en uso real).
- El mismo layout de dos columnas se usa para leer un partido finalizado sin reportar
  "no encuentro el resultado".
- Cero regresiones reportadas en el flujo de carga de resultado mobile tras mover el
  switch a "Resultado" por defecto con inscripción cerrada.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** ninguno nuevo — Firebase ya en uso.
- **Upstream specs / RFCs:** las seis rebanadas mergeadas de
  [equipos-en-el-campo](../equipos-en-el-campo/), `DELTA.md` del proyecto de diseño.
- **Downstream consumers:** ninguno conocido.

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (administrador del grupo / PM del producto).
- **Reviewing teams:** *n/a* — proyecto de una persona.
- **Customers / partners:** jugadores del grupo (rol `jugador`, layout de solo lectura).

## 14. Out of scope / deferred

- `13b` (apilado con convocatoria plegada al pie) — el owner ya eligió `13a` para esta
  feature, pero no se descarta para siempre — *deferred hasta que el uso real del switch
  de `13a` muestre que hace falta una vista combinada.*
- `C1` (objetivo táctil del candado, 44×44) y `C2` (mover un jugador sin gesto de
  puntero) — *deferred, ya abiertas en `DELTA.md` desde rebanadas anteriores; este layout
  no las ejercita, se retoman cuando alguien tome esa decisión de diseño.*
- Breakpoints para fútbol 5/6/7/11 — *deferred, ya fuera de alcance desde el Concept
  Note de "Equipos en el campo" (§4).*

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | ¿Cuál es el breakpoint exacto donde el grid de dos columnas cede al switch de `13a`? (¿1024 px? ¿los 900 px que ya usa el código? ¿otro?) | Lucas | Spec | El mockup de `12a` mide 1280 px, pero eso es el ancho del artboard, no necesariamente el breakpoint real |
| OPEN-Q-02 | El botón "Generar equipos" del empty state (`12b`), ¿respeta el permiso admin-only que ya tiene hoy (`jugador` no ve el botón), o el diseño lo muestra a todos? | Lucas | Spec | El mockup no diferencia roles |
| OPEN-Q-03 | Los pasos +/- por renglón de `14a`, ¿ya son representables con el modelo de eventos de la rebanada 5, o requieren una función nueva? | Lucas | Spec | Ver riesgo en §11 |
| OPEN-Q-04 | ¿La columna de convocados debe quedar fija (`sticky`) al hacer scroll dentro del panel de equipos si este es más alto? | Lucas | Spec | El propio canvas de diseño lo sugiere como próximo paso ("dejá la columna de convocados fija al hacer scroll") |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01, D-02, D-03, D-04, D-05, D-06, D-07.
- **Decide in Spec:** OPEN-Q-01, OPEN-Q-02, OPEN-Q-03, OPEN-Q-04.
- **Must remain non-goals** (citadas verbatim de §4):
  - "No se modifica el motor de generación de equipos, ni sus estrategias, ni sus reglas."
  - "No se rediseña el modelo de carga de resultados: `14a` reubica la planilla del turno
    7 (ya implementada, rebanadas 5 y 6) dentro del nuevo shell mobile; los pasos +/- por
    renglón son la única pieza funcionalmente nueva y quedan acotados a esa reubicación."
  - "No se rediseñan los botones de ciclo de vida del header (Reabrir/Cerrar inscripción,
    Eliminar partido) — ya existen en código ([index.html:5708](../../index.html#L5708),
    [index.html:961](../../index.html#L961)) y solo se restylean si su formato actual
    difiere del que dibujan los turnos 12a/12b/12c."
  - "No se implementan los turnos 9/10/11 (pastilla de puesto en la camiseta) — es un
    delta de diseño distinto (`A1` en `DELTA.md`), sin relación con el layout de dos
    columnas y permanentemente fuera del alcance de esta feature (podría abordarse como
    una feature propia, pero nunca como parte de esta)."

## 17. Appendix

- Claude Design, proyecto "Diseño de equipos en cancha"
  (`b84fe7fc-5cd9-43c2-b817-9a4287ba9c15`), archivo `Equipos en el campo.dc.html`, turnos
  `12` (`12a`/`12b`/`12c`), `13` (`13a`) y `14` (`14a`).
- `design_handoff_equipos_en_el_campo/DELTA.md` (mismo proyecto) — ledger de drift
  diseño↔código, última revisión 2026-09-02.
- [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md) —
  Concept Note madre de la iniciativa visual sobre la que esta feature construye.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-02 | Lucas Manoukian | Initial draft. Self-critique: passed (1🔴 / 3🟡 / 2🔵) — corregidos: duplicación §4/§14 (13b, C1/C2, turnos 9/10/11), citas no verbatim en §16, sobre-alcance de "verificados byte-idénticos" en §6.5, omisión silenciosa de §7.1/§7.2, más 2 sugerencias de redacción. |

---

*Next document: [Spec](./NAVEGACION_PARTIDOS_SPEC.md). La Spec define qué debe hacer el
sistema, cómo debe comportarse, y qué soluciones son admisibles. El detalle de
implementación concreto vive en el Implementation Plan, no acá ni en la Spec.*
