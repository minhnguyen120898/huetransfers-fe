import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CarBookingService } from '../../services/bookings/car-booking.service';
import { CarBookingActions } from './car-booking.actions';
import { CarBookingStateModel, carBookingStateDefaults } from './car-booking.models';
import { CarBooking, CarBookingCountByStatus } from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';
import { NotificationService } from '@core/services/notification.service';

@State<CarBookingStateModel>({
  name: 'carBooking',
  defaults: carBookingStateDefaults,
})
@Injectable()
export class CarBookingState {
  private readonly carBookingService = inject(CarBookingService);
  private readonly notification = inject(NotificationService);

  // ─── Selectors ──────────────────────────────────────────────────────────────

  @Selector()
  static carBookings(state: CarBookingStateModel): CarBooking[] {
    return state.carBookings;
  }

  @Selector()
  static selectedCarBooking(state: CarBookingStateModel): CarBooking | null {
    return state.selectedCarBooking;
  }

  @Selector()
  static loading(state: CarBookingStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: CarBookingStateModel): string | null {
    return state.error;
  }

  @Selector()
  static meta(state: CarBookingStateModel): PaginationMeta | null {
    return state.meta;
  }

  @Selector()
  static lastQueryParams(state: CarBookingStateModel) {
    return state.lastQueryParams;
  }

  @Selector()
  static countByStatus(state: CarBookingStateModel): CarBookingCountByStatus | null {
    return state.countByStatus;
  }

  @Selector()
  static countLoading(state: CarBookingStateModel): boolean {
    return state.countLoading;
  }

  @Selector()
  static confirmedCount(state: CarBookingStateModel): number {
    return state.countByStatus?.confirmedCount ?? 0;
  }

  @Selector()
  static totalCount(state: CarBookingStateModel): number {
    return state.countByStatus?.totalCount ?? 0;
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────

  private refresh(ctx: StateContext<CarBookingStateModel>): void {
    const state = ctx.getState();
    if (state.lastQueryParams) {
      ctx.dispatch(new CarBookingActions.LoadCarBookings(state.lastQueryParams));
    }
  }

  // ─── Load List ──────────────────────────────────────────────────────────────

  @Action(CarBookingActions.LoadCarBookings)
  loadCarBookings(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCarBookings,
  ) {
    ctx.patchState({ loading: true, error: null, lastQueryParams: action.params });
    return this.carBookingService.getCarBookings(action.params).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.LoadCarBookingsSuccess(response.data, response.meta));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.LoadCarBookingsFailure(
            error.message || 'Failed to load car bookings',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.LoadCarBookingsSuccess)
  loadCarBookingsSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCarBookingsSuccess,
  ) {
    ctx.patchState({
      carBookings: action.carBookings,
      meta: action.meta,
      loading: false,
      error: null,
    });
  }

