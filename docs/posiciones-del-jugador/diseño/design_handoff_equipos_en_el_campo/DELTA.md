# Delta diseño ↔ código — Equipos en el campo

**El código es la fuente de verdad.** `index.html` en `main` manda: donde el diseño y el código
difieran, el que está mal es el diseño. Este archivo es el **único** lugar donde vive el delta —
lo que se diseñó y todavía no está en código, y lo que el código decidió y el diseño no dibujó.
Si algo no está acá, no es delta.

- Diseño: `Equipos en el campo.dc.html` (turnos 4 a 17) — el turno nuevo va arriba.
- Handoff implementable: `handoff/README.md` (cubre los turnos 4 a 8, las doce vistas).
- Ancla de sincronización: ver `github.md` en la raíz del proyecto de diseño.
- Última verificación contra el código: **2026-09-09**, vista por vista (app v2.0.10).

**Estado.** Las siete rebanadas de `D-08`: seis mergeadas, la 7 (configuración) sigue sin escribir
y es opcional (§14 del Concept Note). Después de esas seis se mergeó una feature más, que el
Concept Note no cubre: **"Partido en dos columnas"** (`docs/navegacion-partidos/`), que implementó
los turnos 12 y 13a y realojó la carga de resultados en el switch (14a). Y la **pastilla "2º"** de
los turnos 10d/11c está en `index.html` (`.camiseta-sec`) sin Spec propia, con el diseño citado
como fuente. El **turno 16** (`16b` ancho + `16c` angosto) se implementó el 2026-09-08, también sin
Spec propia. Y el **turno 17** (los íconos de las tres solapas) entró el 2026-09-09, también sin
Spec, tomando `17b` tal cual. Resultado: **los turnos 4 a 17 están todos en código.**

En el mismo tramo entró una feature más, que el Concept Note no cubre: **"Orden de jugadores"**
(`docs/orden-jugadores/`), que le pone al listado de Jugadores un combo de modo de orden y el
arrastre para el modo Manual. No tiene turno propio —nunca se diseñó— y vive en el espejo `15c`.

**El documento está al día.** Los encabezados de los turnos 16 y 17 dicen "En código", y lo que el
código decidió y el dibujo no muestra está en §B.

---

## A. Diseñado y todavía no en código

Ya no quedan turnos pendientes: el delta en esta dirección son dos detalles sueltos, los dos
dentro de vistas que por lo demás están implementadas.

- **La pastilla de estado del borrador** en el encabezado de la carga de resultados —
  "Resultado guardado" cuando el borrador está guardado y su contraparte cuando no
  (`7a`, `7b`, `8e`, `8f`). En código no existe ninguna de las dos: el borrador vive en memoria
  hasta "Finalizar partido" y nada en pantalla dice en qué estado está.
- **La caption "Inscripción cerrada — la cola quedó firme"** en la columna de convocados de
  lectura (`14a`). El código pasa la columna a lectura —sin buscador y sin acciones en el renglón,
  `FR-012`— pero no la rotula. Ojo con el texto: **reordenar sí sigue disponible** con la
  inscripción cerrada (`FR-070`/`TC-042`), así que la caption no puede decir que la cola no se
  toca; sólo que no se agrega ni se quita.

Los dos son de una línea.

---

## B. En código y no dibujado en el diseño

El código decidió cosas que el diseño no muestra. **Manda el código.**

- **El shell de la pantalla es el turno 12, no la tarjeta de los turnos 4 a 8.** El eyebrow de la
  Card ("Equipos generados", "Partido finalizado", "Carga de resultados") no existe en código, y
  la fecha no vive adentro de la tarjeta: el encabezado del panel es sólo `Alineaciones` o
  `Resultado` (`tituloTarjetaEquipos`), y la fecha, el estado y los botones de partido están en el
  encabezado de la pantalla. Las ocho vistas de los turnos 4 a 8 siguen valiendo **como panel**;
  su marco quedó viejo. Anotado en la nota de cada uno de esos turnos.
