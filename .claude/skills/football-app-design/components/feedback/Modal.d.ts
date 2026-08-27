import type { ReactNode, CSSProperties } from "react";

/** Modal dialog — card chrome plus the derived overlay shadow over an ink scrim. */
export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Right-aligned footer buttons */
  actions?: ReactNode;
  onClose?: () => void;
  /** Max width in px (default 480) */
  width?: number;
  style?: CSSProperties;
}

export declare function Modal(props: ModalProps): JSX.Element;
