# Critique — OCULTAR_PUNTAJES_CONCEPT.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (el modelo declarado por la sesión en curso; no se corrió `/model` desde la sesión, se tomó el identificador que la propia sesión informa)
> **Author model:** claude-opus-5-5 (Change log del documento, filas del 2026-11-20)
> **Independencia (Step 7.0):** misma marca (Anthropic), familias distintas (Opus autor / Sonnet crítico) → *proceed with caveat*: el crítico puede compartir sesgos residuales de entrenamiento con el autor.
> **Date:** 2026-11-20
> **Inputs:** `docs/ocultar-puntajes/OCULTAR_PUNTAJES_CONCEPT.md` (rama `docs/ocultar-puntajes`, commit `8802720`). Contrastado con `index.html`, `docs/007-permisos-por-usuario/spec.md`, `PARTIDO_FINALIZADO_SPEC.md`, `CARGA_POR_TOQUE_SPEC.md`, `rol-en-el-token/contracts/firestore-rules.md`, `handoff/README.md`, `Roadmap.md`, `tests/layout.test.js`.

## Verdict

**CHANGES REQUESTED** — 1 🔴, 3 🟡, 2 🔵. El documento está bien fundado: la gran mayoría de las citas a `index.html` dicen lo que el documento afirma, y la deducción de "0 pts" resultó correcta al leer el código. El bloqueo es una interacción entre dos decisiones declaradas "settled" (`D-02` y `D-05`) que deja una pantalla —el partido sin equipos generados— donde "oculto" sigue activo y no existe el botón para volver a "visible" (hallazgo 2). Si el autor acota el alcance de "oculto" en la propia Concept Note, ese hallazgo baja a 🟡. Los otros tres 🟡 son correcciones de precisión que conviene resolver antes de escribir la Spec. *(Crítica de mismo proveedor, distinta familia: el hueco de independencia entre proveedores sigue abierto.)*

## Findings

### Per-doc — Accuracy

### 1. `updateTeamTotalsDisplay` no tiene ningún llamador: el riesgo de "total reescrito fuera del repintado" descansa en código muerto

- **Dimension:** Accuracy
- **Where:** `OCULTAR_PUNTAJES_CONCEPT.md` §6.5 (cita `index.html:5207-5215`), §11 (tercer riesgo), §16 (*Para el Plan*)
- **What:** §6.5 afirma que "el total por equipo se actualiza también fuera del repintado (por `id`), así que ocultarlo no es sólo una cuestión del dibujo inicial". La función existe (`index.html:5211`) pero ninguna parte de `index.html` ni de `tests/*.js` la llama.
- **Why it matters:** §11 y §16 convierten esa afirmación en un riesgo "Med/Med", en un escenario de arrastre en la Spec y en una nota para el Plan. Si el único código que escribe por `id` es inalcanzable, el riesgo real es otro (que alguien la reconecte) y el Plan puede decidir borrarla en vez de protegerla.
- **Evidence:** `grep -rn updateTeamTotalsDisplay index.html tests/*.js` → una sola coincidencia, la definición. Los `id="totalBlancoSpan"` / `totalNegroSpan` se escriben sólo en el render (`index.html:7275`, `7278`) y los lee `tests/layout.test.js:2440, 2533, 3172, 3192`. *(Lo que no verifiqué: si algún caller se arma dinámicamente por nombre; la búsqueda por texto no lo encontraría.)*
- **Confidence:** Medium-High
- **Severity:** 🟡 Should fix
- **Suggested fix:** corregir la nota "Codebase evidence" a "función definida y sin llamadores a la fecha", y reformular el riesgo de §11 como "si se reconecta" — o retirarlo. En §16, pedirle al Plan que decida si borra la función.

### Per-doc — Consistency

### 2. Con `D-05` (estado global) y `D-02` (se oculta el combo y los avisos), el partido sin equipos generados queda sin salida

