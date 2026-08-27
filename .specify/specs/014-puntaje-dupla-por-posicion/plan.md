# Constitution Check retroactivo — El puntaje de una dupla se calcula por posición

**Feature**: `014-puntaje-dupla-por-posicion`
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

- **Principio I**: 12 FRs, con tres de ellos (FR-003, FR-006, FR-007) dedicados a
  acotar qué NO cambia — la fórmula vigente cuando ningún integrante tiene nota en esa
  posición, la Estrategia 1, y el valor de un jugador individual. **PASA**.
- **Principio II**: cambia la fórmula de una función existente
  (`construirUnidadDupla`) sin introducir una capa de "estrategias de puntuación"
  configurables que ningún spec pide. **PASA**.
- **Principio III**: FR-008 impide usar el puntaje de la dupla para decidir su posición,
  manteniendo esa decisión en el encaje — o sea preserva la explicabilidad que `011` ya
  había establecido, en vez de mezclar dos criterios en un número. Y el panel muestra el
  valor por posición junto a la nota de cada integrante (`012`, FR-001a), así que el
  número visible se puede reconstruir. **PASA**.
- **Principio IV (arquitectura desacoplada y modular)**: verificado por máquina, no por lectura: ninguna de las 41 declaraciones que `tests/harness.js` extrae del motor referencia `document`, `el(`, `innerHTML`, `querySelector`, `window.storage` ni `window.auth`. El motor no sabe nada de la interfaz ni de Firestore. **PASA**.
- **Principio V (responsive)**: el spec declaraba pendiente la verificación visual de la
  leyenda por integrante (FR-012). La fila de dupla se verifica hoy en
  `tests/layout.test.js` en los 13 anchos, incluida la banda de dos columnas.
  **PASA con observación** — el test mide desborde y alineación, no si la leyenda se lee
  bien; eso sigue sin revisar en un dispositivo.

## Hallazgos

1. **Parcialmente resuelto** — la verificación visual de FR-012 que el spec declaraba
   pendiente está cubierta en cuanto a layout, no en cuanto a legibilidad.
2. **De proceso** — `tests/README.md` afirmaba que esta feature era "la única sin
   implementar", cuando está implementada desde el 2026-08-19 y sus 6 casos están en el
   bloque BASELINE (`tests/motor.test.js:532`). Corregido el 2026-08-27. Esa línea
   desactualizada es la que hizo que este mismo gate se planificara sobre la feature
   equivocada.
