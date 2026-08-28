# Goles en contra — Spec

> **Status:** Draft · **Date:** 2026-08-28 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** *not written — see §6.5 below for why this Spec starts here*
>
> **Implementation plan:** [GOLES_EN_CONTRA_IMPLEMENTATION_PLAN.md](./GOLES_EN_CONTRA_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** No Concept Note exists for this feature.
> Per MD-25 this Spec carries its own §6.5 *Sources & Origins* ledger in
> place of inheriting one, populated below before any requirement is
> drafted.

## 1. Purpose

This Spec defines how a self-goal ("gol en contra") scored by a player during
a match is registered, validated, counted toward the opposing team's score,
and displayed — both in the live result-entry screen and in the finished
match's summary card. It does not cover *why* the feature is wanted (no
Concept Note exists — see §6.5) or *how* it is implemented in code (deferred
to the Implementation Plan).

## 2. Summary

Today, when an admin loads a match's result, they enter each player's goals,
penalty goals (a sub-count of goals), and assists. There is no way to record
that one of those goals was actually scored into the player's own net. This
feature adds a fourth counter, "goles en contra", to each player's
match-result row. Unlike a penalty goal, a self-goal does **not** add to the
scoring player's own team's tally or to his personal goal record — it adds to
the **opposing** team's score, and is visually distinguished everywhere it
appears with the same goal icon in red instead of the existing color. The
app remains a single-file, admin-gated, counters-based match-result tracker
that becomes able to represent one more kind of goal event.

## 3. Scope

### 3.1 In scope

- A new per-player, per-match counter `golesEnContra`.
- Entry of that counter in the result-entry / result-edit screen, with the
  same visual location and interaction pattern as the existing goal and
  penalty-goal counters.
- The counted effect of a self-goal on both teams' match score (opposing
  team gains it; scoring player's own team does not).
- The counted effect (or explicit non-effect) of a self-goal on a player's
  personal lifetime goal statistics.
- Display of self-goals in the finished-match summary card, using the goal
  icon in red.
- A new red variant of the existing goal icon asset.

### 3.2 Out of scope / non-goals

- The system shall not add a dedicated per-player statistics screen showing
  self-goals (mirrors the existing penalty-goal non-goal — `openspec/specs/resultados-partido/spec.md` §"Dato preparado para estadísticas futuras por jugador").
- The system shall not model goals as a list of discrete events (who,
  minute, type); it continues to use the existing aggregated-counter model
  (`goles`, `golesPenal`, `asistencias`) per player per match.
- The system shall not add a self-goal counter to the "jugadores" screen's
  per-player summary line; that screen continues to show only the
  accumulated `golesTotales`.
- The system shall not add any cap or validation tying `golesEnContra` to
  the player's own `goles` or `golesPenal` (unlike penalties, a self-goal is
  not a subset of the player's own goals — see §4.2, D-01 equivalent
  rationale in §14 A-02).

### 3.3 Constraints inherited from the Concept Note

None — no Concept Note exists for this feature (§6.5).

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — The implementation shall extend the existing single-file
  `index.html` application and its existing `matches[].resultado.statsPorJugador`
  / `players[]` data model; it shall not introduce a new file, module, or
  storage mechanism for this feature (reuses the exact pattern used for
  `golesPenal` in `index.html:3203`, `index.html:3915-3921`).

### 4.2 Architectural / integration constraints

- **TC-010** — The self-goal counter shall reuse the existing
  `resultadoDraft` client-side draft-state mechanism and the existing
  `.team-stat-input` change-listener dispatch (`index.html:3911-3932`)
  rather than introducing a parallel input-handling path.
- **TC-011** — Unlike the penalty-goal counter, the self-goal input shall
  **not** be gated by, or clamped against, the player's own `goles` value —
  it is not a subset of the player's own goals (contrast with
  `actualizarPenalesHabilitados`, `index.html:3953-3968`, which this
  feature must not imitate for this field).

### 4.3 Compliance / regulatory constraints

None — the feature stores no personal data beyond player names already
present in the existing data model, and the app has no regulatory scope
(casual amateur-league scorekeeping, single deployment, no payments, no
health/financial data).

