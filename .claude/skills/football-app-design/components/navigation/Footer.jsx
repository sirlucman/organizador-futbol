import React from "react";

/** The dark footer band — ink fill, sage type, 48/24 padding. */
export function Footer({ brand = "Football App", tagline, columns = [], legal, style, ...rest }) {
  return (
    <footer
      style={{
        background: "var(--color-ink)",
        color: "var(--color-canvas-soft)",
        font: "var(--type-body-sm)",
        padding: "var(--space-3xl) var(--space-xl)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "var(--space-3xl)" }}>
        <div style={{ minWidth: 220, flex: "1 1 220px", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <span style={{ font: "var(--type-display-xs)", fontWeight: "var(--font-weight-black)", color: "var(--color-primary)" }}>{brand}</span>
          {tagline ? <p style={{ color: "var(--color-canvas-soft)", opacity: 0.72, maxWidth: "34ch" }}>{tagline}</p> : null}
        </div>
        {columns.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", minWidth: 140 }}>
            <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: "var(--color-mute)" }}>{col.title}</span>
            {(col.links || []).map((l) => (
              <a key={l.label} href={l.href || "#"} style={{ color: "var(--color-canvas-soft)", textDecoration: "none", opacity: 0.82 }}>
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      {legal ? (
        <div style={{ maxWidth: "var(--container-max)", margin: "var(--space-2xl) auto 0", paddingTop: "var(--space-lg)", borderTop: "1px solid rgb(255 255 255 / 0.12)", font: "var(--type-caption)", color: "var(--color-mute)" }}>
          {legal}
        </div>
      ) : null}
    </footer>
  );
}
