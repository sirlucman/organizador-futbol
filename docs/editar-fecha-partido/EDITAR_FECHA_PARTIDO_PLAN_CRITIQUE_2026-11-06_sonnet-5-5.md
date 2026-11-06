# Critique — EDITAR_FECHA_PARTIDO_IMPLEMENTATION_PLAN.md (per-doc + cross-doc Spec ↔ Plan)

> **Critic model:** claude-sonnet-5-5 (el ID que la sesión declara en su prompt de sistema; no se pudo invocar `/model` desde dentro de la sesión, así que no hay una segunda confirmación independiente de ese dato)
> **Author model:** claude-opus-5-5 (Change log del Plan, §17, filas 1 y 2)
> **Independencia (Step 7.0):** misma empresa, familia distinta (Opus → Sonnet). Se procede con la salvedad del rubric: un crítico del mismo proveedor atrapa la mayoría de los hallazgos de sesgo, pero puede compartir sesgos residuales de entrenamiento.
> **Date:** 2026-11-06
> **Commit de la corrida:** `git rev-parse --short HEAD` → `cbed6ae` (rama `docs/editar-fecha-partido`). `index.html` y `tests/` no tienen cambios sin commitear. El Plan (sin trackear) y la Concept Note y la Spec (modificadas, sin commitear) se leyeron tal como están en el árbol de trabajo.
> **Inputs:** `docs/editar-fecha-partido/EDITAR_FECHA_PARTIDO_IMPLEMENTATION_PLAN.md` · `…_SPEC.md` · `…_CONCEPT.md` (sólo para verificar los `D-*`)
> **Modo:** dos barridos en un mismo reporte, a pedido del owner (el rubric prefiere uno por pasada): (1) per-doc sobre el Plan, (2) cross-doc Spec ↔ Plan.
> **Alcance de sólo lectura:** no se editó el Plan, la Spec ni ningún otro archivo del repositorio. Los archivos temporales de la corrida (mutaciones de los gates, render de los diagramas) quedaron en el scratchpad de la sesión.

## Verdict

**COMMENT** — 0 🔴 Blocking, 11 🟡 Should-fix, 8 🔵 Suggestion.

El Plan está bien armado: los gates mecánicos corren y dan vacío (y probé que pueden fallar), las 40 entradas de escenario/variante, los 12 TC, los 4 NFR y los 24 AC de la Spec están cubiertos, y la mayoría de las citas de código dicen lo que el Plan dice. Los problemas son de otra clase: (a) **pasos que el Plan da por hechos** en los tests de pantalla (cómo se toma el "antes" de lo guardado, cómo se arma la segunda página de `jugador`); (b) **escenarios existentes que cambian con el botón y el Plan no nombra** (`colores-encabezado`, `modal-nuevo-partido`) y **ningún test que cree un partido válido** por la ventana compartida después de reescribirla; (c) **la garantía central de `TD-04`** ("no hay un camino que abra la ventana y se olvide una") **no se cumple como está escrita**, porque la variable que decide el modo la escriben los llamadores fuera de `abrirVentanaPartido`; (d) **dos gates del propio Plan que no pueden pasar o no dicen cómo correrse** (`T-1.D5`, `T-N.D18`). Ninguno bloquea el merge de la rama de documentos por sí solo; los de (a)–(c) conviene cerrarlos antes de implementar, porque son los que hacen que el código se escriba contra un Plan que no le alcanza.

*Salvedad:* crítico y autor son de familias distintas del mismo proveedor (ver cabecera). La severidad de los hallazgos 14 y 15 es un juicio mío: el rubric dice que una violación de invariante de metodología "casi siempre" es 🔴, y aquí las dejé en 🟡 porque los gates fallan **en voz alta** (no pasan en silencio) y el arreglo es de una línea. Si el owner lee el invariante "DoD verificable mecánicamente" de forma estricta, suben a 🔴.

---

## Corrida de los gates del Plan (salida pegada)

Los comandos se corrieron tal cual están escritos en el Plan (§7.2.9, líneas 242–256), con las rutas reemplazadas por variables de shell (`S`, `P`, `C` = Spec, Plan, Concept). `awk` de este equipo: `awk version 20200816` (soporta `{2,5}`).

| Gate | Salida | ¿Puede fallar? (mutación en el scratchpad) |
|---|---|---|
| `T-1.D8b` | vacío (rc=0). Reconoce 9 encabezados `Scenario S-NN` en la Spec | Sí: si se borra la línea `**Variants:**` de `S-04`, imprime `MISSING Variants block: #### Scenario S-04 — …` |
| `T-1.D10` | vacío. 12 TC en Spec §4, 12 en Plan §12 | Sí: al renombrar `TC-041` en el Plan imprime `TC-041` |
| `T-1.D10b` | vacío. 12 TC en Spec §11.3 (`### 11.3` en la línea 571) | — (misma forma que D10) |
| `T-1.D15` | `6` (≥ 1) | — |
| `T-1.D16` | vacío | Sí: al renombrar `NFR-004` imprime `NFR-004` |
| `T-1.D17` | vacío. Tareas citadas en §14: `T-2.12 T-2.5 T-2.6 T-2.8 T-2.D2` | Sí: al citar `T-9.9` imprime `T-9.9` |
| `T-1.D18` | **sin comando en el Plan.** Corrí el Pass 1 de `references/review-passes.md`: ver hallazgo 15 | — |
| `T-1.D18b` | vacío en los tres documentos | Sí: al duplicar una fila `TD-03` imprime `TD-03` |
| `T-1.D19` | vacío en `FR`, `NFR`, `TC`, `AC`, `S` y en `D` contra la Concept Note | Sí: al inventar `FR-999` y `S-99z` en el Plan imprime ambos |

Chequeos extra que hice sobre los mismos gates:

