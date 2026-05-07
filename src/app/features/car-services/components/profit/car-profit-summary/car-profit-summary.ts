import { Component, ChangeDetectionStrategy, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { select } from '@ngxs/store';
import { VndCurrencyPipe } from '@shared/pipes';
import { MonthFilterState } from '@core/store/month-filter';
import { CarProfitDataService } from '../../../services/profit/car-profit-data.service';
import { NgxsCarProfitDataService } from '../../../services/profit/ngxs-car-profit-data.service';

@Component({
  selector: 'app-car-profit-summary',
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, VndCurrencyPipe],
  templateUrl: './car-profit-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CarProfitDataService,
      useClass: NgxsCarProfitDataService,
    },
  ],
})
export class CarProfitSummary {
  private readonly dataService = inject(CarProfitDataService);

  private readonly selectedMonth = select(MonthFilterState.selectedMonth);
  private readonly selectedYear = select(MonthFilterState.selectedYear);
  private readonly timestamp = select(MonthFilterState.timestamp);

  readonly summary = toSignal(this.dataService.summary$);
  readonly loading = toSignal(this.dataService.loading$, { initialValue: false });
  readonly error = toSignal(this.dataService.error$);

  readonly bookingFinancials = computed(() => this.summary()?.bookingFinancials);
  readonly transferFinancials = computed(() => this.summary()?.transferFinancials);
  readonly hasTransfers = computed(() => (this.transferFinancials()?.transferCount ?? 0) > 0);
  readonly expenseFinancials = computed(() => this.summary()?.expenseFinancials);
  readonly totalProfit = computed(() => this.summary()?.totalProfit ?? 0);

  readonly isBookingProfit = computed(() => (this.bookingFinancials()?.netProfit ?? 0) >= 0);
  readonly isTotalProfit = computed(() => this.totalProfit() >= 0);

  constructor() {
    effect(() => {
      const year = this.selectedYear();
      const month = this.selectedMonth();
      this.timestamp();

      if (year && month) {
        this.dataService.loadSummary({ year, month });
      }
    });
  }

  refresh(): void {
    this.dataService.refresh();
  }
}
