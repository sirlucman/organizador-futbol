# Constitution Check retroactivo — Reparto parejo de duplas en las Estrategias 1 y 2

**Feature**: `013-duplas-parejas-estrategias-1-2`
**Gate corrido**: 2026-08-27, contra la constitución v2.3.0
**Estado de la feature**: implementada el 2026-08-19

## Qué es este documento y qué no es

Es el **Constitution Check** que la Governance de la constitución exige antes de
`/speckit-plan` o `/speckit-implement`, corrido a posteriori. Esta feature se
especificó el 2026-08-19 junto con otras seis y se implementó sin pasar por ese
paso, así que el gate nunca se aplicó.

**No es un plan de implementación**, y a propósito no lo completa. Un `plan.md`
es un artefacto previo a construir: escribirlo hoy, para código que ya existe,
produciría un documento que finge planificar lo que ya se decidió hace ocho días.
Lo que faltaba y sí tiene valor es el gate, y es lo único que este archivo tiene.

Cuando el veredicto de un principio se apoya en código, se cita el `file:line`.

## Constitution Check

- **Principio I**: 6 FRs que fijan el criterio, su prioridad relativa frente al
  equilibrio de puntaje (FR-002), frente a mantener la dupla junta (FR-004) y frente a
  los bloqueos manuales (FR-005), más la independencia del orden de convocatoria
  (FR-006). **PASA**.
- **Principio II**: el mejor ejemplo del principio en el repo. La regla quedó escrita una
  sola vez, en `cupoDuplasPorEquipo` (`index.html:1822`), y la llaman las tres estrategias
  (`:1781`, `:1971`, `:2610`) en vez de repetirse tres veces. **PASA**.
- **Principio III**: **NO PASA**, por la misma razón que `011`: el reparto de duplas
  cambia el armado y ninguna de las 13 líneas de "Por qué quedaron así" lo menciona. Acá
  pesa más que en `011`, porque en `013` el reparto parejo *es* la feature entera: su
  efecto es invisible para el administrador. Ver Hallazgos.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: **NO APLICA** — el spec no tiene ninguna mención de
  interfaz. Es puro motor.

## Hallazgos

1. **Abierto — Principio III**. El reparto parejo de duplas no se explica en el
   resumen de generación, y en esta feature ese reparto es el único cambio de
   comportamiento. Un administrador no tiene forma de saber que la regla actuó, ni por
   qué una dupla quedó donde quedó. Mismo hallazgo que `011`, misma decisión pendiente:
   agregar la explicación o enmendar el principio.
