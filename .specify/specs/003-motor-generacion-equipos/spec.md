# Feature Specification: Motor de generación de equipos

**Feature Branch**: `003-motor-generacion-equipos`

**Created**: 2026-08-11

**Status**: Implemented (migrado desde `Spec.md` monolítico v1). El gap del invariante "Balancear puntaje" (FR-004/FR-010) se cerró — ver [tasks.md](tasks.md). El gap del pool de candidatos a arquero (AC3/AC4/AC5, FR-005) también se cerró: el motor busca primero entre los titulares con Arquero como posición principal, y solo si algún equipo queda sin arquero después de agotarlos, busca entre los que la tienen como posición secundaria para cubrir ese lugar — un natural nunca es desplazado por un secundario.

**Input**: Migración del contenido ya vigente de `Spec.md` (secciones 9 a 17, más el orden de listado de equipos y la explicación de estrategia de la sección 19) a la estructura nativa de spec-kit. Durante la migración se corrigió una inconsistencia de la sección 13 de `Spec.md`: "Balancear puntaje" pasa a ser un invariante no configurable (igual que "máximo un arquero por equipo"), en vez de una regla que se podía desactivar para emparejar equipos solo por cantidad de jugadores ignorando el puntaje — ese comportamiento contradecía el propósito mismo de la estrategia.

**Actualización 2026-08-18**: se agrega la Estrategia 3 (formación fija), que además de las reglas de arquero de la Estrategia 2, intenta completar en cada equipo una formación de posiciones fija según el tamaño de cancha del partido (3-3-1 para cancha de 8, 3-4-1 para cancha de 9), con prioridad fija arquero > formación > diferencia de puntaje (best effort). Ver FR-018 a FR-021.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generar equipos equilibrados automáticamente (Priority: P1)

El administrador elige una estrategia de generación y el motor arma dos equipos equilibrados a partir de los titulares del partido, aplicando reglas de balance configurables en orden de prioridad.

**Why this priority**: Es la razón de ser del motor: sin generación automática, armar equipos manualmente es exactamente el trabajo que la aplicación busca eliminar.

**Independent Test**: Se puede probar generando equipos para un mismo conjunto de titulares con cada una de las dos estrategias, y verificando que el resultado respete las reglas de balance activas.

**Acceptance Scenarios**:

