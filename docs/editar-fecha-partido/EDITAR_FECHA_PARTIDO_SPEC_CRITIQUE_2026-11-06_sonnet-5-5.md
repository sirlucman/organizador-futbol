# Critique — EDITAR_FECHA_PARTIDO_SPEC.md (per-doc + cross-doc contra la Concept Note)

> **Critic model:** claude-sonnet-5-5 (esta sesión)
> **Author model:** claude-opus-5-5 (figura en el Change log de la Spec, §18)
> **Independencia (Step 7.0):** familias distintas, mismo proveedor (Anthropic). Se procede con la salvedad de que un crítico del mismo proveedor puede compartir sesgos residuales de entrenamiento con el autor.
> **Date:** 2026-11-06
> **Inputs:** `docs/editar-fecha-partido/EDITAR_FECHA_PARTIDO_SPEC.md` (+ `EDITAR_FECHA_PARTIDO_CONCEPT.md`, `AGENTS.md`). Anclas de línea del commit `004529c` (`git rev-parse` en la corrida: `004529c`).
> **Modo:** per-doc sobre la Spec y cross-doc Concept ↔ Spec, en dos barridos separados dentro del mismo reporte por pedido del owner. Reporte de solo lectura: no se editó ningún documento.

## Verdict

**CHANGES REQUESTED** — hay 1 hallazgo bloqueante (🔴). La Spec es sólida: todas las citas de código de `index.html` que verifiqué coinciden con el archivo, las seis `OPEN-Q` y las nueve decisiones `D-01`–`D-09` quedaron reflejadas, y la lista CWE Top 25 2025 de §4.5 coincide con la fuente. El bloqueo es que la Declaración de reemplazo sobre `007` deja sin hacer lo que `AGENTS.md` pide (marcar la parte reemplazada en el spec viejo) y lo delega al Plan. Hay además 4 🟡 y 7 🔵, sobre todo de claridad y trazabilidad hacia la Concept Note. *Salvedad de independencia: crítico y autor son de familias distintas del mismo proveedor.*

## Verificación de citas (MD-26)

Todo lo siguiente lo leí en el archivo real; nada se tomó de la Spec como prueba.

| Cita de la Spec | Resultado |
|---|---|
| `index.html:1323-1339`, `1326-1329` (encabezado, `.detail-header-fecha`) | ✓ coincide |
| `index.html:1405-1426` (`#newMatchModal`) | ✓ |
| `index.html:2225-2229` (`formatFecha`), `7498` (orden), `7508` (tarjeta), `7621` (confirmar eliminar), `7648` (`textContent`) | ✓ |
| `index.html:2475-2499` (`saveMatches`), `2497` (`partidosArmado` sólo `admin`) | ✓ |
| `index.html:6865` (`ICON_LAPIZ`), `7438-7442` (lápiz de "Editar resultado"), `882-883` (`.panel-icono`) | ✓ |
| `index.html:7618` y `8134` (guarda `if(!isAdmin()) return; // FR-009b`) | ✓ |
| `index.html:8126-8131`, `8137`, `8138`, `8139` (alta de partido, mensaje de error, `push`) | ✓ |
| `index.html:1964-1965`, `7143` (borrador del resultado) | ✓; además `editandoResultadoFinalizado` se relee en el repintado (`7156`, `7376`), así que `FR-002b` está respaldado también para el finalizado |
| `007/spec.md` línea 139 (lista "taxativa") y línea 107 (`FR-014`) | ✓ ambas |
| `007/research.md` §3 (lista de manejadores) | ✓ |
| `firestore-rules.md` §3 ("sigue vigente la limitación aceptada") | ✓ (línea 235) |
| `PARTIDO_FINALIZADO_SPEC.md` `FR-006`–`FR-008`, `FR-061` | ✓ |
| `INTERCAMBIAR_COLORES_SPEC.md` `S-07c` | ✓ (misma redacción) |
| `handoff/README.md` § "Botones de ícono del header"; `IconButton.prompt.md` ("Always pass `label`…") | ✓ |
| `001` Key Entities (tres estados + inscripción cerrada como campo aparte) | ✓ |
| `Roadmap.md:67` y `:70` | ✓ |
| `TC-031`: el prefijo `fecha/` no lo usa otra feature | ✓ (`grep -rln "fecha/" tests/` sin resultados); y el esquema de prefijo ya existe (`colores/`, `rol/`, `orden/`) |
| Lista CWE Top 25 2025 de §4.5 | ✓ coincide con `cwe.mitre.org/top25/archive/2025/…`, traída en vivo: las 25 entradas están, cada una comprometida o descartada |
| Concept: la fecha sólo se lee en cuatro lugares; no hay `onSnapshot` | ✓ (`grep` de `.fecha`: 7498, 7508, 7621, 7648; `onSnapshot`: 0 coincidencias) |
| Concept/Spec A-02: `matches` nunca se reordena | ✓ (no hay `sort/unshift/splice` sobre `matches`; sólo `push` en `8139`) |
| `A-01` (HTML Living Standard) y `A-02` (MDN) | **No re-verificadas por este crítico** (no se refetchearon). La Spec las declara verificadas el 2026-11-06 |

