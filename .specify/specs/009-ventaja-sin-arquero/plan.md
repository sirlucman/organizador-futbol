# Constitution Check retroactivo — Ventaja configurable para el equipo sin arquero fijo

**Feature**: `009-ventaja-sin-arquero`
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

- **Principio I (specs como fuente de verdad)**: el spec define el comportamiento con
  14 FRs y resolvió 10 ambigüedades en `## Clarifications` (sesión 2026-08-19) antes de
  implementar. Registra además la enmienda que provoca sobre `003`, FR-005, en
  `## Enmiendas a specs vigentes`, en vez de dejar los dos specs contradiciéndose.
  **PASA**.
- **Principio II (simplicidad)**: el parámetro vive dentro de la regla "Emparejar el
  puntaje" que ya existía, sin crear una regla nueva con su propio interruptor y
  prioridad — decisión razonada en Clarifications. El campo reusa el componente
  genérico de parámetro numérico (`index.html:4361-4366`) sin traer markup propio.
  **PASA**.
- **Principio III (explicabilidad)**: `index.html:3742` informa qué equipo quedó sin
  arquero fijo, cuántos puntos de ventaja recibió y qué diferencia se logró (FR-008);
  `index.html:3745` no afirma que se compensó cuando la ventaja es cero (FR-009); y
  `index.html:3768` evalúa el aviso sobre el desvío respecto del objetivo y no sobre la
  diferencia cruda (FR-010). **PASA**.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: es la única de las siete que se acordó de este principio
  — FR-014 lo invoca explícitamente. Pero el requisito estaba mal escrito: pedía "sin
  anchos ni altos fijos" y a la vez "igual que el resto de los parámetros de reglas",
  que usan `width:56px`. Incumplible en las dos mitades a la vez, o sea inverificable.
  Corregido el 2026-08-27 (commit `3174f5d`) y hoy la fila se verifica en
  `tests/layout.test.js`. **PASA con observación**.

## Hallazgos

1. **Resuelto** — FR-014 era internamente contradictorio y por eso no se podía
   verificar. Habría sido un hallazgo de este gate si hubiera corrido a tiempo.
2. **Resuelto** — el spec declaraba "Falta la verificación visual del campo nuevo en
   Configuración". Cubierto desde el 2026-08-27 por el escenario de Configuración de
   `tests/layout.test.js`.
