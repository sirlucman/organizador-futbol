# Feature Specification: Gestión de partidos

**Feature Branch**: `001-organizacion-partidos`

**Created**: 2026-08-11

**Status**: Implemented (migrado desde `Spec.md` monolítico v1)

**Input**: Migración del contenido ya vigente de `Spec.md` (secciones 3, 5-Partido/Cancha/Cierre de inscripción/Resultado/Finalización, 7, 8) a la estructura nativa de spec-kit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear partido y convocar jugadores (Priority: P1)

El administrador crea un partido eligiendo fecha y cancha, y convoca jugadores mediante un buscador con autocompletado. Los primeros jugadores convocados, hasta completar el cupo de titulares que define la cancha, quedan como titulares; el resto pasa a suplentes en orden de inscripción.

**Why this priority**: Es el punto de entrada de todo el flujo de organización de un partido; sin esto no existe convocatoria ni generación de equipos posterior.

**Independent Test**: Se puede probar creando un partido, convocando jugadores por encima y por debajo del cupo de titulares de la cancha, y verificando que la división titulares/suplentes sea correcta.

**Acceptance Scenarios**:

1. **Given** un partido recién creado con cancha "Fútbol 8" (cupo de 16 titulares), **When** se convocan 20 jugadores en orden, **Then** los primeros 16 quedan como titulares y los 4 restantes como suplentes, respetando el orden de inscripción.
2. **Given** un partido con cancha "Fútbol 9" (cupo de 18 titulares), **When** se convocan solo 12 jugadores, **Then** los 12 quedan como titulares y el sistema permite seguir organizando el partido sin bloquear ninguna acción por no completar el cupo.
3. **Given** una convocatoria en curso, **When** el administrador escribe el nombre de un jugador que no existe, **Then** puede crearlo sin abandonar el flujo de convocatoria.
4. **Given** un jugador ya convocado a un partido, **When** se intenta convocarlo nuevamente al mismo partido, **Then** el sistema lo impide.

---

### User Story 2 - Reemplazo automático al bajarse un titular (Priority: P1)

Cuando un titular abandona el partido, el primer suplente ocupa automáticamente su lugar, el resto de los suplentes conserva su orden, y los equipos generados se marcan para regenerarse.

**Why this priority**: Es el comportamiento central que distingue la gestión de partidos de un simple listado: mantiene siempre una convocatoria válida sin intervención manual del administrador en el reordenamiento.

**Independent Test**: Se puede probar dando de baja a un titular de un partido con suplentes cargados y verificando que el primer suplente pase a titular y el resto conserve su orden relativo.

**Acceptance Scenarios**:

1. **Given** un partido con titulares y al menos un suplente, **When** un titular se baja, **Then** el primer suplente pasa a titular y el resto de los suplentes avanza una posición conservando su orden.
2. **Given** un partido sin suplentes disponibles, **When** un titular se baja, **Then** el cupo de titulares queda incompleto y el sistema no bloquea ninguna acción por esa causa.

---

### User Story 3 - Cerrar y reabrir inscripción (Priority: P2)

Una vez generados los equipos, el administrador puede cerrar la inscripción del partido para congelar la convocatoria y habilitar la carga de resultado. Puede reabrirla en cualquier momento mientras el partido no esté finalizado.

**Why this priority**: Habilita el flujo de carga de resultado (US4) y evita ediciones accidentales de la convocatoria una vez que el partido ya se jugó o está por jugarse con equipos definidos.

**Independent Test**: Se puede probar cerrando la inscripción de un partido con equipos generados, verificando que no se puedan agregar/quitar jugadores ni regenerar equipos, y luego reabriéndola.

**Acceptance Scenarios**:

