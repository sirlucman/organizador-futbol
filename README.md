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

Restricciones técnicas transversales (persistencia en Firestore, requisitos de interfaz, principios de arquitectura, volumen esperado) están documentadas en [`openspec/config.yaml`](openspec/config.yaml).

Ideas para versiones futuras (estadísticas, disponibilidad de jugadores, login, múltiples grupos, etc.) viven en [`Roadmap.md`](Roadmap.md), no en los specs de feature.

## Cómo se trabaja en este repo

El spec de cada feature ya construida es la fuente de verdad sobre el comportamiento actual, esté en `.specify/specs/` o en `docs/<feature>/` (specs viejas, no migradas). Cuando una idea de `Roadmap.md` se decide encarar, o se necesita modificar una feature existente, se crea un change de OpenSpec (ver `openspec/config.yaml` para las reglas del proyecto) vía `/opsx:propose` → `/opsx:apply` → `/opsx:archive`; al archivar, la spec queda en `openspec/specs/`.

## Entorno de pruebas (staging)

La app tiene dos bases de datos Firestore: la real (`organizador-futbol`, usada por la versión publicada en `sirlucman.github.io`) y una de prueba (`organizador-futbol-staging`). `index.html` elige el proyecto según el hostname: cualquier origen que no sea `sirlucman.github.io` (correr el archivo local, en cualquier rama) usa staging automáticamente — no hace falta configurar nada.

Flujo de trabajo para un desarrollo nuevo:

1. Crear una rama a partir de `main`.
2. (Opcional) Traer datos reales frescos a staging abriendo [`tools/sync-staging-data.html`](tools/sync-staging-data.html) y apretando el botón — copia `players`, `partidos` y `motorConfig` desde producción a staging. Solo lee de producción, nunca escribe ahí.
3. Probar la rama abriendo `index.html` localmente (usa staging).
4. Si el cambio toca el motor de generación de equipos, correr `node tests/motor.test.js` (sin dependencias, devuelve 1 solo si hay una regresión). Ver [`tests/README.md`](tests/README.md), que además documenta [`tools/medir-motor.js`](tools/medir-motor.js) para medir cuánto cuesta un problema y comparar el motor contra el de un commit anterior.
5. Cuando funciona bien, mergear a `main` — se publica en GitHub Pages contra la base real, sin haberla tocado durante las pruebas.
