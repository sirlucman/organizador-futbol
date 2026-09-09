# Critique — ROL_EN_EL_TOKEN_SPEC.md (mode: per-doc + cross-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5 (según el contexto de esta sesión — ni la Spec ni la
> Concept Note registran el modelo autor en un campo propio; sus Change logs sólo
> registran el nombre humano "Lucas Manoukian" en la columna Author, que es lo que pide
> la plantilla. Este dato no debe tomarse como una cita verificada del documento mismo
> — es la única fuente disponible, la propia continuidad de esta sesión.)
> **Date:** 2026-09-09
> **Inputs:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` (documento bajo crítica) +
> `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT.md` (sibling, para las dimensiones
> cross-doc) + `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT_CRITIQUE_2026-09-09_sonnet-5.md`
> (crítica independiente previa, de la Concept Note, hecha en esta misma sesión — su
> Hallazgo 1 resultó directamente relevante para esta Spec; ver Hallazgo 1 abajo).
> **Independencia del modelo (Step 7.0):** familia distinta, mismo proveedor
> (Anthropic) → procede con la salvedad de nivel intermedio de independencia registrada
> en `SKILL.md` — un crítico del mismo proveedor puede compartir sesgo residual de
> entrenamiento con el autor, aunque no la misma familia de modelo.

> **Nota de proceso.** Al guardar este reporte se detectó que el nombre de archivo por
> defecto de la plantilla (`{{FEATURE}}_CRITIQUE_{{fecha}}_{{crítico}}.md`) colisionaba
> con la crítica ya existente de la Concept Note, escrita antes en esta misma sesión:
> ambas críticas, del mismo crítico, el mismo día, comparten esa plantilla de nombre sin
> ningún campo que distinga *qué documento* se critica. El primer intento de guardado
> sobrescribió esa crítica anterior; se detectó por el diff de git antes de continuar, se
> restauró el archivo original sin pérdida, y este reporte se guardó bajo un nombre
> distinto (`..._SPEC_CRITIQUE_...`). Vale la pena que la Spec o el Plan dejen una nota
> para que la convención de nombres de futuras críticas incluya el documento crítico
> explícitamente, no sólo fecha y crítico.

## Verdict

**CHANGES REQUESTED** — dos hallazgos bloqueantes y tres a corregir. Ninguno pone en
duda el contenido central de la Spec — EARS, GWT, disciplina de TC, cobertura AC↔TC,
bloques de Variants y las seis obligaciones de §11.5 verifican limpio, y el CWE Top 25
de 2025 se contabilizó exacto, las 25 categorías, sin faltantes ni duplicados — pero los
dos 🔴 son exactamente la clase de hallazgo que una crítica del mismo modelo tiende a no
ver: uno es una inconsistencia de disciplina dentro del propio documento (un diagrama
nuevo sin la misma verificación que el documento hermano ya exige de sí mismo); el otro
es una brecha que **ya había sido señalada** por una crítica independiente anterior del
mismo crítico sobre la Concept Note, y que sobrevivió sin resolverse hasta un
constraint de seguridad concreto de esta Spec.

## Findings

### Per-doc — Accuracy

#### 1. `S-04a` afirma una propiedad de idempotencia que ningún FR respalda

- **Dimension:** Accuracy
- **Where:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` §9.1, variante `S-04a` (línea 418)
- **What:** La variante dice *"se asigna el mismo rol que la cuenta ya tenía: la
  operación es idempotente y no deja el registro inconsistente"*, pero ningún `FR-020`
  a `FR-027` establece la idempotencia como obligación del script.
- **Why it matters:** Un test que implemente `S-04a` terminará verificando un
  comportamiento que la Spec nunca prometió formalmente. Si el Plan lo toma al pie de
  la letra, se testea una propiedad sin `FR-*` que la respalde; si el Plan la ignora
  por no encontrarla en §7, `S-04a` queda sin verificación real pese a tener un ID.
