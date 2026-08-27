Confirmations and short focused tasks (add player, confirm a squad change).

```jsx
<Modal open={open} title="Release player?" description="They will be removed from the squad for the rest of the season."
  onClose={close}
  actions={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button variant="primary">Release</Button></>} />
```

- White card, 24px radius, 24px padding, `--shadow-overlay` over a `--scrim-overlay` ink veil.
- Positioned `absolute` inside the nearest positioned ancestor, so app-shell demos can host it without a portal.
- The shadow value is a DERIVED token: the source spec asked for an "elevated shadow" without specifying one.
