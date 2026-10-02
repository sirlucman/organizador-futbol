# Critique — ORDEN_POR_COLUMNAS_IMPLEMENTATION_PLAN.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (familia Claude Sonnet, Anthropic). Confirmado por el entorno de la propia sesión crítica.
> **Author model:** claude-opus-5-5 (dato del usuario; figura en el Change log del Plan, fila 2026-10-02).
> **Independencia:** distinta familia, mismo proveedor (Opus → Sonnet). Es el nivel intermedio aceptable de `critic-rubric.md`: se esperan los hallazgos de sesgo de autor, pero puede quedar sesgo residual de entrenamiento compartido.
> **Date:** 2026-10-02
> **Inputs:** `docs/orden-por-columnas/ORDEN_POR_COLUMNAS_IMPLEMENTATION_PLAN.md` (a criticar). Leídos como contexto, no criticados: `ORDEN_POR_COLUMNAS_SPEC.md` (sus FR/NFR/TC/AC no se relitigan; las dos enmiendas del 2026-10-02 son decisiones del propietario), `ORDEN_POR_COLUMNAS_CONCEPT.md`, `docs/intercambiar-colores/INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` (precedente de formato), `docs/rol-en-el-token/contracts/firestore-rules.md`, `AGENTS.md`. Verificado contra `index.html`, `tests/`, `tools/` en `main` = `4d6306d` (HEAD de la rama: `6c676d0`, sólo documentos).
> **Modo:** per-doc, contra `references/critic-rubric.md`. Reporte de sólo lectura: el Plan no se editó.

## Verdict

**COMMENT** — 0 🔴, 7 🟡, 5 🔵. Ningún invariante de metodología está roto: el Plan declara modelo de ramas y arco, tiene la matriz §12.1 completa (todas las `S-NN` y variantes de la Spec), `IMP-*`, `OBS-*`, `R-*` con mitigación, un bloque `T-N.C*`/`T-N.D*` por rama, ambos diagramas renderizan y se leen, y los diecisiete gates `T-1.D*` ejecutables pasan. Lo que degrada el Plan es de ejecución: el módulo que hay que tocar para que el orden manual funcione (`getFiltered`) no figura en el mapa ni en ninguna tarea; hay dos firmas de la misma función que no coinciden; dos commits de la rama de código no pasan sus propios tests en el orden planeado; y la prueba de "verlo fallar" del escenario responsive falla por una razón distinta de la que importa. Ninguno requiere reabrir la Spec.

Salvedad de independencia: crítico y autor son del mismo proveedor; un crítico de otra familia podría ver sesgos compartidos que éste no ve.

### Verificaciones corridas (evidencia, no inferencia)

| Qué | Resultado |
|---|---|
| Gates `T-1.D5`, `D8b`, `D10`, `D10b`, `D15`, `D16`, `D17`, `D18b` (en los tres documentos) | Todos pasan (salida vacía; `D15` da 5 filas `IMP-*`) |
| `T-1.D18` / `T-1.D19` (Pass 1 y Pass 2 de `review-passes.md`) | Corridos a mano por familia (`TD OBS IMP R`, `FR NFR TC AC S`, `D` contra el Concept) y `T-N.*` definidos: vacíos |
| Simulación de `T-2.D8` contra §12.1 | Vacío. Contra la tabla de tests de §7.3.6 faltan `S-20b`–`S-20e`, que la tabla abrevia con `'orden/S-20a' … 'orden/S-20f'`: el gate real exigirá cada literal |
| Citas de línea de `index.html` (17 rangos), `tests/layout.test.js:479` y `:499`, `tests/sesion.test.js:45-62` y `:261-273`, `tests/reglas.test.js:243-279`, `:288-302`, `:295`, `:367-391`, `tests/puestos.test.js:549-553` y `:641-650`, `tests/fixtures-app.js:295-384` | Todas correctas |
| Hashes `4d6306d`, `89f58b0`, `28b1a78`, `7ce74f4`, `ddc8d62`, `7bed0c7` | Existen. Los cuatro primeros son merges a `main` del 2026-09-30 al 2026-10-02 |
| Lucide 0.544.0 `arrow-up` / `arrow-down` (TD-10) | Los `path` coinciden con `unpkg.com/lucide-static@0.544.0/icons/` (consultado hoy) |
| `scripts/detect-branching-model.sh` | Devuelve `trunk-based (basis: fallback)`, como dice §7.0 |
| `scripts/id-uniqueness.sh` | No existe en el skill instalado, como dice `T-1.D18b` |
| Diagramas de §3 y §7.1 con `@mermaid-js/mermaid-cli`; PNG abiertos | Renderizan; se leen (ver Clarity, hallazgo 11) |
| Enlaces relativos del Plan | Los diez resuelven |
| `.github/workflows/` | Sólo `version-bump.yml`: no hay CI de tests, así que publicar reglas en staging no rompe ningún chequeo automático de `main` |

