import React from "react";

const TONES = {
  positive: { background: "var(--color-primary-pale)", color: "var(--color-positive-deep)" },
  negative: { background: "var(--color-negative-bg)", color: "var(--color-canvas)" },
  warning: { background: "var(--color-warning)", color: "var(--color-warning-content)" },
  neutral: { background: "var(--color-canvas-soft)", color: "var(--color-ink)" },
  ink: { background: "var(--color-ink)", color: "var(--color-primary)" },
};

/** Pill status badge. Positive and negative are the two tones defined by the system. */
export function Badge({ tone = "positive", icon, children, style, ...rest }) {
  const t = TONES[tone] || TONES.positive;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        padding: "var(--space-xs) var(--space-md)",
        borderRadius: "var(--radius-badge)",
        background: t.background,
        color: t.color,
        font: "var(--type-body-sm-strong)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
