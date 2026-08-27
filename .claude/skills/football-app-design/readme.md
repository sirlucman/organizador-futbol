# Football App Design System

A design system for **Football App** — a football (soccer) team-management product covering
squad management, player evaluation, match planning and sports dashboards.

The identity is one decision, held everywhere: a single vivid **Football green `#85b632`** accent,
sitting on a **sage-tinted canvas `#f1f5f9`** with **near-black ink `#111827`** type, set in
**Inter at weight 900** for every display line. Everything is rounded to **24px**. There is no
second accent and no gradient. It reads like a calm editorial sports product rather than a
scoreboard.

---

## Sources

Everything in this project derives from a single supplied document:

- `uploads/Football_app_Design_System.md` — an alpha-version design-system spec
  (`name: Football-app-design-system`) containing a token front-matter block (colors, typography,
  rounded, spacing, components) followed by prose guidance, a component catalogue, an
  auto-derived "Examples (illustrative)" block, and a Do's / Don'ts list.

No codebase, Figma file, repository, screenshots, slide deck, logo, or font binaries were
supplied, and the brand owner has confirmed that **no logo, icon set or product screenshots
exist** — so none were created here. Every numeric value here is copied verbatim from that spec — including its unrounded
line-heights (`107.1px`, `81.6px`, `70.5px`, `38.4px`, `31.2px`) and its odd `47px` /
`-0.108px` display-lg step. Nothing has been snapped to a 4/8px grid.

The typeface question is settled: the display face **is Inter** (confirmed), so the system runs on
one family in two weights. See **Caveats & substitutions** for what remains derived.

---

## Products & surfaces

The spec describes two distinct surfaces, and both are recreated as UI kits:

1. **Marketing site** (`ui_kits/marketing/`) — the hero band with the signature match-planner
   card, feature bands, plan tiers, sign-in, dark footer.
2. **The product app** (`ui_kits/app/`) — app shell with a sidebar, dashboard, squad table,
   match planner and player report.

> Because no product screenshots or code were supplied, the kits assemble **only** surfaces the
> spec documents by name (hero band, content band, cards, match planner, data table, tiers, auth
> card, modal, toast, empty state). No screen type was invented beyond arranging those surfaces.

---

## Content fundamentals

