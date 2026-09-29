# Intercambiar colores — Spec conformance

> **Audited:** Spec (authoritative) against the code at the pinned SHA below
> **Date:** 2026-09-29 · **Run:** 1 (first run — no carry-forward, no control sample) · **Requested by:** Lucas Manoukian

| Side | What | Pinned at |
|---|---|---|
| Spec | `docs/intercambiar-colores/INTERCAMBIAR_COLORES_SPEC.md` | `490ff4a` 2026-09-29 · Status: Draft · Change log: 2026-09-29 — Lucas Manoukian (claude-sonnet-5): corregidos los 4 hallazgos de la crítica |
| Implementation Plan | `docs/intercambiar-colores/INTERCAMBIAR_COLORES_IMPLEMENTATION_PLAN.md` | `1f1f136` 2026-09-29 · Status: Draft · Change log: 2026-09-29 — Lucas Manoukian (claude-opus-5-5): cambios durante la implementación, A-01 verificado a mano, OPEN-Q-06 |
| Concept Note | `docs/intercambiar-colores/INTERCAMBIAR_COLORES_CONCEPT.md` | `490ff4a` 2026-09-29 · Status: read selectively (§10, §14, §15) · Change log: n/a |
| Code | `organizador-futbol (local, == origin/main)` @ `main` | `d9296f8` (clean; only untracked archives outside the frontier) |

**Denominator:** 100 obligations — every `FR-*` (31), `NFR-*` (4), `TC-*` (10), `S-*` (35) and `AC-*` (20) the Spec *defines*, held against the code regardless of build state. IDs the Spec only cites from other features' documents are excluded.

**Test binding:** variant-a (colores/<ID> in string literals, Plan §5); test side scoped to tests/colores.test.js, tests/layout.test.js (scoped by the colores/ prefix).