- **Los rótulos del encabezado del listado van en negrita** (`font-weight: 700`). *El dibujo lo
  tomó el 2026-09-08: `16b` y el espejo `15c` ya van en 700.* Se había probado y descartado en el
  diseño por peso; el propietario pidió el peso fuerte al implementar y manda el código.
  El resto de la fila —10 px, `letter-spacing: 0.08em`, mayúsculas, `#374151` sobre el salvia— es
  el del dibujo. La negrita se ve de verdad y no es simulada: el archivo importa el rango variable
  entero de Inter (`wght@100..900`).
- **La versión apilada del renglón no se esconde con `display:none` en la banda ancha.** Se saca de
  la vista pero se deja en el árbol de accesibilidad, y las celdas de la grilla van `aria-hidden`.
  El motivo no está en el dibujo: en columnas el número queda **solo** —"25", "0"— y el rótulo que
  lo explica vive en el encabezado, que es una fila aparte; leído en voz alta, la grilla sería una
  ristra de números sin nombre. Así quien usa lector escucha la misma frase de siempre
  ("25 PJ, 6G 3E 3P, 0 Goles, 0 Asistencias") y nadie la escucha dos veces.
- **Con rol `jugador` la grilla pierde las dos últimas columnas.** No hay puntaje ni acciones
  (`FR-003`), así que Pts y el menú no se emiten y la plantilla de columnas baja de ocho a seis
  (`body.role-jugador .roster{ --roster-cols: … }`). Es el mismo caso que "Permisos por perfil" más
  abajo: el diseño dibuja siempre la vista de admin.
- **El corte del listado es 760 px de página, y reemplazó a uno de 560 px que ya no existe.** El de
  560 px bajaba los cuatro controles del renglón a una línea propia porque sumaban ~158 px que no
  encogían; con dos (el puntaje y el menú, 68 px) entran al lado del nombre hasta 360 px, así que
  se retiró. `INVARIANTE_FILA_DE_JUGADOR` de `tests/layout.test.js` verificaba que los controles
  BAJARAN y ahora verifica lo contrario; la batería mide además 759 y 760.
- **Cada columna es una Card de 20 px de padding**, no los 24 px de `--space-card-padding` que usa
  la Card del design system en `12a`/`12b`/`12c`. Diferencia deliberada del repo, no un descuido
  del dibujo.
- **Los botones de ciclo de vida al pie** (`D-24`). "Finalizar partido" es el primario al pie de
  la tarjeta en la carga inicial; "Cancelar" sale sólo al editar un resultado ya finalizado. El
  diseño no los dibuja **por decisión del propietario**, y el pie de `7a`/`7b`/`8e`/`8f` dibuja
  Deshacer + Guardar: en código, la carga inicial lleva **sólo Deshacer**, y el Guardar (ícono,
  tomado del `8e`) aparece únicamente al editar un resultado finalizado, junto a Cancelar.
- **El candado son dos tamaños, no uno.** El botón mide siempre 24×24 px (`NFR-004`) y la insignia
  visible va adentro, escalada con la camiseta (`--cand-size`: 22 px con camiseta de 56, 20 con
  52, 19 con 48, 17 con 44). El diseño pinta insignia y objetivo táctil como una sola cosa de
  24 px. La posición sí coincide: abajo a la izquierda, porque la esquina de arriba es de la
  pastilla "2º".
- **La pastilla "2º" es por unidad, no por integrante.** Sobre una dupla hay una sola pastilla —la
  camiseta es una— y el `title` nombra a cada uno de los dos. Coincide con el dibujo.
- **Hay un escalón de medidas que el diseño no dibuja**: `data-max-fila="5"` (camiseta de 44 px),
  más los escalones por container query a 380 px y 360 px de panel. Fútbol 5/6/7/11 sigue diferido
  (§D), pero la escala de la cancha ya está escrita para filas de cinco.
