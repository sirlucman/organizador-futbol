# Orden del listado de jugadores — Spec

> **Status:** Draft · **Date:** 2026-08-28 · **Owner:** Lucas Manoukian
>
> **Reviewers:** *pending*
>
> **Concept note:** *not written — see §6.5 below for why this Spec starts here*
>
> **Implementation plan:** [ORDEN_JUGADORES_IMPLEMENTATION_PLAN.md](./ORDEN_JUGADORES_IMPLEMENTATION_PLAN.md)

> **Grounding evidence (`MD-25`).** No Concept Note exists for this feature.
> Per MD-25 this Spec carries its own §6.5 *Sources & Origins* ledger in
> place of inheriting one, populated below before any requirement is
> drafted.

## 1. Purpose

This Spec defines two related but distinct ordering surfaces: (1) how the
"Jugadores" screen's player list (the plantel) can be ordered — manually via
drag and drop, or via a filter that sorts the list ascending or descending
by average score ("puntaje") or by principal position; and (2) how the
titulares/suplentes convocatoria queue on a match's "Partidos" screen can be
manually reordered via drag and drop only, in any match state. It does not
cover *why* the feature is wanted (no Concept Note exists — see §6.5) or
*how* it is implemented in code (deferred to the Implementation Plan).

## 2. Summary

Today the "Jugadores" screen always shows the roster sorted alphabetically
by apellido+nombre (`getFiltered()`), with no way to change that order. This
feature adds a "modo de orden" control next to the existing search and
posición/estado filters, with five states: **Manual** (default), **Puntaje
ascendente**, **Puntaje descendente**, **Posición ascendente**, **Posición
descendente**. In Manual mode an admin can drag and drop a player's row to
reposition it, reusing the same native HTML5 drag-and-drop pattern already
used to move players between teams. The manual order and the active sort
mode are shared across all users (persisted in Firestore, same pattern as
the rest of the roster), while dragging itself and the puntaje filter remain
admin-only, since puntaje is already admin-only data. Separately, the
"Partidos" screen's convocatoria queue — the ordered list of called-up
players whose first N slots are "titulares" and the rest "suplentes" — gains
the same drag-and-drop mechanic (and only that; no sort filters), letting an
admin manually reorder that queue in any match state, including a
`Finalizado` match, without touching already-generated teams or results
(§7.8). The app remains a single-file, admin-gated tool that becomes able to
present two of its existing lists in an order the admin chooses, instead of
only their current fixed order.

## 3. Scope

### 3.1 In scope

- A new "modo de orden" control on the Jugadores screen (Manual / Puntaje ↑
  / Puntaje ↓ / Posición ↑ / Posición ↓).
- Drag-and-drop manual reordering of roster rows while in Manual mode.
- A new per-player `orden` field, persisted in the existing `players`
  Firestore document.
- A new shared `playersSortMode` value, persisted in Firestore, so every
  user sees the same active sort mode.
- A one-time migration that assigns an `orden` value to every existing
  player who doesn't have one yet.
- Fallback behaviour for non-admin viewers when the persisted sort mode is
  puntaje-based.
- Drag-and-drop manual reordering of the titulares/suplentes convocatoria
  queue (`m.convocados`) on a match's "Partidos" screen, available to admin
  in every match state (`Inscripción abierta`, `Equipos generados`,
  `Finalizado`) — unlike the existing add/quitar/dupla controls on that
  same queue, which stay locked once the match is closed or finalized
  (§7.8).

### 3.2 Out of scope / non-goals

- The system shall not add any sort filter (by puntaje, by posición, or any
  other criterion) or a "modo de orden" selector to the convocatoria
  (titulares/suplentes) queue — only manual drag-and-drop reordering is
  added there (FR-072).
- The system shall not add drag-and-drop reordering to any screen other
  than "Jugadores" and the convocatoria queue described in §7.8 — the
  equipos-building (blanco/negro) drag-and-drop in "Partidos", which
  operates on `m.equipos` once teams are generated, is untouched.
- The system shall not automatically regenerate `m.equipos`, alter
  `m.resultado`, or change any already-persisted per-player match statistic
  as a side effect of reordering the convocatoria queue — it only changes
  `m.convocados`'s order (A-06).
- The system shall not add a keyboard-only or screen-reader-accessible way
  to reorder players manually; it reuses the existing native HTML5
  drag-and-drop pattern, which has the same limitation today in the equipos
  screen (see §14 A-05).
- The system shall not expose player scores to non-admin users in any form
  (the puntaje sort option itself stays admin-only — see §3.2 in the
  existing permission model, `openspec/specs/resultados-partido/spec.md`
  is not affected, this restates the existing `007-permisos-por-usuario`
  boundary).
- The system shall not introduce per-user (per-device/local) ordering
  preferences; ordering is a single shared state (see §10, D-equivalent
  rationale in §14 A-03).
- The system shall not change the existing search (`#searchInput`) or
  filter (`#filters`, `#filtersEstado`) behaviour beyond making the sort
  step that follows them selectable.

### 3.3 Constraints inherited from the Concept Note

None — no Concept Note exists for this feature (§6.5).

## 4. Technical & architectural constraints

### 4.1 Platform / stack constraints

- **TC-001** — The implementation shall extend the existing single-file
  `index.html` application and its existing `players[]` data model; it
  shall not introduce a new file, module, or third-party library (e.g. no
  Sortable.js) for drag-and-drop — it reuses the native HTML5
  drag-and-drop already used for moving players between teams
  (`index.html:3434` `draggable="true"`/`ondragstart`, `index.html:3541-3551`
  `window.__dragStartJugador`/`window.__dropOnTeam`).

### 4.2 Architectural / integration constraints

- **TC-010** — Sorting shall integrate into the existing `getFiltered()`
  filter → search → sort pipeline (`index.html:1474-1484`) as a selectable
  final sort step, rather than introducing a parallel rendering path for
  the roster.
- **TC-011** — The puntaje sort shall reuse the existing `computeAvg(p.scores)`
  function (`index.html:1041-1046`) — the same function that already
  computes the value shown in the admin-only `avg-chip` on each row
  (`index.html:1511`, `1528`) — rather than re-implementing average
  calculation.
- **TC-012** — The posición sort shall reuse the same fixed position
  sequence already defined for the equipos screen's `ordenarPorPosicion`
  (`index.html:3638`: `{ Arquero: 0, Defensor: 1, Volante: 2, Delantero: 3 }`),
  so the two screens agree on what "ascending by position" means.
- **TC-013** — Unlike `motorConfig`, which is deliberately readable only by
  admin sessions (`index.html:1148`: `admin ? leerJson('motorConfig', ...) :
  defaultMotorConfig()`), the `playersSortMode` value shall be stored in a
  document readable by every session, admin and non-admin alike — FR-052
  requires every viewer, not just admins, to know the currently active
  sort mode in order to apply its fallback.
