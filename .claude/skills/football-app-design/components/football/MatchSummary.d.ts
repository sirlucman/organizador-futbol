import type { ReactNode, CSSProperties } from "react";

/** Match summary — white card with sage-divided line items and a total row. */
export interface MatchSummaryItem {
  label: string;
  /** Secondary caption under the label */
  note?: string;
  value: ReactNode;
}

export interface MatchSummaryProps {
  title?: ReactNode;
  /** Kickoff / venue line under the title */
  meta?: ReactNode;
  items?: MatchSummaryItem[];
  /** Total row above the action, e.g. { label: "Squad cost", value: "£310" } */
  total?: { label?: string; value: ReactNode };
  action?: ReactNode;
  style?: CSSProperties;
}

export declare function MatchSummary(props: MatchSummaryProps): JSX.Element;
