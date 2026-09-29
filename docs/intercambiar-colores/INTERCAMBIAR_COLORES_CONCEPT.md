# Intercambiar colores — Concept Note

> **Status:** Draft · **Date:** 2026-09-29 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** [INTERCAMBIAR_COLORES_SPEC.md](./INTERCAMBIAR_COLORES_SPEC.md) · **Implementation plan:** [INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md](./INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md)

## 1. TL;DR

Cuando el motor genera los equipos, el color de cada uno (Blanco o Negro) sale
del reparto, no de una elección: es la etiqueta de la lista en la que el motor
fue poniendo jugadores. Se propone que el administrador pueda **intercambiar los
colores** de un partido ya generado con un toque: el Equipo Blanco pasa a ser el
Negro y viceversa, **sin que cambie ningún integrante**. Sirve para respetar la
preferencia de los jugadores sin volver a generar ni mover a nadie a mano. El
botón vive en el encabezado de la tarjeta de equipos, junto a Copiar y Regenerar,
y está disponible desde que hay equipos generados hasta que se cierra la
inscripción o el partido se finaliza, lo que pase primero: no aparece en modo de
carga (inscripción cerrada) ni en el partido finalizado, y vuelve a aparecer si
la inscripción se reabre. La decisión que el lector debe conocer
antes que ninguna otra: como el color no es un campo sino la clave bajo la que se
guarda cada equipo, intercambiar colores significa intercambiar **todo** lo que la
generación guardó por color —jugadores, sumas de puntaje, balance por línea,
formación y equipo compensado por falta de arquero—, no solo las dos listas de
jugadores (`D-02`).

## 2. Problem statement

El color de cada equipo no significa nada para el motor, pero sí para los
jugadores, y hoy no hay forma de cambiarlo sin cambiar el reparto.

