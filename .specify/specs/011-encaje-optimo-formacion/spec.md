# Feature Specification: Mejor encaje posible con la formación fija y duplas repartidas parejo

**Feature Branch**: `011-encaje-optimo-formacion`

**Created**: 2026-08-19

**Status**: Implementada (2026-08-19) — asignación de posiciones con encaje óptimo y reparto de duplas. Verificada con `node tests/motor.test.js`: los 10 casos de esta feature pasaron al bloque BASELINE. El armado del partido testigo pasó de 51.8/51.3 con la formación incumplida a 50.8/51.3 con la formación cumplida en los dos equipos.

**Depends on**: `009-ventaja-sin-arquero` y `010-refinamiento-objetivo` (definen el objetivo de diferencia que el reparto de equipos persigue)

**Input**: User description: "Que una vez armado todo barra todo a ver si hay algo intercambiable en el equipo. En el partido del jueves, Claudio/Juan quedaron de delanteros cuando Leandro puede jugar ahí y ellos de volantes."

## Contexto

La Estrategia 3 decide las posiciones **en una sola pasada y nunca las revisa**: parte de la posición principal de cada titular y solo corrige las posiciones que quedaron con excedente, moviendo a esos titulares a los lugares que faltan. Eso tiene una consecuencia concreta: **un titular cuya posición natural no tenía excedente nunca se considera para un lugar vacío**, aunque lo cubra como secundaria. Y el lugar que queda sin candidatos se llena con el primer titular suelto de la lista, sin evaluar si juega ahí.

Un partido real reconstruido muestra el efecto. Formación 3-3-1, un solo arquero:

- La dupla Claudio/Juan (que entre los dos cubren Defensor y Volante, **no** Delantero) terminó de Delantero, porque fue el titular que quedó suelto.
- Leandro Benítez, que tiene Delantero como posición secundaria, se quedó de Volante, porque Volante no tenía excedente y por lo tanto nunca entró en la corrección.
- Resultado: el resumen avisó "No se pudo completar la formación 3-3-1 en el Equipo Blanco" cuando **sí se podía**.

Verificado sobre ese mismo plantel: existía un armado con **cero lugares descubiertos** y la formación cumplida en los dos equipos, y el único cambio necesario era intercambiar las posiciones de esos dos dentro del mismo equipo. Además, ese armado no empeora el balance: la diferencia de 0.5 de ese día era el **piso matemático** de ese plantel con equipos parejos, alcanzable o no la formación.

Un segundo problema apareció al analizar ese partido: **nada garantiza que las duplas queden repartidas entre los dos equipos.** Ese día quedó una por equipo por casualidad del reparto. Un armado con las dos duplas en el mismo equipo deja 10 jugadores reales contra 8 — cuatro rotando en dos lugares contra ocho jugando enteros.

## Clarifications

### Session 2026-08-19

