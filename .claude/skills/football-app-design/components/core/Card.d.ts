import type { ReactNode, CSSProperties } from "react";

/**
 * The canonical 24px-radius surface. White cards sit on the sage canvas — that
 * contrast is the system's only elevation cue.
 *
 * @startingPoint section="Core" subtitle="White, sage, pale-green and ink card fills" viewport="700x300"
 */
export interface CardProps {
  /** content = white · sage = #f1f5f9 · green = #e4f0c4 · dark = ink fill with green text · outline = white + ink hairline */
  variant?: "content" | "sage" | "green" | "dark" | "outline";
  /** Override the 24px interior padding */
  padding?: string;
  /** Uppercase tracked caption above the title */
  eyebrow?: string;
  /** display-xs heading */
  title?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom of the card */
  footer?: ReactNode;
  style?: CSSProperties;
}

export declare function Card(props: CardProps): JSX.Element;
