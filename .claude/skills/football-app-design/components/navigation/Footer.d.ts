import type { ReactNode, CSSProperties } from "react";

/** The dark footer band — ink fill, sage type, 48/24 padding. */
export interface FooterProps {
  /** Wordmark, rendered in Football green on the ink band */
  brand?: ReactNode;
  tagline?: ReactNode;
  /** Link columns: { title, links: [{ label, href }] } */
  columns?: Array<{ title: string; links?: Array<{ label: string; href?: string }> }>;
  /** Fine print row below the hairline divider */
  legal?: ReactNode;
  style?: CSSProperties;
}

export declare function Footer(props: FooterProps): JSX.Element;