- **TC-014** — The convocatoria queue's drag-and-drop (§7.8) shall reorder
  `m.convocados` directly and reuse the existing `getUnidadesConvocatoria`
  grouping (`index.html:1628-1643`) so a dupla is always dragged and
  dropped as a single unit, never splitting its two ids apart — it shall
  not introduce a parallel grouping mechanism.
- **TC-015** — The convocatoria queue's drag-and-drop shall reuse the same
  native HTML5 drag-and-drop pattern as TC-001 (no new library), applied to
  `renderConvocadosList`'s existing row markup (`index.html:4193-4258`,
  `.conv-row`/`.conv-row-dupla`) rather than introducing a parallel render
  path for that screen.

### 4.3 Compliance / regulatory constraints

None — the feature stores no personal data beyond what the existing player
model already has, and the app has no regulatory scope (casual amateur-league
scorekeeping, single deployment, no payments, no health/financial data).

### 4.4 Conventions to follow

- **TC-030** — Every new admin-only mutation handler (drag start, drop,
  sort-mode change while dragging is relevant) shall follow the existing
  `window.__`-prefixed camelCase naming convention and the existing
  `if(!isAdmin()) return;` gating pattern already used by every mutation
  handler on this screen (`index.html:1541`, `1549`, `1555`, `1586`).
- **TC-031** — The one-time migration that assigns `orden` to legacy
  players shall follow the existing one-time-migration-flag pattern: a
  `crudo['<nombre>Migrado']` check, the migration itself, then
  `window.storage.set('<nombre>Migrado', 'true', false)` — the exact
  pattern already used for `statsGanadosEmpatadosPerdidosMigrado` and
  `puntajeArmadoSeparadoMigrado` (`index.html:1187-1203`).

### 4.5 Security constraints (`MD-31`)

No Concept Note §5.2 exists to declare a security posture, so it is
asserted directly here: **feature exposure** — new admin-authenticated
drag-and-drop interactions and a new sort-mode selector on an already
admin-gated, already-authenticated screen; the only client-controlled
value that flows into a new write path is the dragged player's `id` (a
string already known to the client, read via `dataTransfer`, same shape as
the existing equipos drag-and-drop); **data sensitivity** — low (a numeric
`orden` field and an enum-like `playersSortMode` string; no new PII);
**deployment surface** — unchanged (same client-side app + Firebase backend
as every other field in `players`).

CWE Top 25 retrieved live from `https://cwe.mitre.org/top25/archive/2024/2024_top25_list.html`
(2024 list, most recent published) on 2026-08-28 per MD-31.

- **TC-040** — Every new mutation path (drag-and-drop reorder, persisting
  `orden`, persisting `playersSortMode`) shall be reachable only through
  handlers gated by the existing `isAdmin()` check, mirroring
  `window.__dragStartJugador`/`window.__dropOnTeam` (`index.html:3541-3551`)
  and every existing Jugadores mutation handler
  (`index.html:1541,1549,1555,1586`). No new, ungated write path shall be
  introduced. **Defends `CWE-862` Missing Authorization** and, by the same
  single existing gate, rules out `CWE-287` Improper Authentication,
  `CWE-269` Improper Privilege Management, `CWE-863` Incorrect
  Authorization, and `CWE-306` Missing Authentication for Critical
  Function — this feature introduces no new authentication or privilege
  tier, only new fields and handlers behind the one gate every sibling
  mutation already uses.
- **TC-041** — Before applying a drop, the system shall validate that the
  dragged id read from `dataTransfer` corresponds to a player currently
  present in the visible list; if it does not (stale drag, tampered
  payload, or a player removed mid-drag), the system shall silently no-op
  rather than mutate `orden` for a non-existent or unrelated entry —
  mirroring the existing `if(playerId) window.__moverJugadorManual(...)`
  guard in `window.__dropOnTeam` (`index.html:3546-3551`). **Defends
  `CWE-20` Improper Input Validation** and **`CWE-639` Authorization Bypass
  Through User-Controlled Key** (the dragged id is treated as a lookup key
  into the admin's own already-authorized `players` array, never trusted
  to reach into another admin's session or a different collection).
- **`CWE-79` Cross-Site Scripting** — not applicable; this feature adds a
  numeric field (`orden`) and a closed-set string (`playersSortMode`),
  never new free-text rendered via unescaped interpolation.
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
  applicable; no filesystem path or upload is derived from user input.
- **`CWE-502` Deserialization of Untrusted Data** — not applicable; the new
  fields are read from the same trusted, admin-written Firestore document
  structure as every other `players`/config field.
- **`CWE-200` Exposure of Sensitive Information** — not applicable; `orden`
  and `playersSortMode` carry no sensitive information, and puntaje itself
  is unaffected by this feature's own exposure rules (still gated by the
  existing `playerScores` document per FR-052).
- **`CWE-918` SSRF** — not applicable; this feature triggers no
  server-side requests.
- **`CWE-798` Hard-coded Credentials** — not applicable; untouched by this
  feature.
- **`CWE-400` Uncontrolled Resource Consumption** — not applicable; the
  feature adds one bounded numeric field per roster player and one small
  config value, no unbounded loop or allocation.
- **TC-042** — The convocatoria queue's drag-and-drop shall remain gated by
  `isAdmin()` (TC-040) even though, unlike the existing add/quitar/dupla
  controls, it is *not* additionally gated by the `locked` flag
  (`m.inscripcionCerrada || m.estado === 'Finalizado'`, `index.html:4195`)
  — the deliberate scope of this feature (§7.8) is to bypass the *lock*
  gate, never the *admin* gate. **Defends `CWE-862` Missing Authorization**
  by keeping the one authorization check that matters unconditional, while
  explicitly documenting which other gate is intentionally not reused here.

## 5. Users & use cases

### 5.1 Personas / actors

