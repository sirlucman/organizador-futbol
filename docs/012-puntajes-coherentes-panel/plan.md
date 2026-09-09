# Constitution Check retroactivo — El panel muestra los puntajes que usó el motor

**Feature**: `012-puntajes-coherentes-panel`
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

- **Principio I**: 8 FRs, con FR-005 declarando explícitamente que la feature no
  modifica el armado — sólo lo que se muestra. **PASA**.
- **Principio II**: reusa la misma función que usa el motor para calcular el valor de una
  unidad (`valorDePuntaje`, `index.html:3283`) en vez de reimplementar la fórmula en la
  vista, que es justamente el bug que la feature vino a arreglar. **PASA**.
- **Principio III**: es la feature que *sirve* al Principio III más que cualquier otra —
  hace que los números visibles coincidan con los que el motor usó. Antes, el panel
  mostraba dos "sin puntaje" mientras el motor había computado 5.8, y los visibles del
  Blanco sumaban 46 contra un total de 51.8. **PASA**.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: FR-007 lo invoca ("la fila de una dupla MUST seguir
  siendo utilizable en mobile, sin anchos fijos"). Verificado el 2026-08-27: la fila de
  dupla usa `flex-direction:column` con `min-width:0` y sin anchos propios
  (`index.html:241-249`), y es uno de los escenarios de `tests/layout.test.js`. **PASA**.

## Hallazgos

1. **Resuelto** — el spec declaraba "Falta la verificación visual en el navegador".
   Cubierto desde el 2026-08-27: la fila de dupla en modo carga de resultado es un
   escenario del test de layout, con un invariante de alineación propio.
