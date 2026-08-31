# Handoff: Equipos en el campo (rediseño del armado y la carga de resultados)

## Overview

Rediseño de tres momentos de `organizador-futbol`: **leer el armado de equipos sobre una cancha**
(en vez de una lista por línea), **leer un partido finalizado** con goles / goles en contra /
asistencias sobre las camisetas, y **cargar el resultado tocando la camiseta** en vez de llenar
~60 casillas numéricas. Cada momento está resuelto en escritorio (tarjeta de 836 px) y en compacto
(390 px).

Todo está mostrado en **fútbol 8** (formación 3-3-1). El turno 8 agrega el caso de **cancha de 9**
(3-4-1), donde la línea del medio pasa a cuatro camisetas — es el único caso que obliga a ajustar
medidas.

Para tamaños más allá de nueve, ver § A futuro: canchas de otros tamaños — está planteado, no
diseñado.

Repo destino: `sirlucman/organizador-futbol` (`main`) — app web de una sola página, HTML + JS
vanilla en `index.html`. Ver `github.md` en la raíz del proyecto de diseño para el mapeo
pantalla → archivos del repo.

## About the Design Files

Los archivos de este bundle son **referencias de diseño escritas en HTML** — prototipos que
muestran la apariencia y el comportamiento buscados, **no código para copiar y pegar**.

`Equipos en el campo.dc.html` es un Design Component: un HTML con plantilla declarativa
(`<sc-for>`, `<sc-if>`, holes `{{ }}`) más una clase de lógica, que corre sobre el runtime
`support.js`. **Ese runtime no va al producto.** La tarea es **recrear estos diseños en el entorno
del repo destino** — DOM + CSS vanilla dentro de `index.html`, con los patrones que ya usa la app —
tomando de acá los valores exactos: geometría, colores, tipografía, estados y reglas.

Lo mismo vale para los componentes del design system (`Card`, `Badge`, `Button`): están mounteados
como componentes React desde `_ds/.../_ds_bundle.js`, pero en el repo destino se reproducen como
markup plano. Los tres están especificados abajo con sus valores.

### Cómo abrirlo en VS Code

1. Abrí la carpeta `design_handoff_equipos_en_el_campo/` en VS Code.
2. Levantá un servidor estático — Live Server, o `python3 -m http.server 8080` — y abrí
   `http://localhost:8080/Equipos%20en%20el%20campo.dc.html`. (Con `file://` también carga, pero un
   servidor evita sorpresas de CORS.)
3. Todo está local: no hay CDN ni dependencias externas. Las fuentes sí salen de Google Fonts
   (`_ds/.../tokens/fonts.css`); sin internet, Inter cae a la fuente de sistema.
4. Los diseños son interactivos: arrastre de camisetas, candados, regenerar, carga de eventos,
   Deshacer, Guardar. Probalos antes de implementar — muchas reglas se entienden mejor usándolas.

## Fidelity

**Hi-fi.** Colores, tipografía, espaciado, radios, sombras y estados son finales. La geometría de
la cancha y de la camiseta está en porcentajes y píxeles exactos: reproducila tal cual. Los datos
(nombres, puntajes, el resultado 3–2) son de muestra.

## Screens / Views

Doce vistas, cinco turnos de diseño. Los ids (`4a`, `5a`, …) son los que se usan en la
conversación y aparecen como badge arriba de cada tarjeta.

| Id | Vista | Ancho | Eyebrow de la tarjeta |
|---|---|---|---|
| `4a` | Equipos generados — dos campos, dupla en el medio del Blanco | 836 px | Equipos generados |
| `5a` | Partido finalizado — goles, EC y asistencias sobre el campo | 836 px | Partido finalizado |
| `6a` | Equipos generados, compacto — un equipo a la vez | 390 px | Equipos generados |
| `6b` | Partido finalizado, compacto | 390 px | Partido finalizado |
| `7a` | Carga de resultados, escritorio — los dos campos a la vez | 836 px | Carga de resultados |
| `7b` | Carga de resultados, compacto — un equipo a la vez | 390 px | Carga de resultados |
| `8a` | Fútbol 9 (3-4-1) — dos campos, fila de cuatro volantes | 836 px | Equipos generados |
| `8b` | Fútbol 9 (3-4-1), compacto | 390 px | Equipos generados |
| `8c` | Fútbol 9 — partido finalizado, dos campos | 836 px | Partido finalizado |
| `8d` | Fútbol 9 — partido finalizado, compacto | 390 px | Partido finalizado |
| `8e` | Fútbol 9 — carga de resultados, dos campos | 836 px | Carga de resultados |
| `8f` | Fútbol 9 — carga de resultados, compacto | 390 px | Carga de resultados |

### 4a — Equipos generados (escritorio)

**Propósito.** Ver el reparto que hizo el motor y corregirlo a mano.

**Layout.** Tarjeta 836 px. Header en una fila: `h3` "Alineaciones" a la izquierda, bloque derecho
(Badge de diferencia · botón redondo Copiar · botón redondo Regenerar). Debajo, la fila
`ESTRATEGIA` + combo (§ Combo de estrategia) y, cuando la estrategia elegida no es la aplicada, el
disclaimer. Después, `grid-template-columns: 1fr 1fr; gap: var(--space-xl)` con un campo por equipo.
Cada columna: fila nombre + puntaje (`flex; justify-content: space-between`), después el campo. Al
pie, § Diferencia por línea y desvío aceptable, y § Por qué quedaron así.

**Componentes.** Campo (§ Cancha), camisetas (§ Camiseta) con puntaje y candado, cápsula de dupla.
Sin íconos de gol.

**Copy.** "Alineaciones" · "Equipo Blanco" / "Equipo Negro" · "pts" · "Diferencia N pts" /
"Equipos parejos". Los dos botones de la derecha son solo ícono (§ Botones de ícono del header).

### 5a — Partido finalizado (escritorio)

Misma cancha que 4a, en modo lectura: **sin candados, sin regenerar, sin arrastrar**.

**Layout.** Header: `h3` "Sábado, 5 de Septiembre - Fútbol 8" + caption "Estrategia: {estrategia}"; a la
derecha, botón redondo de lápiz ("Editar resultado", 17 px). Debajo, fila de resultado (§ Fila de
resultado). Debajo, los dos campos. Debajo de cada campo, el detalle en texto (§ Filas de detalle),
sin botón `−`.

**Nuevo respecto de 4a.** Chips de estadística pegados a la camiseta (§ Chips de estadística):
asistencias abajo a la izquierda, goles y goles en contra abajo a la derecha.

### 6a — Equipos generados (compacto, 390 px)

**Layout, de arriba a abajo.** Header (`h3` "Alineaciones"; botones Copiar y Regenerar de 15 px a
la derecha) → fila `ESTRATEGIA` + combo (§ Combo de estrategia) → disclaimer si hay estrategia sin
aplicar → selector de equipo (§ Selector segmentado) → fila `puntaje · Badge diferencia` → campo →
caption "Arrastrá una camiseta a otro lugar, o sobre la pestaña del otro equipo para pasarlo" →
§ Diferencia por línea (2 columnas) → § Por qué quedaron así.

