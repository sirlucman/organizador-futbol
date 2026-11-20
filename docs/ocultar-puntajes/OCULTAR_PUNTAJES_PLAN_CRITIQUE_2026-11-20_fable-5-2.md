# Critique — OCULTAR_PUNTAJES_IMPLEMENTATION_PLAN.md (per-doc)

> **Critic model:** claude-fable-5-2
> **Author model:** claude-opus-5-5 (Change log del Plan, §17)
> **Date:** 2026-11-20
> **Inputs:** `docs/ocultar-puntajes/OCULTAR_PUNTAJES_IMPLEMENTATION_PLAN.md` en `06b10c9`
> (rama `docs/ocultar-puntajes`). Como referencia, sin criticarlos:
> `OCULTAR_PUNTAJES_SPEC.md`, `OCULTAR_PUNTAJES_CONCEPT.md`, `index.html`, `tests/`.
> **Independencia (Step 7.0):** familias distintas, mismo proveedor — *proceed with caveat*.
> Es el nivel intermedio que la rúbrica acepta: puede quedar sesgo residual compartido.

## Verdict

**COMMENT** — 0 🔴 / 7 🟡 / 5 🔵. Ninguna invariante de la metodología está rota: §12.1
cubre los 54 escenarios y variantes de la Spec, §16 tiene los 25 AC con su columna `Test`,
los nueve TC tienen fila en §12.9, y todos los gates mecánicos corren vacíos. Las anclas a
`index.html` y `tests/` son correctas casi sin excepción. Lo que hay que corregir antes de
ejecutar la rama 2 está en otro lado: dos referencias a una tarea equivocada en la tabla de
corridas rojas, dos gates de §12.9 que no miden lo que dicen, y varios ayudantes de test que
no pueden hacer lo que el Plan les pide tal como están escritos.

### Alcance de la verificación

Todo lo que sigue se hizo en esta sesión, sobre `06b10c9`.

- **Gates corridos tal cual están escritos:** `T-1.D5`, `T-1.D8b` (11 escenarios vistos),
  `T-1.D10`, `T-1.D10b`, `T-1.D11` (12 commits, ninguno sobre 72), `T-1.D15` (6), `T-1.D16`,
  `T-1.D17` a y b, `T-1.D18`, `T-1.D18b`, `T-1.D19` (también `D` contra la Concept Note).
  Todos vacíos. Se comprobó además que no pasan en vacío: los conjuntos de la izquierda de
  cada `comm` tienen contenido (17 `TD`, 74 `T-N.*`, 74 `FR`, 55 `S`, 6 `NFR`, 9 `TC`).
- **Script de §7.2.7:** vacío con `bash`. Ver hallazgo 11 para `zsh`.
- **Anclas abiertas y confirmadas en `index.html`:** 498, 809, 834, 899, 902-903, 1535-1538,
  1617, 2145, 3310, 4937-4942, 5211-5216, 5381, 5388, 5423, 5428, 5433, 5447, 5775-5781,
  5785, 5800-5807, 5824-5837, 5851-5854, 5856-5860, 5863, 6016-6022, 6158-6163, 6171-6178,
  6315-6317, 6324, 6892, 6931-6961, 6947, 6957, 7101-7103, 7139, 7145-7176, 7194-7289,
  7455-7469, 7474-7488, 8423-8446, 8775-8786. Desvíos de una o dos líneas, sin consecuencia.
- **Anclas confirmadas en `tests/`:** `layout.test.js` 45, 268-296, 500-505, 512-519,
  522-526, 583-610, 624, 1345, 1580-1581, 1594, 1856-1857, 1876, 1913, 1928, 2440, 2533,
  3172, 3449-3453, 3535, 3538; `fixtures-app.js` 300-412, 422, 444, 497-518, 501;
  `intercambio.test.js` 237, 468-469; `finalizado.test.js` 186. Las ocho búsquedas de
  `.panel-icono-copiar` de `TD-14` son ocho.
- **Claims externos (`MD-26`):** `eye.svg` y `eye-off.svg` de `lucide-static@0.544.0` existen
  en unpkg; `eye` lleva un `<circle>` y `eye-off` no, como supone `INVARIANTE_OJO`.
  `detect-branching-model.sh` devuelve `trunk-based (basis: fallback)`.
