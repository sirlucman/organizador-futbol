import React from "react";

/** The canonical input — 1px ink hairline, 12px radius, body-md. */
export function TextInput({
  label,
  hint,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  iconLeft,
  suffix,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || "input-" + React.useId();
  const borderColor = error ? "var(--color-negative-deep)" : "var(--color-ink)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", ...style }}>
      {label ? (
        <label htmlFor={inputId} style={{ font: "var(--type-body-sm-strong)", color: "var(--color-ink)" }}>
          {label}
        </label>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-md) var(--space-lg)",
          borderRadius: "var(--radius-input)",
          background: "var(--color-canvas)",
          border: "1px solid " + borderColor,
          outline: focus ? "2px solid var(--color-primary)" : "none",
          outlineOffset: 1,
          opacity: disabled ? 0.5 : 1,
          transition: "var(--transition-interactive)",
        }}
      >
        {iconLeft}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--type-body-md)",
            color: "var(--color-ink)",
          }}
          {...rest}
        />
        {suffix}
      </div>
      {error ? (
        <span style={{ font: "var(--type-caption)", color: "var(--color-negative-darkest)" }}>{error}</span>
      ) : hint ? (
        <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
