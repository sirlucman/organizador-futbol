# Quickstart: Validar duplas de rotación entre jugadores

Validación manual (no hay suite de tests automatizada en este proyecto — ver `plan.md`, Testing).

## Prerrequisitos

1. Correr `index.html` localmente (usa el proyecto de staging automáticamente — ver `README.md`, "Entorno de pruebas").
2. Al menos dos cuentas de sesión disponibles: una "admin" y una "jugador" con `jugadorId` asignado (`007-permisos-por-usuario`).
3. Al menos 6 jugadores activos, dos de ellos arqueros naturales (`principal: 'Arquero'`), con puntaje cargado en al menos una posición cada uno.
4. Un partido en Fútbol 8 (16 titulares) con inscripción abierta y sin equipos generados todavía.

## Escenarios a validar

### 1. Crear el vínculo y efecto sobre titulares/suplentes (User Story 1)

1. Convocar a 16 jugadores (todos titulares) + 2 suplentes más. Con sesión "jugador", abrir "Rotación" en la fila de un titular → verificar que el buscador muestra tanto convocados como no convocados, excluyendo solo a ese mismo jugador.
2. Vincular a dos TITULARES → verificar que uno libera su vacante y el primer suplente sube automáticamente a titular.
3. Deshacer ese vínculo y vincular en cambio un TITULAR con un SUPLENTE → verificar que el suplente sale de la lista de suplentes sin liberar ninguna vacante adicional, y que el resto de suplentes conserva su orden relativo.
4. Con la dupla activa, verificar que ambos integrantes aparecen agrupados en un único renglón de la convocatoria (uno arriba, otro abajo, dentro de un mismo recuadro — FR-016), con un botón "Quitar del partido" por integrante y un solo botón "Deshacer rotación" para el par. Intentar vincular a cualquiera de sus dos integrantes con un tercer jugador (desde cualquier sesión) → verificar que ninguno de los dos aparece como candidato.
5. Repetir el paso 2 con sesión "admin" → mismo resultado.

### 2. Promoción conjunta desde la lista de suplentes (User Story 1, clarificación de posición en cola)

1. Convocar a más jugadores de los que caben como titulares, dejando al menos 3 en la lista de suplentes.
2. Vincular a dos suplentes que estén en posiciones distintas de esa lista (p. ej. el 2do y el 5to suplente) → verificar que la unidad combinada queda ubicada en la posición del que estaba más adelante (la posición del 5to se cierra, el resto de los suplentes detrás de él avanza un lugar).
3. Dar de baja a un titular para liberar una vacante → verificar que, cuando le corresponde el turno a esa unidad, ambos integrantes suben juntos a titulares (nunca uno solo).

### 3. Deshacer el vínculo (User Story 2)

1. Con sesión "jugador" que NO integra ninguna dupla existente, verificar que no aparece ningún control para deshacer las duplas de otros (ni deshabilitado, ni visible).
2. Con sesión "jugador" que SÍ integra una dupla, deshacerla → debe funcionar y recalcular titulares/suplentes.
3. Con sesión "admin", deshacer una dupla ajena → debe funcionar igual.
4. Dar de baja a uno de los dos integrantes de una dupla activa (con cualquier perfil autorizado) → verificar que el vínculo desaparece solo y el que queda vuelve a contarse como convocado individual.

### 4. El motor respeta a la dupla (User Story 3)

1. Con una dupla entre titulares y Estrategia 1 seleccionada, generar equipos → verificar que ambos quedan en el mismo equipo, agrupados en un único renglón del roster (uno arriba, otro abajo — FR-016), con la misma posición asignada y candado compartido, y que el valor de balance usado es el promedio de los promedios de ambos (revisar la explicación/resumen de armado).
2. Repetir con Estrategia 2 → verificar que el motor elige la mejor combinación de posiciones principales/secundarias de ambos integrantes, y que quedan en el mismo equipo.
3. Vincular a dos arqueros naturales como dupla y generar equipos → verificar que el motor los trata como un único candidato a arquero (nunca asigna el arco a cada uno en equipos distintos).
4. Verificar que el ícono de dupla dentro del renglón agrupado se ve bien tanto si la dupla quedó en "Equipo Blanco" (fondo claro) como en "Equipo Negro" (fondo oscuro) — arrastrar la dupla al equipo contrario para probar ambos casos si hace falta.

### 5. Edición manual respeta a la dupla (User Story 4)

1. Con equipos generados y una dupla presente, arrastrar a un integrante al equipo contrario (sesión "admin") → verificar que el otro integrante se mueve automáticamente con él.
2. Bloquear (candado) a un integrante → verificar que el bloqueo se aplica también al otro.

### 6. Estadísticas individuales y carga de resultado (User Story 5)

1. Finalizar un partido con una dupla presente, cargando goles/asistencias distintos para cada integrante dentro de su renglón agrupado (cada integrante mantiene su propio par de campos goles/asistencias, aunque comparten el mismo recuadro — FR-016).
2. Verificar en las estadísticas acumuladas de cada jugador que los valores son independientes (no duplicados ni combinados con los del compañero), y que ambos suman "partido jugado".

### 7. Aviso de equipos desactualizados (FR-015)

1. Con equipos ya generados y una dupla presente, deshacer esa dupla (inscripción todavía abierta) → verificar que aparece el aviso ya existente de "equipos desactualizados", ofreciendo regenerar.

## Resultado esperado

Los siete escenarios se comportan como describen las Acceptance Scenarios de `spec.md`. Cualquier desvío es un bug a corregir antes de dar la feature por completa (Principio I de la constitución).
