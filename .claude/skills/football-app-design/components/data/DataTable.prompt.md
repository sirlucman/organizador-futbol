Squad lists, fixture lists, evaluation scores — any in-product tabular data.

```jsx
<DataTable
  columns={[{ key: "name", label: "Player", strong: true }, { key: "pos", label: "Pos" },
            { key: "status", label: "Status", render: r => <Badge tone={r.tone}>{r.status}</Badge> }]}
  rows={rows} selectedId={selected} onRowClick={(r, id) => setSelected(id)} />
```

- Header cells: sage fill, mute text, 12px semibold uppercase tracked `--letter-spacing-eyebrow`.
- Rows are separated by 1px `--color-canvas-soft` — never a darker rule. Hover fills sage; selection fills pale green.
- Abbreviate long datasets in mocks (5–8 rows) rather than inventing volume.
