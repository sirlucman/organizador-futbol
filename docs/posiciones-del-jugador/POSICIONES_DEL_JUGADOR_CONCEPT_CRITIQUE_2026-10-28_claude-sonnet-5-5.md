# Critique — POSICIONES_DEL_JUGADOR_CONCEPT.md (per-doc)

> **Critic model:** claude-sonnet-5-5 (read from this session's own configuration)
> **Author model:** claude-opus-5-5 (stated by the requester and confirmed in the doc's own Change log, §18, line 451)
> **Date:** 2026-10-28
> **Inputs:** `docs/posiciones-del-jugador/POSICIONES_DEL_JUGADOR_CONCEPT.md`
> **Mode:** Step 7 independent critique, per-doc. Read-only on the Concept Note; no commit.
> **Independence (Step 7.0):** different model, same provider (Opus author → Sonnet critic). That is the "acceptable middle tier" in `critic-rubric.md`: it breaks the same-model loop but may share residual training-data bias with the author. Not a different-provider critique.
> **Extra checks requested by the owner:** (1) every code / cross-doc citation opened and compared; (2) completeness of the declared replacements; (3) D-01…D-13 against each other and against §4; (4) inferences stated as facts. Results are in the Verdict and in the two appendices.

## Verdict

**CHANGES REQUESTED** — 4 🔴, 8 🟡, 4 🔵.

The product direction holds together and most of the 20 code and document citations resolve to what the doc says (Appendix A). Four things block approval. (a) The list of replaced spec parts handed to the Spec is incomplete: the swap contradicts at least `FR-013`, `FR-022`, `TC-012` and scenarios `S-02*` of `ARRASTRE_SPEC.md` and `A-03` of `PANEL_ARMADO_SPEC.md`, none of them declared, which is the exact failure `AGENTS.md` describes ("dos specs vigentes se contradicen"). (b) `D-12` replaces a rebanada-3 criterion that was already inverted on 2026-09-10 (`D-26`, `FR-072b`–`FR-072d`), and the doc never mentions `D-26`. (c) §4 non-goal 3 and §14 both claim the same capability, one as permanent and one as deferred. (d) `D-13`, a "settled" decision, rests on an `[UNVERIFIED]` that has no real obstacle behind it; I checked the code and the claim is true, so the fix is one citation.

## Findings

### Per-doc — Accuracy

#### 1. `D-12` replaces a rebanada-3 criterion that `D-26` already changed

- **Dimension:** Accuracy
- **Where:** `POSICIONES_DEL_JUGADOR_CONCEPT.md` §3 goal 4 (lines 61-62), §6 "lo que ya se recalcula" (lines 144-148), §8.1 (lines 265-269), `D-12` (line 357), §16 (lines 432-433)
- **What:** The doc says the summary "describe a propósito la generación y no el estado actual" and that `D-12` "reemplaza el criterio de la rebanada 3 de que el resumen describe sólo la generación". That criterion (`D-25` / `FR-072`) was amended on 2026-09-10 by `D-26` and `FR-072b`–`FR-072d`, and the doc never cites `D-26`.
- **Why it matters:** Today the block is split into "Con tus cambios" (recomputed from the on-screen reparto) and "Como lo armó el motor" whenever the reparto departs from the generation. The doc's premise ("explica un reparto que ya no existe") is already partly solved, and the Spec would mark the wrong source text as replaced. Also, `FR-072b2` fixes the design as *"comparando medida contra medida … y no registrando que hubo un movimiento"*, while `D-12` says the summary *"registra los intercambios manuales"*. That is a direct design conflict that the Concept neither sees nor argues. `OPEN-Q-01`/`OPEN-Q-02` ask how to word a record without first asking what the block already says after a swap.
- **Evidence:** `EQUIPOS_EN_EL_CAMPO_CONCEPT.md` `D-25` is struck "(Enmendada por `D-26`.)"; `D-26` (2026-09-10): *"se parte en dos grupos rotulados — lo que describe el reparto que está en pantalla y lo que describe la última generación"*. `PANEL_ARMADO_SPEC.md` `FR-072`: *"Invertido parcialmente el 2026-09-10 por `FR-072b` a `FR-072d`"*; `FR-072b2`; `FR-072c` (recalculates formation fulfilment, lock explanation, line balance). Code: `index.html:5992`, `:6000`, `:6741` implement the split.
- **Confidence:** High
- **Severity:** 🔴 Blocking
- **Suggested fix:** Rewrite §6, §8.1, `D-12` and the §16 replacement bullet against `D-26`/`FR-072b`–`FR-072d`. State what the block already says after an intra-team swap (a swap that changes total, line balance or formation fulfilment already triggers the split under `FR-072b2`). Then reframe `D-12` as an addition to the "Con tus cambios" group, or justify why a record is needed given `FR-072b2`.

#### 2. §6 says the engine stores a puesto for every player in every match; strategy 1 does not

- **Dimension:** Accuracy
- **Where:** §6 "Existing system — los puestos" (lines 139-143), `D-04`, `D-10`
- **What:** *"El motor guarda para cada partido el puesto asignado de cada jugador."* "Solo por puntaje" (`estrategia1`) returns `posicionOverride` and no `posicionAsignada` (`index.html:3295`; label and "sin mirar posiciones" at `:1677`-`:1680`).
- **Why it matters:** For such a match `valorDePuntaje` takes the general average (*"Sin posiciones asignadas (Estrategia 1)"*, `index.html:5066`-`:5069`) and `balanceLineasVigente` returns `null` (`:5863`-`:5866`). Writing a `posicionAsignada` map for the first time would (inference from those lines, not run) switch every player's value in that match from general average to per-puesto score, not just the two swapped players. The doc sets `D-10` ("no se agrega recálculo") and `D-04` as settled without ever deciding whether the feature exists on those matches. No `OPEN-Q` covers it.
- **Evidence:** the lines cited above.
- **Confidence:** High on the code facts; Medium on the consequence (inference).
- **Severity:** 🟡 Should fix
- **Suggested fix:** Add a decide-in-Spec `OPEN-Q` (swap unavailable for matches without `posicionAsignada`, or define what is written), and qualify the §6 sentence with "salvo la estrategia 'Solo por puntaje'".

#### 3. `D-01` cites `007-permisos-por-usuario` for something it does not say

- **Dimension:** Accuracy
- **Where:** §4 non-goal 1 (lines 68-71), §5.2 (lines 116-118), `D-01` (line 346)
- **What:** *"Los puestos y los puntajes por puesto son información de armado, que hoy el rol jugador no ve (`007-permisos-por-usuario`)."* A search of `docs/007-permisos-por-usuario/spec.md` for "puesto" and "posici" returns no matches. 007 hides **puntajes**, strategy and score differences (`FR-004`, `FR-005`).
- **Why it matters:** Puestos are public data. `savePlayers` strips only `scores` from the public `players` document (`index.html:2326`-`:2331`) and `partidos` (public) "conserva … su posición asignada" (`:2348`-`:2349`). The cancha builds the position label and the "2º" suffix without a role check in the lines I read (`:5222`-`:5240`; I did not run the app as `jugador`). The conclusion of `D-01` (admin only) is still right, because editing is gated by `isAdmin()` (`:5072`-`:5080`), but the stated rationale is not supported, and a Spec that inherits it would justify a non-goal with a false premise.
- **Evidence:** as above.
- **Confidence:** High on the 007 and storage facts; Medium on what a `jugador` session renders.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Re-base `D-01` on the real reason (editing is an admin action, `esFilaEditable`) and keep the "puntajes no se exponen al jugador" half, which 007 does support.

#### 4. "Cada equipo conserva su cantidad de jugadores" is false when a dupla is involved

- **Dimension:** Accuracy
- **Where:** §4 non-goal 4 (lines 80-82), §8.1 (lines 255-257)
- **What:** The exchange is "siempre entre dos camisetas" and "cada equipo conserva su formación y su cantidad de jugadores". A dupla is one camiseta with two people, and `intercambiarUnidades` moves the partner too (`index.html:5638`-`:5644`).
- **Why it matters:** Swapping a dupla with an individual leaves the teams with different numbers of people. The existing Spec states this: `ARRASTRE_SPEC.md` `S-03b` *"los equipos quedan con distinta cantidad de personas pero la misma cantidad de unidades"*, and `FR-024` speaks of unidades. The Concept's own §6.5 cites `FR-024` yet restates it more strongly than it is. The sentence is a "must remain non-goal" in §16.
- **Evidence:** as above.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Say "cantidad de unidades" and note the dupla case.

#### 5. `juegaFueraDePuesto` is cited for a rule it does not implement

- **Dimension:** Accuracy
- **Where:** §6.5 (lines 170-173), §2 Pain 3 (lines 48-50)
- **What:** `index.html:1614` `juegaFueraDePuesto` returns `j.principal !== posAsignada` (or a line comparison for legacy values). It means "not the principal", not "principal or secundaria". The rule of `D-03` comes from `posicionesDe` (`:1623`) and `costoEncaje` (`:3631`-`:3636`). Consequence for Pain 3: the "2º" pill appears for any non-principal assignment, including one the player never declared, so "la pastilla '2º' si es secundario" is slightly off.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Cite `posicionesDe` and `costoEncaje` for `D-03`; keep `juegaFueraDePuesto` only for the pill.

#### 6. Three statements are inference written as fact

- **Dimension:** Accuracy
- **Where:** §9.5 (line 338), §7.2 (lines 226-230), §9.1 (lines 295-297)
- **What:** (a) §9.5 states flat *"El candado fija a un jugador en su equipo y su puesto actual; no hay forma de pedirle al motor un puesto concreto"*, while `D-13` tags the same behaviour `[UNVERIFIED]`; `ARRASTRE_SPEC.md` `FR-026` only says the lock fixes the *equipo*. (b) §7.2 *"Ese recálculo ya existe … así que la razón de aquella exclusión ya no está"* is the author's conclusion, not a read fact. (c) §9.1 *"un elemento flotante que en 360px tapa la cancha"* was not measured or prototyped. 
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Prefix with "se infiere" / `[INFERRED]`, or cite (for (a), `index.html:3420`-`:3421`, `:4093`-`:4094`).

### Per-doc — Consistency

#### 7. `D-05` says touching elsewhere cancels; `D-06` needs the tab tap not to cancel

- **Dimension:** Consistency
- **Where:** `D-05` (line 350), `D-06` (line 351), §8.1 (lines 249-250 vs 261-263)
- **What:** *"tocar cualquier otro lugar cancela la selección"* vs. *"la selección sobrevive al cambio de pestaña"*. The tab selector is "otro lugar". Also open: what a tap on a non-highlighted camiseta does (cancel, or re-select it).
- **Why it matters:** Both are "settled". The Spec would have to carry a rule and its exception without either being written down.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Word `D-05` as "tocar fuera de las camisetas y de la pestaña cancela", and say which tap re-selects.

#### 8. `D-07` knowingly allows a dupla member out of puesto; non-goal 3 and a success signal forbid it

- **Dimension:** Consistency
- **Where:** `D-04` (line 349), `D-07` (line 352), §4 non-goal 3 (lines 74-79), §12 signal 3 (line 377)
- **What:** For a dupla, `D-07` accepts the union of the members' puestos. `costoEncaje` scores a puesto that only one member covers as cost 1, with the comment *"la mitad del partido hay alguien fuera de puesto"* (`index.html:3629`-`:3636`). So a swap can leave one person on a puesto they never declared, while §12 says *"Ningún intercambio manual deja a un jugador en un puesto que no declaró"*.
- **Why it matters:** The non-goal is a verbatim "must remain" bullet, so the Spec would contain a rule and its contradiction.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Scope the non-goal and the signal to "jugador individual" and state the dupla rule explicitly (or require both members to cover the puesto).

#### 9. Non-goal 4 forbids what `D-09` keeps

- **Dimension:** Consistency
- **Where:** §4 non-goal 4 (lines 80-82), `D-09` (line 354), §16 (line 440)
- **What:** *"No se mueve a un jugador a un lugar vacío ni a otra línea sin intercambio"* vs. the pase suelto that "queda como hoy" (a player moves to the other team without anyone coming back). The code already allows the resulting uneven teams: *"un movimiento manual puede dejar 9 contra 7"* (`index.html:5957`-`:5958`).
- **Confidence:** Medium (depends on reading "lugar vacío")
- **Severity:** 🟡 Should fix
- **Suggested fix:** Limit the sentence to moves within a team ("dentro de un mismo equipo").

#### 10. Header date and Change-log date differ

- **Dimension:** Consistency
- **Where:** line 3 (`Date: 2026-10-27`) vs line 451 (`2026-10-28`, "Initial draft")
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Align, or note that 10-27 is the Q&A date (§17).

### Per-doc — Completeness

#### 11. The replacements handed to the Spec are incomplete

- **Dimension:** Completeness (§16 Handoff) — directly the owner's check 2
- **Where:** §1 (line 22), `D-06`, `D-08` (lines 351, 353), §16 (lines 428-433)
- **What:** `AGENTS.md`: *"Cuando un documento nuevo modifica comportamiento ya descripto en un spec existente, DEBE declararlo explícitamente … Sin esa declaración, dos specs vigentes se contradicen."* §16 lists only `D-19`/`D-20`, `FR-011`, the one-column exclusion of `§3.2`, and the rebanada-3 summary criterion. Parts of current specs that the swap also contradicts and are **not** listed (full table in Appendix B):
  - `ARRASTRE_SPEC.md` **`FR-022` and `TC-012`** — *"no modificará la posición asignada de ninguna unidad"* / *"no escribirá `m.equipos.posicionAsignada`"*. The swap writes exactly that.
  - **`FR-013`** — dropping on another camiseta of the own team ends the drag with no change; `D-08` makes it a swap.
  - **`§3.2` first bullet** (lines 105-109) — *"no permitirá … intercambiándola con otra camiseta del mismo equipo"*. §16 names only the third bullet (one column).
  - Scenarios **`S-02`** (*"ninguna de las dos posiciones asignadas cambió"*), **`S-02c`**, **`S-02d`**, and `US-02`/`R-02`.
  - **`FR-015`** (no highlight over the own team) if `OPEN-Q-04` resolves to highlighting during a drag; `FR-024` wording ("unidades").
  - `PANEL_ARMADO_SPEC.md` **§3.3** (inherits `D-19`/`D-20` as "las que hacen que el recálculo sea barato") and **`A-03`** (*"Un movimiento manual no cambia la posición asignada de nadie"*).
  - `D-19`/`D-20` are not replaced whole: `D-09` keeps "el pase conserva el puesto", so `D-20` survives for the pase. The doc says "reemplaza", the rule needs "qué parte".
- **Why it matters:** A Spec written from §16 will mark five items and leave at least eight contradicting specs vigentes, the failure `AGENTS.md` names.
- **Evidence:** the quoted lines of `ARRASTRE_SPEC.md` (`FR-013`, `FR-022`, `TC-012`, `§3.2`, `S-02`) and `PANEL_ARMADO_SPEC.md` (lines 217-220, 1147).
- **Confidence:** High (all opened). I searched `docs/equipos-en-el-campo/` for "posición asignada … no"; `CARGA_POR_TOQUE_SPEC.md` and `CANCHA_SPEC.md` (whose own `TC-012` is a different constraint with the same ID) showed no further contradiction, but I did not read them end to end.
- **Severity:** 🔴 Blocking
- **Suggested fix:** Replace the §16 bullet with the Appendix B list (ID by ID), and word `D-08` as a partial replacement of `D-19`/`D-20` ("lo que deja en pie `D-09`").

#### 12. Old-catalogue assigned values are not covered by `D-03`

- **Dimension:** Completeness
- **Where:** `D-03` (line 348), §6
- **What:** `posicionAsignada` can hold a pre-`desglose-posiciones` value (`esPosicionVieja`, `index.html:1554`); the code compares those by line (`cubrePosicionGuardada`, `:3642`-`:3648`; `juegaFueraDePuesto`, `:1614`-`:1617`). `D-03` and the compatibility rule only talk about the eight current puestos.
- **Confidence:** Medium (an open registration window on such a match is plausible, not checked)
- **Severity:** 🔵 Suggestion
- **Suggested fix:** One `OPEN-Q` for the Spec: legacy values on an editable match.

### Per-doc — Clarity

None ✓ — decisions are single-clause and each alternative states why it was rejected. (The ambiguity in `D-05` is filed under Consistency, finding 7.)

### Per-doc — Methodology-invariants

#### 13. §4 non-goal 3 and §14 declare the same capability permanent and deferred

- **Dimension:** Methodology-invariants (§4 vs §14 must be distinct, `critic-rubric.md` 5.1)
- **Where:** §4 non-goal 3 (lines 74-79), §9.2 (line 309, *"Puede volver si aparece un caso real"*), §14 third bullet (lines 408-410), §16 "Must remain non-goals" (line 439)
- **What:** "No se permite dejar a un jugador fuera de sus puestos por un intercambio" is a permanent non-goal that the Spec must keep verbatim, and "Intercambio fuera de puesto con confirmación explícita" is a deferred item. Same shape as the 🔴 raised on `DESGLOSE_POSICIONES_CONCEPT.md` (2026-09-30).
- **Confidence:** High
- **Severity:** 🔴 Blocking
- **Suggested fix:** Pick one framing: keep the non-goal and drop the §14 bullet (Alternative B stays as "rejected"), or word the non-goal "en esta versión".

#### 14. `D-13` rests on an `[UNVERIFIED]` with no obstacle behind it

- **Dimension:** Methodology-invariants (`MD-26`)
- **Where:** `D-13` (line 358), §16 (line 426), §9.5
- **What:** *"[UNVERIFIED — falta confirmar en las estrategias de formación fija]"*. The repo is local and readable, so "falta confirmar" is "not checked", not an obstacle (`verification-protocol.md`: the test is whether the author "hit a real obstacle"). Meanwhile the decision is listed as **Settled (do not relitigate)** in §16.
- **Why it matters:** A settled decision should not be waiting on a check that costs one read. And if the strategies did not hold the puesto, `D-13` would need an engine change, which the doc rules out (§6.5: "el intercambio no pasa por el motor").
- **Evidence (my check):** the position-aware strategies carry a locked player's previous puesto: `generarEquiposEstrategia2` `index.html:3420`-`:3421`, `generarEquiposEstrategia3` `:4093`-`:4094` (strategy 4 calls 3, `:4574`-`:4575`); the caller passes the stored `posicionAsignada` (`:4694`, `:4715`-`:4717`). Strategy 3/4 also treats locked players apart from the free ones (`:4086`+). I did not trace the later fit step end to end. Note the `FR-026` of `ARRASTRE_SPEC.md` only says the lock fixes the *equipo*.
- **Confidence:** High on the cited lines; Medium that nothing later in strategy 3/4 moves a locked player.
- **Severity:** 🔴 Blocking (per the rubric: a marker with no real obstacle counts as absent; the claim turns out true, so the fix is cheap)
- **Suggested fix:** Replace the marker with the citation, and drop "(do not relitigate)" from §16 until it is done.

#### 15. Two more `[UNVERIFIED]` markers are not obstacles and are not in the §16 handoff

- **Dimension:** Methodology-invariants (`MD-26`)
- **Where:** §6.5 (lines 210-212) and §7.1 (lines 218-222) fantasy-football pattern; §13.1 (lines 385-386)
- **What:** (a) *"recuerdo general del patrón, no se consultó un producto concreto"* is "didn't check" in other words. (b) §13.1's marker is a design question (does registering swaps add a field the rules validate?), not an unverifiable claim; it belongs in an `OPEN-Q`. Neither (a) nor the §13.1 marker is enumerated in §16 (only `D-13` and §13.1 are; (a) is not).
- **Why 🟡 and not 🔴:** the rubric would grade (a) 🔴 literally. I grade 🟡 because §7.1 states the claim is not used as a foundation and deleting it loses nothing; the author or reviewer may escalate.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Delete the fantasy sentence (or cite a real product), and turn the §13.1 marker into an `OPEN-Q`.

#### 16. WCAG clause cited without a source

- **Dimension:** Methodology-invariants (`MD-26`)
- **Where:** §6.5 "Regulatory" (lines 189-191), §7.2 (lines 231-232)
- **What:** The text paraphrases WCAG 2.1 SC 2.1.1 ("un gesto de puntero … sin equivalente de teclado no lo cumple") with no URL or clause check and no `[UNVERIFIED]`. The paraphrase is consistent with what I know of the criterion, but I did not open the standard either (from memory only).
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Cite the W3C page, or tag it `[UNVERIFIED — <obstacle>]`.

## Summary

- Blocking: 4 (findings 1, 11, 13, 14)
- Should fix: 8 (findings 2, 3, 4, 7, 8, 9, 15, 16)
- Suggestions: 4 (findings 5, 6, 10, 12)
- Methodology-invariants violated: `MD-26` (14; 15 and 16 at 🟡), §4/§14 distinctness (13), handoff completeness (11); `AGENTS.md` "declarar reemplazos" rule (11, 1)

## Appendix A — Citation check (owner's check 1)

Every row was opened; "✓" means the cited text says what the Concept claims.

| Citation in the Concept | Result |
|---|---|
| `index.html:5072` `esFilaEditable` | ✓ `isAdmin() && !cerrada && !finalizado`; `cerrada = enModoCarga(m)` (`:4989`) |
| `index.html:5635` `intercambiarUnidades` | ✓ returns if `equipoA === equipoB`; moves the partner too; does not touch `posicionAsignada` |
| `index.html:5770` `moverUnJugadorDeEquipo` | ✓ (the pase with its partner is `__moverJugadorManual`, `:5778`) |
| `index.html:1614` `juegaFueraDePuesto` | ⚠ exists, but implements "no es la principal", not principal-or-secundaria (finding 5) |
| `index.html:1623` `posicionesDe` | ✓ principal + secundarias |
| `index.html:4582` `construirUnidadDupla` | ✓ unit is `Arquero` only if both members are; secundarias = union of both |
| `index.html:5863` / `:5919` / `faltantesDeFormacionVigente` (`:5940`) | ✓ recalculate over the on-screen reparto; the "principal-o-secundaria" rule is `cubrePosicionGuardada` → `costoEncaje` (`:3626`-`:3648`), with the dupla nuance of finding 8 |
| `index.html:2348` | ✓ comment: `partidos` keeps team and assigned position; `posicionAsignada` is not in `CAMPOS_EQUIPOS_ARMADO` (`:2350`); documents `data/partidos` and `data/partidosArmado` (`:1400`, `:2368`-`:2373`) |
| `index.html:3420` | ✓ inside `generarEquiposEstrategia2`, label "Por posición y puntaje" (`:1682`) |
| `ARRASTRE_SPEC.md:114` | ✓ "no ofrecerá el intercambio … en una sola columna" |
| `ARRASTRE_SPEC` `FR-011`, `FR-017`, `FR-024`, `§3.2` | ✓ all exist; `FR-024` says *unidades* (finding 4); `§3.2` has two more bullets that matter (finding 11) |
| `CARGA_POR_TOQUE_SPEC.md` (toque only with inscripción cerrada) | ✓ `FR-001`/`FR-002`; code `:5225`-`:5233` (`arrastrable` and `puedeTocarCamiseta` mutually exclusive) |
| `CANCHA_SPEC.md` `OPEN-Q-02` (24×24 candado) | ✓ with `NFR-004` |
| `Roadmap.md` §2 "mover un jugador sin gesto de puntero" (line 44) and §3 "alternativa táctil" (line 86); concurrent-edit risk in §3 (line 70) | ✓ |
| `equipos-en-el-campo` `D-19`, `D-20`, `D-25`; `FR-071` of rebanada 3 | ✓ text as quoted; **`D-25` is amended by `D-26`** (finding 1) |
| `007-permisos-por-usuario` as the source for "puestos no los ve el jugador" | ✗ does not say it (finding 3) |
| Pain 3 (the cancha shows only the assigned puesto and "2º") | ✓ the title is built from `nombreDe(posAsignada)` only (`index.html:5236`-`:5240`) |
| `008-duplas-rotacion`, `014-puntaje-dupla-por-posicion`, `desglose-posiciones`, `intercambiar-colores` | folders exist; I did not open their specs (the code comments that cite them do match) |
| Pain 1 ("pasó en un partido real") | owner testimony; cannot be checked (§17 says there is no transcript) |

## Appendix B — Replacement coverage (owner's check 2)

| Part of a current spec | Contradicted by | Declared in §16? |
|---|---|---|
| `D-19` (manual editing only between teams) | `D-06`, `D-08` | Yes, but as a whole (`D-09` keeps part) |
| `D-20` (a manual move writes no puesto) | `D-06`, `D-08` | Yes, same |
| `ARRASTRE_SPEC` `FR-011` | `D-08` | Yes |
| `ARRASTRE_SPEC` `§3.2`, bullet 3 (no swap in one column) | `D-06` | Yes |
| `ARRASTRE_SPEC` `§3.2`, bullet 1 (no swap with a teammate) | `D-08` | **No** |
| `ARRASTRE_SPEC` `FR-013` (drop on own team's camiseta: no effect) | `D-08` | **No** |
| `ARRASTRE_SPEC` `FR-022` + `TC-012` (no puesto written) | `D-08` | **No** |
| `ARRASTRE_SPEC` `S-02`, `S-02c`, `S-02d`, `US-02`, `R-02` | `D-06`, `D-08` | **No** |
| `ARRASTRE_SPEC` `FR-015` (no highlight over own team) | `OPEN-Q-04`, if yes | **No** (conditional) |
| `ARRASTRE_SPEC` `FR-024` (same number of unidades) | still true; the Concept restates it as "jugadores" | n/a (finding 4) |
| `PANEL_ARMADO_SPEC` `§3.3` (inherits `D-19`/`D-20`) and `A-03` | `D-08` | **No** |
| Rebanada 3 "el resumen describe sólo la generación" (`D-25`/`FR-072`) | `D-12` | Yes, but **the criterion was already changed by `D-26`** (finding 1) |
