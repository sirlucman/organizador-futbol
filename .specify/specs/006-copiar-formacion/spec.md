# Feature Specification: Copiar formación de equipos

**Feature Branch**: `006-copiar-formacion`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "creemos un branch nuevo y agreguemos la posibilidad de copiar la formación de equipos generada. El botón debe ser el típico de "copiar". La idea es poder trasladar esto al whatsapp. La idea es mantener los nombres de los equipos y cada jugador numerado secuencialmente arrancando por 1 en cada equipo. No agregues la posición al listado."

## Clarifications

### Session 2026-08-13

- Q: ¿Qué formato exacto debe tener el texto copiado para separar equipos y numerar jugadores? → A: Encabezado = nombre corto del color del equipo en negrita (formato WhatsApp con asteriscos: "*Blanco*" / "*Negro*") + emoji de color correspondiente (⬜️ para "blanco", ⬛️ para "negro"), seguido de la lista numerada de jugadores.
- Q: ¿Eso reemplaza el nombre real del equipo, o el emoji se agrega después del nombre que ya tiene el equipo en el sistema? → A: Se usa el nombre corto del color entre asteriscos (negrita) más el emoji correspondiente (ej. "*Blanco* ⬜️"), independientemente del nombre completo que el equipo tenga en pantalla (ej. "Equipo Blanco").
- Q: ¿Cuántas líneas vacías separan el listado de un equipo del encabezado del siguiente equipo? → A: Una sola línea vacía.
- Q: ¿Cómo se muestra la confirmación de éxito y el aviso de error al copiar? → A: Mensaje tipo toast/snackbar temporal (no se modifica el texto/ícono del botón).
- Q: ¿Cómo se numeran los jugadores dentro de cada equipo? → A: Numeración simple, formato "1. Nombre" (sin caracteres invisibles ni trucos anti-autonumeración de WhatsApp).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copiar la formación generada para compartirla (Priority: P1)

Como organizador del partido, después de generar los equipos quiero copiar rápidamente el listado de la formación (nombres de equipo y jugadores numerados) para pegarlo directamente en el chat de WhatsApp del grupo, sin tener que escribir a mano cada nombre.

**Why this priority**: Es la funcionalidad central solicitada. Sin ella no hay feature: es el único valor que se está agregando.

**Independent Test**: Se puede probar generando equipos en un partido existente, presionando el botón de copiar, y pegando el contenido del portapapeles en cualquier campo de texto (por ejemplo, un chat de WhatsApp) para verificar que el texto coincide con el formato esperado.

**Acceptance Scenarios**:

1. **Given** un partido con la formación de equipos ya generada (Equipo Blanco y Equipo Negro con jugadores asignados), **When** el organizador presiona el botón de copiar, **Then** el contenido copiado al portapapeles contiene, para cada equipo, el encabezado con el nombre corto del color en negrita más el emoji correspondiente (ej. "*Blanco* ⬜️"), seguido de sus jugadores numerados secuencialmente empezando en 1 para cada equipo (formato "1. Nombre"), sin mostrar la posición de ningún jugador. El formato exacto esperado es:

```
*Blanco* ⬜️

1. Jugador 1
2. Jugador 2

*Negro* ⬛️

1. Jugador 1
2. Jugador 2
```
2. **Given** que el botón de copiar fue presionado con éxito, **When** se completa la copia, **Then** el organizador recibe una confirmación visual clara de que el texto fue copiado.
3. **Given** un partido cuya formación de equipos aún no fue generada, **When** el organizador visualiza la sección de equipos, **Then** el botón de copiar no está disponible o está deshabilitado, ya que no hay formación para copiar.

### Edge Cases

