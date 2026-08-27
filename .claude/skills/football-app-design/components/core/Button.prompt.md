The pill CTA — use it for every action; `primary` is the Football-green signature and should appear once per view as the single most important action.

```jsx
<Button variant="primary" iconRight={<Icon name="arrow-right" size={18} />}>Create team</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="tertiary">Cancel</Button>
```

- `variant`: `primary` (green #85b632 on ink text) · `secondary` (sage #f1f5f9) · `tertiary` (white with a 1px ink hairline).
- Geometry is fixed: `--radius-button` 24px, `--space-md var(--space-xl)` padding, 48px min height. Never square a CTA off.
- Hover lightens primary to `--color-primary-active` #a4cf49; press applies `--press-scale`.
- `href` renders an anchor. `fullWidth` stretches inside forms and mobile layouts.
