# Critique — ROL_EN_EL_TOKEN_IMPLEMENTATION_PLAN.md (mode: per-doc + cross-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5 (registrado explícitamente en el propio Change log
> del Plan, §17, columna Author — a diferencia de la Spec y la Concept Note, este
> documento sí deja el modelo autor en el archivo mismo, no sólo en el contexto de
> sesión).
> **Date:** 2026-09-09
> **Inputs:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_IMPLEMENTATION_PLAN.md` (documento
> bajo crítica, íntegro) + `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` (sibling, para
> las dimensiones cross-doc Spec→Plan) + `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT.md`
> (sibling, para decision propagation Concept→Plan) + el código real (`index.html`,
> `tests/fixtures-app.js`) contra el que se verificaron por ejecución de comandos las
> citas de línea del Plan, no por lectura.
> **Independencia del modelo (Step 7.0):** familia distinta, mismo proveedor (Anthropic)
> → procede con la salvedad de nivel intermedio de independencia registrada en
> `SKILL.md` — un crítico del mismo proveedor puede compartir sesgo residual de
> entrenamiento con el autor, aunque no la misma familia de modelo. Mismo nivel de
> independencia que las dos críticas previas de esta feature (Concept Note, Spec),
> mismo crítico.

## Verdict

**COMMENT** — cero hallazgos bloqueantes. Este es, con diferencia, el documento más
sólido de los tres que la feature produjo: las cinco pasadas mecánicas de consistencia
cruzada (`FR`/`NFR`/`TC`/`AC`/`S` contra la Spec, `D` contra la Concept Note) devuelven
vacío; los 34 escenarios y variantes de Spec §9 tienen fila en §12.1 con nivel de test
justificado caso por caso; las 26 filas de §16 tienen columna `Test` poblada; las seis
obligaciones de §11.5 (`AC-50` a `AC-55`) están satisfechas con meta-gates mecánicos
verificables; y una muestra de dieciocho citas de línea a `index.html` y
`tests/fixtures-app.js` —incluidas las más específicas, como el rango exacto de
`fakeFirebase` (270-308) y las tres líneas de acceso a Firestore que sostienen `TD-08`—
se verificaron por ejecución directa contra el repositorio real, todas exactas. Los
cuatro hallazgos 🟡 de abajo son reales pero ninguno invalida una rama, un gate o una
decisión de arquitectura; los dos 🔵 son limpieza de redacción. Vale la pena resolverlos
antes de empezar a ejecutar el Plan, particularmente el primero.

## Findings

### Cross-doc — No silent drift

#### 1. `TD-02`/`TD-03` vuelven vacuo el objetivo literal de `NFR-001b`/`AC-11`, y la sustitución no se empuja como `OPEN-Q` de la Spec —a diferencia de como sí se manejó el caso gemelo de `NFR-006`

- **Dimension:** No silent drift
- **Where:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_IMPLEMENTATION_PLAN.md` §3.1 `TD-02`
  (línea 106), §12.8 (fila `NFR-001b`, línea 1178) vs.
  `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` `NFR-001b` (§8) y `AC-11` (§11.2).
- **What:** `TD-02` decide resolver el rol **antes** de revelar `appRoot`. El propio
  Plan reconoce la consecuencia: *"con TD-02 el hueco es 0 en los dos casos"* (§12.8).
  Pero `NFR-001b`/`AC-11` de la Spec están definidos, literalmente, sobre "el hueco de
  la solapa" —el Glosario de la Spec lo fija como *"tiempo transcurrido entre el
  instante en que la aplicación se vuelve visible y el instante en que la solapa
  Configuración se vuelve visible"*—, que con `TD-02` es **siempre 0 ms por
  construcción**, sin importar cuánto tarde el refresco. El Plan lo nota y compensa
  midiendo *"hueco + retención del loader"* en su lugar, una magnitud que no existe en
  la Spec (el loader es una invención de este mismo Plan, `TD-03`). Es exactamente el
  mismo tipo de consecuencia que `NFR-006` sufrió por las mismas dos decisiones —y para
  `NFR-006` el Plan **sí** generó una corrección formal de la Spec, gateada como
  primera tarea de la Rama 2 (`T-2.1`, declarada en §15.1). Para `NFR-001b`/`AC-11`, la
  misma clase de consecuencia se resuelve **dentro de §12.8**, en prosa de metodología
  de medición, sin `OPEN-Q` ni tarea de corrección de Spec equivalente.
