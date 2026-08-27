The product's top bar — use it on every marketing page and as the app's global header.

```jsx
<NavBar
  brand="Football App"
  links={<><NavLink active>Squad</NavLink><NavLink>Matches</NavLink><NavLink>Reports</NavLink></>}
  actions={<><Button variant="tertiary">Log in</Button><Button variant="primary">Create team</Button></>}
/>
```

- White fill on the sage page; the only separator is a 1px `--color-canvas-soft` rule. No shadow.
- Content is capped at `--container-max` 1200px and centred.
- The brand is set in type (Inter 900, display-xs). Never substitute an invented mark.
