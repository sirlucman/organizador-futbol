Pill status badge — use for match results, availability and form-state flags inside tables, rosters and cards.

```jsx
<Badge tone="positive">Available</Badge>
<Badge tone="negative">Suspended</Badge>
<Badge tone="warning" icon={<Icon name="alert-triangle" size={14} />}>Fitness check</Badge>
```

- `positive` and `negative` are the two tones the source system defines; `warning`, `neutral` and `ink` extend the same pill using documented palette colours.
- Never use Football green (`--color-primary`) as a success fill — it is reserved for CTAs. Positive badges use the pale-green surface with forest text.
