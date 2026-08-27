Plan comparison on the marketing site; also the shape used for evaluation-tier cards in product.

```jsx
<PricingTier name="Club" price="£24" description="For multi-squad clubs."
  features={["Unlimited squads", "Match planner", "Evaluation reports"]}
  featured badge={<Badge tone="positive">Most picked</Badge>} ctaLabel="Start free trial" />
```

- Default: sage fill with a 1px `--color-mute` border. Featured: ink fill, white body copy, green tier name and green CTA.
- Exactly one featured tier per row.
- Prices use `--type-display-md` (40px / 900) with the period in body-sm mute.
