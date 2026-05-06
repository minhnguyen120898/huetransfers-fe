/**
 * Month Filter Actions
 * Actions for managing the global month/year filter
 */

export namespace MonthFilterActions {
  /**
   * Set the selected month and year
   */
  export class SetMonth {
    static readonly type = '[MonthFilter] Set Month';
    constructor(
      public month: number,
      public year: number,
    ) {}
  }

  /**
   * Reset to current month and year
   */
  export class ResetMonth {
    static readonly type = '[MonthFilter] Reset Month';
  }

  /**
   * Set custom date range for current month filtering
   */
  export class SetCustomDateRange {
    static readonly type = '[MonthFilter] Set Custom Date Range';
    constructor(
      public startDate: Date,
      public endDate: Date,
      public month: number,
      public year: number,
    ) {}
  }

  /**
   * Clear custom date range (revert to default behavior)
   */
  export class ClearCustomDateRange {
    static readonly type = '[MonthFilter] Clear Custom Date Range';
  }

  /**
   * Set custom date range for current month filtering
   */
  export class SetGroupBookingDateRange {
    static readonly type = '[MonthFilter] Set Group Booking Date Range';
    constructor(
      public startDate: Date,
      public endDate: Date,
      public month: number,
      public year: number,
    ) {}
  }

  /**
   * Clear custom date range (revert to default behavior)
   */
  export class ClearGroupBookingDateRange {
    static readonly type = '[MonthFilter] Clear Group Booking Date Range';
  }
}
