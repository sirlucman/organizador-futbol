# OPEN-Q-05b — Fuera de puesto (19a + 20b)

**Aprobado el 2026-10-30.** Se suma a `OPEN-Q-05` (18h). Las señales de elegida, candidato y resto siguen igual. Trae dos cosas:

1. **Un estado nuevo en la camiseta**: el jugador que quedó en un puesto que no juega (turno **19a**).
2. **Cómo se dibuja un candidato que, si se hace el cambio, deja al otro fuera de puesto** (turno 20, alternativa **20b**).

> **La regla de candidatos no está en este documento.** Quién puede cambiarse con quién se trabaja directo en el repo. Acá sólo se define cómo se ve cada candidato una vez que la regla lo marcó.

Los archivos HTML son **referencias de diseño**, no código para copiar. Hay que recrearlos en `index.html` con sus componentes y tokens. **Fidelidad: alta.** Los valores son finales.

Abrí `Equipos en el campo.dc.html` en un navegador y buscá `id="19a"` y `id="20b"`. Los dos son interactivos.

---

## 1. Fuera de puesto (19a)

### Estado de puesto por camiseta: se calcula del lugar, no es un dato fijo

En cada render, para cada camiseta, con `slot` = el puesto del lugar que ocupa y `puestos` = la lista ordenada del jugador (el primero es el natural):

| Condición | Estado | Pastilla arriba a la izquierda |
|---|---|---|
| `puestos[0] === slot` | Natural | Ninguna |
| `slot` está en `puestos`, pero no es el primero | Secundario | **2º** amarilla (la de siempre) |
| `slot` no está en `puestos` | **Fuera de puesto** | **«!» roja** (nueva) |

- **Importante:** hasta 18h la 2º salía de un dato fijo del jugador y no se movía después de un intercambio. Ahora las dos pastillas se recalculan con cada cambio.
- Una camiseta no puede estar en dos estados a la vez, así que la 2º y la roja nunca se pisan. Ocupan el mismo lugar.
- Las duplas se tratan como una sola unidad, con su propia lista de puestos.

### Pastilla roja en la camiseta

```
position:absolute; top:-3px; left:-5px;          /* escritorio */
                            left:-12px;          /* compacto 390 px */
display:flex; align-items:center; justify-content:center;
width:26px; height:20px; padding:0;
border-radius:9999px;
background:var(--color-negative);                /* --negative-500 #ef4444 */
color:var(--ink-900);                            /* #111827 */
font:900 13px/20px var(--font-display);
box-shadow:inset 0 0 0 1.5px rgb(255 255 255 / 0.72), 0 2px 6px rgb(17 24 39 / 0.45);
```

- Texto: `!`.
- `title`: `"Fuera de puesto: no juega de {puesto} (juega de {lista})"`, con los nombres de puesto en minúscula. Ej.: "Fuera de puesto: no juega de central (juega de volante derecho, lateral derecho, mediocampista central)".
- `aria-label` de la camiseta: se agrega `", fuera de puesto"` después del equipo.
- **En el compacto va en −12 px y no en −5 px**: con la camiseta de 48 px, a −5 px quedaba a ~5 px del puntaje. A −12 px quedan ~12 px, y la pastilla sigue adentro de la columna de 72 px.

**Por qué este rojo:** es el mismo par de la diferencia pasada en la cabecera (`--color-negative` con tinta oscura). Se descartaron el texto blanco sobre `#ef4444`, que da 3.8:1 y no llega a 4.5:1, y `--negative-600` (`#dc2626`), que ya es el color de la pastilla de puesto ARQ.

### Pestaña del compacto

Se ve un equipo a la vez, así que alguien fuera de puesto en el otro equipo pasaba de largo. La pestaña de cada equipo con al menos un jugador fuera de puesto lleva **la misma pastilla**, al lado del nombre y antes del conteo de candidatos:

