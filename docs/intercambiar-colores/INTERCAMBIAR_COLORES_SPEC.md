# Intercambiar colores — Spec

> **Status:** Draft · **Date:** 2026-09-29 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [INTERCAMBIAR_COLORES_CONCEPT.md](./INTERCAMBIAR_COLORES_CONCEPT.md)
>
> **Implementation plan:** *not yet written*

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5 *Sources &
> Origins* del Concept Note. Donde un `FR-*`/`NFR-*`/`TC-*` se apoya en una ubicación de
> código, un contrato de componente o una Spec vigente que el Concept Note no cubre, la
> cita va **en línea** en la sección donde se define el requisito.

> **Declaración de reemplazo (gobernanza vigente en [`AGENTS.md`](../../AGENTS.md)).**
> Esta Spec reemplaza en parte a
> [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md)
> (rebanada 3 de `equipos-en-el-campo`), en tres puntos, todos sobre la cantidad y el
> orden de los botones de ícono del encabezado de la tarjeta:
>
> - **`D-24`** heredada en su §3.3 (línea 229; origen en
>   [`EQUIPOS_EN_EL_CAMPO_CONCEPT.md:513`](../equipos-en-el-campo/EQUIPOS_EN_EL_CAMPO_CONCEPT.md)):
>   "sólo Copiar y Regenerar suben al encabezado" pasa a ser "Intercambiar colores, Copiar
>   y Regenerar". La otra mitad de `D-24` —los botones de ciclo de vida siguen al pie— no
>   cambia.
> - **`FR-002b`** (línea 429), "Copiar primero y Regenerar después", queda reemplazado por
>   `FR-042` de esta Spec: Intercambiar, Copiar, Regenerar.
> - **`S-01`**, línea *Then* (línea 707), "la píldora de diferencia, un botón de copiar y un
>   botón de regenerar, en ese orden", pasa a "la píldora de diferencia, un botón de
>   intercambiar colores, un botón de copiar y un botón de regenerar, en ese orden".
>
> **No reemplaza** —y lo declara para que no se lea como contradicción— a
> [`ARRASTRE_SPEC.md`](../equipos-en-el-campo/rebanada-2-arrastre/ARRASTRE_SPEC.md):
> `NFR-005` acota los campos que escribe *un movimiento* de jugadores, `FR-040` prohíbe *el
> arrastre* en modo de carga y `TC-035` declara el equipo visible como estado de pantalla.
> Intercambiar colores no es un movimiento ni un arrastre, tiene su propio conjunto de
> campos (`NFR-004`), coincide con `FR-040` en no estar disponible en modo de carga
> (`FR-002`), y cambia el equipo visible sin persistirlo (`FR-035`), respetando `TC-035`.
> Tampoco reemplaza a `FR-003` de
> [`006-copiar-formacion/spec.md`](../006-copiar-formacion/spec.md): el texto copiado sigue
> rotulando cada equipo por su color; lo que cambia es qué jugadores tiene cada color.
> Esto cierra `OPEN-Q-04` del Concept Note.

## 1. Purpose

Esta Spec define el comportamiento de la acción "Intercambiar colores": cuándo está
disponible y para quién, qué datos del partido cambia y cuáles no, cómo se ve el botón,
y qué muestra la pantalla después. Está escrita para quien implemente y pruebe la
feature. No cubre la motivación ni las alternativas descartadas (ver Concept Note §2 y
§9) ni el detalle de funciones, archivos y ramas, que vive en el Implementation Plan.

## 2. Summary

Cuando el motor genera los equipos, el color de cada uno sale del reparto. Esta feature
agrega al encabezado de la tarjeta de equipos un botón de ícono que, con un toque, hace
que el grupo que era el Equipo Blanco pase a ser el Negro y viceversa, sin mover a ningún
jugador. Junto con los jugadores se invierten todos los datos que la generación guardó
por color —sumas de puntaje, balance por línea, formación y equipo compensado por falta
de arquero—, así la píldora, el desglose por línea y "Por qué quedaron así" siguen
diciendo la verdad con los colores nuevos. El botón es sólo para el administrador, sólo
mientras la inscripción está abierta, sin confirmación, y tocarlo de nuevo lo deshace.
El producto sigue siendo el mismo organizador de partidos: el motor no cambia y el
reparto que armó sigue siendo el suyo.

## 3. Scope

### 3.1 In scope

- Botón de ícono "Intercambiar colores" en el encabezado de la tarjeta de equipos.
- Condiciones de disponibilidad por rol y por estado del partido.
- Inversión de las listas de jugadores y de los campos de la generación indexados por
  color.
- Guardado y repintado inmediatos.
- Comportamiento del selector de equipo visible en una columna.
- Orden de los tres botones de ícono del encabezado (declaración de reemplazo arriba).

### 3.2 Out of scope / non-goals

