/* @ds-bundle: {"format":4,"namespace":"FootballAppDesignSystem_49d016","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"PricingTier","sourcePath":"components/data/PricingTier.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"MatchPlannerCard","sourcePath":"components/football/MatchPlannerCard.jsx"},{"name":"MatchSummary","sourcePath":"components/football/MatchSummary.jsx"},{"name":"TeamCompositionCard","sourcePath":"components/football/TeamCompositionCard.jsx"},{"name":"AuthFormCard","sourcePath":"components/forms/AuthFormCard.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"ContentBand","sourcePath":"components/layout/ContentBand.jsx"},{"name":"HeroBand","sourcePath":"components/layout/HeroBand.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"NavLink","sourcePath":"components/navigation/NavLink.jsx"},{"name":"SidebarNavRow","sourcePath":"components/navigation/SidebarNavRow.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"2e3e666c5f28","components/core/Button.jsx":"9f161e61a4ef","components/core/Card.jsx":"08829f323ca1","components/core/Icon.jsx":"fee148de0437","components/core/IconButton.jsx":"75c76b4bf890","components/data/DataTable.jsx":"a4eba0c04f19","components/data/PricingTier.jsx":"b979de3d5290","components/feedback/EmptyState.jsx":"d34a2504feee","components/feedback/Modal.jsx":"ddba3e03288c","components/feedback/Toast.jsx":"faf8ab996100","components/football/MatchPlannerCard.jsx":"ba0d859d1087","components/football/MatchSummary.jsx":"1790df0ade88","components/football/TeamCompositionCard.jsx":"36c69f93ac76","components/forms/AuthFormCard.jsx":"05be195e25f3","components/forms/TextInput.jsx":"0d9073488948","components/layout/ContentBand.jsx":"3322bb0d5f90","components/layout/HeroBand.jsx":"159bbdb384ad","components/navigation/Footer.jsx":"71b1172c7640","components/navigation/NavBar.jsx":"2fba40acf66e","components/navigation/NavLink.jsx":"5117958eb549","components/navigation/SidebarNavRow.jsx":"fa6b8a07c78e","ui_kits/app/AppShell.jsx":"46f10fe45503","ui_kits/app/DashboardScreen.jsx":"0f052e58af16","ui_kits/app/MatchesScreen.jsx":"f28f4020f3f8","ui_kits/app/PlayerReportScreen.jsx":"0a0f4a930e4d","ui_kits/app/SquadScreen.jsx":"89da2a5ddf4c","ui_kits/marketing/LandingPage.jsx":"6cbfabf27cbe","ui_kits/marketing/MarketingShell.jsx":"155d0bbc48d8","ui_kits/marketing/PricingPage.jsx":"4254b236fa1c","ui_kits/marketing/SignInPage.jsx":"b46a6df880dc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FootballAppDesignSystem_49d016 = window.FootballAppDesignSystem_49d016 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  positive: {
    background: "var(--color-primary-pale)",
    color: "var(--color-positive-deep)"
  },
  negative: {
    background: "var(--color-negative-bg)",
    color: "var(--color-canvas)"
  },
  warning: {
    background: "var(--color-warning)",
    color: "var(--color-warning-content)"
  },
  neutral: {
    background: "var(--color-canvas-soft)",
    color: "var(--color-ink)"
  },
  ink: {
    background: "var(--color-ink)",
    color: "var(--color-primary)"
  }
};

/** Pill status badge. Positive and negative are the two tones defined by the system. */
function Badge({
  tone = "positive",
  icon,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.positive;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-xs)",
      padding: "var(--space-xs) var(--space-md)",
      borderRadius: "var(--radius-badge)",
      background: t.background,
      color: t.color,
      font: "var(--type-body-sm-strong)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
    border: "1px solid transparent",
    hoverBackground: "var(--color-primary-active)"
  },
  secondary: {
    background: "var(--color-canvas-soft)",
    color: "var(--color-ink)",
    border: "1px solid transparent",
    hoverBackground: "var(--color-primary-pale)"
  },
  tertiary: {
    background: "var(--color-canvas)",
    color: "var(--color-ink)",
    border: "1px solid var(--color-ink)",
    hoverBackground: "var(--color-canvas-soft)"
  }
};

/** The 24px-radius pill CTA. Primary is Football green — the system's only accent. */
function Button({
  variant = "primary",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  href,
  type = "button",
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    type: href ? undefined : type,
    disabled: href ? undefined : disabled,
    "aria-disabled": disabled ? "true" : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-sm)",
      padding: "var(--space-md) var(--space-xl)",
      minHeight: "var(--touch-target-min)",
      borderRadius: "var(--radius-button)",
      border: v.border,
      background: disabled ? v.background : hover ? v.hoverBackground : v.background,
      color: v.color,
      font: "var(--type-button-md)",
      textDecoration: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transform: press && !disabled ? "scale(var(--press-scale))" : "none",
      transition: "var(--transition-interactive)",
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  content: {
    background: "var(--surface-card)",
    color: "var(--color-ink)",
    border: "none"
  },
  sage: {
    background: "var(--surface-card-sage)",
    color: "var(--color-ink)",
    border: "none"
  },
  green: {
    background: "var(--surface-card-green)",
    color: "var(--color-ink)",
    border: "none"
  },
  dark: {
    background: "var(--surface-card-dark)",
    color: "var(--color-primary)",
    border: "none"
  },
  outline: {
    background: "var(--surface-card)",
    color: "var(--color-ink)",
    border: "1px solid var(--color-ink)"
  }
};

/** The 24px-radius surface. Four fills: white content, sage, pale green, ink-dark. */
function Card({
  variant = "content",
  padding,
  eyebrow,
  title,
  children,
  footer,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.content;
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)",
      padding: padding || "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: v.background,
      color: v.color,
      border: v.border,
      font: "var(--type-body-md)",
      ...style
    }
  }, rest), eyebrow ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: variant === "dark" ? "var(--color-primary)" : "var(--color-mute)"
    }
  }, eyebrow) : null, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)",
      color: "inherit"
    }
  }, title) : null, children, footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-sm)"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LUCIDE_BASE = "https://unpkg.com/lucide-static@0.544.0/icons/";

/**
 * Lucide glyph rendered as a CSS mask so it inherits currentColor.
 * The source design system shipped no icon set — Lucide is a flagged substitution.
 */
