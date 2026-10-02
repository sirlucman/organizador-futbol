# Critique — ORDEN_POR_COLUMNAS_CONCEPT.md (per-doc)

> **Critic model:** `claude-sonnet-5-5`. Es el identificador que informa el entorno de esta sesión; el pedido indicaba confirmarlo con `/model` y esta sesión no puede ejecutar ese comando, así que el propietario debe contrastarlo con lo que muestre su `/model`.
> **Author model:** `claude-opus-5-5` (Change log §18 del documento, las siete filas).
> **Independence gate (Step 7.0):** familias distintas dentro del mismo proveedor (Opus → Sonnet). Nivel intermedio aceptable según el rubric: comparten proveedor y posiblemente parte del sesgo de entrenamiento, así que no equivale a una crítica de otro proveedor.
> **Date:** 2026-10-02
> **Mode:** per-doc (un solo documento; no se corrió la mitad cross-doc del rubric)
> **Inputs:** `docs/orden-por-columnas/ORDEN_POR_COLUMNAS_CONCEPT.md`. Contexto leído completo: `AGENTS.md`, `docs/orden-jugadores/ORDEN_JUGADORES_SPEC.md`, `docs/rol-en-el-token/contracts/firestore-rules.md`. También se consultaron `Roadmap.md`, `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md`, `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT.md`, `tests/reglas.test.js`, `tests/sesion.test.js`, el componente `DataTable.jsx` del design system y `index.html` en cada línea que el documento cita.
> **Alcance de este reporte:** sólo lectura. No se editó el Concept Note ni se hizo commit.

## Verdict

**CHANGES REQUESTED** — 2 hallazgos 🔴, 8 🟡 y 6 🔵.

El documento está bien construido: las referencias a `index.html` verifican casi todas, el diagrama renderiza y se lee, y la postura de seguridad cubre lo esencial de lo pedido (un `jugador` no gana escritura sobre `data/players`). Los dos bloqueos son de **consistencia con el resto del repo** y de **una consecuencia de D-04 que no está declarada**: (1) la lista de lo que esta feature reemplaza en `ORDEN_JUGADORES_SPEC.md` cubre sólo `FR-*` y deja afuera tres `TC-*` (uno de seguridad que D-04 invierte), tres supuestos, un non-goal y varios escenarios, lo que deja dos Specs vigentes contradiciéndose (regla de `AGENTS.md`); (2) D-04 hace inalcanzable el orden Manual previo de una cuenta y el documento afirma lo contrario. Como D-04 figura en "Settled (do not relitigate)" (§16), la Spec no tiene autoridad para corregirlo: hay que resolverlo en este documento.

*Self-equivalent caveat:* no aplica, las familias difieren. La brecha cross-provider sigue abierta.

---

## Findings

### Per-doc — Accuracy

#### 1. §6 "Roadmap.md: sin coincidencias" quedó desactualizado, y §14 habla en futuro de algo ya hecho

- **Dimension:** Accuracy
- **Where:** `ORDEN_POR_COLUMNAS_CONCEPT.md` §6 *Organisational context* (línea 186-190) y §14 (línea 441-443)
- **What:** §6 afirma que el Roadmap fue "buscado por 'orden', 'column' y 'sort': sin coincidencias". Hoy `Roadmap.md:58` coincide con esas búsquedas, y §14 dice que la idea de G E P "se agrega a Roadmap.md" cuando ya está agregada.
- **Why it matters:** es una afirmación verificable que ya no es cierta, y es la que AGENTS.md ("Obligaciones al especificar") exige hacer bien: nombrar la idea del Roadmap y retirarla. Un lector que repita la búsqueda la contradice.
- **Evidence:** `Roadmap.md:58`: "Ordenar el listado de Jugadores por la columna G E P … Quedó afuera de `docs/orden-por-columnas/` (§14)…". Entró en el mismo commit que el Concept Note (`4d801dc`, 2026-10-02). La búsqueda sin resultados fue cierta *antes* de ese commit.
- **Confidence:** High (verificado con `grep` y `git log -- Roadmap.md`)
- **Severity:** 🟡 Should fix
- **Suggested fix:** en §6, "No figuraba en Roadmap.md al empezar; la única coincidencia actual (`Roadmap.md:58`) es el diferido de G E P que esta misma feature agregó". En §14, pasar el verbo a pasado ("se agregó a Roadmap.md §3").

#### 2. Pain 3 subestima el alcance del orden compartido actual

- **Dimension:** Accuracy
- **Where:** §2 Pain 3 (línea 42-46)
- **What:** dice que el orden de un admin queda "para todos los demás admins". El valor compartido lo lee y aplica **cualquier** cuenta.
- **Why it matters:** menor, pero el problema real es más amplio de lo que se dice (también cambia lo que ve cada `jugador`).
- **Evidence:** `index.html:2127` (se lee para cualquier sesión), `index.html:2089` (`'playersSortMode'` está en la lista de lecturas de todos los roles), contrato `firestore-rules.md` §3: `jugador` tiene `R` sobre `data/playersSortMode`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "…para todos los demás: admins y jugadores".

