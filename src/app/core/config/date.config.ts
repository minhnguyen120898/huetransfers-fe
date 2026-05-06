/**
 * Date Configuration
 * Centralized date formats and utilities using date-fns
 */

import { format, parse, isValid } from 'date-fns';

/**
 * Standard date format constants
 * Using date-fns format tokens: https://date-fns.org/docs/format
 */
export const DateFormat = {
  // Display formats
  MONTH_YEAR: 'MM/yyyy', // 11/2025
  MONTH_YEAR_LONG: 'MMMM yyyy', // November 2025
  SHORT_DATE: 'dd/MM/yyyy', // 27/11/2025
  LONG_DATE: 'dd MMMM yyyy', // 27 November 2025
  FULL_DATE: 'EEEE, dd MMMM yyyy', // Wednesday, 27 November 2025
  TIME_12H: 'hh:mm a', // 02:30 PM
  TIME_24H: 'HH:mm', // 14:30
  LONG_TIME: 'HH:mm:ss',
  DATETIME_SHORT: 'dd/MM/yyyy HH:mm', // 27/11/2025 14:30
  DATETIME_LONG: 'dd/MM/yyyy hh:mm a', // 27/11/2025 02:30 PM
  DATETIME_FULL: 'EEEE, dd MMMM yyyy HH:mm', // Wednesday, 27 November 2025 14:30

  // ISO formats (for API)
  ISO_DATE: 'yyyy-MM-dd', // 2025-11-27
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss", // 2025-11-27T14:30:00
  ISO_DATETIME_TZ: "yyyy-MM-dd'T'HH:mm:ssXXX", // 2025-11-27T14:30:00+07:00

  // Month/Year only
  MONTH_SHORT: 'MMM', // Nov
  MONTH_LONG: 'MMMM', // November
  YEAR: 'yyyy', // 2025
  MONTH_NUM: 'MM', // 11
} as const;

/**
 * Date formatting utility
 * Safely formats a date with error handling
 *
 * @param date - Date to format
 * @param formatString - Format string (use DateFormat constants)
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * formatDate(new Date(), DateFormat.MONTH_YEAR) // "11/2025"
 * formatDate(new Date(), DateFormat.SHORT_DATE) // "27/11/2025"
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatString: string,
): string {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (!isValid(dateObj)) {
      console.warn('[DateConfig] Invalid date provided:', date);
      return '';
    }

    return format(dateObj, formatString);
  } catch (error) {
    console.error('[DateConfig] Error formatting date:', error);
    return '';
  }
}

/**
 * Parse a date string with a specific format
 *
 * @param dateString - Date string to parse
 * @param formatString - Format string (use DateFormat constants)
 * @param referenceDate - Reference date for parsing (defaults to now)
 * @returns Parsed Date object or null if invalid
 *
 * @example
 * parseDate("11/2025", DateFormat.MONTH_YEAR) // Date object for November 2025
 */
export function parseDate(
  dateString: string,
  formatString: string,
  referenceDate: Date = new Date(),
): Date | null {
  if (!dateString) {
    return null;
  }

  try {
    const parsed = parse(dateString, formatString, referenceDate);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('[DateConfig] Error parsing date:', error);
    return null;
  }
}

/**
 * Format a date to month/year display (MM/YYYY)
 * Used in MonthPicker and month filter displays
 *
 * @example
 * formatMonthYear(new Date(2025, 10, 27)) // "11/2025"
 */
export function formatMonthYear(date: Date | null | undefined): string {
  return formatDate(date, DateFormat.MONTH_YEAR);
}

/**
 * Format a date to short date display (DD/MM/YYYY)
 *
 * @example
 * formatShortDate(new Date(2025, 10, 27)) // "27/11/2025"
 */
export function formatShortDate(date: Date | null | undefined): string {
  return formatDate(date, DateFormat.SHORT_DATE);
}

/**
 * Format a date to long date display (DD Month YYYY)
 *
 * @example
 * formatLongDate(new Date(2025, 10, 27)) // "27 November 2025"
 */
export function formatLongDate(date: Date | null | undefined): string {
  return formatDate(date, DateFormat.LONG_DATE);
}

/**
 * Format a date to datetime display (DD/MM/YYYY HH:mm)
 *
 * @example
 * formatDateTime(new Date(2025, 10, 27, 14, 30)) // "27/11/2025 14:30"
 */
export function formatDateTime(date: Date | null | undefined): string {
  return formatDate(date, DateFormat.DATETIME_SHORT);
}

/**
 * Format a date to ISO format for API requests (YYYY-MM-DD)
 *
 * @example
 * formatISODate(new Date(2025, 10, 27)) // "2025-11-27"
 */
export function formatISODate(date: Date | null | undefined): string {
  return formatDate(date, DateFormat.ISO_DATE);
}

/**
 * Get month number from date (1-12)
 * Note: JavaScript Date.getMonth() returns 0-11, this returns 1-12
 */
export function getMonthNumber(date: Date): number {
  return date.getMonth() + 1;
}

/**
 * Get year from date
 */
export function getYear(date: Date): number {
  return date.getFullYear();
}

/**
 * Create a date object from month (1-12) and year
 */
export function createDateFromMonthYear(month: number, year: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * Check if the given month and year represent the current month and year
 * Used with MonthFilterState to determine if the selected filter is the current month
 *
 * @param selectedMonth - Month number (1-12)
 * @param selectedYear - Year (e.g., 2025)
 * @returns true if the month and year match the current month and year, false otherwise
 *
 * @example
 * // If current date is December 2025
 * isCurrentMonth(12, 2025) // true
 * isCurrentMonth(11, 2025) // false
 * isCurrentMonth(12, 2024) // false
 */
export function isCurrentMonth(selectedMonth: number, selectedYear: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();

  return selectedMonth === currentMonth && selectedYear === currentYear;
}

/**
 * Check if the given month and year represent the current month or a future month
 * Used to determine if the date range picker should be shown
 *
 * @param selectedMonth - Month number (1-12)
 * @param selectedYear - Year (e.g., 2025)
 * @returns true if the month/year is current or in the future, false if in the past
 *
 * @example
 * // If current date is December 2025
 * isCurrentOrFutureMonth(12, 2025) // true (current)
 * isCurrentOrFutureMonth(1, 2026)  // true (future)
 * isCurrentOrFutureMonth(11, 2025) // false (past)
 */
export function isCurrentOrFutureMonth(selectedMonth: number, selectedYear: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (selectedYear > currentYear) return true;
  if (selectedYear === currentYear && selectedMonth >= currentMonth) return true;
  return false;
}
