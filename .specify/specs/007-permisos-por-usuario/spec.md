# Feature Specification: Permisos por perfil de usuario

**Feature Branch**: `007-permisos-por-usuario`

**Created**: 2026-08-14

**Status**: Draft

**Input**: El requerimiento ronda en crear un sistema de perfiles de usuarios. Existirán 2 perfiles: "admin" no tendrá restricción alguna en la plataforma y "jugador". Restricciones del perfil "jugador": en la solapa Jugadores no puede crear/editar/eliminar/inhabilitar jugadores ni ver puntajes propios ni ajenos; en la solapa Partidos no puede ver puntajes propios ni de los equipos armados, ni la estrategia de armado, ni diferencias de puntajes/jugadores sin puntaje/jugadores bloqueados, ni la explicación de por qué quedaron así los equipos, no puede generar/regenerar equipos, no puede cerrar/reabrir la inscripción ni finalizar un partido, no puede modificar estadísticas de un partido, y no puede eliminar a otros jugadores de la convocatoria (solo puede darse de baja a sí mismo); en la solapa Configuración no puede ver la configuración del motor de reglas. La plataforma aún no cuenta con registro de usuarios; los perfiles se asignarán manualmente desde la base de datos en Firebase."

## Clarifications

### Session 2026-08-14

- Q: ¿Un usuario con perfil "jugador" puede ver las estadísticas acumuladas de los jugadores (partidos jugados, goles, asistencias, ganados/empatados/perdidos), aunque no pueda ver el puntaje? → A: Sí puede verlas: solo se oculta puntaje, no estadísticas (goles/asistencias/G-E-P).
- Q: ¿Un usuario con perfil "jugador" puede agregar a otros jugadores a la convocatoria de un partido, y no solo anotarse a sí mismo? → A: Sí puede anotar a otros jugadores a la convocatoria, igual que hoy.
- Q: ¿Un usuario con perfil "jugador" puede crear un partido nuevo o eliminarlo de forma permanente? → A: No puede crear ni eliminar partidos: son acciones exclusivas de "admin".
- Q: ¿Un usuario con perfil "jugador" puede ver en el listado de jugadores a aquellos que aún no tienen ningún puntaje cargado? → A: Sí, ve el listado completo de jugadores; solo se oculta el valor del puntaje (nunca al jugador en sí ni sus estadísticas acumuladas, aunque estén vacías o en cero).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un jugador ve una interfaz restringida (Priority: P1)

Un usuario con perfil "jugador" inicia sesión y navega la aplicación. No ve la solapa de Configuración, no puede crear/editar/eliminar/inhabilitar jugadores, y no ve puntajes (propios ni ajenos) en ningún lado de la aplicación, ni la estrategia, diferencias, jugadores bloqueados o explicación del armado de equipos.

**Why this priority**: Es la base de toda la feature — sin esto, cualquier usuario con perfil "jugador" seguiría teniendo el mismo acceso que un "admin", que es exactamente lo que se busca evitar.

**Independent Test**: Se puede probar completamente iniciando sesión con una cuenta de perfil "jugador" y verificando que la solapa Configuración no aparece, que no hay opciones de crear/editar/eliminar/inhabilitar jugadores, y que ningún puntaje, estrategia, diferencia, jugador bloqueado o explicación de armado es visible.

**Acceptance Scenarios**:

1. **Given** una sesión iniciada con perfil "jugador", **When** navega a la solapa Jugadores, **Then** ve el listado de jugadores sin puntajes y sin opciones para crear, editar, eliminar o inhabilitar jugadores.
2. **Given** una sesión iniciada con perfil "jugador", **When** navega a la solapa Partidos y ve los equipos armados, **Then** no ve puntajes, estrategia utilizada, diferencias de puntaje, cantidad de jugadores sin puntaje, jugadores bloqueados ni la explicación de "por qué quedaron así".
3. **Given** una sesión iniciada con perfil "jugador", **When** busca la solapa de Configuración, **Then** no la encuentra en ningún menú o navegación de la aplicación.
4. **Given** una sesión iniciada con perfil "admin", **When** navega toda la aplicación, **Then** accede a absolutamente todo sin ninguna restricción nueva introducida por esta feature.

---

### User Story 2 - Un jugador no puede realizar acciones administrativas sobre un partido (Priority: P2)

Un usuario con perfil "jugador" intenta generar o regenerar equipos, cerrar/reabrir la inscripción, finalizar un partido, crear o eliminar un partido, o modificar estadísticas de un partido, y el sistema se lo impide.

**Why this priority**: Protege la integridad del armado de equipos y de los resultados cargados; depende de que ya exista la interfaz restringida de la Historia 1, pero es una capa adicional de protección (a nivel de acción, no solo de vista).

**Independent Test**: Se puede probar completamente iniciando sesión como "jugador" e intentando cada una de esas acciones (desde la interfaz, y si es posible por acceso directo a los datos), verificando que ninguna se ejecuta.