```
flex:none; display:flex; align-items:center; justify-content:center;
width:26px; height:20px; border-radius:9999px;
background:var(--color-negative); color:var(--ink-900);
font:900 13px/20px var(--font-display);
box-shadow:inset 0 0 0 1.5px rgb(255 255 255 / 0.72);   /* sin sombra de caída */
```

- La pestaña ya es `display:flex; gap:6px`.
- La pastilla se ve con o sin alguien elegido. El conteo, como en 18h, sólo con alguien elegido.
- `title`: `"1 fuera de puesto"` o `"N fuera de puesto"`.
- `aria-label` de la pestaña: `"{Equipo}, N fuera de puesto[, M opciones]"`.

---

## 2. Candidato con costo (20b)

Con **A** elegido y **B** marcado como candidato por la regla del repo, el candidato es **con costo** si **B no juega el puesto del lugar que deja A**. Si se hace el cambio, B queda fuera de puesto.

| Candidato | Recuadro | Camiseta |
|---|---|---|
| **Sin costo** | Igual que 18h: `background:rgb(255 255 255 / 0.16); box-shadow:inset 0 0 0 1.5px var(--green-400)` | Opacidad 1 |
| **Con costo** | `background:rgb(239 68 68 / 0.18); box-shadow:inset 0 0 0 1.5px var(--color-negative)` | Opacidad 1 |
| **Hover / drag-over** (los dos) | Igual que 18h: `background:rgb(255 255 255 / 0.22); box-shadow:inset 0 0 0 2px #ffffff` | — |

- La geometría del recuadro no cambia: `position:absolute; inset:-11px 1px -4px; border-radius:12px; pointer-events:none`.
- Las dos clases de candidato tienen la misma fuerza: el costo lo dice **sólo el color del recuadro**. No se atenúan y no cambia la pastilla de la esquina.
- El conteo de la pestaña en el compacto suma los dos tipos.
- `aria-label` del candidato con costo: `"{nombre}, {puesto}, {equipo}, se puede intercambiar pero queda fuera de puesto"`.
- El intercambio con costo es inmediato, igual que cualquier otro. Después del cambio, B muestra la pastilla roja (§1) en el momento.
- El prototipo lo dibuja sólo en el compacto. **En escritorio va el mismo recuadro.**

---

## Capturas (en `capturas/`)
- `19a-reposo.png`: escritorio y compacto, sin nadie elegido. La roja está en Alfredo (CT) y Benjamín (MI), las dos pestañas llevan su pastilla, y la 2º está en Joaquín Leal, la dupla Leal, Zanotto, Claudio y Tomás.
- `20b-ramiro-elegido.png`: Ramiro elegido. Lucas tiene el recuadro verde; Joaquín Leal, la dupla y Fabian, el rojo.
- `20b-despues-de-cambiar-con-fabian.png`: después de tocar a Fabian. Fabian queda de MD con la roja, Ramiro de MC con la 2º, y el Blanco pasa a tener dos fuera de puesto.

En las capturas, qué jugadores son candidatos sale de una regla de muestra del prototipo. **No es la regla a implementar.** Puestos, listas y estado inicial también están inventados: usar los del código.

## Lógica de referencia
Funciones puras. Adaptar los nombres a los del código.

```js
// puestos: lista ordenada del jugador (o de la dupla); el primero es el natural
function estadoDePuesto(slot, puestos) {
  const i = puestos.indexOf(slot);
  if (i === 0) return "natural";
  if (i > 0)  return "secundario";   // pastilla 2º
  return "fuera";                    // pastilla roja «!»
}

// Sólo para B ya marcado como candidato por la regla del repo.
// slotA = puesto del lugar que ocupa el elegido, antes del cambio
function tieneCosto(B, slotA) {
  return !B.puestos.includes(slotA);
}

// Pestaña del compacto
const fueraDePuesto = equipo.lugares.filter(l => estadoDePuesto(l.slot, l.jugador.puestos) === "fuera").length;
```

