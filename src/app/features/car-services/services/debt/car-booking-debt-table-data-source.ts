import { effect, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { select, Store } from '@ngxs/store';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import {
  CarBookingDebtAgencyRow,
  CarBookingDebtQueryParams,
  CarBookingSummaryResponse,
} from '@core/models/car-booking.model';
import { MonthFilterState } from '@core/store/month-filter';
import { CarBookingDebtState } from '../../store/debt/car-booking-debt.state';
import { CarBookingDebtActions } from '../../store/debt/car-booking-debt.actions';

@Injectable()
export class CarBookingDebtTableDataSource extends AbstractTableDataSource<CarBookingDebtAgencyRow> {
  private readonly store = inject(Store);
  private readonly month = select(MonthFilterState.selectedMonth);
  private readonly year = select(MonthFilterState.selectedYear);

  readonly summary: Signal<CarBookingSummaryResponse | null> = select(CarBookingDebtState.summary);

  constructor() {
    super();
    this.connectToStore();
    this.setupAutoReload();
  }

  private connectToStore(): void {
    this.store
      .select(CarBookingDebtState.debtList)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((debtList) => {
        this._data.set(debtList?.agencies ?? []);
      });

    this.store
      .select(CarBookingDebtState.loading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.store
      .select(CarBookingDebtState.error)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));
  }

  private setupAutoReload(): void {
    effect(() => {
      const month = this.month();
      const year = this.year();
      const filters = this.filters() as { search?: string };
      const params: CarBookingDebtQueryParams = { year, month };
      if (filters?.search) params.search = filters.search;
      this.store.dispatch(new CarBookingDebtActions.LoadCarBookingDebtList(params));
      this.store.dispatch(new CarBookingDebtActions.LoadCarBookingDebtSummary(year, month));
    });
  }

  override loadData(): void {
    const filters = this.filters() as { search?: string };
    const params: CarBookingDebtQueryParams = {
      year: this.year(),
      month: this.month(),
    };
    if (filters?.search) params.search = filters.search;
    this.store.dispatch(new CarBookingDebtActions.LoadCarBookingDebtList(params));
    this.store.dispatch(
      new CarBookingDebtActions.LoadCarBookingDebtSummary(this.year(), this.month()),
    );
  }

  override refresh(): void {
    this.loadData();
  }

  protected override areRowsEqual(
    row1: CarBookingDebtAgencyRow,
    row2: CarBookingDebtAgencyRow,
  ): boolean {
    return row1.agency.id === row2.agency.id;
  }
}
