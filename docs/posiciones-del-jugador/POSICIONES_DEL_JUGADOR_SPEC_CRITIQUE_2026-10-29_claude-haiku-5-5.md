# Crítica — POSICIONES_DEL_JUGADOR_SPEC.md (per-doc)

> **Critic model:** claude-haiku-5-5 (familia Claude Haiku, proveedor Anthropic)
> **Author model:** claude-opus-5-5 (Lucas Manoukian; verificado en el encabezado de la Spec y en la fila 2026-10-29 del Change log, §18)
> **Independencia (Step 7.0):** familia distinta, mismo proveedor (Opus autor, Haiku crítico). Se procede con advertencia: un crítico del mismo proveedor atrapa la mayoría de los hallazgos sesgados, pero puede compartir sesgos residuales de entrenamiento. Tomarlo como proxy, no como independencia total.
> **Date:** 2026-10-29
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` (sólo la Spec). No se leyeron el Concept Note ni las dos críticas previas de esta Spec, para no contaminar la lectura. Las anclas de código y las citas a documentos hermanos sí se comprobaron en el repositorio.
> **Pass:** Step 7, per-doc, tercera crítica de esta Spec.

## Verdict

**COMMENT** — No hay hallazgos 🔴. Hay 5 🟡 y 7 🔵. Los 🟡 son de redacción, de términos sin definir y de un aviso sin texto definido; ninguno invalida una decisión ya tomada. Conviene resolver #1 y #2 antes de escribir el Implementation Plan, porque el Plan los necesitaría.

## Verificado y sin hallazgo

- Autor del Change log: fila 2026-10-29 de §18 y encabezado dicen `claude-opus-5-5`.
- Escenarios con bloque `Variants:` o declaración: S-01 a S-07, S-20 a S-22. Todos presentes.
- §11.5: `AC-50` a `AC-55` presentes.
- §11.3: cada `TC-001` a `TC-043` tiene al menos un AC (AC-30 a AC-42).
- §4.5: los CWE que el Concept Note §5.2 declara (CWE-79, CWE-862, CWE-863) tienen `TC-*` o ruling.
- Código (`index.html`): `costoEncaje` 3631, `cubrePosicionGuardada` 3642, `posicionAsignadaDe` 5051, `esFilaEditable` 5072, `intercambiarUnidades` 5635, `moverUnJugadorDeEquipo` 5770, `balanceLineasVigente` 5863, `sumasVigentes` 5923, `faltantesDeFormacionVigente` 5940. Todas existen cerca de la línea citada.
- `NFR-001`: la lista de anchos coincide exactamente con `tests/layout.test.js:45`.
- `NFR-004` cita 150 ms y 100 ms: coinciden con `ARRASTRE_SPEC.md` NFR-004 (l. 574) y `CANCHA_SPEC.md` NFR-005 (l. 459).
- `D-18` a `D-31` existen en la §10 del Concept Note (l. 463-476).
- `FR-072b` y `FR-072b2` existen en `PANEL_ARMADO_SPEC.md`.
- `Roadmap.md` línea 86 es la alternativa táctil que la Spec cita.
- `docs/rol-en-el-token/contracts/firestore-rules.md` existe.
- Diagrama §9 (`stateDiagram-v2`): 3 estados, sin caracteres que rompan el parseo.

**No verificado en esta pasada:** la lista de CWE Top 25 2025 (§4.5) y los criterios WCAG citados (TC-020). Requieren consulta en vivo; no lo hice aquí.

## Findings

### 1. "arco vacío" se usa 19 veces y no está en el Glosario

- **Dimension:** Consistency (regla de glosario: términos usados 5 o más veces se definen, §5.2)
- **Where:** `POSICIONES_DEL_JUGADOR_SPEC.md` §6 *Glossary* (l. 319-333); usos en l. 124-126, 436-438, 566-567, 575, 593.
- **What:** El término central del partido "arco vacío" no tiene entrada. El único "arco" del glosario aparece dentro de la definición de "Partido sin puestos".
- **Why it matters:** `FR-050` dice "mientras un equipo tenga el arco vacío" y `S-04` depende de cuándo está vacío. Sin definición, un lector puede preguntarse si cuenta un arquero con candado que el motor no movió al arco (lo que dice `S-04a`) o sólo un puesto `ARQ` asignado.
- **Evidence:** conteo de la palabra en el archivo: 19. `FR-050` (l. 436-438): "While un equipo tenga el arco vacío, el sistema no lo ofrecerá como destino".
- **Confidence:** High.
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar al glosario una entrada "Arco vacío". Propuesta (inferencia mía, para que el propietario la confirme o corrija): "equipo en el que ninguna unidad tiene el puesto asignado ARQ, ni está ocupando el arco por la marca de dibujo".

### 2. El aviso del segundo toque no tiene texto definido

- **Dimension:** Completeness / Clarity
- **Where:** §7.4 `FR-034` (l. 404-407); §7.5 `FR-042` (l. 419-422); §9.1 `S-01j` (l. 520).
- **What:** `FR-042` define avisos sólo para una camiseta **arrastrada** que se suelta sobre una no candidata. `FR-034` dice que, al aplicar un intercambio con datos obsoletos, el sistema muestra "el aviso de `FR-042` si corresponde". `S-01j` pide que el segundo toque "avisa". El toque no es un arrastre, así que el texto de `FR-042` no está pensado para ese caso.
- **Why it matters:** el Plan no puede implementar un aviso cuyo texto la Spec no fija, y "si corresponde" deja a criterio del implementador cuándo aparece.
- **Evidence:** `FR-042`: "When una camiseta arrastrada en un partido con puestos se suelta sobre otra camiseta que no es candidata…". `S-01j`: "el segundo toque no escribe nada y avisa (`FR-034`)".
- **Confidence:** High.
- **Severity:** 🟡 Should fix
- **Suggested fix:** separar `FR-034` en dos obligaciones: no escribir (FR-034) y mostrar un aviso con texto propio cuando la causa es que dejaron de ser candidatas (FR-034b, con la frase exacta). Ajustar `S-01j` para citar `FR-034b`.

### 3. Dos FR agrupan varias obligaciones en una línea

- **Dimension:** Clarity (Dim 4: compuestas) / Methodology-invariants (§5.2 EARS: "one obligation per line")
- **Where:** `FR-045` (l. 428-431); `FR-042` (l. 419-422); `FR-010` (l. 348-352).
- **What:** `FR-045` tiene tres obligaciones: intercambiar de equipo al soltar sobre una del otro equipo, no modificar al soltar sobre una propia, y el pase. `FR-042` tiene dos: no modificar y mostrar un aviso con tres textos posibles. `FR-010` mezcla la selección con una aclaración sobre el modo de carga, que pertenece a otra spec.
- **Why it matters:** cada obligación debe poder probarse por separado. Hoy `S-05c` ya separa dos casos de `FR-045` que la FR no separa.
- **Evidence:** `FR-045`: "…intercambia de equipo a las dos unidades sin escribir puestos, soltar sobre una camiseta propia no modifica nada, y el pase es el de `FR-043`".
- **Confidence:** High para `FR-045`; Medium para `FR-010` (la aclaración es una referencia, no una obligación propia).
- **Severity:** 🟡 Should fix. (Lo gradué desde 🔴 porque la regla dice "one obligation per line" pero el texto es de redacción, no de estructura del método.)
- **Suggested fix:** partir `FR-045` en `FR-045a`, `FR-045b`, `FR-045c` y `FR-042` en `FR-042` (no modificar) y `FR-042b` (aviso). Usar sufijos nuevos, sin renumerar.

### 4. Cuatro TC repiten convenciones de AGENTS.md

- **Dimension:** Methodology-invariants (§5.2 TC discipline: "not project-wide conventions (those are in AGENTS.md)" — MD-11)
- **Where:** `TC-001` (l. 200-201); `TC-030` (l. 243-246); `TC-031` (l. 248-251); `TC-032` (l. 252-254).
- **What:** `TC-031` y `TC-032` son reglas de proceso ya escritas en `AGENTS.md` § Tests y § Estilo. `TC-030` repite la regla de orden de decisión visual de `AGENTS.md`. `TC-001` repite "sin dependencias nuevas" de `AGENTS.md` § Dependencias.
- **Why it matters:** dos fuentes del mismo mandato pueden divergir. `AGENTS.md` se declara fuente de verdad de las restricciones transversales.
- **Evidence:** `TC-032`: "…se actualizará en esa lista en el mismo commit (`AGENTS.md` § Estilo)". Es una cita, no un mandato propio de esta feature.
- **Confidence:** Medium. Depende de si el propietario quiere que estas cláusulas queden como recordatorio visible en la Spec.
- **Severity:** 🟡 Should fix. Lo gradué desde 🔴 porque la severidad de Dim 5 es "casi siempre" 🔴, y aquí las cláusulas son referencias explícitas; el autor decide.
- **Suggested fix:** quitar `TC-031` y `TC-032` de §4 y dejar una línea "Convenciones que aplican: `AGENTS.md`". `TC-001` y `TC-030` pueden quedar si el propietario las quiere como mandato explícito de esta feature. Si se quitan, actualizar `AC-30`, `AC-38`, `AC-39` y `AC-40`, que las referencian.

### 5. El riesgo de toque y arrastre apunta a un escenario que prueba otra cosa

- **Dimension:** Behaviour coverage / reference integrity
- **Where:** §15 *Risks* (l. 806) cita `S-01k`; `S-01k` está en §9.1 (l. 521).
- **What:** el riesgo es que un toque y un arrastre sobre la misma camiseta en el celular disparen ambos. `S-01k` prueba dos toques rápidos sobre Pedro, no un toque seguido de un arrastre.
- **Why it matters:** el riesgo de mayor severidad de la tabla (High) queda mitigado por un escenario que no lo prueba. La mitigación real es la verificación manual de `A-01`, que la tabla no menciona.
- **Evidence:** `S-01k`: "dos toques rápidos sobre Pedro: se aplica un solo intercambio, no dos". Riesgo: "Toque y arrastre sobre la misma camiseta se disparan juntos en el celular | High | Med | `TC-003`, `A-01`, `S-01k`".
- **Confidence:** High.
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar `S-03h [concurrency]`: "toque y arrastre sobre la misma camiseta en el celular: se aplica un solo gesto", o citar explícitamente la verificación manual de `A-01` como mitigación de ese riesgo.

### 6. TC-010 y TC-011 nombran funciones; §17 dice que el Plan elige los nombres

- **Dimension:** Consistency
- **Where:** `TC-010` (l. 214-220) nombra `cubrePosicionGuardada` y `costoEncaje`; `TC-011` (l. 221-226) nombra `intercambiarUnidades`, `moverUnJugadorDeEquipo`, `sumasVigentes`, `balanceLineasVigente`, `faltantesDeFormacionVigente`. §17 (l. 837-838): "Plan has freedom over: module layout, nombres de funciones…".
- **What:** la Spec fija nombres de funciones existentes y, a la vez, deja libres los nombres de funciones.
- **Why it matters:** el Plan tendría que renombrar una función para cumplir la libertad que §17 le da, y eso rompería el TC.
- **Evidence:** las citas de §4.2 y la frase de §17 de arriba.
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** en §17, agregar "salvo las funciones que nombran `TC-010` y `TC-011`, que se reutilizan sin renombrar".

### 7. Los números de NFR-002 no citan su origen

- **Dimension:** Accuracy (Dim 1: numeric NFRs con base upstream)
- **Where:** `NFR-002` (l. 470).
- **What:** 44×44 px y 24×24 px no tienen cita. El origen existe: `ARRASTRE_SPEC.md` `NFR-002` (l. 572) usa los mismos dos números.
- **Why it matters:** la base sí existe, pero el lector de la Spec no puede verla sin buscarla.
- **Evidence:** `ARRASTRE_SPEC.md` l. 572: "…no es menor a 44×44 px, y la del candado sigue midiendo al menos 24×24 px".
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar "(mismo valor que `ARRASTRE_SPEC.md` `NFR-002`)" al final de la fila.

### 8. TC-020 y NFR-003 dicen lo mismo con palabras distintas

- **Dimension:** Consistency
- **Where:** `TC-020` (l. 236-239): "se distinguirán por más de una señal"; `NFR-003` (l. 471): "al menos dos señales, una de ellas no cromática".
- **What:** dos formulaciones de la misma regla de accesibilidad.
- **Why it matters:** si cambia una y no la otra, el Plan puede cumplir una y no la otra.
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** dejar la cifra en `NFR-003` y que `TC-020` diga sólo "cumple WCAG 2.1 1.4.1 según `NFR-003`".

### 9. El diagrama de §9 no tiene las transiciones de FR-019 y FR-019b

- **Dimension:** Completeness (diagrama como índice visual; la prosa manda)
- **Where:** §9 diagrama (l. 479-490); `FR-019` (l. 372-373) y `FR-019b` (l. 374-376).
- **What:** el diagrama no muestra que la selección se descarta al seleccionar una camiseta de otro partido (`FR-019`) ni al aplicar un cambio al partido (`FR-019b`: regenerar, intercambiar colores).
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar `Seleccionada --> SinSeleccion: otro partido o cambio al partido (FR-019, FR-019b)`.

### 10. La fecha del encabezado es anterior a la última entrada del Change log

- **Dimension:** Consistency
- **Where:** encabezado l. 3 ("Date: 2026-10-28"); Change log l. 853-858 (entradas del 2026-10-29).
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** actualizar la fecha del encabezado a la del último cambio, o dejarla como fecha de creación y aclarar "última revisión 2026-10-29".

### 11. AC-50 está en inglés; el resto de la Spec, en español

- **Dimension:** Consistency
- **Where:** l. 748 (`AC-50`, "Every scenario in §9 … reviewer-checked, not mechanically gated").
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** traducir el texto de `AC-50` al español (el identificador `S-NNa` y el nombre de `T-N.D8` se mantienen).

### 12. Encabezado de sección pegado a la viñeta anterior

- **Dimension:** Clarity (formato)
- **Where:** l. 433-434: la viñeta de `FR-046` y el encabezado `### 7.6 Arco vacío` no tienen línea en blanco entre ellos.
- **Confidence:** High.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar una línea en blanco.

## Summary

- Blocking: 0
- Should fix: 5 (#1 a #5)
- Suggestions: 7 (#6 a #12)
- Methodology-invariants tocados (todos graduados a 🟡, ninguno 🔴): MD-03 (EARS, una obligación por línea: `FR-045`, `FR-042`, `FR-010`); MD-11 (disciplina de TC: `TC-001`, `TC-030`, `TC-031`, `TC-032`).

## Lo que este reporte no hace

- No reescribe la Spec. Las decisiones quedan con el autor.
- No reemplaza ni corrige las críticas anteriores de esta Spec.
- No verifica en vivo la lista de CWE ni los criterios WCAG (ver "Verificado y sin hallazgo").
