Link item for the top nav — always inside `NavBar`'s `links` slot.

```jsx
<NavLink href="#squad" active>Squad</NavLink>
<NavLink href="#matches">Matches</NavLink>
```

- Set in `--type-body-sm-strong` 14/20 semibold, ink. Hover previews the underline in `--color-primary-neutral`; active locks it to `--color-primary`.
- Nav labels are single words wherever possible: Squad, Matches, Training, Reports.