1. **Given** un partido con titulares definidos y la Estrategia 1 (balance por puntaje promedio) seleccionada, **When** se generan los equipos, **Then** cada jugador se evalúa exclusivamente por su puntaje promedio, sin optimizar posiciones, y el listado igual muestra la posición principal de cada jugador a modo informativo.
2. **Given** un partido con titulares definidos y la Estrategia 2 (balance por posiciones) seleccionada, **When** se generan los equipos, **Then** el motor determina la mejor posición para cada jugador priorizando siempre la posición principal, usa una posición secundaria únicamente cuando la cantidad de titulares de la posición principal es impar y la secundaria corrige esa imparidad, y calcula el puntaje con el correspondiente a la posición asignada.
3. **Given** dos o más arqueros naturales (Arquero como posición principal) entre los titulares, **When** se generan los equipos, **Then** cada equipo recibe exactamente un arquero: los dos naturales con mejor puntaje de arquero; los naturales excedentes se reubican en su mejor posición secundaria o, si no tienen, como Delantero. Los titulares con Arquero solo como posición secundaria no se consideran en este caso: los dos lugares ya quedaron cubiertos con naturales.
4. **Given** un único arquero natural entre los titulares y al menos un titular con Arquero como posición secundaria, **When** se generan los equipos, **Then** el natural ocupa el arco de un equipo y, para el otro equipo, se busca entre los titulares con Arquero como posición secundaria: el de mejor puntaje en esa posición ocupa el arco de ese equipo, sin compensación (el natural nunca es desplazado por un secundario, sin importar el puntaje de cada uno).
5. **Given** un único arquero natural entre los titulares y ningún titular con Arquero como posición secundaria, **When** se generan los equipos, **Then** ese natural ocupa el arco de un equipo y el otro equipo compensa esa ventaja equilibrando el resto de sus jugadores, sin arquero fijo.
6. **Given** ningún arquero natural entre los titulares pero dos o más titulares con Arquero como posición secundaria, **When** se generan los equipos, **Then** cada equipo recibe exactamente un arquero: los dos con mejor puntaje en Arquero entre esos candidatos por posición secundaria, sin compensación.
7. **Given** ningún arquero natural entre los titulares y como máximo un titular con Arquero como posición secundaria, **When** se generan los equipos, **Then** ese único candidato (si existe) ocupa el arco de un equipo y el otro equipo compensa equilibrando el resto de sus jugadores; si no existe ningún candidato, no se asigna a nadie al arco en ningún equipo.
8. **Given** jugadores sin puntaje entre los titulares, **When** se generan los equipos, **Then** esos jugadores no se usan para calcular el puntaje total del equipo, pero se distribuyen de la forma más equilibrada posible entre ambos.
9. **Given** equipos ya generados, **When** se visualiza el listado de cada equipo, **Then** los jugadores aparecen siempre ordenados por posición ascendente (Arquero, Defensor, Volante, Delantero), usando la posición asignada con Estrategia 2 o Estrategia 3, o la principal con Estrategia 1.
10. **Given** un partido con titulares definidos y la Estrategia 3 (formación fija) seleccionada, **When** se generan los equipos, **Then** el motor asigna primero los arqueros con las mismas reglas que la Estrategia 2, y luego intenta completar en cada equipo la formación fija correspondiente al tamaño de cancha del partido (3-3-1 para cancha de 8, 3-4-1 para cancha de 9), usando la posición secundaria de un jugador cuando sea necesaria para cubrir un lugar de esa formación, incluso si su puntaje en esa posición secundaria es menor al de otro candidato disponible para ese mismo lugar.
11. **Given** más titulares naturales en una posición que lugares disponibles para esa posición en la formación, **When** se generan los equipos, **Then** los excedentes se reubican en su mejor posición secundaria que coincida con un lugar vacante de la formación.
12. **Given** un lugar de la formación que ningún titular puede cubrir ni por posición principal ni por secundaria, **When** se generan los equipos, **Then** el motor reubica en ese lugar a cualquier titular disponible, priorizando entre las opciones posibles la que menos aleje la diferencia de puntaje entre equipos del `diferenciaMaxima` configurado.
13. **Given** una generación con Estrategia 3 donde, agotadas todas las opciones anteriores, la diferencia de puntaje entre equipos supera igual el `diferenciaMaxima` configurado, **When** se generan los equipos, **Then** la generación se completa igual (la formación tiene prioridad sobre el puntaje) y se muestra el warning correspondiente, sin bloquear ninguna acción sobre el partido.

---

### User Story 2 - Ver explicación y resumen de la generación (Priority: P1)

Después de cada generación, el administrador ve una explicación en lenguaje claro de las decisiones más relevantes tomadas por el motor, junto con un resumen de métricas de calidad.

**Why this priority**: Es lo que permite confiar en el resultado del motor y compararlo entre configuraciones; sin esto, la generación automática es una "caja negra" inútil para decidir si conviene ajustar algo.

**Independent Test**: Se puede probar generando equipos en un escenario con jugadores bloqueados, arquero único y posiciones secundarias usadas, y verificando que cada una de esas decisiones aparezca reflejada en la explicación.

**Acceptance Scenarios**:

1. **Given** una generación donde se usó la posición secundaria de un jugador para mejorar el balance, **When** se muestra la explicación, **Then** incluye una mención específica a esa decisión (por ejemplo, "Se utilizó la posición secundaria de Juan para mejorar el equilibrio de posiciones").
2. **Given** una generación con jugadores bloqueados, **When** se muestra la explicación, **Then** se indica por qué cada jugador bloqueado permaneció en su equipo.
3. **Given** cualquier generación, **When** se muestra el resumen, **Then** incluye como mínimo: estrategia utilizada, puntaje total de cada equipo, diferencia de puntaje, cantidad de jugadores sin puntaje por equipo, cantidad de jugadores bloqueados y cantidad de jugadores que cambiaron de equipo respecto de la generación anterior.
4. **Given** una generación con Estrategia 2, **When** se muestra el resumen, **Then** además incluye balance de posiciones y balance de arqueros; con Estrategia 1 esas dos métricas no se muestran.
5. **Given** una explicación generada, **When** se revisa su contenido, **Then** únicamente refleja decisiones que realmente ocurrieron durante esa ejecución, nunca genéricas o hipotéticas.
6. **Given** una o más reglas configurables deshabilitadas al momento de generar, **When** se muestra la explicación, **Then** incluye una mención listando qué reglas estaban desactivadas para esa generación.
7. **Given** una generación donde el arco se cubrió, total o parcialmente, con la posición secundaria de uno o más jugadores, **When** se muestra la explicación, **Then** incluye una mención específica a esa decisión (por ejemplo, "Nilo ocupó el arco por su posición secundaria").
8. **Given** una generación con Estrategia 3, **When** se muestra el resumen, **Then** incluye además balance de posiciones, balance de arqueros, y una mención explícita de si la formación fija correspondiente se cumplió en ambos equipos o no (por ejemplo, "Formación 3-3-1 cumplida en ambos equipos" o "No se pudo completar el mediocampo del Equipo B").
9. **Given** una generación con Estrategia 3 donde se usó la posición secundaria de un jugador para cubrir un lugar de la formación con un puntaje menor al de otro candidato disponible para ese lugar, **When** se muestra la explicación, **Then** incluye una mención específica a esa decisión.

---

### User Story 3 - Configurar reglas del motor (Priority: P2)

El administrador visualiza las reglas configurables del motor, cambia su prioridad, las habilita o deshabilita, ajusta sus parámetros, y elige la estrategia por defecto para partidos nuevos.

**Why this priority**: Permite adaptar el comportamiento del motor a distintos grupos/preferencias sin tocar código; es secundaria a poder generar y entender una generación (US1 y US2), que funcionan igual con la configuración por defecto.

**Independent Test**: Se puede probar deshabilitando cada regla configurable una por vez y verificando el efecto descrito sobre una generación posterior.

**Acceptance Scenarios**:

1. **Given** la sección "Configuración", **When** el administrador la abre, **Then** ve listadas únicamente las reglas configurables (Balancear posiciones, Balancear jugadores sin puntaje) con su prioridad, estado habilitado/deshabilitado y parámetros; los invariantes "máximo un arquero por equipo" y "balancear puntaje" no aparecen como reglas configurables, aunque el parámetro `diferenciaMaxima` asociado al segundo sigue siendo ajustable.
2. **Given** la regla "Balancear posiciones" deshabilitada, **When** se generan equipos, **Then** los jugadores se reparten en un solo grupo balanceando cantidad y puntaje, sin separar por posición.
3. **Given** el parámetro `usarSecundarias` de "Balancear posiciones" deshabilitado, **When** se generan equipos, **Then** no se usan posiciones secundarias para corregir imparidades.
4. **Given** un valor cargado en el parámetro `diferenciaMaxima`, **When** la diferencia de puntaje resultante lo supera, **Then** el resumen resalta visualmente esa métrica y se agrega una explicación automática sugiriendo bloquear jugadores clave y regenerar, sin bloquear ninguna acción sobre el partido.
5. **Given** la regla "Balancear jugadores sin puntaje" deshabilitada, **When** se generan equipos, **Then** esos jugadores se mezclan en el orden general en vez de repartirse al final.
6. **Given** la Estrategia 1 seleccionada como estrategia por defecto, **When** se visualizan las reglas de scope "Estrategia 2", **Then** se muestran atenuadas con una nota indicando que no tienen efecto con la estrategia actual, aunque siguen siendo configurables porque la configuración es global.
7. **Given** la configuración del motor modificada después de generar equipos para un partido, **When** se visualiza ese partido, **Then** el sistema avisa que los equipos pueden no reflejar la configuración actual y ofrece regenerarlos.
8. **Given** la Estrategia 3 seleccionada, **When** el administrador abre la sección "Configuración", **Then** "cumplir la formación fija" no aparece como regla que se pueda deshabilitar, igual que los invariantes de arquero y de balancear puntaje; la regla "Balancear jugadores sin puntaje" sí sigue apareciendo como configurable y aplica igual que con las otras estrategias.