- `T-2.D8` (lado izquierdo): 40 IDs en Spec §9; `comm -3` entre esos 40 y las filas de Plan §12.1 da vacío. Las etiquetas `[boundary]/[failure]/[concurrency]/[property]` de §12.1 son idénticas a las de las variantes de la Spec (`diff` vacío). `T-2.D9`: `NFR-001`..`NFR-004`.
- Spec AC ↔ Plan §16: `comm -3` vacío (los 24 AC están, todos con columna `Test` llena).
- `T-1.D5` emulado con `grep` (el Plan todavía no está trackeado, `git grep` no lo vería): **3 coincidencias, todas en el propio Plan** (líneas 152, 238, 395). Ver hallazgo 14.
- Pass 1 sobre el Plan: ver hallazgo 15.
- Los dos diagramas Mermaid del Plan (§3 y §7.1) se renderizaron con `@mermaid-js/mermaid-cli` y se abrieron los PNG: renderizan sin error y se leen (`sequenceDiagram` de 9 mensajes; `flowchart` de 3 nodos). Ver hallazgo 11 por lo que *dicen*.
- `esFechaValida` de `TD-02`, escrita tal como la describe el Plan y corrida con `node` (no es la aplicación): rechaza `2026-02-30`, `15/11/2026`, `hola`, `''`, `20260-11-15`, `null`, `undefined`, `20261115`, `2026-13-01`, `2026-00-10`, `2025-02-29`, `2100-02-29`, `2026-04-31`, `2026-11-15\n`; acepta `2024-02-29`, `2026-11-15`, `0050-01-01`, `0000-01-01`. `Date.UTC(50,0,1)` da el año 1950, como dice el Plan. **El motivo de `TD-02` es correcto.**

Citas verificadas sin hallazgo (leí la línea en `cbed6ae`): `index.html` 107, 378, 393-395, 1213, 1323-1339, 1405-1426, 1962-1965, 2225-2229, 2475-2499 (`partidos` en 2492, `partidosArmado` en 2497), 7143, 7438-7442, 7449-7450, 7498, 7508, 7613-7629, 7621, 7648, 8114-8145; `tests/layout.test.js` 45 (17 anchos), 268-280, 472-482, 532, 2817, 3859-3868, 3891; `tests/fixtures-app.js` 453-457, 527 (export de `docsDesde`), 462-463 (`__ultimosDocs`); `tests/colores.test.js` 1-17; `tests/intercambio.test.js` 466-470; `Roadmap.md:70`; las marcas "Ampliado (2026-11-06)" en `001/spec.md:104` y `007/spec.md:109,147`; los tres `firestore-rules.md` que trae `git ls-files`. También comprobé, porque el cambio de ID del Plan lo afirma: no hay `Escape` ni clic afuera que cierre `#newMatchModal` (sólo 5 sitios lo tocan: 8126-8141), `.modal-overlay` pasa de `display:none` a `flex` sin transición (`index.html:1077-1078`), y los clics a `[aria-label="Editar resultado"]` de `tests/layout.test.js` (2756, 3132, 3147, 3180) usan coincidencia exacta de atributo, así que el nombre nuevo "Editar fecha" no los vuelve ambiguos. El único `@media` que toca `.detail-header` es el de 1099 px (393-395); los demás afectan otras cosas (cancha, roster, panel, tabs), y `ANCHOS` mide los dos lados de 1099/1100 y de 759/760.

---

# Barrido 1 — Per-doc (el Plan solo)

## Per-doc — Accuracy

### 1. `TD-01` atribuye la decisión de "sin flag" a `D-09`, que habla de otra cosa

- **Dimension:** Accuracy
- **Where:** `…_IMPLEMENTATION_PLAN.md` §3.1, `TD-01` (línea 82), columna *Spec ref*
- **What:** `TD-01` ("Sin feature flag…") cita `D-09` como su origen; `D-09` no dice nada de flags.
- **Why it matters:** rompe "cite, don't paraphrase": quien parta de `D-09` para entender por qué no hay flag no encuentra nada, y quien busque dónde se decidió "sin flag" no lo encuentra en ningún documento anterior.
- **Evidence:** Concept línea 314: *"D-09 | El cambio se guarda en el acto, igual que las demás ediciones del partido que hace el `admin`, y se repinta la pantalla…"*. `grep -in flag` sobre la Concept Note y sobre la Spec: **cero coincidencias**. El precedente que `TD-01` invoca, `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md:75`, cita sus propios `D-04, D-08`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** dejar *Spec ref* de `TD-01` en "— (convención del proyecto, `AGENTS.md` § Ramas y Simplicidad ante todo)". Es una decisión de Plan, no heredada.

### 2. §7.0 dice que el owner "confirmó" el modelo de ramas; la fuente dice que se resolvió "por evidencia"

- **Dimension:** Accuracy (invariante `MD-33`)
- **Where:** §7.0, línea 163
- **What:** el Plan afirma *"confirmado por el owner para este repositorio en OPEN-Q-05 de INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md (2026-09-29)"*; ese `OPEN-Q-05` se resolvió sin que el owner lo confirmara.
- **Why it matters:** el script de detección devuelve `requires_confirmation` cuando la base es `fallback`, y el rubric exige confirmar con el owner o dejar el modelo marcado como inferido. Citar una confirmación que no existió hace que el Plan parezca cumplir `MD-33` sin cumplirlo.
- **Evidence:** `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md:533`: *"**Sí, por evidencia.** El owner no conocía el nombre del modelo; `git log --merges main` muestra…"*. Corrí `detect-branching-model.sh` hoy: `suggested branching model: trunk-based (basis: fallback)` … `no answer → use 'trunk-based'… flagged as inferred-not-confirmed`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** reescribir la línea como "inferido, no confirmado (basis: fallback); precedente: `OPEN-Q-05` de `intercambiar-colores` se resolvió por evidencia del historial de merges, y `AGENTS.md` § Ramas coincide", o hacerle la pregunta al owner y registrar la respuesta.

### 3. Anclas de líneas de `tests/layout.test.js` desfasadas

- **Dimension:** Accuracy
- **Where:** §7.3.6, fila de `fecha-estados` y párrafo inicial
- **What:** tres rangos no coinciden con lo que hay en `cbed6ae`.
- **Why it matters:** las anclas son el mapa del agente que implemente; un desfase de dos líneas hace buscar de más, no rompe nada.
- **Evidence:** el Plan cita `cambiarDePartido` en `tests/layout.test.js:505-509`; la función está en 507-511 (`async function cambiarDePartido` en la línea 507). Cita `tocarCamiseta` en 500-504; ocupa 500-505. Cita `transformarDatos` en 3963-3966; el comentario es 3963-3965 y el uso real (`if (caso.transformarDatos) …`) es la línea 3967.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** corregir los tres rangos.

