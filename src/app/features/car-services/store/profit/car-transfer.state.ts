import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PaginationMeta } from '@core/models/api.model';
import { CarProfitService } from '../../services/profit/car-profit.service';
import { CarTransferDetail } from '../../models/profit';
import { CarTransferActions } from './car-transfer.actions';
import { CarTransferStateModel, carTransferStateDefaults } from './car-transfer.models';

@State<CarTransferStateModel>({
  name: 'carTransfer',
  defaults: carTransferStateDefaults,
})
@Injectable()
export class CarTransferState {
  private readonly carProfitService = inject(CarProfitService);

  @Selector()
  static transfers(state: CarTransferStateModel): CarTransferDetail[] {
    return state.transfers;
  }

  @Selector()
  static meta(state: CarTransferStateModel): PaginationMeta | null {
    return state.meta;
  }

  @Selector()
  static loading(state: CarTransferStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: CarTransferStateModel): string | null {
    return state.error;
  }

  @Selector()
  static lastQueryParams(state: CarTransferStateModel) {
    return state.lastQueryParams;
  }

  @Action(CarTransferActions.LoadCarTransfers)
  loadCarTransfers(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfers,
  ) {
    ctx.patchState({ loading: true, error: null, lastQueryParams: action.params });
    return this.carProfitService.getCarTransfers(action.params).pipe(
      tap((response) => {
        ctx.dispatch(
          new CarTransferActions.LoadCarTransfersSuccess(response.data, response.meta),
        );
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarTransferActions.LoadCarTransfersFailure(
            error.message || 'Failed to load car transfers',
          ),
        );
        return of(null);
      }),
    );
  }

  @Action(CarTransferActions.LoadCarTransfersSuccess)
  loadCarTransfersSuccess(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfersSuccess,
  ) {
    ctx.patchState({ transfers: action.transfers, meta: action.meta, loading: false, error: null });
  }

  @Action(CarTransferActions.LoadCarTransfersFailure)
  loadCarTransfersFailure(
    ctx: StateContext<CarTransferStateModel>,
    action: CarTransferActions.LoadCarTransfersFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(CarTransferActions.ClearCarTransfers)
  clearCarTransfers(ctx: StateContext<CarTransferStateModel>) {
    ctx.patchState(carTransferStateDefaults);
  }
}
