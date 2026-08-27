Circular icon-only control — use for compact chrome actions (close, more, next) where a labelled pill would crowd the layout.

```jsx
<IconButton label="Next match" icon={<Icon name="chevron-right" />} />
<IconButton label="Add player" variant="primary" icon={<Icon name="plus" />} size={48} />
```

- `variant`: `plain` (white, no border) · `outline` (ink hairline) · `primary` (green fill).
- Always pass `label` — it becomes both the accessible name and the tooltip.
- Default 40px; use `size={48}` when it stands alone as a touch target.