Una inexactitud menor de cita aparece más abajo como hallazgo 🔵 (WCAG 4.1.2 aplicado al tamaño de 44 px).

## Findings

### Per-doc — Accuracy

### 1. WCAG 4.1.2 citado como base del objetivo táctil de 44 × 44 px

- **Dimension:** Accuracy
- **Where:** `EDITAR_FECHA_PARTIDO_SPEC.md` §8 `NFR-002` (línea 331)
- **What:** el paréntesis "(WCAG 2.1, criterio 4.1.2)" cuelga de toda la oración, que incluye el objetivo de al menos 44 × 44 px; 4.1.2 es *Name, Role, Value* y no dice nada del tamaño.
- **Why it matters:** quien audite el NFR contra WCAG buscará el criterio de tamaño (2.5.5 en AAA, 2.5.8 en 2.2) y no lo encontrará; la base real del 44 px es el precedente `.panel-icono`.
- **Evidence:** "tiene el nombre accesible y el título "Editar fecha" … y un objetivo táctil de al menos 44 × 44 px, el tamaño de `.panel-icono` (WCAG 2.1, criterio 4.1.2)". Verifiqué `.panel-icono{ width: 44px; height: 44px }` en `index.html:882`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** acotar la cita al nombre accesible y justificar el 44 px sólo con el precedente de `.panel-icono` (`TC-030`).

### Per-doc — Consistency

### 2. `S-01g` dice "a lo sumo un pedido" y `NFR-004` dice "exactamente uno"

- **Dimension:** Consistency
- **Where:** §9.1 `S-01g` (línea 369) vs §8 `NFR-004` (línea 333)
- **What:** el escenario acepta 0 ó 1 pedidos de guardado; el NFR exige exactamente 1 cuando hay cambio de fecha.
- **Why it matters:** un doble toque que no guardara nada pasaría `S-01g` y violaría `NFR-004`. `AC-13` verifica `NFR-004` contando pedidos en `S-01g`, así que el criterio de aceptación depende de cuál texto manda.
- **Evidence:** "`S-01g [concurrency]` — doble toque en "Guardar": la fecha cambia una vez y se hace a lo sumo un pedido de guardado" / "un cambio de fecha hace exactamente uno".
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** alinear `S-01g` a "exactamente un pedido". Se combina con el hallazgo 5.

### Per-doc — Completeness

### 3. Casos borde de la lista de edge cases que no tienen escenario