Restatean los non-goals del Concept Note §4 como límites verificables.

- El sistema no ofrecerá colores distintos de Blanco y Negro, ni nombres de equipo
  personalizados.
- El sistema no moverá, agregará ni sacará a ningún jugador de un equipo al intercambiar
  colores, ni rebalanceará puntajes.
- El sistema no permitirá que el rol `jugador` intercambie colores.
- El sistema no narrará el intercambio en el resumen de generación ni lo tratará como una
  regla o estrategia del motor.
- El sistema no ofrecerá el intercambio en un partido finalizado (diferido, Concept Note
  §14).

### 3.3 Constraints inherited from the Concept Note

- **D-01** (cambia el nombre del equipo, no su composición) — heredada. Ver `FR-010`,
  `FR-011`, `FR-011b`.
- **D-02** (se invierten todos los campos de la generación indexados por color) —
  heredada. Ver `FR-012` a `FR-017`.
- **D-03** (sólo `admin`, también dentro del manejador) — heredada. Ver `FR-004`,
  `FR-005`, `TC-040`.
- **D-04** (disponible con equipos generados e inscripción abierta; no en modo de carga,
  finalizado ni editando un resultado; vuelve al reabrir) — heredada. Ver `FR-001` a
  `FR-003`, `FR-006`.
- **D-05** (botón de ícono en el encabezado, patrón `.panel-icono`) — heredada. Ver
  `FR-040` a `FR-043`, `TC-011`.
- **D-06** (sin confirmación; repetir deshace) — heredada. Ver `FR-018`, `FR-019`.
- **D-07** (no se anota ni se narra) — heredada. Ver `FR-034`, `TC-012`.
- **D-08** (se guarda en el acto con el guardado de siempre, en los dos documentos) —
  heredada. Ver `FR-020`, `FR-021`, `TC-001`, `TC-041`.
