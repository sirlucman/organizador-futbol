function LandingPage({ onCta, onPlan }) {
  const { HeroBand, ContentBand, Card, Button, Icon, MatchPlannerCard, TeamCompositionCard, Badge } =
    window.FootballAppDesignSystem_49d016;
  return (
    <>
      <HeroBand
        tone="sage"
        scale="xl"
        eyebrow="Team management"
        headline="Plan the match before the whistle."
        subhead="Availability, formations and player reports in one place. Built for coaches who run the squad and the spreadsheet."
        actions={<>
          <Button variant="primary" onClick={onCta} iconRight={<Icon name="arrow-right" size={18} />}>Create team</Button>
          <Button variant="tertiary" iconLeft={<Icon name="play" size={18} />}>See a demo</Button>
        </>}
        aside={<MatchPlannerCard
          teams={["Riverside FC", "Northgate United", "Eastvale Athletic"]}
          players={["A. Ferreira", "J. Okafor", "M. Lindqvist"]}
          onPlan={onPlan}
        />}
      />
      <ContentBand eyebrow="Why coaches switch" heading="Everything a matchday needs" columns={3}>
        <Card variant="sage" title="Availability" eyebrow="Ask once">
          <p style={{ font: "var(--type-body-md)", color: "var(--color-body)" }}>Send one request. See who is fit, who is away and who has not replied.</p>
        </Card>
        <Card variant="green" title="Formations" eyebrow="Drag the shape">
          <p style={{ font: "var(--type-body-md)", color: "var(--color-body)" }}>Switch between 4-3-3 and 3-5-2 without rebuilding the squad list.</p>
        </Card>
        <Card variant="dark" title="Reports" eyebrow="Every match">
          <p style={{ font: "var(--type-body-md)", color: "var(--color-primary-neutral)" }}>Ratings that survive the season, not a notebook that does not.</p>
        </Card>
      </ContentBand>
      <ContentBand tone="sage" eyebrow="Squad balance" heading="Know where the gaps are">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)", gap: "var(--space-3xl)", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            <p style={{ font: "var(--type-body-lg)", color: "var(--color-body)", maxWidth: "52ch" }}>
              Football App counts your registered players by position and flags the groups that are short before you name a lineup.
            </p>
            <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
              <Badge tone="positive">24 registered</Badge>
              <Badge tone="warning">One goalkeeper short</Badge>
              <Badge tone="neutral">Season 2026/27</Badge>
            </div>
            <Button variant="secondary" style={{ alignSelf: "flex-start" }}>See how it works</Button>
          </div>
          <TeamCompositionCard
            squadSize={24}
            groups={[
              { label: "Goalkeepers", count: 2, required: 3 },
              { label: "Defenders", count: 8, required: 8 },
              { label: "Midfielders", count: 7, required: 8 },
              { label: "Forwards", count: 7, required: 6 },
            ]}
            style={{ background: "var(--color-canvas)" }}
          />
        </div>
      </ContentBand>
      <HeroBand
        tone="dark"
        scale="lg"
        headline="One accent. One green. One place for the squad."
        subhead="Free for a single squad. Nothing to install."
        actions={<Button variant="primary" onClick={onCta}>Create team</Button>}
      />
    </>
  );
}
Object.assign(window, { LandingPage });
