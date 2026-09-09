# Research: Duplas de rotación entre jugadores

## 1. Dónde persistir el vínculo de dupla

**Decisión**: agregar un campo `duplas` (array de pares de ids: `[[idA, idB], ...]`) dentro de cada objeto Partido, en el mismo documento blob `data/partidos` que ya guarda `convocados` y `bloqueados`.

- El vínculo es específico de un partido (FR-003), así que vive naturalmente dentro del objeto Partido, no en una colección global.
- `data/partidos` ya permite lectura/escritura a "admin" y "jugador" (regla heredada de `007-permisos-por-usuario/contracts/firestore-rules.md`) — exactamente el alcance que pide FR-001b (ambos roles pueden crear un vínculo). No hace falta ninguna regla nueva de Firestore.
- La restricción fina de FR-006 ("jugador" solo deshace duplas propias) queda al mismo nivel de confianza que la baja de convocatoria hoy (`__removeFromMatch`): validada en la función `window.__*` correspondiente, no en las reglas — mismo límite ya documentado y aceptado en `007-permisos-por-usuario/research.md` #3 (Firestore no puede distinguir, dentro de un único string JSON, "cambié solo mi propia dupla" de "cambié la de otro").

**Alternativas consideradas**:
- *Documento nuevo `data/duplasPorPartido`* (paralelo a `partidosArmado`): innecesario, porque a diferencia de `partidosArmado` (que separa datos admin-only), el vínculo de dupla no tiene una restricción de lectura distinta a la del resto de `partidos` — ambos roles necesitan verlo y (con matices) escribirlo. Agregar un documento nuevo solo suma una llamada de red y una clave de `window.storage` más, sin ganar nada (Principio II).
- *Relación global entre dos Jugadores* (campo en `data/players`): se descarta directamente por FR-003 (el vínculo no es permanente entre los dos jugadores, es por partido).

## 2. Cómo afecta la dupla al orden de titulares/suplentes sin migrar `convocados`

**Contexto clave**: hoy no existe una función de "promoción" — todo se deriva en el momento de `convocados` (array plano de ids, orden = orden de anotación) vía `getTitularIds(m) = m.convocados.slice(0, titularesRequeridos(m))`. Decenas de funciones (`__addToMatch`, `__removeFromMatch`, autocomplete, render de listas) asumen que cada entrada de `convocados` es un id de jugador suelto.

**Decisión**: no tocar la forma de `convocados`. En su lugar, agregar una función pura nueva `getUnidadesConvocatoria(m)` que combina `m.convocados` (orden ya existente) con `m.duplas` para producir una lista ordenada de "unidades": cada unidad es `{ ids: [id] }` (jugador individual) o `{ ids: [idA, idB] }` (dupla), en el siguiente orden:

1. Recorrer `m.convocados` en orden.
2. Al encontrar el **primer** id de un par vinculado en `m.duplas`, emitir ahí mismo la unidad combinada (`{ids: [idA, idB]}`) y no volver a emitirla cuando se llegue al segundo id.
3. Cualquier id no vinculado se emite como unidad individual, en su posición actual.

Esto implementa exactamente la clarificación de `/speckit-clarify` (sesión 2026-08-17): la unidad combinada queda ubicada en la posición **más temprana** de sus dos integrantes dentro de la cola, sin mover ni reescribir nada en `convocados` — es un efecto emergente de recorrer el array en orden y colapsar la segunda aparición. La posición del integrante más tardío simplemente deja de "contar" como una entrada propia, igual que si hubiera dejado la cola (mismo comportamiento que ya describe FR-004b).

`getTitularIds(m)` pasa a ser `getUnidadesConvocatoria(m).slice(0, titularesRequeridos(m)).flatMap(u => u.ids)` — sigue devolviendo una lista plana de ids (todo el código que solo necesita "¿es titular este id?" sigue funcionando sin cambios), pero ahora una unidad-dupla aporta sus dos ids a cambio de ocupar un solo lugar en el `slice`. El resto de las funciones de conteo (`titularesRequeridos`, banner de "equipos desactualizados", etc.) no cambian.

