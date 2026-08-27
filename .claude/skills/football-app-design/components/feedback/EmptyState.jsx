import React from "react";

/** Empty-state frame — sage fill, 48px padding, centred caption in body-md. */
export function EmptyState({ media, title, caption, action, style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-lg)",
        textAlign: "center",
        padding: "var(--space-3xl)",
        borderRadius: "var(--radius-card)",
        background: "var(--surface-card-sage)",
        color: "var(--color-ink)",
        ...style,
      }}
      {...rest}
    >
      {media ? (
        <div style={{ display: "grid", placeItems: "center", width: 72, height: 72, borderRadius: "var(--radius-full)", background: "var(--color-primary-pale)", color: "var(--color-ink-deep)" }}>
          {media}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {title ? <h3 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h3> : null}
        {caption ? <p style={{ font: "var(--type-body-md)", color: "var(--color-body)", maxWidth: "44ch" }}>{caption}</p> : null}
      </div>
      {action}
    </div>
  );
}