- **Diagramas (`MD-24`):** los dos se renderizaron con `mermaid-cli` y se miró el PNG. Se
  leen; 12 y 3 nodos.
- **Guardas `TD-03` a `TD-11` contra escenarios existentes:** ningún test de unidad recorta
  `renderCamiseta`, `renderSelectorEquipo`, `marcarArrastreEnDom`, `encabezadoCampoEquipos`
  ni los encabezados; sólo `finalizado.test.js` recorta `renderFilaResultado`, y `TD-11` lo
  cubre. Ningún escenario `jugador` existente afirma un `<h4>`, un `.team-total`, una «2º»,
  una «!» ni un `title` con las menciones recortadas. Los tres escenarios que cuentan u
  ordenan `.panel-icono` son los que el Plan nombra. No se encontró ningún escenario roto sin
  mencionar.
- **Orden de la rama 2 (`TC-030`):** se siguió escenario por escenario qué guarda falta en
  cada corrida roja. La tabla es correcta salvo lo que dicen los hallazgos 4 y 6.

## Findings

### Per-doc — Accuracy

### 1. Dos AC de la Spec se cumplen por interpretación, sin declararla

- **Dimension:** Accuracy
- **Where:** `OCULTAR_PUNTAJES_IMPLEMENTATION_PLAN.md` §3.1 `TD-14` (línea 101), §12.9
  filas `TC-011` y `TC-040` (líneas 752, 757), §16 `AC-18` y `AC-23`
- **What:** El Plan da por satisfechos `AC-18` y `AC-23` con algo distinto de lo que su
  texto pide, y no lo dice.
- **Why it matters:** Quien revise el merge contra la letra de la Spec encuentra dos AC que
  no se cumplen. La metodología pide frenar y proponer la enmienda cuando el Plan descubre
  que la Spec no sirve como está; el Plan lo hizo para la tabla 3 y acá no.
- **Evidence:** `AC-18` (Spec §11.3): "el ojo se dibuja dentro de los dos encabezados
  existentes **con la clase de Copiar**". `TD-14`: "Clase propia `.panel-icono-ojo` […] No se
  reutiliza `panel-icono-copiar`". La razón de `TD-14` es buena y está verificada
  (`tests/layout.test.js:1913`, `1928`, `3538` le harían clic al ojo), pero `TD-14` cita
  `FR-005`, `TC-031` y `NFR-004`, no `TC-011` ni `AC-18`. `AC-23`: "un test con un jugador de
  nombre `<b>Ana</b>`"; `ocultar-textos` usa `int-img`, cuyo nombre es
  `<img src=x onerror=alert(1)>` (`tests/fixtures-app.js:326`). Es evidencia más fuerte, no
  la que el AC nombra.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Enmendar la Spec con una fila de Change log: `AC-18` pasa a "con el
  patrón `.panel-icono` y el color de Copiar" (que es lo que dice `TC-011`), y `AC-23` a "un
  jugador cuyo nombre contiene HTML". O, si no se toca la Spec, declarar las dos lecturas en
  `TD-14` y en la fila `TC-040` de §12.9.

### 2. El gate de `TC-013` cuenta líneas que mencionan la variable, no lugares que la escriben

- **Dimension:** Accuracy
- **Where:** Plan §12.9 fila `TC-013` (línea 754); §3.1 `TD-02` y `TD-04`
- **What:** `grep -c "puntajesOcultos" index.html` igual a 4 no mide "la escriben sólo dos
  lugares" y, con el estilo del archivo, va a dar otro número con una implementación
  correcta.
- **Why it matters:** Un gate que falla con código correcto se arregla cambiando el número,
  y deja de proteger `FR-019`.
- **Evidence:** `grep -c` cuenta líneas con una mención cualquiera. (a) `renderBotonOjo`
  (`TD-04`) tiene que conocer el estado para elegir ícono y nombre, y `TD-04` no dice por
  dónde lo lee: si lee `puntajesOcultos`, son 5. (b) `index.html` comenta cada estado de
  pantalla nombrándolo (el de `copiadoDelPartido`, que termina en la línea 2143; el de
  `seleccionIntercambio`, 5727-5729): un comentario sobre la variable nueva suma líneas.
  (c) Una quinta línea que sólo lee no viola `FR-019` y haría fallar el gate.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Medir asignaciones: `grep -cE "puntajesOcultos[[:space:]]*=[^=]"
  index.html` igual a 3 (declaración, alternancia, reinicio). Y decir en `TD-04` que
  `renderBotonOjo` lee el estado con `puntajesVisibles()`.