- **Dimension:** Completeness
- **Where:** §9 (`S-01`–`S-21`), `FR-046`, `FR-045`
- **What:** tres huecos de cobertura acotados:
  1. `FR-046` dice "a ningún rol", pero `S-05` sólo verifica al jugador; no hay escenario ni variante que verifique que el `admin` tampoco ve ningún aviso al guardar.
  2. `FR-004` cubre "apertura o guardado invocados directamente", y `S-21a`/`S-21b` los cubren, pero ninguno cubre la invocación directa de un `admin` sobre un partido que no existe (`matches.find` vacío). El manejador de eliminar ya hace `if(!m) return` (`index.html:7619-7620`), así que el patrón existe y la Spec no lo exige.
  3. `S-05a` (sesión de jugador abierta desde antes) se rotula `[boundary]`, pero es el caso canónico de `[concurrency]` (dos sesiones, estado viejo en memoria).
- **Why it matters:** son huecos pequeños, pero (3) afecta cómo se agrupan las variantes en el Plan §12.1 y (1) deja un `FR` sin test que lo ejerza del lado `admin`.
- **Evidence:** `FR-046` "a ningún rol"; `S-05` "no ve el lápiz … ni ningún aviso" (sólo jugador); `S-05a [boundary]`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** sumar una variante `S-01i [boundary]` ("después de guardar, el admin tampoco ve ningún aviso", `FR-046`); decidir si el id inexistente merece una variante `[failure]` de `S-21`; recalificar `S-05a` como `[concurrency]`.

### Per-doc — Clarity

### 4. Requisitos funcionales que siguen siendo compuestos

- **Dimension:** Clarity (y EARS, `MD-03`)
- **Where:** §7 `FR-004` (línea 246), `FR-010` (252), `FR-013` (261), `FR-041` (293), `FR-043` (299), `FR-045` (308)
- **What:** la autocrítica del autor partió `FR-002` y `FR-011` por compuestos, pero otros siguen el mismo patrón: `FR-004` junta dos disparadores ("la apertura de la ventana … o su guardado") y dos resultados ("no modificará el partido ni lo guardará"); `FR-041` junta "cerrará la ventana y repintará el detalle"; `FR-045` mezcla el comportamiento nuevo con la aclaración de que no hay sincronización en vivo; `FR-013` enumera cuatro propiedades de la ventana en modo alta.
- **Why it matters:** una obligación por línea es el criterio con el que el propio autor resolvió dos 🔴 en la autocrítica; aplicarlo a dos y no al resto deja el criterio a medias. Para el Plan, un FR compuesto hace ambiguo cuál de sus partes cubre cada test.
- **Evidence:** `FR-004`: "Si el rol de la sesión no es `admin` y la apertura de la ventana en modo edición o su guardado se invocan directamente, entonces el sistema no modificará el partido ni lo guardará". Changelog de la Spec: "`FR-002` y `FR-011` eran compuestos (EARS, una obligación por línea) y se parten".
- **Confidence:** Medium. `FR-010` y `FR-013` describen un estado de pantalla y se pueden defender como una sola obligación; `FR-004` y `FR-041` son los claros.
- **Severity:** 🟡 Should fix (la rúbrica §5.2 lo trataría como invariante de EARS; lo bajo a 🟡 porque ningún test se ata a `FR-*` directamente, `TC-031`, y el daño es de legibilidad y mapeo)
- **Suggested fix:** partir `FR-004` en `FR-004` (apertura) y `FR-004b` (guardado) —el sufijo ya existe en `FR-002b`/`FR-011b`—; partir `FR-041`; mover la aclaración de `FR-045` a `§14` como supuesto.

### 5. `NFR-004` no define qué es un "pedido de guardado" y con la lectura natural falla

