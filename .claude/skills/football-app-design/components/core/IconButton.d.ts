import type { ReactNode, CSSProperties } from "react";

/** Circular icon-only control — full radius, white fill, ink glyph. */
export interface IconButtonProps {
  /** Glyph element, normally an <Icon /> */
  icon?: ReactNode;
  /** Accessible name — required, the button has no visible label */
  label: string;
  /** Diameter in px (default 40; use 48 for standalone touch targets) */
  size?: number;
  variant?: "plain" | "outline" | "primary";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  style?: CSSProperties;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
