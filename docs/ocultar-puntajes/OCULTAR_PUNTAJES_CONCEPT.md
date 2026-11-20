# Ocultar los puntajes de la pantalla de equipos — Concept Note

> **Status:** Draft · **Date:** 2026-11-20 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** [OCULTAR_PUNTAJES_SPEC.md](./OCULTAR_PUNTAJES_SPEC.md) · **Implementation plan:** *not yet written*

## 1. TL;DR

Hoy el administrador no tiene forma de mostrar los equipos armados sin que se
vean los puntajes: el número sobre cada camiseta, el total de cada equipo, la
píldora de diferencia, la diferencia por línea y "Por qué quedaron así". Se
propone un **botón con un ojo**, sólo para `admin`, a la izquierda del botón de
Copiar en la tarjeta de equipos, en cualquiera de sus situaciones (`D-01`). Tocarlo oculta
todo lo que revela puntajes o cómo se armaron los equipos —incluidas las
pastillas «2º» y «!» de posición y los candados—, y deja a la vista los
jugadores, el marcador y los goles y asistencias. El objetivo es que la pantalla
se pueda mostrar o capturar para compartirla con el grupo sin herir
susceptibilidades. La decisión que el lector debe conocer antes que ninguna
otra: **ocultar es sólo visual y momentáneo** (`D-04`, `D-05`) —no guarda nada,
no cambia los equipos y vuelve a "mostrar todo" al recargar la página—. Y la
feature corrige además un bug existente: el rol `jugador` hoy ve un "pts" por
equipo junto al marcador, calculado sin los puntajes que no recibe, contra lo
que manda `007` (`D-06`).

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
  dos alcanza (Pain 2). `[INFERRED — el owner no describió cómo lo resuelve
  hoy; son los dos caminos que la aplicación deja abiertos]`
