import React from "react";

/** Match summary — white card with sage-divided line items and a total row. */
export function MatchSummary({ title = "Match summary", meta, items = [], total, action, style, ...rest }) {
  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        width: "100%",
        maxWidth: 400,
        padding: "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: "var(--color-canvas)",
        color: "var(--color-ink)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <h3 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h3>
        {meta ? <p style={{ font: "var(--type-body-sm)", color: "var(--color-mute)" }}>{meta}</p> : null}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
        {items.map((it, i) => (
          <li
            key={it.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--space-lg)",
              padding: "var(--space-md) 0",
              borderTop: i === 0 ? "none" : "1px solid var(--color-canvas-soft)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xxs)" }}>
              <span style={{ font: "var(--type-body-sm-strong)" }}>{it.label}</span>
              {it.note ? <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>{it.note}</span> : null}
            </div>
            <span style={{ font: "var(--type-body-sm-strong)", whiteSpace: "nowrap" }}>{it.value}</span>
          </li>
        ))}
      </ul>
      {total ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "var(--space-md)", borderTop: "1px solid var(--color-ink)" }}>
          <span style={{ font: "var(--type-body-md-strong)" }}>{total.label || "Total"}</span>
          <span style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{total.value}</span>
        </div>
      ) : null}
      {action}
    </aside>
  );
}