- **Evidence:** `FR-022` sólo exige que "el script deberá dejar el registro de roles
  reflejando el mismo valor que quedó en el claim" tras completar una asignación — no
  dice nada sobre reasignar el mismo valor dos veces.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Agregar una cláusula a `FR-020` o `FR-022` ("reasignar el mismo
  rol a una cuenta que ya lo tiene no debe alterar el resultado ni fallar") para que
  `S-04a` cite una obligación real, o suavizar la variante para no prometer más de lo
  que §7 exige.

### Per-doc — Consistency

#### 2. `AC-04` no verifica lo que dice cubrir

- **Dimension:** Consistency
- **Where:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` §11.1, `AC-04` (línea 554)
- **What:** `AC-04` dice *"No queda en el repositorio ninguna referencia a la pista de
  rol en el almacenamiento del navegador (cubre `FR-008`, `FR-032`, `NFR-005`)"*. Pero
  `FR-032` exige la ausencia de código que lea la colección `userRoles` de **Firestore**
  — un camino de código completamente distinto del que describe la evidencia de este
  AC (referencias a la pista de `localStorage`).
- **Why it matters:** Si alguien verifica `AC-04` literalmente —grep de la pista de
  `localStorage`— puede darlo por cumplido con un `db.collection('userRoles').get()`
  todavía vivo en algún lado, porque esa búsqueda nunca lo tocaría. Es exactamente el
  patrón "AC references that don't match the FR/NFR/TC they cite" que la rúbrica nombra.
- **Evidence:** El texto de `AC-04` habla sólo de "almacenamiento del navegador"; no
  menciona Firestore ni la colección `userRoles` en ningún momento.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Partir en dos: `AC-04` para `FR-008`/`NFR-005` (la pista de
  `localStorage`, con su evidencia actual), y un `AC-04b` nuevo para `FR-032` cuya
  evidencia sea explícitamente "ninguna referencia a `userRoles` en el código de la
  aplicación (`grep -n userRoles index.html` sin resultados fuera de un comentario
  histórico)".

### Per-doc — Completeness

#### 3. `AC-53` clasifica el impacto sobre las cuentas como `external`, y no enumera el impacto `business` sobre el propio propietario

- **Dimension:** Completeness
- **Where:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` §11.5, `AC-53` (línea 585)
- **What:** `AC-53` fija de antemano los ámbitos que el Plan deberá usar para sus filas
  `IMP-*`: `code`, `system` y `external` (para "las cuentas con sesión abierta durante
  el corte"). Dos problemas: (a) las cuentas afectadas son los propios usuarios del
  producto —jugadores y el administrador—, no dependientes externos; en el vocabulario
  cerrado `code / system / business / external` de la rúbrica, ese impacto encaja mejor
  en `business` (afecta a quién usa el producto y cómo) que en `external` (que
  típicamente describe socios o sistemas de terceros fuera de la organización); y (b) no
  se enumera ningún impacto `business` para el cambio de flujo operativo del propio
  propietario, que pasa de crear un documento a mano en la consola de Firebase a correr
  un script — un cambio real de proceso que el Plan debería reflejar en su propia fila.
- **Why it matters:** `AC-53` es una pre-declaración: el Plan hereda estos ámbitos como
  el conjunto que debe cubrir (`T-N.D15` los verifica mecánicamente). Si la clasificación
  de origen ya está torcida, el Plan puede heredar la etiqueta incorrecta sin
  cuestionarla, y el impacto sobre el flujo del propietario puede quedar sin ninguna fila
  porque nadie lo nombró primero acá.
- **Evidence:** Cita textual: *"code (la resolución de sesión y el prefetch), system
  (las reglas publicadas en los dos proyectos Firebase y los tests de interfaz) y
  external (las cuentas con sesión abierta durante el corte)"* — ningún ámbito
  `business` aparece en la lista.
- **Confidence:** Medium — la frontera entre `business` y `external` no está definida
  con precisión en la rúbrica misma, así que la reclasificación es una lectura razonable,
  no la única posible.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Reclasificar el impacto sobre las cuentas de usuario como `business`
  (o justificar explícitamente por qué se prefiere `external`), y agregar una mención
  explícita del ámbito `business` sobre el cambio de flujo operativo del propietario
  (Console → script), aunque sea con una sola línea, para que el Plan no tenga que
  descubrirlo por su cuenta.

### Per-doc — Clarity

*(Sin hallazgos adicionales a los ya cubiertos arriba — la Spec es, en general, clara y
verificable: cada `FR` es de una sola cláusula desde la autocrítica que partió `FR-008`,
y ningún NFR usa un adjetivo sin cuantificar.)*

### Per-doc — Methodology-invariants

#### 4. El nuevo diagrama `erDiagram` de §10.1.1 no lleva marcador `[UNVERIFIED]`, pese a no haberse podido validar

- **Dimension:** Methodology-invariants (`MD-24`, `MD-26`)
- **Where:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` §10.1.1 (líneas 513–531)
- **What:** La Concept Note de esta misma feature (`ROL_EN_EL_TOKEN_CONCEPT.md` §5.1)
  declara explícitamente que su diagrama `C4Context` no pudo verificarse en este entorno
  ("la CLI de Mermaid no logra arrancar Chrome") y lo marca `[UNVERIFIED]`, citándolo
  además en su §16 Handoff como deuda heredada. La Spec introduce un diagrama **nuevo**
  (`erDiagram`, §10.1.1) en el **mismo entorno de trabajo**, y no lleva ningún marcador
  equivalente ni menciona la limitación en su propio §17 Handoff — pese a que, verificado
  ahora por este crítico con la misma herramienta y el mismo resultado, el render de ese
  diagrama tampoco pudo confirmarse.
- **Why it matters:** `MD-26` (Dim 5.0, fila "Trust but verify") es explícito: *"Un-flagged
  unverifiable claims are 🔴 (author neither verified nor disclosed)"*. La sintaxis del
  bloque es consistente con un `erDiagram` válido a simple vista, así que el riesgo de un
  defecto real es bajo — pero la regla no es sobre la probabilidad de que esté bien, es
  sobre la disciplina de declarar lo que no se verificó. El propio documento hermano ya
  estableció el estándar de qué hacer en esta situación exacta, y la Spec no lo siguió
  para su propio diagrama.
- **Evidence:** Reproducido en esta crítica: `npx @mermaid-js/mermaid-cli` sobre el bloque
  de §10.1.1 falla con el mismo error de lanzamiento de Chrome que documentó la Concept
  Note para el suyo. La Spec §17 (Handoff to the Implementation Plan) menciona *un único*
  `[UNVERIFIED]` heredado —el de `NFR-001b`— y no menciona el diagrama.
- **Confidence:** High — verificado por ejecución directa en esta crítica, no por
  inferencia.
- **Severity:** 🔴 Blocking
- **Suggested fix:** Agregar el mismo tipo de nota que lleva la Concept Note, inmediatamente
  después del bloque `erDiagram`: `[UNVERIFIED — el render no se pudo validar en este
  entorno; verificar pegándolo en mermaid.live antes de aprobar el documento]`, y sumarlo
  como segunda deuda heredada en §17 junto a la de `NFR-001b`. Alternativa más barata: pegar
  el bloque en <https://mermaid.live> ahora mismo (son 13 líneas, sintaxis estándar) y, si
  renderiza, no hace falta ningún marcador — sólo dejar constancia de que se verificó.

## Cross-doc Findings

### Decision propagation

Ninguno. Las doce decisiones de la Concept Note (`D-01` a `D-12`) aparecen citadas
explícitamente en la Spec §3.3 como constraints heredados, sin omisiones ni
renombrados. Las cuatro `OPEN-Q` que la Concept Note dirigía a "Spec" (`OPEN-Q-02` a
`OPEN-Q-04`, más la ya resuelta `OPEN-Q-01`) están resueltas con una decisión concreta
cada una (`TC-030`, `TC-031`, `FR-007`), no dejadas pendientes.

### Behaviour coverage

**No aplicable a este par.** Esta dimensión evalúa si cada `FR`/`NFR`/`TC`/escenario de
la Spec llega al Implementation Plan con un camino de verificación (§12.1 del Plan) — y
el Plan todavía no existe. No se fuerza ningún hallazgo aquí; se declara la ausencia
explícitamente, como pide el principio de "surface unknowns" del propio SKILL.

### AC coverage

**No aplicable a este par**, por el mismo motivo: exige el §16 *AC coverage* del Plan,
que todavía no existe.

### No silent drift

#### 5. Un hallazgo ya señalado sobre la Concept Note sobrevivió sin resolverse hasta un constraint de seguridad concreto de la Spec

- **Dimension:** No silent drift
- **Where:** Origen: `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT_CRITIQUE_2026-09-09_sonnet-5.md`
  Hallazgo 1 (crítica independiente previa de la Concept Note, mismo crítico, misma
  sesión). Destino: `docs/rol-en-el-token/ROL_EN_EL_TOKEN_SPEC.md` `TC-041` (línea 180)
  y `AC-16`/`AC-18` (líneas 567, 569).
- **What:** La crítica previa de la Concept Note encontró que el contrato committeado de
  reglas de `007-permisos-por-usuario`
  (`docs/007-permisos-por-usuario/contracts/firestore-rules.md`) tiene bloques `match`
  para sólo **5 de los 6** documentos de `DOCS_SOLO_ADMIN` de `index.html` —
  `ordenJugadoresMigrado` no tiene ningún bloque en el contrato committeado, y ningún
  documento del repo registra qué regla rige hoy ese documento en la consola real de
  Firebase (verificado de nuevo ahora, ver Evidence). Esa crítica sugirió una
  `OPEN-Q-06` para que la Spec resolviera esto antes de fijar el reemplazo de `rol()`.
  Esa pregunta **nunca se agregó**: la Concept Note actual llega sólo hasta
  `OPEN-Q-05`, y la Spec hereda el mismo punto ciego en `TC-041`, que instruye
  verificar la equivalencia de permisos *"documento por documento contra el contrato
  vigente"* — la misma fuente que la crítica anterior ya había confirmado incompleta.
- **Why it matters:** `TC-041` existe para **defender `CWE-862` *Missing
  Authorization*** (puesto 4 del Top 25) — es, con `TC-011`, el constraint de mayor
  peso de seguridad de todo el documento. Si el Plan sigue la instrucción de `TC-041`
  al pie de la letra y verifica sólo contra el contrato committeado, va a reescribir
  correctamente 5 de las 6 reglas y nunca va a saber que falta la sexta, porque su
  propia fuente de verificación nunca la tuvo. En el peor caso, `ordenJugadoresMigrado`
  no tiene ninguna regla real hoy en producción (un hueco de autorización preexistente,
  ajeno a esta feature pero que la migración de `rol()` está en la posición perfecta
  para arreglar de paso, o para dejar exactamente igual de expuesto si nadie lo mira).
- **Evidence:** Re-verificado en esta crítica: `DOCS_SOLO_ADMIN` en `index.html:1855-1857`
  lista 6 claves; el contrato tiene bloques `match` para `players`, `playerScores`,
  `partidos`, `partidosArmado`, `motorConfig`, `statsGanadosEmpatadosPerdidosMigrado` y
  `puntajeArmadoSeparadoMigrado` — ninguno para `ordenJugadoresMigrado`. `grep -rln
  "ordenJugadoresMigrado" docs/` no devuelve ningún archivo de reglas.
- **Confidence:** High — el hecho de archivo es directamente verificable; lo que sigue
  siendo desconocido es, precisamente, el contenido de la regla viva en la consola, que
  es exactamente el vacío que se está señalando.
- **Severity:** 🔴 Blocking
- **Suggested fix:** Antes de escribir el Plan, alguien con acceso a la consola de
  Firebase de los dos proyectos debe copiar la regla **viva** de `ordenJugadoresMigrado`
  (si existe) y agregarla como referencia explícita a `TC-041` o a una `OPEN-Q` nueva de
  la Spec — no siguiente el patrón de la Concept Note que la dejó caer. Si resulta que
  el documento no tiene regla alguna hoy, eso es un hallazgo de seguridad independiente
  de esta feature que vale la pena reportar aparte, con o sin este cambio.

### Reverse-derivability

Ninguno. La Spec conserva suficiente prosa de "por qué" en §1 y §2 (incluida la cifra
medida de 821/487 ms) para que un lector que sólo tuviera la Spec pudiera reconstruir el
problema que la motiva, aunque —correctamente, por `MD-01`— no duplica el análisis de
alternativas de la Concept Note §9, que sigue siendo la única fuente de esa parte del
razonamiento.

## Summary

- Blocking: 2
- Should fix: 3
- Suggestions: 0 (dos observaciones menores de fraseo EARS —`FR-005`/`FR-030` usan
  "siempre que"/"Durante la mudanza" en vez de un disparador canónico— se consideraron
  y se descartan como hallazgo formal: ambas mapean sin ambigüedad a un patrón EARS
  válido, es un matiz de estilo sin efecto verificable)
- Methodology-invariants violated: `MD-26` (Trust but verify — diagrama nuevo sin
  disclosure; y, en un sentido más amplio, un hallazgo de verificación externo que no
  se cerró antes de construir un constraint de seguridad sobre la misma fuente
  incompleta)

**Lo que verificó limpio, sin necesidad de reportarlo como hallazgo:** los 24 `FR` en
patrones EARS válidos (tras la partición de `FR-008` en la autocrítica); los 9
escenarios en Given/When/Then con sus 25 variantes, ninguno con un bloque `Variants:`
faltante; las 19 `TC` con su chequeo en §11.3, todas correctamente clasificadas como
mandatos de espacio-de-solución y no como patrones de diseño; las seis obligaciones de
§11.5 (`AC-50` a `AC-55`) presentes; los siete rangos del CWE Top 25 de 2025 citados en
§4.5 verificados contra la lista completa —ningún puesto inventado, las 25 categorías
contabilizadas exactamente una vez entre "aplicables" y "no aplicables"—; y una muestra
de catorce citas a `index.html`, `AGENTS.md`, `tests/fixtures-app.js` y los cuatro
documentos de `007-permisos-por-usuario` verificadas línea por línea contra el
repositorio real, todas exactas — incluida la comprobación de que la anotación
recíproca que la Spec promete en su §17 ("se ejecuta junto con esta Spec") efectivamente
existe en los cuatro archivos de `007-permisos-por-usuario`.
