function AppShell({ page, setPage, title, actions, children, onSearch }) {
  const { SidebarNavRow, Badge, Button, IconButton, Icon, TextInput } = window.FootballAppDesignSystem_49d016;
  const nav = [
    ["dashboard", "Dashboard", "layout-dashboard", null],
    ["squad", "Squad", "users", "24"],
    ["matches", "Matches", "calendar", "3"],
    ["report", "Reports", "clipboard-list", null],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "248px minmax(0,1fr)", minHeight: "100vh", background: "var(--color-canvas-soft)" }}>
      <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)", padding: "var(--space-lg)", background: "var(--color-canvas)", borderRight: "1px solid var(--color-canvas-soft)" }}>
        <span style={{ font: "var(--type-display-xs)", fontWeight: "var(--font-weight-black)", letterSpacing: "var(--letter-spacing-display-xs)", padding: "var(--space-sm) var(--space-lg)" }}>Football App</span>
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-xxs)" }}>
          {nav.map(([id, label, icon, count]) => (
            <SidebarNavRow
              key={id}
              active={page === id}
              icon={<Icon name={icon} size={18} />}
              label={label}
              badge={count ? <Badge tone="neutral">{count}</Badge> : null}
              onClick={(e) => { e.preventDefault(); setPage(id); }}
            />
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-md) var(--space-lg)", borderRadius: "var(--radius-sm)", background: "var(--color-canvas-soft)" }}>
            <span style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--color-primary-pale)", color: "var(--color-ink-deep)", display: "grid", placeItems: "center", font: "var(--type-body-sm-strong)" }}>RC</span>
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ font: "var(--type-body-sm-strong)" }}>R. Calloway</span>
              <span style={{ font: "var(--type-caption)", color: "var(--color-mute)" }}>Riverside FC</span>
            </span>
          </div>
        </div>
      </aside>
      <main style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", padding: "var(--space-md) var(--space-xl)", background: "var(--color-canvas)", borderBottom: "1px solid var(--color-canvas-soft)", position: "sticky", top: 0, zIndex: 20 }}>
          <h1 style={{ font: "var(--type-display-xs)", letterSpacing: "var(--letter-spacing-display-xs)" }}>{title}</h1>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <TextInput placeholder="Search players" onChange={onSearch} iconLeft={<Icon name="search" size={18} color="var(--color-mute)" />} style={{ width: 240 }} />
            <IconButton label="Notifications" variant="outline" icon={<Icon name="bell" size={18} />} />
            {actions}
          </div>
        </header>
        <div style={{ padding: "var(--space-xl)", display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>{children}</div>
      </main>
    </div>
  );
}
Object.assign(window, { AppShell });