- ¿Qué sucede si el navegador o dispositivo del usuario no permite el acceso al portapapeles (por permisos o por ser un contexto no seguro)? El sistema debe informar al organizador que no se pudo copiar, en lugar de fallar en silencio.
- ¿Qué pasa si un equipo quedó sin jugadores asignados (por ejemplo, 0 jugadores en "Equipo Negro")? El listado debe igualmente mostrar el nombre del equipo, sin numeración de jugadores debajo.
- ¿Qué pasa si algún jugador no tiene apellido registrado? Se debe usar el mismo nombre completo que ya se muestra en el resto de la pantalla de formación, sin agregar lógica adicional de formateo de nombre.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un botón de "copiar" (con el ícono/etiqueta convencional de copiar) junto a la formación de equipos generada, visible únicamente cuando existe una formación generada para el partido.
- **FR-002**: Al presionar el botón de copiar, el sistema DEBE colocar en el portapapeles del dispositivo un texto plano con la formación completa de ambos equipos.
- **FR-003**: El texto copiado DEBE usar como encabezado de cada equipo el nombre corto de su color en negrita con formato WhatsApp (asteriscos): "*Blanco*" para el equipo cuyo nombre contiene "blanco", "*Negro*" para el que contiene "negro", seguido de un espacio y el emoji de color correspondiente: "⬜️" para blanco, "⬛️" para negro (ej. "*Blanco* ⬜️").
- **FR-004**: Dentro de cada equipo, el texto copiado DEBE numerar a los jugadores de forma secuencial comenzando en 1 (formato "1. Nombre", sin caracteres invisibles ni trucos anti-autonumeración), reiniciando la numeración en 1 para cada equipo.
- **FR-005**: El texto copiado NO DEBE incluir la posición (arquero, defensor, volante, delantero) de ningún jugador, aunque esa posición se muestre en la pantalla de formación.
- **FR-006**: El texto copiado DEBE listar a los jugadores en el mismo orden en que aparecen actualmente en la formación mostrada en pantalla para cada equipo.
- **FR-007**: El sistema DEBE mostrar un mensaje tipo toast/snackbar temporal cuando la copia se realizó con éxito (sin modificar el texto o ícono del botón de copiar).
- **FR-008**: El sistema DEBE mostrar un mensaje tipo toast/snackbar temporal informando al organizador si la copia al portapapeles falla, sin interrumpir el resto de la funcionalidad de la pantalla.
- **FR-009**: El formato del texto copiado DEBE ser legible al pegarse en una aplicación de mensajería de texto plano (sin formato enriquecido, HTML ni estilos): el encabezado de cada equipo y cada jugador van en líneas distintas, y se deja exactamente una línea vacía entre el listado de un equipo y el encabezado del siguiente equipo.

### Key Entities

- **Formación de equipos generada**: Resultado ya existente de agrupar a los jugadores de un partido en dos equipos (identificados por nombre), donde cada jugador pertenece a un único equipo y tiene una posición en el orden de listado dentro de ese equipo.
- **Jugador**: Persona con nombre visible en la formación; para esta feature solo interesa su nombre para mostrar (no su posición ni su puntaje).
- **Texto copiado**: Representación en texto plano de la formación generada, agrupada por equipo. Cada equipo inicia con el nombre corto de su color en negrita (formato WhatsApp: "*Blanco*" / "*Negro*") seguido del emoji de color correspondiente ("⬜️" blanco / "⬛️" negro), luego los jugadores numerados secuencialmente desde 1 (formato "1. Nombre"), y una línea vacía separa el bloque de un equipo del siguiente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El organizador puede copiar la formación completa de equipos en un solo click/tap, sin pasos adicionales.
- **SC-002**: El 100% de los textos copiados incluye los nombres de equipo correctos y la numeración secuencial de jugadores comenzando en 1 en cada equipo.
- **SC-003**: El texto copiado no contiene ninguna referencia a posiciones de juego en ningún caso.
- **SC-004**: El organizador recibe una confirmación visual de la copia en menos de 1 segundo tras presionar el botón.
- **SC-005**: El texto pegado en una aplicación de mensajería externa (como WhatsApp) se ve ordenado y legible, sin caracteres de formato ni artefactos visuales.

## Assumptions

- La numeración de jugadores es únicamente para el texto copiado (una lista enumerada de nombres); no reemplaza ni modifica el número de camiseta ni ningún dato existente del jugador en el sistema.
- El orden de los jugadores dentro de cada equipo, tanto en pantalla como en el texto copiado, es el orden en que ya se muestran actualmente en la formación (no se pide un criterio de orden distinto).
- Se asume que el dispositivo/navegador del organizador soporta la funcionalidad estándar de copiar al portapapeles; para los casos donde no sea posible, basta con un aviso de error (no se requiere un método alternativo de copia).
- No se requiere adjuntar totales de puntaje, estrategia usada, ni ningún otro dato adicional de la formación en el texto copiado: solo nombres de equipo y jugadores numerados.
- El botón de copiar se ubica en la misma vista de detalle de partido donde ya se visualiza la formación generada (sección de equipos), sin crear una pantalla nueva.
