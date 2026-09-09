# Feature Specification: El puntaje de una dupla depende de la posición que ocupa

**Feature Branch**: `014-puntaje-dupla-por-posicion`

**Created**: 2026-08-19

**Status**: Implementada (2026-08-19). Verificada con `node tests/motor.test.js`: sus 7 casos pasaron al bloque BASELINE (valor por posición, integrante único puntuado, dupla sin ningún puntaje, no-regresión de la Estrategia 1, y los tres del panel). Sobre el partido testigo el armado pasó de 50.8/51.3 a 50.5/51.0, con la misma diferencia de 0.5: las dos duplas juegan de Volante y ahora valen sus notas de Volante (5.5 y 6.0) en vez del promedio de sus promedios (5.8 y 6.3). Falta la verificación visual en el navegador de la leyenda por integrante (FR-012).

**Depends on**: `011-encaje-optimo-formacion` (saca el encaje posicional de la dimensión del puntaje; sin eso, esta feature reintroduce el problema que se describe abajo)

**Input**: Zona gris detectada al analizar el partido testigo: la dupla vale lo mismo en un puesto que cubren los dos integrantes que en uno que no cubre ninguno.

## Contexto

El motor representa a una dupla de rotación como una sola unidad con **un único valor, el mismo en las cuatro posiciones**: el promedio de los promedios generales de sus dos integrantes. En el partido testigo, la dupla Claudio (Defensor 6, Volante 5) + Juan (Volante 6) vale 5.8 en Arquero, en Defensor, en Volante y en Delantero por igual.

Eso tiene dos consecuencias:

1. **El valor no usa la información que sí existe.** Los dos integrantes tienen nota de Volante cargada (5 y 6). Si la dupla juega de Volante, lo honesto es valerla por esas notas (5.5) y no por un promedio que mezcla las notas de todas las posiciones.
2. **Mover una dupla de puesto es gratis para el balance.** Como vale lo mismo en todos lados, el motor puede reubicarla sin que la suma de su equipo cambie, y eso hace que sea la pieza más barata de tirar dentro de un hueco.

La consecuencia 2 fue la que causó el problema del partido testigo. **Pero no se arregla acá**: se arregla en `011-encaje-optimo-formacion`, que saca el encaje posicional de la dimensión del puntaje y lo decide con las posiciones declaradas. Esta feature es la otra mitad: que el número también sea correcto.

El orden importa. Si se cambia la fórmula **antes** de `011`, se vuelve al problema que ya descartamos: cualquier intento de que el puntaje exprese encaje degenera (el promedio premia posiciones que nadie cubre, el mínimo de las notas no penaliza a quien tiene una sola nota cargada, el cero castiga de más). Con `011` implementada, el encaje ya está resuelto por otra vía y el puntaje puede dedicarse solo a estimar cuánto aporta la dupla.

## Clarifications

### Session 2026-08-19

- Q: ¿Cuál es la fórmula? → A: El valor de la dupla en una posición es el promedio de lo que aporta cada integrante en esa posición, y a un integrante que no tiene nota cargada ahí se lo representa con su promedio general. Ejemplo: en Defensor, `(nota de Defensor de Claudio + promedio general de Juan) / 2`.
- Q: ¿Por qué el promedio general y no cero, o la nota más baja? → A: Porque cero miente (un volante fuera de puesto no vale cero) y la nota más baja no penaliza nada cuando el jugador tiene una sola nota cargada, que es el caso más común del plantel. El promedio general es el estimador honesto de "cuánto rinde esta persona" y no requiere calibrar ningún factor nuevo.
- Q: ¿Qué pasa en una posición donde ninguno de los dos tiene nota? → A: La fórmula colapsa a `(promedio general de A + promedio general de B) / 2`, que es exactamente el valor actual. O sea: el valor de hoy pasa a ser el caso degenerado de la fórmula nueva, y no hace falta ninguna regla aparte.
- Q: En esa posición que ninguno cubre, ¿el panel muestra "sin puntaje"? → A: La columna de puntajes muestra el número obtenido (el promedio de los promedios generales de ambos), nunca vacío. La leyenda "sin puntaje" se sigue mostrando al lado del nombre de cada integrante que no tiene nota cargada para esa posición, como aclaración de por qué el número sale de su promedio general. O sea: número en la columna, leyenda al lado del nombre.
- Q: ¿Esa posición queda "premiada" (vale igual que una cubierta)? → A: Puede pasar, y por eso esta feature depende de `011`. El encaje lo decide la dimensión de encaje, con las posiciones declaradas: el motor no va a poner a la dupla en una posición que no cubre si existe alguna alternativa, sin importar cuánto valga ahí.
- Q: ¿Aplica a la Estrategia 1? → A: No. La Estrategia 1 no mira posiciones, así que ahí la dupla se sigue valuando con el promedio de los promedios generales, como define `008-duplas-rotacion` FR-008. Esta feature aplica a las Estrategias 2 y 3, que sí puntúan por posición.
- Q: ¿Cambia el valor de un jugador individual fuera de su posición? → A: No. Sigue valiendo lo que vale hoy. Es una zona gris aparte y no hace falta tocarla para esta feature.
- Q: ¿Esto cambia los equipos que se venían generando? → A: Sí, en partidos con duplas y Estrategias 2 o 3. Es un cambio de comportamiento buscado: el valor pasa a ser más preciso.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Que la dupla valga lo que realmente aporta en el puesto que juega (Priority: P1)

