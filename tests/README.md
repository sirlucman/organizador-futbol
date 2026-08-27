# Tests

```sh
node tests/motor.test.js     # el motor de generación de equipos
node tests/layout.test.js    # el layout responsive (Principio V)
```

Los dos devuelven código de salida 1 solo si se rompe el comportamiento actual.

`motor.test.js` no tiene dependencias: Node y nada más. `layout.test.js` necesita
un navegador y explica por qué más abajo.

## Cómo está armado

El motor vive dentro del IIFE de `index.html` y no exporta nada. [harness.js](harness.js) recorta del archivo las declaraciones que necesita **por nombre** (`generarEquiposEstrategia3`, `asignarArquerosPorNiveles`, `construirUnidadDupla`, etc.) y las evalúa en un sandbox con `reglaEnabled`/`reglaParam` simulados. Así los tests corren contra el motor real sin duplicar código y sin tocar `index.html`.

Recortar por nombre y no por número de línea es a propósito: mover código dentro de `index.html` no rompe los tests. Renombrar o borrar una de esas funciones sí, y el test falla diciendo qué nombre no encontró.

Si algún día el motor se extrae a su propio archivo (lo que el Principio IV de la constitución favorece), lo único que cambia es de dónde lee `harness.js`.

## Los dos bloques

**BASELINE** — comportamiento actual, tiene que pasar hoy. Cuando un test de acá se rompe es una regresión y el runner devuelve 1.

**PENDIENTE** — lo que exige `014-puntaje-dupla-por-posicion`, la única sin implementar (y pendiente de decisión: ver su spec). El resto (`009`, `010`, `011`, `012`, `013`) ya está implementado y sus casos viven en el bloque BASELINE. Falla a propósito y no hace fallar el runner. Cuando un pendiente pasa a `✓ ya cumple`, hay que moverlo al bloque BASELINE: pasa a ser comportamiento a preservar. El test `BUG vigente:` se borra cuando el pendiente que lo contradice queda cumplido.

## La Estrategia 4 ("Formación fija pareja")

Arma igual que la Estrategia 3 y cambia una sola cosa: cómo elige el reparto entre los dos equipos. Por eso sus tests van en dos grupos:

- **Lo nuevo** — que las líneas queden parejas, que el total no se pase del margen configurado, y que con margen 0 nunca entregue un total peor que la Estrategia 3.
- **Lo heredado** — formación cumplida, nadie fuera de puesto, misma cantidad de jugadores por equipo, reparto de duplas y bloqueados. Es el grupo que importa cuando algo se rompe: una estrategia que empareja líneas rompiendo la formación no sirve para nada.

Hay dos tests clave, y hacen falta los dos porque el motor decide el armado en dos pasos: primero quién juega de qué (las posiciones) y después cómo se reparten los titulares entre los equipos.

**"el reparto elegido es el óptimo (fuerza bruta independiente)"** cubre el segundo paso. La estrategia se apoya en que enumera todos los repartos posibles y devuelve el mejor, no el mejor que encontró buscando. El test toma las posiciones que eligió el motor, genera las 2^n asignaciones de unidades a equipos por fuerza bruta, descarta las que rompen una restricción dura (cupo por posición y cupo de duplas, leídos del armado real) y comprueba que ninguna de las que quedan sea mejor. No usa la enumeración del motor: si hay un error ahí o en el costo, aparece acá.

**"el armado es el óptimo del espacio conjunto"** cubre los dos pasos a la vez, y es lo que el test anterior por sí solo no puede ver. Verificar el reparto partiendo de las posiciones que el motor eligió no dice nada sobre las posiciones que descartó: cuando varios escenarios de posiciones empatan en encaje, cuál se elija cambia el mejor balance por línea alcanzable. Este test enumera también ese eje —todos los escenarios empatados en el mejor encaje, cruzados con todos los repartos válidos de cada uno— y es el que exige FR-028. Tiene su variante con titulares bloqueados, donde el armado arranca parcialmente fijo y el espacio se restringe a los repartos que no mueven a nadie de equipo.

`PARTIDO_LINEAS_DESPAREJAS` en [fixtures.js](fixtures.js) es el partido del 2026-08-24 que motivó la estrategia: la 3 lo cerró con la diferencia total en 0.3 y la defensa despareja por 6.5, porque el mejor arquero y el mejor delantero cayeron en el mismo equipo y la defensa tuvo que pagar esos 7 puntos. Tiene dos líneas de un solo lugar por equipo con diferencias grandes (9 contra 6 en el arco, 8 contra 4 en el ataque), que es justamente lo que no se puede emparejar repartiendo: solo se puede elegir si se suman o se cancelan.

La feature `015-minimo-diferencia-alcanzable` no tiene tests acá: es comportamiento de mensajes, no del motor, y se verifica a mano en el navegador contra staging. De `012-puntajes-coherentes-panel`, el motor no tiene nada que decir, pero su FR-007 (que la fila de una dupla siga siendo operable en mobile) sí se verifica: es uno de los escenarios de [layout.test.js](layout.test.js).

## El test de layout (Principio V)

```sh
node tests/layout.test.js
LAYOUT_STRICT=1 node tests/layout.test.js
```

Verifica lo único que el Principio V de la constitución exige y que **no se puede
verificar leyendo código**: que la interfaz no produzca scroll horizontal en
ningún ancho desde el ancho mínimo soportado (360px, declarado en el principio)
hacia arriba.

