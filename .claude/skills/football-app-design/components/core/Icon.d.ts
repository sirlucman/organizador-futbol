import type { CSSProperties } from "react";

/**
 * Lucide glyph rendered via CSS mask, so it takes `currentColor` from its parent.
 * INTENTIONAL ADDITION — the source design system shipped no icon set.
 */
export interface IconProps {
  /** Lucide icon slug, e.g. "calendar", "users", "chevron-down" */
  name?: string;
  /** Square size in px (default 20) */
  size?: number;
  /** Any CSS colour; defaults to currentColor */
  color?: string;
  /** Supply to expose the glyph to assistive tech; omit for decorative icons */
  label?: string;
  style?: CSSProperties;
}

export declare function Icon(props: IconProps): JSX.Element;
