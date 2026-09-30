# Critique — DESGLOSE_POSICIONES_SPEC.md (per-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5-5 (per the doc's own Change log, §18)
> **Date:** 2026-09-30
> **Inputs:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md`
> **Mode:** Step 5 self-critique pass, run at the author's explicit request ("hacé la autocrítica"). The critic model differs from the author model recorded in §18 (same pairing as the prior Concept Note critique in this folder) — this is not the same-model configuration Step 5 assumes by design, but no Step 7.0 model-independence gate was run either. Treat the cross-model angle as a bonus, not as satisfying Step 7.

## Verdict

**COMMENT** — no 🔴 Blocking findings. This Spec is exceptionally well-grounded: every one of the ~20 codebase and cross-spec citations spot-checked (13 rows of the *Declaración de reemplazo* table plus 5 inline `index.html` citations in §4) resolved to real, matching content — with one exception (finding 1). §9 *Variants* and §11.5 meta-ACs, the two most commonly-skipped methodology gates, are both fully populated with no silent omissions. The three 🟡 findings are all precision/form issues, not substance gaps; fix them before the Plan starts relying on the citations and coverage claims they touch.

## Findings

### Per-doc — Accuracy

#### 1. FR-077's line citation points to the wrong code, not to the "2º" badge it describes

- **Dimension:** Accuracy
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` §7.9, FR-077 (line 450-452)
- **What:** FR-077 cites `index.html:4734` for "la marca '2º' en la camiseta cuando el puesto asignado no sea el principal, como hoy". Line 4734 falls inside the `secundaria = grupo.some(j => j.principal !== posAsignada)` computation block (lines ~4728-4738) — a boolean flag, not the badge. The actual `'2º'` pill markup (`<span class="camiseta-sec" ...>2º</span>`) lives at `index.html:4832`, about 100 lines later.
- **Why it matters:** A reader following the citation to verify FR-077 — during the Plan's grounding pass, or during an AC-12 accessibility review — lands on the wrong code and has to re-search for the actual rendering logic. It's a small gap now; it compounds if the Plan copies the citation forward into its own module map.
- **Evidence:** Cited range (4728-4738) contains `const secundaria = grupo.some(j => j.principal !== posAsignada); ... const arrastrable = esFilaEditable(m);`. The literal badge is at `index.html:4832`: `'<span class="camiseta-sec" title="' + escaparHtml(secTitle) + '">2º</span>'`.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Change the citation to `[index.html:4832]` (or a small range around it, e.g. `4820-4832`, to also capture the `secundaria` computation that feeds the condition).

### Per-doc — Consistency

#### 2. FR-054 bundles two distinct swap rules into one requirement, and FR-022b's ad-hoc ID form creates an ambiguous coverage range

