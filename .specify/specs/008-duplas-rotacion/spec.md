# Feature Specification: Duplas de rotación entre jugadores

**Feature Branch**: `008-duplas-rotacion` *(número tentativo — se asigna automáticamente al correr `/speckit-specify`)*

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "Separar a los jugadores que hoy se anotan como 'dupla' (típicamente padre e hijo) en dos jugadores independientes, en vez de un único jugador combinado, para poder calcular estadísticas individuales correctas. Agregar la posibilidad de configurar, antes del armado de equipos, qué jugador rota con quién." (ver `feature-description-duplas-rotacion.md` para el detalle original completo).

> **⚠️ Parcialmente reemplazada (2026-08-31).** La **fila de dupla del panel de equipos**
> —un renglón con un integrante arriba y el otro abajo, compartiendo posición y candado—
> fue reemplazada, en la pantalla de **equipos generados con la inscripción abierta**, por
> [`docs/equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md`](../../../docs/equipos-en-el-campo/rebanada-1-cancha/CANCHA_SPEC.md):
> ahí la dupla es **una sola camiseta** con una cápsula de dos nombres y un ícono de
> rotación (`FR-026`).
>
> **Lo que NO se reemplaza y sigue vigente acá:** todo lo demás. Que la dupla sea una
> unidad de armado que viaja entera, que sus dos integrantes vayan siempre al mismo
> equipo y a la misma posición, que el candado aplique a los dos a la vez, y cómo se
> calcula su puntaje. Las pantallas de carga de resultado y de partido finalizado siguen
> usando la fila de dupla que esta spec describe, sin cambios.

## Clarifications

### Session 2026-08-15

- Q: ¿Cómo cuenta una dupla para el cupo de titulares? → A: Entre los dos ocupan una única vacante de titular. Si se vincula a dos titulares, uno libera su vacante y el siguiente suplente la ocupa automáticamente. Si se vincula a un titular con un suplente, el suplente deja la lista de suplentes y el resto de esa lista se reordena.
- Q: ¿Qué peso tiene la dupla en el cálculo de puntaje/posición del motor? → A: Se representa como una sola unidad, nunca como la suma de ambos. Estrategia 1: promedio de los puntajes promedio. Estrategia 2: se evalúan como candidatos la posición principal de cada integrante (y las secundarias solo si corrigen una imparidad), eligiendo la combinación con mejor resultado — mismo criterio que ya usa el motor hoy para un jugador individual.
- Q: ¿El vínculo de dupla es permanente o por partido? → A: Específico de cada partido, no es una relación global entre los dos jugadores.
- Q: ¿Un suplente puede vincularse como dupla? → A: Sí, cualquiera de los dos roles. Ver primera clarificación de esta sesión para el efecto sobre el cupo.
- Q: ¿Qué pasa si se arrastra manualmente a un integrante de una dupla a otro equipo? → A: Se permite, y el otro integrante se mueve automáticamente con él.
- Q: ¿Qué prioridad tiene el invariante "misma dupla, mismo equipo" frente a otros invariantes del motor (ej. un arquero por equipo)? → A: Es un invariante que nunca se rompe, pero el invariante de conseguir un arquero por equipo se resuelve primero (tiene máxima prioridad).
- Q: En Estrategia 1, si uno de los dos integrantes de la dupla no tiene puntaje cargado, ¿cómo se calcula el promedio de la unidad? → A: La dupla se trata como "sin puntaje" únicamente si NINGUNO de los dos tiene puntaje. (Se infiere: si solo uno tiene, se usa el puntaje de ese integrante como valor de la unidad.)
- Q: Al cargar el resultado del partido, ¿cómo se define quién de los dos participó realmente? → A: No hace falta un marcador aparte — alcanza con poder cargar goles y asistencias a cada integrante por separado, en el mismo renglón del roster del equipo. "Partido jugado" sigue contando según la regla ya vigente (haber integrado el equipo generado), sin necesidad de un marcador adicional de participación real.
- Q: Si se deshace una dupla después de generar los equipos (inscripción todavía abierta), ¿debería avisar que quedaron desactualizados? → A: Sí, reutiliza el aviso de "equipos desactualizados" que ya existe.
- Q: Si una dupla completa está en la lista de suplentes y se libera una vacante de titular, ¿sube toda la dupla junta o solo uno de los dos? → A: Sube la dupla entera. La dupla es siempre una unidad de jugador, en todo el recorrido (convocatoria, promoción, equipo generado).
- Q: ¿Ese principio de "unidad única" aplica sin excepción? → A: Aplica en todo el recorrido, con una única excepción: la carga de estadísticas (goles/asistencias) al finalizar el partido, donde cada integrante se registra por separado (FR-014).
- Q: ¿Un "jugador" (no solo "admin") puede vincular una dupla, y sobre cualquier par de convocados o solo sobre sí mismo? → A: También puede hacerlo un "jugador", sobre cualquier par de convocados (mismo alcance que ya tiene para anotar a otros a la convocatoria).
- Q: ¿Un "jugador" puede deshacer una dupla de la que no forma parte? → A: No — solo puede deshacer un vínculo si él mismo es uno de los dos integrantes (mismo criterio restrictivo que ya tiene para la baja de convocatoria).

