# Feature Specification: El refinamiento final de la Estrategia 3 persigue el objetivo de diferencia

**Feature Branch**: `010-refinamiento-objetivo`

**Created**: 2026-08-19

**Status**: Draft

**Depends on**: `009-ventaja-sin-arquero` (define el objetivo de diferencia que esta feature hace respetar)

**Input**: User description: "Que el refinamiento final de la Estrategia 3 respete el objetivo de diferencia en vez de minimizar la diferencia cruda. Cierra la limitación conocida de 009."

## Contexto

La Estrategia 3 termina su armado con un paso de refinamiento: busca pares de titulares de la misma posición en equipos distintos y aplica el intercambio que más achique la diferencia de puntaje, repitiendo hasta que ninguno mejore. Ese paso es el único del motor que revisa el resultado en lugar de decidir de una sola pasada, y es el que hace que la Estrategia 3 llegue a diferencias muy chicas.

El problema es qué considera "mejor": **minimiza la diferencia cruda entre los dos equipos**, sin saber que puede existir un objetivo distinto de cero. Eso produce dos efectos hoy:

1. **Deshace la compensación por arquero.** El reparto le da al equipo sin arquero fijo una ventaja, y el refinamiento la desarma persiguiendo el empate. En un partido real reconstruido con un solo arquero, la ventaja de 6 puntos terminó convertida en una diferencia de 0.5 — la compensación quedó decorativa mientras el resumen afirmaba que se había aplicado.
2. **Con `009` implementada, la ventaja configurable no se cumple en Estrategia 3.** El usuario configura 6 puntos, el motor los aplica al repartir y el refinamiento los borra. `009` deja esa brecha visible a propósito (informa objetivo y logrado); esta feature la cierra.

En la Estrategia 2 el problema no existe porque no tiene refinamiento final: la ventaja sobrevive de punta a punta.

## Clarifications

### Session 2026-08-19

- Q: ¿El refinamiento tiene que dejar de existir o cambiar de criterio? → A: Cambiar de criterio. El paso sirve y hay que conservarlo; lo único que está mal es contra qué número se mide. Pasa de "acercar la diferencia a cero" a "acercar la diferencia al objetivo".
- Q: ¿Qué pasa cuando el objetivo es cero (ningún equipo sin arquero fijo, o ventaja configurada en 0)? → A: El comportamiento es idéntico al actual. Cero es un caso particular del objetivo, no una excepción. Esto sirve como prueba de no-regresión.
- Q: ¿El refinamiento puede empeorar el desvío respecto del objetivo si con eso mejora otra cosa? → A: No. Mantiene la garantía que tiene hoy: solo aplica un intercambio si mejora, así que nunca puede dejar el armado peor que antes de correr.
- Q: ¿Cambia qué intercambios puede considerar? → A: No. Sigue siendo el mismo conjunto: dos titulares de la misma posición asignada, en equipos distintos, ninguno bloqueado, ninguno arquero. Lo que cambia es cuál de esos intercambios elige y cuándo se detiene.
- Q: ¿Y si el objetivo es inalcanzable con ese plantel? → A: Se acerca lo más posible y se detiene. El resumen ya informa objetivo y logrado (`009`, FR-008), así que la brecha queda visible sin necesidad de un aviso nuevo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Que la ventaja configurada se cumpla también con Estrategia 3 (Priority: P1)

Un "admin" configuró 6 puntos de ventaja para el equipo sin arquero fijo, elige Estrategia 3 y genera equipos en un partido donde hay un solo arquero. El armado termina con el equipo que rota el arco unos 6 puntos por encima del otro, no empatado.

**Why this priority**: Es la feature entera. Sin esto, el parámetro que `009` expone no tiene efecto real en la estrategia que el usuario usa para armar con formación fija.

**Independent Test**: Con un partido de un solo arquero y ventaja 6, generar con Estrategia 2 y con Estrategia 3, y comparar: las dos diferencias tienen que quedar del mismo lado y de magnitud comparable. Hoy la 3 termina cerca de 0 y la 2 cerca de 6.

**Acceptance Scenarios**:

1. **Given** ventaja 6 y un partido con un solo candidato a arquero, **When** se generan equipos con Estrategia 3, **Then** la diferencia lograda queda lo más cerca posible de 6 a favor del equipo sin arquero fijo, y no cerca de 0.
2. **Given** ventaja 0 (o un partido donde los dos equipos tienen arquero fijo), **When** se generan equipos con Estrategia 3, **Then** el resultado es el mismo que producía el motor antes de esta feature.
3. **Given** un armado ya refinado, **When** el refinamiento evalúa un intercambio que alejaría la diferencia del objetivo, **Then** no lo aplica.
4. **Given** un objetivo inalcanzable con ese plantel (por ejemplo ventaja 50), **When** se generan equipos, **Then** el motor se acerca lo más posible, no entra en bucle, y el resumen muestra objetivo y logrado.
5. **Given** titulares bloqueados y un arquero asignado, **When** corre el refinamiento, **Then** ninguno de ellos cambia de equipo (misma restricción que hoy).
6. **Given** cualquier armado con formación fija cumplida, **When** corre el refinamiento, **Then** la formación de cada equipo y la cantidad de integrantes quedan intactas (solo se intercambian titulares de la misma posición asignada).

---

### User Story 2 - Que el resumen deje de mostrar una brecha que ya no existe (Priority: P2)

