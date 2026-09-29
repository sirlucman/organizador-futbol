# Critique — INTERCAMBIAR_COLORES_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5-5 (per el Change log de la Spec, §18)
> **Date:** 2026-09-29
> **Inputs:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` (leído completo). Se
> consultó además `docs/intercambiar-colores/INTERCAMBIAR_COLORES_CONCEPT.md` solo para la
> dimensión Accuracy (contradicción con el Concept Note), sin correr el modo cross-doc de
> la rúbrica.

> **Nota sobre independencia de modelo.** Esto se pidió como "auto review" (Step 5 del
> flujo), no como Step 7 formal — no se corrió la puerta de Step 7.0 (confirmar ambos
> modelos con el usuario antes de leer el documento). Dicho eso, el modelo que redactó
> esta Spec (`claude-opus-5-5`) y el que corre esta crítica (`claude-sonnet-5`) son
> familias distintas del mismo proveedor — el nivel intermedio que la rúbrica acepta como
> más que un self-review puro, aunque sin el trámite completo de independencia. Tratarlo
> como una crítica reforzada, no como una Step 7 certificada.

## Verdict

**COMMENT** — sin hallazgos 🔴 Blocking. Dos 🟡 Should-fix (uno de consistencia en el
numerado de ACs, uno de categorización NFR/TC) y dos 🔵 Suggestion (precisión de una cita
de código, y una FR que agrupa dos garantías). La Spec está bien fundamentada: se
verificaron contra el código y contra los specs vecinos citados una docena de referencias
(`index.html` en ocho puntos distintos, `PANEL_ARMADO_SPEC.md` en tres, `ARRASTRE_SPEC.md`
en tres, el listado CWE Top 25 2025 completo) y todas resultaron exactas.

## Findings

### Per-doc — Accuracy

#### 1. La cita que justifica el orden del ícono apunta a una pantalla donde el botón no existe

- **Dimension:** Accuracy
- **Where:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` §4.4, `TC-030` (línea
  154-157)
