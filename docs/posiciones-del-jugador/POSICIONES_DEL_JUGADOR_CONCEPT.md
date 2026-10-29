# Posiciones del jugador — Concept Note

> **Status:** Draft · **Date:** 2026-10-28 · **Owner:** Lucas Manoukian (claude-opus-5-5)
>
> **Reviewers:** *pending*
>
> **Spec:** [POSICIONES_DEL_JUGADOR_SPEC.md](./POSICIONES_DEL_JUGADOR_SPEC.md) · **Implementation plan:** *not yet written*

## 1. TL;DR

Después de generar los equipos, el administrador no puede reacomodar a dos
jugadores **dentro del mismo equipo**: la cancha sólo deja moverlos entre
equipos, y aun así cada uno conserva su puesto. En la práctica el reparto se
corrige a mano, fuera de la aplicación, y lo guardado deja de coincidir con lo
que se juega. Se propone que el administrador **toque una camiseta** y la cancha
**resalte a los compañeros con los que ese jugador puede intercambiar puesto**
—del propio equipo o del otro—, y que un segundo toque (o el arrastre de hoy)
haga el intercambio: cada uno toma el puesto del otro. Un equipo que quedó sin
arquero puede, además, elegir a uno de sus jugadores para el arco, sin que eso
toque los puestos que el jugador declaró (`D-14`). La decisión que el lector
debe conocer antes que ninguna otra: un intercambio sólo es válido si **los dos**
quedan en un puesto que declararon como principal o secundario (`D-04`), y esa
regla pasa a gobernar también el arrastre sobre una camiseta, que hoy
intercambia sin mirar puestos (`D-08`). Esto reemplaza en parte `D-19` y `D-20`
del Concept Note de `equipos-en-el-campo` (§16 lista cada parte).

## 2. Problem statement

Una vez que el motor reparte, la formación de cada equipo queda fija: la cancha
permite cambiar a quién juega en cada equipo, pero no en qué puesto.

- **Pain 1 — reacomodar dentro del equipo es imposible.** Pasó en un partido
  real (testimonio del propietario, §17): los equipos estaban bien repartidos,
  pero dentro de uno de ellos había que intercambiar a dos jugadores de puesto.
  La aplicación no lo permite —la edición manual se acotó a movimientos entre
  equipos (`D-19` de
  [`equipos-en-el-campo`](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md))—
  así que se corrigió a mano, fuera de la aplicación. Desde ese momento la
  cancha dibuja una formación que no es la que se juega, y el puntaje por puesto
  de esos dos jugadores, que suma al total del equipo, es el de un puesto que no
  ocupan.
- **Pain 2 — el intercambio entre equipos desarma las formaciones.** Soltar una
  camiseta sobre otra del equipo contrario intercambia a los dos jugadores de
  equipo, pero **cada uno conserva su puesto** (`D-20` del mismo Concept Note;
  `FR-022` de
  [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md)).
  Intercambiar un central del Blanco por un lateral del Negro deja al Blanco con
  dos laterales y al Negro con dos centrales. Además, ese intercambio sólo existe
  en pantalla ancha: en el celular, con un equipo por vez, no se ofrece
  ([`ARRASTRE_SPEC.md:114`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md)).
