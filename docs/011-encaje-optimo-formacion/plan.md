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
- **Principio III**: el cumplimiento o incumplimiento de la formación se informa
  (`index.html:3698` y `:3701`) y las reubicaciones de arqueros también (`:3751` y
  `:3753`). El reparto de duplas de FR-007 / FR-007a **no se explicaba en ninguna parte**:
  de las 13 líneas que podía emitir "Por qué quedaron así", ninguna las mencionaba. Era una
  restricción dura que cambiaba el armado sin dejar rastro para el administrador.
  **Corregido el 2026-08-27**: FR-014 lo exige y `index.html:3748-3785` lo emite, derivando
  el reparto de lo que efectivamente pasó. **PASA desde 2026-08-27**.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: **NO APLICA** — el efecto visible es el contenido del
  resumen, que reusa `.explain-box`, sin layout nuevo.

## Hallazgos

1. **Resuelto (2026-08-27) — Principio III**. El reparto de duplas es efecto del motor y
   no estaba reflejado en el resumen; el principio no exceptúa a las restricciones duras.
   De las dos salidas posibles se eligió agregar la explicación, no enmendar el principio:
   FR-014 en este spec, FR-007 en `013`, y la implementación en `index.html:3748-3785`.
   La explicación se deriva del reparto REAL y no del criterio buscado, porque un bloqueo
   manual puede haberlo torcido (`013`, FR-005) y afirmar lo pretendido sería afirmar una
   decisión que no ocurrió.
