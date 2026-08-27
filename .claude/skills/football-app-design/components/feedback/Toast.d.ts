import type { ReactNode, CSSProperties } from "react";

/** Toast — card shape, 12/16 padding, body-sm, floating shadow, tone rail on the left. */
export interface ToastProps {
  tone?: "neutral" | "positive" | "warning" | "negative";
  icon?: ReactNode;
  title?: ReactNode;
  message?: ReactNode;
  /** Inline action, usually a tertiary Button */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}

export declare function Toast(props: ToastProps): JSX.Element;
