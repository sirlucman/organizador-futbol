import React from "react";

/**
 * Sticky top nav — white band, ink type, 12/24 padding.
 * The brand slot renders the wordmark as type: no logo file exists in the source system.
 */
export function NavBar({ brand = "Football App", links, actions, sticky = true, style, ...rest }) {
  return (
    <header
      style={{
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 20,
        background: "var(--color-canvas)",
        color: "var(--color-ink)",
        borderBottom: "1px solid var(--color-canvas-soft)",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2xl)",
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-md) var(--space-xl)",
        }}
      >
        <a
          href="#"
          style={{
            font: "var(--type-display-xs)",
            fontWeight: "var(--font-weight-black)",
            letterSpacing: "var(--letter-spacing-display-xs)",
            color: "var(--color-ink)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {brand}
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-xl)", marginLeft: "var(--space-lg)" }}>{links}</nav>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginLeft: "auto" }}>{actions}</div>
      </div>
    </header>
  );
}
