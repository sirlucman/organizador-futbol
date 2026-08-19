# Specification Quality Checklist: El puntaje de una dupla depende de la posición que ocupa

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-19
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- **El orden respecto de `011` no es negociable.** Si se implementa antes, el puntaje vuelve a cargar con el encaje posicional y reaparece el problema del partido testigo: una posición que nadie cubre puede valer igual que una cubierta. El spec lo dice en el Contexto y en Assumptions; si `/speckit-plan` propone adelantarla, hay que rechazarlo.
- **Convivencia de dos valores**: la Estrategia 1 sigue usando el promedio de promedios (FR-006) mientras las Estrategias 2 y 3 usan el valor por posición. Una dupla pasa a tener un valor global y valores por posición; el plan tiene que resolver eso sin romper la equivalencia de la Estrategia 1 (SC-004).
- **Cambio de comportamiento buscado**: los partidos con duplas armados con Estrategias 2 o 3 van a dar equipos distintos. No marca los equipos guardados como desactualizados porque es un cambio de código, no de configuración (ver Edge Cases).
- **Tests escritos antes de implementar**: `tests/motor.test.js` cubre esta feature en el bloque PENDIENTE, incluida la no-regresión de la Estrategia 1.
- **Enmienda a `008-duplas-rotacion` FR-008**: es el spec que define el valor de la dupla y hay que actualizarlo.
