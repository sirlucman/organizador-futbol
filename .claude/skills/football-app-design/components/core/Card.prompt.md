The system's surface primitive — wrap any grouped content in it; white on the sage page is the default pairing.

```jsx
<Card variant="content" eyebrow="Squad" title="Starting XI">
  <p>Nine of eleven confirmed for Saturday.</p>
</Card>
<Card variant="dark" title="Season pass">Green type on ink — promotional moments only.</Card>
```

- `variant`: `content` (white) · `sage` · `green` (pale green) · `dark` (ink fill, Football-green type) · `outline` (white + ink hairline).
- Radius is always `--radius-card` 24px and interior padding `--space-xl` 24px. No shadow — a white card on the sage canvas already reads as elevated.
- Use `dark` sparingly: one polarity-flipped card per view at most.