### 3. El gate de `TC-010` no cubre el cuerpo de `window.__generarEquipos`

- **Dimension:** Accuracy
- **Where:** Plan §12.9 fila `TC-010` (línea 751)
- **What:** De las funciones que `TC-010` nombra, una queda sin comparar.
- **Why it matters:** `AC-17` pide "`git diff` sobre esas funciones vacío". Un cambio dentro
  del manejador de generación pasaría el gate.
- **Evidence:** `extraer` sólo reconoce declaraciones `function|const|let`
  (`tests/harness.js:45-46`), y `window.__generarEquipos = function(…)` no lo es
  (`index.html:4836`); por eso el Plan lo trata aparte con `git diff main -U0 -- index.html |
  grep "__generarEquipos = "`. Con `-U0` el diff sólo trae las líneas cambiadas, así que ese
  `grep` detecta un cambio en la línea 4836 y ninguno en las que siguen.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Recortar el manejador de las dos versiones y compararlo, como hace
  `cuerpoDeManejador` en `tests/orden.test.js:362`, dentro del mismo `node -e`.

### 4. `arrastrarSobre` no devuelve lo que `S-06a` necesita leer

- **Dimension:** Accuracy
- **Where:** Plan §7.3.6, fila `ocultar-intercambio` (línea 433) y ayudantes (línea 402)
- **What:** El escenario afirma "ningún `.con-costo` durante el arrastre" a partir de
  `arrastrarSobre(…, { soltar: false })`, y ese ayudante no informa el costo.
- **Why it matters:** `S-06a` es la única parte de `ocultar-intercambio` que depende de
  `TD-08`; las demás ya las guarda `T-2.4`. Si la aserción no puede leer nada, la corrida
  roja de `T-2.10` para ese escenario no ocurre, y `FR-034` queda sin test.
- **Evidence:** La `foto` que devuelve tiene `seleccionadas`, `candidatas` y `conSeleccion`
  (`tests/layout.test.js:589-594`), no las `.con-costo`. Y despacha `dragend` siempre, con o
  sin `soltar` (línea 605), así que al volver las marcas ya se quitaron
  (`quitarEstadoDeSeleccionDelDom`, `index.html:6166-6170`). El Plan le suma a
  `arrastrarSobre` el destino `pestana`, no este dato. Tampoco pide la precondición en
  "visible": que el mismo arrastre sí marque un `.con-costo`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Sumar `conCosto` a la `foto` (ids de `.camiseta.con-costo` tras el
  `dragstart`) y declararlo junto al destino `pestana`. En el escenario, afirmar primero en
  "visible" que la lista no está vacía y después en "oculto" que sí.

### 5. Los invariantes con parámetros no pasan por el runner como está

- **Dimension:** Accuracy
- **Where:** Plan §7.3.6, ayudantes `INVARIANTE_OJO(situacion, estado)`, `INVARIANTE_OCULTO`
  + `LISTA_OCULTO` (líneas 373-393) y los ocho `ocultar-encabezado-*`; §4 fila
  `tests/layout.test.js`
- **What:** El Plan pide invariantes que dependen de valores de Node, y el runner los evalúa
  sin argumentos dentro de la página.
- **Why it matters:** Tal como está descripto, el primer `ocultar-encabezado-*` tira un
  `ReferenceError` dentro de `page.evaluate`, que el runner no atrapa: se cae la suite
  entera, no el escenario.
- **Evidence:** `for (const inv of declarados) problemas = problemas.concat(await
  page.evaluate(inv));` (`tests/layout.test.js:4563`). Playwright serializa el texto de la
  función: no viajan ni `situacion` y `estado` de una fábrica ni la constante
  `LISTA_OCULTO`. Todos los invariantes existentes son funciones cerradas; el único con
  parámetro, `INVARIANTE_VENTANA_FECHA`, usa su valor por defecto (línea 4035). Correrlos
  desde `comprobar` no sirve: corre en un solo ancho (línea 4572) y el Plan los quiere en
  los diecisiete.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Decir cómo. Lo más chico: que el runner acepte una entrada
  `[función, argumento]` y llame `page.evaluate(fn, arg)`; `LISTA_OCULTO` viaja como
  argumento, y `ocultar-barrido` usa la misma lista del lado de Node. Es un cambio al
  runner: va en §4 y §7.3.5, con la suite completa corrida después.

