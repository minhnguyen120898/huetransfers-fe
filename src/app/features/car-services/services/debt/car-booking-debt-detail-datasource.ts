import { Injectable } from '@angular/core';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import { CarBookingDebtLineItem } from '@core/models/car-booking.model';

@Injectable()
export class CarBookingDebtDetailDataSource extends AbstractTableDataSource<CarBookingDebtLineItem> {
  setBookings(bookings: CarBookingDebtLineItem[]): void {
    this._data.set(bookings);
  }

  setLoadingState(loading: boolean): void {
    this._loading.set(loading);
  }

  setErrorState(error: string | null): void {
    this._error.set(error);
  }

  override loadData(): void {}

  override refresh(): void {}

  protected override areRowsEqual(
    row1: CarBookingDebtLineItem,
    row2: CarBookingDebtLineItem,
  ): boolean {
    return row1.id === row2.id;
  }
}
