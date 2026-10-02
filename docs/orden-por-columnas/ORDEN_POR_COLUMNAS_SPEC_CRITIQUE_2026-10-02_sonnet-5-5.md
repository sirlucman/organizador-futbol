# Critique — ORDEN_POR_COLUMNAS_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (familia Claude Sonnet, Anthropic). Confirmado por la propia sesión crítica; no se le preguntó al usuario porque la sesión lo declara.
> **Author model:** claude-opus-5-5 (figura en el Change log de la Spec, fila 2026-10-02).
> **Independencia:** distinta familia, mismo proveedor (Opus → Sonnet). Es el nivel intermedio aceptable de `critic-rubric.md`: se esperan los hallazgos de sesgo de autor, pero puede quedar sesgo residual de entrenamiento compartido.
> **Date:** 2026-10-02
> **Inputs:** `docs/orden-por-columnas/ORDEN_POR_COLUMNAS_SPEC.md` (a criticar). Leídos como contexto, no criticados: `ORDEN_POR_COLUMNAS_CONCEPT.md` (D-01 a D-09 no se relitigan), `docs/orden-jugadores/ORDEN_JUGADORES_SPEC.md` (hoy y en `89f58b0`), `AGENTS.md`.
> **Modo:** per-doc, contra `references/critic-rubric.md`. Reporte de sólo lectura: la Spec no se editó.

## Verdict

**CHANGES REQUESTED** — 1 🔴, 7 🟡, 6 🔵. El bloqueo es de gobernanza, no de diseño: la Declaración de reemplazo no cubre todo lo que esta Spec vuelve falso en `ORDEN_JUGADORES_SPEC.md`, y `AGENTS.md` exige que una Spec nueva declare cada parte que reemplaza. Fuera de eso la Spec es sólida: los requisitos están bien formados, todos los escenarios tienen `Variants:` (o la declaración `none`), §11.5 tiene `AC-50`–`AC-55`, el diagrama ER renderiza y se lee, las nueve decisiones del Concept se propagan, y las citas de `index.html` verificadas coinciden salvo una (hallazgo 1). Crítica de familia distinta pero del mismo proveedor: la brecha de independencia está parcialmente cerrada, no del todo.

## Findings

### Per-doc — Accuracy

### 1. A-03 dice que PJ, goles y asistencias "ya están en `data/players`"; se calculan en memoria desde los partidos

- **Dimension:** Accuracy
- **Where:** `ORDEN_POR_COLUMNAS_SPEC.md` §14 `A-03` (línea 704-705)
- **What:** `A-03` afirma que esos tres datos "ya están en `data/players` y los recibe cualquier cuenta (`index.html:2253`, …)", pero `index.html:2253` es una asignación en memoria (`p.partidosJugados = t.pj;`) dentro de un recálculo que suma los `partidos` (`index.html:2240-2262`).
- **Why it matters:** la conclusión práctica (cualquier cuenta tiene los datos) probablemente se sostiene, porque la cuenta `jugador` lee `partidos` (`index.html:2089`), pero la premisa escrita es falsa. Quien derive el Plan puede buscar un campo guardado que no existe, o creer que `partidos` no hace falta para ordenar. Es una cita con número de línea que no respalda lo que dice.
- **Evidence:** `index.html:2250-2262`: `players.forEach(p => { const t = totales[p.id]; p.partidosJugados = t.pj; p.golesTotales = t.goles; …` — los `totales` salen de recorrer los partidos. `TC-012` (línea 167-169) dice "se leen de los campos que el listado ya muestra", que es correcto; el desacuerdo es sólo con `A-03`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** reescribir `A-03`: "PJ, goles y asistencias los calcula la app en memoria a partir de `partidos`, que recibe cualquier cuenta (`index.html:2250-2262`, `index.html:2089`); Pts sólo llega a admin (`playerScores`)."

### Per-doc — Consistency

### 2. NFR-002 se contradice: "una lectura más" y "una menos" son cero lecturas de más en total

