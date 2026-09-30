# Desglose de posiciones — Concept Note

> **Status:** Draft · **Date:** 2026-09-30 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Spec:** *not yet written* · **Implementation plan:** *not yet written*

## 1. TL;DR

Hoy un jugador es Arquero, Defensor, Volante o Delantero. Se propone reemplazar
esas cuatro posiciones por ocho puestos concretos —Arquero (ARQ), Lateral Derecho
(LD), Defensor Central (DC), Lateral Izquierdo (LI), Mediocampista Derecho (MD),
Mediocampista Central (MC), Mediocampista Izquierdo (MI) y Delantero Central
(DEL)— para que el motor arme equipos con un lateral de cada lado y un central en
el medio, en vez de tres "defensores" cualesquiera. La Formación Fija pasa a
pedir puestos, no cantidades por línea: Fútbol 8 es ARQ, LD, DC, LI, MD, MC, MI,
DEL (3-3-1) y Fútbol 9 suma un segundo MC (3-4-1). El equilibrio de líneas
sigue midiendo defensa, mediocampo y delantera; lo que cambia es qué puestos
componen cada una. La decisión que el lector debe conocer antes que ninguna otra:
**los jugadores existentes no se convierten solos**: el administrador los
reclasifica uno por uno, y mientras un convocado no esté reclasificado el motor
**no genera equipos** para ese partido (`D-08`, `D-09`).

## 2. Problem statement

La posición de un jugador es demasiado gruesa para armar un equipo que se pueda
parar en la cancha.

