import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { MonthFilterActions } from './month-filter.actions';
import { MonthFilterStateModel, DateRange } from './month-filter.models';
import { DateFormat, formatDate } from '@core/config';

/**
 * Month Filter State
 * Global state for managing the selected month/year filter
 * Used across all modules to filter data by month
 */
@State<MonthFilterStateModel>({
  name: 'monthFilter',
  defaults: {
    selectedMonth: new Date().getMonth() + 1, // JavaScript months are 0-indexed
    selectedYear: new Date().getFullYear(),
    timestamp: new Date(),
    customDateRange: null,
    groupBookingDateRange: null,
  },
})
@Injectable()
export class MonthFilterState {
  /**
   * Get the selected month (1-12)
   */
  @Selector()
  static selectedMonth(state: MonthFilterStateModel): number {
    return state.selectedMonth;
  }

  /**
   * Get the selected year
   */
  @Selector()
  static selectedYear(state: MonthFilterStateModel): number {
    return state.selectedYear;
  }

  /**
   * Get the timestamp of when the filter was last updated
   */
  @Selector()
  static timestamp(state: MonthFilterStateModel): Date {
    return state.timestamp;
  }

  /**
   * Get the complete month filter state
   */
  @Selector()
  static monthFilter(state: MonthFilterStateModel): MonthFilterStateModel {
    return state;
  }

  /**
   * Get the date range for the selected month
   * Returns startDate (first day of month) and endDate (last day of month)
   * in ISO format (YYYY-MM-DD)
   */
  @Selector()
  static dateRange(state: MonthFilterStateModel): DateRange {
    // Create date for first day of selected month
    const date = new Date(state.selectedYear, state.selectedMonth - 1, 1);

    return {
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    };
  }

  @Selector()
  static formatRange(state: MonthFilterStateModel): string {
    const date = new Date(state.selectedYear, state.selectedMonth - 1, 1);
    return formatDate(date, DateFormat.MONTH_YEAR);
  }

  /**
   * Get the custom date range (if set)
   */
  @Selector()
  static customDateRange(state: MonthFilterStateModel) {
    return state.customDateRange;
  }

  @Selector()
  static groupBookingDateRange(state: MonthFilterStateModel) {
    return state.groupBookingDateRange;
  }

  /**
   * Set the selected month and year
   * Also clears custom date range when month changes
   */
  @Action(MonthFilterActions.SetMonth)
  setMonth(ctx: StateContext<MonthFilterStateModel>, action: MonthFilterActions.SetMonth): void {
    ctx.patchState({
      selectedMonth: action.month,
      selectedYear: action.year,
      timestamp: new Date(),
      customDateRange: null, // Clear custom range when month changes
    });
  }

  /**
   * Reset to current month and year
   */
  @Action(MonthFilterActions.ResetMonth)
  resetMonth(ctx: StateContext<MonthFilterStateModel>): void {
    const now = new Date();
    ctx.patchState({
      selectedMonth: now.getMonth() + 1,
      selectedYear: now.getFullYear(),
      timestamp: new Date(),
      customDateRange: null, // Clear custom range on reset
    });
  }

  /**
   * Set custom date range for current month filtering
   */
  @Action(MonthFilterActions.SetCustomDateRange)
  setCustomDateRange(
    ctx: StateContext<MonthFilterStateModel>,
    action: MonthFilterActions.SetCustomDateRange,
  ): void {
    ctx.patchState({
      customDateRange: {
        startDate: action.startDate,
        endDate: action.endDate,
        month: action.month,
        year: action.year,
      },
    });
  }

  /**
   * Clear custom date range (revert to default behavior)
   */
  @Action(MonthFilterActions.ClearCustomDateRange)
  clearCustomDateRange(ctx: StateContext<MonthFilterStateModel>): void {
    ctx.patchState({
      customDateRange: null,
    });
  }

  @Action(MonthFilterActions.SetGroupBookingDateRange)
  setGroupBookingDateRange(
    ctx: StateContext<MonthFilterStateModel>,
    action: MonthFilterActions.SetGroupBookingDateRange,
  ): void {
    ctx.patchState({
      groupBookingDateRange: {
        startDate: action.startDate,
        endDate: action.endDate,
        month: action.month,
        year: action.year,
      },
    });
  }

  /**
   * Clear groupBookingDateRange date range (revert to default behavior)
   */
  @Action(MonthFilterActions.ClearGroupBookingDateRange)
  clearGroupBookinDateRange(ctx: StateContext<MonthFilterStateModel>): void {
    ctx.patchState({
      groupBookingDateRange: null,
    });
  }
}
