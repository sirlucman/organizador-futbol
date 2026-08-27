import type { ReactNode, CSSProperties } from "react";

/**
 * The system's pill CTA — 24px radius, 12/24 padding, button-md label.
 * `primary` is Football green (#85b632) on ink text and is the ONLY accent fill.
 *
 * @startingPoint section="Core" subtitle="Primary, secondary and tertiary pill CTAs" viewport="700x220"
 */
export interface ButtonProps {
  /** primary = Football green fill · secondary = sage fill · tertiary = white with ink hairline */
  variant?: "primary" | "secondary" | "tertiary";
  /** Leading glyph, usually an <Icon /> */
  iconLeft?: ReactNode;
  /** Trailing glyph, usually an <Icon /> */
  iconRight?: ReactNode;
  /** Stretch to the container width */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Render as an anchor instead of a button */
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent) => void;
  children?: ReactNode;
  style?: CSSProperties;
}

export declare function Button(props: ButtonProps): JSX.Element;
