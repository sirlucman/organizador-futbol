import type { ReactNode, CSSProperties } from "react";

/** BallLoader — spinning 3D football, rendered on canvas. The app's loading indicator. */
export interface BallLoaderProps {
  /** Rendered diameter in px. 20 minimum, 40 default, 88–96 for page loads. */
  size?: number;
  /** Seconds per full turn. 1.1 default; below 0.7 reads frantic. */
  spinSeconds?: number;
  /** `classic` = white panels, ink pentagons. `night` = ink panels, pale-green pentagons for dark grounds. */
  tone?: "classic" | "night";
  /** Optional line under the ball, e.g. "Loading squad". Sentence case, no ellipsis. */
  caption?: ReactNode;
  /** Soft contact shadow under the ball. Page and card loads only. */
  shadow?: boolean;
  /** Accessible name when there is no caption. */
  label?: string;
  style?: CSSProperties;
}

export declare function BallLoader(props: BallLoaderProps): JSX.Element;