#### 3. "Las reglas sólo pueden conceder escribirlo entero" se afirma plano; la evidencia existe pero no se cita

- **Dimension:** Accuracy
- **Where:** §5.2 *Lo que esta feature deliberadamente NO abre* (línea 123-129)
- **What:** la frase se apoya en el bloque `data/players` del contrato, que sólo muestra las condiciones `allow`, no la forma del dato. Lo que la sostiene es que el documento guarda un único campo `value` con todo el plantel serializado como texto.
- **Why it matters:** es la premisa de por qué el orden Manual no puede vivir en `data/players`. Una premisa de seguridad debería llevar su evidencia.
- **Evidence:** `index.html:2293`: `window.storage.set('players', JSON.stringify(publicPlayers), false)` y `index.html:1399`: `.set({ value })`. La premisa **es correcta** (verificada); es una inferencia razonable (las reglas no pueden mirar dentro de un texto), y debería rotularse como tal.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar a §5.2 y a §6.5 `index.html:1399, 2293` con la nota "el plantel es un único string en `{value}`; las reglas no pueden conceder escribir sólo un campo".

### Per-doc — Consistency

#### 4. 🔴 D-04: una vez elegida una columna, el orden Manual que la cuenta armó antes queda inalcanzable, y arrastrar lo destruye

- **Dimension:** Consistency (contradicción entre D-04, D-02, OPEN-Q-06/08 y §8.2)
- **Where:** D-04 y D-02 (§10, líneas 389 y 391); §8.1 "Manual es un estado, no una opción"; §8.2 "Preferencia de orden"; §5 Vision (párrafos 2 y 3); OPEN-Q-06 y OPEN-Q-08 (§15)
- **What:** con las reglas de D-04, el orden Manual sólo se entra arrastrando, y arrastrar *reemplaza* el Manual con la lista que se ve en ese momento. Entonces la cuenta que armó a mano su orden, toca "Goles" y quiere volver a su orden **no tiene forma de hacerlo**: ningún control ofrece Manual, y el único gesto que lo activa sobrescribe el orden que quería recuperar. Pierde ese Manual en el primer arrastre posterior a elegir una columna. El Manual guardado pasa a ser dato muerto desde la primera columna que se toca. Mientras tanto, otros pasajes dicen lo contrario:
  - D-02 (rationale): "Volver a Manual no depende de ningún control: se hace arrastrando (D-04)".
  - D-04 (rationale): "Elimina además la necesidad de un camino de vuelta a Manual".
  - OPEN-Q-06 (resuelta): "Manual no se elige; se entra arrastrando".
  - OPEN-Q-08 (resuelta): el `jugador` "vuelve a Manual igual que un admin" — vuelve a *un* Manual, no al suyo anterior.
  - §8.2 guarda, en el mismo documento, "el criterio y el sentido elegidos, **y** el orden Manual propio", lo que sugiere que el Manual sobrevive a elegir una columna. Pero ningún camino de interfaz lo recupera.
- **Why it matters:**
  - La cuenta pierde silenciosamente trabajo manual (hasta ~500 posiciones) por un gesto de consulta.
  - La Spec 001-era sí tenía el camino: `S-04a` de `ORDEN_JUGADORES_SPEC.md` "vuelve a seleccionar Manual → el listado muestra el último orden manual guardado". D-04 elimina esa garantía y el documento no lo declara como pérdida.
  - D-04 es *Hard* (irreversible) y está en "Settled" (§16): la Spec lo hereda sin poder corregirlo.
  - No hay alternativa documentada cercana (§9 sólo tiene F, el Manual compartido). La obvia es: **Manual propio de la cuenta como estado seleccionable**, además de la entrada por arrastre.
- **Evidence:** D-04: "Al soltar, la lista que ve, con la fila movida, pasa a ser su orden Manual, y su preferencia pasa a Manual". D-01/§8.1: "Ninguno de los dos ofrece Manual". `ORDEN_JUGADORES_SPEC.md` línea 600 (`S-04a`). §5 Vision: el admin "arrastra a un jugador dos lugares más arriba … ese orden — el de goles con el jugador movido — queda como **su** orden Manual".
- **Confidence:** High en la lectura del texto. Medium en que sea un defecto y no una consecuencia buscada: §17 registra que el propietario pidió "ordeno por goles ascendentes y luego uso drag and drop para intercambiar dos filas", lo que sugiere que *quiere* que arrastrar parta de la lista ordenada. Esa intención es compatible con las dos lecturas (con o sin el camino de vuelta). Lo que no está decidido es qué pasa con el Manual anterior.
- **Severity:** 🔴 Blocking
- **Suggested fix:** declarar explícitamente la consecuencia y decidirla antes de pasar a la Spec. Opciones, para que elija el propietario: (a) aceptar la pérdida y declararla en D-04, en R-nueva y en §5 (con una frase como "arrastrar desde una columna reemplaza tu Manual anterior, sin deshacer"); (b) guardar dos cosas separadas, el Manual propio y la lista "snapshot" nueva, y dar un camino de vuelta (p. ej. un tercer estado en el título activo, o una opción "Mi orden" en el menú); (c) arrastrar edita el Manual guardado (insertando la fila movida en la posición correspondiente) en vez de reemplazarlo con la lista ordenada. Corregir además las frases de D-02, D-04 y OPEN-Q-06 que hoy dicen que no hace falta camino de vuelta.

