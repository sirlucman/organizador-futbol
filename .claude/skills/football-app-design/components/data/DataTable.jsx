import React from "react";

/** Data table — sage header in tracked caption, hairline rows, 12/16 cells. */
export function DataTable({ columns = [], rows = [], selectedId, onRowClick, getRowId, caption, style, ...rest }) {
  const [hoverId, setHoverId] = React.useState(null);
  const rowId = getRowId || ((row, i) => (row.id != null ? row.id : i));
  return (
    <div style={{ borderRadius: "var(--radius-card)", background: "var(--color-canvas)", overflow: "hidden", ...style }} {...rest}>
      <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-sm)", color: "var(--color-ink)" }}>
        {caption ? <caption style={{ captionSide: "top", textAlign: "left", padding: "var(--space-lg)", font: "var(--type-body-md-strong)" }}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{
                  background: "var(--color-canvas-soft)",
                  color: "var(--color-mute)",
                  font: "var(--type-eyebrow)",
                  letterSpacing: "var(--letter-spacing-eyebrow)",
                  textTransform: "uppercase",
                  textAlign: c.align || "left",
                  padding: "var(--space-md) var(--space-lg)",
                  width: c.width,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const id = rowId(row, i);
            const active = selectedId != null && selectedId === id;
            return (
              <tr
                key={id}
                onClick={onRowClick ? () => onRowClick(row, id) : undefined}
                onMouseEnter={() => setHoverId(id)}
                onMouseLeave={() => setHoverId(null)}
                style={{
                  background: active ? "var(--color-primary-pale)" : hoverId === id ? "var(--color-canvas-soft)" : "var(--color-canvas)",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color var(--duration-fast) var(--ease-out)",
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "var(--space-md) var(--space-lg)",
                      borderTop: "1px solid var(--color-canvas-soft)",
                      textAlign: c.align || "left",
                      color: c.mute ? "var(--color-mute)" : "var(--color-ink)",
                      font: c.strong ? "var(--type-body-sm-strong)" : "var(--type-body-sm)",
                    }}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