### 4.4 Conventions to follow

- **TC-030** — All admin-only mutation entry points introduced by this
  feature shall be reachable only from code paths already gated by
  `isAdmin()`, matching every existing result-entry control
  (`index.html:3190`, `3208`, `3248-3249`, `3263`, `3271`).
- **TC-031** — New Spanish-language UI copy shall match the existing
  register and terminology used for `golesPenal` (e.g. "goles de penal" →
  "goles en contra"), per the project's existing bilingual-free,
  Spanish-only convention.

### 4.5 Security constraints (`MD-31`)

No Concept Note §5.2 exists to declare a security posture, so it is
asserted directly here: **feature exposure** — an additional numeric input
on an already admin-only, already-authenticated screen; **data
sensitivity** — low (an integer counter, no new PII); **deployment
surface** — unchanged (same client-side app + Firebase backend as every
other field in `statsPorJugador`).

CWE Top 25 retrieved live from `https://cwe.mitre.org/top25/archive/2024/2024_top25_list.html`
(2024 list, most recent published) on 2026-08-28 per MD-31.

- **TC-040** — The `golesEnContra` input and its persistence path shall be
  reachable only through the existing `isAdmin()`-gated render/listener
  functions (`renderStatsYPuntajeMiembro`, the `.team-stat-input` listener,
  `__finalizarPartido`, `__guardarEdicionResultado`); no new, ungated write
  path shall be introduced. **Defends `CWE-862` Missing Authorization** and,
  by the same single existing gate, rules out `CWE-287` Improper
  Authentication, `CWE-269` Improper Privilege Management, `CWE-863`
  Incorrect Authorization, and `CWE-306` Missing Authentication for
  Critical Function — this feature introduces no new authentication or
  privilege tier, only a new field behind the one gate all sibling fields
  already use.
- **TC-041** — The `golesEnContra` value shall be parsed and clamped with
  the same `Math.max(0, parseInt(inp.value, 10) || 0)` pattern already used
  for every `.team-stat-input` (`index.html:3916`), rejecting negative or
  non-numeric input at the point of entry. **Defends `CWE-20` Improper
  Input Validation** and, since the value is a small clamped integer never
  used in arithmetic that could exceed `Number.MAX_SAFE_INTEGER`, also rules
  out `CWE-190` Integer Overflow or Wraparound.
- **`CWE-79` Cross-Site Scripting** — not applicable; this feature adds only
  a numeric field rendered via the existing `${...}` template-literal
  pattern for numbers (never player-supplied strings) — no new unescaped
  string interpolation is introduced beyond what `goles`/`golesPenal`
  already do today.
- **`CWE-787`/`CWE-125`/`CWE-416`/`CWE-119`/`CWE-476`** (memory-safety
  classes) — not applicable; the application is client-side JavaScript with
  no manual memory management.
- **`CWE-89`/`CWE-78`/`CWE-77`/`CWE-94`** (injection classes) — not
  applicable; no SQL, shell, or dynamic-code execution is introduced or
  touched by this feature.
- **`CWE-352` CSRF** — not applicable; no new HTTP endpoint or form is
  introduced (writes go through the existing Firebase client SDK session,
  unchanged by this feature).
- **`CWE-22` Path Traversal / `CWE-434` Unrestricted Upload** — not
  applicable; no filesystem path or upload is derived from user input. The
  new red icon asset (§10) is a static file shipped with the app, not
  user-supplied.
- **`CWE-502` Deserialization of Untrusted Data** — not applicable; the new
  field is read from the same trusted, admin-written Firestore document
  structure as every other `statsPorJugador` field.
- **`CWE-200` Exposure of Sensitive Information** — not applicable; an
  integer goal count is not sensitive information.
- **`CWE-918` SSRF** — not applicable; this feature triggers no
  server-side requests.
- **`CWE-798` Hard-coded Credentials** — not applicable; untouched by this
  feature.
- **`CWE-400` Uncontrolled Resource Consumption** — not applicable; the
  feature adds one bounded integer per roster player, no unbounded loop or
  allocation.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Admin | The person who loads/edits a match's result (existing `isAdmin()` role) | Accurately record a self-goal so the scoreline and per-team goal totals reflect reality |
