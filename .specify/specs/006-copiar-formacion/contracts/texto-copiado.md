# Contrato: Texto copiado al portapapeles

Esta feature no expone una API HTTP ni un endpoint — la única "interfaz" es el contrato de formato entre la función que genera el texto y lo que el organizador termina pegando en WhatsApp. Se documenta como contrato porque el formato exacto (encabezados, emoji, numeración, espaciado) fue decidido explícitamente en `/speckit-clarify` y debe quedar fijo para que la implementación y la validación manual (`quickstart.md`) coincidan.

## Función: `formatearFormacionParaCopiar(m, players)`

**Entrada**:
- `m`: objeto partido con `m.equipos.blanco` y `m.equipos.negro` (arrays de ids de jugador), ya generados.
- `players`: array de jugadores del grupo (para resolver `id → {nombre, apellido}`).

**Salida**: `string` en texto plano, sin HTML ni marcado enriquecido.

## Formato de salida

```text
*Blanco* ⬜️

1. {nombre jugador 1}
2. {nombre jugador 2}
...

*Negro* ⬛️

1. {nombre jugador 1}
2. {nombre jugador 2}
...
```

Reglas:

| Regla | Detalle | Requisito origen |
|---|---|---|
| Nombre de equipo | Nombre corto del color en negrita (formato WhatsApp con asteriscos): `*Blanco*` / `*Negro*`, independiente del nombre completo mostrado en pantalla | FR-003 |
| Emoji de equipo | `⬜️` para el equipo blanco, `⬛️` para el equipo negro | FR-003 (Clarifications) |
| Línea vacía tras el encabezado | Una línea vacía entre el encabezado y el primer jugador (solo si el equipo tiene jugadores) | FR-009 (Clarifications) |
| Numeración | Reinicia en 1 por equipo, formato `"{n}. {nombre}"`, sin caracteres invisibles | FR-004 |
| Posición | Nunca incluida | FR-005 |
| Orden de jugadores | Igual al orden ya mostrado en pantalla para ese equipo | FR-006 |
| Equipo sin jugadores | Se muestra solo el encabezado, sin línea vacía ni numeración debajo | Edge case del spec |
| Separador entre equipos | Exactamente una línea vacía entre el bloque de un equipo y el encabezado del siguiente | FR-009 (Clarifications) |
| Formato | Texto plano, sin HTML/rich text (los asteriscos son literales, interpretados como negrita por WhatsApp) | FR-009 |

## Ejemplo concreto

Entrada: Equipo Blanco = [Juan Pérez, Carlos Gómez], Equipo Negro = [Pedro López] (sin apellido registrado → se usa solo el nombre).

Salida esperada:

```text
*Blanco* ⬜️

1. Juan Pérez
2. Carlos Gómez

*Negro* ⬛️

1. Pedro
```

## Cómo se verifica

- **Caso feliz**: llamar a la función con un partido con ambos equipos poblados → el string resultante coincide carácter por carácter con el formato de arriba (salvo nombres).
- **Caso equipo vacío**: un equipo sin jugadores asignados → su bloque tiene solo el encabezado, sin dejar una numeración vacía ni un espaciado distinto al resto.
- **Caso de integración con el portapapeles**: el string devuelto es exactamente lo que se le pasa a `navigator.clipboard.writeText(...)`, sin transformación adicional (sin agregar timestamps, títulos ni firmas).
