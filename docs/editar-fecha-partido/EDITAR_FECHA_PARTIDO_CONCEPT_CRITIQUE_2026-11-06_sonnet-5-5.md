# Critique — EDITAR_FECHA_PARTIDO_CONCEPT.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (el identificador de la sesión que corre esta crítica)
> **Author model:** claude-opus-5-5 (figura en el Change log del documento, filas del 2026-11-06)
> **Independence gate (Step 7.0):** familias distintas (Sonnet crítico, Opus autor), mismo proveedor. Se procede con la salvedad de nivel intermedio de la rúbrica: el proveedor compartido deja posible un sesgo residual de entrenamiento. Nota: el modelo crítico se tomó del identificador de la propia sesión, no de `/model` (el pedido sugería confirmarlo con ese comando y esta sesión no es interactiva).
> **Date:** 2026-11-06
> **Inputs:** `docs/editar-fecha-partido/EDITAR_FECHA_PARTIDO_CONCEPT.md` (sin commitear en la rama `docs/editar-fecha-partido`), contrastado contra `AGENTS.md`, `index.html`, `Roadmap.md`, `docs/001-organizacion-partidos/spec.md`, `docs/007-permisos-por-usuario/{spec,research}.md`, `docs/rol-en-el-token/contracts/firestore-rules.md`, `docs/equipos-en-el-campo/rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md` e `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md`.

## Verdict

**COMMENT** — ningún hallazgo bloqueante: la Concept Note cumple los invariantes de la metodología (secciones completas, §6.5 con las tres sub-listas, §5.2 presente, decisiones con ID y reversibilidad, §16 concreto, goals y non-goals disjuntos) y todas las citas de `index.html`, `Roadmap.md` y los specs que abrí dicen lo que el documento afirma. Hay cinco hallazgos 🟡 que conviene resolver antes de pasar a la Spec: el riesgo 5 / `OPEN-Q-02` parte de una premisa que el código parece desmentir; falta el riesgo del lado `admin` de "gana el último que guarda" y la falla silenciosa del guardado; una cita de IDs (`FR-060`) apunta a un requisito que no es el del lápiz; y `OPEN-Q-03` subestima que `007` declara taxativa su lista de restricciones de `jugador`. Crítico y autor son de familias distintas pero del mismo proveedor (ver encabezado).

## Verificación de citas (lo que abrí y lo que encontré)

Todas las anclas de línea del §6.5 se abrieron en el estado actual de `index.html`:

| Cita del documento | Resultado |
|---|---|
| `index.html:8125-8145` alta de partido, guarda `if(!isAdmin()) return; // FR-009b`, fecha obligatoria sin otra validación | ✓ (líneas 8126-8145; sólo `if(!fecha)`) |
| `index.html:1405-1426` modal "Nuevo partido" con `<input type="date" id="mFecha">`, error, Cancelar / acción | ✓ |
| `index.html:1323-1339` encabezado del detalle (`#detailFecha`, `.detail-header-fecha`, chip de estado, `.detail-header-actions` con `.admin-only`) | ✓ |
| `index.html:7648` `detailFecha` pintada con `formatFecha`, sin ramas por estado | ✓ |
| `index.html:7498`, `7508`, `7621` ordenar, tarjeta, confirmación de eliminar | ✓ |
| "Una búsqueda de `fecha` en todo `index.html` no encuentra otros usos" | ✓ — `grep` da exactamente esos cuatro usos de la propiedad (más `formatFecha`, `mFecha` y comentarios de CSS). `recomputeAllPlayerStatsFromMatches` (2398-2422) no lee la fecha: `D-05` está respaldada |
| `index.html:2475-2499` `saveMatches()` escribe `data/partidos` entero; `partidosArmado` sólo si `isAdmin()` | ✓ |
| `index.html:1596` `isAdmin()`; `index.html:107` `body.role-jugador .admin-only` | ✓ |
| `index.html:6865`, `7429-7446` `ICON_LAPIZ` y "Editar resultado" sólo para `admin` | ✓ |
| `index.html:2225-2227` `formatFecha` con `new Date(fechaISO + 'T00:00:00')` | ✓ |
| `index.html:7429-7431` comentario desactualizado ("fecha (+ cancha en dos columnas)") vs. `renderEncabezadoPartidoFinalizado`, que sólo dibuja "Resultado" | ✓ — y `PARTIDO_FINALIZADO_SPEC.md` `FR-001`/`FR-002` lo confirman (enmendados el 2026-09-04: la fecha vive en el encabezado de la pantalla) |
| `Roadmap.md:67` (reglas más finas) y `:70` ("gana el último que guarda") | ✓ |
| `001` `FR-001` y *Key Entities* (tres estados; inscripción cerrada como sí/no) | ✓ (`spec.md:102`, `:122`) |
| `007` `FR-009b` y `research.md` §3 (limitación aceptada) | ✓ |
| `firestore-rules.md` §3: `data/partidos` R/W para ambos roles | ✓ (línea 235) |
| WCAG 2.1 4.1.2, nivel A | No lo volví a consultar en la web. Coincide con lo que conozco de la norma, pero el "verificado el 2026-11-06" del documento queda como afirmación del autor, no como algo que yo haya leído hoy |