- **D-09** (el motor no cambia; la regeneración parte de los colores vigentes) —
  heredada. Ver `FR-050`, `TC-010`.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — El intercambio se persistirá a través del mismo guardado que usan las
  demás acciones sobre un partido (`saveMatches()`,
  [index.html:2150-2179](../../index.html#L2150-L2179)), que a su vez pasa por la
  interfaz `window.storage`; no se escribirá en Firestore por otro camino (principio de
  Arquitectura desacoplada de `AGENTS.md`).
- **TC-002** — La feature no agregará ninguna dependencia. El ícono se incrustará como
  SVG en línea, igual que `ICON_COPIAR` e `ICON_REGENERAR`
  ([index.html:5782-5784](../../index.html#L5782-L5784)).

### 4.2 Architectural / integration constraints

- **TC-010** — Las funciones del motor de generación (`generarEquiposEstrategia1` a `4`,
  `resolverArqueros`, `window.__generarEquipos`) no se modificarán (`D-09`).
- **TC-011** — El botón vivirá en el encabezado de tarjeta que ya existe
  (`renderEncabezadoTarjeta`, [index.html:5815-5838](../../index.html#L5815-L5838)), con
  el patrón `.panel-icono` ([index.html:792-806](../../index.html#L792-L806)), y no en un
  contenedor nuevo.
- **TC-012** — No se persistirá ningún campo que registre que los colores fueron
  intercambiados (`D-07`; alternativa rechazada en Concept Note §9.1).

### 4.3 Compliance / regulatory constraints

*Ninguna* — ver Concept Note §5.2, sin datos regulados.

### 4.4 Conventions to follow

- **TC-030** — Los valores visuales del botón (color, trazo, tamaño, radio, transición)
  saldrán de los tokens y del patrón ya usados por Copiar
  ([`handoff/README.md` § Botones de ícono del header](../equipos-en-el-campo/handoff/README.md)),
  y el glifo partirá de la iconografía del design system, Lucide 0.544.0
  (`.claude/skills/football-app-design/guidelines/iconography.card.html:1`).
  **Excepción documentada al design system (`AGENTS.md`, principio Design system, paso
  3):** el glifo es `shirt` de Lucide 0.544.0 —que ya figura en esa iconografía— con su
  mitad derecha rellena de `currentColor`, recortada por el eje vertical del glifo, y el
  contorno intacto en trazo. Ni un glifo existente (paso 1) ni una combinación de tokens
  (paso 2) alcanzan: `arrow-left-right` se confundía con Regenerar a 16 px, y la camiseta
  sin relleno no dice "blanco y negro". El relleno usa el mismo color que el trazo, así
  que no introduce ningún color, radio ni trazo nuevo. La mitad clara a la izquierda y la
  oscura a la derecha repiten el orden en que la app muestra los equipos (Blanco a la
  izquierda, Negro a la derecha) en el panel del partido activo
  (`renderTeamsSectionImpl`, [index.html:6098-6135](../../index.html#L6098-L6135)) y en el
  orden de las pestañas en una columna ([index.html:5032](../../index.html#L5032)). Elegida
  por el owner el 2026-09-29 entre cinco alternativas.
- **TC-031** — Todo test que verifique un `FR-*`/`NFR-*`/`TC-*`/`S-*` de esta Spec
  embeberá su identificador en forma canónica dentro de un literal de cadena, con el
  prefijo de feature `colores/` en los escenarios de `tests/layout.test.js`
  (`AGENTS.md` § Tests).
- **TC-032** — El escenario responsive del encabezado con tres botones se agregará a
  `tests/layout.test.js` y se verá fallar al menos una vez antes de darlo por bueno
  (`AGENTS.md`, principio Responsive).

### 4.5 Security constraints (`MD-31`)

CWE Top 25 consultado en vivo el 2026-09-29: edición 2025
(`https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html`).

- **TC-040** — La acción comprobará dentro de su propio manejador que el rol de la sesión
  sea `admin` y que el partido esté en un estado que la admite (`FR-001`), antes de
  modificar nada, y no sólo al decidir si dibuja el botón — mismo patrón que `aplicarDrop`
  ([index.html:5185-5187](../../index.html#L5185-L5187)) y `TC-040` de `PANEL_ARMADO_SPEC.md`,
  **defends `CWE-862` *Missing Authorization***.
- **TC-041** — Los campos de armado invertidos (`sumaBlanco`, `sumaNegro`,
  `balanceLineas`, `formacion`, `arquerosInfo`) se persistirán sólo en el documento de
  armado de escritura y lectura exclusiva de `admin`, nunca en el documento público
  (`CAMPOS_EQUIPOS_ARMADO`, [index.html:2154](../../index.html#L2154)),
  **defends `CWE-200` *Exposure of Sensitive Information to an Unauthorized Actor***.
- **`CWE-284` / `CWE-863`** — ruling, no commitment: que `jugador` pueda escribir
  `data/partidos` según las reglas es una condición preexistente
  ([`firestore-rules.md:65-75`](../rol-en-el-token/contracts/firestore-rules.md)), no
  introducida ni agravada por esta feature, que no toca las reglas (Concept Note §5.2).
- **`CWE-79` *XSS*** — no aplica: el botón sólo inserta literales fijos (ícono y nombre
  accesible); no inserta texto de jugador nuevo. El texto de jugador que se repinta ya
  pasa por el escapado existente (`AGENTS.md` § Estilo).
- **`CWE-352` *CSRF*** — no aplica: no hay endpoint propio con sesión por cookie; la
  escritura va por el SDK de Firestore con el token del usuario.
- **`CWE-20` *Improper Input Validation*** — no aplica: la acción no recibe entrada más
  allá del id del partido, que se resuelve contra la lista en memoria.
- Resto de la lista (`CWE-89`, `-787`, `-22`, `-416`, `-125`, `-78`, `-94`, `-120`, `-434`,
  `-476`, `-121`, `-502`, `-122`, `-306`, `-918`, `-77`, `-639`, `-770`) — no aplica: sin
  SQL, sin memoria manual, sin sistema de archivos, sin comandos, sin subidas, sin
  deserialización de datos no confiables, sin pedidos del servidor, y la acción exige
  sesión autenticada con rol.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador | Sesión con rol `admin`; arma y edita los equipos | Invertir los colores sin rearmar |
| Jugador | Sesión con rol `jugador`; ve los equipos | Ver de qué color juega |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero invertir los colores de los dos equipos con un toque, para respetar la preferencia de los jugadores sin rearmar los equipos. | FR-001, FR-010, FR-011, FR-011b, FR-020 |
| US-02 | Como administrador, quiero que después de intercambiar la píldora, el desglose y la explicación sigan siendo correctos, para no tener que interpretar datos cruzados. | FR-012 a FR-017, FR-030 a FR-034 |
| US-03 | Como administrador, quiero deshacer un intercambio tocando el mismo botón, para corregir un toque sin querer. | FR-018, FR-019 |
| US-04 | Como jugador, quiero ver el color nuevo de mi equipo, sin poder cambiarlo yo. | FR-004, FR-005, FR-036 |

## 6. Glossary

| Term | Definition |
|---|---|
| Intercambio de colores | La acción de esta Spec: el grupo de jugadores del Equipo Blanco pasa a ser el Equipo Negro y viceversa, sin que nadie cambie de compañeros. |
| Campo indexado por color | Dato de la generación guardado por separado para `blanco` y `negro`: las dos listas, `sumaBlanco`/`sumaNegro`, cada línea de `balanceLineas`, `formacion.blanco`/`negro`, y el valor de `arquerosInfo.equipoCompensado`. |
| Campo indexado por jugador | Dato guardado por id de jugador, que viaja con él: `posicionAsignada`, `posicionOverride`, `swaps`, `bloqueados`, la convocatoria y los eventos del resultado. |
| Receipt dividido | El bloque "Por qué quedaron así" separado en lo que se mide sobre el reparto en pantalla y lo que narra la última generación, que aparece sólo si el reparto se apartó de lo generado (`FR-072b` de `PANEL_ARMADO_SPEC.md`). |
| Equipo visible | En una columna, el equipo que muestra el selector de pestañas; es estado de pantalla (`TC-035` de `ARRASTRE_SPEC.md`). |
| Inscripción abierta | El partido tiene equipos generados, no tiene `inscripcionCerrada` y no está `Finalizado` (la negación del `locked` de [index.html:5817](../../index.html#L5817)). |

## 7. Functional requirements

### 7.1 Disponibilidad y acceso

- **FR-001** — Mientras el rol de la sesión sea `admin`, el partido tenga equipos
  generados y la inscripción esté abierta, el sistema mostrará en el encabezado de la
  tarjeta de equipos un botón de sólo ícono para intercambiar colores.
- **FR-002** — Mientras la inscripción del partido esté cerrada, el sistema no mostrará
  el botón de intercambiar colores.
- **FR-003** — Mientras el partido esté finalizado, incluso mientras se edita su
  resultado, el sistema no mostrará el botón de intercambiar colores.
- **FR-004** — Donde el rol de la sesión sea `jugador`, el sistema no mostrará el botón
  de intercambiar colores.
- **FR-005** — Si el rol de la sesión no es `admin` y la acción se invoca directamente,
  entonces el sistema no modificará el partido ni lo guardará (`TC-040`).
- **FR-006** — Si la acción se invoca directamente sobre un partido sin equipos
  generados, con la inscripción cerrada o finalizado, entonces el sistema no modificará el
  partido ni lo guardará (`TC-040`).

### 7.2 Qué cambia y qué no

- **FR-010** — Cuando el administrador toque el botón de intercambiar colores, el sistema
  hará que los jugadores del Equipo Blanco pasen a ser los del Equipo Negro, y los del
  Negro los del Blanco.
- **FR-011** — El sistema conservará, en el intercambio, el orden de los jugadores dentro
  de cada lista.
- **FR-011b** — El sistema conservará, en el intercambio, la composición de cada grupo:
  dos jugadores que eran compañeros siguen siéndolo, incluidos los dos integrantes de una
  dupla.
- **FR-012** — Cuando el sistema intercambie colores, invertirá `sumaBlanco` y
  `sumaNegro`.
- **FR-013** — Cuando el sistema intercambie colores y la generación tenga balance por
  línea, invertirá los valores de `blanco` y `negro` de cada línea.
- **FR-014** — Cuando el sistema intercambie colores y la generación tenga formación por
  equipo, invertirá `formacion.blanco` y `formacion.negro`.
- **FR-015** — Cuando el sistema intercambie colores y la generación tenga un equipo
  compensado por falta de arquero, cambiará `arquerosInfo.equipoCompensado` al otro
  color.
- **FR-016** — El sistema no modificará, al intercambiar colores, ningún campo indexado
  por jugador.
- **FR-017** — El sistema no modificará, al intercambiar colores, ningún otro campo de la
  generación: estrategia, snapshots, `configHash`, `cambios`, `esPrimeraGeneracion`,
  arqueros excedentes o por secundaria, y `enumeracionTruncada` quedan como estaban.
- **FR-018** — Cuando el administrador intercambie colores dos veces seguidas, el sistema
  dejará el partido idéntico a como estaba antes del primer intercambio.
- **FR-019** — El sistema aplicará el intercambio sin pedir confirmación.

### 7.3 Guardado y repintado

- **FR-020** — Cuando el sistema intercambie colores, guardará el partido en el acto, en
  el documento público y en el de armado (`TC-001`, `TC-041`).
- **FR-021** — Cuando el sistema intercambie colores, repintará la pantalla del partido
  con los colores nuevos sin que haga falta recargar.

### 7.4 Lo que muestra la pantalla después

- **FR-030** — Después de un intercambio, el sistema pintará las camisetas, los nombres de
  equipo y los totales de cada panel según el color nuevo de cada grupo.
- **FR-031** — Si el receipt no estaba dividido antes del intercambio, entonces el sistema
  no lo dividirá por el intercambio.
- **FR-032** — Después de un intercambio, la píldora de diferencia, el desglose por línea y
  cada frase de "Por qué quedaron así" que nombra un equipo nombrarán el color nuevo del
  grupo al que se refieren.
- **FR-033** — Después de un intercambio, el texto copiado con Copiar rotulará cada grupo
  con su color nuevo.
- **FR-034** — El sistema no mostrará ningún aviso, nota ni frase que diga que los colores
  fueron intercambiados.
- **FR-035** — Mientras la pantalla esté en una columna, cuando el administrador
  intercambie colores, el sistema cambiará el equipo visible al otro color, de modo que
  sigan a la vista los mismos jugadores, ahora con el color nuevo. El equipo visible no se
  persistirá (`TC-035` de `ARRASTRE_SPEC.md`).
- **FR-036** — Cuando un jugador abra el partido después de un intercambio ya guardado,
  el sistema le mostrará los colores nuevos.

### 7.5 El botón

- **FR-040** — El sistema dibujará el botón con la camiseta de Lucide 0.544.0 (`shirt`)
  con la mitad izquierda sin relleno y la mitad derecha rellena del color del trazo, y el
  contorno completo en trazo (excepción documentada en `TC-030`).
- **FR-041** — El sistema dará al botón el nombre accesible y el título "Intercambiar
  colores".
- **FR-042** — El sistema ordenará los botones de ícono del encabezado así: Intercambiar
  colores, Copiar y Regenerar. Reemplaza `FR-002b` de `PANEL_ARMADO_SPEC.md` (ver
  Declaración de reemplazo).
- **FR-043** — El sistema dará al botón de intercambiar el mismo peso visual que a Copiar;
  Regenerar sigue siendo la acción principal y el único ícono verde del encabezado
  (`FR-002c` de `PANEL_ARMADO_SPEC.md`).

### 7.6 Regeneración posterior

- **FR-050** — Cuando el administrador regenere los equipos después de un intercambio, el
  sistema mantendrá a cada jugador bloqueado en el color que tenía después del
  intercambio (comportamiento vigente del motor sobre `prevTeamOf`,
  [index.html:2783-2786](../../index.html#L2783-L2786)).

## 8. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Aplicar el intercambio —invertir, pedir el guardado y repintar— con un plantel de 18 titulares no supera los 150 ms medidos con `performance.now()` en el Chromium que `tests/layout.test.js` ya usa vía Playwright. Mismo techo que `NFR-004` de `ARRASTRE_SPEC.md`. |
| NFR-002 | Responsive | Con el botón nuevo en el encabezado, en 360 px, en cada breakpoint de CSS medido de los dos lados y en la franja de tablet, a la vez: (1) `scrollWidth === clientWidth` y (2) ningún elemento con el borde derecho fuera del viewport. |
| NFR-003 | Accessibility | El botón mide al menos 44 × 44 px de objetivo táctil —el tamaño de `.panel-icono`— y tiene un nombre accesible no vacío (WCAG 2.1, criterio 4.1.2). |
| NFR-004 | Compatibilidad de datos | El conjunto de campos escritos en el partido por un intercambio es exactamente `equipos.blanco`, `equipos.negro`, `equipos.sumaBlanco`, `equipos.sumaNegro`, `equipos.balanceLineas`, `equipos.formacion` y `equipos.arquerosInfo`, sin campos nuevos. |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — El administrador intercambia los colores (covers FR-001, FR-010, FR-011, FR-011b, FR-012, FR-013, FR-014, FR-016, FR-017, FR-019, FR-020, FR-021, FR-030)

- **Given** un partido de fútbol 8 con equipos generados por "Formación fija pareja" y la
  inscripción abierta
- **And** una sesión con rol `admin` en un viewport de 1200 px
- **When** el administrador toca el botón de intercambiar colores
- **Then** los jugadores que estaban en el Equipo Blanco están en el Negro y viceversa,
  cada lista en el mismo orden
- **And** `sumaBlanco` y `sumaNegro`, cada línea de `balanceLineas` y `formacion` quedan
  invertidos
- **And** los campos indexados por jugador y el resto de la generación no cambian
- **And** el partido se guarda y la pantalla se repinta con los colores nuevos, sin
  confirmación previa

**Variants:**

- `S-01a [property]` — para cualquier partido generado, cada par de jugadores que eran
  compañeros antes del intercambio siguen siéndolo después (`FR-011b`)
- `S-01b [property]` — para cualquier partido generado, intercambiar dos veces deja
  `m.equipos` y el resto del partido idénticos al original (`FR-018`)
- `S-01c [boundary]` — número impar de titulares: el grupo con un jugador más, que era el
  Blanco, pasa a ser el Negro
- `S-01d [boundary]` — un solo arquero en el partido: `arquerosInfo.equipoCompensado`
  pasa al otro color, y la frase "el Equipo X quedó sin arquero fijo" nombra al grupo que
  efectivamente no tiene arquero (`FR-015`, `FR-032`)
- `S-01e [boundary]` — el partido tiene una dupla: sus dos integrantes siguen en el mismo
  equipo (`FR-011b`)
- `S-01f [boundary]` — generación sin `balanceLineas` ni `formacion` (estrategias que no
  los producen): el intercambio no falla y esos campos siguen vacíos (`FR-013`, `FR-014`)
- `S-01g [boundary]` — hay jugadores bloqueados: siguen bloqueados, ahora en el otro
  color (`FR-016`)
- `S-01h [concurrency]` — dos toques seguidos antes de que termine el primer guardado: la
  pantalla y lo guardado terminan iguales al estado original (`FR-018`, `A-01`)

#### Scenario S-02 — Los números y la explicación siguen siendo correctos (covers FR-031, FR-032, FR-034)

- **Given** un partido generado cuyo receipt no está dividido
- **And** la píldora dice "Diferencia N pts" a favor del Equipo Blanco
- **When** el administrador intercambia los colores
- **Then** el receipt sigue sin dividirse
- **And** la píldora dice la misma diferencia a favor del Equipo Negro
- **And** ninguna parte de la pantalla dice que los colores se intercambiaron

**Variants:**

- `S-02a [boundary]` — el reparto ya se había modificado a mano (receipt dividido): sigue
  dividido, con el mismo contenido y los colores invertidos
- `S-02b [boundary]` — equipos parejos (diferencia 0): la píldora sigue diciendo "Equipos
  parejos"
- `S-02c [boundary]` — el desglose por línea decía "+N Blanco" en una línea: después dice
  "+N Negro" en esa línea

#### Scenario S-03 — El texto copiado sigue al intercambio (covers FR-033)

- **Given** un partido con equipos generados y los colores ya intercambiados
- **When** el administrador toca Copiar
- **Then** el texto copiado pone bajo `*Blanco* ⬜️` a los jugadores que ahora son el
  Equipo Blanco, y bajo `*Negro* ⬛️` a los que ahora son el Negro

Variants: none — single-path scenario.

#### Scenario S-04 — En el celular se siguen viendo los mismos jugadores (covers FR-035)

- **Given** una sesión `admin` en un viewport de 360 px, con el partido en una columna
- **And** el equipo visible es el Blanco
- **When** el administrador intercambia los colores
- **Then** el equipo visible pasa a ser el Negro
- **And** en la cancha están los mismos jugadores que se veían, con camiseta negra

**Variants:**

- `S-04a [boundary]` — el equipo visible era el Negro: pasa a ser el Blanco
- `S-04b [boundary]` — viewport en dos columnas: se ven los dos equipos y no hay equipo
  visible que cambiar
- `S-04c [boundary]` — se recarga la pantalla después del intercambio: el equipo visible
  vuelve al de siempre, sin haber guardado nada sobre él (`TC-035` de `ARRASTRE_SPEC.md`)

#### Scenario S-05 — El encabezado ofrece tres botones (covers FR-040, FR-041, FR-042, FR-043, NFR-002, NFR-003)

- **Given** un partido generado con la inscripción abierta y una sesión `admin` en 1200 px
- **When** se abre el detalle del partido
- **Then** el encabezado contiene la píldora de diferencia, el botón de intercambiar
  colores, el de copiar y el de regenerar, en ese orden
- **And** el botón de intercambiar muestra la camiseta con la mitad derecha rellena, se llama
  "Intercambiar colores" y tiene el mismo color que Copiar

**Variants:**

- `S-05a [boundary]` — a 360 px, con la píldora fuera del encabezado: la página no
  desborda y ningún botón queda fuera del viewport (`NFR-002`)
- `S-05b [boundary]` — a cada lado de cada breakpoint de CSS y en la franja de tablet: las
  mismas dos condiciones (`NFR-002`)
- `S-05c [boundary]` — el objetivo táctil del botón mide al menos 44 × 44 px (`NFR-003`)

#### Scenario S-06 — Regenerar después de intercambiar (covers FR-050)

- **Given** un partido generado con un jugador bloqueado en el Equipo Blanco
- **And** el administrador intercambió los colores, y el bloqueado quedó en el Negro
- **When** el administrador regenera los equipos
- **Then** el jugador bloqueado sigue en el Equipo Negro

**Variants:**

- `S-06a [boundary]` — sin jugadores bloqueados: la regeneración se comporta igual que sin
  intercambio previo

#### Scenario S-07 — El intercambio queda guardado para todos (covers FR-020, FR-036, NFR-004)

- **Given** el administrador intercambió los colores de un partido
- **When** un jugador abre ese partido
- **Then** ve a cada grupo con su color nuevo
- **And** no ve el botón de intercambiar colores

**Variants:**

- `S-07a [boundary]` — el conjunto de campos escritos por el intercambio es exactamente el
  de `NFR-004`
- `S-07b [boundary]` — los campos de armado invertidos se escriben en el documento de
  armado y no aparecen en el público (`TC-041`)
- `S-07c [failure]` — el guardado falla: el sistema se comporta como con cualquier otra
  edición del partido hoy (el error queda registrado y la pantalla muestra lo aplicado),
  sin manejo propio

### 9.2 Edge cases

Sin escenarios independientes: los casos borde viven como variantes de §9.1.

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Fuera de la inscripción abierta no se puede intercambiar (covers FR-002, FR-003, FR-006)

- **Given** un partido con equipos generados y la inscripción cerrada
- **And** una sesión `admin`
- **When** se abre el detalle del partido
- **Then** el encabezado no tiene el botón de intercambiar colores
- **And** si la acción se invoca directamente, el partido no cambia y no se guarda

**Variants:**

- `S-20a [failure]` — partido finalizado: no hay botón, y la invocación directa no cambia
  nada
- `S-20b [failure]` — se está editando el resultado de un partido finalizado: no hay
  botón, y la invocación directa no cambia nada
- `S-20c [failure]` — partido sin equipos generados: no hay botón, y la invocación
  directa no cambia nada
- `S-20d [boundary]` — se reabre la inscripción: el botón vuelve a estar (`FR-001`)

#### Scenario S-21 — Un jugador no puede intercambiar (covers FR-004, FR-005, TC-040)

- **Given** un partido generado con la inscripción abierta y una sesión `jugador`
- **When** se abre el detalle del partido
- **Then** el encabezado no tiene el botón de intercambiar colores

**Variants:**

- `S-21a [failure]` — la acción se invoca directamente con sesión `jugador`: el partido no
  cambia y no se pide ningún guardado

## 10. Data model & external contracts

No hay entidades nuevas: el intercambio reescribe campos existentes de `m.equipos`
([index.html:4251-4269](../../index.html#L4251-L4269)). Se omite el `erDiagram` de
§10.1.1 por criterio de `MD-24` (sólo es obligatorio con una entidad nueva o más).

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore `data/partidos` | Mismo JSON de hoy, sin campos nuevos | outbound | Listas `blanco`/`negro` |
| Cloud Firestore `data/partidosArmado` | Mismo JSON de hoy, sin campos nuevos | outbound | Sólo `admin` escribe (`TC-041`) |

### 10.3 External APIs / events the feature exposes

Ninguno.

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9 (S-01 a S-07, S-20, S-21 y sus variantes) pasan
  (covers FR-001 a FR-050).
- **AC-02** — La propiedad de `S-01b` (dos intercambios dejan el partido idéntico) pasa
  sobre partidos generados con cada una de las estrategias vigentes.

### 11.2 Non-functional acceptance

- **AC-10** — `NFR-001` verificado por una medición con `performance.now()` en Chromium.
- **AC-11** — `NFR-002` verificado por un escenario de `tests/layout.test.js` que se vio
  fallar antes del arreglo (`TC-032`).
- **AC-12** — `NFR-003` verificado midiendo el botón y su nombre accesible en el mismo
  escenario.
- **AC-13** — `NFR-004` verificado por un test que compara el partido antes y después del
  intercambio y enumera los campos distintos.

### 11.3 Constraint compliance

- **AC-15** — `TC-001`, `TC-002` verificados por revisión de código: el intercambio llama
  al guardado de siempre y no hay dependencias nuevas.
- **AC-16** — `TC-010` verificado por el diff: ninguna función del motor aparece
  modificada.
- **AC-17** — `TC-011`, `TC-030` verificados por revisión de código contra el patrón
  `.panel-icono` y el handoff.
- **AC-18** — `TC-012` verificado por el test de `AC-13`: no aparece ningún campo nuevo.
- **AC-19** — `TC-031`, `TC-032` verificados por el gate de IDs del Plan y por la
  evidencia de la corrida fallida del escenario responsive.
- **AC-21** — `TC-040` verificado por `S-20` y `S-21a` invocando la acción directamente.
- **AC-22** — `TC-041` verificado por `S-07b`.

### 11.4 Negative / safety acceptance

- **AC-23** — En `S-20`, `S-20a`, `S-20b`, `S-20c` y `S-21a` el partido queda idéntico y
  no se pide ningún guardado.

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 —incluida cada variante— tiene al menos un test
  referenciado en el §12.1 del Plan, con el ID embebido según `TC-031`. Todo encabezado de
  escenario en §9 va seguido de un bloque `Variants:` o de la declaración explícita
  `Variants: none — single-path scenario`.
- **AC-51** — Todo NFR cuantificado en §8 tiene un test de medición referenciado en el §12
  del Plan.
- **AC-52** — Todo TC de §4 tiene un chequeo en §11.3 y una entrada en el §12 del Plan.
- **AC-53** — El cambio tiene al menos una fila `IMP-*` en el §12.2 del Plan por cada
  alcance materialmente afectado (`code`/`system`/`business`/`external`).
- **AC-54** — Todo NFR cuantificado en §8 tiene al menos una fila `OBS-*` en el §11 del
  Plan.
- **AC-55** — El lockfile de la rama no tiene ningún advisory sin waiver, o el Plan
  declara `Supply-chain: none — <reason>` en su §5. El repositorio no versiona lockfile
  (`AGENTS.md` § Dependencias), así que se espera la declaración `none`.

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Cambios de color sin rearmar | El administrador cambia de color un equipo ya armado sin regenerar ni arrastrar | Observación directa (app de un solo grupo, sin telemetría) |
| Explicación coherente | Cero reportes de píldora o explicación del lado equivocado tras un intercambio | Feedback directo del grupo |

## 13. Dependencies

- **Upstream services / specs:** `CANCHA_SPEC.md`, `ARRASTRE_SPEC.md`,
  `PANEL_ARMADO_SPEC.md` (parcialmente reemplazada, ver Declaración de reemplazo),
  `006-copiar-formacion`, `007-permisos-por-usuario`, `rol-en-el-token`.
- **Internal modules / teams:** ninguno — proyecto de una persona.
- **Feature flags / config:** ninguno.
- **Third-party APIs:** ninguna nueva — Firebase ya en uso.

## 14. Assumptions

- **A-01** — Dos escrituras sucesivas del mismo cliente a Firestore se aplican en el
  orden en que se pidieron, así que dos toques rápidos terminan guardando el último
  estado (`S-01h`). `[UNVERIFIED — no se contrastó con la documentación del SDK de
  Firestore; el Plan debe confirmarlo o proponer un resguardo]`
- **A-02** — El color que usa Copiar (`--muted`) contra el fondo de la tarjeta alcanza el
  contraste de 3:1 que WCAG 2.1 pide para un componente de interfaz (criterio 1.4.11).
  `[UNVERIFIED — no se midió; si no alcanza, es un hallazgo preexistente que comparten
  Copiar e Intercambiar]`

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| Se olvida un campo indexado por color | Med | Med | `S-01b` como propiedad sobre todas las estrategias (`AC-02`) y `S-02` sobre el receipt |
| Algún texto nombra un color fijo en vez de leerlo del dato | Med | Low | `S-02`, `S-02c`, `S-01d` cubren cada superficie que nombra un color; `OPEN-Q-03` en el Plan |
| El encabezado no entra a 360 px con tres botones | Med | Low | `NFR-002`, `S-05a`, `TC-032` |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-03 | ¿Hay algún texto de la pantalla que nombre un color fijo en vez de leerlo del dato? | Lucas Manoukian | Implementation Plan | Heredada del Concept Note `OPEN-Q-03` |

Resueltas en esta Spec: `OPEN-Q-01` del Concept Note (`FR-035`, el equipo visible sigue a
los jugadores), `OPEN-Q-02` (`FR-040`, `FR-041`: camiseta con la mitad derecha rellena, "Intercambiar
colores") y `OPEN-Q-04` (Declaración de reemplazo al inicio).

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** FR-001 a FR-050, NFR-001 a NFR-004, TC-001 a
  TC-041, AC-01 a AC-55, las constraints heredadas en §3.3 y la Declaración de reemplazo.
- **Plan has freedom over:** los nombres de la función que invierte y del manejador, si la
  inversión es una función pura recortable por `tests/harness.js`, en qué archivo de
  `tests/` viven los tests unitarios, y el orden de commits.
- **Plan must resolve:** `OPEN-Q-03`; verificar `A-01` y `A-02`.
- **Plan must also:** anotar la parte reemplazada en `PANEL_ARMADO_SPEC.md` (`D-24`
  heredada, `FR-002b`, `S-01`) como exige `AGENTS.md`.
- **Unverified markers heredados:** `A-01`, `A-02`.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-29 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Self-critique: pending. |
| 2026-09-29 | Lucas Manoukian (claude-sonnet-5) | Corregidos los 4 hallazgos de `INTERCAMBIAR_COLORES_SPEC_CRITIQUE_2026-09-29_claude-sonnet-5.md`: `AC-20` renumerado a `AC-23` (coincidía en rango con `AC-19`/`AC-21` de otra sección); `NFR-005` eliminado por duplicar `TC-031` sin agregar una obligación propia (y su referencia en el §17 Handoff ajustada de `NFR-001 a NFR-005` a `NFR-001 a NFR-004`); la cita de `TC-030` que justificaba el orden del ícono reemplazada de `renderFilaResultado` (pantalla del partido finalizado, donde el botón no existe) a `renderTeamsSectionImpl` y el orden de pestañas (pantallas donde el botón sí vive); `FR-011` partido en `FR-011` (orden de las listas) y `FR-011b` (composición de cada grupo), con sus citas en §3.3, §5.2, `S-01`, `S-01a` y `S-01e` actualizadas. |

---

*This Spec defines what the system shall do, how it shall behave, and which solutions
are admissible. Concrete implementation choices live in
[INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md](./INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md).
Motivation and decision rationale live in
[INTERCAMBIAR_COLORES_CONCEPT.md](./INTERCAMBIAR_COLORES_CONCEPT.md).*