#### 5. D-04 está "settled" pero su redacción prejuzga tres preguntas abiertas

- **Dimension:** Consistency
- **Where:** D-04 (línea 391), §1 (línea 22-25), §8.1 (línea 299-304), §16 (línea 463-466)
- **What:** D-04, §1 y §8.1 dicen que al soltar "la lista que **esa cuenta ve**, con la fila movida, pasa a ser su orden Manual". Con búsqueda o filtro activo, "la lista que ve" es un subconjunto; tomada literalmente, los jugadores ocultos desaparecerían del Manual. `OPEN-Q-09` pregunta justamente eso, pero D-04 ya fijó una redacción que responde "los ocultos se pierden". Lo mismo ocurre con `OPEN-Q-10` y `OPEN-Q-11` (de dónde parte el Manual, dónde entra un jugador nuevo), que están abiertas pero D-04 ya describe el estado inicial.
- **Why it matters:** §16 prohíbe relitigar D-04 y a la vez manda a la Spec a decidir tres preguntas que cambian lo que D-04 dice. La Spec queda atrapada entre ambas.
- **Evidence:** D-04 vs OPEN-Q-09 (línea 457): "¿dónde quedan, en su orden Manual, los jugadores que no se ven?".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** reformular D-04 sin la frase "la lista que ve": "al soltar, el orden completo de la lista, con la fila movida, …" y mover el detalle del subconjunto filtrado a OPEN-Q-09. En §16 aclarar que la Spec puede ajustar la redacción de D-04 donde OPEN-Q-09/10/11 lo requieran sin que eso cuente como relitigar la decisión.

#### 6. "Un documento" vs "un documento por cuenta" — dos modelos de seguridad distintos con el mismo nombre

- **Dimension:** Consistency
- **Where:** §1 ("un documento y una regla de Firestore nuevos"), D-03 ("un documento que sólo esa cuenta lee y escribe"), R1, §6 último bullet ("aparece un documento por cuenta"), §8.2 ("Una por cuenta"), OPEN-Q-05 (Target: Plan)
- **What:** las menciones alternan entre un documento (singular) y uno por cuenta. Son modelos distintos: un documento compartido con un mapa `uid → preferencia` **no puede** protegerse cuenta por cuenta con reglas de forma razonable; uno por cuenta sí (`request.auth.uid == uid`). La respuesta a "dónde vive" decide la postura de seguridad, pero `OPEN-Q-05` la manda al Plan.
- **Why it matters:** según el rubric (invariantes de Spec, `MD-11`) esa respuesta es un *mandato de espacio de soluciones* — un `TC-*` en la Spec §4.5 —, no una decisión de implementación. Dejarla al Plan permite elegir un diseño que el §5.2 no puede sostener.
- **Evidence:** D-03 y §6 línea 183-184 ("aparece un documento por cuenta"); OPEN-Q-05 "Plan"; §16 línea 466 "OPEN-Q-05 pasa al Plan".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** fijar en el Concept (o pasar a "Decide in Spec") que la preferencia es **un documento por cuenta, direccionado por el uid de Firebase Auth**. Dejar al Plan sólo el cómo entra en `window.storage`.

#### 7. §9.7: la columna B no coincide con la descripción de B; falta F

- **Dimension:** Consistency
- **Where:** §9.2 y §9.7 (línea 330-337 y 374-382)
- **What:** la tabla da a B "Orden por persona: Sí / Sigue entre dispositivos: Sí / Cambia reglas de Firestore: Sí", pero §9.2 describe B como "agregar las opciones nuevas al selector actual", sin tocar la persistencia compartida (eso es C). La tabla tampoco incluye F (§9.6).
- **Why it matters:** la tabla de comparación es lo que un lector usa para entender por qué se eligió A; hoy B y A sólo difieren en los títulos, y B y C quedan confusamente parecidos.
- **Evidence:** §9.2 *Description*; §9.7 columnas A–E.
- **Confidence:** Medium (se puede leer B como "menú ampliado + preferencia por cuenta", pero §9.2 no lo dice)
- **Severity:** 🟡 Should fix
- **Suggested fix:** aclarar en §9.2 qué persistencia asume B, o corregir la columna; sumar F (y la alternativa del hallazgo 4 si se agrega).

