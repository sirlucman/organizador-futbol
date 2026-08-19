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

**BASELINE** — comportamiento actual, tiene que pasar hoy. Incluye un test nombrado `BUG vigente:` que documenta un defecto conocido (la compensación por arquero que el refinamiento final deshace): está ahí para que el cambio quede registrado cuando `010` lo arregle, no porque el comportamiento sea deseable.

**PENDIENTE** — lo que exigen las features todavía sin implementar, agrupado por feature: `009-ventaja-sin-arquero`, `010-refinamiento-objetivo`, `013-duplas-parejas-estrategias-1-2` y `014-puntaje-dupla-por-posicion`. (`011-encaje-optimo-formacion` ya está implementada: sus 10 casos viven en el bloque BASELINE.) Falla a propósito y no hace fallar el runner. Cuando un pendiente pasa a `✓ ya cumple`, hay que moverlo al bloque BASELINE: pasa a ser comportamiento a preservar. El test `BUG vigente:` se borra cuando el pendiente que lo contradice queda cumplido.

Las features `012-puntajes-coherentes-panel` y `015-minimo-diferencia-alcanzable` no tienen tests acá: son comportamiento de interfaz y de mensajes, no del motor. Se verifican a mano en el navegador contra staging.

## El partido testigo

[fixtures.js](fixtures.js) tiene el plantel real que motivó las tres features, leído de la base de staging: 18 jugadores, dos duplas de rotación, un único candidato a arquero que entra por posición secundaria. Antes de `011`, el motor sobre ese plantel reproducía exactamente el armado que se vio en la aplicación (Blanco 51.8 / Negro 51.3), incluido el bug: la dupla que no cubre Delantero terminaba de Delantero. Hoy da 50.8 / 51.3 con la formación cumplida en los dos equipos y la misma diferencia de puntaje, que es el piso de ese plantel.

Los tests de reparto de duplas se corren con **todos los órdenes de convocatoria** (rotaciones de la lista de unidades). Sin eso pasaban por casualidad: con el orden "natural" el reparto greedy acierta, y falla recién en otros órdenes. Una garantía que solo vale para algunos órdenes no es una garantía.