### Session 2026-08-17

- Q: Cuando se forma una dupla entre dos jugadores que ya están en la lista de suplentes en posiciones distintas, ¿qué posición ocupa la dupla en esa cola para futuras promociones? → A: La posición más temprana (mejor) de las dos; la otra posición simplemente se cierra, igual que si ese integrante hubiera dejado la cola.

### Session 2026-08-27

- Q: FR-001 citaba el literal "Agregar rotación" para el botón de la fila. ¿Se puede acortar a "Rotación"? → A: Sí, y el spec se actualiza con él. La etiqueta larga ocupaba ~150px en una fila de 360px y forzaba a los nombres de los jugadores a partirse en dos líneas ("Anibal / Leal"). La forma corta libera ~55px sin esconder nada: el ícono de las dos camisetas ya identifica la acción y el buscador que se abre sigue titulándose "Agregar rotación". Se descartó dejar sólo el ícono, que liberaba ~100px, porque haría depender el significado del atributo `title` — inalcanzable en una pantalla táctil, donde no hay hover.
- Q: ¿Por qué se cambia el spec y no sólo el código? → A: Porque FR-001 citaba el string literal. Bajo el Principio I de la constitución, si el código dice una cosa y el spec otra es un bug a corregir explícitamente en uno de los dos; cambiar sólo el botón dejaba el requisito nombrando un texto que la aplicación ya no muestra.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vincular a dos jugadores como dupla de rotación (Priority: P1)

Mientras la inscripción de un partido está abierta, cualquier usuario logueado (perfil "admin" o "jugador" — ver `007-permisos-por-usuario`) vincula a dos jugadores convocados como una "dupla de rotación": entre los dos pasan a ocupar una única vacante de titular. Un "jugador" puede hacerlo sobre cualquier par de convocados, no solo sobre sí mismo — mismo alcance que ya tiene hoy para anotar a otros jugadores a la convocatoria.

**Why this priority**: Es el punto de entrada de toda la feature — sin poder crear el vínculo, ninguna otra historia tiene sentido.

**Independent Test**: Convocar a dos jugadores titulares, vincularlos como dupla (probar con sesión "admin" y con sesión "jugador"), y verificar que se libera una vacante de titular que el siguiente suplente (si existe) ocupa automáticamente.

**Acceptance Scenarios**:

1. **Given** la fila de un jugador convocado (titular o suplente) con inscripción abierta, **When** cualquier usuario logueado (admin o jugador) selecciona "Agregar rotación", **Then** se abre un buscador que muestra tanto convocados como no convocados a ese partido, excluyendo a quien ya integre otra dupla.
2. **Given** dos jugadores TITULARES, **When** se vinculan como dupla, **Then** uno de los dos libera su vacante de titular y, si hay suplentes disponibles, el primero de la lista pasa a ocupar esa vacante automáticamente.
3. **Given** un jugador TITULAR y un jugador SUPLENTE, **When** se vinculan como dupla, **Then** el suplente deja de contarse en la lista de suplentes (queda unido a la vacante del titular) y el resto de los suplentes conserva su orden relativo, avanzando una posición.
4. **Given** dos jugadores ya vinculados como dupla, **When** cualquier usuario logueado busca formar un nuevo vínculo con cualquiera de los dos, **Then** ninguno de los dos aparece como candidato en el buscador de otro jugador, y la fila de cada integrante ya no ofrece "Agregar rotación" — en su lugar muestra el vínculo existente y la opción de deshacerlo.
5. **Given** una dupla completa en la lista de SUPLENTES, **When** se libera una vacante de titular y le corresponde el turno según el orden de convocatoria, **Then** los dos integrantes de la dupla se promueven juntos a titulares, ocupando esa vacante como una sola unidad — nunca sube uno solo de los dos.
6. **Given** una sesión "jugador" que no integra ninguna de las dos duplas de un partido, **When** intenta vincular a dos OTROS jugadores entre sí, **Then** el sistema lo permite igual (no hay restricción de "solo a mí mismo" para crear el vínculo).

