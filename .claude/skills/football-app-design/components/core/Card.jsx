import React from "react";

const VARIANTS = {
  content: { background: "var(--surface-card)", color: "var(--color-ink)", border: "none" },
  sage: { background: "var(--surface-card-sage)", color: "var(--color-ink)", border: "none" },
  green: { background: "var(--surface-card-green)", color: "var(--color-ink)", border: "none" },
  dark: { background: "var(--surface-card-dark)", color: "var(--color-primary)", border: "none" },
  outline: { background: "var(--surface-card)", color: "var(--color-ink)", border: "1px solid var(--color-ink)" },
};

/** The 24px-radius surface. Four fills: white content, sage, pale green, ink-dark. */
export function Card({ variant = "content", padding, eyebrow, title, children, footer, style, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.content;
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: padding || "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: v.background,
        color: v.color,
        border: v.border,
        font: "var(--type-body-md)",
        ...style,
      }}
      {...rest}
    >
      {eyebrow ? (
        <p style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: variant === "dark" ? "var(--color-primary)" : "var(--color-mute)" }}>{eyebrow}</p>
      ) : null}
      {title ? (
        <h3 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)", color: "inherit" }}>{title}</h3>
      ) : null}
      {children}
      {footer ? <div style={{ marginTop: "auto", paddingTop: "var(--space-sm)" }}>{footer}</div> : null}
    </section>
  );
}
