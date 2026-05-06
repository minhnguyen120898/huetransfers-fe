/**
 * Footer cell value - can be static or computed
 */
export type FooterCellValue<T> =
  | string
  | number
  | boolean
  | ((data: T[]) => string | number | boolean)
  | null
  | undefined;

/**
 * Footer configuration - map column keys to their footer values
 *
 * @example
 * ```typescript
 * const footerConfig: FooterConfig<SalesData> = {
 *   product: 'TOTAL',                                          // Static label
 *   quantity: (data) => data.reduce((sum, row) => sum + row.quantity, 0),  // Computed
 *   revenue: (data) => data.reduce((sum, row) => sum + row.revenue, 0),
 *   date: null,                                                // Empty
 *   // stt column omitted - will be empty
 * };
 * ```
 */
export interface FooterConfig<T = any> {
  [columnKey: string]: FooterCellValue<T>;
}
