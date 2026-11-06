# Editar la fecha de un partido — Concept Note

> **Status:** Draft · **Date:** 2026-11-06 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** *not yet written* · **Implementation plan:** *not yet written*

## 1. TL;DR

Hoy la fecha de un partido se elige una sola vez, al crearlo, y después no se
puede cambiar: la única forma de corregirla es eliminar el partido y crearlo de
nuevo, perdiendo convocatoria, equipos y resultado. Se propone que el
administrador pueda **cambiar la fecha de un partido en cualquiera de sus
estados** —Inscripción abierta, Equipos generados o Finalizado—, también con la
inscripción cerrada, con un lápiz junto a la fecha del encabezado del detalle. El rol
`jugador` no ve el lápiz y no puede cambiar la fecha. La decisión que el lector
debe conocer antes que ninguna otra: **la restricción a `admin` se hace cumplir
en la aplicación, no en las reglas de Firestore** (`D-06`), porque todos los
partidos viven en un único documento que `jugador` necesita poder escribir para
darse de baja; es la misma limitación aceptada que ya rige para equipos,
inscripción y resultado.

## 2. Problem statement

- **Pain 1 — corregir una fecha cuesta el partido entero.** No existe ninguna
  acción que modifique la fecha de un partido existente: se fija al crearlo
  ([index.html:8133-8138](../../index.html#L8133-L8138)) y el encabezado del
  detalle sólo la muestra
  ([index.html:7648](../../index.html#L7648)). Si el administrador se equivocó
  al elegirla, o el partido se mueve de día, lo único que puede hacer es
  eliminarlo ([index.html:7621](../../index.html#L7621)) y crear otro: se
  pierden la convocatoria, los equipos armados y, si ya se jugó, el resultado
  con sus goles y asistencias.
- **Pain 2 — la lista de partidos queda mintiendo.** La lista se ordena por
  fecha ([index.html:7498](../../index.html#L7498)). Un partido con la fecha
  equivocada aparece en el lugar equivocado del historial, y para los jugadores
  la fecha visible es la única referencia de cuándo se juega.

Casos típicos que motivan el cambio: un error de carga al crear el partido, o
un partido que se posterga después de abierta la inscripción. `[INFERRED — el
pedido del owner no nombra un caso concreto; son los dos caminos por los que una
fecha deja de ser la correcta]`

## 3. Goals

- Que el administrador pueda corregir la fecha de cualquier partido, en
  cualquier estado, sin perder nada de lo que el partido ya tiene.
- Que después del cambio la fecha nueva se vea en todos los lugares donde la
  aplicación muestra la fecha, y que la lista de partidos quede ordenada según
  la fecha nueva.
- Que una cuenta `jugador` no tenga ningún camino en la aplicación para cambiar
  la fecha, en ningún estado: administrar partidos es tarea del administrador,
  como crearlos y eliminarlos (`FR-009b` de
  [`007-permisos-por-usuario/spec.md`](../007-permisos-por-usuario/spec.md)).

## 4. Non-goals

- Cambiar la fecha no cambia nada más del partido: ni el estado, ni la
  inscripción, ni la convocatoria, ni los equipos, ni el resultado, ni la
  cancha.
- La fecha no es un dato del motor de generación: cambiarla no regenera
  equipos ni aparece en el resumen de generación.

## 5. Vision / desired end state

El partido del sábado se pasó al domingo por la lluvia. El administrador abre el
partido, que ya tiene los equipos armados, y toca el lápiz que está junto a
"Sábado, 14 de noviembre". Se abre una ventanita con el selector de fecha, ya
posicionado en el sábado; elige el domingo y toca Guardar. El encabezado ahora
dice "Domingo, 15 de noviembre", los equipos siguen exactamente iguales, y en la
lista de partidos el partido se acomodó en su lugar. Avisa en el grupo de
WhatsApp, como siempre. Los jugadores que entran a la aplicación ven la fecha
nueva; ninguno de ellos ve el lápiz.

Un mes después, revisando el historial, el administrador nota que un partido
finalizado quedó cargado con el día anterior. Toca el lápiz, lo corrige, y el
resultado, los goles y las estadísticas de cada jugador quedan intactos.

### 5.1 System context diagram

No aplica: la feature vive entera dentro de la aplicación existente
(`index.html`) y usa la misma persistencia en Cloud Firestore que ya usan las
demás acciones sobre un partido. No cruza ningún límite de sistema nuevo.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Una sola entrada: un valor de fecha elegido por un
  usuario autenticado con rol `admin` en un selector de fecha. Ese valor se
  guarda en el partido y después se muestra a todas las cuentas, así que la
  Spec tiene que fijar que sólo se acepta una fecha válida con el formato que
  ya usa el resto de la aplicación (`YYYY-MM-DD`, el que lee `formatFecha` en
  [index.html:2225-2227](../../index.html#L2225-L2227)). El rol `jugador` no
  ve el control y, si invocara la acción directamente, no modifica nada.
- **Data sensitivity** — La fecha de un partido entre amigos. Sin datos
  regulados ni personales.
- **Deployment surface** — Aplicación estática en GitHub Pages que escribe en
  Firestore. Condición preexistente, no introducida por esta feature: las
  reglas permiten que `jugador` escriba `data/partidos`
  ([`firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md)),
  así que la restricción a `admin` se hace cumplir en la aplicación (`D-06`).

## 6. Context & background

- **Existing system** — Cada partido es un objeto con `id`, `fecha`, `cancha`,
  `estado`, convocatoria, equipos y resultado; `fecha` es un texto
  `YYYY-MM-DD` que sale de un `<input type="date">` en la ventana de "Nuevo
  partido" ([index.html:1405-1426](../../index.html#L1405-L1426),
  [index.html:8138](../../index.html#L8138)). Todos los partidos se guardan
  juntos en un único documento, `data/partidos`, con `saveMatches()`
  ([index.html:2475-2499](../../index.html#L2475-L2499)). La fecha se lee en
  cuatro lugares, y en ninguno interviene en cálculos: el orden de la lista, la
  tarjeta de la lista, el encabezado del detalle y el texto de la confirmación
  de eliminar (§6.5).
- **Related work** — `007-permisos-por-usuario` reservó a `admin` crear y
  eliminar partidos (`FR-009b`) y documentó por qué esas restricciones viven en
  la aplicación y no en las reglas
  ([`research.md` §3](../007-permisos-por-usuario/research.md)).
  `intercambiar-colores` es el antecedente más reciente de una acción nueva,
  sólo de `admin`, sobre un partido, con la misma forma de hacerse cumplir.
- **Organisational context** — Pedido directo del owner el 2026-11-06. La idea
  no estaba en `Roadmap.md`, así que no hay nada que retirar de ahí.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence**

- [index.html:8125-8145](../../index.html#L8125-L8145) — alta de partido: la
  fecha es obligatoria, sin otra validación (ni unicidad, ni límite de pasado o
  futuro); la guarda `if(!isAdmin()) return; // FR-009b` es el patrón a imitar
  (`D-01`, `D-04`).
- [index.html:1405-1426](../../index.html#L1405-L1426) — la ventana "Nuevo
  partido": campo `Fecha` con `<input type="date">`, mensaje de error y botones
  Cancelar / acción principal. Patrón de la ventana de edición (`D-03`).
- [index.html:1323-1339](../../index.html#L1323-L1339) — encabezado del
  detalle: la fecha (`#detailFecha`) y la cancha en `.detail-header-fecha`, la
  pastilla de estado al lado, y las acciones de `admin` (`.admin-only`) a la
  derecha. Lugar del lápiz (`D-03`).
- [index.html:7648](../../index.html#L7648) — el encabezado pinta la fecha con
  `formatFecha`, igual en todos los estados: un mismo lugar sirve para todos
  (`D-02`).
- [index.html:7498](../../index.html#L7498),
  [index.html:7508](../../index.html#L7508),
  [index.html:7621](../../index.html#L7621) — los otros tres usos de la fecha:
  ordenar la lista (más reciente primero), mostrarla en la tarjeta y en la
  confirmación de eliminar. Una búsqueda de `fecha` en todo `index.html` no
  encuentra otros: la fecha no interviene en estadísticas, motor ni resultado
  (`D-05`, `D-08`).
- [index.html:2475-2499](../../index.html#L2475-L2499) — `saveMatches()`
  escribe `data/partidos` entero, para los dos roles; `partidosArmado` sólo si
  es `admin`. La fecha viaja en `data/partidos` (`D-06`).
- [index.html:1596](../../index.html#L1596) — `isAdmin()` lee el rol de la
  sesión (`D-01`).
- [index.html:107](../../index.html#L107) — `body.role-jugador .admin-only`
  se oculta por CSS: mecanismo existente para que `jugador` no vea el lápiz
  (`D-01`).
- [index.html:6865](../../index.html#L6865),
  [index.html:7429-7446](../../index.html#L7429-L7446) — `ICON_LAPIZ` ya existe
  y lo usa "Editar resultado" en la tarjeta del partido finalizado, sólo para
  `admin`. Ícono a reutilizar, y origen del riesgo de dos lápices en la misma
  pantalla (§11, `OPEN-Q-01`).
- [index.html:2225-2227](../../index.html#L2225-L2227) — `formatFecha` arma la
  fecha con `new Date(fechaISO + 'T00:00:00')`: sólo un `YYYY-MM-DD` válido se
  muestra bien (§5.2).

**Industry-standard evidence**

- *Regulatory:* WCAG 2.1 AA, criterio 4.1.2 *Name, Role, Value* (nivel A,
  incluido en AA; verificado contra <https://www.w3.org/TR/WCAG21/#name-role-value>
  el 2026-11-06: "the name and role can be programmatically determined") — un
  botón sólo de ícono necesita un nombre accesible; el lápiz nuevo lo necesita, y además
  distinto del de "Editar resultado" (`OPEN-Q-01`).
- *Architectural:* ninguna restricción más allá de las del proyecto.
- *Style / project convention:* [`AGENTS.md`](../../AGENTS.md) — principios de
  Simplicidad, Explicabilidad del motor, Arquitectura desacoplada, Responsive
  desde 360 px (con escenario nuevo en `tests/layout.test.js` que se vea
  fallar) y Design system como fuente de verdad de UI; formato de commits;
  obligación de declarar reemplazos de specs existentes. Design system en
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/),
  componentes `IconButton` y `Modal`.

**Prior-art evidence**

- [`001-organizacion-partidos/spec.md`](../001-organizacion-partidos/spec.md) —
  `FR-001`: el partido se crea con fecha y cancha; la fecha es obligatoria. No
  dice nada de cambiarla después.
- [`007-permisos-por-usuario/spec.md`](../007-permisos-por-usuario/spec.md) —
  `FR-009b`: crear y eliminar partidos es sólo de `admin`.
- [`007-permisos-por-usuario/research.md` §3](../007-permisos-por-usuario/research.md) —
  la limitación aceptada: `data/partidos` es un único texto JSON con todos los
  partidos, las reglas no pueden distinguir qué cambió adentro, y las
  restricciones de `jugador` sobre partidos se validan en la aplicación
  (`D-06`).
- [`rol-en-el-token/contracts/firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md) —
  las reglas vigentes: `data/partidos` es de lectura y escritura para `admin`
  y `jugador`; "sigue vigente la limitación aceptada" (`D-06`).
- [`intercambiar-colores/INTERCAMBIAR_COLORES_CONCEPT.md`](../intercambiar-colores/INTERCAMBIAR_COLORES_CONCEPT.md) —
  acción nueva sólo de `admin` sobre un partido, oculta a `jugador` y sin
  efecto si se invoca directo; guardado inmediato con `saveMatches()`.
- [`Roadmap.md:67`](../../Roadmap.md) — "Reglas de Firestore más finas para
  `data/partidos`": la idea que cerraría la limitación de `D-06`, ya en el
  backlog. [`Roadmap.md:70`](../../Roadmap.md) — "gana el último que guarda",
  el origen del primer riesgo de §11.
- Productos pares: no se investigaron (ver §7.1).

## 7. Research & industry context

### 7.1 How established products handle this

No se investigó cómo resuelven esto otras aplicaciones de organización de
partidos. Editar la fecha de un evento ya creado es una operación corriente y
el comportamiento lo fijó el owner directamente; no hay una decisión abierta
que un producto par pudiera resolver.

### 7.2 Relevant prior art / papers / standards

- WCAG 2.1, criterio 4.1.2 *Name, Role, Value* — el lápiz lleva un nombre
  accesible, como ya lo lleva "Editar resultado"
  ([index.html:7440](../../index.html#L7440)).

### 7.3 Proofs of concept

No hubo PoC. El comportamiento se deduce del código leído en §6.5.

## 8. Proposed direction

### 8.1 Approach

Una acción nueva de administrador, "Editar fecha", disponible en el detalle de
cualquier partido. El encabezado del detalle muestra, sólo para `admin`, un
lápiz pegado a la fecha. Tocarlo abre una ventana con un único campo, el
selector de fecha, ya cargado con la fecha actual del partido, y los botones
Cancelar y Guardar. Es la misma forma que la ventana de "Nuevo partido", con un
solo campo.

Al guardar se cambia la fecha del partido y nada más; se guarda con el mismo
`saveMatches()` de siempre y se repinta la pantalla. Como la lista ya se ordena
por fecha, el partido se reubica solo. La validación es la misma que al crear:
la fecha es obligatoria; cualquier fecha válida se acepta, pasada o futura,
aunque otro partido tenga la misma.

El control es el mismo en todos los estados del partido, porque el encabezado
es el mismo en todos los estados. Para `jugador`, el lápiz no se dibuja, y la
acción, si se invocara directamente, no modifica nada: la misma guarda que ya
protege crear y eliminar.

### 8.2 Information / data model sketch

No hay entidades ni campos nuevos. La acción reescribe el campo `fecha` que el
partido ya tiene. No se guarda la fecha anterior, ni quién la cambió, ni cuándo
(`D-07`).

## 9. Alternatives considered

### 9.1 Botón de edición entre las acciones del encabezado

- **Description:** un ícono más junto a "Cerrar inscripción" y el tacho de
  eliminar, que abre la misma ventana.
- **Pros:** agrupa todas las acciones de `admin` del encabezado en un mismo
  lugar.
- **Cons:** no dice a simple vista qué edita; un lápiz entre esas acciones se
  lee como "editar el partido", y la ventana sólo cambia la fecha.
- **Decision:** Rejected — elegido por el owner el 2026-11-06: el lápiz junto
  a la fecha deja claro qué se edita.

### 9.2 La fecha misma, tocable

- **Description:** sin ícono; para `admin`, tocar el texto de la fecha abre la
  ventana.
- **Pros:** el encabezado no suma ningún elemento.
- **Cons:** no hay nada que indique que la fecha se puede tocar.
- **Decision:** Rejected — por el owner el 2026-11-06.

### 9.3 Una ventana "Editar partido" con fecha y cancha

- **Description:** reutilizar la ventana de "Nuevo partido" entera para editar
  los dos campos.
- **Pros:** reutiliza la ventana existente tal cual.
- **Cons:** cambiar la cancha cambia el cupo de titulares, y con eso quiénes
  son titulares y suplentes y la validez de los equipos ya armados. Es otra
  feature, con decisiones propias.
- **Decision:** Deferred — ver §14.

### 9.4 Reforzar la restricción también en las reglas de Firestore

- **Description:** que la base de datos rechace un cambio de fecha que venga de
  una cuenta `jugador`.
- **Pros:** la restricción no dependería de la aplicación.
- **Cons:** las reglas no pueden ver qué cambió dentro de un único texto JSON;
  hace falta reorganizar `data/partidos` en un documento por partido, con
  campos propios, y reescribir todo lo que lee y escribe partidos.
- **Decision:** Rejected para esta feature — por el owner el 2026-11-06. Es la
  idea que ya está en `Roadmap.md:67` y sigue ahí.

### 9.5 No construir nada

- **Description:** el administrador sigue eliminando y recreando.
- **Pros:** cero código.
- **Cons:** es exactamente Pain 1: se pierden convocatoria, equipos y resultado.
- **Decision:** Rejected.

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | Sólo `admin` cambia la fecha. El lápiz no se muestra a `jugador` y, si la acción se invocara directamente desde una cuenta `jugador`, no modifica el partido | Pedido del owner; administrar partidos ya es sólo de `admin` (`FR-009b` de `007`) | Easy |
| D-02 | Disponible en cualquiera de los tres estados del partido —Inscripción abierta, Equipos generados y Finalizado (`001-organizacion-partidos/spec.md`, *Key Entities*)— y también con la inscripción cerrada (modo de carga), que no es un estado sino una condición del partido | Pedido del owner; la fecha no interviene en nada de lo que cambia entre estados (§6.5) | Easy |
| D-03 | El control es un botón de ícono con el mismo lápiz que ya usa "Editar resultado", pegado a la fecha del encabezado del detalle. Abre una ventana con la misma forma que "Nuevo partido", con el selector de fecha cargado con la fecha actual, y los botones Cancelar y Guardar. Los dos se resuelven contra el design system (`IconButton`, `Modal`) | Elegido por el owner el 2026-11-06 (§9.1, §9.2); un mismo lugar sirve para todos los estados porque el encabezado es el mismo | Easy |
| D-04 | La fecha es obligatoria y se acepta cualquier fecha válida: pasada o futura, en cualquier estado, aunque otro partido tenga la misma | Elegido por el owner el 2026-11-06; es la misma validación que al crear (`FR-001` de `001`) | Easy |
| D-05 | Cambiar la fecha cambia sólo el campo `fecha`. Estado, inscripción, convocatoria, equipos, resultado y cancha quedan exactamente como estaban | La fecha no interviene en ningún cálculo (§6.5); tocar otra cosa sería alcance nuevo | Easy |
| D-06 | La restricción a `admin` se hace cumplir en la aplicación; las reglas de Firestore no cambian. La limitación aceptada de `007` (`research.md` §3) suma esta acción a la lista de las que se validan del lado de la aplicación | Elegido por el owner el 2026-11-06 (§9.4); cerrarlo en las reglas exige migrar `data/partidos`, ya en el backlog | Medium — revertirla es la migración de `Roadmap.md:67` |
| D-07 | Sin aviso a los jugadores y sin registro del cambio: no se guarda la fecha anterior, ni quién ni cuándo la cambió. Los jugadores ven la fecha nueva al entrar | Elegido por el owner el 2026-11-06; el aviso sigue siendo por WhatsApp como hoy | Easy |
| D-08 | El motor de generación no cambia y la fecha no aparece en el resumen de generación | La fecha no es un parámetro del motor (Explicabilidad, `AGENTS.md`) | Easy |
| D-09 | El cambio se guarda en el acto, igual que las demás ediciones del partido que hace el `admin`, y se repinta la pantalla; la lista se reubica con el orden que ya existe. Qué pasa si el guardado falla se decide en `OPEN-Q-05` | Mismo comportamiento que el resto de las acciones de `admin` sobre un partido | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| "Gana el último que guarda", en las dos direcciones. (a) Una sesión de `jugador` abierta desde antes del cambio guarda cualquier otra acción (por ejemplo, darse de baja) y devuelve la fecha a la anterior, sin aviso. (b) Un `admin` con la lista cargada desde antes de que los jugadores se anoten o se den de baja guarda la fecha nueva y pisa esas altas y bajas, porque `saveMatches()` reescribe todos los partidos con lo que esa sesión tenía en memoria ([index.html:2475-2499](../../index.html#L2475-L2499)). No hay sincronización en vivo que lo evite: `index.html` no usa `onSnapshot` | Med | Med — un partido que se posterga suele cambiar de fecha con la inscripción abierta, justo cuando los jugadores se anotan y se dan de baja | Condición preexistente (`Roadmap.md:70`), la misma que ya documenta `intercambiar-colores`. No se agrega nada (Simplicidad ante todo); se declara en la Spec en las dos direcciones |
| El guardado falla (sin red, sesión vencida) y no avisa: `saveMatches()` traga el error ([index.html:2498](../../index.html#L2498)). El `admin` ve la fecha nueva, que sólo existe en memoria, y al recargar vuelve la anterior | Med | Low | Condición preexistente de toda edición; `intercambiar-colores` la aceptó así (`S-07c` de su Spec). Se decide en `OPEN-Q-05` |
| En el partido finalizado hay dos lápices en la misma pantalla —"Editar fecha" y "Editar resultado"— y el administrador toca el que no quería | Low | Med | Nombres accesibles distintos y posición distinta (uno pegado a la fecha, otro en la tarjeta del resultado); se resuelve en `OPEN-Q-01` |
| A 360 px, el lápiz junto a una fecha larga ("Miércoles, 24 de septiembre") más la pastilla de estado desarma el renglón del encabezado | Med | Med | La Spec declara el comportamiento desde 360 px y el Plan agrega un escenario a `tests/layout.test.js` que se vea fallar antes del arreglo |
| Una cuenta `jugador` con conocimientos técnicos escribe una fecha nueva directamente en Firestore | Low | Low | Limitación aceptada, la misma que rige para equipos, inscripción y resultado (`D-06`) |

## 12. Success signals

- El administrador deja de eliminar y recrear partidos para corregir una
  fecha.
- La lista de partidos refleja las fechas reales en el orden correcto.
- Ninguna cuenta `jugador` reporta haber podido cambiar una fecha desde la
  aplicación.

Ninguna de las tres tiene métrica: la aplicación no registra eliminaciones ni
cambios de fecha (`D-07`). Se juzgan por lo que el owner observa en el uso del
grupo.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** Cloud Firestore, sin cambios en las reglas.
- **Upstream specs / RFCs:** `001-organizacion-partidos` (`FR-001`),
  `007-permisos-por-usuario` (`FR-009b` y `research.md` §3),
  `rol-en-el-token` (contrato de reglas), la rebanada 4 de `equipos-en-el-campo`
  (`FR-006` a `FR-008` y `FR-061` de `PARTIDO_FINALIZADO_SPEC.md`: el lápiz de
  "Editar resultado" y su ocultamiento para `jugador`; el `FR-060` de ese spec
  trata otra cosa, y el `FR-060` que cita el comentario de
  [index.html:7429-7431](../../index.html#L7429-L7431) es el de la rebanada 3).
  Ningún spec declara la fecha inmutable, pero la restricción nueva de
  `jugador` puede ampliar la lista de `007`: la Spec tiene que resolver qué
  declara (`OPEN-Q-03`).
- **Downstream consumers:** ninguno fuera de la aplicación.

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (owner del producto).
- **Reviewing teams:** *pending*.
- **Customers / partners:** los jugadores del grupo, que ven la fecha de cada
  partido.

## 14. Out of scope / deferred

- **Cambiar la cancha de un partido existente.** — *deferred until* que el
  owner lo pida. Cambia el cupo de titulares y puede invalidar los equipos
  armados: necesita sus propias decisiones (§9.3).
- **Aviso o registro de que la fecha cambió.** — *deferred until* que los
  jugadores se pierdan un cambio de fecha por no haberse enterado (`D-07`).
- **Que las reglas de Firestore impidan a `jugador` cambiar la fecha.** —
  *deferred until* la migración de `data/partidos` a un documento por partido,
  ya registrada en `Roadmap.md:67` (`D-06`). No se agrega una entrada nueva:
  esa idea la cubre.

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | Qué nombre accesible lleva el lápiz nuevo (p. ej. "Editar fecha") y cómo se distingue a simple vista del de "Editar resultado" en el partido finalizado | Lucas Manoukian | Spec | Riesgo 3 de §11; resolver contra el design system |
| OPEN-Q-02 | Mientras se carga el resultado (inscripción cerrada) o se edita el de un partido finalizado, ¿el lápiz de la fecha sigue visible? | Lucas Manoukian | Spec | Sólo es una pregunta de pantalla: el resultado a medio cargar vive en memoria, fuera del partido (`resultadoDraft`, [index.html:1964](../../index.html#L1964)), y cada repintado lo vuelve a dibujar desde ahí ([index.html:7143](../../index.html#L7143)), así que guardar la fecha no lo pierde |
| OPEN-Q-03 | ¿Qué relación declara la Spec con `007`? La prohibición de que `jugador` cambie la fecha no está en ningún FR de `007`: `FR-009b` cubre crear y eliminar. La Spec la introduce como requisito propio y tiene que decir si eso amplía la lista de restricciones de `jugador` de `007` —que `PARTIDO_FINALIZADO_SPEC.md:503-504` describe como "taxativa"— y, si es así, marcarlo en `007` como `AGENTS.md` exige. También, si la lista de acciones validadas en la aplicación de `research.md` §3 se actualiza | Lucas Manoukian | Spec | Obligación de `AGENTS.md` sobre reemplazos |
| OPEN-Q-04 | Guardar sin haber cambiado la fecha, ¿escribe igual o no hace nada? | Lucas Manoukian | Spec | Afecta sólo cuántas escrituras se hacen; no cambia lo que ve nadie |
| OPEN-Q-05 | Si el guardado falla, ¿se acepta el comportamiento de hoy (sin aviso, la fecha vuelve al recargar) o esta feature agrega un aviso? | Lucas Manoukian | Spec | Riesgo 2 de §11. Precedente: `S-07c` de `INTERCAMBIAR_COLORES_SPEC.md` lo aceptó |
| OPEN-Q-06 | Con dos partidos en la misma fecha, ¿en qué orden aparecen en la lista? Hoy el orden compara sólo la fecha ([index.html:7498](../../index.html#L7498)) y, en un empate, depende del orden en que se crearon | Lucas Manoukian | Spec | Ya pasa hoy al crear dos partidos el mismo día; `D-04` lo vuelve más probable |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01, D-02, D-03, D-04, D-05, D-06, D-07,
  D-08, D-09.
- **Decide in Spec:** OPEN-Q-01, OPEN-Q-02, OPEN-Q-03, OPEN-Q-04, OPEN-Q-05,
  OPEN-Q-06.
- **Riesgos a declarar en la Spec:** "gana el último que guarda" en sus dos
  direcciones, y el guardado que falla sin avisar (§11).
- **Must remain non-goals:**
  - "Cambiar la fecha no cambia nada más del partido: ni el estado, ni la
    inscripción, ni la convocatoria, ni los equipos, ni el resultado, ni la
    cancha."
  - "La fecha no es un dato del motor de generación: cambiarla no regenera
    equipos ni aparece en el resumen de generación."
- **Responsive:** la Spec declara el comportamiento desde 360 px del
  encabezado del detalle con el lápiz, en los tres estados y con la inscripción
  cerrada, con la fecha más larga posible, y de la ventana de edición.
- **Para el Plan:** el comentario de
  [index.html:7429-7431](../../index.html#L7429-L7431) dice que el encabezado
  del partido finalizado lleva "fecha (+ cancha en dos columnas)", pero
  `renderEncabezadoPartidoFinalizado` sólo dibuja "Resultado" y sus íconos: la
  fecha del partido finalizado es la del encabezado del detalle, como en los
  demás estados (§6.5). No hay que buscar un segundo lugar.

## 17. Appendix

- Pedido del owner (2026-11-06): "que un admin solamente pueda modificar la
  fecha de un partido en cualquiera de sus estados. Los usuarios 'jugadores' no
  deben poder modificar la fecha."
- Respuestas del owner (2026-11-06): lápiz junto a la fecha; cualquier fecha
  válida, sin otras restricciones; la restricción se hace cumplir sólo en la
  aplicación; sin aviso a los jugadores.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Initial draft. |
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Autocrítica contra la rúbrica, mismo modelo que el autor. 🟡 resueltos: "estado" usado para la inscripción cerrada, que en `001` es una condición y no un estado (TL;DR, `D-02`, §16); el primer non-goal repetía el tercer goal y se fundió en él; la probabilidad del riesgo de "gana el último que guarda" sube de Low a Med, con su motivo. 🔵 resueltos: WCAG 4.1.2 verificado en vivo y marcado como nivel A; nota para el Plan sobre un comentario desactualizado de `index.html:7429`. 🔵 aceptado sin cambio: `D-03` y `D-09` nombran símbolos del código (`ICON_LAPIZ`, `saveMatches()`), detalle de Plan más que de Concept Note, como ya lo hace `intercambiar-colores`. Self-critique: passed (0🔴 / 3🟡 / 3🔵). |
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Enmiendas desde la crítica independiente [`EDITAR_FECHA_PARTIDO_CONCEPT_CRITIQUE_2026-11-06_sonnet-5-5.md`](./EDITAR_FECHA_PARTIDO_CONCEPT_CRITIQUE_2026-11-06_sonnet-5-5.md) (COMMENT, 0🔴 / 5🟡 / 3🔵), cada hallazgo verificado contra el código antes de aplicarlo. Se retira el riesgo "guardar la fecha descarta el resultado a medio cargar": era falso, el borrador vive en memoria y sobrevive al repintado (`index.html:1964`, `7143`); `OPEN-Q-02` queda en sólo visibilidad del lápiz. El riesgo de "gana el último que guarda" cubre las dos direcciones. Riesgo nuevo de guardado que falla sin aviso, con `OPEN-Q-05`. Cita corregida del lápiz de "Editar resultado" (`FR-006`–`FR-008`, `FR-061` de `PARTIDO_FINALIZADO_SPEC.md`). `OPEN-Q-03` reformulada: la restricción de `jugador` es nueva y puede ampliar la lista "taxativa" de `007`. `OPEN-Q-06` nueva (orden con fechas iguales). `D-03` y `D-09` redactadas por comportamiento. §12 aclara que las señales no tienen métrica. Self-critique: skipped (enmienda desde una crítica independiente ya hecha). |

---

*Next document: [Spec](./EDITAR_FECHA_PARTIDO_SPEC.md). The Spec defines
what the system shall do, how it shall behave, and which solutions are
admissible. Concrete implementation details live in the Implementation Plan,
not here and not in the Spec.*
