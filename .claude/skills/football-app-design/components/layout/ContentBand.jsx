import React from "react";

/** The white content band that follows the hero — section heading in display-md. */
export function ContentBand({ tone = "canvas", eyebrow, heading, intro, actions, children, columns, style, ...rest }) {
  const fills = {
    canvas: { background: "var(--color-canvas)", color: "var(--color-ink)" },
    sage: { background: "var(--color-canvas-soft)", color: "var(--color-ink)" },
    dark: { background: "var(--color-ink)", color: "var(--color-canvas-soft)" },
  };
  const f = fills[tone] || fills.canvas;
  return (
    <section style={{ background: f.background, color: f.color, padding: "var(--space-3xl) var(--space-xl)", ...style }} {...rest}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-2xl)" }}>
        {eyebrow || heading || intro || actions ? (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--space-xl)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", flex: "1 1 420px" }}>
              {eyebrow ? (
                <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: tone === "dark" ? "var(--color-primary)" : "var(--color-mute)" }}>
                  {eyebrow}
                </span>
              ) : null}
              {heading ? <h2 style={{ font: "var(--type-display-md)", color: "inherit" }}>{heading}</h2> : null}
              {intro ? <p style={{ font: "var(--type-body-lg)", color: tone === "dark" ? "var(--color-canvas-soft)" : "var(--color-body)", maxWidth: "58ch" }}>{intro}</p> : null}
            </div>
            {actions ? <div style={{ display: "flex", gap: "var(--space-md)", marginLeft: "auto" }}>{actions}</div> : null}
          </div>
        ) : null}
        {columns ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(" + columns + ", minmax(0,1fr))", gap: "var(--space-xl)" }}>{children}</div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
