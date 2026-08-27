import React from "react";

/** Circular icon button — white fill, ink glyph, full radius. */
export function IconButton({
  icon,
  label,
  size = 40,
  variant = "plain",
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skins = {
    plain: { background: "var(--color-canvas)", color: "var(--color-ink)", border: "1px solid transparent", hover: "var(--color-canvas-soft)" },
    outline: { background: "var(--color-canvas)", color: "var(--color-ink)", border: "1px solid var(--color-ink)", hover: "var(--color-canvas-soft)" },
    primary: { background: "var(--color-primary)", color: "var(--color-on-primary)", border: "1px solid transparent", hover: "var(--color-primary-active)" },
  };
  const s = skins[variant] || skins.plain;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        padding: "var(--space-sm)",
        borderRadius: "var(--radius-icon-button)",
        border: s.border,
        background: hover && !disabled ? s.hover : s.background,
        color: s.color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transform: press && !disabled ? "scale(var(--press-scale))" : "none",
        transition: "var(--transition-interactive)",
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