- **Dimension:** Consistency
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` §7.6 FR-054 (line 390-393); §7.3 FR-022b (line 336-338); §9.1 Scenario S-01 header (line 491) and §11.1 AC-01 (line 796)
- **What:** Two separate issues that share a root cause (an FR that doesn't fit the documented ID grammar cleanly):
  1. FR-054 states, in one semicolon-joined sentence, both (a) the inter-team swap restriction ("solo intercambiará entre equipos titulares del mismo puesto asignado") and (b) a distinct intra-team permutation rule ("al permutar puestos dentro de un mismo equipo... considerará también las permutaciones entre puestos distintos de una misma línea"). These are two different mechanisms (cross-team vs. within-team) bundled under one ID, bordering on the EARS "one obligation per line" discipline (`MD-03`).
  2. `FR-022b` uses a letter suffix — a form the methodology defines only for *Scenario variants* (`S-NNa`/`S-NNb`, `MD-22`), not for FRs. Because of that, range citations like S-01's header "(covers FR-020 a FR-027)" and AC-01's "(cubre FR-001 a FR-032)" are ambiguous about whether they include `FR-022b`, which sits between `FR-022` and `FR-023`.
- **Why it matters:** For (1), a future change to the intra-team permutation rule risks silently also changing (or accidentally leaving stale) the inter-team rule, since they share one ID and one AC reference. For (2), the Plan's `T-N.D8` gate (regex `S-[0-9]+[a-z]*`) only checks Scenario IDs, not FR IDs, so a coverage gap on `FR-022b` specifically would not be mechanically caught by any described gate — it would rely on a human noticing the range notation glossed over it.
- **Evidence:** FR-054: *"El sistema, al elegir el reparto entre equipos y al refinarlo, solo intercambiará entre equipos titulares del mismo puesto asignado; al permutar puestos dentro de un mismo equipo (003 FR-027) considerará también las permutaciones entre puestos distintos de una misma línea."* S-01 header: *"(covers FR-020 a FR-027)"*, with `FR-022b` defined at line 336.
- **Confidence:** Medium
- **Severity:** 🟡 Should fix
- **Suggested fix:** Split FR-054 into FR-054 (inter-team: only same-assigned-puesto swaps) and FR-054b or a new FR-NNN (intra-team: cross-puesto-same-línea permutations) — or, if keeping them together is intentional (they're both about "what counts as an equivalent swap"), add one sentence explaining why they're one requirement. For FR-022b, either fold it into a renumbered sequential FR (shifting FR-023 onward) or explicitly note in §7.3's intro that the reclassification block use letter-suffixed FRs for requirements added after an initial numbering pass, and make S-01's and AC-01's ranges spell out `FR-022b` explicitly rather than relying on "a to b" to cover it.

### Per-doc — Completeness

None ✓ — every template section (1–18) is populated; §11.5's six meta-ACs (`AC-50`–`AC-55`) are all present with the right binding targets; §10.3 is explicitly declared `Ninguno.` rather than left blank; §16 Open questions correctly separates the two still-open items from the eight already resolved by this Spec (with a mapping back to each `OPEN-Q-NN`).

### Per-doc — Clarity

None ✓ — FRs are single-clause and testable (aside from finding 2's FR-054), NFRs are all quantified with a measured baseline and a tool/command to reproduce it, and ACs describe verification method (grep, code review, specific test) rather than restating the FR/TC/NFR they cover.

### Per-doc — Methodology-invariants

#### 3. Two disclosed-unverified items (`A-01`, the §6.5 code sweep behind `OPEN-Q-02`) are flagged only in prose, never with the literal `[UNVERIFIED — reason]` marker `MD-26` defines

- **Dimension:** Methodology-invariants (`MD-26`)
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` §14 A-01 (line 874-877) and §17 (line 915-917)
- **What:** `MD-26` requires every claim that hasn't been verified against a primary source to carry an explicit `[UNVERIFIED — <reason>]` tag, and for that tag to be cited in the handoff-adjacent section. This Spec *does* disclose both gaps in prose — A-01 says "no se recorrieron los datos de staging, así que `AC-13` lo comprueba"; §17 lists both under "Unverified markers heredados" — but neither actually carries the literal bracketed `[UNVERIFIED — ...]` string anywhere in the document body. The substance of the disclosure is present; the mechanically-greppable form is not.
- **Why it matters:** The methodology's own stated reason for the bracket form (rather than prose alone) is that downstream gates and future audits can `grep` for it. A prose-only disclosure is just as honest but not machine-checkable the same way — and if the Plan's own DoD tasks ever try to `grep -r '\[UNVERIFIED'` across `docs/` to confirm no verification debt slipped through un-flagged, these two would be invisible to that check despite being properly disclosed to a human reader.
- **Evidence:** A-01: *"Confirmado por el owner el 2026-09-30; no se recorrieron los datos de staging, así que `AC-13` lo comprueba con los datos antes de dar la feature por buena."* §17: *"Unverified markers heredados: `A-01` (confirmada por el owner, falta comprobarla con los datos — `AC-13`); el barrido de código del Concept Note §6.5 (`OPEN-Q-02`)."*
- **Confidence:** Medium — this is a form/grep-ability gap, not a disclosure gap; downgraded from what would otherwise be a 🔴 "un-flagged unverifiable claim" because the substance is in fact disclosed in both places.
- **Severity:** 🟡 Should fix
- **Suggested fix:** Append the literal tag where each is first disclosed, e.g. A-01: *"...no se recorrieron los datos de staging **[UNVERIFIED — pendiente de barrido en staging, ver `AC-13`]**, así que..."*, and similarly at the §17 line referencing the Concept Note §6.5 code sweep.