## Findings

### Per-doc — Accuracy

### 1. La premisa del riesgo 5 / `OPEN-Q-02` ("repinta y descarta el borrador") no está respaldada y el código sugiere lo contrario

- **Dimension:** Accuracy
- **Where:** `EDITAR_FECHA_PARTIDO_CONCEPT.md` §11 (riesgo 5, línea 324) y §15 `OPEN-Q-02` (línea 372)
- **What:** El documento afirma que guardar la fecha durante la edición del resultado "repinta la pantalla y descarta lo que tenía a medio cargar", sin cita ni marca `[INFERRED]`/`[UNVERIFIED]`.
- **Why it matters:** Es la única condición dentro de un estado que el documento eleva a pregunta abierta. Si la premisa es falsa, la Spec gastaría una decisión en un problema que no existe; si es verdadera, el documento debería citar por qué.
- **Evidence:** El borrador no vive en el DOM sino en estado de módulo: `resultadoDraft` y `editandoResultadoFinalizado` (`index.html:1965`, asignados en `index.html:4960-4961`). Al repintar, `renderMatchesTab()` reconstruye la vista leyendo ese estado (`index.html:5115`, `7156`, `7376`). Por eso, **inferencia mía**: repintar no descarta el borrador. No leí la rama de `7376` completa, así que no descarto un campo de entrada con texto sin confirmar que sí se pierda.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Verificar la rama de edición del resultado y reescribir el riesgo según lo que se encuentre. Si el borrador sobrevive, `OPEN-Q-02` se reduce a "¿el lápiz de la fecha queda visible durante la edición?". Mientras no se verifique, marcar la afirmación `[UNVERIFIED — no se leyó qué estado de la edición vive sólo en el DOM]` (`MD-26`).

### 4. La cita de `FR-060` y `FR-061` no describe el lápiz de "Editar resultado"

- **Dimension:** Accuracy
- **Where:** §13.1 *Upstream specs* (líneas 341-343)
- **What:** Dice "`FR-060` y `FR-061` de `PARTIDO_FINALIZADO_SPEC.md`, el lápiz de 'Editar resultado'".
- **Why it matters:** En ese spec, `FR-060` (línea 501) trata de que `jugador` ve los chips y filas de resultado; el lápiz está en `FR-006` a `FR-008` (líneas 386-392) y su ocultamiento para `jugador` en `FR-061` (línea 508). Quien siga la cita para entender el lápiz termina en un requisito equivocado. El origen probable es el comentario de `index.html:7429`, que cita "FR-060, FR-061" de otra numeración (el `FR-060` de la rebanada 3, hoy reemplazado en la parte del botón).
- **Evidence:** `PARTIDO_FINALIZADO_SPEC.md:35-38` ("`FR-060` (rebanada 3) — queda reemplazado en la parte que ubica 'Editar resultado'… se muda al encabezado") y `:386-392`, `:501-509`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Citar `FR-006`–`FR-008` y `FR-061` de `PARTIDO_FINALIZADO_SPEC.md` (con el nombre del archivo, porque `FR-060` existe en dos specs con numeraciones distintas).

### Per-doc — Consistency