## Findings

### Per-doc — Accuracy

None ✓. Las citas de código, de tests y de hashes se verificaron una por una (tabla de arriba). Las dos afirmaciones que no se pudieron probar sin un teléfono (`A-07`, `A-05` de la Spec) quedan en Consistency (hallazgo 5).

### Per-doc — Consistency

### 1. `normalizarPreferenciaOrden` tiene dos firmas distintas dentro del Plan

- **Dimension:** Consistency
- **Where:** `ORDEN_POR_COLUMNAS_IMPLEMENTATION_PLAN.md` §3.1 `TD-06` (línea 86) contra §7.3.5 (línea 304) y `TD-08` (línea 88)
- **What:** `TD-06` la declara `normalizarPreferenciaOrden(crudo, idsDelPlantel)`; la tabla de interfaces de §7.3.5 la declara `(crudo: string|null) -> { modo, ordenManual }`; y `TD-08` dice que los ids que no son del plantel "se ignoran en `sortRoster`, no al normalizar", o sea que el segundo parámetro no hace nada.
- **Why it matters:** el Plan exige rutas y símbolos exactos para que un agente lo ejecute. `orden/S-04b`, `orden/S-07b` y `orden/S-07c` llaman a esta función directamente: con la firma de `TD-06` el test pasa un argumento que la de §7.3.5 no tiene, y al revés. Es exactamente el tipo de ambigüedad que `TD-08` ya zanjó en otro lado.
- **Evidence:** `TD-06`: "`normalizarPreferenciaOrden(crudo, idsDelPlantel)`". §7.3.5: "`(crudo: string|null) -> { modo, ordenManual }` | `TD-08`. Pura". `TD-08`: "Los ids que no son del plantel se ignoran en `sortRoster`, no al normalizar".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** dejar un solo parámetro en `TD-06` (la decisión de `TD-08` ya lo implica) y, de paso, que §7.3.5 diga qué devuelve con una lista de ids repetidos ("se queda con la primera").

### 2. `TD-10` dice que resuelve `OPEN-Q-16`; §15.1 y el Change log dicen que sigue abierta

- **Dimension:** Consistency
- **Where:** §3.1 `TD-10` (línea 90) contra §15.1 (línea 677) y Change log (línea 717)
- **What:** `TD-10` termina "Resuelve `OPEN-Q-16` con una regla y una medición". §15.1 la lista con "Resolution by branch: Branch 2 (`T-2.10`)" y el Change log dice "queda con regla y medición".
- **Why it matters:** la Spec §17 obliga al Plan a resolver `OPEN-Q-05`, `OPEN-Q-15` y `OPEN-Q-16`. Un lector que mire sólo `TD-10` la cuenta cerrada; uno que mire §15.1 la cuenta abierta. `OPEN-Q-05` y `OPEN-Q-15` dicen "Resuelta en este Plan"; esta es la única que no.
- **Evidence:** las tres citas de arriba.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** en `TD-10`, "Deja `OPEN-Q-16` con una regla de decisión (a 40px sólo si la medición lo pide); la medición es `T-2.10`".

### 3. El Plan cuenta las enmiendas a la Spec de menos de las que hizo

