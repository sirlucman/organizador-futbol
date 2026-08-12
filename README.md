# Organizador de Fútbol

## Objetivo

Aplicación web que permite administrar la organización de partidos de fútbol, facilitando la gestión de jugadores, la convocatoria de cada partido y la generación automática de equipos equilibrados.

El objetivo principal es reducir al mínimo el tiempo que lleva organizar un partido, manteniendo siempre la posibilidad de intervención manual por parte del administrador.

La aplicación está diseñada con una arquitectura modular y extensible, de forma que en futuras versiones puedan incorporarse nuevas reglas de negocio, estadísticas y funcionalidades sin necesidad de rediseñar el sistema.

## Alcance de la versión actual

Esta versión contempla únicamente la organización previa al partido:

- Administración de jugadores.
- Administración de partidos.
- Convocatoria de jugadores.
- Gestión de titulares y suplentes.
- Generación automática de equipos.
- Edición manual de equipos.
- Configuración del motor de generación.
- Historial de partidos.
- Carga básica de resultado (goles y asistencias por jugador) — captura de datos únicamente; el *análisis* (estadísticas, rankings, historial de resultados) queda fuera de alcance por ahora.

No forma parte del alcance de esta versión: administración del partido en tiempo real, cronómetro, gestión de cambios, rotaciones de jugadores, estadísticas, MVP. Estas y otras ideas futuras se registran en [`Roadmap.md`](Roadmap.md).

## Contexto

Existe un único grupo de jugadores. Generalmente se juega un partido por semana (los jueves), aunque la aplicación permite crear tantos partidos como sea necesario. Actualmente los jugadores se anotan por WhatsApp; el administrador es quien registra en la aplicación a los jugadores que participarán de cada partido.

No existe autenticación: cualquier persona con acceso a la aplicación actúa como administrador. La evolución de esto (login, perfiles, múltiples administradores) es una idea futura registrada en `Roadmap.md`, sección "Cuentas y acceso".

## Especificaciones por feature

Esta versión está compuesta por tres features, cada una con su propio spec detallado bajo `.specify/specs/`:

- [**Gestión de jugadores**](.specify/specs/002-gestion-jugadores/spec.md) — alta/edición/validaciones de jugadores, posiciones, puntajes, búsqueda/filtro, activación/desactivación, eliminación permanente.
- [**Gestión de partidos**](.specify/specs/001-organizacion-partidos/spec.md) — creación de partidos, cancha, convocatoria, titulares/suplentes, cierre/reapertura de inscripción, carga de resultado, finalización, eliminación.
- [**Motor de generación de equipos**](.specify/specs/003-motor-generacion-equipos/spec.md) — estrategias, reglas e invariantes de balance, configuración del motor, edición manual de equipos, regeneración, explicabilidad y resumen de la generación.

Restricciones técnicas transversales (persistencia en Firestore, requisitos de interfaz, principios de arquitectura, volumen esperado) están documentadas en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

Ideas para versiones futuras (estadísticas, disponibilidad de jugadores, login, múltiples grupos, etc.) viven en [`Roadmap.md`](Roadmap.md), no en los specs de feature.

## Cómo se trabaja en este repo

El spec de cada feature en `.specify/specs/` es la fuente de verdad sobre el comportamiento actual (ver `constitution.md`, Principio I). Cuando una idea de `Roadmap.md` se decide encarar, se crea o actualiza el spec de la feature correspondiente vía `/speckit-specify`, siguiendo el flujo Spec-Driven Development: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