- **Dimension:** Consistency
- **Where:** §8 `NFR-002` (línea 401); `AC-11` (línea 630)
- **What:** dice que un arranque hace "exactamente una lectura de Firestore más que antes de la feature (la preferencia) y una menos sobre `data` (`playersSortMode`)". Si se suma una y se resta una, el total no cambia; "exactamente una más" sólo es cierto para la colección nueva.
- **Why it matters:** un test que verifique "una más" en el total falla con una implementación correcta. `tools/medir-arranque.js --lecturas` informa un conteo por colección (`tools/medir-arranque.js:34-42`, `:101-117`), así que lo medible es "+1 en la colección nueva, −1 en `data`", no un total.
- **Evidence:** el texto de `NFR-002` citado arriba; `S-01d` de `rol-en-el-token` ya se verifica así en `tests/layout.test.js:479` (`r.lecturas.data !== 9`).
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** "El total de lecturas del arranque no cambia: `data` pasa de N a N−1 documentos y la colección de preferencias suma 1, medido por colección con `--lecturas`."

### 3. La Declaración de reemplazo cita mal una viñeta de OJ §3.1, y varios marcadores en OJ no coinciden con la tabla

- **Dimension:** Consistency
- **Where:** Spec, tabla de reemplazo, fila "§3.1, viñetas 1, 2, 4 y 5 | 53-63" (línea 26); `ORDEN_JUGADORES_SPEC.md` §3.1 (marcador en línea 73) y las notas "Reemplazado el 2026-10-02"
- **What:** (a) En `89f58b0`, las líneas 53-63 de OJ contienen seis viñetas: 1 control, 2 arrastre, 3 campo `orden`, 4 `playersSortMode`, 5 **migración** de `orden`, 6 **respaldo** de no-admin ante Puntaje. La nota de OJ dice que dejan de ser ciertas "la primera, segunda, cuarta y quinta" y nombra el respaldo, que es la **sexta**. La quinta (migración) sigue vigente (la propia Spec la conserva: `FR-060` alimenta el orden base). (b) Los marcadores de OJ están una sola vez al final de cada grupo (`FR-001`–`FR-003` marcado bajo `FR-003`; `FR-050`–`FR-052` bajo `FR-052`), así que `FR-001`, `FR-002`, `FR-050` y `FR-051` no llevan marca propia aunque la tabla los declara. (c) Granularidad distinta entre tabla y nota: `TC-041` → "FR-035" en la tabla y "FR-035 y TC-043" en OJ; escenarios `S-01` → "S-01–S-07, S-20" en la tabla y "S-05, S-06 y S-03a" en OJ.
- **Why it matters:** el criterio de `AGENTS.md` es que la parte reemplazada quede marcada en el spec viejo. Quien lea OJ §3.1 con la nota en mano va a descartar la viñeta de migración, que sigue vigente.
- **Evidence:** `git show 89f58b0:docs/orden-jugadores/ORDEN_JUGADORES_SPEC.md` líneas 53-63 (copia en el directorio de trabajo de esta crítica); nota en `ORDEN_JUGADORES_SPEC.md:73`.
- **Confidence:** High en (a); Medium en (b) y (c), que son de colocación y no de contenido.
- **Severity:** 🟡 Should fix
- **Suggested fix:** corregir a "viñetas 1, 2, 4 y 6" en la Spec y en la nota de OJ; marcar `FR-001`/`FR-002`/`FR-050`/`FR-051` al pie de cada uno (o decir en la nota "FR-001 a FR-003"); igualar las dos redacciones de `TC-041` y de los escenarios.

### Per-doc — Completeness

### 4. 🔴 La Declaración de reemplazo omite partes de OJ que esta Spec deja falsas

- **Dimension:** Completeness (obligación de `AGENTS.md` → "Dónde vive la fuente de verdad")
- **Where:** Spec, "Declaración de reemplazo" (líneas 17-52) contra `ORDEN_JUGADORES_SPEC.md`
- **What:** `AGENTS.md` dice que, cuando un documento nuevo modifica comportamiento de un spec existente, "DEBE declararlo explícitamente … Sin esa declaración, dos specs vigentes se contradicen". La tabla declara muchas piezas, pero quedan vigentes en OJ, sin marca, estas que la nueva Spec contradice:
  - **`S-02` y `S-03` de OJ** (puntaje descendente, posición ascendente): sus pasos dicen "el admin selecciona 'Puntaje descendente' en el modo de orden" y "selecciona 'Posición ascendente' en el modo de orden". Ese selector de modos deja de existir (`FR-001`, `FR-020`–`FR-027`). La Spec declara conservar `FR-020`–`FR-022` y `FR-030`–`FR-031`, pero no los escenarios que los ejercitan, que pasan a ser imposibles de ejecutar tal cual.
  - **`AC-01` de OJ** exige que "S-01 through S-08 … pass", y la tabla deja `S-01`, `S-04`, `S-05` y `S-06` sin efecto: el AC queda pidiendo lo que otra parte de OJ declara sin efecto.
  - **`AC-10` y `AC-11` de OJ** verifican "switching modo de orden" y la reversión de `FR-053` sobre `savePlayers()`; `FR-053` está reemplazado (`FR-047`), `AC-11` no.
  - **OJ §1 Purpose y §5.1 Personas:** "§1: manually via drag and drop, or via a filter…" y la persona Jugador "without being able to change it" (`ORDEN_JUGADORES_SPEC.md:263`) son falsas para el listado: el `jugador` arrastra y su orden se guarda.
  - **`NFR-001` y `NFR-002` de OJ** (cambio de "modo de orden"; "See FR-053"), y **`OPEN-Q-03` de OJ** (aviso al no-admin cuando aplica el respaldo de `FR-052`; `FR-044` de esta Spec lo vuelve silencioso por construcción).