- **Dimension:** Consistency
- **Where:** §10 `D-01`, `D-02`, `D-05`; §8.1; §16 *Settled*
- **What:** `D-01` pone el botón sólo en cuatro situaciones (todas con equipos generados) y `D-05` hace que "oculto" valga "para cualquier partido que se abra". Pero la pantalla de un partido sin equipos (`!m.equipos`) dibuja el combo de estrategia, el aviso de bloqueo y "Generar equipos" **sin** ningún botón de ojo. Si el administrador deja "oculto" en el partido A y abre el partido B sin equipos, `D-02` ("en oculto no se dibuja… el combo de estrategia; el aviso… de bloqueo") se aplica sin que haya forma de volver a "visible".
- **Why it matters:** el administrador no puede elegir estrategia ni ve por qué "Generar" no hace nada (el aviso de bloqueo habla de posiciones viejas, no de puntajes), y el botón que lo arreglaría no existe en esa pantalla. Es la misma trampa que `OPEN-Q-04` describe para el aviso, pero sin Regenerar de por medio y sin salida. Como §16 marca `D-01`/`D-02`/`D-05` como "do not relitigate", la Spec no podría resolverlo sin reabrirlas.
- **Evidence:** `index.html:7145-7176` (dos ramas tempranas: sin titulares y sin equipos) dibujan `renderComboEstrategia` (7139), `renderAvisoBloqueo` (7167) y el botón "Generar equipos" (7164) y retornan antes de llamar a `renderEncabezadoTarjeta` / `renderEncabezadoPartidoFinalizado`, que son los dos lugares donde `D-01` pone el ojo. El texto de `D-05`: "vale para cualquier partido que se abra".
- **Confidence:** Medium-High (por lectura del código; no se probó en el navegador)
- **Severity:** 🔴 Blocking *(baja a 🟡 si el documento acota el alcance)*
- **Suggested fix:** decidir ahora, en una de estas dos direcciones, y escribirlo en `D-02`/`D-05`: (a) "oculto" sólo afecta lo que se dibuja con equipos generados (el combo y los avisos de la pantalla sin equipos no se tocan); o (b) el estado vuelve a "visible" al abrir un partido sin equipos o al cambiar de partido. Agregar la pantalla "sin equipos generados" a §8.1 como situación explícitamente **fuera** del botón.

### Per-doc — Completeness

### 3. La declaración de reemplazo del spec de partido finalizado cita FR pero no los escenarios ni los criterios que afirman el "pts"

- **Dimension:** Completeness
- **Where:** §16 *Declaración de reemplazo obligatoria*; §10 `D-06`; §2 Pain 3
- **What:** el documento declara que reemplaza "la parte de `FR-041`, `FR-042b` y `FR-060`". Esas tres FR, leídas en `PARTIDO_FINALIZADO_SPEC.md`, son ciertas (FR-041 línea 451, FR-042b línea 462, FR-060 línea 501). Pero el mismo spec afirma el "pts" también en `S-04` y su variante `S-04b` (líneas 637-658) y en `AC-05` (línea ~753), y `AC-06` (línea ~757) habla de la fila de resultado del rol `jugador`. Además `tests/layout.test.js:1578` y `:1604` exigen los dos `.resultado-puntaje` a 1200 px.
- **Why it matters:** `AGENTS.md` pide declarar qué parte de un spec existente se reemplaza y marcarla ahí; con sólo las FR marcadas, `S-04`/`AC-05` siguen diciendo que `jugador` ve el puntaje y el test que las enlaza seguirá pasando (o fallará sin que el spec explique por qué). Dos precisiones más sobre ese spec: (i) `FR-042b` gobierna el encabezado del campo **en una columna**, no la fila de resultado, y Pain 3 lo presenta junto a `FR-041` como si ambos fueran la fila; (ii) `FR-060` es el requisito que **argumenta lo contrario** —que la lista de restricciones de `007` es taxativa— y el Concept lo cita como causa del bug sin reconocer que `PARTIDO_FINALIZADO_SPEC` ya consideró `007` y decidió que no aplicaba. El argumento más fuerte para la contradicción es `FR-013` de `007` ("equipos ya armados (sin puntajes, estrategia, diferencias…)", `spec.md:106`), y conviene citarlo en Pain 3.
- **Evidence:** ver líneas arriba. Para el modo de carga del rol `jugador`, `index.html:7238` dibuja `renderFilaResultado` (con "pts") durante la inscripción cerrada; `CARGA_POR_TOQUE_SPEC.md:83-90` sólo reemplaza `FR-063`/`FR-064` de partido finalizado y no declara qué dice la fila de carga sobre puntajes — no verifiqué qué FR de la rebanada 6 gobierna ese caso.
- **Confidence:** High (para S-04/AC-05); Medium (para la rebanada 6)
- **Severity:** 🟡 Should fix
- **Suggested fix:** ampliar la declaración de §16 a `FR-041`, `FR-042b`, `FR-060`, `S-04`, `S-04b`, `AC-05` y `AC-06` de `PARTIDO_FINALIZADO_SPEC.md`, aclarar qué hace cada una (acota / invierte), citar `FR-013` de `007` como texto que sostiene la contradicción, y dejar como tarea de la Spec confirmar qué requisito de la rebanada 6 cubre el "pts" de `jugador` en modo carga.

