Icon wrapper around the Lucide set (CDN, masked so it inherits `currentColor`). INTENTIONAL ADDITION — the source system shipped no glyphs.

```jsx
<Icon name="calendar" size={20} />
<Icon name="users" size={16} color="var(--color-mute)" />
```

- Names are Lucide slugs, kebab-case: `calendar`, `users`, `chevron-down`, `trophy`, `whistle` is NOT in Lucide — use `flag` or `circle-dot` for match events.
- 20px is the default UI size; 16px inside body text and badges; 24px for nav and standalone icon buttons.
- Lucide's 2px stroke is baked into the artwork — do not attempt to restyle stroke weight.