### 5. `OPEN-Q-03` y §13.1 minimizan la posible modificación de `007`

- **Dimension:** Consistency
- **Where:** §13.1 (líneas 343-345) y §15 `OPEN-Q-03`
- **What:** El documento dice que "a primera lectura la feature sólo agrega comportamiento y no reemplaza ninguna parte" de los specs existentes, y deja `OPEN-Q-03` abierta en ese tono.
- **Why it matters:** `AGENTS.md` obliga a declarar explícitamente qué spec y qué parte reemplaza un documento nuevo; una omisión deja dos specs vigentes en contradicción. Hay un indicio de que sí hay algo que declarar: `PARTIDO_FINALIZADO_SPEC.md:503-504` describe la lista de restricciones de `jugador` de `007` como "taxativa". Una restricción nueva para `jugador` (no cambiar la fecha) es, leída con ese criterio, una ampliación de esa lista. Además, `007` ya tuvo un precedente de inserción lateral (`FR-009b`).
- **Evidence:** `AGENTS.md` ("Cuando un documento nuevo modifica comportamiento ya descripto en un spec existente, DEBE declararlo explícitamente"); `007/spec.md:102` (`FR-009b` sólo cubre crear y eliminar); `PARTIDO_FINALIZADO_SPEC.md:501-507`.
- **Confidence:** Medium (no leí `007` entero; sólo `FR-009b`–`FR-011` y el §3 de `research.md`)
- **Severity:** 🟡 Should fix
- **Suggested fix:** Reformular el handoff a la Spec: la restricción de `jugador` sobre la fecha no existe en ningún FR de `007`, así que la Spec debe introducirla como requisito propio y declarar la relación con `FR-009b` y con la lista de `research.md` §3. Si decide que no hay reemplazo, que lo justifique contra la palabra "taxativa".

### Per-doc — Completeness

### 2. Falta el riesgo de "gana el último que guarda" del lado del `admin`

- **Dimension:** Completeness
- **Where:** §11 Risks (riesgo 1, línea 320)
- **What:** El único riesgo de concurrencia describe a un `jugador` con sesión vieja que devuelve la fecha a la anterior. No describe la dirección inversa: un `admin` con la lista cargada antes de que los jugadores se anoten o se den de baja guarda la nueva fecha y pisa esas altas y bajas.
- **Why it matters:** `saveMatches()` escribe el arreglo completo de partidos (`index.html:2475-2499`, `JSON.stringify(publicMatches)`), así que cambiar sólo la fecha reescribe también la convocatoria con lo que el `admin` tenía en pantalla. El propio documento sitúa el caso típico en "un partido que se posterga después de abierta la inscripción", justo cuando hay altas y bajas en curso. Es una condición preexistente (`Roadmap.md:70`) pero esta feature la hace más probable.
- **Evidence:** `index.html:2475-2499`; §11 riesgo 1 ("Una sesión de `jugador`… devuelve la fecha a la anterior"); `Roadmap.md:70`. Que no haya sincronización en vivo lo sé por el Roadmap, no por haber auditado la carga de datos.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Agregar el riesgo con su mitigación de siempre ("condición preexistente, declarada en la Spec") o ampliar el riesgo 1 para que cubra las dos direcciones.

### 3. La falla del guardado es silenciosa y `D-09` la ignora

- **Dimension:** Completeness
- **Where:** `D-09` (línea 314) y §11
- **What:** `D-09` dice que el cambio "se guarda en el acto con `saveMatches()`" y se repinta, pero no considera que `saveMatches()` traga los errores (`catch(e){ console.error(e); }`, `index.html:2498`).
- **Why it matters:** Si la escritura falla (sin red, token vencido), el `admin` ve la fecha nueva en pantalla, que sólo existe en memoria, y al recargar vuelve la vieja, sin aviso. Para una feature cuyo valor es "no tener que recrear el partido", es el modo de falla más visible. El antecedente `intercambiar-colores` (`S-07c`) lo resolvió con un criterio explícito.
- **Evidence:** `index.html:2498`; `INTERCAMBIAR_COLORES_SPEC.md` referencia `S-07c` ("la falla se trata como en cualquier edición"); §11 no menciona la falla de guardado.
- **Confidence:** High sobre el código; Medium sobre si merece decisión propia
- **Severity:** 🟡 Should fix
- **Suggested fix:** Registrar el riesgo ("falla de guardado silenciosa, igual que cualquier edición hoy") y dejar una `OPEN-Q` para la Spec: ¿se acepta el comportamiento actual o la feature agrega aviso? Si se acepta, decirlo.