**Voice.** Plain, declarative, coach-to-coach. The spec's own register is instructive and
unhedged ("Reserve Football green for every primary CTA", "Don't render the hero in weight 700 or
lighter"), and product copy follows the same discipline: say the thing, then stop.

**Person.** Address the user as **you**; never "we". The product does not narrate itself.
- Yes: "Ask once, see who is fit."
- Yes: "Two players unavailable — check the squad before Saturday."
- No: "We'll help you manage your squad!"

**Casing.** Sentence case everywhere — headlines, buttons, nav, table headers as rendered copy.
The *only* uppercase in the system is the tracked 12px eyebrow / table-header treatment
(`--type-eyebrow` + `--letter-spacing-eyebrow`), and that is a typographic device, not a writing
style: author the string in sentence case and let CSS raise it.

**Length.** Headlines are one clause, ideally under 45 characters — at 126px a hero line has room
for about four words. Sub-heads cap at ~52 characters wide (`52ch`); body copy at `58ch`; empty-state
captions at `44ch`.

**Punctuation.** No exclamation marks. No em-dash pile-ups; one per sentence at most. Numbers are
digits, always (`4-3-3`, `24 registered`, `8 / 8`). Times are 24-hour with a bare colon
(`Saturday 15:00`). Money keeps its currency symbol and no decimals when whole (`£120`).

**Football vocabulary is the domain language** and should be used precisely rather than softened:
squad, fixture, kickoff, formation, lineup, availability, suspension, clean sheet, matchday.
Positions are abbreviated in tables (GK, CB, LB, CM, ST) and spelled out in prose.

**Labels.** Buttons are verb-first and two words or fewer: "Create team", "Plan match",
"Confirm match", "Add player", "Save draft". Nav items are single nouns: Squad, Matches, Training,
Reports. Table headers are single words: Player, Pos, Rating, Status.

**Empty and error states** state the fact, then the next action. No apology, no blame.
- Empty: "No players yet — add your first player or import a squad sheet."
- Error: "Enter a full club email address." (not "Oops! Something went wrong")

**Emoji: never.** The spec contains none and the register does not support them. Status is carried
by badges and the semantic palette, not by 🟢/🔴.

---

## Visual foundations

### Colour

One accent. **Football green `#85b632`** is the primary-action colour and appears as: the CTA pill
fill, the active-nav indicator, the wordmark on dark grounds, progress fills, and display type on
the ink hero. It is never used as a page background behind a green CTA, and never as a success
indicator — the positive family (`#16a34a` / `#166534`) exists for that.

Surfaces cycle in exactly two tones: **sage `#f1f5f9`** page canvas and **white `#ffffff`** cards.
The ink `#111827` surface is the third, used sparingly for the footer, one polarity-flipped card,
or one dark hero band per page. Text ladders ink → `#374151` body → `#6b7280` mute.

A full semantic palette exists for in-product status (positive / warning / negative, each with a
pressed step, plus `#450a0a` as the dark ground for negative callouts). The semantic green
(`#16a34a`) is deliberately **not** the brand green — it is cooler and bluer, which keeps a success
indicator legible next to a turf-green CTA. Two tertiary accents
(`#fb923c` peach, `#38bdf8` sky) are for illustration and charting only — never chrome, never CTAs.

### Type

Inter carries the whole system in two weights. **900** for display (126 / 96 / 64 / 40 px) and
**600** for sub-display, labels and buttons; **400** for body. The 47px `display-lg` step is the
one deliberate exception — weight 400 at a 70.5px line-height, used as a lighter sub-display.
Letter-spacing is negative and small at the sub-display sizes (−0.96px at 32px, −0.48px at 24px)
and zero on everything at weight 900.

Body copy is `font-feature-settings: "calt"`. Numerals are tabular anywhere they align in columns.

### Spacing & layout

4px base unit: 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48. Cards are padded 24px, bands 48px vertical /
24px horizontal, buttons 12/24, inputs 12/16, badges 4/12, table cells 12/16. Containers cap at
**1200px** and centre. Breakpoints: <768 mobile (hero stacks, grids 1-up), 768–1023 tablet (grids
2-up), ≥1024 desktop (hero splits headline-left / planner-right, grids 2- and 3-up). Buttons render
~48px tall, so every control clears the touch-target minimum.

The hero's split is the system's signature layout: heavy headline left, the bordered match-planner
card right. Only the top nav is fixed (`position: sticky`); nothing else pins.

### Backgrounds & imagery

Flat colour fields, full-bleed bands, no gradients, no textures, no patterns, no noise or grain.
Photography is sparse by design — the spec prefers illustrative SVG and product mockups placed
*inside* cards over hero photography. When photography is used, keep it cool-neutral to match the
sage canvas (a warm, saturated sports-photo treatment fights the palette) and crop it inside a
24px-radius card rather than bleeding it behind type. Small thumbnails (club crests, flags) sit
inside rows at pill or full radius.

### Borders, elevation & shadow

Three levels, and the first two carry almost everything:

- **Level 0 — flat.** No border, no shadow. The default for cards and bands.
- **Level 1 — hairline.** 1px solid ink `#111827`. Only three things get it: tertiary buttons,
  text inputs, and the match-planner card. A visible border is a signal, not decoration.
- **Level 2 — surface contrast.** A white card on the sage canvas. The contrast *is* the elevation.

Inside cards, dividers are 1px `#f1f5f9` (sage) — never a grey rule. The one exception is the
total row of a match summary, which sits above a 1px ink rule.

Shadows are **derived, not specified**: the source asked for an "elevated shadow" on the modal and a
"medium shadow" on the toast without giving values, so `--shadow-overlay` and `--shadow-floating`
are soft ink-tinted lifts used *only* on floating surfaces. Nothing anchored to the page gets a shadow.

### Corner radii

24px (`--radius-xl`) is canonical: every card, every button. 16px for mid-size cards, 12px for
inputs and small chrome, 8px for sidebar rows and inline pills, `9999px` for badges and circular
icon buttons. 0px only for full-bleed bands. Nothing in the UI is ever square-cornered.

### Transparency & blur

Effectively unused. The system has no glass, no backdrop blur, no translucent overlays other than
the modal scrim (`rgb(17 24 39 / 0.4)`) and two opacity steps on the ink footer (72% tagline, 82%
links, a 12%-white divider). If you find yourself reaching for blur, reach for surface contrast instead.

### Motion & interaction states

The source documents no motion, so the tokens here are **derived** and deliberately restrained:
140ms for interactive feedback, `cubic-bezier(0.22, 0.61, 0.36, 1)`, colour and opacity only. No
bounce, no spring, no slide-in decoration, no parallax.

- **Hover** lightens: primary → `#a4cf49`; secondary sage → pale green; tertiary white → sage;
  table rows and sidebar rows → sage.
- **Press** keeps the hover colour and applies `--press-scale` 0.98. Nothing darkens on press.
- **Focus** is a 2px ink outline at 2px offset (inputs use a 2px green ring outside their hairline).
- **Selected** (table row, formation chip, sidebar row) is the pale-green fill with forest-ink text.
- **Disabled** is 40% opacity with `not-allowed`; no colour change.

---

## Iconography

**The source system ships no icons** — no icon font, no SVG sprite, no PNG set, and no naming
convention (confirmed: none exists). Nothing was drawn or reconstructed here.

**Substitution (flagged, and permanent):** the brand owner has confirmed no icon set exists, so
this system standardises on **[Lucide](https://lucide.dev) 0.544.0 from CDN**
(`https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg`). Lucide's 2px-stroke, rounded-cap,
24px-grid outline style is the closest match to the spec's friendly-but-plain register. The
`Icon` component (an **intentional addition**, see below) renders each glyph as a CSS mask so it
inherits `currentColor` and can be recoloured with palette tokens.

- **Sizes:** 16px inside body copy and badges, 18px in dense rows, 20px default UI, 24px for nav
  and standalone icon buttons.
- **Colour:** icons inherit their parent's text colour. Mute-coloured icons sit beside mute text;
  green icons appear only where green type already appears.
- **Stroke weight is fixed** at Lucide's 2px — do not restyle it.
- **Unicode as icons:** used in exactly two places where a glyph would be overkill — the `×` close
  affordance on `Modal` / `Toast`, and the `⇅` swap control in `MatchPlannerCard`.
- **Emoji are never used** as icons or decoration.
- Icons are loaded from CDN, so `assets/` contains no icon binaries. If you need an offline build,
  vendor the Lucide SVGs into `assets/icons/` and repoint `LUCIDE_BASE` in `components/core/Icon.jsx`.

---

## Logo & brand mark

**No logo exists** (confirmed by the brand owner). None was drawn, and none should be. Wherever a mark belongs,
render the words **Football App** in Inter 900 (see `guidelines/wordmark.card.html`):

- ink `#111827` on white or sage,
- Football green `#85b632` on ink,
- ink `#111827` on Football green.

`assets/` therefore holds no logo. If real artwork exists, drop it at `assets/logo.svg` and update
`thumbnail.html` plus the `brand` prop on `NavBar` / `Footer`.

---

## Components

21 components in seven groups. The inventory mirrors the spec's `components:` block and its
auto-derived `ex-*` example surfaces one-for-one — nothing else was added except `Icon`.

**`components/core/`** — `Button` · `IconButton` · `Badge` · `Card` · `Icon`
**`components/navigation/`** — `NavBar` · `NavLink` · `SidebarNavRow` · `Footer`
**`components/forms/`** — `TextInput` · `AuthFormCard`
**`components/layout/`** — `HeroBand` · `ContentBand`
**`components/feedback/`** — `Modal` · `Toast` · `EmptyState`
**`components/data/`** — `DataTable` · `PricingTier`
**`components/football/`** — `MatchPlannerCard` · `TeamCompositionCard` · `MatchSummary`

How the spec maps to these: `button-primary/secondary/tertiary` → `Button` variants ·
`button-icon-circular` → `IconButton` · `badge-positive/negative` → `Badge` tones ·
`card-content/-feature-sage/-feature-green/-feature-dark` → `Card` variants ·
`hero-band` + `hero-band-dark` → `HeroBand` tones · `content-band` → `ContentBand` ·
`text-input` → `TextInput` · `nav-bar`/`nav-link`/`footer` → `NavBar`/`NavLink`/`Footer` ·
`match-planner-card` → `MatchPlannerCard` · `ex-app-shell-row` → `SidebarNavRow` ·
`ex-auth-form-card` → `AuthFormCard` · `ex-data-table-cell` → `DataTable` ·
`ex-pricing-tier` + `ex-pricing-tier-featured` → `PricingTier` · `ex-modal-card` → `Modal` ·
`ex-toast` → `Toast` · `ex-empty-state-card` → `EmptyState` ·
`ex-product-selector` → `TeamCompositionCard` · `ex-cart-drawer` → `MatchSummary`.

### Intentional additions

- **`Icon`** — a wrapper over the substituted Lucide set. Needed because the source defines no
  glyph system, and every other component references icons by slot.

---

## Caveats & substitutions

1. **Typeface: settled.** The display face is **Inter** (confirmed by the brand owner), despite the
   spec calling it "proprietary". Inter 900 carries display, Inter 600/400 carries everything else.
   It loads from Google Fonts in `tokens/fonts.css`; vendor the `.woff2` files there if you need an
   offline build.
2. **No icon set, no logo, no imagery exist** (confirmed) — icons are Lucide from CDN, the brand is
   set in type, and `assets/` is empty. See the ICONOGRAPHY and LOGO sections above.
3. **Shadow and motion values are derived**, not specified (`tokens/elevation.css`, `tokens/motion.css`).
4. **One spec contradiction resolved:** `ex-pricing-tier-featured` pairs an ink background with
   `on-primary` (also ink `#111827`) text — unreadable. `PricingTier` renders featured tiers as
   white type on ink, per the prose intent ("dark fill + light text in light mode").
5. **`primary-active` naming:** the spec names `#a4cf49` "Football Green Hover" but tokenises it as
   `primary-active`. It is used for both hover and press here.
6. **The spec's `TO_FILL` markers** in the `ex-*` block were left unfilled where no primitive
   existed; no values were invented to cover them.
7. **Brand green replaced (user direction, this revision).** The spec's lime `#22c55e` ramp was
   swapped for a seven-step ramp sampled from a real pitch photograph: `#2a5d0a` turf shadow →
   `#85b632` primary → `#e4f0c4` pale. `--color-ink-deep` is now `#2a5d0a` (was forest `#14532d`),
   and two new steps `--color-primary-deep` / `--color-primary-darkest` expose the deep greens the
   original palette lacked. The semantic positive family was left untouched on purpose.

---

## Templates

Two copyable starting points for consuming projects, both composed from this system's components:

- **`templates/landing-page/LandingPage.dc.html`** — sticky nav, sage hero with the
  `MatchPlannerCard`, three feature cards, dark CTA band, ink footer. Tweaks: show/hide the
  planner, team list, player list.
- **`templates/app-dashboard/AppDashboard.dc.html`** — sidebar shell, sticky header with search,
  four stat cards, fixtures table, `TeamCompositionCard`. Tweaks: active nav row, squad size.

Each folder carries its own `ds-base.js`, which loads `styles.css` and the compiled bundle. In a
consuming project, repoint the `base` line in that file at the bound `_ds/<folder>` tree.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | Global entry point — `@import` list only. Consumers link this one file. |
| `tokens/fonts.css` | Inter load + font-family tokens |
| `tokens/colors.css` | Base palette + semantic + role aliases |
| `tokens/typography.css` | Sizes, line-heights, weights, tracking, composed `--type-*` shorthands |
| `tokens/spacing.css` | 4px scale, semantic spacing, container and breakpoint values |
| `tokens/radius.css` | Radius scale + semantic radii |
| `tokens/elevation.css` | Three elevation levels + derived overlay shadows |
| `tokens/motion.css` | Derived duration / easing / press-scale tokens |
| `tokens/base.css` | Element resets, link colours, focus-visible ring |
| `guidelines/*.card.html` | 21 foundation specimen cards (Colors, Type, Spacing, Shape, Brand) |
| `components/<group>/` | 21 components — `.jsx` + `.d.ts` + `.prompt.md` + one card per group |
| `ui_kits/marketing/` | Marketing-site recreation — landing, pricing, sign-in |
| `ui_kits/app/` | Product-app recreation — shell, dashboard, squad, match planner, player report |
| `templates/landing-page/` | Copyable starting template — marketing landing page (`LandingPage.dc.html`) |
| `templates/app-dashboard/` | Copyable starting template — product dashboard (`AppDashboard.dc.html`) |
| `thumbnail.html` | Homepage tile |
| `SKILL.md` | Agent-Skills front door for this system |
| `uploads/Football_app_Design_System.md` | The original source spec |

Read a component's `.prompt.md` before using it — each one carries the rules that are easy to get
wrong (which radius, which hover colour, what never to do with green).