- **Dimension:** Consistency
- **Where:** §7.2.8 (línea 224), `T-1.1` (línea 229), Change log del Plan (línea 717)
- **What:** el Plan habla de "dos enmiendas" y lista `NFR-004`, `S-08`, `S-08a`, `FR-027`, `A-07` y el enlace al Plan. La tercera fila del Change log de la Spec (commit `4c5e438`) dice que además cambió `AC-15` (enumera `TC-011` y `TC-012`) y `AC-19` (declara retirados `TC-032` y `TC-034`) "por el gate `T-1.D10b`".
- **Why it matters:** el inventario de archivos modificados de la rama 1 es incompleto, y `T-1.D7` ("las enmiendas de `T-1.1` están en la Spec y en su Change log") no verifica `AC-15` ni `AC-19`. Esas dos ediciones existen sólo para que `T-1.D10b` dé vacío: sin ellas el gate del propio Plan falla.
- **Evidence:** Spec línea 807: "Además, por el gate `T-1.D10b` del Plan: `AC-15` enumera `TC-011` y `TC-012`… y `AC-19` declara retirados `TC-032` y `TC-034`".
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** sumar `AC-15` y `AC-19` a la lista de §7.2.8 y a `T-1.1`, con una línea que diga que son dependencias de `T-1.D10b`.

### Per-doc — Completeness

### 4. `getFiltered` —el único lugar donde la lista visible se ordena— no figura en el mapa de módulos ni en ninguna tarea

- **Dimension:** Completeness (con efecto sobre la invariante de rutas y símbolos exactos, Dim 5.3)
- **Where:** §4 Module map (líneas 101-125); `T-2.2`, `T-2.6`, `T-2.11` (líneas 391, 401, 410); `TD-13` (línea 93)
- **What:** hoy `getFiltered` termina en `return sortRoster(filtrados, effectiveSortMode()); // TC-010` (`index.html:2622`), con dos argumentos. `TD-05` agrega el tercero (`ordenManual`), y en modo Manual el orden de la cuenta sólo se aplica si ese tercer argumento llega. Ni §4 ni ninguna tarea dice que `getFiltered` pasa a `sortRoster(filtrados, effectiveSortMode(), ordenManualCuenta)`. Lo mismo con la constante `puedeArrastrar` (`index.html:2666`: `isAdmin() && effectiveSortMode() === 'manual'`), que hoy esconde el atributo `draggable` a todo el que no es admin: `TD-13` nombra los dos handlers pero no esa línea, y §4 sólo dice "arrastre para todos" sobre `renderPlayersTab`.
- **Why it matters:** sin el tercer argumento, el listado nunca muestra el orden manual (`FR-037`, `S-05`, `S-07`) y la feature falla en su propia prueba central; sin tocar `puedeArrastrar`, las filas de una cuenta `jugador` no son arrastrables y `S-06` falla. Los escenarios `orden-arrastre` y `orden-arrastre-jugador` lo detectarían, pero recién en `T-2.12`, después de tres commits. `TC-010` se verifica en §12.9 con "`getFiltered` sigue terminando en `sortRoster`", o sea que el Plan sabe que es un punto de contacto y no lo lista.
- **Evidence:** `grep -nE "getFiltered|puedeArrastrar"` sobre el Plan: sólo las líneas 93 (`TD-13`, como validación del soltado) y 621 (§12.9). Código: `index.html:2622` y `index.html:2666`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** sumar a §4 las filas `getFiltered` (modified, `TD-05`, `TC-010`) y `puedeArrastrar` dentro de `renderPlayersTab` (modified, `TD-13`), y nombrarlas en las tareas: `getFiltered` en `T-2.6` (cuando `ordenManualCuenta` ya existe) y `puedeArrastrar` en `T-2.11`.

### 5. Las suposiciones sin verificar de la Spec llegan al Plan sin su marcador `[UNVERIFIED]` y sin figurar en §15.1