| Jugador (viewer) | Any signed-in user viewing match results (existing non-admin role) | See who scored, including self-goals, in the finished match's summary |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | As an Admin, I want to record that a player scored a self-goal so that the opposing team's score reflects it correctly. | FR-001, FR-002, FR-010 |
| US-02 | As an Admin, I want the self-goal input to work independently of that player's own goal count, since a self-goal isn't a type of goal *for* his team. | FR-003, FR-004 |
| US-03 | As a Jugador (viewer), I want to see self-goals called out with a red goal icon in the finished match's summary card, so I don't mistake them for regular goals. | FR-020, FR-021 |
| US-04 | As an Admin editing an already-finalized result, I want self-goals to be included when player and team statistics are recalculated. | FR-011, FR-012 |

## 6. Glossary

| Term | Definition |
|---|---|
| Gol en contra (self-goal, own goal) | A goal event credited to the scoring player's record but counted toward the **opposing** team's score in the match. |
| `statsPorJugador` | Existing per-match, per-player stats object (`{ goles, golesPenal, asistencias }`) persisted on a finalized match. |
| `resultadoDraft` | Existing client-side draft of `statsPorJugador` while an admin is loading or editing a match's result. |
| `golesEnContra` | The new per-player, per-match counter this Spec introduces. |
| `golesEnContraTotales` | The new per-player lifetime accumulator this Spec introduces (mirrors `golesPenalTotales`). |

## 6.5 Sources & Origins (`MD-25`)

**Codebase evidence:**

- `openspec/specs/resultados-partido/spec.md` — the current committed spec
  for match-result goal tracking. Pinned: the existing data model
  (`statsPorJugador[playerId] = {goles, golesPenal, asistencias}`), the
  penalty-goal validation rule (penal ≤ goles), and the display format
  `Nombre N⚽ (M de penal)` this Spec's display format is modeled on.
- `openspec/changes/archive/2026-08-21-goles-por-penal/{proposal,design,tasks}.md` —
  the design record for the most recent, structurally analogous feature
  (penalty goals). Pinned: the decision to add a sibling counter field
  rather than an event list; the decision to validate/clamp at the input
  listener rather than only at save time; the decision to accumulate a
  lifetime total without surfacing it in any screen yet. This feature
  follows the same shape, diverging only where a self-goal's team
  attribution differs from a penalty's (see D-equivalent rationale in §14
  A-02).
- `index.html:1212-1246` (`recomputeAllPlayerStatsFromMatches`) — pinned the
  full recompute path that must also fold in `golesEnContra`.
- `index.html:3199-3290` (`ensureResultadoDraft`, `__finalizarPartido`,
  `__editarResultadoFinalizado`, `__guardarEdicionResultado`) — pinned every
  point where `statsPorJugador` is initialized, persisted, or re-derived.
- `index.html:3292-3357` (`teamHeaderTotalText`, `updateTeamTotalsDisplay`,
  `renderStatsYPuntajeMiembro`) — pinned the live-draft team-total
  computation and the roster-row input rendering this feature must extend.
- `index.html:3628-3654` — pinned a fifth, easy-to-miss call site
  (non-admin "jugador" team-goals display) that computes team goals
  independently of `teamHeaderTotalText` and must receive the same formula
  change.
- `index.html:3911-3968` (`.team-stat-input` listener,
  `actualizarAsistenciasHabilitadas`, `actualizarPenalesHabilitados`) —
  pinned the existing input-clamping pattern this feature's TC-041 reuses,
  and the enablement pattern this feature's TC-011 explicitly does *not*
  reuse.
- `index.html:4021-4045` (`matchResultSummaryHtml`) — pinned the finished-match
  summary card this feature must extend with the red-icon self-goal line.
- `index.html:1028` (`GOAL_ICON`) and `assets/goal-icon.png` — pinned that
  the existing goal icon is a raster PNG, not a single-color vector icon,
  which is why a red variant requires a new asset rather than a CSS color
  override (confirmed with the user; see §14 A-03).