function Icon({
  name = "circle",
  size = 20,
  color = "currentColor",
  label,
  style,
  ...rest
}) {
  const url = 'url("' + LUCIDE_BASE + name + '.svg")';
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": label ? undefined : "true",
    "aria-label": label,
    role: label ? "img" : undefined,
    style: {
      display: "inline-block",
      flex: "0 0 auto",
      width: size,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular icon button — white fill, ink glyph, full radius. */
function IconButton({
  icon,
  label,
  size = 40,
  variant = "plain",
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skins = {
    plain: {
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      border: "1px solid transparent",
      hover: "var(--color-canvas-soft)"
    },
    outline: {
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      border: "1px solid var(--color-ink)",
      hover: "var(--color-canvas-soft)"
    },
    primary: {
      background: "var(--color-primary)",
      color: "var(--color-on-primary)",
      border: "1px solid transparent",
      hover: "var(--color-primary-active)"
    }
  };
  const s = skins[variant] || skins.plain;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      padding: "var(--space-sm)",
      borderRadius: "var(--radius-icon-button)",
      border: s.border,
      background: hover && !disabled ? s.hover : s.background,
      color: s.color,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transform: press && !disabled ? "scale(var(--press-scale))" : "none",
      transition: "var(--transition-interactive)",
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Data table — sage header in tracked caption, hairline rows, 12/16 cells. */
function DataTable({
  columns = [],
  rows = [],
  selectedId,
  onRowClick,
  getRowId,
  caption,
  style,
  ...rest
}) {
  const [hoverId, setHoverId] = React.useState(null);
  const rowId = getRowId || ((row, i) => row.id != null ? row.id : i);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: "var(--radius-card)",
      background: "var(--color-canvas)",
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      font: "var(--type-body-sm)",
      color: "var(--color-ink)"
    }
  }, caption ? /*#__PURE__*/React.createElement("caption", {
    style: {
      captionSide: "top",
      textAlign: "left",
      padding: "var(--space-lg)",
      font: "var(--type-body-md-strong)"
    }
  }, caption) : null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    scope: "col",
    style: {
      background: "var(--color-canvas-soft)",
      color: "var(--color-mute)",
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      textAlign: c.align || "left",
      padding: "var(--space-md) var(--space-lg)",
      width: c.width,
      whiteSpace: "nowrap"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, i) => {
    const id = rowId(row, i);
    const active = selectedId != null && selectedId === id;
    return /*#__PURE__*/React.createElement("tr", {
      key: id,
      onClick: onRowClick ? () => onRowClick(row, id) : undefined,
      onMouseEnter: () => setHoverId(id),
      onMouseLeave: () => setHoverId(null),
      style: {
        background: active ? "var(--color-primary-pale)" : hoverId === id ? "var(--color-canvas-soft)" : "var(--color-canvas)",
        cursor: onRowClick ? "pointer" : "default",
        transition: "background-color var(--duration-fast) var(--ease-out)"
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: "var(--space-md) var(--space-lg)",
        borderTop: "1px solid var(--color-canvas-soft)",
        textAlign: c.align || "left",
        color: c.mute ? "var(--color-mute)" : "var(--color-ink)",
        font: c.strong ? "var(--type-body-sm-strong)" : "var(--type-body-sm)"
      }
    }, c.render ? c.render(row) : row[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/PricingTier.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Plan / tier card. `featured` flips polarity to the ink surface.
 * NOTE: the source spec pairs the featured ink fill with `on-primary` (also ink) text —
 * an unreadable combination, resolved here to canvas-white type on ink.
 */
function PricingTier({
  name,
  price,
  period = "/ month",
  description,
  features = [],
  featured = false,
  badge,
  ctaLabel = "Choose plan",
  onSelect,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: featured ? "var(--color-ink)" : "var(--color-canvas-soft)",
      color: featured ? "var(--color-canvas)" : "var(--color-ink)",
      border: featured ? "1px solid var(--color-ink)" : "1px solid var(--color-mute)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-md-strong)",
      color: featured ? "var(--color-primary)" : "var(--color-ink)"
    }
  }, name), badge), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-md)",
      color: "inherit"
    }
  }, price), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: featured ? "var(--color-primary-neutral)" : "var(--color-mute)"
    }
  }, period)), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: featured ? "var(--color-canvas-soft)" : "var(--color-body)"
    }
  }, description) : null, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, features.map(f => /*#__PURE__*/React.createElement("li", {
    key: typeof f === "string" ? f : f.key,
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      font: "var(--type-body-sm)",
      color: featured ? "var(--color-canvas-soft)" : "var(--color-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--color-primary)",
      fontWeight: "var(--font-weight-black)"
    }
  }, "\xB7"), f))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSelect,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      marginTop: "auto",
      minHeight: "var(--touch-target-min)",
      padding: "var(--space-md) var(--space-xl)",
      borderRadius: "var(--radius-button)",
      border: featured ? "1px solid transparent" : "1px solid var(--color-ink)",
      background: featured ? hover ? "var(--color-primary-active)" : "var(--color-primary)" : hover ? "var(--color-canvas-soft)" : "var(--color-canvas)",
      color: "var(--color-ink)",
      font: "var(--type-button-md)",
      cursor: "pointer",
      transition: "var(--transition-interactive)"
    }
  }, ctaLabel));
}
Object.assign(__ds_scope, { PricingTier });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PricingTier.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Empty-state frame — sage fill, 48px padding, centred caption in body-md. */
function EmptyState({
  media,
  title,
  caption,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-lg)",
      textAlign: "center",
      padding: "var(--space-3xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-card-sage)",
      color: "var(--color-ink)",
      ...style
    }
  }, rest), media ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 72,
      height: 72,
      borderRadius: "var(--radius-full)",
      background: "var(--color-primary-pale)",
      color: "var(--color-ink-deep)"
    }
  }, media) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title) : null, caption ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-md)",
      color: "var(--color-body)",
      maxWidth: "44ch"
    }
  }, caption) : null), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Modal dialog surface — card chrome plus the derived overlay shadow and ink scrim. */
function Modal({
  open = true,
  title,
  description,
  children,
  actions,
  onClose,
  width = 480,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      padding: "var(--space-xl)",
      background: "var(--scrim-overlay)",
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === "string" ? title : undefined,
    onClick: e => e.stopPropagation(),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      width: "100%",
      maxWidth: width,
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      boxShadow: "var(--shadow-overlay)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)",
      flex: 1
    }
  }, title ? /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title) : null, description ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-body)"
    }
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      width: 32,
      height: 32,
      display: "grid",
      placeItems: "center",
      border: "none",
      borderRadius: "var(--radius-full)",
      background: "var(--color-canvas-soft)",
      color: "var(--color-ink)",
      cursor: "pointer",
      font: "var(--type-body-md-strong)",
      lineHeight: 1
    }
  }, "\xD7") : null), children, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-md)",
      justifyContent: "flex-end"
    }
  }, actions) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const RAILS = {
  neutral: "var(--color-ink)",
  positive: "var(--color-positive)",
  warning: "var(--color-warning)",
  negative: "var(--color-negative)"
};

