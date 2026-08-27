import type { ReactNode, CSSProperties } from "react";

/**
 * Sticky top navigation — white band, ink type, 12/24 padding, hairline bottom rule.
 * The brand slot is TYPE ONLY: the source design system ships no logo file.
 */
export interface NavBarProps {
  /** Wordmark text rendered in Inter 900 (default "Football App") */
  brand?: ReactNode;
  /** A row of <NavLink /> elements */
  links?: ReactNode;
  /** Right-aligned actions, normally one secondary + one primary <Button /> */
  actions?: ReactNode;
  /** position: sticky (default true) */
  sticky?: boolean;
  style?: CSSProperties;
}

export declare function NavBar(props: NavBarProps): JSX.Element;