| Actor | Description | Primary need |
|---|---|---|
| Admin | The person who manages the roster (existing `isAdmin()` role) | Arrange the player list in whatever order is most useful (e.g. drag the goalkeepers to the top, or sort by score to spot who's under-rated) |
| Jugador (viewer) | Any signed-in user viewing the roster (existing non-admin role) | See the roster ordered by position if useful, without being able to change it or see scores |

### 5.2 User stories

| ID | Story | Implements |
|---|---|---|
| US-01 | As an Admin, I want to drag a player's row to a new position in the list so the roster reflects the order I care about. | FR-010, FR-011, FR-050 |
| US-02 | As an Admin, I want to sort the roster by average score, ascending or descending, so I can quickly see who's strongest or weakest. | FR-020, FR-021, FR-022 |
| US-03 | As any user, I want to sort the roster by position, ascending or descending, so I can group goalkeepers, defenders, midfielders, and forwards together. | FR-030, FR-031 |
| US-04 | As an Admin, I want my manual order and my chosen sort mode to be the same for every admin, so the team doesn't see a different order on different devices. | FR-050, FR-051 |
| US-05 | As a Jugador (viewer), I don't want to be blocked or shown an error just because an admin left the puntaje sort active — I expect to still see a sensible order. | FR-052 |
| US-06 | As an Admin, I want to drag a player (or a dupla) up or down the titulares/suplentes convocatoria queue of a match, in any match state, so I can fix an ordering mistake or promote a suplente without removing and re-adding them. | FR-070, FR-071, FR-075 |

## 6. Glossary

| Term | Definition |
|---|---|
| Modo de orden | The currently active sort criterion for the roster: Manual, Puntaje ascendente, Puntaje descendente, Posición ascendente, or Posición descendente. |
| Orden manual | The explicit order an admin sets by dragging and dropping roster rows while modo de orden = Manual. |
| `orden` | The new numeric field this Spec introduces on each player, used to sort the roster in Manual mode. |
| `playersSortMode` | The new shared Firestore value this Spec introduces, holding the currently active modo de orden. |
| Puntaje promedio | `computeAvg(p.scores)` (existing function) — the arithmetic mean of a player's loaded scores across the four positions, ignoring positions with no score; `null` if none are loaded. |
| Convocatoria | The existing ordered list (`m.convocados`) of players called up for a match. |
| Titular / suplente | Existing derived status: the first `titularesRequeridos(m)` unidades in the convocatoria queue are "titulares"; the rest are "suplentes" — purely a function of queue order (`getTitularIds`). |
| Unidad (de convocatoria) | Existing grouping unit (`getUnidadesConvocatoria`): either one player or one dupla (two players who rotate together), always occupying exactly one slot in the queue. |



## 6.5 Sources & Origins (`MD-25`)

**Codebase evidence:**

- `index.html:496-556` (`#panelJugadores`) — pinned the existing roster
  panel markup: the static container (`#roster`), the existing search
  input and two filter selects (`#filters`, `#filtersEstado`), and that
  neither existing select carries an `admin-only` class (i.e. they are
  already visible to non-admin viewers) — the precedent this Spec's
  posición sort visibility (FR-030, not admin-gated) follows.
- `index.html:1474-1484` (`getFiltered`) — pinned the existing
  filter → search → sort pipeline this feature extends; today the sort
  step is a hard-coded alphabetical `.sort()`, which this Spec turns into
  a selectable step (TC-010).
- `index.html:1486-1538` (`renderPlayersTab`) — pinned the exact roster
  row markup (`.row`, `.badge`, `.row-main`, `.avg-chip.admin-only`) this
  feature must extend with a drag handle and keep in sync with the sort
  order.
- `index.html:1041-1046` (`computeAvg`) — pinned the existing puntaje
  average function this Spec's puntaje sort reuses (TC-011), and that it
  already returns `null` for a player with no loaded score (FR-021).
- `index.html:1153-1164`, comment at `index.html:1255` — pinned that
  `players` (public) never carries `scores`, and `playerScores`
  (admin-only) does — the reason FR-002/FR-052 gate puntaje sort and
  its fallback the way they do.
- `index.html:3434`, `index.html:3541-3551` (`window.__dragStartJugador`,
  `window.__dropOnTeam`) — pinned the only existing drag-and-drop pattern
  in the app (native HTML5, `dataTransfer.setData('text/plain', playerId)`,
  `if(playerId) window.__moverJugadorManual(...)` guard) — this Spec's
  TC-001/TC-041 reuse this exact shape for the Jugadores screen.
- `index.html:3638-3648` (`ordenarPorPosicion`, local to `renderMatchesTab`)
  — pinned the existing fixed position-order map
  (`{Arquero:0, Defensor:1, Volante:2, Delantero:3}`) this Spec's posición
  sort (TC-012) reuses for consistency between the two screens; noted that
  this helper is scoped inside `renderMatchesTab` today, not a shared
  utility — the Plan is free to extract it or duplicate the map (Plan-level
  decision, not constrained here).
- `index.html:1298` (`saveMotorConfig`), `index.html:1148` (`motorConfig`
  load, admin-gated) — pinned the existing simple-shared-config-value
  persistence pattern this Spec's `playersSortMode` persistence (FR-051)
  follows, and pinned that `motorConfig` is deliberately hidden from
  non-admin sessions — the opposite of what `playersSortMode` needs
  (TC-013).
- `index.html:1187-1203` (one-time migration flags
  `statsGanadosEmpatadosPerdidosMigrado`, `puntajeArmadoSeparadoMigrado`)
  — pinned the existing one-time-migration pattern (admin-only,
  flag-gated, re-save-once) this Spec's `orden` backfill (FR-060) follows.
- `index.html:982-995` (`window.__showToast`) — pinned the existing
  error-toast mechanism this Spec's failed-save handling (FR-053) reuses.
- `index.html:1256-1266` (`savePlayers`) — pinned that reordering must go
  through the same `savePlayers()` write path already used for every other
  player-list mutation (create, edit, delete, toggle estado), and that it
  currently only `console.error`s on failure with no user-facing feedback
  — the gap FR-053 closes for this specific new interaction.
- `tests/README.md`, `tests/motor.test.js`, `tests/layout.test.js` — pinned
  that the project has exactly two automated test suites (team-generation
  engine, responsive layout), neither of which covers the Jugadores
  roster screen; verification for this feature area is manual, matching
  the precedent set by the most recent adjacent feature (`goles en
  contra`, see below).
- `index.html:4193-4258` (`renderConvocadosList`) — pinned the existing
  titulares/suplentes queue render (§7.8): the single cut point between
  titular and suplente sections (`idx === req`, `index.html:4211`), the
  per-row markup (`.conv-row`, `index.html:4221-4227`) and the grouped
  dupla row (`.conv-row-dupla`, `index.html:4239-4256`) this feature must
  make draggable, and the `locked` computation
  (`m.inscripcionCerrada || m.estado === 'Finalizado'`, `index.html:4195`)
  that gates the existing add/quitar/dupla controls but must **not** gate
  the new drag-and-drop (FR-070, TC-042).
- `index.html:1628-1643` (`getUnidadesConvocatoria`), `index.html:1645-1647`
  (`getTitularIds`), `index.html:948` (`titularesRequeridos`) — pinned that
  titular/suplente status is purely derived from queue order, and that the
  queue is already grouped into player-or-dupla "unidades" this feature's
  drag-and-drop must move as one (TC-014).
- `index.html:4359-4367` (`window.__addToMatch`), `index.html:4369-4379`
  (`window.__removeFromMatch`) — pinned that `m.convocados` is a plain
  array mutated by `push`/`filter`, and that adding always appends at the
  end (last suplente) — the only existing ways to change queue order today,
  which this feature adds a third way to (direct reorder via drag).
- `index.html:1677-1688` (`equiposStale`) — pinned the existing staleness
  check that already compares the current titular set (`getTitularIds`)
  against a generated team's snapshot (`m.equipos.titularesSnapshot`) and
  flags a mismatch for other convocatoria changes (add/quitar/dupla) — this
  feature's FR-074 relies on this same, already-existing mechanism rather
  than introducing a new one.

**Industry-standard evidence:** CWE Top 25 (2024, retrieved live from
`https://cwe.mitre.org/top25/archive/2024/2024_top25_list.html` on
2026-08-28) applied in §4.5. No other regulatory/architectural/style
standard applies — this is a client-side hobby/community scorekeeping app
with no regulated data, no formal architecture framework, and no
`AGENTS.md`/`CLAUDE.md`/`CONTRIBUTING.md` policy file in this repo beyond
the project's own `README.md` and `Roadmap.md` (neither of which imposes
constraints beyond what's already cited above).

**Prior-art evidence:**

- `docs/goles-en-contra/GOLES_EN_CONTRA_SPEC.md` — the most recent feature
  built with this same methodology in this repo. Pinned: the Spec-without-
  Concept-Note shape this Spec follows (own §6.5 in place of an inherited
  one), the §4.5 CWE-ruling-out style, and the "manual verification, no
  new automated test" precedent for this project's test posture (§11.5
  below).
