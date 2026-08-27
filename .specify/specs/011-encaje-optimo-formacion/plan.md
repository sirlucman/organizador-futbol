# Constitution Check retroactivo — Encaje óptimo con la formación fija y reparto de duplas

**Feature**: `011-encaje-optimo-formacion`
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

- **Principio I**: 15 FRs que cubren el criterio de encaje (FR-001 a FR-004), la
  independencia entre asignar posiciones y repartir equipos (FR-005), las reubicaciones
  encadenadas (FR-006) y el reparto de duplas (FR-007 / FR-007a). **PASA**.
- **Principio II**: FR-003 acota la decisión a las posiciones declaradas, sin meter el
  puntaje en el encaje; no se generaliza a "formaciones configurables" que ningún spec
  pide. **PASA**.
- **Principio III**: parcialmente. El cumplimiento o incumplimiento de la formación se
  informa (`index.html:3698` y `:3701`), y las reubicaciones de arqueros también
  (`:3751` y `:3753`). Pero **el reparto de duplas de FR-007 / FR-007a no se explica en
  ninguna parte**: de las 13 líneas que puede emitir "Por qué quedaron así", ninguna
  menciona duplas. Es una restricción dura que cambia el armado sin dejar rastro para el
  administrador. **NO PASA** — ver Hallazgos.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: **NO APLICA** — el efecto visible es el contenido del
  resumen, que reusa `.explain-box`, sin layout nuevo.

## Hallazgos

1. **Abierto — Principio III**. El reparto de duplas es efecto del motor y no está
   reflejado en el resumen de generación. El principio dice que "ninguna estrategia,
   regla o parámetro del motor se implementa sin que su efecto sea explicable y quede
   reflejado en el resumen de generación", sin excepción por ser una restricción dura.
   Dos salidas posibles, y la decisión no es de este documento: agregar la línea de
   explicación, o enmendar el Principio III para que las restricciones duras no la
   necesiten. Comparte causa con el mismo hallazgo en `013`.
