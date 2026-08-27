# Marketing site UI kit

A click-through recreation of the Football App marketing surface, composed entirely from the
design system's own components — no primitive is re-implemented here.

**Open `index.html`.**

## Screens

| File | Surface |
|---|---|
| `MarketingShell.jsx` | Sticky white `NavBar` + dark `Footer`, wrapping every page |
| `LandingPage.jsx` | Sage `HeroBand` with the `MatchPlannerCard` aside · 3-up feature `Card`s · squad-balance band with `TeamCompositionCard` · dark `HeroBand` CTA |
| `PricingPage.jsx` | Three `PricingTier`s (one featured) + a plan-comparison `DataTable` |
| `SignInPage.jsx` | `AuthFormCard` with `TextInput`s, live email validation |

## What is interactive

- Nav links switch pages; the active link carries the Football-green underline.
- "Create team" (nav, hero, pricing, CTA band) opens the `Modal`; confirming raises a `Toast`.
- The hero's `MatchPlannerCard` selects teams, swaps home/away, picks a formation and raises a toast.
- Sign-in validates the email field and shows the inline error treatment.

## Source note

The supplied spec (`uploads/Football_app_Design_System.md`) documented surfaces and tokens but
included **no screenshots, no page structure and no marketing copy**. Page composition here follows
only what the spec names — hero band → content bands → tiers → dark footer — and the copy follows the
CONTENT FUNDAMENTALS section of the root `readme.md`. Nothing was invented visually. Real product
screens would very likely reorder or extend these sections.