- The equipos-building drag-and-drop (`index.html:3434-3551`, cited above)
  is the direct in-repo prior art for *how* to implement drag-and-drop in
  this codebase — no external peer-product or literature research was
  performed, since the repo's own existing pattern is a stronger and more
  directly applicable precedent than generic peer-product research would
  be for a small, self-contained UI feature.

## 7. Functional requirements

### 7.1 Selector de modo de orden

- **FR-001** — The system shall add a "modo de orden" control to the
  Jugadores screen, alongside the existing search input and posición/estado
  filters, with the values Manual (default), Puntaje ascendente, Puntaje
  descendente, Posición ascendente, and Posición descendente.
- **FR-002** — Where the viewer is not admin, the system shall omit the
  Puntaje ascendente/descendente options from the control, showing only
  Manual, Posición ascendente, and Posición descendente.
- **FR-003** — When the modo de orden control's value changes, the system
  shall re-render the roster using the existing filter/search pipeline
  (`getFiltered()`), replacing its fixed alphabetical sort step with the
  sort criterion the new value selects.

### 7.2 Orden manual (drag and drop)

- **FR-010** — While modo de orden = Manual and the viewer is admin, the
  system shall render each visible roster row as draggable, reusing the
  existing native HTML5 drag-and-drop pattern (`draggable="true"`,
  `ondragstart`, `dataTransfer`).
- **FR-011** — When an admin drops a dragged row onto another row's
  position within the currently visible list, the system shall reorder the
  `orden` values of the affected players so the dragged player occupies the
  dropped position, then persist the change (FR-050).
- **FR-012** — While modo de orden ≠ Manual, the system shall render every
  row as non-draggable (no grab cursor, `draggable="false"`), so dragging
  has no effect.
- **FR-013** — If the viewer is not admin, then the system shall render
  every row as non-draggable regardless of modo de orden (manual
  reordering remains admin-only, mirroring the existing equipos
  drag-and-drop gate).

### 7.3 Orden por puntaje

- **FR-020** — When modo de orden = Puntaje ascendente/descendente, the
  system shall sort the visible list by each player's `computeAvg(p.scores)`
  value, ascending or descending respectively.
- **FR-021** — If a player's `computeAvg(p.scores)` is `null` (no score
  loaded in any position), the system shall place that player after every
  player with a computed average, regardless of sort direction.
- **FR-022** — If two players have the same computed average (including two
  players both without any score), then the system shall break the tie
  using the existing alphabetical order (apellido+nombre).

### 7.4 Orden por posición

- **FR-030** — When modo de orden = Posición ascendente/descendente, the
  system shall sort the visible list by each player's `principal` position
  using the fixed sequence Arquero, Defensor, Volante, Delantero (ascending)
  or its reverse (descending).
- **FR-031** — If two players share the same `principal` position, then the
  system shall break the tie using the existing alphabetical order
  (apellido+nombre).

### 7.5 Interacción con búsqueda y filtros existentes

- **FR-040** — The modo de orden control shall operate on top of the
  existing search (`#searchInput`) and filter (`#filters` posición,
  `#filtersEstado` estado) results — sorting is applied after filtering
  and searching, consistent with today's filter → search → sort pipeline.
- **FR-041** — When an admin reorders manually while a search term or
  posición/estado filter narrows the visible roster, the system shall
  reposition the dragged player only relative to the other players
  currently visible, and shall preserve the relative manual order of
  players not currently visible.

### 7.6 Persistencia y sincronización

- **FR-050** — The system shall persist each player's `orden` value as part
  of the existing public `players` Firestore document (via `savePlayers()`),
  so every user who loads the app sees the same manual order.
- **FR-051** — The system shall persist the currently selected modo de
  orden in a new shared Firestore value (`playersSortMode`), following the
  existing simple key-value pattern already used for `motorConfig`, so
  every user — not only admins (see TC-013) — sees the same active sort
  mode after a reload, subject to the non-admin fallback in FR-052.
- **FR-052** — If the persisted `playersSortMode` is Puntaje
  ascendente/descendente and the viewer is not admin, the system shall
  render the roster in Manual order instead (a non-admin has no access to
  `playerScores` and cannot compute the sort), without altering the
  persisted global value.
- **FR-053** — If persisting a manual reorder fails, the system shall show
  an error toast (`window.__showToast(mensaje, 'error')`) and revert the
  visible roster to the last successfully persisted order.

### 7.7 Migración de datos existentes

- **FR-060** — If a player record has no `orden` value (legacy data saved
  before this feature), then the system shall, on the next admin session
  load, assign each such player a sequential `orden` value derived from the
  current alphabetical order, then persist it once, following the existing
  one-time-migration-flag pattern.
- **FR-061** — When a new player is created, the system shall assign it an
  `orden` value that places it after every existing player (appended at the
  end of the manual order) by default.

### 7.8 Orden manual de la cola de convocatoria (titulares/suplentes)

- **FR-070** — The system shall render each unidad (an individual player or
  a dupla) in a match's convocatoria queue (`renderConvocadosList`) as
  draggable for admin, in every match state (`Inscripción abierta`,
  `Equipos generados`, `Finalizado`) — unlike the existing add/quitar/dupla
  controls on this same queue, which stay disabled once the match is
  `locked` (`m.inscripcionCerrada || m.estado === 'Finalizado'`).
