import type { ReactNode, CSSProperties } from "react";

/** Nav item in body-sm-strong; the active state carries a Football-green underline. */
export interface NavLinkProps {
  href?: string;
  /** Adds the 2px green underline and aria-current="page" */
  active?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export declare function NavLink(props: NavLinkProps): JSX.Element;
