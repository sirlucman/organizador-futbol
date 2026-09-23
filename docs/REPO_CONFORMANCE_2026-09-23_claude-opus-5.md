> **Addendum 2026-09-23 (posterior a la auditoría).** Este informe es un artefacto
> **fechado y sin editar**: describe el repositorio tal como estaba en
> `cd300175377063f0adf3531afc4cecf4229b10f3`, y sus hallazgos se dejan tal cual se
> escribieron, como pide `AGENTS.md` para los reportes de auditoría. Cuatro de ellos
> **ya se resolvieron** después de escribirlo, y el texto de abajo no lo refleja:
>
> | Hallazgo | Resuelto en |
> |---|---|
> | Reverse-sweep §1 — cuatro superficies interpolaban el nombre del jugador sin escapar | `v2.0.19`, más `tests/escapado.test.js`, que cubre todo `index.html` |
> | Spec-quality §A — `carga-por-toque` sin *Declaración de reemplazo* | `v2.0.20` |
> | Spec-quality §A — falta de anotación recíproca en los cinco documentos de origen | `v2.0.21` |
> | Spec-quality §A — `003` sin marcar los seis FR que `009`/`010`/`011` ya habían declarado | `v2.0.22` |
>
> Todo lo demás sigue abierto, empezando por los bindings que afirman lo contrario
> del escenario al que están atados (§B) y las contradicciones internas de §F.
> Volver a correr `/engineering-methodology:spec-conformance` daría números distintos
> de los de acá: éstos son los de `cd30017`.

# Spec-conformance audit — whole repository

**Docs and code both pinned at** `cd300175377063f0adf3531afc4cecf4229b10f3` (branch `main`, clean
tree; the only untracked path is `archive-nFTQ3q/`, a zip, outside the frontier). Read in place —
no worktree was created, no test was run, the application was never executed.

**Denominator: 1293 defined IDs across 26 Specs.** A bare prefix grep returns 1351; 58 of those are
citation-only phantoms from range references ("`FR-030` a `FR-037`"), so the denominator was rebuilt
from definition shapes only (bold bullet / table row / scenario heading / variant bullet), fence-aware.
`docs/resultados-partido/` is excluded from that count — OpenSpec format, no stable IDs of any family —
and audited separately by requirement name: **33 units, 23 IMPLEMENTED / 4 PARTIAL / 6 DIVERGENT**.

## Verdict totals

| Verdict | Count |
|---|---|
| IMPLEMENTED | 938 (72.5%) |
| PARTIAL | 104 |
| DIVERGENT | 114 |
| UNVERIFIABLE | 70 |
| **ABSENT** | **7** |
| deferred to Phase 2 gates (`AC-50`–`AC-55`) | 60 |

Assertion: per-ID row count == Phase 1 denominator == 1293. Passes.

**Read the ABSENT count first.** Seven missing obligations out of 1293. Five of the seven are
`015-minimo-diferencia-alcanzable`, which is marked `Status: Draft`; the other two are
`014/FR-012` and `012/FR-001a`, which are the same lost datum (a per-member "sin puntaje"
legend inside a dupla). **Essentially nothing is unbuilt. The drift is documentation.**

## Per-cluster