- **FR-071** — When an admin drops a dragged unidad onto a new position in
  the queue, the system shall reorder `m.convocados` so that unidad
  occupies that position — moving both ids together if it is a dupla — and
  persist the change via the existing `saveMatches()` path.
- **FR-072** — The system shall not offer, on this screen, any puntaje or
  posición sort filter, or a modo de orden selector — only manual
  drag-and-drop reordering is available here (contrast with §7.1's
  Jugadores-screen control).
- **FR-073** — Reordering the convocatoria queue shall not, by itself,
  modify `m.equipos`, `m.resultado`, or any already-persisted per-player
  match statistic; it only changes `m.convocados`'s order, and therefore
  which unidad is computed as titular vs suplente going forward
  (`getTitularIds`/`titularesRequeridos`).
- **FR-074** — If reordering causes the computed titular set
  (`getTitularIds`) to differ from an already-generated team's snapshot
  (`m.equipos.titularesSnapshot`), then the system shall surface that
  mismatch via the existing `equiposStale` staleness detection, exactly as
  it already does for other convocatoria changes (add/quitar/dupla) — no
  new staleness mechanism is introduced.
- **FR-075** — The convocatoria drag-and-drop handler shall be reachable
  only when the viewer is admin (`isAdmin()`); non-admin viewers see the
  existing read-only queue with no drag affordance, in every match state.

## 8. Non-functional requirements

No quantified NFR applies. This is a small, purely client-side, in-memory
sort/reorder feature layered on an existing render path; there is no
server-side processing and no latency budget distinct from what the
existing roster render already meets. NFR-001 below is a qualitative
ruling, not a quantified target, and AC-51 explicitly marks it not
applicable for that reason.

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Switching modo de orden or completing a drag-and-drop reorder shall re-render the visible roster with no perceptible delay (client-side, in-memory sort/re-render, no network round-trip required before the new order is shown) for roster sizes typical of this app (tens of players). |
| NFR-002 | Reliability | See FR-053 — a failed persist shall be surfaced to the admin and shall not leave the visible roster silently diverged from the persisted state. |
| NFR-003 | Security | See §4.5 TC-040/TC-041. |
| NFR-004 | Privacy / compliance | None — see §4.3. |
| NFR-005 | Observability | None — the app has no telemetry/observability layer for any existing feature; this feature does not introduce one either. |
| NFR-006 | Accessibility | No keyboard-only or screen-reader-accessible alternative to drag-and-drop is required — this mirrors the existing equipos-screen limitation (§3.2, A-05). The modo de orden `<select>` itself follows the existing accessible-by-default pattern of `#filters`/`#filtersEstado`. |
| NFR-007 | i18n / localisation | None — the app is Spanish-only throughout; this feature follows suit. |
| NFR-008 | Cost | None — no new infrastructure or paid service is introduced. |
| NFR-009 | Scalability | None beyond the app's existing roster size assumptions (a single amateur league's plantel, already small). |
| NFR-010 | Maintainability | Puntaje and posición sort logic shall reuse `computeAvg` and the existing position-order map rather than duplicating the calculation a third time (TC-011/TC-012). |

## 9. System behaviour & scenarios

### 9.1 Happy path scenarios

#### Scenario S-01 — Reordenar manualmente por drag and drop (covers FR-010, FR-011, FR-050)

- **Given** un admin viendo el listado de Jugadores en modo de orden Manual
- **And** al menos tres jugadores visibles
- **When** el admin arrastra el segundo jugador de la lista y lo suelta en la primera posición
- **Then** el sistema reordena los valores de `orden` para que ese jugador quede primero
- **And** persiste el nuevo orden en el documento `players` de Firestore

**Variants:**

- `S-01a [boundary]` — el admin arrastra el último jugador visible hasta la primera posición → queda primero, y todos los demás se corren un lugar.
- `S-01b [boundary]` — el admin suelta un jugador exactamente sobre su propia posición actual (no se mueve) → el sistema no persiste ningún cambio.
- `S-01c [failure]` — `savePlayers()` falla (ej. sin conexión) → el sistema muestra un toast de error (FR-053) y revierte visualmente al último orden persistido con éxito.
- `S-01d [concurrency]` — dos admins arrastran jugadores casi al mismo tiempo desde dos sesiones distintas → gana el último `savePlayers()` en completarse (same last-write-wins semantics as every other field in `players` today; no optimistic-locking mechanism exists or is introduced).
- `S-01e [property]` — para cualquier secuencia de arrastres, el conjunto de jugadores visibles antes y después es exactamente el mismo (ningún jugador se pierde, se duplica, ni cambia de identidad).

#### Scenario S-02 — Ordenar por puntaje descendente (covers FR-020, FR-021, FR-022)

- **Given** un admin viendo el listado de Jugadores, con jugadores de distintos promedios de puntaje cargados
- **When** el admin selecciona "Puntaje descendente" en el modo de orden
- **Then** el sistema muestra el listado ordenado de mayor a menor promedio (`computeAvg`)
- **And** los jugadores sin ningún puntaje cargado aparecen al final, después de todos los que sí tienen promedio

**Variants:**

- `S-02a [boundary]` — todos los jugadores visibles tienen el mismo promedio → el orden resultante es el alfabético existente (FR-022).
- `S-02b [boundary]` — ningún jugador visible tiene puntaje cargado → el listado se muestra completo, en orden alfabético (todos "sin puntaje").
- `S-02c [property]` — para cualquier conjunto de jugadores con puntaje, aplicar "Puntaje ascendente" y luego "Puntaje descendente" produce exactamente el orden inverso entre los jugadores con promedio, con los jugadores sin puntaje siempre al final en ambos casos.

#### Scenario S-03 — Ordenar por posición ascendente (covers FR-030, FR-031)

- **Given** un admin o un jugador viendo el listado de Jugadores con jugadores de distintas posiciones principales
- **When** el usuario selecciona "Posición ascendente" en el modo de orden
- **Then** el sistema muestra el listado agrupado Arquero, luego Defensor, luego Volante, luego Delantero
- **And** dentro de cada posición, los jugadores aparecen en el orden alfabético existente (FR-031)

**Variants:**

- `S-03a [boundary]` — todos los jugadores visibles comparten la misma posición principal → el orden resultante es puramente el alfabético existente.
- `S-03b [property]` — "Posición descendente" produce exactamente el orden inverso de grupos de posición respecto de "Posición ascendente" (Delantero, Volante, Defensor, Arquero), preservando el orden alfabético dentro de cada grupo.

#### Scenario S-04 — Cambiar el modo de orden deshabilita el drag and drop (covers FR-012, FR-003)

- **Given** un admin en modo de orden Manual, con filas arrastrables
- **When** el admin selecciona "Puntaje ascendente"
- **Then** el listado se reordena por puntaje
- **And** ninguna fila queda arrastrable (sin cursor de agarre, `draggable="false"`)

