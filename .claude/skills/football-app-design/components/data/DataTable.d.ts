import type { ReactNode, CSSProperties } from "react";

/**
 * Data table — sage header row in tracked uppercase caption, sage hairline rows, 12/16 cells.
 *
 * @startingPoint section="Data" subtitle="Squad table with sage header and status badges" viewport="700x340"
 */
export interface DataTableColumn {
  key: string;
  label?: ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
  /** Render the cell yourself (badges, avatars, links) */
  render?: (row: any) => ReactNode;
  /** Cell copy in body-sm-strong */
  strong?: boolean;
  /** Cell copy in --color-mute */
  mute?: boolean;
}

export interface DataTableProps {
  columns?: DataTableColumn[];
  rows?: any[];
  /** Highlights the matching row with the pale-green fill */
  selectedId?: string | number;
  onRowClick?: (row: any, id: string | number) => void;
  /** Defaults to row.id, falling back to the row index */
  getRowId?: (row: any, index: number) => string | number;
  caption?: ReactNode;
  style?: CSSProperties;
}

export declare function DataTable(props: DataTableProps): JSX.Element;
