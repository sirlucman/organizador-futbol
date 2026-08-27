Zero-data states: no squad yet, no fixtures scheduled, no reports filed.

```jsx
<EmptyState media={<Icon name="users" size={28} />} title="No players yet"
  caption="Add your first player or import a squad sheet to get started."
  action={<Button variant="primary">Add player</Button>} />
```

- Sage fill, 24px radius, `--space-3xl` 48px padding — the most generous padding in the system.
- Caption caps at 44ch and stays plain-spoken; no apologies, no exclamation marks.
