<!--
Sync Impact Report
- Version change: 2.0.0 → 2.0.1
- Modified principles: I. Los specs de feature como fuente de verdad — se quita
  el párrafo transitorio "Migración" (clarificación, no redefinición: el
  `Spec.md` monolítico que ese párrafo describía como fuente de verdad
  transitoria ya fue eliminado; el contenido fue reubicado a `README.md`
  (Objetivo/Alcance/Contexto) y a los specs de feature en `.specify/specs/`)
- Added sections: none
- Removed sections: párrafo "Migración" del Principio I (obsoleto tras
  completarse la migración y borrarse `Spec.md`)
- Deferred items: none
- Templates requiring follow-up: none
-->

# Organizador de Fútbol

## Core Principles

### I. Los specs de feature como fuente de verdad
La fuente de verdad sobre qué hace la aplicación hoy es el conjunto de specs de
feature vigentes en `.specify/specs/<NNN-nombre-feature>/spec.md` (estructura
nativa de spec-kit, creada vía `/speckit-specify`). Ninguna funcionalidad se
considera parte del producto, y ningún trabajo de implementación se inicia, si
antes no está reflejada en el spec de su feature. `Roadmap.md` es el backlog de
ideas y zonas grises **no decididas**: vive ahí hasta que se decide encararla,
momento en el cual se crea o actualiza el spec de la feature correspondiente vía
`/speckit-specify` y se retira del Roadmap. El código nunca es la fuente de
verdad sobre el comportamiento esperado — si el código y el spec de una feature
difieren, es un bug a corregir (en el código o en el spec, explícitamente).
El marco general de producto (objetivo, alcance, contexto) vive en
`README.md`, que no es fuente de verdad sobre comportamiento — solo da
contexto para entender los specs de feature.

**Rationale**: Este proyecto es un ejercicio de Spec-Driven Development. Si el
spec deja de ser autoritativo, se pierde la trazabilidad entre decisión e
implementación y el flujo `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement` deja de tener sentido. Usar la
estructura nativa de specs por feature (en vez de un documento monolítico)
mantiene esa trazabilidad 1:1 entre feature, spec, plan y tareas.

### II. Simplicidad ante todo
Se implementa lo que el spec de la feature pide para la versión actual, ni más
ni menos. Está prohibido anticipar infraestructura, abstracciones o
configuración para funcionalidades que todavía viven en `Roadmap.md` y no
fueron promovidas a un spec. Ante dos soluciones que cumplen el mismo
requisito, se elige la más simple de mantener, aunque la otra escale mejor a un
volumen que hoy no existe (ver "Volumen esperado" en "Restricciones Técnicas y
de Alcance", más abajo).

**Rationale**: El volumen de datos esperado hoy es acotado (hasta ~500
jugadores/partidos por grupo, sin garantías de rendimiento más allá de eso).
Diseñar para escala hipotética consume tiempo que no vuelve, y en un ejercicio de
aprendizaje de SDD la complejidad prematura además ensucia la trazabilidad
spec → implementación.

### III. Explicabilidad de las decisiones del motor
Toda generación automática de equipos (motor de generación) debe poder
explicarse al usuario en lenguaje claro, reflejando únicamente decisiones que
realmente ocurrieron durante la ejecución. Ninguna estrategia, regla o
parámetro del motor se implementa sin que su efecto sea explicable y quede
reflejado en el resumen de generación. Esto aplica también a cualquier
estrategia nueva que se agregue a futuro (ver "Estrategias adicionales" en
`Roadmap.md`).

**Rationale**: El valor central del motor no es solo generar equipos equilibrados
sino que el administrador confíe en el resultado y entienda por qué el sistema
tomó cada decisión. Un motor que no se explica es, para este producto, un motor
que no cumple su propósito.

### IV. Arquitectura desacoplada y modular
Se mantiene separación estricta entre interfaz, motor de generación y capa de
persistencia. La persistencia se accede siempre a través de una interfaz simple
de guardar/leer; hoy está implementada sobre Firestore, pero el resto del
código no debe asumir detalles de Firestore. El motor de generación no debe
asumir detalles de la interfaz. Nuevas reglas o estrategias del motor se
agregan sin modificar las existentes.

**Rationale**: El propio spec exige extensibilidad para incorporar nuevas reglas,
estrategias y funcionalidades (estadísticas, disponibilidad, login, etc.) sin
rediseñar el sistema. El acoplamiento temprano entre capas es la forma más común
en que ese objetivo se rompe silenciosamente.

## Restricciones Técnicas y de Alcance

- La aplicación debe ser responsive y funcionar correctamente en desktop y
  mobile.
- Persistencia centralizada y compartida en Cloud Firestore, sin almacenamiento
  local del navegador (localStorage/sessionStorage) como fuente de datos.
- El diseño está pensado para un volumen acotado de jugadores y partidos por
  grupo (hasta ~500 de cada uno); no se optimiza para volúmenes mayores hasta
  que el Roadmap lo indique explícitamente.
- Toda funcionalidad fuera del alcance de la versión actual de una feature
  permanece fuera del código hasta ser promovida a un spec.

## Flujo de Trabajo SDD

- Toda idea nueva entra primero a `Roadmap.md`, no directo a un spec ni al
  código.
- Cuando se decide encarar una idea del Roadmap, se crea o actualiza el spec de
  la feature correspondiente en `.specify/specs/` vía `/speckit-specify` antes
  de iniciar `/speckit-plan` o cualquier implementación.
- El flujo de trabajo esperado por feature es: `/speckit-specify` →
  (`/speckit-clarify` opcional) → `/speckit-plan` → `/speckit-tasks` →
  (`/speckit-analyze`/`/speckit-checklist` opcionales) → `/speckit-implement`.
- Ningún paso del flujo se saltea para ir directo a escribir código cuando el
  cambio afecta comportamiento visible para el usuario o el modelo de datos.

## Governance

Esta constitución prevalece sobre cualquier otra guía o costumbre de trabajo en
este repositorio, incluyendo los specs de feature y `Roadmap.md` en materia de
*cómo* se trabaja (no de *qué* se construye — eso lo define cada spec de
feature bajo el Principio I).

**Enmiendas**: cualquier cambio a esta constitución se hace vía `/speckit-constitution`,
documentando el motivo del cambio. Toda enmienda actualiza la versión según
versionado semántico (MAJOR: eliminación o redefinición incompatible de un
principio; MINOR: principio o sección nueva; PATCH: aclaración o corrección de
redacción) y actualiza `Last Amended`.

**Cumplimiento**: antes de correr `/speckit-plan` o `/speckit-implement` sobre una
feature, se verifica que no viole ninguno de los Principios Core. Cualquier
excepción (p. ej. una complejidad que rompe el Principio II) debe justificarse
explícitamente en el plan de la feature, no asumirse en silencio.

**Version**: 2.0.1 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
