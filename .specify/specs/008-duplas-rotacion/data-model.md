# Data Model: Duplas de rotación entre jugadores

Ver `research.md` para el razonamiento detrás de cada decisión de este documento.

## Entidades nuevas

### Dupla de rotación (campo nuevo dentro de Partido — no es un documento propio)

Persistida como `m.duplas: [ [idA, idB], ... ]` dentro de cada Partido, en el documento blob ya existente `data/partidos` (mismo documento y reglas que `convocados`/`bloqueados`).

| Campo | Tipo | Descripción |
|---|---|---|
| `duplas` | `Array<[string, string]>` | Lista de pares de `id` de Jugador, uno por vínculo activo en ese partido. Cada id aparece en **como máximo un** par a la vez (FR-002, exclusividad 1 a 1). Orden de la lista sin significado (no determina la posición de la unidad en la cola — ver "Unidad de convocatoria" abajo). |

**Reglas/validaciones**:
- Vive únicamente dentro de un Partido puntual; no hay relación persistida entre los dos Jugadores fuera de ese contexto (FR-003).
- Un id se quita de todos los pares de `m.duplas` en los que aparece cuando ese Jugador se da de baja de la convocatoria (User Story 2, escenario 5) — el otro integrante del par queda como jugador individual.
- Deshacer manualmente un vínculo (FR-006) quita ese par puntual de `m.duplas`, sin tocar `convocados`.

### Unidad de convocatoria (vista derivada, no persistida)

Calculada en memoria por `getUnidadesConvocatoria(m)` a partir de `m.convocados` (orden existente) + `m.duplas`. No se guarda en Firestore — se recalcula en cada render/generación.

| Campo | Tipo | Descripción |
|---|---|---|
| `ids` | `Array<string>` | `[id]` para un jugador individual, o `[idA, idB]` para una dupla. |

**Regla de posición** (implementa la clarificación de sesión 2026-08-17): recorriendo `m.convocados` en orden, una unidad-dupla se emite en la posición del **primero** de sus dos ids que aparece en el array; la segunda aparición se omite. Un id sin vínculo se emite como unidad individual en su propia posición. Esto es lo único que determina cuántas "vacantes" ocupa cada unidad — no hay un campo de posición separado que persistir.

`getTitularIds(m)` (existente) pasa a definirse como `getUnidadesConvocatoria(m).slice(0, titularesRequeridos(m)).flatMap(u => u.ids)` — sigue devolviendo una lista plana de ids de Jugador reales; el resto del código que solo pregunta "¿es titular este id?" no cambia.

**Representación en la interfaz (FR-016)**: `renderConvocadosList` recorre directamente `getUnidadesConvocatoria(m)` y renderiza un único `.conv-row` por unidad — una unidad-dupla ocupa un solo renglón (los dos nombres apilados dentro de un recuadro), no dos filas separadas con una referencia cruzada. Ver `research.md` #9.

### Unidad de armado (vista derivada, consumida solo por el motor de generación)

Objeto sintético con la misma forma que un Jugador (`{id, principal, secundarias, scores}`), construido solo para la duración de una llamada a `window.__generarEquipos`, a partir de una unidad de convocatoria:

| Campo | Origen |
|---|---|
| `id` | Jugador individual → su propio id. Dupla → id sintético (no persistido), p. ej. `idA+'+'+idB`. |
| `scores` | Jugador individual → sus propios `scores`. Dupla → valor combinado de FR-008 (promedio de promedios si ambos tienen puntaje; el del único que tiene, si solo uno; ausente si ninguno). |
| `principal`/`secundarias` | Jugador individual → sin cambios. Dupla → mejor combinación entre las posiciones principales de ambos integrantes (secundarias solo si corrigen una imparidad), mismo criterio que ya usa el motor para un jugador individual. |
| `_duplaIds` | Solo presente en unidades-dupla: `[idA, idB]`, usado al momento de asignar la unidad a un equipo para empujar ambos ids reales a `equipos.blanco`/`negro` (nunca el id sintético). |

**Representación en la interfaz (FR-016)**: dentro del roster de un equipo ya generado, `renderTeamsSection` agrupa (`agruparFilasDeEquipo`) a los dos integrantes de una dupla en un único renglón (`renderTeamPlayerRowDupla`) — comparten posición asignada y candado (siempre van juntos), pero cada uno mantiene su propio puntaje y, en la carga de resultado, sus propios campos de goles/asistencias (FR-014). Ver `research.md` #9.

## Entidades existentes afectadas

### Partido

Sin cambios en los campos ya documentados por `001-organizacion-partidos`/`003-motor-generacion-equipos`, más el campo nuevo `duplas` (ver arriba). Efectos indirectos sobre campos existentes:

- `convocados`: **sin cambios de forma** (sigue siendo un array plano de ids de Jugador, orden = orden de anotación). Su interpretación para calcular titulares/suplentes ahora pasa por `getUnidadesConvocatoria` (ver arriba) en vez de operar directo sobre el array.
- `bloqueados`: sin cambios de forma; `window.__toggleBloqueo` ahora puede agregar/quitar dos ids en la misma llamada cuando el jugador bloqueado integra una dupla (FR-012).
- `equipos.blanco` / `equipos.negro`: **sin cambios de forma** — siguen siendo arrays planos de ids de Jugador reales. El motor calcula el balance por unidad (individual o dupla) pero siempre escribe los ids reales de ambos integrantes por separado, nunca un id combinado (ver "Unidad de armado" arriba) — esto es lo que mantiene FR-013/FR-014 sin cambios en el resto del código.
- `equipos.duplasSnapshot` (campo nuevo, junto a `equipos.titularesSnapshot`): forma canónica de `m.duplas` en el momento de la última generación (`canonicalDuplas(m)`). Necesario porque crear/deshacer una dupla puede no cambiar el *conjunto* de ids titulares (si no hay ningún suplente para promover), pero sí cambia el *agrupamiento* — sin este campo, `equiposStale` no detectaba ese caso (bug encontrado y corregido durante la validación en staging, ver `research.md` #7).
- `resultado.statsPorJugador`: sin cambios de forma (`{ [jugadorId]: { goles, asistencias } }`) — cada integrante de una dupla ya tiene su propia entrada, sin marcador adicional de participación real (FR-013).

### Jugador

Sin cambios de forma. No se le agrega ningún campo relacionado a duplas — el vínculo vive enteramente en el Partido (FR-003).

## Resumen de acceso

No se agrega ninguna colección ni documento nuevo, por lo que no hay cambios en la tabla de acceso de `007-permisos-por-usuario/data-model.md`. El campo `duplas` hereda exactamente el acceso ya vigente de `data/partidos`:

| Documento | Lectura | Escritura |
|---|---|---|
| `data/partidos` (incluye ahora el campo `duplas`) | admin, jugador | admin, jugador\* |

\* La restricción fina de FR-006 (un "jugador" solo deshace duplas propias) se valida en la función `window.__deshacerDupla`, no en las reglas de Firestore — mismo límite ya documentado y aceptado en `007-permisos-por-usuario/research.md` #3 para la baja de convocatoria.
