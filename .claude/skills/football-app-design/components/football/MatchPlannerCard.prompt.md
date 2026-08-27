The hero's interactive centrepiece — put it in `HeroBand`'s `aside` slot, or at the top of the app's Matches screen.

```jsx
<MatchPlannerCard
  teams={["Riverside FC", "Northgate United", "Eastvale Athletic"]}
  players={["A. Ferreira", "J. Okafor", "M. Lindqvist"]}
  onPlan={sel => console.log(sel)} />
```

- This is the one card that carries a 1px ink hairline — it is the widget's identity, keep it.
- Selects use the TextInput geometry (12px radius, ink hairline); formation chips are pill-radius and fill pale green when picked.
- Capped at 420px wide so it sits cleanly beside a 64px headline.
