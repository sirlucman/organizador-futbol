# Feature Specification: Reparto parejo de duplas también en las Estrategias 1 y 2

**Feature Branch**: `013-duplas-parejas-estrategias-1-2`

**Created**: 2026-08-19

**Status**: Draft

**Depends on**: `011-encaje-optimo-formacion` (define la regla de reparto de duplas, ahí aplicada solo a la Estrategia 3)

**Input**: Detectado al especificar `011`: la asimetría de duplas existe en las tres estrategias, pero solo se resuelve en la Estrategia 3.

## Contexto

`011-encaje-optimo-formacion` establece cómo se reparten las duplas de rotación entre los dos equipos: en partes iguales si la cantidad es par, y si es impar, la que sobra va al equipo que tiene arquero fijo. Pero lo hace **solo para la Estrategia 3**, porque ahí el reparto de equipos se reescribe de todos modos y la restricción sale casi gratis.

En las Estrategias 1 y 2 el problema sigue vivo: nada impide que todas las duplas caigan en el mismo equipo. Con dos duplas, ese equipo queda con **10 jugadores reales contra 8** — cuatro rotando en dos lugares contra ocho jugando el partido entero. Hoy que no pase es cuestión de suerte del reparto, no de una regla.

Verificado en tests: con el orden de convocatoria "natural" el reparto acierta, y con otros órdenes del mismo plantel manda las dos duplas al mismo equipo.

Además, quedan tres estrategias con criterios distintos sobre la misma cuestión, que es exactamente el tipo de incoherencia que hace desconfiar del motor.

## Clarifications

### Session 2026-08-19

- Q: ¿La regla es la misma que en la Estrategia 3? → A: Idéntica, y esa es la razón de la feature: que las tres estrategias repartan duplas con el mismo criterio. Par → mitad y mitad; impar → la que sobra al equipo con arquero fijo; impar sin un solo equipo con arquero fijo → indistinto.
- Q: ¿Qué pasa si cumplir la regla obliga a resignar balance de puntaje? → A: Manda la regla de duplas. Es una restricción dura del reparto, igual que en la Estrategia 3, y el equilibrio de puntaje se busca dentro de lo que la restricción permita.
- Q: ¿Y en la Estrategia 2, donde el reparto va posición por posición? → A: La restricción es global (cuenta duplas del equipo, no de la posición), así que el reparto tiene que mirar más allá del grupo de posición que está repartiendo en ese momento. Es la única complicación real de esta feature.
- Q: ¿Cambia el invariante de que los dos integrantes van juntos? → A: No. Sigue vigente y sigue teniendo prioridad (`008-duplas-rotacion`).
- Q: ¿Los bloqueos manuales pueden violar la regla? → A: Sí. Un bloqueo es una decisión explícita del usuario y manda sobre el reparto parejo, igual que en la Estrategia 3.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mismo criterio de duplas con cualquier estrategia (Priority: P1)

Un "admin" genera equipos con Estrategia 1 o con Estrategia 2 en un partido con duplas, y las duplas quedan repartidas con el mismo criterio que aplica la Estrategia 3. Cambiar de estrategia no cambia cuántas duplas recibe cada equipo.

**Why this priority**: Es la feature. Sin esto hay tres criterios distintos para la misma cuestión y el resultado depende de la estrategia elegida por motivos que no tienen nada que ver con las duplas.

**Independent Test**: Con un plantel de dos duplas, generar con las tres estrategias y verificar que las tres dejan una dupla por equipo, probando además con distintos órdenes de convocatoria.

**Acceptance Scenarios**:

1. **Given** un partido con dos duplas y Estrategia 1 seleccionada, **When** se generan equipos, **Then** queda una dupla en cada equipo, con cualquier orden de convocatoria.
2. **Given** el mismo partido con Estrategia 2, **When** se generan equipos, **Then** queda una dupla en cada equipo, con cualquier orden de convocatoria.
3. **Given** un partido con una sola dupla, un solo candidato a arquero y Estrategia 1 o 2, **When** se generan equipos, **Then** la dupla queda en el equipo con arquero fijo.
4. **Given** un partido con tres duplas, un solo candidato a arquero y Estrategia 1 o 2, **When** se generan equipos, **Then** el equipo con arquero fijo recibe dos y el otro una.
5. **Given** cualquier estrategia y cualquier partido con duplas, **When** se generan equipos, **Then** los dos integrantes de cada dupla siguen quedando en el mismo equipo.
6. **Given** una dupla bloqueada en un equipo, **When** se generan equipos con Estrategia 1 o 2, **Then** se respeta el bloqueo y las duplas restantes se reparten alrededor de ese hecho.

---

### Edge Cases

- **Estrategia 2 con la restricción cruzando grupos de posición**: la cuenta de duplas es del equipo completo, no del grupo que se está repartiendo; el reparto tiene que considerarlo antes de llenar un cupo con una dupla.
- **Regla imposible por los cupos**: si respetar la cantidad de duplas por equipo hiciera imposible completar los cupos, priorizan los cupos y se informa, igual que en la Estrategia 3.
- **Cero duplas**: nada cambia respecto de hoy en ninguna de las dos estrategias.
- **Una sola dupla y arquero fijo en los dos equipos (o en ninguno)**: la dupla va a cualquiera; no hay criterio de desempate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las Estrategias 1 y 2 MUST repartir las duplas de rotación con el mismo criterio que la Estrategia 3 (`011-encaje-optimo-formacion`, FR-007 / FR-007a / FR-007b).
- **FR-002**: El criterio MUST ser una restricción dura del reparto: el equilibrio de puntaje se busca dentro de lo que la restricción permita, no al revés.
- **FR-003**: En la Estrategia 2, la cuenta de duplas por equipo MUST evaluarse sobre el equipo completo y no sobre el grupo de posición que se está repartiendo en ese momento.
- **FR-004**: El sistema MUST seguir manteniendo a los dos integrantes de cada dupla en el mismo equipo, con prioridad sobre el reparto parejo (`008-duplas-rotacion`).
- **FR-005**: Los bloqueos manuales de jugadores MUST prevalecer sobre el reparto parejo de duplas.
- **FR-006**: El resultado MUST ser el mismo, en cuanto a cantidad de duplas por equipo, sin importar el orden de convocatoria de los titulares.

### Enmiendas a specs vigentes

- **`011-encaje-optimo-formacion`, FR-007 / FR-007a / FR-007b y su sección "Fuera de Alcance"**: la regla deja de ser exclusiva de la Estrategia 3. Debe quedar redactada como regla del motor, aplicable a las tres estrategias, y sacarse de Fuera de Alcance.
- **`008-duplas-rotacion`, FR-008**: la restricción de reparto parejo pasa a valer para las tres estrategias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para un mismo partido con duplas, las tres estrategias reparten la misma cantidad de duplas a cada equipo.
- **SC-002**: Ningún armado deja todas las duplas en un mismo equipo cuando hay más de una, con ninguna estrategia y con ningún orden de convocatoria.
- **SC-003**: Los partidos sin duplas se arman exactamente igual que antes de esta feature, con las tres estrategias.

## Assumptions

- `011-encaje-optimo-formacion` ya está implementada y la regla está escrita ahí; esta feature la extiende, no la redefine.
- La cantidad de duplas por partido es chica (una o dos en la práctica), así que la restricción no complica el reparto más allá de tenerla en cuenta.
- La cantidad de jugadores reales por equipo puede seguir siendo distinta cuando la cantidad de duplas es impar; eso es inevitable y no es lo que esta feature busca igualar.

## Fuera de Alcance

- Cambiar el algoritmo de reparto de las Estrategias 1 y 2 más allá de incorporar esta restricción.
- Llevar a las Estrategias 1 y 2 la asignación de posiciones con encaje óptimo de la Estrategia 3.
- Igualar la cantidad de jugadores reales por equipo cuando la cantidad de duplas es impar.