## Per-doc — Consistency

### 4. `TD-04` promete un "único lugar" para el modo, pero la variable del modo la escriben los llamadores

- **Dimension:** Consistency
- **Where:** §3.1 `TD-04` (línea 85) y `TD-05`/`TD-07`; §7.3.5 (filas de los listeners); §2 *Technical goal 2*
- **What:** `TD-04` dice que `abrirVentanaPartido` escribe "las cinco cosas que cambian entre modos: no hay un camino que abra la ventana y se olvide una". Pero la sexta cosa —`partidoEditandoFecha`, que es lo que decide si "Guardar" edita o **crea un partido**— no la escribe `abrirVentanaPartido`: la escribe quien la llama (`TD-07`: `partidoEditandoFecha = id` y *después* `abrirVentanaPartido({...})`; §7.3.5, listener de `#btnNuevoPartido`: `partidoEditandoFecha = null` y *después* `abrirVentanaPartido({...})`).
- **Why it matters:** es exactamente el riesgo que el Plan dice ser el principal (§1: "que 'Guardar' cree un partido"). Con la variable fuera del armado hay dos fuentes de verdad —lo que se ve (título, Cancha, texto del botón) y la variable— que pueden desincronizarse si un llamador futuro pasa `conCancha:false, boton:'Guardar'` y olvida la variable: la ventana *parece* de edición y "Guardar" **crea**. Hoy los dos llamadores reales la setean bien y `fecha-cancelar`/`fecha-doble-toque` lo detectarían, pero la garantía que `TD-04` y *Technical goal 2* anuncian ("no pueda dejar restos") no sale del diseño, sale de la disciplina de dos llamadores.
- **Evidence:** TD-04: *"Un solo lugar escribe las cinco cosas que cambian entre modos: no hay un camino que abra la ventana y se olvide una."*; TD-07: *"`partidoEditandoFecha = id`, `abrirVentanaPartido({ titulo: 'Editar fecha', conCancha: false, … })`"*; §7.3.5, fila `#btnNuevoPartido`: *"`partidoEditandoFecha = null`; … `abrirVentanaPartido({ titulo: 'Nuevo partido', conCancha: true, … })`"*.
- **Confidence:** High (sobre la inconsistencia); Medium (sobre que valga la pena rediseñar: es chico)
- **Severity:** 🟡 Should fix
- **Suggested fix:** que `abrirVentanaPartido` reciba `editandoId` (o `null`) y sea quien asigne `partidoEditandoFecha`; título, Cancha y botón se derivan de ese único argumento (`editandoId ? {…edición} : {…alta}`). Así la ventana no puede mostrarse en un modo y comportarse en otro. Si se prefiere dejar la firma como está, corregir `TD-04` para que diga cinco cosas **más** la variable, y agregar un test que abra la ventana sólo por los dos caminos y afirme `título + Cancha + botón + acción` juntos.

### 5. `R-05` apunta a un gate que no corre el escenario que lo detectaría

- **Dimension:** Consistency
- **Where:** §14, `R-05`, columna *Detection signal*
- **What:** `R-05` ("la clase de Editar resultado rompería `partido-jugador`") dice que lo detecta `T-2.D2`. `T-2.D2` (línea 392) corre 13 archivos de test y **no incluye `tests/layout.test.js`**, donde vive `partido-jugador`. Esa suite la corre `T-2.D1`.
- **Why it matters:** la señal de detección de un riesgo tiene que ser la que de verdad lo ve. Con `T-2.D2` como referencia, alguien que ejecute sólo ese gate daría `R-05` por vigilado sin haber corrido el escenario.
- **Evidence:** `T-2.D2` = `node tests/motor.test.js && … && node tests/rol-script.test.js` (sin `layout`). `partido-jugador` está en `tests/layout.test.js:2804`; el `.panel-icono-editar` que busca, en 2817.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** cambiar la señal de `R-05` a `T-2.D1` (`partido-jugador` dentro de `LAYOUT_STRICT=1 node tests/layout.test.js`).

## Per-doc — Completeness

### 6. El "antes" de lo guardado, que usan `fecha-cambio` y `fecha-estados`, no está definido

- **Dimension:** Completeness (pasos que el Plan da por hechos)
- **Where:** §7.3.6, filas `fecha-cambio`, `fecha-estados`, `fecha-doble-toque`, `fecha-jugador-ve`; `TD-11`
- **What:** el Plan afirma que `partidos` de `__ultimosDocs` queda "distinto del inicial sólo en `fecha`" y que `partidosArmado` queda "idéntico", pero no dice **de dónde sale el estado inicial**. Antes del primer gesto `window.__ultimosDocs` no tiene `partidos` ni `partidosArmado` (todavía no se escribió nada), y el fixture "tiene otra forma" que lo guardado (`saveMatches` saca `bloqueados` y reparte `equipos` entre los dos documentos).
- **Why it matters:** si el autor del test compara contra el fixture, el escenario falla por la forma, no por la fecha; si compara contra "nada", la aserción es vacía. El repositorio ya resolvió esto con un ayudante, `lineaDeBase` (`tests/layout.test.js:541-547`), pero ese ayudante está atado a los datos de intercambio (`m-int-8`/`int-pedro`, todos sus usos en 2216-2524) y **hace dos escrituras de `partidos`**, que contaminan el conteo `n` de `TD-11` (que es total desde la carga de la página, no un delta: `layout.test.js:532`). El Plan no nombra el ayudante ni dice que "pedido de guardado" se cuenta como **diferencia** antes/después.
- **Evidence:** comentario de `lineaDeBase` (línea 536): *"…para que `__ultimosDocs` tenga el partido tal cual queda en memoria… y no lo escrito contra el fixture, que tiene otra forma (`saveMatches` parte el partido en dos documentos)"*. Plan, fila `fecha-cambio`: *"`partidos` de `__ultimosDocs` distinto del inicial sólo en `fecha` de `m-abierto`, `partidosArmado` idéntico"*. Mismo vacío en `fecha-jugador-ve` ("los datos armados desde `__ultimosDocs`": no dice cómo se mezclan con el fixture, que trae `players`, `playerScores`, `motorConfig`).
- **Confidence:** High (que el Plan no lo dice); Medium (que el ayudante existente no se pueda reutilizar tal cual: `__toggleBloqueo` sobre `m-finalizado` no lo probé)
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar a §7.3.6 un párrafo "Línea de base y conteo": (a) cómo se obtiene el "antes" (reutilizar `lineaDeBase` con un jugador del partido bajo prueba, o una escritura neutra equivalente) y que se hace *antes* de contar; (b) que `NFR-004` se mide como `n_después − n_después_de_la_línea_de_base`; (c) cómo se arman los `datos` de la segunda página de `fecha-jugador-ve` (`docsDesde()` con `partidos`/`partidosArmado` reemplazados por los de `__ultimosDocs`).

