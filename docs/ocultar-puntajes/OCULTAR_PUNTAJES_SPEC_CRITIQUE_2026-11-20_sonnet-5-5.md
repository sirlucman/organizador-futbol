# Critique — OCULTAR_PUNTAJES_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (el identificador que informa la sesión en curso)
> **Author model:** claude-opus-5-5 (Change log de la Spec, filas del 2026-11-20)
> **Independencia (Step 7.0):** misma marca (Anthropic), familias distintas (Opus autor / Sonnet crítico) → *proceed with caveat*: el crítico puede compartir sesgos residuales de entrenamiento con el autor. Los datos de modelo los dio el owner en el pedido.
> **Date:** 2026-11-20
> **Inputs:** `docs/ocultar-puntajes/OCULTAR_PUNTAJES_SPEC.md` (rama `docs/ocultar-puntajes`, HEAD `083cd1c`). Contrastado con `OCULTAR_PUNTAJES_CONCEPT.md`, `OCULTAR_PUNTAJES_CONCEPT_CRITIQUE_2026-11-20_sonnet-5-5.md`, `AGENTS.md`, `index.html`, `tests/layout.test.js`, `tests/fixtures-app.js` y las seis specs que la declaración de reemplazo nombra (`CANCHA_SPEC`, `PANEL_ARMADO_SPEC`, `PARTIDO_FINALIZADO_SPEC`, `POSICIONES_DEL_JUGADOR_SPEC`, `CARGA_POR_TOQUE_SPEC`, `DESGLOSE_POSICIONES_SPEC`).
> **Modo:** per-doc. No se editó la Spec ni ningún otro archivo.

## Verdict

**COMMENT** — 0 🔴, 5 🟡, 5 🔵. La Spec está bien fundada: de las 22 citas a `index.html` y `tests/` que verifiqué (tabla al final del pedido 1), todas existen y dicen lo que la Spec afirma (tabla al final), salvo una descripción de pantalla inexacta (hallazgo 1). La declaración de reemplazo es casi completa y las notas recíprocas están en las cuatro specs que la Spec dice haber marcado. Lo que pide atención antes del Plan: `FR-017` describe una pantalla que no es la del código (1); la declaración de reemplazo aplica un criterio distinto a requisitos casi idénticos de `PANEL_ARMADO_SPEC` y `POSICIONES_DEL_JUGADOR_SPEC` (2); `FR-018` es una decisión nueva que el Concept Note no registra (3); varios `FR` son compuestos (4); y `NFR-003` no puede detectar el hueco que dice cubrir (5). *(Crítica de misma marca, distinta familia: el hueco de independencia entre proveedores sigue abierto.)*

## Findings

### Per-doc — Accuracy

### 1. `FR-017` y el Glosario describen la pantalla del partido sin equipos como el código no la dibuja

- **Dimension:** Accuracy
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §7.2 `FR-017` (línea 295); §6 Glosario "Partido sin equipos" (línea 254); `S-05` (línea 493)
- **What:** `FR-017` dice que, sin equipos generados, el sistema "mostrará el combo de estrategia, el aviso de bloqueo y 'Generar equipos' sea cual sea el estado". El Glosario dice que esa pantalla "dibuja 'Generar equipos'" y cita `index.html:7145-7176`. Ese rango son dos ramas distintas y sólo una dibuja eso.
- **Why it matters:** `FR-017` está escrito como obligación nueva ("mostrará"), no como "no cambia lo que hoy se dibuja". Un implementador que lo lea al pie de la letra agregaría cosas que hoy no existen o que dependen del rol. Y el Plan no puede relitigarlo (§17).
- **Evidence:** (Hecho, leído en `index.html`)
  - Rama sin titulares (`index.html:7145-7149`): dibuja sólo el combo y el estado vacío "Sin titulares". No hay botón "Generar equipos" ni aviso de bloqueo.
  - Rama con titulares y sin equipos (`index.html:7151-7176`): sí dibuja "Generar equipos", pero sólo con `isAdmin()` (7163-7165).
  - El combo devuelve vacío para `jugador` y con la inscripción cerrada (`index.html:6970-6975`). El aviso de bloqueo, igual, y además sólo si hay titulares a revisar (`index.html:7004-7008`).
  - `S-05` ya dice "si corresponde" para el aviso, pero `FR-017` no.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** reescribir `FR-017` como "While el partido abierto no tenga equipos generados, el sistema dibujará la pantalla igual en "visible" y en "oculto"" (State-driven, una sola obligación), y corregir el Glosario para distinguir las dos ramas. `S-05a` ya cubre la rama sin titulares; falta una variante para la rama con titulares y `admin` que compruebe el botón "Generar equipos" en "oculto".