- Q: ¿Alcanza con barrer el resultado al final buscando intercambios que mejoren, como propuso el usuario? → A: Arregla el caso del jueves, pero se clava en óptimos locales: cuando la solución requiere una rotación de tres titulares (A al puesto de B, B al de C, C al de A), ningún intercambio de a dos mejora por separado y el barrido se detiene creyendo que terminó. Por eso la asignación de posiciones se resuelve con garantía de óptimo, no con un barrido.
- Q: ¿El encaje se decide con los puntajes o con las posiciones declaradas? → A: Con las posiciones declaradas (principal y secundarias). El puntaje no participa de la decisión de encaje. Todos los intentos de expresar el encaje dentro del puntaje degeneran: el promedio de la dupla premia posiciones que nadie cubre, el mínimo de las notas no penaliza a quien tiene una sola nota cargada, y el cero actual castiga de más. Encaje y puntaje son dos dimensiones distintas.
- Q: ¿Hay que elegir entre cumplir la formación y equilibrar el puntaje? → A: Casi nunca. El encaje de un titular depende de la **posición**, no del equipo, y los cupos por posición de cada equipo están fijos por la formación. Entonces, una vez decidido quién juega en cada puesto, cualquier reparto entre equipos que respete los cupos da exactamente el mismo encaje. Las dos decisiones son independientes: se puede tener el mejor encaje posible **y**, dentro de eso, el mejor balance posible.
- Q: ¿Cómo se mide el encaje de una dupla, que son dos jugadores en un lugar? → A: En tres niveles: la posición la cubren los dos integrantes (encaje pleno), la cubre uno solo (encaje parcial, porque la mitad del partido hay alguien fuera de puesto), o no la cubre ninguno (lugar descubierto). Hoy la unidad "cubre" una posición si cualquiera de los dos la cubre, sin distinguir.
- Q: ¿Cuántas duplas por equipo? → A: Si la cantidad de duplas es **par**, se reparten en partes iguales (dos duplas → una por equipo; cuatro → dos y dos). Si es **impar**, la dupla que sobra va al equipo que tiene arquero fijo: con una sola dupla y un solo arquero entre los titulares, el equipo que rota el arco no recibe ninguna dupla; con tres duplas, dos van al equipo con arquero y una al que rota. Se formula sobre duplas y no sobre jugadores reales porque con un número impar de duplas los jugadores reales no pueden quedar parejos nunca. Es restricción dura, no objetivo a optimizar.
- Q: ¿Por qué la dupla que sobra va al equipo con arquero fijo? → A: Porque el lugar de una dupla siempre lo ocupa alguien que jugó la mitad del partido, y esa frescura es una ventaja que el puntaje no mide. El equipo sin arquero fijo ya recibe una ventaja de puntaje (`009-ventaja-sin-arquero`); darle además la dupla que sobra sería acumular dos ventajas sobre el mismo equipo.
- Q: Y si la cantidad de duplas es impar pero los dos equipos tienen arquero fijo (o ninguno lo tiene)? → A: No hay criterio de desempate: la dupla que sobra va a cualquiera de los dos equipos.
- Q: ¿Jugar con duplas es ventaja? → A: Levemente, y por algo que el puntaje no mide: el lugar de la dupla siempre lo ocupa alguien que jugó la mitad del partido. No se le pone un número a esa frescura (sería otro factor a calibrar a ciegas); se administra estructuralmente, repartiéndolas parejo.
- Q: ¿La regla de duplas parejas aplica a las otras estrategias? → A: En esta feature no, pero se extendió a las tres en `013-duplas-parejas-estrategias-1-2`, implementada el mismo día. La regla vive en un solo lugar del código y la usan las tres estrategias.
- Q: ¿Cambia la fórmula de puntaje de las duplas o de los jugadores fuera de posición? → A: No. Esta feature no toca ningún puntaje. Al sacar el encaje de la dimensión del puntaje, dejan de hacer falta los ajustes que se habían considerado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Que la formación se cumpla siempre que sea posible (Priority: P1)

Un "admin" genera equipos con Estrategia 3. Si existe alguna manera de completar la formación fija con los titulares convocados, el motor la encuentra. El aviso "No se pudo completar la formación" solo aparece cuando realmente no había forma.

**Why this priority**: Es el motivo de la feature. Hoy ese aviso puede aparecer teniendo una solución a mano, y eso hace que el usuario desconfíe del motor o pierda tiempo bloqueando jugadores y regenerando para nada.

**Independent Test**: Reproducir el partido testigo (ver Caso testigo más abajo) y verificar que la formación 3-3-1 queda cumplida en los dos equipos y que nadie juega en una posición que no cubre.

**Acceptance Scenarios**:

1. **Given** un plantel donde existe al menos una asignación que completa la formación en los dos equipos, **When** se generan equipos con Estrategia 3, **Then** la formación queda cumplida y el resumen no avisa lugares sin cubrir.
2. **Given** un plantel donde algún lugar no lo cubre ningún titular ni por posición principal ni por secundaria, **When** se generan equipos, **Then** la cantidad de lugares descubiertos es la mínima posible y el resumen los informa.
3. **Given** dos asignaciones posibles con la misma cantidad de lugares descubiertos, **When** se generan equipos, **Then** el motor elige la que deja a más titulares en su posición principal.
4. **Given** un titular que ocupa una posición secundaria para completar la formación, **When** el "admin" lee el resumen, **Then** encuentra explicado ese movimiento, como hoy.
5. **Given** un plantel donde la solución requiere rotar tres titulares entre tres posiciones, **When** se generan equipos, **Then** el motor la encuentra igual (no se limita a intercambios de a dos).
6. **Given** titulares bloqueados, **When** se generan equipos, **Then** conservan equipo y posición de la generación anterior y el resto se asigna alrededor de ellos, como hoy.
7. **Given** un partido con más titulares que lugares en la formación, **When** se generan equipos, **Then** el remanente se reparte como hoy, sin romper la formación de ninguno de los dos equipos.