### 7. Escenarios existentes que cambian con el botón (o con el refactor) y el Plan no nombra

- **Dimension:** Completeness
- **Where:** §7.3.6, párrafo de "Anchos de `NFR-001`" (líneas 306-316); Change log fila 2
- **What:** el Plan dice que "tres escenarios que ya existen —`partido-finalizado`, `cancha-8` y `cancha-9`, todos `admin`— aplican `INVARIANTE_PANEL`". Son **cuatro**: falta `colores-encabezado` (`tests/layout.test.js:3281`, invariantes en 3286, corre en los diecisiete anchos). Además, `modal-nuevo-partido` (`tests/layout.test.js:3203-3208`) abre `#btnNuevoPartido` y espera `#newMatchModal.open`: es el **único test existente que toca la ventana de alta** y el refactor `T-2.C3` ("sin cambio visible todavía") no lo nombra como la red de seguridad de ese commit.
- **Why it matters:** quien implemente va a ver `colores-encabezado` en rojo o en verde sin haber sido avisado de que ahora mide un lápiz más; y `T-2.C3` es un refactor del que el Plan no dice con qué se comprueba que no rompió el alta.
- **Evidence:** `grep -n INVARIANTE_PANEL tests/layout.test.js` → usos en 1395 (`partido-finalizado`), 1469 (`cancha-8`), 1493 (`cancha-9`) y 3286 (`colores-encabezado`). `INVARIANTE_PANEL` (268-280) recorre **todo** `.panel-icono` del documento y sale temprano sólo si no hay `.panel-header`. Todos los escenarios con ese invariante son `admin` (verificado), así que el botón oculto para `jugador` no los rompe, como dice el Plan; la enumeración es la que está incompleta.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** (a) corregir "tres" por cuatro y nombrar `colores-encabezado`; (b) en `T-2.C3` agregar la verificación `modal-nuevo-partido` verde; (c) decir una vez que **todo** escenario `admin` que abre un detalle ahora contiene el botón dentro de lo que mide `MEDIR` (`partido-*`, `cancha-*`, `eventos-*`, `intercambio-*`, `colores-*`…). Si el botón desarma el encabezado en alguno de ellos a 360 px, sólo se sabe corriendo: `LAYOUT_STRICT=1 node tests/layout.test.js` (el Plan ya lo pide en `T-2.D1`; conviene correrlo también tras `T-2.C4`, antes de escribir `T-2.C5`).

### 8. Ningún test crea un partido válido por la ventana compartida

- **Dimension:** Completeness (riesgo de que la ventana quede en el modo equivocado)
- **Where:** §7.3.6 (`fecha-cancelar`, `fecha-invalida`); §14 `R-02`
- **What:** `TD-06` reescribe la rama de alta de `#btnMatchSave` (valida con `esFechaValida`, cierra por `cerrarVentanaPartido()`), y `FR-013` pide "igual que hoy". Los escenarios del Plan sólo ejercen el alta **inválida** (`S-20c`) y *abrir* la ventana en modo alta (`S-03b`). Nadie hace "elegir Cancha + fecha válida + Crear partido" y comprueba que se crea **un** partido con la cancha elegida y que ninguna fecha existente cambia. En el repositorio, el único test que toca la ventana de alta la abre y no hace nada más (`tests/layout.test.js:3206-3207`).
- **Why it matters:** el modo pegado en "edición" se manifiesta como "Crear partido edita en vez de crear" (o al revés). Los dos escenarios que el Plan cita como detección de `R-02` (`fecha-cancelar`, `fecha-doble-toque`) cubren "Guardar en edición no crea" y "la forma del modal tras cancelar", pero no el camino **edición guardada → Nuevo partido → Crear partido**, que es donde un `partidoEditandoFecha` que sobrevive a `cerrarVentanaPartido()` haría daño.
- **Evidence:** `grep -n "Crear partido\|btnMatchSave\|mFecha" tests/*.js` → sólo `layout.test.js:3206-3207` (abre y espera). Spec §9: `S-20c` es la única variante que toca "Crear partido", y es inválida.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** sumar a `fecha-cancelar` (o a un escenario `fecha-alta`) el recorrido: guardar una fecha en edición → abrir "Nuevo partido" → elegir fútbol 9 y una fecha válida → "Crear partido" → la lista tiene un partido más, el nuevo es de fútbol 9, `currentMatchId` es el nuevo y la fecha del partido editado sigue siendo la editada. Si es alcance nuevo, declararlo como variante en la Spec (`S-03d [boundary]`).

### 9. `fecha-ventana` no se ve fallar nunca, y la corrida roja que sí se pide prueba una cosa distinta a la que dice