### Per-doc — Consistency

### 6. La tabla de corridas rojas y `TD-04` apuntan a `T-2.7`, que es otra tarea

- **Dimension:** Consistency
- **Where:** Plan §3.1 `TD-04` (línea 91); §7.3.6 tabla "Cómo se ve fallar", tercera fila
  (línea 469); §7.3.1 (línea 332)
- **What:** Tres referencias a `T-2.7` quedaron corridas respecto del checklist.
- **Why it matters:** La tabla es el registro de `TC-030`. Quien la siga al pie corre los
  `ocultar-encabezado-*-visible` en una tarea donde todavía no existen. `T-N.D18` no lo ve,
  porque `T-2.7` está definida.
- **Evidence:** Checklist: `T-2.7` es "Borrar `updateTeamTotalsDisplay`", `T-2.8` escribe
  `INVARIANTE_OJO` y los escenarios, `T-2.9` copia los trazos y agrega el botón. `TD-04`:
  "con los trazos copiados […] en `T-2.7`" (es `T-2.9`). Tabla: "`T-2.7`, antes del botón"
  (es `T-2.8`). §7.3.1: "después el botón (`T-2.7` a `T-2.9`)" (es `T-2.8` a `T-2.9`). §14 y
  §12.2 sí usan los números correctos.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Corregir las tres referencias.

### 7. "Diez specs con la nota" son nueve, y dos textos de la rama 1 quedaron viejos

- **Dimension:** Consistency
- **Where:** Plan §4 última fila (línea 130), §7.2 *Goal*, `T-1.D7`, `T-1.D12`, `IMP-06`
  (línea 700); §7.1 tracker (línea 189); §7.2.8
- **What:** El Plan dice que diez specs llevan la nota; la llevan nueve. El tracker dice
  que falta trabajo que el checklist marca hecho.
- **Why it matters:** Menor, pero `T-1.D7` afirma una cuenta que su propio script no
  verifica, y la descripción del PR (`T-1.D12`) la va a repetir.
- **Evidence:** `grep -rl OCULTAR_PUNTAJES_SPEC.md docs` fuera de la carpeta devuelve nueve
  archivos; el script de §7.2.7 recorre nueve. La décima es `CARGA_POR_TOQUE_SPEC.md`, que la
  Spec deja sin marcar a propósito: la Spec dice "acota requisitos de diez specs", no que las
  diez estén marcadas. Tracker: "faltan la tabla 3 (`T-1.1`) y este Plan", con `T-1.1` a
  `T-1.C2` en `[x]` y los commits `08a4b04` y `6195087` hechos. §7.2.8 lista seis archivos;
  contra `main`, que es la base de la rama, son dieciséis (`git diff --name-status
  main..HEAD`), incluido `Roadmap.md`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** "Diez specs acotadas, nueve marcadas" en los cinco lugares; actualizar
  la nota del tracker; aclarar que §7.2.8 es el inventario desde `bad0178` o completarlo.

### Per-doc — Completeness

### 8. Detalles que el Plan no fija y que deciden si un escenario mide algo

- **Dimension:** Completeness
- **Where:** Plan §7.3.6, filas `ocultar-bloqueo`, `ocultar-jugador-*`, `ocultar-carga`,
  `ocultar-gestos`, `ocultar-jugador-propiedad`, `ocultar-datos` (líneas 417-438)
- **What:** Seis escenarios dejan sin decir un dato del que depende que se puedan escribir o
  que no pasen en vacío.
- **Why it matters:** El Plan es el contrato que ejecuta un agente. Cada uno de estos puntos
  es una decisión que hoy queda a su criterio.
