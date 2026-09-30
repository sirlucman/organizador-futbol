# Critique — DESGLOSE_POSICIONES_CONCEPT.md (per-doc)

> **Critic model:** claude-sonnet-5
> **Author model:** claude-opus-5-5 (per the doc's own Change log, §18)
> **Date:** 2026-09-30
> **Inputs:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md`
> **Mode:** Step 5 self-critique pass, run at the author's explicit request ("hacé la autocrítica"). Note: the critic model differs from the author model recorded in §18 — this is not the same-model configuration Step 5 assumes by design, but it was not run as a gated Step 7 independent critique either (no Step 7.0 model-independence confirmation was asked). Treat the cross-model angle as a bonus, not as satisfying Step 7.

## Verdict

**CHANGES REQUESTED** — one 🔴 Blocking finding (a genuine contradiction between §4 Non-goals and §14 Out of scope over whether choosing the formation per match is permanently ruled out or merely deferred). The rest of the document is unusually well-grounded: every codebase citation checked (18 line-range citations across `index.html` and 3 `Roadmap.md` line citations) resolved to real, matching content, decision IDs are complete and non-overlapping, and §6.5 *Sources & Origins* is populated to the letter of MD-25. Fix the one blocking item and the two 🟡s before moving to the Spec.

## Findings

### Per-doc — Accuracy

None ✓ — spot-checked 18 `index.html` line-range citations (§2 Pain 1–3; §6.5 all codebase-evidence bullets) and all 3 `Roadmap.md` line citations (`:18`, `:46`, `:74`); every one resolves to the content the doc claims. No fabricated citations, no invented external facts.

### Per-doc — Consistency

#### 1. §4 Non-goals and §14 Out of scope contradict each other on "elegir la formación por partido"

- **Dimension:** Consistency
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` §4 (line 67-68) and §14 (line 458-460)
- **What:** §4 declares, as a permanent non-goal, "No se agregan formaciones nuevas ni se deja elegir la formación por partido: Fútbol 8 sigue siendo 3-3-1 y Fútbol 9 sigue siendo 3-4-1." §14 lists the same capability — "Elegir la formación por partido (p. ej. 4-3-1 en Fútbol 9)" — as *deferred*, "until el grupo pida jugar con otra formación," i.e. something that could still happen later.
- **Why it matters:** A reader of §4 alone would conclude per-match formation choice is off the table for good. A reader of §14 alone would conclude it's just not scheduled yet. The Spec inherits this ambiguity: `Roadmap.md:74` stays alive as a pending idea (per §14's own text, "no se retira de ahí") while §4 simultaneously tells the Spec author to treat it as permanently closed. This is exactly the failure mode the methodology names explicitly for Concept Notes: §4 is for *permanent* non-goals, §14 is for *deferred* items, and the two must stay distinct — not describe the same capability with opposite futures.
- **Evidence:** §4: *"No se agregan formaciones nuevas ni se deja elegir la formación por partido: Fútbol 8 sigue siendo 3-3-1 y Fútbol 9 sigue siendo 3-4-1."* §14: *"Elegir la formación por partido (p. ej. 4-3-1 en Fútbol 9). — deferred until el grupo pida jugar con otra formación. Es la idea de Roadmap.md:74 y no se retira de ahí."*
- **Confidence:** High
- **Severity:** 🔴 Blocking
- **Suggested fix:** Pick one framing. If "no per-match formation choice, ever, in this feature's scope" is the intent, drop the §14 entry (it belongs to a future feature's Concept Note, not this one's deferred list) or reword it to "not addressed by this feature — see `Roadmap.md:74` for the standing idea" without implying this Concept Note is the thing deferring it. If the real intent is "not now, revisit if the group asks," reword §4 to something like "Esta versión no deja elegir la formación por partido; Fútbol 8 y Fútbol 9 mantienen 3-3-1 y 3-4-1 fijos" — dropping the "ni se deja" absolute phrasing — and let §14 carry the deferral. §16 Handoff's "Must remain non-goals" bullet quotes §4 verbatim, so whichever wording is chosen there must be updated too.

### Per-doc — Completeness

None ✓ — every template section (1–18) is populated; §6.5's three MD-25 sub-lists (Codebase / Industry-standard / Prior-art) are all populated with citations and "what this pinned" notes, including an honest declaration where prior-art on peer products wasn't researched (§7.1, cross-linked from §6.5).

### Per-doc — Clarity

None ✓ — decisions are single-clause and atomic; the §9 alternatives all state a concrete reason for rejection; no vague adjectives standing in for a testable target.

#### 2. §5 Vision spans three narrative beats instead of one paragraph

