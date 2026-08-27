import type { ReactNode, CSSProperties } from "react";

/** Pill status badge in body-sm-strong. Positive + negative are the source-defined tones. */
export interface BadgeProps {
  /** positive = pale green / forest text · negative = dark maroon / white text */
  tone?: "positive" | "negative" | "warning" | "neutral" | "ink";
  icon?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export declare function Badge(props: BadgeProps): JSX.Element;
