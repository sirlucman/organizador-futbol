import React from "react";

const VARIANTS = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
    border: "1px solid transparent",
    hoverBackground: "var(--color-primary-active)",
  },
  secondary: {
    background: "var(--color-canvas-soft)",
    color: "var(--color-ink)",
    border: "1px solid transparent",
    hoverBackground: "var(--color-primary-pale)",
  },
  tertiary: {
    background: "var(--color-canvas)",
    color: "var(--color-ink)",
    border: "1px solid var(--color-ink)",
    hoverBackground: "var(--color-canvas-soft)",
  },
};

/** The 24px-radius pill CTA. Primary is Football green — the system's only accent. */
export function Button({
  variant = "primary",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  href,
  type = "button",
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      type={href ? undefined : type}
      disabled={href ? undefined : disabled}
      aria-disabled={disabled ? "true" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-sm)",
        padding: "var(--space-md) var(--space-xl)",
        minHeight: "var(--touch-target-min)",
        borderRadius: "var(--radius-button)",
        border: v.border,
        background: disabled ? v.background : hover ? v.hoverBackground : v.background,
        color: v.color,
        font: "var(--type-button-md)",
        textDecoration: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transform: press && !disabled ? "scale(var(--press-scale))" : "none",
        transition: "var(--transition-interactive)",
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}
