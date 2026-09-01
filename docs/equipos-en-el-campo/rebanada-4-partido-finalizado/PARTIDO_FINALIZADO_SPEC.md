# El partido finalizado (rebanada 4 de "Equipos en el campo") — Spec

> **Status:** Draft · **Date:** 2026-09-01 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md)
>
> **Specs de las rebanadas anteriores:** [rebanada-1-cancha/CANCHA_SPEC.md](../rebanada-1-cancha/CANCHA_SPEC.md) ·
> [rebanada-2-arrastre/ARRASTRE_SPEC.md](../rebanada-2-arrastre/ARRASTRE_SPEC.md) ·
> [rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md](../rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)
>
> **Implementation plan:** [PARTIDO_FINALIZADO_IMPLEMENTATION_PLAN.md](./PARTIDO_FINALIZADO_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5 *Sources
> & Origins* del Concept Note y en las Specs de las rebanadas 1 a 3, que fijaron
> la cancha, la camiseta, el candado, el arrastre, el selector de equipo y el
> encabezado de la tarjeta sobre los que esta rebanada construye. Donde un
> `FR-*` / `NFR-*` / `TC-*` se apoya en una ubicación del código, en una medida
> del handoff o en una spec vigente que ninguno de esos tres documentos cubre,
> la cita va **en línea** en la sección donde se define el requisito. Las
> líneas de `index.html` citadas acá corresponden al estado del archivo después
> del merge de la rebanada 3 (`cc62e58`).

> **Declaración de reemplazo (Principio I / gobernanza vigente en
> [`openspec/config.yaml`](../../../openspec/config.yaml)).** Esta Spec
> reemplaza, cada uno en su parte, contenido de la Spec de la rebanada 3
> ([`PANEL_ARMADO_SPEC.md`](../rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)),
> y sólo para el estado **partido finalizado, sin edición en curso**:
>
> Para distinguirlos de los `FR-*` de esta Spec, que reinicia su propia
> numeración como cada rebanada anterior, cada ID de abajo lleva la aclaración
> **(rebanada 3)**.
>
> - `FR-060` (rebanada 3) — queda reemplazado en la parte que ubica "Editar
>   resultado" al pie de la tarjeta: ese botón se muda al encabezado, como
>   ícono de lápiz (`FR-006` a `FR-008` de **esta** Spec). "Finalizar
>   partido", "Guardar cambios" y "Cancelar" **no** se tocan y siguen al pie en
>   las mismas condiciones.
> - `FR-003` a `FR-005`, `FR-009` y `FR-037` (rebanada 3; la píldora de
>   diferencia) — quedan reemplazados sólo para este estado: la píldora no se
>   muestra en el partido finalizado sin editar, porque el handoff (5a/6b/8c/8d)
>   no la incluye y su lugar lo ocupa la fila de resultado (`FR-040` a
>   `FR-043` de **esta** Spec), que muestra el marcador real y no una
>   comparación de puntaje de armado. La píldora sigue vigente, sin cambios, en
>   el estado de equipos generados (4a/6a/8a/8b) y durante la edición del
>   resultado, que esta rebanada no toca.
> - `FR-030` a `FR-036` (rebanada 3; diferencia por línea) y `FR-040` a
>   `FR-045` (rebanada 3; el receipt "Por qué quedaron así") — quedan
>   reemplazados de la misma forma y por la misma razón: el handoff no los
>   incluye en las vistas de partido finalizado. El armado ya no puede
>   editarse a mano en este estado (la rebanada 2 lo limita a
>   `inscripcionCerrada === false`), así que ninguno de los dos bloques tiene
>   un rol que cumplir ahí.
> - `FR-083b` (rebanada 3) — queda reemplazado: dejaba fijo que un partido
>   finalizado muestra los mismos bloques que un armado en edición (píldora,
>   diferencia por línea, receipt, botonera). Esta rebanada separa los dos
>   casos: el partido finalizado sin editar muestra la cancha con chips de
>   estadística, la fila de resultado y las filas de detalle; el partido
>   finalizado **en edición** sigue mostrando exactamente lo que
>   `FR-083`/`FR-083b` (rebanada 3) describían, sin cambios (`D-08`: la carga
>   de resultado es la rebanada 6).
>
> `FR-050` a `FR-054` (rebanada 3; retiro de las cajitas), `FR-070` a `FR-074`
> (rebanada 3; recálculo tras un movimiento manual), `FR-080` a `FR-082`
> (rebanada 3; permisos) y todo lo demás de la Spec de la rebanada 3 **no** se
> toca: rige sin cambios para el estado de equipos generados, que esta
> rebanada no vuelve a abrir. Tampoco se reemplaza
> nada de
> [`.specify/specs/003-motor-generacion-equipos/spec.md`](../../../.specify/specs/003-motor-generacion-equipos/spec.md)
> ni de
> [`007-permisos-por-usuario`](../../../.specify/specs/007-permisos-por-usuario/spec.md):
> el motor no se toca (`D-01`) y el modelo de permisos por rol se conserva
> entero, igual que en las tres rebanadas anteriores.
>
> La anotación recíproca en la Spec de la rebanada 3 queda pendiente, igual que
> en las rebanadas 2 y 3; ver `OPEN-Q-01`.

## 1. Purpose

Esta Spec define cómo se lee un **partido finalizado sin edición en curso**:
el encabezado de esa tarjeta, la cancha en modo lectura con los goles, los
goles en contra y las asistencias dibujados sobre las camisetas, el marcador
central y el detalle en texto por equipo. Es la cuarta de las siete rebanadas
de `D-08`.

No cubre *por qué* se hace el rediseño (Concept Note) ni *cómo* se escribe el
código (Implementation Plan). Tampoco cubre la edición del resultado de un
partido finalizado, que sigue exactamente como la dejó la rebanada 3 hasta que
la rebanada 6 la rediseñe con carga por toque, ni el modelo de datos por
eventos, que es la rebanada 5.

## 2. Summary

Hoy, un partido finalizado se lee igual que uno con la inscripción cerrada:
una lista de filas por línea, con el gol y las asistencias de cada jugador
como texto de solo lectura al lado de su nombre. La cancha que las rebanadas 1
a 3 construyeron para el armado no se usa acá — `mostrarCanchaDeEquipos`
la excluye explícitamente
([`index.html:3887-3896`](../../../index.html#L3887-L3896)).

Esta rebanada extiende la cancha al partido finalizado. El título del
encabezado pasa de "Alineaciones" a la fecha del partido, con el lápiz de
"Editar resultado" como único botón de ícono a la derecha; el combo de
estrategia se reemplaza por una línea de texto fija; la píldora de diferencia,
la diferencia por línea y "Por qué quedaron así" desaparecen —dejaron de tener
sentido sin edición posible del armado— y en su lugar aparece un marcador
central con el resultado y, debajo de cada campo, la lista de quién metió qué.
Cada camiseta suma tres chips pegados a su borde inferior: asistencias a la
izquierda, goles y goles en contra a la derecha. La aplicación sigue siendo la
misma organizadora de partidos; lo que cambia es que leer un resultado ya no
obliga a abandonar la cancha que el resto de la pantalla ya usa.

## 3. Scope

### 3.1 In scope

- El encabezado de la tarjeta cuando el partido está finalizado y no se está
  editando su resultado: título con la fecha (y el tamaño de cancha en
  pantallas anchas), botón de ícono para editar el resultado.
- La estrategia mostrada como texto fijo, sin combo, en ese mismo estado.
- Extender `mostrarCanchaDeEquipos` para que también sea cierto en ese estado.
- Los chips de estadística sobre cada camiseta: asistencias, goles y goles en
  contra, con el número siempre visible.
- La fila de resultado: el marcador central entre los dos equipos.
- Las filas de detalle: quién metió qué, por equipo, en texto.
- El retiro de la píldora de diferencia, la diferencia por línea y el receipt
  en ese estado (siguen existiendo, sin cambios, en el estado de equipos
  generados y durante la edición del resultado).
- Los escenarios nuevos de `tests/layout.test.js` que cubren la tarjeta de
  partido finalizado.

### 3.2 Out of scope / non-goals

Los cinco no-objetivos del Concept Note §4 se heredan enteros. Además, y como
límites propios de esta rebanada:

- El sistema **no** modificará la edición del resultado de un partido
  finalizado: mientras `editandoResultadoFinalizado === m.id`, la tarjeta
  sigue mostrando exactamente lo que la rebanada 3 dejó (lista de filas,
  inputs numéricos, píldora, diferencia por línea, receipt, botonera con
  Guardar/Cancelar). Rediseñar esa pantalla es la rebanada 6 (`D-08`).
- El sistema **no** modificará el modelo de datos del resultado
  (`m.resultado.statsPorJugador`, cuatro contadores por jugador): sigue
  siendo la misma forma hasta que la rebanada 5 la reemplace por la lista de
  eventos (`D-04`, `D-06`). Esta rebanada sólo lee ese dato, no lo escribe.
- El sistema **no** modificará la lista de filas que se sigue usando cuando
  la inscripción está cerrada pero el partido todavía no está finalizado, ni
  la que se usa durante la edición (punto anterior).
- El sistema **no** modificará `matchResultSummaryHtml`
  ([`index.html:5082`](../../../index.html#L5082)), el resumen de goleadores
  que se muestra en la tarjeta colapsada de la lista de partidos: es una
  superficie distinta, fuera del handoff de esta feature.
- El sistema **no** agregará el Historial de resultados ni ninguna estadística
  nueva: sigue siendo captura y lectura de datos, sin análisis (Concept Note
  §4).
- El sistema **no** modificará ningún campo persistido en Firestore.

### 3.3 Constraints inherited from the Concept Note

- **D-01** (el motor queda fuera de alcance) — heredada; esta rebanada no lo
  invoca ni depende de él.
- **D-02** (DOM + CSS vanilla dentro de `index.html`) — heredada; `TC-001`.
- **D-03** (el desborde a 360 px se resuelve achicando medidas en la franja
  360–390) — heredada. Esta rebanada le agrega carga a esa franja: la
  camiseta suma chips a izquierda y derecha, y aparece un marcador central de
  números grandes. `NFR-001` mide que la banda siga cumpliendo.
- **D-06** (los partidos ya guardados no se migran; la lista de eventos
  aplica sólo a partidos cargados desde la rebanada 5) — heredada. Esta
  rebanada lee `statsPorJugador` tal cual existe hoy, sin anticipar la forma
  que tendrá después de `D-04`.
- **D-08** (siete rebanadas, en orden) — heredada; fija §3.1 y §3.2.
- **D-11** (dos ramas por rebanada, `docs/` antes que `feature/`) — heredada;
  el Implementation Plan la ejecuta.
- **D-17** (las obligaciones de accesibilidad se enuncian en términos
  comprobables, sin citar cláusulas normativas) — heredada.
- **D-21** (en una sola columna se ve un equipo por vez, con el selector
  segmentado) — heredada; la vista compacta del partido finalizado (6b, 8d) la
  usa sin drop (`FR-024`).
- **D-24** (los botones de ícono conviven en el encabezado con acciones que
  antes vivían al pie) — heredada como principio, con el alcance que esta
  Spec le agrega: `D-24` fijó que sólo Copiar y Regenerar suben al encabezado
  del estado de equipos generados; el encabezado del partido finalizado es
  una vista distinta (el handoff lo dibuja aparte, 5a/6b/8c/8d) y esta Spec
  decide, para esa vista puntual, que Editar resultado ocupa el mismo lugar
  con el mismo criterio: es la acción que se usa a diario, comparado con
  Finalizar/Guardar/Cancelar, que son puntuales. Ver `FR-006` y la
  declaración de reemplazo de `FR-060` arriba.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — La tarjeta de partido finalizado se implementará como DOM + CSS
  dentro de `index.html`, con las mismas plantillas de cadena que el resto del
  archivo. No se incorporará `support.js` ni ningún componente del bundle del
  design system (`D-02`).
- **TC-002** — No se agregará ninguna dependencia nueva: ni paquete, ni CDN, ni
  archivo cargado en tiempo de ejecución. El repositorio sigue sin lockfile
  (`AGENTS.md`, § Dependencias).

### 4.2 Architectural / integration constraints

- **TC-010** — Los chips de estadística, la fila de resultado y las filas de
  detalle se derivarán exclusivamente de `m.resultado.statsPorJugador`, con
  `totalGolesEquipo` ([`index.html:3777`](../../../index.html#L3777)) para los
  totales por equipo. No se agregará ninguna función que recalcule goles,
  asistencias o goles en contra por una vía distinta: hoy sólo existe una
  fuente de verdad para ese dato y esta rebanada no crea una segunda.
- **TC-011** — Esta rebanada no escribirá ningún campo del partido ni
  disparará ningún guardado por el solo hecho de mostrar la tarjeta. La única
  escritura que toca es la ya existente al guardar una edición de resultado
  (`__guardarEdicionResultado`), que esta Spec no modifica.
- **TC-012** — El ícono de lápiz reutilizará el manejador existente
  `window.__editarResultadoFinalizado`
  ([`index.html:3730-3742`](../../../index.html#L3730-L3742)) tal cual está,
  incluida su guarda de rol. Sólo cambia el elemento que lo dispara —de botón
  de texto al pie a botón de ícono en el encabezado— nunca la función.
- **TC-013** — Los tres íconos de los chips reutilizarán las constantes
  existentes `GOAL_ICON`, `RED_GOAL_ICON` y `BOOT_ICON`
  ([`index.html:1356-1361`](../../../index.html#L1356-L1361)). No se agregará
  ningún ícono nuevo: el handoff usa los mismos tres PNG que ya están en
  `assets/`.
- **TC-014** — El título y la etiqueta de tamaño de cancha reutilizarán
  `formatFecha` ([`index.html:1404-1408`](../../../index.html#L1404-L1408)) y
  `canchaLabel` ([`index.html:1218-1220`](../../../index.html#L1218-L1220))
  tal cual existen. No se escribirá una segunda función de formato de fecha ni
  una segunda tabla de etiquetas de cancha.

### 4.3 Compliance / regulatory constraints

- **TC-020** — No aplica ninguna obligación regulatoria de datos: la rebanada
  no introduce ningún dato nuevo, no cambia dónde se guarda ninguno y no
  agrega ningún destinatario. Concept Note §5.2.

### 4.4 Conventions to follow

- **TC-030** — Todo color, radio, sombra, espaciado y tipografía de esta
  rebanada saldrá del design system
  ([`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/)),
  en el orden que fija el principio de design system vigente en
  [`openspec/config.yaml`](../../../openspec/config.yaml).
- **TC-031** — Las excepciones a `TC-030` —los valores que el handoff fija y
  el design system no nombra, como el fondo `#E8EBE6` de los chips— se
  listarán explícitamente en el Implementation Plan, con el valor y la razón.
- **TC-032** — El comportamiento observable de esta rebanada se agregará como
  escenarios de `tests/layout.test.js` y de una suite de unidad, con el
  identificador de esta Spec en forma canónica dentro de un literal de
  cadena, según la convención de `AGENTS.md` § Tests.
- **TC-033** — La geometría, los colores y los tamaños del encabezado, de los
  chips, de la fila de resultado y de las filas de detalle se tomarán del
  handoff ([`handoff/README.md`](../handoff/README.md), secciones *5a — Partido
  finalizado*, *6b — Partido finalizado*, *8c / 8d — Fútbol 9, partido
  finalizado*, *Chips de estadística*, *Fila de resultado* y *Filas de
  detalle*), y no de una interpretación propia.
- **TC-034** — Ninguna afirmación del handoff se copiará sin contrastarla
  contra el código. Dos discrepancias encontradas al redactar esta Spec:
  - El handoff muestra la fecha con mayúscula inicial ("Sábado, 5 de
    Septiembre"); `formatFecha` produce minúsculas
    (`d.toLocaleDateString('es-AR', …)` sin transformar el resultado,
    [`index.html:1404-1408`](../../../index.html#L1404-L1408)), y así se ve
    hoy en toda la aplicación. Esta rebanada **conserva el formato actual del
    código**, igual que `D-05` hizo con el texto del aviso de desactualizado:
    la Spec no adopta una mayúscula que ninguna otra pantalla tiene.
  - El handoff da a la caption compacta de fútbol 9 (8d) un formato más corto
    —"Fútbol 9 · 3-4-1 · {estrategia}"— que a la de fútbol 8 (6b) —"Fútbol 8 ·
    Estrategia: {estrategia}"—, sin una razón declarada. `FR-005c` resuelve la
    inconsistencia a favor de la forma más explícita en los dos tamaños de
    cancha; ver `OPEN-Q-02`.
  - Las discrepancias encontradas quedan anotadas en el Implementation Plan
    (mismo criterio que `TC-034` de la rebanada 3).
- **TC-035** — La "Formación 3-4-1" que el handoff agrega a la caption de
  fútbol 9 (8c/8d) se derivará de `CANCHAS[m.cancha].formacion`
  ([`index.html:1045-1046`](../../../index.html#L1045-L1046)) como
  `"{defensores}-{volantes}-{delanteros}"`, nunca como una cadena literal: en
  cuanto la formación de fútbol 9 cambie de valor, la etiqueta tiene que
  seguirla sin tocar esta rebanada.

### 4.5 Security constraints (`MD-31`)

El Concept Note §5.2 declara la postura: ninguna entrada no confiable,
escritura sólo de administradores autenticados, SPA estática sin servidor
propio. Sobre esa base, las categorías aplicables del CWE Top 25 se acotan a
control de acceso y a la neutralización del texto que escriben los jugadores.

`[UNVERIFIED — offline; no se consultó https://cwe.mitre.org/top25/ en esta
sesión, igual que en la rebanada 3. Las categorías se nombran por su
identificador y su título, que son estables, pero el ranking vigente a la
fecha no se verificó.]`

- **TC-040** — El botón de editar resultado sólo se ejecutará cuando el rol de
  la sesión sea `admin`. La comprobación ya existe dentro de
  `__editarResultadoFinalizado` (`TC-012`) y esta rebanada no la debilita: no
  agrega ningún camino que dispare la edición sin pasar por esa función.
  **Defiende `CWE-862` *Missing Authorization*** y **`CWE-863` *Incorrect
  Authorization***.
- **TC-041** — Todo texto proveniente de un jugador que esta rebanada
  introduzca en el DOM —el nombre en cada fila de detalle, y el `title` de
  cada camiseta y de cada chip— se insertará escapado, con la misma función
  `escaparHtml` que ya usan las rebanadas 1 a 3. **Defiende `CWE-79`
  *Cross-Site Scripting***.
- **CWE-89 *SQL Injection***, **CWE-78 *OS Command Injection***, **CWE-22
  *Path Traversal***, **CWE-502 *Deserialization***, **CWE-918 *SSRF*** — no
  aplican; la §5.2 del Concept Note descarta servidor propio, parsing de
  entrada externa y acceso a filesystem.
- **CWE-352 *CSRF*** — no aplica: no hay endpoints propios; la escritura va
  por el SDK de Firestore con el token de la sesión.
- **CWE-20 *Improper Input Validation*** — no aplica: esta rebanada no agrega
  ninguna superficie de entrada nueva. El único control interactivo es el
  lápiz de editar, que no recibe ningún valor — sólo dispara una función ya
  validada por `TC-040`.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador | Miembro del grupo con rol `admin`. Revisa el resultado desde el celular, a veces días después del partido. | Ver de un vistazo quién metió qué, sobre la misma cancha que ya usa para armar, y tener a mano la acción de corregir si algo se cargó mal. |
| Jugador | Miembro del grupo con rol `jugador`. Sólo consulta. | Ver cómo quedó el partido y quién hizo qué, sin controles que no le corresponden. |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador o jugador, quiero ver el resultado de un partido finalizado sobre la misma cancha que veo cuando arman los equipos, para no tener que leer un formato distinto. | FR-020, FR-021 |
| US-02 | Como administrador o jugador, quiero ver de un vistazo quién metió los goles, los goles en contra y las asistencias, sin abrir nada. | FR-030 a FR-036 |
| US-03 | Como administrador o jugador, quiero ver el marcador del partido de forma prominente. | FR-040, FR-041 |
| US-04 | Como administrador o jugador, quiero un detalle en texto de quién metió qué en cada equipo, para los casos en que un chip solo (un número) no alcanza a contar la historia (penales, en contra). | FR-050 a FR-055 |
| US-05 | Como administrador, quiero corregir el resultado desde el mismo lugar donde lo leo, sin buscar el botón al pie de la tarjeta. | FR-006 a FR-008 |

## 6. Glossary

Los términos que las rebanadas 1 a 3 ya definieron —cancha, camiseta, unidad de
armado, dupla de rotación, línea, posición asignada, selector de equipo, una
columna, dos columnas, tarjeta de equipos, encabezado de la tarjeta— se usan
acá con el mismo significado y no se redefinen. Los propios de esta rebanada:

| Term | Definition |
|---|---|
| Partido finalizado sin edición | El estado `m.estado === 'Finalizado' && editandoResultadoFinalizado !== m.id`. Es el único estado que esta Spec cubre; el mismo partido con `editandoResultadoFinalizado === m.id` sigue el comportamiento de la rebanada 3. |
| Chip de estadística | La pastilla pegada al borde inferior de una camiseta que muestra un número y un ícono (gol, gol en contra o asistencia). Un jugador puede tener hasta tres: asistencias a la izquierda, goles y goles en contra a la derecha. |
| Fila de resultado | La fila entre el encabezado y las canchas: el resultado del partido (goles, separados por un guion) en el centro, con el nombre de cada equipo a los costados y, sólo en dos columnas, su puntaje de armado. |
| Filas de detalle | La lista en texto, una línea por jugador y por tipo de evento, que dice quién metió qué en cada equipo: "Lucas 2 ⚽ (1 de penal)", "Alfredo 1 🔴 (EC)". Reemplaza en esta vista al bloque de goleadores que hoy sólo existe en `matchResultSummaryHtml` de la tarjeta colapsada. |
| Goleador | Un jugador con al menos un gol propio o un gol en contra en el resultado del partido. Es el mismo criterio de filtro que ya usa `matchResultSummaryHtml` ([`index.html:5093`](../../../index.html#L5093)). |

## 7. Functional requirements

> Se usa la sintaxis EARS: *ubicuo* ("El sistema…"), *por evento* ("Cuando…"),
> *por estado* ("Mientras…"), *opcional* ("Donde…") y *no deseado* ("Si…,
> entonces…"). Una obligación por línea.

### 7.1 El encabezado del partido finalizado

- **FR-001** — Mientras el partido esté finalizado y no se esté editando su
  resultado, el sistema reemplazará el título "Alineaciones" del encabezado de
  la tarjeta por la fecha del partido, con el formato que produce
  `formatFecha` (`TC-014`, `TC-034`).
- **FR-002** — Mientras la tarjeta esté en dos columnas, el sistema agregará
  al título el tamaño de cancha, con un guion: "{fecha} - {etiqueta de
  cancha}".
- **FR-003** — Mientras la tarjeta esté en dos columnas, el sistema mostrará
  debajo del título una línea de texto fija con la etiqueta "Estrategia:"
  seguida del campo `resumen` de la estrategia aplicada (`ESTRATEGIAS[m.equipos.estrategiaKey].resumen`).
- **FR-004** — Mientras la tarjeta esté en una sola columna, el sistema
  mostrará en el título sólo la fecha del partido, sin el tamaño de cancha.
- **FR-005** — Mientras la tarjeta esté en una sola columna, el sistema
  mostrará debajo del título una línea de texto fija con la etiqueta de
  cancha, la palabra "Estrategia:" y el `resumen` de la estrategia aplicada,
  separados por " · " (resuelve la inconsistencia de `TC-034`; ver
  `OPEN-Q-02`).
- **FR-005b** — Donde el tamaño de cancha sea Fútbol 9 y la tarjeta esté en
  dos columnas, el sistema mostrará la línea de `FR-003` como "Formación
  {formación} · Estrategia: {resumen}", sin la etiqueta de cancha (que ya está
  en el título por `FR-002`).
- **FR-005c** — Donde el tamaño de cancha sea Fútbol 9 y la tarjeta esté en
  una sola columna, el sistema mostrará la línea de `FR-005` como
  "{etiqueta de cancha} · Formación {formación} · Estrategia: {resumen}",
  agregando la formación entre la cancha y la estrategia sin quitar ninguna de
  las dos.
- **FR-006** — El sistema mostrará en el encabezado un botón de sólo ícono
  para editar el resultado, con el rol `admin`.
- **FR-007** — El sistema dará al botón de editar resultado un nombre
  accesible que describa la acción, y el mismo texto como descripción
  emergente.
- **FR-008** — Cuando el administrador active el botón de editar resultado,
  el sistema ejecutará exactamente lo que `__editarResultadoFinalizado` ya
  hace hoy (`TC-012`).
- **FR-009** — El sistema mostrará en el encabezado, junto al botón de editar
  resultado, el mismo botón de ícono para copiar la formación que ya existe
  desde la rebanada 3 (`FR-001` de esa Spec), sin cambiar qué copia ni cómo
  confirma.
- **FR-009b** — El sistema no mostrará el botón de regenerar equipos en este
  encabezado: un partido finalizado no admite regenerar (heredado, sin
  cambios).

### 7.2 La cancha del partido finalizado

- **FR-020** — El sistema extenderá `mostrarCanchaDeEquipos` para que también
  sea verdadero mientras el partido esté finalizado y no se esté editando su
  resultado.
- **FR-021** — Mientras se muestre la cancha de un partido finalizado, el
  sistema no dibujará candados ni hará arrastrable ninguna camiseta.
- **FR-022** — El sistema no mostrará el aviso de equipos desactualizados en
  este estado, como ya sucede hoy (heredado de rebanada 3, sin cambios).
- **FR-023** — Mientras la tarjeta esté en una sola columna, el sistema
  mostrará el selector segmentado de equipo entre la línea de estrategia y el
  campo, sin recibir drop (`D-21`).

### 7.3 Los chips de estadística

- **FR-030** — Mientras la camiseta pertenezca a un jugador con al menos un
  gol, el sistema mostrará un chip a la derecha de la camiseta con el número
  de goles y `GOAL_ICON`.
- **FR-031** — Mientras el jugador tenga al menos un gol de penal, el sistema
  no distinguirá visualmente los goles de penal en el chip: el chip de goles
  suma penales y de juego en un solo número (el desglose "de penal" vive sólo
  en la fila de detalle, `FR-052`).
- **FR-032** — Mientras la camiseta pertenezca a un jugador con al menos un
  gol en contra, el sistema mostrará un segundo chip a la derecha, después
  del de goles, con el número de goles en contra y `RED_GOAL_ICON`.
- **FR-033** — Mientras la camiseta pertenezca a un jugador con al menos una
  asistencia, el sistema mostrará un chip a la izquierda de la camiseta con
  el número de asistencias y `BOOT_ICON`.
- **FR-034** — Mientras un jugador no tenga ningún gol, ningún gol en contra o
  ninguna asistencia, el sistema no mostrará el chip correspondiente para ese
  jugador.
- **FR-035** — El sistema mostrará siempre el número dentro del chip, también
  cuando sea 1.
- **FR-036** — Mientras la unidad de armado sea una dupla de rotación, el
  sistema sumará los goles, los goles en contra y las asistencias de los dos
  integrantes y mostrará un único juego de chips sobre la camiseta
  compartida, con el mismo criterio que ya usa el puntaje de la dupla
  (`valorDePuntaje`, [`index.html:3869`](../../../index.html#L3869)): la
  dupla se dibuja como una sola camiseta desde la rebanada 1, y no hay una
  segunda forma dónde anclar un segundo juego de chips.

### 7.4 La fila de resultado

- **FR-040** — El sistema mostrará, entre el encabezado y las canchas, una
  fila con el resultado del partido en el centro, calculado con
  `totalGolesEquipo` (`TC-010`), separado por un guion.
- **FR-041** — Mientras la tarjeta esté en dos columnas, el sistema mostrará a
  cada costado del resultado el nombre del equipo y su puntaje de armado
  (`m.equipos.sumaBlanco` / `sumaNegro`), en ese orden.
- **FR-042** — Mientras la tarjeta esté en una sola columna, el sistema
  mostrará a cada costado del resultado sólo el nombre del equipo, sin su
  puntaje de armado.
- **FR-042b** — El sistema no repetirá en el encabezado de cada panel de
  equipo (`renderZonaEquipos`) el puntaje ni el resultado que la fila de
  resultado ya declara: en este estado, ese encabezado mostrará únicamente el
  nombre del equipo. Evita mostrar la misma cifra dos veces en la misma
  pantalla, algo que el handoff no puede mostrar porque sus dos bloques —fila
  de resultado y encabezado de panel— no aparecen juntos en ninguna vista de
  su prototipo.
- **FR-043** — El sistema no mostrará ninguna otra comparación de puntaje
  (píldora de diferencia, diferencia por línea) en este estado (declaración de
  reemplazo, arriba).

### 7.5 Las filas de detalle

- **FR-050** — Mientras un equipo tenga al menos un goleador, el sistema
  mostrará debajo de su campo una fila de detalle por cada goleador, con su
  nombre.
- **FR-051** — Mientras un goleador tenga al menos un gol propio, el sistema
  mostrará en su fila el número de goles propios (incluidos los de penal) y
  `GOAL_ICON`.
- **FR-052** — Mientras un goleador tenga al menos un gol de penal, el
  sistema agregará a esa misma línea la nota "(N de penal)".
- **FR-053** — Mientras un goleador tenga al menos un gol en contra, el
  sistema mostrará una línea separada con el número de goles en contra,
  `RED_GOAL_ICON` y la nota "(EC)".
- **FR-054** — Mientras un jugador tenga goles en contra y ningún gol propio,
  el sistema antepondrá su nombre a la línea de `FR-053` (mismo criterio que
  `matchResultSummaryHtml`, `TC-010`).
- **FR-055** — Mientras un equipo no tenga ningún goleador, el sistema
  mostrará en su lugar el texto "Sin goleadores".
- **FR-056** — El sistema ordenará los goleadores de cada equipo de mayor a
  menor cantidad de goles propios, igual que `matchResultSummaryHtml`.
- **FR-057** — El sistema insertará escapado todo nombre de jugador que
  aparezca en una fila de detalle (`TC-041`).

### 7.6 Estados y roles

- **FR-060** — Donde el rol de la sesión sea `jugador`, el sistema mostrará
  los chips de estadística, la fila de resultado y las filas de detalle sin
  restricciones. La lista de restricciones del rol `jugador`
  ([`007-permisos-por-usuario/spec.md`](../../../.specify/specs/007-permisos-por-usuario/spec.md),
  `FR-004` a `FR-007`) es taxativa y no incluye goles ni asistencias; su
  `FR-013` además lo declara en positivo: "jugador" MUST poder ver, para
  cualquier jugador, sus estadísticas de goles y asistencias.
- **FR-061** — Donde el rol de la sesión sea `jugador`, el sistema no
  mostrará el botón de editar resultado.
- **FR-062** — Si el rol de la sesión no es `admin`, entonces el sistema no
  ejecutará la edición del resultado, aunque se la invoque directamente
  (heredado de `TC-040`, sin cambios de código: la guarda ya existe en
  `__editarResultadoFinalizado`).
- **FR-063** — Mientras se esté editando el resultado de un partido
  finalizado (`editandoResultadoFinalizado === m.id`), el sistema mostrará la
  tarjeta exactamente como la rebanada 3 la dejó: lista de filas, sin cancha,
  sin chips, sin fila de resultado ni filas de detalle (heredado de
  `FR-083`/`FR-083b`, con el alcance recortado por la declaración de
  reemplazo de arriba).
- **FR-064** — Mientras la inscripción esté cerrada y el partido **no** esté
  finalizado, el sistema mostrará la tarjeta exactamente como la rebanada 3 la
  dejó (sin cambios: esa combinación de estados queda fuera de esta
  rebanada).

## 8. Non-functional requirements

> **Objetivo cuantificado.** A los efectos de `AC-51`, los NFR con objetivo
> cuantificado de esta Spec son exactamente `NFR-001` y `NFR-002`. El resto
> son obligaciones binarias verificables por revisión o por aserción de
> presencia.

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive / layout | En cada uno de los anchos que mide `tests/layout.test.js` (360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200 px), la tarjeta de partido finalizado cumple las dos condiciones del Principio V: `scrollWidth === clientWidth` y ningún elemento con su borde derecho fuera del viewport. Cubre en particular el caso que el handoff marca como límite: un jugador con gol, gol en contra y asistencia a la vez, cuyos dos grupos de chips pueden llegar a tocarse (§8c/8d del handoff). |
| NFR-002 | Usabilidad | El área interactiva del botón de editar resultado no es menor a 44×44 px en todos los anchos medidos. |
| NFR-003 | Accesibilidad | El botón de editar resultado tiene un nombre accesible no vacío, y ningún chip de estadística transmite su información sólo por color: el número y el ícono ya lo hacen (`FR-035`). |
| NFR-004 | Compatibilidad de datos | El conjunto de campos escritos en el documento de partido por el solo hecho de mostrar esta tarjeta es **vacío**: ningún camino de esta rebanada escribe (`TC-011`). |
| NFR-005 | Mantenibilidad | Todo valor de color, espaciado, radio, sombra y tipografía de esta rebanada proviene de un token del design system o de una excepción listada en el Implementation Plan (`TC-030`, `TC-031`). |

## 9. System behaviour & scenarios

> **Nota sobre el alcance de los tests.** Igual que en la rebanada 3, los
> escenarios están escritos sobre lo verificable mecánicamente: qué bloques
> existen en el DOM, qué texto y qué números llevan, y qué cambia según el
> estado del partido. La apariencia se valida mirándola en la aplicación real.

### 9.1 Happy path scenarios

#### Scenario S-01 — El encabezado del partido finalizado (covers FR-001, FR-002, FR-003, FR-006, FR-007, FR-009, FR-009b)

- **Given** un partido de fútbol 8 finalizado, con resultado cargado y sin
  edición en curso
- **And** una sesión con rol `admin` en un viewport de 1200 px
- **When** se abre el detalle del partido
- **Then** el título del encabezado es la fecha del partido seguida de
  " - Fútbol 8"
- **And** debajo del título se muestra "Estrategia: {resumen de la estrategia
  aplicada}"
- **And** el encabezado contiene dos botones de ícono, copiar y editar
  resultado, en ese orden, cada uno con un nombre accesible no vacío
- **And** el encabezado no contiene el botón de regenerar

**Variants:**

- `S-01a [boundary]` — en un viewport de 360 px, el título muestra sólo la
  fecha y la línea de abajo dice "Fútbol 8 · Estrategia: {resumen}" (`FR-004`,
  `FR-005`)
- `S-01b [boundary]` — el partido es de fútbol 9: la línea de estrategia
  agrega "Formación 3-4-1 · " antes de "Estrategia:" (`FR-005b`)
- `S-01c [failure]` — la sesión es de rol `jugador`: el botón de editar
  resultado no está en el DOM (`FR-061`)
- `S-01d [failure]` — se está editando el resultado de este partido: el
  encabezado es el de la rebanada 3 ("Alineaciones", sin lápiz), no el de esta
  rebanada (`FR-063`)

#### Scenario S-02 — La cancha reemplaza a la lista de filas (covers FR-020, FR-021, FR-023)

- **Given** un partido finalizado, sin edición en curso, con equipos generados
- **When** se muestra la tarjeta
- **Then** cada equipo se dibuja como cancha, no como lista de filas
- **And** ninguna camiseta tiene candado ni es arrastrable

**Variants:**

- `S-02a [boundary]` — en un viewport de 360 px, se ve un equipo a la vez con
  el selector segmentado, y el selector no recibe drop (`FR-023`)
- `S-02b [failure]` — el mismo partido con `editandoResultadoFinalizado`
  activo: la cancha no se dibuja, se dibuja la lista de filas (`FR-063`)
- `S-02c [failure]` — un partido con la inscripción cerrada pero no
  finalizado: sin cambios respecto de la rebanada 3, se dibuja la lista de
  filas (`FR-064`)

#### Scenario S-03 — Los chips muestran lo que cada jugador metió (covers FR-030 a FR-036)

- **Given** un partido finalizado donde un jugador tiene 2 goles (1 de penal),
  otro tiene 1 asistencia, otro tiene 1 gol en contra, y un cuarto no metió
  nada
- **When** se muestra la cancha
- **Then** la camiseta del primero lleva un chip a la derecha con "2" y
  `GOAL_ICON`
- **And** la camiseta del segundo lleva un chip a la izquierda con "1" y
  `BOOT_ICON`
- **And** la camiseta del tercero lleva un chip a la derecha con "1" y
  `RED_GOAL_ICON`
- **And** la camiseta del cuarto no lleva ningún chip

**Variants:**

- `S-03a [boundary]` — un jugador con exactamente 1 gol: el chip muestra "1",
  no lo omite (`FR-035`)
- `S-03b [boundary]` — un jugador con gol, gol en contra y asistencia a la
  vez: lleva los tres chips, uno a la izquierda y dos a la derecha (`FR-030`,
  `FR-032`, `FR-033`)
- `S-03c [boundary]` — la unidad es una dupla de rotación y sólo uno de los
  dos integrantes metió un gol: el chip de goles muestra "1" sobre la
  camiseta compartida, igual que si lo hubiera metido cualquiera de los dos
  (`FR-036`)
- `S-03d [property]` — para toda unidad de armado (jugador suelto o dupla), la
  suma de los números mostrados en sus chips coincide exactamente con la suma,
  sobre cada integrante de la unidad, de
  `stats[jugador].goles + stats[jugador].golesEnContra + stats[jugador].asistencias`

#### Scenario S-04 — La fila de resultado muestra el marcador (covers FR-040, FR-041, FR-042, FR-042b)

- **Given** un partido finalizado con 4 goles del Blanco (52.5 pts de armado) y
  3 del Negro (51.5 pts)
- **When** se muestra la tarjeta en un viewport de 1200 px
- **Then** la fila de resultado muestra "Blanco" y "52.5 pts" a la izquierda,
  "4 - 3" al centro, "51.5 pts" y "Negro" a la derecha
- **And** el encabezado del panel de cada equipo muestra sólo su nombre, sin
  puntaje ni resultado (`FR-042b`)

**Variants:**

- `S-04a [boundary]` — el resultado es 0 a 0: la fila muestra "0 - 0", no la
  omite
- `S-04b [boundary]` — en un viewport de 360 px, la fila muestra sólo "Blanco"
  y "Negro" a los costados, sin el puntaje de armado, con el mismo marcador
  central (`FR-042`)

#### Scenario S-05 — Las filas de detalle cuentan quién metió qué (covers FR-050 a FR-057)

- **Given** un equipo con un jugador de 2 goles (1 de penal) y 1 asistencia, y
  otro jugador con 1 gol en contra y ningún gol propio
- **When** se muestra la tarjeta
- **Then** debajo del campo de ese equipo hay una fila con el nombre del
  primer jugador, "2", `GOAL_ICON` y "(1 de penal)"
- **And** hay una fila separada con el nombre del segundo jugador, "1",
  `RED_GOAL_ICON` y "(EC)"
- **And** el primer jugador aparece antes que el segundo (más goles propios)

**Variants:**

- `S-05a [boundary]` — un equipo sin ningún goleador: se muestra "Sin
  goleadores" (`FR-055`)
- `S-05b [boundary]` — un jugador con gol en contra y también con gol propio:
  su nombre aparece una sola vez, en la línea de goles propios, y no se
  repite en la de en contra (`FR-054`)
- `S-05c [failure]` — un nombre de jugador con caracteres de marcado: se
  muestra como texto literal, sin ejecutar ningún script (`FR-057`, `TC-041`)

### 9.2 Edge cases

#### Scenario S-10 — Un partido de fútbol 9 finalizado (covers FR-005b, FR-005c, TC-035)

- **Given** un partido de fútbol 9 finalizado, con formación 3-4-1
- **When** se muestra el encabezado en dos columnas
- **Then** la línea de estrategia dice "Formación 3-4-1 · Estrategia:
  {resumen}", sin la etiqueta de cancha

**Variants:**

- `S-10a [boundary]` — en una sola columna (360 px): la línea dice "Fútbol 9 ·
  Formación 3-4-1 · Estrategia: {resumen}", con las tres partes (`FR-005c`)

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Una sesión sin permiso invoca la edición (covers FR-062, TC-040)

- **Given** una sesión con rol `jugador` sobre un partido finalizado
- **When** se invoca directamente `window.__editarResultadoFinalizado`
- **Then** el sistema no modifica el partido
- **And** el documento de partido no registra ninguna escritura

Variants: none — single-path scenario (la guarda es la misma función que ya
existe; no hay una segunda forma de disparar la edición que probar).

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

Esta rebanada **no introduce ninguna entidad de dominio nueva** y no agrega
atributos a las existentes: lee `m.resultado.statsPorJugador`, que ya existe
desde antes de esta feature. Por lo tanto no se incluye diagrama
entidad-relación (`MD-24`, obligación que se dispara con al menos una entidad
nueva).

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore | Documento de partido, con `equipos`, `estrategia`, `cancha`, `resultado.statsPorJugador` | inbound | Sin cambio de forma. |
| Firebase Auth | Rol de la sesión (`admin` / `jugador`) | inbound | Sin cambio. |

### 10.3 External APIs / events the feature exposes

| Endpoint / event | Inputs | Outputs | Notes |
|---|---|---|---|
| — | — | — | La rebanada no expone ninguna interfaz nueva y no agrega ningún camino de escritura (`NFR-004`). |

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9.1 pasan contra la aplicación real
  (cubre `FR-001` a `FR-057`).
- **AC-02** — Para un partido finalizado sin edición en curso, el DOM de la
  tarjeta no contiene el combo `<select>` de estrategia, la píldora de
  diferencia, el bloque de diferencia por línea ni el receipt (cubre `FR-003`,
  `FR-043`, declaración de reemplazo).
- **AC-03** — Para el mismo partido con `editandoResultadoFinalizado` activo,
  el DOM de la tarjeta es idéntico al que producía la rebanada 3 antes de esta
  Spec (cubre `FR-063`).
- **AC-04** — Con un jugador de 2 goles, 1 de penal, y 1 asistencia, el chip
  de goles muestra "2" (sin desglosar penal) y el chip de asistencias muestra
  "1"; la fila de detalle sí desglosa "(1 de penal)" (cubre `FR-030`,
  `FR-031`, `FR-033`, `FR-052`).
- **AC-05** — Con un resultado 4-3, la fila de resultado muestra "4 - 3" al
  centro y el nombre de cada equipo a los costados, y en 1200 px además el
  puntaje de armado de cada uno; el encabezado de cada panel de equipo no
  repite ninguno de los dos números (cubre `FR-040`, `FR-041`, `FR-042b`).
- **AC-06** — Con una sesión de rol `jugador`, la tarjeta contiene la cancha
  con chips, la fila de resultado y las filas de detalle, y no contiene el
  botón de editar resultado (cubre `FR-060`, `FR-061`).
- **AC-07** — Con un partido finalizado de fútbol 9, la línea de estrategia
  dice "Formación 3-4-1 · Estrategia: {resumen}" en dos columnas y "Fútbol 9 ·
  Formación 3-4-1 · Estrategia: {resumen}" en una sola columna (cubre
  `FR-005b`, `FR-005c`, escenario `S-10`).

### 11.2 Non-functional acceptance

- **AC-10** — `node tests/layout.test.js` pasa con los escenarios nuevos de
  esta rebanada en los trece anchos que ya mide, incluido el caso de un
  jugador con los tres chips a la vez (cubre `NFR-001`).
- **AC-11** — El rectángulo del botón de editar resultado mide al menos
  44 px de lado en los trece anchos medidos (cubre `NFR-002`).
- **AC-12** — El botón de editar resultado expone un nombre accesible no
  vacío, y ningún chip depende sólo del color (cubre `NFR-003`).
- **AC-13** — El conjunto de claves registradas en `window.__escrituras` tras
  mostrar la tarjeta de un partido finalizado sin editar es vacío (cubre
  `NFR-004`).
- **AC-14** — El Implementation Plan lista cada valor visual de esta rebanada
  con su token del design system, y cada excepción con su valor y su razón
  (cubre `NFR-005`).

### 11.3 Constraint compliance

- **AC-20** — Revisión de código: el `index.html` no incorpora `support.js`
  ni ningún componente del bundle del design system (`TC-001`).
- **AC-21** — Revisión de código: la rebanada no agrega ninguna dependencia
  ni ningún archivo cargado en tiempo de ejecución (`TC-002`).
- **AC-22** — Revisión de código: los chips, la fila de resultado y las filas
  de detalle se calculan a partir de `statsPorJugador` y `totalGolesEquipo`,
  sin ninguna función paralela de cálculo (`TC-010`).
- **AC-23** — El diff de campos escritos tras mostrar la tarjeta no contiene
  ninguna clave (`TC-011`).
- **AC-24** — Revisión de código: el botón de editar resultado invoca
  `window.__editarResultadoFinalizado` sin envolverla ni duplicar su lógica
  (`TC-012`).
- **AC-25** — Revisión de código: los chips usan `GOAL_ICON`, `RED_GOAL_ICON`
  y `BOOT_ICON` existentes; no se agrega ningún asset (`TC-013`).
- **AC-26** — Revisión de código: el título y la etiqueta de cancha usan
  `formatFecha` y `canchaLabel` sin reimplementarlas (`TC-014`).
- **AC-27** — Revisión de código contra el design system: todo color,
  espaciado, radio, sombra y tipografía de esta rebanada sale de un token o
  de una excepción declarada (`TC-030`, `TC-031`).
- **AC-28** — Al menos un escenario nuevo de `tests/layout.test.js` se vio
  fallar antes de implementarse (`TC-032`).
- **AC-29** — Revisión de código contra `handoff/README.md`: la geometría del
  encabezado, los chips, la fila de resultado y las filas de detalle
  corresponde a la que el handoff fija (`TC-033`).
- **AC-30** — Revisión de código: las dos discrepancias de `TC-034` se
  resolvieron como esta Spec indica (formato de fecha del código, texto de la
  caption compacta), y no como el handoff las dibuja literalmente (`TC-034`).
- **AC-31** — Revisión de código: la etiqueta "Formación 3-4-1" se deriva de
  `CANCHAS[m.cancha].formacion` y no está codificada como texto literal
  (`TC-035`).
- **AC-32** — Revisión de código: la guarda de rol de
  `__editarResultadoFinalizado` sigue intacta y es la única forma de disparar
  la edición (`TC-040`).
- **AC-33** — Revisión de código: todo nombre de jugador que esta rebanada
  inserta en el DOM pasa por `escaparHtml` (`TC-041`).
- **AC-33b** — Revisión de código: la rebanada no introduce ningún dato
  nuevo, no cambia dónde se guarda ninguno y no agrega ningún destinatario
  (`TC-020`).

### 11.4 Negative / safety acceptance

- **AC-40** — El escenario `S-20` no produce ninguna escritura: el documento
  de partido queda idéntico.
- **AC-41** — El escenario `S-05c` no produce ejecución de script y el nombre
  se muestra como texto literal.

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 —incluida cada variante `S-NNa`, `S-NNb`,
  …— tiene al menos un test ejecutable referenciado en la §12.1 *Scenario
  Traceability Matrix* del Implementation Plan, con el identificador embebido
  en una posición estructural, con el prefijo de rebanada que el arnés ya usa
  (`finalizado/S-03b`), según `AGENTS.md` § Tests. Todo encabezado de
  escenario de §9 va seguido de un bloque `Variants:` o de la declaración
  explícita `Variants: none — single-path scenario`. Gateado por `T-N.D8` y
  `T-N.D8b` del Plan.
- **AC-51** — Todo NFR de §8 con objetivo cuantificado —`NFR-001` y
  `NFR-002`— tiene un test de medición referenciado en la §12 del Plan, con
  el identificador embebido. Gateado por `T-N.D9`.
- **AC-52** — Todo TC de §4 tiene una verificación de cumplimiento en §11.3 y
  una entrada correspondiente en la §12 del Plan. Gateado por `T-N.D10` y
  `T-N.D10b`.
- **AC-53** — Cada ámbito materialmente afectado por el cambio tiene al menos
  una fila `IMP-*` en la §12.2 *Impact Traceability* del Plan. Gateado por
  `T-N.D15`.
- **AC-54** — Todo NFR con objetivo cuantificado tiene al menos una fila
  `OBS-*` en la §11 *Observability* del Plan, con el identificador del NFR en
  su columna *Binds to*. Gateado por `T-N.D16`.
- **AC-55** — La rebanada no incorpora ningún lockfile. El Plan declara
  `Supply-chain: none — el repositorio no versiona lockfile y la rebanada no
  agrega dependencias (TC-002)` en su §5, y `AC-55` se satisface de forma
  vacua. Gateado por `T-N.D20`.

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Un solo formato para leer un resultado | Cero consultas al administrador sobre "quién metió qué" en los primeros 30 días, comparado con las que hoy genera la lista de filas | Conteo de mensajes en el grupo |
| Edición encontrada | El administrador encuentra el botón de editar resultado sin buscarlo al pie de la tarjeta | Observación directa en los primeros usos reales |
| Altura de la tarjeta | La tarjeta de partido finalizado a 360 px no es más alta que la lista de filas que reemplaza | Medición en `tests/layout.test.js` |

## 13. Dependencies

- **Upstream specs:** Concept Note de `equipos-en-el-campo`; Specs de las
  rebanadas 1 a 3, ya mergeadas.
- **Servicios:** Cloud Firestore y Firebase Auth, ninguno cambia de forma.
- **Diseño:** el handoff en [`handoff/`](../handoff/) y el design system en
  [`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/).
- **Feature flags / config:** ninguna.
- **Third-party APIs:** ninguna nueva.

## 14. Assumptions

- **A-01** — `m.resultado.statsPorJugador` mantiene, para todo partido
  finalizado, la forma `{goles, golesPenal, golesEnContra, asistencias}` por
  jugador, sin campos faltantes, tal como la escribe
  `__finalizarPartido`/`__guardarEdicionResultado`. Verificado por lectura el
  2026-09-01.
- **A-02** — `CANCHAS[m.cancha].formacion` sigue existiendo con la forma
  `{defensores, volantes, delanteros}` para los dos tamaños de cancha
  soportados ([`index.html:1045-1046`](../../../index.html#L1045-L1046)).
- **A-03** — Ningún partido finalizado en producción tiene `m.equipos`
  ausente: la generación es un paso obligatorio antes de poder finalizar
  (heredado del flujo ya existente, no verificado contra datos reales de
  producción).

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| Retirar la píldora, la diferencia por línea y el receipt en el partido finalizado hace extrañar un dato que se podía comparar antes | Low | Low | Ninguno de los tres describe el armado post-generación de forma útil una vez que el partido ya se jugó y no puede editarse; el marcador real (`FR-040`) es la comparación que importa en este estado |
| Con gol + gol en contra + asistencia a la vez, los dos grupos de chips se tocan en anchos angostos | Med | Med | Es el mismo límite que el handoff ya documenta para 8c/8d, no algo nuevo de esta implementación; `NFR-001`/`AC-10` lo miden explícitamente como caso de prueba |
| La caption compacta de fútbol 9 (`FR-005c`) queda más larga que la de fútbol 8 y puede no entrar en 360 px | Med | Low | `NFR-001` lo mide en los trece anchos, incluido 360; si no entra, la salida barata es truncar con elipsis, que no rompe ningún requisito |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | La anotación recíproca en la Spec de la rebanada 3 (marcar ahí qué quedó reemplazado) sigue pendiente, igual que en las rebanadas 2 y 3 | Lucas Manoukian | Implementation Plan | Misma deuda que las dos rebanadas anteriores dejaron sin saldar; conviene saldar las tres juntas |
| OPEN-Q-02 | ¿La caption compacta de fútbol 9 debería seguir el formato corto del handoff ("Fútbol 9 · 3-4-1 · {estrategia}", sin la palabra "Estrategia:") en vez del formato explícito que fija `FR-005c`? | Lucas Manoukian | Revisión posterior al merge | Decidido a favor de la forma explícita por consistencia con fútbol 8, sin verificarlo contra la pantalla real; si se ve repetitivo, es un cambio de texto sin impacto en ningún `FR` más |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** todo `FR-*` de §7, todo `NFR-*` de
  §8, todo `TC-*` de §4, todo `AC-*` de §11 —incluidos los seis
  meta-criterios de §11.5— y las constraints heredadas en §3.3.
- **Plan has freedom over:** cómo se extiende `renderTeamsSection` y
  `mostrarCanchaDeEquipos`, qué funciones nuevas se extraen (por ejemplo, una
  para los chips y otra para las filas de detalle) y con qué nombres, dónde
  vive el CSS nuevo, cómo se estructura la suite de unidad y qué fixtures
  usa, y cómo se ordenan las ramas y los commits dentro de
  `feature/partido-finalizado`.
- **Plan must resolve:** `OPEN-Q-02`.
- **Deuda de verificación heredada (`MD-26`):** el marcador `[UNVERIFIED]` de
  §4.5 —el ranking vigente del CWE Top 25 no se consultó por estar sin
  conexión— se traslada al Plan, que lo debe reenunciar en su §15.1.
- **Cuidado particular:** `tests/harness.js` recorta declaraciones de
  `index.html` **por nombre** (`AGENTS.md` § Estilo). Si el Plan extrae o
  renombra `mostrarCanchaDeEquipos`, `totalGolesEquipo`, `formatFecha` o
  `canchaLabel`, que hoy están en su lista, tiene que actualizarla en el mismo
  commit.
- **Decisiones que podrían promoverse al Concept Note:** siguiendo el patrón
  de las rebanadas 2 y 3 (`D-18` a `D-25`), esta Spec toma dos llamadas que
  extienden una decisión existente sin una `D-*` propia: extender el alcance
  de `D-24` al encabezado del partido finalizado (§3.3) y resolver a favor de
  la forma explícita la inconsistencia de copy entre 6b y 8d (`TC-034`,
  `FR-005c`). Ninguna de las dos bloquea la implementación; quedan
  disponibles para una enmienda del Concept Note si se quiere mantener la
  trazabilidad completa de decisiones, como se hizo con las rebanadas
  anteriores.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-01 | Lucas Manoukian | Corrección encontrada al empezar el Implementation Plan: `FR-009` decía que el botón de copiar formación "sigue existiendo... en la botonera al pie", pero eso es falso — la rebanada 3 ya lo sacó del pie por completo (`FR-063` de esa Spec) y sólo vive en el encabezado. El handoff (5a/6b) dibuja el encabezado del partido finalizado sólo con el lápiz, sin ícono de copiar, pero nada en el Concept Note declara sacar esa función para este estado; consultado el usuario, se confirmó mantenerla. `FR-009` se reescribe para agregar el botón de copiar al encabezado junto al lápiz, y `FR-009b` (nuevo) aísla la exclusión de Regenerar, que sí seguía siendo correcta. Se ajusta `S-01` en consecuencia. El error fue tratar una omisión del mockup puntual como si fuera una decisión de producto, en vez de contrastarla contra lo que la rebanada 3 ya construyó (mismo tipo de falla que `TC-034` existe para atrapar, aunque esta la atrapó recién el Plan y no la propia Spec). |
| 2026-09-01 | Lucas Manoukian | Segunda corrección encontrada al mismo tiempo que la de `FR-009`: `FR-036` decía que una dupla de rotación muestra los chips "de cada integrante... nunca combinados en una sola camiseta", pero eso contradice cómo la cancha ya dibuja una dupla desde la rebanada 1 — **una sola** camiseta compartida con los dos nombres, no dos camisetas. No hay una segunda forma dónde anclar un segundo juego de chips. Se reescribe `FR-036` para sumar los valores de los dos integrantes y mostrar un único juego de chips, con el mismo criterio que ya usa `valorDePuntaje` para el puntaje combinado de la dupla. Se ajustan `S-03c` y `S-03d` en consecuencia. El error fue copiar el criterio de `FR-013`/`FR-014` de `001-organizacion-partidos` (cada integrante carga sus propios valores) sin verificar que ese criterio es sobre el **dato guardado**, no sobre **cuántas camisetas existen para mostrarlo**. |
| 2026-09-01 | Lucas Manoukian | Tercera corrección: releída la sección "Fila de resultado" del handoff con más cuidado, el bloque izquierdo/derecho de la versión de escritorio lleva **nombre del equipo + puntaje de armado** ("Blanco" + "52.5 pts"), no sólo el nombre — dato que `FR-040`/`FR-041` habían omitido. La versión compacta sí omite el puntaje (probablemente por espacio, no por descuido: no hay ninguna razón funcional para sacarlo, a diferencia del caso de `FR-005c`, así que se toma tal cual dice el handoff). Esto además expone que el encabezado de cada panel de equipo (`Equipo Blanco 52.5 pts · 4 goles`, heredado de antes de esta rebanada) pasaría a repetir el puntaje **y** el resultado en la misma pantalla; se agrega `FR-042b` para que ese encabezado muestre sólo el nombre en este estado. Se ajustan `S-04`, `S-04b` y `AC-05`. El error fue quedarme con una lectura aproximada ("nombre y resultado") de un componente con más partes de las que primero registré, en vez de citar la medida exacta del handoff antes de escribir el requisito. |
| 2026-09-01 | Lucas Manoukian | Initial draft. Deriva la Spec directamente del Concept Note (ya aprobado, cubre las 7 rebanadas) y del handoff (5a, 6b, 8c, 8d, § Chips de estadística, § Fila de resultado, § Filas de detalle), sin reabrir preguntas que esos dos documentos ya responden, a pedido explícito del usuario para minimizar el Q&A de esta rebanada. Declara el reemplazo parcial de seis grupos de FR de la Spec de la rebanada 3 (píldora, diferencia por línea, receipt, FR-060, FR-083b) para el estado específico de partido finalizado sin edición. Self-critique: passed (0🔴 / 4🟡 / 2🔵), los seis resueltos. Los 🟡: la declaración de reemplazo citaba `FR-020` a `FR-025` como la fila de resultado cuando en esta Spec esa fila es `FR-040` a `FR-043` (corregido); los IDs de la rebanada 3 citados en esa misma declaración no se distinguían de los de esta Spec pese a compartir rango numérico (se anotaron todos con "(rebanada 3)"); `FR-005b` no cubría el caso compacto de fútbol 9 y no tenía escenario ni AC propios (se agregó `FR-005c`, la variante `S-10a` y `AC-07`); `FR-060` citaba "007-permisos-por-usuario no los alcanza" sin apuntar a la regla taxativa concreta (se citó `FR-004` a `FR-007` y `FR-013` de esa Spec). Los 🔵: `FR-003` no distinguía `estrategiaKey` (la clave) de `resumen` (el texto mostrado, resuelto vía `ESTRATEGIAS[...]`); se agregó al Handoff una nota sobre dos decisiones de esta Spec (la extensión de `D-24`, el desempate de `TC-034`) que podrían promoverse al Concept Note siguiendo el patrón de las rebanadas 2 y 3. |

---

*Esta Spec define qué debe hacer el sistema, cómo debe comportarse y qué
soluciones son admisibles. Las decisiones concretas de implementación viven en
`PARTIDO_FINALIZADO_IMPLEMENTATION_PLAN.md` (no escrito todavía). La
motivación y el fundamento de las decisiones viven en
[EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md).*
