# Feature Specification: Gestión de jugadores

**Feature Branch**: `002-gestion-jugadores`

**Created**: 2026-08-11

**Status**: Implemented (migrado desde `Spec.md` monolítico v1). FR-014 (goles/asistencias acumulados por jugador) se implementó — ver [tasks.md](tasks.md).

**Input**: Migración del contenido ya vigente de `Spec.md` (secciones 5-Jugador/Posiciones/Puntajes/Puntaje promedio, 6) a la estructura nativa de spec-kit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alta y edición de jugador (Priority: P1)

El administrador crea y edita jugadores del plantel, cargando nombre, apellido (opcional), posición principal, posiciones secundarias y puntajes por posición, con validaciones claras ante datos inválidos.

**Why this priority**: Sin plantel de jugadores no hay convocatoria ni generación de equipos posible; es el dato base de toda la aplicación.

**Independent Test**: Se puede probar creando un jugador con datos válidos, y luego intentando crear/editar jugadores con cada condición inválida (nombre vacío, sin posición principal, puntaje fuera de rango, nombre duplicado) verificando el mensaje correspondiente.

**Acceptance Scenarios**:

1. **Given** el formulario de alta de jugador vacío, **When** el administrador lo guarda sin completar el nombre, **Then** el sistema muestra "El nombre es obligatorio." y no crea el jugador.
2. **Given** un jugador sin posición principal seleccionada, **When** se intenta guardar, **Then** el sistema muestra "Elegí una posición principal." y no lo guarda.
3. **Given** un puntaje cargado fuera del rango 1-10 para una posición, **When** se intenta guardar, **Then** el sistema muestra "El puntaje de {posición} debe estar entre 1 y 10." y no lo guarda.
4. **Given** un jugador existente con nombre y apellido "Juan Pérez", **When** se intenta crear otro jugador con el mismo nombre y apellido, **Then** el sistema muestra "Ya existe un jugador con ese nombre y apellido." y no lo crea.
5. **Given** un jugador nuevo sin ningún puntaje cargado, **When** se guarda, **Then** el sistema lo permite y el jugador queda sin puntaje promedio calculable.

---

### User Story 2 - Búsqueda y filtro de jugadores (Priority: P1)

El administrador busca jugadores por texto (nombre y/o apellido) y filtra por posición principal y por estado, de forma combinable.

**Why this priority**: Es el mecanismo diario para encontrar jugadores al armar convocatorias, crítico apenas el plantel crece más allá de unos pocos nombres.

**Independent Test**: Se puede probar cargando varios jugadores con distintas posiciones y estados, y verificando que cada combinación de búsqueda + filtros devuelva exactamente los jugadores esperados.

**Acceptance Scenarios**:

1. **Given** un plantel con jugadores de distintas posiciones y estados, **When** el administrador busca "Juan" y filtra por posición Defensor y estado Activos, **Then** el listado muestra únicamente los jugadores que cumplen las tres condiciones a la vez.
2. **Given** los tres filtros en su valor "Todos"/vacío, **When** no se aplica ningún criterio, **Then** el listado muestra todos los jugadores.

---

### User Story 3 - Activar y desactivar jugador (Priority: P2)

El administrador desactiva jugadores que dejan de participar sin perder su historial, y puede reactivarlos más adelante.

**Why this priority**: Permite mantener el plantel prolijo (jugadores inactivos no se convocan) sin perder trazabilidad histórica, algo más frecuente que la eliminación permanente.

**Independent Test**: Se puede probar desactivando un jugador con historial de partidos, verificando que no aparece disponible para convocar pero su historial permanece intacto, y luego reactivándolo.

**Acceptance Scenarios**:

1. **Given** un jugador activo, **When** el administrador lo desactiva, **Then** deja de estar disponible para convocarse a nuevos partidos, conservando todo su historial.
2. **Given** un jugador inactivo, **When** el administrador lo reactiva, **Then** vuelve a estar disponible para convocarse.

---

### User Story 4 - Eliminación permanente de jugador (Priority: P2)

El administrador elimina un jugador del plantel de forma física e irreversible, aceptando que las referencias a ese jugador en partidos ya existentes no se limpian.

**Why this priority**: Distinta de desactivar: sirve para limpiar definitivamente el plantel de jugadores que ya no van a participar, con consecuencias más fuertes por lo que va después en prioridad de la simple desactivación.

**Independent Test**: Se puede probar eliminando un jugador con y sin historial de partidos, y verificando en ambos casos que desaparece del listado de plantel mientras las referencias históricas quedan sin limpiar.

**Acceptance Scenarios**:

1. **Given** un jugador cualquiera, **When** el administrador solicita eliminarlo, **Then** el sistema pide confirmación explícita indicando que la acción no se puede deshacer.
2. **Given** una eliminación confirmada, **When** se ejecuta, **Then** el jugador se borra únicamente del plantel; sus referencias en partidos ya existentes (convocatoria, equipos generados, goles y asistencias) se conservan sin limpiar ni corregir.
3. **Given** un jugador eliminado que integraba la convocatoria de un partido con inscripción abierta, **When** se visualiza ese partido, **Then** puede quedar una referencia que ya no se puede visualizar ni quitar desde la interfaz.

---

### User Story 5 - Administrar posiciones y puntajes (Priority: P3)

El administrador asigna posición principal, posiciones secundarias y un puntaje independiente por cada posición asignada a un jugador, dentro del rango 1-10.

