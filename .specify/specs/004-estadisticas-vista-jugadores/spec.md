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

### User Story 2 - Ver cuántos partidos ganó, perdió y empató cada jugador (Priority: P2)

El administrador mira el listado de jugadores y, para cada uno, ve además cuántos de sus partidos jugados terminó ganando, perdiendo o empatando, sin tener que entrar a ningún otro lugar.

**Why this priority**: Complementa directamente el objetivo de esta funcionalidad: partidos jugados, goles y asistencias ya muestran el aporte individual, pero no dicen si el jugador estuvo del lado ganador. Es la continuación natural del mismo pedido.

**Independent Test**: Se puede probar finalizando partidos con distintos resultados (con un equipo ganador, y también empatados) y verificando que, en el listado de jugadores, cada jugador convocado muestre la cantidad correcta de partidos ganados, perdidos y empatados.

**Acceptance Scenarios**:

1. **Given** un jugador que integró el equipo con más goles en un partido finalizado, **When** el administrador abre el listado de jugadores, **Then** ese partido suma 1 a sus partidos ganados.
2. **Given** un jugador que integró el equipo con menos goles en un partido finalizado, **When** el administrador abre el listado de jugadores, **Then** ese partido suma 1 a sus partidos perdidos.
3. **Given** un jugador que integró alguno de los dos equipos en un partido finalizado con el mismo puntaje para ambos, **When** el administrador abre el listado de jugadores, **Then** ese partido suma 1 a sus partidos empatados.
4. **Given** un jugador que nunca fue convocado a un partido finalizado, **When** el administrador abre el listado de jugadores, **Then** ve el campo vacío en ganados, perdidos y empatados para ese jugador (no un 0).

---

### User Story 3 - Las estadísticas se actualizan solas al finalizar un partido (Priority: P3)

Cuando el administrador finaliza un partido con su resultado cargado, los partidos jugados, goles y asistencias de cada jugador convocado se actualizan automáticamente, sin ninguna acción manual adicional.

**Why this priority**: Si la actualización no fuera automática, el listado de jugadores mostraría datos desactualizados o requeriría un paso manual propenso a errores, lo que le quita valor a la funcionalidad principal.

**Independent Test**: Se puede probar finalizando un partido y verificando, inmediatamente después y sin recargar datos manualmente, que el listado de jugadores refleja el nuevo total para cada jugador convocado a ese partido.

**Acceptance Scenarios**:

1. **Given** un partido con inscripción cerrada y resultado cargado, **When** el administrador lo finaliza, **Then** cada jugador que integró alguno de los dos equipos de ese partido suma 1 a sus partidos jugados, más los goles y asistencias que tuvo en ese resultado, más 1 a ganados, perdidos o empatados según corresponda al resultado de su equipo.
2. **Given** un suplente convocado a un partido finalizado que nunca reemplazó a un titular ni integró un equipo, **When** el administrador lo finaliza, **Then** ese suplente no suma partidos jugados, ganados, perdidos ni empatados por ese partido.

---

### User Story 4 - El historial se conserva para jugadores inactivos o eliminados del plantel (Priority: P4)

Un jugador que fue desactivado o eliminado del plantel sigue mostrando, mientras aparezca en el listado, los partidos jugados, ganados, perdidos, empatados, goles y asistencias que acumuló mientras estuvo activo.

**Why this priority**: Ya es una regla existente que los partidos pasados conservan sus datos aunque el jugador se desactive o elimine del plantel; esta historia solo confirma que las nuevas estadísticas respetan esa misma regla en vez de reiniciarse o desaparecer.

**Independent Test**: Se puede probar desactivando un jugador con partidos jugados previos y verificando que sus estadísticas acumuladas siguen mostrándose sin cambios en el listado.

**Acceptance Scenarios**:

1. **Given** un jugador activo con partidos jugados, ganados, perdidos, empatados, goles y asistencias acumulados, **When** el administrador lo desactiva, **Then** el listado sigue mostrando los mismos valores acumulados para ese jugador.

---

### User Story 5 - Corregir el resultado de un partido ya finalizado (Priority: P5)

El administrador se da cuenta de que cargó mal un gol, una asistencia o el resultado de un partido ya finalizado, y puede editarlo para que las estadísticas acumuladas de los jugadores queden correctas, sin tener que recrear el partido.

**Why this priority**: Es una corrección de errores, no el flujo principal; el resto de las historias ya entregan valor sin esto. Pero es necesaria porque, una vez finalizado un partido, hoy no hay forma de arreglar un dato mal cargado.

