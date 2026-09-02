# La cancha (rebanada 1 de "Equipos en el campo") — Spec

> **Status:** Draft · **Date:** 2026-08-31 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md)
>
> **Implementation plan:** [CANCHA_IMPLEMENTATION_PLAN.md](./CANCHA_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5
> *Sources & Origins* del Concept Note. Donde un `FR-*` / `NFR-*` / `TC-*`
> se apoya en una ubicación del código, una medida del handoff o una
> cláusula de la constitución que §6.5 no cubre, la cita va **en línea**
> en la sección donde se define el requisito.

> **Declaración de reemplazo (Principio I, enmienda 2.5.0).** Esta Spec
> reemplaza, **solo en su parte de presentación**, dos specs vigentes:
>
> - [`.specify/specs/012-puntajes-coherentes-panel/spec.md`](../../../.specify/specs/012-puntajes-coherentes-panel/spec.md)
>   — queda reemplazada la ubicación de los números ("al lado de su nombre",
>   "en la columna de puntaje"), que sobre la cancha pasan a la píldora de la
>   camiseta. **No** se reemplaza su regla de fondo, que esta Spec conserva en
>   `FR-027`: el número que se muestra para una dupla es el de la unidad, el
>   que el motor usó y el que suma al total.
> - [`.specify/specs/008-duplas-rotacion/spec.md`](../../../.specify/specs/008-duplas-rotacion/spec.md)
>   — queda reemplazada la fila de dupla del panel, que pasa a ser la cápsula
>   de dupla sobre una sola camiseta (`FR-026`). **No** se reemplaza ninguna
>   regla de armado, de puntaje ni de candado de las duplas.
>
> Todo lo demás de esas dos specs, el motor de generación completo
> ([`003-motor-generacion-equipos`](../../../.specify/specs/003-motor-generacion-equipos/))
> y las reglas de permisos ([`007-permisos-por-usuario`](../../../.specify/specs/007-permisos-por-usuario/))
> siguen siendo fuente de verdad donde están.

## 1. Purpose

Esta Spec define **cómo se dibuja un equipo generado sobre una cancha**: la
geometría del campo, el reparto de las camisetas en líneas, la camiseta con su
nombre, su puntaje y su candado, y la regla que elige las medidas para que todo
entre desde 360 px de ancho. Es la primera de las siete rebanadas de `D-08`.

No cubre *por qué* se hace el rediseño (eso está en el Concept Note) ni *cómo* se
escribe el código (eso queda para el Implementation Plan). Tampoco cubre las otras
seis rebanadas: **el arrastre no está acá** (rebanada 2), ni el panel de armado
rediseñado (3), ni el partido finalizado (4), ni el modelo de eventos (5), ni la
carga por toque (6), ni las opciones de configuración (7).

## 2. Summary

Hoy, cuando el motor reparte los equipos, cada equipo se muestra como una lista de
ocho o nueve filas de texto agrupadas por posición. La formación existe en los
datos pero no en la pantalla. Esta rebanada reemplaza esa lista por un **campo de
fútbol dibujado**, con una camiseta por jugador ubicada en la línea que le tocó:
el ataque arriba, el arco abajo. Sobre cada camiseta va el nombre corto del
jugador, su puntaje (solo para el administrador) y el candado que ya existe para
fijarlo a su equipo.

El cambio es de presentación pura: no se toca el motor, no se guarda ni un dato
nuevo, y el candado se comporta exactamente igual que hoy. La aplicación sigue
siendo la misma organizadora de partidos previa al partido; lo único que cambia es
que el armado de equipos se lee de un vistazo en vez de reconstruirse leyendo
filas.

## 3. Scope

### 3.1 In scope

- La cancha como contenedor de proporción fija con las marcas del campo dibujadas.
- El reparto de las camisetas de un equipo en líneas, derivado de la posición
  asignada de cada jugador.
- La camiseta: silueta, color por equipo, nombre corto, píldora de puntaje,
  candado y cápsula de dupla de rotación.
- El comportamiento de una línea con cinco o más camisetas (no diseñado en el
  handoff).
- La regla que elige el escalón de medidas según el ancho útil del panel, y su
  verificación por medición desde 360 px.
- El reemplazo de la lista actual de filas por la cancha, **únicamente** en el
  momento en que el partido tiene la inscripción abierta y ya hay equipos
  generados.
- El escenario nuevo de `tests/layout.test.js` que cubre esa pantalla.

### 3.2 Out of scope / non-goals

Los cinco no-objetivos del Concept Note §16 se heredan enteros. Además, y como
límites propios de esta rebanada:

- El sistema **no** permitirá arrastrar una camiseta a otra posición, a otra línea
  ni al otro equipo (rebanada 2, `D-08`). Entre el merge de esta rebanada y el de
  la 2, el administrador corrige un reparto que no le gusta **regenerando**, no
  moviendo jugadores a mano. Es una pérdida temporal de función, aceptada
  explícitamente al fijar el alcance.
- El sistema **no** modificará el encabezado de la tarjeta de equipos, el combo de
  estrategia, el aviso de equipos desactualizados, los resúmenes de diferencia, el
  bloque "Por qué quedaron así" ni los botones de Copiar / Regenerar / Finalizar
  (rebanada 3).
- El sistema **no** mostrará la cancha en la pantalla de carga de resultado ni en
  el partido finalizado: esos dos momentos conservan la lista actual sin ningún
  cambio hasta las rebanadas 4 y 6.
- El sistema **no** dibujará chips de estadística (goles, goles en contra,
  asistencias) sobre las camisetas (rebanada 4).
- El sistema **no** introducirá un selector segmentado para ver un equipo a la vez
  en pantallas angostas: las dos canchas se apilan, igual que hoy se apilan los dos
  paneles (ver `OPEN-Q-01`).
- El sistema **no** soportará tamaños de cancha distintos de fútbol 8 y fútbol 9,
  que son los dos que `CANCHAS` declara ([`index.html:806-809`](../../../index.html#L806-L809)).
- El sistema **no** agregará ni modificará ningún campo persistido en Firestore.

### 3.3 Constraints inherited from the Concept Note

- **D-01** (el motor queda fuera de alcance) — heredada. Esta Spec consume
  `m.equipos` tal como el motor lo deja y no altera ninguna regla de reparto.
- **D-02** (se recrea en DOM + CSS vanilla dentro de `index.html`; no se importa el
  runtime del prototipo) — heredada; se encoda como `TC-001`.
- **D-03** (el desborde a 360 px se resuelve achicando medidas en la franja
  360–390, no con regla fluida ni partiendo la fila) — heredada. Ver `FR-050` a
  `FR-053`. **Matizada por esta Spec en un punto:** partir la línea sí ocurre, pero
  a partir de **cinco** camisetas, que es un caso que `D-03` no contempló porque el
  handoff no lo diseñó. Para las líneas de 3 y 4 —las únicas que produce la
  formación de fútbol 8 y 9— `D-03` se aplica tal cual.
- **D-12** (la cancha reemplaza por completo la lista; no conviven, y no queda un
  camino para volver a la lista) — heredada, acotada a la pantalla de esta
  rebanada. Que la lista siga viva en carga de resultado y en partido finalizado no
  es convivencia de dos vistas de la misma pantalla: son pantallas que todavía no
  fueron rediseñadas.
- **D-13** (las medidas de la franja 360–390 se derivan por medición y se validan
  mirándolas en la aplicación real; no se pide turno de diseño) — heredada. Ver
  `NFR-001`, `NFR-002` y `OPEN-Q-03`.
- **D-17** (el documento no cita cláusulas normativas de accesibilidad; las
  obligaciones se enuncian en términos directamente comprobables) — heredada.
  Es la razón de que `NFR-003` hable de "nombre accesible no vacío" y `NFR-004`
  de un piso medible en píxeles, en vez de citar un criterio de éxito de WCAG.
- **D-08** (siete rebanadas, en orden) — heredada; fija el alcance de §3.1 y §3.2.
- **D-11** (dos ramas por rebanada: `docs/<rebanada>` antes que
  `feature/<rebanada>`) — heredada; el Implementation Plan la ejecuta.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — La cancha se implementará como DOM + CSS vanilla dentro de
  `index.html`, con los mismos patrones de render que ya usa la aplicación. No se
  incorporará el runtime del prototipo del handoff (`support.js`), ni un motor de
  plantillas, ni un framework (`D-02`; Principio II).
- **TC-002** — No se agregará ninguna dependencia nueva: ni paquete, ni CDN, ni
  paso de build. Los únicos assets externos admitidos son los tres PNG que la
  aplicación ya tiene en [`assets/`](../../../assets/), y esta rebanada no usa
  ninguno de los tres.
- **TC-003** — La silueta de la camiseta y las marcas del campo se dibujarán con
  SVG inline y CSS, sin imágenes nuevas.

### 4.2 Architectural / integration constraints

- **TC-010** — La cancha leerá el reparto desde `m.equipos` y la posición de cada
  jugador desde `posicionAsignada` → `posicionOverride` → `principal`, con la misma
  precedencia que ya aplica `posicionAsignadaDe`
  ([`index.html:3541-3545`](../../../index.html#L3541-L3545)). No se recalculará
  ninguna posición ni ningún puntaje por fuera de las funciones que el panel ya
  usa.
- **TC-011** — El puntaje que se muestra sobre la camiseta será el que devuelve
  `valorDePuntaje` ([`index.html:3556-3562`](../../../index.html#L3556-L3562)) para
  esa unidad de armado: el mismo número que suma al total del equipo. No se
  introducirá un cálculo de puntaje propio de la vista (Principio IV; es la
  corrección que la spec `012-puntajes-coherentes-panel` ya había hecho y que esta
  rebanada no debe deshacer).
- **TC-012** — La cancha no escribirá nada. La única escritura que esta rebanada
  conserva es la del candado, que sigue pasando por `window.__toggleBloqueo`
  ([`index.html:3679-3700`](../../../index.html#L3679-L3700)) sin cambios de
  contrato (Principio IV).
- **TC-013** — El escalón de medidas **no** se seleccionará en función del ancho de
  la ventana: ninguna media query de viewport podrá decidirlo. La selección debe
  depender del ancho del propio panel de equipo. Qué mecanismo de CSS lo resuelve
  es decisión del Implementation Plan. Es una prohibición y no una preferencia
  porque `.wrap` está topeado en 760 px
  ([`index.html:45`](../../../index.html#L45)) y `.teams-wrap` pasa a una columna
  recién a 900 px ([`index.html:344-346`](../../../index.html#L344-L346)): el mismo
  panel de ~341 px útiles aparece en un monitor de 1400 px y en una tablet, así que
  el ancho de viewport no predice el ancho disponible
  `[UNVERIFIED — los 341 px son aritmética sobre los valores citados ((760 − 14) / 2
  − 32); no se midieron en el navegador. Ver OPEN-Q-04]`. `.team-panel` ya declara
  `container-type: inline-size` ([`index.html:270`](../../../index.html#L270)) por
  exactamente esta razón, y `tests/layout.test.js` ya mide sobre el panel y no
  sobre la ventana.

### 4.3 Compliance / regulatory constraints

- **TC-020** — No aplica ninguna obligación regulatoria de datos: la rebanada no
  introduce ningún dato nuevo, no cambia dónde se guarda nada y no expone
  información a ningún destinatario nuevo (Concept Note §5.2).

### 4.4 Conventions to follow

- **TC-030** — Todo color, tipografía, radio, sombra y espaciado saldrá de los
  tokens del design system de Football App
  ([`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/)),
  en el orden que fija el Principio VI: token existente → combinación de tokens →
  excepción documentada. El handoff ya expresa sus valores en esos tokens
  ([`handoff/README.md` § Design Tokens](../handoff/README.md)).
- **TC-031** — Las excepciones a `TC-030` que el handoff introduce se documentarán
  explícitamente en el Implementation Plan, con su justificación. A la fecha se
  conoce una sola dentro de esta rebanada: los radios literales de 13 / 14 / 15 px
  de la camiseta y sus estados, que no corresponden a ningún token de radio.
- **TC-032** — La pantalla se agregará como escenario nuevo de
  `tests/layout.test.js`, y el escenario **debe verse fallar al menos una vez**
  antes de darse por bueno, revirtiendo el ajuste de medidas que lo motiva
  (Principio V, "Criterio de verificación").
- **TC-033** — La geometría de la cancha, de la camiseta y de sus adornos se tomará
  literalmente de [`handoff/README.md`](../handoff/README.md) § Cancha y § Camiseta.
  Ningún valor se redondea "a ojo": el handoff es hi-fi y sus medidas son finales.
  Las únicas medidas que se derivan son las de los escalones que el handoff no
  diseñó (`FR-053`, `D-13`).

### 4.5 Security constraints (`MD-31`)

El Concept Note §5.2 declara la postura: ninguna entrada no confiable, escritura
solo de administradores autenticados, SPA estática sin servidor propio. Sobre esa
base, las categorías aplicables del CWE Top 25 se acotan a control de acceso e
inyección en el render.

`[UNVERIFIED — offline; no se consultó https://cwe.mitre.org/top25/ en esta
sesión. Las categorías se nombran por su identificador y su título, que son
estables, pero el ranking vigente a la fecha no se verificó.]`

- **TC-040** — El candado solo se dibujará, y su acción solo se ejecutará, cuando
  el rol de la sesión sea `admin`, la inscripción del partido no esté cerrada y el
  partido no esté finalizado. La comprobación de rol se hará **también en el
  handler**, no solo al pintar, replicando la guarda que `__toggleBloqueo` ya tiene
  ([`index.html:3680`](../../../index.html#L3680)). **Defiende `CWE-862` *Missing
  Authorization*** y **`CWE-863` *Incorrect Authorization***: una vista de lectura
  que solo esconde el botón deja la acción alcanzable desde la consola.
- **TC-041** — Todo texto que provenga de un jugador —nombre, apellido— se
  insertará escapado, tanto en el contenido como en los atributos `title` y
  `aria-label` de la camiseta. **Defiende `CWE-79` *Cross-Site Scripting***. Es una
  obligación nueva y no cosmética: la aplicación arma su HTML con plantillas de
  cadena e interpola `fullName(p)` sin escapar
  ([`index.html:1009`](../../../index.html#L1009),
  [`index.html:1634`](../../../index.html#L1634),
  [`index.html:3599`](../../../index.html#L3599)), y esta rebanada agrega un sink
  que hoy no existe: el mismo nombre dentro de un **atributo**, donde una comilla
  rompe el markup. La superficie es un administrador autenticado del propio grupo,
  así que el riesgo es bajo, pero el costo de escapar es una función de cuatro
  líneas.
- **CWE-89 *SQL Injection***, **CWE-78 *OS Command Injection***, **CWE-22 *Path
  Traversal***, **CWE-502 *Deserialization***, **CWE-918 *SSRF*** — no aplican; la
  §5.2 del Concept Note descarta servidor propio, parsing de entrada externa y
  acceso a filesystem.
- **CWE-352 *CSRF*** — no aplica: no hay endpoints propios; la escritura va por el
  SDK de Firestore con el token de la sesión.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Administrador | Miembro del grupo con rol `admin`. Arma los partidos desde el celular. | Entender de un vistazo cómo quedó parado cada equipo, y fijar a quien no quiere que se mueva antes de regenerar. |
| Jugador | Miembro del grupo con rol `jugador`. Solo consulta. | Ver en qué equipo y en qué puesto le tocó jugar, sin ver puntajes ajenos. |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero ver cada equipo dibujado sobre una cancha para entender la formación sin reconstruirla leyendo filas. | FR-001, FR-002, FR-010, FR-011, FR-012 |
| US-02 | Como administrador, quiero ver el puntaje de cada jugador sobre su camiseta para juzgar el reparto sin salir de la pantalla. | FR-024, FR-025 |
| US-03 | Como administrador, quiero fijar a un jugador desde su camiseta para que no cambie de equipo al regenerar. | FR-030, FR-031, FR-032 |
| US-04 | Como jugador, quiero abrir el partido desde el celular y ver dónde me tocó jugar, sin que se me muestren puntajes. | FR-024, FR-060 |
| US-05 | Como administrador, quiero que la cancha se lea completa en mi teléfono de 360 px, sin barras horizontales ni nombres cortados. | FR-050, FR-051, FR-052, NFR-001, NFR-002 |

## 6. Glossary

| Term | Definition |
|---|---|
| Cancha | El contenedor de proporción fija 68:105 con las marcas del campo dibujadas, uno por equipo. En el handoff se lo llama "campo". |
| Camiseta | La unidad visual que representa a una unidad de armado sobre la cancha: silueta de camiseta, nombre, y —según el rol y el estado— puntaje y candado. |
| Unidad de armado | Lo que el motor reparte como una sola cosa: un jugador individual, o una dupla de rotación (dos jugadores que ocupan un solo lugar). |
| Dupla de rotación | Dos jugadores que el motor trata como una unidad: siempre en el mismo equipo y en la misma posición, con un puntaje único que es el de la unidad. |
| Línea | El conjunto de camisetas de un equipo que comparten posición asignada. Son cuatro: Ataque, Medio, Defensa y Arco (`LABEL_LINEA`, [`index.html:2259`](../../../index.html#L2259)). |
| Sub-fila | Cada uno de los dos renglones en que se parte una línea cuando tiene cinco o más camisetas. |
| Posición asignada | La posición que la camiseta ocupa en la cancha: la que fijó el motor, si no la override manual, si no la posición principal declarada del jugador. |
| Panel de equipo | El contenedor de un equipo dentro de la tarjeta (`.team-panel`). Es el elemento cuyo ancho útil elige el escalón de medidas. |
| Ancho útil del panel | El ancho de contenido del panel de equipo: su `clientWidth` menos su padding izquierdo y derecho. Es lo que mide `tests/layout.test.js` y lo que evalúa una container query. |
| Escalón de medidas | El juego de valores (`--chip-w`, `--chip-size`, `--chip-name`, `--row-pad`, `--row-gap`) que se aplica a la cancha para un rango de ancho útil del panel. |
| Nombre corto | Primer nombre más la inicial del último apellido con punto: "Nicolás V.". |

## 7. Functional requirements

### 7.1 Dibujo de la cancha

- **FR-001** — El sistema mostrará, por cada equipo generado, una cancha de
  proporción fija 68:105 que ocupe el ancho disponible del panel de equipo.
- **FR-002** — El sistema dibujará sobre la cancha las marcas del campo —perímetro,
  línea del medio, círculo y punto central, área grande, área chica, arco,
  semicírculo del área y punto de penal, espejadas arriba y abajo— con la geometría
  en porcentajes que fija [`handoff/README.md` § Cancha](../handoff/README.md).
- **FR-003** — El sistema recortará al borde de la cancha cualquier marca que
  exceda su contorno, de modo que las marcas nunca se dibujen fuera del campo.
- **FR-004** — El sistema mostrará una cancha por equipo, con el mismo dibujo de
  campo para los dos equipos.

### 7.2 Reparto de las camisetas en líneas

- **FR-010** — El sistema agrupará las unidades de armado de un equipo en líneas
  según su posición asignada, resolviendo la posición con la precedencia
  `posicionAsignada` → `posicionOverride` → `principal`
  ([`index.html:3541-3545`](../../../index.html#L3541-L3545)).
- **FR-011** — El sistema dibujará las líneas de arriba hacia abajo en el orden
  Ataque, Medio, Defensa, Arco — es decir, el orden inverso de `ORDEN_LINEAS`
  ([`index.html:2258`](../../../index.html#L2258)).
- **FR-012** — Si una de las cuatro líneas del catálogo (Arco, Defensa, Medio,
  Ataque) no tiene ninguna unidad de armado, entonces el sistema igual dibujará
  esa línea, vacía, en su lugar de siempre. *(Enmendado 2026-09-02, ver §18: el
  comportamiento original — omitir la línea y repartir su alto entre las
  restantes — hacía que la línea de al lado subiera a ocupar ese lugar, dando la
  impresión de que esos jugadores jugaban en la posición de la línea que
  desapareció.)*
- **FR-013** — Mientras una línea tenga cuatro camisetas o menos, el sistema la
  dibujará en un solo renglón, con las camisetas centradas y separadas por el
  espaciado del escalón vigente.
- **FR-014** — Mientras una línea tenga cinco camisetas o más, el sistema la
  dibujará en dos sub-filas centradas dentro del alto de esa línea, con la sub-fila
  superior llevando la mitad de las camisetas redondeada hacia arriba.
- **FR-015** — El sistema mantendrá estable el orden de las camisetas dentro de una
  línea entre repintados sucesivos del mismo reparto: dos renderizados del mismo
  `m.equipos` producirán las camisetas en el mismo orden.
- **FR-016** — Si una unidad de armado del reparto no corresponde a ningún jugador
  del plantel actual, entonces el sistema la omitirá de la cancha y dibujará el
  resto del equipo, sin interrumpir el render — el mismo criterio tolerante que ya
  aplica el panel al resolver los ids
  ([`index.html:3808-3809`](../../../index.html#L3808-L3809)).

### 7.3 La camiseta

- **FR-020** — El sistema dibujará una camiseta por unidad de armado: una sola para
  la dupla de rotación, no una por integrante.
- **FR-021** — El sistema pintará la camiseta con el relleno y el trazo del Equipo
  Blanco o del Equipo Negro según el equipo al que pertenezca la unidad
  ([`handoff/README.md` § Camiseta](../handoff/README.md)).
- **FR-022** — El sistema mostrará debajo de la silueta el nombre corto del
  jugador, en una sola línea, recortado con puntos suspensivos si no entra en el
  ancho de la columna.
- **FR-023** — El sistema expondrá en el `title` de la camiseta el nombre completo
  del jugador y su posición asignada.
- **FR-023b** — Si la posición asignada de un jugador no es su posición principal
  declarada, entonces el sistema lo declarará explícitamente en el `title` de su
  camiseta — la información que hoy vive en la fila de la lista
  ([`index.html:3597-3598`](../../../index.html#L3597-L3598)).
- **FR-024** — Donde el rol de la sesión sea `admin`, el sistema mostrará sobre la
  camiseta la píldora con el puntaje de la unidad de armado
  ([`index.html:3535-3538`](../../../index.html#L3535-L3538)). El caso del rol
  `jugador` lo cubre `FR-060`.
- **FR-025** — Si la unidad de armado no tiene puntaje calculable, entonces el
  sistema no dibujará la píldora y lo declarará en el `title` de la camiseta. La
  leyenda "sin puntaje" que hoy ocupa la columna de la fila no cabe en la píldora.
- **FR-026** — El sistema mostrará la dupla de rotación con la cápsula de dos
  nombres y el ícono de rotación en lugar del nombre simple
  ([`handoff/README.md` § Camiseta → Cápsula de dupla](../handoff/README.md)).
- **FR-027** — El sistema mostrará en la píldora de una dupla el puntaje **de la
  unidad**, que es el que suma al total del equipo, y no el de cada integrante
  ([`index.html:3556-3562`](../../../index.html#L3556-L3562)).
- **FR-028** — El sistema formateará todo puntaje con una decimal, recortando el
  `.0`, con la misma regla que usa el resto de la aplicación.

### 7.4 El candado

- **FR-030** — Donde el rol de la sesión sea `admin`, la inscripción del partido no
  esté cerrada y el partido no esté finalizado, el sistema mostrará un candado
  sobre cada camiseta, indicando con su estado si esa unidad está fijada
  ([`index.html:3572-3580`](../../../index.html#L3572-L3580)).
- **FR-031** — Cuando el administrador active el candado de una camiseta, el
  sistema alternará el bloqueo de esa unidad y volverá a pintar el panel, con el
  mismo efecto que hoy tiene el botón de la fila.
- **FR-032** — Cuando el administrador active el candado de una dupla de rotación,
  el sistema aplicará el mismo estado de bloqueo a los dos integrantes.
- **FR-033** — El sistema dará al candado un nombre accesible que describa la
  acción y no el ícono ("Bloquear en este equipo" / "Desbloquear"), disponible como
  `aria-label` y como `title`.
- **FR-034** — Si el rol de la sesión no es `admin`, entonces el sistema no
  ejecutará la acción de bloquear aunque se la invoque, y no modificará el partido.

### 7.5 Reemplazo de la lista

- **FR-040** — Mientras el partido tenga equipos generados, la inscripción abierta
  y no esté finalizado, el sistema mostrará la cancha en lugar de la lista de filas
  agrupadas por línea.
- **FR-041** — En ese estado el sistema no mostrará la lista de filas, ni ofrecerá
  ninguna forma de volver a ella (`D-12`).
- **FR-042** — Mientras el partido tenga la inscripción cerrada, esté finalizado, o
  se esté editando el resultado de un partido finalizado, el sistema seguirá
  mostrando la lista de filas actual, sin ningún cambio de comportamiento ni de
  apariencia.
- **FR-043** — El sistema no modificará ningún otro elemento de la tarjeta de
  equipos: encabezado, subtítulo, aviso de equipos desactualizados, resúmenes de
  diferencia y de posiciones, bloque "Por qué quedaron así" y botonera quedan como
  están ([`index.html:4046-4090`](../../../index.html#L4046-L4090)).

### 7.6 Medidas y comportamiento responsive

- **FR-050** — El sistema elegirá el escalón de medidas de la cancha a partir del
  **ancho útil del panel de equipo**, no del ancho del viewport.
- **FR-051** — El sistema elegirá el escalón de modo que la línea más ancha del
  equipo entre completa dentro del ancho útil del panel, sin producir scroll
  horizontal y sin que ninguna camiseta quede recortada.
- **FR-052** — El sistema tomará los valores de cada escalón de la tabla de
  variables por vista de [`handoff/README.md` § Cancha](../handoff/README.md) para
  los anchos que el handoff diseñó.
- **FR-053** — ~~Donde el ancho útil del panel sea menor que el más chico que el
  handoff diseñó, el sistema aplicará un escalón derivado por medición.~~
  **Sin efecto tras la implementación (2026-08-31).** El requisito se escribió sobre
  la premisa de `D-03`: que la cancha de 9 desborda a 360 px y hay que derivar
  medidas más chicas. Medido sobre la aplicación real, **no desborda**: las columnas
  de una línea son elementos flexibles y se encogen solas, de modo que con el escalón
  más chico del handoff la columna se resuelve en 69.5 px y la camiseta conserva sus
  48 px. Se implementaron y compararon las dos configuraciones: el escalón derivado
  (columna 70 px, camiseta 42 px) resultó peor en las dos dimensiones que importan
  —camisetas más chicas y más nombres recortados, a 360 px **y** a 390 px, contra sólo
  360 px con el del handoff—. El sistema usa los escalones del handoff en todo el
  rango; no hay escalón derivado. `FR-051` y `NFR-002` siguen vigentes y se verifican
  igual. Ver `OPEN-Q-03` y `OPEN-Q-04` del Implementation Plan.
- **FR-054** — ~~El sistema apilará las dos canchas verticalmente cuando el layout
  de la tarjeta pase a una sola columna, con el mismo punto de corte que hoy usa
  `.teams-wrap`.~~ **Reemplazado por la rebanada 2 (2026-08-31).** En una sola
  columna los equipos dejan de apilarse y se muestran de a uno, con el selector
  segmentado de equipo; el punto de corte sigue siendo el mismo. La razón no es
  estética: con las canchas apiladas, en un teléfono el destino de todo movimiento
  manual queda fuera de pantalla, y alcanzarlo depende de cómo cada navegador
  desplace durante un arrastre — algo que no se puede verificar sin un dispositivo
  táctil a mano. Ver `FR-030` a `FR-037` de
  [ARRASTRE_SPEC.md](../rebanada-2-arrastre/ARRASTRE_SPEC.md) y la decisión 4 de su
  §3.4.

### 7.7 Roles

- **FR-060** — Donde el rol de la sesión sea `jugador`, el sistema mostrará la
  cancha con las camisetas, los nombres y las posiciones, sin píldoras de puntaje y
  sin candados.

## 8. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive / layout | En cada uno de los anchos que mide `tests/layout.test.js` (360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200 px), la pantalla de equipos generados cumple las dos condiciones del Principio V: `scrollWidth === clientWidth` y ningún elemento con su borde derecho fuera del viewport. |
| NFR-002 | Legibilidad | En todo ancho medido desde 360 px, ninguna camiseta de una misma línea se superpone con otra (sus rectángulos no se intersecan), y el nombre se dibuja con un tamaño de fuente no menor a 10.5 px, que es el mínimo que el handoff especifica. |
| NFR-003 | Accesibilidad | Todo control solo-ícono de la cancha —hoy únicamente el candado— tiene un nombre accesible no vacío que describe la acción, verificable leyendo su `aria-label` o su `title`. |
| NFR-004 | Accesibilidad | El área interactiva del candado no es menor a 24×24 px, que es la del botón de candado que reemplaza (`.icon-btn`: ícono de 16 px más 4 px de padding, [`index.html:153-155`](../../../index.html#L153-L155)). Es un requisito de no-regresión; el objetivo de 44×44 px queda en `OPEN-Q-02`. |
| NFR-005 | Rendimiento | Repintar el panel de equipos tras alternar un candado, con un plantel de 18 titulares, no supera los 100 ms medidos con `performance.now()` en el Chromium que `tests/layout.test.js` ya usa vía Playwright. |
| NFR-006 | Compatibilidad de datos | La rebanada no agrega, no renombra y no deja de escribir ningún campo de los documentos de partido en Firestore: el diff de campos escritos antes y después del cambio es vacío. |
| NFR-007 | Mantenibilidad | Todo valor de color, tipografía, espaciado, radio y sombra usado por la cancha proviene de un token del design system o de una excepción listada en el Implementation Plan; no queda ningún valor literal sin declarar. |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — El administrador ve los equipos generados sobre la cancha (covers FR-001, FR-002, FR-010, FR-011, FR-020, FR-022, FR-024, FR-040)

- **Given** un partido de fútbol 8 con la inscripción abierta y los equipos ya generados con la estrategia "Formación fija pareja"
- **And** una sesión con rol `admin`
- **When** el administrador abre el detalle del partido
- **Then** el sistema muestra dos canchas, una por equipo
- **And** cada cancha muestra ocho camisetas repartidas en cuatro líneas, con una en Ataque, tres en Medio, tres en Defensa y una en Arco
- **And** la línea de Ataque queda arriba y la de Arco abajo
- **And** cada camiseta muestra el nombre corto del jugador y su píldora de puntaje
- **And** no se muestra ninguna fila de la lista anterior

**Variants:**

- `S-01a [boundary]` — fútbol 9: la línea del Medio tiene cuatro camisetas y entra completa
- `S-01b [boundary]` — el equipo no tiene arquero asignado: la línea de Arco se dibuja igual, vacía, en su lugar (FR-012 enmendado)
- `S-01c [boundary]` — una línea con exactamente cuatro camisetas se dibuja en un solo renglón
- `S-01d [boundary]` — una línea con exactamente cinco camisetas se dibuja en dos sub-filas de tres y dos
- `S-01e [failure]` — un id del reparto no corresponde a ningún jugador del plantel: se omite esa camiseta y el resto del equipo se dibuja igual
- `S-01f [property]` — para cualquier reparto válido de 8 o 9 unidades por equipo, ninguna camiseta se superpone con otra de su misma línea

#### Scenario S-02 — Estrategia sin posiciones asignadas (covers FR-010, FR-012, FR-014)

- **Given** un partido con los equipos generados con la estrategia "Solo por puntaje", que no asigna posiciones
- **When** el administrador abre el detalle del partido
- **Then** el sistema ubica a cada jugador en la línea de su posición principal declarada
- **And** las líneas que quedan vacías se dibujan igual, vacías (FR-012 enmendado)

**Variants:**

- `S-02a [boundary]` — cinco de los ocho titulares del equipo declaran Volante: la línea del Medio se parte en dos sub-filas de tres y dos
- `S-02b [boundary]` — los ocho titulares declaran la misma posición: se dibuja una sola línea, partida en dos sub-filas de cuatro
- `S-02c [boundary]` — ningún titular declara Arquero: la línea de Arco se dibuja igual, vacía (FR-012 enmendado)

#### Scenario S-03 — Una dupla de rotación en la cancha (covers FR-020, FR-026, FR-027)

- **Given** un equipo generado que incluye una dupla de rotación en el Medio
- **When** el administrador abre el detalle del partido
- **Then** el sistema dibuja **una sola** camiseta para la dupla, con la cápsula de los dos nombres y el ícono de rotación
- **And** la píldora muestra el puntaje de la unidad, que es el que suma al total del equipo

**Variants:**

- `S-03a [boundary]` — la dupla cae dentro de una línea de cuatro camisetas, que es el caso más ajustado de ancho
- `S-03b [boundary]` — ninguno de los dos integrantes tiene puntaje cargado en la posición asignada: no se dibuja píldora y el `title` lo declara

#### Scenario S-04 — El administrador fija a un jugador desde su camiseta (covers FR-030, FR-031, FR-032, FR-033)

- **Given** un partido con la inscripción abierta, equipos generados y una sesión `admin`
- **And** el jugador "Nicolás Vallejos" no está bloqueado
- **When** el administrador activa el candado sobre la camiseta de Nicolás Vallejos
- **Then** el sistema agrega a ese jugador a la lista de bloqueados del partido
- **And** el candado de esa camiseta pasa a su estado cerrado
- **And** el resto del reparto no cambia

**Variants:**

- `S-04a [boundary]` — el candado sobre una dupla bloquea a los dos integrantes
- `S-04b [boundary]` — activar el candado de un jugador ya bloqueado lo desbloquea
- `S-04c [failure]` — una sesión con rol `jugador` invoca la acción de bloquear: el partido no se modifica
- `S-04d [concurrency]` — dos activaciones consecutivas del mismo candado dejan al jugador en el estado inicial, sin duplicarlo en la lista de bloqueados

#### Scenario S-05 — Un jugador consulta los equipos (covers FR-024, FR-030, FR-060)

- **Given** un partido con los equipos generados
- **And** una sesión con rol `jugador`
- **When** el jugador abre el detalle del partido
- **Then** el sistema muestra las dos canchas con las camisetas y los nombres
- **And** no muestra ninguna píldora de puntaje
- **And** no muestra ningún candado

Variants: none — single-path scenario.

#### Scenario S-06 — La cancha entra en un teléfono de 360 px (covers FR-050, FR-051, FR-053, FR-054, NFR-001, NFR-002)

- **Given** un partido de fútbol 9 con los equipos generados, que es el caso más ancho porque el Medio tiene cuatro camisetas
- **And** un viewport de 360 px de ancho
- **When** el administrador abre el detalle del partido
- **Then** la página no produce scroll horizontal
- **And** ningún elemento queda con su borde derecho fuera del viewport
- **And** las cuatro camisetas del Medio se dibujan en un renglón, sin superponerse
- **And** ~~las dos canchas quedan apiladas verticalmente~~ — *sin efecto tras la
  rebanada 2:* se muestra una cancha por vez con el selector de equipo (ver `FR-054`)

**Variants:**

- `S-06a [boundary]` — a 900 px de viewport, con una sola columna, el panel es el más ancho posible en una columna
- `S-06b [boundary]` — a 901 px de viewport, con dos columnas y `.wrap` topeado en 760 px, el panel vuelve a ser angosto: el escalón que se aplica es el mismo que en un teléfono, no el de escritorio
- `S-06c [boundary]` — a 1200 px de viewport el panel sigue teniendo el mismo ancho útil que a 901 px, y el escalón no cambia
- `S-06d [property]` — en todos los anchos medidos, `scrollWidth === clientWidth`

### 9.2 Edge cases

#### Scenario S-10 — Los otros dos momentos del partido conservan la lista (covers FR-042)

- **Given** un partido con la inscripción cerrada y el resultado sin cargar
- **When** el administrador abre el detalle del partido
- **Then** el sistema muestra la lista de filas actual con sus casillas numéricas
- **And** no muestra ninguna cancha

**Variants:**

- `S-10a [boundary]` — partido finalizado: lista de filas con las estadísticas de solo lectura
- `S-10b [boundary]` — partido finalizado en edición de resultado: lista de filas con las casillas numéricas
- `S-10c [boundary]` — partido con la inscripción abierta pero sin equipos generados todavía: no se dibuja ninguna cancha

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Un nombre de jugador con caracteres de marcado (covers TC-041, NFR-003)

- **Given** un jugador cuyo nombre contiene caracteres de marcado y una comilla doble
- **When** el administrador abre el detalle del partido con ese jugador en un equipo
- **Then** el sistema muestra el nombre como texto literal sobre la camiseta
- **And** no ejecuta ningún script
- **And** el `title` y el `aria-label` de la camiseta conservan el nombre completo sin romper el markup

**Variants:**

- `S-20a [failure]` — el nombre contiene una comilla doble, que es lo que rompe un atributo
- `S-20b [failure]` — el nombre contiene una etiqueta de apertura de script

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

Esta rebanada **no introduce ninguna entidad de dominio nueva**: es presentación
sobre datos que ya existen. Las entidades que consume, todas vigentes, son el
partido con su reparto de equipos (`m.equipos`), el jugador con su nombre,
posiciones y puntajes, y la dupla de rotación como unidad de armado.

Por lo tanto **no se incluye diagrama entidad-relación** en §10.1.1: la obligación
de `MD-24` se dispara con al menos una entidad nueva, y acá no hay ninguna. El
modelo de datos sí cambia en la rebanada 5, y el diagrama corresponde a esa Spec.

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore | Documento de partido, con `equipos`, `bloqueados`, `convocados` | inbound | Sin cambio de forma. La cancha solo lee. |
| Firebase Auth | Rol de la sesión (`admin` / `jugador`) | inbound | Sin cambio. Resuelto por `isAdmin()`. |

### 10.3 External APIs / events the feature exposes

| Endpoint / event | Inputs | Outputs | Notes |
|---|---|---|---|
| — | — | — | La rebanada no expone ninguna interfaz nueva. La única escritura, el candado, ya existe y no cambia de contrato (`TC-012`). |

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9.1 pasan contra la aplicación real servida
  desde el repositorio (cubre FR-001 … FR-060, y los escenarios S-01 … S-06).
- **AC-02** — En un partido con la inscripción abierta y equipos generados, el DOM
  no contiene ningún `.team-player-row` (cubre FR-040, FR-041).
- **AC-03** — En un partido con la inscripción cerrada, con el resultado en
  edición, o finalizado, el DOM contiene las mismas filas que antes del cambio y
  ninguna cancha (cubre FR-042, escenario S-10).
- **AC-04** — Con una sesión de rol `jugador`, el DOM de la cancha no contiene
  ninguna píldora de puntaje ni ningún candado (cubre FR-024, FR-030, FR-060,
  escenario S-05).

### 11.2 Non-functional acceptance

- **AC-10** — `node tests/layout.test.js` pasa con el escenario nuevo de equipos
  generados incluido, en los trece anchos que el runner mide (verifica NFR-001).
- **AC-11** — El invariante de no-superposición de camisetas del escenario nuevo
  pasa en todos los anchos medidos, y el tamaño de fuente calculado del nombre no
  baja de 10.5 px en ninguno (verifica NFR-002).
- **AC-12** — Toda camiseta con candado expone un `aria-label` no vacío, verificado
  como aserción del escenario de layout (verifica NFR-003).
- **AC-13** — El rectángulo del candado mide al menos 24 px de lado en todos los
  anchos medidos (verifica NFR-004).
- **AC-14** — Alternar un candado en un partido de 18 titulares completa el
  repintado en menos de 100 ms, medido con `performance.now()` dentro del escenario
  de Playwright (verifica NFR-005).
- **AC-15** — El conjunto de campos escritos en el documento de partido antes y
  después del cambio es idéntico (verifica NFR-006). `[UNVERIFIED — se asume que el
  doble de Firebase de `tests/fixtures-app.js` permite observar las escrituras; no
  se leyó esa parte del arnés en esta sesión. Si no lo permite, el Plan elige otra
  evidencia — por ejemplo revisión del diff de las llamadas de guardado.]`
- **AC-16** — El Implementation Plan lista cada valor visual usado por la cancha
  con su token de origen, o como excepción justificada (verifica NFR-007).

### 11.3 Constraint compliance

- **AC-20** — Revisión de código: el `index.html` no incorpora `support.js`, ningún
  motor de plantillas ni ninguna dependencia nueva; la cancha y la camiseta se
  dibujan con SVG inline y CSS, sin imágenes nuevas; y el `diff` de la rama no toca
  ningún archivo de dependencias (verifica TC-001, TC-002, TC-003).
- **AC-21** — Revisión de código: la cancha obtiene posición y puntaje llamando a
  las funciones existentes del panel y no reimplementa ninguna, y no introduce
  ninguna escritura nueva a Firestore (verifica TC-010, TC-011, TC-012).
- **AC-22** — El CSS de la cancha no contiene ninguna media query de viewport que
  intervenga en la selección del escalón, verificado por revisión de código y por
  los escenarios `S-06b` y `S-06c`, que fallarían si el escalón dependiera del
  ancho de ventana (verifica TC-013).
- **AC-23** — Revisión de código: la rebanada no agrega ningún campo de dato nuevo
  ni ningún destinatario nuevo de información, de modo que la postura de §5.2 del
  Concept Note sigue siendo la vigente (verifica TC-020).
- **AC-24** — Revisión de código contra el design system: todo color, tipografía,
  radio, sombra y espaciado de la cancha resuelve a un token, y las excepciones
  —los radios literales de 13 / 14 / 15 px, y cualquier otra que aparezca al
  implementar— quedan listadas con su justificación en el Implementation Plan
  (verifica TC-030, TC-031, Principio VI).
- **AC-25** — El escenario nuevo de `tests/layout.test.js` se vio fallar al menos
  una vez revirtiendo el ajuste de medidas que lo motiva, y la evidencia queda
  registrada en el Implementation Plan (verifica TC-032, Principio V).
- **AC-26** — Revisión de código contra [`handoff/README.md`](../handoff/README.md)
  § Cancha y § Camiseta: cada valor de geometría implementado coincide con el del
  handoff, salvo los escalones derivados que `FR-053` autoriza (verifica TC-033).
- **AC-27** — Revisión de código: todo texto proveniente de un jugador pasa por el
  escapado antes de insertarse, tanto en contenido como en atributos (verifica
  TC-040, TC-041).
- **AC-28** — Revisión de código: la guarda de rol está presente en el handler del
  candado y no solo en el render (verifica TC-040).

### 11.4 Negative / safety acceptance

- **AC-40** — El escenario S-20 no produce ejecución de script y el nombre se lee
  literal sobre la camiseta, verificado con un jugador de prueba cuyo nombre
  contiene marcado y una comilla doble.
- **AC-41** — El escenario `S-04c` no produce ninguna escritura: el documento de
  partido queda sin modificar tras invocar la acción de bloquear con rol
  `jugador`.

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 —incluida cada variante `S-NNa`, `S-NNb`, …—
  tiene al menos un test ejecutable referenciado en la §12.1 *Scenario
  Traceability Matrix* del Implementation Plan, con el identificador embebido en un
  anclaje estructural (el nombre de la función de test o su clave de escenario), no
  en un comentario. Toda cabecera de escenario de §9 va seguida de un bloque
  `Variants:` o de la declaración explícita `Variants: none — single-path
  scenario`. Lo verifican mecánicamente `T-N.D8` y `T-N.D8b`.
- **AC-51** — Todo NFR de §8 con objetivo cuantificado tiene un test de medición
  referenciado en la §12 del Implementation Plan, con el identificador del NFR
  embebido. Lo verifica `T-N.D9`.
- **AC-52** — Todo TC de §4 tiene una verificación de cumplimiento en §11.3 y una
  entrada correspondiente en la §12 del Implementation Plan: un test ejecutable
  cuando es mecánicamente verificable, o el revisor / la lista de revisión que lo
  comprueba cuando no lo es. Lo verifican `T-N.D10` y `T-N.D10b`.
- **AC-53** — El cambio tiene al menos una fila `IMP-*` en la §12.2 *Impact
  Traceability* del Implementation Plan por cada ámbito materialmente afectado
  (`code` / `system` / `business` / `external`). Se conocen al menos tres
  consecuencias a enumerar: la pérdida temporal del arrastre manual (`business`),
  el escenario nuevo que `tests/layout.test.js` pasa a correr en cada ejecución
  (`system`), y el reemplazo declarado de la parte de la spec vieja que describe la
  lista (`code`). Lo verifica `T-N.D15`.
- **AC-54** — Todo NFR de §8 con objetivo cuantificado tiene al menos una fila
  `OBS-*` en la §11 *Observability* del Implementation Plan, con el identificador
  del NFR en su columna *Binds to*. Lo verifica `T-N.D16`.
- **AC-55** — El lockfile de dependencias de la rama pasa una verificación contra
  la base de advisories vigente sin ningún advisory sin waiver. **Este repositorio
  no tiene lockfile**: la aplicación es un `index.html` sin dependencias instaladas
  y el único paquete que los tests usan (Playwright) es opcional y externo al
  repositorio. El Implementation Plan declara `Supply-chain: none — el repositorio
  no versiona ningún lockfile; la aplicación no tiene dependencias instaladas` en su
  §5, y este criterio se satisface de forma vacua. Lo verifica `T-N.D20`.
  `[UNVERIFIED — la ausencia de lockfile se afirma a partir del listado de la raíz
  del repositorio; no se corrió un escaneo recursivo en esta sesión.]`

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Comprensión de la formación | Alguien del grupo mira la pantalla de equipos y describe cómo quedó parado cada equipo sin preguntarle a nadie | Observación directa en el uso real del grupo, dentro de los primeros dos partidos posteriores al merge |
| Conformidad con el Principio V | `node tests/layout.test.js` cubre la pantalla de equipos generados en fútbol 8 y en fútbol 9 y pasa | El propio comando, en cada ejecución |
| Ausencia de regresión funcional percibida | Nadie del grupo reporta no poder hacer algo que antes hacía, salvo mover jugadores a mano, que está anunciado | Reportes del grupo entre el merge de la rebanada 1 y el de la 2 |

## 13. Dependencies

- **Upstream services / specs:** el motor de generación de equipos, que produce
  `m.equipos` con sus posiciones asignadas
  ([`.specify/specs/003-motor-generacion-equipos/`](../../../.specify/specs/)); el
  design system de Football App
  ([`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/)),
  fuente de verdad de la UI por el Principio VI; el handoff de diseño en
  [`../handoff/`](../handoff/), congelado como referencia.
- **Internal modules / teams:** el panel de equipos de `index.html`, cuyas
  funciones de posición y puntaje esta rebanada reutiliza; `tests/layout.test.js` y
  su arnés `tests/fixtures-app.js`.
- **Feature flags / config:** ninguno. La rebanada no introduce ningún interruptor:
  la cancha reemplaza a la lista sin camino de vuelta (`D-12`).
- **Third-party APIs:** Cloud Firestore y Firebase Auth, sin cambio de uso.
- **Bloqueante ya resuelto:** la enmienda 2.5.0 de la constitución (`D-09`,
  `D-16`), que hacía falta antes de escribir esta Spec, está mergeada.

## 14. Assumptions

- **A-01** — El nombre corto por defecto es "primer nombre + inicial del último
  apellido con punto", como fija el handoff. La opción de mostrar el nombre
  completo (`nameFormat`) está diferida a la rebanada 7 y no se implementa acá.
- **A-02** — La visibilidad del puntaje sigue la regla que la aplicación ya tiene:
  solo para el rol `admin`. El handoff dibuja la píldora siempre porque su
  prototipo no modela roles; no es una decisión de producto que revierta la actual.
- **A-03** — La aplicación solo soporta fútbol 8 y fútbol 9, y el reparto siempre
  produce como mucho nueve unidades de armado por equipo. Si esto dejara de ser
  cierto, `FR-014` sigue siendo válido pero las medidas de `FR-053` habría que
  volver a derivarlas.
- **A-04** — El único elemento interactivo que la cancha incorpora en esta rebanada
  es el candado. Cualquier otro control sobre la camiseta pertenece a rebanadas
  posteriores.
- **A-05** — Los partidos ya guardados tienen su reparto en el mismo formato que
  los nuevos: la cancha los dibuja sin conversión.
- **A-06** — El navegador de referencia soporta container queries. Es la misma
  suposición que el CSS actual ya hace en `.team-panel`
  ([`index.html:270`](../../../index.html#L270)), así que no agrega superficie.

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| Las medidas derivadas para 360 px hacen ilegibles los nombres reales, que son más largos que los del plantel de muestra | Med | Med | `NFR-002` fija un piso de tamaño de fuente y la no-superposición como condiciones medibles; `AC-11` las verifica; `D-13` obliga además a mirarlo en la aplicación real con nombres reales, porque el test dice si entra pero no si se lee |
| El administrador extraña mover jugadores a mano entre el merge de esta rebanada y el de la 2 | Med | High | Está declarado como no-objetivo en §3.2 y como impacto de negocio en `AC-53`, no como sorpresa. La salida disponible es regenerar. Si molesta en el uso real, la respuesta es adelantar la rebanada 2, no reponer la lista |
| Una línea con cinco o más camisetas se descubre tarde y la solución de dos sub-filas no se ve bien | Med | Med | Los escenarios `S-02a` y `S-02b` lo cubren explícitamente con el caso extremo (los ocho de la misma línea), así que la forma se valida en el mismo momento que el resto |
| El escalón se implementa contra el viewport y "funciona" en el teléfono pero rompe en la banda de dos columnas | Med | Med | `TC-013` lo prohíbe, `AC-22` lo revisa, y `S-06b` / `S-06c` fallarían si ocurriera: son los dos anchos donde el viewport y el panel discrepan más |
| El escapado de nombres se implementa solo en el contenido y no en los atributos | Low | Med | `TC-041` nombra los dos contextos y `S-20a` prueba justamente la comilla doble, que es la que solo rompe en atributos |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | *Resuelta por la rebanada 2.* En pantallas angostas, ¿las dos canchas se apilan (lo que esta Spec fijaba) o se introduce el selector segmentado de equipo del handoff? Se introduce el selector, en la rebanada 2, y `FR-054` queda reemplazado. | Lucas Manoukian | *Resuelta* | El handoff lo diseña en `6a`, pero `D-08` no lo asigna a ninguna rebanada. Apilar no empeora respecto de hoy —los dos paneles ya se apilan—, así que no bloquea esta rebanada. En la rebanada 2 sí importa: la pestaña del otro equipo es una de las tres zonas de drop del handoff |
| OPEN-Q-02 | ¿El candado sobre la camiseta debe alcanzar un objetivo táctil de 44×44 px? | Lucas Manoukian | Spec revision o Implementation Plan | El Concept Note lo nombra como obligación de accesibilidad, pero el handoff dibuja el candado en 20–22 px y el botón actual es de 24 px. La constitución tiene `TODO(OBJETIVO_TACTIL_MINIMO)` abierto desde la enmienda 2.2.0 justamente por esto. `NFR-004` fija hoy el piso en no-regresión (24 px); subirlo a 44 px sobre una camiseta de 48–56 px pisaría a la camiseta vecina y necesita una decisión de diseño |
| OPEN-Q-03 | ¿Cuáles son exactamente los valores del escalón derivado para el ancho útil más chico? | Lucas Manoukian | Implementation Plan | `D-13` fija el método (derivar por medición y validar en la aplicación real), no los números. El Plan los fija y `AC-25` obliga a ver fallar el test antes de darlos por buenos |
| OPEN-Q-04 | El Concept Note afirma que a 360 px la cancha de 9 "necesita 326 px de contenido en 312 px disponibles". El ancho útil no se pudo reproducir en esta sesión: con `body` en 16 px de padding, `.wrap` en 760 px y `.team-panel` en 16 px de padding lateral, la cuenta da 296 px. ¿De dónde sale 312? | Lucas Manoukian | Implementation Plan | Cambia el tamaño del ajuste, no su necesidad: con cualquiera de los dos números la cancha de 9 desborda a 360 px. El Plan lo mide una vez sobre la aplicación real y fija el número bueno |
| OPEN-Q-05 | Las dos specs reemplazadas en su parte de presentación (`012-puntajes-coherentes-panel` y `008-duplas-rotacion`) están identificadas en el encabezado, pero todavía no quedaron marcadas como reemplazadas **en su propio archivo**. ¿Lo hace el Plan de esta rebanada o una tarea aparte? | Lucas Manoukian | Implementation Plan | El Principio I pide la declaración explícita de los dos lados. La mitad de esta Spec ya está hecha; falta la anotación recíproca en cada spec vieja |

## 17. Handoff to the Implementation Plan

- **El Plan debe respetar (sin relitigar):** todo `FR-*` (§7), todo `NFR-*` (§8),
  todo `TC-*` (§4 — incluidos los de seguridad de §4.5), todo `AC-*` (§11 —
  incluidos los seis meta-criterios `AC-50` a `AC-55` de §11.5), y las decisiones
  del Concept Note heredadas en §3.3.
- **El Plan tiene libertad sobre:** cómo se organiza el código dentro de
  `index.html`, los nombres de las funciones y de las clases CSS, la forma de
  construir el SVG, la técnica de escapado, cómo se estructura el escenario nuevo de
  `tests/layout.test.js` y sus invariantes, y el agrupamiento de commits.
- **El Plan debe resolver:** `OPEN-Q-03` (valores del escalón derivado),
  `OPEN-Q-04` (ancho útil real a 360 px) y `OPEN-Q-05` (spec vieja reemplazada).
- **El Plan debe arrastrar la deuda de verificación** de los marcadores
  `[UNVERIFIED]` de esta Spec, que son tres: el de `TC-013` (los ~341 px de ancho
  útil son aritmética, no medición — se cierra junto con `OPEN-Q-04`), el de §4.5
  (el ranking vigente del CWE Top 25 no se consultó) y el de `AC-15` (no se leyó si
  el arnés de tests permite observar las escrituras). El de `AC-55` (ausencia de
  lockfile) se cierra listando la raíz del repositorio.
- **Debe seguir siendo no-objetivo:** el arrastre, el panel de armado rediseñado,
  el partido finalizado, el modelo de eventos, la carga por toque, las opciones de
  configuración, los tamaños de cancha distintos de 8 y 9, y cualquier cambio en el
  motor de generación.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-02 | Lucas Manoukian | `FR-012` se invierte: una línea del catálogo sin unidades ahora se dibuja igual, vacía, en vez de omitirse. Reportado desde la rebanada 2 (el arrastre): mover a mano un jugador entre equipos puede dejar a uno sin nadie en una línea (p. ej. sin Ataque), y con el comportamiento original la línea de al lado subía a ocupar ese lugar — un volante terminaba viéndose donde antes estaba el delantero, dando la impresión de que jugaba ahí. Se ajustan `S-01b`, `S-02` y `S-02c`, que describían el comportamiento viejo como el correcto. `S-01a` de `ARRASTRE_SPEC.md` (rebanada 2) queda igual de afectado; se anota ahí también. Self-critique: no corresponde (enmienda posterior a la implementación, a pedido explícito de una corrección puntual). |
| 2026-08-31 | Lucas Manoukian | `FR-054` y el último *Then* de `S-06` quedan reemplazados por la rebanada 2: en una sola columna los equipos dejan de apilarse y pasan al selector segmentado. Cierra además la `OPEN-Q-01` de esta Spec, cuyo *target stage* era la Spec de la rebanada 2 o la 3. Self-critique: no corresponde (enmienda desde otra rebanada). |
| 2026-08-31 | Lucas Manoukian | `FR-053` queda sin efecto: la premisa de `D-03` —que la cancha de 9 desborda a 360 px— no se sostiene contra la implementación, porque las columnas son flexibles y se encogen. Se usan los escalones del handoff en todo el rango. Descubierto al ejecutar el gate del Principio V: el escenario nuevo **pasaba** con el escalón revertido, que es exactamente lo que ese gate existe para detectar. Self-critique: no corresponde (enmienda posterior a la implementación). |
| 2026-08-31 | Lucas Manoukian | Initial draft. Self-critique: passed (2🔴 / 6🟡 / 1🔵), todos resueltos antes de guardar. Los dos 🔴: una cita fabricada a `.specify/specs/006-panel-equipos/`, carpeta que no existe (006 es `copiar-formacion`) — reemplazada por las dos specs reales que esta Spec pisa en su parte de presentación; y TC-020, TC-030 y TC-031 sin criterio de cumplimiento en §11.3 — agregados como AC-23 y AC-24. Los 🟡: bandas de numeración de AC solapadas entre §11.2 y §11.3 (renumeradas a 11.1→AC-01.., 11.2→AC-10.., 11.3→AC-20.., 11.4→AC-40..), FR-023 y FR-024 compuestas (partidas), TC-013 prescribía un mecanismo de CSS en vez de una prohibición (reescrita), NFR-005 citaba un "navegador de referencia" inexistente (anclada al Chromium de Playwright que el repo ya usa), y dos afirmaciones sin verificar sin marcador (etiquetadas). El 🔵: OPEN-Q-05 se pudo cerrar a medias durante la pasada y quedó reformulada. |

---

*Esta Spec define qué debe hacer el sistema, cómo debe comportarse y qué
soluciones son admisibles para la rebanada 1 del rediseño. Las decisiones concretas
de implementación viven en el Implementation Plan de esta misma rebanada. La
motivación y el fundamento de las decisiones viven en
[EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md).*