- **Dimension:** Clarity
- **Where:** §8 `NFR-004` (línea 333); `AC-13`; `S-01g`, `S-03`, `S-04`
- **What:** el NFR cuantifica "exactamente uno" sin decir la unidad. `saveMatches()` hace **dos** `window.storage.set` cuando la sesión es `admin` (`partidos` y `partidosArmado`, `index.html:2492` y `2497`), y esta feature sólo la usa un `admin`.
- **Why it matters:** un test que cuente llamadas a `storage.set` verá 2 y reprobará un comportamiento correcto; uno que cuente invocaciones de `saveMatches()` verá 1. Con el texto actual los dos son legítimos y el AC no decide. Lo mismo vale para el "cero pedidos" de cancelar o validar.
- **Evidence:** `index.html:2492` `await window.storage.set('partidos', …)`; `:2497` `if(isAdmin()) await window.storage.set('partidosArmado', …)`. La propia Spec lo sabe: §10.2 dice "El guardado de siempre lo reescribe para `admin` (index.html:2497)".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** definir la unidad en `NFR-004`: "un pedido de guardado = una invocación de `saveMatches()`" (la interfaz `window.storage` queda debajo, `TC-001`), y alinear `S-01g` (hallazgo 2).

### Per-doc — Methodology-invariants

### 6. La Declaración de reemplazo deja pendiente la marca en `007` que `AGENTS.md` exige

- **Dimension:** Methodology-invariants (gobernanza, `AGENTS.md`)
- **Where:** `EDITAR_FECHA_PARTIDO_SPEC.md` cabecera (líneas 17-38) y §17 "Plan must also" (líneas 640-645)
- **What:** `AGENTS.md` dice que, cuando un documento nuevo modifica comportamiento de un spec existente, "DEBE declararlo explícitamente: qué spec y qué parte reemplaza. Esa parte queda marcada como reemplazada en el spec viejo". La Spec hace la declaración, pero la marca en `007` la deja como tarea del Plan.
- **Why it matters:** los dos documentos van en la misma rama `docs/<rebanada>` (`AGENTS.md` § Ramas: Spec e Implementation Plan se mergean primero), así que nada impide que la marca viaje con la Spec. Si se mergea la Spec sin la marca, `007` línea 139 ("Lo que no está explícitamente restringido … permanece disponible para 'jugador'") queda diciendo lo contrario de lo que la Spec vigente exige, y el Plan —que puede tardar o cambiar de alcance— es lo único que corrige la contradicción. Es el mismo riesgo que `AGENTS.md` cita ("dos specs vigentes se contradicen") y hay precedente de marca inmediata en el mismo repo (el banner "⚠️ Reemplazado en parte (2026-09-09)" de `007/spec.md` líneas 9 y 111, que sí está puesto).
- **Evidence:** "**Plan must also:** anotar la ampliación en `007-permisos-por-usuario/spec.md` (línea 139 y `FR-014`)". Nota: el precedente `INTERCAMBIAR_COLORES_SPEC.md` también tiene una Declaración, pero sobre otro spec (`PANEL_ARMADO_SPEC.md`).
- **Confidence:** High en la lectura de `AGENTS.md`; Medium en que la marca deba hacerse en esta rama y no en la del Plan (lo segundo es una interpretación del orden de ramas).
- **Severity:** 🔴 Blocking
- **Suggested fix:** hacer la marca en `007/spec.md` (línea 139 y `FR-014`) en el mismo commit que aprueba la Spec, o declarar en la Spec por qué se difiere y a qué rama, y sacar de "Plan must also" lo que ya no sea una tarea de código. Mantener en el Plan sólo la actualización de `research.md` §3.

### 7. Corrección sobre el alcance de la Declaración: `AGENTS.md` no exige tocar `research.md`

- **Dimension:** Accuracy
- **Where:** §17 "Plan must also" (líneas 640-642)
- **What:** la Spec dice que sumar los manejadores a la lista de `research.md` §3 es algo que "exige `AGENTS.md`". `AGENTS.md` exige marcar *el spec viejo*; `research.md` es un documento de investigación, no un spec. Además el precedente más cercano (`intercambiar-colores`, otra acción de `admin` con guarda en la aplicación) no actualizó esa lista: `research.md` §3 sólo enumera los siete manejadores de `007` (`__addToMatch` … `__deleteMatch`) y `grep` no encuentra `__intercambiarColores` en `docs/007-permisos-por-usuario/`.
- **Why it matters:** presentar una buena práctica como obligación de gobernanza confunde qué se puede omitir sin romper reglas; no cambia el diseño.
- **Evidence:** `grep -rn "__intercambiarColores\|intercambiar" docs/007-permisos-por-usuario/` sin resultados.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** reescribir como "conviene sumar" o retirar la referencia a `AGENTS.md` para esa parte.