- **Pain 3 — los candidatos no se ven desde la cancha.** Para saber con quién
  tiene sentido intercambiar a un jugador, el administrador tiene que recordar
  los puestos de cada uno o ir a buscarlos a la solapa Jugadores, que es donde
  viven. La cancha muestra sólo el puesto asignado, con la pastilla "2º" cuando
  no es el principal ([`index.html:5236`](../../index.html#L5236),
  [`index.html:1614`](../../index.html#L1614)); no muestra los demás puestos que
  el jugador declaró.
- **Pain 4 — un equipo sin arquero no puede fijar uno.** Cuando a un equipo no
  le toca ningún arquero, sus jugadores rotan en el arco y la línea del arco
  queda vacía en la cancha ([`index.html:5120`](../../index.html#L5120)). Si el
  grupo decide que uno de ellos ataje todo el partido, la aplicación no tiene
  dónde registrarlo sin cargarle Arquero como secundaria en la ficha, que es un
  dato permanente para algo circunstancial.

## 3. Goals

- Que el administrador pueda intercambiar el puesto de dos jugadores de un
  partido ya generado, del mismo equipo o de equipos distintos, sin regenerar.
- Que al elegir un jugador, la cancha muestre de inmediato con quién se puede
  intercambiar, sin tener que consultar la solapa Jugadores.
- Que después de un intercambio todo lo que la cancha dice —formación,
  totales, diferencia entre equipos, diferencia por línea, lugares sin cubrir,
  el grupo "Con tus cambios" del resumen— sea verdad para el reparto nuevo.
- Que un equipo sin arquero pueda poner a uno de sus jugadores en el arco para
  ese partido, sin tocar su ficha.
- Que el intercambio funcione igual desde el celular que desde una pantalla
  ancha.

## 4. Non-goals

- **No se muestra nada de esto al rol `jugador`.** Seleccionar, resaltar e
  intercambiar son acciones de edición, y editar el reparto es sólo del
  administrador ([`index.html:5072`](../../index.html#L5072)). Tampoco se
  exponen al rol `jugador` los puntajes por puesto que estén en juego, que ese
  rol hoy no ve (`007-permisos-por-usuario`).
- **No se cambian los puestos declarados de un jugador desde la cancha.** El
  intercambio y el arquero elegido escriben el puesto *asignado en ese partido*;
  la principal y las secundarias se siguen editando sólo en la ficha del
  jugador. En particular, elegir a alguien para el arco no le agrega Arquero
  como secundaria.
- **No se mueve a un jugador a un lugar vacío de su propio equipo**, salvo al
  arco vacío (`D-14`). Fuera de ese caso, el cambio de puesto es siempre un
  intercambio entre dos camisetas.

## 5. Vision / desired end state

Martes a la noche, la inscripción del jueves sigue abierta y los equipos ya
están generados. El administrador mira la cancha del Blanco y ve a Juan de
central y a Pedro de lateral derecho; sabe que esa noche conviene al revés.
Toca la camiseta de Juan: queda marcada, y la de Pedro se ilumina junto con la de
otro compañero que también podría ocupar el puesto de Juan y jugar en el suyo.
Toca la de Pedro y los dos cambian de lugar. El total del Blanco se mueve unas
décimas —Pedro rinde un poco menos de central—, la diferencia con el Negro se
actualiza en el mismo instante, y "Por qué quedaron así" pasa a separar lo que
cambió él de lo que armó el motor, como ya hace con cualquier movimiento manual.

Después quiere un mediocampista del Negro en el lugar de un volante del Blanco.
Desde el celular, que muestra un equipo por vez, toca al del Blanco, cambia a la
pestaña del Negro —donde los compatibles ya aparecen resaltados— y toca al otro.
Si en vez de eso hubiera tocado a un jugador sin ningún compañero compatible, un
mensaje corto le habría dicho que nadie puede intercambiar con él, en lugar de
dejarlo adivinando si el toque funcionó.

Esa semana hay un solo arquero, y le tocó al Negro. En el Blanco el arco está
vacío, pero Martín se ofreció a atajar todo el partido. El administrador toca a
Martín y el arco vacío aparece como destino; lo toca y Martín queda en el arco.
Su ficha no cambió, el total del Blanco tampoco —Martín sigue sumando lo de su
puesto anterior— y la ventaja que el motor le dio al Blanco por no tener arquero
fijo sigue en pie, porque un arquero improvisado no deja de ser una desventaja.

> **Actualización 2026-10-29 (`D-30`).** Esto ya no aplica: si nadie del equipo juega de
> arquero, el equipo rota el arco entre sus jugadores sin ningún criterio, y nadie se pone
> en él. Sólo quien juega de arquero puede ocupar el arco vacío, y suma con el cálculo de
> hoy.

### 5.1 System context diagram

Omitido: la feature no cruza ningún límite de sistema nuevo. Vive entera dentro
de `index.html` y guarda en los mismos documentos de Firestore que ya escriben
el arrastre y la generación (`data/partidos`, `data/partidosArmado`). Por
`MD-24` el diagrama es opcional en ese caso.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Input de un usuario autenticado con rol `admin`, desde
  la propia interfaz (toques y arrastres sobre camisetas). El texto nuevo que se
  muestra —el mensaje de "nadie puede intercambiar con X"— incluye nombres de
  jugadores, que son texto cargado por usuarios.
- **Data sensitivity** — Ninguna regulada. Nombres de jugadores, puestos y
  puntajes por puesto de un grupo de amigos; los puntajes no deben exponerse al
  rol `jugador` (`007-permisos-por-usuario`).
- **Deployment surface** — Aplicación estática en GitHub Pages contra Cloud
  Firestore. La escritura del documento de armado ya está restringida por rol en
  las reglas de Firestore; si la feature agrega algún campo guardado, la Spec
  decide si las reglas lo validan (`OPEN-Q-07`).

Categorías que la Spec debe tratar en §4.5: CWE-79 (los nombres en el texto
nuevo, regla de escapado de `AGENTS.md` → Estilo) y CWE-862 / CWE-863 (que el
intercambio no quede disponible fuera del rol `admin`, ni por interfaz ni por
reglas).

## 6. Context & background

- **Existing system — la cancha y la edición manual.** El rediseño
  `equipos-en-el-campo` reemplazó la lista de equipos por dos canchas con la
  formación dibujada. Su rebanada 2 repuso el arrastre: soltar sobre la pestaña o
  la cancha del otro equipo **pasa** a un jugador; soltar sobre una camiseta del
  otro equipo los **intercambia** (`FR-011`, sólo en dos columnas); soltar sobre
  una camiseta del propio equipo no hace nada (`FR-013`). Ningún movimiento
  escribe el puesto asignado (`D-20`, `FR-022`, `TC-012`). La ventana en la que
  se puede editar es la misma para todo: rol `admin`, inscripción abierta,
  partido sin finalizar ([`index.html:5072`](../../index.html#L5072)).
- **Existing system — los puestos.** Desde `desglose-posiciones` cada jugador
  tiene una posición principal y cualquier cantidad de secundarias entre ocho
  puestos, con un puntaje por cada uno. Las estrategias que miran posiciones
  guardan para cada partido el puesto asignado de cada jugador. **La estrategia
  "Solo por puntaje" no lo guarda**
  ([`index.html:3295`](../../index.html#L3295)): ahí la cancha dibuja a cada uno
  en su principal y el panel suma su promedio general
  ([`index.html:5066`](../../index.html#L5066)).
- **Existing system — los equipos sin arquero.** Si hay un solo arquero entre
  los titulares, el otro equipo rota el arco entre jugadores de campo y el motor
  le da una ventaja de puntaje configurable para compensarlo ("Ventaja para el
  equipo sin arquero fijo", [`index.html:1737`](../../index.html#L1737); cálculo
  en [`index.html:3241`](../../index.html#L3241)). En la cancha, la línea del
  arco de ese equipo queda vacía.
- **Existing system — lo que ya se recalcula.** Los totales de cada equipo, la
  diferencia por línea y los lugares sin cubrir ya se calculan sobre el reparto
  que está en pantalla, no sobre el que guardó la generación (corrección de
  `D-25`, `FR-071` de la rebanada 3). El resumen "Por qué quedaron así" también:
  desde `D-26` (2026-09-10) se parte en "Con tus cambios" y "Como lo armó el
  motor" cuando el reparto en pantalla se aparta de la generación, y el primer
  grupo se recalcula (`FR-072b`, `FR-072c` de
  [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)).
  Si se apartó lo decide comparando total, balance por línea y cumplimiento de
  la formación, **no registrando que hubo un movimiento** (`FR-072b2`).
- **Related work** — `intercambiar-colores` (otra edición posterior a la
  generación, sin regenerar); `008-duplas-rotacion` y
  `014-puntaje-dupla-por-posicion` (cómo se trata a una dupla);
  `009-ventaja-sin-arquero` (la compensación); la idea "alternativa táctil para
  editar equipos" de `Roadmap.md` §3 y el pendiente "mover un jugador sin gesto
  de puntero" de §2.
- **Organisational context** — Ninguno externo. El pedido viene del uso propio
  del propietario en un partido real.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence**

- [`index.html:5072`](../../index.html#L5072) `esFilaEditable` — fijó la ventana
  de edición: admin, inscripción abierta, sin finalizar. El intercambio usa la
  misma (`D-11`) y es la base de `D-01`.
- [`index.html:5635`](../../index.html#L5635) `intercambiarUnidades` — el
  intercambio de hoy: sólo entre equipos distintos (`equipoA === equipoB`
  retorna), mueve a la dupla completa y no toca `posicionAsignada`. Es el
  comportamiento que `D-08` cambia.
- [`index.html:5770`](../../index.html#L5770) `moverUnJugadorDeEquipo` — el pase
  suelto, que `D-09` deja igual.
- [`index.html:1623`](../../index.html#L1623) `posicionesDe` y
  [`index.html:3631`](../../index.html#L3631) `costoEncaje` — "los puestos de un
  jugador" son principal + secundarias; fijó la regla de `D-03`. `costoEncaje`
  muestra además que, para una dupla, un puesto que cubre uno solo de los
  integrantes vale como secundaria ("la mitad del partido hay alguien fuera de
  puesto"); fijó la aclaración de `D-07`.
- [`index.html:1614`](../../index.html#L1614) `juegaFueraDePuesto` — decide la
  pastilla "2º": es "no es la principal", no "es secundaria" (Pain 3).
- [`index.html:4582`](../../index.html#L4582) `construirUnidadDupla` — los
  puestos de una dupla son la unión de los de sus dos integrantes, y es arquero
  natural sólo si los dos lo son. Fijó el criterio de `D-07`.
- [`index.html:5863`](../../index.html#L5863) `balanceLineasVigente`,
  [`index.html:5919`](../../index.html#L5919) `sumaVigenteDeEquipo` y
  [`index.html:5940`](../../index.html#L5940) `faltantesDeFormacionVigente` —
  totales, diferencia por línea y lugares sin cubrir ya se recalculan sobre el
  reparto vigente; `D-10` no necesita un recálculo nuevo.
- [`index.html:3295`](../../index.html#L3295) y
  [`index.html:5066`](../../index.html#L5066) — "Solo por puntaje" no devuelve
  `posicionAsignada`, y sin ella el panel suma el promedio general. Fijó `D-17`.
- [`index.html:3420`](../../index.html#L3420) (`generarEquiposEstrategia2`) y
  [`index.html:4093`](../../index.html#L4093) (`generarEquiposEstrategia3`, que
  la estrategia 4 llama en [`index.html:4574`](../../index.html#L4574)) — un
  jugador fijado arranca con el puesto que tenía guardado. Sostiene `D-13`.
- [`index.html:1737`](../../index.html#L1737) y
  [`index.html:3241`](../../index.html#L3241) — la ventaja para el equipo sin
  arquero fijo y cómo se calcula. Fijó `D-16`.
- [`index.html:5120`](../../index.html#L5120) — la cancha reserva siempre las
  cuatro líneas, y un equipo sin arquero deja el arco vacío. Fijó el destino de
  `D-14`.
- [`index.html:2348`](../../index.html#L2348) — el documento público de
  partidos guarda equipo y puesto asignado de cada jugador: el intercambio
  escribe ahí, sin campos nuevos de jugador.

**Industry-standard evidence**

- *Regulatory:* WCAG 2.1, criterio 2.1.1 *Keyboard* (nivel A),
  <https://www.w3.org/TR/WCAG21/#keyboard>, leído el 2026-10-28: *"All
  functionality of the content is operable through a keyboard interface without
  requiring specific timings for individual keystrokes, except where the
  underlying function requires input that depends on the path of the user's
  movement and not just the endpoints."* Intercambiar dos jugadores no depende
  del recorrido, sólo de los extremos, así que la excepción no aplica: ni el
  arrastre de hoy ni el toque nuevo cumplen sin un equivalente de teclado
  (`OPEN-Q-03`).
- *Style / project convention:* `AGENTS.md` — principios de simplicidad,
  explicabilidad del motor, responsive desde 360px (motivó `D-06`), design
  system de `.claude/skills/football-app-design/` (el resaltado sale de sus
  tokens), escapado de todo texto de jugador, y la regla de declarar qué parte
  de un spec vigente se reemplaza (§16).
- *Architectural:* no aplica nada más allá de la separación interfaz / motor /
  persistencia de `AGENTS.md`: el intercambio no pasa por el motor.

**Prior-art evidence**

- [`equipos-en-el-campo` Concept Note](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md),
  `D-18` a `D-21`, `D-25` y `D-26` — por qué el arrastre se acotó a entre
  equipos y sin escribir puestos, y cómo el resumen ya separa lo manual de lo
  generado.
- [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md)
  — `FR-011`, `FR-013`, `FR-015`, `FR-017`, `FR-022`, `FR-024`, `TC-012`, §3.2,
  `S-02`, `S-02c`, `US-02`, `R-02`: el contrato vigente del arrastre (§16 lista
  qué parte se reemplaza).
- [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)
  — §3.3, `A-03`, `FR-071`, `FR-072b` a `FR-072d`: el recálculo vigente y el
  resumen dividido.
- [`CARGA_POR_TOQUE_SPEC.md`](../equipos-en-el-campo/rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md)
  — el toque sobre una camiseta ya existe, pero sólo con la inscripción cerrada
  (modo de carga del resultado). Las dos ventanas no se superponen.
- Productos externos: ninguno consultado. No se buscó un precedente fuera del
  repositorio porque cada decisión se apoya en el pedido del propietario o en el
  comportamiento ya construido.

## 7. Research & industry context

### 7.1 How established products handle this

No se consultó ningún producto externo (§6.5). Ninguna decisión de §10 depende
de un precedente de afuera.

### 7.2 Relevant prior art / papers / standards

- **El propio rediseño de la cancha** (`equipos-en-el-campo`, `D-19`/`D-20`) —
  dejó afuera mover dentro del equipo porque escribir el puesto asignado exigía
  recalcular la diferencia por línea, que la rebanada 3 iba a rediseñar.
  `[INFERRED]` Ese recálculo ya existe sobre el reparto vigente (§6), así que la
  razón de aquella exclusión ya no está; la Spec debe confirmar que el
  recálculo vigente usa el puesto asignado y no lo da por fijo.
- **WCAG 2.1, 2.1.1 Keyboard** — ver §6.5. Queda como `OPEN-Q-03`.

### 7.3 Proofs of concept

Ninguno. Las piezas de las que depende la feature —recálculo vigente,
intercambio de unidades, regla principal-o-secundaria, unidad de dupla, resumen
dividido— ya existen en producción y están citadas en §6.5.

## 8. Proposed direction

### 8.1 Approach

Mientras se pueda editar el reparto (`D-11`), tocar una camiseta la
**selecciona**. Seleccionar no cambia nada: sólo marca la camiseta elegida y
resalta, en las dos canchas, a los jugadores con los que el intercambio sería
válido. Válido quiere decir que cada uno de los dos queda en un puesto que
declaró como principal o secundario (`D-03`, `D-04`). Tocar una camiseta
resaltada aplica el intercambio; tocar otra camiseta no resaltada pasa a
seleccionar esa; tocar fuera de las camisetas cancela; tocar el selector de
equipo no cancela. Si ningún compañero es compatible, un mensaje corto lo dice
(`D-05`).

**El intercambio** es siempre entre dos unidades de armado y siempre cambia dos
cosas a la vez: el puesto asignado de cada una pasa a ser el de la otra, y si
estaban en equipos distintos, cada una pasa al equipo de la otra. El resultado
es que cada equipo conserva su formación y su cantidad de unidades (con una
dupla de por medio, la cantidad de personas puede cambiar, como ya pasa hoy);
lo único que cambia es quién ocupa cada lugar. Arrastrar una camiseta y soltarla
sobre otra —del mismo equipo o del otro— hace exactamente lo mismo, con la
misma regla (`D-08`). Soltarla sobre la pestaña o la cancha del otro equipo, sin
camiseta de destino, sigue siendo el pase de hoy (`D-09`).

**En el celular**, donde se ve un equipo por vez, la selección sobrevive al
cambio de pestaña: se toca al jugador, se cambia de equipo con el selector, y
los compatibles del otro equipo ya aparecen resaltados (`D-06`).

**El arco vacío.** Si el equipo del jugador seleccionado tiene el arco vacío,
el arco aparece como destino aunque el jugador no declare Arquero (`D-14`).
Tocarlo lo pone en el arco para ese partido, sin tocar su ficha. Sigue sumando
al total lo de su puesto anterior (`D-15`) y la ventaja que el motor le dio al
equipo por no tener arquero fijo se mantiene (`D-16`). Desde ahí se cambia como
cualquier otro: un compañero puede tomar el arco por intercambio siempre que el
improvisado vuelva a un puesto suyo.

> **Actualización 2026-10-29 (`D-30`).** Esto ya no aplica: si nadie del equipo juega de
> arquero, el equipo rota el arco entre sus jugadores sin ningún criterio, y nadie se pone
> en él. Sólo quien juega de arquero puede ocupar el arco vacío, y suma con el cálculo de
> hoy.

**En un partido "Solo por puntaje"**, que no asigna puestos, no hay puestos que
intercambiar: el toque sirve para intercambiar con alguien del otro equipo,
sin regla de compatibilidad, y dentro del propio equipo no tiene efecto. El
arrastre en esos partidos sigue como hoy (`D-17`).

**Lo que se ve después** se actualiza solo: totales, diferencia entre equipos,
diferencia por línea, lugares sin cubrir y el grupo "Con tus cambios" del
resumen ya se calculan sobre el reparto vigente (`D-10`, `D-12`). No se agrega
un registro de intercambios.

### 8.2 Information / data model sketch

Ningún concepto nuevo de dominio.

- **Puestos de un jugador** — su principal y sus secundarias, tal como ya los
  guarda la ficha.
- **Puestos de una dupla de rotación** — la unión de los de sus dos
  integrantes, con el mismo criterio con que el motor construye la unidad
  (`D-07`).
- **Puesto asignado** — ya existe por jugador y por partido (salvo "Solo por
  puntaje"); el intercambio lo escribe. Hoy ningún movimiento manual lo hacía.
- **Arquero improvisado** — un jugador con puesto asignado Arquero que no lo
  declara. Para sumar lo de su puesto anterior (`D-15`) hay que poder saber cuál
  era; si eso exige guardar algo nuevo lo decide la Spec (`OPEN-Q-07`).
- **Selección** — estado de pantalla, no se guarda.

## 9. Alternatives considered

### 9.1 Alternative A — Lista de puestos al tocar un jugador

- **Description:** Tocar una camiseta abre un recuadro con los puestos del
  jugador y su puntaje en cada uno; el intercambio se hace en otro paso.
- **Pros:** Muestra el puntaje por puesto, que el resaltado no muestra.
- **Cons:** Los puestos ya se consultan en la solapa Jugadores; la información
  que falta en la cancha no es "dónde juega" sino "con quién lo puedo cambiar".
  Agrega un paso y un elemento flotante que `[INFERRED]` en 360px taparía parte
  de la cancha (no medido).
- **Decision:** Rejected — el propietario lo descartó: ver los puestos sirve
  sólo para preparar el intercambio, no por sí solo.

### 9.2 Alternative B — Permitir el intercambio fuera de puesto, con aviso

- **Description:** Cualquier intercambio se aplica; si alguien queda en un
  puesto que no declaró, se lo marca.
- **Pros:** Máxima libertad; cubre al jugador que "puede" jugar de algo que no
  cargó.
- **Cons:** La corrección correcta para ese caso es cargarle el puesto en la
  ficha; aceptarlo en la cancha deja una formación que el motor sólo arma como
  último recurso y un puntaje sin respaldo. La única excepción con un caso real
  es el arco vacío, que se toma aparte (`D-14`).
- **Decision:** Rejected para esta versión — `D-04`. Diferido en §14.

### 9.3 Alternative C — Dejar el arrastre como está y sumar sólo el toque

- **Description:** El toque intercambia puestos; el arrastre sobre una camiseta
  sigue intercambiando sólo de equipo, sin mirar puestos.
- **Pros:** No cambia nada de lo que hoy funciona; nadie se encuentra con un
  intercambio rechazado que antes se permitía.
- **Cons:** Dos gestos sobre la misma camiseta producirían resultados
  distintos, y el del arrastre seguiría desarmando formaciones (Pain 2).
- **Decision:** Rejected — `D-08`. El costo es un cambio de comportamiento,
  registrado como riesgo en §11.

### 9.4 Alternative D — Sólo dentro del mismo equipo

- **Description:** La primera versión intercambia puestos sólo entre
  compañeros; el intercambio entre equipos queda como hoy.
- **Pros:** Es el caso que motivó la feature; más chico.
- **Cons:** Deja vigente el Pain 2 y convive con un intercambio entre equipos
  que no mira puestos.
- **Decision:** Rejected — el propietario lo incluyó en esta versión (`D-06`).

### 9.5 Alternative E — Seguir corrigiendo con candados y regenerar

- **Description:** Fijar a los jugadores bien ubicados y regenerar hasta que el
  motor acomode al resto.
- **Pros:** No hay que construir nada.
- **Cons:** El candado fija el equipo (`FR-026` de `ARRASTRE_SPEC.md`) y, en las
  estrategias que miran posiciones, el puesto que el jugador ya tenía
  ([`index.html:3420`](../../index.html#L3420),
  [`index.html:4093`](../../index.html#L4093)); no hay forma de pedirle al motor
  un puesto concreto. Regenerar cambia el resto del reparto, que estaba bien.
- **Decision:** Rejected — es lo que hoy no alcanza.

### 9.6 Alternative F — Nombrar los intercambios en el resumen

- **Description:** El grupo "Con tus cambios" suma una línea por intercambio
  ("Juan y Pedro intercambiaron puesto").
- **Pros:** El resumen cuenta qué pasó, no sólo cómo quedó.
- **Cons:** Contradice `FR-072b2`, que decide comparar medidas y no registrar
  movimientos, y obliga a guardar un registro que hoy no existe.
- **Decision:** Rejected — el propietario eligió quedarse con el resumen
  dividido de hoy (`D-12`).

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | Seleccionar, resaltar e intercambiar son sólo del rol `admin` | Son acciones de edición del reparto, que ya es sólo del administrador (`esFilaEditable`). Además no se exponen puntajes al rol `jugador` (`007-permisos-por-usuario`) | Easy |
| D-02 | Seleccionar una camiseta resalta **sólo** a los jugadores con los que el intercambio sería válido, en los dos equipos | Todo lo resaltado se puede tocar con éxito; resaltar un candidato que después se rechaza enseña a desconfiar del resaltado | Easy |
| D-03 | Un jugador "puede jugar" en un puesto si es su principal o una de sus secundarias | Es la definición que el código ya usa (`posicionesDe`, `costoEncaje`) y la que el propietario confirmó | Easy |
| D-04 | En esta versión, un intercambio es válido sólo si **los dos** quedan en un puesto suyo (para una dupla, según `D-07`); si no, no se ofrece ni se aplica. Única excepción: el arco vacío (`D-14`) | Un movimiento manual no debería producir una formación que el motor sólo acepta como último recurso; el caso real se corrige cargando el puesto en la ficha | Easy |
| D-05 | Con un jugador seleccionado: tocar una camiseta resaltada aplica el intercambio; tocar otra no resaltada pasa a seleccionarla; tocar fuera de las camisetas cancela; tocar el selector de equipo no cancela. Sin candidatos, un mensaje corto lo dice | Funciona igual con dedo y con mouse, y toma la parte de intercambio de la idea "alternativa táctil para editar equipos" de `Roadmap.md` §3 (el pase por toque queda ahí). El mensaje evita que un toque sin efecto parezca una falla | Easy |
| D-06 | El intercambio entre equipos también cambia puestos. En una sola columna se hace tocando, cambiando de pestaña y tocando: la selección sobrevive al cambio de pestaña | Cierra el Pain 2 y lleva el intercambio al celular. Reemplaza la exclusión del intercambio en una columna de `ARRASTRE_SPEC.md` §3.2 y `R-02` | Easy |
| D-07 | Los puestos de una dupla de rotación son la unión de los de sus dos integrantes, con el criterio con que el motor arma la unidad (`construirUnidadDupla`). Por eso un intercambio puede dejar a **un** integrante en un puesto que no declaró, igual que el motor | Pedido explícito del propietario: la cancha no debe aceptar para una dupla un puesto que el motor no le daría, ni rechazar uno que sí. El motor ya acepta ese caso como "secundaria" (`costoEncaje`) | Easy |
| D-08 | Soltar un arrastre sobre una camiseta —del mismo equipo o del otro— hace el mismo intercambio, con la misma regla | Dos gestos sobre la misma camiseta no pueden dar resultados distintos. Reemplaza en parte `D-19` y `D-20` de `equipos-en-el-campo` (lo que queda en pie lo dice `D-09`) y varias partes de `ARRASTRE_SPEC.md` (§16). Arrastrar al otro equipo pasa a rechazar intercambios que hoy permite | Hard |
| D-09 | El pase suelto —soltar sobre la pestaña o la cancha del otro equipo— queda como hoy: cambia de equipo y conserva el puesto | No hay un puesto que tomar; cambiarlo sería otra feature. `D-20` sigue vigente para el pase | Easy |
| D-10 | Totales, diferencia entre equipos, diferencia por línea y lugares sin cubrir se actualizan con el recálculo vigente que ya existe; no se agrega uno | Ya se calculan sobre el reparto en pantalla y dependen del puesto asignado (`D-25`, `FR-071`). Simplicidad ante todo | Easy |
| D-11 | El intercambio está disponible en la misma ventana que el arrastre: rol `admin`, inscripción abierta, partido sin finalizar | Es la ventana de `esFilaEditable`, y la que confirmó el propietario. No se superpone con el toque de carga de resultado, que sólo existe con la inscripción cerrada | Easy |
| D-12 | El resumen "Por qué quedaron así" no cambia: un intercambio activa la división "Con tus cambios" / "Como lo armó el motor" que ya existe (`D-26`, `FR-072b` a `FR-072d`). No se registra qué intercambios hubo | El resumen ya deja de explicar como actual un reparto que cambió. Nombrar los intercambios contradice `FR-072b2` (Alternative F) | Easy |
| D-13 | Un jugador con candado se puede intercambiar, y queda fijado en su puesto nuevo al regenerar | El candado protege contra el motor, no contra el administrador. Las estrategias que miran posiciones ya arrancan a un fijado con su puesto guardado (`index.html:3420`, `:4093`) | Easy |
| D-14 | Si un equipo tiene el arco vacío, cualquiera de sus jugadores puede pasar al arco, aunque no declare Arquero (**enmendada el 2026-10-29 por `D-28` y `D-30`**: sólo quien declara Arquero; si nadie lo declara, el equipo rota y el arco queda vacío). No se le agrega Arquero a la ficha. Ese arco se cambia después por intercambio: cualquier compañero puede tomarlo, siempre que el improvisado vuelva a un puesto suyo | Pedido del propietario: atajar sin arqueros es circunstancial y no debe ensuciar los puestos declarados. Es el único caso en que un movimiento manual ocupa un lugar vacío | Easy |
| D-15 | (**Retirada el 2026-10-29 por `D-30`.**) El arquero improvisado sigue sumando al total lo de su puesto anterior, salvo que tenga puntaje de Arquero cargado | Que el total no salte por un cambio circunstancial: casi nadie tiene nota de arquero, y contarla bajaría el total del equipo de golpe | Easy |
| D-16 | La ventaja que el motor le dio al equipo sin arquero fijo se mantiene cuando se elige un arquero improvisado | Un arquero improvisado sigue siendo una desventaja real. Además no se recalcula nada del motor | Easy |
| D-17 | En un partido "Solo por puntaje", que no asigna puestos, el toque intercambia con alguien del otro equipo sin regla de compatibilidad, y dentro del propio equipo no tiene efecto. El arrastre en esos partidos sigue como hoy | Escribir un puesto asignado ahí cambiaría el valor de todos los jugadores de promedio general a puntaje por puesto (`index.html:5066`), no sólo el de los dos | Easy |
| D-18 | Al regenerar, lo hecho a mano sobre unidades sin candado se pierde, como hoy; una unidad con candado conserva equipo y puesto. Un arquero elegido deja el arco siempre, tenga candado o no; con candado conserva el equipo | Decisión del propietario al escribir la Spec (2026-10-28). Conservar el arco obligaría a cambiar el motor para aceptar un arquero que no declaró el puesto. Cierra `OPEN-Q-02` | Easy |
| D-19 | Al empezar un arrastre se resaltan los mismos candidatos que al tocar; soltar sobre una camiseta incompatible no cambia nada y un aviso corto dice qué puesto falta cubrir | Decisión del propietario (2026-10-28): el arrastre no debe rechazar sin haber mostrado antes qué se acepta. Cierra `OPEN-Q-04` y reemplaza también `FR-014`/`FR-015` de `ARRASTRE_SPEC.md` | Easy |
| D-20 | En un partido con puestos del catálogo viejo, la compatibilidad se mide por línea, con la misma función que ya usa el recálculo de lugares sin cubrir (`cubrePosicionGuardada`, `index.html:3642`) | El motor y el recálculo ya resuelven así ese caso; una regla distinta en la cancha contradiría a `D-07`. Cierra `OPEN-Q-06` | Easy |
| D-21 | El puesto anterior del arquero elegido se guarda con el partido, en `data/partidosArmado` (sólo `admin`), sin documento nuevo ni cambio de reglas | No se puede derivar: el puntaje se lee del puesto asignado (`index.html:5064`) y en el arco sumaría cero. Las reglas de ese documento no validan campos (`firestore-rules.md:308`). Cierra `OPEN-Q-07` | Easy |
| D-22 | (**Retirada el 2026-10-29 por `D-30`.**) En un partido "Solo por puntaje" el arco vacío también se puede ocupar, sólo como dibujo: no se escribe puesto asignado y ningún total cambia | Decisión del propietario (2026-10-28). Ahí cada uno suma su promedio general, así que dibujarlo en el arco no mueve números. Cierra `OPEN-Q-08` y amplía `D-17` | Easy |
| D-23 | Un arquero elegido puede volver a su puesto anterior con un toque, y si se lo pasa al otro equipo llega en su puesto anterior y no como arquero | Decisión del propietario (2026-10-28): sin esto, poner a alguien en el arco por error sólo se deshacía regenerando. Es la única excepción a `D-09` (el pase conserva el puesto) | Easy |
| D-24 | El arco vacío también se ocupa arrastrando, y el arquero elegido también vuelve a su puesto anterior arrastrando: al empezar el arrastre el destino aparece marcado y soltar ahí hace lo mismo que tocarlo, con y sin puestos | Decisión del propietario (2026-10-28): los dos gestos deben llegar a los mismos lugares, igual que `D-08` para las camisetas. Reemplaza, sólo para esos dos destinos, la segunda viñeta de §3.2 de `ARRASTRE_SPEC.md` (no se suelta sobre una línea) | Easy |
| D-25 | (**Retirada el 2026-10-29 por `D-30`.**) En la diferencia por línea, un arquero elegido cuenta en el Arco con el mismo valor que suma al total de su equipo (`D-15`) | Decisión del propietario (2026-10-29), al atender la revisión de la Spec: si la grilla lo valuara de otra forma, el total y la grilla no coincidirían. Hoy esa grilla calcula el valor por su cuenta (`sumasPorLinea`), así que el valor se resuelve en una sola función | Easy |
| D-26 | (**Retirada el 2026-10-29 por `D-30`.**) En "Solo por puntaje", ocupar el arco vacío escribe la marca de dibujo que el motor ya usa para los arqueros (`posicionOverride`): no es un puesto asignado, no mueve ningún total y la ven todos, también los jugadores | Decisión del propietario (2026-10-29). El registro del arquero elegido sólo lo lee `admin`: si el dibujo dependiera de él, los jugadores no verían a nadie en el arco. Concreta `D-22` | Easy |
| D-27 | Al regenerar, un arquero elegido con candado conserva su equipo y vuelve a su puesto anterior | Decisión del propietario (2026-10-29): es el mismo resultado que deshacer (`D-23`), y concreta qué puesto conserva en `D-18` | Easy |
| D-28 | Si el arco está vacío y en el equipo hay alguien que declara Arquero (principal o secundaria), sólo esos pueden ocuparlo, y lo hacen como arqueros comunes, sin registro de arquero elegido (**enmendada en parte el mismo día por `D-29`**: también guardan su puesto anterior). Un jugador que no declara Arquero va al arco sólo si nadie del equipo lo declara. Enmienda en parte `D-14` | Decisión del propietario (2026-10-29): hay que priorizar a quien juega de arquero, igual que el motor al generar. El arco puede quedar vacío con alguien que ataja si ese jugador tiene candado (el motor no lo mueve) o después de un pase | Easy |
| D-29 | (**Retirada en parte el 2026-10-29 por `D-30`**: queda que el arquero manual guarda su puesto anterior; el arquero de arranque desaparece.) Cuando nadie de un equipo ataja, el equipo rota el arco: quien arranca en él no es "el arquero". "Arquero elegido" pasa a ser dos cosas: **arquero manual** (cualquiera que el administrador puso en el arco vacío, ataje o no; guarda su puesto anterior para volver con un toque o arrastrando) y **arquero de arranque** (un arquero manual que no ataja: marca quién arranca, el aviso dice que el equipo rota, y vale lo de `D-15`). En las decisiones anteriores, "arquero elegido" se lee "arquero manual", y en `D-15` y `D-25`, "arquero de arranque". Enmienda en parte `D-28` | Decisión del propietario (2026-10-29): en la cancha ese equipo va rotando de arquero de forma arbitraria. El motor ya lo modela así: cuando falta arquero, "el otro equipo rota el arco entre sus jugadores de campo" y la ventaja por no tener arquero fijo compensa esa rotación (`index.html:1778`, `:3159-3162`, `:6263`). Guardar el puesto anterior también de quien ataja permite deshacer un error con un toque | Easy |
| D-30 | Sólo quien declara Arquero (principal o secundaria) puede ocupar el arco vacío de su equipo; si nadie lo declara, el equipo rota el arco entre sus jugadores sin ningún criterio y el arco queda vacío, como hoy. La feature no cambia cómo el motor elige los arqueros ni cómo se calculan los puntajes: quien ocupa el arco suma su puntaje de Arquero con el cálculo de hoy. Retira `D-15`, `D-22`, `D-25`, `D-26` y la parte de `D-29` sobre el arquero de arranque; acota `D-14` | Aclaración del propietario (2026-10-29): el arquero improvisado no refleja lo que pasa en la cancha, y el motor ya modela al equipo sin arquero como uno que rota y lo compensa con la ventaja (`index.html:1778`, `:3159-3162`). Achica la feature: sin valor especial ni marca de dibujo | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| El administrador arrastra al otro equipo como siempre y el intercambio se rechaza porque los puestos no son compatibles (`D-08`) | Med | Med | Resaltar los compatibles también durante el arrastre y explicar el rechazo con el mismo mensaje corto de `D-05` (`OPEN-Q-04`) |
| En el celular, la selección que sobrevive al cambio de pestaña no se nota, y el administrador no entiende por qué el otro equipo aparece resaltado | Med | Med | Indicador visible de "jugador seleccionado" mientras dure la selección, y una forma evidente de cancelar. La Spec lo fija por escenario |
| El toque sobre la camiseta compite con el candado, cuyo objetivo táctil es de 24×24 px pegado a la camiseta (`OPEN-Q-02` de `CANCHA_SPEC.md`) | Med | Med | La Spec define qué parte de la camiseta selecciona; `tests/layout.test.js` mide desde 360px |
| El toque se comporta distinto según la estrategia (`D-17`), y en "Solo por puntaje" parece que "no funciona" dentro del equipo | Low | Med | El mensaje corto de `D-05` también cubre ese caso |
| Para sumar lo del puesto anterior del arquero improvisado (`D-15`) hay que recordar cuál era, y eso puede pedir un campo guardado nuevo | Med | Med | La Spec decide si se deriva o se guarda (`OPEN-Q-07`) |
| Un nombre de jugador sin escapar en el mensaje (CWE-79) | Med | Low | Regla de escapado de `AGENTS.md` → Estilo; `tests/escapado.test.js` cubre el texto nuevo |
| Dos sesiones de administrador editan el mismo partido y gana la última que guarda | Low | Low | Riesgo transversal ya registrado en `Roadmap.md` §3; no se resuelve acá |

## 12. Success signals

- La próxima vez que haya que reacomodar a alguien dentro de un equipo, se hace
  en la aplicación y no por fuera.
- Después de un intercambio, la cancha, los totales y el resumen describen el
  partido que efectivamente se juega.
- Ningún intercambio manual deja a un jugador individual en un puesto que no
  declaró, salvo el arquero improvisado (`D-14`).
- No aparecen reportes de "el arrastre dejó de funcionar" por los intercambios
  que `D-08` empieza a rechazar.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** Cloud Firestore. Si hace falta un campo guardado
  nuevo (`OPEN-Q-07`), puede tocar sus reglas.
- **Upstream specs / RFCs:** `equipos-en-el-campo` (Concept Note y rebanadas 1,
  2, 3 y 6), `desglose-posiciones`, `008-duplas-rotacion`,
  `009-ventaja-sin-arquero`, `014-puntaje-dupla-por-posicion`,
  `007-permisos-por-usuario`.
- **Downstream consumers:** el resumen de generación, el texto que copia el
  botón Copiar (lleva los equipos con su formación), las estadísticas por
  puesto si en el futuro se calculan desde el puesto asignado.

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (propietario y administrador del grupo).
- **Reviewing teams:** *pending*.
- **Customers / partners:** el grupo de jugadores, como lectores de la cancha.

## 14. Out of scope / deferred

- **Equivalente de teclado para seleccionar e intercambiar** — *diferido hasta
  que se decida cómo se recorre la cancha con el teclado*; sigue vivo como
  pendiente en `Roadmap.md` §2 (`OPEN-Q-03`).
- **Mostrar el puntaje del jugador en cada puesto al seleccionarlo** —
  *diferido hasta que el administrador lo necesite para decidir un intercambio*;
  hoy decide con los puestos y ve el efecto en el total.
- **Intercambio fuera de puesto con confirmación explícita, fuera del arco
  vacío** — *diferido hasta que aparezca un caso real que cargar el puesto en la
  ficha no resuelva* (Alternative B).

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | ~~¿Qué dice el resumen sobre los intercambios manuales?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-12`: no dice nada nuevo; actúa la división vigente |
| OPEN-Q-02 | ~~Al regenerar, los intercambios hechos a mano sobre jugadores sin candado se pierden, como pasa hoy con cualquier movimiento manual. ¿Se confirma? ¿Y el arquero improvisado sin candado?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-18` |
| OPEN-Q-03 | ¿Cómo se selecciona e intercambia con el teclado? | Lucas Manoukian | Post-launch | WCAG 2.1.1 (§6.5); pendiente de `Roadmap.md` §2 |
| OPEN-Q-04 | ~~Durante un arrastre, ¿se resaltan los compatibles? Al soltar sobre una camiseta incompatible, ¿qué ve el administrador?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-19` |
| OPEN-Q-05 | ¿Con qué tokens del design system se dibujan la camiseta seleccionada, las resaltadas y el arco vacío como destino? | Lucas Manoukian | Plan | Orden de resolución de `AGENTS.md`; si nada alcanza, excepción documentada |
| OPEN-Q-06 | ~~En un partido editable cuyo puesto asignado todavía es del catálogo viejo (anterior a `desglose-posiciones`), ¿cómo se aplica la regla de compatibilidad?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-20` |
| OPEN-Q-07 | ~~¿Cómo se sabe el puesto anterior del arquero improvisado (`D-15`): se deriva o se guarda? Si se guarda, ¿las reglas de Firestore lo validan?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-21` |
| OPEN-Q-08 | ~~¿El arco vacío (`D-14`) aplica también en partidos "Solo por puntaje", donde no hay puestos asignados?~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-22` |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01 a D-17.
- **Decide in Spec:** OPEN-Q-02, OPEN-Q-04, OPEN-Q-06, OPEN-Q-07, OPEN-Q-08.
  Confirmar el `[INFERRED]` de §7.2.
- **Declarar reemplazos y marcarlos en origen.** La Spec declara qué parte de
  cada spec vigente reemplaza y la marca como reemplazada en su documento de
  origen, como hizo `desglose-posiciones`:

  | Documento | Parte | Qué cambia | Por |
  |---|---|---|---|
  | `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` | `D-19` | La edición manual deja de ser sólo entre equipos: también se intercambia dentro del equipo. El pase sigue siendo sólo entre equipos | `D-06`, `D-08`, `D-09` |
  | `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` | `D-20` | El intercambio escribe el puesto asignado; el pase no | `D-08`, `D-09` |
  | `ARRASTRE_SPEC.md` | §3.2, primera viñeta | Se permite intercambiar con una camiseta del mismo equipo (mover a otra línea sigue sin existir) | `D-08` |
  | `ARRASTRE_SPEC.md` | §3.2, viñeta del intercambio en una columna, y `R-02` | El intercambio existe en una columna, por toque | `D-06` |
  | `ARRASTRE_SPEC.md` | `FR-011`, `US-02` | El intercambio entre equipos cambia puestos, exige compatibilidad y también existe en una columna | `D-04`, `D-06`, `D-08` |
  | `ARRASTRE_SPEC.md` | `FR-013` | Soltar sobre una camiseta del propio equipo intercambia (sobre la cancha o la pestaña propias sigue sin efecto) | `D-08` |
  | `ARRASTRE_SPEC.md` | `FR-022`, `TC-012` | Un intercambio escribe `posicionAsignada` | `D-08` |
  | `ARRASTRE_SPEC.md` | `S-02` ("ninguna de las dos posiciones asignadas cambió"), `S-02c` | El escenario pasa a esperar el intercambio de puestos; `S-02c` deja de ser un fallo | `D-08` |
  | `ARRASTRE_SPEC.md` | `FR-015` | Sólo si `OPEN-Q-04` decide resaltar durante el arrastre | `OPEN-Q-04` |
  | `PANEL_ARMADO_SPEC.md` | §3.3 (herencia de `D-19`/`D-20`), `A-03` | El puesto asignado puede cambiar por un movimiento manual | `D-08`, `D-14` |

  Lo de arriba es lo encontrado al 2026-10-28 (revisión de
  `POSICIONES_DEL_JUGADOR_CONCEPT_CRITIQUE_2026-10-28_claude-sonnet-5-5.md`,
  Appendix B, verificada contra los documentos). La Spec vuelve a barrer
  `CANCHA_SPEC.md` y `CARGA_POR_TOQUE_SPEC.md` completos, que no se leyeron de
  punta a punta.
- **No se reemplaza:** el resumen dividido (`D-26`, `FR-072b` a `FR-072d`)
  queda intacto (`D-12`).
- **Responsive:** la Spec declara el comportamiento desde 360px, incluido el
  flujo tocar → cambiar de pestaña → tocar de `D-06` y el arco vacío como
  destino.
- **Must remain non-goals:**
  - "No se muestra nada de esto al rol `jugador`."
  - "No se cambian los puestos declarados de un jugador desde la cancha."
  - "No se mueve a un jugador a un lugar vacío de su propio equipo, salvo al arco vacío (`D-14`)."

## 17. Appendix

- Respuestas del propietario a dos rondas de preguntas: la del 2026-10-27 (por
  qué, alcance, gestos) y la del 2026-10-28 (resumen, "Solo por puntaje", arco
  vacío, segundo toque). Están resumidas en §10. No hay transcripción aparte; el
  Pain 1 es testimonio del propietario.
- Revisión independiente:
  [`POSICIONES_DEL_JUGADOR_CONCEPT_CRITIQUE_2026-10-28_claude-sonnet-5-5.md`](./POSICIONES_DEL_JUGADOR_CONCEPT_CRITIQUE_2026-10-28_claude-sonnet-5-5.md).

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Acota en `Roadmap.md` §3 la alternativa táctil para editar equipos: el intercambio por toque sale de ahí, el pase por toque y el teclado quedan. Self-critique: skipped (cross-model critique run instead). |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | Atiende la revisión de claude-sonnet-5-5 (4🔴 / 8🟡 / 4🔵, todas tomadas): §16 lista cada parte reemplazada; `D-12` se reescribe contra `D-26` (el resumen no cambia); el non-goal de fuera de puesto pasa a `D-04` "en esta versión" para no chocar con §14; `D-13` verificado en código; `D-01`, `D-03`, `D-05`, `D-07`, `D-08` reformuladas; se quita la cita sin fuente a juegos de fantasy y se verifica WCAG 2.1.1. Decisiones nuevas del propietario: arco vacío (`D-14` a `D-16`) y "Solo por puntaje" (`D-17`). Nuevas `OPEN-Q-06` a `OPEN-Q-08`; `OPEN-Q-01` resuelta. Self-critique: skipped. |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | Enmienda desde la Spec: se incorporan `D-18` a `D-23`, decisiones tomadas al escribirla (cuatro del propietario, dos técnicas verificadas en código), y se marcan resueltas `OPEN-Q-02`, `-04`, `-06`, `-07` y `-08`. `D-23` es la única excepción a `D-09`. Self-critique: no corresponde (enmienda acotada). |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | Se agrega `D-24` (el arco vacío y la vuelta del arquero elegido a su puesto anterior también aceptan el arrastre), pedido del propietario sobre el borrador de la Spec. Self-critique: no corresponde (enmienda acotada). |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | Decisiones nuevas del propietario al atender la revisión de la Spec ([`POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md)): `D-25` (el arquero elegido en la diferencia por línea), `D-26` (el arco en "Solo por puntaje" con la marca de dibujo existente) y `D-27` (arquero elegido con candado al regenerar). Self-critique: skipped |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | `D-28` (prioridad de quien declara Arquero para ocupar el arco vacío), a pedido del propietario; `D-14` queda enmendada en parte. Self-critique: skipped |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | `D-29`, a pedido del propietario: el equipo sin arquero rota el arco; "arquero elegido" se divide en arquero manual y arquero de arranque; quien ataja y se pone a mano en el arco también guarda su puesto anterior. `D-28` queda enmendada en parte. Self-critique: skipped |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | `D-30`, por aclaración del propietario: se retira el arquero improvisado; sólo quien declara Arquero ocupa el arco vacío; no cambia cómo el motor elige arqueros ni cómo se calculan los puntajes. `D-15`, `D-22`, `D-25`, `D-26` retiradas; `D-14` y `D-29` acotadas; notas de actualización en §5 y en la descripción del arco vacío. Self-critique: skipped |

---

*Next document: [Spec](./POSICIONES_DEL_JUGADOR_SPEC.md). The Spec defines
what the system shall do, how it shall behave, and which solutions are
admissible. Concrete implementation details live in the Implementation Plan,
not here and not in the Spec.*