- **Cuatro tonos de pastilla de estado**, todos con la misma geometría (10.5 px, `padding 4px 9px`,
  pill, mayúsculas, `tracking 0.04em`): inscripción abierta (verde pálido sobre texto verde
  profundo), cerrada (`#450a0a` con texto blanco), equipos generados (mostaza) y finalizado
  (`#6b7280` con texto blanco). El diseño pintaba Finalizado en verde y usaba Badges del design
  system para los otros dos: **corregido el 2026-09-07**. El tono "Equipos generados" no se dibuja
  porque vive en la lista de partidos, no en la pantalla del partido. La pastilla "Inactivo" del
  turno 16 toma ese mismo tono gris.
- **Permisos por perfil** (`007-permisos-por-usuario`). Con rol `jugador`, `body.role-jugador`
  esconde todo lo marcado `admin-only`: puntajes de la camiseta, combo de estrategia, candados,
  diferencias, "Por qué quedaron así", los "+"/"−" del detalle y "Generar equipos". **El diseño
  dibuja siempre la vista de admin** — no es divergencia, es un estado que no se dibujó.
- **`.wrap` mide 1160 px fijos a partir de 1100 px**, en las tres pestañas de la app (pedido del
  usuario, 2026-09-03; antes se ensanchaba sólo la pantalla de partido). Ese es el ancho al que
  están dibujadas `12a`/`12b`/`12c` desde el 2026-09-07, y también `16b`.
- **Números y texto del panel se comportan distinto** (`D-25`). Después de un movimiento manual el
  Badge de diferencia total y la grilla por línea **se recalculan** sobre el reparto en pantalla;
  "Por qué quedaron así" **sigue describiendo la última generación**. Es deliberado: los números
  describen el estado, el texto describe un evento. El prototipo ya se comporta igual.
- **La línea de titulares sin puntaje, por equipo** (`D-23`). El código la emite en el receipt; el
  prototipo no la dibuja porque todos sus jugadores tienen puntaje. Es un estado sin datos de
  muestra, no una divergencia del dibujo.