- **Evidence:**
  - `ocultar-bloqueo` no nombra el partido, y su referencia "(como
    `tests/layout.test.js:1345`)" lleva a un escenario que abre `2026-09-17`, que es
    `m-sin-equipos` (`tests/fixtures-app.js:275`): ahí no hay ojo. Los dos escenarios
    existentes del aviso abren ese partido (líneas 1333 y 1348). Ningún escenario muestra
    hoy el aviso sobre un partido **con** equipos; que `m-abierto` lo dibuje con ese
    `fixture` es deducción (comparte `convocados`), no algo visto.
  - Por debajo del corte del switch mobile la columna de equipos arranca oculta con la
    inscripción abierta (comentario de `tests/layout.test.js:4425-4429`), y `MEDIR` saltea lo
    que tiene `display:none` (línea 4452). El Plan no dice que el `preparar` de los
    escenarios de layout llame `mostrarEquiposMobile`. Sin eso, `ocultar-jugador-armado`
    mediría el desborde de `NFR-001` sin la tarjeta a la vista. No verifiqué en el CSS cómo
    se oculta la columna.
  - `S-04d` compara `window.scrollY` antes y después de `alternarOjo`, que usa
    `page.click`. Si el desplazamiento "hasta la cancha" saca el ojo del viewport, Playwright
    desplaza la página antes del clic y la comparación deja de medir `FR-016d`.
  - `S-07e` suelta `int-img` sobre `int-diego`, que está en el Negro
    (`tests/fixtures-app.js:353`). El paso anterior del mismo escenario corre a 360 px, donde
    el Negro no se dibuja; el Plan no dice que este paso vuelve a 1200.
  - `ocultar-jugador-propiedad` dice "cada partido con equipos de los datos" y enumera ocho.
    Con `conPuestosCruzados` hay doce: faltan `m-finalizado-eventos`, `m-finalizado-nueve`,
    `m-int-sin-arquero` y `m-int-puntaje`, que no tiene `posicionAsignada`
    (`tests/fixtures-app.js:384-392`).
  - `ocultar-datos` usa `mulberry32` "como `tests/intercambio.test.js:468-469`"; en
    `layout.test.js` no existe.
- **Confidence:** High en cinco; Medium en el del switch mobile
- **Severity:** 🟡 Should fix
- **Suggested fix:** Una línea por escenario: el partido de `ocultar-bloqueo` y la
  precondición de que el aviso esté en "visible"; `mostrarEquiposMobile` en `escenarioOjo` y
  en los `ocultar-jugador-*`; en `S-04d`, un desplazamiento que deje el ojo a la vista, con
  `scrollY > 0` afirmado antes del clic; el ancho de `S-07e`; la lista de la propiedad
  derivada de los datos; `mulberry32` entre los ayudantes nuevos.

### 9. Ningún escenario alterna el ojo con un borrador de carga no vacío

- **Dimension:** Completeness
- **Where:** Plan §7.3.6, fila `ocultar-carga` (línea 430)
- **What:** `FR-015` enumera el borrador de carga entre lo que el ojo no modifica, y ninguna
  aserción lo mira.
- **Why it matters:** Es el único dato de `FR-015` que vive sólo en memoria: las cero
  escrituras de `ocultar-datos` no dicen nada sobre él.
- **Evidence:** `ocultar-carga` carga un gol ya en "oculto", lo deshace, y recién en `S-04d`
  toca el ojo, con el borrador vacío. Por el código el borrador sobrevive
  (`ensureResultadoDraft`, `index.html:4937-4942`), pero eso es lectura, no test. La Spec
  tampoco tiene un escenario para esto; el Plan puede cubrirlo sin enmendarla.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** En `ocultar-carga`, antes de Deshacer: tocar el ojo dos veces y afirmar
  que el marcador sigue "1 – 0" y el chip sigue en la camiseta.

### 10. El test de `S-07g` no mira el manejador que muestra el aviso

- **Dimension:** Completeness
- **Where:** Plan §7.3.6, fila `'ocultar/S-07g: …'` (línea 435) y su corrida roja (línea 476)
- **What:** La aserción "por construcción" recorre tres funciones puras y deja afuera
  `window.__tocarCamiseta`, que es quien muestra el aviso.
- **Why it matters:** `FR-044c` dice "mostrará igual". Una guarda del ojo puesta en el
  manejador pasaría el test.