**Variants:**

- `S-04a [boundary]` — el admin vuelve a seleccionar "Manual" → las filas vuelven a ser arrastrables y el listado muestra el último orden manual guardado (no el orden por puntaje que se acaba de abandonar).

#### Scenario S-05 — Un jugador (no-admin) ve el listado cuando el modo global es puntaje (covers FR-002, FR-013, FR-052)

- **Given** un admin dejó el modo de orden global en "Puntaje descendente"
- **When** un usuario no-admin abre la pantalla de Jugadores
- **Then** el sistema no le muestra las opciones de puntaje en el control (FR-002)
- **And** le muestra el listado en el orden Manual persistido, sin arrastrable, sin error visible (FR-052)
- **And** no modifica el valor global `playersSortMode` que el admin dejó configurado

**Variants:**

- `S-05a [failure]` — el mismo caso, pero además el jugador intenta forzar `draggable` desde herramientas de desarrollador → el drop es rechazado igualmente por el gate `isAdmin()` del lado del handler (FR-013, TC-040), no solo por el atributo visual.

### 9.2 Edge cases

#### Scenario S-06 — Reordenar con búsqueda o filtro activo (covers FR-040, FR-041)

- **Given** un admin en modo de orden Manual con el filtro de posición aplicado en "Defensor" (mostrando solo 4 de 20 jugadores)
- **When** el admin arrastra el tercer defensor visible a la primera posición del subconjunto filtrado
- **Then** el sistema reordena el `orden` relativo de esos 4 defensores para reflejar el nuevo lugar del jugador arrastrado
- **And** el orden relativo de los otros 16 jugadores no visibles permanece sin cambios

**Variants:**

- `S-06a [boundary]` — el filtro deja un solo jugador visible → arrastrarlo (soltarlo sobre sí mismo) no produce ningún cambio.
- `S-06b [property]` — al quitar el filtro después de reordenar el subconjunto, el listado completo respeta tanto el nuevo orden relativo de los jugadores reordenados como el orden relativo preexistente de los que quedaron fuera del filtro.

#### Scenario S-07 — Migración de jugadores sin `orden` (covers FR-060, FR-061)

- **Given** un plantel guardado antes de esta feature, donde ningún jugador tiene el campo `orden`
- **When** un admin carga la app por primera vez después del despliegue de esta feature
- **Then** el sistema asigna a cada jugador un `orden` secuencial derivado del orden alfabético actual, y lo persiste una sola vez
- **And** en cargas posteriores no repite la migración (flag `ordenJugadoresMigrado` ya en `true`)

**Variants:**

- `S-07a [boundary]` — un plantel vacío (sin jugadores) → la migración no tiene nada que asignar y marca el flag igualmente, sin error.
- `S-07b [boundary]` — se crea un jugador nuevo después de la migración → recibe un `orden` que lo ubica al final de todos los existentes (FR-061), no en medio de la secuencia migrada.

#### Scenario S-08 — Reordenar la cola de convocatoria de un partido (covers FR-070, FR-071, FR-073, FR-074)

- **Given** un admin viendo la convocatoria de un partido con 5 titulares requeridos y 8 convocados
- **When** el admin arrastra el primer suplente (posición 6) y lo suelta en la posición 5
- **Then** el sistema reordena `m.convocados` para que ese jugador pase a titular y el que ocupaba la posición 5 pase a suplente
- **And** ni `m.equipos` ni `m.resultado` se modifican como efecto de este reordenamiento (FR-073)

**Variants:**

- `S-08a [boundary]` — el partido está en estado `Finalizado` → el admin puede igual reordenar la convocatoria (FR-070); no se recalcula ni se altera ningún gol/asistencia ya cargado.
- `S-08b [boundary]` — la unidad arrastrada es una dupla → ambos integrantes se mueven juntos a la nueva posición, sin separarse.
- `S-08c [boundary]` — el partido ya tiene equipos generados (`m.equipos` existe) y el reordenamiento cambia el conjunto de titulares respecto del `titularesSnapshot` guardado → `equiposStale(m)` pasa a `true`, igual que ya ocurre hoy al agregar/quitar un convocado (FR-074).
- `S-08d [failure]` — un usuario no-admin intenta iniciar un drag (por ejemplo, forzando el atributo desde herramientas de desarrollador) → el handler de drop rechaza la operación por el gate `isAdmin()` (FR-075, TC-042), sin mutar `m.convocados`.
- `S-08e [property]` — para cualquier secuencia de arrastres, el conjunto de unidades (jugadores y duplas) en la cola antes y después es exactamente el mismo — ninguna se pierde, se duplica, ni cambia de identidad.

### 9.3 Failure / unwanted-behaviour scenarios

No hay escenarios de falla sin contraparte de camino feliz: el único modo de
falla identificado (falla al persistir un arrastre) es un `[failure]`
variant de S-01 (`S-01c`), y los intentos de forzar un drop como no-admin
son `[failure]` variants de S-05 (`S-05a`, listado de Jugadores) y S-08
(`S-08d`, convocatoria).

## 10. Data model & external contracts

### 10.1 Domain entities (conceptual)

Ninguna entidad nueva — esta feature extiende una entidad ya existente con
un campo adicional, y agrega un único valor de configuración compartido (no
una entidad con relaciones/cardinalidad propia).

| Entity | Purpose | Key attributes (conceptual) | Lifecycle |
|---|---|---|---|
| Jugador (existente, extendida) | Ficha de un jugador del plantel | `orden` (nuevo, numérico) además de los campos existentes (`nombre`, `apellido`, `principal`, `secundarias`, `estado`, `scores`) | `orden` se asigna al crear el jugador (FR-061) o al migrar datos legacy (FR-060); se actualiza al arrastrar en modo Manual (FR-011) |
| `playersSortMode` (nuevo, valor único de configuración — no es una entidad de dominio con identidad o relaciones propias, es un escalar compartido análogo a `motorConfig`) | Modo de orden actualmente activo, compartido por todos los usuarios | Un valor entre `manual` / `puntaje_asc` / `puntaje_desc` / `posicion_asc` / `posicion_desc` | Se crea con valor por defecto `manual`; se actualiza al cambiar el selector (FR-051) |
| Convocatoria de un partido (existente, sin cambios de esquema) | Cola ordenada de jugadores/duplas convocados a un partido (`m.convocados`) | Sin campos nuevos — el orden del array existente pasa a poder cambiarse también por drag and drop, además de por alta/baja (FR-071) | Se reordena al arrastrar una unidad (FR-071); el corte titular/suplente (`getTitularIds`) se recalcula a partir del nuevo orden |

#### 10.1.1 Entity-relationship diagram