#### 8. "Seis columnas que la pantalla ya muestra" vs siete columnas de datos, y "cualquier cuenta … seis" vs cinco para `jugador`

- **Dimension:** Consistency
- **Where:** §1 (línea 13-15), §3 primer bullet (línea 56-57), D-01, D-07, §14
- **What:** la pantalla muestra siete columnas de datos (Pos, Jugador, PJ, G E P, Goles, Asist, Pts); seis son ordenables y G E P queda diferida en §14. Además §3 promete a "cualquier cuenta" las seis, y D-07/§4 dicen que `jugador` tiene cinco.
- **Evidence:** `index.html:2673-2679` (cabeceras), §14.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "las seis columnas ordenables de las siete que muestra la pantalla"; en §3 "por toda columna que tiene permiso de ver".

#### 9. El selector no tiene opción para "Manual", y el documento no dice qué muestra en ese estado

- **Dimension:** Consistency
- **Where:** D-01, D-02, §8.1
- **What:** si Manual no es una opción, un `<select>` con el estado Manual necesita mostrar algo (placeholder, valor vacío, etiqueta). Es consecuencia directa de D-04/D-02 y no figura entre las preguntas abiertas.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar una pregunta abierta para la Spec o fijarlo en §8.1.

#### 10. FR-053 queda "conservado" para el arrastre, mientras OPEN-Q-07 lo deja abierto para el resto

- **Dimension:** Consistency
- **Where:** §6 bullet `FR-053` (línea 176-177) vs OPEN-Q-07 y R4
- **What:** por D-04 el arrastre *es* una escritura de preferencia. §6 decide que su falla avisa y revierte; OPEN-Q-07 pregunta si avisar cuando falla guardar la preferencia. Quedan dos reglas para el mismo mecanismo.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** unificar: OPEN-Q-07 pregunta sólo por el cambio de columna, y dice que el arrastre ya avisa.

### Per-doc — Completeness

#### 11. 🔴 §6 declara el reemplazo sólo de `FR-*`; dejan de ser ciertos tres `TC-*`, tres supuestos, un non-goal, historias y escenarios de la Spec vigente

- **Dimension:** Completeness / Methodology-invariants (`AGENTS.md` → "Cuando un documento nuevo modifica comportamiento ya descripto en un spec existente, DEBE declararlo explícitamente: qué spec y qué parte reemplaza… Sin esa declaración, dos specs vigentes se contradicen")
- **Where:** §6 *Related work* (línea 158-185) y §16 *Reemplazo obligatorio* (línea 467-469)
- **What:** la lista verifica bien en lo que cubre: `FR-001/002/003`, `010/011/012/013`, `020–022`, `030–031`, `050–053`, `060–061`, y la conservación de `FR-040`/`FR-041`/§7.8 son correctos. Pero **faltan** estas piezas de `ORDEN_JUGADORES_SPEC.md`, que D-03/D-04/D-07 vuelven falsas:

| Pieza de la Spec vigente | Línea | Por qué queda contradicha |
|---|---|---|
| **TC-040** (seguridad, "Defends CWE-862") | 186-198 | Exige que **toda** ruta de mutación del orden esté "gated by `isAdmin()`" y "no new, ungated write path". D-04 hace lo opuesto para `jugador`. Es una restricción de seguridad invertida, y la Spec nueva tiene que decir con qué la reemplaza (la protección pasa a las reglas por uid, no al `isAdmin()` del cliente). |
| **TC-030** | 158-162 | Todo handler de arrastre y de cambio de orden lleva `if(!isAdmin()) return;`. D-04 lo contradice. Los comentarios `// TC-040` en `index.html:2755` y `2761` son el rastro en el código. |
| **TC-013** | 133-138 | `playersSortMode` en un documento legible por toda sesión, "FR-052 requires every viewer to know the globally active mode". El valor global deja de gobernar la vista. |
| **TC-031** | 163-168 | Migración de `orden`: depende de `OPEN-Q-04`. Mencionarla junto con `FR-060`. |
| **§3.2, non-goal "per-user ordering preferences"** | 94-96 | Dice textualmente "The system shall not introduce per-user … ordering preferences". Esta feature es exactamente eso. |
| **A-02, A-03, A-04** | 808-821 | A-02: arrastre sólo en Manual. A-03: orden compartido, "not per-admin local". A-04: arrastre y Puntaje sólo admin. |
| **US-01, US-04, US-05** | 260, 263, 264 | US-04: "mismo orden para todos los admins". US-05: el `jugador` y el modo global de puntaje. Sin objeto. |
| **S-01** (admin, persistido compartido), **S-01d** (dos admins, last-write-wins sobre `players`), **S-04**, **S-05**, **S-05a** (`isAdmin()` rechaza el drop) | 548-562, 591-612 | Describen el modelo compartido y el gate de admin. `S-05a` es el escenario que prueba `TC-040`. |
| **NFR-006 / A-05 / §3.2 "keyboard"** | 85-88, 538, 822 | La limitación de accesibilidad aceptada para arrastre, que ahora condiciona *toda* entrada a Manual (ver hallazgo 13). |
| **AC-16, AC-20** | 719-725, 728-730 | Verifican `TC-040` y `S-05a`. |
| **§10.1** (entidades `orden` y `playersSortMode`), **§6 Glosario** ("Modo de orden", "Orden manual") | 671-675, 271-274 | Redefinidos. |

