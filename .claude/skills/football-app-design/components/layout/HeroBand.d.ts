import type { ReactNode, CSSProperties } from "react";

/**
 * The hero band — sage canvas or the polarity-flipped ink variant, headline in Inter 900.
 *
 * @startingPoint section="Layout" subtitle="Split hero band with headline, CTAs and aside" viewport="1200x520"
 */
export interface HeroBandProps {
  /** sage = #f1f5f9 with ink type · dark = ink with Football-green type */
  tone?: "sage" | "dark";
  /** Display scale: mega 126px · xxl 96px · xl 64px (default) · lg 47px */
  scale?: "mega" | "xxl" | "xl" | "lg";
  eyebrow?: ReactNode;
  headline?: ReactNode;
  subhead?: ReactNode;
  /** Button row */
  actions?: ReactNode;
  /** Right-hand slot — the MatchPlannerCard belongs here */
  aside?: ReactNode;
  style?: CSSProperties;
}

export declare function HeroBand(props: HeroBandProps): JSX.Element;