- `tests/README.md`, `tests/motor.test.js`, `tests/layout.test.js` — pinned
  that the project has exactly two automated test suites (team-generation
  engine, responsive layout), neither of which covers match-result/goal
  logic; verification for this feature area is manual, matching how the
  penalty-goal feature's own `tasks.md` was verified (task-level manual
  checks, no automated test added).

**Industry-standard evidence:** CWE Top 25 (2024, retrieved live from
`https://cwe.mitre.org/top25/archive/2024/2024_top25_list.html` on
2026-08-28) applied in §4.5. No other regulatory/architectural/style
standard applies — this is a client-side hobby/community scorekeeping app
with no regulated data, no formal architecture framework, and no
`AGENTS.md`/`CLAUDE.md`/`CONTRIBUTING.md` policy file in this repo beyond
the project's own `README.md` and `Roadmap.md` (neither of which imposes
constraints beyond what's already cited above).

**Prior-art evidence:** The `2026-08-21-goles-por-penal` change (above) is
the direct, structurally-analogous prior feature in this same repo and is
the primary prior-art source for this Spec's shape. No external
peer-product or literature research was performed — the feature is a small,
self-contained extension of an existing in-repo pattern, and the repo's own
adjacent feature is a stronger and more directly applicable precedent than
generic peer-product research would be.

## 7. Functional requirements

### 7.1 Registro de goles en contra

- **FR-001** — The system shall allow recording, for each player within a
  match's result, a count of self-goals (`golesEnContra`), in addition to
  the existing `goles`, `golesPenal`, and `asistencias` counts.
- **FR-002** — When a match's `resultadoDraft` is initialized (new load or
  edit-of-finalized), the system shall default each player's
  `golesEnContra` to `0`.
- **FR-003** — If a stored match result has no `golesEnContra` field for a
  player (data saved before this feature existed), the system shall treat
  it as `0` in every read (draft initialization, display, accumulation),
  matching the existing `golesPenal`-absence handling.

### 7.2 Independencia respecto de los goles propios

- **FR-004** — The system shall accept any non-negative integer value for
  `golesEnContra` independent of that same player's `goles` or
  `golesPenal` value in the same match — unlike `golesPenal`, `golesEnContra`
  shall not be enabled/disabled or clamped based on the player's own goal
  count.
- **FR-005** — The system shall clamp `golesEnContra` input to a
  non-negative integer using the same parse/clamp rule already applied to
  every other `.team-stat-input` (reject non-numeric input as `0`; reject
  negative input as `0`).

### 7.3 Efecto en el marcador por equipo

- **FR-010** — The system shall add each player's `golesEnContra` value to
  the **opposing** team's total goal count for that match, not to the
  scoring player's own team's total.
- **FR-011** — When determining a match's per-team win/loss/draw outcome
  (used to accumulate `partidosGanados`/`partidosEmpatados`/`partidosPerdidos`
  for every convened player), the system shall use each team's total goal
  count as computed per FR-010 (own-team `goles` plus opposing team's
  `golesEnContra`), consistently in both the initial "Finalizar partido"
  computation and the historical `recomputeAllPlayerStatsFromMatches()`
  recomputation.
- **FR-012** — The system shall apply the FR-010 team-total formula
  consistently across every place a team's match goal total is displayed or
  computed, including: the live admin draft header total
  (`teamHeaderTotalText`), the non-admin "jugador" team-goals display, and
  the finished-match summary card's per-team goal count.

### 7.4 Efecto en las estadísticas históricas del jugador

- **FR-013** — The system shall accumulate, at the player level, a lifetime
  total of self-goals (`golesEnContraTotales`) across all their matches,
  analogous to how `golesPenalTotales` is accumulated (display of this
  total is out of scope — see §3.2).
- **FR-014** — The system shall **not** add a player's `golesEnContra` to
  that player's own `golesTotales` (personal lifetime goal count) — a
  self-goal shall never increase the scoring player's own goal tally.

### 7.5 Carga de goles en contra en la pantalla de resultado

- **FR-020** — The result-entry/result-edit screen shall offer, for each
  player, a numeric input for `golesEnContra`, positioned alongside the
  existing goal and penalty-goal inputs, always enabled while the row is
  editable (see FR-004 — no goal-based gating).
