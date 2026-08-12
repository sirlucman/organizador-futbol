# Feature Specification: Estadísticas acumuladas en la vista de jugadores

**Feature Branch**: `004-estadisticas-vista-jugadores`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "Agregar partidos jugados, goles y asistencias a la vista de jugadores."

## Clarifications

### Session 2026-08-11

- Q: ¿Un suplente convocado a un partido finalizado, que nunca integró ninguno de los dos equipos, debe sumar 1 a sus "partidos jugados"? → A: No. Solo cuenta como "partido jugado" el jugador que integró alguno de los dos equipos (titular). Los suplentes son backup por si falta un titular antes de cerrar la inscripción, pero una vez cerrada nunca llegan a la cancha si no reemplazan a nadie — no deben sumar partido jugado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el historial acumulado de cada jugador (Priority: P1)

El administrador mira el listado de jugadores y, para cada uno, ve cuántos partidos jugó, cuántos goles hizo y cuántas asistencias dio en total, sin tener que entrar a ningún otro lugar.

**Why this priority**: Es el objetivo directo del pedido: hoy el plantel acumula goles y asistencias por jugador pero no los muestra en ningún lado, y los partidos jugados no se cuentan en absoluto. Sin esto, esa información es invisible para quien administra el grupo.

**Independent Test**: Se puede probar finalizando uno o más partidos con resultados cargados y verificando que, en el listado de jugadores, cada jugador convocado muestre la cantidad correcta de partidos jugados, goles y asistencias acumulados.

**Acceptance Scenarios**:

1. **Given** un jugador que participó en dos partidos finalizados con 1 gol y 0 asistencias en el primero y 0 goles y 2 asistencias en el segundo, **When** el administrador abre el listado de jugadores, **Then** ve que ese jugador tiene 2 partidos jugados, 1 gol y 2 asistencias.
2. **Given** un jugador que nunca fue convocado a un partido finalizado, **When** el administrador abre el listado de jugadores, **Then** ve el campo vacío en partidos jugados, goles y asistencias para ese jugador (no un 0).
3. **Given** un jugador convocado a un partido que todavía está en inscripción abierta o en curso (sin finalizar), **When** el administrador abre el listado de jugadores, **Then** ese partido todavía no suma a sus partidos jugados, goles ni asistencias.

---

### User Story 2 - Las estadísticas se actualizan solas al finalizar un partido (Priority: P2)

Cuando el administrador finaliza un partido con su resultado cargado, los partidos jugados, goles y asistencias de cada jugador convocado se actualizan automáticamente, sin ninguna acción manual adicional.

**Why this priority**: Si la actualización no fuera automática, el listado de jugadores mostraría datos desactualizados o requeriría un paso manual propenso a errores, lo que le quita valor a la funcionalidad principal.

**Independent Test**: Se puede probar finalizando un partido y verificando, inmediatamente después y sin recargar datos manualmente, que el listado de jugadores refleja el nuevo total para cada jugador convocado a ese partido.

**Acceptance Scenarios**:

1. **Given** un partido con inscripción cerrada y resultado cargado, **When** el administrador lo finaliza, **Then** cada jugador que integró alguno de los dos equipos de ese partido suma 1 a sus partidos jugados, más los goles y asistencias que tuvo en ese resultado.
2. **Given** un suplente convocado a un partido finalizado que nunca reemplazó a un titular ni integró un equipo, **When** el administrador lo finaliza, **Then** ese suplente no suma partidos jugados por ese partido.

---

### User Story 3 - El historial se conserva para jugadores inactivos o eliminados del plantel (Priority: P3)

Un jugador que fue desactivado o eliminado del plantel sigue mostrando, mientras aparezca en el listado, los partidos jugados, goles y asistencias que acumuló mientras estuvo activo.

**Why this priority**: Ya es una regla existente que los partidos pasados conservan sus datos aunque el jugador se desactive o elimine del plantel; esta historia solo confirma que las nuevas estadísticas respetan esa misma regla en vez de reiniciarse o desaparecer.

**Independent Test**: Se puede probar desactivando un jugador con partidos jugados previos y verificando que sus estadísticas acumuladas siguen mostrándose sin cambios en el listado.

**Acceptance Scenarios**:

