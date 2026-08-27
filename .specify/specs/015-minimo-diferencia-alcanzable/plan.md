# Constitution Check — Aviso de diferencia mínima alcanzable

**Feature**: `015-minimo-diferencia-alcanzable`
**Gate corrido**: 2026-08-27, contra la constitución v2.3.0
**Estado de la feature**: `Draft` — **no implementada**

## Qué es este documento

A diferencia de las seis features hermanas (`009` a `014`), acá el gate corre
**antes** de implementar, que es cuando fue diseñado para correr. No es un gate
retroactivo: es el paso que la Governance pide y que todavía llega a tiempo.

Tampoco es el plan completo. Cuando esta feature se encare, el flujo sigue con
`/speckit-plan` sobre este mismo archivo — el Constitution Check ya está hecho y no
hay que repetirlo.

## Constitution Check

- **Principio I (specs como fuente de verdad)**: el spec tiene 7 FRs y define el
  comportamiento del aviso, incluidos los tres casos en que NO debe aparecer
  (FR-002, FR-006) y la aclaración de que el mínimo es relativo a la formación
  (FR-005). Está en `Draft`, así que puede necesitar `/speckit-clarify` antes de
  planificar. **PASA con reserva** — el estado `Draft` no es una violación, pero
  hay que confirmar que no queden ambigüedades antes de implementar.
- **Principio II (simplicidad)**: FR-007 declara explícitamente que la feature no
  modifica el armado: sólo cambia lo que se informa. No pide infraestructura nueva,
  reusa el aviso de diferencia que ya existe (`index.html:3768`). **PASA**.
- **Principio III (explicabilidad)**: la feature **es** una mejora de
  explicabilidad. Hoy el aviso sugiere "bloquear jugadores clave y regenerar"
  incluso cuando eso no puede mejorar nada, que es afirmar algo que el motor no
  hizo ni puede hacer. FR-002 y FR-003 lo corrigen. **PASA**.
- **Principio IV (arquitectura desacoplada)**: el cambio vive en la capa de
  presentación del resumen; no toca el motor (FR-007 lo prohíbe) ni la
  persistencia. Al implementarlo, el dato de "mínimo alcanzable" tiene que venir
  del motor como resultado, no calcularse en la vista — si no, la vista pasaría a
  duplicar lógica de armado, que es el error que `012` vino a arreglar. **PASA con
  condición**, anotada acá para que el plan la respete.
- **Principio V (responsive)**: el aviso reusa el contenedor de avisos existente,
  sin layout nuevo. Al implementarlo alcanza con que el texto más largo no rompa la
  fila; el ancho mínimo soportado y el criterio de verificación los declara el
  Principio V, y `tests/layout.test.js` ya cubre esa pantalla. **PASA con
  condición**: agregar el caso al test si el aviso introduce un elemento nuevo.

## Condiciones para `/speckit-plan`

1. Correr `/speckit-clarify` o confirmar que el `Draft` no tiene ambigüedades.
2. El "mínimo alcanzable" lo calcula y devuelve el motor, no la vista (Principio IV).
3. Si el aviso agrega un elemento a la pantalla, sumar el caso a
   `tests/layout.test.js` (Principio V, criterio de verificación).

## Hallazgos

Ninguno que bloquee. Las tres condiciones de arriba son para el plan, no
incumplimientos.
