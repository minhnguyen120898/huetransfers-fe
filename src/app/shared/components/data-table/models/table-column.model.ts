import { TemplateRef } from '@angular/core';

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Column type for built-in renderers
 */
export type ColumnType = 'stt' | 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'custom';

/**
 * Table column configuration
 * Follows Open/Closed Principle - open for extension via custom templates
 */
export interface TableColumn<T = unknown> {
  /** Column identifier */
  key: string;

  /** Display header text */
  header: string;

  /** Accessor function to get cell value from row data */
  accessor?: (row: T) => unknown;

  /** Column type for built-in rendering */
  type?: ColumnType;

  /** Text alignment */
  align?: ColumnAlign;

  /** Whether column is sortable */
  sortable?: boolean;

  /** Whether column can be hidden */
  hideable?: boolean;

  /** Initial visibility state */
  visible?: boolean;

  /** Column width (CSS value: '200px', '20%', etc.) */
  width?: string;

  /** CSS classes for column cells */
  cellClass?: string | ((row: T) => string);

  /** CSS classes for header */
  headerClass?: string;

  /** Custom cell renderer template */
  cellTemplate?: TemplateRef<{ $implicit: T; value: unknown }>;

  /** Custom header renderer template */
  headerTemplate?: TemplateRef<void>;

  /** Badge configuration (when type === 'badge') */
  badgeConfig?: {
    colorMap: Record<string, string>;
    labelMap?: Record<string, string>;
  };

  /** Format function for value display */
  format?: (value: unknown, row: T) => string;
}

/**
 * Badge configuration for status columns
 */
export interface BadgeConfig {
  value: string | number | boolean;
  label?: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info' | 'default';
  cssClass?: string;
}