- **FR-021** — The `golesEnContra` input's label/icon shall be the same
  goal icon used for `goles`, rendered in red, so it is visually
  distinguishable at a glance from the regular-goal and penalty-goal
  controls.

### 7.6 Visualización en la ficha del partido

- **FR-030** — In a finished match's summary card, a player who scored at
  least one self-goal shall be listed with a red goal icon, the count of
  self-goals, and the abbreviation `(EC)`, on its **own line**, separate
  from that player's regular-goals line (confirmed with the user —
  supersedes the earlier same-line "en contra" wording). When the player
  also has a regular-goals line above it, the self-goal line does not
  repeat the player's name (it reads as a continuation of that player's
  entry); when it is the player's only line (FR-031), it carries the name.
- **FR-031** — A player who scored a self-goal but zero regular goals in
  that match shall still appear in the scorer list of **their own** team's
  section of the summary card (not the opposing team's section), with the
  self-goal line carrying the player's name (since there is no
  regular-goals line above it to attribute it to) — even though the
  existing scorer-list filter today only includes players with
  `goles > 0`.
- **FR-032** — A player with zero self-goals shall be displayed exactly as
  today, with no red icon, no self-goal text, and no change in behavior.

### 7.7 Pantalla "jugadores" sin cambios

- **FR-040** — The "jugadores" player-list screen shall continue to display
  only each player's accumulated `golesTotales`, with no self-goal
  indication of any kind (mirrors `openspec/specs/resultados-partido/spec.md`'s
  existing non-goal for penalty goals).

## 8. Non-functional requirements

No quantified NFR applies. This is a small, purely client-side counter
addition to an existing single-page application with no server-side
processing, no measurable latency budget beyond what the existing
`.team-stat-input` listener already meets, and no availability/scale target
distinct from the app as a whole.

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | None — reuses the existing synchronous, in-memory `.team-stat-input` listener path; no new asynchronous work is introduced. |
| NFR-002 | Reliability | None beyond the app's existing reliability posture (local `resultadoDraft` state plus Firebase persistence on save, unchanged). |
| NFR-003 | Security | See §4.5 TC-040/TC-041. |
| NFR-004 | Privacy / compliance | None — see §4.3. |
| NFR-005 | Observability | None — the app has no telemetry/observability layer for any existing feature; this feature does not introduce one either. |
| NFR-006 | Accessibility | The new input and icon shall carry a `title`/`alt` attribute describing "Gol en contra", matching the existing `title`/`alt` pattern on every sibling input and icon (`index.html:3343-3347`, `1028`). |
| NFR-007 | i18n / localisation | None — the app is Spanish-only throughout; this feature follows suit (TC-031). |
| NFR-008 | Cost | None — no new infrastructure or paid service is introduced. |
| NFR-009 | Scalability | None — bounded by existing per-match roster size (already small, amateur 5-a-side/11-a-side matches). |
| NFR-010 | Maintainability | The new field shall follow the exact naming and handling convention of `golesPenal` so a future reader can find both together (TC-001). |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — Cargar un gol en contra (covers FR-001, FR-004, FR-010)

- **Given** un partido con inscripción cerrada y un admin cargando el resultado
- **And** un jugador del Equipo Blanco con 0 goles propios cargados
- **When** el admin ingresa `1` en el input de "gol en contra" de ese jugador
- **Then** el sistema persiste `golesEnContra = 1` para ese jugador
- **And** el total de goles mostrado para el Equipo Negro (el rival) aumenta en 1
- **And** el total de goles mostrado para el Equipo Blanco (su propio equipo) no cambia

**Variants:**

- `S-01a [boundary]` — el jugador tiene además 2 goles propios y 1 de penal cargados al mismo tiempo → su equipo suma sus 2 goles propios normalmente; el 1 en contra suma solo al rival.
- `S-01b [boundary]` — el admin ingresa `0` (valor por defecto) → no se persiste ningún efecto, comportamiento igual al actual.
- `S-01c [failure]` — el admin ingresa un valor no numérico o negativo → el sistema lo clampa a `0`, igual que ocurre hoy con `goles`/`golesPenal`/`asistencias`.
- `S-01d [property]` — para cualquier combinación de valores cargados en un partido, la suma de los totales mostrados de ambos equipos es igual a la suma de todos los `goles` cargados más la suma de todos los `golesEnContra` cargados (un gol en contra es un gol adicional en el marcador global, no una transferencia de un gol ya contado).

