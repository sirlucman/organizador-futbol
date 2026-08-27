Right-rail confirmation panel for a planned match — line items, then a total.

```jsx
<MatchSummary title="Saturday 15:00" meta="Riverside Park · Pitch 2"
  items={[{ label: "Pitch hire", note: "90 minutes", value: "£120" }, { label: "Referee", value: "£45" }]}
  total={{ label: "Total", value: "£165" }}
  action={<Button variant="primary" fullWidth>Confirm match</Button>} />
```

- Items are divided by 1px `--color-canvas-soft`; the total sits above a 1px ink rule — the only place a strong rule appears inside a card.
- Values are right-aligned and never wrap.