---

### User Story 2 - Que las duplas queden repartidas entre los dos equipos (Priority: P2)

Un "admin" genera equipos en un partido con dos duplas de rotación. Cada equipo recibe una. Ningún equipo queda con cuatro jugadores rotando en dos lugares mientras el otro juega con ocho fijos.

**Why this priority**: Es una regla de equidad visible a ojo, independiente del encaje, y hoy se cumple solo por casualidad. No bloquea la Historia 1, pero sin ella el mejor armado por puntaje puede quedar en un armado que nadie aceptaría como justo.

**Independent Test**: Generar equipos en un partido con dos duplas y verificar que quedó una en cada equipo; repetir con tres duplas y verificar dos y una.

**Acceptance Scenarios**:

1. **Given** un partido con dos duplas entre los titulares, **When** se generan equipos con Estrategia 3, **Then** queda una dupla en cada equipo.
2. **Given** un partido con una sola dupla y un solo candidato a arquero (un equipo queda sin arquero fijo), **When** se generan equipos, **Then** la dupla va al equipo que tiene arquero fijo y el equipo que rota el arco no recibe ninguna dupla.
3. **Given** un partido con tres duplas y un solo candidato a arquero, **When** se generan equipos, **Then** el equipo con arquero fijo recibe dos duplas y el que rota el arco recibe una.
4. **Given** un partido con una cantidad impar de duplas y arquero fijo en los dos equipos (o en ninguno), **When** se generan equipos, **Then** la dupla que sobra va a cualquiera de los dos equipos (no hay criterio de desempate).
5. **Given** una dupla bloqueada en un equipo, **When** se generan equipos, **Then** se respeta ese equipo y las duplas restantes se reparten alrededor de ese hecho según la regla de arriba.
6. **Given** cualquier partido con duplas, **When** se generan equipos, **Then** los dos integrantes de cada dupla siguen quedando siempre en el mismo equipo (invariante de `008-duplas-rotacion`).

---

### User Story 3 - Que el balance siga siendo el mejor posible dentro de esa formación (Priority: P3)

El "admin" comprueba que arreglar la formación no le costó equilibrio: la diferencia de puntaje sigue siendo la más cercana al objetivo que se puede lograr con esos titulares en esos puestos.

**Why this priority**: Es la garantía de que la feature no cambia una queja por otra. Sale casi sola de la independencia entre encaje y reparto, pero hay que verificarla explícitamente.

**Independent Test**: Sobre el partido testigo, verificar que la diferencia lograda no es peor que la que producía el motor antes de la feature.

**Acceptance Scenarios**:

1. **Given** el encaje ya decidido, **When** el motor reparte los equipos, **Then** busca el desvío más chico posible respecto del objetivo de diferencia (`009`/`010`), respetando los cupos de la formación y el reparto de duplas.
2. **Given** el partido testigo, **When** se generan equipos, **Then** la diferencia lograda no es peor que la que producía el motor antes de esta feature.
3. **Given** que corregir la formación obligara a resignar balance, **When** se generan equipos, **Then** se prioriza la formación (ya es la prioridad vigente en `003-motor-generacion-equipos`, FR-018) y el resumen informa la diferencia resultante.

---

### Caso testigo (partido real reconstruido)

Sirve como criterio de aceptación concreto de las tres historias. Formación 3-3-1, un único candidato a arquero (que entra por posición secundaria), 16 unidades de armado entre las que hay dos duplas de rotación.