- **Why it matters:** Un lector que sólo tenga la Spec —el escenario que `MD-01`/`MD-02`
  protegen explícitamente— leerá `AC-11` y esperará que se verifique midiendo "el hueco",
  y no sabrá que el Plan decidió medir otra cosa distinta (aunque más estricta) sin que
  la Spec lo diga en ningún lado. Es también una inconsistencia de disciplina interna:
  el propio Plan demostró, con `NFR-006`, que sabe reconocer y corregir formalmente este
  patrón exacto —lo hizo una vez y no la otra, con la misma causa raíz.
- **Evidence:** Cita textual del Plan: *"con TD-02 el hueco es 0 en los dos casos y el
  costo del refresco se paga antes de que la app aparezca. Medir sólo el hueco volvería
  el presupuesto de 400 ms vacuo. Es una lectura más estricta que la de la Spec, nunca
  más laxa"* (§12.8, fila `NFR-001b`). Comparar con el tratamiento explícito de
  `NFR-006` en §15.1: *"Hasta que T-2.1 corra, la Spec y este Plan están en desacuerdo
  en ese punto, y queda dicho acá para que no se descubra en la revisión."* Ningún
  párrafo equivalente existe para `NFR-001b`/`AC-11`.
- **Confidence:** High — la cita de la propia sección §12.8 es la evidencia; no
  requiere inferencia.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Agregar una `OPEN-Q` nueva en §15.1 (o extender `T-2.1`) que
  instruya corregir `NFR-001b` y `AC-11` de la Spec para que su métrica incluya
  explícitamente la retención del loader de sesión, con el mismo tratamiento —tarea
  gateada, primer commit de la rama que la introduce— que ya recibió `NFR-006`. La
  sustitución en sí es correcta y más estricta; lo que falta es la misma disciplina de
  disclosure ascendente que el propio Plan ya sabe aplicar.

### Per-doc — Consistency

#### 2. La línea "Spec coverage" de la Rama 1 omite `TC-042`, pese a que su propia tabla de tests (§7.2.4) lo declara cubierto ahí

- **Dimension:** Consistency
- **Where:** §7.2 Branch 1, línea "Spec coverage" (línea 264-267) vs. §7.2.4 Tests
  (línea 332).
- **What:** §7.2.4 dice explícitamente que `tests/rol-script.test.js` cubre
  `"rol/TC-042" la comparación es por igualdad exacta (Admin, ADMIN, administrador son
  inválidos)` — es decir, la Rama 1 **prueba** `TC-042`. Pero la línea "Spec coverage"
  de esa misma rama, que enumera qué `TC-*` le corresponden, no lo incluye: *"TC-003,
  TC-013, TC-030, TC-031, TC-032, TC-044, TC-045, TC-047"* — sin `TC-042`. La Rama 2 sí
  lo declara en su propia línea de Spec coverage (línea 492).
- **Why it matters:** Un agente que ejecute la Rama 1 guiándose sólo por su línea
  "Spec coverage" (que es, por diseño del Plan, el resumen que un ejecutor debería poder
  usar sin bajar al detalle de §7.2.4) no sabría que también está construyendo evidencia
  de `TC-042` ahí. No rompe ningún gate mecánico —los gates de §12 no dependen de esta
  línea resumen— pero es una discrepancia real entre dos lugares del mismo documento que
  deberían decir lo mismo.
- **Evidence:** Línea 264-267 (Spec coverage de la Rama 1) vs. línea 332 (`rol/TC-042`
  en la tabla de tests de la misma rama).
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Agregar `TC-042` a la línea "Spec coverage" de la Rama 1 (aclarando,
  si se quiere, que es cobertura duplicada/defensiva y que la Rama 2 es la responsable
  principal), o quitar la etiqueta `"rol/TC-042"` de §7.2.4 si en verdad no hace falta
  probarlo dos veces.

#### 3. `AC-13` y `AC-18` en §16 declaran "Satisfied by: Rama 3" pero su columna `Test` cita evidencia escrita en la Rama 2

- **Dimension:** Consistency
- **Where:** §16 Acceptance criteria coverage, filas `AC-13` (línea 1279) y `AC-18`
  (línea 1283).
