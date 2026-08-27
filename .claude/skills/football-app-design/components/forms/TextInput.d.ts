import type { ReactNode, CSSProperties } from "react";

/** The canonical text field — 1px ink hairline, 12px radius, 12/16 padding, body-md. */
export interface TextInputProps {
  label?: ReactNode;
  /** Caption below the field in --type-caption / mute */
  hint?: ReactNode;
  /** Replaces the hint and switches the hairline to --color-negative-deep */
  error?: ReactNode;
  type?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  iconLeft?: ReactNode;
  /** Trailing adornment inside the field (unit, action, icon) */
  suffix?: ReactNode;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

export declare function TextInput(props: TextInputProps): JSX.Element;
