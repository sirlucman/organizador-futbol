# El panel de armado (rebanada 3 de "Equipos en el campo") — Spec

> **Status:** Draft · **Date:** 2026-08-31 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** [EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md)
>
> **Specs de las rebanadas anteriores:** [rebanada-1-cancha/CANCHA_SPEC.md](../rebanada-1-cancha/CANCHA_SPEC.md) ·
> [rebanada-2-arrastre/ARRASTRE_SPEC.md](../rebanada-2-arrastre/ARRASTRE_SPEC.md)
>
> **Implementation plan:** [PANEL_ARMADO_IMPLEMENTATION_PLAN.md](./PANEL_ARMADO_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** Esta Spec se apoya en el ledger §6.5
> *Sources & Origins* del Concept Note y en las Specs de las rebanadas 1 y 2, que
> ya fijaron la cancha, el candado, el arrastre y el selector de equipo sobre los
> que esta rebanada construye. Donde un `FR-*` / `NFR-*` / `TC-*` se apoya en una
> ubicación del código, en una medida del handoff o en una spec vigente que
> ninguno de esos tres documentos cubre, la cita va **en línea** en la sección
> donde se define el requisito. Las líneas de `index.html` citadas acá
> corresponden al estado del archivo después del merge de la rebanada 2
> (`618b2ae`), no al que el Concept Note citó antes de la rebanada 1.

> **Declaración de reemplazo (Principio I, enmienda 2.5.0).** Esta Spec
> reemplaza, cada uno en su parte, dos documentos vigentes:
>
> - [`.specify/specs/003-motor-generacion-equipos/spec.md`](../../../.specify/specs/003-motor-generacion-equipos/spec.md),
>   `FR-009` — queda reemplazada **la forma del resumen posterior a la
>   generación**. Los datos que ese requisito enumera se siguen mostrando todos,
>   pero tres de ellos dejan de tener cajita propia y se leen donde ya estaban
>   dichos: la formación de cada equipo es lo que la cancha dibuja, los jugadores
>   bloqueados y los titulares sin puntaje los enumera "Por qué quedaron así", y
>   los que cambiaron de equipo también. **No** se reemplaza ninguna regla del
>   motor: qué calcula, qué explica y en qué orden lo emite sigue siendo suyo
>   (`D-01`). Ver `D-23` del Concept Note y `FR-050` a `FR-054`.
> - [`.specify/specs/012-puntajes-coherentes-panel/spec.md`](../../../.specify/specs/012-puntajes-coherentes-panel/spec.md)
>   — queda reemplazada **la superficie donde se lee la cuenta de titulares sin
>   puntaje**: deja de ser el par de cajitas "Sin puntaje — Blanco: N" /
>   "Sin puntaje — Negro: N" y pasa a ser la línea del receipt, que a partir de
>   esta rebanada lo dice desglosado por equipo (`FR-052`). Su regla —que la
>   cuenta sea por **unidad de armado** y coincida con lo que el motor repartió
>   sin puntaje— se conserva sin cambios y es lo que `AC-06` verifica.
>
> - [`rebanada-2-arrastre/ARRASTRE_SPEC.md`](../rebanada-2-arrastre/ARRASTRE_SPEC.md),
>   `FR-043` — queda reemplazado: el subtítulo que aquella rebanada hizo nombrar el
>   gesto de arrastre **desaparece** (`FR-084`). El gesto se sigue anunciando en el
>   `title` de cada camiseta, que es el `FR-003` de aquella Spec y no se toca. Es
>   una enmienda dentro de la misma feature, una rebanada después, y la razón está
>   en `OPEN-Q-05`.
>
> Tampoco se reemplaza nada de
> [`007-permisos-por-usuario`](../../../.specify/specs/007-permisos-por-usuario/spec.md):
> su modelo de permisos —que el rol `jugador` no vea puntajes, estrategia,
> diferencias, jugadores sin puntaje, jugadores bloqueados ni la explicación del
> armado— se conserva entero, y es lo que `FR-046` y `FR-081` restatean para los
> bloques que esta rebanada rediseña.
>
> No se reemplaza nada de
> [`009-ventaja-sin-arquero`](../../../.specify/specs/009-ventaja-sin-arquero/spec.md):
> su `FR-010` —que el aviso se evalúe sobre el **desvío** respecto del objetivo y
> no sobre la diferencia cruda— es exactamente la regla que `FR-032` conserva al
> mover ese aviso al Badge del encabezado.
>
> La anotación recíproca en cada documento reemplazado queda pendiente, igual que
> en la rebanada 2; ver `OPEN-Q-01`.

> **Reemplazo parcial por la rebanada 4 (Principio I).** Resuelve la `OPEN-Q-01`
> de [`PARTIDO_FINALIZADO_SPEC.md`](../rebanada-4-partido-finalizado/PARTIDO_FINALIZADO_SPEC.md).
> Para el estado **finalizado, sin edición en curso**, esa Spec reemplaza en su
> parte:
>
> - `FR-060` — el botón "Editar resultado" deja el pie de la tarjeta y sube al
>   encabezado nuevo, como ícono (`FR-006` de la rebanada 4). "Finalizar
>   partido", "Guardar cambios" y "Cancelar" siguen exactamente igual, porque
>   ninguno de los tres aplica a este estado.
> - `FR-003` a `FR-005`, `FR-009`, `FR-037` (la píldora de diferencia) — no hay
>   ninguna comparación de puntaje que mostrar entre dos equipos ya jugados
>   (`FR-043` de la rebanada 4).
> - `FR-030` a `FR-036` (la diferencia por línea) — misma razón: no hay nada
>   que comparar sobre un partido ya finalizado.
> - `FR-040` a `FR-045` (el receipt "Por qué quedaron así") — misma razón.
> - `FR-083` — mientras el partido esté finalizado **y no se esté editando su
>   resultado**, la rebanada 4 lo invierte: los equipos pasan a mostrarse como
>   cancha, no como lista de filas (`FR-020` de la rebanada 4). Para la
>   inscripción cerrada sin finalizar y para la edición del resultado, `FR-083`
>   sigue exactamente como está.
> - `FR-083b` — sólo aplica, desde la rebanada 4, mientras los equipos se
>   sigan mostrando como lista de filas (inscripción cerrada sin finalizar, o
>   editando el resultado); en el estado finalizado sin editar ninguno de los
>   cuatro bloques que nombra existe ya, por las razones de arriba.
>
> Lo que **no** cambia: el motor, el modelo de datos, la cancha, la camiseta
> base, el candado, el arrastre, el selector de equipo y el combo de estrategia
> del estado de equipos generados siguen exactamente como esta Spec los deja.

## 1. Purpose

Esta Spec define **qué rodea a la cancha**: el encabezado de la tarjeta de
equipos, el combo de estrategia, el aviso de equipos desactualizados, los dos
bloques que explican el reparto —la diferencia por línea y "Por qué quedaron
así"— y la botonera al pie. Las rebanadas 1 y 2 pusieron la cancha adentro de una
tarjeta que por lo demás quedó tal cual estaba; esta rebanada rediseña esa
tarjeta y termina la pantalla de equipos generados. Es la tercera de las siete
rebanadas de `D-08`.

No cubre *por qué* se hace el rediseño (eso está en el Concept Note) ni *cómo* se
escribe el código (eso queda para el Implementation Plan). Tampoco cubre las
cuatro rebanadas pendientes: el partido finalizado (4), el modelo de eventos (5),
la carga por toque (6) ni las opciones de configuración (7).

## 2. Summary

Hoy, debajo de la cancha, hay cuatro cajitas monoespaciadas con la diferencia de
puntaje, los titulares sin puntaje de cada equipo y cuántos jugadores están
bloqueados; después otra fila de cajitas con el conteo de posiciones; después
otra con la diferencia de cada línea; y al final una caja con borde y fondo
propio titulada "Por qué quedaron así". Arriba de la cancha hay un combo de
estrategia con un ícono `?` que hay que descubrir y tocar para leer qué hace cada
una. La cancha nueva quedó en el medio de todo eso sin que nada de eso cambiara.

Esta rebanada lo ordena. El encabezado pasa a llevar el título, una píldora con
la diferencia de puntaje y dos botones redondos de sólo ícono —Copiar y
Regenerar—. El combo deja de esconder la explicación detrás de un `?` y muestra
debajo, siempre visible, el resumen de la estrategia elegida. Los tres resúmenes
que la cancha ya volvió redundantes se retiran, y queda un solo bloque de
números: cuatro celdas con la diferencia por línea, con el desvío aceptable
declarado al lado y el color reservado para las líneas donde el reparto
realmente podía haber hecho algo. "Por qué quedaron así" pierde la caja y pasa a
ser una lista de viñetas separada por un divisor. Y los números dejan de mentir
después de un movimiento manual: se recalculan sobre los equipos que están en
pantalla, mientras el texto sigue describiendo lo que hizo el motor. La
aplicación sigue siendo la misma organizadora de partidos previa al partido; lo
que cambia es que el panel que explica el reparto se lee de arriba abajo en vez
de en seis bloques que crecieron uno al lado del otro.

## 3. Scope

### 3.1 In scope

- El encabezado de la tarjeta de equipos: título, píldora de diferencia total y
  los botones de ícono Copiar y Regenerar.
- La confirmación de Copiar como cambio de ícono, en reemplazo del aviso flotante.
- El combo de estrategia con el resumen de la estrategia elegida visible debajo,
  y el retiro del ícono `?`.
- El aviso de equipos desactualizados: mismo texto, forma nueva.
- El bloque "Diferencia por línea y desvío aceptable", con su regla de color.
- El bloque "Por qué quedaron así", sin caja y con el desglose por equipo de los
  titulares sin puntaje.
- El retiro de los tres resúmenes en cajitas que la cancha y el receipt ya
  cubren.
- La botonera al pie de la tarjeta, con los estilos de botón del design system.
- El recálculo de la diferencia total y de la diferencia por línea sobre el
  reparto que está en pantalla.
- El retiro del subtítulo de la tarjeta, que la rebanada 2 dejó nombrando el
  gesto y que además repetía la estrategia.
- Los escenarios nuevos de `tests/layout.test.js` que cubren la tarjeta
  rediseñada.

### 3.2 Out of scope / non-goals

Los cinco no-objetivos del Concept Note §16 se heredan enteros. Además, y como
límites propios de esta rebanada:

- El sistema **no** modificará el motor de generación: ni qué calcula, ni qué
  explicaciones emite, ni en qué orden. La única cadena del receipt que cambia es
  la de titulares sin puntaje, que pasa a decirlo por equipo (`FR-052`, `D-23`);
  ninguna otra se reescribe y ninguna se agrega.
- El sistema **no** cambiará el texto que copia el botón Copiar: sigue siendo el
  formato armado para pegar en un chat
  ([`index.html:1217-1231`](../../../index.html#L1217-L1231)). Cambia dónde vive
  el botón y cómo confirma, no qué copia. Diferido en el Concept Note §14.
- El sistema **no** mostrará el bloque de diferencia por línea en las estrategias
  que no producen datos por línea. Con "Solo por puntaje" y "Por posición y
  puntaje" el armado guardado no lleva `balanceLineas`
  ([`index.html:3536`](../../../index.html#L3536)), y calcularlo en la pantalla
  sería agregarle al panel un dato que el motor no produjo.
- El sistema **no** agregará ningún parámetro de configuración: el desvío
  aceptable sigue siendo el `diferenciaMaxima` de la regla "Emparejar el puntaje"
  (`D-15`).
- El sistema **no** modificará la cancha, la camiseta, el candado, el arrastre ni
  el selector de equipo. El selector se conserva donde la rebanada 2 lo dejó
  —entre el combo y la cancha, que es donde el handoff lo dibuja— y no se extiende
  a ninguna otra pantalla (resuelve `OPEN-Q-05` de la rebanada 2).
- El sistema **no** agregará un equivalente del arrastre alcanzable sin puntero.
  Sigue sin haberlo, igual que antes de esta rebanada; ver `OPEN-Q-02`.
- El sistema **no** dibujará chips de estadística, ni tocará la pantalla de carga
  de resultado ni la de partido finalizado (rebanadas 4 y 6). Los botones que
  gobiernan esos estados se restilan, pero no cambian de comportamiento.
- El sistema **no** agregará ni modificará ningún campo persistido en Firestore.

### 3.3 Constraints inherited from the Concept Note

- **D-01** (el motor queda fuera de alcance) — heredada. Es la restricción que
  fija el límite del recálculo de `D-25`: se recalculan números derivados con
  funciones que ya existen, nunca se vuelve a generar.
- **D-02** (DOM + CSS vanilla dentro de `index.html`) — heredada; `TC-001`.
- **D-03** (el desborde a 360 px se resuelve achicando medidas en la franja
  360–390) — heredada. Esta rebanada no la reabre, pero le agrega carga a esa
  franja: el encabezado suma dos botones y una píldora, y la grilla suma cuatro
  celdas. `NFR-001` mide que la banda siga cumpliendo.
- **D-05** (el aviso de equipos desactualizados conserva su texto actual y adopta
  el estilo visual del handoff) — heredada. Ver `FR-020` a `FR-023`.
- **D-10** (el bloque "Por qué quedaron así" reutiliza literalmente las cadenas
  del motor real) — heredada. Ver `FR-040` a `FR-045` y `TC-012`.
- **D-14** (el combo muestra el `resumen` de la estrategia elegida como caption
  visible; la `descripcion` larga queda en Configuración del motor; desaparece el
  ícono `?`) — heredada, parcialmente revertida el 2026-09-02: el caption del
  `resumen` se saca (ver `FR-011`, §18); la `descripcion` larga sigue sólo en
  Configuración del motor y el ícono `?` sigue afuera. Ver `FR-010` a `FR-015`.
- **D-15** (el desvío aceptable es el `diffObjetivo` que ya existe; la grilla se
  muestra sin depender de él y el color aparece sólo cuando está configurado) —
  heredada. Ver `FR-030` a `FR-036`.
- **D-17** (las obligaciones de accesibilidad se enuncian en términos
  comprobables, sin citar cláusulas normativas) — heredada. Es la razón de que
  `NFR-003` hable de nombre accesible no vacío y `NFR-002` de un piso medible en
  píxeles.
- **D-19** y **D-20** (la edición manual es sólo entre equipos y no escribe la
  posición asignada de nadie) — heredadas. Son las que hacen que el recálculo de
  `D-25` sea barato: como la posición asignada no cambia, la diferencia por línea
  se vuelve a calcular con el mismo reparto de posiciones.
- **D-21** (en una sola columna se ve un equipo por vez, con el selector
  segmentado) — heredada. Fija dónde vive la píldora de diferencia en cada modo
  (`FR-004`, `FR-005`).
- **D-22** (la regla de color no alcanza a las líneas de un solo lugar por
  equipo) — heredada; es la decisión que esta Spec le pidió al Concept Note y que
  cierra su `OPEN-Q-07`. Ver `FR-034`.
- **D-23** (se retiran los tres resúmenes en cajitas; el receipt desglosa los
  titulares sin puntaje por equipo) — heredada. Ver `FR-050` a `FR-054`.
- **D-24** (sólo Copiar y Regenerar suben al encabezado; los botones de ciclo de
  vida siguen al pie, restilados) — heredada. Ver `FR-060` a `FR-064`.
- **D-25** (tras un movimiento manual los números se recalculan y el texto no) —
  heredada; cierra la `OPEN-Q-03` de la rebanada 2. Ver `FR-070` a `FR-073`.
- **D-08** (siete rebanadas, en orden) — heredada; fija §3.1 y §3.2.
- **D-11** (dos ramas por rebanada, `docs/` antes que `feature/`) — heredada; el
  Implementation Plan la ejecuta.

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — El panel se implementará como DOM + CSS dentro de `index.html`,
  con las mismas plantillas de cadena que el resto del archivo. No se incorporará
  el runtime del prototipo (`support.js`), ni sus etiquetas `<sc-for>` / `<sc-if>`,
  ni ningún componente React del bundle del design system (`D-02`).
- **TC-002** — No se agregará ninguna dependencia nueva: ni paquete, ni CDN, ni
  archivo cargado en tiempo de ejecución. El repositorio sigue sin lockfile
  (`AGENTS.md`, § Dependencias).
- **TC-003** — El combo de estrategia seguirá siendo un `<select>` nativo. No se
  reemplazará por un control propio: el nativo ya trae el teclado, el foco y el
  comportamiento del sistema en el celular, y el handoff lo dibuja como un
  `<select>` con `appearance: none`, es decir un `<select>` restilado.

### 4.2 Architectural / integration constraints

- **TC-010** — El panel **no invocará al motor de generación**. Los números que
  esta rebanada recalcula se derivarán de funciones puras ya existentes
  —`balanceLineasDe` ([`index.html:2724`](../../../index.html#L2724)) y las sumas
  por equipo— aplicadas al reparto que está en pantalla. Volver a generar para
  refrescar un número sería cambiar el armado que el administrador está mirando
  (`D-01`, `D-25`).
- **TC-011** — El recálculo será de **render**: no escribirá `m.equipos.balanceLineas`
  ni ningún otro campo del partido, y no disparará ningún guardado. El valor
  guardado por el motor se conserva como registro de lo que la generación produjo.
- **TC-012** — El bloque "Por qué quedaron así" se construirá a partir del mismo
  arreglo `explicaciones` que ya existe
  ([`index.html:4438-4581`](../../../index.html#L4438-L4581)), conservando cada
  cadena y el orden en que el motor las emite. La única modificación admitida es
  la de la línea de titulares sin puntaje ([`index.html:4442`](../../../index.html#L4442)),
  que gana el desglose por equipo (`FR-052`). El bloque no filtrará, reordenará ni
  reescribirá ninguna otra (`D-10`, Principio III).
- **TC-013** — La regla de color de `FR-034` reutilizará el predicado de línea de
  un solo lugar por equipo que el receipt ya usa
  ([`index.html:4476-4478`](../../../index.html#L4476-L4478)): la línea del arco
  siempre, más toda línea cuyo cupo en `m.equipos.formacion.objetivo` sea 1. No se
  definirá un predicado paralelo ni se codificarán "Arco" y "Ataque" como
  literales: en cuanto una cancha futura tenga dos delanteros, el literal mentiría
  y el predicado no.
- **TC-014** — Los tres resúmenes que `D-23` retira se **quitarán del DOM**, no se
  ocultarán con CSS ni quedarán detrás de una bandera. `D-12` ya fijó el criterio
  para la lista de equipos y vale igual acá: la red de seguridad es la rama sin
  mergear, no código muerto que después hay que mantener.
- **TC-015** — El bloque de diferencia por línea se mostrará exactamente en las
  mismas condiciones en que hoy se muestra: cuando el armado guardado lleva
  `balanceLineas` ([`index.html:4602`](../../../index.html#L4602)). La rebanada
  cambia su forma, no cuándo aparece.
- **TC-016** — La píldora de diferencia del encabezado evaluará su estado de
  exceso sobre el **desvío respecto del objetivo**, no sobre la diferencia cruda
  entre los dos equipos, conservando el `FR-010` de
  [`009-ventaja-sin-arquero`](../../../.specify/specs/009-ventaja-sin-arquero/spec.md).
  Es la distinción que existe hoy en
  [`index.html:4430-4436`](../../../index.html#L4430-L4436) y que hace que un
  armado que alcanzó una ventaja buscada de 6 puntos no se reporte como problema.

### 4.3 Compliance / regulatory constraints

- **TC-020** — No aplica ninguna obligación regulatoria de datos: la rebanada no
  introduce ningún dato nuevo, no cambia dónde se guarda ninguno y no agrega
  ningún destinatario. Concept Note §5.2.

### 4.4 Conventions to follow

- **TC-030** — Todo color, radio, sombra, espaciado y tipografía del panel saldrá
  del design system
  ([`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/)),
  en el orden que fija el Principio VI.
- **TC-031** — Las excepciones a `TC-030` —los valores que el handoff fija y el
  design system no nombra— se listarán explícitamente en el Implementation Plan,
  con el valor y la razón. Ninguna queda implícita en el CSS.
- **TC-032** — El comportamiento observable del panel se agregará como escenarios
  de `tests/layout.test.js` y de una suite de unidad, con el identificador de esta
  Spec en forma canónica dentro de un literal de cadena, según la convención de
  `AGENTS.md` § Tests.
- **TC-033** — La geometría, los colores y los tamaños del encabezado, del combo,
  del aviso, de la grilla y del receipt se tomarán del handoff
  ([`handoff/README.md`](../handoff/README.md), secciones *Botones de ícono del
  header*, *Combo de estrategia*, *Diferencia por línea y desvío aceptable*, *Por
  qué quedaron así* y *Componentes del design system usados*), y no de una
  interpretación propia.
- **TC-034** — Ninguna afirmación del handoff se copiará sin contrastarla contra
  el código o contra el prototipo interactivo. El Concept Note §17 inventaría los
  textos desactualizados y el error de símbolo que el handoff arrastra
  (`explicacionesGeneracion` no existe): esta rebanada toca justamente ese bloque.
- **TC-035** — El estado transitorio de la confirmación de Copiar será estado de
  pantalla y no se persistirá, igual que el equipo visible del selector
  (`TC-035` de la rebanada 2).

### 4.5 Security constraints (`MD-31`)

El Concept Note §5.2 declara la postura: ninguna entrada no confiable, escritura
sólo de administradores autenticados, SPA estática sin servidor propio. Sobre esa
base, las categorías aplicables del CWE Top 25 se acotan a control de acceso y a
la neutralización del texto que escriben los jugadores.

`[UNVERIFIED — offline; no se consultó https://cwe.mitre.org/top25/ en esta
sesión. Las categorías se nombran por su identificador y su título, que son
estables, pero el ranking vigente a la fecha no se verificó.]`

- **TC-040** — Regenerar, elegir la estrategia y los botones de ciclo de vida del
  partido sólo se ejecutarán cuando el rol de la sesión sea `admin`. La
  comprobación se hará **también dentro de cada manejador**, y no sólo al decidir
  qué botones se dibujan, replicando la guarda que `__generarEquipos`
  ([`index.html:3461`](../../../index.html#L3461)) y `__toggleBloqueo`
  ([`index.html:4036`](../../../index.html#L4036)) ya tienen. **Defiende `CWE-862` *Missing
  Authorization*** y **`CWE-863` *Incorrect Authorization***: un panel que sólo
  deja de dibujar el botón deja la acción alcanzable desde la consola.
- **TC-041** — Todo texto proveniente de un jugador que el panel introduzca en el
  DOM se insertará escapado, tanto en contenido como en atributos. Alcanza en
  particular a las explicaciones del receipt, que interpolan nombres completos
  ([`index.html:4554`](../../../index.html#L4554),
  [`index.html:4563`](../../../index.html#L4563)) y que hoy se insertan sin
  escapar dentro de `.explain-box`. **Defiende `CWE-79` *Cross-Site Scripting***.
  Es la misma obligación que ya rige en las rebanadas 1 y 2, y la aplicación ya
  tiene la función (`escaparHtml`); acá se hace explícita porque el bloque que se
  rediseña es uno de los que no la aplicaba.
- **TC-042** — El combo de estrategia sólo aceptará como valor una de las claves
  del catálogo `ESTRATEGIAS` ([`index.html:961`](../../../index.html#L961)) antes
  de escribir `m.estrategia`. **Defiende `CWE-20` *Improper Input Validation***:
  el valor de un `<select>` es tan modificable desde la consola como cualquier
  otro campo del DOM, y hoy se escribe sin validar
  ([`index.html:4319`](../../../index.html#L4319)).
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
| Administrador | Miembro del grupo con rol `admin`. Arma los partidos desde el celular. | Entender de un vistazo si el reparto quedó bien, por qué quedó así, y tener a mano las dos acciones que usa todo el tiempo: copiar y regenerar. |
| Jugador | Miembro del grupo con rol `jugador`. Sólo consulta. | Ver cómo quedaron los equipos y por qué, sin controles que no le corresponden. |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | Como administrador, quiero ver si los equipos quedaron parejos sin tener que leer cuatro cajitas, para decidir de un vistazo si regenero. | FR-003, FR-030 |
| US-02 | Como administrador, quiero saber qué hace cada estrategia mientras la elijo, sin tener que descubrir y tocar un ícono. | FR-011, FR-012 |
| US-03 | Como administrador, quiero copiar los equipos y regenerarlos desde el mismo lugar en el celular y en la computadora, sin buscar los botones al pie. | FR-001, FR-002 |
| US-04 | Como administrador, quiero que la diferencia por línea me señale sólo lo que el reparto podía haber arreglado, para que el rojo signifique algo. | FR-034 |
| US-05 | Como administrador, quiero que después de mover un jugador a mano los números de abajo digan lo que estoy viendo arriba. | FR-070, FR-071 |
| US-06 | Como administrador, quiero entender por qué el motor armó así sin que el texto compita visualmente con la cancha. | FR-040, FR-042 |
| US-07 | Como jugador, quiero ver cómo quedaron los equipos sobre la cancha, sin controles ni datos que no me corresponden. | FR-080, FR-081 |

## 6. Glossary

Los términos que las rebanadas 1 y 2 ya definieron —cancha, camiseta, unidad de
armado, dupla de rotación, línea, posición asignada, panel de equipo, selector de
equipo, una columna, dos columnas, movimiento— se usan acá con el mismo
significado y no se redefinen. Los propios de esta rebanada:

| Term | Definition |
|---|---|
| Tarjeta de equipos | La sección entera de la pantalla de partido que muestra los equipos generados: encabezado, combo, avisos, canchas y bloques de explicación. Es lo que hoy renderiza `renderTeamsSection` ([`index.html:4330`](../../../index.html#L4330)). |
| Encabezado de la tarjeta | La primera fila de la tarjeta: el título a la izquierda y, a la derecha, la píldora de diferencia y los botones de ícono. |
| Píldora de diferencia | El indicador que resume en una sola pieza cuánto se llevan los dos equipos: "Equipos parejos" o "Diferencia N pts". El handoff lo llama *Badge de diferencia*. |
| Estrategia elegida | La que está seleccionada en el combo, es decir `m.estrategia`. Puede no ser la que armó lo que se ve. |
| Estrategia aplicada | La que armó el reparto que está en pantalla, es decir `m.equipos.estrategiaKey`. Es la que el receipt describe. |
| Resumen de la estrategia | El texto corto de una línea que cada estrategia trae en su campo `resumen` ([`index.html:964`](../../../index.html#L964)) y que el combo muestra debajo. Distinto de la `descripcion` larga, que vive en Configuración del motor. |
| Aviso de equipos desactualizados | El bloque que aparece cuando algo cambió desde la última generación —convocatoria, estrategia, configuración del motor o duplas— y que ofrece regenerar. Es lo que hoy dispara `equiposStale()` ([`index.html:2025`](../../../index.html#L2025)). |
| Desvío aceptable | El máximo apartamiento tolerado entre la diferencia lograda y la buscada, antes de que el panel lo señale. Es el parámetro "Diferencia aceptable" de la regla "Emparejar el puntaje"; no se agrega ninguno (`D-15`). |
| Diferencia por línea | La comparación, línea por línea, entre lo que suma el Blanco y lo que suma el Negro en esa línea. La dupla de rotación cuenta como el promedio de sus dos integrantes, igual que en el total. |
| Línea de un solo lugar | Una línea que la formación de la cancha llena con un solo jugador por equipo. En fútbol 8 y 9 son el arco y el ataque. Su diferencia no se puede repartir: existe en cualquier armado posible. |
| Receipt | El bloque "Por qué quedaron así": la lista de razones que el motor emite para justificar el armado que produjo. Describe siempre la última generación. |
| Botonera | La fila de botones al pie de la tarjeta, con las acciones de ciclo de vida del partido: Finalizar partido, Editar resultado, Guardar cambios, Cancelar. |

## 7. Functional requirements

> Se usa la sintaxis EARS: *ubicuo* ("El sistema…"), *por evento* ("Cuando…"),
> *por estado* ("Mientras…"), *opcional* ("Donde…") y *no deseado* ("Si…,
> entonces…"). Una obligación por línea.

### 7.1 El encabezado de la tarjeta

- **FR-001** — Mientras el partido tenga equipos generados, el sistema mostrará en
  el encabezado de la tarjeta un botón de sólo ícono para copiar los equipos, con
  cualquiera de los dos roles. El rol `jugador` ya lo tenía, y el texto que copia
  son nombres, sin puntajes ni estrategia, así que no expone nada que
  `007-permisos-por-usuario` le prohíba ver.
- **FR-002** — Donde el rol de la sesión sea `admin`, el partido tenga equipos
  generados y la inscripción no esté cerrada, el sistema mostrará en el
  encabezado de la tarjeta un botón de sólo ícono para regenerar los equipos.
- **FR-002b** — El sistema ordenará los dos botones de ícono con Copiar primero y
  Regenerar después.
- **FR-002c** — El sistema distinguirá visualmente a Regenerar como la acción
  principal del encabezado.
- **FR-003** — El sistema mostrará en la tarjeta una píldora con la diferencia de
  puntaje entre los dos equipos.
- **FR-003b** — Mientras la diferencia de puntaje sea 0, el sistema dará a la
  píldora el texto "Equipos parejos".
- **FR-003c** — Mientras la diferencia de puntaje no sea 0, el sistema dará a la
  píldora el texto "Diferencia N pts".
- **FR-004** — Mientras la tarjeta esté en dos columnas, el sistema ubicará la
  píldora de diferencia en el encabezado, a la izquierda de los botones de ícono.
- **FR-005** — Mientras la tarjeta esté en una sola columna, el sistema ubicará la
  píldora de diferencia en la fila del encabezado del equipo visible, junto a su
  puntaje total.
- **FR-006** — Cuando el administrador active el botón de copiar y la copia se
  complete, el sistema reemplazará el ícono del botón por un tilde durante
  1800 ms y después lo restituirá, sin mostrar ningún aviso flotante.
- **FR-006b** — Si la copia al portapapeles falla o el navegador no la permite,
  entonces el sistema informará el error con el aviso flotante que ya usa hoy
  ([`index.html:1238`](../../../index.html#L1238)).
- **FR-006c** — Si la copia al portapapeles falla o el navegador no la permite,
  entonces el sistema no mostrará el tilde de confirmación.
- **FR-007** — El sistema dará a cada botón de ícono un nombre accesible que
  describa la acción, y el mismo texto como descripción emergente.
- **FR-008** — El sistema no cambiará el texto que el botón de copiar escribe en
  el portapapeles.
- **FR-009** — Cuando la diferencia buscada de este armado no sea cero, el sistema
  la declarará en la descripción emergente de la píldora, nombrando a qué equipo
  favorece.

### 7.2 El combo de estrategia

- **FR-010** — Donde el rol de la sesión sea `admin`, el sistema mostrará el combo
  de estrategia arriba de las canchas, con la etiqueta "ESTRATEGIA" a su
  izquierda.
- **FR-011** — El sistema no mostrará ningún resumen ni explicación de la
  estrategia debajo del combo: sólo el nombre de la estrategia elegida, en el
  propio `<select>`. *(Invertido 2026-09-02, ver §18: mostrar el resumen
  permanente resultó ser más ruido que ayuda en la pantalla de equipos
  generados — el campo `resumen` del catálogo sigue existiendo, pero ya no se
  lee en ningún render.)*
- **FR-012** — El sistema dejará de exponer el ícono `?` y su descripción
  emergente en la etiqueta del combo.
- **FR-013** — *(Sin efecto desde 2026-09-02, ver §18: sin resumen visible no
  hay nada que repintar al cambiar de estrategia; el cambio ya no regenera los
  equipos, que es lo único de este requisito que seguía aplicando.)*
- **FR-014** — Si el valor recibido del combo no corresponde a una clave del
  catálogo de estrategias, entonces el sistema no lo escribirá en el partido y
  conservará la estrategia elegida anterior.
- **FR-015** — Mientras la inscripción del partido esté cerrada o el partido esté
  finalizado, el sistema no mostrará el combo. *(Enmendado 2026-09-02, ver §18:
  antes quedaba deshabilitado pero visible; en ese estado ya no se puede tocar,
  así que mostrarlo deshabilitado no aportaba nada.)*

### 7.3 El aviso de equipos desactualizados

- **FR-020** — Mientras el armado en pantalla esté desactualizado respecto de la
  convocatoria, la estrategia elegida, la configuración del motor o las duplas, el
  sistema mostrará el aviso de equipos desactualizados entre el combo y las
  canchas.
- **FR-021** — El sistema conservará el texto actual del aviso, que cubre los
  cuatro disparadores, y no adoptará el del handoff, que sólo cubre el de
  estrategia (`D-05`).
- **FR-022** — El sistema mostrará dentro del aviso un botón para regenerar los
  equipos.
- **FR-023** — Cuando la regeneración se complete, el sistema dejará de mostrar el
  aviso.
- **FR-024** — Mientras la inscripción del partido esté cerrada o el partido esté
  finalizado, el sistema no mostrará el aviso, como hoy.

### 7.4 La diferencia por línea y el desvío aceptable

- **FR-030** — Mientras el armado en pantalla lleve datos de balance por línea, el
  sistema mostrará debajo de las canchas un bloque con una celda por línea.
- **FR-031** — El sistema mostrará en cada celda el nombre de la línea, el puntaje
  del Blanco, el del Negro y la diferencia entre los dos, expresada como "+N
  Blanco", "+N Negro" o "Parejo".
- **FR-031b** — El sistema nombrará cada línea con la misma etiqueta que ya usa el
  resto de la aplicación: Arco, Defensa, Medio y Ataque
  ([`index.html:2448`](../../../index.html#L2448)).
- **FR-032** — Mientras haya un desvío aceptable configurado, el sistema lo
  declarará en el encabezado del bloque.
- **FR-033** — Mientras haya un desvío aceptable configurado, el sistema
  distinguirá visualmente las celdas cuya diferencia lo supera de las que entran.
- **FR-034** — El sistema no distinguirá como excedida ninguna celda de una línea
  de un solo lugar por equipo, aunque su diferencia supere el desvío aceptable
  (`D-22`).
- **FR-035** — Mientras no haya desvío aceptable configurado, el sistema mostrará
  el bloque sin distinguir ninguna celda y sin declarar umbral alguno.
- **FR-036** — El sistema contará el puntaje de una dupla de rotación como el
  promedio de sus dos integrantes, tanto en la diferencia por línea como en el
  total, sin cambiar cómo se calcula hoy.
- **FR-037** — Mientras haya un desvío aceptable configurado y el desvío del
  armado lo supere, el sistema distinguirá visualmente la píldora de diferencia
  del encabezado.

### 7.5 Por qué quedaron así

- **FR-040** — Mientras el motor haya emitido al menos una explicación del armado,
  el sistema mostrará el bloque "Por qué quedaron así" debajo de la diferencia por
  línea.
- **FR-041** — El sistema mostrará las explicaciones como una lista de viñetas, en
  el orden en que el motor las emite.
- **FR-042** — El sistema mostrará el bloque sin caja, sin borde y sin fondo
  propio, separado de lo anterior por un divisor.
- **FR-043** — El sistema no agregará, no quitará y no reescribirá ninguna
  explicación del motor, salvo la de `FR-052`.
- **FR-044** — El sistema insertará escapado todo texto proveniente de un jugador
  que aparezca dentro de una explicación.
- **FR-045** — Si el motor no emitió ninguna explicación, entonces el sistema no
  mostrará el bloque ni su divisor.
- **FR-046** — Donde el rol de la sesión sea `jugador`, el sistema no mostrará
  el bloque, como hoy.

### 7.6 Los resúmenes que se retiran

- **FR-050** — El sistema dejará de mostrar el conteo de posiciones por equipo
  ([`index.html:4592-4595`](../../../index.html#L4592-L4595)). Lo que ese conteo
  decía es lo que la cancha dibuja.
- **FR-051** — El sistema dejará de mostrar las cajitas de titulares sin puntaje
  por equipo y de jugadores bloqueados
  ([`index.html:4636-4638`](../../../index.html#L4636-L4638)). Lo que esas tres
  decían lo enumera el receipt.
- **FR-052** — Mientras haya al menos un titular sin puntaje, el sistema declarará
  en el receipt cuántos son en total y cuántos quedaron en cada equipo.
- **FR-053** — El sistema dejará de mostrar la cajita de diferencia de puntaje,
  cuyo contenido pasa a la píldora del encabezado (`FR-003`, `FR-009`, `FR-037`).
- **FR-054** — El sistema conservará el puntaje total de cada equipo en el
  encabezado de su panel, sin cambios.

### 7.7 La botonera al pie

- **FR-060** — El sistema mantendrá al pie de la tarjeta los botones de ciclo de
  vida del partido: Finalizar partido, Editar resultado, Guardar cambios y
  Cancelar, cada uno en las mismas condiciones en que aparece hoy.
- **FR-061** — El sistema dará a esos botones los estilos de botón del design
  system, distinguiendo la acción principal de cada estado de las secundarias.
- **FR-062** — El sistema conservará el texto visible de cada uno de esos botones.
- **FR-063** — El sistema dejará de mostrar al pie los botones de Copiar y de
  Regenerar, que pasan al encabezado.
- **FR-064** — Mientras la tarjeta no tenga ningún botón de ciclo de vida
  aplicable, el sistema no mostrará la botonera.

### 7.8 Los números después de un movimiento manual

- **FR-070** — Cuando el sistema aplique un movimiento manual, recalculará la
  diferencia de puntaje mostrada en la píldora sobre el reparto resultante.
- **FR-071** — Cuando el sistema aplique un movimiento manual, recalculará la
  diferencia por línea de cada celda sobre el reparto resultante.
- **FR-072** — El sistema no modificará el texto del receipt como consecuencia de
  un movimiento manual: el receipt sigue describiendo la última generación
  (`D-25`).
- **FR-073** — El sistema no escribirá el resultado del recálculo en el partido ni
  disparará un guardado por causa del recálculo.
- **FR-074** — Cuando el sistema aplique un movimiento manual, recalculará la
  cuenta de titulares sin puntaje por equipo que muestra el receipt (`FR-052`).

### 7.9 Estados y roles

- **FR-080** — Donde el rol de la sesión sea `jugador`, el sistema no mostrará el
  combo de estrategia, ni el aviso de equipos desactualizados, ni el botón de
  regenerar, ni la botonera. El botón de copiar sí se muestra (`FR-001`).
- **FR-081** — Donde el rol de la sesión sea `jugador`, el sistema no mostrará la
  píldora de diferencia, ni la diferencia por línea, ni el receipt. Conserva sin
  cambios el modelo de permisos de
  [`007-permisos-por-usuario`](../../../.specify/specs/007-permisos-por-usuario/spec.md)
  `FR-005`, cuyo escenario 2 declara que el rol `jugador` no ve puntajes,
  estrategia, diferencias, jugadores sin puntaje, jugadores bloqueados ni la
  explicación del armado. El jugador sigue viendo la cancha con los nombres, que
  es lo que la rebanada 1 le dio.
- **FR-082** — Si el rol de la sesión no es `admin`, entonces el sistema no
  ejecutará regenerar, ni el cambio de estrategia, ni ninguna acción de la
  botonera, aunque se las invoque directamente.
- **FR-083** — Mientras la inscripción del partido esté cerrada, el partido esté
  finalizado o se esté editando el resultado de un partido finalizado, el sistema
  seguirá mostrando los equipos como lista de filas y no como cancha, tal como la
  rebanada 1 lo dejó ([`index.html:3766`](../../../index.html#L3766)).
- **FR-083b** — Mientras los equipos se muestren como lista de filas, el sistema
  mostrará igualmente los bloques de esta rebanada que no dependen de la cancha:
  la píldora de diferencia, la diferencia por línea, el receipt y la botonera.
- **FR-084** — El sistema retirará el subtítulo de la tarjeta. Con él dejan de
  mostrarse la estrategia **aplicada** y la mención del gesto de arrastre.
- **FR-085** — El sistema no declarará en ninguna parte de la tarjeta cuál fue la
  estrategia aplicada. Cuando la elegida y la aplicada difieran, lo único que lo
  señala es el aviso de `FR-020`, que dice **que** difieren y no **cuál** se
  aplicó. Es una pérdida de información, decidida a la vista de la pantalla real:
  el subtítulo repetía en cuatro renglones grises, arriba de la cancha y en un
  teléfono, un nombre que el combo ya muestra dos píxeles más arriba, y el caso en
  que aportaba algo —elegida y aplicada distintas— es el minoritario. Ver
  `OPEN-Q-05`.

## 8. Non-functional requirements

> **Objetivo cuantificado.** A los efectos de `AC-51` y de las tareas de
> verificación del Implementation Plan, los NFR con objetivo cuantificado de esta
> Spec son exactamente `NFR-001`, `NFR-002`, `NFR-004` y `NFR-005`. Los otros
> tres son obligaciones binarias verificables, no medidas con umbral, y se
> gatean por revisión o por aserción de presencia.

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Responsive / layout | En cada uno de los anchos que mide `tests/layout.test.js` (360, 390, 430, 479, 481, 559, 561, 600, 699, 701, 768, 900, 1200 px), la pantalla de equipos generados sigue cumpliendo las dos condiciones del Principio V: `scrollWidth === clientWidth` y ningún elemento con su borde derecho fuera del viewport. Es no-regresión sobre el `NFR-001` de las rebanadas 1 y 2, ahora con el encabezado de dos íconos más píldora y con la grilla de cuatro celdas en pantalla. |
| NFR-002 | Usabilidad | El área interactiva de cada botón de ícono del encabezado no es menor a 44×44 px en todos los anchos medidos, aunque el ícono dibujado mida 15 o 16 px. Son las dos acciones que el administrador usa a diario y quedan en la esquina superior de la tarjeta, donde el pulgar llega peor. |
| NFR-003 | Accesibilidad | Cada botón de ícono del encabezado tiene un nombre accesible no vacío que describe su acción, y ninguna información del panel queda expresada **sólo** por color: la celda que supera el desvío aceptable y la píldora excedida lo declaran además en texto. La grilla de `FR-031` ya dice "+N Blanco" en cada celda, y `FR-032` declara el umbral en palabras. |
| NFR-004 | Rendimiento | Recalcular la píldora, la grilla y la cuenta de sin puntaje, y repintar la tarjeta, con un plantel de 18 titulares, no supera los 150 ms medidos con `performance.now()` en el Chromium que `tests/layout.test.js` ya conduce vía Playwright. Es el mismo techo que el `NFR-004` de la rebanada 2 le puso a un movimiento completo, del que este recálculo pasa a ser parte. |
| NFR-005 | Compatibilidad de datos | El conjunto de campos escritos en el documento de partido por esta rebanada es **vacío**: ningún camino nuevo escribe, y el recálculo de `FR-070` a `FR-073` no persiste nada. Los campos que el cambio de estrategia y la regeneración ya escribían no cambian de forma. |
| NFR-006 | Mantenibilidad | Todo valor de color, espaciado, radio, sombra y tipografía del panel proviene de un token del design system o de una excepción listada en el Implementation Plan; no queda ningún valor literal sin declarar. |
| NFR-007 | Fidelidad del receipt | El conjunto de explicaciones que el panel muestra para un armado dado es idéntico, cadena por cadena y en el mismo orden, al que la aplicación muestra hoy, con la única excepción de la línea de titulares sin puntaje de `FR-052`. Se verifica comparando la lista producida antes y después del cambio sobre los mismos armados de prueba. |

## 9. System behaviour & scenarios

> **Nota sobre el alcance de los tests.** Los escenarios de esta sección están
> escritos sobre lo que es verificable mecánicamente: qué bloques existen en el
> DOM y cuáles no, qué texto llevan, qué números producen las funciones puras que
> los alimentan, y qué cambia cuando el reparto cambia. La apariencia —que el
> divisor se vea, que el verde sea el verde— no se convierte en criterio de
> aceptación automático: se valida mirándola en la aplicación real, igual que las
> rebanadas 1 y 2, y queda registrada en `AC-14`.

### 9.1 Happy path scenarios

#### Scenario S-01 — El encabezado resume el armado y ofrece las dos acciones (covers FR-001, FR-002, FR-002b, FR-002c, FR-003, FR-003b, FR-003c, FR-004, FR-007)

- **Given** un partido de fútbol 8 con la inscripción abierta y los equipos ya generados
- **And** una sesión con rol `admin` en un viewport de 1200 px
- **When** se abre el detalle del partido
- **Then** el encabezado de la tarjeta contiene la píldora de diferencia, un botón de copiar y un botón de regenerar, en ese orden
- **And** cada botón expone un nombre accesible no vacío que describe su acción
- **And** la píldora dice "Equipos parejos" si la diferencia es 0, y "Diferencia N pts" en cualquier otro caso

**Variants:**

- `S-01a [boundary]` — la diferencia es exactamente 0: la píldora dice "Equipos parejos" y no "Diferencia 0 pts"
- `S-01b [boundary]` — en un viewport de 360 px la píldora no está en el encabezado sino en la fila del equipo visible (`FR-005`)
- `S-01c [failure]` — la inscripción está cerrada: el botón de regenerar no está en el encabezado y el de copiar sí (`FR-002`)
- `S-01d [failure]` — la sesión es de rol `jugador`: el botón de regenerar y la píldora no están en el DOM, y el de copiar sí (`FR-001`, `FR-080`, `FR-081`)
- `S-01e [boundary]` — el armado tiene una diferencia buscada distinta de cero: la píldora la declara en su descripción emergente (`FR-009`)

#### Scenario S-02 — El combo sólo nombra la estrategia, sin explicarla (covers FR-010, FR-011, FR-012, FR-015)

*(Título y cuerpo reescritos el 2026-09-02, ver §18 — describía lo opuesto: que el combo SÍ explicaba la estrategia con un resumen permanente. `FR-013`, que este escenario cubría, quedó sin efecto y se sacó de la lista.)*

- **Given** un partido con equipos generados y una sesión con rol `admin`
- **When** se abre el detalle del partido
- **Then** el combo muestra el nombre de la estrategia elegida, sin ningún texto de resumen debajo
- **And** no existe en la tarjeta ningún ícono `?` con descripción emergente de estrategia
- **When** se elige otra estrategia en el combo
- **Then** el reparto en pantalla no cambia

**Variants:**

- `S-02a [property]` — para cada una de las cuatro estrategias del catálogo, el campo `resumen` existe, no está vacío y es distinto del de las otras tres. *(Alcance reducido el 2026-09-02, ver §18: ya no valida qué se muestra —nada se muestra—, sino sólo la integridad del dato, que sigue viviendo en el catálogo aunque ningún render lo lea.)*
- `S-02b [failure]` — la inscripción está cerrada: el combo no se muestra (`FR-015`)
- `S-02c [failure]` — la sesión es de rol `jugador`: no hay combo (`FR-080`)

#### Scenario S-03 — El aviso de desactualizado conserva su texto y ofrece regenerar (covers FR-020, FR-021, FR-022, FR-023)

- **Given** un partido con equipos generados y una sesión con rol `admin`
- **When** cambia la convocatoria, la estrategia elegida, la configuración del motor o las duplas
- **Then** aparece el aviso de equipos desactualizados entre el combo y las canchas
- **And** su texto es el que la aplicación ya usaba, que nombra los cuatro disparadores
- **And** el aviso contiene un botón para regenerar
- **When** se regenera
- **Then** el aviso desaparece

**Variants:**

- `S-03a [boundary]` — el disparador es sólo el cambio de estrategia: el aviso aparece igual y con el mismo texto
- `S-03b [boundary]` — el disparador es sólo un cambio de duplas: el aviso aparece igual
- `S-03c [failure]` — la inscripción está cerrada: no hay aviso aunque el armado esté desactualizado (`FR-024`)

#### Scenario S-04 — La diferencia por línea señala sólo lo que el reparto podía arreglar (covers FR-030, FR-031, FR-031b, FR-032, FR-033, FR-034, FR-035)

- **Given** un armado generado con una estrategia que produce balance por línea
- **And** un desvío aceptable configurado en 1 punto
- **And** una diferencia de 3 puntos en el Medio y de 4 puntos en el Arco
- **When** se muestra la tarjeta
- **Then** el bloque tiene una celda por línea, nombradas Arco, Defensa, Medio y Ataque
- **And** cada celda muestra el puntaje de cada equipo y la diferencia como "+N Blanco", "+N Negro" o "Parejo"
- **And** el encabezado del bloque declara el desvío aceptable
- **And** la celda de Medio queda distinguida como excedida
- **And** la celda de Arco **no** queda distinguida, pese a superar el umbral

**Variants:**

- `S-04a [boundary]` — la diferencia de una línea es exactamente igual al desvío aceptable: no queda distinguida, porque la regla es "supera", no "alcanza"
- `S-04b [boundary]` — la diferencia de una línea es 0: la celda dice "Parejo"
- `S-04c [boundary]` — no hay desvío aceptable configurado: el bloque se muestra completo, sin umbral declarado y sin ninguna celda distinguida (`FR-035`)
- `S-04d [boundary]` — el partido es de fútbol 9: el Medio tiene cuatro lugares por equipo y sí puede quedar distinguido; Arco y Ataque siguen sin poder
- `S-04e [property]` — para todo armado, ninguna línea cuyo cupo en la formación objetivo sea 1 queda distinguida como excedida
- `S-04f [failure]` — el armado guardado no lleva balance por línea: el bloque no se dibuja (`TC-015`)
- `S-04g [failure]` — la sesión es de rol `jugador`: el bloque no se dibuja aunque el armado lleve balance (`FR-081`)

#### Scenario S-05 — El receipt dice lo mismo que decía, sin caja (covers FR-040, FR-041, FR-042, FR-043, FR-052, NFR-007)

- **Given** un armado generado con dos titulares sin puntaje, uno en cada equipo, y un jugador bloqueado
- **When** se muestra la tarjeta
- **Then** el bloque "Por qué quedaron así" lista las explicaciones del motor como viñetas, en el orden en que el motor las emite
- **And** el bloque no tiene borde ni fondo propio: se separa de lo anterior con un divisor
- **And** una de las líneas declara cuántos titulares sin puntaje hay en total y cuántos en cada equipo
- **And** otra declara que el jugador bloqueado permaneció en su equipo
- **And** ninguna otra línea difiere de la que la aplicación mostraba antes de esta rebanada

**Variants:**

- `S-05a [boundary]` — hay un solo titular sin puntaje: la línea usa el singular y ubica el equipo correcto
- `S-05b [boundary]` — no hay ningún titular sin puntaje: la línea no se emite
- `S-05c [boundary]` — el motor no emitió ninguna explicación: el bloque y su divisor no se dibujan (`FR-045`)
- `S-05e [failure]` — la sesión es de rol `jugador`: el bloque no se dibuja aunque haya explicaciones (`FR-046`)
- `S-05d [property]` — para cada armado de prueba, la lista de explicaciones coincide cadena por cadena con la de antes del cambio, salvo la de titulares sin puntaje

#### Scenario S-06 — Los números siguen al reparto y el texto no (covers FR-070, FR-071, FR-072, FR-073, FR-074, D-25)

- **Given** un partido con equipos generados con una estrategia que produce balance por línea
- **And** una sesión con rol `admin` y la inscripción abierta
- **When** el administrador pasa un jugador al otro equipo arrastrando su camiseta
- **Then** la píldora de diferencia muestra la diferencia del reparto resultante
- **And** las celdas de diferencia por línea muestran los puntajes del reparto resultante
- **And** el bloque "Por qué quedaron así" muestra exactamente las mismas líneas que antes del movimiento
- **And** el documento de partido no registra ninguna escritura causada por el recálculo

**Variants:**

- `S-06a [property]` — para todo movimiento, la suma de los puntajes por línea del Blanco recalculados es igual al total del Blanco recalculado
- `S-06b [boundary]` — el movimiento es un intercambio de dos jugadores: los dos totales y las dos líneas afectadas se recalculan
- `S-06c [boundary]` — la unidad movida es una dupla de rotación: su puntaje entra en la línea de destino como el promedio de los dos integrantes (`FR-036`)
- `S-06d [boundary]` — el movimiento deja a un equipo sin ningún jugador en una línea: esa celda muestra 0 para ese equipo y la diferencia correspondiente
- `S-06e [boundary]` — el movimiento cambia de equipo a un titular sin puntaje: la línea del receipt de `FR-052` cambia su desglose (`FR-074`)
- `S-06f [failure]` — el armado no lleva balance por línea: sólo se recalcula la píldora, y no se dibuja ninguna celda

#### Scenario S-07 — Copiar confirma con su propio ícono (covers FR-006, FR-006b, FR-006c, FR-008)

- **Given** un partido con equipos generados y una sesión con rol `admin`
- **When** el administrador activa el botón de copiar y la copia se completa
- **Then** el ícono del botón pasa a ser un tilde
- **And** no se muestra ningún aviso flotante
- **And** el texto escrito en el portapapeles es el mismo que la aplicación copiaba antes de esta rebanada
- **And** pasados 1800 ms el ícono vuelve a ser el de copiar

**Variants:**

- `S-07a [failure]` — el navegador no permite acceder al portapapeles: se muestra el aviso flotante de error y el ícono no cambia
- `S-07b [failure]` — la escritura al portapapeles se rechaza: mismo comportamiento que `S-07a`
- `S-07c [concurrency]` — se activa copiar dos veces seguidas antes de que venza el plazo: el ícono queda en tilde y vuelve una sola vez, sin quedar trabado

### 9.2 Edge cases

#### Scenario S-10 — Un armado guardado antes del balance por línea (covers FR-030, TC-015)

- **Given** un partido cuyo armado se generó antes de que existiera el balance por línea, y por lo tanto no lo lleva
- **When** se muestra la tarjeta
- **Then** el bloque de diferencia por línea no se dibuja
- **And** el resto del panel se muestra completo y sin errores

Variants: none — single-path scenario.

#### Scenario S-11 — La tarjeta sin cancha conserva los bloques nuevos (covers FR-083, FR-083b)

- **Given** un partido con la inscripción cerrada y el resultado en carga
- **When** se muestra la tarjeta
- **Then** los equipos se siguen mostrando como lista de filas y no como cancha
- **And** la píldora de diferencia, la diferencia por línea, el receipt y la botonera se muestran igual

**Variants:**

- `S-11a [boundary]` — el partido está finalizado: mismo resultado
- `S-11b [boundary]` — se está editando el resultado de un partido finalizado: mismo resultado

### 9.3 Failure / unwanted-behaviour scenarios

#### Scenario S-20 — Una sesión sin permiso invoca una acción del panel (covers FR-082, TC-040)

- **Given** una sesión con rol `jugador` sobre un partido con equipos generados
- **When** se invoca directamente la regeneración, el cambio de estrategia o una acción de la botonera
- **Then** el sistema no modifica el partido
- **And** el documento de partido no registra ninguna escritura

**Variants:**

- `S-20a [failure]` — se invoca la regeneración: sin escritura
- `S-20b [failure]` — se invoca el cambio de estrategia: sin escritura
- `S-20c [failure]` — se invoca finalizar el partido: sin escritura

#### Scenario S-21 — El combo recibe un valor que no es una estrategia (covers FR-014, TC-042)

- **Given** una sesión con rol `admin` sobre un partido con equipos generados
- **When** el combo emite un valor que no corresponde a ninguna clave del catálogo
- **Then** el sistema no lo escribe en el partido
- **And** la estrategia elegida sigue siendo la anterior

**Variants:**

- `S-21a [failure]` — el valor es una cadena vacía
- `S-21b [failure]` — el valor es una clave que no existe en el catálogo

#### Scenario S-22 — Un nombre con caracteres de marcado dentro del receipt (covers FR-044, TC-041)

- **Given** un jugador bloqueado cuyo nombre contiene caracteres de marcado
- **When** se muestra el bloque "Por qué quedaron así"
- **Then** la explicación muestra el nombre como texto literal
- **And** no se ejecuta ningún script

**Variants:**

- `S-22a [failure]` — el nombre contiene una comilla doble, que es la que rompe un atributo
- `S-22b [failure]` — el nombre aparece en la explicación de arquero excedente y no en la de bloqueado: mismo resultado

### 9.4 Dónde se lee cada dato después del retiro

`D-23` retira tres bloques, y la pregunta que un lector se hace es adónde fue
cada dato. La tabla fija la respuesta dato por dato; la prosa de §7 sigue siendo
el contrato.

> No se incluye diagrama en esta sección. `MD-24` admite para la §9 de una Spec
> sólo `sequenceDiagram` y `stateDiagram-v2`, y este contenido no es ni una
> secuencia entre actores ni una máquina de estados: es una correspondencia, que
> una tabla expresa mejor y sin salirse del vocabulario.

| Dato retirado | Dónde se lee ahora | Requisito |
|---|---|---|
| Conteo de posiciones por equipo | La cancha, que lo dibuja | `FR-050` |
| Titulares sin puntaje por equipo | El receipt, con el desglose por equipo | `FR-052` |
| Jugadores bloqueados | El receipt, una línea por jugador bloqueado | `FR-051` |
| Diferencia de puntaje | La píldora del encabezado | `FR-003`, `FR-053` |
| Desvío aceptable | El encabezado del bloque de diferencia por línea | `FR-032` |
| Diferencia buscada | La descripción emergente de la píldora | `FR-009` |

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

Esta rebanada **no introduce ninguna entidad de dominio nueva** y tampoco agrega
atributos a las existentes. Es un rediseño de presentación sobre datos que ya
existen: el partido con su reparto (`m.equipos`), el catálogo de estrategias y la
configuración del motor. El único estado nuevo es el plazo de la confirmación de
Copiar, que es de pantalla y no se persiste (`TC-035`).

Por lo tanto **no se incluye diagrama entidad-relación** en §10.1.1: la
obligación de `MD-24` se dispara con al menos una entidad nueva, y acá no hay
ninguna. El modelo de datos cambia en la rebanada 5.

### 10.2 External APIs / events the feature consumes

| Source | Contract | Direction | Notes |
|---|---|---|---|
| Cloud Firestore | Documento de partido, con `equipos`, `estrategia` y `bloqueados` | inbound | Sin cambio de forma. |
| Firebase Auth | Rol de la sesión (`admin` / `jugador`) | inbound | Sin cambio. Resuelto por `isAdmin()`. |
| Configuración del motor | Regla "Emparejar el puntaje", parámetro `diferenciaMaxima` | inbound | Es el desvío aceptable (`D-15`). No se agrega ningún parámetro. |
| Navegador | `navigator.clipboard` | outbound | Ya se usa. Cambia sólo cómo se confirma el éxito (`FR-006`). |

### 10.3 External APIs / events the feature exposes

| Endpoint / event | Inputs | Outputs | Notes |
|---|---|---|---|
| — | — | — | La rebanada no expone ninguna interfaz nueva y no agrega ningún camino de escritura (`NFR-005`). |

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — Todos los escenarios de §9.1 pasan contra la aplicación real
  (cubre `FR-001` a `FR-074`).
- **AC-02** — En un viewport de 1200 px, el encabezado de la tarjeta contiene la
  píldora de diferencia y los dos botones de ícono, en ese orden, y ninguno de
  los dos aparece al pie (cubre `FR-004`, `FR-063`).
- **AC-03** — En un viewport de 360 px, la píldora de diferencia aparece en la
  fila del encabezado del equipo visible y no en el encabezado de la tarjeta
  (cubre `FR-005`).
- **AC-04** — El DOM de la tarjeta no contiene ningún ícono `?` con descripción
  emergente de estrategia, y sí contiene el resumen de la estrategia elegida como
  texto (cubre `FR-011`, `FR-012`).
- **AC-05** — Con un desvío aceptable de 1 punto y un armado con el Arco
  desparejo por 4 y el Medio por 3, la celda del Medio queda distinguida y la del
  Arco no (cubre `FR-033`, `FR-034`).
- **AC-06** — Para un armado con titulares sin puntaje, la cuenta que declara la
  línea del receipt coincide, en total y por equipo, con la cantidad de
  **unidades de armado** sin puntaje calculable, conservando la regla de
  `012-puntajes-coherentes-panel` (cubre `FR-052`).
- **AC-07** — El DOM de la tarjeta no contiene el conteo de posiciones, ni la
  cajita de titulares sin puntaje, ni la de jugadores bloqueados, ni la de
  diferencia de puntaje, y el CSS no las conserva ocultas (cubre `FR-050`,
  `FR-051`, `FR-053`, `TC-014`).
- **AC-08** — Después de aplicar un movimiento manual sobre un armado con balance
  por línea, la píldora y las cuatro celdas muestran los números del reparto
  resultante, y la lista de explicaciones es idéntica a la de antes del
  movimiento (cubre `FR-070`, `FR-071`, `FR-072`).
- **AC-09** — Con una sesión de rol `jugador`, la tarjeta no contiene el combo, ni
  el aviso, ni el botón de regenerar, ni la botonera, ni la píldora, ni la
  diferencia por línea, ni el receipt; y sí contiene la cancha con los nombres y
  el botón de copiar (cubre `FR-001`, `FR-080`, `FR-081`, `FR-046`).

### 11.2 Non-functional acceptance

- **AC-10** — `node tests/layout.test.js` pasa con los escenarios nuevos de esta
  rebanada en los trece anchos que ya mide, sin desbordes (cubre `NFR-001`).
- **AC-11** — El rectángulo de cada botón de ícono del encabezado mide al menos
  44 px de lado en los trece anchos medidos (cubre `NFR-002`).
- **AC-12** — Cada botón de ícono del encabezado expone un nombre accesible no
  vacío, y toda celda distinguida por color declara además en texto la diferencia
  y el umbral (cubre `NFR-003`).
- **AC-13** — Aplicar un movimiento manual sobre un partido de 18 titulares y
  repintar la tarjeta con los números recalculados completa en menos de 150 ms
  medidos con `performance.now()` (cubre `NFR-004`).
- **AC-14** — El conjunto de claves registradas en `window.__escrituras` tras
  mostrar y recalcular la tarjeta es vacío: el recálculo no persiste nada (cubre
  `NFR-005`, `FR-073`).
- **AC-15** — El Implementation Plan lista cada valor visual del panel con su
  token del design system, y cada excepción con su valor y su razón (cubre
  `NFR-006`).
- **AC-16** — Para el conjunto de armados de prueba, la lista de explicaciones
  producida coincide cadena por cadena y en orden con la producida antes del
  cambio, salvo la línea de titulares sin puntaje (cubre `NFR-007`, `FR-043`).

### 11.3 Constraint compliance

- **AC-20** — Revisión de código: el `index.html` no incorpora `support.js`, ni
  etiquetas del prototipo, ni componentes React del design system (`TC-001`).
- **AC-21** — Revisión de código: la rebanada no agrega ninguna dependencia ni
  ningún archivo cargado en tiempo de ejecución (`TC-002`).
- **AC-22** — Revisión de código: el combo sigue siendo un `<select>` nativo
  (`TC-003`).
- **AC-23** — Revisión de código: ningún camino del panel llama a
  `__generarEquipos` ni a ninguna función de generación para refrescar un número
  (`TC-010`).
- **AC-24** — El diff de campos escritos tras mostrar y recalcular la tarjeta no
  contiene `equipos.balanceLineas` ni ningún otro campo (`TC-011`).
- **AC-25** — Revisión de código: el bloque del receipt consume el mismo arreglo
  `explicaciones`, sin filtrar ni reordenar, y la única cadena modificada es la de
  `FR-052` (`TC-012`).
- **AC-26** — Revisión de código: la regla de color usa el predicado de línea de
  un solo lugar derivado de la formación objetivo, y no una lista literal de
  nombres de línea (`TC-013`).
- **AC-27** — Revisión de código: los tres resúmenes retirados no existen en el
  DOM ni en el CSS (`TC-014`).
- **AC-28** — El bloque por línea aparece exactamente en los armados que llevan
  `balanceLineas`, verificado con un armado que lo lleva y otro que no (`TC-015`).
- **AC-29** — Con una ventaja buscada de 6 puntos configurada y un armado que la
  alcanza exactamente, la píldora **no** queda distinguida como excedida
  (`TC-016`, conserva `FR-010` de `009-ventaja-sin-arquero`).
- **AC-29b** — Revisión de código: la rebanada no introduce ningún dato nuevo, no
  cambia dónde se guarda ninguno y no agrega ningún destinatario, de modo que no
  se dispara ninguna obligación regulatoria (`TC-020`).
- **AC-30** — Revisión de código contra el design system: todo color, espaciado,
  radio, sombra y tipografía del panel sale de un token o de una excepción
  declarada (`TC-030`, `TC-031`).
- **AC-31** — Al menos un escenario nuevo de `tests/layout.test.js` se vio fallar
  antes de implementarse, según el criterio del Principio V (`TC-032`).
- **AC-32** — Revisión de código contra
  [`handoff/README.md`](../handoff/README.md): la geometría del encabezado, del
  combo, del aviso, de la grilla y del receipt corresponde a la que el handoff
  fija (`TC-033`).
- **AC-33** — Revisión de código: ninguna afirmación del handoff se implementó sin
  contrastarla contra el código o el prototipo, y las discrepancias encontradas
  quedan anotadas en el Implementation Plan (`TC-034`).
- **AC-34** — El estado de la confirmación de Copiar no aparece en el diff de
  campos escritos (`TC-035`).
- **AC-35** — Revisión de código: la guarda de rol está presente dentro de cada
  manejador de acción del panel, y no sólo en la decisión de dibujar el botón
  (`TC-040`).
- **AC-36** — Revisión de código: todo texto proveniente de un jugador que el
  receipt inserta en el DOM pasa por la función de escapado (`TC-041`).
- **AC-37** — Revisión de código: el valor del combo se valida contra el catálogo
  de estrategias antes de escribirse (`TC-042`).

### 11.4 Negative / safety acceptance

- **AC-40** — El escenario `S-20` no produce ninguna escritura: el documento de
  partido queda idéntico.
- **AC-41** — El escenario `S-21` no produce ninguna escritura y la estrategia
  elegida no cambia.
- **AC-42** — El escenario `S-22` no produce ejecución de script y el nombre se
  muestra como texto literal.
- **AC-43** — El escenario `S-07a` deja el ícono de copiar sin cambiar y muestra
  el aviso de error.

### 11.5 Test & traceability obligations

- **AC-50** — Todo escenario de §9 —incluida cada variante `S-NNa`, `S-NNb`, …—
  tiene al menos un test ejecutable referenciado en la §12.1 *Scenario
  Traceability Matrix* del Implementation Plan, con el identificador embebido en
  una posición estructural: el nombre del caso dentro de un literal de cadena, o
  el campo `spec:` de un escenario de `tests/layout.test.js`, nunca en un
  comentario. Los identificadores llevan el prefijo de rebanada que el arnés ya
  usa (`panel/S-04a`), según `AGENTS.md` § Tests. Además, todo encabezado de
  escenario de §9 va seguido de un bloque `Variants:` o de la declaración
  explícita `Variants: none — single-path scenario`. Gateado por `T-N.D8` y
  `T-N.D8b` del Plan.
- **AC-51** — Todo NFR de §8 con objetivo cuantificado según la lista cerrada del
  preámbulo —`NFR-001`, `NFR-002`, `NFR-004` y `NFR-005`— tiene un test de
  medición referenciado en la §12 del Plan, con el identificador embebido.
  Gateado por `T-N.D9`.
- **AC-52** — Todo TC de §4 tiene una verificación de cumplimiento en §11.3 y una
  entrada correspondiente en la §12 del Plan: un test ejecutable cuando el TC es
  mecánicamente verificable, o la revisión nombrada cuando no lo es. Gateado por
  `T-N.D10` y `T-N.D10b`.
- **AC-53** — Cada ámbito materialmente afectado por el cambio tiene al menos una
  fila `IMP-*` en la §12.2 *Impact Traceability* del Plan, con su ámbito, los
  identificadores que la disparan, el riesgo asociado y la tarea que la mitiga.
  Gateado por `T-N.D15`.
- **AC-54** — Todo NFR con objetivo cuantificado tiene al menos una fila `OBS-*`
  en la §11 *Observability* del Plan, con el identificador del NFR en su columna
  *Binds to*. Gateado por `T-N.D16`.
- **AC-55** — La rebanada no incorpora ningún lockfile: la aplicación no tiene
  dependencias instaladas y carga Firebase por CDN (`AGENTS.md` § Dependencias).
  El Plan declara `Supply-chain: none — el repositorio no versiona lockfile y la
  rebanada no agrega dependencias (TC-002)` en su §5, y `AC-55` se satisface de
  forma vacua. Gateado por `T-N.D20`.

## 12. Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Lecturas del panel sin preguntar | Ninguna consulta al administrador sobre qué significa una celda de diferencia por línea en los primeros 30 días | Conteo de mensajes en el grupo |
| Confianza en el rojo | Ninguna celda distinguida como excedida que corresponda a una línea de un solo lugar, en los armados de los primeros 30 días | Revisión de los partidos guardados |
| Números que no mienten | Cero partidos en que la diferencia por línea mostrada no corresponda al reparto en pantalla | Revisión sobre los partidos con movimientos manuales |
| Altura del panel | La tarjeta de equipos generados a 360 px es más corta que antes de la rebanada | Medición en `tests/layout.test.js` |

## 13. Dependencies

- **Upstream specs:** Concept Note de `equipos-en-el-campo`; Specs de las
  rebanadas 1 y 2, ya mergeadas.
- **Servicios:** Cloud Firestore y Firebase Auth, ninguno cambia de forma.
- **Diseño:** el handoff en [`handoff/`](../handoff/) y el design system en
  [`.claude/skills/football-app-design/`](../../../.claude/skills/football-app-design/).
- **Feature flags / config:** ninguna. El desvío aceptable es un parámetro
  existente de la configuración del motor.
- **Third-party APIs:** ninguna nueva.

## 14. Assumptions

- **A-01** — El campo `resumen` de las cuatro estrategias del catálogo
  ([`index.html:964`](../../../index.html#L964),
  [`969`](../../../index.html#L969), [`974`](../../../index.html#L974),
  [`979`](../../../index.html#L979)) está escrito y es apto para mostrarse tal
  cual, sin edición. Verificado por lectura el 2026-08-31.
- **A-02** — Ninguna estrategia distinta de "Formación fija" y "Formación fija
  pareja" guarda `balanceLineas` en el armado
  ([`index.html:3536`](../../../index.html#L3536)), de modo que el bloque por
  línea sólo puede aparecer con esas dos. Verificado por lectura el 2026-08-31.
- **A-03** — Un movimiento manual no cambia la posición asignada de nadie
  (`D-20`), de modo que recalcular la diferencia por línea es aplicar
  `balanceLineasDe` al mismo mapa de posiciones con los repartos nuevos.
- **A-04** — El recálculo de los totales por equipo tras un movimiento ya existe
  desde la rebanada 2 (`FR-021` de aquella Spec): esta rebanada recalcula lo que
  faltaba, no reconstruye lo que ya funciona.
- **A-05** — Los avisos flotantes de error del portapapeles siguen siendo un
  mecanismo válido de la aplicación y no están en camino de retirarse.

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| Retirar los tres resúmenes hace extrañar un dato que sí se usaba | Med | Med | `D-23` exige que cada dato siga leyéndose en algún lado, y el diagrama de §9.4 lo fija dato por dato. `AC-06` verifica el único que cambia de forma. Si aun así se extraña, reponer una cajita es barato; lo caro sería haber perdido el dato |
| La regla de color de `D-22` deja pasar una diferencia real en Arco o Ataque | Med | Low | El número sigue mostrándose en la celda, con su signo y su equipo (`FR-031`): lo que se retira es el color, no el dato. Y el receipt ya explica en palabras por qué esa diferencia no se podía repartir |
| El recálculo y el receipt se contradicen a ojos del administrador: los números dicen una cosa y el texto otra | Med | Med | Es una consecuencia buscada de `D-25` y no un defecto, pero se puede leer mal. `FR-072` la fija sin ambigüedad y `S-06` la convierte en escenario; si en el uso real confunde, la salida es un rótulo que diga que el receipt describe la generación, no el estado |
| El encabezado con dos íconos y una píldora no entra a 360 px | Med | Med | `NFR-001` y `AC-10` lo miden en los trece anchos; `FR-005` ya saca la píldora del encabezado en una columna, que es justo el modo angosto |
| Escapar el receipt cambia cómo se ve algún nombre que hoy se mostraba sin escapar | Low | Low | `S-22` y `AC-36` lo cubren. Es una corrección de seguridad pendiente desde antes de esta rebanada, no una regresión que introduzca |
| El `<select>` restilado se ve distinto en iOS de lo que el handoff dibuja | Low | High | `TC-003` mantiene el control nativo a propósito: el aspecto exacto es negociable, el comportamiento del sistema no. Se valida mirándolo, como `D-13` fija para las medidas derivadas |

## 16. Open questions

> Las preguntas de esta tabla son las de **esta** Spec. Cuando el documento cita
> una pregunta de otro —`OPEN-Q-05` de la Spec de la rebanada 2, `OPEN-Q-07` del
> Concept Note— la nombra siempre junto al documento al que pertenece, para que
> una referencia sin dueño explícito se pueda leer como una de acá.

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | La anotación recíproca en los documentos que esta Spec reemplaza (`003-motor-generacion-equipos` `FR-009`, `012-puntajes-coherentes-panel`) sigue pendiente, igual que la de la rebanada 2 | Lucas Manoukian | Implementation Plan | La rebanada 2 dejó la misma deuda y la saldó con un commit propio (`ea9b76f`). Conviene saldar las dos juntas |
| OPEN-Q-02 | ¿El arrastre necesita un equivalente alcanzable sin gesto de puntero? | Lucas Manoukian | Spec revision o rebanada 6 | Heredada de la rebanada 2. Esta rebanada no la resuelve ni la empeora: no toca el arrastre. Se traslada a la rebanada 6, que introduce el otro gesto sobre la camiseta y es el momento natural para decidir el conjunto |
| OPEN-Q-03 | ¿La grilla de diferencia por línea debería mostrarse también con "Por posición y puntaje", calculándola en la pantalla? | Lucas Manoukian | Rebanada 7 o revisión | Esta Spec lo deja fuera (§3.2) porque sería agregar al panel un dato que el motor no produjo. Ahora que el recálculo existe, es técnicamente barato; lo que falta es decidir si el dato tiene sentido en una estrategia que no empareja líneas |
| OPEN-Q-05 | Con el subtítulo retirado (`FR-084`), la estrategia **aplicada** no se nombra en ninguna parte. ¿Alcanza con que el aviso señale que difiere de la elegida, o el aviso debería nombrarla? | Lucas Manoukian | Revisión posterior al merge | Decidido a la vista de la pantalla real el 2026-09-01: el subtítulo repetía el nombre que el combo ya muestra, y cuatro renglones grises antes de la cancha se leían cargados en el celular. La salida barata si se extraña es que el aviso diga "se armaron con {aplicada}", que es lo que el handoff propone para su disclaimer; `D-05` conservó el texto actual y habría que enmendarla |
| OPEN-Q-04 | ¿El rótulo del bloque "Por qué quedaron así" debería aclarar que describe la última generación y no el estado actual? | Lucas Manoukian | Revisión posterior al merge | Sale del riesgo de §15. No se resuelve ahora porque agregar texto explicativo antes de saber si confunde es exactamente lo que `D-14` evitó en el combo. Se decide mirándolo en uso |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** todo `FR-*` de §7, todo `NFR-*` de §8,
  todo `TC-*` de §4, todo `AC-*` de §11 —incluidos los seis meta-criterios de
  §11.5— y las constraints heredadas en §3.3.
- **Plan has freedom over:** cómo se parte `renderTeamsSection`, qué funciones se
  extraen y con qué nombres, dónde vive el CSS nuevo, cómo se estructura la suite
  de unidad y qué fixtures usa, y cómo se ordenan las ramas y los commits dentro
  de `feature/panel-armado`.
- **Plan must resolve:** `OPEN-Q-01`.
- **Deuda de verificación heredada (`MD-26`):** el marcador `[UNVERIFIED]` de
  §4.5 —el ranking vigente del CWE Top 25 no se consultó por estar sin conexión—
  se traslada al Plan, que lo debe reenunciar en su §15.1. Las categorías se
  nombran por identificador y título, que son estables; lo no verificado es el
  ranking.
- **Cuidado particular:** `tests/harness.js` recorta declaraciones de
  `index.html` **por nombre** (`AGENTS.md` § Estilo). Si el Plan extrae o
  renombra funciones que hoy están en su lista —`balanceLineasDe`,
  `sumasPorLinea`, `valorDePuntaje`, `LABEL_LINEA`, `ORDEN_LINEAS`,
  `FORMACION_KEY_POR_POSICION`— tiene que actualizar la lista en el mismo commit.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-02 | Lucas Manoukian | Dos correcciones sobre la misma zona, a pedido del usuario. **(1)** `FR-011` se invierte: el combo deja de mostrar el resumen permanente de la estrategia elegida — resultó más ruido que ayuda en la pantalla de equipos generados, mismo motivo que ya había retirado el subtítulo el 2026-09-01. `FR-013` queda sin efecto (no hay resumen que repintar) y `D-14` se anota como parcialmente revertida; `S-02` se reescribe entero y `S-02a` reduce su alcance a validar sólo la integridad del campo `resumen` en el catálogo, no su despliegue. **(2)** `FR-015` se enmienda: con la inscripción cerrada o el partido finalizado, el combo directamente no se muestra, en vez de quedar deshabilitado y visible — cambio hecho el mismo día que el de `S-02` pero no registrado entonces; se documenta ahora al notar la omisión. Self-critique: no corresponde (correcciones acotadas a pedido explícito, verificadas con la suite de tests). |
| 2026-08-31 | Lucas Manoukian | Initial draft. Incorpora las seis decisiones tomadas con el propietario el mismo día, que por `MD-01` se registraron como `D-22` a `D-25` en el Concept Note y como diferido de su §14 (el texto de Copiar), y no dentro de esta Spec. Cierra la `OPEN-Q-05` de la rebanada 2 (el selector se conserva donde está) y hereda la `OPEN-Q-03` de aquella Spec ya resuelta por `D-25`. Declara el reemplazo del `FR-009` de `003-motor-generacion-equipos` y de la superficie de lectura de `012-puntajes-coherentes-panel`. Self-critique: passed (2🔴 / 2🟡 / 1🔵), los cinco resueltos. Los 🔴: `TC-020` no tenía criterio de cumplimiento en §11.3 pese a que la rúbrica lo exige para todo `TC-*` (se agregó `AC-29b`), y la §9.4 usaba un `flowchart`, tipo que `MD-24` no admite en la §9 de una Spec (se reemplazó por una tabla, con la razón declarada). Los 🟡: tres `FR-*` compuestos partidos conservando los identificadores estables (`FR-002b`, `FR-006b`, `FR-083`), y `D-03` heredada de hecho por `NFR-001` pero ausente de §3.3. El 🔵: `FR-003` llevaba dos casos de contenido en una línea, partido en `FR-003b` y `FR-003c`. |
| 2026-08-31 | Lucas Manoukian | Corrección durante la implementación: `FR-046` y `FR-081` decían que el rol `jugador` ve la píldora, la diferencia por línea y el receipt. **Es falso y contradice una spec vigente**: `007-permisos-por-usuario` `FR-005` y su escenario 2 declaran que ese rol no ve puntajes, estrategia, diferencias, jugadores sin puntaje, jugadores bloqueados ni la explicación del armado, y la aplicación ya lo implementaba así. Los dos requisitos quedan invertidos, se agrega la declaración de que esa spec **no** se reemplaza, y `AC-09`, `US-07` y `S-01d` se corrigen en consecuencia; `S-04g` y `S-05e` se agregan para cubrir los dos bloques nuevos con ese rol. El error fue inventar un requisito que ninguna decisión respaldaba, en vez de leer el modelo de permisos vigente. En la misma pasada se corrigió `FR-001`, que hacía a Copiar exclusivo de `admin`: el rol `jugador` ya lo tenía y el texto que copia son nombres, así que quitárselo habría sido una pérdida de función que ninguna decisión pidió. Self-critique: no corresponde (corrección acotada, verificada con las pasadas de consistencia). |
| 2026-09-01 | Lucas Manoukian | Decisión tomada a la vista de la pantalla real: el subtítulo de la tarjeta se retira entero. `FR-084` y `FR-085` quedan invertidos —de "conservar la estrategia aplicada y la ayuda del arrastre" a "retirar las dos"—, se declara el reemplazo del `FR-043` de la Spec de la rebanada 2, y la pérdida de información queda registrada en `OPEN-Q-05` en vez de disimulada. El motivo: entre el combo y la cancha quedaban cuatro renglones grises que, en el caso mayoritario, repetían el nombre que el combo ya muestra. |

---

*Esta Spec define qué debe hacer el sistema, cómo debe comportarse y qué
soluciones son admisibles. Las decisiones concretas de implementación viven en
`PANEL_ARMADO_IMPLEMENTATION_PLAN.md`. La motivación y el fundamento de las
decisiones viven en
[EQUIPOS_EN_EL_CAMPO_CONCEPT.md](../EQUIPOS_EN_EL_CAMPO_CONCEPT.md).*
