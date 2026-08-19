# Feature Specification: Los puntajes que muestra el panel son los que usó el motor

**Feature Branch**: `012-puntajes-coherentes-panel`

**Created**: 2026-08-19

**Status**: Implementada (2026-08-19). Verificada con `node tests/motor.test.js` (2 casos: la suma de los puntajes visibles da el total del equipo, y una dupla con puntaje no cuenta como "sin puntaje"). Falta la verificación visual en el navegador.

**Depends on**: nada. Se puede implementar antes, después o en paralelo a `009`/`010`/`011`.

**Input**: Detectado al analizar el partido testigo de `011-encaje-optimo-formacion`: el panel muestra "sin puntaje" para jugadores que el motor sí puntuó.

## Contexto

En el panel de equipos generados, cada jugador muestra su puntaje en la posición asignada, y el encabezado del equipo muestra el total. Con las Estrategias 2 y 3, un jugador sin nota cargada en esa posición se muestra como "sin puntaje", y hay dos contadores ("Sin puntaje — Blanco: N", "Sin puntaje — Negro: N").

Para los jugadores individuales eso es coherente: el motor también los cuenta como 0 en una posición que no tienen cargada. **Para las duplas de rotación no.** El motor no evalúa a los dos integrantes por separado: los convierte en una unidad con un único valor combinado, el mismo en las cuatro posiciones. El panel, en cambio, muestra a cada integrante como jugador real y busca su nota en la posición asignada.

Consecuencia concreta, verificada en un partido real:

- Claudio y Juan aparecieron los dos como **"sin puntaje"** y el contador dijo "Sin puntaje — Blanco: 2", mientras el motor les había computado **5.8** al armar.
- Walther y Lautaro mostraron **5** y **7** (sus notas de Volante), mientras el motor sumó **6.3** por la unidad.
- El total del Blanco decía 51.8, pero los números visibles sumaban 46. **Los números que se ven no explican el total que se muestra.**

Esto choca de frente con el Principio III de la constitución: el motor tiene que poder explicarse, y hoy el panel muestra una cuenta que no es la que se hizo.

## Clarifications

### Session 2026-08-19

- Q: ¿Qué número corresponde mostrar en la fila de una dupla? → A: Los dos, en lugares distintos. La nota de cada integrante en la posición asignada va **al lado de su nombre**, como dato informativo. El valor de la unidad —el que el motor usó y el que suma al total— va **en la columna de puntaje**, alineado con el de los jugadores individuales, una sola vez para el par. Así se ve de dónde sale el número sin que la columna deje de sumar.
- Q: ¿Y los contadores de "sin puntaje"? → A: Cuentan unidades de armado, no jugadores. Una dupla cuenta como una, y solo si la unidad no tiene puntaje (o sea, si ninguno de los dos integrantes tiene nada cargado).
- Q: ¿Cambia algo para los jugadores individuales? → A: No. Para ellos el panel ya muestra lo que el motor usó.
- Q: ¿Hay que cambiar el motor? → A: No. Esta feature no toca el armado: solo lo que se muestra. Los equipos generados no cambian.
- Q: ¿Y en la Estrategia 1, que no mira posiciones? → A: Ahí el panel muestra el promedio general del jugador, y para una dupla debe mostrar el valor combinado de la unidad, por el mismo motivo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Que los números del panel expliquen el total (Priority: P1)

Un "admin" mira el panel de equipos generados y puede sumar mentalmente los puntajes que ve para llegar al total que muestra el encabezado del equipo. Si hay una dupla, ve un solo número para el par: el que el motor usó.

**Why this priority**: Es la feature. Un panel cuyos números no suman al total que él mismo muestra es un panel que no se puede auditar, y la explicabilidad del motor es un principio del proyecto.

**Independent Test**: Generar equipos en un partido con al menos una dupla y verificar que la suma de los puntajes visibles de cada equipo coincide con el total mostrado.

**Acceptance Scenarios**:

1. **Given** un partido con una dupla entre los titulares, **When** el "admin" mira el panel, **Then** ve la nota de cada integrante al lado de su nombre y un único valor en la columna de puntaje: el de la unidad, que es el que el motor usó.
2. **Given** cualquier partido generado, **When** el "admin" suma los puntajes visibles de un equipo, **Then** el resultado coincide con el total que muestra el encabezado de ese equipo.
3. **Given** una dupla en la que los dos integrantes tienen puntaje cargado, **When** el "admin" mira el panel, **Then** ninguno de los dos aparece como "sin puntaje".
4. **Given** una dupla en la que ninguno de los dos tiene puntaje cargado, **When** el "admin" mira el panel, **Then** la columna de puntaje muestra "sin puntaje" una sola vez para el par.
5. **Given** un integrante de una dupla sin nota cargada en la posición asignada, **When** el "admin" mira el panel, **Then** al lado de su nombre ve que no tiene nota, pero la columna de puntaje sigue mostrando el valor de la unidad (que puede tener puntaje igual).
6. **Given** un jugador individual sin nota en su posición asignada, **When** el "admin" mira el panel, **Then** sigue viéndose como "sin puntaje", igual que hoy.