/** Toast notification — card shape, 12/16 padding, body-sm, floating shadow. */
function Toast({
  tone = "neutral",
  icon,
  title,
  message,
  action,
  onDismiss,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-md)",
      width: "100%",
      maxWidth: 400,
      padding: "var(--space-md) var(--space-lg)",
      borderRadius: "var(--radius-card)",
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      font: "var(--type-body-sm)",
      boxShadow: "var(--shadow-floating)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      alignSelf: "stretch",
      width: 3,
      borderRadius: "var(--radius-pill)",
      background: RAILS[tone] || RAILS.neutral,
      flex: "0 0 auto"
    }
  }), icon, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xxs)",
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm-strong)"
    }
  }, title) : null, message ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-body)"
    }
  }, message) : null), action, onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      border: "none",
      background: "transparent",
      color: "var(--color-mute)",
      cursor: "pointer",
      font: "var(--type-body-md-strong)",
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/football/MatchPlannerCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FIELD_STYLE = {
  width: "100%",
  padding: "var(--space-md) var(--space-lg)",
  borderRadius: "var(--radius-input)",
  border: "1px solid var(--color-ink)",
  background: "var(--color-canvas)",
  color: "var(--color-ink)",
  font: "var(--type-body-md)",
  appearance: "none"
};

/**
 * The system's signature interactive widget — white card with a 1px ink hairline
 * hosting the team and player selectors, kickoff details and the primary CTA.
 */
function MatchPlannerCard({
  eyebrow = "Match planner",
  teams = [],
  players = [],
  formations = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"],
  defaultHome,
  defaultAway,
  defaultFormation,
  ctaLabel = "Plan match",
  onPlan,
  style,
  ...rest
}) {
  const [home, setHome] = React.useState(defaultHome || teams[0] || "");
  const [away, setAway] = React.useState(defaultAway || teams[1] || "");
  const [formation, setFormation] = React.useState(defaultFormation || formations[0]);
  const [captain, setCaptain] = React.useState(players[0] || "");
  const swap = () => {
    setHome(away);
    setAway(home);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      width: "100%",
      maxWidth: 420,
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      border: "1px solid var(--color-ink)",
      font: "var(--type-body-md)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-mute)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, "Home"), /*#__PURE__*/React.createElement("select", {
    value: home,
    onChange: e => setHome(e.target.value),
    style: FIELD_STYLE
  }, teams.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, "Away"), /*#__PURE__*/React.createElement("select", {
    value: away,
    onChange: e => setAway(e.target.value),
    style: FIELD_STYLE
  }, teams.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Swap home and away",
    onClick: swap,
    style: {
      position: "absolute",
      right: "var(--space-lg)",
      top: "50%",
      transform: "translateY(-50%)",
      width: 36,
      height: 36,
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-full)",
      border: "1px solid var(--color-ink)",
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      cursor: "pointer",
      font: "var(--type-body-sm-strong)"
    }
  }, "\u21C5")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, "Formation"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-sm)"
    }
  }, formations.map(f => {
    const on = f === formation;
    return /*#__PURE__*/React.createElement("button", {
      key: f,
      type: "button",
      onClick: () => setFormation(f),
      "aria-pressed": on,
      style: {
        padding: "var(--space-xs) var(--space-md)",
        borderRadius: "var(--radius-pill)",
        border: "1px solid " + (on ? "transparent" : "var(--color-mute)"),
        background: on ? "var(--color-primary-pale)" : "var(--color-canvas)",
        color: on ? "var(--color-ink-deep)" : "var(--color-body)",
        font: "var(--type-body-sm-strong)",
        cursor: "pointer",
        transition: "var(--transition-interactive)"
      }
    }, f);
  }))), players.length ? /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, "Captain"), /*#__PURE__*/React.createElement("select", {
    value: captain,
    onChange: e => setCaptain(e.target.value),
    style: FIELD_STYLE
  }, players.map(p => /*#__PURE__*/React.createElement("option", {
    key: p,
    value: p
  }, p)))) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onPlan && onPlan({
      home,
      away,
      formation,
      captain
    }),
    style: {
      minHeight: "var(--touch-target-min)",
      padding: "var(--space-md) var(--space-xl)",
      borderRadius: "var(--radius-button)",
      border: "1px solid transparent",
      background: "var(--color-primary)",
      color: "var(--color-on-primary)",
      font: "var(--type-button-md)",
      cursor: "pointer"
    }
  }, ctaLabel));
}
Object.assign(__ds_scope, { MatchPlannerCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/MatchPlannerCard.jsx", error: String((e && e.message) || e) }); }

// components/football/MatchSummary.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Match summary — white card with sage-divided line items and a total row. */
function MatchSummary({
  title = "Match summary",
  meta,
  items = [],
  total,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      width: "100%",
      maxWidth: 400,
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title), meta ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-mute)"
    }
  }, meta) : null), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: it.label,
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-lg)",
      padding: "var(--space-md) 0",
      borderTop: i === 0 ? "none" : "1px solid var(--color-canvas-soft)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xxs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm-strong)"
    }
  }, it.label), it.note ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, it.note) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm-strong)",
      whiteSpace: "nowrap"
    }
  }, it.value)))), total ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      paddingTop: "var(--space-md)",
      borderTop: "1px solid var(--color-ink)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-md-strong)"
    }
  }, total.label || "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, total.value)) : null, action);
}
Object.assign(__ds_scope, { MatchSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/MatchSummary.jsx", error: String((e && e.message) || e) }); }

// components/football/TeamCompositionCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Team composition summary — sage card with per-position fill bars in Football green. */
function TeamCompositionCard({
  title = "Squad composition",
  squadSize,
  groups = [],
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-card-sage)",
      color: "var(--color-ink)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-md)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title), squadSize != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-mute)"
    }
  }, squadSize, " registered") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)"
    }
  }, groups.map(g => {
    const pct = g.required ? Math.min(100, Math.round(g.count / g.required * 100)) : 100;
    const short = g.required != null && g.count < g.required;
    return /*#__PURE__*/React.createElement("div", {
      key: g.label,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        font: "var(--type-body-sm-strong)"
      }
    }, /*#__PURE__*/React.createElement("span", null, g.label), /*#__PURE__*/React.createElement("span", {
      style: {
        color: short ? "var(--color-warning-deep)" : "var(--color-body)"
      }
    }, g.count, g.required != null ? " / " + g.required : "")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8,
        borderRadius: "var(--radius-pill)",
        background: "var(--color-canvas)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: pct + "%",
        height: "100%",
        borderRadius: "var(--radius-pill)",
        background: short ? "var(--color-warning)" : "var(--color-primary)"
      }
    })));
  })), footer);
}
Object.assign(__ds_scope, { TeamCompositionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/football/TeamCompositionCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/AuthFormCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Sign-in / registration card — sage feature-card chrome wrapping text inputs. */
function AuthFormCard({
  title = "Sign in",
  subtitle,
  children,
  submitLabel = "Continue",
  onSubmit,
  secondary,
  footnote,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("form", _extends({
    onSubmit: onSubmit,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)",
      width: "100%",
      maxWidth: 420,
      padding: "var(--space-xl)",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-card-sage)",
      color: "var(--color-ink)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-body)"
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "var(--touch-target-min)",
      padding: "var(--space-md) var(--space-xl)",
      borderRadius: "var(--radius-button)",
      border: "1px solid transparent",
      background: "var(--color-primary)",
      color: "var(--color-on-primary)",
      font: "var(--type-button-md)",
      cursor: "pointer"
    }
  }, submitLabel), secondary), footnote ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, footnote) : null);
}
Object.assign(__ds_scope, { AuthFormCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/AuthFormCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The canonical input — 1px ink hairline, 12px radius, body-md. */
function TextInput({
  label,
  hint,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  iconLeft,
  suffix,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || "input-" + React.useId();
  const borderColor = error ? "var(--color-negative-deep)" : "var(--color-ink)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      font: "var(--type-body-sm-strong)",
      color: "var(--color-ink)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-sm)",
      padding: "var(--space-md) var(--space-lg)",
      borderRadius: "var(--radius-input)",
      background: "var(--color-canvas)",
      border: "1px solid " + borderColor,
      outline: focus ? "2px solid var(--color-primary)" : "none",
      outlineOffset: 1,
      opacity: disabled ? 0.5 : 1,
      transition: "var(--transition-interactive)"
    }
  }, iconLeft, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body-md)",
      color: "var(--color-ink)"
    }
  }, rest)), suffix), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-negative-darkest)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/layout/ContentBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The white content band that follows the hero — section heading in display-md. */
