import React from "react";

/** Sign-in / registration card — sage feature-card chrome wrapping text inputs. */
export function AuthFormCard({
  title = "Sign in",
  subtitle,
  children,
  submitLabel = "Continue",
  onSubmit,
  secondary,
  footnote,
  style,
  ...rest
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        width: "100%",
        maxWidth: 420,
        padding: "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: "var(--surface-card-sage)",
        color: "var(--color-ink)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <h2 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h2>
        {subtitle ? <p style={{ font: "var(--type-body-sm)", color: "var(--color-body)" }}>{subtitle}</p> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>{children}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "var(--touch-target-min)",
            padding: "var(--space-md) var(--space-xl)",
            borderRadius: "var(--radius-button)",
            border: "1px solid transparent",
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            font: "var(--type-button-md)",
            cursor: "pointer",
          }}
        >
          {submitLabel}
        </button>
        {secondary}
      </div>
      {footnote ? <p style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>{footnote}</p> : null}
    </form>
  );
}