- **Dimension:** Methodology-invariants (`MD-26`, fila "Trust but verify")
- **Where:** §15.2 `A-03` (línea 685); §15.1 (líneas 673-677)
- **What:** `A-03` afirma sin marcador que "Safari de iOS no respeta `hidden` en una opción". En la Spec, `A-07` lleva `[UNVERIFIED — conocimiento general, no probado en un iPhone; se verifica en el Plan]`. El Plan también depende de `A-05` (arrastre en táctil) y `A-06` (los jugadores de producción tienen `orden`), ambas `[UNVERIFIED]` en la Spec; las dos tienen tarea (`T-2.17`, `T-2.18`) y riesgo (`R-09`, `R-06`), pero ninguna aparece en §15.1.
- **Why it matters:** la rúbrica pide que todo `[UNVERIFIED]` se cite en el slot de preguntas abiertas del Plan para que la deuda de verificación se herede explícita. `A-03` es hoy una afirmación llana sobre un navegador que nadie probó. Mitigante: está en la tabla de suposiciones, tiene columna "If false" y apunta a la Spec, así que está declarada como suposición y no escondida; por eso es 🟡 y no 🔴.
- **Evidence:** Spec línea 761-763 (`A-07` con marcador); Plan línea 685 (`A-03` sin marcador); §15.1 con sólo `OPEN-Q-05`, `-15`, `-16`.
- **Confidence:** Medium (depende de que `A-03` se lea como suposición declarada o como afirmación; el Plan lo trata como lo primero)
- **Severity:** 🟡 Should fix
- **Suggested fix:** `A-03` con `[UNVERIFIED — conocimiento general, no probado en un iPhone; se verifica en T-2.17]`, y una fila por `A-05`, `A-06`, `A-07` en §15.1 apuntando a `T-2.17`/`T-2.18`.

### Per-doc — Clarity

### 6. Cuatro de las seis verificaciones de restricciones de §12.9 no tienen quién las ejecute

- **Dimension:** Clarity (verificabilidad); toca la invariante de DoD (Dim 5.3)
- **Where:** §12.9 `TC-001`, `TC-002`, `TC-010`, `TC-011`, `TC-012`, `TC-033` (líneas 619-630); `T-2.D7` (línea 437)
- **What:** esos seis `TC` se verifican por "Revisión de código" sin nombrar quién ni con qué lista. Dos son mecánicos y se podrían correr: `TC-002` ya dice "`git diff main -- index.html` no agrega `localStorage`" pero no hay tarea que lo corra. `T-2.D7` dice "revisar la tabla de §7.3.5 contra Spec §7, §8 y §4", que no apunta a §12.9. `T-2.D10` sólo comprueba que cada `TC` *aparezca* en §12 (`comm`), no que la revisión haya ocurrido.
- **Why it matters:** `AC-52` pide que un `TC` no mecánico nombre el revisor o la lista que lo verifica. Con el gate actual, un `TC-002` violado (un `localStorage` colado) pasa `T-2.D10` y `T-2.D7` sin que nadie lo mire.
- **Evidence:** §12.9: "Revisión de código: `git diff main -- index.html` no agrega `localStorage` ni `sessionStorage` (`AC-15`)"; `T-2.D7`: "revisar la tabla de §7.3.5 contra Spec §7, §8 y §4".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** que `T-2.D7` diga "recorrer §12.9 fila por fila y anotar el resultado en el PR", y pasar `TC-002` a un comando (`git diff main -- index.html | grep -E "^\+.*(localStorage|sessionStorage)"` vacío) dentro de `T-2.D5` o de un `T-2.D*` propio.

### 7. `T-2.3` no dice si los casos "sobre la fuente" entran en el mismo commit que el comparador, y si entran, `T-2.C2` queda en rojo