function ContentBand({
  tone = "canvas",
  eyebrow,
  heading,
  intro,
  actions,
  children,
  columns,
  style,
  ...rest
}) {
  const fills = {
    canvas: {
      background: "var(--color-canvas)",
      color: "var(--color-ink)"
    },
    sage: {
      background: "var(--color-canvas-soft)",
      color: "var(--color-ink)"
    },
    dark: {
      background: "var(--color-ink)",
      color: "var(--color-canvas-soft)"
    }
  };
  const f = fills[tone] || fills.canvas;
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: f.background,
      color: f.color,
      padding: "var(--space-3xl) var(--space-xl)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2xl)"
    }
  }, eyebrow || heading || intro || actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: "var(--space-xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)",
      flex: "1 1 420px"
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: tone === "dark" ? "var(--color-primary)" : "var(--color-mute)"
    }
  }, eyebrow) : null, heading ? /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-display-md)",
      color: "inherit"
    }
  }, heading) : null, intro ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-lg)",
      color: tone === "dark" ? "var(--color-canvas-soft)" : "var(--color-body)",
      maxWidth: "58ch"
    }
  }, intro) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-md)",
      marginLeft: "auto"
    }
  }, actions) : null) : null, columns ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(" + columns + ", minmax(0,1fr))",
      gap: "var(--space-xl)"
    }
  }, children) : children));
}
Object.assign(__ds_scope, { ContentBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ContentBand.jsx", error: String((e && e.message) || e) }); }

// components/layout/HeroBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SCALES = {
  mega: {
    font: "var(--type-display-mega)",
    letterSpacing: "var(--letter-spacing-none)"
  },
  xxl: {
    font: "var(--type-display-xxl)",
    letterSpacing: "var(--letter-spacing-none)"
  },
  xl: {
    font: "var(--type-display-xl)",
    letterSpacing: "var(--letter-spacing-none)"
  },
  lg: {
    font: "var(--type-display-lg)",
    letterSpacing: "var(--letter-spacing-display-lg)"
  }
};

/** The hero band — sage canvas or polarity-flipped ink, headline in Inter 900. */
function HeroBand({
  tone = "sage",
  scale = "xl",
  eyebrow,
  headline,
  subhead,
  actions,
  aside,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  const s = SCALES[scale] || SCALES.xl;
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: dark ? "var(--color-ink)" : "var(--color-canvas-soft)",
      color: dark ? "var(--color-primary)" : "var(--color-ink)",
      padding: "var(--space-3xl) var(--space-xl)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: aside ? "minmax(0,1.1fr) minmax(0,0.9fr)" : "minmax(0,1fr)",
      gap: "var(--space-3xl)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xl)"
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: dark ? "var(--color-primary-neutral)" : "var(--color-mute)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: s.font,
      letterSpacing: s.letterSpacing,
      color: "inherit",
      textWrap: "balance"
    }
  }, headline), subhead ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-lg)",
      color: dark ? "var(--color-canvas-soft)" : "var(--color-body)",
      maxWidth: "52ch"
    }
  }, subhead) : null, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-md)"
    }
  }, actions) : null), aside ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, aside) : null));
}
Object.assign(__ds_scope, { HeroBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/HeroBand.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The dark footer band — ink fill, sage type, 48/24 padding. */
function Footer({
  brand = "Football App",
  tagline,
  columns = [],
  legal,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("footer", _extends({
    style: {
      background: "var(--color-ink)",
      color: "var(--color-canvas-soft)",
      font: "var(--type-body-sm)",
      padding: "var(--space-3xl) var(--space-xl)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 220,
      flex: "1 1 220px",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-xs)",
      fontWeight: "var(--font-weight-black)",
      color: "var(--color-primary)"
    }
  }, brand), tagline ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-canvas-soft)",
      opacity: 0.72,
      maxWidth: "34ch"
    }
  }, tagline) : null), columns.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.title,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)",
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-mute)"
    }
  }, col.title), (col.links || []).map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || "#",
    style: {
      color: "var(--color-canvas-soft)",
      textDecoration: "none",
      opacity: 0.82
    }
  }, l.label))))), legal ? /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "var(--space-2xl) auto 0",
      paddingTop: "var(--space-lg)",
      borderTop: "1px solid rgb(255 255 255 / 0.12)",
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, legal) : null);
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sticky top nav — white band, ink type, 12/24 padding.
 * The brand slot renders the wordmark as type: no logo file exists in the source system.
 */
function NavBar({
  brand = "Football App",
  links,
  actions,
  sticky = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      position: sticky ? "sticky" : "static",
      top: 0,
      zIndex: 20,
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      borderBottom: "1px solid var(--color-canvas-soft)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2xl)",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-md) var(--space-xl)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: "var(--type-display-xs)",
      fontWeight: "var(--font-weight-black)",
      letterSpacing: "var(--letter-spacing-display-xs)",
      color: "var(--color-ink)",
      textDecoration: "none",
      whiteSpace: "nowrap"
    }
  }, brand), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-xl)",
      marginLeft: "var(--space-lg)"
    }
  }, links), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-sm)",
      marginLeft: "auto"
    }
  }, actions)));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Nav link in body-sm-strong. Active state carries a Football-green underline. */
