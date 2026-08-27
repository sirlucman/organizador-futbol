import React from "react";

const SCALES = {
  mega: { font: "var(--type-display-mega)", letterSpacing: "var(--letter-spacing-none)" },
  xxl: { font: "var(--type-display-xxl)", letterSpacing: "var(--letter-spacing-none)" },
  xl: { font: "var(--type-display-xl)", letterSpacing: "var(--letter-spacing-none)" },
  lg: { font: "var(--type-display-lg)", letterSpacing: "var(--letter-spacing-display-lg)" },
};

/** The hero band — sage canvas or polarity-flipped ink, headline in Inter 900. */
export function HeroBand({
  tone = "sage",
  scale = "xl",
  eyebrow,
  headline,
  subhead,
  actions,
  aside,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  const s = SCALES[scale] || SCALES.xl;
  return (
    <section
      style={{
        background: dark ? "var(--color-ink)" : "var(--color-canvas-soft)",
        color: dark ? "var(--color-primary)" : "var(--color-ink)",
        padding: "var(--space-3xl) var(--space-xl)",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: aside ? "minmax(0,1.1fr) minmax(0,0.9fr)" : "minmax(0,1fr)",
          gap: "var(--space-3xl)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          {eyebrow ? (
            <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: dark ? "var(--color-primary-neutral)" : "var(--color-mute)" }}>
              {eyebrow}
            </span>
          ) : null}
          <h1 style={{ font: s.font, letterSpacing: s.letterSpacing, color: "inherit", textWrap: "balance" }}>{headline}</h1>
          {subhead ? (
            <p style={{ font: "var(--type-body-lg)", color: dark ? "var(--color-canvas-soft)" : "var(--color-body)", maxWidth: "52ch" }}>{subhead}</p>
          ) : null}
          {actions ? <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-md)" }}>{actions}</div> : null}
        </div>
        {aside ? <div style={{ display: "flex", justifyContent: "flex-end" }}>{aside}</div> : null}
      </div>
    </section>
  );
}
