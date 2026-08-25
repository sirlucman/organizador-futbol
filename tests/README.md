# Tests del motor de generación de equipos

```sh
node tests/motor.test.js
```

Sin dependencias: Node y nada más. Devuelve código de salida 1 solo si se rompe el comportamiento actual.

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

Las features `012-puntajes-coherentes-panel` y `015-minimo-diferencia-alcanzable` no tienen tests acá: son comportamiento de interfaz y de mensajes, no del motor. Se verifican a mano en el navegador contra staging.

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
