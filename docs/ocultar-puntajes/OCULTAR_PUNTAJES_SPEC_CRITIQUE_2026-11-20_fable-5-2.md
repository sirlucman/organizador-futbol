# Critique — OCULTAR_PUNTAJES_SPEC.md (per-doc, segunda ronda)

> **Critic model:** claude-fable-5-2 (el identificador que informa la sesión en curso)
> **Author model:** claude-opus-5-5 (Change log de la Spec, filas del 2026-11-20)
> **Independencia (Step 7.0):** mismo proveedor, familias distintas (Opus autor / Fable crítico) → *proceed with caveat*: el crítico puede compartir sesgos residuales de entrenamiento con el autor. Los datos de modelo los dio el owner en el pedido.
> **Date:** 2026-11-20
> **Inputs:** `docs/ocultar-puntajes/OCULTAR_PUNTAJES_SPEC.md` (rama `docs/ocultar-puntajes`, HEAD `ec5ae41`). Contrastado con `OCULTAR_PUNTAJES_CONCEPT.md`, la primera crítica (`OCULTAR_PUNTAJES_SPEC_CRITIQUE_2026-11-20_sonnet-5-5.md`), `AGENTS.md`, `git diff 083cd1c ec5ae41 -- docs/`, `index.html`, `tests/layout.test.js`, `tests/fixtures-app.js` y las specs de `docs/` que nombran las marcas de posición (`CANCHA_SPEC`, `PANEL_ARMADO_SPEC`, `PARTIDO_FINALIZADO_SPEC`, `POSICIONES_DEL_JUGADOR_SPEC`, `DESGLOSE_POSICIONES_SPEC`, `ARRASTRE_SPEC`, `007`, `002`, `003`, `011`, `012`, `014`).
> **Modo:** per-doc. Segunda ronda: no repite los hallazgos de la primera que quedaron resueltos. No se editó la Spec ni ningún otro archivo; no se hizo commit.

## Verdict

**COMMENT** — 0 🔴, 4 🟡, 4 🔵. Los diez hallazgos de la primera crítica están resueltos en el texto (tabla más abajo), y las 14 citas a `index.html` y `tests/` agregadas desde entonces existen y dicen lo que la Spec afirma. Lo que esta ronda encuentra es nuevo y casi todo nace de la enmienda de `D-07`: (1) quedan dos requisitos vigentes de `DESGLOSE_POSICIONES_SPEC.md` —`FR-076` y `FR-077`— que obligan a mostrar la marca "2º" y el puesto principal en el `title`, sin declarar ni marcar, para `jugador` y también para "oculto"; (2) quitar las marcas no alcanza para que `jugador` "no vea si alguien juega en su principal": la lista de convocados y el listado de jugadores le siguen mostrando el puesto principal y los secundarios de cada uno, y la Spec no lo declara; (3) la variante nueva `S-07e` describe un aviso que con ese gesto no aparece; (4) `AC-04` se volvió mecánico con un criterio que hoy falla para los 35 requisitos aunque todas las notas existan. *(Crítica de mismo proveedor, distinta familia: el hueco de independencia entre proveedores sigue abierto.)*

Nota sobre severidad: el hallazgo 1 es del mismo tipo que el hallazgo 2 de la primera crítica, que se graduó 🟡; lo mantengo en 🟡 por coherencia. Si el owner trata la obligación de `AGENTS.md` ("DEBE declararlo") como compuerta, es el único que frena el merge de la rama de docs.

## Findings

### Per-doc — Accuracy

### 1. `S-07e` describe un aviso que ese gesto no produce, y `FR-044` no dice cuáles avisos cubre

