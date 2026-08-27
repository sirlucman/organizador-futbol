import type { ReactNode, CSSProperties } from "react";

/** Squad composition summary — sage card with per-position fill bars in Football green. */
export interface TeamCompositionGroup {
  label: string;
  count: number;
  /** Target headcount; falling short turns the bar and count warning-yellow */
  required?: number;
}

export interface TeamCompositionCardProps {
  title?: ReactNode;
  /** Rendered as "{n} registered" beside the title */
  squadSize?: number;
  groups?: TeamCompositionGroup[];
  footer?: ReactNode;
  style?: CSSProperties;
}

export declare function TeamCompositionCard(props: TeamCompositionCardProps): JSX.Element;