- **Dimension:** Completeness
- **Where:** §7.3.9 `T-2.6` y `T-2.9`; §12.9 `TC-032`; `AGENTS.md` § Responsive
- **What:** (a) `AGENTS.md` pide que *cada* escenario responsive nuevo se vea fallar al menos una vez. El Plan sólo exige la corrida roja de los cuatro `fecha-encabezado-*` (`T-2.6`); `fecha-ventana` (la ventana en modo edición a los diecisiete anchos, `S-06c`) se escribe en `T-2.9`, con el código ya hecho, y nada exige verlo rojo. `TC-032` de la Spec está escrito sólo sobre "el escenario responsive del encabezado", así que el hueco viene de la Spec, pero el Plan lo hereda. (b) La corrida roja de `T-2.6` falla por "falta el lápiz de la fecha", es decir, por el invariante de existencia, no por el desborde: no muestra que `MEDIR` detecte un desborde provocado por el lápiz.
- **Why it matters:** `NFR-001` es "sin scroll horizontal y ningún borde fuera del viewport"; lo que el rojo demuestra no es eso.
- **Evidence:** `T-2.6`: *"correrlos sin el botón: tienen que fallar por 'falta el lápiz de la fecha'"*. `T-2.9` incluye `fecha-ventana` sin paso rojo. `AGENTS.md`: *"ese escenario nuevo MUST verse fallar al menos una vez (revirtiendo el arreglo que lo motiva)"*.
- **Confidence:** High (a); Medium (b: un escenario nuevo para un elemento nuevo no tiene "arreglo" que revertir; la forma honesta de verlo fallar por desborde es provocarlo)
- **Severity:** 🟡 Should fix
- **Suggested fix:** (a) extender `T-2.6` a `fecha-ventana` (se corre antes de `T-2.7`/`T-2.8` y debe fallar porque no hay con qué abrir la ventana) y guardar su salida junto a la otra; (b) agregar un paso: con el botón puesto, forzar temporalmente un desborde (p. ej. `white-space: nowrap` en `#detailFecha` a 360 px), ver `MEDIR` en rojo, y revertir. Ambas salidas van al PR (`T-2.D12`).

### 10. Dos FR y el alcance `external` no se nombran en el Plan

- **Dimension:** Completeness
- **Where:** §7.3 *Spec coverage*, §7.3.6, §12.2
- **What:** `FR-046` (sin aviso) y `FR-050` (orden con fechas iguales) no aparecen por ID en ningún lugar del Plan; la cobertura es por el rango "FR-001 a FR-060" y por las variantes `S-01i` y `S-02a`. `AC-53` pide una fila `IMP-*` por cada alcance materialmente afectado; el Plan cubre `code`, `system` y `business` y no dice nada de `external`.
- **Why it matters:** para quien audite con `grep FR-046` el Plan no responde; un alcance que se deja sin declarar es indistinguible de uno que se olvidó.
- **Evidence:** `comm -23` entre los FR definidos en la Spec y los citados en el Plan → `FR-046`, `FR-050`. Plan §12.2: scopes `code, business, system, code, code`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** nombrar `FR-046` en la fila `fecha-cambio` y `FR-050` en `fecha-lista`; agregar a §12.2 una línea "alcance `external`: sin filas — el cambio no toca ningún consumidor fuera del repositorio" (o una fila `IMP-07` con la fecha publicada en GitHub Pages).

## Per-doc — Clarity

### 11. Los dos diagramas no dicen lo que el Plan dice que es su riesgo principal

- **Dimension:** Clarity
- **Where:** §3 (`sequenceDiagram`) y §7.1 (`flowchart`)
- **What:** ambos renderizan y se leen, pero (a) el §3 sólo muestra el camino feliz de la edición; el estado que el Plan llama "el riesgo principal" (el modo de la ventana, `partidoEditandoFecha`) y el camino de alta no aparecen; (b) en el §7.1 la flecha continua `B1 --> B2` se lee como "la rama 2 sale de la rama 1", y la nota de abajo dice lo contrario (sale de `main`).
- **Why it matters:** los diagramas son el índice visual del Plan; el de §7.1 contradice la base de la rama si se lo mira sin leer la nota.
- **Evidence:** `d2.png` (render del §7.1): flecha continua de `docs/…` a `feature/…` y flecha punteada `main → feature/…` rotulada "based off".
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** en §7.1 rotular la flecha continua "se mergea antes" y dejar sólo la punteada como base; en §3 agregar una nota (o un segundo `stateDiagram-v2` de dos estados: alta / edición, con `abrirVentanaPartido` como única transición).

### 12. Los casos de `esFechaValida` no distinguirían una reimplementación más floja

- **Dimension:** Clarity (testabilidad)
- **Where:** §7.3.6, fila `'fecha/S-20a: …'`, `'fecha/TC-041: …'`
- **What:** la lista de rechazos tiene `2026-02-30` pero no un 29 de febrero de año no bisiesto, ni mes 13, ni día 31 en mes de 30. Una función que sólo compruebe `día ≤ 29` en febrero o `mes ≤ 12 && día ≤ 31` pasaría el `2026-02-30` y fallaría en otros casos reales.
- **Why it matters:** la implementación de `TD-02` es correcta (la corrí: ver arriba), pero el test existe para proteger un refactor futuro.
- **Evidence:** corrida con `node` de la función de `TD-02` sobre `2025-02-29`, `2100-02-29`, `2026-13-01`, `2026-04-31`: todas `false`; ninguno está en la lista del Plan.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** sumar `'2025-02-29'`, `'2100-02-29'`, `'2026-13-01'` y `'2026-04-31'` a los rechazos; y, si se quiere dejar explícito, `'0000-01-01'` (hoy se acepta) como decisión consciente o como rechazo.

### 13. `T-2.C4` mezcla un commit "del lápiz" con la lógica de guardado, y `T-2.C1` queda en 72 exactos

- **Dimension:** Clarity
- **Where:** §7.3.9, `T-2.C1` y `T-2.C4`
- **What:** `T-2.C4` se titula "agrega el lápiz junto a la fecha (FR-001, FR-010)" pero incluye `T-2.7` (los dos manejadores y la rama de edición de `#btnMatchSave`, que implementan `FR-030`, `FR-040`) y `T-2.8`; los tests de esa lógica llegan recién en `T-2.C5`. Y `T-2.C1` mide exactamente 72 caracteres.
- **Why it matters:** `AGENTS.md` pide "un cambio lógico por commit" y los IDs de la Spec en el asunto; un asunto que nombra dos FR en un commit que implementa más rompe la trazabilidad por `git log`. A 72 exactos, cualquier ajuste de redacción pasa el límite.
- **Evidence:** medí los siete títulos con `python3`: 49, 63, **72**, 67, 65, 69, 67 caracteres (la afirmación del Change log de que ninguno pasa de 72 es correcta). `T-2.C4`: *"incluye `T-2.6` a `T-2.8`"*.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** partir `T-2.C4` en dos (`feat(editar-fecha): abre y guarda la fecha desde la ventana (FR-010, FR-030)` con `T-2.7`; `feat(editar-fecha): agrega el lápiz junto a la fecha (FR-001)` con `T-2.6` y `T-2.8`), o ajustar el asunto. Acortar `T-2.C1` para dejar margen, por ejemplo `feat(editar-fecha): valida que la fecha exista (FR-020, TC-041)` (63 caracteres).