- **Dimension:** Accuracy
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §9.1 `S-07e` (líneas 600-601), §7.4 `FR-044` (líneas 389-392), §9.3 (línea 688)
- **What:** `S-07e` dice: "tocar a Ana y después a un jugador del que Ana no cubre el puesto: aparece el aviso 'Ana no juega de …'". Con ese gesto el aviso no aparece. Aparece al **arrastrar** a Ana y soltarla sobre ese jugador.
- **Why it matters:** la variante no puede pasar tal como está escrita. Y si alguien la implementa al pie de la letra, cambia un comportamiento vigente: `FR-014` de `POSICIONES_DEL_JUGADOR_SPEC.md` dice que tocar una camiseta no candidata "la seleccionará en lugar de la anterior". Es la única variante que ejercita `FR-044`.
- **Evidence:** (Hecho, leído en el código y en la spec)
  - `resolverToqueCamiseta` (`index.html:6032-6040`): un toque sobre una no candidata devuelve `'seleccionar'`, sin aviso.
  - El aviso `a-no-cubre` ("X no juega de Y", `index.html:6020`) sólo sale de `avisoDeRechazo`, que se llama en el drop (`index.html:6236-6238`). Es `FR-042` / `FR-042c` de `POSICIONES_DEL_JUGADOR_SPEC.md` (líneas 484-491).
  - El rango que cita `FR-044` (`index.html:6016-6022`) contiene **tres** avisos. Sólo uno es un rechazo. Los otros dos son "Nadie puede intercambiar puesto con X" (al seleccionar, `index.html:5607-5609`, `FR-018` de posiciones) y "Ya no se puede intercambiar: el reparto cambió" (`index.html:5612`). `FR-044` dice "avisos de un intercambio de puesto rechazado (por ejemplo…)": no queda dicho si esos dos se ven en "oculto". `FR-040` no los alcanza, porque habla de "todo elemento de la tarjeta" y el aviso emergente vive fuera de ella.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** reescribir `S-07e` como arrastre ("arrastrar a Ana y soltarla sobre un jugador cuyo puesto Ana no cubre"). Reescribir `FR-044` enumerando los tres avisos por su texto, o remitiendo a `FR-018`, `FR-034b` y `FR-042c` de posiciones. Sumar una variante para "Nadie puede intercambiar puesto con …" en "oculto", que es el único de los tres que nace de un toque.

### 2. Quitar las marcas no alcanza para lo que `D-07` promete: `jugador` sigue viendo el puesto principal y los secundarios de cada uno en otras partes de la pantalla

- **Dimension:** Accuracy (contra el objetivo de `D-07`), con efecto en Completeness
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §2 (líneas 86-87), §3.1 (línea 101), `US-07`, `FR-053` a `FR-056`, §3.2; `OCULTAR_PUNTAJES_CONCEPT.md` §3 (líneas 88-89), `D-07`, §6.5 (líneas 242-244)
- **What:** respuesta al punto 2 del pedido. Dentro de la tarjeta de equipos, `FR-053` a `FR-056` cubren **todos** los lugares donde hoy se marca la relación con el puesto principal (barrido al final). Pero fuera de la tarjeta `jugador` sigue viendo el puesto principal —y los secundarios— de cada jugador. Como `FR-056` le deja el nombre del puesto asignado, puede comparar y deducir quién juega en su principal, quién en una secundaria y quién fuera de puesto.
- **Why it matters:** la Spec promete, en `US-07`, "no quiero ver si un compañero juega en su posición principal o no", y el Concept Note lo fija como objetivo (§3). Lo que la Spec entrega es otra cosa: que la pantalla no se lo **marque**. Puede ser exactamente lo que el owner quiere. Pero hoy no está dicho, y el Plan no puede decidirlo (§17: sin relitigación).
- **Evidence:** (Hecho, leído en `index.html`)
  - **Lista de convocados** (`index.html:7950`, `7963`): cada fila lleva un badge con la sigla del puesto principal y su nombre en el `title`. No tiene guarda de rol. El propio código dice que esa columna la ven los dos roles (`index.html:7152-7153`). En dos columnas queda al lado de la tarjeta.
  - **Listado de jugadores** (`index.html:3055`): badge del puesto principal; (`index.html:3031`, `3058`) una etiqueta por cada puesto secundario. El comentario de `index.html:3051-3052` dice que `jugador` ve el listado completo.
  - **Buscador para convocar** (`index.html:8054-8055`, `8112-8113`): sigla del puesto principal. *Sin verificar* si `jugador` lo ve en todos los estados del partido.
  - El puesto asignado sigue a la vista: en el `title` (`FR-056`) y en el lugar que la camiseta ocupa en la cancha.
  - El Concept Note §6.5 revisó la lista de convocados sólo por puntajes ("no muestra puntajes: no hace falta tocarla"), antes de la enmienda de `D-07`. No se volvió a mirar con la enmienda.
