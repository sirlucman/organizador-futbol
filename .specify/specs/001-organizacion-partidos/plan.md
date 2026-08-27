# Constitution Check — Organización de partidos

**Feature**: `001-organizacion-partidos`
**Registrado**: 2026-08-27, contra la constitución v2.3.0
**Estado de la feature**: implementada

## Por qué esta feature no tiene un Constitution Check

Y por qué su ausencia **no es un gate salteado**.

Esta carpeta la creó el commit `3dd5c0f` (2026-08-11), *"Instalar spec-kit y migrar
Spec.md a specs por feature"*: es la **migración de un `Spec.md` monolítico previo**
al formato de specs por feature, el mismo día en que se instaló spec-kit y se
ratificó la constitución. No es una feature que haya pasado por
`/speckit-specify` → `/speckit-plan` → `/speckit-implement` y se haya salteado un
paso — es la condición inicial desde la cual ese flujo empezó a existir.

Dos consecuencias concretas:

- El **Principio V (responsive)** llegó recién en la v2.1.0, el 2026-08-13, dos días
  después. No se le puede reprochar a esta feature un principio que no existía
  cuando se escribió.
- Un Constitution Check retroactivo acá mediría el producto entero contra los cinco
  principios, no una feature: el alcance de `001` es la organización de partidos, la
  convocatoria y el ciclo de vida, o sea el núcleo de la aplicación. Esa auditoría
  es útil pero es otra cosa, y merece encararse como tal en vez de disfrazarse de
  gate de feature.

## Lo que sí se auditó

El **Principio V** sobre el alcance de esta feature, en la auditoría del 2026-08-26
(ver los commits de la rama `fix/desborde-horizontal-principio-v`). Ahí se
encontraron y corrigieron tres desbordes en pantallas de `001` — la lista de
partidos, el detalle y la lista de convocatoria — y esas pantallas quedaron cubiertas
por `tests/layout.test.js`.

Los otros cuatro principios sobre `001` siguen sin auditar. No es urgente y no
bloquea nada, pero conviene que quede dicho en vez de asumido.
