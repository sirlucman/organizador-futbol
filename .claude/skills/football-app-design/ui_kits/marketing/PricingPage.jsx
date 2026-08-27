function PricingPage({ onCta }) {
  const { ContentBand, PricingTier, Badge, DataTable, Icon } = window.FootballAppDesignSystem_49d016;
  const yes = <Icon name="check" size={16} color="var(--color-positive)" />;
  const no = <Icon name="minus" size={16} color="var(--color-mute)" />;
  const rows = [
    { id: 1, feature: "Squads", solo: "1", club: "Unlimited", academy: "Unlimited" },
    { id: 2, feature: "Match planner", solo: yes, club: yes, academy: yes },
    { id: 3, feature: "Evaluation reports", solo: no, club: yes, academy: yes },
    { id: 4, feature: "Season archive", solo: no, club: yes, academy: yes },
    { id: 5, feature: "Multi-coach access", solo: no, club: no, academy: yes },
  ];
  return (
    <>
      <ContentBand eyebrow="Pricing" heading="Pay for the squads you run" intro="Every plan includes the match planner, availability requests and the full fixture list.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "var(--space-xl)", alignItems: "stretch" }}>
          <PricingTier name="Solo" price="Free" period="/ forever" description="One squad, one coach." features={["1 squad", "Match planner", "Availability requests"]} ctaLabel="Start now" onSelect={onCta} />
          <PricingTier featured name="Club" price="£24" description="For clubs running more than one squad." features={["Unlimited squads", "Evaluation reports", "Season archive"]} badge={<Badge tone="positive">Most picked</Badge>} ctaLabel="Start free trial" onSelect={onCta} />
          <PricingTier name="Academy" price="£64" description="Age groups, multiple coaches, one archive." features={["Multi-coach access", "Age-group reporting", "Priority support"]} ctaLabel="Talk to us" onSelect={onCta} />
        </div>
      </ContentBand>
      <ContentBand tone="sage" eyebrow="Compare" heading="What is in each plan">
        <DataTable
          rows={rows}
          columns={[
            { key: "feature", label: "Feature", strong: true },
            { key: "solo", label: "Solo", align: "center" },
            { key: "club", label: "Club", align: "center" },
            { key: "academy", label: "Academy", align: "center" },
          ]}
        />
      </ContentBand>
    </>
  );
}
Object.assign(window, { PricingPage });