**Diferencia funcional.** Las pestañas del selector **también reciben el drop**: arrastrar una
camiseta sobre la pestaña del otro equipo pasa al jugador y cambia de pestaña.

### 6b — Partido finalizado (compacto)

Header (`h3` "Sábado, 5 de Septiembre" + caption "Fútbol 8 · Estrategia: {…}", lápiz de 14 px) → fila de
resultado compacta → selector de equipo (sin drop) → campo con chips de estadística → detalle en
texto del equipo visible, sin `−`.

### 7a — Carga de resultados (escritorio)

**Propósito.** Reemplazar las ~60 casillas numéricas: se elige **una vez** qué se está anotando y
se toca la camiseta.

**Layout.** Header (`h3` "Sábado, 5 de Septiembre - Fútbol 8" + caption "Elegí qué estás cargando y tocá la
camiseta del jugador"; a la derecha Badge `positive` "Resultado guardado" o Badge `neutral` con el
conteo) → fila de resultado, que se recalcula en vivo → selector de evento de 4 columnas
(§ Selector de evento) + hint → los dos campos, con las camisetas como **botones** → debajo de cada
campo, el detalle con botón `−` por línea → pie: caption "Los goles en contra se suman al rival ·
el puntaje del jugador no se toca acá" + los íconos de Deshacer y Guardar (§ Guardar y Deshacer).

**Estados de la camiseta-botón.** `hover`/`active`: `background: rgb(255 255 255 / 0.16)`;
`active` agrega `transform: scale(var(--press-scale))`. Radio 14 px, padding `4px 2px 3px`.

### 7b — Carga de resultados (compacto)

Header (`h3` "Sábado, 5 de Septiembre" + caption "Fútbol 8 · tocá la camiseta para cargar"; Badge "Guardado"
cuando corresponde) → fila de resultado compacta → selector de evento (labels cortos, ícono arriba
del texto) + hint → selector de equipo → campo → detalle con `−` de 38 px → pie con los íconos de
Deshacer y Guardar, juntos a la derecha.

### 8a — Fútbol 9, 3-4-1 (escritorio)

**Propósito.** El mismo armado de 4a en cancha de 9: `1 ARQ / 3 DEF / 4 VOL / 1 DEL`. Nueve por
lado, plantel de 18.

**Layout.** Idéntico a 4a — header (`h3` "Alineaciones"; a la derecha Badge de diferencia + botones
Copiar y Regenerar), fila `ESTRATEGIA` + combo con su disclaimer, dos campos en `1fr 1fr`, candados
y arrastre completos. Al pie, caption "La fila de cuatro volantes usa columnas de 88 px; la camiseta
no cambia de tamaño" y § Diferencia por línea.

**Lo único que cambia respecto de 4a.** La fila de cuatro se resuelve **angostando la columna, no
la camiseta**: `--chip-w` 96 → 88 px, `--row-pad` 20 → 8 px, `--row-gap` 6 → 3 px. `--chip-size`
sigue en 56 px y `--chip-name` en 11.5 px, así que la camiseta, el pill de puntaje y el candado son
los mismos que en 4a. La cápsula de dupla baja su padding a `3px 7px 4px`. El realce de línea al
arrastrar usa `inset: -3px 6px`.

**Cuentas.** 4 × 88 + 3 × 3 = 361 px dentro de un campo de 382 px (836 − 48 de padding − 24 de gap,
dividido en dos). Queda ~10 px de aire.

### 8b — Fútbol 9, 3-4-1 (compacto)

Misma estructura que 6a: header con Copiar y Regenerar de 15 px → fila `ESTRATEGIA` + combo con su
disclaimer → selector de equipo (que **también recibe el drop**) → fila `puntaje · Badge diferencia`
→ campo → § Diferencia por línea (2 columnas). Caption al pie: "Camiseta de 48 px y columnas de
80 px: los cuatro volantes entran sin encimarse".

**Acá sí baja la camiseta.** `--chip-w: 80px; --chip-size: 48px; --chip-name: 10.5px;
--row-pad: 6px; --row-gap: 2px`. Con la camiseta más chica bajan también sus adornos:

| Elemento | 6a / 6b (52 px) | 8b (48 px) |
|---|---|---|
| Pill de puntaje | `min-width: 24px; padding: 0 5px; 900 11px/18px; right: -3px` | `min-width: 22px; padding: 0 5px; 900 10.5px/17px; right: -3px` |
| Candado | `20×20px`, ícono 12 px | `19×19px`, ícono 11 px |
| Nombre | `700 11px/16px` | `700 10.5px/15px` |
| Cápsula de dupla | `padding: 3px 8px 4px; radius 12px`, nombres `/14px`, ícono 13 px | `padding: 3px 6px 4px; radius 12px`, nombres `/14px`, ícono 12 px |
| Realce al arrastrar | línea `inset: -3px 6px`, camiseta `inset: -4px -3px` | línea `inset: -3px 4px`, camiseta `inset: -4px -2px` |

**Cuentas.** 4 × 80 + 3 × 2 = 326 px dentro de un campo de 342 px (390 − 48 de padding). Queda
~8 px de aire. Es el límite: con cinco en una fila hay que cambiar de estrategia, no de tamaño.

### 8c / 8d — Fútbol 9, partido finalizado

8c es 5a en cancha de 9; 8d es 6b en cancha de 9. Misma estructura, mismos íconos de gol / gol en
contra / asistencia, mismas filas de detalle en texto (sin botón `−`, es lectura). 8c muestra los
dos campos con su detalle debajo de cada uno; 8d, un equipo a la vez con el selector.

Lo único que cambia son las medidas de la fila de cuatro (§ 8a / § 8b) y el título:
"Sábado, 5 de Septiembre - Fútbol 9" + caption "Formación 3-4-1 · Estrategia: {estrategia}" en 8c;
"Sábado, 5 de Septiembre" + "Fútbol 9 · 3-4-1 · {estrategia}" en 8d.

**Chequeo de holgura de los chips de estadística.** Con columna de 88 px y camiseta de 56 px, los
pills de asistencia (que salen a la izquierda) y los de gol (a la derecha) del jugador de al lado
quedan a ~17 px de distancia. En 48/80 px la holgura baja pero sigue sin choque. Si un jugador
acumula gol **y** gol en contra **y** asistencia, los dos grupos pueden tocarse — es el mismo límite
que ya tiene 5a, no algo nuevo de la cancha de 9.

### 8e / 8f — Fútbol 9, carga de resultados

8e es 7a en cancha de 9; 8f es 7b. Selector de evento de cuatro columnas, camisetas como botones,
filas de detalle con `−` (26 px en 8e, 38 px en 8f), y los íconos de Deshacer y Guardar
(§ Guardar y Deshacer).