- **Why it matters:** la regla de `AGENTS.md` existe para evitar exactamente esto. El caso más serio es `TC-040`: es la única restricción de seguridad del orden vigente y D-04 la invierte sin decirlo; un lector de la Spec vieja concluye que abrir el arrastre a `jugador` es una violación. Además §5.2 cita las categorías de CWE a tratar y no menciona que el control (el `isAdmin()` del cliente) cambia de lugar.
- **Evidence:** líneas de `ORDEN_JUGADORES_SPEC.md` en la tabla (todas verificadas por lectura). §6 sólo enumera `FR-*`.
- **Confidence:** High
- **Severity:** 🔴 Blocking
- **Suggested fix:** ampliar §6 y el "Reemplazo obligatorio" de §16 con una tabla *pieza → qué la reemplaza* que cubra al menos las filas de arriba. Para `TC-040`, declarar explícitamente que la autorización del orden por cuenta pasa del `isAdmin()` del cliente a una regla de Firestore por uid, y que el `isAdmin()` sigue gobernando `data/players`. Agregar a la lista de la Spec la marca de "reemplazado" en cada pieza, en la misma rama (ya lo exige §16).

#### 12. Consecuencias de D-04 sin declarar: arrastre accidental irreversible y arrastre sin teclado en un estado que ahora sólo se alcanza arrastrando

- **Dimension:** Completeness
- **Where:** §11 Risks (R1–R7), §4 Non-goals, §6.5 *Industry-standard evidence*
- **What:** el pedido fue revisar si las consecuencias de D-04 están todas declaradas. Lo declarado es correcto y suficiente en su lugar: `OPEN-Q-09` (filtro + arrastre), `OPEN-Q-10` (Manual inicial), `OPEN-Q-11` (jugador nuevo), `R6` (abrir `data/players`, excluido por D-04) y `R7` (Manual desactualizado). Además, que se pierde el Manual *compartido* sí está declarado (§1, D-04 "Hard", Alternativa F). Faltan:
  1. **Arrastre accidental sin deshacer ni confirmación.** Antes el arrastre sólo existía dentro del modo Manual (`index.html:2666`: `puedeArrastrar = isAdmin() && effectiveSortMode() === 'manual'`), un modo elegido a propósito. Con D-04 toda fila de toda cuenta es arrastrable siempre, y un solo soltado descarta el orden por columna elegido (y, según el hallazgo 4, el Manual anterior). No hay riesgo `R-` para eso, ni mitigación (confirmación, deshacer).
  2. **Táctil y teclado.** El arrastre HTML5 nativo tiene límites en pantalla táctil (el Spec vigente lo registra como riesgo, líneas 843-844, y como limitación aceptada A-05/NFR-006). Con D-04 pasa a ser la **única** entrada a Manual y se extiende a las cuentas `jugador`, que mayoritariamente miran desde el teléfono, donde (abajo de 760px) además no hay encabezado. AGENTS.md pide "usable desde mobile" y §6.5 invoca WCAG 2.1 AA para los títulos, pero el mismo documento deja un estado entero sólo alcanzable arrastrando, sin alternativa de teclado (criterio 2.1.1 *Keyboard*, de memoria; no se consultó en vivo). No figura en R, en non-goals ni en preguntas abiertas.
  3. **Dos dispositivos de una misma cuenta:** gana la última escritura, y se reescribe la lista entera. Bajo (🔵), pero es un caso nuevo que con el modelo compartido no existía en esta forma.
- **Why it matters:** son los efectos directos de "cualquier cuenta arrastra siempre" y deberían estar al lado de R6/R7 para que la Spec los trate.
- **Evidence:** `index.html:2666`, `2754-2761`; `ORDEN_JUGADORES_SPEC.md:843-844, 538, 822`.
- **Confidence:** High en 1 y 2 (el texto lo deja sin cubrir). Medium en la gravedad del 2 (no se midió el comportamiento táctil real; `[UNVERIFIED]`).
- **Severity:** 🟡 Should fix
- **Suggested fix:** sumar R8 (arrastre accidental, mitigación candidata: deshacer o aviso con "deshacer" en el toast) y R9 (entrada sólo-arrastre en táctil/teclado); decidir si la accesibilidad por teclado del orden Manual es un non-goal explícito (como hoy, A-05) o un requisito, y ponerlo en §4 o en una pregunta abierta para la Spec.

#### 13. §5.2: cubre la preocupación principal, pero omite cuatro puntos que dependen de cómo se escriba la regla