- **Evidence:** El test busca `puntajesVisibles` y `puntajesOcultos` en el texto de
  `resolverToqueCamiseta`, `evaluarIntercambio` y `textoAvisoIntercambio`. Que el caso sólo
  se pueda producir en unidad es correcto y tiene precedente
  (`tests/intercambio.test.js:237-249`). `extraer` no recorta manejadores `window.*`, pero
  `tests/orden.test.js:362` ya tiene con qué.
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Sumar el cuerpo de `window.__tocarCamiseta` a los textos que el test
  revisa.

### Per-doc — Clarity

### 11. El script de `AC-04` da siete fallas falsas si se corre en `zsh`

- **Dimension:** Clarity
- **Where:** Plan §7.2.7 (líneas 227-257) y `T-1.D7`
- **What:** El script depende de que el shell parta `$ids` en palabras, y `T-1.D7` no dice
  con qué shell correrlo.
- **Why it matters:** `zsh` es el shell por defecto de macOS y el de esta máquina. Falla
  hacia el lado seguro (ruido, no un falso verde), pero es el gate de `AC-04`.
- **Evidence:** Corrido el mismo archivo: con `bash`, salida vacía; con `zsh`, siete líneas
  `NO DEFINIDO: <archivo> FR-041 FR-042b …`, una por cada spec con más de un ID, porque
  `for id in $ids` recibe la lista entera como un solo valor. Los demás gates del Plan no
  tienen el problema: se corrieron en `zsh` y dan lo mismo que en `bash`.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Que `T-1.D7` diga "guardado en un archivo y corrido con `bash`".

### 12. Dos conclusiones correctas apoyadas en una comprobación que no las prueba

- **Dimension:** Clarity
- **Where:** Plan §3.1 `TD-16` (línea 103); §7.3.6, "Escenarios que ya existen y cambian"
  (líneas 454-458)
- **What:** `TD-16` y la lista de escenarios `jugador` afectados razonan con un dato que no
  es el que importa.
- **Why it matters:** Las conclusiones valen, verificadas acá por otro camino, y `T-2.2` y
  `T-2.6` corren la suite completa. Pero la razón escrita no alcanza para repetir la
  verificación.
- **Evidence:** `TD-16`: "Ningún escenario lo llama hoy (`grep -rn signOut tests/`…)". A
  `signOut` lo llama la aplicación (`window.auth.logout`, `index.html:1535-1538`), no los
  tests; lo que hay que buscar es un escenario que cierre sesión. No hay ninguno (`grep -n
  "logout\|Cerrar sesión" tests/*.js` sólo encuentra un comentario de `sesion.test.js`). La
  lista nombra cuatro escenarios `jugador` que abren un partido con equipos; son ocho:
  faltan `arrastre-permisos`, `fecha-encabezado-jugador`, `fecha-jugador` y la página
  `jugador` de `intercambio-permisos` (`tests/layout.test.js:2271`, `4026`, `4334`, `2834`).
  Revisados: ninguno afirma nada que la corrección cambie.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Reemplazar el `grep` de `TD-16` por el de cierre de sesión y completar
  la lista de escenarios, o cambiarla por "todo escenario con `rol: 'jugador'`".

### Per-doc — Methodology-invariants

None ✓

Verificado: rutas y símbolos exactos en todo el Plan; §5 con `Commits`, `Tests`, `Binding`
y `Supply-chain: none — <razón>`; §6 replicado como `T-1.D1`–`T-1.D20` y `T-2.D1`–`T-2.D20`;
tareas `T-N.C*` entre grupos, con los ocho asuntos propuestos entre 53 y 68 caracteres;
`Branching model: trunk-based` detectado y confirmado; `Custom arc: 2 branches` con razón
legítima, y tracker y grafo con dos ramas, las dos desde `main`; sin flag, declarado en
`TD-01` y §10 con el revert como kill-switch; `Level` del conjunto cerrado, con `S-07g` en
`unit` justificado; sin pirámide declarada; §8 y §9 como no aplica con razón; diagramas de
§3 y §7.1 en Mermaid, renderizados y legibles; sin `[UNVERIFIED]` pendientes, y los claims
externos comprobados.

## Summary

- Blocking: 0
- Should fix: 7 (hallazgos 1, 2, 3, 4, 5, 6, 8)
- Suggestions: 5 (hallazgos 7, 9, 10, 11, 12)
- Methodology-invariants violated: ninguna
