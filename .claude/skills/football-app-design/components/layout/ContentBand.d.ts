import type { ReactNode, CSSProperties } from "react";

/** The white content band that follows the hero — section heading in display-md. */
export interface ContentBandProps {
  tone?: "canvas" | "sage" | "dark";
  eyebrow?: ReactNode;
  heading?: ReactNode;
  intro?: ReactNode;
  /** Right-aligned actions on the heading row */
  actions?: ReactNode;
  /** When set, children are laid out on an N-column grid with 24px gap */
  columns?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export declare function ContentBand(props: ContentBandProps): JSX.Element;