- **El arrastre del listado de Jugadores no tiene asa.** En modo Manual y con sesión admin el
  renglón entero es `draggable` y lo único que lo anuncia es `cursor: grab`; no hay agarre, ni
  guía de inserción, ni realce del renglón objetivo (a diferencia del arrastre sobre la cancha,
  que sí pinta el drop). El dibujo no puede mostrar un cursor: queda dicho en la caption de `15c`.
  Si falla el guardado, el orden vuelve atrás y sale un toast ("No se pudo guardar el nuevo orden.
  Intentá de nuevo.") que el diseño no dibuja.
- **Los dos modos de puntaje del combo de orden no existen para `jugador`.** El selector emite
  Manual + Posición ↑/↓ para todos y agrega Puntaje ↑/↓ sólo para admin; si el modo global
  persistido es por puntaje, un `jugador` ve Manual sin tocar el valor que dejó el admin. Es el
  mismo caso que "Permisos por perfil": el diseño dibuja siempre la vista de admin.
- **Los íconos de solapa se esconden por debajo de 480 px de página.** Con ícono las tres solapas
  pasan de ~316 a ~387 px y no entran en un renglón de 390: el código las deja sólo con texto,
  que es lo que el teléfono ya tenía. `17b` dejaba la decisión abierta entre eso y solapas sin
  texto. Sí está dibujado: el shell de `15e` sigue sin íconos.
- **La solapa mide 38 px de alto, no 46.** El cálculo de `17b` suponía el renglón de Inter de
  24 px del sistema; en la app el renglón es el mono de 11.5 px de `.tab-btn`, así que la solapa
  medía 36 px y el ícono de 16 la lleva a 38. Corregido en la caption de `17b` el 2026-09-09.
- **Un comentario del repo quedó desactualizado, no el dibujo**: `.camiseta-nombre` dice "peso 500
  y no el 700 del handoff", pero la regla declara `font-weight: 700`. El diseño y el código
  coinciden en 700; el que miente es el comentario.

---

## C. El código espera una decisión de diseño

Seis preguntas abiertas. Son la deuda en la dirección contraria: no hay nada que implementar hasta
que el diseño resuelva.

**C1 · El objetivo táctil del candado.** El botón mide 24×24 px. Llevarlo a 44×44 pisaría la
camiseta vecina. Abierta desde la rebanada 1 (`OPEN-Q-02` de `CANCHA_SPEC.md`). Aviso: el `TODO`
que la registraba se retiró al pasar a OpenSpec y `openspec/config.yaml` no lo reemplazó — hoy no
vive en ninguna restricción transversal, sólo en §2 del `Roadmap.md`.

**C2 · Mover un jugador sin gesto de puntero.** El arrastre no tiene equivalente de teclado, y
desde que la cancha reemplazó a la lista la única alternativa es regenerar. Se elevó de la
rebanada 2 → 3 → 6, y la 6 explícitamente no la tomó. Es accesibilidad, no comodidad. **Desde el
2026-09-09 son dos arrastres sin teclado, no uno:** el orden Manual del listado de Jugadores se
edita sólo arrastrando, y ahí el equivalente es más barato que en la cancha —una lista tiene un
orden lineal— pero sigue sin existir. El modo Posición ↑/↓ da una salida parcial: ordena sin
tocar nada.

**C3 · Tres decisiones de texto**, baratas y ninguna bloqueante: si el aviso debe nombrar la
estrategia **aplicada** ahora que el subtítulo se retiró (`OPEN-Q-05`, rebanada 3); si el rótulo
"Por qué quedaron así" debe aclarar que describe la última generación y no el estado actual
(`OPEN-Q-04`, rebanada 3 — ver `D-25` en B); y si la caption compacta de fútbol 9 conviene en el
formato corto del handoff (`OPEN-Q-02`, rebanada 4).

**C4 · La grilla de diferencia por línea con "Por posición y puntaje".** Hoy no se muestra, porque
sería exhibir un dato que el motor no produjo. Con el recálculo ya construido es técnicamente
barato; falta decidir si el dato tiene sentido en una estrategia que no empareja líneas
(`OPEN-Q-03`, rebanada 3).

**C5 · ¿La columna de convocados queda fija al hacer scroll?** `NAVEGACION_PARTIDOS_SPEC.md` §3.2
la dejó explícitamente fuera de alcance (`OPEN-Q-04`), esperando una decisión de diseño. El turno
16 resolvió el mismo problema para el listado de jugadores —encabezado `sticky` con
`overflow:clip`—, así que el camino técnico ya está probado en el repo.

**C6 · El corte de 1100 px es un valor de trabajo.** `OPEN-Q-01`/`A-01` de esa misma Spec: el
número no está validado contra dispositivos reales, y `NFR-003` pide verificarlo en al menos dos
anchos antes de darlo por cerrado. El corte de 760 px del turno 16 tiene el mismo estado.

---

## D. Archivado — no es delta

- **Turno 17 — los íconos de las solapas**: en código desde el **2026-09-09**, sin Spec propia; el
  CSS de `.tab-btn svg` cita el turno como fuente. Se implementó `17b` tal cual —`calendar`,
  `users` y el engranaje de ocho dientes—, a 16 px. Los otros cuatro candidatos (`two-rails`,
  `balance`, `split-rule`, `tactics-board`) **no se tomaron**, incluido el `tactics-board` que la
  nota del turno recomendaba; quedan dibujados en `17a`/`17b`/`17c` como la exploración que
  fundamenta la elección. Lo que el código agregó al dibujo está en §B (alto real de la solapa y
  el corte de 480 px).
- **El orden del listado de Jugadores** (`docs/orden-jugadores/`): en código, sin turno de diseño
  propio. El combo ya estaba dibujado en `15c` desde el 2026-09-08, con el rótulo equivocado
  ("Orden manual" en vez de "Manual", que es lo que el selector emite); corregido el 2026-09-09,
  con la caption explicando los cinco modos y el arrastre. Lo no dibujado está en §B.
- **Turno 16 — el listado de Jugadores en columnas**: en código desde el **2026-09-08**, sin Spec
  propia. Se implementaron `16b` (grilla con encabezado `sticky`, de 760 px para arriba) y `16c`
  (apilado, por debajo). Lo que el código agregó al dibujo está en §B; el badge del `.dc.html`
  quedó viejo, ver la nota de arriba.
- **Las dos variantes descartadas del turno 16**, *eliminadas del documento el 2026-09-08 por
  decisión del propietario*: `16a`, la etiqueta viajando con cada dato ("12 PJ", "7G 2E 3P"), que
  repite el rótulo diecinueve veces; y `16d`, los íconos de gol y asistencia en el encabezado en
  vez de las palabras, que sólo cubren dos de las cuatro columnas y dejan el encabezado mezclando
  palabras con dibujos. Quedaron `16b` y `16c`.
- **El menú de acciones de la cola de convocados** (`.conv-menu-btn` / `.conv-menu`,
  `ICON_MAS_ACCIONES`): entró al repo después de la sincronización del 2026-09-07, así que
  `12a`/`13a`/`14a` todavía dibujan el botón "×" de quitar en su lugar. No es delta en la dirección
  del diseño —el código ya lo tiene— pero esas tres vistas quedan viejas hasta que se redibujen.
  Desde el turno 16 el mismo menú lo usa también el listado de jugadores: su motor se generalizó en
  `abrirMenuDeAcciones` y las dos listas le pasan sus propias acciones.
- **Turnos 4 a 17**: en código. Las seis rebanadas de "Equipos en el campo", más
  "Partido en dos columnas", más la pastilla "2º", más el listado en columnas, más los íconos de
  las solapas.
- **Turno 9 — el nombre en una pastilla del color del puesto**: *eliminado del documento el
  2026-09-07.* El código resolvió el mismo problema por el camino de los turnos 10 y 11 —la
  pastilla "2º" en la esquina— y dejó el nombre en blanco sobre el césped, con `text-shadow`. La
  vuelta ya no aplica.
- **`13b` y `14b` — el apilado con la convocatoria plegada al pie**: *eliminados el 2026-09-07.*
  `NAVEGACION_PARTIDOS_SPEC.md` §3.2 declara que el sistema **no** implementa `13b`, y el código
  tomó `13a`. `14b` era la misma planilla dentro de ese shell.
- **Turno 8 descartado** (la alternativa que leía el armado por línea): descartado por el
  propietario el 2026-08-31.
- **El aviso "Sin eventos cargados para este equipo"**: lo sacó el código el 2026-09-03 porque
  aparecía apenas se cerraba la inscripción y se leía como un error. Se quitó del diseño el
  2026-09-07 (cinco vistas).
- **El subtítulo de estrategia de la tarjeta** (`FR-084`, y `TC-006` para `12c`): retirado en
  código el 2026-09-01. Se quitó de las cinco vistas que todavía lo dibujaban el 2026-09-07.
- **Canchas de otros tamaños** (fútbol 5, 6, 7, 11): diferido deliberado, §14 del Concept Note.
- **Rebanada 7** (configuración: `nameFormat`, `showRatings`, `showLocks`): opcional, §14.
- Los demás diferidos deliberados (migrar partidos históricos al modelo de eventos, el texto que
  copia el botón Copiar, migrar las specs viejas) viven en §14 del Concept Note con la condición
  que los reabre.

---

## Cómo mantenerlo

1. **Implementás algo de A** → se tacha de A al sincronizar, y cualquier ajuste que hayas hecho en
   el camino entra a B.
2. **Pedís diseños nuevos** → entran como turno arriba en el `.dc.html` y como ítem nuevo de A.
   Los turnos viejos no se tocan.
3. **Sincronizás** → se diffea desde la ancla de `github.md`, se verifica vista por vista, y lo que
   el código contradice se corrige en el diseño; lo que el código descartó se elimina y queda
   registrado en §D. El delta nunca se deduce: se lee de acá.
