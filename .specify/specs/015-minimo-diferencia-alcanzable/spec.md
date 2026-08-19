# Feature Specification: Informar el mínimo de diferencia alcanzable en vez de sugerir algo que no sirve

**Feature Branch**: `015-minimo-diferencia-alcanzable`

**Created**: 2026-08-19

**Status**: Draft

**Depends on**: `009-ventaja-sin-arquero` (define el objetivo de diferencia) y `011-encaje-optimo-formacion` (hace que el reparto ya sea el mejor posible, que es lo que vuelve barata esta feature)

**Input**: Zona gris detectada al analizar el partido testigo: el objetivo configurado era matemáticamente inalcanzable y el panel sugería bloquear jugadores y regenerar, algo que no podía servir.

## Contexto

Cuando el armado supera la "Diferencia aceptable" configurada, el panel avisa y sugiere: *"Probá bloquear jugadores clave y regenerar, o revisá la config del motor."*

En el partido testigo, la diferencia fue 0.5 con un objetivo de 0. Verificado sobre ese plantel: **0.5 era el mínimo posible**, incluso permitiendo asignaciones de posición peores. No existía ningún armado con diferencia 0. O sea que el consejo del panel era imposible de cumplir: bloquear y regenerar no iba a bajar de 0.5 nunca, y el "revisá la config" tampoco resolvía nada porque el problema no era la config sino el plantel.

Un aviso que pide una acción que no puede funcionar es peor que no avisar: manda al usuario a perder tiempo y le hace perder confianza en el motor.

Con `011-encaje-optimo-formacion` implementada esto se resuelve casi sin trabajo: el reparto de equipos ya busca el mejor resultado posible dado el encaje y las restricciones, así que **el número que el motor logró ya es el mínimo alcanzable**. Lo único que falta es decirlo, en lugar de sugerir una acción inútil.

## Clarifications

### Session 2026-08-19

- Q: ¿Mínimo respecto de qué, exactamente? → A: El mínimo desvío respecto del objetivo de diferencia, con esos titulares, respetando la formación, los bloqueos y el reparto de duplas. No es el mínimo absoluto sobre todas las asignaciones de posición imaginables: si se aceptara romper la formación podría existir un número más chico. El aviso tiene que ser preciso en eso, no prometer más de lo que garantiza.
- Q: ¿Hay que calcular algo nuevo? → A: No, si `011` ya está implementada: el reparto llega al mejor resultado posible bajo esas restricciones, así que el mínimo es el valor logrado. Esta feature es sobre qué se informa, no sobre cómo se arma.
- Q: ¿Y si `011` no está implementada? → A: No se puede afirmar que el valor logrado sea el mínimo, porque el reparto de hoy es heurístico. Por eso esta feature depende de `011`: sin ella el mensaje sería una afirmación que el motor no puede sostener.
- Q: ¿Se elimina la sugerencia de bloquear y regenerar? → A: Se elimina cuando el motor ya está en el mínimo, porque ahí no puede servir. Si hay bloqueos activos que están limitando el resultado, sí tiene sentido sugerir revisarlos, porque soltarlos puede mejorar.
- Q: ¿Qué se muestra cuando el objetivo sí se cumple? → A: Nada nuevo. Este aviso solo aparece cuando el resultado supera la diferencia aceptable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Saber que no hay nada mejor que hacer (Priority: P1)

Un "admin" genera equipos, el resultado supera la diferencia que configuró como aceptable, y el panel le dice que ese es el mínimo posible con esos titulares. No pierde tiempo bloqueando jugadores y regenerando para obtener el mismo número.

**Why this priority**: Es la feature. El aviso actual manda a hacer algo que no puede funcionar.

**Independent Test**: Reproducir el partido testigo con diferencia aceptable 0 y verificar que el aviso informa que 0.5 es el mínimo alcanzable y no sugiere bloquear y regenerar.

**Acceptance Scenarios**:

