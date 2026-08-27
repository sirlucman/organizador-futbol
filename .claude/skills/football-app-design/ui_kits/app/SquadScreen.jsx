const APP_SQUAD = [
  { id: 1, name: "A. Ferreira", pos: "ST", apps: 6, rating: "8.4", status: "Available", tone: "positive" },
  { id: 2, name: "J. Okafor", pos: "CM", apps: 6, rating: "7.9", status: "Available", tone: "positive" },
  { id: 3, name: "M. Lindqvist", pos: "CB", apps: 5, rating: "7.2", status: "Fitness check", tone: "warning" },
  { id: 4, name: "D. Osei", pos: "GK", apps: 6, rating: "8.1", status: "Suspended", tone: "negative" },
  { id: 5, name: "R. Halversen", pos: "LB", apps: 4, rating: "6.8", status: "Available", tone: "positive" },
  { id: 6, name: "T. Bianchi", pos: "RW", apps: 5, rating: "7.5", status: "Available", tone: "positive" },
  { id: 7, name: "S. Novak", pos: "CM", apps: 3, rating: "7.0", status: "Away", tone: "neutral" },
];

function SquadScreen({ query, onSelectPlayer }) {
  const { DataTable, Badge, EmptyState, Button, Card, Icon } = window.FootballAppDesignSystem_49d016;
  const [selected, setSelected] = React.useState(1);
  const rows = APP_SQUAD.filter((p) => p.name.toLowerCase().includes((query || "").toLowerCase()));
  const player = APP_SQUAD.find((p) => p.id === selected) || APP_SQUAD[0];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "var(--space-xl)", alignItems: "start" }}>
      {rows.length ? (
        <DataTable
          rows={rows}
          selectedId={selected}
          onRowClick={(r, id) => setSelected(id)}
          columns={[
            { key: "name", label: "Player", strong: true },
            { key: "pos", label: "Pos", mute: true, width: "64px" },
            { key: "apps", label: "Apps", align: "right", width: "72px" },
            { key: "rating", label: "Rating", align: "right", width: "80px" },
            { key: "status", label: "Status", align: "right", render: (r) => <Badge tone={r.tone}>{r.status}</Badge> },
          ]}
        />
      ) : (
        <EmptyState
          media={<Icon name="search-x" size={26} />}
          title="No players match that search"
          caption="Clear the search box to see the full squad."
        />
      )}
      <Card variant="content" eyebrow="Selected player" title={player.name}>
        <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
          <Badge tone="neutral">{player.pos}</Badge>
          <Badge tone={player.tone}>{player.status}</Badge>
        </div>
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "1fr auto", rowGap: "var(--space-sm)", columnGap: "var(--space-lg)", font: "var(--type-body-sm)" }}>
          <dt style={{ color: "var(--color-mute)" }}>Appearances</dt><dd style={{ margin: 0, font: "var(--type-body-sm-strong)", textAlign: "right" }}>{player.apps}</dd>
          <dt style={{ color: "var(--color-mute)" }}>Average rating</dt><dd style={{ margin: 0, font: "var(--type-body-sm-strong)", textAlign: "right" }}>{player.rating}</dd>
          <dt style={{ color: "var(--color-mute)" }}>Registered</dt><dd style={{ margin: 0, font: "var(--type-body-sm-strong)", textAlign: "right" }}>2026/27</dd>
        </dl>
        <Button variant="secondary" fullWidth onClick={() => onSelectPlayer && onSelectPlayer(player)}>Open report</Button>
      </Card>
    </div>
  );
}
Object.assign(window, { SquadScreen, APP_SQUAD });
