/**
 * Month Filter State Model
 * Represents the global selected month/year filter used across the application
 */
export interface MonthFilterStateModel {
  selectedMonth: number; // 1-12
  selectedYear: number; // e.g., 2025
  timestamp: Date; // When the filter was last set
  customDateRange: CustomDateRange | null; // Custom date range for current month filtering
  groupBookingDateRange: CustomDateRange | null;
}

/**
 * Date Range Interface
 * Represents the start and end dates for a given month
 * Computed from selectedMonth/selectedYear
 */
export interface DateRange {
  startDate: string; // ISO format: YYYY-MM-DD (first day of month)
  endDate: string; // ISO format: YYYY-MM-DD (last day of month)
}

/**
 * Custom Date Range Interface
 * User-selected date range for current month filtering
 */
export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
  month: number; // Month this range belongs to (1-12)
  year: number; // Year this range belongs to
}