- **What:** `AC-13` lista como test `tests/sesion.test.js "rol/S-21a"` — pero
  `"rol/S-21a"` está escrito en la Rama 2, no en la Rama 3 (§7.3.7, `T-2.14`). `AC-18`
  lista `tests/sesion.test.js "rol/TC-042"`, `"rol/TC-043"` — ambos escritos en la Rama 2
  (§7.3.7, `T-2.13`), no en la Rama 3. En los dos casos la columna "Satisfied by" dice
  únicamente `Rama 3`, cuando la evidencia real está repartida entre las dos ramas —
  exactamente el patrón que el propio documento maneja bien en otras filas (`AC-01`
  dice *"Rama 1 + Rama 2"*; `AC-15` y `AC-17` también usan la forma compuesta cuando
  corresponde).
- **Why it matters:** Si alguien revisa el PR de la Rama 3 y usa "Satisfied by: Rama 3"
  para decidir qué tests debería encontrar ahí, no encontrará `"rol/TC-042"` ni
  `"rol/S-21a"` en esa rama —porque genuinamente no están ahí, se escribieron antes—, lo
  que puede leerse como una regresión de cobertura cuando en realidad la evidencia ya
  existe, sólo que en otro PR ya mergeado.
- **Evidence:** `AC-13` línea 1279; `AC-18` línea 1283; comparar con la forma correcta en
  `AC-01` línea 1270 y `AC-15` línea 1280.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Cambiar "Satisfied by" a `Rama 2 + Rama 3` en ambas filas, igual que
  ya se hace en `AC-01`/`AC-15`/`AC-17`.

### Per-doc — Methodology-invariants

#### 4. §7.0 y §9.2.1 caracterizan el mismo hecho —el script escribe el claim, la app lo lee vía Firebase Auth— de dos formas que, leídas una al lado de la otra, parecen contradecirse

- **Dimension:** Methodology-invariants (`MD-27` árbol de decisión de arco vs. `MD-24`
  disparador de diagrama productor/consumidor)
- **Where:** §7.0 (línea 201) vs. §9.2.1 (línea 949).
- **What:** §7.0 justifica **no** usar el arco `five-branch-default` diciendo *"no hay
  par productor/consumidor entre servicios independientemente desplegables"*. §9.2.1
  dice, sobre el mismo par script↔aplicación, *"Hay un par productor/consumidor nuevo:
  el script produce el claim y la aplicación (...) lo consume"* — y por eso incluye el
  diagrama `sequenceDiagram` que `MD-24` exige "cuando la feature introduce ≥1 par
  productor/consumidor nuevo". Las dos afirmaciones son técnicamente reconciliables —el
  árbol de decisión de `MD-27` habla de servicios independientemente desplegables
  (microservicios/colas/RPC), y `MD-24` dispara con cualquier par productor/consumidor,
  sin ese calificador— pero el Plan nunca lo dice explícitamente: ninguna de las dos
  secciones usa el calificador de la otra para señalar por qué ambas son ciertas a la
  vez.
- **Why it matters:** Un lector (o un agente haciendo el chequeo mecánico de señales de
  `MD-27` descrito en la guía) que tome §9.2.1 al pie de la letra —"hay un par
  productor/consumidor nuevo"— podría concluir que la señal #3 del árbol de decisión
  aplica y que el arco debería haber sido `five-branch-default`, contradiciendo la
  declaración explícita de §7.0. La reconciliación exige conocer una distinción que vive
  en el archivo de guidance de la metodología, no en el propio Plan.
- **Evidence:** Línea 201: *"no hay par productor/consumidor entre servicios
  independientemente desplegables (Spec §9.2 no lo declara...)"*. Línea 949: *"Hay un
  par productor/consumidor nuevo: el script produce el claim y la aplicación (...) lo
  consumen, sin ningún canal directo entre ellos."*
- **Confidence:** Medium — la distinción subyacente es válida y ambas afirmaciones son
  defendibles por separado; lo que falta es la frase puente, no una corrección de fondo.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Una oración en §9.2.1 (o en §7.0) que reconcilie explícitamente las
  dos: p. ej. *"Este par productor/consumidor no es el que el árbol de §7.0 evalúa para
  `five-branch-default` —ese exige servicios independientemente desplegables con un
  canal directo (RPC/cola/evento); acá el canal es el token de Firebase Auth, no un
  contrato entre servicios propios—, pero sí dispara el diagrama requerido por `MD-24`,
  que no tiene ese mismo calificador."*