- **Dimension:** Clarity (con efecto sobre el orden de commits, `MD-16` y `AGENTS.md` § Commits)
- **Where:** `T-2.3` (línea 394), `T-2.C2` (línea 396), §7.3.6 filas `'orden/S-06'`/`'orden/TC-041'`, `'orden/TC-013'`, `'orden/TC-044'` (líneas 335-337); §5 `Commits` (línea 143: "cada commit pasa los tests")
- **What:** §7.3.6 pone en `tests/orden.test.js` cuatro casos que leen la fuente de `index.html`: `TC-041`/`S-06` (el cuerpo de `window.__dropOnRosterRow` no contiene `savePlayers` ni `isAdmin`), `TC-013` (`preferenciasOrden` y `currentUser` sólo dentro de `window.preferenciaDeOrden`) y `TC-044`. `T-2.3` los pide "de §7.3.6" y los commitea en `T-2.C2`. Pero el cuerpo de `__dropOnRosterRow` pierde `savePlayers`/`isAdmin` recién en `T-2.11` (commit `T-2.C6`), y `window.preferenciaDeOrden` nace en `T-2.6` (commit `T-2.C4`). La descripción de `T-2.3` ("unitarios, de propiedad y de medición") omite "sobre la fuente", que sí figura en el mapa de módulos (línea 117).
- **Why it matters:** si `T-2.3` incluye esos casos, los commits `C2` a `C5` tienen un test en rojo, contra la regla de §5 y contra el propósito de `git bisect` que `AGENTS.md` fija. Si no los incluye, ninguna tarea dice cuándo se agregan, y `T-2.D8` los encontraría faltando recién al final.
- **Evidence:** `index.html:2754-2790` hoy contiene `if(!isAdmin()) return;` y `await savePlayers()` en `__dropOnRosterRow`.
- **Confidence:** Medium-High (la contradicción es segura si `T-2.3` los incluye; el texto es ambiguo sobre eso)
- **Severity:** 🟡 Should fix
- **Suggested fix:** partir `T-2.3`: los casos puros en `T-2.C2`, y cada caso sobre la fuente en el commit que hace verdadera su condición (`TC-013` y `S-03b` en `C4`, `TC-041`/`S-06` en `C6`, `TC-044` en `C5`).

### 8. `T-2.C1` y `T-2.C4` dejan el menú con rótulos `undefined` hasta `T-2.C5`

- **Dimension:** Clarity (orden de commits)
- **Where:** `T-2.2` (línea 391), `T-2.6` (línea 401), `T-2.9` (línea 406)
- **What:** `T-2.2` amplía `ORDEN_MODOS` de cinco a trece en el primer commit. `renderOrdenModoSelect` (`index.html:2625-2636`) recorre `ORDEN_MODOS` y toma `ORDEN_MODO_LABELS[m]`, que sigue con cinco claves hasta `T-2.9` (commit `C5`). En `C1`–`C4` el selector muestra ocho opciones con el texto `undefined`.
- **Why it matters:** ninguna prueba existente mira el texto del selector (no hay referencias a `ordenModo` en `tests/`), así que los commits "pasan", pero una app que se ve rota entre `C1` y `C5` es justo lo que el commit atómico y el bisect quieren evitar. Es un costo chico y evitable.
- **Evidence:** `index.html:1597` (`ORDEN_MODOS`), `index.html:2625` (`ORDEN_MODO_LABELS` con cinco claves), `index.html:2631-2634`.
- **Confidence:** High sobre el mecanismo; el impacto es sólo de ramas intermedias.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** mover la ampliación de `ORDEN_MODOS` y de `ORDEN_MODO_LABELS` al commit `C5`, o hacer que `renderOrdenModoSelect` siga filtrando por los modos viejos hasta `C5`.

### Per-doc — Methodology-invariants

### 9. "Verlo fallar" de `orden-encabezado` falla por ausencia del botón, no por la medición de desborde que la regla del proyecto quiere probar

- **Dimension:** Methodology-invariants (`AGENTS.md` § Responsive, y la tarea de verificación responsive de § Obligaciones)
- **Where:** `T-2.8` (línea 405), `T-2.10` (línea 407), §7.3.1 (línea 275), §7.3.7 (línea 361)
- **What:** `AGENTS.md` exige que un escenario de layout nuevo "se vea fallar al menos una vez (revirtiendo el arreglo que lo motiva)". `T-2.8` escribe los escenarios y los corre "sin el cambio de encabezado: tienen que fallar por 'no hay botón de título'". Eso prueba que el escenario corre, pero no que su aserción de desborde —`scrollWidth === clientWidth` y borde derecho dentro del viewport con el indicador puesto— detecta un problema real. Si `T-2.10` mide que 34px alcanza, la aserción de contención nunca se vio roja por su propia causa.
- **Why it matters:** es el modo de falla que la regla existe para impedir: una aserción que pasa siempre porque nunca se la vio fallar. Pasó antes en este repo con un diagrama que renderizaba y no se leía (`AGENTS.md` § Dependencias), y el mecanismo es el mismo.
- **Evidence:** `T-2.8`: "tienen que fallar por 'no hay botón de título'"; `T-2.10`: "si el indicador sale de su celda, aplicar los `40px`". El rojo planeado no depende de ninguna de las dos mediciones.
- **Confidence:** Medium (el Plan cumple la letra de "ver fallar", pero no el sentido: la aserción de desborde queda sin probar en rojo)
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar a `T-2.10` una corrida en rojo de la aserción de contención: con el escenario en verde, forzar a mano la primera columna a un ancho que no entre (por ejemplo `20px` en `--roster-cols`), confirmar que `orden-encabezado` falla por borde fuera de la celda, revertir, y pegar la salida en el PR junto con la de `T-2.8`.