## Per-doc — Methodology-invariants

### 14. `T-1.D5` encuentra su propio texto: nunca puede dar "vacío"

- **Dimension:** Methodology-invariants (`MD-15`, DoD verificable)
- **Where:** §7.2.9, `T-1.D5` (línea 238); también §6 y `T-2.D5`
- **What:** el gate es `git grep -nE "TODO|FIXME|HACK" -- docs/editar-fecha-partido/` y pide "vacío". El Plan contiene las tres palabras en el texto de §6 (línea 152), en el propio `T-1.D5` (238) y en `T-2.D5` (395). Una vez commiteado el Plan (`T-1.C1`), el comando devuelve esas líneas y el gate no puede pasar.
- **Why it matters:** un gate imposible de cumplir se termina "resolviendo" con una excepción verbal, que es exactamente lo que el patrón DoD-as-tasks quiere evitar. Falla en voz alta, no en silencio, por eso 🟡.
- **Evidence:** `grep -nE "TODO|FIXME|HACK" docs/editar-fecha-partido/*.md` → `…IMPLEMENTATION_PLAN.md:152`, `:238`, `:395`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** excluir el propio archivo (`git grep -nE "TODO|FIXME|HACK" -- docs/editar-fecha-partido/ ':!docs/editar-fecha-partido/EDITAR_FECHA_PARTIDO_IMPLEMENTATION_PLAN.md'`) o escribir las palabras de modo que no coincidan en el texto del Plan (`TO` + `DO`), y revisar `T-2.D5` por lo mismo.

### 15. `T-N.D18` no tiene comando; el Pass 1 da dos coincidencias; `T-N.D6`/`D7` son de lectura; `T-N.D17` comprueba menos de lo que dice

- **Dimension:** Methodology-invariants (`MD-15`)
- **Where:** §7.2.9 `T-1.D6`, `T-1.D17`, `T-1.D18`; §7.3.9 `T-2.D6`, `T-2.D7`, `T-2.D18`
- **What:** (a) `T-1.D18`/`T-2.D18` dicen "Auto-consistencia del Plan, Pass 1" sin comando; el rubric trata los dos pasos como mecánicos (`grep` + `comm`). Corrí el Pass 1 de `references/review-passes.md` sobre el Plan: queda **`OPEN-Q-05`** citado sin definir (es una referencia a otro documento, §7.0) y **`T-2.C6`** citado sin definir (es el marcador "`T-2.C6` en adelante", línea 389). Quien corra el gate tal cual obtiene dos líneas y no sabe si son defectos. (b) `T-1.D6`, `T-2.D6` ("Implementación revisada contra §5") y `T-2.D7` ("revisar la tabla de §7.3.5") son revisión humana, no un comando. (c) `T-1.D17` se titula "cada `R-*` de §14 tiene vía de mitigación" pero el comando sólo verifica que las tareas citadas en §14 estén definidas; una fila `R-*` con la columna de mitigación vacía pasaría.
- **Why it matters:** DoD-as-tasks sólo protege si cada ítem se puede correr y da blanco o negro.
- **Evidence:** Pass 1 sobre el Plan, prefijos `TD OBS IMP R A OPEN-Q` y tareas `T-N.*` con sufijo de letra → `OPEN-Q-05` y `T-2.C6`; el resto, vacío.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** (a) poner en `T-N.D18` el comando del Pass 1 y declarar, ahí mismo, que `OPEN-Q-05` (ajeno) y `T-2.C6` (marcador) son las dos únicas salidas esperables — o reescribir las dos menciones para que no coincidan (`OPEN-Q-05 de intercambiar-colores` → "la `OPEN-Q` del modelo de ramas de `intercambiar-colores`"); (b) para `D6`/`D7` nombrar el artefacto que prueba la revisión (p. ej. una línea en la descripción del PR con la tabla §7.3.5 tildada); (c) renombrar `T-N.D17` a lo que hace, o agregar `awk -F'|'` que falle si la columna *Mitigation task* de §14 está vacía.

### 16. Los TC que se satisfacen con tests no llevan su etiqueta `fecha/TC-…` (excepto `TC-041`)

- **Dimension:** Methodology-invariants (`MD-17`, binding) — también cross-doc, ver X-3
- **Where:** §5 fila *Binding*, §7.3.6, §12.9
- **What:** la Spec `TC-031` y el Plan §5 dicen que **todo test que satisfaga un `S-*`, `NFR-*` o `TC-*`** embebe su ID con prefijo `fecha/`. §12.9 declara que `TC-040` se verifica con `fecha-jugador` y `fecha-invalida`, y `TC-013` con `'fecha/NFR-003: …'`; ninguno de esos escenarios/casos lleva `fecha/TC-040` ni `fecha/TC-013` en su `spec:`/título (sólo `TC-041` lo tiene, en 320, 552 y 615). Los gates `T-2.D8`/`T-2.D9` no miran TC, y `T-2.D10` sólo mira que el TC aparezca en el texto de §12 del Plan.
- **Why it matters:** `TC-031` es una restricción de la Spec que el Plan firma en §5; con las etiquetas ausentes, ningún `grep` en `tests/` responde "¿qué prueba `TC-040`?".
- **Evidence:** `grep -noE "fecha/TC-[0-9]+" Plan` → sólo `TC-041` (3 veces). `fecha-jugador` `spec: ['fecha/S-21', … 'fecha/S-21f']`; `fecha-invalida` `spec: ['fecha/S-20', … 'fecha/NFR-004']`.
- **Confidence:** Medium (se puede leer que "satisfacer" un TC alcanza por la vía del `S-21` que lo cita)
- **Severity:** 🟡 Should fix
- **Suggested fix:** sumar `'fecha/TC-040'` a los `spec:` de `fecha-jugador` y `fecha-invalida`, `'fecha/TC-013'` al caso `'fecha/NFR-003: …'`, y un `T-2.D10c` que compare los TC con prueba ejecutable de §12.9 contra `grep -rEho "fecha/TC-[0-9]+" tests/`.