---

### User Story 4 - Editar equipos manualmente (Priority: P2)

Una vez generados los equipos, el administrador mueve jugadores entre equipos y bloquea/desbloquea jugadores para que no se muevan en una regeneración automática.

**Why this priority**: Es la vía de intervención manual que la aplicación garantiza siempre disponible sobre el resultado del motor; complementa pero no reemplaza a la generación automática (US1).

**Independent Test**: Se puede probar moviendo jugadores entre equipos con drag & drop en desktop, bloqueando algunos, y regenerando para verificar que los bloqueados no cambien de equipo.

**Acceptance Scenarios**:

1. **Given** equipos generados, **When** el administrador arrastra un jugador de un equipo a otro (drag & drop en desktop), **Then** el jugador pasa a integrar el equipo destino.
2. **Given** un jugador bloqueado en su equipo, **When** se vuelve a ejecutar el algoritmo de generación, **Then** ese jugador nunca cambia de equipo, sin excepción.
3. **Given** un jugador desbloqueado, **When** se regenera, **Then** el algoritmo puede reubicarlo libremente junto con el resto de los jugadores no bloqueados.
4. **Given** un dispositivo táctil (celular/tablet), **When** el administrador intenta usar drag & drop, **Then** la interacción puede no responder igual que en desktop; no existe todavía una alternativa táctil equivalente (limitación conocida de esta versión, ver `Roadmap.md`).

---

### User Story 5 - Regenerar equipos ante cambios (Priority: P3)

Cuando cambia la lista de jugadores convocados, el sistema regenera los equipos intentando mantener la mayor cantidad posible de asignaciones existentes y respetando siempre a los jugadores bloqueados.

**Why this priority**: Es un refinamiento sobre la generación base (US1): reduce la fricción de tener que rearmar todo el equipo por un cambio puntual en la convocatoria, pero el sistema es funcional sin esta optimización.

**Independent Test**: Se puede probar dando de baja o agregando un titular sobre equipos ya generados y verificando que la cantidad de jugadores que cambia de equipo sea la mínima posible entre los no bloqueados.

**Acceptance Scenarios**:

1. **Given** equipos generados con jugadores bloqueados, **When** cambia la lista de titulares, **Then** los jugadores bloqueados nunca cambian de equipo y el resto se recalcula buscando el balance óptimo entre los jugadores libres.
2. **Given** una regeneración, **When** se compara con la generación anterior, **Then** el resumen (User Story 2) muestra la cantidad de jugadores que cambiaron de equipo respecto de esa generación anterior.

### Edge Cases