- El estado de puesto se calcula **en el render**, a partir del lugar actual. No se guarda.
- El costo se calcula contra el lugar **del elegido**, no contra el del candidato.

## Casos de prueba (datos del prototipo)

**Estado de puesto**
1. Alfredo (`MD, LD, MC`) en el lugar CT → `fuera`: pastilla roja y `title` "Fuera de puesto: no juega de central (juega de volante derecho, lateral derecho, mediocampista central)".
2. Joaquín Leal (`CT, LD, LI`) en LD → `secundario`: 2º.
3. Lucas (`MC, MI, MD`) en MC → `natural`: sin pastilla.
4. La dupla Leal (`LI, MI`) en MI → `secundario`: 2º sobre la camiseta de la dupla.

**Costo, con Ramiro elegido en MD.** Para los que la regla marque como candidatos:

| Jugador | Puestos | ¿Juega MD? | Recuadro |
|---|---|---|---|
| Lucas | `MC, MI, MD` | Sí | Verde |
| Fabian | `MC, LD, CT` | No | Rojo |
| Joaquín Leal | `CT, LD, LI` | No | Rojo |
| Dupla Leal | `LI, MI` | No | Rojo |
| Benjamín (Negro) | `MC, MD` | Sí | Verde |
| Agustín Benítez (Negro) | `LD, CT, MC` | No | Rojo |

- Cambiar con Fabian → Fabian en MD pasa a `fuera` y Ramiro en MC a `secundario`. La pestaña Blanco pasa a "2 fuera de puesto".
- Cambiar con Benjamín → cambian de equipo, y la pastilla de la pestaña Negro desaparece, porque Benjamín era el único fuera de puesto del Negro.
- Hover o drag-over sobre un candidato con costo: el recuadro pasa al blanco de hover, igual que los verdes.
- El que no es candidato y está fuera de puesto sigue mostrando la roja con opacidad 0.3.

## Errores a evitar
- **Sacar la 2º del dato fijo del jugador.** Tiene que salir del lugar actual, porque si no queda vieja después de un intercambio.
- **Calcular el costo con el lugar del candidato.** Es con el lugar que deja el elegido.
- **Atenuar o achicar los candidatos con costo.** En 20b tienen la misma fuerza que los verdes: sólo cambia el color del recuadro. La atenuación era 20a y se descartó.
- **Usar `--negative-600`/`#dc2626` o tinta blanca** en la pastilla roja: el primero es el color de ARQ, y la tinta blanca no llega al contraste mínimo.
- **Mostrar la pastilla de la pestaña sólo en el equipo visible.** Se calcula para los dos equipos siempre; ese es justamente su sentido.
- **Dibujar el recuadro rojo con `border`.** Va con `box-shadow: inset`, igual que el verde, así no corre el layout.
- **Pisar la 2º con la roja o al revés.** Son excluyentes y van en la misma posición; en el compacto, la roja en −12 px.
- **Pedir confirmación en los cambios con costo.** Eso era 20d y no va.

## Para decidir (no bloquea)
- **La 2º en el compacto sigue en −5 px**, así que con un puntaje alto puede quedar tan pegada como estaba la roja. Si se quiere que las dos ocupen el mismo lugar exacto, llevar también la 2º a −12 px en el compacto.

## Dónde está en el archivo
- Plantillas: `id="19a"` (escritorio y compacto) e `id="20b"` (compacto).
- Lógica, en la clase al final:
  - `swCan` (puestos por jugador, el primero es el natural) y `swSlot` (puesto del lugar).
  - El bloque `swMarks` dentro de `swTeams` (estado de puesto) y `swCost` (candidato con costo).
  - `mkTab` en `swView` (pastilla de la pestaña).
- `swIsCand` y la prop `swapRule` son la regla de muestra del prototipo. **No se toman como referencia.**