- **Dimension:** Clarity
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` §5 (lines 78-95)
- **What:** The Concept Note template's §5 is meant to be one PRFAQ-style paragraph of user-visible value. This draft's §5 is three paragraphs — reclassifying a player, generating Thursday's match, and viewing an old match — each a separate beat.
- **Why it matters:** Not wrong content (all three beats are useful and grounded), but it drifts the section from "single illustrative moment" toward "mini walkthrough," which is a shape a downstream reader (or a future critic checking this exact rubric row) will flag as a structural deviation even though nothing here is inaccurate.
- **Evidence:** Three distinct paragraphs, each anchored to a different day/actor moment (admin reclassifying → Thursday generation → viewing last month's matches).
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Either keep as-is (the three-beat walkthrough arguably serves the feature better than a single paragraph could, since D-08/D-09's blocking behavior is central to the pitch and needs its own beat) or split into "primary vision paragraph" + a short "illustrative walkthrough" sub-block so the section still opens with the one-paragraph shape the invariant expects.

#### 3. F9 mediocampo order stated two different ways with no note that they're different orderings

- **Dimension:** Clarity
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` §1 (line 17-18) / D-03 (line 406) vs §8.1 "Cancha" (line 310)
- **What:** §1 and D-03 give the F9 midfield as "MD, MC, MC, MI" (formation/data order). §8.1's Cancha paragraph gives it as "MI, MC, MC, MD" (presumably left-to-right pitch-drawing order, consistent with D-12's "izquierdo a la izquierda... derecho a la derecha"). Nothing in the doc says these are two different orderings of the same four players for two different purposes.
- **Why it matters:** A reader skimming both lines without context could read this as an inconsistency in the roster itself rather than two valid views (list order vs. visual order) of the same four positions — small but avoidable confusion for whoever writes the Spec's §9 scenarios or the cancha's rendering rule.
- **Evidence:** §1: *"Fútbol 9 suma un segundo MC (3-4-1)"* + D-03: *"F9 (3-4-1) = ARQ, LD, DC, LI, MD, MC, MC, MI, DEL"*. §8.1: *"En F9 el mediocampo queda MI, MC, MC, MD."*
- **Confidence:** Medium
- **Severity:** 🔵 Suggestion
- **Suggested fix:** Add a one-clause note in §8.1 next to the pitch-order line, e.g. "…queda MI, MC, MC, MD (orden de dibujo izquierda→derecha; el orden de formación en D-03 es MD, MC, MC, MI)."

### Per-doc — Methodology-invariants

#### 4. Both `[UNVERIFIED]` markers are missing from §16 Handoff to the Spec

- **Dimension:** Methodology-invariants (`MD-26`)
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` §6.5 (line 194-199), §7.2 (line 255-257), and §16 (line 478-499)
- **What:** The doc carries two `[UNVERIFIED]` markers — (a) §6.5's claim that several named functions all need to read old positions as their line, flagged `[UNVERIFIED — reportado por un barrido del código; se verifica línea por línea en el Plan]`; (b) §7.2's WCAG 1.4.1 citation, flagged `[UNVERIFIED — citado de memoria; verificar contra la página del W3C en la Spec]`. Per the rubric, every `[UNVERIFIED]` marker must also be cited in the handoff-adjacent slot (here, §16) so the downstream stage inherits the verification debt explicitly. §16 currently has no line surfacing either one.
- **Why it matters:** Without an explicit pointer, the person picking up the Spec has to re-scan the whole Concept Note to notice these two open verification debts instead of finding them listed where the methodology says they should land. The `barrido del código` one in particular is the more consequential of the two — it underlies the claim that a whole cluster of panel functions needs rework, and D-10's risk mitigation in §11 leans on it.
- **Evidence:** §16 lists "Settled," "Decide in Spec" (`OPEN-Q-01`–`08`), "Must remain non-goals," "Explicabilidad," and "Responsive" — no `[UNVERIFIED]` line.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** Add a line to §16, e.g. "**Unverified claims carried forward:** the code-sweep claim that `faltantesDeFormacionVigente`, `celdasDiferenciaPorLinea`, `repartoDivergeDeLaGeneracion` and `valorDePuntaje` all need per-line rework (§6.5) needs a line-by-line check in the Spec/Plan; the WCAG 1.4.1 citation (§7.2) needs verification against the W3C page before the Spec's §4.5 cites it as a `TC-*`."

#### 5. WCAG citation has no URL/DOI anchor

- **Dimension:** Methodology-invariants (`MD-25` §6.5 citation-anchor rule)
- **Where:** `docs/desglose-posiciones/DESGLOSE_POSICIONES_CONCEPT.md` §6.5 "Industry-standard evidence" (line 211-213) and §7.2 (line 255-257)
- **What:** The WCAG 2.1 AA, criterion 1.4.1 citation is a bare standard name + criterion number with no URL to the W3C page — the rubric requires every citation to be a repo-rooted path or a URL/DOI/standard-clause anchor; a bare name without an anchor is flagged separately from (and in addition to) the fact that it's also tagged `[UNVERIFIED]`.
- **Why it matters:** The `[UNVERIFIED]` tag discloses that the citation wasn't checked against a primary source; that's honest and appropriate (not a fabrication). But the citation-form gap is independent — even once verified, the doc should carry the actual W3C URL so the Spec can cite it directly instead of re-deriving it.
- **Evidence:** *"WCAG 2.1, criterio 1.4.1 Use of Color — el color no puede ser el único medio para distinguir información; aplica a D-11. [UNVERIFIED — citado de memoria; verificar contra la página del W3C en la Spec]"* — no URL given.
- **Confidence:** High
- **Severity:** 🟡 Should fix
- **Suggested fix:** When resolving the `[UNVERIFIED]` tag (finding 4's fix), add the actual URL (`https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html` or equivalent, verified against the live page) to both §6.5 and §7.2.

## Summary

- Blocking: 1
- Should fix: 2
- Suggestions: 2
- Methodology-invariants violated: `MD-25`/§5.1-citation-anchor rule (finding 5), `MD-26` (finding 4). Finding 1 (Non-goals/Out-of-scope contradiction) is a Concept-Note-specific structural invariant (rubric §5.1 row "§4 Non-goals vs §14 Out of scope") rather than an `MD-*`-numbered rule.