**Acceptance Scenarios**:

1. **Given** una sesión iniciada con perfil "jugador", **When** intenta generar o regenerar los equipos de un partido, **Then** la acción no está disponible ni se ejecuta.
2. **Given** una sesión iniciada con perfil "jugador", **When** intenta cerrar o reabrir la inscripción de un partido, finalizarlo, crear un partido nuevo o eliminar uno existente, **Then** la acción no está disponible ni se ejecuta.
3. **Given** una sesión iniciada con perfil "jugador", **When** intenta modificar las estadísticas de un partido ya jugado, **Then** la acción no está disponible ni se ejecuta.
4. **Given** una sesión iniciada con perfil "jugador" que intenta cualquiera de estas acciones accediendo directamente a los datos (sin pasar por la interfaz), **When** la solicitud llega al sistema, **Then** es rechazada igual que si lo hubiera intentado desde la interfaz.

---

### User Story 3 - Un jugador solo puede darse de baja a sí mismo de una convocatoria (Priority: P3)

Un usuario con perfil "jugador" que está anotado en la convocatoria de un partido puede darse de baja él mismo, y puede seguir anotando a otros jugadores a esa convocatoria igual que hoy, pero no puede eliminar a ningún otro jugador ya anotado.

**Why this priority**: Es una funcionalidad de autoservicio valiosa para el jugador, pero de menor urgencia que las dos anteriores porque el riesgo de dejar a alguien anotarse/darse de baja de más está acotado a su propia participación.

**Independent Test**: Se puede probar completamente iniciando sesión como "jugador" anotado en un partido junto con otros jugadores, dándose de baja a sí mismo (debe funcionar) e intentando eliminar a otro jugador de la convocatoria (debe estar bloqueado).

**Acceptance Scenarios**:

1. **Given** un usuario "jugador" anotado en la convocatoria de un partido, **When** elige darse de baja, **Then** se elimina correctamente de esa convocatoria.
2. **Given** un usuario "jugador" viendo la convocatoria de un partido con otros jugadores anotados, **When** intenta eliminar a otro jugador de esa convocatoria, **Then** la acción no está disponible ni se ejecuta.

### Edge Cases

- ¿Qué pasa si una cuenta de perfil "jugador" no está vinculada a ningún registro de jugador (por un error de carga manual en Firebase)? No debe poder darse de baja de ninguna convocatoria (no tiene un jugador propio asociado), y el resto de las restricciones de su perfil se mantienen igual.
- ¿Qué pasa si se cambia el perfil de una cuenta (de "jugador" a "admin" o viceversa) mientras esa cuenta tiene una sesión activa? El cambio se refleja recién la próxima vez que esa cuenta inicie sesión, no en tiempo real sobre la sesión ya abierta.
- ¿Qué pasa si un usuario "jugador" intenta acceder u operar sobre datos restringidos (puntajes, estrategia, estadísticas, etc.) mediante un acceso directo a los datos, sin pasar por las pantallas de la aplicación? Debe ser rechazado igual que si lo intentara desde la interfaz, ya que la restricción se aplica también del lado de la persistencia de datos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST reconocer dos perfiles de usuario: "admin" y "jugador", como un atributo de cada cuenta.
- **FR-002**: Una cuenta con perfil "admin" MUST conservar acceso completo a toda la funcionalidad existente, sin ninguna restricción nueva introducida por esta feature.
- **FR-003**: Una cuenta con perfil "jugador" MUST NOT poder crear, editar, eliminar o inhabilitar jugadores en la solapa Jugadores.
- **FR-004**: Una cuenta con perfil "jugador" MUST NOT poder ver el puntaje de ningún jugador (propio ni ajeno) en ninguna parte de la plataforma.
- **FR-005**: Una cuenta con perfil "jugador" MUST NOT poder ver la estrategia utilizada para el armado de los equipos de un partido.
- **FR-006**: Una cuenta con perfil "jugador" MUST NOT poder ver las diferencias de puntaje entre equipos, la cantidad de jugadores sin puntaje por equipo, ni los jugadores marcados como bloqueados en el armado.
- **FR-007**: Una cuenta con perfil "jugador" MUST NOT poder ver la explicación de "por qué quedaron así" los equipos armados.
- **FR-008**: Una cuenta con perfil "jugador" MUST NOT poder generar ni regenerar los equipos de un partido.
- **FR-009**: Una cuenta con perfil "jugador" MUST NOT poder cerrar ni reabrir la inscripción de un partido, ni finalizarlo.
- **FR-009b**: Una cuenta con perfil "jugador" MUST NOT poder crear un partido nuevo ni eliminarlo de forma permanente; ambas acciones MUST quedar reservadas al perfil "admin".
- **FR-010**: Una cuenta con perfil "jugador" MUST NOT poder modificar las estadísticas de un partido.
- **FR-011**: Una cuenta con perfil "jugador" MUST NOT poder eliminar a otros jugadores de la convocatoria de un partido; MUST poder darse de baja únicamente al jugador vinculado a su propia cuenta. MUST poder seguir anotando a otros jugadores a la convocatoria, igual que hoy, dado que esta restricción aplica solo a la baja, no al alta.
- **FR-012**: Una cuenta con perfil "jugador" MUST NOT poder ver la solapa de Configuración del motor de reglas; dicha solapa no debe ser accesible ni visible para ese perfil.
- **FR-013**: Una cuenta con perfil "jugador" MUST poder ver el listado completo de jugadores, incluyendo a los que aún no tienen ningún puntaje cargado (sin mostrar el puntaje de ninguno), y MUST poder ver, para cualquier jugador, sus estadísticas acumuladas (partidos jugados, goles, asistencias, ganados/empatados/perdidos) incluso si esas estadísticas están vacías o en cero. También MUST poder ver el listado y estado de los partidos, y los equipos ya armados (sin puntajes, estrategia, diferencias, bloqueados ni explicación), dado que estas vistas no están explícitamente restringidas.
- **FR-014**: Todas las restricciones anteriores MUST aplicarse también del lado de la persistencia de datos, no únicamente ocultando opciones en la interfaz, de forma que una cuenta "jugador" no pueda sortearlas accediendo u operando directamente sobre los datos.
- **FR-015**: El sistema MUST permitir que una cuenta con perfil "jugador" esté vinculada a un registro de jugador específico, de modo que pueda identificarse cuál es "el jugador que corresponde al usuario" a los efectos de la baja de convocatorias (FR-011).
- **FR-016**: La asignación del perfil ("admin" o "jugador") de cada cuenta, y su vínculo con un jugador cuando corresponda, MUST realizarse manualmente en la base de datos de Firebase, dado que la plataforma aún no cuenta con una pantalla de registro o gestión de usuarios.