### 8. Dos `OPEN-Q` del owner fueron cerradas por el autor, y `§16` las presenta como resueltas

- **Dimension:** Methodology-invariants (`MD-10`: honest unknowns)
- **Where:** §16 (líneas 625-628), Change log (fila 1, línea 652); Concept §15 (columna *Owner*)
- **What:** el Change log admite "Resueltas por el autor con la opción sin alcance nuevo: `OPEN-Q-03` … y `OPEN-Q-06`". En la Concept Note ambas tienen como *Owner* a Lucas Manoukian; la Spec las declara "Ninguna abierta" y el handoff las congela ("no relitigation").
- **Why it matters:** una decisión que el modelo tomó por el owner queda indistinguible de una decisión del owner. La resolución de `OPEN-Q-06` (sin desempate nuevo) es razonable y reversible; la de `OPEN-Q-03` define un criterio de gobernanza (ampliar la lista taxativa de `007`). El resto de las decisiones del owner sí están fechadas y atribuidas.
- **Evidence:** "§16 Open questions — Ninguna abierta. Resueltas en esta Spec las seis del Concept Note".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** marcar `OPEN-Q-03` y `OPEN-Q-06` con `[INFERRED — resuelta por el autor, pendiente de confirmación del owner]` en §16 y listarlas en §17 como confirmación pendiente, o registrar la confirmación del owner con fecha.

### 9. Las decisiones nuevas del owner no tienen un registro fuera del Change log

- **Dimension:** Accuracy (`MD-26`, atribución de decisiones)
- **Where:** §3.3 (`D-03`: "El owner confirmó el 2026-11-06…"), `TC-011` ("Decisión del owner del 2026-11-06"), `FR-003`, Change log
- **What:** cuatro decisiones de producto de la Spec (lápiz de sólo ícono "Editar fecha" elegido entre cuatro variantes, lápiz visible también durante la carga del resultado, la ventana es *la misma* reutilizada, guardar sin cambios no escribe) se atribuyen al owner del 2026-11-06, pero el único registro es el propio Change log de la Spec. La Concept Note tiene un Apéndice §17 con las respuestas del owner; la Spec no tiene un equivalente.
- **Why it matters:** quien lea la Spec sin la conversación no puede distinguir una decisión del owner de una del autor; es el mismo problema del hallazgo 8, en menor escala.
- **Evidence:** "El owner confirmó el 2026-11-06 que la ventana es *la misma* de "Nuevo partido", reutilizada, y no una copia".
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar al final de la Spec un apéndice corto con las respuestas del owner, como en la Concept Note §17.

### Cross-doc — Decision propagation

Las nueve decisiones están reflejadas:

| Decisión | Dónde en la Spec | Comentario |
|---|---|---|
| D-01 | §3.3; `FR-001`, `FR-003`, `FR-004`, `TC-040` | ✓ |
| D-02 | §3.3; `FR-001`, `FR-002` | ✓ (tres estados + inscripción cerrada, con el matiz de `001`) |
| D-03 | §3.3; `FR-001`, `FR-010`–`FR-013`, `TC-011`, `TC-012`, `TC-030` | ✓ pero endurecida: ver hallazgo 10 |
| D-04 | §3.3; `FR-020`, `FR-021` | ✓ pero endurecida: ver hallazgo 10 |
| D-05 | §3.3; `FR-030`, `FR-031`, `NFR-003` | ✓ |
| D-06 | §3.3; `TC-014`, `TC-040`, Declaración | ✓ |
| D-07 | §3.3; `FR-046`, `TC-013` | ✓ |
| D-08 | §3.3; `FR-060`, `TC-010` | ✓ |
| D-09 | §3.3; `FR-040`, `FR-041`, `TC-001` | ✓ |

