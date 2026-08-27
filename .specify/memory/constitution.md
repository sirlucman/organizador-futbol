<!--
Sync Impact Report
- Version change: 2.2.0 → 2.3.0
- Added principles: none
- Modified principles: V. Responsive por diseño — agrega el **criterio de
  verificación**: qué se mide (scroll horizontal y elementos fuera de su
  contenedor), en qué anchos (los bordes donde el layout cambia de forma, no
  dispositivos), y con qué comando (`node tests/layout.test.js`). Antes el
  principio declaraba el piso (v2.2.0) pero no cómo se comprobaba, así que el
  paso de verificación seguía siendo una casilla.
- Added sections: none
- Removed sections: none
- Deferred items:
  - TODO(OBJETIVO_TACTIL_MINIMO): el principio sigue sin fijar tamaño mínimo de
    objetivo táctil, pese a que la auditoría del 2026-08-26 encontró controles
    de 16-24px. Excluido a pedido explícito en la enmienda 2.2.0 y todavía
    abierto.
  - TODO(REDACCION_ANCHOS_HARDCODEADOS): la frase "anchos/altos hardcodeados"
    se leyó como una prohibición literal de px en controles y produjo un
    requisito incumplible (009 FR-014, corregido el 2026-08-27). Conviene
    acotarla a *layout* en una enmienda futura.
  - TODO(COBERTURA_DE_ESCENARIOS): el test de layout cubre hoy el panel de
    equipos y los parámetros de reglas — las dos zonas donde el layout se rompió.
    No cubre la lista de partidos, el listado de jugadores, la ficha de jugador,
    los modales ni el login. Se van agregando a medida que se toquen.
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

### V. Responsive por diseño
Todo desarrollo de interfaz MUST funcionar correctamente en cualquier tamaño de
pantalla desde el ancho mínimo soportado hacia arriba, con foco explícito en que
sea utilizable desde una app mobile. Está prohibido diseñar o implementar
pantallas, componentes o flujos atados a resoluciones fijas (anchos/altos
hardcodeados, layouts que solo se verifican en desktop, etc.). Esto aplica a
toda funcionalidad nueva y a cualquier modificación de una pantalla existente,
sin excepción por tratarse de una feature "chica" o de bajo tráfico.

**Ancho mínimo soportado: 360px.** La obligación corre de 360px de ancho hacia
arriba, sin techo — incluida la franja de tablet, que no está exenta por no ser
"mobile". Por debajo de 360px la interfaz PUEDE degradarse y eso no cuenta como
incumplimiento. Ningún spec de feature necesita volver a declarar este número:
se cita este principio.

**Criterio de verificación.** Cumplir este principio se comprueba midiendo, no
mirando. Una pantalla nueva o modificada cumple cuando, en cada ancho medido, se
dan las dos cosas a la vez:

1. la página no produce scroll horizontal (`scrollWidth === clientWidth`), y
2. ningún elemento queda con su borde derecho fuera del viewport — un control
   puede salirse de su contenedor sin producir scroll, si algo más arriba lo
   recorta, y ahí queda inalcanzable sin que nada se note.

Los anchos a medir son los bordes donde el layout cambia de forma —el ancho
mínimo soportado, cada breakpoint del CSS medido de los dos lados, y la franja de
tablet— y no una lista de dispositivos: un dispositivo popular puede caer lejos
de todo borde y no probar nada.

El comando es `node tests/layout.test.js`, y una pantalla que el test no cubre
todavía se agrega ahí como escenario nuevo antes de considerarla verificada. Un
escenario recién agregado MUST verse fallar al menos una vez —revirtiendo el
arreglo que lo motiva— antes de darlo por bueno: un test de layout que nunca
falló no demostró que mide algo.

**Rationale**: El uso real de la aplicación ocurre mayormente desde dispositivos
móviles (organizar partidos, ver formaciones, copiar información para compartir
por WhatsApp, etc.), por lo que una funcionalidad que no se pueda operar
cómodamente desde mobile no cumple su propósito, sin importar qué tan bien
funcione en desktop.

El piso existe porque "cualquier tamaño de pantalla" no es verificable: no se
puede pasar ni fallar contra una obligación sin número. Sin él, el paso de
verificación de este principio se volvió una casilla que se marcaba sin
evidencia, y cada feature que necesitaba un ancho concreto lo fijaba por su
cuenta. Se eligió 360px porque es el viewport de referencia de los Android en
uso; 320px (iPhone SE) se dejó afuera a conciencia: se midió que cerrarlo en la
pantalla de carga de resultado obliga a apilar cada fila de jugador, subiéndola
de 45px a 69px de alto, y ese costo vertical no se justifica por los
dispositivos que hoy usan la app. La decisión y las mediciones vienen de la
auditoría de conformance del Principio V del 2026-08-26.

El criterio de verificación existe por lo que se encontró al auditarlo: los
planes de feature que declaraban cumplimiento ("PASA", "Cumple") no habían
medido nada, y no por descuido — el principio no decía qué medir, así que no
había nada contra lo cual fallar. Verificar a ojo en el navegador tampoco alcanza:
el desborde más grande del producto vivía a 600px de ancho, una franja que nadie
abre cuando revisa "que ande en el celular", y la fila de dupla desbordaba en dos
anchos que la revisión manual contra staging no llegó a mostrar porque dependían
de un estado que los datos de prueba no tenían.

## Restricciones Técnicas y de Alcance

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

**Version**: 2.3.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-27