function NavLink({
  href = "#",
  active = false,
  icon,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    "aria-current": active ? "page" : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-xs)",
      padding: "var(--space-sm) 0",
      color: "var(--color-ink)",
      font: "var(--type-body-sm-strong)",
      textDecoration: "none",
      borderBottom: "2px solid " + (active ? "var(--color-primary)" : hover ? "var(--color-primary-neutral)" : "transparent"),
      transition: "var(--transition-interactive)",
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { NavLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavLink.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNavRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** App-shell sidebar row. Active state uses a Football-green indicator bar. */
function SidebarNavRow({
  icon,
  label,
  badge,
  active = false,
  href = "#",
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick,
    "aria-current": active ? "page" : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-md)",
      padding: "var(--space-md) var(--space-lg)",
      borderRadius: "var(--radius-sm)",
      background: active ? "var(--color-primary-pale)" : hover ? "var(--color-canvas-soft)" : "var(--color-canvas)",
      color: active ? "var(--color-ink-deep)" : "var(--color-body)",
      font: active ? "var(--type-body-sm-strong)" : "var(--type-body-sm)",
      textDecoration: "none",
      transition: "var(--transition-interactive)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      left: 0,
      top: "var(--space-sm)",
      bottom: "var(--space-sm)",
      width: 3,
      borderRadius: "var(--radius-pill)",
      background: active ? "var(--color-primary)" : "transparent"
    }
  }), icon, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), badge);
}
Object.assign(__ds_scope, { SidebarNavRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNavRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
function AppShell({
  page,
  setPage,
  title,
  actions,
  children,
  onSearch
}) {
  const {
    SidebarNavRow,
    Badge,
    Button,
    IconButton,
    Icon,
    TextInput
  } = window.FootballAppDesignSystem_49d016;
  const nav = [["dashboard", "Dashboard", "layout-dashboard", null], ["squad", "Squad", "users", "24"], ["matches", "Matches", "calendar", "3"], ["report", "Reports", "clipboard-list", null]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "248px minmax(0,1fr)",
      minHeight: "100vh",
      background: "var(--color-canvas-soft)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xl)",
      padding: "var(--space-lg)",
      background: "var(--color-canvas)",
      borderRight: "1px solid var(--color-canvas-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-xs)",
      fontWeight: "var(--font-weight-black)",
      letterSpacing: "var(--letter-spacing-display-xs)",
      padding: "var(--space-sm) var(--space-lg)"
    }
  }, "Football App"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xxs)"
    }
  }, nav.map(([id, label, icon, count]) => /*#__PURE__*/React.createElement(SidebarNavRow, {
    key: id,
    active: page === id,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 18
    }),
    label: label,
    badge: count ? /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, count) : null,
    onClick: e => {
      e.preventDefault();
      setPage(id);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-md)",
      padding: "var(--space-md) var(--space-lg)",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-canvas-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "var(--radius-full)",
      background: "var(--color-primary-pale)",
      color: "var(--color-ink-deep)",
      display: "grid",
      placeItems: "center",
      font: "var(--type-body-sm-strong)"
    }
  }, "RC"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm-strong)"
    }
  }, "R. Calloway"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--color-mute)"
    }
  }, "Riverside FC"))))), /*#__PURE__*/React.createElement("main", {
    style: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-lg)",
      padding: "var(--space-md) var(--space-xl)",
      background: "var(--color-canvas)",
      borderBottom: "1px solid var(--color-canvas-soft)",
      position: "sticky",
      top: 0,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-display-xs)",
      letterSpacing: "var(--letter-spacing-display-xs)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Search players",
    onChange: onSearch,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 18,
      color: "var(--color-mute)"
    }),
    style: {
      width: 240
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "outline",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 18
    })
  }), actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-xl)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xl)"
    }
  }, children)));
}
Object.assign(window, {
  AppShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/DashboardScreen.jsx
try { (() => {
function StatCard({
  variant,
  label,
  value,
  note
}) {
  const {
    Card
  } = window.FootballAppDesignSystem_49d016;
  const dark = variant === "dark";
  return /*#__PURE__*/React.createElement(Card, {
    variant: variant,
    eyebrow: label
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-md)",
      color: "inherit"
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: dark ? "var(--color-primary-neutral)" : "var(--color-mute)"
    }
  }, note));
}
function DashboardScreen({
  onOpenMatches
}) {
  const {
    TeamCompositionCard,
    MatchSummary,
    DataTable,
    Badge,
    Button
  } = window.FootballAppDesignSystem_49d016;
  const fixtures = [{
    id: 1,
    date: "Sat 5 Sep",
    opponent: "Northgate United",
    venue: "Home",
    status: "Squad named",
    tone: "positive"
  }, {
    id: 2,
    date: "Sat 12 Sep",
    opponent: "Eastvale Athletic",
    venue: "Away",
    status: "Availability open",
    tone: "warning"
  }, {
    id: 3,
    date: "Wed 16 Sep",
    opponent: "Kirkhaven Rangers",
    venue: "Home",
    status: "Not planned",
    tone: "neutral"
  }, {
    id: 4,
    date: "Sat 26 Sep",
    opponent: "Portmere Town",
    venue: "Away",
    status: "Not planned",
    tone: "neutral"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0,1fr))",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    variant: "content",
    label: "Registered",
    value: "24",
    note: "Squad size"
  }), /*#__PURE__*/React.createElement(StatCard, {
    variant: "green",
    label: "Available Saturday",
    value: "19",
    note: "Five unconfirmed"
  }), /*#__PURE__*/React.createElement(StatCard, {
    variant: "sage",
    label: "Average rating",
    value: "7.6",
    note: "Last five matches"
  }), /*#__PURE__*/React.createElement(StatCard, {
    variant: "dark",
    label: "Clean sheets",
    value: "4",
    note: "Season to date"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
      gap: "var(--space-xl)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    caption: "Upcoming fixtures",
    rows: fixtures,
    columns: [{
      key: "date",
      label: "Date",
      strong: true,
      width: "110px"
    }, {
      key: "opponent",
      label: "Opponent"
    }, {
      key: "venue",
      label: "Venue",
      mute: true,
      width: "80px"
    }, {
      key: "status",
      label: "Status",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.status)
    }]
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    style: {
      alignSelf: "flex-start"
    },
    onClick: onOpenMatches
  }, "Plan the next match")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(TeamCompositionCard, {
    squadSize: 24,
    groups: [{
      label: "Goalkeepers",
      count: 2,
      required: 3
    }, {
      label: "Defenders",
      count: 8,
      required: 8
    }, {
      label: "Midfielders",
      count: 7,
      required: 8
    }, {
      label: "Forwards",
      count: 7,
      required: 6
    }],
    footer: /*#__PURE__*/React.createElement(Badge, {
      tone: "warning"
    }, "Two positions short")
  }), /*#__PURE__*/React.createElement(MatchSummary, {
    title: "Saturday 15:00",
    meta: "Riverside Park \xB7 Pitch 2 \xB7 vs Northgate United",
    items: [{
      label: "Pitch hire",
      note: "90 minutes",
      value: "£120"
    }, {
      label: "Referee",
      value: "£45"
    }, {
      label: "Kit wash",
      note: "Home strip",
      value: "£18"
    }],
    total: {
      label: "Matchday cost",
      value: "£183"
    },
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      onClick: onOpenMatches
    }, "Review lineup"),
    style: {
      maxWidth: "none"
    }
  }))));
}
Object.assign(window, {
  DashboardScreen,
  StatCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MatchesScreen.jsx
try { (() => {
function MatchesScreen({
  onPlan
}) {
  const {
    MatchPlannerCard,
    MatchSummary,
    DataTable,
    Badge,
    Button,
    Card
  } = window.FootballAppDesignSystem_49d016;
  const [plan, setPlan] = React.useState({
    home: "Riverside FC",
    away: "Northgate United",
    formation: "4-3-3",
    captain: "A. Ferreira"
  });
  const results = [{
    id: 1,
    date: "Sat 22 Aug",
    opponent: "Portmere Town",
    score: "2 – 1",
    outcome: "Won",
    tone: "positive"
  }, {
    id: 2,
    date: "Sat 15 Aug",
    opponent: "Kirkhaven Rangers",
    score: "0 – 0",
    outcome: "Drew",
    tone: "neutral"
  }, {
    id: 3,
    date: "Wed 12 Aug",
    opponent: "Eastvale Athletic",
    score: "1 – 3",
    outcome: "Lost",
    tone: "negative"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,420px) minmax(0,1fr) minmax(0,360px)",
      gap: "var(--space-xl)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(MatchPlannerCard, {
    teams: ["Riverside FC", "Northgate United", "Eastvale Athletic", "Kirkhaven Rangers"],
    players: ["A. Ferreira", "J. Okafor", "M. Lindqvist", "D. Osei"],
    defaultHome: plan.home,
    defaultAway: plan.away,
    onPlan: sel => {
      setPlan(sel);
      onPlan && onPlan(sel);
    },
    style: {
      maxWidth: "none"
    }
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "sage",
    eyebrow: "Lineup",
    title: plan.formation + " · " + plan.home
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-body)"
    }
  }, "Captain ", plan.captain, ". Nineteen of twenty-four available; two positions short of target."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0,1fr))",
      gap: "var(--space-sm)"
    }
  }, ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"].map((slot, i) => /*#__PURE__*/React.createElement("span", {
    key: slot + i,
    style: {
      padding: "var(--space-sm) var(--space-md)",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-canvas)",
      font: "var(--type-body-sm-strong)",
      textAlign: "center"
    }
  }, slot))), /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    style: {
      alignSelf: "flex-start"
    }
  }, "Edit lineup")), /*#__PURE__*/React.createElement(MatchSummary, {
    title: "Saturday 15:00",
    meta: plan.home + " vs " + plan.away,
    items: [{
      label: "Pitch hire",
      note: "90 minutes",
      value: "£120"
    }, {
      label: "Referee",
      value: "£45"
    }, {
      label: "Kit wash",
      note: "Home strip",
      value: "£18"
    }],
    total: {
      label: "Matchday cost",
      value: "£183"
    },
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      onClick: () => onPlan && onPlan(plan)
    }, "Confirm match"),
    style: {
      maxWidth: "none"
    }
  })), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Recent results",
    rows: results,
    columns: [{
      key: "date",
      label: "Date",
      strong: true,
      width: "120px"
    }, {
      key: "opponent",
      label: "Opponent"
    }, {
      key: "score",
      label: "Score",
      align: "center",
      width: "100px"
    }, {
      key: "outcome",
      label: "Outcome",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.outcome)
    }]
  }));
}
Object.assign(window, {
  MatchesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MatchesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PlayerReportScreen.jsx
try { (() => {
function PlayerReportScreen({
  player,
  onBack
}) {
  const {
    Card,
    Badge,
    DataTable,
    Button,
    Icon,
    TeamCompositionCard
  } = window.FootballAppDesignSystem_49d016;
  const p = player || {
    name: "A. Ferreira",
    pos: "ST",
    apps: 6,
    rating: "8.4",
    status: "Available",
    tone: "positive"
  };
  const matches = [{
    id: 1,
    date: "Sat 22 Aug",
    opponent: "Portmere Town",
    minutes: 90,
    rating: "8.6",
    note: "Two goals"
  }, {
    id: 2,
    date: "Sat 15 Aug",
    opponent: "Kirkhaven Rangers",
    minutes: 78,
    rating: "7.4",
    note: "Held up play"
  }, {
    id: 3,
    date: "Wed 12 Aug",
    opponent: "Eastvale Athletic",
    minutes: 90,
    rating: "8.1",
    note: "One assist"
  }, {
    id: 4,
    date: "Sat 2 Aug",
    opponent: "Northgate United",
    minutes: 62,
    rating: "7.9",
    note: "Substituted"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-md)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 18
    }),
    onClick: onBack
  }, "Back to squad")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)",
      gap: "var(--space-xl)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "dark",
    eyebrow: "Season report",
    title: p.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-xl)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-display-md)"
    }
  }, p.rating), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-primary-neutral)"
    }
  }, "average across ", p.apps, " appearances"))), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Match ratings",
    rows: matches,
    columns: [{
      key: "date",
      label: "Date",
      strong: true,
      width: "120px"
    }, {
      key: "opponent",
      label: "Opponent"
    }, {
      key: "minutes",
      label: "Mins",
      align: "right",
      width: "72px",
      mute: true
    }, {
      key: "rating",
      label: "Rating",
      align: "right",
      width: "80px"
    }, {
      key: "note",
      label: "Note",
      align: "right",
      mute: true
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "content",
    eyebrow: "Status",
    title: "Availability"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: p.tone
  }, p.status), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, p.pos), /*#__PURE__*/React.createElement(Badge, {
    tone: "ink"
  }, "Captain")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--color-body)"
    }
  }, "Cleared for Saturday. No minutes restriction.")), /*#__PURE__*/React.createElement(TeamCompositionCard, {
    title: "Minutes by position",
    groups: [{
      label: "Striker",
      count: 5,
      required: 6
    }, {
      label: "Left wing",
      count: 1,
      required: 6
    }]
  }))));
}
Object.assign(window, {
  PlayerReportScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PlayerReportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/SquadScreen.jsx
try { (() => {
const APP_SQUAD = [{
  id: 1,
  name: "A. Ferreira",
  pos: "ST",
  apps: 6,
  rating: "8.4",
  status: "Available",
  tone: "positive"
}, {
  id: 2,
  name: "J. Okafor",
  pos: "CM",
  apps: 6,
  rating: "7.9",
  status: "Available",
  tone: "positive"
}, {
  id: 3,
  name: "M. Lindqvist",
  pos: "CB",
  apps: 5,
  rating: "7.2",
  status: "Fitness check",
  tone: "warning"
}, {
  id: 4,
  name: "D. Osei",
  pos: "GK",
  apps: 6,
  rating: "8.1",
  status: "Suspended",
  tone: "negative"
}, {
  id: 5,
  name: "R. Halversen",
  pos: "LB",
  apps: 4,
  rating: "6.8",
  status: "Available",
  tone: "positive"
}, {
  id: 6,
  name: "T. Bianchi",
  pos: "RW",
  apps: 5,
  rating: "7.5",
  status: "Available",
  tone: "positive"
}, {
  id: 7,
  name: "S. Novak",
  pos: "CM",
  apps: 3,
  rating: "7.0",
  status: "Away",
  tone: "neutral"
}];
function SquadScreen({
  query,
  onSelectPlayer
}) {
  const {
    DataTable,
    Badge,
    EmptyState,
    Button,
    Card,
    Icon
  } = window.FootballAppDesignSystem_49d016;
  const [selected, setSelected] = React.useState(1);
  const rows = APP_SQUAD.filter(p => p.name.toLowerCase().includes((query || "").toLowerCase()));
  const player = APP_SQUAD.find(p => p.id === selected) || APP_SQUAD[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
      gap: "var(--space-xl)",
      alignItems: "start"
    }
  }, rows.length ? /*#__PURE__*/React.createElement(DataTable, {
    rows: rows,
    selectedId: selected,
    onRowClick: (r, id) => setSelected(id),
    columns: [{
      key: "name",
      label: "Player",
      strong: true
    }, {
      key: "pos",
      label: "Pos",
      mute: true,
      width: "64px"
    }, {
      key: "apps",
      label: "Apps",
      align: "right",
      width: "72px"
    }, {
      key: "rating",
      label: "Rating",
      align: "right",
      width: "80px"
    }, {
      key: "status",
      label: "Status",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.status)
    }]
  }) : /*#__PURE__*/React.createElement(EmptyState, {
    media: /*#__PURE__*/React.createElement(Icon, {
      name: "search-x",
      size: 26
    }),
    title: "No players match that search",
    caption: "Clear the search box to see the full squad."
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "content",
    eyebrow: "Selected player",
    title: player.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, player.pos), /*#__PURE__*/React.createElement(Badge, {
    tone: player.tone
  }, player.status)), /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: "grid",
      gridTemplateColumns: "1fr auto",
      rowGap: "var(--space-sm)",
      columnGap: "var(--space-lg)",
      font: "var(--type-body-sm)"
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      color: "var(--color-mute)"
    }
  }, "Appearances"), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      font: "var(--type-body-sm-strong)",
      textAlign: "right"
    }
  }, player.apps), /*#__PURE__*/React.createElement("dt", {
    style: {
      color: "var(--color-mute)"
    }
  }, "Average rating"), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      font: "var(--type-body-sm-strong)",
      textAlign: "right"
    }
  }, player.rating), /*#__PURE__*/React.createElement("dt", {
    style: {
      color: "var(--color-mute)"
    }
  }, "Registered"), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      font: "var(--type-body-sm-strong)",
      textAlign: "right"
    }
  }, "2026/27")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: () => onSelectPlayer && onSelectPlayer(player)
  }, "Open report")));
}
Object.assign(window, {
  SquadScreen,
  APP_SQUAD
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/SquadScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/LandingPage.jsx
try { (() => {
function LandingPage({
  onCta,
  onPlan
}) {
  const {
    HeroBand,
    ContentBand,
    Card,
    Button,
    Icon,
    MatchPlannerCard,
    TeamCompositionCard,
    Badge
  } = window.FootballAppDesignSystem_49d016;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HeroBand, {
    tone: "sage",
    scale: "xl",
    eyebrow: "Team management",
    headline: "Plan the match before the whistle.",
    subhead: "Availability, formations and player reports in one place. Built for coaches who run the squad and the spreadsheet.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onCta,
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 18
      })
    }, "Create team"), /*#__PURE__*/React.createElement(Button, {
      variant: "tertiary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "play",
        size: 18
      })
    }, "See a demo")),
    aside: /*#__PURE__*/React.createElement(MatchPlannerCard, {
      teams: ["Riverside FC", "Northgate United", "Eastvale Athletic"],
      players: ["A. Ferreira", "J. Okafor", "M. Lindqvist"],
      onPlan: onPlan
    })
  }), /*#__PURE__*/React.createElement(ContentBand, {
    eyebrow: "Why coaches switch",
    heading: "Everything a matchday needs",
    columns: 3
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "sage",
    title: "Availability",
    eyebrow: "Ask once"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-md)",
      color: "var(--color-body)"
    }
  }, "Send one request. See who is fit, who is away and who has not replied.")), /*#__PURE__*/React.createElement(Card, {
    variant: "green",
    title: "Formations",
    eyebrow: "Drag the shape"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-md)",
      color: "var(--color-body)"
    }
  }, "Switch between 4-3-3 and 3-5-2 without rebuilding the squad list.")), /*#__PURE__*/React.createElement(Card, {
    variant: "dark",
    title: "Reports",
    eyebrow: "Every match"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-md)",
      color: "var(--color-primary-neutral)"
    }
  }, "Ratings that survive the season, not a notebook that does not."))), /*#__PURE__*/React.createElement(ContentBand, {
    tone: "sage",
    eyebrow: "Squad balance",
    heading: "Know where the gaps are"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)",
      gap: "var(--space-3xl)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-lg)",
      color: "var(--color-body)",
      maxWidth: "52ch"
    }
  }, "Football App counts your registered players by position and flags the groups that are short before you name a lineup."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "24 registered"), /*#__PURE__*/React.createElement(Badge, {
    tone: "warning"
  }, "One goalkeeper short"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Season 2026/27")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    style: {
      alignSelf: "flex-start"
    }
  }, "See how it works")), /*#__PURE__*/React.createElement(TeamCompositionCard, {
    squadSize: 24,
    groups: [{
      label: "Goalkeepers",
      count: 2,
      required: 3
    }, {
      label: "Defenders",
      count: 8,
      required: 8
    }, {
      label: "Midfielders",
      count: 7,
      required: 8
    }, {
      label: "Forwards",
      count: 7,
      required: 6
    }],
    style: {
      background: "var(--color-canvas)"
    }
  }))), /*#__PURE__*/React.createElement(HeroBand, {
    tone: "dark",
    scale: "lg",
    headline: "One accent. One green. One place for the squad.",
    subhead: "Free for a single squad. Nothing to install.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onCta
    }, "Create team")
  }));
}
Object.assign(window, {
  LandingPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/LandingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/MarketingShell.jsx
try { (() => {
function MarketingShell({
  page,
  setPage,
  children,
  onCta
}) {
  const {
    NavBar,
    NavLink,
    Footer,
    Button
  } = window.FootballAppDesignSystem_49d016;
  const nav = [["landing", "Product"], ["pricing", "Pricing"], ["signin", "Sign in"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-canvas)"
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    brand: "Football App",
    links: nav.map(([id, label]) => /*#__PURE__*/React.createElement(NavLink, {
      key: id,
      href: "#",
      active: page === id,
      onClick: e => {
        e.preventDefault();
        setPage(id);
      }
    }, label)),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "tertiary",
      onClick: () => setPage("signin")
    }, "Log in"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onCta
    }, "Create team"))
  }), children, /*#__PURE__*/React.createElement(Footer, {
    brand: "Football App",
    tagline: "Squads, matches and player reports in one place \u2014 from Sunday league to academy.",
    columns: [{
      title: "Product",
      links: [{
        label: "Squad"
      }, {
        label: "Matches"
      }, {
        label: "Reports"
      }]
    }, {
      title: "Club",
      links: [{
        label: "Pricing"
      }, {
        label: "Support"
      }, {
        label: "Status"
      }]
    }, {
      title: "Company",
      links: [{
        label: "About"
      }, {
        label: "Careers"
      }]
    }],
    legal: "\xA9 2026 Football App. All fixtures shown are illustrative."
  }));
}
Object.assign(window, {
  MarketingShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/MarketingShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/PricingPage.jsx
try { (() => {
function PricingPage({
  onCta
}) {
  const {
    ContentBand,
    PricingTier,
    Badge,
    DataTable,
    Icon
  } = window.FootballAppDesignSystem_49d016;
  const yes = /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "var(--color-positive)"
  });
  const no = /*#__PURE__*/React.createElement(Icon, {
    name: "minus",
    size: 16,
    color: "var(--color-mute)"
  });
  const rows = [{
    id: 1,
    feature: "Squads",
    solo: "1",
    club: "Unlimited",
    academy: "Unlimited"
  }, {
    id: 2,
    feature: "Match planner",
    solo: yes,
    club: yes,
    academy: yes
  }, {
    id: 3,
    feature: "Evaluation reports",
    solo: no,
    club: yes,
    academy: yes
  }, {
    id: 4,
    feature: "Season archive",
    solo: no,
    club: yes,
    academy: yes
  }, {
    id: 5,
    feature: "Multi-coach access",
    solo: no,
    club: no,
    academy: yes
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ContentBand, {
    eyebrow: "Pricing",
    heading: "Pay for the squads you run",
    intro: "Every plan includes the match planner, availability requests and the full fixture list."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: "var(--space-xl)",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement(PricingTier, {
    name: "Solo",
    price: "Free",
    period: "/ forever",
    description: "One squad, one coach.",
    features: ["1 squad", "Match planner", "Availability requests"],
    ctaLabel: "Start now",
    onSelect: onCta
  }), /*#__PURE__*/React.createElement(PricingTier, {
    featured: true,
    name: "Club",
    price: "\xA324",
    description: "For clubs running more than one squad.",
    features: ["Unlimited squads", "Evaluation reports", "Season archive"],
    badge: /*#__PURE__*/React.createElement(Badge, {
      tone: "positive"
    }, "Most picked"),
    ctaLabel: "Start free trial",
    onSelect: onCta
  }), /*#__PURE__*/React.createElement(PricingTier, {
    name: "Academy",
    price: "\xA364",
    description: "Age groups, multiple coaches, one archive.",
    features: ["Multi-coach access", "Age-group reporting", "Priority support"],
    ctaLabel: "Talk to us",
    onSelect: onCta
  }))), /*#__PURE__*/React.createElement(ContentBand, {
    tone: "sage",
    eyebrow: "Compare",
    heading: "What is in each plan"
  }, /*#__PURE__*/React.createElement(DataTable, {
    rows: rows,
    columns: [{
      key: "feature",
      label: "Feature",
      strong: true
    }, {
      key: "solo",
      label: "Solo",
      align: "center"
    }, {
      key: "club",
      label: "Club",
      align: "center"
    }, {
      key: "academy",
      label: "Academy",
      align: "center"
    }]
  })));
}
Object.assign(window, {
  PricingPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/PricingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/SignInPage.jsx
try { (() => {
function SignInPage({
  onSignedIn
}) {
  const {
    AuthFormCard,
    TextInput,
    Button,
    Icon
  } = window.FootballAppDesignSystem_49d016;
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [error, setError] = React.useState(null);
  const submit = e => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a full club email address.");
    setError(null);
    onSignedIn && onSignedIn(email);
  };
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--color-canvas)",
      padding: "var(--space-3xl) var(--space-xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)",
      gap: "var(--space-3xl)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--letter-spacing-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-mute)"
    }
  }, "Coaches"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-display-md)"
    }
  }, "Back to the squad."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-lg)",
      color: "var(--color-body)",
      maxWidth: "44ch"
    }
  }, "Sign in to pick a lineup, request availability or file a match report.")), /*#__PURE__*/React.createElement(AuthFormCard, {
    title: "Sign in",
    subtitle: "Manage your squad, matches and reports.",
    submitLabel: "Continue",
    onSubmit: submit,
    footnote: "Single sign-on is available on the Academy plan.",
    secondary: /*#__PURE__*/React.createElement(Button, {
      variant: "tertiary",
      fullWidth: true
    }, "Create an account")
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Email",
    type: "email",
    placeholder: "coach@club.com",
    value: email,
    onChange: e => setEmail(e.target.value),
    error: error,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 18,
      color: "var(--color-mute)"
    })
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Password",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pw,
    onChange: e => setPw(e.target.value),
    hint: "At least 10 characters."
  }))));
}
Object.assign(window, {
  SignInPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/SignInPage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.PricingTier = __ds_scope.PricingTier;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.MatchPlannerCard = __ds_scope.MatchPlannerCard;

__ds_ns.MatchSummary = __ds_scope.MatchSummary;

__ds_ns.TeamCompositionCard = __ds_scope.TeamCompositionCard;

__ds_ns.AuthFormCard = __ds_scope.AuthFormCard;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.ContentBand = __ds_scope.ContentBand;

__ds_ns.HeroBand = __ds_scope.HeroBand;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.NavLink = __ds_scope.NavLink;

__ds_ns.SidebarNavRow = __ds_scope.SidebarNavRow;

})();
