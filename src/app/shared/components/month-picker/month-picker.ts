import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store, select } from '@ngxs/store';
import { MonthFilterState, MonthFilterActions } from '@core/store/month-filter';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatMonthYear, MONTH_YEAR_DATE_FORMATS, MonthYearDateAdapter } from '@core/config';

/**
 * Month Picker Component
 *
 * A global month/year selector component that:
 * - Displays in the navbar as a global filter
 * - Uses Material Date Picker in month/year mode
 * - Integrates with NGXS MonthFilterState
 * - Defaults to current month
 * - Displays in MM/YYYY format (e.g., "11/2025")
 * - Emits changes to update all data views across the application
 *
 * @example
 * <app-month-picker />
 */
@Component({
  selector: 'app-month-picker',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MonthYearDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_YEAR_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ],
  templateUrl: './month-picker.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthPickerComponent {
  private readonly store = inject(Store);

  // Selected date signal (represents the selected month/year)
  readonly selectedDate = signal<Date>(new Date());

  // Formatted display value (MM/YYYY format)
  readonly displayValue = computed(() => {
    const date = this.selectedDate();
    return formatMonthYear(date);
  });

  // NGXS state selectors
  readonly selectedMonth = select(MonthFilterState.selectedMonth);
  readonly selectedYear = select(MonthFilterState.selectedYear);

  constructor() {
    // Initialize selected date from NGXS state
    this.store
      .select(MonthFilterState.monthFilter)
      .pipe(takeUntilDestroyed())
      .subscribe((filter) => {
        // Create a date object from the stored month/year (day is 1st of month)
        const date = new Date(filter.selectedYear, filter.selectedMonth - 1, 1);
        this.selectedDate.set(date);
      });
  }

  /**
   * Handle month selection change
   * Dispatches action to update global state
   */
  onMonthSelected(date: Date | null): void {
    if (!date) {
      return;
    }

    const month = date.getMonth() + 1; // Convert from 0-indexed to 1-indexed
    const year = date.getFullYear();

    // Dispatch action to update global month filter state
    this.store.dispatch(new MonthFilterActions.SetMonth(month, year));
  }
}