| Cluster | IDs | IMPL | PART | DIV | UNVER | ABS | Defer |
|---|--:|--:|--:|--:|--:|--:|--:|
| cancha-A | 50 | 41 | 2 | 4 | 2 | 1 | 0 |
| cancha-B | 67 | 35 | 10 | 6 | 10 | 0 | 6 |
| arrastre-A | 64 | 59 | 2 | 3 | 0 | 0 | 0 |
| arrastre-B | 87 | 58 | 10 | 7 | 6 | 0 | 6 |
| panel-C | 63 | 55 | 1 | 7 | 0 | 0 | 0 |
| eventos-A | 32 | 25 | 1 | 6 | 0 | 0 | 0 |
| eventos-B | 40 | 26 | 4 | 3 | 1 | 0 | 6 |
| rol-B | 60 | 37 | 3 | 0 | 14 | 0 | 6 |
| toque-B | 54 | 36 | 6 | 2 | 4 | 0 | 6 |
| orden-B | 43 | 32 | 2 | 1 | 2 | 0 | 6 |
| goles-contra | 56 | 33 | 7 | 10 | 0 | 0 | 6 |
| panel-A | 69 | 57 | 6 | 6 | 0 | 0 | 0 |
| orden-A | 48 | 39 | 4 | 5 | 0 | 0 | 0 |
| G1 | 45 | 36 | 4 | 5 | 0 | 0 | 0 |
| finalizado-A | 56 | 50 | 3 | 3 | 0 | 0 | 0 |
| toque-A | 50 | 45 | 1 | 4 | 0 | 0 | 0 |
| finalizado-B | 64 | 40 | 6 | 7 | 5 | 0 | 6 |
| rol-A | 52 | 39 | 1 | 0 | 12 | 0 | 0 |
| navegacion | 65 | 43 | 9 | 6 | 1 | 0 | 6 |
| panel-B | 73 | 35 | 14 | 9 | 9 | 0 | 6 |
| G2 | 36 | 17 | 5 | 10 | 0 | 4 | 0 |
| G5 | 46 | 38 | 1 | 4 | 2 | 1 | 0 |
| G3 | 35 | 28 | 0 | 5 | 2 | 0 | 0 |
| G4 | 38 | 34 | 2 | 1 | 0 | 1 | 0 |
# Phase 4 — Reverse sweep (behaviour no ID sanctions)

**Frontier (stated, as the skill requires):** the union of Plan §4 module maps, every file Phase 3
cited, and one public-surface hop = **7 git-tracked production files** at `cd30017`:
`index.html` (7605 lines, 186 functions), `tools/rol.js`, `tools/sync-staging-data.html`,
`tools/medir-arranque.js`, `tools/medir-motor.js`, `tools/servir-fixture.js`,
`.github/workflows/version-bump.yml`. Far under the 60-file cap, so the sweep is complete, not sampled.
`tests/` is excluded as test-only (none of it is reachable in a production configuration).

Ranked: external/persistent effect above internal, deliberate above incidental.

