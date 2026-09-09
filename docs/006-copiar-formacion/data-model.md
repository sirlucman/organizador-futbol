# Data Model: Copiar formación de equipos

Esta feature no agrega ni modifica entidades persistidas: es una transformación de solo lectura sobre datos que ya existen en el partido (`m.equipos`, calculado por el motor de generación — ver `003-motor-generacion-equipos`). No hay cambios de esquema en Firestore.

## Entidades derivadas (en memoria, no persistidas)

### Formación de equipos generada (existente, sin cambios)

Ya modelada por la feature `003-motor-generacion-equipos`. Campos relevantes para esta feature:

| Campo | Tipo | Uso en esta feature |
|---|---|---|
| `m.equipos.blanco` | `string[]` (ids de jugador) | Ids del Equipo Blanco, en orden de asignación |
| `m.equipos.negro` | `string[]` (ids de jugador) | Ids del Equipo Negro, en orden de asignación |

El orden de listado para el texto copiado es el mismo que usa el render de pantalla: `ordenarPorPosicion(ids.map(id => players.find(...)))` (index.html:1624-1625) — no se introduce un criterio de orden nuevo (FR-006).

### Jugador (existente, sin cambios)

| Campo | Tipo | Uso en esta feature |
|---|---|---|
| `p.nombre` | `string` | Parte del nombre a copiar |
| `p.apellido` | `string \| undefined` | Parte del nombre a copiar (opcional) |

Nombre a copiar = `fullName(p)` (index.html:724), la misma función ya usada para mostrar el nombre en pantalla — sin lógica de formateo nueva (Edge Case del spec).

### Texto copiado (nuevo, efímero — no se persiste)

Estructura conceptual del string generado por `formatearFormacionParaCopiar(m, players)`:

```text
*{corto1}* {emoji1}

1. {nombreJugador1}
2. {nombreJugador2}
...

*{corto2}* {emoji2}

1. {nombreJugador1}
...
```

Reglas de construcción (derivadas de FR-003 a FR-009 del spec):

- `corto`: nombre corto del color en negrita con formato WhatsApp ("*Blanco*" / "*Negro*"), independiente del nombre completo mostrado en pantalla.
- `emoji`: `⬜️` para el bloque blanco, `⬛️` para el bloque negro (ver `research.md` §4).
- Una línea vacía entre el encabezado y el primer jugador (solo si el equipo tiene jugadores).
- Numeración: reinicia en 1 por cada equipo; formato `"{n}. {nombre}"`, sin caracteres invisibles.
- Si un equipo no tiene jugadores, se omite la lista y la línea vacía que la precede, pero se mantiene el encabezado del equipo.
- Exactamente una línea vacía entre el bloque de un equipo y el encabezado del siguiente.
- Sin campo de posición, puntaje ni ningún otro dato adicional.

No tiene estado ni ciclo de vida: se genera al presionar el botón y se descarta inmediatamente después de copiarse al portapapeles.
