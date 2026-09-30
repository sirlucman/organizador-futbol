# Desglose de posiciones — Spec Conformance Report

> **Methodology:** `engineering-methodology:spec-conformance` (audit against the committed
> Spec; read-only, never executes the audited feature).
> **Model:** claude-sonnet-5. **Date:** 2026-09-30.

## 0. Provenance

- **Spec:** [`DESGLOSE_POSICIONES_SPEC.md`](./DESGLOSE_POSICIONES_SPEC.md), status Draft,
  last Change-log row 2026-09-30 (Lucas Manoukian, claude-opus-5-5). This is the sole
  denominator of this audit.
- **Read-only context:** [`DESGLOSE_POSICIONES_CONCEPT.md`](./DESGLOSE_POSICIONES_CONCEPT.md)
  (§10 decisions, §14 out-of-scope, §15 open questions) and
  [`DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md`](./DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md)
  (§4 module map, §7.1 branch tracker, §12 test plan, §17 Change log). No family from either
  document is scored — only the Spec's `FR-*`/`NFR-*`/`TC-*`/`S-*`/`AC-*` are.
- **Code:** `index.html`, `tests/`, `tools/` at commit `b5aabd2` (tag `v2.0.28`), which is
  also the repository's current clean `HEAD` — read in place, no worktree needed.
- **Denominator:** 68 `FR-*`, 6 `NFR-*`, 16 `TC-*`, 30 `AC-*`, 14 parent `S-*` scenarios + 39
  lettered variants = **173 driven IDs**, extracted mechanically (`grep`, anchored on
  `- **<prefix>-NN**` and table-row forms), not by hand-transcription.