**Log independiente.** El partido de 9 tiene su propio log de eventos y su propio evento activo: lo
que se carga en 8e/8f no toca lo que está cargado en 7a/7b, y los dos selectores de evento se mueven
por separado. En el producto esto es lo esperable — son partidos distintos — y es la razón de que el
estado tenga claves propias (§ State Management).

**Resultado de muestra:** 4 – 3, con los dos volantes nuevos en el marcador (`b9` 1 gol, `n9` 1
asistencia). Ver § Datos de muestra.

---

## Especificaciones compartidas

### Fecha del partido

Los headers de partido (finalizado y carga) muestran **día y fecha, sin hora**: "Sábado, 5 de
Septiembre" — día de la semana, coma, número de día, mes con inicial mayúscula. Cuando además va el
tamaño de cancha, se agrega con guion: "Sábado, 5 de Septiembre - Fútbol 9". La hora no aparece en
ninguna pantalla.

### Cancha

Idéntica en las seis vistas. Contenedor: `position: relative; width: 100%; aspect-ratio: 68/105;
background: var(--green-700) (#417513); border-radius: var(--radius-lg) (16px); overflow: hidden`.

Todas las marcas son `position: absolute`, `2px solid rgb(255 255 255 / 0.42)` salvo aclaración:

| Marca | Valores |
|---|---|
| Perímetro | `inset: 3% 4%` |
| Línea del medio | `left: 4%; right: 4%; top: 50%; height: 2px; background: rgb(255 255 255 / 0.42)` |
| Círculo central | `left: 50%; top: 50%; width: 27%; aspect-ratio: 1/1; transform: translate(-50%,-50%); border-radius: 50%` |
| Punto central | `7×7px; transform: translate(-50%,-50%); border-radius: 50%; background: rgb(255 255 255 / 0.55)` |
| Área grande | `left: 50%; top: 3%; transform: translateX(-50%); width: 52%; height: 14.5%; border-top: none` |
| Área chica | igual, `width: 24%; height: 5.2%; border-top: none` |
| Arco (portería) | `top: 1.2%; width: 12%; height: 1.8%; border-bottom: none; background: rgb(255 255 255 / 0.1)` |
| Semicírculo del área | `top: 17.5%; width: 19%; height: 4.4%; border-top: none; border-radius: 0 0 50% 50% / 0 0 100% 100%` |
| Punto de penal | `left: 50%; bottom: 11.5%; transform: translate(-50%,50%); 5×5px; border-radius: 50%; background: rgb(255 255 255 / 0.5)` |

El lado inferior espeja el superior: `bottom` en vez de `top` (3% / 3% / 1.2% / 17.5%),
`border-bottom: none` en vez de `border-top: none`, y el semicírculo con
`border-radius: 50% 50% 0 0 / 100% 100% 0 0`. En 6a y 6b hay además un punto de penal arriba
(`top: 11.5%; transform: translate(-50%,-50%)`).

**Capa de jugadores.** `position: absolute; inset: 0; display: flex; flex-direction: column;
justify-content: space-evenly; padding: 2% 0 1%`. Cada línea es
`display: flex; align-items: flex-start; justify-content: center; gap: var(--row-gap); padding: 0 var(--row-pad)`.

Las líneas se renderizan **invertidas** (`lines.slice().reverse()`): DEL arriba, ARQ abajo.

Variables por vista:

| Vista | `--chip-w` | `--chip-size` | `--chip-name` | `--row-pad` | `--row-gap` |
|---|---|---|---|---|---|
| 4a, 5a | 96px | 56px | 11.5px | 20px | 6px |
| 7a | 96px | 56px | 11.5px | 16px | 4px |
| 6a, 6b | 92px | 52px | 11px | 8px | 4px |
| 7b | 92px | 52px | 11px | 6px | 2px |
| 8a, 8c, 8e | 88px | 56px | 11.5px | 8px | 3px |
| 8b, 8d, 8f | 80px | 48px | 10.5px | 6px | 2px |
### A futuro: canchas de otros tamaños

Las medidas de arriba están escritas por vista, y eso no escala: cada tamaño nuevo pide un pase de
diseño. Queda planteado — **sin diseñar** — reemplazarlas por una regla única derivada de la
formación, para cuando haga falta soportar fútbol 5, 6, 7 u 11.

La idea: en vez de fijar `--chip-w` / `--chip-size` / `--chip-name` por tamaño, fijar solo sus
**máximos** y dejar que la columna se achique sola con flex (`flex: 0 1 var(--chip-w); min-width: 0`)
hasta que la línea más ancha entre; con `container-type: inline-size` en la camiseta, su tamaño y su
tipografía salen de la columna en `cqw` en vez de estar tabulados. Vertical no necesita nada: las
líneas ya se reparten con `justify-content: space-evenly`.

Dos cosas a validar antes de tomar el camino:

1. Que la regla reproduzca las medidas que ya se ajustaron a mano en 8a / 8b para cancha de 9 — si
   no las reproduce, la regla está mal calibrada, no las vistas.
2. Cuántas camisetas por fila aguanta antes de que el nombre deje de leerse. A ojo, el límite está
   en cinco; de ahi en más probablemente haya que **partir la línea en dos sub-filas escalonadas**
   en lugar de seguir achicando. Ninguna cancha actual llega a ese caso (fútbol 11 tiene 4 como
   máximo), asi que no es urgente.

### Camiseta

Envoltorio: `flex; flex-direction: column; align-items: center; gap: 5px` (escritorio) o `4px`
(compacto); `width: var(--chip-w); border-radius: 13px`. En las vistas arrastrables,
`cursor: grab` y `cursor: grabbing` en `active`.

Camiseta: `<svg viewBox="0 0 48 44" width="100%" height="100%">` con un solo `path`:

```
M18 3 C20 7 22 8 24 8 C26 8 28 7 30 3 L38 6 L46 15 L37 22 L34.5 19 L34.5 39
A2 2 0 0 1 32.5 41 L15.5 41 A2 2 0 0 1 13.5 39 L13.5 19 L11 22 L2 15 L10 6 Z
```

`fill: var(--chip-bg); stroke: var(--chip-stroke); stroke-width: 1.2` y en el `<svg>`
`filter: drop-shadow(0 3px 7px rgb(17 24 39 / 0.35))`. Contenedor de la camiseta:
`position: relative; width/height: var(--chip-size)`.

- **Equipo Blanco** — `--chip-bg: #ffffff`, `--chip-stroke: rgb(17 24 39 / 0.32)`
- **Equipo Negro** — `--chip-bg: #111827`, `--chip-stroke: rgb(255 255 255 / 0.3)`

**Nombre.** `color: #ffffff; font: 700 var(--chip-name)/17px var(--font-sans)` (compacto: `/16px`);
`white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
text-shadow: 0 1px 3px rgb(17 24 39 / 0.6)`. Formato por defecto: nombre + inicial del apellido
("Nicolás V.").

