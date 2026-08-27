Transient confirmation after a save, invite or lineup change.

```jsx
<Toast tone="positive" title="Lineup saved" message="Riverside FC vs Northgate United — 4-3-3." onDismiss={hide} />
```

- White fill, 24px radius, `--shadow-floating`, capped at 400px. Body copy in `--type-body-sm`.
- The 3px left rail carries the tone; the toast surface itself never changes colour.
- Never use Football green as the positive rail — the positive family (`--color-positive`) exists for status.