1. **Given** un partido con equipos generados e inscripción abierta, **When** el administrador cierra la inscripción, **Then** dejan de estar disponibles agregar/quitar jugadores de la convocatoria y regenerar equipos.
2. **Given** un partido con inscripción cerrada y resultado cargado (no finalizado), **When** el administrador reabre la inscripción, **Then** el resultado cargado se descarta porque corresponde a una composición de equipos que puede dejar de ser válida.
3. **Given** un partido finalizado, **When** se intenta reabrir la inscripción, **Then** el sistema no lo permite.

---

### User Story 4 - Cargar resultado y finalizar partido (Priority: P2)

Con la inscripción cerrada, el administrador carga goles y asistencias por jugador de los equipos generados, y finaliza el partido cuando corresponde, dejando el resultado guardado de forma definitiva.

**Why this priority**: Es el cierre natural del ciclo de vida de un partido y la base de datos que habilitará estadísticas e historial en versiones futuras.

**Independent Test**: Se puede probar cerrando la inscripción de un partido, cargando goles/asistencias de distintos jugadores de ambos equipos, y finalizando el partido.

**Acceptance Scenarios**:

1. **Given** un partido con inscripción cerrada, **When** el administrador carga goles y asistencias de jugadores que integran los equipos generados, **Then** el resultado total de cada equipo se calcula automáticamente sumando los goles cargados de sus jugadores.
2. **Given** un equipo sin goles cargados, **When** se intenta cargar una asistencia para ese equipo, **Then** el sistema no lo permite.
3. **Given** un partido con inscripción cerrada y resultado parcial o sin cargar, **When** el administrador confirma la finalización, **Then** el partido pasa a estado Finalizado sin exigir que el resultado esté completo.
4. **Given** un partido Finalizado, **When** se intenta modificar el resultado o reabrir la inscripción, **Then** el sistema no lo permite, ya que la finalización no puede deshacerse en esta versión.

---

### User Story 5 - Eliminar partido (Priority: P3)

El administrador puede eliminar un partido completo de forma permanente, típicamente para reiniciar una convocatoria creada por error.

**Why this priority**: Es una acción de corrección poco frecuente, no parte del flujo principal de organización.

**Independent Test**: Se puede probar creando un partido, eliminándolo con confirmación explícita, y verificando que ya no aparece en ningún listado.

**Acceptance Scenarios**:

1. **Given** un partido existente, **When** el administrador solicita eliminarlo, **Then** el sistema pide una confirmación explícita antes de ejecutar la eliminación.
2. **Given** una eliminación confirmada, **When** se ejecuta, **Then** el partido se borra de forma física (no un cambio de estado) y la acción no puede deshacerse.

### Edge Cases

