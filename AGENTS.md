# AGENTS.md — gobernanza y convenciones del repositorio

Este archivo es la fuente de verdad de las restricciones transversales del
proyecto (contexto, principios de producto, metodología) y de las convenciones
de trabajo que los planes de feature restatean en su §5. Reemplaza a
`openspec/config.yaml`, retirado el 2026-09-09 junto con OpenSpec y speckit;
ese archivo a su vez había reemplazado a `.specify/memory/constitution.md` el
2026-09-01. No tiene versionado semántico ni ritual de enmienda por comando:
los cambios se hacen editando este archivo directamente y quedan registrados
en el historial de git, como cualquier otro archivo del repo.

La fuente de verdad sobre *comportamiento* no vive acá: vive en los specs de
feature, bajo `docs/<feature>/` (ver "Dónde vive la fuente de verdad de cada
feature" más abajo).

## Contexto del producto

Aplicación web para organizar partidos de fútbol entre amigos: gestión de
jugadores, gestión de partidos y generación automática de equipos equilibrados,
con arquitectura pensada para incorporar nuevas reglas, estrategias y
funcionalidades sin rediseñar el sistema.

### Stack y persistencia

- Persistencia centralizada y compartida en Cloud Firestore. No se usa
  localStorage/sessionStorage como fuente de datos.
- Volumen esperado: hasta ~500 jugadores y ~500 partidos por grupo. No se
  diseña para volúmenes mayores hasta que `Roadmap.md` lo indique
  explícitamente.

### Dónde vive la fuente de verdad de cada feature

- **Metodología: los tres documentos de engineering methodology**
  (`/engineering-methodology:staged-engineering-doc`) en `docs/<feature>/` —
  Concept Note, Spec e Implementation Plan. Es la metodología con la que se
  trabaja toda feature nueva y toda modificación de una feature existente,
  salvo que el pedido diga otra cosa. Desde el 2026-09-09 es además la única
  metodología del proyecto: OpenSpec y speckit quedaron retirados y su andamio
  (skills, comandos, plantillas) se eliminó del repositorio.
- **Cláusula de confirmación (obligatoria).** Cuando el pedido NO dice con qué
  metodología trabajar, hay que PREGUNTARLE al propietario si se usa
  engineering methodology, antes de generar cualquier artefacto de
  especificación. Nunca se asume una metodología en silencio: ser la default
  define qué se propone en esa pregunta, no autoriza a saltearla. La pregunta
  es por feature, no por tarea: un arreglo puntual dentro de una feature que ya
  tiene sus documentos no vuelve a preguntar.
- **Todos los specs viven en `docs/<feature>/`.** Los de las features `001`–`015`
  vienen del flujo speckit y conservan su numeración y sus archivos (`spec.md`,
  `plan.md`, `tasks.md`, y según el caso `research.md`, `data-model.md`,
  `quickstart.md`); `docs/resultados-partido/` viene de OpenSpec y conserva
  abajo el change que lo produjo. Todos siguen vigentes como fuente de verdad
  del comportamiento que describen y NO se reescriben al formato de los tres
  documentos solo por existir.
- El código nunca es fuente de verdad: si difiere de su spec, es un bug a
  corregir explícitamente en uno de los dos lados.
- Cuando un documento nuevo modifica comportamiento ya descripto en un spec
  existente, DEBE declararlo explícitamente: qué spec y qué parte reemplaza.
  Esa parte queda marcada como reemplazada en el spec viejo. Sin esa
  declaración, dos specs vigentes se contradicen.
- `Roadmap.md` es el backlog de ideas no decididas. Una idea se retira de ahí
  recién cuando se convierte en una Concept Note o una Spec en
  `docs/<feature>/`.

## Principios de producto (se aplican a toda feature)

- **Simplicidad ante todo**: se implementa lo que la Spec pide para la versión
  actual, ni más ni menos. Nada de infraestructura, abstracciones o
  configuración anticipada para funcionalidad que todavía vive en `Roadmap.md`.
  Ante dos soluciones que cumplen el mismo requisito, gana la más simple de
  mantener, aunque la otra escale mejor a un volumen que hoy no existe.
- **Explicabilidad del motor de generación**: toda generación automática de
  equipos debe poder explicarse al usuario en lenguaje claro, reflejando
  únicamente decisiones que realmente ocurrieron durante esa ejecución. Ninguna
  estrategia, regla o parámetro del motor se agrega sin que su efecto quede
  reflejado en el resumen de generación.
- **Arquitectura desacoplada y modular**: separación estricta entre interfaz,
  motor de generación y persistencia. La persistencia se accede siempre a
  través de una interfaz simple de guardar/leer (hoy implementada sobre
  Firestore, pero el resto del código no asume sus detalles). El motor no asume
  detalles de la interfaz. Reglas o estrategias nuevas del motor se agregan sin
  modificar las existentes.
- **Responsive por diseño, piso 360px**: toda interfaz nueva o modificada
  funciona correctamente desde 360px de ancho hacia arriba, sin techo (incluida
  la franja de tablet), con foco en que sea usable desde mobile. Prohibido
  diseñar o implementar atado a resoluciones fijas (anchos/altos de layout
  hardcodeados, verificación solo en desktop), sin excepción por tratarse de
  una feature chica o de bajo tráfico. Se verifica midiendo, no mirando: en
  cada ancho donde el layout cambia de forma (el piso de 360px, cada breakpoint
  de CSS medido de los dos lados, la franja de tablet), a la vez (1) la página
  no produce scroll horizontal (`scrollWidth === clientWidth`) y (2) ningún
  elemento queda con el borde derecho fuera del viewport. Comando: `node
  tests/layout.test.js`; una pantalla que el test no cubre todavía se agrega
  ahí como escenario nuevo, y ese escenario nuevo MUST verse fallar al menos
  una vez (revirtiendo el arreglo que lo motiva) antes de darlo por bueno.
- **Design system como fuente de verdad de UI**: toda interfaz nueva o
  modificada se construye a partir del design system de Football App,
  documentado en `.claude/skills/football-app-design/` (tokens de color,
  tipografía, spacing, radios, elevación, motion; componentes; guidelines).
  Ninguna pantalla, componente o estilo se implementa con colores, tipografías,
  radios, sombras o iconografía inventados por fuera de ese sistema. Orden de
  resolución: 1) un token o componente existente que cubra el caso, 2) una
  combinación de tokens existentes, 3) recién si ninguno de los dos alcanza,
  una excepción documentada explícitamente en la Spec o el Implementation Plan
  de la feature.

