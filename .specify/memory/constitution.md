<!--
Sync Impact Report
- Version change: 2.5.0 → 3.0.0
- Added principles: none
- Modified principles: todos — el contenido activo de esta constitución se retira.
  La fuente de verdad de las restricciones transversales del proyecto pasa a
  `openspec/config.yaml` (campos `context`, `rules`, `operations`), como parte de
  la adopción de OpenSpec como framework único para toda feature nueva y toda
  modificación de una feature existente (reemplaza a la metodología de tres
  documentos en `docs/` y al flujo speckit para trabajo nuevo).
- Added sections: Nota de retiro (este bloque)
- Modified sections: ninguna — el resto del documento queda congelado tal como
  regía en 2.5.0, conservado abajo solo como registro histórico.
- Removed sections: ninguna
- Deferred items: los TODOs abiertos en 2.5.0 (MIGRACION_SPECS_LEGADO,
  OBJETIVO_TACTIL_MINIMO, REDACCION_ANCHOS_HARDCODEADOS) se resuelven, si
  corresponde, dentro de `openspec/config.yaml` en vez de en este archivo.
- Templates requiring follow-up: README.md y Roadmap.md actualizados para
  apuntar a `openspec/config.yaml` en vez de a este archivo.
-->

# Organizador de Fútbol — CONSTITUCIÓN RETIRADA (2026-09-01)

**Esta constitución dejó de ser la fuente de verdad de las restricciones
transversales del proyecto el 2026-09-01.** Esa función pasó a
[`openspec/config.yaml`](../../openspec/config.yaml), como parte de la
adopción de OpenSpec como framework único para toda feature nueva y toda
modificación de una feature existente. `openspec/config.yaml` no tiene
versionado semántico ni ritual de enmienda por comando: los cambios se hacen
editando el archivo directamente y quedan registrados en el historial de git.

El texto que sigue (Principios I-VI, Restricciones Técnicas y de Alcance,
Flujo de Trabajo SDD) es el que regía hasta la versión 2.5.0. Se conserva sin
modificar solo como registro histórico — **no rige el trabajo nuevo**.

---

# Organizador de Fútbol (histórico — versión 2.5.0, retirada)

## Core Principles

### I. Los specs de feature como fuente de verdad
La fuente de verdad sobre qué hace la aplicación hoy es el conjunto de **specs de
feature vigentes**. Ninguna funcionalidad se considera parte del producto, y
ningún trabajo de implementación se inicia, si antes no está reflejada en el spec
vigente de su feature.

Un spec vigente vive en uno de estos tres lugares:

- `docs/<nombre-feature>/` — **destino obligatorio de toda feature nueva**, con la
  metodología de tres documentos: Concept Note (por qué y en qué dirección), Spec
  (qué debe hacer el sistema y cómo debe comportarse) e Implementation Plan (qué
  construir, dónde y en qué orden), producidos vía
  `/engineering-methodology:staged-engineering-doc`. Una feature PUEDE saltear el
  Concept Note cuando la dirección ya está decidida, declarándolo en su Spec.
- `.specify/specs/<NNN-nombre-feature>/spec.md` — specs de features ya
  construidas, en la estructura nativa de spec-kit. **Siguen siendo fuente de
  verdad del comportamiento que describen** y se mantienen con el flujo speckit.
  No se migran.
- `openspec/specs/<nombre-feature>/` — ídem, para las features documentadas en
  ese formato.

Cuando una Spec nueva en `docs/` modifica comportamiento ya especificado en
`.specify/` o en `openspec/`, **MUST declararlo explícitamente**, nombrando la
spec y la parte que reemplaza; esa parte queda marcada como reemplazada en la
spec vieja. Sin esa declaración, dos specs vigentes se contradicen y el principio
deja de sostenerse.

`Roadmap.md` es el backlog de ideas y zonas grises **no decididas**: vive ahí
hasta que se decide encararla, momento en el cual se crea la documentación de la
feature correspondiente y se la retira del Roadmap. El código nunca es la fuente
de verdad sobre el comportamiento esperado — si el código y el spec de una
feature difieren, es un bug a corregir (en el código o en el spec,
explícitamente). El marco general de producto (objetivo, alcance, contexto) vive
en `README.md`, que no es fuente de verdad sobre comportamiento — solo da
contexto para entender los specs de feature.

**Rationale**: Este proyecto es un ejercicio de Spec-Driven Development. Si el
spec deja de ser autoritativo, se pierde la trazabilidad entre decisión e
implementación. Lo que cambia en la enmienda 2.5.0 no es esa exigencia sino
*dónde vive el spec*: la práctica se movió a la metodología de tres documentos
hace dos features (`docs/goles-en-contra/`, `docs/orden-jugadores/`) mientras
este principio seguía nombrando únicamente a `.specify/`, de modo que el trabajo
real quedaba formalmente fuera del producto. Se reconoce el destino nuevo sin
migrar lo existente, porque migrar dieciséis specs de features ya construidas no
mejora el producto (Principio II) y la trazabilidad de cada una se conserva donde
está. El costo aceptado es la coexistencia de tres ubicaciones; la regla de
declaración explícita de reemplazo es lo que impide que ese costo se vuelva
ambigüedad.

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

### VI. Design system como fuente de verdad de UI
Toda interfaz nueva o modificada se construye a partir del design system de Football App,
documentado como skill en `.claude/skills/football-app-design/` (tokens de color, tipografía,
spacing, radios, elevación y motion; componentes; guidelines). Ninguna pantalla, componente o
estilo se implementa con colores, tipografías, radios de borde, sombras o iconografía
inventados por fuera de ese sistema — toda decisión visual se resuelve consultando primero esos
tokens/componentes, en ese orden: 1) un token o componente existente que cubra el caso, 2) una
combinación de tokens existentes, 3) recién si ninguno de los dos alcanza, una excepción
documentada explícitamente en el plan de la feature (mismo criterio que el Principio II para
complejidad) en vez de asumirse en silencio.

**Rationale**: La migración de la interfaz al design system (2026-08-28) mostró que, sin una
regla explícita, cada pantalla nueva puede reintroducir colores, tipografías o radios propios
—como ya existían antes de esa migración— y erosionar gradualmente la consistencia lograda,
feature a feature. Fijar el manual de diseño como fuente de verdad de UI hace por lo visual lo
mismo que el Principio I hace por el comportamiento: sin él, la migración queda en un evento
puntual en vez de un estándar sostenido.

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
- Cuando se decide encarar una idea del Roadmap, se documenta la feature antes de
  iniciar cualquier implementación, y se la retira del Roadmap.
- **Features nuevas**: el flujo es Concept Note → Spec → Implementation Plan en
  `docs/<nombre-feature>/`, vía
  `/engineering-methodology:staged-engineering-doc`. Cada documento se revisa
  antes de pasar al siguiente.
- **Features ya especificadas en `.specify/specs/`**: se mantienen con el flujo
  speckit — `/speckit-specify` → (`/speckit-clarify` opcional) → `/speckit-plan`
  → `/speckit-tasks` → (`/speckit-analyze` / `/speckit-checklist` opcionales) →
  `/speckit-implement`.
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

**Version**: 2.5.0 (histórica) | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-31

---

**Documento retirado — Version**: 3.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-09-01
