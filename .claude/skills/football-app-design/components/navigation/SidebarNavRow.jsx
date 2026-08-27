import React from "react";

/** App-shell sidebar row. Active state uses a Football-green indicator bar. */
export function SidebarNavRow({ icon, label, badge, active = false, href = "#", onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-md)",
        padding: "var(--space-md) var(--space-lg)",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--color-primary-pale)" : hover ? "var(--color-canvas-soft)" : "var(--color-canvas)",
        color: active ? "var(--color-ink-deep)" : "var(--color-body)",
        font: active ? "var(--type-body-sm-strong)" : "var(--type-body-sm)",
        textDecoration: "none",
        transition: "var(--transition-interactive)",
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: "var(--space-sm)",
          bottom: "var(--space-sm)",
          width: 3,
          borderRadius: "var(--radius-pill)",
          background: active ? "var(--color-primary)" : "transparent",
        }}
      ></span>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge}
    </a>
  );
}