### Cumplimiento

Antes de empezar a implementar —el primer commit de código de un
Implementation Plan— se verifica contra este archivo (no contra la memoria de
la conversación) que no se viole ninguno de estos principios. Cualquier
excepción necesaria (p. ej. una complejidad que rompe "Simplicidad ante todo")
se justifica explícitamente en los documentos de la feature, no se asume en
silencio.

## Obligaciones al especificar una feature

Heredadas de las `rules` de la gobernanza anterior; aplican a los tres
documentos según corresponda.

- **Concept Note / Spec:** nombrá qué idea de `Roadmap.md` se está encarando (o
  qué bug/gap se está corrigiendo) y retirala de `Roadmap.md` una vez creado el
  documento. No incluyas alcance más allá de lo que esta versión necesita
  (Simplicidad ante todo); lo que queda afuera va a `Roadmap.md`.
- **Spec:** si la feature toca el motor de generación de equipos, cada regla o
  parámetro nuevo debe quedar reflejado en el resumen de generación
  (Explicabilidad del motor). Si toca UI, la Spec declara el comportamiento
  responsive esperado desde 360px de ancho, sin excepción por tratarse de una
  pantalla chica o de bajo tráfico.
- **Implementation Plan:** verificá y declará que la separación interfaz /
  motor de generación / persistencia se mantiene; ninguna capa debe asumir
  detalles de otra (Arquitectura desacoplada). Toda decisión visual nueva se
  resuelve primero contra los tokens/componentes de
  `.claude/skills/football-app-design/`; si ninguno alcanza, documentá la
  excepción ahí explícitamente, no la asumas en silencio.
