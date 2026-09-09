# Critique — ROL_EN_EL_TOKEN_CONCEPT.md (per-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** Claude Opus (exact version not recorded in the doc; reported by the user)
> **Date:** 2026-09-09
> **Inputs:** `docs/rol-en-el-token/ROL_EN_EL_TOKEN_CONCEPT.md`
> **Model relationship:** Different family, same provider (Opus author, Sonnet 5 critic) — the rubric's explicit example of the *acceptable middle tier*, not same-family. Proceeding without the self-equivalent caveat; provider-mix independence (Claude → non-Claude) was not available in this session.

## Verdict

**COMMENT** — no 🔴 Blocking findings. All mandatory sections, IDs, diagrams and grounding citations are present and internally correct; every internal `index.html`/`docs/007-*` citation I re-verified against the actual source lines checked out. The two 🟡 findings below are worth resolving before the Spec locks in D-06, but neither invalidates the chosen direction (D-01) or blocks drafting the Spec.

## Findings

### Per-doc — Accuracy

#### 1. D-06's "replace `rol()`" scope is grounded in a rules contract that is confirmed stale for one of the six admin-only documents

- **Dimension:** Accuracy
- **Where:** §2 Pain 2 (citing `docs/007-permisos-por-usuario/contracts/firestore-rules.md:27-38`) and §6 "Reemplazo declarado" (the `rol()` / contract bullet), feeding D-06.
- **What:** The claim "una lectura extra... una por cada documento sólo-admin" and D-06's plan to "reemplazar la función `rol()`" are grounded in the `007` contract file, but that file only has explicit `match` blocks for **5** of the **6** entries in `index.html`'s `DOCS_SOLO_ADMIN` array. `ordenJugadoresMigrado` was added later by the `orden-jugadores` feature (confirmed via `docs/orden-jugadores/ORDEN_JUGADORES_IMPLEMENTATION_PLAN.md`), and I found no committed doc anywhere in the repo (grepped `rol()` across `docs/`) that records a Firestore rule for it. Since rules are configured only in the Firebase Console (per the same contract file's own "Dónde se configura" section) and never versioned, there is no committed source establishing what the *current* rule for that 6th document actually is.
- **Why it matters:** D-06 tells the Spec author to rewrite every `rol()` call to read `request.auth.token.rol` instead. If the author works only from the cited (incomplete) contract, they will correctly rewrite 5 rules and may never learn there's a 6th one live in the Console that needs the same treatment — or, worse, discover that document was never rule-gated at all, which would be a live security gap unrelated to this feature but relevant to its "seis lecturas extra" accounting.
- **Evidence:** `DOCS_SOLO_ADMIN` at `index.html:1855-1857` lists 6 keys; `docs/007-permisos-por-usuario/contracts/firestore-rules.md` (lines 27-38 region) has `match` blocks for `players`, `playerScores`, `partidos`, `partidosArmado`, `motorConfig`, `statsGanadosEmpatadosPerdidosMigrado`, `puntajeArmadoSeparadoMigrado` — no `ordenJugadoresMigrado` block, and `grep -rln "rol()" docs/` returns only the `007` contract and this Concept Note itself.
- **Confidence:** High (the file-level fact is directly verifiable; the live-Console rule content is the part that's genuinely unknown, which is exactly the gap being flagged).
- **Severity:** 🟡 Should fix
- **Suggested fix:** Add an Open Question (`OPEN-Q-06`, target: Spec) instructing whoever writes the Spec to pull the **live** rules from both Firebase Console projects (prod + staging) as the authoritative current state — not solely `docs/007-.../contracts/firestore-rules.md` — before drafting the replacement for `rol()`. One line in §11 Risks would also work if you'd rather not add a 6th open question.

#### 2. §7.1's Gmail/Notion/Linear skeleton-loading claim is asserted without a citation, unlike the rest of the document

- **Dimension:** Accuracy
- **Where:** §7.1 "How established products handle this", second paragraph.
- **What:** "El otro patrón que se ve en productos grandes es no mostrar nada definitivo hasta saber quién sos: el esqueleto gris de Gmail, Notion o Linear" is stated as fact with no URL, screenshot, or repo citation — a departure from the document's otherwise strict discipline (every other vendor/behavior claim in §6.5/§7 carries a link and a "verificado el 2026-09-09" note).
- **Why it matters:** It's low-stakes (the claim is common, easily-observable UX behavior, and doesn't drive any `D-*`), but the guidance this document is itself written under (concept-note-guidance §7.1: "cite specifically — vague industry trends invite hallucination") and MD-26 both ask for exactly this kind of claim to be either sourced or flagged.
- **Evidence:** No link accompanies the Gmail/Notion/Linear sentence, contrasted with every bullet in §6.5's "Industry-standard evidence" which all carry URLs + verification dates.
- **Confidence:** Medium (this is the kind of claim a reasonable author might consider "common knowledge" not requiring a citation; reasonable people could disagree on whether it needs one).
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Either drop a link (a blog post or product screenshot showing the skeleton pattern) or soften to `[INFERRED — common, unverified UX observation]`.

### Per-doc — Consistency

#### 3. The "Reversibility" column in §10 mixes two different meanings

- **Dimension:** Consistency
- **Where:** §10 Key decisions table — compare `D-01`/`D-06` (Hard) against `D-04`/`D-07` (One-way).
- **What:** For `D-01` ("revert the custom-claims architecture") and `D-06` ("republish rules in two projects"), *Hard* correctly measures the cost of undoing **the decision itself** — expensive but technically possible. For `D-04` ("never version the service-account key") and `D-07` ("keep fail-closed"), *One-way* actually describes the irreversibility of a **hypothetical violation's consequence** (a leaked key can't be un-leaked; a wrongly-granted admin session already did damage) — not the reversibility of the policy stated in the Decision column. Both policies are themselves trivially easy to reverse as *decisions* (you could, technically, start committing the key tomorrow, or flip fail-closed to fail-open with a one-line change) — that's exactly why they're invariants worth calling out, but it's a different axis than what "Hard" measures two rows up.
- **Why it matters:** A reader scanning the column for "which decisions are costly to walk back" gets two different signals under the same header, which weakens the column's usefulness as a quick scan and could make a Spec/Plan author misjudge how much scrutiny a *future* proposal to relax `D-04`/`D-07` deserves (the risk is about consequence severity, not decision cost).
- **Evidence:** `D-01` Rationale: "Revierte `research.md` #1..." / Reversibility: Hard. `D-04` Rationale: "...filtrarla es el peor escenario... y no tiene vuelta atrás" / Reversibility: One-way. Same word ("vuelta atrás" / "One-way") applied to a different referent (the leak event, not the no-commit policy).
- **Confidence:** Medium (defensible reading either way, but the drift is real and appears twice, not once).
- **Severity:** 🟡 Should fix
- **Suggested fix:** Either add a one-line legend clarifying "Reversibility = cost to undo this decision, not severity if violated," or reclassify `D-04`/`D-07` as `Easy` (the policy is easy to reverse) and move the "no going back" framing entirely into the Rationale/Risks columns where it already lives in prose.