- Estrategia 1 seleccionada: el motor nunca usa posiciones secundarias para balancear, ya que esa estrategia ignora la posición por definición.
- Cantidad par de titulares en una posición principal: nunca se usa una posición secundaria para esa posición, porque no hay imparidad que corregir.
- `diferenciaMaxima` vacío: no se aplica ningún umbral de advertencia, pero el invariante de balancear puntaje sigue intentando minimizar la diferencia igual.
- Todos los titulares bloqueados: la regeneración no tiene margen de reubicación; el resultado es idéntico a la generación anterior.
- Minimizar cambios entre jugadores no bloqueados no es un objetivo que el algoritmo optimice activamente hoy: solo recalcula el balance óptimo entre los libres, lo que puede mover más jugadores de lo estrictamente necesario.
- Estrategia 3 con un tamaño de cancha distinto de 8 o 9: no hay una formación fija definida para ese tamaño; queda fuera de alcance de esta versión (se agregará la formación correspondiente cuando se sumen nuevos tamaños de cancha soportados).
- Estrategia 3 sin ningún candidato, ni principal ni secundario, para un lugar de la formación: el motor reubica ahí a cualquier titular disponible priorizando no alejarse del `diferenciaMaxima` configurado; si aun así se supera, se muestra el warning (no se bloquea la generación).
- Estrategia 3 y arquero: se rige exactamente por las mismas reglas de la Estrategia 2 (FR-005); la formación fija se calcula sobre los jugadores de campo, sin contar el arco.
- Un arquero natural con puntaje más bajo en la posición Arquero que un candidato por posición secundaria: el natural igual ocupa un arco (nunca es desplazado por un secundario); el puntaje solo decide entre candidatos del mismo nivel (entre naturales si hay 2+, o entre secundarios cuando hace falta cubrir el lugar que los naturales no llenaron).
- Tres o más arqueros naturales entre los titulares: los dos de mejor puntaje ocupan el arco y el resto queda excedente (se reubica), exactamente igual que si no hubiera ningún candidato por posición secundaria — el excedente natural nunca "pierde su lugar" ante un secundario, porque los secundarios ni se consideran cuando los dos lugares ya se cubrieron con naturales.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer al menos tres estrategias de generación seleccionables por el administrador por partido: Estrategia 1 (balance por puntaje promedio), Estrategia 2 (balance por posiciones) y Estrategia 3 (formación fija).
- **FR-002**: La Estrategia 1 MUST evaluar a cada jugador exclusivamente por su puntaje promedio, sin optimizar posiciones, mostrando igualmente la posición principal a modo informativo.
- **FR-003**: La Estrategia 2 MUST determinar la mejor posición para cada jugador priorizando la posición principal, MUST usar una posición secundaria únicamente cuando corrija una imparidad de titulares en esa posición, y MUST calcular el puntaje con el de la posición asignada.
- **FR-004**: El sistema MUST garantizar, como invariantes no configurables: (a) que ningún equipo tenga más de un arquero, y (b) que el motor siempre intente minimizar la diferencia de puntaje entre ambos equipos. Ninguno de los dos MUST aparecer como regla que se pueda deshabilitar en la sección Configuración.
- **FR-005**: El sistema MUST elegir a los arqueros de cada equipo por niveles: primero entre los titulares con Arquero como posición principal (los de mejor puntaje en esa posición, hasta un máximo de dos, uno por equipo); un titular con Arquero como posición principal nunca puede ser desplazado por uno que la tenga solo como posición secundaria. Únicamente cuando algún equipo quede sin arquero después de agotar los titulares con Arquero como posición principal, el sistema MUST buscar entre los titulares con Arquero como posición secundaria (los de mejor puntaje en esa posición) para cubrir ese lugar faltante; si no hay ningún candidato en ningún nivel, no asigna a nadie al arco. El sistema MUST reubicar en su mejor posición secundaria (o, en su defecto, como Delantero) a los titulares con Arquero como posición principal que no resulten elegidos; los candidatos elegibles solo por posición secundaria que no resulten elegidos MUST seguir jugando su posición principal habitual, sin relocación especial. El sistema MUST compensar equilibrando el resto del equipo únicamente cuando exista un único titular elegido para el arco (en cualquiera de los dos niveles) y el otro equipo quede sin arquero fijo.
- **FR-006**: El sistema MUST excluir a los jugadores sin puntaje del cálculo de puntaje total del equipo, distribuyéndolos de la forma más equilibrada posible.
- **FR-007**: El sistema MUST mostrar, dentro de cada equipo, a los jugadores ordenados por posición ascendente (Arquero, Defensor, Volante, Delantero).
- **FR-008**: El sistema MUST generar, después de cada ejecución, una explicación en lenguaje claro de las decisiones relevantes tomadas, reflejando únicamente decisiones que ocurrieron efectivamente.
- **FR-009**: El sistema MUST mostrar, después de cada generación, un resumen con estrategia utilizada, puntaje total por equipo, diferencia de puntaje, jugadores sin puntaje por equipo, jugadores bloqueados y jugadores que cambiaron de equipo respecto de la generación anterior; MUST agregar balance de posiciones y balance de arqueros cuando se usa la Estrategia 2 o la Estrategia 3; MUST agregar además, únicamente con Estrategia 3, una mención de si la formación fija correspondiente se cumplió o no en cada equipo.
- **FR-009b**: Cuando alguna regla configurable esté deshabilitada al momento de generar, la explicación (FR-008) MUST incluir una mención listando qué reglas estaban desactivadas para esa generación.
- **FR-010**: El sistema MUST permitir visualizar, reordenar por prioridad, habilitar, deshabilitar y parametrizar las reglas configurables (Balancear posiciones con `usarSecundarias`, Balancear jugadores sin puntaje), y MUST permitir ajustar el parámetro `diferenciaMaxima` del invariante de balancear puntaje, sin exponer ninguno de los dos invariantes (arqueros, puntaje) como regla que se pueda deshabilitar.
- **FR-011**: El sistema MUST permitir elegir una estrategia por defecto global, aplicada al crear partidos nuevos, sin impedir elegir una estrategia distinta por partido.
- **FR-012**: Cuando la diferencia de puntaje entre equipos supere el `diferenciaMaxima` configurado, el sistema MUST resaltar esa métrica en el resumen y MUST agregar una explicación automática sugiriendo acciones correctivas, sin bloquear ninguna acción sobre el partido.
- **FR-013**: El sistema MUST avisar cuando la configuración del motor cambie después de haber generado los equipos de un partido, ofreciendo regenerarlos.
- **FR-014**: El sistema MUST permitir mover jugadores entre equipos manualmente (drag & drop en desktop) después de una generación.
- **FR-015**: El sistema MUST permitir bloquear y desbloquear jugadores en su equipo, y MUST garantizar que un jugador bloqueado nunca cambie de equipo en ninguna regeneración.
- **FR-016**: Ante un cambio en la lista de titulares, el sistema MUST regenerar los equipos respetando siempre a los jugadores bloqueados y recalculando el balance entre los jugadores libres.
- **FR-017**: La arquitectura del motor MUST permitir incorporar nuevas estrategias y reglas sin modificar el funcionamiento de las existentes.
- **FR-018**: El sistema MUST ofrecer la Estrategia 3 (formación fija), que, después de asignar arqueros con las mismas reglas que la Estrategia 2 (FR-005), MUST intentar completar en cada equipo una formación de posiciones fija determinada por el tamaño de cancha del partido: 3 defensores, 3 volantes y 1 delantero para cancha de 8; 3 defensores, 4 volantes y 1 delantero para cancha de 9. Cumplir esa formación MUST ser un invariante no configurable, con esta prioridad fija entre reglas: (1) arqueros, (2) formación, (3) diferencia de puntaje entre equipos (best effort).
- **FR-019**: Para cubrir cada lugar de la formación, el sistema MUST buscar candidatos en este orden: (a) titulares con esa posición como principal, priorizando al de mejor puntaje en esa posición; (b) si no hay más naturales disponibles, titulares con esa posición como secundaria, priorizando al de mejor puntaje en esa posición aunque sea menor al de otro candidato disponible para otro lugar — la formación MUST tener prioridad sobre el puntaje individual; (c) si ningún titular tiene esa posición ni como principal ni como secundaria, cualquier otro titular disponible, elegido priorizando no alejarse del `diferenciaMaxima` configurado.
- **FR-020**: El sistema MUST reubicar a los titulares naturales excedentes de una posición (aquellos para los que no queda lugar en la formación) en su mejor posición secundaria que coincida con un lugar vacante de esa formación; si ninguna de sus posiciones secundarias coincide con un lugar vacante, se les aplica el criterio de FR-019(c).
- **FR-021**: Con Estrategia 3, el sistema MUST tratar la diferencia de puntaje entre equipos como objetivo de mejor esfuerzo (best effort) subordinado a la formación: si, agotadas las opciones de FR-019 y FR-020, la diferencia sigue superando el `diferenciaMaxima` configurado, MUST completar la generación igual y mostrar el warning correspondiente (mismo mecanismo que FR-012), sin bloquear ninguna acción sobre el partido.