- **Tareas:** si hay una tarea de verificación responsive, agregá el escenario
  a `tests/layout.test.js` como parte de la tarea y hacé que se vea fallar
  antes del fix, no solo pasar después.
- **Reportes de crítica:** viven en la carpeta de la feature y su nombre DEBE
  incluir **qué documento se critica**, además de la fecha y el modelo crítico:
  `<FEATURE>_<CONCEPT|SPEC|PLAN>_CRITIQUE_<YYYY-MM-DD>_<modelo>.md`. El nombre
  por defecto de la metodología omite el documento, así que dos críticas del
  mismo día y del mismo modelo sobre documentos distintos de una misma feature
  colisionan: pasó el 2026-09-09 en `rol-en-el-token`, donde la segunda
  sobrescribió a la primera y sólo se detectó por el diff de git. Un reporte de
  crítica **no se edita ni se sobrescribe nunca** — es un artefacto de auditoría
  fechado y atribuido a un modelo. Para volver a criticar el mismo documento se
  escribe un reporte nuevo; lo único que se corrige en uno viejo es una ruta que
  quedó colgada, nunca el texto de un hallazgo.
- **Modelo autor en el Change log:** cuando un documento lo redacta un modelo,
  la fila del Change log nombra cuál, junto al autor humano
  (`| fecha | Lucas Manoukian (claude-opus-5) | … |`). La crítica cross-model
  necesita ese dato para verificar que el crítico es de otra familia, y sin él
  hay que confiar en la memoria de la conversación, que no es un registro.

## Commits

Formato **Conventional Commits con el asunto en español**:

```
tipo(scope): asunto en minúscula, ≤ 72 caracteres (IDs de la Spec)
```