### 10. Los casos nuevos de `tests/reglas.test.js` necesitan ayudantes que el Plan no menciona, y `A-01` dice lo contrario

- **Dimension:** Methodology-invariants (rutas y símbolos exactos) / Completeness
- **Where:** §7.3.6 filas de `tests/reglas.test.js` (líneas 351-353), `T-2.14` (línea 417), `A-01` (línea 683)
- **What:** `A-01` asume que `puedeLeer`/`puedeEscribir` "sirven para `preferenciasOrden/<uid>` sin cambios". Pero (a) `'orden/S-03a'` debe escribir y leer de vuelta un valor (`puedeLeer` sólo devuelve `'R'` o `'—'`, y `puedeEscribir` escribe un campo de sonda `__sondaReglas`, no `value`); (b) `'orden/S-20e'` es "sin `Authorization`", y ambos ayudantes siempre mandan el encabezado (`tests/reglas.test.js:243-279`); (c) el ayudante de escritura borra el campo de sonda y deja el documento: contra un `preferenciasOrden/<uid>` que no existe (el caso `S-20f`), el resultado es un documento vacío que antes no estaba, contra la convención del archivo de "no dejar rastro en un documento real". Y `S-03a` pisa con datos de prueba la preferencia real que las cuentas de staging usan en `T-2.17`, sin restaurarla.
- **Why it matters:** el trabajo es chico, pero no está en ninguna tarea ni en las interfaces de §7.3.5: quien ejecute `T-2.14` lo descubre al escribir `S-03a`. Un documento vacío no rompe nada (`leer()` da `null`, la cuenta ve Manual), pero ensucia la comprobación manual de "primer día" de `AC-02`.
- **Evidence:** `tests/reglas.test.js:243-279` (los dos ayudantes). §7.3.6: "`S-03a`: Dos escrituras seguidas de la cuenta admin a su propia preferencia; la lectura devuelve la segunda".
- **Confidence:** High en (a) y (b); Medium en (c) (el comportamiento de la API REST ante un documento inexistente es el esperado de Firestore, pero no lo probé).
- **Severity:** 🟡 Should fix
- **Suggested fix:** nombrar en `T-2.14` los ayudantes nuevos (lectura de `value`, escritura de `value` con restauración del valor previo, petición sin encabezado) y, para los casos `S-20`, usar la cuenta ya existente con un documento de prueba que se borre al final, como hace el archivo con los campos de sonda.

### 11. Detalles de forma de los diagramas, del modelo de ramas y de los mensajes de commit