### Per-doc — Consistency

### 2. La declaración de reemplazo no aplica el mismo criterio a requisitos casi idénticos

- **Dimension:** Consistency (con efecto en Completeness)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` encabezado, tabla 2 (líneas 36-41); `AGENTS.md` ("Cuando un documento nuevo modifica comportamiento ya descripto en un spec existente, DEBE declararlo")
- **What:** la tabla acota `FR-070` de `POSICIONES_DEL_JUGADOR_SPEC.md` "sólo en lo que muestra (los totales, la diferencia entre equipos y la diferencia por línea; el recálculo no cambia)". Pero no acota los requisitos equivalentes de `PANEL_ARMADO_SPEC.md`, que dicen lo mismo con las mismas palabras. Tampoco acota el que fija el aspecto de la píldora.
- **Why it matters:** `AGENTS.md` dice que sin la declaración "dos specs vigentes se contradicen". Hoy `PANEL_ARMADO_SPEC` dice que se recalcula y muestra la diferencia en la píldora, y que se distingue visualmente la píldora, sin la nota de "sólo en visible". Quien lea ese spec sin ver éste no sabe que en "oculto" no pasa.
- **Evidence:** (Hecho, leído en `PANEL_ARMADO_SPEC.md`; sin nota `Acotado el 2026-11-20` en ninguno de estos)
  - `FR-037`: "distinguirá visualmente la píldora de diferencia del encabezado". Es el aspecto de la píldora que `FR-028` hace desaparecer.
  - `FR-070`: "recalculará la diferencia de puntaje mostrada en la píldora".
  - `FR-070b`: "el número del encabezado de cada campo y el que la fila de resultado muestra a cada costado". Los dos puntos que `FR-025` a `FR-027` y `FR-050` a `FR-052` sacan.
  - `FR-071`: "recalculará la diferencia por línea de cada celda".
  - `FR-074`: "recalculará la cuenta de titulares sin puntaje por equipo que muestra el receipt".
  - Marcados sí: `FR-003`, `FR-004`, `FR-005`, `FR-009`, `FR-010`, `FR-020`, `FR-030`, `FR-040`, `FR-052`, `FR-054`, `FR-072b`. La tabla 2 declara los mismos once y ninguno más.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** o se agregan `FR-037`, `FR-070`, `FR-070b`, `FR-071` y `FR-074` de `PANEL_ARMADO_SPEC.md` a la tabla 2 (y se marcan, con la misma fórmula "sólo cambia lo que se dibuja; el cálculo no cambia"), o se declara en la Spec el criterio para no hacerlo ("se marcan los requisitos que nombran el elemento; los que describen el cálculo, no") y se aplica a `POSICIONES FR-070` también. Aprovechar para volver mecánico `AC-04`: hoy dice "lo verifica quien revisa", pero se puede comprobar con un `grep` por requisito de la tabla. (Lo hice a mano: los 19 requisitos de `CANCHA` (5), `PARTIDO_FINALIZADO` (7) y `POSICIONES` (7) y los 11 de `PANEL` que la tabla lista sí tienen su nota.)

### 3. `FR-018` (volver a "visible" al cambiar la sesión): está bien fundado, no contradice `D-05`, pero es una decisión que el Concept Note no registra

- **Dimension:** No silent drift (Dim X4), con efecto en Accuracy
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §3.3 (líneas 122-125), `FR-018` (líneas 298-301), `S-05c`, `S-09d`; `OCULTAR_PUNTAJES_CONCEPT.md` `D-05`, §16, §18
- **What:** respuesta a la pregunta 4 del pedido.
  - **¿Está fundado?** Sí. (Hecho) El cierre de sesión no recarga la página: la rama de `onAuthChange` con `user` nulo oculta la app y llama `clearRenderedState()` (`index.html:8775-8786`). Esa función ya reinicia el resto del estado en memoria ligado a la cuenta: `currentMatchId`, `resultadoDraft`, `editandoResultadoFinalizado` (`index.html:8423-8446`). Así que `FR-018` sigue un patrón que ya existe.
  - **¿Contradice `D-05`?** No, literalmente. `D-05` dice "arranca en 'visible' y vuelve a 'visible' al recargar; cambiar de partido no lo cambia; no se guarda". No habla de sesiones. Un reinicio al cerrar sesión no es guardar ni cambia de partido.
  - **¿Qué le falta?** (a) `D-05` figura como "Settled, do not relitigate" (Concept §16) y la Spec lo rotula "heredada" mientras le suma una regla. Cuando la Spec sumó cosas a `D-02`/`D-03`, el Concept Note se enmendó (Concept §18, tercera fila). Con `FR-018` no. Dim X4: "Spec encodes a decision the Concept Note did not record". No es "silencioso" (la Spec lo declara), por eso 🟡 y no 🔴. (b) La frase "`D-05` no lo previó porque supone que la única forma de empezar de nuevo es recargar" es una inferencia sobre la intención del Concept Note que no está marcada `[INFERRED]` y que `D-05` no dice. (c) El disparador está ambiguo: "cuando se cierra la sesión o se abre una sesión nueva". El comentario de `index.html:8415` dice que `onAuthChange` "dispara más de una vez" (Hecho: está escrito ahí; Guess: que eso incluya re-disparos con el mismo usuario sin cierre, no lo probé). Si el reinicio se engancha a la rama del usuario y no a la del cierre, un re-disparo dejaría a un `admin` en "visible" sin haber tocado el ojo.
- **Why it matters:** `S-09d` y la garantía de `FR-061` para `jugador` dependen *sólo* de que `FR-018` se implemente bien. Si se olvida el reinicio, un `jugador` que entra tras un `admin` en "oculto" pierde las pastillas «2º» y «!», que `D-07` le garantiza. Y la trazabilidad (Concept ↔ Spec) queda rota para esa regla.
- **Evidence:** líneas citadas arriba; `tests/fixtures-app.js:501` define `signOut: async () => {}` (no dispara `onAuthChange(null)`), así que `S-05c`/`S-09d` necesitan que el fixture lo haga (ver hallazgo 8).
- **Confidence:** High (hechos de código); Medium (re-disparo con el mismo usuario)
- **Severity:** 🟡 Should fix
- **Suggested fix:** (1) enmendar el Concept Note con una fila de Change log y una línea en `D-05` ("vuelve a 'visible' al cambiar la sesión"), igual que se hizo con `D-02`/`D-03`; o, si el owner prefiere no tocarlo, rotular `FR-018` como decisión nueva de la Spec con su motivo, sin atribuirle una "suposición" a `D-05`. (2) Redactar `FR-018` en una sola cláusula anclada al cierre: "When se cierra la sesión, el sistema volverá el estado a 'visible'", y sacar el porqué del requisito (va al párrafo de §3.3). (3) Opcional, como defensa en profundidad: que los elementos de §7.3 sólo se oculten cuando el rol es `admin` y el estado es "oculto", así `FR-061` vale aunque falle el reinicio. Eso es una decisión de diseño; se la dejo al owner y al Plan.

### Per-doc — Completeness

### 4. Lo que se sigue dibujando en "oculto" no nombra el aviso (toast) que dice en qué puesto no juega alguien

- **Dimension:** Completeness
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §7.3 / §7.4 (`FR-040`)
- **What:** la búsqueda en `renderTeamsSectionImpl` y sus funciones auxiliares encontró **un solo** elemento con indicio de posición que la lista de §7.3 no nombra: el aviso emergente de un intercambio rechazado. Dice, por ejemplo, "Ana no juega de Defensor" (`a-no-cubre`).
- **Why it matters:** un aviso transitorio puede quedar en una captura. Quizá el owner lo acepte (sólo sale tras un gesto, y no menciona puntajes), pero hoy `FR-040` lo deja implícito: "todo elemento que §7.3 no nombra se dibuja igual". Conviene que la decisión sea explícita, porque `D-02` se justifica con "que la captura no tenga ningún indicio de puntajes ni de cómo se armaron".
- **Evidence:** (Hecho) `textoAvisoIntercambio` (`index.html:6016-6022`) arma el texto con `nombreDe(d.puestoB)`. Lo muestran `__showToast` en `index.html:5608`, `5612` y `6238`. En "oculto" el gesto sigue disponible (`FR-042`).
- **Confidence:** Medium (depende de si el owner lo considera un indicio)
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar a §7.4 o a §3.2 una línea explícita: "los avisos de intercambio rechazado se dibujan igual en los dos estados" (o, si el owner decide lo contrario, un `FR` en §7.3 y una variante de `S-06`).
- **Resultado del barrido (pedido 3):** el resto de §7.3 está completo contra el código. Verifiqué que cada puntaje, total, indicio de posición o de armado dibujado en la tarjeta está en la lista: puntaje de camiseta y su `title` "Suma su puntaje de…" (`5433-5436`, dentro del mismo `<span>`), «2º»/«!» (`5524-5526`), candado (`5442-5449`), «!» y cuenta de las pestañas (`5800-5807`), píldora y su `title` (`6911-6918`), los tres "pts" (`7275`/`7278`, `7207`, `7462`), grilla con su "Desvío aceptable ≤ N pts" (`7023-7038`), "Por qué quedaron así" (`7055-7085`), combo (`6969-6985`), aviso de desactualizado (`6990-6999`), rojo `con-costo` en selección (`5402-5405`) y en arrastre (`6171-6177`), `title` de la camiseta (`5413-5428`). El aviso de bloqueo queda por decisión del owner. Los textos fijos del pie (`7285-7286`) hablan de partidos jugados y estadísticas, no de puntajes. La lista de convocados (`7905-7990`) no tiene puntajes ni candados.

### Per-doc — Clarity

### 5. `NFR-003` no puede detectar el hueco que dice cubrir

- **Dimension:** Clarity (NFR medible)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §8 `NFR-003` (línea 393), §15 (riesgo "Un encabezado de campo vacío queda con margen"), `TC-030`, `FR-038`
- **What:** `NFR-003` mide "ningún contenedor vacío con alto mayor que 0". Pero el riesgo que quiere cubrir es el *margen* que deja un encabezado vacío, no su alto.
- **Why it matters:** `TC-030` exige ver fallar el escenario antes del arreglo. Un encabezado vacío tiene alto 0, así que la medida pasa también *antes* de aplicar `FR-038`: el escenario no podría verse fallar. Además "contenedor vacío" no enumera cuáles (sólo nombra la fila de la píldora y el encabezado de un campo).
- **Evidence:** (Hecho) `.team-panel h4` tiene `margin: 0 0 12px` y ningún `min-height` (`index.html:498`); en una columna su único hijo, `.team-name`, está en `display:none` (`index.html:834`). (Inferencia, no medida en navegador) un `<h4>` así mide 0 de alto y 12 px de margen. El test actual ya usa presencia para esto: `if (document.querySelector('.team-panel h4'))` (`tests/layout.test.js:1608`).
- **Confidence:** Medium (no lo medí en un navegador)
- **Severity:** 🟡 Should fix
- **Suggested fix:** reescribir `NFR-003` por presencia, consistente con `TC-012`: "En 'oculto', y para `jugador` en cualquier estado, a 360 y a 1200 px, el documento no contiene ningún `.team-panel h4` sin contenido visible ni `.panel-pildora-fila`", o medir el hueco vertical entre rectángulos vecinos. Enumerar los contenedores.

### 6. Varios `FR` son compuestos: una sola prueba no puede atarlos a un ID

- **Dimension:** Clarity (MD-03 EARS)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §7
- **What:** el método pide una obligación por línea. Compuestos por la cantidad de obligaciones o por llevar justificación dentro del requisito:
  - `FR-016`: conserva cuatro cosas (equipo visible, selección, tipo de evento, scroll). Cada una necesita su propia comprobación; `S-04d` y `S-06b` ya las parten, el `FR` no.
  - `FR-036`: arma el `title` y enumera cinco exclusiones.
  - `FR-038`: una condición, una extensión a `jugador`, la razón de CSS y una aclaración sobre `D-07`.
  - `FR-040`: lista unas doce familias de elementos.
  - `FR-042`: siete gestos más una excepción con motivo.
  - `FR-043`: dos obligaciones (repintar respetando §7.3 *y* conservar el estado).
  - `FR-018`: lleva su porqué dentro (ver hallazgo 3).
  - `FR-005` (tamaño, forma y color) y `FR-002` (tres ubicaciones) son más leves.
- **Why it matters:** `AGENTS.md` pide que el test lleve el ID del requisito en un string literal. Un test que cubre `FR-042` entero pasa o falla por siete cosas distintas; no se sabe cuál se rompió.
- **Evidence:** el texto de cada uno, §7.2 a §7.4.
- **Confidence:** High
- **Severity:** 🟡 Should fix (🔵 para `FR-002` y `FR-005`)
- **Suggested fix:** partir `FR-016` en cuatro, `FR-043` en dos, sacar los motivos a una nota debajo y, para `FR-036`/`FR-040`/`FR-042`, o partirlos o declarar que su test enumera cada ítem con una aserción propia (el nombre del caso lleva el ID una vez por ítem).

### Per-doc — Methodology-invariants

### 7. Las variantes usan los tags del conjunto cerrado de forma muy laxa, y falta una variante de cruce de ancho

- **Dimension:** Methodology-invariants (MD-22)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §9.1: `S-06b`, `S-07c`, y `S-11a`
- **What:**
  - `S-06b` está marcada `[concurrency]` pero es una interacción de estado (el ojo mientras hay una selección), no concurrencia.
  - `S-07c` está marcada `[failure]` pero describe una limitación documentada (no se puede bloquear en "oculto"), no una falla.
  - Casi todo el resto es `[boundary]`. No hay ninguna variante `[concurrency]` ni `[failure]` real.
  - Falta una variante que sí sería de este tipo: cruzar el punto de corte de 1099 px con el estado en "oculto". (Hecho) la aplicación repinta al cruzarlo (`index.html:5766-5768`), y en una columna cambia la estructura (selector, píldora en su propia fila). `S-11a` mide los dos anchos por separado, no el cruce con el estado vivo.
- **Why it matters:** el estado vive en memoria y debería sobrevivir, pero esa es justamente la clase de supuesto que una variante de cruce comprueba. Y un tag mal usado le quita información a quien arma el plan de pruebas.
- **Evidence:** líneas 537, 557, 628 de la Spec.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** retaguear `S-06b` y `S-07c` como `[boundary]`; agregar `S-05d [concurrency]` (o similar): con el estado en "oculto", cruzar de 1100 a 1099 px y volver deja el estado en "oculto" y sin la píldora ni el encabezado vacío.

### 8. Dos escenarios dependen de entornos de prueba que hoy no existen tal como la Spec los describe

- **Dimension:** Clarity (verificabilidad de escenarios)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` `S-06a`, `S-07`, `S-07d` (arrastre); `S-05c`, `S-09d` (cierre y nuevo ingreso sin recargar)
- **What:** respuesta a la pregunta 5 del pedido. Todos los escenarios y variantes son verificables *en principio* y casi todos con un caso concreto (valores, anchos, textos). Dos grupos necesitan una decisión de nivel de prueba que la Spec no menciona:
  - **Arrastre.** Los *Given/When* dicen "arrastra". (Hecho) el propio código dice que el navegador no deja sintetizar un arrastre nativo de punta a punta desde un test (`index.html:5874-5878`), y por eso la decisión vive en funciones puras. Hay que invocar los manejadores (`__dragStartJugador` y `marcarArrastreEnDom`, `index.html:6171-6177`) directamente.
  - **Sesión.** (Hecho) `tests/fixtures-app.js:501` define `signOut: async () => {}`: no dispara `onAuthChange(null)`. `S-05c` y `S-09d` necesitan que el fixture lo haga. Ya hay un precedente que cubre secuencias de ingreso y salida en un sandbox (`tests/sesion.test.js`, "40 secuencias").