Un "admin" genera equipos con Estrategia 2 o 3 en un partido con duplas. El puntaje con el que el motor pesa a cada dupla refleja el puesto que efectivamente le tocó, usando las notas que sus integrantes tienen cargadas para ese puesto.

**Why this priority**: Es la feature. Sin esto, el motor equilibra usando un número que ignora información que ya está cargada en las fichas.

**Independent Test**: Con una dupla cuyos integrantes tienen notas distintas por posición, generar equipos y verificar que el valor usado para la dupla cambia según la posición que le tocó.

**Acceptance Scenarios**:

1. **Given** una dupla en la que los dos integrantes tienen nota cargada para la posición asignada, **When** se generan equipos con Estrategia 2 o 3, **Then** el valor de la dupla es el promedio de esas dos notas.
2. **Given** una dupla en la que solo uno de los dos tiene nota para la posición asignada, **When** se generan equipos, **Then** el valor es el promedio entre esa nota y el promedio general del otro integrante.
3. **Given** una dupla en la que ninguno de los dos tiene nota para la posición asignada, **When** se generan equipos, **Then** el valor es el promedio de los promedios generales de ambos, igual que antes de esta feature.
4. **Given** una dupla en la que ninguno de los dos tiene ninguna nota cargada, **When** se generan equipos, **Then** la unidad se sigue tratando como "sin puntaje" (`008-duplas-rotacion`, FR-008).
5. **Given** una dupla y Estrategia 1 seleccionada, **When** se generan equipos, **Then** el valor sigue siendo el promedio de los promedios generales (la Estrategia 1 no mira posiciones).
6. **Given** un partido sin duplas, **When** se generan equipos con cualquier estrategia, **Then** el armado es idéntico al de antes de esta feature.

---

### User Story 2 - Que el panel muestre el valor que corresponde a ese puesto (Priority: P2)

El "admin" ve en el panel el puntaje de la dupla para la posición en la que quedó, y ese número sigue explicando el total del equipo.

**Why this priority**: Es la consecuencia visible. No requiere trabajo propio si `012-puntajes-coherentes-panel` ya está implementada — el panel muestra el valor de la unidad, que ahora es otro número.

**Independent Test**: Generar equipos y comprobar que la suma de los puntajes visibles sigue coincidiendo con el total del equipo.

**Acceptance Scenarios**:

1. **Given** una dupla en el panel, **When** el "admin" mira su puntaje, **Then** ve el valor que el motor usó para la posición asignada.
2. **Given** cualquier equipo generado, **When** el "admin" suma los puntajes visibles, **Then** coincide con el total mostrado.
3. **Given** una dupla ubicada en una posición que ninguno de sus integrantes tiene cargada, **When** el "admin" mira el panel, **Then** la columna de puntajes muestra el número calculado (el promedio de los promedios generales de ambos) y la leyenda "sin puntaje" aparece al lado del nombre de cada integrante.
4. **Given** una dupla en la que solo uno de los dos tiene nota para la posición asignada, **When** el "admin" mira el panel, **Then** la columna muestra el valor de la unidad y la leyenda "sin puntaje" aparece solo al lado del nombre del integrante que no tiene esa nota cargada.

---

### Edge Cases