*Fuera de alcance en esta versión: pantalla de registro o administración de usuarios/perfiles, perfiles adicionales más allá de "admin" y "jugador", y cambios en tiempo real de una sesión activa cuando se modifica el perfil de esa cuenta desde Firebase.*

### Key Entities

- **Perfil de usuario**: valor "admin" o "jugador" asociado a una cuenta del sistema de login; determina qué acciones y vistas están disponibles para esa cuenta.
- **Cuenta de usuario**: cuenta del sistema de autenticación existente, ahora extendida para admitir más de una cuenta (además del "admin" original), cada una con su propio perfil y, si su perfil es "jugador", vinculada a un registro de Jugador.
- **Jugador**: registro de jugador ya existente en la aplicación; cuando corresponde a una cuenta de perfil "jugador", permite identificar cuál es el jugador que esa cuenta puede dar de baja de una convocatoria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los intentos de una cuenta "jugador" de crear, editar, eliminar o inhabilitar jugadores, crear o eliminar un partido, generar o regenerar equipos, cerrar/reabrir/finalizar un partido, modificar estadísticas, ver puntajes, estrategia, diferencias, bloqueados, explicación de armado, o acceder a la Configuración, son bloqueados — tanto desde la interfaz como accediendo directamente a los datos.
- **SC-002**: El 100% de los intentos de una cuenta "jugador" de darse de baja a sí misma de una convocatoria en la que está anotada se completan sin intervención de un administrador.
- **SC-003**: El 100% de los intentos de una cuenta "jugador" de eliminar a otro jugador de una convocatoria son bloqueados.
- **SC-004**: Una cuenta "admin" no experimenta ningún cambio de comportamiento ni restricción nueva al usar la aplicación después de esta feature.

## Assumptions

- El sistema de login existente (con una única cuenta "admin" fija) se extiende para admitir más de una cuenta, cada una cargada manualmente en Firebase con su usuario, contraseña, perfil ("admin" o "jugador") y, si corresponde, el vínculo al jugador asociado — no se agrega ninguna pantalla de registro o gestión de cuentas en esta versión.
- La lista de acciones y vistas descriptas como "restricciones del perfil jugador" es una lista taxativa de lo que ese perfil NO puede hacer o ver. Lo que no está explícitamente restringido (ver listado de jugadores sin puntaje, ver sus estadísticas acumuladas de goles/asistencias/G-E-P, ver listado y estado de partidos, ver equipos ya armados sin los datos restringidos, anotarse/anotar a otros y darse de baja de la convocatoria propia) permanece disponible para "jugador" — con la excepción de crear o eliminar un partido, que se confirmó como exclusivo de "admin" por tratarse de una acción estructural y, en el caso de eliminar, irreversible (ver Clarifications).
- Al igual que con el login básico, "restringir" implica impedir tanto la visualización en la interfaz como la lectura o escritura de esos datos del lado de la persistencia, para que la restricción sea real y no sorteable con acceso directo a los datos.
- No hay revocación o actualización en tiempo real de una sesión ya iniciada cuando se cambia el perfil de esa cuenta en Firebase; el cambio aplica desde el próximo inicio de sesión.