- **Dimension:** Completeness (`MD-31`)
- **Where:** §5.2 (línea 114-141), R1
- **What:** **Lo que sí cumple** (verificado contra el contrato): que un `jugador` no gane escritura sobre `data/players` está dicho en §5.2, en D-04, en R6 y en R1; el contrato confirma que ese documento hoy sólo lo escribe `admin` (`firestore-rules.md` §4, líneas 271-274) y la fila `data/players` de `tests/reglas.test.js` ya verifica que `jugador` no escribe (`jugador: 'R'`). El texto de las reglas vivas no se tocaría. Faltan:
  1. **Forma de la regla.** Para que "sólo esa cuenta" sea cierto la regla tiene que atar el documento al `uid` del token. Si en cambio se resolviera con una regla comodín dentro de `data/` (porque `window.storage` solo escribe en esa colección, `index.html:1388-1399`), se rompería el Hallazgo B del contrato ("no hay ninguna regla catch-all", y su propio aviso sobre "el bloque que tiene la ruta con comodín"). §5.2 no fija ninguna de las dos cosas.
  2. **Cuentas sin claim `rol`.** El contrato (§3, "Cuenta sin claim") explica que hoy una cuenta sin `rol` pierde las escrituras que exigen rol. §5.2 no dice si la regla nueva exige un rol reconocido o sólo el `uid`. Es la misma decisión de fail-closed de `rol-en-el-token`.
  3. **Sensibilidad del dato.** §5.2 dice "Data sensitivity — ninguna regulada" y que Pts sigue sólo-admin. Pero por D-04 el Manual de un admin se arma a partir de "la lista que ve": si ordenó por Pts y arrastra, **el ranking de puntajes queda codificado en el orden guardado**. No son puntajes, pero sí información derivada de ellos. Ese documento debe ser legible sólo por su dueño (la lectura ajena es una exigencia de confidencialidad, no sólo de higiene); el texto lo menciona como categoría de autorización pero no lo vincula con esto.
  4. **Tope de tamaño.** §5.2 reconoce que la cuenta puede escribir cualquier valor, pero sólo concluye "tratar lo leído como no confiable". Una cuenta puede inflar su propio documento (hasta el máximo de Firestore) y alargarse a sí misma el arranque; el daño queda en esa cuenta, y conviene decirlo.
- **Why it matters:** son los lugares donde esta feature puede salir insegura sin que nadie viole una línea del documento.
- **Evidence:** contrato §2.3 (hallazgo B), §3 (cuenta sin claim), §4; `index.html:1388-1399` (`window.storage` sólo opera sobre `data`).
- **Confidence:** High (1, 2), Medium (3, 4: son consecuencias deducidas, no leídas)
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar a §5.2 cuatro renglones: el documento se direcciona por `uid` y no hay regla comodín; decisión sobre cuenta sin claim; el Manual puede codificar el orden por Pts, por lo que la lectura es sólo del dueño; el daño de un valor inflado se limita a la propia cuenta. Que la Spec §4.5 los convierta en `TC-*`.

#### 14. Los tres marcadores `[UNVERIFIED]` no figuran en el Handoff

- **Dimension:** Completeness (`MD-26`)
- **Where:** §5.2 (línea 140-141), §6.5 *Prior-art* (línea 250-251), §7.1 (línea 260); §16
- **What:** las tres razones son legítimas (la del CWE es diferimiento deliberado a la Spec según `MD-31`; las otras dos declaran que es conocimiento general). Pero el rubric exige citarlas en el slot de Handoff para que la etapa siguiente herede la deuda de verificación, y §16 no las menciona.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** en §16, una línea "Deuda de verificación heredada: CWE Top 25 (§5.2), patrón universal de tablas ordenables (§6.5, §7.1)".

#### 15. La señal de éxito del arranque no tiene número

- **Dimension:** Completeness / Clarity
- **Where:** §12 último bullet (línea 419), R3 (línea 404)
- **What:** "el arranque no se alarga de forma perceptible" es un adjetivo. El mismo documento tiene la línea de base (~620 ms de mediana, `Roadmap.md:72`) pero no fija un umbral.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** p. ej. "la mediana medida con `tools/medir-arranque.js` no sube más de N ms respecto de la de antes" (N lo decide el propietario).

### Per-doc — Clarity

#### 16. D-08 y la "lista visible" vs D-04 (ver hallazgo 5) y una frase ambigua en D-07

- **Dimension:** Clarity
- **Where:** D-07 (línea 394)
- **What:** "esa cuenta ve Manual, sin error y sin modificar lo guardado" mezcla dos casos con consecuencias distintas: preferencia = Pts en una cuenta que dejó de ser admin, y valor desconocido/corrupto. El primero es un cambio de rol; el segundo una escritura anómala. Con el modelo por cuenta, además, el primero ya es raro (antes ocurría cuando el valor *global* lo ponía un admin).
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** separar los dos casos en D-07 o aclarar que el primero sólo aparece al bajar de rol a una cuenta.