### 10. Dos decisiones "settled" de la Concept Note quedaron endurecidas en la Spec sin una fila en el Concept

- **Dimension:** No silent drift (Dim X4)
- **Where:** Spec §3.3 (`D-03`), `TC-011`, `FR-020`, `TC-041`; Concept §10 `D-03` y `D-04`, §18 Change log
- **What:** dos diferencias reales:
  1. `D-03` dice que la ventana tiene "la misma forma que 'Nuevo partido'"; `TC-011` exige que sea *la misma ventana* (`#newMatchModal`) y prohíbe una segunda. El autor lo sabe (su autocrítica sugiere "una fila en el Change log del Concept Note") y la Spec lo atribuye al owner, pero el Concept no se actualizó.
  2. `D-04` dice que la validación "es la misma que al crear (`FR-001` de `001`)"; `FR-020`/`TC-041` rechazan además un valor no vacío que no sea fecha real (p. ej. un año de cinco cifras), cosa que el alta de hoy acepta (`index.html:8137`: sólo `if(!fecha)`). Resultado: dentro de la misma ventana y con el mismo botón, el modo edición es más estricto que el modo alta, que conserva el hueco (`A-01`: "queda fuera de esta Spec").
- **Why it matters:** la Concept Note está marcada como "Settled (do not relitigate)" y ya no describe lo que la Spec decide; cualquiera que derive el Plan desde el Concept leerá un criterio más débil. No es una deriva *silenciosa* —la Spec lo declara— pero la decisión no se propagó hacia arriba. Además, el hueco del alta (que produce "Invalid Date" en `formatFecha`, porque `new Date('20260-11-15T00:00:00')` no es válido) es un bug conocido que la Spec decide no corregir; si se acepta, conviene que el Roadmap lo registre.
- **Evidence:** Concept `D-04`: "es la misma validación que al crear (`FR-001` de `001`)". Spec `FR-020`: "El caso no vacío existe porque el selector acepta años de más de cuatro cifras (`A-01`)".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar una fila al Change log del Concept Note que enmiende `D-03` ("misma ventana") y `D-04` ("validación estricta en edición; el alta conserva su hueco"), y, si el owner lo acepta, sumar la idea "validar la fecha también al crear" a `Roadmap.md`.

### 11. `OPEN-Q-01`: la Concept Note pregunta cómo se distingue "a simple vista"; la Spec responde sólo con nombre y ubicación

- **Dimension:** Decision propagation (resolución de `OPEN-Q`)
- **Where:** Concept §15 `OPEN-Q-01`; Spec §16, `NFR-002`, `S-06`, §15 (riesgo "Dos lápices")
- **What:** la pregunta tenía dos partes: el nombre accesible y la distinción a simple vista entre dos lápices iguales. La Spec fija el nombre ("Editar fecha", `NFR-002`) y la ubicación (`TC-012`, `S-06`) y descarta una diferencia visual por decisión del owner (el mismo ícono). Es una resolución legítima, pero la parte "a simple vista" queda resuelta por ubicación y no por una propiedad verificable: ningún escenario mide, por ejemplo, la distancia entre los dos lápices en el partido finalizado a 360 px, donde el encabezado y la tarjeta del resultado quedan apilados.
- **Why it matters:** bajo. El riesgo está declarado y la consecuencia de tocar el lápiz equivocado es nula hasta guardar.
- **Evidence:** §15: "Nombres accesibles distintos (`NFR-002`), ubicaciones distintas (`TC-012`) y `S-06`".
- **Confidence:** Low
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar a `S-06` una aserción de que los dos lápices del finalizado no se superponen en 360 px, o aceptar explícitamente en §16 que la distinción visual es sólo contextual.

### Estado de las seis `OPEN-Q`

