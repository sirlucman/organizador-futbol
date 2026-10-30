# Critique — POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md (per-doc)

> **Critic model:** claude-sonnet-5-5
> **Author model:** claude-opus-5-5 (figura en el Change log del Plan, §17)
> **Independence (Step 7.0):** familias distintas (`claude-sonnet-*` crítico, `claude-opus-*` autor), mismo proveedor — nivel intermedio de la rúbrica. Pueden quedar sesgos de entrenamiento compartidos.
> **Date:** 2026-10-30
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md` (commit `ab62904`, rama `docs/posiciones-del-jugador`). Para contrastar afirmaciones se leyeron también la Spec, `index.html`, `tests/` y `tools/`; ninguno se critica acá. `index.html` es idéntico en `3f5c5ce` y en `HEAD` (`git diff --stat` vacío), así que los números de línea que cita el Plan se verificaron contra el archivo actual.
> **Modo:** per-doc. No se reescribe el documento.

## Verdict

**COMMENT** — 0 🔴 / 9 🟡 / 5 🔵. El Plan es sólido en lo estructural: los 53 escenarios y variantes de la Spec tienen fila en §12.1 (`comm` vacío en las dos direcciones), todos los `AC-*` propios de la Spec están en §16, todo `FR/NFR/TC/AC/D/A` citado existe aguas arriba, los números de línea de `index.html` coinciden con el código, y los dos diagramas renderizan y se leen. Los hallazgos son de ejecutabilidad: un orden de commits que deja un punto intermedio con comportamiento sin regla, compuertas de DoD que no se pueden correr o no pueden dar vacío, y evidencia de "rojo" que no prueba lo que `AGENTS.md` exige. Ninguno rompe una invariante de la metodología, pero varios conviene arreglarlos antes de empezar a implementar.

## Findings

### Per-doc — Accuracy

### 1. "Los diecisiete `TC-*`" son dieciséis

- **Dimension:** Accuracy
- **Where:** `POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md` §7.2 *Spec coverage* (línea 231)
- **What:** El Plan dice que la rama cubre "los diecisiete `TC-*`"; la Spec §4 define dieciséis.
- **Why it matters:** Es un conteo que alguien va a usar para decidir si algo quedó afuera; un número equivocado manda a buscar un `TC` que no existe.
- **Evidence:** `sed -n '/^## 4\./,/^## 5\./p' SPEC | grep -oE '\*\*TC-[0-9]+' | sort -u | wc -l` → 16 (`TC-001`, `002`, `003`, `010`, `011`, `012`, `013`, `020`, `030`, `031`, `032`, `033`, `040`, `041`, `042`, `043`). Los 16 sí están en §12.9.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "los dieciséis `TC-*`". En la misma pasada, §12.2 `IMP-01` dice "modifica siete funciones de la cancha y del arrastre", y la tabla de §4 lista ocho (`intercambiarUnidades`, `resolverDestinoDrop`, `aplicarDrop`, `__dragStartJugador`, `__dragFin`, `__dragSobre`, `renderCamiseta`, `renderCanchaEquipo`).

### 2. El `Toast` con `role="status"` puede no anunciarse la primera vez

- **Dimension:** Accuracy
- **Where:** §3.1 `TD-14`, §7.2.3 *Toast*, §7.2.5 `__showToast`; `NFR-003` de la Spec
- **What:** El Plan da por cumplido que "los avisos se anuncian en una región `aria-live`" con atributos puestos al crear el elemento, y lo verifica sólo con la presencia de `role="status"` (§12.6, `intercambio-cancha`).
- **Why it matters:** Esto es una inferencia mía, no algo que ejecuté: muchos lectores de pantalla no anuncian una región que aparece ya con texto, ni una que pasa de `visibility:hidden` a visible en el mismo momento en que cambia el texto. Hoy `__showToast` crea el elemento y le pone `textContent` en la misma pasada (`index.html:1937-1951`) y el CSS propuesto lo oculta con `visibility:hidden`. Si pasa, `NFR-003` se declara cumplido sin estarlo y el test no lo detecta.
- **Evidence:** `TD-14`: "el elemento lleva `role="status"` y `aria-live="polite"`"; §12.6 mide sólo el atributo. `.toast` actual: `visibility: hidden` hasta `.show` (`index.html:1114-1124`).
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Decidir en el Plan cuándo existe la región (vacía, desde el primer `__showToast` o desde el arranque) y poner el texto en un paso posterior; sumar a §12.7 una verificación manual con un lector de pantalla del teléfono, o declarar `[UNVERIFIED — anuncio no probado con lector de pantalla]` en §15.1.

### Per-doc — Consistency

### 3. §7.2.1 afirma "la app usable en cada punto", pero entre `T-1.C1` y `T-1.C2` no lo está

- **Dimension:** Consistency
- **Where:** §7.2.1 (primera cita) y §7.2.9, `T-1.3` dentro de `T-1.C1`; `T-1.5` dentro de `T-1.C2`
- **What:** `T-1.2` y `T-1.3` (en `T-1.C1`) hacen que `intercambiarUnidades` acepte el mismo equipo y escriba puestos, y que `resolverDestinoDrop` devuelva `'intercambiar'` para cualquier camiseta propia. `aplicarDrop` recién se modifica en `T-1.5` (`T-1.C2`). Hasta entonces `aplicarDrop` llama a `intercambiarUnidades` sin consultar ninguna regla.
- **Why it matters:** En ese commit, soltar una camiseta sobre un compañero intercambia sus puestos aunque no los cubran, y lo guarda. Contradice el párrafo que justifica el orden de commits, y `git bisect` caería en un punto con datos inválidos.
- **Evidence:** `aplicarDrop` actual (`index.html:5717-5741`): `if(mov.tipo === 'intercambiar'){ intercambiarUnidades(m, idArrastrado, mov.idDestino); saveMatches(); renderMatchesTab(); }`, sin evaluación. §7.2.1: "El orden de los commits deja la app usable en cada punto".
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Mover `T-1.3` (y la reescritura de `"arrastre/S-02c"` de `T-1.4`) a `T-1.C2`, junto con `T-1.5`. `T-1.C1` queda sólo con la regla pura, la escritura (que sin llamador nuevo no cambia nada observable) y los casos de `cancha.test.js` que no dependen de `resolverDestinoDrop`.

### 4. Gates de DoD con expectativa contradictoria: `T-1.D10b`

- **Dimension:** Consistency
- **Where:** §6 DoD (línea "Cada `TC-*` tiene su entrada en §12.9 y su criterio en Spec §11.3"), `T-1.D10b`
- **What:** `T-1.D10b` exige que el `comm` "devuelva vacío", y a la vez admite que `TC-041` a `TC-043` aparecen sólo como rango en `AC-42` y "se cuentan cubiertos". Como escrito, el gate no puede dar vacío.
- **Why it matters:** Un DoD "mecánicamente verificable" que siempre da no-vacío entrena a ignorarlo, que es lo que `AC-52` quiere evitar.
- **Evidence:** `sed -nE '/^#{2,4} +11\.3/,/^#{2,4} +11\.4/p' SPEC | grep -oE 'TC-[0-9]+' | sort -u` → `TC-001 … TC-040 TC-043`; faltan `TC-041` y `TC-042`. La salida esperada del `comm` es `TC-041`, `TC-042`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** O bien listar `TC-041`/`TC-042` por ID en `AC-42` (enmienda mínima a la Spec), o bien escribir en el gate la salida esperada exacta ("devuelve exactamente `TC-041` y `TC-042`, cubiertos por el rango de `AC-42`").

### Per-doc — Completeness

### 5. No hay mapa de `FR-*` a tarea; `T-1.D7` apunta a un §16 que sólo tiene `AC-*`

- **Dimension:** Completeness
- **Where:** §7.2 *Spec coverage*, `T-1.D7`, §16
- **What:** `T-1.D7` dice "Cada `FR-*` … vigente está implementado o verificado (§16)", pero §16 es una tabla de `AC-*`. Cuatro `FR` vigentes no aparecen en ningún lugar del Plan: `FR-050`, `FR-060`, `FR-070`, `FR-071`.
- **Why it matters:** Quien implemente no sabe si esos requisitos se cumplen por comportamiento que ya existe (probablemente así sea para `FR-060` y `FR-071`) o por algo que hay que construir. Para `FR-050` ("no ofrecer el arco vacío como destino ni aceptar soltar sobre él") el Plan tiene el test (`S-04b`, `S-05b`) pero ninguna tarea ni decisión que diga cómo se logra.
- **Evidence:** `comm -23 <FR de la Spec> <FR del Plan>` → entre los no retirados: `FR-050`, `FR-060`, `FR-070`, `FR-071` (el resto de la lista son retirados o caen dentro de rangos como "`FR-030` a `FR-033`"). §7.2: "`FR-001` a `FR-072` vigentes" es un rango, no un mapa.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Una tabla corta en §16 o en §7.2 con una fila por `FR` que no se resuelve en una tarea (`FR-050`, `FR-057`, `FR-060`, `FR-061`, `FR-070`–`FR-072`): "ya satisfecho por X, verificado por `S-NN`" o "tarea `T-1.N`".

### 6. Al empezar un arrastre con una selección previa no se limpian los restos visuales

- **Dimension:** Completeness
- **Where:** §3.1 `TD-09`, `TD-11`; §7.2.5 `__dragStartJugador`; escenario `intercambio-arrastre` ("con selección previa")
- **What:** `TD-09` prohíbe repintar en `dragstart` y agrega las clases de tocada y candidato con `classList`. `FR-046` pide descartar la selección. El Plan pone `seleccionIntercambio = null` pero no dice que se quiten las clases que la selección anterior ya dejó en el DOM (`seleccionada`, `candidata`, `atenuada`, `aria-pressed`, `con-seleccion` en la cancha).
- **Why it matters:** Si alguien tocó A y después arrastra B, quedan dos camisetas con el dibujo de "tocada" (A, vieja; B, la arrastrada) y los candidatos de A resaltados junto a los de B. El test de `S-03e` podría pasar leyendo `seleccionIntercambio` y no el DOM.
- **Evidence:** `TD-09`: "descarta la selección por toque, guarda `arrastreEnCurso` … y agrega las clases … con `classList`"; `__dragFin`: "quita las clases de estado". Nada dice quitar las de la selección previa en `dragstart`. Inferencia mía a partir de ese texto.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Escribir en `TD-09` que `dragstart` primero quita todas las clases y atributos de estado de la selección anterior y después aplica las del arrastre, y hacer que `intercambio/S-03e` afirme el DOM (una sola `.seleccionada`, `aria-pressed` sólo en la arrastrada).

### 7. Los `[UNVERIFIED]` de §15.2 no están en §15.1

- **Dimension:** Completeness
- **Where:** §15.2 `A-01`, `A-02`, `A-07`; §15.1
- **What:** Tres supuestos llevan `[UNVERIFIED — …]` con razón legítima (se verifican en `T-1.26`, `OBS-02`, `T-1.27`), pero la rúbrica pide que todos los marcadores se citen en §15.1. Sólo el de §12.7 está cubierto, por `OPEN-Q-13`.
- **Why it matters:** Es la deuda de verificación que hereda quien implementa; está repartida en dos tablas.
- **Evidence:** §15.1 lista `OPEN-Q-03`, `-05`, `-09`, `-11`, `-13`; ninguna menciona `A-01`, `A-02` ni `A-07`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Una fila en §15.1 que remita a `A-01`, `A-02`, `A-07` con su tarea de verificación, o una nota en §15.1 que diga "los marcadores `[UNVERIFIED]` de §15.2 y §12.7 son la deuda de verificación de este Plan".

### Per-doc — Clarity

### 8. `T-1.D8b`, `T-1.D18` y `T-1.D19` no se pueden correr desde el repositorio

- **Dimension:** Clarity
- **Where:** `T-1.D8b` ("el `awk` de la plantilla"), `T-1.D18` y `T-1.D19` (`references/review-passes.md`, "el regex anclado a la izquierda de la plantilla")
- **What:** Las tres tareas remiten a archivos de la skill de metodología (`templates/`, `references/review-passes.md`) que viven en el directorio del plugin, no en el repo. Quien ejecute el Plan sin la skill cargada no tiene el comando.
- **Why it matters:** El DoD de la metodología se pide como tareas "runnable" (`MD-15`); si el comando no está en el Plan, se omite o se improvisa distinto cada vez.
- **Evidence:** Los otros planes del repo sí lo inlinean: `grep -rhn "T-[0-9]\.D8b" docs/*/*IMPLEMENTATION_PLAN*.md | grep -c awk` → 11 coincidencias. Este Plan sí escribe en línea `T-1.D8`, `D9`, `D10` y `D15`, así que el contraste es interno.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Copiar el `awk` de `D8b` y los comandos de los dos pases de consistencia dentro de las tareas, como hacen los planes de `equipos-en-el-campo`.

### 9. `T-1.26` está cortada y no dice qué hacer

- **Dimension:** Clarity
- **Where:** §7.2.9, `T-1.26`
- **What:** "…con la rama abierta en un teléfono contra staging, en los navegadores del grupo" termina sin verbo ni resultado esperado. Los pasos están en §12.7, pero la tarea que figura en el checklist no los nombra.
- **Why it matters:** Es la tarea que puede detener la rama (`A-01`); un checkbox ambiguo es fácil de tildar sin hacerlo.
- **Evidence:** Texto de `T-1.26`; contraste con `T-1.27`, que sí dice qué correr y qué pegar en el PR.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "Hacer los cinco pasos de §12.7 y pegar el resultado de cada uno en el PR".

### Per-doc — Methodology-invariants

### 10. El "rojo" de `T-1.C4` prueba que falta la feature, no que el escenario detecta lo que debe

- **Dimension:** Methodology-invariants (`AGENTS.md` § Principios, responsive; `TC-033`, `AC-41`)
- **Where:** §7.2.1 (segunda cita), `T-1.10`, `T-1.C4`, `T-1.17`, `T-1.23`; §16 `AC-10`
- **What:** `AGENTS.md` pide que cada escenario nuevo "se vea fallar al menos una vez (revirtiendo el arreglo que lo motiva)". El Plan lo resuelve corriendo los siete escenarios antes de que exista el toque y registrando que fallan. Eso falla por lo más trivial (falta `__tocarCamiseta`, falta el dibujo), no porque el escenario detecte un desborde.
- **Why it matters:** Un escenario puede estar mal escrito (p. ej. medir el ancho antes de que haya selección) y también ponerse rojo en `C4`, y verde después sin haber probado nunca el caso que lo motiva. Además `T-1.10` dice "tienen que fallar" para los siete, y algunos pueden pasar ya en `C4`: `intercambio-permisos` (rol `jugador`: tocar no dibuja nada) o parte de `intercambio-regenerar` (candados, comportamiento actual); no hay instrucción de qué hacer en ese caso. Esto último es inferencia mía, no lo corrí.
- **Evidence:** `T-1.10`: "tienen que fallar, porque todavía no hay toque ni dibujo"; sólo se salva `intercambio-arrastre` ("puede pasar en parte"). `T-1.17` cambia `--chip-w` y `--row-gap` y `T-1.23` agranda el área tocable, pero ninguna tarea revierte esos cambios para ver caer `intercambio-cancha`.
- **Confidence:** High (de que el criterio de `AGENTS.md` no se cumple tal cual); Medium (de qué escenarios pasan en `C4`)
- **Severity:** 🟡 Should fix
- **Suggested fix:** Agregar, después de `T-1.C6`, una tarea: revertir temporalmente los valores de `--chip-w`/`--row-gap` de `T-1.17` y confirmar que `intercambio-cancha` falla a 360 px (y lo mismo con el área de `T-1.23`), con la salida en el PR. Para los escenarios que ya pasan en `C4`, decir cuál es la mutación que los hace fallar.

### 11. Los asuntos de los commits exceden el "≤ 72 caracteres" que el propio §5 restata

- **Dimension:** Methodology-invariants (`MD-16`, §5 `Commits`)
- **Where:** `T-1.C1`–`T-1.C10`; §5 *Commits*
- **What:** §5 dice "`tipo(scope): asunto (IDs de la Spec)`, ≤ 72 caracteres". Medido sobre la línea completa: `C1` 90, `C2` 111, `C3` 81, `C4` 76, `C5` 100, `C6` 95, `C7` 84, `C8` 83, `C10` 96; sólo `C11` (70) cumple. Con el scope `posiciones-del-jugador` (22 caracteres) casi ningún asunto puede ser descriptivo y entrar. Aun contando sólo lo que sigue a `tipo(scope): `, `C2` queda en 81.
- **Why it matters:** O el Plan viola su propia regla, o la regla se lee de otra forma y el Plan debería decirlo. El historial reciente del repo ya la excede (el commit `f85689d`, "docs(carga-por-toque): anota que la cancha ya responde al toque fuera del modo de carga", tiene unos 86), así que la lectura "sólo el asunto" o "orientativo" es plausible; no lo sé.
- **Evidence:** Medido con `${#s}` sobre los asuntos transcriptos de `T-1.C*`; `AGENTS.md` § Commits: "`tipo(scope): asunto en minúscula, ≤ 72 caracteres (IDs de la Spec)`".
- **Confidence:** Medium (por la ambigüedad de qué cuenta en los 72)
- **Severity:** 🟡 Should fix
- **Suggested fix:** Acortar los asuntos (o el scope, p. ej. `posiciones`), o aclarar en §5 que el límite cuenta sólo el asunto sin el prefijo y recortar `C2`.

### 12. `Custom arc` donde existe `single-branch`; tracker y grafo no coinciden

- **Dimension:** Methodology-invariants (`MD-27`)
- **Where:** §7.0, §7.1
- **What:** El Plan declara `Custom arc: 1 branch` justificado en que `AGENTS.md` fija dos ramas (docs y código). Esa razón describe el modelo de ramas, no un arco distinto; el vocabulario cerrado ya tiene `single-branch`, y `MD-27` pide declarar las ramas de larga vida en otra línea. El tracker tiene una fila, el grafo muestra dos ramas.
- **Why it matters:** Es un desvío menor del vocabulario, pero la escotilla `Custom arc:` existe para lo que el vocabulario no cubre.
- **Evidence:** §7.0: "`Custom arc: 1 branch — AGENTS.md § Ramas fija dos ramas por feature …`"; §7.1: una fila; diagrama: `docs/…` y `feature/…`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** `Arc: single-branch — una unidad de código indivisible, sin flag`, y dejar la rama `docs/` como paso previo del modelo, no del arco.

### 13. `role="button"` sin `tabindex` ni teclado

- **Dimension:** Methodology-invariants (`NFR-003`, design system)
- **Where:** §7.2.5 `renderCamiseta`; `TD-07`
- **What:** La camiseta pasa a anunciarse como botón (`role="button"`) pero no se puede enfocar ni activar con teclado (`OPEN-Q-03`, fuera de alcance). La carga por toque ya existente sí pone `tabindex="0"` junto con `role="button"` (`index.html:5266-5276`).
- **Why it matters:** Anunciar un control que no se puede operar confunde más que no anunciarlo; es una decisión que conviene tomar a propósito.
- **Evidence:** §7.2.5: "con `arrastrable`, `role="button"` y `onclick=…`"; sin `tabindex`.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Dejar `aria-pressed` y `title` pero quitar `role="button"` hasta resolver `OPEN-Q-03`, o declarar la excepción en §15.1.

### 14. Detalles de enlace entre bisect, binding y gate

- **Dimension:** Methodology-invariants (`MD-17` binding, `MD-16`)
- **Where:** §7.2.1; `T-1.4`; `T-1.D8`
- **What:** (a) §7.2.1 justifica adaptar `cancha.test.js` en el mismo commit "para no confundir a `git bisect`", pero `T-1.C4` deja `layout.test.js` en rojo a propósito. (b) La reescritura de `"arrastre/S-02c"` pone el literal `"intercambio/S-03"` dentro del título de un caso de `cancha.test.js`; el `grep` de `T-1.D8` lo cuenta como test de `S-03` aunque no lo sea.
- **Why it matters:** Son inconsistencias pequeñas, pero el segundo es un falso positivo del gate que justamente `AC-50` quiere que sea fiable.
- **Evidence:** `T-1.4`: título `'"arrastre/S-02c" reemplazado por "intercambio/S-03": …'`; `T-1.D8` grepea `intercambio/S-[0-9]+[a-z]*` en todo `tests/`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Decir en §7.2.1 que el rojo de `C4` es deliberado y excepción del criterio de bisect; en el título del caso reescrito, citar "reemplazado por la Spec de posiciones-del-jugador, S-03" sin el prefijo de binding.

## Summary

- Blocking: 0
- Should fix: 9 (hallazgos 2, 3, 4, 5, 6, 7, 8, 10, 11)
- Suggestions: 5 (hallazgos 1, 9, 12, 13, 14)
- Methodology-invariants violated: `MD-15` (gates de DoD no corribles, hallazgos 4 y 8), `MD-16` (asuntos de commit, 11), `MD-17`/`AC-50` (falso positivo del gate, 14), `MD-26` (ubicación de `[UNVERIFIED]`, 7), `MD-27` (arco, 12). La regla de `AGENTS.md` sobre ver fallar los escenarios responsive no está satisfecha tal cual (10).

## Qué se verificó y salió bien (para que no se vuelva a revisar)

- **Cobertura de escenarios:** los 53 IDs que la Spec define (cabeceras `#### Scenario` y viñetas de variante, sin `S-03h`) tienen fila en §12.1, y no hay filas sobrantes (`comm` en las dos direcciones, vacío). Los conteos del Plan (18 con `unit`, 41 con `e2e`, 1 manual, 3 `property`) coinciden con la tabla.
- **Cobertura de `AC-*`:** todos los `AC` que la Spec define están en §16 (el rango "AC-30 a AC-42" es la forma débil, pero cada uno tiene fila en §12.9). `AC-21` y `AC-23` aparecen en la Spec sólo como citas de `ARRASTRE_SPEC.md`, no como definiciones propias.
- **Referencias:** todo `FR/NFR/TC/AC/D/A` citado en el Plan existe en la Spec o el Concept Note; el único ID nuevo, `OPEN-Q-13`, está declarado en §15.1.
- **Anclas de código:** `index.html` líneas 5479-5480, 5592, 5606-5625, 5635-5645, 5699-5708, 5717-5741, 5755-5758, 5358, 5506-5508, 1114-1124, 1937-1951, 2351-2373, 4670, 4760, 5222, 5340-5356, 5847, 6555, 616/619 y 14-50 coinciden con lo que el Plan dice que hay ahí.
- **Tokens y design system:** `--pitch-pale`, `--pitch-light`, `--chalk`, `--ink`, `--brick-light`, `--radius-card`/`-control`/`-pill`, `--font-body` existen en `:root`; `--shadow-floating`, `--duration-fast`, `--ease-out` existen en `tokens/` con los valores que el Plan copia. El test `"NFR-007"` de `cancha.test.js` permite por canal RGB (`255 255 255`, `17 24 39`) y `#ffffff`, así que los alfa nuevos de §7.2.3 no lo rompen.
- **Estructura del código existente:** el toque de la carga por toque y el arrastre ya son mutuamente excluyentes en `renderCamiseta` (`index.html:5266-5276`), así que agregar `onclick` bajo `arrastrable` no duplica gestos.
- **Diagramas (`MD-24`):** los dos bloques Mermaid renderizaron con `mermaid-cli`; los PNG se miraron: sin rótulos superpuestos; 11 y 5 elementos (≤15).
- **Procedencia:** el Change log nombra al modelo autor (`claude-opus-5-5`); `Supply-chain: none` declarado en §5 con razón; el hallazgo 10 de la crítica de `claude-fable-5-1` que cita `TD-12` existe (`…SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md`, línea 123).

## Lo que no se pudo verificar

- Que el modelo de ramas se "confirmó con el usuario el 2026-10-30" y que el script de detección dio lo que dice la basis (§7.0): no hay registro en el repo.
- Que el `awk` de `T-1.D8b` de la plantilla dé vacío contra la Spec actual: el comando no está en el Plan (hallazgo 8).
- Que `intercambio-permisos` o `intercambio-regenerar` pasen en `C4` (hallazgo 10): no se corrió Playwright.