**Antes** (comportamiento actual): la dupla que cubre Defensor y Volante termina de Delantero sin cubrir ese puesto; el volante con Delantero como secundaria se queda de Volante; el resumen avisa que no se pudo completar la formación; dos jugadores aparecen como "sin puntaje" por estar en una posición donde no tienen nota cargada.

**Después** (esperado): el volante pasa a Delantero (su secundaria) y la dupla a Volante (que cubren los dos). El otro equipo queda exactamente igual. Formación cumplida en los dos equipos, cero lugares descubiertos, los contadores de "sin puntaje" quedan en cero, una dupla por equipo, y la diferencia de puntaje no empeora.

### Edge Cases

- **Ninguna asignación cubre todos los lugares**: se minimiza la cantidad de lugares descubiertos y se informa cuáles quedaron, como hoy.
- **Un solo arquero o ninguno**: la asignación de arqueros no cambia (`003`, FR-005); la formación se calcula sobre los jugadores de campo que quedan, y el equipo sin arquero fijo recibe un lugar de campo extra, como hoy.
- **Empates entre asignaciones igual de buenas**: cualquiera es válida; el motor no necesita ser determinista respecto de titulares con el mismo puntaje y el mismo encaje. En el partido testigo, varios defensores comparten puntaje y son intercambiables entre equipos sin cambiar el resultado.
- **Duplas bloqueadas**: mandan sobre el reparto parejo de duplas (no se rompe un bloqueo para equilibrar duplas).
- **Titulares que no cubren ninguna posición de campo**: siguen pudiendo ocupar un lugar (queda contado como descubierto e informado), nunca se los deja afuera del armado.
- **Más duplas que lugares**: si la cantidad de duplas hace imposible cumplir simultáneamente los cupos y el reparto parejo, se prioriza la formación y se informa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST decidir qué titular juega en cada posición de la formación fija de modo que la cantidad de lugares cubiertos por alguien que no juega esa posición (ni principal ni secundaria) sea la mínima posible con ese plantel.
- **FR-002**: Entre las asignaciones con la mínima cantidad de lugares descubiertos, el sistema MUST elegir una que maximice la cantidad de titulares ubicados en su posición principal.
- **FR-003**: El sistema MUST determinar el encaje a partir de las posiciones declaradas de cada titular (principal y secundarias), sin usar el puntaje para esa decisión.
- **FR-004**: Para una dupla de rotación, el sistema MUST distinguir tres niveles de encaje en una posición: la cubren los dos integrantes, la cubre uno solo, o no la cubre ninguno; y MUST preferir el encaje pleno sobre el parcial.
- **FR-005**: El sistema MUST decidir la asignación de posiciones sin depender de a qué equipo va cada titular, y MUST repartir los equipos después, respetando los cupos por posición de la formación.
- **FR-006**: El sistema MUST considerar asignaciones que impliquen reubicar a tres o más titulares de forma encadenada, no solo intercambios entre dos.
- **FR-007**: El sistema MUST repartir las duplas de rotación en partes iguales entre los dos equipos cuando su cantidad sea par, como restricción dura del reparto.
- **FR-007a**: Cuando la cantidad de duplas sea impar y exactamente uno de los dos equipos tenga arquero fijo, el sistema MUST asignar la dupla que sobra al equipo que tiene arquero fijo; el equipo que rota el arco MUST recibir la cantidad menor.
- **FR-007b**: Cuando la cantidad de duplas sea impar y los dos equipos tengan arquero fijo, o ninguno lo tenga, el sistema MAY asignar la dupla que sobra a cualquiera de los dos equipos.
- **FR-008**: El sistema MUST mantener a los dos integrantes de cada dupla en el mismo equipo (`008-duplas-rotacion`).
- **FR-009**: El sistema MUST respetar el equipo y la posición de los titulares bloqueados, y MUST asignar el resto alrededor de ellos.
- **FR-010**: Dentro de la asignación de posiciones elegida y de las restricciones de cupo y de duplas, el sistema MUST buscar el desvío más chico posible respecto del objetivo de diferencia definido en `009-ventaja-sin-arquero`.
- **FR-011**: El sistema MUST informar en el resumen los movimientos a posición secundaria y los lugares que quedaron descubiertos, reflejando la asignación final efectiva y no decisiones intermedias que quedaron sin efecto.
- **FR-012**: El sistema MUST NOT modificar la forma de elegir arqueros, ni la fórmula de puntaje de los jugadores, ni el valor de puntaje de las duplas.
- **FR-013**: El aviso "No se pudo completar la formación" MUST aparecer únicamente cuando no exista ninguna asignación que la complete con los titulares convocados.

