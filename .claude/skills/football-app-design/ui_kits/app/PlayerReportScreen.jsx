function PlayerReportScreen({ player, onBack }) {
  const { Card, Badge, DataTable, Button, Icon, TeamCompositionCard } = window.FootballAppDesignSystem_49d016;
  const p = player || { name: "A. Ferreira", pos: "ST", apps: 6, rating: "8.4", status: "Available", tone: "positive" };
  const matches = [
    { id: 1, date: "Sat 22 Aug", opponent: "Portmere Town", minutes: 90, rating: "8.6", note: "Two goals" },
    { id: 2, date: "Sat 15 Aug", opponent: "Kirkhaven Rangers", minutes: 78, rating: "7.4", note: "Held up play" },
    { id: 3, date: "Wed 12 Aug", opponent: "Eastvale Athletic", minutes: 90, rating: "8.1", note: "One assist" },
    { id: 4, date: "Sat 2 Aug", opponent: "Northgate United", minutes: 62, rating: "7.9", note: "Substituted" },
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <Button variant="tertiary" iconLeft={<Icon name="arrow-left" size={18} />} onClick={onBack}>Back to squad</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)", gap: "var(--space-xl)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <Card variant="dark" eyebrow="Season report" title={p.name}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-xl)", flexWrap: "wrap" }}>
              <span style={{ font: "var(--type-display-md)" }}>{p.rating}</span>
              <span style={{ font: "var(--type-body-sm)", color: "var(--color-primary-neutral)" }}>average across {p.apps} appearances</span>
            </div>
          </Card>
          <DataTable
            caption="Match ratings"
            rows={matches}
            columns={[
              { key: "date", label: "Date", strong: true, width: "120px" },
              { key: "opponent", label: "Opponent" },
              { key: "minutes", label: "Mins", align: "right", width: "72px", mute: true },
              { key: "rating", label: "Rating", align: "right", width: "80px" },
              { key: "note", label: "Note", align: "right", mute: true },
            ]}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <Card variant="content" eyebrow="Status" title="Availability">
            <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
              <Badge tone={p.tone}>{p.status}</Badge>
              <Badge tone="neutral">{p.pos}</Badge>
              <Badge tone="ink">Captain</Badge>
            </div>
            <p style={{ font: "var(--type-body-sm)", color: "var(--color-body)" }}>Cleared for Saturday. No minutes restriction.</p>
          </Card>
          <TeamCompositionCard
            title="Minutes by position"
            groups={[
              { label: "Striker", count: 5, required: 6 },
              { label: "Left wing", count: 1, required: 6 },
            ]}
          />
        </div>
      </div>
    </>
  );
}
Object.assign(window, { PlayerReportScreen });