- **Efecto secundario sobre "oculto"** (Inferencia): la captura que motiva la feature, tomada a 1100 px o más, incluye la lista de convocados con el puesto principal de cada uno al lado de las canchas. `D-02` quita las marcas de posición "para que la captura no tenga ningún indicio de … cómo se armaron"; ese indicio sigue ahí. No lo gradúo aparte: depende de qué recorte el owner.
- **Confidence:** High (hechos de código); Medium (que el owner lo considere un problema)
- **Severity:** 🟡 Should fix
- **Suggested fix:** que el owner elija y la Spec lo diga. (a) Si alcanza con no marcarlo: reescribir `US-07`, el Summary y §3.1 como "la pantalla no le marca…", y sumar a §3.2 una línea explícita: "el sistema no ocultará a `jugador` el puesto principal ni los secundarios en la lista de convocados ni en el listado de jugadores". Enmendar `D-07` y el objetivo de §3 del Concept Note en el mismo sentido. (b) Si no alcanza: son requisitos nuevos sobre otras pantallas, con su propia declaración de reemplazo.

### Per-doc — Consistency

### 3. La declaración de reemplazo omite `FR-076` y `FR-077` de `DESGLOSE_POSICIONES_SPEC.md`, que obligan a mostrar lo que `D-07` y "oculto" quitan

