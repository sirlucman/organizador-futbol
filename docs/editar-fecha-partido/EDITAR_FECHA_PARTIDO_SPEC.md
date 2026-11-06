# Editar la fecha de un partido — Spec

> **Status:** Draft · **Date:** 2026-11-06 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [EDITAR_FECHA_PARTIDO_CONCEPT.md](./EDITAR_FECHA_PARTIDO_CONCEPT.md)
>
> **Implementation plan:** *not yet written*

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5 *Sources &
> Origins* del Concept Note. Donde un `FR-*`/`NFR-*`/`TC-*` se apoya en una ubicación de
> código o en una Spec vigente que el Concept Note no cubre, la cita va **en línea** en la
> sección donde se define el requisito. Las anclas de línea de `index.html` son las del
> commit `004529c`.

> **Declaración de reemplazo (gobernanza vigente en [`AGENTS.md`](../../AGENTS.md)).**
> Esta Spec **amplía** a
> [`007-permisos-por-usuario/spec.md`](../007-permisos-por-usuario/spec.md) en dos puntos:
>
> - **La lista taxativa de restricciones de `jugador`** (*Assumptions*, línea 145 tras la marca de esta Spec; 139 en `004529c`: "Lo que
>   no está explícitamente restringido … permanece disponible para 'jugador'") suma una
>   restricción nueva: una cuenta `jugador` no puede cambiar la fecha de un partido
>   (`FR-003`, `FR-004`, `FR-004b` de esta Spec). Sin esta declaración, la regla de ese punto haría
>   que la acción nueva quedara disponible para `jugador` por no estar en la lista.
> - **`FR-014`** (línea 107: las restricciones se aplican también en la persistencia) no se
>   cumple para esta restricción, igual que para las demás acciones sobre `data/partidos`:
>   queda dentro de la limitación aceptada de
>   [`research.md` §3](../007-permisos-por-usuario/research.md) (`D-06`).
>
> Esta Spec **amplía** además a `FR-001` de
> [`001-organizacion-partidos/spec.md`](../001-organizacion-partidos/spec.md) (línea 102,
> "la fecha es obligatoria"): al crear un partido la fecha pasa a ser obligatoria **y
> válida** (`FR-020`), porque el alta y la edición comparten ventana (`TC-011`). Decisión
> del owner del 2026-11-06.
>
> Las dos ampliaciones quedan marcadas en el spec viejo en la misma rama que esta Spec
> (`AGENTS.md`: "Esa parte queda marcada como reemplazada en el spec viejo"), no en el
> Plan. Esto cierra `OPEN-Q-03` del Concept Note, confirmado por el owner el 2026-11-06.
>
> **No reemplaza** a `FR-006`–`FR-008` ni `FR-061` de
> [`PARTIDO_FINALIZADO_SPEC.md`](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md):
> el lápiz de "Editar resultado" sigue donde está y como está.

## 1. Purpose

Esta Spec define el comportamiento de la acción "Editar fecha": quién la ve y en qué
estados del partido, cómo es la ventana con la que se edita, qué fechas acepta, qué cambia
en el partido y qué no, y qué muestra la aplicación después. Está escrita para quien
implemente y pruebe la feature. No cubre la motivación ni las alternativas descartadas (ver
Concept Note §2 y §9) ni el detalle de funciones, archivos y ramas, que vive en el
Implementation Plan.

## 2. Summary

Hoy la fecha de un partido se elige al crearlo y no se puede cambiar. Esta feature agrega,
sólo para el administrador, un botón con un lápiz pegado a la fecha del encabezado del
detalle del partido, en cualquier estado. Tocarlo abre la misma ventana de "Nuevo partido",
con el título "Editar fecha", sólo el campo Fecha —ya cargado con la fecha actual— y los
botones Cancelar y Guardar. Al guardar cambia la fecha y nada más: convocatoria, equipos y
resultado quedan intactos, la pantalla se repinta y la lista de partidos lo ubica según la
fecha nueva. El rol `jugador` no ve el lápiz y la acción no le cambia nada aunque la invoque
directamente. El producto sigue siendo el mismo organizador de partidos: el motor no cambia
y la fecha sigue sin intervenir en ningún cálculo.

## 3. Scope

### 3.1 In scope

- Botón de ícono "Editar fecha" junto a la fecha del encabezado del detalle.
- Condiciones de disponibilidad por rol, en los tres estados y con la inscripción cerrada.
- Reutilización de la ventana "Nuevo partido" en modo edición, sin el campo Cancha.
- Validación de la fecha, cambio del campo `fecha`, guardado y repintado.
- La misma validación de la fecha al crear un partido (Declaración de reemplazo sobre
  `001`).
- Orden de la lista de partidos después del cambio, incluido el empate de fechas.
- Ampliación de la lista de restricciones de `jugador` de `007` (Declaración de reemplazo).

### 3.2 Out of scope / non-goals

Restatean los non-goals del Concept Note §4 y §14 como límites verificables.

- El sistema no modificará, al cambiar la fecha, ningún otro dato del partido: ni el
  estado, ni la inscripción, ni la convocatoria, ni los equipos, ni el resultado, ni la
  cancha.
- El sistema no regenerará equipos al cambiar la fecha ni la mencionará en el resumen de
  generación.
- El sistema no permitirá cambiar la cancha de un partido existente: la ventana de edición
  no muestra el campo Cancha (diferido, Concept Note §14).
- El sistema no avisará a los jugadores del cambio ni guardará la fecha anterior, quién la
  cambió ni cuándo (`D-07`).
- El sistema no cambiará las reglas de Firestore (`D-06`).

### 3.3 Constraints inherited from the Concept Note

- **D-01** (sólo `admin`; oculto a `jugador`; sin efecto si se invoca directo) — heredada.
  Ver `FR-001`, `FR-003`, `FR-004`, `FR-004b`, `TC-040`.
- **D-02** (en los tres estados y con la inscripción cerrada) — heredada. Ver `FR-001`,
  `FR-002`.
- **D-03** (botón de ícono con el mismo lápiz que "Editar resultado", pegado a la fecha;
  ventana con la forma de "Nuevo partido", fecha precargada, Cancelar y Guardar) —
  heredada y precisada: la ventana es *la misma* de "Nuevo partido", reutilizada, y no una
  copia (owner, 2026-11-06; enmienda registrada en el Change log del Concept Note). Ver
  `FR-001`, `FR-010` a `FR-013`, `TC-011`, `TC-012`, `TC-030`.
- **D-04** (obligatoria; cualquier fecha válida, pasada o futura, aunque se repita) —
  heredada y precisada: "la misma validación que al crear" pasa a ser una validación más
  estricta que la de hoy, aplicada en los dos modos de la ventana (owner, 2026-11-06;
  enmienda registrada en el Change log del Concept Note). Ver `FR-020`, `FR-021`.
- **D-05** (cambia sólo `fecha`) — heredada. Ver `FR-030`, `FR-031`, `NFR-003`.
- **D-06** (la restricción se cumple en la aplicación; las reglas no cambian) — heredada.
  Ver `TC-014`, `TC-040` y la Declaración de reemplazo.
- **D-07** (sin aviso ni registro) — heredada. Ver `FR-046`, `TC-013`.
- **D-08** (el motor no cambia; la fecha no aparece en el resumen) — heredada. Ver
  `FR-060`, `TC-010`.
- **D-09** (se guarda en el acto con el guardado de siempre y se repinta) — heredada. Ver
  `FR-040`, `FR-041`, `FR-041b`, `TC-001`.

**Respuestas del owner del 2026-11-06** que fijan esta Spec más allá del Concept Note:
botón de sólo ícono con el lápiz, elegido entre cuatro variantes dibujadas a 360 y 1200 px
(texto "Editar", lápiz + "Editar", botón con borde, sólo lápiz); el lápiz sigue visible
mientras se carga o edita el resultado; la ventana es la de "Nuevo partido" reutilizada,
con el campo Cancha oculto; guardar sin cambiar la fecha no escribe; el guardado que falla
se trata como hoy; el lápiz no aparece para `jugador` en ningún estado; se amplía la lista
de restricciones de `007`; con fechas iguales no hay desempate nuevo; el alta valida la
fecha igual que la edición.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — El cambio de fecha se persistirá a través del mismo guardado que usan las
  demás acciones sobre un partido (`saveMatches()`,
  [index.html:2475-2499](../../index.html#L2475-L2499)), que pasa por la interfaz
  `window.storage`; no se escribirá en Firestore por otro camino (principio de
  Arquitectura desacoplada de `AGENTS.md`).
- **TC-002** — La feature no agregará ninguna dependencia ni glifo nuevo: el botón usa el
  lápiz que ya existe (`ICON_LAPIZ`, [index.html:6865](../../index.html#L6865)).

### 4.2 Architectural / integration constraints

- **TC-010** — Las funciones del motor de generación (`generarEquiposEstrategia1` a `4`,
  `resolverArqueros`, `window.__generarEquipos`) no se modificarán (`D-08`).
- **TC-011** — La ventana de edición será la ventana "Nuevo partido" que ya existe
  (`#newMatchModal`, [index.html:1405-1426](../../index.html#L1405-L1426)), reutilizada:
  no se agregará una segunda ventana con un campo de fecha propio. Decisión del owner del
  2026-11-06.
- **TC-012** — El botón vivirá dentro del grupo de la fecha del encabezado del detalle que
  ya existe (`.detail-header-fecha`,
  [index.html:1326-1329](../../index.html#L1326-L1329)), y no en las acciones de la derecha
  (`.detail-header-actions`) ni en un contenedor nuevo (Concept Note §9.1).
- **TC-013** — No se persistirá ningún campo nuevo: ni la fecha anterior, ni quién ni
  cuándo la cambió (`D-07`).
- **TC-014** — Las reglas de Firestore no se modificarán (`D-06`;
  [`firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md)).

### 4.3 Compliance / regulatory constraints

*Ninguna* — ver Concept Note §5.2, sin datos regulados ni personales.

### 4.4 Conventions to follow

- **TC-030** — Los valores visuales del botón (color, trazo, tamaño del glifo, objetivo
  táctil, transición) saldrán del patrón ya usado por el lápiz de "Editar resultado"
  (`.panel-icono`, [index.html:882-883](../../index.html#L882-L883); botón en
  [index.html:7438-7442](../../index.html#L7438-L7442)), documentado en
  [`handoff/README.md` § Botones de ícono del header](../equipos-en-el-campo/handoff/README.md),
  con el nombre accesible que pide `IconButton`
  (`.claude/skills/football-app-design/components/core/IconButton.prompt.md`: "Always pass
  `label` — it becomes both the accessible name and the tooltip"). La ventana conserva los
  estilos que ya tiene. No se necesita ninguna excepción al design system.
- **TC-031** — Todo test que satisfaga un `S-*`, `NFR-*` o `TC-*` de esta Spec lo
  declarará embebiendo su identificador en forma canónica dentro de un literal de cadena,
  con el prefijo de feature `fecha/`: el título del caso en el archivo de tests unitarios
  de la feature y el campo `spec:` de cada escenario de `tests/layout.test.js` (`AGENTS.md`
  § Tests). El prefijo no lo usa ninguna otra feature (verificado con `grep` sobre
  `tests/*.js` el 2026-11-06). Los `FR-*` no llevan binding propio y se cubren a través de
  los escenarios que los citan.
- **TC-032** — El escenario responsive del encabezado con el botón nuevo se agregará a
  `tests/layout.test.js` y se verá fallar al menos una vez antes de darlo por bueno
  (`AGENTS.md`, principio Responsive).

### 4.5 Security constraints (`MD-31`)

CWE Top 25 consultado en vivo el 2026-11-06: edición 2025
(`https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html`).

- **TC-040** — Cada manejador de la acción —el que abre la ventana en modo edición y el
  que guarda— comprobará dentro de sí mismo que el rol de la sesión sea `admin` antes de
  modificar nada, y no sólo al decidir si dibuja el botón — mismo patrón que la guarda
  `if(!isAdmin()) return; // FR-009b` de crear y eliminar
  ([index.html:8134](../../index.html#L8134), [index.html:7618](../../index.html#L7618)),
  **defends `CWE-862` *Missing Authorization***.
- **TC-041** — El guardado de la fecha y el alta de partido aceptarán sólo un texto `YYYY-MM-DD` que sea una fecha real del
  calendario (el formato que leen `formatFecha` y el orden de la lista,
  [index.html:2225-2229](../../index.html#L2225-L2229),
  [index.html:7498](../../index.html#L7498)); cualquier otro valor no modifica el partido
  ni se guarda, **defends `CWE-20` *Improper Input Validation***.
- **`CWE-284` / `CWE-863`** — ruling, no commitment: que `jugador` pueda escribir
  `data/partidos` según las reglas es una condición preexistente
  ([`firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md)), no
  introducida ni agravada por esta feature, que no toca las reglas (`D-06`, `TC-014`).
- **`CWE-79` *XSS*** — no aplica: el encabezado pinta la fecha con `textContent`
  ([index.html:7648](../../index.html#L7648)), y donde se inserta con `innerHTML` (la
  tarjeta de la lista, [index.html:7508](../../index.html#L7508)) lo que se inserta es la
  salida de `toLocaleDateString`, no el texto guardado. Además `TC-041` impide guardar otra
  cosa que una fecha. El botón inserta literales fijos.
- **`CWE-200`** — no aplica: la fecha ya es un dato público del partido, visible para los
  dos roles, y se sigue guardando en el mismo documento.
- **`CWE-352` *CSRF*** — no aplica: no hay endpoint propio con sesión por cookie; la
  escritura va por el SDK de Firestore con el token del usuario.
- Resto de la lista (`CWE-89`, `-787`, `-22`, `-416`, `-125`, `-78`, `-94`, `-120`, `-434`,
  `-476`, `-121`, `-502`, `-122`, `-306`, `-918`, `-77`, `-639`, `-770`) — no aplica: sin
  SQL, sin memoria manual, sin sistema de archivos, sin comandos, sin subidas, sin
  deserialización de datos no confiables, sin pedidos del servidor, y la acción exige
  sesión autenticada con rol.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador | Sesión con rol `admin`; crea, cierra, finaliza y elimina partidos | Corregir la fecha de un partido sin perder nada de lo que ya tiene |
| Jugador | Sesión con rol `jugador`; ve los partidos y se anota o se da de baja | Ver la fecha correcta de cada partido, sin poder cambiarla |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero cambiar la fecha de un partido en cualquier estado, para corregir un error o una postergación sin eliminarlo y volver a crearlo. | FR-001, FR-002, FR-010, FR-021, FR-030, FR-031, FR-040 |
| US-02 | Como administrador, quiero que la lista de partidos se reordene con la fecha nueva, para que el historial siga en el orden real. | FR-042, FR-043, FR-050 |
| US-03 | Como administrador, quiero poder arrepentirme antes de guardar, para no cambiar una fecha sin querer. | FR-012, FR-032 |
| US-04 | Como jugador, quiero ver la fecha nueva del partido, sin poder cambiarla yo. | FR-003, FR-004, FR-045 |

## 6. Glossary

| Term | Definition |
|---|---|
| Encabezado del detalle | La franja superior de la pantalla de un partido, con la fecha, la cancha, la pastilla de estado y, para `admin`, las acciones de inscripción y eliminar ([index.html:1323-1339](../../index.html#L1323-L1339)). Es la misma en todos los estados. |
| Lápiz de la fecha | El botón de ícono de esta Spec, pegado a la fecha del encabezado del detalle. Distinto del lápiz de "Editar resultado", que vive en la tarjeta del resultado de un partido finalizado. |
| Ventana de partido | La ventana `#newMatchModal`. En modo alta se titula "Nuevo partido" y tiene Cancha, Fecha y "Crear partido"; en modo edición se titula "Editar fecha" y tiene sólo Fecha y "Guardar". |
| Fecha válida | Un texto `YYYY-MM-DD` que corresponde a un día real del calendario (`TC-041`). |
| Estado del partido | Uno de los tres valores de `001` (*Key Entities*): Inscripción abierta, Equipos generados, Finalizado. |
| Inscripción cerrada | Condición de un partido no finalizado con `inscripcionCerrada`, en la que se carga el resultado (modo de carga). No es un estado. |

## 7. Functional requirements

### 7.1 Disponibilidad y acceso

- **FR-001** — Mientras el rol de la sesión sea `admin`, el sistema mostrará junto a la
  fecha del encabezado del detalle un botón de sólo ícono con el lápiz, en cualquiera de
  los tres estados del partido y también con la inscripción cerrada.
- **FR-002** — Mientras el administrador carga el resultado de un partido con la
  inscripción cerrada, o edita el resultado de un partido finalizado, el sistema seguirá
  mostrando el lápiz de la fecha (resuelve `OPEN-Q-02` del Concept Note).
- **FR-002b** — Cuando el sistema cambie la fecha mientras se carga o se edita un
  resultado, conservará lo que esté a medio cargar o editar (el borrador vive fuera del
  partido, en `resultadoDraft` y `editandoResultadoFinalizado`,
  [index.html:1964-1965](../../index.html#L1964-L1965), y el repintado lo vuelve a dibujar
  desde ahí, [index.html:7143](../../index.html#L7143)).
- **FR-003** — Donde el rol de la sesión sea `jugador`, el sistema no mostrará el lápiz
  de la fecha en ningún estado del partido ni con la inscripción cerrada: ni a la vista ni
  para un lector de pantalla (pedido del owner del 2026-11-06).
- **FR-004** — Si el rol de la sesión no es `admin` y la apertura de la ventana en modo
  edición se invoca directamente, entonces el sistema no abrirá la ventana en modo edición
  (`TC-040`).
- **FR-004b** — Si el rol de la sesión no es `admin` y el guardado de la fecha se invoca
  directamente, entonces el sistema no cambiará el partido (`TC-040`).
- **FR-005** — Si la apertura o el guardado se invocan sobre un partido que no existe,
  entonces el sistema no cambiará ningún partido (mismo patrón que eliminar,
  [index.html:7619-7620](../../index.html#L7619-L7620)).

### 7.2 La ventana

- **FR-010** — Cuando el administrador toque el lápiz de la fecha, el sistema abrirá la
  ventana de partido en modo edición: título "Editar fecha", el campo Fecha cargado con la
  fecha actual del partido, y los botones "Cancelar" y "Guardar".
- **FR-011** — Mientras la ventana de partido esté en modo edición, el sistema no mostrará
  el campo Cancha.
- **FR-011b** — Cuando el sistema abra la ventana de partido, en cualquiera de sus dos
  modos, no mostrará ningún mensaje de error que haya quedado de un uso anterior.
- **FR-012** — Cuando el administrador toque "Cancelar", el sistema cerrará la ventana sin
  modificar el partido ni guardarlo.
- **FR-013** — Cuando el administrador abra "Nuevo partido" después de haber usado la
  ventana en modo edición, el sistema la mostrará en modo alta: título "Nuevo partido",
  campo Cancha visible, campo Fecha vacío y botón "Crear partido", igual que hoy
  ([index.html:8126-8131](../../index.html#L8126-L8131)).

### 7.3 Validación

- **FR-020** — Si al tocar el botón principal de la ventana de partido, en cualquiera de
  sus dos modos ("Guardar" o "Crear partido"), el campo Fecha está vacío o su valor no es
  una fecha válida, entonces el sistema rechazará la acción mostrando en la ventana abierta
  el mensaje "Elegí una fecha para el partido." —el mismo de hoy,
  [index.html:8137](../../index.html#L8137)—. El caso no vacío existe porque el selector
  acepta años de más de cuatro cifras (`A-01`); en el modo alta amplía `FR-001` de `001`
  (Declaración de reemplazo).
- **FR-021** — El sistema aceptará cualquier fecha válida, pasada o futura, en cualquier
  estado del partido, aunque otro partido tenga la misma (`D-04`).
- **FR-022** — Si el guardado se invoca directamente, sin pasar por la ventana, con un
  valor que no es una fecha válida, entonces el sistema no modificará el partido ni lo
  guardará (`TC-041`).

### 7.4 Qué cambia y qué no

- **FR-030** — Cuando el administrador toque "Guardar" con una fecha válida distinta de la
  actual, el sistema reemplazará la fecha del partido por la elegida.
- **FR-031** — El sistema no modificará, al cambiar la fecha, ningún otro campo del
  partido (`D-05`).
- **FR-032** — Cuando el administrador toque "Guardar" con la misma fecha que el partido
  ya tiene, el sistema cerrará la ventana sin guardar (resuelve `OPEN-Q-04` del Concept
  Note).

### 7.5 Guardado y lo que se ve después

- **FR-040** — Cuando el sistema cambie la fecha, guardará el partido en el acto, sin
  pedir confirmación (`TC-001`).
- **FR-041** — Cuando el sistema cambie la fecha, cerrará la ventana.
- **FR-041b** — Cuando el sistema cambie la fecha, repintará el detalle del partido con la
  fecha nueva, sin salir del detalle y sin que haga falta recargar.
- **FR-042** — Cuando el sistema cambie la fecha, la lista de partidos mostrará el partido
  en la posición que le corresponde por la fecha nueva, con el orden que ya existe (más
  reciente primero, [index.html:7498](../../index.html#L7498)).
- **FR-043** — Después de un cambio de fecha, todo lugar de la aplicación que muestra la
  fecha del partido —el encabezado del detalle, la tarjeta de la lista y el texto de la
  confirmación de eliminar ([index.html:7621](../../index.html#L7621))— mostrará la fecha
  nueva.
- **FR-044** — Si el guardado falla, entonces el sistema se comportará como con cualquier
  otra edición del partido hoy: el error queda registrado en la consola del navegador y la
  pantalla muestra la fecha nueva, sin manejo propio (resuelve `OPEN-Q-05` del Concept
  Note; precedente `S-07c` de
  [`INTERCAMBIAR_COLORES_SPEC.md`](../intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md)).
- **FR-045** — Cuando un jugador cargue la aplicación después de un cambio de fecha ya
  guardado, el sistema le mostrará la fecha nueva (una sesión ya abierta la ve al
  recargar, `A-03`).
- **FR-046** — El sistema no mostrará ningún aviso de que la fecha cambió, a ningún rol
  (`D-07`).

### 7.6 Orden con fechas iguales

- **FR-050** — Entre partidos con la misma fecha, la lista los mostrará en el orden
  relativo en que están guardados, que es el orden en que se crearon; cambiar la fecha de
  un partido no altera ese orden guardado (resuelve `OPEN-Q-06` del Concept Note: sin
  criterio de desempate nuevo, como hoy, `A-02`; confirmado por el owner el 2026-11-06).

### 7.7 Motor de generación

- **FR-060** — Cuando el sistema cambie la fecha de un partido con equipos generados, no
  regenerará los equipos ni modificará el resumen de generación (`D-08`).

## 8. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive | Con el lápiz de la fecha en el encabezado del detalle, con la fecha de texto más largo (día y mes de más letras, p. ej. "miércoles, 30 de septiembre", 2026-09-30) y la pastilla de estado más larga, en los tres estados y con la inscripción cerrada, y con la ventana de partido abierta en modo edición: en 360 px, en cada breakpoint de CSS que afecta al encabezado medido de los dos lados y en la franja de tablet, a la vez (1) `scrollWidth === clientWidth` y (2) ningún elemento con el borde derecho fuera del viewport. |
| NFR-002 | Accessibility | El lápiz de la fecha tiene el nombre accesible y el título "Editar fecha" —distinto de "Editar resultado"— (WCAG 2.1, criterio 4.1.2 *Name, Role, Value*). Su objetivo táctil mide al menos 44 × 44 px, el tamaño de `.panel-icono` y del lápiz de "Editar resultado" (precedente del proyecto, `TC-030`; no deriva de 4.1.2). |
| NFR-003 | Compatibilidad de datos | Comparado campo a campo tal como se guarda (su forma JSON), un partido después de un cambio de fecha difiere del anterior sólo en `fecha`, y los demás partidos no cambian. Ningún campo nuevo aparece. Que el guardado reescriba los documentos completos (`TC-001`) no cuenta como campo cambiado. |
| NFR-004 | Escrituras | Un *pedido de guardado* es una invocación del guardado común (`saveMatches()`, `TC-001`); las escrituras a `window.storage` que esa invocación haga debajo —dos para `admin`, [index.html:2492](../../index.html#L2492) y [index.html:2497](../../index.html#L2497)— no se cuentan por separado. Guardar con la misma fecha (`FR-032`), cancelar (`FR-012`) o fallar la validación (`FR-020`, `FR-022`) hace cero pedidos de guardado; un cambio de fecha hace exactamente uno. |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — El administrador cambia la fecha de un partido con equipos generados (covers FR-001, FR-010, FR-011, FR-030, FR-031, FR-040, FR-041, FR-041b, FR-043, FR-046, NFR-003)

- **Given** un partido del sábado 14 de noviembre con equipos generados y la inscripción
  abierta
- **And** una sesión con rol `admin` en un viewport de 1200 px
- **When** el administrador toca el lápiz de la fecha
- **Then** se abre la ventana "Editar fecha" con el campo Fecha en 2026-11-14, sin campo
  Cancha
- **When** elige el domingo 15 de noviembre y toca "Guardar"
- **Then** la ventana se cierra y el encabezado dice "Domingo, 15 de noviembre"
- **And** los equipos, la convocatoria, el estado y la cancha están exactamente como antes
- **And** el partido se guardó, sin confirmación previa

**Variants:**

- `S-01a [boundary]` — partido en Inscripción abierta sin equipos: mismo resultado
  (`FR-001`)
- `S-01b [boundary]` — inscripción cerrada con un resultado a medio cargar: el lápiz está
  visible y, después de guardar la fecha, el resultado a medio cargar sigue en pantalla
  (`FR-002`, `FR-002b`)
- `S-01c [boundary]` — partido finalizado: el resultado, los goles, las asistencias y las
  estadísticas acumuladas de cada jugador quedan idénticos (`FR-031`)
- `S-01d [boundary]` — partido finalizado con su resultado en edición: el lápiz de la
  fecha está visible y, después de guardar la fecha, la edición del resultado sigue abierta
  con lo que tenía (`FR-002`, `FR-002b`)
- `S-01e [boundary]` — una fecha de hace un año y una de dentro de un año: las dos se
  aceptan (`FR-021`)
- `S-01f [property]` — para cualquier partido y cualquier fecha válida distinta de la
  suya, el partido guardado después del cambio difiere del anterior sólo en `fecha`, y los
  demás partidos no cambian (`NFR-003`)
- `S-01g [concurrency]` — doble toque en "Guardar": la fecha cambia una vez y se hace
  exactamente un pedido de guardado (`NFR-004`)
- `S-01h [failure]` — el guardado falla: el error queda en la consola, la pantalla
  muestra la fecha nueva y al recargar vuelve la anterior, sin manejo propio (`FR-044`)
- `S-01i [boundary]` — después de guardar, el administrador tampoco ve ningún aviso de
  que la fecha cambió (`FR-046`)

#### Scenario S-02 — La lista se reacomoda con la fecha nueva (covers FR-042, FR-043, FR-050)

- **Given** tres partidos con fechas 1, 8 y 15 de noviembre, en ese orden de creación
- **When** el administrador cambia la fecha del partido del 1 de noviembre al 22 de
  noviembre y vuelve a la lista
- **Then** la lista los muestra en el orden 22, 15 y 8 de noviembre
- **And** la tarjeta del partido movido dice la fecha nueva

**Variants:**

- `S-02a [boundary]` — la fecha nueva es igual a la de otro partido: los dos aparecen
  juntos, en el orden en que se crearon (`FR-050`, `A-02`)
- `S-02b [boundary]` — después del cambio, el administrador toca eliminar ese partido: la
  confirmación nombra la fecha nueva (`FR-043`)

#### Scenario S-03 — El administrador se arrepiente (covers FR-012, FR-013, NFR-004)

- **Given** el detalle de un partido abierto por un `admin`
- **When** toca el lápiz de la fecha, elige otra fecha y toca "Cancelar"
- **Then** la ventana se cierra, la fecha del partido no cambió y no se pidió ningún
  guardado

**Variants:**

- `S-03a [boundary]` — vuelve a tocar el lápiz: la ventana muestra la fecha guardada, no
  la que había elegido antes de cancelar (`FR-010`)
- `S-03b [boundary]` — después de usar la ventana en modo edición, toca "Nuevo partido":
  la ventana dice "Nuevo partido", muestra Cancha, la Fecha está vacía y el botón dice
  "Crear partido" (`FR-013`)
- `S-03c [boundary]` — después de un error de fecha vacía en modo edición, abre "Nuevo
  partido" o vuelve a tocar el lápiz: no se ve el mensaje de error anterior (`FR-011b`)

#### Scenario S-04 — Guardar sin cambiar la fecha no escribe (covers FR-032, NFR-004)

- **Given** el detalle de un partido abierto por un `admin`
- **When** toca el lápiz de la fecha y toca "Guardar" sin cambiar nada
- **Then** la ventana se cierra y no se pidió ningún guardado

**Variants:**

- `S-04a [boundary]` — elige otra fecha y vuelve a elegir la original antes de guardar:
  tampoco se pide guardado

#### Scenario S-05 — Los jugadores ven la fecha nueva (covers FR-003, FR-045, FR-046)

- **Given** el administrador cambió y guardó la fecha de un partido
- **When** un jugador carga la aplicación y abre ese partido
- **Then** ve la fecha nueva en la lista y en el encabezado
- **And** no ve el lápiz de la fecha ni ningún aviso de que la fecha cambió

**Variants:**

- `S-05a [concurrency]` — una sesión de jugador abierta desde antes del cambio sigue viendo
  la fecha anterior hasta recargar (`FR-045`)

#### Scenario S-06 — El lápiz en el encabezado (covers FR-001, NFR-001, NFR-002)

- **Given** un partido finalizado y una sesión `admin` en 1200 px
- **When** se abre el detalle del partido
- **Then** el encabezado muestra el lápiz pegado a la fecha, con nombre accesible y
  título "Editar fecha"
- **And** la tarjeta del resultado conserva su propio lápiz, llamado "Editar resultado"

**Variants:**

- `S-06a [boundary]` — a 360 px, con la fecha más larga y la pastilla más larga, en cada
  estado y con la inscripción cerrada: la página no desborda y ningún elemento queda fuera
  del viewport (`NFR-001`)
- `S-06b [boundary]` — a cada lado de cada breakpoint de CSS que afecta al encabezado y
  en la franja de tablet: las mismas dos condiciones (`NFR-001`)
- `S-06c [boundary]` — la ventana en modo edición a 360 px: las mismas dos condiciones
  (`NFR-001`)
- `S-06d [boundary]` — el objetivo táctil del lápiz mide al menos 44 × 44 px (`NFR-002`)
- `S-06e [boundary]` — partido finalizado a 360 px: los dos lápices están a la vista sin
  superponerse; la distinción entre ellos es por ubicación y nombre, sin diferencia
  visual en el ícono (decisión del owner, `OPEN-Q-01` del Concept Note)

#### Scenario S-07 — El motor no se entera (covers FR-060)

- **Given** un partido con equipos generados y su resumen de generación
- **When** el administrador cambia la fecha
- **Then** los equipos y el resumen de generación son idénticos a los de antes, y no se
  ejecutó ninguna generación

Variants: none — single-path scenario.

### 9.2 Edge cases

Sin escenarios independientes: los casos borde viven como variantes de §9.1.

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Fecha vacía o inválida (covers FR-005, FR-020, FR-022, TC-041)

- **Given** la ventana "Editar fecha" abierta por un `admin`
- **When** borra la fecha y toca "Guardar"
- **Then** la ventana sigue abierta con el mensaje "Elegí una fecha para el partido."
- **And** el partido no cambió y no se pidió ningún guardado

**Variants:**

- `S-20a [failure]` — el guardado se invoca directamente con un valor que no es una fecha
  válida (`"2026-02-30"`, `"15/11/2026"`, un texto cualquiera): el partido no cambia y no
  se pide guardado (`FR-022`)
- `S-20b [boundary]` — en la ventana se elige una fecha con un año de cinco cifras
  (`"20260-11-15"`), que el selector acepta: la ventana sigue abierta con el mismo mensaje
  y no se pide guardado (`FR-020`, `A-01`)
- `S-20c [failure]` — en "Nuevo partido" se elige una fecha con un año de cinco cifras y
  se toca "Crear partido": la ventana sigue abierta con el mismo mensaje y no se crea
  ningún partido (`FR-020` en modo alta, `TC-041`)
- `S-20d [failure]` — un `admin` invoca la apertura o el guardado directamente con el id
  de un partido que no existe: ningún partido cambia y no se pide guardado (`FR-005`)

#### Scenario S-21 — Un jugador no puede cambiar la fecha (covers FR-003, FR-004, FR-004b, TC-040)

- **Given** un partido en Inscripción abierta y una sesión `jugador`
- **When** se abre el detalle del partido
- **Then** el encabezado no tiene el lápiz de la fecha, ni visible ni en el árbol de
  accesibilidad

**Variants:**

- `S-21a [failure]` — la apertura de la ventana en modo edición se invoca directamente
  con sesión `jugador`: la ventana no se abre en modo edición y el partido no cambia
  (`FR-004`)
- `S-21b [failure]` — el guardado se invoca directamente con sesión `jugador` y una fecha
  válida: el partido no cambia y no se pide ningún guardado (`FR-004b`)
- `S-21c [boundary]` — partido con Equipos generados: no hay lápiz (`FR-003`)
- `S-21d [boundary]` — partido con la inscripción cerrada: no hay lápiz (`FR-003`)
- `S-21e [boundary]` — partido Finalizado: no hay lápiz de la fecha ni el de "Editar
  resultado" (`FR-003`; `FR-061` de `PARTIDO_FINALIZADO_SPEC.md`)
- `S-21f [boundary]` — a 360 px y a 1200 px: no hay lápiz en ningún ancho (`FR-003`)

## 10. Data model & external contracts

No hay entidades ni campos nuevos: la acción reescribe el campo `fecha` que el partido ya
tiene ([index.html:8138](../../index.html#L8138)). Se omite el `erDiagram` de §10.1.1 por
criterio de `MD-24` (sólo es obligatorio con una entidad nueva o más).

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore `data/partidos` | Mismo JSON de hoy, sin campos nuevos | outbound | Sólo cambia `fecha` del partido editado (`NFR-003`) |
| Cloud Firestore `data/partidosArmado` | Mismo JSON de hoy, sin cambios de contenido | outbound | El guardado de siempre lo reescribe para `admin` ([index.html:2497](../../index.html#L2497)); la fecha no vive ahí |

### 10.3 External APIs / events the feature exposes

Ninguno.

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9 (S-01 a S-07, S-20, S-21 y sus variantes) pasan
  (covers FR-001 a FR-060).
- **AC-02** — La propiedad de `S-01f` pasa sobre partidos en cada estado y con la
  inscripción cerrada.

### 11.2 Non-functional acceptance

- **AC-10** — `NFR-001` verificado por un escenario de `tests/layout.test.js` que se vio
  fallar antes del arreglo (`TC-032`).
- **AC-11** — `NFR-002` verificado midiendo el lápiz y leyendo su nombre accesible en el
  mismo escenario.
- **AC-12** — `NFR-003` verificado por un test que compara los partidos antes y después
  del cambio y enumera los campos distintos.
- **AC-13** — `NFR-004` verificado contando los pedidos de guardado en `S-01g`, `S-03`,
  `S-04`, `S-04a`, `S-20`, `S-20a`, `S-20b` y `S-20d`.

### 11.3 Constraint compliance

- **AC-15** — `TC-001`, `TC-002` verificados por revisión de código: el cambio llama al
  guardado de siempre, reutiliza `ICON_LAPIZ` y no hay dependencias nuevas.
- **AC-16** — `TC-010` verificado por el diff: ninguna función del motor aparece
  modificada.
- **AC-17** — `TC-011`, `TC-012` verificados por revisión de código: hay una sola ventana
  con campo de fecha y el botón vive dentro de `.detail-header-fecha`.
- **AC-18** — `TC-013` verificado por el test de `AC-12`: no aparece ningún campo nuevo.
- **AC-19** — `TC-014` verificado por el diff: los archivos de reglas no cambian.
- **AC-20** — `TC-030` verificado por revisión de código contra `.panel-icono` y el
  botón de "Editar resultado".
- **AC-21** — `TC-031`, `TC-032` verificados por el gate de IDs del Plan y por la
  evidencia de la corrida fallida del escenario responsive.
- **AC-22** — `TC-040` verificado por `S-21a` y `S-21b` invocando los manejadores
  directamente.
- **AC-23** — `TC-041` verificado por `S-20a`, `S-20b` y `S-20c`.

### 11.4 Negative / safety acceptance

- **AC-24** — En `S-03`, `S-04`, `S-20`, `S-20a`, `S-20b`, `S-20d`, `S-21a` y `S-21b` ningún
  partido cambia y no se pide ningún guardado; en `S-20c` no se crea ningún partido.

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 —incluida cada variante— tiene al menos un test
  referenciado en el §12.1 del Plan, con el ID embebido según `TC-031`. Todo encabezado de
  escenario en §9 va seguido de un bloque `Variants:` o de la declaración explícita
  `Variants: none — single-path scenario`.
- **AC-51** — Todo NFR cuantificado en §8 tiene un test de medición referenciado en el §12
  del Plan.
- **AC-52** — Todo TC de §4 tiene un chequeo en §11.3 y una entrada en el §12 del Plan.
- **AC-53** — El cambio tiene al menos una fila `IMP-*` en el §12.2 del Plan por cada
  alcance materialmente afectado (`code`/`system`/`business`/`external`).
- **AC-54** — Todo NFR cuantificado en §8 tiene al menos una fila `OBS-*` en el §11 del
  Plan. Como la aplicación no tiene telemetría (§12), cada `OBS-*` es de tipo *automated
  check*: el test que mide el NFR, con su umbral de falla —precedente:
  [`INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md:402-405`](../intercambiar-colores/INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md).
- **AC-55** — El lockfile de la rama no tiene ningún advisory sin waiver, o el Plan
  declara `Supply-chain: none — <reason>` en su §5. El repositorio no versiona lockfile
  (`AGENTS.md` § Dependencias), así que se espera la declaración `none`.

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Correcciones sin recrear | El administrador deja de eliminar y recrear partidos para corregir una fecha | Observación directa del owner (app de un solo grupo, sin telemetría, `D-07`) |
| Lista en orden real | Cero reportes de partidos en un lugar equivocado del historial por su fecha | Feedback directo del grupo |
| Sin cambios de `jugador` | Ninguna cuenta `jugador` reporta haber podido cambiar una fecha desde la aplicación | Feedback directo del grupo |

## 13. Dependencies

- **Upstream services / specs:** `001-organizacion-partidos` (`FR-001`),
  `007-permisos-por-usuario` (ampliada, ver Declaración de reemplazo), `rol-en-el-token`
  (contrato de reglas), `PARTIDO_FINALIZADO_SPEC.md` (`FR-006`–`FR-008`, `FR-061`, sin
  cambios).
- **Internal modules / teams:** ninguno — proyecto de una persona.
- **Feature flags / config:** ninguno.
- **Third-party APIs:** ninguna nueva — Firebase ya en uso.

## 14. Assumptions

- **A-01** — Un `<input type="date">` entrega un texto vacío o una *valid date string*:
  "If the value of the element is not a valid date string, then set it to the empty
  string instead" (HTML Living Standard, § Date state,
  <https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date)>, verificado el
  2026-11-06). Una *valid date string* admite años de **cuatro o más** cifras, así que el
  selector puede entregar un valor no vacío que no es una fecha válida en el sentido de
  esta Spec (`FR-020`, `S-20b`). La misma brecha existe hoy en el alta de partido
  (`index.html:8137` sólo comprueba que no esté vacía) y esta Spec la cierra en los dos
  modos (`S-20c`).
- **A-02** — El orden de la lista es estable: entre fechas iguales conserva el orden del
  arreglo guardado, que es el de creación (los partidos se agregan al final,
  [index.html:8139](../../index.html#L8139)). Desde ECMAScript 2019, "the specification
  dictates that `Array.prototype.sort` is stable" (MDN,
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort>,
  verificado el 2026-11-06). Supone navegadores con ES2019 o posterior; `S-02a` lo
  comprueba en el Chromium de los tests.
- **A-03** — La aplicación no sincroniza en vivo: no escucha cambios de Firestore, así
  que una sesión abierta ve lo que otra guardó recién al recargar (`grep` de `onSnapshot`
  sobre `index.html`: cero coincidencias, verificado el 2026-11-06).

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| "Gana el último que guarda", dirección (a): una sesión de `jugador` abierta desde antes del cambio guarda otra acción (por ejemplo, darse de baja) y devuelve la fecha a la anterior, sin aviso | Med | Med | Condición preexistente del guardado (`Roadmap.md:70`), no introducida por esta feature. Sin mitigación propia (Simplicidad ante todo). Se corrige volviendo a editar la fecha |
| "Gana el último que guarda", dirección (b): un `admin` con la lista cargada desde antes de que los jugadores se anoten o se den de baja guarda la fecha nueva y pisa esas altas y bajas | Med | Med | Misma condición preexistente. `FR-032` evita al menos la escritura cuando no hay cambio de fecha. Recomendación de uso: recargar antes de cambiar la fecha con la inscripción abierta |
| El guardado falla sin aviso y al recargar vuelve la fecha anterior | Med | Low | Aceptado como en toda edición (`FR-044`, `S-01h`) |
| Dos lápices en el partido finalizado y el administrador toca el que no quería | Low | Med | Nombres accesibles distintos (`NFR-002`), ubicaciones distintas (`TC-012`) y `S-06`. Tocar el equivocado no cambia nada hasta guardar |
| La ventana reutilizada queda en un modo equivocado: "Nuevo partido" se abre sin Cancha o con el título de edición, o la edición crea un partido nuevo | Med | Med | `FR-013`, `S-03b`, `S-03c` |
| A 360 px el lápiz junto a una fecha larga y la pastilla desarma el encabezado | Med | Med | `NFR-001`, `S-06a`–`S-06c`, `TC-032` |
| Una cuenta `jugador` con conocimientos técnicos escribe una fecha nueva directamente en Firestore | Low | Low | Limitación aceptada (`D-06`, Declaración de reemplazo) |

## 16. Open questions

Ninguna abierta. Resueltas en esta Spec las seis del Concept Note: `OPEN-Q-01` (`FR-001`,
`NFR-002`: el mismo lápiz, llamado "Editar fecha", decisión del owner del 2026-11-06),
`OPEN-Q-02` (`FR-002`), `OPEN-Q-03` (Declaración de reemplazo), `OPEN-Q-04` (`FR-032`),
`OPEN-Q-05` (`FR-044`) y `OPEN-Q-06` (`FR-050`). Todas las respuestas son del owner del
2026-11-06 (§3.3). `OPEN-Q-03` y `OPEN-Q-06` las propuso primero el autor y el owner las
confirmó después de la crítica independiente.

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** FR-001 a FR-060 (incluidos los `b`), NFR-001 a NFR-004, TC-001 a
  TC-041, AC-01 a AC-55, las constraints heredadas en §3.3 y la Declaración de reemplazo.
- **Plan has freedom over:** cómo la ventana distingue el modo alta del modo edición, los
  nombres de los manejadores, si la validación de `TC-041` es una función pura recortable
  por `tests/harness.js`, en qué archivo de `tests/` viven los tests unitarios, qué
  breakpoints concretos afectan al encabezado, y el orden de commits.
- **Plan must resolve:** nada abierto; `A-01` y `A-02` quedaron verificados contra fuente
  primaria.
- **Plan must also:** conviene sumar los manejadores nuevos a la lista de
  [`research.md` §3](../007-permisos-por-usuario/research.md) —no lo exige `AGENTS.md`,
  que habla del spec viejo, y `intercambiar-colores` no lo hizo—; y corregir el comentario desactualizado de
  [index.html:7429-7431](../../index.html#L7429-L7431) si toca esa zona (Concept Note §16).
- **Unverified markers heredados:** ninguno.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Initial draft desde la Concept Note (`004529c`). Decisiones del owner del 2026-11-06: lápiz de sólo ícono "Editar fecha" (elegido entre cuatro variantes dibujadas), visible también mientras se carga o edita el resultado, la ventana es la de "Nuevo partido" reutilizada sin el campo Cancha, guardar sin cambios no escribe, la falla del guardado se trata como hoy. Resueltas por el autor con la opción sin alcance nuevo: `OPEN-Q-03` (se amplía la lista de `007`) y `OPEN-Q-06` (sin desempate nuevo). Self-critique: skipped (pendiente de decisión del owner). |
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | A pedido del owner, `FR-003` explicita que el lápiz no aparece para `jugador` en ningún estado ni para un lector de pantalla; `S-21` pasa a un estado concreto y suma `S-21c`–`S-21f`, una variante por estado, por la inscripción cerrada y por ancho. Self-critique: skipped (enmienda acotada). |
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Autocrítica contra la rúbrica (per-doc y cross-doc contra la Concept Note), mismo modelo que el autor. 🔴 resueltos: `FR-002` y `FR-011` eran compuestos (EARS, una obligación por línea) y se parten en `FR-002`/`FR-002b` y `FR-011`/`FR-011b`; `A-01` y `A-02` llevaban `[UNVERIFIED]` con motivo ilegítimo ("no se contrastó") y quedan verificados contra el HTML Living Standard y MDN; `TC-030` afirmaba sin fuente que `.panel-icono` "ya se resolvió contra el design system" y pasa a citar el handoff y `IconButton.prompt.md`. 🟡 resueltos: verificar `A-01` mostró que el selector acepta años de cinco o más cifras, así que `FR-020` rechaza también un valor no vacío inválido (`S-20b` nueva) y `FR-022` queda para la invocación directa; las AC de §11.3 y §11.4 se renumeran `AC-20`–`AC-24` para cerrar el hueco de `AC-20`. 🔵 resueltos: la fecha de ejemplo de `NFR-001` era un día de semana que no corresponde a 2026; las variantes de `S-21` quedan en orden. 🔵 sin cambio: `D-03` del Concept Note dice "misma forma que Nuevo partido" y esta Spec fija "la misma ventana" por decisión del owner (§3.3); conviene una fila en el Change log del Concept Note. `TC-011`/`TC-012` nombran selectores del DOM, como el precedente de `intercambiar-colores`. Self-critique: passed (4🔴 / 2🟡 / 4🔵). |
| 2026-11-06 | Lucas Manoukian (claude-opus-5-5) | Enmiendas desde la crítica independiente [`EDITAR_FECHA_PARTIDO_SPEC_CRITIQUE_2026-11-06_sonnet-5-5.md`](./EDITAR_FECHA_PARTIDO_SPEC_CRITIQUE_2026-11-06_sonnet-5-5.md) (CHANGES REQUESTED, 1🔴 / 4🟡 / 7🔵), cada hallazgo verificado contra el código antes de aplicarlo. 🔴: las ampliaciones de `007` se marcan en el spec viejo en esta misma rama, no en el Plan. 🟡: `FR-004` se parte en `FR-004`/`FR-004b` y `FR-041` en `FR-041`/`FR-041b`; la aclaración de `FR-045` pasa a `A-03`; `NFR-004` define "pedido de guardado" como una invocación de `saveMatches()`; `OPEN-Q-03` y `OPEN-Q-06` confirmadas por el owner; `D-03` y `D-04` precisadas con fila en el Change log del Concept Note. Decisión nueva del owner: el alta de partido valida la fecha igual que la edición (`FR-020` en los dos modos, `TC-041`, `S-20c`, ampliación de `FR-001` de `001` marcada en ese spec). 🔵: `NFR-002` deja de atribuir el tamaño de 44 px a WCAG 4.1.2; `S-01g` pasa a "exactamente un" pedido; `S-01i` nueva (el admin tampoco ve aviso); `S-05a` pasa a `[concurrency]`; `FR-005` y `S-20d` nuevas (partido inexistente); `S-06e` nueva (los dos lápices a 360 px); §3.3 suma las respuestas del owner; §17 deja de presentar `research.md` como obligación de `AGENTS.md`; `AC-54` fija que sin telemetría cada `OBS-*` es un *automated check*. Self-critique: skipped (enmienda desde una crítica independiente ya hecha). |

---

*This Spec defines what the system shall do, how it shall behave, and which solutions
are admissible. Concrete implementation choices live in
[EDITAR_FECHA_PARTIDO_IMPLEMENTATION_PLAN.md](./EDITAR_FECHA_PARTIDO_IMPLEMENTATION_PLAN.md).
Motivation and decision rationale live in
[EDITAR_FECHA_PARTIDO_CONCEPT.md](./EDITAR_FECHA_PARTIDO_CONCEPT.md).*