- **Method:** Phase 2 mechanical gates run directly by the orchestrator (grep/comm, no
  execution of the feature). Phase 3 forward sweep run as 6 parallel read-only sub-agents,
  one per capability cluster (catálogo/textos; ficha/reclasificación/lista; bloqueo; motor;
  cancha/partidos guardados; seguridad/valores desconocidos), each given the verbatim Spec
  clause text and told to re-locate code by name (not by the Plan's now-stale line numbers).
  Phase 4 reverse sweep done centrally over the diff's full symbol list. One cluster's claim
  (see §6) was checked independently and corrected before this report was written.
- **This feature was never executed** as part of this audit: no `node tests/*.test.js`, no
  `tools/medir-motor.js`, no `tools/revisar-historial.js`, no browser. Every verdict below
  rests on reading the code and the test bodies at the pinned commit.

## 1. Declaración de reemplazo — verificación

The Spec's replacement table (front-matter) lists 16 rows across 9 origin documents
(`002`, `003`, `003/data-model.md`, `011`, `ORDEN_JUGADORES_SPEC.md`, `CANCHA_SPEC.md`,
`PARTIDO_FINALIZADO_SPEC.md`, `PANEL_ARMADO_SPEC.md`, plus the "Complementa"/"No reemplaza"
clauses). **All 16 rows are reciprocally marked in their origin Spec**, each with an explicit
`**Reemplazad[oa]... el 2026-09-30 por <ID> de DESGLOSE_POSICIONES_SPEC.md**` annotation and,
for `ORDEN_JUGADORES_SPEC.md` and `PANEL_ARMADO_SPEC.md`, a Change-log row recording the
annotation. Verified by direct read of every cited line in every origin file — no gap found.
This obligation (`AGENTS.md` § "Dónde vive la fuente de verdad") is **fully satisfied**.

## 2. Verdict summary (no headline percentage, per methodology)

| Verdict | FR | NFR | TC | S (parent+variant) | AC | Total |
|---|--:|--:|--:|--:|--:|--:|
| IMPLEMENTED | 66 | 2 | 15 | 52 | 25 | 160 |
| PARTIAL | 1 | 0 | 0 | 0 | 2 | 3 |
| DIVERGENT | 0 | 0 | 0 | 0 | 0 | 0 |
| ABSENT | 0 | 0 | 0 | 0 | 0 | 0 |
| UNVERIFIABLE | 1 | 4 | 1 | 1 | 3 | 10 |
| **Total** | **68** | **6** | **16** | **53** | **30** | **173** |

(FR-068 counted once under PARTIAL; TC-033 and AC-24 counted under UNVERIFIABLE; S-10d
counted under UNVERIFIABLE; AC-17 and AC-03 counted under PARTIAL.)

No `DIVERGENT` and no `ABSENT` finding survived — every driven ID has *some* implementation;
the gaps are in test-binding strength and in execution-gated verification, not in missing
behaviour.

## 3. Forward sweep — by family

### 3.1 FR-* (Functional requirements)

All of FR-001–FR-006, FR-010–FR-014, FR-020–FR-032, FR-040–FR-045, FR-050–FR-058,
FR-060–FR-067, FR-070–FR-084, FR-090, FR-091 — **IMPLEMENTED**, each with `file:line`
evidence gathered by the owning cluster (see §5 for where a finding narrows this). Selected
load-bearing evidence:

| ID | Evidence | Note |
|---|---|---|
| FR-001 | `index.html:1502-1511` `PUESTOS` array, exact 8 entries | |
| FR-003 | `ordenDePuesto` `index.html:1540-1547` | drives every sort site |
| FR-014 | `scoresAlGuardar` `index.html:2424-2430`; unit `puestos/S-02b` | |
| FR-022b | `textoAntesDeReclasificar` `index.html:2431-2435`, wired at `:2833-2835` | e2e `puestos-reclasificar` asserts exact string |
| FR-040/041/045 | single guard in `window.__generarEquipos` `index.html:4505`, `return`s before the sole `m.equipos=` write at `:4565` | both generate and regenerate share one gate |
| FR-054 | `cambiarEquipo` gated on `posicionAsignada[idB]===posicionAsignada[idN]`, `index.html:4322` | |
| FR-059 | intra-team swap `index.html:4330-4345`, concrete numeric case reproduced by `puestos/S-06e` | see §5 alternate reading |
| FR-074 | `ladoDe`→`'central'` for any `esPosicionVieja` value, `index.html:1534-1538` | |
| FR-084/TC-003 | no render/read function in the cancha pipeline calls `window.storage.set` | see §5 — AC-17's *test* is weaker than the behaviour |

**FR-068 → PARTIAL** (see §5.1 — code is correct by construction, but no test exercises it
against the new 8-puesto catalogue).

### 3.2 NFR-* (Non-functional requirements)

| ID | Verdict | Basis |
|---|---|---|
| NFR-001 | UNVERIFIABLE | Requires running `node tests/puestos.test.js`'s timing case or `tools/medir-motor.js`; this audit does not execute the feature. The bound test (`'puestos/NFR-001: …'`) exists and is correctly shaped (median over 20 runs, ≤50ms, both canchas — confirmed by reading it). Human check: `node tests/puestos.test.js` |
| NFR-002 | UNVERIFIABLE | Same as above. Human check: `node tools/medir-motor.js perf --cancha=8` and `--cancha=9` |
| NFR-003 | UNVERIFIABLE | Requires `LAYOUT_STRICT=1 node tests/layout.test.js`. Binding confirmed clean (§4): every `puestos-*` scenario tags `NFR-003` where relevant |
| NFR-004 | **IMPLEMENTED** | `posTextColor`/`TC-020` cross-checked against design-system tokens by the catálogo cluster; text-plus-color confirmed at every badge site |
| NFR-005 | UNVERIFIABLE | Requires live staging Firestore access. The verification artifact **does exist**: `tools/revisar-historial.js` (144 lines, added by this feature), which prints exactly the `puestos/NFR-005` label the Plan's binding convention requires (`tools/revisar-historial.js:132,134`). One cluster's sub-agent incorrectly reported this script as missing — corrected here after independent verification (`ls`/`grep` on the file). Human check: `node tools/revisar-historial.js` against synced staging |
| NFR-006 | **IMPLEMENTED** (narrow reading) | See §5.2 — one ambiguity flagged, not a verdict change |

### 3.3 TC-* (Technical & architectural constraints)

All of TC-001, TC-002, TC-003, TC-010, TC-012, TC-013, TC-014, TC-020, TC-030, TC-031,
TC-032, TC-040, TC-041, TC-042 — **IMPLEMENTED**. TC-011 — **IMPLEMENTED** (narrow reading;
alternate_reading noted, §5.2). TC-033 — **UNVERIFIABLE** (§5.3: the scenario was added, but
whether it was actually *seen failing* before being made green cannot be confirmed by
reading — no PR exists to hold the pasted red-run output the Plan's own checklist calls for).

Noteworthy evidence:

| ID | Evidence |
|---|---|
| TC-001 | `git show --stat` on the feature's commits: only `index.html`, `tests/`, `tools/`, `docs/`, `AGENTS.md`, `Roadmap.md`, `version` touched — no build/dependency file |
| TC-012 | Grepped `index.html:2960-4450` (every motor function) for `document.`/`getElementById`/`querySelector`/`innerHTML` — zero matches; `formacionObjetivo` always arrives as a parameter |
| TC-032 | `DECLARACIONES_CATALOGO` (`tests/harness.js:58-65`) exported and reused by `cancha.test.js`, `colores.test.js`, `finalizado.test.js`, `panel.test.js`, `puestos.test.js` — confirmed via grep, not just Plan's say-so |
| TC-040 | Adversarial sweep of every `siglaDe(`/`nombreDe(`/`textoDePosicion(` call site (10 sites) — each is either wrapped in `escaparHtml(...)` at the call, or the sink concatenation is escaped as a whole (`index.html:5072`, `:6375`) before insertion. No missed insertion point found |

### 3.4 S-* (Scenarios, parent + variants)

All 14 parent scenarios and their 39 lettered variants are test-bound with the canonical
`puestos/S-NN[x]` literal, confirmed by the `T-2.D8` binding gate (empty `comm -23`, run
directly, not trusted from the Plan's checklist). Every cluster additionally **read the test
body**, not just its title, to confirm the assertion matches the Given/When/Then — this
surfaced no case where a test's name overclaims what its assertions check, with one partial
exception:

- **S-01e** is only exercised at the e2e layer (`layout.test.js:741-748`), not as a
  dedicated unit case — sufficient for `AC-50` (a test exists), but the Spec's other
  `[failure]` variants across this feature are typically unit-tested too; noted as a
  Spec-quality observation, not a verdict downgrade (the e2e test does assert the right
  outcome: save blocked, error shown, no extra write).
- **S-10d → UNVERIFIABLE**: the property ("ningún partido guardado de staging cae en la fila
  sin puesto") is fixture-only in `tests/puestos.test.js:512` (`docsDesde()` from
  `fixtures-app.js`, not real staging data). Verifying it for real is exactly what
  `tools/revisar-historial.js` (NFR-005) is for — see above. Human check: same command.

All other parent scenarios (S-02 through S-12, S-20, S-21) and their variants —
**IMPLEMENTED**, with test bodies read and confirmed to assert what the Spec text demands.
Particularly strong: **S-10**'s differential test compares rendered rows/totals/formación
byte-for-byte against the actual pre-catalogue `index.html` at commit `854d673`
(`git show 854d673:index.html` used as the oracle) rather than a hand-picked expectation —
directly substantiates the "los totales… son los mismos que antes del cambio" clause.
**S-20**'s layout scenario is genuinely adversarial: it injects
`<img src=x onerror="window.__xss=1">` into both a saved match's assigned position and a
player's `principal`, and asserts the global flag stays unset, no `<img>` element exists in
the DOM, and the literal escaped text appears in the right places.

### 3.5 AC-* (Acceptance criteria)

| ID | Verdict | Basis |
|---|---|---|
| AC-01, AC-02, AC-04, AC-05 | IMPLEMENTED | scenarios pass code review, test bodies confirmed |
| AC-03 | **PARTIAL** | S-05–S-08/S-11 are solid, but AC-03's own text says it "cubre FR-050 a FR-068" and FR-068 is PARTIAL (§5.1) — the range claim is not fully met |
| AC-10, AC-11 | UNVERIFIABLE | execution-gated (perf/layout tooling) |
| AC-12, AC-14, AC-15, AC-16 | IMPLEMENTED | code review confirmed directly |
| AC-13 | UNVERIFIABLE | script exists (`tools/revisar-historial.js`), staging access does not — see NFR-005 |
| AC-17 | **PARTIAL** | behaviour (FR-084/TC-003) is sound by code review, but the *specific test* named by this AC doesn't exist: `tests/puestos.test.js:477`'s `'puestos/S-10: …'` case proves the in-memory match object isn't *mutated* (`JSON.stringify` before/after), not that no *write call* happened. The Node harness for this test doesn't even define `window.storage`, so a write-call assertion is structurally impossible there today. No other test applies `window.__escrituras` instrumentation to a cancha-reading scenario |
| AC-18, AC-19, AC-20, AC-21, AC-22 | IMPLEMENTED | |
| AC-23 | IMPLEMENTED | `T-2.D8`/`T-2.D9` gates re-run directly by this audit, both empty |
| AC-24 | UNVERIFIABLE | no PR exists to hold the red-then-green transcript the Plan's own checklist calls for (see §5.3) |
| AC-25, AC-30, AC-31, AC-32 | IMPLEMENTED | |
| AC-50–AC-55 | IMPLEMENTED | meta-gates re-run directly: `T-2.D8`/`D8b`/`D9` empty, TC↔§12/§11.3 coverage empty-diff, §12.2 has 7 `IMP-*` rows, §11 has an `OBS-*` row for every `NFR-*`, `Supply-chain: none` declared in §5 |

## 4. Mechanical gates re-run by this audit (not trusted from the Plan's checkmarks)

All run directly against the pinned commit, read-only:

- `T-2.D8` (scenario/variant binding, Spec §9 vs. `grep -r "puestos/S-"` across `tests/`) → **empty**.
- `T-2.D9` (NFR binding) → **empty**.
- `T-1.D10`/`T-1.D10b` (every `TC-*` of Spec §4 appears in Plan §12 and in Spec §11.3) → **empty** both ways.
- `T-N.D18b` (ID uniqueness across all three documents, the exact anchored command from the
  Plan) → **empty** in Concept, Spec, and Plan.
- `NFR-006`/`AC-14` literal grep (`'Defensor'|'Volante'|'Delantero'` in `index.html`) → exactly
  one line, inside the catalogue block (see §5.2).
- `TC-032` DECLARACIONES check → confirmed by direct grep, not assumed.
- `TC-001`/`AC-15` no-new-dependency check → confirmed via `git diff --stat` excluding
  docs/tests/tools.
- No PR found for either branch (`gh pr list` empty, merge commit `7ce74f4` has no PR body) —
  this is why `TC-033`/`AC-24` and `T-2.D12`–`D14` land UNVERIFIABLE rather than IMPLEMENTED:
  the Plan's own checklist marks `T-2.D12`–`D14` **unchecked**, consistent with this.

## 5. Findings that need a decision (not just a checkbox)

### 5.1 FR-068 — PARTIAL (dupla scoring on the new catalogue is untested)

`construirUnidadDupla` (`index.html:4411-4456`) computes a dupla's per-puesto score over
`VALORES_RECONOCIDOS` (8 new puestos + 3 old positions), and is structurally correct — the
`014` formula is applied uniformly regardless of which catalogue a key belongs to. But **no
test exercises it with the new 8-puesto names**: `tests/motor.test.js:538-548` ("014: la
dupla vale…") only checks the old names; every property test in `tests/puestos.test.js`
that generates random planteles (`plantelAlAzar`) hardcodes `duplas: []`. No test binds the
literal `puestos/FR-068`.

- This is implementation work, not a documentation fix: **Implementation Plan** work —
  add a `puestos/FR-068` case to `tests/puestos.test.js` computing a dupla's `scores` across
  the 8 new puestos, per `AGENTS.md`'s own ID-binding rule.

### 5.2 TC-011 / NFR-006 — ambiguous subject (`alternate_reading`, Rule 3)

Two sub-agents (catálogo cluster and motor-adjacent evidence) independently found the same
second table: `FORMACION_VIEJA = { defensores: 'Defensor', volantes: 'Volante', delanteros:
'Delantero' }` (`index.html:1517`), distinct from `POSICIONES_VIEJAS` (`:1513`, the
position→line table TC-011 names explicitly). `FORMACION_VIEJA` bridges the *old formation
shape* (`{defensores, volantes, delanteros}` counts) to position names, consumed only inside
`formacionPorPuesto` (`:1607-1613`), and resolves onward through `POSICIONES_VIEJAS` for
anything downstream — it does not compete with or duplicate the position→line
correspondence.

- **Narrow reading** (reported verdict): TC-011's "una única tabla" governs the
  position→line correspondence specifically; `FORMACION_VIEJA` serves a different, necessary
  purpose and is not that table → TC-011 **IMPLEMENTED**, NFR-006 **IMPLEMENTED** (the 3
  literal occurrences at `index.html:1517` sit inside the sanctioned catalogue block).
- **Broad reading** (`alternate_reading`): if "tabla de posiciones viejas" is read to mean
  *no second table naming old positions may exist at all*, `FORMACION_VIEJA` is a second,
  hardcoded (not derived) table → NFR-006 **DIVERGENT** under this reading.
- Per Rule 3, both readings are recorded; the ID is carried into this report's gaps roll-up
  regardless of which won. **This is a Spec-quality finding, not a code defect**: NFR-006's
  exemption clause was written assuming one table existed, and a second one was added later
  without updating the clause. Two remedies, pick one — do not do both silently:
  1. Amend NFR-006/TC-011 in the Spec to explicitly name `FORMACION_VIEJA` as a second
     sanctioned exemption (it is derived *from*, not competing with, `POSICIONES_VIEJAS`); or
  2. Refactor `formacionPorPuesto` to derive its formation-key→position mapping from
     `POSICIONES_VIEJAS`'s own keys instead of hardcoding the three names again, removing the
     ambiguity at the code level instead.

### 5.3 No PR exists for either branch — three ACs land UNVERIFIABLE, not IMPLEMENTED

`gh pr list` returns nothing for this repository matching this feature, and the merge
commit (`7ce74f4`) carries no PR body. This matches what the Implementation Plan's own
checklist already shows: `T-2.D12` (PR description), `T-2.D13` (gate: `T-2.30` browser test
against staging), and `T-2.D14` (PR opened) are **unchecked**, and the Plan's §17 Change log
says so explicitly ("Quedan T-2.28… T-2.30, T-2.D12 a T-2.D14"). This is a **known Plan
deviation, already documented by the Plan itself — not a new finding** — but it has a
concrete consequence for this Spec audit: `TC-033` and `AC-24` require evidence ("salida
roja pegada en el PR") that was never externalized anywhere this audit can read. The
underlying work likely happened (the Plan's checklist marks `T-2.14`/`T-2.19` done), but
**"the checklist says so" is not evidence this audit can cite** — it's the artifact under
audit, not a source outside it.

- Human check: ask the author for the terminal transcript of `puestos-ficha` run against
  the pre-catalogue `index.html` (or reproduce it by checking out `854d673` and re-running
  the new scenario against it), and similarly for `puestos-bloqueo-flujo`/`T-2.19`.

### 5.4 FR-059 — code permits more than the Spec text describes (reverse-sweep adjacent)

The intra-team permutation guard (`index.html:4330-4345`) requires only `posA !== posB`
(different puesto) and an encaje-safety check (`encajePermite`) — it does **not** restrict
swaps to puestos of the *same línea*, even though FR-059's text is phrased as "las
permutaciones entre puestos distintos de **una misma línea**". Concretely: the code also
permits an intra-team swap between e.g. LD and MD (different líneas), which FR-059 never
discusses either way.

- This is not `DIVERGENT` (FR-059's own example, `S-06e`, passes exactly as specified) and
  it is not `UNSPECIFIED-BEHAVIOUR` in the strict sense either — it is additional scope on a
  clause whose text reads as illustrative ("también... no solo...") rather than as a cap.
  Flagging under Rule 3 as an `alternate_reading` rather than a defect: narrow reading
  (FR-059 only requires same-línea swaps to count, doesn't forbid others) → **IMPLEMENTED**;
  broad reading (FR-059 caps scope at same-línea) → would be **DIVERGENT**. No test
  distinguishes the two, and none is required to by any ID. Recommend the Spec say
  explicitly whether cross-línea intra-team permutation is intended, since it changes what a
  future refactor is allowed to assume.

## 6. Correction to a sub-agent's claim

The cluster covering cancha/partidos guardados reported that "AC-13's named verification
method… does not appear to exist in the repo." This was checked independently and is
**incorrect**: `tools/revisar-historial.js` exists (added by this feature, 144 lines) and
its own output labels are `puestos/NFR-005` (`tools/revisar-historial.js:132,134`), matching
the Plan's binding convention exactly. AC-13 and NFR-005 are therefore UNVERIFIABLE only for
the reason every execution-gated ID is (this audit doesn't hit staging Firestore), not
because the artifact is missing. Corrected in §3.2/§3.5 above.

## 7. Reverse sweep

**Frontier:** every file the feature's 19 commits (`854d673..b5aabd2`) touched —
`index.html`, `tests/{cancha,colores,finalizado,fixtures,fixtures-app,harness,layout,motor,
optimo-conjunto,panel,puestos,README}.*`, `tools/{medir-motor,revisar-historial}.js`,
`AGENTS.md`, `Roadmap.md`. 19 files, well under the 60-file cap; no wider hop needed since
the Plan's own module map (§4) already names every touched symbol and matched it 1:1.

**Method:** every new top-level `function`/`const` introduced by the diff (37 symbols) was
listed and traced to the cluster that owns its sanctioning ID (§3 above). All 37 trace
cleanly to an `FR-*`/`TC-*` — `FORMACION_VIEJA` and `juegaFueraDePuesto` (both flagged above)
included. **No orphan symbol found.**

**Result: no `UNSPECIFIED-BEHAVIOUR` finding.** The two ambiguities in §5.2 and §5.4 are
reported as `alternate_reading` against an existing ID, not as unsanctioned behaviour,
because both trace to a real clause whose *scope* is what's unclear — not to code with no
Spec anchor at all.

## 8. Gaps roll-up (work for the Implementation Plan or the Spec)

| ID | Verdict | Routes to | Action |
|---|---|---|---|
| FR-068 | PARTIAL | Implementation Plan | Add `puestos/FR-068` test on the new catalogue |
| AC-03 | PARTIAL | Implementation Plan | Inherits FR-068's gap |
| AC-17 | PARTIAL | Implementation Plan | Add a `window.__escrituras`/storage-spy assertion to a cancha-reading test |
| TC-011 / NFR-006 | IMPLEMENTED + alternate_reading | Spec (decision needed) | Name `FORMACION_VIEJA` explicitly in NFR-006's exemption, or derive it from `POSICIONES_VIEJAS` in code |
| FR-059 | IMPLEMENTED + alternate_reading | Spec (decision needed) | State whether cross-línea intra-team swaps are intended |
| NFR-001, NFR-002, NFR-003, NFR-005, S-10d | UNVERIFIABLE | Human, named commands above | Run the named command; Plan's Change log already self-reports passing numbers, but this audit doesn't take that as verification |
| AC-10, AC-11, AC-13 | UNVERIFIABLE | Human | Same |
| TC-033, AC-24 | UNVERIFIABLE | Human | No PR exists; reproduce the red-run or ask the author |

## 9. Spec-quality observations (do not affect verdict counts)

- **S-01e** and generally the `[failure]` variants across this feature are tested mostly at
  the e2e layer rather than as dedicated unit cases; sufficient for `AC-50`, but inconsistent
  with how rigorously this feature otherwise unit-tests its boundary cases.
- **FR-066**'s wording ("le asignará puesto como a un titular no bloqueado") reads as if the
  whole bloqueo lifts; only the *puesto* is freed, the team-lock stays. Code is correct; the
  prose could be sharper.
- **S-21**'s acceptance is operationalized through a single CSS class (`.avg-chip`) rather
  than "any score-bearing node" — a narrow but currently-sufficient proxy that a future
  screen could silently defeat.
- **FR-029/FR-030** are correctly implemented but carry no test bound to their own literal ID
  (their parent scenarios `S-01`/`S-03` are bound, but those tests don't specifically
  exercise these two clauses) — a quieter version of the FR-068 gap in §5.1, lower stakes
  since the behaviour is exercised incidentally by other assertions.
- **FR-084/TC-003 and `PANEL_ARMADO_SPEC.md`** define IDs with the same numbers
  (`FR-084`? — not actually colliding here, but `TC-003` and similar low numbers are reused
  across unrelated feature Specs); harmless as long as any future cross-feature grep scopes
  by the `puestos/` prefix as this feature's own binding convention already requires.

## 10. What this audit did not check

Anything gated on executing the feature: the actual `node tests/*.test.js` pass/fail state,
the live perf numbers, staging data, and a real browser at 360/1200px. The Implementation
Plan's own Change log (§17, Branch 2 entry) self-reports specific passing numbers for all of
these (e.g. "57 de 57 escenarios", "99,4 ms en F8") — that is the Plan's own record of a run
it performed, not evidence this audit produced, and per this methodology's authorization
rules it is cited here as context only, never as verification.
