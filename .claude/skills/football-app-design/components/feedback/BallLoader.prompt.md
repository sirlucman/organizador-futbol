The one loading indicator in the system: a football spinning in place.

```jsx
<BallLoader size={92} caption="Loading squad" shadow />
<BallLoader size={24} />                        {/* inline, in a row or button */}
<BallLoader size={80} tone="night" />           {/* on the ink launch screen */}
```

- **One loader, three sizes.** 20–24px inline (buttons, rows), 40px in cards, 88–96px for page
  and launch screens. Never below 20px — the panels turn to mush.
- The ball is a real sphere with **fixed lighting**: it turns, the highlight does not. Do not add
  a CSS `rotate` on top of it — that spins the light and breaks the illusion.
- **No progress ring, no track, no bounce.** Motion in this system is calm; the spin is the whole
  effect. Keep `spinSeconds` between 0.9 and 1.6.
- `tone="night"` only on `--surface-card-dark` / ink grounds. Never recolour the panels to green —
  Football green stays on CTAs, the active-nav indicator and progress fills.
- Captions state what is loading, sentence case, no ellipsis and no apology: "Loading squad",
  "Building lineup", "Fetching fixtures". Pair with the `--type-body-sm-strong` default; don't
  restyle it.
- Respects `prefers-reduced-motion` by holding a single frame — leave that behaviour alone.
- Frames are pre-rendered once per tone and shared, so many loaders on a page are cheap. Mounting
  a loader for under ~400ms is worse than showing nothing: gate it behind a delay.