- **Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`.
- **Scope:** la feature o la zona tocada — `cancha`, `equipos-en-el-campo`,
  `motor`, `tests`. Se omite cuando el cambio es transversal.
- **Asunto:** en español, en imperativo o en infinitivo, sin punto final.
- **IDs de la Spec** entre paréntesis al final del asunto cuando el commit
  implementa requisitos concretos: `feat(cancha): dibuja el campo y sus marcas
  (FR-001, FR-002)`.
- **Un cambio lógico por commit.** Cada commit compila y pasa lint por separado,
  para que `git bisect` sirva.
- El cuerpo explica el *por qué* cuando no es obvio del asunto.

## Tests

```sh
node tests/motor.test.js                  # el motor de generación de equipos
node tests/cancha.test.js                 # la cancha: agrupado en líneas, arrastre, escapado
node tests/panel.test.js                  # el panel de armado: números, regla de color, receipt
node tests/finalizado.test.js             # el partido finalizado: chips, fila de resultado, filas de detalle
node tests/eventos.test.js                # el modelo de eventos: síntesis, derivación, recálculo mixto
node tests/toque.test.js                  # la carga por toque: validación, borrador, detalle, deshacer
node tests/layout.test.js                 # el layout responsive (Principio V)
LAYOUT_STRICT=1 node tests/layout.test.js # en CI: la ausencia de Playwright falla
node tests/rol-script.test.js             # el script de roles: rechazos, listado, escritura conjunta
node tests/reglas.test.js                 # el rol en el token contra staging (necesita credenciales)
REGLAS_STRICT=1 node tests/reglas.test.js # en CI: la ausencia de credenciales falla
```

- Los tests viven en `tests/`, se corren con Node y devuelven 1 solo ante una
  regresión. Detalle completo en [`tests/README.md`](tests/README.md).
- **Binding de IDs de la Spec:** todo test que satisface un `S-NN`, `NFR-NNN` o
  `TC-NNN` lleva el identificador **en forma canónica con guion, dentro de un
  string literal** — el nombre del caso, o el campo `spec:` de un escenario de
  `layout.test.js`. Nunca en un comentario: los gates mecánicos de los planes lo
  buscan con `grep` y un comentario da falso positivo.

## Dependencias

El repositorio **no versiona ningún lockfile** y la aplicación no tiene
dependencias instaladas: es un `index.html` que carga Firebase por CDN.
Playwright es una dependencia opcional de desarrollo, externa al repositorio,
que solo necesita `tests/layout.test.js`.

### Validar los diagramas Mermaid

Los documentos de feature llevan diagramas Mermaid obligatorios, y se validan
**renderizándolos**, no leyéndolos:

```sh
npx -y @mermaid-js/mermaid-cli@latest -i diagrama.mmd -o diagrama.png -s 2 -b white
```

Esa CLI trae su propio Puppeteer y **falla si falta el `chrome-headless-shell` de
la versión exacta que pide** — el mensaje de error dice cuál, y se instala con
`npx -y puppeteer browsers install chrome-headless-shell@<versión>`. Es otra
dependencia opcional de desarrollo, externa al repositorio. El Chromium de
Playwright no le sirve: son cachés distintos.

Y una advertencia que costó descubrir: **que un diagrama renderice sin error no
significa que se lea.** El `C4Context` de `rol-en-el-token` renderizaba perfecto y
tenía dos rótulos superpuestos e ilegibles, y eso sólo se vio mirando la imagen.
Hay que abrir el PNG, no conformarse con que el comando terminó bien. Cuando dos
flechas se cruzan, los rótulos se separan con `UpdateRelStyle(a, b, $offsetX=…,
$offsetY=…)`.

Y un modo de falla distinto, descubierto al validar el Implementation Plan de
`rol-en-el-token`: **un `;` dentro del texto de un mensaje de `sequenceDiagram`
rompe el parseo.** Para ese parser el punto y coma es separador de sentencias,
así que corta la línea a la mitad y falla pidiendo una flecha que no está
(`Expecting 'SOLID_ARROW'… got 'NEWLINE'`). Se usa un guión largo en su lugar.
Los `<` y `>` en el texto de un mensaje también conviene evitarlos.

## Estilo

- Toda la aplicación vive en `index.html`, dentro de un IIFE. No hay paso de
  build, ni bundler, ni framework (principio de simplicidad ante todo, ver
  "Principios de producto" más arriba).
- La interfaz se construye con plantillas de cadena e `innerHTML`, como el resto
  del archivo. **Todo texto que venga de un jugador se escapa** antes de
  insertarse, tanto en contenido como en atributos.
- Los valores visuales salen del design system
  ([`.claude/skills/football-app-design/`](.claude/skills/football-app-design/)),
  en el orden que fija el principio de design system como fuente de verdad de
  UI (ver "Principios de producto" más arriba).
- `tests/harness.js` recorta declaraciones de `index.html` **por nombre**.
  Renombrar o borrar una de las funciones de su lista `DECLARACIONES` rompe
  `motor.test.js`: si se renombra, se actualiza la lista en el mismo commit.

## Ramas

Una feature grande se entrega por rebanadas, y cada rebanada usa dos ramas
(`D-11` del Concept Note de `equipos-en-el-campo`):

- `docs/<rebanada>` — Spec e Implementation Plan. Se mergea primero.
- `feature/<rebanada>` — el código. Se mergea después.

Las dos salen de `main`. Se prueba abriendo `index.html` localmente, que apunta
a la base de staging automáticamente; se mergea a `main` cuando funciona, y ahí
GitHub Pages publica contra la base real.