- **Dimension:** Consistency (obligación de declaración de `AGENTS.md`)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` encabezado, tablas 1 y 2 (líneas 22-43) y párrafo "No reemplaza" (líneas 45-51); `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` líneas 453-458
- **What:** respuesta al punto 3 del pedido. Las filas nuevas dicen lo que la Spec afirma y cada una tiene su nota recíproca (tabla al final). Pero faltan dos requisitos vigentes, sin nota ni marca de reemplazo, en una spec que la declaración nombra sólo para decir que no la toca.
- **Why it matters:** `AGENTS.md`: "Sin esa declaración, dos specs vigentes se contradicen". Hoy `DESGLOSE_POSICIONES_SPEC.md` manda mostrar la marca "2º" y el puesto principal en el `title`, a cualquier rol y en cualquier estado; esta Spec manda lo contrario para `jugador` siempre (`FR-053`, `FR-056`) y para `admin` en "oculto" (`FR-021`, `FR-036`). `AC-04` no lo puede detectar: sólo revisa los IDs que la tabla ya lista. Es la tercera vez que la lista queda corta (segunda autocrítica, primera crítica, ésta), todas por el mismo método: partir de las specs conocidas en vez de buscar en todo `docs/`.
- **Evidence:** (Hecho, leído en `DESGLOSE_POSICIONES_SPEC.md`)
  - `FR-076`: "El sistema expondrá en el `title` de la camiseta el nombre del puesto asignado y, si difiere, el del puesto principal". Lo cita el código como fuente de la mención "(su puesto es …)" (`index.html:5415`).
  - `FR-077`: "El sistema mostrará la marca '2º' en la camiseta cuando el puesto asignado no sea el principal, como hoy".
  - Su `US-07` (línea 270) es de `jugador`: "Como jugador, quiero ver en la cancha a cada uno de su lado", implementada por `FR-070` a `FR-077`.
  - `grep` de `OCULTAR_PUNTAJES`, `Acotado` o `Reemplazado` sobre esas líneas: sin resultados.
  - Barrido del resto de `docs/` (27 archivos que nombran las marcas): no encontré otro requisito vigente sin marcar. `ARRASTRE_SPEC.md` `FR-038` sólo obliga a mostrar el selector de equipo; `PARTIDO_FINALIZADO_SPEC.md` `FR-060` habla de chips, fila de resultado y filas de detalle, no de marcas; `002`, `003`, `011`, `012` y `014` hablan de la ficha, del motor o del puntaje, no de lo que ve `jugador` en la cancha.
- **Contexto, fuera del alcance de esta Spec** (Hecho): `FR-077` ya estaba desalineado antes. `FR-025` de `POSICIONES_DEL_JUGADOR_SPEC.md` cambió cuándo se muestra la «2º» (sólo si la unidad cubre ese puesto) y esa Spec tampoco declaró el reemplazo de `FR-077`. Conviene que la nota nueva lo diga, para no heredar la contradicción vieja.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar `FR-076` (sólo en "y, si difiere, el del puesto principal") y `FR-077` a la tabla 1 y a la tabla 2; marcarlos en `DESGLOSE_POSICIONES_SPEC.md` con su nota y su fila de Change log; ajustar el párrafo "No reemplaza", que hoy dice que de esa spec no se toca nada, y la cuenta "cinco specs vigentes" (pasan a ser seis). Dejar escrito el método en `AC-04`: un `grep` de las marcas sobre todo `docs/`, no sólo sobre las specs ya listadas.

### 4. Restos de las correcciones: referencias que quedaron apuntando al texto anterior

- **Dimension:** Consistency
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §11.1 `AC-01`, §5.2 `US-04`, §2 (línea 84), diagrama de `S-05` (línea 541), `S-05d` (línea 557), `TC-040`
- **What:** cinco desajustes chicos que dejó la ronda de enmiendas.
  - `AC-01` sigue diciendo "cubre `FR-001` a `FR-043`". `FR-043b` y `FR-044` quedan sin ningún `AC` que los nombre (los escenarios que los ejercitan sí están en el rango `S-01` a `S-08`).
  - `US-04` lista `FR-042`, `FR-043`; faltan `FR-043b` y `FR-044`. `FR-044` no implementa ninguna historia.
  - `FR-018` quedó anclado a "se cierra la sesión", pero el Summary sigue diciendo "al cambiar de sesión" y el diagrama, "cambia la sesión". El diagrama no se tocó en el diff.
  - `S-05d` cita `FR-013` para afirmar que el estado sobrevive a un cruce de ancho. `FR-013` habla de abrir otro partido. Ningún `FR` dice que el estado sobrevive a un repintado por cambio de ancho: la Spec enumera los eventos que lo conservan (`FR-013`, `FR-016` a `FR-016d`, `FR-043b`) pero no tiene el invariante.
  - `TC-040` suma `FR-055` a los textos que "seguirán armándose con el nombre del jugador escapado"; el nombre accesible de una pestaña no lleva nombres de jugador (`index.html:5802-5805`).
- **Why it matters:** el Plan arma su matriz de cobertura desde estos rangos; un `FR` fuera de todo `AC` queda sin fila.
- **Evidence:** líneas citadas; `git diff 083cd1c ec5ae41` no muestra cambios en la línea del diagrama.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** `AC-01` → "a `FR-044`"; `US-04` suma `FR-043b` y `FR-044`; Summary y diagrama → "cierra la sesión"; un `FR` ubicuo nuevo ("el sistema sólo cambiará el estado al tocar el ojo, al cargar la página o al cerrar la sesión") que `S-05d` pueda citar; sacar `FR-055` de `TC-040`.

### Per-doc — Completeness

### 5. Los requisitos nuevos de `jugador` tienen escenario, pero la cobertura es más angosta que la de "oculto"

- **Dimension:** Completeness
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` `S-09` y variantes (líneas 622-646), §11.5 (líneas 764-765), §17 *Plan must also* (línea 831), `NFR-006`
- **What:** respuesta al punto 5 del pedido. Cada requisito partido o nuevo tiene al menos una variante que lo ejercita (tabla al final). Cuatro huecos parciales:
  - `FR-056` excluye tres menciones; `S-09e` prueba dos. "(posición secundaria)", que sólo sale con una dupla (`index.html:5418`), tiene variante en "oculto" (`S-08a`) pero no para `jugador`.
  - `FR-053` y `FR-054` se prueban sólo en el partido finalizado a 1200 px (`S-09`) y de pasada en `S-09d`. `jugador` tiene dos ramas de dibujo distintas (`index.html:7198-7227` y `7229-7250`). Para el "pts" hay una variante `[property]` que recorre toda situación y ancho (`S-09c`); para las marcas, no.
  - §11.5 pide una aserción por elemento para `FR-036`, `FR-040` y `FR-042`, pero no para `FR-055` ni `FR-056`, que también enumeran.
  - §17 pide escenarios de `jugador` que afirmen la ausencia de `.camiseta-sec` y `.camiseta-fuera`; no nombra la «!» de la pestaña (`.equipo-tab-fuera`, `index.html:5806`) ni los textos emergentes. Y `NFR-006` —la red contra un elemento futuro que se olvide del ojo— no tiene equivalente para `jugador`.
