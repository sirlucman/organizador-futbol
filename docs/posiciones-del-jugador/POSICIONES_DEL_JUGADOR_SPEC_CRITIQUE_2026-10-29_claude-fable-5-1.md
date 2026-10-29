# Critique — POSICIONES_DEL_JUGADOR_SPEC.md (per-doc)

> **Critic model:** claude-fable-5-1 (leído de la configuración de esta sesión)
> **Author model:** claude-opus-5-5 (verificado en el encabezado de la Spec, línea 3, y en las nueve filas de su Change log, §18, líneas 972-979)
> **Date:** 2026-10-29
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` (árbol de trabajo en `046c6a4`, rama `docs/posiciones-del-jugador`) · `POSICIONES_DEL_JUGADOR_CONCEPT.md` (§10 `D-14` a `D-30`) · `POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md` (la crítica anterior) · `git diff d72952a 046c6a4 -- docs/` · `AGENTS.md` · `docs/equipos-en-el-campo/` (`EQUIPOS_EN_EL_CAMPO_CONCEPT.md`, `rebanada-2-arrastre/ARRASTRE_SPEC.md` en el árbol actual y en `4803d85^`, `rebanada-1-cancha/CANCHA_SPEC.md`, `rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md`, `rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md`) · `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` · `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` · `docs/rol-en-el-token/contracts/firestore-rules.md` · `index.html` en cada línea citada · `tests/layout.test.js`, `tests/fixtures-app.js` · `Roadmap.md` · `.claude/skills/football-app-design/components/feedback/`
> **Mode:** Step 7 independent critique, per-doc. Segunda crítica de esta Spec. Sólo lectura sobre la Spec y todo lo demás; sin commit.
> **Independence (Step 7.0):** modelo distinto, mismo proveedor (autor Opus → crítico Fable). Es el "término medio aceptable" de `critic-rubric.md`: rompe el lazo de mismo-modelo pero puede compartir sesgo residual de entrenamiento con el autor. No es una crítica de otro proveedor. Es además una familia distinta de la que hizo la crítica anterior (Sonnet), así que esta pasada no hereda sus ángulos muertos por construcción.
> **Chequeos pedidos por el propietario:** (1) estado de la crítica anterior, (2) alcance de `D-30`, (3) IDs retirados o reescritos citados con el significado viejo, (4) citas, (5) reemplazos y notas recíprocas, (6) testeabilidad, (7) inferencias como hechos y seguridad. Resultados en los Apéndices 1 a 7.

## Verdict

**COMMENT** — 0 🔴, 5 🟡, 8 🔵.

La corrección del 2026-10-29 cerró los dos bloqueos de la crítica anterior y lo hizo por el camino más corto: `D-30` retira el arquero improvisado, el valor especial y el arco en "Solo por puntaje", y con eso desaparecen los dos puntos en que la Spec describía un cálculo que el código no tenía (Apéndice 1). Lo que queda es de precisión. El hallazgo que más conviene mirar es el 1: el motor **ya conserva en el arco** a un jugador con candado cuyo puesto guardado es Arquero (`index.html:3364-3366`, `:3419-3422`, `:3375`, `:3385-3389`), así que la regla de `FR-062` —el arquero manual con candado deja el arco al regenerar— no sale de "dejar al motor como está" sino de que la interfaz le pase a propósito otro puesto que el que guardó. Es la decisión del propietario (`D-18`, `D-27`) y no se discute acá; lo que falta es que la Spec lo diga así, porque hoy se presenta como consecuencia de `TC-012` y la razón que da el Concept Note para `D-18` dejó de ser cierta con `D-30`. Los otros cuatro 🟡 son bordes sin escenario (arquero manual intercambiado con el arquero rival; arquero manual sin puntaje de Arquero cargado), una ambigüedad de `TC-042` frente al catálogo viejo, y una inferencia declarada en prosa que no lleva el marcador ni figura en la deuda de §17.

Ninguna decisión del propietario (`D-18` a `D-30`) se discute en este reporte.

## Findings

### Per-doc — Accuracy

#### 1. `FR-062` no es "lo que el motor hace con lo guardado": exige pasarle al motor un puesto distinto del guardado, y el porqué de `D-18` quedó obsoleto con `D-30`

- **Dimension:** Accuracy (con Consistency contra §3.2 y `TC-012`)
- **Where:** `POSICIONES_DEL_JUGADOR_SPEC.md` `FR-062` (líneas 532-534), `TC-012` (253-256), §3.2 última viñeta (136-137), §3.3 `D-18` (186-188) y `D-27` (209-210), `S-06a` (711)
- **What:** `FR-062` dice que al regenerar "el sistema no conservará el ARQ de ningún arquero manual, tenga candado o no; con candado … vuelve a su puesto anterior, que es el puesto previo que el motor recibe para él", y `TC-012` lo presenta como "qué puesto previo se le pasa al motor, no cómo lo usa". Leí el motor: las estrategias 2 y 3 (y la 4, que llama a la 3) inicializan el puesto de un jugador con candado con el que trae guardado (`index.html:3419-3422`, `:4092-4096`), y `asignarArquerosPorNiveles` trata como arquero natural a todo titular cuyo puesto así inicializado sea `'Arquero'` ("posición principal, **o persistida como Arquero si el titular está bloqueado**", comentario en `:3364-3366`; `naturalPool` en `:3375`); `resolverArqueros` deja a los bloqueados en su equipo y les cierra el slot (`:3181-3185`), y `asignarArquerosPorNiveles` los suma al equipo con su puntaje de Arquero (`:3385-3389`). Es decir: si la interfaz le pasara al motor lo que hoy está guardado (ARQ), un arquero manual con candado **seguiría en el arco** al regenerar, sin tocar ninguna estrategia. Para que deje el arco, la interfaz tiene que sustituir, sólo para él, el puesto guardado por el puesto anterior del registro. Eso es lo que `FR-062` pide, y está bien que lo pida si es lo que el propietario decidió (`D-18`, `D-27`), pero no es "como hoy" ni una consecuencia neutra de `TC-012`: es una excepción deliberada en la entrada del motor, hecha para cambiar a quién deja en el arco.
- **Why it matters:** (a) §3.2 declara "El sistema no cambiará cómo el motor elige los arqueros" (`D-30`); pasarle una entrada alterada a propósito para que no elija a alguien es, en el efecto, elegir por él. Quien implemente va a encontrar la tensión y no tiene dónde leer que es intencional. (b) La razón registrada en el Concept Note para `D-18` es "Conservar el arco obligaría a cambiar el motor para aceptar un arquero que no declaró el puesto" (`POSICIONES_DEL_JUGADOR_CONCEPT.md:460`). Con `D-30` el arquero manual **sí** declara el puesto, y el código muestra que no hace falta cambiar el motor: la razón es falsa por los dos lados. Una decisión con razón falsa se vuelve a discutir en cada lectura. (c) `OPEN-Q-12` ya manda al Plan a verificar cómo el motor usa el puesto previo para duplas y catálogo viejo; este tercer caso (puesto previo `'Arquero'` de un bloqueado) es el único que hoy tiene comportamiento conocido y la Spec lo describe al revés.
- **Evidence:** `index.html:3362-3366` (comentario), `:3375` (`naturalPool`), `:3376` (`secundarioPool` excluye bloqueados), `:3181-3189` (`resolverArqueros`), `:3385-3392`, `:3419-3422`, `:4092-4096`; Spec líneas 136-137, 253-256, 532-534; Concept Note línea 460. Hecho: la inicialización y los pools son los citados. Inferencia (no ejecuté el motor): que con ARQ como puesto previo el bloqueado queda en el arco; la lectura es directa y no vi ninguna rama que lo contradiga.
- **Confidence:** High en el código; High en que la Spec no lo declara como excepción.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Sin tocar la decisión: (1) reescribir la última oración de `FR-062` para decir que la interfaz **sustituye** el puesto guardado (ARQ) por el puesto anterior del registro al armar la entrada del motor, y que es la única vez que la entrada del motor difiere de lo guardado; (2) en `TC-012` o §3.2, aclarar que `D-30` se refiere al código del motor y que `FR-062` es una excepción declarada en su entrada; (3) proponer al Concept Note corregir la razón de `D-18` (hoy: "obligaría a cambiar el motor"; real: el propietario prefiere que el arquero manual sea siempre circunstancial, o la razón que corresponda). Si el propietario prefiriera en cambio que con candado se conserve el arco, el código ya lo hace y `FR-062`, `D-18`, `D-27` y `S-06a` se simplifican; eso es decisión suya, no de esta crítica.

#### 2. `A-04` es una inferencia declarada en prosa, sin el marcador ni lugar en la deuda de §17

- **Dimension:** Accuracy (`MD-26`)
- **Where:** `A-04` (líneas 906-910), §17 "Plan must carry the verification debt" (962-963), `S-04` *Then* "Lugares sin cubrir pasa a mostrar LI" (660)
- **What:** `A-04` dice "Inferido de leer `faltantesDeFormacionVigente` …, no ejecutado". Es honesto, pero no usa la forma `[UNVERIFIED — <razón>]` que el resto de la Spec usa (`A-01`, `A-02`, `A-05`), y §17 sólo arrastra esas tres. El *Then* de `S-04` depende de `A-04`.
- **Why it matters:** `MD-26` pide que toda afirmación interna no verificada lleve el marcador y que el Plan herede la deuda. Un revisor que busque `[UNVERIFIED]` no la encuentra. Verifiqué la inferencia leyendo el código y es correcta: la formación guardada no tiene ARQ (`index.html:1636-1637`), así que un titular asignado a ARQ no entra en ningún cupo y `vacios` de LI pasa a 1 (`:5980-5985`). Lo que falta es el marcador o la verificación ejecutada, no la conclusión.
- **Evidence:** líneas citadas; `index.html:5979-5989`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** O bien `[UNVERIFIED — leído, no ejecutado; S-04 lo verifica en el Plan]` y sumar `A-04` a §17; o bien correrlo (el arnés ya construye partidos) y quitar la salvedad.

#### 3. Citas corridas por una o dos líneas, y un aviso del encabezado incompleto

- **Dimension:** Accuracy
- **Where:** encabezado, aviso sobre los números de línea (23-26); `FR-058b` (518-520); `AC-42` (848-849)
- **What:** (a) El encabezado dice que las notas recíprocas corrieron las líneas "de `ARRASTRE_SPEC.md` y `PANEL_ARMADO_SPEC.md`". También corrieron las de `CANCHA_SPEC.md`: el glosario "Posición asignada" citado en l. 279 está hoy en 281 y `A-04` citado en 764-766 está en 766-768 (la nota de `TC-012` agregó dos líneas antes). Contra `4803d85^` las tres citas de `CANCHA_SPEC.md` son exactas. (b) `FR-058b` cita `index.html:2351-2372` para "la escritura de `data/partidosArmado` falla después de la de `data/partidos`": la escritura de `partidos` está en `:2368` y la de `partidosArmado` en `:2373`, una línea fuera del rango. (c) `AC-42` cita `tests/fixtures-app.js:331-335` para `window.__ultimosDocs`: la inicialización está en `:335` y el guardado del contenido en `:336`.
- **Why it matters:** Son referencias que alguien va a abrir; ninguna cambia el sentido.
- **Evidence:** `git show 4803d85^:…/CANCHA_SPEC.md` l. 279, 764-766 vs. árbol actual l. 281, 766-768; `index.html:2368`, `:2373`; `tests/fixtures-app.js:335-336`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Sumar `CANCHA_SPEC.md` al aviso del encabezado; `2351-2373`; `331-336`.

### Per-doc — Consistency

#### 4. Un arquero manual intercambiado con el arquero del otro equipo: `FR-055` no dice si "deja el arco", y no hay variante

- **Dimension:** Consistency (con Completeness)
- **Where:** `FR-055` (505-506), `FR-021` (421-423), `FR-031` (436-437), `S-02b` (621), `S-04` Variants (665-683), Glosario "Arquero manual" (369)
- **What:** Con Martín en el arco del Blanco (ARQ, registro con LI) y el arquero natural del Negro (ARQ), `FR-021` los hace candidatos entre sí: cada uno cubre el ARQ del otro, y `FR-023` no aplica entre equipos (`S-02b`). `FR-031` los cruza de equipo y `FR-030` les intercambia el puesto, que es el mismo. Martín queda en el arco del Negro. `FR-055` borra el registro "when un arquero manual deja el arco por un intercambio": ¿dejó el arco? Dejó el del Blanco, pero sigue en un arco. Si el registro se conserva, Martín sigue siendo arquero manual del Negro con LI de puesto anterior, puede "volver a LI" dejando al Negro sin arquero mientras el Blanco tiene al natural, y `FR-054` (pase) y `FR-062` (regenerar) le aplican; si se borra, el Negro tiene un arquero sin forma de deshacer con un toque. Las dos lecturas son válidas con el texto actual y ninguna variante de `S-04` fija cuál.
- **Why it matters:** Es un gesto alcanzable en dos toques desde el estado de `S-04`, y decide qué guarda el partido.
- **Evidence:** líneas citadas; no hay `[boundary]` en `S-04` ni en `S-02` con los dos arqueros.
- **Confidence:** High en la ambigüedad; la consecuencia preferible es decisión del propietario.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Precisar `FR-055` ("deja el puesto asignado ARQ" o "cambia de equipo o de puesto") y agregar una variante `[boundary]` a `S-04`: "Martín intercambia con el arquero del Negro: los dos siguen en ARQ, cruzados de equipo; el registro de Martín se borra / se conserva (`FR-055`)".

#### 5. `TC-042` dice "puesto del catálogo" donde el glosario admite también las posiciones viejas

- **Dimension:** Consistency (con Clarity)
- **Where:** `TC-042` (303-305), Glosario "Puesto" (357), `FR-053` (499-502), `S-04k` (675), `D-20`/`S-01i` (601)
- **What:** `TC-042`: "todo puesto anterior leído de lo guardado que no sea un puesto del catálogo se tratará como ausente (`FR-053`)". El glosario define "Puesto" como "uno de los ocho del catálogo … **o una posición vieja** (Defensor, Volante, Delantero) leída por su línea", y `D-20`/`S-01i` tratan a un partido con puestos del catálogo viejo como partido con puestos. En ese partido, el puesto anterior de un arquero manual es, por ejemplo, "Defensor". Con la letra de `TC-042` eso "no es un puesto del catálogo" → ausente → `FR-053` lo devuelve a su principal (un puesto nuevo, p. ej. DC), que no es lo que tenía antes. Con la intención de `D-20`, "Defensor" es válido y debería volver ahí.
- **Why it matters:** Es la misma clase de borde que `OPEN-Q-12` ya abrió para el regenerar (`posicionesPreviasVigentes` descarta las posiciones viejas, `index.html:3108-3111`), pero acá la Spec sí puede fijarlo: es la vuelta con un toque, no el motor.
- **Evidence:** líneas citadas; `index.html:3108-3111`; `esPosicionVieja`/`lineaDe`.
- **Confidence:** Medium (puede que el autor quisiera decir "ni puesto ni posición vieja")
- **Severity:** 🟡 Should fix
- **Suggested fix:** En `TC-042`: "que no sea un puesto del catálogo ni una posición vieja" (o "que no tenga línea, `lineaDe(valor) === null`, como ya hace el motor en `index.html:3426`"); y una variante de `S-04` en un partido viejo: el arquero manual vuelve a "Defensor".

#### 6. `FR-050b` repite lo que `FR-050` ya implica

- **Dimension:** Consistency
- **Where:** `FR-050` (488-490), `FR-050b` (491-493)
- **What:** `FR-050` ofrece el arco sólo a una seleccionada que cubra el ARQ; si nadie del equipo lo cubre, nadie cumple esa condición. `FR-050b` lo vuelve a decir en negativo, con dos citas al motor.
- **Why it matters:** Ninguno. Es la codificación explícita de `D-30` y sirve de ancla para `S-04b`. Lo anoto para que nadie lo lea como una regla distinta.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Dejarlo, pero abrirlo con "Consecuencia de `FR-050`:" o convertirlo en nota de `FR-050`.

#### 7. §3.2 presenta como "heredado del Concept Note §4 y §16" un no-objetivo que esta Spec amplió

- **Dimension:** Consistency (Concept ↔ Spec, visto desde la Spec)
- **Where:** §3.2 (125, 131-132); Concept Note §4 (91-93) y §16 (577)
- **What:** La Spec hereda "no se mueve a un jugador a un lugar vacío de su propio equipo, salvo al arco vacío (`D-14`) **y la vuelta del arquero manual a su puesto anterior (`FR-053`)**". El Concept Note §4 y §16 sólo exceptúan el arco vacío, y §4 agrega "Fuera de ese caso, el cambio de puesto es siempre un intercambio entre dos camisetas". La segunda excepción la introdujo `D-23`, que no enmendó §4 ni §16.
- **Why it matters:** "Heredado" con texto distinto del origen es la forma suave de la deriva silenciosa; hoy es inocua porque `D-23` la respalda.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** En la Spec: "heredado y ampliado por `D-23`". En el Concept Note: una línea en §4 y §16.

### Per-doc — Completeness

#### 8. Arquero manual sin puntaje de Arquero cargado: el "cálculo de hoy" lo deja "sin puntaje" y nadie lo dice

- **Dimension:** Completeness
- **Where:** `FR-056` (507-510), `FR-059` (522-523), `S-04` *Then* (658-659), Variants de `S-04` (665-683), `FR-070` (540-542)
- **What:** `FR-056` valúa al arquero manual con `valorDePuntaje`, que devuelve `null` cuando el puntaje en el puesto asignado no es mayor que cero (`index.html:5068-5069`; `puntajeEnPosicion` devuelve 0 si no hay nota, `:2097-2100`). Declarar Arquero de secundaria no obliga a tener nota de Arquero. En ese caso la píldora pasa a "sin puntaje", el total del equipo baja **todo** el valor que el jugador sumaba en LI (no sólo la diferencia), y la línea del resumen que cuenta titulares sin puntaje lo incluye. `FR-059` además prohíbe cualquier aviso propio. La versión anterior tenía `S-04b` ("Martín no tiene puntaje … queda 'sin puntaje'"); la reescritura la quitó y ninguna variante actual cubre el caso. `S-04` sólo prueba con 4 de Arquero.
- **Why it matters:** Es el borde más probable del arco vacío en un grupo de amigos (el propio Concept Note decía "casi nadie tiene nota de arquero", `D-15`), y el efecto visible —un total que cae varios puntos y una camiseta "sin puntaje" sin explicación— es exactamente lo que `D-30` acepta como "cálculo de hoy". Aceptado o no, tiene que estar escrito y testeado para que nadie lo reporte como bug.
- **Evidence:** `index.html:2097-2100`, `:5064-5070`; Spec líneas citadas; `git diff d72952a 046c6a4` muestra la `S-04b` vieja retirada.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Variante `[boundary]` de `S-04`: "Martín declara Arquero sin nota de Arquero: en el arco queda 'sin puntaje', el total del Blanco baja 6 y el resumen lo cuenta entre los titulares sin puntaje (`FR-056`)". Opcional: una línea en `FR-056` que lo nombre.

#### 9. `FR-053` con puesto anterior inválido y principal ARQ

- **Dimension:** Completeness
- **Where:** `FR-053` (499-502), `TC-042` (303-305), `S-04k` (675)
- **What:** Un arquero natural reubicado por el motor (excedente, `index.html:3395-3399`) puede quedar en un equipo con arco vacío tras un pase y ocuparlo como arquero manual. Si su registro trae un puesto anterior inválido, `FR-053` lo devuelve a "su principal", que es ARQ: el toque "devuelve" al mismo puesto, borra el registro y el arco **no** queda vacío, contra la última cláusula del FR.
- **Why it matters:** Sólo con datos corruptos; lo anoto porque `TC-042` lo define como camino previsto.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "el de su principal; si su principal es ARQ, su mejor secundaria o DEL, como el motor (`mejorPosicionAlternativa`, `index.html:3166`)", o declarar que en ese caso sólo se borra el registro.

#### 10. `FR-018` y `NFR-003` con una dupla: qué nombre va en "{nombre}"

- **Dimension:** Completeness (Clarity)
- **Where:** `FR-018` (408-410), `NFR-003` (553), `S-21a`/`S-21b` (755-756)
- **What:** "Nadie puede intercambiar puesto con {nombre}", "Poner a {nombre} en el arco", "Volver a {nombre} a {puesto}": para una dupla (unidad de dos personas, `FR-010`) no se dice si va un nombre, los dos, o el rótulo de la dupla. El escapado de `TC-041` cubre uno o dos nombres igual, pero el test de `S-21` necesita saber qué cadena esperar.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Una línea en el glosario o en `FR-018`: "en una dupla, los dos nombres unidos por 'y'" (o lo que el propietario prefiera).

### Per-doc — Clarity

#### 11. FR compuestos: `FR-048`, `FR-049`, `FR-053`, `FR-042`

- **Dimension:** Clarity (EARS, `MD-03`)
- **Where:** `FR-042` (458-461), `FR-048` (477-480), `FR-049` (481-484), `FR-053` (499-502)
- **What:** `FR-048` reúne tres obligaciones en tres oraciones (aplicar lo del toque; el arco gana sobre la cancha; soltar sobre el arco rival es pase). `FR-049` y `FR-053` encadenan un *While* (mostrar el destino) y un *When* (al soltar/tocar, aplicar). `FR-042` fija tres textos de aviso en un requisito; ya lo señaló la crítica anterior (hallazgo 14) y no se tomó.
- **Why it matters:** Una obligación por línea es lo que hace que cada ID se pueda marcar cumplido o no; hoy un test de `FR-048` tiene tres oráculos.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Partir con sufijos (`FR-048`, `FR-048b`, `FR-048c`; `FR-049`/`FR-049b`; `FR-053`/`FR-053b`) sin renumerar nada.

#### 12. El glosario de `CARGA_POR_TOQUE_SPEC.md` contrasta el modo de carga con una cancha "de sólo lectura" que ya no lo es

- **Dimension:** Clarity (y `AGENTS.md`, "declarar reemplazos")
- **Where:** encabezado, "Complementa sin reemplazar" (68-70); `CARGA_POR_TOQUE_SPEC.md:344` (glosario "Modo de carga por toque"), `:194-197` (§3.2 última viñeta)
- **What:** La Spec lista las dos partes como "siguen vigentes". La viñeta de §3.2 sigue siendo cierta (toque de carga y arrastre de armado no coexisten). El glosario define el modo como el estado "en el que la cancha responde a toques sobre las camisetas **en vez de mostrarlas de sólo lectura**": con esta feature, fuera de ese modo la cancha también responde a toques (para `admin`, en la ventana de edición). La definición sigue nombrando bien al modo, pero su contraste quedó viejo, igual que la justificación de la cuarta viñeta de §3.2 de `ARRASTRE_SPEC.md`, que la Spec resolvió con una "Nota" en origen (`ARRASTRE_SPEC.md:132-134`). `CARGA_POR_TOQUE_SPEC.md` no tiene ninguna nota (`grep -c POSICIONES_DEL_JUGADOR_SPEC` = 0).
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Una "Nota del 2026-10-29" en el glosario de `CARGA_POR_TOQUE_SPEC.md`, con el mismo formato que la de `ARRASTRE_SPEC.md`, sin tacharlo.

### Per-doc — Methodology-invariants

#### 13. La nota recíproca de `FR-022` en `ARRASTRE_SPEC.md` omite la excepción del pase que sí cita

- **Dimension:** Methodology-invariants (`AGENTS.md`: cada parte reemplazada queda marcada con lo que la reemplaza; `AC-02`)
- **Where:** `ARRASTRE_SPEC.md:461-463` (`FR-022`), contra la Spec `FR-054` (503-504) y la nota de `AC-23` (`ARRASTRE_SPEC.md:866-868`)
- **What:** La nota de `FR-022` dice "**Reemplazado … por `FR-030`, `FR-051`, `FR-053` y `FR-054` …:** el intercambio, el arco vacío y la vuelta del arquero manual sí la modifican. El pase la conserva (`FR-043` de esa Spec)". Cita `FR-054` pero su texto dice lo contrario de `FR-054` (el pase de un arquero manual **sí** la modifica). La nota de `AC-23` lo dice bien ("salvo para un arquero manual (`FR-054`)"), y también la de `D-20` en §3.3 y en el Concept Note de `equipos-en-el-campo`.
- **Why it matters:** Quien lea sólo `FR-022` de la rebanada 2 se lleva una regla incompleta.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "El pase la conserva (`FR-043`), salvo para un arquero manual (`FR-054`)".

## Summary

- Blocking: 0
- Should fix: 5 (hallazgos 1, 2, 4, 5, 8)
- Suggestions: 8 (hallazgos 3, 6, 7, 9, 10, 11, 12, 13)
- Methodology-invariants violated: ninguna en grado bloqueante. Roces: `MD-26` (hallazgo 2: inferencia sin marcador ni deuda en §17), `MD-03` (hallazgo 11: FR compuestos), `AGENTS.md` "declarar reemplazos" (hallazgos 12 y 13: una nota que falta y una nota incompleta).

---

## Apéndice 1 — Estado de la crítica anterior (2026-10-29, claude-sonnet-5-5)

Los IDs `S-04*`, `S-05*` y `S-21c` de la crítica anterior se refieren a la versión previa; acá se nombran por lo que describían.

| # | Hallazgo anterior | Estado | Observación |
|---|---|---|---|
| 1 🔴 | El valor del arquero elegido no llegaba a la diferencia por línea (`sumasPorLinea` ≠ `valorDePuntaje`) | **Dejó de aplicar por `D-30`** | Sin valor especial, las dos rutas usan `puntajeEnPosicion(u, 'Arquero')`: `valorDePuntaje` (`index.html:5068`) y `sumasPorLinea` (`:3904-3908`). Difieren sólo en que la primera devuelve `null` y la segunda suma 0 cuando no hay nota: mismo total. `S-04l` ahora incluye la grilla. Correcto |
| 2 🔴 | "Solo por puntaje" sin `posicionOverride`; no había dónde guardar "en el arco" | **Dejó de aplicar por `D-30`** | El arco no se ofrece (`FR-052`, `S-05b`); el glosario "Partido sin puestos" describe `posicionOverride` como marca del motor (`:3227-3237`) y la verifiqué. Correcto |
| 3 🟡 | `S-01`: "de 15 a 11" no es el total del equipo | **Resuelto** | "baja 4 puntos —lo que suman Juan y Pedro…" |
| 4 🟡 | `TC-040` "defends" sobreprometía; ruling de `CWE-863` decía que lo nuevo iba al documento de `admin` | **Resuelto** | `TC-040` dice "del lado del cliente" y nombra la barrera; el ruling lista qué va a cada documento. Verificado contra `firestore-rules.md:81`, `:287-290`, `:308-310` (Apéndice 7) |
| 5 🟡 | `FR-056` sin acotar a "con puestos" contradecía `FR-052` | **Dejó de aplicar por `D-30`** | Sin puestos no hay arquero manual (`FR-052`); `FR-056` ya no tiene regla propia |
| 6 🟡 | `S-04f` (arquero natural rival como candidato) inejecutable | **Resuelto** | La variante desapareció; `S-04d`/`S-04e` cubren compañero que declara / que no declara. **Pero** el caso de fondo —arquero manual ↔ arquero rival, hoy válido por `FR-021`— quedó sin variante y sin regla de registro: hallazgo 4 de este reporte |
| 7 🔵 | `FR-045` delegaba en requisitos reemplazados | **Resuelto** | Enumerado |
| 8 🟡 | Registro huérfano | **Resuelto** | `FR-058b`, `S-04r`, riesgo nuevo en §15, `TC-042` lo cita |
| 9 🟡 | `FR-062` sin puesto; `FR-061` para dupla y catálogo viejo | **Resuelto en el texto; abierto de forma declarada** | `FR-062` fija el puesto; `S-06c`/`S-06d` + `OPEN-Q-12` al Plan. **Introdujo** el problema del hallazgo 1 de este reporte: al fijar que el motor recibe el puesto anterior, la Spec quedó describiendo como neutro un cambio deliberado de entrada |
| 10 🟡 | Dupla seleccionada / dupla en el arco | **Resuelto** | `FR-010` (toque en toda la camiseta), `S-04s` |
| 11 🟡 | `FR-055`: compañero que declara Arquero etiquetado "elegido" | **Dejó de aplicar por `D-30`** y **resuelto** | Todo el que ocupa el arco declara ARQ; `FR-055` reescrito ("sin registro") |
| 12 🔵 | `NFR-005` quitaba `sumaBlanco`/`sumaNegro` sin decirlo | **Resuelto** | Fila del encabezado con cita a `index.html:5768-5777` (verificada) y `AC-13` |
| 13 🟡 | `S-21` con `Variants: none` pese a tres superficies | **Resuelto** | `S-21a` (aviso `FR-018`), `S-21b` (nombre accesible). El `title` de `FR-059` ya no existe (`D-30`) |
| 14 🔵 | `S-04i` ambigua; etiqueta del auto-lazo; `FR-042` con tres textos | **Parcial** | `S-04i` reescrita; auto-lazo no partido (justificado en el Change log: dos auto-lazos superponen rótulos); `FR-042` igual (hallazgo 11) |
| 15 🔵 | `AC-02` por documento, no por fila | **Resuelto** | Por ID, "en el mismo bloque" |
| 16 🔵 | Residuos sin marcar: `S-01` de `ARRASTRE_SPEC.md`, cuarta viñeta de §3.2, `CANCHA_SPEC.md` `TC-010` | **Resuelto** | `S-01` marcado (`ARRASTRE_SPEC.md:609`), viñeta con "Nota" (`:132-134`); `TC-010` de `CANCHA_SPEC.md` dejó de aplicar por `D-30` (nadie dibuja desde el registro) |
| 17 🔵 | `Roadmap.md` y los diferidos del Concept §14 | **Resuelto** | §3.2, líneas 148-152; `Roadmap.md:86` verificado |
| 18 🔵 | `AC-54` sin telemetría | **Resuelto** | §17 lo manda al Plan |

**Problemas nuevos introducidos por la corrección:** el hallazgo 1 (vía `FR-062` reescrito) y el hallazgo 8 (la reescritura de `S-04` quitó la variante "sin puntaje" cuando `D-30` la volvió más relevante, no menos). El hallazgo 4 no es nuevo pero quedó destapado al retirar `S-04f`.

## Apéndice 2 — Alcance de `D-30`

Busqué en toda la Spec cualquier FR/NFR/TC/escenario que (a) cambie cómo el motor elige arqueros, (b) cambie cómo se calculan puntajes, (c) suponga que alguien que no declara Arquero ocupa el arco, (d) tenga un valor especial para el arquero, o (e) ofrezca el arco en "Solo por puntaje".

| Chequeo | Resultado | Dónde |
|---|---|---|
| (a) Elección de arqueros | **Un punto a declarar** | `FR-062`: la interfaz sustituye el puesto guardado del arquero manual con candado por su puesto anterior al armar la entrada del motor, y eso decide que no quede en el arco (hallazgo 1). El código del motor no se toca (`TC-012`, `AC-35`), pero la entrada sí, a propósito y sólo para él |
| (b) Cálculo de puntajes | Limpio | `FR-056` (`valorDePuntaje` sin regla), `TC-011` ("sin cálculo nuevo"), `AC-34`, `A-03`, `S-04` *Then*, `S-04l`. No queda ninguna mención a "puesto anterior" como valor, ni a una función de valor propia. El hallazgo 8 es una consecuencia no escrita del cálculo de hoy, no un cálculo nuevo |
| (c) Alguien que no declara Arquero en el arco | Limpio | `FR-050` exige cubrir el ARQ; `FR-050b`; §3.2 ("no pondrá en el arco a quien no cubre el ARQ"); glosario "Arco vacío" y "Arquero manual"; `S-04a`, `S-04b`, `S-04e`. Para una dupla, "cubrir" = al menos un integrante (glosario, `D-07`): consistente con el criterio del motor para duplas (`costoEncaje`, `index.html:3634-3635`) |
| (d) Valor especial | Limpio | `D-15`, `D-25` marcadas retiradas en §3.3; `FR-022` retirado; `FR-059` reescrito (sin aviso propio) |
| (e) Arco en "Solo por puntaje" | Limpio | `FR-052` ("no mostrará el arco como destino, ni al tocar ni al arrastrar"), `FR-045` ("No hay destinos de arco"), `FR-047` y `FR-049` acotados a "con puestos" / arquero manual, `S-05b`, glosario "Arco vacío", `D-22`/`D-26` retiradas |

Dos textos que siguen hablando con el lenguaje viejo pero sin cambiar el comportamiento: la fila de riesgo "El arquero manual sin candado se pierde al regenerar" (925) está bien; y en §3.3 `D-16` se hereda como "la ventaja por no tener arquero fijo se mantiene", correcto, aunque la razón de `D-16` en el Concept Note habla de un "arquero improvisado" que ya no existe (Apéndice 3).

## Apéndice 3 — IDs retirados o reescritos citados con el significado viejo

**En la Spec:** ninguno. `FR-022` figura como retirado (424-425) y nadie lo cita con el sentido viejo (`US-01` lo incluye en el rango "FR-010 a FR-021", correcto). `FR-052`, `FR-056`, `FR-059` se citan siempre con el sentido nuevo (encabezado "Complementa", `TC-011`, `AC-34`, `US-05`, glosario). `D-15`, `D-22`, `D-25`, `D-26` aparecen sólo como retiradas (§3.3). `D-29` se cita en el glosario "Arquero manual" y en `FR-051` por la parte que sobrevive (guarda el puesto anterior). Las menciones a `S-04t` a `S-04w` y `S-21c` están sólo en el Change log (973-974, 972), como historia.

**En las notas recíprocas (`docs/equipos-en-el-campo/`):** ninguno. Las 31 notas de `ARRASTRE_SPEC.md`, las 4 de `CANCHA_SPEC.md`, las 3 de `PANEL_ARMADO_SPEC.md` y las 3 del Concept Note dicen "arquero manual"; `grep -i "arquero elegido\|arranque\|improvisado"` no encuentra nada en esa carpeta. La nota de `FR-021` de `ARRASTRE_SPEC.md` (que citaba el `FR-056` viejo) fue retirada en `046c6a4`, y su Change log lo registra.

**En el Concept Note (`POSICIONES_DEL_JUGADOR_CONCEPT.md`):** acá sí quedan textos con el significado viejo, fuera de los que `D-30` ya anotó (§5 línea 121 y §8.1 línea 340 tienen su "Actualización"). Están fuera del documento criticado y **no cuentan para el veredicto**; se listan porque el propietario lo pidió y porque la Spec los hereda por §3.3:

| Dónde | Texto | Problema | Sugerencia |
|---|---|---|---|
| §1 TL;DR (18-20) | "Un equipo que quedó sin arquero puede … elegir a uno de sus jugadores para el arco … (`D-14`)" | `D-30`: sólo quien declara Arquero; si nadie lo declara, nada | 🟡 Enmendar |
| §2 Pain 4 (58-63) | "un equipo sin arquero no puede fijar uno … sin cargarle Arquero como secundaria" | Con `D-30` ese dolor **no se resuelve**: si nadie declara Arquero, la respuesta sigue siendo cargarlo en la ficha. El Concept Note no lo dice | 🟡 Marcar el Pain 4 como fuera de alcance por `D-30` o reescribirlo (el caso real que queda es el arquero con candado o tras un pase, `D-28`) |
| §3 Goals (74-75) | "Que un equipo sin arquero pueda poner a uno de sus jugadores en el arco" | Mismo motivo | 🟡 "a uno de sus jugadores que juega de arquero" |
| §4 Non-goals (86-90) | "El intercambio y el arquero elegido escriben…" | Término reemplazado por `D-29`; la regla de lectura de `D-29` cubre "las decisiones anteriores", no §4 | 🔵 "arquero manual" |
| §4 / §16 (91-93, 577) | "salvo al arco vacío (`D-14`)" | Falta la segunda excepción de `D-23` (hallazgo 7) | 🔵 |
| §8.2 (366-368) | Entidad "Arquero improvisado — un jugador con puesto asignado Arquero que no lo declara … (`D-15`) … (`OPEN-Q-07`)" | Describe un concepto retirado, sin nota | 🟡 Reemplazar por "Registro de arquero manual: puesto anterior por jugador (`D-21`, `D-29`)" |
| §10 `D-16` (458) | "cuando se elige un arquero improvisado \| Un arquero improvisado sigue siendo una desventaja real" | La decisión sigue (la Spec la hereda en `FR-057`), la razón ya no describe a nadie | 🔵 Reescribir la razón ("no se recalcula nada del motor", que ya está) |
| §10 `D-18` (460) | "Conservar el arco obligaría a cambiar el motor para aceptar un arquero que no declaró el puesto" | Falso por los dos lados (hallazgo 1): declara el puesto, y el motor ya conserva a un bloqueado persistido como Arquero | 🟡 Corregir la razón o la decisión |
| §11 Riesgos (482) | "Para sumar lo del puesto anterior del arquero improvisado (`D-15`) hay que recordar cuál era…" | Riesgo de una regla retirada; el registro sigue existiendo pero por `D-29`, para volver | 🔵 Reescribir |
| §12 Success signals (492-493) | "Ningún intercambio manual deja a un jugador … en un puesto que no declaró, salvo el arquero improvisado (`D-14`)" | Con `D-30` la excepción desapareció: la señal es más fuerte, sin "salvo" | 🔵 Quitar el "salvo" |
| §16 Handoff (544) | "Settled: D-01 a D-17" | `D-18` a `D-30` no figuran en el handoff; la Spec los lista en §3.3 y `AC-03` los exige en §10, así que no se pierden | 🔵 Actualizar |

## Apéndice 4 — Citas

Todas se abrieron. Prioridad a las agregadas o cambiadas después de `d72952a` (marcadas **nuevas**). "Pre-edit" = `git show 4803d85^:…`, la versión contra la que la Spec declara contar las líneas.

**Código (`index.html`)**

| Cita | Qué dice la Spec | Qué dice la fuente | Resultado |
|---|---|---|---|
| `:1778`, `:3159-3162` (**nuevas**; §3.2, `FR-050b`) | si nadie cubre el ARQ, el equipo rota el arco, "como el motor ya supone" | `:1778`: descripción del invariante "Un arquero por equipo": "el otro equipo rota el arco entre sus jugadores de campo"; `:3161-3162`: "sus jugadores rotan en el arco … todos rotan" | ✓ |
| `:3376` (**nueva**; `S-04` *Given*) | el motor no puso a Martín (candado, Arquero de secundaria) en el arco porque no mueve a un bloqueado | `secundarioPool` filtra `!sonBloqueados(p)` | ✓. Nota: `:3375` muestra además que un bloqueado con puesto guardado `'Arquero'` sí entra como natural (hallazgo 1) |
| `:3227-3237` (**nueva**; glosario) | "Solo por puntaje" guarda `posicionOverride` sólo para arqueros ubicados y excedentes reubicados | `:3227-3228` override `'Arquero'`; `:3235-3238` excedentes a `mejorPosicionAlternativa` | ✓ |
| `:5052-5054` (**nueva**; glosario) | el resto se dibuja en la línea de su principal | `posicionAsignadaDe`: asignada → override → principal | ✓ |
| `:5064-5070` (glosario, `FR-056`) | sin puesto asignado suma el promedio general; el arquero manual suma su puntaje en ARQ | `valorDePuntaje`: `if(!m.equipos.posicionAsignada) return valorGeneralDe(unidad)`; si no, `puntajeEnPosicion(unidad, posicionAsignadaDe(...))`, `null` si ≤ 0 | ✓ (el `null` motiva el hallazgo 8) |
| `:5768-5777` (**nueva**; encabezado, fila `sumaBlanco`) | `sumaBlanco`/`sumaNegro` ya no se escriben al mover; el panel recalcula (`sumasVigentes`) y lo guardado es registro de la generación | `:5768-5769` comentario que dice exactamente eso; `moverUnJugadorDeEquipo` sólo toca `blanco`/`negro` | ✓ |
| `:2350`, `:2350-2372`, `:2351-2372` (`TC-002`, `TC-043`, `FR-058b`) | `CAMPOS_EQUIPOS_ARMADO`; un campo de `equipos` fuera de la lista va al documento público; `partidosArmado` se escribe después de `partidos` | `:2350` lista (sin `posicionAsignada`, `blanco`, `negro`); `:2359-2363` reparte; `:2368` escribe `partidos`; `:2373` escribe `partidosArmado` sólo `if(isAdmin())` | ✓ contenido; ⚠ `2373` queda fuera del rango citado (hallazgo 3) |
| `:3631-3636`, `:3642-3651` (`TC-010`) | `cubrePosicionGuardada` delega en `costoEncaje`; posiciones viejas por línea | ✓ | ✓ |
| `:4694` (`TC-012`) | qué puesto previo recibe el motor | `posicionesPreviasVigentes(m.equipos.posicionAsignada)` | ✓ (`:3108-3111` descarta posiciones viejas: `OPEN-Q-12`, hallazgo 5) |
| `:5072-5080` (glosario) | `esFilaEditable` = admin, inscripción abierta, sin finalizar | ✓ | ✓ |
| `:5258-5262` (**nueva**; `A-01`) | hoy toque y arrastre son excluyentes "para que nunca haya dos gestos compitiendo por el click" | ✓ texto literal del comentario | ✓ |
| `:5635-5777` (`TC-011`) | `intercambiarUnidades`, `moverUnJugadorDeEquipo` | ✓; `intercambiarUnidades` sale si `equipoA === equipoB` (`:5638`) — la Spec ya lo sabe | ✓ |
| `:5863-5870`, `:5052-5070`, `:5980` (`A-03`) | el recálculo lee el puesto asignado en vivo | ✓ (`:5980` corregido respecto de la versión anterior) | ✓ |
| `:1636-1637`, `:5979-5989` (`A-04`) | la formación no incluye el arco; `faltantesDeFormacionVigente` | ✓ | ✓ (hallazgo 2: marcador) |
| `:1114-1124`, `:1937` (**nuevas**; `OPEN-Q-09`) | ya existe `.toast` y su temporizador | ✓ `.toast` y `toastTimeoutId` | ✓. `components/feedback/Toast.prompt.md` existe en el design system |
| `:6263` (sólo en el Concept Note `D-29`) | "el arco lo rotan los jugadores" | ✓ texto del resumen de generación | ✓ |

**Documentos**

| Cita | Resultado |
|---|---|
| `firestore-rules.md:81` (`data/partidos`: `jugador` escribe), `:308-310` (`data/partidosArmado`: sólo `admin`) | ✓ (`:81` fila "✅ ✅ ✅ ²"; `:287-290` y `:308-310` las reglas) |
| `ARRASTRE_SPEC.md` l. 79-80, 89-90, 105-109, 111-113, 114-118, 119-123, 159-163, 190, 203-208, 213, 336, 356-360, 397-408, 430, 550, 577, 590, 603, 616-617, 801, 824, 829, 968, 991, 1038-1039 | ✓ todas contra `4803d85^`, contenido y numeración. `S-01` l. 577 (**nueva**) ✓. En el árbol actual están corridas, como el encabezado advierte |
| `CANCHA_SPEC.md` l. 160-163 (`TC-011`), 166-169 (`TC-012`), 224-227 (`TC-040`), 279 (glosario), 455 (`NFR-003`), 764-766 (`A-04`) | ✓ contra `4803d85^`; en el árbol actual 279→281 y 764-766→766-768 (hallazgo 3) |
| `PANEL_ARMADO_SPEC.md` l. 217-220, 805-806 (`S-05j` ×2), 1147 (`A-03`); `FR-072b` a `FR-072d`, `FR-072b2` | ✓ contra `4803d85^`; `S-05j` duplicado confirmado (`OPEN-Q-11`); `FR-072b2` en l. 612 |
| `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` l. 508 (`D-19`), 509 (`D-20`), `D-26` | ✓ |
| `CARGA_POR_TOQUE_SPEC.md` l. 194-197, 220-225 (`D-18`), 344, 544 (`NFR-003`); `FR-030b` (l. 417), `A-03` (l. 830, dice `click`/`pointerup`) | ✓ |
| `INTERCAMBIAR_COLORES_SPEC.md` `FR-016` l. 271 ("ningún campo indexado por jugador") | ✓; sostiene `FR-058` |
| `DESGLOSE_POSICIONES_SPEC.md` `TC-020` (l. 187) | ✓ |
| `tests/layout.test.js:45` (17 anchos) | ✓ uno a uno con `NFR-001` |
| `tests/fixtures-app.js:331-335` | ⚠ el guardado del contenido es `:336` (hallazgo 3) |
| `Roadmap.md:86` (alternativa táctil), §2 (teclado), §3 (edición concurrente, l. 70) | ✓ |
| `CANCHA_SPEC.md` `OPEN-Q-02` "48-56 px" (`A-02`) | ✓ (l. 791) |
| `CANCHA_SPEC.md` `NFR-005` (100 ms) y `ARRASTRE_SPEC.md` `NFR-004` (150 ms) para `NFR-004` | ✓ |
| CWE Top 25 "consultado en vivo el 2026-10-28, edición 2025" | No lo volví a consultar en esta sesión; la crítica anterior lo verificó el 2026-10-29 y la lista de §4.5 no cambió desde entonces |

## Apéndice 5 — Reemplazos y notas recíprocas

**Completitud.** Volví a barrer las cinco specs y el Concept Note de `equipos-en-el-campo` buscando reglas que el intercambio, el arrastre sobre camiseta propia, el arco vacío, el arquero manual o el toque fuera del modo de carga contradigan. Todo lo que contradice está en la tabla del encabezado (23 filas). Residuos: sólo el glosario de `CARGA_POR_TOQUE_SPEC.md` (hallazgo 12), que es una nota, no un reemplazo. Dejaron de necesitar reemplazo por `D-30`: `CANCHA_SPEC.md` `TC-010` (precedencia asignada → override → principal: nadie se dibuja desde el registro) y `ARRASTRE_SPEC.md` `FR-021` (el total sigue siendo "el puntaje de la unidad en su posición asignada"): la Spec retiró la fila de `FR-021` y la nota en origen se quitó en `046c6a4`; ✓ el Change log de `ARRASTRE_SPEC.md` lo registra (l. 1090).

**Nota recíproca por fila** (árbol actual, `046c6a4`):

| Fila declarada | Marca en origen | La nota describe bien la regla nueva |
|---|---|---|
| Concept `D-19` (l. 508) | ✓ | ✓ |
| Concept `D-20` (l. 509) | ✓ | ✓ "salvo para el arquero manual" |
| `ARRASTRE` §2 (l. 80) | ✓ tachado | ✓ |
| §3.1 (l. 91) | ✓ | ✓ |
| §3.2 viñetas 1, 2, 3 (l. 113, 118, 126) | ✓ ×3 | ✓ |
| §3.3 `D-19`, `D-20` (l. 173, 177) | ✓ ×2 | ✓ |
| `TC-010` (l. 225) | ✓ | ✓ |
| `TC-012` (l. 236), `FR-022` (l. 462), `NFR-005` (l. 582), `AC-14` (l. 840), `AC-23` (l. 866) | ✓ ×5 | ✓ salvo `FR-022`: "El pase la conserva (`FR-043`)" sin el "salvo el arquero manual" (hallazgo 13) |
| Glosario ×3 (l. 377, 378, 381) | ✓ ×3 | ✓ |
| `FR-011` (l. 421), `US-02` (l. 357) | ✓ ×2 | ✓ |
| `FR-012` (l. 426) | ✓ | ✓ |
| `FR-013` (l. 430) | ✓ | ✓ incluye el "salvo arco y puesto anterior" |
| `FR-014`/`FR-015` (l. 438) | ✓ | ✓ |
| `S-02` (l. 629), `S-02c` (l. 635), `S-03a`, `S-03b` (l. 648-649) | ✓ ×4 | ✓ |
| `S-01` (l. 609) (**nueva**) | ✓ | ✓ |
| `A-02` (l. 1008) | ✓ | ✓ |
| §17 (l. 1082) | ✓ | ✓ |
| `CANCHA` `TC-012` (l. 170), glosario (l. 281), `A-04` (l. 769) | ✓ ×3 | ✓; la de `TC-012` dice "intercambia puestos o asigna el arco" y omite la vuelta al puesto anterior, aunque cita `FR-053`; aceptable |
| `PANEL` §3.3 (l. 221), `A-03` (l. 1153) | ✓ ×2 | ✓ |
| "Complementa": `ARRASTRE` §3.2 cuarta viñeta (l. 132-134) | ✓ Nota (**nueva**) | ✓ |
| "Complementa": `CARGA_POR_TOQUE` glosario | ✗ sin nota | hallazgo 12 |

Los cuatro documentos de origen tienen su fila de Change log del 2026-10-29 (`ARRASTRE` l. 1090, actualizada en `046c6a4`; `CANCHA` l. 823; `PANEL` l. 1212; Concept de `equipos-en-el-campo`, verificada en el diff). Ninguna nota recíproca sobrante: la única que dejó de corresponder (`FR-021`) ya se quitó.

## Apéndice 6 — Testeabilidad

- **EARS.** Todos los FR usan uno de los cinco patrones. Compuestos: `FR-048`, `FR-049`, `FR-053`, `FR-042` (hallazgo 11). `FR-022` figura como retirado, con su ID conservado: correcto para `MD-05`.
- **NFR cuantificados.** `NFR-001` (17 anchos, tres condiciones), `NFR-002` (44×44, 24×24), `NFR-003` (≥ 2 señales, nombres no vacíos, `aria-live`), `NFR-004` (100 ms, 150 ms), `NFR-005` (conjunto exacto de claves, incluida la ausencia de dos), `NFR-007` ("ninguna escritura") son medibles. `NFR-006` es de revisión. Ningún adjetivo suelto.
- **Escenarios y Variants.** 10 escenarios (`S-01` a `S-07`, `S-20` a `S-22`), **todos** con bloque `Variants:` (ya no hay `Variants: none`). Etiquetas dentro del conjunto cerrado. IDs de variantes contiguos: `S-04a` a `S-04s` (19), `S-05a` a `S-05c`, `S-21a`/`S-21b`. La renumeración de `S-04`/`S-05`/`S-21` está declarada en el Change log (972) con la razón (borrador sin consumidores); no es silenciosa. El diagrama de §9 no cambió desde la crítica anterior, que lo renderizó.
- **Meta-AC.** `AC-50` a `AC-55` presentes en §11.5 con la forma del template; `AC-55` con `Supply-chain: none` justificado por `AGENTS.md` § Dependencias.
- **TC ↔ AC.** `TC-001` a `TC-043` tienen su AC en §11.3 (`AC-30` a `AC-42`). `AC-42` ahora exige un test que lea `window.__ultimosDocs.partidos` (antes era "una revisión").
- **Integridad de referencias.** Todo `FR-*` citado está definido (incluidos `FR-019b`, `FR-030b` de `CARGA_POR_TOQUE_SPEC.md`, `FR-050b`, `FR-058b`, `FR-072b`/`FR-072d` de `PANEL_ARMADO_SPEC.md`). Todo `S-*` citado fuera del Change log está definido. `OPEN-Q-05`, `-09`, `-10`, `-12` abiertas y listadas en §17; `-02`, `-04`, `-06`, `-07`, `-08` resueltas en la Spec y en el Concept Note (`AC-03` verificado: `D-18` a `D-30` en §10 del Concept Note).
- **Huecos de cobertura que encontré:** arquero manual ↔ arquero rival (hallazgo 4), arquero manual sin nota de Arquero (hallazgo 8), puesto anterior en catálogo viejo (hallazgo 5).

## Apéndice 7 — Inferencias presentadas como hechos, y seguridad

**Inferencias.**

| Afirmación | Dónde | Marcador / cita | Observación |
|---|---|---|---|
| "el motor no lo puso en el arco porque no mueve a un jugador con candado" | `S-04` *Given* | `index.html:3376` | ✓ hecho (`secundarioPool` excluye bloqueados) |
| "el equipo rota el arco … como el motor ya supone" | §3.2, `FR-050b` | `:1778`, `:3159-3162` | ✓ hecho |
| "un arquero manual deja un lugar de campo sin cubrir y el recálculo vigente lo muestra" | `A-04`, `S-04` | "Inferido…, no ejecutado" | Correcta (la verifiqué leyendo); falta el marcador y la deuda en §17 (hallazgo 2) |
| "qué puesto previo se le pasa al motor, no cómo lo usa" | `TC-012`, `FR-062` | `:4694` | ✓ como descripción del mecanismo; ✗ como "comportamiento de hoy": la entrada se altera a propósito (hallazgo 1) |
| "la misma función que define 'el número que suma al total'" | encabezado, `FR-056`, `TC-011` | `:5064-5070` | ✓ hecho |
| "`posicionOverride` … marca de dibujo … no cambia ningún total" | glosario | `:3227-3237`, `:5064-5070` | ✓ hecho (`valorDePuntaje` no mira el override cuando no hay `posicionAsignada`) |
| "El `click` se distingue del arrastre nativo" | `A-01` | `[UNVERIFIED]` con razón legítima; §17 | ✓ |
| "La camiseta ya mide 44×44" | `A-02` | `[UNVERIFIED]` con razón legítima; §17 | ✓ |
| "Reglas desplegadas = contrato" | `A-05` | `[UNVERIFIED]` con razón legítima; §17 | ✓ |
| "La aplicación ya tiene un aviso emergente" | `OPEN-Q-09` | `:1114-1124`, `:1937` | ✓ hecho (corregido respecto de la versión anterior) |

No encontré `[UNVERIFIED]` con razón ilegítima ni citas inventadas.

**Seguridad (`TC-040` a `TC-043` y rulings) contra `firestore-rules.md`.** Modelo: `data/partidos` lo lee cualquiera autenticado y lo escriben `admin` **y** `jugador` (`:81`, `:287-290`; "limitación aceptada", `:235`); `data/partidosArmado` sólo `admin` (`:308-310`).

| ID | Qué dice la Spec | Evaluación |
|---|---|---|
| `TC-040` (`CWE-862`) | guarda de rol y ventana dentro del manejador, "del lado del cliente"; la barrera del almacenamiento no distingue rol para `data/partidos` | ✓ exacto frente a las reglas; coherente con el patrón existente (`__moverJugadorManual`, `index.html:5780`) |
| `TC-041` (`CWE-79`) | escapado en aviso, `title`, `aria-label` | ✓; `S-21`, `S-21a`, `S-21b` cubren las tres superficies que quedan tras `D-30` |
| `TC-042` (`CWE-20`) | ids contra el reparto; puesto anterior inválido = ausente; registro huérfano = ausente | ✓ control correcto; ambigüedad "del catálogo" (hallazgo 5) |
| `TC-043` (`CWE-200`) | registro sólo en `partidosArmado`; agregar el campo a `CAMPOS_EQUIPOS_ARMADO`; test sobre `__ultimosDocs.partidos` | ✓ el control real está nombrado y gateado por test (`AC-42`); el mecanismo "fuera de la lista = público" verificado en `:2359-2363` |
| Ruling `CWE-863`/`CWE-284` | preexistente, no se agrava; qué va a cada documento | ✓ exacto: `blanco`, `negro`, `posicionAsignada` ya iban a `partidos` (`:2348`) |
| `CWE-639`, `CWE-352`, resto | no aplica, con razón | ✓ sin cambios desde la crítica anterior, que verificó la lista contra la edición 2025 |
| Postura (Concept §5.2: `CWE-79`, `-862`, `-863`) vs §4.5 | las tres tratadas (863 como ruling) + `-20`, `-200`, `-284`, `-639`, `-352` | ✓ sin deriva |
| `AC-55` | sin lockfile, `AGENTS.md` § Dependencias | ✓ |

Riesgo de seguridad no previsto por el Concept §5.2 que la Spec sí cubre ahora: la separación entre `partidos` y `partidosArmado` en dos escrituras (`FR-058b`, `S-04r`, riesgo en §15). Correcto.