**Alternativas consideradas**:
- *Reordenar físicamente `convocados` para que los dos integrantes de una dupla queden adyacentes*: se descarta porque mutaría el historial de orden de anotación (usado también fuera del contexto de duplas, p. ej. para decidir quién fue "primero" en otros cálculos) y porque deshacer la dupla más adelante requeriría "recordar" la posición original de cada integrante — la vista derivada evita ese problema por construcción, ya que nunca deja de leer el orden real de `convocados`.
- *Guardar la posición de la unidad como un número aparte*: redundante y propenso a desincronizarse; la posición ya se puede derivar en cada lectura a partir de datos existentes (Principio II).

## 3. Cómo trata el motor de generación a una dupla como unidad (FR-007/FR-008/FR-009)

**Contexto clave**: `generarEquiposEstrategia1`/`generarEquiposEstrategia2`/`resolverArqueros` (index.html:1372-1620) consumen hoy una lista de objetos Jugador reales (`{id, principal, secundarias, scores}`), leyendo `p.scores`/`p.principal`/`p.secundarias` directamente.

**Decisión**: antes de invocar cualquiera de las dos estrategias, `window.__generarEquipos` construye una lista de **"unidades de armado"** a partir de `getUnidadesConvocatoria(m)` (misma función de la sección 2) y de los objetos Jugador reales:

- Unidad individual → se pasa el objeto Jugador real, sin cambios (comportamiento actual, cero regresión para partidos sin duplas).
- Unidad-dupla `{ids: [idA, idB]}` → se construye un objeto candidato sintético `{id: idA+'+'+idB, _duplaIds: [idA, idB], principal, secundarias, scores}` donde:
  - `scores` (para Estrategia 1) es el valor combinado de FR-008: promedio de los promedios de ambos si los dos tienen puntaje cargado; el puntaje del único integrante con carga si solo uno tiene; ausente (unidad "sin puntaje") si ninguno tiene — calculado una vez y expuesto como si fuera el `scores` de un jugador individual, para que `valorDe`/`computeAvg` no necesiten distinguir unidades de jugadores reales.
  - `principal`/`secundarias` (para Estrategia 2) se resuelven evaluando ambas posiciones principales de los integrantes como candidatas (agregando secundarias solo si corrigen una imparidad), reutilizando el mismo criterio de selección que ya usa el motor para un jugador individual — la unidad expone la combinación elegida como si fuera su propio `principal`/`secundarias`.
- `resolverArqueros` recibe estas unidades igual que hoy recibe jugadores: si ambos integrantes de una dupla son arqueros naturales, la unidad ya llega con `principal: 'Arquero'` y se resuelve como **un único candidato** (FR-009), nunca como dos.
- Al asignar la unidad a un equipo, el código de asignación empuja **ambos** `_duplaIds` al array `blanco`/`negro` correspondiente (en vez del único `id` sintético) — así `m.equipos.blanco`/`negro` siguen siendo, como hoy, arrays planos de ids de Jugador reales, sin necesidad de que el resto del código (render de equipos, carga de resultado, `recomputeAllPlayerStatsFromMatches`) sepa nada sobre duplas. Esto es lo que mantiene gratis FR-013/FR-014 (estadísticas y carga de goles/asistencias por integrante, sin marcador adicional).

**Alternativas consideradas**:
- *Ejecutar el motor sobre ids individuales y "pegar" la dupla al mismo equipo después, como paso de post-procesamiento*: se descarta porque el balance de puntaje/posición debe calcularse con el valor combinado de FR-008 **antes** de decidir a qué equipo va cada unidad — corregir después (mover al segundo integrante a la fuerza) rompería el balance ya calculado y contradice FR-008 ("nunca como la suma de sus valores individuales").
- *Duplicar las funciones de estrategia para que reciban explícitamente unidades en vez de jugadores*: se descarta porque el objeto sintético con la misma forma que un Jugador permite reusar `valorDe`/`puntajeEnPosicion`/`resolverArqueros` sin ninguna rama nueva basada en "es dupla o no" dentro de esas funciones — cumple mejor el Principio IV (el motor no necesita saber qué es una dupla, solo qué es un candidato con `scores`/`principal`/`secundarias`).

## 4. Cómo la edición manual (drag & drop, candado) y la baja de convocatoria respetan a la dupla (FR-011/FR-012, FR-002, User Story 2)

**Decisión**: en los cuatro puntos de entrada existentes que hoy operan sobre un único id, se agrega una resolución de partner vía `m.duplas` al principio de la función, antes de la lógica actual (que no cambia):

