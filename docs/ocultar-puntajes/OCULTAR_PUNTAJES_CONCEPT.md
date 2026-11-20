# Ocultar los puntajes de la pantalla de equipos — Concept Note

> **Status:** Draft · **Date:** 2026-11-20 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** *not yet written* · **Implementation plan:** *not yet written*

## 1. TL;DR

Hoy el administrador no tiene forma de mostrar los equipos armados sin que se
vean los puntajes: el número sobre cada camiseta, el total de cada equipo, la
píldora de diferencia, la diferencia por línea y "Por qué quedaron así". Se
propone un **botón con un ojo**, sólo para `admin`, a la izquierda del botón de
Copiar en la tarjeta de equipos, en cualquiera de sus estados. Tocarlo oculta
todo lo que revela puntajes o cómo se armaron los equipos —incluidas las
pastillas «2º» y «!» de posición y los candados—, y deja a la vista los
jugadores, el marcador y los goles y asistencias. El objetivo es que la pantalla
se pueda mostrar o capturar para compartirla con el grupo sin herir
susceptibilidades. La decisión que el lector debe conocer antes que ninguna
otra: **ocultar es sólo visual y momentáneo** (`D-04`, `D-05`) —no guarda nada,
no cambia los equipos y vuelve a "mostrar todo" al recargar la página—. Y la
feature corrige además una fuga existente: el rol `jugador` hoy ve el puntaje
total de cada equipo junto al marcador, contra lo que manda `007` (`D-06`).

## 2. Problem statement

