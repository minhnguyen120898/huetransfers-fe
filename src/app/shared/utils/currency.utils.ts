/**
 * Currency Utility Functions
 *
 * Provides helper functions for currency formatting and manipulation.
 */

/**
 * Format a number as VND currency
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatVND(1000000) // "1.000.000 ₫"
 * formatVND(1000000, { showSymbol: false }) // "1.000.000"
 * formatVND(1000000, { symbol: 'VND' }) // "1.000.000 VND"
 * formatVND(null) // "0 ₫"
 * ```
 */
export function formatVND(
  value: number | null | undefined,
  options: {
    showSymbol?: boolean;
    symbol?: string;
  } = {},
): string {
  const { showSymbol = true, symbol = '₫' } = options;

  // Handle null/undefined
  const numericValue = value ?? 0;

  // Format using Vietnamese locale
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);

  // Add currency symbol if requested
  return showSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Parse a VND formatted string back to a number
 *
 * @param value - The formatted currency string
 * @returns Numeric value
 *
 * @example
 * ```typescript
 * parseVND('1.000.000 ₫') // 1000000
 * parseVND('1.000.000 VND') // 1000000
 * parseVND('1.000.000') // 1000000
 * parseVND('invalid') // 0
 * ```
 */
export function parseVND(value: string | null | undefined): number {
  if (!value) return 0;

  // Remove all non-numeric characters except for comma (decimal separator in vi-VN)
  const cleaned = value.replace(/[^0-9,]/g, '');

  // Replace comma with dot for parsing (vi-VN uses comma as decimal separator)
  const normalized = cleaned.replace(',', '.');

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number with Vietnamese locale (without currency symbol)
 *
 * Useful for displaying numeric values that aren't currency
 *
 * @param value - The number to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1000000) // "1.000.000"
 * formatNumber(1000.5) // "1.000,5"
 * ```
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  const numericValue = value ?? 0;

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(numericValue);
}

/**
 * Check if a string is a valid VND currency format
 *
 * @param value - The string to validate
 * @returns True if valid VND format
 *
 * @example
 * ```typescript
 * isValidVND('1.000.000 ₫') // true
 * isValidVND('1.000.000') // true
 * isValidVND('1000000') // true
 * isValidVND('abc') // false
 * ```
 */
export function isValidVND(value: string | null | undefined): boolean {
  if (!value) return false;

  // Remove all whitespace and currency symbols
  const cleaned = value.replace(/[\s₫VND]/g, '');

  // Check if it contains only numbers and dots/commas
  const pattern = /^[0-9.,]+$/;
  if (!pattern.test(cleaned)) return false;

  // Try to parse and check if valid number
  const parsed = parseVND(value);
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Calculate percentage and format as VND
 *
 * @param value - The base value
 * @param percentage - The percentage (e.g., 10 for 10%)
 * @returns Formatted VND string
 *
 * @example
 * ```typescript
 * calculatePercentageVND(1000000, 10) // "100.000 ₫"
 * calculatePercentageVND(1000000, 50) // "500.000 ₫"
 * ```
 */
export function calculatePercentageVND(
  value: number,
  percentage: number,
  options?: { showSymbol?: boolean; symbol?: string },
): string {
  const result = (value * percentage) / 100;
  return formatVND(result, options);
}

/**
 * Format a range of VND values
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Formatted range string
 *
 * @example
 * ```typescript
 * formatVNDRange(100000, 500000) // "100.000 ₫ - 500.000 ₫"
 * formatVNDRange(100000, 500000, { symbol: 'VND' }) // "100.000 VND - 500.000 VND"
 * ```
 */
export function formatVNDRange(
  min: number,
  max: number,
  options?: { showSymbol?: boolean; symbol?: string },
): string {
  const formattedMin = formatVND(min, options);
  const formattedMax = formatVND(max, options);
  return `${formattedMin} - ${formattedMax}`;
}
