import React from "react";

const RAILS = {
  neutral: "var(--color-ink)",
  positive: "var(--color-positive)",
  warning: "var(--color-warning)",
  negative: "var(--color-negative)",
};

/** Toast notification — card shape, 12/16 padding, body-sm, floating shadow. */
export function Toast({ tone = "neutral", icon, title, message, action, onDismiss, style, ...rest }) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-md)",
        width: "100%",
        maxWidth: 400,
        padding: "var(--space-md) var(--space-lg)",
        borderRadius: "var(--radius-card)",
        background: "var(--color-canvas)",
        color: "var(--color-ink)",
        font: "var(--type-body-sm)",
        boxShadow: "var(--shadow-floating)",
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden="true" style={{ alignSelf: "stretch", width: 3, borderRadius: "var(--radius-pill)", background: RAILS[tone] || RAILS.neutral, flex: "0 0 auto" }}></span>
      {icon}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xxs)", flex: 1, minWidth: 0 }}>
        {title ? <span style={{ font: "var(--type-body-sm-strong)" }}>{title}</span> : null}
        {message ? <span style={{ color: "var(--color-body)" }}>{message}</span> : null}
      </div>
      {action}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{ border: "none", background: "transparent", color: "var(--color-mute)", cursor: "pointer", font: "var(--type-body-md-strong)", lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
