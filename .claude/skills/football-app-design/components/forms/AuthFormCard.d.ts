import type { ReactNode, CSSProperties } from "react";

/**
 * Sign-in / registration surface — sage card chrome wrapping TextInput primitives.
 *
 * @startingPoint section="Forms" subtitle="Sage auth card with inputs and green CTA" viewport="700x400"
 */
export interface AuthFormCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** The fields — normally <TextInput /> elements */
  children?: ReactNode;
  submitLabel?: string;
  onSubmit?: (event: React.FormEvent) => void;
  /** Secondary action below the CTA (e.g. a tertiary Button) */
  secondary?: ReactNode;
  /** Fine print in --type-caption / mute */
  footnote?: ReactNode;
  style?: CSSProperties;
}

export declare function AuthFormCard(props: AuthFormCardProps): JSX.Element;
