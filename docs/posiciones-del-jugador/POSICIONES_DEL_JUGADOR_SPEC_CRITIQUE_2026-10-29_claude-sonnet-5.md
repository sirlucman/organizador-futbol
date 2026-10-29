# Critique — POSICIONES_DEL_JUGADOR_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5 (leído de la configuración de esta sesión; distinto de `claude-sonnet-5-5`, que hizo la primera crítica)
> **Author model:** claude-opus-5-5 (verificado en el encabezado de la Spec, línea 3, y en las once filas de su Change log, §18)
> **Date:** 2026-10-29
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` (árbol de trabajo en `fb880df`, rama `docs/posiciones-del-jugador`) · `POSICIONES_DEL_JUGADOR_CONCEPT.md` (§10 completa, D-04 a D-31) · `POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md` y `POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md` (las dos críticas anteriores) · `git diff 4c077c0 fb880df -- docs/ Roadmap.md` · `AGENTS.md` · `docs/003-motor-generacion-equipos/spec.md` (l. 217-237, l. 288) · `docs/equipos-en-el-campo/` (`EQUIPOS_EN_EL_CAMPO_CONCEPT.md`, `rebanada-1-cancha/CANCHA_SPEC.md`, `rebanada-2-arrastre/ARRASTRE_SPEC.md`, `rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md`, `rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md`) · `docs/rol-en-el-token/contracts/firestore-rules.md` (l. 70-90, 300-315) · `index.html` en cada línea citada, más la verificación cruzada de `generarEquiposEstrategia2`/`3` (l. 3410, 4086) y `posicionesPreviasVigentes` (l. 3105-3111) · `Roadmap.md` (l. 87) · `references/critic-rubric.md` de esta skill.
> **Mode:** Step 7 independent critique, per-doc. **Tercera crítica de esta Spec** (cuarta, contando un borrador sin commitear que se describe al final de este reporte).
> **Independence (Step 7.0):** familia distinta, mismo proveedor (autor Opus → crítico Sonnet). Es el "término medio aceptable" de `critic-rubric.md`: rompe el lazo de mismo-modelo, pero puede compartir sesgo residual de entrenamiento con el autor. No es una crítica de otro proveedor. Es además la misma familia que la primera crítica de esta Spec (`claude-sonnet-5-5`), aunque una versión distinta (`claude-sonnet-5`, sin el ".5"); por eso esta pasada no debe tratarse como aportando una familia nueva frente a esa primera crítica, sólo frente a la segunda (`claude-fable-5-1`) y la tercera sin commitear (`claude-haiku-5-5`).
> **Chequeos pedidos por el propietario:** (1) estado de los hallazgos 🔵 3, 6, 7, 11 y 12 de la crítica de `claude-fable-5-1`, (2) alcance de `D-31`, (3) que `D-30` no cambie el motor, (4) `FR-061` contra la Spec del motor y el código, (5) IDs retirados citados con significado viejo, (6) citas, (7) reemplazos y notas recíprocas, (8) testeabilidad, (9) inferencias como hechos y seguridad. Resultados en los Apéndices 1 a 9.

## Verdict

**CHANGES REQUESTED** — 1 🔴, 2 🟡, 2 🔵.

La corrección `D-31` hizo lo que decía hacer: sacó a la feature del arco vacío y la dejó, en el texto, limpia de las dos clases de problema que bloquearon la primera crítica (valor propio del arquero elegido, mundo sin `posicionOverride`). Verifiqué ese retiro de punta a punta (Apéndice 2 y 3): no queda ningún requisito vigente de la Spec que ocupe el arco, guarde un puesto anterior o escriba en `data/partidosArmado`, y ningún ID retirado se cita con su significado viejo. Lo que sí encontré, y por eso el veredicto es de cambios: **`FR-061` —el requisito que cierra `OPEN-Q-12`— afirma algo que el código no hace en un caso que la propia Spec declara en alcance** (`S-01i`, "puestos del catálogo viejo"). El motor no "arranca desde el guardado" para una unidad bloqueada cuyo puesto guardado es una posición vieja: `posicionesPreviasVigentes` lo descarta antes de que llegue a ninguna estrategia, y el comentario del propio código lo dice ("su puesto lo decide el motor como el de cualquier titular no bloqueado"). `S-06c`, la variante que debería probarlo, prueba algo más débil (que el equipo se conserva) y por eso no destapa la contradicción. Es el Hallazgo 1 (Apéndice 4). Los dos 🟡 son de precisión en el propio aparato de seguimiento de la Spec: el Change log se equivoca sobre cuáles hallazgos viejos siguen pendientes (Apéndice 1), y el glosario perdió la entrada "Arco vacío" al podar el vocabulario del arquero manual, aunque el término se sigue usando 15 veces (Apéndice 2 y Hallazgo 3).

Ninguna decisión del propietario (`D-01` a `D-31`) se discute en este reporte.

## Findings

### Per-doc — Accuracy

#### 1. `FR-061` dice que el motor "arranca desde el guardado" al regenerar; para un puesto del catálogo viejo, el código lo descarta antes de llegar al motor, y `S-06c` no lo verifica

- **Dimension:** Accuracy (con Methodology-invariants: la Spec cierra `OPEN-Q-12` con una verificación que no prueba lo que afirma cerrar)
- **Where:** `POSICIONES_DEL_JUGADOR_SPEC.md` `FR-061` (líneas 449-452), `S-06` y `S-06c` (596-609), `OPEN-Q-12` (826), §3.1 ("los partidos con puestos del catálogo viejo", línea 107), `D-20`/`S-01i` (líneas 179-180, 519)
- **What:** `FR-061` dice: "el sistema mantendrá a cada unidad con candado en su equipo. Su puesto lo decide el motor, que arranca desde el guardado —incluido el que le dio un intercambio—, como hoy: el candado fija el equipo y no el puesto" y cita `003-motor-generacion-equipos/spec.md:231` e `index.html:3419-3422`. Para una unidad bloqueada cuyo puesto guardado es una posición del catálogo viejo (Defensor, Volante, Delantero — las que `D-20`/`S-01i` tratan como "partido con puestos"), eso es falso: `posicionesPreviasVigentes` (`index.html:3108-3111`) filtra esas posiciones **antes** de que `prevPosicionAsignada` llegue a cualquier `generarEquiposEstrategiaN`. El comentario que antecede a la función lo dice explícitamente: "un bloqueado de un partido armado antes del cambio se queda en su equipo, pero su puesto lo decide el motor **como el de cualquier titular no bloqueado**". O sea: para ese caso el motor no arranca desde lo guardado — ignora lo guardado y lo trata exactamente igual que a un jugador sin candado. `S-06c` ("un partido con puestos del catálogo viejo y una unidad con candado que intercambió puesto: tras regenerar sigue en su equipo") sólo afirma la conservación de equipo (que sí es cierta, por `FR-015` del motor) y evita deliberada o accidentalmente la parte de "arranca desde el guardado", así que un test que satisfaga `S-06c` tal como está escrito no puede detectar la contradicción.
- **Why it matters:** (a) `OPEN-Q-12` se cierra citando exactamente `S-06b` y `S-06c` como la verificación, y uno de los dos casos que pretende cubrir no prueba lo que el open question preguntaba. (b) Es un caso explícitamente en alcance (§3.1, tercera viñeta: "la regla de compatibilidad, incluidas... los partidos con puestos del catálogo viejo"), no un borde hipotético. (c) Quien implemente leyendo sólo `FR-061` va a esperar que el puesto previo de un bloqueado con posición vieja sobreviva a la regeneración, y no sobrevive: el motor lo reasigna como a cualquier jugador libre. Si el propietario prefiere que sí sobreviva, hace falta cambiar `posicionesPreviasVigentes` (motor); si prefiere el comportamiento actual (que parece ser la lectura más simple, y la que ya está implementada), `FR-061` necesita una excepción explícita para este caso, igual que la tiene para "el que le dio un intercambio".
- **Evidence:** `index.html:3105-3111` (comentario y cuerpo de `posicionesPreviasVigentes`); `index.html:3410`, `:4086` (`generarEquiposEstrategia2`/`3` reciben `prevPosicionAsignada` ya filtrado); `index.html:3419-3422`, `:4092-4096` (la misma inicialización ternaria en las dos estrategias: `bloqueadosSet.has(p.id) && prevPosicionAsignada && prevPosicionAsignada[p.id] ? prevPosicionAsignada[p.id] : p.principal`); `docs/003-motor-generacion-equipos/spec.md:231` (el texto citado por `FR-061` es del edge case "Estrategia 4 con casi todos los titulares bloqueados", no una regla general — la regla general de "el candado fija el equipo" es `FR-015` de esa Spec, l. 288, que `FR-061` no cita). Hecho: la función filtra por `esPosicionVieja`; la inicialización es idéntica en las dos estrategias. Inferencia (no ejecuté el motor): que el resultado visible es "se reasigna como si no tuviera candado"; la lectura del código no encontré ninguna rama que lo contradiga.
- **Confidence:** High en el código; High en que `S-06c` no prueba la claúsula en disputa.
- **Severity:** 🔴 Blocking
- **Suggested fix:** Sin tocar ninguna decisión del propietario: (1) agregar a `FR-061` la excepción: "salvo que el puesto guardado sea una posición del catálogo viejo (Defensor, Volante, Delantero): en ese caso el motor lo trata como a cualquier titular sin candado (`posicionesPreviasVigentes`, FR-066 de la Spec del motor)"; (2) reescribir el *Then* de `S-06c` para que afirme explícitamente esto ("su puesto queda donde lo decida el motor, no necesariamente el que tenía"), de forma que un test que lo satisfaga sí distinga los dos comportamientos; (3) citar `FR-015` (no la línea 231, que es de un edge case de Estrategia 4) como respaldo de "el candado fija el equipo", y citar `posicionesPreviasVigentes` (o la nueva `FR-066` del motor si existe) como respaldo de la excepción del catálogo viejo.

### Per-doc — Consistency

#### 2. El Change log de la Spec dice que los hallazgos 🔵 6 y 7 de `claude-fable-5-1` "quedan para la revisión siguiente", pero los dos dejaron de aplicar en la misma edición que lo declara

- **Dimension:** Consistency (la Spec se contradice a sí misma: retira en el mismo párrafo lo que el párrafo siguiente dice que sigue pendiente)
- **Where:** §18 Change log, fila `2026-10-29` que introduce `D-31` (línea 853); hallazgos 6 y 7 de [`POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md)
- **What:** Esa misma fila del Change log dice "Se retiran `FR-047` a `FR-049`, `FR-050b`, `FR-051` a `FR-056`, `FR-058`, `FR-058b`, `FR-059`, `FR-062`, `FR-063`..." y, dos oraciones después, "los 🔵 3, 6, 7, 11 y 12 quedan para la revisión siguiente". El hallazgo 6 de esa crítica es íntegramente sobre `FR-050b` ("`FR-050b` repite lo que `FR-050` ya implica"); el hallazgo 7 depende de `D-23` ("volver del arco al puesto anterior"), retirada por el propio `D-31` dos líneas antes en el mismo Change log. Verifiqué: `FR-050b` no existe en el texto actual de la Spec (está en la lista de retirados) y el §3.2 actual ya no tiene la segunda excepción que el hallazgo 7 señalaba (no menciona `D-23` ni "vuelve a un puesto suyo" fuera del arco). Los dos hallazgos no tienen nada que corregir: no quedan pendientes, dejaron de aplicar, igual que los hallazgos 1, 2, 4, 5, 8, 9 y 10 que la misma fila sí reconoce como caídos.
- **Why it matters:** Es el mecanismo de seguimiento de la propia Spec el que falla, no un requisito. Alguien que abra esta Spec para "atender lo pendiente de la revisión anterior" va a buscar cómo arreglar `FR-050b` y no lo va a encontrar, porque ya no existe.
- **Evidence:** líneas citadas; `grep -c FR-050b` en el texto vigente = 0 fuera de la lista de retirados (línea 441); §3.2 actual (líneas 119-129) sin mención de `D-23` ni de una segunda excepción.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** En la próxima fila del Change log, mover los hallazgos 6 y 7 de "pendientes" a "dejaron de aplicar por `D-31`" junto con los demás, dejando sólo 3, 11 y 12 como genuinamente pendientes (ver Apéndice 1 para el detalle de cada uno).

