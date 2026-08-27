import type { ReactNode, CSSProperties } from "react";

/** Empty-state frame — sage fill, 48px padding, centred caption in body-md. */
export interface EmptyStateProps {
  /** Glyph or illustration; wrapped in a pale-green circle */
  media?: ReactNode;
  title?: ReactNode;
  caption?: ReactNode;
  action?: ReactNode;
  style?: CSSProperties;
}

export declare function EmptyState(props: EmptyStateProps): JSX.Element;