**Puntaje.** `position: absolute; top: -3px; right: -4px` (compacto `-3px`); `min-width: 26px`
(compacto 24px); `padding: 0 6px` (compacto `0 5px`); `border-radius: 9999px;
background: var(--green-400) (#a4cf49); color: var(--ink-900); font: 900 12px/20px var(--font-display)`
(compacto `900 11px/18px`); `text-align: center;
box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 0.75), 0 2px 6px rgb(17 24 39 / 0.4)`.

**Candado** (solo 4a y 6a). `position: absolute; top: -3px; left: -4px` (compacto `-3px`);
`22×22px` (compacto `20×20`); `border-radius: 9999px`; ícono 13 px (compacto 12) con
`stroke-width: 2.4`.

- Fijado: `background: var(--color-primary-pale) (#e4f0c4); color: var(--color-ink-deep) (#2a5d0a);
  box-shadow: inset 0 0 0 1.5px rgb(42 93 10 / 0.35), 0 2px 6px rgb(17 24 39 / 0.35)`; hover
  `#ffffff`. Candado cerrado (arco completo, cuerpo relleno).
- Sin fijar: `background: rgb(17 24 39 / 0.32); color: var(--color-canvas);
  box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 0.6)`; hover `var(--color-ink)`. Candado abierto.

**Cápsula de dupla** (dos jugadores que rotan en un mismo lugar). Reemplaza al nombre:
`flex; flex-direction: column; align-items: center; gap: 1px; padding: 3px 9px 4px`
(compacto `3px 8px 4px`); `border-radius: 13px` (compacto 12); `background: rgb(17 24 39 / 0.34);
box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.3)`. Dentro: nombre A, ícono de rotación (dos
flechas curvas, 14 px / compacto 13, `stroke: var(--green-400)`, `stroke-width: 2.2`), nombre B —
ambos `700 var(--chip-name)/15px` (compacto `/14px`), blancos, con ellipsis. El puntaje de la dupla
es el **promedio** de los dos, formateado con la misma regla que el resto.

### Chips de estadística (5a, 6b, 7a, 7b)

Dos grupos anclados al borde inferior de la camiseta:

- **Asistencias** — `position: absolute; left: -9px; bottom: -3px; padding-left: 6px` (compacto
  `left: -8px; padding-left: 5px`); cada pill con `margin-left: -6px` (compacto `-5px`) para
  solaparse.
- **Goles y goles en contra** — espejo: `right: -9px; padding-right: 6px` (compacto `-8px` / `5px`);
  `margin-right: -6px` (compacto `-5px`).

Cada pill: `display: flex; align-items: center; gap: 2px; height: 19px` (compacto 18);
`padding: 0 4px; border-radius: 9999px; box-shadow: 0 2px 5px rgb(17 24 39 / 0.45);
background-color: #E8EBE6`. Dentro: el número en `900 11px/1 var(--font-display)` (compacto
`900 10.5px/1`), `color: var(--color-ink)`, y el ícono de 13 px (compacto 12).

El fondo es `#E8EBE6` en todos los casos: camiseta sola y de dupla, escritorio y compacto.

Íconos: `assets/goal-icon.png` (gol), `assets/goal-icon-red.png` (gol en contra),
`assets/boot-icon.png` (asistencia). El número va **siempre**, también con 1.

### Fila de resultado

**Escritorio.** `display: flex; align-items: center; justify-content: center;
gap: var(--space-lg); padding: var(--space-md) 0; border-top / border-bottom: 1px solid var(--color-canvas)`.
Tres bloques: izquierda `flex: 1` (nombre `var(--type-body-md-strong)` + puntaje
`900 16px/24px var(--font-display)` con `font-variant-numeric: tabular-nums` + "pts"
`var(--type-caption)` en `var(--color-mute)`), centro `flex: none` con
`900 40px/44px` – `900 22px/44px var(--color-mute)` – `900 40px/44px`, derecha espejo con
`justify-content: flex-end`.

**Compacto.** `gap: var(--space-sm); padding: var(--space-sm) 0`; "Blanco" / "Negro" en
`var(--type-body-sm-strong)` (`flex: 1`, el izquierdo `text-align: right`); marcador
`900 30px/34px` con guion `900 17px/34px`.

### Selector segmentado (equipo)

`position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px;
border-radius: 9999px; background: var(--color-canvas-soft)`.

Thumb: `position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); border-radius: 9999px;
background: var(--color-primary); transition: left var(--duration-fast) var(--ease-out)`;
`left: 4px` o `left: 50%`.

Botones: `position: relative; z-index: 1; padding: 10px 0; border: none; background: none;
color: var(--color-ink); font: var(--type-body-sm-strong)`; hover `opacity: 0.7`; active
`opacity: 0.7; transform: scale(var(--press-scale))`.

Estado de drop (6a): `<span>` con `inset: -2px; border-radius: 9999px;
background: rgb(133 182 50 / 0.28); box-shadow: inset 0 0 0 2px var(--green-400);
pointer-events: none`.

### Selector de evento (7a, 7b)

Igual al anterior pero `grid-template-columns: repeat(4, 1fr)`, con
`left: calc(4px + {i} * (100% - 8px) / 4)` y `width: calc((100% - 8px) / 4)`.

- **7a** — botón en fila: `display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px 0; font: var(--type-body-sm-strong)`; ícono 16 px. Labels: `Gol`, `Penal`,
  `En contra`, `Asistencia`.
- **7b** — botón en columna: `gap: 3px; padding: 8px 0 6px; font: var(--type-eyebrow)`; ícono
  17 px arriba del texto. Labels: `Gol`, `Penal`, `En contra`, `Asist.`

Hover `opacity: 0.65`; active suma `transform: scale(var(--press-scale))`.

Hint debajo (`var(--type-caption)`, `var(--color-mute)`), según el evento activo:

| Evento | Hint |
|---|---|
| Gol | Tocá la camiseta del que convirtió |
| Penal | Tocá la camiseta del que convirtió de penal |
| En contra | Tocá la camiseta del que se la hizo en contra |
| Asistencia | Tocá la camiseta del que dio el pase |

En 7a el hint termina con " · tocá otra vez para sumar el segundo".
### Filas de detalle

Una fila por jugador y por familia de evento: `display: flex; align-items: center; gap: 6px`.
Nombre `var(--type-body-sm-strong)` en `var(--color-ink)`; después
`display: flex; align-items: center; gap: 3px; font: 900 12px/1 var(--font-display)` con el número
y el ícono de 14 px; después, si hay, la nota en `var(--type-caption)` / `var(--color-mute)`:
`(N de penal)` para goles de penal, `(EC)` para goles en contra.

Botón `−` (solo 7a / 7b): `margin-left: auto; flex: none`; `26×26px` en 7a, `38×38px` en 7b;
`border: 1px solid rgb(17 24 39 / 0.18); border-radius: 9999px; background: none;
color: var(--color-mute)`; hover `background: var(--color-canvas); color: var(--color-ink)`; ícono
de menos 13 px (7b: 15 px) con `stroke-width: 2.6`; `title="Sacar uno"`.

Vacío (7a / 7b): "Sin eventos cargados para este equipo".

### Por qué quedaron así (4a, 6a, 8a, 8b)

