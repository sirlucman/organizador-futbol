import React from "react";

/** Modal dialog surface — card chrome plus the derived overlay shadow and ink scrim. */
export function Modal({ open = true, title, description, children, actions, onClose, width = 480, style, ...rest }) {
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: "var(--space-xl)",
        background: "var(--scrim-overlay)",
        zIndex: 60,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
          width: "100%",
          maxWidth: width,
          padding: "var(--space-xl)",
          borderRadius: "var(--radius-card)",
          background: "var(--color-canvas)",
          color: "var(--color-ink)",
          boxShadow: "var(--shadow-overlay)",
          ...style,
        }}
        {...rest}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-lg)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", flex: 1 }}>
            {title ? <h2 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h2> : null}
            {description ? <p style={{ font: "var(--type-body-sm)", color: "var(--color-body)" }}>{description}</p> : null}
          </div>
          {onClose ? (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "var(--color-canvas-soft)", color: "var(--color-ink)", cursor: "pointer", font: "var(--type-body-md-strong)", lineHeight: 1 }}
            >
              ×
            </button>
          ) : null}
        </div>
        {children}
        {actions ? <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "flex-end" }}>{actions}</div> : null}
      </div>
    </div>
  );
}
