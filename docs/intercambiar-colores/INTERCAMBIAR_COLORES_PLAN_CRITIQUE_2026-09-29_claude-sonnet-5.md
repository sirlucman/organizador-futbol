# Critique — INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md (per-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5-5 (per the Plan's own §17 Change log)
> **Model relationship:** different family, same provider (Claude Opus → Claude Sonnet) —
> per `references/critic-rubric.md`, this is the acceptable middle tier, stronger than a
> same-family self-review though weaker than a cross-provider pass. Requested by the owner
> as "autocrítica" (Step 5), but because the critic and author are different model
> families, this report is filed with the Step 7 naming/artifact convention
> (`AGENTS.md` § Reportes de crítica) rather than only recorded as a same-model Step 5
> pass in the Change log.
> **Date:** 2026-09-29
> **Inputs:** `docs/intercambiar-colores/INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md`
> (cross-checked against `INTERCAMBIAR_COLORES_SPEC.md` for the traceability tables, and
> against `index.html` / `tests/layout.test.js` for every code citation the Plan makes)

## Verdict

**CHANGES REQUESTED** — one 🔴 Blocking finding: a DoD gate in both branches cites a
script that does not exist anywhere in the repository or in the methodology skill's
bundled scripts, so that gate cannot actually run as written. Two 🟡 Should-fix findings
accompany it: one mis-pinned code citation, and one task that under-specifies a required
code change. All other citations checked (about twenty `index.html` / `tests/layout.test.js`
line references, the Spec↔Plan traceability tables, the branching-model detection, the
`--muted` contrast figure, and the `PANEL_ARMADO_SPEC.md` replacement-annotation targets)
were verified against the actual files and found accurate.

## Findings

### Per-doc — Accuracy

#### 1. `index.html:4081` cited for the sign of `diferencia`, but the formula lives at `index.html:3451-3463`

- **Dimension:** Accuracy (extends to MD-26 Trust-but-verify)
- **Where:** `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` §1 Summary, line 24
- **What:** The Summary states that each line of `balanceLineas` carries a signed
  `diferencia` (`blanco − negro`) and cites `index.html:4081` "vía `balanceLineasDe`" as
  the evidence.
- **Why it matters:** `TD-03` (negating `diferencia` when swapping colors) is the one
  design decision in this Plan the author flags as "lo único no obvio antes de leer el
  resto" — it rests entirely on this citation. `index.html:4081` is a **call site**
  (`const balanceLineas = balanceLineasDe(blanco, negro, posicionAsignada, porId);`), not
  where the field — or its sign convention — is defined. A reader (human or a coding
  agent) who opens that line to verify the claim sees a function call, not a formula, and
  has to go hunting for the real definition.
- **Evidence:** Verified directly — `balanceLineasDe` is defined at `index.html:3451`, and
  the `diferencia` field is built at `index.html:3462` as
  `diferencia: Math.round((b - n) * 10) / 10` where `b` is the `blanco` sum and `n` is the
  `negro` sum. That confirms the underlying claim is **true** — but the citation pins it
  to the wrong place (a different call site of the same function exists at line 3948 too,
  so "vía `balanceLineasDe`" alone is ambiguous about which call the author meant).
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Repoint the citation to `index.html:3451-3463` (the `balanceLineasDe`
  definition), or to both — definition first, then "(llamada en 4081)" if the call site is
  still useful context.

### Per-doc — Consistency

None ✓ — no ID reuse, no unexplained ID gaps, no cross-section contradictions found across
`TD-*`, `OBS-*`, `IMP-*`, `R-*`, `T-N.*`.

### Per-doc — Completeness

#### 2. T-2.8 doesn't say the `panel-armado` icon classifier itself needs to change, only its expected string