Debajo del campo, la justificación del armado. **No es texto fijo**: las líneas las genera el motor
a partir del plantel que está en pantalla y de la estrategia **aplicada**, igual que hoy —
arrastrar un jugador de línea o sacar un candado cambia lo que dice, y cambiar la estrategia lo
cambia recién al regenerar. En el repo esto es
`explicacionesGeneracion` (`index.html` ~3875-4012) y se pinta en `.explain-box`; acá se reusan las
mismas cadenas, con el orden de emisión del motor.

**Layout.** `display: flex; flex-direction: column; gap: 8px` (compacto `7px`) con
`padding-top: var(--space-md)` y `border-top: 1px solid var(--border-subtle)` (`#f1f5f9`). Label
"Por qué quedaron así" en `var(--type-eyebrow)` + `letter-spacing: var(--letter-spacing-eyebrow)`,
`text-transform: uppercase`, `var(--color-mute)`. Lista sin `list-style`: cada ítem es
`display: flex; gap: 9px` (compacto `8px`) con un punto de 5 px en `var(--color-primary)`
(`margin-top: 7px` / `6px`) y el texto en `var(--type-body-sm)` / `var(--color-body)` con
`text-wrap: pretty`. **Sin caja ni borde** — el `.explain-box` del repo tiene fondo y hairline;
sobre la cancha eso compite, así que acá el bloque se separa con un divisor.

**Qué líneas emite, y con qué condición** (todas textuales del motor):

| Condición | Línea | En el repo |
|---|---|---|
| Estrategia 3 o 4, cupos completos | "Formación 3-3-1 cumplida en ambos equipos." | 3891 |
| Estrategia 3 o 4, algún cupo incompleto | "No se pudo completar la formación 3-3-1 en el Equipo Blanco." | 3894 |
| Estrategia 4, línea de campo despareja | "Se emparejó cada línea además del total: la más despareja quedó en Medio, por 1 punto." | 3903 |
| Estrategia 4, líneas de un solo lugar con diferencia | "Arco y Ataque tienen un solo lugar por equipo: …" + "Quedaron a favor de equipos distintos…" / "No se pudieron cruzar…" | 3913 |
| Estrategias 2, 3, 4 · ningún arquero | "No hay arqueros entre los titulares: …" | 3926 |
| Estrategias 2, 3, 4 · un solo arquero | "Hay un solo arquero: el Equipo Negro quedó sin arquero fijo (rotan…)." | 3937 |
| Una dupla | "La dupla de rotación quedó en el Equipo Blanco." | 3973 |
| Varias duplas | "Las 2 duplas de rotación se repartieron en partes iguales: 1 en cada equipo." | 3975 / 3979 |
| Por cada jugador bloqueado | "Nicolás Vallejos permaneció en el Equipo Blanco porque estaba bloqueado." | 3995 |

Los nombres de línea salen de `LABEL_LINEA` (`index.html` 2259): `Arquero → Arco`,
`Defensor → Defensa`, `Volante → Medio`, `Delantero → Ataque`. La diferencia por línea se calcula
con la dupla valiendo el **promedio** de los dos, igual que el puntaje del equipo.

**Lo que el prototipo no emite** (existe en el motor y hay que sumarlo al implementar): la línea de
titulares sin puntaje (3875), la de ventaja otorgada al equipo sin arquero fijo (3935), las de
posición secundaria usada (3986 / 3990), la de jugadores que cambiaron de equipo (3998), la de
margen del total (3917), la de demasiadas combinaciones (3920) y la de reglas desactivadas (4012).
Ninguna se dispara con este plantel de muestra; el bloque las va a mostrar sin cambios de layout.

### Combo de estrategia (4a, 6a, 8a, 8b)

La estrategia dejó de ser un caption de lectura: es un **`<select>`** debajo del header de las
cuatro pantallas de equipo generado, con el label "ESTRATEGIA" a la izquierda en
`var(--type-eyebrow)` + `letter-spacing: var(--letter-spacing-eyebrow)`, uppercase,
`var(--color-mute)`.

Select: `min-height: 40px` en escritorio; en compacto 44 px y `width: 100%` (el label queda
`flex: none` a la izquierda). `padding: 0 38px 0 14px; border: 1px solid var(--color-ink);
border-radius: var(--radius-input) (12px); background: var(--color-canvas);
color: var(--color-ink); font: var(--type-body-sm-strong)` (compacto `600 13px/18px`);
`appearance: none`. El chevron es un SVG de 16 px con `stroke: var(--color-ink); stroke-width: 2.2`,
`position: absolute; right: 13px; pointer-events: none`. Opciones: las cuatro del catálogo real de
la app.

**Cambiar la estrategia no regenera.** Hay dos valores distintos: la **elegida** en el combo y la
**aplicada** (la que armó los equipos que están en pantalla). Mientras difieran, entre el combo y
los campos aparece el disclaimer:

`display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
gap: var(--space-md); padding: 14px 18px` (compacto: columna, `gap: 10px; padding: 14px`);
`border-radius: var(--radius-lg); background: var(--color-canvas-soft);
box-shadow: inset 0 0 0 1.5px var(--color-warning)`. A la izquierda, triángulo de atención de 18 px
(compacto 17) con `stroke: var(--color-warning-deep)`, título "Cambiaste la estrategia"
(`var(--type-body-sm-strong)`) y detalle en `var(--type-caption)` / `var(--color-body)`: "Los
equipos en pantalla se armaron con {aplicada}. Regenerá para armarlos con {elegida}." A la derecha,
Button `primary` "Regenerar equipos" (compacto, `fullWidth`).

Al regenerar, la elegida pasa a ser la aplicada y el disclaimer desaparece. **El receipt de
"Por qué quedaron así" describe siempre la estrategia aplicada, nunca la elegida sin regenerar.**

### Diferencia por línea y desvío aceptable (4a, 6a, 8a, 8b)

Debajo del campo y arriba de "Por qué quedaron así", separado con
`padding-top: var(--space-md); border-top: 1px solid var(--border-subtle)`: fila de encabezado con
el label "DIFERENCIA POR LÍNEA" (eyebrow) a la izquierda y "Desvío aceptable ≤ N pt(s)"
(`var(--type-caption)` / `var(--color-mute)`) a la derecha. Debajo,
`grid-template-columns: repeat(4, 1fr); gap: var(--space-sm)` en escritorio y
`repeat(2, 1fr); gap: 8px` en compacto.

Cada celda: `padding: 12px 14px` (compacto `10px 12px`); `border-radius: var(--radius-md);
background: var(--color-canvas-soft)`; adentro, columna con `gap: 2px`:

1. nombre de la línea — `Arco` / `Defensa` / `Medio` / `Ataque` (el mismo `LABEL_LINEA` del repo),
   en `var(--type-caption)` / `var(--color-mute)`;
2. `{Blanco} vs {Negro}` — los dos números en `900 16px/22px var(--font-display)` (compacto
   `900 15px/20px`) con `font-variant-numeric: tabular-nums`, y "vs" en `var(--type-caption)` /
   `var(--color-mute)`;