- **Why it matters:** es el mismo riesgo que §15 ya reconoce para "oculto" (una feature futura agrega una marca y se olvida), ahora también para el rol.
- **Evidence:** líneas citadas.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** una variante `S-09g [boundary]` con una dupla en puesto secundario; una `S-09h [property]` ("para `jugador`, en cualquier situación y ancho, el documento no contiene ninguna marca de posición ni sus textos"); sumar `FR-055` y `FR-056` a la frase de §11.5 y `.equipo-tab-fuera` a §17.

### Per-doc — Clarity

### 6. `AC-04` se volvió mecánico con un criterio que hoy falla para todos los requisitos

- **Dimension:** Clarity (AC verificable)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §11.1 `AC-04` (líneas 717-721)
- **What:** `AC-04` dice: "para cada ID de las tablas, la línea siguiente a su definición en su spec contiene el enlace a `OCULTAR_PUNTAJES_SPEC.md`". Las notas existen, pero no están en "la línea siguiente": están al final de cada requisito, que ocupa entre 3 y 17 líneas.
- **Why it matters:** el `AC` nació de la primera crítica (hallazgo 2) para dejar de depender de "quien revisa". Tal como quedó, un `grep` que lo siga al pie de la letra da 0 de 35 y hay que volver a revisarlo a mano.
- **Evidence:** (Hecho, medido con un script sobre las cuatro specs marcadas) los 35 IDs de las tablas tienen una nota con el enlace **entre su definición y la definición siguiente**; ninguno la tiene en la línea inmediatamente posterior. Ejemplos: `FR-070b` de `PANEL_ARMADO_SPEC.md` se define en la línea 598 y su nota está en la 604; `S-04` de `PARTIDO_FINALIZADO_SPEC.md`, en 640 y 642.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** "…el bloque del requisito, desde su definición hasta la definición siguiente, contiene el enlace". Para las filas de la tabla 1, pedir además que la nota nombre a `jugador` y cite el `FR-05x` que corresponde: hoy `S-04b`, `FR-042b` y `AC-05` de `PARTIDO_FINALIZADO_SPEC.md` lo hacen por el número de `FR`, no por la palabra.

### 7. Tres de los requisitos nuevos repiten el patrón que la primera crítica pidió partir

- **Dimension:** Clarity (`MD-03`, una obligación por línea)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §7.4 `FR-044`, §7.5 `FR-055`, `FR-056`
- **What:**
  - `FR-055` junta dos obligaciones: no dibujar la «!» de las pestañas **y** fijar su nombre accesible. Para "oculto" las mismas dos están separadas (`FR-023`, `FR-037`).
  - `FR-056` enumera tres exclusiones y una permanencia.
  - `FR-044` lleva su motivo adentro ("Elegido por el owner…: sólo aparecen tras un gesto…"), lo mismo que la primera crítica pidió sacar de `FR-018` y `FR-038`.