### 4. La lista de `D-02` no cubre lo que se dibuja durante la selección para intercambiar puesto

- **Dimension:** Completeness
- **Where:** §10 `D-02`, `D-03`, `D-04`; §11; §15 `OPEN-Q-02`
- **What:** `D-04` dice que los gestos de edición, incluido "tocar para intercambiar", siguen funcionando en "oculto". Con una camiseta seleccionada, las candidatas "con costo" se pintan en rojo (`.camiseta.candidata.con-costo`) y cada pestaña muestra cuántas opciones tiene. El tinte rojo dice quién quedaría fuera de puesto —es la misma información que `D-02` oculta con la «!»—, y no está en `D-02` ni se declara visible en `D-03`.
- **Why it matters:** una captura sacada con una selección viva (el administrador está en medio de un intercambio) filtra posición aunque «2º», «!» y las pestañas estén ocultas. `OPEN-Q-02` sólo cubre los tooltips y el nombre accesible, no el color.
- **Evidence:** `index.html:5403-5405` (clase `con-costo`), `index.html:813` (rojo `rgb(239 68 68 / 0.18)`), `index.html:5807` (cuenta en la pestaña). Tooltips ya cubiertos: `index.html:5416-5423`.
- **Confidence:** Medium (depende de si el owner considera que una captura con selección viva es un caso real)
- **Severity:** 🟡 Should fix
- **Suggested fix:** agregar el tinte `con-costo` (y la cuenta de opciones de la pestaña) a `D-02` o a un `OPEN-Q`, o declarar en `D-03` que "la selección en curso se ve igual" con su razón.

### 5. El handoff de responsive no menciona los huecos que dejan las filas de resultado y los encabezados de campo

- **Dimension:** Completeness
- **Where:** §16 *Responsive*; §11 (riesgo de 360 px)
- **What:** §16 pide declarar el comportamiento "sin huecos donde estaban la píldora y la grilla". No menciona qué queda donde estaba el "pts" de la fila de resultado (dos columnas) ni del encabezado de campo en una columna. En ese último caso, `encabezadoCampo` seguiría devolviendo el nombre del equipo, que el CSS oculta en esa banda, y `renderZonaEquipos` dibuja el `<h4>` mientras el encabezado sea no vacío.
- **Why it matters:** quedaría un `<h4>` con margen y sin contenido visible, justo el tipo de hueco que `tests/layout.test.js` debe detectar; y el mismo efecto aplica a `jugador` una vez corregido `D-06`.
- **Evidence:** `index.html:7206-7208` (encabezado = nombre + total), comentario de `7203-7205` (CSS oculta el nombre), `index.html:5863` (`<h4>` si `header` es verdadero).
- **Confidence:** Medium (no medido en el navegador)
- **Severity:** 🔵 Suggestion
- **Suggested fix:** ampliar la nota de §16 para nombrar las tres superficies (fila de resultado en dos columnas, encabezado de campo en una columna, encabezado de campo del armado) y pedir un escenario de `tests/layout.test.js` por cada una.