3. la diferencia — `+N Blanco` / `+N Negro`, o `Parejo` si es 0, en `600 12px/16px`.

**Regla de color.** Si la diferencia de esa línea **supera** el desvío aceptable, va en
`var(--color-negative-deep)` (`#dc2626`); si entra, en `var(--color-ink-deep)` (`#2a5d0a`). El
puntaje por línea cuenta la dupla como el promedio de los dos, igual que el total.

**Badge de diferencia total.** El mismo umbral manda en el Badge del header (y en el de la fila
`puntaje · Badge diferencia` del compacto): dentro del desvío es Badge `neutral`; si lo supera, es
una píldora roja con la geometría del Badge (`padding: var(--space-xs) var(--space-md);
border-radius: 9999px; font: var(--type-body-sm-strong)`) y
`background: var(--color-negative) (#ef4444); color: var(--color-ink)`. El desvío es configurable
(prop `desvio`, default 1 pt).

### Guardar y Deshacer (7a, 7b, 8e, 8f)

Los dos son **solo ícono**, juntos al final del pie en un `flex` con `gap: var(--space-sm)`
(compacto `justify-content: flex-end`), Deshacer primero. `44×44px; padding: 0;
border-radius: 9999px; border: none`. La acción se explica en hover con `title`, y el mismo texto va
en `aria-label`:

| Botón | Estilo | Ícono | Tooltip |
|---|---|---|---|
| Deshacer | `background: none; color: var(--color-mute)`; hover `color: var(--color-ink); background: var(--color-canvas-soft)` | flecha circular 18 px, `stroke: currentColor; stroke-width: 2.2` | "Deshacer el último evento cargado" |
| Guardar | `background: var(--color-primary); color: var(--color-ink)`; hover `var(--color-primary-active)` | disquete 19 px, `stroke: currentColor; stroke-width: 2.2` | "Guardar el resultado cargado" |

`active` suma `transform: scale(var(--press-scale))` en los dos. La confirmación de Guardar sigue
siendo el Badge `positive` del header por 2200 ms.

### Componentes del design system usados

**Card** — `display: flex; flex-direction: column; gap: var(--space-md);
padding: var(--space-xl); border-radius: var(--radius-card) (24px);
background: var(--surface-card) (#ffffff); font: var(--type-body-md)`. El `eyebrow` es un `<p>` con
`font: var(--type-eyebrow); letter-spacing: 0.08em; text-transform: uppercase;
color: var(--color-mute)`.

**Badge** — `display: inline-flex; align-items: center; gap: var(--space-xs);
padding: var(--space-xs) var(--space-md); border-radius: 9999px;
font: var(--type-body-sm-strong); white-space: nowrap`. Tonos usados:
`neutral` = `background: var(--color-canvas-soft); color: var(--color-ink)`;
`positive` = `background: var(--color-primary-pale); color: var(--color-positive-deep) (#166534)`.

**Button** — `display: inline-flex; align-items: center; justify-content: center;
gap: var(--space-sm); padding: var(--space-md) var(--space-xl); min-height: 48px;
border-radius: 24px; font: var(--type-button-md)`; `transition: var(--transition-interactive)`;
`transform: scale(var(--press-scale))` al presionar.
`primary` = `background: var(--color-primary); color: var(--color-on-primary) (#111827);
border: 1px solid transparent`; hover `var(--color-primary-active)`.
`tertiary` = `background: var(--color-canvas); color: var(--color-ink);
border: 1px solid var(--color-ink)`; hover `var(--color-canvas-soft)`.

**Títulos.** Los `h3` de todas las tarjetas: `font: var(--type-display-xs);
letter-spacing: var(--letter-spacing-display-xs); color: var(--color-ink)`.

---

## Interactions & Behavior

### Arrastre (4a, 6a)

Tres tipos de drop, en este orden de especificidad:

1. **Sobre otra camiseta** → intercambia los dos jugadores (`dropOnChip`).
2. **Sobre una línea** → saca al jugador de su línea y lo agrega al final de la línea destino
   (`dropOnLine`). La línea puede quedar con un jugador más o menos que la original.
3. **Sobre el otro equipo** → en 4a, todo el campo del otro equipo es zona de drop; en 6a, la
   pestaña del otro equipo (que además cambia la pestaña visible). El jugador cae en la línea del
   **mismo puesto**; si no existe, en la última línea disponible (`dropOnTeam`).

La dupla viaja como una unidad: es una entrada de jugador, nunca se separa.

Feedback de drag-over (`pointer-events: none`, siempre por encima):

| Zona | Estilo |
|---|---|
| Línea (4a) | `inset: -3px 10px; border-radius: 12px; background: rgb(255 255 255 / 0.14); box-shadow: inset 0 0 0 1.5px var(--green-400)` |
| Línea (6a) | igual con `inset: -3px 6px` |
| Camiseta | `inset: -4px -3px; border-radius: 15px; background: rgb(133 182 50 / 0.3); box-shadow: inset 0 0 0 2px var(--green-400)` |
| Pestaña (6a) | `inset: -2px; border-radius: 9999px; background: rgb(133 182 50 / 0.28); box-shadow: inset 0 0 0 2px var(--green-400)` |

`dragstart` setea `effectAllowed = "move"` y `text/plain` con el id del jugador.

### Candado (4a, 6a)

Alterna `locked[id]`. Un jugador fijado **mantiene su equipo** al regenerar. El receipt de la
estrategia lo dice en palabras: "sin jugadores fijados" / "1 jugador fijado, mantuvo su equipo" /
"N jugadores fijados, mantuvieron su equipo".

### Regenerar

Un re-reparto conserva la forma de cada equipo: se redistribuye **dentro de cada línea**, así que
cada equipo mantiene su formación — `1 ARQ / 3 DEF / 3 VOL / 1 DEL` en fútbol 8, `1 / 3 / 4 / 1` en
cancha de 9. Los fijados no entran al pozo. El resto se
mezcla (Fisher-Yates) y se reparte respetando la capacidad original de cada línea.

Sobre eso: **60 repartos candidatos**, se toma el de menor diferencia de puntaje, se aceptan todos
los que estén dentro de `min + 0.5` pt y se elige uno al azar entre ellos — así el mismo click no
devuelve siempre el mismo reparto. Estrategias del catálogo real de la app: "Solo por puntaje",
"Por posición y puntaje", "Formación fija", "Formación fija pareja" (default). "Solo por puntaje"
es la única que no respeta puesto.

### Botones de ícono del header (4a, 6a, 8a, 8b)

Las cuatro pantallas de equipo generado tienen el mismo par a la derecha del header: **Copiar** y
**Regenerar**, los dos solo ícono, en un `flex` con `gap: var(--space-sm)`, Copiar primero.

Ambos: `display: inline-flex; align-items: center; padding: 6px; border: none;
border-radius: 9999px; background: none; cursor: pointer;
transition: color var(--duration-fast) var(--ease-out)`; `active` agrega
`transform: scale(var(--press-scale))`. Ícono de 16 px en las vistas de 836 px, 15 px en las de
390 px.