**Reverse-sweep frontier:** index.html (the feature's five hunks plus the functions they call: saveMatches, renderZonaEquipos, renderEncabezadoTarjeta, explicacionesDelArmado, __generarEquipos); `tests/colores.test.js`; `tests/layout.test.js`; `tests/fixtures-app.js`; `tests/README.md`; `AGENTS.md`; `docs/equipos-en-el-campo/rebanada-3-panel-armado/PANEL_ARMADO_SPEC.md`.

## Summary

92 IMPLEMENTED · 2 PARTIAL · 0 ABSENT · 0 DIVERGENT · 6 UNVERIFIABLE
7 UNSPECIFIED-BEHAVIOUR findings · 24 Spec-quality findings · 10 rows with an alternate reading

## Conformance by requirement

### Functional requirements (§7)

| ID | Verdict | Evidence | Test | Planned in |
|---|---|---|---|---|
| FR-001 | IMPLEMENTED | index.html:5303 + :5895-5899 — sePuedenIntercambiarColores (admin, equipos, !inscripcionCerrada, !Finalizado) gates an icon-only button in renderEncabezadoTarjeta | tests/layout.test.js:2011-2029 (colores-encabezado), :2263 (S-20d) | Branch 2 |
| FR-002 | IMPLEMENTED | index.html:5303 — !m.inscripcionCerrada is a conjunct of the only condition that draws the button | tests/layout.test.js:2224 (m-cerrado) — asserts no button | Branch 2 |
| FR-003 | IMPLEMENTED | index.html:5303 — estado !== 'Finalizado'; result-edit (index.html:4344-4358) never changes estado<br>Test enters edit mode but does not confirm it is on screen. | tests/layout.test.js:2225-2226 (S-20a, S-20b) | Branch 2 |
| FR-004 | IMPLEMENTED | index.html:5303 — first conjunct isAdmin() (index.html:1483); missing/unknown role resolves fail-closed to jugador | tests/layout.test.js:2236-2251 (colores-jugador) | Branch 2 |
| FR-005 | IMPLEMENTED | index.html:5312-5314 — handler returns on !sePuedenIntercambiarColores before any mutation, flip, save or render<br>Test checks persistence and DOM, not in-memory matches; code rules the gap out. | tests/layout.test.js:2242-2253 — zero writes, DOM unchanged | Branch 2 |
| FR-006 | IMPLEMENTED | index.html:5303, :5313-5314 — same guard rejects no-equipos, cerrada, Finalizado and unknown matchId | tests/layout.test.js:2208-2227 — direct invocation, no writes, docs unchanged | Branch 2 |
| FR-010 | IMPLEMENTED | index.html:5898 → :5312-5319 → :5180 — button calls handler, which swaps eq.blanco/eq.negro | tests/colores.test.js:132-145; tests/layout.test.js:2044-2073 (real click) | Branch 2 |
| FR-011 | IMPLEMENTED | index.html:5169-5175 — arrays moved by reference between keys, never rebuilt or sorted | tests/colores.test.js:137-138, :152-153 (exact array equality) | Branch 2 |
| FR-011b | IMPLEMENTED | index.html:5180 — whole lists change keys; dupla members move with their list | tests/colores.test.js:147-157 (S-01a, real motor), :194-205 (S-01e) | Branch 2 |
| FR-012 | IMPLEMENTED | index.html:5181 — intercambiarClaves(eq,'sumaBlanco','sumaNegro') | tests/colores.test.js:139 | Branch 2 |
| FR-013 | IMPLEMENTED | index.html:5182-5187 — every non-null balanceLineas line swaps blanco/negro, guarded by if(eq.balanceLineas)<br>Code also negates each line's `diferencia` (index.html:5185, Plan TD-03), which FR-013 does not name — see FR-017. | tests/colores.test.js:140-142 | Branch 2 |
| FR-014 | IMPLEMENTED | index.html:5188 — intercambiarClaves(eq.formacion,'blanco','negro'); objetivo untouched | tests/colores.test.js:143-144 | Branch 2 |
| FR-015 | IMPLEMENTED | index.html:5189-5191 — equipoCompensado flips only when 'blanco'/'negro'; null stays null | tests/colores.test.js:180-192 | Branch 2 |
| FR-016 | IMPLEMENTED | index.html:5176-5192 — no write to posicionAsignada, posicionOverride, swaps, bloqueados, convocados or resultado | tests/colores.test.js:219-240 | Branch 2 |
| FR-017 | IMPLEMENTED | index.html:5176-5192 — no write to estrategia, snapshots, configHash, cambios, esPrimeraGeneracion, arqueros excedentes/por secundaria, enumeracionTruncada<br>Narrow reading: the Glossary counts each whole balanceLineas line as color-indexed.<br>**Alternate reading → DIVERGENT:** `diferencia` inside each balanceLineas line is 'otro campo de la generación' (FR-013 names only blanco/negro) — index.html:5185 negates `diferencia` on every swap | tests/colores.test.js:226-240 over real-motor matches | Branch 2 |
| FR-018 | IMPLEMENTED | index.html:5169-5192 — every operation is self-inverse (key swap, sign negation, two-value toggle); `diferencia` written as 0, never -0<br>Narrow reading: identical as persisted / JSON.<br>**Alternate reading → DIVERGENT:** 'idéntico' as strict in-memory identity (Object.is), the standard the code comment at index.html:5165 claims — motor can yield diferencia === -0 (index.html:3466); first swap writes 0, so a fresh in-memory match does not return Object.is-identical; JSON copy in the test hides it | tests/colores.test.js:159-167 deepStrictEqual after two swaps (input is a JSON copy) | Branch 2 |
| FR-019 | IMPLEMENTED | index.html:5312-5319 — no confirm dialog between click and save | tests/layout.test.js:2053-2061 | Branch 2 |
| FR-020 | IMPLEMENTED | index.html:5317 — saveMatches() in the same tick; writes partidos (:2177) then partidosArmado (:2182) | tests/layout.test.js:2067-2072 — writes exactly partidos,partidosArmado | Branch 2 |
| FR-021 | IMPLEMENTED | index.html:5318 — renderMatchesTab() right after the in-memory inversion | tests/layout.test.js:2059-2062 — shirt sets swap in the DOM | Branch 2 |
| FR-030 | IMPLEMENTED | index.html:6207-6212, :5427 — panel labels paired with eq.blanco/eq.negro; totals recomputed from current list; shirt class from team argument | tests/layout.test.js:2039 — asserts shirt sets; not names or totals | Branch 2 |
| FR-031 | IMPLEMENTED | index.html:5513-5535 — repartoDivergeDeLaGeneracion compares against fields that invertirColoresDelPartido swaps together | tests/colores.test.js:284 (colores/S-02) on real functions | Branch 2 |
| FR-032 | IMPLEMENTED | index.html:5401, :5555, :5677, :5700, :5742-5749, :5769-5790, :5808 — pill, per-line breakdown and every team-naming sentence read from data<br>No test asserts the 'Por qué quedaron así' sentences after a swap; that clause rests on reading. | tests/colores.test.js:284, :313 — pill and breakdown only | Branch 2 |
| FR-033 | IMPLEMENTED | index.html:1797-1816 — formatearFormacionParaCopiar puts *Blanco* over m.equipos.blanco and *Negro* over m.equipos.negro | tests/layout.test.js:2105 (colores-copiar) — real clipboard | Branch 2 |
| FR-034 | IMPLEMENTED | index.html:5312-5319 — no toast or message; git grep for 'intercambiad\|se intercambiaron' finds nothing<br>Satisfied by reading; untested. | none asserts the absence | Branch 2 |
| FR-035 | IMPLEMENTED | index.html:5316 + :5073-5076 + :5081 — in one column the visible tab flips so the same players stay in view; state is a module variable (:4987) never persisted<br>Code also flips at two columns (Plan TD-06) — outside this clause's subject; see S-04b. | tests/layout.test.js:2136 (colores-pestana, 360 px) | Branch 2 |
| FR-036 | IMPLEMENTED | index.html:2159-2177, :1990, :6116-6117 — swapped lists go to the public doc; a jugador session loading it draws them by color<br>Narrow reading: a session that loads after the save.<br>**Alternate reading → PARTIAL:** includes a jugador whose session was already open and navigates into the match — data loaded only at login (index.html:7665); __openMatch (:6586) does not re-read; no live sync, so old colors show until reload | none — no test opens a swapped match as jugador | Branch 2 |
| FR-040 | IMPLEMENTED | index.html:5856 + CSS :797-801 — second path is Lucide 0.544.0 shirt byte-for-byte; first path is the right half closed on x=12; path.relleno filled with currentColor<br>Geometry settled by reading coordinates; the look at 16 px needs a human eye. | tests/layout.test.js:2032-2034 — fill path exists and equals button color | Branch 2 |
| FR-041 | IMPLEMENTED | index.html:5897 — aria-label and title 'Intercambiar colores' | tests/layout.test.js:2028-2029 | Branch 2 |
| FR-042 | IMPLEMENTED | index.html:5895-5911 — pushed before Copiar; Regenerar last | tests/layout.test.js:2027, :1022 (panel-armado) | Branch 2 |
| FR-043 | IMPLEMENTED | index.html:799-800 — same color var(--muted)/hover var(--ink) as Copiar; only Regenerar has stroke var(--pitch) (:807)<br>'Mismo peso visual' is unquantified; a half-filled glyph carries more ink. | tests/layout.test.js:2031 — computed color equals Copiar | Branch 2 |
| FR-050 | IMPLEMENTED | index.html:4209-4216, :2788-2792 — __generarEquipos rebuilds prevTeamOf from the swapped lists; strategies pin blocked players to it | tests/colores.test.js:332-342 — real motor; prevTeamOf built by hand as a copy of :4211-4212 | Branch 2 |

### Non-functional requirements (§8)

| ID | Verdict | Evidence | Test | Planned in |
|---|---|---|---|---|
| NFR-001 | UNVERIFIABLE | tests/layout.test.js:2053-2063 — performance.now() click → next rAF, fails over 150 ms<br>Even running the bound test would not settle it: the NFR fixes 18 titulares. Settle by running the same measurement on m-nueve (Fútbol 9, 18 titulares, tests/fixtures-app.js:243) with LAYOUT_STRICT=1 node tests/layout.test.js. | tests/layout.test.js:2045 — runs on m-abierto, Fútbol 8, 16 titulares (tests/fixtures-app.js:55, :212) | Branch 2 |
| NFR-002 | IMPLEMENTED | index.html:781, :786 — .panel-header flex-wrap and margin-left:auto; icons wrap to their own row at 360 px<br>Breakpoints 390 and 900 are not measured at the adjacent outside pixel. Settle with LAYOUT_STRICT=1 node tests/layout.test.js --solo=colores-encabezado. | tests/layout.test.js:2011 (colores-encabezado, all 17 ANCHOS) + MEDIR :2307-2324 — read, not run | Branch 2 |
| NFR-003 | IMPLEMENTED | index.html:792 — .panel-icono 44×44; non-empty aria-label at :5897 | tests/layout.test.js:268-280 INVARIANTE_PANEL, wired at :2017 — read, not run | Branch 2 |
| NFR-004 | IMPLEMENTED | index.html:5176-5192 — every write lands inside the seven named equipos.* fields; intercambiarClaves deletes rather than creates missing keys<br>Narrow reading: 'escritos' = fields whose value the swap changes; in practice a subset of the seven changes.<br>**Alternate reading → DIVERGENT:** literal 'campos escritos': saveMatches rewrites both whole documents — index.html:2160-2184 serialises every match on every save (pre-existing path required by FR-020/TC-001) | tests/colores.test.js:226-240 — changed keys ⊆ the seven, no key gained (top level and m.equipos only) | Branch 2 |

### Constraints (§4)

| ID | Verdict | Evidence | Test | Planned in |
|---|---|---|---|---|
| TC-001 | IMPLEMENTED | index.html:5317 — the feature's only persistence call is saveMatches(), which uses window.storage.set (:1396-1402); swept the whole feature diff: no other storage/db/firebase call<br>Unenforced: nothing mechanical checks it. | n/a — constraint | Branch 2 |
| TC-002 | IMPLEMENTED | index.html:5856 — inline SVG beside ICON_COPIAR/ICON_REGENERAR; feature diff adds no <script src>, manifest or lockfile | n/a — constraint | Branch 2 |
| TC-010 | IMPLEMENTED | git diff 907b3ae e7b435e -- index.html — 79 insertions, 0 deletions in 5 hunks; none inside a motor function<br>Holds by diff; unenforced. | n/a — diff review | Branch 2 |
| TC-011 | IMPLEMENTED | index.html:5895-5899, :5913-5914 — button pushed into the existing botones array of renderEncabezadoTarjeta with class panel-icono; no new container | tests/layout.test.js:2021-2022 | Branch 2 |
| TC-012 | IMPLEMENTED | index.html:5312-5319 — only extra state is equipoVisibleCancha, a module variable (:4987) that saveMatches does not serialise | tests/colores.test.js:231-232; tests/layout.test.js:2083-2084 | Branch 2 |
| TC-030 | IMPLEMENTED | index.html:797-801 — new CSS uses only var(--muted), var(--ink), currentColor, none; shirt glyph listed in .claude/skills/football-app-design/guidelines/iconography.card.html:6<br>Swept every new CSS rule and SVG attribute. Pre-existing (not this feature): .panel-icono's transition is a literal, not the handoff's token. | tests/layout.test.js:2031, :2034 | Branch 2 |
| TC-031 | IMPLEMENTED | tests/layout.test.js:2016, :2044, :2106, :2138, :2181, :2203, :2237 and tests/colores.test.js:132-344 — every declared binding carries colores/<ID> in a string literal; no comment-only binding<br>Narrow reading: the IDs a test declares it satisfies.<br>**Alternate reading → DIVERGENT:** every test that verifies any FR/NFR/TC of this Spec — layout scenarios cite FR-042, FR-040, TC-030, TC-041, TC-040 as unprefixed strings (e.g. tests/layout.test.js:2027, :2034); git grep 'colores/FR\|colores/TC' finds nothing | Phase 2 gate T-N.D8/D9 | Branch 2 |
| TC-032 | UNVERIFIABLE | tests/layout.test.js:2011 — the three-button scenario exists (clause 1 satisfied)<br>Clause 2 ('se verá fallar') rests only on claims: the d8742d4 commit body and ticked T-2.5. Test and button landed in the same commit, Plan §7.3.7 'salida pegada en el PR' is unticked and there was no PR. Settle by running colores-encabezado against index.html from 7eae28b and confirming it fails. | colores-encabezado — would fail without the button (:2022) | Branch 2 |
| TC-040 | IMPLEMENTED | index.html:5313-5314 — role and state check inside the handler before any mutation, same predicate as the draw decision (:5895), mirrors aplicarDrop (:5229-5231) | tests/layout.test.js:2208-2227, :2242-2253 | Branch 2 |
| TC-041 | IMPLEMENTED | index.html:2159, :2168-2173 — CAMPOS_EQUIPOS_ARMADO strips the five inverted armado fields from the public doc into partidosArmado; saveMatches is the only writer | tests/layout.test.js:2076-2079 | Branch 2 |

### Scenarios (§9)

| ID | Verdict | Evidence | Test | Planned in |
|---|---|---|---|---|
| S-01 | IMPLEMENTED | index.html:5180-5188, :5317-5318 — lists, sums, lines, formación swapped; saved and repainted with no confirm<br>Given names 'Formación fija pareja', a label that no longer exists (now 'Formación fija', index.html:1509). | tests/colores.test.js:132-145, :226-240; tests/layout.test.js:2044-2073 | Branch 2 |
| S-01a | IMPLEMENTED | index.html:5180 — whole-group move | tests/colores.test.js:147-157 — property over 15 real-motor matches | Branch 2 |
| S-01b | IMPLEMENTED | index.html:5169-5192 — self-inverse operations<br>Narrow reading, as FR-018.<br>**Alternate reading → DIVERGENT:** strict Object.is identity — -0 from index.html:3466 comes back as 0; the test's JSON copy (:39, :76) hides it | tests/colores.test.js:159 — string-literal binding; deepStrictEqual after two swaps | Branch 2 |
| S-01c | IMPLEMENTED | index.html:5180 — lists swap wholesale, so the larger group changes color | tests/colores.test.js:169-178 — asserts sizes invert, not that the larger was Blanco | Branch 2 |
| S-01d | IMPLEMENTED | index.html:5189-5191 flips equipoCompensado; the goalkeeper sentence reads it (index.html:5742, :5749, :5751)<br>The sentence clause is checked only by proxy; no test renders the sentence. | tests/colores.test.js:180-192 — synthetic match | Branch 2 |
| S-01e | IMPLEMENTED | index.html:5180 | tests/colores.test.js:194-205 — 2 duplas, strategies 1, 2, 4 | Branch 2 |
| S-01f | IMPLEMENTED | index.html:5182, :5188 — guards leave null balanceLineas/formacion untouched | tests/colores.test.js:207-217 | Branch 2 |
| S-01g | IMPLEMENTED | index.html:5176-5192 — m.bloqueados untouched; blocked player now in the other list | tests/colores.test.js:219-224 | Branch 2 |
| S-01h | UNVERIFIABLE | index.html:5312-5319, :2160-2184 — in-memory state flips synchronously per tap; saveMatches not awaited, so the persisted end state depends on Firestore same-client write order (A-01)<br>Settle with Plan T-2.13 by a human: double-tap against staging, reload at once, compare data/partidos and data/partidosArmado. Plan record contradicts itself: T-2.13 ticked (Plan:351), the same check unticked in §7.3.7 (Plan:302). | tests/layout.test.js:2090-2102 — fake storage resolves in order synchronously; partidosArmado not checked after the double tap | Branch 2 |
| S-02 | IMPLEMENTED | index.html:5513, :5549, :5555 — receipt stays undivided; 'Diferencia N pts' is an absolute value; aFavorDe reads the inverted equipoCompensado<br>Clause 3 (nothing says colors were swapped) holds by reading, untested. | tests/colores.test.js:284 — clauses 1-2 on real functions | Branch 2 |
| S-02a | IMPLEMENTED | index.html:5513-5535 with :5174-5192 — divergence measured on fields swapped together; sentences read from data | tests/colores.test.js:296 — asserts it stays divided, not same content | Branch 2 |
| S-02b | IMPLEMENTED | index.html:5549 — 'Equipos parejos' on diferencia === 0, color-independent | tests/colores.test.js:304 | Branch 2 |
| S-02c | IMPLEMENTED | index.html:5401 — '+N Blanco/Negro' from balanceLineasVigente, recomputed from the swapped lists | tests/colores.test.js:313 | Branch 2 |
| S-03 | IMPLEMENTED | index.html:1797-1816 (as FR-033) | tests/layout.test.js:2105 — real clipboard | Branch 2 |
| S-04 | IMPLEMENTED | index.html:5316, :5035, :5081 — at 360 px the tab flips to Negro and shows the same list | tests/layout.test.js:2136 — compares names, not ids | Branch 2 |
| S-04a | IMPLEMENTED | index.html:5316 — the ternary flips negro→blanco | tests/layout.test.js:2166-2167 | Branch 2 |
| S-04b | IMPLEMENTED | index.html:5081 — above 1099 px both teams render regardless of equipoVisibleCancha<br>Narrow reading: two teams visible after the swap.<br>**Alternate reading → DIVERGENT:** 'no hay equipo visible que cambiar' = the state must not change — index.html:5316 flips at every width (Plan TD-06); the breakpoint listener repaints without reset (index.html:5014-5016), so narrowing after a wide swap lands on Negro | tests/layout.test.js:2140-2145 — two pitches at 1200, but no swap at that width | Branch 2 |
| S-04c | IMPLEMENTED | index.html:4987-4988 — in-memory let starting at 'blanco'; saveMatches serialises only matches | tests/layout.test.js:2169-2176 | Branch 2 |
| S-05 | IMPLEMENTED | index.html:5912-5914, :5897, :799, :5856 — pill then intercambiar, copiar, regenerar; name, color, glyph | tests/layout.test.js:2011 — does not assert the pill comes first | Branch 2 |
| S-05a | IMPLEMENTED | index.html:5912, :6203 — in one column the pill leaves the header | tests/layout.test.js:2011 + MEDIR :2413 — read, not run | Branch 2 |
| S-05b | IMPLEMENTED | same mechanism as NFR-002<br>390 and 900 lack an adjacent outside measurement. | tests/layout.test.js:45 ANCHOS (17 widths) — read, not run | Branch 2 |
| S-05c | IMPLEMENTED | index.html:792 | tests/layout.test.js:273-276 INVARIANTE_PANEL — read, not run | Branch 2 |
| S-06 | IMPLEMENTED | index.html:4209-4216 — regeneration reads the swapped lists into prevTeamOf | tests/colores.test.js:332-342 | Branch 2 |
| S-06a | IMPLEMENTED | index.html:4193-4273 — __generarEquipos has no swap-specific branch<br>Narrow reading: same code path.<br>**Alternate reading → UNVERIFIABLE:** same result as regenerating without a prior swap — strategy 4 tie-breaks on cambios against prevTeamOf (index.html:3565, :3583), so a post-swap regeneration tends to keep the swapped colors; settle with a node script comparing original vs swapped prevTeamOf | tests/colores.test.js:344-354 — only checks every starter placed and sizes within 1 | Branch 2 |
| S-07 | IMPLEMENTED | index.html:2177, :1990, :6116-6117, :6173, :5303 — public doc carries the swapped lists; jugador draws them and never sees the button<br>The jugador-side Then is exercised by no test. | tests/layout.test.js:2039-2103 — admin side only | Branch 2 |
| S-07a | IMPLEMENTED | index.html:5176-5192 (as NFR-004)<br>Narrow reading, as NFR-004.<br>**Alternate reading → DIVERGENT:** literal 'campos escritos' — saveMatches rewrites both whole documents (index.html:2160-2184) | tests/colores.test.js:226-240; tests/layout.test.js:2083-2084 (public doc only) | Branch 2 |
| S-07b | IMPLEMENTED | index.html:5178-5191, :2168-2173 — armado fields inverted in memory and routed to partidosArmado only | tests/layout.test.js:2072-2079 | Branch 2 |
| S-07c | IMPLEMENTED | index.html:2183 — saveMatches catch is console.error; the swap is already applied and painted; no feature-specific handling<br>'El error queda registrado' is not asserted by the test. | tests/layout.test.js:2180-2199 (escrituraFalla) — screen shows the swap, no page error | Branch 2 |
| S-20 | IMPLEMENTED | index.html:5303, :5313-5314 | tests/layout.test.js:2224 | Branch 2 |
| S-20a | IMPLEMENTED | index.html:5303 | tests/layout.test.js:2225 | Branch 2 |
| S-20b | IMPLEMENTED | index.html:4356 — edit mode keeps estado 'Finalizado' | tests/layout.test.js:2226 | Branch 2 |
| S-20c | IMPLEMENTED | index.html:5303; no-equipos path returns early without the header (:6100-6112) | tests/layout.test.js:2227 | Branch 2 |
| S-20d | IMPLEMENTED | index.html:4284 — __toggleInscripcion flips and re-renders; guard passes again | tests/layout.test.js:2229-2233 | Branch 2 |
| S-21 | IMPLEMENTED | index.html:5303, :6173 | tests/layout.test.js:2236-2251 | Branch 2 |
| S-21a | IMPLEMENTED | index.html:5313-5314 — returns before saveMatches for non-admin | tests/layout.test.js:2242-2253 | Branch 2 |

### Acceptance criteria (§11)

| ID | Verdict | Evidence | Test | Planned in |
|---|---|---|---|---|
| AC-01 | UNVERIFIABLE | aggregates every §9 scenario: 34 IMPLEMENTED, S-01h UNVERIFIABLE<br>Blocked only by S-01h; settles with the same staging double-tap check. | tests/colores.test.js + colores-* scenarios | Branch 2 |
| AC-02 | IMPLEMENTED | tests/colores.test.js:53, :100-102, :159-167 — ESTRATEGIAS_VIGENTES = [1, 2, 4] matches the catalog (index.html:1498-1513); S-01b property runs on the real motor<br>List is hard-coded, not derived from the catalog. | tests/colores.test.js:159 | Branch 2 |
| AC-10 | PARTIAL | tests/layout.test.js:2053-2063 — a performance.now() measurement in Chromium exists<br>Met: the named verification exists. Unmet: it measures 16 titulares, not NFR-001's 18, so it does not verify NFR-001. | tests/layout.test.js:2045 | Branch 2 |
| AC-11 | UNVERIFIABLE | aggregates NFR-002 (IMPLEMENTED) and TC-032 (UNVERIFIABLE)<br>Blocked by TC-032's missing failing-run record. | tests/layout.test.js:2011 | Branch 2 |
| AC-12 | IMPLEMENTED | tests/layout.test.js:2017, :268 — NFR-003 measured in the same scenario | tests/layout.test.js:2011 | Branch 2 |
| AC-13 | IMPLEMENTED | tests/colores.test.js:226-240 — before/after diff enumerating changed fields | tests/colores.test.js:226 | Branch 2 |
| AC-15 | IMPLEMENTED | index.html:5317 (TC-001) + feature diff with no new dependency (TC-002) | code review | Branch 2 |
| AC-16 | IMPLEMENTED | git diff 907b3ae e7b435e -- index.html — no motor function in any hunk | diff review | Branch 2 |
| AC-17 | IMPLEMENTED | index.html:792-801 against docs/equipos-en-el-campo/handoff/README.md:613-625 (TC-011, TC-030) | code review | Branch 2 |
| AC-18 | IMPLEMENTED | tests/colores.test.js:231-232 — no key gained on m or m.equipos<br>Would not catch a new field nested inside, e.g., arquerosInfo. | tests/colores.test.js:226 | Branch 2 |
| AC-19 | UNVERIFIABLE | aggregates TC-031 (IMPLEMENTED, narrow) and TC-032 (UNVERIFIABLE)<br>Blocked by TC-032.<br>**Alternate reading → DIVERGENT:** TC-031 broad reading — unprefixed FR/TC strings in layout scenarios, e.g. tests/layout.test.js:2027 | Phase 2 gate T-N.D8/D9 | Branch 2 |
| AC-21 | IMPLEMENTED | tests/layout.test.js:2215, :2249 — direct invocation in S-20 family and S-21a | tests/layout.test.js:2208-2253 | Branch 2 |
| AC-22 | IMPLEMENTED | tests/layout.test.js:2076-2079 — no armado key in the public doc | tests/layout.test.js:2076 | Branch 2 |
| AC-23 | IMPLEMENTED | index.html:5313-5314 — guard returns before any mutation or save<br>'Idéntico' asserted on persisted docs, not in-memory state. | tests/layout.test.js:2213-2220, :2244-2253 | Branch 2 |
| AC-50 | IMPLEMENTED | Plan §12.1 (35 rows) + gates T-N.D8, T-N.D8b — Spec §9 all scenarios and variants bound and every heading has a Variants block<br>§16 range citation reviewer-checked: Plan §16 AC-01 cites S-01..S-21 (§12.1). | gate | Branch 2 |
| AC-51 | PARTIAL | Plan §12 — T-N.D9 binds all four NFRs in the test suite, but §12 references a measurement only for NFR-001 (§12.8) and NFR-004 (§12.1)<br>Met: every NFR has a bound measurement test. Unmet: Plan §12 never names the tests for NFR-002 and NFR-003 (they appear only in §7.3.6, §11 and §16). | gate | Branch 2 |
| AC-52 | IMPLEMENTED | Plan §12.9 + Spec §11.3 — T-N.D10 and T-N.D10b clean over the 10 defined TCs | gate | Branch 1 y 2 |
| AC-53 | IMPLEMENTED | Plan §12.2 — 4 IMP-* rows covering code, system, business | gate | Branch 1 y 2 |
| AC-54 | IMPLEMENTED | Plan §11 — OBS-01..04 bind NFR-001..004 (T-N.D16 clean) | gate | Branch 1 y 2 |
| AC-55 | IMPLEMENTED | Plan §5 'Supply-chain: none — el repositorio no versiona ningún lockfile…'; T-2.D20 checkbox unticked; no §14 waiver rows<br>Vacuous pass by the declared none token. | recorded state | Branch 1 y 2 |

## Behaviour the Spec does not cover

| # | Behaviour | Where | Proposed home | Deliberate? |
|---|---|---|---|---|
| 1 | If the public write succeeds and the armado write fails, the persisted lists are swapped but the sums, balance, formación and equipoCompensado are not — after a reload the pill, grid and receipt describe the wrong group. Pre-existing save path, but only a swap produces this particular mismatch; S-07c does not address it. | `index.html:2177-2182` | a failure variant of S-07 (S-07d) and an FR-* in §7.3 | no — likely incidental · persistent/external effect |
| 2 | A jugador session loaded before the swap that saves any match action rewrites the whole partidos doc from memory and silently undoes the swap. Pre-existing behaviour of saveMatches; no ID of this Spec covers it. | `index.html:2177, :7665` | an FR-* in §7.3 or a §15 risk; also the FR-036 alternate reading | no — likely incidental · persistent/external effect |
| 3 | On a legacy match holding only one side of a pair (e.g. only sumaBlanco), the swap deletes that key and creates its partner. Commented and partly tested (tests/colores.test.js:207-217); key set stays within the seven. | `index.html:5169-5175` | a note on NFR-004 in §8, or an S-01f variant | yes · persistent/external effect |
| 4 | From 360 to 389 px the header icons drop to a second row, aligned right. Decided by the owner in Plan OPEN-Q-06; only the Plan records it. | `index.html:781, :786` | a sentence in NFR-002 (§8) or FR-042 (§7.5) | yes |
| 5 | The swap repaints the whole tab without saving and restoring scroll position, unlike __verEquipo. Inferred from the code comment at :5051; the jump was not measured. | `index.html:5318, :5051-5053` | an FR-* in §7.3 next to FR-021 | no — likely incidental |
| 6 | Copiar's 'Equipos copiados' tick survives a swap for its timeout, while the clipboard still holds the pre-swap labels. Minor, visible for a few seconds. | `index.html:1834-1840` | an FR-* in §7.4 next to FR-033 | no — likely incidental |
| 7 | equipoCompensado flips whenever it is 'blanco'/'negro', even if arquerosInfo.compensado were false. Latent: the motor never produces that combination (index.html:2828-2835). | `index.html:5189` | FR-015 wording in §7.2 | no — likely incidental |

## Mechanical gates

| Gate | AC | Axis | Result | Detail |
|---|---|---|---|---|
| `T-N.D8` | `AC-50` | spec-code | PASS | 35/35 scenarios and variants bound via colores/<ID>; one extra mention in a comment (tests/colores.test.js:16) is also bound in a string |
| `T-N.D8b` | `AC-50` | intra-spec | PASS | every Scenario heading has a Variants block or 'Variants: none' |
| `T-N.D9` | `AC-51` | spec-code | PASS | 4/4 defined NFRs bound; NFR-005 reported by mention-based enumeration is ARRASTRE_SPEC's, not this Spec's |
| `T-N.D10` | `AC-52` | spec-plan | PASS | 10/10 defined TCs in Plan §12; TC-035 reported by mention is ARRASTRE_SPEC's |
| `T-N.D10b` | `AC-52` | intra-spec | PASS | every §4 TC checked in §11.3 |
| `T-N.D15` | `AC-53` | intra-plan | PASS | 4 IMP-* rows |
| `T-N.D16` | `AC-54` | spec-plan | PASS | NFR-001..004 each bound to an OBS-* |
| `T-N.D17` | — | intra-plan | PASS | every T-* cited in §14 is defined; R-01 accepted with rationale |
| `T-N.D18` | — | intra-plan | PASS | TD/OBS/IMP/R/T citations resolve; 'T-2.C6 en adelante' is a placeholder, not a task; OPEN-Q-03/05/06 resolved |
| `T-N.D18b` | — | intra-document | PASS | no ID defined twice in Concept, Spec or Plan (Plan's own command) |
| `T-N.D19` | — | cross-document | FAIL | all three are qualified citations to other features' documents — lexical false positives, see Spec-quality — `D-11, D-24, FR-072` |
| `T-N.D20` | `AC-55` | plan-recorded | PASS | Plan §5 declares Supply-chain: none — vacuous pass |

*A gate pass is not evidence of an implementation. `T-N.D10`, `T-N.D16` compare the Spec to the Plan, not to the code.*

## Spec-quality findings

| # | Kind | Where | Finding |
|---|---|---|---|
| 1 | dangling-id | T-N.D19; Spec §3 header, Plan §7.0/§7.2 | D-11, D-24, FR-072 flagged as dangling. All are explicitly qualified citations to other features' documents (equipos-en-el-campo, PANEL_ARMADO_SPEC) — false positives of lexical matching. Mention-based enumeration likewise picks up NFR-005, TC-035, FR-002b, FR-002c, FR-072b and AC-20 from the replacement declaration and Change log; this audit counted by definition shape instead. |
| 2 | uncovered-field | Spec FR-013, FR-017, §6 Glossary | Each balanceLineas line has a third field, `diferencia`, that the code negates (index.html:5185). FR-013 names only blanco/negro and FR-017 forbids touching 'ningún otro campo'. The Plan resolves it alone (TD-03; its Change log admits 'detalle que la Spec no nombra'). The Spec should state it. |
| 3 | ambiguous-term | Spec FR-018, S-01b | 'Idéntico' is undefined: equal as persisted/JSON, or strict in-memory identity (Object.is)? The code and Plan TD-03 aim at the latter, which the -0→0 write breaks. |
| 4 | ambiguous-term | Spec NFR-004, S-07a | 'Campos escritos… exactamente' reads as equality over the literal written set, but saveMatches rewrites whole documents and a strategy-1 match changes only 4 of the 7 fields. It should say 'a lo sumo' and 'cuyo valor cambia'. |
| 5 | nfr-test-mismatch | Spec NFR-001, AC-10 | NFR-001 fixes 18 titulares; the only bound measurement uses the 16-titular Fútbol 8 fixture. It also names no match, width or sample count, and AC-10 does not repeat the 18. |
| 6 | ambiguous-term | Spec FR-036 | 'Cuando un jugador abra el partido' can mean a fresh load after the save (holds) or navigating inside an already-open session (fails — no re-read or live sync). |
| 7 | untested-clause | Spec S-07, FR-036 | S-07's jugador-side Then is bound only in an admin scenario (tests/layout.test.js:2044); FR-036 has no behavioural test. |
| 8 | underspecified | Spec S-07c | 'El error queda registrado' does not say where (console? toast?); the test does not assert it. |
| 9 | inaccurate-definition | Spec §6 Glossary 'Inscripción abierta' | Defined as 'la negación del locked', but locked (index.html:5889) does not include 'tiene equipos generados'. The term also collides with the persisted estado value 'Inscripción abierta', which exists on matches with no teams. |
| 10 | stale-literal | Spec S-01 Given | 'Formación fija pareja' no longer exists — renamed 'Formación fija' (index.html:1509). tests/colores.test.js:81 still uses the old label. |
| 11 | unfounded-assumption | Spec S-01c | 'El grupo con un jugador más, que era el Blanco' assumes the motor puts the extra player in Blanco; nothing guarantees it. |
| 12 | ambiguous-term | Spec S-06a | 'Se comporta igual que sin intercambio previo' reads as 'same code path' or 'same result'; strategy 4's cambios tie-break (index.html:3565) can make them disagree. |
| 13 | underspecified | Spec AC-02 | 'Estrategias vigentes' excludes matches saved under the retired estrategia3 (index.html:1527), which are still swappable. |
| 14 | scenario-vs-ui | Spec S-02 | 'La píldora dice Diferencia N pts a favor del Equipo Blanco' assumes the pill names the leader; its visible text names no team, and its title names the compensated team only when there is a goalkeeper advantage (index.html:5555, :5869). |
| 15 | internal-disagreement | Spec FR-035, S-04b; Plan TD-06 | FR-035 is scoped to one column and S-04b says two columns have 'no equipo visible que cambiar', yet the Plan flips the state at every width and that shows after crossing the breakpoint. The Spec should sanction or forbid it. |
| 16 | ambiguous-term | Spec TC-031 | 'Todo test que verifique un FR-*' could mean every ID an assertion cites or only declared bindings; AGENTS.md § Tests binds only S/NFR/TC. |
| 17 | unauditable-obligation | Spec TC-032, AC-11, AC-19; Plan §7.3.7 | The 'seen failing' evidence has no named home; the Plan says 'en el PR', but the branch merged without a PR, so the obligation cannot be audited. |
| 18 | underspecified | Spec NFR-002 | 'Cada breakpoint de CSS medido de los dos lados' has no tolerance: 390 and 900 are not measured at the adjacent outside pixel. |
| 19 | unquantified | Spec FR-043 | 'Mismo peso visual' is unquantified; a half-filled glyph carries more ink than Copiar. |
| 20 | untested-clause | Spec S-05 | 'En ese orden' includes the pill, but the bound test does not check the pill's position. |
| 21 | stale-citation | Spec TC-001, TC-002, TC-011, TC-030, TC-040, TC-041, FR-050, §6 | Line anchors in index.html were written against the pre-feature file and have shifted (e.g. saveMatches now :2160-2184, CAMPOS_EQUIPOS_ARMADO :2159, renderEncabezadoTarjeta :5887, locked :5889). |
| 22 | inaccurate-ruling | Spec §4.5 CWE-79 | Says the button inserts only fixed literals; it also interpolates m.id into the onclick (index.html:5898). m.id is app-generated (uid(), index.html:1716), the same pattern as Copiar/Regenerar, so the risk is nil, but the ruling's wording is wrong. |
| 23 | plan-record | Plan §6, §7.1, §7.3.7, §7.3.9 | Status record lags behind reality: every DoD box and every T-2.D* gate is unticked, the branch tracker still says 'In progress' with no PR, and T-2.13 is ticked while its §7.3.7 twin is not. |
| 24 | stale-doc | docs/equipos-en-el-campo/handoff/README.md:615-616; index.html:5885-5886 | The handoff still says 'el mismo par… Copiar primero' and a code comment still describes two buttons; neither is annotated with the replacement. |

## Gaps

Every row that is not IMPLEMENTED, every row with an alternate reading, and every reverse-sweep finding.

| # | Item | Verdict | Belongs to | Note |
|---|---|---|---|---|
| 1 | `FR-017` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: `diferencia` inside each balanceLineas line is 'otro campo de la generación' (FR-013 names only blanco/negro) |
| 2 | `FR-018` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: 'idéntico' as strict in-memory identity (Object.is), the standard the code comment at index.html:5165 claims |
| 3 | `FR-036` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → PARTIAL: includes a jugador whose session was already open and navigates into the match |
| 4 | `NFR-001` | UNVERIFIABLE | a named human check | Even running the bound test would not settle it: the NFR fixes 18 titulares. Settle by running the same measurement on m-nueve (Fútbol 9, 18 titulares, tests/fixtures-app.js:243) with LAYOUT_STRICT=1 node tests/layout.test.js. |
| 5 | `NFR-004` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: literal 'campos escritos': saveMatches rewrites both whole documents |
| 6 | `TC-031` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: every test that verifies any FR/NFR/TC of this Spec |
| 7 | `TC-032` | UNVERIFIABLE | a named human check | Clause 2 ('se verá fallar') rests only on claims: the d8742d4 commit body and ticked T-2.5. Test and button landed in the same commit, Plan §7.3.7 'salida pegada en el PR' is unticked and there was no PR. Settle by running colores-encabezado against index.html from 7eae28b and confirming it fails. |
| 8 | `S-01b` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: strict Object.is identity |
| 9 | `S-01h` | UNVERIFIABLE | a named human check | Settle with Plan T-2.13 by a human: double-tap against staging, reload at once, compare data/partidos and data/partidosArmado. Plan record contradicts itself: T-2.13 ticked (Plan:351), the same check unticked in §7.3.7 (Plan:302). |
| 10 | `S-04b` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: 'no hay equipo visible que cambiar' = the state must not change |
| 11 | `S-06a` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → UNVERIFIABLE: same result as regenerating without a prior swap |
| 12 | `S-07a` | IMPLEMENTED | **Spec** — clarify the wording | Narrow reading IMPLEMENTED; broad reading → DIVERGENT: literal 'campos escritos' |
| 13 | `AC-01` | UNVERIFIABLE | a named human check | Blocked only by S-01h; settles with the same staging double-tap check. |
| 14 | `AC-10` | PARTIAL | Implementation Plan (§12 / tests) | Met: the named verification exists. Unmet: it measures 16 titulares, not NFR-001's 18, so it does not verify NFR-001. |
| 15 | `AC-11` | UNVERIFIABLE | a named human check | Blocked by TC-032's missing failing-run record. |
| 16 | `AC-19` | UNVERIFIABLE | a named human check | Blocked by TC-032. |
| 17 | `AC-51` | PARTIAL | Implementation Plan (§12 / tests) | Met: every NFR has a bound measurement test. Unmet: Plan §12 never names the tests for NFR-002 and NFR-003 (they appear only in §7.3.6, §11 and §16). |
| 18 | `index.html:2177-2182` | UNSPECIFIED-BEHAVIOUR | Spec — a failure variant of S-07 (S-07d) and an FR-* in §7.3 | If the public write succeeds and the armado write fails, the persisted lists are swapped but the sums, balance, formación and equipoCompensado are not — after a reload the pill, grid and receipt describe the wrong group |
| 19 | `index.html:2177, :7665` | UNSPECIFIED-BEHAVIOUR | Spec — an FR-* in §7.3 or a §15 risk; also the FR-036 alternate reading | A jugador session loaded before the swap that saves any match action rewrites the whole partidos doc from memory and silently undoes the swap |
| 20 | `index.html:5169-5175` | UNSPECIFIED-BEHAVIOUR | Spec — a note on NFR-004 in §8, or an S-01f variant | On a legacy match holding only one side of a pair (e.g. only sumaBlanco), the swap deletes that key and creates its partner |
| 21 | `index.html:781, :786` | UNSPECIFIED-BEHAVIOUR | Spec — a sentence in NFR-002 (§8) or FR-042 (§7.5) | From 360 to 389 px the header icons drop to a second row, aligned right |
| 22 | `index.html:5318, :5051-5053` | UNSPECIFIED-BEHAVIOUR | Spec — an FR-* in §7.3 next to FR-021 | The swap repaints the whole tab without saving and restoring scroll position, unlike __verEquipo |
| 23 | `index.html:1834-1840` | UNSPECIFIED-BEHAVIOUR | Spec — an FR-* in §7.4 next to FR-033 | Copiar's 'Equipos copiados' tick survives a swap for its timeout, while the clipboard still holds the pre-swap labels |
| 24 | `index.html:5189` | UNSPECIFIED-BEHAVIOUR | Spec — FR-015 wording in §7.2 | equipoCompensado flips whenever it is 'blanco'/'negro', even if arquerosInfo.compensado were false |