#### 5. La tabla de §7.1 tiene 4 filas de rama para un arco declarado de 3 ramas, sin una frase que reconcilie el conteo contra `MD-27`

- **Dimension:** Methodology-invariants (`MD-27`)
- **Where:** §7.0 (línea 201, declara `Arc: three-branch-scaffold-core-rollout`) vs.
  §7.1 Branch tracker (línea 228-233, 4 filas: Rama 0 a Rama 3).
- **What:** La rúbrica es explícita: *"§7.1 tracker row count (...) match the arc's
  declared branch count (rows > arc count = extra branches)"*. El arco declarado tiene 3
  ramas de código. El tracker tiene 4 filas. La fila 0 (`feat/rol-en-el-token`) está
  claramente rotulada en su columna Notes como *"Rama de documentos"*, y §5 (fila
  `Ramas`) aclara que es la rama `docs/<rebanada>` de la convención del proyecto, distinta
  de las de código que cuenta el arco — pero en ningún punto de §7.0 o §7.1 hay una
  frase que diga explícitamente "esta fila queda fuera del conteo del arco declarado
  arriba", que es justo el tipo de chequeo mecánico que la rúbrica describe.
- **Why it matters:** Bajo, porque el contenido de la fila (rotulada "documentos") ya lo
  deja claro a un lector humano — pero un chequeo mecánico ingenuo que cuente filas de
  la tabla `Branch tracker` contra el número del arco declarado (exactamente el chequeo
  que `MD-27` describe) reportaría 4 contra 3 y un falso positivo.
- **Evidence:** Línea 201 vs. líneas 229-233.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Una frase en §7.0: *"El conteo del arco (3) cubre sólo las ramas de
  código (Ramas 1-3); la Rama 0 es la rama de documentos que `AGENTS.md` → Ramas ya exige
  por separado y queda fuera de este conteo."*

### Per-doc — Accuracy

#### 6. `TD-09` agrupa `S-05a`/`S-05b` como "escenarios de rechazo", pero ninguno de los dos es un rechazo

- **Dimension:** Accuracy
- **Where:** §3.1 `TD-09` (línea 113).
- **What:** `TD-09` dice: *"Es lo que vuelve unitarios los cinco escenarios de rechazo
  (S-04b, S-04c, S-04d, S-05a, S-05b)"*. `S-04b/c/d` sí son rechazos (rol inválido,
  cuenta inexistente, llave ausente — los tres casos donde el script *"deberá rechazar
  la operación"*). `S-05a`/`S-05b` son variantes de **borde** del escenario de
  **listado** (`S-05`, modo lectura): *"ninguna cuenta sin rol: el listado lo declara
  explícitamente"* y *"todas las cuentas sin rol"* — ninguno de los dos rechaza nada; el
  listado siempre se completa. El propio §7.2.4, dos párrafos más abajo en el mismo
  documento, describe correctamente estos dos casos como parte de "el listado informa"
  y "sin cuentas huérfanas lo declara", no como rechazos.
- **Why it matters:** Bajo impacto de ejecución (ningún gate depende de esta frase, y
  §7.2.4 y la Matriz de §12.1 describen los cinco tests correctamente por separado) —
  pero es una imprecisión real en la justificación de `TD-09`, que es exactamente la
  sección que un lector consultaría para entender *por qué* el script se diseñó con el
  núcleo separado de la CLI.
- **Evidence:** Comparar la Spec, `S-05a`/`S-05b` (§9.1) —ninguna cláusula "rechazar"—
  contra `S-04b/c/d` —las tres con "deberá rechazar"—.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Cambiar la frase de `TD-09` a algo como *"los tres escenarios de
  rechazo (S-04b, S-04c, S-04d) y los dos de listado (S-05a, S-05b)"*, o simplemente
  *"cinco escenarios que no necesitan red ni credenciales"* si se prefiere no
  subdividir.

### Per-doc — Completeness