- **Copiar** — `color: var(--color-mute)`, hover `var(--color-ink)`, `stroke: currentColor`,
  `stroke-width: 2`. `aria-label` y `title`: "Copiar equipos".
- **Regenerar** — `color: var(--color-ink)`, hover `var(--color-ink-deep)`, pero el ícono va
  `stroke: var(--color-primary)` con `stroke-width: 2.2`: es la acción principal y el único verde
  del header.

Como Copiar no tiene texto, **la confirmación es el ícono**: al copiar, el ícono de copiar se
reemplaza por un tilde (`stroke: var(--color-primary); stroke-width: 2.4`) durante 1800 ms y después
vuelve solo. No hay toast ni cambio de label.

### Copiar (4a, 6a, 8a, 8b)

Texto plano al portapapeles (`navigator.clipboard`, con fallback a `<textarea>` + `execCommand`):

```
Equipo Blanco — 52.5 pts
Arquero: Nicolás Vallejos (9)
Defensa: Anibal Leal (7), Joaquín Leal (5), Alfredo (5.5)
Volante: Walther Leal / Lautaro Leal (dupla, 6), Lucas Manoukian (8), Fabian (6)
Delantero: Leandro Benítez (6.5)

Equipo Negro — 51.5 pts
…

Diferencia 1 pt · {detalle de la estrategia}
```

El ícono del botón pasa a un tilde verde y vuelve solo a los **1800 ms**. En cancha de 9 el bloque
lleva la nota "Cancha de 9 — formación 3-4-1" en vez del detalle de la estrategia.

### Carga de resultados (7a, 7b)

- Se elige el evento **una vez**; cada toque en una camiseta agrega un evento de ese tipo a ese
  jugador. Tocar de nuevo suma el segundo.
- El chip aparece **exactamente donde va a quedar en 5a**: misma posición, mismo ícono, mismo
  tamaño. La carga y la lectura son la misma cancha.
- El **penal no es un campo aparte**: es un gol marcado como penal. Por construcción
  `penales ≤ goles` siempre — el bug de "más penales que goles" desaparece.
- El `−` de cada fila saca el **último** evento de esa familia (`goles` incluye `gol` y `penal`;
  `contra`; `asist`).
- **Deshacer** saca el último evento cargado, sea cual sea.
- **Guardar** muestra el Badge `positive` ("Resultado guardado" / "Guardado") por **2200 ms**.
  En la app real, acá va la persistencia.
- El resultado se recalcula en vivo: **los goles de un equipo son los propios más los en contra
  del rival**.
- El puntaje del jugador (rating) **no se toca** en esta pantalla.

### Responsive

Dos cortes, no un continuo: 836 px (dos campos lado a lado) y 390 px (un equipo a la vez con
selector). En el compacto, la camiseta baja de 56 a 52 px, el nombre de 11.5 a 11 px, y el detalle
del partido queda debajo del campo del equipo visible. Los targets táctiles del compacto suben:
`−` de 26 → 38 px, botones del selector de 10 px de padding vertical.

## State Management

Estado del prototipo, tal cual:

```js
{
  locked: { b1: true, n8: true },  // jugadores fijados (id → bool)
  estrategiaSel: null,              // estrategia elegida en el combo (null = la del prop)
  estrategiaAplicada: null,         // estrategia con la que se armó lo que está en pantalla
  tab: 0, tabFinal: 0, entryTab: 0, // equipo visible en cada vista compacta (0 Blanco, 1 Negro)
  roster: null,                     // reparto actual de la vista base (null = data() original)
  duoRoster: null,                  // reparto actual de la vista con dupla (null = duoBase())
  plan: null, duoPlan: null,        // receipt de la última generación
  copied: false, duoCopied: false,  // flag temporal del tilde de copiado (1800 ms)
  nueveCopied: false,               // ídem, para las vistas de cancha de 9
  drag: null,                       // { ti, li, pi } del jugador que se está arrastrando
  over: null,                       // "ti:li:pi" | "ti:li:line" | "tab:ti"
  entryLog: null,                   // [{ id, ev }] — ev: "gol"|"penal"|"contra"|"asist"
  entryEvent: "gol",                // evento activo del selector
  entrySaved: false,                // flag temporal del badge de guardado (2200 ms)
  nueveRoster: null,                // reparto de cancha de 9 (null = nueveBase())
  nueveTab: 0,                      // equipo visible en 8b
  nDrag: null, nOver: null,         // drag y drag-over propios de la cancha de 9
  nueveCopied: false,               // tilde de copiado de las vistas de 9
  nueveLog: null,                   // [{ id, ev }] del partido de 9 — independiente de entryLog
  nEntryEvent: "gol",               // evento activo del selector de 8e / 8f
  nEntryTab: 0,                     // equipo visible en 8f
  nEntrySaved: false,               // badge de guardado de 8e / 8f (2200 ms)
  tabNueveFinal: 0                  // equipo visible en 8d
}
```

`entryLog` es la **única fuente de verdad** de la carga — y `nueveLog` lo es para el partido de 9 —:
los conteos por jugador, el marcador y las
filas de detalle se derivan de él. Guardalo así (log de eventos) y no como cuatro contadores por
jugador — es lo que hace que Deshacer, el `−` por familia y la regla del penal salgan gratis.

Derivaciones:

```js
counts[id] = { goles, penales, contra, asist }   // "penal" suma a goles y a penales
score = [own[0].goles + own[1].contra,
         own[1].goles + own[0].contra]
```

Props expuestas como tweaks del prototipo (equivalen a opciones de configuración):

| Prop | Tipo | Default | Efecto |
|---|---|---|---|
| `nameFormat` | `"compact" \| "full"` | `compact` | "Nicolás V." vs "Nicolás Vallejos" |
| `showRatings` | boolean | `true` | Muestra u oculta el puntaje verde sobre la camiseta |
| `showLocks` | boolean | `true` | Muestra u oculta el candado |
| `estrategia` | enum (4) | `Formación fija pareja` | Estrategia inicial del combo y del receipt |
| `desvio` | number (0–3, paso 0.5) | `1` | Desvío aceptable en pts: arriba de eso, la diferencia va en rojo |

## Datos de muestra

Plantel de 16 (8 y 8), puestos `ARQ` / `DEF` / `VOL` / `DEL`, ratings como string ("9", "5.5"):

- **Blanco** — b1 Nicolás Vallejos 9 (ARQ) · b2 Anibal Leal 7, b3 Joaquín Leal 5, b4 Alfredo 5.5
  (DEF) · **d1 dupla Walther Leal 5.5 / Lautaro Leal 6.5**, b6 Lucas Manoukian 8, b7 Fabian 6
  (VOL) · b8 Leandro Benítez 6.5 (DEL) → 52.5 pts