#### 4. §10.1.1 ER diagram omits `orden`, one of Puesto's five key attributes named in §10.1's conceptual table

- **Dimension:** Methodology-invariants (`MD-24`)
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` §10.1 (line 742) vs. §10.1.1 (line 749-778)
- **What:** §10.1's domain-entities table lists Puesto's key attributes as "sigla, nombre, línea, lado, orden". The `erDiagram` in §10.1.1 gives `PUESTO` an attribute block of only `sigla` (PK), `nombre`, `lado` — `línea` is reasonably represented instead as the `LINEA ||--|{ PUESTO : agrupa` relationship (a legitimate ER modeling choice, not a gap), but `orden` isn't represented anywhere in the diagram, as an attribute or otherwise.
- **Why it matters:** `orden` backs `FR-003` (the fixed sort sequence ARQ/LI/DC/LD/MI/MC/MD/DEL) and `FR-032` (position-based list ordering) — both load-bearing FRs. A reader using only the ER diagram to understand the data model (the diagram's stated purpose per `MD-24`) would miss that ordering is a stored/derived property of Puesto at all.
- **Evidence:** §10.1 row: *"Puesto | Lugar de un jugador en la cancha | sigla, nombre, línea, lado, orden | Catálogo fijo (`FR-001`)"*. §10.1.1 `PUESTO` block: `{ string sigla PK; string nombre; string lado }` — no `orden` field.
- **Confidence:** High
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Add `int orden` to the `PUESTO` attribute block in the `erDiagram`.

#### 5. No scenario variant in §9 uses the `[concurrency]` tag

- **Dimension:** Methodology-invariants (`MD-22`)
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_SPEC.md` §9.1 (all scenarios)
- **What:** Across all 16 scenarios and their variants, every variant tag used is `[boundary]`, `[failure]`, or `[property]` — the closed four-tag set's `[concurrency]` member is never used. This isn't a methodology violation (using a subset of the closed set is allowed; only using tags *outside* the set is a violation), but it's worth naming since `data/players`/`data/playerScores` are shared Firestore documents an admin reclassifies and the engine reads.
- **Why it matters:** Two admins reclassifying the same player at the same time (last-write-wins on a shared document) is a plausible race this feature specifically introduces risk around (new required fields, precarga of old scores) that the current scenario set doesn't examine. It may well turn out to be genuinely out of scope (single-admin-in-practice groups), but that's a judgment call worth making explicitly rather than by omission.
- **Evidence:** Grep of §9.1 tags: `[boundary]` ×24, `[failure]` ×6, `[property]` ×6, `[concurrency]` ×0.
- **Confidence:** Low — may well be a legitimate non-goal for this feature's actual usage pattern (single admin per group).
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Either add a `[concurrency]` variant to `S-01` or `S-04` covering simultaneous admin edits, or note explicitly in §3.2 *Out of scope* (or an Assumption) that concurrent-admin-edit races are not addressed by this feature, so the omission reads as a decision rather than an oversight.

## Summary

- Blocking: 0
- Should fix: 3
- Suggestions: 2
- Methodology-invariants touched: `MD-03` (EARS one-obligation-per-line, finding 2), `MD-22` (Scenario-variant ID grammar / closed tag set, findings 2 and 5), `MD-24` (ER diagram completeness, finding 4), `MD-26` (Trust-but-verify marker form, finding 3)

Spot-verified and clean: all 13 rows of the *Declaración de reemplazo* table (citations into `002`, `003`, `003/data-model.md`, `011`, `ORDEN_JUGADORES_SPEC.md`, `CANCHA_SPEC.md`, `PARTIDO_FINALIZADO_SPEC.md`); 4 of 5 inline `index.html` citations in §4 (`TC-002`×2, `TC-030`, the `CWE-862` admin-only ruling); §9 *Variants* blocks (16/16 scenarios have either a populated block or an explicit `Variants: none` declaration — full `MD-22` compliance); §11.5 meta-ACs (`AC-50`–`AC-55`, full `MD-17` compliance); §10.1.1's `erDiagram` renders cleanly via `mermaid-cli` and is visually legible (8 entities, no overlapping labels).