### Per-doc — Clarity

### 6. La etiqueta `[INFERRED]` de "0 pts" es correcta pero subestima la evidencia, y mezcla dos cosas

- **Dimension:** Clarity
- **Where:** §2 Pain 3, §16 *Deuda de verificación heredada*
- **What:** la deducción pedida —que a `jugador` le aparece "0 pts" en cada equipo— se sostiene **por lectura de código en ambas estrategias**. Lo que no se comprobó es el comportamiento en vivo, y el documento ya lo dice. Pero el texto junta "el número no es el real" (hecho) con "0 pts" (deducción) y no deja el mecanismo a la vista.
- **Why it matters:** el lector de la Spec necesita saber qué parte es hecho para poder escribir el escenario del bug sin volver a investigar; la única parte que requiere cuenta `jugador` de staging es el valor mostrado, no la causa.
- **Evidence (mecanismo verificado):** `jugador` no carga `playerScores` (`index.html:2276` lista `DOCS_SOLO_ADMIN`; `index.html:2356-2359` sólo lee scores `if(admin)`); `players.forEach(p => { if(!p.scores) p.scores = {}; })` (`index.html:~2349`) → `puntajeEnPosicion` devuelve 0 (`index.html:2229-2232`) → con posiciones asignadas, `valorDePuntaje` devuelve `null` (0 no es `> 0`, `index.html:5235-5236`); sin posiciones asignadas, `computeAvg` devuelve `null` con scores vacíos (`index.html:2199-2200`) → `sumaVigenteDeEquipo` suma `valorDePuntaje(...) || 0` (`index.html:6442`) → **0** → `puntajeTexto` / `renderFilaResultado` lo muestran como "0 pts" (`7200`, `7462`). Nota: el valor guardado `sumaBlanco`/`sumaNegro` que cita `FR-042b` **no** se usa en el dibujo actual, y `jugador` tampoco lo recibe (`partidosArmado` es sólo de `admin`, `index.html:2276`).
- **Confidence:** High (código); el valor visible en vivo sigue sin observarse.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** en Pain 3, separar en dos oraciones: "Hecho (código leído): el total se suma sin los puntajes y da 0" y "Sin comprobar: lo que se ve en la pantalla con una cuenta `jugador` de staging", con la cadena de llamadas arriba como evidencia en §6.5.

### Per-doc — Methodology-invariants

### 7. Sin hallazgos de invariantes `MD-*` que bloqueen

- **Dimension:** Methodology-invariants
- **Where:** documento completo
- **What:** verificado — `MD-05` IDs `D-01`…`D-07`, `OPEN-Q-01`…`04` únicos y sin saltos; `MD-10` marcadores `[INFERRED]` presentes donde corresponde; `MD-25` §6.5 con las tres sub-listas, cada cita con su nota; `MD-24` §5.1 declarado "No aplica" con razón; `MD-31` §5.2 con las tres líneas; goals vs non-goals disjuntos (§3/§4); §4 vs §14 sin duplicados; cada alternativa de §9 con su "why rejected"; §16 con IDs concretos; Change log con modelo autor, como pide `AGENTS.md`.
- **Evidence:** sección-por-sección en §3, §4, §6.5, §9, §10, §14, §16, §18.
- **Confidence:** High
- **Severity:** None ✓ *(salvo lo señalado en los hallazgos 1-6)*
- **Limitación honesta del crítico:** no volví a verificar los dos enlaces externos que el autor marca como "verificado el 2026-11-20" (WCAG 4.1.2 en w3.org y los íconos `eye`/`eye-off` en unpkg); no son citas de este repositorio y la sesión de crítica no volvió a pedirlas. Se dejan como **UNVERIFIED por el crítico**, no como erróneas.