### Per-doc — Methodology-invariants

Chequeo por invariante (los hallazgos 4, 11 y 14 ya cubren las violaciones; no se repiten):

| Invariante | Resultado |
|---|---|
| §3 Goals vs §4 Non-goals disjuntos | ✓ |
| §4 vs §14 distintos | ✓ |
| §9 Alternativas con motivo de rechazo | ✓ (aunque el motivo de B–E es "el propietario eligió"; ver hallazgo 4 por una alternativa que falta) |
| §10 Decisiones con ID y reversibilidad | ✓ D-01…D-09 |
| IDs estables, sin duplicados, `OPEN-Q-NN` con dos dígitos | ✓. D-01…D-09, OPEN-Q-01…11, R1…R7 sin repeticiones ni saltos |
| Referencias internas resueltas | ✓ todas las `D-NN`, `OPEN-Q-NN`, `R*` citadas existen |
| §5 Vision (un párrafo, valor de usuario) | ⚠ son cinco párrafos de escenario; el rubric pide un párrafo. Como escenario narrativo funciona; 🔵 si se quiere seguir el rubric al pie de la letra |
| §5.1 diagrama de contexto | ✓ **Renderizado con `mermaid-cli` y mirado el PNG**: 5 nodos, rótulos legibles y sin superposición. Ver nota en "Verificaciones" |
| §5.2 *Security posture* presente | ✓ (los gaps están en el hallazgo 13) |
| §6.5 con las tres sub-listas | ✓ todas pobladas, con nota de "qué fijó" por cita |
| §16 Handoff con IDs concretos | ✓ (con la salvedad del hallazgo 14) |
| Separación de tres documentos (`MD-01`) | 🔵 el Concept baja bastante a nivel Spec: §8.1 describe comportamiento detallado ("sin error visible y sin pisar lo guardado"), D-09 fija textos de interfaz, R1 nombra archivos de test. D-09 es decisión explícita del propietario, así que aceptable; el resto puede quedar para la Spec sin pérdida |
| Change log con modelo autor | ✓ las siete filas llevan `(claude-opus-5-5)`; todas con `Self-critique: skipped` |

---

## Verificaciones

### Referencias a `index.html` y a otros archivos (cada una abierta, no dada por buena)

| Cita del documento | Resultado |
|---|---|
| `index.html:1597` `ORDEN_MODOS` | ✓ cinco modos |
| `index.html:2625` selector | ✓ (`ORDEN_MODO_LABELS`) |
| `index.html:2671-2680` fila de títulos, `aria-hidden` | ✓ |
| `index.html:2673` celda vacía de Posición | ✓ |
| `index.html:2678` "Asist." | ✓ única aparición en `index.html` (`tests/layout.test.js:2176` es otra cosa, una variable) |
| `index.html:2563` `alfabetico` apellido+nombre | ✓ |
| `index.html:1858` `fullName` nombre+apellido | ✓ |
| `index.html:2568-2571` `effectiveSortMode` | ✓ |
| `index.html:2575-2601` `sortRoster` | ✓ (la función termina en 2602; ±1) |
| `index.html:2622` `sortRoster(…, effectiveSortMode())` | ✓ |
| `index.html:2127` valida lo leído contra `ORDEN_MODOS` | ✓ |
| `index.html:2883-2887` selector escribe y traga el error | ✓ (`.catch(err => console.error(err))`: no se ve en pantalla, pero sí en consola; "silencio" es a nivel de usuario) |
| `index.html:2285` guarda el plantel en un solo bloque | ✓ (`savePlayers`; la evidencia es 2293, ver hallazgo 3) |
| `index.html:2088-2093` `iniciarLecturas` | ✓. **Observación:** la misma lista de documentos está repetida en `loadAll` (`index.html:2107`) y en `tests/sesion.test.js:264-271`; una lectura nueva tiene que sumarse en los tres sitios, y R3 sólo menciona uno |
| `index.html:2687-2703` jugador que nunca jugó | ✓ (`jugo = !!p.partidosJugados`) |
| `index.html:2683` `computeAvg` | ✓ |
| `index.html:223-233` fila de títulos sólo desde 760px | ✓ (`display:none` en 223; la media query abre en 226) |
| `index.html:227-231` columna Posición 34px, mono 10px mayúscula | ✓ (34px en 227 y 229; 10px y `text-transform: uppercase` en 231) |
| `index.html:209` badge 34px | ✓ |
| `index.html:1387-1403` `window.storage` | ✓ |
| `tests/reglas.test.js:286-295` tabla por documento | ✓ (`EQUIVALENCIA`) |
| `tests/sesion.test.js:264-271` | ✓ |
| `firestore-rules.md` §2.3 "Hallazgo C" y bloque `data/players` | ✓ (§4 líneas 271-274: `write` sólo `admin`) |
| `firestore-rules.md`, "línea 19" (reglas se publican a mano) | ✓ |
| `ROL_EN_EL_TOKEN_CONCEPT.md` `D-02` (cuenta ↔ jugador) | ✓ el claim lleva `rol` y `jugadorId`. La conclusión "preferencia de la cuenta = preferencia de la persona" es una inferencia correcta pero no está rotulada |
| `DESGLOSE_POSICIONES_SPEC.md` `FR-003`/`FR-032` | ✓ existen, y esa Spec ya declara su propio reemplazo parcial de `ORDEN_JUGADORES_SPEC.md` (`TC-012`, `FR-030`, `S-03`) |
| `Roadmap.md` §3, ~620 ms | ✓ (`Roadmap.md:72`) |
| `Roadmap.md` "Ranking de jugadores" | ✓ (`Roadmap.md:57`) |
| `Roadmap.md` "sin coincidencias" | ✗ ver hallazgo 1 |
| `DataTable.jsx` no ordena | ✓ sin ocurrencias de "sort" |
| Íconos Lucide vía `Icon` (`readme.md`, Iconografía) | ✓ sección existente; no se verificó el componente `Icon` |
| APG *Sortable Table* (botón en el título, `aria-sort` sólo en la columna ordenada) | ✓ consultado en vivo el 2026-10-02: "The header text of sortable columns is wrapped in a `button` element" y `aria-sort` "set on the currently sorted column … removed and set on the newly sorted column" |
| `FR-041` hoy deja a los ocultos en su orden relativo (OPEN-Q-09) | ✓ como texto de la Spec (`ORDEN_JUGADORES_SPEC.md:455-459`); el código (`index.html:2776-2782`) numera 0…k sólo a los visibles y deja a los ocultos con su `orden` previo, lo que respeta la letra de `FR-041` pero reubica el bloque visible antes que los ocultos. Aviso para la Spec: la línea base de OPEN-Q-09 es el texto, no el código |