---

### User Story 2 - Que los contadores de "sin puntaje" cuenten lo que el motor repartió (Priority: P2)

El "admin" lee "Sin puntaje — Blanco: N" y ese N coincide con la cantidad de unidades que el motor repartió sin puntaje, que es lo que la regla "Repartir a los jugadores sin puntaje" realmente equilibró.

**Why this priority**: Es la misma incoherencia vista desde el contador. Depende de la decisión de la Historia 1 y no tiene sentido resolverla por separado, pero se puede verificar aparte.

**Independent Test**: Generar equipos en un partido con una dupla con puntaje y comprobar que no la cuenta como dos jugadores sin puntaje.

**Acceptance Scenarios**:

1. **Given** un partido con una dupla con puntaje cargado, **When** el "admin" lee los contadores, **Then** esa dupla no aporta nada a ninguno de los dos.
2. **Given** un partido con una dupla sin ningún puntaje cargado en ninguno de sus integrantes, **When** el "admin" lee los contadores, **Then** aporta 1 al contador de su equipo.
3. **Given** el texto del resumen que dice "Se distribuyeron N titulares sin puntaje", **When** hay duplas involucradas, **Then** el N coincide con lo que el motor efectivamente repartió como unidades sin puntaje.

---

### Edge Cases

- **Dupla con solo un integrante puntuado**: la unidad tiene puntaje (el del integrante que lo tiene, por `008-duplas-rotacion` FR-008), así que no cuenta como "sin puntaje" y muestra el valor de la unidad.
- **Estrategia 1**: el panel muestra promedios generales; la dupla muestra el valor combinado.
- **Equipos editados a mano** después de generar: el panel sigue mostrando el valor de la unidad para la dupla; el total puede no coincidir si se movieron jugadores, igual que hoy.
- **Partido finalizado**: el panel de resultado no muestra puntajes, no cambia nada.
- **Jugador sin ningún puntaje cargado en ninguna posición**: sigue mostrándose como "sin puntaje", igual que hoy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel de equipos generados MUST mostrar, en la columna de puntaje, el valor que el motor usó para cada unidad de armado: la nota del jugador para una unidad individual, y el valor de la unidad —una sola vez para el par— en el caso de una dupla.
- **FR-001a**: En la fila de una dupla, el panel MUST mostrar además la nota de cada integrante en la posición asignada, al lado de su nombre, como dato informativo y distinguible del puntaje que suma.
- **FR-002**: La suma de los puntajes visibles de cada equipo MUST coincidir con el total de puntaje que el panel muestra para ese equipo.
- **FR-003**: Los contadores de "sin puntaje" MUST contar unidades de armado y no jugadores: una dupla cuenta como una, y solo si la unidad no tiene puntaje.
- **FR-004**: El texto del resumen que informa cuántos sin puntaje se distribuyeron MUST reflejar la misma cuenta que usó el motor, y MUST expresarse en titulares y no en jugadores, porque una dupla ocupa una sola vacante de titular entre sus dos integrantes.
- **FR-005**: El sistema MUST NOT modificar el armado de equipos: esta feature solo cambia lo que se muestra.
- **FR-006**: El comportamiento del panel para jugadores individuales MUST quedar igual que hoy.
- **FR-007**: La presentación de la fila de una dupla MUST seguir siendo utilizable en mobile, sin anchos fijos (Principio V de la constitución).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En cualquier partido generado, sumar a mano los puntajes visibles de un equipo da exactamente el total que muestra el panel.
- **SC-002**: Ningún integrante de una dupla con puntaje cargado aparece como "sin puntaje".
- **SC-003**: Los equipos generados para un mismo partido y configuración son idénticos antes y después de esta feature.
- **SC-004**: Un "admin" puede explicar el total de un equipo señalando los números que ve, sin conocer el concepto de "valor combinado de la unidad".

## Assumptions

- El valor de la unidad-dupla que usa el motor está disponible para el panel en el momento de renderizar (o se puede recalcular con los mismos datos que ya tiene).
- La fila de una dupla ya se presenta agrupada (los dos nombres juntos), así que hay un único lugar natural donde poner el puntaje del par.
- Esta feature no opina sobre **cuánto** vale una dupla, solo sobre mostrar el valor que se usó. Cambiar la fórmula es otra feature (`014-puntaje-dupla-por-posicion`).

## Fuera de Alcance

- Cambiar la fórmula del valor de una dupla (`014-puntaje-dupla-por-posicion`).
- Cambiar cuánto vale un jugador individual en una posición que no tiene cargada.
- Rediseñar el panel de equipos más allá de lo necesario para mostrar un puntaje por unidad.
