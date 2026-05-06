/**
 * Action button configuration
 * Follows Interface Segregation Principle - small, focused interface
 */
export interface TableAction<T = unknown> {
  /** Action identifier */
  id: string;

  /** Icon name (Material Icons) */
  icon: string;

  /** Tooltip text (static or dynamic based on row) */
  tooltip?: string | ((row: T) => string);

  /** Button color */
  color?: 'primary' | 'accent' | 'warn' | 'default';

  /** Action handler */
  handler: (row: T) => void;

  /** Visibility condition */
  visible?: (row: T) => boolean;

  /** Disabled condition */
  disabled?: (row: T) => boolean;

  /** Custom CSS classes */
  cssClass?: string;
}

/**
 * Bulk action configuration for selected rows
 */
export interface BulkAction<T = unknown> {
  /** Action identifier */
  id: string;

  /** Action label */
  label: string;

  /** Icon name */
  icon?: string;

  /** Action handler for selected rows */
  handler: (rows: T[]) => void;

  /** Visibility condition based on selection */
  visible?: (rows: T[]) => boolean;

  /** Disabled condition */
  disabled?: (rows: T[]) => boolean;

  /** Requires confirmation */
  requiresConfirmation?: boolean;

  /** Confirmation message */
  confirmationMessage?: string;
}