- **Why it matters:** un test atado a `FR-055` falla por dos causas distintas sin decir cuál.
- **Evidence:** líneas 389-392 y 407-412.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** partir `FR-055` en dos (`FR-055`, `FR-055b`); pasar el motivo de `FR-044` a una nota debajo; para `FR-056`, ver hallazgo 5 (aserción por elemento).

### Per-doc — Methodology-invariants

### 8. Tags de las variantes nuevas: tres bien usados, uno discutible

- **Dimension:** Methodology-invariants (`MD-22`)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` `S-05d`, `S-07e`, `S-09e`, `S-09f`
- **What:** los cuatro usan tags del conjunto cerrado. `S-07e [failure]` es correcto: un gesto rechazado. `S-09e` y `S-09f [boundary]` son aceptables. `S-05d [concurrency]` es el discutible: cruzar un ancho con el estado vivo es una secuencia de pasos, no dos cosas que pasan a la vez. Es la misma objeción que la primera crítica le hizo a `S-06b` —y fue esa crítica la que propuso este tag para `S-05d`—.
- **Why it matters:** poco. El tag orienta el nivel de prueba en el Plan; `[concurrency]` puede llevar a buscar una carrera que no existe.
- **Evidence:** líneas 554-557. (Hecho) el repintado por cambio de ancho es un manejador síncrono (`index.html:5766-5768`).
- **Confidence:** Low
- **Severity:** 🔵 Suggestion
- **Suggested fix:** `[boundary]`, o dejarlo y anotar que es la única variante de ese tag por decisión. De paso, reordenar `S-09d` antes de `S-09e` y `S-09f`.

## Verificación pedida

### Punto 1 — los diez hallazgos de la primera crítica

| # | Primera crítica | ¿Resuelto? | Cómo lo comprobé |
|---|---|---|---|
| 1 | `FR-017` y Glosario describían una sola pantalla sin equipos | ✓ | `FR-017` es una obligación única; el Glosario distingue las dos ramas y cita `7145-7149` y `7151-7176`, que son las dos ramas del código |
| 2 | Faltaban `FR-037`, `FR-070`, `FR-070b`, `FR-071`, `FR-074` de `PANEL_ARMADO_SPEC` | ✓ | Están en la tabla 2 y cada uno tiene su nota. **El método sigue dejando huecos: hallazgo 3. El `AC-04` nuevo: hallazgo 6** |
| 3 | `FR-018` no estaba en `D-05` | ✓ | `D-05` del Concept Note lo registra con su fila en §18; `FR-018` es una sola cláusula. Resto: hallazgo 4 |
| 4 | El aviso de intercambio rechazado no estaba decidido | ✓ decidido | `FR-044`. **La variante que lo prueba está mal: hallazgo 1** |
| 5 | `NFR-003` medía alto y no podía fallar | ✓ | Mide por presencia. Comprobé `index.html:498` (margen de 12 px) |
| 6 | Requisitos compuestos | ✓ | `FR-016` en cuatro, `FR-043` en dos, motivos fuera de `FR-018` y `FR-038`. Reaparece en lo nuevo: hallazgo 7 |
| 7 | Tags laxos; faltaba el cruce de ancho | ✓ | `S-06b` y `S-07c` son `[boundary]`; `S-05d` existe. Ver hallazgo 8 |
| 8 | Arrastre y cierre de sesión sin entorno de prueba | ✓ | §17 lo pide; `tests/fixtures-app.js:501` sigue siendo `signOut: async () => {}` |
| 9 | `AC-54` sin declaración | ✓ | `AC-54` declara que no hay telemetría |
| 10 | Instrucción errada sobre `layout.test.js:1602-1606` | ✓ | El encabezado y §17 dicen que ese bloque ya corre con `admin` (`tests/layout.test.js:1539`) |

La red de seguridad por rol que proponía el hallazgo 3 de la primera crítica ya no hace falta: comprobé que todo lo de §7.3 que `jugador` podía ver (pastillas, «!» de pestaña, menciones del `title`) ahora se le quita por rol, con o sin ojo.

### Punto 2 — barrido de la pantalla de `jugador` (resumen; detalle en el hallazgo 2)

| Lugar | ¿Revela la relación con el principal? | ¿Cubierto? |
|---|---|---|
| Pastillas «2º» y «!» y sus `title` (`index.html:5518-5526`, `5977-5981`) | Sí | ✓ `FR-053`, `FR-054` (el `title` se va con la pastilla, `TC-012`) |
| `title` de la camiseta (`index.html:5416-5419`) | Sí, tres menciones | ✓ `FR-056` nombra las tres |
| "se puede intercambiar pero queda fuera de puesto" (`5422`), rojo del candidato, cuenta de la pestaña | Sí | No aplica: sólo existen con `esFilaEditable`, o sea `admin` |
| «!» de la pestaña, su `title` y el nombre accesible (`index.html:5801-5806`) | Sí | ✓ `FR-055` |
| Número de la camiseta con "Suma su puntaje de…" (`5433-5436`) | Sí | No aplica: guarda `admin` |
| Avisos emergentes (`6016-6022`) | Sí | No aplica: el toque tiene guarda de rol (`index.html:5590`) y el arrastre sólo existe con `esFilaEditable` (`index.html:5468-5473`) |
| Fila de resultado, chips, filas de detalle, textos del pie | No | — |
| Lista de convocados (`7950`, `7963`) | **Sí: puesto principal** | **No — hallazgo 2** |
| Listado de jugadores (`3031`, `3055`) | **Sí: principal y secundarios** | **No — hallazgo 2** |
| Buscador para convocar (`8054-8055`, `8112-8113`) | Sí: puesto principal | No; sin verificar cuándo lo ve `jugador` |

### Punto 3 — filas nuevas de la declaración de reemplazo

| Fila | ¿El requisito dice lo que la Spec afirma? | ¿Nota recíproca? |
|---|---|---|
| Tabla 1 · `POSICIONES` `FR-025` | ✓ define «2º» y «!» | ✓ línea 433, cita `FR-053` y `FR-054` |
| Tabla 1 · `POSICIONES` `FR-025b` | ✓ «!» de la pestaña y cantidad en el nombre accesible | ✓ línea 439, cita `FR-055` |
| Tabla 1 · `CANCHA` `FR-023b` | ✓ "lo declarará explícitamente en el `title`" | ✓ línea 350, cita `FR-056` |
| Tabla 2 · `PANEL` `FR-037` | ✓ aspecto de la píldora excedida | ✓ línea 541 |
| Tabla 2 · `PANEL` `FR-070` | ✓ recalcula la diferencia de la píldora | ✓ línea 597 |
| Tabla 2 · `PANEL` `FR-070b` | ✓ total del encabezado y de la fila de resultado | ✓ línea 604, también para `jugador` |
| Tabla 2 · `PANEL` `FR-071` | ✓ diferencia por línea | ✓ línea 611 |
| Tabla 2 · `PANEL` `FR-074` | ✓ cuenta de titulares sin puntaje del receipt | ✓ línea 651 |

Las tres specs tienen además su fila de Change log del 2026-11-20 ampliada. Faltantes: `FR-076` y `FR-077` de `DESGLOSE_POSICIONES_SPEC.md` (hallazgo 3).

### Punto 4 — citas agregadas desde la primera crítica

`git diff e77e06d HEAD -- index.html tests/` está vacío: las líneas de la rama son las del commit que la Spec cita.

| Cita | ¿Dice lo que la Spec afirma? |
|---|---|
| `index.html:8775-8786` (cierre de sesión sin recarga) | ✓ rama sin usuario; `clearRenderedState()` en 8785 |
| `index.html:8423-8446` (`clearRenderedState`) | ✓ reinicia `currentMatchId`, `resultadoDraft`, `editandoResultadoFinalizado` |
| `index.html:7145-7149` (sin titulares) | ✓ combo y "Sin titulares" |
| `index.html:7151-7176` (con titulares, sin equipos) | ✓ "Generar equipos" sólo `admin`, aviso de bloqueo |
| `index.html:6016-6022` (`textoAvisoIntercambio`) | ✓ existe; **contiene tres avisos, no sólo rechazos** (hallazgo 1) |
| `index.html:5766-5768` (repinta al cruzar el ancho) | ✓ |
| `index.html:498` (margen de 12 px del `h4`) | ✓ `margin: 0 0 12px` |
| `index.html:2514` (el puesto asignado queda en el documento público) | ✓ es el comentario que lo declara, sobre `CAMPOS_EQUIPOS_ARMADO` |
| `index.html:7239-7247` (encabezado vacío de `jugador`) | ✓ 7241 y 7244 pasan `''` |
| `index.html:5874-5878` (el arrastre nativo no se puede sintetizar) | ✓ |
| `tests/layout.test.js:1539` (escenario `partido-finalizado`, `admin`) | ✓ |
| `tests/layout.test.js:1602-1606` (los dos puntajes a 1200 px) | ✓ |
| `tests/layout.test.js:2961` (único escenario `jugador` de finalizado) | ✓ `partido-jugador` |
| `tests/fixtures-app.js:501` (`signOut` no hace nada) | ✓ |

### Punto 5 — cobertura de los requisitos partidos y nuevos

| Requisito | Lo ejercita |
|---|---|
| `FR-016` (equipo visible) | `S-04d` |
| `FR-016b` (selección) | `S-06b` |
| `FR-016c` (tipo de evento) | `S-04d` |
| `FR-016d` (scroll) | `S-04d` |
| `FR-043` (repinta respetando §7.3) | `S-04`, `S-07`, `S-05b`, `S-07a` |
| `FR-043b` (conserva "oculto") | `S-04` y `S-07` ("el estado sigue en 'oculto'") |
| `FR-044` | `S-07e` — **mal descrita, hallazgo 1** |
| `FR-053`, `FR-054` | `S-09`, `S-09d` |
| `FR-055` | `S-09f` |
| `FR-056` | `S-09e` — dos de tres menciones, hallazgo 5 |

Tags de `S-05d`, `S-07e`, `S-09e`, `S-09f`: hallazgo 8.

## Lo que revisé y no tiene hallazgo

- Diagrama de `S-05`: lo rendericé con `mermaid-cli` y abrí la imagen. Tres estados, ocho transiciones, todos los rótulos legibles y sin superposición. Sólo el texto de un rótulo quedó viejo (hallazgo 4).
- `FR-061` queda como lápida ("Sin efecto desde el 2026-11-20"), sin reusar el número: correcto para IDs estables.
- `D-07` enmendada se propaga completa: §3.3, `TC-013`, `US-07`, `FR-053` a `FR-056`, `AC-02`, `S-09`, ruling de `CWE-200`.
- `NFR-003` reescrito: en cada combinación que nombra, el código actual produce el caso que el arreglo debe eliminar (encabezado vacío en una columna), así que el escenario se puede ver fallar (`TC-030`).
- `TC-012` vale también para lo que se le quita a `jugador`: ausente del documento, no escondido.

## Summary

- Blocking: 0
- Should fix: 4 (2 accuracy, 1 consistency, 1 clarity)
- Suggestions: 4
- Methodology-invariants violated: ninguna bloqueante; `MD-22` tocada por el hallazgo 8, `MD-03` por el 7, y la obligación de declaración de reemplazo de `AGENTS.md` por el 3

**Límites de esta crítica:** no corrí ningún test ni abrí la aplicación en un navegador; todo lo dicho sobre la pantalla sale de leer `index.html`. No verifiqué en qué estados del partido `jugador` ve el buscador para convocar. No volví a leer la página del CWE Top 25 ni revisé `Roadmap.md`: no cambiaron desde la primera crítica. El barrido de `docs/` buscó las marcas por texto («2º», "fuera de puesto", "posición secundaria", "su puesto es" y las clases CSS); un requisito que las describa con otras palabras se me pudo escapar.
