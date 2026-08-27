function MatchesScreen({ onPlan }) {
  const { MatchPlannerCard, MatchSummary, DataTable, Badge, Button, Card } = window.FootballAppDesignSystem_49d016;
  const [plan, setPlan] = React.useState({ home: "Riverside FC", away: "Northgate United", formation: "4-3-3", captain: "A. Ferreira" });
  const results = [
    { id: 1, date: "Sat 22 Aug", opponent: "Portmere Town", score: "2 – 1", outcome: "Won", tone: "positive" },
    { id: 2, date: "Sat 15 Aug", opponent: "Kirkhaven Rangers", score: "0 – 0", outcome: "Drew", tone: "neutral" },
    { id: 3, date: "Wed 12 Aug", opponent: "Eastvale Athletic", score: "1 – 3", outcome: "Lost", tone: "negative" },
  ];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,420px) minmax(0,1fr) minmax(0,360px)", gap: "var(--space-xl)", alignItems: "start" }}>
        <MatchPlannerCard
          teams={["Riverside FC", "Northgate United", "Eastvale Athletic", "Kirkhaven Rangers"]}
          players={["A. Ferreira", "J. Okafor", "M. Lindqvist", "D. Osei"]}
          defaultHome={plan.home}
          defaultAway={plan.away}
          onPlan={(sel) => { setPlan(sel); onPlan && onPlan(sel); }}
          style={{ maxWidth: "none" }}
        />
        <Card variant="sage" eyebrow="Lineup" title={plan.formation + " · " + plan.home}>
          <p style={{ font: "var(--type-body-sm)", color: "var(--color-body)" }}>
            Captain {plan.captain}. Nineteen of twenty-four available; two positions short of target.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "var(--space-sm)" }}>
            {["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"].map((slot, i) => (
              <span key={slot + i} style={{ padding: "var(--space-sm) var(--space-md)", borderRadius: "var(--radius-sm)", background: "var(--color-canvas)", font: "var(--type-body-sm-strong)", textAlign: "center" }}>{slot}</span>
            ))}
          </div>
          <Button variant="tertiary" style={{ alignSelf: "flex-start" }}>Edit lineup</Button>
        </Card>
        <MatchSummary
          title="Saturday 15:00"
          meta={plan.home + " vs " + plan.away}
          items={[
            { label: "Pitch hire", note: "90 minutes", value: "£120" },
            { label: "Referee", value: "£45" },
            { label: "Kit wash", note: "Home strip", value: "£18" },
          ]}
          total={{ label: "Matchday cost", value: "£183" }}
          action={<Button variant="primary" fullWidth onClick={() => onPlan && onPlan(plan)}>Confirm match</Button>}
          style={{ maxWidth: "none" }}
        />
      </div>
      <DataTable
        caption="Recent results"
        rows={results}
        columns={[
          { key: "date", label: "Date", strong: true, width: "120px" },
          { key: "opponent", label: "Opponent" },
          { key: "score", label: "Score", align: "center", width: "100px" },
          { key: "outcome", label: "Outcome", align: "right", render: (r) => <Badge tone={r.tone}>{r.outcome}</Badge> },
        ]}
      />
    </>
  );
}
Object.assign(window, { MatchesScreen });