### 17. Sin feature flag: desvío documentado de `MD-06`

- **Dimension:** Methodology-invariants (`MD-06`)
- **Where:** §3.1 `TD-01`; §10
- **What:** la plantilla pide un flag con default `false` y kill-switch; §10 dice "No aplica — `TD-01`". El desvío está justificado (Simplicidad ante todo, precedente `intercambiar-colores`) y el kill-switch real es revertir el merge (`R-02`, `R-03`).
- **Why it matters:** la feature **escribe en la base real** al mergear (`§13`, paso 4); la justificación "la rama sin mergear es la red de seguridad" vale hasta el merge y no después. No es un defecto, pero es una decisión que conviene que el owner vea como tal.
- **Evidence:** §13 paso 4: *"GitHub Pages publica contra la base real"*; `TD-01`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** una frase en §10: "kill-switch = revertir el merge (`R-02`/`R-03`); sin flag por `TD-01`", para que la deuda quede dicha donde la plantilla la espera.

---

# Barrido 2 — Cross-doc Spec ↔ Plan (y `D-*` de la Concept Note)

## Cross-doc — Decision propagation

- El Plan cita **un solo** `D-*` (`D-09`, línea 82) y la Concept Note lo define; el gate `T-1.D19` para `D` da vacío. Pero la cita es incorrecta (hallazgo **1**). Los `D-01`..`D-09` llegan a la Spec en §3.3 y, de ahí, al Plan por los `FR/TC` que cada `TD-*` cita; no encontré una decisión heredada que el Plan deje sin destino.

## Cross-doc — Behaviour coverage

- Las 40 entradas de escenario/variante de Spec §9 están en Plan §12.1 con test y nivel; las etiquetas de variante coinciden una a una. Los 12 TC están en §12.9; los 4 NFR están en §12.8 y en `OBS-01`..`OBS-04`. Los FR están cubiertos por rango en §7.3, salvo que `FR-046` y `FR-050` no se nombran (hallazgo **10**, 🔵).
- Las filas de nivel son razonables: lo que cruza módulos va `e2e`; la propiedad, `unit + property`. No hay filas "unit" reflejas para escenarios de pantalla.
- Faltantes concretos de cobertura de lo que la Spec pide (no de IDs): el recorrido edición → alta válida (hallazgo **8**); el "antes" de lo guardado (hallazgo **6**).

## Cross-doc — AC coverage

- Los 24 AC de la Spec (`AC-01`..`AC-02`, `10`..`13`, `15`..`24`, `50`..`55`) están en Plan §16, todos con `Satisfied by` y `Test`. `AC-15`, `-17`, `-19`, `-20` se verifican por "revisión de código", que la propia Spec acepta (§11.3).
- Observación de verificación: `AC-19`/`TC-014` se comprueba con `git diff --stat main -- docs/rol-en-el-token/contracts/ docs/007-permisos-por-usuario/contracts/`; ambas rutas existen (el comando no es vacuo por ruta errónea), pero `git ls-files` también trae `docs/005-login-basico/contracts/firestore-rules.md`, que el diff no cubre. (🔵, ver X-4.)

## Cross-doc — No silent drift

### X-2. `OPEN-Q-07` abre una posible excepción a `TC-030` en un Plan que ya se habrá mergeado

- **Dimension:** No silent drift
- **Where:** Plan §15.1 `OPEN-Q-07`, `T-2.12`; Spec `TC-030`, §17 *Plan must resolve*
- **What:** la Spec dice "No se necesita ninguna excepción al design system" (`TC-030`) y "Plan must resolve: nada abierto" (§17). El Plan introduce una pregunta visual que, si el owner elige el margen negativo, es un valor nuevo y exige "una excepción documentada en este Plan". Pero este Plan se mergea **antes** (rama 1) que el código (rama 2): la excepción tendría que documentarse con un commit de documentos sobre una rama de código ya abierta.
- **Why it matters:** no contradice la Spec (la opción por defecto no agrega nada), pero deja un camino de decisión sin dueño de proceso.
- **Evidence:** `OPEN-Q-07`, columna *Notes*: *"Si se elige el margen, va como excepción documentada en este Plan"*; §13 pasos 1-2 (la rama 1 se mergea primero).
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** decir en `OPEN-Q-07` que, si hay excepción, se agrega como fila de Change log + `TD-13` en un commit `docs(editar-fecha)` de la rama 2, y que `T-2.D12` lo cita.

### X-3. `TC-031` de la Spec no se cumple para `TC-040`/`TC-013`

- **Dimension:** No silent drift (el Plan firma `TC-031` en §5 y no lo aplica en §7.3.6)
- **Where:** Spec `TC-031`; Plan §5 *Binding*, §7.3.6, §12.9
- **What / Evidence / Fix:** ver hallazgo **16**. Es el mismo hecho visto desde la Spec.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix (contado una sola vez en el resumen: es el hallazgo 16)

### X-4. La verificación de `TC-014` no cubre el tercer archivo de reglas

- **Dimension:** No silent drift
- **Where:** Plan §12.9 `TC-014`; Spec `AC-19`, `TC-014`
- **What:** el Plan dice que `git ls-files` "sólo trae los contratos `docs/*/contracts/firestore-rules.md`" (cierto: son tres) y que el diff se hace sobre dos de ellos. `docs/005-login-basico/contracts/firestore-rules.md` queda afuera. La Spec dice "los archivos de reglas no cambian".
- **Why it matters:** un cambio en el tercero pasaría el gate.
- **Evidence:** `git ls-files | grep -i rules` → tres rutas (`005-login-basico`, `007-permisos-por-usuario`, `rol-en-el-token`).
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** `git diff --stat main -- 'docs/*/contracts/firestore-rules.md'` vacío.

### Sin hallazgo, verificado

