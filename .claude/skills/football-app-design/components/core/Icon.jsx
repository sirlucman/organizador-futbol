import React from "react";

const LUCIDE_BASE = "https://unpkg.com/lucide-static@0.544.0/icons/";

/**
 * Lucide glyph rendered as a CSS mask so it inherits currentColor.
 * The source design system shipped no icon set — Lucide is a flagged substitution.
 */
export function Icon({ name = "circle", size = 20, color = "currentColor", label, style, ...rest }) {
  const url = 'url("' + LUCIDE_BASE + name + '.svg")';
  return (
    <span
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      role={label ? "img" : undefined}
      style={{
        display: "inline-block",
        flex: "0 0 auto",
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
      {...rest}
    ></span>
  );
}
