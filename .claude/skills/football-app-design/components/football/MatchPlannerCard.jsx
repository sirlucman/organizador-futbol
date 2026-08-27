import React from "react";

const FIELD_STYLE = {
  width: "100%",
  padding: "var(--space-md) var(--space-lg)",
  borderRadius: "var(--radius-input)",
  border: "1px solid var(--color-ink)",
  background: "var(--color-canvas)",
  color: "var(--color-ink)",
  font: "var(--type-body-md)",
  appearance: "none",
};

/**
 * The system's signature interactive widget — white card with a 1px ink hairline
 * hosting the team and player selectors, kickoff details and the primary CTA.
 */
export function MatchPlannerCard({
  eyebrow = "Match planner",
  teams = [],
  players = [],
  formations = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"],
  defaultHome,
  defaultAway,
  defaultFormation,
  ctaLabel = "Plan match",
  onPlan,
  style,
  ...rest
}) {
  const [home, setHome] = React.useState(defaultHome || teams[0] || "");
  const [away, setAway] = React.useState(defaultAway || teams[1] || "");
  const [formation, setFormation] = React.useState(defaultFormation || formations[0]);
  const [captain, setCaptain] = React.useState(players[0] || "");
  const swap = () => {
    setHome(away);
    setAway(home);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        width: "100%",
        maxWidth: 420,
        padding: "var(--space-xl)",
        borderRadius: "var(--radius-card)",
        background: "var(--color-canvas)",
        color: "var(--color-ink)",
        border: "1px solid var(--color-ink)",
        font: "var(--type-body-md)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: "var(--color-mute)" }}>{eyebrow}</span>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>Home</span>
          <select value={home} onChange={(e) => setHome(e.target.value)} style={FIELD_STYLE}>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>Away</span>
          <select value={away} onChange={(e) => setAway(e.target.value)} style={FIELD_STYLE}>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-label="Swap home and away"
          onClick={swap}
          style={{ position: "absolute", right: "var(--space-lg)", top: "50%", transform: "translateY(-50%)", width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", border: "1px solid var(--color-ink)", background: "var(--color-canvas)", color: "var(--color-ink)", cursor: "pointer", font: "var(--type-body-sm-strong)" }}
        >
          ⇅
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>Formation</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          {formations.map((f) => {
            const on = f === formation;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFormation(f)}
                aria-pressed={on}
                style={{
                  padding: "var(--space-xs) var(--space-md)",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid " + (on ? "transparent" : "var(--color-mute)"),
                  background: on ? "var(--color-primary-pale)" : "var(--color-canvas)",
                  color: on ? "var(--color-ink-deep)" : "var(--color-body)",
                  font: "var(--type-body-sm-strong)",
                  cursor: "pointer",
                  transition: "var(--transition-interactive)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
      {players.length ? (
        <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>Captain</span>
          <select value={captain} onChange={(e) => setCaptain(e.target.value)} style={FIELD_STYLE}>
            {players.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => onPlan && onPlan({ home, away, formation, captain })}
        style={{
          minHeight: "var(--touch-target-min)",
          padding: "var(--space-md) var(--space-xl)",
          borderRadius: "var(--radius-button)",
          border: "1px solid transparent",
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          font: "var(--type-button-md)",
          cursor: "pointer",
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