El "admin" lee el bloque "Por qué quedaron así" y ve que la ventaja objetivo y la diferencia lograda coinciden (o quedan muy cerca), en lugar de la brecha que `009` dejaba a la vista como limitación conocida.

**Why this priority**: Es la consecuencia observable de la Historia 1 y la forma de verificar que la feature funcionó, pero no requiere trabajo propio más allá de que el dato informado sea el real.

**Independent Test**: Generar con ventaja 6 y Estrategia 3, y leer el resumen: objetivo 6 y logrado ~6.

**Acceptance Scenarios**:

1. **Given** ventaja 6, Estrategia 3 y un partido con un solo arquero, **When** el "admin" lee el resumen, **Then** la ventaja otorgada y la diferencia lograda son consistentes entre sí.
2. **Given** el mismo caso, **When** el "admin" mira el aviso de "Diferencia aceptable", **Then** no aparece marcado en rojo por haber alcanzado el objetivo (comportamiento ya definido en `009`, FR-010, que acá queda efectivamente ejercitado).

---

### Edge Cases

- **Objetivo cero**: idéntico al comportamiento actual. Es la prueba de no-regresión principal.
- **Ventaja mayor que cualquier diferencia alcanzable**: el refinamiento se acerca lo más posible y se detiene sin bucle infinito (conserva el tope de vueltas defensivo que ya tiene).
- **Sin intercambios posibles** (todos bloqueados, o ninguna posición con titulares en ambos equipos): el refinamiento no hace nada y el armado queda como lo dejó el reparto.
- **La ventaja quedó del lado equivocado** después del reparto: el refinamiento debe poder cruzar el cero, es decir mover la diferencia desde "a favor del equipo con arquero" hacia "a favor del equipo sin arquero", si eso reduce el desvío.
- **Diferencia exacta imposible por los decimales del puntaje**: se busca el desvío mínimo, no la igualdad exacta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El refinamiento final de la Estrategia 3 MUST evaluar cada intercambio candidato por el desvío resultante respecto del objetivo de diferencia definido en `009-ventaja-sin-arquero`, no por la diferencia cruda entre los dos equipos.
- **FR-002**: El refinamiento MUST aplicar únicamente intercambios que reduzcan ese desvío, y MUST detenerse cuando ninguno lo reduzca.
- **FR-003**: El refinamiento MUST conservar el conjunto de intercambios que ya considera hoy: dos titulares con la misma posición asignada, en equipos distintos, ninguno bloqueado y ninguno asignado al arco.
- **FR-004**: El refinamiento MUST NOT alterar la formación de cada equipo ni la cantidad de integrantes de cada equipo.
- **FR-005**: Cuando el objetivo de diferencia es cero, el resultado del refinamiento MUST ser equivalente al que produce el motor antes de esta feature.
- **FR-006**: El refinamiento MUST poder reducir el desvío incluso cuando eso implique invertir de qué lado está la diferencia entre los dos equipos.
- **FR-007**: El refinamiento MUST terminar siempre, conservando un tope de iteraciones defensivo, incluso con un objetivo inalcanzable.
- **FR-008**: El resumen del armado MUST seguir informando la ventaja objetivo y la diferencia lograda (`009`, FR-008), ahora con valores consistentes cuando el objetivo es alcanzable.

### Enmiendas a specs vigentes

- **`009-ventaja-sin-arquero`, sección "Limitación conocida"**: queda cerrada al implementarse esta feature. Debe actualizarse indicando que la ventaja se respeta también en Estrategia 3.
- **`003-motor-generacion-equipos`, FR-004 / FR-021**: donde describen el balance de puntaje como "diferencia lo más chica posible", debe pasar a ser "desvío lo más chico posible respecto del objetivo de diferencia", que vale cero salvo que haya ventaja configurada y aplique.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con una ventaja configurada y un solo arquero entre los titulares, la Estrategia 3 y la Estrategia 2 producen diferencias del mismo signo y de magnitud comparable sobre el mismo plantel.
- **SC-002**: Con objetivo cero, los equipos generados por Estrategia 3 son idénticos a los que generaba antes de esta feature para el mismo partido y la misma configuración.
- **SC-003**: En ningún armado el refinamiento deja un desvío respecto del objetivo mayor al que había antes de correr.
- **SC-004**: La generación no se cuelga ni tarda perceptiblemente más con objetivos inalcanzables.
- **SC-005**: Un "admin" puede confirmar leyendo el resumen que la ventaja que configuró se cumplió, sin recalcular nada a mano.

## Assumptions

- `009-ventaja-sin-arquero` ya está implementada: existe un objetivo de diferencia único, derivado de la configuración, disponible en el momento del refinamiento.
- El objetivo de diferencia se expresa como magnitud y equipo favorecido; el refinamiento no necesita conocer por qué existe (arquero o cualquier motivo futuro).
- La cantidad de titulares de un partido es acotada (~18), por lo que evaluar todos los pares candidatos en cada vuelta sigue siendo instantáneo.
- La forma de elegir arqueros y de asignar posiciones no cambia en esta feature.

## Fuera de Alcance

- Reemplazar la asignación de posiciones de la Estrategia 3 por un método con garantía de encaje óptimo (`011-encaje-optimo-formacion`).
- Repartir las duplas de rotación de forma pareja entre los dos equipos (`011-encaje-optimo-formacion`).
- Agregar un paso de refinamiento a la Estrategia 1 o a la Estrategia 2.
- Permitir que el refinamiento intercambie titulares de posiciones distintas (eso lo resuelve `011` desde la asignación, no desde el refinamiento).
