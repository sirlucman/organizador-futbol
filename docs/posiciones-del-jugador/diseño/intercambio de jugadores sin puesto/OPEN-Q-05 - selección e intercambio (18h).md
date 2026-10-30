# OPEN-Q-05 — Cómo se dibujan la camiseta tocada y sus candidatos

**Respuesta: ninguna de las opciones propuestas. Va el diseño 18h** de `Equipos en el campo.dc.html` (turno 18, buscar `id="18h"`). Es la versión final, aprobada el 2026-10-30.

Los archivos HTML son **referencias de diseño**, no código para copiar. Hay que recrear el comportamiento en el código de la app con sus componentes y tokens. **Fidelidad: alta.** Los valores de abajo son finales.

Abrí `Equipos en el campo.dc.html` en un navegador: 18h es interactivo (tocar, arrastrar, cambiar de pestaña en el compacto). Arranca con Ramiro (MD del Blanco) elegido.

---

## Las dos señales (y cuál no es color)

| Estado | Señal 1 | Señal 2 (no es color) | Extra |
|---|---|---|---|
| **Tocada** | Placa rellena `--green-100` | **Elevación**: sube 3 px y escala a 1.06 | Nombre en `--ink-900` sin sombra |
| **Candidato** | Borde `--green-400` | **Forma**: recuadro propio por camiseta | Fondo blanco al 16 % |
| **Resto** | — | **Opacidad** 0.3 | La cancha se oscurece con un velo |

La tocada **no** usa `--green-400`: ese verde es el de la pastilla de puntaje, que queda encima de la placa y deja de leerse.

## Valores exactos

### Tocada (elegida)
- Placa detrás de camiseta y nombre: `position:absolute; inset:-11px 1px -4px; border-radius:12px; background:var(--green-100); box-shadow:0 6px 16px rgb(17 24 39 / 0.35)`.
- Camiseta: `transform: translateY(-3px) scale(1.06)`.
- Nombre: `color: var(--ink-900)`, sin `text-shadow` (el resto lleva `0 1px 3px rgb(17 24 39 / 0.6)` en blanco).
- Cápsula de dupla: fondo `rgb(17 24 39 / 0.82)`; el valor normal es `0.34`.
- `aria-pressed="true"`.

### Candidato
- Recuadro **por camiseta**, nunca una franja por línea, aunque sirva la línea entera: `inset:-11px 1px -4px; border-radius:12px; background:rgb(255 255 255 / 0.16); box-shadow:inset 0 0 0 1.5px var(--green-400)`.
- Hover del mouse o drag-over: `background:rgb(255 255 255 / 0.22); box-shadow:inset 0 0 0 2px #ffffff`.

### Resto
- Camisetas que no son candidatas: `opacity: 0.3`.
- Cancha: velo `rgb(17 24 39 / 0.32)` sobre las líneas de cal y debajo de las camisetas, sólo mientras hay alguien elegido.

### Transiciones
- `opacity` y `transform` con `var(--duration-fast) var(--ease-out)`.

## Ajustes de layout que vienen con esto
- **Columna de camiseta más angosta**, para que en la fila de cuatro los recuadros queden adentro de la línea de banda. La camiseta no cambia de tamaño.
  - Escritorio: `--chip-w` 88 → **80 px**, `--row-gap` 3 → **4 px**; la camiseta sigue en 56 px.
  - Compacto 390 px: `--chip-w` 80 → **72 px**, `--row-gap` 2 → **3 px**; la camiseta sigue en 48 px.
- **Pastilla 2º**: `left` −11 px → **−5 px**, para que no toque el borde del recuadro.
- El recuadro empieza 11 px arriba de la camiseta, así el puntaje y el 2º quedan adentro con aire, también cuando la elegida sube.

## Comportamiento
- **Elegir**: tocar o hacer clic en una camiseta. Con teclado, Tab y Enter o Espacio.
- **Intercambiar**: tocar un candidato. Los dos cambian de lugar; si eran de equipos distintos, los puntos y la diferencia del encabezado se actualizan en el momento.
- **Cancelar**: sólo tocando de nuevo a la elegida. Tocar el pasto no cancela y no hay botón Cancelar.
- **Tocar otra camiseta que no es candidata**: pasa a ser la elegida.
- **Arrastrar**: misma regla y mismas señales. Al levantar, la camiseta queda elegida; sólo se puede soltar sobre candidatos (`dragover` sin `preventDefault` en el resto). Si se suelta en otro lado, vuelve a su lugar y la selección se suelta. Ya no se suelta sobre una línea o un equipo, como en 8a.
- **Sin barra ni texto de ayuda.** No hay confirmación ni deshacer; está asumido así.

### Compacto (390 px, un equipo a la vez)
- La selección sobrevive al cambio de pestaña Blanco/Negro, así que se puede elegir en uno y cambiar con alguien del otro.
- Con alguien elegido, cada pestaña muestra cuántos candidatos tiene: pastilla `background:var(--ink-900); color:#fff; font:900 11px/20px var(--font-display); min-width:20px; padding:0 6px; border-radius:9999px`. Sin elegido, no se muestra.
- Al pasar arrastrando por la pestaña del otro equipo, esa pestaña se abre.

## Regla de candidatos

> **2026-10-30:** la regla de candidatos se trabaja directo en el repo. Lo de abajo queda como historia; las señales y valores de este documento siguen vigentes.
- Cada lugar de la formación tiene un puesto y cada jugador, los puestos que sabe jugar.
- Un candidato vale si **los dos pueden jugar el puesto del otro**, aunque estén en otra línea o en el otro equipo (por ejemplo, un MC del Blanco con un LD del Negro).
- En el prototipo los puestos (LI, CT, LD, MI, MC, MD, DC) y "quién sabe jugar qué" están **inventados**. Usar los puestos reales que ya tiene el código.

## Dónde está en el archivo
- Plantilla: buscar `id="18h"`.
- Lógica, en la clase al final del archivo: `swIsCand` (regla), `swTeams` (estados por camiseta), `swView` (pestañas y conteo), `swPick` (intercambio).