  @Action(CarBookingActions.LoadCarBookingsFailure)
  loadCarBookingsFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCarBookingsFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to load car bookings');
  }

  // ─── Count By Status ─────────────────────────────────────────────────────────

  @Action(CarBookingActions.LoadCountByStatus)
  loadCountByStatus(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCountByStatus,
  ) {
    ctx.patchState({ countLoading: true, countError: null });
    return this.carBookingService.getCountByStatus(action.params).pipe(
      tap((countByStatus) => {
        ctx.dispatch(new CarBookingActions.LoadCountByStatusSuccess(countByStatus));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.LoadCountByStatusFailure(
            error.message || 'Failed to load car booking counts',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.LoadCountByStatusSuccess)
  loadCountByStatusSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCountByStatusSuccess,
  ) {
    ctx.patchState({ countByStatus: action.countByStatus, countLoading: false, countError: null });
  }

  @Action(CarBookingActions.LoadCountByStatusFailure)
  loadCountByStatusFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.LoadCountByStatusFailure,
  ) {
    ctx.patchState({ countLoading: false, countError: action.error });
  }

  // ─── Create ─────────────────────────────────────────────────────────────────

  @Action(CarBookingActions.CreateCarBooking)
  createCarBooking(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CreateCarBooking,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.createCarBooking(action.dto).pipe(
      tap((carBooking) => {
        ctx.dispatch(new CarBookingActions.CreateCarBookingSuccess(carBooking));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.CreateCarBookingFailure(
            error.message || 'Failed to create car booking',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.CreateCarBookingSuccess)
  createCarBookingSuccess(ctx: StateContext<CarBookingStateModel>) {
    ctx.patchState({ loading: false, error: null });
    this.notification.showSuccess('Car booking created successfully');
    this.refresh(ctx);
  }

  @Action(CarBookingActions.CreateCarBookingFailure)
  createCarBookingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CreateCarBookingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to create car booking');
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  @Action(CarBookingActions.UpdateCarBooking)
  updateCarBooking(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateCarBooking,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.updateCarBooking(action.id, action.dto).pipe(
      tap((carBooking) => {
        ctx.dispatch(new CarBookingActions.UpdateCarBookingSuccess(carBooking));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.UpdateCarBookingFailure(
            error.message || 'Failed to update car booking',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.UpdateCarBookingSuccess)
  updateCarBookingSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateCarBookingSuccess,
  ) {
    const state = ctx.getState();
    const carBookings = state.carBookings.map((b) =>
      b.id === action.carBooking.id ? action.carBooking : b,
    );
    ctx.patchState({
      carBookings,
      selectedCarBooking:
        state.selectedCarBooking?.id === action.carBooking.id
          ? action.carBooking
          : state.selectedCarBooking,
      loading: false,
      error: null,
    });
    this.notification.showSuccess('Car booking updated successfully');
  }

  @Action(CarBookingActions.UpdateCarBookingFailure)
  updateCarBookingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateCarBookingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to update car booking');
  }

  // ─── Cancel ─────────────────────────────────────────────────────────────────

  @Action(CarBookingActions.CancelCarBooking)
  cancelCarBooking(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelCarBooking,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.cancelCarBooking(action.id).pipe(
      tap((carBooking) => {
        ctx.dispatch(new CarBookingActions.CancelCarBookingSuccess(carBooking));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.CancelCarBookingFailure(
            error.message || 'Failed to cancel car booking',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.CancelCarBookingSuccess)
  cancelCarBookingSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelCarBookingSuccess,
  ) {
    const state = ctx.getState();
    const carBookings = state.carBookings.map((b) =>
      b.id === action.carBooking.id ? action.carBooking : b,
    );
    ctx.patchState({ carBookings, loading: false, error: null });
    this.notification.showSuccess('Car booking cancelled successfully');
    this.refresh(ctx);
  }

  @Action(CarBookingActions.CancelCarBookingFailure)
  cancelCarBookingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelCarBookingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to cancel car booking');
  }

  // ─── Cancel Transfer ─────────────────────────────────────────────────────────

  @Action(CarBookingActions.CancelTransfer)
  cancelTransfer(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelTransfer,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.cancelTransfer(action.id).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.CancelTransferSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.CancelTransferFailure(
            error.message || 'Failed to cancel transfer',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.CancelTransferSuccess)
  cancelTransferSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelTransferSuccess,
  ) {
    const { originalBooking } = action.response;
    const carBookings = ctx.getState().carBookings.map((b) =>
      b.id === originalBooking.id ? originalBooking : b,
    );
    ctx.patchState({ carBookings, loading: false, error: null });
    this.notification.showSuccess('Transfer cancelled successfully');
    this.refresh(ctx);
  }

  @Action(CarBookingActions.CancelTransferFailure)
  cancelTransferFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.CancelTransferFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to cancel transfer');
  }

  // ─── Bulk Payment Status ─────────────────────────────────────────────────────

  @Action(CarBookingActions.BulkUpdatePaymentStatus)
  bulkUpdatePaymentStatus(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.BulkUpdatePaymentStatus,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.bulkUpdatePaymentStatus(action.dto).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.BulkUpdatePaymentStatusSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.BulkUpdatePaymentStatusFailure(
            error.message || 'Failed to update payment status',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.BulkUpdatePaymentStatusSuccess)
  bulkUpdatePaymentStatusSuccess(ctx: StateContext<CarBookingStateModel>) {
    ctx.patchState({ loading: false, error: null });
    this.notification.showSuccess('Payment status updated successfully');
    this.refresh(ctx);
  }

  @Action(CarBookingActions.BulkUpdatePaymentStatusFailure)
  bulkUpdatePaymentStatusFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.BulkUpdatePaymentStatusFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to update payment status');
  }

  // ─── Transfer ────────────────────────────────────────────────────────────────

  @Action(CarBookingActions.TransferCarBooking)
  transferCarBooking(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.TransferCarBooking,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.transferToPartner(action.bookingId, action.dto).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.TransferCarBookingSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.TransferCarBookingFailure(
            error.message || 'Failed to transfer car booking',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.TransferCarBookingSuccess)
  transferCarBookingSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.TransferCarBookingSuccess,
  ) {
    const state = ctx.getState();
    const carBookings = state.carBookings.map((b) =>
      b.id === action.response.originalBooking.id ? action.response.originalBooking : b,
    );
    ctx.patchState({
      carBookings,
      selectedCarBooking:
        state.selectedCarBooking?.id === action.response.originalBooking.id
          ? action.response.originalBooking
          : state.selectedCarBooking,
      loading: false,
      error: null,
    });
    this.notification.showSuccess('Car booking transferred successfully');
  }

  @Action(CarBookingActions.TransferCarBookingFailure)
  transferCarBookingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.TransferCarBookingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError(action.error || 'Failed to transfer car booking');
  }

  // ─── Update Transfer Pricing ─────────────────────────────────────────────────

  @Action(CarBookingActions.UpdateTransferPricing)
  updateTransferPricing(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateTransferPricing,
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.carBookingService.updateTransferPricing(action.originalBookingId, action.dto).pipe(
      tap((response) => {
        ctx.dispatch(new CarBookingActions.UpdateTransferPricingSuccess(response));
      }),
      catchError((error) => {
        ctx.dispatch(
          new CarBookingActions.UpdateTransferPricingFailure(
            error.message || 'Failed to update transfer pricing',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(CarBookingActions.UpdateTransferPricingSuccess)
  updateTransferPricingSuccess(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateTransferPricingSuccess,
  ) {
    const state = ctx.getState();
    const carBookings = state.carBookings.map((b) => {
      if (b.id === action.response.originalBooking.id) return action.response.originalBooking;
      if (b.id === action.response.transferBooking.id) return action.response.transferBooking;
      return b;
    });
    ctx.patchState({
      carBookings,
      selectedCarBooking:
        state.selectedCarBooking?.id === action.response.originalBooking.id
          ? action.response.originalBooking
          : state.selectedCarBooking,
      loading: false,
      error: null,
    });
    this.notification.showSuccess('Transfer pricing updated successfully');
  }

  @Action(CarBookingActions.UpdateTransferPricingFailure)
  updateTransferPricingFailure(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.UpdateTransferPricingFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError(action.error || 'Failed to update transfer pricing');
  }

  // ─── Select / Clear ──────────────────────────────────────────────────────────

  @Action(CarBookingActions.SelectCarBooking)
  selectCarBooking(
    ctx: StateContext<CarBookingStateModel>,
    action: CarBookingActions.SelectCarBooking,
  ) {
    ctx.patchState({ selectedCarBooking: action.carBooking });
  }

  @Action(CarBookingActions.ClearError)
  clearError(ctx: StateContext<CarBookingStateModel>) {
    ctx.patchState({ error: null });
  }
}