- **What:** La excepción al design system justifica que la mitad clara del ícono vaya a la
  izquierda y la oscura a la derecha citando `renderFilaResultado`
  (`index.html:6322-6324`) como evidencia de "el orden en que la app muestra los equipos".
  Esa función sólo renderiza la fila de resultado del **partido finalizado**
  ([index.html:6329](../../index.html#L6329) la describe así) — una pantalla donde el
  botón de intercambiar nunca aparece (`FR-003`).
- **Why it matters:** El reclamo de fondo es correcto — verifiqué que Blanco-izquierda /
  Negro-derecha también vale en el encabezado del partido activo
  (`index.html:6098-6135`, `index.html:6460-6461`) y en el orden de pestañas
  (`index.html:5032`) — pero la cita puntual ancla la justificación en el código
  equivocado. Alguien que siga la cita para confirmar el patrón revisa una pantalla que
  esta feature no toca.
- **Evidence:** `index.html:6318` — comentario "El encabezado del partido finalizado" a
  cuatro líneas de la función citada; `TC-030` no menciona esa limitación.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Citar además (o en cambio) `index.html:6098-6135` (encabezado del
  partido activo) o `index.html:5032` (orden de pestañas), que sí son pantallas donde el
  botón de intercambiar convive con el patrón que se está justificando.

### Per-doc — Consistency

#### 2. `AC-20` rompe el patrón de "una sección, un rango de IDs" que el resto de la Spec sigue

- **Dimension:** Consistency
- **Where:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` §11.3 *Constraint
  compliance* (línea 530-540) y §11.4 *Negative / safety acceptance* (línea 544-545)
- **What:** §11.3 enumera `AC-15, AC-16, AC-17, AC-18, AC-19, AC-21, AC-22` — saltando
  `AC-20` — y `AC-20` aparece recién en §11.4, la sección siguiente. En el resto de la
  Spec cada subsección es dueña de su propio rango contiguo de IDs (§7.1 usa
  `FR-001`-`FR-006`, §7.2 usa `FR-010`-`FR-019`, §4.1 usa `TC-001`-`TC-002`, etc.), así que
  un lector que ve `AC-15...AC-19, AC-21, AC-22` juntos espera que `AC-20` sea también de
  *Constraint compliance* — y no lo es.
- **Why it matters:** Es justo el tipo de inconsistencia que los gates mecánicos del Plan
  (`grep`/`comm` sobre IDs) no detectan, porque esos gates verifican que el ID exista en
  alguna parte, no en qué sección. Sobrevive a una revisión automática y sólo se nota
  leyendo.
- **Evidence:** Orden textual real: `AC-15, AC-16, AC-17, AC-18, AC-19` (§11.3) →
  `AC-20` (§11.4) → `AC-21, AC-22` (§11.3, después de la tabla de §11.4 en el documento
  pero antes en numeración).
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Renumerar `AC-20` a continuación de `AC-22` (p. ej. `AC-23`), o mover
  físicamente `AC-21`/`AC-22` antes de la tabla de §11.4 para que el orden de lectura y el
  numérico coincidan. Cualquiera de las dos alcanza; lo que hace falta es que dejen de
  discrepar.

### Per-doc — Completeness

None ✓

### Per-doc — Clarity

#### 3. `NFR-005` no es un atributo de calidad: repite `TC-031` palabra por palabra

- **Dimension:** Clarity
- **Where:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` §8 (línea 328),
  `NFR-005`; compárese con §4.4 (línea 158-161), `TC-031`
- **What:** `NFR-005` dice: *"Todo test de esta Spec lleva su identificador en un literal
  de cadena (`TC-031`)."* — el paréntesis delata que no aporta una obligación nueva, sólo
  restablece `TC-031` bajo otro prefijo. Las demás NFR de esta Spec (`NFR-001` a
  `NFR-004`) sí son atributos de calidad del sistema en ejecución (tiempo, layout,
  accesibilidad, campos escritos); `NFR-005` es una convención de testing/ingeniería, que
  es exactamente lo que `TC-*` existe para capturar (§4 TC discipline, `MD-11`).
- **Why it matters:** Difumina la separación NFR/TC que la metodología cuida a propósito
  (NFR = calidad observable del producto; TC = mandato de solución/proceso). No genera una
  obligación verificable independiente: su propio texto apunta de vuelta a `TC-031`, y
  ambos terminan cubiertos por el mismo `AC-19`.
- **Evidence:** Texto literal de `NFR-005` citado arriba.
- **Confidence:** Medium — defendible si el autor quería una entrada en §8 sólo para que
  `AC-51`/`AC-54` del §11.5 tengan algo que enumerar, pero tal como está no agrega
  información nueva.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Eliminar `NFR-005` (la obligación ya vive en `TC-031` y ya la verifica
  `AC-19`), o reescribirla si había una intención distinta (p. ej. un atributo real de
  mantenibilidad que no sea la mera presencia del ID en el string).

#### 4. `FR-011` agrupa dos garantías distintas en un solo requisito

- **Dimension:** Clarity
- **Where:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` §7.2 (línea 251-253)
- **What:** *"El sistema conservará, en el intercambio, el orden de los jugadores dentro
  de cada lista **y** la composición de cada grupo: dos jugadores que eran compañeros
  siguen siéndolo..."* — son dos afirmaciones (orden preservado; composición/parejas
  preservadas) unidas por "y" dentro de un mismo FR.
- **Why it matters:** Bajo, no bloqueante: `S-01a` y `S-01e` ya prueban cada mitad por
  separado como variantes independientes, así que la granularidad real ya existe a nivel
  de escenario aunque el FR las agrupe. Vale la pena nombrarlo porque es el único FR de la
  Spec con esta forma.
- **Evidence:** Texto literal de `FR-011` citado arriba.
- **Confidence:** Low-Medium — también es leíble como una sola propiedad ("nada de la
  agrupación cambia"), no como dos obligaciones independientes.
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Ninguno necesario si el autor prefiere la lectura de propiedad única.
  Si se quiere granularidad estricta, partir en `FR-011`/`FR-011b`.

### Per-doc — Methodology-invariants

None ✓ — se verificaron explícitamente y pasaron: los seis meta-AC de §11.5 (`AC-50` a
`AC-55`) están presentes; todo escenario de §9 tiene bloque `Variants:` o la declaración
explícita `Variants: none`; las etiquetas de variante usan sólo el conjunto cerrado
`[boundary]/[failure]/[concurrency]/[property]`; el `erDiagram` de §10.1.1 se omite con
una razón explícita válida (sin entidad nueva); las 25 categorías del CWE Top 25 edición
2025 (verificado en vivo contra `cwe.mitre.org` en esta crítica) están cubiertas una por
una entre `TC-040`, `TC-041`, las tres rulings explícitas y el bloque "resto de la
lista"; los dos `[UNVERIFIED]` (`A-01`, `A-02`) están citados en el §17 Handoff como exige
`MD-26`; no hay IDs duplicados ni reutilizados.

## Summary

- Blocking: 0
- Should fix: 2
- Suggestions: 2
- Methodology-invariants violated: ninguno

## Verificación de grounding hecha durante esta crítica (no está en la rúbrica per-doc,
se registra por transparencia)

Se releyeron contra el código o los specs citados: `index.html:2150-2179` (saveMatches),
`index.html:5782-5784` (íconos SVG en línea), `index.html:5815-5838` y `:5817`
(`renderEncabezadoTarjeta`, `locked`), `index.html:792-806` (`.panel-icono`),
`index.html:5181-5210` (`aplicarDrop`, patrón de doble chequeo de rol y estado),
`index.html:2154` (`CAMPOS_EQUIPOS_ARMADO`), `index.html:6318-6328` (`renderFilaResultado`
— con el hallazgo #1 de arriba), `index.html:2778-2790` (`prevTeamOf`/bloqueados),
`index.html:4245-4269` (forma de `m.equipos`); `PANEL_ARMADO_SPEC.md:229-230,429,707`
(la Declaración de reemplazo); `ARRASTRE_SPEC.md` (`NFR-005`, `FR-040`, `TC-035`); el CWE
Top 25 edición 2025 completo contra `cwe.mitre.org`; y el ícono `shirt` de Lucide 0.544.0
contra `.claude/skills/football-app-design/guidelines/iconography.card.html`. Las doce
citas resultaron exactas salvo el hallazgo #1.
