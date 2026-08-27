A row in the app shell's left sidebar — use for in-product navigation, never on marketing pages.

```jsx
<SidebarNavRow icon={<Icon name="users" size={18} />} label="Squad" active />
<SidebarNavRow icon={<Icon name="calendar" size={18} />} label="Matches" badge={<Badge tone="neutral">3</Badge>} />
```

- Radius is `--radius-sm` 8px (not the 24px card radius) and padding `--space-md var(--space-lg)`.
- Active: pale-green fill, forest-ink label, 3px green indicator on the left edge. Hover: sage fill only.
