function MarketingShell({ page, setPage, children, onCta }) {
  const { NavBar, NavLink, Footer, Button } = window.FootballAppDesignSystem_49d016;
  const nav = [
    ["landing", "Product"],
    ["pricing", "Pricing"],
    ["signin", "Sign in"],
  ];
  return (
    <div style={{ background: "var(--color-canvas)" }}>
      <NavBar
        brand="Football App"
        links={nav.map(([id, label]) => (
          <NavLink key={id} href="#" active={page === id} onClick={(e) => { e.preventDefault(); setPage(id); }}>{label}</NavLink>
        ))}
        actions={<>
          <Button variant="tertiary" onClick={() => setPage("signin")}>Log in</Button>
          <Button variant="primary" onClick={onCta}>Create team</Button>
        </>}
      />
      {children}
      <Footer
        brand="Football App"
        tagline="Squads, matches and player reports in one place — from Sunday league to academy."
        columns={[
          { title: "Product", links: [{ label: "Squad" }, { label: "Matches" }, { label: "Reports" }] },
          { title: "Club", links: [{ label: "Pricing" }, { label: "Support" }, { label: "Status" }] },
          { title: "Company", links: [{ label: "About" }, { label: "Careers" }] },
        ]}
        legal="© 2026 Football App. All fixtures shown are illustrative."
      />
    </div>
  );
}
Object.assign(window, { MarketingShell });