### Per-doc — Completeness

*(sin hallazgos propios; ver Hallazgo 3 en Methodology-invariants, que es la clasificación que usa el rubric para la regla del Glosario — `critic-rubric.md` §5.2 — en vez de Completeness)*

None ✓

### Per-doc — Clarity

#### 4. `FR-042` sigue siendo un requisito compuesto (tres textos de aviso en un solo FR)

- **Dimension:** Clarity (EARS, `MD-03`)
- **Where:** `FR-042` (líneas 419-422)
- **What:** Ya lo señaló la crítica de `claude-fable-5-1` (hallazgo 11, junto con `FR-048`, `FR-049` y `FR-053`). Esos otros tres quedaron retirados por `D-31`; `FR-042` sobrevive sin cambios y sigue fijando tres variantes de texto ("{B} no juega de {puesto de A}", "{A} no juega de {puesto de B}", "Ninguno de los dos juega en el puesto del otro") dentro de un único requisito.
- **Why it matters:** Un test de `FR-042` tiene tres oráculos distintos en vez de uno; no bloquea nada, pero es exactamente la clase de requisito que el principio "una obligación por línea" quiere evitar.
- **Evidence:** líneas citadas.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Enumerar las tres ramas (`FR-042`, `FR-042b`, `FR-042c`) sin renumerar nada más, como ya sugirió la crítica anterior.