- **Why it matters:** son decisiones de nivel (`unit` / `integration` / `e2e`) del Plan, pero conviene dejarlas a la vista: sin ellas, el Plan puede escribir una fila `e2e` que no se puede ejecutar.
- **Evidence:** líneas citadas.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar a §17 *Plan must also*: "los escenarios de arrastre invocan los manejadores directamente; el fixture de `layout.test.js` debe poder disparar `onAuthChange(null)` para `S-05c` y `S-09d`".
- **Medibilidad de los NFR (resto):** `NFR-001`, `NFR-002`, `NFR-004`, `NFR-005` y `NFR-006` son números o conjuntos vacíos comprobables mecánicamente (`scrollWidth === clientWidth`, 4 botones × 44 × 44 px en una fila, 0 lecturas y 0 escrituras observadas, 0 elementos de §7.3 en el HTML). `NFR-003`: ver hallazgo 5. `S-09c` y `AC-31` ("no contiene 'pts'") son comprobables porque para `jugador` ningún otro texto de la tarjeta lleva "pts" (revisado en `index.html`).

### 9. `AC-54` no se aborda, aunque `AC-55` sí

- **Dimension:** Methodology-invariants (MD-17)
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` §11.5 `AC-54` (línea 721), §12 y §8
- **What:** `AC-54` exige una fila `OBS-*` en el Plan por cada NFR cuantificado. Los seis NFR de §8 lo son. Pero §12 dice que "la aplicación no registra el uso del ojo (`D-05`)", y es una página estática sin telemetría. `AC-55` sí trae una declaración de cumplimiento vacuo ("el repositorio no versiona ningún lockfile…"); `AC-54` no.
- **Why it matters:** el Plan se ve obligado a inventar seis filas `OBS-*` para señales que la aplicación no emite, o a dejar `AC-54` sin cumplir.
- **Evidence:** líneas 721-722.
- **Confidence:** Medium (es una obligación del Plan; acá sólo se señala que la Spec podría anticiparla)
- **Severity:** 🔵 Suggestion
- **Suggested fix:** agregar una frase a `AC-54`, como la de `AC-55`: "la aplicación no emite telemetría; las filas `OBS-*` del Plan nombran el test de CI que mide cada NFR".

### 10. La instrucción del handoff sobre `tests/layout.test.js:1602-1606` no describe lo que hay

- **Dimension:** Accuracy
- **Where:** `OCULTAR_PUNTAJES_SPEC.md` encabezado (líneas 55-56) y §17 *Plan must also* (línea 781); también `OCULTAR_PUNTAJES_CONCEPT.md` §16
- **What:** la Spec dice que `layout.test.js:1602-1606` "hoy exige los dos puntajes de la fila de resultado a 1200 px … pasa a correr sólo con `admin` en 'visible'" y manda "moverlo a `admin` en 'visible'". (Hecho) ese bloque está dentro del escenario `partido-finalizado`, que ya es `rol: 'admin'` (`tests/layout.test.js:1539` hasta el siguiente escenario en `1618`). No hay nada que mover: ya corre sólo con `admin`.
- **Why it matters:** lo que falta es otra cosa: un escenario de `jugador` que afirme la *ausencia* del "pts". El único escenario `jugador` de partido finalizado (`partido-jugador`, `tests/layout.test.js:2961`) no mira `.resultado-puntaje` (el `grep` sólo lo encuentra en 1578 y 1604). Quien lea el handoff al pie de la letra no sabrá que `S-09`, `S-09a`, `S-09b` y `S-11d` necesitan escenarios nuevos que se vean fallar (`TC-030`).
- **Evidence:** `grep -n "resultado-puntaje" tests/*.js` → líneas 1578 y 1604, ambas en el escenario `admin`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** reemplazar la instrucción por: "agregar escenarios de `jugador` (finalizado y carga) que afirmen que no hay `.resultado-puntaje` ni `.team-total`; verlos fallar antes del arreglo (`TC-030`)". Y agregar a la lista de requisitos del Plan el escenario de `admin` en "oculto" para el mismo `partido-finalizado`.

## Verificación pedida

### Pedido 1 — citas a `index.html` (HEAD `083cd1c`; `git diff e77e06d HEAD -- index.html` está vacío, así que las líneas de la rama y las del commit citado coinciden)

| Cita de la Spec | ¿Dice lo que la Spec afirma? |
|---|---|
| `7238` (fila de resultado de `jugador` en carga) | ✓ `enModoCarga(m) ? renderFilaResultado(m) : ''` |
| `6935` ("Equipos copiados") | ✓ |
| `6892` `ICON_COPIAR` | ✓ |
| `6931-6961` `renderEncabezadoTarjeta` | ✓ (la función cierra en 6962) |
| `7474-7488` `renderEncabezadoPartidoFinalizado` | ✓ |
| `899-904` `.panel-icono` / `.panel-icono-copiar` | ✓ (la regla de Copiar es 902-903; 904 abre otro comentario) |
| `5843-5846` `display:none` y rectángulos de cero | ✓ |
| `5428` `escaparHtml(partes.join(...))` | ✓ |
| `809` estilo del candidato común | ✓ |
| `829` punto de corte 1099 / `834` `.team-name{display:none}` | ✓ |
| `888` `flex-wrap` del encabezado | ✓ |
| `6315-6317` `sePuedenIntercambiarColores` | ✓ (admin, con equipos, inscripción abierta, no finalizado) |
| `5412-5428` texto emergente de la camiseta | ✓ (menciones de `FR-036` en 5416-5423) |
| `5800-5805` nombre accesible de la pestaña | ✓ |
| `7145-7176` pantalla sin equipos | ✓ el rango existe; **su descripción es inexacta** (hallazgo 1) |
| `7239-7247` encabezado vacío de `jugador` | ✓ (7241 y 7244 pasan `''`) |
| `8740-8782` cierre de sesión sin recarga | ✓ (llama `clearRenderedState`, no recarga) |
| `7491-7494` `renderMatchesTab` / `currentMatchId` | ✓ |
| `2276` `DOCS_SOLO_ADMIN` | ✓ |
| `7198-7289` las tres ramas | ✓ |
| `5211-5216` `updateTeamTotalsDisplay` sin llamadores | ✓ (única coincidencia: la definición, en `index.html` y `tests/`) |
| `tests/layout.test.js:1602-1606` | ✓ el rango existe; **la instrucción sobre él no aplica** (hallazgo 10) |
| `Roadmap.md:47-48` (rebanada 7 acotada a `nameFormat`; recordar el ojo diferido) | ✓ |

### Pedido 2 — declaración de reemplazo contra cada spec

| Spec | (a) ¿cada requisito listado dice lo que se afirma? | (b) ¿falta alguno vigente que obligue a mostrar lo oculto? | (c) ¿nota recíproca? |
|---|---|---|---|
| `CANCHA_SPEC` (`FR-023b`, `024`, `025`, `027`, `030`) | ✓ los cinco existen y dicen lo descrito | No encontré faltantes (`FR-031`/`032`/`033`, candado, son condicionales a un gesto que no existe en "oculto") | ✓ cinco notas y fila de Change log (línea 828) |
| `PANEL_ARMADO_SPEC` (11 requisitos) | ✓ | **Sí: `FR-037`, `FR-070`, `FR-070b`, `FR-071`, `FR-074`** (hallazgo 2) | ✓ once notas y fila de Change log (línea 1223) |
| `PARTIDO_FINALIZADO_SPEC` (`FR-041`, `042b`, `060`, `S-04`, `S-04b`, `AC-05`, `AC-06`) | ✓ y la corrección de `AC-05` es cierta: contrasté el texto de `e77e06d` con la cita de la Spec y coinciden | No encontré faltantes (`FR-043`, `FR-021`, `FR-023` no obligan a mostrar el "pts") | ✓ siete notas y fila de Change log (línea 950) |
| `POSICIONES_DEL_JUGADOR_SPEC` (`FR-012b`, `021b`, `025`, `025b`, `025c`, `070`, `071`) | ✓ | No encontré faltantes | ✓ siete notas y fila de Change log (línea 942) |
| `CARGA_POR_TOQUE_SPEC` `FR-003` | ✓ dice literalmente "la cancha se muestra en el modo de lectura de la rebanada 4"; el `grep` por "puntaje"/"pts" sólo encuentra la línea 192 (no toca el puntaje del jugador) | — | No marcada, **por decisión explícita** de la Spec. Es coherente (el texto no cambia). Un lector llega al acotamiento siguiendo el puntero hasta `PARTIDO_FINALIZADO_SPEC`, donde sí está marcado |
| `DESGLOSE_POSICIONES_SPEC` `FR-042` | ✓ ("mostrará un aviso que nombra a cada titular a revisar") | — | No marcada; correcto: no se acota (`FR-041` de la Spec lo mantiene en los dos estados) |

### Pedido 4 — `FR-018` vs `D-05`

Respondido en el hallazgo 3: bien fundado en el código, sin contradicción literal con `D-05`, pero decisión nueva que debería quedar registrada en el Concept Note (o rotulada como tal en la Spec) y redactada con un disparador anclado al cierre de sesión.

### Pedido 5 — verificabilidad de escenarios y medibilidad de NFR

Resumen en los hallazgos 5, 6, 7, 8 y 9. Todos los `S-NN` y variantes tienen valores concretos y se pueden atar a un test; la deuda es de nivel de prueba (8), de tags (7) y de un NFR que no puede fallar (5).

## Lo que revisé y no tiene hallazgo

- IDs únicos y sin cruces: `FR-001`…`FR-061`, `NFR-001`…`006`, `TC-001`…`040`, `AC-01`…`55`, `S-01`…`S-11` con variantes (los saltos de numeración son bloques deliberados por tema).
- Cada `TC` tiene su `AC` en §11.3 (`TC-001`→`AC-15`, … `TC-040`→`AC-23`); `AC-50` a `AC-55` están completos (§11.5); toda `S-NN` tiene `Variants:` (no hay ninguna sin bloque).
- Cada decisión del Concept Note (`D-01` a `D-07`) aparece en §3.3, con la enmienda de `D-02`/`D-03` correctamente propagada (aviso de bloqueo fuera de §7.3, dentro de `FR-041`; rojo del arrastre en `FR-034`).
- Diagrama de `S-05`: `stateDiagram-v2` en §9, tres estados (≤15), sin `activityDiagram`. **No lo volví a renderizar**; me apoyo en lo que dice el Change log.
- Seguridad (`MD-31`): `TC-040` y los rulings de `CWE-200`/`-862`/`-863`/`-284` son coherentes con el Concept Note §5.2. Conté 25 categorías en el listado. **No volví a leer la página del CWE Top 25 2025** que la Spec dice haber consultado el 2026-11-20 (sin acceso a la red en esta sesión): queda como no verificado por el crítico, no como erróneo.
- `A-01` lleva `[INFERRED]`; §17 declara "un `[INFERRED]` en `A-01`". `OPEN-Q-01`/`02` son heredadas y llevan owner y etapa.
- Success metrics (§12) son de observación del owner y no numéricas; es coherente con `D-05` (sin telemetría) y no lo marco.

## Summary

- Blocking: 0
- Should fix: 5 (1 accuracy, 1 consistency, 1 no-silent-drift, 2 clarity)
- Suggestions: 5
- Methodology-invariants violated: ninguna bloqueante; `MD-22` tocada por el hallazgo 7, `MD-17` por el 9, `MD-03` por el 6, y la obligación de declaración de reemplazo de `AGENTS.md` por el 2

**Límites de esta crítica (honestos):** no corrí ningún test, no abrí la aplicación en un navegador (el hallazgo 5 y el re-disparo de `onAuthChange` del 3 son inferencias de código, marcadas), no volví a renderizar el diagrama y no consulté la página del CWE. No comprobé en vivo qué "pts" ve hoy `jugador` en staging (es `OPEN-Q-02` de la Spec).