- `window.__moverJugadorManual(matchId, playerId, targetTeam)` (index.html:1888): si `playerId` tiene partner de dupla, mueve también al partner al mismo `targetTeam` (FR-011).
- `window.__toggleBloqueo(matchId, playerId)` (index.html:1865): si `playerId` tiene partner, aplica el mismo toggle (agregar/quitar de `bloqueados`) a ambos ids en la misma llamada (FR-012).
- `window.__removeFromMatch(matchId, playerId)` (index.html:2395): al dar de baja a un integrante de una dupla, además de quitarlo de `convocados` (comportamiento actual, sin cambios), se quita el par correspondiente de `m.duplas` (User Story 2, escenario 5) — el que queda vuelve a contarse como unidad individual la próxima vez que se calcule `getUnidadesConvocatoria`, sin ningún paso adicional.
- Autocomplete/buscador (FR-001, FR-002): la función de filtrado de candidatos (hoy `renderAutocomplete`, restringida a no-convocados) se generaliza para el buscador de "Agregar rotación" para incluir también convocados, excluyendo siempre al propio jugador de la fila y a cualquier id que ya aparezca en algún par de `m.duplas` — esto implementa la exclusividad 1 a 1 de FR-002 ocultando la opción, no bloqueando un intento.

**Alternativas consideradas**: ninguna — es la extensión mínima de cada función existente, sin introducir una capa nueva de indirección (a diferencia de la sección 2/3, acá no hace falta una vista derivada porque cada acción ya recibe un `playerId` puntual y solo necesita resolver su partner, operación O(1) sobre `m.duplas`).

## 5. Permisos para crear/deshacer un vínculo (FR-001b/FR-006/FR-006b)

**Decisión**: reutilizar exactamente los dos patrones ya establecidos en `007-permisos-por-usuario`:

- **Crear vínculo** (`window.__vincularDupla`): sin restricción de rol más allá de estar logueado — mismo criterio que `__addToMatch` (index.html:2385), que hoy permite a cualquier "jugador" anotar a cualquier otro. Implementa FR-001b directamente (no hace falta lógica nueva, solo *no* agregar el chequeo `playerId === session.jugadorId` que sí tienen otras acciones).
- **Deshacer vínculo** (`window.__deshacerDupla`): mismo gate que `__removeFromMatch` (index.html:2397): `if(!isAdmin() && idA !== session.jugadorId && idB !== session.jugadorId) return;`. Implementa FR-006/FR-006c (admin deshace cualquiera; "jugador" solo si es uno de los dos integrantes).
- **Visibilidad del control de deshacer** (FR-006b): mismo patrón de ocultamiento ya usado en `renderConvocadosList` (index.html:2352) para "Quitar del partido" — el botón/indicador de deshacer directamente no se renderiza (no aparece deshabilitado) cuando el usuario "jugador" no es ninguno de los dos integrantes.

**Alternativas consideradas**: ninguna — son los mismos dos patrones de permisos que ya usa toda la convocatoria; introducir una regla distinta rompería la consistencia que pide el Principio IV y no la pide ningún FR.

## 6. Por qué FR-013/FR-014 (estadísticas y carga de resultado por integrante) no requieren cambios en la UI de resultado

Confirmado por lectura de `renderTeamPlayerRow`/`ensureResultadoDraft`/`recomputeAllPlayerStatsFromMatches` (index.html:1696-1863, 933-965): ambos ya operan por id individual dentro de `m.equipos.blanco`/`negro`. Como la sección 3 de este documento decide que el motor siga emitiendo ids individuales (nunca un id combinado) en `blanco`/`negro`, la carga de goles/asistencias y el cálculo de estadísticas acumuladas por jugador **ya funcionan sin ningún cambio** en cuanto ambos integrantes de una dupla aparezcan como dos entradas separadas en el equipo generado. No se agrega código nuevo para FR-013/FR-014 — se documenta acá para que `tasks.md` no genere una tarea innecesaria.

## 7. FR-015 (aviso de "equipos desactualizados") — hipótesis inicial y corrección tras validar en staging

**Hipótesis inicial** (antes de probar contra datos reales): `equiposStale(m)` (index.html) compara la lista ordenada de titulares actuales (`getTitularIds(m)`, ya rediseñada en la sección 2 para considerar duplas) contra `m.equipos.titularesSnapshot` (capturado en la última generación); se asumió que deshacer una dupla siempre cambia ese conjunto de ids, sin código nuevo.