Mide el markup real con el CSS real. `cargarVistas` y `cargarCSS` en
[harness.js](harness.js) recortan de `index.html` las funciones de render
(`renderTeamPlayerRow`, `renderRuleParams`, …) y el bloque `<style>`, con el
mismo criterio que el harness del motor: por nombre, sin copiar nada. Un
snapshot del CSS o una copia del HTML se desincronizan en el primer cambio y el
test pasaría midiendo algo que ya no existe.

Lo que el test sí escribe a mano son los **datos** del escenario y la **cadena de
contenedores** que envuelve cada bloque, porque esa parte de `index.html` es
markup estático y no hay función de la que recortarla. Si esa cadena cambia
(`.teams-wrap` se muda de padre, por ejemplo), hay que actualizar
`envolverEquipos`/`envolverRegla`.

**Los anchos no son "los dispositivos populares"** sino los bordes donde el
layout cambia de forma: el piso, cada breakpoint del CSS (480, 560, 700) medido
de los dos lados, y la franja de tablet. Esa franja está porque es donde el
desborde fue peor (+206px a 600px) y donde es más fácil no mirar: es tentador
leer "responsive" como "mobile" y dar por sentado que arriba de 560px sobra
lugar.

**Dos comprobaciones, y hacen falta las dos.** El scroll horizontal es el
síntoma que ve el usuario. Pero un elemento puede salirse de su contenedor sin
producir scroll, si algo más arriba lo recorta: no scrollea y aun así esconde un
control. Ese fue el bug de `.match-card-top`, donde los botones de admin
quedaban con el borde derecho en 379px dentro de un contenedor que terminaba en
325px.

### La dependencia

Es el único test del repo que depende de algo externo, y no se puede evitar:
calcular un layout de CSS grid/flex requiere un motor de render. No hay forma de
verificar este principio con Node solo.

```sh
npx playwright install chromium && npm i playwright
```

Si Playwright no está, el test **avisa y no falla** (código 0), para que la
ausencia de un navegador no rompa a quien solo quiere correr el motor. Con
`LAYOUT_STRICT=1` la ausencia sí falla, que es lo que conviene en CI: un test que
nunca corre es peor que uno que falla, porque se lee como que todo está bien.

### Que pase no alcanza

Un test de layout verde no dice nada hasta que se lo ve fallar. Cuando se agrega
un escenario, conviene revertir el fix que lo motiva y confirmar que el test lo
atrapa. Los cinco escenarios actuales se validaron así contra el `index.html`
previo al arreglo de `.teams-wrap`: dos fallaron, en 12 mediciones. Y ahí apareció
algo que la verificación manual en el navegador no había encontrado — la fila de
dupla desborda además a 390px y 768px, que en staging no se veía porque los
partidos con dupla tenían la inscripción abierta y no pintaban los inputs.

## Medir, además de testear

Los tests responden "¿el motor cumple?" sobre unos pocos planteles elegidos. [tools/medir-motor.js](../tools/medir-motor.js) responde dos preguntas que un test no puede:

```sh
node tools/medir-motor.js verificar                     # los planteles del repo contra el óptimo
node tools/medir-motor.js buscar --cancha=9 --n=400     # busca planteles donde el motor NO sea óptimo
node tools/medir-motor.js comparar <commit>             # el motor actual contra el de ese commit
node tools/medir-motor.js volcar <semilla>              # imprime un plantel como código de fixture
node tools/medir-motor.js perf                          # cuánto tarda una generación
```

**¿CUÁNTO cuesta un problema?** Genera planteles al azar (con semilla, así que todo hallazgo se reproduce) y los compara contra el óptimo del espacio conjunto. La palanca es `--mezcla`, la proporción de titulares con posición secundaria cargada: es lo que controla cuántos escenarios de encaje empatan, o sea cuán duro es el caso. Sin esto, el gap del desempate de encaje (FR-028) parecía teórico; medido, resultó que en planteles con empate el motor se quedaba corto en cerca de la mitad de los casos, hasta por 4.5 puntos en una línea. Eso es lo que justificó el arreglo.

**¿El motor de hace N commits se comportaba distinto?** `comparar` vuelca el `index.html` de un commit a un temporal, lo carga con el mismo harness y corre las dos versiones sobre los mismos planteles. Es lo que se usó para elegir los fixtures de regresión: un fixture donde el motor viejo ya acertaba no protege de nada. `PARTIDO_CANCHA9_EMPATE` salió de ahí — el motor previo al arreglo fallaba en el 41% de los planteles de cancha de 9, y ese es uno de los peores.

El ciclo completo es `comparar` → una semilla interesante → `volcar` → fixture nuevo. Los dos fixtures sintéticos de [fixtures.js](fixtures.js) llevan anotado el comando que los regenera exacto.

La definición de "óptimo" vive en [optimo-conjunto.js](optimo-conjunto.js) y la comparten los tests y la herramienta a propósito: si cada uno tuviera la suya, una podría pasar mientras la otra falla.

## El partido testigo

[fixtures.js](fixtures.js) tiene el plantel real que motivó las tres features, leído de la base de staging: 18 jugadores, dos duplas de rotación, un único candidato a arquero que entra por posición secundaria. Antes de `011`, el motor sobre ese plantel reproducía exactamente el armado que se vio en la aplicación (Blanco 51.8 / Negro 51.3), incluido el bug: la dupla que no cubre Delantero terminaba de Delantero. Hoy da 50.8 / 51.3 con la formación cumplida en los dos equipos y la misma diferencia de puntaje, que es el piso de ese plantel.

Los tests de reparto de duplas se corren con **todos los órdenes de convocatoria** (rotaciones de la lista de unidades). Sin eso pasaban por casualidad: con el orden "natural" el reparto greedy acierta, y falla recién en otros órdenes. Una garantía que solo vale para algunos órdenes no es una garantía.
