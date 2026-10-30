# Critique — POSICIONES_DEL_JUGADOR_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (leído de la configuración de esta sesión)
> **Author model:** claude-opus-5-5 (verificado en el encabezado de la Spec, línea 3, y en las cuatro filas de su Change log, §18, líneas 906-909)
> **Date:** 2026-10-29
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` · `POSICIONES_DEL_JUGADOR_CONCEPT.md` · `POSICIONES_DEL_JUGADOR_CONCEPT_CRITIQUE_2026-10-28_claude-sonnet-5-5.md` · `AGENTS.md` · `docs/equipos-en-el-campo/` (`EQUIPOS_EN_EL_CAMPO_CONCEPT.md`, `ARRASTRE_SPEC.md`, `CANCHA_SPEC.md`, `PANEL_ARMADO_SPEC.md`, `CARGA_POR_TOQUE_SPEC.md`) · `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` · `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` · `docs/rol-en-el-token/contracts/firestore-rules.md` · `index.html` · `tests/layout.test.js`, `tests/fixtures-app.js` · `Roadmap.md`
> **Mode:** Step 7 independent critique, per-doc. Sólo lectura sobre la Spec y todo lo demás; sin commit.
> **Independence (Step 7.0):** modelo distinto, mismo proveedor (autor Opus → crítico Sonnet). Es el "término medio aceptable" de `critic-rubric.md`: rompe el lazo de mismo-modelo pero puede compartir sesgo residual de entrenamiento con el autor. No es una crítica de otro proveedor. Es el mismo par de modelos que la crítica del Concept Note del 2026-10-28.
> **Chequeos pedidos por el propietario:** (1) citas, (2) reemplazos, (3) Concept ↔ Spec, (4) testeabilidad, (5) inferencias como hechos, (6) seguridad. Resultados en los Apéndices A a F.

## Verdict

**CHANGES REQUESTED** — 2 🔴, 9 🟡, 7 🔵.

La Spec es sólida en lo difícil: cubre D-01 a D-24 sin contradecir ninguno, trae los 10 escenarios con su bloque `Variants:`, los seis meta-AC `AC-50` a `AC-55`, y la declaración de reemplazo está completa y marcada en origen (las 22 filas tienen su nota recíproca; Apéndice B). Dos cosas bloquean la aprobación, y las dos tocan el mismo punto: **el arquero elegido y el arco en el código real no se comportan como la Spec dice**. (1) La Spec promete que el valor del arquero elegido sale de un solo lugar (`valorDePuntaje`) y por eso "píldora, total y resumen no pueden divergir" (`TC-011`, `FR-056`, `A-03` "verificado en código"), pero la diferencia por línea —que alimenta el resumen y la grilla— se calcula en otra función (`sumasPorLinea`) que no pasa por ahí. (2) En un partido "Solo por puntaje" la Spec describe un mundo sin puestos que el código no tiene (hay `posicionOverride`) y deja sin lugar dónde guardar "dibujado en el arco" (`FR-052` a `FR-054`, ocho variantes). Los demás hallazgos son 🟡 de completitud y de precisión que se arreglan en el texto.

Todas las críticas de este reporte son sobre lo escrito: ninguna decisión del propietario (D-18 a D-24) se discute.

**Estado de los hallazgos de la crítica anterior del Concept Note** (insumo pedido): los 4 🔴 (1, 11, 13, 14) y los 8 🟡 están resueltos en el Concept actual o arrastrados a la Spec. Detalle en el Apéndice C.

## Findings

### Per-doc — Accuracy

#### 1. El valor del arquero elegido no llega a la diferencia por línea ni al resumen: `TC-011` no alcanza

- **Dimension:** Accuracy (y Methodology-invariants: TC no satisfacible por el mecanismo que fija)
- **Where:** `POSICIONES_DEL_JUGADOR_SPEC.md` `TC-011` (líneas 216-224), `FR-056` (468-470), `FR-070` (494-496), `A-03` (840-846), `S-04l` (629), `AC-34` (779-780)
- **What:** `TC-011` manda resolver el valor del arquero elegido "dentro de la función que ya define 'el número que suma al total' (`valorDePuntaje`)" para que "la píldora, el total y el resumen no puedan divergir". Pero `FR-070` promete que la diferencia por línea también refleje el reparto nuevo "con el recálculo vigente", y ese recálculo no usa `valorDePuntaje`: `balanceLineasVigente` → `balanceLineasDe` → `sumasPorLinea` suma `puntajeEnPosicion(u, pos)` con el puesto **asignado** del mapa (`pos = posicionAsignada[id] || u.principal`).
- **Why it matters:** Con Martín asignado a ARQ (`S-04`), `valorDePuntaje` (modificado por `TC-011`) le da 6 (su LI), así que el total del Blanco no salta. Pero `sumasPorLinea` le sumaría su puntaje de Arquero (0 o 4 en `S-04a`) a la línea Arco, y 0 a la Defensa. La grilla "diferencia por línea" y el grupo "Con tus cambios" del resumen (que recalcula el balance por línea, `FR-072c` de `PANEL_ARMADO_SPEC.md`) mostrarían números que no suman el total que muestra el encabezado. Es exactamente la divergencia que `TC-011` dice impedir. `A-03` afirma "Verificado en código" que `balanceLineasVigente` "pasa `eq.posicionAsignada`", y eso es cierto, pero verificó que **lee** el puesto asignado, no que **valúe** al arquero elegido igual que el total. `S-04l [property]` sólo compara píldora, total y resumen-de-explicaciones, no la grilla.
- **Evidence:** `index.html:3899-3911` (`sumasPorLinea`: `puntajeEnPosicion(u, pos)`), `index.html:5863-5870` (`balanceLineasVigente`), `index.html:5064-5070` (`valorDePuntaje`, el único lugar donde `TC-011` ordena resolver el valor). Hecho: las dos rutas son funciones distintas. Inferencia (no corrí la app): que la grilla y el resumen mostrarían la divergencia descrita.
- **Confidence:** High en el código; Medium en la consecuencia visible.
- **Severity:** 🔴 Blocking
- **Suggested fix:** Reformular `TC-011`: "el valor de un arquero elegido se resolverá en **una** función que consuman `valorDePuntaje` **y** `sumasPorLinea`", o declarar explícitamente qué línea suma el arquero elegido en la grilla (¿Arco con su valor "como si estuviera en el puesto anterior" o la línea de su puesto anterior?). Agregar a `FR-056` "y de la diferencia por línea", y a `S-04l` la grilla. Corregir `A-03` para decir qué se verificó realmente.

#### 2. En "Solo por puntaje" la Spec describe un mundo sin `posicionOverride` que el código sí tiene, y no dice dónde vive "dibujado en el arco"

- **Dimension:** Accuracy (con Completeness)
- **Where:** Glosario "Partido sin puestos" (línea 326), `FR-052` (455-457), `FR-053` (458-461), `FR-054` (462-464), `FR-033` (404-405), `NFR-005` (509), `S-05b` a `S-05f` (648-652), `D-22` (§3.3)
- **What:** El glosario dice que en un partido sin puestos "no guarda puesto asignado, y cada camiseta se dibuja en la línea de su principal", citando `index.html:3295`. Esa línea es `return { …, posicionOverride, … }` de `generarEquiposEstrategia1`: la estrategia sí escribe un mapa `posicionOverride` (`index.html:3227-3228` pone `'Arquero'` a los titulares arqueros; `:3237` mueve al arquero excedente). Y la cancha lee `posicionAsignada` → `posicionOverride` → `principal` (`posicionAsignadaDe`, `index.html:5052-5054`; `CANCHA_SPEC.md` `TC-010`). Entonces, en un "Solo por puntaje" real, un arquero natural **ya se dibuja en el arco** por override, y la regla "arco vacío = ninguna camiseta dibujada en el Arco" (glosario, línea 332) depende de ese mapa.
- **Why it matters:** `FR-052` exige "dibujará a la unidad en el arco, no escribirá ningún puesto asignado", y `NFR-005` limita lo escrito en ese caso a `equipos.blanco` y `equipos.negro` (más, "si corresponde", el registro). No hay otra cosa en la que la cancha pueda leer "esta camiseta va al arco" salvo el registro del arquero elegido, y el registro, por glosario, "lleva su puesto anterior" (que en sin-puestos la Spec define como "la línea de su principal", una derivación, no un dato). O se escribe en `posicionOverride` (que es un puesto asignado en todo menos el nombre y contradice `FR-052`), o el registro pasa a ser lo que hace dibujar el arco (y entonces `CANCHA_SPEC.md` `TC-010` y `FR-023b` quedan afectados y no figuran en la declaración de reemplazo). Ocho variantes (`S-05b` a `S-05f`, más `FR-053`/`FR-054` en sin-puestos) no se pueden implementar ni testear sin esta decisión. Además, la premisa "se dibuja en la línea de su principal" es lo que el propio `FR-053` usa como destino de la vuelta.
- **Evidence:** `index.html:3227-3228`, `:3237`, `:3295`, `:5052-5054`; Spec líneas 326, 332, 455-457, 509. La cita `index.html:3295` se usa para respaldar un hecho que su propio contenido matiza.
- **Confidence:** High en el código; High en el hueco de la Spec.
- **Severity:** 🔴 Blocking
- **Suggested fix:** (a) Corregir el glosario: "sin puestos: lo guarda `posicionOverride` sólo para arqueros; el resto se dibuja en la línea de su principal". (b) Decidir y escribir **qué se guarda** cuando el administrador ocupa el arco en un partido sin puestos (¿una entrada en el registro que la cancha lee, o una entrada en `posicionOverride`?) y ajustar `NFR-005`, `FR-052`, `FR-053`. (c) Si cambia lo que la cancha lee, declarar el reemplazo de `CANCHA_SPEC.md` `TC-010` en el encabezado y marcarlo en origen.

#### 3. `S-01`: "el total del Blanco baja de 15 a 11" no es el total de un equipo

- **Dimension:** Accuracy
- **Where:** `S-01` (541), `S-07` (671-672)
- **What:** Juan 7 en DC + Pedro 8 en LD = 15 y, tras el intercambio, 6 + 5 = 11. Eso es la suma de **dos** jugadores. El total del Blanco en un Fútbol 8 incluye siete u ocho más.
- **Why it matters:** El *Then* es un oráculo de test: un test que compare el total del equipo contra 15 → 11 falla. Y `S-07` depende de que "el total cambió" para que el resumen se divida (`FR-072b2`).
- **Evidence:** líneas 534-541 de la Spec.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** "el total del Blanco baja 4 puntos (de X a X − 4)", o fijar un Given con los otros seis jugadores en 0 y declararlo.

#### 4. `TC-040` declara defender `CWE-862`, y el ruling de `CWE-863`/`CWE-284` dice que "lo nuevo" va al documento de `admin`: la mayor parte de lo nuevo no va ahí

- **Dimension:** Accuracy (Security, `MD-31`)
- **Where:** `TC-040` (265-269), ruling `CWE-863`/`CWE-284` (282-286), `TC-043` (277-281), `AC-42` (792-793)
- **What:** Lo que escribe el intercambio es `equipos.blanco`, `equipos.negro` y `equipos.posicionAsignada`. `CAMPOS_EQUIPOS_ARMADO` (`index.html:2350`) no incluye `posicionAsignada` ni `blanco`/`negro`, así que van al documento **público** `data/partidos`, que las reglas dejan escribir a `jugador` (`firestore-rules.md:81`, `:235`, `:287-290`). Sólo el registro nuevo va a `data/partidosArmado`. La Spec dice: "no agrega permisos … y lo nuevo que guarda va al documento exclusivo de `admin`".
- **Why it matters:** El ruling acierta en la conclusión (condición preexistente, no la agrava) pero su razón es parcial: el dato nuevo más importante (el puesto asignado, del que dependen totales y cancha) está en el documento que `jugador` puede reescribir con su token. Y `TC-040` dice "defends `CWE-862`" cuando la guarda en el manejador es defensa en profundidad del cliente; la barrera real es la regla de Firestore, que para `data/partidos` no distingue rol. `NFR-007`/`S-20` prueban sólo los manejadores de la interfaz, no el borde de las reglas.
- **Evidence:** `index.html:2350`, `:2370-2371` (comentario: `jugador` no guarda armado); `firestore-rules.md:81`, `:235`, `:253`, `:287-290`, `:308-310`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Reescribir el ruling: "el puesto asignado se guarda en `data/partidos`, escribible por `jugador` (preexistente, `firestore-rules.md:81`); el registro, en `data/partidosArmado`". En `TC-040`, decir que la guarda es del cliente y que el cierre real del hueco es de otra feature (`rol-en-el-token`/`research.md` §3).

### Per-doc — Consistency

#### 5. `FR-056` no está acotado a "con puestos" y contradice a `FR-052`/`S-05b`

- **Dimension:** Consistency
- **Where:** `FR-056` (468-470) vs `FR-052` (455-457), `S-05b` (648), `D-22`
- **What:** `FR-056` valúa al arquero elegido "con su puntaje de Arquero si es mayor que cero". En un partido sin puestos el total es el promedio general (`valorDePuntaje`, `index.html:5066-5069`) y `FR-052`/`S-05b` exigen que "ningún total cambie".
- **Why it matters:** Un arquero elegido sin puestos con puntaje de Arquero > 0 cambia el total si se aplica `FR-056` tal cual. Dos requisitos, dos resultados.
- **Evidence:** líneas citadas.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Abrir `FR-056` con "While el partido tenga puestos"; y decir que sin puestos el valor es el promedio general (`FR-052`).

#### 6. `S-04f` contradice a `FR-021` y al *Given* de `S-04`

- **Dimension:** Consistency
- **Where:** `S-04f` (623), `S-04` *Given* (604-605), `FR-021` (382-384), `FR-055` (465-467)
- **What:** `S-04f`: "el arquero natural del Negro, que cubre ARQ, es candidato si Martín cubre su puesto; tras el intercambio Martín deja de ser arquero elegido (`FR-055`)". Por `FR-021`, el natural (asignado ARQ) es candidato sólo si Martín **cubre ARQ**; pero `S-04` dice que Martín "no declara Arquero". Y si se aplicara, los dos quedarían asignados a ARQ, Martín en el Negro sin declarar el puesto con el arco ya cubierto: justo lo que `D-04` prohíbe, y `FR-055` ("deja el arco") no describe.
- **Why it matters:** Variante inejecutable o escrita al revés; un test que la implemente fallaría contra la propia `FR-021`.
- **Evidence:** líneas citadas.
- **Confidence:** Medium (puede haber querido decir un arquero natural que Martín sí cubre, p. ej. si declarara Arquero)
- **Severity:** 🟡 Should fix
- **Suggested fix:** Reescribir como `[failure]`: "el arquero natural del Negro no es candidato porque Martín no cubre ARQ", o cambiar el Given de la variante (Martín con Arquero secundaria).

#### 7. `FR-045` delega en requisitos que la propia Spec reemplaza

- **Dimension:** Clarity (con Consistency)
- **Where:** `FR-045` (431-432)
- **What:** "mantendrá el arrastre como lo describe hoy `ARRASTRE_SPEC.md` (`FR-010` a `FR-026`)". Esa franja incluye `FR-011`, `FR-012`, `FR-013`, `FR-014`/`FR-015`, `FR-021` y `FR-022`, que la declaración de reemplazo marca como reemplazados (en todo o en parte).
- **Why it matters:** No es verificable tal cual: "como hoy" apunta a texto que tiene un tachado a medias. `S-05d` lo resuelve para un caso, pero el FR no.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Enumerar el comportamiento (intercambio sólo con camisetas del otro equipo, sólo en dos columnas, sin escribir puesto; sobre una camiseta propia, sin efecto), o apuntar a las partes vigentes por ID.

### Per-doc — Completeness

#### 8. Registro huérfano: qué pasa si el registro y el puesto asignado se separan

- **Dimension:** Completeness (Security-adjacent)
- **Where:** Glosario "Arquero elegido" (333), `TC-042` (273-276), `NFR-005` (509), §10.1 (726)
- **What:** El puesto asignado (público) y el registro (documento `admin`) se guardan en dos escrituras separadas (`saveMatches`: `set('partidos')`, luego `set('partidosArmado')`, `index.html:2351-2372`). Hay tres formas de que queden separados: la segunda escritura falla; una sesión `jugador` guarda el documento público con datos viejos (gana la última, `A-06`/§3.2); `regenerar` o un camino que no pasa por esta feature cambia el puesto. Queda un registro de alguien que ya no está asignado a ARQ, o que no está en el reparto.
- **Why it matters:** `TC-042` sólo trata el caso "puesto anterior no es del catálogo". Nada dice qué hacer con un registro cuyo jugador no tiene ARQ asignado. Sin esa regla, `FR-056` valuaría con el puesto anterior a alguien que ya está en otro puesto, y `FR-059` pondría el `title` "elegido para el arco" a quien no está en el arco.
- **Evidence:** `index.html:2351-2372`; Spec §14 `A-06`, §3.2 línea 137.
- **Confidence:** Medium (el escenario concreto es inferencia; la ausencia de regla es hecho)
- **Severity:** 🟡 Should fix
- **Suggested fix:** Un requisito (EARS "If"): un registro sólo vale si el jugador tiene ARQ asignado y pertenece al reparto; si no, se trata como ausente y se descarta al siguiente guardado. Una variante `[failure]` en `S-04`.

#### 9. `FR-061`/`FR-062`/`S-06a`: no dicen en qué puesto queda un arquero elegido con candado, y `FR-061` se afirma para todas las estrategias

- **Dimension:** Completeness
- **Where:** `FR-061` (484-486), `FR-062` (487-488), `S-06a` (664), `TC-012` (225-228)
- **What:** (a) `S-06a`: con candado, tras regenerar "sigue en el Blanco, no está en el arco": ¿en qué puesto? `TC-012` dice "qué puesto previo se le pasa al motor", pero no se lo dice a `FR-062`. (b) `FR-061` ("mantendrá a cada unidad con candado en … el puesto que tenga") se sostiene en las estrategias 2, 3 y 4 (`index.html:3420-3421`, `:4093-4094`; la 4 llama a la 3, `:4574-4575`) y la 1 no tiene puestos. Pero esas líneas buscan `prevPosicionAsignada[p.id]` con el id **de la unidad**, y `posicionesPreviasVigentes` (`:3108-3111`) descarta los puestos viejos del catálogo anterior (`index.html:4694`). Para una dupla con candado y para un partido con puestos del catálogo viejo, `FR-061` puede no cumplirse. No hay variante que los cubra.
- **Why it matters:** Es el "regenerar respeta lo que fijé" de `US-06`.
- **Evidence:** líneas citadas; no tracé la ejecución completa de la estrategia 3 para una dupla, así que la parte (b) es hipótesis a verificar.
- **Confidence:** High en (a); Low-Medium en (b)
- **Severity:** 🟡 Should fix
- **Suggested fix:** (a) Fijar en `FR-062` el puesto con el que el motor recibe al arquero elegido con candado. (b) Agregar variantes de `S-06` para dupla con candado y para puesto del catálogo viejo, o declarar la limitación como `[OPEN-Q]`.

#### 10. La dupla como unidad seleccionada y como arquero elegido no está especificada

- **Dimension:** Completeness
- **Where:** `FR-010` (351-352), `FR-051` (452-454), `FR-058` (473-475), `NFR-002` (506), Glosario "Arquero elegido" (333)
- **What:** `CARGA_POR_TOQUE_SPEC.md` `FR-030b` acotó el toque sobre una dupla "al nombre de cada integrante" (y `index.html:5232`: `puedeTocarCamiseta = … && !esUnidadDupla`). Esta Spec dice que tocar "una camiseta" selecciona, y `S-01a`/`S-02c` usan una dupla seleccionada, pero no dice **qué área** de la camiseta de una dupla selecciona, ni qué mide `NFR-002` ahí. Tampoco dice qué pasa si la unidad que ocupa el arco es una dupla: "arquero natural sólo si los dos lo son" (`construirUnidadDupla`, `index.html:4582`); el registro es "por jugador" (`FR-058`) pero `FR-051` habla de "la unidad".
- **Why it matters:** `S-01a`/`S-02c` ya la usan, y el modo de carga sentó un precedente opuesto (toque acotado al nombre).
- **Evidence:** `CARGA_POR_TOQUE_SPEC.md` líneas 409-413; `index.html:5225-5233`.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Una línea en `FR-010` ("sobre una dupla, el toque abarca toda la camiseta" o lo contrario) y un `[boundary]` de `S-04` para la dupla en el arco (qué se registra, cómo se valúa).

#### 11. `FR-055`: un compañero que sí declara Arquero toma el arco y queda etiquetado "elegido"

- **Dimension:** Completeness
- **Where:** `FR-022` (385-388), `FR-055` (465-467), `S-04d` (621)
- **What:** `FR-022` hace candidato al compañero "cubra o no el compañero el ARQ", y `FR-055` registra "a ese compañero como arquero elegido". Si el compañero declara Arquero (secundaria), no es "improvisado": recibiría `title` "elegido para el arco" (`FR-059`) y valuación por `FR-056`, y su "puesto anterior" quedaría como destino de regreso.
- **Why it matters:** La etiqueta, el valor y el regreso no coinciden con `D-14`/`D-15` ("arquero improvisado").
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** En `FR-055`, "registrará como arquero elegido sólo si no cubre ARQ"; variante `[boundary]` en `S-04`.

#### 12. `NFR-005` borra `sumaBlanco`/`sumaNegro` de la lista de campos escritos sin decirlo

- **Dimension:** Consistency
- **Where:** `NFR-005` (509) y la fila de la declaración de reemplazo (línea 36), contra `ARRASTRE_SPEC.md` `NFR-005`, `AC-14` y `FR-021`
- **What:** `ARRASTRE_SPEC.md` `NFR-005`/`AC-14` fijan los campos escritos en "exactamente cuatro", entre ellos `equipos.sumaBlanco` y `equipos.sumaNegro`. `NFR-005` de esta Spec no los lista. El código actual de `moverUnJugadorDeEquipo` (`index.html:5770-5777`) y de `__moverJugadorManual` (`:5779-5788`) no los toca, y el panel recalcula los totales en vivo (`sumasVigentes`, `:5923`), de modo que la Spec nueva describe el código; el que difiere es el texto viejo.
- **Why it matters:** La fila del reemplazo dice sólo "los campos escritos son exactamente cuatro → `NFR-005` de esta Spec". Quien compare las dos listas ve una resta no declarada, y `AC-13` ("verificado registrando las claves escritas") deja de tener un conjunto de referencia claro.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** En la fila: "(`sumaBlanco`/`sumaNegro` no se escriben; el panel recalcula en vivo)", y confirmar con una aserción de `AC-13` que no aparecen.

### Per-doc — Clarity

#### 13. `S-21` no cubre los nombres que `TC-041` también obliga a escapar

- **Dimension:** Clarity (testeabilidad)
- **Where:** `TC-041` (270-272), `S-21` (698-704), `NFR-003` (507)
- **What:** `TC-041` escapa "el aviso de `FR-018` o `FR-042`, un `title` o un `aria-label` nuevo". `S-21` sólo prueba "cualquiera de los dos avisos". Los nombres accesibles de los destinos ("Poner a {nombre} en el arco", "Volver a {nombre} a {puesto}", `NFR-003`) y el `title` del arquero elegido (`FR-059`) llevan nombre de jugador y quedan sin escenario. Además `S-21` declara `Variants: none`, justificado sólo como "single-path"; con tres superficies (aviso, destino, `title`) no lo es.
- **Why it matters:** `CWE-79` es el único `TC` de seguridad con un riesgo real propio (`§15`), y `AGENTS.md` obliga a escapar atributos.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Variantes `[boundary]` de `S-21`: nombre en `aria-label` del destino, en el `title` de `FR-059`, y en el aviso de `FR-018`.

#### 14. Textos ambiguos menores

- **Dimension:** Clarity
- **Where:** `S-04i` (626), diagrama de §9 (516-526), `FR-042` (421-424)
- **What:** `S-04i`: "cada uno ofrece su propio arco, y sólo el del equipo de la seleccionada" (¿cada uno o sólo uno?). El diagrama renderiza (lo validé con `mermaid-cli`; 3 estados, 8 transiciones), pero la etiqueta del auto-lazo de `Seleccionada` queda lejos de su flecha y es larga. `FR-042` junta tres textos de aviso en un requisito.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Reescribir `S-04i` ("sólo se ofrece el arco del equipo de la seleccionada"); partir la etiqueta del auto-lazo en dos transiciones.

### Per-doc — Methodology-invariants

#### 15. `AC-02` se verifica por documento, no por fila

- **Dimension:** Methodology-invariants (verificabilidad del gate)
- **Where:** `AC-02` (750-753)
- **What:** "un `grep` de `POSICIONES_DEL_JUGADOR_SPEC` en cada documento de la tabla encuentra al menos una marca por fila". Un `grep` cuenta ocurrencias por archivo; no hay forma de que dé "una por fila".
- **Why it matters:** Hoy las 22 filas **sí** están marcadas (Apéndice B), pero el criterio no puede fallar por una fila omitida. Y las marcas se hicieron una rama después de redactar la declaración: la próxima edición de un spec de origen corre las líneas citadas (ya pasó: las líneas citadas de `ARRASTRE_SPEC.md` valen contra su versión previa al 2026-10-29; Apéndice A).
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Reescribir `AC-02` con una comprobación por ID ("para cada ID de la columna 'Parte', `grep -n` de esa ID en el documento muestra una línea con 'Reemplaz' en el mismo bloque"), y citar por ID y no por número de línea.

#### 16. Residuos sin marcar en los documentos de origen

- **Dimension:** Methodology-invariants (`AGENTS.md`: "Sin esa declaración, dos specs vigentes se contradicen")
- **Where:** `ARRASTRE_SPEC.md` `S-01` (*Then*: "la línea de su posición asignada, que no cambió") y §3.2 cuarta viñeta; `CANCHA_SPEC.md` `TC-010` (precedencia `posicionAsignada → posicionOverride → principal`); `CANCHA_SPEC.md` `FR-012`
- **What:** `S-01` de `ARRASTRE_SPEC.md` (el pase) sigue diciendo que el puesto "no cambió", y `FR-054` de esta Spec lo cambia para el arquero elegido. La cuarta viñeta de §3.2 queda con una justificación que la Spec reconoce falsa ("la única razón sería habilitar el intercambio en angosto"): está en "Complementa sin reemplazar" pero la nota en origen no la menciona. `CANCHA_SPEC.md` `TC-010` entra si se resuelve el hallazgo 2 por el registro.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Marcar `S-01` ("salvo un arquero elegido que pasa de equipo, `FR-054`") y la cuarta viñeta; y `CANCHA_SPEC.md` `TC-010` según lo que decida el hallazgo 2.

#### 17. La Spec no nombra la idea de `Roadmap.md` ni lleva a §3.2 los diferidos del Concept §14

- **Dimension:** Methodology-invariants (`AGENTS.md` § Obligaciones al especificar)
- **Where:** §3.2 (120-138), §2/§3 de la Spec; `Roadmap.md:44`, `:86`
- **What:** `AGENTS.md` pide a Concept Note **o** Spec nombrar la idea de `Roadmap.md` que encara. El Concept lo hace (su Change log, y `Roadmap.md:86` ya dice "El intercambio por toque lo toma `docs/posiciones-del-jugador/`"). La Spec sólo cita `Roadmap.md` §2 (teclado) y §3 (edición concurrente). Los dos diferidos del Concept §14 (mostrar el puntaje por puesto al seleccionar; intercambio fuera de puesto con confirmación) no están en §3.2 ni en un diferido de la Spec. Es consistente con "§3.2 heredados del Concept §4 y §16", pero ese listado no incluye §14.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Una línea en §3.2 que remita a Concept §14 y a `Roadmap.md:86`.

#### 18. `AC-54` pide filas `OBS-*` para NFR que la aplicación no puede medir en producción

- **Dimension:** Methodology-invariants
- **Where:** `AC-54` (806-807), `NFR-001`, `NFR-002`, `NFR-004`, §12 (811)
- **What:** `NFR-001`, `NFR-002` y `NFR-004` están cuantificados, así que `AC-54` exige un `OBS-*` por cada uno. §12 de la propia Spec dice que "la aplicación no tiene telemetría de uso".
- **Why it matters:** No es un defecto de la Spec: el Plan tendrá que resolverlo, y conviene que lo sepa de antemano. Hoy el handoff (§17) no lo menciona.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** En §17, una línea: "el Plan declara cómo se satisface `AC-54` sin telemetría (p. ej. el test de Playwright como señal)".

## Summary

- Blocking: 2 (hallazgos 1, 2)
- Should fix: 9 (hallazgos 3, 4, 5, 6, 8, 9, 10, 11, 13)
- Suggestions: 7 (hallazgos 7, 12, 14, 15, 16, 17, 18)
- Methodology-invariants violated: `MD-26` (hallazgo 1: "Verificado en código" afirmado sobre algo que no se verificó), `MD-11` (hallazgo 1: un TC cuyo mecanismo no satisface lo que dice proteger), `AGENTS.md` "declarar reemplazos" (hallazgos 2 y 16), `MD-31` (hallazgo 4: el ruling de CWE dice algo que las reglas no respaldan)

---

## Appendix A — Citas (chequeo 1)

Todas las filas se abrieron. "Pre-edit" = la versión del documento de origen anterior a las notas del 2026-10-29 (`git show 4803d85^:…`), que es contra la que la Spec contó las líneas; en el árbol actual las líneas de `ARRASTRE_SPEC.md` están corridas por las notas recíprocas (los números de línea de la Spec ya no apuntan ahí; ver hallazgo 15).

**Código (`index.html`)**

| Cita | Qué dice la Spec | Qué dice la fuente | Resultado |
|---|---|---|---|
| `:2350-2372` | `data/partidos` y `data/partidosArmado`, interfaz de guardar/leer | `CAMPOS_EQUIPOS_ARMADO` (2350) y `saveMatches` (2351-2372) reparten `equipos` entre los dos documentos | ✓. Ver hallazgos 4 y 8: `posicionAsignada` no está en la lista, va al documento público |
| `:3295` | "sin puestos … cada camiseta se dibuja en la línea de su principal" | `return { …, posicionOverride, … }`; `:3227-3237` escribe overrides de `'Arquero'` | ✗ no respalda el hecho tal como se afirma (hallazgo 2) |
| `:3631-3636`, `:3642-3651` | `cubrePosicionGuardada` delega en `costoEncaje` | Existe; devuelve costo 0/1/`COSTO_DESCUBIERTA`, no booleano. Para posición vieja compara por línea | ✓ (glosario "cubrir" = costo < `COSTO_DESCUBIERTA` coincide con `faltantesDeFormacionVigente`, `:5982-5983`) |
| `:4694` | qué puesto previo se le pasa al motor | `posicionesPreviasVigentes(m.equipos.posicionAsignada)` | ✓ (y descarta puestos viejos, hallazgo 9) |
| `:5064-5070` | `valorDePuntaje` define "el número que suma al total" | ✓, con la rama sin puestos → `valorGeneralDe` | ✓ |
| `:5052-5080` | `valorDePuntaje` lee `posicionAsignadaDe`; `esFilaEditable` | `posicionAsignadaDe` (5052-5054) lee `posicionAsignada` → `posicionOverride` → `principal`; `esFilaEditable` (5072-5080) = `isAdmin() && !cerrada && !finalizado` | ✓ |
| `:5635-5777` | `intercambiarUnidades`, `moverUnJugadorDeEquipo` | ✓ existen. `intercambiarUnidades` sale si `equipoA === equipoB` (5638) y no escribe puestos; la Spec ya lo sabe (extenderla) | ✓ |
| `:5863-5870` | `balanceLineasVigente` pasa `eq.posicionAsignada` | ✓, y delega en `balanceLineasDe` → `sumasPorLinea` (`:3899`), que no usa `valorDePuntaje` | ✓ la cita, ✗ la conclusión (hallazgo 1) |
| `:5978` | `faltantesDeFormacionVigente` filtra por `posicionAsignadaDe` | `:5978` es un comentario; el filtro está en `:5980` | ⚠ corrida 2 líneas; el contenido es cierto |
| `:1636-1637` | la formación guardada no incluye el arco | `futbol8` y `futbol9` sin `ARQ` | ✓ |
| `:5919-5922` (`sumaVigenteDeEquipo`) | suma `valorDePuntaje` | ✓ | ✓ |

**Documentos**

| Cita | Resultado |
|---|---|
| `firestore-rules.md:308-310` (`data/partidosArmado`: sólo `admin`) | ✓ |
| `firestore-rules.md:81` (`data/partidos`: `jugador` escribe) | ✓ (fila "✅ ✅ ✅ ²"); confirmado en `:287-290` |
| `ARRASTRE_SPEC.md` l. 79-80, 89-90, 105-109, 111-113, 114-118, 119-123, 159-163, 190, 203-208, 213, 336, 356, 357, 360, 397, 400, 402, 406, 408, 425, 430, 550, 590, 603, 616-617, 801, 824, 829, 968, 991, 1038-1039 | ✓ todas contra la versión previa a las notas (contenido y numeración coinciden); ✗ en el árbol actual (corridas) |
| `CANCHA_SPEC.md` l. 160-163 (`TC-011`), 166-169 (`TC-012`), 224-227 (`TC-040`), 279 (glosario), 343 (`FR-023b`), 455 (`NFR-003`), 764-766 (`A-04`) | ✓ (`TC-011` ocupa 160-165; la Spec cita 160-163) |
| `PANEL_ARMADO_SPEC.md` l. 217-220, 805-806, 1147 | ✓ (`A-03` queda en 1150 tras las notas); `S-05j` duplicado confirmado |
| `PANEL_ARMADO_SPEC.md` `FR-072b`–`FR-072d`, `FR-072b2` | ✓ existen (595-625); `FR-072b2` fija "comparando medida contra medida" |
| `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` l. 508 (`D-19`), 509 (`D-20`) | ✓ |
| `CARGA_POR_TOQUE_SPEC.md` l. 194-197 (última viñeta §3.2) | ✓ (195-198 en la numeración actual) |
| `CARGA_POR_TOQUE_SPEC.md` l. 220-225 (`D-18`) y 344 (glosario) y 544 (`NFR-003`) | ✓ |
| `CARGA_POR_TOQUE_SPEC.md` `A-03` | ✓ dice `click`/`pointerup`; la Spec escribe "supuso" el `click`: es más estricta que la fuente (la fuente permite `pointerup`) |
| `INTERCAMBIAR_COLORES_SPEC.md` `FR-016` (l. 271) | ✓ ("ningún campo indexado por jugador") |
| `DESGLOSE_POSICIONES_SPEC.md` `TC-020` (WCAG 1.4.1) | ✓ (línea 187-190, con URL de W3C "verificado por el Concept Note §6.5"). Cita indirecta: la Spec no abrió el criterio ella misma; aceptable por trazabilidad |
| `tests/layout.test.js:45` (17 anchos) | ✓ coincide uno a uno con `NFR-001` |
| `CANCHA_SPEC.md` `OPEN-Q-02` "48-56 px" (`A-02`) | ✓ ("camiseta de 48–56 px", línea 791) y `index.html:615-622` da `--chip-size` de 44 a 56 px. La cita dice "de ancho"; la fuente habla del dibujo. `A-02` ya está `[UNVERIFIED]` con razón legítima |
| CWE Top 25 2025 (`cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html`) | ✓ leído el 2026-10-29: la edición es 2025 y las 25 categorías coinciden con las 8 nombradas + las 17 de "Resto de la lista" (rank 4, 17, 18, 19, 20, 24, 3, 1 y los demás) |
| `NFR-004`: "techos de `NFR-005` de `CANCHA_SPEC.md` y `NFR-004` de `ARRASTRE_SPEC.md`" | ✓ 100 ms y 150 ms (`CANCHA_SPEC.md` l. 459; `ARRASTRE_SPEC.md` `NFR-004`) |

Un indicio adicional que la Spec no usa y que respaldaría `A-01`: `index.html:5258-5262` documenta que `arrastrable` y el toque de carga son "mutuamente excluyentes para que nunca haya dos gestos compitiendo por el click". La nueva feature hace coexistir ambos sobre la misma camiseta, y esa guarda existente es la evidencia más directa del riesgo que `A-01` marca. Conviene citarla.

## Appendix B — Reemplazos (chequeo 2)

**Completitud de la tabla.** Barrí `ARRASTRE_SPEC.md`, `CANCHA_SPEC.md`, `PANEL_ARMADO_SPEC.md`, `CARGA_POR_TOQUE_SPEC.md` y el Concept de `equipos-en-el-campo` por reglas que el intercambio, el arrastre sobre camiseta propia, el arco vacío o el arquero elegido contradigan. Todo lo que encontré ya está en la tabla, salvo estos residuos (hallazgo 16): `ARRASTRE_SPEC.md` `S-01` (*Then* "que no cambió", afectado por `FR-054`), `ARRASTRE_SPEC.md` §3.2 cuarta viñeta (justificación), y `CANCHA_SPEC.md` `TC-010` (sólo si el hallazgo 2 se resuelve por el registro). Revisé y **no** contradicen: `ARRASTRE_SPEC.md` `FR-016`/`FR-017` (dupla viaja entera), `FR-024`, `FR-025`, `FR-026` (candado: la Spec lo extiende a "equipo y puesto" en `FR-061`, no lo contradice), `S-02a`/`S-02d`/`S-02e`, `S-06`, `NFR-007`; `CARGA_POR_TOQUE_SPEC.md` `FR-001` a `FR-004` (no prohíben el toque fuera del modo de carga); `PANEL_ARMADO_SPEC.md` `FR-071`, `FR-072`.

**Nota recíproca por fila** (la Spec dice que se agregaron el 2026-10-29; las verifiqué en `git show 4803d85` y en el árbol actual):

| Fila declarada | Marca en origen | La nota describe bien la regla nueva |
|---|---|---|
| Concept `D-19` | ✓ | ✓ cita `FR-030`, `FR-041`; "el pase sigue siendo sólo entre equipos" |
| Concept `D-20` | ✓ | ✓ cita `FR-030`, `FR-051`, `FR-053`, `FR-054` |
| `ARRASTRE_SPEC.md` §2 (l. 79-80) | ✓ (tachado) | ✓ |
| §3.1 (l. 89-90) | ✓ | ✓ |
| §3.2 viñeta 1, 2, 3 | ✓ ×3 | ✓ (viñeta 2: "Soltar sobre las demás líneas sigue sin efecto") |
| §3.3 `D-19`, `D-20` | ✓ ×2 | ✓ |
| `TC-010` | ✓ | ✓ |
| `TC-012`, `FR-022`, `NFR-005`, `AC-14`, `AC-23` | ✓ ×5 | ✓ (`AC-14`/`AC-23` precisan "salvo un arquero elegido") |
| Glosario ×3 | ✓ ×3 | ✓ |
| `FR-011`, `US-02` | ✓ ×2 | ✓ |
| `FR-012` | ✓ | ✓ |
| `FR-013` | ✓ | ✓ (incluye "sigue sin efecto … salvo arco y puesto anterior") |
| `FR-014`/`FR-015` | ✓ | ✓ |
| `FR-021` | ✓ | ✓ |
| `S-02`, `S-02c`, `S-03a`, `S-03b` | ✓ ×4 | ✓ |
| `A-02` | ✓ | ✓ |
| §17 | ✓ | ✓ |
| `CANCHA_SPEC.md` `TC-012`, glosario "Posición asignada", `A-04` | ✓ ×3 | ✓; la nota de `TC-012` dice "también escribe: intercambia puestos o asigna el arco", no menciona el pase del arquero elegido (`FR-054`); aceptable, la Spec cita `FR-051`/`FR-053` |
| `PANEL_ARMADO_SPEC.md` §3.3 `D-19`/`D-20`, `A-03` | ✓ ×2 | ✓ ("el recálculo vigente ya la lee en vivo": cierto para el intercambio; ver hallazgo 1 para el arquero elegido) |

Las 22 filas tienen su marca y su fila de Change log (ARRASTRE 1090; CANCHA, PANEL y Concept, una cada uno). Una observación: las notas están hechas, pero `AC-02` no puede detectar una omisión (hallazgo 15).

## Appendix C — Estado de la crítica anterior del Concept Note (insumo pedido)

| Hallazgo anterior | Estado en el Concept actual / la Spec |
|---|---|
| 🔴 1 (`D-12` vs `D-26`) | Resuelto: `D-12` ahora se apoya en `D-26`/`FR-072b`–`FR-072d`; la Spec no reemplaza el resumen (`FR-071`, `S-07`) |
| 🔴 11 (reemplazos incompletos) | Resuelto y ampliado: la tabla de la Spec trae 22 filas (Apéndice B) |
| 🔴 13 (§4 vs §14) | Resuelto: la no-meta pasa a "salvo el arco vacío" y `D-04` dice "en esta versión" |
| 🔴 14 (`D-13` sin verificar) | Resuelto: `D-13` cita `index.html:3420`, `:4093`; ver hallazgo 9 para dos bordes (duplas, catálogo viejo) que quedan sin verificar |
| 🟡 2 ("Solo por puntaje") | Resuelto por `D-17`/`D-22`, **pero** la Spec arrastra un error propio (hallazgo 2) |
| 🟡 3, 4, 7, 8, 9, 15, 16 | Resueltos o reescritos en el Concept actual (`D-01`, `D-05`, `D-07`, `D-12`; §6.5 con WCAG leído y URL) |
| 🔵 5, 6, 10, 12 | `D-03` cita `posicionesDe`/`costoEncaje`; `D-20` cubre el catálogo viejo; fechas alineadas |

## Appendix D — Concept ↔ Spec (chequeo 3)

Cada `D-*` está encodado (§3.3 de la Spec los lista a todos, con sus FR/TC):

| D | Encodado en | Contradicción |
|---|---|---|
| D-01 | `FR-002`, `TC-040` | No |
| D-02 | `FR-011` | No |
| D-03 | `FR-020` | No |
| D-04 | `FR-021`, `FR-050` | No |
| D-05 | `FR-013`–`FR-018` | No (acota `FR-018` a "con puestos"; en sin-puestos `FR-024` siempre hay candidatos) |
| D-06 | `FR-012`, `FR-031` | No |
| D-07 | `FR-020`, `TC-010` | No |
| D-08 | `FR-041`, `FR-042` | No |
| D-09 | `FR-043`, salvo `D-23` (`FR-054`) | No: la excepción está declarada |
| D-10 | `FR-070`, `TC-011` | **Sí, en lo que `D-10` supone**: "no hace falta un recálculo nuevo" es falso para el arquero elegido en la diferencia por línea (hallazgo 1) |
| D-11 | `FR-001` | No |
| D-12 | `FR-071`, `FR-072` | No |
| D-13 | `FR-035`, `FR-061` | No (hallazgo 9 sobre alcance) |
| D-14 | `FR-050`, `FR-051`, `FR-022` | No (hallazgo 11 sobre el compañero que sí declara Arquero) |
| D-15 | `FR-056` | No, pero `FR-056` sin acotar contradice `D-22` (hallazgo 5) |
| D-16 | `FR-057` | No |
| D-17 | `FR-024`, `FR-033`, `FR-045` | No |
| D-18 | `FR-060`–`FR-063` | No (hallazgo 9 sobre el puesto del arquero con candado) |
| D-19 | `FR-040`, `FR-042` | No |
| D-20 | `FR-020` | No |
| D-21 | `TC-002`, `TC-043` | No |
| D-22 | `FR-052` | No, pero ver hallazgo 2 (¿dónde se guarda?) |
| D-23 | `FR-053`, `FR-054` | No |
| D-24 | `FR-047`–`FR-049` | No |

No-metas heredadas: las tres están en §3.2 palabra por palabra. Faltan en la Spec los dos diferidos de Concept §14 (hallazgo 17). `OPEN-Q-02`, `-04`, `-06`, `-07`, `-08` figuran resueltas (`AC-03`); `OPEN-Q-03` y `-05` heredadas; `OPEN-Q-09`, `-10`, `-11` son nuevas con destino. Confirmación del `[INFERRED]` de Concept §7.2: hecha en `A-03` (con la salvedad del hallazgo 1).

## Appendix E — Testeabilidad (chequeo 4)

- **EARS.** Todos los FR responden a uno de los cinco patrones; los que usan "While … cuando" o listas (`FR-012`, `FR-019b`, `FR-042`) son una sola obligación. No encontré FR compuestos. Dos tienen debilidad de verificación: `FR-045` ("como hoy", hallazgo 7) y `FR-020` (ubicuo, remite a un glosario; aceptable).
- **NFR cuantificados.** `NFR-001` (17 anchos, dos condiciones), `NFR-002` (44×44, 24×24), `NFR-004` (100 ms, 150 ms), `NFR-005` (conjunto exacto de campos) son medibles. `NFR-003` (≥2 señales, nombres no vacíos, `aria-live`) es contable. `NFR-006` (revisión) y `NFR-007` ("ninguna escritura") son comprobables por inspección/prueba negativa. Ninguno es un adjetivo.
- **Escenarios.** 10 escenarios (`S-01` a `S-07`, `S-20` a `S-22`); 9 con `Variants:` y uno (`S-21`) con `Variants: none — single-path scenario` (cuestionado en el hallazgo 13). Las etiquetas están dentro del conjunto cerrado `[boundary]/[failure]/[concurrency]/[property]`. §9.2 declara "ninguno sin escenario padre". No encontré IDs repetidos ni saltos.
- **Meta-AC.** `AC-50` a `AC-55` presentes en §11.5, con la forma del template. `AC-55` declara el token `Supply-chain: none` justificado (el repositorio no versiona lockfile, `AGENTS.md` § Dependencias). `AC-54`: hallazgo 18.
- **TC ↔ AC.** Cada `TC-*` tiene su `AC` en §11.3 (`AC-30` a `AC-42`); `AC-42` agrupa `TC-040` a `TC-043` con "una revisión", que es débil para `TC-043` (hallazgo 4 y apéndice F).
- **Binding de IDs (AGENTS.md).** `TC-031` y `AC-39` repiten la regla del string literal. Cumple.
- **Escenario de layout.** `TC-033`/`AC-41` exigen que el escenario nuevo falle antes; `AC-41` lo verifica con "el historial de la rama": sólo detecta fallo si el commit del test precede al del arreglo; se puede dejar así.

## Appendix F — Seguridad (chequeo 6)

Modelo de roles y reglas (fuente: `firestore-rules.md`): `data/partidos` — lee cualquiera autenticado, escribe `admin` **y** `jugador` (`:287-290`; `:81`; "limitación aceptada" `:235`); `data/partidosArmado` — sólo `admin` (`:308-310`). El rol viene del claim del token (`index.html:1500-1513`, `isAdmin()` = `window.session.rol === 'admin'`).

| ID | Qué dice la Spec | Evaluación |
|---|---|---|
| `TC-040` (`CWE-862`) | Guarda de rol y ventana **dentro** del manejador | ✓ replica `CANCHA_SPEC.md` `TC-040` (l. 224-227) y es consistente con el código existente (`__moverJugadorManual`: `if(!isAdmin()) return`, `:5780`). Pero "defends" sobre-promete: es defensa del cliente; la barrera de las reglas no distingue rol para `data/partidos` (hallazgo 4) |
| `TC-041` (`CWE-79`) | Escapar nombres en aviso, `title`, `aria-label` | ✓ el control es correcto (regla de `AGENTS.md`). Cobertura de test incompleta (hallazgo 13) |
| `TC-042` (`CWE-20`) | Validar ids del DOM/`dataTransfer` contra el reparto; puesto anterior no del catálogo = ausente | ✓ y alineado con `FR-025` de `ARRASTRE_SPEC.md`. Falta el registro huérfano (hallazgo 8) |
| `TC-043` (`CWE-200`) | Registro sólo en `data/partidosArmado`; aviso sin puntajes | Parcial. (i) La Spec admite que "el puesto en sí no es sensible", así que lo que defiende es el puntaje, que el registro no contiene: el TC protege un dato que no almacena. (ii) El control real —que el registro caiga en el documento de `admin`— depende de agregar su nombre a `CAMPOS_EQUIPOS_ARMADO` (`index.html:2350`); un campo nuevo que no esté en esa lista va al documento **público** por defecto, y `AC-42` lo verifica sólo "por revisión". Es una falla abierta por omisión. Sugerido: exigir un test que lea `window.__ultimosDocs.partidos` y falle si contiene el campo (el arnés ya guarda el contenido, `tests/fixtures-app.js:331-335`) |
| Ruling `CWE-863`/`CWE-284` | Preexistente, no se agrava; "lo nuevo va al documento de `admin`" | Conclusión ✓ (las reglas no cambian: `AC-31`). Razón imprecisa (hallazgo 4) |
| `CWE-639` (no aplica) | los ids se validan (`TC-042`); la autorización es por rol | Razonamiento válido para la interfaz; para el almacenamiento la autorización de `data/partidos` es débil por diseño y está aceptada. Aceptable como ruling si se enlaza al hallazgo 4 |
| `CWE-352` (no aplica) | sin endpoint propio con sesión por cookie | ✓ coherente con el modelo (token de Firebase) |
| Resto (17 CWE) | no aplica, con una razón por grupo | ✓. Los 17 están en el Top 25 de 2025 (verificado en vivo, Apéndice A). Ninguna tiene razón dudosa |
| Edición CWE | "consultado en vivo el 2026-10-28" | ✓ verifiqué la misma página el 2026-10-29: edición 2025 |
| Supply chain (`AC-55`) | sin lockfile | ✓ coincide con `AGENTS.md` § Dependencias; `TC-001` prohíbe dependencias nuevas |

Postura declarada vs. §4.5 (cross-doc): el Concept §5.2 señala `CWE-79`, `CWE-862`, `CWE-863`; la Spec trata las tres (863 como ruling) y suma `CWE-20`, `CWE-200`, `CWE-284`, `CWE-639`, `CWE-352`. No hay deriva de postura. Un riesgo de seguridad **no** previsto por el Concept §5.2 ni por la Spec: la consistencia entre dos documentos que se escriben en dos operaciones (hallazgo 8).

## Appendix G — Inferencias presentadas como hechos (chequeo 5)

| Afirmación | Dónde | Tiene cita o marcador | Observación |
|---|---|---|---|
| "en un partido sin puestos … cada camiseta se dibuja en la línea de su principal" | glosario, línea 326 | Cita `:3295` | La cita no lo respalda sin matiz (hallazgo 2) |
| "Verificado en código" que totales, diferencia por línea y faltantes leen el puesto asignado en vivo, "Confirma el `[INFERRED]` de §7.2" | `A-03` | Cita 3 ubicaciones | Cierto para la lectura; no verificó la **valuación** del arquero elegido (hallazgo 1) |
| "un arquero elegido deja un lugar de campo sin cubrir y el recálculo vigente lo muestra" | `A-04`, `S-04` | Cita `:1636-1637` (formación sin arco) | Plausible: Martín (ARQ) no entra en ningún cupo de `puestosDeFormacion`, así que `faltantesDeFormacionVigente` deja LI vacío (`:5979-5989`). Es inferencia leída del código, no ejecutada; la Spec la presenta como hecho |
| `FR-061`: la unidad con candado conserva su puesto en la regeneración | `FR-061` | Cita indirecta vía Concept | Verificado para estrategias 2/3/4 con jugadores individuales; no para dupla ni catálogo viejo (hallazgo 9) |
| "el cambio de pestaña por sobrevuelo … ya no aplica" la justificación | encabezado, "Complementa sin reemplazar" | Cita `ARRASTRE_SPEC.md` l. 119-123 | ✓ razonamiento correcto |
| "El `click` … se distingue del arrastre nativo" | `A-01` | `[UNVERIFIED]` con razón legítima (sin teléfono, `ARRASTRE_SPEC.md` `NFR-008`) | ✓ marcador correcto y arrastrado a §17 |
| "La camiseta ya mide al menos 44×44" | `A-02` | `[UNVERIFIED]` con razón legítima ("el alto no se midió") | ✓. Dato adicional: `index.html:617` fija `--chip-size: 44px` para filas de 5, justo en el piso |
| Reglas desplegadas = contrato | `A-05` | `[UNVERIFIED]` con razón y test que lo cubre | ✓; `tests/reglas.test.js` necesita credenciales de staging (`AGENTS.md` § Tests) |
| "la aplicación no tiene aviso emergente" | `OPEN-Q-09` | Sin cita | No verifiqué; no hay cita a código. Sugerido citar el `grep` que lo respalda o marcarlo |
| "hoy ese intercambio se aplicaba" | `S-03b` | Implícita (`ARRASTRE_SPEC.md` `FR-011`) | ✓ |

Los tres `[UNVERIFIED]` (`A-01`, `A-02`, `A-05`) están enumerados en §17 ("Plan must carry the verification debt"), como pide `MD-26`. No encontré `[UNVERIFIED]` con razón ilegítima.
