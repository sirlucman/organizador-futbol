Squad-balance readout for the dashboard and team-management screens.

```jsx
<TeamCompositionCard squadSize={24} groups={[
  { label: "Goalkeepers", count: 2, required: 3 },
  { label: "Defenders", count: 8, required: 8 },
  { label: "Midfielders", count: 8, required: 8 },
]} />
```

- Bars sit on white inside the sage card; a full group fills Football green, a short group fills `--color-warning`.
- Counts read "8 / 8". Never colour a satisfied group red or an empty one green.