- La convocatoria no alcanza a completar el cupo de titulares de la cancha: el sistema permite seguir organizando el partido igual.
- Se elimina de forma permanente (ver spec de Gestión de jugadores) un jugador que integra la convocatoria de un partido con inscripción abierta: la referencia puede quedar sin poder visualizarse ni quitarse desde la interfaz.
- Se elimina un jugador que participó en partidos ya jugados: las referencias en el historial no se limpian ni se corrigen.
- Se agregan nuevas canchas (por ejemplo, Fútbol 5 u 11) sin modificar la lógica existente de cálculo de cupo de titulares.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear un partido con fecha y cancha asignada; la fecha es obligatoria.
- **FR-002**: El sistema MUST ofrecer, como valores de cancha, al menos "Fútbol 8" (8 jugadores por equipo) y "Fútbol 9" (9 jugadores por equipo), y MUST permitir agregar nuevas canchas sin modificar la lógica existente.
- **FR-003**: El sistema MUST calcular el cupo de titulares de un partido como el doble de la cantidad de jugadores por equipo de la cancha seleccionada (Fútbol 8 → 16, Fútbol 9 → 18).
- **FR-004**: El sistema MUST permitir convocar jugadores mediante un buscador con autocompletado (incluyendo activación por tecla TAB), y MUST permitir crear un jugador nuevo sin abandonar el flujo de convocatoria.
- **FR-005**: El sistema MUST asignar como titulares a los primeros jugadores convocados hasta completar el cupo de la cancha, y como suplentes (cantidad ilimitada) al resto, respetando el orden de inscripción.
- **FR-006**: El sistema MUST impedir convocar dos veces al mismo jugador para un mismo partido.
- **FR-007**: El sistema MUST permitir que la convocatoria no alcance el cupo de titulares sin bloquear ninguna otra acción sobre el partido.
- **FR-008**: Cuando un titular se da de baja, el sistema MUST promover automáticamente al primer suplente a titular, MUST conservar el orden relativo del resto de los suplentes, y MUST marcar los equipos generados para regenerarse.
- **FR-009**: El sistema MUST permitir cerrar la inscripción de un partido una vez generados los equipos, deshabilitando agregar/quitar jugadores de la convocatoria y regenerar equipos mientras esté cerrada.
- **FR-010**: El sistema MUST permitir reabrir la inscripción de un partido en cualquier momento mientras no esté Finalizado, y al hacerlo MUST descartar cualquier resultado cargado y no finalizado.
- **FR-011**: El sistema MUST habilitar la carga de resultado (goles y asistencias por jugador) únicamente mientras la inscripción esté cerrada, y únicamente para jugadores que integren alguno de los dos equipos generados.
- **FR-012**: El sistema MUST impedir cargar asistencias para un equipo que no tenga goles cargados.
- **FR-013**: El sistema MUST calcular el resultado total de cada equipo sumando automáticamente los goles cargados de sus jugadores, sin permitir su carga como dato independiente.
- **FR-014**: El sistema MUST permitir modificar libremente la carga de resultado mientras el partido no esté Finalizado.
- **FR-015**: El sistema MUST permitir finalizar un partido con inscripción cerrada sin exigir que el resultado esté completo, y MUST solicitar confirmación explícita antes de finalizar, dado que la acción no puede deshacerse en esta versión.
- **FR-016**: El sistema MUST permitir eliminar un partido de forma física y permanente, solicitando confirmación explícita antes de ejecutarlo.
- **FR-017**: El sistema MUST persistir el historial de partidos (incluyendo los ya finalizados) entre sesiones.

### Key Entities

- **Partido**: fecha, cancha asignada, estado (Inscripción abierta / Equipos generados / Finalizado), inscripción cerrada (sí/no), titulares, equipos generados, resultado (goles y asistencias por jugador).
- **Cancha**: define la cantidad de jugadores por equipo y, por lo tanto, el cupo de titulares del partido (Fútbol 8, Fútbol 9, extensible a futuras canchas).
- **Convocatoria**: relación entre un partido y los jugadores anotados, con un orden de inscripción del que derivan titulares y suplentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador puede crear un partido y dejar la convocatoria inicial cargada en menos tiempo del que le toma hoy organizarla por WhatsApp.
- **SC-002**: El 100% de las bajas de titulares con suplentes disponibles resuelven el reemplazo sin intervención manual del administrador.
- **SC-003**: Ningún partido queda bloqueado por convocatoria incompleta: el administrador siempre puede seguir operando el partido cualquiera sea la cantidad de convocados.
- **SC-004**: Una vez finalizado, el 100% de los partidos conserva su resultado sin posibilidad de alteración accidental.

## Assumptions

- Existe un único grupo de jugadores compartido entre todos los partidos (ver `Roadmap.md` para la evolución hacia múltiples grupos).
- No existe autenticación en esta versión: cualquier persona con acceso a la aplicación actúa como administrador (ver `Roadmap.md`, sección "Cuentas y acceso").
- La generación y regeneración de equipos en sí (algoritmo, estrategias, reglas) está especificada en el spec de la feature "Motor de generación de equipos"; esta feature solo cubre cuándo se dispara una regeneración, no cómo se calcula.
- El modelo de datos de Jugador (posiciones, puntajes, estado) está especificado en el spec de la feature "Gestión de jugadores".