### Per-doc — Methodology-invariants

#### 3. El Glosario perdió la entrada "Arco vacío" al podar el vocabulario del arquero manual; el término se sigue usando 15 veces

- **Dimension:** Methodology-invariants (`critic-rubric.md` §5.2, fila "§6 Glossary": todo término usado 5 o más veces debe estar definido)
- **Where:** §6 *Glossary* (líneas 317-333); usos en `FR-050` (436), `§7.6` encabezado "Arco vacío" (434), `S-04` *Given*/*Then* (566-567, 569), `S-04a` a `S-04c` (575-577), `S-05` *Then* (587), `S-05b`/`S-05c` (593-594)
- **What:** `grep -c "arco vacío"` sobre el texto vigente da 15. El término no tiene entrada en el Glosario (§6, líneas 317-333: ninguna fila lo contiene). Comparé con la versión anterior a la corrección de `D-31` (`git show 4c077c0:…`): ahí sí existía una fila "Arco vacío" en el glosario, junto con "Arquero manual", "Puesto anterior" y "Destino". Las tres últimas correspondían al aparato retirado y su baja es correcta; la primera no debía caer con ellas, porque `FR-050` y los escenarios `S-04`/`S-05` la siguen necesitando.
- **Why it matters:** Es justo el tipo de regresión que el Glosario existe para prevenir: el término queda definido implícitamente, de forma dispersa, por la redacción de `FR-050` ("un equipo tenga el arco vacío... se resuelve regenerando") en vez de en un solo lugar canónico. No es ambiguo hoy —el texto de `FR-050` alcanza para inferirlo—, pero es el tipo de vacío que deriva en definiciones divergentes si otro documento (el Implementation Plan, por ejemplo) necesita citarlo.
- **Evidence:** conteo de la palabra en el archivo vigente: 15; `git show 4c077c0:docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_SPEC.md` muestra la fila "Arco vacío" en el Glosario de esa versión, retirada en la edición de `D-31` junto con las otras tres.
- **Confidence:** High
- **Severity:** 🟡 Should fix (no 🔴 pese a que el rubric trata las violaciones de invariantes como bloqueantes "casi siempre": acá el término sigue siendo inferible sin ambigüedad desde `FR-050`, a diferencia del Hallazgo 1, donde el texto afirma algo que el código contradice)
- **Suggested fix:** Restituir una entrada "Arco vacío | En un partido con puestos, el de un equipo sin ninguna unidad con puesto asignado ARQ (`FR-050`)." Sin las referencias a `FR-050b`/`FR-052` que tenía la versión vieja, porque esos IDs ya no existen.

## Summary

- Blocking: 1 (Hallazgo 1)
- Should fix: 2 (Hallazgos 2, 3)
- Suggestions: 2 (Hallazgos 4, y el de línea-corrida en el Apéndice 1/3 por el header)
- Methodology-invariants violados: `critic-rubric.md` §5.2 fila "§6 Glossary" (Hallazgo 3). Ninguno de los invariantes "All-doc-types" (IDs, EARS, `[UNVERIFIED]`, diagramas, seguridad) se viola en grado bloqueante.

---

## Apéndice 1 — Estado de los hallazgos 🔵 3, 6, 7, 11 y 12 de `claude-fable-5-1` (los que la Spec declara pendientes)

La fila del Change log que introduce `D-31` dice textualmente: *"los 🔵 3, 6, 7, 11 y 12 quedan para la revisión siguiente"*. Verifiqué cada uno contra el texto vigente.

| # | Hallazgo (resumen) | Estado según mi verificación | Evidencia |
|---|---|---|---|
| 3 🔵 | Citas corridas una o dos líneas en el aviso del encabezado (no menciona que `CANCHA_SPEC.md` también corrió sus líneas) y en `FR-058b`/`AC-42` | **Parcialmente abierto** | La parte de `FR-058b` y de `AC-42` citando `tests/fixtures-app.js:331-335` **dejó de aplicar**: `FR-058b` está retirado y el `AC-42` vigente ya no cita ese archivo. La parte del aviso del encabezado **sigue abierta**: hoy dice que las notas recíprocas corrieron los números de `ARRASTRE_SPEC.md` y `PANEL_ARMADO_SPEC.md`, pero no menciona a `CANCHA_SPEC.md`, cuyas líneas también corrieron (glosario "Posición asignada" 279→281, `A-04` 766→768→766 según la edición). Verifiqué los números actuales: la fila del glosario está en la línea 281 y `A-04` en la 766, confirmando el corrimiento que ya había detectado esa crítica. La Spec debería declararlo "pendiente" sólo por esta parte, no por las tres |
| 6 🔵 | `FR-050b` repite lo que `FR-050` ya implica | **Dejó de aplicar — mal clasificado como pendiente** | `FR-050b` está retirado por el mismo `D-31` que declara el hallazgo pendiente (ver Hallazgo 2 de este reporte) |
| 7 🔵 | §3.2 presenta como "heredado" un no-objetivo que la Spec había ampliado (la segunda excepción de `D-23`, "vuelve a su puesto anterior") | **Dejó de aplicar — mal clasificado como pendiente** | `D-23` está retirada por `D-31`; el §3.2 vigente no tiene ninguna segunda excepción que atribuir mal al Concept Note (ver Hallazgo 2 de este reporte) |
| 11 🔵 | FR compuestos: `FR-048`, `FR-049`, `FR-053`, `FR-042` | **Parcialmente abierto** | `FR-048`, `FR-049` y `FR-053` están retirados (dejaron de aplicar). `FR-042` sigue compuesto y sigue sin corregir (Hallazgo 4 de este reporte) |
| 12 🔵 | El glosario de `CARGA_POR_TOQUE_SPEC.md` contrasta el modo de carga con una cancha "de sólo lectura" que ya no lo es, sin ninguna nota | **Sigue abierto, sin cambios** | Confirmé con `grep -c POSICIONES_DEL_JUGADOR_SPEC docs/equipos-en-el-campo/rebanada-6-carga-por-toque/CARGA_POR_TOQUE_SPEC.md` = 0: no se agregó ninguna nota desde la crítica de `claude-fable-5-1`. El contraste de la definición ("en vez de mostrarlas de sólo lectura") sigue sin reflejar que, fuera del modo de carga, la cancha también responde al toque para `admin` en la ventana de edición |

**Conclusión del Apéndice:** de los cinco, sólo el 12 está correctamente clasificado como pendiente sin matices. El 3 y el 11 están pendientes pero por una porción menor de lo que el número sugiere (el resto cayó con `D-31`). El 6 y el 7 están mal clasificados: deberían estar en la lista de "dejaron de aplicar" junto con 1, 2, 4, 5, 8, 9 y 10 (ver Hallazgo 2 de este reporte, arriba).

## Apéndice 2 — Alcance de `D-31`

Repetí el barrido que pide el propietario: cualquier texto vigente (no tachado, no marcado como retirado, fuera de los Change log) que todavía suponga que la feature ocupa el arco vacío, pone a alguien en el arco, guarda un puesto anterior o un registro, o escribe en `data/partidosArmado`.

**En la Spec (`POSICIONES_DEL_JUGADOR_SPEC.md`):** limpio. `§3.2` dice explícitamente lo contrario ("El sistema no moverá a un jugador a un lugar vacío de su propio equipo, ni siquiera al arco... se resuelve regenerando, como hoy"); `FR-050` deniega el arco como destino; `TC-002` sólo menciona `data/partidos`; `A-04`/`A-05` están retirados; `US-05` está retirada. Único residuo: la pérdida de la entrada "Arco vacío" del Glosario (Hallazgo 3), que es un problema de completitud, no de alcance — no hay ningún requisito activo que suponga la ocupación.

**En las notas recíprocas (`docs/equipos-en-el-campo/`):** limpio. `grep -rn "POSICIONES_DEL_JUGADOR" docs/equipos-en-el-campo/ | grep -E "FR-047|FR-048|FR-049|FR-050b|FR-051|FR-052|FR-053|FR-054|FR-055|FR-056|FR-058|FR-059|FR-062|FR-063"` no devuelve ninguna línea: ninguna nota recíproca de `ARRASTRE_SPEC.md`, `CANCHA_SPEC.md`, `PANEL_ARMADO_SPEC.md` ni del Concept Note de `equipos-en-el-campo` cita hoy alguno de los FR retirados por `D-31`. El `git diff 4c077c0 fb880df` muestra que esas notas se reescribieron en la misma edición para quitar toda mención a "arco vacío" y "arquero manual" (por ejemplo, la nota de `FR-022`/`D-20` de `ARRASTRE_SPEC.md` pasó de "el intercambio, el arco vacío y la vuelta del arquero manual sí la modifican" a "el intercambio sí la modifica").

**En el Concept Note de esta feature (`POSICIONES_DEL_JUGADOR_CONCEPT.md`) — fuera del documento bajo crítica, pero el propietario pidió el barrido:** acá sí quedan contradicciones activas, **introducidas por la propia edición que agregó `D-31`**. La tabla de §10 antepone a `D-04`, `D-13` y `D-18` una nota "(Enmendada el 2026-10-29 por `D-31`...)" pero **no edita el cuerpo de la celda**, que sigue afirmando lo contrario de la nota:

| Decisión | Nota antepuesta (correcta) | Cuerpo de la celda (sin editar, contradice la nota) |
|---|---|---|
| `D-04` | "ya no hay excepción del arco vacío" | "...si no, no se ofrece ni se aplica. **Única excepción: el arco vacío (`D-14`)**" |
| `D-13` | "al regenerar, el candado conserva el equipo y no el puesto" | "Un jugador con candado se puede intercambiar, y **queda fijado en su puesto nuevo al regenerar**" — exactamente lo que la nota dice que ya no vale |
| `D-18` | "con candado se conserva el equipo; el puesto lo decide el motor, y no hay arquero puesto a mano" | "...**Un arquero elegido deja el arco siempre**, tenga candado o no; con candado conserva el equipo" — sigue nombrando un concepto retirado |

Verifiqué con `git diff 4c077c0 fb880df` que estas tres filas se tocaron exactamente para anteponer la nota, sin tocar el resto del texto: la contradicción no es preexistente, es un efecto secundario de la edición de `D-31`. No cuenta para el veredicto de este reporte (el documento bajo crítica es la Spec), pero la Spec hereda estas tres decisiones en su §3.3 citando sólo la nota correcta ("La excepción del arco vacío se retiró con `D-31`"), así que la Spec en sí no queda contaminada — quien lea *sólo* el Concept Note sí puede confundirse.

## Apéndice 3 — `D-30`: ¿algún requisito cambia cómo el motor elige arqueros o calcula puntajes?

Repetí el barrido de la segunda crítica (que había encontrado un punto a declarar en el extinto `FR-062`) sobre el texto vigente.

| Chequeo | Resultado | Dónde |
|---|---|---|
| Elección de arqueros | **Limpio** | El extinto `FR-062` —que exigía que la interfaz le pasara al motor un puesto distinto del guardado para un arquero manual con candado— fue retirado por `D-31` junto con todo el aparato del arquero manual. No queda ningún requisito que altere la entrada del motor a propósito. `TC-012` ("Ninguna estrategia del motor se modificará, y al regenerar se le pasará lo guardado, como hoy") describe exactamente lo que el código hace, sin excepciones declaradas |
| Cálculo de puntajes | **Limpio** | `TC-011` ("sin cálculo nuevo"), `FR-056` no existe más (retirado), `AC-34` pide revisión de que no hay cálculo nuevo y que `tests/motor.test.js` pasa sin cambios |
| Alguien que no declara Arquero en el arco | **No aplica** (la feature ya no ofrece el arco a nadie) | `FR-050` |
| Valor especial para el arquero | **Limpio** | `D-15`, `D-25` marcadas retiradas en §3.3 |

Sin hallazgos nuevos: el barrido de `D-30` quedó, con la salida de `D-31`, estrictamente más fácil de cumplir que cuando lo verificó la crítica anterior, porque ya no hay ningún punto de contacto entre esta Spec y la entrada del motor salvo el que describe el Hallazgo 1 de este reporte (que es sobre `D-31`/`D-13`, no sobre `D-30`).

## Apéndice 4 — `FR-061` contra la Spec del motor y el código

Ver el Hallazgo 1 (arriba) para el desarrollo completo. Resumen de la tabla pedida:

| Afirmación de `FR-061` | ¿Cierta contra el motor y el código? | `S-06` y variantes, ¿lo verifican? |
|---|---|---|
| "mantendrá a cada unidad con candado en su equipo" | ✓ Cierta — `FR-015` de la Spec del motor (l. 288): "MUST garantizar que un jugador bloqueado nunca cambie de equipo en ninguna regeneración" | ✓ `S-06`, `S-06a`, `S-06b`, `S-06c` lo verifican, los cuatro |
| "su puesto lo decide el motor, que arranca desde el guardado —incluido el que le dio un intercambio—" | ✓ Cierta para un puesto del catálogo nuevo (`S-06` padre, `S-06a`, `S-06b`) | ✓ `S-06` (puesto nuevo tras intercambio), `S-06a` (ARQ) lo verifican |
| misma afirmación, para un puesto del catálogo viejo | **✗ Falsa**: `posicionesPreviasVigentes` lo descarta antes de llegar al motor | **✗ `S-06c` no lo verifica**: sólo afirma conservación de equipo, no que el puesto arranque desde el guardado |
| "el candado fija el equipo y no el puesto" | ✓ Cierta como enunciado general, pero la cita (`spec.md:231`) es de un edge case de Estrategia 4, no de la regla general (`FR-015`) | — (es la misma afirmación de la fila 1) |

## Apéndice 5 — IDs retirados o reescritos citados con el significado viejo

**En la Spec:** ninguno. Hice `grep` de cada ID retirado (`FR-022`, `FR-047` a `FR-049`, `FR-050b`, `FR-051` a `FR-056`, `FR-058`, `FR-058b`, `FR-059`, `FR-062`, `FR-063`, `US-05`, `A-04`, `A-05`, `D-14`, `D-15`, `D-21` a `D-29`) contra el texto vigente, filtrando las filas del Change log (que son historia, no requisitos activos) y los falsos positivos de substring (`MD-24`/`MD-25` coinciden con el patrón `D-24`/`D-25` sin anclar el inicio). Toda mención restante está correctamente enmarcada como retirada (`§7.6`, `§7.7`, `§14`) o como referencia histórica dentro de §3.3 ("Decisiones que el propietario tomó... registradas como `D-18` a `D-24`", inmediatamente seguida de la aclaración de que `D-21` a `D-24` están retiradas). Ninguna cita usa un ID retirado como si siguiera vigente.

**En las notas recíprocas:** ninguno (ver Apéndice 2).

**En el Concept Note:** las tres contradicciones del Apéndice 2 no son, en rigor, "un ID citado con el significado viejo" — son el cuerpo de la propia decisión sin editar tras anteponerle una nota. Se listan ahí porque encajan mejor en ese chequeo.

## Apéndice 6 — Citas

Prioridad a las citas nuevas o no cubiertas por las dos críticas anteriores.

| Cita | Qué dice la Spec | Qué dice la fuente | Resultado |
|---|---|---|---|
| `docs/003-motor-generacion-equipos/spec.md:231` (`FR-061`) | "el candado fija el equipo y no el puesto" | Es el texto literal de esa línea, pero está dentro del edge case "Estrategia 4 con casi todos los titulares bloqueados"; la regla general equivalente es `FR-015` (l. 288), no citada | ⚠ cita literalmente correcta, pero fuera de contexto (Hallazgo 1) |
| `index.html:3419-3422` (`FR-061`) | inicialización de `posicionAsignada` que arranca desde lo guardado para un bloqueado | Correcto para `generarEquiposEstrategia2`; la misma lógica está en `generarEquiposEstrategia3` (`index.html:4092-4096`), no citada, y ninguna de las dos ve nunca una posición vieja porque `posicionesPreviasVigentes` ya la filtró antes (`index.html:3108-3111`, no citada por `FR-061`) | ⚠ cita exacta pero incompleta: falta la función que decide qué le llega |
| `index.html:3364-3366` (`S-06a`) | el motor ya deja en el arco a un bloqueado con ARQ guardado | `naturalPool` (`:3375`) incluye a todo titular cuyo `posicionAsignada` inicial sea `'Arquero'`, lo que para un bloqueado viene de `prevPosicionAsignada` | ✓ |
| `docs/rol-en-el-token/contracts/firestore-rules.md:81`, `:308-310` (ruling `CWE-863`) | `jugador` puede escribir `data/partidos`; `data/partidosArmado` sólo `admin` | Confirmado: la tabla de §2.2 muestra `data/partidos` con "jugador escribe ✅"; la regla de `data/partidosArmado` exige `rol == 'admin'` para leer y escribir | ✓ |
| `Roadmap.md` (encabezado, "la idea de `Roadmap.md` que esta feature encara") | línea 86, alternativa táctil | El ítem de la alternativa táctil está en la línea 87 del `Roadmap.md` vigente (el `git diff` muestra que se agregó una línea nueva arriba del ítem citado el mismo día, por el propio `D-31`, lo que corrió la numeración en uno) | ⚠ corrida en una línea por el propio diff que agregó el ítem del arco vacío a `Roadmap.md`; el ID/sección no existe como tal, es texto libre — bajo riesgo, pero confirma el patrón de citas que se corren con cada edición del mismo día |
| `Roadmap.md` (nuevo ítem agregado por `D-31`) | "la idea de ocupar ese arco a mano queda en `Roadmap.md`" (Concept Note `D-31`) | El ítem efectivamente se agregó: "Ocupar a mano un arco que quedó vacío, sin regenerar... Quedó afuera de `docs/posiciones-del-jugador/` (`D-31` de su Concept Note)" | ✓ |
| `docs/equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md` l. 279, 764-766 (encabezado) | números de línea pre-edición | En el árbol actual están en 281 y 766 (corridas por la edición de `D-31`, no declarado — ver Apéndice 1, hallazgo 3) | ⚠ |

Las citas a `index.html` que las dos críticas anteriores ya habían verificado (`:1778`, `:3159-3162`, `:3227-3237`, `:5052-5054`, `:5064-5070`, `:5768-5777`, `:5635-5777`, `:5863-5870`, `:5980`, `:5072-5080`, `:5258-5262`) no cambiaron de contenido ni de corrección desde entonces; no las repetí.

## Apéndice 7 — Reemplazos y notas recíprocas

**Completitud de la declaración del encabezado.** Las 15 filas de la tabla de reemplazo (líneas 30-52) y las cuatro entradas de "Complementa sin reemplazar" (56-68) describen, cada una, un `Reemplazado…`/nota equivalente en el documento de origen. Volví a abrir las cinco specs de `equipos-en-el-campo` y el Concept Note:

- `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` `D-19`, `D-20`: ✓ marcadas, con el texto recortado para no mencionar ya el arco vacío (coincide con lo que la Spec declara hoy en esas filas).
- `ARRASTRE_SPEC.md`: 24 notas `Reemplazad[oa]` vigentes que mencionan `POSICIONES_DEL_JUGADOR_SPEC.md`; ninguna cita un FR retirado por `D-31` (Apéndice 2). La nota de `FR-022`/`AC-23` ya no tiene la asimetría que señalaba el hallazgo 13 de `claude-fable-5-1` (la crítica anterior ya lo había confirmado resuelto, y sigue así).
- `CANCHA_SPEC.md`: `TC-012`, glosario "Posición asignada", `A-04` — las tres marcadas, texto correcto, líneas corridas (Apéndice 1/6).
- `PANEL_ARMADO_SPEC.md`: `§3.3`/`A-03` — marcadas, sin mención a los FR retirados.
- `CARGA_POR_TOQUE_SPEC.md`: sigue sin ninguna nota (bajo "Complementa sin reemplazar", no bajo la tabla de reemplazo, así que `AC-02` no lo exige formalmente) — pero el hallazgo 12 de `claude-fable-5-1` sobre su glosario sigue abierto (Apéndice 1).

**Notas sobrantes.** Ninguna: el `git diff 4c077c0 fb880df` muestra que las notas que dejaron de corresponder (las que mencionaban "arco vacío"/"arquero manual") se recortaron en la misma edición, no se dejaron colgadas.

**Conclusión:** `AC-02` se cumple para las 19 filas de la tabla de reemplazo. La única pieza pendiente fuera de esa tabla es la nota de `CARGA_POR_TOQUE_SPEC.md` del hallazgo 12, que es una "Nota" declarada pendiente, no una fila de reemplazo.

## Apéndice 8 — Testeabilidad

- **EARS.** Todos los FR vigentes usan uno de los cinco patrones. Compuesto: `FR-042` (Hallazgo 4). `FR-022`, `FR-047` a `FR-063` figuran retirados con su ID conservado (`MD-05`).
- **NFR cuantificados.** `NFR-001` (17 anchos), `NFR-002` (44×44, 24×24), `NFR-003` (≥2 señales, `aria-live`), `NFR-004` (100/150 ms), `NFR-005` (claves exactas), `NFR-007` ("ninguna escritura") son medibles. `NFR-006` es de revisión contra el design system, como en el resto de las specs de esta familia.
- **Variants.** Los 10 escenarios vigentes (`S-01` a `S-07`, `S-20` a `S-22`) tienen bloque `Variants:`; ninguno usa `Variants: none`. No encontré ningún escenario sin el bloque.
- **Meta-AC.** `AC-50` a `AC-55` presentes en §11.5, con la forma del template. `AC-55` declara `Supply-chain: none` justificado por `AGENTS.md` § Dependencias.
- **TC ↔ AC.** `TC-001` a `TC-043` (los vigentes) tienen su AC en §11.3 (`AC-30` a `AC-42`).
- **Integridad de referencias.** Todo `FR-*`/`S-*`/`D-*` citado fuera del Change log está definido o explícitamente marcado retirado. `OPEN-Q-03`, `-05`, `-09`, `-11` quedan abiertas y listadas en §17; `-02`, `-04`, `-06`, `-07`, `-08`, `-10`, `-12` están resueltas o dejaron de aplicar, con su razón (`AC-03` verificado: `D-18` a `D-31` existen en §10 del Concept Note).
- **Hueco encontrado en esta pasada:** la brecha entre lo que `FR-061` afirma y lo que `S-06c` verifica (Hallazgo 1) es exactamente el tipo de hueco que `AC-50` existe para cerrar — un escenario con test no es lo mismo que un escenario cuyo test prueba la afirmación completa del FR que dice cubrir.

## Apéndice 9 — Inferencias presentadas como hechos, y seguridad

**Inferencias.**

| Afirmación | Dónde | Marcador / verificación | Observación |
|---|---|---|---|
| "el candado fija el equipo y no el puesto" | `FR-061`, `D-13`/`D-31` | Cita a `spec.md:231` e `index.html:3419-3422` | Presentada como hecho verificado; es cierta para "el equipo" (`FR-015`) y falsa en un caso para "el puesto" (Hallazgo 1). No lleva `[INFERRED]` ni `[UNVERIFIED]` pese a que la Spec sí usa esos marcadores en otros lados (`A-01`, `A-02`) |
| "el motor arranca desde el guardado... como hoy" | `FR-061` | Sin marcador, presentada como hecho | Ídem — ver Hallazgo 1 |
| `A-01`, `A-02` | §14 | `[UNVERIFIED — <razón>]` con razón legítima; arrastradas a §17 | ✓ sin cambios respecto de las críticas anteriores |
| `A-03` | §14 | "Verificado en código", con cita | ✓ verifiqué la cita (`balanceLineasVigente`, `valorDePuntaje`, `posicionAsignadaDe`, `faltantesDeFormacionVigente`) y el texto es correcto para lo que afirma (que esas funciones leen el puesto asignado en vivo) |
| "el equipo rota el arco... como el motor ya supone" | §3.2 | Cita a `index.html:1778`, `:3159-3162` | ✓ hecho, ya verificado por la crítica de `claude-fable-5-1` |

**Seguridad (`TC-040` a `TC-043` y rulings) contra `firestore-rules.md`.** Repetí la verificación de las dos críticas anteriores sobre el árbol vigente.

| ID | Qué dice la Spec | Evaluación |
|---|---|---|
| `TC-040` (`CWE-862`) | guarda de rol y ventana dentro del manejador, "del lado del cliente"; la barrera de almacenamiento no distingue rol para `data/partidos` | ✓ exacto contra `firestore-rules.md:81`, `:287-290` (`data/partidos`: `admin` y `jugador` leen y escriben) |
| `TC-041` (`CWE-79`) | escapado en aviso, `title`, `aria-label` | ✓; `S-21`, `S-21a` cubren las superficies vigentes (ya no hay `S-21b`, retirado con el registro del arquero manual) |
| `TC-042` (`CWE-20`) | identificadores del DOM/`dataTransfer` validados contra el reparto | ✓; ya no tiene la ambigüedad "del catálogo" que señalaba la segunda crítica, porque el caso que la motivaba (vuelta al puesto anterior de un arquero manual) desapareció con `D-31` |
| `TC-043` (`CWE-200`) | ningún aviso ni nombre accesible incluye puntajes | ✓; ya no menciona `data/partidosArmado` ni ningún registro nuevo, consistente con `D-31` |
| Ruling `CWE-863`/`CWE-284` | preexistente, no se agrava; `data/partidos` lo escribe `jugador` (precondición ya aceptada) | ✓ exacto contra `firestore-rules.md:81` (`data/partidos` jugador escribe) y `:308-310` (`data/partidosArmado` sólo admin) — y ya no hay ningún dato nuevo de esta feature que vaya a `partidosArmado`, así que el ruling es ahora más simple que en las dos críticas anteriores, no menos cierto |
| Resto (`CWE-639`, `-352`, etc.) | no aplica, con razón | ✓ sin cambios |
| `AC-55` | `Supply-chain: none` (`AGENTS.md` § Dependencias) | ✓ |

No encontré citas inventadas ni `[UNVERIFIED]` con razón ilegítima.

---

## Nota fuera de rúbrica: un borrador de crítica sin commitear en el mismo árbol

Al listar la carpeta de la feature encontré `POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-haiku-5-5.md`, sin trackear por git (`git status` lo muestra como `??`, igual que al principio de esta conversación). Ese archivo se autodescribe como "tercera crítica" y sólo leyó la Spec (no el Concept Note ni las dos críticas previas, a propósito, "para no contaminar la lectura"). No lo usé como insumo de este reporte porque el pedido del propietario nombraba explícitamente sólo las dos críticas de `claude-sonnet-5-5` y `claude-fable-5-1` como "las dos críticas anteriores", y las instrucciones de `AGENTS.md` prohíben sobrescribir un reporte de crítica — así que lo dejé intacto y escribí este reporte con un nombre distinto (`claude-sonnet-5`, sin el ".5": es la versión de este modelo en esta sesión, no la misma que hizo la primera crítica). El propietario puede querer decidir si ese borrador se commitea, se descarta o se usa como una crítica más.
