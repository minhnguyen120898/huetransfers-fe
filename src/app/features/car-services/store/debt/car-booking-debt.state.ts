import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CarBookingDebtService } from '../../services/debt/car-booking-debt.service';
import { CarBookingDebtActions } from './car-booking-debt.actions';
import { CarBookingDebtStateModel, carBookingDebtStateDefaults } from './car-booking-debt.models';
import {
  CarBookingDebtListResponse,
  CarBookingDebtDetailResponse,
  CarBookingDebtQueryParams,
  CarBookingSummaryResponse,
} from '@core/models/car-booking.model';
import { NotificationService } from '@core/services/notification.service';

@State<CarBookingDebtStateModel>({
  name: 'carBookingDebt',
  defaults: carBookingDebtStateDefaults,
})
@Injectable()
export class CarBookingDebtState {
  private readonly debtService = inject(CarBookingDebtService);
  private readonly notification = inject(NotificationService);

  @Selector()
  static debtList(state: CarBookingDebtStateModel): CarBookingDebtListResponse | null {
    return state.debtList;
  }

  @Selector()
  static selectedAgencyDetail(
    state: CarBookingDebtStateModel,
  ): CarBookingDebtDetailResponse | null {
    return state.selectedAgencyDetail;
  }

  @Selector()
  static loading(state: CarBookingDebtStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static detailLoading(state: CarBookingDebtStateModel): boolean {
    return state.detailLoading;
  }

  @Selector()
  static error(state: CarBookingDebtStateModel): string | null {
    return state.error;
  }

  @Selector()
  static detailError(state: CarBookingDebtStateModel): string | null {
    return state.detailError;
  }

  @Selector()
  static exportLoading(state: CarBookingDebtStateModel): boolean {
    return state.exportLoading;
  }

  @Selector()
  static lastQueryParams(state: CarBookingDebtStateModel): CarBookingDebtQueryParams | null {
    return state.lastQueryParams;
  }

  @Selector()
  static summary(state: CarBookingDebtStateModel): CarBookingSummaryResponse | null {
    return state.summary;
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtList)
  loadCarBookingDebtList(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtList,
  ) {
    ctx.patchState({ loading: true, error: null, lastQueryParams: action.params });
    return this.debtService.getDebtList(action.params).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingDebtActions.LoadCarBookingDebtListSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingDebtActions.LoadCarBookingDebtListFailure(
            error.message || 'Failed to load car booking debt list',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtListSuccess)
  loadCarBookingDebtListSuccess(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtListSuccess,
  ) {
    ctx.patchState({ debtList: action.response, loading: false, error: null });
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtListFailure)
  loadCarBookingDebtListFailure(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtListFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to load car booking debt');
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtDetail)
  loadCarBookingDebtDetail(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtDetail,
  ) {
    ctx.patchState({ detailLoading: true, detailError: null });
    return this.debtService.getDebtDetail(action.agencyId, action.params).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingDebtActions.LoadCarBookingDebtDetailSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingDebtActions.LoadCarBookingDebtDetailFailure(
            error.message || 'Failed to load agency debt detail',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtDetailSuccess)
  loadCarBookingDebtDetailSuccess(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtDetailSuccess,
  ) {
    ctx.patchState({
      selectedAgencyDetail: action.response,
      detailLoading: false,
      detailError: null,
    });
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtDetailFailure)
  loadCarBookingDebtDetailFailure(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtDetailFailure,
  ) {
    ctx.patchState({ detailLoading: false, detailError: action.error });
    this.notification.showError('Failed to load agency debt detail');
  }

  @Action(CarBookingDebtActions.ClearSelectedAgencyDetail)
  clearSelectedAgencyDetail(ctx: StateContext<CarBookingDebtStateModel>) {
    ctx.patchState({ selectedAgencyDetail: null });
  }

  @Action(CarBookingDebtActions.LoadCarBookingDebtSummary)
  loadCarBookingDebtSummary(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.LoadCarBookingDebtSummary,
  ) {
    ctx.patchState({ summaryLoading: true });
    return this.debtService.getSummary(action.year, action.month).pipe(
      tap((response) => {
        ctx.patchState({ summary: response, summaryLoading: false });
      }),
      catchError((error) => {
        ctx.patchState({ summaryLoading: false });
        return of(error);
      }),
    );
  }

  @Action(CarBookingDebtActions.ExportCarBookingDebtExcel)
  exportCarBookingDebtExcel(
    ctx: StateContext<CarBookingDebtStateModel>,
    action: CarBookingDebtActions.ExportCarBookingDebtExcel,
  ) {
    ctx.patchState({ exportLoading: true });
    return this.debtService.exportDebtExcel(action.agencyId, action.params).pipe(
      tap((blob) => {
        this.downloadFile(blob, `CarDebt_${action.params.month}_${action.params.year}.xlsx`);
        ctx.patchState({ exportLoading: false });
      }),
      catchError((error) => {
        ctx.patchState({ exportLoading: false });
        this.notification.showError('Failed to export car booking debt');
        return of(error);
      }),
    );
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
