# Quickstart: Validar Estrategia 3 (formación fija)

**Input**: [spec.md](spec.md) (User Story 1 AC10-13, User Story 2 AC8-9, User Story 3 AC8), [data-model.md](data-model.md). No hay suite automatizada (single-file `index.html`, ver `plan.md` — Testing); esta guía es de validación manual en navegador.

## Prerrequisitos

- App abierta con un grupo que tenga al menos un partido con titulares definidos, cancha `futbol8` o `futbol9`, y jugadores con posición principal/secundaria y puntajes variados (incluir al menos un jugador sin puntaje cargado en alguna posición, para el escenario 4).
- Sección de Configuración accesible para verificar la sección "reglas" (US3).

## Escenario 1 — Formación cumplida sin excedentes ni fallback

**Setup**: partido cancha `futbol8`, titulares con exactamente 3 defensores naturales, 3 volantes naturales, 1 delantero natural por equipo (más 2 arqueros naturales), sin necesidad de secundarias.

**Pasos**: seleccionar Estrategia 3 en el partido → Generar equipos.

**Esperado** (FR-018, AC10, AC8 US2):
- Cada equipo queda con exactamente 3 Defensor / 3 Volante / 1 Delantero de campo + 1 Arquero.
- El resumen indica "Formación 3-3-1 cumplida en ambos equipos" (o mención equivalente).
- No aparecen menciones de uso de secundaria para formación ni de fallback.

## Escenario 2 — Excedente natural reubicado por secundaria (FR-020, AC11)

**Setup**: cancha `futbol8`, 4 defensores naturales entre los titulares de un mismo lado del split (más candidatos para completar el resto), donde el defensor excedente tiene Volante como secundaria y hay lugar de Volante vacante.

**Pasos**: generar con Estrategia 3.

**Esperado**:
- El defensor excedente aparece jugando de Volante en su equipo.
- La explicación menciona el uso de esa secundaria para completar la formación (AC9 US2, distinta de la mención de "corregir imparidad" de Estrategia 2).

## Escenario 3 — Fallback total (FR-019c, AC12-13)

**Setup**: cancha `futbol9` con muy pocos jugadores de Volante disponibles (ni principal ni secundaria) para cubrir los 4 lugares de esa posición en ambos equipos, forzando a usar cualquier titular disponible para al menos un lugar.

**Pasos**: generar con Estrategia 3.

**Esperado**:
- El/los lugar(es) sin candidato natural/secundario se cubren igual (la generación no se bloquea).
- Si la diferencia de puntaje resultante supera `diferenciaMaxima`, aparece el warning correspondiente (mismo mecanismo que FR-012), sin bloquear ninguna acción sobre el partido.
- El resumen indica explícitamente qué equipo/posición no se pudo completar de forma "natural" (ej. "No se pudo completar el mediocampo del Equipo B") — ver Decisión 1/2 de `research.md` sobre cómo se decide qué equipo/lugar cae en este caso.

## Escenario 4 — Jugadores sin puntaje en la formación (Clarifications, Decisión 1)

**Setup**: incluir entre los titulares al menos un jugador sin puntaje cargado en Volante (ni como principal ni secundaria tiene puntaje registrado), junto con otros candidatos de Volante que sí tienen puntaje.

**Pasos**: generar con Estrategia 3.

**Esperado**: el jugador sin puntaje en esa posición solo ocupa un lugar de Volante si no queda ningún otro candidato con puntaje disponible en ese mismo nivel (principal o secundario) — nunca desplaza a un candidato con puntaje del mismo nivel.

## Escenario 5 — Configuración: invariante no apagable (US3 AC8)

**Pasos**: con Estrategia 3 como estrategia por defecto (o seleccionada en un partido), abrir la sección "Configuración".

**Esperado**:
- "Cumplir la formación fija" no aparece como regla con switch de habilitar/deshabilitar (igual tratamiento que los invariantes de arquero y balance de puntaje).
- "Balancear jugadores sin puntaje" sigue apareciendo como regla configurable normal.

## Escenario 6 — Regresión: Estrategia 1 y 2 no se rompen

**Pasos**: con el mismo partido usado en escenarios anteriores, generar con Estrategia 1 y luego con Estrategia 2.

**Esperado**: comportamiento idéntico al que tenían antes de este cambio (FR-017 — agregar Estrategia 3 no debe modificar el funcionamiento de las estrategias existentes). Sirve como chequeo de que `generarEquiposEstrategia3` no introdujo efectos colaterales en código compartido (`resolverArqueros`, `repartirBucketBalanceado`).