- **Why it matters:** `AGENTS.md` registra que esta clase de omisión ya pasó (la regla existe por eso). Con las marcas faltantes, un lector de OJ que llega a `AC-01` o a `S-02` no sabe si debe ejecutarlos.
- **Evidence:** `ORDEN_JUGADORES_SPEC.md:584-603` (`S-02`, `S-03`), `:729-730` (`AC-01`), `:737-740` (`AC-10`, `AC-11`), `:262-263` (personas), `:18-25` (§1), `:551-552` (`NFR-001`, `NFR-002`), `:884` (`OPEN-Q-03`). Confrontados contra los `FR` de la Spec que los reemplazan.
- **Confidence:** Medium. `S-02`/`S-03` y `AC-01` son contradicciones literales; las demás son de menor peso y la Spec puede argumentar que se leen con las notas de `FR-*` a mano. Por eso se da 🔴 por la regla explícita de `AGENTS.md` y no por un daño de comportamiento; el autor puede bajarla a 🟡 agregando las filas.
- **Severity:** 🔴 Blocking
- **Suggested fix:** agregar a la tabla (y marcar en OJ, en la misma rama): `S-02` y `S-03` ("el disparador pasa a ser el título o el menú; el orden resultante se conserva: `S-01`, `S-01d`"), `AC-01`, `AC-10`, `AC-11`, §1, la fila Jugador de §5.1, `NFR-001`, `NFR-002` y `OPEN-Q-03`. Lo no listado, declararlo en el bloque "No reemplaza".

### 5. TC-031 no nombra los tests de `layout.test.js` que se rompen al retirar `playersSortMode`

- **Dimension:** Completeness
- **Where:** §4.4 `TC-031` (líneas 195-197); `AC-19`
- **What:** `TC-031` obliga a actualizar sólo las listas de `tests/sesion.test.js:261-271`. Pero `tests/layout.test.js:479` exige que un arranque de admin lea **9** documentos de `data` y `:499` que uno de `jugador` lea **3**. Con `FR-048` pasan a 8 y 2 (y la preferencia nueva cae en otra colección, que esos asserts no ven).
- **Why it matters:** cambia el resultado de `node tests/layout.test.js`, que `AGENTS.md` hace gate de responsive: la primera corrida después de retirar `playersSortMode` falla por un motivo ajeno al layout y obliga a redescubrir el vínculo. Los dos asserts llevan hoy el binding `rol/S-01d` y `rol/S-03`, de otra Spec.
- **Evidence:** `tests/layout.test.js:479` — `if (r.lecturas.data !== 9) problemas.push(...)`; `:499` — `if (r.lecturas.data !== 3) problemas.push(...)`. `grep -rn playersSortMode tests` además encuentra `tests/reglas.test.js:286,295` (ya cubierto por `TC-030`).
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** sumar a `TC-031` y a `AC-19` "los conteos de `tests/layout.test.js:479` y `:499`".

### 6. Requisitos sin escenario que los ejercite, y una variante sin valores

