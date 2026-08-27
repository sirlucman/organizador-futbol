import type { ReactNode, CSSProperties } from "react";

/** App-shell sidebar row; the active indicator is a 3px Football-green bar. */
export interface SidebarNavRowProps {
  icon?: ReactNode;
  label?: ReactNode;
  /** Trailing slot, usually a count or <Badge /> */
  badge?: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  style?: CSSProperties;
}

export declare function SidebarNavRow(props: SidebarNavRowProps): JSX.Element;