#### Scenario S-02 — Finalizar un partido con un gol en contra (covers FR-011)

- **Given** un partido con inscripción cerrada, Equipo Blanco con 2 goles propios y Equipo Negro con 1 gol propio, y un jugador del Equipo Negro con 1 gol en contra cargado
- **When** el admin finaliza el partido
- **Then** el resultado guardado tiene Equipo Blanco = 2 (propios) + 1 (en contra del jugador de Negro, a favor del Blanco) = 3 goles, y Equipo Negro = 1 (propio) goles
- **And** el partido se computa como victoria de Blanco (3 a 1) para el cálculo de partidos ganados/empatados/perdidos de cada jugador convocado

**Variants:**

- `S-02a [boundary]` — el gol en contra es el único gol del partido (0 goles propios de ningún jugador de ningún equipo) → el equipo beneficiado gana 1 a 0.
- `S-02b [concurrency]` — el admin edita el resultado de un partido ya finalizado (vía `__editarResultadoFinalizado`/`__guardarEdicionResultado`) cambiando el valor de `golesEnContra` de un jugador → al guardar, `recomputeAllPlayerStatsFromMatches()` recalcula partidos ganados/empatados/perdidos y `golesEnContraTotales` de todos los jugadores convocados de forma consistente con el nuevo valor.

#### Scenario S-03 — Ficha del partido con un jugador que solo hizo un gol en contra (covers FR-030, FR-031)

- **Given** un partido finalizado donde un jugador del Equipo Blanco anotó 0 goles propios y 1 gol en contra
- **When** se muestra la ficha del partido (card de resumen en la lista de partidos)
- **Then** ese jugador aparece listado en la sección del Equipo Blanco (su propio equipo), en un renglón propio, como "Nombre 1🔴 (EC)"
- **And** el gol se contabiliza en el total numérico mostrado para el Equipo Negro, no para el Equipo Blanco

**Variants:**

- `S-03a [boundary]` — el mismo jugador también anotó 2 goles propios en el mismo partido → aparece en dos renglones dentro de la sección de su propio equipo: arriba "Nombre 2⚽", abajo "1🔴 (EC)" sin repetir el nombre.
- `S-03b [boundary]` — un jugador sin ningún gol propio ni en contra → sigue sin aparecer en la lista de goleadores, comportamiento igual al actual (FR-032).

### 9.2 Edge cases

Variants: none — todos los casos límite identificados quedaron cubiertos como variantes de S-01/S-02/S-03 arriba.

### 9.3 Failure / unwanted-behaviour scenarios

No hay escenarios de falla sin contraparte de camino feliz: el único modo de "falla" (entrada no numérica o negativa) es un `[failure]` variant de S-01 (`S-01c`).

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

Ninguna entidad nueva — esta feature extiende dos entidades ya existentes con
campos adicionales, no introduce una entidad conceptual nueva.

| Entity | Purpose | Key attributes (conceptual) | Lifecycle |
|---|---|---|---|
| Resultado de jugador en partido (existente, extendida) | Contadores de un jugador en un partido finalizado o en carga | `goles`, `golesPenal`, `golesEnContra` (nuevo), `asistencias` | Creada al finalizar/editar un partido; leída para mostrar totales y ficha |
| Jugador (existente, extendida) | Estadísticas acumuladas de por vida | `golesTotales`, `golesPenalTotales`, `golesEnContraTotales` (nuevo), `asistenciasTotales` | Acumulada en cada "Finalizar partido" / recompute |

#### 10.1.1 Entity-relationship diagram

No requerido — no se introduce ninguna entidad nueva (ver §10.1); ambos
campos nuevos son atributos hermanos de campos ya existentes en entidades ya
modeladas.

### 10.2 External APIs / events the feature consumes

None — no external API is consumed by this feature.

### 10.3 External APIs / events the feature exposes

