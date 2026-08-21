# resultados-partido Specification

## Purpose

Define cómo se registran, validan y muestran las estadísticas de gol por jugador dentro del resultado de un partido, incluyendo la distinción entre goles de penal y goles de juego.

## Requirements

### Requirement: Registro de goles de penal por jugador y partido
El sistema SHALL permitir registrar, para cada jugador dentro del resultado de un partido, una cantidad de goles convertidos de penal, además de la cantidad total de goles.

#### Scenario: Cargar goles y penales de un jugador
- **WHEN** un administrador carga el resultado de un partido y asigna 2 goles y 1 gol de penal a un jugador
- **THEN** el sistema persiste `goles = 2` y `golesPenal = 1` para ese jugador en ese partido

#### Scenario: Jugador sin penales
- **WHEN** un jugador convierte goles sin ningún penal
- **THEN** el sistema persiste `golesPenal = 0` para ese jugador en ese partido

### Requirement: El gol de penal cuenta como gol
Un gol convertido de penal SHALL sumar al total de goles del jugador y del equipo de la misma forma que cualquier otro gol; no SHALL existir un conteo de goles que excluya los penales.

#### Scenario: Total de equipo incluye penales
- **WHEN** un jugador de un equipo convierte 1 gol de penal y no tiene otros goles
- **THEN** el total de goles mostrado para ese equipo incluye ese gol

### Requirement: Validación de penales contra goles del jugador
El sistema SHALL impedir que la cantidad de goles de penal de un jugador en un partido supere la cantidad total de goles de ese mismo jugador en ese partido.

#### Scenario: Penales no pueden superar los goles
- **WHEN** un administrador intenta guardar un resultado donde un jugador tiene 1 gol y 2 goles de penal
- **THEN** el sistema rechaza el valor o lo ajusta para que los penales no superen los goles, y no persiste un estado inconsistente

#### Scenario: Equipo sin goles no puede tener penales
- **WHEN** un jugador de un equipo que no convirtió ningún gol intenta registrar goles de penal
- **THEN** el sistema no permite ingresar penales para ese jugador (el input de penales está deshabilitado o limitado a 0), igual que ocurre hoy con las asistencias cuando el equipo no tiene goles

### Requirement: Carga de penales en la pantalla de resultado
La pantalla de carga/edición del resultado del partido SHALL ofrecer, para cada jugador, un control numérico para los goles de penal con la misma interacción (input numérico, habilitación condicionada a tener goles) que el control existente para goles.

#### Scenario: Control de penales visible junto al de goles
- **WHEN** un administrador abre la carga de resultado de un partido con registro no cerrado
- **THEN** cada jugador del roster muestra un input de "goles" y un input de "goles de penal" editables

### Requirement: Visualización de penales en la ficha del partido
En el resumen de goleadores de un partido finalizado, SHALL mostrarse el nombre del jugador seguido de su total de goles con el ícono de gol existente (`⚽`). Cuando ese jugador tiene al menos un gol de penal, SHALL agregarse el desglose entre paréntesis inmediatamente después, en el formato `Nombre N⚽ (M de penal)`, donde N es el total de goles y M es la cantidad de esos goles que fueron de penal (sin pluralizar "penal", aunque M sea mayor a 1). Cuando el jugador no tiene ningún gol de penal, SHALL mostrarse únicamente `Nombre N⚽`, sin ningún desglose ni paréntesis — igual que el comportamiento actual, sin cambios.

#### Scenario: Jugador sin penales en la ficha del partido
- **WHEN** un jugador anotó 3 goles en un partido sin ningún penal
- **THEN** la ficha del partido lo muestra como "Juan 3⚽", sin desglose

#### Scenario: Jugador con un penal en la ficha del partido
- **WHEN** un jugador anotó 3 goles en un partido y 1 de ellos fue de penal
- **THEN** la ficha del partido lo muestra como "Juan 3⚽ (1 de penal)"

#### Scenario: Jugador con más de un penal en la ficha del partido
- **WHEN** un jugador anotó 3 goles en un partido y 2 de ellos fueron de penal
- **THEN** la ficha del partido lo muestra como "Juan 3⚽ (2 de penal)" (sin pluralizar "penal")

### Requirement: La pantalla "jugadores" no distingue penales
La pantalla de listado de jugadores ("jugadores") SHALL seguir mostrando únicamente el total acumulado de goles de cada jugador, sin desglosar ni mencionar los goles de penal.

#### Scenario: Total de goles sin desglose en "jugadores"
- **WHEN** un jugador acumuló goles de penal a lo largo de varios partidos
- **THEN** la pantalla "jugadores" muestra el total de goles de ese jugador sin ninguna indicación de cuántos fueron de penal

### Requirement: Dato preparado para estadísticas futuras por jugador
El sistema SHALL acumular, a nivel de jugador, un total de goles de penal a lo largo de todos sus partidos, de forma análoga a como se acumulan hoy los goles y asistencias totales, aunque este total no se muestre todavía en ninguna pantalla.

#### Scenario: Recalcular totales incluye penales
- **WHEN** el sistema recalcula las estadísticas acumuladas de los jugadores a partir del historial de partidos
- **THEN** el total acumulado de goles de penal de cada jugador queda actualizado de forma consistente con la suma de sus goles de penal en cada partido