No requerido — esta feature no introduce ninguna entidad de dominio nueva
con identidad y relaciones propias (ver §10.1). `orden` es un atributo
hermano de campos ya existentes en Jugador, sin relación nueva a modelar; y
`playersSortMode` es un valor de configuración escalar sin relaciones,
igual que el ya existente `motorConfig` (que tampoco se modela como
entidad en ninguna spec previa de este repo).

### 10.2 External APIs / events the feature consumes

None — no external API is consumed by this feature.

### 10.3 External APIs / events the feature exposes

None — no new API/event is exposed; persistence continues through the
existing Firebase document write path (`players` document gains `orden` per
player; a new small `playersSortMode` document/key is added alongside the
existing `motorConfig`-style values).

## 11. Acceptance criteria

### 11.1 Functional acceptance

- **AC-01** — All scenarios in §9.1/§9.2 (S-01 through S-08) and their
  variants pass against a fresh load of the app (covers FR-001–FR-075).
- **AC-02** — A plantel saved before this feature existed (no player has an
  `orden` field) loads, migrates once (FR-060), and displays a sensible
  default order without error.

### 11.2 Non-functional acceptance

- **AC-10** — NFR-001 verified by manually confirming a reorder or sort-mode
  switch reflects on screen without a visible network-wait delay.
- **AC-11** — NFR-002/FR-053 verified by simulating a `savePlayers()`
  failure (e.g. temporarily disconnecting) and confirming the toast appears
  and the visible order reverts.

### 11.3 Constraint compliance

- **AC-15** — TC-001/TC-010/TC-011/TC-012/TC-013/TC-014/TC-015/TC-030/TC-031
  verified by code review against the cited `index.html` locations.
- **AC-16** — TC-040/TC-041/TC-042 verified by code review confirming every
  new mutation path (Jugadores drag, convocatoria drag) sits behind the
  existing `isAdmin()` gate, validates the dragged id against the currently
  visible list before mutating, and — for the convocatoria queue
  specifically — intentionally skips the `locked` check while still
  requiring `isAdmin()`.

### 11.4 Negative / safety acceptance

- **AC-20** — Scenario S-05a (a non-admin attempting to force a drop)
  produces no mutation of `orden` or `players`, as observed by manual
  testing with a non-admin session.
- **AC-21** — Scenario S-08d (a non-admin attempting to force a convocatoria
  drop) produces no mutation of `m.convocados`, as observed by manual
  testing with a non-admin session; and S-08a (reordering a `Finalizado`
  match) produces no change to that match's `m.equipos` or `m.resultado`
  (FR-073).

### 11.5 Test & traceability obligations

- **AC-50** — Every scenario in §9 — including every variant — has at
  least one verification referenced in the Plan's §12.1 *Scenario
  Traceability Matrix*. **Explicit ruling for this Spec:** this feature
  area has no automated test coverage today (§6.5 — only
  `tests/motor.test.js` and `tests/layout.test.js` exist, neither of which
  touches the Jugadores roster screen), matching the precedent set by the
  most recent adjacent feature (`goles en contra`,
  `docs/goles-en-contra/GOLES_EN_CONTRA_SPEC.md` §11.5). This Spec
  therefore interprets AC-50's "runnable test" obligation, for this
  feature only, as satisfied by a **named, repeatable manual verification
  procedure** (exact steps + expected observation) in the Plan's §12.1
  `Test` column, rather than requiring net-new test-framework
  infrastructure out of proportion to the feature. The Plan is free to add
  an automated test instead if it finds a low-cost way to do so (e.g. a
  pure-function unit test for the sort comparators), but is not required
  to. Every §9 scenario heading is followed by a `Variants:` block or an
  explicit `Variants: none` declaration (both present above).
- **AC-51** — Not applicable — no NFR in §8 carries a quantified numeric
  target (NFR-001 is a qualitative "no perceptible delay" claim, verified
  manually per AC-10).
- **AC-52** — Every TC in §4 has a §11.3 compliance check (AC-15/AC-16
  above) and a corresponding Plan §12 entry naming the reviewer/checklist
  that verifies it (all TCs here are code-review-verifiable, not
  CI-mechanizable, since the project has no CI pipeline or lint rule
  infrastructure for this kind of constraint).
- **AC-53** — The Plan's §12.2 *Impact Traceability* shall include at least
  one `IMP-*` row for the `code` scope (the roster render/sort pipeline and
  the equipos-screen drag pattern being reused) and one for the `business`
  scope (existing players get a one-time reassigned `orden`; the
  previously-implicit "always alphabetical" behaviour changes to "Manual by
  default, using the migrated alphabetical snapshot" — a one-time, visible
  but non-destructive change) — plus one additional `business`-scope
  `IMP-*` row for §7.8's ability to change a `Finalizado` match's
  titular/suplente record after the fact (non-destructive per FR-073/A-06,
  but a new capability on previously-immutable historical data).
- **AC-54** — Not applicable — no quantified NFR exists to bind an `OBS-*`
  signal to; the app has no observability layer for any existing feature
  (§8 NFR-005).
- **AC-55** — Supply-chain: none — this feature adds no new dependency; the
  project has no package manifest/lockfile (`package.json` absent from the
  repo root at Spec time).

## 12. Success metrics

No production success metrics apply — this is an internal roster-management
utility for a private amateur league with no analytics/adoption tracking
infrastructure (consistent with every other feature in this app).

## 13. Dependencies

- **Upstream services / specs:** none required to function. Related
  existing specs in this repo, cited for context only (their content was
  not read in detail for this Spec):
  `.specify/specs/002-gestion-jugadores`,
  `.specify/specs/007-permisos-por-usuario`.
- **Internal modules / teams:** none — single maintainer, single file. §7.8
  depends internally on the existing `getUnidadesConvocatoria`,
  `getTitularIds`, `titularesRequeridos`, and `equiposStale` functions
  (`index.html:948-1688`).
- **Feature flags / config:** none — the app has no feature-flag mechanism;
  this feature ships directly, matching every prior feature in this repo.
- **Third-party APIs:** none new — existing Firebase persistence only.

## 14. Assumptions

- **A-01** — "Puntaje" for sorting means `computeAvg(p.scores)`, the average
  of a player's loaded per-position scores — confirmed with the user during
  Spec authoring (as opposed to their principal-position score alone, or
  their best score across positions).
- **A-02** — Drag-and-drop is only meaningful, and only enabled, while modo
  de orden = Manual; selecting a Puntaje or Posición sort disables dragging
  until the admin switches back to Manual — confirmed with the user during
  Spec authoring.
- **A-03** — The manual order and the active modo de orden are shared
  global state (Firestore), not a per-device or per-admin local preference
  — confirmed with the user during Spec authoring.
- **A-04** — Drag-and-drop and the Puntaje sort options are admin-only,
  confirmed with the user. `[INFERRED]` The Posición sort options are
  available to every user, since the principal position is already public
  data today (`#filters`, visible to non-admin, index.html:505-511 has no
  `admin-only` class) — this half is inferred from that existing
  visibility, not directly confirmed by the user, and is flagged here for
  explicit review before the Plan builds against it.