| OPEN-Q | Resolución en la Spec | Evaluación |
|---|---|---|
| 01 (nombre accesible / distinción) | `NFR-002`, `FR-001`, decisión del owner | Resuelta; ver hallazgo 11 |
| 02 (lápiz visible durante la carga del resultado) | `FR-002`, `FR-002b`, `S-01b`, `S-01d` | Bien resuelta y respaldada por el código (`1964-1965`, `7143`, `7156`, `7376`) |
| 03 (relación con `007`) | Declaración de reemplazo | Correcta en el análisis (líneas 139 y 107 verificadas), insuficiente en la ejecución: hallazgos 6 y 8 |
| 04 (guardar sin cambios) | `FR-032`, `S-04`, `S-04a`, `NFR-004` | Bien resuelta |
| 05 (guardado que falla) | `FR-044`, `S-01h`, precedente `S-07c` | Bien resuelta; la precedencia coincide |
| 06 (orden con fechas iguales) | `FR-050`, `S-02a`, `A-02` | Bien resuelta y verificada (sort estable; `matches` sólo crece por `push`); ver hallazgo 8 sobre quién la cerró |

### Cross-doc — Behaviour coverage / AC coverage / Reverse-derivability

No se evalúan contra un Plan porque el Plan todavía no existe (`Implementation plan: not yet written`). Dentro de la Spec:

- Todo `TC-*` de §4 tiene al menos un AC en §11.3 (`TC-001`/`002`→AC-15, `010`→16, `011`/`012`→17, `013`→18, `014`→19, `030`→20, `031`/`032`→21, `040`→22, `041`→23). ✓
- Todo `NFR-*` está atado a un AC de §11.2. ✓
- Todo encabezado de escenario de §9 va seguido de `Variants:` o de `Variants: none — single-path scenario` (`S-07`). ✓
- §11.5 tiene `AC-50`–`AC-55`. ✓
- La Spec puede reconstruir el problema, la visión y las alternativas de la Concept Note desde §1, §2, §3.2 y §14. ✓

### 12. `AC-54` exige `OBS-*` para cada NFR en una app que declara no tener telemetría

- **Dimension:** Completeness / Reverse-derivability (para el Plan)
- **Where:** §11.5 `AC-54`; §12 Success metrics; `D-07`
- **What:** `AC-54` pide al menos una fila `OBS-*` en el Plan por cada NFR cuantificado (cuatro), y §12 declara "app de un solo grupo, sin telemetría". La Spec no dice cómo se satisface `AC-54` en ese contexto.
- **Why it matters:** el Plan tendrá que inventar una respuesta (por ejemplo, el propio test como "señal"). Mejor que la Spec fije el criterio y no que cada Plan lo improvise.
- **Evidence:** "`AC-54` — Todo NFR cuantificado en §8 tiene al menos una fila `OBS-*` en el §11 del Plan" y "(app de un solo grupo, sin telemetría, `D-07`)".
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar una nota en §11.5 o §17: "sin telemetría, la señal de cada `OBS-*` es el test que mide el NFR (`NFR-001` → escenario de `layout.test.js`, etc.)", como ya hizo `intercambiar-colores` si tiene precedente (no verificado por este crítico).

## Summary

- Blocking: 1 (hallazgo 6)
- Should fix: 4 (hallazgos 4, 5, 8, 10)
- Suggestions: 7 (hallazgos 1, 2, 3, 7, 9, 11, 12)
- Total: 12 hallazgos.
- Methodology-invariants violated: `AGENTS.md` (gobernanza de reemplazo, marca en el spec viejo); `MD-03` (EARS, parcial, bajado a 🟡 por criterio explícito); `MD-10` (incertidumbre honesta, hallazgo 8).

## Limitaciones de esta crítica

- No se ejecutaron tests ni la aplicación (la crítica es de lectura).
- `A-01` (HTML Living Standard) y `A-02` (MDN) no se refetchearon; sólo se verificó la lista CWE Top 25 2025.
- No se midió el layout real a 360 px: `NFR-001`/`S-06` quedan para el Plan y `tests/layout.test.js`.
- Crítico y autor comparten proveedor; los hallazgos más probables de perderse son los que dependen de un sesgo compartido.
