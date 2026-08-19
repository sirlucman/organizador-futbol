# Specification Quality Checklist: Informar el mínimo de diferencia alcanzable

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

- **Es la más chica de las siete y depende de la más grande.** No calcula nada nuevo: aprovecha que después de `011` el resultado del reparto ya es el mínimo bajo las restricciones vigentes. Sin `011` el mensaje sería una afirmación que el motor no puede sostener (el reparto de hoy es heurístico), así que no se puede adelantar.
- **La precisión del mensaje es el requisito, no un detalle de redacción** (FR-005): el mínimo es "respetando la formación, los bloqueos y el reparto de duplas", no el mínimo absoluto. Prometer más sería volver a un aviso que engaña, que es justamente lo que la feature viene a arreglar.
- **El único caso donde el usuario puede mejorar algo son los bloqueos** (FR-003). Ahí la sugerencia se mantiene porque sí puede servir.
- **No cubierta por `tests/motor.test.js`**: es comportamiento del resumen. Verificación manual/navegador contra staging, con el partido testigo como caso.
- **Verificado sobre datos reales**: en el partido testigo, 0.5 era el mínimo incluso permitiendo asignaciones de posición peores. El aviso actual pedía una acción imposible.