- **Pain 1 — no hay una vista "limpia" para compartir.** El administrador arma
  los equipos y quiere mandarlos al grupo como imagen, pero la tarjeta muestra
  el puntaje de cada jugador sobre su camiseta
  ([index.html:5433-5437](../../index.html#L5433-L5437)), el total de cada
  equipo ([index.html:7275](../../index.html#L7275)), la píldora de
  diferencia ([index.html:6957](../../index.html#L6957),
  [index.html:7271](../../index.html#L7271)), la grilla de diferencia por línea
  y "Por qué quedaron así"
  ([index.html:7282-7283](../../index.html#L7282-L7283)). Un jugador que ve que
  vale menos que otro puede sentirse expuesto. Hoy la única salida es recortar
  la imagen a mano o entrar con otra cuenta de rol `jugador`, y ninguna de las
  dos alcanza (Pain 2).
- **Pain 2 — la vista de `jugador` tampoco es limpia.** Aun con una cuenta
  `jugador`, la pantalla muestra las pastillas «2º» y «!» que dicen quién juega
  fuera de su posición principal
  ([index.html:5524-5526](../../index.html#L5524-L5526), sin guarda de rol) y,
  con la inscripción cerrada o el partido finalizado, el puntaje total de cada
  equipo junto al marcador
  ([index.html:7460-7468](../../index.html#L7460-L7468),
  [index.html:7206-7208](../../index.html#L7206-L7208)).
- **Pain 3 — esa segunda parte es además un bug.** `007-permisos-por-usuario`
  prohíbe que `jugador` vea "el puntaje de ningún jugador ... en ninguna parte"
  (`FR-004`) y "los puntajes ... de los equipos armados"
  ([`spec.md:23`](../007-permisos-por-usuario/spec.md)). La rebanada 4 de
  `equipos-en-el-campo` hizo que la fila de resultado muestre el puntaje de
  armado de cada equipo (`FR-041`, `FR-042b`) y que esa rama se comparta entre
  los dos roles (`FR-060` de
  [`PARTIDO_FINALIZADO_SPEC.md`](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md)).
  Los dos specs vigentes se contradicen.

## 3. Goals

- Que el administrador pueda, con un toque, dejar la tarjeta de equipos sin
  ningún dato de puntaje ni de cómo se armaron los equipos, en cualquier estado
  en el que la tarjeta muestra equipos, y volver a verlos con otro toque.
- Que lo que interesa compartir siga a la vista: los jugadores en sus equipos,
  el marcador, los goles, goles en contra y asistencias.
- Que una cuenta `jugador` no vea nunca el puntaje total de un equipo, en
  ningún estado, como ya exige `007`.

## 4. Non-goals

- **Sacar o compartir la captura de pantalla.** Va en una feature aparte; esta
  sólo deja la pantalla lista para capturarla.
- **Cambiar lo que copia el botón Copiar.** Ese texto ya es sólo de nombres,
  sin puntajes ([index.html:6944-6946](../../index.html#L6944-L6946)).
- **Cambiar la vista de `jugador` más allá del total por equipo.** El rol
  `jugador` no recibe el botón y sigue viendo las pastillas «2º» y «!» como
  hoy.
- **Tocar el motor de generación.** Ocultar no regenera nada ni aparece en el
  resumen de generación.

## 5. Vision / desired end state

El administrador termina de armar los equipos del jueves. Antes de mandarlos al
grupo, toca el ojo que está al lado de Copiar. Los números verdes de las
camisetas desaparecen, igual que el total de cada equipo, la píldora de
diferencia, la grilla por línea, "Por qué quedaron así", el selector de
estrategia, los candados y las pastillas «2º» y «!». Quedan las dos canchas con
los nombres de cada jugador. El ojo ahora aparece tachado. Saca la captura, la
manda por WhatsApp, y toca el ojo otra vez para seguir ajustando los equipos con
los números a la vista.

El viernes, con la inscripción cerrada, carga los goles. Al terminar el partido
toca el ojo: se va el puntaje de cada equipo que estaba junto al marcador, pero
el 5–3 y los chips de goles y asistencias sobre cada camiseta siguen ahí. Esa
captura también va al grupo.

Un jugador que entra a la aplicación con su cuenta ve los equipos y el marcador
como siempre, y ya no ve el puntaje de cada equipo al lado del resultado.

### 5.1 System context diagram

No aplica: la feature vive entera dentro de la aplicación existente
(`index.html`), no guarda nada y no cruza ningún límite de sistema.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Ninguna entrada nueva de datos: un botón que alterna
  qué se dibuja. No escribe en Firestore ni en el navegador. Disponible sólo
  para `admin`; para `jugador` no se dibuja.
- **Data sensitivity** — Los puntajes de los jugadores, que `007` trata como
  información que `jugador` no debe ver. La feature no expone nada nuevo y
  cierra una exposición existente (`D-06`).
- **Deployment surface** — Aplicación estática en GitHub Pages, sin cambios.
  Ocultar es una decisión de presentación: los puntajes siguen viajando al
  navegador del `admin`, como hoy. Condición preexistente, no introducida por
  esta feature: el total de cada equipo se calcula en el navegador a partir de
  `data/partidos`, que `jugador` puede leer
  ([`firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md));
  la corrección de `D-06` es de pantalla, igual que el resto de las
  restricciones de `jugador` sobre partidos
  ([`research.md` §3](../007-permisos-por-usuario/research.md)).

## 6. Context & background

- **Existing system** — La tarjeta de equipos ("Alineaciones" mientras se arma,
  "Resultado" con la inscripción cerrada o el partido finalizado) se dibuja en
  `renderTeamsSectionImpl`
  ([index.html:7134-7289](../../index.html#L7134-L7289)) con tres ramas: el
  partido finalizado sin edición, compartida por los dos roles
  ([index.html:7198-7227](../../index.html#L7198-L7227)); la de `jugador`
  ([index.html:7229-7250](../../index.html#L7229-L7250)); y la de `admin`, que
  cubre el armado, la carga del resultado y la edición de un finalizado
  ([index.html:7252-7289](../../index.html#L7252-L7289)). El botón de Copiar
  está en el encabezado de las dos tarjetas: `renderEncabezadoTarjeta`
  ([index.html:6931-6961](../../index.html#L6931-L6961)) y
  `renderEncabezadoPartidoFinalizado`
  ([index.html:7474-7488](../../index.html#L7474-L7488)).
- **Related work** — `007-permisos-por-usuario` fijó qué no ve `jugador`; la
  rama de `jugador` ya oculta casi todo lo que este botón oculta. El handoff de
  `equipos-en-el-campo` previó dos opciones de configuración, `showRatings`
  ("muestra u oculta el puntaje verde sobre la camiseta") y `showLocks`
  ("muestra u oculta el candado")
  ([`handoff/README.md:728-729`](../equipos-en-el-campo/handoff/README.md)),
  diferidas a la rebanada 7, opcional y sin escribir
  ([`EQUIPOS_EN_EL_CAMPO_CONCEPT.md:571-572`](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md)).
- **Organisational context** — Pedido directo del owner el 2026-11-20. La idea
  no estaba en `Roadmap.md` como tal; se superpone en parte con la rebanada 7
  que sí está ([`Roadmap.md:47`](../../Roadmap.md)), ver `OPEN-Q-03`. La fuga
  del total por equipo es un bug nuevo, detectado al investigar esta feature.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence**

- [index.html:6931-6961](../../index.html#L6931-L6961) —
  `renderEncabezadoTarjeta`: los botones van en el orden Intercambiar colores,
  Copiar, Regenerar; la píldora de diferencia va delante de ellos en dos
  columnas. Lugar del ojo, entre Intercambiar y Copiar (`D-01`).
- [index.html:7474-7488](../../index.html#L7474-L7488) —
  `renderEncabezadoPartidoFinalizado`: Copiar y, sólo para `admin`, Editar
  resultado. Segundo lugar del ojo (`D-01`).
- [index.html:899-903](../../index.html#L899-L903) — `.panel-icono` mide 44 px
  y `.panel-icono-copiar` usa `var(--muted)`: el estilo que el ojo copia
  (`D-01`).
- [index.html:5433-5437](../../index.html#L5433-L5437) — el puntaje sobre la
  camiseta, ya con guarda `admin` (`D-02`).
- [index.html:5442-5449](../../index.html#L5442-L5449) — el candado, que sólo
  existe con `esFilaEditable(m)`, o sea con la inscripción abierta: "si la
  inscripción no se cerró, tampoco el candado" se cumple ocultándolo siempre
  que esté (`D-02`).
- [index.html:5518-5526](../../index.html#L5518-L5526) — las pastillas «2º» y
  «!», sin guarda de rol: las ve también `jugador` (Pain 2, `D-02`, §4).
- [index.html:5799-5806](../../index.html#L5799-L5806) — en una columna, la
  pestaña de cada equipo lleva una «!» con cuántos están fuera de puesto
  (`D-02`).
- [index.html:7271](../../index.html#L7271),
  [index.html:6957](../../index.html#L6957) — la píldora de diferencia, en su
  propia fila en una columna y en el encabezado en dos (`D-02`).
- [index.html:7275](../../index.html#L7275),
  [index.html:7206-7208](../../index.html#L7206-L7208),
  [index.html:7460-7468](../../index.html#L7460-L7468) — los tres lugares del
  total por equipo: el encabezado de cada campo en la rama de `admin`, el del
  partido finalizado en una columna, y la fila de resultado en dos columnas.
  Los dos últimos los ven los dos roles (Pain 3, `D-02`, `D-06`).
- [index.html:5207-5215](../../index.html#L5207-L5215) — el total por equipo se
  actualiza también fuera del repintado (por `id`), así que ocultarlo no es
  sólo una cuestión del dibujo inicial. Nota para el Plan.
- [index.html:7282-7283](../../index.html#L7282-L7283) — la grilla de
  diferencia por línea y "Por qué quedaron así", sólo en la rama de `admin`
  (`D-02`).
- [index.html:6969-7020](../../index.html#L6969-L7020) — el combo de
  estrategia, el aviso de equipos desactualizados y el aviso de bloqueo, todos
  sólo para `admin` y sólo con la inscripción abierta (`D-02`).
- [index.html:7905-7990](../../index.html#L7905-L7990) — la lista de
  convocados, al lado de la tarjeta en dos columnas, no muestra puntajes: no
  hace falta tocarla.
- [index.html:1545-1562](../../index.html#L1545-L1562) — la única preferencia
  de pantalla que hoy se recuerda (el orden del listado) se guarda en
  Firestore por cuenta. El ojo no la imita (`D-05`, §9.3).

**Industry-standard evidence**

- *Regulatory:* WCAG 2.1 AA, criterio 4.1.2 *Name, Role, Value*
  (<https://www.w3.org/TR/WCAG21/#name-role-value>) — un botón sólo de ícono
  necesita un nombre accesible, y uno que alterna entre dos estados tiene que
  exponer en cuál está. `[UNVERIFIED — criterio citado de la Concept Note de
  editar-fecha-partido, verificado allí el 2026-11-06; no se volvió a abrir]`.
  El texto concreto queda para la Spec (`OPEN-Q-01`).
- *Architectural:* ninguna restricción más allá de las del proyecto.
- *Style / project convention:* [`AGENTS.md`](../../AGENTS.md) — Simplicidad
  ante todo, Responsive desde 360 px (con escenario nuevo en
  `tests/layout.test.js` que se vea fallar), Design system como fuente de
  verdad de UI, obligación de declarar qué parte de un spec existente se
  reemplaza. Design system en
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/):
  los íconos son de Lucide
  ([`Icon.prompt.md:1`](../../.claude/skills/football-app-design/components/core/Icon.prompt.md)),
  que trae `eye` y `eye-off` (`D-01`). `[UNVERIFIED — los dos nombres de
  ícono son de memoria; el Plan los confirma contra lucide-static@0.544.0]`.

**Prior-art evidence**

- [`007-permisos-por-usuario/spec.md`](../007-permisos-por-usuario/spec.md) —
  `FR-004`, `FR-006`, `FR-013`: qué no ve `jugador`. Es la referencia de "qué
  es un dato de puntaje" que este botón oculta (`D-02`, `D-06`).
- [`PARTIDO_FINALIZADO_SPEC.md`](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md) —
  `FR-041`, `FR-042b`, `FR-060`: el origen de la fuga de Pain 3 (`D-06`).
- [`handoff/README.md:728-729`](../equipos-en-el-campo/handoff/README.md) —
  `showRatings` y `showLocks`, la misma necesidad pensada como configuración
  (§9.2, `OPEN-Q-03`).
- [`006-copiar-formacion`](../006-copiar-formacion/spec.md) — compartir la
  formación por WhatsApp ya existe como texto sin puntajes; esta feature es su
  equivalente visual (§4).
- Productos pares: no se investigaron (ver §7.1).

## 7. Research & industry context

### 7.1 How established products handle this

No se investigó. El comportamiento lo fijó el owner directamente y es
específico de esta aplicación: no hay una decisión abierta que un producto par
pudiera resolver.

### 7.2 Relevant prior art / papers / standards

- WCAG 2.1, criterio 4.1.2 — el ojo es un botón sólo de ícono que alterna
  entre dos estados (§6.5).

### 7.3 Proofs of concept

No hubo PoC. El comportamiento se deduce del código leído en §6.5.

## 8. Proposed direction

### 8.1 Approach

Un botón de ícono nuevo en el encabezado de la tarjeta de equipos, sólo para
`admin`, pegado a la izquierda de Copiar. Aparece en todos los estados en los
que hoy aparece Copiar: el armado, la carga del resultado con la inscripción
cerrada, el partido finalizado y la edición de un finalizado. Muestra un ojo
mientras todo está visible y un ojo tachado mientras está oculto.

Tocarlo pasa la pantalla a "oculto": se dejan de dibujar los elementos de
`D-02` y se repinta. Tocarlo de nuevo vuelve a "visible". Nada se guarda: el
estado vive en la memoria de la página, vale para cualquier partido que se abra
y vuelve a "visible" al recargar.

Aparte del botón, y siempre, la fila de resultado y el encabezado del campo del
partido finalizado dejan de mostrar el total por equipo a `jugador`.

### 8.2 Information / data model sketch

No hay entidades ni campos nuevos, ni en Firestore ni en el navegador. Un único
valor en memoria, "visible" u "oculto", que arranca en "visible" (`D-05`).

## 9. Alternatives considered

### 9.1 Un modo "ver como jugador"

- **Description:** que el ojo dibuje la pantalla con la rama de `jugador`.
- **Pros:** reutiliza una vista que ya existe y ya oculta casi todo.
- **Cons:** esa vista muestra las pastillas «2º» y «!», saca botones que el
  administrador sigue necesitando (Regenerar, Editar resultado), y mezcla rol
  con presentación. Lo que se oculta queda definido por accidente, no por una
  lista.
- **Decision:** Rejected como definición. El Plan puede reutilizar lo que le
  sirva de esa rama, pero lo que se oculta es la lista de `D-02`.

### 9.2 Una opción en Configuración (`showRatings`, `showLocks`)

- **Description:** las opciones del handoff, como ajuste guardado.
- **Pros:** ya estaban diseñadas.
- **Cons:** obliga a ir a otra pantalla para sacar una captura y volver; queda
  activa y el administrador arma equipos a ciegas sin darse cuenta. Tampoco
  cubre el total, la píldora, la grilla ni "Por qué quedaron así".
- **Decision:** Rejected — el owner pidió un botón en la misma pantalla.
  `OPEN-Q-03` decide qué pasa con la entrada de `Roadmap.md`.

### 9.3 Recordar el estado del ojo

- **Description:** guardar "oculto" por cuenta, como el orden del listado.
- **Pros:** el administrador que siempre comparte no tiene que tocarlo cada
  vez.
- **Cons:** una lectura y una escritura más en Firestore, y el riesgo de
  quedarse armando sin ver los números días después sin recordar por qué.
- **Decision:** Deferred — ver §14.

### 9.4 No construir nada

- **Description:** recortar la captura, o usar una cuenta `jugador`.
- **Pros:** cero código.
- **Cons:** recortar no saca los números de las camisetas; la cuenta `jugador`
  muestra «2º», «!» y, hoy, el total por equipo (Pain 2).
- **Decision:** Rejected.

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | Un botón de ícono con un ojo (Lucide `eye` visible, `eye-off` oculto), sólo para `admin`, inmediatamente a la izquierda de Copiar en el encabezado de la tarjeta de equipos. Está en todos los estados en que la tarjeta muestra equipos y Copiar: armado, carga del resultado (inscripción cerrada), partido finalizado y edición de un finalizado. Mismo tamaño y peso que Copiar | Pedido del owner el 2026-11-20 ("a la izquierda del ícono que copia la formación", "algo con un ojo"); `admin` elegido por el owner, porque `jugador` ya no ve casi nada de esto | Easy |
| D-02 | En "oculto" no se dibuja: el puntaje sobre cada camiseta; las pastillas «2º» y «!»; la «!» con contador de las pestañas Blanco/Negro; los candados (que sólo existen con la inscripción abierta); el total de cada equipo, en todos sus lugares; la píldora de diferencia, en sus dos ubicaciones; la grilla de diferencia por línea; "Por qué quedaron así"; el combo de estrategia; el aviso de equipos desactualizados y el aviso de bloqueo | Pedido del owner el 2026-11-20; el combo y los avisos agregados por el owner al preguntarle, para que la captura no tenga ningún indicio de puntajes | Easy |
| D-03 | En "oculto" se sigue viendo: las canchas, los jugadores y las duplas; el marcador; los chips de goles, goles en contra y asistencias; las filas de detalle; la barra y las acciones de carga; los demás botones del encabezado y de la botonera | Pedido del owner: los goles y asistencias se deben poder ver | Easy |
| D-04 | Ocultar es sólo visual. No cambia equipos, bloqueos ni resultado, no guarda nada y no interviene en el motor ni en el resumen de generación. Los gestos de edición (arrastrar, tocar para intercambiar, cargar por toque) siguen funcionando en "oculto"; bloquear no, porque el candado no se ve | Simplicidad ante todo; el motor no cambia (Explicabilidad) | Easy |
| D-05 | Un único estado para toda la página, que vale para cualquier partido. Arranca en "visible" y vuelve a "visible" al recargar. No se guarda en Firestore ni en el navegador | Simplicidad ante todo, y evita armar equipos a ciegas sin saberlo (§9.3) | Easy |
| D-06 | Se corrige una fuga existente: `jugador` no ve el total de ningún equipo, en ningún estado, con o sin el botón. Reemplaza, para `jugador`, la parte de `FR-041` y `FR-042b` de `PARTIDO_FINALIZADO_SPEC.md` que muestra el puntaje de armado; `FR-060` de ese spec queda acotado en consecuencia | Elegido por el owner el 2026-11-20; alinea con `FR-004` de `007` (Pain 3) | Easy |
| D-07 | El rol `jugador` no cambia en nada más: sin botón, y con las pastillas «2º» y «!» como hoy | El pedido apunta al administrador que comparte; `007` no prohíbe a `jugador` ver posiciones | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| El administrador deja la pantalla en "oculto" y sigue armando sin ver los números, o cree que el partido no tiene puntajes | Med | Med | El ícono tachado dice en qué estado está; recargar vuelve a "visible" (`D-05`) |
| Una feature futura agrega otro dato de puntaje a la tarjeta y se olvida del ojo: la captura vuelve a mostrar puntajes | Med | Med | La Spec enumera cada elemento con su escenario; un test por elemento hace visible el olvido |
| El total por equipo se vuelve a escribir fuera del repintado ([index.html:5207-5215](../../index.html#L5207-L5215)) y reaparece en "oculto" después de un arrastre | Med | Med | La Spec incluye un escenario de arrastre en "oculto"; nota para el Plan en §16 |
| A 360 px, un botón más de 44 px en el encabezado (con Intercambiar, Copiar y Regenerar) desarma el renglón | Med | Med | La Spec declara el comportamiento desde 360 px y el Plan agrega un escenario a `tests/layout.test.js` que se vea fallar |
| Los textos que aparecen al pasar el mouse sobre una camiseta ("sin puntaje", "su puesto es …") siguen diciendo cosas que la pantalla oculta | Low | Low | No salen en una captura; se decide en `OPEN-Q-02` |
| Algún jugador extraña ver el total de su equipo junto al resultado (`D-06`) | Low | Low | Es lo que `007` ya prometía; se comunica en el grupo si alguien pregunta |

## 12. Success signals

- El administrador comparte capturas de los equipos sin recortarlas.
- Ningún jugador ve puntajes en una captura compartida ni en su propia cuenta.

Ninguna tiene métrica: la aplicación no registra el uso del botón (`D-05`). Se
juzgan por lo que el owner observa en el grupo.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** ninguno nuevo; Firestore sin cambios.
- **Upstream specs / RFCs:** `007-permisos-por-usuario` (`FR-004`, `FR-006`,
  `FR-013`); rebanadas 1, 3, 4 y 6 de `equipos-en-el-campo` (camiseta,
  candado, panel de armado, partido finalizado, carga por toque);
  `posiciones-del-jugador` (pastillas «2º» y «!» y la «!» de las pestañas);
  `intercambiar-colores` (el botón que queda a la izquierda del ojo);
  `006-copiar-formacion` (el botón de referencia).
- **Downstream consumers:** la feature de captura de pantalla, que el owner
  hará aparte, parte de la pantalla en "oculto".

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (owner del producto).
- **Reviewing teams:** *pending*.
- **Customers / partners:** los jugadores del grupo, que reciben las capturas y
  dejan de ver el total por equipo en su cuenta.

## 14. Out of scope / deferred

- **Sacar y compartir la captura.** — *deferred until* la feature aparte que
  anunció el owner (§4).
- **Recordar el estado del ojo entre sesiones.** — *deferred until* que el
  owner note que lo activa siempre antes de compartir (§9.3). Se agrega a
  `Roadmap.md` al crear la Spec.
- **Que `jugador` deje de ver «2º» y «!».** — *deferred until* que el owner lo
  pida (`D-07`).

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | Qué nombre accesible y qué texto al pasar el mouse lleva el botón en cada estado (p. ej. "Ocultar puntajes" / "Mostrar puntajes"), y cómo expone en qué estado está | Lucas Manoukian | Spec | WCAG 4.1.2 (§6.5) |
| OPEN-Q-02 | En "oculto", ¿los textos de la camiseta al pasar el mouse y el nombre accesible de las pestañas ("2 fuera de puesto") también dejan de mencionar puntaje y posición? | Lucas Manoukian | Spec | No salen en una captura; los lee un lector de pantalla |
| OPEN-Q-03 | ¿Esta feature cubre `showRatings` y `showLocks` de la rebanada 7, y su entrada de `Roadmap.md:47` se acota o se retira? | Lucas Manoukian | Spec | `AGENTS.md` pide retirar una idea del Roadmap cuando se convierte en documento |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01, D-02, D-03, D-04, D-05, D-06, D-07.
- **Decide in Spec:** OPEN-Q-01, OPEN-Q-02, OPEN-Q-03.
- **Declaración de reemplazo obligatoria (`AGENTS.md`):** `D-06` reemplaza,
  para `jugador`, la parte de `FR-041`, `FR-042b` y `FR-060` de
  `PARTIDO_FINALIZADO_SPEC.md` que muestra el puntaje de armado; marcarla ahí
  como reemplazada.
- **Must remain non-goals:** la captura; el texto de Copiar; la vista de
  `jugador` más allá del total; el motor.
- **Responsive:** la Spec declara el comportamiento desde 360 px del
  encabezado con el ojo, en los cuatro estados de `D-01`, con Intercambiar
  colores presente, y de la tarjeta en "oculto" (sin huecos donde estaban la
  píldora y la grilla).
- **Para el Plan:** el total por equipo se reescribe por `id` fuera del
  repintado ([index.html:5207-5215](../../index.html#L5207-L5215)); la guarda
  de "oculto" tiene que alcanzar también ahí.

## 17. Appendix

- Pedido del owner (2026-11-20): un botón con un ojo, a la izquierda del de
  Copiar, en la pantalla de equipos en cualquiera de sus estados, que oculte
  los puntajes, los íconos de posición, los candados con la inscripción
  abierta, los totales por equipo, la píldora de diferencia, la diferencia por
  línea y "Por qué quedaron así", dejando visibles goles y asistencias, para
  compartir la pantalla con usuarios no admin.
- Respuestas del owner (2026-11-20): los íconos de posición son la «2º», la «!»
  y la «!» de las pestañas; el botón es sólo de `admin`; la fuga del total para
  `jugador` se corrige en esta feature; el combo de estrategia y los avisos
  también se ocultan.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-11-20 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Self-critique: skipped (first-run baseline). |

---

*Next document: Spec. The Spec defines what the system shall do, how it shall
behave, and which solutions are admissible. Concrete implementation details
live in the Implementation Plan, not here and not in the Spec.*