None ✓ — cada sección de la plantilla está poblada o marcada N/A con motivo (`§9.1
Migraciones` explícitamente "Ninguno", `§9.2.1` incluido pese a no ser obligatorio bajo
la lectura estricta de la señal de arco, `§8.1` explícitamente "Ninguno" con la
distinción esquema-vs-payload-de-token bien hecha); §16 tiene las 26 filas de `AC-*` con
columna `Test` poblada en las 26; §11.5 con sus seis obligaciones (`AC-50`-`AC-55`)
mapeadas a gates concretos; §15.1 y §15.2 correctamente separados y ninguno vacío; §14
con las diez filas `R-*` todas con *Mitigation task* no vacía.

### Per-doc — Clarity

None ✓ — cero rutas genéricas ("el módulo de auth"), cero bloques de código de más de
5 líneas donde una firma bastaba, cero NFR cuantificado ambiguo (los cuatro NFR
cuantificados de la rama se reconocen explícitamente por número, sin ambigüedad de a
cuáles aplica cada gate).

### Cross-doc — Decision propagation

None ✓ — cada `TD-*` cita el `FR`/`NFR`/`TC` de la Spec que lo motiva; ninguno inventa
una decisión que debería haber vivido en la Concept Note como `D-*`. Las cuatro
constraints heredadas más relevantes de la Concept Note (`D-09`, `D-10`, `D-11`, `D-12`)
se citan correctamente donde corresponde (`TD-04`, §9.3, `TD-01`/`TD-05`).

### Cross-doc — Behaviour coverage

None ✓, más allá del Hallazgo 1. Los 34 `S-NN`/variantes de Spec §9 tienen fila en
§12.1 con test corrible; los 19 `TC-*` tienen entrada en §12 (parte ejecutable en
§12.3/§12.4, parte revisor/checklist en §12.7); los cuatro `NFR-*` cuantificados tienen
medición en §12.8. Verificado mecánicamente (`comm -23` por familia) sin salida.

### Cross-doc — AC coverage

Cubierto en el Hallazgo 3 arriba (per-doc Consistency, por tratarse de una
inconsistencia interna de atribución de rama más que de una fila faltante o una columna
`Test` en blanco — las 26 filas de `AC-*` existen y ninguna tiene `Test` vacío, que es lo
que esta dimensión evalúa en sentido estricto).

### Cross-doc — Reverse-derivability

None ✓ — un lector que sólo tuviera este Plan podría reconstruir buena parte de la Spec:
cada `TD-*` cita su `FR`/`NFR`/`TC`, el módulo map cita el archivo y la línea real, y §14
cita el riesgo de seguridad concreto (`R-01`, llave filtrada) sin necesidad de leer la
Spec para entender por qué importa. Correctamente, no duplica el "por qué" de la Concept
Note (§9 alternativas) ni la motivación de negocio de la Spec (§2 Summary).

## Summary

- Blocking: 0
- Should fix: 4
- Suggestions: 2
- Methodology-invariants violated: ninguno en sentido estricto (`MD-27`, hallazgos 4 y 5,
  son ambigüedades de redacción sobre invariantes reales, no violaciones de las
  invariantes mismas — el arco elegido es válido y está en el vocabulario cerrado; el
  conteo de filas es correcto una vez que se sabe qué fila excluir)

**Lo que verificó limpio por ejecución directa, no por lectura:** las tres líneas de
acceso a Firestore que sostienen `TD-08` (`index.html:1357`, `:1367`, `:1407` — exactas,
y son las únicas tres en el archivo); el único llamador de `resolveSession()`
(`index.html:7144`, confirma la premisa de `TD-01`); las líneas exactas de
`ROL_HINT_KEY`/`leerRolHint`/`guardarRolHint` (1885/1886/1890) y de la llamada a
`guardarRolHint` que hay que quitar (7146); el rango exacto de `fakeFirebase` en
`tests/fixtures-app.js` (270-308, cierre de función en 308 antes del `module.exports` en
310); el comentario de bloque sobre `resolveSession` que `T-2.3` promete actualizar
(1398-1402, confirma que hoy explica una razón que la feature vuelve obsoleta); y los
cinco `comm -23` de consistencia cruzada (`FR`/`NFR`/`TC`/`AC`/`S` contra la Spec, `D`
contra la Concept Note), que devolvieron vacío en los cinco casos.

---

*Esta crítica es de sólo lectura: no modifica el Implementation Plan. El autor decide
qué hallazgo resolver y cómo. Ningún hallazgo bloquea comenzar a ejecutar el Plan.*