**Independent Test**: Se puede probar finalizando un partido, editando su resultado (goles/asistencias de uno o más jugadores) y verificando que el listado de jugadores refleja los nuevos totales de partidos jugados, ganados, perdidos, empatados, goles y asistencias, coherentes con el resultado corregido.

**Acceptance Scenarios**:

1. **Given** un partido finalizado, **When** el administrador edita el resultado y guarda los cambios, **Then** el sistema recalcula partidos jugados, ganados, perdidos, empatados, goles y asistencias de todos los jugadores convocados a ese partido en base al nuevo resultado.
2. **Given** un partido finalizado cuyo resultado corregido cambia qué equipo ganó (por ejemplo, de empate a victoria de un equipo), **When** el administrador guarda la corrección, **Then** el listado de jugadores refleja el nuevo ganado/perdido/empatado para cada jugador de ese partido, no el anterior.
3. **Given** la app sin sesión de administrador iniciada, **When** alguien intenta editar el resultado de un partido finalizado, **Then** el sistema lo rechaza de la misma forma en que hoy rechaza cualquier otra escritura sin sesión válida (ver `.specify/specs/005-login-basico/spec.md`).

---

### Edge Cases

- ¿Qué pasa con un jugador nuevo que todavía no fue convocado a ningún partido? Debe mostrar el campo vacío. El 0 se reserva para jugadores que jugaron pero no hicieron goles o asistencias.
- ¿Qué pasa si un partido se finaliza sin ningún gol ni asistencia registrada? Los jugadores que integraron un equipo suman 1 partido jugado igual, con 0 goles y 0 asistencias de ese partido.
- ¿Qué pasa con un partido cuya inscripción se reabre después de haber sido convocado un jugador? Mientras el partido no esté finalizado, ninguno de sus convocados suma ese partido a las estadísticas.
- ¿Qué pasa con un suplente convocado a un partido finalizado que nunca reemplazó a un titular? No suma ese partido a sus partidos jugados, ganados, perdidos, empatados, goles ni asistencias, porque nunca integró ninguno de los dos equipos.
- ¿Qué pasa si el partido finalizado terminó con el mismo puntaje para ambos equipos? Suma 1 a "empatados" para todos los jugadores que integraron alguno de los dos equipos, y no afecta ni a ganados ni a perdidos.
- ¿Qué pasa si se edita el resultado de un partido finalizado y esa edición hace que cambie el resultado (ganador/perdedor/empate) de ese partido? Las seis estadísticas de todos los jugadores convocados a ese partido se recalculan desde cero en base al historial completo de partidos finalizados, no solo se ajusta el partido editado de forma aislada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, para cada jugador del listado de jugadores, la cantidad total de partidos jugados, goles y asistencias acumulados.
- **FR-002**: El sistema MUST contar un partido como "jugado" para un jugador únicamente cuando ese jugador integró alguno de los dos equipos de un partido que ya fue finalizado con su resultado cargado. Un suplente convocado que nunca llegó a integrar un equipo (por no haber reemplazado a ningún titular) no suma ese partido a su total.
- **FR-003**: El sistema MUST actualizar automáticamente los partidos jugados, goles y asistencias de cada jugador convocado en el momento en que se finaliza un partido, sin requerir ninguna acción manual adicional.
- **FR-004**: El sistema MUST mostrar el campo vacío en las tres estadísticas cuando el jugador nunca fue convocado a un partido finalizado (0 partidos jugados). El 0 se reserva para jugadores con al menos 1 partido jugado que no hicieron goles o asistencias.
- **FR-005**: El sistema MUST conservar y seguir mostrando las estadísticas acumuladas de un jugador aunque este haya sido desactivado o eliminado del plantel, en línea con la conservación ya existente de goles y asistencias por partido.
- **FR-006**: El sistema MUST mostrar estas tres estadísticas directamente en el listado de jugadores, sin que el administrador necesite abrir una pantalla adicional para verlas.
- **FR-007**: El sistema MUST representar goles con el ícono ⚽ y asistencias con el ícono 👟 en lugar de las abreviaturas de letra ("G" y "A"), en todo lugar de la aplicación donde se muestren estas estadísticas (listado de jugadores, carga de resultado de partido y resultado ya finalizado).
- **FR-008**: El sistema MUST mostrar, para cada jugador del listado de jugadores, la cantidad total de partidos ganados, perdidos y empatados acumulados, junto al resto de las estadísticas.
- **FR-009**: El sistema MUST calcular ganado/perdido/empatado, para cada jugador que integró alguno de los dos equipos de un partido finalizado, comparando los goles del equipo del jugador contra los goles del equipo rival en ese partido: más goles suma 1 a ganados, menos goles suma 1 a perdidos, igual cantidad de goles suma 1 a empatados. Un suplente que nunca integró un equipo no suma ninguno de los tres.
- **FR-010**: El sistema MUST actualizar automáticamente los partidos ganados, perdidos y empatados de cada jugador convocado en el momento en que se finaliza un partido, sin requerir ninguna acción manual adicional, siguiendo la misma regla de actualización que partidos jugados, goles y asistencias.
- **FR-011**: El sistema MUST mostrar el campo vacío en ganados, perdidos y empatados cuando el jugador nunca fue convocado a un partido finalizado. El 0 se reserva para jugadores con al menos 1 partido jugado.
- **FR-012**: El sistema MUST permitir editar el resultado (goles y asistencias por jugador) de un partido ya finalizado, restringido a quien haya iniciado sesión como administrador (ver `.specify/specs/005-login-basico/spec.md`); nadie sin sesión de administrador puede modificarlo.
- **FR-013**: El sistema MUST recalcular, al guardar la edición del resultado de un partido finalizado, las seis estadísticas (partidos jugados, ganados, perdidos, empatados, goles, asistencias) de todos los jugadores a partir del historial completo de partidos finalizados, para que el resultado corregido quede reflejado de forma consistente en los totales acumulados.