- **A-05** — The lack of a keyboard-accessible drag-and-drop alternative is
  an accepted limitation, consistent with the existing equipos-screen
  drag-and-drop, which has the same gap today.
- **A-06** — Reordering the convocatoria queue (§7.8) does not retroactively
  alter `m.equipos` or `m.resultado` — it only changes future computation
  of titular/suplente membership and interacts with the existing
  `equiposStale` warning, exactly like every other existing convocatoria
  change (add/quitar/dupla) already does — confirmed with the user as
  "solo el drag and drop" (no other side effect requested).
- **A-07** — Allowing the convocatoria drag-and-drop in every match state,
  including `Finalizado`, is intentional — confirmed with the user
  explicitly ("en cualquiera de los estados del partido"), unlike
  add/quitar/dupla, which remain locked once the match is closed or
  finalized.

## 15. Risks

| Risk | Severity | Likelihood | Spec-level mitigation |
|---|---|---|---|
| The one-time `orden` migration (FR-060) runs from two different admin sessions nearly simultaneously, producing two different alphabetical snapshots as the "starting" manual order | Low | Low | Same last-write-wins profile the app already accepts for every other field in `players`; FR-060 explicitly follows the existing migration-flag pattern, which has the same known limitation today |
| A non-admin is confused by the roster looking "unsorted" (Manual) when they know an admin set a Puntaje sort | Low | Med | FR-052 makes the fallback explicit and silent by design (no error); Plan may add a subtle UI note if useful (see OPEN-Q-03) |
| Native HTML5 drag-and-drop behaves inconsistently on touch/mobile devices | Med | Med | Same accepted limitation as the existing equipos-screen drag-and-drop (A-05); not resolved by this feature |
| An admin reorders the convocatoria of a `Finalizado` match, and a viewer perceives this as "rewriting history" even though no stat/result is touched (A-06) | Med | Low | FR-073 makes the no-side-effect guarantee explicit; Plan may add a confirmation or a subtle "solo reordena, no afecta el resultado" note for the `Finalizado` case (OPEN-Q-04) |
| `equiposStale` (FR-074) starts firing on `Finalizado` matches where teams can no longer be regenerated anyway, producing a warning with no actionable next step | Low | Med | Plan must verify whether the "regenerate equipos" affordance is already hidden for `Finalizado` matches (so the flag becomes purely informational there); flagged as OPEN-Q-05 |

## 16. Open questions

| ID | Question | Owner | Target stage | Notes |
|---|---|---|---|---|
| OPEN-Q-01 | Exact visual affordance for the drag handle (a dedicated grip icon vs. the whole row being draggable, as equipos does today) | Lucas Manoukian | Implementation Plan | UX detail with no behavioral consequence |
| OPEN-Q-02 | Exact drop-target semantics (insert before/above vs. below the target row based on cursor position, vs. explicit drop zones as in equipos) | Lucas Manoukian | Implementation Plan | Affects implementation approach, not the FR-011 contract |
| OPEN-Q-03 | Whether to show any hint to a non-admin viewer when FR-052's fallback applies (silent vs. a subtle note) | Lucas Manoukian | Implementation Plan | Low-stakes UX polish decision |
| OPEN-Q-04 | Whether reordering a `Finalizado` match's convocatoria should show any confirmation/warning, given it's an unusual action on a closed record | Lucas Manoukian | Implementation Plan | UX polish; behavior itself (no side effect) is settled by FR-073/A-06 |
| OPEN-Q-05 | Whether the `equiposStale` warning should be suppressed/hidden specifically for `Finalizado` matches, since teams can't be regenerated there | Lucas Manoukian | Implementation Plan | Affects display only, not FR-074's underlying mechanism reuse |

## 17. Handoff to the Implementation Plan

- **Plan must respect (no relitigation):** every FR-* (§7), every TC-* (§4),
  every AC-* (§11, including the §11.5 test-obligation gates), and A-01
  through A-07 (§14).
- **Plan has freedom over:** exact function/helper names and file
  organization within `index.html`, the visual design of the drag handle
  and drop feedback (OPEN-Q-01/02), whether `ordenarPorPosicion`'s map is
  extracted into a shared helper or duplicated for the Jugadores screen
  (TC-012 scope), the exact naming of the migration flag key
  (`ordenJugadoresMigrado` used above is illustrative, not mandated), and
  whether the convocatoria drag-and-drop (§7.8) reuses the same generic
  drag-start/drop handler pair as Jugadores or introduces its own
  (TC-014/TC-015 constrain behavior, not code sharing).
- **Plan must resolve:** OPEN-Q-01 through OPEN-Q-05.

## 18. Change log

| Date | Author | Change |
|---|---|---|
| 2026-08-28 | Lucas Manoukian | Initial draft. Self-critique: passed (0🔴 / 5🟡 / 1🔵) — fixed EARS pattern misuse in FR-013/FR-022/FR-031/FR-060 (changed "Where" to "If…then" for conditional-consequence FRs), added TC-013 to make explicit that `playersSortMode` must be readable by non-admin sessions (unlike `motorConfig`, which is deliberately admin-only) since FR-052 depends on it, tagged the inferred half of A-04 with `[INFERRED]`, added a qualitative-NFR disclaimer to §8 matching the goles-en-contra precedent, clarified §10.1.1's reasoning for why `playersSortMode` doesn't need an ER diagram, and softened §13's claim about `.specify/specs/002-gestion-jugadores`/`007-permisos-por-usuario` (cited for context, not verified as active dependencies). |
| 2026-08-28 | Lucas Manoukian | Expanded scope per user request: added §7.8 (drag-and-drop reordering of the match convocatoria's titulares/suplentes queue, available to admin in every match state, including `Finalizado`, unlike the existing locked add/quitar/dupla controls). Added FR-070–FR-075, TC-014/TC-015/TC-042, Scenario S-08 with 5 variants, A-06/A-07, two new risks, two new open questions (OPEN-Q-04/05), and updated §3.1/§3.2 scope (the prior non-goal claiming drag-and-drop was exclusive to Jugadores is now corrected). Self-critique: skipped for this iteration — the added content mirrors the already-reviewed §7.1–§7.7 shape closely (same TC-040/TC-041 authorization pattern, same GWT/Variants discipline), and the user is present to review directly. |

---

*This Spec defines what the system shall do, how it shall behave, and which
solutions are admissible. Concrete implementation choices (module layout,
file paths, design patterns, library picks within TC-* limits) live in
[ORDEN_JUGADORES_IMPLEMENTATION_PLAN.md](./ORDEN_JUGADORES_IMPLEMENTATION_PLAN.md).*