### Lo que NO se verificó

- La mitad cross-doc del rubric (no existe Spec ni Plan de esta feature).
- Que el patrón "tocar título ordena / abajo del corte hay menú" sea el habitual en otros productos: el propio documento lo marca `[UNVERIFIED]` y no se contrastó.
- El comportamiento real del arrastre HTML5 en pantallas táctiles (hallazgo 12): se razonó desde la Spec vigente, no se probó en un dispositivo.
- El criterio WCAG 2.1.1 se citó de memoria, no se consultó la norma.
- Que "Pos" más la flecha entre en 34px (R2): el documento lo difiere al Plan, bien; no se midió.

---

## Summary

- Blocking: 2 (hallazgos 4 y 11)
- Should fix: 8 (hallazgos 1, 5, 6, 7, 12, 13, 14, 15)
- Suggestions: 6 (hallazgos 2, 3, 8, 9, 10, 16)
- Methodology-invariants violated: `AGENTS.md` regla de reemplazo explícito (hallazgo 11); `MD-26` (hallazgo 14, citación de `[UNVERIFIED]` en el Handoff); `MD-11`/`MD-31` en espíritu (hallazgos 6 y 13)

## Respuestas a los tres puntos que se pidió mirar con más atención

1. **D-04 — ¿están declaradas todas las consecuencias?** Las cinco declaradas (OPEN-Q-09, 10, 11, R6, R7) son reales y están bien planteadas. **No están todas.** Faltan: el Manual anterior queda inalcanzable y el arrastre lo destruye, contra lo que D-02/D-04 afirman (hallazgo 4, 🔴); la redacción "la lista que ve" prejuzga tres preguntas abiertas (hallazgo 5); el arrastre accidental sin deshacer y la entrada sólo-arrastre en táctil/teclado (hallazgo 12). R6 y R7 no necesitan cambios.
2. **§5.2 — ¿cubre lo que cambia, en especial que un `jugador` no gane escritura sobre `data/players`?** Sí en lo principal, y consta en cuatro lugares (§5.2, D-04, R6, R1), consistente con el contrato vigente. Los vacíos son de la regla *nueva* (direccionada por uid y sin comodín, cuenta sin claim, sensibilidad del Manual cuando sale de Pts, tope de tamaño): hallazgo 13. Aparte, la contraparte documental de ese cambio de postura (`TC-040`) no está en la lista de reemplazos: hallazgo 11.
3. **D-01 a D-09 — ¿se contradicen entre sí?** No hay contradicción lógica entre D-05, D-06, D-07, D-08 y D-09. Los roces están en torno a D-04: con D-02 y D-01 por el camino de vuelta a Manual (hallazgo 4), con D-08 por la "lista que ve" (hallazgo 5) y con D-03/§6/OPEN-Q-05 por "un documento" vs "uno por cuenta" (hallazgo 6). Las dos reescrituras de D-04 dejaron frases viejas vivas en D-02, en la resolución de OPEN-Q-06 y en el rationale de D-04 mismo.
