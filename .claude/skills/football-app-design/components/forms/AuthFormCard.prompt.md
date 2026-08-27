Login, sign-up and invite-accept screens.

```jsx
<AuthFormCard title="Sign in" subtitle="Manage your squad, matches and reports." submitLabel="Continue">
  <TextInput label="Email" type="email" />
  <TextInput label="Password" type="password" />
</AuthFormCard>
```

- Sage `#f1f5f9` fill, 24px radius, 24px padding, capped at 420px wide. Centre it on a white page so the surface contrast reads.
- The submit control is the green pill; put "Create an account" in the `secondary` slot as a tertiary Button.