---

### User Story 2 - Deshacer el vínculo de dupla (Priority: P2)

Un "admin" puede deshacer manualmente cualquier vínculo mientras la inscripción sigue abierta. Un "jugador" solo puede deshacer un vínculo del que él mismo forma parte — mismo criterio restrictivo que ya tiene para darse de baja de una convocatoria (`007-permisos-por-usuario`, FR-011). En cualquier caso, el vínculo se deshace automáticamente si alguno de los dos integrantes se da de baja de la convocatoria.

**Why this priority**: Es el complemento necesario de la Historia 1 para que el vínculo no quede "pegado" para siempre por error, pero no bloquea el valor principal de la feature.

**Independent Test**: Con sesión "admin", deshacer una dupla ajena y verificar que funciona. Con sesión "jugador", intentar deshacer una dupla ajena (debe fallar) y luego deshacer una propia (debe funcionar). Dar de baja a uno de los dos integrantes y verificar que el vínculo desaparece solo, sin importar el perfil.

**Acceptance Scenarios**:

1. **Given** una dupla vinculada con inscripción abierta, **When** un "admin" deshace el vínculo (sea o no parte de ella, ya que admin no integra convocatorias como jugador), **Then** ambos jugadores vuelven a contarse como convocados independientes, recalculando titulares/suplentes según el orden de convocatoria existente.
2. **Given** una dupla vinculada entre dos jugadores A y B, **When** un usuario "jugador" que ES uno de los dos (A o B) deshace el vínculo, **Then** el sistema lo permite igual que a un admin.
3. **Given** una dupla vinculada entre dos jugadores A y B, **When** un usuario "jugador" que NO es A ni B invoca directamente la acción de deshacer (sin pasar por el control de la interfaz, que ya sabemos que está oculto para él — ver escenario 4), **Then** el sistema igual lo impide a nivel de la función que gestiona el vínculo.
4. **Given** una dupla vinculada entre dos jugadores A y B, **When** un usuario "jugador" que NO es A ni B ve la fila de esa dupla en la convocatoria, **Then** el control para deshacer el vínculo no se muestra — no aparece como botón deshabilitado ni genera un mensaje de error al intentar usarlo, porque directamente no está disponible.
5. **Given** una dupla vinculada, **When** uno de los dos se da de baja del partido (por cualquier perfil autorizado a esa baja), **Then** el vínculo se elimina automáticamente para ese partido y el que queda vuelve a contarse como jugador independiente.

---

### User Story 3 - El motor de generación de equipos respeta a la dupla (Priority: P1)

Al generar o regenerar los equipos, ambos integrantes de una dupla siempre quedan en el mismo equipo, y el motor los evalúa como una sola unidad de balance.

**Why this priority**: Es el otro pilar central de la feature junto con la Historia 1 — sin esto, separar a los jugadores en dos IDs no aporta nada al armado de equipos.

**Independent Test**: Generar equipos con una dupla entre los titulares, con cada estrategia, y verificar que ambos quedan siempre en el mismo equipo y que el balance no los cuenta por separado.

**Acceptance Scenarios**:

1. **Given** una dupla entre los titulares y Estrategia 1 seleccionada, **When** se generan los equipos, **Then** el valor usado para el balance es el promedio de los puntajes promedio de ambos integrantes, y los dos quedan en el mismo equipo.
2. **Given** una dupla entre los titulares y Estrategia 2 seleccionada, **When** se generan los equipos, **Then** el motor evalúa como candidatos la posición principal de cada integrante (agregando secundarias solo si corrigen una imparidad, igual que para un jugador individual) y elige la combinación con mejor resultado, dejando a ambos en el mismo equipo.
3. **Given** una dupla donde ambos integrantes son arqueros naturales, **When** se generan los equipos, **Then** el motor los trata como un único candidato para el invariante "un arquero por equipo" (nunca asigna el arco a cada uno en equipos distintos), resolviendo primero ese invariante y recién después el resto del balance.

---

### User Story 4 - La edición manual de equipos respeta a la dupla (Priority: P2)