**Bug encontrado al validar en `organizador-futbol-staging`**: cuando deshacer una dupla no libera ninguna vacante para un suplente (porque no hay ninguno esperando), el **conjunto** de ids titulares no cambia — solo cambia el *agrupamiento* entre ellos — y `equiposStale` no lo detectaba, dejando el aviso sin mostrarse en ese caso puntual.

**Corrección**: se agregó `canonicalDuplas(m)` (forma canónica de `m.duplas`, ordenando cada par y la lista de pares) y un campo `duplasSnapshot` en `m.equipos` (capturado en `__generarEquipos`, mismo criterio que `titularesSnapshot`); `equiposStale` ahora también compara `duplasSnapshot` contra el estado actual y marca `stale` si el agrupamiento cambió, aunque el conjunto de ids titulares sea idéntico. Revalidado en staging: el aviso aparece correctamente en ese caso.

## 8. Corrección encontrada en staging: `saveMatches()` intentaba escribir `partidosArmado` sin importar el rol

Al validar con sesión "jugador" (creación de dupla, baja de convocatoria) sobre un partido con equipos ya generados, apareció un error de consola de Firestore (`Missing or insufficient permissions`) al guardar: `saveMatches()` (heredada de `007-permisos-por-usuario`) siempre intenta escribir tanto `data/partidos` como `data/partidosArmado`, pero las reglas de Firestore restringen la escritura de `partidosArmado` a `admin` — "jugador" nunca debería ni intentarlo, porque nunca cambia esos datos. La escritura de `data/partidos` (con la dupla) se confirmó que persiste igual, ya que ocurre en un `await` separado y anterior; el error solo afectaba a `partidosArmado`, sin pérdida de datos, pero generaba ruido en cada acción de "jugador" sobre un partido con equipos generados (no solo duplas — también, por ejemplo, la baja de convocatoria ya existente). Se corrigió agregando `if(isAdmin())` antes de ese segundo `await`, sin tocar la separación de documentos ya decidida en `007-permisos-por-usuario`.

## 9. Agrupar visualmente a la dupla en un único renglón (convocatoria y equipo generado)

**Decisión**: por pedido explícito del usuario durante la validación, los dos integrantes de una dupla se muestran agrupados en **un solo renglón** (uno arriba, otro abajo, dentro de un recuadro) en la lista de convocatoria y en el roster del equipo generado (FR-016), en vez de dos filas independientes con una referencia cruzada (que fue el primer diseño probado). En la carga de goles/asistencias, ese mismo renglón agrupado conserva un campo propio por integrante (FR-014).

- **Convocatoria**: se pasó de recorrer `m.convocados` (ids sueltos) a recorrer `getUnidadesConvocatoria(m)` directamente, renderizando un único `.conv-row` por unidad (individual o dupla) — más simple que el diseño anterior (dos filas + tag), porque la numeración y el badge Titular/Suplente ya se calculan una vez por unidad en vez de una vez por id.
- **Equipo generado**: como `resolverArqueros`/`generarEquiposEstrategiaN` ya dejan a ambos integrantes de una dupla **adyacentes** en `blanco`/`negro` (los agrega juntos `expandirUnidadesEnResultado`, sección 3) y `ordenarPorPosicion` es un sort estable sobre esa misma lista, ambos siguen adyacentes después de ordenar por posición — alcanza con un agrupamiento simple sobre la lista ya ordenada (`agruparFilasDeEquipo`: si el siguiente elemento es el partner de dupla del actual, van juntos; si no, cada uno queda en su propia fila), sin necesitar volver a calcular unidades desde cero en esta capa de render.
- **Ícono de la dupla**: las imágenes provistas por el usuario (fondo blanco opaco) se procesaron para dejar solo el trazo sobre fondo transparente (se descartó además una sombra difusa que cubría casi toda la imagen a baja opacidad, ilegible en miniatura). Sobre el panel "Equipo Negro" (fondo oscuro) se invierte a blanco vía CSS (`filter: brightness(0) invert(1)`) — mismo mecanismo que ya usa `.icon-boot` en ese panel, en vez de generar un segundo archivo de imagen con trazo claro.

**Alternativas consideradas**: el primer diseño (dos filas + un tag "🔁 nombre del compañero" + botón de deshacer en la fila de cada integrante) funcionaba, pero no comunicaba tan claramente que ambos ocupan una sola vacante/lugar — se descartó a pedido del usuario a favor del renglón agrupado.