- **Dimension:** Methodology-invariants (menor)
- **Where:** §3 diagrama (línea 55-69); §7.0 (línea 172); `T-2.C6` (línea 411)
- **What:** (a) el diagrama de §3 dice `guardar(modo, ordenManual)`, pero la interfaz es `guardar(valor)` con un solo argumento (`TD-02`, §7.3.5); y en el render, la etiqueta del mensaje a sí mismo "renderPlayersTab sin esperar la red" queda cruzada por la línea de vida de "Listado de Jugadores". (b) `detect-branching-model.sh` termina pidiendo confirmación ("no answer → use 'trunk-based', flagged as inferred-not-confirmed"); §7.0 declara el modelo con `basis: fallback` y lo respalda con `AGENTS.md` § Ramas, pero no dice si el propietario lo confirmó ni lo marca como inferido. (c) El asunto de `T-2.C6`, "feat(orden-por-columnas): cualquier cuenta arrastra su orden (FR-030, FR-031)", mide 77 caracteres; `AGENTS.md` fija "≤ 72" y el propio `T-1.C1` mide exactamente 72. Si el límite cuenta el prefijo, `C6` lo pasa; si cuenta sólo el asunto, no hay problema. En `main` hay asuntos de más de 72 caracteres, así que no es un límite que se haga cumplir.
- **Why it matters:** ninguno cambia la ejecución. (b) es lo único con peso de metodología: la salida del script pide un paso humano.
- **Evidence:** salida del script y de `wc -m` sobre los diez asuntos de commit del Plan.
- **Confidence:** High sobre los hechos; Low sobre si (c) importa.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** (a) `guardar(valor)` en el diagrama; (b) agregar "confirmado por el propietario el <fecha>" o "inferido, sin confirmar"; (c) acortar a "feat(orden-por-columnas): cualquier cuenta arrastra (FR-030, FR-031)".

### 12. Tres observaciones sobre cobertura y accesibilidad que no cambian el Plan pero conviene tener a la vista

- **Dimension:** Methodology-invariants / Behaviour coverage (menor)
- **Where:** `TD-09` (línea 89); §16 `AC-18` (línea 702); §12.1 `S-03b` (línea 541); §7.3 Spec coverage (línea 268)
- **What:** (a) **Etiqueta en el nombre (WCAG 2.5.3, nivel A en 2.1).** El texto visible del título es "PJ" y su nombre accesible es "Partidos jugados, de mayor a menor": no contiene "PJ". Un usuario de control por voz que diga "tocar PJ" no activa el botón. Para "Pos", "Asist", "Goles", "Jugador" y "Pts" el texto visible sí está dentro del nombre. El nombre accesible de PJ lo fijó la Spec (`NFR-004`, `S-08`), así que esto no se relitiga acá; se anota como posible enmienda de la Spec ("PJ, partidos jugados, de mayor a menor"). (b) `AC-18` de la Spec pide verificar `S-05f` con "tests unitarios"; el Plan lo cubre con el escenario e2e `orden-arrastre` (§12.1 y §16), lo que es una decisión de nivel razonable pero se aparta de la letra del `AC`. (c) `S-03b` (sin sincronización en vivo) se verifica con "`index.html` no contiene `onSnapshot`", un chequeo de ausencia sobre la fuente (hoy el conteo es 0); el Plan no dice por qué ese proxy sustituye a una prueba de dos dispositivos. (d) La lista de "Spec coverage" de §7.3 es un rango (`FR-001` a `FR-058`); doce IDs de la Spec (`FR-002`, `FR-006`–`FR-009`, `FR-025`, `FR-028`, `FR-032`, `FR-033`, `FR-035`, `FR-055`, `NFR-008`) no se citan por su ID en ningún otro lugar del Plan, aunque sus escenarios sí están en §12.1.
- **Why it matters:** (a) es el único con efecto sobre un usuario real; los otros son de trazabilidad.
- **Evidence:** `TD-09` ("Partidos jugados"); Spec `S-08`; `comm` entre IDs de la Spec y del Plan.
- **Confidence:** (a) Medium (la regla 2.5.3 se refiere a la etiqueta visible y el nombre accesible; no probé con un lector de pantalla); (b)–(d) High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** (a) llevarlo al propietario como enmienda opcional de la Spec; (b) una línea en §16 que diga que `AC-18` se cumple a nivel e2e para `S-05f`; (c) una línea de justificación en §12.1; (d) opcional.

## Summary

- Blocking: 0
- Should fix: 7 (hallazgos 1, 4, 5, 6, 7, 9, 10)
- Suggestions: 5 (hallazgos 2, 3, 8, 11, 12)
- Methodology-invariants violated: `MD-26` (parcial, hallazgo 5), `MD-16` y la regla de § Commits de `AGENTS.md` (hallazgo 7), § Responsive de `AGENTS.md` (hallazgo 9). Ninguno en grado bloqueante.