### Key Entities

- **Jugador**: además de sus datos existentes (nombre, posición, puntajes, estado), acumula ahora también la cantidad total de partidos jugados, ganados, perdidos y empatados, sumada a los totales de goles y asistencias que ya se acumulan por jugador.
- **Partido**: aporta, al finalizarse, el resultado por jugador (goles y asistencias) que ya usa para acumular totales, y ahora también aporta 1 partido jugado por cada jugador que integró alguno de los dos equipos (no por cada convocado — los suplentes que no llegaron a integrar un equipo quedan afuera), más 1 a ganado, perdido o empatado según cómo salió su equipo frente al rival en ese partido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede ver los partidos jugados, ganados, perdidos, empatados, goles y asistencias de cualquier jugador del plantel con una sola mirada al listado, sin necesitar ningún clic ni pantalla adicional.
- **SC-002**: Los seis valores quedan actualizados y visibles en el listado de jugadores inmediatamente después de finalizar un partido, sin ninguna acción manual de recálculo.
- **SC-003**: El 100% de los jugadores del plantel con al menos 1 partido jugado muestran un valor numérico (nunca un espacio vacío) en cada una de las seis estadísticas; los que nunca jugaron muestran el campo vacío.
- **SC-004**: Para cualquier jugador, la suma de sus partidos ganados, perdidos y empatados coincide siempre con su total de partidos jugados.

## Assumptions

- Un partido suma a las estadísticas de un jugador recién cuando ese partido queda en estado "Finalizado" con resultado cargado, y únicamente si ese jugador integró alguno de los dos equipos; los partidos con inscripción abierta o en curso todavía no cuentan, ni los suplentes que nunca llegaron a integrar un equipo.
- Estas estadísticas se muestran en el listado general de jugadores (pestaña "Jugadores"), reutilizando la vista ya existente en vez de crear una pantalla nueva de detalle por jugador.
- Los jugadores inactivos o eliminados del plantel conservan y siguen mostrando sus estadísticas acumuladas, siguiendo la misma regla ya vigente para goles y asistencias por partido.
- No se requiere en esta funcionalidad un desglose partido por partido (fecha, rival, etc.); eso corresponde a un futuro Historial de partidos, ya mencionado como pendiente en el sistema.
- El resultado ganado/perdido/empatado de un jugador en un partido se determina comparando el puntaje final de su equipo (blanco o negro) contra el del equipo rival en ese mismo partido; no depende de goles ni asistencias individuales del jugador.
- "Restringido a administrador" (FR-012) se apoya en el único mecanismo de acceso que existe hoy (`.specify/specs/005-login-basico/`): una sola credencial de administrador para toda la app. No se crean roles ni usuarios no-administradores en esta funcionalidad — eso es trabajo aparte, ya registrado en Roadmap.md ("Cuentas y acceso"). Mientras exista un único rol, cualquier sesión iniciada ya satisface el requisito de "solo admin".
- Editar el resultado de un partido finalizado no permite cambiar quiénes integraron cada equipo (eso requeriría reabrir la inscripción); solo permite corregir los goles y asistencias de los jugadores que ya estaban registrados en ese resultado.
