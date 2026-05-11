import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { select } from '@ngxs/store';
import { MonthFilterState } from '@core/store/month-filter';
import { DataTable } from '@shared/components/data-table/data-table';
import { TableCard } from '@shared/components/table-card/table-card';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { CarTransferDetail } from '../../../models/profit';
import { CarTransferDataService } from '../../../services/profit/car-transfer-data.service';
import { NgxsCarTransferDataService } from '../../../services/profit/ngxs-car-transfer-data.service';
import { CarTransferTableDataSource } from '../../../services/profit/car-transfer-table-datasource';
import { getCarTransferTableColumns } from '../../../configs/car-transfer-table-columns.config';

@Component({
  selector: 'app-car-transfer-list',
  standalone: true,
  imports: [DataTable, TableCard],
  templateUrl: './car-transfer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: CarTransferDataService, useClass: NgxsCarTransferDataService },
    CarTransferTableDataSource,
  ],
})
export class CarTransferList {
  readonly dataSource = inject(CarTransferTableDataSource);
  readonly columns: TableColumn<CarTransferDetail>[] = getCarTransferTableColumns();

  private readonly selectedMonth = select(MonthFilterState.selectedMonth);
  private readonly selectedYear = select(MonthFilterState.selectedYear);
  private readonly timestamp = select(MonthFilterState.timestamp);

  constructor() {
    effect(() => {
      const year = this.selectedYear();
      const month = this.selectedMonth();
      this.timestamp();

      if (year && month) {
        this.dataSource.setFilters({ year, month });
      }
    });
  }
}
