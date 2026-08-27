import type { ReactNode, CSSProperties } from "react";

/**
 * Plan / tier card. `featured` flips polarity to the ink surface with green accents.
 *
 * @startingPoint section="Data" subtitle="Three-up plan cards with one ink featured tier" viewport="700x420"
 */
export interface PricingTierProps {
  name?: ReactNode;
  price?: ReactNode;
  /** Defaults to "/ month" */
  period?: ReactNode;
  description?: ReactNode;
  /** Bullet list — strings or nodes */
  features?: ReactNode[];
  /** Ink fill + Football-green CTA */
  featured?: boolean;
  /** Slot beside the tier name, usually a <Badge /> */
  badge?: ReactNode;
  ctaLabel?: string;
  onSelect?: () => void;
  style?: CSSProperties;
}

export declare function PricingTier(props: PricingTierProps): JSX.Element;