- **Dimension:** Completeness
- **Where:** §7 y §9
- **What:** `FR-010` (el orden se aplica sobre búsqueda y filtros) no figura en ningún `covers`: `S-05b`/`S-05c` usan filtros, pero sólo para el arrastre, y ningún escenario ordena con un filtro o búsqueda activos y mira el resultado. `FR-048` (no lee ni escribe `playersSortMode`) sólo lo toca la mitad "lectura" de `NFR-002`; la mitad "no escribe" no tiene prueba. `FR-023` (rótulos "Pos" y "Asist" sin punto) está en el `covers` de `S-09`, pero `S-09` sólo mide ancho y scroll, no el texto. `S-05c` ("ocultos conservan su lugar relativo") no da lista inicial ni resultado esperado, así que no se puede convertir en caso de prueba.
- **Why it matters:** `AC-01` dice que `S-01`–`S-09` cubren `FR-001`–`FR-049`; con estas lagunas la afirmación es falsa para tres requisitos.
- **Evidence:** búsqueda de `FR-010`, `FR-048` y `FR-023` en los encabezados `covers` de §9.
- **Confidence:** Medium (algunos pueden quedar cubiertos por el Plan, pero la Spec no lo dice).
- **Severity:** 🟡 Should fix
- **Suggested fix:** una variante de `S-01` ("con el filtro de puesto en DEL, Goles ordena sólo a los visibles", `FR-010`); una variante de `S-05` o de `S-06` que verifique que `data/playersSortMode` no recibe escritura; un `And` en `S-09` o `S-01` con los rótulos; valores concretos en `S-05c`.

### Per-doc — Clarity

### 7. Requisitos compuestos

- **Dimension:** Clarity
- **Where:** `FR-020`, `FR-022`, `FR-027`, `FR-041`, `FR-043`, `FR-044`, `FR-047` (líneas 325-330, 340-341, 374-375, 377-382, 388-390)
- **What:** cada uno junta dos o tres obligaciones en una línea: `FR-027` (casilla "Ordenar por…" **y** ningún título con indicador), `FR-043`/`FR-044` (muestra Manual **y** sin error **y** sin escribir), `FR-047` (aviso **y** reversión), `FR-041` (leer **y** aplicar antes de mostrar), `FR-020` (cuatro formas de activar **y** aplica `FR-003`/`FR-004`), `FR-022` (indicador en la activa **y** ninguno en las demás).
- **Why it matters:** una línea con tres obligaciones se verifica con un solo test que, al fallar, no dice cuál faltó; la rúbrica pide una obligación por línea.
- **Evidence:** `FR-043` — "mostrará Manual sin error visible y sin escribir la preferencia".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** partir cada uno en requisitos de una obligación (con IDs libres del mismo grupo) o, como mínimo, que cada variante `S-04a`/`S-04b`/`S-05e` verifique las dos o tres partes por separado.

### 8. FR-045 no dice qué pasa con el orden manual guardado cuando se elige una columna

- **Dimension:** Clarity
- **Where:** §7.4 `FR-045` (línea 383); `FR-047`; `D-04` (§3.3)
- **What:** `FR-040` guarda "el orden activo y el orden manual". `FR-045` dice que elegir una columna "lo persistirá en su preferencia", sin decir si el documento conserva el orden manual anterior (sin uso, hasta el próximo arrastre: Concept §8.2) o lo borra. De eso dependen `FR-047` ("volverá al orden manual que tenía"), `FR-042`/`FR-043`/`FR-044` (caer a "Manual" muestra *qué* lista) y el argumento de `CWE-200` de `TC-040` (un orden manual guardado puede codificar el ranking de Pts).
- **Why it matters:** si se conserva, `FR-043`/`FR-044` son un camino de vuelta al manual anterior, que `D-04` dice que no existe. Si se borra, es una escritura más por cada toque de columna. Las dos lecturas son defendibles, y el Plan va a elegir una sin que la Spec lo haya decidido.
- **Evidence:** ausencia en `FR-045` y en `S-05d` ("no hay control que vuelva al orden manual").
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar a `FR-045` "y conservará sin cambios el orden manual guardado" (o lo contrario) y cubrirlo en `S-05d` con "al recargar y caer a Manual por `FR-044`, la lista es la última que armó".

### Per-doc — Methodology-invariants

### 9. Convenciones y pasos de proceso numerados como TC

- **Dimension:** Methodology-invariants (`MD-11`)
- **Where:** §4.4 `TC-030`, `TC-031`, `TC-032`, `TC-034`
- **What:** `TC-032` y `TC-034` repiten reglas de `AGENTS.md` (Estilo; Tests) sin agregar nada de esta feature, y la rúbrica dice que las convenciones de proyecto "are in AGENTS.md". `TC-030` ("las reglas se publican en staging y en producción como paso explícito") y `TC-031` ("se cambia en el mismo commit") son pasos de entrega, es decir, tareas del Plan, no mandatos de espacio de soluciones.
- **Why it matters:** inflan el conteo de TC y obligan a `AC-17`/`AC-19` a verificar por revisión cosas que ya verifica el flujo del repo. Bajo impacto: el contenido es correcto.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** dejar `TC-030` y `TC-031` como están (protegen contra R1), pasar `TC-032`/`TC-034` a una línea "Convenciones: ver `AGENTS.md`".