1. **Given** un armado cuyo desvío respecto del objetivo supera la diferencia aceptable y no hay bloqueos activos, **When** el "admin" lee el resumen, **Then** el aviso informa que ese es el mínimo alcanzable con esos titulares respetando la formación, y **no** sugiere bloquear jugadores y regenerar.
2. **Given** el mismo caso pero **con** bloqueos activos, **When** el "admin" lee el resumen, **Then** el aviso informa el mínimo alcanzable **con esos bloqueos** y sí sugiere revisarlos, porque soltarlos puede mejorar el resultado.
3. **Given** un armado que cumple con la diferencia aceptable, **When** el "admin" lee el resumen, **Then** no aparece ningún aviso nuevo (nada cambia respecto de hoy).
4. **Given** un armado con una ventaja por arquero configurada, **When** el aviso aparece, **Then** habla del desvío respecto del objetivo y no de la diferencia cruda entre equipos (coherente con `009`, FR-010).
5. **Given** un armado donde la formación no se pudo completar, **When** el aviso aparece, **Then** aclara que el mínimo informado es el que corresponde a la mejor formación posible, no a cualquier reparto.

---

### Edge Cases

- **Diferencia aceptable sin configurar**: no hay aviso, igual que hoy.
- **Objetivo alcanzado exactamente**: no hay aviso.
- **Bloqueos que son la causa del desvío**: el aviso lo dice y sugiere revisarlos. Es el único caso donde una acción del usuario puede mejorar el número.
- **Equipos editados a mano**: el aviso no se recalcula sobre ediciones manuales; refleja el armado generado.
- **Plantel con jugadores sin puntaje**: el mínimo se calcula con los mismos valores que usó el motor; no se aclara nada aparte.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cuando el desvío respecto del objetivo de diferencia supere la diferencia aceptable configurada, el sistema MUST informar que el resultado logrado es el mínimo alcanzable con esos titulares, respetando la formación, los bloqueos vigentes y el reparto de duplas.
- **FR-002**: El sistema MUST NOT sugerir bloquear jugadores y regenerar cuando no haya bloqueos activos y el resultado ya sea el mínimo alcanzable, porque esa acción no puede mejorarlo.
- **FR-003**: Cuando haya bloqueos activos, el sistema MUST informar que el mínimo es relativo a esos bloqueos y MUST sugerir revisarlos.
- **FR-004**: El aviso MUST expresarse en términos del desvío respecto del objetivo de diferencia y no de la diferencia cruda entre equipos.
- **FR-005**: El aviso MUST aclarar que el mínimo informado corresponde al armado que respeta la formación, para no dar a entender que es el mínimo absoluto sobre cualquier reparto imaginable.
- **FR-006**: El sistema MUST NOT mostrar ningún aviso nuevo cuando el resultado cumple con la diferencia aceptable.
- **FR-007**: El sistema MUST NOT modificar el armado de equipos: esta feature solo cambia lo que se informa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el partido testigo con diferencia aceptable 0, el aviso informa que 0.5 es el mínimo alcanzable y no sugiere bloquear y regenerar.
- **SC-002**: Un "admin" que ve el aviso puede decidir sin probar nada si vale la pena intentar mejorar el armado o no.
- **SC-003**: Los equipos generados no cambian por efecto de esta feature.
- **SC-004**: Cuando hay bloqueos activos, el aviso los nombra como la vía posible de mejora.

## Assumptions

- `011-encaje-optimo-formacion` está implementada, así que el resultado del reparto es el mejor posible bajo las restricciones vigentes y el motor puede afirmar que es el mínimo.
- `009-ventaja-sin-arquero` está implementada, así que existe un objetivo de diferencia contra el que medir el desvío.
- No hace falta calcular el mínimo por separado ni mostrar un número que el motor no haya alcanzado: el mínimo **es** el resultado logrado.
- Al usuario le sirve más saber que no hay nada que hacer que recibir una sugerencia genérica.

## Fuera de Alcance

- Calcular el mínimo absoluto de diferencia sobre asignaciones de posición que rompan la formación, para poder decirle al usuario "si resignás la formación podés bajar a X".
- Sugerir automáticamente qué jugador convocar o desconvocar para mejorar el balance.
- Cambiar el armado o el criterio de balance.
- Mostrar el mínimo alcanzable cuando el resultado ya cumple con lo aceptable (sería ruido).
