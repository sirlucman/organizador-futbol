# Product app UI kit

A click-through recreation of the in-product Football App surface, assembled from the design
system's own components.

**Open `index.html`.**

## Screens

| File | Surface |
|---|---|
| `AppShell.jsx` | 248px white sidebar with `SidebarNavRow`s + sticky header (search `TextInput`, `IconButton`, primary `Button`) over the sage content area |
| `DashboardScreen.jsx` | Four stat `Card`s (all four fills), fixtures `DataTable`, `TeamCompositionCard`, `MatchSummary` |
| `SquadScreen.jsx` | Squad `DataTable` with row selection, detail `Card`, `EmptyState` when a search returns nothing |
| `MatchesScreen.jsx` | `MatchPlannerCard` + lineup `Card` + `MatchSummary`, plus a results `DataTable` |
| `PlayerReportScreen.jsx` | Ink report header `Card`, ratings `DataTable`, availability `Card`, minutes readout |

## What is interactive

- Sidebar switches screens; the active row shows the pale-green fill and green indicator bar.
- Header search filters the squad table live and jumps to Squad; clearing it restores the list.
  Typing a name that matches nothing shows the `EmptyState`.
- Squad rows select (pale-green fill) and "Open report" navigates to the player report.
- "Add player" opens the `Modal`; confirming raises a `Toast`.
- The match planner swaps home/away, picks a formation and a captain, then raises a `Toast` and
  updates the lineup card and summary.

## Source note

No product code, screenshots or Figma file were supplied — only the token/component spec in
`uploads/Football_app_Design_System.md`. Every screen is therefore built strictly from surfaces
that spec names (app-shell row, data-table cell, cards, match planner, modal, toast, empty state)
and nothing else. Screen-level information architecture in the real product is unknown; treat the
layout here as a faithful use of the system rather than a copy of a real view.