Cuando el administrador mueve manualmente (drag & drop) a un integrante de una dupla a otro equipo, el otro integrante se mueve automáticamente con él.

**Why this priority**: Extiende una funcionalidad ya existente (edición manual, `003-motor-generacion-equipos` Historia 4); no es indispensable para el valor central, pero evita que la edición manual rompa el invariante de la Historia 3.

**Independent Test**: Con equipos ya generados y una dupla presente, arrastrar a uno de los dos integrantes al equipo contrario y verificar que el otro lo acompaña automáticamente.

**Acceptance Scenarios**:

1. **Given** equipos generados con una dupla, **When** el administrador arrastra a un integrante al equipo contrario, **Then** el otro integrante se mueve automáticamente al mismo equipo.
2. **Given** una dupla en un equipo ya generado, **When** el administrador bloquea (candado) a uno de sus integrantes, **Then** el bloqueo se aplica a ambos integrantes en simultáneo, consistente con que siempre están en el mismo equipo.

---

### User Story 5 - Estadísticas individuales por integrante (Priority: P2)

Cada integrante de una dupla acumula sus propias estadísticas (partidos jugados, goles, asistencias, ganados/perdidos/empatados) de forma independiente, sin mezclarse con las de su compañero.

**Why this priority**: Es la motivación original de toda la feature (separar el perfil combinado), pero depende de que las Historias 1 y 3 ya existan para tener datos reales que acumular.

**Independent Test**: Finalizar un partido con una dupla donde cada integrante hizo goles/asistencias distintos, y verificar que las estadísticas acumuladas de cada uno son correctas e independientes — no ambos con el mismo resultado.

**Acceptance Scenarios**:

1. **Given** un partido finalizado con una dupla, **When** se carga el resultado, **Then** el sistema permite cargar goles y asistencias de cada integrante por separado, en el mismo renglón del roster del equipo generado, sin necesitar una pantalla o paso adicional.
2. **Given** que ambos integrantes de una dupla quedaron cargados en el equipo generado (FR-007), **When** el partido se finaliza, **Then** ambos suman "partido jugado" según la misma regla ya vigente para cualquier jugador (haber integrado alguno de los dos equipos — ver `004-estadisticas-vista-jugadores`, FR-002), sin necesidad de un marcador adicional de participación real.

### Edge Cases

