function StatCard({ variant, label, value, note }) {
  const { Card } = window.FootballAppDesignSystem_49d016;
  const dark = variant === "dark";
  return (
    <Card variant={variant} eyebrow={label}>
      <span style={{ font: "var(--type-display-md)", color: "inherit" }}>{value}</span>
      <span style={{ font: "var(--type-body-sm)", color: dark ? "var(--color-primary-neutral)" : "var(--color-mute)" }}>{note}</span>
    </Card>
  );
}

function DashboardScreen({ onOpenMatches }) {
  const { TeamCompositionCard, MatchSummary, DataTable, Badge, Button } = window.FootballAppDesignSystem_49d016;
  const fixtures = [
    { id: 1, date: "Sat 5 Sep", opponent: "Northgate United", venue: "Home", status: "Squad named", tone: "positive" },
    { id: 2, date: "Sat 12 Sep", opponent: "Eastvale Athletic", venue: "Away", status: "Availability open", tone: "warning" },
    { id: 3, date: "Wed 16 Sep", opponent: "Kirkhaven Rangers", venue: "Home", status: "Not planned", tone: "neutral" },
    { id: 4, date: "Sat 26 Sep", opponent: "Portmere Town", venue: "Away", status: "Not planned", tone: "neutral" },
  ];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "var(--space-lg)" }}>
        <StatCard variant="content" label="Registered" value="24" note="Squad size" />
        <StatCard variant="green" label="Available Saturday" value="19" note="Five unconfirmed" />
        <StatCard variant="sage" label="Average rating" value="7.6" note="Last five matches" />
        <StatCard variant="dark" label="Clean sheets" value="4" note="Season to date" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "var(--space-xl)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <DataTable
            caption="Upcoming fixtures"
            rows={fixtures}
            columns={[
              { key: "date", label: "Date", strong: true, width: "110px" },
              { key: "opponent", label: "Opponent" },
              { key: "venue", label: "Venue", mute: true, width: "80px" },
              { key: "status", label: "Status", align: "right", render: (r) => <Badge tone={r.tone}>{r.status}</Badge> },
            ]}
          />
          <Button variant="secondary" style={{ alignSelf: "flex-start" }} onClick={onOpenMatches}>Plan the next match</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <TeamCompositionCard
            squadSize={24}
            groups={[
              { label: "Goalkeepers", count: 2, required: 3 },
              { label: "Defenders", count: 8, required: 8 },
              { label: "Midfielders", count: 7, required: 8 },
              { label: "Forwards", count: 7, required: 6 },
            ]}
            footer={<Badge tone="warning">Two positions short</Badge>}
          />
          <MatchSummary
            title="Saturday 15:00"
            meta="Riverside Park · Pitch 2 · vs Northgate United"
            items={[
              { label: "Pitch hire", note: "90 minutes", value: "£120" },
              { label: "Referee", value: "£45" },
              { label: "Kit wash", note: "Home strip", value: "£18" },
            ]}
            total={{ label: "Matchday cost", value: "£183" }}
            action={<Button variant="primary" fullWidth onClick={onOpenMatches}>Review lineup</Button>}
            style={{ maxWidth: "none" }}
          />
        </div>
      </div>
    </>
  );
}
Object.assign(window, { DashboardScreen, StatCard });
