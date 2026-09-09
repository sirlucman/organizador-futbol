# Data Model: Permisos por perfil de usuario

Ver `research.md` para el razonamiento detrás de cada decisión de este documento.

## Entidades nuevas

### Cuenta de usuario (extensión — colección `userRoles`)

Un documento por cuenta, `userRoles/{uid}` (`uid` = Firebase Auth UID), con campos nativos de Firestore (no el patrón blob `value` de `window.storage` — ver `research.md` #1 para el porqué):

| Campo | Tipo | Descripción |
|---|---|---|
| `rol` | `"admin" \| "jugador"` | Perfil de la cuenta (FR-001). |
| `jugadorId` | `string \| null` | `id` del Jugador vinculado a esta cuenta, si `rol` es `"jugador"` (FR-015). `null` si la cuenta "jugador" no tiene un jugador vinculado (ver Edge Case de spec.md — Firebase Console mal cargado). |

**Reglas/validaciones**:
- Se carga y edita manualmente en la consola de Firebase (FR-016); no hay pantalla de administración de cuentas.
- Una cuenta con `rol: "admin"` no usa `jugadorId` (no aplica).
- El vínculo es 1:1 esperado (un Jugador corresponde a una única cuenta), pero no se valida en esta versión — es responsabilidad de quien carga los datos manualmente.

### Sesión de usuario (extensión — `window.session`, no es un documento de Firestore)

Entidad en memoria, calculada una vez por sesión de navegador tras el login:

| Campo | Descripción | Origen |
|---|---|---|
| `rol` | `"admin"` o `"jugador"` de la cuenta autenticada | `userRoles/{uid}.rol` |
| `jugadorId` | Jugador vinculado, si `rol === "jugador"` | `userRoles/{uid}.jugadorId` |

- Si no existe `userRoles/{uid}` para el `uid` autenticado, se trata como `rol: "jugador"` sin `jugadorId` (fail-closed: ante un dato faltante, nunca se asume "admin" por defecto).

## Entidades existentes afectadas

### Jugador

Sin cambios en su forma conceptual (definida en `002-gestion-jugadores`), pero **se separa su representación en dos documentos de Firestore** para poder aplicar FR-004/FR-014:

- `data/players` (ya existente): todos los campos de Jugador **excepto** el puntaje por posición — nombre, estado (activo/inhabilitado), posiciones habilitadas, estadísticas acumuladas (`partidosJugados`, `partidosGanados`, `partidosEmpatados`, `partidosPerdidos`, `golesTotales`, `asistenciasTotales`). Visible para "admin" y "jugador" (FR-013); editable solo por "admin" (FR-003).
- `data/playerScores` (nuevo): `{ [jugadorId]: { [posicion]: puntaje } }`. Visible y editable solo por "admin" (FR-004).

Un Jugador sin ninguna entrada en `playerScores` (o con todas sus posiciones sin cargar) sigue apareciendo íntegro en `players` — nunca se oculta al jugador en sí (aclarado en Clarifications de spec.md), solo el valor del puntaje.

### Partido

Sin cambios en su forma conceptual (definida en `001-...`/features de partidos), pero **se separa** su representación en dos documentos para aplicar FR-005/FR-006/FR-007/FR-014:

- `data/partidos` (ya existente): datos del partido — nombre, fecha, estado (`Pendiente`/`Equipos generados`/`Finalizado`, etc.), `inscripcionCerrada`, convocatoria (lista de jugadores anotados), asignación de equipos por jugador (`equipos.blanco`/`equipos.negro`, sin metadata de armado), resultado final y estadísticas de gol/asistencia por jugador del partido. Visible para "admin" y "jugador"; editable por ambos roles a nivel de documento (ver limitación aceptada en `research.md` #3 sobre la baja de convocatoria).
- `data/partidosArmado` (nuevo): `{ [partidoId]: { estrategiaKey, diferenciaPuntaje, jugadoresSinPuntaje, bloqueados, explicacion } }`. Visible y editable solo por "admin" (FR-005, FR-006, FR-007).

### Motor de reglas (config)

Sin cambios de forma. Cambia solo su condición de acceso: `data/motorConfig` pasa de "cualquier cuenta autenticada" a "solo cuentas con `rol: admin`" (FR-012), tanto para lectura como escritura.

## Resumen de acceso por documento

| Documento | Lectura | Escritura |
|---|---|---|
| `data/players` | admin, jugador | admin |
| `data/playerScores` | admin | admin |
| `data/partidos` | admin, jugador | admin, jugador* |
| `data/partidosArmado` | admin | admin |
| `data/motorConfig` | admin | admin |
| `data/statsGanadosEmpatadosPerdidosMigrado`, `data/puntajeArmadoSeparadoMigrado` (flags de migración única) | admin | admin |
| `userRoles/{uid}` | cada cuenta lee solo su propio documento | ninguna (carga manual) |

\* Ver `research.md` #3: la escritura de `data/partidos` está abierta a ambos roles a nivel de Firestore Rules; la restricción de que "jugador" solo pueda modificar su propia baja/alta de convocatoria (y nunca equipos, estrategia, inscripción, resultado, ni bajas de otros) se valida en la capa de aplicación, no en las reglas — limitación documentada, no un vacío no advertido.
