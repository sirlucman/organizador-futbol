# Critique — DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md (per-doc)

> **Critic model:** claude-sonnet-5 (Claude Sonnet 5)
> **Author model:** claude-opus-5-5 (per command invocation and the Plan's own Change-log row, §17)
> **Model-independence (Step 7.0):** different family, same provider (Claude Opus author, Claude Sonnet critic) — the accepted middle tier per `critic-rubric.md`. Provider mix would be stronger, but this is not a same-family self-review. Matches the precedent already set for this feature's Concept Note and Spec critiques (same critic model).
> **Date:** 2026-09-30
> **Inputs:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` (subject), cross-checked against `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` and `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` for cross-reference accuracy only — this is a **per-doc** critique of the Plan, not a cross-doc pass.

## Verdict

**CHANGES REQUESTED** — one 🔴 Blocking finding: the Plan's own ID-uniqueness DoD gate command (`T-1.D18b` / `T-2.D18b`), copied verbatim from a prior feature's Plan, does **not** run clean against this Plan when executed exactly as specified — it reports seven false-positive "duplicates" caused by the Plan's own §12.2 table shape. Everything else checked (scenario↔test binding, TC↔§12 binding, AC↔§16 binding, NFR↔OBS binding, three Mermaid diagrams, a sample of ~15 code-line citations, DoD-as-tasks/commits-as-tasks structure, branching-model detection) verified clean on direct execution.

## Findings

### Per-doc — Accuracy

None ✓ — spot-checked ~15 `index.html` line-number citations across the highest-stakes design decisions (`TD-02`–`TD-13`: `POSITIONS`/`POS_COLOR` at 1485-1493, `window.__generarEquipos` at 4193, `renderAvisoDesactualizado` at 5946-5955, the Estrategia 2 `OUTFIELD` at 3010, `puntajeEnPosicion` at 1912-1915, the "2º" pill at 4820-4832, `savePlayers`/`playerScores` split at 2142-2154, the ficha `<select>` HTML at 1165-1199, `ORDEN_FORMACION`/`FORMACION_KEY_POR_POSICION` at 3160-3161, the two lugar-cycling sites at 3654/5476, `construirUnidadDupla` at 4105-4150, `CANCHAS`/`formacionTexto` at 1494-1497/1681-1684) — all resolved to the code they claim. Also confirmed `construirUnidadDupla` is correctly listed among `computeAvg`'s callers needing the signature change (`TD-04`), which a shallower read could have missed since its current call site (`computeAvg(pA.scores)`) only passes one argument today.

### Per-doc — Consistency

- **1. `TD-01`'s Spec-ref column cites decisions that don't match its own rationale**
  - **Dimension:** Consistency
  - **Where:** `DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` §3.1, row `TD-01`
  - **What:** `TD-01` ("Sin feature flag. Dos ramas...") cites `Spec §13, D-08, D-09` as its Spec ref, but the rationale text that follows only argues from Spec §13 ("no hay convivencia de catálogos") and the Simplicidad principle. `D-08`/`D-09` are about reclassification blocking generation, not about flag/rollout strategy — no part of the stated rationale explains why those two IDs justify "no feature flag."
  - **Why it matters:** A reader trying to back-derive "why no flag" from the cited IDs alone would land on the wrong decisions; the citation doesn't strengthen the argument it's attached to.
  - **Evidence:** `| TD-01 | Sin feature flag. Dos ramas (docs/, feature/), y la de código se mergea entera | Spec §13, D-08, D-09 | Spec §13 declara que no hay convivencia de catálogos: un merge parcial publicaría media feature en GitHub Pages. Un flag sería infraestructura anticipada (Simplicidad) |`
  - **Confidence:** Low — a case for an implicit link (binary reclassified/not-reclassified state per `D-08`/`D-09` doesn't compose with a partial rollout) is plausible but not spelled out.
  - **Severity:** 🔵 Suggestion
  - **Suggested fix:** Either drop `D-08, D-09` from the ref column, or add one clause making the link explicit ("...y un flag dejaría convivir per-partido el catálogo viejo con el nuevo, que `D-08`/`D-09` tratan como estado binario, no gradual").

### Per-doc — Completeness

- **2. `FR-067` has no explicit test or task citation anywhere in the Plan**
  - **Dimension:** Completeness
  - **Where:** `DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` — absent from §7.3.6 (Tests), §12.1 (Scenario Traceability Matrix), §12.9 (TC verification), and §16 (AC coverage); `grep -n "FR-067" DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` returns nothing.
  - **What:** `FR-067` ("Con 'Por puntaje', el sistema seguirá sin asignar puestos y mostrará la sigla del puesto principal a modo informativo") is one of 7 Spec FRs never mentioned in the Plan (the other 6 — `FR-011`, `FR-012`, `FR-024`, `FR-026`, `FR-061`, `FR-073` — are all covered indirectly through a parent scenario's `covers FR-NNN a FR-MMM` range in Spec §9, e.g. `FR-073` via `S-09`'s "covers FR-070 a FR-073"; `FR-067` is the one exception with no scenario range covering it at all — only the blanket `AC-03` range "`S-05` a `S-08` y `S-11` pasan (cubre `FR-050` a `FR-068`)" in Spec §11.1 touches it, and no individual scenario in §9 exercises the "Por puntaje" informational-sigla behaviour specifically).
  - **Why it matters:** The Plan's only FR-coverage check is `T-2.D7`, a manual review task ("revisar las tablas de §7.3.5 contra Spec §7, §8 y §4") — not a mechanical `grep`/`comm` gate like the ones used for scenarios (`T-2.D8`), NFRs (`T-2.D9`) and TCs (`T-2.D10`). An FR with no scenario, no test-table row and no task citation can silently ship unverified and nothing in the Plan's own DoD would catch it.
  - **Evidence:** Spec §7.8 `FR-067`; Spec §9 scenario `covers` annotations (none cite `FR-067`); Spec §11.1 `AC-03` blanket range.
  - **Confidence:** Medium — the behaviour is explicitly "as today" (unchanged, `003 FR-002`), so the regression-suite safety net of `TD-05` likely exercises it incidentally; but the Plan doesn't say so or cite it.
  - **Severity:** 🟡 Should fix
  - **Suggested fix:** Add a one-line citation wherever `TD-05`'s regression-suite argument is made (§3.1 or §7.3.1) noting that `FR-067` is verified by the existing `tests/motor.test.js` "Por puntaje" cases carrying over unchanged, or add an explicit case to `tests/puestos.test.js`.

### Per-doc — Clarity

None ✓ — FRs/TCs/NFRs read as single-clause obligations where cited; ACs describe evidence-of-compliance rather than restating requirements; no compound "…and also…" tasks found in the checklists.

### Per-doc — Methodology-invariants

- **3. `T-1.D18b` / `T-2.D18b`'s ID-uniqueness gate command does not run clean against this Plan**
  - **Dimension:** Methodology-invariants (`MD-05` stable IDs / `MD-34` uniqueness gate)
  - **Where:** `DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` §7.2.9 `T-1.D18b` and §7.3.9 `T-2.D18b` (the command is stated once and reused by both); root cause lives in §12.2 *Impact Traceability*.
  - **What:** The Plan declares this task should run "vacío en los tres" (empty in all three documents) and explicitly notes it's "el mismo comando que `INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` `T-1.D18b`". I ran the exact command (copied verbatim from the task) against `DESGLOSE_POSICIONES_IMPLEMENTATION_PLAN.md` in isolation — it is **not** empty. It reports seven IDs as duplicates: `OBS-03`, `OBS-05`, `OBS-06`, `OBS-08`, `R-02`, `R-05`, `R-06`. Root cause: §12.2 *Impact Traceability* has an `OBS` column and a `Risk` column whose cells are bare IDs with no surrounding backticks (e.g. row `IMP-05`'s `OBS` cell is literally `OBS-03`, no backticks) — the command's per-pipe-delimited-cell pattern `\| *${p}-[0-9]+[a-z]* *\|` cannot distinguish "this cell *is* the OBS-03 definition row" from "this cell *references* OBS-03 from a different table," so every `OBS-NN`/`R-NN` that's both defined in §11/§14 **and** cross-referenced bare (no backticks) in a §12.2 cell collides with itself. Running the same command against the Concept Note and the Spec in isolation returns empty for both — the defect is specific to this Plan's own §12.2 shape, not inherited from the borrowed script.
  - **Why it matters:** This is a mechanical DoD gate a coding agent is meant to run and check off (`T-1.D18b`, `T-2.D18b`). As written, it will *always* report these seven false positives, for two reasons that both cost real effort: (a) whoever executes the checklist has to manually re-verify the seven "duplicates" are not real duplicates every time the gate is run, since the checklist gives no indication these are known false positives; (b) worse, it risks an implementing agent "fixing" a phantom uniqueness violation by renumbering or removing one of the real, correct §11/§14 definitions, which would actually break the cross-references those IDs are supposed to preserve.
  - **Evidence:**
    ```
    $ for p in D FR NFR TC AC TD OBS IMP R A US OPEN-Q; do
        { grep -ohE "^- \*\*${p}-[0-9]+[a-z]*\*\*" "$f"; grep -ohE "\| *${p}-[0-9]+[a-z]* *\|" "$f"; } \
        | grep -ohE "${p}-[0-9]+[a-z]*"
      done | sort | uniq -d
    OBS-03
    OBS-05
    OBS-06
    OBS-08
    R-02
    R-05
    R-06
    ```
    Confirmed the collision sites: `OBS-03` is defined at the §11 Observability row and re-cited bare in `IMP-05`'s `OBS` cell (§12.2); `OBS-05` similarly collides with `IMP-03`/`IMP-06`; `OBS-08` with `IMP-04`; `R-02`/`R-05`/`R-06` collide the same way between §14 *Risks* definitions and their bare citations in other rows' `Risk` cells.
  - **Confidence:** High — reproduced directly, root cause isolated, confirmed the same command is clean on the sibling Concept Note and Spec.
  - **Severity:** 🔴 Blocking
  - **Suggested fix:** Either (a) wrap every §12.2 `OBS`/`Risk` cell citation in backticks (matching the convention §11/§14 already use, and matching how §12.2 itself backtick-wraps its `FR`/`TC`/`NFR`/`D` citations in the *Triggered by* column) so the existing regex naturally excludes them, or (b) tighten the command's second `grep` to require the ID sit alone on its own table row (anchor on row-start `^\|` immediately followed by the ID, not "anywhere a pipe-ID-pipe pattern appears"). Option (a) is the smaller diff and matches the Plan's own citation style elsewhere in §12.2.

## Summary

- Blocking: 1
- Should fix: 1
- Suggestions: 1
- Methodology-invariants violated: `MD-34` (ID-uniqueness gate, `T-1.D18b`/`T-2.D18b`)
