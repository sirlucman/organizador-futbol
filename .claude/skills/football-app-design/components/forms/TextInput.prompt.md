Every single-line field in the system.

```jsx
<TextInput label="Player name" placeholder="e.g. A. Ferreira" hint="As printed on the registration sheet" />
<TextInput label="Email" type="email" error="Enter a club email address" />
```

- Inputs are the one place the system uses a visible border: 1px solid `--color-ink`. Radius is `--radius-input` 12px — NOT the 24px card radius.
- Focus adds a 2px Football-green ring outside the hairline.
- Labels are `--type-body-sm-strong`; hints and errors are `--type-caption`.