- **Dimension:** Completeness / Clarity (agent-execution failure mode per Dim 5.3 "Exact
  paths + symbols")
- **Where:** `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` §7.3.9, task `T-2.8`
- **What:** T-2.8 reads: *"Actualizar el escenario `panel-armado` para que espere
  `intercambiar,copiar,regenerar` (sin esto, el commit rompe un test existente)"* — it
  names only the expected string, not the classifier that produces the actual string.
- **Why it matters:** The existing `panel-armado` scenario in `tests/layout.test.js`
  classifies each header icon with
  `b.className.includes('copiar') ? 'copiar' : 'regenerar'` — a **binary** ternary with no
  third branch. A new button carrying `panel-icono-intercambiar` does not match
  `'copiar'`, so it falls into the `else` and gets labelled `'regenerar'`. If an
  implementing agent follows T-2.8 literally — updating only the expected string to
  `'intercambiar,copiar,regenerar'` — the actual computed value becomes
  `'regenerar,copiar,regenerar'`, and the test keeps failing, now for a reason the task
  text doesn't mention. The DoD gate (`T-2.D1`/`T-2.D2`, tests must pass) would catch this
  before merge, so it isn't a silent-shipped bug, but it is a debugging detour the Plan
  should have named directly, per the methodology's "exact paths and exact symbol names"
  rule for agent-runnable tasks.
- **Evidence:** `tests/layout.test.js`, the `ordenIconos` line inside the `panel-armado`
  scenario: `ordenIconos: [...sec.querySelectorAll('.panel-icono')].map(b =>
  b.className.includes('copiar') ? 'copiar' : 'regenerar')`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Add to T-2.8 (or as a new sub-bullet): "cambiar el clasificador de
  `ordenIconos` de un ternario binario (`copiar`/`regenerar`) a uno de tres ramas que
  reconozca `panel-icono-intercambiar`."

### Per-doc — Clarity

None ✓ — no compound obligations, no vague/unquantified language, no TC/design-pattern
leakage found in this Plan beyond what's already correctly scoped as `TD-*`.

### Per-doc — Methodology-invariants

#### 3. `T-1.D18b` and `T-2.D18b` gate on `scripts/id-uniqueness.sh`, which does not exist

- **Dimension:** Methodology-invariants (MD-15 DoD-as-tasks: "every checklist item
  mechanically verifiable"; MD-26 Trust-but-verify: an un-flagged unverifiable internal
  claim is 🔴 by the rubric's own rule)
- **Where:** `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` §7.2.9 `T-1.D18b` (line 236) and
  §7.3.9 `T-2.D18b` (line 366)
- **What:** Both DoD blocks read *"Unicidad de definiciones —
  `scripts/id-uniqueness.sh` sobre los tres documentos, sin salida"* — presented as an
  exact, runnable mechanical gate, the same way every other `T-N.D*` command in this Plan
  is a real `sed`/`awk`/`comm` one-liner that was checked to run.
- **Why it matters:** `scripts/id-uniqueness.sh` does not exist in this repository (there
  is no `scripts/` directory in `organizador-futbol` at all) and does not exist in the
  engineering-methodology skill's own bundled `scripts/` folder either — that folder ships
  only `detect-branching-model.sh`. Anyone (human or agent) executing this DoD item
  literally gets "no such file or directory," not "no output" — which is what the gate is
  supposed to mean by passing. This is exactly the failure mode the rubric singles out:
  the claim was neither verified nor tagged `[UNVERIFIED — reason]`, so per the rubric's
  own severity rule it is 🔴 regardless of how minor the underlying check is.
- **Evidence:** `ls scripts/` in the project root → "No such file or directory"; `ls` on
  the skill's `scripts/` directory → only `detect-branching-model.sh` present, no
  `id-uniqueness.sh`.
- **Confidence:** High
- **Severity:** 🔴 Blocking
- **Suggested fix:** Either (a) replace the two `T-N.D18b` commands with an inline
  `sort | uniq -d` one-liner over the ID patterns already used elsewhere in this Plan's own
  gates (the Plan already has the pattern down cold — see `T-N.D8`/`T-N.D10`'s `comm`/`awk`
  usage), scoped across the three feature documents; or (b) if a uniqueness script is
  genuinely expected to exist as project tooling, write it first and commit it in Branch 1
  before the DoD cites it. Either way, don't leave a DoD command pointing at a file that
  isn't there.

## Summary

- Blocking: 1
- Should fix: 2
- Suggestions: 0
- Methodology-invariants violated: `MD-15` (DoD-as-tasks / mechanical verifiability),
  `MD-26` (trust-but-verify — unflagged unverifiable internal claim)

## What checked out cleanly (not re-litigated above)

Spot-verified and found accurate: `index.html` line citations for `intercambiarUnidades`
(5138), `esFilaEditable` (4587), `window.__moverJugadorManual` (5243), `ICON_COPIAR` /
`.panel-icono-copiar` CSS (5782, 795-796), `renderEncabezadoTarjeta` / `locked` (5815-5838),
`formacion` / `arquerosInfo.equipoCompensado` shape (4071-4075, 2826-2830), `saveMatches` /
`CAMPOS_EQUIPOS_ARMADO` (2150-2179, 2154), `balanceLineasVigente` (5305-5313),
`equipoVisibleCancha` / `partidoDelEquipoVisible` (existence and semantics, TD-06), the
`--muted` value backing `A-02`'s contrast figure, the `PANEL_ARMADO_SPEC.md` line targets
for `D-24`/`FR-002b`/`S-01`/`FR-072`, and the `detect-branching-model.sh` output (matches
§7.0 verbatim). Also verified mechanically: every Spec `S-NN`/variant (35 IDs) appears in
Plan §12.1; every Spec `TC-*` (10) and `NFR-*` (4) appears in Plan §12.9/§11; every Spec
`AC-*` appears in Plan §16 with a populated Test column; the §12 section boundaries used by
the Plan's own `sed`/`comm` DoD gates match the documents' actual headings.