## 1. Unescaped player names reach innerHTML on four surfaces — EXTERNAL, incidental
`index.html:6443,6445` (match-list summary card, via `container.innerHTML` in `renderMatchList`),
`index.html:6790,6805,6810` (`renderConvocadosList` -> `listEl.innerHTML`),
`index.html:6894` (dupla candidate list), `index.html:6951` (autocomplete dropdown -> `dropdown.innerHTML`).
The same value is escaped three lines away at `index.html:6210`, `:6216`, `:6300`, `:2499`.
Violates the AGENTS.md hard rule ("Todo texto que venga de un jugador se escapa ... tanto en
contenido como en atributos"). Verified NOT defects: `index.html:1806,1808` (clipboard plain text),
`index.html:2596` (openConfirm uses textContent), `index.html:5620,5732,5747` (escaped at insertion, `:5925`).
Proposed home: a repo-wide TC in any spec that owns §4.5, or an AGENTS.md-level lint.

## 2. A finalized match's read-only screen can show an unsaved draft score — EXTERNAL, incidental
`index.html:6507-6513` `__openMatch` deliberately preserves `resultadoDraft` (for the closed-not-finalized
case, per its own comment) but clears `editandoResultadoFinalizado`. `golesEquipoActual`
(`index.html:4539-4546`) prefers the draft whenever `resultadoDraft.matchId === m.id`. So: edit a
finalized result -> "Volver a partidos" -> reopen the same match -> the READ-ONLY screen renders the
unsaved draft total as if it were the stored result. The Spec provides only two endings for a draft
(save or Cancel). Proposed home: carga-por-toque §7.8, an FR-074 sibling.

## 3. The detail-row "+" silently records a plain goal on a penalty row — EXTERNAL, deliberate
`index.html:4913-4924` + `tipoPorDefectoDeFamilia` (`:4457-4461`), which collapses family `goles` to
`'gol'`. Pressing "+" on a row reading "3 (2 de penal)" adds a NON-penalty goal. The ambiguity has to
resolve somehow, but no ID states which way. Proposed home: carga-por-toque §7.6, a new FR.

## 4. Escalon table runs out above data-max-fila="5" — INTERNAL, incidental
`index.html:601` is the last rule; `maxFila` is `ceil(n/2)` over a line (`:4678`, `:4846`), and rebanada 2's
manual drag can pile enough units on one team to yield 6+. `--chip-w`/`--chip-size`/`--row-gap` then
resolve to nothing and the shirt loses its width. Proposed home: CANCHA_SPEC §7.6.

## 5. Prototype data generators are reachable from the shipped UI — EXTERNAL, deliberate-as-dev-aid
`index.html:2182-2203` ("Cargar jugadores de prueba", button at `:2440`) and `index.html:6465-6505`
(`btnCompletarPrueba`, `:6569`) create real `Jugador Prueba N` records in the real Firestore project.
The code comments concede they are "no forma parte de la spec". Proposed home: 001/002 §3 Out of scope.

## 6. Persistence degrades to a silent no-op — EXTERNAL, deliberate, consequence unstated
`index.html:1384`, `:1391`: if `firebase.initializeApp` throws, `storage.get` returns `{value:null}` and
`storage.set` returns without writing. The app runs on an empty in-memory store and every save is
discarded with no user-visible signal. Proposed home: 001 §8 as an NFR.

## 7. A corrupt legacy record silently drops goals on edit — INTERNAL, incidental
`index.html:4421` `golesDeJuego = goles - golesPenal`; for a stored record with `golesPenal > goles`
this is negative, the synthesis loop never runs, and the player's plain goals vanish. No reachable
writer produces such a record today (the event model makes it structurally impossible), so it is
latent, not live. Proposed home: resultados-partido, a read-side clamp clause.

## 8. `setCustomUserClaims` overwrites all previous claims — INTERNAL, deliberate
`tools/rol.js:166`. Any future claim beyond `rol`/`jugadorId` would be destroyed by an assignment.
Documented in the script header; no ID sanctions or forbids it. Proposed home: rol-en-el-token §7.3.

## Not findings (excluded, per the contract)
Framework/CDN boilerplate; the three Firebase compat tags; `tests/` fixtures and doubles; internal
refactoring liberty; behaviour already covered by an explicit Concept §14 deferral.
# Spec-quality findings (defects in the DOCUMENTS; never counted in the verdict totals)

## A. Undeclared supersession — the root cause of most DIVERGENT verdicts
AGENTS.md: "Cuando un documento nuevo modifica comportamiento ya descripto en un spec existente,
DEBE declararlo explícitamente: qué spec y qué parte reemplaza ... Sin esa declaración, dos specs
vigentes se contradicen." Six violations, all live:

| Superseding doc | Silently overrides | Evidence |
|---|---|---|
| `carga-por-toque` (**no Declaración de reemplazo block at all**; rebanadas 1-5 each have one) | `cancha` FR-042, `arrastre` FR-040, `panel` FR-083/FR-083b, `partido-finalizado` FR-063/FR-064/FR-020 | `grep -c team-player-row index.html` = **0** |
| `carga-por-toque` vs **its own §3.2** | the in-cancha "Guardar" icon it declares a non-goal "no relitigada acá" | SPEC:117 vs `index.html:6276` |
| `carga-por-toque` FR-033 | `resultados-partido` "Equipo sin goles no puede tener penales" | `index.html:4467-4474` |
| `004-estadisticas` (**no declaration of any kind**) | `002-gestion-jugadores` FR-014 ("sin mostrar este dato") | `index.html:2477-2487` |
| `rol-en-el-token` | `005-login-basico`, `007-permisos-por-usuario` | pending cluster G3 |
| `goles-en-contra` | `001` FR-013 (team total formula) | `index.html:4528-4532` |

## B. Stale bindings that enforce the negation — worse than a missing test
`tests/layout.test.js:661` carries `cancha/S-10`, `arrastre/S-10`, `panel/S-11`, `panel/S-11b`,
`finalizado/S-02c` on a test whose assertion is
`if (!document.querySelector('.cancha')) problemas.push('no se dibujó la cancha ... (D-12, TC-011)')`
— the inverse of all five scenarios. `tests/layout.test.js:1489` does the same for `cancha/S-10b`.
Every `comm`-based gate passes. A binding that tests the opposite behaviour is worse than none.

## C. One ID, two obligations
`S-05j` is defined twice in `PANEL_ARMADO_SPEC.md:786-787` — once `[property]`, once `[boundary]`,
with different normative text. `sort -u` in `T-N.D8`/`D19` merges the duplicate away, so both gates
pass. This is exactly the blind spot `T-N.D18b` exists to close, and the only instance in the repo.

## D. A test file that does not exist
`navegacion-partidos` Plan §5, §7.2.6, §7.2.8, §12.1, §12.9 and §16 bind ten scenarios and TC-004/TC-006
to **`tests/partido.test.js`**. `git ls-files tests/` does not list it. Only 13 of 22 scenarios have any
binding, all of them in `layout.test.js`. (The implementation itself is largely present — an absent
test is not an absent feature, and the cluster's verdicts reflect that.)

## E. Clauses quoting literals the code does not contain
Per the contract these are *contradicted*, not merely unmet:
- `TC-015` (arrastre) quotes `max-width: 900px`; the breakpoint moved to **1099/1100** (`index.html:5001`,
  `:722`) via `NAVEGACION_PARTIDOS_SPEC` TC-007. The `S-04a`/`S-04b` guard meant to keep the CSS and JS
  literals in sync **is itself desynchronised**: `tests/layout.test.js:949` still computes
  `a.ancho <= 900` while measuring 901px. A latent failing assertion, invisible because the suite
  skips without Playwright (`tests/layout.test.js:2079-2087`).
- `cancha` S-06b/S-06c pinned to the same dead 900/901 boundary.
- `004/FR-007` mandates the literal emoji ⚽/👟; the design system bans emoji and the code ships PNGs.
- `orden-jugadores` FR-001 quotes "Puntaje ascendente"; the UI renders "Puntaje ↑".
- `orden-jugadores` FR-012 and `S-04` quote `draggable="false"`; the code omits the attribute instead.
- `resultados-partido` quotes ⚽/🔴 in seven display clauses.
- `goles-en-contra` FR-005/TC-041 quote `Math.max(0, parseInt(inp.value,10))` and `.team-stat-input`;
  neither exists anywhere in the file.

## F. Internal contradictions inside a single Spec
- `carga-por-toque`: **TC-020 demands 44x44px** for every icon button it introduces (naming `-`);
  **NFR-002 permits 26x26 / 38x38** for the same button. Code and test follow NFR-002, so TC-020 is
  unsatisfiable by construction.
- `panel-armado`: **FR-034 / S-04 / S-04d / S-04e / AC-05 / AC-26 / TC-013 / TD-04** all forbid marking a
  single-slot line (Arco, Ataque) as exceeding the threshold. `index.html:5336` marks it, and
  `tests/panel.test.js:268` + `tests/layout.test.js:1130` **assert that it must be marked**. The Spec,
  the code and the bound tests cannot all be right; §18 records no amendment.
- `partido-finalizado`: FR-040, S-04 and AC-05 describe three different score layouts.
- `orden-jugadores`: TC-040 requires the `playersSortMode` write behind `isAdmin()`; FR-002 gives
  non-admins the control and FR-051 says the value is shared. The code follows the FRs, the Firestore
  rules follow the TC, and the rejection is swallowed by `.catch(console.error)` (`index.html:2652-2656`).
- `modelo-eventos`: S-01c's arithmetic is impossible given FR-003 (a penalty counts in both counters);
  the sibling S-01b states the correct figure.

## G. Quantified NFRs with no measurement, and unquantified NFRs with no number
Four features have **zero** NFR measurement tests (`partido-finalizado` 0/5, `carga-por-toque` 0/6,
`modelo-eventos` 0/3, `navegacion-partidos` 0/4) — a blanket `AC-51` failure. Separately, several NFRs
are declared literally "None", and 9 of 10 in both `goles-en-contra` and `orden-jugadores` have no
Plan §11 `OBS-*` signal, so nothing in production will ever report whether they hold.

## H. Gate-layer defects this audit found in the projects' own Plans
- `orden-jugadores` Plan §12 records compliance evidence for **1 of 12** `TC-*` (only TC-042, and that
  inside an `IMP-04` risk cell) — an outright `AC-52` failure. It also has no `T-N.D20` checkbox at all.
- `goles-en-contra` and `orden-jugadores` Plans both assert "no `package.json` at repo root". There is
  one (gitignored, for Playwright). The `Supply-chain: none` verdict still stands — no lockfile is
  *versioned* — but the stated justification is false.
- Dangling Plan citations: `arrastre` cites `S-06d`, `partido-finalizado` cites `S-06`/`S-11a`,
  `carga-por-toque` Plan §12.1 is three rows short of its Spec §9 and misplaces two bindings.