- **Pain 2 — la vista de `jugador` tampoco es limpia.** Aun con una cuenta
  `jugador`, la pantalla muestra las pastillas «2º» y «!» que dicen quién juega
  fuera de su posición principal
  ([index.html:5524-5526](../../index.html#L5524-L5526), sin guarda de rol; la
  posición asignada viaja en el documento público, `index.html:2514`) y, con la
  inscripción cerrada o el partido finalizado, un "pts" por equipo junto al
  marcador
  ([index.html:7460-7468](../../index.html#L7460-L7468),
  [index.html:7206-7208](../../index.html#L7206-L7208)).
- **Pain 3 — ese "pts" es además un bug.** `007-permisos-por-usuario` prohíbe
  que `jugador` vea "el puntaje de ningún jugador (propio ni ajeno) en ninguna
  parte de la plataforma" (`FR-004`) y dice que "no puede ver puntajes propios
  ni de los equipos armados"
  ([`spec.md:23`](../007-permisos-por-usuario/spec.md)). La rebanada 4 de
  `equipos-en-el-campo` hizo que la fila de resultado muestre el puntaje de
  armado de cada equipo (`FR-041`, `FR-042b`) y que esa rama se comparta entre
  los dos roles (`FR-060` de
  [`PARTIDO_FINALIZADO_SPEC.md`](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md)).
  Los dos specs vigentes se contradicen. `FR-060` sí consideró `007` y concluyó
  que su lista era taxativa y no alcanzaba la fila; pero `FR-013` de `007` dice
  en positivo que `jugador` ve "los equipos ya armados (sin puntajes,
  estrategia, diferencias, bloqueados ni explicación)"
  ([`spec.md:106`](../007-permisos-por-usuario/spec.md)).
  Y el número que ve `jugador` ni siquiera es el real. **Hecho, por el código
  leído:** el total se suma con el puntaje de cada jugador
  (`sumaVigenteDeEquipo`, [index.html:6440-6443](../../index.html#L6440-L6443));
  `jugador` nunca recibe `playerScores`
  ([index.html:2276](../../index.html#L2276),
  [index.html:2355-2357](../../index.html#L2355-L2357)), así que cada jugador
  queda con puntajes vacíos ([index.html:2346](../../index.html#L2346)), cada
  sumando da `null` y el total da 0. **Sin comprobar:** lo que se ve en
  pantalla con una cuenta `jugador` de staging, que por esa cadena debería ser
  "0 pts" en cada equipo.

## 3. Goals

- Que el administrador pueda, con un toque, dejar la tarjeta de equipos sin
  ningún dato de puntaje ni de cómo se armaron los equipos, en cualquiera de
  las cuatro situaciones en que la tarjeta muestra equipos (`D-01`), y volver a
  verlos con otro toque.
- Que lo que interesa compartir siga a la vista: los jugadores en sus equipos,
  el marcador, los goles, goles en contra y asistencias.
- Que una cuenta `jugador` no vea nunca el puntaje total de un equipo, en
  ningún estado, como ya exige `007`.

## 4. Non-goals

- **Sacar o compartir la captura de pantalla.** Va en una feature aparte; esta
  sólo deja la pantalla lista para capturarla.
- **Cambiar lo que copia el botón Copiar.** Ese texto ya es sólo de nombres,
  sin puntajes ([index.html:6944-6946](../../index.html#L6944-L6946)).
- **Un botón de ocultar para `jugador`.** A `jugador` ya no se le muestran
  puntajes; no hay nada que ocultarle a pedido. (Que deje de ver «2º» y «!» es
  otra cosa, diferida en §14.)
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
como siempre, y ya no ve un "pts" al lado del nombre de cada equipo.

### 5.1 System context diagram

No aplica: la feature vive entera dentro de la aplicación existente
(`index.html`), no guarda nada y no cruza ningún límite de sistema.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Ninguna entrada nueva de datos: un botón que alterna
  qué se dibuja. No escribe en Firestore ni en el navegador. Disponible sólo
  para `admin`; para `jugador` no se dibuja.
- **Data sensitivity** — Los puntajes de los jugadores, que `007` trata como
  información que `jugador` no debe ver. La feature no expone nada nuevo. El
  bug de `D-06` no filtra puntajes reales: `jugador` nunca recibe
  `playerScores` ([index.html:2276](../../index.html#L2276)), así que el "pts"
  que ve es un número calculado sin ellos (Pain 3).
- **Deployment surface** — Aplicación estática en GitHub Pages, sin cambios.
  Ocultar es una decisión de presentación: los puntajes siguen viajando al
  navegador del `admin`, como hoy, y siguen sin llegar al de `jugador`, porque
  las reglas de Firestore no le dejan leer `playerScores` ni `partidosArmado`
  ([`firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md),
  filas `data/playerScores` y `data/partidosArmado`: "—" para `jugador`).

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
  que sí está ([`Roadmap.md:47`](../../Roadmap.md)), ver `OPEN-Q-03`. El "pts"
  por equipo de `jugador` es un bug nuevo, detectado al investigar esta feature.

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
- [index.html:5211-5216](../../index.html#L5211-L5216) —
  `updateTeamTotalsDisplay` reescribe el total por `id` fuera del repintado,
  pero hoy nadie la llama (una búsqueda en `index.html` y `tests/` sólo
  encuentra su definición): el total sólo se dibuja al repintar. Nota para el
  Plan (§16).
- [index.html:7160-7168](../../index.html#L7160-L7168) — la pantalla de un
  partido sin equipos generados dibuja "Generar equipos", el aviso de bloqueo
  y el combo de estrategia, sin el encabezado donde va Copiar: queda fuera del
  ojo (`D-05`).
- [index.html:5402-5405](../../index.html#L5402-L5405),
  [index.html:812](../../index.html#L812),
  [index.html:5807](../../index.html#L5807) — durante la selección para
  intercambiar puesto, la candidata que dejaría a alguien fuera de puesto se
  pinta de rojo y cada pestaña muestra cuántas opciones tiene (`D-02`).
- [index.html:5861-5863](../../index.html#L5861-L5863) — el encabezado de
  cada campo se dibuja siempre que tenga contenido, aunque ese contenido esté
  oculto por CSS: sacar el "pts" puede dejar un encabezado vacío (§16).
- [index.html:7282-7283](../../index.html#L7282-L7283) — la grilla de
  diferencia por línea y "Por qué quedaron así", sólo en la rama de `admin`
  (`D-02`).
- [index.html:6969-7020](../../index.html#L6969-L7020) — el combo de
  estrategia, el aviso de equipos desactualizados y el aviso de bloqueo, todos
  sólo para `admin` y sólo con la inscripción abierta (`D-02`).
- [index.html:4836-4843](../../index.html#L4836-L4843) — con titulares de
  posiciones del catálogo anterior, Generar/Regenerar sólo repinta, sin aviso
  propio: lo que explica por qué no pasa nada es el aviso de bloqueo (riesgo
  de §11, `OPEN-Q-04`).
- [index.html:2276](../../index.html#L2276),
  [index.html:2512-2516](../../index.html#L2512-L2516) — `playerScores` y
  `partidosArmado` son sólo de `admin`; la posición asignada de cada jugador
  queda en el documento público. Por eso `jugador` ve «2º» y «!» pero no tiene
  los puntajes (Pain 2, Pain 3, `D-06`).
- [index.html:6440-6443](../../index.html#L6440-L6443) —
  `sumaVigenteDeEquipo`: el total por equipo se suma con el puntaje de cada
  jugador; sin `playerScores`, el de `jugador` sale sin ellos (Pain 3).
- [index.html:7905-7986](../../index.html#L7905-L7986) — la lista de
  convocados, al lado de la tarjeta en dos columnas, no muestra puntajes: no
  hace falta tocarla.
- [index.html:1545-1562](../../index.html#L1545-L1562) — la única preferencia
  de pantalla que hoy se recuerda (el orden del listado) se guarda en
  Firestore por cuenta. El ojo no la imita (`D-05`, §9.3).

**Industry-standard evidence**

- *Regulatory:* WCAG 2.1 AA, criterio 4.1.2 *Name, Role, Value*
  (<https://www.w3.org/TR/WCAG21/#name-role-value>) — un botón sólo de ícono
  necesita un nombre accesible, y uno que alterna entre dos estados tiene que
  exponer en cuál está. Verificado el 2026-11-20 contra la página del W3C:
  nivel A; "the name and role can be programmatically determined; states,
  properties, and values that can be set by the user can be programmatically
  set". El texto concreto queda para la Spec (`OPEN-Q-01`).
- *Architectural:* ninguna restricción más allá de las del proyecto.
- *Style / project convention:* [`AGENTS.md`](../../AGENTS.md) — Simplicidad
  ante todo, Responsive desde 360 px (con escenario nuevo en
  `tests/layout.test.js` que se vea fallar), Design system como fuente de
  verdad de UI, obligación de declarar qué parte de un spec existente se
  reemplaza. Design system en
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/):
  los íconos son de Lucide
  ([`Icon.prompt.md:1`](../../.claude/skills/football-app-design/components/core/Icon.prompt.md)),
  versión `lucide-static@0.544.0`
  ([`Icon.jsx:3`](../../.claude/skills/football-app-design/components/core/Icon.jsx)),
  que trae `eye` y `eye-off`: verificado el 2026-11-20, las dos URLs
  `https://unpkg.com/lucide-static@0.544.0/icons/eye.svg` y `…/eye-off.svg`
  responden 200 (`D-01`).

**Prior-art evidence**

- [`007-permisos-por-usuario/spec.md`](../007-permisos-por-usuario/spec.md) —
  `FR-004`, `FR-006`, `FR-013`: qué no ve `jugador`. Es la referencia de "qué
  es un dato de puntaje" que este botón oculta (`D-02`, `D-06`).
- [`PARTIDO_FINALIZADO_SPEC.md`](../equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md) —
  `FR-041`, `FR-042b`, `FR-060`: el origen del bug de Pain 3 (`D-06`).
- [`rol-en-el-token/contracts/firestore-rules.md` §3](../rol-en-el-token/contracts/firestore-rules.md) —
  filas `data/playerScores` y `data/partidosArmado`: `jugador` no los lee ni
  los escribe (§5.2).
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
`admin`, pegado a la izquierda de Copiar. Aparece en las cuatro situaciones de
`D-01`, que son todas aquellas en las que hoy aparece Copiar. Muestra un ojo
mientras todo está visible y un ojo tachado mientras está oculto.

Tocarlo pasa la pantalla a "oculto": se dejan de dibujar los elementos de
`D-02` y se repinta. Tocarlo de nuevo vuelve a "visible". Nada se guarda: el
estado vive en la memoria de la página, vale para cualquier partido con equipos
que se abra y vuelve a "visible" al recargar. La pantalla de un partido sin
equipos generados no tiene el ojo y no se ve afectada: ahí el combo de
estrategia y los avisos se ven siempre.

Aparte del botón, y siempre, la fila de resultado y el encabezado del campo del
partido finalizado dejan de mostrar el "pts" por equipo a `jugador`.

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
| D-01 | Un botón de ícono con un ojo (Lucide `eye` visible, `eye-off` oculto), sólo para `admin`, inmediatamente a la izquierda de Copiar en el encabezado de la tarjeta de equipos. Está en las cuatro **situaciones** en que la tarjeta muestra equipos y Copiar: armado, carga del resultado (inscripción cerrada), partido finalizado y edición de un finalizado. ("Situación" y no "estado": de las cuatro, sólo dos coinciden con los tres estados de `001-organizacion-partidos`; la inscripción cerrada es una condición y la edición, un modo.) Mismo tamaño y peso que Copiar | Pedido del owner el 2026-11-20 ("a la izquierda del ícono que copia la formación", "algo con un ojo"); `admin` elegido por el owner, porque `jugador` ya no ve casi nada de esto | Easy |
| D-02 | En "oculto" no se dibuja: el puntaje sobre cada camiseta; las pastillas «2º» y «!»; la «!» con contador de las pestañas Blanco/Negro; los candados (que sólo existen con la inscripción abierta); el total de cada equipo, en todos sus lugares; la píldora de diferencia, en sus dos ubicaciones; la grilla de diferencia por línea; "Por qué quedaron así"; el combo de estrategia; el aviso de equipos desactualizados; durante la selección para intercambiar puesto, el rojo de las candidatas que dejarían a alguien fuera de puesto (todas se marcan como candidatas comunes) y la cuenta de opciones de cada pestaña; y el mismo rojo durante un arrastre. *(Enmendada el 2026-11-20 al escribir la Spec: el aviso de bloqueo sale de la lista y pasa a `D-03`; se suma el rojo del arrastre.)* | Pedido del owner el 2026-11-20; el combo y el aviso de desactualizado agregados por el owner al preguntarle, para que la captura no tenga ningún indicio de puntajes; el rojo y la cuenta de la selección, agregados por el owner el mismo día a partir de la crítica independiente (hallazgo 4), porque dicen lo mismo que la «!»; el rojo del arrastre, agregado por el owner al escribir la Spec por la misma razón. El aviso de bloqueo salió porque habla de posiciones viejas, no de puntajes, y sin él Regenerar no hacía nada visible (`OPEN-Q-04`) | Easy |
| D-03 | En "oculto" se sigue viendo: las canchas, los jugadores y las duplas; el marcador; los chips de goles, goles en contra y asistencias; las filas de detalle; la barra y las acciones de carga; los demás botones del encabezado y de la botonera; el aviso de bloqueo *(agregado el 2026-11-20 al escribir la Spec)* | Pedido del owner: los goles y asistencias se deben poder ver. El aviso de bloqueo, elegido por el owner al resolver `OPEN-Q-04` | Easy |
| D-04 | Ocultar es sólo visual. No cambia equipos, bloqueos ni resultado, no guarda nada y no interviene en el motor ni en el resumen de generación. Los gestos de edición (arrastrar, tocar para intercambiar, cargar por toque) siguen funcionando en "oculto"; bloquear no, porque el candado no se ve | Simplicidad ante todo; el motor no cambia (Explicabilidad) | Easy |
| D-05 | Un único estado para toda la página, que vale para cualquier partido con equipos generados. Arranca en "visible" y vuelve a "visible" al recargar; cambiar de partido no lo cambia. No se guarda en Firestore ni en el navegador. La pantalla de un partido sin equipos generados no tiene el ojo y nunca oculta nada: el combo de estrategia, el aviso de bloqueo y "Generar equipos" se ven siempre | Simplicidad ante todo, y evita armar equipos a ciegas sin saberlo (§9.3). La exclusión del partido sin equipos la eligió el owner el 2026-11-20 a partir de la crítica independiente (hallazgo 2): sin ella, esa pantalla quedaba sin el combo y sin forma de volver a "visible" | Easy |
| D-06 | Se corrige un bug existente: `jugador` no ve ningún "pts" por equipo, en ninguna situación, con o sin el botón. Reemplaza, para `jugador`, la parte de `FR-041` y `FR-042b` de `PARTIDO_FINALIZADO_SPEC.md` que muestra el puntaje de armado; `FR-060` de ese spec queda acotado en consecuencia | Elegido por el owner el 2026-11-20; alinea con `FR-004` de `007`, y además el número que hoy ve no es el real (Pain 3) | Easy |
| D-07 | El rol `jugador` no cambia en nada más: sin botón, y con las pastillas «2º» y «!» como hoy | El pedido apunta al administrador que comparte; `007` no prohíbe a `jugador` ver posiciones | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| El administrador deja la pantalla en "oculto" y sigue armando sin ver los números, o cree que el partido no tiene puntajes | Med | Med | El ícono tachado dice en qué estado está; recargar vuelve a "visible" (`D-05`) |
| Una feature futura agrega otro dato de puntaje a la tarjeta y se olvida del ojo: la captura vuelve a mostrar puntajes | Med | Med | La Spec enumera cada elemento con su escenario; un test por elemento hace visible el olvido |
| Alguien vuelve a conectar `updateTeamTotalsDisplay` ([index.html:5211-5216](../../index.html#L5211-L5216)), que reescribe el total sin pasar por el repintado, y el total reaparece en "oculto" | Low | Low — hoy no la llama nadie | La Spec incluye un escenario de arrastre en "oculto"; el Plan decide si la borra (§16) |
| A 360 px, un botón más de 44 px en el encabezado (con Intercambiar, Copiar y Regenerar) desarma el renglón | Med | Med | La Spec declara el comportamiento desde 360 px y el Plan agrega un escenario a `tests/layout.test.js` que se vea fallar |
| Los textos que aparecen al pasar el mouse sobre una camiseta ("sin puntaje", "su puesto es …") siguen diciendo cosas que la pantalla oculta | Low | Low | No salen en una captura; se decide en `OPEN-Q-02` |
| En "oculto", con titulares de posiciones del catálogo anterior, el aviso de bloqueo no se ve y tocar Regenerar no hace nada visible ([index.html:4843](../../index.html#L4843)): el administrador no sabe por qué | Low | Low — sólo pasa mientras queden jugadores sin reclasificar | Resuelto en la Spec (`OPEN-Q-04`): el aviso de bloqueo se ve siempre (`D-02`, `D-03` enmendadas) |
| Algún jugador extraña el "pts" junto al resultado (`D-06`) | Low | Low | Es lo que `007` ya prometía, y el número no era el real (Pain 3) |

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
  dejan de ver el "pts" por equipo en su cuenta.

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
| OPEN-Q-04 | En "oculto" y con el aviso de bloqueo escondido, ¿qué pasa al tocar Regenerar? (dejar el aviso visible igual, avisar al tocar, o aceptar que no pase nada visible) | Lucas Manoukian | Spec | Riesgo de §11; el aviso no habla de puntajes sino de posiciones viejas |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01, D-02, D-03, D-04, D-05, D-06, D-07.
- **Decide in Spec:** OPEN-Q-01, OPEN-Q-02, OPEN-Q-03, OPEN-Q-04.
- **Declaración de reemplazo obligatoria (`AGENTS.md`):** `D-06` acota, para
  `jugador`, estas partes de `PARTIDO_FINALIZADO_SPEC.md`, que siguen valiendo
  tal cual para `admin`: `FR-041` (el puntaje en la fila de resultado, en dos
  columnas), `FR-042b` (el puntaje en el encabezado del campo, en una columna),
  `S-04` y su variante `S-04b`, y `AC-05`; y `FR-060` y `AC-06`, que dicen que
  `jugador` ve la fila de resultado "sin restricciones", pasan a verla sin el
  puntaje. Marcar cada una ahí como acotada. Además, `AC-05` ya contradice hoy
  a `S-04` y al código (dice "sin ningún ... puntaje de armado en esa fila"; no
  se actualizó con la enmienda del 2026-09-04): la Spec lo señala y propone
  corregirlo, porque es la frase que esta feature va a acotar.
- **Para la Spec:** confirmar qué requisito de la rebanada 6
  (`CARGA_POR_TOQUE_SPEC.md`) cubre la fila de resultado de `jugador` con la
  inscripción cerrada ([index.html:7238](../../index.html#L7238)), que también
  lleva el "pts"; su §1 sólo declara el reemplazo de `FR-063` y `FR-064` de la
  rebanada 4.
- **Deuda de verificación heredada (`MD-26`):** ningún `[UNVERIFIED]` queda
  abierto. Queda sin comprobar en vivo una sola cosa: que `jugador` ve "0 pts"
  (Pain 3; la causa sí está verificada en el código). La Spec no depende del
  número exacto —`D-06` saca el "pts" igual—, pero conviene verlo una vez con
  la cuenta `jugador` de staging.
- **Must remain non-goals:** la captura; el texto de Copiar; un botón de
  ocultar para `jugador`; el motor.
- **Responsive:** la Spec declara el comportamiento desde 360 px del
  encabezado con el ojo, en las cuatro situaciones de `D-01`, con Intercambiar
  colores presente, y de la tarjeta en "oculto" sin huecos donde estaban la
  píldora y la grilla. Lo mismo para las tres superficies del "pts": la fila de
  resultado en dos columnas, el encabezado del campo en una columna (que puede
  quedar como un encabezado vacío, §6.5) y el encabezado del campo del armado;
  y para la vista de `jugador` una vez aplicado `D-06`. Un escenario de
  `tests/layout.test.js` por superficie. Ojo: `tests/layout.test.js:1602-1606`
  hoy exige los dos puntajes de la fila de resultado a 1200 px (`S-04`); ese
  escenario pasa a ser sólo de `admin` en "visible".
- **Para el Plan:** `updateTeamTotalsDisplay`
  ([index.html:5211-5216](../../index.html#L5211-L5216)) reescribe el total
  por `id` y hoy nadie la llama: decidir si se borra o si se protege con la
  guarda de "oculto".

## 17. Appendix

- Pedido del owner (2026-11-20): un botón con un ojo, a la izquierda del de
  Copiar, en la pantalla de equipos en cualquiera de sus estados, que oculte
  los puntajes, los íconos de posición, los candados con la inscripción
  abierta, los totales por equipo, la píldora de diferencia, la diferencia por
  línea y "Por qué quedaron así", dejando visibles goles y asistencias, para
  compartir la pantalla con usuarios no admin.
- Respuestas del owner (2026-11-20): los íconos de posición son la «2º», la «!»
  y la «!» de las pestañas; el botón es sólo de `admin`; el "pts" por equipo que ve
  `jugador` se corrige en esta feature; la pantalla sin equipos generados no
  se ve afectada por el ojo; el rojo y la cuenta de la selección para
  intercambiar también se ocultan; el combo de estrategia y los avisos
  también se ocultan.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-11-20 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Self-critique: skipped (first-run baseline). |
| 2026-11-20 | Lucas Manoukian (claude-opus-5-5) | Autocrítica contra la rúbrica, mismo modelo que el autor. 🔴 resueltos: §5.2 decía que el total por equipo de `jugador` sale de `data/partidos`; es falso —los puntajes viven en `playerScores`, que `jugador` no lee (`index.html:2276`, `firestore-rules.md` §3)—, así que el bug de `D-06` no filtra puntajes reales sino que muestra un "pts" calculado sin ellos (Pain 3, `[INFERRED]` "0 pts"); TL;DR, Pain 2, Pain 3, §5, §8.1, `D-06`, §11 y §13.2 reescritos en consecuencia. Dos `[UNVERIFIED]` con motivo no válido ("no se volvió a abrir", "de memoria") reemplazados por verificación en vivo: WCAG 4.1.2 contra w3.org y los íconos `eye`/`eye-off` contra unpkg. 🟡 resueltos: la deuda de verificación se declara en §16; el non-goal sobre `jugador` duplicaba un diferido de §14 y se reescribió; "estado" se usaba para cuatro situaciones que no son los tres estados de `001` (definido en `D-01`); riesgo nuevo de Regenerar sin efecto visible en "oculto" con `OPEN-Q-04`. 🔵 resueltos: `[INFERRED]` en la frase de cómo se resuelve hoy (Pain 1); cita textual de `007` sin elipsis. 🔵 aceptado sin cambio: `D-01` junta ícono, rol, lugar y situaciones en una sola fila; es una sola decisión del owner. Self-critique: passed (3🔴 / 4🟡 / 3🔵). |
| 2026-11-20 | Lucas Manoukian (claude-opus-5-5) | Enmiendas desde la crítica independiente [`OCULTAR_PUNTAJES_CONCEPT_CRITIQUE_2026-11-20_sonnet-5-5.md`](./OCULTAR_PUNTAJES_CONCEPT_CRITIQUE_2026-11-20_sonnet-5-5.md) (CHANGES REQUESTED, 1🔴 / 3🟡 / 2🔵), cada hallazgo verificado contra el código antes de aplicarlo; los seis se confirmaron. 🔴 hallazgo 2: `D-05` dejaba sin salida la pantalla del partido sin equipos (combo y avisos ocultos, sin ojo); el owner eligió que esa pantalla no se vea afectada (`D-05`, §8.1). 🟡 hallazgo 1: `updateTeamTotalsDisplay` no tiene llamadores; se corrigen §6.5, el riesgo de §11 (baja a Low/Low) y la nota para el Plan. 🟡 hallazgo 3: la declaración de reemplazo suma `S-04`, `S-04b`, `AC-05` y `AC-06` de `PARTIDO_FINALIZADO_SPEC.md`, señala que su `AC-05` ya contradice a `S-04`, cita `FR-013` de `007` en Pain 3, y deja a la Spec ubicar el requisito de la rebanada 6 para la fila de `jugador` en carga. 🟡 hallazgo 4: el owner sumó a `D-02` el rojo de las candidatas con costo y la cuenta de opciones de las pestañas. 🔵 hallazgo 5: §16 nombra las tres superficies del "pts", el encabezado vacío y el test de 1200 px que pasa a ser sólo de `admin`. 🔵 hallazgo 6: Pain 3 separa lo verificado en el código de lo que falta ver en staging. No se aplicó la nota del crítico de que la lista de convocados arranca en la línea 7902: arranca en la 7905, como estaba citado. Self-critique: skipped (enmienda desde una crítica independiente ya hecha). |
| 2026-11-20 | Lucas Manoukian (claude-opus-5-5) | Enmienda al escribir la Spec ([`OCULTAR_PUNTAJES_SPEC.md`](./OCULTAR_PUNTAJES_SPEC.md)), con respuestas del owner del mismo día. `OPEN-Q-04` resuelta: el aviso de bloqueo se ve en los dos estados, así que sale de `D-02` y entra en `D-03`; el riesgo de §11 queda resuelto. Hueco encontrado al redactar la Spec: el rojo del candidato con costo también aparece durante un arrastre ([index.html:6171-6177](../../index.html#L6171-L6177)); el owner lo sumó a `D-02`. `OPEN-Q-01` a `OPEN-Q-03` se resuelven en la Spec sin tocar decisiones de este documento. Self-critique: skipped (enmienda puntual a pedido del owner). |

---

*Next document: Spec. The Spec defines what the system shall do, how it shall
behave, and which solutions are admissible. Concrete implementation details
live in the Implementation Plan, not here and not in the Spec.*