- **Posición Arquero**: la fórmula aplica igual, pero **no** cambia cómo se elige el arquero. Si solo uno de los dos integrantes ataja, la unidad sigue sin considerarse arquero natural (`008-duplas-rotacion`, FR-009).
- **Un integrante sin ninguna nota**: su aporte se representa con el promedio general del otro (no hay promedio general propio que usar), de modo que la unidad vale lo que vale el integrante puntuado, como ya define `008` FR-008.
- **Redondeo**: el valor se expresa con un decimal, igual que el resto de los puntajes.
- **Equipos ya generados**: no se recalculan. Al regenerar, el resultado puede cambiar; el aviso de equipos desactualizados ya cubre los cambios de configuración, pero **este cambio es de código, no de configuración**, así que los equipos guardados no se marcan como desactualizados automáticamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: En las Estrategias 2 y 3, el sistema MUST calcular el valor de una dupla de rotación en una posición como el promedio del aporte de cada integrante en esa posición.
- **FR-002**: El aporte de un integrante en una posición MUST ser su nota cargada para esa posición si existe, y su promedio general si no la tiene cargada.
- **FR-003**: Cuando ninguno de los dos integrantes tiene nota cargada para esa posición, el valor resultante MUST coincidir con el que produce la fórmula vigente hoy (promedio de los promedios generales).
- **FR-004**: Cuando ninguno de los dos integrantes tiene ninguna nota cargada, la unidad MUST seguir tratándose como "sin puntaje".
- **FR-005**: Cuando solo uno de los dos integrantes tiene alguna nota cargada, el valor de la unidad MUST ser el de ese integrante (`008-duplas-rotacion`, FR-008).
- **FR-006**: En la Estrategia 1 el valor de la dupla MUST seguir siendo el promedio de los promedios generales de sus integrantes.
- **FR-007**: El sistema MUST NOT cambiar el valor de un jugador individual en una posición que no tiene cargada.
- **FR-008**: El sistema MUST NOT usar el puntaje de una dupla para decidir en qué posición la ubica; esa decisión sigue siendo la de encaje, con las posiciones declaradas (`011-encaje-optimo-formacion`).
- **FR-009**: El sistema MUST NOT cambiar cómo se elige el arquero de cada equipo.
- **FR-010**: El valor de la dupla MUST expresarse con un decimal, igual que el resto de los puntajes.
- **FR-011**: Siempre que la unidad tenga un valor calculable, la columna de puntajes del panel MUST mostrar ese número, incluso cuando sale del promedio de los promedios generales porque ninguno de los dos integrantes tiene nota para esa posición; la columna MUST quedar en "sin puntaje" únicamente cuando ningún integrante tiene ninguna nota cargada (FR-004).
- **FR-012**: La leyenda "sin puntaje" MUST seguir mostrándose al lado del nombre de cada integrante que no tiene nota cargada para la posición asignada, como aclaración de que su aporte se estimó con su promedio general. Es una marca por jugador y no reemplaza al número de la columna ni altera los contadores de "sin puntaje", que siguen contando unidades de armado (`012-puntajes-coherentes-panel`).

### Enmiendas a specs vigentes

- **`008-duplas-rotacion`, FR-008**: hoy define el valor de la dupla para la Estrategia 1 (promedio de promedios) y describe la Estrategia 2 en términos de candidatos de posición. Debe incorporar el valor por posición para las Estrategias 2 y 3 según FR-001/FR-002 de esta feature, conservando el promedio de promedios para la Estrategia 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para una dupla cuyos dos integrantes tienen notas cargadas en la posición que juegan, el valor que usa el motor es el promedio de esas dos notas y no el promedio de sus promedios generales.
- **SC-002**: El valor de una dupla en una posición que ninguno de los dos cubre con nota cargada es el mismo que producía el motor antes de esta feature.
- **SC-003**: Los partidos sin duplas producen exactamente los mismos equipos que antes de esta feature.
- **SC-004**: Los partidos con duplas armados con Estrategia 1 producen exactamente los mismos equipos que antes de esta feature.
- **SC-005**: Ninguna dupla queda ubicada en una posición que no cubre por efecto de su puntaje (garantía que aporta `011`, verificada acá también).

## Assumptions

- `011-encaje-optimo-formacion` está implementada, así que el encaje posicional no depende del puntaje y esta feature no puede volver a introducir el problema del partido testigo.
- Las notas por posición cargadas en las fichas son la mejor información disponible sobre cuánto rinde cada jugador en cada puesto.
- El promedio general de un jugador es una estimación aceptable de su aporte en un puesto que no tiene cargado; no se busca precisión mayor y no se agrega ningún factor de penalización.
- La cantidad de duplas por partido es chica, así que recalcular el valor por posición no tiene costo relevante.

## Fuera de Alcance

- Cambiar cuánto vale un jugador individual fuera de su posición (hoy cero en las Estrategias 2 y 3). Es una zona gris propia, con mucho más impacto: cambiaría el armado de todos los partidos, con o sin duplas.
- Ponerle un número a la ventaja de frescura que da rotar (se administra repartiendo las duplas parejo, ver `011` y `013`).
- Cambiar cómo se decide en qué posición juega cada unidad.