- **Pain 1 — el color lo decide el reparto, no las personas.** El motor llena
  siempre dos listas llamadas `blanco` y `negro`; con un número impar de
  titulares el cupo mayor va al Blanco (`cupoBlanco = Math.ceil(n/2)`,
  [index.html:2848](../../index.html#L2848)) y los empates de puntaje también
  ([index.html:2867](../../index.html#L2867)). Qué grupo de personas termina
  "de blanco" es un efecto lateral del algoritmo. Cuando los jugadores prefieren
  jugar del otro color, la preferencia no tiene dónde expresarse.
- **Pain 2 — la única salida hoy rompe el reparto.** Para que un grupo quede del
  otro color, el administrador tiene que regenerar (y esperar que el azar lo dé
  vuelta, perdiendo el reparto que ya estaba bien) o mover a cada jugador a mano
  al otro equipo, uno por uno, con el arrastre de la rebanada 2
  ([index.html:5181-5205](../../index.html#L5181-L5205)). Lo segundo, además,
  deja el receipt "dividido", porque las sumas vigentes dejan de coincidir con las
  que guardó la generación ([index.html:5447-5460](../../index.html#L5447-L5460)).

## 3. Goals

- Que el administrador pueda invertir qué grupo juega de Blanco y cuál de Negro
  con una sola acción, sin tocar la composición de los equipos.
- Que después del intercambio todo lo que la pantalla dice por color —cancha,
  totales, marcador, diferencia por línea, "por qué quedaron así", texto copiado—
  sea verdad para los colores nuevos.
- Que los goles, las asistencias y las estadísticas de cada jugador no cambien
  por intercambiar.
- Que un intercambio hecho por error se deshaga repitiendo la misma acción.

## 4. Non-goals

- No se ofrecen colores distintos de Blanco y Negro, ni nombres de equipo
  personalizados. La feature invierte los dos colores que ya existen; no
  introduce un catálogo de colores.
- No se cambia ningún integrante: el intercambio nunca mueve, agrega ni saca un
  jugador de un equipo, ni rebalancea puntajes.
- El rol `jugador` no puede intercambiar colores. Toda modificación de los
  equipos es administrativa, y esta no es la excepción.
- El intercambio no es una decisión del motor de generación y no se narra como
  tal: no aparece en el resumen de generación ni cuenta como una regla o
  estrategia nueva.

## 5. Vision / desired end state

Es jueves, los equipos ya están generados y el administrador los compartió en el
grupo. Alguien escribe: "¿podemos ser negro nosotros? traje la camiseta oscura".
El administrador abre el partido, toca el ícono de intercambiar que está al lado
de Copiar, y listo: la cancha que era blanca ahora es negra y viceversa, con los
mismos jugadores en los mismos puestos. Los totales, la diferencia y la
explicación de cómo se armaron siguen diciendo lo mismo, solo que con los colores
cambiados. Copia de nuevo la formación y el texto ya dice `*Negro* ⬛️` arriba del
grupo que pidió el cambio.

### 5.1 System context diagram

No aplica: la feature vive entera dentro de la aplicación existente
(`index.html`) y usa la misma persistencia en Cloud Firestore que ya usan las
demás acciones sobre un partido. No cruza ningún límite de sistema nuevo.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — Sin entrada de texto: la acción es un toque sobre un
  botón, sin parámetros más allá del partido. Solo la ejecuta un usuario
  autenticado con rol `admin`; el rol `jugador` no la ve y, si la invocara
  directamente, no modifica nada (mismo patrón que `FR-042` de
  [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md)).
- **Data sensitivity** — Nombres de jugadores y puntajes internos de armado. Sin
  datos regulados. Los puntajes ya viven en `data/partidosArmado`, de lectura y
  escritura exclusiva de `admin`
  ([`firestore-rules.md:162-169`](../rol-en-el-token/contracts/firestore-rules.md)).
- **Deployment surface** — Aplicación estática en GitHub Pages que escribe en
  Firestore. Condición preexistente, no introducida por esta feature: las reglas
  permiten que `jugador` escriba `data/partidos`
  ([`firestore-rules.md:65-75`](../rol-en-el-token/contracts/firestore-rules.md)),
  así que la restricción a `admin` de esta acción, como la de mover jugadores, se
  hace cumplir en la aplicación y no en las reglas.

## 6. Context & background

- **Existing system** — Un partido con equipos generados guarda en `m.equipos`
  dos listas de ids, `blanco` y `negro`, junto con los datos de la generación
  ([index.html:4251-4269](../../index.html#L4251-L4269)). `saveMatches()` parte
  ese objeto en dos documentos: `data/partidos` (público) conserva las listas y
  las posiciones; `data/partidosArmado` (solo admin) lleva sumas, balance por
  línea, formación, info de arqueros y bloqueados
  ([index.html:2150-2179](../../index.html#L2150-L2179)). No existe un campo
  "color": el color es la clave.
- **Related work** — El intercambio de dos jugadores por arrastre de la rebanada
  2 (`intercambiarUnidades`,
  [index.html:5138-5148](../../index.html#L5138-L5148)) es el antecedente más
  cercano: una acción de admin que muta el reparto y guarda en el acto. El texto
  copiado de la feature 006 nombra cada equipo por su color (`FR-003` de
  [`006-copiar-formacion/spec.md`](../006-copiar-formacion/spec.md)).
- **Organisational context** — Pedido directo del owner el 2026-09-29. La idea
  no estaba en `Roadmap.md`, así que no hay nada que retirar de ahí.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence**

- [index.html:2848](../../index.html#L2848), [index.html:2867](../../index.html#L2867) —
  el cupo impar y los empates van al Blanco: el color de cada grupo es un efecto
  del algoritmo, no una elección (Pain 1).
- [index.html:4204-4207](../../index.html#L4204-L4207) — `prevTeamOf` se arma
  leyendo `m.equipos.blanco/negro`: la próxima regeneración parte de los colores
  vigentes, sean los generados o los intercambiados (`D-09`).
- [index.html:4239-4248](../../index.html#L4239-L4248) — `cambios` compara colores
  entre generaciones; se calcula al generar, no al mover (`D-09`).
- [index.html:4251-4269](../../index.html#L4251-L4269) — forma completa de
  `m.equipos`: fija qué campos están indexados por color (`blanco`, `negro`,
  `sumaBlanco`, `sumaNegro`, `formacion`, `balanceLineas`, `arquerosInfo`) y
  cuáles por id de jugador (`posicionAsignada`, `posicionOverride`, `swaps`)
  (`D-02`).
- [index.html:3033](../../index.html#L3033), [index.html:3137](../../index.html#L3137) —
  cada entrada de `swaps` es `{playerId, desde, hacia}` con **posiciones**, no
  colores: el intercambio no la toca.
- [index.html:1903-1905](../../index.html#L1903-L1905),
  [index.html:5489](../../index.html#L5489),
  [index.html:5676-5683](../../index.html#L5676-L5683) —
  `arquerosInfo.equipoCompensado` decide a favor de quién se lee la diferencia y
  qué equipo "quedó sin arquero fijo" en la explicación (`D-02`).
- [index.html:2150-2179](../../index.html#L2150-L2179) — el guardado separa
  público y armado, y solo `admin` escribe `partidosArmado` (`D-03`, `D-08`).
- [index.html:4540-4550](../../index.html#L4540-L4550) — el total de goles de un
  equipo se deriva de los eventos de sus jugadores: el marcador sigue a los
  jugadores, no al color (`D-02`).
- [index.html:4308-4326](../../index.html#L4308-L4326) — ganados / empatados /
  perdidos se computan equipo propio contra rival, sin mirar el color: el
  intercambio no altera estadísticas.
- [index.html:4504-4506](../../index.html#L4504-L4506),
  [index.html:4587-4594](../../index.html#L4587-L4594) — `enModoCarga` y
  `esFilaEditable`: hoy mover jugadores no se permite con la inscripción cerrada;
  `D-04` alinea el intercambio con esa misma restricción en vez de apartarse de
  ella.
- [index.html:5181-5205](../../index.html#L5181-L5205) — `aplicarDrop`: guarda de
  rol, guarda de estado, mutación, `saveMatches()` y `renderMatchesTab()`. Patrón
  a imitar (`D-03`, `D-08`).
- [index.html:5361-5368](../../index.html#L5361-L5368),
  [index.html:5447-5460](../../index.html#L5447-L5460) — las sumas vigentes se
  recalculan del reparto y se comparan con las guardadas: si no se intercambian
  las guardadas, el receipt se "divide" sin que haya cambiado el reparto
  (`D-02`).
- [index.html:5815-5838](../../index.html#L5815-L5838) —
  `renderEncabezadoTarjeta`: los botones `.panel-icono` de Copiar y Regenerar;
  Regenerar sólo se agrega si `!locked`, con `locked = m.inscripcionCerrada ||
  m.estado === 'Finalizado'` ([index.html:5817](../../index.html#L5817)) — la
  misma condición que ahora rige a Intercambiar (`D-04`, `D-05`); la rama de
  partido finalizado no pasa por esta función
  ([index.html:6055-6084](../../index.html#L6055-L6084)).
- [index.html:1779-1819](../../index.html#L1779-L1819) —
  `formatearFormacionParaCopiar` rotula por color: el texto copiado sigue al
  intercambio sin cambios propios.

**Industry-standard evidence**

- *Regulatory:* WCAG 2.1 AA — un botón solo de ícono necesita nombre accesible
  (criterio 4.1.2) y un objetivo táctil suficiente; el patrón `.panel-icono`
  existente ya mide 44 px ([index.html:792-806](../../index.html#L792-L806)).
- *Architectural:* ninguna restricción más allá de las del proyecto.
- *Style / project convention:* [`AGENTS.md`](../../AGENTS.md) — principios de
  Simplicidad, Explicabilidad del motor, Arquitectura desacoplada, Responsive
  desde 360 px y Design system como fuente de verdad de UI; formato de commits;
  obligación de declarar reemplazos de specs existentes. Design system en
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/),
  componente `IconButton` (`components/core/IconButton.prompt.md`).

**Prior-art evidence**

- [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md) —
  intercambio de jugadores: `FR-010`/`FR-011` (intercambio), `FR-040` (sin
  arrastre en modo de carga), `FR-042` (no-admin no modifica), `NFR-005` (campos
  que escribe un movimiento), `TC-035` (el equipo visible es estado de pantalla).
- [`CANCHA_SPEC.md`](../equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md) —
  `FR-021`: la camiseta se pinta según el equipo de la unidad.
- [`006-copiar-formacion/spec.md`](../006-copiar-formacion/spec.md) — `FR-003`:
  encabezado `*Blanco* ⬜️` / `*Negro* ⬛️`.
- [`004-estadisticas-vista-jugadores/spec.md`](../004-estadisticas-vista-jugadores/spec.md) —
  el resultado de un jugador se decide contra el equipo rival, no por color.
- Productos pares: no se investigaron (ver §7.1).

## 7. Research & industry context

### 7.1 How established products handle this

No se investigó cómo resuelven esto otras aplicaciones de organización de
partidos. La feature es chica, el comportamiento lo fijó el owner directamente y
no hay una decisión abierta que un producto par pudiera resolver.

### 7.2 Relevant prior art / papers / standards

- WCAG 2.1, criterio 4.1.2 *Name, Role, Value* — el botón de ícono lleva un
  nombre accesible, como ya lo llevan Copiar y Regenerar
  ([index.html:5824-5831](../../index.html#L5824-L5831)).

### 7.3 Proofs of concept

No hubo PoC. El comportamiento se deduce del código leído en §6.5.

## 8. Proposed direction

### 8.1 Approach

Una acción nueva de administrador, "Intercambiar colores", que toma el partido y
da vuelta en un solo paso todo lo que su generación guardó indexado por color:
las dos listas de jugadores, las dos sumas, cada línea del balance, la formación
de cada equipo y el equipo compensado por falta de arquero. Lo que está indexado
por jugador —posición asignada, posiciones de display, swaps de posición,
bloqueados, eventos del resultado— no se toca, porque ya viaja con el jugador.

Hacerlo dos veces deja el partido exactamente como estaba: esa propiedad es a la
vez el mecanismo de deshacer (`D-06`) y la forma más directa de probar que no se
olvidó ningún campo.

El botón vive en el encabezado de la tarjeta de equipos, con el mismo patrón de
ícono que Copiar y Regenerar, y aparece bajo la misma condición que ya usa
Regenerar: equipos generados e inscripción todavía abierta. No aparece en modo
de carga (inscripción cerrada) ni en el partido finalizado; si la inscripción se
reabre, vuelve a aparecer. Al tocarlo, se aplica, se guarda y se repinta en el
acto, igual que un intercambio de jugadores por arrastre.

El motor de generación no cambia. La próxima vez que el administrador regenere,
el motor parte de los colores vigentes: un jugador bloqueado sigue en el color
en el que quedó después del intercambio.

### 8.2 Information / data model sketch

No hay entidades ni campos nuevos. El intercambio reescribe campos existentes de
`m.equipos` y no agrega ninguno: no se guarda "si los colores fueron
intercambiados", porque nada lo necesita (`D-07`).

## 9. Alternatives considered

### 9.1 Guardar un campo "colores invertidos" en vez de intercambiar los datos

- **Description:** agregar al partido una bandera que diga que Blanco se muestra
  como Negro y viceversa, y aplicarla en cada lugar que pinta o nombra un color.
- **Pros:** la acción escribe un solo campo; los datos de la generación quedan
  intactos.
- **Cons:** cada lugar que lee `blanco`/`negro` —cancha, paneles, marcador,
  pestañas, diferencia por línea, explicación, texto copiado, tarjeta del
  listado, motor al regenerar— tendría que consultar la bandera. Olvidarse uno
  deja la pantalla mintiendo. Rompe la invariante de hoy de que la clave es el
  color.
- **Decision:** Rejected — contradice Simplicidad ante todo: reparte el
  conocimiento del intercambio por toda la aplicación en vez de concentrarlo en
  una operación.

### 9.2 Intercambiar solo las dos listas de jugadores

- **Description:** dar vuelta `equipos.blanco` y `equipos.negro` y dejar el resto.
- **Pros:** es lo que ya escribe un movimiento por arrastre (`NFR-005` de la
  rebanada 2); la mutación es mínima.
- **Cons:** las sumas, el balance por línea, la formación y el equipo compensado
  quedarían del lado equivocado. El receipt se dividiría como si alguien hubiera
  tocado el reparto
  ([index.html:5447-5460](../../index.html#L5447-L5460)) y la explicación diría
  que el equipo sin arquero fijo es el otro.
- **Decision:** Rejected — viola el objetivo de que todo lo que la pantalla dice
  por color siga siendo verdad (§3) y el principio de Explicabilidad.

### 9.3 Resolverlo regenerando o moviendo jugadores

- **Description:** no construir nada; el administrador regenera o arrastra.
- **Pros:** cero código.
- **Cons:** regenerar cambia el reparto; arrastrar uno por uno es lento y divide
  el receipt (Pain 2). Con la inscripción cerrada tampoco hay arrastre (`FR-040`
  de `ARRASTRE_SPEC.md`), pero ese caso ya no motiva esta feature (`D-04`).
- **Decision:** Rejected — es exactamente el problema que motiva la feature.

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | Intercambiar colores invierte qué grupo de jugadores es el Equipo Blanco y cuál el Negro; ningún integrante cambia de equipo | Es lo que pidió el owner: cambia el nombre del equipo, no su composición | Easy |
| D-02 | Junto con las listas de jugadores se intercambian todos los campos de la generación indexados por color: `sumaBlanco`/`sumaNegro`, cada línea de `balanceLineas`, `formacion.blanco`/`negro` y `arquerosInfo.equipoCompensado`. Los campos indexados por jugador no se tocan | Sin esto el receipt se divide y la explicación miente (§9.2) | Easy |
| D-03 | Solo `admin` intercambia. El botón no se muestra a `jugador` y, si se invocara directamente, no modifica el partido | Toda edición de equipos es administrativa, y los campos de `D-02` solo los escribe `admin` | Easy |
| D-04 | Disponible mientras la inscripción sigue abierta y hay equipos generados, hasta que se cierra la inscripción o el partido se finaliza — la misma condición (`locked`) que ya usa Regenerar. No disponible en modo de carga (inscripción cerrada), en un partido finalizado, ni mientras se edita el resultado de un partido finalizado. Vuelve a estar disponible si la inscripción se reabre | El pedido de cambio de color llega antes de cerrar la inscripción, no en la cancha; alinear la disponibilidad con la de Regenerar evita agregar una excepción nueva | Easy |
| D-05 | El botón es un ícono en el encabezado de la tarjeta de equipos, junto a Copiar y Regenerar, con el patrón `.panel-icono` y el componente `IconButton` del design system | Mismo lugar y estilo que las otras acciones sobre el reparto; un solo lugar que funciona igual en mobile y desktop | Easy |
| D-06 | Se aplica sin confirmación. Repetir la acción deshace el intercambio | Intercambiar dos veces deja el partido idéntico: no se pierde nada | Easy |
| D-07 | El intercambio no se anota ni se narra: no hay aviso de "colores intercambiados" en el resumen de generación ni campo que lo recuerde | El reparto sigue siendo el que armó el motor; lo que cambia son las etiquetas, y con `D-02` la explicación se lee correcta con los colores nuevos | Easy |
| D-08 | El intercambio se guarda en el acto con el mismo guardado de siempre, en los dos documentos (`partidos` y `partidosArmado`), y se repinta la pantalla | Mismo comportamiento que un intercambio por arrastre; el color es un dato del partido que todos los jugadores ven | Easy |
| D-09 | El motor de generación no cambia. Una regeneración posterior parte de los colores vigentes (los jugadores bloqueados siguen en el color que les quedó) y el contador `cambios` de la última generación no se modifica al intercambiar | `prevTeamOf` y `cambios` ya se comportan así; tocarlos agregaría reglas al motor sin necesidad | Medium — revertirla es agregar una regla al motor, no un ajuste de interfaz |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| Se olvida algún campo indexado por color y la explicación o la diferencia quedan del lado equivocado | Med | Med | Prueba de que intercambiar dos veces devuelve el partido idéntico, y de que después de un intercambio el receipt no se divide |
| Un texto de la pantalla dice "Blanco" o "Negro" fijo en vez de leerlo del dato, y no sigue al intercambio | Med | Low | Revisar en el Plan cada texto que nombra un color (§6.5 los enumera) |
| Un jugador con la pantalla abierta ve los colores viejos hasta recargar | Low | Med | Es el mismo comportamiento que cualquier otra edición del partido hoy; no se agrega nada |

## 12. Success signals

- El administrador deja de regenerar o de arrastrar jugadores para cambiar de
  color un equipo que ya estaba bien armado.
- Después de intercambiar, el panel no muestra el receipt dividido ni la
  explicación contradice a la cancha.
- Nadie reporta goles o estadísticas cambiados de equipo después de un
  intercambio.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** Cloud Firestore, sin cambios en las reglas.
- **Upstream specs / RFCs:** rebanadas 1, 2, 3, 4 y 6 de
  [`equipos-en-el-campo`](../equipos-en-el-campo/), `006-copiar-formacion`,
  `007-permisos-por-usuario`, `rol-en-el-token`. La Spec debe declarar si alguna
  parte de ellas queda reemplazada; en principio solo agrega comportamiento
  (ver `OPEN-Q-04`).
- **Downstream consumers:** ninguno fuera de la aplicación.

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (owner del producto).
- **Reviewing teams:** *pending*.
- **Customers / partners:** los jugadores del grupo, que ven el color de su
  equipo.

## 14. Out of scope / deferred

- **Intercambiar colores en un partido ya finalizado.** — *deferred until* que
  haga falta corregir después de jugado quién jugó de qué color. Técnicamente no
  afecta estadísticas (§6.5), pero hoy no hay un caso que lo pida.

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | En mobile, donde se ve un equipo por pestaña: después de intercambiar, ¿la pestaña visible se queda en el mismo color (y muestra al otro grupo) o sigue al grupo que se estaba viendo (y cambia de pestaña)? | Lucas Manoukian | Spec | El equipo visible es estado de pantalla (`TC-035` de la rebanada 2) |
| OPEN-Q-02 | Qué ícono y qué nombre accesible lleva el botón (p. ej. "Intercambiar colores") | Lucas Manoukian | Spec | Resolver contra el design system; el slug de Lucide no está confirmado en el repo |
| OPEN-Q-03 | ¿Hay algún texto de la pantalla que nombre un color fijo en vez de leerlo del dato? | Lucas Manoukian | Plan | Riesgo 2 de §11 |
| OPEN-Q-04 | ¿Hace falta declarar un reemplazo en `ARRASTRE_SPEC.md`? `NFR-005` limita los campos que escribe *un movimiento* y `FR-040` prohíbe *el arrastre* en modo de carga; el intercambio no es ninguna de las dos cosas, y ahora además coincide con `FR-040` en que tampoco está disponible en modo de carga (`D-04`). La Spec tiene que decir si alcanza con citar `FR-040` como precedente o hace falta una declaración de reemplazo | Lucas Manoukian | Spec | Obligación de `AGENTS.md` sobre reemplazos |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01, D-02, D-03, D-04, D-05, D-06, D-07,
  D-08, D-09.
- **Decide in Spec:** OPEN-Q-01, OPEN-Q-02, OPEN-Q-04. OPEN-Q-03 va al Plan.
- **Must remain non-goals:**
  - "No se ofrecen colores distintos de Blanco y Negro, ni nombres de equipo
    personalizados. La feature invierte los dos colores que ya existen; no
    introduce un catálogo de colores."
  - "No se cambia ningún integrante: el intercambio nunca mueve, agrega ni saca un
    jugador de un equipo, ni rebalancea puntajes."
  - "El rol `jugador` no puede intercambiar colores. Toda modificación de los
    equipos es administrativa, y esta no es la excepción."
  - "El intercambio no es una decisión del motor de generación y no se narra como
    tal: no aparece en el resumen de generación ni cuenta como una regla o
    estrategia nueva."
- **Responsive:** la Spec declara el comportamiento desde 360 px, incluido el
  encabezado con un botón más (Copiar, Regenerar e Intercambiar, más la píldora
  de diferencia en dos columnas).

## 17. Appendix

- Respuestas del owner (2026-09-29): motivo "preferencia de los jugadores"; el
  color se asigna arbitrariamente al generar; "no debe cambiar los integrantes,
  solo el nombre del equipo asignado". Disponible hasta finalizar; solo admin;
  sin aviso; botón junto a Copiar; sin confirmación.
- Refinamiento del owner (2026-09-29, durante la autocrítica): el pedido de
  cambio de color no llega en la cancha; con la inscripción cerrada no se puede
  intercambiar, y vuelve a poder hacerse si la inscripción se reabre (`D-04`).

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-29 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Self-critique: pending. |
| 2026-09-29 | Lucas Manoukian (claude-sonnet-5) | Autocrítica contra la rúbrica: sin hallazgos 🔴. 🟡 resueltos: reversibilidad de `D-09` corregida de Easy a Medium (revertirla toca el motor, no la interfaz); cita de WCAG 4.1.2 verificada en vivo contra la página del W3C. Durante la revisión, el owner corrigió `D-04`: el intercambio ya no está disponible con la inscripción cerrada (se cae el Pain 3 original, el párrafo de "la cancha" en §5 y la fila de riesgo asociada; se ajustan §6.5, §8.1, §9.3, `OPEN-Q-04` y el Apéndice en consecuencia). Self-critique: passed (0🔴 / 2🟡 / 0🔵). |

---

*Next document: [Spec](./INTERCAMBIAR_COLORES_SPEC.md). The Spec defines
what the system shall do, how it shall behave, and which solutions are
admissible. Concrete implementation details live in the Implementation Plan,
not here and not in the Spec.*