- **Pain 1 — la formación se cumple en el papel y no en la cancha.** La Formación
  Fija de Fútbol 8 pide "3 defensores, 3 volantes, 1 delantero"
  ([index.html:1495](../../index.html#L1495)). Tres defensores que en la vida real
  son tres centrales cumplen la formación igual, y el equipo sale sin laterales.
  El motor no tiene forma de saberlo, porque el dato no existe.
- **Pain 2 — el puntaje de un "Defensor" mezcla puestos distintos.** Hoy el
  puntaje se carga por posición (principal y secundarias,
  [index.html:2280-2290](../../index.html#L2280-L2290)). Un jugador que es muy
  buen lateral y flojo de central tiene un único número de "Defensor", así que el
  motor lo valora igual en los dos lugares.
- **Pain 3 — la cancha dibujada no muestra lados.** La cancha agrupa a los
  jugadores por línea en el orden de la lista
  ([index.html:4614-4619](../../index.html#L4614-L4619),
  [index.html:4661-4672](../../index.html#L4661-L4672)); no hay izquierda ni
  derecha, porque ningún dato la indica.

## 3. Goals

- Que cada jugador tenga un puesto concreto (y puestos secundarios) entre los
  ocho nuevos, y pueda tener un puntaje en cada puesto que juega —su principal y
  sus secundarios—. Como hoy, el puntaje es opcional aun en esos puestos, y los
  puestos que no juega no llevan puntaje.
- Que la Formación Fija entregue en cada equipo exactamente los puestos que pide
  el tamaño de cancha: un lateral de cada lado, los centrales y los volantes por
  afuera que correspondan.
- Que la estrategia "Por posición y puntaje" reparta parejo cada puesto entre los
  dos equipos.
- Que el equilibrio de líneas siga emparejando defensa, mediocampo y delantera,
  ahora compuestas por los puestos nuevos.
- Que la cancha dibujada ubique a cada jugador en su lado.
- Que ningún partido ya guardado cambie ni se dibuje roto.

## 4. Non-goals

- No se agregan puestos más allá de los ocho de §1 (ni carrileros, ni
  mediocampista defensivo/ofensivo, ni extremos, ni segundo delantero). El
  catálogo es cerrado y lo fijó el owner.
- Esta versión no deja elegir la formación por partido: Fútbol 8 sigue siendo
  3-3-1 y Fútbol 9 sigue siendo 3-4-1 (postergado, no descartado —
  ver §14).
- No se convierte automáticamente a ningún jugador existente a un puesto nuevo;
  el puesto de cada jugador lo decide el administrador.
- No se reescriben los partidos ya guardados: el historial queda como se armó y
  se jugó.
- El equilibrio de líneas no pasa a medir cada puesto como si fuera su propia
  línea.

## 5. Vision / desired end state

Con el desglose de posiciones, el motor arma equipos que se paran en la cancha
de verdad —un lateral de cada lado, un central en el medio— en vez de confiar
en que "Defensor" signifique lo mismo para todos. La reclasificación es tarea
del administrador, no automática, y mientras falte queda a la vista y bloquea
la generación; lo que ya se jugó no se toca.

**Recorrido ilustrativo:**

El día que sale el cambio, el administrador entra a Jugadores y ve una marca "a
revisar" en cada ficha. Abre la de un jugador que era "Defensor" con un 7 y
tenía "Volante" como secundaria con un 6: la aplicación conservó esos dos
puntajes viejos para usarlos al reclasificar. Elige Lateral Derecho como principal, y Defensor
Central y Mediocampista Derecho como secundarias. Los casilleros de LD y DC ya
vienen con el 7 de "Defensor" y el de MD con el 6 de "Volante"; baja el de
central a 5 porque de ahí rinde menos, y guarda. La marca desaparece.

El jueves quiere generar los equipos y el motor no lo deja: le avisa que dos
convocados todavía están sin reclasificar y le dice quiénes. Los corrige, genera,
y la cancha muestra en cada equipo al lateral izquierdo a la izquierda, al
central en el medio y al lateral derecho a la derecha. La explicación del armado
dice, por ejemplo, que usó la posición secundaria de alguien para cubrir el
lateral izquierdo, y el equilibrio de líneas sigue diciendo cuánto le lleva la
defensa de un equipo a la del otro.

Los partidos del mes pasado se siguen viendo como se jugaron: quien era
"Defensor" aparece en la fila de la defensa.

### 5.1 System context diagram

No aplica: la feature vive entera dentro de la aplicación existente
(`index.html`) y usa la misma persistencia en Cloud Firestore. No cruza ningún
límite de sistema nuevo.

### 5.2 Security posture (`MD-31`)

- **Feature exposure** — La única entrada nueva es la elección de puestos en la
  ficha de jugador, con valores de un catálogo cerrado; no hay texto libre nuevo.
  La ficha y los puntajes solo los edita `admin`.
- **Data sensitivity** — Nombres de jugadores (ya existentes) y puntajes
  internos. Sin datos regulados. Los puntajes viven en `data/playerScores`, de
  lectura exclusiva de `admin`
  ([index.html:2142-2154](../../index.html#L2142-L2154)); el puesto principal y
  los secundarios viven en `data/players`, que ya es público para el grupo.
- **Deployment surface** — Aplicación estática en GitHub Pages que escribe en
  Firestore. Las reglas de Firestore validan rol, no contenido
  (`docs/rol-en-el-token/contracts/firestore-rules.md`), y esta feature no las
  cambia.

## 6. Context & background

- **Existing system** — Las cuatro posiciones son a la vez el catálogo de la
  ficha y las líneas del motor: `POSITIONS`
  ([index.html:1485](../../index.html#L1485)) alimenta el formulario, el filtro,
  los colores y los puntajes; `ORDEN_FORMACION` y `ORDEN_LINEAS`
  ([index.html:3160-3165](../../index.html#L3160-L3165)) usan los mismos nombres
  como líneas. La formación de cada cancha es una cantidad por línea
  ([index.html:1494-1497](../../index.html#L1494-L1497)). Posición y línea son,
  hoy, la misma cosa.
- **Related work** — La spec del motor ya anticipó este cambio y lo dejó sin
  planificar: *"Desglosar las posiciones en puestos más finos […] obligaría a
  rediseñar la Estrategia 4"*, con dos decisiones abiertas —qué es una línea, y
  cómo se enumera el reparto cuando intercambiar dos jugadores de una misma línea
  deja de ser neutro—
  ([`003-motor-generacion-equipos/spec.md`](../003-motor-generacion-equipos/spec.md),
  "Notas a futuro"). La primera la resuelve `D-04`; la segunda, `D-05`.
- **Organisational context** — Pedido directo del owner el 2026-09-30. La idea
  no estaba entre las ideas pendientes de `Roadmap.md`, así que no hay nada que
  retirar de ahí; sí hay que actualizar la línea de "Lo que ya existe" que
  describe las cuatro posiciones fijas (`Roadmap.md:18`) cuando la feature se
  entregue.

### 6.5 Sources & Origins (`MD-25`)

**Codebase evidence**

- [index.html:1485](../../index.html#L1485) — `POSITIONS`, el catálogo único de
  cuatro posiciones: todo lo que lo recorre (formulario, validación, promedio,
  duplas) pasa a recorrer ocho.
- [index.html:1490-1493](../../index.html#L1490-L1493) — `ORDEN_POSICION`,
  `POS_COLOR` y `posTextColor`: un color del design system por posición, con
  fallback a `var(--muted)` para valores desconocidos (`D-11`, `D-10`).
- [index.html:1494-1497](../../index.html#L1494-L1497) — `CANCHAS`: la formación
  es `{defensores, volantes, delanteros}`; pasa a ser una cantidad por puesto
  (`D-03`).
- [index.html:1165-1171](../../index.html#L1165-L1171),
  [index.html:1192-1201](../../index.html#L1192-L1201) — el filtro de la lista y
  el selector de posición principal tienen las cuatro opciones escritas a mano
  (`OPEN-Q-04`).
- [index.html:1989](../../index.html#L1989) — la única normalización al cargar
  jugadores es `scores = {}`; no hay validación de `principal`/`secundarias`, así
  que un valor viejo llega intacto y hay que detectarlo explícitamente (`D-08`).
- [index.html:2142-2154](../../index.html#L2142-L2154) — `savePlayers` separa los
  puntajes (solo admin) del resto del jugador: la precarga de `D-07` lee del
  documento de puntajes.
- [index.html:2280-2290](../../index.html#L2280-L2290) — la grilla de puntajes
  muestra un casillero solo por la posición principal y las secundarias: el
  modelo de un puntaje por posición jugable se conserva (`D-06`).
- [index.html:2751-2755](../../index.html#L2751-L2755) — un arquero natural que no
  gana el arco y no tiene secundarias pasa a `'Delantero'`: el valor por defecto
  pasa a ser un puesto nuevo (`OPEN-Q-06`).
- [index.html:3010](../../index.html#L3010),
  [index.html:3086-3095](../../index.html#L3086-L3095) — la Estrategia 2 reparte
  un grupo por posición de campo (`OUTFIELD`); con el desglose son siete grupos
  (`D-02`).
- [index.html:3228-3236](../../index.html#L3228-L3236) — el encaje óptimo de la
  formación lleva un contador por posición de campo (hoy tres); pasa a siete
  (`D-03`, riesgo de §11).
- [index.html:3446-3452](../../index.html#L3446-L3452) — `sumasPorLinea` suma por
  posición asignada, porque hoy la posición es la línea; pasa a sumar por la
  línea del puesto (`D-04`).
- [index.html:3945-3960](../../index.html#L3945-L3960) — el refinamiento de la
  Estrategia 4 solo intercambia entre equipos jugadores del mismo puesto; con
  puestos finos ese intercambio sigue siendo neutro para el encaje (`D-05`).
- [index.html:4130-4134](../../index.html#L4130-L4134) — el puntaje de una dupla
  se calcula posición por posición sobre `POSITIONS` (feature 014): pasa a
  calcularse sobre los ocho puestos sin cambiar la fórmula.
- [index.html:4614-4619](../../index.html#L4614-L4619),
  [index.html:4661-4672](../../index.html#L4661-L4672) — la cancha ordena por
  posición y crea una fila por línea del catálogo; un valor desconocido cae en
  una fila extra debajo del arco. Es lo que pasaría con un partido guardado si
  no se hace nada (`D-10`).
- [index.html:5690-5693](../../index.html#L5690-L5693) — la explicación arma el
  rótulo "3-3-1" desde las cantidades por línea: el rótulo se sigue mostrando
  igual, contado por línea (`D-03`).
- `index.html` (varias funciones: `faltantesDeFormacionVigente`,
  `celdasDiferenciaPorLinea`, `repartoDivergeDeLaGeneracion`, `valorDePuntaje`) —
  el panel de armado relee lo guardado de cada partido con las claves de
  posición de hoy: todas necesitan leer puestos viejos como su línea (`D-10`)
  [UNVERIFIED — reportado por un barrido del código; se verifica línea por línea
  en el Plan].
- `tests/harness.js` y los `DECLARACIONES` de `panel.test.js`, `cancha.test.js`,
  `finalizado.test.js` — recortan del `index.html` por nombre constantes que esta
  feature toca (`POSITIONS`, `ORDEN_FORMACION`, `FORMACION_KEY_POR_POSICION`,
  `ORDEN_LINEAS`, `LABEL_LINEA`, `ORDEN_POSICION_LECTURA`); renombrarlas obliga a
  actualizar esas listas en el mismo commit (`AGENTS.md` → Estilo).
- `tools/medir-motor.js` — el medidor de rendimiento del motor sortea posiciones
  entre las tres de campo: se actualiza para medir el riesgo de rendimiento de
  §11.

**Industry-standard evidence**

- *Regulatory:* [WCAG 2.1 AA, criterio 1.4.1 *Use of
  Color*](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html) — si
  varios puestos comparten color (`D-11`), la etiqueta tiene que distinguirlos
  por texto (la sigla), no por color.
- *Architectural:* ninguna restricción más allá de las del proyecto.
- *Style / project convention:* [`AGENTS.md`](../../AGENTS.md) — Simplicidad,
  Explicabilidad del motor (todo puesto nuevo que el motor use debe aparecer en
  el resumen), Arquitectura desacoplada, Responsive desde 360 px, Design system
  como fuente de verdad de UI, y la obligación de declarar qué partes de specs
  existentes se reemplazan. Design system en
  [`.claude/skills/football-app-design/`](../../.claude/skills/football-app-design/).

**Prior-art evidence**

- [`003-motor-generacion-equipos/spec.md`](../003-motor-generacion-equipos/spec.md) —
  FR-002/FR-003 (posiciones en el reparto), FR-005 (arqueros), FR-007 (orden de
  posiciones), FR-018 a FR-021 (formación fija), FR-022 a FR-028 (Estrategia 4,
  líneas y reparto), y la nota a futuro citada en §6.
- [`002-gestion-jugadores/spec.md`](../002-gestion-jugadores/spec.md) — FR-001,
  FR-003 (posición principal, secundarias, puntaje por posición), FR-010 (las
  cuatro posiciones con color fijo), FR-011 (filtro por posición).
- [`011-encaje-optimo-formacion/spec.md`](../011-encaje-optimo-formacion/spec.md) —
  el encaje de la formación y su caso testigo en 3-3-1.
- [`014-puntaje-dupla-por-posicion/spec.md`](../014-puntaje-dupla-por-posicion/spec.md) —
  puntaje de una dupla por posición.
- [`CANCHA_SPEC.md`](../equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md) —
  FR-010 a FR-015 (líneas de la cancha, sub-filas), `D-12` de esta nota modifica
  el orden dentro de una fila.
- [`PANEL_ARMADO_SPEC.md`](../equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md) —
  FR-030/FR-031 (diferencia por línea), FR-034 (líneas de un solo lugar).
- [`ORDEN_JUGADORES_SPEC.md`](../orden-jugadores/ORDEN_JUGADORES_SPEC.md) — orden
  de la lista por posición (S-03).
- Productos pares: no se investigaron (ver §7.1).

## 7. Research & industry context

### 7.1 How established products handle this

No se investigó cómo resuelven esto otras aplicaciones de organización de
partidos. El catálogo de puestos y las formaciones los fijó el owner
directamente, y no hay una decisión abierta que un producto par pudiera
resolver.

### 7.2 Relevant prior art / papers / standards

- [WCAG 2.1, criterio 1.4.1 *Use of
  Color*](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html) — "Color
  is not used as the only visual means of conveying information, indicating an
  action, prompting a response, or distinguishing a visual element."; aplica a
  `D-11`. Verificado contra la página del W3C el 2026-09-30.

### 7.3 Proofs of concept

No hubo PoC. El comportamiento se deduce del código leído en §6.5.

## 8. Proposed direction

### 8.1 Approach

**Catálogo.** Las cuatro posiciones se reemplazan por ocho puestos, cada uno
perteneciente a una línea: Arco (ARQ), Defensa (LD, DC, LI), Mediocampo (MD, MC,
MI) y Delantera (DEL). El jugador elige un puesto principal y puestos
secundarios entre los ocho, y carga un puntaje por cada puesto que juega, como
hoy.

**Separar puesto de línea.** Hoy el motor usa la posición como línea. La
dirección es separar las dos cosas: la **formación** y el **encaje** trabajan
con puestos (cada equipo necesita un LD, un DC, un LI…), y el **equilibrio de
líneas** agrupa esos puestos en su línea para medir. Así la primera decisión
abierta de la spec del motor queda resuelta —la línea sigue siendo defensa,
mediocampo y delantera— y la segunda se disuelve: como el reparto y el
refinamiento solo intercambian jugadores **del mismo puesto** entre equipos,
ese intercambio vuelve a ser neutro para el encaje, igual que hoy lo es entre
dos "Defensores".

**Estrategias.**
- *Formación Fija* (Estrategia 4) completa en cada equipo los puestos de la
  cancha: F8 = ARQ, LD, DC, LI, MD, MC, MI, DEL; F9 = lo mismo con dos MC. Usa
  los secundarios cuando falta un puesto, igual que hoy.
- *Por posición y puntaje* (Estrategia 2) reparte parejo cada puesto (no cada
  línea) entre los dos equipos. Con siete puestos de campo va a necesitar
  secundarias más seguido que hoy para emparejar cantidades impares.
- *Por puntaje* (Estrategia 1) no mira posiciones y no cambia, salvo el
  invariante de arqueros.

**Reclasificación.** Nada se convierte solo. Un jugador cuyo puesto principal o
alguno de sus secundarios sigue siendo una posición vieja queda "a revisar".
Sus puntajes viejos —el de la posición principal y los de las secundarias— se
conservan hasta entonces. Cuando el administrador le elige puestos nuevos, cada
casillero de puntaje de un puesto nuevo viene precargado con el puntaje viejo de
su misma línea, sea de la principal o de una secundaria (un "Defensor" con 7 →
LD, DC y LI arrancan en 7 si se eligen; un "Volante" secundario con 6 → MD, MC y
MI arrancan en 6), y el administrador lo ajusta. Mientras un convocado esté "a revisar", el partido no se puede
generar ni regenerar, y la pantalla dice quiénes faltan.

**Historial.** Los partidos guardados no se reescriben. Al mostrarlos, cada
posición vieja se lee como su línea: un "Defensor" guardado se dibuja en la fila
de la defensa y suma en la defensa del equilibrio de líneas.

**Cancha.** Dentro de cada fila, los jugadores se ubican según su lado: el
izquierdo a la izquierda, los centrales al medio y el derecho a la derecha,
mirando hacia el arco rival (la cancha ya dibuja el ataque arriba). En F9 el
mediocampo queda MI, MC, MC, MD (orden de dibujo izquierda→derecha; el orden
de formación de D-03 es MD, MC, MC, MI).

**Colores.** Se mantienen los cuatro colores de hoy, uno por línea; la etiqueta
de cada jugador muestra la sigla de su puesto.

### 8.2 Information / data model sketch

- **Puesto** — reemplaza a "Posición". Ocho valores cerrados, cada uno con una
  sigla, un nombre, una línea y un lado (izquierdo, central o derecho; el arco y
  el delantero son centrales).
- **Línea** — Arco, Defensa, Mediocampo, Delantera. Ya existe como concepto
  ("Línea" en Key Entities de la spec del motor); deja de ser sinónimo de
  posición y pasa a ser un grupo de puestos.
- **Formación** — pasa de una cantidad por línea a una cantidad por puesto. El
  rótulo "3-3-1" se sigue calculando contando por línea.
- **Jugador "a revisar"** — no es un campo nuevo: se deduce de que su puesto
  principal o algún secundario sea una posición vieja.
- **Posición vieja** — Arquero se conserva tal cual; Defensor, Volante y
  Delantero dejan de poder elegirse pero se siguen reconociendo al leer, para
  jugadores sin revisar y partidos guardados.

## 9. Alternatives considered

### 9.1 Convertir a todos automáticamente a la posición central

- **Description:** al salir el cambio, Defensor → DC, Volante → MC, Delantero →
  DEL, con sus mismos puntajes.
- **Pros:** no bloquea nada; se puede armar el día uno.
- **Cons:** el motor pasaría a creer que todos los defensores son centrales y
  armaría equipos sin laterales durante semanas, con la apariencia de un dato
  cierto. Es peor que el problema actual.
- **Decision:** Rejected — decisión del owner (`D-08`).

### 9.2 Usar a los no reclasificados en cualquier puesto de su línea

- **Description:** un "Defensor" sin revisar puede cubrir LD, DC o LI con su
  puntaje viejo, y la ficha lo marca "a revisar".
- **Pros:** se puede armar desde el día uno sin datos inventados.
- **Cons:** la formación saldría cumplida con jugadores que quizás no juegan ese
  puesto, y el administrador no tiene incentivo para terminar la
  reclasificación.
- **Decision:** Rejected — el owner eligió bloquear la generación (`D-09`).

### 9.3 Un puntaje por línea en vez de por puesto

- **Description:** mantener cuatro puntajes (arco, defensa, mediocampo,
  delantera) y usar el de la línea para cualquier puesto de ella.
- **Pros:** menos carga para el administrador; la migración de puntajes sería
  trivial.
- **Cons:** deja sin resolver el Pain 2 (un buen lateral que es flojo de
  central).
- **Decision:** Rejected — el owner mantuvo un puntaje por cada puesto jugable
  (`D-06`).

### 9.4 Cada puesto como su propia línea en el equilibrio

- **Description:** medir el equilibrio por LD, DC, LI… en vez de por defensa,
  mediocampo y delantera.
- **Pros:** más fino.
- **Cons:** casi todos los puestos tienen un solo lugar por equipo, así que su
  diferencia es irreducible y el objetivo de emparejar líneas pierde casi todo
  su margen (lo advierte la nota a futuro de la spec del motor).
- **Decision:** Rejected (`D-04`).

### 9.5 Reescribir los partidos guardados con los puestos nuevos

- **Description:** convertir las posiciones guardadas de cada partido
  (Defensor → DC, etc.).
- **Pros:** un solo vocabulario en todos los datos.
- **Cons:** reescribe el historial con un dato que no es cierto (nadie sabe si
  ese "Defensor" jugó de lateral) y es irreversible.
- **Decision:** Rejected (`D-10`).

### 9.6 Un color por puesto

- **Description:** ocho colores distintos.
- **Pros:** se distingue el puesto de un vistazo.
- **Cons:** el design system no tiene ocho colores de esa familia; habría que
  documentar una excepción. La sigla ya distingue el puesto.
- **Decision:** Rejected (`D-11`).

### 9.7 Comparison summary

| Dimensión | Reclasificar + bloquear (elegida) | Convertir a centrales (9.1) | Usar en su línea (9.2) |
|---|---|---|---|
| Se puede armar el día uno | No, hasta reclasificar a los convocados | Sí | Sí |
| El motor trabaja con datos ciertos | Sí | No | Parcial |
| Trabajo del administrador | Todos, antes del próximo partido | Solo corregir | Todos, sin apuro |
| Riesgo de equipos sin laterales | Ninguno | Alto | Medio |

## 10. Key decisions

| ID | Decision | Rationale | Reversibility |
|---|---|---|---|
| D-01 | El catálogo de posiciones pasa a ser de ocho puestos: ARQ, LD, DC, LI, MD, MC, MI, DEL, cada uno de una línea (Arco; Defensa = LD, DC, LI; Mediocampo = MD, MC, MI; Delantera = DEL). Reemplaza a Arquero, Defensor, Volante y Delantero | Pedido del owner. La sigla DEL evita el choque con DC | Hard — cambia el dato de cada jugador |
| D-02 | La Estrategia 2 ("Por posición y puntaje") reparte parejo cada puesto entre los dos equipos, no cada línea | Decisión del owner | Easy |
| D-03 | La Formación Fija pide puestos: F8 (3-3-1) = ARQ, LD, DC, LI, MD, MC, MI, DEL; F9 (3-4-1) = ARQ, LD, DC, LI, MD, MC, MC, MI, DEL. El rótulo "3-3-1"/"3-4-1" se sigue mostrando, contado por línea | Decisión del owner; Fútbol 9 conserva su 3-4-1 actual | Easy |
| D-04 | El equilibrio de líneas sigue midiendo defensa, mediocampo y delantera (más el arco, que se muestra pero no se reparte); cada línea suma a los jugadores de sus puestos | Decisión del owner; resuelve la primera decisión abierta de la nota a futuro de la spec del motor (§9.4) | Medium |
| D-05 | Formación, encaje y reparto trabajan por puesto; solo el equilibrio agrupa por línea. El reparto y el refinamiento intercambian entre equipos únicamente jugadores del mismo puesto | Mantiene neutro el intercambio y resuelve la segunda decisión abierta de la nota a futuro | Medium |
| D-06 | Se mantiene un puntaje por cada puesto que el jugador juega (principal y secundarios), elegidos entre los ocho puestos. El puntaje sigue siendo opcional en cada uno de esos puestos, como hoy; los puestos que no juega no llevan puntaje | Decisión del owner: ya es el modelo de hoy (§6.5) | Easy |
| D-07 | Los puntajes viejos de un jugador "a revisar" se conservan hasta reclasificarlo, tanto el de su posición principal como los de sus secundarias. Al elegir un puesto nuevo, su casillero de puntaje viene precargado con el puntaje viejo de la misma línea, venga de la principal o de una secundaria (un "Volante" secundario con 6 precarga MD, MC o MI con 6); el administrador lo puede cambiar | Decisión del owner: no perder lo cargado, incluidos los puntajes de las secundarias | Easy |
| D-08 | Ningún jugador se convierte solo. Un jugador cuyo puesto principal o alguno de sus secundarios es una posición vieja (Defensor, Volante, Delantero) queda "a revisar" hasta que el administrador lo corrija | Decisión del owner (§9.1) | Easy |
| D-09 | Mientras algún titular de un partido esté "a revisar", el motor no genera ni regenera los equipos de ese partido y la pantalla dice quiénes faltan | Decisión del owner (§9.2) | Easy |
| D-10 | Los partidos guardados no se reescriben; al mostrarlos, cada posición vieja se lee como su línea (Defensor → Defensa, Volante → Mediocampo, Delantero → Delantera) | Decisión del owner (§9.5) | Easy — no se toca ningún dato |
| D-11 | Un color por línea, los cuatro colores actuales del design system; la etiqueta muestra la sigla del puesto | Decisión del owner (§9.6); sin excepción al design system | Easy |
| D-12 | En la cancha dibujada, cada fila ubica a los jugadores por lado: izquierdo a la izquierda, centrales al medio, derecho a la derecha, mirando hacia el arco rival | Decisión del owner | Easy |
| D-13 | El resumen y la explicación de la generación nombran los puestos nuevos (p. ej. "se usó la posición secundaria de X para cubrir LI") | Principio de Explicabilidad del motor (`AGENTS.md`) | Easy |

## 11. Risks

| Risk | Severity | Likelihood | Mitigation idea |
|---|---|---|---|
| El administrador no reclasifica a tiempo y no se puede armar el partido de la semana | High | Med | Aviso visible desde el día uno; la ficha marca "a revisar"; la pantalla del partido dice exactamente quiénes faltan. Salir con tiempo antes de un partido |
| Con siete puestos de campo, la Estrategia 2 y la Formación Fija dependen mucho más de las secundarias y avisan puestos sin cubrir más seguido | Med | High | Que la explicación diga qué puesto quedó sin cubrir y con quién se completó; revisar con el grupo real si los secundarios cargados alcanzan |
| El encaje y la enumeración de la Estrategia 4 crecen en cantidad de combinaciones y la generación se vuelve lenta o se trunca | Med | Med | Medir con `tools/medir-motor.js` actualizado antes de decidir cambios; los topes de hoy están dimensionados para tres posiciones (§6.5) |
| Algún lugar del código sigue leyendo una posición vieja como si fuera un puesto y un partido guardado se dibuja o suma mal | Med | Med | Un partido guardado de prueba con posiciones viejas en los tests de cancha, panel y finalizado |
| Un jugador reclasificado a medias (principal nuevo, secundario viejo) no se detecta | Low | Med | `D-08` cuenta principal **y** secundarios |

## 12. Success signals

- Los equipos generados con Formación Fija salen con un lateral de cada lado en
  cada equipo, sin que el administrador lo corrija a mano.
- La reclasificación del plantel se completa antes del primer partido después
  de la salida.
- Los partidos anteriores al cambio se ven igual que antes.

## 13. Dependencies & stakeholders

### 13.1 Dependencies

- **Services / vendors:** Cloud Firestore, sin cambios en las reglas.
- **Upstream specs / RFCs:** la Spec debe declarar qué partes reemplaza de
  `002-gestion-jugadores`, `003-motor-generacion-equipos`,
  `011-encaje-optimo-formacion`, `014-puntaje-dupla-por-posicion`,
  `orden-jugadores`, y las rebanadas 1 (`CANCHA_SPEC.md`) y 3
  (`PANEL_ARMADO_SPEC.md`) de `equipos-en-el-campo`. Probablemente también
  `008-duplas-rotacion` e `intercambiar-colores` (ver `OPEN-Q-07`).
- **Downstream consumers:** ninguno fuera de la aplicación.

### 13.2 Stakeholders

- **Owning team:** Lucas Manoukian (owner del producto).
- **Reviewing teams:** *pending*.
- **Customers / partners:** los jugadores del grupo, que ven su puesto y la
  cancha; el administrador, que reclasifica.

## 14. Out of scope / deferred

- **Elegir la formación por partido** (p. ej. 4-3-1 en Fútbol 9). —
  *deferred until* el grupo pida jugar con otra formación. Es la idea de
  `Roadmap.md:74` y no se retira de ahí.
- **Mostrar la diferencia por línea con la Estrategia 2.** — *deferred until* se
  decida la idea de `Roadmap.md:46`, que esta feature no cambia.

## 15. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | ¿Qué rótulos llevan las líneas en el panel y en la explicación? Hoy son Arco, Defensa, Medio y Ataque; el pedido las llama Defensa, Mediocampo y Delantera | Lucas Manoukian | Spec | Cambia textos de la rebanada 3 |
| OPEN-Q-02 | ¿Cómo se ordena la lista de jugadores "por posición"? (propuesta: por línea y dentro de la línea LD, DC, LI / MD, MC, MI) | Lucas Manoukian | Spec | `ORDEN_JUGADORES_SPEC.md` S-03 |
| OPEN-Q-03 | ¿Cómo se ordena dentro de una fila de la cancha cuando hay dos jugadores del mismo lado, o cinco o más en una línea (Estrategias 1 y 2 no garantizan la formación)? ¿Y dónde van, dentro de su fila, los jugadores de un partido viejo que solo tienen línea? | Lucas Manoukian | Spec | `CANCHA_SPEC.md` FR-010 a FR-015 |
| OPEN-Q-04 | El filtro de la lista de jugadores, ¿filtra por los ocho puestos, por línea, o por las dos cosas? ¿Y hay un filtro "a revisar"? | Lucas Manoukian | Spec | `002` FR-011 |
| OPEN-Q-05 | ¿Dónde y cómo se avisa que hay jugadores "a revisar" (lista, ficha, partido)? ¿El bloqueo de `D-09` alcanza también a los suplentes? | Lucas Manoukian | Spec | |
| OPEN-Q-06 | Un arquero natural que no gana el arco y no tiene secundarias hoy pasa a Delantero: ¿pasa a DEL? | Lucas Manoukian | Spec | [index.html:2751-2755](../../index.html#L2751-L2755) |
| OPEN-Q-07 | ¿Qué partes exactas de cada spec existente quedan reemplazadas? (inventario de §6.5 y §13.1) | Lucas Manoukian | Spec | Obligación de `AGENTS.md` |
| OPEN-Q-08 | Al regenerar un partido con un jugador bloqueado cuya posición guardada es vieja, ¿qué puesto toma? | Lucas Manoukian | Spec | La regeneración reutiliza la posición anterior de los bloqueados |
| OPEN-Q-09 | ¿Hace falta ajustar los topes de combinaciones del motor para siete puestos? | Lucas Manoukian | Plan | Riesgo 3 de §11 |

## 16. Handoff to the Spec

- **Settled (do not relitigate):** D-01 a D-13.
- **Decide in Spec:** OPEN-Q-01 a OPEN-Q-08. OPEN-Q-09 va al Plan.
- **Must remain non-goals:**
  - "No se agregan puestos más allá de los ocho de §1 (ni carrileros, ni
    mediocampista defensivo/ofensivo, ni extremos, ni segundo delantero). El
    catálogo es cerrado y lo fijó el owner."
  - "Esta versión no deja elegir la formación por partido: Fútbol 8 sigue
    siendo 3-3-1 y Fútbol 9 sigue siendo 3-4-1 (postergado, no descartado —
    ver §14)."
  - "No se convierte automáticamente a ningún jugador existente a un puesto
    nuevo; el puesto de cada jugador lo decide el administrador."
  - "No se reescriben los partidos ya guardados: el historial queda como se armó
    y se jugó."
  - "El equilibrio de líneas no pasa a medir cada puesto como si fuera su propia
    línea."
- **Unverified claims carried forward:** el barrido de código de §6.5 marca
  como `[UNVERIFIED]` que `faltantesDeFormacionVigente`,
  `celdasDiferenciaPorLinea`, `repartoDivergeDeLaGeneracion` y
  `valorDePuntaje` necesitan leer puestos viejos como su línea; la Spec o el
  Plan tienen que confirmarlo línea por línea antes de darlo por cierto.
- **Explicabilidad:** cada decisión del motor que involucre un puesto nuevo
  (cobertura por secundaria, puesto sin cubrir, arquero desplazado) tiene que
  aparecer en el resumen de generación con el nombre del puesto.
- **Responsive:** la Spec declara el comportamiento desde 360 px de la ficha de
  jugador con ocho puestos seleccionables y hasta ocho casilleros de puntaje, del
  aviso de "a revisar", y de la cancha con lados.

## 17. Appendix

- Pedido del owner (2026-09-30): ocho puestos; F8 3-3-1 con ARQ, LD, DC, LI, MD,
  MC, MI, DEL; equilibrio de líneas por defensa, mediocampo y delantera.
- Respuestas del owner (2026-09-30):
  - Fútbol 9 sigue siendo 3-4-1, con el mediocampo MD, MC, MC, MI (el pedido
    original decía 4-3-1; el owner lo corrigió).
  - Sigla del Delantero Central: DEL.
  - Puntajes: como hoy, uno por cada posición principal y secundaria, opcional
    en cada una; no hace falta un puntaje en los ocho puestos.
  - Los puntajes viejos de las secundarias también se conservan para
    reclasificar.
  - Jugadores existentes: se reclasifican a mano; el puntaje viejo viene
    precargado.
  - Estrategia 2: parejo por puesto.
  - Sin reclasificar: se bloquea la generación.
  - Historial: se lee por línea.
  - Colores: uno por línea.
  - Cancha: cada uno a su lado.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-09-30 | Lucas Manoukian (claude-opus-5-5) | Initial draft. Self-critique: passed (1🔴 / 2🟡 / 2🔵) — see `DESGLOSE_POSICIONES_CONCEPT_CRITIQUE_2026-09-30_claude-sonnet-5.md`. |
| 2026-09-30 | Lucas Manoukian (claude-sonnet-5) | Resuelve el hallazgo 🔴 de la autocrítica: §4 y §16 decían que elegir la formación por partido no se agrega nunca, mientras §14 la trataba como postergada; ahora §4 y §16 dicen "postergado, no descartado — ver §14", igual que §14. |
| 2026-09-30 | Lucas Manoukian (claude-sonnet-5) | Resuelve los dos hallazgos 🟡 de la autocrítica: la cita a WCAG 2.1 §1.4.1 (§6.5, §7.2) ahora lleva el link a la página del W3C, verificada contra ella y sin la marca `[UNVERIFIED]`; §16 suma la advertencia sobre el barrido de código de §6.5 que todavía necesita confirmarse línea por línea. |
| 2026-09-30 | Lucas Manoukian (claude-sonnet-5) | Resuelve las dos sugerencias 🔵 de la autocrítica: §5 ahora abre con un párrafo único de visión y marca el resto como "Recorrido ilustrativo"; §8.1 aclara que el orden del mediocampo de F9 en la cancha (MI, MC, MC, MD) es el orden de dibujo izquierda→derecha, distinto del orden de formación de D-03 (MD, MC, MC, MI). |

---

*Next document: [Spec](./DESGLOSE_POSICIONES_SPEC.md). The Spec defines
what the system shall do, how it shall behave, and which solutions are
admissible. Concrete implementation details live in the Implementation Plan,
not here and not in the Spec.*
