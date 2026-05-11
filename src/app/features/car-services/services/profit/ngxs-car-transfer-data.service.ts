import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';
import { CarTransferState } from '../../store/profit/car-transfer.state';
import { CarTransferActions } from '../../store/profit/car-transfer.actions';
import { CarTransferDataService } from './car-transfer-data.service';

@Injectable()
export class NgxsCarTransferDataService extends CarTransferDataService {
  private readonly store = inject(Store);

  readonly transfers$: Observable<CarTransferDetail[]> = this.store.select(
    CarTransferState.transfers,
  );
  readonly loading$: Observable<boolean> = this.store.select(CarTransferState.loading);
  readonly error$: Observable<string | null> = this.store.select(CarTransferState.error);
  readonly meta$: Observable<PaginationMeta | null> = this.store.select(CarTransferState.meta);

  loadTransfers(params: CarTransferQueryParams): void {
    this.store.dispatch(new CarTransferActions.LoadCarTransfers(params));
  }

  refresh(): void {
    const lastParams = this.store.selectSnapshot(CarTransferState.lastQueryParams);
    if (lastParams) {
      this.store.dispatch(new CarTransferActions.LoadCarTransfers(lastParams));
    }
  }
}
