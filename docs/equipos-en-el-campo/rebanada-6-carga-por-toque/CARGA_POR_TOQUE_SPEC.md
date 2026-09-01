# La carga por toque (rebanada 6 de "Equipos en el campo") — Spec

> **Status:** Draft · **Date:** 2026-09-01 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md)
>
> **Specs de las rebanadas anteriores:** [rebanada-1-cancha/CANCHA_SPEC.md](../rebanada-1-cancha/CANCHA_SPEC.md) ·
> [rebanada-2-arrastre/ARRASTRE_SPEC.md](../rebanada-2-arrastre/ARRASTRE_SPEC.md) ·
> [rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md](../rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md) ·
> [rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md](../rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md) ·
> [rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md](../rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md)
>
> **Implementation plan:** [CARGA_POR_TOQUE_IMPLEMENTATION_PLAN.md](./CARGA_POR_TOQUE_IMPLEMENTATION_PLAN.md)

> **Nota de gobernanza.** Esta Spec sigue viviendo en `docs/<feature>/`, como
> las cinco anteriores de esta misma feature, por la misma razón que la Spec
> de la rebanada 5 ya registró: `D-08`/`D-11` del Concept Note fijan que las
> siete rebanadas se especifican con este método, y cambiar de sistema a
> mitad de una feature en curso introduciría la inconsistencia que el
> Principio de simplicidad pide evitar.

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5
> *Sources & Origins* del Concept Note, en las Specs de las rebanadas 1 a 5, y
> en las secciones *Selector de evento*, *Filas de detalle* y *Carga de
> resultados* del handoff
> ([`handoff/README.md:384-420`](../handoff/README.md#L384-L420) y
> [`handoff/README.md:654-669`](../handoff/README.md#L654-L669)), que son la
> única fuente que fija la interacción de toque concreta. Donde un
> `FR-*`/`NFR-*`/`TC-*` se apoya en una ubicación del código que ninguno de
> esos documentos cubre, la cita va **en línea** en la sección donde se
> define el requisito. Las líneas de `index.html` citadas acá corresponden al
> estado del archivo después del merge de la rebanada 5 (`a1223bd`). Las citas
> al CWE Top 25 en §4.5 se verificaron en vivo contra
> [`cwe.mitre.org/top25/`](https://cwe.mitre.org/top25/) el 2026-09-01 (lista
> 2025, la vigente a esa fecha), a diferencia de las Specs de las rebanadas 4
> y 5, que quedaron `[UNVERIFIED — sin conexión]` en ese punto.

## 1. Purpose

Esta Spec define cómo un administrador **carga** el resultado de un partido
tocando las camisetas de la cancha, en vez de completar una grilla de
casillas numéricas. Es la sexta de las siete rebanadas de `D-08`, y la
primera que **expone** el modelo de eventos que la rebanada 5 construyó sin
efecto visible: el selector de tipo de evento, el toque que agrega un evento,
la pastilla que se actualiza en vivo, Deshacer y el botón `−` por familia.

No cubre *por qué* se rediseña la carga (Concept Note, `D-04`/`D-08`) ni el
modelo de datos subyacente, ya definido por completo en
[`MODELO_EVENTOS_SPEC.md`](../rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md).
No cubre cómo se escribe el código (Implementation Plan, todavía sin
escribir). No rediseña el arrastre entre equipos de la rebanada 2 —esta
rebanada es toque, no arrastre— ni el ciclo de vida del partido (Finalizar
partido / Editar resultado / Guardar cambios / Cancelar), que la rebanada 4
ya fijó como botones de texto al pie de la tarjeta y esta Spec hereda sin
tocar (`D-24`).

## 2. Summary

Hoy, cargar un resultado es completar hasta sesenta casillas numéricas: un
par ícono + input por jugador y por tipo de evento. Esta rebanada lo
reemplaza por tocar la cancha: arriba, un selector de cuatro opciones define
qué se está anotando —Gol, Penal, Gol en contra, Asistencia—; abajo, cada
toque sobre una camiseta agrega un evento de ese tipo a ese jugador, y una
pastilla aparece sobre la camiseta en el mismo lugar exacto donde la
rebanada 4 la muestra en modo lectura. Un toque de más se corrige con el
botón `−` de la fila correspondiente (saca el último evento de esa familia)
o con Deshacer (saca el último evento cargado, sea cual sea). El penal no es
un campo aparte: es un gol marcado como tal, así que nunca puede haber más
penales que goles.

La carga por toque no agrega una forma nueva de guardar: opera sobre el
mismo borrador en memoria (`resultadoDraft`) que ya existe, ahora respaldado
por una lista de eventos en vez de cuatro contadores, y se guarda con los
mismos botones que ya existen —"Finalizar partido" la primera vez, "Guardar
cambios" al editar un finalizado—. La aplicación sigue siendo, después de
esta rebanada, la misma que muestra la cancha para leer, para armar y para
cargar: una sola pantalla que el administrador aprende una vez.

## 3. Scope

### 3.1 In scope

- El selector de tipo de evento (Gol / Penal / Gol en contra / Asistencia) en
  la parte superior de la cancha en modo de carga.
- El toque sobre una camiseta como acción de carga: agrega un evento del tipo
  activo al jugador tocado, repetible sin límite.
- La pastilla de estadística en vivo sobre cada camiseta, idéntica en
  posición, ícono y tamaño a la que la rebanada 4 muestra en modo lectura.
- El botón `−` por fila de detalle, que saca el último evento de esa familia
  para ese jugador.
- Deshacer, que saca el último evento cargado en todo el borrador.
- El selector de equipo (pestañas Blanco/Negro) para cargar de a un equipo a
  la vez, reutilizando el patrón ya fijado por `D-21`.
- Extender `resultadoDraft` para que sostenga una lista de eventos (no
  contadores) mientras el modo de carga está abierto, tanto en la primera
  carga (partido cerrado, sin finalizar) como al editar un finalizado.
- La integración con los botones de pie ya existentes del ciclo de vida del
  partido, sin modificarlos.

### 3.2 Out of scope / non-goals

Restablece los non-goals del Concept Note, ya vigentes para toda la feature:

- El sistema no modifica el motor de generación de equipos, ni sus
  estrategias, ni sus reglas (`D-01`).
- El sistema no se convierte en administración del partido en tiempo real
  (cronómetro, cambios en vivo).
- El sistema no agrega estadísticas, rankings ni análisis nuevos.
- El sistema no soporta tamaños de cancha distintos de fútbol 8 y fútbol 9.
- El sistema no migra los partidos ya guardados antes de la rebanada 5 al
  modelo de eventos (`D-06`).

Y agrega los que esta Spec encontró al redactarse:

- El sistema no agrega un botón de ícono "Guardar" dentro de la cancha de
  carga: el handoff dibuja uno (`handoff/README.md:665`), pero `D-24` ya fijó
  que esta misma tarjeta reserva sus botones de ciclo de vida al pie, con
  texto, y que esa decisión "alcanza a las rebanadas 4 y 6". El botón del
  handoff queda superado por esa decisión previa, no relitigada acá.
- El sistema no toca el puntaje (rating) del jugador desde esta pantalla
  (`handoff/README.md:669`).
- El sistema no cambia el mecanismo de arrastre entre equipos de la
  rebanada 2: tocar una camiseta en modo de carga y arrastrarla en modo de
  armado son interacciones de pantallas distintas, activas en estados
  distintos del partido, que no coexisten.

### 3.3 Constraints inherited from the Concept Note

- **D-01** (motor fuera de alcance) — inherited; esta Spec no calcula
  reparto ni estrategia, sólo captura eventos sobre un reparto ya decidido.
- **D-02** (stack vanilla, sin runtime nuevo) — inherited; el selector, la
  pastilla y los botones se implementan en DOM + CSS dentro de `index.html`,
  igual que las cinco rebanadas anteriores.
- **D-03** (franja 360–390 px se achica, no fluida) — inherited; el selector
  de evento y el botón `−` siguen la misma resolución de desborde que el
  resto de la cancha.
- **D-04** (persistencia como secuencia de eventos) — inherited y **expuesta
  por primera vez**: esta rebanada es la superficie donde D-04 deja de ser
  invisible. Deshacer y el botón `−` por familia sólo son posibles porque el
  dato es una lista, no contadores.
- **D-06** (los partidos históricos no se migran) — inherited; editar por
  toque un finalizado histórico (sólo contadores) sigue guardando contadores
  al confirmar, nunca eventos.
- **D-12** (la cancha reemplaza a la lista/grilla por completo) — inherited;
  la grilla numérica de ~60 casillas deja de existir, sin un camino de vuelta.
- **D-17** (obligaciones de accesibilidad en términos comprobables, sin citar
  cláusulas normativas) — inherited; ver `NFR-002`/`NFR-003`.
- **D-18** (el arrastre se repone con la API nativa del navegador, no con un
  gesto propio; sienta el precedente del gesto para esta rebanada) —
  inherited como precedente de principio, no de mecanismo: esta rebanada usa
  toque (`click`/`pointerup`), no arrastre, pero el mismo criterio de
  simplicidad —preferir el gesto nativo del navegador antes que construir
  uno propio— aplica (`A-03`).
- **D-21** (una sola columna, pestañas con selector segmentado) — inherited;
  el selector de equipo de esta rebanada es el mismo patrón, sin la mecánica
  de recibir un drop (no hay arrastre en esta rebanada).
- **D-24** (Finalizar partido / Editar resultado / Guardar cambios / Cancelar
  siguen al pie, con texto; alcanza explícitamente a la rebanada 6) —
  inherited; cierra el non-goal del botón "Guardar" nuevo, arriba en §3.2.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — El borrador de carga (`resultadoDraft`) shall extenderse para
  sostener una lista ordenada de eventos en vez de contadores, sin introducir
  un segundo mecanismo de estado en memoria para la carga.
- **TC-002** — Toda derivación de contadores o marcador durante la carga
  (pastilla, fila de detalle, marcador del encabezado) shall pasar
  exclusivamente por las tres funciones que la rebanada 5 ya construyó —
  `statsPorJugadorDesdeEventos`, `eventosDesdeStats`, `statsPorJugadorDelPartido`
  (`index.html:3870-3909`)—, aplicadas sobre el borrador en vez de sobre
  `m.resultado`. Ninguna nueva función de conteo se agrega en paralelo
  (reafirma `TC-010` de la rebanada 5).
- **TC-003** — Todo nombre de jugador que esta rebanada renderiza en una fila
  de detalle shall pasar por la función de escape ya usada por la rebanada 4
  para el mismo dato (`escaparHtml`, definida en `index.html:1339` y usada en
  el renderizado de camiseta/pastilla en `index.html:4254-4271`), sin una
  segunda vía de interpolación de texto en el DOM.

### 4.2 Architectural / integration constraints

- **TC-010** — El selector de evento y el selector de equipo shall reutilizar
  el componente de selector segmentado ya fijado por `D-21`, sin introducir
  un segundo patrón visual de pestañas.
- **TC-011** — Los botones "Finalizar partido", "Editar resultado", "Guardar
  cambios" y "Cancelar" shall permanecer sin modificar por esta rebanada: ni
  su texto, ni su estilo, ni su ubicación al pie de la tarjeta (`D-24`). Los
  controles nuevos de esta rebanada (selector de evento, Deshacer, botón `−`)
  shall vivir dentro de la superficie de la cancha en modo de carga, nunca en
  el encabezado de la tarjeta (reservado a Copiar/Regenerar por `D-24`) ni al
  pie (reservado a los cuatro botones de ciclo de vida).
- **TC-012** — La pastilla de estadística en vivo de esta rebanada shall
  usar la misma posición, tamaño e ícono que la pastilla de lectura de la
  rebanada 4 (`FR-030` a `FR-035` de `PARTIDO_FINALIZADO_SPEC.md`), sin un
  segundo componente visual para el mismo dato.

### 4.3 Compliance / regulatory constraints

- **TC-020** — Todo botón de ícono introducido por esta rebanada (Deshacer,
  `−`) shall tener un nombre accesible no vacío (`aria-label` o `title`) y un
  área interactiva mínima de 44×44 px, verificable por medición
  (`D-17`; ver `NFR-002`/`NFR-003`).

### 4.4 Conventions to follow

- **TC-030** — Todo color, espaciado, radio, sombra y tipografía de los
  controles nuevos (selector de evento, botón `−`, Deshacer) shall provenir
  de un token del design system, sin valores inventados fuera de una
  excepción listada en el Implementation Plan.
- **TC-031** — Los íconos usados por esta rebanada (gol, gol en contra,
  asistencia, menos, deshacer) shall ser los mismos assets que ya usan las
  rebanadas 1 a 4, sin agregar un asset nuevo fuera del que el handoff ya
  define para Deshacer.

### 4.5 Security constraints (`MD-31`)

Por la §5.2 del Concept Note, las categorías aplicables se acotan a control
de acceso y validación de entrada del lado cliente. A diferencia de las
rebanadas 4 y 5 (sólo lectura o sin superficie de escritura nueva), esta
rebanada agrega la primera superficie de **escritura por toque** de la
feature, así que `CWE-20` pasa de "no aplica" (en las Specs anteriores) a
aplicable acá.

- **TC-040** — Ninguna función que agregue, quite o deshaga un evento del
  borrador shall ejecutarse si la sesión no tiene rol `admin`. **Defiende
  `CWE-862` *Missing Authorization*** y **`CWE-863` *Incorrect
  Authorization***.
- **TC-041** — Antes de agregar un evento al borrador, el sistema shall
  validar que el `jugadorId` tocado pertenece a la convocatoria del partido
  (`m.equipos.blanco`/`m.equipos.negro`) y que el tipo es uno de los cuatro
  válidos (`gol`, `golPenal`, `golEnContra`, `asistencia`); si no, shall
  rechazar el evento sin modificar el borrador. **Defiende `CWE-20`
  *Improper Input Validation***.
- **CWE-79 *Cross-Site Scripting*** — defendida por reuso de `escaparHtml`
  (`TC-003`); ningún nombre de jugador se interpola sin escapar.
- **CWE-352 *CSRF*** — no aplica: no hay endpoints propios; la escritura va
  por el SDK de Firestore autenticado, igual que en las rebanadas 4 y 5.
- **CWE-89 *SQL Injection***, **CWE-78 *OS Command Injection***, **CWE-22
  *Path Traversal***, **CWE-502 *Deserialization***, **CWE-918 *SSRF*** — no
  aplican: no hay servidor propio, ni parsing de entrada externa, ni acceso a
  filesystem (§5.2 del Concept Note).

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador | Carga el resultado desde el celular, apenas termina el partido | Anotar goles, penales, goles en contra y asistencias sin tipear números, y corregir un toque de más sin perder lo demás |
| Jugador | Consulta el partido mientras se carga o después de finalizado | No ver ningún control de carga; sólo la cancha en modo lectura |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero tocar la camiseta del que hizo un gol para cargarlo, sin abrir el teclado numérico. | FR-030, FR-030b, FR-040 |
| US-02 | Como administrador, quiero elegir una vez qué estoy anotando (Gol/Penal/En contra/Asistencia) y después sólo tocar camisetas. | FR-010, FR-012 |
| US-03 | Como administrador, quiero sacar el último gol que le cargué de más a un jugador sin tocar los demás datos. | FR-050, FR-051 |
| US-04 | Como administrador, quiero deshacer el último toque que hice, sea cual sea, si me equivoqué de jugador o de tipo. | FR-060, FR-061 |
| US-05 | Como administrador, quiero cargar los dos equipos sin perder lo que ya cargué del primero al cambiar de pestaña. | FR-020, FR-021 |
| US-06 | Como administrador, quiero reabrir un partido finalizado y ver los eventos que ya tiene cargados, para corregirlos igual que la primera vez. | FR-002, FR-005, FR-005b |
| US-07 | Como jugador, no quiero ver ningún control de carga cuando miro un partido. | FR-003 |

## 6. Glossary

| Term | Definition |
|---|---|
| Evento de partido | Hecho atribuido a un jugador, de uno de cuatro tipos (`gol`, `golPenal`, `golEnContra`, `asistencia`); entidad definida por la rebanada 5, reutilizada acá sin cambios de forma. |
| Familia de evento | Agrupación de tipos que comparte una fila de detalle y un botón `−`: "goles" agrupa `gol` y `golPenal`; "en contra" es `golEnContra` sola; "asistencias" es `asistencia` sola. |
| Borrador de carga | `resultadoDraft`: estado en memoria del cliente que sostiene los eventos cargados hasta que se confirma Finalizar/Guardar o se cancela; nunca se persiste como tal. |
| Modo de carga por toque | Estado de la pantalla en el que la cancha responde a toques sobre las camisetas en vez de mostrarlas de sólo lectura. |
| Selector de evento | Control segmentado de cuatro opciones que define el tipo de evento que el próximo toque va a agregar. |
| Selector de equipo | Control segmentado de dos pestañas (Blanco/Negro) que define qué cancha se ve; reutiliza el patrón de `D-21`. |
| Pastilla | Elemento visual anclado a una camiseta que muestra el número acumulado de una familia de evento para ese jugador; mismo componente que usa la rebanada 4 en modo lectura. |
| Fila de detalle | Fila debajo de la cancha, una por jugador y por familia de evento con al menos un evento cargado, con el número, el ícono, y el botón `−`. |

## 7. Functional requirements

### 7.1 Entrar al modo de carga

- **FR-001** — While la inscripción de un partido está cerrada y el partido
  no está finalizado, el sistema shall mostrar la cancha en modo de carga
  por toque para el rol admin, en vez de la lista o la grilla numérica.
- **FR-002** — When un administrador activa "Editar resultado" sobre un
  partido finalizado (`FR-006` de `PARTIDO_FINALIZADO_SPEC.md`), el sistema
  shall abrir la misma cancha en modo de carga por toque, con el borrador
  prellenado según `FR-005`/`FR-005b`.
- **FR-003** — While el rol de la sesión no es admin, el sistema shall no
  mostrar ningún control de carga (selector de evento, Deshacer, botón `−`);
  la cancha se muestra en el modo de lectura de la rebanada 4.
- **FR-004** — If un partido está finalizado y "Editar resultado" no está
  activo, then el sistema shall mostrar la cancha en modo lectura, sin ningún
  control de carga.
- **FR-005** — When se abre el modo de carga por toque sobre un partido cuyo
  `m.resultado.eventos` es un arreglo, el sistema shall inicializar el
  borrador copiando esa lista tal cual (`TC-002`).
- **FR-005b** — When se abre el modo de carga por toque sobre un partido
  histórico (sin `eventos`, sólo `m.resultado.statsPorJugador`), el sistema
  shall inicializar el borrador sintetizándolo con `eventosDesdeStats`
  (`TC-002`, `A-01`).

### 7.2 Selector de tipo de evento

- **FR-010** — El sistema shall mostrar, en la parte superior de la cancha
  en modo de carga, un selector segmentado de cuatro opciones: Gol, Penal,
  Gol en contra, Asistencia.
- **FR-011** — El sistema shall mantener seleccionada exactamente una opción
  del selector de evento en todo momento, con "Gol" como valor inicial al
  entrar al modo de carga.
- **FR-012** — When el administrador toca una opción distinta del selector
  de evento, el sistema shall cambiar el tipo de evento activo y mostrar,
  debajo del selector, el texto de ayuda correspondiente: "Tocá la camiseta
  del que convirtió" (Gol), "Tocá la camiseta del que convirtió de penal"
  (Penal), "Tocá la camiseta del que se la hizo en contra" (Gol en contra),
  "Tocá la camiseta del que dio el pase" (Asistencia)
  (`handoff/README.md:399-404`).
- **FR-013** — El sistema shall indicar, en el texto de ayuda, que tocar dos
  veces la misma camiseta agrega dos eventos del tipo activo
  (`handoff/README.md:406`).

### 7.3 Selector de equipo

- **FR-020** — El sistema shall mostrar, en el modo de carga, el selector de
  equipo de dos pestañas (Blanco/Negro) y shall mostrar la cancha de un solo
  equipo a la vez, según la pestaña activa (`D-21`, `TC-010`).
- **FR-021** — When el administrador toca la pestaña del equipo que no se
  ve, el sistema shall mostrar la cancha de ese equipo, conservando en el
  borrador los eventos ya cargados de ambos equipos.
- **FR-022** — El sistema shall mostrar el marcador de ambos equipos,
  recalculado a partir del borrador completo, sin importar qué pestaña esté
  activa (regla de goles propios + en contra del rival heredada de
  `openspec/specs/resultados-partido/spec.md:85-86`).

### 7.4 Carga por toque

- **FR-030** — When el administrador toca a un jugador con el modo de carga
  activo, el sistema shall agregar al borrador un evento del tipo
  actualmente seleccionado, atribuido a ese jugador. Sobre una unidad
  individual el toque abarca toda la camiseta (silueta y nombre); sobre una
  dupla queda acotado al nombre de cada integrante (`FR-030b`), que es el
  único elemento que distingue a quién atribuírselo sin agregar un segundo
  tipo de control. Enmendado tras la prueba en un teléfono real: el nombre
  solo resultó un blanco demasiado chico para el toque (ver Change log).
- **FR-030b** — Where la unidad tocada es una dupla de rotación (dos
  jugadores en una misma camiseta compartida, `index.html:4236-4238`), el
  sistema shall tratar el nombre de cada integrante como un toque
  independiente, atribuyendo el evento sólo a ese integrante. Ningún toque
  sobre una dupla agrega un evento a los dos a la vez. Preserva, con el
  gesto de toque, el mismo comportamiento por integrante que la grilla
  numérica ya tenía (`renderTeamPlayerRowDupla`, `index.html:4070-4116`,
  FR-013/FR-014 heredado de la Spec de resultados-partido).
- **FR-031** — El sistema shall permitir agregar más de un evento del mismo
  tipo al mismo jugador repitiendo el toque, sin límite superior fijo.
- **FR-032** — If el tipo de evento activo es Asistencia y el equipo del
  jugador tocado tiene cero goles propios en el borrador en ese momento,
  then el sistema shall no agregar el evento. Hereda la regla ya
  implementada en `index.html:3955-3960` ("Un equipo que no hizo goles no
  puede tener asistencias cargadas"), que
  `openspec/specs/resultados-partido/spec.md:36` cita por analogía al
  definir la regla equivalente de penales.
- **FR-033** — El sistema shall no deshabilitar ni bloquear la carga de un
  gol de penal en función de los goles previos del jugador: un evento
  `golPenal` es en sí mismo un gol si el jugador no tenía ninguno (`D-04`).
  La restricción histórica sobre penales sin gol previo queda
  estructuralmente imposible de violar y se retira de esta superficie.
- **FR-034** — If el jugador tocado no pertenece a la convocatoria del
  partido, then el sistema shall rechazar el evento sin modificar el
  borrador (`TC-041`).

### 7.5 Pastilla de estadística en vivo

- **FR-040** — El sistema shall mostrar, sobre cada camiseta con al menos un
  evento de una familia en el borrador, una pastilla con el número
  acumulado de esa familia y su ícono, en la misma posición, tamaño e ícono
  que usa la rebanada 4 en modo lectura (`TC-012`).
- **FR-041** — El sistema shall actualizar la pastilla inmediatamente
  después de cada toque, sin recargar la pantalla.
- **FR-042** — El sistema shall mostrar, debajo de la cancha, una fila de
  detalle por jugador y por familia de evento con al menos un evento
  cargado, con el número, el ícono, y la nota "(N de penal)" o "(EC)" cuando
  corresponda (`handoff/README.md:407-413`).
- **FR-043** — If un equipo no tiene ningún evento cargado, then el sistema
  shall mostrar el texto "Sin eventos cargados para este equipo" en lugar de
  la lista de filas de detalle (`handoff/README.md:420`).

### 7.6 Botón "−" por familia

- **FR-050** — El sistema shall mostrar, en cada fila de detalle con al
  menos un evento, un botón de ícono con el título "Sacar uno".
- **FR-051** — When el administrador toca el botón "−" de una fila, el
  sistema shall quitar del borrador el evento agregado más recientemente de
  esa familia para ese jugador. La familia "goles" agrupa `gol` y `golPenal`
  como un solo grupo (`handoff/README.md:662-663`).
- **FR-052** — El sistema shall actualizar la pastilla, el marcador y la
  fila de detalle inmediatamente después de quitar un evento con "−".
- **FR-053** — If una fila de detalle queda sin eventos después de tocar
  "−", then el sistema shall retirar esa fila, mostrando el estado vacío de
  `FR-043` si era la última fila del equipo.

### 7.6b Mantener presionado (agregada 2026-09-01, ver Change log)

- **FR-054** — When el administrador mantiene presionado (≥550ms) el mismo
  destino de toque que `FR-030`/`FR-030b` usan para agregar (la camiseta
  completa sobre una unidad individual, el nombre de cada integrante sobre
  una dupla), el sistema shall quitar del borrador el evento agregado más
  recientemente de la familia del tipo actualmente seleccionado, para ese
  jugador — mismo efecto que `FR-051`, sin agregar un botón nuevo. If el
  jugador no tiene ningún evento de esa familia, then el sistema shall
  dejar el borrador sin cambios (mismo comportamiento sin efecto que
  `FR-051` sobre una fila que no existe).
- **FR-054b** — El sistema shall no agregar un evento por el toque que
  sigue, de forma natural, al soltar una mantención sostenida ya resuelta
  por `FR-054` — la mantención y el toque corto son mutuamente excluyentes
  sobre el mismo gesto físico.

### 7.7 Deshacer

- **FR-060** — El sistema shall mostrar un botón de ícono "Deshacer" con el
  título "Deshacer el último evento cargado" (`handoff/README.md:534`),
  visible mientras el modo de carga está activo.
- **FR-061** — When el administrador toca "Deshacer", el sistema shall
  quitar del borrador el evento agregado más recientemente, sin importar
  jugador, equipo ni tipo (`handoff/README.md:664`).
- **FR-062** — If el borrador no tiene ningún evento, then el sistema shall
  deshabilitar el botón "Deshacer".
- **FR-063** — El sistema shall actualizar la pastilla, el marcador y la
  fila de detalle afectados inmediatamente después de un Deshacer.

### 7.8 Persistencia (botones heredados)

- **FR-070** — El sistema shall guardar el borrador únicamente a través de
  los botones de pie ya existentes —"Finalizar partido" en la primera carga,
  "Guardar cambios" al editar un finalizado—, sin agregar un botón de
  guardado adicional dentro de la cancha (`D-24`, `TC-011`).
- **FR-071** — When se confirma "Finalizar partido", el sistema shall
  escribir `m.resultado.eventos` con la secuencia del borrador tal cual
  quedó (rebanada 5, `FR-020`).
- **FR-072** — When se confirma "Guardar cambios" sobre un partido que ya
  tenía `m.resultado.eventos`, el sistema shall reescribir esa secuencia
  completa con el borrador (rebanada 5, `FR-023`).
- **FR-073** — When se confirma "Guardar cambios" sobre un partido histórico
  (sólo `m.resultado.statsPorJugador`), el sistema shall colapsar el
  borrador a los cuatro contadores por jugador y escribir
  `m.resultado.statsPorJugador`, sin agregar `eventos` (`D-06`).
- **FR-074** — When se toca "Cancelar" durante la edición de un finalizado,
  el sistema shall descartar el borrador sin modificar `m.resultado`.

### 7.9 Permisos

- **FR-080** — While el rol de la sesión no es admin, el sistema shall
  impedir la ejecución de cualquier función que agregue, quite o deshaga un
  evento del borrador (`TC-040`).
- **FR-081** — If la inscripción no está cerrada y el partido no está
  finalizado, then el sistema shall no mostrar ningún control de carga
  (hereda `esFilaEditable`, `index.html:4037-4045`, sin cambios de esta
  rebanada).

## 8. Non-functional requirements

> **Objetivo cuantificado.** A los efectos de `AC-51`, los NFR con objetivo
> cuantificado de esta Spec son `NFR-001`, `NFR-002` y `NFR-004`. El resto
> son obligaciones binarias verificables por revisión o por aserción de
> presencia/ausencia.

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive / layout | En cada uno de los anchos que mide `tests/layout.test.js` (360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200 px), la cancha en modo de carga cumple las dos condiciones del Principio V: `scrollWidth === clientWidth` y ningún elemento con su borde derecho fuera del viewport. Cubre el caso límite del handoff: un jugador con pastillas de goles y en contra a la vez, que pueden llegar a tocarse. |
| NFR-002 | Usabilidad | El área interactiva del botón Deshacer no es menor a 44×44 px en ningún ancho medido; la del botón `−` no es menor a 26×26 px en anchos ≥390 px ni a 38×38 px en anchos <390 px (`handoff/README.md:675-676`). |
| NFR-003 | Accesibilidad | Deshacer y cada botón `−` tienen un nombre accesible no vacío (`title`/`aria-label`); el tipo de evento activo se distingue por más de una señal (el thumb del selector y el texto de la opción), no sólo por color. |
| NFR-004 | Corrección / equivalencia de datos | Para cualquier secuencia de toques válidos generada sobre el borrador, el marcador de cada equipo mostrado en pantalla coincide siempre con `totalGolesEquipo` aplicado a `statsPorJugadorDesdeEventos(borrador)`. Verificado por un test de propiedad sobre al menos 500 secuencias generadas. |
| NFR-005 | Compatibilidad de datos | Guardar sobre un partido histórico (sólo contadores) preserva esa forma; guardar sobre uno con eventos preserva esa forma. Ningún guardado migra un partido de un formato al otro (`D-06`, `FR-072`/`FR-073`). |
| NFR-006 | Mantenibilidad | Todo test que verifique un `FR-*`, `NFR-*`, `TC-*` o `S-*` de esta Spec embebe su identificador en forma canónica dentro de un literal de cadena, según `AGENTS.md` § Tests. |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — Cargar un gol tocando la camiseta (covers FR-030, FR-031, FR-040, FR-041)

- **Given** el modo de carga está activo, el tipo de evento activo es "Gol",
  y la pestaña "Blanco" está a la vista
- **When** el administrador toca la camiseta de Lucas
- **Then** el sistema agrega `{jugadorId: 'lucas', tipo: 'gol'}` al borrador
- **And** la pastilla de goles sobre la camiseta de Lucas muestra "1"

**Variants:**

- `S-01a [boundary]` — un segundo toque sobre Lucas suma la pastilla a "2"
  (FR-031)
- `S-01b [failure]` — un evento con un `jugadorId` que no pertenece a la
  convocatoria se rechaza sin cambios en el borrador (FR-034)
- `S-01c [concurrency]` — dos toques disparados casi simultáneamente sobre la
  misma camiseta agregan exactamente dos eventos, no uno ni tres
- `S-01d [property]` — para cualquier secuencia de N toques sobre jugadores
  convocados, el marcador mostrado coincide siempre con el que resulta de
  aplicar `totalGolesEquipo` al borrador (NFR-004)
- `S-01e [boundary]` — tocar el nombre de un integrante de una dupla agrega
  el evento sólo a ese integrante; el otro integrante de la misma camiseta
  no cambia (FR-030b)
- `S-01f [boundary]` — sobre una unidad individual, tocar la silueta de la
  camiseta (no sólo el nombre) también agrega el evento; sobre una dupla,
  tocar la camiseta fuera de los dos nombres no agrega ninguno (FR-030)

#### Scenario S-02 — Cargar un penal a un jugador sin goles previos (covers FR-012, FR-030, FR-033)

- **Given** el tipo de evento activo es "Penal"
- **When** el administrador toca la camiseta de un jugador con cero goles en
  el borrador
- **Then** el sistema agrega un evento `golPenal` para ese jugador
- **And** la fila de detalle de "goles" de ese jugador muestra "1 (1 de
  penal)"

**Variants:**

- `S-02a [boundary]` — el mismo jugador ya tenía goles de juego cargados: un
  penal adicional suma al total sin afectar los goles de juego previos
- `S-02b [property]` — para cualquier borrador generado por toques,
  `golesPenal ≤ goles` se cumple siempre para todo jugador (invariante
  estructural de `D-04`)

#### Scenario S-03 — Cargar una asistencia (covers FR-012, FR-030, FR-032)

- **Given** el tipo de evento activo es "Asistencia", y el equipo del
  jugador que va a tocarse tiene al menos un gol en el borrador
- **When** el administrador toca la camiseta del que dio el pase
- **Then** el sistema agrega un evento `asistencia` para ese jugador

**Variants:**

- `S-03a [failure]` — el equipo del jugador tocado tiene cero goles en el
  borrador: el toque no agrega ningún evento (FR-032)
- `S-03b [boundary]` — el equipo pasa de cero a un gol dentro de la misma
  sesión de carga y luego se toca Asistencia: ahora sí se agrega, porque la
  regla se evalúa contra el estado actual del borrador, no contra un
  snapshot inicial

### 9.2 Edge cases

#### Scenario S-04 — Quitar el último evento de una familia con "−" (covers FR-050, FR-051, FR-052, FR-053, FR-054, FR-054b)

- **Given** un jugador tiene dos eventos en la familia "goles" (uno de ellos
  `golPenal`), cargados en ese orden
- **When** el administrador toca "−" en esa fila
- **Then** el sistema quita el evento `golPenal`, el más reciente de esa
  familia para ese jugador
- **And** la fila pasa a mostrar "1", sin la nota "(de penal)"

**Variants:**

- `S-04a [boundary]` — la fila tenía un solo evento: al tocar "−" la fila
  desaparece (FR-053)
- `S-04b [property]` — el evento quitado por "−" es siempre el más reciente
  cronológicamente de esa familia y jugador, sin importar en qué orden se
  cargaron eventos de otras familias o de otros jugadores entre medio
- `S-04c [property]` — si el evento quitado era un `golPenal`, `goles` y
  `golesPenal` bajan a la vez; nunca queda `golesPenal > goles`
- `S-04d [boundary]` — mantener presionada la camiseta (unidad individual) o
  el nombre (integrante de una dupla) durante ≥550ms quita el último evento
  de la familia del tipo activo para ese jugador, igual que "−" (FR-054)
- `S-04e [failure]` — mantener presionado a un jugador sin ningún evento de
  la familia activa no cambia el borrador (FR-054); soltar antes de los
  550ms no quita nada y el toque corto agrega uno, como siempre (FR-054b)

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-05 — Deshacer el último evento cargado (covers FR-060, FR-061, FR-062, FR-063)

- **Given** el borrador tiene al menos un evento, cargado sobre cualquier
  jugador, equipo o tipo
- **When** el administrador toca "Deshacer"
- **Then** el sistema quita el evento agregado más recientemente en todo el
  borrador

**Variants:**

- `S-05a [boundary]` — el borrador está vacío: "Deshacer" está deshabilitado
  (FR-062)
- `S-05b [property]` — deshacer tantas veces como eventos tenga el borrador
  lo deja exactamente vacío, sin importar el orden en que se cargaron
- `S-05c [concurrency]` — Deshacer ejecutado inmediatamente después de un
  doble toque casi simultáneo (S-01c) quita exactamente uno de los dos
  eventos agregados, el más reciente

#### Scenario S-06 — Cambiar de equipo mientras se carga (covers FR-020, FR-021, FR-022)

- **Given** hay eventos cargados para el equipo Blanco
- **When** el administrador toca la pestaña "Negro"
- **Then** el sistema muestra la cancha del equipo Negro
- **And** los eventos ya cargados de Blanco permanecen intactos en el
  borrador

**Variants:**

- `S-06a [property]` — el marcador mostrado para el equipo que no está en
  pantalla coincide siempre con `totalGolesEquipo` aplicado al borrador,
  igual que el del equipo visible (FR-022)

#### Scenario S-07 — Guardar el resultado cargado (covers FR-070, FR-071, FR-072, FR-073, FR-074, FR-080)

- **Given** el modo de carga está activo, con eventos cargados, sobre un
  partido cerrado sin finalizar todavía
- **When** el administrador confirma "Finalizar partido"
- **Then** el sistema escribe `m.resultado.eventos` con la secuencia del
  borrador y el partido pasa a `'Finalizado'`

**Variants:**

- `S-07a [boundary]` — confirmar "Finalizar partido" con el borrador vacío
  persiste `eventos: []` y no bloquea la finalización
- `S-07b [failure]` — durante la edición de un finalizado, tocar "Cancelar"
  descarta el borrador sin escribir nada en `m.resultado` (FR-074)
- `S-07c [property]` — editar un finalizado histórico (sólo contadores) y
  confirmar "Guardar cambios" preserva el formato de contadores; editar uno
  con eventos y confirmar preserva el formato de eventos (FR-072, FR-073)
- `S-07d [failure]` — una sesión con rol "jugador" que invoque directamente
  cualquiera de las funciones de carga/guardado no produce ningún cambio de
  estado (FR-080, defiende `CWE-862`/`CWE-863`)

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

| Entity | Purpose | Key attributes (conceptual) | Lifecycle |
|---|---|---|---|
| Evento de partido *(reutilizada, rebanada 5)* | Hecho atribuido a un jugador durante la carga | `jugadorId`, `tipo` (`gol`/`golPenal`/`golEnContra`/`asistencia`) | Se agrega por toque; se quita por `−` o Deshacer; se persiste al confirmar Finalizar/Guardar como parte de `m.resultado.eventos` |
| Borrador de carga *(efímero, no persistido)* | Sostiene la lista de eventos mientras el modo de carga está abierto | lista ordenada de Eventos de partido | Nace al abrir el modo de carga (`FR-005`); se colapsa a `m.resultado` al guardar, o se descarta al cancelar |

No se introduce ninguna entidad nueva **persistida**: esta rebanada reutiliza
el Evento de partido que la rebanada 5 ya definió y diagramó en su
[§10.1.1](../rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md). Por eso el
diagrama ER de esta Spec no aplica (`MD-24` lo exige sólo cuando se introduce
≥1 entidad nueva).

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| `statsPorJugadorDesdeEventos(eventos, idsConvocados)` (rebanada 5, `index.html:3870`) | Deriva contadores desde una lista de eventos | inbound | Reutilizada tal cual sobre el borrador, no sólo sobre `m.resultado` |
| `eventosDesdeStats(idsOrdenados, statsPorJugador)` (rebanada 5, `index.html:3888`) | Sintetiza eventos desde contadores | inbound | Usada al abrir el modo de carga sobre un partido histórico (`FR-005b`) |
| `statsPorJugadorDelPartido(m)` (rebanada 5, `index.html:3905`) | Única puerta de lectura de estadísticas ya persistidas | inbound | Usada para poblar el borrador al editar un finalizado (`FR-002`) |
| `window.__finalizarPartido` / `window.__editarResultadoFinalizado` / `window.__guardarEdicionResultado` / `window.__cancelarEdicionResultado` (pre-existentes, `index.html:3765-3862`) | Ciclo de vida del partido | inbound | Sin cambios de firma; esta rebanada cambia qué forma tiene `resultadoDraft` cuando estas funciones lo leen |

### 10.3 External APIs / events the feature exposes

Ninguno. Esta rebanada no agrega endpoints, eventos ni funciones expuestas
fuera del módulo de la aplicación: es una capa de interacción sobre datos y
funciones que ya existen.

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9.1 pasan contra una compilación
  fresca de la aplicación (covers FR-010 … FR-034).
- **AC-02** — El modo de carga no renderiza ningún `<input type="number">`
  de estadística (verificable por ausencia de `.team-stat-input` mientras el
  modo de carga está activo).
- **AC-03** — El botón `−` de una fila y el botón "Deshacer" están
  deshabilitados o ausentes exactamente cuando §9.2/§9.3 lo especifican
  (covers FR-053, FR-062).

### 11.2 Non-functional acceptance

- **AC-10** — `NFR-001` verificado por `tests/layout.test.js` en los 13
  anchos que ya mide, con al menos un escenario que incluye un jugador con
  pastillas de goles y en contra simultáneas.
- **AC-11** — `NFR-002` verificado midiendo el `getBoundingClientRect()` de
  Deshacer y de un botón `−` en cada ancho medido.
- **AC-12** — `NFR-004` verificado por un test de propiedad con ≥500
  secuencias de toques generadas al azar sobre jugadores convocados.

### 11.3 Constraint compliance

- **AC-15** — `TC-001`/`TC-002` verificados por code review: ninguna
  segunda función deriva contadores o marcador en paralelo a las tres de la
  rebanada 5.
- **AC-16** — `TC-011` verificado por code review: el encabezado de la
  tarjeta sigue mostrando sólo Copiar/Regenerar, y el pie sigue mostrando
  sólo los cuatro botones de ciclo de vida, sin un botón de guardado nuevo.
- **AC-17** — `TC-040`/`TC-041` verificados por un test de integración que
  invoca las funciones de carga con una sesión sin rol admin y con un
  `jugadorId` ajeno al partido, y confirma que el borrador no cambia.
- **AC-18** — `TC-020`/`TC-030`/`TC-031` verificados por code review: nombres
  accesibles presentes, tokens del design system usados, sin assets nuevos
  fuera de los ya inventariados.

### 11.4 Negative / safety acceptance

- **AC-20** — El escenario `S-01b` (evento sobre jugador no convocado) no
  modifica el borrador, verificado inspeccionando su estado antes y después.
- **AC-21** — El escenario `S-07d` (rol jugador invocando funciones de
  escritura) no modifica `m.resultado` ni el borrador, verificado del mismo
  modo.

### 11.5 Test & traceability obligations

- **AC-50** — Every scenario in §9 — including every enumerated variant — has
  at least one runnable test referenced in the Plan's §12.1 *Scenario
  Traceability Matrix*, with the scenario or variant ID embedded via a
  structurally-anchored binding. Every scenario heading in §9 is followed by
  a `Variants:` block. Mechanically enforced by Plan `T-N.D8` and `T-N.D8b`.
- **AC-51** — Every NFR in §8 with a quantified target (`NFR-001`, `NFR-002`,
  `NFR-004`) has a measurement test referenced in the Plan's §12, with the
  NFR ID embedded similarly.
- **AC-52** — Every TC in §4 has a §11.3 compliance check AND a corresponding
  entry in the Plan's §12. Mechanically gated by Plan `T-N.D10` and
  `T-N.D10b`.
- **AC-53** — The change has at least one `IMP-*` row in the Plan's §12.2
  *Impact Traceability* matrix for every materially-affected scope. Recorded
  at feature granularity. Mechanically gated by Plan `T-N.D15`.
- **AC-54** — Every NFR in §8 with a quantified target has at least one
  `OBS-*` row in the Plan's §11 *Observability*, with the NFR ID embedded in
  the row's *Binds to* column. Mechanically gated by Plan `T-N.D16`.
- **AC-55** — Every direct and transitive dependency in the branch's
  committed lockfile passes a current-advisory-DB check with no unwaived
  advisory, or the Plan declares `Supply-chain: none — <reason>` in §5.
  Mechanically gated by Plan `T-N.D20`.

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Adopción del toque | El administrador completa la carga de un resultado real sin abrir el teclado numérico ni una sola vez | Observación directa en la aplicación real, primeros 3 partidos cargados tras el merge |
| Ausencia de datos imposibles | Cero partidos cargados desde esta rebanada con `golesPenal > goles` para algún jugador | Estructuralmente garantizado por `D-04`; verificado además por `S-02b` |
| Claridad de la interacción | Nadie del grupo pide que se explique la pantalla de carga | Observación / feedback informal, primeras 2 semanas de uso |

## 13. Dependencies

- **Upstream services / specs:** las tres funciones de derivación y el
  formato de evento de
  [`MODELO_EVENTOS_SPEC.md`](../rebanada-5-modelo-eventos/MODELO_EVENTOS_SPEC.md)
  (rebanada 5); los botones de ciclo de vida y la pastilla de lectura de
  [`PARTIDO_FINALIZADO_SPEC.md`](../rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md)
  (rebanada 4); el selector segmentado y el patrón de pestañas de `D-21`
  (rebanada 2/3); la regla de goles en contra y de asistencia sin gol de
  `openspec/specs/resultados-partido/spec.md`.
- **Internal modules / teams:** ninguno más allá del propio `index.html`; no
  hay equipos externos involucrados.
- **Feature flags / config:** ninguno; `D-12` descarta un camino alternativo
  a mantener en paralelo.
- **Third-party APIs:** Cloud Firestore y Firebase Auth, sin cambios de
  forma por esta rebanada.

## 14. Assumptions

- **A-01** — El orden de los eventos sintetizados por `eventosDesdeStats`
  para un partido histórico no tiene significado de producto más allá de
  ser determinístico (hereda `MODELO_EVENTOS_SPEC.md`, `A-02`). Deshacer
  sobre un finalizado histórico recién abierto para editar quita el "último"
  según ese orden sintético, no según lo que realmente pasó en la cancha.
- **A-02** — `resultadoDraft` sigue viviendo como variable de módulo en
  memoria del cliente, sin persistencia intermedia hasta confirmar
  Finalizar/Guardar cambios; esta rebanada no introduce un mecanismo de
  guardado automático.
- **A-03** — El gesto de toque (`click`/`pointerup` sobre la camiseta) es
  distinguible del arrastre nativo de la rebanada 2 sin que ambos se
  disparen a la vez sobre el mismo elemento; el mecanismo concreto para
  garantizarlo es una decisión del Implementation Plan.

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| Un doble toque accidental sobre la misma camiseta agrega dos eventos que el administrador no nota | Med | Med | Cubierto por `S-01c`/`S-05c`; el Plan decide si agrega una ventana de debounce, pero el comportamiento correcto (dos toques, dos eventos, o Deshacer quita uno) ya está en el contrato |
| Sintetizar eventos desde contadores en un finalizado histórico (`FR-005b`, `A-01`) puede hacer que Deshacer parezca quitar "lo último" cuando en realidad quita el último según un orden inventado | Low | Low | Documentado en `A-01`; el Plan puede agregar un aviso visual la primera vez que se edita un histórico por toque |
| Retirar la restricción "sin gol propio no hay penal" (`FR-033`) sorprende a quien recuerda el comportamiento viejo de la grilla | Low | Low | Documentado explícitamente en `FR-033` con su razón (`D-04`); no es un olvido, es una consecuencia directa de una decisión ya aprobada |

## 16. Open questions

Ninguna pregunta sobre semántica de FR queda abierta: todo lo que el Concept
Note dejó pendiente para esta Spec —la vigencia del botón "Guardar" del
handoff frente a `D-24`, el alcance de la regla de asistencia sin gol, y el
tratamiento de los partidos históricos al editarlos por toque— se investigó
y se resolvió al redactarla, citado en cada `FR-*`/`D-*` correspondiente (ver
§3.2, §7.4, §7.8). No hay tabla de preguntas abiertas: no queda ninguna fila
que registrar.

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** todo `FR-*` (§7), todo `NFR-*`
  (§8), todo `TC-*` (§4), todo `AC-*` (§11 — incluyendo los seis meta-ACs de
  §11.5), y toda constraint heredada en §3.3. En particular: `TC-011`
  (los cuatro botones de pie no cambian) y `FR-033` (no reponer la
  restricción vieja de penales).
- **Plan has freedom over:** el mecanismo concreto de listener de toque
  (`click` vs `pointerup`) y cómo evita colisionar con el arrastre nativo de
  la rebanada 2 (`A-03`); si agrega debounce para el doble toque accidental;
  la estructura interna de módulos/funciones para el selector y las filas de
  detalle; el framework de test para la propiedad de `NFR-004`.
- **Plan must resolve:** ninguna pregunta abierta — §16 no tiene pendientes.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-01 | Lucas Manoukian | Enmienda pedida por el propietario tras usar `feature/carga-por-toque`: mantener presionado el mismo destino de toque de `FR-030`/`FR-030b` (≥550ms) también saca un evento de la familia activa, sin bajar hasta la fila de detalle a tocar "−". Se agregan `FR-054`/`FR-054b` (§7.6b) y las variantes `S-04d`/`S-04e`. Reutiliza `quitarUltimoDeFamilia`/`__quitarUltimoDeFamiliaCarga`, ya existentes (`FR-051`): no hay ninguna regla de negocio nueva, sólo un segundo gatillo para la misma acción. Self-critique: no corresponde (adición acotada, con el código y el test ya verificados contra el repositorio real). |
| 2026-09-01 | Lucas Manoukian | Enmienda encontrada al probar `feature/carga-por-toque` ya mergeada en un teléfono real: el nombre del jugador (`.camiseta-nombre`) resultó un blanco de toque demasiado chico en la práctica. Se ajusta `FR-030` para que, sobre una unidad INDIVIDUAL, el toque abarque toda la camiseta (silueta y nombre); sobre una dupla sigue acotado al nombre de cada integrante, sin cambios (`FR-030b` sigue vigente tal cual). Se agrega la variante `S-01f`. Ninguna otra decisión, requisito ni pregunta abierta cambia. Self-critique: no corresponde (enmienda acotada, con el código y el test ya verificados contra el repositorio real). |
| 2026-09-01 | Lucas Manoukian | Enmienda encontrada al empezar el Implementation Plan: la Spec no decía qué pasa al tocar una dupla de rotación (dos jugadores compartiendo una camiseta) — el toque tal como estaba redactado (`FR-030` original, "toca la camiseta") no podía distinguir a qué integrante atribuir el evento, mientras que la grilla numérica que esta rebanada reemplaza sí permitía cargar a cada integrante por separado (`renderTeamPlayerRowDupla`). Se agrega `FR-030b`, se ajusta `FR-030` para que el toque ocurra sobre el nombre del jugador (no toda la camiseta) —lo que hace posible distinguir integrantes sin agregar un control nuevo—, y se agrega la variante `S-01e`. Ninguna otra decisión, requisito ni pregunta abierta cambia. Self-critique: no corresponde (enmienda acotada, encontrada y resuelta antes de escribir el Plan). |
| 2026-09-01 | Lucas Manoukian | Initial draft. Self-critique: passed (1🔴 / 4🟡 / 1🔵) — el 🔴 (cita sin verificar de la reutilización de `escaparHtml` en `TC-003`) y los cuatro 🟡 (`FR-003`/`FR-080` usaban el patrón EARS "Where" para una condición de rol en vez de "While"; `FR-005` era compuesta y se partió en `FR-005`/`FR-005b`; `FR-032` citaba sólo la analogía de `openspec/specs/resultados-partido/spec.md:36` en vez de la regla ya implementada en `index.html:3955-3960`; faltaba `D-18` en §3.3 como precedente heredado) resueltos; el 🔵 (fila vacía de `[OPEN-Q-N]` en §16) resuelto quitando la tabla y dejando la declaración en prosa. |

---

*Este Spec defines what the system shall do, how it shall behave, and which
solutions are admissible. Concrete implementation choices (module layout,
file paths, design patterns, library picks within TC-* limits) will live in
CARGA_POR_TOQUE_IMPLEMENTATION_PLAN.md, todavía sin escribir. Motivation and
decision rationale live in
[EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md).*