### 6. El orden entre partidos con la misma fecha queda sin decidir

- **Dimension:** Completeness
- **Where:** `D-04` (línea 309) y §6 *Existing system*
- **What:** `D-04` permite que dos partidos tengan la misma fecha, pero el orden de la lista depende sólo de `b.fecha.localeCompare(a.fecha)` (`index.html:7498`). En empate el resultado depende del orden en que se crearon los partidos.
- **Why it matters:** Después de mover un partido al mismo día de otro, su posición relativa no tiene regla propia, y el vision (§5) promete que "se acomodó en su lugar". Es un detalle chico y hoy ya ocurre al crear dos partidos el mismo día.
- **Evidence:** `index.html:7498`; `D-04`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Una línea en la Spec: "con fechas iguales el orden no se garantiza" o fijar el criterio.

### Per-doc — Clarity

### 7. Decisiones asentadas con nombres de símbolos del código

- **Dimension:** Clarity
- **Where:** `D-03` (`ICON_LAPIZ`, `IconButton`, `Modal`) y `D-09` (`saveMatches()`)
- **What:** Dos decisiones "Settled" nombran símbolos de implementación. La autocrítica del Change log lo aceptó apoyándose en `intercambiar-colores`.
- **Why it matters:** Lo que el Concept deja asentado se traslada a la Spec como restricción; un nombre de función puede volverse una restricción técnica falsa si se renombra. `AGENTS.md` también avisa que `tests/harness.js` recorta funciones por nombre. Es separación de documentos (`MD-01`) de bajo impacto.
- **Evidence:** `D-03`, `D-09`; Change log, fila 2.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Redactar las decisiones por comportamiento ("el ícono de lápiz que ya usa 'Editar resultado'", "se guarda igual que las demás acciones del `admin`") y dejar los símbolos para el Plan.

### 8. Las señales de éxito no son observables

- **Dimension:** Clarity
- **Where:** §12 Success signals
- **What:** "El administrador deja de eliminar y recrear partidos" y "Ninguna cuenta `jugador` reporta haber podido cambiar una fecha" no tienen forma de medirse: la aplicación no registra eliminaciones ni cambios (`D-07`).
- **Why it matters:** Son aceptables para una app entre amigos, pero cuesta declararlas "cumplidas" sin una fuente.
- **Evidence:** §12 y `D-07`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Aclarar que se juzgan por conversación con el owner, o dejarlas como están reconociendo que no hay métrica.

### Per-doc — Methodology-invariants

None ✓ (con las notas de arriba). Revisado: `D-NN` con reversibilidad; §6.5 con las tres sub-listas y citas con nota de "qué fija"; §5.1 declarada "no aplica" con motivo; §5.2 presente con las tres líneas; goals (§3) y non-goals (§4) disjuntos; §4 y §14 distintos; alternativas con motivo de rechazo; §16 con IDs concretos; `OPEN-Q-NN` con dos dígitos. No hay marcas `[UNVERIFIED]` ni `[INFERRED]` mal usadas, salvo la que se pide en el hallazgo 1 (`MD-26`).

## Lo que no encontré

Busqué y **no** hallé estos huecos, así que el documento está bien en ellos:

- Otros usos de la fecha además de los cuatro listados (estadísticas, motor, copiar formación, texto de resultado).
- Un spec que declare la fecha inmutable.
- Dependencias del orden del arreglo de partidos con la fecha (el recálculo de estadísticas recorre el arreglo sin mirarla).

## Summary

- Blocking: 0
- Should fix: 5 (hallazgos 1, 2, 3, 4, 5)
- Suggestions: 3 (hallazgos 6, 7, 8)
- Methodology-invariants violated: ninguno confirmado. `MD-26` aplica de forma leve al hallazgo 1 (afirmación sin fuente); `MD-01` de forma leve al hallazgo 7.