### 10. Nombres de funciones y llamadas concretas dentro de requisitos

- **Dimension:** Methodology-invariants (`MD-01`, separación de documentos)
- **Where:** `FR-047` (`window.__showToast(…, 'error')`), `NFR-003` y `AC-12` (`sortRoster`), `TC-015` (`iniciarLecturas`), §13 (lista de funciones)
- **What:** la Spec ata la medición a `sortRoster`, cuya firma va a cambiar (hoy recibe un `modo` de cinco valores, `index.html:2575`), y a una función de toast por nombre. Citar el código existente como ancla es válido; prescribir que un test mida *esa* función es decisión de Plan.
- **Why it matters:** si el Plan renombra el comparador, `AC-12` queda apuntando a algo que no existe. `AGENTS.md` ya avisa que `tests/harness.js` recorta funciones por nombre.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "el comparador del orden" en lugar del nombre; "el aviso de error de la app" en `FR-047` (ya lo dice en prosa, sobra la llamada).

### 11. NFR-001 y NFR-003: base de los números y mezcla de medidas

- **Dimension:** Accuracy / Clarity
- **Where:** §8 `NFR-001`, `NFR-003`
- **What:** (a) `NFR-001` llama "línea de base ~620 ms de lectura" a lo que `tools/medir-arranque.js` reporta como "arranque completo" (`tools/medir-arranque.js:23-26`: incluye el hueco más la lectura de ~620 ms; objetivo ≤ 2000 ms en `:312`). El umbral de +50 ms se mide sobre el total; la base citada es sólo una parte. (b) Con 5 corridas contra la red de staging, la dispersión de la mediana puede ser mayor que 50 ms; la Spec no dice qué hacer si lo es (`AC-10` sólo pide "las dos medianas registradas"). (c) `NFR-003` junta dos medidas (no esperar a la red; ≤ 50 ms con 500 jugadores) y el 50 ms no tiene base (`OPEN-Q-14` fija el 50 ms de `NFR-001`, no éste).
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** nombrar en `NFR-001` la cantidad que se compara ("arranque completo, `tools/medir-arranque.js`"); agregar "con ≥ 5 corridas y la dispersión informada"; partir `NFR-003` y justificar el 50 ms (p. ej. "un cuadro de 60 Hz = 16 ms; 50 ms es 3 cuadros").

### 12. Regla nueva: la restricción de TC-014 sólo habla de `data`

- **Dimension:** Methodology-invariants (`MD-31`)
- **Where:** §4.2 `TC-014`; §4.5 `TC-040`
- **What:** `TC-014` prohíbe una regla comodín **sobre `data`**. La regla nueva vive en otra colección y, si se escribiera como `match /{coleccion}/{uid}`, sería un comodín sobre colecciones, que el contrato registra como propiedad que no existe (`firestore-rules.md` §2.3, Hallazgo B: "No hay catch-all", y su §3 línea 233). `TC-040` fija la condición de `uid` y `rol`, no la forma de la ruta.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** en `TC-014`: "la regla nueva tiene una ruta explícita, no un comodín sobre colecciones ni sobre `data`".

### 13. Líneas citadas que se pasan o se quedan cortas

- **Dimension:** Accuracy (`MD-26`)
- **Where:** `TC-030` (`tests/reglas.test.js:288-302`), `TC-031` (`tests/sesion.test.js:261-271`)
- **What:** `EQUIVALENCIA` ocupa `tests/reglas.test.js:288-299`, no hasta 302; el segundo `prueba` de `tests/sesion.test.js` termina en `:273`, no en `:271`. El contenido que se cita es el correcto.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** `288-299` y `261-273`.

### 14. CWE: edición verificada; pertenencia de cada identificador, no