- Dos jugadores vinculados como dupla donde ambos son arqueros naturales: el motor los trata como un único candidato a arquero (User Story 3, escenario 3).
- Un jugador vinculado en dupla se da de baja del partido: el vínculo se rompe automáticamente (User Story 2, escenario 2) y el que queda no pierde su lugar de convocado.
- Dos suplentes vinculados entre sí (ninguno era titular al momento de vincularse): no libera ninguna vacante de titular por sí sola, pero si le corresponde el turno de promoción (se libera una vacante), sube junta como una sola unidad (FR-004b) — nunca se separan.
- Se intenta vincular a un jugador que ya forma parte de otra dupla: no llega a ser un intento fallido — ese jugador ya no aparece como opción en ningún buscador, ni su fila ofrece "Agregar rotación" (vínculo exclusivo 1 a 1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer, en cada fila de un jugador convocado (titular o suplente) mientras la inscripción del partido está abierta, una opción "Rotación" que abre un buscador de jugadores para formar la dupla (el buscador se titula "Agregar rotación", que es la acción completa; la fila usa la forma corta por espacio horizontal). El buscador MUST mostrar tanto a jugadores YA convocados a ese partido (titulares o suplentes) como a jugadores NO convocados, excluyendo únicamente al propio jugador de esa fila y a cualquier jugador que ya integre otra dupla (FR-002).
- **FR-001c**: Al vincularse con un jugador YA convocado, el sistema MUST actualizar la lista de convocatoria: ese jugador deja su lugar individual (titular o suplente) y pasa a compartir la vacante única de la dupla (ver FR-004/FR-004b/FR-005). Al vincularse con un jugador NO convocado, el sistema MUST incorporarlo directamente como integrante de la dupla, ocupando la vacante compartida, sin pasar por el flujo normal de anotación a la convocatoria.
- **FR-001b**: Un usuario con perfil "admin" o "jugador" (ver `007-permisos-por-usuario`) MUST poder crear un vínculo de dupla sobre cualquier par de convocados, sin restricción de que alguno de los dos sea el propio jugador vinculado a la cuenta — mismo alcance que ya tiene "jugador" para anotar a otros a la convocatoria (FR-011 de `007-permisos-por-usuario`).
- **FR-002**: El sistema MUST tratar el vínculo de dupla como exclusivo 1 a 1: un jugador no puede tener más de un compañero de rotación al mismo tiempo. Esto MUST reflejarse ocultando la opción en la interfaz (ver FR-001: un jugador ya vinculado no aparece como candidato en ningún buscador, ni su fila ofrece "Agregar rotación"), y no únicamente bloqueando el intento con un error.
- **FR-003**: El sistema MUST tratar el vínculo de dupla como específico de cada partido, sin persistirlo como relación permanente entre los dos jugadores.
- **FR-004**: Cuando se vinculan dos jugadores TITULARES como dupla, el sistema MUST liberar la vacante de titular de uno de los dos y MUST promover automáticamente al primer suplente (o dupla de suplentes, ver FR-004b) disponible para ocuparla (reutilizando el mecanismo de reemplazo automático ya definido en `001-organizacion-partidos`, FR-008).
- **FR-004b**: El sistema MUST tratar siempre a una dupla como una única unidad de jugador dentro del orden de convocatoria: si una dupla está en la lista de suplentes y le corresponde el turno de ocupar una vacante de titular (por cualquier motivo — baja de un titular, u otra dupla que libera su vacante), MUST promover a los dos integrantes juntos, ocupando esa vacante como una sola unidad compartida — nunca promueve a uno solo de los dos. Cuando la dupla se forma a partir de dos jugadores que ya estaban en la lista de suplentes en posiciones distintas, la unidad MUST tomar la posición más temprana (mejor) de las dos en la cola de promoción; la otra posición se cierra, igual que si ese integrante hubiera dejado la cola.
- **FR-005**: Cuando se vincula un jugador TITULAR con un jugador SUPLENTE como dupla, el sistema MUST quitar al suplente de la lista de suplentes y MUST conservar el orden relativo del resto de los suplentes, sin liberar ninguna vacante de titular adicional.
- **FR-006**: El sistema MUST permitir a un "admin" deshacer manualmente cualquier vínculo de dupla mientras la inscripción esté abierta. El sistema MUST permitir a un "jugador" deshacer manualmente un vínculo únicamente cuando él mismo (el jugador vinculado a su cuenta) sea uno de los dos integrantes, y MUST impedírselo en cualquier otro caso. En ambos perfiles, el sistema MUST deshacer el vínculo automáticamente cuando cualquiera de los dos integrantes se dé de baja de la convocatoria, recalculando titulares/suplentes en todos los casos.
- **FR-006b**: El sistema MUST mostrar el control para deshacer un vínculo de dupla únicamente a "admin" o al "jugador" que forme parte de esa dupla; para cualquier otro usuario "jugador", el control MUST estar oculto (no visible-pero-deshabilitado, ni un botón que falle al hacer clic) — mismo patrón ya usado hoy para el botón "Quitar del partido" en la convocatoria.
- **FR-007**: El motor de generación de equipos MUST garantizar, como invariante no configurable, que ambos integrantes de una dupla queden siempre en el mismo equipo, subordinado únicamente al invariante existente de "un arquero por equipo" (que se resuelve primero).
- **FR-008**: El motor MUST calcular el balance de una dupla como una sola unidad, nunca como la suma de sus valores individuales: con Estrategia 1, MUST usar el promedio de los puntajes promedio de ambos integrantes cuando los dos tienen puntaje cargado; si solo uno de los dos tiene puntaje, MUST usar el de ese integrante como valor de la unidad; si ninguno tiene puntaje, la dupla MUST tratarse como "sin puntaje" (igual que un jugador individual sin puntaje). Con Estrategia 2, MUST evaluar como candidatos la posición principal de cada integrante (y secundarias solo si corrigen una imparidad), con el mismo criterio de selección que ya usa el motor para un jugador individual. **Enmendado por `014-puntaje-dupla-por-posicion`**: en las Estrategias 2 y 3 el valor de la dupla ya no es el mismo en las cuatro posiciones, sino el promedio del aporte de cada integrante en la posición asignada, donde el aporte es su nota cargada ahí si existe y su promedio general si no la tiene (014, FR-001/FR-002). El promedio de los promedios generales que define este FR sigue siendo el valor de la unidad en la Estrategia 1, que no mira posiciones, y es además el caso al que colapsa la fórmula nueva cuando ninguno de los dos tiene nota en esa posición.
- **FR-009**: Cuando ambos integrantes de una dupla sean candidatos naturales a arquero, el motor MUST tratarlos como un único candidato para el invariante de arquero, sin asignar el arco a cada uno en equipos distintos.
- **FR-011**: El sistema MUST mover automáticamente a ambos integrantes de una dupla cuando se edite manualmente (drag & drop) el equipo de cualquiera de los dos.
- **FR-012**: El sistema MUST aplicar el bloqueo manual (candado) de forma conjunta a ambos integrantes de una dupla.
- **FR-013**: Cada integrante de una dupla MUST acumular sus propias estadísticas (partidos jugados, ganados, perdidos, empatados, goles, asistencias) de forma independiente del otro integrante, contando "partido jugado" según la misma regla ya vigente para cualquier jugador (haber integrado el equipo generado), sin necesidad de un marcador adicional de participación real.
- **FR-014**: Al cargar el resultado de un partido con una dupla presente, el sistema MUST permitir cargar los goles y asistencias de cada integrante por separado, en el mismo renglón del roster del equipo generado.
- **FR-015**: Deshacer un vínculo de dupla después de que los equipos ya fueron generados (con la inscripción todavía abierta) MUST activar el aviso ya existente de "equipos desactualizados" (`003-motor-generacion-equipos`), ofreciendo regenerarlos.
- **FR-016**: El sistema MUST mostrar a los dos integrantes de una dupla agrupados en un único renglón (uno arriba, otro abajo, dentro de un mismo recuadro visual) tanto en la lista de convocatoria como en el roster del equipo generado, en vez de dos filas independientes con una referencia cruzada entre ellas — refuerza visualmente que la app la trata como una única unidad (ver Key Entities). La carga de goles/asistencias (FR-014) ocurre dentro de ese mismo renglón agrupado, con un campo propio por integrante.

### Key Entities

- **Dupla de rotación**: vínculo entre dos Jugadores, específico de un partido puntual, exclusivo 1 a 1. La app la trata siempre como una **única unidad de jugador** — en el orden de convocatoria, en la promoción de suplente a titular (FR-004b), y en el equipo generado (FR-007/FR-008) — ocupando una sola vacante de titular entre los dos, y se muestra como tal (un único renglón agrupado, FR-016) en convocatoria y en el equipo generado. **Única excepción**: al cargar el resultado del partido, cada integrante registra sus propios goles y asistencias por separado (FR-014) — ahí sí son dos jugadores independientes, no una unidad (aunque visualmente sigan compartiendo el mismo renglón agrupado, FR-016).
- **Jugador** *(existente, sin cambios de forma)*: ahora puede estar vinculado a otro Jugador mediante una Dupla, dentro del contexto de un Partido específico.
- **Convocatoria / Partido** *(existente)*: su cálculo de titulares/suplentes ahora debe considerar que una dupla ocupa una sola vacante entre los dos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede vincular o deshacer una dupla en una sola acción, sin tener que recalcular manualmente titulares ni suplentes.
- **SC-002**: El 100% de las generaciones de equipos con una dupla presente respeta el invariante de mantenerlos en el mismo equipo.
- **SC-003**: El 100% de los jugadores que integraron una dupla en algún partido muestran, en sus estadísticas acumuladas, valores individuales correctos — nunca duplicados ni combinados con los de su compañero.

## Assumptions

- La restricción de FR-006 (jugador solo deshace duplas propias) se resuelve del lado de la aplicación (código), no con una regla nueva de Firestore: hereda la misma limitación ya documentada y aceptada en `007-permisos-por-usuario` (`research.md`, sección 3) para `data/partidos` — como ese documento guarda todos los partidos como un único bloque de texto, Firestore no puede distinguir "cambió solo mi propia baja" de "cambió la dupla de otro"; la regla de Firestore ya vigente ("admin o jugador pueden escribir `partidos`") ya cubre este caso sin cambios. La restricción fina la sigue validando la función de la app que gestione deshacer el vínculo, igual que hoy hace `window.__removeFromMatch` para la baja de convocatoria.
- Fuera de alcance de esta versión (según `feature-description-duplas-rotacion.md`): migración de estadísticas históricas ya acumuladas bajo el perfil combinado anterior; uso de posiciones secundarias de la dupla para fines distintos a corregir imparidad; cualquier mecanismo de registro en vivo de sustituciones dentro de un partido (quién entra, en qué minuto).