**Why this priority**: Complementa el alta/edición (US1) con el detalle fino de puntuación que usa el motor de generación; no bloquea el flujo básico de tener un jugador utilizable.

**Independent Test**: Se puede probar asignando y quitando posiciones secundarias a un jugador con puntajes cargados, y verificando que los puntajes se ajusten según las reglas.

**Acceptance Scenarios**:

1. **Given** un jugador con una posición secundaria asignada, **When** el administrador quita esa posición secundaria, **Then** el puntaje correspondiente a esa posición se elimina.
2. **Given** un jugador con posición principal "Volante", **When** el administrador cambia su posición principal a "Defensor", **Then** el puntaje que tenía cargado para "Volante" se elimina si "Volante" no queda como posición secundaria.
3. **Given** un jugador con puntaje cargado en una posición asignada, **When** el administrador elimina manualmente ese puntaje, **Then** el jugador queda sin puntaje para esa posición sin afectar las demás.
4. **Given** un jugador, **When** se intenta cargar un puntaje para una posición que no tiene asignada (ni principal ni secundaria), **Then** el sistema no lo permite.

### Edge Cases

- Dos jugadores con el mismo nombre pero apellido distinto (o ambos sin apellido) no deben considerarse duplicados salvo que nombre y apellido combinados coincidan exactamente.
- Un jugador puede no tener ningún puntaje cargado (jugador completamente nuevo): el puntaje promedio queda indefinido, no en cero.
- Buscar texto vacío junto con filtros de posición/estado debe devolver el listado filtrado solo por esos filtros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear y editar jugadores con nombre (obligatorio), apellido (opcional), posición principal (obligatoria), posiciones secundarias (opcionales) y puntaje independiente por cada posición asignada.
- **FR-002**: El sistema MUST impedir guardar un jugador sin nombre, mostrando "El nombre es obligatorio."
- **FR-003**: El sistema MUST impedir guardar un jugador sin posición principal, mostrando "Elegí una posición principal."
- **FR-004**: El sistema MUST validar que cada puntaje cargado esté entre 1 y 10, mostrando "El puntaje de {posición} debe estar entre 1 y 10." en caso contrario.
- **FR-005**: El sistema MUST impedir crear o editar un jugador con el mismo nombre y apellido que otro ya existente, mostrando "Ya existe un jugador con ese nombre y apellido."
- **FR-006**: El sistema MUST restringir la carga de puntaje a únicamente las posiciones asignadas al jugador (principal o secundarias).
- **FR-007**: El sistema MUST eliminar el puntaje de una posición cuando esa posición deja de estar asignada al jugador (se quita como secundaria, o se reemplaza como principal).
- **FR-008**: El sistema MUST permitir eliminar manualmente el puntaje de una posición asignada en cualquier momento, sin afectar los puntajes de otras posiciones.
- **FR-009**: El sistema MUST calcular automáticamente el puntaje promedio del jugador usando únicamente los puntajes existentes, sin permitir su edición manual.
- **FR-010**: El sistema MUST ofrecer, como posiciones disponibles, Arquero, Defensor, Volante y Delantero, cada una con un color fijo y consistente en toda la interfaz.
- **FR-011**: El sistema MUST permitir buscar jugadores por texto libre sobre nombre y/o apellido, y filtrar por posición principal y por estado, combinando los tres criterios simultáneamente.
- **FR-012**: El sistema MUST permitir activar y desactivar un jugador; un jugador inactivo no MUST estar disponible para convocarse a nuevos partidos, pero MUST conservar todo su historial.
- **FR-013**: El sistema MUST permitir eliminar un jugador de forma permanente del plantel, solicitando confirmación explícita, sin limpiar ni corregir sus referencias en partidos ya existentes.
- **FR-014**: El sistema MUST acumular en el jugador la cantidad total de goles y asistencias sumados a través de los partidos en los que participó (alimentada por la carga de resultado de la feature "Gestión de partidos"), sin mostrar este dato en la pantalla de gestión de jugadores — queda reservado para una futura sección de Estadísticas.

### Key Entities

- **Jugador**: nombre, apellido (opcional), estado (Activo/Inactivo), posición principal, posiciones secundarias, puntajes por posición, puntaje promedio (calculado), goles y asistencias acumulados a través de los partidos (no visibles en esta feature, reservados para Estadísticas).
- **Posición**: Arquero, Defensor, Volante o Delantero, con un color fijo asociado para uso consistente en toda la interfaz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede dar de alta un jugador nuevo, con puntajes, en menos de 1 minuto.
- **SC-002**: El 100% de los intentos de guardar un jugador con datos inválidos (nombre vacío, sin posición principal, puntaje fuera de rango, nombre duplicado) es rechazado con un mensaje claro y específico.
- **SC-003**: El administrador encuentra cualquier jugador del plantel mediante búsqueda/filtro en menos de 3 interacciones, independientemente del tamaño del plantel dentro del volumen esperado (~500 jugadores).
- **SC-004**: Ningún historial de partido pierde datos de resultado como consecuencia de desactivar o eliminar un jugador.

## Assumptions

- Existe un único grupo de jugadores compartido (ver `Roadmap.md` para la evolución hacia múltiples grupos).
- No existe autenticación en esta versión: cualquier persona con acceso a la aplicación actúa como administrador.
- El uso que el motor de generación hace de posiciones y puntajes está especificado en el spec de la feature "Motor de generación de equipos"; esta feature solo cubre cómo se cargan y validan esos datos, no cómo se consumen.
