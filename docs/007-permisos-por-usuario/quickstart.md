# Quickstart: Validar permisos por perfil de usuario

Validación manual (no hay suite de tests automatizada en este proyecto — ver `plan.md`, Testing).

## Prerrequisitos

1. Reglas de Firestore publicadas según `contracts/firestore-rules.md`, en el proyecto de staging (`organizador-futbol-staging`).
2. En la consola de Firebase (proyecto de staging):
   - Cuenta de Firebase Auth existente `admin@organizador-futbol.local` (ya creada en `005-login-basico`) con `userRoles/{uid}` = `{ rol: "admin" }`.
   - Una segunda cuenta de Firebase Auth de prueba, p. ej. `jugador.prueba@organizador-futbol.local`, con `userRoles/{uid}` = `{ rol: "jugador", jugadorId: "<id de un jugador existente>" }`.
   - Al menos un jugador con puntaje cargado en alguna posición y otro sin ningún puntaje cargado, en `data/players`/`data/playerScores`.
   - Al menos un partido con equipos ya generados (`data/partidos` + `data/partidosArmado` con estrategia/diferencia/bloqueados/explicación) y con el jugador de prueba anotado en su convocatoria junto con otro jugador más.

## Escenarios a validar

### 1. Interfaz restringida (User Story 1)

1. Iniciar sesión con la cuenta "jugador" de prueba.
2. Ir a la solapa Jugadores → verificar: se ve el listado completo (incluyendo al jugador sin puntaje cargado), sin ningún puntaje visible, sin botones de crear/editar/eliminar/inhabilitar, con las estadísticas acumuladas visibles (aunque estén en 0).
3. Ir a la solapa Partidos → abrir el partido con equipos generados → verificar: se ve qué jugador quedó en qué equipo, pero no la estrategia, ni la diferencia de puntaje, ni la cantidad de jugadores sin puntaje, ni los jugadores bloqueados, ni la explicación de armado.
4. Verificar que la solapa Configuración no aparece en ningún menú.
5. Cerrar sesión, iniciar con la cuenta "admin" → verificar que todo lo anterior se ve sin ninguna restricción.

### 2. Acciones administrativas bloqueadas (User Story 2)

Con la sesión "jugador" de prueba:
1. Verificar que no hay botón para generar/regenerar equipos, ni para cerrar/reabrir inscripción, ni para finalizar el partido, ni para crear o eliminar un partido, ni para editar el resultado de un partido finalizado.
2. Repetir el intento de cada una de esas escrituras directo contra Firestore (por ejemplo desde la consola del navegador, llamando al SDK con la sesión "jugador" activa) contra `data/playerScores`, `data/partidosArmado` y `data/motorConfig` → deben fallar con error de permisos.

### 3. Autoservicio de convocatoria (User Story 3)

Con la sesión "jugador" de prueba, anotada junto con otro jugador en la convocatoria de un partido:
1. Darse de baja a sí mismo → debe funcionar.
2. Volver a anotarse, y luego intentar eliminar al otro jugador de la convocatoria desde la interfaz → la opción no debe estar disponible.

## Resultado esperado

Los tres escenarios se comportan como describen las Acceptance Scenarios de `spec.md`. Cualquier desvío es un bug a corregir antes de dar la feature por completa (Principio I de la constitución).
