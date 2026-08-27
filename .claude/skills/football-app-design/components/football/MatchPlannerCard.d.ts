import type { CSSProperties } from "react";

/**
 * The system's signature interactive widget — white card with a 1px ink hairline hosting
 * the team and player selectors, formation chips and the primary CTA.
 *
 * @startingPoint section="Football" subtitle="Signature hero widget: team + formation selectors" viewport="700x520"
 */
export interface MatchPlannerCardProps {
  /** Tracked uppercase label at the top of the card */
  eyebrow?: string;
  /** Team names for the home / away selects */
  teams?: string[];
  /** Player names for the captain select; omit to hide that row */
  players?: string[];
  /** Formation chips (default 4-3-3, 4-4-2, 3-5-2, 4-2-3-1) */
  formations?: string[];
  defaultHome?: string;
  defaultAway?: string;
  defaultFormation?: string;
  ctaLabel?: string;
  /** Receives { home, away, formation, captain } */
  onPlan?: (selection: { home: string; away: string; formation: string; captain: string }) => void;
  style?: CSSProperties;
}

export declare function MatchPlannerCard(props: MatchPlannerCardProps): JSX.Element;
