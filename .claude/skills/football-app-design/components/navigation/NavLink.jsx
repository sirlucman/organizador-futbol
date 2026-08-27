import React from "react";

/** Nav link in body-sm-strong. Active state carries a Football-green underline. */
export function NavLink({ href = "#", active = false, icon, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        padding: "var(--space-sm) 0",
        color: "var(--color-ink)",
        font: "var(--type-body-sm-strong)",
        textDecoration: "none",
        borderBottom: "2px solid " + (active ? "var(--color-primary)" : hover ? "var(--color-primary-neutral)" : "transparent"),
        transition: "var(--transition-interactive)",
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </a>
  );
}
