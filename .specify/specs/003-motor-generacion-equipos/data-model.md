# Data Model: Estrategia 3 (formación fija)

**Input**: [spec.md](spec.md) (Key Entities, FR-018 a FR-021), [research.md](research.md). No hay cambios al modelo de datos de Jugador ni de Partido (ver Assumptions del spec) — este documento cubre únicamente las estructuras nuevas/extendidas dentro del motor (`index.html`) y el resultado que produce, no un esquema de persistencia nuevo.

## Entidades existentes reutilizadas (sin cambios de forma)

- **Jugador**: `{id, nombre, apellido, estado, principal, secundarias: [], scores: {posición: número|null}}`. `principal` ∈ `POSITIONS = ['Arquero','Defensor','Volante','Delantero']`. Sin cambios: Estrategia 3 solo lee estos campos.
- **Partido**: usa `m.estrategia` (ahora puede valer `'estrategia3'`) y `m.cancha` (clave de `CANCHAS`) — ambos campos ya existentes, sin cambio de esquema.

## Estructuras extendidas

### `CANCHAS[cancha].formacion`

Nuevo campo dentro de la entrada existente de cada cancha:

```js
CANCHAS = {
  futbol8: { label, jugadoresPorEquipo: 8, formacion: { defensores: 3, volantes: 3, delanteros: 1 } },
  futbol9: { label, jugadoresPorEquipo: 9, formacion: { defensores: 3, volantes: 4, delanteros: 1 } },
}
```

- **Invariante**: `formacion.defensores + formacion.volantes + formacion.delanteros === jugadoresPorEquipo - 1` (el `-1` es el arco, resuelto aparte). Vale para ambas canchas soportadas hoy.
- Una cancha sin `formacion` definida (edge case ya documentado en el spec) hace que Estrategia 3 no esté disponible/aplicable para ese tamaño — fuera de alcance de esta versión.

### `ESTRATEGIAS.estrategia3`

Misma forma que las entradas existentes: `{label, resumen, descripcion}`. Sin campos nuevos.

### `REGLAS_INVARIANTES` — entrada "Formación fija"

Entrada informativa nueva, misma forma que la entrada existente `arqueros`, con un campo adicional para condicionarla a la estrategia activa (no existe hoy porque el único invariante actual, `arqueros`, aplica siempre):

```js
{ key: 'formacionFija', label: 'Formación fija', descripcion: '...', soloEnEstrategia: 'estrategia3' }
```

- La UI de Configuración filtra esta entrada por `soloEnEstrategia === estrategiaActualOPorDefecto` antes de mostrarla, igual que ya filtra reglas configurables por `soloEn` (US3 AC6/AC8).

## Resultado de `generarEquiposEstrategia3(...)` (forma de salida)

Misma forma de retorno que `generarEquiposEstrategia2` (para que el resto del pipeline de renderizado — `renderTeamsSection`, comparación con generación anterior, persistencia — no necesite ramas nuevas por tipo), con un campo adicional:

```js
{
  equipoA: [Jugador...],       // ya asignados con su posicionAsignada (igual que Estrategia 2)
  equipoB: [Jugador...],
  arquerosInfo: {...},          // igual forma que Estrategia 2 (FR-005 reusado)
  arquerosPorSecundaria: {...},
  arquerosExcedentes: [...],
  swaps: [...],                 // usos de posición secundaria con puntaje menor al de otro candidato (FR-019b), reusa la forma de Estrategia 2 (AC US2.9)
  formacion: {                  // NUEVO — estado de cumplimiento por equipo (FR-009 con Estrategia 3, AC8 US2)
    objetivo: { defensores, volantes, delanteros },  // copia de CANCHAS[m.cancha].formacion
    equipoA: { cumplida: boolean, faltantes: ['Volante', ...] },  // posiciones que debieron cubrirse vía fallback FR-019(c)
    equipoB: { cumplida: boolean, faltantes: [...] },
  },
}
```

- **`swaps`** se reutiliza para dos casos que la explicación debe distinguir (AC9 US2): swap "para corregir imparidad" (ya existente, Estrategia 2) vs. swap "para completar formación con puntaje menor a otro candidato" (nuevo, FR-019b) — se distinguen con un campo `motivo` dentro de cada entrada de `swaps` (`'imparidad' | 'formacion'`).
- **`formacion.equipoX.cumplida`**: `false` únicamente cuando al menos un lugar de ese equipo se cubrió vía el fallback FR-019(c) (cualquier titular disponible, ni principal ni secundario para ese lugar). Alimenta directamente la mención de AC8 US2 ("Formación 3-3-1 cumplida en ambos equipos" / "No se pudo completar el mediocampo del Equipo B").

## Algoritmo de asignación de formación (contrato interno, no persistido)

Entrada: pool de titulares de campo (post-arqueros) + `formacion` objetivo. Pasos, en orden (ver `research.md` Decisiones 2-3 para el porqué de cada uno):

1. Para cada posición en orden `[Defensor, Volante, Delantero]`, para cada "ronda" de lugar (1..N según la formación), resolver el lugar de Equipo A y luego el de Equipo B antes de pasar a la siguiente ronda — nunca completar un equipo entero primero (Decisión 2).
2. Para cada lugar: aplicar FR-019 (a) naturales con puntaje → (a') naturales sin puntaje → (b) secundarios con puntaje → (b') secundarios sin puntaje → (c) fallback priorizando no alejarse de `diferenciaMaxima` (Decisión 1).
3. Excedentes naturales de una posición (FR-020) se reubican en su mejor secundaria que coincida con un lugar vacante *antes* de caer al fallback (c) de ese jugador.
4. Si múltiples lugares llegan simultáneamente al nivel (c) en la misma ronda, resolverlos en el orden de posición ascendente ya fijado en el paso 1 (Decisión 3) — no se necesita una regla adicional porque el orden de iteración ya es ascendente.
5. Jugadores de campo que sobran después de llenar toda la formación de ambos equipos (si el pool es mayor al requerido por la formación) se reparten con el mismo criterio de balance general (`repartirBucketBalanceado`) usado como colchón, análogo al remanente de Estrategia 2.
