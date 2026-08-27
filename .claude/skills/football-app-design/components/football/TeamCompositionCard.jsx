import React from "react";

/** Team composition summary — sage card with per-position fill bars in Football green. */
export function TeamCompositionCard({ title = "Squad composition", squadSize, groups = [], footer, style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        padding: "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: "var(--surface-card-sage)",
        color: "var(--color-ink)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <h3 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h3>
        {squadSize != null ? <span style={{ font: "var(--type-body-sm)", color: "var(--color-mute)" }}>{squadSize} registered</span> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {groups.map((g) => {
          const pct = g.required ? Math.min(100, Math.round((g.count / g.required) * 100)) : 100;
          const short = g.required != null && g.count < g.required;
          return (
            <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body-sm-strong)" }}>
                <span>{g.label}</span>
                <span style={{ color: short ? "var(--color-warning-deep)" : "var(--color-body)" }}>
                  {g.count}
                  {g.required != null ? " / " + g.required : ""}
                </span>
              </div>
              <div style={{ height: 8, borderRadius: "var(--radius-pill)", background: "var(--color-canvas)", overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: "100%", borderRadius: "var(--radius-pill)", background: short ? "var(--color-warning)" : "var(--color-primary)" }}></div>
              </div>
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
