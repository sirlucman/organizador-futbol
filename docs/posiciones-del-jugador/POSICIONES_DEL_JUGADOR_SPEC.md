# Posiciones del jugador — Spec

> **Status:** Draft · **Date:** 2026-10-28 · **Última revisión:** 2026-10-29 · **Owner:** Lucas Manoukian (claude-opus-5-5)
>
> **Reviewers:** *pending*
>
> **Concept note:** [POSICIONES_DEL_JUGADOR_CONCEPT.md](./POSICIONES_DEL_JUGADOR_CONCEPT.md)
>
> **Implementation plan:** *not yet written*

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5 *Sources &
> Origins* del Concept Note. Donde un `FR-*`/`NFR-*`/`TC-*` se apoya en una ubicación de
> código o en una Spec vigente que el Concept Note no cubre, la cita va **en línea** en la
> sección donde se define el requisito.

> **Declaración de reemplazo (gobernanza vigente en [`AGENTS.md`](../../AGENTS.md)).**
> Esta Spec cambia el comportamiento de la edición manual del reparto que describen la
> rebanada 2 (arrastre) y, en menor medida, las rebanadas 1 y 3 de `equipos-en-el-campo`.
> Cada parte de abajo queda marcada como reemplazada en su documento de origen, en la
> misma rama que esta Spec (`AC-02`). La lista parte del §16 del Concept Note y suma lo
> que encontró el barrido completo de `CANCHA_SPEC.md` y `CARGA_POR_TOQUE_SPEC.md` y el
> barrido dirigido de `ARRASTRE_SPEC.md`, `PANEL_ARMADO_SPEC.md` e
> `INTERCAMBIAR_COLORES_SPEC.md` (2026-10-28); cada línea citada se abrió. Los números de
> línea son los de la versión anterior a las notas recíprocas del 2026-10-29
> (`4803d85^`), que corrieron los de `ARRASTRE_SPEC.md`, `CANCHA_SPEC.md` y `PANEL_ARMADO_SPEC.md`: la
> referencia estable es el ID o la sección de la columna "Parte" (`AC-02`).
>
> | Documento | Parte | Qué dice hoy | Reemplazado por |
> |---|---|---|---|
> | [`EQUIPOS_EN_EL_CAMPO_CONCEPT.md`](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md) | `D-19` (l. 508), en parte | la edición manual se acota a movimientos entre equipos | `FR-030`, `FR-041`. El pase sigue siendo sólo entre equipos (`FR-043`) |
> | `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` | `D-20` (l. 509), en parte | un movimiento manual no escribe la posición asignada | `FR-030`. El pase la conserva (`FR-043`) |
> | [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md) | §2 (l. 79-80), última frase | "No cambia la posición asignada de nadie." | `FR-030` |
> | `ARRASTRE_SPEC.md` | §3.1 (l. 89-90), las zonas | dos zonas en dos columnas, ambas del otro equipo | `FR-041`: una camiseta compatible del propio equipo también es zona |
> | `ARRASTRE_SPEC.md` | §3.2, primera viñeta (l. 105-109) | no se intercambia con otra camiseta del mismo equipo | `FR-041`. Mover a otra línea sin intercambio sigue sin existir (§3.2 de esta Spec) |
> | `ARRASTRE_SPEC.md` | §3.2, tercera viñeta (l. 114-118) y `R-02` (l. 991) | no hay intercambio en una sola columna | `FR-012`, `FR-013`: existe, por toque |
> | `ARRASTRE_SPEC.md` | §3.3, líneas de `D-19` y `D-20` (l. 159-163) | heredadas enteras | las partes de arriba |
> | `ARRASTRE_SPEC.md` | `TC-010` (l. 203-208), en el efecto | la única ruta de escritura es la que cambia de equipo | `TC-011`: la misma ruta, que ahora también escribe el puesto asignado |
> | `ARRASTRE_SPEC.md` | `TC-012` (l. 213), `FR-022` (l. 430), `NFR-005` (l. 550), `AC-14` (l. 801), `AC-23` (l. 829) | no se escribe `posicionAsignada`; los campos escritos son exactamente cuatro | `NFR-005` de esta Spec. `equipos.sumaBlanco` y `equipos.sumaNegro` ya no se escriben al mover: el panel recalcula los totales en vivo (`sumasVigentes`) y el valor guardado queda como registro de la generación ([index.html:5768-5777](../../index.html#L5768-L5777)) |
> | `ARRASTRE_SPEC.md` | Glosario "Dos columnas", "Zona de drop", "Intercambio" (l. 356, 357, 360) | el intercambio sólo cambia de equipo y sólo existe en dos columnas | Glosario de esta Spec ("Intercambio") |
> | `ARRASTRE_SPEC.md` | `FR-011` (l. 397) y `US-02` (l. 336) | intercambio sin regla de puestos, sólo en dos columnas | `FR-021`, `FR-030`, `FR-031`, `FR-041` |
> | `ARRASTRE_SPEC.md` | `FR-012` (l. 400), en su alcance | la camiseta gana sobre la cancha del equipo contrario | `FR-041`: también sobre la cancha propia |
> | `ARRASTRE_SPEC.md` | `FR-013` (l. 402), sólo "sobre otra camiseta de su propio equipo" | sin efecto | `FR-041`, `FR-042`. Sobre la cancha o la pestaña propias sigue sin efecto (`FR-044`) |
> | `ARRASTRE_SPEC.md` | `FR-014` (l. 406) y `FR-015` (l. 408) | sólo se realza la zona bajo el puntero, nunca el propio equipo | `FR-040` |
> | `ARRASTRE_SPEC.md` | `S-02` (l. 590), el encabezado "en pantalla ancha" y el último *Then* | "ninguna de las dos posiciones asignadas cambió" | `S-02`, `S-03` de esta Spec |
> | `ARRASTRE_SPEC.md` | `S-02c` (l. 603) | soltar sobre una camiseta propia no modifica nada | `S-03`, `S-03b` |
> | `ARRASTRE_SPEC.md` | `S-03a`, `S-03b` (l. 616-617), "en dos columnas" | intercambio de duplas sin regla de puestos | `S-02c` de esta Spec |
> | `ARRASTRE_SPEC.md` | `A-02` (l. 968) | el candado es el único otro control sobre la camiseta | `FR-017`, `A-01` de esta Spec |
> | `ARRASTRE_SPEC.md` | §17, "Debe seguir siendo no-objetivo" (l. 1038-1039) | mover dentro del propio equipo y el intercambio en una columna | esta Spec los vuelve objetivo |
> | [`CANCHA_SPEC.md`](../equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md) | `TC-012` (l. 166-169) | "La cancha no escribirá nada" salvo el candado | `FR-030` |
> | `CANCHA_SPEC.md` | Glosario "Posición asignada" (l. 279) | la fija el motor o una override | Glosario de esta Spec ("Puesto asignado") |
> | `CANCHA_SPEC.md` | `A-04` (l. 764-766) | el candado es el único elemento interactivo de la cancha | `FR-010` |
> | [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md) | §3.3, línea de `D-19`/`D-20` (l. 217-220) y `A-03` (l. 1147) | un movimiento manual no cambia el puesto asignado de nadie | `FR-030`, `FR-070`: el recálculo vigente ya lee el puesto asignado en vivo (`A-03` de esta Spec) |
>
> **Complementa sin reemplazar:**
>
> - `ARRASTRE_SPEC.md` §3.2, cuarta viñeta (l. 119-123): el cambio de pestaña por
>   sobrevuelo sigue fuera de alcance, pero su justificación ("la única razón sería
>   habilitar el intercambio en angosto") ya no aplica: el intercambio en angosto existe
>   por toque (`FR-012`).
> - `ARRASTRE_SPEC.md` `TC-003` y `AC-21` (l. 190, 824): siguen vigentes; `TC-003` de esta
>   Spec los extiende al toque.
> - `CANCHA_SPEC.md` `TC-011` (l. 160-163): sigue vigente; el intercambio no agrega ningún
>   cálculo de puntaje (`TC-011` de esta Spec).
> - `CANCHA_SPEC.md` `NFR-003` (l. 455), "hoy únicamente el candado": sigue vigente;
>   `NFR-003` de esta Spec suma la selección y los candidatos.
> - `CARGA_POR_TOQUE_SPEC.md` §3.2, última viñeta (l. 194-197) y glosario "Modo de carga
>   por toque" (l. 344): siguen vigentes; el glosario lleva desde el 2026-10-29 una nota que lo
>   aclara. Fuera del modo de carga la cancha ahora también
>   responde a toques, con otro significado y en una ventana que no se superpone (`FR-001`).
>
> **No reemplaza:** el resumen dividido (`D-26` de `equipos-en-el-campo`, `FR-072b` a
> `FR-072d` de `PANEL_ARMADO_SPEC.md`) queda intacto (`D-12`); el pase suelto (`FR-010`
> de `ARRASTRE_SPEC.md`) queda como hoy.
>
> **Hallazgo ajeno a esta feature:** `PANEL_ARMADO_SPEC.md` usa dos veces el ID `S-05j`
> (l. 805 `[property]` y l. 806 `[boundary]`). No se corrige acá; queda anotado en §16
> (`OPEN-Q-11`).

## 1. Purpose

Esta Spec define cómo el administrador cambia el puesto de los jugadores de un partido
ya generado sin regenerar: qué pasa al tocar una camiseta, qué compañeros se resaltan,
cuándo un intercambio es válido, qué hace el arrastre sobre una camiseta, cómo se ocupa
qué se conserva al regenerar y qué se ve
después. El porqué está en el Concept Note; cómo se construye, en el Implementation Plan.

## 2. Summary

Hoy, una vez generados los equipos, la cancha deja cambiar a un jugador de equipo pero
no de puesto, y el intercambio entre equipos conserva el puesto de cada uno. Con esta
feature, el administrador toca una camiseta, la cancha resalta a los jugadores —de los
dos equipos— con los que puede intercambiar puesto sin que ninguno quede en un puesto
que no declaró, y un segundo toque hace el intercambio: cada uno toma el puesto del otro
y, si eran de equipos distintos, también el equipo. Lo mismo pasa al arrastrar una
camiseta sobre otra. En el celular se toca, se cambia de pestaña y se toca. Un equipo que se queda sin arquero se
resuelve regenerando, como hoy. Totales, diferencias, lugares sin
cubrir y el resumen se actualizan con el recálculo que ya existe. La aplicación sigue
siendo un organizador de partidos entre amigos; lo que cambia es que lo guardado vuelve a
coincidir con lo que se juega.

## 3. Scope

### 3.1 In scope

- Seleccionar una camiseta, resaltar a los candidatos y aplicar el intercambio por
  toque, en una y en dos columnas.
- La regla de compatibilidad, incluidas las duplas de rotación.
- El arrastre sobre una camiseta —propia o del otro equipo— con la misma regla, el
  resaltado de candidatos durante el arrastre y el aviso al soltar sobre una
  incompatible.
- Los partidos "Solo por puntaje".
- Qué conserva una regeneración.
- El aviso de "nadie puede intercambiar".

### 3.2 Out of scope / non-goals

Heredados del Concept Note §4 y §16:

- El sistema no mostrará selección, resaltado ni avisos de intercambio al rol
  `jugador`, ni le expondrá puntajes por puesto.
- El sistema no cambiará los puestos declarados de un jugador (principal y secundarias)
  desde la cancha. En particular, elegir a alguien para el arco no le agrega Arquero.
- El sistema no moverá a un jugador a un lugar vacío de su propio equipo, ni siquiera al
  arco. Un equipo que quedó sin arquero —por un pase hecho a mano, o porque el motor no
  mueve al arco a un jugador con candado— se resuelve regenerando, como hoy (`D-31`). La
  idea de ocupar ese arco a mano queda en `Roadmap.md`.
- El sistema no cambiará cómo el motor elige los arqueros ni cómo se calculan los
  puntajes (`D-30`, `TC-012`).

Propios de esta Spec:

- El sistema no ofrecerá equivalente de teclado para seleccionar ni intercambiar
  (Concept Note §14, `OPEN-Q-03`).
- El sistema no registrará qué intercambios hubo (`D-12`).
- El sistema no modificará ninguna estrategia del motor de generación.
- El sistema no resuelve dos administradores editando el mismo partido a la vez: gana la
  última escritura, como hoy (`Roadmap.md` §3).

Diferidos del Concept Note §14, que tampoco entran en esta versión: mostrar el puntaje
del jugador en cada puesto al seleccionarlo, y el intercambio fuera de puesto con
confirmación explícita fuera del arco vacío. La idea de `Roadmap.md` que esta feature
encara es la alternativa táctil para editar equipos, de la que toma el intercambio por
toque (`Roadmap.md` § Mejoras de UX).

### 3.3 Constraints inherited from the Concept Note

- **D-01** (sólo `admin`) — heredada; `FR-002`, `TC-040`.
- **D-02** (se resaltan sólo los candidatos válidos) — heredada; `FR-011`.
- **D-03** (principal o secundaria) — heredada; `FR-020`.
- **D-04** (los dos quedan en un puesto suyo) — heredada; `FR-021`. La excepción del arco
  vacío se retiró con `D-31`.
- **D-05** (gestos del toque y aviso sin candidatos) — heredada; `FR-013` a `FR-018`.
- **D-06** (intercambio entre equipos con puestos; en una columna sobrevive al cambio de
  pestaña) — heredada; `FR-012`, `FR-031`.
- **D-07** (puestos de una dupla = unión, con el criterio del motor) — heredada; `FR-020`,
  `TC-010`.
- **D-08** (el arrastre sobre una camiseta hace el mismo intercambio) — heredada;
  `FR-041`, `FR-042`.
- **D-09** (el pase suelto queda como hoy) — heredada; `FR-043`.
- **D-10** (recálculo vigente, sin uno nuevo) — heredada; `FR-070`, `TC-011`.
- **D-11** (misma ventana que el arrastre) — heredada; `FR-001`.
- **D-12** (el resumen no cambia) — heredada; `FR-071`, `FR-072`.
- **D-13** (el candado no impide intercambiar) — heredada; `FR-035`. Lo que el candado
  conserva al regenerar es el equipo, no el puesto (`D-31`, `FR-061`).
- **D-14** (arco vacío) y **D-15** (valor del arquero improvisado) — **retiradas** por
  `D-31` y `D-30`.
- **D-16** (la ventaja por no tener arquero fijo se mantiene) — heredada; `FR-057`.
- **D-17** ("Solo por puntaje": intercambio con el otro equipo sin regla; arrastre como
  hoy) — heredada; `FR-024`, `FR-033`, `FR-045`.

Decisiones que el propietario tomó al escribir esta Spec (2026-10-28), registradas como
`D-18` a `D-24` en la §10 del Concept Note:

- **D-18** (regenerar: lo manual sin candado se pierde; con candado se conserva el equipo)
  — cierra `OPEN-Q-02`; `FR-060`, `FR-061`. Lo que decía del puesto y del arquero, retirado
  por `D-31`.
- **D-19** (el arrastre resalta los mismos candidatos que el toque; soltar sobre una
  incompatible no cambia nada y avisa por qué) — cierra `OPEN-Q-04`; `FR-040`, `FR-042`.
- **D-20** (la compatibilidad en un partido con puestos del catálogo viejo) — cerró
  `OPEN-Q-06`; **retirada por `D-32`**: un partido editable no tiene puestos viejos (`A-07`).
- **D-21** (guardar el puesto anterior del arquero), **D-22** (el arco en "Solo por
  puntaje"), **D-23** (volver del arco al puesto anterior) y **D-24** (el arco por
  arrastre) — **retiradas** por `D-30` y `D-31`.

Decisiones que el propietario tomó al atender las revisiones de la Spec (2026-10-29),
registradas como `D-25` a `D-32` en la §10 del Concept Note:

- **D-25** a **D-29** (valor, marca de dibujo, candado, prioridad y vuelta del arquero
  puesto a mano) — **retiradas** por `D-30` y `D-31`.
- **D-30** (la feature no cambia cómo el motor elige los arqueros ni cómo se calculan los
  puntajes) — §3.2, `TC-011`, `TC-012`. Lo que decía del arco vacío lo reemplaza `D-31`.
- **D-31** (la feature no ocupa el arco vacío: un equipo sin arquero se resuelve
  regenerando, como hoy; al regenerar, el candado conserva el equipo y no el puesto, como
  dice la Spec del motor) — `FR-050`, `FR-061`, §3.2.
- **D-32** (la feature no contempla puestos del catálogo viejo: generar exige revisar
  antes las fichas, así que un partido editable sólo tiene puestos nuevos) — §3.1, `A-07`.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — La feature vivirá en `index.html`, dentro del IIFE existente, sin paso de
  build, sin bundler y sin dependencias nuevas (`AGENTS.md` § Estilo y § Dependencias).
- **TC-002** — Todo lo que la feature guarde irá en los documentos que ya existen
  (`data/partidos`,
  [index.html:2350-2373](../../index.html#L2350-L2373)), a través de la interfaz de
  guardar/leer existente. No se agregará ningún documento ni campo, ni se tocarán las reglas
  de Firestore.
- **TC-003** — El toque se resolverá con el evento de activación nativo del navegador
  (`click`), sin manejadores de `pointer` ni de `touch`, y el arrastre seguirá usando la
  API nativa de arrastre. Así siguen vigentes `TC-003` y `AC-21` de `ARRASTRE_SPEC.md`
  (l. 190, 824) y el precedente de `D-18` de `CARGA_POR_TOQUE_SPEC.md` (l. 220-225).

### 4.2 Architectural / integration constraints

- **TC-010** — Una única función decidirá si una unidad de armado cubre un puesto, y
  será la misma que usa el recálculo vigente para "lugares sin cubrir"
  (`cubrePosicionGuardada`,
  [index.html:3642-3651](../../index.html#L3642-L3651), que delega en `costoEncaje`,
  [index.html:3631-3636](../../index.html#L3631-L3636)). El toque, el arrastre y la
  revalidación antes de aplicar (`FR-034`) la consultan; ninguno reimplementa la regla
  (`D-07`).
- **TC-011** — El intercambio y el pase reutilizarán la ruta de escritura existente
  (`intercambiarUnidades`, `moverUnJugadorDeEquipo`,
  [index.html:5635-5777](../../index.html#L5635-L5777)). Totales, diferencia entre
  equipos, diferencia por línea, lugares sin cubrir y el resumen se leerán de las
  funciones vigentes (`sumasVigentes`, `balanceLineasVigente`,
  `faltantesDeFormacionVigente`), sin cálculo nuevo (`D-10`, `D-30`).
- **TC-012** — Ninguna estrategia del motor se modificará, y al regenerar se le pasará lo
  guardado, como hoy ([index.html:4694](../../index.html#L4694)): el intercambio sólo
  cambia qué puesto está guardado (`D-30`, `D-31`). Se mantiene la separación interfaz /
  motor / persistencia de `AGENTS.md`.
- **TC-013** — La selección es estado de pantalla: no se persistirá ni se compartirá
  entre sesiones.

### 4.3 Compliance / regulatory constraints

- **TC-020** — Los estados nuevos de la camiseta (seleccionada, candidata) se distinguirán por más de una señal, nunca sólo
  por color (WCAG 2.1, criterio 1.4.1 *Use of Color*, ya citado por `TC-020` de
  `DESGLOSE_POSICIONES_SPEC.md`; mismo criterio que `NFR-003` de
  `CARGA_POR_TOQUE_SPEC.md`, l. 544).

### 4.4 Conventions to follow

- **TC-030** — Toda decisión visual se resolverá contra
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/), en
  el orden de `AGENTS.md`: un token o componente existente, una combinación de tokens, o
  una excepción documentada en el Implementation Plan. Esta Spec no declara excepciones
  (`OPEN-Q-05`, `OPEN-Q-09`).
- **TC-031** — Todo test que satisfaga un `S-NN`, `NFR-NNN` o `TC-NNN` llevará el
  identificador en forma canónica con guion dentro de un string literal —el nombre del
  caso o el campo `spec:` de un escenario de `layout.test.js`—, nunca en un comentario
  (`AGENTS.md` § Tests).
- **TC-032** — Toda función de `index.html` que se renombre o se borre y figure en la
  lista `DECLARACIONES` de `tests/harness.js` o de otro test se actualizará en esa lista
  en el mismo commit (`AGENTS.md` § Estilo).
- **TC-033** — La cancha con una selección activa y candidatos resaltados se
  agregará a `tests/layout.test.js` como escenario nuevo, y ese escenario se verá fallar
  al menos una vez antes de darlo por bueno (`AGENTS.md`, Responsive).

### 4.5 Security constraints (`MD-31`)

CWE Top 25 consultado en vivo el 2026-10-28: edición 2025
(`https://cwe.mitre.org/top25/`, que remite a
`https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html`). El Concept Note §5.2
señala `CWE-79`, `CWE-862` y `CWE-863`.

- **TC-040** — Seleccionar e intercambiar sólo se dibujarán, y su acción sólo se ejecutará, cuando el rol de la sesión
  sea `admin` y el partido esté en la ventana de edición; la guarda va **dentro del
  manejador**, no sólo en el render, igual que `TC-040` de `CANCHA_SPEC.md` (l. 224-227),
  **defends `CWE-862` *Missing Authorization*** del lado del cliente. La barrera del
  almacenamiento no distingue rol para `data/partidos`, que `jugador` puede escribir
  (preexistente, ver el ruling de `CWE-863`).
- **TC-041** — Todo nombre de jugador que aparezca en el aviso de `FR-018` o `FR-042`, en
  un `title` o en un `aria-label` nuevo se insertará escapado, en contenido y en
  atributos (`AGENTS.md` § Estilo), **defends `CWE-79` *Cross-Site Scripting***.
- **TC-042** — Antes de escribir, todo identificador que llegue del DOM o del
  `dataTransfer` se validará contra el reparto del partido, **defends `CWE-20` *Improper Input Validation***.
- **TC-043** — Ningún aviso ni nombre accesible de esta feature incluirá puntajes,
  **defends `CWE-200` *Exposure of Sensitive Information to an Unauthorized Actor***. Los
  puntajes son información de `admin` (`007-permisos-por-usuario`).
- **`CWE-863` / `CWE-284`** — ruling, no commitment: que `jugador` pueda escribir
  `data/partidos`
  ([`firestore-rules.md:81`](../rol-en-el-token/contracts/firestore-rules.md)) es una
  condición preexistente que esta feature no agrava: no agrega permisos ni toca reglas.
  Lo que escribe el intercambio (`equipos.blanco`, `equipos.negro`,
  `equipos.posicionAsignada`) va a `data/partidos`,
  como ya iban esos campos. El cierre del hueco de `data/partidos` es de
  `rol-en-el-token`, no de esta feature.
- **`CWE-639`** — no aplica: los identificadores que llegan del DOM se validan contra el
  reparto (`TC-042`) y la autorización depende del rol del token, no del identificador.
- **`CWE-352` *CSRF*** — no aplica: no hay endpoint propio con sesión por cookie.
- Resto de la lista (`CWE-89`, `-787`, `-22`, `-416`, `-125`, `-78`, `-94`, `-120`,
  `-434`, `-476`, `-121`, `-502`, `-122`, `-306`, `-918`, `-77`, `-770`) — no aplica:
  sin SQL, sin memoria manual, sin sistema de archivos, sin comandos, sin subidas, sin
  deserialización de datos no confiables más allá del `JSON.parse` de los documentos
  propios, sin pedidos del servidor, y toda acción exige sesión autenticada con rol.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador (`admin`) | Arma los partidos y corrige el reparto antes de jugar | Reacomodar puestos sin regenerar, y que la cancha diga la verdad |
| Jugador (`jugador`) | Ve la cancha | Ver dónde juega cada uno; no edita nada |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero intercambiar el puesto de dos compañeros de equipo, para corregir el reparto sin regenerar. | FR-010 a FR-021, FR-030, FR-034 |
| US-02 | Como administrador, quiero ver con quién puedo intercambiar a un jugador sin ir a la solapa Jugadores. | FR-011, FR-018, FR-020 a FR-024 |
| US-03 | Como administrador, quiero intercambiar jugadores de equipos distintos sin desarmar las formaciones, también desde el celular. | FR-012, FR-021, FR-030 a FR-032 |
| US-04 | Como administrador, quiero que arrastrar una camiseta sobre otra haga lo mismo que tocarlas. | FR-040 a FR-046 |
| US-05 | *Retirada el 2026-10-29 (`D-31`): poner en el arco vacío a un jugador.* | — |
| US-06 | Como administrador, quiero que regenerar respete el equipo que fijé con candado. | FR-060, FR-061 |

## 6. Glossary

| Term | Definition |
|---|---|
| Unidad de armado | Un jugador suelto o una dupla de rotación, como en `008`. Una camiseta en la cancha. |
| Puesto | Uno de los ocho del catálogo de `desglose-posiciones` (ARQ, LI, DC, LD, MI, MC, MD, DEL). |
| Puestos declarados | La principal y las secundarias de un jugador, tal como las guarda su ficha. |
| Cubrir un puesto | Una unidad cubre un puesto si el puesto es principal o secundaria de un jugador suelto, o de al menos uno de los dos integrantes de una dupla. Es el criterio del motor (`TC-010`). |
| Puesto asignado | El puesto que una unidad ocupa en ese partido. Lo fija el motor al generar y, desde esta feature, también el administrador al intercambiar. |
| Partido con puestos | Un partido cuyo reparto guarda puesto asignado: el de toda estrategia salvo "Solo por puntaje". |
| Partido sin puestos | Un partido "Solo por puntaje": no guarda puesto asignado. El motor guarda sólo una marca de dibujo (`posicionOverride`) para los arqueros que ubicó en el arco y los excedentes que reubicó ([index.html:3227-3237](../../index.html#L3227-L3237)); el resto se dibuja en la línea de su principal ([index.html:5052-5054](../../index.html#L5052-L5054)). La marca no cambia ningún total: sin puesto asignado, cada uno suma su promedio general ([index.html:5064-5070](../../index.html#L5064-L5070)). |
| Ventana de edición | Rol `admin`, inscripción abierta y partido sin finalizar (`esFilaEditable`, [index.html:5072-5080](../../index.html#L5072-L5080)). |
| Selección | La camiseta que el administrador tocó y que espera un segundo toque. Estado de pantalla; a lo sumo una por pantalla. |
| Candidato | Una unidad con la que la seleccionada puede intercambiar según `FR-021` a `FR-024`. Se dibuja resaltada. |
| Intercambio | Dos unidades se cambian el puesto asignado y, si eran de equipos distintos, también el equipo. No confundir con "intercambiar colores" (`INTERCAMBIAR_COLORES_SPEC.md`). |
| Pase | Soltar una camiseta sobre la cancha o la pestaña del otro equipo: cambia de equipo sin intercambio. |
| Arco vacío | En un partido con puestos, el de un equipo sin ninguna unidad con puesto asignado ARQ; en uno sin puestos, el de un equipo sin ninguna camiseta dibujada en el arco. Esta feature no lo ocupa (`FR-050`). |

## 7. Functional requirements

### 7.1 Ventana y rol

- **FR-001** — While el partido esté en la ventana de edición, el sistema permitirá
  seleccionar camisetas tocándolas.
- **FR-002** — If la sesión no tiene rol `admin`, then el sistema no dibujará selección,
  candidatos ni avisos de intercambio, y sus manejadores no modificarán nada
  (`TC-040`).
- **FR-003** — When el partido sale de la ventana de edición mientras hay una selección
  (se cierra la inscripción o se finaliza), el sistema descartará la selección.

### 7.2 Selección

- **FR-010** — When el administrador toca una camiseta sin que haya una selección, el
  sistema la seleccionará y la marcará como seleccionada. En una dupla, el toque en
  cualquier parte de la camiseta selecciona la unidad entera; el toque acotado al nombre
  de cada integrante es del modo de carga, en otra ventana (`FR-030b` de
  `CARGA_POR_TOQUE_SPEC.md`, `FR-001`).
- **FR-011** — While haya una selección, el sistema resaltará, en las canchas a la
  vista, a todos los candidatos y sólo a ellos.
- **FR-012** — While haya una selección y la tarjeta esté en una columna, cuando el
  administrador cambie de equipo con el selector, el sistema conservará la selección y
  resaltará a los candidatos del equipo que pasa a verse.
- **FR-013** — When el administrador toca un candidato, el sistema aplicará el
  intercambio entre la seleccionada y ese candidato.
- **FR-014** — When el administrador toca una camiseta que no es candidata ni la
  seleccionada, el sistema la seleccionará en lugar de la anterior.
- **FR-015** — When el administrador toca la camiseta seleccionada, el sistema cancelará
  la selección.
- **FR-016** — When el administrador toca fuera de las camisetas, y del selector de
  equipo, el sistema cancelará la selección.
- **FR-017** — When el administrador activa el candado de una camiseta, el sistema
  alternará el bloqueo como hoy, sin seleccionar esa camiseta y sin cancelar la selección
  que hubiera.
- **FR-018** — When el administrador selecciona, en un partido con puestos, una unidad
  sin ningún candidato, el sistema mostrará el aviso "Nadie puede intercambiar
  puesto con {nombre}".
- **FR-019** — When el administrador selecciona una camiseta de otro partido, el sistema
  descartará la selección anterior: hay a lo sumo una selección en la pantalla.
- **FR-019b** — When el sistema aplica cualquier cambio al partido de la selección
  (intercambio, pase, regenerar, intercambiar colores),
  descartará la selección.

### 7.3 Compatibilidad

- **FR-020** — El sistema decidirá si una unidad cubre un puesto con el criterio del
  glosario ("Cubrir un puesto"), el mismo que usa el motor (`TC-010`).
- **FR-021** — While el partido tenga puestos, el sistema tratará como candidata a toda
  unidad B del partido distinta de la seleccionada A tal que A cubra el puesto asignado de
  B y B cubra el puesto asignado de A, salvo lo que fija `FR-023`.
- **FR-022** — *Retirado el 2026-10-29* (`D-30`, `D-31`): trataba del intercambio con un
  arquero puesto a mano.
- **FR-023** — El sistema no tratará como candidata a una unidad del mismo equipo y con el
  mismo puesto asignado que la seleccionada: ese intercambio no cambiaría nada.
- **FR-024** — While el partido no tenga puestos, el sistema tratará como candidatas a
  todas las unidades del otro equipo y a ninguna del propio (`D-17`).

### 7.4 El intercambio

- **FR-030** — When el sistema aplica un intercambio en un partido con puestos, cada una
  de las dos unidades pasará a tener el puesto asignado que tenía la otra; en una dupla,
  sus dos integrantes.
- **FR-031** — When el sistema aplica un intercambio entre unidades de equipos distintos,
  cada una pasará al equipo de la otra, con su pareja de dupla.
- **FR-032** — When el sistema aplica un intercambio, dejará a cada equipo con la misma
  cantidad de unidades de armado que tenía antes. La cantidad de personas puede cambiar
  si hay una dupla de por medio (`S-03b` de `ARRASTRE_SPEC.md`).
- **FR-033** — When el sistema aplica un intercambio en un partido sin puestos, cambiará
  sólo el equipo de cada unidad y no escribirá ningún puesto asignado.
- **FR-034** — If al aplicar un intercambio la sesión no es `admin`, el partido no está en
  la ventana de edición, alguna de las dos unidades no pertenece al reparto o ya no son
  candidatas entre sí, then el sistema no escribirá nada.
- **FR-034b** — If, al tocar el candidato, el intercambio no se aplica porque las dos
  unidades dejaron de ser candidatas entre sí (el reparto cambió entre los dos toques), then el sistema mostrará el
  aviso "Ya no se puede intercambiar: el reparto cambió" y descartará la selección.
- **FR-035** — El sistema permitirá intercambiar una unidad fijada con el candado, y
  después del intercambio esa unidad seguirá fijada (`D-13`).
- **FR-036** — When el sistema aplica un intercambio, persistirá el partido y volverá a
  pintar la tarjeta de equipos por el camino de hoy.

### 7.5 El arrastre

- **FR-040** — When empieza el arrastre de una camiseta en un partido con puestos, el
  sistema resaltará a sus candidatos como en `FR-011` hasta que el arrastre termine.
- **FR-041** — When una camiseta arrastrada se suelta sobre un candidato, sea del propio
  equipo o del otro, el sistema aplicará el mismo intercambio de `FR-030` a `FR-036`.
- **FR-042** — When una camiseta arrastrada A en un partido con puestos se suelta sobre otra
  camiseta B que no es candidata, el sistema no modificará el partido y mostrará el aviso
  que corresponda de `FR-042b` a `FR-042d`. Si B no es candidata sólo por `FR-023` (mismo
  equipo y mismo puesto asignado), no mostrará ningún aviso: no hay nada que intercambiar.
- **FR-042b** — If sólo B no cubre el puesto de A, then el aviso será "{B} no juega de
  {puesto de A}".
- **FR-042c** — If sólo A no cubre el puesto de B, then el aviso será "{A} no juega de
  {puesto de B}".
- **FR-042d** — If ninguno de los dos cubre el puesto del otro, then el aviso será "Ninguno
  de los dos juega en el puesto del otro".
- **FR-043** — When una camiseta arrastrada se suelta sobre la cancha o la pestaña del
  otro equipo, y no sobre una camiseta, el sistema aplicará el pase de hoy: cambia de
  equipo y conserva el puesto asignado (`D-09`).
- **FR-044** — When una camiseta arrastrada se suelta sobre la cancha o la pestaña de su
  propio equipo, o sobre sí misma, el sistema no modificará el partido.
- **FR-045** — While el partido no tenga puestos, cuando una camiseta arrastrada se suelte
  sobre una camiseta del otro equipo, el sistema intercambiará de equipo a las dos unidades
  sin escribir puestos, como antes de esta feature.
- **FR-045b** — While el partido no tenga puestos, cuando una camiseta arrastrada se suelte
  sobre otra camiseta de su propio equipo, el sistema no modificará el partido.
- **FR-045c** — While el partido no tenga puestos, cuando una camiseta arrastrada se suelte
  sobre la cancha o la pestaña del otro equipo, el sistema aplicará el pase de `FR-043`.
- **FR-046** — When empieza un arrastre, el sistema descartará la selección por toque que
  hubiera.

### 7.6 Arco vacío

- **FR-050** — While un equipo tenga el arco vacío, el sistema no lo ofrecerá como destino
  ni aceptará que se suelte una camiseta sobre él para ocuparlo: se resuelve regenerando,
  como hoy (`D-31`). Vale en partidos con y sin puestos.
- **FR-057** — El sistema no modificará la ventaja que el motor le dio al equipo sin
  arquero fijo por ningún cambio manual (`D-16`).
- `FR-047` a `FR-049`, `FR-050b`, `FR-051` a `FR-056`, `FR-058`, `FR-058b` y `FR-059` —
  *retirados el 2026-10-29* (`D-30`, `D-31`): describían el arco vacío como destino, el
  arquero puesto a mano, su valor, su registro y su vuelta.

### 7.7 Regenerar

- **FR-060** — When el administrador regenera, el sistema descartará los cambios manuales
  de las unidades sin candado, como hoy (`D-18`).
- **FR-061** — When el administrador regenera, el sistema mantendrá a cada unidad con
  candado en su equipo. Su puesto lo decide el motor, que arranca desde el guardado —incluido
  el que le dio un intercambio—, como hoy: el candado fija el equipo y no el puesto
  ([`003-motor-generacion-equipos/spec.md:288` (`FR-015`)](../003-motor-generacion-equipos/spec.md), [index.html:3419-3422](../../index.html#L3419-L3422); `D-13`, `D-31`).
- `FR-062` y `FR-063` — *retirados el 2026-10-29* (`D-31`): trataban al arquero puesto a
  mano al regenerar.

### 7.8 Lo que se ve después

- **FR-070** — When el sistema aplica cualquier cambio de esta feature, los totales, la
  diferencia entre equipos, la diferencia por línea y los lugares sin cubrir mostrarán el
  reparto nuevo, con el recálculo vigente (`TC-011`).
- **FR-071** — El sistema mostrará el resumen "Por qué quedaron así" con las reglas
  vigentes de `FR-072b` a `FR-072d` de `PANEL_ARMADO_SPEC.md`, sin texto nuevo (`D-12`).
- **FR-072** — El sistema no guardará un registro de los intercambios hechos.

## 8. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive / layout | En cada ancho que mide `tests/layout.test.js` ([`tests/layout.test.js:45`](../../tests/layout.test.js#L45): 360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 759, 760, 768, 900, 1099, 1100, 1200 px), con una selección activa y candidatos resaltados la pantalla cumple `scrollWidth === clientWidth`, ningún elemento queda con su borde derecho fuera del viewport, y ninguna camiseta de una línea se superpone con otra (no-regresión de `NFR-002` de `CANCHA_SPEC.md`). |
| NFR-002 | Usabilidad | El área que selecciona una camiseta mide al menos 44×44 px en todos esos anchos; el candado sigue midiendo al menos 24×24 px y su área no selecciona (`FR-017`). Son los mismos pisos de `NFR-002` de `ARRASTRE_SPEC.md`. |
| NFR-003 | Accesibilidad | La camiseta seleccionada y los candidatos se distinguen por al menos dos señales, una de ellas no cromática (`TC-020`). Toda camiseta seleccionable anuncia el gesto en su `title`; los avisos de `FR-018`, `FR-034b` y `FR-042` se anuncian en una región `aria-live`. Sin equivalente de teclado (`OPEN-Q-03`). |
| NFR-004 | Rendimiento | Con 18 titulares, seleccionar una camiseta —calcular candidatos y repintar— no supera los 100 ms, y aplicar un intercambio —escribir y repintar— no supera los 150 ms, medidos con `performance.now()` en el Chromium que `tests/layout.test.js` usa vía Playwright. Son los techos de `NFR-005` de `CANCHA_SPEC.md` y `NFR-004` de `ARRASTRE_SPEC.md`. |
| NFR-005 | Compatibilidad de datos | Seleccionar no escribe nada. Un intercambio en un partido con puestos escribe sólo `equipos.blanco`, `equipos.negro`, las entradas de `equipos.posicionAsignada` de los jugadores de las dos unidades; en un partido sin puestos, sólo `equipos.blanco` y `equipos.negro`. Ningún gesto escribe `equipos.sumaBlanco` ni `equipos.sumaNegro`. |
| NFR-006 | Mantenibilidad | Todo valor de color, espaciado, radio, sombra y movimiento de los estados nuevos y del aviso proviene de un token o componente del design system o de una excepción listada en el Implementation Plan. |
| NFR-007 | Seguridad | Invocar los manejadores nuevos con identificadores ajenos al reparto, con un `dataTransfer` arbitrario, fuera de la ventana de edición o con sesión `jugador` no produce ninguna escritura. |

## 9. System behaviour & scenarios

```mermaid
stateDiagram-v2
  [*] --> SinSeleccion
  SinSeleccion --> Seleccionada: toca una camiseta (FR-010)
  Seleccionada --> Seleccionada: toca otra no candidata o de otro partido, cambia de pestaña o toca el candado (FR-014, FR-019, FR-012, FR-017)
  Seleccionada --> SinSeleccion: toca un candidato (FR-013)
  Seleccionada --> SinSeleccion: toca la misma o fuera (FR-015, FR-016)
  Seleccionada --> SinSeleccion: se cierra la ventana o cambia el partido (FR-003, FR-019b, FR-034b)
  SinSeleccion --> Arrastrando: empieza un arrastre (FR-040)
  Seleccionada --> Arrastrando: empieza un arrastre (FR-046)
  Arrastrando --> SinSeleccion: suelta o cancela (FR-041 a FR-046)
```

### 9.1 Happy path scenarios

#### Scenario S-01 — Intercambio de puesto dentro del equipo por toque (covers FR-010, FR-011, FR-013, FR-020, FR-021, FR-030, FR-036, FR-070)

- **Given** un partido de Fútbol 8 "Por posición y puntaje" con la inscripción abierta y
  una sesión `admin` a 1200 px
- **And** en el Blanco, Juan tiene asignado DC (principal DC, secundaria LD, 7 en DC y 6
  en LD) y Pedro tiene asignado LD (principal LD, secundaria DC, 8 en LD y 5 en DC)
- **When** el administrador toca la camiseta de Juan
- **Then** la camiseta de Juan queda marcada como seleccionada y la de Pedro resaltada
- **And** no se resalta ningún jugador que no cubra DC o cuyo puesto Juan no cubra
- **When** el administrador toca la camiseta de Pedro
- **Then** Juan queda en LD y Pedro en DC, los dos en el Blanco
- **And** el total del Blanco baja 4 puntos —lo que suman Juan y Pedro pasa de 15 (7 + 8)
  a 11 (6 + 5)— y la diferencia con el Negro se actualiza en el mismo repintado
- **And** la selección desaparece

**Variants:**

- `S-01a [boundary]` — la seleccionada es una dupla con un integrante que cubre LD y otro que no: Pedro (LD) es candidato, igual que lo sería para el motor (`FR-020`, `D-07`)
- `S-01b [failure]` — se toca un compañero que no es candidato: pasa a ser la seleccionada y no se intercambia nada (`FR-014`)
- `S-01c [failure]` — se vuelve a tocar a Juan: se cancela la selección (`FR-015`)
- `S-01d [failure]` — se toca el fondo de la cancha: se cancela la selección (`FR-016`)
- `S-01e [failure]` — Juan no tiene candidatos: aparece "Nadie puede intercambiar puesto con Juan …" y no cambia nada (`FR-018`)
- `S-01f [boundary]` — Pedro tiene candado: el intercambio se aplica y Pedro sigue fijado (`FR-035`)
- `S-01g [boundary]` — se toca el candado de un compañero con Juan seleccionado: alterna el bloqueo y Juan sigue seleccionado (`FR-017`)
- `S-01h [boundary]` — un compañero tiene el mismo puesto asignado que Juan: no se resalta (`FR-023`)
- `S-01j [concurrency]` — entre el primer y el segundo toque el reparto cambia (otra sesión guarda y Pedro deja de ser candidato): el segundo toque no escribe nada, aparece "Ya no se puede intercambiar: el reparto cambió" y la selección se descarta (`FR-034`, `FR-034b`)
- `S-01k [concurrency]` — dos toques rápidos sobre Pedro: se aplica un solo intercambio, no dos
- `S-01l [property]` — para todo intercambio aplicado en un partido con puestos, cada unidad queda en un puesto que cubre (`FR-021`)
- `S-01m [property]` — la cantidad de unidades de cada equipo es la misma antes y después de todo intercambio (`FR-032`)

#### Scenario S-02 — Intercambio entre equipos en el celular (covers FR-012, FR-021, FR-031, FR-032)

- **Given** el mismo partido, una sesión `admin` a 360 px, la tarjeta en una columna y el
  Blanco a la vista
- **And** Lucas tiene asignado MC en el Blanco y declara MC y MD; Tomás tiene asignado MD
  en el Negro y declara MD y MC
- **When** el administrador toca a Lucas, cambia al Negro con el selector y toca a Tomás
- **Then** al cambiar de pestaña Lucas sigue seleccionado y Tomás aparece resaltado
- **And** después del segundo toque Lucas está en el Negro de MD y Tomás en el Blanco de MC
- **And** cada equipo conserva sus siete puestos de campo

**Variants:**

- `S-02a [boundary]` — el mismo gesto a 1200 px, con las dos canchas a la vista: los candidatos de los dos equipos se resaltan a la vez
- `S-02b [boundary]` — mismo puesto en equipos distintos (MC con MC): es candidato y el intercambio sólo cambia de equipo (`FR-023` no aplica entre equipos)
- `S-02c [boundary]` — la seleccionada es una dupla y el candidato un jugador suelto: los equipos quedan con distinta cantidad de personas y la misma de unidades (`FR-032`)
- `S-02d [failure]` — un jugador del Negro cubre MC pero Lucas no cubre su puesto: no se resalta
- `S-02e [failure]` — con Lucas seleccionado se cierra la inscripción: la selección desaparece y no queda ningún resaltado (`FR-003`)
- `S-02f [boundary]` — con Lucas seleccionado se toca "Intercambiar colores": se aplica y la selección se descarta (`FR-019b`)
- `S-02g [boundary]` — con Lucas seleccionado se toca una camiseta de otro partido: esa queda seleccionada y la de Lucas no (`FR-019`)

#### Scenario S-03 — El arrastre sobre una camiseta propia intercambia puestos (covers FR-040, FR-041, FR-042, FR-044, FR-046)

- **Given** el partido de `S-01`, una sesión `admin` a 1200 px
- **When** el administrador empieza a arrastrar la camiseta de Juan
- **Then** Pedro y los demás candidatos de los dos equipos aparecen resaltados
- **When** la suelta sobre Pedro
- **Then** el resultado es el mismo que en `S-01`

**Variants:**

- `S-03a [failure]` — la suelta sobre un compañero que no cubre DC: no cambia nada y aparece "{compañero} no juega de Defensor Central" (`FR-042`)
- `S-03b [failure]` — la suelta sobre una camiseta del otro equipo que no es candidata: no cambia nada y aparece el aviso; hoy ese intercambio se aplicaba (`D-08`)
- `S-03c [boundary]` — la suelta sobre la cancha del otro equipo: pase, Juan conserva DC (`FR-043`)
- `S-03d [failure]` — la suelta sobre la cancha propia o sobre sí misma: no cambia nada (`FR-044`)
- `S-03e [boundary]` — había una selección por toque al empezar el arrastre: se descarta (`FR-046`)
- `S-03f [failure]` — el arrastre se cancela: no cambia nada y no queda ningún resaltado
- `S-03g [boundary]` — a 360 px, la suelta sobre un candidato del propio equipo: el intercambio se aplica también en una columna
- `S-03h [concurrency]` — en el celular, un toque y el comienzo de un arrastre sobre la misma camiseta: se aplica un solo gesto, nunca los dos (`TC-003`, `A-01`). Se verifica a mano en un teléfono: el arnés de Playwright no reproduce el arrastre nativo táctil

#### Scenario S-04 — Un equipo sin arquero se resuelve regenerando (covers FR-050, FR-057)

- **Given** un partido de Fútbol 8 "Por posición y puntaje" en el que el arquero del
  Blanco pasó al Negro por un pase hecho a mano, y el Blanco quedó con el arco vacío
- **When** el administrador toca a un jugador del Blanco
- **Then** sólo se resaltan sus candidatos y el arco no aparece como destino
- **When** el administrador regenera
- **Then** el motor vuelve a ubicar los arqueros como hoy

**Variants:**

- `S-04a [boundary]` — el Blanco tiene un jugador con Arquero de secundaria y candado, que el motor no movió al arco ([index.html:3376](../../index.html#L3376)): al seleccionarlo, tampoco aparece el arco; sus candidatos son los de su puesto asignado (`FR-050`, `FR-021`)
- `S-04b [failure]` — se arrastra una camiseta del Blanco y se la suelta sobre su arco vacío: no cambia nada (`FR-044`, `FR-050`)
- `S-04c [boundary]` — en un partido "Solo por puntaje" sin arquero en el Blanco: el arco tampoco se ofrece (`FR-050`)
- `S-04d [property]` — para todo cambio de esta feature, la ventaja por no tener arquero fijo es la misma antes y después (`FR-057`)

#### Scenario S-05 — Partido "Solo por puntaje" (covers FR-024, FR-033, FR-045, FR-050)

- **Given** un partido "Solo por puntaje", una sesión `admin` a 1200 px
- **When** el administrador toca a un jugador del Blanco
- **Then** todas las camisetas del Negro se resaltan y ninguna del Blanco
- **When** toca a un jugador del Negro
- **Then** los dos cambian de equipo, cada uno se dibuja donde se dibujaba antes (la línea
  de su principal, o el arco si el motor lo marcó como arquero) y no se escribe ningún
  puesto asignado

**Variants:**

- `S-05a [boundary]` — se toca un compañero del Blanco: pasa a ser la seleccionada (`FR-014`); nunca se intercambia dentro del equipo
- `S-05b [boundary]` — el Blanco no tiene arquero: el arco no aparece como destino, ni al tocar ni al arrastrar (`FR-050`)
- `S-05c [boundary]` — el arrastre sobre una camiseta del Negro intercambia como hoy y sobre una del Blanco no hace nada (`FR-045`, `FR-045b`)

#### Scenario S-06 — Regenerar después de cambios manuales (covers FR-060, FR-061)

- **Given** un partido con puestos donde Juan y Pedro intercambiaron puesto y Juan tiene
  candado
- **When** el administrador regenera
- **Then** Juan sigue en el Blanco, y el motor arranca desde LD, su puesto guardado, como
  hace hoy con cualquier jugador con candado
- **And** Pedro, sin candado, queda donde lo ponga el motor

**Variants:**

- `S-06a [boundary]` — un arquero con candado y ARQ guardado: tras regenerar sigue en el arco de su equipo, como hoy (`FR-061`; [index.html:3364-3366](../../index.html#L3364-L3366))
- `S-06b [boundary]` — una dupla con candado intercambió puesto: tras regenerar sigue en su equipo (`FR-061`)

#### Scenario S-07 — El resumen después de un intercambio (covers FR-070, FR-071, FR-072)

- **Given** el partido de `S-01` recién generado, con el resumen sin dividir
- **When** Juan y Pedro intercambian puesto
- **Then** el resumen se parte en "Con tus cambios" y "Como lo armó el motor", porque el
  total del Blanco cambió (`FR-072b2` de `PANEL_ARMADO_SPEC.md`)
- **And** no aparece ningún texto que nombre el intercambio

**Variants:**

- `S-07a [boundary]` — un intercambio entre equipos de dos jugadores del mismo puesto y el mismo puntaje: el resumen no se divide

### 9.2 Edge cases

Ninguno sin escenario padre: los bordes viven como variantes en §9.1.

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Nadie fuera de `admin` ni fuera de la ventana edita (covers FR-002, FR-034, NFR-007, TC-040, TC-042)

- **Given** un partido con equipos generados y una sesión `jugador`
- **When** se toca una camiseta, o se invocan los manejadores nuevos desde la consola con
  identificadores válidos
- **Then** no se dibuja ninguna selección y no se escribe nada

**Variants:**

- `S-20a [failure]` — sesión `admin` con la inscripción cerrada: el toque es el de carga de resultado y nada de esta feature se dibuja ni se ejecuta (`FR-001`)
- `S-20b [failure]` — sesión `admin` con identificadores que no pertenecen al reparto o un `dataTransfer` arbitrario: no se escribe nada (`TC-042`)
- `S-20c [failure]` — sesión `admin` con un partido finalizado: no se escribe nada

#### Scenario S-21 — El nombre de un jugador se escapa (covers FR-018, FR-042, NFR-003, TC-041)

- **Given** un jugador cuyo nombre es `<img src=x onerror=alert(1)>`
- **When** aparece el aviso de `FR-042` con su nombre
- **Then** el nombre se ve como texto y no se ejecuta nada

**Variants:**

- `S-21a [failure]` — el aviso de `FR-018` ("Nadie puede intercambiar puesto con …"): se ve como texto

#### Scenario S-22 — La cancha con selección no rompe el layout (covers NFR-001, NFR-002, NFR-003, TC-033)

- **Given** un partido de Fútbol 9 con 18 titulares y una dupla
- **When** se selecciona una camiseta con candidatos en los dos equipos
- **Then** en cada ancho de `NFR-001` no hay scroll horizontal, nada sale del viewport,
  ninguna camiseta se superpone con otra y cada área tocable mide lo que fija `NFR-002`

**Variants:**

- `S-22a [boundary]` — 360 px, una columna, después de cambiar de pestaña con la selección viva
- `S-22b [boundary]` — 700 y 701 px, a los dos lados del paso de una a dos columnas

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

| Entity | Purpose | Key attributes (conceptual) | Lifecycle |
|---|---|---|---|
| Partido (existente) | El reparto de un partido | equipos, puesto asignado por jugador, bloqueados, ventaja por arquero | Ya existe. Esta feature escribe su puesto asignado |
| Selección (estado de pantalla) | El primer toque | partido, unidad | No se guarda (`TC-013`) |

#### 10.1.1 Entity-relationship diagram

No se introduce ninguna entidad ni atributo nuevo: el intercambio escribe el puesto
asignado, que ya existe, y la selección no se persiste. Por `MD-24` el diagrama
no es obligatorio.

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore (`data/partidos`) | La interfaz de guardar/leer existente | inbound / outbound | Sin cambios de reglas (`TC-002`) |

### 10.3 External APIs / events the feature exposes

Ninguno.

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios y variantes de §9 pasan (covers `FR-001` a `FR-072`).
- **AC-02** — Cada parte de la declaración de reemplazo está marcada como reemplazada en
  su documento de origen, con un enlace a esta Spec, en la misma rama. Revisión fila por
  fila: en el documento de origen, el ID o la sección de la columna "Parte" está
  seguido, en el mismo bloque, de una nota "Reemplazad…" que enlaza a
  `POSICIONES_DEL_JUGADOR_SPEC.md`. Se busca por ID, no por número de línea.
- **AC-03** — `D-18` a `D-31` figuran en la §10 del Concept Note y `OPEN-Q-02`, `-04`,
  `-06`, `-07`, `-08` figuran como resueltas allí.

### 11.2 Non-functional acceptance

- **AC-10** — `NFR-001` y `NFR-002` verificados por los escenarios nuevos de
  `tests/layout.test.js`, que se vieron fallar al menos una vez (`TC-033`).
- **AC-11** — `NFR-003` verificado en `tests/layout.test.js` (nombres accesibles,
  `aria-live`, señal no cromática presente en el DOM) y por revisión de código.
- **AC-12** — `NFR-004` verificado midiendo con `performance.now()` en Playwright.
- **AC-13** — `NFR-005` verificado registrando las claves escritas tras cada gesto, como
  ya hace `AC-14` de `ARRASTRE_SPEC.md`, incluida la ausencia de `equipos.sumaBlanco` y
  `equipos.sumaNegro`.
- **AC-14** — `NFR-006` verificado por revisión contra el design system.
- **AC-15** — `NFR-007` verificado invocando los manejadores con entradas arbitrarias.

### 11.3 Constraint compliance

- **AC-30** — `TC-001`: el diff no toca archivos de dependencias ni agrega `<script>`
  externos (revisión de código).
- **AC-31** — `TC-002`: el diff no agrega documentos a la interfaz de guardar/leer ni toca
  `firestore-rules.md` (revisión de código).
- **AC-32** — `TC-003`: el diff no agrega manejadores de `pointer` ni de `touch`
  (revisión de código con `grep`).
- **AC-33** — `TC-010`: un test verifica que la compatibilidad y "lugares sin cubrir"
  coinciden para un mismo par (unidad, puesto), con y sin duplas.
- **AC-34** — `TC-011`: revisión de que no hay cálculo nuevo y de que
  `tests/motor.test.js` pasa sin cambios.
- **AC-35** — `TC-012`: el diff no toca las funciones de estrategia del motor (revisión
  de código); `tests/motor.test.js` pasa sin cambios.
- **AC-36** — `TC-013`: revisión de que la selección no se escribe (cubierto además por
  `AC-13`).
- **AC-37** — `TC-020`: revisión de que cada estado tiene una señal no cromática.
- **AC-38** — `TC-030`: revisión contra el design system.
- **AC-39** — `TC-031`: `grep` de los IDs en strings de los tests, no en comentarios.
- **AC-40** — `TC-032`: `node tests/motor.test.js` pasa (detecta un `DECLARACIONES`
  desactualizado).
- **AC-41** — `TC-033`: el historial de la rama muestra el escenario fallando antes del
  arreglo.
- **AC-42** — `TC-040` a `TC-043`: `S-20`, `S-21` y sus variantes, y revisión de que
  ningún aviso ni nombre accesible nuevo incluye puntajes.

### 11.4 Negative / safety acceptance

- **AC-20** — `S-20` y sus variantes no producen ninguna escritura, verificado con el
  registro de claves escritas de `AC-13`.

### 11.5 Test & traceability obligations

- **AC-50** — Every scenario in §9 — including every enumerated variant (`S-NNa`, `S-NNb`, …) — has at least one runnable test referenced in the Plan's §12.1 *Scenario Traceability Matrix*, with the scenario or variant ID embedded via a **structurally-anchored** binding (a framework mark, an `it()` / `t.Run()` / `test_case` string argument, or a function-name binding with the §12.1 normalising regex — *not* in a comment or docstring; those false-match the `T-N.D8` grep gate). The §16 *AC coverage* matrix should also cite the scenarios or scenario ranges each `AC-*` aggregates, so the roll-up is readable — this half is **reviewer-checked, not mechanically gated**. Additionally, every scenario heading in §9 is followed by either a `Variants:` block enumerating its shifts or the explicit `Variants: none — single-path scenario` declaration. Mechanically enforced by Plan `T-N.D8` (variant → test binding via the anchored regex) **and** `T-N.D8b` (Variants-block structural presence) — both must pass.
- **AC-51** — Every NFR in §8 with a quantified target has a measurement test referenced in the Plan's §12 (typically §12.8 *Performance / load tests* or §12.4 *Integration tests*), with the NFR ID embedded similarly.
- **AC-52** — Every TC in §4 has a §11.3 compliance check AND a corresponding entry in the Plan's §12. Where the TC is mechanically verifiable, the §12 entry references the runnable verification with the TC ID embedded in the test name or tag. Where the TC is inherently non-mechanical, the §12 entry names the reviewer / review checklist that verifies it. Mechanically gated by Plan `T-N.D10` **and `T-N.D10b`**.
- **AC-53** — The change has at least one `IMP-*` row in the Plan's §12.2 *Impact Traceability* matrix for every materially-affected scope (`code` / `system` / `business` / `external`), at feature granularity, each with its scope, triggering Spec ID(s), bound risk, bound observability signal and mitigation task. Mechanically gated by Plan `T-N.D15`.
- **AC-54** — Every NFR in §8 with a quantified target has at least one `OBS-*` row in the Plan's §11 *Observability*, with the NFR ID embedded in the row's *Binds to* column. Mechanically gated by Plan `T-N.D16`.
- **AC-55** — Every direct and transitive dependency in the branch's committed lockfile passes a current-advisory-DB check with no unwaived advisory; any accepted advisory is an `R-*` row in the Plan's §14. A branch with no lockfile declares `Supply-chain: none — <reason>` in Plan §5 and satisfies this vacuously (el repositorio no versiona lockfile, `AGENTS.md` § Dependencias). Mechanically gated by Plan `T-N.D20`.

## 12. Success metrics

La aplicación no tiene telemetría de uso; la fuente es el uso del propietario.

| Metric | Target | Measurement |
|---|---|---|
| Correcciones fuera de la aplicación | Ninguna en los 4 partidos siguientes al lanzamiento | Testimonio del propietario |
| Reportes de "el arrastre dejó de funcionar" por intercambios rechazados (`D-08`) | Ninguno en 30 días | Mensajes del grupo al propietario |
| Coincidencia de la cancha con lo jugado | La cancha del partido finalizado coincide con lo que se jugó en los 4 partidos siguientes | Revisión del propietario al cargar el resultado |

## 13. Dependencies

- **Upstream services / specs:** `equipos-en-el-campo` (Concept Note y rebanadas 1, 2, 3
  y 6), `desglose-posiciones`, `008-duplas-rotacion`, `009-ventaja-sin-arquero`,
  `intercambiar-colores`, `007-permisos-por-usuario`.
- **Internal modules / teams:** el recálculo vigente y la ruta de escritura del arrastre
  (`TC-011`); el criterio de cobertura del motor (`TC-010`).
- **Feature flags / config:** ninguno. "Ventaja para el equipo sin arquero fijo" se lee,
  no se cambia.
- **Third-party APIs:** Cloud Firestore, sin cambios.

## 14. Assumptions

- **A-01** — El `click` sobre una camiseta arrastrable se distingue del arrastre nativo
  en los dos navegadores móviles del grupo sin que se disparen los dos. `A-03` de
  `CARGA_POR_TOQUE_SPEC.md` lo supuso, pero allí toque y arrastre nunca coexisten en el
  mismo estado: el código lo garantiza hoy haciéndolos excluyentes
  ([index.html:5258-5262](../../index.html#L5258-L5262)), y esta feature los hace
  coexistir. `[UNVERIFIED — no se probó en un teléfono con los dos gestos activos a la
  vez; se verifica a mano en el Plan]`
- **A-02** — La camiseta ya mide al menos 44×44 px en todos los anchos medidos.
  `[UNVERIFIED — OPEN-Q-02 de CANCHA_SPEC.md da 48-56 px de ancho; el alto no se midió]`
  Si no se cumple, `NFR-002` obliga a agrandar el área tocable, no la camiseta.
- **A-03** — Totales, diferencia por línea y lugares sin cubrir leen el puesto asignado
  en vivo. Verificado en código: `balanceLineasVigente`
  ([index.html:5863-5870](../../index.html#L5863-L5870)) pasa `eq.posicionAsignada`,
  `sumaVigenteDeEquipo` suma `valorDePuntaje`, que lee `posicionAsignadaDe`
  ([index.html:5052-5070](../../index.html#L5052-L5070)), y `faltantesDeFormacionVigente`
  filtra por `posicionAsignadaDe` ([index.html:5980](../../index.html#L5980)). Confirma el
  `[INFERRED]` de §7.2 del Concept Note.
- **A-04** — *Retirado el 2026-10-29* (`D-31`): trataba del lugar de campo que dejaba el
  arquero puesto a mano.
- **A-05** — *Retirado el 2026-10-29* (`D-31`): la feature ya no escribe en
  `data/partidosArmado`.
- **A-06** — Un solo administrador edita un partido a la vez (`Roadmap.md` §3).
- **A-07** — Ningún partido en la ventana de edición tiene puestos del catálogo viejo: generar
  o regenerar exige revisar antes las fichas con puestos viejos
  ([index.html:4676](../../index.html#L4676), [index.html:1619-1620](../../index.html#L1619-L1620)),
  y el catálogo cambió el 2026-09-30. `[UNVERIFIED — no se consultó la base de datos;
  el Plan lo verifica contra los partidos abiertos]`

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| El arrastre al otro equipo empieza a rechazar intercambios que hoy se aplican (`D-08`) | Med | Med | `FR-040` resalta los candidatos al empezar; `FR-042` explica el rechazo; `S-03b` |
| Toque y arrastre sobre la misma camiseta se disparan juntos en el celular | High | Med | `TC-003`, `S-03h`; y la verificación manual en un teléfono que exige `A-01` |
| En una columna, la selección viva no se nota al cambiar de pestaña | Med | Med | `FR-012`, `NFR-003` (dos señales), `S-22a` |
| El toque del candado se confunde con el de la camiseta | Med | Med | `FR-017`, `NFR-002`, `S-01g` |
| Un nombre sin escapar en un aviso, un `title` o un nombre accesible (`CWE-79`) | Med | Low | `TC-041`, `S-21` y sus variantes |
| La palabra "intercambio" se confunde con "intercambiar colores" | Low | Med | Glosario; los avisos dicen "intercambiar puesto" |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-02 | ~~Regenerar con cambios manuales~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-18` (`FR-060`, `FR-061`) |
| OPEN-Q-03 | ¿Cómo se selecciona e intercambia con el teclado? | Lucas Manoukian | Post-launch | Heredada del Concept Note; WCAG 2.1.1; `Roadmap.md` §2 |
| OPEN-Q-04 | ~~Resaltar durante el arrastre~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-19` (`FR-040`, `FR-042`) |
| OPEN-Q-05 | ¿Con qué tokens se dibujan la seleccionada y los candidatos? | Lucas Manoukian | Implementation Plan | Heredada del Concept Note; `TC-020`, `TC-030` |
| OPEN-Q-06 | ~~Puestos del catálogo viejo~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-20`; dejó de aplicar el 2026-10-29 (`D-32`, `A-07`) |
| OPEN-Q-07 | ~~Puesto anterior: derivar o guardar~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-21` (`TC-002`, `TC-043`); `D-21` retirada el 2026-10-29 por `D-31` |
| OPEN-Q-08 | ~~Arco vacío en "Solo por puntaje"~~ | Lucas Manoukian | — | Resuelta el 2026-10-28 por `D-22`, retirada el 2026-10-29: la feature no ocupa el arco vacío (`D-31`) |
| OPEN-Q-09 | ¿Con qué componente se muestra el aviso, cuánto dura y dónde aparece a 360 px? | Lucas Manoukian | Implementation Plan | La aplicación ya tiene un aviso emergente (`.toast`, [index.html:1114-1124](../../index.html#L1114-L1124); su temporizador en [index.html:1937](../../index.html#L1937)) y el design system define `Toast` (`components/feedback/Toast.prompt.md`). Corregido el 2026-10-29: la primera versión decía que no existía |
| OPEN-Q-10 | ~~Cómo se dibuja el destino del puesto anterior~~ | Lucas Manoukian | — | Dejó de aplicar el 2026-10-29: no hay destino de vuelta (`D-31`) |
| OPEN-Q-11 | `PANEL_ARMADO_SPEC.md` repite el ID `S-05j` (l. 805-806) | Lucas Manoukian | Spec revision de `PANEL_ARMADO_SPEC.md` | Ajena a esta feature; se anota para no perderla |
| OPEN-Q-12 | ~~¿`FR-061` conserva el puesto de una dupla con candado o de un puesto del catálogo viejo?~~ | Lucas Manoukian | — | Resuelta el 2026-10-29 por `D-31`: el candado conserva el equipo y no el puesto, como dice la Spec del motor; `S-06b` lo verifica; los puestos viejos dejaron de aplicar (`D-32`) |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** every FR-* (§7), every NFR-* (§8), every TC-*
  (§4), every AC-* (§11 — including `AC-50` a `AC-55` in §11.5), every Concept Note
  constraint inherited in §3.3, y la declaración de reemplazo del encabezado.
- **Commonly drifted from in this codebase:** escribir `posicionAsignada` desde una ruta
  nueva en vez de extender `intercambiarUnidades` (`TC-011`); calcular la compatibilidad
  en la vista (`TC-010`); agregar manejadores `pointer`/`touch` para separar toque de
  arrastre (`TC-003`); poner la guarda de rol sólo en el render (`TC-040`).
- **Plan has freedom over:** module layout, nombres de funciones nuevas (las que nombran
  `TC-010` y `TC-011` se reutilizan sin renombrar), cómo se representa la selección en
  memoria, cómo se dibuja cada estado (dentro de `TC-020`/`TC-030`), y test framework
  details within the existing Node tests.
- **Plan must resolve:** `OPEN-Q-05`, `OPEN-Q-09`; y cómo se
  satisface `AC-54` sin telemetría de uso (§12), por ejemplo con las mediciones de
  Playwright como señal.
- **Plan must carry the verification debt** of `A-01`, `A-02` and `A-07`
  (`[UNVERIFIED]`).
- **Replacements already marked** in their source documents (`AC-02`) on the
  `docs/posiciones-del-jugador` branch on 2026-10-29; the Plan keeps them in sync if this
  Spec changes.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | Revisión corta del propio autor sobre los cambios de `fb880df..f85689d`, a pedido del propietario. Self-critique (Step 5, sólo sobre ese diff): passed (0🔴 / 1🟡 / 3🔵), todos resueltos: `FR-042` no decía qué pasa al soltar sobre un compañero del mismo puesto (no es candidato por `FR-023` y ninguno de `FR-042b` a `FR-042d` aplica; ahora: sin aviso); `FR-034b` se acota al toque; `S-03h` se declara de verificación manual; el encabezado menciona la nota en `CARGA_POR_TOQUE_SPEC.md`. Verificado en el código que el control de `A-07` está en `__generarEquipos` ([index.html:4670-4676](../../index.html#L4670-L4676)). |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | Atiende la crítica [`POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5.md) (1🔴 / 2🟡 / 2🔵) y la de [`…_claude-haiku-5-5.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-haiku-5-5.md) (0🔴 / 5🟡 / 7🔵; no leyó el Concept Note ni las críticas previas ni hizo los chequeos pedidos, así que sólo se tomaron sus hallazgos verificados). El 🔴 de claude-sonnet-5 (`FR-061` falso para puestos del catálogo viejo, verificado en [index.html:3105-3111](../../index.html#L3105-L3111)) deja de aplicar por `D-32`, decisión del propietario: la feature no contempla puestos viejos, porque generar exige revisar las fichas ([index.html:4676](../../index.html#L4676)); queda como supuesto `A-07` `[UNVERIFIED]`. Se retiran `D-20`, `S-01i`, `S-06c` y la mención en §3.1 y el glosario; `FR-061` cita `FR-015` de la Spec del motor (l. 288). Se restituye "Arco vacío" en el glosario. Nuevas `FR-034b` (aviso "Ya no se puede intercambiar: el reparto cambió", texto aprobado por el propietario), `FR-042b` a `FR-042d`, `FR-045b`, `FR-045c` y `S-03h` (toque y arrastre a la vez). El diagrama de §9 suma `FR-019`, `FR-019b` y `FR-034b`; `NFR-002` cita su origen; §17 aclara que las funciones de `TC-010`/`TC-011` no se renombran; encabezado con fecha de última revisión. Pendientes de claude-fable-5-1: el 3 se resuelve (aviso del encabezado con `CANCHA_SPEC.md`), el 11 se resuelve (`FR-042` partido), el 12 se resuelve (nota en el glosario de `CARGA_POR_TOQUE_SPEC.md`); el 6 y el 7 no estaban pendientes: dejaron de aplicar con `D-31`, como señaló claude-sonnet-5. No se tomaron de claude-haiku-5-5: quitar `TC-001`, `TC-030` a `TC-032` (son recordatorios de `AGENTS.md` que gatean `AC-30`, `AC-38` a `AC-40`), unificar `TC-020` con `NFR-003` (uno es la norma y el otro la mide) y traducir `AC-50` (texto del template). Self-critique: skipped |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario, tras la crítica de claude-fable-5-1 ([`POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-fable-5-1.md), 0🔴 / 5🟡 / 8🔵): la feature deja de ocupar el arco vacío (`D-31`). Un equipo sin arquero se resuelve regenerando, como hoy, y la idea de ocuparlo a mano pasa a `Roadmap.md`. Se retiran `FR-047` a `FR-049`, `FR-050b`, `FR-051` a `FR-056`, `FR-058`, `FR-058b`, `FR-059`, `FR-062`, `FR-063`, `US-05`, `A-04`, `A-05` y el glosario del arquero puesto a mano; `FR-050` pasa a decir que el arco vacío no se ofrece; `TC-002`, `TC-042` y `TC-043` dejan de hablar de un dato nuevo en `data/partidosArmado`. Además, `FR-061` se corrige contra la Spec del motor (`003`, l. 231): el candado fija el equipo y no el puesto, lo que cierra `OPEN-Q-12`; y con candado y ARQ guardado el motor ya deja al arquero en el arco (hallazgo 1 de la crítica, verificado en [index.html:3364-3366](../../index.html#L3364-L3366)). `S-04` y `S-06` se reescriben con sus variantes; se retira `S-21b`. Con el arco vacío fuera, dejan de aplicar los hallazgos 1, 2, 4, 5, 8, 9 y 10 de esa crítica, y el 13 se resolvió en la nota de `FR-022` de `ARRASTRE_SPEC.md`; los 🔵 3, 6, 7, 11 y 12 quedan para la revisión siguiente. Self-critique: skipped |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario, que aclaró el alcance (`D-30`): no se cambia cómo el motor elige los arqueros ni cómo se calculan los puntajes; cuando nadie de un equipo ataja, el equipo rota el arco sin ningún criterio, y por eso nadie se pone en él. Se retira el arquero improvisado: sólo quien cubre el ARQ puede ocupar el arco vacío (`FR-050`, nueva `FR-050b`), como arquero manual que guarda su puesto anterior para volver (`FR-051`, `FR-053`) y que se valúa con el cálculo de hoy (`FR-056` reescrito). Se retiran `FR-022`, el valor especial (`D-15`, `D-25`), el arco en "Solo por puntaje" (`D-22`, `D-26`; `FR-052` pasa a decir que no se ofrece), el aviso propio (`FR-059` reescrito) y el arquero de arranque (`D-29` en parte). `TC-011`, `AC-34` y `A-03` vuelven a no pedir una función de valor propia; la fila de `FR-021` de `ARRASTRE_SPEC.md` sale de la declaración de reemplazo. Las variantes de `S-04` se reescriben y reordenan (`S-04a` a `S-04s`), las de `S-05` quedan en `S-05a` a `S-05c` y se retira `S-21c`: la Spec es borrador y ningún documento posterior las usa; la crítica del 2026-10-29 cita los IDs anteriores. Self-critique: skipped (cambio acotado a pedido explícito) |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario (`D-29`, enmienda en parte `D-28`): cuando nadie de un equipo ataja, el equipo rota el arco, así que quien arranca en él no es "el arquero". "Arquero elegido" se reemplaza por dos términos: **arquero manual** (cualquiera que el administrador puso en el arco vacío; guarda su puesto anterior para volver, ataje o no) y **arquero de arranque** (un arquero manual que no cubre el ARQ: el `title` dice que arranca y que el equipo rota, y sólo a él se aplica el valor de `FR-056`). Que el motor ya modela al equipo sin arquero como uno que rota está en el código ([index.html:1778](../../index.html#L1778), [index.html:3159-3162](../../index.html#L3159-L3162), [index.html:6263](../../index.html#L6263)). Cambian el glosario, `FR-051`, `FR-052`, `FR-055`, `FR-059`, `NFR-005`, `S-04`, `S-04t`, `S-04v`; el resto de las menciones toma el término que le corresponde. En las filas anteriores de este Change log, "arquero elegido" se lee "arquero manual". Self-critique: skipped (cambio acotado a pedido explícito) |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario, se prioriza a quien juega de arquero (`D-28`, enmienda en parte `D-14`): si en el equipo alguien cubre el ARQ, el arco vacío sólo se le ofrece a él y lo ocupa como arquero común, sin registro; un jugador que no lo cubre sólo va al arco si nadie del equipo lo cubre. El motor ya prioriza así al generar (estrategias 1 a 4, [index.html:3218-3226](../../index.html#L3218-L3226), [index.html:3370-3384](../../index.html#L3370-L3384)), pero el arco puede quedar vacío con alguien que lo cubre: si ese jugador tiene candado (el motor no lo mueve) o tras un pase. Cambian `FR-047`, `FR-050` a `FR-052`, el glosario y el *Given* de `S-04`; `S-04t` se reescribe (sólo se da tras un pase); nuevas `S-04u` a `S-04w`. Self-critique: skipped (cambio acotado a pedido explícito) |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | Atiende la revisión [`POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md`](./POSICIONES_DEL_JUGADOR_SPEC_CRITIQUE_2026-10-29_claude-sonnet-5-5.md) (2🔴 / 9🟡 / 7🔵). Los dos 🔴 se verificaron en el código antes de corregirlos y se cerraron con decisiones del propietario: el arquero elegido cuenta en el Arco de la diferencia por línea con el mismo valor que en el total, resuelto en una sola función (`D-25`, `TC-011`, `FR-056`, `A-03`); en "Solo por puntaje" el arco se ocupa con la marca de dibujo existente (`D-26`, glosario, `FR-052` a `FR-054`, `NFR-005`). Los 🟡: total de `S-01`; ruling de `CWE-863`, `TC-040` y `TC-043` con el documento real de cada campo; `FR-056` acotado a "con puestos"; `S-04f` reescrita; registro huérfano (`FR-058b`, `S-04r`); arquero elegido con candado al regenerar (`D-27`, `FR-062`, `S-06a`) y dupla o catálogo viejo con candado (`S-06c`, `S-06d`, `OPEN-Q-12`); dupla seleccionada y en el arco (`FR-010`, `S-04s`); compañero que cubre el ARQ (`FR-055`, `S-04t`); `S-21` con tres variantes. Los 🔵: `FR-045` enumerado; fila de `sumaBlanco`/`sumaNegro`; `S-04i`; `AC-02` por ID; `S-01` de `ARRASTRE_SPEC.md` sumado a los reemplazos; diferidos de §14 y `Roadmap.md` en §3.2; `AC-54` en §17. No se tomó: partir el auto-lazo del diagrama de §9, porque dos auto-lazos sobre el mismo estado superponen sus rótulos (se juntaron por eso el 2026-10-28). Además, fuera de la revisión: `OPEN-Q-09` afirmaba que la aplicación no tiene aviso emergente y sí lo tiene. Self-critique (Step 5, sobre la versión corregida): passed (0🔴 / 3🟡 / 7🔵), todos resueltos: el glosario de "Arquero elegido" había quedado en contradicción con `FR-050`/`FR-051` (introducido en esta misma corrección); `FR-053` no decía adónde vuelve un arquero elegido sin puesto anterior válido, que `S-04k` usaba; la §10.1 no listaba todos los nacimientos y muertes del registro ni la marca de dibujo. Los 🔵: orden de `S-05g` y de `OPEN-Q-12`; *Then* de `S-05` (un arquero natural se dibuja en el arco); `FR-055` acotado a "con puestos"; `FR-059` visible sólo para `admin`; dos riesgos (el escapado en atributos y las dos escrituras). Verificado en el código lo que afirma `TC-043` y `FR-058b` sobre el guardado ([index.html:2351-2373](../../index.html#L2351-L2373)). |
| 2026-10-29 | Lucas Manoukian (claude-opus-5-5) | Cumple `AC-02`: cada fila de la declaración de reemplazo del encabezado queda marcada en su documento de origen (`ARRASTRE_SPEC.md`, `CANCHA_SPEC.md`, `PANEL_ARMADO_SPEC.md` y `EQUIPOS_EN_EL_CAMPO_CONCEPT.md`), con fecha y enlace a esta Spec, y con una fila en el Change log de cada uno. No cambia ningún requisito de esta Spec. Self-critique: skipped |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | Initial draft, derivada del Concept Note ya revisado por claude-sonnet-5-5. Resuelve `OPEN-Q-02`, `-04`, `-06`, `-07` y `-08` con respuestas del propietario del mismo día, registradas en el Concept Note como `D-18` a `D-23`. Declaración de reemplazo ampliada con el barrido completo de `CANCHA_SPEC.md` y `CARGA_POR_TOQUE_SPEC.md`. Self-critique: skipped. |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario, el arco vacío también se ocupa arrastrando (`D-24`): `FR-047`, `FR-048`, `S-04m` a `S-04o`, `S-05e`; se retira el non-goal que lo excluía y se suma a los reemplazos la segunda viñeta de §3.2 de `ARRASTRE_SPEC.md`. Self-critique: skipped. |
| 2026-10-28 | Lucas Manoukian (claude-opus-5-5) | A pedido del propietario, el arquero elegido también vuelve a su puesto anterior arrastrando (`D-24` ampliada): `FR-049`, `S-04p`, `S-04q`, `S-05f`; se retira el non-goal que quedaba. Self-critique: skipped. |

---

*This Spec defines what the system shall do, how it shall behave, and which solutions are
admissible. Concrete implementation choices (module layout, file paths, design patterns,
library picks within TC-* limits) live in
[POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md](./POSICIONES_DEL_JUGADOR_IMPLEMENTATION_PLAN.md).
Motivation and decision rationale live in
[POSICIONES_DEL_JUGADOR_CONCEPT.md](./POSICIONES_DEL_JUGADOR_CONCEPT.md).*