### Key Entities

- **Motor de generación**: componente desacoplado de la interfaz que ejecuta una estrategia con un conjunto de reglas e invariantes priorizados sobre los titulares de un partido.
- **Estrategia**: Estrategia 1 (balance por puntaje promedio), Estrategia 2 (balance por posiciones) o Estrategia 3 (formación fija); determina qué información usa el motor para balancear.
- **Regla**: unidad de balance configurable, con prioridad, estado habilitado/deshabilitado y parámetros propios (Balancear posiciones, Balancear jugadores sin puntaje). Distinta de un invariante: se puede deshabilitar.
- **Invariante**: comportamiento del motor que siempre se cumple y no aparece como regla configurable (máximo un arquero por equipo; balancear puntaje entre equipos — este último con el parámetro ajustable `diferenciaMaxima` para fines de advertencia, sin que el balanceo en sí se pueda apagar; y, únicamente con Estrategia 3, cumplir la formación fija de posiciones correspondiente al tamaño de cancha).
- **Formación fija**: (Estrategia 3) distribución objetivo de posiciones de campo por equipo según el tamaño de cancha del partido — 3 defensores/3 volantes/1 delantero para cancha de 8, 3 defensores/4 volantes/1 delantero para cancha de 9 — sin contar el arco. Tiene prioridad sobre el puntaje individual de un jugador y sobre la diferencia de puntaje entre equipos.
- **Configuración del motor**: conjunto global de reglas activas, sus prioridades y parámetros, más la estrategia por defecto para partidos nuevos.
- **Resumen de generación**: conjunto de métricas calculadas tras una ejecución del motor, usado para evaluar su calidad y compararla entre configuraciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador obtiene dos equipos generados automáticamente en una sola acción, sin necesidad de armarlos manualmente desde cero.
- **SC-002**: El 100% de las generaciones muestra una explicación y un resumen de métricas coherente con las decisiones realmente tomadas por el motor.
- **SC-003**: El 100% de las generaciones respeta los invariantes de máximo un arquero por equipo y de intento de minimizar la diferencia de puntaje.
- **SC-004**: Un jugador bloqueado nunca cambia de equipo en el 100% de las regeneraciones posteriores al bloqueo.
- **SC-005**: El administrador puede ajustar el comportamiento configurable del motor (reglas, prioridades, parámetros, estrategia por defecto) sin necesidad de intervención técnica.
- **SC-006**: Con Estrategia 3, el 100% de las generaciones cumple la formación fija de posiciones cuando el pool de titulares lo permite (posiciones principales o secundarias suficientes); cuando no lo permite, el sistema lo señala explícitamente en la explicación en vez de fallar silenciosamente.

## Assumptions

- El modelo de datos de Jugador (posiciones, puntajes) y de Partido/Cancha (que determina la cantidad de titulares a balancear) están especificados en los specs de las features "Gestión de jugadores" y "Gestión de partidos" respectivamente.
- La persistencia de la configuración del motor y de los equipos generados usa la misma capa de persistencia compartida (Cloud Firestore) que el resto de la aplicación.
- No existe todavía una alternativa táctil equivalente al drag & drop para editar equipos manualmente en dispositivos móviles (ver `Roadmap.md`, sección "Mejoras de UX").