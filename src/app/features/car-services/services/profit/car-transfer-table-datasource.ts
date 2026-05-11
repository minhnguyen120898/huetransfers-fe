import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';
import { CarTransferDataService } from './car-transfer-data.service';

@Injectable()
export class CarTransferTableDataSource extends AbstractTableDataSource<CarTransferDetail> {
  private readonly dataService = inject(CarTransferDataService);

  constructor() {
    super();
    this.dataService.transfers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transfers) => this._data.set(transfers));

    this.dataService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.dataService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));

    this.dataService.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => this._meta.set(meta));
  }

  override loadData(page = 1, pageSize = 10): void {
    const filters = this.filters() as { year?: number; month?: number };
    if (!filters.year || !filters.month) return;

    const params: CarTransferQueryParams = {
      year: filters.year,
      month: filters.month,
      page,
      limit: pageSize,
    };
    this.dataService.loadTransfers(params);
  }

  override refresh(): void {
    this.dataService.refresh();
  }

  protected override areRowsEqual(row1: CarTransferDetail, row2: CarTransferDetail): boolean {
    return (
      row1.originalBookingCode === row2.originalBookingCode &&
      row1.transferBookingCode === row2.transferBookingCode
    );
  }
}