#### 4. §4 non-goal and §14 deferred item overlap on the same topic without cross-referencing each other

- **Dimension:** Consistency
- **Where:** §4 Non-goals, bullet 1 ("No se construye una pantalla de registro...") vs §14 Out of scope/deferred, bullet 1 ("Registro de usuarios / pantalla de gestión de cuentas").
- **What:** Both bullets describe the same feature idea (a registration/account-management screen) and both point to the same `Roadmap.md` entry. They're not contradictory — §4 correctly scopes "this feature won't build it" while §14 tracks the broader roadmap item's deferred status — but neither bullet cross-references the other, so a reader has to notice on their own that they're two facets of the same idea rather than two separate scope decisions.
- **Why it matters:** Minor, but it's exactly the ambiguity the rubric's §4-vs-§14 disjointness check exists to catch on a first read; a reviewer skimming quickly could misread it as accidental duplication.
- **Evidence:** §4: "Esa idea vive en `Roadmap.md` → 'Cuentas y acceso' y sigue ahí." §14: "vive en `Roadmap.md` → 'Cuentas y acceso'." Same roadmap pointer, no `(ver §14)` / `(ver §4)` cross-link.
- **Confidence:** Low-Medium (this reads as intentional given the rest of the document's precision, but the cross-link is genuinely missing).
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Add `(ver §14)` to the §4 bullet, or merge the roadmap pointer into one bullet with the other referencing it by ID.

### Per-doc — Completeness
None ✓ — every template section is populated (no `{{...}}`/TODO placeholders); §6.5's three sub-lists are all populated with citations and "what this pinned" notes; §16 Handoff quotes all five non-goals verbatim and lists every settled `D-*`/decide-in-`OPEN-Q-*` correctly split between Spec and Plan targets; §11 Risks has no blank mitigation cells.

### Per-doc — Clarity
None ✓ — no compound decisions, no vague qualitative targets standing in for numbers, no ID re-used or renumbered. `D-01`–`D-12` and `OPEN-Q-01`–`05` are contiguous and correctly zero-padded.

### Per-doc — Methodology-invariants
None ✓ — checked against all rows in rubric §5.0 and §5.1:
- **MD-05** stable IDs: compliant.
- **MD-24** diagrams: §5.1 `C4Context` correctly required (≥2 external system boundaries: Firebase Auth + Cloud Firestore) and present, 6 elements (≤15); §9.4 correctly omitted (the 5 alternatives don't share a genuine decision tree).
- **MD-25** grounding evidence: §6.5 present with all three sub-lists populated and cited; spot-checked 6 `index.html` line citations and both `007-permisos-por-usuario` quotes (`FR-016`, `research.md` #1) against the actual files — all accurate in substance (line numbers occasionally off by 1-3, content always matches).
- **MD-26** trust-but-verify: the one genuinely unverifiable claim (the Mermaid diagram's render) carries a correctly-reasoned `[UNVERIFIED]` marker and is cited in §16 Handoff as required. I independently reproduced the same Mermaid-CLI/Chrome-headless-shell failure in this environment, confirming the disclosed reason is real, not a placeholder excuse.
- **MD-31** security posture: §5.2 present with all three required lines and an explicit CWE-category pointer to the future Spec §4.5.

## Summary

- Blocking: 0
- Should fix: 2
- Suggestions: 2
- Methodology-invariants violated: none
