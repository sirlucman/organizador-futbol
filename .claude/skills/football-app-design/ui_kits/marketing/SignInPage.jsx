function SignInPage({ onSignedIn }) {
  const { AuthFormCard, TextInput, Button, Icon } = window.FootballAppDesignSystem_49d016;
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [error, setError] = React.useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a full club email address.");
    setError(null);
    onSignedIn && onSignedIn(email);
  };
  return (
    <section style={{ background: "var(--color-canvas)", padding: "var(--space-3xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)", gap: "var(--space-3xl)", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--letter-spacing-eyebrow)", textTransform: "uppercase", color: "var(--color-mute)" }}>Coaches</span>
          <h1 style={{ font: "var(--type-display-md)" }}>Back to the squad.</h1>
          <p style={{ font: "var(--type-body-lg)", color: "var(--color-body)", maxWidth: "44ch" }}>
            Sign in to pick a lineup, request availability or file a match report.
          </p>
        </div>
        <AuthFormCard
          title="Sign in"
          subtitle="Manage your squad, matches and reports."
          submitLabel="Continue"
          onSubmit={submit}
          footnote="Single sign-on is available on the Academy plan."
          secondary={<Button variant="tertiary" fullWidth>Create an account</Button>}
        >
          <TextInput label="Email" type="email" placeholder="coach@club.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} iconLeft={<Icon name="mail" size={18} color="var(--color-mute)" />} />
          <TextInput label="Password" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} hint="At least 10 characters." />
        </AuthFormCard>
      </div>
    </section>
  );
}
Object.assign(window, { SignInPage });