1. **Given** un jugador activo con partidos jugados, goles y asistencias acumulados, **When** el administrador lo desactiva, **Then** el listado sigue mostrando los mismos valores acumulados para ese jugador.

---

### Edge Cases

- ¿Qué pasa con un jugador nuevo que todavía no fue convocado a ningún partido? Debe mostrar el campo vacío. El 0 se reserva para jugadores que jugaron pero no hicieron goles o asistencias.
- ¿Qué pasa si un partido se finaliza sin ningún gol ni asistencia registrada? Los jugadores que integraron un equipo suman 1 partido jugado igual, con 0 goles y 0 asistencias de ese partido.
- ¿Qué pasa con un partido cuya inscripción se reabre después de haber sido convocado un jugador? Mientras el partido no esté finalizado, ninguno de sus convocados suma ese partido a las estadísticas.
- ¿Qué pasa con un suplente convocado a un partido finalizado que nunca reemplazó a un titular? No suma ese partido a sus partidos jugados, goles ni asistencias, porque nunca integró ninguno de los dos equipos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, para cada jugador del listado de jugadores, la cantidad total de partidos jugados, goles y asistencias acumulados.
- **FR-002**: El sistema MUST contar un partido como "jugado" para un jugador únicamente cuando ese jugador integró alguno de los dos equipos de un partido que ya fue finalizado con su resultado cargado. Un suplente convocado que nunca llegó a integrar un equipo (por no haber reemplazado a ningún titular) no suma ese partido a su total.
- **FR-003**: El sistema MUST actualizar automáticamente los partidos jugados, goles y asistencias de cada jugador convocado en el momento en que se finaliza un partido, sin requerir ninguna acción manual adicional.
- **FR-004**: El sistema MUST mostrar el campo vacío en las tres estadísticas cuando el jugador nunca fue convocado a un partido finalizado (0 partidos jugados). El 0 se reserva para jugadores con al menos 1 partido jugado que no hicieron goles o asistencias.
- **FR-005**: El sistema MUST conservar y seguir mostrando las estadísticas acumuladas de un jugador aunque este haya sido desactivado o eliminado del plantel, en línea con la conservación ya existente de goles y asistencias por partido.
- **FR-006**: El sistema MUST mostrar estas tres estadísticas directamente en el listado de jugadores, sin que el administrador necesite abrir una pantalla adicional para verlas.

### Key Entities

- **Jugador**: además de sus datos existentes (nombre, posición, puntajes, estado), acumula ahora también la cantidad total de partidos jugados, sumada a los totales de goles y asistencias que ya se acumulan por jugador.
- **Partido**: aporta, al finalizarse, el resultado por jugador (goles y asistencias) que ya usa para acumular totales, y ahora también aporta 1 partido jugado por cada jugador que integró alguno de los dos equipos (no por cada convocado — los suplentes que no llegaron a integrar un equipo quedan afuera).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede ver los partidos jugados, goles y asistencias de cualquier jugador del plantel con una sola mirada al listado, sin necesitar ningún clic ni pantalla adicional.
- **SC-002**: Los tres valores quedan actualizados y visibles en el listado de jugadores inmediatamente después de finalizar un partido, sin ninguna acción manual de recálculo.
- **SC-003**: El 100% de los jugadores del plantel con al menos 1 partido jugado muestran un valor numérico (nunca un espacio vacío) en cada una de las tres estadísticas; los que nunca jugaron muestran el campo vacío.

## Assumptions

- Un partido suma a las estadísticas de un jugador recién cuando ese partido queda en estado "Finalizado" con resultado cargado, y únicamente si ese jugador integró alguno de los dos equipos; los partidos con inscripción abierta o en curso todavía no cuentan, ni los suplentes que nunca llegaron a integrar un equipo.
- Estas estadísticas se muestran en el listado general de jugadores (pestaña "Jugadores"), reutilizando la vista ya existente en vez de crear una pantalla nueva de detalle por jugador.
- Los jugadores inactivos o eliminados del plantel conservan y siguen mostrando sus estadísticas acumuladas, siguiendo la misma regla ya vigente para goles y asistencias por partido.
- No se requiere en esta funcionalidad un desglose partido por partido (fecha, rival, etc.); eso corresponde a un futuro Historial de partidos, ya mencionado como pendiente en el sistema.