## Verificación de citas (lo pedido en la instrucción 2)

| Cita del documento | ¿Dice lo que el documento afirma? |
|---|---|
| `index.html:5433-5437` puntaje de la camiseta, con guarda `admin` | ✓ (`valor = admin ? … : null`, línea 5388) |
| `index.html:5442-5449` candado sólo con `esFilaEditable` | ✓; además `esFilaEditable` exige `isAdmin()` (`5245`) |
| `index.html:5518-5526` «2º» y «!» sin guarda de rol | ✓ |
| `index.html:5799-5806` «!» de las pestañas | ✓ (el `aria-label` con "N fuera de puesto" en `5801-5805`) |
| `index.html:6931-6961` orden de botones y píldora en dos columnas | ✓ (Intercambiar, Copiar, Regenerar; píldora `admin && resumen && !enUnaColumna()`) |
| `index.html:6957`, `7271` píldora | ✓ |
| `index.html:6944-6946` Copiar sin puntajes | ✓ (comentario y texto que copia) |
| `index.html:6969-7020` combo y avisos, sólo `admin` y con inscripción abierta | ✓ |
| `index.html:7134-7289` `renderTeamsSectionImpl` y sus tres ramas | ✓ (7198-7227, 7229-7250, 7252-7289) |
| `index.html:7206-7208`, `7275`, `7460-7468` lugares del total | ✓ |
| `index.html:7282-7283` grilla y receipt, sólo `admin` | ✓ |
| `index.html:7474-7488` encabezado del finalizado: Copiar y Editar | ✓ |
| `index.html:6440-6443` `sumaVigenteDeEquipo` | ✓ |
| `index.html:2276`, `2512-2516` `playerScores`/`partidosArmado` y posición pública | ✓ (la posición no está en `CAMPOS_EQUIPOS_ARMADO`, `2517`) |
| `index.html:899-903` `.panel-icono` de 44 px y `.panel-icono-copiar` con `var(--muted)` | ✓ (`903` para el color) |
| `index.html:4836-4843` Generar sólo repinta con titulares a revisar | ✓ |
| `index.html:1545-1562` preferencia de orden en Firestore por cuenta | ✓ |
| `index.html:7905-7986` lista de convocados sin puntajes | ✓ en el fondo (sin "pts"/"puntaje" en 7902-7990); la función arranca en 7902, no 7905 |
| `index.html:5207-5215` total actualizado fuera del repintado | ✗ función sin llamadores (hallazgo 1) |
| `007 spec.md:23`, `FR-004`, `FR-006`, `FR-013` | ✓ (líneas 23, 96, 98, 106) |
| `PARTIDO_FINALIZADO_SPEC.md` `FR-041`, `FR-042b`, `FR-060` | ✓ existen y dicen lo descrito, con los matices del hallazgo 3 |
| `firestore-rules.md §3` filas `data/playerScores`/`partidosArmado`, "—" para `jugador` | ✓ (líneas 239-240, dentro de §3) |
| `handoff/README.md:728-729` `showRatings`/`showLocks` | ✓ |
| `EQUIPOS_EN_EL_CAMPO_CONCEPT.md:571-572` diferidas a la rebanada 7 | ✓ |
| `Roadmap.md:47` rebanada 7 | ✓ |
| `Icon.prompt.md:1`, `Icon.jsx:3` Lucide `lucide-static@0.544.0` | ✓ |
| `006-copiar-formacion/spec.md` | ✓ existe |

## Summary

- Blocking: 1
- Should fix: 3 (1 accuracy, 2 completeness)
- Suggestions: 2
- Methodology-invariants violated: ninguna (los hallazgos 1 y 2 son de exactitud y consistencia de contenido, no de `MD-*`); `MD-26` queda tocada por el hallazgo 1 (una nota "qué fijó la cita" que no coincide con el código)