- **Dimension:** Accuracy (`MD-26`, `MD-31`)
- **Where:** §4.5
- **What:** consulté `https://cwe.mitre.org/top25/` el 2026-10-02: la edición vigente es la **2025**, como dice la Spec. La página de inicio no lista las posiciones, así que **no verifiqué** que cada `CWE-NNN` citado (incluidos los "no aplica") esté en la lista 2025. La Spec no afirma que lo estén, por lo que no es un error; queda como deuda abierta de verificación de esta crítica. Además, `CWE-770` figura como "Allocation of Resources Without Limits" y el nombre oficial termina en "or Throttling".
- **Confidence:** High en la edición; sin dato en la pertenencia.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** citar el nombre completo de `CWE-770`; si se quiere cerrar la deuda, abrir `…/2025/2025_cwe_top25.html` y confirmar cada identificador.

## Lo que se verificó y está bien

**Citas de `index.html` (a `main` = `89f58b0`; `index.html` no cambió en esta rama).** Coinciden: `2704-2706` (atributos de arrastre), `2754-2790` (handlers), `2776-2778` (inserción antes del destino, "como hoy"), `2612-2623` (`getFiltered`), `2575-2601` (`sortRoster`), `2580` (`computeAvg`), `2591` (`ordenDePuesto`), `2696-2703` (columnas), `2088-2093` y `2107` (lecturas), `2127` (lectura del modo), `2886` (escritura), `2089` (lista de documentos), `1483` (`isAdmin`), `223` (`.roster-head{display:none}`), `2673` (celda vacía de Pos), `2678` ("Asist."), `2687` (`jugo`), `2563` (`alfabetico`), `1858` (`fullName`), `2596-2601` (orden manual con `orden` ausente al final). El corte de 760px es un `@media (min-width: 760px)` (`index.html:226`).

**Líneas de OJ en `89f58b0`.** Todos los rangos de la tabla (29-47, 53-63, 94-96, 133-138, 158-162, 186-198, 199-209, 260, 263-264, 271-274, 273, 396-406, 410-424, 455-459, 463-475, 476-478, 548-562, 591-612, 614-626, 673-674, 719-724, 728-730, 808-821) abren y cierran en lo que la tabla dice. Con las notas ya insertadas (`ddc8d62`) las líneas actuales de OJ se corrieron; la Spec lo aclara ("las líneas son las de OJ en `89f58b0`").

**Contratos y herramientas.** `firestore-rules.md` §1 (publicación a mano), §2.3 Hallazgo B (sin catch-all) y Hallazgo C, y la condición `request.auth.token.rol in ['admin','jugador']` (líneas 273-278) respaldan `TC-014`, `TC-030` y `TC-040`. `tools/medir-arranque.js` acepta `--caso=vigente`, `--corridas` y `--lecturas`. `tests/layout.test.js` ya tiene los escenarios `jugadores` (admin) y `jugadores-jugador` y los anchos 360, 759, 760, 768 y 1200 (`ANCHOS`, línea 45), con campo `spec:`, que es el binding de `AC-50`. `Roadmap.md` §3 contiene la mediana de ~620 ms y el diferido de G E P.

**Estructura (rúbrica Dim 5).** `Variants:` presente en `S-01`–`S-05`, `S-07`–`S-09` y `S-20`; `S-06` declara `Variants: none` con razón; etiquetas del conjunto cerrado. §11.5 con `AC-50`–`AC-55`. Cada TC tiene un AC en §11.3. Cada AC referencia FR/NFR/TC/S. IDs únicos y sin renumerar. `OPEN-Q-05/15/16` coinciden entre §16 y §17. D-01 a D-09 propagadas en §3.3 con sus FR. El ER (§10.1.1, 3 entidades) renderiza con `@mermaid-js/mermaid-cli` y se lee: sin rótulos superpuestos. `[UNVERIFIED]` en `A-02`, `A-05` y `A-06` con razón legítima y citados en §17. Change log con autor humano y modelo (`claude-opus-5-5`), como pide `AGENTS.md`. Posture de seguridad: las dos categorías que fijó el Concept §5.2 (autorización y validación de entrada) tienen `TC-040`–`TC-044`; no hay deriva de posture.

## Summary

- Blocking: 1
- Should fix: 7 (hallazgos 1, 2, 3, 5, 6, 7 y 8)
- Suggestions: 6 (hallazgos 9, 10, 11, 12, 13, 14)
- Methodology-invariants violated: ninguna de `MD-*` en 🔴. El bloqueo (hallazgo 4) es la obligación de reemplazo de `AGENTS.md`, no un `MD-*`. Rozados en 🔵: `MD-01` (hallazgo 10), `MD-11` (hallazgo 9), `MD-26` (hallazgos 13 y 14), `MD-31` (hallazgo 12).