None — no new API/event is exposed; persistence continues through the
existing Firebase document write path for `matches[]`/`players[]`.

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — All scenarios in §9.1 (S-01, S-02, S-03) and their variants
  pass against a fresh load of the app (covers FR-001–FR-032).
- **AC-02** — A match saved before this feature existed (no `golesEnContra`
  field anywhere in its `statsPorJugador`) loads, displays, and recomputes
  without error, treating the missing field as `0` throughout (covers
  FR-003).

### 11.2 Non-functional acceptance

- **AC-10** — NFR-006 verified by inspecting the rendered `title`/`alt`
  attributes on the new input and icon.

### 11.3 Constraint compliance

- **AC-15** — TC-001/TC-010/TC-011/TC-030/TC-031 verified by code review
  against the cited `index.html` locations.
- **AC-16** — TC-040/TC-041 verified by code review confirming the new
  field's read/write paths sit behind the existing `isAdmin()` gate and use
  the existing clamp pattern.

### 11.4 Negative / safety acceptance

- **AC-20** — Scenario S-01c (non-numeric/negative input) produces a
  clamped `0`, never a persisted negative or `NaN` value, as observed by
  manual entry in the browser.

### 11.5 Test & traceability obligations

- **AC-50** — Every scenario in §9 — including every variant — has at least
  one verification referenced in the Plan's §12.1 *Scenario Traceability
  Matrix*. **Explicit ruling for this Spec:** this feature area has no
  automated test coverage today (§6.5 — only `tests/motor.test.js` and
  `tests/layout.test.js` exist, and neither touches match-result/goal
  logic), matching how the penalty-goal precedent feature was verified
  (`2026-08-21-goles-por-penal`'s `tasks.md` shipped with manual
  verification steps, no automated test added). This Spec therefore
  interprets AC-50's "runnable test" obligation, for this feature only, as
  satisfied by a **named, repeatable manual verification procedure**
  (exact steps + expected observation) in the Plan's §12.1 `Test` column,
  rather than requiring net-new test-framework infrastructure out of
  proportion to the feature. This is a disclosed deviation from AC-50's
  base wording (which otherwise expects a structurally-anchored automated
  binding) — the Plan is free to add an automated test instead if it finds
  a low-cost way to do so, but is not required to. Every §9 scenario
  heading is followed by a `Variants:` block or an explicit `Variants:
  none` declaration (both present above).
- **AC-51** — Not applicable — no NFR in §8 carries a quantified target.
- **AC-52** — Every TC in §4 has a §11.3 compliance check (AC-15/AC-16
  above) and a corresponding Plan §12 entry naming the reviewer/checklist
  that verifies it (all TCs here are code-review-verifiable, not
  CI-mechanizable, since the project has no CI pipeline or lint rule
  infrastructure for this kind of constraint).
- **AC-53** — The Plan's §12.2 *Impact Traceability* shall include at least
  one `IMP-*` row for the `code` scope (the five call sites enumerated in
  §6.5 that must change their team-goal formula) and one for the `business`
  scope (match outcomes and lifetime player records for historical matches
  are unaffected — no data migration needed — but *future* finalized
  matches' win/loss outcomes can now shift relative to pre-feature behavior
  when a self-goal is recorded).
- **AC-54** — Not applicable — no quantified NFR exists to bind an `OBS-*`
  signal to; the app has no observability layer for any existing feature
  (§8 NFR-005).
- **AC-55** — Supply-chain: none — this feature adds no new dependency; the
  project has no package manifest/lockfile (`package.json` absent from the
  repo root at Spec time).

## 12. Success metrics

No production success metrics apply — this is an internal scorekeeping
utility for a private amateur league with no analytics/adoption tracking
infrastructure (consistent with every other feature in this app).

## 13. Dependencies

- **Upstream services / specs:** `openspec/specs/resultados-partido/spec.md`
  (existing committed spec this feature extends in practice, even though
  this Spec itself lives in the separate `docs/` engineering-methodology
  track — see §17).
- **Internal modules / teams:** none — single maintainer, single file.
- **Feature flags / config:** none — the app has no feature-flag mechanism;
  this feature ships directly, matching every prior feature in this repo.
- **Third-party APIs:** none new — existing Firebase persistence only.

