import React from "react";

/**
 * Plan / tier card. `featured` flips polarity to the ink surface.
 * NOTE: the source spec pairs the featured ink fill with `on-primary` (also ink) text —
 * an unreadable combination, resolved here to canvas-white type on ink.
 */
export function PricingTier({
  name,
  price,
  period = "/ month",
  description,
  features = [],
  featured = false,
  badge,
  ctaLabel = "Choose plan",
  onSelect,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        padding: "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: featured ? "var(--color-ink)" : "var(--color-canvas-soft)",
        color: featured ? "var(--color-canvas)" : "var(--color-ink)",
        border: featured ? "1px solid var(--color-ink)" : "1px solid var(--color-mute)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        <span style={{ font: "var(--type-body-md-strong)", color: featured ? "var(--color-primary)" : "var(--color-ink)" }}>{name}</span>
        {badge}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-xs)" }}>
        <span style={{ font: "var(--type-display-md)", color: "inherit" }}>{price}</span>
        <span style={{ font: "var(--type-body-sm)", color: featured ? "var(--color-primary-neutral)" : "var(--color-mute)" }}>{period}</span>
      </div>
      {description ? (
        <p style={{ font: "var(--type-body-sm)", color: featured ? "var(--color-canvas-soft)" : "var(--color-body)" }}>{description}</p>
      ) : null}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {features.map((f) => (
          <li key={typeof f === "string" ? f : f.key} style={{ display: "flex", gap: "var(--space-sm)", font: "var(--type-body-sm)", color: featured ? "var(--color-canvas-soft)" : "var(--color-body)" }}>
            <span aria-hidden="true" style={{ color: "var(--color-primary)", fontWeight: "var(--font-weight-black)" }}>·</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          marginTop: "auto",
          minHeight: "var(--touch-target-min)",
          padding: "var(--space-md) var(--space-xl)",
          borderRadius: "var(--radius-button)",
          border: featured ? "1px solid transparent" : "1px solid var(--color-ink)",
          background: featured ? (hover ? "var(--color-primary-active)" : "var(--color-primary)") : hover ? "var(--color-canvas-soft)" : "var(--color-canvas)",
          color: "var(--color-ink)",
          font: "var(--type-button-md)",
          cursor: "pointer",
          transition: "var(--transition-interactive)",
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