- `TD-02`/`TC-041`/`FR-020`: el Plan no endurece ni ablanda la Spec. `esFechaValida` acepta exactamente lo que `§6 Fecha válida` define, incluido el año de dos cifras (`0050-01-01`), y el regex de cuatro cifras cierra `A-01`.
- `TD-06` vs `FR-032`/`FR-041`: cerrar antes de guardar y devolver `false` por "misma fecha" produce el comportamiento que la Spec pide (cierra sin escribir).
- `TD-08` vs `FR-003`/`S-21`: `body.role-jugador .admin-only{display:none !important}` (línea 107) y `<body class="role-jugador">` (1213) sostienen "ni a la vista ni en el árbol de accesibilidad"; el escenario `fecha-jugador` usa `getByRole`, que excluye lo oculto.
- `TD-09`: la clase propia para no romper `partido-jugador` es correcta y se apoya en la línea que cita (2817); `INVARIANTE_PANEL` mide también los `.panel-icono` ocultos, así que **si algún escenario `jugador` aplicara ese invariante, el botón oculto (0×0) lo haría fallar**; hoy ninguno lo aplica (verificado en los cuatro usos).
- `TD-11`/`NFR-004`: `saveMatches()` escribe `partidos` una vez por invocación y antes que nada (2492); eso es lo que el Plan cuenta. El vacío está en cómo se toma el "antes" (hallazgo 6).

## Cross-doc — Reverse-derivability

- Un lector que sólo tuviera el Plan podría reconstruir la Spec: cada `TD-*` lleva su *Spec ref* y las restricciones de la Spec (`TC-001`, `-002`, `-010`..`-014`, `-030`..`-032`, `-040`, `-041`) aparecen donde se aplican. El único cabo suelto es `TD-01` (hallazgo 1), que apunta a una decisión que no existe en la Concept Note.

---

## Riesgo de que la ventana compartida quede en el modo equivocado (foco pedido por el owner)

Lo que sostiene el Plan, verificado en el código: nada más abre `#newMatchModal` que el listener de `#btnNuevoPartido`; no hay cierre por `Escape` ni por clic afuera; el overlay pasa a `display:none` en el acto, así que el segundo clic de un doble toque no cae sobre "Guardar" (`TD-12`). Lo que **no** sostiene:

1. **La variable del modo y el aspecto de la ventana se escriben por separado** (hallazgo 4). Es el único punto donde el diseño permite que la ventana *parezca* de edición y *actúe* de alta.
2. **`cerrarVentanaPartido()` pone `partidoEditandoFecha = null` pero no restaura título, Cancha ni texto del botón.** Es correcto sólo porque toda apertura pasa por `abrirVentanaPartido`. Hoy es cierto; el Plan debería decir que es una invariante (un solo punto de apertura) y un test debería fallar si aparece un segundo `classList.add('open')` sobre ese modal.
3. **El camino edición guardada → alta válida no tiene test** (hallazgo 8).
4. **`fecha-doble-toque` no se puede dar por cierto sin correrlo.** Prueba con `page.dblclick`, con el cursor del mouse de Playwright; un doble toque real en un celular puede caer, el segundo, sobre lo que quede debajo de "Guardar" cuando se cierra la ventana (es el mismo comportamiento del alta de hoy). El escenario afirma "exactamente un pedido" y "misma cantidad de partidos", lo que sí atrapa una escritura de más; no cubre el caso táctil. Se resuelve corriendo el escenario y, si se quiere cubrir el táctil, con `page.touchscreen.tap` dos veces.

---

## Summary

- Blocking: 0
- Should fix: 11 (hallazgos 1, 2, 4, 5, 6, 7, 8, 9, 14, 15, 16; X-3 es el hallazgo 16 visto desde la Spec)
- Suggestions: 8 (hallazgos 3, 10, 11, 12, 13, 17, X-2, X-4)
- Methodology-invariants violated: `MD-15` (DoD verificable: hallazgos 14, 15), `MD-17` (binding de TC, hallazgo 16), `MD-33` (confirmación del modelo de ramas, hallazgo 2); desvío documentado de `MD-06` (hallazgo 17). `MD-24` (diagramas) cumplido: ambos renderizan y están por debajo de 15 elementos.

## Limitaciones de esta crítica

- **No se corrió la aplicación ni ninguna suite de tests**, como se pidió. Lo que sólo se resuelve corriendo: (1) que los escenarios `admin` existentes que abren un detalle (`partido-*`, `cancha-*`, `eventos-*`, `intercambio-*`, `colores-*`) sigan sin desborde a 360 px con el botón nuevo y la fecha más larga — `LAYOUT_STRICT=1 node tests/layout.test.js` después de `T-2.C4`; (2) que `fecha-doble-toque` pase y por la razón correcta — `node tests/layout.test.js` filtrando ese escenario; (3) que el `lineaDeBase` existente sirva sobre `m-finalizado`/`m-sin-equipos` (`__toggleBloqueo` no se probó fuera de los datos de intercambio); (4) el aspecto del lápiz junto a la fecha más larga (`OPEN-Q-07`), que es una decisión visual del owner.
- La función `esFechaValida` se probó **escrita por mí a partir de la descripción de `TD-02`**, no la del repositorio (todavía no existe). Confirma que la descripción es correcta; no confirma la implementación.
- Los gates se corrieron con variables de shell en lugar de las rutas literales, en la rama `docs/editar-fecha-partido`, con el árbol de trabajo tal como estaba (Plan sin trackear; Concept y Spec con cambios sin commitear). `T-1.D11` (`git log main..HEAD`) y `T-1.D12`–`T-1.D14` no se evaluaron: dependen de commits y PR que todavía no existen.
- `T-1.D5` se emuló con `grep` sobre el árbol de trabajo, no con `git grep`, porque el Plan no está trackeado; el resultado vale para después de `T-1.C1`.
- Los diagramas se renderizaron con `@mermaid-js/mermaid-cli@latest` bajado por `npx` en esta corrida; se miraron los PNG, pero la lectura de "se entiende" es mía.
- No verifiqué contenido de Spec/Concept más allá de lo que el Plan cita o contradice; la Spec y la Concept Note ya tienen sus propias críticas (`…_SPEC_CRITIQUE_2026-11-06_sonnet-5-5.md`, `…_CONCEPT_CRITIQUE_2026-11-06_sonnet-5-5.md`) y no las releí.
- Crítico y autor son de familias distintas pero del mismo proveedor: los sesgos compartidos de entrenamiento pueden dejar pasar hallazgos que un crítico de otro proveedor vería.
- La severidad de los hallazgos 14 y 15 es un juicio mío (ver Verdict).