## 14. Assumptions

- **A-01** — A self-goal is always attributable to exactly one player on
  the roster (the app has no "unknown scorer" concept for regular goals
  either, so this is consistent with existing behavior).
- **A-02** — A self-goal is not a subset of, or bounded by, the scoring
  player's own `goles`/`golesPenal` count — unlike a penalty, which is
  necessarily one of the player's own goals, a self-goal is an independent
  event and the two counters shall never be cross-validated against each
  other (confirmed with the user during Spec authoring).
- **A-03** — The existing goal icon (`assets/goal-icon.png`) is a raster PNG
  without a single-color fill that CSS can safely recolor without visual
  risk; the user confirmed producing a dedicated red-icon asset rather than
  a CSS filter (confirmed with the user during Spec authoring).
- **A-04** — A self-goal scorer is displayed in the summary card under
  their own team's section (not the beneficiary team's section), even
  though the goal counts toward the beneficiary team's score (confirmed
  with the user during Spec authoring).

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| A call site that computes team goals is missed (there are 5 — §6.5), leaving one screen inconsistent with the others | Med | Med | FR-012 explicitly enumerates all known call sites; Plan §12.1 must map each to a verification row |
| Editing a finalized match's self-goal count silently fails to update the affected players' win/loss/draw record | Med | Low | FR-011 explicitly requires the same formula in both `__finalizarPartido` and `recomputeAllPlayerStatsFromMatches`; S-02b variant covers this |
| The new red icon reads as low-contrast or ambiguous at the small inline size used elsewhere (16×16px) | Low | Med | Deferred to Plan/design review — flagged here so the Plan's DoD includes a visual check at production size |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | Exact Spanish copy/format for the self-goal line in the summary card (e.g. "Juan 2⚽ 1🔴 en contra" vs. another wording) | Lucas Manoukian | Implementation Plan | Product-level wording choice with no behavioral consequence; Plan should propose exact strings for a final look before merge |
| OPEN-Q-02 | Exact label/affordance for the self-goal input in the entry row (red icon alone vs. red icon + short text label) | Lucas Manoukian | Implementation Plan | Visual/UX detail; Plan should propose the concrete markup |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** every FR-* (§7), every TC-* (§4),
  every AC-* (§11, including the §11.5 test-obligation gates), and A-01
  through A-04 (§14).
- **Plan has freedom over:** exact function/helper names and file
  organization within `index.html`, exact Spanish copy for OPEN-Q-01/02,
  exact CSS for the red icon's sizing/positioning, and whether the
  team-goal formula (FR-010/FR-012) is centralized in a new shared helper
  or duplicated at each of the five call sites (a code-organization
  decision the Spec does not mandate — see TC-001 scope).
- **Plan must resolve:** OPEN-Q-01, OPEN-Q-02.
- **Plan must generate:** the red goal icon asset (`assets/goal-icon-red.png`
  or equivalent), per A-03.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-08-28 | Lucas Manoukian | Initial draft. Self-critique: passed (0🔴 / 2🟡 / 1🔵) — tightened FR-013 (removed compound non-display clause, redundant with §3.2), made the AC-50 "manual verification counts as runnable test" interpretation explicit and disclosed rather than implicit, noted §6.5 as a Concept-Note-shaped addition justified by the absence of a Concept Note. |
| 2026-08-28 | Lucas Manoukian | Fixed an arithmetic error in Scenario S-02's **Then** clause, found by unit-testing `totalGolesEquipo` against this scenario's own numbers during implementation: the drafted text claimed a 2-2 draw, but Blanco's 2 own goals plus the self-goal awarded to them makes 3, against Negro's 1 — a 3-1 win for Blanco, not a draw. The property invariant in S-01d was re-checked against the same numbers and holds correctly; only S-02's hand-computed example was wrong. |
| 2026-08-28 | Lucas Manoukian | User revised the summary-card display after seeing it running: the self-goal line now uses the abbreviation `(EC)` instead of the word "en contra", and always sits on its own line below the player's regular-goals line, rather than appended to the same line. Updated FR-030/FR-031 and the S-03/S-03a examples to match; re-verified in a real browser session. |