### Enmiendas a specs vigentes

- **`003-motor-generacion-equipos`, FR-019 / FR-020 / FR-021**: describen el procedimiento de corrección de posiciones por excedentes y faltantes, lugar por lugar. Deben pasar a describir el resultado exigido (mejor encaje posible, con la prioridad de FR-001/FR-002 de esta feature) en lugar del procedimiento, que se reemplaza.
- **`008-duplas-rotacion`, FR-008**: se le agrega la restricción de reparto parejo de duplas entre equipos para la Estrategia 3, que hoy no está especificada en ninguna parte.

## Key Entities

- **Encaje** (nuevo concepto explícito): qué tan bien le corresponde una posición a un titular, según lo declarado en su ficha. Tres niveles para un jugador (principal, secundaria, no la juega) y tres para una dupla (los dos, uno solo, ninguno). Es independiente del puntaje.
- **Asignación de posiciones**: qué titular juega en cada lugar de la formación, para los dos equipos juntos. Se decide antes que el reparto de equipos y no depende de él.
- **Reparto de equipos**: qué titular va a cada equipo, respetando los cupos de la formación, el reparto parejo de duplas y los bloqueados, buscando el objetivo de diferencia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el partido testigo, la formación 3-3-1 queda cumplida en los dos equipos y ningún titular ocupa una posición que no cubre.
- **SC-002**: El aviso "No se pudo completar la formación" no aparece en ningún partido en el que exista una asignación que la complete.
- **SC-003**: En todo partido con una cantidad par de duplas, los dos equipos reciben la misma cantidad; con una cantidad impar y un solo equipo con arquero fijo, la dupla que sobra queda del lado del equipo con arquero fijo.
- **SC-004**: La diferencia de puntaje lograda no es peor que la que producía el motor antes de esta feature, sobre el mismo partido y la misma configuración.
- **SC-005**: La generación sigue siendo instantánea desde la perspectiva del usuario (sin espera perceptible) con la cantidad de titulares que maneja la aplicación.
- **SC-006**: El resumen del armado describe exactamente la asignación final: no menciona movimientos que no ocurrieron ni omite lugares descubiertos.

## Assumptions

- `009-ventaja-sin-arquero` y `010-refinamiento-objetivo` están implementadas: existe un objetivo de diferencia único que el reparto persigue.
- La cantidad de titulares por partido es acotada (hasta ~18 unidades de armado) y las posiciones de campo son tres, por lo que calcular la mejor asignación es instantáneo y no requiere aproximaciones.
- Las posiciones declaradas de cada jugador (principal y secundarias) están cargadas con la intención de indicar dónde puede jugar; el motor las toma como verdad y no las cuestiona con los puntajes.
- El puntaje de un jugador en una posición que no tiene cargada sigue valiendo lo que vale hoy. Esta feature no lo cambia porque ya no necesita que el puntaje exprese encaje.
- La formación objetivo la sigue determinando el tamaño de cancha del partido (`003`, FR-018).

## Fuera de Alcance

- Cambiar el valor de puntaje de una dupla para que dependa de la posición, o cambiar cuánto vale un jugador fuera de su posición. Quedó explícitamente descartado: el encaje se resuelve por fuera del puntaje.
- Corregir que el panel muestre "sin puntaje" para integrantes de una dupla que sí tienen puntaje en el motor (el panel evalúa al jugador real en su posición asignada mientras el motor usa el valor combinado de la unidad). Esta feature lo alivia en la práctica al ubicar mejor a las duplas, pero el desajuste de fondo sigue y merece su propio spec.
- Agregar un paso de asignación óptima a la Estrategia 2.
- Informar al usuario el mínimo de diferencia alcanzable con un plantel dado, en lugar de sugerirle bloquear y regenerar cuando no hay margen.