- **Negro** — n1 Nilo 6 (ARQ) · n2 Gonzalo Zanotto 5, n3 Gabriel Devoto 7.5, n4 Agustín Benítez 5
  (DEF) · n5 Claudio 5.5, n6 Benjamín 7.5, n7 Joaquín Benítez 7 (VOL) · n8 Esteban Souto 8 (DEL)
  → 51.5 pts

Resultado de muestra (5a / 6b): b6 2 goles (1 de penal) + 1 asistencia · b8 1 gol · d1 2
asistencias · b2 1 en contra · n8 2 goles · n7 1 asistencia · n4 1 en contra → **4 – 3**
(Blanco: 3 goles propios + el en contra de n4; Negro: 2 propios + el en contra de b2).

**Cancha de 9 (8a / 8b).** El mismo plantel más un volante por lado: `b9` Ramiro 6.5 al Blanco y
`n9` Tomás 6.5 al Negro — VOL pasa a cuatro entradas por equipo y los totales quedan **59.5 vs 58**
(diferencia 1.5 pts, la misma que en fútbol 8). La dupla `d1` sigue en VOL, o sea que cae dentro de
la fila de cuatro: es el peor caso de ancho y el que conviene mirar primero.

Formato de números: una decimal, y se recorta el `.0` (`6.5` → "6.5", `6.0` → "6").
Nombre corto: primer nombre + inicial del último apellido con punto.

## Design Tokens

Los archivos reales están en `_ds/football-app-design-system-49d016f4-.../tokens/`. Subset usado:

**Color**

| Token | Valor | Uso acá |
|---|---|---|
| `--green-700` | `#417513` | Césped |
| `--green-500` / `--color-primary` | `#85b632` | Thumb de los selectores, ícono de regenerar, Button primary |
| `--green-400` | `#a4cf49` | Pill de puntaje, bordes de drop, flechas de rotación |
| `--green-100` / `--color-primary-pale` | `#e4f0c4` | Candado fijado, Badge positive |
| `--green-900` / `--color-ink-deep` | `#2a5d0a` | Captions de contexto, ícono del candado fijado |
| `--ink-900` / `--color-ink` | `#111827` | Texto, camiseta del Negro |
| `--gray-500` / `--color-mute` | `#6b7280` | Captions, guion del marcador, `−` |
| `--slate-100` / `--color-canvas-soft` | `#f1f5f9` | Fondo de los selectores, Badge neutral |
| `--white` / `--color-canvas` | `#ffffff` | Tarjeta, camiseta del Blanco, nombres sobre el campo |
| `--color-positive-deep` | `#166534` | Texto del Badge positive |
| `--negative-500` / `--color-negative` | `#ef4444` | Píldora de diferencia fuera del desvío |
| `--negative-600` / `--color-negative-deep` | `#dc2626` | Diferencia de línea fuera del desvío |
| `--warning-400` / `--color-warning` | `#facc15` | Hairline del disclaimer de estrategia |
| `--warning-700` / `--color-warning-deep` | `#a16207` | Ícono del disclaimer de estrategia |
| — | `#E8EBE6` | Fondo de los chips de estadística |

**Tipografía** — Inter. `--font-display` y `--font-sans` son la misma familia.

| Token | Valor |
|---|---|
| `--type-display-xs` | `600 24px/31.2px` (+ `--letter-spacing-display-xs: -0.48px`) |
| `--type-body-md-strong` | `600 16px/24px` |
| `--type-body-sm-strong` | `600 14px/20px` |
| `--type-caption` | `400 12px/16px` |
| `--type-eyebrow` | `600 12px/16px` (+ `0.08em`, uppercase) |
| `--type-button-md` | `600 16px/24px` |

Los números grandes van en peso 900 con tamaños literales (40/44, 30/34, 22/44, 17/34, 16/24,
12/20, 11/1, 10.5/1); los nombres sobre el campo, en 700.

**Espaciado** — `--space-xxs` 2 · `--space-xs` 4 · `--space-sm` 8 · `--space-md` 12 ·
`--space-lg` 16 · `--space-xl` 24 · `--space-2xl` 32 · `--space-3xl` 48. `--touch-target-min: 48px`.

**Radio** — `--radius-sm` 8 · `--radius-md` 12 · `--radius-lg` 16 (cancha) · `--radius-xl` 24
(tarjetas y botones) · `--radius-pill` 9999. Radios literales del prototipo: 13/14/15 px en las
camisetas y sus estados.

**Sombras usadas**

| Dónde | Valor |
|---|---|
| Camiseta | `drop-shadow(0 3px 7px rgb(17 24 39 / 0.35))` |
| Pill de puntaje | `inset 0 0 0 1.5px rgb(255 255 255 / 0.75), 0 2px 6px rgb(17 24 39 / 0.4)` |
| Chip de estadística | `0 2px 5px rgb(17 24 39 / 0.45)` |
| Cápsula de dupla | `inset 0 0 0 1px rgb(255 255 255 / 0.3)` |
| Candado fijado | `inset 0 0 0 1.5px rgb(42 93 10 / 0.35), 0 2px 6px rgb(17 24 39 / 0.35)` |

**Movimiento** — `--duration-fast: 140ms`, `--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1)`,
`--press-scale: 0.98`. Solo color, opacidad, `left` del thumb y el scale de press. Nada de bounce
ni de slide-in.

## Assets

Tres PNG, **ya en uso en el repo** (`assets/` de `sirlucman/organizador-futbol`), copiados acá en
`assets/`:

- `goal-icon.png` — gol
- `goal-icon-red.png` — gol en contra
- `boot-icon.png` — asistencia

Se usan a 12, 13, 14, 16 y 17 px según el contexto (ver cada sección). No hay íconos nuevos: el
resto son SVG inline de 24×24 (lápiz, candado, flecha circular, copiar, menos, rotación) con
`stroke-width` entre 2 y 2.6 y `stroke-linecap: round`.

## Una inconsistencia a resolver antes de implementar

**Divisores invisibles.** Las filas de resultado usan
`border-top / border-bottom: 1px solid var(--color-canvas)` — que es `#ffffff` sobre una tarjeta
blanca, así que no se ven. El design system pide divisores internos de
`1px var(--color-canvas-soft)` (`#f1f5f9`). Recomendación: implementar con `--color-canvas-soft`.

## Files

| Archivo | Qué es |
|---|---|
| `Equipos en el campo.dc.html` | Las doce vistas, interactivas. El diseño de referencia. |
| `support.js` | Runtime del prototipo. **No va al producto.** |
| `assets/*.png` | Los tres íconos, tal cual están en el repo. |
| `_ds/football-app-design-system-49d016f4-…/tokens/*.css` | Los tokens reales (color, tipo, espaciado, radio, elevación, movimiento, fuentes, reset). |
| `_ds/…/styles.css` | Punto de entrada que importa los tokens. |
| `_ds/…/_ds_bundle.js` | Componentes del design system compilados (Card, Badge, Button y el resto). Sirve para inspeccionar; el producto los reproduce en su propio stack. |
| `_ds/…/readme.md` | Guía del design system. |
