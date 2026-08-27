Opens a marketing page. The signature composition is headline left, MatchPlannerCard right.

```jsx
<HeroBand
  tone="sage" scale="xl"
  eyebrow="Team management"
  headline="Plan the match before the whistle."
  subhead="Squads, availability and formations in one place."
  actions={<Button variant="primary">Create team</Button>}
  aside={<MatchPlannerCard teams={["Riverside FC", "Northgate United"]} />}
/>
```

- Headlines are Inter weight 900. Never render a hero at 700 or lighter.
- `tone="dark"` flips to ink with a Football-green headline — one per page, maximum.
- Band padding is `--space-3xl` 48px vertical; content caps at 1200px.
